// src/components/gamification/TimeRewardModal.jsx
// 打卡时间奖励抽卡弹窗：准时神速打卡触发三选一暴击抽卡（2倍/3倍/5倍/再接再厉）

import React, { useState, useEffect, useContext } from 'react';
import { PerformanceContext } from '../../context/PerformanceContext';
import { getThemeHeaderStyle } from '../../data/themes.js';
import { 
    generateTimeRewardCards, 
    playCardFlipSound, 
    playCardFanfareSound 
} from '../../utils/gamification.js';

export const TimeRewardModal = ({
    show,
    task,
    baseGold = 1,
    deadline = '09:00',
    tier = null,
    onClose,
    onClaim,
    nextRewardAction,
    theme
}) => {
    const { isLowPerf } = useContext(PerformanceContext);
    const [cards, setCards] = useState([]);
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [revealed, setRevealed] = useState([false, false, false]);

    // 打开弹窗时重置并根据时段配置生成 3 张新卡
    useEffect(() => {
        if (show) {
            const maxMult = tier?.maxMultiplier || 5;
            setCards(generateTimeRewardCards(maxMult));
            setSelectedIdx(null);
            setRevealed([false, false, false]);
        }
    }, [show, tier]);

    if (!show || !task) return null;

    const selectedCard = selectedIdx !== null ? cards[selectedIdx] : null;
    const multiplier = selectedCard ? selectedCard.multiplier : 1;
    const bonusGold = selectedCard ? baseGold * (multiplier - 1) : 0;
    const totalGold = baseGold + bonusGold;

    // 点击翻牌
    const handlePickCard = (idx) => {
        if (selectedIdx !== null) return;
        setSelectedIdx(idx);

        // 立即翻转所选卡牌
        setRevealed(prev => {
            const next = [...prev];
            next[idx] = true;
            return next;
        });

        playCardFlipSound();

        const picked = cards[idx];
        if (picked && picked.multiplier >= 2) {
            playCardFanfareSound(picked.multiplier);
            if (typeof window !== 'undefined' && window.confetti) {
                try {
                    window.confetti({
                        particleCount: picked.multiplier >= 3 ? 90 : 50,
                        spread: 70,
                        origin: { y: 0.58 }
                    });
                } catch (e) {}
            }
        }

        // 450ms 后揭秘其余两张未选中的卡牌
        setTimeout(() => {
            setRevealed([true, true, true]);
        }, 450);
    };

    // 领取奖励并执行后续管道奖励
    const handleClaim = () => {
        if (onClaim && selectedCard) {
            onClaim({
                task,
                baseGold,
                deadline,
                multiplier,
                bonusGold,
                totalGold,
                card: selectedCard
            });
        }
        if (onClose) {
            onClose();
        }
        // 若有打卡即时奖励（转盘等），在抽卡完成后顺延触发
        if (nextRewardAction) {
            setTimeout(() => {
                nextRewardAction();
            }, 380);
        }
    };

    // 点击右上角直接退出兜底
    const handleSafeClose = () => {
        if (selectedIdx === null && cards.length > 0) {
            // 若孩子未翻牌直接点关闭，默认按首张卡保底兑现，不错过福利
            const autoCard = cards[0];
            const autoBonus = baseGold * (autoCard.multiplier - 1);
            if (onClaim) {
                onClaim({
                    task,
                    baseGold,
                    deadline,
                    multiplier: autoCard.multiplier,
                    bonusGold: autoBonus,
                    totalGold: baseGold + autoBonus,
                    card: autoCard
                });
            }
        } else if (onClaim && selectedCard) {
            onClaim({
                task,
                baseGold,
                deadline,
                multiplier,
                bonusGold,
                totalGold,
                card: selectedCard
            });
        }

        if (onClose) onClose();
        if (nextRewardAction) {
            setTimeout(() => {
                nextRewardAction();
            }, 380);
        }
    };

    return (
        <div 
            data-testid="time-reward-modal" 
            className="fixed inset-0 z-[105] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
        >
            <div 
                className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border transition-all ${
                    theme?.border || 'border-amber-400/60'
                } ${isLowPerf ? 'bg-slate-900 text-white' : 'bg-slate-900/95 text-white backdrop-blur-xl'}`}
            >
                {/* 顶部标题栏 */}
                <div 
                    className={`p-4 sm:p-5 flex items-center justify-between text-white ${theme?.solidBg || 'bg-amber-600'}`}
                    style={getThemeHeaderStyle(theme)}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-2xl animate-pulse">{tier?.icon || '⏰'}</span>
                        <div>
                            <h3 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-1.5">
                                <span>{tier?.name || '神速打卡 · 暴击抽卡'}</span>
                                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
                                    {tier?.deadline || deadline} 前达标
                                </span>
                            </h3>
                            <p className="text-[11px] text-white/80 mt-0.5">
                                恭喜在 {tier?.deadline || deadline} 前完成「{task.name}」！最高狂抽 {tier?.maxMultiplier || 5} 倍暴击
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleSafeClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white/80 hover:text-white transition"
                        title="关闭"
                    >
                        ✕
                    </button>
                </div>

                {/* 卡牌抽奖区 */}
                <div className="p-4 sm:p-6 space-y-4 text-center">
                    {/* 基础收益提示 */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs">
                        <span className="text-slate-400">本次基础收益：</span>
                        <span className="text-amber-300 font-black flex items-center gap-1">
                            <span>+{baseGold}</span>
                            <span>💰 金元宝</span>
                        </span>
                    </div>

                    {/* 3 张卡牌翻牌区域 */}
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 py-2">
                        {cards.map((card, idx) => {
                            const isPicked = selectedIdx === idx;
                            const isCardRevealed = revealed[idx];
                            const isOtherCard = selectedIdx !== null && !isPicked;

                            return (
                                <div 
                                    key={card.id || idx}
                                    className="card-flip-container h-40 sm:h-48 w-full cursor-pointer select-none"
                                    onClick={() => handlePickCard(idx)}
                                >
                                    <div 
                                        className={`card-flip-inner w-full h-full rounded-2xl transition-all duration-500 ${
                                            isCardRevealed ? 'is-flipped' : ''
                                        }`}
                                    >
                                        {/* 卡牌背面 (未翻开) */}
                                        <div 
                                            className={`card-face card-face-back rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-between border-2 transition-all overflow-hidden ${
                                                selectedIdx === null
                                                    ? 'bg-gradient-to-br from-indigo-900/90 via-slate-900 to-indigo-950 border-indigo-400/40 hover:border-amber-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                                                    : 'bg-slate-900 border-slate-700 opacity-60'
                                            }`}
                                        >
                                            {/* 闪光扫过层 */}
                                            {selectedIdx === null && (
                                                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                                                    <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-card-shimmer"></div>
                                                </div>
                                            )}

                                            <div className="text-[10px] text-amber-300/80 font-bold tracking-wider">
                                                ★ 秘宝 ★
                                            </div>

                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-xl sm:text-2xl shadow-inner">
                                                    ❓
                                                </div>
                                                <span className="text-[10px] text-slate-300 font-bold mt-1">
                                                    点击翻牌
                                                </span>
                                            </div>

                                            <div className="text-[9px] text-indigo-300/60 font-mono">
                                                LUCKY
                                            </div>
                                        </div>

                                        {/* 卡牌正面 (翻开后) */}
                                        <div 
                                            className={`card-face card-face-front rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-between border-2 transition-all ${
                                                card.border
                                            } bg-gradient-to-br ${card.gradient} ${
                                                isPicked 
                                                    ? `${card.glow} scale-102 ring-2 ring-amber-400/80` 
                                                    : isOtherCard ? 'opacity-50 grayscale-20 scale-95' : ''
                                            }`}
                                        >
                                            {/* 选中的标识 / 未选标识 */}
                                            <div className="w-full flex items-center justify-between">
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${card.badge}`}>
                                                    {card.name}
                                                </span>
                                                {isPicked && (
                                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-sm animate-pulse">
                                                        抽中!
                                                    </span>
                                                )}
                                                {isOtherCard && (
                                                    <span className="text-[9px] text-slate-400 font-medium">
                                                        未选择
                                                    </span>
                                                )}
                                            </div>

                                            {/* 图标与倍率 */}
                                            <div className="flex flex-col items-center my-auto">
                                                <span className="text-3xl sm:text-4xl filter drop-shadow">
                                                    {card.icon}
                                                </span>
                                                <div className="text-2xl sm:text-3xl font-black tracking-tight mt-1" style={{ color: card.color }}>
                                                    {card.multiplier}x
                                                </div>
                                                <span className="text-[10px] font-bold text-white/90 mt-0.5">
                                                    {card.title}
                                                </span>
                                            </div>

                                            {/* 底部收益预览 */}
                                            <div className="text-[10px] font-mono text-amber-200/90 bg-black/30 px-2 py-0.5 rounded-md w-full text-center">
                                                {card.multiplier === 1 ? `原额 ${baseGold} 💰` : `收益 ${baseGold * card.multiplier} 💰`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 状态指示与结果结算 */}
                    {selectedIdx === null ? (
                        <p className="text-xs text-slate-400 animate-pulse">
                            👆 请点击上方任意一张神秘卡牌翻开你的神速暴击！
                        </p>
                    ) : (
                        <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* 收益结算横幅 */}
                            <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-center space-y-1">
                                {multiplier > 1 ? (
                                    <>
                                        <div className="text-xs text-amber-400 font-bold flex items-center justify-center gap-1">
                                            <span>⚡ 触发 {selectedCard?.name}（{multiplier}倍暴击）！</span>
                                        </div>
                                        <div className="text-lg sm:text-xl font-black text-amber-300 flex items-center justify-center gap-1.5">
                                            <span>打卡基础 {baseGold} 💰</span>
                                            <span>× {multiplier}</span>
                                            <span>=</span>
                                            <span className="text-2xl text-yellow-300 underline decoration-amber-400/50">
                                                共 {totalGold} 💰
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-emerald-400 font-bold">
                                            🎉 额外暴击入账 +{bonusGold} 金元宝！
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-xs text-emerald-400 font-bold">
                                            🌱 稳扎稳打 · 再接再厉！
                                        </div>
                                        <div className="text-base font-black text-amber-300">
                                            获得原额打卡奖励：+{baseGold} 💰 金元宝
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            明天继续保持在 {deadline} 前打卡，翻倍大奖等着你！
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* 按钮 */}
                            <button
                                data-testid="claim-time-reward-btn"
                                onClick={handleClaim}
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/20 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>🎉 开心收下</span>
                                {bonusGold > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-950/20 text-amber-950 font-bold text-xs">
                                        额外 +{bonusGold} 币
                                    </span>
                                )}
                            </button>

                            {/* 若有后续打卡即时奖励，温馨预告 */}
                            {nextRewardAction && (
                                <p className="text-[11px] text-amber-300/80 font-medium">
                                    ✨ 收下后将立即开启打卡即时幸运大转盘！
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimeRewardModal;
