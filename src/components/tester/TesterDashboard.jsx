import React, { useState } from 'react';
import { Trash2 } from '../icons';
import { showToast } from '../common/Toast';
import { getLevelInfo } from '../../utils/levels';
import { getLocalDateKey } from '../../utils/date';
import { RANDOM_EVENTS } from '../../data/randomEvents';
import { SHOP_ITEMS } from '../../data/shopItems';

// --- 【修改后】上帝模式控制台组件 (悬浮窗版) ---
export const TesterDashboard = ({ 
    activeChild, 
    currentXP, 
    setXpHistory, 
    setWheelHistory, 
    checkAchievements, 
    tasks, 
    checkins, 
    setCheckins,
    setShowRandomEvent, 
    setCurrentRandomEvent,
    achievements,
    setAchievements, // 新增：用于清空成就
    setInventory,
    setMilestones,    // 新增：用于清空大事纪
    setNotifiedLevels,
    setActiveBuffs,   // 用于清除 Buff 和 投资计划
    setEquippedGear,  // 用于清除 已装备的外观
    setStats,          // 用于清除 皇家礼炮特效等状态
    wheelHistory,
    setCurriculumProgress,
    setRedeemedCoupons,
    setRandomEventHistory,
    setExemptedDays,  // 用于彻底清除豁免记录
    setWeeklyPayroll,
    setWeeklyPayrollToClaim,
    onTestWeeklyPayroll,
    hasEnvelopeButton,  // 当工资信封存在时，GOD_MODE 按钮上移避免被遮挡
    hasMonthlySummaryButton = false,  // 每月1-3日为 true，GOD_MODE 再上移
    setRepairedCheckins,        // 普罗米修斯之火补签记录
    setHomeworkRecords,         // 作业成绩登记
    setExamRecords,             // 考试成绩登记
    setDailyRandomCounts,       // 每日奇遇触发次数（旧）
    setActiveSilenceMutes,      // 静音/禁言状态
    setHistoricalEventProgress, // 历史事件进度
    setDailyEventTypeCounts,    // 每日分类事件计数
    setStarHistory,             // 星星收支记录
    setPetData,                 // 宠物运行时数据
    setOwnedPets,               // 已拥有宠物
    setActivePet,               // 当前激活宠物
    setPetCooldowns,            // 互动冷却
    setPetStats,                // 宠物统计
    setPetSkillCooldowns,       // 技能冷却
    setPetBuffs,                // 宠物增益
    setPetAdventures,           // 宠物探险
    setPetAdventureLog,         // 探险日志
    setPetAdventureStats,       // 探险统计
    updateStats: propUpdateStats,
    onResetTesterData           // 全局彻底重置测试员数据
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const updateStats = propUpdateStats || (typeof window !== 'undefined' && window.updateStats) || (() => {});

    // 只有测试员才显示
    const godBottom = hasEnvelopeButton && hasMonthlySummaryButton ? 'bottom-[17rem]' : (hasEnvelopeButton || hasMonthlySummaryButton ? 'bottom-52' : 'bottom-36');
    const godPopoverBottom = hasEnvelopeButton && hasMonthlySummaryButton ? 'bottom-[19rem]' : (hasEnvelopeButton || hasMonthlySummaryButton ? 'bottom-60' : 'bottom-44');
    if (activeChild !== '测试员') return null;

    // 1. 模拟升级
    const handleLevelUp = () => {
        const levelsList = (typeof LEVELS !== 'undefined' ? LEVELS : (typeof window !== 'undefined' && window.LEVELS ? window.LEVELS : []));
        const currentLevel = getLevelInfo(currentXP); 
        const nextLevel = levelsList.find(l => l.level === currentLevel.level + 1);
        if (nextLevel) {
            const needed = nextLevel.xp - currentXP;
            const key = `${activeChild}-GOD_MODE-${Date.now()}`;
            setXpHistory(prev => ({ ...prev, [key]: needed }));
        } else {
            showToast('info', '已达最高等级！');
        }
    };

    // 2. 触发随机事件（按纪元，仅含 unique/repeat 类型，修复"当前纪元"不过滤的Bug）
    const handleForceEvent = (targetEra) => {
        const levelInfo = getLevelInfo(currentXP);
        const eraToUse = targetEra || levelInfo.era;
        const availableEvents = RANDOM_EVENTS.filter(e => e.era === eraToUse);
        if (availableEvents.length === 0) {
            showToast('warning', '无可用事件');
            return;
        }
        const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        setCurrentRandomEvent(event);
        setShowRandomEvent(true);
    };

    // 2b. 按类型强制触发（不受每日次数限制）
    const handleForceEventByType = (type) => {
        if (type === 'history') {
            const histEvents = (typeof HISTORICAL_EVENTS !== 'undefined') ? HISTORICAL_EVENTS : (typeof window !== 'undefined' && window.HISTORICAL_EVENTS ? window.HISTORICAL_EVENTS : []);
            if (histEvents.length === 0) { showToast('warning', '历史事件数据未加载'); return; }
            const event = histEvents[Math.floor(Math.random() * histEvents.length)];
            setCurrentRandomEvent(event);
            setShowRandomEvent(true);
        } else {
            const available = RANDOM_EVENTS.filter(e => e.type === type);
            if (available.length === 0) { showToast('warning', '无可用事件'); return; }
            const event = available[Math.floor(Math.random() * available.length)];
            setCurrentRandomEvent(event);
            setShowRandomEvent(true);
        }
    };

    // 3. 资源管理
    const addResource = (type, amount) => {
        const key = `${activeChild}-GOD_${type.toUpperCase()}-${Date.now()}`;
        
        if (type === 'gold') {
            const newHistory = { ...wheelHistory, [key]: amount };
            setWheelHistory(newHistory);
            updateStats(activeChild, 'gold_earn', amount, { source: 'debug', dateKey: getLocalDateKey(0) });
            checkAchievements('gold_earn', {}, { wheelHistory: newHistory });
        } else {
            setXpHistory(prev => ({ ...prev, [key]: amount }));
        }
    };
    
    // 4. 填充背包
    const fillInventory = () => {
        const allItems = {};
        SHOP_ITEMS.forEach(item => { allItems[item.id] = 5; });
        setInventory(prev => ({ ...prev, '测试员': allItems }));
    };

    // 5. 【升级版】彻底清空所有数据（含任务列表、书阁、宠物槽位、星星余额等全系统）
    const handleClearData = () => {
        if(confirm('⚠️ 警告：确定要彻底重置测试员的所有数据吗？\n\n将清空：\n- 任务列表/打卡记录/补签记录\n- 经验值/等级/档案初始复位\n- 金元宝/账单/星星余额\n- 背包道具/已装备外观/Buff\n- 已解锁成就/大事纪记录\n- 宠物运行时数据/槽位/探险/日志\n- 天工书阁阅读历史/书架\n- 作业与考试成绩登记\n- 豁免记录/周工资结算\n- 每日奇遇/历史事件进度\n- 静音禁言/AI对话历史等\n\n测试员将彻底恢复为初始测试状态！')) {
            if (typeof onResetTesterData === 'function') {
                onResetTesterData();
            }

            const clearFilter = (prev) => { 
                const n={...prev}; 
                Object.keys(n).forEach(k => {
                    if (k.startsWith('TESTER') || k.startsWith(activeChild)) {
                        delete n[k];
                    }
                }); 
                return n; 
            };
            
            setXpHistory(clearFilter);
            setWheelHistory(clearFilter);
            
            setCheckins(prev => ({...prev, [activeChild]: {}}));
            setInventory(prev => ({...prev, [activeChild]: {}}));
            setAchievements(prev => ({...prev, [activeChild]: {}}));
            
            setMilestones(prev => prev.filter(m => m.member !== 'TESTER' && m.member !== activeChild));
            setNotifiedLevels(prev => ({...prev, [activeChild]: 0}));
            
            setActiveBuffs(prev => ({ ...prev, [activeChild]: {} }));
            setEquippedGear(prev => ({ ...prev, [activeChild]: {} }));
            setStats(prev => ({ ...prev, [activeChild]: {} }));
            
            if(setCurriculumProgress) setCurriculumProgress(prev => ({ ...prev, [activeChild]: {} }));
            if(setRedeemedCoupons) setRedeemedCoupons(prev => ({ ...prev, [activeChild]: [] }));
            if(setRandomEventHistory) setRandomEventHistory(prev => ({ ...prev, [activeChild]: [] }));
            
            if (setExemptedDays) {
                setExemptedDays(prev => {
                    return { ...prev, [activeChild]: [] };
                });
            }
            
            if (setWeeklyPayroll) setWeeklyPayroll(prev => ({ ...prev, [activeChild]: {} }));
            if (setWeeklyPayrollToClaim) setWeeklyPayrollToClaim(null);
            
            if (setRepairedCheckins) setRepairedCheckins(prev => ({ ...prev, [activeChild]: {} }));
            
            if (setHomeworkRecords) setHomeworkRecords(prev => ({ ...prev, [activeChild]: [] }));
            if (setExamRecords) setExamRecords(prev => ({ ...prev, [activeChild]: [] }));
            
            if (setDailyRandomCounts) setDailyRandomCounts(prev => { const n = {}; Object.keys(prev || {}).forEach(k => { if (!k.startsWith('TESTER') && !k.startsWith(activeChild)) n[k] = prev[k]; }); return n; });
        
            if (setActiveSilenceMutes) setActiveSilenceMutes(prev => { const n = { ...prev }; delete n['TESTER']; delete n[activeChild]; return n; });

            if (setHistoricalEventProgress) setHistoricalEventProgress(prev => ({ ...prev, [activeChild]: [] }));
            if (setDailyEventTypeCounts) setDailyEventTypeCounts(prev => { const n = {}; Object.keys(prev || {}).forEach(k => { if (!k.startsWith('TESTER') && !k.startsWith(activeChild)) n[k] = prev[k]; }); return n; });

            if (setStarHistory) setStarHistory(clearFilter);

            if (setPetData) setPetData(prev => ({ ...prev, [activeChild]: {} }));
            if (setOwnedPets) setOwnedPets(prev => ({ ...prev, [activeChild]: [] }));
            if (setActivePet) setActivePet(prev => ({ ...prev, [activeChild]: null }));
            if (setPetCooldowns) setPetCooldowns(prev => ({ ...prev, [activeChild]: {} }));
            if (setPetStats) setPetStats(prev => ({ ...prev, [activeChild]: {} }));
            if (setPetSkillCooldowns) setPetSkillCooldowns(prev => ({ ...prev, [activeChild]: {} }));
            if (setPetBuffs) setPetBuffs(prev => ({ ...prev, [activeChild]: {} }));

            if (setPetAdventures) setPetAdventures(prev => ({ ...prev, [activeChild]: {} }));
            if (setPetAdventureLog) setPetAdventureLog(prev => ({ ...prev, [activeChild]: [] }));
            if (setPetAdventureStats) setPetAdventureStats(prev => ({ ...prev, [activeChild]: {} }));

            showToast('success', '数据已彻底重置');
        }
    };

    // 6. 测试“周学习工资”结算
    const handleTestWeeklyPayroll = () => {
        if (typeof onTestWeeklyPayroll === 'function') {
            onTestWeeklyPayroll();
        } else {
            showToast('info', '当前版本未接入周学习工资测试入口。');
        }
    };

    return (
        <>
            {/* 悬浮球：与背包同尺寸；在信封/月度总结之上，互不遮挡 */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed right-4 z-[92] w-14 h-14 rounded-full shadow-2xl border-2 flex items-center justify-center font-bold text-xl transition-colors transition-transform duration-300 npc-float ${godBottom} ${isOpen ? 'bg-slate-800 border-red-500 text-red-500 rotate-45' : 'bg-black border-green-500 text-green-400 hover:scale-110'}`}
                title="上帝模式控制台"
            >
                {isOpen ? '＋' : <span className="font-mono text-xs">GM</span>}
            </button>

            {/* 悬浮菜单 (绝对定位的 Popover) */}
            {isOpen && (
                <div className={`fixed right-4 z-[91] w-64 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-green-500/30 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200 flex flex-col ${godPopoverBottom}`}>
                    {/* 头部 */}
                    <div className="p-3 bg-slate-800/50 flex justify-between items-center border-b border-green-900/50">
                        <h3 className="text-green-400 font-mono font-bold text-xs flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                            GOD_MODE
                        </h3>
                        <div className="text-[10px] text-gray-500 font-mono">v3.0</div>
                    </div>

                    {/* 功能区 (紧凑布局) */}
                    <div className="p-3 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        
                        {/* 资源 */}
                        <button onClick={() => addResource('gold', 100)} className="col-span-1 p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-yellow-400 font-bold text-[10px] text-left transition-colors active:scale-95">
                            💰 +100 元宝
                        </button>
                        <button onClick={() => addResource('xp', 100)} className="col-span-1 p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-blue-400 font-bold text-[10px] text-left transition-colors active:scale-95">
                            ⚡ +100 XP
                        </button>
                        
                        {/* 升级 */}
                        <button onClick={handleLevelUp} className="col-span-2 p-2 bg-green-900/20 hover:bg-green-900/40 rounded border border-green-800/50 text-green-400 font-bold text-[10px] flex items-center justify-between group transition-colors active:scale-95">
                            <span>🆙 立即升级 (+1 Level)</span>
                            <span className="text-[9px] opacity-50">Auto</span>
                        </button>

                        {/* 物品 */}
                        <button onClick={fillInventory} className="col-span-2 p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-purple-400 font-bold text-[10px] text-center transition-colors active:scale-95">
                            🎒 填充背包 (全道具x5)
                        </button>

                        <div className="col-span-2 h-px bg-slate-700/50 my-1"></div>

                        {/* 事件 */}
                        <button onClick={() => handleForceEvent()} className="col-span-2 p-2 bg-indigo-900/20 hover:bg-indigo-900/40 rounded border border-indigo-800/50 text-indigo-300 font-bold text-[10px] transition-colors active:scale-95">
                            🎲 触发事件 (当前纪元，固定/重复)
                        </button>
                        <div className="col-span-2 grid grid-cols-4 gap-1">
                            <button onClick={() => handleForceEvent('远古之路')} className="p-1 bg-stone-800 hover:bg-stone-700 rounded text-stone-300 text-[9px] border border-stone-600">远古</button>
                            <button onClick={() => handleForceEvent('文明初曙')} className="p-1 bg-orange-900/30 hover:bg-orange-900/50 rounded text-orange-300 text-[9px] border border-orange-800">文明</button>
                            <button onClick={() => handleForceEvent('周·礼制与争鸣')} className="p-1 bg-emerald-900/30 hover:bg-emerald-900/50 rounded text-emerald-300 text-[9px] border border-emerald-800">周礼</button>
                            <button onClick={() => handleForceEvent('魏晋隋唐·融合与登科')} className="p-1 bg-purple-900/30 hover:bg-purple-900/50 rounded text-purple-300 text-[9px] border border-purple-800">大唐</button>
                        </div>
                        <div className="col-span-2 text-[9px] text-slate-400 mt-0.5">按类型测试（不限次数）</div>
                        <div className="col-span-2 grid grid-cols-3 gap-1">
                            <button onClick={() => handleForceEventByType('unique')} className="p-1.5 bg-indigo-900/40 hover:bg-indigo-900/60 rounded text-indigo-300 text-[9px] border border-indigo-800 font-bold">✨ 固定</button>
                            <button onClick={() => handleForceEventByType('repeat')} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-[9px] border border-slate-600 font-bold">🎲 重复</button>
                            <button onClick={() => handleForceEventByType('history')} className="p-1.5 bg-amber-900/40 hover:bg-amber-900/60 rounded text-amber-300 text-[9px] border border-amber-800 font-bold">📅 历史</button>
                        </div>

                        <div className="col-span-2 h-px bg-slate-700/50 my-1"></div>

                        {/* 重置 */}
                        <button onClick={handleClearData} className="col-span-2 p-2 bg-red-900/20 hover:bg-red-900/40 rounded border border-red-900/50 text-red-500 font-bold text-[10px] flex items-center justify-center gap-1 transition-colors active:scale-95">
                            <Trash2 className="w-3 h-3" /> 彻底重置测试员数据
                        </button>

                        {/* 周学习工资结算测试 */}
                        <button onClick={handleTestWeeklyPayroll} className="col-span-2 p-2 bg-amber-900/20 hover:bg-amber-900/40 rounded border border-amber-600/60 text-amber-300 font-bold text-[10px] flex items-center justify-center gap-1 transition-colors active:scale-95">
                            <span>💼 测试每周学习工资结算</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
