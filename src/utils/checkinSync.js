/**
 * checkinSync.js: 打卡记录跨设备同步、删除墓碑与任务类型识别核心算法
 * 
 * 解决两大核心问题：
 * 1. 跨设备打卡删除同步（PC删除后iPad未删除或云端复活）：
 *    通过打卡删除墓碑（app_deleted_checkins_v1）追踪被删除项（精确到 taskId::date 或 taskId::date::sessionTs），
 *    防止云端历史打卡记录复活，并同步清除金币/经验/星星奖励流水；
 *    如果同一天后续重新打卡，自动清理对应墓碑，保证正常记录与同步。
 * 2. 习惯类/阅读类打卡从日历任务/连击中彻底隔离：
 *    日历打卡连击（Combo）、今日光晕、液体能量柱仅限日历打卡任务，
 *    习惯类与阅读类任务拥有独立完成逻辑，不计入日历连击与连击奖励。
 */

export const THIRTY_DAYS_MS = 30 * 86400000;

/**
 * 任务类型判断器
 */
export const isHabitTask = (t) => {
    if (!t) return false;
    return t.frequencyType === 'habit' || (!t.frequencyType && (!!t.isHabit || !!t.habitConfig?.isHabit));
};

export const isReadingTask = (t) => {
    if (!t) return false;
    if (isHabitTask(t)) return false;
    return t.frequencyType === 'reading' || (!t.frequencyType && !!t.readingConfig?.isReading);
};

export const isCalendarTask = (t) => {
    if (!t) return false;
    return !isHabitTask(t) && !isReadingTask(t);
};

/**
 * 打卡墓碑键生成与解析
 * 格式：`${taskId}::${date}` 或 `${taskId}::${date}::${sessionTs}`
 */
export const makeCheckinTombstoneKey = (taskId, date, sessionTimestamp = null) => {
    if (!taskId || !date) return '';
    return sessionTimestamp ? `${taskId}::${date}::${sessionTimestamp}` : `${taskId}::${date}`;
};

export const parseCheckinTombstoneKey = (key) => {
    if (!key || typeof key !== 'string') return { taskId: '', date: '', sessionTs: null };
    const parts = key.split('::');
    return {
        taskId: parts[0] || '',
        date: parts[1] || '',
        sessionTs: parts[2] || null
    };
};

/**
 * 判断奖励流水 key 是否属于已删除的打卡记录
 * 流水格式：`${child}-${PREFIX}-${taskId}-${date}[_${sessionTs}]`
 * 支持前缀：TASK, STAR_CHECKIN, COMBO_BONUS, BONUS_MULTI
 */
export const isHistoryKeyTombstoned = (k, tombstones, now = Date.now(), maxAgeMs = THIRTY_DAYS_MS) => {
    if (!tombstones || typeof tombstones !== 'object' || !k) return false;
    for (const [child, childTombstones] of Object.entries(tombstones)) {
        if (!childTombstones || !k.startsWith(`${child}-`)) continue;
        for (const [tombKey, ts] of Object.entries(childTombstones)) {
            if (!ts || (now - ts > maxAgeMs)) continue;
            const { taskId, date, sessionTs } = parseCheckinTombstoneKey(tombKey);
            if (!taskId || !date) continue;
            const prefixes = ['TASK', 'STAR_CHECKIN', 'COMBO_BONUS', 'BONUS_MULTI'];
            for (const p of prefixes) {
                const base = `${child}-${p}-${taskId}-${date}`;
                if (sessionTs) {
                    if (k === `${base}_${sessionTs}`) return true;
                } else {
                    if (k === base || k.startsWith(base + '_')) return true;
                }
            }
        }
    }
    return false;
};

/**
 * 深度合并两设备的打卡记录字典 { child: { taskId: { date: val } } }
 * 结合打卡删除墓碑与成员除名墓碑，确保删除的打卡不被复活，且驱动云端清除
 */
