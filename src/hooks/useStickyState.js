import { useState, useEffect, useRef } from 'react';

// --- 自定义 Hook：持久化 State ---
// 全局 pending 写入注册表，用于 beforeunload 刷新（S1: 使用 window 持久化）
if (typeof window !== 'undefined') {
    if (!window._pendingWrites) window._pendingWrites = {};
    if (!window._stickyStateFlushRegistered) {
        window._stickyStateFlushRegistered = true;
        window.addEventListener('beforeunload', () => {
            Object.entries(window._pendingWrites).forEach(([k, v]) => {
                try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
            });
        });
    }
}

// === 逐 key 版本表：记录每个 app_* key 最后一次本地修改的时间戳 ===
// 同步合并时按 key 比版本（而非整包比时间戳），避免"改了 A 的设备覆盖了别人改的 B"
export const markKeyVersion = (key) => {
    try {
        const versions = JSON.parse(localStorage.getItem('_key_versions') || '{}');
        versions[key] = Date.now();
        localStorage.setItem('_key_versions', JSON.stringify(versions));
    } catch (e) {}
};

if (typeof window !== 'undefined') {
    window._markKeyVersion = markKeyVersion; // 供 useStickyState 之外的直写点调用
}

export const useStickyState = (defaultValue, key) => {
    const [value, setValue] = useState(() => {
        try {
            const stickyValue = localStorage.getItem(key);
            return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    });
    const timerRef = useRef(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        if (typeof window !== 'undefined' && window._syncReloading) return; // 同步重载期间不写入，防止覆盖云端数据
        if (timerRef.current) clearTimeout(timerRef.current);
        if (typeof window !== 'undefined') {
            window._pendingWrites[key] = value; // 注册 pending 写入
        }
        timerRef.current = setTimeout(() => {
            try {
                window.localStorage.setItem(key, JSON.stringify(value));
                markKeyVersion(key); // 记录本地修改版本（同步合并用）
                if (typeof window !== 'undefined') {
                    delete window._pendingWrites[key]; // 写入完成，清除 pending
                }
            } catch (error) {
                console.error(`Error setting localStorage key "${key}":`, error);
                if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    if (typeof window !== 'undefined' && !window._quotaAlertShown) {
                        window._quotaAlertShown = true;
                        alert("【严重警告】本地存储空间已满（通常限制为5MB）！\n\n您刚刚产生的新进度可能无法保存。请立即前往设置：\n1. 导出当前数据作为备份\n2. 尝试清理其他无用站点的缓存数据");
                    }
                }
            }
        }, 400);
        return () => {
            clearTimeout(timerRef.current);
            if (typeof window !== 'undefined') {
                delete window._pendingWrites[key];
            }
        };
    }, [key, value]);

    // 监听云端同步合并事件，从 localStorage 刷新 state 而无需 reload
    useEffect(() => {
        const handler = () => {
            try {
                const fresh = localStorage.getItem(key);
                if (fresh !== null) {
                    setValue(JSON.parse(fresh));
                }
            } catch (e) {}
        };
        window.addEventListener('_syncDataMerged', handler);
        return () => window.removeEventListener('_syncDataMerged', handler);
    }, [key]);

    return [value, setValue];
};
