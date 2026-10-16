import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GRAPHICS_KEY, isMobileGraphicsDevice, readGraphicsMode, resolveGraphicsMode, backgroundDpr, createFrameGate } from '../src/utils/graphicsQuality.js';
test('mobile defaults include iPad desktop UA but not a narrow desktop browser', () => {
    assert.equal(isMobileGraphicsDevice({ userAgent: 'iPhone' }), true);
    assert.equal(isMobileGraphicsDevice({ userAgent: 'Macintosh', platform: 'MacIntel', maxTouchPoints: 5 }), true);
    assert.equal(isMobileGraphicsDevice({ userAgent: 'Android' }), true);
    assert.equal(isMobileGraphicsDevice({ userAgent: 'Macintosh', platform: 'MacIntel', maxTouchPoints: 0 }), false);
    assert.equal(resolveGraphicsMode('auto', true, false), 'balanced');
    assert.equal(resolveGraphicsMode('auto', false, false), 'original');
    assert.equal(resolveGraphicsMode('auto', true, true), 'lightweight');
    for (const mobile of [true, false]) for (const low of [true, false]) {
        assert.equal(resolveGraphicsMode('disabled', mobile, low), 'original');
        assert.equal(resolveGraphicsMode('balanced', mobile, low), 'balanced');
        assert.equal(resolveGraphicsMode('enabled', mobile, low), 'lightweight');
    }
});
test('legacy manual choices survive migration; invalid or unavailable storage is safe', () => {
    const read = data => readGraphicsMode({ getItem: key => data[key] ?? null });
    assert.equal(read({ low_perf_manual: 'true' }), 'enabled');
    assert.equal(read({ low_perf_manual: 'false' }), 'disabled');
    assert.equal(read({ [GRAPHICS_KEY]: 'balanced', low_perf_manual: 'true' }), 'balanced');
    assert.equal(read({ [GRAPHICS_KEY]: 'unknown' }), 'auto');
    assert.equal(readGraphicsMode({ getItem() { throw Error('blocked'); } }), 'auto');
});
test('background DPR reduces only background raster size and preserves lightweight limits', () => {
    assert.equal(backgroundDpr(3, false, false, 0.35), 2);
    assert.equal(backgroundDpr(3, false, true, 0.35), 1);
    assert.equal(backgroundDpr(1, false, true, 0.35), 1);
    assert.equal(backgroundDpr(2, true, true, 0.35), 0.35);
});
test('30fps gate is stable at 60/120Hz and after suspension without catch-up bursts', () => {
    for (const refresh of [60, 120]) {
        const gate = createFrameGate(30); let count = 0;
        for (let i = 0; i < refresh * 2; i++) if (gate(i * 1000 / refresh)) count++;
        assert.ok(count >= 59 && count <= 61, String(count));
        assert.equal(gate(100000), true);
        assert.equal(gate(100001), false);
    }
    const original = createFrameGate(0);
    for (let i = 0; i < 120; i++) assert.equal(original(i * 1000 / 120), true);
});
