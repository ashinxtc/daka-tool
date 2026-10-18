// 跨沙盒与多入口设备硬件识别与聚合工具
// 用于在纯 Web 环境下（微信内置浏览器 vs 系统自带 Safari/Chrome）识别同一台物理手机，
// 并将多端入口凭据聚合为单台家长设备，避免产生多条重复绑定记录。

export function hashString(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}

/**
 * 提取跨浏览器沙盒恒定一致的物理硬件特征，计算设备指纹
 */
export function getDeviceFingerprint() {
    if (typeof window === 'undefined') return 'fp_node_env';
    try {
        const parts = [];
        // 1. 物理屏幕真实几何（不受横竖屏旋转影响）
        const scr = window.screen;
        if (scr) {
            const w = Math.max(scr.width || 0, scr.height || 0);
            const h = Math.min(scr.width || 0, scr.height || 0);
            const dpr = window.devicePixelRatio || 1;
            const depth = scr.colorDepth || 24;
            parts.push(`scr:${w}x${h}@${dpr}x${depth}`);
        }
        // 2. 系统硬件并发与特性
        const nav = window.navigator;
        if (nav) {
            const cores = nav.hardwareConcurrency || 4;
            const touch = nav.maxTouchPoints || 0;
            const isIOS = /iPhone|iPad|iPod/.test(nav.userAgent);
            const isAndroid = /Android/.test(nav.userAgent);
            const platform = isIOS ? 'iOS' : isAndroid ? 'Android' : /Macintosh|Mac OS/.test(nav.userAgent) ? 'macOS' : /Windows/.test(nav.userAgent) ? 'Windows' : 'other';
            parts.push(`hw:${cores}:${touch}:${platform}`);
        }
        // 3. 时区
        try {
            const tz = Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || '';
            if (tz) parts.push(`tz:${tz}`);
        } catch (e) {}
        // 4. WebGL GPU 硬件芯片渲染器标识（同设备跨 WebView/Safari 高度特异且恒定）
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
                    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
                    if (renderer || vendor) parts.push(`gpu:${vendor}_${renderer}`);
                }
            }
        } catch (e) {}
        // 5. Canvas 2D 硬件栅格化渲染特征
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 160;
            canvas.height = 40;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.textBaseline = 'top';
                ctx.font = '14px Arial';
                ctx.fillStyle = '#f60';
                ctx.fillRect(10, 5, 60, 20);
                ctx.fillStyle = '#069';
                ctx.fillText('daka_parent_fp', 12, 10);
                parts.push(`can:${hashString(canvas.toDataURL())}`);
            }
        } catch (e) {}

        const raw = parts.join('|');
        return `fp_${hashString(raw)}`;
    } catch (e) {
        return 'fp_fallback';
    }
}

/**
 * 获取当前设备运行的操作系统与浏览器环境信息
 */
export function getDevicePlatformInfo() {
    if (typeof window === 'undefined') {
        return { osName: '移动设备', isWeChat: false, envName: '系统浏览器', platformKey: 'browser' };
    }
    const ua = navigator.userAgent || '';
    const isWeChat = /MicroMessenger/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const osName = isIOS ? (ua.includes('iPad') ? 'iPad' : 'iPhone') :
                   isAndroid ? '安卓手机' : '移动设备';
    const envName = isWeChat ? '微信内置' : '系统浏览器';
    const platformKey = isWeChat ? 'wechat' : 'browser';
    return { osName, isWeChat, envName, platformKey };
}

/**
 * 提取所有合法设备的 ID 集合（支持 deviceId、authorizedDeviceIds 数组及 fingerprint）
 */
export function getValidDeviceIdsSet(devices = []) {
    const set = new Set();
    if (!Array.isArray(devices)) return set;
    for (const d of devices) {
        if (!d) continue;
        if (d.deviceId) set.add(d.deviceId);
        if (Array.isArray(d.authorizedDeviceIds)) {
            for (const id of d.authorizedDeviceIds) {
                if (id) set.add(id);
            }
        }
        if (d.fingerprint) set.add(d.fingerprint);
    }
    return set;
}

