import React, { useContext } from 'react';
import { Trophy, Flag, FileText, Clock, Target, CheckCircle2, BookOpen } from '../icons.jsx';
import { PerformanceContext } from '../../context/PerformanceContext';
import { getLocalDateKey } from '../../utils/date.js';
import {
  getTaskTotalSessions,
  getCheckinSessionCount,
  getCheckinMinutes,
  getCheckinUnits,
  getTaskTotalMinutes
} from '../../utils/checkin.js';
import { isDateHolidayOrWeekend } from '../../utils/holidays.js';

// 任务卡片内部组件
export const TaskCardInner = (({ 
  task, 
  checkins, 
  activeChild, 
  globalDates, 
  theme, 
  inventory, 
  onUseSkipCard, 
  equippedGear, 
  onEarlyComplete,
  onOpenQuickCheckin,
  onOpenTransition
}) => {
            const today = getLocalDateKey(0);
            const record = checkins[activeChild]?.[task.id] || {};
            const currentCount = (task.multiCheckin && (task.frequencyType || "count") === "daily_must") ? getTaskTotalSessions(record) : Object.keys(record).length;
            const frequencyType = task.frequencyType || 'count';
            const isReading = !!task.readingConfig?.isReading || frequencyType === 'reading';
            const rCfg = task.readingConfig || {};
            const rCur = rCfg.currentProgress || 0;
            const rTotal = rCfg.totalPages || rCfg.totalChapters || rCfg.dailyTargetMinutes || rCfg.targetCount || 100;
            const rPct = Math.min(100, Math.round((rCur / rTotal) * 100));
            const rUnit = rCfg.mode === 'chapters' ? '章' : rCfg.mode === 'duration' ? '分' : rCfg.mode === 'count' ? '本' : '页';
            const needsNextBook = isReading && !!rCfg.needsNextBook;

            // 每日必做/每周选做/阅读不按目标次数判定完结，由周结算/100%全本通关结算
            const isCountType = frequencyType === 'count' && !isReading;
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
            const isMultiTask = task.multiCheckin && frequencyType === 'daily_must' && !isReading;
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

            // 阅读周期与超期顺延计算
            const rStartDate = rCfg.startDate || task.startDate || today;
            const rDeadline = (() => {
                if (rCfg.deadlineDate) return rCfg.deadlineDate;
                const d = new Date(rStartDate.replace(/-/g, '/'));
                if (rCfg.period === 'monthly') {
                    d.setDate(d.getDate() + 30);
                } else {
                    d.setDate(d.getDate() + 7);
                }
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            })();

            const isReadingOverdue = isReading && today > rDeadline;
            const readingOverdueDays = isReadingOverdue 
                ? Math.max(1, Math.round((new Date(today.replace(/-/g, '/')) - new Date(rDeadline.replace(/-/g, '/'))) / (1000 * 60 * 60 * 24)))
                : 0;
            const readingExtendedWeeks = Math.floor(readingOverdueDays / 7) + 2;

            // 周期与顺延阶段标签
            const readingCycleBadge = (() => {
                if (!isReading) return null;
                if (isReadingOverdue) {
                    return rCfg.period === 'monthly' ? '月度续读中' : `第 ${readingExtendedWeeks} 周续读中`;
                }
                return rCfg.period === 'monthly' ? '月必读进行中' : '第 1 周按期研读中';
            })();

            // 通关大奖
            const readingCurrentGrandReward = isReadingOverdue 
                ? (rCfg.overdueGrandReward ?? 20) 
                : (rCfg.grandReward ?? 30);

            // 每日建议页数分解
            const readingRemainPages = Math.max(0, rTotal - rCur);
            const readingRemainDays = isReadingOverdue
                ? Math.max(1, 7 - (readingOverdueDays % 7))
                : Math.max(1, Math.round((new Date(rDeadline.replace(/-/g, '/')) - new Date(today.replace(/-/g, '/'))) / (1000 * 60 * 60 * 24)));
            const readingDailySuggest = Math.max(1, Math.ceil(readingRemainPages / Math.max(1, readingRemainDays)));

            // 市集功能：跳过卡逻辑
            const hasSkipCard = (inventory['item_skip'] || 0) > 0;
            const isCheckedToday = !!record[today];
			
			// 特殊背景或低性能模式下的卡片样式逻辑：
			// 只要装备了任何特效背景（银河、极光、上元灯火、萤火虫、万象字阵等）或处于低性能模式，
			// 均保证采用高不透明度、高对比度的扎实卡片底色与清晰边框，杜绝背景反光穿透导致文字和框体看不清
			const { isLowPerf } = useContext(PerformanceContext);
			const activeBg = equippedGear?.[activeChild]?.background;
			const hasActiveBg = !!activeBg;
			const isSolidBgNeeded = hasActiveBg || isLowPerf;
			const bgStyle = isSolidBgNeeded ? 'bg-white/95 shadow-xs border-slate-200/90' : 'bg-amber-50/60 border-amber-200/80';
			const completedBgStyle = isSolidBgNeeded ? 'bg-amber-50/95 shadow-xs border-amber-300' : 'bg-yellow-50/50 border-yellow-200';

            // 周末选做冲刺提醒 (周五、周六、周日)
            const dayOfWeek = new Date().getDay();
            const isWeekendSprint = frequencyType === 'weekly_optional' && (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) && weekRemain > 0;

            // 节假日与周末免做
            const isHolidayToday = isDateHolidayOrWeekend(today);
            const isHolidayExempt = frequencyType === 'daily_must' && task.holidayExempt;

            // CASE 1: 伴读书目已读完或已暂存，等待选定下一本书
            if (needsNextBook) {
                const finishedTitle = rCfg.lastFinishedBook?.title || rCfg.bookTitle;
                return (
                    <div className={`p-4 rounded-2xl border shadow-sm relative overflow-hidden group hover:shadow-md transition-all backdrop-blur-xs ${bgStyle} border-amber-300 bg-gradient-to-br from-amber-50/70 to-orange-50/50`}>
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                                📚
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-800 truncate text-base">{task.name}</h3>
                                <p className="text-[11px] text-amber-700 font-semibold truncate">
                                    {finishedTitle ? `《${finishedTitle}》已通关入阁 🏆` : '上一本书已结卷入阁'}
                                </p>
                            </div>
                        </div>
                        <div className="p-2.5 bg-amber-100/70 border border-amber-200/80 rounded-xl mb-3 text-[11px] text-amber-900 leading-snug">
                            🎉 全本通关！任务槽位已准备好，点击下方按钮选定下一本必读书目，伴读无缝接力！
                        </div>
                        <button
                            type="button"
                            onClick={() => onOpenTransition && onOpenTransition(task)}
                            className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                            <span>选定新书开启新旅程</span>
                            <span>🚀</span>
                        </button>
                    </div>
                );
            }

            return (
                <div className={`p-4 rounded-2xl border shadow-sm relative overflow-visible group hover:shadow-md transition-colors transition-transform backdrop-blur-xs ${isCompleted ? `border-yellow-200 ${completedBgStyle}` : isReading ? `${bgStyle} border-amber-200` : task.type === 'core' ? `${bgStyle} border-amber-100` : `${bgStyle} border-stone-200`}`}>
                    {isCompleted && <div className="absolute -right-4 -top-4 w-16 h-16 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-end justify-start pl-3 pb-3 text-white shadow-lg"><Trophy className="w-6 h-6 animate-bounce" /></div>}
					
                    {/* 每周选做：iOS 式右上角角标 */}
					{frequencyType === 'weekly_optional' && !isReading && (
						<div className="absolute -top-1 -right-1 z-20 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-white text-[10px] font-bold shadow-md flex items-center justify-center ring-2 ring-white">
							每周 {task.weeklyTargetCount ?? 3} 次
						</div>
					)}

                    {/* 节假日免做徽章 */}
                    {isHolidayExempt && (
                        <div className="absolute -top-1 -right-1 z-20 h-5 px-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-bold shadow-md flex items-center justify-center ring-2 ring-white">
                            🏖️ 假日免做
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
								<span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
									isReadingOverdue 
										? 'bg-orange-50 text-orange-700 border-orange-200' 
										: 'bg-amber-50 text-amber-700 border-amber-200'
								}`}>
									{readingCycleBadge}
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
											? (isReadingOverdue ? 'bg-gradient-to-r from-orange-400 to-amber-600' : 'bg-gradient-to-r from-amber-500 to-orange-500')
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
									<span>通关大奖: +{readingCurrentGrandReward} 💰 {isReadingOverdue ? '(续读奖)' : '(满额奖)'}</span>
									<span>{rPct >= 100 ? '🎉 已通关整本书' : `还剩 ${readingRemainPages}${rUnit} · 建议每天读 ${readingDailySuggest}${rUnit}`}</span>
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
								<span className="text-center">{isReading ? '通关奖' : '均时'}<br/><span className="font-bold text-gray-700">{isReading ? `+${readingCurrentGrandReward}💰` : `${stats.avg}分`}</span></span>
							</div>
							<div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center gap-0.5">
								<Target className="w-3.5 h-3.5 text-gray-400" />
								<span className="text-center">{isReading ? '研读状态' : '截止'}<br/><span className="font-bold text-gray-700 text-[10px]">{isReading ? (isReadingOverdue ? '顺延续读' : '按期研读') : `${stats.targetDate.getMonth()+1}/${stats.targetDate.getDate()}`}</span></span>
							</div>
						</div>
					</div>

                    {/* 周末选做冲刺提醒 */}
                    {isWeekendSprint && (
                        <div className="mt-2.5 bg-amber-50/90 border border-amber-200/90 rounded-xl p-2 text-[10px] font-bold text-amber-800 flex items-center gap-1.5 shadow-2xs">
                            <span>⚡</span>
                            <span>周末冲刺：本周还差 {weekRemain} 次未达标，别忘打卡哦！</span>
                        </div>
                    )}

                    {/* 节假日免做说明 */}
                    {isHolidayExempt && isHolidayToday && (
                        <div className="mt-2.5 bg-emerald-50/90 border border-emerald-200/90 rounded-xl p-2 text-[10px] font-bold text-emerald-800 flex items-center gap-1.5 shadow-2xs">
                            <span>🌴</span>
                            <span>今日假日免做：不打卡不扣全勤，打卡额外得金元宝！</span>
                        </div>
                    )}

                    {/* 伴读书目今日打卡状态与快捷打卡按钮 */}
                    {isReading && (
                        <div className="mt-3 pt-2 border-t border-amber-100 flex flex-col gap-2">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className={isCheckedToday ? "text-emerald-600 font-bold" : "text-slate-500 font-medium"}>
                                    {isCheckedToday ? '✅ 今日已记录阅读' : '📖 今日未读 · 有读才打，不破全勤'}
                                </span>
                                {isCheckedToday && (
                                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                        已完成
                                    </span>
                                )}
                            </div>
                            {onOpenQuickCheckin && (
                                <button
                                    type="button"
                                    onClick={() => onOpenQuickCheckin(task)}
                                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <span>📖 记录今日阅读进度</span>
                                </button>
                            )}
                        </div>
                    )}

    				{/* 多次打卡：今日打卡汇总 */}
    				{isMultiTask && todaySessions > 0 && (
    					<div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-2 text-[10px] text-purple-700">
    						📋 今日已打卡 {todaySessions} 次 · 累计 {todayMinutes} 分钟{unitLabel ? ` · ${todayUnits}${unitLabel}` : ''}
    					</div>
    				)}

					{hasSkipCard && !isCheckedToday && !isCompleted && !isReading && (
                         <button onClick={() => onUseSkipCard(task)} className="mt-3 w-full py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors">使用免作业金牌跳过</button>
                    )}
					{!isCompleted && currentCount > 0 && !isReading && (
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
