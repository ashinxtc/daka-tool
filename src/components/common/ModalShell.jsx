import React from 'react';
import { XIcon } from '../icons';

// ===== 可复用模态框壳组件 =====
// 用法：<ModalShell show={show} onClose={onClose} theme={theme} title="标题" icon="🎉" maxWidth="max-w-3xl" size="lg">
//          <div>内容...</div>
//        </ModalShell>
export const ModalShell = ({ show, onClose, theme, title, icon, children, maxWidth = 'max-w-sm', size = 'md', zIndex = 'z-50', backdrop = 'bg-black/60', extraHeader, footer, className = '', panelClassName = '' }) => {
    if (!show) return null;
    const sizeClass = size === 'lg' ? 'max-h-[90vh]' : size === 'sm' ? '' : 'max-h-[85vh]';
    return (
        <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 ${backdrop} backdrop-blur-sm ${className}`} onClick={onClose}>
            <div className={`bg-white rounded-3xl w-full ${maxWidth} ${sizeClass} shadow-2xl flex flex-col overflow-hidden ${panelClassName}`} onClick={e => e.stopPropagation()}>
                {title && (
                    <div className={`p-4 bg-gradient-to-r ${theme.gradient} text-white flex justify-between items-center shrink-0 shadow-lg`}>
                        <div>
                            <h2 className="text-lg font-bold flex items-center gap-2">{icon} {title}</h2>
                            {extraHeader}
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto">{children}</div>
                {footer}
            </div>
        </div>
    );
};
