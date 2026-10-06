import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { XIcon } from '../icons';

// --- 全局数据安全读取与降级 ---
const petCatalog = (typeof window !== 'undefined' && window.PET_CATALOG) ? window.PET_CATALOG : [];
const petActions = (typeof window !== 'undefined' && window.PET_ACTIONS) ? window.PET_ACTIONS : {};
const petMoodDialogs = (typeof window !== 'undefined' && window.PET_MOOD_DIALOGS) ? window.PET_MOOD_DIALOGS : {};
const petPersonalities = (typeof window !== 'undefined' && window.PET_PERSONALITIES) ? window.PET_PERSONALITIES : {};
const petElements = (typeof window !== 'undefined' && window.PET_ELEMENTS) ? window.PET_ELEMENTS : {};
const petStatNames = (typeof window !== 'undefined' && window.PET_STAT_NAMES) ? window.PET_STAT_NAMES : {};

const adventureConfig = (typeof window !== 'undefined' && window.ADVENTURE_CONFIG) ? window.ADVENTURE_CONFIG : {};
const adventureRealms = (typeof window !== 'undefined' && window.ADVENTURE_REALMS) ? window.ADVENTURE_REALMS : [];
const adventureLootTables = (typeof window !== 'undefined' && window.ADVENTURE_LOOT_TABLES) ? window.ADVENTURE_LOOT_TABLES : {};
const adventureEvents = (typeof window !== 'undefined' && window.ADVENTURE_EVENTS) ? window.ADVENTURE_EVENTS : {};
const adventureRefuseDialogs = (typeof window !== 'undefined' && window.ADVENTURE_REFUSE_DIALOGS) ? window.ADVENTURE_REFUSE_DIALOGS : [];
const adventureStories = (typeof window !== 'undefined' && window.ADVENTURE_STORIES) ? window.ADVENTURE_STORIES : {};

const adventureHelpers = (typeof window !== 'undefined' && window.ADVENTURE_HELPERS) ? window.ADVENTURE_HELPERS : {};
const ADVENTURE_HELPERS = adventureHelpers;
const PET_CATALOG = petCatalog;
const PET_ACTIONS = petActions;
const PET_MOOD_DIALOGS = petMoodDialogs;
const PET_PERSONALITIES = petPersonalities;
const PET_ELEMENTS = petElements;
const PET_STAT_NAMES = petStatNames;
const ADVENTURE_CONFIG = adventureConfig;
const ADVENTURE_REALMS = adventureRealms;
const ADVENTURE_LOOT_TABLES = adventureLootTables;
const ADVENTURE_EVENTS = adventureEvents;
const ADVENTURE_REFUSE_DIALOGS = adventureRefuseDialogs;
const ADVENTURE_STORIES = adventureStories;

const eraOrder = (typeof window !== 'undefined' && window.ERA_ORDER) ? window.ERA_ORDER : ['远古之路', '文明初曙', '周·礼制与争鸣', '秦·铁血与一统', '汉·雄风与凿空西域', '魏晋隋唐·融合与登科', '五代·乱世更迭', '宋·文道昌盛', '元·四海交融', '明·日月重开'];
const ERA_ORDER = eraOrder;

// 探险饥饿度计算（全局函数，AdventureConfirmModal 和 handleStartAdventure 共用）

const safeTriggerSyncUpload = (fn) => {
    if (typeof fn === 'function') {
        fn();
    } else if (typeof window !== 'undefined' && typeof window.triggerSyncUpload === 'function') {
        window.triggerSyncUpload();
    }
};

