/**
 * readingSync.js: 伴读书阁跨设备同步与藏书书架深度合并核心算法
 * 
 * 解决4大核心痛点：
 * 1. iPad 与电脑跨设备阅读进度同步冲突：基于 updatedAt 时间戳 Last-Write-Wins (LWW) 与全本通关进度保全
 * 2. 已读完全本自动流转至待换新书，防止全本通关后残留打卡提醒
 * 3. 藏书书架多次打卡重复收录问题：深度按书名/taskId去重与合并
 * 4. 藏书书架与待续书架删除墓碑（app_deleted_reading_books_v1），保证在任意一端删除后不再被云端复活
 */

const THIRTY_DAYS_MS = 30 * 86400000;

/**
 * 判断某本书籍是否已被墓碑标记删除（30天内有效）
 */
export function isBookTombstoned(book, childTombstones = {}, now = Date.now(), maxAgeMs = THIRTY_DAYS_MS) {
    if (!book) return true;
    const idKey = book.id ? String(book.id) : null;
    const titleKey = (book.bookTitle || book.title) ? String(book.bookTitle || book.title).trim() : null;

    if (idKey && childTombstones[idKey] && (now - childTombstones[idKey] < maxAgeMs)) return true;
    if (titleKey && childTombstones[titleKey] && (now - childTombstones[titleKey] < maxAgeMs)) return true;
    return false;
}

/**
 * 合并两个设备上同 ID 的伴读任务
 * @param {Object} lt 本地任务项
 * @param {Object} ct 云端任务项
 * @returns {Object} 融合后的任务项
 */
export function mergeReadingTaskItem(lt, ct) {
    if (!lt && !ct) return null;
    if (!lt) return ct;
    if (!ct) return lt;

    const ltTime = lt.updatedAt || lt.readingConfig?.updatedAt || 0;
    const ctTime = ct.updatedAt || ct.readingConfig?.updatedAt || 0;

    let mergedItem;
    if (ctTime > ltTime) {
        // 云端时间更新，以云端任务为基准
        mergedItem = { ...lt, ...ct };
    } else if (ltTime > ctTime) {
        // 本地时间更新，以本地任务为基准
        mergedItem = { ...ct, ...lt };
    } else {
        // 时间戳相同或缺失时：针对伴读任务做阅读进度与通关状态对比
        const isReading = !!(lt.readingConfig?.isReading || lt.frequencyType === 'reading' || ct.readingConfig?.isReading || ct.frequencyType === 'reading');
        if (isReading) {
            const lProg = lt.readingConfig?.currentProgress || 0;
            const cProg = ct.readingConfig?.currentProgress || 0;
            const lDone = !!lt.readingConfig?.needsNextBook || lProg >= (lt.readingConfig?.totalPages || 100);
            const cDone = !!ct.readingConfig?.needsNextBook || cProg >= (ct.readingConfig?.totalPages || 100);
            const lNotesLen = Array.isArray(lt.readingConfig?.notes) ? lt.readingConfig.notes.length : 0;
            const cNotesLen = Array.isArray(ct.readingConfig?.notes) ? ct.readingConfig.notes.length : 0;

            if (cDone && !lDone) {
                mergedItem = { ...lt, ...ct };
            } else if (lDone && !cDone) {
                mergedItem = { ...ct, ...lt };
            } else if (cProg > lProg || cNotesLen > lNotesLen) {
                mergedItem = { ...lt, ...ct };
            } else if (lProg > cProg || lNotesLen > cNotesLen) {
                mergedItem = { ...ct, ...lt };
            } else {
                mergedItem = { ...ct, ...lt };
            }
        } else {
            mergedItem = { ...ct, ...lt };
        }
    }

    // 合并读书心得金句 notes，保留两端记录
    if (mergedItem.readingConfig) {
        const lNotesArr = Array.isArray(lt.readingConfig?.notes) ? lt.readingConfig.notes : [];
        const cNotesArr = Array.isArray(ct.readingConfig?.notes) ? ct.readingConfig.notes : [];
        if (lNotesArr.length > 0 && cNotesArr.length > 0) {
            const seenNotes = new Set();
            const combinedNotes = [];
            [...cNotesArr, ...lNotesArr].forEach(n => {
                const qKey = typeof n === 'string' ? n : `${n.date || ''}_${n.progress || ''}_${(n.text || '').trim()}`;
                if (!seenNotes.has(qKey)) {
                    seenNotes.add(qKey);
                    combinedNotes.push(n);
                }
            });
            mergedItem.readingConfig = {
                ...mergedItem.readingConfig,
                notes: combinedNotes
            };
        }
    }

    return mergedItem;
}

