/**
 * Firebase 认证模块
 * 处理用户登录、注册、登出功能
 */

// ==================== 状态管理 ====================

let currentUser = null;
let authStateListeners = [];

/**
 * 触发认证状态变化事件
 */
function notifyAuthStateChange(user) {
  currentUser = user;
  authStateListeners.forEach(callback => {
    try {
      callback(user);
    } catch (e) {
      console.error('[Firebase Auth] 状态监听器错误:', e);
    }
  });
}

// ==================== 认证状态监听 ====================

/**
 * 监听认证状态变化
 * @param {Function} callback - 状态变化时的回调函数，参数为 user 对象（null 表示未登录）
 */
function onAuthStateChange(callback) {
  authStateListeners.push(callback);

  // 立即触发一次（如果已初始化）
  if (currentUser !== undefined) {
    callback(currentUser);
  }
}

/**
 * 获取当前用户
 */
function getCurrentUser() {
  return currentUser;
}

/**
 * 检查是否已登录
 */
function isLoggedIn() {
  return currentUser !== null;
}

// ==================== 初始化认证监听 ====================

/**
 * 初始化认证状态监听（需要在 Firebase 初始化后调用）
 */
function initAuthListener() {
  const auth = FirebaseConfig.getFirebaseAuth();
  if (!auth) {
    console.error('[Firebase Auth] Auth 实例未初始化');
    return;
  }

  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('[Firebase Auth] 用户已登录:', user.email);
      notifyAuthStateChange(user);
    } else {
      console.log('[Firebase Auth] 用户已登出');
      notifyAuthStateChange(null);
    }
  });
}

// ==================== 登录注册功能 ====================

/**
 * 注册新用户
 * @param {string} email - 邮箱地址
 * @param {string} password - 密码
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
async function registerWithEmail(email, password) {
  const auth = FirebaseConfig.getFirebaseAuth();
  if (!auth) {
    return { success: false, error: 'Firebase 未初始化' };
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: '请输入有效的邮箱地址' };
  }

  // 验证密码强度
  if (password.length < 6) {
    return { success: false, error: '密码长度至少为 6 个字符' };
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    console.log('[Firebase Auth] 注册成功:', userCredential.user.email);

    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified
      }
    };
  } catch (error) {
    console.error('[Firebase Auth] 注册失败:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
}

/**
 * 使用邮箱密码登录
 * @param {string} email - 邮箱地址
 * @param {string} password - 密码
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
async function loginWithEmail(email, password) {
  const auth = FirebaseConfig.getFirebaseAuth();
  if (!auth) {
    return { success: false, error: 'Firebase 未初始化' };
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: '请输入有效的邮箱地址' };
  }

  if (!password) {
    return { success: false, error: '请输入密码' };
  }

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('[Firebase Auth] 登录成功:', userCredential.user.email);

    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified
      }
    };
  } catch (error) {
    console.error('[Firebase Auth] 登录失败:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
}

/**
 * 发送密码重置邮件
 * @param {string} email - 邮箱地址
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendPasswordReset(email) {
  const auth = FirebaseConfig.getFirebaseAuth();
  if (!auth) {
    return { success: false, error: 'Firebase 未初始化' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: '请输入有效的邮箱地址' };
  }

  try {
    await auth.sendPasswordResetEmail(email);
    console.log('[Firebase Auth] 密码重置邮件已发送:', email);
    return { success: true };
  } catch (error) {
    console.error('[Firebase Auth] 发送密码重置邮件失败:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
}

/**
 * 登出当前用户
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function logout() {
  const auth = FirebaseConfig.getFirebaseAuth();
  if (!auth) {
    return { success: false, error: 'Firebase 未初始化' };
  }

  try {
    await auth.signOut();
    console.log('[Firebase Auth] 登出成功');
    return { success: true };
  } catch (error) {
    console.error('[Firebase Auth] 登出失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 删除当前用户账户
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteAccount() {
  const auth = FirebaseConfig.getFirebaseAuth();
  const user = auth.currentUser;

  if (!user) {
    return { success: false, error: '没有登录的用户' };
  }

  try {
    await user.delete();
    console.log('[Firebase Auth] 账户已删除');
    return { success: true };
  } catch (error) {
    console.error('[Firebase Auth] 删除账户失败:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
}

// ==================== 工具函数 ====================

/**
 * 转换 Firebase 错误代码为中文提示
 * @param {string} errorCode - Firebase 错误代码
 * @returns {string} 中文错误消息
 */
function getAuthErrorMessage(errorCode) {
  const errorMessages = {
    'auth/email-already-in-use': '该邮箱已被注册',
    'auth/invalid-email': '邮箱格式不正确',
    'auth/operation-not-allowed': '邮箱/密码登录未启用，请在 Firebase 控制台开启',
    'auth/weak-password': '密码强度太弱',
    'auth/user-disabled': '该账户已被禁用',
    'auth/user-not-found': '该邮箱未注册',
    'auth/wrong-password': '密码错误',
    'auth/invalid-credential': '邮箱或密码错误',
    'auth/too-many-requests': '操作过于频繁，请稍后再试',
    'auth/network-request-failed': '网络连接失败，请检查网络',
    'auth/invalid-action-code': '链接已失效或已使用',
    'auth/expired-action-code': '链接已过期'
  };

  return errorMessages[errorCode] || '操作失败，请稍后重试';
}

// ==================== 导出模块 ====================

window.FirebaseAuth = {
  // 状态管理
  onAuthStateChange,
  getCurrentUser,
  isLoggedIn,

  // 初始化
  initAuthListener,

  // 认证功能
  registerWithEmail,
  loginWithEmail,
  sendPasswordReset,
  logout,
  deleteAccount
};
