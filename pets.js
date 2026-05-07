// pets.js — 宠物系统静态数据定义
// 包含：宠物目录、互动动作、气泡对话、元素系统、属性映射、技能类型

// ============================================================
// 一、宠物目录
// ============================================================

var PET_CATALOG = [
  {
    id: 'teddy',
    name: '泰迪犬',
    species: '犬科',
    desc: '毛茸茸的小可爱，最喜欢窝在主人怀里听故事。虽然体型小但勇气十足，会用湿润的鼻子蹭你的手心。',
    personality: '温顺、粘人、勇敢',
    favoriteFood: '肉骨头',
    backstory: '来自一个温馨的小村庄，从小就被一位老奶奶养大，学会了用眼神表达所有情感。',
    rarity: 'common',
    price: 0,
    unlockLevel: 1,
    era: null,
    emoji: '🐕',
    thumbUrl: 'pet_animations/teddy/teddy-thumb.png',
    animations: {
      idle:  { frames: 1, interval: 3000 },
      click: { frames: 1, interval: 2000 },
      feed:  { frames: 1, interval: 2500 },
      bath:  { frames: 1, interval: 2500 },
      sleep: { frames: 1, interval: 4000 },
    },
    audioMap: null,
    growthStages: [
      { level: 1, name: '初相识',   threshold: 0,   size: 'w-20 h-20' },
      { level: 2, name: '小跟班',   threshold: 30,  size: 'w-24 h-24' },
      { level: 3, name: '好伙伴',   threshold: 80,  size: 'w-28 h-28' },
      { level: 4, name: '最佳搭档', threshold: 150, size: 'w-32 h-32' },
      { level: 5, name: '灵魂伴侣', threshold: 300, size: 'w-36 h-36' },
    ],
    attributes: {
      element: 'earth',
      baseStats: { strength: 5, agility: 4, vitality: 6, wisdom: 3, charm: 7 },
      growthRates: { strength: 0.5, agility: 0.4, vitality: 0.6, wisdom: 0.3, charm: 0.7 },
    },
    skills: [
      {
        id: 'teddy_encourage',
        name: '鼓励叫唤',
        desc: '泰迪犬用响亮的叫声为主人加油，下次打卡获得的金元宝增加 20%。',
        unlockLevel: 3,
        cooldown: 3600000,
        type: 'buff',
        effect: { target: 'owner', type: 'gold_boost', value: 0.2, duration: 0, charges: 1 },
        icon: '📢',
        animation: 'click',
      },
      {
        id: 'teddy_comfort',
        name: '温暖依偎',
        desc: '泰迪犬依偎在主人身边，瞬间恢复 15 点心情。',
        unlockLevel: 5,
        cooldown: 7200000,
        type: 'heal',
        effect: { target: 'self', type: 'restore_mood', value: 15 },
        icon: '💕',
        animation: 'sleep',
      },
    ],
  },

  {
    id: 'border-collie',
    name: '边牧',
    species: '犬科',
    desc: '智商超群的牧羊犬，能听懂主人说的每一句话。最喜欢玩飞盘和做数学题（真的）。',
    personality: '聪明、活泼、专注',
    favoriteFood: '牛肉干',
    backstory: '曾在苏格兰高地牧羊多年，因太过聪明而被羊群"投诉"，只好来陪伴人类小朋友。',
    rarity: 'common',
    price: 0,
    unlockLevel: 1,
    era: null,
    emoji: '🐶',
    thumbUrl: 'pet_animations/border-collie/border-collie-thumb.png',
    animations: {
      idle:  { frames: 1, interval: 3000 },
      click: { frames: 1, interval: 2000 },
      feed:  { frames: 1, interval: 2500 },
      bath:  { frames: 1, interval: 2500 },
      sleep: { frames: 1, interval: 4000 },
    },
    audioMap: null,
    growthStages: [
      { level: 1, name: '初相识',   threshold: 0,   size: 'w-20 h-20' },
      { level: 2, name: '小跟班',   threshold: 30,  size: 'w-24 h-24' },
      { level: 3, name: '好伙伴',   threshold: 80,  size: 'w-28 h-28' },
      { level: 4, name: '最佳搭档', threshold: 150, size: 'w-32 h-32' },
      { level: 5, name: '灵魂伴侣', threshold: 300, size: 'w-36 h-36' },
    ],
    attributes: {
      element: 'wind',
      baseStats: { strength: 4, agility: 7, vitality: 4, wisdom: 8, charm: 5 },
      growthRates: { strength: 0.4, agility: 0.7, vitality: 0.4, wisdom: 0.8, charm: 0.5 },
    },
    skills: [
      {
        id: 'collie_study',
        name: '学霸光环',
        desc: '边牧展示超强学习能力，主人下次打卡获得的经验值翻倍。',
        unlockLevel: 3,
        cooldown: 3600000,
        type: 'buff',
        effect: { target: 'owner', type: 'xp_boost', value: 1.0, duration: 0, charges: 1 },
        icon: '📚',
        animation: 'click',
      },
    ],
  },

  {
    id: 'angora-rabbit',
    name: '安哥拉兔',
    species: '兔科',
    desc: '毛发蓬松如云朵般的长毛兔，性格胆小但内心温柔。安静时像一团棉花糖。',
    personality: '胆小、温柔、安静',
    favoriteFood: '胡萝卜',
    backstory: '从丝绸之路的远方商队中意外走失，被好心人收留后辗转来到这里。',
    rarity: 'rare',
    price: 50,
    unlockLevel: 3,
    era: null,
    emoji: '🐰',
    thumbUrl: 'pet_animations/angora-rabbit/angora-rabbit-thumb.png',
    animations: {
      idle:  { frames: 1, interval: 3000 },
      click: { frames: 1, interval: 2000 },
      feed:  { frames: 1, interval: 2500 },
      bath:  { frames: 1, interval: 2500 },
      sleep: { frames: 1, interval: 4000 },
    },
    audioMap: null,
    growthStages: [
      { level: 1, name: '初相识',   threshold: 0,   size: 'w-20 h-20' },
      { level: 2, name: '小跟班',   threshold: 30,  size: 'w-24 h-24' },
      { level: 3, name: '好伙伴',   threshold: 80,  size: 'w-28 h-28' },
      { level: 4, name: '最佳搭档', threshold: 150, size: 'w-32 h-32' },
      { level: 5, name: '灵魂伴侣', threshold: 300, size: 'w-36 h-36' },
    ],
    attributes: {
      element: 'water',
      baseStats: { strength: 2, agility: 6, vitality: 3, wisdom: 5, charm: 8 },
      growthRates: { strength: 0.2, agility: 0.6, vitality: 0.3, wisdom: 0.5, charm: 0.8 },
    },
    skills: [
      {
        id: 'rabbit_heal',
        name: '棉花拥抱',
        desc: '安哥拉兔用蓬松的毛发拥抱主人，瞬间恢复 20 点心情。',
        unlockLevel: 3,
        cooldown: 7200000,
        type: 'heal',
        effect: { target: 'self', type: 'restore_mood', value: 20 },
        icon: '☁️',
        animation: 'idle',
      },
    ],
  },

  {
    id: 't-rex',
    name: '霸王龙',
    species: '恐龙',
    desc: '远古霸主穿越而来！虽然牙齿锋利但其实内心住着一个小公主，喜欢被夸奖。',
    personality: '霸气、傲娇、怕孤单',
    favoriteFood: '烤全羊',
    backstory: '从远古时代穿越时空裂缝来到现代，虽然外表凶猛但其实非常渴望朋友。',
    rarity: 'epic',
    price: 200,
    unlockLevel: 5,
    era: '远古之路',
    emoji: '🦖',
    thumbUrl: 'pet_animations/t-rex/t-rex-thumb.png',
    animations: {
      idle:  { frames: 1, interval: 3000 },
      click: { frames: 1, interval: 2000 },
      feed:  { frames: 1, interval: 2500 },
      bath:  { frames: 1, interval: 2500 },
      sleep: { frames: 1, interval: 4000 },
    },
    audioMap: null,
    growthStages: [
      { level: 1, name: '初相识',   threshold: 0,   size: 'w-20 h-20' },
      { level: 2, name: '小跟班',   threshold: 30,  size: 'w-24 h-24' },
      { level: 3, name: '好伙伴',   threshold: 80,  size: 'w-28 h-28' },
      { level: 4, name: '最佳搭档', threshold: 150, size: 'w-32 h-32' },
      { level: 5, name: '灵魂伴侣', threshold: 300, size: 'w-36 h-36' },
    ],
    attributes: {
      element: 'fire',
      baseStats: { strength: 9, agility: 3, vitality: 8, wisdom: 2, charm: 4 },
      growthRates: { strength: 0.9, agility: 0.3, vitality: 0.8, wisdom: 0.2, charm: 0.4 },
    },
    skills: [
      {
        id: 'trex_roar',
        name: '远古咆哮',
        desc: '霸王龙发出震天咆哮，主人获得 5 分钟内金币获取 +20% 的增益。',
        unlockLevel: 3,
        cooldown: 3600000,
        type: 'buff',
        effect: { target: 'owner', type: 'gold_boost', value: 0.2, duration: 300000 },
        icon: '🔥',
        animation: 'click',
      },
      {
        id: 'trex_guard',
        name: '霸主守护',
        desc: '霸王龙用庞大的身躯保护主人，下次打卡不会因中断而损失连续天数。',
        unlockLevel: 5,
        cooldown: 86400000,
        type: 'passive',
        effect: { target: 'owner', type: 'streak_protect', charges: 1 },
        icon: '🛡️',
        animation: 'idle',
      },
    ],
  },

  {
    id: 'capybara',
    name: '卡皮巴拉',
    species: '啮齿目',
    desc: '世界上最大的啮齿动物，性格佛系到极致。和谁都能做朋友，是天然的社交达人。',
    personality: '佛系、社交、淡定',
    favoriteFood: '西瓜',
    backstory: '来自南美洲的温泉圣地，修炼了千年佛系心法，万事不萦于怀。',
    rarity: 'rare',
    price: 80,
    unlockLevel: 4,
    era: null,
    emoji: '🦫',
    thumbUrl: 'pet_animations/capybara/capybara-thumb.png',
    animations: {
      idle:  { frames: 1, interval: 3000 },
      click: { frames: 1, interval: 2000 },
      feed:  { frames: 1, interval: 2500 },
      bath:  { frames: 1, interval: 2500 },
      sleep: { frames: 1, interval: 4000 },
    },
    audioMap: null,
    growthStages: [
      { level: 1, name: '初相识',   threshold: 0,   size: 'w-20 h-20' },
      { level: 2, name: '小跟班',   threshold: 30,  size: 'w-24 h-24' },
      { level: 3, name: '好伙伴',   threshold: 80,  size: 'w-28 h-28' },
      { level: 4, name: '最佳搭档', threshold: 150, size: 'w-32 h-32' },
      { level: 5, name: '灵魂伴侣', threshold: 300, size: 'w-36 h-36' },
    ],
    attributes: {
      element: 'water',
      baseStats: { strength: 5, agility: 3, vitality: 7, wisdom: 6, charm: 9 },
      growthRates: { strength: 0.5, agility: 0.3, vitality: 0.7, wisdom: 0.6, charm: 0.9 },
    },
    skills: [
      {
        id: 'capybara_chill',
        name: '佛系光环',
        desc: '卡皮巴拉散发出令人放松的气息，宠物自身的属性衰减速度降低 50%，持续 2 小时。',
        unlockLevel: 3,
        cooldown: 14400000,
        type: 'buff',
        effect: { target: 'self', type: 'slow_decay', value: 0.5, duration: 7200000 },
        icon: '🧘',
        animation: 'sleep',
      },
    ],
  },
];


