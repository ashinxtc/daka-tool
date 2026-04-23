/**
 * CloudBase 数据同步模块
 * 所有同步操作通过云函数 dataSync 完成
 * 使用 cloudbase-auth.js 中已登录的 SDK 会话，不再使用匿名登录
 * 支持多账号隔离：所有 localStorage 键均以用户 ID 为前缀
 */

// ==================== 配置 ====================

const SYNC_COLLECTION = 'userData';

// 多账号隔离：存储当前登录用户 ID
const USER_PREFIX_KEY = 'cloudbase_current_user_id';
// 设备账号映射：记录本设备登录过哪些账号，各自对应哪些键
const ACCOUNT_MAPPING_KEY = 'cloudbase_account_mapping';
// 迁移状态：标记是否已完成过迁移
const MIGRATION_DONE_KEY = 'cloudbase_migration_done';

/**
 * 需要同步的 localStorage 键映射
 * 格式：localKey (无前缀) → cloudKey (云端字段名)
 */
const SYNC_KEYS = {
  'app_tasks_v2': 'tasks',
  'app_checkins_v2': 'checkins',
  'app_wheel_history': 'wheelHistory',
  'app_xp_history': 'xpHistory',
  'app_profiles_v1': 'profiles',
  'app_achievements_v1': 'achievements',
  'app_stats_v1': 'stats',
  'app_inventory_v1': 'inventory',
  'app_active_buffs_v1': 'activeBuffs',
  'app_coupons_v1': 'redeemedCoupons',
  'app_equipped_gear_v1': 'equippedGear',
  'app_milestones_v1': 'milestones',
  'app_global_messages_v2': 'globalMessages',
  'app_global_dates': 'globalDates',
  'app_wheel_config': 'wheelConfig',
  'app_wheel_settings': 'wheelSettings',
  'app_evil_wheel_config': 'evilWheelConfig',
  'app_random_event_history': 'randomEventHistory',
  'app_daily_random_counts': 'dailyRandomCounts',
  'app_historical_event_progress_v1': 'historicalEventProgress',
  'app_daily_event_type_counts_v1': 'dailyEventTypeCounts',
  'app_user_city_v1': 'userCity',
  'app_curriculum_progress_v1': 'curriculumProgress',
  'app_xp_wheel_config': 'xpWheelConfig',
  'app_weekend_settings': 'weekendSettings',
  'app_exempted_days_v1': 'exemptedDays',
  'app_silence_mutes_v1': 'silenceMutes',
  'app_homework_exam_config_v1': 'homeworkExamConfig',
  'app_homework_records_v1': 'homeworkRecords',
  'app_exam_records_v1': 'examRecords',
  'app_repaired_checkins_v1': 'repairedCheckins',
  'app_weekly_payroll_v1': 'weeklyPayroll',
  'app_report_config_v1': 'reportConfig',
  'app_notified_levels': 'notifiedLevels',
  'app_settings_password': 'settingsPassword',
  'app_test_mode': 'testMode',
  'app_silence_violations_v1': 'silenceViolations',
  'app_silence_punishments_v1': 'silencePunishments'
};

// ==================== 多账号前缀支持 ====================

/**
 * 获取当前登录用户的 ID
 */
function getCurrentUserId() {
  return localStorage.getItem(USER_PREFIX_KEY) || null;
}

/**
 * 设置当前登录用户 ID
 */
function setCurrentUserId(userId) {
  if (userId) {
    localStorage.setItem(USER_PREFIX_KEY, userId);
    // 同步更新 account mapping
    _updateAccountMapping(userId);
  } else {
    localStorage.removeItem(USER_PREFIX_KEY);
  }
}

/**
 * 获取带用户前缀的 localStorage 键
 * @param {string} localKey - 无前缀的键名（如 'app_tasks_v2'）
 * @returns {string} - 带前缀的键名（如 'app_${userId}_tasks_v2'）
 */
function getPrefixedKey(localKey) {
  const userId = getCurrentUserId();
  if (!userId) return localKey;
  return `app_${userId}_${localKey}`;
}

/**
 * 获取账号映射表
 */
function getAccountMapping() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_MAPPING_KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * 更新账号映射（记录本设备登录过的账号及其数据键）
 * 扫描 localStorage，找出该 userId 拥有的所有前缀键
 */
