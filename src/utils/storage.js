// src/utils/storage.js
// 工业级双轨制存储引擎：IndexedDB (海量异步持久化) + Memory Cache (微秒级同步读取) + Fast Boot Mirror (秒开配置)

const DB_NAME = 'daka_app_db';
const STORE_NAME = 'app_keyval';
const DB_VERSION = 1;
// A missing sync baseline causes conservative reconciliation, never data loss.
// Keep this potentially large duplicate snapshot in IndexedDB, not the small
// synchronous recovery journal or the localStorage-only fallback.
const RECONSTRUCTIBLE_KEYS = new Set(['_sync_checkpoint_v2']);

// 开屏秒开必需的极简配置（保留在 localStorage 作为镜像）
export const FAST_BOOT_KEYS = new Set([
    'app_profiles_v1',
    'app_deleted_profiles_v1',
    'app_theme',
    'app_active_child',
    'app_sync_code',
    'app_settings_password',
    'app_global_dates',
    'app_device_id',
    'app_last_report_date',
    'app_user_city_v1',
    'app_exchange_base_cents',
    'app_exchange_volatility',
    'app_exchange_min_gold',
    'app_exchange_max_single',
    'app_exchange_max_weekly',
    '_sync_local_ts',
    '_sync_last_hash',
    '_key_versions',
    '_storage_migrated_v1',
    'app_pending_evil_penalties_v2',
    'app_evil_penalty_log_v1',
    'app_evil_auto_trigger',
    'app_evil_trigger_config_v1',
    'app_gamification_config_v1',
    'app_escrow_penalties_v1',
    'app_first_blood_records_v1'
]);

// 内存中的全量缓存字典，保证业务层读操作（如 useStickyState, useMemo）绝对同步、0ms 耗时
const memoryCache = new Map();

// 待异步写入 IndexedDB 的脏数据队列与批量防抖定时器
const pendingDbWrites = new Map();
const pendingDbDeletes = new Set();
let dbWriteTimer = null;
let dbPromise = null;
let dbInstance = null;
let isIdbSupported = typeof window !== 'undefined' && !!window.indexedDB;
let initialization = null;
let state = { phase: 'loading', error: '', saveError: '' };
let inFlightWrites = new Map();
let inFlightDeletes = new Set();
let journalReplayReady = false;
const RESTORE_BACKUP = '_restore_backup_v1';
const RESTORE_MIRRORS = '_restore_mirrors_v1';
const RESTORE_FALLBACK = '_restore_fallback_v1';
const updateState = patch => {
    state = { ...state, ...patch };
    window.dispatchEvent(new Event('_storageStateChanged'));
};
export const getStorageState = () => state;
export const canSyncStorage = () => state.phase === 'ready' && !state.saveError;

// --- 1. 底层 IndexedDB 封装 ---
const openDB = () => {
    if (dbInstance) return Promise.resolve(dbInstance);
    if (dbPromise) return dbPromise;
    if (!isIdbSupported) return Promise.resolve(null);

    dbPromise = new Promise((resolve, reject) => {
        try {
            const req = window.indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
            req.onsuccess = (e) => {
                dbInstance = e.target.result;
                dbInstance.onversionchange = () => {
                    if (dbInstance) dbInstance.close();
                    dbInstance = null;
                    dbPromise = null;
                };
                resolve(dbInstance);
            };
            req.onerror = (e) => {
                console.warn('[Storage] IndexedDB open failed:', e);
                dbPromise = null;
                reject(new Error('无法打开本地数据库，请重新尝试。'));
            };
            req.onblocked = () => {
                updateState({ error: '本地数据库被其他页面占用，请关闭其他打卡页面后重试。' });
            };
        } catch (err) {
            console.warn('[Storage] IndexedDB exception:', err);
            dbPromise = null;
            reject(err);
        }
    });
    return dbPromise;
};

const idbGetAll = async () => {
    const db = await openDB();
    if (!db) return {};
    return new Promise((resolve, reject) => {
        try {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.openCursor();
            const result = {};
            req.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    result[cursor.key] = cursor.value;
                    cursor.continue();
                }
            };
            tx.oncomplete = () => resolve(result);
            tx.onerror = tx.onabort = () => reject(new Error('本地数据读取失败，请重试。'));
        } catch (error) {
            reject(error);
        }
    });
};

