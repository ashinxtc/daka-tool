// src/components/gamification/FirstBloodModal.jsx
// 首胜破冰盲盒弹窗：迈出第1步即时获得宝箱动画与随机掉落奖励

import React, { useState, useContext } from 'react';
import { PerformanceContext } from '../../context/PerformanceContext';
import { getThemeHeaderStyle } from '../../data/themes.js';
import { Sparkles, Trophy, Coins } from '../icons.jsx';

export const FirstBloodModal = ({
    show,
    onClose,
    onClaim,
    reward,
    theme
}) => {
    const { isLowPerf } = useContext(PerformanceContext);
    const [isOpened, setIsOpened] = useState(false);

    if (!show || !reward) return null;

    const handleOpenBox = () => {
        setIsOpened(true);
    };

    const handleClaimReward = () => {
        if (onClaim) {
            onClaim(reward);
        }
        setIsOpened(false);
        onClose();
    };

    return (
        <div data-testid="first-blood-modal" className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border transition-all ${
                    theme?.border || 'border-amber-400/60'
                } ${isLowPerf ? 'bg-slate-900 text-white' : 'bg-slate-900/95 text-white backdrop-blur-xl'}`}
            >
                {/* 标题栏 */}
                <div 
                    className={`p-4 sm:p-5 flex items-center justify-between text-white ${theme?.solidBg || 'bg-amber-600'}`}
                    style={getThemeHeaderStyle(theme)}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🎁</span>
                        <h3 className="text-lg font-black tracking-wide">
                            {isOpened ? '🎉 首胜大吉！好运掉落' : '今日首胜 · 破冰盲盒'}
                        </h3>
                    </div>
                </div>

                {/* 盲盒展示区 */}
                <div className="p-6 text-center space-y-4">
                    {!isOpened ? (
                        <div className="space-y-4 py-2">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-5xl shadow-xl shadow-amber-500/20 border-2 border-yellow-300 animate-bounce cursor-pointer"
                                     onClick={handleOpenBox}
                                >
                                    🎁
                                </div>
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                                </span>
                            </div>

                            <div>
                                <h4 className="text-lg font-black text-amber-300">
                                    太棒了！今日首胜达成！
                                </h4>
                                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                    你迈出了今天最勇敢的第一步！
                                    <br />
                                    特为你准备了一份专属的破冰幸运好礼：
                                </p>
                            </div>

                            <button
                                data-testid="open-first-blood-btn"
                                onClick={handleOpenBox}
                                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-black text-sm shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-4 h-4 text-amber-900" />
                                <span>立即开启首胜盲盒</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 py-2 animate-in zoom-in-95 duration-200">
                            {/* 奖品展示 */}
                            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-4xl shadow-inner">
                                💰
                            </div>

                            <div>
                                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                                    破冰战利品
                                </span>
                                <div className="text-3xl font-black text-amber-300 flex items-center justify-center gap-2 mt-1">
                                    <span>+{reward.totalGold}</span>
                                    <span className="text-lg text-amber-200 font-normal">金元宝</span>
                                </div>
                                
                                {reward.isEarlyBird && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mt-2">
                                        <span>🌅</span>
                                        <span>早起鸟专属加成 (+{reward.earlyBonus} 元宝)</span>
                                    </div>
                                )}

                                <p className="text-xs text-slate-300 mt-2">
                                    好运开局！第一步走顺了，接下来的任务也一定会势如破竹！
                                </p>
                            </div>

                            <button
                                data-testid="claim-first-blood-btn"
                                onClick={handleClaimReward}
                                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>收入囊中，乘胜追击！</span>
                                <Trophy className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FirstBloodModal;
