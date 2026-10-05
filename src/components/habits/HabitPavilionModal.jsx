import React, { useState, useMemo } from 'react';
import { HabitCapsule } from './HabitCapsule.jsx';
import { 
  XIcon, 
  Sparkles, 
  Plus, 
  Flame, 
  Coins, 
  CheckCircle2, 
  Trophy,
  SettingsIcon
} from '../icons.jsx';

// 官方预置推荐生活习惯库 (支持家长/孩子一键添加常用规范)
export const PRESET_HABITS = [
  {
    name: '每日喝水达标',
    reward: 1,
    habitConfig: {
      isHabit: true,
      icon: '💧',
      category: 'water',
      mode: 'count',
      targetCount: 8,
      unit: '杯',
      color: 'sky',
      desc: '每天补充 8 杯温开水（每杯约 200ml），保持机体活力'
    }
  },
  {
    name: '护眼保健操',
    reward: 1,
    habitConfig: {
      isHabit: true,
      icon: '👀',
      category: 'eye',
      mode: 'count',
      targetCount: 0,
      hasTarget: false,
      unit: '次',
      color: 'emerald',
      desc: '课间眺望远方或做眼操，休息时即可做，不设总量上限随时记录'
    }
  },
  {
    name: '强身健体跳绳',
    reward: 2,
    habitConfig: {
      isHabit: true,
      icon: '🏃',
      category: 'sport',
      mode: 'count',
      targetCount: 500,
      unit: '下',
      color: 'amber',
      desc: '每日跳绳 500 下，增强体质，健康成长'
    }
  },
  {
    name: '早晚认真刷牙',
    reward: 1,
    habitConfig: {
      isHabit: true,
      icon: '🪥',
      category: 'routine',
      mode: 'count',
      targetCount: 2,
      unit: '次',
      color: 'sky',
      desc: '早晚各刷牙一次，采用巴氏刷牙法保护牙齿'
    }
  },
  {
    name: '准时早睡早起',
    reward: 2,
    habitConfig: {
      isHabit: true,
      icon: '🛏️',
      category: 'routine',
      mode: 'check',
      targetCount: 1,
      unit: '次',
      color: 'purple',
      desc: '21:30 前准时上床熄灯，保证充足高质量睡眠'
    }
  },
  {
    name: '每日水果维生素',
    reward: 1,
    habitConfig: {
      isHabit: true,
      icon: '🍎',
      category: 'diet',
      mode: 'check',
      targetCount: 1,
      unit: '次',
      color: 'emerald',
      desc: '每天吃一份新鲜应季水果，补充多种维生素'
    }
  },
  {
    name: '桌面与书包整理',
    reward: 1,
    habitConfig: {
      isHabit: true,
      icon: '🧹',
      category: 'routine',
      mode: 'check',
      targetCount: 1,
      unit: '次',
      color: 'amber',
      desc: '学习完毕物归原位，自己整理好书桌和次日书包'
    }
  }
];

