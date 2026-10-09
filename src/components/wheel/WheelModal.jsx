import React from 'react';
import { XIcon, TrendingUp, Gift, Skull, Shield, Sparkles, Coins } from '../icons.jsx';

// 任务大满贯转盘选择弹窗
export const WheelChoiceModal = ({ show, onClose, onSelect }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900/95 to-amber-950/40 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(245,158,11,0.3)] border-2 border-amber-400/40 backdrop-blur-xl text-center overflow-hidden">
                {/* 顶栏光晕与流光 */}
                <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent pointer-events-none"></div>
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-widest uppercase mb-3">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" /> 今日全勤 · 任务大满贯
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent mb-2">
                        时空星盘 · 天赐机缘
                    </h2>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                        今日所有既定修行功德圆满！时空星门已为你开启，请择一机缘拨动命运星盘：
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 金元宝转盘 */}
                        <button
                            onClick={() => onSelect('gold')}
                            className="group relative p-5 rounded-2xl bg-gradient-to-br from-amber-950/50 via-amber-900/30 to-yellow-950/40 border-2 border-amber-500/50 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all transform active:scale-95 flex flex-col items-center text-center cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform mb-3 border border-amber-200/50">
                                💰
                            </div>
                            <div className="font-black text-amber-300 text-base mb-1 group-hover:text-amber-200 transition-colors">
                                金元宝转盘
                            </div>
                            <div className="text-xs text-amber-200/70 mb-3">
                                积累万贯财富 · 招财纳福
                            </div>
                            <span className="w-full py-2 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/40 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                                拨动金宝星盘 ➔
                            </span>
                        </button>

                        {/* 经验值转盘 */}
                        <button
                            onClick={() => onSelect('xp')}
                            className="group relative p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-indigo-900/30 to-purple-950/40 border-2 border-indigo-400/50 hover:border-indigo-300 hover:shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all transform active:scale-95 flex flex-col items-center text-center cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform mb-3 border border-indigo-200/50">
                                🆙
                            </div>
                            <div className="font-black text-indigo-300 text-base mb-1 group-hover:text-indigo-200 transition-colors">
                                智慧灵泉转盘
                            </div>
                            <div className="text-xs text-indigo-200/70 mb-3">
                                倍增修行修为 · 顿悟飞升
                            </div>
                            <span className="w-full py-2 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/40 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-colors">
                                拨动灵泉星盘 ➔
                            </span>
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-6 text-xs text-slate-400 hover:text-amber-200 transition-colors underline underline-offset-4"
                    >
                        暂不开启 (稍后可在主界面手动启动)
                    </button>
                </div>
            </div>
        </div>
    );
};

