import React, { useContext, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PerformanceProvider, PerformanceContext } from '../../src/context/PerformanceContext.jsx';
import AtmosphereLayer from '../../src/components/backgrounds/AtmosphereLayer.jsx';
import { WeatherEffects } from '../../src/components/weather/WeatherEffects.jsx';
import { SilenceBanner } from '../../src/components/status/SilenceBanner.jsx';
import { LowPerfToggle } from '../../src/components/modals/SettingsModal.jsx';
import appHtml from '../../index.html?raw';
import '../../src/index.css';
const parsed = new DOMParser().parseFromString(appHtml, 'text/html');
parsed.querySelectorAll('style').forEach(style => document.head.append(style.cloneNode(true)));
function Harness() {
    const state = useContext(PerformanceContext);
    const [background, setBackground] = useState('bg_matrix');
    const [mutes, setMutes] = useState({});
    const [count, setCount] = useState(0);
    window.tiers = { ...state, setBackground, setMutes };
    return <>
        <AtmosphereLayer type={background} />
        <header className="app-header" style={{height:80}}><WeatherEffects type="rainy-effect" /></header>
        <main className="app-main" style={{position:'relative',background:'#fff',padding:10}}>
            <LowPerfToggle />
            <div data-testid="glass" className="backdrop-blur-md" style={{backgroundColor:'rgba(20,30,50,.8)'}}>玻璃</div>
            <button onClick={() => setCount(x=>x+1)}>打卡测试 {count}</button>
            <div data-testid="feedback" style={{animation:'spin 1s linear infinite'}}>业务反馈</div>
        </main>
        <SilenceBanner mutes={mutes} setMutes={setMutes}/>
    </>;
}
createRoot(document.getElementById('root')).render(<PerformanceProvider><Harness/></PerformanceProvider>);
