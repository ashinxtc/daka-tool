import React, { useState, useEffect } from 'react';

const getEraInfos = () => (typeof window !== 'undefined' && window.ERA_INFOS) ? window.ERA_INFOS : ((typeof ERA_INFOS !== 'undefined') ? ERA_INFOS : {});
const getEraColors = () => (typeof window !== 'undefined' && window.ERA_COLORS) ? window.ERA_COLORS : ((typeof ERA_COLORS !== 'undefined') ? ERA_COLORS : {});

// 随机事件弹窗及升级通知
export const getEventRewards = (eventData) => {
    if (eventData.rewards) return eventData.rewards;
    return [{ type: eventData.rewardType, value: eventData.rewardValue }];
};

// 奖励标签组件 - 升级为立体流光胶囊
export const RewardBadges = ({ rewards }) => (
    <div className="flex flex-wrap justify-center gap-2.5">
        {rewards.map((r, i) => {
            const isPos = r.value >= 0;
            const isGold = r.type === 'gold';
            return (
                <div
                    key={i}
                    className={`px-4 py-1.5 rounded-full font-black text-sm flex items-center gap-1.5 border shadow-sm transition-transform hover:scale-105 ${
                        isPos
                            ? (isGold
                                ? 'bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-900 border-amber-300 shadow-amber-200/50'
                                : 'bg-gradient-to-r from-indigo-50 to-blue-100 text-indigo-900 border-indigo-300 shadow-indigo-200/50')
                            : 'bg-gradient-to-r from-rose-50 to-red-100 text-red-700 border-red-300 shadow-red-200/50'
                    }`}
                >
                    <span>{isGold ? '💰' : '✨'}</span>
                    <span>{isPos ? '+' : ''}{r.value}</span>
                    <span className="text-xs opacity-80">{isGold ? '金元宝' : '成长灵泉(XP)'}</span>
                </div>
            );
        })}
    </div>
);

