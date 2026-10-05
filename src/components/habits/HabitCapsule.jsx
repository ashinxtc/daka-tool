import React, { useState, useMemo } from 'react';
import { Flame, CheckCircle2, Plus, Coins } from '../icons.jsx';

// 纯本地 Web Audio 合成音效（0KB 外部依赖，原生浏览器无感高频轻量音效）
export function playHabitSound(type = 'water') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'water') {
      // 清脆灵动的水滴音调
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'complete') {
      // 达标三和弦轻音
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.12); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      // 默认清脆点击
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  } catch {
    // 忽略音频初始化失败或未授权静音
  }
}

/**
 * 计算单个习惯任务的连续达成天数
 */
export function getHabitStreak(task, taskRecord = {}, todayStr) {
  if (!task || !taskRecord) return 0;
  const target = task.habitConfig?.targetCount || (task.habitConfig?.mode === 'count' ? (task.targetCount || 1) : 1);
  const isCountMode = task.habitConfig?.mode === 'count' && target > 1;

  const isDayDone = (dateKey) => {
    const val = taskRecord[dateKey];
    if (val === undefined || val === null || val === '') return false;
    if (isCountMode) {
      const count = typeof val === 'number' ? val : (Array.isArray(val) ? val.length : 0);
      return count >= target;
    }
    return !!val;
  };

  let streak = 0;
  let curDate = new Date(todayStr.replace(/-/g, '/'));

  // 如果今天已达标，从今天开始算；若今天还没达标，从昨天往前算
  if (isDayDone(todayStr)) {
    streak++;
    curDate.setDate(curDate.getDate() - 1);
  } else {
    curDate.setDate(curDate.getDate() - 1);
  }

  // 往前回溯连续天数
  for (let i = 0; i < 365; i++) {
    const year = curDate.getFullYear();
    const month = String(curDate.getMonth() + 1).padStart(2, '0');
    const day = String(curDate.getDate()).padStart(2, '0');
    const prevKey = `${year}-${month}-${day}`;
    if (isDayDone(prevKey)) {
      streak++;
      curDate.setDate(curDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * HabitCapsule: 紧凑型习惯微章/交互胶囊 (方案 A 落地)
 * - 支持计次模式（如 💧 喝水 8杯，展示小水滴点亮阵列）
 * - 支持单次模式（如 👀 做眼操，轻触圆形复选框完成）
 * - 即时正向激励粒子与音效反馈
 */
export const HabitCapsule = ({
  task,
  taskRecord = {},
  todayStr,
  onCheckin,
  compact = false,
  themeColor = 'emerald'
}) => {
  const [justTapped, setJustTapped] = useState(false);

  const cfg = task.habitConfig || {};
  const isCountMode = cfg.mode === 'count' && (cfg.targetCount > 1 || task.targetCount > 1);
  const target = isCountMode ? (cfg.targetCount || task.targetCount || 8) : 1;
  const unit = cfg.unit || (cfg.icon === '💧' ? '杯' : '次');
  const icon = cfg.icon || '🌱';
  const reward = task.reward || 1;

  // 今日打卡进度
  const todayRaw = taskRecord[todayStr];
  const curCount = useMemo(() => {
    if (todayRaw === undefined || todayRaw === null || todayRaw === '') return 0;
    if (typeof todayRaw === 'number') return todayRaw;
    if (Array.isArray(todayRaw)) return todayRaw.length;
    return 1;
  }, [todayRaw]);

  const isCompleted = curCount >= target;
  const streak = useMemo(() => getHabitStreak(task, taskRecord, todayStr), [task, taskRecord, todayStr]);

  // 处理打卡动作
  const handleTap = (e, targetStep = null) => {
    e.stopPropagation();
    setJustTapped(true);
    setTimeout(() => setJustTapped(false), 500);

    if (isCountMode) {
      if (targetStep !== null) {
        // 直接点击某一个水滴/刻度
        const newCount = targetStep === curCount ? Math.max(0, curCount - 1) : targetStep;
        const delta = newCount - curCount;
        if (delta !== 0) {
          playHabitSound(newCount >= target ? 'complete' : (icon === '💧' ? 'water' : 'default'));
          onCheckin?.(task, delta);
        }
      } else {
        // 点击主卡片步进 +1 (如果满了再点则回退或重置)
        if (curCount < target) {
          playHabitSound(curCount + 1 >= target ? 'complete' : (icon === '💧' ? 'water' : 'default'));
          onCheckin?.(task, 1);
        } else {
          // 已满再次点击支持微调减 1
          playHabitSound('default');
          onCheckin?.(task, -1);
        }
      }
    } else {
      // 单次打卡：切换完成状态
      const nextDone = !isCompleted;
      playHabitSound(nextDone ? 'complete' : 'default');
      onCheckin?.(task, nextDone ? 1 : 0, true);
    }
  };

  // 胶囊色彩映射
  const colorMap = {
    sky: {
      bg: 'bg-sky-50/80 hover:bg-sky-100/80 border-sky-200/90',
      doneBg: 'bg-gradient-to-r from-sky-500 to-blue-500 text-white border-sky-400',
      text: 'text-sky-800',
      badge: 'bg-sky-100 text-sky-700',
      dotActive: 'bg-sky-500 text-white ring-2 ring-sky-200',
      dotInactive: 'bg-sky-100/90 hover:bg-sky-200 text-sky-300',
      progressFill: 'bg-sky-500'
    },
    emerald: {
      bg: 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200/90',
      doneBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400',
      text: 'text-emerald-800',
      badge: 'bg-emerald-100 text-emerald-700',
      dotActive: 'bg-emerald-500 text-white ring-2 ring-emerald-200',
      dotInactive: 'bg-emerald-100/90 hover:bg-emerald-200 text-emerald-300',
      progressFill: 'bg-emerald-500'
    },
    amber: {
      bg: 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200/90',
      doneBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-700',
      dotActive: 'bg-amber-500 text-white ring-2 ring-amber-200',
      dotInactive: 'bg-amber-100/90 hover:bg-amber-200 text-amber-300',
      progressFill: 'bg-amber-500'
    },
    purple: {
      bg: 'bg-purple-50/80 hover:bg-purple-100/80 border-purple-200/90',
      doneBg: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-400',
      text: 'text-purple-800',
      badge: 'bg-purple-100 text-purple-700',
      dotActive: 'bg-purple-500 text-white ring-2 ring-purple-200',
      dotInactive: 'bg-purple-100/90 hover:bg-purple-200 text-purple-300',
      progressFill: 'bg-purple-500'
    }
  };

  const cTheme = colorMap[cfg.color] || (icon === '💧' ? colorMap.sky : colorMap.emerald);

  // 1. 紧凑模式 (用于悬浮气泡或快捷预览)
  if (compact) {
    return (
      <div 
        onClick={(e) => handleTap(e)}
        className={`group flex items-center justify-between p-2 rounded-xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
          isCompleted 
            ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs' 
            : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-2xs'
        } ${justTapped ? 'scale-105' : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">{icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold truncate ${isCompleted ? 'text-emerald-900 line-through opacity-70' : 'text-slate-800'}`}>
                {task.name}
              </span>
              {streak > 1 && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-orange-500 bg-orange-50 px-1 rounded-sm shrink-0">
                  <Flame className="w-2.5 h-2.5" />{streak}
                </span>
              )}
            </div>
            {isCountMode ? (
              <span className="text-[10px] text-slate-400">
                {curCount} / {target} {unit}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">
                +{reward} 金币
              </span>
            )}
          </div>
        </div>

        {/* 快捷打卡操作按键 */}
        <div className="shrink-0 ml-2">
          {isCompleted ? (
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-2xs">
              ✓
            </span>
          ) : isCountMode ? (
            <button
              type="button"
              onClick={(e) => handleTap(e)}
              className="w-6 h-6 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold transition-transform active:scale-90"
              title="打卡+1"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-emerald-500 transition-colors flex items-center justify-center" />
          )}
        </div>
      </div>
    );
  }

  // 2. 完整卡片模式 (用于元气生活堂专区)
  return (
    <div 
      className={`relative p-3.5 rounded-2xl border transition-all duration-300 select-none ${
        isCompleted 
          ? 'bg-gradient-to-br from-emerald-50/90 to-teal-50/60 border-emerald-300 shadow-sm' 
          : 'bg-white hover:bg-slate-50/70 border-slate-200/90 shadow-2xs hover:shadow-md'
      } ${justTapped ? 'scale-[1.02]' : ''}`}
    >
      {/* 头部：图标、名称、奖励、连续达成天数 */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-2xs shrink-0 ${
            isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100'
          }`}>
            {icon}
          </div>
          <div className="min-w-0">
            <h4 className={`text-sm font-extrabold truncate ${isCompleted ? 'text-emerald-900' : 'text-slate-800'}`}>
              {task.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600">
                <Coins className="w-3 h-3 text-amber-500" />
                +{reward}
              </span>
              {streak > 0 && (
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                  streak >= 7 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-orange-50 text-orange-600'
                }`}>
                  <Flame className="w-3 h-3 text-orange-500" />
                  连续 {streak} 天
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 右侧主状态/打卡切换 */}
        <div>
          {!isCountMode ? (
            <button
              type="button"
              onClick={(e) => handleTap(e)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                isCompleted
                  ? 'bg-emerald-500 text-white shadow-2xs shadow-emerald-200 hover:bg-emerald-600'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/90'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>今日已达标</span>
                </>
              ) : (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600" />
                  <span>点击打卡</span>
                </>
              )}
            </button>
          ) : (
            <div className="text-right">
              <span className={`text-sm font-black ${isCompleted ? 'text-emerald-600' : 'text-slate-700'}`}>
                {curCount}
              </span>
              <span className="text-xs font-semibold text-slate-400">/{target}{unit}</span>
            </div>
          )}
        </div>
      </div>

      {/* 计次模式专属：水滴/步进阵列 (方案 A 的视觉灵魂) */}
      {isCountMode && (
        <div className="pt-2 border-t border-slate-100/90">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-400">
              {isCompleted ? '🎉 今日饮水/习惯已圆满完成！' : `今日已完成 ${curCount} ${unit}，还差 ${Math.max(0, target - curCount)} ${unit}`}
            </span>
            {curCount > 0 && (
              <button
                type="button"
                onClick={(e) => handleTap(e, Math.max(0, curCount - 1))}
                className="text-[10px] text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                title="撤销一次打卡"
              >
                撤销
              </button>
            )}
          </div>

          {/* 阵列水滴 / 胶囊小气泡 */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {Array.from({ length: target }).map((_, idx) => {
              const stepIdx = idx + 1;
              const isFilled = stepIdx <= curCount;
              return (
                <button
                  key={stepIdx}
                  type="button"
                  onClick={(e) => handleTap(e, stepIdx)}
                  className={`h-9 rounded-xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 ${
                    isFilled
                      ? (cTheme.dotActive + ' shadow-2xs font-black scale-100')
                      : (cTheme.dotInactive + ' font-medium scale-95')
                  }`}
                  title={`点击打卡至第 ${stepIdx} ${unit}`}
                >
                  <span className="text-xs">{isFilled ? icon : '○'}</span>
                  <span className="text-[9px] font-mono leading-none mt-0.5 opacity-90">{stepIdx}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitCapsule;