/**
 * 检查指定设备（deviceId / fingerprint）是否属于已授权家长设备，且未被解绑
 */
export function isAuthorizedParentDevice(authConfig, { deviceId, fingerprint } = {}) {
    if (!authConfig) return false;
    const revokedMap = authConfig.revokedDevices || {};
    if (deviceId && revokedMap[deviceId]) return false;
    if (fingerprint && revokedMap[fingerprint]) return false;

    const devices = authConfig.devices || [];
    if (!devices.length) return false;

    return devices.some(d => {
        if (!d) return false;
        if (deviceId && (d.deviceId === deviceId || (Array.isArray(d.authorizedDeviceIds) && d.authorizedDeviceIds.includes(deviceId)))) {
            return true;
        }
        if (fingerprint && d.fingerprint === fingerprint) {
            return true;
        }
        return false;
    });
}

/**
 * 智能合并同一物理手机的不同入口（如微信扫码 vs 相机/Safari扫码）
 * 返回合并去重后的 devices 数组与当前生效的设备记录
 */
export function mergeParentDevices(existingDevices = [], incoming) {
    const devices = Array.isArray(existingDevices) ? [...existingDevices] : [];
    const incomingDevId = incoming.deviceId;
    const incomingFingerprint = incoming.fingerprint || getDeviceFingerprint();
    const incomingPlatform = incoming.platform || 'browser';
    const incomingRole = incoming.role || '爸爸';
    const incomingOs = incoming.osName || 'iPhone';

    // 查找是否已有同一台物理手机或同一角色的设备
    // 匹配条件：1) 硬件指纹相同，或 2) 凭据已包含该 devId，或 3) 角色相同且设备大类相同
    const matchIndex = devices.findIndex(d => {
        if (!d) return false;
        if (d.deviceId === incomingDevId) return true;
        if (Array.isArray(d.authorizedDeviceIds) && d.authorizedDeviceIds.includes(incomingDevId)) return true;
        if (incomingFingerprint && d.fingerprint && d.fingerprint === incomingFingerprint) return true;
        // 同一家庭中同一角色（如“爸爸”）且设备型号大类一致（如都是 iPhone），判定为同机重新扫码或换入口
        if (d.role === incomingRole && d.deviceName && d.deviceName.includes(incomingOs)) return true;
        return false;
    });

    if (matchIndex >= 0) {
        const existing = devices[matchIndex];
        const allAuthorizedIds = Array.from(new Set([
            ...(existing.authorizedDeviceIds || [existing.deviceId]),
            incomingDevId
        ].filter(Boolean)));

        const existingPlatforms = Array.isArray(existing.platforms) ? existing.platforms :
            (existing.deviceName?.includes('微信') ? ['wechat'] : ['browser']);
        const updatedPlatforms = Array.from(new Set([...existingPlatforms, incomingPlatform]));

        let platformDesc = '系统浏览器';
        if (updatedPlatforms.includes('wechat') && updatedPlatforms.includes('browser')) {
            platformDesc = '微信 + 系统浏览器';
        } else if (updatedPlatforms.includes('wechat')) {
            platformDesc = '微信内置';
        }

        const mergedDevice = {
            ...existing,
            deviceId: incomingDevId,
            authorizedDeviceIds: allAuthorizedIds,
            fingerprint: incomingFingerprint,
            role: incomingRole,
            deviceName: `${incomingOs} (${platformDesc})`,
            platforms: updatedPlatforms,
            boundAt: existing.boundAt || incoming.boundAt || Date.now(),
            lastActive: Date.now()
        };

        devices[matchIndex] = mergedDevice;
        return { devices, currentDevice: mergedDevice, merged: true };
    }

    // 全新设备
    const newDevice = {
        deviceId: incomingDevId,
        authorizedDeviceIds: [incomingDevId],
        fingerprint: incomingFingerprint,
        role: incomingRole,
        deviceName: `${incomingOs} (${incomingPlatform === 'wechat' ? '微信内置' : '系统浏览器'})`,
        platforms: [incomingPlatform],
        boundAt: incoming.boundAt || Date.now(),
        lastActive: Date.now()
    };

    devices.push(newDevice);
    return { devices, currentDevice: newDevice, merged: false };
}

