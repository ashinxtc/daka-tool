import React, { useState, useEffect, useMemo } from 'react';

/**
 * PetFloatingButton: 智能伴宠与历练探险悬浮按钮
 * 放置在左侧底部 (bottom-20 left-3 lg:left-4)，位于阅读悬浮球 (bottom-36) 下方
 * - 环形进度圈 (SVG Progress Ring): 正在探险时的实时进度圈，支持平滑动态走字
 * - 探险状态动态角标: 历练进行中 (🏃) / 探险完成待领取 (🎁) / 闲居小红点
 * - 伴宠小驿站悬停预览 (Hover Popover):
 *   - 探险中: 展示当前正在进行的探险领域、派出宠物、实时倒计时/进度条，可一键直达历练台
 *   - 闲居中: 展示当前宠物状态 (饱食度/清洁度/心情) 与快速出发历练入口
 */
export const PetFloatingButton = ({
  petAdventures = {},
  activeChild,
  petData = {},
  activePet = {},
  petCatalog = [],
  adventureRealms = [],
  petNotifDot = false,
  petNotifVisible = false,
  currentPetNotif = null,
  showPetNotifBubble,
  onOpenPet,
  handleCompleteAdventure,
  handleDismissAdventure,
  handleDismissAllAdventures,
  showToast
}) => {
  const [now, setNow] = useState(Date.now());
  const [isHovered, setIsHovered] = useState(false);

  // 1. 获取当前孩子的所有探险历练记录
  const childAdventures = useMemo(() => {
    return Array.isArray(petAdventures[activeChild]) ? petAdventures[activeChild] : [];
  }, [petAdventures, activeChild]);

  // 2. 筛选活跃中 (status === 'active') 或已完成待结算 (status === 'completed' && result) 的探险
  const activeAdvsRaw = useMemo(() => {
    return childAdventures.filter(a => a.status === 'active' || (a.status === 'completed' && a.result));
  }, [childAdventures]);

  const hasActiveAdventures = activeAdvsRaw.length > 0;

  // 3. 有探险进行时，每秒定时轮询驱动倒计时与环形进度条动画
  useEffect(() => {
    if (!hasActiveAdventures) return;
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [hasActiveAdventures]);

  // 4. 解析 activeAdventures 的展示数据
  const activeAdventures = useMemo(() => {
    return activeAdvsRaw.map(adv => {
      const realm = (adventureRealms || []).find(r => r.id === adv.realmId) || {
        id: adv.realmId,
        name: '秘境历练',
        icon: '🧭',
        duration: 3600000
      };
      const pet = petData[activeChild]?.[adv.petId] || {};
      const cat = (petCatalog || []).find(p => p.id === adv.petId) || {};
      const petName = pet.nickname || cat.name || adv.petId;
      const petIcon = cat.avatar || cat.icon || '🐾';

      const totalTime = Math.max(1000, adv.expectedEndTime - adv.startTime);
      const elapsed = Math.max(0, now - adv.startTime);
      const isFinished = adv.status === 'completed' || now >= adv.expectedEndTime;
      const pct = isFinished ? 100 : Math.min(100, Math.max(0, Math.floor((elapsed / totalTime) * 100)));

      // 剩余时间展示
      const remainingMs = Math.max(0, adv.expectedEndTime - now);
      const h = Math.floor(remainingMs / 3600000);
      const m = Math.floor((remainingMs % 3600000) / 60000);
      const s = Math.floor((remainingMs % 60000) / 1000);
      const remainingText = isFinished
        ? '探险完成 🎁'
        : (h > 0 ? `${h}h${m}m` : `${m}分${s}秒`);

      return {
        ...adv,
        realm,
        pet,
        cat,
        petName,
        petIcon,
        totalTime,
        elapsed,
        isFinished,
        pct,
        remainingMs,
        remainingText
      };
    });
  }, [activeAdvsRaw, adventureRealms, petData, petCatalog, activeChild, now]);

  // 已完成待领取的优先置顶
  const sortedAdventures = useMemo(() => {
    return [...activeAdventures].sort((a, b) => {
      if (a.isFinished === b.isFinished) return b.pct - a.pct;
      return a.isFinished ? -1 : 1;
    });
  }, [activeAdventures]);

  const activeCount = activeAdventures.length;
  const anyFinished = activeAdventures.some(a => a.isFinished);
  const overallProgressPct = activeCount > 0
    ? Math.round(activeAdventures.reduce((sum, a) => sum + a.pct, 0) / activeCount)
    : 0;

  const primaryAdv = sortedAdventures[0] || null;

  // 当前主宠信息（用于闲居展示）
  const activePetId = activePet[activeChild];
  const activePetObj = petData[activeChild]?.[activePetId] || {};
  const activePetCat = (petCatalog || []).find(p => p.id === activePetId) || {};
  const activePetName = activePetObj.nickname || activePetCat.name || '我的宠物';
  const activePetIcon = activePetCat.avatar || activePetCat.icon || '🐾';
  const fullness = activePetObj.stats?.fullness ?? 100;
  const cleanliness = activePetObj.stats?.cleanliness ?? 100;
  const mood = activePetObj.stats?.mood ?? 100;

  // 中心 Emoji 抉择：探险完成展示 🎁，历练中展示领域图标，闲居展示当前宠物
  const displayEmoji = useMemo(() => {
    if (activeCount > 0) {
      if (anyFinished) return '🎁';
      return primaryAdv?.realm?.icon || '🧭';
    }
    return activePetIcon;
  }, [activeCount, anyFinished, primaryAdv, activePetIcon]);

  // SVG 环形进度条参数
  const size = 56;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallProgressPct / 100) * circumference;

  // 领宝或查看历练交互
  const handleClaimOrInspectAdventure = (e, adv) => {
    e.stopPropagation();
    setIsHovered(false);
    if (adv?.isFinished) {
      if (adv.status === 'completed') {
        // 已生成战利品的探险：点击领宝直接收下销项，播放撒花并提示
        if (typeof window !== 'undefined' && window.confetti) {
          window.confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
        }
        if (typeof handleDismissAdventure === 'function') {
          handleDismissAdventure(activeChild, adv.id);
        }
        const pName = adv.petName || '宠物';
        const rName = adv.realm?.name || adv.realmName || '秘境';
        if (typeof showToast === 'function') {
          showToast(`🎁 已收下「${pName}」从「${rName}」带回的历练战利品！`);
        }
        return;
      } else if (adv.status === 'active' && Date.now() >= adv.expectedEndTime) {
        // 到期尚未结算的：先结算，然后收下销项
        if (typeof handleCompleteAdventure === 'function') {
          handleCompleteAdventure(activeChild, adv.id, false);
        }
        if (typeof handleDismissAdventure === 'function') {
          handleDismissAdventure(activeChild, adv.id);
        }
        if (typeof window !== 'undefined' && window.confetti) {
          window.confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
        }
        const pName = adv.petName || '宠物';
        const rName = adv.realm?.name || adv.realmName || '秘境';
        if (typeof showToast === 'function') {
          showToast(`🎁 已成功领取「${pName}」从「${rName}」带回的历练战利品！`);
        }
        return;
      }
    }
    if (onOpenPet) onOpenPet('adventure');
  };

  // 主按钮点击交互
  const handleMainClick = (e) => {
    e.stopPropagation();
    if (petNotifDot && showPetNotifBubble) {
      showPetNotifBubble();
    }
    if (anyFinished) {
      // 遍历所有已完成的探险，立即触发结算并提示
      sortedAdventures.forEach(adv => {
        if (adv.isFinished && handleCompleteAdventure) {
          handleCompleteAdventure(activeChild, adv.id, true);
        }
      });
      if (onOpenPet) onOpenPet('adventure');
    } else if (hasActiveAdventures) {
      // 有探险进行中，直达诸天历练 tab
      if (onOpenPet) onOpenPet('adventure');
    } else {
      // 闲居状态，进入洞天仙境主页
      if (onOpenPet) onOpenPet('home');
    }
  };

  return (
    <div 
      className="fixed bottom-20 left-3 lg:left-4 z-[90] flex items-center group select-none"
      onMouseEnter={() => {
        setIsHovered(true);
        if (petNotifDot && showPetNotifBubble) showPetNotifBubble();
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 悬浮主按钮 */}
      <button
        type="button"
        data-testid="pet-floating-btn"
        onClick={handleMainClick}
        className={`relative w-11 h-11 lg:w-14 lg:h-14 rounded-full border-2 border-white shadow-xl flex items-center justify-center transform transition-all duration-300 hover:scale-110 active:scale-95 npc-float ${
          anyFinished
            ? 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-400'
            : hasActiveAdventures
            ? 'bg-gradient-to-tr from-teal-500 via-cyan-500 to-emerald-400'
            : 'bg-gradient-to-tr from-teal-400 to-emerald-500'
        }`}
        title={
          hasActiveAdventures
            ? (anyFinished
                ? `探险完成 · 点击领取宝藏！`
                : `灵宠历练中 (${activeCount}只在外，综合${overallProgressPct}%) · 点击查看`)
            : `${activePetName} · 灵宠仙阁`
        }
      >
        {/* 外圈 SVG 环形进度条 (仅有历练任务时展示) */}
        {hasActiveAdventures && (
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
            {/* 动态进度弧线 */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={anyFinished ? "#34d399" : "#ffffff"}
              strokeWidth={strokeWidth + 0.5}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
        )}

        {/* 中心图标 */}
        <div className="relative z-10 flex items-center justify-center text-lg lg:text-2xl filter drop-shadow-sm">
          {displayEmoji}
        </div>

        {/* 右上角状态角标 */}
        {anyFinished ? (
          <span 
            className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-sm animate-bounce"
            title="探险完成，点击领奖！"
          >
            🎁
          </span>
        ) : hasActiveAdventures ? (
          <span 
            className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center"
            title={`有 ${activeCount} 只宠物探险中`}
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-600 border-2 border-white items-center justify-center text-[8px] font-black text-white">
              {activeCount > 1 ? activeCount : '🏃'}
            </span>
          </span>
        ) : petNotifDot ? (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border border-white rounded-full animate-ping" />
        ) : null}

        {/* 底部微小数值/在读数量指示 */}
        {hasActiveAdventures && (
          <div className="absolute -bottom-1.5 px-1.5 py-0.2 rounded-full bg-slate-900/85 text-teal-200 text-[8px] font-bold border border-white/40 shadow-xs pointer-events-none scale-90 whitespace-nowrap">
            {anyFinished ? '待结算 🎁' : (activeCount > 1 ? `${activeCount}只·${overallProgressPct}%` : `${overallProgressPct}%`)}
          </div>
        )}
      </button>

      {/* 悬停伴宠驿站 / 探险进行中预览面板 (向右平滑滑出，带防脱落悬浮桥) */}
      <div
        data-testid="pet-hover-popover"
        className={`absolute left-full pl-3 top-1/2 -translate-y-1/2 transition-all duration-300 z-[92] ${
          isHovered
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-teal-200/90 text-xs">
          {/* CASE 1: 有探险进行中 */}
          {hasActiveAdventures ? (
            <div className="w-72 sm:w-80 space-y-2.5">
              {/* 顶栏：探险总览与状态统计 */}
              <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                <div className="flex items-center gap-1.5 font-black text-slate-800 text-xs">
                  <span>🧭 伴宠探险台</span>
                  <span className="text-[10px] font-bold text-slate-400">({activeCount}只在外)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    anyFinished 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse' 
                      : 'bg-teal-100 text-teal-800 border border-teal-200'
                  }`}>
                    {anyFinished ? '可结算 🎁' : '历练中 ⏳'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">综合 {overallProgressPct}%</span>
                </div>
              </div>

              {/* 探险列表 */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-0.5">
                {sortedAdventures.map(adv => (
                  <div
                    key={adv.id}
                    data-testid={`pet-adventure-card-${adv.id}`}
                    onClick={(e) => handleClaimOrInspectAdventure(e, adv)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      adv.isFinished
                        ? 'bg-gradient-to-r from-emerald-50/90 to-teal-50/80 border-emerald-300 hover:border-emerald-400 shadow-2xs'
                        : 'bg-gradient-to-r from-teal-50/80 to-cyan-50/60 border-teal-200 hover:border-teal-400 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xl shrink-0 p-1 bg-white rounded-lg shadow-2xs border border-teal-100">
                        {adv.realm.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-800 truncate">{adv.realm.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-teal-100/90 text-teal-800 font-bold shrink-0">
                            {adv.petIcon} {adv.petName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-16 sm:w-20 h-1.5 bg-slate-200/80 rounded-full overflow-hidden shrink-0">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                adv.isFinished
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                                  : 'bg-gradient-to-r from-teal-500 to-cyan-500'
                              }`} 
                              style={{ width: `${adv.pct}%` }} 
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 tabular-nums truncate">
                            {adv.isFinished ? '历练归来 🎁' : `余 ${adv.remainingText}`} ({adv.pct}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 单项直达操作胶囊 */}
                    <button
                      type="button"
                      data-testid={`pet-adventure-btn-${adv.id}`}
                      onClick={(e) => handleClaimOrInspectAdventure(e, adv)}
                      className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                        adv.isFinished
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs hover:brightness-105 animate-pulse'
                          : 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                      }`}
                    >
                      {adv.isFinished ? '领宝 🎁' : '历练中 ➔'}
                    </button>
                  </div>
                ))}
              </div>

              {/* 底栏快速导航 */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsHovered(false);
                  onOpenPet?.('adventure');
                }}
                className="pt-1.5 border-t border-teal-100 flex items-center justify-between text-[10px] text-teal-600 font-bold cursor-pointer hover:text-teal-700"
              >
                <span>进入诸天历练台查看全貌与日志</span>
                <span>➔</span>
              </div>
            </div>
          ) : (
            /* CASE 2: 闲居无探险 */
            <div className="w-60 space-y-2">
              <div className="flex items-center justify-between border-b border-teal-100 pb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                  <span>🐾 灵宠仙阁</span>
                  <span className="text-[10px] text-slate-400 font-normal">闲居安歇中</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-bold">
                  休憩中 🏡
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-2 bg-gradient-to-r from-teal-50/60 to-emerald-50/40 rounded-xl border border-teal-100">
                <span className="text-2xl p-1 bg-white rounded-lg shadow-2xs border border-teal-100">{activePetIcon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-800 truncate">{activePetName}</div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span>🍖 饱食 {fullness}%</span>
                    <span>🛁 清洁 {cleanliness}%</span>
                    <span>❤️ 心情 {mood}%</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                {fullness < 50
                  ? '🍖 宠物有点饿了，先喂点食物再出发吧！'
                  : cleanliness < 50
                  ? '🛁 宠物身上脏兮兮的，先洗个澡吧！'
                  : '✨ 宠物状态绝佳，可以随时派遣出发历练！'}
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsHovered(false);
                  onOpenPet?.(fullness >= 50 && cleanliness >= 30 ? 'adventure' : 'home');
                }}
                className="w-full py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:brightness-105 text-white font-bold text-xs shadow-xs"
              >
                前往历练探险 / 伴宠互动 ➔
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 原有宠物气泡通知 (增加 w-max、min-w 与指示箭头，杜绝单列竖直折行) */}
      {petNotifVisible && currentPetNotif && !currentPetNotif.resolved && !isHovered && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onOpenPet?.('home');
          }}
          className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-max min-w-[150px] max-w-[210px] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl rounded-bl-sm shadow-xl text-xs font-bold text-slate-700 border border-teal-200/90 z-[95] animate-in fade-in slide-in-from-left-2 duration-300 cursor-pointer select-none"
        >
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-r-[6px] border-r-white border-b-[5px] border-b-transparent drop-shadow-2xs" />
          <p className="relative z-10 leading-relaxed break-words whitespace-normal font-bold">
            {currentPetNotif.message}
          </p>
        </div>
      )}
    </div>
  );
};
