/**
 * CloudBase 认证与数据模块
 * 架构：使用 CloudBase SDK v3 原生认证（signUp + verifyOtp / signInWithPassword）
 * 不再使用匿名登录和自定义 token
 */

const CLOUD_FUNCTIONS = {
  register: 'registerUser',
  login: 'loginUser',
  syncUpload: 'dataSync'
};

let _cloudbaseAppInstance = null;

// ==================== 状态管理 ====================

let currentUser = null;
let authStateListeners = [];

// ==================== 核心：获取 CloudBase App 实例（单例）====================

function getCloudBaseApp() {
  if (_cloudbaseAppInstance) {
    return _cloudbaseAppInstance;
  }
  if (typeof cloudbase === 'undefined') {
    throw new Error('CloudBase SDK 未加载');
  }

  _cloudbaseAppInstance = cloudbase.init({
    env: window.CloudBaseConfig.CLOUD_ENV_ID,
    persistent: false
  });
  console.log('[CloudBase] App 实例创建成功');
  return _cloudbaseAppInstance;
}

// ==================== 认证状态事件 ====================

function notifyAuthStateChange(user) {
  currentUser = user;
  authStateListeners.forEach(callback => {
    try {
      callback(user);
    } catch (e) {
      console.error('[CloudBase] 状态监听器错误:', e);
    }
  });
}

function onAuthStateChange(callback) {
  authStateListeners.push(callback);
  if (currentUser !== undefined) {
    callback(currentUser);
  }
}

function getCurrentUser() {
  return currentUser;
}

function isLoggedIn() {
  return currentUser !== null;
}

// ==================== 初始化 ====================

async function initAuthListener() {
  const savedUser = localStorage.getItem('cb_current_user');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      console.log('[CloudBase] 恢复登录会话:', user.username);
      notifyAuthStateChange(user);
      return;
    } catch (e) {
      console.warn('[CloudBase] 会话恢复失败');
    }
  }
  notifyAuthStateChange(null);
}

// ==================== 核心：调用云函数（使用 SDK callFunction，已认证）====================

async function callFunction(name, data) {
  const app = getCloudBaseApp();

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
    console.error(`[CloudBase] 调用云函数 ${name} 失败:`, error);
    throw error;
  }
}

// ==================== 内部：直接从 storage 读取 verification_token ====================

/**
 * 从浏览器 sessionStorage 读取当前存储的 verification_token
 * 用于在 verifyOtp 成功后绑定密码
 */
