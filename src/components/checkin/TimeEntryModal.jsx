import React, { useState, useMemo, useRef, useEffect } from 'react';
import { getLocalDateKey } from '../../utils/date.js';
import { getCheckinEntries } from '../../utils/checkin.js';
import { Clock, Flame, Sparkles, XIcon, CheckCircle2, Trash2 } from '../icons.jsx';

// 学科属性与主题映射
const getSubjectInfo = (taskName = '') => {
    if (/语文|古诗|背诵|作文|阅读|朗读|字词|文言/i.test(taskName)) 
        return { label: '语文文学', icon: '📖', badge: 'bg-rose-50 border-rose-200 text-rose-700' };
    if (/数学|口算|奥数|计算|思维|几何/i.test(taskName)) 
        return { label: '数理逻辑', icon: '📐', badge: 'bg-sky-50 border-sky-200 text-sky-700' };
    if (/英语|单词|听力|口语|绘本/i.test(taskName)) 
        return { label: '外语听说', icon: '🔤', badge: 'bg-violet-50 border-violet-200 text-violet-700' };
    if (/科学|实验|物理|化学|生物|自然|探索/i.test(taskName)) 
        return { label: '科学探究', icon: '🔬', badge: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
    if (/运动|跳绳|体能|跑步|打球|游泳|俯卧撑/i.test(taskName)) 
        return { label: '体育健康', icon: '⚡', badge: 'bg-amber-50 border-amber-200 text-amber-700' };
    if (/乐器|钢琴|画画|素描|书法|古筝|练琴/i.test(taskName)) 
        return { label: '艺术修养', icon: '🎨', badge: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700' };
    return { label: '日常成长', icon: '🎯', badge: 'bg-indigo-50 border-indigo-200 text-indigo-700' };
};

// 时间录入与补签仪表盘弹窗
export const TimeEntryModal = ({ 
    editingEntry, 
    tasks, 
    activeChild, 
    removeCheckin, 
    setEditingEntry, 
    saveCheckin, 
    theme, 
    inventory, 
    useRepairCard: onUseRepairCard, 
    checkins, 
    activeBuffs 
}) => {
    // 保证所有 React Hooks 在组件顶部无条件按恒定顺序声明
    const task = editingEntry ? (tasks[activeChild] || []).find(t => t.id === editingEntry.taskId) : null;
    const [val, setVal] = useState(editingEntry?.duration ?? '');
    const [units, setUnits] = useState(editingEntry?.units || 0);
    const [unitsStr, setUnitsStr] = useState('');
    const unitsInputRef = useRef(null);
    const [editSessionIdx, setEditSessionIdx] = useState(null);
    const isMulti = task?.multiCheckin && task?.frequencyType === 'daily_must';

    // 补签判断
    const hasRepairCard = ((inventory && inventory['item_fire']) || 0) > 0;
    const isPast = editingEntry ? editingEntry.date < getLocalDateKey(0) : false;

    // 多次打卡已有记录
    const todaySessions = useMemo(() => {
        if (!isMulti || !editingEntry) return [];
        const taskRecord = checkins?.[activeChild]?.[task?.id];
        return getCheckinEntries(taskRecord, editingEntry.date);
    }, [isMulti, editingEntry, checkins, activeChild, task?.id]);

    const todaySessionCount = todaySessions.length;
    const todayTotalMinutes = todaySessions.reduce((s, e) => s + (e.m || 0), 0);
    const todayTotalUnits = todaySessions.reduce((s, e) => s + (e.u || 0), 0);

    // 投资加成计算
    const investBuff = activeBuffs?.[activeChild];
    const investMul = (investBuff?.investMultiplier && investBuff.investMultiplier > 1 && (!investBuff.investExpire || investBuff.investExpire > Date.now())) 
        ? investBuff.investMultiplier 
        : 1;

    // 奖励金币实时演算
    const previewGold = useMemo(() => {
        if (!isMulti) return (task?.reward || 0) * investMul;
        if (task?.multiUnitLabel) {
            const prevUnits = todayTotalUnits;
            const thisUnits = units || 1;
            let total = 0;
            for (let u = 1; u <= thisUnits; u++) {
                total += (task?.reward || 0) * (prevUnits + u) * investMul;
            }
            return total;
        }
        return (task?.reward || 0) * (todaySessionCount + 1) * investMul;
    }, [isMulti, task, investMul, todayTotalUnits, todaySessionCount, units]);

    const rewardsPreviewText = useMemo(() => {
        if (!isMulti) return '';
        if (task?.multiUnitLabel) {
            const prevUnits = todayTotalUnits;
            const thisUnits = units || 1;
            const label = task.multiUnitLabel;
            const lines = [];
            lines.push(`🎯 今日已累计 ${prevUnits} ${label}，本次完成 ${thisUnits} ${label}`);
            for (let u = 1; u <= thisUnits; u++) {
                const unitGold = (task?.reward || 0) * (prevUnits + u) * investMul;
                lines.push(`　第 ${prevUnits + u} 个${label} 基础奖励 ×${prevUnits + u} → +${unitGold} 💰`);
            }
            return lines;
        }
        return [`🎯 本次是今天第 ${todaySessionCount + 1} 次打卡 · 基础奖励 ×${todaySessionCount + 1} → 预计入账 +${previewGold} 💰`];
    }, [isMulti, task, todayTotalUnits, todaySessionCount, units, previewGold, investMul]);

    useEffect(() => {
        if (!editingEntry) return;
        if (isMulti) {
            setVal('');
            setUnits(0);
            setUnitsStr('');
            setEditSessionIdx(null);
        } else {
            setVal(editingEntry.duration);
        }
    }, [editingEntry, isMulti]);

    if (!editingEntry) return null;

    // 步进快捷增量
    const addMinutes = (inc) => {
        const current = parseInt(val) || 0;
        const next = Math.max(0, current + inc);
        setVal(String(next));
    };

    const addUnits = (inc) => {
        const current = parseInt(unitsStr) || 0;
        const next = Math.max(0, current + inc);
        setUnits(next);
        setUnitsStr(String(next));
    };

    const enterEditMode = (s, i) => {
        setEditSessionIdx(i);
        setVal(String(s.m || ''));
        setUnits(s.u || 0);
        setUnitsStr(String(s.u || ''));
    };

    const discardEdit = () => {
        setEditSessionIdx(null);
        setVal('');
        setUnits(0);
        setUnitsStr('');
    };

    const isEditing = editSessionIdx !== null && editSessionIdx >= 0;
    const submitLabel = isMulti 
        ? (isEditing ? '更新打卡记录' : (todaySessionCount === 0 ? '确认打卡' : '再打一次卡')) 
        : (editingEntry.isNew ? '确认打卡' : '保存修改');

    const subject = getSubjectInfo(task?.name);
    const isPastLocked = editingEntry.isNew && isPast;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) { isEditing ? discardEdit() : setEditingEntry(null); } }}
        >
            <div className="bg-white/95 rounded-3xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-white/80 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
                {/* 弹窗顶部标头 */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl shadow-md shadow-orange-200/50 shrink-0">
                            {subject.icon}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${subject.badge}`}>
                                    {subject.label}
                                </span>
                                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    📅 {editingEntry.date}
                                </span>
                                {isPast && (
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                        <Flame className="w-3 h-3 text-orange-500 inline" /> 补签模式
                                    </span>
                                )}
                            </div>
                            <h3 className="text-base font-bold text-gray-900 truncate mt-0.5">
                                {task?.name || '任务打卡'}
                            </h3>
                        </div>
                    </div>
                    <button 
                        onClick={() => isEditing ? discardEdit() : setEditingEntry(null)} 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                        title="关闭"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-4">
                    {/* 编辑状态显著提示条 */}
                    {isEditing && (
                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 font-bold animate-in fade-in">
                            <span className="flex items-center gap-1.5">
                                <span>✏️</span> 正在修改今日第 {editSessionIdx + 1} 次打卡记录
                            </span>
                            <button 
                                onClick={discardEdit}
                                className="text-[11px] text-indigo-500 hover:text-indigo-800 underline font-normal"
                            >
                                放弃修改
                            </button>
                        </div>
                    )}

                    {/* 今日多次打卡足迹流水 */}
                    {isMulti && todaySessionCount > 0 && (
                        <div className="rounded-2xl bg-purple-50/50 border border-purple-100 p-3 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                                <span>📋 今日打卡足迹 ({todaySessionCount}次)</span>
                                <span className="text-[11px] text-purple-600 font-normal">
                                    累计: {todayTotalMinutes}分钟{task.multiUnitLabel ? ` · ${todayTotalUnits}${task.multiUnitLabel}` : ''}
                                </span>
                            </div>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                {todaySessions.map((s, i) => (
                                    <div 
                                        key={i}
                                        onClick={() => enterEditMode(s, i)}
                                        className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                                            editSessionIdx === i 
                                                ? 'bg-purple-100/90 border-purple-400 text-purple-900 ring-2 ring-purple-300 font-bold shadow-sm' 
                                                : 'bg-white/80 border-purple-100 text-purple-700 hover:bg-purple-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-purple-200/80 text-purple-800 flex items-center justify-center text-[10px] font-bold">
                                                {i + 1}
                                            </span>
                                            <span>{s.m} 分钟</span>
                                            {task.multiUnitLabel && (
                                                <span className="text-purple-500">· {s.u || 0} {task.multiUnitLabel}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400">
                                                {s.t ? new Date(s.t).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                            <span className="text-xs text-purple-400 hover:text-purple-700" title="点击编辑此条">
                                                ✏️
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ================= 模式一：过期未打卡拦截 (普罗米修斯之火) ================= */}
                    {isPastLocked ? (
                        <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-amber-50/80 to-orange-50/50 p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-xl shadow-md shadow-orange-300/50 shrink-0">
                                    🔥
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                                        时空档案归档 · 需神火补签
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                        历史日期的任务不可直接补卡。可点燃神火逆转时空补全记录。
                                    </p>
                                </div>
                            </div>

                            {hasRepairCard ? (
                                <div className="pt-2 space-y-3 border-t border-amber-200/70">
                                    <div className="flex items-center justify-between text-xs text-amber-800 font-semibold">
                                        <span>背包持有【普罗米修斯之火】</span>
                                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
                                            ×{inventory['item_fire']} 枚
                                        </span>
                                    </div>

                                    {/* 补签时间输入 */}
                                    <div className="relative rounded-2xl bg-white border border-amber-300 p-2 shadow-inner">
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="999" 
                                            value={val} 
                                            onChange={(e) => setVal(e.target.value)} 
                                            onKeyDown={(e) => { 
                                                if (e.key === 'Enter') { 
                                                    e.preventDefault(); 
                                                    if (isMulti && task.multiUnitLabel && unitsInputRef.current) { 
                                                        unitsInputRef.current.focus(); 
                                                    } else { 
                                                        onUseRepairCard(editingEntry, val, units); 
                                                    } 
                                                } 
                                            }} 
                                            className="w-full text-center text-3xl font-black text-amber-700 bg-transparent outline-none placeholder-amber-200" 
                                            placeholder="30" 
                                        />
                                        <span className="absolute right-4 bottom-3 text-xs text-amber-500 font-bold">分钟</span>
                                    </div>

                                    {/* 步进按钮 */}
                                    <div className="flex items-center justify-center gap-1.5">
                                        {[10, 15, 20, 30, 45, 60].map(m => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => setVal(String(m))}
                                                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold transition-all"
                                            >
                                                {m}分
                                            </button>
                                        ))}
                                    </div>

                                    {/* 单位输入 */}
                                    {isMulti && task.multiUnitLabel && (
                                        <div className="relative rounded-xl bg-white border border-amber-300 p-2">
                                            <input 
                                                type="number" 
                                                ref={unitsInputRef} 
                                                min="1" 
                                                max="999" 
                                                value={unitsStr} 
                                                onChange={(e) => { 
                                                    setUnitsStr(e.target.value); 
                                                    const n = parseInt(e.target.value); 
                                                    if (!isNaN(n) && n >= 0) setUnits(n); 
                                                    else if (e.target.value === '') setUnits(0); 
                                                }} 
                                                className="w-full text-center text-xl font-bold text-amber-700 bg-transparent outline-none" 
                                                placeholder="1" 
                                            />
                                            <span className="absolute right-3 bottom-2 text-xs text-amber-500">本次完成{task.multiUnitLabel}</span>
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => onUseRepairCard(editingEntry, val, units || 1)} 
                                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-orange-300/50 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Flame className="w-4 h-4 fill-white" />
                                        奉献普罗米修斯之火 · 补签完成 ({val || 0} 分钟)
                                    </button>
                                </div>
                            ) : (
                                <div className="p-3 rounded-xl bg-white/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                                    💡 背包中暂无神火道具。可前往【时空市集】购买补签卡，或请家长在主看板表头进行免签豁免。
                                </div>
                            )}
                        </div>
                    ) : (
                        /* ================= 模式二：正常打卡/修改仪表盘 ================= */
                        <div className="space-y-4">
                            {/* 计时器仪表卡 */}
                            <div className="rounded-3xl border border-gray-200/80 bg-gradient-to-b from-gray-50/70 to-white p-4 shadow-inner text-center space-y-3">
                                <span className="text-xs font-bold text-gray-500 flex items-center justify-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    <span>投入专注时长 (分钟)</span>
                                </span>

                                {/* 巨大数值录入 */}
                                <div className="relative inline-flex items-center justify-center">
                                    <input 
                                        type="number" 
                                        autoFocus 
                                        value={val} 
                                        onChange={(e) => setVal(e.target.value)} 
                                        onKeyDown={(e) => { 
                                            if (e.key === 'Enter') { 
                                                e.preventDefault(); 
                                                if (isMulti && task?.multiUnitLabel && unitsInputRef.current) { 
                                                    unitsInputRef.current.focus(); 
                                                } else { 
                                                    saveCheckin(val, units, editSessionIdx); 
                                                } 
                                            } 
                                        }} 
                                        className={`w-40 text-center text-4xl sm:text-5xl font-black ${theme?.primary || 'text-amber-600'} bg-transparent outline-none border-b-2 border-gray-300 focus:border-current pb-1 transition-all`} 
                                        placeholder="30" 
                                    />
                                    <span className="text-sm font-bold text-gray-400 ml-2">分钟</span>
                                </div>

                                {/* 快捷步进胶囊 */}
                                <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                                    {[
                                        { label: '+5分', inc: 5 },
                                        { label: '+10分', inc: 10 },
                                        { label: '+15分', inc: 15 },
                                        { label: '+30分', inc: 30 },
                                        { label: '+45分', inc: 45 },
                                    ].map(chip => (
                                        <button
                                            key={chip.inc}
                                            type="button"
                                            onClick={() => addMinutes(chip.inc)}
                                            className="px-2.5 py-1 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold shadow-sm transition-all active:scale-95"
                                        >
                                            {chip.label}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setVal('')}
                                        className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-bold transition-all active:scale-95"
                                    >
                                        清零
                                    </button>
                                </div>
                            </div>

                            {/* 多次打卡单位输入 */}
                            {isMulti && task?.multiUnitLabel && (
                                <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-3 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                                        <span>🎯 本次完成数量 ({task.multiUnitLabel})</span>
                                        <span className="text-[11px] text-purple-500 font-normal">单次步进</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => addUnits(-1)}
                                            className="w-10 h-10 rounded-xl bg-white border border-purple-200 text-purple-700 font-black text-lg hover:bg-purple-100 active:scale-95 shadow-sm"
                                        >
                                            -
                                        </button>
                                        <input 
                                            type="number" 
                                            ref={unitsInputRef} 
                                            min="1" 
                                            max="999" 
                                            value={unitsStr} 
                                            onChange={(e) => { 
                                                setUnitsStr(e.target.value); 
                                                const n = parseInt(e.target.value); 
                                                if (!isNaN(n) && n >= 0) setUnits(n); 
                                                else if (e.target.value === '') setUnits(0); 
                                            }} 
                                            onKeyDown={(e) => { 
                                                if (e.key === 'Enter') { 
                                                    e.preventDefault(); 
                                                    saveCheckin(val, units || 1, editSessionIdx); 
                                                } 
                                            }} 
                                            className="flex-1 text-center text-2xl font-black text-purple-900 bg-white border border-purple-200 rounded-xl py-1 outline-none shadow-inner" 
                                            placeholder="1" 
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => addUnits(1)}
                                            className="w-10 h-10 rounded-xl bg-white border border-purple-200 text-purple-700 font-black text-lg hover:bg-purple-100 active:scale-95 shadow-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 pt-1">
                                        {[1, 2, 5, 10].map(u => (
                                            <button
                                                key={u}
                                                type="button"
                                                onClick={() => { setUnits(u); setUnitsStr(String(u)); }}
                                                className="px-2.5 py-0.5 rounded-lg bg-purple-100/70 hover:bg-purple-200 text-purple-800 text-xs font-bold transition-all"
                                            >
                                                +{u} {task.multiUnitLabel}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 预计金币收据卡 */}
                            <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/70 via-orange-50/50 to-amber-50/70 p-3.5 space-y-1.5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                        <span>预计收获收益</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-base font-black text-amber-700">
                                        <span>+{previewGold}</span>
                                        <span className="text-xs">💰</span>
                                    </div>
                                </div>

                                {investMul > 1 && (
                                    <div className="text-[11px] text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                                        <span>✨ 乾坤理财符生效中 (投资收益翻倍 ×{investMul})</span>
                                    </div>
                                )}

                                {isMulti && Array.isArray(rewardsPreviewText) && (
                                    <div className="text-[11px] text-amber-800/80 pt-1 space-y-0.5 border-t border-amber-200/60 font-medium">
                                        {rewardsPreviewText.map((line, idx) => (
                                            <div key={idx}>{line}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 底部操作按钮 */}
                <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center gap-2.5">
                    {/* 删除按钮 */}
                    {isMulti && isEditing && (
                        <button 
                            type="button"
                            onClick={() => removeCheckin(editSessionIdx)} 
                            className="py-3 px-3.5 rounded-2xl border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100 font-bold text-xs transition-colors flex items-center gap-1 shrink-0"
                            title="删除本次打卡记录"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>删除该次</span>
                        </button>
                    )}
                    {!isMulti && !editingEntry.isNew && (
                        <button 
                            type="button"
                            onClick={() => removeCheckin(null)} 
                            className="py-3 px-3.5 rounded-2xl border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100 font-bold text-xs transition-colors flex items-center gap-1 shrink-0"
                            title="删除打卡"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>删除</span>
                        </button>
                    )}

                    {/* 取消 / 放弃编辑 */}
                    <button 
                        type="button"
                        onClick={() => isEditing ? discardEdit() : setEditingEntry(null)} 
                        className="flex-1 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors"
                    >
                        {isEditing ? '放弃修改' : '取消'}
                    </button>

                    {/* 保存提交主按钮 */}
                    {!isPastLocked && (
                        <button 
                            type="button"
                            onClick={() => saveCheckin(val, units, editSessionIdx)} 
                            className={`flex-[1.5] py-3 rounded-2xl font-bold text-xs text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                                isMulti 
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-200' 
                                    : `${theme?.primaryBg || 'bg-amber-500'} ${theme?.primaryBgHover || 'hover:bg-amber-600'} shadow-amber-200`
                            }`}
                        >
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                            <span>{submitLabel}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimeEntryModal;
