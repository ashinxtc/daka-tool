import React from 'react';
import { Target, XIcon, Trophy, CheckCircle2, CalendarIcon, Coins, Sparkles, Medal } from '../icons';

// --- 【目标达成墙 · 荣耀殿堂】CompletedWallModal ---
export const CompletedWallModal = ({ show, onClose, completedTasks = [], checkins = {}, activeChild, theme }) => {
    if (!show) return null;

    // 计算总览数据
    const totalStats = completedTasks.reduce((acc, task) => {
        const record = checkins[activeChild]?.[task.id] || {};
        const count = Object.keys(record).length;
        const rewardTotal = count * (task.reward || 0) + (task.completedReward || 0);
        return {
            totalCheckins: acc.totalCheckins + count,
            totalGold: acc.totalGold + rewardTotal
        };
    }, { totalCheckins: 0, totalGold: 0 });

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[80] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white/95 rounded-3xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-white/80 overflow-hidden animate-in zoom-in-95 duration-200 relative">
                {/* 殿堂级标头 */}
                <div className={`px-6 py-4 bg-gradient-to-r ${theme.gradient} text-white flex justify-between items-center shrink-0 shadow-md relative z-10`}>
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-2xl shadow-inner border border-white/30">
                            🎯
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-black tracking-wide drop-shadow-sm">
                                    目标达成墙 · 荣耀殿堂
                                </h2>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white">
                                    {activeChild || '学子'} 专属
                                </span>
                            </div>
                            <p className="text-white/90 text-xs mt-0.5 flex items-center gap-2">
                                <span>记录每一次从启程到圆满完成的执着坚持</span>
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-all active:scale-95"
                        title="关闭"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* 总览荣誉摘要栏 */}
                <div className="px-6 py-3 bg-gradient-to-r from-amber-50 via-yellow-50/70 to-orange-50 border-b border-amber-200/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-900/70">圆满目标:</span>
                            <span className="text-sm font-black text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded-lg border border-amber-300/60 font-mono">
                                {completedTasks.length} 项
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-900/70">总打卡沉淀:</span>
                            <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 font-mono">
                                {totalStats.totalCheckins} 次
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-900/70">累计斩获金币:</span>
                            <span className="text-sm font-black text-yellow-700 bg-yellow-100/80 px-2 py-0.5 rounded-lg border border-yellow-300 font-mono">
                                +{totalStats.totalGold} 💰
                            </span>
                        </div>
                    </div>
                    <div className="text-[11px] font-bold text-amber-700/80 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>丰碑镌刻 · 永恒勋劳</span>
                    </div>
                </div>

                {/* 丰碑卡片展区 */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-gradient-to-b from-slate-50/60 to-white relative">
                    {/* 背景暗纹 */}
                    <div 
                        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                    />

                    {completedTasks.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 relative z-10 space-y-4">
                            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-4xl shadow-inner">
                                🎯
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-700">暂未有圆满达成的目标</h3>
                                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                                    千里之行，始于足下。坚持每日打卡，当次数达到目标时，你的专属荣耀丰碑将在此长久闪耀！
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
                            {completedTasks.map(task => {
                                const record = checkins[activeChild]?.[task.id] || {};
                                const currentCount = Object.keys(record).length;
                                const dates = Object.keys(record).sort();
                                const actualStartDate = dates.length > 0 ? dates[0] : (task.startDate || '起点');
                                const actualEndDate = dates.length > 0 ? dates[dates.length - 1] : '今日';
                                const totalGold = currentCount * (task.reward || 0) + (task.completedReward || 0);

                                return (
                                    <div 
                                        key={task.id} 
                                        className="bg-white/95 rounded-2xl p-5 border border-amber-200/90 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                                    >
                                        {/* 底纹大水印奖杯 */}
                                        <div className="absolute -right-5 -bottom-5 text-amber-500/10 group-hover:scale-110 group-hover:text-amber-500/15 transition-all duration-500 pointer-events-none">
                                            <Trophy className="w-32 h-32" />
                                        </div>

                                        <div>
                                            {/* 顶部标头 & 朱砂圆满达成印章 */}
                                            <div className="flex justify-between items-start gap-2 mb-3">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <span className="text-2xl shrink-0 filter drop-shadow-xs">🎖️</span>
                                                    <h3 className="font-black text-gray-800 text-base truncate group-hover:text-amber-700 transition-colors" title={task.name}>
                                                        {task.name}
                                                    </h3>
                                                </div>
                                                {/* 拟真朱砂红印章 */}
                                                <div className="border border-rose-500 text-rose-600 bg-rose-50/80 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 rotate-[-4deg] shadow-2xs flex items-center gap-0.5">
                                                    <CheckCircle2 className="w-3 h-3 text-rose-500" />
                                                    <span>圆满达成</span>
                                                </div>
                                            </div>

                                            {/* 目标誓言 */}
                                            {task.targetGoal ? (
                                                <div className="mb-4 bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl text-xs text-amber-900/80 shadow-inner leading-relaxed">
                                                    <span className="font-bold text-amber-600 mr-1 block text-[10px] uppercase tracking-wide">
                                                        🎯 目标立誓:
                                                    </span>
                                                    {task.targetGoal}
                                                </div>
                                            ) : (
                                                <div className="mb-3 text-[11px] text-gray-400 italic">
                                                    恒心不缀，功不唐捐
                                                </div>
                                            )}
                                        </div>

                                        {/* 沉淀数据卡片 */}
                                        <div className="space-y-2 text-xs text-gray-600 bg-slate-50/80 p-3 rounded-xl border border-gray-100/90 relative z-10 mt-2">
                                            <div className="flex justify-between items-center border-b border-gray-200/60 pb-1.5">
                                                <span className="flex items-center gap-1.5 text-gray-500">
                                                    <CalendarIcon className="w-3.5 h-3.5 text-blue-500" /> 历经周期
                                                </span>
                                                <span className="font-bold text-gray-700 font-mono text-[11px]">
                                                    {actualStartDate} ~ {actualEndDate}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center border-b border-gray-200/60 pb-1.5">
                                                <span className="flex items-center gap-1.5 text-gray-500">
                                                    <Target className="w-3.5 h-3.5 text-emerald-500" /> 达成全勤
                                                </span>
                                                <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-mono">
                                                    {currentCount} / {task.targetCount || currentCount} 次
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center pt-0.5">
                                                <span className="flex items-center gap-1.5 text-gray-500">
                                                    <Coins className="w-3.5 h-3.5 text-amber-500" /> 铸就财富
                                                </span>
                                                <span className="font-black text-amber-600 text-sm font-mono flex items-center gap-0.5">
                                                    +{totalGold} <span className="text-[10px] font-bold">💰</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompletedWallModal;
