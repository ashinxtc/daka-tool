// ===== 平台与设备检测工具 =====

export const isIOSSafari = () => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) && /WebKit/.test(ua) && !/(CriOS|FxiOS|OPiOS|mercury)/.test(ua);
};

export const isPWAStandalone = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
};