// 批量提交脏数据到 IndexedDB，返回 Promise 确保落盘完毕
let flushChain = Promise.resolve(true);
const flushPendingDbWrites = () => {
    flushChain = flushChain.then(flushDbBatch, flushDbBatch);
    return flushChain;
};
const flushDbBatch = async () => {
    if (pendingDbWrites.size === 0 && pendingDbDeletes.size === 0) return true;
    const writes = new Map(pendingDbWrites);
    const deletes = new Set(pendingDbDeletes);
    pendingDbWrites.clear();
    pendingDbDeletes.clear();
    inFlightWrites = writes;
    inFlightDeletes = deletes;
    const journalId = readJournal().id;
    const finish = ok => {
        inFlightWrites = new Map();
        inFlightDeletes = new Set();
        if (!ok) {
            writes.forEach((value, key) => { if (!pendingDbWrites.has(key) && !pendingDbDeletes.has(key)) pendingDbWrites.set(key, value); });
            deletes.forEach(key => { if (!pendingDbWrites.has(key) && !pendingDbDeletes.has(key)) pendingDbDeletes.add(key); });
            updateState({ saveError: '本地保存尚未完成，请保留页面并重试保存。' });
        } else {
            if (!pendingDbWrites.size && !pendingDbDeletes.size) {
                if (journalReplayReady && journalId && readJournal().id === journalId) window.localStorage.removeItem(ACCOUNTING_JOURNAL);
                updateState({ saveError: '' });
            }
        }
        return ok;
    };
    let db;
    try { db = await openDB(); } catch { return finish(false); }
    if (!db) {
        try {
            writes.forEach((value, key) => { if (!RECONSTRUCTIBLE_KEYS.has(key)) window.localStorage.setItem(key, value); });
            deletes.forEach(key => window.localStorage.removeItem(key));
            return finish(true);
        } catch { return finish(false); }
    }

    return new Promise((resolve) => {
        let tx;
        let finished = false;
        const complete = ok => { if (!finished) { finished = true; resolve(finish(ok)); } };
        try {
            tx = db.transaction(STORE_NAME, 'readwrite');
            tx.oncomplete = () => complete(true);
            tx.onerror = () => {}; // onabort is the final failure signal; do not finish twice.
            tx.onabort = () => complete(false);
            const store = tx.objectStore(STORE_NAME);
            writes.forEach((val, key) => {
                store.put(val, key);
            });
            deletes.forEach(key => {
                store.delete(key);
            });
        } catch (e) {
            console.warn('[Storage] Flush to IndexedDB error:', e);
            if (tx) { try { tx.abort(); } catch { /* already aborted */ } }
            complete(false);
        }
    });
};

const scheduleDbFlush = () => {
    if (dbWriteTimer) return;
    dbWriteTimer = setTimeout(() => {
        dbWriteTimer = null;
        if (typeof window !== 'undefined' && window.requestIdleCallback) {
            window.requestIdleCallback(() => flushPendingDbWrites(), { timeout: 1000 });
        } else {
            flushPendingDbWrites();
        }
    }, 150);
};

// 过滤因历史迁移或变量未定义残留的垃圾脏键（如 app_undefined_*, app_2047* 等，并排除仅限本地的临时离线兑换单草稿）
export const isJunkKey = (k) => {
    if (!k || typeof k !== 'string') return true;
    if (k.includes('undefined') || k.includes('null')) return true;
    if (/^app_\d+_app_/.test(k)) return true;
    if (k === '_sync_last_hash' || k === '_sync_local_ts') return true;
    if (k.startsWith('app_offline_exchange_')) return true;
    return false;
};

