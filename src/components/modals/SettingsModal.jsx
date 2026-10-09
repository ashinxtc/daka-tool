import React, { useState, useContext } from 'react';
import QRCode from 'qrcode';
import { PerformanceContext } from '../../context/PerformanceContext';
import { COLOR_PALETTES, BASE_THEME_IDS } from '../../data/themes';
import { getLocalDateKey, dateObjToLocalKey } from '../../utils/date';
import { getTaskTotalSessions } from '../../utils/checkin';
import { isIOSSafari, isPWAStandalone } from '../../utils/platform';
import { storage } from '../../utils/storage';
import { WECOM_API_URL, EXCHANGE_WORKER_URL } from '../../constants/api';
import {
    Beaker, CalendarIcon, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Coins, Gift, Key, Play, Plus,
    SettingsIcon, Shield, ShoppingBag, Skull, Target, Trash2,
    TrendingUp, Trophy, Upload, Users, XIcon
} from '../icons';
import { HABIT_ICON_PRESETS } from '../habits/index';

// 确保 AchievementSystem 兼容访问
const CURRICULUM_CONFIG = ((typeof window !== 'undefined' && window.AchievementSystem) ? window.AchievementSystem.CURRICULUM_CONFIG : ((typeof AchievementSystem !== 'undefined') ? AchievementSystem.CURRICULUM_CONFIG : {})) || {};

