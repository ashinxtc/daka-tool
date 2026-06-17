// pet-adventures.js — 宠物探险寻宝系统数据文件
// 项目为单文件 React 18 SPA（Babel Standalone），此文件不含 JSX

// ==================== 全局配置 ====================
const ADVENTURE_CONFIG = {
    maxPerDay: 3,                       // 每日最大探险次数
    eventChance: 0.3,                   // 随机事件触发概率
    luckyBonusChance: 0.1,              // 幸运加成触发概率
    trapMaxTrigger: 1,                  // 每次探险陷阱最多触发次数
    logRetention: 50,                   // 保留最近日志条数
    hungerPerHour: 10,                  // 每小时饱腹消耗
    foodHungerReduction: 5,             // 食物包将 hungerPerHour 减少的值（10→5）
    cleanlinessPerHour: 10,             // 每小时清洁消耗
    moodPerHour: 5,                     // 每小时心情增长（探险让它开心）
    recentDays: 7,                      // 近 N 天用于计算基准值和打卡率
    gateThresholdNormal: 0.5,           // 全额收益打卡率门槛
    gateThresholdWarning: 0.3,          // 收益减半打卡率门槛
    gateMultiplier: 0.5,                // 减半时的倍率
    elementBonus: 0.1,                  // 元素克制加成 10%
    // 打卡连击加成
    streakBonuses: {
        3:  { gold: 0.05, xp: 0,    stars: 0 },
        7:  { gold: 0.10, xp: 0.05, stars: 0 },
        14: { gold: 0.15, xp: 0.10, stars: 0.05 },
        30: { gold: 0.25, xp: 0.25, stars: 0.25 },
    },
    // 亲密度等级定义
    bondLevels: [
        { min: 0,  max: 20,  name: '陌生',     itemBonus: 0,     rareBonus: 0 },
        { min: 21, max: 40,  name: '初识',     itemBonus: 0.05,  rareBonus: 0.025 },
        { min: 41, max: 60,  name: '熟悉',     itemBonus: 0.10,  rareBonus: 0.025 },
        { min: 61, max: 80,  name: '好伙伴',   itemBonus: 0.15,  rareBonus: 0.05 },
        { min: 81, max: 95,  name: '最佳搭档', itemBonus: 0.20,  rareBonus: 0.075 },
        { min: 96, max: 100, name: '灵魂伴侣', itemBonus: 0.25,  rareBonus: 0.125 },
    ],
    // 宠物技能探险联动
    petAdventureSkills: {
        'teddy':          { goldBoost: 0.10, xpBoost: 0, starBoost: 0, rareBoost: 0, timeReduce: 0, eventShield: false, skillName: '鼓励叫声' },
        'border-collie':  { goldBoost: 0, xpBoost: 0.25, starBoost: 0, rareBoost: 0, timeReduce: 0, eventShield: false, skillName: '学习气场' },
        'angora-rabbit':  { goldBoost: 0, xpBoost: 0, starBoost: 0, rareBoost: 0, timeReduce: 0, eventShield: true,  skillName: '蓬松拥抱' },
        't-rex':          { goldBoost: 0, xpBoost: 0, starBoost: 0, rareBoost: 0.075, timeReduce: 0, eventShield: false, skillName: '远古咆哮' },
        'capybara':       { goldBoost: 0, xpBoost: 0, starBoost: 0, rareBoost: 0, timeReduce: 0.05, eventShield: false, skillName: '禅意气息' },
        'husky':          { goldBoost: 0, xpBoost: 0.15, starBoost: 0, rareBoost: 0, timeReduce: 0, eventShield: false, skillName: '狼嚎' },
        'lizard':         { goldBoost: 0, xpBoost: 0, starBoost: 0, rareBoost: 0, timeReduce: 0, eventShield: true,  skillName: '隐身术' },
    },
};

// ==================== 探险领域定义 ====================
const ADVENTURE_REALMS = [
    {
        id: 'forest',
        name: '林间散步',
        icon: '🌲',
        duration: 3600000,          // 1 小时
        starCost: 5,
        unlockLevel: 1,
        unlockEra: null,
        minItems: 2,
        maxItems: 4,
        maxBondBonus: 2,
        maxLuckyBonus: 1,
        element: 'earth',
        desc: '住家附近的小树林，适合初次探险的新手。',
        color: 'from-green-400 to-emerald-500',
    },
    {
        id: 'creek',
        name: '溪谷探秘',
        icon: '🏞️',
        duration: 7200000,          // 2 小时
        starCost: 15,
        unlockLevel: 3,
        unlockEra: '远古之路',
        minItems: 3,
        maxItems: 5,
        maxBondBonus: 2,
        maxLuckyBonus: 1,
        element: 'water',
        desc: '清澈溪流中藏着大自然的馈赠。',
        color: 'from-cyan-400 to-blue-500',
    },
    {
        id: 'ruins',
        name: '古迹考察',
        icon: '🏛️',
        duration: 21600000,         // 6 小时
        starCost: 35,
        unlockLevel: 6,
        unlockEra: '文明初曙',
        minItems: 4,
        maxItems: 7,
        maxBondBonus: 3,
        maxLuckyBonus: 2,
        element: 'earth',
        desc: '断壁残垣间，历史的低语穿越千年。',
        color: 'from-amber-400 to-orange-500',
    },
    {
        id: 'rift',
        name: '时空裂隙',
        icon: '🌀',
        duration: 43200000,         // 12 小时
        starCost: 60,
        unlockLevel: 10,
        unlockEra: '周·礼制与争鸣',
        minItems: 5,
        maxItems: 9,
        maxBondBonus: 3,
        maxLuckyBonus: 2,
        element: 'fire',
        desc: '时间的织锦被撕裂，未知的领域等待探索。',
        color: 'from-purple-400 to-fuchsia-500',
    },
    {
        id: 'cosmos',
        name: '星辰远征',
        icon: '🚀',
        duration: 86400000,         // 24 小时
        starCost: 100,
        unlockLevel: 15,
        unlockEra: '魏晋隋唐·融合与登科',
        minItems: 7,
        maxItems: 12,
        maxBondBonus: 4,
        maxLuckyBonus: 3,
        element: 'light',
        desc: '星空之下，万物归一。最勇敢的探险者才能踏足。',
        color: 'from-indigo-400 to-violet-500',
    },
];

