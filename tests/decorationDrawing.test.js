import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matrixPhase, createGlyphCache } from '../src/utils/decorationDrawing.js';
test('matrix pause and movement retain their 1s/1.5s wall-time phases', () => {
    assert.deepEqual(matrixPhase(0), { cycle: 0, moving: false, progress: 0, wait: 1000 });
    assert.equal(matrixPhase(999).moving, false);
    assert.equal(matrixPhase(1000).progress, 0);
    assert.equal(matrixPhase(1750).progress, 0.5);
    assert.deepEqual(matrixPhase(2500), { cycle: 1, moving: false, progress: 0, wait: 1000 });
});
test('glyph raster is reused and memory is bounded and releasable', () => {
    let raster = 0, blits = 0, fallback = 0;
    const cache = createGlyphCache({ createElement: () => ({ getContext: () => ({ fillText() { raster++; } }) }) }, 2);
    const context = { drawImage() { blits++; }, fillText() { fallback++; } };
    for (let i = 0; i < 100; i++) cache.draw(context, '甲', '24px serif', '#ffd700', i, 10);
    assert.equal(raster, 1); assert.equal(blits, 100);
    cache.draw(context, '乙', '24px serif', '#ffd700', 0, 0);
    cache.draw(context, '丙', '24px serif', '#ffd700', 0, 0);
    assert.equal(raster, 2); assert.equal(fallback, 1);
    cache.draw(context, '甲', '24px serif', '#ffd700', 0, 0);
    assert.equal(raster, 2); assert.equal(blits, 102);
    assert.equal(cache.size, 2);cache.clear();assert.equal(cache.size, 0);
});