// 低性能模式与视觉保真配置组件
export const LowPerfToggle = () => {
    const { isLowPerf, perfMode, setPerfMode, autoDetected } = useContext(PerformanceContext);

    const MODES = [
        { id: 'auto', label: '智能自适应', sub: autoDetected ? '推荐 · 已检测硬件并启用轻量优化' : '推荐 · 当前硬件流畅无需减负' },
        { id: 'enabled', label: '始终开启', sub: '老旧平板 / 省电首选 · 降低渲染开销' },
        { id: 'disabled', label: '满血特效', sub: '强制启用全部 WebGL 与完整粒子' }
    ];

    return (
        <div className="space-y-3">
            {/* 模式分段选择器 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-amber-100/40 p-1.5 rounded-2xl border border-amber-200/60">
                {MODES.map(m => {
                    const active = perfMode === m.id;
                    return (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => setPerfMode(m.id)}
                            className={`p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                                active 
                                    ? 'bg-white shadow-xs border border-amber-300 ring-2 ring-amber-400/30' 
                                    : 'hover:bg-white/50 text-slate-600'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold ${active ? 'text-amber-950' : 'text-slate-700'}`}>
                                    {m.label}
                                </span>
                                {active && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                                {m.sub}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* 当前运行状态徽标与保真提示 */}
            <div className="bg-white/80 rounded-xl p-3 border border-amber-200/80 text-xs text-slate-700 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold flex items-center gap-1.5">
                        <span>当前渲染状态：</span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isLowPerf 
                                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                            {isLowPerf ? '⚡ 轻量保真模式生效中' : '✨ 满血完整特效渲染中'}
                        </span>
                    </span>
                    {perfMode === 'auto' && (
                        <span className="text-[10px] text-amber-700 font-medium">
                            (系统根据硬件智能决策)
                        </span>
                    )}
                </div>

                <div className="text-[11px] text-slate-500 space-y-1.5 pt-1.5 border-t border-slate-100 leading-relaxed">
                    <p className="flex items-start gap-1">
                        <span className="text-amber-500 shrink-0">🎨</span>
                        <span><strong>色彩保真杜绝黑白：</strong>低性能模式已接入标准兼容色彩引擎，老旧平板不再丢失按钮色彩或变黑白。</span>
                    </p>
                    <p className="flex items-start gap-1">
                        <span className="text-amber-500 shrink-0">🛡️</span>
                        <span><strong>装备背景高对比防穿透：</strong>首页在装备银河、极光、万象字阵等深邃特效背景时，任务卡片自动强化高对比底色，保证文字、目标与按钮 100% 清晰可见。</span>
                    </p>
                    <p className="flex items-start gap-1">
                        <span className="text-amber-500 shrink-0">🏮</span>
                        <span><strong>诗意氛围自适应：</strong>孔明灯、萤火虫、银杏雨等氛围特效自动调优为轻量粒子，兼顾老旧设备丝滑帧率与视觉美感。</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

// 统一标准风格开关组件 (iOS 质感双态胶囊开关)
export const ToggleSwitch = ({ checked, onChange, disabled = false, activeColor = 'bg-indigo-500', size = 'md', ariaLabel = '切换开关' }) => {
    const isSm = size === 'sm';
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={onChange}
            className={`relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300 ${
                disabled ? 'opacity-40 cursor-not-allowed' : ''
            } ${isSm ? 'w-9 h-5' : 'w-11 h-6'} ${checked ? activeColor : 'bg-slate-300'}`}
        >
            <span
                className={`pointer-events-none inline-block rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    isSm ? 'w-4 h-4' : 'w-5 h-5'
                } ${checked ? (isSm ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0.5'}`}
            />
        </button>
    );
};

// 辅助轻量 SVG 图标
const EyeIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const EyeOffIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
);
const CopyIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);

        const SettingsModal = ({ showSettings, setShowSettings, initialTab = 'parent', theme, globalDates, setGlobalDates, profiles, handleAddProfile, deleteProfile, handleAvatarUpload, updateProfileTheme, updateProfileGrade, curriculumProgress, handleVerifyCurriculum, wheelSettings, setWheelSettings, wheelConfig, setWheelConfig, setIsDemoWheel, setShowWheel, setWheelResult, activeChild, checkins, tasks, handleDeleteTask, updateTaskSetting, handleAddTask, evilWheelConfig, setEvilWheelConfig, evilAutoTrigger, setEvilAutoTrigger, evilTriggerConfig = {}, setEvilTriggerConfig = () => {}, onLaunchEvilWheel, onTestEvilWheel, settingsPassword, setSettingsPassword, authorizedParents = { pairToken: '', devices: [] }, setAuthorizedParents, isTestMode, setIsTestMode, setShowMilestones, setShowBackupPanel, handleSyncMilestones, handleDeduplicateAchievements, handleRecalculateLevelMilestones, onLaunchExtraWheel, weekendSettings, setWeekendSettings, handleTestSettlement, userCity, setUserCity, xpWheelConfig, setXpWheelConfig, onFixInventory, reportConfig, setReportConfig, stats = {}, homeworkExamConfig, setHomeworkExamConfig, clearNewTaskFlags, aiEnabled, setAiEnabled, deepseekApiKey, setDeepseekApiKey, aiPetEnabled, setAiPetEnabled, aiChatEnabled, setAiChatEnabled, aiDailyLimit, setAiDailyLimit, aiDailyUsage, syncCode, setSyncCode, syncLastTime, syncStatus, syncToCloud, syncFromCloud, triggerSyncUpload, wecomEnabled, setWecomEnabled, wecomWebhookKey, setWecomWebhookKey, wecomCorpId, setWecomCorpId, wecomAgentId, setWecomAgentId, wecomCallbackToken, setWecomCallbackToken, wecomCallbackAesKey, setWecomCallbackAesKey, wecomTestStatus, setWecomTestStatus, pushPermission, pushSubscribed, enablePushNotifications, testPushNotification }) => {
            const showToast = (typeof window !== "undefined" && window.showToast) || ((t, m) => alert(m));
            const [showCompletedSettings, setShowCompletedSettings] = React.useState(false);
            const [activeSettingsTab, setActiveSettingsTab] = React.useState(initialTab);
            const [prevShowSettings, setPrevShowSettings] = React.useState(showSettings);
            const [prevInitialTab, setPrevInitialTab] = React.useState(initialTab);
            // 任务分页：手风琴展开 + 搜索筛选 + 新增弹窗
            const [expandedTaskId, setExpandedTaskId] = React.useState(null);
            const [taskSearch, setTaskSearch] = React.useState('');
            const [taskTypeFilter, setTaskTypeFilter] = React.useState('');   // '' | 'core' | 'daily'
            const [taskFreqFilter, setTaskFreqFilter] = React.useState('');   // '' | 'count' | 'daily_must' | 'weekly_optional'
            const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
            const [advOpen, setAdvOpen] = React.useState({}); // 编辑卡高级设置折叠状态

            // 当弹窗打开瞬间或 initialTab 变化时，无缝同步当前激活分页与状态重置
            if (showSettings && !prevShowSettings) {
                setPrevShowSettings(true);
                setExpandedTaskId(null);
                if (initialTab && activeSettingsTab !== initialTab) {
                    setActiveSettingsTab(initialTab);
                }
            } else if (!showSettings && prevShowSettings) {
                setPrevShowSettings(false);
                setExpandedTaskId(null);
            }
            if (initialTab !== prevInitialTab) {
                setPrevInitialTab(initialTab);
                if (showSettings && activeSettingsTab !== initialTab) {
                    setActiveSettingsTab(initialTab);
                }
            }

            // 表单交互增强状态
            const [showPasswordEye, setShowPasswordEye] = React.useState(false);
            const [showApiKeyEye, setShowApiKeyEye] = React.useState(false);
            const [showWecomKeyEye, setShowWecomKeyEye] = React.useState(false);
            const [showWecomAesEye, setShowWecomAesEye] = React.useState(false);
            const [wecomAdvOpen, setWecomAdvOpen] = React.useState(false);
            const [wecomGuideOpen, setWecomGuideOpen] = React.useState(false);
            const [pushIosGuideOpen, setPushIosGuideOpen] = React.useState(false);
            const [syncCopied, setSyncCopied] = React.useState(false);

            // 家长手机看板绑定状态
            const [showParentQrModal, setShowParentQrModal] = React.useState(false);
            const [selectedParentRole, setSelectedParentRole] = React.useState('爸爸');
            const [qrDataUrl, setQrDataUrl] = React.useState('');
            const [qrCopied, setQrCopied] = React.useState(false);

            const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            const [lanHost, setLanHost] = React.useState(() => {
                try {
                    return localStorage.getItem('app_parent_qr_lan_host') || '192.168.2.18:3000';
                } catch (e) {
                    return '192.168.2.18:3000';
                }
            });
            const [networkMode, setNetworkMode] = React.useState(() => (isLocalhost ? 'lan' : 'current'));

            const getPairingUrl = React.useCallback(() => {
                const pairToken = authorizedParents?.pairToken || '';
                let baseOrigin = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : '';
                if (isLocalhost && networkMode === 'lan' && lanHost.trim()) {
                    const cleanHost = lanHost.trim().replace(/^https?:\/\//, '');
                    baseOrigin = `${window.location.protocol}//${cleanHost}`;
                } else if (!isLocalhost && baseOrigin.startsWith('http://')) {
                    baseOrigin = baseOrigin.replace('http://', 'https://');
                }
                return `${baseOrigin}/parent.html?code=${encodeURIComponent(syncCode || '')}&token=${encodeURIComponent(pairToken)}&role=${encodeURIComponent(selectedParentRole)}`;
            }, [authorizedParents, isLocalhost, networkMode, lanHost, syncCode, selectedParentRole]);

            // 动态生成配对二维码
            React.useEffect(() => {
                if (!showParentQrModal) return;
                const pairingUrl = getPairingUrl();
                QRCode.toDataURL(pairingUrl, { width: 280, margin: 2, color: { dark: '#1e1b4b', light: '#ffffff' } })
                    .then(url => setQrDataUrl(url))
                    .catch(err => console.error('QRCode generation failed:', err));
            }, [showParentQrModal, getPairingUrl]);

            // --- 标签页横向滚动与居中定位机制 (方案B: 数学精确几何居中) ---
            const tabContainerRef = React.useRef(null);
            const [canScrollLeft, setCanScrollLeft] = React.useState(false);
            const [canScrollRight, setCanScrollRight] = React.useState(true);

            // 检查横向滚动边界，以动态决定左右箭头与边缘渐变遮罩状态
            const checkScrollBounds = React.useCallback(() => {
                const el = tabContainerRef.current;
                if (!el) return;
                const { scrollLeft, scrollWidth, clientWidth } = el;
                setCanScrollLeft(scrollLeft > 4);
                setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
            }, []);

            // 方案B：数学精确几何居中计算
            const scrollToTab = React.useCallback((tabId, smooth = true) => {
                const container = tabContainerRef.current;
                if (!container) return;
                const targetTab = container.querySelector(`[data-tab-id="${tabId}"]`);
                if (!targetTab) return;

                const containerRect = container.getBoundingClientRect();
                const tabRect = targetTab.getBoundingClientRect();

                // 绝对距离 = 当前 scrollLeft + tab 相对于容器视口的相对 left
                const currentScrollLeft = container.scrollLeft;
                const tabRelativeLeft = tabRect.left - containerRect.left;
                const targetScrollLeft = currentScrollLeft + tabRelativeLeft - (container.clientWidth / 2) + (targetTab.clientWidth / 2);

                const maxScrollLeft = container.scrollWidth - container.clientWidth;
                const boundedScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));

                container.scrollTo({
                    left: boundedScrollLeft,
                    behavior: smooth ? 'smooth' : 'auto'
                });
            }, []);

            // 左右翻动微滑按钮 (单次翻越约 55% 可视宽度)
            const handleScrollBy = React.useCallback((direction) => {
                const container = tabContainerRef.current;
                if (!container) return;
                const shift = container.clientWidth * 0.55;
                container.scrollBy({
                    left: direction === 'left' ? -shift : shift,
                    behavior: 'smooth'
                });
            }, []);

            // 监听横向滚动与窗口尺寸变化
            React.useEffect(() => {
                const el = tabContainerRef.current;
                if (!el) return;
                el.addEventListener('scroll', checkScrollBounds, { passive: true });
                window.addEventListener('resize', checkScrollBounds);
                checkScrollBounds();
                return () => {
                    el.removeEventListener('scroll', checkScrollBounds);
                    window.removeEventListener('resize', checkScrollBounds);
                };
            }, [checkScrollBounds, showSettings]);

            // 弹窗打开或激活 Tab 变动时，平滑居中该 Tab
            React.useEffect(() => {
                if (showSettings) {
                    const timer = setTimeout(() => {
                        scrollToTab(activeSettingsTab, true);
                        checkScrollBounds();
                    }, 60);
                    return () => clearTimeout(timer);
                }
            }, [showSettings, activeSettingsTab, scrollToTab, checkScrollBounds]);

            const SETTINGS_TABS = [
                { id: 'parent', label: '家长控制', icon: '🛡️' },
                { id: 'members', label: '成员', icon: '👥' },
                { id: 'tasks', label: '任务', icon: '📋' },
                { id: 'wheelGold', label: '金转盘', icon: '🎁' },
                { id: 'wheelXp', label: 'XP转盘', icon: '⚡' },
                { id: 'evil', label: '惩罚', icon: '⚠️' },
                { id: 'homeworkExam', label: '作业与考试', icon: '📝' },
                { id: 'ai', label: 'AI助手', icon: '🤖' },
                { id: 'push', label: '通知', icon: '🔔' },
                { id: 'sync', label: '同步', icon: '☁️' },
                { id: 'wecom', label: '企业微信', icon: '💬' },
                { id: 'price', label: '汇率和物价', icon: '💱' },
                { id: 'data', label: '数据', icon: '💾' }
            ];
			if (!showSettings) return null;
            return (
                <div className="fixed inset-0 bg-slate-950/80 z-[85] flex items-center justify-center p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-300">
                  <div className="bg-white rounded-3xl w-full max-w-4xl h-[90vh] shadow-[0_25px_60px_-15px_rgba(99,102,241,0.3)] flex flex-col overflow-hidden border-2 border-indigo-400/40 relative animate-in zoom-in-95 duration-300">
                    {/* 头部 */}
                    <div className={`p-5 sm:p-6 shrink-0 border-b flex justify-between items-center bg-gradient-to-r ${theme.gradient} text-white shadow-md relative`}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow-inner shadow-white/30">
                          ⚙️
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 drop-shadow-sm">
                            天工司 · 核心治所与系统设定大典
                          </h2>
                          <p className="text-white/85 text-xs mt-0.5 font-medium">
                            乾坤律令 · 纪元参数 · 成员造册 · 功课督修 · 数据方舟
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => { clearNewTaskFlags(); setShowSettings(false); }}
                        className="p-2 bg-black/15 hover:bg-black/25 rounded-full transition-colors cursor-pointer text-white/90 hover:text-white"
                        title="关闭"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* 分页导航长卷 (带方案B数学平滑居中、高质感横向细滚动轴与左右滑动画卷箭头) */}
                    <div className="relative bg-slate-100/90 border-b border-slate-200/80 px-2 sm:px-3 py-1.5 flex items-center shrink-0">
                        {/* 左侧平滑微滑按钮 */}
                        <button
                            type="button"
                            onClick={() => handleScrollBy('left')}
                            disabled={!canScrollLeft}
                            className={`p-1.5 mr-1 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                                canScrollLeft 
                                    ? 'bg-white hover:bg-indigo-50 text-indigo-700 border-slate-300/80 shadow-xs hover:border-indigo-400 active:scale-95' 
                                    : 'bg-transparent text-slate-300 border-transparent cursor-default opacity-20'
                            }`}
                            title="向左滑动画卷"
                            aria-label="向左滑动画卷"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {/* 左侧渐变遮罩 (当可向左滑时显示) */}
                        {canScrollLeft && (
                            <div className="absolute left-10 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-100/95 to-transparent pointer-events-none z-10" />
                        )}

                        {/* 可滚动 Tab 列表 */}
                        <div 
                            ref={tabContainerRef}
                            className="flex-1 flex gap-1.5 overflow-x-auto py-1 pb-2 settings-tabs-scroll scroll-smooth min-h-[50px] items-center"
                        >
                            {SETTINGS_TABS.map(t => {
                                const isSel = activeSettingsTab === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        data-tab-id={t.id}
                                        onClick={() => {
                                            setActiveSettingsTab(t.id);
                                            scrollToTab(t.id, true);
                                        }}
                                        className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer shrink-0 select-none ${
                                            isSel
                                                ? 'bg-white text-indigo-950 shadow-sm ring-2 ring-indigo-500/80 border-b-2 border-indigo-600 scale-[1.02]'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                                        }`}
                                    >
                                        <span className="text-base">{t.icon}</span>
                                        <span>{t.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* 右侧渐变遮罩 (当可向右滑时显示) */}
                        {canScrollRight && (
                            <div className="absolute right-10 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-100/95 to-transparent pointer-events-none z-10" />
                        )}

                        {/* 右侧平滑微滑按钮 */}
                        <button
                            type="button"
                            onClick={() => handleScrollBy('right')}
                            disabled={!canScrollRight}
                            className={`p-1.5 ml-1 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                                canScrollRight 
                                    ? 'bg-white hover:bg-indigo-50 text-indigo-700 border-slate-300/80 shadow-xs hover:border-indigo-400 active:scale-95' 
                                    : 'bg-transparent text-slate-300 border-transparent cursor-default opacity-20'
                            }`}
                            title="向右滑动画卷"
                            aria-label="向右滑动画卷"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    {/* 内容区：仅渲染当前分页 */}
                    <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/70">
                        
                       {activeSettingsTab === 'parent' && (
                       <div className="space-y-4">
                            {/* 卡片 1: 安全凭证与环境 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-indigo-600" />
                                        家长控制与运行环境
                                    </h3>
                                    <span className="text-[11px] text-slate-400 font-medium">安全与基础配置</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* 密码设置 */}
                                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70 flex flex-col justify-between">
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 block mb-1">家长安全密码</label>
                                            <div className="relative flex items-center">
                                                <Key className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                                                <input 
                                                    type={showPasswordEye ? "text" : "password"} 
                                                    placeholder="留空则直接进入，无需密码"
                                                    value={settingsPassword} 
                                                    onChange={e => setSettingsPassword(e.target.value)} 
                                                    className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors" 
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordEye(!showPasswordEye)}
                                                    className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                                    title={showPasswordEye ? "隐藏密码" : "显示密码"}
                                                >
                                                    {showPasswordEye ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-2">设密码后，再次进入设置大典需校验此口令。</p>
                                    </div>

                                    {/* 测试模式 */}
                                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70 flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">测试模式 (满级神装)</div>
                                            <div className="text-xs text-slate-500 mt-0.5">开启后注入“测试员”全属性满级测试账号</div>
                                        </div>
                                        <ToggleSwitch 
                                            checked={isTestMode} 
                                            onChange={() => setIsTestMode(!isTestMode)} 
                                            activeColor="bg-emerald-500"
                                            ariaLabel="启用测试模式"
                                        />
                                    </div>
                                </div>

                                {/* 天气城市设置 */}
                                <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/50 p-3.5 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                                            <span>🌤️</span> 天气城市与定位
                                        </div>
                                        <div className="text-xs text-blue-600/80 mt-0.5">
                                            输入所在城市名（中文或拼音），留空则尝试浏览器自动定位。
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-64">
                                        <input 
                                            type="text" 
                                            placeholder="如: 北京 / Shanghai / 广州" 
                                            value={userCity}
                                            onChange={(e) => setUserCity(e.target.value)}
                                            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-blue-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 shadow-2xs"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* 卡片 1.5: 家长专属手机看板与设备绑定 */}
                            <section className="bg-white rounded-2xl border border-indigo-200/80 shadow-xs p-5 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-50 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-xl shadow-inner shrink-0">
                                            📱
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                                                家长专属手机看板与设备绑定
                                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                                                    移动端专属
                                                </span>
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                手机随时随地查打卡、发红包、赏转盘、施惩戒与甲骨留言。设备经授权方可操作。
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const url = getPairingUrl();
                                                window.open(url, '_blank', 'width=420,height=850');
                                            }}
                                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                            title="在电脑新窗口以手机尺寸免扫码预览家长看板"
                                        >
                                            <span>📱</span> 电脑窗口体验
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowParentQrModal(true)}
                                            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl transition-all shadow-xs shadow-indigo-600/25 flex items-center gap-1.5 cursor-pointer active:scale-95"
                                        >
                                            <span>📷</span> 扫码绑定手机
                                        </button>
                                    </div>
                                </div>

                                {/* 已授权家长手机设备列表 */}
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                        <span>已绑定的家长设备 ({authorizedParents?.devices?.length || 0})</span>
                                        <span className="text-[10px] text-slate-400 font-normal">未绑定的手机无法发起赏罚或改动数据</span>
                                    </div>

                                    {(!authorizedParents?.devices || authorizedParents.devices.length === 0) ? (
                                        <div className="bg-slate-50/70 p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 space-y-1">
                                            <div>暂无已绑定的家长手机。</div>
                                            <div className="text-[11px] text-indigo-600 font-bold cursor-pointer hover:underline" onClick={() => setShowParentQrModal(true)}>
                                                点击此处「扫码绑定手机」开启家长护航 ↗
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {authorizedParents.devices.map(dev => (
                                                <div key={dev.deviceId} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <span className="text-xl shrink-0">
                                                            {dev.role === '爸爸' ? '👑' : dev.role === '妈妈' ? '🌸' : '👴'}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                                                                <span>{dev.role}的设备</span>
                                                                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-1.5 py-0.5 rounded-md">
                                                                    {dev.deviceName || '手机设备'}
                                                                </span>
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                                                                <span>绑定于 {new Date(dev.boundAt || Date.now()).toLocaleDateString('zh-CN')}</span>
                                                                {dev.lastActive && (
                                                                    <span className="text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/50">
                                                                        活跃于 {new Date(dev.lastActive).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (window.confirm(`确定要解除【${dev.role}】的设备绑定吗？解绑后该手机将失去操作权限。`)) {
                                                                const updatedRevoked = {
                                                                    ...(authorizedParents?.revokedDevices || {}),
                                                                    [dev.deviceId]: Date.now()
                                                                };
                                                                const updated = {
                                                                    ...authorizedParents,
                                                                    devices: (authorizedParents?.devices || []).filter(d => d.deviceId !== dev.deviceId),
                                                                    revokedDevices: updatedRevoked
                                                                };
                                                                setAuthorizedParents(updated);
                                                                try {
                                                                    storage.setItem('app_authorized_parents_v1', JSON.stringify(updated));
                                                                    storage.markKeyVersion('app_authorized_parents_v1');
                                                                } catch (e) {}
                                                                if (typeof syncToCloud === 'function') {
                                                                    syncToCloud(true);
                                                                } else if (typeof triggerSyncUpload === 'function') {
                                                                    triggerSyncUpload();
                                                                }
                                                                showToast('info', `已成功解除【${dev.role}】设备的授权。`);
                                                            }
                                                        }}
                                                        className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors shrink-0 cursor-pointer"
                                                    >
                                                        解除绑定
                                                    </button>
                                                </div>
                                            ))}

                                            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-500 leading-relaxed space-y-1 mt-2">
                                                <div className="font-bold text-slate-600 flex items-center gap-1">
                                                    <span>💡</span> 关于同一部手机出现两条绑定的说明：
                                                </div>
                                                <div className="text-slate-400 text-[10px]">
                                                    手机操作系统的「微信内置浏览器」与「系统自带浏览器 (如 Safari / Chrome)」属于完全隔离的独立应用沙盒，存储彼此不互通。微信扫码与手机浏览器分别占用一个专属授权凭据（两处均可正常护航）。若您只想保留其中一个，随时点击对应项的【解除绑定】即可。
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* 卡片 2: 周末冲刺模式 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">📅</span>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-base">周末冲刺规则设定</h3>
                                            <p className="text-xs text-slate-400">周六与周日激励机制，达标自动发放额外丰厚嘉奖</p>
                                        </div>
                                    </div>
                                    <ToggleSwitch 
                                        checked={weekendSettings.enabled !== false} 
                                        onChange={() => setWeekendSettings({...weekendSettings, enabled: !(weekendSettings.enabled !== false)})} 
                                        activeColor="bg-indigo-600"
                                        ariaLabel="启用周末冲刺模式"
                                    />
                                </div>

                                {weekendSettings.enabled !== false && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* 核心达标率 */}
                                            <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-200/60 space-y-1.5">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-bold text-amber-900">⭐ 核心任务达标门槛</span>
                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-black rounded-md text-xs">
                                                        {weekendSettings.coreThreshold || 80}%
                                                    </span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="100" step="5"
                                                    value={weekendSettings.coreThreshold || 80} 
                                                    onChange={e => setWeekendSettings({...weekendSettings, coreThreshold: parseInt(e.target.value)})} 
                                                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                                />
                                            </div>

                                            {/* 日常达标率 */}
                                            <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-200/60 space-y-1.5">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-bold text-emerald-900">🍃 日常任务达标门槛</span>
                                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-md text-xs">
                                                        {weekendSettings.dailyThreshold || 50}%
                                                    </span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="100" step="5"
                                                    value={weekendSettings.dailyThreshold || 50} 
                                                    onChange={e => setWeekendSettings({...weekendSettings, dailyThreshold: parseInt(e.target.value)})} 
                                                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                                />
                                            </div>

                                            {/* 完美周末奖励 */}
                                            <div>
                                                <label className="text-xs font-bold text-slate-700 block mb-1">🏆 完美周末通关大奖 (金元宝)</label>
                                                <div className="relative flex items-center">
                                                    <Coins className="w-4 h-4 text-amber-500 absolute left-3 pointer-events-none" />
                                                    <input 
                                                        type="number" min="0" 
                                                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" 
                                                        value={weekendSettings.perfectReward ?? 100} 
                                                        onChange={e => setWeekendSettings({...weekendSettings, perfectReward: Math.max(0, parseInt(e.target.value, 10) || 0)})} 
                                                    />
                                                </div>
                                            </div>

                                            {/* 达标周末奖励 */}
                                            <div>
                                                <label className="text-xs font-bold text-slate-700 block mb-1">🎉 达标周末基础嘉奖 (金元宝)</label>
                                                <div className="relative flex items-center">
                                                    <Coins className="w-4 h-4 text-amber-500 absolute left-3 pointer-events-none" />
                                                    <input 
                                                        type="number" min="0" 
                                                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" 
                                                        value={weekendSettings.passReward ?? 60} 
                                                        onChange={e => setWeekendSettings({...weekendSettings, passReward: Math.max(0, parseInt(e.target.value, 10) || 0)})} 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 监护人豁免卡与结算 */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🛡️</span>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800">监护人豁免锦囊卡</div>
                                                    <div className="text-xs text-slate-500">
                                                        当前结存：<span className="font-bold text-indigo-600">{weekendSettings.guardianPassCount || 0}</span> 张 · 特殊请假或特殊事由豁免打卡
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleTestSettlement && handleTestSettlement()}
                                                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-2xs active:scale-95"
                                                >
                                                    模拟结算
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setWeekendSettings(prev => ({...prev, guardianPassCount: (prev.guardianPassCount || 0) + 1}))}
                                                    className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-2xs active:scale-95"
                                                >
                                                    + 赐予一张
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </section>

                            {/* 卡片 3: 全局打卡周期配置 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-5 h-5 text-indigo-600" />
                                        <h3 className="font-bold text-slate-800 text-base">全局修行打卡纪元周期</h3>
                                    </div>
                                    {globalDates.start && globalDates.end && (
                                        <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-full">
                                            历时 {Math.max(1, Math.round((new Date(globalDates.end) - new Date(globalDates.start)) / 86400000) + 1)} 天
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 block mb-1">纪元开启日期 (起始)</label>
                                        <input 
                                            type="date" 
                                            value={globalDates.start} 
                                            onChange={e => setGlobalDates({...globalDates, start: e.target.value})} 
                                            className="w-full p-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 block mb-1">纪元圆满日期 (结束)</label>
                                        <input 
                                            type="date" 
                                            value={globalDates.end} 
                                            onChange={e => setGlobalDates({...globalDates, end: e.target.value})} 
                                            className="w-full p-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" 
                                        />
                                    </div>
                                </div>
                            </section>
                       </div>
                       )}

                       {activeSettingsTab === 'homeworkExam' && homeworkExamConfig && setHomeworkExamConfig && (
                       <div className="space-y-4">
                            {/* 介绍顶栏 */}
                            <section className="bg-gradient-to-r from-amber-50 to-orange-50/70 p-5 rounded-2xl border border-amber-200/80 shadow-xs">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-xl shadow-inner">
                                        📝
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-amber-900 text-base">作业修习与大考成绩律令</h3>
                                        <p className="text-xs text-amber-700/80">配置科目、细分作业、评分方式与奖励规则；孩子登记达标即可自动获赏金元宝。</p>
                                    </div>
                                </div>
                            </section>

                            {/* 模式选择 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <span>🎯</span> 评定模式标准
                                </h4>
                                <div className="grid grid-cols-2 gap-3 max-w-md bg-slate-100/80 p-1 rounded-xl">
                                    <button 
                                        type="button" 
                                        onClick={() => setHomeworkExamConfig(c => ({ ...c, homeworkGradingMode: 'score' }))} 
                                        className={`py-2 rounded-lg text-xs font-bold transition-all ${
                                            homeworkExamConfig.homeworkGradingMode === 'score' 
                                                ? 'bg-white text-amber-700 shadow-xs ring-1 ring-amber-400/30' 
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        按分值 (0 - 100 分)
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setHomeworkExamConfig(c => ({ ...c, homeworkGradingMode: 'grade' }))} 
                                        className={`py-2 rounded-lg text-xs font-bold transition-all ${
                                            homeworkExamConfig.homeworkGradingMode === 'grade' 
                                                ? 'bg-white text-amber-700 shadow-xs ring-1 ring-amber-400/30' 
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        按等级 (A+、A、B…)
                                    </button>
                                </div>
                            </section>

                            {/* 科目与作业项目库 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                            <span>📚</span> 修习科目与作业名称册
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-0.5">为各学科添加日常作业、练习册等登记项</p>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setHomeworkExamConfig(c => ({ ...c, homeworkSubjects: [...(c.homeworkSubjects || []), { id: 'sub_' + Date.now(), name: '新科目' }], homeworkItems: { ...c.homeworkItems } }))} 
                                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors active:scale-95 flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> 添加科目
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {(homeworkExamConfig.homeworkSubjects || []).map(sub => (
                                        <div key={sub.id} className="rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/50 space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <input 
                                                    type="text" 
                                                    value={sub.name} 
                                                    onChange={e => setHomeworkExamConfig(c => ({ ...c, homeworkSubjects: c.homeworkSubjects.map(s => s.id === sub.id ? { ...s, name: e.target.value } : s) }))} 
                                                    className="font-bold text-slate-800 text-sm px-2.5 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 w-32" 
                                                    placeholder="科目名" 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setHomeworkExamConfig(c => ({ ...c, homeworkSubjects: c.homeworkSubjects.filter(s => s.id !== sub.id), homeworkItems: { ...c.homeworkItems, [sub.id]: undefined } }))} 
                                                    className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                                >
                                                    删除科目
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                {((homeworkExamConfig.homeworkItems || {})[sub.id] || []).map(item => (
                                                    <span key={item.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 shadow-2xs">
                                                        <input 
                                                            type="text" 
                                                            value={item.name} 
                                                            onChange={e => setHomeworkExamConfig(c => ({ ...c, homeworkItems: { ...c.homeworkItems, [sub.id]: (c.homeworkItems[sub.id] || []).map(i => i.id === item.id ? { ...i, name: e.target.value } : i) } }))} 
                                                            className="w-20 border-0 p-0 text-slate-800 font-medium focus:outline-none bg-transparent" 
                                                        />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setHomeworkExamConfig(c => ({ ...c, homeworkItems: { ...c.homeworkItems, [sub.id]: (c.homeworkItems[sub.id] || []).filter(i => i.id !== item.id) } }))} 
                                                            className="text-slate-400 hover:text-red-500 font-bold ml-0.5"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                                <button 
                                                    type="button" 
                                                    onClick={() => setHomeworkExamConfig(c => ({ ...c, homeworkItems: { ...c.homeworkItems, [sub.id]: [...(c.homeworkItems[sub.id] || []), { id: 'hi_' + Date.now(), name: '新作业' }] } }))} 
                                                    className="px-2.5 py-1 rounded-lg border border-dashed border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 text-xs font-bold transition-colors"
                                                >
                                                    + 作业项目
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 作业奖励规则 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                            <span>🎁</span> 作业达标金元宝奖励策定
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-0.5">指定科目作业、达标标准与元宝奖励；系统取符合条件的最高嘉奖发放。</p>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => { 
                                            const subs = homeworkExamConfig.homeworkSubjects || []; 
                                            const sub = subs[0]; 
                                            const items = (homeworkExamConfig.homeworkItems || {})[sub?.id] || []; 
                                            const item = items[0]; 
                                            setHomeworkExamConfig(c => ({ ...c, homeworkRewards: [...(c.homeworkRewards || []), { subjectId: sub?.id || '', subjectName: sub?.name || '', homeworkId: item?.id || '', homeworkName: item?.name || '', type: homeworkExamConfig.homeworkGradingMode === 'score' ? 'score' : 'grade', minScore: homeworkExamConfig.homeworkGradingMode === 'score' ? 90 : undefined, grade: homeworkExamConfig.homeworkGradingMode === 'grade' ? 'A' : undefined, gold: 5 }] })); 
                                        }} 
                                        className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-bold transition-colors shadow-2xs active:scale-95"
                                    >
                                        + 添加作业规则
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {(homeworkExamConfig.homeworkRewards || []).map((r, idx) => {
                                        const subs = homeworkExamConfig.homeworkSubjects || [];
                                        const sid = r.subjectId || subs[0]?.id || '';
                                        const items = (homeworkExamConfig.homeworkItems || {})[sid] || [];
                                        const hid = r.homeworkId || items[0]?.id || '';
                                        return (
                                        <div key={idx} className="flex gap-2 items-center flex-wrap bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60 text-xs">
                                            <select 
                                                value={sid} 
                                                onChange={e => { 
                                                    const sid2 = e.target.value; 
                                                    const its = (homeworkExamConfig.homeworkItems || {})[sid2] || []; 
                                                    const subName = subs.find(s => s.id === sid2)?.name || ''; 
                                                    setHomeworkExamConfig(c => ({ ...c, homeworkRewards: c.homeworkRewards.map((x, i) => i === idx ? { ...x, subjectId: sid2, subjectName: subName, homeworkId: its[0]?.id || '', homeworkName: its[0]?.name || '' } : x) })); 
                                                }} 
                                                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold focus:outline-none min-w-[80px]"
                                            >
                                                {subs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            <select 
                                                value={hid} 
                                                onChange={e => { 
                                                    const it = items.find(i => i.id === e.target.value); 
                                                    setHomeworkExamConfig(c => ({ ...c, homeworkRewards: c.homeworkRewards.map((x, i) => i === idx ? { ...x, homeworkId: e.target.value, homeworkName: it?.name || '' } : x) })); 
                                                }} 
                                                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none min-w-[90px]"
                                            >
                                                {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                            </select>
                                            {homeworkExamConfig.homeworkGradingMode === 'score' ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-slate-400">达到</span>
                                                    <input 
                                                        type="number" min="0" max="100" 
                                                        value={r.minScore ?? ''} 
                                                        onChange={e => setHomeworkExamConfig(c => ({ ...c, homeworkRewards: c.homeworkRewards.map((x, i) => i === idx ? { ...x, type: 'score', minScore: parseInt(e.target.value, 10) || 0 } : x) }))} 
                                                        className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-800" 
                                                        placeholder="分" 
                                                    />
                                                    <span className="text-slate-500">分以上</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-slate-400">评级</span>
                                                    <select 
                                                        value={r.grade || ''} 
                                                        onChange={e => setHomeworkExamConfig(c => ({ ...c, homeworkRewards: c.homeworkRewards.map((x, i) => i === idx ? { ...x, type: 'grade', grade: e.target.value } : x) }))} 
                                                        className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-800"
                                                    >
                                                        {['A+','A','A-','B+','B','B-','C+','C','C-','D','F'].map(g => <option key={g} value={g}>{g}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 ml-auto">
                                                <span className="text-amber-600 font-bold">奖励</span>
                                                <input 
                                                    type="number" min="0" 
                                                    value={r.gold ?? 0} 
                                                    onChange={e => setHomeworkExamConfig(c => ({ ...c, homeworkRewards: c.homeworkRewards.map((x, i) => i === idx ? { ...x, gold: parseInt(e.target.value, 10) || 0 } : x) }))} 
                                                    className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold text-amber-600" 
                                                />
                                                <span className="text-slate-600 font-medium">金元宝</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setHomeworkExamConfig(c => ({ ...c, homeworkRewards: c.homeworkRewards.filter((_, i) => i !== idx) }))} 
                                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors ml-1"
                                                    title="删除此规则"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ); })}
                                </div>
                            </section>

                            {/* 考试类型与考试奖励规则 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                            <span>🏆</span> 试炼大考与考赏律令
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-0.5">支持期中、期末、单元测验等大考奖励机制</p>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setHomeworkExamConfig(c => ({ ...c, examRewards: [...(c.examRewards || []), { type: 'score', minScore: 90, gold: 10 }] }))} 
                                        className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-bold transition-colors shadow-2xs active:scale-95"
                                    >
                                        + 添加大考规则
                                    </button>
                                </div>

                                {/* 考试类型标签 */}
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1.5">已定义的大考类型</label>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {(homeworkExamConfig.examTypes || []).map(et => (
                                            <span key={et.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/90 rounded-lg border border-slate-200 text-xs text-slate-700">
                                                <input 
                                                    type="text" 
                                                    value={et.name} 
                                                    onChange={e => setHomeworkExamConfig(c => ({ ...c, examTypes: c.examTypes.map(t => t.id === et.id ? { ...t, name: e.target.value } : t) }))} 
                                                    className="w-20 border-0 p-0 bg-transparent text-slate-800 font-medium focus:outline-none" 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setHomeworkExamConfig(c => ({ ...c, examTypes: c.examTypes.filter(t => t.id !== et.id) }))} 
                                                    className="text-slate-400 hover:text-red-500 font-bold ml-0.5"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                        <button 
                                            type="button" 
                                            onClick={() => setHomeworkExamConfig(c => ({ ...c, examTypes: [...(c.examTypes || []), { id: 'et_' + Date.now(), name: '新考试' }] }))} 
                                            className="px-2.5 py-1 rounded-lg border border-dashed border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 text-xs font-bold transition-colors"
                                        >
                                            + 考试类型
                                        </button>
                                    </div>
                                </div>

                                {/* 大考达标奖励列表 */}
                                <div className="space-y-2 pt-2">
                                    <label className="text-xs font-bold text-slate-700 block mb-1">大考分数达标嘉奖阶梯</label>
                                    {(homeworkExamConfig.examRewards || []).map((r, idx) => (
                                        <div key={idx} className="flex gap-2 items-center flex-wrap bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60 text-xs">
                                            <span className="text-slate-500">大考卷面达</span>
                                            <input 
                                                type="number" min="0" max="100" 
                                                value={r.minScore ?? ''} 
                                                onChange={e => setHomeworkExamConfig(c => ({ ...c, examRewards: c.homeworkRewards ? c.examRewards.map((x, i) => i === idx ? { ...x, minScore: parseInt(e.target.value, 10) || 0 } : x) : c.examRewards.map((x, i) => i === idx ? { ...x, minScore: parseInt(e.target.value, 10) || 0 } : x) }))} 
                                                className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-800" 
                                                placeholder="分数" 
                                            />
                                            <span className="text-slate-500">分及以上</span>

                                            <div className="flex items-center gap-1 ml-auto">
                                                <span className="text-amber-600 font-bold">嘉奖</span>
                                                <input 
                                                    type="number" min="0" 
                                                    value={r.gold ?? 0} 
                                                    onChange={e => setHomeworkExamConfig(c => ({ ...c, examRewards: c.examRewards.map((x, i) => i === idx ? { ...x, gold: parseInt(e.target.value, 10) || 0 } : x) }))} 
                                                    className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold text-amber-600" 
                                                />
                                                <span className="text-slate-600 font-medium">金元宝</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setHomeworkExamConfig(c => ({ ...c, examRewards: c.examRewards.filter((_, i) => i !== idx) }))} 
                                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors ml-1"
                                                    title="删除此规则"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                       </div>
                       )}

                       {activeSettingsTab === 'ai' && (
                       <div className="space-y-4">
                            {/* 介绍顶栏 */}
                            <section className="bg-gradient-to-r from-cyan-50 to-sky-50/70 p-5 rounded-2xl border border-cyan-200/80 shadow-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-xl shadow-inner">
                                        🤖
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-cyan-950 text-base">DeepSeek AI 智能助手与灵宠大模型</h3>
                                        <p className="text-xs text-cyan-700/80">接入 DeepSeek 大模型，为孩子提供个性化灵宠对话、学习解惑与智能伴读。</p>
                                    </div>
                                </div>
                            </section>

                            {/* 总开关 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">AI 大模型总开关</div>
                                    <div className="text-xs text-slate-500 mt-0.5">关闭后所有 AI 功能自动回退为预设灵气对话</div>
                                </div>
                                <ToggleSwitch 
                                    checked={aiEnabled} 
                                    onChange={() => setAiEnabled(!aiEnabled)} 
                                    activeColor="bg-cyan-500"
                                    ariaLabel="AI 功能总开关"
                                />
                            </section>

                            {/* API Key */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700">DeepSeek API Key 授权凭证据点</label>
                                    <a 
                                        href="https://platform.deepseek.com" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-cyan-600 hover:text-cyan-800 underline font-medium"
                                    >
                                        前往 DeepSeek 开放平台申请 ↗
                                    </a>
                                </div>
                                <div className="relative flex items-center">
                                    <input 
                                        type={showApiKeyEye ? "text" : "password"} 
                                        value={deepseekApiKey} 
                                        onChange={(e) => setDeepseekApiKey(e.target.value)} 
                                        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx" 
                                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-sm font-mono text-slate-800 outline-none focus:border-cyan-400 focus:bg-white transition-colors" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKeyEye(!showApiKeyEye)}
                                        className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                        title={showApiKeyEye ? "隐藏密钥" : "显示密钥"}
                                    >
                                        {showApiKeyEye ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-400">密钥仅安全保存在当前本地浏览器中，不会上传除大模型官方接口外的任何第三方服务器。</p>
                            </section>

                            {/* 每日限额 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">每日 AI 调用配额上限</div>
                                        <div className="text-xs text-slate-500 mt-0.5">控制开销与使用频率，防过度沉迷</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" min="1" max="200" 
                                            value={aiDailyLimit} 
                                            onChange={(e) => setAiDailyLimit(Math.max(1, Math.min(200, parseInt(e.target.value) || 50)))} 
                                            className="w-20 bg-slate-50 border border-slate-200 rounded-lg py-1.5 text-center text-sm font-bold text-cyan-700 outline-none focus:border-cyan-400" 
                                        />
                                        <span className="text-xs text-slate-500">次 / 天</span>
                                    </div>
                                </div>
                                {/* 进度条展示 */}
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1.5">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-slate-600">今日已消耗配额</span>
                                        <span className="text-cyan-700 font-bold">
                                            {aiDailyUsage.date === getLocalDateKey(0) ? aiDailyUsage.count : 0} / {aiDailyLimit} 次
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                                            style={{ 
                                                width: `${Math.min(100, Math.round(((aiDailyUsage.date === getLocalDateKey(0) ? aiDailyUsage.count : 0) / (aiDailyLimit || 1)) * 100))}%` 
                                            }}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* 场景子开关 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                                    🧩 独立场景功能配置
                                </h4>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                                            <span>🐾</span> 灵宠大模型修仙心语
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">宠物会根据打卡情况、冒险历练与天气自发对孩子生成趣味对话</div>
                                    </div>
                                    <ToggleSwitch 
                                        checked={aiPetEnabled} 
                                        onChange={() => setAiPetEnabled(!aiPetEnabled)} 
                                        activeColor="bg-cyan-500"
                                        ariaLabel="灵宠大模型对话"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <div>
                                        <div className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                                            <span>💬</span> 随身学业助教伴聊
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">在自习室中孩子可与 AI 仙官答疑解惑、研习古诗与思考方法</div>
                                    </div>
                                    <ToggleSwitch 
                                        checked={aiChatEnabled} 
                                        onChange={() => setAiChatEnabled(!aiChatEnabled)} 
                                        activeColor="bg-cyan-500"
                                        ariaLabel="学习助手伴聊"
                                    />
                                </div>
                            </section>

                            {/* 状态指示条 */}
                            {!deepseekApiKey && (
                                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                                    <span>⚠️</span>
                                    <span>尚未配置 API Key，当前所有对话回退为系统预设语录模式。</span>
                                </div>
                            )}
                            {deepseekApiKey && !aiEnabled && (
                                <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600">
                                    <span>💤</span>
                                    <span>AI 总开关当前处于休眠关闭状态，已配置密钥暂不调用。</span>
                                </div>
                            )}
                            {deepseekApiKey && aiEnabled && (
                                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                                    <span>✅</span>
                                    <span>DeepSeek 大模型已就绪，灵气充盈，各场景对话均处于智能激活态。</span>
                                </div>
                            )}
                       </div>
                       )}

                       {activeSettingsTab === 'push' && (
                       <div className="space-y-4">
                            {/* 介绍顶栏 */}
                            <section className="bg-gradient-to-r from-orange-50 to-amber-50/70 p-5 rounded-2xl border border-orange-200/80 shadow-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-xl shadow-inner">
                                        🔔
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-orange-950 text-base">打卡与修习提醒通知大典</h3>
                                        <p className="text-xs text-orange-700/80">开启后，浏览器在后台或离线时也将在固定时辰发送督学仙官传书提醒。</p>
                                    </div>
                                </div>
                            </section>

                            {/* 权限状态与开关卡片 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">浏览器推送通知权限</div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            {pushPermission === 'granted' && pushSubscribed ? '✅ 已成功订阅，每日修行定点提醒已就绪' :
                                             pushPermission === 'denied' ? '❌ 浏览器通知权限已被禁用，请在地址栏或系统设置中开启' :
                                             '⏳ 尚未开启通知订阅'}
                                        </div>
                                    </div>
                                    {pushPermission !== 'denied' && (
                                        <button 
                                            type="button"
                                            onClick={enablePushNotifications}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
                                                pushSubscribed 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                                            }`}
                                        >
                                            {pushSubscribed ? '订阅有效 ✅' : '开启推送通知 🔔'}
                                        </button>
                                    )}
                                </div>

                                {/* 拟物化通知效果预览卡片 */}
                                <div className="bg-slate-900/95 text-slate-100 p-4 rounded-2xl border border-slate-800 shadow-md space-y-1.5 relative overflow-hidden">
                                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-[10px] text-white font-black">🔔</span>
                                            <span className="font-bold text-slate-300">时空市集 · 督学仙官</span>
                                        </div>
                                        <span>刚才</span>
                                    </div>
                                    <div className="text-xs font-bold text-white pt-0.5">今日修行课业待完成</div>
                                    <div className="text-[11px] text-slate-300 leading-relaxed">
                                        少侠，今日还有 2 项修行任务尚未打卡（距离今日结算还有 3 小时），速速前往天工司圆满功课！
                                    </div>
                                    <div className="absolute right-3 bottom-2 text-[9px] text-slate-500">
                                        系统通知效果模拟
                                    </div>
                                </div>

                                {/* 权限拒绝时的排查指导 */}
                                {pushPermission === 'denied' && (
                                    <div className="text-xs text-amber-800 bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 space-y-2">
                                        <div className="font-bold flex items-center gap-1.5">
                                            <span>⚠️</span>
                                            <span>系统通知权限已被禁止</span>
                                        </div>
                                        {isIOSSafari() ? (
                                            <div className="space-y-1 text-[11px] text-amber-700">
                                                <p>📱 iPhone/iPad Safari 用户指南：</p>
                                                <ol className="list-decimal pl-4 space-y-0.5">
                                                    <li>打开 iOS「设置」→「通知」</li>
                                                    <li>找到「时空市集」并开启「允许通知」</li>
                                                    <li>若未找到，请先添加到主屏幕 PWA</li>
                                                </ol>
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-amber-700">请点击浏览器顶部地址栏左侧的 🔒 或 ⚙️ 图标，将「通知」权限修改为「允许」，并刷新页面。</p>
                                        )}
                                        <button 
                                            type="button" 
                                            onClick={enablePushNotifications} 
                                            className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            重试请求通知授权
                                        </button>
                                    </div>
                                )}

                                {/* iOS PWA 指导折叠卡片 */}
                                {isIOSSafari() && !isPWAStandalone() && (
                                    <div className="bg-amber-50/60 rounded-xl border border-amber-200/70 p-3 space-y-2">
                                        <div 
                                            onClick={() => setPushIosGuideOpen(!pushIosGuideOpen)}
                                            className="flex items-center justify-between cursor-pointer font-bold text-xs text-amber-900"
                                        >
                                            <span className="flex items-center gap-1.5">📱 iOS Safari 添加到主屏幕说明</span>
                                            <span>{pushIosGuideOpen ? '▲ 收起' : '▼ 展开'}</span>
                                        </div>
                                        {pushIosGuideOpen && (
                                            <p className="text-xs text-amber-700/90 leading-relaxed border-t border-amber-200/50 pt-2">
                                                由于苹果系统限制，iOS 设备需点击 Safari 底部「分享」按钮 → 选择「添加到主屏幕」，再从主屏幕图标启动本应用，方可启用后台 Web Push 推送。
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* 测试推送按钮 */}
                                {pushSubscribed && (
                                    <button 
                                        type="button"
                                        onClick={testPushNotification}
                                        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <span>📤</span> 发送即时测试通知
                                    </button>
                                )}
                            </section>

                            {/* 提醒机制说明卡片 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                                <h4 className="font-bold text-slate-800 text-sm">📅 推送时间与工作机制</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-center">
                                        <div className="text-xs font-bold text-slate-700">🌅 晨起早诵</div>
                                        <div className="text-xs text-orange-600 font-bold mt-0.5">每日 08:00</div>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-center">
                                        <div className="text-xs font-bold text-slate-700">🌤️ 午后督促</div>
                                        <div className="text-xs text-orange-600 font-bold mt-0.5">每日 16:00</div>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-center">
                                        <div className="text-xs font-bold text-slate-700">🌙 晚课结清</div>
                                        <div className="text-xs text-orange-600 font-bold mt-0.5">每日 20:00</div>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400 space-y-1 pt-1">
                                    <p>• 智能免打扰：仅在当天仍有未完成的必做或选做任务时触发，全部完成时不打扰。</p>
                                    <p>• 需配合下方「云同步码」方可在不同终端准确定位与同步。</p>
                                </div>
                            </section>
                       </div>
                       )}

                       {activeSettingsTab === 'sync' && (
                       <div className="space-y-4">
                            {/* 介绍顶栏 */}
                            <section className="bg-gradient-to-r from-sky-50 to-blue-50/70 p-5 rounded-2xl border border-sky-200/80 shadow-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-xl shadow-inner">
                                        ☁️
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sky-950 text-base">数据方舟 · 跨终端云同步</h3>
                                        <p className="text-xs text-sky-700/80">输入唯一的家庭同步码，多台手机、平板、电脑即可实时无缝互通全部修仙数据。</p>
                                    </div>
                                </div>
                            </section>

                            {/* 同步码输入与生成卡片 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3.5">
                                <label className="text-xs font-bold text-slate-700 block">家庭私密同步码 (Sync Code)</label>
                                <div className="flex gap-2 items-center">
                                    <input 
                                        type="text" 
                                        value={syncCode} 
                                        onChange={(e) => setSyncCode(e.target.value)} 
                                        placeholder="如: 小明成长记2025" 
                                        maxLength={32} 
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-sky-400 focus:bg-white transition-colors" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!syncCode) return;
                                            navigator.clipboard?.writeText(syncCode);
                                            setSyncCopied(true);
                                            setTimeout(() => setSyncCopied(false), 2000);
                                        }}
                                        disabled={!syncCode}
                                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                                        title="复制同步码"
                                    >
                                        <CopyIcon className="w-4 h-4" />
                                        <span>{syncCopied ? '已复制!' : '复制'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const randomCode = 'family_' + Math.random().toString(36).substring(2, 8);
                                            setSyncCode(randomCode);
                                        }}
                                        className="px-3 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold transition-colors"
                                        title="随机生成新同步码"
                                    >
                                        🎲 随机
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-400">支持 4-32 位任意字符。在您孩子或家长的所有手机和平板上填写完全一致的同步码即可完成联通。</p>

                                {/* 状态指示条 */}
                                {syncCode ? (
                                    <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                                        syncStatus === 'syncing' ? 'bg-sky-50 border-sky-200 text-sky-700' :
                                        syncStatus === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                        syncStatus === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                                        'bg-slate-50 border-slate-200 text-slate-600'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            <span>
                                                {syncStatus === 'syncing' ? '⏳' :
                                                 syncStatus === 'success' ? '✅' :
                                                 syncStatus === 'error' ? '❌' : '🟢'}
                                            </span>
                                            <span className="font-bold">
                                                {syncStatus === 'syncing' ? '正在与云端方舟双向同步中…' :
                                                 syncStatus === 'success' ? '云端最新数据已完美同步！' :
                                                 syncStatus === 'error' ? '同步连接异常，请检查网络或配置' :
                                                 '自动同步处于待命激活态'}
                                            </span>
                                        </div>
                                        {syncLastTime && (
                                            <span className="text-[10px] text-slate-400">
                                                上次：{new Date(syncLastTime).toLocaleTimeString('zh-CN')}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                                        <span>⚠️</span>
                                        <span>请输入或随机生成同步码，开启多端自动云备份与同步。</span>
                                    </div>
                                )}

                                {/* 手动操作按钮 */}
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <button 
                                        type="button"
                                        onClick={() => syncToCloud(true)} 
                                        disabled={!syncCode || syncStatus === 'syncing'}
                                        className="py-2.5 px-4 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                                    >
                                        <span>⬆️</span> 手动上传最新数据
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={syncFromCloud} 
                                        disabled={!syncCode || syncStatus === 'syncing'}
                                        className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                                    >
                                        <span>⬇️</span> 从云端拉取覆盖
                                    </button>
                                </div>
                            </section>
                       </div>
                       )}

                       {activeSettingsTab === 'wecom' && (
                       <div className="space-y-4">
                            {/* 介绍顶栏 */}
                            <section className="bg-gradient-to-r from-emerald-50 to-teal-50/70 p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-xl shadow-inner">
                                        💬
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-emerald-950 text-base">企业微信亲子互动与督学群推送</h3>
                                        <p className="text-xs text-emerald-700/80">将孩子的修仙成长喜讯、里程碑突破与打卡进度实时推送至家长企微群。</p>
                                    </div>
                                </div>
                            </section>

                            {/* 总开关 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">启用企业微信群消息推送</div>
                                    <div className="text-xs text-slate-500 mt-0.5">孩子完成核心大关或打卡时自动发送喜报战报</div>
                                </div>
                                <ToggleSwitch 
                                    checked={wecomEnabled} 
                                    onChange={() => setWecomEnabled(!wecomEnabled)} 
                                    activeColor="bg-emerald-500"
                                    ariaLabel="企业微信群推送开关"
                                />
                            </section>

                            {/* Webhook Key */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                                <label className="text-xs font-bold text-slate-700 block">企微群机器人 Webhook Key</label>
                                <div className="relative flex items-center">
                                    <input 
                                        type={showWecomKeyEye ? "text" : "password"} 
                                        value={wecomWebhookKey} 
                                        onChange={(e) => setWecomWebhookKey(e.target.value)} 
                                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 
                                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-sm font-mono text-slate-800 outline-none focus:border-emerald-400 focus:bg-white transition-colors" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowWecomKeyEye(!showWecomKeyEye)}
                                        className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                        title={showWecomKeyEye ? "隐藏密钥" : "显示密钥"}
                                    >
                                        {showWecomKeyEye ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-400">在企微家庭群 → 添加群机器人 → Webhook URL 中的 key 参数。</p>

                                {/* 测试连接按钮 */}
                                <button 
                                    type="button"
                                    onClick={async () => {
                                        setWecomTestStatus('testing');
                                        try {
                                            const resp = await fetch(`${WECOM_API_URL}/api/wecom/test`);
                                            const result = await resp.json();
                                            setWecomTestStatus(result.ok ? 'success' : 'error');
                                        } catch (e) {
                                            setWecomTestStatus('error');
                                        }
                                        setTimeout(() => setWecomTestStatus(''), 5000);
                                    }} 
                                    disabled={!wecomWebhookKey}
                                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                                >
                                    {wecomTestStatus === 'testing' ? '⏳ 正在向企微发送测试喜报...' : 
                                     wecomTestStatus === 'success' ? '✅ 测试消息推送成功，请查收企微群！' : 
                                     wecomTestStatus === 'error' ? '❌ 推送失败，请检查 Key 或网络状态' : 
                                     '🔗 发送一条测试喜报到企微群'}
                                </button>
                            </section>

                            {/* 自建应用高级配置折叠面板 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                                <button 
                                    type="button"
                                    onClick={() => setWecomAdvOpen(!wecomAdvOpen)}
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">🔧</span>
                                        <span className="text-xs font-bold text-slate-800">自建应用双向互动高级配置 (接收家长留言用)</span>
                                    </div>
                                    <span className="text-xs text-slate-400">{wecomAdvOpen ? '▲ 收起' : '▼ 展开'}</span>
                                </button>

                                {wecomAdvOpen && (
                                    <div className="p-4 pt-0 space-y-3 border-t border-slate-100 mt-1">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 block mb-1">CorpID (企业ID)</label>
                                                <input type="text" value={wecomCorpId} onChange={(e) => setWecomCorpId(e.target.value)} placeholder="wwxxxxxxxxxxxxxxxx" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono outline-none focus:border-emerald-400" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 block mb-1">AgentID (应用ID)</label>
                                                <input type="text" value={wecomAgentId} onChange={(e) => setWecomAgentId(e.target.value)} placeholder="1000002" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono outline-none focus:border-emerald-400" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 block mb-1">回调 Token</label>
                                                <input type="text" value={wecomCallbackToken} onChange={(e) => setWecomCallbackToken(e.target.value)} placeholder="接收消息设置中的 Token" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono outline-none focus:border-emerald-400" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 block mb-1">回调 EncodingAESKey</label>
                                                <div className="relative flex items-center">
                                                    <input type={showWecomAesEye ? "text" : "password"} value={wecomCallbackAesKey} onChange={(e) => setWecomCallbackAesKey(e.target.value)} placeholder="43 字符密钥" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-8 py-2 text-xs font-mono outline-none focus:border-emerald-400" />
                                                    <button type="button" onClick={() => setShowWecomAesEye(!showWecomAesEye)} className="absolute right-2 text-slate-400 hover:text-slate-600">
                                                        {showWecomAesEye ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                                            企微后台回调 URL 填写为：<span className="font-mono text-emerald-700 font-bold">{WECOM_API_URL}/api/wecom/callback</span>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* 配置教程折叠面板 */}
                            <section className="bg-emerald-50/50 rounded-2xl border border-emerald-200/70 p-4 space-y-2">
                                <div 
                                    onClick={() => setWecomGuideOpen(!wecomGuideOpen)}
                                    className="flex items-center justify-between cursor-pointer font-bold text-xs text-emerald-900"
                                >
                                    <span className="flex items-center gap-1.5">📖 四步快速配置指引</span>
                                    <span>{wecomGuideOpen ? '▲ 收起' : '▼ 展开'}</span>
                                </div>
                                {wecomGuideOpen && (
                                    <div className="text-xs text-emerald-800 space-y-2 pt-2 border-t border-emerald-200/60 leading-relaxed">
                                        <p><b>1. 创建家庭群</b>：在企业微信发起群聊并邀请家人加入。</p>
                                        <p><b>2. 添加群机器人</b>：群右上角「…」→ 群机器人 → 添加机器人 → 获取 Webhook Key 粘贴于上方。</p>
                                        <p><b>3. 双向互动（可选）</b>：如需从微信直接向应用留言鼓励，可在企微后台创建自建应用并开启消息接收。</p>
                                        <p><b>4. 自动绑定标识</b>：系统自动复用上方「云同步码」作为家庭唯一识别码。</p>
                                    </div>
                                )}
                            </section>
                       </div>
                       )}

                       {activeSettingsTab === 'price' && (
                       <div className="space-y-4">
                            {/* 介绍顶栏 */}
                            <section className="bg-gradient-to-r from-emerald-50 to-teal-50/70 p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-xl shadow-inner">
                                        💱
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-emerald-950 text-base">金元宝汇率与时空物价局</h3>
                                        <p className="text-xs text-emerald-700/80">掌管金元宝现实兑换基准与市集商品物价。融入真实宏观汇率与巨无霸指数教育模型。</p>
                                    </div>
                                </div>
                            </section>

                            {/* 基础汇率 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                            <Coins className="w-4 h-4 text-amber-500" /> 现实基准折算汇率
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-0.5">设定金元宝与现实人民币的基准比例，培养理性消费与财商认知</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 max-w-sm">
                                    <input 
                                        type="number" min="1" max="10000" step="1"
                                        defaultValue={(() => { try { const cents = parseFloat(storage.getItem('app_exchange_base_cents') || '1'); return Math.round(100 / cents); } catch(e) { return 100; } })()}
                                        onBlur={e => {
                                            const goldPerYuan = Math.max(1, parseInt(e.target.value) || 100);
                                            const centsPerGold = (100 / goldPerYuan).toFixed(4);
                                            storage.setItem('app_exchange_base_cents', centsPerGold);
                                            storage.markKeyVersion('app_exchange_base_cents');
                                            if (typeof window !== 'undefined' && window._triggerSync) window._triggerSync();
                                            e.target.value = goldPerYuan;
                                        }}
                                        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                                        className="w-24 text-center text-lg font-black text-amber-600 bg-white border border-amber-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-2xs"
                                    />
                                    <span className="text-sm font-bold text-slate-700">个金元宝 = 1.00 元人民币</span>
                                </div>
                                <p className="text-[11px] text-slate-400">默认设定：100 金元宝 = 1 元（即 1 金元宝 = 1 分钱）。修改后自动重算市集所有兑换比例。</p>
                            </section>

                            {/* 教育性波动设置 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                            <span>📊</span> 真实世界外汇波动教学放大器
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-0.5">真实世界汇率日波动仅约 0.1%，将其按倍率放大可让孩子直观感受市场波动。</p>
                                    </div>
                                </div>

                                <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="range" min="0" max="50" step="1"
                                            defaultValue={(() => { try { return JSON.parse(storage.getItem('app_exchange_volatility') || '{}').amplifier || 10; } catch(e) { return 10; } })()}
                                            onChange={e => {
                                                const val = parseInt(e.target.value);
                                                try {
                                                    const existing = JSON.parse(storage.getItem('app_exchange_volatility') || '{}');
                                                    existing.amplifier = val;
                                                    storage.setItem('app_exchange_volatility', JSON.stringify(existing));
                                                    storage.markKeyVersion('app_exchange_volatility');
                                                    if (typeof window !== 'undefined' && window._triggerSync) window._triggerSync();
                                                } catch(e) {}
                                            }}
                                            className="flex-1 h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        />
                                        <span className="text-base font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md min-w-[50px] text-center">
                                            {(() => { try { return JSON.parse(storage.getItem('app_exchange_volatility') || '{}').amplifier || 10; } catch(e) { return 10; } })()}x
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400">
                                        <span>1x (无放大/基准)</span>
                                        <span>25x (温和体验)</span>
                                        <span>50x (剧烈市场)</span>
                                    </div>
                                </div>
                            </section>

                            {/* 商品价格列表 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                                <div className="p-4 bg-slate-50/80 border-b border-slate-200/70 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                            <span>🧺</span> 现实生活代表商品物价篮子
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-0.5">根据巨无霸指数与 AI 物价分析同步真实消费购买力</p>
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-medium">点击直接修改价格</span>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {[
                                        { id: 'mxbc_lnm', icon: '🧃', name: '蜜雪冰城 冰鲜柠檬水', default: 4 },
                                        { id: 'bwcj_bcjx', icon: '🍵', name: '霸王茶姬 伯牙绝弦', default: 16 },
                                        { id: 'sbc_latte', icon: '☕', name: '星巴克 大杯经典拿铁', default: 30 },
                                        { id: 'mcd_bm', icon: '🍔', name: '麦当劳 巨无霸超值套餐', default: 26 },
                                        { id: 'coca_can', icon: '🥤', name: '可口可乐 摩登易拉罐装', default: 3.5 },
                                    ].map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{item.icon}</span>
                                                <span className="text-xs sm:text-sm font-bold text-slate-700">{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="number"
                                                    min="0.1"
                                                    step="0.5"
                                                    defaultValue={item.default}
                                                    className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-xs sm:text-sm text-center font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                                    onBlur={async (e) => {
                                                        const val = parseFloat(e.target.value);
                                                        if (val > 0) {
                                                            try {
                                                                await fetch(`${EXCHANGE_WORKER_URL}/api/price/update`, {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ itemId: item.id, newPrice: val })
                                                                });
                                                                showToast('success', `${item.name} 价格已更新为 ${val} 元`);
                                                            } catch (e) { showToast('error', '更新失败'); }
                                                        }
                                                    }}
                                                />
                                                <span className="text-xs text-slate-500 font-medium">元</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                                    <button 
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                const resp = await fetch(`${EXCHANGE_WORKER_URL}/api/price/init`, { method: 'POST' });
                                                const data = await resp.json();
                                                if (data.ok) showToast('success', '物价数据已通过 DeepSeek 重新核算');
                                                else showToast('error', '查询失败');
                                            } catch (e) { showToast('error', '网络错误'); }
                                        }} 
                                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 active:scale-95"
                                    >
                                        <span>🔍</span> 重新查询全国市价（DeepSeek）
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                const resp = await fetch(`${EXCHANGE_WORKER_URL}/api/update-bigmac`);
                                                const data = await resp.json();
                                                if (data.ok) showToast('success', 'Big Mac 巨无霸指数已更新');
                                                else showToast('error', '更新失败');
                                            } catch (e) { showToast('error', '网络错误'); }
                                        }} 
                                        className="py-2 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 active:scale-95"
                                    >
                                        <span>🍔</span> 更新 Big Mac 指数
                                    </button>
                                </div>
                            </section>

                            {/* 兑换限制设置 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                            <span>🛡️</span> 现实兑换安全限额与防沉迷保护
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-0.5">直接同步并严格由云端执行，防止孩子通过篡改浏览器本地数据绕过</p>
                                    </div>
                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full flex items-center gap-1">
                                        <span>🔒</span> 服务端强制执行
                                    </span>
                                </div>

                                {(() => {
                                    const saveLimitsToServer = () => {
                                        const effectiveCode = syncCode || 'local_' + activeChild;
                                        const limits = {
                                            minGold: (() => { try { return parseInt(storage.getItem('app_exchange_min_gold') || '500'); } catch(e) { return 500; } })(),
                                            maxSingle: (() => { try { return parseInt(storage.getItem('app_exchange_max_single') || '0'); } catch(e) { return 0; } })(),
                                            maxWeekly: (() => { try { return parseInt(storage.getItem('app_exchange_max_weekly') || '0'); } catch(e) { return 0; } })(),
                                        };
                                        storage.markKeyVersion('app_exchange_min_gold');
                                        storage.markKeyVersion('app_exchange_max_single');
                                        storage.markKeyVersion('app_exchange_max_weekly');
                                        if (typeof window !== 'undefined' && window._triggerSync) window._triggerSync();
                                        fetch(`${EXCHANGE_WORKER_URL}/api/limits`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ syncCode: effectiveCode, limits })
                                        }).then(r => r.json()).then(d => {
                                            if (d.ok) showToast('success', '兑换限额已同步至服务端');
                                            else showToast('error', d.error || '限额同步失败');
                                        }).catch(() => showToast('error', '网络错误，限额未同步到服务端'));
                                    };
                                    return (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                                                <label className="text-xs font-bold text-slate-700 block mb-1">最低起兑门槛</label>
                                                <div className="flex items-center gap-1">
                                                    <input 
                                                        type="number" min="1" max="10000" step="100"
                                                        defaultValue={(() => { try { return parseInt(storage.getItem('app_exchange_min_gold') || '500'); } catch(e) { return 500; } })()}
                                                        onBlur={e => { storage.setItem('app_exchange_min_gold', String(Math.max(1, parseInt(e.target.value) || 500))); saveLimitsToServer(); }}
                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800"
                                                    />
                                                    <span className="text-xs text-slate-500 font-bold shrink-0">元宝</span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                                                <label className="text-xs font-bold text-slate-700 block mb-1">单次兑换上限 (0为不限)</label>
                                                <div className="flex items-center gap-1">
                                                    <input 
                                                        type="number" min="0" max="100000" step="100"
                                                        defaultValue={(() => { try { return parseInt(storage.getItem('app_exchange_max_single') || '0'); } catch(e) { return 0; } })()}
                                                        onBlur={e => { storage.setItem('app_exchange_max_single', String(Math.max(0, parseInt(e.target.value) || 0))); saveLimitsToServer(); }}
                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800"
                                                    />
                                                    <span className="text-xs text-slate-500 font-bold shrink-0">元宝</span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                                                <label className="text-xs font-bold text-slate-700 block mb-1">每周累计上限 (0为不限)</label>
                                                <div className="flex items-center gap-1">
                                                    <input 
                                                        type="number" min="0" max="100000" step="100"
                                                        defaultValue={(() => { try { return parseInt(storage.getItem('app_exchange_max_weekly') || '0'); } catch(e) { return 0; } })()}
                                                        onBlur={e => { storage.setItem('app_exchange_max_weekly', String(Math.max(0, parseInt(e.target.value) || 0))); saveLimitsToServer(); }}
                                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800"
                                                    />
                                                    <span className="text-xs text-slate-500 font-bold shrink-0">元宝</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </section>
                       </div>
                       )}

                       {activeSettingsTab === 'data' && (
                       <div className="space-y-4">
                            {/* 介绍顶栏 */}
                            <section className="bg-gradient-to-r from-purple-50 to-indigo-50/70 p-5 rounded-2xl border border-purple-200/80 shadow-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-xl shadow-inner">
                                        💾
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-purple-950 text-base">大事纪与数据方舟总署</h3>
                                        <p className="text-xs text-purple-700/80">查看孩子修仙长卷大事纪、导入导出本地全量快照备份，以及执行数据核算与纠错维护。</p>
                                    </div>
                                </div>
                            </section>

                            {/* 双主入口卡片 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <button 
                                    type="button"
                                    onClick={() => { setShowSettings(false); setTimeout(() => setShowMilestones(true), 100); }}
                                    className="p-5 bg-white rounded-2xl border border-purple-200/90 hover:border-purple-400 hover:shadow-md transition-all text-left group cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-11 h-11 rounded-2xl bg-purple-100/70 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                            📜
                                        </div>
                                        <span className="text-xs text-purple-600 font-bold group-hover:translate-x-0.5 transition-transform">
                                            进入卷轴 ↗
                                        </span>
                                    </div>
                                    <div className="font-bold text-slate-800 text-base mb-1">查验修仙大事纪</div>
                                    <div className="text-xs text-slate-400 leading-relaxed">
                                        铭刻着每一次突破境界、封印解锁、重大成就与仙缘奇遇的光辉历史。
                                    </div>
                                </button>

                                <button 
                                    type="button"
                                    onClick={() => { setShowSettings(false); setTimeout(() => setShowBackupPanel(true), 100); }}
                                    className="p-5 bg-white rounded-2xl border border-indigo-200/90 hover:border-indigo-400 hover:shadow-md transition-all text-left group cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-11 h-11 rounded-2xl bg-indigo-100/70 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                            💾
                                        </div>
                                        <span className="text-xs text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">
                                            备份面板 ↗
                                        </span>
                                    </div>
                                    <div className="font-bold text-slate-800 text-base mb-1">方舟备份与完整恢复</div>
                                    <div className="text-xs text-slate-400 leading-relaxed">
                                        将全套成员、账本、打卡与宠物数据一键导出 JSON 或安全恢复还原。
                                    </div>
                                </button>
                            </div>

                            {/* 维护与纠错工坊 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3.5">
                                <div className="border-b border-slate-100 pb-2.5">
                                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <span>🧰</span> 数据纠错与维护工坊
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-0.5">当发生特殊网络中断、数据迁移或异常时，可在此进行一键平账修复</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <button 
                                        type="button"
                                        onClick={onFixInventory}
                                        className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-2.5 active:scale-95 text-left"
                                    >
                                        <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
                                        <span>扫描账单并找回丢失商品</span>
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={handleSyncMilestones}
                                        className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-indigo-800 text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2.5 active:scale-95 text-left"
                                    >
                                        <Target className="w-4 h-4 text-indigo-600 shrink-0" />
                                        <span>大事纪数据核对与补全</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDeduplicateAchievements}
                                        className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-2.5 active:scale-95 text-left"
                                    >
                                        <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                                        <span>清理重复成就记录 (纠错)</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleRecalculateLevelMilestones}
                                        className="p-3 bg-violet-50/70 border border-violet-200 rounded-xl text-violet-800 text-xs font-bold hover:bg-violet-100 transition-colors flex items-center gap-2.5 active:scale-95 text-left"
                                    >
                                        <TrendingUp className="w-4 h-4 text-violet-600 shrink-0" />
                                        <span>按新等级系统重算升级节点</span>
                                    </button>
                                </div>
                            </section>

                            {/* 使用数据回传 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                            <span>📤</span> 每日运营汇总回传 (可选)
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-0.5">每日首次打开时静默上报设备概览，绝不上报打卡明细与隐私</p>
                                    </div>
                                    <ToggleSwitch 
                                        checked={reportConfig.enabled} 
                                        onChange={() => setReportConfig({ ...reportConfig, enabled: !reportConfig.enabled })} 
                                        activeColor="bg-indigo-600"
                                        ariaLabel="启用每日回传"
                                    />
                                </div>

                                {reportConfig.enabled && (
                                    <div className="space-y-1.5 pt-1">
                                        <label className="text-xs font-bold text-slate-700 block">Formspree 回传 Endpoint 地址</label>
                                        <input
                                            type="url"
                                            placeholder="https://formspree.io/f/xxxxx"
                                            value={reportConfig.formspreeUrl || ''}
                                            onChange={e => setReportConfig({ ...reportConfig, formspreeUrl: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                                        />
                                    </div>
                                )}
                            </section>

                            {/* 低性能模式开关 */}
                            <section className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-5 space-y-3">
                                <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                                    <span>⚡</span> 极致流畅模式与视觉保真适配
                                </h4>
                                <p className="text-xs text-amber-700/80">专为老旧平板、低配轻薄本及长续航场景优化。既保障老旧硬件不卡顿，又完整保留中国古典美学视觉效果与文字清晰度。</p>
                                <div className="pt-1">
                                    <LowPerfToggle />
                                </div>
                            </section>
                       </div>
                       )}

                       {activeSettingsTab === 'members' && (
                       <div className="space-y-4">
                            {/* 介绍顶栏 */}
                            <section className="bg-gradient-to-r from-blue-50 to-indigo-50/70 p-5 rounded-2xl border border-blue-200/80 shadow-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-xl shadow-inner">
                                        👥
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-blue-950 text-base">仙宗修士名册与成员管理</h3>
                                        <p className="text-xs text-blue-700/80">造册家中修仙弟子，定制个人法相头像、当前修学学年年级以及专属灵力主题色。</p>
                                    </div>
                                </div>
                            </section>

                            {/* 成员列表卡片 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                        <span>📜</span> 已造册成员 ({profiles.length} 位)
                                    </h4>
                                    <span className="text-[11px] text-slate-400">点击头像更换法相，点击色球切换灵力主题</span>
                                </div>

                                <div className="space-y-3">
                                    {profiles.map((profile) => (
                                        <div key={profile.id} className="flex items-center gap-3.5 bg-slate-50/70 hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 transition-all">
                                            {/* 头像与上传遮罩 */}
                                            <div className="relative group w-13 h-13 shrink-0">
                                                {profile.avatar ? (
                                                    <img src={profile.avatar} alt={profile.name} className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200" />
                                                ) : (
                                                    <div className={`w-13 h-13 rounded-full flex items-center justify-center text-white font-black text-xl shadow-sm ${COLOR_PALETTES[profile.theme]?.primaryBg || 'bg-slate-400'}`}>
                                                        {profile.name[0]}
                                                    </div>
                                                )}
                                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" title="更换法相头像">
                                                    <Upload className="w-4 h-4" />
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e, profile.id)} />
                                                </label>
                                                {/* 移动端始终可见的微型相机角标 */}
                                                <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-xs border border-slate-200 flex items-center justify-center text-[10px] pointer-events-none sm:hidden">
                                                    📷
                                                </div>
                                            </div>

                                            {/* 信息区 */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="font-bold text-slate-800 text-sm truncate">{profile.name}</span>
                                                    {profile.id === 'TESTER' && (
                                                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                                            测试员
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    {/* 年级选择 */}
                                                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                                                        <span className="text-[11px] text-slate-400 font-medium">🎒 就读</span>
                                                        <select 
                                                            value={profile.grade || 1} 
                                                            onChange={(e) => updateProfileGrade(profile.id, parseInt(e.target.value))}
                                                            className="text-xs bg-transparent text-indigo-700 font-bold focus:outline-none cursor-pointer"
                                                        >
                                                            {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g} 年级</option>)}
                                                        </select>
                                                    </div>

                                                    {/* 主题色选择器 */}
                                                    <div className="flex items-center gap-1.5">
                                                        {Object.values(COLOR_PALETTES).filter(p => BASE_THEME_IDS.includes(p.id) || (stats[profile.name]?.unlockedThemes || []).includes(p.id)).map(p => (
                                                            <button 
                                                                key={p.id} 
                                                                type="button"
                                                                onClick={() => updateProfileTheme(profile.id, p.id)} 
                                                                className={`w-5 h-5 rounded-full border-2 border-white shadow-2xs transition-transform hover:scale-110 cursor-pointer ${p.primaryBg} ${
                                                                    profile.theme === p.id ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110' : 'opacity-80 hover:opacity-100'
                                                                }`}
                                                                title={`灵力主题：${p.name}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 右侧独立停靠删除按钮 */}
                                            {profiles.length > 1 && (
                                                <button 
                                                    type="button"
                                                    onClick={() => deleteProfile(profile.id)}
                                                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer shrink-0"
                                                    title="除名该成员"
                                                    aria-label="删除该成员"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    type="button"
                                    onClick={handleAddProfile} 
                                    className="w-full py-2.5 border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-2xl text-blue-600 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer mt-2"
                                >
                                    <Plus className="w-4 h-4" /> 添加新修士成员
                                </button>
                            </section>
                       </div>
                       )}

                       {activeSettingsTab === 'wheelGold' && (
                       <div className="space-y-4">
                            {/* 介绍顶栏 */}
                            <section className="bg-gradient-to-r from-amber-50 to-orange-50/70 p-5 rounded-2xl border border-amber-200/80 shadow-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-xl shadow-inner">
                                        🎁
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-amber-950 text-base">天工聚宝盆 · 惊喜大转盘配置</h3>
                                        <p className="text-xs text-amber-700/80">孩子完成打卡集齐碎片后自动触发。可定制各扇区金币奖励分值与爆率权重。</p>
                                    </div>
                                </div>
                            </section>

                            {/* 触发规则设置 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                                    <span>⚙️</span> 每日触发门槛律令
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
                                        <label className="text-xs font-bold text-slate-700 block mb-1.5">每日生效截止时限</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" min="0" max="23" 
                                                className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-300" 
                                                value={wheelSettings.deadlineHour} 
                                                onChange={e => setWheelSettings({...wheelSettings, deadlineHour: parseInt(e.target.value) || 18})} 
                                            />
                                            <span className="text-xs text-slate-500 font-bold">: 00 前完成所有要求方可触发转盘</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60 space-y-2">
                                        <label className="text-xs font-bold text-slate-700 block">触发达标衡量标准</label>
                                        <div className="flex gap-1 bg-slate-200/60 p-1 rounded-xl">
                                            <button 
                                                type="button"
                                                onClick={() => setWheelSettings({...wheelSettings, thresholdType: 'percent'})} 
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                    wheelSettings.thresholdType === 'percent' 
                                                        ? 'bg-white text-amber-800 shadow-xs' 
                                                        : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                            >
                                                按比例 %
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setWheelSettings({...wheelSettings, thresholdType: 'fixed'})} 
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                    wheelSettings.thresholdType === 'fixed' 
                                                        ? 'bg-white text-amber-800 shadow-xs' 
                                                        : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                            >
                                                按碎片数
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setWheelSettings({...wheelSettings, thresholdType: 'daily_must'})} 
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                    wheelSettings.thresholdType === 'daily_must' 
                                                        ? 'bg-white text-amber-800 shadow-xs' 
                                                        : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                            >
                                                按每日必做
                                            </button>
                                        </div>

                                        {wheelSettings.thresholdType === 'daily_must' ? (
                                            <p className="text-[11px] text-amber-700 font-medium pt-1">
                                                所需碎片 = 当日有效的全部「每日必做」任务数量。
                                            </p>
                                        ) : (
                                            <div className="flex items-center gap-2 pt-1">
                                                <span className="text-xs text-slate-500">门槛数值：</span>
                                                <input 
                                                    type="number" 
                                                    className="w-20 p-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold text-sm text-center" 
                                                    value={wheelSettings.thresholdValue} 
                                                    onChange={e => setWheelSettings({...wheelSettings, thresholdValue: parseInt(e.target.value) || 0})} 
                                                />
                                                <span className="text-xs text-slate-500 font-bold">
                                                    {wheelSettings.thresholdType === 'percent' ? '% 任务量' : '枚碎片'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* 扇区配置与实时爆率计算 */}
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                                {(() => {
                                    const totalGoldWeight = wheelConfig.reduce((acc, cur) => acc + (Number(cur.weight) || 0), 0);
                                    return (
                                        <>
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                                    <span>🎡</span> 转盘扇区与概率设定
                                                </h4>
                                                <span className="text-xs text-slate-500 font-medium">
                                                    权重总和: <span className="font-bold text-amber-700">{totalGoldWeight}</span>
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2.5">
                                                {wheelConfig.map((item, idx) => {
                                                    const pct = totalGoldWeight > 0 ? ((Number(item.weight) / totalGoldWeight) * 100).toFixed(1) : '0';
                                                    return (
                                                        <div key={item.id} className="flex items-center gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 shadow-2xs">
                                                            <div className="w-5 h-5 rounded-full shrink-0 border-2 border-white shadow-xs" style={{backgroundColor: item.color}} />
                                                            <div className="flex-1 grid grid-cols-3 gap-2.5">
                                                                <div>
                                                                    <label className="text-[10px] text-slate-400 font-bold block mb-0.5">奖项名称</label>
                                                                    <input 
                                                                        className="w-full font-bold text-xs sm:text-sm text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-amber-400 focus:outline-none" 
                                                                        value={item.name} 
                                                                        onChange={e => { 
                                                                            const newConfig = [...wheelConfig]; 
                                                                            newConfig[idx].name = e.target.value; 
                                                                            setWheelConfig(newConfig); 
                                                                        }} 
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] text-slate-400 font-bold block mb-0.5">金元宝</label>
                                                                    <input 
                                                                        type="number" 
                                                                        className="w-full font-bold text-xs sm:text-sm text-amber-600 bg-transparent border-b border-dashed border-slate-300 focus:border-amber-400 focus:outline-none" 
                                                                        value={item.value} 
                                                                        onChange={e => { 
                                                                            const newConfig = [...wheelConfig]; 
                                                                            newConfig[idx].value = parseInt(e.target.value) || 0; 
                                                                            setWheelConfig(newConfig); 
                                                                        }} 
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-0.5">
                                                                        <span>权重</span>
                                                                        <span className="text-amber-700 font-black">{pct}%</span>
                                                                    </div>
                                                                    <input 
                                                                        type="number" 
                                                                        className="w-full font-bold text-xs sm:text-sm text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-amber-400 focus:outline-none" 
                                                                        value={item.weight} 
                                                                        onChange={e => { 
                                                                            const newConfig = [...wheelConfig]; 
                                                                            newConfig[idx].weight = parseInt(e.target.value) || 0; 
                                                                            setWheelConfig(newConfig); 
                                                                        }} 
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    );
                                })()}

                                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap justify-end gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => onLaunchExtraWheel('gold', true)} 
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                                    >
                                        <Play className="w-3.5 h-3.5" /> 演示转盘 (不计入实际数据)
                                    </button> 
                                    <button 
                                        type="button"
                                        onClick={onLaunchExtraWheel} 
                                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                                    >
                                        <Gift className="w-3.5 h-3.5" /> 发放额外惊喜奖励 (真实计入元宝)
                                    </button>
                                </div>
                            </section>
                       </div>
                       )}

                       {activeSettingsTab === 'wheelXp' && (
                        <div className="space-y-4">
                            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                                {(() => {
                                    const totalXpWeight = xpWheelConfig.reduce((acc, cur) => acc + (Number(cur.weight) || 0), 0);
                                    return (
                                        <>
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                                                        经验值大转盘扇区与概率设定
                                                    </h4>
                                                    <p className="text-xs text-slate-400 mt-0.5">转出的经验值将直接注入宠物成长与等级体系</p>
                                                </div>
                                                <span className="text-xs text-slate-500 font-medium shrink-0">
                                                    权重总和: <span className="font-bold text-indigo-600">{totalXpWeight}</span>
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2.5">
                                                {xpWheelConfig.map((item, idx) => {
                                                    const pct = totalXpWeight > 0 ? ((Number(item.weight) / totalXpWeight) * 100).toFixed(1) : '0';
                                                    return (
                                                        <div key={item.id} className="flex items-center gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 shadow-2xs">
                                                            <div className="w-5 h-5 rounded-full shrink-0 border-2 border-white shadow-xs" style={{backgroundColor: item.color}} />
                                                            <div className="flex-1 grid grid-cols-3 gap-2.5">
                                                                <div>
                                                                    <label className="text-[10px] text-slate-400 font-bold block mb-0.5">奖项名称</label>
                                                                    <input 
                                                                        className="w-full font-bold text-xs sm:text-sm text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-400 focus:outline-none" 
                                                                        value={item.name} 
                                                                        onChange={e => { 
                                                                            const newConfig = [...xpWheelConfig]; 
                                                                            newConfig[idx].name = e.target.value; 
                                                                            setXpWheelConfig(newConfig); 
                                                                        }} 
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] text-slate-400 font-bold block mb-0.5">XP 经验值</label>
                                                                    <input 
                                                                        type="number" 
                                                                        className="w-full font-bold text-xs sm:text-sm text-indigo-600 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-400 focus:outline-none" 
                                                                        value={item.value} 
                                                                        onChange={e => { 
                                                                            const newConfig = [...xpWheelConfig]; 
                                                                            newConfig[idx].value = parseInt(e.target.value) || 0; 
                                                                            setXpWheelConfig(newConfig); 
                                                                        }} 
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-0.5">
                                                                        <span>权重</span>
                                                                        <span className="text-indigo-600 font-black">{pct}%</span>
                                                                    </div>
                                                                    <input 
                                                                        type="number" 
                                                                        className="w-full font-bold text-xs sm:text-sm text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-400 focus:outline-none" 
                                                                        value={item.weight} 
                                                                        onChange={e => { 
                                                                            const newConfig = [...xpWheelConfig]; 
                                                                            newConfig[idx].weight = parseInt(e.target.value) || 0; 
                                                                            setXpWheelConfig(newConfig); 
                                                                        }} 
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    );
                                })()}

                                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap justify-end gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => onLaunchExtraWheel('xp', true)} 
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                                    >
                                        <Play className="w-3.5 h-3.5" /> 演示XP转盘 (不计入实际数据)
                                    </button> 
                                    <button 
                                        type="button"
                                        onClick={() => onLaunchExtraWheel('xp', false)} 
                                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                                    >
                                        <Gift className="w-3.5 h-3.5" /> 发放额外XP奖励 (真实增加经验)
                                    </button>
                                </div>
                            </section>
                        </div>
                       )}

                       {activeSettingsTab === 'tasks' && (
						<>
                       {/* --- 使用闭包对任务进行分类并渲染 --- */}
						{(() => {
							const childTasks = tasks[activeChild] || [];
							const ongoingTasksForSetting = [];
							const completedTasksForSetting = [];

							// 获取任务当前的权威生效频次
							const getTaskEffectiveFreq = (t) => {
								if (!t) return 'count';
								if (t.frequencyType === 'habit') return 'habit';
								if (t.frequencyType === 'reading') return 'reading';
								if (t.frequencyType === 'daily_must') return 'daily_must';
								if (t.frequencyType === 'weekly_optional') return 'weekly_optional';
								if (t.frequencyType === 'count') return 'count';
								// 历史无 frequencyType 数据时的兜底判定
								if (t.habitConfig?.isHabit || t.isHabit) return 'habit';
								if (t.readingConfig?.isReading) return 'reading';
								return 'count';
							};

							// 切换打卡频次时的原子状态转换处理函数
							const handleFrequencyChange = (targetTaskId, newFreq) => {
								const curTask = childTasks.find(t => t.id === targetTaskId);
								if (!curTask) return;

								if (newFreq === 'habit') {
									const isWater = curTask.name?.includes('水');
									const isEye = curTask.name?.includes('眼');
									const isRope = curTask.name?.includes('绳') || curTask.name?.includes('跳');
									const isTooth = curTask.name?.includes('牙');
									const isSleep = curTask.name?.includes('睡');

									const existingCfg = curTask.habitConfig || {};
									const newHabitCfg = {
										...existingCfg,
										isHabit: true,
										icon: existingCfg.icon || (isWater ? '💧' : isEye ? '👀' : isRope ? '🏃' : isTooth ? '🪥' : isSleep ? '🛏️' : '🌱'),
										mode: existingCfg.mode || ((isWater || isRope || isTooth || isEye) ? 'count' : 'check'),
										hasTarget: existingCfg.hasTarget !== undefined ? existingCfg.hasTarget : (!isEye && (isWater || isRope || isTooth)),
										targetCount: existingCfg.targetCount !== undefined ? existingCfg.targetCount : (isWater ? 8 : isRope ? 500 : isTooth ? 2 : (isEye ? 0 : 1)),
										unit: existingCfg.unit || (isWater ? '杯' : isRope ? '下' : '次'),
										color: existingCfg.color || (isWater ? 'sky' : isRope ? 'amber' : isSleep ? 'purple' : 'emerald')
									};

									const updateObj = {
										frequencyType: 'habit',
										isHabit: true,
										habitConfig: newHabitCfg
									};
									// 随心多次模式下将旧的学业 targetCount 置零，彻底规避历史数据脏标污染
									if (newHabitCfg.mode === 'count' && newHabitCfg.hasTarget === false) {
										updateObj.targetCount = 0;
									}
									if (curTask.readingConfig?.isReading) {
										updateObj.readingConfig = { ...curTask.readingConfig, isReading: false };
									}
									updateTaskSetting(targetTaskId, updateObj);
								} else if (newFreq === 'reading') {
									const updateObj = {
										frequencyType: 'reading',
										isHabit: false,
										habitConfig: curTask.habitConfig ? { ...curTask.habitConfig, isHabit: false } : undefined,
										readingConfig: {
											...(curTask.readingConfig || {}),
											isReading: true,
											bookTitle: curTask.readingConfig?.bookTitle || curTask.name,
											coverEmoji: curTask.readingConfig?.coverEmoji || '📖'
										}
									};
									updateTaskSetting(targetTaskId, updateObj);
								} else {
									// 'count' | 'daily_must' | 'weekly_optional'
									const updateObj = {
										frequencyType: newFreq,
										isHabit: false,
										habitConfig: curTask.habitConfig ? { ...curTask.habitConfig, isHabit: false } : undefined
									};
									if (curTask.readingConfig?.isReading) {
										updateObj.readingConfig = { ...curTask.readingConfig, isReading: false };
									}
									// 若切至按次数打卡且原目标次数为0或无效，默认赋予合理的初值
									if (newFreq === 'count' && (!curTask.targetCount || curTask.targetCount <= 0)) {
										updateObj.targetCount = 20;
									}
									updateTaskSetting(targetTaskId, updateObj);
								}
							};
							
							// 动态分类：判断是否已完成目标（每日必做/每周选做/生活习惯规范不按总目标次数判定，始终在进行中）
							childTasks.forEach(task => {
								const freq = getTaskEffectiveFreq(task);
								if (freq === 'daily_must' || freq === 'weekly_optional' || freq === 'habit') {
									if (task.earlyCompleted) { completedTasksForSetting.push(task); } else { ongoingTasksForSetting.push(task); }
									return;
								}
								const count = (task.multiCheckin && task.frequencyType === "daily_must") ? getTaskTotalSessions(checkins[activeChild]?.[task.id] || {}) : Object.keys(checkins[activeChild]?.[task.id] || {}).length;
								if (count >= (task.targetCount || 0)) {
									completedTasksForSetting.push(task);
								} else {
									ongoingTasksForSetting.push(task);
								}
							});

							// --- 搜索 + 筛选（任务多时快速定位）---
							const matchesFilter = (task) => {
								if (taskSearch) {
									const q = taskSearch.toLowerCase();
									if (!(task.name || '').toLowerCase().includes(q) && !(task.targetGoal || '').toLowerCase().includes(q)) return false;
								}
								if (taskTypeFilter && (task.type === 'core' ? 'core' : 'daily') !== taskTypeFilter) return false;
								if (taskFreqFilter) {
									const freq = getTaskEffectiveFreq(task);
									if (freq !== taskFreqFilter) return false;
								}
								return true;
							};
							const filteredOngoing = ongoingTasksForSetting.filter(matchesFilter);
							const filteredCompleted = completedTasksForSetting.filter(matchesFilter);
							// 核心任务排前
							filteredOngoing.sort((a, b) => (b.type === 'core' ? 1 : 0) - (a.type === 'core' ? 1 : 0));
							const filterActive = !!(taskSearch || taskTypeFilter || taskFreqFilter);

							// 频次徽标
							const freqLabel = (task) => {
								const f = getTaskEffectiveFreq(task);
								if (f === 'habit') {
									return { text: `🌱 习惯·${task.habitConfig?.icon || '🌱'}`, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
								}
								if (f === 'reading') {
									return { text: `📖 伴读·${task.readingConfig?.coverEmoji || '📖'}`, cls: 'bg-amber-50 text-amber-700 border-amber-200' };
								}
								if (f === 'daily_must') return { text: '每日必做', cls: 'bg-rose-50 text-rose-600 border-rose-200' };
								if (f === 'weekly_optional') return { text: `每周${task.weeklyTargetCount ?? 3}次`, cls: 'bg-sky-50 text-sky-700 border-sky-200' };
								return { text: '按次数', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
							};

							// 行状态辅助
							const taskRecOf = (task) => checkins[activeChild]?.[task.id] || {};
							// 该任务连续打卡天数（今天未打卡时宽限，从昨天算起）
							const calcRowStreak = (task) => {
								const rec = taskRecOf(task);
								let streak = 0;
								for (let d = 0; d < 400; d++) {
									const key = getLocalDateKey(-d);
									if (rec[key]) streak++;
									else if (d === 0) continue;
									else break;
								}
								return streak;
							};
							// 本周（周一至今）完成天数
							const calcRowWeekDone = (task) => {
								const rec = taskRecOf(task);
								const dow = new Date().getDay() || 7;
								let c = 0;
								for (let i = 0; i < dow; i++) { if (rec[getLocalDateKey(-i)]) c++; }
								return c;
							};
							const fmtRowDeadline = (d) => { if (!d) return ''; const p = d.split('-'); return `${parseInt(p[1])}月${parseInt(p[2])}日`; };

							// 紧凑行：两行布局，默认收起，点击展开为完整编辑卡（同时只展开一张）
							const renderTaskRow = (task, isCompleted) => {
								const fl = freqLabel(task);
								const freq = getTaskEffectiveFreq(task);
								const rec = taskRecOf(task);
								const doneCount = Object.keys(rec).length;
								const target = task.targetCount || 0;
								const todayKey = getLocalDateKey(0);
								const dLeft = task.deadline ? Math.ceil((new Date(task.deadline + 'T23:59:59') - new Date(todayKey + 'T00:00:00')) / 86400000) : null;
								const soon = dLeft !== null && dLeft >= 0 && dLeft <= 7;
								const overdue = dLeft !== null && dLeft < 0;

								// 第二行状态
								let statusNode = null;
								if (freq === 'habit') {
									const isCount = task.habitConfig?.mode === 'count';
									const hasTarget = isCount && task.habitConfig?.hasTarget !== false && ((task.habitConfig?.targetCount || 0) > 0);
									const isUnlimited = isCount && !hasTarget;
									const tgt = hasTarget ? (task.habitConfig?.targetCount || 1) : 1;
									const todayVal = rec[todayKey];
									const curToday = todayVal === undefined || todayVal === null || todayVal === '' ? 0 : (typeof todayVal === 'number' ? todayVal : (Array.isArray(todayVal) ? todayVal.length : 1));
									const unit = task.habitConfig?.unit || (task.habitConfig?.icon === '💧' ? '杯' : '次');
									if (isUnlimited) {
										statusNode = <span className="shrink-0 font-semibold text-emerald-600">{curToday > 0 ? `今日已做 ${curToday} ${unit}` : '随时可做'}</span>;
									} else if (hasTarget) {
										statusNode = <span className={`shrink-0 font-semibold ${curToday >= tgt ? 'text-emerald-600' : 'text-slate-600'}`}>今日 {curToday}/{tgt} {unit}</span>;
									} else {
										statusNode = <span className={`shrink-0 font-semibold ${curToday >= 1 ? 'text-emerald-600' : 'text-slate-600'}`}>{curToday >= 1 ? '今日已达标 ✓' : '今日待打卡'}</span>;
									}
								} else if (freq === 'reading') {
									statusNode = <span className="shrink-0 font-semibold text-amber-700">{task.readingConfig?.bookTitle ? `《${task.readingConfig.bookTitle}》` : '伴读进行中'}</span>;
								} else if (freq === 'count') {
									const pct = target > 0 ? Math.min(100, Math.round(doneCount / target * 100)) : 0;
									statusNode = (
										<span className="flex items-center gap-1.5 shrink-0">
											<span className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
												<span className="block h-full bg-indigo-500 rounded-full" style={{ width: pct + '%' }} />
											</span>
											<span className="tabular-nums font-semibold">{doneCount}/{target}</span>
										</span>
									);
								} else if (freq === 'daily_must') {
									const s = calcRowStreak(task);
									statusNode = <span className="shrink-0 font-semibold">{s > 0 ? `🔥 连续 ${s} 天` : '今日待打卡'}</span>;
								} else {
									const wd = calcRowWeekDone(task);
									const wt = task.weeklyTargetCount ?? 3;
									statusNode = <span className={`shrink-0 font-semibold ${wd >= wt ? 'text-emerald-600' : ''}`}>本周 {wd}/{wt}{wd >= wt ? ' ✓' : ''}</span>;
								}
								return (
									<button 
										key={task.id} 
										type="button"
										onClick={() => { setExpandedTaskId(task.id); setAdvOpen({}); }}
										className={`task-row-enter group w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all hover:shadow-xs active:scale-[0.99] cursor-pointer ${
											isCompleted 
												? 'bg-amber-50/50 border-amber-200/80 hover:bg-amber-50' 
												: 'bg-white border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30'
										}`}
									>
										<span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-2xs border ${
											task.type === 'core' 
												? 'bg-amber-100/80 border-amber-200 text-amber-700' 
												: 'bg-emerald-50 border-emerald-200 text-emerald-700'
										}`}>
											{task.type === 'core' ? '⭐' : '🍃'}
										</span>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<span className="font-bold text-sm text-slate-800 truncate min-w-0">{task.name}</span>
												{soon && <span className="shrink-0 px-1.5 py-0.2 text-[9px] rounded-md bg-amber-100 text-amber-700 font-bold border border-amber-200">临期</span>}
												{overdue && <span className="shrink-0 px-1.5 py-0.2 text-[9px] rounded-md bg-rose-100 text-rose-700 font-bold border border-rose-200">已逾期</span>}
												{task.isNew && <span className="blink-reminder shrink-0 text-[10px] text-amber-600 font-black">新</span>}
												{task.onCheckinReward === 'wheel_gold' && <span className="shrink-0 px-1.5 py-0.2 text-[9px] rounded-md bg-amber-50 text-amber-600 font-bold border border-amber-200">🎡金币转盘</span>}
												{task.onCheckinReward === 'wheel_xp' && <span className="shrink-0 px-1.5 py-0.2 text-[9px] rounded-md bg-indigo-50 text-indigo-600 font-bold border border-indigo-200">🎡经验转盘</span>}
												<span className={`shrink-0 ml-auto px-2 py-0.5 rounded-full border text-[10px] font-bold ${fl.cls}`}>
													{fl.text}
												</span>
											</div>
											<div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
												{statusNode}
												<span className="shrink-0 text-amber-600 font-bold">💰 +{task.reward}</span>
												{task.deadline && (
													<span className={`shrink-0 ${overdue ? 'text-rose-500 font-bold' : soon ? 'text-amber-600 font-bold' : ''}`}>
														{fmtRowDeadline(task.deadline)} 截止
													</span>
												)}
											</div>
										</div>
										<span className="shrink-0 text-slate-300 group-hover:text-indigo-500 transition-colors pl-1">
											<ChevronRight className="w-4 h-4" />
										</span>
									</button>
								);
							};

							// 统一的卡片渲染函数（展开态：三段式布局 — 名称区 / 基础区 / 高级折叠区）
							const renderTaskSettingCard = (task, isCompleted) => {
								const freq = getTaskEffectiveFreq(task);
								const inputCls = "w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all font-medium";
								const labelCls = "text-[11px] font-bold text-slate-400 block mb-1";
								// 分段选择按钮（iOS 风格）
								const seg = (active) => `flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${active ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`;
								// 高级设置折叠面板
								const advSec = (key, title, configured, content) => (
									<div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
										<button 
											type="button" 
											onClick={() => setAdvOpen(p => ({ ...p, [key]: !p[key] }))}
											className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-100/70 transition-colors cursor-pointer"
										>
											<span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
												{title}{configured && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
											</span>
											<ChevronDown className={`w-3.5 h-3.5 text-slate-400 transform transition-transform duration-200 ${advOpen[key] ? 'rotate-180' : ''}`} />
										</button>
										{advOpen[key] && <div className="p-3.5 border-t border-slate-100 space-y-2.5">{content}</div>}
									</div>
								);
								return (
									<div key={task.id} className="task-card-enter border-2 border-indigo-200 bg-white p-4 sm:p-5 rounded-2xl flex flex-col gap-3.5 relative shadow-sm ring-2 ring-indigo-50/50">
										{/* 顶栏：状态徽标 + 收起/删除 */}
										<div className="flex items-center justify-between pb-2 border-b border-slate-100">
											<div className="flex items-center gap-2 min-h-[24px]">
												{isCompleted && <span className="px-2.5 py-0.5 text-[11px] rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">🎯 已达成目标</span>}
												{task.isNew && <span className="blink-reminder px-2.5 py-0.5 text-[11px] rounded-full font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">✨ 新任务 · 请完善配置</span>}
											</div>
											<div className="flex items-center gap-1.5">
												<button 
													type="button" 
													onClick={() => setExpandedTaskId(null)} 
													className="px-3 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-all active:scale-95 cursor-pointer"
												>
													▲ 收起编辑
												</button>
												<button 
													type="button" 
													onClick={() => handleDeleteTask(task.id)} 
													className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
													title="删除任务"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</div>

										{/* 一、名称与目标 */}
										<div>
											<input 
												type="text" 
												value={task.name} 
												onChange={(e) => updateTaskSetting(task.id, 'name', e.target.value)}
												placeholder="任务名称"
												className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl font-bold text-sm sm:text-base text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" 
											/>
											<input 
												type="text" 
												value={task.targetGoal || ''} 
												onChange={(e) => updateTaskSetting(task.id, 'targetGoal', e.target.value)}
												placeholder="补充目标描述（可选）…"
												className="mt-2 w-full px-3 py-1.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" 
											/>
										</div>

										{/* 二、基础配置 */}
										<div className="grid grid-cols-2 gap-2.5">
											<div>
												<label className={labelCls}>项目类型</label>
												<div className="flex bg-slate-100 p-1 rounded-xl gap-1">
													<button type="button" onClick={() => updateTaskSetting(task.id, 'type', 'core')} className={seg(task.type === 'core')}>⭐ 核心</button>
													<button type="button" onClick={() => updateTaskSetting(task.id, 'type', 'daily')} className={seg(task.type !== 'core')}>🍃 日常</button>
												</div>
											</div>
											<div>
												<label className={labelCls}>打卡频次</label>
												<div className="flex bg-slate-100 p-1 rounded-xl gap-1 flex-wrap">
													<button type="button" onClick={() => handleFrequencyChange(task.id, 'count')} className={seg(freq === 'count')}>按次数</button>
													<button type="button" onClick={() => handleFrequencyChange(task.id, 'daily_must')} className={seg(freq === 'daily_must')}>每日</button>
													<button type="button" onClick={() => handleFrequencyChange(task.id, 'weekly_optional')} className={seg(freq === 'weekly_optional')}>每周</button>
													<button type="button" onClick={() => handleFrequencyChange(task.id, 'reading')} className={seg(freq === 'reading')}>📖 伴读</button>
													<button type="button" onClick={() => handleFrequencyChange(task.id, 'habit')} className={seg(freq === 'habit')}>🌱 习惯</button>
												</div>
											</div>
										</div>

										{/* 习惯专属微配置 */}
										{freq === 'habit' && (
											<div className="space-y-3 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-3.5">
												<div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
													<span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
														<span>🌱 生活习惯专属微配置</span>
														<span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">轻量化·悬浮球</span>
													</span>
													<span className="text-[10px] text-emerald-700">自动脱离学业大卡片</span>
												</div>

												{/* 习惯专属徽章图标选择器（预设库 + 用户自定义输入） */}
												<div>
													<div className="flex items-center justify-between mb-1.5">
														<label className="text-[11px] font-bold text-emerald-800">
															习惯徽章图标 <span className="text-[10px] text-emerald-600 font-normal">（可点击精选图标，也可输入任意Emoji/文字）</span>
														</label>
														<div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
															<span className="text-[10px] text-slate-400">已选:</span>
															<span className="text-base leading-none">{task.habitConfig?.icon || '🌱'}</span>
														</div>
													</div>

													{/* 丰富精选预设库 */}
													<div className="flex gap-1.5 flex-wrap max-h-36 overflow-y-auto p-1.5 bg-white/70 rounded-xl border border-emerald-100">
														{(HABIT_ICON_PRESETS || []).map(({ icon, label }) => {
															const curIcon = task.habitConfig?.icon || '🌱';
															const isSel = curIcon === icon;
															return (
																<button
																	key={icon}
																	type="button"
																	onClick={() => updateTaskSetting(task.id, 'habitConfig', {
																		...(task.habitConfig || {}),
																		isHabit: true,
																		icon
																	})}
																	className={`px-2 py-1 rounded-xl text-xs flex items-center gap-1 border transition-all cursor-pointer ${
																		isSel 
																			? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold scale-105' 
																			: 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
																	}`}
																>
																	<span>{icon}</span>
																	<span className="text-[10px]">{label}</span>
																</button>
															);
														})}
													</div>

													{/* 用户自定义输入框 */}
													<div className="flex items-center gap-2 mt-2 pt-2 border-t border-emerald-200/60">
														<span className="text-[11px] font-bold text-emerald-800 shrink-0">自定义图标:</span>
														<input
															type="text"
															maxLength={6}
															value={task.habitConfig?.icon || ''}
															onChange={(e) => {
																const val = e.target.value.trim();
																updateTaskSetting(task.id, 'habitConfig', {
																	...(task.habitConfig || {}),
																	isHabit: true,
																	icon: val || '🌱'
																});
															}}
															placeholder="输入任意Emoji或单字，如 🛹、🏊‍♀️、🎯、操"
															className="flex-1 px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-slate-400 placeholder:font-normal"
														/>
													</div>
												</div>

												{/* 打卡模式：单次 vs 定量目标 vs 随心多次 */}
												<div className="space-y-2 pt-1">
													<label className="text-[11px] font-bold text-emerald-800 block">打卡模式</label>
													<div className="grid grid-cols-1 sm:grid-cols-3 bg-white p-1 rounded-xl border border-emerald-200 gap-1 text-center">
														<button
															type="button"
															onClick={() => updateTaskSetting(task.id, {
																habitConfig: {
																	...(task.habitConfig || {}),
																	isHabit: true,
																	mode: 'check',
																	targetCount: 1,
																	hasTarget: true
																},
																targetCount: 1
															})}
															className={seg((task.habitConfig?.mode || 'check') === 'check')}
														>
															🔘 单次达标 (每日1次)
														</button>
														<button
															type="button"
															onClick={() => {
																const tgt = ((task.habitConfig?.targetCount || 0) > 1 ? task.habitConfig.targetCount : 8);
																updateTaskSetting(task.id, {
																	habitConfig: {
																		...(task.habitConfig || {}),
																		isHabit: true,
																		mode: 'count',
																		hasTarget: true,
																		targetCount: tgt,
																		unit: task.habitConfig?.unit || (task.habitConfig?.icon === '💧' ? '杯' : '次')
																	},
																	targetCount: tgt
																});
															}}
															className={seg(task.habitConfig?.mode === 'count' && (task.habitConfig?.hasTarget !== false && (task.habitConfig?.targetCount || 0) > 0))}
														>
															🎯 定量打卡 (设目标总量)
														</button>
														<button
															type="button"
															onClick={() => updateTaskSetting(task.id, {
																habitConfig: {
																	...(task.habitConfig || {}),
																	isHabit: true,
																	mode: 'count',
																	hasTarget: false,
																	targetCount: 0,
																	unit: task.habitConfig?.unit || '次'
																},
																targetCount: 0
															})}
															className={seg(task.habitConfig?.mode === 'count' && (task.habitConfig?.hasTarget === false || (task.habitConfig?.targetCount || 0) <= 0))}
														>
															♾️ 随心多次 (不设总量)
														</button>
													</div>

													{/* 模式专属说明与参数输入 */}
													{task.habitConfig?.mode === 'count' && (
														(task.habitConfig?.hasTarget === false || (task.habitConfig?.targetCount || 0) <= 0) ? (
															<div className="bg-emerald-100/70 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between gap-3">
																<div className="text-[11px] text-emerald-800 leading-relaxed">
																	<span className="font-bold">💡 随心多次打卡（如眼保健操、即兴拉伸）：</span>
																	<span>休息时随时可做，无需设置目标总量，每次打卡均累计记录并获得奖励。</span>
																</div>
																<div className="w-24 shrink-0">
																	<label className="text-[10px] font-bold text-emerald-800 block mb-0.5">计量单位</label>
																	<input
																		type="text"
																		value={task.habitConfig?.unit || '次'}
																		onChange={(e) => updateTaskSetting(task.id, 'habitConfig', {
																			...(task.habitConfig || {}),
																			isHabit: true,
																			unit: e.target.value
																		})}
																		placeholder="次/组/节"
																		className="w-full px-2 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-emerald-700 outline-none text-center"
																	/>
																</div>
															</div>
														) : (
															<div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-emerald-200">
																<div className="flex-1">
																	<label className="text-[11px] font-bold text-emerald-800 block mb-1">
																		每日目标总量 <span className="text-[10px] text-slate-400 font-normal">（如喝8杯水、跳绳500下）</span>
																	</label>
																	<input
																		type="number"
																		min="2"
																		max="10000"
																		value={task.habitConfig?.targetCount || 8}
																		onChange={(e) => {
																			const val = Math.max(1, parseInt(e.target.value) || 1);
																			updateTaskSetting(task.id, {
																				habitConfig: {
																					...(task.habitConfig || {}),
																					isHabit: true,
																					hasTarget: true,
																					targetCount: val
																				},
																				targetCount: val
																			});
																		}}
																		className="w-full px-2.5 py-1.5 bg-emerald-50/50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-700 outline-none"
																	/>
																</div>
																<div className="w-24 shrink-0">
																	<label className="text-[11px] font-bold text-emerald-800 block mb-1">计量单位</label>
																	<input
																		type="text"
																		value={task.habitConfig?.unit || '杯'}
																		onChange={(e) => updateTaskSetting(task.id, 'habitConfig', {
																			...(task.habitConfig || {}),
																			isHabit: true,
																			unit: e.target.value
																		})}
																		placeholder="杯/下/次"
																		className="w-full px-2.5 py-1.5 bg-emerald-50/50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-700 outline-none text-center"
																	/>
																</div>
															</div>
														)
													)}
												</div>
											</div>
										)}

										{/* 频次附属配置 */}
										{freq === 'daily_must' && (
											<div className="space-y-2 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
												<div className="flex items-center gap-2">
													<span className="text-[11px] font-bold text-slate-600 shrink-0">达标完成度阈值</span>
													<input 
														type="number" 
														min="0" 
														max="100" 
														value={task.dailyCompletionThresholdPercent ?? 80}
														onChange={(e) => updateTaskSetting(task.id, 'dailyCompletionThresholdPercent', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
														className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm text-indigo-600 font-bold text-center outline-none focus:border-indigo-400" 
													/>
													<span className="text-[10px] text-slate-400">% · 每周完成比例 ≥ 阈值时按比例发放完成奖励</span>
												</div>
												<label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-slate-200/60 text-xs font-bold text-slate-700 select-none">
													<input 
														type="checkbox" 
														checked={!!task.holidayExempt} 
														onChange={(e) => updateTaskSetting(task.id, 'holidayExempt', e.target.checked)} 
														className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" 
													/>
													<span>🏖️ 法定节假日与周末免做（遇周末或重大节假日自动豁免，不中断全勤）</span>
												</label>
											</div>
										)}
										{freq === 'weekly_optional' && (
											<div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 flex-wrap">
												<div className="flex items-center gap-1.5">
													<span className="text-[11px] font-bold text-slate-600">每周目标</span>
													<input 
														type="number" 
														min="1" 
														max="7"
														value={task.weeklyTargetCount ?? 3}
														onChange={(e) => updateTaskSetting(task.id, 'weeklyTargetCount', Math.max(1, Math.min(7, parseInt(e.target.value) || 1)))}
														className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm text-indigo-600 font-bold text-center outline-none focus:border-indigo-400" 
													/>
													<span className="text-[10px] text-slate-400">次</span>
												</div>
												<div className="flex items-center gap-1.5">
													<span className="text-[11px] font-bold text-slate-600">超额奖励</span>
													<input 
														type="number" 
														min="0" 
														max="100"
														value={task.weeklyExtraPercentPerExtra ?? 10}
														onChange={(e) => updateTaskSetting(task.id, 'weeklyExtraPercentPerExtra', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
														className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm text-indigo-600 font-bold text-center outline-none focus:border-indigo-400" 
													/>
													<span className="text-[10px] text-slate-400">% / 每多 1 次</span>
												</div>
											</div>
										)}

										{/* 奖励与目标 */}
										<div className="grid grid-cols-3 gap-2.5">
											<div>
												<label className={labelCls}>单次奖励 💰 (元宝)</label>
												<input 
													type="number" 
													value={task.reward} 
													onChange={(e) => updateTaskSetting(task.id, 'reward', parseInt(e.target.value)||0)} 
													className={inputCls + ' font-bold text-amber-600'} 
												/>
											</div>
											<div>
												<label className={labelCls}>完成奖励 🏆 (元宝)</label>
												<input 
													type="number" 
													value={task.completedReward || 0} 
													onChange={(e) => updateTaskSetting(task.id, 'completedReward', parseInt(e.target.value)||0)} 
													className={inputCls + ' font-bold text-indigo-600'} 
												/>
											</div>
											<div>
												<label className={labelCls}>目标次数{freq !== 'count' && <span className="text-[9px] font-normal text-slate-400"> (仅按次数)</span>}</label>
												<input 
													type="number" 
													value={task.targetCount} 
													onChange={(e) => updateTaskSetting(task.id, 'targetCount', parseInt(e.target.value)||0)}
													disabled={freq !== 'count'}
													className={freq !== 'count' ? 'w-full px-3 py-2 bg-slate-100 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 cursor-not-allowed' : inputCls + ' font-bold text-slate-700'} 
												/>
											</div>
										</div>

										{/* 日期（截止日期保留红色警示语义）*/}
										<div className="grid grid-cols-2 gap-2.5">
											<div>
												<label className={labelCls}>开始打卡日期</label>
												<input 
													type="date" 
													value={task.startDate || globalDates.start} 
													onChange={(e) => updateTaskSetting(task.id, 'startDate', e.target.value)} 
													className={inputCls} 
												/>
											</div>
											<div>
												<label className="text-[11px] font-bold text-rose-500 block mb-1">
													截止完成日期
													{task.isNew && <span className="blink-reminder text-[10px] text-amber-600 ml-1 font-semibold">请按实际情况修改</span>}
												</label>
												<input 
													type="date" 
													value={task.deadline || globalDates.end} 
													onChange={(e) => updateTaskSetting(task.id, 'deadline', e.target.value)} 
													className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-600 font-medium outline-none focus:border-rose-400 transition-colors" 
												/>
											</div>
										</div>

										{/* 三、高级设置（默认折叠，已配置的显示圆点）*/}
										<div className="space-y-2 pt-2 border-t border-slate-100">
											<div className="text-[11px] font-bold text-slate-400">⚙️ 高级配置项</div>

											{advSec('reward', '🎁 打卡即时奖励', !!task.onCheckinReward, (
												<>
													<div className="flex flex-wrap gap-1.5">
														<button 
															type="button" 
															onClick={() => updateTaskSetting(task.id, 'onCheckinReward', '')}
															className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
																!task.onCheckinReward 
																	? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
																	: 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
															}`}
														>
															无奖励
														</button>
														<button 
															type="button" 
															onClick={() => updateTaskSetting(task.id, 'onCheckinReward', 'wheel_gold')}
															className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
																task.onCheckinReward === 'wheel_gold' 
																	? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
																	: 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
															}`}
														>
															💰 幸运大转盘（金元宝）
														</button>
														<button 
															type="button" 
															onClick={() => updateTaskSetting(task.id, 'onCheckinReward', 'wheel_xp')}
															className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
																task.onCheckinReward === 'wheel_xp' 
																	? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
																	: 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
															}`}
														>
															✨ 幸运大转盘（经验）
														</button>
													</div>
													<p className="text-[10px] text-slate-400">打卡确认后将立即触发所选转盘进行额外奖励抽奖（定量生活习惯在达成当日目标时触发）。</p>
												</>
											))}

											{freq === 'daily_must' && advSec('multi', '📚 多次打卡与奖励触发', !!task.multiCheckin, (
												<>
													<div className="flex items-center justify-between">
														<span className="text-[11px] font-bold text-slate-600">允许当天多次打卡</span>
														<button 
															type="button" 
															onClick={() => updateTaskSetting(task.id, 'multiCheckin', !task.multiCheckin)}
															className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
																task.multiCheckin 
																	? 'bg-indigo-600 text-white shadow-2xs' 
																	: 'bg-slate-100 text-slate-500 hover:bg-indigo-50'
															}`}
														>
															{task.multiCheckin ? '已开启 ✓' : '开启'}
														</button>
													</div>
													{task.multiCheckin && (
														<div className="space-y-2.5 pt-1">
															<div>
																<label className={labelCls}>计量单位</label>
																<div className="flex gap-1.5 flex-wrap">
																	{['', '课时', '单元', '知识点', '道题', '页'].map(opt => (
																		<button 
																			key={opt} 
																			type="button"
																			onClick={() => updateTaskSetting(task.id, 'multiUnitLabel', opt)}
																			className={`px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
																				(task.multiUnitLabel || '') === opt 
																					? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
																					: 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
																			}`}
																		>
																			{opt || '无(仅计分钟)'}
																		</button>
																	))}
																</div>
															</div>
															<div className="bg-slate-50 rounded-xl border border-slate-200/80 p-3 space-y-2.5">
																<div className="flex items-center justify-between">
																	<span className="text-[11px] font-bold text-slate-700">🎁 阶段额外奖励触发器</span>
																	<span className="text-[10px] text-slate-400">0 = 不触发</span>
																</div>
																<div className="flex items-center gap-1.5 flex-wrap">
																	<span className="text-[11px] text-slate-500">每完成</span>
																	<input 
																		type="number" 
																		min="0" 
																		max="99"
																		value={task.bonusThreshold ?? 0}
																		onChange={(e) => updateTaskSetting(task.id, 'bonusThreshold', Math.max(0, parseInt(e.target.value) || 0))}
																		className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-indigo-600 font-bold text-center outline-none focus:border-indigo-400" 
																	/>
																	<select
																		value={task.bonusThresholdType ?? 'count'}
																		onChange={(e) => updateTaskSetting(task.id, 'bonusThresholdType', e.target.value)}
																		className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 outline-none focus:border-indigo-400"
																	>
																		<option value="count">打卡次数</option>
																		{task.multiUnitLabel && <option value="units">累计{task.multiUnitLabel}</option>}
																	</select>
																	<span className="text-[11px] text-slate-500">后：</span>
																</div>
																<div className="flex items-center gap-1.5 flex-wrap">
																	<button 
																		type="button" 
																		onClick={() => updateTaskSetting(task.id, 'bonusType', 'wheel')}
																		className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
																			(task.bonusType ?? 'wheel') === 'wheel' 
																				? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
																				: 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
																		}`}
																	>
																		🎡 触发转盘
																	</button>
																	<button 
																		type="button" 
																		onClick={() => updateTaskSetting(task.id, 'bonusType', 'multiply')}
																		className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
																			task.bonusType === 'multiply' 
																				? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
																				: 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
																		}`}
																	>
																		🔥 金元宝翻倍
																	</button>
																	{task.bonusType === 'multiply' && (
																		<div className="flex items-center gap-1">
																			<input 
																				type="number" 
																				min="2" 
																				max="10"
																				value={task.bonusMultiplier ?? 2}
																				onChange={(e) => updateTaskSetting(task.id, 'bonusMultiplier', Math.max(2, Math.min(10, parseInt(e.target.value) || 2)))}
																				className="w-12 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-indigo-600 font-bold text-center outline-none focus:border-indigo-400" 
																			/>
																			<span className="text-[11px] text-slate-500">倍</span>
																		</div>
																	)}
																</div>
																{task.bonusThreshold > 0 && (
																	<div className="text-[11px] text-indigo-600 bg-indigo-50/80 border border-indigo-100 rounded-lg p-2">
																		💡 
																		{(task.bonusThresholdType ?? 'count') === 'count'
																			? (task.bonusType === 'wheel'
																				? ` 每完成 ${task.bonusThreshold} 次打卡 → 自动触发幸运大转盘`
																				: ` 每完成 ${task.bonusThreshold} 次打卡 → 本次金元宝 ×${task.bonusMultiplier || 2}`)
																			: (task.bonusType === 'wheel'
																				? ` 每累计 ${task.bonusThreshold} ${task.multiUnitLabel} → 自动触发幸运大转盘`
																				: ` 每累计 ${task.bonusThreshold} ${task.multiUnitLabel} → 本次金元宝 ×${task.bonusMultiplier || 2}`)
																		}
																		（每天独立计数，隔天重置）
																	</div>
																)}
															</div>
														</div>
													)}
												</>
											))}

											{advSec('curriculum', '🎓 学业目标天梯关联', !!task.linkedSubject, (
												<>
													<div className="flex items-center gap-2 flex-wrap">
														<select 
															value={task.linkedSubject || ''} 
															onChange={(e) => updateTaskSetting(task.id, 'linkedSubject', e.target.value)}
															className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-indigo-400"
														>
															<option value="">无关联</option>
															<option value="math_olympiad">奥数思维天梯</option>
															<option value="school_math">校内数学天梯</option>
															<option value="school_chinese">校内语文天梯</option>
															<option value="school_science">校内科学天梯</option>
															<option value="school_english">校内英语天梯</option>
														</select>
														{task.linkedSubject && CURRICULUM_CONFIG[task.linkedSubject] && (() => {
															const subjectConfig = CURRICULUM_CONFIG[task.linkedSubject];
															const currentIdx = curriculumProgress[activeChild]?.[task.linkedSubject] !== undefined ? curriculumProgress[activeChild][task.linkedSubject] : -1;
															const nextIdx = currentIdx + 1;
															const isMax = nextIdx >= subjectConfig.totalSemesters;
															return (
																<div className="flex items-center gap-2 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">
																	<div className="text-xs text-indigo-800">
																		当前: <span className="font-bold">{currentIdx === -1 ? '未开始' : subjectConfig.getSemesterName(currentIdx)}</span>
																	</div>
																	{!isMax && (
																		<button 
																			type="button" 
																			onClick={() => {
																				if(confirm(`⚠️ 家长确认\n\n确认 ${activeChild} 已经完成了【${subjectConfig.getSemesterName(nextIdx)}】的全部学习内容吗？\n\n确认后将解锁对应成就！`)) {
																					handleVerifyCurriculum(activeChild, task.linkedSubject, nextIdx);
																				}
																			}} 
																			className="px-2.5 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-2xs flex items-center gap-1 active:scale-95 cursor-pointer"
																		>
																			<CheckCircle2 className="w-3 h-3" /> 核销: {subjectConfig.getSemesterName(nextIdx)}
																		</button>
																	)}
																	{isMax && <span className="text-[10px] text-emerald-600 font-bold">🎉 全阶通关</span>}
																</div>
															);
														})()}
													</div>
													<p className="text-[10px] text-slate-400">关联后可在此核销学期进度，同步解锁全套学业成就。</p>
												</>
											))}

											{advSec('reading', '📖 伴读书本与阅读设定', !!task.readingConfig?.isReading, (
												<div className="space-y-3 pt-1">
													<div className="flex items-center justify-between">
														<span className="text-xs font-bold text-slate-700">开启图书伴读进度模式</span>
														<button 
															type="button" 
															onClick={() => {
																const currentCfg = task.readingConfig || {};
																const nextIsReading = !currentCfg.isReading;
																if (nextIsReading) {
																	updateTaskSetting(task.id, {
																		frequencyType: 'reading',
																		isHabit: false,
																		habitConfig: task.habitConfig ? { ...task.habitConfig, isHabit: false } : undefined,
																		readingConfig: {
																			...currentCfg,
																			isReading: true,
																			bookTitle: currentCfg.bookTitle || task.name || '',
																			period: currentCfg.period || 'weekly',
																			mode: currentCfg.mode || 'pages',
																			totalPages: currentCfg.totalPages || 180,
																			totalChapters: currentCfg.totalChapters || 12,
																			dailyTargetMinutes: currentCfg.dailyTargetMinutes || 20,
																			targetCount: currentCfg.targetCount || 3,
																			grandReward: currentCfg.grandReward ?? 30,
																			coverEmoji: currentCfg.coverEmoji || '📖'
																		}
																	});
																} else {
																	updateTaskSetting(task.id, {
																		frequencyType: task.frequencyType === 'reading' ? 'count' : (task.frequencyType || 'count'),
																		readingConfig: {
																			...currentCfg,
																			isReading: false
																		}
																	});
																}
															}}
															className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
																task.readingConfig?.isReading 
																	? 'bg-amber-500 text-white shadow-2xs' 
																	: 'bg-slate-100 text-slate-500 hover:bg-amber-50'
															}`}
														>
															{task.readingConfig?.isReading ? '已开启 ✓' : '开启'}
														</button>
													</div>

													{task.readingConfig?.isReading && (
														<div className="space-y-3 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs">
															<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
																<div>
																	<label className={labelCls}>书名</label>
																	<input 
																		type="text" 
																		value={task.readingConfig.bookTitle || ''} 
																		onChange={(e) => updateTaskSetting(task.id, 'readingConfig', { ...task.readingConfig, bookTitle: e.target.value })}
																		placeholder="例如: 夏洛的网" 
																		className={inputCls}
																	/>
																</div>
																<div>
																	<label className={labelCls}>作者 (选填)</label>
																	<input 
																		type="text" 
																		value={task.readingConfig.author || ''} 
																		onChange={(e) => updateTaskSetting(task.id, 'readingConfig', { ...task.readingConfig, author: e.target.value })}
																		placeholder="例如: E.B.怀特" 
																		className={inputCls}
																	/>
																</div>
															</div>

															<div>
																<label className={labelCls}>书本徽章 / Emoji</label>
																<div className="flex gap-1.5 flex-wrap">
																	{['📖', '📚', '🏰', '🚀', '🦁', '🧙‍♂️', '🔬', '🌱', '⛵', '🐱'].map(emoji => (
																		<button
																			key={emoji}
																			type="button"
																			onClick={() => updateTaskSetting(task.id, 'readingConfig', { ...task.readingConfig, coverEmoji: emoji })}
																			className={`w-7 h-7 rounded-lg text-base flex items-center justify-center transition-all cursor-pointer ${
																				(task.readingConfig.coverEmoji || '📖') === emoji 
																					? 'bg-amber-400 text-white ring-2 ring-amber-500 scale-105 shadow-2xs' 
																					: 'bg-white border border-slate-200 hover:bg-amber-50'
																			}`}
																		>
																			{emoji}
																		</button>
																	))}
																</div>
															</div>

															<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
																<div>
																	<label className={labelCls}>周期安排</label>
																	<div className="flex gap-1 bg-white p-0.5 rounded-xl border border-slate-200">
																		{[
																			{ id: 'weekly', label: '周必读' },
																			{ id: 'monthly', label: '月必读' },
																			{ id: 'custom', label: '长期自选' }
																		].map(p => (
																			<button
																				key={p.id}
																				type="button"
																				onClick={() => updateTaskSetting(task.id, 'readingConfig', { ...task.readingConfig, period: p.id })}
																				className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
																					(task.readingConfig.period || 'weekly') === p.id
																						? 'bg-amber-500 text-white shadow-2xs'
																						: 'text-slate-600 hover:text-slate-800'
																				}`}
																			>
																				{p.label}
																			</button>
																		))}
																	</div>
																</div>

																<div>
																	<label className={labelCls}>进度度量形式</label>
																	<div className="flex gap-1 bg-white p-0.5 rounded-xl border border-slate-200">
																		{[
																			{ id: 'pages', label: '按页码' },
																			{ id: 'chapters', label: '按章节' },
																			{ id: 'duration', label: '按时长' },
																			{ id: 'count', label: '按本数' }
																		].map(m => (
																			<button
																				key={m.id}
																				type="button"
																				onClick={() => updateTaskSetting(task.id, 'readingConfig', { ...task.readingConfig, mode: m.id })}
																				className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
																					(task.readingConfig.mode || 'pages') === m.id
																						? 'bg-amber-500 text-white shadow-2xs'
																						: 'text-slate-600 hover:text-slate-800'
																				}`}
																			>
																				{m.label}
																			</button>
																		))}
																	</div>
																</div>
															</div>

															<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
																<div>
																	<label className={labelCls}>
																		{task.readingConfig.mode === 'chapters' ? '全书总章节数' : task.readingConfig.mode === 'duration' ? '每日目标分钟' : task.readingConfig.mode === 'count' ? '目标总本数' : '全书总页数'}
																	</label>
																	<input
																		type="number"
																		min="1"
																		value={
																			task.readingConfig.mode === 'chapters'
																				? (task.readingConfig.totalChapters || 12)
																				: task.readingConfig.mode === 'duration'
																				? (task.readingConfig.dailyTargetMinutes || 20)
																				: task.readingConfig.mode === 'count'
																				? (task.readingConfig.targetCount || 3)
																				: (task.readingConfig.totalPages || 180)
																		}
																		onChange={(e) => {
																			const val = parseInt(e.target.value, 10) || 1;
																			const m = task.readingConfig.mode || 'pages';
																			if (m === 'chapters') updateTaskSetting(task.id, 'readingConfig', { ...task.readingConfig, totalChapters: val });
																			else if (m === 'duration') updateTaskSetting(task.id, 'readingConfig', { ...task.readingConfig, dailyTargetMinutes: val });
																			else if (m === 'count') updateTaskSetting(task.id, 'readingConfig', { ...task.readingConfig, targetCount: val });
																			else updateTaskSetting(task.id, 'readingConfig', { ...task.readingConfig, totalPages: val });
																		}}
																		className={inputCls}
																	/>
																</div>

																<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
																	<div>
																		<label className={labelCls}>🎉 按期通关大奖 (金元宝)</label>
																		<input
																			type="number"
																			min="0"
																			value={task.readingConfig.grandReward ?? 30}
																			onChange={(e) => updateTaskSetting(task.id, 'readingConfig', { ...task.readingConfig, grandReward: parseInt(e.target.value, 10) || 0 })}
																			className={inputCls + ' font-bold text-amber-600'}
																		/>
																	</div>
																	<div>
																		<label className={labelCls}>⏳ 顺延续读大奖 (金元宝)</label>
																		<input
																			type="number"
																			min="0"
																			value={task.readingConfig.overdueGrandReward ?? 20}
																			onChange={(e) => updateTaskSetting(task.id, 'readingConfig', { ...task.readingConfig, overdueGrandReward: parseInt(e.target.value, 10) || 0 })}
																			className={inputCls + ' font-bold text-amber-700/80'}
																		/>
																	</div>
																</div>
															</div>
															<p className="text-[10px] text-amber-700/80">开启后首页将渲染环形进度悬浮球，支持未读快速登记与天工书阁藏书。</p>
														</div>
													)}
												</div>
											))}
										</div>
									</div>
								);
							};

							return (
								<>
									{/* 1. 进行中的任务区（紧凑列表 + 手风琴展开）*/}
									<section className="space-y-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs">
													<Target className="w-4 h-4" />
												</div>
												<div>
													<h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
														正在进行的项目
														<span className="text-xs font-semibold text-slate-400">({activeChild})</span>
													</h3>
													<p className="text-[11px] text-slate-400">共 {ongoingTasksForSetting.length} 项正在进行中</p>
												</div>
											</div>
											<button 
												type="button"
												onClick={() => setShowAddTaskModal(true)} 
												className="px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
											>
												<Plus className="w-3.5 h-3.5" /> 添加新任务
											</button>
										</div>

										{/* 搜索 + 筛选栏（任务多于 1 项或已有筛选时显示）*/}
										{(childTasks.length > 1 || filterActive) && (
											<div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 space-y-2.5">
												<div className="relative">
													<input 
														type="text" 
														value={taskSearch} 
														onChange={e => setTaskSearch(e.target.value)} 
														placeholder="搜索任务名称、目标描述…"
														className="w-full pl-8 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400" 
													/>
													<span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
													{taskSearch && (
														<button 
															type="button"
															onClick={() => setTaskSearch('')} 
															className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
														>
															✕
														</button>
													)}
												</div>
												<div className="flex flex-wrap gap-1.5 text-xs font-bold items-center">
													{[['', '全部类型'], ['core', '⭐ 核心'], ['daily', '🍃 日常']].map(([v, label]) => (
														<button 
															key={'t' + v} 
															type="button"
															onClick={() => setTaskTypeFilter(v)} 
															className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all active:scale-95 cursor-pointer ${
																taskTypeFilter === v 
																	? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
																	: 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
															}`}
														>
															{label}
														</button>
													))}
													<span className="w-px h-3.5 bg-slate-200 mx-1" />
													{[['', '全部频次'], ['daily_must', '每日必做'], ['weekly_optional', '每周选做'], ['count', '按总次数'], ['reading', '📖 伴读打卡'], ['habit', '🌱 生活习惯']].map(([v, label]) => (
														<button 
															key={'f' + v} 
															type="button"
															onClick={() => setTaskFreqFilter(v)} 
															className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all active:scale-95 cursor-pointer ${
																taskFreqFilter === v 
																	? 'bg-sky-600 text-white border-sky-600 shadow-2xs' 
																	: 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
															}`}
														>
															{label}
														</button>
													))}
													{filterActive && (
														<button 
															type="button"
															onClick={() => { setTaskSearch(''); setTaskTypeFilter(''); setTaskFreqFilter(''); }} 
															className="px-2.5 py-1 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 text-[11px] font-bold transition-colors ml-auto cursor-pointer"
														>
															✕ 清除重置
														</button>
													)}
												</div>
											</div>
										)}

										<div className="space-y-2">
											{filteredOngoing.length === 0 && (
												<div className="text-center text-xs text-slate-400 py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
													{filterActive ? '没有找到符合条件的项目' : '当前暂无项目，点击右上角「添加新任务」创建'}
												</div>
											)}
											{filteredOngoing.map(t => expandedTaskId === t.id ? renderTaskSettingCard(t, false) : renderTaskRow(t, false))}
										</div>
									</section>

									{/* 2. 已完成的任务区 (美观的高级折叠面板) */}
									{completedTasksForSetting.length > 0 && (
										<section className="mt-5 border border-amber-200/80 rounded-2xl overflow-hidden bg-amber-50/30 shadow-xs">
											<button 
												type="button"
												onClick={() => setShowCompletedSettings(!showCompletedSettings)}
												className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-amber-50/80 to-yellow-50/80 hover:from-amber-100/80 hover:to-yellow-100/80 transition-colors cursor-pointer"
											>
												<div className="flex items-center gap-2">
													<div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shadow-2xs">
														<Trophy className="w-4 h-4" />
													</div>
													<span className="font-bold text-amber-800 text-sm">
														已达成目标的项目 ({filterActive ? `${filteredCompleted.length}/${completedTasksForSetting.length}` : completedTasksForSetting.length})
													</span>
												</div>
												<div className="text-amber-600 font-bold text-xs flex items-center gap-1">
													<span>{showCompletedSettings ? '点击收起' : '点击查看'}</span>
													<ChevronDown className={`w-3.5 h-3.5 transform transition-transform duration-200 ${showCompletedSettings ? 'rotate-180' : ''}`} />
												</div>
											</button>
											{showCompletedSettings && (
												<div className="p-4 space-y-2.5 border-t border-amber-200/60 bg-white/70">
													{filteredCompleted.length === 0 && (
														<div className="text-center text-xs text-slate-400 py-4">
															没有匹配的已完成项目
														</div>
													)}
													{filteredCompleted.map(t => expandedTaskId === t.id ? renderTaskSettingCard(t, true) : renderTaskRow(t, true))}
												</div>
											)}
										</section>
									)}

									{/* 3. 新增任务弹窗：只填必填项，高级配置创建后自动展开编辑卡设置 */}
									{showAddTaskModal && (() => {
										const submitNewTask = (e) => {
											e.preventDefault();
											const fd = new FormData(e.target);
											const name = String(fd.get('taskName') || '').trim();
											if (!name) return;
											const freq = String(fd.get('taskFreq') || 'count');
											const isReading = fd.get('isReadingTask') === 'on';
											const isHabit = fd.get('isHabitTask') === 'on' || freq === 'habit';
											const overrides = {
												name,
												type: String(fd.get('taskType') || 'daily'),
												frequencyType: isHabit ? 'habit' : (isReading ? 'reading' : freq),
												reward: Math.max(0, parseInt(fd.get('taskReward')) || 1),
												startDate: String(fd.get('taskStart') || getLocalDateKey(0)),
												deadline: String(fd.get('taskDeadline') || ''),
											};
											if (isHabit) {
												const isEye = name.includes('眼');
												const isWater = name.includes('水');
												const isRope = name.includes('跳绳') || name.includes('跑');
												const isTooth = name.includes('牙');
												const isSleep = name.includes('睡');
												const hasTarget = !isEye && (isWater || isRope || isTooth);
												const targetCount = isWater ? 8 : isRope ? 500 : isTooth ? 2 : (isEye ? 0 : 1);
												overrides.isHabit = true;
												overrides.targetCount = hasTarget ? targetCount : 0;
												overrides.habitConfig = {
													isHabit: true,
													icon: isWater ? '💧' : isEye ? '👀' : isRope ? '🏃' : isTooth ? '🪥' : isSleep ? '🛏️' : '🌱',
													mode: (isWater || isRope || isTooth || isEye) ? 'count' : 'check',
													hasTarget,
													targetCount,
													unit: isWater ? '杯' : isRope ? '下' : '次',
													color: isWater ? 'sky' : (isRope ? 'amber' : (isSleep ? 'purple' : 'emerald'))
												};
											} else if (isReading) {
												overrides.readingConfig = {
													isReading: true,
													bookTitle: name,
													author: '',
													coverEmoji: '📖',
													period: 'weekly',
													mode: 'pages',
													totalPages: 180,
													totalChapters: 12,
													dailyTargetMinutes: 20,
													targetCount: 180,
													currentProgress: 0,
													grandReward: 30,
													overdueGrandReward: 20,
													notes: []
												};
											} else if (freq === 'count') {
												overrides.targetCount = Math.max(1, parseInt(fd.get('taskTarget')) || 10);
											}
											const newId = handleAddTask(overrides);
											setShowAddTaskModal(false);
											setTaskSearch(''); setTaskTypeFilter(''); setTaskFreqFilter('');
											setExpandedTaskId(newId);
										};
										const addDefaultDeadline = (() => { const d = new Date(); d.setMonth(d.getMonth() + 3); return dateObjToLocalKey(d); })();
										return (
											<div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddTaskModal(false)}>
												<form onSubmit={submitNewTask} onClick={e => e.stopPropagation()} translate="no" className="notranslate task-sheet bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl px-5 pt-3 sm:p-6 space-y-4 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
													<div className="sm:hidden w-10 h-1 bg-slate-200 rounded-full mx-auto mb-1"></div>
													<div className="flex items-center justify-between pb-1 border-b border-slate-100">
														<h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
															<Plus className="w-5 h-5 text-indigo-500" /> 添加新项目
														</h3>
														<button type="button" onClick={() => setShowAddTaskModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
															<XIcon className="w-5 h-5" />
														</button>
													</div>
													<div>
														<label className="text-xs text-slate-500 font-bold block mb-1">项目名称 *</label>
														<input name="taskName" type="text" required autoFocus autoComplete="off" translate="no" placeholder="例如：奥数每日一练 或 喝水8杯" className="notranslate w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all font-medium" />
													</div>
													<div className="space-y-1.5">
														<label className="flex items-center gap-2.5 p-2 rounded-xl bg-amber-50/70 border border-amber-200/80 cursor-pointer">
															<input name="isReadingTask" type="checkbox" className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer" />
															<span className="text-xs font-bold text-amber-900">📚 作为阅读必读书目创建 (开启伴读模式)</span>
														</label>
														<label className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 cursor-pointer">
															<input name="isHabitTask" type="checkbox" className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer" />
															<span className="text-xs font-bold text-emerald-900">🌱 作为生活习惯规范创建 (轻量打卡·进入元气悬浮球)</span>
														</label>
													</div>
													<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
														<div>
															<label className="text-xs text-slate-500 font-bold block mb-1">类型</label>
															<select name="taskType" defaultValue="daily" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 font-medium">
																<option value="daily">🍃 日常任务</option>
																<option value="core">⭐ 核心任务</option>
															</select>
														</div>
														<div>
															<label className="text-xs text-slate-500 font-bold block mb-1">频次</label>
															<select name="taskFreq" defaultValue="count" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 font-medium">
																<option value="count">按总次数</option>
																<option value="daily_must">每日必做</option>
																<option value="weekly_optional">每周选做</option>
																<option value="habit">🌱 生活习惯</option>
															</select>
														</div>
													</div>
													<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
														<div>
															<label className="text-xs text-slate-500 font-bold block mb-1">单次奖励（金元宝）</label>
															<input name="taskReward" type="number" min="0" defaultValue="1" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 font-bold text-amber-600" />
														</div>
														<div>
															<label className="text-xs text-slate-500 font-bold block mb-1">目标次数 <span className="text-[10px] text-slate-400 font-normal">仅按次数生效</span></label>
															<input name="taskTarget" type="number" min="1" defaultValue="10" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 font-bold text-slate-700" />
														</div>
													</div>
													<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
														<div>
															<label className="text-xs text-indigo-600 font-bold block mb-1">开始日期</label>
															<input name="taskStart" type="date" defaultValue={getLocalDateKey(0)} className="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm text-indigo-700 font-medium outline-none focus:border-indigo-400" />
														</div>
														<div>
															<label className="text-xs text-rose-500 font-bold block mb-1">截止日期</label>
															<input name="taskDeadline" type="date" defaultValue={addDefaultDeadline} className="w-full px-3 py-2 bg-rose-50/50 border border-rose-100 rounded-xl text-sm text-rose-600 font-medium outline-none focus:border-rose-400" />
														</div>
													</div>
													<p className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">💡 多次打卡、转盘触发、学业关联等高级配置，创建后会自动打开编辑卡供设置。</p>
													<button type="submit" className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer">创建任务</button>
												</form>
											</div>
										);
									})()}
								</>
							);
						})()}
						</>
                       )}

                       {activeSettingsTab === 'evil' && (
                        <div className="space-y-4">
                            <section className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-rose-950/80 shadow-md space-y-4">
                                <div className="border-b border-slate-800 pb-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-rose-400 flex items-center gap-2 text-base">
                                            <Skull className="w-5 h-5 text-rose-500" /> 惩罚机制 (家长专用)
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                                            家长权限
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        ⚠️ 此机制供特殊警示教育使用，转盘抽出的负值结果将真实扣除孩子账上的金元宝。
                                    </p>
                                </div>

                                {/* 自动惩罚开关与定制条件 */}
                                <div className="p-4 bg-slate-800/70 rounded-xl border border-slate-700/70 space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                                                <span>⚡</span> 自动天罚机制 (戒律惩罚)
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                                次日首次打卡时，若昨日未达成设定戒律条件，将自动开启命运审判转盘
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            <ToggleSwitch 
                                                checked={!!evilAutoTrigger} 
                                                onChange={() => setEvilAutoTrigger(!evilAutoTrigger)} 
                                                activeColor="bg-rose-600"
                                            />
                                        </div>
                                    </div>

                                    {evilAutoTrigger && (
                                        <div className="mt-2.5 pt-3 border-t border-slate-700/60 space-y-3">
                                            {/* 守护机制提示 */}
                                            <div className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-800/50 px-3 py-2 rounded-lg flex items-start gap-2 leading-relaxed">
                                                <span className="shrink-0 mt-0.5">🛡️</span>
                                                <div>
                                                    <div>守护机制：孩子道具背包中的「青铜守护盾」每日最多触发 1 次抵消。</div>
                                                    <div className="text-rose-300 font-bold mt-1">
                                                        ⚠️ 注意：自动惩罚机制下，青铜守护盾有大概率（90%）会被天罚击穿失效并碎裂，本次惩罚无法豁免！仅有极小概率（10%）奇迹防守成功。
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 触发条件定制区 */}
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                                                    <span className="flex items-center gap-1.5 text-rose-300">
                                                        <span>⚙️</span> 定制触发条件（满足任意勾选条件即触发）
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-normal">次日评估前日表现</span>
                                                </div>

                                                {/* 规则 1：前一天必做全部未做 */}
                                                <div className={`p-3 bg-slate-900/60 rounded-xl border transition-colors ${evilTriggerConfig?.mustAllUndone !== false ? 'border-rose-500/40 bg-rose-950/15' : 'border-slate-700/60'}`}>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <label className="text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={evilTriggerConfig?.mustAllUndone !== false}
                                                                onChange={(e) => {
                                                                    setEvilTriggerConfig(prev => ({
                                                                        mustAllUndone: true,
                                                                        mustRateEnabled: false,
                                                                        mustRateThreshold: 50,
                                                                        overallRateEnabled: false,
                                                                        overallRateThreshold: 40,
                                                                        consecutiveUndoneEnabled: false,
                                                                        consecutiveDays: 3,
                                                                        ...(prev || {}),
                                                                        mustAllUndone: e.target.checked
                                                                    }));
                                                                }}
                                                                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-800 border-slate-600 cursor-pointer"
                                                            />
                                                            <span>【全军覆没】昨日「每日必做」全部未做</span>
                                                        </label>
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">基础戒律</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 pl-6 mt-1 leading-relaxed">
                                                        前一日生效的所有「每日必做」任务完成数为 0 时，立即触发自动惩罚
                                                    </p>
                                                </div>

                                                {/* 规则 2：前一天必做完成比例低于设定值 */}
                                                <div className={`p-3 bg-slate-900/60 rounded-xl border transition-colors ${evilTriggerConfig?.mustRateEnabled ? 'border-rose-500/40 bg-rose-950/15' : 'border-slate-700/60'}`}>
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <label className="text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!evilTriggerConfig?.mustRateEnabled}
                                                                onChange={(e) => {
                                                                    setEvilTriggerConfig(prev => ({
                                                                        mustAllUndone: true,
                                                                        mustRateEnabled: false,
                                                                        mustRateThreshold: 50,
                                                                        overallRateEnabled: false,
                                                                        overallRateThreshold: 40,
                                                                        consecutiveUndoneEnabled: false,
                                                                        consecutiveDays: 3,
                                                                        ...(prev || {}),
                                                                        mustRateEnabled: e.target.checked
                                                                    }));
                                                                }}
                                                                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-800 border-slate-600 cursor-pointer"
                                                            />
                                                            <span>【必做不足】昨日「每日必做」完成率低于阈值</span>
                                                        </label>
                                                        {evilTriggerConfig?.mustRateEnabled && (
                                                            <span className="text-[11px] font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-800/60">
                                                                低于 {evilTriggerConfig?.mustRateThreshold || 50}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 pl-6 leading-relaxed mb-2">
                                                        前一日每日必做任务完成比例低于设定百分比时触发惩罚（如 4 项仅完成 1 项为 25%）
                                                    </p>
                                                    {evilTriggerConfig?.mustRateEnabled && (
                                                        <div className="pl-6 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                                                            <span className="text-slate-400">完成比例低于</span>
                                                            <input
                                                                type="number"
                                                                min="10"
                                                                max="90"
                                                                step="5"
                                                                value={evilTriggerConfig?.mustRateThreshold ?? 50}
                                                                onChange={(e) => {
                                                                    const val = Math.max(5, Math.min(95, parseInt(e.target.value, 10) || 50));
                                                                    setEvilTriggerConfig(prev => ({
                                                                        mustAllUndone: true,
                                                                        mustRateEnabled: false,
                                                                        mustRateThreshold: 50,
                                                                        overallRateEnabled: false,
                                                                        overallRateThreshold: 40,
                                                                        consecutiveUndoneEnabled: false,
                                                                        consecutiveDays: 3,
                                                                        ...(prev || {}),
                                                                        mustRateThreshold: val
                                                                    }));
                                                                }}
                                                                className="w-16 px-2 py-1 text-center font-bold text-rose-300 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-rose-500"
                                                            />
                                                            <span className="text-slate-400">% 触发</span>
                                                            <div className="flex gap-1.5 ml-auto">
                                                                {[30, 50, 60].map(val => (
                                                                    <button
                                                                        key={val}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setEvilTriggerConfig(prev => ({
                                                                                mustAllUndone: true,
                                                                                mustRateEnabled: false,
                                                                                mustRateThreshold: 50,
                                                                                overallRateEnabled: false,
                                                                                overallRateThreshold: 40,
                                                                                consecutiveUndoneEnabled: false,
                                                                                consecutiveDays: 3,
                                                                                ...(prev || {}),
                                                                                mustRateThreshold: val
                                                                            }));
                                                                        }}
                                                                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                                                                            evilTriggerConfig?.mustRateThreshold === val 
                                                                                ? 'bg-rose-600 text-white shadow-xs' 
                                                                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                                                                        }`}
                                                                    >
                                                                        {val}%
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 规则 3：前一天总体任务完成比例低于设定值 */}
                                                <div className={`p-3 bg-slate-900/60 rounded-xl border transition-colors ${evilTriggerConfig?.overallRateEnabled ? 'border-amber-500/40 bg-amber-950/15' : 'border-slate-700/60'}`}>
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <label className="text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!evilTriggerConfig?.overallRateEnabled}
                                                                onChange={(e) => {
                                                                    setEvilTriggerConfig(prev => ({
                                                                        mustAllUndone: true,
                                                                        mustRateEnabled: false,
                                                                        mustRateThreshold: 50,
                                                                        overallRateEnabled: false,
                                                                        overallRateThreshold: 40,
                                                                        consecutiveUndoneEnabled: false,
                                                                        consecutiveDays: 3,
                                                                        ...(prev || {}),
                                                                        overallRateEnabled: e.target.checked
                                                                    }));
                                                                }}
                                                                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-slate-600 cursor-pointer"
                                                            />
                                                            <span>【总体不足】昨日「全任务总体」完成率低于阈值</span>
                                                        </label>
                                                        {evilTriggerConfig?.overallRateEnabled && (
                                                            <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800/60">
                                                                低于 {evilTriggerConfig?.overallRateThreshold || 40}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 pl-6 leading-relaxed mb-2">
                                                        涵盖昨日全部生效待打卡任务（必做、日常习惯等），整体打卡率过低时触发
                                                    </p>
                                                    {evilTriggerConfig?.overallRateEnabled && (
                                                        <div className="pl-6 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                                                            <span className="text-slate-400">总体比例低于</span>
                                                            <input
                                                                type="number"
                                                                min="10"
                                                                max="90"
                                                                step="5"
                                                                value={evilTriggerConfig?.overallRateThreshold ?? 40}
                                                                onChange={(e) => {
                                                                    const val = Math.max(5, Math.min(95, parseInt(e.target.value, 10) || 40));
                                                                    setEvilTriggerConfig(prev => ({
                                                                        mustAllUndone: true,
                                                                        mustRateEnabled: false,
                                                                        mustRateThreshold: 50,
                                                                        overallRateEnabled: false,
                                                                        overallRateThreshold: 40,
                                                                        consecutiveUndoneEnabled: false,
                                                                        consecutiveDays: 3,
                                                                        ...(prev || {}),
                                                                        overallRateThreshold: val
                                                                    }));
                                                                }}
                                                                className="w-16 px-2 py-1 text-center font-bold text-amber-300 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-amber-400"
                                                            />
                                                            <span className="text-slate-400">% 触发</span>
                                                            <div className="flex gap-1.5 ml-auto">
                                                                {[30, 40, 50].map(val => (
                                                                    <button
                                                                        key={val}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setEvilTriggerConfig(prev => ({
                                                                                mustAllUndone: true,
                                                                                mustRateEnabled: false,
                                                                                mustRateThreshold: 50,
                                                                                overallRateEnabled: false,
                                                                                overallRateThreshold: 40,
                                                                                consecutiveUndoneEnabled: false,
                                                                                consecutiveDays: 3,
                                                                                ...(prev || {}),
                                                                                overallRateThreshold: val
                                                                            }));
                                                                        }}
                                                                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                                                                            evilTriggerConfig?.overallRateThreshold === val 
                                                                                ? 'bg-amber-600 text-white shadow-xs' 
                                                                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                                                                        }`}
                                                                    >
                                                                        {val}%
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 规则 4：单项每日必做连续 N 天未做 */}
                                                <div className={`p-3 bg-slate-900/60 rounded-xl border transition-colors ${evilTriggerConfig?.consecutiveUndoneEnabled ? 'border-purple-500/40 bg-purple-950/15' : 'border-slate-700/60'}`}>
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <label className="text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!evilTriggerConfig?.consecutiveUndoneEnabled}
                                                                onChange={(e) => {
                                                                    setEvilTriggerConfig(prev => ({
                                                                        mustAllUndone: true,
                                                                        mustRateEnabled: false,
                                                                        mustRateThreshold: 50,
                                                                        overallRateEnabled: false,
                                                                        overallRateThreshold: 40,
                                                                        consecutiveUndoneEnabled: false,
                                                                        consecutiveDays: 3,
                                                                        ...(prev || {}),
                                                                        consecutiveUndoneEnabled: e.target.checked
                                                                    }));
                                                                }}
                                                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-800 border-slate-600 cursor-pointer"
                                                            />
                                                            <span>【连续拖延】任一「每日必做」连续多天未打卡</span>
                                                        </label>
                                                        {evilTriggerConfig?.consecutiveUndoneEnabled && (
                                                            <span className="text-[11px] font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-800/60">
                                                                连续 {evilTriggerConfig?.consecutiveDays || 3} 天未做
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 pl-6 leading-relaxed mb-2">
                                                        即使其他任务完成，只要有任何单项核心必做连续多天被拖延搁置，即触发天罚
                                                     </p>
                                                    {evilTriggerConfig?.consecutiveUndoneEnabled && (
                                                        <div className="pl-6 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                                                            <span className="text-slate-400">连续天数：连续</span>
                                                            <input
                                                                type="number"
                                                                min="2"
                                                                max="7"
                                                                step="1"
                                                                value={evilTriggerConfig?.consecutiveDays ?? 3}
                                                                onChange={(e) => {
                                                                    const val = Math.max(2, Math.min(14, parseInt(e.target.value, 10) || 3));
                                                                    setEvilTriggerConfig(prev => ({
                                                                        mustAllUndone: true,
                                                                        mustRateEnabled: false,
                                                                        mustRateThreshold: 50,
                                                                        overallRateEnabled: false,
                                                                        overallRateThreshold: 40,
                                                                        consecutiveUndoneEnabled: false,
                                                                        consecutiveDays: 3,
                                                                        ...(prev || {}),
                                                                        consecutiveDays: val
                                                                    }));
                                                                }}
                                                                className="w-16 px-2 py-1 text-center font-bold text-purple-300 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-400"
                                                            />
                                                            <span className="text-slate-400">天未打卡触发</span>
                                                            <div className="flex gap-1.5 ml-auto">
                                                                {[2, 3, 5].map(val => (
                                                                    <button
                                                                        key={val}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setEvilTriggerConfig(prev => ({
                                                                                mustAllUndone: true,
                                                                                mustRateEnabled: false,
                                                                                mustRateThreshold: 50,
                                                                                overallRateEnabled: false,
                                                                                overallRateThreshold: 40,
                                                                                consecutiveUndoneEnabled: false,
                                                                                consecutiveDays: 3,
                                                                                ...(prev || {}),
                                                                                consecutiveDays: val
                                                                            }));
                                                                        }}
                                                                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                                                                            evilTriggerConfig?.consecutiveDays === val 
                                                                                ? 'bg-purple-600 text-white shadow-xs' 
                                                                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                                                                        }`}
                                                                    >
                                                                        {val}天
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 保护规则提示 */}
                                                <div className="text-[10px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                                                    <span className="text-slate-500">🛡️</span>
                                                    <span>保护豁免：处于「冰冻卡」保护日或被家长「豁免」的日期，系统会自动跳过，不计入断签违规或惩罚。</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 扇区配置与概率 */}
                                {(() => {
                                    const totalEvilWeight = evilWheelConfig.reduce((acc, cur) => acc + (Number(cur.weight) || 0), 0);
                                    return (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                                    <span>🎡</span> 邪恶转盘扇区与扣除设定
                                                </h4>
                                                <span className="text-xs text-slate-400 font-medium">
                                                    权重总和: <span className="font-bold text-rose-400">{totalEvilWeight}</span>
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2.5">
                                                {evilWheelConfig.map((item, idx) => {
                                                    const pct = totalEvilWeight > 0 ? ((Number(item.weight) / totalEvilWeight) * 100).toFixed(1) : '0';
                                                    return (
                                                        <div key={item.id} className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 shadow-2xs">
                                                            <div className="w-5 h-5 rounded-full shrink-0 border-2 border-slate-600 shadow-xs" style={{backgroundColor: item.color}} />
                                                            <div className="flex-1 grid grid-cols-3 gap-2.5">
                                                                <div>
                                                                    <label className="text-[10px] text-slate-400 font-bold block mb-0.5">惩罚名称</label>
                                                                    <input 
                                                                        className="w-full font-bold text-xs sm:text-sm text-slate-200 bg-transparent border-b border-dashed border-slate-600 focus:border-rose-400 focus:outline-none" 
                                                                        value={item.name} 
                                                                        onChange={e => { 
                                                                            const newConfig = [...evilWheelConfig]; 
                                                                            newConfig[idx].name = e.target.value; 
                                                                            setEvilWheelConfig(newConfig); 
                                                                        }} 
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] text-slate-400 font-bold block mb-0.5">扣除值 (负数)</label>
                                                                    <input 
                                                                        type="number" 
                                                                        className="w-full font-bold text-xs sm:text-sm text-rose-400 bg-transparent border-b border-dashed border-slate-600 focus:border-rose-400 focus:outline-none" 
                                                                        value={item.value} 
                                                                        onChange={e => { 
                                                                            const newConfig = [...evilWheelConfig]; 
                                                                            newConfig[idx].value = parseInt(e.target.value) || 0; 
                                                                            setEvilWheelConfig(newConfig); 
                                                                        }} 
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-0.5">
                                                                        <span>权重</span>
                                                                        <span className="text-rose-400 font-black">{pct}%</span>
                                                                    </div>
                                                                    <input 
                                                                        type="number" 
                                                                        className="w-full font-bold text-xs sm:text-sm text-slate-200 bg-transparent border-b border-dashed border-slate-600 focus:border-rose-400 focus:outline-none" 
                                                                        value={item.weight} 
                                                                        onChange={e => { 
                                                                            const newConfig = [...evilWheelConfig]; 
                                                                            newConfig[idx].weight = parseInt(e.target.value) || 0; 
                                                                            setEvilWheelConfig(newConfig); 
                                                                        }} 
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-end gap-3">
                                    <button 
                                        type="button"
                                        onClick={onTestEvilWheel} 
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 cursor-pointer border border-slate-700"
                                    >
                                        <Beaker className="w-3.5 h-3.5 text-slate-400" /> 测试转盘 (不扣元宝)
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={onLaunchEvilWheel} 
                                        className="px-4 py-2 bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-800 hover:to-red-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer border border-rose-600/50"
                                    >
                                        <Skull className="w-3.5 h-3.5 text-rose-200" /> 启动邪恶转盘 (真实扣除元宝)
                                    </button>
                                </div>
                            </section>
                        </div>
                       )}
                    </div>
                    <div className="p-4 border-t bg-white/80 backdrop-blur border-gray-100 text-right shrink-0"><button onClick={() => { clearNewTaskFlags(); setShowSettings(false); triggerSyncUpload(); }} className={`px-8 py-2.5 ${theme.primaryBg} ${theme.primaryBgHover} text-white rounded-full font-medium shadow-lg transition transform active:scale-95`}>保存并退出</button></div>
                  </div>

                  {/* 家长手机扫码配对弹窗 */}
                  {showParentQrModal && (
                      <div 
                          className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                          onClick={() => setShowParentQrModal(false)}
                      >
                          <div 
                              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-indigo-100 space-y-4 text-center animate-in zoom-in-95 duration-200"
                              onClick={e => e.stopPropagation()}
                          >
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                                      <span>📱</span> 扫码绑定家长手机
                                  </h3>
                                  <button
                                      type="button"
                                      onClick={() => setShowParentQrModal(false)}
                                      className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold cursor-pointer"
                                  >
                                      ✕
                                  </button>
                              </div>

                              {/* 选择身份 */}
                              <div>
                                  <label className="block text-xs font-bold text-slate-600 mb-2">选择要绑定的家长身份</label>
                                  <div className="grid grid-cols-3 gap-2">
                                      {['爸爸', '妈妈', '长辈'].map(role => (
                                          <button
                                              key={role}
                                              type="button"
                                              onClick={() => setSelectedParentRole(role)}
                                              className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${selectedParentRole === role ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                                          >
                                              {role === '爸爸' ? '👑 爸爸' : role === '妈妈' ? '🌸 妈妈' : '👴 长辈'}
                                          </button>
                                      ))}
                                  </div>
                              </div>

                              {/* 同步码检查与快速配置 */}
                              {!syncCode ? (
                                  <div className="bg-red-50/90 border border-red-200 rounded-2xl p-3.5 text-left space-y-2">
                                      <div className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                                          <span>⚠️</span> 尚未配置【家庭云端同步码】
                                      </div>
                                      <p className="text-[11px] text-red-600 leading-relaxed">
                                          手机看板必须通过同步码与电脑主程序联通。请在下方输入同步码并点击生效：
                                      </p>
                                      <div className="flex items-center gap-1.5">
                                          <input
                                              type="text"
                                              id="parent_sync_code_quick_input"
                                              placeholder="例如: demo_family_2026"
                                              className="flex-1 bg-white border border-red-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                                          />
                                          <button
                                              type="button"
                                              onClick={() => {
                                                  const el = document.getElementById('parent_sync_code_quick_input');
                                                  if (el && el.value.trim()) {
                                                      setSyncCode(el.value.trim());
                                                      if (syncFromCloud) syncFromCloud();
                                                  }
                                              }}
                                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                                          >
                                              保存生效
                                          </button>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-100 rounded-xl px-3 py-1.5 text-xs text-indigo-900 font-medium">
                                      <span>家庭同步码：<b className="font-mono text-indigo-700">{syncCode}</b></span>
                                      <button
                                          type="button"
                                          onClick={() => {
                                              if (triggerSyncUpload) triggerSyncUpload();
                                              showToast('success', '已触发将电脑端最新数据同步至云端！');
                                          }}
                                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                                      >
                                          ☁️ 立即同步上云
                                      </button>
                                  </div>
                              )}

                               {/* 本地开发环境网络模式选择 (解决手机扫码访问 localhost 失败问题) */}
                              {isLocalhost && (
                                  <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3 text-left space-y-2">
                                      <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                                          <span className="flex items-center gap-1.5">
                                              <span>🌐</span> 手机扫码连接网络
                                          </span>
                                          <span className="text-[10px] text-amber-700 font-medium">
                                              {networkMode === 'lan' ? '局域网 Wi-Fi 直连' : '本机模式 (localhost)'}
                                          </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-1.5">
                                          <button
                                              type="button"
                                              onClick={() => setNetworkMode('lan')}
                                              className={`py-1.5 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${networkMode === 'lan' ? 'bg-amber-500 border-amber-600 text-white shadow-xs' : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-100/50'}`}
                                          >
                                              📶 手机 Wi-Fi 扫码
                                          </button>
                                          <button
                                              type="button"
                                              onClick={() => setNetworkMode('current')}
                                              className={`py-1.5 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${networkMode === 'current' ? 'bg-amber-500 border-amber-600 text-white shadow-xs' : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-100/50'}`}
                                          >
                                              💻 电脑本机测试
                                          </button>
                                      </div>
                                      {networkMode === 'lan' && (
                                          <div className="space-y-1 pt-0.5">
                                              <div className="flex items-center gap-1 text-[11px] text-amber-900 font-medium">
                                                  <span className="shrink-0">电脑局域网IP:</span>
                                                  <input
                                                      type="text"
                                                      value={lanHost}
                                                      onChange={e => {
                                                          const val = e.target.value;
                                                          setLanHost(val);
                                                          try { localStorage.setItem('app_parent_qr_lan_host', val); } catch (err) {}
                                                      }}
                                                      className="flex-1 bg-white border border-amber-300 rounded-lg px-2 py-0.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                                                      placeholder="192.168.2.18:3000"
                                                  />
                                              </div>
                                              <p className="text-[10px] text-amber-700 leading-tight">
                                                  💡 手机与电脑需连接同一个家庭 Wi-Fi 路由器，即可扫码打开！
                                              </p>
                                          </div>
                                      )}
                                  </div>
                              )}

                              {/* 二维码展示区 */}
                              <div className="flex flex-col items-center justify-center p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                                  {qrDataUrl ? (
                                      <img src={qrDataUrl} alt="家长绑定二维码" className="w-52 h-52 rounded-xl shadow-xs" />
                                  ) : (
                                      <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400">
                                          正在生成安全二维码...
                                      </div>
                                  )}
                                  <div className="text-[11px] text-slate-500 mt-2 font-medium">
                                      请用手机微信或相机扫一扫上方二维码
                                  </div>
                              </div>

                              <div className="text-left bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 space-y-1">
                                  <div className="font-bold">✨ 扫码即完成：</div>
                                  <div>• 自动同步家庭同步码，无需手动输入</div>
                                  <div>• 绑定为【{selectedParentRole}】身份，所有赏罚打上专属印记</div>
                                  <div>• 授权该手机可远程发红包、奖转盘与施惩戒</div>
                              </div>

                              {/* 电脑新窗口免扫码快速体验按钮 */}
                              <button
                                  type="button"
                                  onClick={() => {
                                      const url = getPairingUrl();
                                      window.open(url, '_blank', 'width=420,height=850');
                                  }}
                                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
                              >
                                  <span>🖥️</span> 在电脑新窗口打开手机版 (立即免扫码体验)
                              </button>

                              <button
                                  type="button"
                                  onClick={() => {
                                      const pairingUrl = getPairingUrl();
                                      if (navigator.clipboard?.writeText) {
                                          navigator.clipboard.writeText(pairingUrl);
                                          setQrCopied(true);
                                          setTimeout(() => setQrCopied(false), 2000);
                                      }
                                  }}
                                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-98"
                              >
                                  {qrCopied ? '✅ 配对链接已复制到剪贴板！' : '🔗 复制配对链接 (可发微信打开)'}
                              </button>
                          </div>
                      </div>
                  )}
                </div>
            );
        };

export default SettingsModal;
export { SettingsModal };