export const calcAdventureHungerCost = (realmDuration, hungerPerHour, foodHungerReduction, bringFood) => {
    const hours = Math.ceil(realmDuration / 3600000);
    const totalHunger = hours * hungerPerHour;
    const reduction = bringFood ? foodHungerReduction * hours : 0;
    return { hours, effectiveCost: Math.max(1, totalHunger - reduction) };
};

        // ============================================================
        // 宠物系统组件
        // ============================================================

        // PetHeader 已合并到 PetModal 内部

        // 宠物提醒通知配置表（新增提醒只需追加一项）
        const PET_NOTIF_CONFIG = [
            {
                type: 'hungry',
                condition: (pet) => pet.stats.fullness < 20,
                message: (pet) => `${pet.nickname || '宠物'}肚子好饿，快去喂食吧！`,
                resolve: (pet) => pet.stats.fullness >= 20,
            },
            {
                type: 'sad',
                condition: (pet) => pet.stats.mood < 20,
                message: (pet) => `${pet.nickname || '宠物'}心情很低落，快去陪陪它吧！`,
                resolve: (pet) => pet.stats.mood >= 20,
            },
            {
                type: 'dirty',
                condition: (pet) => pet.stats.cleanliness < 20,
                message: (pet) => `${pet.nickname || '宠物'}身上脏兮兮的，快去洗香香！`,
                resolve: (pet) => pet.stats.cleanliness >= 20,
            },
        ];

        // 宠物图片组件：src → thumb.png → emoji 三级降级（src 与 thumb 相同时跳过重复尝试）
        const PetImage = ({ petId, src, fallbackEmoji, className, style }) => {
            const [stage, setStage] = React.useState(0); // 0=src, 1=thumb, 2=emoji
            const thumbUrl = 'pet_animations/' + petId + '/' + petId + '-thumb.png';
            const srcIsThumb = src === thumbUrl;
            const effectiveStage = (stage === 1 && srcIsThumb) ? 2 : stage;
            if (effectiveStage === 2) return React.createElement('span', { className: 'text-5xl' }, fallbackEmoji || '🐾');
            return React.createElement('img', {
                src: effectiveStage === 0 ? src : thumbUrl,
                className: className || 'w-full h-full object-contain',
                style: style || {},
                onError: () => setStage(s => s + 1),
            });
        };

        // 具有 WebP 闲置帧动画的宠物及实际拥有的帧列表（避免盲目探测不存在的 .webp 导致浏览器报 404）
        const PET_IDLE_FRAMES = {
            'teddy': [
                'pet_animations/teddy/teddy-idle.webp',
                'pet_animations/teddy/teddy-idle2.webp',
                'pet_animations/teddy/teddy-idle3.webp',
                'pet_animations/teddy/teddy-idle4.webp',
            ],
            'husky': [
                'pet_animations/husky/husky-idle.webp',
                'pet_animations/husky/husky-idle2.webp',
            ],
            'angora-rabbit': [
                'pet_animations/angora-rabbit/angora-rabbit-idle.webp',
            ],
            'lizard': [
                'pet_animations/lizard/lizard-idle.webp',
            ],
            't-rex': [
                'pet_animations/t-rex/t-rex-idle.webp',
            ],
            'whitecat': [
                'pet_animations/whitecat/whitecat-idle.webp',
            ],
        };

        // 具有 WebP 互动动作动画的宠物与对应后缀映射
        const PET_ACTION_ANIMATIONS = {
            'teddy': { feed: 'feed', bath: 'bath', sleep: 'sleep', click: 'click', pet: 'click' },
            'angora-rabbit': { feed: 'feed', bath: 'bath', sleep: 'sleep', click: 'click', pet: 'click' },
            'husky': { feed: 'feed', sleep: 'sleep', click: 'click', pet: 'click' },
            'lizard': { feed: 'feed', bath: 'bath', sleep: 'sleep' },
            'whitecat': { click: 'touch', pet: 'touch' },
        };

        // 用户卡片内宠物 idle 动画组件（多帧循环 + 三级降级）
        const CardPetImage = ({ petId }) => {
            const [idleFrames, setIdleFrames] = React.useState([]);
            const [animSrc, setAnimSrc] = React.useState(null);
            const [failStage, setFailStage] = React.useState(0); // 0=webp, 1=thumb, 2=emoji
            const cycleRef = React.useRef(null);

            React.useEffect(() => {
                if (!petId) return;
                const frames = PET_IDLE_FRAMES[petId] || [];
                if (frames.length === 0) {
                    setIdleFrames([]);
                    setAnimSrc(null);
                    setFailStage(1);
                    return;
                }
                let loaded = [];
                let done = 0;
                frames.forEach((src) => {
                    const img = new Image();
                    img.onload = () => { loaded.push(src); done++; if (done === frames.length) finish(); };
                    img.onerror = () => { done++; if (done === frames.length) finish(); };
                    img.src = src;
                });
                function finish() {
                    if (loaded.length > 0) {
                        setIdleFrames(loaded);
                        setAnimSrc(loaded[Math.floor(Math.random() * loaded.length)]);
                    } else {
                        setIdleFrames([]);
                        setAnimSrc(null);
                        setFailStage(1);
                    }
                }
                return () => { clearInterval(cycleRef.current); };
            }, [petId]);

            React.useEffect(() => {
                if (idleFrames.length < 2) return;
                clearInterval(cycleRef.current);
                cycleRef.current = setInterval(() => {
                    setAnimSrc(idleFrames[Math.floor(Math.random() * idleFrames.length)]);
                }, 3000);
                return () => clearInterval(cycleRef.current);
            }, [idleFrames]);

            if (!petId) return null;
            if (failStage === 2) return React.createElement('span', { className: 'text-3xl' }, '🐾');
            if (failStage === 1) {
                const thumbUrl = 'pet_animations/' + petId + '/' + petId + '-thumb.png';
                return React.createElement('img', {
                    src: thumbUrl,
                    className: 'w-16 h-16 object-contain',
                    onError: () => setFailStage(2),
                });
            }
            if (!animSrc) return null;
            return React.createElement('img', {
                src: animSrc,
                className: 'w-16 h-16 object-contain',
                onError: () => setFailStage(1),
            });
        };

        // AI 宠物对话 System Prompt（全局，供 PetHomeView 和 App 内部使用）
        const buildPetSystemPrompt = (childName, petId, pet, moodStatus) => {
            const personality = petPersonalities[petId] || {};
            const pStats = pet?.stats || {};
            const bondValue = Math.round(((pStats.fullness ?? 50) + (pStats.cleanliness ?? 50) + (pStats.mood ?? 50)) / 3);
            const bondLevel = bondValue >= 96 ? '灵魂伴侣' : bondValue >= 81 ? '最佳搭档' : bondValue >= 61 ? '好伙伴' : bondValue >= 41 ? '熟悉' : bondValue >= 21 ? '初识' : '陌生';
            return `你是${personality.name || '宠物'}，${childName}的宠物。
性格：${personality.personality || '可爱、活泼'}
说话风格：${personality.speech_style || '语气可爱'}
兴趣：${personality.interests || '喜欢和主人玩'}

当前状态：心情${pStats.mood ?? 50}/100，饱食${pStats.fullness ?? 50}/100，清洁${pStats.cleanliness ?? 50}/100
心情状态：${moodStatus === 'happy' ? '开心' : moodStatus === 'sad' ? '难过' : '一般'}
羁绊等级：${bondLevel}

请用符合你性格的方式，对主人说一句话（30字以内）。要自然、有趣、符合当前心情状态。`;
        };

        const PetHomeView = ({ theme, activeChild, petData, setPetData, ownedPets, activePet, triggerSyncUpload, petCooldowns, setPetCooldowns, petStats, setPetStats, totalStars, setStarHistory, petMusicOn, lowPerfMode, checkAchievements, aiEnabled, aiPetEnabled, deepseekApiKey, callDeepSeekAPI }) => {
            const petId = activePet[activeChild];
            const myOwned = ownedPets[activeChild] || [];

            // 动画帧管理
            const [idleFrames, setIdleFrames] = React.useState([]);
            const [animSrc, setAnimSrc] = React.useState(null);
            const cycleRef = React.useRef(null);
            const prevPetRef = React.useRef(null);
            const actionAnimRef = React.useRef(false);
            const petStateTimerRef = React.useRef(null);

            React.useEffect(() => {
                if (!petId) return;
                if (prevPetRef.current === petId) return;
                prevPetRef.current = petId;
                setAnimSrc(null);
                const frames = PET_IDLE_FRAMES[petId] || [];
                if (frames.length === 0) {
                    setIdleFrames([]);
                    setAnimSrc(null);
                    return;
                }
                let loaded = [];
                let done = 0;
                frames.forEach((src) => {
                    const img = new Image();
                    img.onload = () => { loaded.push(src); done++; if (done === frames.length) finish(); };
                    img.onerror = () => { done++; if (done === frames.length) finish(); };
                    img.src = src;
                });
                function finish() {
                    if (loaded.length > 0) {
                        setIdleFrames(loaded);
                        setAnimSrc(loaded[Math.floor(Math.random() * loaded.length)]);
                    } else {
                        setIdleFrames([]);
                        setAnimSrc(null);
                    }
                }
                return () => { clearInterval(cycleRef.current); };
            }, [petId]);

            React.useEffect(() => {
                if (idleFrames.length < 2) return;
                clearInterval(cycleRef.current);
                cycleRef.current = setInterval(() => {
                    if (actionAnimRef.current) return;
                    setAnimSrc(idleFrames[Math.floor(Math.random() * idleFrames.length)]);
                }, 3000);
                return () => clearInterval(cycleRef.current);
            }, [idleFrames]);

            const playActionAnim = (actionKey) => {
                const actionMap = PET_ACTION_ANIMATIONS[petId] || {};
                const suffix = actionMap[actionKey];
                if (!suffix) return;
                actionAnimRef.current = true;
                clearInterval(cycleRef.current);
                const src = 'pet_animations/' + petId + '/' + petId + '-' + suffix + '.webp';
                const img = new Image();
                img.onload = () => setAnimSrc(src);
                img.onerror = () => {};
                img.src = src;
                setTimeout(() => {
                    actionAnimRef.current = false;
                    if (idleFrames.length > 0) {
                        setAnimSrc(idleFrames[Math.floor(Math.random() * idleFrames.length)]);
                        clearInterval(cycleRef.current);
                        cycleRef.current = setInterval(() => {
                            if (actionAnimRef.current) return;
                            setAnimSrc(idleFrames[Math.floor(Math.random() * idleFrames.length)]);
                        }, 3000);
                    } else {
                        setAnimSrc(null);
                    }
                }, 3000);
            };

            const hasPet = !!(petId && myOwned.includes(petId));
            const pet = hasPet ? petData[activeChild]?.[petId] : null;
            const catalog = hasPet ? petCatalog.find(p => p.id === petId) : null;
            const moodStatus = (pet?.stats?.fullness < 20 || pet?.stats?.mood < 20) ? 'sad' : (pet?.stats?.mood >= 80 ? 'happy' : 'normal');
            const statsHash = pet?.stats ? `${pet.stats.fullness}-${pet.stats.cleanliness}-${pet.stats.mood}` : '';

            // AI 宠物对话（带缓存，5分钟刷新 + 互动后刷新）
            const [aiPetDialog, setAiPetDialog] = React.useState('');
            const aiPetCacheKey = React.useRef('');
            React.useEffect(() => {
                if (!aiEnabled || !aiPetEnabled || !deepseekApiKey || !pet || !catalog) { setAiPetDialog(''); return; }
                const cacheKey = `${activeChild}-${petId}-${moodStatus}-${Math.floor(Date.now() / 300000)}-${statsHash}`;
                if (aiPetCacheKey.current === cacheKey) return;
                aiPetCacheKey.current = cacheKey;
                let cancelled = false;
                const prompt = buildPetSystemPrompt(activeChild, petId, pet, moodStatus);
                callDeepSeekAPI(prompt, '跟我说一句话吧', []).then(reply => {
                    if (!cancelled && reply) setAiPetDialog(reply.replace(/^[""「]|[""」]$/g, '').slice(0, 60));
                });
                return () => { cancelled = true; };
            }, [aiEnabled, aiPetEnabled, deepseekApiKey, activeChild, petId, moodStatus, statsHash]);

            if (!hasPet) {
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                            <span className="text-5xl">🐾</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 mb-1">还没有宠物哦</h3>
                        <p className="text-gray-400 text-sm">去商店领养一只可爱的伙伴吧</p>
                    </div>
                );
            }

            if (!pet || !catalog) return <div className="p-8 text-center text-gray-400">加载中...</div>;

            const growthStage = (() => {
                if (!catalog.growthStages) return { level: 1, name: '初生', threshold: 0, size: 'w-24 h-24' };
                let current = catalog.growthStages[0];
                for (const stage of catalog.growthStages) {
                    if (pet.interactionCount >= stage.threshold) current = stage;
                    else break;
                }
                return current;
            })();

            const nextStage = (() => {
                if (!catalog.growthStages) return null;
                for (const stage of catalog.growthStages) {
                    if (pet.interactionCount < stage.threshold) return stage;
                }
                return null;
            })();

            const dialogs = petMoodDialogs[moodStatus] || ['...'];
            const staticDialog = dialogs[Math.floor(Date.now() / 30000) % dialogs.length];
            const dialog = aiPetDialog || staticDialog;

            // 亲密度计算
            const pStats = pet?.stats || {};
            const bondValue = Math.round(((pStats.fullness ?? 50) + (pStats.cleanliness ?? 50) + (pStats.mood ?? 50)) / 3);
            const bondLevels = (typeof ADVENTURE_CONFIG !== 'undefined' && ADVENTURE_CONFIG.bondLevels) ? ADVENTURE_CONFIG.bondLevels : [
                { min: 0, max: 20, name: '陌生' }, { min: 21, max: 40, name: '初识' }, { min: 41, max: 60, name: '熟悉' },
                { min: 61, max: 80, name: '好伙伴' }, { min: 81, max: 95, name: '最佳搭档' }, { min: 96, max: 100, name: '灵魂伴侣' },
            ];
            const bondLevel = (() => { for (let i = bondLevels.length - 1; i >= 0; i--) { if (bondValue >= bondLevels[i].min) return bondLevels[i]; } return bondLevels[0]; })();
            const bondColorMap = { '陌生': { bg: 'bg-gray-100', text: 'text-gray-500', bar: 'from-gray-300 to-gray-400' }, '初识': { bg: 'bg-blue-50', text: 'text-blue-600', bar: 'from-blue-300 to-blue-500' }, '熟悉': { bg: 'bg-green-50', text: 'text-green-600', bar: 'from-green-300 to-green-500' }, '好伙伴': { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'from-emerald-300 to-emerald-500' }, '最佳搭档': { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'from-amber-300 to-amber-500' }, '灵魂伴侣': { bg: 'bg-rose-50', text: 'text-rose-600', bar: 'from-rose-300 to-rose-500' } };
            const bondColor = bondColorMap[bondLevel.name] || bondColorMap['陌生'];

            // 元素信息
            const petElement = catalog.attributes?.element || 'none';
            const elemInfo = (typeof PET_ELEMENTS !== 'undefined' && PET_ELEMENTS[petElement]) ? PET_ELEMENTS[petElement] : { name: '无', icon: '⚪', color: 'text-gray-500', bg: 'bg-gray-50' };

            const rarityMap = { common: { name: '普通', cls: 'bg-amber-100 text-amber-700 border-amber-300' }, rare: { name: '稀有', cls: 'bg-blue-50 text-blue-600 border-blue-300' }, epic: { name: '珍品', cls: 'bg-purple-50 text-purple-600 border-purple-300' }, legendary: { name: '传说', cls: 'bg-rose-50 text-rose-600 border-rose-300' } };
            const rarity = rarityMap[catalog.rarity] || rarityMap.common;

            const statBars = [
                { key: 'strength', label: '力量', icon: '💪', color: 'bg-red-400' },
                { key: 'agility', label: '敏捷', icon: '⚡', color: 'bg-yellow-400' },
                { key: 'vitality', label: '体力', icon: '❤️', color: 'bg-pink-400' },
                { key: 'wisdom', label: '智慧', icon: '📖', color: 'bg-blue-400' },
                { key: 'charm', label: '魅力', icon: '✨', color: 'bg-purple-400' },
            ];

            const actionButtons = [
                { key: 'feed', icon: '🍖', label: '喂食', bg: 'from-red-400 to-orange-400' },
                { key: 'bath', icon: '🛁', label: '洗香香', bg: 'from-blue-400 to-cyan-400' },
                { key: 'play', icon: '🎪', label: '玩耍', bg: 'from-amber-400 to-yellow-400' },
                { key: 'sleep', icon: '💤', label: '睡觉', bg: 'from-indigo-400 to-purple-400' },
                { key: 'pet', icon: '🤚', label: '摸摸头', bg: 'from-pink-400 to-rose-400' },
            ];

            return (
                <div className="space-y-5 pb-2">
                    {/* 宠物展示卡 */}
                    <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-5 shadow-sm border border-indigo-100/60 overflow-hidden">
                        {/* 装饰星星 */}
                        <div className="absolute top-3 right-4 text-indigo-200/60 text-lg pointer-events-none">✦</div>
                        <div className="absolute bottom-4 left-4 text-pink-200/60 text-sm pointer-events-none">✧</div>
                        <div className="absolute top-1/2 right-8 text-purple-200/40 text-xs pointer-events-none">✦</div>

                        {/* 气泡对话 */}
                        <div className="flex justify-center mb-3">
                            <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl rounded-bl-sm shadow-sm border border-white text-sm text-gray-600 max-w-[220px] text-center">
                                "{dialog}"
                            </div>
                        </div>

                        {/* 状态环（左）+ 宠物大图（中）+ 互动按钮（右） */}
                        <div className="flex items-center justify-between mb-4 gap-2">
                            {/* 左侧：3 个状态环 */}
                            <div className="flex flex-col gap-2 shrink-0">
                                {[
                                    { key: 'fullness', label: '饱腹', icon: '🍖' },
                                    { key: 'cleanliness', label: '清洁', icon: '🧼' },
                                    { key: 'mood', label: '心情', icon: '😊' },
                                ].map(s => {
                                    const val = pet.stats[s.key];
                                    const strokeColor = val < 30 ? '#ef4444' : val < 60 ? '#f59e0b' : '#10b981';
                                    return (
                                        <div key={s.key} className="flex items-center gap-1">
                                            <div className="relative w-9 h-9">
                                                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                                                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                                    <circle cx="18" cy="18" r="15" fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${val * 0.942} 94.2`} className="transition-all duration-700" />
                                                </svg>
                                                <span className="absolute inset-0 flex items-center justify-center text-xs">{s.icon}</span>
                                            </div>
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-xs text-gray-400">{s.label}</span>
                                                <span className="text-[11px] font-bold text-gray-600">{val}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 中间：宠物大图（无边框） */}
                            <div className="flex-shrink-0">
                                <div className={`w-40 h-40 flex items-center justify-center ${pet.currentState === 'feed' ? 'animate-pet-eat' : pet.currentState === 'sleep' ? 'animate-pet-sleep-bob' : pet.currentState === 'click' ? 'animate-pet-wiggle' : 'animate-pet-bounce-gentle'}`}>
                                    {animSrc ? (
                                        <img src={animSrc} alt={catalog.name} className="w-full h-full object-contain drop-shadow-lg" onError={() => setAnimSrc(null)} />
                                    ) : (
                                        <PetImage petId={petId} src={catalog.thumbUrl || ('pet_animations/' + petId + '/' + petId + '-thumb.png')} fallbackEmoji={catalog.emoji} className="w-full h-full object-contain drop-shadow-lg" />
                                    )}
                                </div>
                            </div>

                            {/* 右侧：互动按钮竖排 */}
                            <div className="flex flex-col gap-1.5 shrink-0">
                                {actionButtons.map(btn => {
                                    const action = petActions[btn.key];
                                    const lastAction = petCooldowns[activeChild]?.[petId]?.[btn.key] || 0;
                                    const onCooldown = Date.now() - lastAction < action.cooldown;
                                    const cdRemaining = onCooldown ? Math.ceil((action.cooldown - (Date.now() - lastAction)) / 60000) : 0;
                                    const currentStars = totalStars;
                                    const canAfford = currentStars >= action.starCost;
                                    const disabled = onCooldown || !canAfford;

                                    return (
                                        <div key={btn.key} className="flex items-center gap-1">
                                            <button
                                                disabled={disabled}
                                                onClick={() => {
                                                    if (disabled) return;
                                                    playActionAnim(btn.key);
                                                    if (action.starCost > 0) {
                                                        setStarHistory(prev => ({ ...prev, [`${activeChild}-STAR_PET_${btn.key}-${petId}-${Date.now()}`]: -action.starCost }));
                                                    }
                                                    setPetData(prev => {
                                                        const childPets = { ...(prev[activeChild] || {}) };
                                                        const p = { ...childPets[petId] };
                                                        p.stats = {
                                                            fullness: Math.max(0, Math.min(100, p.stats.fullness + (action.effects.fullness || 0))),
                                                            cleanliness: Math.max(0, Math.min(100, p.stats.cleanliness + (action.effects.cleanliness || 0))),
                                                            mood: Math.max(0, Math.min(100, p.stats.mood + (action.effects.mood || 0))),
                                                        };
                                                        p.interactionCount += 1;
                                                        p.lastInteraction = new Date().toISOString();
                                                        p.currentState = btn.key;
                                                        childPets[petId] = p;
                                                        return { ...prev, [activeChild]: childPets };
                                                    });
                                                    setPetCooldowns(prev => ({
                                                        ...prev,
                                                        [activeChild]: { ...(prev[activeChild] || {}), [petId]: { ...(prev[activeChild]?.[petId] || {}), [btn.key]: Date.now() } },
                                                    }));
                                                    setPetStats(prev => {
                                                        const s = { ...(prev[activeChild] || {}) };
                                                        s.totalInteractions = (s.totalInteractions || 0) + 1;
                                                        s[`${btn.key}Count`] = (s[`${btn.key}Count`] || 0) + 1;
                                                        s.totalStarsSpent = (s.totalStarsSpent || 0) + action.starCost;
                                                        return { ...prev, [activeChild]: s };
                                                    });
                                                    checkAchievements('pet_' + btn.key, { petId });
                                                    safeTriggerSyncUpload();
                                                    // AI 互动反应（异步，不阻塞动画）
                                                    if (aiEnabled && deepseekApiKey) {
                                                        const personality = petPersonalities[petId] || {};
                                                        const petName2 = pet.nickname || '宠物';
                                                        const actionNames = { feed: '喂食', bath: '洗澡', play: '玩耍', sleep: '哄你睡觉', pet: '摸头' };
                                                        const prompt = `你是${petName2}，${activeChild}的宠物。性格：${personality.personality || '可爱'}。说话风格：${personality.speech_style || '可爱'}。主人刚对你做了「${actionNames[btn.key] || btn.key}」。请说一句反应的话（20字以内），不要用引号。`;
                                                        callDeepSeekAPI(prompt, '跟我说句话吧', []).then(reply => {
                                                            if (reply) setAiPetDialog(reply.replace(/^[""「]|[""」]$/g, '').slice(0, 40));
                                                        });
                                                    }
                                                    if (petStateTimerRef.current) clearTimeout(petStateTimerRef.current);
                                                    petStateTimerRef.current = setTimeout(() => {
                                                        setPetData(prev => {
                                                            const childPets = { ...(prev[activeChild] || {}) };
                                                            if (childPets[petId]) {
                                                                childPets[petId] = { ...childPets[petId], currentState: 'idle' };
                                                            }
                                                            return { ...prev, [activeChild]: childPets };
                                                        });
                                                    }, 3000);
                                                }}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all ${
                                                    disabled
                                                        ? 'bg-gray-100 grayscale opacity-50 cursor-not-allowed'
                                                        : `bg-gradient-to-br ${btn.bg} hover:shadow-md hover:scale-105 active:scale-95`
                                                }`}
                                            >
                                                {onCooldown ? (
                                                    <span className="text-[10px] font-bold text-gray-400">{cdRemaining}分</span>
                                                ) : (
                                                    btn.icon
                                                )}
                                            </button>
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-xs text-gray-500 font-medium">{btn.label}</span>
                                                {!onCooldown && action.starCost > 0 && (
                                                    <span className="text-[10px] text-amber-500">⭐{action.starCost}</span>
                                                )}
                                                {!onCooldown && action.starCost === 0 && (
                                                    <span className="text-[10px] text-green-500">免费</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 名字（左）+ 等级·元素·亲密度（右） */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-extrabold text-gray-800">{pet.nickname || catalog.name}</span>
                            <div className="flex items-center gap-1.5">
                                {/* 元素徽章 */}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${elemInfo.bg} ${elemInfo.color} font-bold border border-current/20`}>{elemInfo.icon} {elemInfo.name}</span>
                                {/* 等级徽章 */}
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/80 text-indigo-600 font-bold border border-indigo-200">Lv.{growthStage.level} {growthStage.name}</span>
                            </div>
                        </div>
                        {/* 亲密度条 */}
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs">💖</span>
                                    <span className={`text-xs font-bold ${bondColor.text}`}>{bondLevel.name}</span>
                                </div>
                                <span className={`text-xs font-bold ${bondColor.text}`}>{bondValue}</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full bg-gradient-to-r ${bondColor.bar} transition-all duration-700`}
                                    style={{ width: `${bondValue}%` }}></div>
                            </div>
                        </div>

                        {/* 成长进度条 */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs text-gray-400">🌱 成长</span>
                                <span className="text-xs text-gray-400">
                                    {nextStage ? `${pet.interactionCount}/${nextStage.threshold} → ${nextStage.name}` : '✨ 已满级！'}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-700"
                                    style={{ width: nextStage ? `${Math.min(100, (pet.interactionCount / nextStage.threshold) * 100)}%` : '100%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* 属性面板 */}
                    <div className="bg-white/70 rounded-3xl p-4 shadow-sm border border-amber-100/50">
                        <div className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1">
                            <span>📊</span> 属性
                        </div>
                        <div className="space-y-2.5">
                            {statBars.map(s => {
                                const base = catalog.attributes.baseStats[s.key] || 0;
                                const current = Math.min(10, base);
                                return (
                                    <div key={s.key} className="flex items-center gap-2">
                                        <span className="text-sm w-5 text-center">{s.icon}</span>
                                        <span className="text-xs text-gray-500 w-7">{s.label}</span>
                                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${s.color}`} style={{ width: `${current * 10}%` }}></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 w-7 text-right">{current}/10</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        };

        // 宠物栏位解锁系统
        const PetSlotSystem = {
            FREE_SLOTS: 3,
            BASE_COST: 100,
            COST_INCREMENT: 60,

            // 条件池定义
            CONDITIONS: {
                pet_level: {
                    label: (v) => `至少 ${v.count} 只宠物达到 Lv.${v.level}`,
                    check: (v, ctx) => {
                        const catalog = typeof PET_CATALOG !== 'undefined' ? PET_CATALOG : [];
                        let count = 0;
                        (ctx.ownedPets || []).forEach(pid => {
                            const p = (ctx.petData || {})[pid];
                            const cat = catalog.find(c => c.id === pid);
                            if (!p || !cat) return;
                            let lvl = 1;
                            for (const s of (cat.growthStages || [])) { if (p.interactionCount >= s.threshold) lvl = s.level; }
                            if (lvl >= v.level) count++;
                        });
                        return { met: count >= v.count, current: count, target: v.count };
                    },
                },
                streak: {
                    label: (v) => `连续打卡 ≥ ${v.days} 天`,
                    check: (v, ctx) => {
                        const streak = ctx.currentStreak || 0;
                        return { met: streak >= v.days, current: streak, target: v.days };
                    },
                },
                interactions: {
                    label: (v) => `累计互动 ≥ ${v.count} 次`,
                    check: (v, ctx) => {
                        let total = 0;
                        Object.values(ctx.petData || {}).forEach(p => { total += (p.interactionCount || 0); });
                        return { met: total >= v.count, current: total, target: v.count };
                    },
                },
                checkin_rate: {
                    label: (v) => `近 7 天打卡率 ≥ ${v.rate}%`,
                    check: (v, ctx) => {
                        const rate = ctx.recentCheckinRate || 0;
                        return { met: rate >= v.rate, current: Math.round(rate), target: v.rate };
                    },
                },
            },

            // 条件难度等级
            CONDITION_TIERS: [
                { level: 1, values: { pet_level: { count: 1, level: 3 }, streak: { days: 7 }, interactions: { count: 100 }, checkin_rate: { rate: 60 } } },
                { level: 2, values: { pet_level: { count: 2, level: 3 }, streak: { days: 14 }, interactions: { count: 200 }, checkin_rate: { rate: 70 } } },
                { level: 3, values: { pet_level: { count: 1, level: 4 }, streak: { days: 21 }, interactions: { count: 300 }, checkin_rate: { rate: 80 } } },
            ],

            // 获取栏位费用
            getSlotCost: function(slotIndex) {
                if (slotIndex <= this.FREE_SLOTS) return 0;
                return this.BASE_COST + (slotIndex - this.FREE_SLOTS - 1) * this.COST_INCREMENT;
            },

            // 获取栏位需要满足的条件数
            getRequiredConditionCount: function(slotIndex) {
                if (slotIndex <= this.FREE_SLOTS) return 0;
                if (slotIndex <= 7) return 0;    // 第 4~7 个：纯星星
                if (slotIndex <= 9) return 1;    // 第 8~9 个：1 个条件
                if (slotIndex <= 11) return 2;   // 第 10~11 个：2 个条件
                return 3;                         // 第 12+ 个：3 个条件
            },

            // 获取条件难度等级
            getConditionTier: function(slotIndex) {
                if (slotIndex <= 7) return 0;
                if (slotIndex <= 9) return 1;
                if (slotIndex <= 11) return 2;
                return 3;
            },

            // 获取栏位的全部条件（含检查结果）
            getSlotConditions: function(slotIndex, ctx) {
                var count = this.getRequiredConditionCount(slotIndex);
                if (count === 0) return [];
                var tier = this.getConditionTier(slotIndex);
                var tierDef = this.CONDITION_TIERS[tier - 1];
                if (!tierDef) return [];

                var conditionKeys = ['pet_level', 'streak', 'interactions', 'checkin_rate'];
                var results = [];
                for (var i = 0; i < Math.min(count, conditionKeys.length); i++) {
                    var key = conditionKeys[i];
                    var val = tierDef.values[key];
                    var def = this.CONDITIONS[key];
                    var result = def.check(val, ctx);
                    results.push({ key: key, label: def.label(val), ...result });
                }
                return results;
            },

            // 检查栏位是否可解锁
            canUnlockSlot: function(slotIndex, stars, ctx) {
                var cost = this.getSlotCost(slotIndex);
                if (stars < cost) return false;
                var conditions = this.getSlotConditions(slotIndex, ctx);
                return conditions.every(c => c.met);
            },

            // 获取栏位状态摘要
            getSlotStatus: function(slotIndex, stars, ctx) {
                var cost = this.getSlotCost(slotIndex);
                var conditions = this.getSlotConditions(slotIndex, ctx);
                var canAfford = stars >= cost;
                var allMet = conditions.every(c => c.met);
                return {
                    slotIndex: slotIndex,
                    cost: cost,
                    conditions: conditions,
                    canAfford: canAfford,
                    allConditionsMet: allMet,
                    canUnlock: canAfford && allMet,
                };
            },
        };

        const PetShopView = ({ theme, activeChild, level, currentEra, ownedPets, setOwnedPets, petData, setPetData, activePet, setActivePet, totalStars, setStarHistory, petStats, setPetStats, checkAchievements, showToast, petSlots, setPetSlots, currentStreak, recentCheckinRate }) => {
            const [filter, setFilter] = useState('all');
            const [showSlotDialog, setShowSlotDialog] = useState(false);
            const myOwned = ownedPets[activeChild] || [];
            const currentStars = totalStars;

            // 栏位状态
            const unlockedSlots = (petSlots[activeChild] || PetSlotSystem.FREE_SLOTS);
            const usedSlots = myOwned.length;
            const freeSlots = Math.max(0, unlockedSlots - usedSlots);
            const nextSlot = unlockedSlots + 1;
            const slotCtx = { ownedPets: myOwned, petData: petData[activeChild] || {}, currentStreak: currentStreak || 0, recentCheckinRate: recentCheckinRate || 0 };
            const nextSlotStatus = PetSlotSystem.getSlotStatus(nextSlot, currentStars, slotCtx);

            const filteredPets = petCatalog.filter(p => {
                if (filter === 'all') return true;
                return p.rarity === filter;
            });

            // 手动解锁栏位（从弹窗触发）
            const handleUnlockSlot = () => {
                if (!nextSlotStatus.canUnlock) return;
                setStarHistory(prev => ({ ...prev, [`${activeChild}-STAR_PET_SLOT-${Date.now()}`]: -nextSlotStatus.cost }));
                setPetSlots(prev => ({ ...prev, [activeChild]: nextSlot }));
                showToast(`🔓 已开启第 ${nextSlot} 个栏位（-${nextSlotStatus.cost} ⭐）`);
                setShowSlotDialog(false);
                safeTriggerSyncUpload();
            };

            const handleBuy = (petId) => {
                const catalog = petCatalog.find(p => p.id === petId);
                if (!catalog) return;
                if (myOwned.includes(petId)) return showToast('你已经拥有这只宠物啦');
                // 等级/纪元检查（在扣星前执行，防止误扣）
                if (level < catalog.unlockLevel) return showToast(`需要达到 ${catalog.unlockLevel} 级才能领养`);
                if (catalog.era) {
                    const eraOrder = (typeof ERA_ORDER !== 'undefined') ? ERA_ORDER : ['远古之路','文明初曙','周·礼制与争鸣','秦·铁血与一统','汉·雄风与凿空西域','魏晋隋唐·融合与登科','五代·乱世更迭','宋·文道昌盛','元·四海交融','明·日月重开'];
                    const myIdx = eraOrder.indexOf(currentEra);
                    const reqIdx = eraOrder.indexOf(catalog.era);
                    if (reqIdx > myIdx) return showToast(`需要解锁「${catalog.era}」时代`);
                }
                let remainingStars = currentStars;
                // 栏位检查
                if (freeSlots <= 0) {
                    const nextSlot = unlockedSlots + 1;
                    const slotStatus = PetSlotSystem.getSlotStatus(nextSlot, currentStars, {
                        ownedPets: myOwned, petData: petData[activeChild] || {},
                        currentStreak: currentStreak || 0, recentCheckinRate: recentCheckinRate || 0,
                    });
                    if (!slotStatus.allConditionsMet) {
                        return showToast('栏位已满，且解锁条件尚未达成');
                    }
                    if (!slotStatus.canAfford) {
                        return showToast(`栏位已满！开启新栏位需要 ${slotStatus.cost} ⭐，当前只有 ${currentStars} ⭐`);
                    }
                    // 自动扣星星解锁栏位
                    remainingStars = currentStars - slotStatus.cost;
                    setStarHistory(prev => ({ ...prev, [`${activeChild}-STAR_PET_SLOT-${Date.now()}`]: -slotStatus.cost }));
                    setPetSlots(prev => ({ ...prev, [activeChild]: nextSlot }));
                    showToast(`🔓 已开启第 ${nextSlot} 个栏位（-${slotStatus.cost} ⭐）`);
                }
                if (remainingStars < catalog.price) return showToast(`星星不够啦！需要 ${catalog.price} ⭐，当前只有 ${remainingStars} ⭐`);

                if (catalog.price > 0) {
                    setStarHistory(prev => ({ ...prev, [`${activeChild}-STAR_PET_BUY-${petId}-${Date.now()}`]: -catalog.price }));
                    setPetStats(prev => ({
                        ...prev,
                        [activeChild]: { ...(prev[activeChild] || {}), totalStarsSpent: ((prev[activeChild] || {}).totalStarsSpent || 0) + catalog.price },
                    }));
                }

                const newPet = {
                    id: petId, nickname: catalog.name, adoptedAt: new Date().toISOString(),
                    stats: { fullness: 80, cleanliness: 80, mood: 80 },
                    interactionCount: 0, lastInteraction: null, currentState: 'idle',
                };

                setPetData(prev => ({ ...prev, [activeChild]: { ...(prev[activeChild] || {}), [petId]: newPet } }));
                setOwnedPets(prev => ({ ...prev, [activeChild]: [...(prev[activeChild] || []), petId] }));
                if (!activePet[activeChild]) {
                    setActivePet(prev => ({ ...prev, [activeChild]: petId }));
                }
                showToast(`🎉 成功领养了 ${catalog.name}！`);
                checkAchievements('pet_adopt', { petId, rarity: catalog.rarity });
                safeTriggerSyncUpload();
            };

            return (
                <div className="p-4 space-y-4">
                    {/* 栏位状态栏 */}
                    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${freeSlots <= 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">🐾</span>
                            <span className="text-xs font-medium text-gray-600">
                                栏位 <span className={`font-bold ${freeSlots <= 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{usedSlots}</span>/{unlockedSlots}
                            </span>
                            {freeSlots > 0 && <span className="text-xs text-gray-400">（空闲 {freeSlots}）</span>}
                        </div>
                        {freeSlots <= 0 && (
                            <button onClick={() => setShowSlotDialog(true)}
                                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${nextSlotStatus.canUnlock ? 'bg-amber-400 text-white hover:bg-amber-500' : nextSlotStatus.allConditionsMet ? 'bg-amber-200 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                                🔓 开启新栏位
                            </button>
                        )}
                    </div>

                    {/* 筛选栏 */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {[
                            { key: 'all', label: '全部' },
                            { key: 'common', label: '凡品' },
                            { key: 'rare', label: '良品' },
                            { key: 'epic', label: '珍品' },
                            { key: 'legendary', label: '神品' },
                        ].map(f => (
                            <button key={f.key} onClick={() => setFilter(f.key)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                                    filter === f.key ? `${theme.primaryBg} text-white` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}>{f.label}</button>
                        ))}
                    </div>

                    {/* 宠物卡片网格 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filteredPets.map(pet => {
                            const isOwned = myOwned.includes(pet.id);
                            const levelOk = level >= pet.unlockLevel && (!pet.era || (() => {
                        const eraOrder = (typeof ERA_ORDER !== 'undefined') ? ERA_ORDER : ['远古之路','文明初曙','周·礼制与争鸣','秦·铁血与一统','汉·雄风与凿空西域','魏晋隋唐·融合与登科','五代·乱世更迭','宋·文道昌盛','元·四海交融','明·日月重开'];
                        return eraOrder.indexOf(currentEra) >= eraOrder.indexOf(pet.era);
                    })());
                            const canAffordPet = currentStars >= pet.price;
                            const slotFull = freeSlots <= 0 && !isOwned;
                            const rarityColors = { common: 'border-amber-300 bg-amber-50', rare: 'border-slate-300 bg-slate-50', epic: 'border-yellow-300 bg-yellow-50', legendary: 'border-purple-300 bg-purple-50' };

                            // 按钮状态决定
                            let btnText = '领养';
                            let btnDisabled = false;
                            let btnCls = `${theme.primaryBg} text-white hover:opacity-90 active:scale-95`;
                            if (isOwned) {
                                btnText = '✅ 已拥有'; btnDisabled = true; btnCls = 'bg-green-50 text-green-600 cursor-default';
                            } else if (!levelOk) {
                                btnText = '🔒 锁定'; btnDisabled = true; btnCls = 'bg-gray-200 text-gray-400 cursor-not-allowed';
                            } else if (slotFull) {
                                if (!nextSlotStatus.allConditionsMet) {
                                    btnText = '🔒 条件未满'; btnDisabled = true; btnCls = 'bg-gray-200 text-gray-400 cursor-not-allowed';
                                } else if (!nextSlotStatus.canAfford) {
                                    btnText = `🔒 栏位满`; btnDisabled = true; btnCls = 'bg-gray-200 text-gray-400 cursor-not-allowed';
                                } else {
                                    const totalCost = nextSlotStatus.cost + pet.price;
                                    btnText = `🔓 ${totalCost}⭐`; btnDisabled = false; btnCls = 'bg-amber-400 text-white hover:bg-amber-500 active:scale-95';
                                }
                            } else if (!canAffordPet) {
                                btnText = '⭐ 不足'; btnDisabled = true; btnCls = 'bg-gray-200 text-gray-400 cursor-not-allowed';
                            }

                            return (
                                <div key={pet.id} className={`rounded-xl border-2 p-3 text-center transition-all hover:shadow-md ${rarityColors[pet.rarity] || 'border-gray-200 bg-white'}`}>
                                    <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                                        <PetImage petId={pet.id} src={'pet_animations/' + pet.id + '/' + pet.id + '-thumb.png'} fallbackEmoji={pet.emoji} className="w-16 h-16 object-contain" />
                                    </div>
                                    <div className="font-bold text-sm text-gray-800">{pet.name}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{pet.rarity === 'common' ? '凡品' : pet.rarity === 'rare' ? '良品' : pet.rarity === 'epic' ? '珍品' : '神品'}</div>
                                    {pet.price > 0 && <div className="text-xs text-amber-600 font-medium mt-1">⭐ {pet.price}</div>}
                                    {pet.unlockLevel > 1 && <div className="text-xs text-gray-400">Lv.{pet.unlockLevel} 解锁</div>}
                                    <div className="mt-2">
                                        {!isOwned && slotFull && nextSlotStatus.allConditionsMet && nextSlotStatus.canAfford && (
                                            <div className="text-[10px] text-amber-500 mb-1">含栏位 {nextSlotStatus.cost}⭐</div>
                                        )}
                                        <button onClick={() => handleBuy(pet.id)} disabled={btnDisabled}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${btnCls}`}>
                                            {btnText}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 栏位解锁弹窗 */}
                    {showSlotDialog && (
                        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowSlotDialog(false)}>
                            <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden mx-4" onClick={e => e.stopPropagation()}>
                                <div className="p-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white">
                                    <div className="font-bold">🔓 开启第 {nextSlot} 个宠物栏位</div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {/* 费用 */}
                                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-50">
                                        <span className="text-xs text-gray-600">费用</span>
                                        <span className={`text-sm font-bold ${nextSlotStatus.canAfford ? 'text-amber-600' : 'text-red-500'}`}>
                                            ⭐ {nextSlotStatus.cost}
                                            <span className="text-xs font-normal text-gray-400 ml-1">（当前 {currentStars}）</span>
                                        </span>
                                    </div>

                                    {/* 额外条件 */}
                                    {nextSlotStatus.conditions.length > 0 && (
                                        <div>
                                            <div className="text-xs text-gray-400 mb-1.5">额外条件</div>
                                            <div className="space-y-1.5">
                                                {nextSlotStatus.conditions.map((c, i) => (
                                                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${c.met ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                                                        <span className={`shrink-0 ${c.met ? 'text-emerald-500' : 'text-gray-300'}`}>{c.met ? '✅' : '⬜'}</span>
                                                        <span className={c.met ? 'text-emerald-600' : 'text-gray-500'}>{c.label}</span>
                                                        <span className={`ml-auto text-xs ${c.met ? 'text-emerald-400' : 'text-gray-400'}`}>{c.current}/{c.target}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 提示 */}
                                    {!nextSlotStatus.allConditionsMet && (
                                        <div className="text-xs text-center text-gray-400 py-1">💡 完成上方条件后即可开启</div>
                                    )}
                                </div>
                                <div className="p-3 border-t border-gray-100 flex gap-2">
                                    <button onClick={() => setShowSlotDialog(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-500 transition-colors">取消</button>
                                    <button onClick={handleUnlockSlot} disabled={!nextSlotStatus.canUnlock}
                                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${nextSlotStatus.canUnlock ? 'bg-amber-400 text-white hover:bg-amber-500' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                                        {nextSlotStatus.canUnlock ? `确认开启 ⭐${nextSlotStatus.cost}` : '条件不足'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        const PetAlbumView = ({ theme, activeChild, ownedPets, petData }) => {
            const myOwned = ownedPets[activeChild] || [];

            return (
                <div className="p-4 space-y-4">
                    <div className="text-center mb-2">
                        <span className="text-sm text-gray-500">已收集: <span className="font-bold text-gray-800">{myOwned.length}</span>/{petCatalog.length}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {petCatalog.map(pet => {
                            const isOwned = myOwned.includes(pet.id);
                            const childPetData = petData[activeChild]?.[pet.id];

                            return (
                                <div key={pet.id} className={`rounded-xl border p-3 text-center transition-all ${isOwned ? 'bg-white border-gray-200 hover:shadow-md' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                    <div className={`w-16 h-16 mx-auto mb-2 flex items-center justify-center ${!isOwned ? 'grayscale' : ''}`}>
                                        {isOwned ? (
                                            <PetImage petId={pet.id} src={'pet_animations/' + pet.id + '/' + pet.id + '-thumb.png'} fallbackEmoji={pet.emoji} className="w-16 h-16 object-contain" />
                                        ) : (
                                            <span className="text-4xl">❓</span>
                                        )}
                                    </div>
                                    <div className="font-bold text-sm text-gray-800">{isOwned ? pet.name : '???'}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{pet.rarity === 'common' ? '凡品' : pet.rarity === 'rare' ? '良品' : pet.rarity === 'epic' ? '珍品' : '神品'}</div>
                                    {isOwned && (
                                        <div className="mt-2 text-xs text-gray-400 space-y-0.5">
                                            <div>{pet.species} · {petElements[pet.attributes?.element]?.icon || '⚪'} {petElements[pet.attributes?.element]?.name || '无'}</div>
                                            <div>性格: {pet.personality}</div>
                                            <div>喜爱: {pet.favoriteFood}</div>
                                            {childPetData && <div>互动: {childPetData.interactionCount} 次</div>}
                                        </div>
                                    )}
                                    {!isOwned && <div className="text-xs text-gray-400 mt-2">未解锁</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        };

        // ==================== 探险视图组件 ====================
        // 探险出发确认卡片
        const AdventureConfirmModal = ({ show, onClose, onConfirm, realm, pet, petCatalog, foodCount, adventureConfig }) => {
            const cfg = adventureConfig || {};
            const hours = Math.ceil(realm?.duration ? realm.duration / 3600000 : 1);
            const hungerPerHour = cfg.hungerPerHour || 10;
            const foodHungerReduction = cfg.foodHungerReduction || 5;
            const fullness = pet?.stats?.fullness || 0;
            const cleanliness = pet?.stats?.cleanliness || 0;
            const foodNeeded = hours;
            const hasEnoughFood = foodCount >= foodNeeded;
            const [bringFood, setBringFood] = React.useState(hasEnoughFood && hours * hungerPerHour > 50);

            if (!show || !realm || !pet) return null;
            // 使用与 handleStartAdventure 相同的计算公式
            const { effectiveCost } = calcAdventureHungerCost(realm.duration, hungerPerHour, foodHungerReduction, bringFood);
            const afterFullness = Math.max(0, fullness - effectiveCost);
            const totalFoodCost = foodNeeded * 5;

            const catalog = petCatalog?.find(c => c.id === pet.id);
            const petName = pet.nickname || catalog?.name || '宠物';

            // 出发门槛用领域配置（与 handleStartAdventure 同一套判定，消除"能点却被拦"的割裂）
            const minFullness = (typeof realm.minFullness === 'number') ? realm.minFullness : 1;
            const cleanThreshold = (typeof realm.minCleanliness === 'number') ? realm.minCleanliness : 0;

            const hungerOk = fullness >= minFullness;
            const cleanOk = cleanliness >= cleanThreshold;
            const canGo = hungerOk && cleanOk;

            const hungerMsg = !hungerOk ? `🍖 饱食度不足（当前 ${fullness}%，需要 ${minFullness}%）` : '';
            const cleanMsg = !cleanOk ? `🛁 清洁度不足（当前 ${cleanliness}%，需要 ${cleanThreshold}%）` : '';

            return (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className={`p-4 bg-gradient-to-r ${realm.color || 'from-amber-400 to-orange-500'} text-white`}>
                            <h3 className="text-lg font-bold flex items-center gap-2">🚀 前往「{realm.name}」探险</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* 宠物状态 */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <span className="text-2xl">{catalog?.emoji || '🐾'}</span>
                                <div className="flex-1">
                                    <div className="font-bold text-sm text-gray-800">{petName}</div>
                                    <div className="flex gap-3 mt-1 text-xs">
                                        <span className={fullness >= 50 ? 'text-emerald-600' : 'text-red-500'}>🍖 {fullness}%</span>
                                        <span className={cleanliness >= 50 ? 'text-emerald-600' : 'text-red-500'}>🛁 {cleanliness}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* 预计消耗 */}
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>⏱️ 预计 {hours} 小时</span>
                                <span>⭐ 消耗 {realm.starCost} 星星</span>
                            </div>

                            {/* 食物包选项 */}
                            {foodCount > 0 && (
                                <label className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl cursor-pointer border border-amber-100">
                                    <input type="checkbox" checked={bringFood} onChange={e => setBringFood(e.target.checked)} disabled={!hasEnoughFood} className="w-4 h-4 accent-amber-500" />
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-amber-800">
                                            🍙 探险干粮 — 需要 {foodNeeded} 个（库存 {foodCount}）
                                            {!hasEnoughFood && <span className="text-red-500 text-xs ml-2">库存不足</span>}
                                        </div>
                                        <div className="text-xs text-amber-600 mt-0.5">
                                            {bringFood ? `消耗后饱食度预计剩余 ${afterFullness}%（消耗 ${totalFoodCost} 金元宝）` : `勾选后饱食度消耗减半（${totalFoodCost} 金元宝）`}
                                        </div>
                                    </div>
                                </label>
                            )}

                            {/* 状态检查提示 */}
                            {hungerMsg && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{hungerMsg}</p>}
                            {cleanMsg && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{cleanMsg}</p>}

                            {/* 按钮 */}
                            <div className="flex gap-3 pt-2">
                                <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors">取消</button>
                                <button
                                    onClick={() => { onConfirm(bringFood); onClose(); }}
                                    disabled={!canGo}
                                    className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${canGo ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-md hover:shadow-lg active:scale-95' : 'bg-gray-300 cursor-not-allowed'}`}
                                >🚀 出发！</button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        const PetAdventureView = ({ activeChild, petData, activePet, ownedPets, petAdventures, setPetAdventures, petAdventureLog, petAdventureStats, totalStars, level, currentEra, handleStartAdventure, handleCancelAdventure, handleCompleteAdventure, handleDismissAdventure, handleDismissAllAdventures, triggerSyncUpload, getAdventureMultiplierStatus, showToast, aiEnabled, deepseekApiKey, callDeepSeekAPI, inventory, petCatalog, adventureConfig }) => {
            const [selectedRealm, setSelectedRealm] = useState(null);
            const [showGuide, setShowGuide] = useState(false);
            const [now, setNow] = useState(Date.now());
            const [selectedPetForAdventure, setSelectedPetForAdventure] = useState(null);
            const [lootTooltip, setLootTooltip] = useState(null); // { realmId, source: 'hover'|'click' }
            const [adventurePetDialog, setAdventurePetDialog] = useState('');
            const [confirmRealm, setConfirmRealm] = useState(null);

            const currentStars = totalStars;
            const advArr = Array.isArray(petAdventures[activeChild]) ? petAdventures[activeChild] : [];
            const foodCount = (typeof inventory !== 'undefined' && inventory[activeChild]) ? (inventory[activeChild]['item_adventure_food'] || 0) : 0;
            
            // 分组归类探险：已完成结算、到期未结算、正在进行中
            const completedAdvs = advArr.filter(a => a.status === 'completed' && a.result);
            const readyToClaimAdvs = advArr.filter(a => a.status === 'active' && now >= a.expectedEndTime);
            const ongoingAdvs = advArr.filter(a => a.status === 'active' && now < a.expectedEndTime);
            const activeAdvs = advArr.filter(a => a.status === 'active');
            const hasAnyAdventures = completedAdvs.length > 0 || readyToClaimAdvs.length > 0 || ongoingAdvs.length > 0;
            
            const log = (petAdventureLog[activeChild] || []);
            const stats = (petAdventureStats[activeChild] || {});
            const myOwned = ownedPets[activeChild] || [];

            // 正在探险中的宠物 ID 集合
            const adventuringPetIds = new Set(activeAdvs.map(a => a.petId));

            // 计时器：每秒更新当前时间（有活跃探险时）
            useEffect(() => {
                if (!activeAdvs.length) return;
                const timer = setInterval(() => setNow(Date.now()), 1000);
                return () => clearInterval(timer);
            }, [activeAdvs.length > 0]);

            // 自动为已到期的探险执行结算
            useEffect(() => {
                const dueAdvs = advArr.filter(a => a.status === 'active' && Date.now() >= a.expectedEndTime);
                if (dueAdvs.length > 0 && typeof handleCompleteAdventure === 'function') {
                    dueAdvs.forEach(adv => {
                        handleCompleteAdventure(activeChild, adv.id, false);
                    });
                }
            }, [advArr, activeChild, handleCompleteAdventure]);

            // 单个领宝结算交互
            const handleClaimSingle = (advId) => {
                if (typeof handleCompleteAdventure === 'function') {
                    handleCompleteAdventure(activeChild, advId, true);
                }
            };

            // 收下单个已结算探险的战利品并移除卡片（设置 claimed 墓碑并同步云端）
            const handleDismissCompleted = (advId) => {
                if (typeof window !== 'undefined' && window.confetti) {
                    window.confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
                }
                if (typeof showToast === 'function') {
                    showToast('战利品已悉数收入囊中！');
                }
                if (typeof handleDismissAdventure === 'function') {
                    handleDismissAdventure(activeChild, advId);
                } else {
                    setPetAdventures(prev => ({
                        ...prev,
                        [activeChild]: (Array.isArray(prev[activeChild]) ? prev[activeChild] : []).map(a => a.id === advId ? { ...a, status: 'claimed', claimedAt: Date.now() } : a)
                    }));
                    if (typeof triggerSyncUpload === 'function') triggerSyncUpload();
                }
            };

            // 一键收下所有已结算战利品
            const handleDismissAllCompleted = () => {
                if (typeof window !== 'undefined' && window.confetti) {
                    window.confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
                }
                if (typeof showToast === 'function') {
                    showToast(`已全部收下 ${completedAdvs.length} 份历练战利品！`);
                }
                if (typeof handleDismissAllAdventures === 'function') {
                    handleDismissAllAdventures(activeChild);
                } else {
                    const completedIds = new Set(completedAdvs.map(a => a.id));
                    setPetAdventures(prev => ({
                        ...prev,
                        [activeChild]: (Array.isArray(prev[activeChild]) ? prev[activeChild] : []).map(a => completedIds.has(a.id) ? { ...a, status: 'claimed', claimedAt: Date.now() } : a)
                    }));
                    if (typeof triggerSyncUpload === 'function') triggerSyncUpload();
                }
            };

            // 获取选中领域的倍率状态（传入选中宠物）
            const multiplierStatus = selectedRealm ? getAdventureMultiplierStatus(selectedRealm, selectedPetForAdventure) : null;

            // 领域元素图标
            const elemIcons = { fire: '🔥', water: '💧', earth: '🌿', wind: '🌀', light: '✨', dark: '🌙', none: '⚪' };

            // 剩余时间格式化
            const formatRemaining = (endTime) => {
                const diff = Math.max(0, endTime - now);
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                return `${h}时${m}分${s}秒`;
            };

            // 进度百分比（单条探险）
            const calcProgress = (adv) => { const d = adv.expectedEndTime - adv.startTime; return d <= 0 ? 100 : Math.min(100, ((now - adv.startTime) / d) * 100); };

            // 门控状态文案
            const gateLabel = (status) => {
                if (status === 'normal') return { text: '✅ 全额收益', color: 'text-emerald-600' };
                if (status === 'warning') return { text: '⚠️ 收益减半', color: 'text-amber-600' };
                return { text: '🚫 无法探险', color: 'text-red-600' };
            };

            return (
                <div className="p-4 space-y-4" onClick={() => { if (lootTooltip) setLootTooltip(null); }}>
                    {/* 顶部：星星余额 + 统计 + 帮助按钮 */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">⭐ <span className="font-bold text-amber-600">{currentStars}</span></span>
                            <span className="text-sm text-gray-500">探险 <span className="font-bold text-gray-800">{stats.totalAdventures || 0}</span> 次</span>
                        </div>
                        <button onClick={() => setShowGuide(true)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors text-sm font-bold">?</button>
                    </div>

                    {/* 历练核心现状区（置顶）：完成待收战利品 / 到期待领宝 / 历练倒计时 / 空闲状态 */}
                    <div className="space-y-3">
                        {/* 1. 已结算完成的战利品卡片 */}
                        {completedAdvs.length > 0 && (
                            <div className="space-y-3" data-testid="pet-completed-adv-container">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
                                        <span className="text-base animate-bounce">🎉</span>
                                        <span>历练捷报 · 战利品就绪（{completedAdvs.length}）</span>
                                    </div>
                                    {completedAdvs.length > 1 && (
                                        <button
                                            onClick={handleDismissAllCompleted}
                                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-300 transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            <span>🎁</span>
                                            <span>一键全收</span>
                                        </button>
                                    )}
                                </div>
                                {completedAdvs.map(adv => {
                                    const realm = adventureRealms.find(r => r.id === adv.realmId);
                                    const pet = petData[activeChild]?.[adv.petId];
                                    const petName = adv.petName || pet?.nickname || adv.petId;
                                    const res = adv.result || {};
                                    return (
                                        <div key={adv.id} data-testid={`pet-completed-adv-${adv.id}`} className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50/70 to-amber-50/50 rounded-2xl border-2 border-emerald-400 shadow-md p-4 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{realm?.icon || '🎉'}</span>
                                                    <div>
                                                        <div className="font-black text-sm text-stone-800 flex items-center gap-1.5">
                                                            <span>{petName} 历练归来！</span>
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">
                                                                {realm?.name || adv.realmName || '秘境'}
                                                            </span>
                                                        </div>
                                                        <div className="text-[11px] text-stone-400 mt-0.5">
                                                            历练圆满完成 · 丰收而归
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDismissCompleted(adv.id)}
                                                    className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-white/80 transition-colors"
                                                    title="收下并关闭"
                                                >
                                                    <XIcon className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {res.story && (
                                                <div className="bg-white/80 rounded-xl p-2.5 my-2 border border-emerald-100 text-xs text-stone-700 leading-relaxed shadow-2xs">
                                                    {res.story}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-3 gap-2 text-center my-2.5">
                                                {res.totalGold > 0 ? (
                                                    <div className="bg-amber-100/70 rounded-xl p-2 border border-amber-200">
                                                        <div className="text-[10px] text-stone-500 font-medium">金元宝</div>
                                                        <div className="font-black text-amber-600 text-sm">+{res.totalGold} 💰</div>
                                                    </div>
                                                ) : null}
                                                {res.totalXP > 0 ? (
                                                    <div className="bg-blue-100/70 rounded-xl p-2 border border-blue-200">
                                                        <div className="text-[10px] text-stone-500 font-medium">经验值</div>
                                                        <div className="font-black text-blue-600 text-sm">+{res.totalXP} ✨</div>
                                                    </div>
                                                ) : null}
                                                {res.totalStars > 0 ? (
                                                    <div className="bg-purple-100/70 rounded-xl p-2 border border-purple-200">
                                                        <div className="text-[10px] text-stone-500 font-medium">星星</div>
                                                        <div className="font-black text-purple-600 text-sm">+{res.totalStars} ⭐</div>
                                                    </div>
                                                ) : null}
                                            </div>

                                            {res.event && (
                                                <div className="text-xs text-center text-stone-600 bg-white/70 rounded-lg py-1 px-2 mb-2 border border-stone-100 font-medium">
                                                    奇遇：{res.event.icon} {res.event.name}
                                                </div>
                                            )}

                                            {/* 宝物明细 */}
                                            {res.items && res.items.length > 0 && (
                                                <div className="pt-2 border-t border-emerald-200/70">
                                                    <div className="text-[11px] font-bold text-emerald-800 mb-1.5 flex items-center gap-1">
                                                        <span>🎒 斩获宝物（{res.items.length}件）：</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {res.items.map((item, i) => (
                                                            <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border shadow-2xs ${
                                                                item.isTrap 
                                                                    ? 'bg-red-50 text-red-600 border-red-200' 
                                                                    : 'bg-white/90 text-stone-700 border-emerald-200'
                                                            }`}>
                                                                <span>{item.icon}</span>
                                                                <span>{item.name}</span>
                                                                {item.gold !== 0 && <span className="text-amber-600 font-bold">{item.gold > 0 ? '+' : ''}{item.gold}💰</span>}
                                                                {item.xp > 0 && <span className="text-blue-600 font-bold">+{item.xp}✨</span>}
                                                                {item.stars > 0 && <span className="text-purple-600 font-bold">+{item.stars}⭐</span>}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 收下战利品按钮 */}
                                            <button
                                                onClick={() => handleDismissCompleted(adv.id)}
                                                data-testid={`pet-claim-loot-btn-${adv.id}`}
                                                className="w-full mt-3 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                                            >
                                                <span>🎁</span>
                                                <span>收下战利品</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* 2. 到期等待领宝卡片（如果尚未结算） */}
                        {readyToClaimAdvs.length > 0 && (
                            <div className="space-y-3" data-testid="pet-ready-claim-container">
                                <div className="text-xs font-black text-amber-700 flex items-center gap-1.5">
                                    <span className="text-base animate-spin">⏳</span>
                                    <span>探险已到期 · 等待领宝（{readyToClaimAdvs.length}）</span>
                                </div>
                                {readyToClaimAdvs.map(adv => {
                                    const realm = adventureRealms.find(r => r.id === adv.realmId);
                                    const pet = petData[activeChild]?.[adv.petId];
                                    const petName = adv.petName || pet?.nickname || adv.petId;
                                    return (
                                        <div key={adv.id} data-testid={`pet-ready-adv-${adv.id}`} className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/60 rounded-2xl border-2 border-amber-400 shadow-md p-4 animate-pulse">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-2xl">{realm?.icon || '🧭'}</span>
                                                    <div>
                                                        <div className="font-bold text-sm text-stone-800">{petName} 历练完成！</div>
                                                        <div className="text-xs text-amber-700 font-medium">探索「{realm?.name || '秘境'}」结束，快来开箱领宝</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleClaimSingle(adv.id)}
                                                data-testid={`pet-settle-claim-btn-${adv.id}`}
                                                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                                            >
                                                <span>🎁</span>
                                                <span>立即领宝结算</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* 3. 进行中的探险倒计时卡片 */}
                        {ongoingAdvs.length > 0 && (
                            <div className="space-y-2" data-testid="pet-ongoing-adv-container">
                                <div className="text-xs font-black text-indigo-700 flex items-center gap-1.5">
                                    <span className="text-base animate-pulse">🏃</span>
                                    <span>正在历练中（{ongoingAdvs.length}）</span>
                                </div>
                                {ongoingAdvs.map(adv => {
                                    const realm = adventureRealms.find(r => r.id === adv.realmId);
                                    const pet = petData[activeChild]?.[adv.petId];
                                    const petName = adv.petName || pet?.nickname || adv.petId;
                                    const pct = calcProgress(adv);
                                    return (
                                        <div key={adv.id} data-testid={`pet-ongoing-adv-${adv.id}`} className="bg-gradient-to-br from-indigo-50/90 to-purple-50/80 rounded-2xl border border-indigo-200 p-4 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-2xl">{realm?.icon || '🗺️'}</span>
                                                    <div>
                                                        <div className="font-bold text-sm text-stone-800">{realm?.name || '探险'}</div>
                                                        <div className="text-xs text-indigo-600 font-medium">{petName} 出发中</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`确定要召回正在「${realm?.name || '秘境'}」历练的「${petName}」吗？\n注意：提前召回将不会获得任何奖励，消耗的星星也不退还。`)) {
                                                            handleCancelAdventure(adv.id);
                                                        }
                                                    }}
                                                    className="text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200/70 transition-colors font-bold cursor-pointer"
                                                >
                                                    召回
                                                </button>
                                            </div>
                                            <div className="relative h-3 bg-white/70 rounded-full overflow-hidden mb-2 border border-indigo-100">
                                                <div
                                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-stone-500 font-medium">
                                                <span>剩余 {formatRemaining(adv.expectedEndTime)}</span>
                                                <span className="font-bold text-indigo-600">{Math.round(pct)}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* 4. 无正在历练或完成探险时的温馨占位提示 */}
                        {!hasAnyAdventures && (
                            <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-stone-50 rounded-2xl border border-dashed border-amber-300 p-4 text-center">
                                <div className="text-2xl mb-1">🏕️</div>
                                <div className="font-bold text-sm text-stone-700">当前暂无正在历练的灵宠</div>
                                <div className="text-xs text-stone-500 mt-1">在下方挑选秘境与灵宠，出发寻珍夺宝吧！</div>
                            </div>
                        )}
                    </div>

                    {/* 领域选择 */}
                    <div>
                        <div className="text-xs font-bold text-gray-500 mb-2">🗺️ 选择探险领域</div>
                        <div className="space-y-2">
                            {adventureRealms.map(realm => {
                                const isLocked = (level || 1) < realm.unlockLevel;
                                const eraOrder = (typeof ERA_ORDER !== 'undefined') ? ERA_ORDER : ['远古之路', '文明初曙', '周·礼制与争鸣', '秦·铁血与一统', '汉·雄风与凿空西域', '魏晋隋唐·融合与登科', '五代·乱世更迭', '宋·文道昌盛', '元·四海交融', '明·日月重开'];
                                const isEraLocked = realm.unlockEra && eraOrder.indexOf(currentEra) < eraOrder.indexOf(realm.unlockEra);
                                const isSelected = selectedRealm === realm.id;
                                const status = selectedPetForAdventure ? getAdventureMultiplierStatus(realm.id, selectedPetForAdventure) : null;

                                return (
                                    <div key={realm.id}
                                        role="button"
                                        tabIndex={isLocked || isEraLocked ? -1 : 0}
                                        onClick={() => !isLocked && !isEraLocked && setSelectedRealm(realm.id)}
                                        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !isLocked && !isEraLocked) { e.preventDefault(); setSelectedRealm(realm.id); } }}
                                        className={`w-full text-left rounded-2xl border p-3.5 transition-all ${isSelected ? 'border-amber-400 bg-amber-50 shadow-md' : isLocked || isEraLocked ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm cursor-pointer'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-2xl">{realm.icon}</span>
                                                <div>
                                                    <div className="font-bold text-sm text-gray-800">{realm.name}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">{realm.desc}</div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 ml-2">
                                                {isLocked ? (
                                                    <div className="text-xs text-gray-400">🔒 Lv.{realm.unlockLevel}</div>
                                                ) : isEraLocked ? (
                                                    <div className="text-xs text-gray-400">🔒 {realm.unlockEra}</div>
                                                ) : (
                                                    <div className="relative">
                                                        <div className="text-xs font-bold text-amber-600">{realm.starCost} ⭐</div>
                                                        <div className="text-xs text-gray-400">{Math.round(realm.duration / 3600000)}小时 · {elemIcons[realm.element]} {realm.element}</div>
                                                        <div className="text-xs text-gray-400 cursor-pointer hover:text-amber-600 hover:underline"
                                                            onMouseEnter={() => setLootTooltip({ realmId: realm.id, source: 'hover' })}
                                                            onMouseLeave={() => { if (lootTooltip?.source === 'hover') setLootTooltip(null); }}
                                                            onClick={(e) => { e.stopPropagation(); setLootTooltip(prev => prev?.realmId === realm.id && prev?.source === 'click' ? null : { realmId: realm.id, source: 'click' }); }}>
                                                            宝物 {realm.minItems}~{realm.maxItems + realm.maxBondBonus + realm.maxLuckyBonus} 件
                                                        </div>
                                                        {/* 宝物列表 tooltip */}
                                                        {lootTooltip?.realmId === realm.id && (() => {
                                                            const lootTable = (typeof ADVENTURE_LOOT_TABLES !== 'undefined') ? ADVENTURE_LOOT_TABLES[realm.id] : null;
                                                            if (!lootTable) return null;
                                                            const typeColors = { gold: 'text-amber-600', xp: 'text-blue-600', stars: 'text-purple-600', item: 'text-gray-500' };
                                                            return (
                                                                <div className="absolute right-0 top-full mt-1 z-50 w-64 max-h-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                                                                    onMouseEnter={() => setLootTooltip({ realmId: realm.id, source: 'hover' })}
                                                                    onMouseLeave={() => { if (lootTooltip?.source === 'hover') setLootTooltip(null); }}>
                                                                    <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-100 text-xs font-bold text-amber-700">{realm.icon} {realm.name} · 宝物一览</div>
                                                                    <div className="overflow-y-auto max-h-60 p-1.5 space-y-0.5">
                                                                        {lootTable.map((item, i) => (
                                                                            <div key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${item.isTrap ? 'bg-red-50' : ''}`}>
                                                                                <span className="shrink-0">{item.icon}</span>
                                                                                <span className={`truncate ${item.isTrap ? 'text-red-500 font-bold' : 'text-gray-700'}`}>{item.name}</span>
                                                                                <span className={`ml-auto shrink-0 ${typeColors[item.type] || 'text-gray-400'}`}>
                                                                                    {item.type === 'stars' ? `+${item.fixed}⭐` :
                                                                                     item.type === 'item' ? '道具' :
                                                                                     item.type === 'gold' && item.multiplier ? (item.multiplier[0] < 0 ? `${item.multiplier[0]}×` : item.multiplier[0] === item.multiplier[1] ? `×${item.multiplier[0]}` : `×${item.multiplier[0]}~${item.multiplier[1]}`) :
                                                                                     item.type === 'gold_stars' && item.goldMul ? `×${item.goldMul[0]}${item.starsFixed ? ` +${item.starsFixed}⭐` : ''}` :
                                                                                     item.type === 'gold_xp_stars' && item.goldMul ? `×${item.goldMul[0]}${item.xpMul ? ` +${item.xpMul[0]}✨` : ''}${item.starsFixed ? ` +${item.starsFixed}⭐` : ''}` :
                                                                                     item.type === 'gold_xp' && item.goldMul ? `×${item.goldMul[0]}${item.xpMul ? ` +${item.xpMul[0]}✨` : ''}` :
                                                                                     item.multiplier ? `×${item.multiplier[0]}` : '?'}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {isSelected && !isLocked && !isEraLocked && (
                                            <div className="mt-3 pt-3 border-t border-amber-100">
                                                {/* 宠物选择 */}
                                                <div className="mb-3">
                                                    <div className="text-xs text-gray-500 mb-2">选择探险宠物：</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {myOwned.map(pid => {
                                                            const p = petData[activeChild]?.[pid];
                                                            const cat = (typeof PET_CATALOG !== 'undefined' ? PET_CATALOG : []).find(c => c.id === pid);
                                                            const isAdventuring = adventuringPetIds.has(pid);
                                                            const isPetSelected = selectedPetForAdventure === pid;
                                                            const petElem = cat?.attributes?.element || 'none';
                                                            const realmElemStrong = petElements[petElem]?.strong;
                                                            const elemMatch = realmElemStrong === realm.element ? '克制 ✅' : (petElements[realm.element]?.strong === petElem ? '被克 ⚠️' : '');
                                                            return (
                                                                <div key={pid} className="relative flex flex-col items-center">
                                                                <button onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (!isAdventuring) {
                                                                            setSelectedPetForAdventure(pid);
                                                                            // AI 探险对话
                                                                            if (aiEnabled && deepseekApiKey) {
                                                                                const personality = (petPersonalities[pid] || {});
                                                                                const petName = p?.nickname || cat?.name || '宠物';
                                                                                const mood = p?.stats?.mood || 50;
                                                                                const fullness = p?.stats?.fullness || 50;
                                                                                const elemRelation = realmElemStrong === realm.element ? '你克制这个领域' : (petElements[realm.element]?.strong === petElem ? '你被这个领域克制' : '没有属性关系');
                                                                                const prompt = `你是${petName}，${activeChild}的宠物。性格：${personality.personality || '可爱'}。说话风格：${personality.speech_style || '可爱'}。你的元素是${petElements[petElem]?.name || '无'}。探险领域是${realm.name}（${petElements[realm.element]?.name || '无'}属性）。${elemRelation}。心情${mood}/100。请说一句关于这次探险的话（25字以内），不要用引号。`;
                                                                                setAdventurePetDialog('...');
                                                                                callDeepSeekAPI(prompt, '说说你的想法', []).then(reply => {
                                                                                    if (reply) setAdventurePetDialog(reply.replace(/^[""「]|[""」]$/g, '').slice(0, 50));
                                                                                    else setAdventurePetDialog('');
                                                                                });
                                                                            } else {
                                                                                setAdventurePetDialog('');
                                                                            }
                                                                        }
                                                                    }}
                                                                    disabled={isAdventuring}
                                                                    className={`flex flex-col items-center px-3 py-2 rounded-xl border text-xs transition-all ${isAdventuring ? 'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50' : isPetSelected ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                                                    <div className="w-10 h-10 flex items-center justify-center">
                                                                        {cat?.thumbUrl ? (
                                                                            <img src={cat.thumbUrl} alt={cat.name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display=''; }} />
                                                                        ) : null}
                                                                        <span className={`text-xl ${cat?.thumbUrl ? 'hidden' : ''}`}>{cat?.emoji || '🐾'}</span>
                                                                    </div>
                                                                    <span className="font-bold text-gray-700 mt-0.5 truncate max-w-[48px]">{p?.nickname || cat?.name || pid}</span>
                                                                    {isAdventuring ? <span className="text-[8px] text-gray-400">探险中</span> : elemMatch ? <span className={`text-[8px] ${elemMatch.includes('✅') ? 'text-emerald-500' : 'text-red-400'}`}>{elemMatch}</span> : null}
                                                                </button>
                                                                {/* 宠物探险对话气泡 */}
                                                                {isPetSelected && adventurePetDialog && (
                                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 w-[160px] pointer-events-none">
                                                                        <div className="bg-white rounded-xl px-2.5 py-1.5 shadow-md border border-gray-100 relative">
                                                                            <p className="text-xs text-gray-600 leading-relaxed text-center">{adventurePetDialog}</p>
                                                                            <div className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-white drop-shadow-sm"></div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>);
                                                        })}
                                                    </div>
                                                </div>
                                                {/* 倍率预览 */}
                                                {status && status.gateStatus !== 'blocked' && (
                                                    <div className="flex items-center justify-end text-xs text-gray-500 mb-2">
                                                        <span className="text-emerald-600 font-bold">×{status.goldMul} 倍率</span>
                                                    </div>
                                                )}
                                                <button onClick={(e) => { e.stopPropagation(); setConfirmRealm(realm); }}
                                                    disabled={!selectedPetForAdventure || currentStars < realm.starCost}
                                                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${selectedPetForAdventure && currentStars >= realm.starCost ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md hover:shadow-lg active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                                    {!selectedPetForAdventure ? '🐾 请先选择宠物' : currentStars >= realm.starCost ? `🚀 出发！（${realm.starCost} ⭐）` : `⭐ 不够（需要 ${realm.starCost}）`}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 倍率状态面板 */}
                    {(() => {
                        const status = getAdventureMultiplierStatus(selectedRealm || 'forest', selectedPetForAdventure);
                        if (!status) return (
                            <div className="bg-white/70 rounded-2xl border border-gray-100 p-3 text-center text-gray-400 text-xs">
                                💡 在上方挑选秘境并选择宠物，即可查看专属倍率加成详情
                            </div>
                        );
                        const gate = gateLabel(status.gateStatus);
                        return (
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                                <div className="text-xs font-bold text-gray-500 mb-2">📊 当前探险收益状态</div>
                                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                    <div className="bg-amber-50 rounded-lg p-2 text-center">
                                        <div className="text-gray-400 text-xs">日均金元宝</div>
                                        <div className="font-bold text-amber-600">{status.dailyGoldBase} 💰</div>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                                        <div className="text-gray-400 text-xs">日均经验</div>
                                        <div className="font-bold text-blue-600">{status.dailyXPBase} ✨</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-500">近 7 天打卡率</span>
                                    <span className={`font-bold ${gate.color}`}>{Math.round(status.completionRate * 100)}% {gate.text}</span>
                                </div>
                                {status.gateStatus !== 'blocked' && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1 text-[11px]">
                                        {status.bondItemBonus > 0 && <div className="flex justify-between"><span className="text-gray-400">亲密度加成 ({status.bondLevelName})</span><span className="text-emerald-600 font-bold">+{Math.round(status.bondItemBonus * 100)}%</span></div>}
                                        {status.elementBonus > 0 && <div className="flex justify-between"><span className="text-gray-400">元素克制 ({elemIcons[status.petElement]}克{elemIcons[status.realmElement]})</span><span className="text-emerald-600 font-bold">+{Math.round(status.elementBonus * 100)}%</span></div>}
                                        {status.streakBonus.gold > 0 && <div className="flex justify-between"><span className="text-gray-400">打卡连击 ({status.streakDays}天)</span><span className="text-emerald-600 font-bold">+{Math.round(status.streakBonus.gold * 100)}%</span></div>}
                                        {status.skillBonus.goldBoost > 0 && <div className="flex justify-between"><span className="text-gray-400">宠物技能 ({status.skillBonus.skillName})</span><span className="text-emerald-600 font-bold">+{Math.round(status.skillBonus.goldBoost * 100)}%</span></div>}
                                        {status.skillBonus.xpBoost > 0 && <div className="flex justify-between"><span className="text-gray-400">宠物技能 ({status.skillBonus.skillName})</span><span className="text-blue-600 font-bold">经验+{Math.round(status.skillBonus.xpBoost * 100)}%</span></div>}
                                        <div className="flex justify-between pt-1 border-t border-gray-50">
                                            <span className="text-gray-500 font-bold">综合倍率</span>
                                            <span className="font-black text-amber-600">×{status.goldMul}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* 最近探险日志 */}
                    {log.length > 0 && (
                        <div>
                            <div className="text-xs font-bold text-gray-500 mb-2">📋 最近探险</div>
                            <div className="space-y-2">
                                {log.slice(0, 5).map(entry => (
                                    <div key={entry.id} className="bg-white rounded-xl border border-gray-100 p-3 text-xs">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <span>{entry.realmIcon}</span>
                                                <span className="font-bold text-gray-700">{entry.realmName}</span>
                                                <span className="text-gray-400">· {entry.petName}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(entry.endTime).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-gray-500 text-[11px] leading-relaxed mb-2">{entry.story}</p>
                                        <div className="flex gap-3 text-xs">
                                            {entry.totalGold > 0 && <span className="text-amber-600">💰 +{entry.totalGold}</span>}
                                            {entry.totalXP > 0 && <span className="text-blue-600">✨ +{entry.totalXP}</span>}
                                            {entry.totalStars > 0 && <span className="text-purple-600">⭐ +{entry.totalStars}</span>}
                                            {entry.event && <span className="text-gray-400">{entry.event.icon} {entry.event.name}</span>}
                                        </div>
                                        {entry.items && entry.items.length > 0 && (
                                            <div className="mt-2 pt-1.5 border-t border-gray-50 flex flex-wrap gap-1">
                                                {entry.items.map((item, i) => (
                                                    <span key={i} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs ${item.isTrap ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'}`}>
                                                        {item.icon} {item.name}
                                                        {item.gold !== 0 && <span className="text-amber-500">{item.gold > 0 ? '+' : ''}{item.gold}💰</span>}
                                                        {item.xp > 0 && <span className="text-blue-500">+{item.xp}✨</span>}
                                                        {item.stars > 0 && <span className="text-purple-500">+{item.stars}⭐</span>}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 探险统计 */}
                    {stats.totalAdventures > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                            <div className="text-xs font-bold text-gray-500 mb-2">📊 探险统计</div>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div><div className="text-gray-400 text-xs">总次数</div><div className="font-bold text-gray-800">{stats.totalAdventures || 0}</div></div>
                                <div><div className="text-gray-400 text-xs">总金元宝</div><div className="font-bold text-amber-600">{stats.totalGoldEarned || 0}</div></div>
                                <div><div className="text-gray-400 text-xs">总星星</div><div className="font-bold text-purple-600">{stats.totalStarsEarned || 0}</div></div>
                            </div>
                        </div>
                    )}

                    {/* 帮助弹窗 */}
                    {showGuide && (
                        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowGuide(false)}>
                            <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] shadow-2xl flex flex-col overflow-hidden mx-4" onClick={e => e.stopPropagation()}>
                                <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex justify-between items-center shrink-0">
                                    <div className="font-bold">❓ 探险寻宝指南</div>
                                    <button onClick={() => setShowGuide(false)} className="p-1 bg-white/20 hover:bg-white/30 rounded-full"><XIcon className="w-5 h-5" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-gray-600 leading-relaxed">
                                    <div>
                                        <div className="font-bold text-gray-800 mb-1">一、什么是探险？</div>
                                        <p>花费星星指派宠物出去探险寻宝。宠物归来后会带回各种宝物：金元宝 💰、经验值 ✨、星星 ⭐，甚至稀有道具！</p>
                                        <p className="mt-1">可以选择不同宠物出发，利用元素克制获得额外加成。多只宠物可以同时探险！</p>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 mb-1">二、收益计算</div>
                                        <p>宝物收益 = 日均基础 × 宝物倍率 × 加成系数</p>
                                        <p className="mt-1">日均基础 = 近 7 天平均每日收入。💡 学习越努力，探险收益越高！</p>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 mb-1">三、打卡门控</div>
                                        <p>· ≥ 50% → ✅ 全额收益</p>
                                        <p>· 30%~49% → ⚠️ 收益减半</p>
                                        <p>· {'<'} 30% → 🚫 无法探险</p>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 mb-2">四、加成系统总览</div>

                                        <div className="font-bold text-gray-700 mb-1 mt-2">🔥 元素克制</div>
                                        <div className="bg-gray-50 rounded-lg p-2 mb-2 text-xs">
                                            <p>火 {'>'} 风 {'>'} 地 {'>'} 水 {'>'} 火，光 {'<>'} 暗（互克）</p>
                                            <p className="text-emerald-600 font-bold">克制时宝物 +10%</p>
                                        </div>

                                        <div className="font-bold text-gray-700 mb-1">📅 打卡连击</div>
                                        <div className="bg-gray-50 rounded-lg p-2 mb-2 text-xs">
                                            <div className="grid grid-cols-4 gap-1 text-center font-bold text-gray-500 mb-1">
                                                <span>天数</span><span>金元宝</span><span>经验</span><span>星星</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-1 text-center"><span>3天</span><span>+5%</span><span>—</span><span>—</span></div>
                                            <div className="grid grid-cols-4 gap-1 text-center"><span>7天</span><span>+10%</span><span>+5%</span><span>—</span></div>
                                            <div className="grid grid-cols-4 gap-1 text-center"><span>14天</span><span>+15%</span><span>+10%</span><span>+5%</span></div>
                                            <div className="grid grid-cols-4 gap-1 text-center"><span>30天</span><span>+25%</span><span>+25%</span><span>+25%</span></div>
                                        </div>

                                        <div className="font-bold text-gray-700 mb-1">🤝 亲密度加成</div>
                                        <div className="bg-gray-50 rounded-lg p-2 mb-2 text-xs">
                                            <div className="grid grid-cols-3 gap-1 text-center font-bold text-gray-500 mb-1">
                                                <span>等级</span><span>宝物数量</span><span>稀有掉率</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-1 text-center"><span>陌生 0~20</span><span>0%</span><span>0%</span></div>
                                            <div className="grid grid-cols-3 gap-1 text-center"><span>初识 21~40</span><span>+5%</span><span>+2.5%</span></div>
                                            <div className="grid grid-cols-3 gap-1 text-center"><span>熟悉 41~60</span><span>+10%</span><span>+2.5%</span></div>
                                            <div className="grid grid-cols-3 gap-1 text-center"><span>好伙伴 61~80</span><span>+15%</span><span>+5%</span></div>
                                            <div className="grid grid-cols-3 gap-1 text-center"><span>最佳搭档 81~95</span><span>+20%</span><span>+7.5%</span></div>
                                            <div className="grid grid-cols-3 gap-1 text-center"><span>灵魂伴侣 96~100</span><span>+25%</span><span>+12.5%</span></div>
                                        </div>

                                        <div className="font-bold text-gray-700 mb-1">⚡ 宠物技能</div>
                                        <div className="bg-gray-50 rounded-lg p-2 text-xs space-y-0.5">
                                            <div className="flex justify-between"><span>🐕 泰迪 鼓励叫声</span><span className="text-amber-600 font-bold">金元宝 +10%</span></div>
                                            <div className="flex justify-between"><span>🐶 边牧 学习气场</span><span className="text-blue-600 font-bold">经验 +25%</span></div>
                                            <div className="flex justify-between"><span>🐰 安哥拉兔 蓬松拥抱</span><span className="text-emerald-600 font-bold">负面事件免疫</span></div>
                                            <div className="flex justify-between"><span>🦖 霸王龙 远古咆哮</span><span className="text-purple-600 font-bold">稀有掉率 +7.5%</span></div>
                                            <div className="flex justify-between"><span>🦫 卡皮巴拉 禅意气息</span><span className="text-cyan-600 font-bold">探险时间 -5%</span></div>
                                            <div className="flex justify-between"><span>🐺 哈士奇 狼嚎</span><span className="text-blue-600 font-bold">经验 +15%</span></div>
                                            <div className="flex justify-between"><span>🦎 蜥蜴 隐身术</span><span className="text-emerald-600 font-bold">负面事件免疫</span></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 mb-1">五、随机事件</div>
                                        <p>30% 概率触发随机事件：正面(60%)、负面(30%)、稀有(1.5%)</p>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 mb-1">六、属性变化</div>
                                        <p>探险每小时：饱腹 -10，清洁 -10，心情 +5</p>
                                    </div>
                                </div>
                                <div className="p-3 border-t border-gray-100 shrink-0">
                                    <button onClick={() => setShowGuide(false)} className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-600 transition-colors">知道了</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 探险出发确认卡片 */}
                    <AdventureConfirmModal
                        show={!!confirmRealm}
                        onClose={() => setConfirmRealm(null)}
                        onConfirm={(bringFood) => { handleStartAdventure(confirmRealm.id, selectedPetForAdventure, bringFood); setConfirmRealm(null); }}
                        realm={confirmRealm}
                        pet={selectedPetForAdventure ? petData[activeChild]?.[selectedPetForAdventure] : null}
                        petCatalog={petCatalog}
                        foodCount={foodCount}
                        adventureConfig={adventureConfig}
                    />

                </div>
            );
        };

        const PetModal = ({ show, onClose, initialTab = 'home', theme, activeChild, profiles, petData, setPetData, exemptedDays = {}, triggerSyncUpload, ownedPets, setOwnedPets, activePet, setActivePet, petCooldowns, setPetCooldowns, petStats, setPetStats, petMusicOn, setPetMusicOn, totalStars, setStarHistory, level, currentEra, achievements, setAchievements, lowPerfMode, checkAchievements, petAdventures, setPetAdventures, petAdventureLog, petAdventureStats, handleStartAdventure, handleCancelAdventure, handleCompleteAdventure, handleDismissAdventure, handleDismissAllAdventures, getAdventureMultiplierStatus, showToast, petSlots, setPetSlots, checkins, tasks, aiEnabled, aiPetEnabled, deepseekApiKey, callDeepSeekAPI, inventory, petCatalog, adventureConfig }) => {
            const [currentTab, setCurrentTab] = useState(initialTab || 'home');

            useEffect(() => {
                if (show && initialTab) {
                    setCurrentTab(initialTab);
                }
            }, [show, initialTab]);
            const myOwned = ownedPets[activeChild] || [];
            const petId = activePet[activeChild];
            const currentStarsCount = totalStars;

            // 计算连续打卡天数和近7天打卡率（供栏位系统使用）
            const { slotStreak, slotCheckinRate } = React.useMemo(() => {
                const h = (typeof ADVENTURE_HELPERS !== 'undefined') ? ADVENTURE_HELPERS : null;
                if (!h || !checkins || !tasks) return { slotStreak: 0, slotCheckinRate: 0 };
                try {
                    const streak = h.calcStreakDays(tasks, checkins, activeChild);
                    const rate = h.calcCompletionRate(tasks, checkins, activeChild, 7, { exemptedDays });
                    return { slotStreak: streak, slotCheckinRate: rate };
                } catch (e) { return { slotStreak: 0, slotCheckinRate: 0 }; }
            }, [checkins, tasks, activeChild]);

            if (!show) return null;

            const handleSwitchPet = (id) => {
                setActivePet(prev => ({ ...prev, [activeChild]: id }));
            };

            return (
                <div className="fixed inset-0 z-[85] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
                    <div className="bg-gradient-to-b from-amber-50 via-orange-50/60 to-rose-50/40 rounded-t-3xl sm:rounded-3xl w-full max-w-lg sm:max-w-4xl h-[92vh] sm:h-[88vh] shadow-2xl flex flex-col overflow-hidden border-2 border-amber-400/40 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        {/* 顶部栏 */}
                        <div className={`p-4 sm:p-5 bg-gradient-to-r ${theme.gradient || 'from-amber-500 via-orange-500 to-rose-500'} text-white flex justify-between items-center shrink-0 shadow-lg relative z-10 border-b border-white/20`}>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30 shadow-inner">
                                    🐾
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl sm:text-2xl font-black tracking-wide">灵宠仙阁 · 伴生神兽乐园</h2>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/25 text-yellow-100 font-bold border border-white/30">
                                            幻兽契约
                                        </span>
                                    </div>
                                    <p className="text-white/80 text-xs mt-0.5 font-medium">
                                        自律修行 · 探险拾珍与灵气造化
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/20 text-xs font-black shadow-inner">
                                    <span>⭐</span>
                                    <span className="text-yellow-200">{currentStarsCount}</span>
                                    <span className="text-white/70 text-[10px] hidden sm:inline">星宿</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
                                    title="关闭"
                                >
                                    <XIcon className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Tab 切换 */}
                        <div className="flex gap-1.5 mx-4 sm:mx-6 my-3 bg-white/80 backdrop-blur-md rounded-2xl p-1.5 shrink-0 border border-amber-200/60 shadow-sm">
                            {[
                                { key: 'home', label: '洞天仙境', icon: '🏠' },
                                { key: 'adventure', label: '诸天历练', icon: '🗺️' },
                                { key: 'shop', label: '万宝灵阁', icon: '🏪' },
                                { key: 'album', label: '灵兽谱录', icon: '📖' },
                            ].map(tab => (
                                <button key={tab.key} onClick={() => setCurrentTab(tab.key)}
                                    className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
                                        currentTab === tab.key
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-[1.02]'
                                            : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                                    }`}>
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* 宠物切换横条 — 只在拥有 2 只以上时显示，且仅在 home tab */}
                        {currentTab === 'home' && myOwned.length > 1 && (
                            <div className="flex gap-2.5 mx-5 mb-3 py-1 shrink-0">
                                {myOwned.map(id => {
                                    const cat = petCatalog.find(p => p.id === id);
                                    const isActive = id === petId;
                                    const thumbSrc = cat?.thumbUrl || ('pet_animations/' + id + '/' + id + '-thumb.png');
                                    return (
                                        <button key={id} onClick={() => handleSwitchPet(id)}
                                            className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 ${
                                                isActive
                                                    ? 'bg-white border-amber-400 shadow-md scale-105'
                                                    : 'bg-white/50 border-transparent hover:border-gray-200 hover:bg-white/80'
                                            }`}
                                            title={cat?.name || id}>
                                            <PetImage petId={id} src={thumbSrc} fallbackEmoji={cat?.emoji || '🐾'} className="w-11 h-11 object-contain" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* 内容区 */}
                        <div className="flex-1 overflow-y-auto px-5 pb-5">
                            {currentTab === 'home' && <PetHomeView triggerSyncUpload={triggerSyncUpload} theme={theme} activeChild={activeChild} petData={petData} setPetData={setPetData} ownedPets={ownedPets} activePet={activePet} petCooldowns={petCooldowns} setPetCooldowns={setPetCooldowns} petStats={petStats} setPetStats={setPetStats} totalStars={totalStars} setStarHistory={setStarHistory} petMusicOn={petMusicOn} lowPerfMode={lowPerfMode} checkAchievements={checkAchievements} aiEnabled={aiEnabled} aiPetEnabled={aiPetEnabled} deepseekApiKey={deepseekApiKey} callDeepSeekAPI={callDeepSeekAPI} />}
                            {currentTab === 'shop' && <PetShopView theme={theme} activeChild={activeChild} level={level} currentEra={currentEra} ownedPets={ownedPets} setOwnedPets={setOwnedPets} petData={petData} setPetData={setPetData} activePet={activePet} setActivePet={setActivePet} totalStars={totalStars} setStarHistory={setStarHistory} petStats={petStats} setPetStats={setPetStats} checkAchievements={checkAchievements} showToast={showToast} petSlots={petSlots} setPetSlots={setPetSlots} currentStreak={slotStreak} recentCheckinRate={slotCheckinRate * 100} />}
                            {currentTab === 'adventure' && <PetAdventureView activeChild={activeChild} petData={petData} activePet={activePet} ownedPets={ownedPets} petAdventures={petAdventures} setPetAdventures={setPetAdventures} petAdventureLog={petAdventureLog} petAdventureStats={petAdventureStats} totalStars={totalStars} level={level} currentEra={currentEra} handleStartAdventure={handleStartAdventure} handleCancelAdventure={handleCancelAdventure} handleCompleteAdventure={handleCompleteAdventure} handleDismissAdventure={handleDismissAdventure} handleDismissAllAdventures={handleDismissAllAdventures} triggerSyncUpload={triggerSyncUpload} getAdventureMultiplierStatus={getAdventureMultiplierStatus} showToast={showToast} aiEnabled={aiEnabled} deepseekApiKey={deepseekApiKey} callDeepSeekAPI={callDeepSeekAPI} inventory={inventory} petCatalog={petCatalog} adventureConfig={adventureConfig} />}
                            {currentTab === 'album' && <PetAlbumView theme={theme} activeChild={activeChild} ownedPets={ownedPets} petData={petData} />}
                        </div>
                    </div>
                </div>
            );
        };


export {
    PET_NOTIF_CONFIG,
    PetImage,
    CardPetImage,
    buildPetSystemPrompt,
    PetHomeView,
    PetShopView,
    AdventureConfirmModal,
    PetAdventureView,
    PetAlbumView,
    PetModal
};

export default PetModal;
