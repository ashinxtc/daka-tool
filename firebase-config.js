/**
 * Firebase 配置模块
 * 包含敏感信息，请勿上传到公开仓库
 */

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyDJ_gsnG_6yZOB9HvrAN5-TyPfdIVv07qc",
  authDomain: "daka-tool.firebaseapp.com",
  databaseURL: "https://daka-tool-default-rtdb.firebaseio.com",
  projectId: "daka-tool",
  storageBucket: "daka-tool.firebasestorage.app",
  messagingSenderId: "490095368685",
  appId: "1:490095368685:web:0974dcf36e0f6c9866efe4",
  measurementId: "G-PTLLCXMKCZ"
};

// Firebase 服务实例
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseInitialized = false;

/**
 * 初始化 Firebase
 * @returns {Promise<boolean>} 是否初始化成功
 */
async function initFirebase() {
  if (firebaseInitialized) {
    return true;
  }

  try {
    // 检查 Firebase 是否已加载
    if (typeof firebase === 'undefined') {
      console.error('[Firebase] Firebase SDK 未加载');
      return false;
    }

    // 初始化 Firebase
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseAuth = firebase.auth();
    firebaseDb = firebase.database();

    firebaseInitialized = true;
    console.log('[Firebase] 初始化成功');
    return true;
  } catch (error) {
    console.error('[Firebase] 初始化失败:', error);
    return false;
  }
}

/**
 * 获取 Firebase Auth 实例
 */
function getFirebaseAuth() {
  return firebaseAuth;
}

/**
 * 获取 Firebase Realtime Database 实例
 */
function getFirebaseDb() {
  return firebaseDb;
}

/**
 * 检查是否已初始化
 */
function isFirebaseReady() {
  return firebaseInitialized && firebaseAuth !== null;
}

// 导出模块
window.FirebaseConfig = {
  initFirebase,
  getFirebaseAuth,
  getFirebaseDb,
  isFirebaseReady
};