/**
 * 对已有存量设备列表进行智能聚合去重（用于平滑迁移老数据）
 * 如果列表中已存在同角色、同机型的设备（例如一个为微信内置，另一个为系统浏览器），
 * 自动合并为一条，并将各自的 deviceId 汇总到 authorizedDeviceIds 中，保证历史所有互动记录完全有效。
 */
export function consolidateLegacyDevices(devices = []) {
    if (!Array.isArray(devices) || devices.length <= 1) return devices;

    const consolidated = [];
    for (const dev of devices) {
        if (!dev || !dev.deviceId) continue;

        // 查找已有合并项
        const existingIndex = consolidated.findIndex(item => {
            // 1. 硬件指纹相同
            if (dev.fingerprint && item.fingerprint && dev.fingerprint === item.fingerprint) return true;
            // 2. 凭据互相包含
            if (item.deviceId === dev.deviceId) return true;
            if (Array.isArray(item.authorizedDeviceIds) && item.authorizedDeviceIds.includes(dev.deviceId)) return true;
            if (Array.isArray(dev.authorizedDeviceIds) && dev.authorizedDeviceIds.includes(item.deviceId)) return true;
            // 3. 存量兼容：同角色、同机型大类（如都是爸爸的 iPhone）
            const itemOs = (item.deviceName || '').replace(/\s*\(.*\)/, '').trim();
            const devOs = (dev.deviceName || '').replace(/\s*\(.*\)/, '').trim();
            if (item.role && dev.role && item.role === dev.role && itemOs && devOs && itemOs === devOs) {
                return true;
            }
            return false;
        });

        if (existingIndex >= 0) {
            const existing = consolidated[existingIndex];
            const allIds = Array.from(new Set([
                ...(existing.authorizedDeviceIds || [existing.deviceId]),
                ...(dev.authorizedDeviceIds || [dev.deviceId])
            ].filter(Boolean)));

            const existingPlatforms = Array.isArray(existing.platforms) ? existing.platforms :
                (existing.deviceName?.includes('微信') ? ['wechat'] : ['browser']);
            const devPlatforms = Array.isArray(dev.platforms) ? dev.platforms :
                (dev.deviceName?.includes('微信') ? ['wechat'] : ['browser']);
            const mergedPlatforms = Array.from(new Set([...existingPlatforms, ...devPlatforms]));

            let platformDesc = '系统浏览器';
            if (mergedPlatforms.includes('wechat') && mergedPlatforms.includes('browser')) {
                platformDesc = '微信 + 系统浏览器';
            } else if (mergedPlatforms.includes('wechat')) {
                platformDesc = '微信内置';
            }

            const cleanOs = (existing.deviceName || dev.deviceName || '手机设备').replace(/\s*\(.*\)/, '').trim();

            consolidated[existingIndex] = {
                ...existing,
                authorizedDeviceIds: allIds,
                fingerprint: existing.fingerprint || dev.fingerprint || undefined,
                role: existing.role || dev.role,
                deviceName: `${cleanOs} (${platformDesc})`,
                platforms: mergedPlatforms,
                boundAt: Math.min(existing.boundAt || Date.now(), dev.boundAt || Date.now()),
                lastActive: Math.max(existing.lastActive || 0, dev.lastActive || 0) || Date.now()
            };
        } else {
            const platforms = Array.isArray(dev.platforms) ? dev.platforms :
                (dev.deviceName?.includes('微信') ? ['wechat'] : ['browser']);
            const allIds = Array.from(new Set([
                ...(dev.authorizedDeviceIds || [dev.deviceId])
            ].filter(Boolean)));

            consolidated.push({
                ...dev,
                authorizedDeviceIds: allIds,
                platforms
            });
        }
    }

    return consolidated;
}

