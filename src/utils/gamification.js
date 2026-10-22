// src/utils/gamification.js
// 游戏化激励与护航系统工具函数：星级通关计算、逆风翻盘、首胜盲盒算法

import { getLocalDateKey, dateKeySubtractDays, tsToLocalDateKey } from './date.js';

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
    earlyBirdExtraGold: 2,

    // 4. 当日连击激励机制 (Combo Rush)
    comboEnabled: true,          // 是否开启连击加成
    comboStep: 1,                // 递增步长：完成第2项额外+1，第3项+2以此类推
    comboCap: 10,                // 单项连击最高加成上限封顶
    comboSoundEnabled: true,     // 连击升调音效

    // 5. 打卡时间抽卡奖励 (Time-based Card Draw Reward)
    timeRewardEnabled: true,     // 是否开启时间达标抽卡
    timeRewardDeadline: '09:00'  // 默认截止时间点（在此时间点及之前完成打卡可参与抽卡）
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

/**
 * 提取孩子历史上通过逆风翻盘成功赎回（达成 1 星）所获得的安全保护日列表
 * 这些保护日不仅赎回了当时的罚金，更作为“安全缓冲断点”阻断未做任务的连续未打卡累加，且次日免受追罚！
 * @param {Object} escrow 该孩子的 escrow 契约记录
 * @returns {Array<string>} 享受安全断点保护的日期数组 (YYYY-MM-DD)
 */
export const getComebackSafeDates = (escrow) => {
    if (!escrow) return [];
    const dates = new Set();
    const records = escrow.records && typeof escrow.records === 'object'
        ? Object.values(escrow.records)
        : (escrow.status ? [escrow] : (typeof escrow === 'object' ? Object.values(escrow) : []));

    for (const r of records) {
        if (!r || typeof r !== 'object') continue;
        if (Array.isArray(r.redeemedDates)) {
            r.redeemedDates.forEach(d => { if (typeof d === 'string' && d) dates.add(d); });
        }
        if (r.status === 'redeemed') {
            if (r.redeemedDate) dates.add(r.redeemedDate);
            if (r.createdDate) dates.add(r.createdDate);
            if (r.redeemedAt) {
                try {
                    dates.add(tsToLocalDateKey(r.redeemedAt));
                } catch (e) {}
            }
        }
    }
    return Array.from(dates);
};

/**
 * 计算当日连击额外加成元宝数
 * 规则：第1项常规奖励 (+0)，第2项+1，第3项+2，第4项+3...（乘以step，受cap封顶）
 * @param {number} comboCount 当前是今日第几项打卡完成
 * @param {Object} config 游戏化配置
 * @returns {number} 额外加成元宝数
 */
export const calculateComboBonus = (comboCount = 1, config = DEFAULT_GAMIFICATION_CONFIG) => {
    if (config?.comboEnabled === false) return 0;
    if (comboCount <= 1) return 0;
    const step = Math.max(1, parseInt(config?.comboStep, 10) || 1);
    const cap = Math.max(1, parseInt(config?.comboCap, 10) || 10);
    const bonus = (comboCount - 1) * step;
    return Math.min(cap, Math.max(0, bonus));
};

/**
 * 获取连击称号与段位视觉配置
 * @param {number} comboCount 连击数
 * @param {number} totalTasks 今日总任务数
 * @returns {Object} 包含称号、图标与渐变色方案
 */
