import React, { useContext } from 'react';
import { PerformanceContext } from '../../context/PerformanceContext';

// --- [新增] WMO 天气代码转换器 ---
// 将 Open-Meteo 的数字代码转换为我们的天气类型
export const convertWMOToType = (code) => {
    // 0: 晴天
    if (code === 0) return 'sunny';
    // 1, 2, 3: 多云
    if ([1, 2, 3, 45, 48].includes(code)) return 'cloudy';
    // 51-67, 80-82: 雨
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return 'rainy';
    // 71-77, 85-86: 雪
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snowy';
    
    return 'sunny'; // 默认
};

// --- [新增] 智能天气模拟系统 ---
export const getWeatherInfo = (dateObj) => {
    const hour = dateObj.getHours();
    const month = dateObj.getMonth() + 1;
    const isNight = hour < 6 || hour >= 18;
    
    // 季节判断
    let season = 'spring';
    if (month >= 6 && month <= 8) season = 'summer';
    else if (month >= 9 && month <= 11) season = 'autumn';
    else if (month === 12 || month <= 2) season = 'winter';

    // 基于季节的随机天气权重 (模拟)
    // 这里使用简单的哈希算法让同一天内的天气相对稳定，避免每秒跳变
    const dateSeed = dateObj.getDate() + month * 100 + dateObj.getFullYear() * 10000;
    // 简单的伪随机数生成器 (0-99)
    const random = (dateSeed * 9301 + 49297) % 233280 / 233280 * 100;

    let type = 'sunny';
    let tempBase = 20;

    if (season === 'summer') {
        tempBase = 30;
        if (random < 60) type = 'sunny';
        else if (random < 80) type = 'cloudy';
        else type = 'rainy';
    } else if (season === 'winter') {
        tempBase = 5;
        if (random < 40) type = 'sunny';
        else if (random < 70) type = 'cloudy';
        else if (random < 90) type = 'snowy';
        else type = 'rainy';
    } else {
        // 春秋
        if (random < 50) type = 'sunny';
        else if (random < 80) type = 'cloudy';
        else type = 'rainy';
    }

    // 修正昼夜图标
    if (isNight && type === 'sunny') type = 'clear_night';

    // 温度微调 (早晚凉，中午热)
    let currentTemp = tempBase;
    if (hour >= 12 && hour <= 15) currentTemp += 3;
    else if (hour < 6 || hour > 20) currentTemp -= 5;
    
    // 天气元数据
    const weatherMap = {
        sunny: { icon: '☀️', text: '晴朗', animation: 'sunny-effect', bg: 'from-blue-400 via-sky-400 to-cyan-300' },
        clear_night: { icon: '🌙', text: '晴夜', animation: 'starry-effect', bg: 'from-slate-900 via-indigo-900 to-slate-800' },
        cloudy: { icon: '☁️', text: '多云', animation: 'cloudy-effect', bg: 'from-slate-400 via-gray-400 to-slate-300' },
        rainy: { icon: '🌧️', text: '小雨', animation: 'rainy-effect', bg: 'from-slate-700 via-slate-600 to-gray-500' },
        snowy: { icon: '❄️', text: '下雪', animation: 'snowy-effect', bg: 'from-indigo-100 via-blue-100 to-white' }
    };

    return { ...weatherMap[type], temp: Math.round(currentTemp) };
};

// --- [新增] 天气特效图层组件 ---
export const WeatherEffects = ({ type }) => {
    const { isLowPerf } = useContext(PerformanceContext);
    if (type === 'sunny-effect') {
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-br from-yellow-300/20 to-transparent rounded-full blur-3xl animate-[pulse_4s_infinite]"></div>
                {!isLowPerf && <>
                    <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.1)_50%,transparent_55%)] bg-[length:200%_200%] animate-[shine_8s_linear_infinite]"></div>
                    <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-400/30 rounded-full blur-xl animate-bounce" style={{animationDuration: '3s'}}></div>
                </>}
            </div>
        );
    }
    if (type === 'rainy-effect') {
        const count = isLowPerf ? 8 : 20;
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none weather-rain-container">
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="absolute bg-white/40 w-0.5 h-6 rounded-full animate-[rain_1s_linear_infinite]" 
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `-20px`,
                            animationDuration: `${0.5 + Math.random() * 0.5}s`,
                            animationDelay: `${Math.random()}s`
                        }}>
                    </div>
                ))}
            </div>
        );
    }
    if (type === 'snowy-effect') {
        const count = isLowPerf ? 10 : 30;
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="absolute bg-white/80 w-1.5 h-1.5 rounded-full animate-[snow_3s_linear_infinite]" 
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `-10px`,
                            animationDuration: `${2 + Math.random() * 3}s`,
                            animationDelay: `${Math.random() * 2}s`
                        }}>
                    </div>
                ))}
            </div>
        );
    }
    if (type === 'cloudy-effect') {
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-5 left-10 text-6xl opacity-20 animate-[float_6s_ease-in-out_infinite]">☁️</div>
                <div className="absolute top-1/2 right-20 text-8xl opacity-10 animate-[float_8s_ease-in-out_infinite_reverse]">☁️</div>
            </div>
        );
    }
    if (type === 'starry-effect') {
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 {[...Array(30)].map((_, i) => (
                    <div key={i} className="absolute bg-white w-0.5 h-0.5 rounded-full animate-pulse" 
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`
                        }}>
                    </div>
                ))}
                 <div className="absolute top-10 right-20 text-yellow-100/20 text-6xl animate-pulse">✨</div>
            </div>
        );
    }
    return null;
};
