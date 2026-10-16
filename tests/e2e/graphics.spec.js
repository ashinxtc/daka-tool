import { test, expect } from '@playwright/test';
async function load(page, preview = true) {
    await page.clock.install();
    await page.addInitScript(() => {
        Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 2 });
        window.glDraws = 0; window.textDraws = 0;
        for (const Type of [window.WebGLRenderingContext, window.WebGL2RenderingContext].filter(Boolean)) {
            const draw = Type.prototype.drawArrays;
            Type.prototype.drawArrays = function (...args) { window.glDraws++; return draw.apply(this, args); };
        }
        const fill = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function (...args) { window.textDraws++; return fill.apply(this, args); };
    });
    await page.goto('/tests/fixtures/graphics.html' + (preview ? '?energyPreview=1' : ''));
    await page.waitForFunction(() => window.graphics);
}
async function mode(page, value) {
    await page.evaluate(value => window.graphics.setPerfMode(value), value);
    await expect(page.getByTestId('quality')).toHaveText({ disabled: 'original', balanced: 'balanced', enabled: 'lightweight' }[value]);
}
async function background(page, value) {
    await page.getByLabel('对比背景').selectOption(value);
    await expect(page.locator('.atmosphere-layer')).toHaveAttribute('data-background', value);
}
async function draws(page) {
    const before = await page.evaluate(() => window.glDraws);
    await page.clock.runFor(1000);
    return (await page.evaluate(() => window.glDraws)) - before;
}
test('preview toggles are session-only; normal choices persist and survive detector updates', async ({ page }) => {
    await load(page, false);
    const mobile = await page.evaluate(() => /iPhone|iPad|iPod|Android/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    await expect(page.getByTestId('quality')).toHaveText(mobile ? 'balanced' : 'original');
    await mode(page, 'disabled');
    await page.reload(); await page.waitForFunction(() => window.graphics);
    await expect(page.getByTestId('quality')).toHaveText('original');
    await page.goto('/tests/fixtures/graphics.html?energyPreview=1'); await page.waitForFunction(() => window.graphics);
    await page.getByRole('button', { name: '均衡 B', exact: true }).click();
    await expect(page.getByTestId('quality')).toHaveText('balanced');
    await page.evaluate(() => { window.__lowPerfAuto = true; window.dispatchEvent(new Event('performance-detected')); });
    await expect(page.getByTestId('quality')).toHaveText('balanced');
    expect(await page.evaluate(() => document.body.classList.contains('low-perf-mode'))).toBe(false);
    expect(await page.evaluate(() => localStorage.getItem('device_graphics_quality_v1'))).toBe('disabled');
    await page.reload(); await page.waitForFunction(() => window.graphics);
    await expect(page.getByTestId('quality')).toHaveText('original');
    await page.goto('/tests/fixtures/graphics.html'); await page.waitForFunction(() => window.graphics);
    await mode(page, 'balanced'); await page.reload(); await page.waitForFunction(() => window.graphics);
    await expect(page.getByTestId('quality')).toHaveText('balanced');
    await expect(page.getByRole('complementary', { name: '能效预览对比' })).toHaveCount(0);
});
test('balanced CSS particles and matrix drawing decrease, and switching back restores them', async ({ page }) => {
    await load(page);
    await background(page, 'bg_firefly'); await mode(page, 'disabled');
    await expect(page.locator('.firefly')).toHaveCount(50);
    await mode(page, 'balanced'); await expect(page.locator('.firefly')).toHaveCount(34);
    await mode(page, 'enabled'); await expect(page.locator('.firefly')).toHaveCount(16);
    await mode(page, 'disabled'); await expect(page.locator('.firefly')).toHaveCount(50);
    await background(page, 'bg_matrix');
    const a = await page.evaluate(() => window.textDraws); await page.clock.runFor(160);
    const full = (await page.evaluate(() => window.textDraws)) - a;
    await mode(page, 'balanced');
    const b = await page.evaluate(() => window.textDraws); await page.clock.runFor(160);
    const balanced = (await page.evaluate(() => window.textDraws)) - b;
    expect(full).toBeGreaterThan(0); expect(balanced).toBeLessThan(full * 0.8);
    await page.getByLabel('对比背景').selectOption('none');
    await expect(page.locator('.atmosphere-layer')).toHaveCount(0);
    const stopped = await page.evaluate(() => window.textDraws); await page.clock.runFor(160);
    expect(await page.evaluate(() => window.textDraws)).toBe(stopped);
});
test('all four WebGL backgrounds reduce raster and draw rate, restore original, and suspend hidden', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'WebKit runner has no software WebGL; other tests cover WebKit.');
    test.setTimeout(90000);
    await page.setViewportSize({ width: 320, height: 240 });
    await load(page);
    for (const type of ['bg_aurora', 'bg_prismatic', 'bg_timewarp', 'bg_hyperspeed']) {
        await background(page, type); await mode(page, 'disabled');
        const width = await page.locator('canvas').evaluate(c => c.width);
        const full = await draws(page);
        await mode(page, 'balanced');
        expect(await page.locator('canvas').evaluate(c => c.width)).toBe(Math.round(width / 2));
        const reduced = await draws(page);
        expect(reduced).toBeGreaterThanOrEqual(28); expect(reduced).toBeLessThanOrEqual(32);
        expect(reduced).toBeLessThan(full * 0.65);
        await page.evaluate(() => {
            Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
            document.dispatchEvent(new Event('visibilitychange'));
        });
        expect(await draws(page)).toBe(0);
        await page.evaluate(() => {
            Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
            document.dispatchEvent(new Event('visibilitychange'));
        });
        expect(await draws(page)).toBeGreaterThanOrEqual(28);
        await mode(page, 'disabled');
        expect(await page.locator('canvas').evaluate(c => c.width)).toBe(width);
        expect(await draws(page)).toBeGreaterThan(reduced * 1.5);
    }
    await page.getByLabel('对比背景').selectOption('none');
    await expect(page.locator('canvas')).toHaveCount(0); expect(await draws(page)).toBe(0);
});
test('real App preview opens safely, switches background without changing equipment, and collapses', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await page.addInitScript(() => {
        localStorage.setItem('low_perf_manual', 'false');
        localStorage.setItem('app_profiles_v1', JSON.stringify([{ id: 'c1', name: '孩子', theme: 'rose' }]));
        localStorage.setItem('app_tasks_v2', JSON.stringify({ 孩子: [] }));
        localStorage.setItem('app_equipped_gear_v1', JSON.stringify({ 孩子: { background: 'bg_galaxy' } }));
        localStorage.setItem('app_evil_auto_trigger', 'false');
        localStorage.setItem('app_notified_levels', JSON.stringify({ 孩子: 1 }));
    });
    await page.goto('/?energyPreview=1');
    const panel = page.getByRole('complementary', { name: '能效预览对比' });
    await expect(panel).toBeVisible();
    await page.getByRole('button', { name: '均衡 B', exact: true }).click();
    await background(page, 'bg_firefly');
    await expect(page.locator('.firefly')).toHaveCount(34);
    expect(await page.evaluate(() => JSON.parse(window.storage.getItem('app_equipped_gear_v1')).孩子.background)).toBe('bg_galaxy');
    await page.getByRole('button', { name: /收起对比面板/ }).click();
    await expect(page.getByLabel('对比背景')).toHaveCount(0);
    await page.getByRole('button', { name: /打开对比面板/ }).click();
    await page.getByRole('button', { name: '原画质 A', exact: true }).click();
    await expect(page.locator('.firefly')).toHaveCount(50);
    expect(await page.evaluate(() => localStorage.getItem('device_graphics_quality_v1'))).toBeNull();
    await page.screenshot({ path: testInfo.outputPath('preview.png') });
    await page.goto('/');
    await page.locator('header').getByTitle('设置', { exact: true }).filter({ visible: true }).click();
    await page.getByRole('button', { name: '💾 数据', exact: true }).click();
    await page.getByRole('button', { name: /均衡画质 保留动态背景/ }).click();
    expect(await page.evaluate(() => localStorage.getItem('device_graphics_quality_v1'))).toBe('balanced');
    expect(await page.evaluate(() => 'device_graphics_quality_v1' in window.storage.getAllSyncData())).toBe(false);
    await page.reload();
    await expect(page.locator('.atmosphere-layer')).toHaveAttribute('data-quality', 'balanced');
    await expect(page.getByRole('complementary', { name: '能效预览对比' })).toHaveCount(0);
});
