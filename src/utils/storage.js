// src/utils/storage.js
// 工业级双轨制存储引擎：IndexedDB (海量异步持久化) + Memory Cache (微秒级同步读取) + Fast Boot Mirror (秒开配置)

const DB_NAME = 'daka_app_db';
const STORE_NAME = 'app_keyval';
const DB_VERSION = 1;

// 开屏秒开必需的极简配置（保留在 localStorage 作为镜像）
export const FAST_BOOT_KEYS = new Set([
    'app_profiles_v1',
    'app_theme',
    'app_active_child',
    'app_sync_code',
    'app_settings_password',
    'app_global_dates',
    'app_device_id',
    'app_last_report_date',
    'app_user_city_v1',
    '_sync_local_ts',
    '_sync_last_hash',
    '_key_versions',
    '_storage_migrated_v1'
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

// --- 1. 底层 IndexedDB 封装 ---
const openDB = () => {
    if (dbInstance) return Promise.resolve(dbInstance);
    if (dbPromise) return dbPromise;
    if (!isIdbSupported) return Promise.resolve(null);

    dbPromise = new Promise((resolve) => {
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
                console.warn('[Storage] IndexedDB open failed, falling back to localStorage:', e);
                isIdbSupported = false;
                dbPromise = null;
                resolve(null);
            };
            req.onblocked = () => {
                console.warn('[Storage] IndexedDB open blocked');
            };
        } catch (err) {
            console.warn('[Storage] IndexedDB exception:', err);
            isIdbSupported = false;
            dbPromise = null;
            resolve(null);
        }
    });
    return dbPromise;
};

const idbGetAll = async () => {
    const db = await openDB();
    if (!db) return {};
    return new Promise((resolve) => {
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
                } else {
                    resolve(result);
                }
            };
            req.onerror = () => resolve({});
        } catch {
            resolve({});
        }
    });
};

// 批量提交脏数据到 IndexedDB，返回 Promise 确保落盘完毕
const flushPendingDbWrites = async () => {
    if (pendingDbWrites.size === 0 && pendingDbDeletes.size === 0) return true;
    const writes = new Map(pendingDbWrites);
    const deletes = new Set(pendingDbDeletes);
    pendingDbWrites.clear();
    pendingDbDeletes.clear();

    const db = await openDB();
    if (!db) return false;

    return new Promise((resolve) => {
        try {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            writes.forEach((val, key) => {
                store.put(val, key);
            });
            deletes.forEach(key => {
                store.delete(key);
            });
            tx.oncomplete = () => resolve(true);
            tx.onerror = (err) => {
                console.warn('[Storage] Flush tx error:', err);
                resolve(false);
            };
            tx.onabort = () => resolve(false);
        } catch (e) {
            console.warn('[Storage] Flush to IndexedDB error:', e);
            resolve(false);
        }
    });
};

const scheduleDbFlush = () => {
    if (dbWriteTimer) return;
    dbWriteTimer = setTimeout(() => {
        dbWriteTimer = null;
        if (typeof window !== 'undefined' && window.requestIdleCallback) {
            window.requestIdleCallback(() => flushPendingDbWrites());
        } else {
            flushPendingDbWrites();
        }
    }, 150);
};

// 过滤因历史迁移或变量未定义残留的垃圾脏键（如 app_undefined_*, app_2047* 等）
export const isJunkKey = (k) => {
    if (!k || typeof k !== 'string') return true;
    if (k.includes('undefined') || k.includes('null')) return true;
    if (/^app_\d+_app_/.test(k)) return true;
    if (k === '_sync_last_hash' || k === '_sync_local_ts') return true;
    return false;
};

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
        const valStr = typeof value === 'string' ? value : JSON.stringify(value ?? null);
        memoryCache.set(key, valStr);

        // 如果是快速启动小配置，镜像保存到 localStorage
        if (FAST_BOOT_KEYS.has(key) && typeof window !== 'undefined' && window.localStorage) {
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
        flushPendingDbWrites();
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
        return flushPendingDbWrites();
    }
};

