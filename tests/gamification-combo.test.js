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
