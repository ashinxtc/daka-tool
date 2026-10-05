import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { TaskCard } from './TaskCard.jsx';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trophy, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  Coins, 
  SortDesc,
  Flame,
  Clipboard,
  BookOpen
} from '../icons.jsx';
import { getLocalDateKey } from '../../utils/date.js';
import { getCheckinSessionCount, getTaskTotalSessions } from '../../utils/checkin.js';

// 单个分类的泳道轨道子组件
const CategoryTrack = ({
  categoryKey,
  title,
  subtitle,
  icon,
  accent,
  tasks,
  checkins,
  activeChild,
  globalDates,
  theme,
  inventory,
  onUseSkipCard,
  equippedGear,
  onEarlyComplete,
  onOpenQuickCheckin,
  onOpenTransition,
  isExpanded,
  onToggleExpand,
  hasBgEffect,
  todayStr
}) => {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 1. 统计当前分类的关键数据指标（用于收起态与头部状态条）
  const stats = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { total: 0, done: 0, percent: 0, earnedCoins: 0, potentialCoins: 0, note: '暂无任务' };
    }

    const total = tasks.length;

    if (categoryKey === 'daily_must') {
      // 每日必做：统计今日完成项
      let done = 0;
      let earnedCoins = 0;
      let potentialCoins = 0;

      tasks.forEach(t => {
        const record = checkins[activeChild]?.[t.id] || {};
        const isDoneToday = (t.multiCheckin ? getCheckinSessionCount(record, todayStr) > 0 : !!record[todayStr]) || t.earlyCompleted;
        potentialCoins += (t.reward || 0);
        if (isDoneToday) {
          done += 1;
          earnedCoins += (t.reward || 0);
        }
      });

      const percent = Math.round((done / total) * 100);
      return {
        total,
        done,
        percent,
        earnedCoins,
        potentialCoins,
        isAllDone: done === total,
        remain: total - done
      };
    }

    if (categoryKey === 'weekly_optional') {
      // 每周选做：统计本周范围打卡
      const d = new Date();
      const day = d.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const weekStart = getLocalDateKey(mondayOffset);
      const weekEnd = getLocalDateKey(mondayOffset + 6);

      let targetMetCount = 0;
      let totalDoneSessions = 0;
      let totalTargetSessions = 0;
      let todayDoneCount = 0;

      tasks.forEach(t => {
        const record = checkins[activeChild]?.[t.id] || {};
        const weekDone = Object.keys(record).filter(dt => dt >= weekStart && dt <= weekEnd).length;
        const target = (t.weeklyTargetCount ?? 3);
        totalDoneSessions += weekDone;
        totalTargetSessions += target;
        if (weekDone >= target || t.earlyCompleted) {
          targetMetCount += 1;
        }
        if (record[todayStr]) {
          todayDoneCount += 1;
        }
      });

      const percent = totalTargetSessions > 0 ? Math.min(100, Math.round((totalDoneSessions / totalTargetSessions) * 100)) : 0;
      return {
        total,
        done: targetMetCount,
        percent,
        totalDoneSessions,
        totalTargetSessions,
        isAllDone: targetMetCount === total,
        todayDoneCount
      };
    }

    if (categoryKey === 'reading') {
      let doneToday = 0;
      let totalProgressSum = 0;
      let totalPagesSum = 0;
      tasks.forEach(t => {
        const rCfg = t.readingConfig || {};
        const cur = rCfg.currentProgress || 0;
        const tot = rCfg.totalPages || rCfg.totalChapters || 180;
        totalProgressSum += cur;
        totalPagesSum += tot;
        const record = checkins[activeChild]?.[t.id] || {};
        if (record[todayStr]) doneToday += 1;
      });
      const percent = totalPagesSum > 0 ? Math.min(100, Math.round((totalProgressSum / totalPagesSum) * 100)) : 0;
      return {
        total,
        done: doneToday,
        percent,
        isAllDone: doneToday === total,
        remain: total - doneToday
      };
    }

    // 按总次数目标的长期任务
    let completedCount = 0;
    let nearestCandidate = null;

    tasks.forEach(t => {
      const record = checkins[activeChild]?.[t.id] || {};
      const current = Object.keys(record).length;
      const target = t.targetCount || 1;
      const isCompleted = current >= target || t.earlyCompleted;
      const progress = Math.min(100, Math.round((current / target) * 100));

      if (isCompleted) {
        completedCount += 1;
      } else {
        if (!nearestCandidate || progress > nearestCandidate.progress) {
          nearestCandidate = { name: t.name, progress, remain: Math.max(0, target - current) };
        }
      }
    });

    return {
      total,
      done: completedCount,
      percent: Math.round((completedCount / total) * 100),
      isAllDone: completedCount === total,
      nearest: nearestCandidate
    };
  }, [categoryKey, tasks, checkins, activeChild, todayStr]);

  // 2. 智能优先级排序：展开泳道时，未完成或最需要操作的任务排在最左侧
  const prioritizedTasks = useMemo(() => {
    if (!tasks || tasks.length <= 1) return tasks || [];

    const list = [...tasks];
    if (categoryKey === 'daily_must') {
      return list.sort((a, b) => {
        const recA = checkins[activeChild]?.[a.id] || {};
        const recB = checkins[activeChild]?.[b.id] || {};
        const doneA = (a.multiCheckin ? getCheckinSessionCount(recA, todayStr) > 0 : !!recA[todayStr]) || a.earlyCompleted ? 1 : 0;
        const doneB = (b.multiCheckin ? getCheckinSessionCount(recB, todayStr) > 0 : !!recB[todayStr]) || b.earlyCompleted ? 1 : 0;
        return doneA - doneB; // 未完成在前
      });
    }

    if (categoryKey === 'weekly_optional') {
      const d = new Date();
      const day = d.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const weekStart = getLocalDateKey(mondayOffset);
      const weekEnd = getLocalDateKey(mondayOffset + 6);

      return list.sort((a, b) => {
        const recA = checkins[activeChild]?.[a.id] || {};
        const recB = checkins[activeChild]?.[b.id] || {};
        const weekDoneA = Object.keys(recA).filter(dt => dt >= weekStart && dt <= weekEnd).length;
        const weekDoneB = Object.keys(recB).filter(dt => dt >= weekStart && dt <= weekEnd).length;
        const targetA = a.weeklyTargetCount ?? 3;
        const targetB = b.weeklyTargetCount ?? 3;
        const metA = (weekDoneA >= targetA || a.earlyCompleted) ? 1 : 0;
        const metB = (weekDoneB >= targetB || b.earlyCompleted) ? 1 : 0;
        if (metA !== metB) return metA - metB;
        // 未打卡的在前
        const todayA = recA[todayStr] ? 1 : 0;
        const todayB = recB[todayStr] ? 1 : 0;
        return todayA - todayB;
      });
    }

    if (categoryKey === 'count') {
      return list.sort((a, b) => {
        const recA = checkins[activeChild]?.[a.id] || {};
        const recB = checkins[activeChild]?.[b.id] || {};
        const isDoneA = (Object.keys(recA).length >= (a.targetCount || 1) || a.earlyCompleted) ? 1 : 0;
        const isDoneB = (Object.keys(recB).length >= (b.targetCount || 1) || b.earlyCompleted) ? 1 : 0;
        if (isDoneA !== isDoneB) return isDoneA - isDoneB;
        // 未完赛的按进度从高到低（最接近完赛的排在最前）
        const progA = Object.keys(recA).length / (a.targetCount || 1);
        const progB = Object.keys(recB).length / (b.targetCount || 1);
        return progB - progA;
      });
    }

    if (categoryKey === 'reading') {
      return list.sort((a, b) => {
        const needA = a.readingConfig?.needsNextBook ? 0 : 1;
        const needB = b.readingConfig?.needsNextBook ? 0 : 1;
        if (needA !== needB) return needA - needB;

        const recA = checkins[activeChild]?.[a.id] || {};
        const recB = checkins[activeChild]?.[b.id] || {};
        const doneA = !!recA[todayStr] ? 1 : 0;
        const doneB = !!recB[todayStr] ? 1 : 0;
        return doneA - doneB;
      });
    }

    return list;
  }, [categoryKey, tasks, checkins, activeChild, todayStr]);

  // 3. 监听滚动状态更新左右导航按键可用性
  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !isExpanded) return;

    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });

    // 鼠标滚轮在卡片区域横向平滑滚动（桌面端高级体验）
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
        const atLeft = el.scrollLeft <= 0 && e.deltaY < 0;
        const atRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaY > 0;
        if (!atLeft && !atRight) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      el.removeEventListener('wheel', onWheel);
    };
  }, [isExpanded, updateScrollState, prioritizedTasks.length]);

  // 左右翻页微动
  const handleScroll = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const scrollAmount = 320; // 对应单张卡片宽度 + gap
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // 4. CSS 硬件级 Alpha 遮罩（业内真正无色透明渐隐，随滚动状态自适应边缘消融）
  const maskStyle = useMemo(() => {
    if (!canScrollLeft && !canScrollRight) {
      return {};
    }
    const leftFade = canScrollLeft ? 'transparent, black 36px' : 'black 0px';
    const rightFade = canScrollRight ? 'black calc(100% - 36px), transparent 100%' : 'black 100%';
    const gradient = `linear-gradient(to right, ${leftFade}, ${rightFade})`;
    return {
      maskImage: gradient,
      WebkitMaskImage: gradient
    };
  }, [canScrollLeft, canScrollRight]);

  if (!tasks || tasks.length === 0) return null;

  return (
    <div className={`rounded-2xl transition-all duration-300 border ${
      hasBgEffect 
        ? 'bg-white/20 backdrop-blur-md border-white/20 shadow-sm' 
        : 'bg-white/70 backdrop-blur-sm border-gray-100 shadow-sm hover:shadow-md'
    }`}>
      {/* 头部手风琴控制条（平时展现的高密度数据看板，彻底无气泡框空气感设计） */}
      <div 
        onClick={onToggleExpand}
        className={`px-4 py-3 cursor-pointer flex flex-wrap items-center justify-between gap-3 select-none transition-colors rounded-2xl group ${
          hasBgEffect ? 'hover:bg-white/10' : 'hover:bg-black/[0.02]'
        }`}
      >
        {/* 左侧：分类标题与核心标识 */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shadow-sm shrink-0" style={{ background: accent.iconBg }}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className={`text-sm font-extrabold tracking-tight flex items-center gap-1 ${
                hasBgEffect ? 'text-white drop-shadow-xs' : 'text-gray-800'
              }`}>
                {title}
              </h3>
              <span className={`text-[11px] font-medium ${
                hasBgEffect ? 'text-white/60' : 'text-gray-400'
              }`}>
                · {tasks.length} 项
              </span>
            </div>
            {subtitle && (
              <p className={`text-[11px] font-medium truncate hidden sm:block ${
                hasBgEffect ? 'text-white/60' : 'text-gray-400'
              }`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* 中间与右侧：彻底去框化的数据指标与展开操作 */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {categoryKey === 'daily_must' && (
            <>
              {/* 今日完成度裸轨进度 */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${
                  hasBgEffect ? 'text-white drop-shadow-xs' : 'text-gray-700'
                }`}>
                  {stats.done}/{stats.total}
                </span>
                <div className={`w-14 sm:w-18 h-1.5 rounded-full overflow-hidden ${
                  hasBgEffect ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${stats.percent}%`, 
                      background: accent.bar 
                    }}
                  />
                </div>
                <span className={`text-[10px] font-semibold ${
                  hasBgEffect ? 'text-white/70' : 'text-gray-400'
                }`}>
                  {stats.percent}%
                </span>
              </div>

              {/* 收益预估（纯文本+图标，去气泡框） */}
              <div className="hidden md:flex items-center gap-1 text-[11px] font-bold">
                <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className={hasBgEffect ? 'text-amber-200 drop-shadow-xs' : 'text-amber-600'}>
                  +{stats.earnedCoins}
                </span>
                <span className={`font-normal ${hasBgEffect ? 'text-white/50' : 'text-gray-400'}`}>
                  / +{stats.potentialCoins} 金币
                </span>
              </div>

              {/* 达标状态（去气泡框，极简状态指示） */}
              {stats.isAllDone ? (
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                  hasBgEffect ? 'text-emerald-300 drop-shadow-xs' : 'text-emerald-600'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> 今日全达标
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${
                  hasBgEffect ? 'text-rose-300' : 'text-rose-500'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  待打卡 {stats.remain} 项
                </span>
              )}
            </>
          )}

          {categoryKey === 'weekly_optional' && (
            <>
              {/* 本周打卡统计（去气泡框，裸轨进度） */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${
                  hasBgEffect ? 'text-sky-300 drop-shadow-xs' : 'text-sky-700'
                }`}>
                  本周已打 {stats.totalDoneSessions} 次
                </span>
                <div className={`w-14 sm:w-18 h-1.5 rounded-full overflow-hidden ${
                  hasBgEffect ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${stats.percent}%`, 
                      background: accent.bar 
                    }}
                  />
                </div>
              </div>

              {/* 达标情况（去气泡框） */}
              {stats.isAllDone ? (
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                  hasBgEffect ? 'text-teal-300 drop-shadow-xs' : 'text-teal-600'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> 本周全达标
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                  hasBgEffect ? 'text-white/80' : 'text-sky-600'
                }`}>
                  {stats.done}/{stats.total} 项达标
                </span>
              )}
            </>
          )}

          {categoryKey === 'reading' && (
            <>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${
                  hasBgEffect ? 'text-amber-300 drop-shadow-xs' : 'text-amber-700'
                }`}>
                  今日已读 {stats.done}/{stats.total} 本
                </span>
                <div className={`w-14 sm:w-18 h-1.5 rounded-full overflow-hidden ${
                  hasBgEffect ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${stats.percent}%`, 
                      background: accent.bar 
                    }}
                  />
                </div>
              </div>

              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                hasBgEffect ? 'text-amber-200' : 'text-amber-700'
              }`}>
                总体研读 {stats.percent}%
              </span>
            </>
          )}

          {categoryKey === 'count' && (
            <>
              {stats.nearest ? (
                <div className={`hidden sm:flex items-center gap-1 text-[11px] font-medium ${
                  hasBgEffect ? 'text-white/70' : 'text-slate-600'
                }`}>
                  <span className={hasBgEffect ? 'text-white/40' : 'text-gray-400'}>最近达成:</span>
                  <span className={`font-bold truncate max-w-[120px] ${hasBgEffect ? 'text-white' : 'text-slate-800'}`}>
                    {stats.nearest.name}
                  </span>
                  <span className="font-bold text-indigo-400">({stats.nearest.progress}%)</span>
                </div>
              ) : null}

              {/* 完赛状态（无框图标+文本） */}
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                stats.isAllDone 
                  ? (hasBgEffect ? 'text-amber-300 drop-shadow-xs' : 'text-amber-600') 
                  : (hasBgEffect ? 'text-indigo-300' : 'text-indigo-600')
              }`}>
                {stats.isAllDone ? (
                  <>
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>全部完赛</span>
                  </>
                ) : `已完赛 ${stats.done}/${stats.total} 项`}
              </span>
            </>
          )}

          {/* 右侧微控与展开指示（彻底去气泡框，轻盈灵动的微动文字） */}
          <div className="flex items-center gap-1.5 ml-1">
            {isExpanded && tasks.length > 2 && (
              <div className="flex items-center gap-1 mr-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => handleScroll('left')}
                  disabled={!canScrollLeft}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    canScrollLeft 
                      ? (hasBgEffect 
                          ? 'bg-white/15 hover:bg-white/25 text-white active:scale-95' 
                          : 'hover:bg-black/5 text-gray-700 active:scale-95') 
                      : 'opacity-20 text-gray-400 cursor-not-allowed'
                  }`}
                  title="向左滚动"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll('right')}
                  disabled={!canScrollRight}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    canScrollRight 
                      ? (hasBgEffect 
                          ? 'bg-white/15 hover:bg-white/25 text-white active:scale-95' 
                          : 'hover:bg-black/5 text-gray-700 active:scale-95') 
                      : 'opacity-20 text-gray-400 cursor-not-allowed'
                  }`}
                  title="向右滚动"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 展开/收起：无气泡框，轻盈灵动的文本与动效箭头 */}
            <span className={`inline-flex items-center gap-1 text-xs font-bold transition-all ${
              hasBgEffect 
                ? (isExpanded ? 'text-white drop-shadow-xs' : 'text-white/75 group-hover:text-white') 
                : (isExpanded ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800')
            }`}>
              <span>{isExpanded ? '收起' : '展开'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </span>
          </div>
        </div>
      </div>

      {/* 展开态：横向卡片跑道泳道（固定高度，绝对不垂挂堆叠撑爆页面） */}
      {isExpanded && (
        <div className={`relative p-3 pt-3 border-t ${
          hasBgEffect ? 'border-white/15' : 'border-gray-100/80'
        }`}>

          {/* 卡片横向滚动轨道 */}
          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto py-3 px-2 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              ...maskStyle 
            }}
          >
            {prioritizedTasks.map(task => (
              <div 
                key={task.id} 
                className={`w-[305px] min-w-[305px] max-w-[305px] shrink-0 snap-start transition-all duration-300 transform-gpu hover:-translate-y-1.5 hover:scale-[1.01] ${
                  hasBgEffect 
                    ? 'rounded-2xl ring-1 ring-white/25 hover:ring-white/50 shadow-sm hover:shadow-xl hover:shadow-black/30' 
                    : 'rounded-2xl hover:shadow-lg'
                }`}
              >
                <TaskCard
                  task={task}
                  checkins={checkins}
                  activeChild={activeChild}
                  globalDates={globalDates}
                  theme={theme}
                  inventory={inventory}
                  onUseSkipCard={onUseSkipCard}
                  equippedGear={equippedGear}
                  onEarlyComplete={onEarlyComplete}
                  onOpenQuickCheckin={onOpenQuickCheckin}
                  onOpenTransition={onOpenTransition}
                />
              </div>
            ))}
          </div>

          {/* 底部微型提示与指示器自适应 */}
          <div className={`flex items-center justify-between mt-1 px-2 text-[10px] font-medium transition-colors ${
            hasBgEffect ? 'text-white/55' : 'text-gray-400'
          }`}>
            <span className="flex items-center gap-1.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                hasBgEffect ? 'bg-amber-400/80 shadow-[0_0_6px_rgba(251,191,36,0.6)]' : 'bg-gray-300'
              }`} />
              <span>未打卡任务已置前 · 支持滚轮或拖拽平滑滑行</span>
            </span>
            <span className="font-mono">
              共 {prioritizedTasks.length} 项任务
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 任务中心顶层数据看板组件
export const TaskDashboardTrack = ({
  tasks,
  checkins,
  activeChild,
  globalDates,
  theme,
  inventory,
  onUseSkipCard,
  equippedGear,
  onEarlyComplete,
  onOpenSettings,
  onOpenQuickCheckin,
  onOpenTransition,
  sortBy,
  setSortBy,
  viewMode
}) => {
  const todayStr = useMemo(() => getLocalDateKey(0), []);

  // 习惯类任务定义（通过独立元气悬浮按钮与生活坊面板管理，彻底移出学业长卡片跑道）
  const isHabitTask = (t) => t.frequencyType === 'habit' || !!t.isHabit || !!t.habitConfig?.isHabit;

  // 分类任务源（将伴读阅读任务与生活习惯彻底独立出来，不与每日必做/每周选做混杂）
  const readingTasks = useMemo(() => {
    return (tasks || []).filter(t => (t.frequencyType === 'reading' || t.readingConfig?.isReading) && !isHabitTask(t));
  }, [tasks]);

  const dailyMustTasks = useMemo(() => {
    return (tasks || []).filter(t => t.frequencyType === 'daily_must' && !t.readingConfig?.isReading && !isHabitTask(t));
  }, [tasks]);

  const weeklyOptionalTasks = useMemo(() => {
    return (tasks || []).filter(t => t.frequencyType === 'weekly_optional' && !t.readingConfig?.isReading && !isHabitTask(t));
  }, [tasks]);

  const countTasks = useMemo(() => {
    return (tasks || []).filter(t => (!t.frequencyType || t.frequencyType === 'count') && !t.readingConfig?.isReading && !isHabitTask(t));
  }, [tasks]);

  // 折叠状态控制（结合 localStorage 偏好记忆与智能默认）
  const [expandedSections, setExpandedSections] = useState(() => {
    const STORAGE_KEY = 'daka_task_accordion_states';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // 忽略解析异常
    }

    // 智能默认：伴读专栏与每日必做默认展开，其余默认收起保持紧凑
    return {
      reading: true,
      daily_must: true,
      weekly_optional: false,
      count: false
    };
  });

  // 持久化用户折叠偏好
  const toggleSection = useCallback((key) => {
    setExpandedSections(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('daka_task_accordion_states', JSON.stringify(next));
      } catch {
        // 忽略存储异常
      }
      return next;
    });
  }, []);

  // 一键全部展开 / 全部收起
  const isAllExpanded = expandedSections.daily_must && expandedSections.weekly_optional && expandedSections.count && (readingTasks.length === 0 || expandedSections.reading);
  const toggleAll = useCallback(() => {
    setExpandedSections(() => {
      const targetState = !isAllExpanded;
      const next = {
        reading: targetState,
        daily_must: targetState,
        weekly_optional: targetState,
        count: targetState
      };
      try {
        localStorage.setItem('daka_task_accordion_states', JSON.stringify(next));
      } catch {
        // 忽略异常
      }
      return next;
    });
  }, [isAllExpanded]);

  const hasBgEffect = !!(equippedGear?.[activeChild]?.background);

  // 全局概览统计计算
  const globalSummary = useMemo(() => {
    const totalDaily = dailyMustTasks.length;
    let doneDaily = 0;
    dailyMustTasks.forEach(t => {
      const record = checkins[activeChild]?.[t.id] || {};
      const isDone = (t.multiCheckin ? getCheckinSessionCount(record, todayStr) > 0 : !!record[todayStr]) || t.earlyCompleted;
      if (isDone) doneDaily += 1;
    });

    return {
      totalDaily,
      doneDaily,
      isDailyAllDone: totalDaily > 0 && doneDaily === totalDaily
    };
  }, [dailyMustTasks, checkins, activeChild, todayStr]);

  return (
    <div className="space-y-4 mb-8 w-full">
      {/* 顶部工具栏：看板指示、排序切换、一键全开全关 */}
      <div className={`flex flex-wrap items-center justify-between gap-2.5 text-xs font-bold transition-all duration-300 ${
        hasBgEffect 
          ? 'bg-slate-900/40 backdrop-blur-md border border-white/20 rounded-2xl px-3.5 py-2 shadow-lg shadow-black/20 text-white' 
          : 'text-gray-500 px-1'
      }`}>
        {/* 左侧：纯净标题与宏观概览（无独立气泡框，极简自然融合） */}
        <div className="flex items-center gap-2 flex-wrap py-0.5">
          <div className="flex items-center gap-1.5">
            <Clipboard className={`w-4 h-4 shrink-0 ${hasBgEffect ? 'text-amber-300 drop-shadow-xs' : 'text-amber-600'}`} />
            <span className={`text-xs font-extrabold tracking-tight ${
              hasBgEffect ? 'text-white drop-shadow-xs' : 'text-gray-800'
            }`}>
              任务看板
            </span>
          </div>

          {globalSummary.totalDaily > 0 && (
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${
              hasBgEffect
                ? (globalSummary.isDailyAllDone ? 'text-emerald-300 drop-shadow-xs font-bold' : 'text-white/80')
                : (globalSummary.isDailyAllDone ? 'text-emerald-600 font-bold' : 'text-gray-500')
            }`}>
              <span className={hasBgEffect ? 'text-white/30' : 'text-gray-300'}>·</span>
              {globalSummary.isDailyAllDone && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span>今日必做: {globalSummary.doneDaily}/{globalSummary.totalDaily}</span>
            </div>
          )}
        </div>

        {/* 右侧：排序选项与全局折叠切换 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 一键全开 / 全收 */}
          <button
            type="button"
            onClick={toggleAll}
            className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-medium ${
              hasBgEffect
                ? 'bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/20 shadow-xs'
                : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 shadow-2xs'
            }`}
          >
            {isAllExpanded ? '全部收起' : '全部展开'}
          </button>

          {/* 排序按钮组 */}
          <div className={`flex items-center gap-1 p-0.5 rounded-xl border transition-all ${
            hasBgEffect
              ? 'bg-white/10 backdrop-blur-xs border-white/20 shadow-xs'
              : 'bg-white/70 backdrop-blur-xs border-gray-200/80 shadow-2xs'
          }`}>
            <span className={`pl-2 pr-1 flex items-center gap-1 text-[11px] ${
              hasBgEffect ? 'text-white/60' : 'text-gray-400'
            }`}>
              <SortDesc className="w-3 h-3" /> 排序:
            </span>
            {['default', 'deadline', 'progress', 'reward'].map(type => (
              <button 
                key={type} 
                onClick={() => setSortBy(type)} 
                className={`px-2.5 py-0.5 rounded-lg text-[11px] transition-colors transition-transform ${
                  sortBy === type 
                    ? `${theme.primaryBg} text-white shadow-xs font-semibold` 
                    : (hasBgEffect 
                        ? 'text-white/80 hover:text-white hover:bg-white/10' 
                        : 'text-gray-600 hover:text-gray-900')
                }`}
              >
                {{ 'default': '默认', 'deadline': '截止', 'progress': '进度', 'reward': '奖励' }[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 0. 伴读书阁专栏泳道 */}
      {readingTasks.length > 0 && (
        <CategoryTrack
          categoryKey="reading"
          title="伴读书阁专栏"
          subtitle="以书为伴 · 随读随记 · 读完一本通关换下一本"
          icon={<BookOpen className="w-4 h-4 text-amber-600" />}
          accent={{
            iconBg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            bar: 'linear-gradient(90deg, #f59e0b, #d97706)'
          }}
          tasks={readingTasks}
          checkins={checkins}
          activeChild={activeChild}
          globalDates={globalDates}
          theme={theme}
          inventory={inventory}
          onUseSkipCard={onUseSkipCard}
          equippedGear={equippedGear}
          onEarlyComplete={onEarlyComplete}
          onOpenQuickCheckin={onOpenQuickCheckin}
          onOpenTransition={onOpenTransition}
          isExpanded={!!expandedSections.reading}
          onToggleExpand={() => toggleSection('reading')}
          hasBgEffect={hasBgEffect}
          todayStr={todayStr}
        />
      )}

      {/* 1. 每日必做任务泳道 */}
      <CategoryTrack
        categoryKey="daily_must"
        title="每日必做任务"
        subtitle="每天都要完成，周一统一结算学习工资"
        icon={<Flame className="w-4 h-4 text-orange-600" />}
        accent={{
          iconBg: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
          bar: 'linear-gradient(90deg, #f97316, #ef4444)'
        }}
        tasks={dailyMustTasks}
        checkins={checkins}
        activeChild={activeChild}
        globalDates={globalDates}
        theme={theme}
        inventory={inventory}
        onUseSkipCard={onUseSkipCard}
        equippedGear={equippedGear}
        onEarlyComplete={onEarlyComplete}
        isExpanded={!!expandedSections.daily_must}
        onToggleExpand={() => toggleSection('daily_must')}
        hasBgEffect={hasBgEffect}
        todayStr={todayStr}
      />

      {/* 2. 每周选做任务泳道 */}
      <CategoryTrack
        categoryKey="weekly_optional"
        title="每周选做任务"
        subtitle="本周完成指定次数即可发放基础与超额奖励"
        icon={<Target className="w-4 h-4 text-sky-600" />}
        accent={{
          iconBg: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
          bar: 'linear-gradient(90deg, #0284c7, #06b6d4)'
        }}
        tasks={weeklyOptionalTasks}
        checkins={checkins}
        activeChild={activeChild}
        globalDates={globalDates}
        theme={theme}
        inventory={inventory}
        onUseSkipCard={onUseSkipCard}
        equippedGear={equippedGear}
        onEarlyComplete={onEarlyComplete}
        isExpanded={!!expandedSections.weekly_optional}
        onToggleExpand={() => toggleSection('weekly_optional')}
        hasBgEffect={hasBgEffect}
        todayStr={todayStr}
      />

      {/* 3. 按总次数目标的长期任务泳道 */}
      <CategoryTrack
        categoryKey="count"
        title="按总次数目标任务"
        subtitle="完成约定次数即可获得完赛大奖"
        icon={<Trophy className="w-4 h-4 text-indigo-600" />}
        accent={{
          iconBg: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
          bar: 'linear-gradient(90deg, #8b5cf6, #6366f1)'
        }}
        tasks={countTasks}
        checkins={checkins}
        activeChild={activeChild}
        globalDates={globalDates}
        theme={theme}
        inventory={inventory}
        onUseSkipCard={onUseSkipCard}
        equippedGear={equippedGear}
        onEarlyComplete={onEarlyComplete}
        isExpanded={!!expandedSections.count}
        onToggleExpand={() => toggleSection('count')}
        hasBgEffect={hasBgEffect}
        todayStr={todayStr}
      />

      {/* 底部：添加 / 调整任务入口 */}
      <div className="pt-1">
        <button 
          type="button"
          onClick={() => onOpenSettings && onOpenSettings('tasks')} 
          className={`w-full border border-dashed rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-all shadow-2xs group ${
            hasBgEffect 
              ? 'border-white/30 text-white/85 bg-white/10 hover:bg-white/20 hover:text-white backdrop-blur-sm shadow-xs' 
              : 'border-gray-300/80 text-gray-400 hover:border-gray-400 hover:text-gray-600 hover:bg-white/60'
          }`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
            hasBgEffect ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold">添加 / 调整任务与目标</span>
        </button>
      </div>
    </div>
  );
};

export default TaskDashboardTrack;
