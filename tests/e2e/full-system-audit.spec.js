import { test, expect } from '@playwright/test';

test.describe('Full System Comprehensive Verification', () => {

    test('1. Onboarding Screen & Creation of New Family', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: '进化之路 · 打卡计划' })).toBeVisible();
        await expect(page.getByRole('button', { name: /创建新家庭/ })).toBeVisible();
        await page.getByRole('button', { name: /创建新家庭/ }).click();

        // Fill child name and submit
        const nameInput = page.getByPlaceholder(/例如: Henry、大宝、小明/);
        await expect(nameInput).toBeVisible();
        await nameInput.fill('小明');
        await page.getByRole('button', { name: /创建成员并开启打卡之旅/ }).click();

        await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
    });

    test('2. Child App & Parent Escort Desk mount, sync & gamification flow', async ({ browser }) => {
        const context = await browser.newContext();
        const childPage = await context.newPage();
        const parentPage = await context.newPage();

        const familyCode = 'audit-family-' + Date.now();

        // Seed initial child profile
        await childPage.addInitScript((code) => {
            localStorage.setItem('app_profiles_v1', JSON.stringify([{ id: 'c1', name: '孩子', theme: 'rose' }]));
            localStorage.setItem('app_tasks_v2', JSON.stringify({ '孩子': [{ id: 't1', name: '阅读', reward: 1, frequencyType: 'daily_must' }] }));
            localStorage.setItem('app_sync_code', JSON.stringify(code));
        }, familyCode);

        // Navigate to Child App
        await childPage.goto('/');
        await expect(childPage.locator('main')).toBeVisible({ timeout: 15000 });

        // Gamification rules verification inside real browser context
        const gamificationCheck = await childPage.evaluate(async () => {
            const { getActiveTimeRewardTier, generateTimeRewardCards } = await import('/src/utils/gamification.js');
            
            // Single mode legacy config
            const legacyConfig = { timeRewardDeadline: '09:00' };
            const activeTierLegacy = getActiveTimeRewardTier(legacyConfig, null, new Date('2026-10-24T08:30:00'));
            const activeTierLate = getActiveTimeRewardTier(legacyConfig, null, new Date('2026-10-24T09:30:00'));

            // Tiered mode config
            const tieredConfig = {
                timeRewardMode: 'tiered',
                timeRewardTiers: [
                    { id: 'slot1', name: '上午时段', deadline: '13:00', maxMultiplier: 5, icon: '🌅' },
                    { id: 'slot2', name: '晚上时段', deadline: '22:00', maxMultiplier: 2, icon: '🌙' }
                ]
            };
            const slot1Tier = getActiveTimeRewardTier(tieredConfig, null, new Date('2026-10-24T11:00:00'));
            const slot2Tier = getActiveTimeRewardTier(tieredConfig, null, new Date('2026-10-24T15:00:00'));
            const lateTier = getActiveTimeRewardTier(tieredConfig, null, new Date('2026-10-24T23:00:00'));

            // Card generation
            const cards = generateTimeRewardCards(5);

            return {
                legacyPass: activeTierLegacy !== null && activeTierLate === null,
                tieredPass: slot1Tier?.id === 'slot1' && slot2Tier?.id === 'slot2' && lateTier === null,
                cardsCount: cards.length,
                hasCards: cards.every(c => c.multiplier >= 1)
            };
        });

        expect(gamificationCheck.legacyPass).toBe(true);
        expect(gamificationCheck.tieredPass).toBe(true);
        expect(gamificationCheck.cardsCount).toBe(3);
        expect(gamificationCheck.hasCards).toBe(true);

        // Navigate to Parent Escort Desk (first unbound visit check)
        await parentPage.goto('/parent.html');
        await expect(parentPage.getByRole('heading', { name: '时空市集 · 家长护航台' })).toBeVisible({ timeout: 15000 });
        await expect(parentPage.getByRole('button', { name: /手动输入密码/ })).toBeVisible();

        // Direct code entry navigation to Parent Dashboard
        await parentPage.goto(`/parent.html?code=${encodeURIComponent(familyCode)}`);
        await expect(parentPage.locator('header')).toBeVisible({ timeout: 15000 });
        await expect(parentPage.getByRole('button', { name: /护航手机/ })).toBeVisible();

        const parentState = await parentPage.evaluate(() => {
            return {
                savedCode: localStorage.getItem('parent_sync_code'),
                deviceId: localStorage.getItem('parent_device_id')
            };
        });
        expect(parentState.savedCode).toBe(familyCode);

        // Test Live Production sync CORS preflight fallback
        const corsResilienceCheck = await childPage.evaluate(async () => {
            const { deviceAccess } = await import('/src/utils/deviceAccess.js');
            try {
                const res = await deviceAccess.syncFetch('https://sync.daka-tool.top?code=audit-cors-check', { cache: 'no-store' }, 'parent');
                return { ok: true, status: res.status };
            } catch (e) {
                return { ok: false, error: e.message };
            }
        });
        expect(corsResilienceCheck.ok).toBe(true);

        await context.close();
    });

    test('3. Verification sub-pages load and render cleanly', async ({ browser }) => {
        const pages = ['exchange-verify.html', 'redemption-verify.html', 'exemption-verify.html', 'security.html'];
        for (const pageName of pages) {
            const page = await browser.newPage();
            await page.goto(`/${pageName}`);
            await expect(page.locator('body')).toBeVisible();
            await page.close();
        }
    });

});
