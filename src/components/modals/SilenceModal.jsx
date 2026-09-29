import React, { useState, useEffect } from 'react';
import { XIcon, Sparkles } from '../icons.jsx';

// 静音卡（禁言令）选择弹窗：选择禁言对象与时长
export const SilenceModal = ({
    show,
    onClose,
    profiles = [],
    inventoryCount = 0,
    onConfirm,
    showToast: propShowToast,
}) => {
    const showToast =
        propShowToast ||
        (typeof window !== 'undefined' && window.showToast) ||
        ((type, msg) => alert(msg));

    const [selected, setSelected] = useState({});
    const [duration, setDuration] = useState(10);

    useEffect(() => {
        if (show) {
            setSelected({});
            setDuration(10);
        }
    }, [show]);

    if (!show) return null;

    const DURATIONS = [10, 20, 30, 40, 50, 60];
    const costPerUser = duration / 10;
    const selectedNames = Object.keys(selected).filter(k => selected[k]);
    const totalCost = selectedNames.length * costPerUser;
    const canConfirm = totalCost > 0 && totalCost <= inventoryCount;

    const toggle = (name) => setSelected(prev => ({ ...prev, [name]: !prev[name] }));

    const handleConfirm = () => {
        if (!canConfirm) {
            if (totalCost > inventoryCount) {
                showToast(
                    'warning',
                    `静音卡数量不足：需要 ${totalCost} 张，乾坤袋当前仅有 ${inventoryCount} 张。`
                );
            }
            return;
        }
        onConfirm(selectedNames, duration);
        setSelected({});
        setDuration(10);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-b from-slate-900 via-indigo-950/90 to-slate-900 rounded-3xl shadow-[0_25px_60px_-15px_rgba(99,102,241,0.35)] max-w-md w-full overflow-hidden border-2 border-indigo-500/40 relative animate-in zoom-in-95 duration-300 text-white"
                onClick={e => e.stopPropagation()}
            >
                {/* 顶部环境光晕 */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-violet-600/25 via-indigo-600/10 to-transparent pointer-events-none"></div>

                {/* 标头 */}
                <div className="bg-gradient-to-r from-violet-900/90 via-indigo-900/90 to-purple-950/90 px-6 py-4.5 border-b border-indigo-500/30 relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-violet-500/20 border border-violet-400/40 flex items-center justify-center text-2xl shadow-inner shadow-violet-500/50">
                                🤫
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white flex items-center gap-1.5 drop-shadow-sm">
                                    上古禁言令 · 静音结界
                                </h3>
                                <p className="text-xs text-indigo-200/80 mt-0.5">
                                    施加禁音法旨，摒除杂念，沉心修行
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors cursor-pointer border border-slate-700/50"
                            title="关闭"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* 禁言对象 */}
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> 结界笼罩对象 (可多选)
                            </span>
                            <span className="text-[11px] text-slate-400">
                                已选 {selectedNames.length} 人
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {profiles.map(p => {
                                const isChecked = !!selected[p.name];
                                return (
                                    <button
                                        key={p.name}
                                        type="button"
                                        onClick={() => toggle(p.name)}
                                        className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all transform active:scale-95 cursor-pointer flex items-center gap-2 border ${
                                            isChecked
                                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                                                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border-slate-700'
                                        }`}
                                    >
                                        <span>{p.name}</span>
                                        {isChecked && (
                                            <span className="w-4 h-4 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center">
                                                ✓
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 禁言时长 */}
                    <div>
                        <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2.5">
                            ⏳ 结界封印时长
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {DURATIONS.map(m => {
                                const isSel = duration === m;
                                return (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setDuration(m)}
                                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all transform active:scale-95 cursor-pointer flex flex-col items-center justify-center border ${
                                            isSel
                                                ? 'bg-indigo-600 text-white border-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                                                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 border-slate-700'
                                        }`}
                                    >
                                        <span className="font-black text-sm">{m}</span>
                                        <span className="text-[10px] opacity-80">分钟</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 消耗与库存核算卡片 */}
                    <div className="bg-slate-950/60 rounded-2xl p-4 border border-indigo-500/20 text-sm space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">所需静音令法旨：</span>
                            <span className="font-black text-base text-violet-400">
                                {totalCost} <span className="text-xs font-normal">张</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-t border-slate-800/80 pt-2">
                            <span className="text-slate-400">乾坤袋静音卡库存：</span>
                            <span
                                className={`font-bold ${
                                    inventoryCount >= totalCost ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                            >
                                {inventoryCount} 张
                            </span>
                        </div>

                        {totalCost > inventoryCount && (
                            <div className="text-[11px] text-rose-400 bg-rose-950/30 p-2 rounded-xl border border-rose-800/50 mt-1">
                                ⚠️ 乾坤袋中静音卡数量不足，无法下达法旨，请前往集市兑换。
                            </div>
                        )}
                        {totalCost === 0 && (
                            <div className="text-[11px] text-slate-400 mt-1 text-center">
                                请至少选择一位结界笼罩成员
                            </div>
                        )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-2xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors cursor-pointer"
                        >
                            取消作罢
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!canConfirm}
                            className={`flex-1 py-3 rounded-2xl font-black text-sm text-white transition-all transform active:scale-95 cursor-pointer ${
                                canConfirm
                                    ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 shadow-[0_8px_20px_-3px_rgba(139,92,246,0.6)] border border-violet-400/40'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                        >
                            🔕 敕令下达 (施展结界)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SilenceModal;
