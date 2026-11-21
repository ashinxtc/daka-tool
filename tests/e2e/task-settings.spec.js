import { expect, test } from '@playwright/test';

const child = '测试孩子';
const today = '2026-11-16';
const readingTask = {
    id: 'book', name: '旧版伴读', targetCount: 12, reward: 2,
    readingConfig: { isReading: true, bookTitle: '旧书', mode: 'pages', totalPages: 120, currentProgress: 36, notes: ['已有笔记'] },
};

async function openApp(page, { date = today, extra = {} } = {}) {
    await page.route('**/*', route => {
        const url = new URL(route.request().url());
        return url.hostname === '127.0.0.1' && !url.pathname.startsWith('/api/') ? route.continue() : route.abort();
    });
    await page.clock.setFixedTime(new Date(`${date}T12:00:00+08:00`));
    await page.addInitScript(({ child, readingTask, date, extra }) => {
        if (localStorage.getItem('_task_settings_test_seed')) return;
        localStorage.setItem('_task_settings_test_seed', '1');
        localStorage.setItem('low_perf_manual', 'true');
        const stored = {
            app_profiles_v1: [{ id: 'child1', name: child, theme: 'rose' }],
            app_tasks_v2: { [child]: [readingTask] },
            app_checkins_v2: { [child]: { book: { [date]: 15 } } },
            app_global_dates: { start: '2026-11-01', end: '2027-02-01' },
            app_evil_auto_trigger: false,
            app_gamification_config_v1: { firstBloodEnabled: false },
            app_notified_levels: { [child]: 100 },
            app_achievements_v1: { [child]: { first_blood: Date.now(), daily_done: Date.now(), curious: Date.now() } },
            ...extra,
        };
        for (const [key, value] of Object.entries(stored)) localStorage.setItem(key, JSON.stringify(value));
    }, { child, readingTask, date, extra });
    await page.goto('/');
    await openSettings(page);
}

async function openSettings(page) {
    await page.getByRole('button', { name: '添加 / 调整任务与目标' }).click();
    await expect(page.getByRole('heading', { name: '任务管理' })).toBeVisible();
}

function tasksInStorage(page) {
    return page.evaluate(child => JSON.parse(window.storage.getItem('app_tasks_v2'))[child], child);
}

test('weekly task saves once with advanced options and zero reward, then edits without changing its ID', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await openApp(page);
    await page.getByRole('button', { name: '新增任务' }).click();
    const form = page.getByRole('form', { name: '新增任务' });
    await form.getByLabel('任务名称').fill('数学口算');
    await form.getByLabel('打卡方式').selectOption('weekly_optional');
    await expect(form.getByLabel('目标总次数')).toHaveCount(0);
    await form.getByLabel('每周目标次数').fill('4');
    await form.getByLabel('每次奖励（金元宝）').fill('0');
    await form.getByText('奖励与其他设置', { exact: true }).click();
    await expect(form.getByLabel('设为核心任务')).toHaveCount(0);
    await form.getByLabel('超额每次加奖比例（%）').fill('15');
    await expect(form.getByText('每周打卡 4 次 · 无基础奖励')).toBeVisible();
    expect((await tasksInStorage(page)).map(task => task.id)).toEqual(['book']);
    await form.getByRole('button', { name: '保存任务' }).click();
    await expect(page.getByRole('status')).toHaveText('任务已创建');
    await expect(form).toHaveCount(0);
    await expect.poll(async () => (await tasksInStorage(page)).filter(task => task.name === '数学口算')).toHaveLength(1);
    const saved = (await tasksInStorage(page)).find(task => task.name === '数学口算');
    expect(saved).toMatchObject({ frequencyType: 'weekly_optional', weeklyTargetCount: 4, reward: 0, weeklyExtraPercentPerExtra: 15 });
    expect(saved).not.toHaveProperty('type');

    await page.getByRole('button', { name: /数学口算/ }).click();
    const editor = page.getByRole('form', { name: '编辑任务' });
    await expect(editor.getByLabel('每次奖励（金元宝）')).toHaveValue('0');
    await editor.getByLabel('任务名称').fill('口算练习');
    await editor.getByRole('button', { name: '保存修改' }).click();
    await expect(page.getByRole('status')).toHaveText('修改已保存');
    await expect.poll(async () => (await tasksInStorage(page)).find(task => task.id === saved.id)?.name).toBe('口算练习');
    await page.evaluate(() => window.storage.flush());
    await page.reload();
    await openSettings(page);
    await expect(page.getByRole('button', { name: /口算练习.*无基础奖励/ })).toBeVisible();
    expect(errors).toEqual([]);
});

