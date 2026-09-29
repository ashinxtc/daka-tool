import React, { useState, useEffect } from 'react';

// 性能优化：独立时钟组件 — 每秒仅自身重渲染，不触发 App 重渲染
export const TimeDisplay = React.memo(({ headerTheme, variant, holiday, weather, userCity }) => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
    const dateStr = now.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekStr = weekDays[now.getDay()];

    if (variant === 'mobile') {
        return (
            <div className="flex flex-col items-center flex-1 min-w-0 px-2 select-none">
                <div className={`text-2xl font-mono font-black tracking-widest ${headerTheme?.text || 'text-white'} drop-shadow-md`}>{timeStr}</div>
                <div className={`text-[10px] font-bold ${headerTheme?.text || 'text-white'} opacity-85 flex items-center gap-1 flex-wrap justify-center`}>
                    <span>{weekStr} · {dateStr}</span>
                    {holiday && (
                        <>
                            <span className="opacity-60">·</span>
                            <span className="text-amber-200 inline-flex items-center gap-0.5">
                                <span>{headerTheme?.icon}</span>
                                <span>{holiday.name}</span>
                            </span>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Desktop variant (方案一：无框无底色，纯净自然排版)
    return (
        <div className="flex flex-col items-center justify-center select-none text-center">
            {/* 1. 大数字时钟 (核心焦点) */}
            <div className={`text-4xl lg:text-5xl font-mono font-black tracking-widest ${headerTheme?.text || 'text-white'} drop-shadow-md`}>
                <span className="opacity-95">{timeStr}</span>
            </div>

            {/* 2. 日期与节日同行一体化 (彻底去除外框与白底，自然轻盈) */}
            <div className={`flex items-center justify-center gap-2 text-xs lg:text-sm font-bold ${headerTheme?.text || 'text-white'} opacity-90 mt-1 drop-shadow-xs`}>
                <span>{weekStr}</span>
                <span className="opacity-50">·</span>
                <span>{dateStr}</span>
                {holiday && (
                    <>
                        <span className="opacity-50">·</span>
                        <span className="inline-flex items-center gap-1 text-amber-200 font-extrabold tracking-wide">
                            <span>{headerTheme?.icon}</span>
                            <span>{holiday.name}</span>
                        </span>
                    </>
                )}
            </div>

            {/* 3. 地点与天气 (无框无底色，极简纯净文字排版，绝无重叠) */}
            {weather && (
                <div className={`flex items-center justify-center gap-2 text-xs font-medium ${headerTheme?.text || 'text-white'} opacity-85 mt-1 drop-shadow-xs tracking-wider`}>
                    <span className="font-bold text-amber-100">{weather.city || (userCity || '定位中')}</span>
                    <span className="opacity-50">·</span>
                    <span className="inline-flex items-center gap-1">
                        <span className="filter drop-shadow-xs">{weather.icon}</span>
                        <span className="font-medium">{weather.text}</span>
                    </span>
                    <span className="opacity-50">·</span>
                    <span className="font-mono font-semibold">{weather.temp}°C</span>
                </div>
            )}
        </div>
    );
});
