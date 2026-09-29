// ===== 多次打卡辅助函数 =====

export function getCheckinEntries(taskRecord, dateKey) {
    const val = (taskRecord || {})[dateKey];
    if (val === undefined || val === null) return [];
    if (typeof val === 'number') return [{ m: val, u: 0, t: 0 }];
    if (Array.isArray(val)) return val.filter(e => e && typeof e.m === 'number');
    return [];
}

export function getCheckinMinutes(taskRecord, dateKey) {
    return getCheckinEntries(taskRecord, dateKey).reduce((sum, e) => sum + (e.m || 0), 0);
}

export function getCheckinUnits(taskRecord, dateKey) {
    return getCheckinEntries(taskRecord, dateKey).reduce((sum, e) => sum + (e.u || 0), 0);
}

export function getCheckinSessionCount(taskRecord, dateKey) {
    const val = (taskRecord || {})[dateKey];
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return 1;
    if (Array.isArray(val)) return val.length;
    return 0;
}

export function getTaskTotalMinutes(taskRecord) {
    let total = 0;
    Object.values(taskRecord || {}).forEach(val => {
        if (typeof val === 'number') total += val;
        else if (Array.isArray(val)) val.forEach(e => { total += (e.m || 0); });
    });
    return total;
}

export function getTaskTotalSessions(taskRecord) {
    let total = 0;
    Object.values(taskRecord || {}).forEach(val => {
        if (typeof val === 'number') total += 1;
        else if (Array.isArray(val)) total += val.length;
    });
    return total;
}
