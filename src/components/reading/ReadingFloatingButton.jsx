import React, { useState } from 'react';
import { BookOpen } from '../icons';

/**
 * ReadingFloatingButton: 智能伴读悬浮按钮
 * 放置在左侧宠物上方 (bottom-36 left-3 lg:left-4)
 * - 环形进度圈 (SVG Progress Ring): 综合在读进度百分比
 * - 多书自适应模式 (1本极简书签 / 多本伴读小书案 Mini-Desk)
 * - 智能双态：未打卡快速登记 / 已打卡查看天工书阁
 * - 悬停展示当前书目与微进度，支持浮层内直接分书直达打卡
 */
export const ReadingFloatingButton = ({
  readingTasks = [],
  activeChild,
  checkins = {},
  todayStr,
  onOpenQuickCheckin,
  onOpenPavilion,
  readingHistory = []
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // 1. 结构化在读书目列表与打卡状态
  const activeBooks = (readingTasks || [])
    .filter(t => !t.earlyCompleted)
    .map(t => {
      const cfg = t.readingConfig || {};
      const cur = cfg.currentProgress || 0;
      const total = cfg.totalPages || cfg.totalChapters || cfg.dailyTargetMinutes || cfg.targetCount || 100;
      const pct = Math.min(100, Math.max(0, Math.round((cur / total) * 100)));
      const isChecked = !!(checkins[activeChild]?.[t.id]?.[todayStr]) || t.earlyCompleted;
      const unit = cfg.mode === 'chapters' ? '章' : cfg.mode === 'duration' ? '分' : cfg.mode === 'count' ? '本' : '页';
      const period = cfg.period === 'monthly' ? '月必读' : cfg.period === 'custom' ? '自选' : '周必读';
      const title = cfg.bookTitle || t.name || '必读书目';
      const cover = cfg.coverEmoji || '📖';

      return {
        task: t,
        cfg,
        cur,
        total,
        pct,
        isChecked,
        unit,
        period,
        title,
        cover
      };
    });

  // 未读优先排在前列
  const sortedBooks = [...activeBooks].sort((a, b) => {
    if (a.isChecked === b.isChecked) return 0;
    return a.isChecked ? 1 : -1;
  });

  const totalCount = activeBooks.length;
  const unreadBooks = sortedBooks.filter(b => !b.isChecked);
  const unreadCount = unreadBooks.length;
  const hasUnread = unreadCount > 0;
  const allCheckedToday = totalCount > 0 && !hasUnread;

  // 综合总进度百分比
  const overallProgressPct = totalCount > 0
    ? Math.round(activeBooks.reduce((sum, b) => sum + b.pct, 0) / totalCount)
    : 0;

  // 优先聚焦的书目 (未读优先，全读完则取第一本)
  const primaryBook = unreadBooks[0] || sortedBooks[0] || null;

  // 中心 Emoji 抉择：单本展示书名 Emoji，多本未读展示待读书 Emoji，全读完展示 📚
  const displayEmoji = totalCount <= 1
    ? (primaryBook?.cover || '📖')
    : (hasUnread ? (primaryBook?.cover || '📖') : '📚');

  // SVG 环形进度条参数
  const size = 56;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const displayProgressPct = totalCount === 1 ? (primaryBook?.pct || 0) : overallProgressPct;
  const strokeDashoffset = circumference - (displayProgressPct / 100) * circumference;

  // 点击悬浮球的主行为
  const handleMainClick = (e) => {
    e.stopPropagation();
    if (hasUnread && primaryBook) {
      // 未读优先快速记
      if (onOpenQuickCheckin) onOpenQuickCheckin(primaryBook.task);
    } else {
      // 全部已读或暂无在读书时，进入藏书阁
      if (onOpenPavilion) onOpenPavilion();
    }
  };

  return (
    <div 
      className="fixed bottom-36 left-3 lg:left-4 z-[90] flex items-center group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 悬浮主按钮 */}
      <button
        type="button"
        onClick={handleMainClick}
        className="relative w-11 h-11 lg:w-14 lg:h-14 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 border-2 border-white shadow-xl flex items-center justify-center transform transition-all duration-300 hover:scale-110 active:scale-95 npc-float"
        title={
          totalCount > 1
            ? `伴读小书案 (${totalCount}本在读，综合${displayProgressPct}%) · 点击${hasUnread ? `登记《${primaryBook.title}》` : '进入天工书阁'}`
            : primaryBook
            ? `${primaryBook.title} (${primaryBook.pct}%) · 点击${primaryBook.isChecked ? '进入书阁' : '快速打卡'}`
            : '天工书阁 · 阅读伴读'
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
          allCheckedToday ? (
            <span 
              className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-sm"
              title="今日所有在读书目已全部打卡"
            >
              ✓
            </span>
          ) : (
            <span 
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center"
              title={`今日有 ${unreadCount} 本书待打卡`}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white items-center justify-center text-[8px] font-black text-white">
                {unreadCount > 1 ? unreadCount : ''}
              </span>
            </span>
          )
        ) : (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-600 border border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
            +
          </span>
        )}

        {/* 底部微小数值/在读数量指示 */}
        {totalCount > 0 && (
          <div className="absolute -bottom-1.5 px-1 py-0.2 rounded-full bg-slate-900/85 text-amber-200 text-[8px] font-bold border border-white/40 shadow-xs pointer-events-none scale-90 whitespace-nowrap">
            {totalCount > 1 ? `${totalCount}本·${displayProgressPct}%` : `${displayProgressPct}%`}
          </div>
        )}
      </button>

      {/* 悬停书签 / 伴读小书案面板 (向右平滑滑出，带防脱落悬浮桥) */}
      <div 
        data-testid="reading-hover-popover"
        className={`absolute left-full pl-3 top-1/2 -translate-y-1/2 transition-all duration-300 z-[92] ${
          isHovered 
            ? 'opacity-100 translate-x-0 pointer-events-auto' 
            : 'opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-amber-200/90 text-xs">
          
          {/* CASE 0: 暂无在读书目 */}
          {totalCount === 0 && (
            <div className="w-56 text-center py-2 space-y-2">
              <div className="text-2xl">📚</div>
              <p className="font-bold text-slate-700">天工书阁 · 伴读殿堂</p>
              <p className="text-[11px] text-slate-400">暂无进行中的阅读必读书目</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenPavilion?.(); }}
                className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
              >
                进入书阁探索 ➔
              </button>
            </div>
          )}

          {/* CASE 1: 单本书在读 (极简精美书签) */}
          {totalCount === 1 && primaryBook && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                if (primaryBook.isChecked) {
                  onOpenPavilion?.();
                } else {
                  onOpenQuickCheckin?.(primaryBook.task);
                }
              }}
              className="w-56 space-y-1.5 cursor-pointer group/card hover:opacity-95"
            >
              <div className="flex items-center justify-between gap-2 font-bold text-slate-800">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-lg">{primaryBook.cover}</span>
                  <span className="truncate max-w-[110px]">{primaryBook.title}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold shrink-0">{primaryBook.period}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                  primaryBook.isChecked ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse'
                }`}>
                  {primaryBook.isChecked ? '今日已读' : '今日待读'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>进度: {primaryBook.cur} / {primaryBook.total} {primaryBook.unit}</span>
                <span className="font-black text-amber-600">{primaryBook.pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${primaryBook.pct}%` }} />
              </div>
              <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                <span>{primaryBook.isChecked ? '点击翻看「天工书阁」' : '点击快速记录今日阅读'}</span>
                <span className="text-amber-600 font-bold">➔</span>
              </div>
            </div>
          )}

          {/* CASE 2: 多本书并发研读 (伴读小书案 Mini-Desk) */}
          {totalCount >= 2 && (
            <div className="w-72 sm:w-80 space-y-2.5">
              {/* 顶栏：书案总览与待打卡统计 */}
              <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                <div className="flex items-center gap-1.5 font-black text-slate-800 text-xs">
                  <span>📚 伴读小书案</span>
                  <span className="text-[10px] font-bold text-slate-400">({totalCount}本研读中)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    hasUnread 
                      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {hasUnread ? `${unreadCount}本待打卡` : '全部已读 ✓'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">综合 {overallProgressPct}%</span>
                </div>
              </div>

              {/* 多书流：未读优先展示，支持单书直达打卡 */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-0.5">
                {sortedBooks.map(b => (
                  <div
                    key={b.task.id}
                    data-testid={`reading-book-card-${b.task.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsHovered(false);
                      onOpenQuickCheckin?.(b.task);
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      b.isChecked
                        ? 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100'
                        : 'bg-gradient-to-r from-amber-50/90 to-orange-50/70 border-amber-200 hover:border-amber-400 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xl shrink-0 p-1 bg-white rounded-lg shadow-2xs border border-amber-100">{b.cover}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-800 truncate">{b.title}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100/90 text-amber-800 font-bold shrink-0">{b.period}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-16 h-1.5 bg-slate-200/80 rounded-full overflow-hidden shrink-0">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${b.pct}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500 tabular-nums truncate">
                            {b.cur}/{b.total} {b.unit} ({b.pct}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 单书直达打卡胶囊 */}
                    <button
                      type="button"
                      className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                        b.isChecked
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs hover:brightness-105'
                      }`}
                    >
                      {b.isChecked ? '已读 ✓' : '打卡 ⚡'}
                    </button>
                  </div>
                ))}
              </div>

              {/* 底栏快速导航 */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsHovered(false);
                  onOpenPavilion?.();
                }}
                className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
              >
                <span>💡 点击任意书目直达登记</span>
                <span className="flex items-center gap-0.5">翻看天工书阁藏书楼 ➔</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReadingFloatingButton;
