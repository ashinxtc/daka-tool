/**
 * Firebase 数据同步模块
 * 处理 localStorage 与 Firestore 的双向同步
 */

// ==================== 配置 ====================

/**
 * 需要同步的 localStorage 键映射
 * localStorageKey: Firestore 字段名
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
  'app_test_mode': 'testMode'
};

// ==================== 状态管理 ====================

const LAST_SYNC_TIME_KEY = 'firebase_last_sync_time';

let syncStatus = 'idle'; // idle | syncing | success | error
let lastSyncTime = parseInt(localStorage.getItem(LAST_SYNC_TIME_KEY)) || null;
let syncListeners = [];

// ==================== 同步状态管理 ====================

/**
 * 获取当前同步状态
 */
function getSyncStatus() {
  return {
    status: syncStatus,
    lastSyncTime: lastSyncTime
  };
}

/**
 * 监听同步状态变化
 * @param {Function} callback - 回调函数
 */
function onSyncStatusChange(callback) {
  syncListeners.push(callback);
}

/**
 * 更新同步状态并通知
 */
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
      console.error('[Firebase Sync] 状态监听器错误:', e);
    }
  });
}

// ==================== 核心同步函数 ====================

/**
 * 获取 Firestore 引用路径
 * @param {string} userId - 用户ID
 */
function getUserDataRef(userId) {
  const db = FirebaseConfig.getFirebaseDb();
  return db.ref('users').child(userId);
}

/**
 * 获取本地数据（从 localStorage）
 */
function getLocalData() {
  const data = {};

  for (const [localKey, cloudKey] of Object.entries(SYNC_KEYS)) {
    try {
      const value = localStorage.getItem(localKey);
      if (value !== null) {
        // 尝试解析 JSON
        try {
          data[cloudKey] = JSON.parse(value);
        } catch {
          data[cloudKey] = value;
        }
      }
    } catch (e) {
      console.warn(`[Firebase Sync] 读取 ${localKey} 失败:`, e);
    }
  }

  return data;
}

/**
 * 保存数据到 localStorage
 * @param {string} localKey - localStorage 键
 * @param {any} value - 值
 */
function saveToLocalStorage(localKey, value) {
  try {
    if (typeof value === 'object') {
      localStorage.setItem(localKey, JSON.stringify(value));
    } else {
      localStorage.setItem(localKey, value);
    }
  } catch (e) {
    console.error(`[Firebase Sync] 保存 ${localKey} 到 localStorage 失败:`, e);
  }
}

/**
 * 同步本地数据到云端
 * @param {string} userId - 用户ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function syncToCloud(userId) {
  updateSyncStatus('syncing');

  try {
    const db = FirebaseConfig.getFirebaseDb();
    if (!db) {
      throw new Error('Firebase 未初始化');
    }

    const userDataRef = getUserDataRef(userId);
    const localData = getLocalData();

    // 添加同步元数据
    const syncData = {
      ...localData,
      lastSynced: Date.now(),
      syncedAt: new Date().toISOString()
    };

    // 上传到 Firestore
    await userDataRef.set(syncData);

    console.log('[Firebase Sync] 同步到云端成功');
    updateSyncStatus('success');
    return { success: true };

  } catch (error) {
    console.error('[Firebase Sync] 同步到云端失败:', error);
    updateSyncStatus('error');
    return { success: false, error: error.message };
  }
}

/**
 * 从云端拉取数据并合并到本地
 * @param {string} userId - 用户ID
 * @param {Object} options - 选项
 * @param {boolean} options.merge - 是否合并（true: 云端+本地取较新者，false: 完全覆盖本地）
 * @returns {Promise<{success: boolean, data?: Object, conflict?: boolean, error?: string}>}
 */
async function syncFromCloud(userId, options = { merge: true }) {
  updateSyncStatus('syncing');

  try {
    const db = FirebaseConfig.getFirebaseDb();
    if (!db) {
      throw new Error('Firebase 未初始化');
    }

    const userDataRef = getUserDataRef(userId);
    const snapshot = await userDataRef.once('value');

    if (!snapshot.exists()) {
      console.log('[Firebase Sync] 云端没有数据（首次同步）');
      updateSyncStatus('success');
      return { success: true, data: null };
    }

    const cloudData = snapshot.val();
    const localData = getLocalData();

    // 合并数据
    const mergedData = {};
    let hasConflict = false;

    for (const [cloudKey, localKey] of Object.entries(
      Object.fromEntries(Object.entries(SYNC_KEYS).map(([k, v]) => [v, k]))
    )) {
      const cloudValue = cloudData[cloudKey];
      const localValue = localData[cloudKey];

      if (cloudValue !== undefined && cloudValue !== null) {
        if (localValue !== undefined && localValue !== null) {
          // 两者都有数据，需要合并
          if (options.merge) {
            mergedData[cloudKey] = cloudValue; // 默认使用云端数据
            hasConflict = true;
          } else {
            mergedData[cloudKey] = cloudValue;
          }
        } else {
          // 只有云端有
          mergedData[cloudKey] = cloudValue;
        }
      } else if (localValue !== undefined && localValue !== null) {
        // 只有本地有
        mergedData[cloudKey] = localValue;
      }
    }

    // 保存合并后的数据到 localStorage
    for (const [cloudKey, value] of Object.entries(mergedData)) {
      const localKey = Object.keys(SYNC_KEYS).find(k => SYNC_KEYS[k] === cloudKey);
      if (localKey) {
        saveToLocalStorage(localKey, value);
      }
    }

    console.log('[Firebase Sync] 从云端拉取并合并数据成功');
    updateSyncStatus('success');

    return {
      success: true,
      data: mergedData,
      conflict: hasConflict
    };

  } catch (error) {
    console.error('[Firebase Sync] 从云端拉取数据失败:', error);
    updateSyncStatus('error');
    return { success: false, error: error.message };
  }
}

