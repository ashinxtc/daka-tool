import React from 'react';
import { XIcon, Coins, Sparkles, BookOpen, Trophy, TrendingUp, CalendarIcon } from '../icons.jsx';
import { getLevelInfo } from '../../utils/levels.js';
import { RANDOM_EVENTS } from '../../data/randomEvents.js';

// ===== 纵向居中时间轴组件（轴线居中，卡片左右交替）=====
export const VerticalTimeline = ({ items, renderCard, renderDot, emptyIcon, emptyText }) => {
    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-gray-400 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex items-center justify-center text-3xl shadow-inner">
                    {emptyIcon || '💭'}
                </div>
                <div className="text-sm font-bold text-gray-600">{emptyText || '暂无大事纪记录'}</div>
            </div>
        );
    }

    return (
        <div className="py-6 px-3 sm:px-6 relative">
            {/* 居中贯穿时间竖轴 */}
            <div 
                className="absolute left-1/2 top-6 bottom-8 w-[2px] -translate-x-1/2 pointer-events-none z-0"
                style={{
                    background: 'linear-gradient(to bottom, transparent, #cbd5e1 5%, #cbd5e1 95%, transparent)'
                }} 
            />

            {items.map((item, i) => {
                const d = renderDot(item, i);
                const isLeft = i % 2 === 0; // 偶数项左，奇数项右

                return (
                    <div 
                        key={item.id != null ? String(item.id) : String(i)}
                        className="flex items-start mb-6 relative group"
                    >
                        {/* ── 左半区 ── */}
                        <div className="flex-1 pr-4 sm:pr-6 flex flex-col items-end">
                            {isLeft ? (
                                <div className="w-full">
                                    <div className="text-[11px] font-bold text-gray-400 text-right mb-1.5 font-mono tracking-tight flex items-center justify-end gap-1">
                                        <CalendarIcon className="w-3 h-3 text-gray-400" />
                                        <span>{item.date || ''}</span>
                                    </div>
                                    {renderCard(item, i)}
                                </div>
                            ) : (
                                <div className="min-h-[4px]" />
                            )}
                        </div>

                        {/* ── 中央节点 ── */}
                        <div className="w-8 shrink-0 flex justify-center pt-3.5 relative z-10">
                            {/* 横向指引线 */}
                            <div 
                                className="absolute top-[22px] h-[2px] transition-all"
                                style={{
                                    width: 16,
                                    background: d.color || '#94a3b8',
                                    ...(isLeft ? { right: '100%', marginRight: -2 } : { left: '100%', marginLeft: -2 })
                                }} 
                            />
                            {/* 发光中心圆点 */}
                            <div 
                                className="w-4 h-4 rounded-full shrink-0 border-[3px] border-white shadow-sm transition-transform group-hover:scale-125"
                                style={{
                                    background: d.color || '#94a3b8',
                                    boxShadow: `0 0 0 2px ${d.color || '#94a3b8'}55, 0 2px 8px ${d.color || '#94a3b8'}44`
                                }} 
                            />
                        </div>

                        {/* ── 右半区 ── */}
                        <div className="flex-1 pl-4 sm:pr-6">
                            {!isLeft ? (
                                <div>
                                    <div className="text-[11px] font-bold text-gray-400 mb-1.5 font-mono tracking-tight flex items-center gap-1">
                                        <CalendarIcon className="w-3 h-3 text-gray-400" />
                                        <span>{item.date || ''}</span>
                                    </div>
                                    {renderCard(item, i)}
                                </div>
                            ) : (
                                <div className="min-h-[4px]" />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ===== 历史事件时间轴卡片 =====
export const HistTimelineCard = ({ item, es, triggered }) => {
    const seqNum = (item?.id || '').replace(/hist_/, '');
    const safeTitle = (item?.title || '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
    const safeEra = (item?.era || '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
    const imgSrc = `img/historyevents/${seqNum}_${safeEra}_${safeTitle}.png`;
    const [imgExists, setImgExists] = React.useState(null);
    
    React.useEffect(() => {
        if (!triggered) {
            setImgExists(false);
            return;
        }
        const img = new Image();
        img.onload = () => setImgExists(true);
        img.onerror = () => setImgExists(false);
        img.src = imgSrc;
    }, [triggered, imgSrc]);
    
    return (
        <div 
            className="rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border group"
            style={{ 
                background: es.cardBg || '#ffffff', 
                borderColor: triggered ? es.cardBd : '#e5e7eb', 
                opacity: triggered ? 1 : 0.75 
            }}
        >
            <div className="flex items-center justify-between gap-2 mb-2">
                <span 
                    className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border border-black/5" 
                    style={{ background: es.badgeBg, color: es.badgeTxt }}
                >
                    {item.era}
                </span>
                {triggered ? (
                    <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ 已亲历见证
                    </span>
                ) : (
                    <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded-full">
                        待探索机缘
                    </span>
                )}
            </div>

            <div className="text-sm font-black leading-snug text-gray-900 group-hover:text-amber-800 transition-colors mb-1">
                {item.title}
            </div>

            {item.time && (
                <div className="text-[11px] text-gray-500 font-mono mb-2">
                    {item.time}
                </div>
            )}

            {/* 仅已亲历且图片存在时显示历史事件图片 */}
            {triggered && imgExists && (
                <div className="mb-2.5 rounded-xl overflow-hidden shadow-xs border border-gray-100">
                    <img
                        src={imgSrc}
                        alt={item.title}
                        className="w-full aspect-square block object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}

            {item.desc && (
                <div 
                    className="text-xs text-gray-700 leading-relaxed mb-2.5 p-2.5 rounded-xl bg-black/4 border-l-2 italic" 
                    style={{ borderColor: es.cardBd }}
                >
                    {item.desc}
                </div>
            )}

            {(item.rewards || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100">
                    {(item.rewards || []).map((r, ri) => (
                        <span 
                            key={ri} 
                            className={`inline-flex items-center gap-1 text-[11px] font-bold py-0.5 px-2.5 rounded-full ${
                                r.type === 'gold' 
                                    ? 'bg-amber-100/80 text-amber-800 border border-amber-200' 
                                    : 'bg-violet-100/80 text-indigo-700 border border-violet-200'
                            }`}
                        >
                            <span>{r.value > 0 ? '+' : ''}{r.value}</span>
                            {r.type === 'gold' ? (
                                <Coins className="w-3 h-3 text-amber-600" />
                            ) : (
                                <span>⭐</span>
                            )}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

// ===== 大事纪 Modal（时空大事纪 · 岁月长卷与文明编年史）=====
export const MilestonesModal = ({ 
    show, 
    onClose, 
    milestones = [], 
    profiles = [], 
    theme, 
    activeChild, 
    historicalEventProgress = {}, 
    currentXP = 0 
}) => {
    const isTester = activeChild === '测试员';
    const [activeTab, setActiveTab] = React.useState('study');
    const [viewMember, setViewMember] = React.useState(activeChild);

    React.useEffect(() => {
        if (!isTester) setViewMember(activeChild);
    }, [activeChild, isTester]);

    // 实际查看的成员
    const member = isTester ? viewMember : activeChild;

    // 推算成员当前等级
    const getMemberLevel = (name) => {
        if (name === activeChild) return getLevelInfo(currentXP).level;
        const lvups = (milestones || []).filter(m => m.member === name && m.type === 'levelup');
        return lvups.length > 0 ? Math.max(...lvups.map(m => m.level || 1)) : 1;
    };

    // Tab1：学习大事纪（升级 + 成就 + 里程碑）
    const studyItems = React.useMemo(() =>
        (milestones || [])
            .filter(m => m.member === member && ['levelup', 'achievement', 'milestone'].includes(m.type))
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)),
        [milestones, member]
    );

    // Tab2：时空奇遇
    const adventureItems = React.useMemo(() =>
        (milestones || [])
            .filter(m => m.member === member && m.type === 'event' && m.icon !== '📅')
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)),
        [milestones, member]
    );

    // Tab3：历史大事纪（按等级解锁）
    const histEventsAll = (typeof HISTORICAL_EVENTS !== 'undefined') ? HISTORICAL_EVENTS : ((typeof window !== 'undefined' && window.HISTORICAL_EVENTS) ? window.HISTORICAL_EVENTS : []);
    const memberLevel = getMemberLevel(member);
    const triggeredSet = new Set((historicalEventProgress && historicalEventProgress[member]) || []);
    const levelsList = (typeof LEVELS !== 'undefined') ? LEVELS : ((typeof window !== 'undefined' && window.LEVELS) ? window.LEVELS : []);
    const unlockedHistItems = React.useMemo(() =>
        histEventsAll
            .filter(ev => {
                const minLvl = levelsList.find(l => l.name === ev.minLevelName);
                return !minLvl || memberLevel >= minLvl.level;
            })
            .map(ev => ({ ...ev, date: ev.time || ev.era })),
        [histEventsAll, memberLevel, levelsList]
    );

    if (!show) return null;

    // 纪元颜色映射
    const ERA_MAP = {
        '远古之路':              { dotC: '#92400e', lineC: '#fde68a', badgeBg: '#fef3c7', badgeTxt: '#78350f', cardBg: '#fffdf0', cardBd: '#fde68a' },
        '文明初曙':              { dotC: '#c2410c', lineC: '#fed7aa', badgeBg: '#ffedd5', badgeTxt: '#7c2d12', cardBg: '#fff7f0', cardBd: '#fed7aa' },
        '周·礼制与争鸣':        { dotC: '#065f46', lineC: '#a7f3d0', badgeBg: '#d1fae5', badgeTxt: '#064e3b', cardBg: '#f0fdf8', cardBd: '#a7f3d0' },
        '秦·铁血与一统':        { dotC: '#991b1b', lineC: '#fecaca', badgeBg: '#fee2e2', badgeTxt: '#7f1d1d', cardBg: '#fff8f8', cardBd: '#fecaca' },
        '汉·雄风与凿空西域':    { dotC: '#b45309', lineC: '#fde68a', badgeBg: '#fef9c3', badgeTxt: '#78350f', cardBg: '#fffbeb', cardBd: '#fef08a' },
        '魏晋隋唐·融合与登科': { dotC: '#5b21b6', lineC: '#ddd6fe', badgeBg: '#ede9fe', badgeTxt: '#3b0764', cardBg: '#faf8ff', cardBd: '#ddd6fe' },
        '五代·乱世更迭':        { dotC: '#334155', lineC: '#cbd5e1', badgeBg: '#e2e8f0', badgeTxt: '#0f172a', cardBg: '#f8fafc', cardBd: '#cbd5e1' },
        '宋·文道昌盛':          { dotC: '#0369a1', lineC: '#bae6fd', badgeBg: '#e0f2fe', badgeTxt: '#0c4a6e', cardBg: '#f0faff', cardBd: '#bae6fd' },
        '元·四海交融':          { dotC: '#854d0e', lineC: '#fef08a', badgeBg: '#fefce8', badgeTxt: '#713f12', cardBg: '#fefef0', cardBd: '#fef08a' },
        '明·日月重开':          { dotC: '#9f1239', lineC: '#fecdd3', badgeBg: '#ffe4e6', badgeTxt: '#881337', cardBg: '#fff8f9', cardBd: '#fecdd3' },
    };

    // 学习大事纪卡片
    const renderStudyCard = (item) => {
        const cfg = {
            levelup:     { bg: '#fffbeb', bd: '#fde68a', lbg: '#fef3c7', lc: '#92400e', tc: '#78350f', label: '🚀 境界跃升' },
            achievement: { bg: '#f5f3ff', bd: '#ddd6fe', lbg: '#ede9fe', lc: '#5b21b6', tc: '#3b0764', label: '🏆 成就解锁' },
            milestone:   { bg: '#eff6ff', bd: '#bfdbfe', lbg: '#dbeafe', lc: '#1e40af', tc: '#1e3a8a', label: '🎖️ 丰碑里程碑' },
        }[item.type] || { bg: '#f9fafb', bd: '#e5e7eb', lbg: '#f3f4f6', lc: '#374151', tc: '#111827', label: '记录' };

        return (
            <div 
                className="rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group"
                style={{ background: cfg.bg, border: `1.5px solid ${cfg.bd}` }}
            >
                <div 
                    className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2 border border-black/5" 
                    style={{ background: cfg.lbg, color: cfg.lc }}
                >
                    {cfg.label}
                </div>
                <div className="text-sm font-black leading-snug mb-1" style={{ color: cfg.tc }}>
                    {item.title}
                </div>
                {item.description && (
                    <div className="text-xs text-gray-600 leading-relaxed">
                        {item.description}
                    </div>
                )}
            </div>
        );
    };

    const renderStudyDot = (item) => ({
        levelup:     { color: '#f59e0b', lineColor: '#fde68a' },
        achievement: { color: '#8b5cf6', lineColor: '#ddd6fe' },
        milestone:   { color: '#2563eb', lineColor: '#bfdbfe' },
    }[item.type] || { color: '#6b7280', lineColor: '#e5e7eb' });

    // 时空奇遇卡片
    const renderAdventureCard = (item) => {
        const parts = (item.id || '').split('-');
        const eventId = parts.length >= 3 ? parts[1] : '';
        const randEvent = (typeof RANDOM_EVENTS !== 'undefined') ? RANDOM_EVENTS.find(e => e.id === eventId) : null;
        const eventDesc = randEvent ? randEvent.desc : null;

        return (
            <div className="rounded-2xl p-4 shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-purple-50/70 via-fuchsia-50/50 to-indigo-50/60 border border-purple-200">
                <div className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2 bg-purple-100 text-purple-800 border border-purple-200">
                    ✨ 时空奇遇
                </div>
                <div className="text-sm font-black leading-snug text-purple-950 mb-1.5">
                    {(item.title || '').replace(/^时空奇遇：/, '')}
                </div>
                {eventDesc && (
                    <div className="text-xs leading-relaxed mb-2 p-2.5 rounded-xl border-l-2 border-purple-400 bg-white/70 text-purple-800 italic">
                        {eventDesc}
                    </div>
                )}
                {item.description && (
                    <div className="text-[11px] text-purple-700 font-bold flex items-center gap-1 pt-1 border-t border-purple-100">
                        <span className="opacity-70">机缘犒赏:</span>
                        <span>{item.description}</span>
                    </div>
                )}
            </div>
        );
    };

    const renderAdventureDot = () => ({ color: '#a855f7', lineColor: '#e9d5ff' });

    const renderHistCard = (item) => {
        const es = ERA_MAP[item.era] || ERA_MAP['远古之路'];
        const triggered = triggeredSet.has(item.id);
        return <HistTimelineCard key={item.id} item={item} es={es} triggered={triggered} />;
    };

    const renderHistDot = (item) => {
        const es = ERA_MAP[item.era] || ERA_MAP['远古之路'];
        return { color: triggeredSet.has(item.id) ? es.dotC : '#d1d5db', lineColor: es.lineC };
    };

    const tabs = [
        { id: 'study',     icon: '📚', label: '学习大事纪', count: studyItems.length },
        { id: 'adventure', icon: '✨', label: '时空奇遇',   count: adventureItems.length },
        { id: 'history',   icon: '📜', label: '文明编年史', count: unlockedHistItems.length },
    ];

    return (
        <div 
            className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white/95 rounded-3xl w-full max-w-4xl h-[88vh] flex flex-col overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-white/80 animate-in zoom-in-95 duration-200">
                {/* 标头 */}
                <div className={`px-6 py-4 bg-gradient-to-r ${theme.gradient} text-white shrink-0 shadow-md relative z-10`}>
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-2xl shadow-inner border border-white/30">
                                📜
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-black tracking-wide drop-shadow-sm flex items-center gap-2">
                                    时空大事纪 · 岁月长卷
                                </h2>
                                <p className="text-xs text-white/90 mt-0.5">
                                    {isTester ? '🔍 测试员视角：可巡览所有成员成长长卷' : `✦ ${member} 的专属文明修行与历史记录`}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-all active:scale-95"
                            title="关闭"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* 测试员成员切换 */}
                    {isTester && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {profiles.map(p => (
                                <button 
                                    key={p.id} 
                                    onClick={() => setViewMember(p.name)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                        viewMember === p.name 
                                            ? 'bg-white text-gray-900 shadow-md scale-105' 
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    {p.icon} {p.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* 分页 Tabs */}
                    <div className="flex gap-2 items-center overflow-x-auto no-scrollbar pt-1">
                        {tabs.map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                                    activeTab === tab.id 
                                        ? 'bg-white text-gray-900 shadow-sm scale-105' 
                                        : 'bg-white/15 text-white/90 hover:bg-white/25'
                                }`}
                            >
                                <span className="text-base">{tab.icon}</span>
                                <span>{tab.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                    activeTab === tab.id ? 'bg-amber-100 text-amber-800' : 'bg-black/20 text-white'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 内容区 */}
                <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/70 to-white">
                    {/* Tab1: 学习大事纪 */}
                    {activeTab === 'study' && (
                        <div>
                            {studyItems.length > 0 && (
                                <div className="px-6 py-2.5 bg-gray-100/60 border-b border-gray-200/60 flex gap-4 text-xs text-gray-600 items-center flex-wrap shrink-0">
                                    <span className="flex items-center gap-1 font-bold">
                                        <span className="w-2 h-2 rounded-full bg-amber-500" /> 
                                        升级 <b className="text-amber-700">{studyItems.filter(m => m.type === 'levelup').length}</b> 次
                                    </span>
                                    <span className="flex items-center gap-1 font-bold">
                                        <span className="w-2 h-2 rounded-full bg-violet-600" /> 
                                        成就 <b className="text-violet-700">{studyItems.filter(m => m.type === 'achievement').length}</b> 个
                                    </span>
                                    <span className="flex items-center gap-1 font-bold">
                                        <span className="w-2 h-2 rounded-full bg-blue-600" /> 
                                        里程碑 <b className="text-blue-700">{studyItems.filter(m => m.type === 'milestone').length}</b> 个
                                    </span>
                                </div>
                            )}
                            <VerticalTimeline 
                                items={studyItems} 
                                renderCard={renderStudyCard} 
                                renderDot={renderStudyDot} 
                                emptyIcon="📚" 
                                emptyText="坚持打卡与晋升境界，你的修业足迹将在此长卷一一呈现！" 
                            />
                        </div>
                    )}

                    {/* Tab2: 时空奇遇 */}
                    {activeTab === 'adventure' && (
                        <div>
                            {adventureItems.length > 0 && (
                                <div className="px-6 py-2.5 bg-purple-50/60 border-b border-purple-100 text-xs text-purple-700 font-bold shrink-0">
                                    共亲历 <b>{adventureItems.length}</b> 段时空奇遇 · 历史从上至下按触发次序呈现
                                </div>
                            )}
                            <VerticalTimeline 
                                items={adventureItems} 
                                renderCard={renderAdventureCard} 
                                renderDot={renderAdventureDot} 
                                emptyIcon="✨" 
                                emptyText="在时光穿梭中触发的机缘故事，都将珍藏在这段奇遇长卷中！" 
                            />
                        </div>
                    )}

                    {/* Tab3: 历史大事纪 */}
                    {activeTab === 'history' && (
                        <div>
                            {unlockedHistItems.length > 0 && (
                                <div className="px-6 py-2.5 bg-amber-50/50 border-b border-amber-100/80 flex flex-wrap gap-3 items-center text-xs text-gray-700 shrink-0">
                                    <span className="font-bold text-gray-600">已解锁纪元:</span>
                                    {Object.entries(ERA_MAP).filter(([era]) => unlockedHistItems.some(e => e.era === era)).map(([era, s]) => (
                                        <span key={era} className="flex items-center gap-1 text-[11px] font-medium">
                                            <span className="w-2 h-2 rounded-full" style={{ background: s.dotC }} />
                                            {era}
                                            <span className="text-gray-400 text-[10px]">({unlockedHistItems.filter(e => e.era === era).length})</span>
                                        </span>
                                    ))}
                                    <span className="text-[11px] font-bold text-emerald-700 ml-auto bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                        已亲历见证: {unlockedHistItems.filter(e => triggeredSet.has(e.id)).length} / {unlockedHistItems.length}
                                    </span>
                                </div>
                            )}
                            <VerticalTimeline 
                                items={unlockedHistItems} 
                                renderCard={renderHistCard} 
                                renderDot={renderHistDot} 
                                emptyIcon="📜" 
                                emptyText="暂无已解锁的历史事件，继续提升修行境界以开启历史长河画卷！" 
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MilestonesModal;