// ==================== 宝物表（每领域 30 种） ====================
// 类型: gold=金元宝, xp=经验值, stars=星星, gold_stars=金+星, gold_xp_stars=金+星+经, gold_xp=金+经, item=道具
// multiplier: [min, max] 或固定值；stars 为固定值
// isTrap: 是否为陷阱（最多触发 1 次）

const ADVENTURE_LOOT_TABLES = {
    // ========== 领域一：林间散步 ==========
    forest: [
        { name: '树枝',           icon: '🪵', type: 'gold',          multiplier: [0.4, 0.4],    weight: 15 },
        { name: '野草',           icon: '🌿', type: 'gold',          multiplier: [0.6, 0.6],    weight: 14 },
        { name: '落叶',           icon: '🍃', type: 'xp',            multiplier: [0.8, 0.8],    weight: 12 },
        { name: '小石子',         icon: '🪨', type: 'gold',          multiplier: [0.8, 0.8],    weight: 10 },
        { name: '野莓',           icon: '🫐', type: 'xp',            multiplier: [1.2, 1.2],    weight: 8 },
        { name: '贝壳',           icon: '🐚', type: 'stars',         fixed: 2,                  weight: 6 },
        { name: '羽毛',           icon: '🪶', type: 'stars',         fixed: 3,                  weight: 5 },
        { name: '蘑菇',           icon: '🍄', type: 'gold',          multiplier: [1.6, 1.6],    weight: 4 },
        { name: '毛毛虫',         icon: '🐛', type: 'gold',          multiplier: [-0.4, -0.4],  weight: 3, isTrap: true },
        { name: '树洞宝箱',       icon: '📦', type: 'gold',          multiplier: [3.0, 6.0],    weight: 1.5 },
        { name: '野花束',         icon: '🌸', type: 'xp',            multiplier: [2.0, 2.0],    weight: 3 },
        { name: '蟋蟀',           icon: '🦗', type: 'gold',          multiplier: [0.5, 0.5],    weight: 5 },
        { name: '橡果',           icon: '🌰', type: 'gold',          multiplier: [0.7, 0.7],    weight: 4 },
        { name: '蚕茧',           icon: '🐛', type: 'xp',            multiplier: [1.0, 1.0],    weight: 3 },
        { name: '枯木',           icon: '🍂', type: 'gold',          multiplier: [0.3, 0.3],    weight: 3 },
        { name: '幸运四叶草',     icon: '🌈', type: 'stars',         fixed: 8,                  weight: 0.5 },
        { name: '小刺猬的礼物',   icon: '🦔', type: 'gold',          multiplier: [2.4, 2.4],    weight: 2 },
        { name: '松鼠藏果',       icon: '🐿️', type: 'gold',          multiplier: [1.4, 1.4],    weight: 3 },
        { name: '月光露珠',       icon: '🌙', type: 'xp',            multiplier: [1.6, 1.6],    weight: 2 },
        { name: '生命之叶',       icon: '🍀', type: 'stars',         fixed: 5,                  weight: 1 },
        { name: '鸟蛋',           icon: '🥚', type: 'gold',          multiplier: [1.0, 1.0],    weight: 3 },
        { name: '苔藓',           icon: '🌿', type: 'xp',            multiplier: [0.6, 0.6],    weight: 3 },
        { name: '野蜂蜜',         icon: '🍯', type: 'gold',          multiplier: [1.8, 1.8],    weight: 2 },
        { name: '瓢虫',           icon: '🐞', type: 'stars',         fixed: 1,                  weight: 4 },
        { name: '向日葵',         icon: '🌻', type: 'xp',            multiplier: [1.4, 1.4],    weight: 2 },
        { name: '蝴蝶翅膀',       icon: '🦋', type: 'xp',            multiplier: [2.4, 2.4],    weight: 1.5 },
        { name: '空鸟巢',         icon: '🪹', type: 'gold',          multiplier: [0.5, 0.5],    weight: 2 },
        { name: '野橄榄',         icon: '🫒', type: 'gold',          multiplier: [1.2, 1.2],    weight: 2 },
        { name: '蒲公英',         icon: '🌺', type: 'stars',         fixed: 2,                  weight: 2 },
        { name: '树洞钥匙',       icon: '🗝️', type: 'item',          fixed: 0,                  weight: 0.3 },
    ],

    // ========== 领域二：溪谷探秘 ==========
    creek: [
        { name: '小鱼',           icon: '🐟', type: 'gold',          multiplier: [1.2, 1.2],    weight: 14 },
        { name: '溪水结晶',       icon: '💧', type: 'xp',            multiplier: [2.0, 2.0],    weight: 12 },
        { name: '小螃蟹',         icon: '🦀', type: 'gold',          multiplier: [1.6, 1.6],    weight: 10 },
        { name: '珊瑚碎片',       icon: '🪸', type: 'xp',            multiplier: [3.2, 3.2],    weight: 8 },
        { name: '潮汐螺',         icon: '🌊', type: 'stars',         fixed: 5,                  weight: 6 },
        { name: '莲花',           icon: '🪷', type: 'stars',         fixed: 8,                  weight: 5 },
        { name: '溪畔古卷',       icon: '📜', type: 'gold',          multiplier: [4.0, 4.0],    weight: 4 },
        { name: '毒蛙',           icon: '🐸', type: 'gold',          multiplier: [-1.2, -1.2],  weight: 4, isTrap: true },
        { name: '溪谷宝箱',       icon: '🎁', type: 'gold',          multiplier: [4.0, 8.0],    weight: 2.5 },
        { name: '蓝宝石',         icon: '💎', type: 'stars',         fixed: 15,                 weight: 1.5 },
        { name: '学者笔记',       icon: '📖', type: 'xp',            multiplier: [8.0, 8.0],    weight: 1 },
        { name: '河虾',           icon: '🦐', type: 'gold',          multiplier: [1.0, 1.0],    weight: 5 },
        { name: '珍珠蚌',         icon: '🐚', type: 'gold',          multiplier: [2.4, 2.4],    weight: 3 },
        { name: '水草',           icon: '🌿', type: 'xp',            multiplier: [1.6, 1.6],    weight: 4 },
        { name: '鹅卵石',         icon: '🪨', type: 'gold',          multiplier: [1.4, 1.4],    weight: 3 },
        { name: '鸭羽',           icon: '🦆', type: 'xp',            multiplier: [1.2, 1.2],    weight: 3 },
        { name: '溪畔灵芝',       icon: '🌺', type: 'stars',         fixed: 10,                 weight: 2 },
        { name: '灵龟甲片',       icon: '🐢', type: 'gold',          multiplier: [2.8, 2.8],    weight: 2 },
        { name: '水之精华',       icon: '💫', type: 'xp',            multiplier: [4.8, 4.8],    weight: 1.5 },
        { name: '古老钥匙',       icon: '🗝️', type: 'item',          fixed: 0,                  weight: 0.5 },
        { name: '蝌蚪',           icon: '🐸', type: 'gold',          multiplier: [0.8, 0.8],    weight: 4 },
        { name: '蚌壳',           icon: '🦪', type: 'xp',            multiplier: [2.0, 2.0],    weight: 3 },
        { name: '水稻穗',         icon: '🌾', type: 'gold',          multiplier: [1.8, 1.8],    weight: 2 },
        { name: '鱼鳞',           icon: '🐟', type: 'stars',         fixed: 3,                  weight: 3 },
        { name: '芦苇',           icon: '🌿', type: 'gold',          multiplier: [0.6, 0.6],    weight: 3 },
        { name: '水蜘蛛',         icon: '🦗', type: 'xp',            multiplier: [2.4, 2.4],    weight: 2 },
        { name: '海星',           icon: '🪸', type: 'stars',         fixed: 6,                  weight: 2 },
        { name: '晨露',           icon: '💧', type: 'xp',            multiplier: [1.0, 1.0],    weight: 3 },
        { name: '海螺号角',       icon: '🐚', type: 'gold',          multiplier: [3.0, 3.0],    weight: 1.5 },
        { name: '溪流彩虹石',     icon: '🌈', type: 'stars',         fixed: 12,                 weight: 1 },
    ],

    // ========== 领域三：古迹考察 ==========
    ruins: [
        { name: '古砖碎片',       icon: '🧱', type: 'gold',          multiplier: [2.4, 2.4],    weight: 12 },
        { name: '陶片',           icon: '🏺', type: 'xp',            multiplier: [4.0, 4.0],    weight: 10 },
        { name: '古铜钱',         icon: '🪙', type: 'gold',          multiplier: [4.0, 4.0],    weight: 9 },
        { name: '玉珠',           icon: '📿', type: 'stars',         fixed: 10,                 weight: 8 },
        { name: '石雕',           icon: '🗿', type: 'xp',            multiplier: [6.0, 6.0],    weight: 7 },
        { name: '竹简',           icon: '📜', type: 'gold',          multiplier: [6.0, 6.0],    weight: 6 },
        { name: '机关陷阱',       icon: '⚔️', type: 'gold',          multiplier: [-2.0, -2.0],  weight: 5, isTrap: true },
        { name: '古迹宝箱',       icon: '🎁', type: 'gold',          multiplier: [8.0, 16.0],   weight: 3 },
        { name: '玉玺碎片',       icon: '👑', type: 'stars',         fixed: 30,                 weight: 2 },
        { name: '失传典籍',       icon: '📚', type: 'xp',            multiplier: [16.0, 16.0],  weight: 1.5 },
        { name: '传国玉玺',       icon: '🏆', type: 'gold_stars',    goldMul: [32.0, 32.0], starsFixed: 50, weight: 0.3 },
        { name: '折扇',           icon: '🪭', type: 'gold',          multiplier: [3.2, 3.2],    weight: 4 },
        { name: '面具',           icon: '🎭', type: 'xp',            multiplier: [4.8, 4.8],    weight: 3 },
        { name: '宫灯',           icon: '🏮', type: 'gold',          multiplier: [3.6, 3.6],    weight: 3 },
        { name: '念珠',           icon: '📿', type: 'stars',         fixed: 12,                 weight: 3 },
        { name: '青铜短剑',       icon: '🗡️', type: 'gold',          multiplier: [5.2, 5.2],    weight: 2.5 },
        { name: '古代算筹',       icon: '📐', type: 'xp',            multiplier: [7.2, 7.2],    weight: 2 },
        { name: '壁画残片',       icon: '🎨', type: 'gold',          multiplier: [6.4, 6.4],    weight: 2 },
        { name: '古代数学典籍',   icon: '📖', type: 'xp',            multiplier: [12.0, 12.0],  weight: 1 },
        { name: '时光胶囊',       icon: '🌟', type: 'stars',         fixed: 25,                 weight: 1.5 },
        { name: '青铜鼎',         icon: '🏺', type: 'gold',          multiplier: [4.8, 4.8],    weight: 3 },
        { name: '玉佩',           icon: '📿', type: 'stars',         fixed: 8,                  weight: 3 },
        { name: '丝绸残片',       icon: '🎨', type: 'gold',          multiplier: [3.0, 3.0],    weight: 2.5 },
        { name: '诏书',           icon: '📜', type: 'xp',            multiplier: [5.6, 5.6],    weight: 2 },
        { name: '铜镜',           icon: '🏮', type: 'gold',          multiplier: [2.8, 2.8],    weight: 2.5 },
        { name: '浑天仪',         icon: '📐', type: 'xp',            multiplier: [10.0, 10.0],  weight: 1.5 },
        { name: '铁犁',           icon: '🗡️', type: 'gold',          multiplier: [2.0, 2.0],    weight: 2 },
        { name: '戏曲脸谱',       icon: '🎭', type: 'stars',         fixed: 6,                  weight: 2 },
        { name: '佛像',           icon: '📿', type: 'gold',          multiplier: [5.6, 5.6],    weight: 1.5 },
        { name: '地宫钥匙',       icon: '🗝️', type: 'item',          fixed: 0,                  weight: 0.3 },
    ],

    // ========== 领域四：时空裂隙 ==========
    rift: [
        { name: '时之沙',         icon: '⏳', type: 'gold',          multiplier: [4.8, 4.8],    weight: 10 },
        { name: '裂隙碎片',       icon: '🌀', type: 'xp',            multiplier: [8.0, 8.0],    weight: 9 },
        { name: '预言水晶',       icon: '🔮', type: 'stars',         fixed: 15,                 weight: 8 },
        { name: '古代护符',       icon: '📿', type: 'gold',          multiplier: [8.0, 8.0],    weight: 7 },
        { name: '传说武器',       icon: '🗡️', type: 'xp',            multiplier: [12.0, 12.0],  weight: 6 },
        { name: '时空风暴',       icon: '💀', type: 'gold',          multiplier: [-4.0, -4.0],  weight: 5, isTrap: true },
        { name: '跨时代典籍',     icon: '📖', type: 'stars',         fixed: 30,                 weight: 4 },
        { name: '时空宝箱',       icon: '🎁', type: 'gold',          multiplier: [12.0, 24.0],  weight: 3 },
        { name: '龙之鳞片',       icon: '🐉', type: 'stars',         fixed: 50,                 weight: 2 },
        { name: '古代名人手稿',   icon: '👻', type: 'xp',            multiplier: [24.0, 24.0],  weight: 1.5 },
        { name: '时空之心',       icon: '🌟', type: 'gold_xp_stars', goldMul: [20.0, 20.0], xpMul: [16.0, 16.0], starsFixed: 60, weight: 0.8 },
        { name: '失落文明宝库',   icon: '📦', type: 'gold',          multiplier: [32.0, 32.0],  weight: 0.3 },
        { name: '时空面具',       icon: '🎭', type: 'gold',          multiplier: [6.0, 6.0],    weight: 4 },
        { name: '佛珠',           icon: '📿', type: 'stars',         fixed: 20,                 weight: 3 },
        { name: '古代花瓶',       icon: '🏺', type: 'gold',          multiplier: [7.2, 7.2],    weight: 3 },
        { name: '司南',           icon: '📐', type: 'xp',            multiplier: [10.0, 10.0],  weight: 2.5 },
        { name: '丝绸画卷',       icon: '🎨', type: 'gold',          multiplier: [8.8, 8.8],    weight: 2 },
        { name: '天文历法',       icon: '📖', type: 'xp',            multiplier: [18.0, 18.0],  weight: 2 },
        { name: '时空之钥',       icon: '🗝️', type: 'item',          fixed: 0,                  weight: 1 },
        { name: '月光宝盒',       icon: '🌙', type: 'stars',         fixed: 40,                 weight: 1.5 },
        { name: '干将莫邪碎片',   icon: '⚔️', type: 'gold',          multiplier: [10.0, 10.0],  weight: 2 },
        { name: '夜明珠',         icon: '📿', type: 'stars',         fixed: 25,                 weight: 2 },
        { name: '兵法竹简',       icon: '📜', type: 'xp',            multiplier: [14.0, 14.0],  weight: 2 },
        { name: '唐三彩',         icon: '🏺', type: 'gold',          multiplier: [5.6, 5.6],    weight: 2.5 },
        { name: '青铜面具',       icon: '🎭', type: 'xp',            multiplier: [8.0, 8.0],    weight: 2 },
        { name: '地动仪',         icon: '📐', type: 'stars',         fixed: 18,                 weight: 2 },
        { name: '陨铁',           icon: '🗡️', type: 'gold',          multiplier: [9.6, 9.6],    weight: 1.5 },
        { name: '本草纲目残页',   icon: '📖', type: 'xp',            multiplier: [20.0, 20.0],  weight: 1 },
        { name: '长明灯',         icon: '🏮', type: 'gold',          multiplier: [7.0, 7.0],    weight: 1.5 },
        { name: '星辰罗盘',       icon: '🌌', type: 'stars',         fixed: 35,                 weight: 1 },
    ],

    // ========== 领域五：星辰远征 ==========
    cosmos: [
        { name: '星尘',           icon: '⭐', type: 'gold',          multiplier: [8.0, 8.0],    weight: 9 },
        { name: '月华',           icon: '🌙', type: 'xp',            multiplier: [12.0, 12.0],  weight: 8 },
        { name: '日精',           icon: '☀️', type: 'stars',         fixed: 25,                 weight: 7 },
        { name: '行星碎片',       icon: '🪐', type: 'gold',          multiplier: [12.0, 12.0],  weight: 6 },
        { name: '银河之水',       icon: '🌌', type: 'xp',            multiplier: [20.0, 20.0],  weight: 5 },
        { name: '彗星碎片',       icon: '☄️', type: 'stars',         fixed: 40,                 weight: 4 },
        { name: '黑洞引力',       icon: '🕳️', type: 'gold',          multiplier: [-8.0, -8.0],  weight: 4, isTrap: true },
        { name: '星辰宝箱',       icon: '🎁', type: 'gold',          multiplier: [20.0, 40.0],  weight: 3 },
        { name: '流星许愿石',     icon: '🌠', type: 'stars',         fixed: 80,                 weight: 2 },
        { name: '宇宙起源之书',   icon: '📜', type: 'xp',            multiplier: [40.0, 40.0],  weight: 1.5 },
        { name: '凤凰之羽',       icon: '🔥', type: 'gold_xp_stars', goldMul: [32.0, 32.0], xpMul: [32.0, 32.0], starsFixed: 100, weight: 0.8 },
        { name: '创世之星',       icon: '💫', type: 'gold_xp_stars', goldMul: [60.0, 60.0], xpMul: [60.0, 60.0], starsFixed: 200, weight: 0.15 },
        { name: '陨石',           icon: '🌠', type: 'gold',          multiplier: [10.0, 10.0],  weight: 4 },
        { name: '星辰项链',       icon: '📿', type: 'stars',         fixed: 30,                 weight: 3 },
        { name: '土星环碎片',     icon: '🪐', type: 'gold',          multiplier: [14.0, 14.0],  weight: 2.5 },
        { name: '暗物质',         icon: '🌑', type: 'xp',            multiplier: [24.0, 24.0],  weight: 2.5 },
        { name: '星图',           icon: '📖', type: 'xp',            multiplier: [16.0, 16.0],  weight: 2 },
        { name: '极光精华',       icon: '🌈', type: 'stars',         fixed: 50,                 weight: 2 },
        { name: '星门之钥',       icon: '🗝️', type: 'item',          fixed: 0,                  weight: 1 },
        { name: '宇宙之心',       icon: '🌌', type: 'gold_stars',    goldMul: [48.0, 48.0], starsFixed: 150, weight: 0.5 },
        { name: '木星风暴石',     icon: '🪐', type: 'gold',          multiplier: [9.0, 9.0],    weight: 3 },
        { name: '银河珍珠',       icon: '📿', type: 'stars',         fixed: 35,                 weight: 2.5 },
        { name: '太阳碎片',       icon: '☀️', type: 'xp',            multiplier: [18.0, 18.0],  weight: 2 },
        { name: '月壤',           icon: '🌙', type: 'gold',          multiplier: [7.0, 7.0],    weight: 2.5 },
        { name: '星云结晶',       icon: '🌌', type: 'stars',         fixed: 45,                 weight: 2 },
        { name: '时空法典',       icon: '📖', type: 'xp',            multiplier: [30.0, 30.0],  weight: 1.5 },
        { name: '流星核',         icon: '☄️', type: 'gold',          multiplier: [16.0, 16.0],  weight: 2 },
        { name: '七色极光',       icon: '🌈', type: 'stars',         fixed: 60,                 weight: 1.5 },
        { name: '冥王星冰晶',     icon: '🪐', type: 'xp',            multiplier: [28.0, 28.0],  weight: 1 },
        { name: '奇点之种',       icon: '🌟', type: 'gold_xp_stars', goldMul: [40.0, 40.0], xpMul: [40.0, 40.0], starsFixed: 120, weight: 0.3 },
    ],
};