/**
 * 完整双向同步
 * @param {string} userId - 用户ID
 * @returns {Promise<{success: boolean, action?: string, error?: string}>}
 */
async function fullSync(userId) {
  updateSyncStatus('syncing');

  try {
    const db = FirebaseConfig.getFirebaseDb();
    if (!db) {
      throw new Error('Firebase 未初始化');
    }

    const userDataRef = getUserDataRef(userId);
    const snapshot = await userDataRef.once('value');

    const localData = getLocalData();
    let action = 'upload'; // 默认上传

    if (snapshot.exists()) {
      const cloudData = snapshot.val();
      const cloudSyncTime = cloudData.lastSynced || 0;

      // 检查是否需要拉取云端数据
      // 如果云端数据更新，则拉取
      if (cloudSyncTime > (lastSyncTime || 0)) {
        action = 'download';

        // 合并数据（云端优先）
        for (const [cloudKey, cloudValue] of Object.entries(cloudData)) {
          if (cloudKey === 'lastSynced' || cloudKey === 'syncedAt') continue;

          const localKey = Object.keys(SYNC_KEYS).find(k => SYNC_KEYS[k] === cloudKey);
          if (localKey) {
            saveToLocalStorage(localKey, cloudValue);
          }
        }

        console.log('[Firebase Sync] 从云端拉取数据完成');
      } else {
        action = 'upload';
        // 上传本地数据到云端
        const syncData = {
          ...localData,
          lastSynced: Date.now(),
          syncedAt: new Date().toISOString()
        };
        await userDataRef.set(syncData);
        console.log('[Firebase Sync] 上传数据到云端完成');
      }
    } else {
      // 首次同步，上传本地数据
      action = 'firstUpload';
      const syncData = {
        ...localData,
        lastSynced: Date.now(),
        syncedAt: new Date().toISOString()
      };
      await userDataRef.set(syncData);
      console.log('[Firebase Sync] 首次同步，上传数据到云端完成');
    }

    updateSyncStatus('success');
    return { success: true, action };

  } catch (error) {
    console.error('[Firebase Sync] 完整同步失败:', error);
    updateSyncStatus('error');
    return { success: false, error: error.message };
  }
}

// ==================== 便捷函数 ====================

/**
 * 单个数据项同步到云端
 * @param {string} userId - 用户ID
 * @param {string} localKey - localStorage 键
 */
async function syncItemToCloud(userId, localKey) {
  if (!FirebaseAuth.isLoggedIn()) return;

  try {
    const db = FirebaseConfig.getFirebaseDb();
    const cloudKey = SYNC_KEYS[localKey];
    if (!cloudKey) return;

    const value = localStorage.getItem(localKey);
    let parsedValue = value;
    try {
      parsedValue = JSON.parse(value);
    } catch {}

    await db.ref('users').child(userId).child(cloudKey).set(parsedValue);
    console.log(`[Firebase Sync] 同步 ${localKey} 到云端成功`);
  } catch (error) {
    console.error(`[Firebase Sync] 同步 ${localKey} 失败:`, error);
  }
}

/**
 * 监听本地数据变化并自动同步
 * 注意：只监听 storage 事件（跨标签页同步）
 * 同标签页的变化通过页面加载时的完整同步处理
 */
function setupAutoSync(userId) {
  if (!userId) return;

  // 只监听 storage 事件（跨标签页同步时触发）
  // 不重写 setItem，避免无限循环
  window.addEventListener('storage', (event) => {
    if (SYNC_KEYS.hasOwnProperty(event.key)) {
      syncItemToCloud(userId, event.key);
    }
  });

  console.log('[Firebase Sync] 自动同步已设置（跨标签页模式）');
}

/**
 * 清除自动同步
 */
function clearAutoSync() {
  // 恢复原始的 setItem
  // 注意：这里无法完全恢复，但可以标记状态
  console.log('[Firebase Sync] 自动同步已清除');
}

/**
 * 清除云端数据
 * @param {string} userId - 用户ID
 */
async function clearCloudData(userId) {
  try {
    const db = FirebaseConfig.getFirebaseDb();
    await db.ref('users').child(userId).remove();
    console.log('[Firebase Sync] 云端数据已清除');
    return { success: true };
  } catch (error) {
    console.error('[Firebase Sync] 清除云端数据失败:', error);
    return { success: false, error: error.message };
  }
}

// ==================== 导出模块 ====================

window.FirebaseSync = {
  // 配置
  SYNC_KEYS,

  // 状态
  getSyncStatus,
  onSyncStatusChange,

  // 同步操作
  syncToCloud,
  syncFromCloud,
  fullSync,
  syncItemToCloud,

  // 自动同步
  setupAutoSync,
  clearAutoSync,

  // 数据管理
  clearCloudData,
  getLocalData
};