// A single localStorage write commits the complete accounting transaction before publication.
// Keep the journal until all IndexedDB writes finish; startup replays interrupted transactions.
const ACCOUNTING_JOURNAL = '_accounting_journal_v1';
let journalSequence = 0;
const readJournal = () => JSON.parse(window.localStorage.getItem(ACCOUNTING_JOURNAL) || '{}');
const writeJournal = (entries, deletions = []) => {
    const previous = readJournal();
    const values = { ...(previous.entries || {}) };
    RECONSTRUCTIBLE_KEYS.forEach(key => { delete values[key]; });
    const deletedKeys = new Set(previous.deletedKeys || []);
    const put = (key, value) => { if (!RECONSTRUCTIBLE_KEYS.has(key)) values[key] = value; deletedKeys.delete(key); };
    const del = key => { delete values[key]; deletedKeys.add(key); };
    inFlightWrites.forEach((value, key) => put(key, value)); inFlightDeletes.forEach(del);
    pendingDbWrites.forEach((value, key) => put(key, value)); pendingDbDeletes.forEach(del);
    Object.entries(entries).forEach(([key, value]) => put(key, value));
    deletions.forEach(del);
    const journal = { id: `${Date.now()}-${++journalSequence}-${Math.random().toString(36).slice(2)}`, entries: values, deletedKeys: [...deletedKeys] };
    window.localStorage.setItem(ACCOUNTING_JOURNAL, JSON.stringify(journal));
    return journal;
};
export function commitDurable(entries, deletions = []) {
    if (state.phase === 'restoring') throw new Error('正在恢复数据，请稍后重试。');
    // Quota/security errors deliberately propagate: never claim a command without a durable record.
    const versions = storage.getKeyVersions();
    for (const key of Object.keys(entries)) versions[key] = Date.now();
    const writes = { ...entries, _key_versions: JSON.stringify(versions) };
    writeJournal(writes, deletions);
    for (const [key, value] of Object.entries(writes)) {
        storage.setItem(key, value);
        if (window._pendingWrites) delete window._pendingWrites[key];
    }
    for (const key of deletions) {
        storage.removeItem(key);
        if (window._pendingWrites) delete window._pendingWrites[key];
    }
    window.dispatchEvent(new CustomEvent('_durableDataCommitted', { detail: [...Object.keys(entries), ...deletions] }));
    flushPendingDbWrites().catch(error => console.error('[Storage] Durable flush failed; recovery journal retained', error));
}

// React pending values are decoded values, including strings: always JSON.stringify them.
export function flushPendingState() {
    if (state.phase !== 'ready') return;
    for (const [key, value] of Object.entries(window._pendingWrites || {})) {
        storage.setItem(key, JSON.stringify(value));
        storage.markKeyVersion(key);
        delete window._pendingWrites[key];
    }
}

export function persistBeforeSuspend() {
    if (state.phase !== 'ready') return;
    flushPendingState();
    try {
        if (pendingDbWrites.size || pendingDbDeletes.size || inFlightWrites.size || inFlightDeletes.size) writeJournal({});
    } catch {
        updateState({ saveError: '本地空间不足，尚有数据未保存，请保留页面并重试保存。' });
    }
    return flushPendingDbWrites();
}

// --- 2. 核心 Storage 接口 ---
export const storage = {
    // 同步读取：先查内存缓存，再查 localStorage 兜底
    getItem(key) {
        if (memoryCache.has(key)) {
            return memoryCache.get(key);
        }
        if (typeof window !== 'undefined' && window.localStorage) {
            const val = window.localStorage.getItem(key);
            if (val !== null) {
                memoryCache.set(key, val);
                return val;
            }
        }
        return null;
    },

    // 写入：内存即刻生效，高频小配置镜像到 localStorage，其余入异步 IndexedDB 批处理
    setItem(key, value) {
        if (state.phase === 'restoring') throw new Error('正在恢复数据，请稍后重试。');
        const valStr = typeof value === 'string' ? value : JSON.stringify(value ?? null);
        memoryCache.set(key, valStr);

        // 如果是快速启动小配置或零花钱兑换等核心数据，镜像保存到 localStorage
        const isMirrorKey = FAST_BOOT_KEYS.has(key) || key.startsWith('app_exchange_total_') || key.startsWith('app_exchange_records_');
        if (isMirrorKey && typeof window !== 'undefined' && window.localStorage) {
            try {
                window.localStorage.setItem(key, valStr);
            } catch (e) {}
        }

        // 加入 IndexedDB 异步写入队列
        pendingDbDeletes.delete(key);
        pendingDbWrites.set(key, valStr);
        scheduleDbFlush();
    },

    // 删除
    removeItem(key) {
        if (state.phase === 'restoring') throw new Error('正在恢复数据，请稍后重试。');
        memoryCache.delete(key);
        if (typeof window !== 'undefined' && window.localStorage) {
            try { window.localStorage.removeItem(key); } catch (e) {}
        }
        pendingDbWrites.delete(key);
        pendingDbDeletes.add(key);
        scheduleDbFlush();
    },

    // 获取所有需要云同步的数据（格式：{ key: jsonString }）
    getAllSyncData() {
        const result = {};
        // 遍历内存缓存中所有以 app_ 开头的键（排除脏键与元数据）
        memoryCache.forEach((val, key) => {
            if (key.startsWith('app_') && !isJunkKey(key)) {
                result[key] = val;
            }
        });
        // 检查 localStorage 是否有独有项（防止漏传）
        if (typeof window !== 'undefined' && window.localStorage) {
            for (let i = 0; i < window.localStorage.length; i++) {
                const k = window.localStorage.key(i);
                if (k && k.startsWith('app_') && !isJunkKey(k) && !(k in result)) {
                    result[k] = window.localStorage.getItem(k);
                }
            }
        }
        return result;
    },

    // 批量导入（云端同步或备份还原）
    setMany(entries) {
        Object.entries(entries).forEach(([k, v]) => {
            this.setItem(k, v);
        });
        return flushPendingDbWrites();
    },

    // 版本标记（按 key 记录最新本地修改时间戳）
    markKeyVersion(key) {
        try {
            const versionsStr = this.getItem('_key_versions');
            const versions = versionsStr ? JSON.parse(versionsStr) : {};
            versions[key] = Date.now();
            this.setItem('_key_versions', JSON.stringify(versions));
        } catch (e) {}
    },

    getKeyVersions() {
        try {
            const versionsStr = this.getItem('_key_versions');
            return versionsStr ? JSON.parse(versionsStr) : {};
        } catch (e) {
            return {};
        }
    },

    // 强制立即刷入磁盘
    flush() {
        flushPendingState();
        return flushPendingDbWrites();
    }
};

