import React, { useState } from 'react';
import { XIcon, Sparkles } from '../icons';

/**
 * 家长爱心礼盒与红包拆领弹窗
 * 支持拆红包动画、喜庆撒花、金币入账与额外转盘唤醒
 */
export const ParentGiftModal = ({
    show,
    onClose,
    gifts = [],
    activeChild,
    onClaimRedPacket,
    onClaimWheel
}) => {
    const [openedMap, setOpenedMap] = useState({}); // { [actionId]: true }
    const [isOpening, setIsOpening] = useState(false);
    const [currentGiftState, setCurrentGiftState] = useState(null);

    // 当弹窗打开时，若没有当前展示的礼物，或者当前礼物已结算完毕，则初始化/切换
    React.useEffect(() => {
        if (show && gifts.length > 0 && !currentGiftState) {
            setCurrentGiftState(gifts[0]);
        }
    }, [show, gifts, currentGiftState]);

    if (!show || (!currentGiftState && (!gifts || gifts.length === 0))) return null;

    // 当前展示的礼物
    const currentGift = currentGiftState || gifts[0];
    if (!currentGift) return null;

    const isRedPacket = currentGift.type === 'red_packet';
    const isOpened = !!openedMap[currentGift.id];
    const operator = currentGift.operatorRole || '家长';
    const amount = parseInt(currentGift.amount, 10) || 0;
    const wheelType = currentGift.wheelType === 'xp' ? 'xp' : 'gold';
    const wheelName = wheelType === 'xp' ? '经验XP大转盘' : '金元宝大转盘';

    const handleOpenRedPacket = () => {
        if (isOpening || isOpened) return;
        setIsOpening(true);
        setTimeout(() => {
            setIsOpening(false);
            setOpenedMap(prev => ({ ...prev, [currentGift.id]: true }));
            if (window.confetti) {
                window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            }
            onClaimRedPacket?.(currentGift);
        }, 900);
    };

    const handleCloseOrNext = () => {
        // 查找是否还有下一个未领取的礼物
        const remaining = gifts.filter(g => g.id !== currentGift.id);
        if (remaining.length > 0) {
            setCurrentGiftState(remaining[0]);
        } else {
            setCurrentGiftState(null);
            onClose();
        }
    };

    const handleSpinWheel = () => {
        onClaimWheel?.(currentGift);
        handleCloseOrNext();
    };

    return (
        <div 
            className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) handleCloseOrNext(); }}
        >
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
                {/* 关闭按钮 */}
                <button
                    onClick={handleCloseOrNext}
                    className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                {isRedPacket ? (
                    /* 🧧 传统中国红金元宝红包卡片 */
                    <div className="bg-gradient-to-b from-red-600 via-red-600 to-rose-700 text-white p-6 pt-8 text-center flex flex-col items-center relative overflow-hidden border-2 border-amber-400/40 shadow-inner">
                        {/* 顶栏暗花背景 */}
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-400/10 to-transparent pointer-events-none" />
                        
                        {/* 发送者头像徽章 */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 border-2 border-white shadow-lg flex items-center justify-center text-3xl mb-3 shadow-amber-900/40">
                            {operator === '妈妈' ? '🌸' : operator === '长辈' ? '👴' : '👑'}
                        </div>

                        <h3 className="text-lg font-black tracking-wide text-amber-200 drop-shadow-xs">
                            【{operator}】送来爱心红包
                        </h3>
                        <p className="text-xs text-rose-200 mt-1 max-w-[260px] line-clamp-2 italic">
                            “{currentGift.reason || '宝贝今天表现真棒，特此犒赏！'}”
                        </p>

                        {!isOpened ? (
                            /* 待拆红包封皮 */
                            <div className="my-8 flex flex-col items-center">
                                <div className="text-xs text-amber-300/80 mb-4 font-bold tracking-widest">
                                    ✦ 点击金印，开运纳宝 ✦
                                </div>
                                <button
                                    type="button"
                                    onClick={handleOpenRedPacket}
                                    disabled={isOpening}
                                    className={`w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-stone-900 font-serif font-black text-2xl border-4 border-amber-100 shadow-[0_0_30px_rgba(251,191,36,0.6)] flex items-center justify-center transform transition-transform active:scale-95 cursor-pointer ${
                                        isOpening ? 'animate-spin' : 'hover:scale-105 animate-bounce'
                                    }`}
                                >
                                    {isOpening ? '✦' : '開'}
                                </button>
                            </div>
                        ) : (
                            /* 已拆开奖励展示 */
                            <div className="my-6 w-full bg-red-700/60 border border-amber-300/40 rounded-2xl p-5 backdrop-blur-xs animate-in zoom-in-90 duration-300">
                                <div className="text-xs text-amber-200 font-bold mb-1">恭喜入账金元宝</div>
                                <div className="text-4xl font-black text-yellow-300 tracking-tight flex items-center justify-center gap-1 drop-shadow-sm">
                                    <span>+{amount}</span>
                                    <span className="text-2xl">💰</span>
                                </div>
                                <div className="text-[11px] text-rose-200 mt-2">
                                    已记入【{activeChild}】的金元宝账单明细！
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCloseOrNext}
                                    className="mt-4 w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
                                >
                                    开心收下
                                </button>
                            </div>
                        )}

                        <div className="text-[10px] text-rose-300/75 mt-1">
                            来自家长护航台 · 时空市集关怀特派
                        </div>
                    </div>
                ) : (
                    /* 🎡 仙缘转盘赏赐卡片 */
                    <div className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white p-6 pt-8 text-center flex flex-col items-center relative overflow-hidden border-2 border-indigo-500/40 shadow-inner">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white shadow-lg flex items-center justify-center text-3xl mb-3 shadow-indigo-950">
                            🎡
                        </div>

                        <h3 className="text-lg font-black tracking-wide text-indigo-200 drop-shadow-xs">
                            【{operator}】赐予仙缘转盘！
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 max-w-[260px] line-clamp-2 italic">
                            “{currentGift.reason || '努力终有回报，转出你的幸运！'}”
                        </p>

                        <div className="my-6 w-full bg-indigo-900/40 border border-indigo-400/30 rounded-2xl p-5 text-center">
                            <div className="text-xs text-indigo-300 font-bold mb-1">本次获得抽奖机会</div>
                            <div className="text-xl font-black text-amber-300 mt-1 flex items-center justify-center gap-1.5">
                                <span>{wheelType === 'xp' ? '⚡' : '🌟'}</span>
                                <span>{wheelName} × 1次</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-2">
                                点击下方按钮，立即前往转盘转动你的机缘！
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleSpinWheel}
                            className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-500/30 cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-1.5"
                        >
                            <span>🎰</span> 立即开启转盘抽奖
                        </button>

                        <div className="text-[10px] text-slate-500 mt-3">
                            随时可点击左侧礼物图标再次开启
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentGiftModal;
