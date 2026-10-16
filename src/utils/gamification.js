// src/utils/gamification.js
// 游戏化激励与护航系统工具函数：星级通关计算、逆风翻盘、首胜盲盒算法

import { getLocalDateKey, dateKeySubtractDays } from './date.js';

export const DEFAULT_GAMIFICATION_CONFIG = {
    // 1. 星级通关制
    starRatingEnabled: true,
    star1ThresholdType: 'count', // 'count' (按必做任务数) | 'percent' (按百分比)
    star1Value: 1,               // 默认完成 1 项必做即达成 1 星保底（免罚光环）
    star2Percent: 60,            // 必做完成率 60% 达成 2 星
    star3Percent: 100,           // 必做完成率 100% 达成 3 星
    star3ExtraWheel: true,       // 3星完美达成送额外黄金大转盘

    // 2. 逆风翻盘 / 戴罪立功
    redemptionEnabled: true,
    redemptionGraceDays: 1,      // 宽限天数（1天）
    redemptionTarget: 'star_1',   // 达成 1 星即可赎回
    redemptionReturnRate: 100,   // 100% 全额返还
    defaultFrozenGold: 20,       // 触发惩罚时默认冻结金额

    // 3. 首胜破冰盲盒
    firstBloodEnabled: true,
    firstBloodGoldMin: 2,
    firstBloodGoldMax: 5,
    earlyBirdBonus: true,        // 上午 11:00 前完成首胜额外赠送
    earlyBirdExtraGold: 2
};

// 辅助日期增加天数
export const dateKeyAddDays = (dateStr, days) => {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * 计算指定孩子在指定日期的星级通关情况
 * @param {Array} childTasks 任务列表
 * @param {Object} childCheckins 该孩子的打卡记录集合
 * @param {string} dateKey 日期 key (YYYY-MM-DD)
 * @param {Object} config 配置参数
 * @returns {Object} 星级结算信息
 */
export const calculateDailyStars = (childTasks = [], childCheckins = {}, dateKey, config = DEFAULT_GAMIFICATION_CONFIG) => {
    const effectiveConfig = { ...DEFAULT_GAMIFICATION_CONFIG, ...(config || {}) };
    
    // 过滤出在 dateKey 当天生效的每日必做任务
    const mustTasks = childTasks
        .filter(t => t.frequencyType === 'daily_must')
        .filter(t => !t.startDate || dateKey >= t.startDate)
        .filter(t => !t.earlyCompleted);

    // 兼容没有设置每日必做、只有普通任务的场景
    let targetTasks = mustTasks;
    let isFallbackToAll = false;
    if (mustTasks.length === 0) {
        targetTasks = childTasks
            .filter(t => !t.startDate || dateKey >= t.startDate)
            .filter(t => !t.earlyCompleted);
        isFallbackToAll = true;
    }

    const totalCount = targetTasks.length;
    if (totalCount === 0) {
        return {
            star: 3,
            isSafe: true,
            completedCount: 0,
            totalCount: 0,
            rate: 100,
            nextStarRemaining: 0,
            note: '今日无必做任务，安全通关'
        };
    }

    // 检查完成项数
    const isTaskCompleted = (taskId) => {
        const val = childCheckins[taskId]?.[dateKey];
        if (val === undefined || val === null || val === false || val === '') return false;
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === 'number') return val > 0;
        return true;
    };

    const completedTasks = targetTasks.filter(t => isTaskCompleted(t.id));
    const completedCount = completedTasks.length;
    const rate = Math.round((completedCount / totalCount) * 100);

    if (completedCount === 0) {
        return {
            star: 0,
            isSafe: false,
            completedCount: 0,
            totalCount,
            rate: 0,
            nextStarRemaining: effectiveConfig.star1ThresholdType === 'count' ? (effectiveConfig.star1Value || 1) : 1,
            note: '尚未起步，完成 1 项必做即可达成 1 星起航'
        };
    }

    // 判断是否达成 1 星保底
    let hasReachedStar1 = false;
    if (effectiveConfig.star1ThresholdType === 'count') {
        hasReachedStar1 = completedCount >= Math.max(1, effectiveConfig.star1Value || 1);
    } else {
        hasReachedStar1 = rate >= Math.max(10, effectiveConfig.star1Value || 30);
    }

    if (!hasReachedStar1) {
        return {
            star: 0,
            isSafe: false,
            completedCount,
            totalCount,
            rate,
            nextStarRemaining: Math.max(1, (effectiveConfig.star1Value || 1) - completedCount),
            note: '加油！还差一步即可达成 1 星起航'
        };
    }

    // 已达到 1 星保底，继续向上判断 2 星与 3 星
    const star2Threshold = Math.max(20, Math.min(99, effectiveConfig.star2Percent || 60));
    const star3Threshold = Math.max(star2Threshold, Math.min(100, effectiveConfig.star3Percent || 100));

    let star = 1;
    let nextStarRemaining = 0;
    let note = '⭐ 1 星起航保底达成！';

    if (rate >= star3Threshold) {
        star = 3;
        note = '⭐⭐⭐ 完美全通关！荣耀时刻！';
    } else if (rate >= star2Threshold) {
        star = 2;
        const tasksForStar3 = Math.ceil((star3Threshold / 100) * totalCount);
        nextStarRemaining = Math.max(1, tasksForStar3 - completedCount);
        note = `⭐⭐ 良好达标！再完成 ${nextStarRemaining} 项达成 3 星大满贯`;
    } else {
        star = 1;
        const tasksForStar2 = Math.ceil((star2Threshold / 100) * totalCount);
        nextStarRemaining = Math.max(1, tasksForStar2 - completedCount);
        note = `⭐ 1 星起航达标！再完成 ${nextStarRemaining} 项升级 2 星`;
    }

    return {
        star,
        isSafe: star >= 1,
        completedCount,
        totalCount,
        rate,
        nextStarRemaining,
        note
    };
};

/**
 * 随机生成首胜破冰盲盒奖励
 * @param {Object} config 配置参数
 * @param {boolean} isEarlyBird 是否属于早起鸟时间段（如上午11点前）
 * @returns {Object} 盲盒奖励明细
 */
export const calculateFirstBloodReward = (config = DEFAULT_GAMIFICATION_CONFIG, isEarlyBird = false) => {
    const cfg = { ...DEFAULT_GAMIFICATION_CONFIG, ...(config || {}) };
    const min = Math.max(1, parseInt(cfg.firstBloodGoldMin, 10) || 2);
    const max = Math.max(min, parseInt(cfg.firstBloodGoldMax, 10) || 5);
    
    // 基础金币随机
    const baseGold = Math.floor(Math.random() * (max - min + 1)) + min;
    const earlyBonus = (isEarlyBird && cfg.earlyBirdBonus) ? (parseInt(cfg.earlyBirdExtraGold, 10) || 2) : 0;
    const totalGold = baseGold + earlyBonus;

    return {
        type: 'gold',
        totalGold,
        baseGold,
        earlyBonus,
        isEarlyBird: earlyBonus > 0,
        title: '破冰首胜宝箱',
        msg: earlyBonus > 0 
            ? `获得 ${baseGold} 金元宝 + 早起鸟加成 ${earlyBonus} 元宝 = ${totalGold} 元宝！`
            : `获得 ${totalGold} 金元宝！`
    };
};