// Initialization never treats a read timeout/error as an empty installation.
export const initStorage = () => {
    if (initialization) return initialization;
    initialization = (async () => {
        updateState({ phase: 'loading', error: '' });
        try {
            recoverFallbackRestore();
            for (let i = 0; i < window.localStorage.length; i++) {
                const key = window.localStorage.key(i);
                if (key && (key.startsWith('app_') || key.startsWith('_'))) memoryCache.set(key, window.localStorage.getItem(key));
            }
            if (!isIdbSupported && window.localStorage.getItem('_storage_migrated_v1')) {
                throw new Error('当前无法读取已有本地数据库，请恢复浏览器的存储访问后重试。');
            }
            const idbData = await idbGetAll();
            const restoredKeys = new Set(JSON.parse(idbData[RESTORE_MIRRORS] || '[]'));
            for (const [key, value] of Object.entries(idbData)) {
                if (!restoredKeys.has(key) && FAST_BOOT_KEYS.has(key) && window.localStorage.getItem(key) !== null) continue;
                memoryCache.set(key, value);
            }
            if (restoredKeys.size) await repairRestoreMirrors(restoredKeys);

            if (isIdbSupported && !window.localStorage.getItem('_storage_migrated_v1')) {
                const originals = new Map();
                for (let i = 0; i < window.localStorage.length; i++) {
                    const key = window.localStorage.key(i);
                    if (key && (key.startsWith('app_') || key.startsWith('_')) &&
                        !['_storage_migrated_v1', ACCOUNTING_JOURNAL, RESTORE_BACKUP, RESTORE_MIRRORS, RESTORE_FALLBACK].includes(key)) {
                        originals.set(key, window.localStorage.getItem(key));
                    }
                }
                for (const [key, value] of originals) { memoryCache.set(key, value); pendingDbWrites.set(key, value); }
                if (!await flushPendingDbWrites()) throw new Error('旧数据迁移未完成，原数据已保留，请重试。');
                const saved = await idbGetAll();
                if ([...originals].some(([key, value]) => saved[key] !== value)) throw new Error('迁移核验未通过，原数据已保留，请重试。');
                window.localStorage.setItem('_storage_migrated_v1', 'true');
                for (const [key, value] of originals) {
                    if (!FAST_BOOT_KEYS.has(key) && window.localStorage.getItem(key) === value) window.localStorage.removeItem(key);
                }
            }

            const journal = readJournal();
            journalReplayReady = true;
            if (journal.entries) {
                for (const [key, value] of Object.entries(journal.entries)) storage.setItem(key, value);
                for (const key of journal.deletedKeys || []) storage.removeItem(key);
                if (!await flushPendingDbWrites()) throw new Error('上次保存的数据尚未恢复完成，请重试。');
            }
            // Only clean malformed application keys. Sync metadata is valid state.
            for (const key of memoryCache.keys()) {
                if (key.startsWith('app_') && isJunkKey(key)) storage.removeItem(key);
            }
            updateState({ phase: 'ready', error: '', saveError: '' });
            return true;
        } catch (error) {
            console.error('[Storage] Initialization failed:', error);
            updateState({ phase: 'error', error: error.message || '本地数据读取失败，请重试。' });
            return false;
        }
    })();
    return initialization;
};

