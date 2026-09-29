import React, { useState } from 'react';
import { showToast } from '../common/Toast';
import { XIcon, Coins, CheckCircle2 } from '../icons.jsx';

// 皇室进贡与友爱打赏令弹窗
export const TributeModal = ({ 
    show, 
    onClose, 
    activeChild, 
    stats, 
    setStats, 
    totalGold, 
    setWheelHistory, 
    profiles 
}) => {
    // 保证 Hook 在组件顶层无条件执行
    const [target, setTarget] = useState('');
    const [amount, setAmount] = useState('');

    if (!show) return null;

    // 过滤除当前孩子以外的其他成员
    const otherProfiles = (profiles || []).filter(p => p.name !== activeChild);
    const numAmount = Math.floor(parseFloat(amount)) || 0;
    const isExceeded = numAmount > totalGold;
    const remainingGold = Math.max(0, totalGold - numAmount);

    const handleTribute = () => {
        const val = Math.floor(parseFloat(amount));
        if (!target) return showToast('warning', '请先在上方点击选择要进贡的同伴！');
        if (isNaN(val) || val <= 0) return showToast('warning', '请输入有效的进贡金币数量！');
        if (val > totalGold) return showToast('warning', '当前财富不足以支持本次进贡！');

        const historyKey = `${activeChild}-TRIBUTE_OUT-${target}-${Date.now()}`;
        setWheelHistory(prev => ({
            ...prev,
            [historyKey]: -val
        }));

        // 将进贡信息写入目标用户的待接收队列中
        setStats(prev => {
            const targetStats = prev[target] || {};
            const pendingTributes = targetStats.pendingTributes || [];
            return {
                ...prev,
                [target]: {
                    ...targetStats,
                    pendingTributes: [...pendingTributes, { from: activeChild, amount: val, time: new Date().getTime() }]
                }
            };
        });

        showToast('success', `🎉 进贡呈送成功！已向 ${target} 奉上 ${val} 财富！`);
        setTarget('');
        setAmount('');
        onClose();
    };

    // 快捷增量注入
    const addQuickAmount = (increment) => {
        const current = Math.floor(parseFloat(amount)) || 0;
        const next = Math.min(totalGold, current + increment);
        setAmount(String(next));
    };

    const setAllAmount = () => {
        setAmount(String(totalGold));
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="bg-gradient-to-b from-amber-50/95 via-white to-orange-50/90 rounded-3xl shadow-[0_25px_60px_rgba(245,158,11,0.25)] border-2 border-amber-300/80 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
                {/* 皇室圣旨顶部纹章标头 */}
                <div className="relative px-6 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl shadow-inner">
                            👑
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-1.5 drop-shadow-sm">
                                皇室进贡 · 友爱打赏令
                            </h3>
                            <p className="text-[11px] text-amber-100/90">手足同心，同甘共苦 · 向同伴奉上金元宝</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                        title="关闭"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
                    {/* 第一步：选择进贡对象 */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                                <span>1. 选择受赏同伴</span>
                                <span className="text-amber-600 font-normal">（点击头像卡片选择）</span>
                            </label>
                            {target && (
                                <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                                    已选择: {target}
                                </span>
                            )}
                        </div>

                        {otherProfiles.length === 0 ? (
                            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-center text-xs text-amber-800">
                                🏠 当前暂无其他成员角色，请在右上角多角色管理中添加成员同伴后即可开启进贡打赏！
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {otherProfiles.map(p => {
                                    const isSelected = target === p.name;
                                    const targetGold = stats?.[p.name]?.gold || 0;
                                    return (
                                        <button
                                            key={p.name}
                                            type="button"
                                            onClick={() => setTarget(p.name)}
                                            className={`group relative p-2.5 rounded-2xl border text-left transition-all duration-200 flex flex-col items-center gap-1.5 ${
                                                isSelected 
                                                    ? 'bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-500 shadow-md ring-2 ring-amber-300 scale-[1.02]' 
                                                    : 'bg-white/90 border-gray-200 hover:border-amber-300 hover:bg-amber-50/30'
                                            }`}
                                        >
                                            {/* 选中徽标 */}
                                            {isSelected && (
                                                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                                                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                                                </div>
                                            )}
                                            {/* 头像 */}
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform">
                                                {p.avatar || '👦'}
                                            </div>
                                            <div className="text-center w-full">
                                                <div className="text-xs font-bold text-gray-800 truncate">
                                                    {p.name}
                                                </div>
                                                <div className="text-[10px] text-amber-700 font-semibold flex items-center justify-center gap-0.5 mt-0.5">
                                                    <span>💰</span>
                                                    <span>{targetGold}</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 第二步：进贡金额输入与筹码快捷键 */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                                <span>2. 进贡金币数额</span>
                            </label>
                            <span className="text-[11px] font-semibold text-gray-500">
                                我的财富库: <b className="text-amber-600 font-bold">{totalGold}</b> 💰
                            </span>
                        </div>

                        {/* 主金额输入框 */}
                        <div className="relative rounded-2xl bg-white border-2 border-amber-200 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200/50 p-2 shadow-inner transition-all">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-2xl select-none">🪙</span>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max={totalGold}
                                    className="w-full text-center text-3xl font-black text-amber-700 bg-transparent outline-none placeholder-amber-200"
                                    placeholder="0"
                                    value={amount}
                                    onKeyDown={(e) => { 
                                        if (e.key === '-' || e.key === '.' || e.key === 'e') {
                                            e.preventDefault(); 
                                        }
                                        if (e.key === 'Enter') {
                                            handleTribute();
                                        }
                                    }}
                                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                                />
                                {amount ? (
                                    <button 
                                        onClick={() => setAmount('')}
                                        className="text-xs font-bold text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100"
                                    >
                                        清空
                                    </button>
                                ) : (
                                    <span className="text-xs text-gray-300 font-bold px-2">金币</span>
                                )}
                            </div>
                        </div>

                        {/* 快捷筹码矩阵 */}
                        <div className="grid grid-cols-5 gap-1.5 mt-2.5">
                            {[
                                { label: '+20', val: 20, desc: '点心' },
                                { label: '+50', val: 50, desc: '心意' },
                                { label: '+100', val: 100, desc: '重礼' },
                                { label: '+500', val: 500, desc: '豪掷' },
                            ].map(chip => (
                                <button
                                    key={chip.val}
                                    type="button"
                                    onClick={() => addQuickAmount(chip.val)}
                                    className="py-1.5 px-1 rounded-xl bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80 text-amber-800 text-xs font-bold text-center transition-all hover:scale-105 active:scale-95 shadow-sm"
                                >
                                    <div>{chip.label}</div>
                                    <div className="text-[9px] text-amber-600/70 font-normal">{chip.desc}</div>
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={setAllAmount}
                                className="py-1.5 px-1 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white text-xs font-bold text-center transition-all hover:scale-105 active:scale-95 shadow-sm"
                            >
                                <div>全部</div>
                                <div className="text-[9px] text-amber-100 font-normal">倾囊</div>
                            </button>
                        </div>
                    </div>

                    {/* 第三步：结算小票流水 */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-gray-600">
                            <span>我的初始财富：</span>
                            <span className="font-semibold">{totalGold} 💰</span>
                        </div>
                        <div className="flex items-center justify-between text-amber-700 font-medium">
                            <span>本次进贡呈送：</span>
                            <span className="font-bold">-{numAmount} 💰</span>
                        </div>
                        <div className="h-px bg-amber-200/60 my-1" />
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-800">进贡后结余资产：</span>
                            <span className={`font-black text-sm ${isExceeded ? 'text-red-500' : 'text-emerald-600'}`}>
                                {remainingGold} 💰
                            </span>
                        </div>
                        {isExceeded && (
                            <p className="text-[11px] font-bold text-red-500 pt-1 flex items-center gap-1">
                                ⚠️ 进贡金额已超出持有财富，请调整进贡数额！
                            </p>
                        )}
                    </div>
                </div>

                {/* 底部奉诏呈送大按钮 */}
                <div className="p-4 sm:p-5 bg-gradient-to-b from-transparent to-amber-50/50 border-t border-amber-200/60 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-3 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 font-bold text-xs transition-colors shrink-0"
                    >
                        暂不出贡
                    </button>
                    <button
                        type="button"
                        onClick={handleTribute}
                        disabled={!target || numAmount <= 0 || isExceeded}
                        className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-lg shadow-orange-300/40 hover:shadow-orange-400/60 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                        <span>✨ 奉旨呈送 · 确认进贡</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TributeModal;