export const getComboInfo = (comboCount = 0, totalTasks = 1) => {
    // 连击段位、纯文字流光与全列能量光柱主题 (白 -> 黄 -> 炽金 -> 极光至尊)
    if (comboCount <= 0) {
        return {
            title: '蓄力中',
            icon: '⚡',
            tier: 'none',
            badgeBg: '',
            textColor: 'text-slate-300',
            textShadow: '0 0 6px rgba(255,255,255,0.4)',
            auraType: 'none',
            columnBg: '',
            cellAuraCls: '',
            bottomAuraCls: ''
        };
    }
    if (comboCount >= totalTasks && totalTasks > 0) {
        return {
            title: '大满贯全勤',
            icon: '👑',
            tier: 'perfect',
            badgeBg: '',
            textColor: 'text-amber-200',
            textShadow: '0 0 14px rgba(251,191,36,1), 0 0 22px rgba(245,158,11,0.85)',
            auraType: 'gold',
            columnBg: 'combo-halo-header-gold bg-gradient-to-b from-amber-400/20 via-yellow-400/10 to-amber-500/20',
            cellAuraCls: 'combo-halo-cell-gold bg-amber-400/10',
            bottomAuraCls: 'combo-halo-bottom-gold bg-amber-400/10'
        };
    }
    if (comboCount >= 5) {
        return {
            title: '超神连击',
            icon: '💥',
            tier: 'god',
            badgeBg: '',
            textColor: 'text-yellow-300',
            textShadow: '0 0 12px rgba(234,179,8,1), 0 0 18px rgba(249,115,22,0.8)',
            auraType: 'gold',
            columnBg: 'combo-halo-header-gold bg-gradient-to-b from-amber-400/20 via-yellow-400/10 to-orange-500/20',
            cellAuraCls: 'combo-halo-cell-gold bg-amber-400/10',
            bottomAuraCls: 'combo-halo-bottom-gold bg-amber-400/10'
        };
    }
    if (comboCount >= 3) {
        return {
            title: '势不可挡',
            icon: '⚡',
            tier: 'epic',
            badgeBg: '',
            textColor: 'text-amber-300',
            textShadow: '0 0 10px rgba(252,211,77,0.9), 0 0 15px rgba(245,158,11,0.6)',
            auraType: 'yellow',
            columnBg: 'combo-halo-header-yellow bg-amber-400/15',
            cellAuraCls: 'combo-halo-cell-yellow bg-amber-400/10',
            bottomAuraCls: 'combo-halo-bottom-yellow bg-amber-400/10'
        };
    }
    if (comboCount >= 2) {
        return {
            title: '渐入佳境',
            icon: '🔥',
            tier: 'rare',
            badgeBg: '',
            textColor: 'text-yellow-200',
            textShadow: '0 0 8px rgba(254,240,138,0.85), 0 0 12px rgba(251,191,36,0.5)',
            auraType: 'yellow',
            columnBg: 'combo-halo-header-yellow bg-amber-300/15',
            cellAuraCls: 'combo-halo-cell-yellow bg-amber-300/10',
            bottomAuraCls: 'combo-halo-bottom-yellow bg-amber-300/10'
        };
    }
    return {
        title: '旗开得胜',
        icon: '✨',
        tier: 'start',
        badgeBg: '',
        textColor: 'text-white',
        textShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 14px rgba(224,242,254,0.7)',
        auraType: 'white',
        columnBg: 'combo-halo-header-white bg-white/10',
        cellAuraCls: 'combo-halo-cell-white bg-white/10',
        bottomAuraCls: 'combo-halo-bottom-white bg-white/10'
    };
};

/**
 * 纯 Web Audio API 合成连击升调音效（零外部音频文件，极轻量顺滑）
 * 连击越高，音调越激昂升调
 * @param {number} comboCount 连击数
 */
export const playComboSound = (comboCount = 1) => {
    try {
        if (typeof window === 'undefined') return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        // 升调阶梯：C5 (523), D5 (587), E5 (659), F5 (698), G5 (784), A5 (880), C6 (1046)
        const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 1046.50];
        const pitch = notes[Math.min(notes.length - 1, Math.max(0, comboCount - 1))];
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(pitch, now);
        osc.frequency.exponentialRampToValueAtTime(pitch * 1.28, now + 0.12);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.start(now);
        osc.stop(now + 0.28);
    } catch (e) {
        // 音频上下文受限时不影响正常逻辑
    }
};



// ==================== 5. 打卡时间抽卡奖励 (Time-based Card Draw Reward) ====================