// ==================== 随机事件 ====================
const ADVENTURE_EVENTS = {
    positive: [
        {
            id: 'butterfly_guide',
            name: '蝴蝶引路',
            icon: '🦋',
            effect: 'extra_chest',
            desc: '一只闪着微光的蝴蝶翩翩飞来，引领宠物找到了一处隐秘的宝箱！',
        },
        {
            id: 'flower_sea',
            name: '花海奇遇',
            icon: '🌸',
            effect: 'items_boost',
            boostValue: 0.5,
            desc: '宠物误入了一片神奇的花海，花香让它精力充沛，收获大增！',
        },
        {
            id: 'ancient_scholar',
            name: '古代学者',
            icon: '🧑‍🏫',
            effect: 'xp_double',
            desc: '一位白发学者从古籍中走出，为宠物指点迷津，经验值翻倍！',
        },
        {
            id: 'meteor_shower',
            name: '流星雨',
            icon: '🌠',
            effect: 'bonus_stars',
            bonusStars: [10, 30],
            desc: '夜空中划过一场壮丽的流星雨，每一颗流星都化作了闪闪发光的星星！',
        },
        {
            id: 'heavenly_music',
            name: '天籁之音',
            icon: '🎵',
            effect: 'restore_mood',
            desc: '远处传来悠扬的乐声，宠物的心情瞬间恢复到最佳状态！',
        },
    ],
    negative: [
        {
            id: 'storm',
            name: '暴风雨',
            icon: '🌧️',
            effect: 'gold_reduce',
            reduceValue: 0.3,
            desc: '突然下起了暴风雨，部分宝物被雨水冲走了。',
        },
        {
            id: 'pet_sleepy',
            name: '宠物犯困',
            icon: '😴',
            effect: 'time_extend',
            extendValue: 0.2,
            desc: '宠物太困了，在路边打了个盹，探险时间延长了。',
        },
        {
            id: 'gold_mouse',
            name: '黄金鼠',
            icon: '🦹',
            effect: 'gold_steal',
            stealValue: 0.2,
            desc: '一只狡猾的黄金鼠偷走了一部分金币！',
        },
        {
            id: 'fog',
            name: '迷雾',
            icon: '🌫️',
            effect: 'xp_reduce',
            reduceValue: 0.3,
            desc: '浓雾弥漫，宠物迷失了方向，学习机会减少。',
        },
    ],
    rare: [
        {
            id: 'divine_beast',
            name: '神兽降临',
            icon: '🐲',
            effect: 'best_loot',
            desc: '天降神兽！它留下了一件无价之宝！',
        },
        {
            id: 'time_rewind',
            name: '时间回溯',
            icon: '⏳',
            effect: 'instant_complete',
            desc: '时空发生了奇妙的扭曲，探险瞬间完成了！',
        },
        {
            id: 'rainbow_bridge',
            name: '彩虹桥',
            icon: '🌈',
            effect: 'double_rewards',
            desc: '一道彩虹桥出现在眼前，通往另一个宝藏之地！',
        },
    ],
};