export const HabitPavilionModal = ({
  show,
  onClose,
  habitTasks = [],
  activeChild,
  checkins = {},
  todayStr,
  onCheckin,
  onAddPresetHabit,
  onOpenSettings
}) => {
  const [activeFilter, setActiveFilter] = useState('all'); // all, pending, done
  const [showPresets, setShowPresets] = useState(false);

  // 1. 结构化当前习惯数据与统计指标
  const stats = useMemo(() => {
    let completedCount = 0;
    let earnedCoins = 0;
    let maxStreak = 0;

    const list = (habitTasks || []).map(t => {
      const cfg = t.habitConfig || {};
      const isCount = cfg.mode === 'count';
      const hasTarget = isCount && ((cfg.targetCount || 0) > 0 || (t.targetCount || 0) > 1);
      const isUnlimited = isCount && !hasTarget;
      const target = hasTarget ? (cfg.targetCount || t.targetCount || 8) : 1;
      const rec = checkins[activeChild]?.[t.id] || {};
      const val = rec[todayStr];
      const cur = val === undefined || val === null || val === '' ? 0 : (typeof val === 'number' ? val : (Array.isArray(val) ? val.length : 1));
      const isDone = isUnlimited ? (cur >= 1) : (cur >= target);

      if (isDone) completedCount++;
      earnedCoins += (hasTarget ? Math.min(cur, target) : cur) * (t.reward || 1);

      return {
        task: t,
        rec,
        cur,
        target,
        isDone,
        isUnlimited
      };
    });

    const total = list.length;
    const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    const isAllDone = total > 0 && completedCount === total;

    return {
      list,
      total,
      completedCount,
      remain: total - completedCount,
      pct,
      isAllDone,
      earnedCoins
    };
  }, [habitTasks, activeChild, checkins, todayStr]);

  // 2. 筛选过滤
  const filteredHabits = useMemo(() => {
    if (activeFilter === 'pending') {
      return stats.list.filter(item => !item.isDone);
    }
    if (activeFilter === 'done') {
      return stats.list.filter(item => item.isDone);
    }
    return stats.list;
  }, [stats.list, activeFilter]);

  // 判断某个预设是否已添加
  const existingNames = useMemo(() => {
    return new Set((habitTasks || []).map(t => t.name));
  }, [habitTasks]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()} 
        className="bg-slate-50 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden border border-emerald-100"
      >
        {/* 顶部元气看板 Banner */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-5 sm:p-6 shrink-0 shadow-md">
          {/* 背景微光与几何装饰 */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)] pointer-events-none" />

          {/* 顶栏控制条 */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/20">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg shadow-2xs">
                🌱
              </span>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2 leading-none">
                  <span>元气生活坊</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/25 text-emerald-100 border border-white/20">
                    习惯养成
                  </span>
                </h3>
                <p className="text-[11px] text-white/80 mt-1">
                  轻量微打卡 · 与沉重作业解耦 · 呵护健康生活规范
                </p>
              </div>
            </div>

            <button 
              type="button" 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* 元气能量与达标状态条 */}
          <div className="relative z-10 grid grid-cols-3 gap-3 pt-3.5 text-center">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 border border-white/15">
              <div className="text-[11px] text-emerald-100 font-medium">今日达标</div>
              <div className="text-xl sm:text-2xl font-black mt-0.5">
                {stats.completedCount} <span className="text-xs font-normal text-white/70">/ {stats.total} 项</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 border border-white/15">
              <div className="text-[11px] text-emerald-100 font-medium">元气完成率</div>
              <div className="text-xl sm:text-2xl font-black mt-0.5 text-amber-200">
                {stats.pct}%
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 border border-white/15">
              <div className="text-[11px] text-emerald-100 font-medium">习惯元宝</div>
              <div className="text-xl sm:text-2xl font-black mt-0.5 text-yellow-300 flex items-center justify-center gap-1">
                <Coins className="w-4 h-4" />
                +{stats.earnedCoins}
              </div>
            </div>
          </div>
        </div>

        {/* 快捷过滤 Tab 与操作入口 */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          {/* 左侧状态过滤按钮组 */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1">
            <button 
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeFilter === 'all' ? 'bg-white shadow-2xs text-emerald-700 font-extrabold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              全部 ({stats.total})
            </button>
            <button 
              type="button"
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeFilter === 'pending' ? 'bg-white shadow-2xs text-rose-600 font-extrabold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              待达标 ({stats.remain})
            </button>
            <button 
              type="button"
              onClick={() => setActiveFilter('done')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeFilter === 'done' ? 'bg-white shadow-2xs text-emerald-600 font-extrabold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              已达标 ({stats.completedCount})
            </button>
          </div>

          {/* 右侧：推荐习惯库切换与设置快捷键 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showPresets 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showPresets ? '返回我的习惯' : '推荐习惯库'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings?.();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="前往后台配置任务"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* 模式 A：展示推荐官方习惯库，支持一键快捷开启 */}
          {showPresets ? (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3 text-xs text-emerald-900 leading-relaxed flex items-start gap-2">
                <span className="text-base shrink-0">💡</span>
                <span>
                  以下为官方精心挑选的儿童生活习惯模板。点击【开启】即可自动配置为轻量习惯，无需手动录入！
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_HABITS.map(preset => {
                  const isAdded = existingNames.has(preset.name);
                  return (
                    <div 
                      key={preset.name}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-2.5 mb-2">
                        <span className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-lg shrink-0">
                          {preset.habitConfig.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-extrabold text-sm text-slate-800">{preset.name}</h5>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1 rounded">
                              +{preset.reward}🪙
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                            {preset.habitConfig.desc}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {preset.habitConfig.mode === 'count' ? `目标: 每日 ${preset.habitConfig.targetCount} ${preset.habitConfig.unit}` : '每日打卡 1 次'}
                        </span>
                        <button
                          type="button"
                          disabled={isAdded}
                          onClick={() => onAddPresetHabit?.(preset)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isAdded 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xs active:scale-95'
                          }`}
                        >
                          {isAdded ? '已在习惯列表中' : '+ 开启该习惯'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* 模式 B：展示当前孩子的实际习惯列表 */
            <div className="space-y-3">
              {filteredHabits.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center text-3xl">
                    🌱
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 text-base">暂无匹配的生活习惯</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      {stats.total === 0 
                        ? '还没有设置任何习惯任务哦，点击下方按钮或右上角推荐库开启！' 
                        : '当前筛选下没有相关习惯。'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPresets(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    ✨ 浏览官方推荐习惯库
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredHabits.map(({ task, rec }) => (
                    <HabitCapsule
                      key={task.id}
                      task={task}
                      taskRecord={rec}
                      todayStr={todayStr}
                      onCheckin={onCheckin}
                      compact={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部固定提示与操作条 */}
        <div className="p-3.5 bg-white border-t border-slate-200/80 shrink-0 flex items-center justify-between text-xs">
          <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>习惯轻巧不占地 · 与每日主学业看板彻底解耦</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings?.();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>自定义新习惯</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitPavilionModal;
