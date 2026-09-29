// 等级系统辅助工具（数据由外部 levels.js 提供）
export const getLevelInfo = (xp) => {
    const list = (typeof LEVELS !== 'undefined') ? LEVELS : (typeof window !== 'undefined' && window.LEVELS ? window.LEVELS : []);
    for (let i = list.length - 1; i >= 0; i--) {
        if (xp >= list[i].xp) return list[i];
    }
    return list[0] || { level: 1, xp: 0, name: '萌芽之识', era: '远古之路', desc: '' };
};

export const getNextLevelInfo = (level) => {
    const list = (typeof LEVELS !== 'undefined') ? LEVELS : (typeof window !== 'undefined' && window.LEVELS ? window.LEVELS : []);
    return list.find(l => l.level === level + 1) || null;
};

// 辅助函数：根据纪元分组
export const getLevelsByEra = () => {
    const list = (typeof LEVELS !== 'undefined') ? LEVELS : (typeof window !== 'undefined' && window.LEVELS ? window.LEVELS : []);
    const grouped = {};
    list.forEach(level => {
        if (!grouped[level.era]) {
            grouped[level.era] = [];
        }
        grouped[level.era].push(level);
    });
    return grouped;
};