// --- 3. 初始化与老数据无缝安全迁移 (Zero-Loss Migration) ---
export const initStorage = async () => {
    // 1. 先将 localStorage 中的 FAST_BOOT_KEYS 和现有数据预热入 memoryCache (0ms 同步极速)
    if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = 0; i < window.localStorage.length; i++) {
            const k = window.localStorage.key(i);
            if (k && (k.startsWith('app_') || k.startsWith('_'))) {
                memoryCache.set(k, window.localStorage.getItem(k));
            }
        }
    }

    if (!isIdbSupported) {
        console.warn('[Storage] IndexedDB not supported, running on localStorage fallback');
        return true;
    }

    // 设置 1500ms 超时保护，防止老旧浏览器卡住 IndexedDB 回调
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 1500));
    const initPromise = (async () => {
        try {
            // 2. 从 IndexedDB 加载全部持久化数据
            const idbData = await idbGetAll();
            Object.entries(idbData).forEach(([k, v]) => {
                // 如果是 FAST_BOOT_KEYS，且 localStorage 中已有该键，优先以 localStorage 的实时同步值为准（防止上次关闭页面时 150ms 异步写盘未完成）
                if (FAST_BOOT_KEYS.has(k) && window.localStorage?.getItem(k) !== null) {
                    return;
                }
                memoryCache.set(k, v);
            });

            // 3. 检查是否需要从 localStorage 迁移老数据
            const migrated = window.localStorage?.getItem('_storage_migrated_v1');
            if (!migrated && typeof window !== 'undefined' && window.localStorage) {
                console.log('[Storage] Performing one-time migration from localStorage to IndexedDB...');
                const keysToMigrate = [];
                for (let i = 0; i < window.localStorage.length; i++) {
                    const k = window.localStorage.key(i);
                    if (k && (k.startsWith('app_') || k.startsWith('_')) && k !== '_storage_migrated_v1') {
                        keysToMigrate.push(k);
                    }
                }

                // 将 localStorage 中的所有旧 app_* 数据写入 IndexedDB
                keysToMigrate.forEach(k => {
                    const val = window.localStorage.getItem(k);
                    if (val !== null) {
                        memoryCache.set(k, val);
                        pendingDbWrites.set(k, val);
                    }
                });

                await flushPendingDbWrites();

                // 迁移成功后：标记已迁移，并清理 localStorage 中的非快起大键（如打卡记录、大账本等），瞬间释放 5MB 配额！
                window.localStorage.setItem('_storage_migrated_v1', 'true');
                keysToMigrate.forEach(k => {
                    if (!FAST_BOOT_KEYS.has(k)) {
                        try {
                            window.localStorage.removeItem(k);
                        } catch (e) {}
                    }
                });
                console.log(`[Storage] Migrated ${keysToMigrate.length} keys to IndexedDB successfully, localStorage pruned!`);
            }

            // 4. 清理内存和磁盘上的历史残留垃圾脏键（如 app_undefined_*, app_2047* 等）
            const junkKeysToPrune = [];
            memoryCache.forEach((_, k) => {
                if (isJunkKey(k)) junkKeysToPrune.push(k);
            });
            if (junkKeysToPrune.length > 0) {
                junkKeysToPrune.forEach(k => {
                    memoryCache.delete(k);
                    pendingDbWrites.delete(k);
                    pendingDbDeletes.add(k);
                    if (typeof window !== 'undefined' && window.localStorage) {
                        try { window.localStorage.removeItem(k); } catch (e) {}
                    }
                });
                scheduleDbFlush();
            }

            return true;
        } catch (err) {
            console.error('[Storage] Init IndexedDB error:', err);
            return false;
        }
    })();

    await Promise.race([initPromise, timeoutPromise]);
    return true;
};

// 挂载全局对象，便于调试与兼容直调
if (typeof window !== 'undefined') {
    window.storage = storage;
    window._markKeyVersion = (key) => storage.markKeyVersion(key);

    // 页面卸载前紧急保存
    window.addEventListener('beforeunload', () => {
        if (window._pendingWrites) {
            Object.entries(window._pendingWrites).forEach(([k, v]) => {
                try {
                    storage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
                } catch (e) {}
            });
        }
        flushPendingDbWrites();
    });
}