export function mergeCheckinsRecord(localObj, cloudObj, deletedCheckinTombstones = {}, deletedProfileTombstones = {}, now = Date.now()) {
    if (!localObj && !cloudObj) return null;
    const merged = {};
    const children = new Set([...Object.keys(localObj || {}), ...Object.keys(cloudObj || {})]);
    let localChanged = false, cloudChanged = false;

    children.forEach(child => {
        if (child === '测试员' || child === 'TESTER') {
            merged[child] = (localObj && localObj[child]) || {};
            return;
        }
        if (deletedProfileTombstones && deletedProfileTombstones[child]) {
            if (cloudObj && cloudObj[child] && Object.keys(cloudObj[child]).length > 0) cloudChanged = true;
            return;
        }

        const childCheckinTombstones = (deletedCheckinTombstones && deletedCheckinTombstones[child]) || {};
        const lChild = (localObj && localObj[child]) || {};
        const cChild = (cloudObj && cloudObj[child]) || {};
        merged[child] = {};
        const taskIds = new Set([...Object.keys(lChild), ...Object.keys(cChild)]);

        taskIds.forEach(tid => {
            const lTask = lChild[tid] || {};
            const cTask = cChild[tid] || {};
            merged[child][tid] = {};
            const dates = new Set([...Object.keys(lTask), ...Object.keys(cTask)]);

            dates.forEach(d => {
                const tombKey = makeCheckinTombstoneKey(tid, d);
                const dateDeletedAt = childCheckinTombstones[tombKey];
                const isDateDeleted = dateDeletedAt && (now - dateDeletedAt < THIRTY_DAYS_MS);

                if (isDateDeleted) {
                    if (cTask[d] !== undefined) cloudChanged = true;
                    if (lTask[d] !== undefined) localChanged = true;
                    return;
                }

                const lv = lTask[d];
                const cv = cTask[d];

                if (lv === undefined) {
                    if (cv !== undefined) {
                        merged[child][tid][d] = cv;
                        localChanged = true;
                    }
                } else if (cv === undefined) {
                    merged[child][tid][d] = lv;
                    cloudChanged = true;
                } else if (Array.isArray(lv) && Array.isArray(cv)) {
                    // 多次打卡数组：按时间戳 t 去重合并，并过滤单个 session 墓碑
                    const isSessionDeleted = (e) => {
                        if (!e || !e.t) return false;
                        const sessionKey = makeCheckinTombstoneKey(tid, d, e.t);
                        const delTs = childCheckinTombstones[sessionKey];
                        return delTs && (now - delTs < THIRTY_DAYS_MS);
                    };
                    const seen = new Map();
                    cv.forEach(e => {
                        if (isSessionDeleted(e)) {
                            cloudChanged = true;
                            return;
                        }
                        seen.set(e.t || JSON.stringify(e), e);
                    });
                    lv.forEach(e => {
                        if (isSessionDeleted(e)) return;
                        seen.set(e.t || JSON.stringify(e), e);
                    });
                    const arr = [...seen.values()].sort((a, b) => (a.t || 0) - (b.t || 0));
                    if (arr.length > 0) {
                        merged[child][tid][d] = arr;
                    }
                    if (arr.length !== lv.length) localChanged = true;
                    if (arr.length !== cv.length) cloudChanged = true;
                } else {
                    merged[child][tid][d] = lv;
                    if (JSON.stringify(lv) !== JSON.stringify(cv)) cloudChanged = true;
                }
            });

            if (Object.keys(merged[child][tid]).length === 0) {
                delete merged[child][tid];
            }
        });

        if (Object.keys(merged[child]).length === 0) {
            delete merged[child];
        }
    });

    return { merged, localChanged, cloudChanged };
}

/**
 * 深度合并打卡删除墓碑表（app_deleted_checkins_v1）
 * 1. 按 child 分别合并，取最新删除时间戳
 * 2. 如果该项已经重新打卡（活跃），自动清理该墓碑，防止后续打卡被屏蔽
 * 3. 超过 30 天的墓碑自动清理
 */
export function mergeCheckinTombstonesRecord(l, c, localCheckins = {}, cloudCheckins = {}, deletedProfileTombstones = {}, now = Date.now()) {
    if (!l && !c) return null;
    const merged = {};
    const children = new Set([...Object.keys(l || {}), ...Object.keys(c || {})]);
    let cloudChanged = false, localChanged = false;

    children.forEach(child => {
        if (child === '测试员' || child === 'TESTER') return;
        if (deletedProfileTombstones && deletedProfileTombstones[child]) {
            if (c?.[child] && Object.keys(c[child]).length > 0) cloudChanged = true;
            return;
        }

        const lMap = l?.[child] || {};
        const cMap = c?.[child] || {};
        const childMerged = { ...cMap };

        const lCheck = localCheckins?.[child] || {};
        const cCheck = cloudCheckins?.[child] || {};

        const isCheckinActive = (key) => {
            const { taskId, date, sessionTs } = parseCheckinTombstoneKey(key);
            if (!taskId || !date) return false;
            const lVal = lCheck[taskId]?.[date];
            const cVal = cCheck[taskId]?.[date];
            if (sessionTs) {
                const inL = Array.isArray(lVal) && lVal.some(e => String(e.t) === String(sessionTs));
                const inC = Array.isArray(cVal) && cVal.some(e => String(e.t) === String(sessionTs));
                return inL || inC;
            }
            return lVal !== undefined || cVal !== undefined;
        };

        Object.entries(lMap).forEach(([k, ts]) => {
            if (isCheckinActive(k)) {
                localChanged = true;
                return;
            }
            if (!childMerged[k] || ts > childMerged[k]) {
                childMerged[k] = ts;
                cloudChanged = true;
            }
        });

        Object.entries(cMap).forEach(([k, ts]) => {
            if (isCheckinActive(k)) {
                delete childMerged[k];
                cloudChanged = true;
                return;
            }
            if (!lMap[k] || ts > lMap[k]) {
                localChanged = true;
            }
        });

        Object.keys(childMerged).forEach(k => {
            if (now - childMerged[k] > THIRTY_DAYS_MS || isCheckinActive(k)) {
                delete childMerged[k];
                cloudChanged = true;
                localChanged = true;
            }
        });

        if (Object.keys(childMerged).length > 0) {
            merged[child] = childMerged;
        }
    });

    return { merged, localChanged, cloudChanged };
}