// ============================================================
// 二、宠物互动动作定义
// ============================================================

var PET_ACTIONS = {
  feed: {
    name: '喂食',
    icon: '🍖',
    starCost: 10,
    effects: { fullness: +30, mood: +5, cleanliness: -5 },
    cooldown: 600000,
    desc: '轻轻点一下，就能让它更开心。',
  },
  bath: {
    name: '洗香香',
    icon: '🛁',
    starCost: 15,
    effects: { cleanliness: +35, mood: +5 },
    cooldown: 1200000,
    desc: '洗去一身疲惫，焕然一新。',
  },
  play: {
    name: '去玩耍',
    icon: '🎪',
    starCost: 20,
    effects: { mood: +40, fullness: -10, cleanliness: -10 },
    cooldown: 1800000,
    desc: '出去撒欢跑一跑，心情大好！',
  },
  sleep: {
    name: '睡觉',
    icon: '💤',
    starCost: 8,
    effects: { mood: +15, fullness: -5 },
    cooldown: 3600000,
    desc: '安安稳稳睡一觉，醒来更有精神。',
  },
  pet: {
    name: '摸摸头',
    icon: '🤚',
    starCost: 0,
    effects: { mood: +8 },
    cooldown: 1200000,
    desc: '温柔地摸摸它的头。',
  },
};


