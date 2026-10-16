import React, { useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { PerformanceProvider, PerformanceContext } from '../../src/context/PerformanceContext.jsx';
import AtmosphereLayer from '../../src/components/backgrounds/AtmosphereLayer.jsx';
import '../../src/index.css';
function Harness() {
    const state = useContext(PerformanceContext);
    window.graphics = state;
    return <><div data-testid="quality">{state.graphicsQuality}</div><AtmosphereLayer type="bg_galaxy" /></>;
}
createRoot(document.getElementById('root')).render(<PerformanceProvider><Harness /></PerformanceProvider>);