function _updateAccountMapping(userId) {
  const mapping = getAccountMapping();
  if (!mapping[userId]) {
    mapping[userId] = { firstLogin: Date.now(), keys: [] };
  }
  // 扫描该账号的所有前缀键
  const prefix = `app_${userId}_`;
  const userKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const suffix = key.substring(prefix.length);
      // 只记录 SYNC_KEYS 中存在的键（排除元数据等杂项）
      if (SYNC_KEYS.hasOwnProperty(suffix)) {
        userKeys.push(key);
      }
    }
  }
  mapping[userId].keys = userKeys;
  mapping[userId].lastLogin = Date.now();
  localStorage.setItem(ACCOUNT_MAPPING_KEY, JSON.stringify(mapping));
}

/**
 * 清除当前用户 ID
 */
function clearCurrentUserId() {
  localStorage.removeItem(USER_PREFIX_KEY);
}

// ==================== 状态管理 ====================

const LAST_SYNC_TIME_KEY = 'cloudbase_last_sync_time';

let syncStatus = 'idle';
let lastSyncTime = parseInt(localStorage.getItem(LAST_SYNC_TIME_KEY)) || null;
let syncListeners = [];

function getSyncStatus() {
  return { status: syncStatus, lastSyncTime };
}

function onSyncStatusChange(callback) {
  syncListeners.push(callback);
}

function updateSyncStatus(newStatus) {
  syncStatus = newStatus;
  if (newStatus === 'success') {
    lastSyncTime = Date.now();
    localStorage.setItem(LAST_SYNC_TIME_KEY, lastSyncTime.toString());
  }
  syncListeners.forEach(callback => {
    try {
      callback({ status: newStatus, lastSyncTime });
    } catch (e) {
      console.error('[CloudBase Sync] 状态监听器错误:', e);
    }
  });
}

// ==================== 核心：调用云函数（使用 SDK callFunction，已认证）====================

async function callFunction(name, data) {
  // 复用 cloudbase-auth.js 中已登录的 App 实例
  // 该实例已通过 signInWithPassword 完成认证
  const app = window.CloudBaseAuth.getCloudBaseApp();

  if (!window.CloudBaseAuth.isLoggedIn()) {
    throw new Error('用户未登录，无法同步数据');
  }

  try {
    const result = await app.callFunction({
      name: name,
      data: data
    });

    if (result.errCode || result.error) {
      throw new Error(result.errMsg || result.error);
    }

    return result.result;
  } catch (error) {
    console.error(`[CloudBase Sync] 调用云函数 ${name} 失败:`, error);
    throw error;
  }
}

/**
 * 读取当前用户对应的 localStorage 数据（带前缀）
 */
function getLocalData() {
  const data = {};
  for (const [localKey, cloudKey] of Object.entries(SYNC_KEYS)) {
    const prefixedKey = getPrefixedKey(localKey);
    try {
      const value = localStorage.getItem(prefixedKey);
      if (value !== null) {
        try {
          data[cloudKey] = JSON.parse(value);
        } catch {
          data[cloudKey] = value;
        }
      }
    } catch (e) {
      console.warn(`[CloudBase Sync] 读取 ${prefixedKey} 失败:`, e);
    }
  }
  return data;
}

/**
 * 保存数据到当前用户的 localStorage（带前缀）
 */
function saveToLocalStorage(localKey, value) {
  const prefixedKey = getPrefixedKey(localKey);
  try {
    if (typeof value === 'object') {
      localStorage.setItem(prefixedKey, JSON.stringify(value));
    } else {
      localStorage.setItem(prefixedKey, value);
    }
  } catch (e) {
    console.error(`[CloudBase Sync] 保存 ${prefixedKey} 失败:`, e);
  }
}

/**
 * 读取当前用户对应的元数据（带前缀）
 */
function getDataMeta() {
  const metaKey = getPrefixedKey('cloudbase_data_meta');
  try {
    const meta = localStorage.getItem(metaKey);
    return meta ? JSON.parse(meta) : {};
  } catch {
    return {};
  }
}

/**
 * 更新当前用户的元数据修改时间（带前缀）
 */
