import React, { useState, useEffect } from 'react';
import { SHOP_ITEMS, checkItemRestriction } from '../../data/shopItems';
import { Zap, Lock, Coins, XIcon, CheckCircle2, Sparkles, Shield, Gift } from '../icons';
import { getLocalDateKey } from '../../utils/date';
import { QRCodeView } from '../../utils/qrcode';

const showToast = (type, message, options) => {
    if (window.showToast) window.showToast(type, message, options);
};

// 商品分类精致图标背景映射
const getItemIconBg = (item, isLocked) => {
    if (isLocked) {
        return 'bg-gray-100 border border-gray-200/80 text-gray-400';
    }
    switch (item?.category) {
        case 'tool':
            return 'bg-gradient-to-br from-amber-50 via-orange-50/60 to-amber-100/50 border border-amber-200/70 shadow-sm';
        case 'cosmetic':
            return 'bg-gradient-to-br from-purple-50 via-pink-50/60 to-indigo-50/50 border border-purple-200/70 shadow-sm';
        case 'real':
            return 'bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-100/50 border border-emerald-200/70 shadow-sm';
        case 'box':
            return 'bg-gradient-to-br from-sky-50 via-blue-50/60 to-indigo-50/50 border border-sky-200/70 shadow-sm';
        default:
            return 'bg-gradient-to-br from-indigo-50 via-blue-50/60 to-slate-100/50 border border-indigo-200/70 shadow-sm';
    }
};