async function _getStoredVerificationToken() {
  try {
    const app = getCloudBaseApp();
    const auth = app.auth({ persistence: 'none' });
    // oauthInstance 包含 oauth2client，oauth2client 包含 localCredentials
    const oauth2client = auth?.oauthInstance?.oauth2client;
    if (!oauth2client) return null;
    const stored = oauth2client.localCredentials?.getStorageCredentialsSync?.();
    if (stored?.verification_token) {
      return stored.verification_token;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// ==================== 注册第一步：发送验证码（signUp + verifyOtp）====================

/**
 * 注册第一步：调用 signUp 发送验证码到邮箱
 * 返回 verifyOtp 函数和 pending 数据，用于第二步验证
 */
async function sendRegisterCode(username, password, email) {
  if (!username) {
    return { success: false, error: '用户名不能为空' };
  }
  // 密码由前端负责校验（Step 3 才要求用户输入）
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: '请输入有效的邮箱地址' };
  }

  try {
    const app = getCloudBaseApp();
    const auth = app.auth({ persistence: 'none' });

    const result = await auth.signUp({
      username: username,
      password: password,
      email: email
    });

    if (result == null) {
      console.warn('[CloudBase] signUp 返回 null，验证码可能已发送');
      return {
        success: true,
        verifyOtp: null,
        user: null,
        pendingUsername: username,
        pendingPassword: password,
        pendingEmail: email,
        message: '验证码已发送到您的邮箱，请查收'
      };
    }

    const signUpData = result?.data ?? result;
    const signUpError = result?.error;

    if (signUpError) {
      console.error('[CloudBase] signUp 失败:', signUpError);
      return { success: false, error: signUpError.message || '注册失败，请稍后重试' };
    }

    if (!signUpData) {
      console.warn('[CloudBase] signUp 返回 data 为 null');
      return {
        success: true,
        verifyOtp: null,
        user: null,
        pendingUsername: username,
        pendingPassword: password,
        pendingEmail: email,
        message: '验证码已发送到您的邮箱，请查收'
      };
    }

    console.log('[CloudBase] signUp 成功，data:', signUpData);

    return {
      success: true,
      verifyOtp: typeof signUpData.verifyOtp === 'function' ? signUpData.verifyOtp : null,
      user: signUpData.user || null,
      pendingUsername: username,
      pendingPassword: password,
      pendingEmail: email,
      message: '验证码已发送到您的邮箱，请查收'
    };
  } catch (error) {
    console.error('[CloudBase] signUp 异常:', error);
    return { success: false, error: error.message || '注册失败，请稍后重试' };
  }
}

// ==================== 注册第二步：验证验证码并设置密码 ====================

/**
 * 注册第二步：验证邮箱验证码，完成注册
 * 验证成功后，通过 sudo + setPassword 绑定密码
 */
async function verifyRegisterOtp(verifyOtp, token, pendingUsername, pendingPassword, pendingEmail) {
  if (!token || token.length !== 6) {
    return { success: false, error: '请输入6位验证码' };
  }

  if (!verifyOtp) {
    return { success: false, error: '验证码已过期，请重新注册' };
  }

  try {
    const result = await verifyOtp({ token: token });

    if (result == null) {
      return { success: false, error: '验证失败，服务器未返回响应' };
    }

    const verifyData = result?.data ?? result;
    const verifyError = result?.error;

    if (verifyError) {
      console.error('[CloudBase] OTP 验证失败:', verifyError);
      return { success: false, error: verifyError.message || '验证码错误' };
    }

    // 账号注册成功。现在绑定密码
    // CloudBase signUp(邮箱+验证码) 不自动绑定 password
    // 策略：先用 stored verification_token + sudo + setPassword 绑定
    // 如果失败，再用 resetPasswordForEmail（发第二封邮件）

    console.log('[CloudBase] 注册成功，开始设置密码...');

    const app = getCloudBaseApp();
    const auth = app.auth({ persistence: 'none' });

    // 尝试策略1：从 storage 读取 verification_token，然后用它 sudo
    const storedToken = await _getStoredVerificationToken();
    console.log('[CloudBase] storedToken:', storedToken);

    if (storedToken) {
      try {
        // 策略1：使用 stored verification_token 作为 sudo 凭证
        console.log('[CloudBase] 策略1：尝试用 stored token sudo...');
        const sudoRes = await auth.sudo({ verification_token: storedToken });
        console.log('[CloudBase] sudo 成功:', sudoRes);

        if (sudoRes?.sudo_token) {
          await auth.setPassword({
            new_password: pendingPassword,
            sudo_token: sudoRes.sudo_token
          });
          console.log('[CloudBase] 策略1成功：密码绑定完成');

          const user = {
            uid: verifyData?.user?.uid || verifyData?.uid,
            username: pendingUsername,
            email: pendingEmail
          };
          notifyAuthStateChange(user);
          localStorage.setItem('cb_current_user', JSON.stringify(user));
          return { success: true, user };
        }
      } catch (e) {
        console.warn('[CloudBase] 策略1失败，继续尝试策略2:', e.message || e);
      }
    }

    // 策略2：resetPasswordForEmail（会发第二封邮件验证码）
    console.log('[CloudBase] 策略2：调用 resetPasswordForEmail 发送第二封邮件...');
    const resetResult = await auth.resetPasswordForEmail(pendingEmail);

    if (resetResult?.error) {
      console.error('[CloudBase] resetPasswordForEmail 失败:', resetResult.error);
      return { success: false, error: resetResult.error.message || '设置密码失败' };
    }

    const updateUserFn = resetResult?.data?.updateUser;
    if (typeof updateUserFn !== 'function') {
      console.error('[CloudBase] resetPasswordForEmail 没有返回 updateUser:', resetResult);
      return { success: false, error: '设置密码流程异常，请稍后重试' };
    }

    console.log('[CloudBase] 策略2：请查收第二封邮件中的验证码');
    // 返回特殊标记，让 UI 提示用户输入第二封邮件的验证码
    return {
      success: false,
      error: 'SET_PASSWORD_PENDING_OTP2',
      message: '注册成功！请查收第二封邮件中的验证码完成密码设置',
      verifyOtp2Fn: updateUserFn,
      pendingUsername,
      pendingPassword,
      pendingEmail
    };
  } catch (error) {
    console.error('[CloudBase] 注册验证异常:', error);
    return { success: false, error: error.message || '验证码验证失败' };
  }
}

// ==================== 注册第三步（可选）：输入第二封验证码完成密码绑定 ====================

/**
 * 注册第三步：使用第二封邮件的验证码完成密码设置
 */
async function verifyRegisterOtp2(verifyOtp2Fn, otp2, pendingUsername, pendingPassword, pendingEmail) {
  if (!otp2 || otp2.length !== 6) {
    return { success: false, error: '请输入6位验证码' };
  }

  if (typeof verifyOtp2Fn !== 'function') {
    return { success: false, error: '验证码已过期，请重新注册' };
  }

  try {
    const { data: setPwdResult, error: setPwdError } = await verifyOtp2Fn({
      nonce: otp2,
      password: pendingPassword
    });

    if (setPwdError) {
      console.error('[CloudBase] 设置密码失败:', setPwdError);
      return { success: false, error: setPwdError.message || '设置密码失败' };
    }

    const user = {
      uid: setPwdResult?.user?.uid || setPwdResult?.uid,
      username: pendingUsername,
      email: pendingEmail
    };
    notifyAuthStateChange(user);
    localStorage.setItem('cb_current_user', JSON.stringify(user));
    console.log('[CloudBase] 密码设置成功，注册完成:', user.username);
    return { success: true, user };
  } catch (error) {
    console.error('[CloudBase] 设置密码异常:', error);
    return { success: false, error: error.message || '设置密码失败' };
  }
}

// ==================== 登录（用户名 + 密码）====================

/**
 * 登录：用户名 + 密码
 * 处理 "account first login, password update required" 错误
 */
async function loginWithPassword(username, password) {
  if (!username || !password) {
    return { success: false, error: '用户名和密码不能为空' };
  }

  try {
    const app = getCloudBaseApp();
    const auth = app.auth({ persistence: 'none' });

    const { data: loginData, error } = await auth.signInWithPassword({
      username: username,
      password: password
    });

    if (error) {
      const errorMsg = error?.message || error?.msg || String(error);
      const isFirstLogin = errorMsg.includes('first login') || errorMsg.includes('password update') || errorMsg.includes('password_update');

      if (isFirstLogin) {
        console.log('[CloudBase] 检测到首次登录，尝试设置密码...');
        console.log('[CloudBase] loginData:', loginData);
        console.log('[CloudBase] error:', error);

        // updateUser 可能在 loginData 或 error.data 中
        const updateUserFn = loginData?.updateUser || error?.data?.updateUser;

        if (typeof updateUserFn === 'function') {
          const { data: updateData, error: updateError } = await updateUserFn({
            nonce: password,
            password: password
          });
          if (updateError) {
            console.error('[CloudBase] 设置密码凭据失败:', updateError);
            return { success: false, error: updateError.message || '设置密码失败' };
          }
          const user = {
            uid: updateData?.user?.uid || updateData?.uid,
            username: username,
            email: updateData?.user?.email || ''
          };
          localStorage.setItem('cb_current_user', JSON.stringify(user));
          notifyAuthStateChange(user);
          console.log('[CloudBase] 密码凭据设置成功，登录完成');
          return { success: true, user };
        } else {
          console.error('[CloudBase] 无法找到 updateUser 方法，loginData:', loginData, 'error.data:', error?.data);
          return { success: false, error: '首次登录但无法设置密码，请通过控制台重置密码' };
        }
      }
      console.error('[CloudBase] 登录失败:', error);
      return { success: false, error: error.message || '用户名或密码错误' };
    }

    const user = {
      uid: loginData.user?.uid || loginData.user?.id,
      username: username,
      email: loginData.user?.email || ''
    };
    localStorage.setItem('cb_current_user', JSON.stringify(user));
    notifyAuthStateChange(user);
    console.log('[CloudBase] 登录成功:', username);
    return { success: true, user };
  } catch (error) {
    console.error('[CloudBase] 登录错误:', error);
    return { success: false, error: error.message || '登录失败，请稍后重试' };
  }
}

// ==================== 登出 ====================

async function logout() {
  try {
    const app = getCloudBaseApp();
    const auth = app.auth({ persistence: 'none' });
    await auth.signOut();
  } catch (e) {}

  localStorage.removeItem('cb_current_user');
  // 清除 cloudbase_current_user_id，防止登出后 CloudBaseSync 仍使用旧用户的前缀键
  localStorage.removeItem('cloudbase_current_user_id');
  console.log('[CloudBase] 登出成功');
  notifyAuthStateChange(null);
  return { success: true };
}

async function sendPasswordReset(email) {
  return { success: false, error: '密码重置功能暂未开放' };
}

async function deleteAccount() {
  return { success: false, error: '删除账户功能暂未开放' };
}

// ==================== 导出 ====================

window.CloudBaseAuth = {
  onAuthStateChange,
  getCurrentUser,
  isLoggedIn,
  initAuthListener,
  sendRegisterCode,
  verifyRegisterOtp,
  verifyRegisterOtp2,
  loginWithPassword,
  sendPasswordReset,
  logout,
  deleteAccount,
  getCloudBaseApp
};