// 正向转盘弹窗（金元宝/经验值）
export const WheelModal = ({
    showWheel,
    wheelResult,
    alreadyWon,
    theme,
    wheelConfig = [],
    pointerRotation = 0,
    isDemoWheel,
    setShowWheel,
    setWheelResult,
    spinWheel,
    wheelSpinning,
    isExtraReward,
    wheelType = 'gold',
}) => {
    if (!showWheel) return null;

    const isXP = wheelType === 'xp';
    const unit = isXP ? 'XP 修为' : '金元宝';

    // 主题色彩与渐变
    const modalBg = isXP
        ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border-indigo-500/40'
        : 'bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 border-amber-500/40';

    const rimGradient = isXP
        ? 'bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 shadow-[0_0_30px_rgba(99,102,241,0.4)]'
        : 'bg-gradient-to-tr from-amber-300 via-yellow-500 to-amber-700 shadow-[0_0_30px_rgba(245,158,11,0.4)]';

    const spinBtnClass = isXP
        ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-[0_10px_25px_-5px_rgba(99,102,241,0.5)] border border-cyan-300/40'
        : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.5)] border border-amber-200/40 text-slate-950';

    const centerPuckClass = isXP
        ? 'bg-gradient-to-br from-cyan-300 via-blue-500 to-indigo-700 shadow-[0_0_20px_rgba(6,182,212,0.8)] border-2 border-white'
        : 'bg-gradient-to-br from-yellow-200 via-amber-400 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.8)] border-2 border-white';

    const count = wheelConfig.length || 1;
    const angleStep = 360 / count;

    // 12颗外环跑马灯灯珠
    const bulbCount = 12;
    const bulbs = Array.from({ length: bulbCount });

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className={`relative ${modalBg} rounded-3xl w-full max-w-md p-6 shadow-2xl overflow-hidden flex flex-col items-center border-2 transition-transform duration-300 ${
                    wheelResult ? 'scale-105' : 'scale-100'
                }`}
            >
                {/* 顶部环境光 */}
                <div
                    className={`absolute top-0 left-0 right-0 h-36 ${
                        isXP
                            ? 'bg-gradient-to-b from-indigo-500/20 to-transparent'
                            : 'bg-gradient-to-b from-amber-500/20 to-transparent'
                    } pointer-events-none`}
                ></div>

                {/* 关闭按钮 */}
                <button
                    onClick={() => {
                        setShowWheel(false);
                        setWheelResult(null);
                    }}
                    className="absolute top-4 right-4 z-20 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors border border-slate-700/50"
                    title="关闭"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                {/* 标头 */}
                <div className="z-10 text-center mb-5 mt-2">
                    <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
                            isXP
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                        }`}
                    >
                        {isXP ? <TrendingUp className="w-3.5 h-3.5" /> : <Gift className="w-3.5 h-3.5" />}
                        {isXP ? '智慧灵泉 · 星辉转盘' : '财运亨通 · 聚宝星盘'}
                    </div>

                    <h2
                        className={`text-2xl font-black ${
                            isXP
                                ? 'bg-gradient-to-r from-cyan-200 via-indigo-100 to-purple-300'
                                : 'bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400'
                        } bg-clip-text text-transparent flex items-center justify-center gap-2`}
                    >
                        {isDemoWheel
                            ? `演示${isXP ? '经验' : '惊喜'}转盘`
                            : isExtraReward
                            ? `额外天赐${isXP ? '修为' : '惊喜'}！`
                            : `${isXP ? '灵泉修为' : '财富金宝'}大放送！`}
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                        {isDemoWheel
                            ? '本次抽取仅为演示试玩，不计入实际资产'
                            : `运转${isXP ? '灵泉' : '金宝'}星盘，抽取你的${isXP ? '成长修为' : '专属财富'}！`}
                    </p>
                </div>

                {!wheelResult && !alreadyWon ? (
                    <>
                        {/* 转盘主体竞技场 */}
                        <div className="relative w-72 h-72 sm:w-80 sm:h-80 mb-6 group select-none">
                            {/* 外圈装饰边框与阴影 */}
                            <div className={`absolute inset-0 rounded-full ${rimGradient} p-2`}>
                                {/* 12 颗点缀的流光灯珠 */}
                                {bulbs.map((_, i) => {
                                    const bAngle = (360 / bulbCount) * i;
                                    return (
                                        <div
                                            key={i}
                                            className="absolute top-1/2 left-1/2 w-2.5 h-2.5 -ml-1.25 -mt-1.25 rounded-full pointer-events-none"
                                            style={{
                                                transform: `rotate(${bAngle}deg) translate(0, -135px)`,
                                            }}
                                        >
                                            <div
                                                className={`w-2.5 h-2.5 rounded-full border border-white/60 shadow-sm ${
                                                    i % 2 === 0
                                                        ? 'bg-amber-200 shadow-amber-300 animate-pulse'
                                                        : 'bg-white shadow-cyan-300'
                                                }`}
                                            ></div>
                                        </div>
                                    );
                                })}

                                {/* 转盘扇形层 */}
                                <div className="w-full h-full rounded-full relative overflow-hidden bg-slate-900 border-4 border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
                                    <div
                                        className="w-full h-full rounded-full relative overflow-hidden"
                                        style={{
                                            background: `conic-gradient(${wheelConfig
                                                .map(
                                                    (item, index) =>
                                                        `${item.color} ${(index / count) * 100}% ${(
                                                            (index + 1) /
                                                            count
                                                        ) * 100}%`
                                                )
                                                .join(', ')})`,
                                        }}
                                    >
                                        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_25px_rgba(0,0,0,0.35)] pointer-events-none"></div>

                                        {/* 文字标签 */}
                                        {wheelConfig.map((item, index) => {
                                            const rotateAngle = index * angleStep + angleStep / 2;
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="absolute top-1/2 left-1/2 w-full h-full origin-top-left flex justify-center pt-3 pointer-events-none"
                                                    style={{
                                                        transform: `rotate(${rotateAngle}deg) translate(-50%, -50%)`,
                                                    }}
                                                >
                                                    <div
                                                        className="text-white font-black text-xs sm:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider mt-3"
                                                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                                                    >
                                                        {item.name}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* 3D 旋转立体指针 */}
                            <div
                                className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none z-20"
                                style={{
                                    transition: 'transform 3200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                                    transform: `rotate(${pointerRotation}deg)`,
                                }}
                            >
                                <div className="relative w-0 h-0 -mt-24">
                                    {/* 针尖 */}
                                    <div
                                        className={`absolute -left-3.5 bottom-0 w-7 h-24 ${
                                            isXP
                                                ? 'bg-gradient-to-t from-cyan-400 via-blue-500 to-indigo-600'
                                                : 'bg-gradient-to-t from-amber-400 via-red-500 to-red-600'
                                        } shadow-[0_4px_12px_rgba(0,0,0,0.6)]`}
                                        style={{ clipPath: 'polygon(50% 0, 0 100%, 100% 100%)' }}
                                    ></div>
                                    {/* 针尖高光 */}
                                    <div
                                        className="absolute -left-1 bottom-1 w-2 h-20 bg-white/40 rounded-full"
                                        style={{ clipPath: 'polygon(50% 0, 0 100%, 100% 100%)' }}
                                    ></div>
                                    {/* 针尾 */}
                                    <div
                                        className={`absolute -left-2.5 top-0 w-5 h-7 ${
                                            isXP ? 'bg-indigo-700' : 'bg-red-800'
                                        } rounded-b-full shadow-md`}
                                    ></div>
                                </div>
                            </div>

                            {/* 中心轴心宝石 */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full border-4 border-slate-800 shadow-[0_6px_15px_rgba(0,0,0,0.5)] z-30 flex items-center justify-center">
                                <div
                                    className={`w-8 h-8 ${centerPuckClass} rounded-full flex items-center justify-center`}
                                >
                                    <div className="w-2.5 h-2.5 bg-white rounded-full opacity-70 blur-[0.5px]"></div>
                                </div>
                            </div>
                        </div>

                        {/* 抽奖操作按钮 */}
                        <button
                            onClick={spinWheel}
                            disabled={wheelSpinning}
                            className={`w-full py-4 rounded-2xl font-black text-lg transition-all transform active:scale-95 cursor-pointer ${
                                wheelSpinning ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : spinBtnClass
                            }`}
                        >
                            {wheelSpinning ? (
                                <span className="inline-flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 animate-spin" /> 好运运转中... 祈愿降临！
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2">
                                    ✨ 拨动命运星针 (点击旋转)
                                </span>
                            )}
                        </button>
                    </>
                ) : (
                    /* 获奖庆祝舞台 */
                    <div className="text-center py-6 px-4 animate-in fade-in zoom-in-95 duration-500 w-full flex flex-col items-center">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400/20 via-yellow-500/10 to-transparent border border-amber-400/40 flex items-center justify-center text-6xl shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-bounce">
                                {isXP ? '🆙' : '💰'}
                            </div>
                            <div className="absolute -top-2 -right-2 text-2xl animate-spin">✨</div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-2">
                            🎉 恭喜斩获天赐奖励
                        </div>

                        <div
                            className={`text-4xl sm:text-5xl font-black mb-6 ${
                                isXP
                                    ? 'bg-gradient-to-r from-cyan-200 via-indigo-100 to-purple-300'
                                    : 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500'
                            } bg-clip-text text-transparent drop-shadow-md`}
                        >
                            +{wheelResult?.value || alreadyWon} {unit}
                        </div>

                        <button
                            onClick={() => {
                                setShowWheel(false);
                                setWheelResult(null);
                            }}
                            className={`w-full max-w-xs py-3.5 rounded-2xl font-black text-base transition-all transform active:scale-95 cursor-pointer ${
                                isXP
                                    ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30'
                            }`}
                        >
                            开心收下
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// 邪恶惩罚转盘弹窗（命运的审判）
export const EvilWheelModal = ({
    show,
    onClose,
    wheelConfig = [],
    pointerRotation = 0,
    spinWheel,
    wheelSpinning,
    result,
    isDemo,
    source = 'auto',
    hasShield = false,
    reason = '',
    profiles = [],
    activeChild = '',
    onSwitchUser = () => {},
}) => {
    if (!show) return null;

    const count = wheelConfig.length || 1;
    const angleStep = 360 / count;

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
            <div className="relative bg-gradient-to-b from-slate-950 via-red-950/80 to-slate-950 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] overflow-hidden flex flex-col items-center border-2 border-red-700/60 my-auto">
                {/* 顶部血色暗涌 */}
                <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-red-600/20 via-red-900/10 to-transparent pointer-events-none"></div>

                {/* 多成员快速切换栏：允许其他家庭成员正常切换并使用 */}
                {profiles && profiles.length > 1 && (
                    <div className="w-full mb-3 pb-2.5 border-b border-red-900/50 flex items-center justify-between gap-2 z-20">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs">👤</span>
                            <div className="text-xs font-bold text-rose-300 truncate">
                                受罚成员：<span className="text-white font-black">{activeChild}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[11px] text-slate-400 font-medium">切换:</span>
                            <div className="flex items-center gap-1 max-w-[13rem] overflow-x-auto no-scrollbar">
                                {profiles.map(p => {
                                    const isCurrent = p.name === activeChild;
                                    return (
                                        <button
                                            key={p.id || p.name}
                                            type="button"
                                            disabled={wheelSpinning}
                                            onClick={() => {
                                                if (!isCurrent) {
                                                    onSwitchUser(p.name);
                                                }
                                            }}
                                            className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                                                isCurrent
                                                    ? 'bg-rose-900/90 border-rose-500 text-white shadow-xs'
                                                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                                            } ${wheelSpinning ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                                            title={isCurrent ? `当前受罚成员【${p.name}】` : `切换为【${p.name}】`}
                                        >
                                            {p.avatar ? (
                                                <img src={p.avatar} alt={p.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                                            ) : (
                                                <span className="w-3.5 h-3.5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] text-white">
                                                    {(p.name || '孩')[0]}
                                                </span>
                                            )}
                                            <span className="truncate max-w-[3.5rem]">{p.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {isDemo && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors border border-slate-700/50 cursor-pointer"
                        title="关闭演示"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                )}

                <div className="z-10 text-center mb-5 mt-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/40 border border-red-600/40 text-red-300 text-xs font-black tracking-widest uppercase mb-2">
                        <Skull className="w-3.5 h-3.5 animate-pulse text-red-500" />
                        {isDemo ? '测试演练模式 (不计处罚)' : (source === 'auto' ? '天道裁决 · 戒律惩戒' : '命运审判殿堂 · 终局裁决')}
                    </div>
                    <h2 className="text-2xl font-black bg-gradient-to-r from-red-400 via-rose-200 to-red-500 bg-clip-text text-transparent">
                        {isDemo ? '命运审判转盘演示' : (source === 'auto' ? '天道惩戒 · 审判降临' : '严明自律 · 审判降临')}
                    </h2>
                    <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
                        {isDemo 
                            ? '仅供测试审判转盘概率与物理旋转表现' 
                            : (source === 'auto' 
                                ? (reason ? `🚨 触发戒律：${reason}。天道严明，守护盾大概率击穿失效...` : '昨日打卡未达成戒律标准！天道严明，青铜守护盾大概率击穿失效...') 
                                : (reason ? `事由：${reason}` : '直面懈怠的代价，接受审判并砥砺前行...'))}
                    </p>
                </div>

                {!result ? (
                    <>
                        {/* 审判转盘主体 */}
                        <div className="relative w-72 h-72 sm:w-80 sm:h-80 mb-6 group select-none">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-slate-800 via-red-950 to-black shadow-[0_0_35px_rgba(220,38,38,0.4)] p-2">
                                <div className="w-full h-full rounded-full relative overflow-hidden border-4 border-red-900/80 bg-slate-950 shadow-[inset_0_0_25px_rgba(0,0,0,0.8)]">
                                    <div
                                        className="w-full h-full rounded-full relative overflow-hidden"
                                        style={{
                                            background: `conic-gradient(${wheelConfig
                                                .map(
                                                    (item, index) =>
                                                        `${item.color} ${(index / count) * 100}% ${(
                                                            (index + 1) /
                                                            count
                                                        ) * 100}%`
                                                )
                                                .join(', ')})`,
                                        }}
                                    >
                                        <div className="absolute inset-0 rounded-full bg-black/40 pointer-events-none"></div>
                                        {wheelConfig.map((item, index) => {
                                            const rotateAngle = index * angleStep + angleStep / 2;
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="absolute top-1/2 left-1/2 w-full h-full origin-top-left flex justify-center pt-3 pointer-events-none"
                                                    style={{
                                                        transform: `rotate(${rotateAngle}deg) translate(-50%, -50%)`,
                                                    }}
                                                >
                                                    <div
                                                        className="text-white font-black text-xs sm:text-sm tracking-wider mt-3"
                                                        style={{ textShadow: '0 2px 5px rgba(0,0,0,0.9)' }}
                                                    >
                                                        {item.name}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* 裁决利刃指针 */}
                            <div
                                className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none z-20"
                                style={{
                                    transition: 'transform 3200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                                    transform: `rotate(${pointerRotation}deg)`,
                                }}
                            >
                                <div className="relative w-0 h-0 -mt-24">
                                    <div
                                        className="absolute -left-3.5 bottom-0 w-7 h-26 bg-gradient-to-t from-slate-300 via-red-600 to-red-800 shadow-[0_0_15px_rgba(239,68,68,0.7)]"
                                        style={{ clipPath: 'polygon(50% 0, 0 100%, 100% 100%)' }}
                                    ></div>
                                    <div className="absolute -left-4 bottom-0 w-8 h-2 bg-red-950 rounded-sm"></div>
                                </div>
                            </div>

                            {/* 审判之眼中心纽扣 */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900 rounded-full border-2 border-red-600 shadow-[0_0_15px_rgba(239,68,68,0.6)] z-30 flex items-center justify-center">
                                <div className="w-3.5 h-3.5 bg-red-600 rounded-full animate-ping"></div>
                            </div>
                        </div>

                        {hasShield && !isDemo && (
                            <div className={`w-full max-w-xs mb-3 text-xs font-semibold px-3 py-2 rounded-xl border flex items-center justify-center gap-2 transition-all text-center ${
                                source === 'auto'
                                    ? 'bg-amber-950/60 border-amber-600/40 text-amber-300'
                                    : 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300'
                            }`}>
                                <Shield className={`w-4 h-4 shrink-0 ${source === 'auto' ? 'text-amber-400' : 'text-emerald-400'}`} />
                                <span>
                                    {source === 'auto'
                                        ? '已备青铜守护盾（⚠️天罚严惩下大概率击穿失效）'
                                        : '已备青铜守护盾（若受罚将自动触发神圣抵消）'}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={spinWheel}
                            disabled={wheelSpinning}
                            className={`w-full py-4 rounded-2xl font-black text-lg transition-all transform active:scale-95 cursor-pointer ${
                                wheelSpinning
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-red-800 via-rose-700 to-red-900 hover:from-red-700 hover:to-rose-600 text-white shadow-[0_10px_25px_-5px_rgba(220,38,38,0.5)] border border-red-500/40'
                            }`}
                        >
                            {wheelSpinning ? '命运天平裁决中...' : '启动命运审判 ⚖️'}
                        </button>
                    </>
                ) : (
                    /* 审判结算 */
                    <div className="text-center py-6 px-4 animate-in zoom-in-95 duration-500 w-full flex flex-col items-center">
                        <div className="text-6xl mb-3 grayscale">💸</div>
                        <h3 className="text-xl font-black text-slate-300 mb-1">裁决结果</h3>
                        <div className="text-4xl font-black text-red-500 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                            {result.value} 金元宝
                        </div>

                        {result.shieldPierced && (
                            <div className="mb-5 text-rose-200 font-bold bg-gradient-to-r from-red-950/90 via-rose-950/80 to-slate-900/90 p-4 rounded-2xl border-2 border-rose-500/70 flex items-start gap-3 text-xs shadow-[0_0_30px_rgba(244,63,94,0.35)] text-left animate-in zoom-in-95 duration-300">
                                <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 shrink-0 text-2xl leading-none">
                                    💥
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-black text-rose-300 flex items-center gap-1.5">
                                        <span>青铜守护盾被天罚击穿失效！</span>
                                    </div>
                                    <p className="text-rose-200/90 leading-relaxed font-medium">
                                        {reason ? `因「${reason}」，神圣护盾碎裂击穿，无法抵挡天道惩戒！` : '昨日全天任务未达标，神圣护盾碎裂击穿，无法抵挡天道惩戒！'}本次惩罚正常扣除，消耗 1 面青铜守护盾。
                                    </p>
                                </div>
                            </div>
                        )}

                        {result.usedShield && (
                            <div className="mb-5 text-emerald-300 font-bold bg-emerald-950/50 p-3 rounded-2xl border border-emerald-500/40 flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                <Shield className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
                                <span>青铜守护盾生效！神圣庇佑已成功抵消本次惩罚！（今日已用 1/1 次）</span>
                            </div>
                        )}

                        {result.shieldLimitReached && (
                            <div className="mb-5 text-amber-300 font-bold bg-amber-950/60 p-3 rounded-2xl border border-amber-500/40 flex items-center gap-2 text-xs shadow-sm">
                                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>青铜守护盾今日触发已达上限（每日限1次），本次惩罚无法抵消</span>
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full max-w-xs py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-colors cursor-pointer"
                        >
                            {isDemo ? '关闭测试' : '谨遵法旨 · 勉力自新'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WheelModal;