async function repairRestoreMirrors(keys) {
    try {
        for (const key of keys) {
            if (FAST_BOOT_KEYS.has(key) || key.startsWith('app_exchange_total_') || key.startsWith('app_exchange_records_')) {
                window.localStorage.setItem(key, memoryCache.get(key));
            } else window.localStorage.removeItem(key);
        }
        const db = await openDB();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).delete(RESTORE_MIRRORS);
            tx.oncomplete = resolve;
            tx.onabort = tx.onerror = reject;
        });
        memoryCache.delete(RESTORE_MIRRORS);
    } catch {
        // The committed marker makes IDB authoritative on next boot, even if LS is full.
    }
}

function recoverFallbackRestore() {
    const raw = window.localStorage.getItem(RESTORE_FALLBACK);
    if (!raw) return;
    const { before } = JSON.parse(raw);
    // Free newly added/replaced values before reinstating the original set (quota safe).
    for (const key of Object.keys(before)) window.localStorage.removeItem(key);
    for (const [key, value] of Object.entries(before)) if (value !== null) window.localStorage.setItem(key, value);
    window.localStorage.removeItem(RESTORE_FALLBACK);
}

function restoreWithoutIdb(writes, previous) {
    const before = {};
    for (const key of [...Object.keys(writes), RESTORE_BACKUP]) before[key] = window.localStorage.getItem(key);
    // If the recovery copy does not fit, reject before changing any existing value.
    window.localStorage.setItem(RESTORE_FALLBACK, JSON.stringify({ before }));
    try {
        window.localStorage.setItem(RESTORE_BACKUP, JSON.stringify(previous));
        for (const [key, value] of Object.entries(writes)) window.localStorage.setItem(key, value);
        window.localStorage.removeItem(RESTORE_FALLBACK);
    } catch (error) {
        try { recoverFallbackRestore(); }
        catch { updateState({ phase: 'error', error: '恢复中断，原数据快照已保留，请恢复存储访问后重新打开页面。' }); }
        throw error;
    }
}

// One IDB transaction saves the previous snapshot, imported values and mirror repair marker.
// No imported value is published to React until the transaction has committed.
export async function restoreEntries(entries) {
    if (state.phase !== 'ready') throw new Error('本地数据尚未就绪，请稍后重试。');
    for (const [key, value] of Object.entries(entries)) {
        if (!key.startsWith('app_') || isJunkKey(key) || typeof value !== 'string') throw new Error('备份中包含无效数据。');
    }
    flushPendingState();
    updateState({ phase: 'restoring', epoch: (state.epoch || 0) + 1 });
    try {
        if (!await flushPendingDbWrites()) throw new Error('当前数据尚未保存，已取消恢复。请先重试保存。');
        const db = await openDB();
        const previous = { version: '2.0', exportDate: new Date().toISOString(), _allSyncData: storage.getAllSyncData() };
        const versions = storage.getKeyVersions();
        for (const key of Object.keys(entries)) versions[key] = Date.now();
        const writes = { ...entries, _key_versions: JSON.stringify(versions) };
        const mirrorKeys = [...new Set([...JSON.parse(memoryCache.get(RESTORE_MIRRORS) || '[]'), ...Object.keys(writes)])];
        if (!db) restoreWithoutIdb(writes, previous);
        else await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            try {
                store.put(JSON.stringify(previous), RESTORE_BACKUP);
                for (const [key, value] of Object.entries(writes)) store.put(value, key);
                store.put(JSON.stringify(mirrorKeys), RESTORE_MIRRORS);
            } catch (error) { tx.abort(); reject(error); return; }
            tx.oncomplete = resolve;
            tx.onerror = () => {};
            tx.onabort = () => reject(new Error('恢复写入失败，当前数据未被覆盖。'));
        });
        for (const [key, value] of Object.entries(writes)) memoryCache.set(key, value);
        memoryCache.set(RESTORE_BACKUP, JSON.stringify(previous));
        if (db) {
            memoryCache.set(RESTORE_MIRRORS, JSON.stringify(mirrorKeys));
            await repairRestoreMirrors(mirrorKeys);
        }
        window._pendingWrites = {};
    } finally {
        if (state.phase === 'restoring') updateState({ phase: 'ready' });
    }
}

export function getPreRestoreBackup() {
    const value = memoryCache.get(RESTORE_BACKUP);
    return value ? JSON.parse(value) : null;
}

if (typeof window !== 'undefined') {
    window.storage = storage;
    window._markKeyVersion = key => storage.markKeyVersion(key);
    window.addEventListener('beforeunload', persistBeforeSuspend);
    window.addEventListener('pagehide', persistBeforeSuspend);
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') persistBeforeSuspend();
    });
}
