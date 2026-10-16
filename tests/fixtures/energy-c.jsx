import React, { useContext, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PerformanceProvider, PerformanceContext } from '../../src/context/PerformanceContext.jsx';
import AtmosphereLayer from '../../src/components/backgrounds/AtmosphereLayer.jsx';
import { WeatherEffects } from '../../src/components/weather/WeatherEffects.jsx';
import { SilenceBanner } from '../../src/components/status/SilenceBanner.jsx';
import appHtml from '../../index.html?raw';
import '../../src/index.css';
// Use real legacy keyframes, not a simplified test copy.
const parsed = new DOMParser().parseFromString(appHtml, 'text/html');
parsed.querySelectorAll('style').forEach(style => document.head.append(style.cloneNode(true)));
function Harness() {
    const quality = useContext(PerformanceContext);
    const [mutes, setMutes] = useState({});
    const [counter, setCounter] = useState(0);
    window.energyC = { ...quality, setMutes, rerender: () => setCounter(x => x + 1) };
    return <>
        <AtmosphereLayer type="bg_matrix" />
        <header className="app-header" style={{ height: 80 }}><WeatherEffects type="rainy-effect" /></header>
        <main className="app-main" style={{ position: 'relative' }}>
            <div data-testid="glass" className="backdrop-blur-md" style={{ backgroundColor: 'rgba(20,30,50,0.8)', color: 'white', padding: 20 }}>任务卡片 {counter}</div>
            <div data-testid="feedback" style={{ animation: 'spin 1s linear infinite' }}>业务反馈</div>
        </main>
        <SilenceBanner mutes={mutes} setMutes={setMutes} />
    </>;
}
createRoot(document.getElementById('root')).render(<PerformanceProvider><Harness /></PerformanceProvider>);
