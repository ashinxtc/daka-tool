import React, { createContext, useState, useEffect } from 'react';
import { GRAPHICS_KEY, IDLE_KEY, normalizeGraphicsMode, readGraphicsMode, readIdleEnergy, resolveGraphicsMode } from '../utils/graphicsQuality.js';
import DecorationEnergy from '../components/status/DecorationEnergy.jsx';

export const PerformanceContext = createContext({
    isLowPerf: false, isBalanced: true, graphicsQuality: 'balanced',
    perfMode: 'balanced', setPerfMode: () => {}, setIsLowPerf: () => {},
    staticDecorations: false, optimizeDrawing: false,
    idleEnergy: true, setIdleEnergy: () => {}, autoDetected: false, signals: 0
});
export const PerformanceProvider = ({ children }) => {
    const [perfMode, setMode] = useState(() => { try { return readGraphicsMode(localStorage); } catch { return 'balanced'; } });
    const [idleEnergy, setIdle] = useState(() => { try { return readIdleEnergy(localStorage); } catch { return true; } });
    const graphicsQuality = resolveGraphicsMode(perfMode);
    const isLowPerf = graphicsQuality === 'lightweight';
    const staticDecorations = perfMode === 'economy';
    const setPerfMode = value => {
        const mode = normalizeGraphicsMode(value);
        if (mode) setMode(mode);
    };
    // Device-only keys: never use the app_ prefix that participates in family sync.
    useEffect(() => {
        try {
            localStorage.setItem(GRAPHICS_KEY, perfMode);
            localStorage.setItem('low_perf_manual', String(isLowPerf));
        } catch {}
        document.body.classList.toggle('low-perf-mode', isLowPerf);
        window.__graphicsManaged = true;
        window.__lowPerf = isLowPerf;
    }, [perfMode, isLowPerf]);
    useEffect(() => { try { localStorage.setItem(IDLE_KEY, String(idleEnergy)); } catch {} }, [idleEnergy]);
    return <PerformanceContext.Provider value={{
        isLowPerf, isBalanced: graphicsQuality === 'balanced', graphicsQuality,
        perfMode, setPerfMode, setIsLowPerf: value => setPerfMode(value ? 'compatibility' : 'full'),
        staticDecorations, optimizeDrawing: perfMode === 'balanced',
        idleEnergy, setIdleEnergy: value => setIdle(!!value), autoDetected: false, signals: 0
    }}>
        {children}
        <DecorationEnergy idleEnabled={idleEnergy} staticDecorations={staticDecorations} mode={perfMode} />
    </PerformanceContext.Provider>;
};