test('legacy reading edits keep progress and check-ins; abandoning a draft makes no change', async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: /旧版伴读/ }).click();
    const form = page.getByRole('form', { name: '编辑任务' });
    await expect(form.getByLabel('打卡方式')).toHaveValue('reading');
    await form.getByLabel('全书总页数').fill('150');
    await form.getByRole('button', { name: '取消' }).click();
    expect((await tasksInStorage(page))[0].readingConfig).toMatchObject(readingTask.readingConfig);

    await page.getByRole('button', { name: /旧版伴读/ }).click();
    await form.getByLabel('全书总页数').fill('150');
    await page.evaluate(async child => {
        const { commitDurable } = await import('/src/utils/storage.js');
        const tasks = JSON.parse(window.storage.getItem('app_tasks_v2'));
        tasks[child][0].readingConfig.currentProgress = 43;
        commitDurable({ app_tasks_v2: JSON.stringify(tasks) });
    }, child);
    await form.getByRole('button', { name: '保存修改' }).click();
    await expect.poll(async () => (await tasksInStorage(page))[0].readingConfig.totalPages).toBe(150);
    const unchanged = (await tasksInStorage(page))[0];
    expect(unchanged).toMatchObject({ id: 'book', readingConfig: { currentProgress: 43, notes: ['已有笔记'] } });
    expect(unchanged.frequencyType).toBeUndefined();
    const records = await page.evaluate(child => JSON.parse(window.storage.getItem('app_checkins_v2'))[child], child);
    expect(records.book[today]).toBe(15);
});

test('old weekend rules stay inactive on a qualifying Sunday and both legacy task categories share one list', async ({ page }) => {
    const date = '2026-11-22';
    const oldSettings = { enabled: true, coreThreshold: 80, dailyThreshold: 50, lastSettledWeekend: {}, guardianPassCount: 2 };
    const previousReward = `${child}-WEEKEND-2026-11-15-1794744000000`;
    const oldTasks = [
        { id: 'piano', name: '钢琴练习', type: 'daily', frequencyType: 'weekly_optional', weeklyTargetCount: 2, reward: 2 },
        { id: 'math', name: '数学练习', type: 'core', frequencyType: 'daily_must', reward: 3 },
    ];
    await openApp(page, { date, extra: {
        app_tasks_v2: { [child]: oldTasks },
        app_checkins_v2: { [child]: { piano: { [date]: 1 }, math: { [date]: 1 } } },
        app_weekend_settings: oldSettings,
        app_wheel_history: { [previousReward]: 5 },
    } });
    const list = page.getByRole('list', { name: '进行中的任务' });
    await expect(list.getByRole('button')).toHaveCount(2);
    await expect(list.getByRole('button').first()).toContainText('钢琴练习');
    await expect(page.getByText(/周末冲刺|完美周末达成|周末结算/)).toHaveCount(0);
    await expect(page.locator('[title="核心任务"], [title="日常任务"]')).toHaveCount(0);
    await expect(list).not.toContainText(/核心任务|日常任务/);
    await page.getByLabel('按打卡方式筛选').selectOption('daily_must');
    await expect(list.getByRole('button')).toHaveCount(1);
    await list.getByRole('button', { name: /数学练习/ }).click();
    const editor = page.getByRole('form', { name: '编辑任务' });
    await editor.getByLabel('任务名称').fill('每日口算');
    await editor.getByRole('button', { name: '保存修改' }).click();
    await expect.poll(async () => (await tasksInStorage(page)).find(task => task.id === 'math')).toMatchObject({
        name: '每日口算', type: 'core', frequencyType: 'daily_must',
    });
    await page.locator('[data-tab-id="parent"]').click();
    await expect(page.getByRole('heading', { name: '全局修行打卡纪元周期' })).toBeVisible();
    await expect(page.getByText('周末冲刺规则设定')).toHaveCount(0);
    await expect(page.getByRole('button', { name: '模拟结算' })).toHaveCount(0);
    const stored = await page.evaluate(() => ({
        settings: JSON.parse(window.storage.getItem('app_weekend_settings')),
        rewards: Object.entries(JSON.parse(window.storage.getItem('app_wheel_history'))).filter(([key]) => key.includes('-WEEKEND-')),
    }));
    expect(stored.settings).toEqual(oldSettings);
    expect(stored.rewards).toEqual([[previousReward, 5]]);
});
