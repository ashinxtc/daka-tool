import React, { useState, useEffect } from 'react';
import { IconBase } from '../icons';

// ===== 应用内通知 Toast 系统 =====
const _toastListeners = new Set();
let _toastList = [];
let _toastSeq = 0;

export function showToast(type, message, options) {
    if (typeof type === 'string' && !message) { message = type; type = 'info'; }
    type = type || 'info'; message = message || ''; options = options || {};
    const duration = options.duration != null ? options.duration : (type === 'error' || type === 'warning') ? 3500 : 2500;
    const id = ++_toastSeq;
    const toast = { id, type, message, duration, createdAt: Date.now(), exiting: false };
    _toastList = [toast, ..._toastList].slice(0, 10);
    _toastListeners.forEach(fn => fn([..._toastList]));
    setTimeout(() => dismissToast(id), duration);
    return id;
}

export function dismissToast(id) {
    if (!_toastList.find(t => t.id === id && !t.exiting)) return;
    _toastList = _toastList.map(t => t.id === id ? { ...t, exiting: true } : t);
    _toastListeners.forEach(fn => fn([..._toastList]));
    setTimeout(() => { _toastList = _toastList.filter(t => t.id !== id); _toastListeners.forEach(fn => fn([..._toastList])); }, 320);
}

if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.dismissToast = dismissToast;
}

export const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);
    useEffect(() => { _toastListeners.add(setToasts); return () => _toastListeners.delete(setToasts); }, []);
    const visible = toasts.slice(0, 3);
    if (!visible.length) return null;
    return (
        <div className="toast-container" aria-live="polite">
            {visible.map(t => {
                const Icon = ({ type }) => {
                    const icons = {
                        success: <><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></>,
                        error: <><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></>,
                        warning: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
                        info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>
                    };
                    return <IconBase strokeWidth={2.5}>{icons[type] || icons.info}</IconBase>;
                };
                const elapsed = Date.now() - t.createdAt;
                return (
                    <div key={t.id} className={`toast-card toast-type-${t.type} ${t.exiting ? 'toast-exit' : 'toast-enter'}`} onClick={() => dismissToast(t.id)} style={{ '--toast-duration': t.duration + 'ms' }}>
                        <div className="toast-icon-wrap"><Icon type={t.type} /></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="text-[13px] leading-relaxed font-semibold text-gray-700" style={{ margin: 0, wordBreak: 'break-word' }}>
                                {t.message.split('\n').map((line, i) => i === 0 ? line : <span key={i}><br />{line}</span>)}
                            </p>
                        </div>
                        <button aria-label="关闭" style={{ flexShrink: 0, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', background: 'transparent', padding: 0, color: '#9ca3af', marginTop: 2 }} onClick={e => { e.stopPropagation(); dismissToast(t.id); }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12" /></svg>
                        </button>
                        <div className="toast-progress-track"><div className="toast-progress-bar" style={{ animationDelay: '-' + elapsed + 'ms' }} /></div>
                    </div>
                );
            })}
        </div>
    );
};
