import React, { useState } from 'react';
import { XIcon, Sparkles } from '../icons';

export const OracleCarveModal = ({
    show,
    onClose,
    onCarve,
    activeChild,
    remainingCount = 1
}) => {
    const [messageText, setMessageText] = useState('');
    const maxLength = 30;

    if (!show) return null;

    const quickPhrases = [
        '🌟 今日打卡大满贯！',
        '🚀 向着文明纪元冲刺！',
        '💪 坚持自律，书写传奇！',
        '✨ 努力进取，天天向上！',
        '🏆 兄弟同心，其利断金！'
    ];

    const handleSubmit = () => {
        if (!messageText.trim()) return;
        onCarve(messageText.trim().slice(0, maxLength));
        setMessageText('');
    };

    const sealName = (activeChild || '恒').slice(0, 2);

    return (
        <div 
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-xl bg-gradient-to-b from-stone-900 via-[#181614] to-stone-950 border-2 border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(217,119,6,0.25)] p-6 sm:p-7 text-stone-200 overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* 顶部金线流光与青铜暗纹装饰 */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_10px_#f59e0b]" />
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

                {/* 弹窗标题 */}
                <div className="flex items-start justify-between mb-5 border-b border-amber-500/20 pb-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-3xl filter drop-shadow">🐢</span>
                            <div>
                                <h3 className="text-xl font-black text-amber-400 tracking-wider flex items-center gap-2">
                                    灵龟甲骨 · 执刀刻书
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">殷墟圣传</span>
                                </h3>
                                <p className="text-xs text-stone-400 mt-1">
                                    古之先贤钻甲以传言；刻下你的寄语，所有家族成员皆可看见。
                                </p>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-400 hover:text-white transition-colors"
                        title="取消"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* 实时骨板刻录预览区 */}
                <div className="mb-5">
                    <div className="text-xs font-bold text-amber-400 mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                            <span>骨片拓印 · 真实墨刻预览</span>
                        </span>
                        <span className="text-stone-400 text-xs font-medium">
                            剩余传书资格: <strong className="text-amber-400 text-sm font-bold font-mono">{remainingCount}</strong> 卷
                        </span>
                    </div>

                    <div className="relative rounded-2xl bg-gradient-to-br from-[#fcfbf7] via-[#f7f0e3] to-[#ebdcc4] border-2 border-[#d8cbb5] p-5 shadow-xl overflow-hidden min-h-[145px] flex flex-col justify-between">
                        {/* 仿商周青铜边角微饰 */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-900/40 rounded-tl pointer-events-none" />
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-900/40 rounded-tr pointer-events-none" />
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-900/40 rounded-bl pointer-events-none" />
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-900/40 rounded-br pointer-events-none" />

                        {/* 预览卡片头部 */}
                        <div className="flex items-center justify-between border-b border-amber-900/15 pb-2.5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-900 to-stone-900 text-amber-100 flex items-center justify-center text-xs font-black shadow-md border border-amber-600/30">
                                    {sealName[0] || '恒'}
                                </div>
                                <div>
                                    <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                                        <span>{activeChild}</span>
                                        <span className="text-[10px] text-amber-800/80 font-normal">正书其言</span>
                                    </div>
                                    <div className="text-[10px] text-amber-800/60 font-serif">贞卜吉辞 · 即将昭告长卷</div>
                                </div>
                            </div>

                            {/* 朱砂印章 */}
                            <div className="px-2.5 py-1 border-2 border-red-800 bg-red-700 text-white rounded text-[11px] font-serif font-black shadow-md tracking-widest transform -rotate-3 select-none flex items-center gap-1">
                                <span>印</span>
                                <span>{sealName}</span>
                            </div>
                        </div>

                        {/* 刻字效果内容 (清晰易读的现代中文字体) */}
                        <div className="py-4 px-2">
                            <p className="text-base sm:text-lg font-sans font-black text-amber-950 leading-relaxed tracking-wider break-words oracle-chiseled-text">
                                {messageText ? `“${messageText}”` : (
                                    <span className="text-amber-800/40 italic font-sans font-normal text-sm sm:text-base">
                                        “执刀于此，铭刻你的心声与勉励……”
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* 底部时间与沙漏 */}
                        <div className="flex items-center justify-between text-[11px] font-medium text-amber-900/70 pt-2 border-t border-amber-900/15">
                            <span className="flex items-center gap-1"><span>⏳</span> 刻成后长卷流传 24 小时</span>
                            <span className="flex items-center gap-1"><span>🪔</span> 家族成员随时添香祈愿</span>
                        </div>
                    </div>
                </div>

                {/* 刻录输入框 */}
                <div className="mb-4">
                    <div className="relative">
                        <textarea
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value.slice(0, maxLength))}
                            placeholder="在此铭刻寄语（限30字以内，全员可见）……"
                            rows={3}
                            className="w-full bg-black/50 border-2 border-amber-500/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 rounded-2xl p-4 text-amber-100 text-sm placeholder:text-stone-500 resize-none transition-all outline-hidden font-medium"
                            autoFocus
                        />
                        <div className={`absolute bottom-3 right-4 text-xs font-mono font-bold ${
                            messageText.length >= maxLength ? 'text-rose-400' : 'text-amber-500/70'
                        }`}>
                            {messageText.length} / {maxLength}
                        </div>
                    </div>
                </div>

                {/* 快捷灵感短句 */}
                <div className="mb-6">
                    <div className="text-xs text-amber-400/80 mb-2.5 font-bold flex items-center gap-1">
                        <span>💡</span> 灵感古辞速选：
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {quickPhrases.map((phrase, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setMessageText(phrase.slice(0, maxLength))}
                                className="px-3 py-1.5 rounded-xl bg-stone-800/90 hover:bg-amber-900/50 hover:text-amber-200 border border-stone-700 hover:border-amber-500/50 text-stone-300 text-xs font-bold transition-all active:scale-95 shadow-sm"
                            >
                                {phrase}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-2xl border border-stone-700 bg-stone-800/60 hover:bg-stone-800 text-stone-300 font-bold text-sm transition-colors"
                    >
                        收刀罢录
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!messageText.trim()}
                        className={`flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
                            messageText.trim()
                                ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 shadow-amber-500/25 active:scale-95 cursor-pointer'
                                : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700/50'
                        }`}
                    >
                        <span>🗡️ 刻录入骨 · 昭告全族</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OracleCarveModal;

