import React, { useState, useMemo } from 'react';
import { HabitCapsule } from './HabitCapsule.jsx';

/**
 * HabitFloatingButton: 元气生活·习惯养成专属悬浮球
 * 放置在左侧伴读按钮上方 (bottom-52 left-3 lg:left-4)
 * - 环形进度圈 (SVG Progress Ring): 综合今日习惯达标进度
 * - 智能状态：动态展示未完成优先的习惯 Emoji (💧/👀/🏃)；全达成展示 🌟
 * - 悬停展示微型胶囊面板，支持在浮层内一键直达打卡
 * - 点击主球展开「元气生活坊」全景面板
 */
export const HabitFloatingButton = ({
  habitTasks = [],
  activeChild,
  checkins = {},
  todayStr,
  onCheckin,
  onOpenPavilion
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // 1. 结构化所有习惯并计算打卡状态
  const structuredHabits = useMemo(() => {
    return (habitTasks || []).map(t => {
      const cfg = t.habitConfig || {};
      const isCount = cfg.mode === 'count' && (cfg.targetCount > 1 || t.targetCount > 1);
      const target = isCount ? (cfg.targetCount || t.targetCount || 8) : 1;
      const rec = checkins[activeChild]?.[t.id] || {};
      const val = rec[todayStr];
      const cur = val === undefined || val === null || val === '' ? 0 : (typeof val === 'number' ? val : (Array.isArray(val) ? val.length : 1));
      const isDone = cur >= target;
      const pct = Math.min(100, Math.round((cur / target) * 100));

      return {
        task: t,
        cfg,
        isCount,
        cur,
        target,
        isDone,
        pct,
        icon: cfg.icon || '🌱',
        name: t.name
      };
    });
  }, [habitTasks, activeChild, checkins, todayStr]);

  // 未达成的习惯排在最前面
  const sortedHabits = useMemo(() => {
    return [...structuredHabits].sort((a, b) => {
      if (a.isDone === b.isDone) return 0;
      return a.isDone ? 1 : -1;
    });
  }, [structuredHabits]);

  const totalCount = structuredHabits.length;
  const completedCount = structuredHabits.filter(h => h.isDone).length;
  const remainCount = totalCount - completedCount;
  const allDone = totalCount > 0 && remainCount === 0;

  // 综合总达成率
  const overallProgressPct = totalCount > 0
    ? Math.round(structuredHabits.reduce((sum, h) => sum + h.pct, 0) / totalCount)
    : 0;

  // 优先展示的习惯 (未完成优先，全完成则显示第一个)
  const primaryHabit = sortedHabits.find(h => !h.isDone) || sortedHabits[0] || null;

  // 中心 Emoji：全达标显示 🌟；有未完成显示当前优先习惯 Emoji；无任务显示 🌱
  const displayEmoji = totalCount === 0
    ? '🌱'
    : allDone
    ? '🌟'
    : (primaryHabit?.icon || '🌱');

  // SVG 环形进度条参数
  const size = 56;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallProgressPct / 100) * circumference;

  const handleMainClick = (e) => {
    e.stopPropagation();
    onOpenPavilion?.();
  };

  return (
    <div
      className="fixed bottom-52 left-3 lg:left-4 z-[90] flex items-center group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 悬浮主按钮 */}
      <button
        type="button"
        data-testid="habit-floating-btn"
        onClick={handleMainClick}
        className="relative w-11 h-11 lg:w-14 lg:h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 border-2 border-white shadow-xl flex items-center justify-center transform transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer npc-float"
        title={
          totalCount > 0
            ? `元气习惯 (${completedCount}/${totalCount} 项达标，${overallProgressPct}%) · 点击进入生活坊`
            : '元气习惯 · 点击开启习惯养成'
        }
      >
        {/* 外圈 SVG 环形进度条 */}
        <svg
          className="absolute inset-0 -rotate-90 pointer-events-none w-full h-full p-[2px]"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* 背景底轨 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth={strokeWidth}
          />
          {/* 进度弧线 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#ffffff"
            strokeWidth={strokeWidth + 0.5}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* 中心图标 */}
        <div className="relative z-10 flex items-center justify-center text-lg lg:text-2xl filter drop-shadow-sm">
          {displayEmoji}
        </div>

        {/* 右上角状态徽章 */}
        {totalCount > 0 ? (
          allDone ? (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-sm"
              title="今日习惯已全部达标"
            >
              ✓
            </span>
          ) : (
            <span
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center"
              title={`今日还有 ${remainCount} 项习惯待打卡`}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-white items-center justify-center text-[8px] font-black text-white">
                {remainCount}
              </span>
            </span>
          )
        ) : (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-600 border border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
            +
          </span>
        )}

        {/* 底部微小数值指示 */}
        {totalCount > 0 && (
          <div className="absolute -bottom-1.5 px-1 py-0.2 rounded-full bg-slate-900/85 text-emerald-200 text-[8px] font-bold border border-white/40 shadow-xs pointer-events-none scale-90 whitespace-nowrap">
            {allDone ? '已满分' : `${completedCount}/${totalCount}项`}
          </div>
        )}
      </button>

      {/* 悬停滑出：快捷习惯小坞 (向右平滑滑出，带防脱落悬浮桥) */}
      <div
        className={`absolute left-full pl-3 top-1/2 -translate-y-1/2 transition-all duration-300 z-[92] ${
          isHovered
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-emerald-200/90 text-xs w-64 max-h-[85vh] flex flex-col space-y-2">
          {/* 头部标题与进入大厅按钮 */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
              <span>🌱</span>
              <span>元气生活坊</span>
              {totalCount > 0 && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full">
                  {completedCount}/{totalCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleMainClick}
              className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>进入生活坊</span>
              <span>➔</span>
            </button>
          </div>

          {/* 无习惯时的提示 */}
          {totalCount === 0 && (
            <div className="text-center py-3 space-y-2">
              <div className="text-2xl">💧</div>
              <p className="font-bold text-slate-700 text-xs">暂无生活习惯任务</p>
              <p className="text-[10px] text-slate-400">喝水、眼操、跳绳...快去设置吧！</p>
              <button
                type="button"
                onClick={handleMainClick}
                className="w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                一键添加推荐习惯 ➔
              </button>
            </div>
          )}

          {/* 习惯列表 (最多展示 4 条，多余在全景弹窗查看) */}
          {totalCount > 0 && (
            <div className="space-y-1.5 overflow-y-auto max-h-56 pr-0.5">
              {sortedHabits.slice(0, 4).map(h => (
                <HabitCapsule
                  key={h.task.id}
                  task={h.task}
                  taskRecord={checkins[activeChild]?.[h.task.id] || {}}
                  todayStr={todayStr}
                  onCheckin={onCheckin}
                  compact={true}
                />
              ))}
              {totalCount > 4 && (
                <div 
                  onClick={handleMainClick}
                  className="text-center text-[10px] text-slate-400 hover:text-emerald-600 py-1 font-medium cursor-pointer"
                >
                  还有 {totalCount - 4} 项习惯，点击展开全部 ➔
                </div>
              )}
            </div>
          )}

          {/* 底部微小快捷提醒 */}
          <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>轻触快速打卡 · 点击主球进全景</span>
            <span className="text-emerald-500 font-bold">✨</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitFloatingButton;
