import React, { useState } from 'react';
import { Trash2, Sparkles, Plus } from '../icons';

export const OracleMessageBoard = ({
    globalMessages = [],
    setGlobalMessages,
    activeChild,
    profiles = [],
    inventory = {},
    onOpenCarve,
    showToast,
    hasActiveBg = false
}) => {
    // 过滤出未风化的有效传书，按时间倒序排
    const activeMessages = (globalMessages || [])
        .filter(m => m.expire > Date.now())
        .sort((a, b) => b.timestamp - a.timestamp);

    // 如果没有未过期的传书，则不显示展台
    if (activeMessages.length === 0) {
        return null;
    }

    const availableCarveItems = inventory['item_message'] || 0;

    // 添香 / 祈福 交互
    const handleBless = (msgId) => {
        setGlobalMessages(prev => {
            return (prev || []).map(msg => {
                if (msg.id !== msgId) return msg;
                const currentBlessed = msg.blessedBy || {};
                const hasBlessed = !!currentBlessed[activeChild];
                const newBlessedBy = { ...currentBlessed, [activeChild]: !hasBlessed };
                const delta = hasBlessed ? -1 : 1;
                const newCount = Math.max(0, (msg.blessings || 0) + delta);
                return {
                    ...msg,
                    blessings: newCount,
                    blessedBy: newBlessedBy
                };
            });
        });

        if (showToast) {
            showToast('success', '添香成功！愿祥瑞长伴，学业蒸蒸日上。', { duration: 2500 });
        }
    };

    // 擦除 / 删除 交互
    const handleDelete = (msgId) => {
        if (window.confirm('确定要擦除这条甲骨传书吗？')) {
            setGlobalMessages(prev => (prev || []).filter(m => m.id !== msgId));
            if (showToast) {
                showToast('info', '已擦除传书。');
            }
        }
    };

    // 展台容器根据是否有装备特效背景动态切换：
    // - 没装备特效背景时：实心吉金玄玉展台 (oracle-solid-stage)，不透明沉稳衬托
    // - 装备特效背景时：半透茶晶毛玻璃展台 (oracle-glass-stage)，透出背景灵动流光
    const stageContainerClass = hasActiveBg ? 'oracle-glass-stage' : 'oracle-solid-stage';
    const titleBarClass = hasActiveBg
        ? 'bg-black/15 backdrop-blur-sm border-b border-amber-500/20'
        : 'bg-black/35 border-b border-amber-500/25';
    const watermarkColor = hasActiveBg ? 'rgba(251, 191, 36, 0.25)' : 'rgba(251, 191, 36, 0.18)';

    return (
        <div className={`mb-8 ${stageContainerClass} rounded-3xl p-1 relative animate-in slide-in-from-top-4 duration-700 overflow-hidden`}>
            {/* 1. 展台背景装饰：金玉微芒 + 浮动甲骨文字水印 */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.12),transparent_70%)] pointer-events-none" />
            
            {/* 商周青铜流光角饰 */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/40 rounded-tl pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/40 rounded-tr pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/40 rounded-bl pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/40 rounded-br pointer-events-none" />

            {/* 背景甲骨文字拓片暗纹 (套用 loading 界面相同的甲骨文字体) */}
            <div 
                className="absolute inset-0 flex items-center justify-around pointer-events-none select-none text-5xl sm:text-7xl overflow-hidden tracking-widest px-4 oracle-font"
                style={{ 
                    fontFamily: "'方正甲骨文.TTF', 'FZXJRW', 'STKaiti', 'KaiTi', serif",
                    color: watermarkColor
                }}
                aria-hidden="true"
            >
                <span>恒</span>
                <span>日</span>
                <span>月</span>
                <span>山</span>
                <span>水</span>
                <span>天</span>
                <span>吉</span>
                <span>兮</span>
            </div>

            {/* 2. 展台标题栏 */}
            <div className={`relative z-10 flex flex-wrap items-center justify-between gap-2 px-5 py-3 ${titleBarClass}`}>
                <div className="flex items-center gap-2.5">
                    <span className="text-xl filter drop-shadow-md">🐢</span>
                    <h3 className="text-amber-400 font-black text-sm tracking-widest flex items-center gap-2 uppercase">
                        <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm font-serif">
                            灵龟甲骨·吉金传书
                        </span>
                        <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {activeMessages.length} 卷卜辞流转中
                        </span>
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    {/* 快捷执刀刻书按钮 */}
                    {availableCarveItems > 0 && onOpenCarve && (
                        <button
                            onClick={onOpenCarve}
                            className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                            title="立刻使用背包中的甲骨文传书刻下寄语"
                        >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            <span>执刀刻书 ({availableCarveItems})</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 3. 骨片横向陈列卷轴容器 */}
            <div className="relative z-10 p-4 sm:p-5 overflow-x-auto no-scrollbar flex gap-4 items-stretch">
                {activeMessages.map(msg => {
                    const totalDuration = 24 * 60 * 60 * 1000;
                    const remainingMs = Math.max(0, msg.expire - Date.now());
                    const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
                    // 剩余百分比，用于展示风化倒计时金沙条
                    const progressPercent = Math.min(100, Math.max(0, (remainingMs / totalDuration) * 100));

                    const isParentAuthor = msg.isParent || ['爸爸', '妈妈', '家长', '长辈'].includes(msg.author);
                    const authorProfile = profiles.find(p => p.name === msg.author);
                    const authorIcon = isParentAuthor ? (msg.author === '妈妈' ? '🌸' : msg.author === '长辈' ? '👴' : '👑') : authorProfile?.icon;
                    const sealName = isParentAuthor ? (msg.author === '妈妈' ? '慈母' : msg.author === '爸爸' ? '严父' : '慈亲') : (msg.author || '恒').slice(0, 2);

                    const isBlessed = !!(msg.blessedBy && msg.blessedBy[activeChild]);
                    const blessingCount = msg.blessings || 0;
                    // 家长寄语由手机端家长掌控，电脑端孩子不得删除；普通孩子只能删除自己刻录的传书
                    const canDelete = !isParentAuthor && (activeChild === msg.author || activeChild === '测试员');

                    return (
                        <div
                            key={msg.id}
                            className={`oracle-bone-tablet rounded-2xl p-4 sm:p-5 min-w-[260px] max-w-[300px] flex flex-col justify-between group shrink-0 relative transition-transform duration-300 hover:-translate-y-1.5 ${isParentAuthor ? 'ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/15' : ''}`}
                        >
                            {/* 骨板角部青铜暗饰 */}
                            <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-amber-800/30 rounded-tl pointer-events-none" />
                            <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-amber-800/30 rounded-tr pointer-events-none" />
                            <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-amber-800/30 rounded-bl pointer-events-none" />
                            <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-amber-800/30 rounded-br pointer-events-none" />

                            <div>
                                {/* 卡片头部：作者身份 + 朱砂私印 */}
                                <div className="flex items-center justify-between gap-2 mb-3 border-b border-amber-900/15 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-xs border shrink-0 ${isParentAuthor ? 'bg-gradient-to-br from-amber-600 to-yellow-600 text-stone-950 border-amber-300' : 'bg-gradient-to-br from-amber-800 to-amber-950 text-amber-100 border-amber-600/40'}`}>
                                            {authorIcon || sealName[0]}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <span className="text-xs font-black text-amber-950 truncate">{msg.author}</span>
                                                {isParentAuthor && (
                                                    <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white text-[9px] font-black shadow-2xs shrink-0">
                                                        慈亲寄语
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-amber-800/60 font-serif">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 刻录
                                            </span>
                                        </div>
                                    </div>

                                    {/* 传统朱砂印鉴 */}
                                    <div 
                                        className="oracle-cinnabar-seal px-2 py-0.5 border border-red-800/90 bg-gradient-to-br from-red-700 to-red-800 text-white rounded text-[10px] font-serif font-black shadow-xs tracking-widest select-none transform -rotate-3 hover:rotate-0 transition-transform"
                                        title={`${msg.author}之印鉴`}
                                    >
                                        {sealName}印
                                    </div>
                                </div>

                                {/* 骨片核心铭刻内容 (金石凹陷刻痕质感) */}
                                <div className="py-2.5">
                                    <p className="text-base font-serif font-bold leading-relaxed text-amber-950 break-words oracle-chiseled-text">
                                        “{msg.text}”
                                    </p>
                                </div>
                            </div>

                            {/* 卡片底部：风化时间、添香互动、擦除 */}
                            <div className="mt-3 pt-2.5 border-t border-amber-900/10 flex flex-col gap-2">
                                <div className="flex items-center justify-between text-xs">
                                    {/* 添香祈福按钮 */}
                                    <button
                                        type="button"
                                        onClick={() => handleBless(msg.id)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-transform active:scale-90 border ${
                                            isBlessed 
                                                ? 'bg-amber-100/90 border-amber-400 text-amber-800 shadow-xs' 
                                                : 'bg-amber-900/5 hover:bg-amber-900/10 border-amber-900/15 text-amber-900'
                                        }`}
                                        title={isBlessed ? '已添香，点击可撤回' : '为这条传书添香祈福'}
                                    >
                                        <span>🪔</span>
                                        <span>添香</span>
                                        {blessingCount > 0 && (
                                            <span className="px-1 py-0.2 rounded-full bg-amber-500/20 text-amber-900 text-[10px] font-mono font-bold">
                                                {blessingCount}
                                            </span>
                                        )}
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-amber-900/60 font-serif" title={`将在 ${new Date(msg.expire).toLocaleString()} 自然风化消逝`}>
                                            余{remainingHours}时风化
                                        </span>

                                        {/* 擦除按钮 */}
                                        {canDelete && (
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(msg.id)}
                                                className="text-stone-400 hover:text-red-700 transition-colors p-1 rounded-md hover:bg-red-50"
                                                title="擦除刻录"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* 金沙风化细条进度指示 */}
                                <div className="w-full h-1 bg-amber-950/10 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${progressPercent}%` }}
                                        title={`风化剩余: ${Math.round(progressPercent)}%`}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OracleMessageBoard;