// ============================================================
// 三、宠物气泡对话
// ============================================================

var PET_MOOD_DIALOGS = {
  happy: [
    '今天好开心呀！主人最棒了~',
    '嘻嘻，有主人在真好！',
    '摇尾巴摇尾巴~',
    '感觉全身充满了力量！',
  ],
  normal: [
    '主人，今天学了什么呀？',
    '我在这里等你哦~',
    '陪我玩一会儿嘛~',
    '打个哈欠~有点无聊呢。',
  ],
  sad: [
    '主人好久没来看我了...',
    '肚子好饿呀...',
    '我身上好脏，能帮我洗洗吗？',
    '好想主人陪我玩...',
  ],
  hungry: [
    '咕噜咕噜~肚子在叫了！',
    '主人，我饿了，能喂我吃点东西吗？',
    '好香的味道...是给我的吗？',
  ],
};


// ============================================================
// 四、元素系统定义
// ============================================================

var PET_ELEMENTS = {
  fire:  { name: '火', icon: '🔥', color: 'text-red-500',     bg: 'bg-red-50',     strong: 'wind',  weak: 'water' },
  water: { name: '水', icon: '💧', color: 'text-blue-500',    bg: 'bg-blue-50',    strong: 'fire',  weak: 'earth' },
  earth: { name: '土', icon: '🌿', color: 'text-emerald-500', bg: 'bg-emerald-50', strong: 'water', weak: 'wind' },
  wind:  { name: '风', icon: '🌀', color: 'text-cyan-500',    bg: 'bg-cyan-50',    strong: 'earth', weak: 'fire' },
  light: { name: '光', icon: '✨', color: 'text-amber-500',   bg: 'bg-amber-50',   strong: 'dark',  weak: 'dark' },
  dark:  { name: '暗', icon: '🌙', color: 'text-purple-500',  bg: 'bg-purple-50',  strong: 'light', weak: 'light' },
  none:  { name: '无', icon: '⚪', color: 'text-gray-500',    bg: 'bg-gray-50',    strong: null,    weak: null },
};


