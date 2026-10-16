import { test, expect } from '@playwright/test';
async function load(page) {
    await page.setViewportSize({ width: 320, height: 480 });
    await page.clock.install({ time: new Date('2026-10-16T12:00:00+08:00') });
    await page.addInitScript(() => {
        localStorage.setItem('low_perf_manual', 'false');
        window.drawStats = { paints: 0, glyphs: 0, blits: 0, raf: 0, gl: 0 };
        const raf = window.requestAnimationFrame;
        window.requestAnimationFrame = cb => raf(t => { window.drawStats.raf++; cb(t); });
        for (const name of ['fillRect', 'clearRect', 'fillText', 'drawImage']) {
            const original = CanvasRenderingContext2D.prototype[name];
            CanvasRenderingContext2D.prototype[name] = function (...args) {
                if (name === 'fillText') window.drawStats.glyphs++;
                else if (this.canvas.isConnected) window.drawStats[name === 'drawImage' ? 'blits' : 'paints']++;
                return original.apply(this, args);
            };
        }
        for (const Type of [window.WebGLRenderingContext, window.WebGL2RenderingContext].filter(Boolean)) {
            const original = Type.prototype.drawArrays;
            Type.prototype.drawArrays = function (...args) { window.drawStats.gl++; return original.apply(this, args); };
        }
    });
    await page.goto('/tests/fixtures/energy-c.html?energyPreview=c');
    await page.waitForFunction(() => window.energyC);
    await page.getByRole('button', { name: '均衡 B', exact: true }).click();
}
async function sample(page, milliseconds) {
    const before = await page.evaluate(() => ({ ...window.drawStats }));
    await page.clock.runFor(milliseconds);
    return page.evaluate(before => Object.fromEntries(Object.entries(window.drawStats).map(([k, v]) => [k, v - before[k]])), before);
}
test('matrix pauses drawing, caches glyphs, moves on schedule, and releases delayed wakeups', async ({ page }, info) => {
    await load(page);
    const baseline = await sample(page, 2600);
    await page.getByLabel('优化方案').selectOption('draw');
    await page.clock.runFor(100);
    const still = await sample(page, 700);
    expect(still.paints).toBe(0); expect(still.raf).toBe(0);
    await page.clock.runFor(250);
    const moving = await sample(page, 1200);
    expect(moving.paints).toBeGreaterThan(20);expect(moving.paints).toBeLessThan(42);
    expect(moving.glyphs).toBe(0); expect(moving.blits).toBeGreaterThan(0);
    await page.clock.runFor(350);
    const nextPause = await sample(page, 700);expect(nextPause.paints).toBe(0);
    await page.getByLabel('对比背景').selectOption('none');
    expect((await sample(page, 3000)).paints).toBe(0);
    expect((await sample(page, 1000)).raf).toBe(0);
    await info.attach('matrix-comparison.json', { body: JSON.stringify({ baseline, still, moving, nextPause }), contentType: 'application/json' });
});
test('oracle sands settles without phantom pointer and wakes on touch/click, then settles again', async ({ page }) => {
    await load(page);await page.getByLabel('优化方案').selectOption('draw');
    await page.getByLabel('对比背景').selectOption('bg_oraclesands');
    await page.clock.runFor(4500);
    expect((await sample(page, 1000)).paints).toBe(0);
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerdown', { clientX: 180, clientY: 150 })));
    expect((await sample(page, 500)).paints).toBeGreaterThan(0);
    await page.clock.runFor(4500);
    expect((await sample(page, 1000)).raf).toBe(0);
    await page.setViewportSize({ width: 480, height: 320 });
    await page.waitForFunction(() => document.querySelector("canvas")?.width === 480);
    await page.evaluate(() => window.dispatchEvent(new Event("resize")));
    expect((await sample(page, 200)).paints).toBeGreaterThan(0);
    await page.getByLabel('对比背景').selectOption('none');
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerdown', { clientX: 50, clientY: 50 })));
    expect((await sample(page, 300)).paints).toBe(0);
});
test('composition and freeze switches isolate effects without freezing business UI or changing card color', async ({ page }) => {
    await load(page);
    const card = page.getByTestId('glass');
    const color = await card.evaluate(e => getComputedStyle(e).backgroundColor);
    expect(await card.evaluate(e => getComputedStyle(e).backdropFilter || getComputedStyle(e).webkitBackdropFilter)).not.toBe('none');
    await page.getByLabel('优化方案').selectOption('composite');
    await expect(card).toHaveCSS('backdrop-filter', 'none');
    await expect(card).toHaveCSS('background-color', color);
    await page.getByLabel('定格背景与天气（业务计时继续）').check();
    await page.evaluate(() => window.energyC.setMutes({ 孩子: Date.now() + 3000 }));
    const frozen = await sample(page, 4000);expect(frozen.paints).toBe(0);expect(frozen.raf).toBe(0);
    await expect(page.getByText('禁言中🤫', { exact: true })).toHaveCount(0);
    await expect(page.locator('.weather-decoration > div').first()).toHaveCSS('animation-play-state', 'paused');
    await expect(page.getByTestId('feedback')).toHaveCSS('animation-play-state', 'running');
    await page.getByLabel('定格背景与天气（业务计时继续）').uncheck();
    expect((await sample(page, 1300)).paints).toBeGreaterThan(0);
    await page.getByLabel('优化方案').selectOption('baseline');
    expect(await card.evaluate(e => getComputedStyle(e).backdropFilter || getComputedStyle(e).webkitBackdropFilter)).not.toBe('none');
});
test('idle mode stops decoration after 20s and resumes on interaction; switching restores baseline', async ({ page }) => {
    test.setTimeout(90000);
    await load(page);await page.getByLabel('对比背景').selectOption('bg_galaxy');
    await page.getByLabel('优化方案').selectOption('idle');
    await page.clock.runFor(20100);
    expect((await sample(page, 1000)).raf).toBe(0);
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' })));
    expect((await sample(page, 300)).paints).toBeGreaterThan(0);
    await page.clock.runFor(20100);
    await page.getByLabel('优化方案').selectOption('baseline');
    expect((await sample(page, 300)).paints).toBeGreaterThan(0);
    await page.clock.fastForward(21000);
    expect((await sample(page, 300)).paints).toBeGreaterThan(0);
});
test('optimized galaxy/fireworks reduce painting and weather styles stay stable across parent renders', async ({ page }) => {
    await load(page);
    for (const background of ['bg_galaxy', 'bg_firework']) {
        await page.getByLabel('优化方案').selectOption('baseline');
        await page.getByLabel('对比背景').selectOption(background);
        const baseline = await sample(page, 1000);
        await page.getByLabel('优化方案').selectOption('draw');
        const reduced = await sample(page, 1000);
        expect(reduced.paints).toBeGreaterThan(20);expect(reduced.paints).toBeLessThan(baseline.paints * 0.65);
        expect(reduced.raf).toBeLessThan(baseline.raf * 0.65);
    }
    const styles = await page.locator('.weather-decoration > div').evaluateAll(es => es.map(e => e.getAttribute('style')));
    await page.evaluate(() => window.energyC.rerender());
    expect(await page.locator('.weather-decoration > div').evaluateAll(es => es.map(e => e.getAttribute('style')))).toEqual(styles);
});
test('optimized WebGL reduces native callbacks, keeps rendering and cancels waits on removal', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'WebKit software runner does not provide WebGL');
    test.setTimeout(90000);
    await load(page); await page.setViewportSize({ width: 320, height: 240 });
    for (const background of ['bg_aurora', 'bg_prismatic', 'bg_timewarp', 'bg_hyperspeed']) {
        await page.getByLabel('优化方案').selectOption('baseline');
        await page.getByLabel('对比背景').selectOption(background);
        const baseline = await sample(page, 1000);
        await page.getByLabel('优化方案').selectOption('draw');
        const reduced = await sample(page, 1000);
        expect(reduced.gl).toBeGreaterThanOrEqual(28);expect(reduced.gl).toBeLessThanOrEqual(32);
        expect(reduced.raf).toBeLessThan(baseline.raf * 0.65);
        await page.getByLabel('对比背景').selectOption('none');
        const stopped = await sample(page, 300);expect(stopped.gl).toBe(0);expect(stopped.raf).toBe(0);
    }
});
test('CSS pseudo effects freeze and restore without changing particle count', async ({ page }) => {
    await load(page);
    await page.getByLabel('对比背景').selectOption('bg_firefly');
    await page.getByLabel('优化方案').selectOption('draw');
    await expect(page.locator('.firefly')).toHaveCount(34);
    const state = () => page.locator('.firefly').first().evaluate(e => getComputedStyle(e, '::after').animationPlayState);
    await page.getByLabel('定格背景与天气（业务计时继续）').check();
    expect(await state()).toBe('paused');
    await page.getByLabel('定格背景与天气（业务计时继续）').uncheck();
    expect(await state()).not.toContain('paused');
    await expect(page.locator('.firefly')).toHaveCount(34);
});
test('real App C preview stays session-only, resets on reload and does not activate on normal route', async ({ page }) => {
    await page.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
    await page.addInitScript(() => {
        localStorage.setItem('low_perf_manual', 'false');
        localStorage.setItem('app_profiles_v1', JSON.stringify([{ id: 'c1', name: '孩子', theme: 'rose' }]));
        localStorage.setItem('app_tasks_v2', JSON.stringify({ 孩子: [] }));
        localStorage.setItem('app_equipped_gear_v1', JSON.stringify({ 孩子: { background: 'bg_galaxy' } }));
        localStorage.setItem('app_evil_auto_trigger', 'false');
        localStorage.setItem('app_notified_levels', JSON.stringify({ 孩子: 1 }));
    });
    await page.goto('/?energyPreview=c');
    await page.getByRole('button', { name: '均衡 B', exact: true }).click();
    await page.getByLabel('对比背景').selectOption('none');
    await page.getByLabel('优化方案').selectOption('composite');
    await expect(page.locator('body')).toHaveAttribute('data-energy-composite', 'true');
    await page.getByLabel('定格背景与天气（业务计时继续）').check();
    await expect(page.locator('body')).toHaveAttribute('data-decoration-paused', 'true');
    expect(await page.evaluate(() => JSON.parse(window.storage.getItem('app_equipped_gear_v1')).孩子.background)).toBe('bg_galaxy');
    expect(await page.evaluate(() => localStorage.getItem('device_graphics_quality_v1'))).toBeNull();
    await page.reload();
    await expect(page.getByLabel('优化方案')).toHaveValue('baseline');
    await expect(page.getByLabel('对比背景')).toHaveValue('current');
    await expect(page.getByLabel('定格背景与天气（业务计时继续）')).not.toBeChecked();
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('complementary', { name: '能效预览对比' })).toHaveCount(0);
    expect(await page.evaluate(() => document.body.dataset.energyComposite)).toBeUndefined();
    await expect(page.locator('.atmosphere-layer')).not.toHaveAttribute('data-optimized', 'true');
});
