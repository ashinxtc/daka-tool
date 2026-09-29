import React, { useState } from 'react';
import { XIcon, Sparkles, Lock, CheckCircle2, Palette } from '../icons.jsx';
import { COLOR_PALETTES } from '../../data/themes.js';

// 主题选择与个性更衣室弹窗
export const ThemeSelectionModal = ({ 
    show, 
    onClose, 
    currentTheme, 
    onSelectTheme, 
    unlockedThemes = [], 
    showToast: propShowToast 
}) => {
    // 保证 Hook 在组件顶层无条件执行
    const [hoveredThemeId, setHoveredThemeId] = useState(null);

    if (!show) return null;

    const showToast = propShowToast || (typeof window !== 'undefined' && window.showToast) || ((type, msg) => alert(msg));
    const allPalettes = Object.values(COLOR_PALETTES);

    const handleClose = (cancelled = true) => {
        onClose(cancelled);
    };

    const isLockedTheme = (id) => (id === 'theme_cyber' || id === 'dunhuang') && !unlockedThemes.includes(id);

    const handleThemeClick = (p) => {
        if (isLockedTheme(p.id)) {
            showToast('warning', `【${p.name}】为时空市集专属典藏，请先在市集中购买并使用相应装扮卡以解锁。`);
            return;
        }
        onSelectTheme(p.id);
        showToast('success', `已成功切换为「${p.name}」主题！`);
    };

    // 经典四季与典藏限定分组
    const classicThemes = allPalettes.filter(p => p.id !== 'dunhuang' && p.id !== 'theme_cyber');
    const mythicalThemes = allPalettes.filter(p => p.id === 'dunhuang' || p.id === 'theme_cyber');

    // 当前试衣间微缩预览所呈现的主题
    const activePreviewId = hoveredThemeId || currentTheme?.id || 'amber';
    const previewTheme = COLOR_PALETTES[activePreviewId] || currentTheme;
    const isCurrentActive = currentTheme?.id === previewTheme?.id;
    const isPreviewLocked = isLockedTheme(previewTheme?.id);

    return (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
            <div className="bg-white/95 rounded-3xl w-full max-w-xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-white/60 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200">
                {/* 弹窗顶部标头 */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-white shadow-md shadow-amber-200/50">
                            <Palette className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1.5">
                                空间华彩 · 主题试衣间
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/60">
                                    全站实时生效
                                </span>
                            </h3>
                            <p className="text-xs text-gray-400">悬停可即刻在上方微缩沙盘试穿，点击即刻换装</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="关闭"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
                    {/* 微缩试衣沙盘 (Mini-Mockup Preview) */}
                    <div className="relative rounded-2xl p-3.5 border border-gray-200/80 shadow-sm overflow-hidden transition-all duration-300 bg-gradient-to-br from-slate-900/5 to-slate-900/10">
                        {/* 动态主题氛围底色 */}
                        <div className={`absolute inset-0 opacity-15 bg-gradient-to-r ${previewTheme?.gradient || 'from-amber-400 to-yellow-500'} pointer-events-none transition-all duration-500`} />
                        
                        <div className="relative flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                <span className="text-[11px] font-bold text-gray-700">沙盘试穿视效：{previewTheme?.name}</span>
                                {isCurrentActive && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500 text-white">
                                        当前装配
                                    </span>
                                )}
                                {isPreviewLocked && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-700 text-amber-200 flex items-center gap-0.5">
                                        <Lock className="w-2.5 h-2.5" /> 需市集解锁
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-400">微缩看板模拟</span>
                        </div>

                        {/* 拟态迷你看板 */}
                        <div className="rounded-xl border border-white/80 bg-white/90 p-3 shadow-inner space-y-2">
                            {/* 迷你顶栏 */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                                        🌟
                                    </div>
                                    <span className="text-xs font-bold text-gray-800">打卡小勇士</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${previewTheme?.lightBg} ${previewTheme?.primary}`}>
                                        Lv.5 状元郎
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                                    <span>💰 1,280</span>
                                </div>
                            </div>

                            {/* 迷你任务卡 */}
                            <div className={`p-2 rounded-lg border ${previewTheme?.border} ${previewTheme?.lightBg} flex items-center justify-between transition-colors duration-300`}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-md ${previewTheme?.primaryBg} flex items-center justify-center text-white text-[10px]`}>
                                        ✓
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-800">早读经典古诗《将进酒》</div>
                                        <div className="text-[10px] text-gray-400">专注 20 分钟 · 基础 +15 💰</div>
                                    </div>
                                </div>
                                <button className={`text-[10px] font-bold px-2 py-1 rounded-md text-white ${previewTheme?.primaryBg} shadow-sm`}>
                                    打卡
                                </button>
                            </div>

                            {/* 迷你彩带底栏 */}
                            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                <div className={`h-full w-3/4 rounded-full bg-gradient-to-r ${previewTheme?.gradient}`} />
                            </div>
                        </div>
                    </div>

                    {/* 分组一：经典四季 */}
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-xs font-bold text-gray-700 tracking-wider">🌿 经典四季 · 随心畅换</span>
                            <div className="h-px flex-1 bg-gray-200/70" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {classicThemes.map((p) => {
                                const isSelected = currentTheme?.id === p.id;
                                const isHovered = hoveredThemeId === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onMouseEnter={() => setHoveredThemeId(p.id)}
                                        onMouseLeave={() => setHoveredThemeId(null)}
                                        onClick={() => handleThemeClick(p)}
                                        className={`group relative p-2.5 rounded-xl border text-left transition-all duration-200 flex items-center gap-2.5 ${
                                            isSelected 
                                                ? `bg-white border-2 shadow-md scale-[1.02] ${p.border} ring-2 ${p.ring}` 
                                                : isHovered
                                                ? 'bg-gray-50/90 border-gray-300 shadow-sm'
                                                : 'bg-white border-gray-200/80 hover:border-gray-300'
                                        }`}
                                    >
                                        {/* 色彩圆珠 */}
                                        <div className={`w-8 h-8 rounded-full shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110 flex items-center justify-center text-white ${p.primaryBg}`}>
                                            {isSelected && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-bold truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {p.name}
                                                </span>
                                                {isSelected && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                )}
                                            </div>
                                            <span className="text-[10px] text-gray-400 block truncate">
                                                {isSelected ? '正在使用' : '点击装配'}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 分组二：时空幻境与国风典藏 */}
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-xs font-bold text-gray-700 tracking-wider">📜 典藏幻境 · 时空限定</span>
                            <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded-full">
                                市集专属
                            </span>
                            <div className="h-px flex-1 bg-gray-200/70" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {mythicalThemes.map((p) => {
                                const isSelected = currentTheme?.id === p.id;
                                const isHovered = hoveredThemeId === p.id;
                                const locked = isLockedTheme(p.id);
                                const isCyber = p.id === 'theme_cyber';
                                const isDunhuang = p.id === 'dunhuang';
                                
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onMouseEnter={() => setHoveredThemeId(p.id)}
                                        onMouseLeave={() => setHoveredThemeId(null)}
                                        onClick={() => handleThemeClick(p)}
                                        className={`group relative p-3 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 overflow-hidden ${
                                            locked 
                                                ? 'bg-stone-50 border-stone-200 opacity-90' 
                                                : isSelected 
                                                ? 'bg-white border-2 border-amber-500 shadow-lg scale-[1.02] ring-2 ring-amber-300' 
                                                : isHovered
                                                ? 'bg-amber-50/40 border-amber-200 shadow-md'
                                                : 'bg-white border-gray-200/80 hover:border-amber-200'
                                        }`}
                                    >
                                        {/* 渐变流光色块 */}
                                        <div 
                                            className={`w-10 h-10 rounded-xl shrink-0 shadow-md flex items-center justify-center text-white transition-transform duration-200 group-hover:scale-105 ${
                                                isCyber 
                                                    ? 'bg-gradient-to-br from-fuchsia-600 via-indigo-600 to-cyan-500 shadow-fuchsia-500/30' 
                                                    : isDunhuang 
                                                    ? 'bg-gradient-to-br from-amber-600 via-yellow-600 to-blue-800 shadow-amber-500/30' 
                                                    : p.primaryBg
                                            }`}
                                        >
                                            {locked ? (
                                                <Lock className="w-5 h-5 text-amber-200 drop-shadow" />
                                            ) : isSelected ? (
                                                <CheckCircle2 className="w-5 h-5 text-white stroke-[2.5]" />
                                            ) : (
                                                <Sparkles className="w-5 h-5 text-white/90" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-900 truncate">
                                                    {p.name}
                                                </span>
                                                {locked ? (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-600">
                                                        未解锁
                                                    </span>
                                                ) : isSelected ? (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                                        装配中
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                                                        已珍藏
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                                                {isCyber ? '赛博霓虹 · 极光穿梭' : '戈壁鸣沙 · 青金琉璃'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 底部操作与提示 */}
                <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[11px] text-gray-400">
                        💡 切换后主题色彩将无缝应用于任务看板、图表光晕与计时仪表盘
                    </p>
                    <button
                        onClick={() => handleClose(false)}
                        className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                        完成设置
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeSelectionModal;
