import { useState, useEffect } from 'react';

// 性能优化：夜幕状态 Hook — 每 5 分钟检查一次，避免每秒计算
export const useNightMode = (isDay) => {
    const check = () => {
        if (typeof isDay === 'boolean') return !isDay;
        const h = new Date().getHours();
        return h >= 18 || h < 6;
    };
    const [isNight, setIsNight] = useState(check);
    useEffect(() => { setIsNight(check()); }, [isDay]);
    useEffect(() => {
        if (typeof isDay === 'boolean') return; // API 有值时不轮询
        const timer = setInterval(() => setIsNight(check()), 5 * 60 * 1000);
        return () => clearInterval(timer);
    }, [isDay]);
    return isNight;
};
