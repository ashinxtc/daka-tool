// src/components/gamification/ComebackModal.jsx
// 逆风翻盘挑战契约弹窗与任务栏常驻提示条

import React, { useContext } from 'react';
import { PerformanceContext } from '../../context/PerformanceContext';
import { getThemeHeaderStyle } from '../../data/themes.js';
import { Shield, Sparkles, Trophy, Flame } from '../icons.jsx';

export const ComebackBanner = ({
    escrow,
    onOpenModal,
    theme
}) => {
    if (!escrow || escrow.status !== 'pending') return null;

    return (
        <div 
            data-testid="comeback-banner"
            onClick={onOpenModal}
            className="cursor-pointer group relative overflow-hidden rounded-2xl p-3 sm:p-3.5 bg-gradient-to-r from-rose-950/80 via-purple-950/70 to-slate-900 border border-rose-500/40 hover:border-rose-400 transition-all shadow-lg hover:shadow-rose-950/50 flex items-center justify-between gap-3 text-white mb-4 sm:mb-5"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-300 shadow-inner group-hover:scale-105 transition-transform">
                    <Flame className="w-6 h-6 text-rose-400 animate-pulse" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-rose-300">⚔️ 逆风翻盘进行中</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/30 font-bold">
                            扣押 {escrow.frozenGold || 20} 元宝
                        </span>
                    </div>
                    <p className="text-xs text-rose-100/80 mt-0.5">
                        今天达成 <strong className="text-amber-300">⭐ 1星保底</strong> 即可按契约比例赎回元宝！
                    </p>
                </div>
            </div>

            <button 
                data-testid="open-comeback-btn"
                type="button"
                onClick={onOpenModal}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors whitespace-nowrap"
            >
                查看契约
            </button>
        </div>
    );
};

export const ComebackModal = ({
    show,
    onClose,
    escrow,
    dailyStars,
    onConfirmChallenge,
    theme
}) => {
    const { isLowPerf } = useContext(PerformanceContext);
    if (!show || !escrow) return null;

    const isPending = escrow.status === 'pending';
    const isRedeemed = escrow.status === 'redeemed';
    const frozenGold = escrow.frozenGold || 20;

    return (
        <div data-testid="comeback-modal" className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border transition-all ${
                    theme?.border || 'border-rose-500/50'
                } ${isLowPerf ? 'bg-slate-900 text-white' : 'bg-slate-900/95 text-white backdrop-blur-xl'}`}
            >
                {/* 标题栏 */}
                <div 
                    className={`p-4 sm:p-5 flex items-center justify-between text-white ${theme?.solidBg || 'bg-rose-600'}`}
                    style={getThemeHeaderStyle(theme)}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⚔️</span>
                        <h3 className="text-lg font-black tracking-wide">
                            {isRedeemed ? '🎉 逆风翻盘 · 凯旋而归' : '逆风翻盘 · 戴罪立功契约'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* 核心内容 */}
                <div className="p-5 sm:p-6 space-y-4">
                    {isRedeemed ? (
                        <div className="text-center py-4 space-y-3">
                            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-4xl animate-bounce">
                                🏆
                            </div>
                            <h4 className="text-xl font-black text-emerald-400">大获全胜！成功赎回！</h4>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                你今天通过顽强的毅力达成了 <strong className="text-amber-300">⭐ 1星安全保底</strong>！
                                <br />
                                扣押的 <strong className="text-amber-300 font-bold">{frozenGold} 金元宝</strong> 已按契约返还 {escrow.returnedGold ?? frozenGold} 元宝！同时激活安全保护，重置连续违规计数！
                            </p>
                        </div>
                    ) : !isPending ? (
                        <p className="text-sm text-slate-300">契约已到期，冻结款项不再赎回。</p>
                    ) : (
                        <div className="space-y-4">
                            {/* 警报态小卡 */}
                            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-start gap-3">
                                <span className="text-3xl">👿</span>
                                <div>
                                    <h4 className="font-bold text-rose-300 text-sm">小恶魔把守的地牢通告</h4>
                                    <p className="text-xs text-rose-100/80 mt-1 leading-relaxed">
                                        “{escrow.reason || '因未达成任务要求'}，你的 <strong className="text-amber-400 font-bold">{frozenGold} 金元宝</strong> 暂时被我关进了小黑屋！”
                                    </p>
                                </div>
                            </div>

                            {/* 契约核心条件 */}
                            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
                                <h5 className="font-black text-xs tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4" /> 翻盘逆袭指南
                                </h5>
                                <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                                    <li className="flex items-center gap-2">
                                        <span className="text-emerald-400 font-bold">✓ 目标：</span>
                                        今天只要完成 <strong>家长设置的 1 星任务目标</strong>（达成 ⭐ 1 星保底）。
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-emerald-400 font-bold">✓ 奖励：</span>
                                        击溃小恶魔，<strong>按契约比例赎回冻结的 {frozenGold} 金元宝</strong>，重置连续违规并获安全断点保护！
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-rose-400 font-bold">⏳ 时限：</span>
                                        截止至 {escrow.deadlineDate || escrow.createdDate} 当日结束前。
                                    </li>
                                </ul>
                            </div>

                            {/* 当前进度指示 */}
                            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700 text-center text-xs text-slate-400">
                                当前今日星级状态：
                                <strong className="text-amber-400 ml-1">
                                    {dailyStars?.star ? `⭐已达成 ${dailyStars.star} 星` : '尚未起步'}
                                </strong>
                            </div>
                        </div>
                    )}

                    {/* 底部按钮 */}
                    <div className="pt-2">
                        {!isPending ? (
                            <button
                                data-testid="claim-redeemed-btn"
                                onClick={onClose}
                                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-colors"
                            >
                                收入囊中，继续加油！
                            </button>
                        ) : (
                            <button
                                data-testid="accept-comeback-btn"
                                onClick={() => {
                                    if (onConfirmChallenge) onConfirmChallenge();
                                    onClose();
                                }}
                                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <span>接受契约，今日全力翻盘！</span>
                                <span className="text-lg">🔥</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComebackModal;
