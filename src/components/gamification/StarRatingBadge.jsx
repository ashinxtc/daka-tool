// src/components/gamification/StarRatingBadge.jsx
// 今日星级通关徽章与安全护盾状态条组件

import React, { useContext } from 'react';
import { PerformanceContext } from '../../context/PerformanceContext';
import { Sparkles, Shield, Trophy, Flame } from '../icons.jsx';

export const StarRatingBadge = ({
    dailyStars,
    theme,
    onOpenStarDetails,
    hasActiveBg = false
}) => {
    const { isLowPerf } = useContext(PerformanceContext);
    const star = dailyStars?.star || 0;
    const isSafe = dailyStars?.isSafe || false;
    const rate = dailyStars?.rate || 0;
    const completed = dailyStars?.completedCount || 0;
    const total = dailyStars?.totalCount || 0;

    return (
        <div data-testid="star-rating-badge" className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border transition-all shadow-md relative overflow-hidden ${
            hasActiveBg 
                ? (isLowPerf ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-900/60 backdrop-blur-md border-white/20 text-white') 
                : (isLowPerf ? 'bg-white border-amber-200' : 'bg-white/80 backdrop-blur-sm border-amber-200/70')
        }`}>
            {/* 左侧：星级图标与主副文案 */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`flex items-center justify-center w-12 h-12 rounded-2xl shadow-inner border transition-transform ${
                    star === 3 
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-600 border-amber-300 text-amber-950 scale-105' 
                        : star === 2 
                        ? 'bg-gradient-to-br from-blue-400 to-indigo-600 border-blue-300 text-white' 
                        : star === 1 
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-600 border-emerald-300 text-white' 
                        : 'bg-slate-800/80 border-slate-700 text-slate-400'
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
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base flex items-center gap-1">
                            今日星级：
                            <span className="text-amber-500 font-black tracking-wider text-base sm:text-lg">
                                {'⭐'.repeat(star) || '☆☆☆'}
                            </span>
                        </span>
                        
                        {isSafe ? (
                            <span data-testid="safe-shield-active" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <Shield className="w-3 h-3" /> 今日免罚护盾已激活
                            </span>
                        ) : (
                            <span data-testid="safe-shield-waiting" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                                <Flame className="w-3 h-3" /> 完成 1 项即可激活免罚
                            </span>
                        )}
                    </div>
                    
                    <p className="text-xs text-slate-400 sm:text-slate-500 truncate mt-0.5">
                        {dailyStars?.note || '完成每日必做，赢取星级荣耀与免罚护盾'}
                    </p>
                </div>
            </div>

            {/* 右侧：紧凑进度与统计 */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-slate-400">
                        必做进度：<span className="text-amber-400 font-bold">{completed}</span> / {total} 项 ({rate}%)
                    </span>
                    <div className="w-28 sm:w-36 h-2 bg-slate-700/50 rounded-full overflow-hidden mt-1 p-0.5 border border-slate-600/40">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                                star === 3 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                                star === 2 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                                star === 1 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                                'bg-slate-500'
                            }`}
                            style={{ width: `${Math.min(100, rate)}%` }}
                        />
                    </div>
                </div>

                {onOpenStarDetails && (
                    <button
                        onClick={onOpenStarDetails}
                        className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors shadow-sm"
                    >
                        规则
                    </button>
                )}
            </div>
        </div>
    );
};

export default StarRatingBadge;
