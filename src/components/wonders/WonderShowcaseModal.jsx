import React, { useState, useEffect, useRef } from 'react';
import { WONDERS_DATA, WONDER_TYPE_CONFIG } from '../../data/wondersData';
import { Wonder3DViewer } from './three/Wonder3DViewer';

/**
 * 【时空营造司 · 奇迹部件 3D 检视展厅】
 * 全面基于 WebGL / Three.js 实时 3D 沙盘建模管线
 * 供用户与设计师检视各建造阶段、零部件拆解合理性、PBR 真实感光影与物理拼装动效
 */
export const WonderShowcaseModal = ({ isOpen, onClose, initialWonderId = 'zhouyuan_temple' }) => {
    const [selectedWonderId, setSelectedWonderId] = useState(initialWonderId);
    const [currentStage, setCurrentStage] = useState(WONDERS_DATA[initialWonderId]?.stagesCount || 5); // 默认展示竣工阶段
    const [isConstructing, setIsConstructing] = useState(false);
    const [activePartId, setActivePartId] = useState(null);
    const [activePartDetail, setActivePartDetail] = useState(null);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const autoPlayTimerRef = useRef(null);

    const wonder = WONDERS_DATA[selectedWonderId];
    const typeConfig = WONDER_TYPE_CONFIG[wonder.type];

    // 切换奇迹时重置阶段
    const handleSelectWonder = (wonderId) => {
        stopAutoPlay();
        setSelectedWonderId(wonderId);
        const newWonder = WONDERS_DATA[wonderId];
        setCurrentStage(newWonder.stagesCount);
        setActivePartId(null);
        setActivePartDetail(null);
    };

    // 拼装演进动画播放
    const startAutoPlay = () => {
        setIsAutoPlaying(true);
        setCurrentStage(0);
        let stage = 0;
        const maxStage = wonder.stagesCount;

        if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);

        autoPlayTimerRef.current = setInterval(() => {
            stage += 1;
            if (stage > maxStage) {
                clearInterval(autoPlayTimerRef.current);
                setIsAutoPlaying(false);
            } else {
                setCurrentStage(stage);
            }
        }, 1600);
    };

    const stopAutoPlay = () => {
        if (autoPlayTimerRef.current) {
            clearInterval(autoPlayTimerRef.current);
            autoPlayTimerRef.current = null;
        }
        setIsAutoPlaying(false);
    };

    useEffect(() => {
        return () => {
            if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
        };
    }, []);

    if (!isOpen) return null;

    // 当前阶段的信息
    const currentStageInfo = currentStage > 0 ? wonder.stages[currentStage - 1] : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-stone-900 border border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden text-stone-100">
                {/* 顶栏 Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/60 border-b border-amber-700/30">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">🏛️</span>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h2 className="text-xl font-bold tracking-wide text-amber-200">
                                    时空营造司 · 奇迹部件 3D 展厅
                                </h2>
                                <span className={`px-2 py-0.5 text-xs rounded-full border ${
                                    wonder.eraIndex === 2
                                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                        : wonder.eraIndex === 1
                                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                }`}>
                                    {wonder.eraIndex === 2 ? '纪元三 · 周·礼制与争鸣' : wonder.eraIndex === 1 ? '纪元二 · 文明初曙' : '纪元一 · 远古之路'}
                                </span>
                            </div>
                            <p className="text-xs text-stone-400 mt-0.5">
                                WebGL 实时 3D 建模沙盘 · 360° 物理级联建造与文博级三维工艺还原
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* 奇迹切换 Tab */}
                        <div className="flex bg-stone-800/80 p-1 rounded-xl border border-stone-700">
                            <button
                                data-wonder-id="banpo_hut"
                                onClick={() => handleSelectWonder('banpo_hut')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    selectedWonderId === 'banpo_hut'
                                        ? 'bg-amber-600 text-white shadow-md'
                                        : 'text-stone-400 hover:text-stone-200'
                                }`}
                            >
                                🏕️ 半坡中央大草庐 (20件)
                            </button>
                            <button
                                data-wonder-id="liangzhu_altar"
                                onClick={() => handleSelectWonder('liangzhu_altar')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    selectedWonderId === 'liangzhu_altar'
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'text-stone-400 hover:text-stone-200'
                                }`}
                            >
                                👑 良渚莫角山神台 (40件)
                            </button>
                            <button
                                data-wonder-id="erlitou_palace"
                                onClick={() => handleSelectWonder('erlitou_palace')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    selectedWonderId === 'erlitou_palace'
                                        ? 'bg-teal-600 text-white shadow-md'
                                        : 'text-stone-400 hover:text-stone-200'
                                }`}
                            >
                                🏛️ 二里头夏都一号宫殿 (20件)
                            </button>
                            <button
                                data-wonder-id="sanxingdui_shrine"
                                onClick={() => handleSelectWonder('sanxingdui_shrine')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    selectedWonderId === 'sanxingdui_shrine'
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'text-stone-400 hover:text-stone-200'
                                }`}
                            >
                                🌳 三星堆青铜神庙 (40件)
                            </button>
                            <button
                                data-wonder-id="zhouyuan_temple"
                                onClick={() => handleSelectWonder('zhouyuan_temple')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    selectedWonderId === 'zhouyuan_temple'
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-stone-400 hover:text-stone-200'
                                }`}
                            >
                                🛕 周原岐邑凤雏周庙 (20件)
                            </button>
                        </div>

                        {/* 关闭按钮 */}
                        <button
                            onClick={onClose}
                            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                            title="关闭展厅"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 主内容区域：左右双栏 */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                    {/* 左侧栏 (5列)：奇迹档案、阶段控制器、零部件列表 */}
                    <div className="lg:col-span-5 flex flex-col h-full border-r border-stone-800 bg-stone-900/80 overflow-y-auto custom-scrollbar p-5 space-y-5">
                        {/* 奇迹概要卡片 */}
                        <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-amber-300">{wonder.name}</h3>
                                    <p className="text-xs text-amber-500/80 mt-0.5">{wonder.subtitle}</p>
                                </div>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded border ${typeConfig.badgeBg}`}>
                                    {typeConfig.name} ({typeConfig.targetDays})
                                </span>
                            </div>

                            <p className="text-xs text-stone-300 leading-relaxed bg-black/20 p-2.5 rounded-lg border border-stone-800">
                                {wonder.historyNote}
                            </p>

                            {/* 竣工加成 Buff */}
                            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-amber-950/30 border border-amber-700/30">
                                <span className="text-xl">{wonder.passiveBuff.icon}</span>
                                <div className="text-xs">
                                    <span className="font-semibold text-amber-400">竣工被动 · {wonder.passiveBuff.title}：</span>
                                    <span className="text-stone-300 ml-1">{wonder.passiveBuff.desc}</span>
                                </div>
                            </div>
                        </div>

                        {/* 阶段控制台 */}
                        <div className="p-4 rounded-xl bg-stone-800/40 border border-stone-700/50 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">建造阶段演进</span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                                        Stage {currentStage} / {wonder.stagesCount}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {/* 施工脚手架开关 */}
                                    <button
                                        onClick={() => setIsConstructing(!isConstructing)}
                                        className={`px-2.5 py-1 text-xs rounded border transition-all ${
                                            isConstructing
                                                ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                                                : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
                                        }`}
                                    >
                                        🚧 监造脚手架: {isConstructing ? '开' : '关'}
                                    </button>

                                    {/* 自动拼装演进动画 */}
                                    <button
                                        onClick={isAutoPlaying ? stopAutoPlay : startAutoPlay}
                                        className={`px-2.5 py-1 text-xs font-semibold rounded border transition-all ${
                                            isAutoPlaying
                                                ? 'bg-rose-600/30 border-rose-500 text-rose-300 animate-pulse'
                                                : 'bg-emerald-600/30 border-emerald-500 text-emerald-300 hover:bg-emerald-600/40'
                                        }`}
                                    >
                                        {isAutoPlaying ? '⏹ 停止演示' : '▶ 拼装动画演示'}
                                    </button>
                                </div>
                            </div>

                            {/* 阶段步进按钮组 */}
                            <div className="grid grid-cols-6 gap-1.5 pt-1">
                                {[...Array(wonder.stagesCount + 1)].map((_, st) => (
                                    <button
                                        key={`st_btn_${st}`}
                                        onClick={() => {
                                            stopAutoPlay();
                                            setCurrentStage(st);
                                        }}
                                        className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition-all text-center ${
                                            currentStage === st
                                                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-extrabold'
                                                : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200 hover:bg-stone-700'
                                        }`}
                                    >
                                        {st === 0 ? '规划' : `S${st}`}
                                    </button>
                                ))}
                            </div>

                            {/* 当前阶段名与说明 */}
                            <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800 text-xs">
                                {currentStage === 0 ? (
                                    <div className="text-stone-400">
                                        <span className="text-amber-400 font-semibold">【规划阶段】</span> 考古定穴与测量准绳，等待破土开工。
                                    </div>
                                ) : (
                                    <div>
                                        <div className="font-semibold text-amber-300 flex items-center justify-between">
                                            <span>第 {currentStage} 阶段 · {currentStageInfo?.name}</span>
                                            <span className="text-stone-400 text-[11px] font-normal">
                                                目标累计 {currentStageInfo?.stageTargetParts} 件
                                            </span>
                                        </div>
                                        <p className="text-stone-300 mt-1 leading-relaxed">
                                            {currentStageInfo?.desc}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 零部件清单 (按阶段分组) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                                    零部件结构分解 ({wonder.totalParts} 件)
                                </span>
                                <span className="text-[11px] text-stone-400">
                                    🔑 关键件 {wonder.keyPartsCount} / 🧱 一般件 {wonder.regularPartsCount}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {wonder.stages.map((stObj) => {
                                    const isUnlockedInCurrentStage = currentStage >= stObj.stage;
                                    const stageKeys = stObj.keyParts ? stObj.keyParts : [stObj.keyPart];
                                    const stageRegulars = stObj.regularParts;

                                    return (
                                        <div 
                                            key={`stage_group_${stObj.stage}`}
                                            className={`rounded-xl border p-3 transition-all ${
                                                isUnlockedInCurrentStage
                                                    ? 'bg-stone-800/40 border-stone-700/80'
                                                    : 'bg-stone-900/30 border-stone-800/50 opacity-50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-xs font-bold text-amber-200 flex items-center space-x-1.5">
                                                    <span>第 {stObj.stage} 阶段</span>
                                                    <span className="text-stone-400 font-normal">({stObj.name})</span>
                                                </div>
                                                <span className="text-[11px] font-mono text-stone-400">
                                                    共 {stageKeys.length + stageRegulars.length} 件
                                                </span>
                                            </div>

                                            {/* 关键零件 */}
                                            <div className="space-y-1.5">
                                                {stageKeys.map(kPart => (
                                                    <div
                                                        key={kPart.id}
                                                        data-part-id={kPart.id}
                                                        onMouseEnter={() => {
                                                            setActivePartId(kPart.id);
                                                            setActivePartDetail(kPart);
                                                        }}
                                                        onMouseLeave={() => {
                                                            setActivePartId(null);
                                                        }}
                                                        className={`p-2 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-all ${
                                                            activePartId === kPart.id
                                                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400'
                                                                : 'bg-amber-950/20 border-amber-800/40 text-stone-200 hover:bg-amber-900/30'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-base">{kPart.icon}</span>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center space-x-1.5">
                                                                    <span className="font-semibold text-amber-300">{kPart.name}</span>
                                                                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                                                                        🔑 关键零件
                                                                    </span>
                                                                </div>
                                                                <span className="text-[11px] text-stone-400 line-clamp-1">{kPart.desc}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-amber-400/80 font-mono">满卡掉落</span>
                                                    </div>
                                                ))}

                                                {/* 一般零件 */}
                                                {stageRegulars.map(rPart => (
                                                    <div
                                                        key={rPart.id}
                                                        data-part-id={rPart.id}
                                                        onMouseEnter={() => {
                                                            setActivePartId(rPart.id);
                                                            setActivePartDetail(rPart);
                                                        }}
                                                        onMouseLeave={() => {
                                                            setActivePartId(null);
                                                        }}
                                                        className={`p-2 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-all ${
                                                            activePartId === rPart.id
                                                                ? 'bg-stone-700/80 border-amber-400 text-white shadow-md ring-1 ring-amber-400'
                                                                : 'bg-stone-850/50 border-stone-800 text-stone-300 hover:bg-stone-800'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-base">{rPart.icon}</span>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center space-x-1.5">
                                                                    <span className="font-medium text-stone-200">{rPart.name}</span>
                                                                    <span className="text-[10px] text-stone-400">🧱 一般</span>
                                                                </div>
                                                                <span className="text-[11px] text-stone-400 line-clamp-1">{rPart.desc}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-stone-400 font-mono">日常打卡</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 右侧栏 (7列)：SVG 纯矢量沙盘展示区 */}
                    <div className="lg:col-span-7 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-stone-950 via-stone-900 to-black relative">
                        {/* 顶端构件悬停高亮提示条 */}
                        <div className="w-full h-12 flex items-center justify-center">
                            {activePartDetail ? (
                                <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/60 text-amber-200 text-xs flex items-center space-x-2 animate-fadeIn shadow-lg">
                                    <span className="text-base">{activePartDetail.icon}</span>
                                    <span className="font-bold">{activePartDetail.name}</span>
                                    <span className="text-amber-400/80">|</span>
                                    <span className="text-stone-300">{activePartDetail.desc}</span>
                                </div>
                            ) : (
                                <div className="text-xs text-stone-400 flex items-center space-x-1.5">
                                    <span>💡 鼠标悬停左侧构件清单，可在沙盘中高亮对应构件位置</span>
                                </div>
                            )}
                        </div>

                        {/* 聚光灯沙盘 3D 舞台 (全屏自适应，沉浸式三维空间) */}
                        <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden rounded-2xl border border-stone-800/80 my-1 bg-[#0a0806] shadow-2xl">
                            <Wonder3DViewer
                                wonderId={selectedWonderId}
                                stage={currentStage}
                                isConstructing={isConstructing}
                                activePartId={activePartId}
                                className="w-full h-full min-h-[460px]"
                            />
                        </div>

                        {/* 底端状态与沙盘尺寸规格指示 */}
                        <div className="w-full flex items-center justify-between text-[11px] text-stone-400 pt-3 border-t border-stone-800/80">
                            <div className="flex items-center space-x-3">
                                <span className="flex items-center space-x-1">
                                    <span className="w-2 h-2 rounded-full inline-block bg-cyan-400 animate-pulse"></span>
                                    <span>WebGL 实时 3D 渲染 (PBR 物理光影 + 自由视角)</span>
                                </span>
                                <span>•</span>
                                <span>360° 真实三维空间 · 物理微震级联建造动效</span>
                            </div>
                            <div className="text-stone-400 font-mono">
                                Three.js WebGL (0KB 外部大型模型依赖)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WonderShowcaseModal;