// ============================================================
// 五、属性名称映射
// ============================================================

var PET_STAT_NAMES = {
  strength:  { name: '力量', icon: '💪', color: 'text-red-500' },
  agility:   { name: '敏捷', icon: '⚡', color: 'text-yellow-500' },
  vitality:  { name: '体力', icon: '❤️', color: 'text-pink-500' },
  wisdom:    { name: '智慧', icon: '📖', color: 'text-blue-500' },
  charm:     { name: '魅力', icon: '✨', color: 'text-purple-500' },
};


// ============================================================
// 六、技能效果处理器定义（预留）
// ============================================================

var PET_SKILL_TYPES = {
  buff: {
    name: '增益',
    desc: '为目标提供临时增益效果',
    fields: ['target', 'type', 'value', 'duration', 'charges'],
  },
  heal: {
    name: '恢复',
    desc: '恢复目标的某项属性',
    fields: ['target', 'type', 'value'],
  },
  special: {
    name: '特殊',
    desc: '触发特殊效果（如解锁隐藏内容）',
    fields: ['target', 'type', 'value'],
  },
  passive: {
    name: '被动',
    desc: '被动触发的保护或增益效果',
    fields: ['target', 'type', 'charges'],
  },
};

var PET_SKILL_EFFECT_TYPES = {
  xp_boost:         { name: '经验增益',   unit: '%' },
  gold_boost:       { name: '金币增益',   unit: '%' },
  star_boost:       { name: '星星增益',   unit: '%' },
  restore_mood:     { name: '恢复心情',   unit: '点' },
  restore_fullness: { name: '恢复饱腹',   unit: '点' },
  slow_decay:       { name: '减缓衰减',   unit: '%' },
  streak_protect:   { name: '连续保护',   unit: '次' },
  double_reward:    { name: '双倍奖励',   unit: '次' },
};