export const HistoryEventImage = ({ eventData }) => {
    const seqNum = (eventData?.id || '').replace(/hist_/, '');
    const safeTitle = (eventData?.title || '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
    const safeEra = (eventData?.era || '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
    const imgSrc = `img/historyevents/${seqNum}_${safeEra}_${safeTitle}.png`;
    const [imgExists, setImgExists] = React.useState(false);
    
    React.useEffect(() => {
        const img = new Image();
        img.onload = () => setImgExists(true);
        img.onerror = () => setImgExists(false);
        img.src = imgSrc;
    }, [imgSrc]);
    
    if (!imgExists) return null;
    return (
        <div className="mb-4 rounded-2xl overflow-hidden border-2 border-amber-700/30 shadow-md">
            <img src={imgSrc} alt={eventData?.title || ''} className="w-full aspect-square object-cover block" />
        </div>
    );
};

export const RandomEventModal = ({ show, eventData, onClose, theme }) => {
    if (!show || !eventData) return null;
    const ERA_INFOS = getEraInfos();
    const ERA_COLORS = getEraColors();
    const rewards = getEventRewards(eventData);
    const eventType = eventData.type || 'repeat';

    // ===== 历史事件弹窗 =====
    if (eventType === 'history') {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
                <div className="bg-gradient-to-b from-[#fcfaf2] via-[#f7f1e1] to-[#ede3cb] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border-2 border-amber-700/40 relative animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                    {/* 古韵流光头部 */}
                    <div className="h-44 bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 relative flex flex-col items-center justify-center overflow-hidden border-b border-amber-600/30">
                        <div className="absolute inset-0 opacity-15" style={{backgroundImage: 'repeating-linear-gradient(45deg, #d97706 0, #d97706 1px, transparent 0, transparent 40%)', backgroundSize: '12px 12px'}} />
                        <div className="text-6xl mb-1 drop-shadow-xl animate-pulse">📜</div>
                        <div className="absolute top-3 left-3">
                            <span className="bg-amber-900/80 text-amber-200 text-xs font-bold px-3 py-1 rounded-full border border-amber-600/60 tracking-wider shadow-sm flex items-center gap-1">
                                <span>📅</span> 历史长河
                            </span>
                        </div>
                        <div className="absolute bottom-2.5 right-3 text-amber-300 text-xs font-bold tracking-widest bg-stone-900/70 px-2 py-0.5 rounded border border-amber-600/30">
                            {eventData.era}
                        </div>
                    </div>
                    {/* 正文内容 */}
                    <div className="p-6">
                        <h2 className="text-2xl font-black text-stone-900 text-center mb-1.5 tracking-wide">{eventData.title}</h2>
                        {eventData.time && (
                            <p className="text-center text-amber-800 text-xs font-bold italic mb-4 flex items-center justify-center gap-1.5 bg-amber-200/50 py-1 px-3 rounded-full w-fit mx-auto border border-amber-300/60">
                                <span>⏳</span> 纪元时空: {eventData.time}
                            </p>
                        )}
                        {/* 历史事件图片 */}
                        <HistoryEventImage eventData={eventData} />
                        <div className="text-stone-700 leading-relaxed text-sm mb-5 bg-white/70 p-4 rounded-2xl border border-amber-800/15 shadow-inner text-justify font-medium">
                            {eventData.desc}
                        </div>
                        <div className="mb-5"><RewardBadges rewards={rewards} /></div>
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-800 via-amber-900 to-stone-900 hover:from-amber-900 hover:to-black text-amber-100 font-black shadow-lg transition-transform active:scale-95 tracking-widest text-base border border-amber-600/40"
                        >
                            📜 收录史册 · 铭记纪元
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ===== 固定（unique）奇遇事件弹窗 =====
    if (eventType === 'unique') {
        const eraGrad = ERA_INFOS[eventData.era]?.textGradient || theme?.gradient || 'from-indigo-600 via-purple-600 to-pink-600';
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
                <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border-2 border-indigo-400/30 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                    <div className={`h-40 bg-gradient-to-br ${eraGrad} relative flex items-center justify-center overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                        <div className="text-6xl animate-bounce drop-shadow-2xl">
                            {rewards[0]?.type === 'gold' ? '🏺' : '✨'}
                        </div>
                        <div className="absolute top-3 left-3">
                            <span className="bg-white/25 text-white text-xs font-black px-3 py-1 rounded-full backdrop-blur-md border border-white/30 tracking-widest shadow-sm">
                                ✨ 时空奇遇
                            </span>
                        </div>
                        <div className="absolute bottom-2.5 right-3 text-white/90 text-xs font-black tracking-wider bg-black/30 px-2 py-0.5 rounded backdrop-blur-xs">
                            {eventData.era}
                        </div>
                    </div>
                    <div className="p-6 text-center">
                        <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-wide">{eventData.title}</h2>
                        <div className="text-slate-600 leading-relaxed text-sm mb-5 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/80 text-justify font-medium">
                            {eventData.desc}
                        </div>
                        <div className="mb-5"><RewardBadges rewards={rewards} /></div>
                        <button
                            onClick={onClose}
                            className={`w-full py-3.5 rounded-2xl text-white font-black shadow-lg transition-transform active:scale-95 text-base tracking-wider ${theme?.primaryBg || 'bg-indigo-600'} ${theme?.primaryBgHover || 'hover:bg-indigo-700'}`}
                        >
                            ✨ 收下这份天赐馈赠
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ===== 重复（repeat）日常事件弹窗 =====
    const eraColor = ERA_COLORS[eventData.era] || { bg: 'bg-slate-700' };
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border-2 border-slate-300/40 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className={`h-32 ${eraColor.bg} relative flex items-center justify-center overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="text-5xl drop-shadow-lg relative z-10 animate-pulse">🎲</div>
                    <div className="absolute top-3 left-3">
                        <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full border border-white/30 tracking-widest">
                            🎲 日常奇遇
                        </span>
                    </div>
                    <div className="absolute bottom-2.5 right-3 text-white/80 text-xs font-bold tracking-wider bg-black/30 px-2 py-0.5 rounded">
                        {eventData.era}
                    </div>
                </div>
                <div className="p-6 text-center">
                    <h2 className="text-xl font-black text-slate-800 mb-3">{eventData.title}</h2>
                    <div className="text-slate-600 text-sm leading-relaxed mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-justify font-medium">
                        {eventData.desc}
                    </div>
                    <div className="mb-5"><RewardBadges rewards={rewards} /></div>
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-black shadow-lg transition-transform active:scale-95 tracking-wider text-sm"
                    >
                        🚶 继续前行
                    </button>
                </div>
            </div>
        </div>
    );
};

// 升级通知弹窗 - 升级为金榜登科·纪元突破大典
export const LevelUpNotification = ({ show, onClose, levelInfo }) => {
    if (!show || !levelInfo) return null;
    const ERA_COLORS = getEraColors();
    const eraColorConf = ERA_COLORS[levelInfo.era] || { text: 'text-amber-600', bg: 'bg-amber-600' };
    const textCls = (eraColorConf.text || 'text-amber-600').replace('100', '600');
    const bgCls = eraColorConf.bg || 'bg-amber-600';

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden border-2 border-amber-400/40 animate-level-up" onClick={e => e.stopPropagation()}>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/70 via-white to-orange-50 -z-10" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-4xl mb-4 shadow-lg shadow-amber-300/50 animate-bounce">
                    🆙
                </div>
                <h2 className="text-2xl font-black text-stone-800 mb-1">🎉 进化成功 · 纪元跨越！</h2>
                <p className="text-stone-500 text-xs font-bold mb-4">恭喜恒宝！自律修为精进，已跨入崭新文明：</p>
                <div className={`text-3xl font-black mb-2 tracking-wide ${textCls}`}>
                    {levelInfo.name}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-black text-white mb-5 shadow-sm ${bgCls}`}>
                    Lv.{levelInfo.level} · {levelInfo.era}
                </div>
                <p className="text-stone-700 text-sm font-medium mb-7 bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 italic leading-relaxed">
                    “{levelInfo.desc}”
                </p>
                <button
                    onClick={onClose}
                    className="w-full py-3.5 bg-gradient-to-r from-stone-900 via-amber-900 to-stone-900 text-amber-200 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform cursor-pointer tracking-widest text-base border border-amber-500/40"
                >
                    🚀 领旨继续征程
                </button>
            </div>
        </div>
    );
};

export default RandomEventModal;

