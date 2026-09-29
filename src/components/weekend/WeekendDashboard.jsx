import React from 'react';
import { getLocalDateKey } from '../../utils/date';
import { Shield } from '../icons';

// --- 【新增组件】周末动态仪表盘 ---
export const WeekendDashboard = ({ tasks, checkins, activeChild, settings, theme }) => {
    const today = new Date();
    const day = today.getDay();
    const isWeekend = day === 0 || day === 6; // 周六或周日
    if (!isWeekend || settings.enabled === false) return null;

    const dateKey = getLocalDateKey(0);
    const childTasks = tasks[activeChild] || [];
    const childCheckins = checkins[activeChild] || {};

    // 只统计进行中的任务，排除已达成目标并进入目标达成墙的「按总次数」任务
    const isOngoing = (t) => {
        const freq = t.frequencyType || 'count';
        if (freq === 'daily_must' || freq === 'weekly_optional') return !t.earlyCompleted;
        const count = Object.keys(childCheckins[t.id] || {}).length;
        return count < (t.targetCount || 0);
    };
    const ongoingTasks = childTasks.filter(isOngoing);
    const coreTasks = ongoingTasks.filter(t => t.type === 'core');
    const dailyTasks = ongoingTasks.filter(t => t.type !== 'core');

    const calcProgress = (taskList) => {
        if (taskList.length === 0) return { count: 0, total: 0, percent: 0, isMet: false };
        let completed = 0;
        taskList.forEach(t => {
            const record = childCheckins[t.id]?.[dateKey];
            // 只要今天有打卡记录就算完成 (或者根据您的逻辑判断 targetCount)
            // 这里简化为：只要今天打了卡就算该项“推进了”
            if (record) completed++; 
        });
        return { 
            count: completed, 
            total: taskList.length, 
            percent: Math.round((completed / taskList.length) * 100)
        };
    };

    const coreStats = calcProgress(coreTasks);
    const dailyStats = calcProgress(dailyTasks);
    
    const coreMet = coreStats.percent >= settings.coreThreshold;
    const dailyMet = dailyStats.percent >= settings.dailyThreshold;
    const isPerfect = coreStats.percent === 100 && dailyStats.percent === 100;

    return (
        <div className="mb-6 mx-4 relative overflow-hidden rounded-2xl shadow-xl animate-in slide-in-from-top-4 duration-700">
            {/* 动态背景 */}
            <div className={`absolute inset-0 bg-gradient-to-r ${isPerfect ? 'from-purple-600 via-pink-500 to-amber-500' : 'from-indigo-900 via-blue-800 to-indigo-900'} opacity-90`}></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
            
            {/* 装饰光效 */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
            
            <div className="relative z-10 p-5 text-white">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            {isPerfect ? '🎉 完美周末达成！' : '🚀 周末冲刺模式'}
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full border border-white/30 uppercase tracking-wider">Weekend Vibes</span>
                        </h3>
                        <p className="text-xs text-white/80 mt-1">
                            {isPerfect 
                                ? '你真是太棒了！享受你的荣耀时刻吧！' 
                                : `目标：核心任务 ${settings.coreThreshold}% + 日常任务 ${settings.dailyThreshold}%`}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold opacity-70">连续达标</div>
                        <div className="text-2xl font-bold text-yellow-300 drop-shadow-md">保持中🔥</div>
                    </div>
                </div>

                {/* 进度条区域 */}
                <div className="space-y-3">
                    {/* 核心任务进度 */}
                    <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="flex items-center gap-1 text-yellow-200"><span className="text-sm">⭐</span> 核心任务 ({coreStats.count}/{coreStats.total})</span>
                            <span className={coreMet ? 'text-green-300' : 'text-white/60'}>{coreStats.percent}% {coreMet && '✔ 已达标'}</span>
                        </div>
                        <div className="h-3 bg-black/30 rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
                            <div 
                                className={`h-full transition-colors transition-transform duration-1000 ease-out relative ${coreMet ? 'bg-gradient-to-r from-yellow-400 to-amber-600' : 'bg-white/30'}`} 
                                style={{ width: `${coreStats.percent}%` }}
                            >
                                {coreStats.percent >= 100 && <div className="absolute inset-0 bg-white/50 animate-[shine_1s_infinite]"></div>}
                            </div>
                        </div>
                    </div>

                    {/* 日常任务进度 */}
                    <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="flex items-center gap-1 text-emerald-200"><span className="text-sm">🍃</span> 日常任务 ({dailyStats.count}/{dailyStats.total})</span>
                            <span className={dailyMet ? 'text-green-300' : 'text-white/60'}>{dailyStats.percent}% {dailyMet && '✔ 已达标'}</span>
                        </div>
                        <div className="h-3 bg-black/30 rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
                            <div 
                                className={`h-full transition-colors transition-transform duration-1000 ease-out relative ${dailyMet ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-white/30'}`} 
                                style={{ width: `${dailyStats.percent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const WeekendSettlementModal = ({ state, onClose, onClaim, onUseExemption, settings = {} }) => {
    if (!state) return null;
    const { type, coreStats = { percent: 0 }, dailyStats = { percent: 0 }, reward = 0 } = state;

    const config = {
        perfect: {
            bg: 'bg-gradient-to-b from-purple-950 via-slate-900 to-indigo-950',
            borderColor: 'border-yellow-400/60 shadow-[0_0_50px_rgba(234,179,8,0.25)]',
            icon: '🏆',
            title: '全功圆满 · 完美周末！',
            textColor: 'text-yellow-300',
            subtitle: '核心与日常任务全面大捷，奉旨封赏！'
        },
        pass: {
            bg: 'bg-gradient-to-b from-emerald-950 via-slate-900 to-teal-950',
            borderColor: 'border-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.2)]',
            icon: '🎉',
            title: '勤勉达标 · 周末告捷',
            textColor: 'text-emerald-300',
            subtitle: '达到既定自律目标，连胜记录保持中！'
        },
        fail: {
            bg: 'bg-gradient-to-b from-slate-900 via-stone-900 to-stone-950',
            borderColor: 'border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.15)]',
            icon: '🥀',
            title: '功亏一篑 · 未及阈值',
            textColor: 'text-rose-300',
            subtitle: '周末任务稍有欠缺，连胜记录已受波及'
        }
    }[type] || {
        bg: 'bg-slate-900',
        borderColor: 'border-white/20',
        icon: '📜',
        title: '周末结算',
        textColor: 'text-white',
        subtitle: ''
    };

    const handleClaim = () => {
        if (reward > 0 && onClaim) onClaim(reward);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative ${config.bg} text-white border-2 ${config.borderColor} animate-in zoom-in-95 duration-300`} onClick={e => e.stopPropagation()}>
                {/* 顶部金线 */}
                <div className="h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

                <div className="p-7 text-center relative z-10">
                    {/* 徽记图标 */}
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-5xl mb-4 mx-auto shadow-inner border border-white/20 animate-bounce">
                        {config.icon}
                    </div>

                    <h2 className={`text-2xl sm:text-3xl font-black mb-1 tracking-wide ${config.textColor}`}>
                        {config.title}
                    </h2>
                    <p className="text-white/70 text-xs font-medium mb-5">
                        {config.subtitle}
                    </p>

                    {/* 双轨达标度看板 */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-black/30 border border-white/10 p-3 rounded-2xl">
                            <div className="text-xs text-amber-300 font-bold mb-1 flex items-center justify-center gap-1">
                                <span>⭐</span> 核心达标率
                            </div>
                            <div className="text-xl font-black text-white font-mono">
                                {coreStats.percent}%
                            </div>
                        </div>
                        <div className="bg-black/30 border border-white/10 p-3 rounded-2xl">
                            <div className="text-xs text-emerald-300 font-bold mb-1 flex items-center justify-center gap-1">
                                <span>🍃</span> 日常推进率
                            </div>
                            <div className="text-xl font-black text-white font-mono">
                                {dailyStats.percent}%
                            </div>
                        </div>
                    </div>
                    
                    {/* 诏令正文 */}
                    <div className="text-sm leading-relaxed text-white/90 mb-7 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm text-justify font-medium">
                        {type === 'perfect' && `✨ 旷世之举！你攻克了周末全部课业与日常任务！特赐【完美周末大礼包】💰 +${reward} 金元宝！`}
                        {type === 'pass' && `🌟 恭贺达标！顺利越过自律基线，勤勉印记已加固。赐赏 💰 +${reward} 金元宝！`}
                        {type === 'fail' && "⏳ 很遗憾，本周末任务达成未及预期。连胜修行稍有停滞，整装再战！"}
                    </div>

                    {/* 交互按钮 */}
                    {type === 'fail' ? (
                        <div className="space-y-3">
                            {settings?.guardianPassCount > 0 && (
                                <button
                                    onClick={onUseExemption}
                                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-stone-950 font-black text-base shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Shield className="w-5 h-5 text-stone-900" />
                                    <span>🛡️ 祭出监护人豁免符 (余 {settings.guardianPassCount} 张)</span>
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
                            >
                                领旨 · 接受复盘结果
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleClaim}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-stone-950 font-black text-base shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer tracking-wider"
                        >
                            {type === 'perfect' ? '🎁 奉旨开启完美礼包' : '💰 签章领赏 · 金元宝入库'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