// ==================== 宠物拒绝文案 ====================
const ADVENTURE_REFUSE_DIALOGS = [
    '主人最近都不怎么学习，我没有动力出门探险……先去打卡吧！',
    '书包都没打开过呢，探险也找不到好东西的！先把今天的任务做完~',
    '（趴在门口不肯走）汪！学习不努力，探险也白搭！',
    '我觉得在家陪你学习比出去探险更重要，先把功课做完好吗？',
    '探险地图上写着：「勤奋者的足迹遍布天下」……主人还差得远呢！',
    '（用爪子把探险地图推到作业本旁边）先学习，后冒险！',
    '没有知识的光芒照耀，再远的路也走不通。主人，先点亮学习之灯吧！',
    '（委屈地看着你）连续好几天都没好好学习了……我不想一个人去探险……',
    '古语云：「读万卷书，行万里路」。书还没读够呢，路就别走啦~',
    '（把背包藏起来）等你变回那个爱学习的好孩子，我再把背包还给你！',
];

// ==================== 探险故事模板 ====================
const ADVENTURE_STORIES = {
    forest: [
        '{pet}踏入了家附近的小树林，阳光透过树叶洒下斑驳的光影。它用灵敏的鼻子在落叶堆中翻找，发现了{loot_summary}。',
        '{pet}沿着林间小径欢快地跑着，突然一只蝴蝶吸引了它的注意。跟着蝴蝶，它来到了一片从未到过的空地，找到了{loot_summary}。',
        '清晨的薄雾还未散去，{pet}已经出发了。它在大树根部发现了一个小洞穴，里面藏着{loot_summary}。',
        '{pet}在树林里遇到了一只友善的松鼠，松鼠用尾巴指了指方向，{pet}顺着方向找到了{loot_summary}。',
        '雨后的树林散发着泥土的芳香，{pet}踩着水洼开心地跳着，在一棵老橡树下发现了{loot_summary}。',
    ],
    creek: [
        '{pet}沿着清澈的溪流逆流而上，水花溅在它毛茸茸的爪子上。在一块大石头后面，它发现了{loot_summary}。',
        '溪水潺潺，{pet}在浅滩上追逐小鱼，却意外地在水底发现了{loot_summary}。',
        '{pet}跟着一只蜻蜓来到了溪流的源头，在瀑布后面找到了一个隐秘的空间，里面放着{loot_summary}。',
        '午后的阳光照在水面上，波光粼粼。{pet}在溪边的泥沙中挖掘，找到了{loot_summary}。',
        '{pet}遇到了一只老乌龟，乌龟缓缓地指向水中的一个亮点——那是{loot_summary}。',
    ],
    ruins: [
        '{pet}踏入了古老的遗迹，断壁残垣间回荡着千年的低语。在一面石墙的暗格中，它发现了{loot_summary}。',
        '遗迹的地面上布满了神秘的符文，{pet}踩中了一块活动的石板，一个密室缓缓打开，里面放着{loot_summary}。',
        '{pet}在废墟中发现了一座残破的雕像，雕像底座的缝隙中藏着{loot_summary}。',
        '一阵风吹过，遗迹中的风铃发出清脆的响声。{pet}循声而去，在钟楼遗址中找到了{loot_summary}。',
        '{pet}在古迹的地下通道中摸索前行，终于在尽头的石室中发现了{loot_summary}。',
    ],
    rift: [
        '时空裂隙闪烁着奇异的光芒，{pet}勇敢地踏入其中。在扭曲的时间流中，它抓住了{loot_summary}。',
        '{pet}发现自己身处一个时间交错的空间——古代与未来在这里重叠。它在一块漂浮的平台上发现了{loot_summary}。',
        '裂隙中传来远古的呼唤，{pet}循声而去，在一颗时间结晶旁找到了{loot_summary}。',
        '{pet}在时空裂隙中遇到了自己的影子，影子化作一道光，指引它找到了{loot_summary}。',
        '裂隙的深处，{pet}发现了一扇半开的门。门后是一个被遗忘的宝库，里面放着{loot_summary}。',
    ],
    cosmos: [
        '{pet}乘着流星的尾迹飞向星空，在银河的旋臂中发现了{loot_summary}。',
        '星辰远征的旅途漫长而壮丽。{pet}在一颗小行星的表面发现了{loot_summary}。',
        '{pet}在星云中穿行，被一团温暖的光芒吸引。光芒散去后，眼前出现了{loot_summary}。',
        '宇宙深处传来悠远的回响，{pet}循着声音的轨迹，在一颗脉冲星旁找到了{loot_summary}。',
        '{pet}在星际尘埃中发现了一条古老的航路，沿着航路到达了一个被遗忘的空间站，里面存放着{loot_summary}。',
    ],
};

