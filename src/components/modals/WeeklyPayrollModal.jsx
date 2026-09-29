import React from 'react';
import { FileText, CheckCircle2, Sparkles, Trophy, Coins, XIcon } from '../icons.jsx';

// 周学习工资明细弹窗（皇家周俸诏令 · 薪酬结算）
export const WeeklyPayrollModal = ({ show, onClose, payrollData, theme = {}, onClaim }) => {
    if (!show || !payrollData) return null;
    const { weekStart, weekEnd, totalReward = 0, items = [] } = payrollData;

    const fmtDate = (s) => {
        if (!s || s.length < 10) return s;
        const m = parseInt(s.slice(5, 7), 10);
        const d = parseInt(s.slice(8, 10), 10);
        return `${m}月${d}日`;
    };

    const weeklyItems = items.filter(i => i.type === 'weekly_optional');
    const dailyItems = items.filter(i => i.type === 'daily_must');

    return (
        <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-b from-amber-50/95 via-white to-amber-50/90 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_25px_60px_-15px_rgba(217,119,6,0.35)] border-2 border-amber-300/80 relative animate-in zoom-in-95 duration-300 max-h-[88vh] flex flex-col text-slate-800"
                onClick={e => e.stopPropagation()}
            >
                {/* 顶栏：皇家周俸令横额 */}
                <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 px-5 py-4 text-white relative shrink-0 shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-2xl shadow-inner">
                                📜
                            </div>
                            <div>
                                <h3 className="text-lg font-black tracking-wide flex items-center gap-1.5 drop-shadow-sm">
                                    皇家周俸 · 勤勉成长结算
                                </h3>
                                <div className="text-xs text-amber-100/90 flex items-center gap-1 mt-0.5 font-medium">
                                    <span>📅 结算周期：</span>
                                    <span className="font-bold underline underline-offset-2">
                                        {fmtDate(weekStart)} 至 {fmtDate(weekEnd)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-1.5 bg-black/20 hover:bg-black/30 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
                            title="关闭"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* 滚动内容区 */}
                <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
                    {/* 核心收入汇总卡片（皇家薪水单与朱砂印章） */}
                    <div className="relative bg-gradient-to-br from-amber-100/90 via-yellow-50 to-amber-100/70 border border-amber-300/80 rounded-2xl p-4 shadow-sm overflow-hidden">
                        {/* 传统朱红火漆印章 */}
                        <div className="absolute right-3 top-2 pointer-events-none select-none">
                            <div className="border-2 border-rose-600 text-rose-600 font-black text-[11px] px-2.5 py-1 rounded-lg uppercase tracking-widest transform -rotate-12 opacity-85 shadow-sm bg-rose-50/60 flex items-center gap-1">
                                <span>印</span> 勤勉核准 · 奉旨发薪
                            </div>
                        </div>

                        <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Coins className="w-4 h-4 text-amber-600" />
                            本周应发周俸总额
                        </div>

                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                                +{totalReward}
                            </span>
                            <span className="text-amber-800 font-bold text-sm">金元宝 💰</span>
                        </div>

                        <div className="text-[11px] text-amber-700/80 mt-1.5 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            依据上周选做目标达成与每日必做自律打卡核定，已包含全勤与超额奖励
                        </div>
                    </div>

                    {/* 每周选做任务 */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-sky-800 px-1">
                            <span className="flex items-center gap-1.5">
                                <Trophy className="w-4 h-4 text-sky-600" /> 每周选做任务达成清单
                            </span>
                            <span className="text-[11px] font-normal text-slate-500">
                                共 {weeklyItems.length} 项
                            </span>
                        </div>

                        {weeklyItems.length > 0 ? (
                            <div className="space-y-2">
                                {weeklyItems.map((it) => {
                                    const pct = it.weeklyTarget > 0 ? Math.min(100, Math.round((it.doneCount / it.weeklyTarget) * 100)) : 100;
                                    return (
                                        <div
                                            key={it.id}
                                            className={`p-3 rounded-2xl border transition-all ${
                                                it.reached
                                                    ? 'bg-sky-50/90 border-sky-200/90 shadow-sm'
                                                    : 'bg-white/80 border-slate-200'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <span className="font-bold text-slate-800 text-sm">
                                                        {it.name}
                                                    </span>
                                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                                        目标 {it.weeklyTarget} 次 · 实际完成 {it.doneCount} 次
                                                        {it.extraReward > 0 && (
                                                            <span className="text-amber-600 font-bold ml-1">
                                                                (超额奖 +{it.extraReward})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {it.reached ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-sky-700 bg-sky-100 border border-sky-300 px-2 py-0.5 rounded-full shrink-0">
                                                        <CheckCircle2 className="w-3 h-3 text-sky-600" />
                                                        达标 +{it.total} 💰
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                                                        未达标
                                                    </span>
                                                )}
                                            </div>

                                            {/* 微进度条 */}
                                            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        it.reached ? 'bg-sky-500' : 'bg-slate-300'
                                                    }`}
                                                    style={{ width: `${pct}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 py-3 px-4 bg-white/70 rounded-2xl border border-dashed border-slate-200 text-center">
                                本周暂无每周选做任务记录
                            </div>
                        )}
                    </div>

                    {/* 每日必做任务 */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-rose-800 px-1">
                            <span className="flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-rose-600" /> 每日必做自律打卡核定
                            </span>
                            <span className="text-[11px] font-normal text-slate-500">
                                共 {dailyItems.length} 项
                            </span>
                        </div>

                        {dailyItems.length > 0 ? (
                            <div className="space-y-2">
                                {dailyItems.map((it) => {
                                    const ratePct = Math.round((it.rate || 0) * 100);
                                    return (
                                        <div
                                            key={it.id}
                                            className={`p-3 rounded-2xl border transition-all ${
                                                it.reached
                                                    ? 'bg-rose-50/80 border-rose-200/90 shadow-sm'
                                                    : 'bg-white/80 border-slate-200'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <span className="font-bold text-slate-800 text-sm">
                                                        {it.name}
                                                    </span>
                                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                                        应打 {it.requiredDays} 天 · 完成 {it.doneDays} 天 · 完成率 {ratePct}%
                                                        {it.thresholdPercent != null && (
                                                            <span className="text-slate-400 ml-1">
                                                                (达标线 {it.thresholdPercent}%)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {it.reached ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full shrink-0">
                                                        <CheckCircle2 className="w-3 h-3 text-rose-600" />
                                                        考勤合格 +{it.total} 💰
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                                                        需再接再厉
                                                    </span>
                                                )}
                                            </div>

                                            {/* 微进度条 */}
                                            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        it.reached ? 'bg-rose-500' : 'bg-slate-300'
                                                    }`}
                                                    style={{ width: `${Math.min(100, ratePct)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 py-3 px-4 bg-white/70 rounded-2xl border border-dashed border-slate-200 text-center">
                                本周暂无每日必做任务记录
                            </div>
                        )}
                    </div>
                </div>

                {/* 底部操作区 */}
                <div className="p-4 sm:p-5 pt-3 bg-white/90 border-t border-amber-200/60 shrink-0">
                    <button
                        onClick={() => {
                            if (typeof onClaim === 'function') onClaim();
                            onClose();
                        }}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base shadow-[0_10px_25px_-5px_rgba(245,158,11,0.5)] border border-amber-200/50 transform active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <span>💰 签章领俸 (将金元宝存入钱庄)</span>
                    </button>
                    <div className="text-center text-[10px] text-slate-400 mt-2">
                        注：周俸为全勤达标嘉许，不影响平时日常单次打卡即时收获的金币
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyPayrollModal;
