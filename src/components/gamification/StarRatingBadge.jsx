// src/components/gamification/StarRatingBadge.jsx
// 今日星级通关徽章与安全护盾状态条组件

import React, { useContext } from 'react';
import { PerformanceContext } from '../../context/PerformanceContext';
import { Sparkles, Shield, Trophy, Flame } from '../icons.jsx';

export const StarRatingBadge = ({
    dailyStars,
    theme,
    onOpenStarDetails,
    hasActiveBg = false,
    escrow = null
}) => {
    const { isLowPerf } = useContext(PerformanceContext);
    const star = dailyStars?.star || 0;
    const isSafe = dailyStars?.isSafe || false;
    const rate = dailyStars?.rate || 0;
    const completed = dailyStars?.completedCount || 0;
    const total = dailyStars?.totalCount || 0;

    return (
        <div data-testid="star-rating-badge" className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all shadow-md relative overflow-hidden mb-5 sm:mb-6 ${
            hasActiveBg 
                ? (isLowPerf ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-slate-900/60 backdrop-blur-md border-white/20 text-white') 
                : (isLowPerf ? 'bg-white border-amber-200/90 text-slate-800' : 'bg-white/90 backdrop-blur-sm border-amber-200/80 text-slate-800 shadow-amber-500/5')
        }`}>
            {/* 左侧：星级图标与主副文案 */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`flex items-center justify-center w-12 h-12 rounded-2xl shadow-inner border transition-transform shrink-0 ${
                    star === 3 
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-600 border-amber-300 text-amber-950 scale-105' 
                        : star === 2 
                        ? 'bg-gradient-to-br from-blue-400 to-indigo-600 border-blue-300 text-white' 
                        : star === 1 
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-600 border-emerald-300 text-white' 
                        : (hasActiveBg 
                            ? 'bg-slate-800/80 border-slate-700 text-slate-400' 
                            : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/80 text-amber-700/80')
                }`}>
                    {star === 3 ? (
                        <Trophy className="w-7 h-7 animate-bounce" />
                    ) : star === 2 ? (
                        <Sparkles className="w-6 h-6 animate-pulse" />
                    ) : star === 1 ? (
                        <Shield className="w-6 h-6 text-emerald-100" />
                    ) : (
                        <span className="text-xl font-black">0★</span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold text-sm sm:text-base flex items-center gap-1 ${hasActiveBg ? 'text-white' : 'text-slate-800'}`}>
                            今日星级：
                            <span className="text-amber-500 font-black tracking-wider text-base sm:text-lg">
                                {'⭐'.repeat(star) || '☆☆☆'}
                            </span>
                        </span>
                        
                        {escrow?.status === 'pending' ? (
                            star >= 1 ? (
                                <span data-testid="safe-shield-active" className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                    hasActiveBg 
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}>
                                    <Shield className="w-3 h-3 text-emerald-500" /> 1星保底达成 · 翻盘成功赎回
                                </span>
                            ) : (
                                <span data-testid="safe-shield-waiting" className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border animate-pulse ${
                                    hasActiveBg 
                                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                    <Flame className="w-3 h-3 text-rose-500" /> 逆风翻盘中 · 达成 1 星即可赎回
                                </span>
                            )
                        ) : (
                            star === 3 ? (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                    hasActiveBg 
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                    <Trophy className="w-3 h-3 text-amber-500" /> 3 星大满贯
                                </span>
                            ) : star === 2 ? (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                    hasActiveBg 
                                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                    <Sparkles className="w-3 h-3 text-blue-500" /> 2 星进阶达标
                                </span>
                            ) : star === 1 ? (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                    hasActiveBg 
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}>
                                    <Shield className="w-3 h-3 text-emerald-500" /> 1 星起航达标
                                </span>
                            ) : (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                    hasActiveBg 
                                        ? 'bg-slate-700/50 text-slate-300 border-slate-600/40' 
                                        : 'bg-amber-50 text-amber-800/90 border-amber-200/80 shadow-2xs'
                                }`}>
                                    今日尚未起步
                                </span>
                            )
                        )}
                    </div>
                    
                    <p className={`text-xs truncate mt-0.5 ${hasActiveBg ? 'text-slate-300' : 'text-slate-500'}`}>
                        {dailyStars?.note || '完成每日必做打卡，达成星级通关荣耀'}
                    </p>
                </div>
            </div>

            {/* 右侧：紧凑进度与统计 */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex flex-col items-end">
                    <span className={`text-xs font-semibold ${hasActiveBg ? 'text-slate-300' : 'text-slate-600'}`}>
                        必做进度：<span className={hasActiveBg ? 'text-amber-400 font-bold' : 'text-amber-600 font-bold'}>{completed}</span> / {total} 项 ({rate}%)
                    </span>
                    <div className={`w-28 sm:w-36 h-2 rounded-full overflow-hidden mt-1 p-0.5 border ${
                        hasActiveBg ? 'bg-slate-800/80 border-slate-700/80' : 'bg-slate-100 border-slate-200'
                    }`}>
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                                star === 3 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                                star === 2 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                                star === 1 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                                (hasActiveBg ? 'bg-slate-600' : 'bg-slate-300')
                            }`}
                            style={{ width: `${Math.min(100, rate)}%` }}
                        />
                    </div>
                </div>

                {onOpenStarDetails && (
                    <button
                        onClick={onOpenStarDetails}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all shadow-2xs cursor-pointer ${
                            hasActiveBg 
                                ? 'text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 active:scale-95' 
                                : 'text-amber-800 hover:text-amber-900 bg-white hover:bg-amber-50/80 border border-amber-200 hover:border-amber-300 active:scale-95'
                        }`}
                    >
                        规则
                    </button>
                )}
            </div>
        </div>
    );
};

export default StarRatingBadge;