function updateDataModifiedTime(localKey) {
  const metaKey = getPrefixedKey('cloudbase_data_meta');
  const meta = getDataMeta();
  meta[localKey] = Date.now();
  localStorage.setItem(metaKey, JSON.stringify(meta));
}

/**
 * 更新当前用户多个键的元数据修改时间（带前缀）
 */
function updateMultipleDataModifiedTime(localKeys) {
  const metaKey = getPrefixedKey('cloudbase_data_meta');
  const meta = getDataMeta();
  const now = Date.now();
  for (const key of localKeys) {
    meta[key] = now;
  }
  localStorage.setItem(metaKey, JSON.stringify(meta));
}

/**
 * 清除当前用户的元数据（带前缀）
 */
function clearDataMeta() {
  const metaKey = getPrefixedKey('cloudbase_data_meta');
  localStorage.removeItem(metaKey);
}

// ==================== 同步函数 ====================

async function syncToCloud(userId) {
  if (!window.CloudBaseAuth.isLoggedIn()) {
    return { success: false, error: '用户未登录' };
  }

  updateSyncStatus('syncing');
  try {
    const localData = getLocalData();
    const dataMeta = getDataMeta();

    const result = await callFunction('dataSync', {
      action: 'upload',
      userId: userId,
      localData: localData,
      dataMeta: dataMeta
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    console.log('[CloudBase Sync] 同步到云端成功');
    updateSyncStatus('success');
    return { success: true };
  } catch (error) {
    console.error('[CloudBase Sync] 同步到云端失败:', error);
    updateSyncStatus('error');
    return { success: false, error: error.message };
  }
}

async function syncFromCloud(userId, options = { merge: true }) {
  if (!window.CloudBaseAuth.isLoggedIn()) {
    return { success: false, error: '用户未登录' };
  }

  updateSyncStatus('syncing');
  try {
    const result = await callFunction('dataSync', {
      action: 'download',
      userId: userId
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    if (result.data) {
      const localData = getLocalData();
      for (const [cloudKey, localKey] of Object.entries(
        Object.fromEntries(Object.entries(SYNC_KEYS).map(([k, v]) => [v, k]))
      )) {
        const cloudValue = result.data[cloudKey];
        if (cloudValue !== undefined && cloudValue !== null) {
          if (options.merge && localData[cloudKey] !== undefined) {
            // 合并模式：云端覆盖本地
          }
          const localStorageKey = Object.keys(SYNC_KEYS).find(k => SYNC_KEYS[k] === cloudKey);
          if (localStorageKey) {
            saveToLocalStorage(localStorageKey, cloudValue);
          }
        }
      }
    }

    console.log('[CloudBase Sync] 从云端拉取并合并数据成功');
    updateSyncStatus('success');
    return { success: true, data: result.data || {} };
  } catch (error) {
    console.error('[CloudBase Sync] 从云端拉取数据失败:', error);
    updateSyncStatus('error');
    return { success: false, error: error.message };
  }
}

async function fullSync(userId) {
  if (!window.CloudBaseAuth.isLoggedIn()) {
    return { success: false, error: '用户未登录' };
  }

  updateSyncStatus('syncing');
  try {
    const localData = getLocalData();
    const localMeta = getDataMeta();

    const payload = {
      action: 'fullSync',
      userId: userId,
      localData: localData,
      localMeta: localMeta
    };
    console.log('[CloudBase Sync] 即将调用 dataSync，payload:', JSON.stringify(payload));
    const result = await callFunction('dataSync', payload);

    if (!result.success) {
      throw new Error(result.error);
    }

    // 应用云端胜出的数据到本地
    if (result.cloudWins) {
      for (const [cloudKey, value] of Object.entries(result.cloudWins)) {
        const localKey = Object.keys(SYNC_KEYS).find(k => SYNC_KEYS[k] === cloudKey);
        if (localKey) {
          saveToLocalStorage(localKey, value);
        }
      }
    }

    // 更新元数据
    if (result.dataMeta) {
      localStorage.setItem(getPrefixedKey('cloudbase_data_meta'), JSON.stringify(result.dataMeta));
    }

    console.log(`[CloudBase Sync] 同步完成，action: ${result.action}`);
    updateSyncStatus('success');
    return { success: true, action: result.action || 'none' };
  } catch (error) {
    console.error('[CloudBase Sync] 完整同步失败:', error);
    updateSyncStatus('error');
    return { success: false, error: error.message };
  }
}

// ==================== 便捷函数 ====================

async function syncItemToCloud(userId, localKey) {
  if (!window.CloudBaseAuth.isLoggedIn()) return;

  try {
    const cloudKey = SYNC_KEYS[localKey];
    if (!cloudKey) return;

    const prefixedKey = getPrefixedKey(localKey);
    const value = localStorage.getItem(prefixedKey);
    let parsedValue = value;
    try {
      parsedValue = JSON.parse(value);
    } catch {}

    // 单项同步：读取完整本地数据 + 元数据，调用 fullSync
    const localData = getLocalData();
    const localMeta = getDataMeta();
    await callFunction('dataSync', {
      action: 'fullSync',
      userId: userId,
      localData: localData,
      localMeta: localMeta
    });

    console.log(`[CloudBase Sync] 同步 ${localKey} 到云端成功`);
  } catch (error) {
    console.error(`[CloudBase Sync] 同步 ${localKey} 失败:`, error);
  }
}

function setupAutoSync(userId) {
  if (!userId) return;

  window.addEventListener('storage', (event) => {
    const userId = getCurrentUserId();
    if (!userId) return;
    const expectedPrefix = `app_${userId}_`;
    // 检查是否是当前用户的前缀键，或者旧的无前缀键（触发迁移）
    if (SYNC_KEYS.hasOwnProperty(event.key)) {
      // 旧的无前缀键 -> 触发迁移
      console.log(`[CloudBase Sync] 检测到旧键 ${event.key}，触发迁移...`);
      migrateLegacyDataToCurrentUser();
    } else if (event.key.startsWith(expectedPrefix)) {
      const localKey = event.key.substring(expectedPrefix.length);
      if (SYNC_KEYS.hasOwnProperty(localKey)) {
        syncItemToCloud(userId, localKey);
      }
    }
  });

  console.log('[CloudBase Sync] 自动同步已设置（跨标签页模式）');
}

function clearAutoSync() {
  console.log('[CloudBase Sync] 自动同步已清除');
}

async function clearCloudData(userId) {
  if (!window.CloudBaseAuth.isLoggedIn()) {
    return { success: false, error: '用户未登录' };
  }

  try {
    await callFunction('dataSync', {
      action: 'clear',
      userId: userId
    });
    console.log('[CloudBase Sync] 云端数据已清除');
    return { success: true };
  } catch (error) {
    console.error('[CloudBase Sync] 清除云端数据失败:', error);
    return { success: false, error: error.message };
  }
}

// ==================== 迁移：旧无前缀数据 → 用户前缀 ====================

/**
 * 检查迁移是否已完成（针对指定 userId）
 */
function isLegacyDataMigrated(userId) {
  const done = localStorage.getItem(MIGRATION_DONE_KEY);
  if (!done) return false;
  try {
    const parsed = JSON.parse(done);
    return !!parsed[userId];
  } catch {
    return false;
  }
}

/**
 * 标记迁移已完成
 */
function markLegacyDataMigrated(userId) {
  let done = {};
  try { done = JSON.parse(localStorage.getItem(MIGRATION_DONE_KEY) || '{}'); } catch {}
  done[userId] = true;
  localStorage.setItem(MIGRATION_DONE_KEY, JSON.stringify(done));
}

/**
 * 收集本设备上所有账号（除当前账号外）已认领的键
 * 包括 account_mapping 中记录的键，以及 localStorage 中实际存在的所有前缀键
 * 这些键不能被迁移到当前账号名下
 */
function _getOtherAccountClaimedKeys(currentUserId) {
  const mapping = getAccountMapping();
  const claimedKeys = new Set();

  // 1. account_mapping 中记录的键
  for (const [uid, info] of Object.entries(mapping)) {
    if (uid === currentUserId) continue;
    if (info.keys && Array.isArray(info.keys)) {
      for (const key of info.keys) {
        claimedKeys.add(key);
      }
    }
  }

  // 2. 扫描 localStorage 中所有已存在的 app_${uid}_${localKey} 格式的键
  //    兜底：即使 account_mapping 没记录过，也能识别出哪些键已被其他账号使用
  const currentPrefix = `app_${currentUserId}_`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    // 匹配 app_${uid}_${localKey} 格式，排除当前用户的
    if (key.startsWith('app_') && !key.startsWith(currentPrefix)) {
      // 检查是否符合 app_${任意uid}_${syncKey} 格式
      const match = key.match(/^app_([^_]+)_(.+)$/);
      if (match) {
        const [, uid, suffix] = match;
        if (uid !== currentUserId && SYNC_KEYS.hasOwnProperty(suffix)) {
          claimedKeys.add(key);
          // 同时把无前缀键也标记为已被认领（因为它属于那个账号的前缀键对应的旧键）
          claimedKeys.add(suffix);
        }
      }
    }
  }

  return claimedKeys;
}

/**
 * 将旧无前缀的 localStorage 数据迁移到当前用户的带前缀键
 * 仅当云端为空（新用户）时执行；已同步过的老用户以云端为准
 * 同时：只迁移"无主"的旧键，排除其他账号已认领的键
 * @returns {object} { migrated: boolean, dataCount: number }
 */
/**
 * 检查当前账号是否在本地有未迁移的旧数据
 * 条件：账号从未绑定过旧数据（mapping 中 keys 为空）AND 本地有旧无前缀 key
 * @param {string} userId
 * @returns {boolean}
 */
function checkHasUnmigratedLegacyData(userId) {
    const mapping = getAccountMapping();
    // 账号已有绑定记录，说明不是首次，跳过
    if (mapping[userId] && mapping[userId].keys && mapping[userId].keys.length > 0) {
        return false;
    }
    // 检查本地是否存在旧无前缀 key
    for (const localKey of Object.keys(SYNC_KEYS)) {
        if (localStorage.getItem(localKey) !== null) {
            return true;
        }
    }
    return false;
}

/**
 * 手动触发旧数据迁移（用户点击"绑定"后调用）
 * 将本地所有旧无前缀 key 迁移到当前账号的带前缀 key 下
 * @param {string} userId
 * @returns {object} { migrated: boolean, dataCount: number }
 */
function migrateLegacyDataManually(userId) {
    let count = 0;
    for (const [localKey, cloudKey] of Object.entries(SYNC_KEYS)) {
        const legacyKey = localKey;
        const legacyValue = localStorage.getItem(legacyKey);
        if (legacyValue === null) continue;

        const prefixedKey = `app_${userId}_${localKey}`;
        // 仅当目标键不存在时才迁移
        if (localStorage.getItem(prefixedKey) === null) {
            localStorage.setItem(prefixedKey, legacyValue);
            count++;
            console.log(`[CloudBase Sync] 手动迁移: ${legacyKey} → ${prefixedKey}`);
        }
    }
    if (count > 0) {
        markLegacyDataMigrated(userId);
        _updateAccountMapping(userId);
    }
    console.log(`[CloudBase Sync] 手动迁移完成，共迁移 ${count} 项数据`);
    return { migrated: count > 0, dataCount: count };
}

function migrateLegacyDataToCurrentUser() {
  const userId = getCurrentUserId();
  if (!userId) return { migrated: false, dataCount: 0 };

  const mapping = getAccountMapping();
  // 同一设备上该账号已有数据键，说明不是首次在此设备登录，跳过迁移
  if (mapping[userId] && mapping[userId].keys && mapping[userId].keys.length > 0) {
    console.log('[CloudBase Sync] 该账号在此设备已有数据键，跳过迁移');
    return { migrated: false, dataCount: 0 };
  }

  // 收集其他账号已认领的键，这些键属于其他账号，不迁移
  const otherClaimedKeys = _getOtherAccountClaimedKeys(userId);
  if (otherClaimedKeys.size > 0) {
    console.log(`[CloudBase Sync] 检测到 ${otherClaimedKeys.size} 个键已被其他账号认领，排除迁移`);
  }

  let count = 0;
  for (const [localKey, cloudKey] of Object.entries(SYNC_KEYS)) {
    const legacyKey = localKey; // 无前缀
    const legacyValue = localStorage.getItem(legacyKey);
    if (legacyValue === null) continue;

    // 如果该键已被其他账号认领（说明是那个账号的旧数据），不迁移
    if (otherClaimedKeys.has(legacyKey)) {
      console.log(`[CloudBase Sync] 跳过 ${legacyKey}：已被其他账号认领`);
      continue;
    }

    const prefixedKey = getPrefixedKey(localKey);
    // 仅当目标键不存在时才迁移（避免覆盖已有前缀数据）
    if (localStorage.getItem(prefixedKey) === null) {
      localStorage.setItem(prefixedKey, legacyValue);
      count++;
      console.log(`[CloudBase Sync] 迁移: ${legacyKey} → ${prefixedKey}`);
    }
  }

  if (count > 0) {
    markLegacyDataMigrated(userId);
    // 迁移完成后，更新 account_mapping 中的 keys（此时前缀键已写入 localStorage）
    _updateAccountMapping(userId);
    console.log(`[CloudBase Sync] 迁移完成，共迁移 ${count} 项数据`);
  }

  return { migrated: count > 0, dataCount: count };
}

/**
 * 登录后执行完整的迁移+同步流程
 * @param {string} userId - 当前登录用户 ID
 * @returns {Promise<{ migrated: boolean, syncAction: string }>}
 */
// Deferred 模式：Promise 在页面加载时就创建，确保 loading 页面一定能拿到
let _loginSyncDeferred = null;

function _createLoginSyncDeferred() {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  _loginSyncDeferred = { promise, resolve };
}
// 初始化时就创建，确保任何时候 waitForLoginSyncDone 都能拿到
_createLoginSyncDeferred();

async function migrateAndSyncOnLogin(userId) {
  setCurrentUserId(userId);

  // 获取当前的 Deferred（loading 页面已持有其 promise）
  const deferred = _loginSyncDeferred;

  // 不再自动迁移，改为由用户在对话框中选择后才迁移
  // 全量同步：云端会判断是新用户还是老用户
  const result = await fullSync(userId);

  // 检查本地是否有未迁移的旧数据（用于在登录后弹出绑定对话框）
  const hasUnmigratedLegacyData = checkHasUnmigratedLegacyData(userId);

  const outcome = {
    migrated: false,
    syncAction: result.success ? (result.action || 'none') : 'error',
    hasUnmigratedLegacyData: hasUnmigratedLegacyData
  };

  // 通知等待者（loading 页面）
  if (deferred && typeof deferred.resolve === 'function') {
    deferred.resolve(outcome);
  }
  // 重置，为下一次登录做准备
  _createLoginSyncDeferred();

  return outcome;
}

/**
 * 返回一个 Promise，当登录后的迁移+同步完成后 resolve
 * 专供 loading 页面使用，确保数据就绪后才隐藏 loading
 */
function waitForLoginSyncDone() {
  if (!_loginSyncDeferred) _createLoginSyncDeferred();
  return _loginSyncDeferred.promise;
}

/**
 * 获取本设备上登录过的所有账号 ID 列表
 */
function getLoggedInUserIds() {
  return Object.keys(getAccountMapping());
}

/**
 * 获取某账号的数据键数量（用于判断是否真的在此设备有数据）
 */
function getUserDataKeyCount(userId) {
  let count = 0;
  for (const localKey of Object.keys(SYNC_KEYS)) {
    const prefixedKey = `app_${userId}_${localKey}`;
    if (localStorage.getItem(prefixedKey) !== null) {
      count++;
    }
  }
  return count;
}

// ==================== 导出模块 ====================

window.CloudBaseSync = {
  SYNC_KEYS,
  getSyncStatus,
  onSyncStatusChange,
  syncToCloud,
  syncFromCloud,
  fullSync,
  syncItemToCloud,
  setupAutoSync,
  clearAutoSync,
  clearCloudData,
  getLocalData,
  getCurrentUserId,
  setCurrentUserId,
  getPrefixedKey,
  getAccountMapping,
  clearCurrentUserId,
  migrateLegacyDataToCurrentUser,
  migrateLegacyDataManually,
  checkHasUnmigratedLegacyData,
  migrateAndSyncOnLogin,
  waitForLoginSyncDone,
  isLegacyDataMigrated,
  markLegacyDataMigrated,
  getLoggedInUserIds,
  getUserDataKeyCount
};
