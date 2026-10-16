import React, { createContext, useState, useEffect } from 'react';
import { GRAPHICS_KEY, GRAPHICS_MODES, readGraphicsMode, resolveGraphicsMode, isMobileGraphicsDevice } from '../utils/graphicsQuality.js';
import DecorationExperiment from '../components/status/DecorationExperiment.jsx';
import EnergyPreviewPanel from '../components/status/EnergyPreviewPanel.jsx';

export const PerformanceContext = createContext({ 
    isLowPerf: false, 
    setIsLowPerf: () => {},
    perfMode: 'auto',
    setPerfMode: () => {},
    autoDetected: false,
    isBalanced: false,
    graphicsQuality: 'original',
    previewBackground: 'current',
    optimizeDrawing: false,
    signals: 0
});

// 性能模式 Provider — 读取自动检测结果并提供给整个组件树
export const PerformanceProvider = ({ children }) => {
    const [preview] = useState(() => ['1', 'c'].includes(new URLSearchParams(window.location.search).get('energyPreview')));
    const [previewC] = useState(() => new URLSearchParams(window.location.search).get('energyPreview') === 'c');
    const [experiment, setExperiment] = useState('baseline');
    const [frozen, setFrozen] = useState(false);
    const optimizeDrawing = previewC && experiment !== 'baseline';
    const [mobile] = useState(() => isMobileGraphicsDevice(navigator, q => window.matchMedia(q)));
    const [previewBackground, setPreviewBackground] = useState('current');
    const [perfMode, setPerfModeState] = useState(() => { try { return readGraphicsMode(localStorage); } catch { return 'auto'; } });

    const [autoDetected, setAutoDetected] = useState(() => (typeof window !== 'undefined' ? window.__lowPerfAuto : false) || false);
    const [signals, setSignals] = useState(() => (typeof window !== 'undefined' ? window.__lowPerfSignals : 0) || 0);

    const graphicsQuality = resolveGraphicsMode(perfMode, mobile, autoDetected);
    const isLowPerf = graphicsQuality === 'lightweight';
    const isBalanced = graphicsQuality === 'balanced';

    const setPerfMode = (mode) => {
        if (!GRAPHICS_MODES.includes(mode)) return;
        setPerfModeState(mode);
        setFrozen(false);
        if (preview) return;
        try {
            localStorage.setItem(GRAPHICS_KEY, mode);
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
        window.addEventListener('performance-detected', check);
        check();
        return () => window.removeEventListener('performance-detected', check);
    }, [autoDetected, signals]);

    // 同步 CSS class 与全局状态
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.body.classList.toggle('low-perf-mode', isLowPerf);
        }
        if (typeof window !== 'undefined') {
            window.__graphicsManaged = true;
            window.__lowPerf = isLowPerf;
        }
    }, [isLowPerf]);

    return (
        <PerformanceContext.Provider value={{ isLowPerf, isBalanced, graphicsQuality, previewBackground, optimizeDrawing, setIsLowPerf, perfMode, setPerfMode, autoDetected, signals }}>
            {children}
            {previewC && <DecorationExperiment experiment={experiment} frozen={frozen} />}
            {preview && <EnergyPreviewPanel mode={perfMode} onMode={setPerfMode} quality={graphicsQuality}
                mobile={mobile} background={previewBackground} onBackground={value => { setPreviewBackground(value); setFrozen(false); }}
                previewC={previewC} experiment={experiment} onExperiment={value => { setExperiment(value); setFrozen(false); }} frozen={frozen} onFrozen={setFrozen} />}
        </PerformanceContext.Provider>
    );
};