export const TIME_REWARD_CARD_TYPES = [
    {
        multiplier: 1,
        name: '再接再厉',
        icon: '🌱',
        title: '稳扎稳打',
        desc: '保持原额收益，明天继续神速！',
        gradient: 'from-emerald-500/20 via-teal-500/30 to-emerald-600/40',
        border: 'border-emerald-400/50',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
        glow: 'shadow-[0_0_25px_rgba(16,185,129,0.35)]',
        color: '#10b981',
        weight: 30
    },
    {
        multiplier: 2,
        name: '2倍暴击',
        icon: '⚡',
        title: '电光石火',
        desc: '金元宝翻倍，双倍快乐！',
        gradient: 'from-blue-500/20 via-indigo-500/30 to-blue-600/40',
        border: 'border-blue-400/50',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
        glow: 'shadow-[0_0_25px_rgba(59,130,246,0.4)]',
        color: '#3b82f6',
        weight: 40
    },
    {
        multiplier: 3,
        name: '3倍大奖',
        icon: '🔥',
        title: '烈焰狂欢',
        desc: '金元宝 x3，财源滚滚来！',
        gradient: 'from-amber-500/20 via-orange-500/30 to-amber-600/40',
        border: 'border-amber-400/60',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
        glow: 'shadow-[0_0_30px_rgba(245,158,11,0.5)]',
        color: '#f59e0b',
        weight: 22
    },
    {
        multiplier: 5,
        name: '5倍锦鲤',
        icon: '👑',
        title: '锦鲤至尊',
        desc: '终极 5倍暴击，全场欢呼！',
        gradient: 'from-fuchsia-500/20 via-purple-500/30 to-pink-600/40',
        border: 'border-fuchsia-400/60',
        badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40',
        glow: 'shadow-[0_0_35px_rgba(217,70,239,0.6)]',
        color: '#d946ef',
        weight: 8
    }
];

/**
 * 检查当前时间是否在指定时间点之前（包含等于）
 * 仅限当天实时打卡（不可对历史补打卡触发准时抽卡）
 * @param {string} deadline - 'HH:mm' 格式，如 '09:00'
 * @param {string} [dateKey] - 可选的打卡日期，如果传入且不是今天则不满足
 * @param {Date} [currentTime] - 用于测试的可选当前时间
 * @returns {boolean}
 */
export const isBeforeTimeDeadline = (deadline = '09:00', dateKey = null, currentTime = new Date()) => {
    if (!deadline) return false;

    // 如果传入了 dateKey，必须是今天
    if (dateKey) {
        const todayStr = getLocalDateKey(0, currentTime);
        if (dateKey !== todayStr) return false;
    }

    const [deadlineHour, deadlineMinute] = deadline.split(':').map(Number);
    if (isNaN(deadlineHour) || isNaN(deadlineMinute)) return false;

    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    const currentMinutes = currentHour * 60 + currentMinute;
    const deadlineMinutes = deadlineHour * 60 + deadlineMinute;

    return currentMinutes <= deadlineMinutes;
};

/**
 * 随机生成 3 张神速抽卡卡牌（保证有悬念与暴击可能，打乱位置）
 * @returns {Array} 3 张卡牌对象数组
 */
export const generateTimeRewardCards = () => {
    const sampleOne = (excludeMultipliers = []) => {
        const pool = TIME_REWARD_CARD_TYPES.filter(c => !excludeMultipliers.includes(c.multiplier));
        const totalWeight = pool.reduce((sum, c) => sum + c.weight, 0);
        let rnd = Math.random() * totalWeight;
        for (const card of pool) {
            rnd -= card.weight;
            if (rnd <= 0) return card;
        }
        return pool[pool.length - 1];
    };

    const chosen = [];
    // 保证至少有 1 张暴击卡 (2x/3x/5x)
    chosen.push(sampleOne([1]));
    // 其余 2 张从全池抽取
    chosen.push(sampleOne([]));
    chosen.push(sampleOne([]));

    // Fisher-Yates 洗牌
    for (let i = chosen.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chosen[i], chosen[j]] = [chosen[j], chosen[i]];
    }

    return chosen.map((c, index) => ({
        id: `card_${index}_${Math.random().toString(36).substring(2, 7)}`,
        index,
        ...c
    }));
};

/**
 * 纯 Web Audio API 合成翻牌音效（极轻量顺滑）
 */
export const playCardFlipSound = () => {
    try {
        if (typeof window === 'undefined') return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.1);
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
    } catch (e) {}
};

/**
 * 纯 Web Audio API 合成抽中大奖短号欢庆音效
 * @param {number} multiplier 倍数
 */
export const playCardFanfareSound = (multiplier = 2) => {
    try {
        if (typeof window === 'undefined') return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        
        const notes = multiplier >= 5 
            ? [523.25, 659.25, 783.99, 1046.50, 1318.51] 
            : multiplier >= 3 
                ? [523.25, 659.25, 783.99, 1046.50]
                : [523.25, 659.25, 783.99];

        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = multiplier >= 5 ? 'triangle' : 'sine';
            const noteStart = now + idx * 0.08;
            osc.frequency.setValueAtTime(freq, noteStart);
            gain.gain.setValueAtTime(0.14, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25);
            
            osc.start(noteStart);
            osc.stop(noteStart + 0.25);
        });
    } catch (e) {}
};
