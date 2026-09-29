import React from 'react';
import { Trophy, Flag, FileText, Clock, Target, CheckCircle2 } from '../icons.jsx';
import { getLocalDateKey } from '../../utils/date.js';
import {
  getTaskTotalSessions,
  getCheckinSessionCount,
  getCheckinMinutes,
  getCheckinUnits,
  getTaskTotalMinutes
} from '../../utils/checkin.js';

// 任务卡片内部组件
export const TaskCardInner = (({ task, checkins, activeChild, globalDates, theme, inventory, onUseSkipCard, equippedGear, onEarlyComplete }) => {
            const today = getLocalDateKey(0);
            const record = checkins[activeChild]?.[task.id] || {};
            const currentCount = (task.multiCheckin && (task.frequencyType || "count") === "daily_must") ? getTaskTotalSessions(record) : Object.keys(record).length;
            const frequencyType = task.frequencyType || 'count';
            // 每日必做/每周选做不按目标次数判定完结，由周结算发放完成奖励
            const isCountType = frequencyType === 'count';
            const isCompleted = (isCountType && currentCount >= (task.targetCount || 0)) || task.earlyCompleted;
            const targetCount = task.targetCount || 1;
            // 本周范围（周一～周日）用于每周选做展示
            const getCurrentWeekRange = () => {
                const d = new Date();
                const day = d.getDay();
                const mondayOffset = day === 0 ? -6 : 1 - day;
                return { start: getLocalDateKey(mondayOffset), end: getLocalDateKey(mondayOffset + 6) };
            };
            const weekRange = frequencyType === 'weekly_optional' ? getCurrentWeekRange() : null;
            const weekDone = weekRange ? Object.keys(record).filter(d => d >= weekRange.start && d <= weekRange.end).length : 0;
            const weeklyTarget = (task.weeklyTargetCount ?? 3);
            const weekRemain = Math.max(0, weeklyTarget - weekDone);
            const weekProgress = frequencyType === 'weekly_optional' ? Math.min(100, (weekDone / weeklyTarget) * 100) : 0;
            const isMultiTask = task.multiCheckin && frequencyType === 'daily_must';
            const effectiveSessionCount = isMultiTask ? getTaskTotalSessions(record) : Object.keys(record).length;
            const todaySessions = isMultiTask ? getCheckinSessionCount(record, today) : (!!record[today] ? 1 : 0);
            const todayMinutes = isMultiTask ? getCheckinMinutes(record, today) : (record[today] || 0);
            const todayUnits = isMultiTask ? getCheckinUnits(record, today) : 0;
            const unitLabel = isMultiTask ? (task.multiUnitLabel || '') : '';
            const stats = (() => {
                    const totalMinutes = isMultiTask ? getTaskTotalMinutes(record) : Object.values(record).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
                    const avg = effectiveSessionCount > 0 ? Math.round(totalMinutes / effectiveSessionCount) : 0;
                    const targetDate = new Date(task.deadline || globalDates.end);
                    const progress = isCountType ? Math.min(100, (currentCount / targetCount) * 100) : (frequencyType === 'weekly_optional' ? weekProgress : 0);
                    const baseIncome = effectiveSessionCount * task.reward;
                    let totalIncome = baseIncome;
                    if (isCompleted) totalIncome += (task.completedReward || 0);
                    return { avg, targetDate, progress, totalIncome };
            })();

            // 市集功能：跳过卡逻辑
            const hasSkipCard = (inventory['item_skip'] || 0) > 0;
            const isCheckedToday = !!record[today];
			
			// --- 新增：特殊背景下的卡片样式逻辑 ---
			const activeBg = equippedGear?.[activeChild]?.background;
			// 检查是否是需要高不透明度背景的装备 (甲骨流沙 或 万象字阵)
			const isSolidBgNeeded = ['bg_oraclesands', 'bg_matrix'].includes(activeBg);
			// 如果是特殊背景，使用 bg-white/90 (90%不透明度)，否则保持原来的 bg-amber-50/30 (半透明)
			const bgStyle = isSolidBgNeeded ? 'bg-white/90' : 'bg-amber-50/30';
			const completedBgStyle = isSolidBgNeeded ? 'bg-yellow-50/90' : 'bg-yellow-50/30'; // 完成状态也同步加深

			const isReading = !!task.readingConfig?.isReading;
			const rCfg = task.readingConfig || {};
			const rCur = rCfg.currentProgress || 0;
			const rTotal = rCfg.totalPages || rCfg.totalChapters || rCfg.dailyTargetMinutes || rCfg.targetCount || 100;
			const rPct = Math.min(100, Math.round((rCur / rTotal) * 100));
			const rUnit = rCfg.mode === 'chapters' ? '章' : rCfg.mode === 'duration' ? '分' : rCfg.mode === 'count' ? '本' : '页';

            return (
                <div className={`p-4 rounded-2xl border shadow-sm relative overflow-visible group hover:shadow-md transition-colors transition-transform backdrop-blur-xs ${isCompleted ? `border-yellow-200 ${completedBgStyle}` : task.type === 'core' ? `${bgStyle} border-amber-100` : `${bgStyle} border-stone-200`}`}>
                    {isCompleted && <div className="absolute -right-4 -top-4 w-16 h-16 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-end justify-start pl-3 pb-3 text-white shadow-lg"><Trophy className="w-6 h-6 animate-bounce" /></div>}
					{/* 每周选做：iOS 式右上角角标，不占位不挤占金元宝 */}
					{frequencyType === 'weekly_optional' && !isReading && (
						<div className="absolute -top-1 -right-1 z-20 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-white text-[10px] font-bold shadow-md flex items-center justify-center ring-2 ring-white">
							每周 {task.weeklyTargetCount ?? 3} 次
						</div>
					)}
                    <div className="flex justify-between items-start mb-2 relative z-10 gap-3">
						<h3 className="font-bold text-gray-800 truncate flex-1 min-w-0 text-lg flex items-center gap-1">
							{isReading ? (
								<span title="必读书目" className="text-xl shrink-0">{rCfg.coverEmoji || '📖'}</span>
							) : task.type === 'core' ? (
								<span title="核心任务" className="text-amber-500 drop-shadow-sm shrink-0">⭐</span> 
							) : (
								<span title="日常任务" className="text-emerald-500 drop-shadow-sm shrink-0">🍃</span>
							)}
							{task.name}
						</h3>
						<div className="text-right shrink-0 flex flex-col items-end gap-1">
							<span className="block text-2xl font-bold text-amber-500 drop-shadow-sm">{stats.totalIncome}</span>
							<span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">金元宝</span>
							{isReading ? (
								<span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
									{rCfg.period === 'monthly' ? '月必读' : rCfg.period === 'custom' ? '自选专栏' : '周必读'}
								</span>
							) : frequencyType !== 'count' && (
								<span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
									frequencyType === 'daily_must'
										? 'bg-red-50 text-red-500 border border-red-100'
										: 'bg-sky-50 text-sky-600 border border-sky-100'
								}`}>
									{frequencyType === 'daily_must' ? '每日必做' : '每周选做'}
								</span>
							)}
						</div>
					</div>
                    {task.targetGoal && <div className={`mb-3 text-sm ${theme.primary} ${theme.lightBg} p-2 rounded-lg border ${theme.lightBorder} flex items-start gap-2`}><Flag className="w-4 h-4 shrink-0 mt-0.5 opacity-70" /><span className="leading-snug opacity-90">{task.targetGoal}</span></div>}
                    <div className="space-y-3">
						<div>
							<div className="flex justify-between text-xs text-gray-400 mb-1 font-medium">
								<span>
									{isReading 
										? `研读进度 ${rCur}/${rTotal} ${rUnit}` 
										: isCountType ? `进度 ${currentCount}/${targetCount}` : frequencyType === 'weekly_optional' ? `本周 ${weekDone}/${weeklyTarget} 次` : '按周结算'
									}
								</span>
								<span>
									{isReading 
										? `${rPct}%` 
										: frequencyType === 'weekly_optional' ? (weekRemain > 0 ? `还差 ${weekRemain} 次达标` : '已达标') : isCountType ? `${Math.round(stats.progress)}%` : '—'
									}
								</span>
							</div>
							<div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
								<div 
									className={`h-full rounded-full transition-all duration-700 ${
										isCompleted 
											? 'bg-gradient-to-r from-yellow-400 to-amber-500' 
											: isReading 
											? 'bg-gradient-to-r from-amber-500 to-orange-500' 
											: frequencyType === 'weekly_optional' ? 'bg-gradient-to-r from-sky-400 to-sky-500' : `bg-gradient-to-r ${theme.gradient}`
									}`} 
									style={{ width: `${isReading ? rPct : stats.progress}%` }}
								/>
							</div>
							{frequencyType === 'weekly_optional' && !isReading && (
								<p className="text-[10px] text-sky-600/80 mt-1 font-medium">本周已完成 {weekDone} 次，{weekRemain > 0 ? `还差 ${weekRemain} 次达标` : '已达标 ✓'}</p>
							)}
							{isReading && (
								<p className="text-[10px] text-amber-700/80 mt-1 font-medium flex items-center justify-between">
									<span>通关大奖: +{rCfg.grandReward || 30} 金元宝</span>
									<span>{rPct >= 100 ? '🎉 已通关整本书' : `还剩 ${Math.max(0, rTotal - rCur)} ${rUnit}`}</span>
								</p>
							)}
						</div>
						<div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
							<div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center gap-0.5">
								<FileText className="w-3.5 h-3.5 text-amber-500" />
								<span className="text-center">{isReading ? '已研读' : '累积'}<br/><span className="font-bold text-gray-700">{isReading ? `${rCur}${rUnit}` : `${isMultiTask ? effectiveSessionCount : currentCount}次`}</span></span>
							</div>
							<div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center gap-0.5">
								<Clock className="w-3.5 h-3.5 text-gray-400" />
								<span className="text-center">{isReading ? '通关奖' : '均时'}<br/><span className="font-bold text-gray-700">{isReading ? `+${rCfg.grandReward || 30}💰` : `${stats.avg}分`}</span></span>
							</div>
							<div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center gap-0.5">
								<Target className="w-3.5 h-3.5 text-gray-400" />
								<span className="text-center">截止<br/><span className="font-bold text-gray-700">{stats.targetDate.getMonth()+1}/{stats.targetDate.getDate()}</span></span>
							</div>
						</div>
					</div>
                    				{/* 多次打卡：今日打卡汇总 */}
				{isMultiTask && todaySessions > 0 && (
					<div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-2 text-[10px] text-purple-700">
						📋 今日已打卡 {todaySessions} 次 · 累计 {todayMinutes} 分钟{unitLabel ? ` · ${todayUnits}${unitLabel}` : ''}
					</div>
				)}
					{hasSkipCard && !isCheckedToday && !isCompleted && (
                         <button onClick={() => onUseSkipCard(task)} className="mt-3 w-full py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors">使用免作业金牌跳过</button>
                    )}
					{!isCompleted && currentCount > 0 && (
						<button 
							onClick={() => onEarlyComplete(task.id)} 
							className="mt-2 w-full py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
						>
						   <CheckCircle2 className="w-3 h-3" /> 提前达成目标
						</button>
					)}
                </div>
            );
        });

export const TaskCard = React.memo(TaskCardInner);
export default TaskCard;