/**
 * 深度合并单个孩子的已读完藏书历史列表
 * 过滤墓碑、按书名/taskId深度去重、合并金句与进度
 */
export function mergeReadingHistoryList(lList = [], cList = [], childTombstones = {}, now = Date.now()) {
    const validC = (Array.isArray(cList) ? cList : []).filter(b => !isBookTombstoned(b, childTombstones, now));
    const validL = (Array.isArray(lList) ? lList : []).filter(b => !isBookTombstoned(b, childTombstones, now));

    const bookMap = new Map();
    // 1. 载入云端藏书
    validC.forEach(b => {
        const key = (b.bookTitle || b.title || b.id || '').trim().toLowerCase();
        if (key) bookMap.set(key, b);
    });

    // 2. 合入本地藏书（若同名则深度合并）
    validL.forEach(b => {
        const key = (b.bookTitle || b.title || b.id || '').trim().toLowerCase();
        if (!key) return;
        if (!bookMap.has(key)) {
            bookMap.set(key, b);
        } else {
            const existing = bookMap.get(key);
            const existingQuotes = Array.isArray(existing.quotes) ? existing.quotes : [];
            const localQuotes = Array.isArray(b.quotes) ? b.quotes : [];
            const seenQuotes = new Set();
            const combinedQuotes = [];
            [...existingQuotes, ...localQuotes].forEach(q => {
                const qKey = typeof q === 'string' ? q : `${q.date || ''}_${q.progress || ''}_${(q.text || '').trim()}`;
                if (!seenQuotes.has(qKey)) {
                    seenQuotes.add(qKey);
                    combinedQuotes.push(q);
                }
            });
            const mergedBook = {
                ...existing,
                ...b,
                quotes: combinedQuotes,
                totalPages: Math.max(existing.totalPages || existing.pages || 0, b.totalPages || b.pages || 0),
                grandReward: Math.max(existing.grandReward || 0, b.grandReward || 0),
                completedDate: b.completedDate || existing.completedDate
            };
            bookMap.set(key, mergedBook);
        }
    });

    return Array.from(bookMap.values()).sort((a, b) => (b.completedDate || '').localeCompare(a.completedDate || ''));
}

/**
 * 深度合并单个孩子的待续书架（插书签暂存书目）
 */
export function mergeReadingShelvedList(lList = [], cList = [], childTombstones = {}, now = Date.now()) {
    const validC = (Array.isArray(cList) ? cList : []).filter(b => !isBookTombstoned(b, childTombstones, now));
    const validL = (Array.isArray(lList) ? lList : []).filter(b => !isBookTombstoned(b, childTombstones, now));

    const shelveMap = new Map();
    validC.forEach(b => {
        const key = (b.bookTitle || b.title || b.id || '').trim().toLowerCase();
        if (key) shelveMap.set(key, b);
    });

    validL.forEach(b => {
        const key = (b.bookTitle || b.title || b.id || '').trim().toLowerCase();
        if (!key) return;
        if (!shelveMap.has(key)) {
            shelveMap.set(key, b);
        } else {
            const existing = shelveMap.get(key);
            const mergedBook = {
                ...existing,
                ...b,
                currentProgress: Math.max(existing.currentProgress || 0, b.currentProgress || 0),
                shelvedDate: b.shelvedDate || existing.shelvedDate
            };
            shelveMap.set(key, mergedBook);
        }
    });

    return Array.from(shelveMap.values());
}