// ==================== 减半收益提示文案 ====================
const ADVENTURE_WARNING_DIALOG = '主人最近学习不太积极，探险效率降低了！\n近 7 天打卡完成率：{rate}%\n所有宝物收益将减半。\n\n坚持打卡可以恢复全额收益哦！';

// ==================== 辅助函数 ====================
const ADVENTURE_HELPERS = {
    // 加权随机选取
    weightedRandom: function(items) {
        const totalWeight = items.reduce(function(sum, item) { return sum + item.weight; }, 0);
        let rand = Math.random() * totalWeight;
        for (var i = 0; i < items.length; i++) {
            rand -= items[i].weight;
            if (rand <= 0) return items[i];
        }
        return items[items.length - 1];
    },

    // 区间内随机数
    randomInRange: function(min, max) {
        return min + Math.random() * (max - min);
    },

    // 区间内随机整数
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // 获取亲密度等级信息
    getBondLevel: function(bondValue) {
        var levels = ADVENTURE_CONFIG.bondLevels;
        for (var i = levels.length - 1; i >= 0; i--) {
            if (bondValue >= levels[i].min) return levels[i];
        }
        return levels[0];
    },

    // 本地日期格式化（替代 toISOString，避免时区问题）
    _localDateKey: function(date) {
        var y = date.getFullYear();
        var m = String(date.getMonth() + 1).padStart(2, '0');
        var d = String(date.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + d;
    },

    // 计算打卡完成率（优化版）
    calcCompletionRate: function(tasks, checkins, childName, recentDays, extraData) {
        var now = new Date();
        var expected = 0;
        var actual = 0;
        var childTasks = tasks[childName] || [];
        var childCheckins = checkins[childName] || {};
        var exemptedDays = (extraData && extraData.exemptedDays) ? extraData.exemptedDays : {};
        var self = this;

        for (var d = 1; d <= recentDays; d++) {
            var date = new Date(now);
            date.setDate(date.getDate() - d);
            var dateKey = self._localDateKey(date);

            // 跳过休息日（兼容数组和对象格式）
            if (Array.isArray(exemptedDays) ? exemptedDays.indexOf(dateKey) >= 0 : !!exemptedDays[dateKey]) continue;

            childTasks.forEach(function(task) {
                // 跳过已退役的任务
                if (task.earlyCompleted) return;
                // 跳过任务开始日期之前的天数
                if (task.startDate && dateKey < task.startDate) return;
                // 跳过任务截止日期之后的天数
                if (task.deadline && dateKey > task.deadline) return;

                var freq = task.frequencyType || 'count';
                var taskRecord = childCheckins[task.id] || {};
                var checked = taskRecord[dateKey] ? 1 : 0;

                if (freq === 'weekly_optional') {
                    // weekly_optional：每天 expected = weeklyTargetCount / 7
                    var weeklyTarget = task.weeklyTargetCount || 3;
                    expected += weeklyTarget / 7;
                    actual += checked * (weeklyTarget / 7);
                } else {
                    // daily_must / count：每天1次
                    expected++;
                    actual += checked;
                }
            });
        }
        return expected > 0 ? Math.min(1, actual / expected) : 1;
    },

    // 计算连续打卡天数
    calcStreakDays: function(tasks, checkins, childName) {
        var now = new Date();
        var childTasks = tasks[childName] || [];
        var childCheckins = checkins[childName] || {};
        var streak = 0;
        var self = this;

        for (var d = 1; d <= 365; d++) {
            var date = new Date(now);
            date.setDate(date.getDate() - d);
            var dateKey = self._localDateKey(date);
            var dayCompleted = false;
            childTasks.forEach(function(task) {
                if (task.earlyCompleted) return;
                if (task.startDate && dateKey < task.startDate) return;
                if (task.deadline && dateKey > task.deadline) return;
                var taskRecord = childCheckins[task.id] || {};
                if (taskRecord[dateKey]) dayCompleted = true;
            });
            if (dayCompleted) streak++;
            else break;
        }
        return streak;
    },

    // 计算日均金元宝基础值
    calcDailyGoldBase: function(checkins, wheelHistory, tasks, childName, recentDays, currentLevel) {
        var now = new Date();
        var totalGold = 0;
        var childTasks = tasks[childName] || [];
        var childCheckins = checkins[childName] || {};
        var self = this;

        for (var d = 1; d <= recentDays; d++) {
            var date = new Date(now);
            date.setDate(date.getDate() - d);
            var dateKey = self._localDateKey(date);
            var dayGold = 0;
            childTasks.forEach(function(task) {
                var taskRecord = childCheckins[task.id] || {};
                if (taskRecord[dateKey]) {
                    dayGold += task.reward || 1;
                }
            });
            totalGold += dayGold;
        }

        // 【临时限制】28级以上只算打卡收入，不算轮盘等其他收入
        // TODO: 后续移除此限制条件
        if (!currentLevel || currentLevel < 28) {
            // 加上 wheelHistory 中近 N 天的正向收入（排除进贡和探险等非学习所得）
            if (wheelHistory) {
                Object.keys(wheelHistory).forEach(function(key) {
                    if (!key.startsWith(childName)) return;
                    if (key.indexOf('TRIBUTE_') !== -1) return;
                    if (key.indexOf('ADVENTURE_') !== -1) return;
                    var value = wheelHistory[key];
                    if (value > 0) {
                        var ts = key.match(/-(\d{13})$/);
                        if (ts) {
                            var entryDate = new Date(parseInt(ts[1]));
                            var daysDiff = (now - entryDate) / (1000 * 60 * 60 * 24);
                            if (daysDiff <= recentDays) {
                                totalGold += value;
                            }
                        }
                    }
                });
            }
        }

        return Math.max(1, totalGold / recentDays);
    },

    // 计算日均经验值基础值
    calcDailyXPBase: function(checkins, tasks, childName, recentDays) {
        var now = new Date();
        var totalXP = 0;
        var childTasks = tasks[childName] || [];
        var childCheckins = checkins[childName] || {};
        var self = this;

        for (var d = 1; d <= recentDays; d++) {
            var date = new Date(now);
            date.setDate(date.getDate() - d);
            var dateKey = self._localDateKey(date);
            childTasks.forEach(function(task) {
                var taskRecord = childCheckins[task.id] || {};
                if (taskRecord[dateKey]) {
                    totalXP += 10; // 每次打卡固定 10 XP
                }
            });
        }

        return Math.max(1, totalXP / recentDays);
    },

    // 获取当前加成明细
    calcBonuses: function(petData, activePetId, realmElement, streakDays, petId) {
        var bondValue = (petData && petData.stats) ? Math.round(
            (petData.stats.fullness + petData.stats.cleanliness + petData.stats.mood) / 3
        ) : 0;
        var bondLevel = ADVENTURE_HELPERS.getBondLevel(bondValue);

        // 元素克制
        var elementBonus = 0;
        var petElement = 'none';
        // 从 PET_CATALOG 获取宠物元素（需要外部传入）
        // 此处返回 bondValue 供外部计算

        // 打卡连击加成
        var streakBonus = { gold: 0, xp: 0, stars: 0 };
        var streakThresholds = Object.keys(ADVENTURE_CONFIG.streakBonuses).map(Number).sort(function(a, b) { return b - a; });
        for (var i = 0; i < streakThresholds.length; i++) {
            if (streakDays >= streakThresholds[i]) {
                streakBonus = ADVENTURE_CONFIG.streakBonuses[streakThresholds[i]];
                break;
            }
        }

        // 宠物技能加成
        var skillBonus = ADVENTURE_CONFIG.petAdventureSkills[petId] || {
            goldBoost: 0, xpBoost: 0, starBoost: 0, rareBoost: 0, timeReduce: 0, eventShield: false, skillName: ''
        };

        return {
            bondValue: bondValue,
            bondLevel: bondLevel,
            streakDays: streakDays,
            streakBonus: streakBonus,
            skillBonus: skillBonus,
            elementBonus: elementBonus,
        };
    },

    // 计算综合倍率
    calcTotalMultiplier: function(bonuses, elementType) {
        var goldMul = 1 + bonuses.bondLevel.itemBonus + bonuses.streakBonus.gold + bonuses.skillBonus.goldBoost + bonuses.elementBonus;
        var xpMul = 1 + bonuses.bondLevel.itemBonus + bonuses.streakBonus.xp + bonuses.skillBonus.xpBoost + bonuses.elementBonus;
        var starsMul = 1 + bonuses.streakBonus.stars + bonuses.skillBonus.starBoost;
        return { gold: goldMul, xp: xpMul, stars: starsMul };
    },

    // 计算宝物获取数量
    calcLootCount: function(realm, bondValue) {
        var bondLevel = ADVENTURE_HELPERS.getBondLevel(bondValue);
        var base = ADVENTURE_HELPERS.randomInt(realm.minItems, realm.maxItems);
        var bondBonus = Math.floor(bondValue / 100 * realm.maxBondBonus);
        var luckyBonus = Math.random() < ADVENTURE_CONFIG.luckyBonusChance
            ? ADVENTURE_HELPERS.randomInt(1, realm.maxLuckyBonus)
            : 0;
        return base + bondBonus + luckyBonus;
    },

    // 抽取宝物列表
    rollLoot: function(realmId, count) {
        var lootTable = ADVENTURE_LOOT_TABLES[realmId];
        if (!lootTable) return [];
        var results = [];
        var trapTriggered = false;
        var nonTrapItems = lootTable.filter(function(item) { return !item.isTrap; });

        for (var i = 0; i < count; i++) {
            var pool = trapTriggered ? nonTrapItems : lootTable;
            var item = ADVENTURE_HELPERS.weightedRandom(pool);
            if (item.isTrap && trapTriggered) {
                item = ADVENTURE_HELPERS.weightedRandom(nonTrapItems);
            }
            if (item.isTrap) trapTriggered = true;

            // 计算具体数值
            var rolled = {
                name: item.name,
                icon: item.icon,
                type: item.type,
                isTrap: item.isTrap || false,
            };

            if (item.type === 'gold') {
                var mul = ADVENTURE_HELPERS.randomInRange(item.multiplier[0], item.multiplier[1]);
                rolled.goldMul = mul;
            } else if (item.type === 'xp') {
                var mul = ADVENTURE_HELPERS.randomInRange(item.multiplier[0], item.multiplier[1]);
                rolled.xpMul = mul;
            } else if (item.type === 'stars') {
                rolled.starsFixed = item.fixed;
            } else if (item.type === 'gold_stars') {
                rolled.goldMul = ADVENTURE_HELPERS.randomInRange(item.goldMul[0], item.goldMul[1]);
                rolled.starsFixed = item.starsFixed;
            } else if (item.type === 'gold_xp_stars') {
                rolled.goldMul = ADVENTURE_HELPERS.randomInRange(item.goldMul[0], item.goldMul[1]);
                rolled.xpMul = ADVENTURE_HELPERS.randomInRange(item.xpMul[0], item.xpMul[1]);
                rolled.starsFixed = item.starsFixed;
            } else if (item.type === 'item') {
                rolled.itemName = item.name;
            }

            results.push(rolled);
        }
        return results;
    },

    // 触发随机事件
    rollEvent: function(hasEventShield) {
        if (Math.random() > ADVENTURE_CONFIG.eventChance) return null;

        var roll = Math.random();
        var pool;
        if (roll < 0.05) {
            pool = ADVENTURE_EVENTS.rare; // 5% of 30% = 1.5%
        } else if (roll < 0.65) {
            pool = ADVENTURE_EVENTS.positive; // 60% of 30%
        } else {
            pool = ADVENTURE_EVENTS.negative; // 30% of 30%
        }

        var event = pool[Math.floor(Math.random() * pool.length)];

        // 安哥拉兔技能：负面事件免疫
        if (hasEventShield && pool === ADVENTURE_EVENTS.negative) {
            return null;
        }

        return event;
    },

    // 将宝物倍率转换为实际收益
    // 【临时限制】28级以上应用倍率上限，降低探险回报率
    // TODO: 后续移除此限制条件
    REALM_MUL_CAPS: { forest: 2, creek: 3, ruins: 5, rift: 5, cosmos: 5 },

    resolveLoot: function(rolledItems, dailyGoldBase, dailyXPBase, multipliers, gateMultiplier, event, currentLevel, realmId) {
        var totalGold = 0;
        var totalXP = 0;
        var totalStars = 0;
        var resolvedItems = [];
        var self = this;

        // 事件修改
        var eventGoldMul = 1;
        var eventXpMul = 1;
        var eventItemsBoost = 0;
        var bonusStars = 0;
        var bestLoot = false;
        var doubleRewards = false;

        if (event) {
            switch (event.effect) {
                case 'gold_reduce': eventGoldMul = 1 - event.reduceValue; break;
                case 'gold_steal': eventGoldMul = 1 - event.stealValue; break;
                case 'xp_reduce': eventXpMul = 1 - event.reduceValue; break;
                case 'xp_double': eventXpMul = 2; break;
                case 'items_boost': eventItemsBoost = event.boostValue; break;
                case 'bonus_stars': bonusStars = ADVENTURE_HELPERS.randomInt(event.bonusStars[0], event.bonusStars[1]); break;
                case 'best_loot': bestLoot = true; break;
                case 'double_rewards': doubleRewards = true; break;
                case 'restore_mood': break; // 处理在外部
                case 'extra_chest': break; // 处理在外部
                case 'time_extend': break; // 处理在外部
                case 'instant_complete': break; // 处理在外部
            }
        }

        // 28级以上：确定当前领域的倍率上限
        var mulCap = (currentLevel && currentLevel >= 28 && realmId) ? (self.REALM_MUL_CAPS[realmId] || 5) : Infinity;

        rolledItems.forEach(function(item) {
            var resolved = {
                name: item.name,
                icon: item.icon,
                isTrap: item.isTrap,
                gold: 0,
                xp: 0,
                stars: 0,
            };

            if (item.goldMul !== undefined) {
                var goldMul = item.isTrap ? item.goldMul : Math.min(mulCap, item.goldMul);
                resolved.gold = Math.round(dailyGoldBase * goldMul * multipliers.gold * gateMultiplier * eventGoldMul);
                if (eventItemsBoost > 0 && resolved.gold > 0) resolved.gold = Math.round(resolved.gold * (1 + eventItemsBoost));
                if (resolved.gold < 0) resolved.gold = Math.round(dailyGoldBase * goldMul * gateMultiplier * eventGoldMul); // 陷阱不受加成
            }
            if (item.xpMul !== undefined) {
                var xpMul = Math.min(mulCap, item.xpMul);
                resolved.xp = Math.round(dailyXPBase * xpMul * multipliers.xp * gateMultiplier * eventXpMul);
                if (eventItemsBoost > 0 && resolved.xp > 0) resolved.xp = Math.round(resolved.xp * (1 + eventItemsBoost));
            }
            if (item.starsFixed !== undefined) {
                resolved.stars = Math.round(item.starsFixed * multipliers.stars * gateMultiplier);
                if (eventItemsBoost > 0 && resolved.stars > 0) resolved.stars = Math.round(resolved.stars * (1 + eventItemsBoost));
            }

            totalGold += resolved.gold;
            totalXP += resolved.xp;
            totalStars += resolved.stars;
            resolvedItems.push(resolved);
        });

        // 加上事件奖励星星
        totalStars += bonusStars;

        // 双倍奖励
        if (doubleRewards) {
            totalGold *= 2;
            totalXP *= 2;
            totalStars *= 2;
            resolvedItems.forEach(function(item) {
                item.gold *= 2;
                item.xp *= 2;
                item.stars *= 2;
            });
        }

        return {
            items: resolvedItems,
            totalGold: totalGold,
            totalXP: totalXP,
            totalStars: totalStars,
            bonusStars: bonusStars,
            event: event,
        };
    },

    // 生成探险日志文案
    generateStory: function(realmId, petName, lootSummary) {
        var stories = ADVENTURE_STORIES[realmId];
        if (!stories || stories.length === 0) return petName + '完成了探险，带回了' + lootSummary + '。';
        var template = stories[Math.floor(Math.random() * stories.length)];
        return template.replace('{pet}', petName).replace('{loot_summary}', lootSummary);
    },

    // 生成宝物摘要
    generateLootSummary: function(resolvedItems) {
        var parts = [];
        resolvedItems.forEach(function(item) {
            if (item.gold > 0) parts.push(item.icon + ' ' + item.name + ' ×1');
            else if (item.gold < 0) parts.push(item.icon + ' ' + item.name + '（陷阱）');
            else parts.push(item.icon + ' ' + item.name);
        });
        if (parts.length <= 3) return parts.join('、');
        return parts.slice(0, 3).join('、') + '等' + parts.length + '件宝物';
    },
};
