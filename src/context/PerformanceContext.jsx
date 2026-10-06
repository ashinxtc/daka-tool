import React, { createContext, useState, useEffect } from 'react';

export const PerformanceContext = createContext({ 
    isLowPerf: false, 
    setIsLowPerf: () => {},
    perfMode: 'auto',
    setPerfMode: () => {},
    autoDetected: false,
    signals: 0
});

// 性能模式 Provider — 读取自动检测结果并提供给整个组件树
export const PerformanceProvider = ({ children }) => {
    const [perfMode, setPerfModeState] = useState(() => {
        try {
            const saved = localStorage.getItem('low_perf_manual');
            if (saved === 'true') return 'enabled';
            if (saved === 'false') return 'disabled';
            return 'auto';
        } catch {
            return 'auto';
        }
    });

    const [autoDetected, setAutoDetected] = useState(() => (typeof window !== 'undefined' ? window.__lowPerfAuto : false) || false);
    const [signals, setSignals] = useState(() => (typeof window !== 'undefined' ? window.__lowPerfSignals : 0) || 0);

    const isLowPerf = perfMode === 'enabled' ? true : (perfMode === 'disabled' ? false : autoDetected);

    const setPerfMode = (mode) => {
        setPerfModeState(mode);
        try {
            if (mode === 'enabled') localStorage.setItem('low_perf_manual', 'true');
            else if (mode === 'disabled') localStorage.setItem('low_perf_manual', 'false');
            else localStorage.removeItem('low_perf_manual');
        } catch (e) {}
    };

    const setIsLowPerf = (bool) => {
        setPerfMode(bool ? 'enabled' : 'disabled');
    };

    useEffect(() => {
        const check = () => {
            if (typeof window !== 'undefined') {
                if (window.__lowPerfAuto !== undefined && window.__lowPerfAuto !== autoDetected) {
                    setAutoDetected(window.__lowPerfAuto);
                }
                if (window.__lowPerfSignals !== undefined && window.__lowPerfSignals !== signals) {
                    setSignals(window.__lowPerfSignals);
                }
            }
        };
        const timer = setTimeout(check, 2500);
        return () => clearTimeout(timer);
    }, [autoDetected, signals]);

    // 同步 CSS class 与全局状态
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.body.classList.toggle('low-perf-mode', isLowPerf);
        }
        if (typeof window !== 'undefined') {
            window.__lowPerf = isLowPerf;
        }
    }, [isLowPerf]);

    return (
        <PerformanceContext.Provider value={{ isLowPerf, setIsLowPerf, perfMode, setPerfMode, autoDetected, signals }}>
            {children}
        </PerformanceContext.Provider>
    );
};
