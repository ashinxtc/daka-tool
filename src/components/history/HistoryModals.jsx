import React, { useState, useMemo } from 'react';
import { TrendingUp, XIcon, FileText, BookOpen, CheckCircle2, Lock, Sparkles, Trophy } from '../icons.jsx';
import { getLevelInfo, getLevelsByEra } from '../../utils/levels.js';

// 获取外部 levels.js 中的 ERA_INFOS / ERA_COLORS
const getEraInfos = () => (typeof window !== 'undefined' && window.ERA_INFOS) ? window.ERA_INFOS : ((typeof ERA_INFOS !== 'undefined') ? ERA_INFOS : {});
const getEraColors = () => (typeof window !== 'undefined' && window.ERA_COLORS) ? window.ERA_COLORS : ((typeof ERA_COLORS !== 'undefined') ? ERA_COLORS : {});

// 智能日期标签 (今天/昨天/完整日期)
const getDateLabel = (dateStr) => {
    const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    if (dateStr === today) return '今天';
    if (dateStr === yesterday) return '昨天';
    return dateStr;
};

// =========================================================================
// 1. 文明进化之路 · 纪元天梯弹窗 (EvolutionPathModal)
// =========================================================================
export const EvolutionPathModal = ({ show, onClose, currentXP = 0, theme }) => {
    if (!show) return null;

    const ERA_INFOS = getEraInfos();
    const ERA_COLORS = getEraColors();
    const currentLevel = getLevelInfo(currentXP);
    const groupedLevels = getLevelsByEra();

    // 寻找下一级所需经验
    const allLevelsFlat = Object.values(groupedLevels).flat();
    const nextLevel = allLevelsFlat.find(lvl => lvl.level === currentLevel.level + 1);
    const xpNeededForNext = nextLevel ? Math.max(0, nextLevel.xp - currentXP) : 0;

    return (
        <div 
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white/95 rounded-3xl w-full max-w-4xl h-[90vh] shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-white/80 flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
                {/* 顶栏 */}
                <div className={`px-6 py-4 bg-gradient-to-r ${theme.gradient} text-white flex justify-between items-center shrink-0 shadow-md relative z-10`}>
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-2xl shadow-inner border border-white/30">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-black tracking-wide">文明进化之路 · 纪元天梯</h2>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white">
                                    Lv.{currentLevel.level} {currentLevel.name}
                                </span>
                            </div>
                            <p className="text-white/90 text-xs mt-0.5 flex items-center gap-2">
                                <span>累积修为: <b className="text-yellow-200">{currentXP}</b> XP</span>
                                {nextLevel && (
                                    <span className="text-amber-100 text-[11px] bg-black/20 px-2 py-0.5 rounded-full border border-white/10">
                                        距晋升下阶段还差 {xpNeededForNext} XP
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-all active:scale-95"
                        title="关闭"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* 纪元天梯主体 */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-gray-50/70 to-white space-y-6">
                    {Object.entries(groupedLevels).map(([era, levels]) => {
                        const eraInfo = ERA_INFOS[era] || {};
                        const eraColor = ERA_COLORS[era] || { bg: 'bg-indigo-500' };

                        return (
                            <div key={era} className="rounded-3xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
                                {/* 纪元旗帜 */}
                                <div className={`p-4 border-b border-gray-100 flex items-center justify-between ${eraInfo.bg || 'bg-slate-50'}`}>
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-3.5 h-3.5 rounded-full ${eraColor.bg} shadow-sm ring-2 ring-white`} />
                                        <div>
                                            <h3 className={`text-base font-black ${eraInfo.color || 'text-gray-800'}`}>
                                                {era}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">{eraInfo.desc}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-gray-600 border border-gray-200">
                                        共 {levels.length} 个成长境界
                                    </span>
                                </div>

                                {/* 境界阶梯网格 */}
                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {levels.map((lvl) => {
                                        const isUnlocked = currentXP >= lvl.xp;
                                        const isCurrent = currentLevel.level === lvl.level;

                                        let barWidth = '0%';
                                        if (currentXP >= lvl.xp) {
                                            barWidth = '100%';
                                        } else if (lvl.level === currentLevel.level + 1) {
                                            const prevXP = currentLevel.xp;
                                            const total = lvl.xp - prevXP;
                                            const current = currentXP - prevXP;
                                            const p = Math.max(0, Math.min(100, Math.floor((current / total) * 100)));
                                            barWidth = `${p}%`;
                                        }

                                        return (
                                            <div 
                                                key={lvl.level} 
                                                className={`relative p-3.5 rounded-2xl border transition-all ${
                                                    isCurrent 
                                                        ? 'bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 border-2 border-amber-400 shadow-md ring-2 ring-amber-200/60 scale-[1.02]' 
                                                        : isUnlocked 
                                                        ? 'bg-white border-gray-200/90 shadow-2xs hover:border-gray-300' 
                                                        : 'bg-gray-50/60 border-gray-100 opacity-60'
                                                }`}
                                            >
                                                {/* 头部等级与境界名称 */}
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white ${eraColor.bg} shadow-xs shrink-0`}>
                                                            Lv.{lvl.level}
                                                        </span>
                                                        <h4 className="font-bold text-gray-900 text-sm truncate">{lvl.name}</h4>
                                                    </div>
                                                    {isCurrent ? (
                                                        <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full font-black shadow-xs animate-pulse shrink-0">
                                                            当前境界
                                                        </span>
                                                    ) : isUnlocked ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    )}
                                                </div>

                                                <p className="text-xs text-gray-500 leading-snug mb-2.5 min-h-[2.4rem] line-clamp-2">
                                                    {lvl.desc}
                                                </p>

                                                {/* 境界进度条 */}
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-500 ${isCurrent ? 'bg-gradient-to-r from-amber-500 to-orange-500' : eraColor.bg}`} 
                                                        style={{ width: barWidth }} 
                                                    />
                                                </div>

                                                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1.5">
                                                    <span>{isUnlocked ? '已达成' : isCurrent ? '历练突破中' : '未解锁'}</span>
                                                    <span className="font-bold text-gray-600">{lvl.xp} XP</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// 2. 皇家金元宝流水账本 (GoldHistoryModal)
// =========================================================================
export const GoldHistoryModal = ({ show, onClose, transactions = [], theme }) => {
    const [filterType, setFilterType] = useState('all');

    const groupedTransactions = useMemo(() => {
        let filtered = transactions || [];
        if (filterType === 'income') filtered = filtered.filter(t => t.amount > 0);
        if (filterType === 'expense') filtered = filtered.filter(t => t.amount < 0);

        const groups = {};
        filtered.forEach(t => {
            const date = t.date || '未知日期';
            if (!groups[date]) groups[date] = { items: [], totalIncome: 0, totalExpense: 0 };
            groups[date].items.push(t);
            if (t.amount > 0) groups[date].totalIncome += t.amount;
            else groups[date].totalExpense += t.amount;
        });

        return Object.entries(groups)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .map(([date, data]) => ({ date, ...data, items: data.items.reverse() }));
    }, [transactions, filterType]);

    if (!show) return null;

    return (
        <div 
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white/95 rounded-3xl w-full max-w-xl max-h-[88vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/80 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* 标头 */}
                <div className={`p-5 bg-gradient-to-r ${theme.gradient} text-white flex justify-between items-center shrink-0 shadow-md`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner border border-white/30">
                            🪙
                        </div>
                        <div>
                            <h3 className="font-black text-lg drop-shadow-sm flex items-center gap-1.5">
                                金元宝明细 · 聚宝账本
                            </h3>
                            <p className="text-xs text-white/80 mt-0.5">记录每一笔财富进账与支出明细</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                        title="关闭"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* 筛选分类 */}
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex gap-2 shrink-0">
                    {[
                        { id: 'all', label: '全部明细' },
                        { id: 'income', label: '收入进账 (+)' },
                        { id: 'expense', label: '开销流出 (-)' }
                    ].map(f => (
                        <button 
                            key={f.id} 
                            type="button"
                            onClick={() => setFilterType(f.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                filterType === f.id 
                                    ? 'bg-amber-500 text-white shadow-sm scale-105' 
                                    : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200/80'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* 账本列表 */}
                <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50/50 to-white space-y-5">
                    {groupedTransactions.length === 0 ? (
                        <div className="text-center text-gray-400 py-16 space-y-2">
                            <div className="text-5xl opacity-30">💰</div>
                            <p className="text-sm font-semibold">暂无相关收支账目</p>
                        </div>
                    ) : (
                        groupedTransactions.map((group) => (
                            <div key={group.date} className="space-y-2.5">
                                {/* 日期聚合分割栏 */}
                                <div className="flex items-center justify-between sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 py-1.5 px-1 border-b border-gray-200/70">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-gray-800 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs">
                                            {getDateLabel(group.date)}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium">{group.date}</span>
                                    </div>
                                    <div className="flex gap-2 text-[10px] font-bold">
                                        {group.totalIncome > 0 && (
                                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                                +{group.totalIncome} 💰
                                            </span>
                                        )}
                                        {group.totalExpense < 0 && (
                                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                                                {group.totalExpense} 💰
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* 当日明细卡片 */}
                                <div className="space-y-2">
                                    {group.items.map((t, idx) => {
                                        const isIncome = t.amount > 0;
                                        let itemIcon = isIncome ? '📈' : '🛒';
                                        if (t.name.includes('奇遇')) itemIcon = '✨';
                                        if (t.name.includes('转盘')) itemIcon = '🎡';
                                        if (t.name.includes('退款')) itemIcon = '↩️';
                                        if (t.name.includes('进贡')) itemIcon = '👑';
                                        if (t.name.includes('补签')) itemIcon = '🔥';

                                        return (
                                            <div 
                                                key={t.id || idx} 
                                                className="bg-white p-3.5 rounded-2xl border border-gray-200/80 flex justify-between items-center shadow-xs hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                                                        isIncome ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                                                    }`}>
                                                        {itemIcon}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm group-hover:text-amber-600 transition-colors">
                                                            {t.name}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 mt-0.5">
                                                            {isIncome ? '金元宝入账' : '集市消费支出'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`font-black text-lg tracking-tight ${isIncome ? 'text-amber-600' : 'text-rose-500'}`}>
                                                    {isIncome ? '+' : ''}{t.amount} 💰
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// 3. 璀璨星宿档案 · 星光足迹弹窗 (StarHistoryModal)
// =========================================================================
export const StarHistoryModal = ({ show, onClose, starTransactions = [], theme }) => {
    const [filterType, setFilterType] = useState('all');

    const groupedTransactions = useMemo(() => {
        let filtered = starTransactions || [];
        if (filterType === 'income') filtered = filtered.filter(t => t.amount > 0);
        if (filterType === 'expense') filtered = filtered.filter(t => t.amount < 0);

        const groups = {};
        filtered.forEach(t => {
            const date = t.date || '未知日期';
            if (!groups[date]) groups[date] = { items: [], totalIncome: 0, totalExpense: 0 };
            groups[date].items.push(t);
            if (t.amount > 0) groups[date].totalIncome += t.amount;
            else groups[date].totalExpense += t.amount;
        });

        return Object.entries(groups)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .map(([date, data]) => ({ date, ...data, items: data.items.reverse() }));
    }, [starTransactions, filterType]);

    if (!show) return null;

    return (
        <div 
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white/95 rounded-3xl w-full max-w-xl max-h-[88vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/80 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* 标头 */}
                <div className={`p-5 bg-gradient-to-r ${theme.gradient} text-white flex justify-between items-center shrink-0 shadow-md`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner border border-white/30">
                            ⭐
                        </div>
                        <div>
                            <h3 className="font-black text-lg drop-shadow-sm flex items-center gap-1.5">
                                璀璨星宿档案 · 星光足迹
                            </h3>
                            <p className="text-xs text-white/80 mt-0.5">记录星星资产的获取与使用履历</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                        title="关闭"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* 筛选分类 */}
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex gap-2 shrink-0">
                    {[
                        { id: 'all', label: '全部星迹' },
                        { id: 'income', label: '星光凝聚 (+)' },
                        { id: 'expense', label: '星愿消耗 (-)' }
                    ].map(f => (
                        <button 
                            key={f.id} 
                            type="button"
                            onClick={() => setFilterType(f.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                filterType === f.id 
                                    ? 'bg-amber-500 text-white shadow-sm scale-105' 
                                    : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200/80'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* 列表 */}
                <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50/50 to-white space-y-5">
                    {groupedTransactions.length === 0 ? (
                        <div className="text-center text-gray-400 py-16 space-y-2">
                            <div className="text-5xl opacity-30">⭐</div>
                            <p className="text-sm font-semibold">暂无相关星光履历</p>
                        </div>
                    ) : (
                        groupedTransactions.map((group) => (
                            <div key={group.date} className="space-y-2.5">
                                <div className="flex items-center justify-between sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 py-1.5 px-1 border-b border-gray-200/70">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-gray-800 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs">
                                            {getDateLabel(group.date)}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium">{group.date}</span>
                                    </div>
                                    <div className="flex gap-2 text-[10px] font-bold">
                                        {group.totalIncome > 0 && (
                                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                                                +{group.totalIncome} ⭐
                                            </span>
                                        )}
                                        {group.totalExpense < 0 && (
                                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                                                {group.totalExpense} ⭐
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {group.items.map((t, idx) => {
                                        const isIncome = t.amount > 0;
                                        let itemIcon = '⭐';
                                        if (t.name.includes('打卡')) itemIcon = '✅';
                                        if (t.name.includes('兑换')) itemIcon = '💱';
                                        if (t.name.includes('领养') || t.name.includes('喂食')) itemIcon = '🐾';
                                        if (t.name.includes('洗香香')) itemIcon = '🛁';
                                        if (t.name.includes('去玩耍')) itemIcon = '🎪';
                                        if (t.name.includes('探险')) itemIcon = '🗺️';

                                        return (
                                            <div 
                                                key={t.id || idx} 
                                                className="bg-white p-3.5 rounded-2xl border border-gray-200/80 flex justify-between items-center shadow-xs hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                                                        isIncome ? 'bg-amber-50 text-amber-500 border border-amber-200' : 'bg-rose-50 text-rose-500 border border-rose-200'
                                                    }`}>
                                                        {itemIcon}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm group-hover:text-amber-600 transition-colors">
                                                            {t.name}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 mt-0.5">
                                                            {isIncome ? '星星到账' : '星愿兑换/宠物照料'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`font-black text-lg tracking-tight ${isIncome ? 'text-amber-500' : 'text-rose-500'}`}>
                                                    {isIncome ? '+' : ''}{t.amount} ⭐
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// 4. 智慧经验灵泉 · 成长档案弹窗 (XPHistoryModal)
// =========================================================================
export const XPHistoryModal = ({ show, onClose, xpTransactions = [], theme }) => {
    const [filterType, setFilterType] = useState('all');

    const groupedTransactions = useMemo(() => {
        let filtered = xpTransactions || [];
        if (filterType === 'income') filtered = filtered.filter(t => t.amount > 0);
        if (filterType === 'expense') filtered = filtered.filter(t => t.amount < 0);

        const groups = {};
        filtered.forEach(t => {
            const date = t.date || '未知日期';
            if (!groups[date]) groups[date] = { items: [], totalXP: 0 };
            groups[date].items.push(t);
            groups[date].totalXP += t.amount;
        });

        return Object.entries(groups)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .map(([date, data]) => ({ date, ...data, items: data.items.reverse() }));
    }, [xpTransactions, filterType]);

    if (!show) return null;

    return (
        <div 
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white/95 rounded-3xl w-full max-w-xl max-h-[88vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/80 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* 标头 */}
                <div className={`p-5 bg-gradient-to-r ${theme.gradient} text-white flex justify-between items-center shrink-0 shadow-md`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner border border-white/30">
                            ✨
                        </div>
                        <div>
                            <h3 className="font-black text-lg drop-shadow-sm flex items-center gap-1.5">
                                智慧灵泉 · 经验成长明细
                            </h3>
                            <p className="text-xs text-white/80 mt-0.5">见证文明进化过程中的每一次顿悟与精进</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                        title="关闭"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* 筛选导航 */}
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex gap-2 shrink-0">
                    {[
                        { id: 'all', label: '全部历练' },
                        { id: 'income', label: '修为增长 (+)' },
                        { id: 'expense', label: '经验变动 (-)' }
                    ].map(f => (
                        <button 
                            key={f.id} 
                            type="button"
                            onClick={() => setFilterType(f.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                filterType === f.id 
                                    ? 'bg-blue-600 text-white shadow-sm scale-105' 
                                    : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200/80'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* 列表 */}
                <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50/50 to-white space-y-5">
                    {groupedTransactions.length === 0 ? (
                        <div className="text-center text-gray-400 py-16 space-y-2">
                            <div className="text-5xl opacity-30">✨</div>
                            <p className="text-sm font-semibold">暂无相关经验履历</p>
                        </div>
                    ) : (
                        groupedTransactions.map((group) => (
                            <div key={group.date} className="space-y-2.5">
                                <div className="flex items-center justify-between sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 py-1.5 px-1 border-b border-gray-200/70">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-gray-800 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs">
                                            {getDateLabel(group.date)}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium">{group.date}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                                        当日合计: {group.totalXP > 0 ? '+' : ''}{group.totalXP} XP
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {group.items.map((t, idx) => {
                                        const isIncome = t.amount > 0;
                                        let itemIcon = isIncome ? '🌟' : '📉';
                                        if (t.name.includes('奇遇')) itemIcon = '✨';
                                        if (t.name.includes('转盘')) itemIcon = '🎡';
                                        if (t.name.includes('打卡')) itemIcon = '✅';

                                        return (
                                            <div 
                                                key={t.id || idx} 
                                                className={`bg-white p-3.5 rounded-2xl border flex justify-between items-center shadow-xs hover:shadow-md transition-all group ${
                                                    t.isRepair ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200/80'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                                                        t.isRepair ? 'bg-amber-100 text-amber-600 border border-amber-300' : isIncome ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                                                    }`}>
                                                        {t.isRepair ? '🔥' : itemIcon}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                                                            <span>{t.name}</span>
                                                            {t.isRepair && (
                                                                <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-300">
                                                                    🔥 神火补签
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 mt-0.5">
                                                            {t.isRepair ? '普罗米修斯神火时空回溯' : isIncome ? '日常修养精进' : '经验流转'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`font-black text-lg tracking-tight ${isIncome ? 'text-blue-600' : 'text-gray-500'}`}>
                                                    {isIncome ? '+' : ''}{t.amount} <span className="text-xs font-semibold opacity-60">XP</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default {
    EvolutionPathModal,
    GoldHistoryModal,
    StarHistoryModal,
    XPHistoryModal
};