export const ShopModal = ({ 
    show, 
    onClose, 
    theme, 
    totalGold, 
    currentEra, 
    onBuy, 
    inventory = {}, 
    onUse, 
    activeBuffs = {}, 
    redeemedCoupons = [], 
    setRedeemedCoupons, 
    equippedGear, 
    stats, 
    activeChild, 
    initialTab = 'buy', 
    holidayData, 
    holidayForecast, 
    setShowTributeModal,
    shieldTriggeredToday = false
}) => {
    // 保证 React Hooks 恒定在顶部声明
    const [activeTab, setActiveTab] = useState(initialTab);
    const [buyCategory, setBuyCategory] = useState('all');
    const [verifyModal, setVerifyModal] = useState(null);
    const [verifyInputCode, setVerifyInputCode] = useState('');
    const [purchaseModal, setPurchaseModal] = useState(null);
    const [itemQty, setItemQty] = useState({});
    const [purchaseToast, setPurchaseToast] = useState(null);

    useEffect(() => {
        if (show) setActiveTab(initialTab);
    }, [show, initialTab]);

    if (!show) return null;

    const eraColors = (typeof window !== 'undefined' && window.ERA_COLORS) ? window.ERA_COLORS : ((typeof ERA_COLORS !== 'undefined') ? ERA_COLORS : {});
    const eraOrder = (typeof window !== 'undefined' && window.ERA_ORDER) ? window.ERA_ORDER : ((typeof ERA_ORDER !== 'undefined') ? ERA_ORDER : ['远古之路', '文明初曙', '周·礼制与争鸣', '秦·铁血与一统', '汉·雄风与凿空西域', '魏晋隋唐·融合与登科', '五代·乱世更迭', '宋·文道昌盛', '元·四海交融', '明·日月重开']);
    const myEraIdx = eraOrder.indexOf(currentEra);

    // 每日特惠逻辑
    const todayStr = getLocalDateKey(0);
    const dateSeed = todayStr.split('-').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    const discountIndex = dateSeed % SHOP_ITEMS.length;
    const discountItem = SHOP_ITEMS[discountIndex];

    // 动态物价通胀率
    const inflationRate = totalGold > 2000 ? 1.1 : 1.0;

    const filteredItems = SHOP_ITEMS.filter(item => {
        if (buyCategory === 'all') return true;
        return item.category === buyCategory;
    });

    const inventoryCount = Object.values(inventory).reduce((a, b) => a + (b > 0 ? b : 0), 0);
    const unverifiedCouponsCount = (redeemedCoupons || []).filter(c => c.verifyCode != null && !c.verified).length;

    return (
        <div 
            className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white/95 rounded-3xl w-full max-w-4xl h-[88vh] shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-white/80 flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
                {/* 顶部殿堂级标头 */}
                <div className={`px-6 py-4 bg-gradient-to-r ${theme.gradient} text-white flex justify-between items-center shrink-0 shadow-md relative z-10`}>
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/30">
                            🏪
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-black tracking-wide">时空集市 · 聚宝奇阁</h2>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                                    {currentEra || '盛世华章'}
                                </span>
                            </div>
                            <div className="text-white/90 text-xs flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1 bg-black/20 px-2.5 py-0.5 rounded-full text-yellow-300 font-bold border border-white/10">
                                    <Coins className="w-3.5 h-3.5" /> 财富库: <b className="text-white text-sm ml-0.5">{totalGold}</b> 💰
                                </span>
                                {purchaseToast && (
                                    <span key={purchaseToast.key} className="animate-in fade-in slide-in-from-bottom-2 text-amber-200 font-black text-xs">
                                        -{purchaseToast.cost} 💰
                                    </span>
                                )}
                                {inflationRate > 1 && (
                                    <span className="text-[10px] bg-rose-500/90 text-white font-bold px-1.5 py-0.2 rounded-md">
                                        富豪通胀 +10%
                                    </span>
                                )}
                            </div>
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

                {/* 导航标签切换栏 */}
                <div className="flex px-4 py-2.5 bg-gray-50/90 border-b border-gray-200/80 gap-2 overflow-x-auto no-scrollbar shrink-0">
                    <button 
                        onClick={() => setActiveTab('buy')} 
                        className={`px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            activeTab === 'buy' 
                                ? 'bg-white text-gray-900 shadow-sm border border-gray-200 ring-2 ring-amber-400/30' 
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                    >
                        <span>🛒 选购商品</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('inventory')} 
                        className={`relative px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            activeTab === 'inventory' 
                                ? 'bg-white text-gray-900 shadow-sm border border-gray-200 ring-2 ring-amber-400/30' 
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                    >
                        <span>🎒 我的行囊</span>
                        {inventoryCount > 0 && (
                            <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-indigo-500 text-white">
                                {inventoryCount}
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab('coupons')} 
                        className={`relative px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            activeTab === 'coupons' 
                                ? 'bg-white text-gray-900 shadow-sm border border-gray-200 ring-2 ring-amber-400/30' 
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                    >
                        <span>🎫 契约凭证</span>
                        {unverifiedCouponsCount > 0 && (
                            <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-amber-500 text-white">
                                {unverifiedCouponsCount}待核销
                            </span>
                        )}
                    </button>
                    <div className="flex-1" />
                    <button 
                        onClick={() => setShowTributeModal(true)} 
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap flex items-center gap-1"
                    >
                        <span>👑 友好邦邻进贡</span>
                    </button>
                </div>

                {/* 内容展示区 */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gradient-to-b from-gray-50/60 to-white relative">
                    {/* 背景暗纹 */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                    {/* ======================= Tab 1: 选购商品 ======================= */}
                    {activeTab === 'buy' && (
                        <div className="space-y-4">
                            {/* 分类胶囊按钮 */}
                            <div className="flex gap-2 overflow-x-auto pb-1 relative z-10 no-scrollbar">
                                {[
                                    { k: 'all', n: '全部货架', icon: '✨' },
                                    { k: 'tool', n: '时空法宝', icon: '🔮' },
                                    { k: 'cosmetic', n: '荣耀装扮', icon: '👑' },
                                    { k: 'real', n: '现实兑换', icon: '🎁' },
                                    { k: 'box', n: '神秘盲盒', icon: '📦' }
                                ].map(c => (
                                    <button 
                                        key={c.k} 
                                        onClick={() => setBuyCategory(c.k)} 
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                                            buyCategory === c.k 
                                                ? 'bg-gray-900 text-white shadow-sm scale-[1.02]' 
                                                : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span>{c.icon}</span>
                                        <span>{c.n}</span>
                                    </button>
                                ))}
                            </div>

                            {/* 商品卡片陈列网格 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 relative z-0">
                                {filteredItems.map(item => {
                                    const itemEraIdx = eraOrder.indexOf(item.era);
                                    const isLocked = itemEraIdx > myEraIdx;
                                    const isDiscounted = item.id === discountItem?.id;
                                    const basePrice = Math.floor(item.price * inflationRate);
                                    const finalPrice = isDiscounted ? Math.floor(basePrice * 0.8) : basePrice;
                                    const canAfford = totalGold >= finalPrice;

                                    const restriction = checkItemRestriction(item, holidayForecast);
                                    const isRestricted = restriction.locked;

                                    // 检查是否已拥有
                                    let isOwned = false;
                                    if (item.type === 'cosmetic_confetti') {
                                        isOwned = stats?.[activeChild]?.premiumConfetti || (inventory[item.id] > 0);
                                    } else if (item.type === 'unlock_theme' || item.type === 'cosmetic_theme') {
                                        const targetTheme = item.targetTheme || (item.type === 'unlock_theme' ? 'dunhuang' : item.id);
                                        const unlockedThemes = stats?.[activeChild]?.unlockedThemes || [];
                                        isOwned = unlockedThemes.includes(targetTheme) || (inventory[item.id] > 0);
                                    } else if (item.category && item.category.includes('cosmetic')) {
                                        const hasInInventory = (inventory[item.id] || 0) > 0;
                                        let isEquipped = false;
                                        if (equippedGear && equippedGear[activeChild]) {
                                            isEquipped = Object.values(equippedGear[activeChild]).includes(item.id);
                                        }
                                        isOwned = hasInInventory || isEquipped;
                                    }

                                    return (
                                        <div 
                                            key={item.id} 
                                            className={`bg-white rounded-3xl p-4 border transition-all relative overflow-hidden group flex flex-col justify-between ${
                                                isLocked 
                                                    ? 'border-gray-200 opacity-70 grayscale bg-gray-50' 
                                                    : isOwned
                                                    ? 'border-emerald-200/80 bg-emerald-50/20 shadow-sm'
                                                    : 'border-gray-200/80 hover:border-amber-300 hover:shadow-lg hover:-translate-y-1'
                                            }`}
                                        >
                                            {/* 纪元主题顶部装饰细条 */}
                                            {!isLocked && (eraColors[item.era] || {}) && (
                                                <div className={`absolute top-0 left-0 right-0 h-[3px] ${(eraColors[item.era] || {}).bar} opacity-70`} />
                                            )}

                                            {/* 未解锁锁链遮罩 */}
                                            {isLocked && (
                                                <div className="absolute inset-0 z-20 bg-gray-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4 text-white">
                                                    <Lock className="w-8 h-8 text-amber-300 mb-2 drop-shadow" />
                                                    <p className="text-xs font-bold">需到达文明纪元<br />「{item.era}」解锁</p>
                                                </div>
                                            )}

                                            {/* 每日特惠徽标 */}
                                            {isDiscounted && !isLocked && (
                                                <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse z-10 flex items-center gap-0.5">
                                                    <span>🔥 特惠 -20%</span>
                                                </div>
                                            )}

                                            <div>
                                                <div className="flex justify-between items-start mb-2.5">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-105 ${getItemIconBg(item, isLocked)}`}>
                                                        {item.icon}
                                                    </div>
                                                    <div className={`px-2.5 py-1 rounded-xl text-xs font-black border flex items-center gap-1 ${
                                                        canAfford 
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                                            : 'bg-gray-100 text-gray-400 border-gray-200'
                                                    }`}>
                                                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                                                        <span>{finalPrice}</span>
                                                    </div>
                                                </div>

                                                <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-1.5">
                                                    <span>{isLocked && itemEraIdx > myEraIdx ? '神秘藏品' : item.name}</span>
                                                    {isOwned && (
                                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/80 px-1.5 py-0.2 rounded-full">
                                                            已拥有
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-xs text-gray-500 leading-relaxed min-h-[3rem] line-clamp-2">
                                                    {isLocked ? '该物品来自更高阶的文明，尚未解锁...' : item.desc}
                                                </p>
                                            </div>

                                            {/* 底部购买区 */}
                                            <div className="mt-3 pt-2.5 border-t border-gray-100">
                                                {!isLocked && !isOwned && !isRestricted && (item.category === 'tool' || item.category === 'real' || item.category === 'box') ? (() => {
                                                    const qty = itemQty[item.id] || 1;
                                                    const maxByAfford = Math.max(1, Math.floor(totalGold / finalPrice));
                                                    const redeemedCount = redeemedCoupons?.[activeChild]?.filter(c => c.itemId === item.id).length || 0;
                                                    const maxByLimit = item.limit ? Math.max(1, item.limit - redeemedCount) : Infinity;
                                                    const maxQty = Math.min(maxByAfford, maxByLimit);
                                                    const totalCost = finalPrice * qty;

                                                    return (
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-2 py-1">
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { 
                                                                            e.stopPropagation(); 
                                                                            setItemQty(prev => ({ ...prev, [item.id]: Math.max(1, (prev[item.id] || 1) - 1) })); 
                                                                        }}
                                                                        disabled={qty <= 1}
                                                                        className={`w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs ${
                                                                            qty <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:border-gray-400 active:scale-90'
                                                                        }`}
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="w-7 text-center font-bold text-xs text-gray-800">{qty}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { 
                                                                            e.stopPropagation(); 
                                                                            setItemQty(prev => ({ ...prev, [item.id]: Math.min(maxQty, (prev[item.id] || 1) + 1) })); 
                                                                        }}
                                                                        disabled={qty >= maxQty}
                                                                        className={`w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs ${
                                                                            qty >= maxQty ? 'opacity-30 cursor-not-allowed' : 'hover:border-gray-400 active:scale-90'
                                                                        }`}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                                <span className="text-[10px] text-amber-600 font-bold">总计 {totalCost} 💰</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => canAfford && setPurchaseModal({ item, finalPrice, quantity: qty })}
                                                                disabled={!canAfford}
                                                                className={`w-full py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm ${
                                                                    canAfford 
                                                                        ? `${theme.primaryBg} ${theme.primaryBgHover} text-white shadow-md` 
                                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                }`}
                                                            >
                                                                {canAfford ? `购买 ×${qty} (${totalCost}元宝)` : '金币不足'}
                                                            </button>
                                                        </div>
                                                    );
                                                })() : (
                                                    <button
                                                        type="button"
                                                        onClick={() => { 
                                                            if (!isLocked && canAfford && !isRestricted) { 
                                                                onBuy(item, finalPrice); 
                                                                setPurchaseToast({ item: item.name, quantity: 1, cost: finalPrice, key: Date.now() }); 
                                                                setTimeout(() => setPurchaseToast(null), 2500); 
                                                            } 
                                                        }}
                                                        disabled={isLocked || !canAfford || isOwned || isRestricted}
                                                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm ${
                                                            isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                                            isOwned ? 'bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200' :
                                                            isRestricted ? 'bg-gray-100 text-red-400 cursor-not-allowed border border-red-100' :
                                                            canAfford ? `${theme.primaryBg} ${theme.primaryBgHover} text-white shadow-md` :
                                                            'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        {isLocked ? '未解锁' : isOwned ? '已珍藏' : isRestricted ? restriction.reason : canAfford ? '立即兑换' : '金币不足'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ======================= Tab 2: 我的行囊 ======================= */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-5">
                            {/* 状态 Buff 仪表板 */}
                            <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-indigo-50/90 border border-indigo-100 shadow-sm space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                                    <span className="flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-indigo-500" />
                                        <span>当前处于生效状态的法宝神力</span>
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {activeBuffs.xpBoost > 1 && (
                                        <span className="px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm">
                                            <Zap className="w-3.5 h-3.5" /> 经验值 ×{activeBuffs.xpBoost} (剩{activeBuffs.xpBoostCount}次)
                                        </span>
                                    )}
                                    {(inventory['item_shield'] || 0) > 0 && (
                                        <span className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm ${
                                            shieldTriggeredToday 
                                                ? 'bg-amber-600/90 text-white' 
                                                : 'bg-emerald-600 text-white'
                                        }`}>
                                            <Shield className="w-3.5 h-3.5" /> 
                                            {shieldTriggeredToday 
                                                ? `青铜神盾今日已生效 (持有${inventory['item_shield']}枚 · 明日重置)` 
                                                : `青铜神盾已就绪 (持有${inventory['item_shield']}枚 · 今日可用1次)`}
                                        </span>
                                    )}
                                    {activeBuffs.luckyBuff && (
                                        <span className="px-3 py-1 bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm">
                                            🍀 幸运女神眷顾中
                                        </span>
                                    )}
                                    {activeBuffs.investMultiplier > 1 && activeBuffs.investExpire && getLocalDateKey(0) <= activeBuffs.investExpire && (
                                        <span className="px-3 py-1 bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm">
                                            💰 乾坤理财倍率 ×{activeBuffs.investMultiplier} (至{activeBuffs.investExpire})
                                        </span>
                                    )}
                                    {stats?.[activeChild]?.premiumConfetti && (
                                        <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm">
                                            🎆 皇家礼炮视效已常驻
                                        </span>
                                    )}
                                    {!activeBuffs.xpBoost && !(inventory['item_shield'] > 0) && !activeBuffs.luckyBuff && !activeBuffs.investMultiplier && !stats?.[activeChild]?.premiumConfetti && (
                                        <span className="text-xs text-indigo-400 py-0.5">当前行囊未激活任何临时法宝状态</span>
                                    )}
                                </div>
                            </div>

                            {/* 背包物品网格 */}
                            {Object.keys(inventory).length === 0 || Object.values(inventory).every(c => c <= 0) ? (
                                <div className="text-center py-16 text-gray-400 space-y-2">
                                    <div className="text-5xl mb-2 opacity-40">🎒</div>
                                    <p className="text-sm font-semibold text-gray-500">行囊空空如也</p>
                                    <p className="text-xs text-gray-400">快前往时空集市选购实用法宝与装扮吧！</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    {Object.entries(inventory).map(([itemId, count]) => {
                                        if (count <= 0) return null;
                                        const item = SHOP_ITEMS.find(i => i.id === itemId);
                                        if (!item) return null;
                                        const isAutoUse = ['passive_shield'].includes(item.type);
                                        const isRealExchange = item.type === 'real';

                                        let gearType = 'other';
                                        if (item.type === 'cosmetic_frame') gearType = 'frame';
                                        else if (item.type === 'cosmetic_name') gearType = 'nameEffect';
                                        else if (item.type === 'cosmetic_bg') gearType = 'background';

                                        const childEquipped = (equippedGear && equippedGear[activeChild]) || {};
                                        const isEquipped = childEquipped[gearType] === item.id;
                                        const isCosmetic = ['cosmetic_frame', 'cosmetic_name', 'cosmetic_bg'].includes(item.type);

                                        return (
                                            <div 
                                                key={itemId} 
                                                className={`bg-white p-4 rounded-3xl border flex flex-col justify-between gap-3 shadow-sm transition-all ${
                                                    isEquipped ? 'border-indigo-400 ring-2 ring-indigo-200/50 bg-indigo-50/20' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                                                            isEquipped ? 'bg-indigo-100 border border-indigo-300' : getItemIconBg(item, false)
                                                        }`}>
                                                            {item.icon}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                                                                <span>{item.name}</span>
                                                                {isEquipped && (
                                                                    <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.2 rounded-full">
                                                                        装配中
                                                                    </span>
                                                                )}
                                                            </h4>
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                拥有数量: <b className="text-indigo-600 font-bold">{count}</b>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => onUse(item)}
                                                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                                                            isAutoUse ? 'bg-gray-100 text-gray-400 cursor-default' : 
                                                            isRealExchange ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm' :
                                                            isEquipped ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' :
                                                            'bg-gray-900 hover:bg-black text-white shadow-sm'
                                                        }`}
                                                        disabled={isAutoUse}
                                                    >
                                                        {item.type === 'passive_shield' ? '自动触发' : 
                                                         isCosmetic ? (isEquipped ? '已装配' : '立即换装') :
                                                         isRealExchange ? '使用契约' : '立即使用'}
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed bg-gray-50/80 p-2 rounded-xl">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ======================= Tab 3: 契约凭证与扫码核销 ======================= */}
                    {activeTab === 'coupons' && (
                        <div className="space-y-4">
                            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800 flex items-center gap-2">
                                <span>📜</span>
                                <span>现实兑换类心愿凭证使用后在此展示，请家长点击卡片上的「核销」完成扫码确认与履约记录。</span>
                            </div>

                            {redeemedCoupons.length === 0 ? (
                                <div className="text-center text-gray-400 py-16 space-y-2">
                                    <div className="text-5xl opacity-40">🎫</div>
                                    <p className="text-sm font-semibold">暂无心愿契约凭证</p>
                                    <p className="text-xs">在集市选购「现实兑换」商品使用后即可生成凭证！</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {redeemedCoupons.slice().reverse().map((coupon, idx) => {
                                        const isRealWithVerify = coupon.verifyCode != null;
                                        const isVerified = coupon.verified === true;

                                        return (
                                            <div 
                                                key={coupon.id || idx} 
                                                className={`bg-white p-4 rounded-3xl border-2 border-dashed flex items-center justify-between relative overflow-hidden transition-all ${
                                                    isVerified ? 'border-gray-200 bg-gray-50/40 opacity-75' : 'border-amber-300 shadow-sm'
                                                }`}
                                            >
                                                {/* 票券左右半圆缺口 */}
                                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-100 rounded-full border border-gray-300" />
                                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-100 rounded-full border border-gray-300" />

                                                <div className="flex gap-3.5 items-center min-w-0 flex-1 pl-2">
                                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                                                        {coupon.icon || '🎁'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-gray-900 text-sm truncate flex items-center gap-2">
                                                            <span>{coupon.name}</span>
                                                            <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded-md">
                                                                专属凭证
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            申领时间：{coupon.date}{coupon.usedAt ? ' ' + new Date(coupon.usedAt).toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </div>
                                                        {isVerified && coupon.verifiedAt && (
                                                            <div className="text-[11px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> 已核销于 {new Date(coupon.verifiedAt).toLocaleString('zh-CN')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="shrink-0 ml-3 pr-2">
                                                    {isRealWithVerify ? (
                                                        isVerified ? (
                                                            <span className="text-xs font-black text-emerald-600 border border-emerald-300 px-3 py-1.5 rounded-xl bg-emerald-50">
                                                                已履约核销
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (coupon.itemId === 'real_screen') {
                                                                        const now = new Date();
                                                                        const day = now.getDay();
                                                                        if (day !== 0 && day !== 6) {
                                                                            showToast('warning', '屏幕时间加油包仅限周末使用，请在周六或周日再核销。');
                                                                            return;
                                                                        }
                                                                        const todayKey = getLocalDateKey(0);
                                                                        const alreadyToday = (redeemedCoupons || []).filter(c => c.itemId === 'real_screen' && c.verified === true && c.verifiedAt && c.verifiedAt.slice(0, 10) === todayKey).length;
                                                                        if (alreadyToday >= 1) {
                                                                            showToast('warning', '屏幕时间加油包每天最多核销一次，今日已核销过。');
                                                                            return;
                                                                        }
                                                                    }
                                                                    setVerifyModal({ coupon, account: activeChild });
                                                                }}
                                                                className="text-xs font-bold text-amber-800 border border-amber-300 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 transition-all shadow-sm active:scale-95"
                                                            >
                                                                家长扫码核销
                                                            </button>
                                                        )
                                                    ) : (
                                                        <span className="text-xs font-bold text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-xl bg-emerald-50">
                                                            长期有效
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ======================= 子弹窗 1: 确认下单弹窗 ======================= */}
                {purchaseModal && (() => {
                    const { item, finalPrice, quantity } = purchaseModal;
                    const totalCost = finalPrice * quantity;
                    const afterBalance = totalGold - totalCost;

                    return (
                        <div 
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
                            onClick={() => setPurchaseModal(null)}
                        >
                            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-white animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                                <div className={`bg-gradient-to-r ${theme.gradient} px-5 py-4 flex items-center justify-between text-white`}>
                                    <span className="font-black text-base flex items-center gap-1.5">
                                        <span>🛒</span> 确认选购商品
                                    </span>
                                    <button onClick={() => setPurchaseModal(null)} className="text-white/80 hover:text-white transition-colors">
                                        <XIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${getItemIconBg(item, false)}`}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-base">{item.name}</div>
                                            <div className="text-xs text-gray-400">单价: {finalPrice} 💰 · 数量: {quantity}</div>
                                        </div>
                                    </div>

                                    {/* 结算明细卡 */}
                                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
                                        <div className="flex justify-between text-gray-600">
                                            <span>当前拥有金币：</span>
                                            <span className="font-semibold">{totalGold} 💰</span>
                                        </div>
                                        <div className="flex justify-between text-amber-700 font-bold">
                                            <span>本次应付总计：</span>
                                            <span>-{totalCost} 💰</span>
                                        </div>
                                        <div className="h-px bg-amber-200/80 my-1" />
                                        <div className="flex justify-between font-black text-sm">
                                            <span className="text-gray-800">支付后预计结余：</span>
                                            <span className={afterBalance >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                                                {afterBalance} 💰
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2.5 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setPurchaseModal(null)}
                                            className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors"
                                        >
                                            再想想
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onBuy(item, finalPrice, quantity);
                                                setPurchaseModal(null);
                                                setPurchaseToast({ item: item.name, quantity, cost: totalCost, key: Date.now() });
                                                setTimeout(() => setPurchaseToast(null), 2500);
                                                showToast('success', `成功购买 ${item.name} ×${quantity}！`);
                                            }}
                                            className={`flex-1 py-2.5 rounded-2xl font-bold text-xs text-white shadow-md ${theme.primaryBg} ${theme.primaryBgHover} active:scale-95 transition-all`}
                                        >
                                            确认兑换
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* ======================= 子弹窗 2: 家长扫码核销弹窗 ======================= */}
                {verifyModal && setRedeemedCoupons && (() => {
                    const verifyBase = 'https://www.daka-tool.top/redemption-verify.html';
                    const verifyPageUrl = verifyBase + '?code=' + verifyModal.coupon.verifyCode + '&account=' + encodeURIComponent(verifyModal.account) + '&product=' + encodeURIComponent(verifyModal.coupon.name);

                    return (
                        <div 
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
                            onClick={() => setVerifyModal(null)}
                        >
                            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-white animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                                <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                                    <span>📱</span> 家长专属扫码核销
                                </h3>
                                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                    请使用微信扫描下方二维码，在手机端确认核销后，将显示的 4 位核销码填入下方完成登记。
                                </p>
                                <div className="flex justify-center mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                                    <QRCodeView 
                                        text={verifyPageUrl} 
                                        alt="核销二维码" 
                                        className="w-44 h-44 rounded-xl"
                                    />
                                </div>
                                <div className="text-center text-xs text-gray-500 mb-3">
                                    核销人：<b>{verifyModal.account}</b> · 履约契约：<b>{verifyModal.coupon.name}</b>
                                </div>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        placeholder="输入核销码"
                                        value={verifyInputCode}
                                        onChange={e => setVerifyInputCode(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (verifyInputCode.trim() !== String(verifyModal.coupon.verifyCode)) {
                                                showToast('error', '核销码不正确，请核对后重新输入。');
                                                return;
                                            }
                                            setRedeemedCoupons(prev => {
                                                const list = prev[activeChild] || [];
                                                const next = list.map(c => 
                                                    c.verifyCode === verifyModal.coupon.verifyCode 
                                                        ? { ...c, verified: true, verifiedAt: new Date().toISOString(), verifiedDevice: typeof navigator !== 'undefined' ? navigator.userAgent : null }
                                                        : c
                                                );
                                                return { ...prev, [activeChild]: next };
                                            });
                                            setVerifyModal(null);
                                            setVerifyInputCode('');
                                            showToast('success', '契约履约核销完成！');
                                        }}
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                                    >
                                        确认核销
                                    </button>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => { setVerifyModal(null); setVerifyInputCode(''); }} 
                                    className="w-full py-2 text-gray-400 hover:text-gray-600 text-xs font-semibold"
                                >
                                    暂不核销
                                </button>
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

// --- NPC 时空商人法师 ---
export const ShopNPC = ({ onClick, currentEra }) => {
    const [message, setMessage] = useState('');
    const [showBubble, setShowBubble] = useState(false);

    const messages = {
        '远古之路': [
            '想要点火种吗？', '这根长矛很适合你！', '晚上的野兽很凶猛哦。',
            '冰河世纪图腾能让你休息一天！', '丰收的石斧，投资好帮手！',
            '看看这个神笔马良体验券！', '竞技场挑战书，敢来比试吗？'
        ],
        '文明初曙': [
            '新出炉的陶器看看吗？', '部落需要你的贡献。', '青铜盾可是好东西。',
            '炼金术士的试管，转化经验值！', '甲骨文传书，留下你的话！',
            '青铜商贸令，3倍收益！', '反悔药水，买错了可以退哦！'
        ],
        '周·礼制与争鸣': [
            '客官，里面请！', '吾有良药，可解忧愁。', '礼乐崩坏，唯有读书高。',
            '友好邻邦进贡，送给友好邦邻元宝吧！', '书香门第购书券，读书好处多！',
            '聚宝盆，4倍收益！', '孔夫子的戒尺，监督家长用！',
            '皇家礼炮特效，让打卡更炫酷！'
        ],
        '魏晋隋唐·融合与登科': [
            '客官还没睡？来个"免作业金牌"？', '东西市的新货到了！', '听说西域来了好东西。',
            '幸运加持符，转盘大奖率提升！', '御膳房点菜旨意，今晚吃什么你说了算！',
            '上元节夜游令，多玩30分钟！', '开元通宝铸币权，5倍收益！',
            '丝绸之路寻宝图，解锁隐藏主题！', '赛博朋克主题，未来科技感！'
        ]
    };

    // 随机自动弹出对话
    useEffect(() => {
        const randomTrigger = () => {
            if (Math.random() < 0.3) {
                const eraMsgs = messages[currentEra] || messages['远古之路'];
                const msg = eraMsgs[Math.floor(Math.random() * eraMsgs.length)];
                setMessage(msg);
                setShowBubble(true);
                setTimeout(() => setShowBubble(false), 4000);
            }
        };
        
        const interval = setInterval(randomTrigger, 15000);
        return () => clearInterval(interval);
    }, [currentEra]);

    const handleClick = () => {
        const eraMsgs = messages[currentEra] || messages['远古之路'];
        const msg = eraMsgs[Math.floor(Math.random() * eraMsgs.length)];
        setMessage(msg);
        setShowBubble(true);
        onClick();
        setTimeout(() => setShowBubble(false), 3000);
    };

    return (
        <div className="fixed bottom-4 left-3 lg:left-4 z-[100] flex items-end gap-2 cursor-pointer group npc-float">
            <div 
                onClick={handleClick} 
                className="w-11 h-11 lg:w-14 lg:h-14 rounded-full bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-400 border-2 border-white shadow-lg flex items-center justify-center text-xl lg:text-2xl transform transition-transform group-hover:scale-110 active:scale-95"
                title="时空集市商人"
            >
                🧙‍♂️
            </div>
            {showBubble && (
                <div className="bg-white px-3 py-2 rounded-2xl rounded-bl-none shadow-xl text-xs font-bold text-gray-800 mb-2 animate-in fade-in slide-in-from-bottom-2 border border-gray-100 max-w-[200px] leading-snug">
                    {message}
                </div>
            )}
        </div>
    );
};

export default ShopModal;
