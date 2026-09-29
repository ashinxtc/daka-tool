import React, { createContext, useState, useEffect } from 'react';

export const PerformanceContext = createContext({ isLowPerf: false, setIsLowPerf: () => {} });

// 性能模式 Provider — 读取自动检测结果并提供给整个组件树
export const PerformanceProvider = ({ children }) => {
    const [isLowPerf, setIsLowPerf] = useState(() => (typeof window !== 'undefined' ? window.__lowPerf : false) || false);
    useEffect(() => {
        // 监听自动检测完成（FPS 测试可能延迟）
        const check = () => {
            if (typeof window !== 'undefined' && window.__lowPerf !== isLowPerf) {
                setIsLowPerf(window.__lowPerf);
            }
        };
        const timer = setTimeout(check, 3500);
        return () => clearTimeout(timer);
    }, [isLowPerf]);
    // 同步 CSS class
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.body.classList.toggle('low-perf-mode', isLowPerf);
        }
        if (typeof window !== 'undefined') {
            window.__lowPerf = isLowPerf;
        }
    }, [isLowPerf]);
    return (
        <PerformanceContext.Provider value={{ isLowPerf, setIsLowPerf }}>
            {children}
        </PerformanceContext.Provider>
    );
};
