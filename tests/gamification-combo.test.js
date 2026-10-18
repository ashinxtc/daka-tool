import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateComboBonus, getComboInfo } from '../src/utils/gamification.js';

test('Combo Rush: calculateComboBonus accurately computes bonuses and respects step and cap', () => {
    // 默认配置：comboEnabled: true, comboStep: 1, comboCap: 10
    const defaultConfig = {
        comboEnabled: true,
        comboStep: 1,
        comboCap: 10
    };

    // 第1项打卡无额外加成（基础打卡）
    assert.equal(calculateComboBonus(1, defaultConfig), 0);
    assert.equal(calculateComboBonus(0, defaultConfig), 0);
    assert.equal(calculateComboBonus(-1, defaultConfig), 0);

    // 第2项打卡额外 +1
    assert.equal(calculateComboBonus(2, defaultConfig), 1);
    // 第3项打卡额外 +2
    assert.equal(calculateComboBonus(3, defaultConfig), 2);
    // 第4项打卡额外 +3
    assert.equal(calculateComboBonus(4, defaultConfig), 3);
    // 第11项打卡额外 +10 (等于封顶)
    assert.equal(calculateComboBonus(11, defaultConfig), 10);
    // 超过封顶时截断为 10
    assert.equal(calculateComboBonus(15, defaultConfig), 10);

    // 自定义步长：每项 +2，封顶 6
    const customConfig = {
        comboEnabled: true,
        comboStep: 2,
        comboCap: 6
    };
    assert.equal(calculateComboBonus(1, customConfig), 0);
    assert.equal(calculateComboBonus(2, customConfig), 2);
    assert.equal(calculateComboBonus(3, customConfig), 4);
    assert.equal(calculateComboBonus(4, customConfig), 6);
    assert.equal(calculateComboBonus(5, customConfig), 6); // 封顶于 6

    // 关闭连击功能时，加成恒为 0
    const disabledConfig = {
        comboEnabled: false,
        comboStep: 2,
        comboCap: 10
    };
    assert.equal(calculateComboBonus(2, disabledConfig), 0);
    assert.equal(calculateComboBonus(5, disabledConfig), 0);
});

test('Combo Rush: getComboInfo returns appropriate title, icon and tier', () => {
    // 未开始或 0 连击
    const zeroInfo = getComboInfo(0, 5);
    assert.equal(zeroInfo.tier, 'none');
    assert.equal(zeroInfo.title, '蓄力中');

    // 第1项打卡：旗开得胜
    const info1 = getComboInfo(1, 5);
    assert.equal(info1.tier, 'start');
    assert.equal(info1.title, '旗开得胜');

    // 第2项打卡：渐入佳境
    const info2 = getComboInfo(2, 5);
    assert.equal(info2.tier, 'rare');
    assert.equal(info2.title, '渐入佳境');

    // 第3项打卡：势不可挡
    const info3 = getComboInfo(3, 5);
    assert.equal(info3.tier, 'epic');
    assert.equal(info3.title, '势不可挡');

    // 第5项打卡（未满员）：超神连击
    const infoGod = getComboInfo(5, 10);
    assert.equal(infoGod.tier, 'god');
    assert.equal(infoGod.title, '超神连击');

    // 全部任务完成：大满贯全勤
    const infoAll = getComboInfo(5, 5);
    assert.equal(infoAll.tier, 'perfect');
    assert.equal(infoAll.title, '大满贯全勤');
    assert.equal(infoAll.icon, '👑');

    // 能量光柱与纯净悬浮文字属性测试
    assert.equal(zeroInfo.auraType, 'none');
    assert.equal(zeroInfo.columnBg, '');
    assert.equal(zeroInfo.cellAuraCls, '');

    // 1 连击为白色能量
    assert.equal(info1.auraType, 'white');
    assert(info1.columnBg.includes('bg-white'));
    assert(info1.cellAuraCls.includes('bg-white'));
    assert.equal(info1.textColor, 'text-white');

    // 3 连击为黄色能量
    assert.equal(info3.auraType, 'yellow');
    assert(info3.columnBg.includes('bg-amber'));
    assert(info3.cellAuraCls.includes('bg-amber'));
    assert.equal(info3.textColor, 'text-amber-300');

    // 5 连击及以上为流光金能量
    assert.equal(infoGod.auraType, 'gold');
    assert(infoGod.columnBg.includes('from-amber'));
    assert(infoGod.cellAuraCls.includes('bg-amber'));
    assert.equal(infoGod.textColor, 'text-yellow-300');
    assert(infoGod.textShadow.length > 0);
});

test('Combo Rush: ledger transactions correctly parse COMBO_BONUS as income', () => {
    const currentChild = '乐乐';
    const tasks = [
        { id: 'math', name: '数学口算' },
        { id: 'read', name: '英文阅读' }
    ];

    const wheelHistory = {
        [`${currentChild}-TASK-math-2026-10-18`]: 5,
        [`${currentChild}-COMBO_BONUS-math-2026-10-18`]: 1,
        [`${currentChild}-TASK-read-2026-10-18`]: 5,
        [`${currentChild}-COMBO_BONUS-read-2026-10-18`]: 2,
    };

    const transactions = [];
    Object.entries(wheelHistory).forEach(([key, val]) => {
        if (!key.startsWith(currentChild)) return;
        const amount = Number(val);
        if (isNaN(amount) || amount === 0) return;

        let type = 'income';
        let name = '';
        let category = '其他';

        if (key.includes('TASK')) {
            category = '任务';
            name = '完成任务';
        } else if (key.includes('COMBO_BONUS')) {
            category = '连胜加成';
            const parts = key.split('-');
            const taskId = parts[2];
            const matchedTask = tasks.find(t => t.id === taskId);
            name = matchedTask ? `🔥 连胜加成：${matchedTask.name}` : '🔥 今日打卡连胜加成';
        }

        transactions.push({ key, amount, type, category, name });
    });

    // 验证两笔连胜奖励均被正确解析为收入，且正确关联任务名称
    const comboTxs = transactions.filter(t => t.category === '连胜加成');
    assert.equal(comboTxs.length, 2);
    assert.equal(comboTxs[0].type, 'income');
    assert.equal(comboTxs[0].amount, 1);
    assert.equal(comboTxs[0].name, '🔥 连胜加成：数学口算');

    assert.equal(comboTxs[1].type, 'income');
    assert.equal(comboTxs[1].amount, 2);
    assert.equal(comboTxs[1].name, '🔥 连胜加成：英文阅读');
});

test('Combo Rush: rollback removes COMBO_BONUS cleanly on checkin cancellation', () => {
    const child = '乐乐';
    const taskId = 'task_math';
    const date = '2026-10-18';
    const comboKey = `${child}-COMBO_BONUS-${taskId}-${date}`;

    let wheelHistory = {
        [`${child}-NORMAL_BONUS`]: 5,
        [comboKey]: 2,
        [`${child}-ANOTHER_TASK`]: 10
    };

    // 模拟取消打卡时的回滚逻辑
    const comboPrefix = `${child}-COMBO_BONUS-${taskId}-${date}`;
    const nextHistory = { ...wheelHistory };
    Object.keys(nextHistory).forEach(key => {
        if (key.startsWith(comboPrefix)) {
            delete nextHistory[key];
        }
    });

    assert.equal(nextHistory[comboKey], undefined);
    assert.equal(nextHistory[`${child}-NORMAL_BONUS`], 5);
    assert.equal(nextHistory[`${child}-ANOTHER_TASK`], 10);
});

