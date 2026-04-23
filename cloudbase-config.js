/**
 * CloudBase 配置模块
 * SDK 初始化入口
 */

const CLOUD_ENV_ID = 'daka-tool-0gk8vkbx7551254c';

const cloudbaseConfig = {
  env: CLOUD_ENV_ID
};

let cloudbaseInitialized = false;

/**
 * 初始化 CloudBase SDK（只是标记状态，实际由各模块自己初始化）
 */
async function initCloudBase() {
  if (cloudbaseInitialized) {
    return true;
  }

  try {
    if (typeof cloudbase === 'undefined') {
      console.error('[CloudBase] CloudBase SDK 未加载');
      return false;
    }

    cloudbaseInitialized = true;
    console.log('[CloudBase] SDK 已加载');
    return true;
  } catch (error) {
    console.error('[CloudBase] 初始化失败:', error);
    return false;
  }
}

/**
 * 检查 SDK 是否已加载
 */
function isCloudBaseReady() {
  return cloudbaseInitialized && typeof cloudbase !== 'undefined';
}

// 导出模块
window.CloudBaseConfig = {
  CLOUD_ENV_ID,
  initCloudBase,
  isCloudBaseReady
};
