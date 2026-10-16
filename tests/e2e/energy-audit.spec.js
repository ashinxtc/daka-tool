import { test, expect } from '@playwright/test';
test('idle real App audit: no background leaves no decoration RAF in either quality', async ({ page }, testInfo) => {
    await page.clock.install({ time: new Date('2026-10-16T12:00:00+08:00') });
    await page.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
    await page.addInitScript(() => {
        const counts = window.energyAudit = { raf: 0, commits: 0, appRenders: 0, requests: 0 };
        let appOutput;
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
            supportsFiber: true, renderers: new Map(), inject(renderer) { this.renderers.set(1, renderer); return 1; }, onCommitFiberUnmount() {},
            onCommitFiberRoot(id, root) {
                counts.commits++;
                const walk = f => {
                    if (!f) return;
                    if (f.type?.name === 'App' && f.child?.memoizedProps !== appOutput) {
                        counts.appRenders++; appOutput = f.child?.memoizedProps;
                    }
                    walk(f.child); walk(f.sibling);
                }; walk(root.current);
            }
        };
        const raf = window.requestAnimationFrame;
        window.requestAnimationFrame = cb => raf(t => { counts.raf++; cb(t); });
        const fetch = window.fetch;
        window.fetch = (...args) => { counts.requests++; return fetch(...args); };
        localStorage.setItem('low_perf_manual', 'false');
        const data = {
            app_profiles_v1: [{ id: 'c1', name: '孩子', theme: 'rose' }],
            app_tasks_v2: { 孩子: [{ id: 'math', name: '数学', frequencyType: 'daily_must', reward: 1 }] },
            app_equipped_gear_v1: { 孩子: { background: 'bg_matrix' } },
            app_evil_auto_trigger: false, app_notified_levels: { 孩子: 1 },
            app_gamification_config_v1: { firstBloodEnabled: false }, app_weekend_settings: { enabled: false }
        };
        for (const [k, v] of Object.entries(data)) localStorage.setItem(k, JSON.stringify(v));
    });
    await page.goto('/?energyPreview=1');
    await page.waitForFunction(() => window.storage && document.querySelector('main'));
    await page.getByLabel('对比背景').selectOption('none');
    await page.clock.runFor(5000);
    const samples = [];
    for (const label of ['均衡 B', '轻量', '均衡 B', '轻量']) {
        await page.getByRole('button', { name: label, exact: true }).click();
        await page.clock.runFor(2000);
        await expect(page.locator('.atmosphere-layer')).toHaveCount(0);
        const start = await page.evaluate(() => ({ ...window.energyAudit }));
        await page.clock.runFor(10000);
        const result = await page.evaluate(() => {
            const visible = [...document.querySelectorAll('body *')].filter(e => e.getClientRects().length);
            return { ...window.energyAudit,
                infiniteAnimations: document.getAnimations().filter(a => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity && a.effect?.target?.getClientRects().length).map(a => a.animationName || 'WAAPI'),
                blurElements: visible.filter(e => { const s = getComputedStyle(e); return s.backdropFilter !== 'none' && s.backdropFilter !== undefined; }).length,
                canvas: document.querySelectorAll('.atmosphere-layer canvas').length };
        });
        for (const key of ['raf', 'commits', 'appRenders', 'requests']) result[key] -= start[key];
        samples.push({ label, seconds: 10, ...result });
        expect(result.raf).toBe(0);
        expect(result.appRenders).toBeLessThanOrEqual(2);
        expect(result.canvas).toBe(0);
    }
    await testInfo.attach('idle-audit.json', { body: JSON.stringify(samples, null, 2), contentType: 'application/json' });
    console.log('IDLE_AUDIT', JSON.stringify(samples));
});
