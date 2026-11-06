import { test, expect } from '@playwright/test';

for (const client of ['child', 'parent']) {
    test(`${client}: legacy sync sleeps when hidden and checks the timestamp on return`, async ({ page }) => {
        const code = 'visibility-sample';
        let ts = Date.parse('2026-11-06T11:59:00+08:00');
        let taskName = '原来的任务';
        let uploaded = {};
        const reads = [];
        const snapshot = () => ({
            app_profiles_v1: JSON.stringify([{ id: 'c1', name: '孩子', theme: 'rose' }]),
            app_tasks_v2: JSON.stringify({ 孩子: [{ id: 't1', name: taskName, updatedAt: ts, frequencyType: 'daily_must', reward: 1 }] }),
            app_checkins_v2: '{}',
            app_evil_auto_trigger: 'false',
            app_notified_levels: '{"孩子":1}',
            app_authorized_parents_v1: JSON.stringify({ devices: [{ deviceId: 'parent-test', role: '爸爸' }] }),
            ...uploaded,
            _syncTs: ts,
        });
        await page.route('**/*', route => {
            const request = route.request();
            const url = new URL(request.url());
            if (url.hostname === '127.0.0.1') return route.continue();
            if (url.hostname !== 'sync.daka-tool.top' || url.searchParams.get('code') !== code) return route.abort();
            if (request.method() === 'POST') {
                uploaded = request.postDataJSON();
                ts = uploaded._syncTs;
                return route.fulfill({ json: { ok: true, ts } });
            }
            if (request.method() !== 'GET') return route.abort();
            reads.push(url.pathname);
            return route.fulfill({ json: url.pathname === '/ts' ? { ts } : snapshot() });
        });
        await page.clock.install({ time: new Date('2026-11-06T12:00:00+08:00') });
        await page.addInitScript(({ code, seed }) => {
            for (const [key, value] of Object.entries(seed)) localStorage.setItem(key, value);
            localStorage.setItem('app_sync_code', JSON.stringify(code));
            localStorage.setItem('device_graphics_quality_v1', 'economy');
            localStorage.setItem('parent_sync_code', code);
            localStorage.setItem('parent_device_id', 'parent-test');
            localStorage.setItem('parent_is_bound', 'true');
        }, { code, seed: Object.fromEntries(Object.entries(snapshot()).filter(([key]) => key.startsWith('app_'))) });
        await page.goto(client === 'child' ? '/' : '/parent.html');
        await expect(page.locator('main')).toBeVisible();
        await page.clock.runFor(2000);
        await expect.poll(() => reads.includes('/')).toBe(true);
        if (client === 'child') {
            await expect.poll(() => page.evaluate(() => window.storage.getItem('_sync_has_pulled_v1'))).toBe('1');
            // Let the initial merge's queued upload finish before measuring background polling.
            for (let i = 0; i < 4; i++) {
                await page.clock.runFor(1000);
                await page.waitForTimeout(100);
            }
            await expect.poll(() => page.evaluate(() => Number(window.storage.getItem('_sync_local_ts')))).toBe(ts);
        }

        const visibility = state => page.evaluate(state => {
            Object.defineProperty(document, 'visibilityState', { configurable: true, value: state });
            document.dispatchEvent(new Event('visibilitychange'));
        }, state);
        await visibility('hidden');
        reads.length = 0;
        await page.clock.fastForward(45000);
        expect(reads).toEqual([]);
        await visibility('visible');
        await page.clock.runFor(100);
        await expect.poll(() => reads.slice()).toEqual(['/ts']);

        reads.length = 0;
        await page.clock.fastForward(181000);
        await expect.poll(() => reads.slice()).toEqual(['/ts']);
        await page.clock.runFor(200);
        reads.length = 0;
        await page.clock.fastForward(16000);
        expect(reads).toEqual([]);
        await page.evaluate(event => window.dispatchEvent(new Event(event)), client === 'child' ? 'scroll' : 'touchstart');
        await page.clock.runFor(100);
        await expect.poll(() => reads.slice()).toEqual(['/ts']);

        await visibility('hidden');
        reads.length = 0;
        ts += 1000;
        taskName = '同步后的任务';
        delete uploaded.app_tasks_v2;
        await page.clock.fastForward(45000);
        expect(reads).toEqual([]);
        await visibility('visible');
        await page.clock.runFor(100);
        await expect.poll(() => reads.slice()).toEqual(['/ts', '/']);
        if (client === 'child') {
            await expect.poll(() => page.evaluate(() => JSON.parse(window.storage.getItem('app_tasks_v2')).孩子[0].name)).toBe(taskName);
        } else {
            await expect(page.getByText(taskName, { exact: true }).first()).toBeVisible();
        }
    });
}
