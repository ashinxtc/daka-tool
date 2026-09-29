# 电子宠物功能模块设计方案 v3

> 项目：长期学习打卡任务 v2.8（D:\ClaudeCodeWorkspace\daka-tool\index.html）
> 设计目标：融入古风/游戏化风格的电子宠物系统，支持宠物增减、内容维护、代码可维护性
> 关键变更：宠物数据外置 pets.js / 成就数据外置 achievements.js 并融合宠物成就 / 星星独立货币 / 预留属性与技能

---

## 一、整体架构概述

### 1.1 设计原则

| 原则 | 说明 |
|------|------|
| **数据外置** | 宠物数据在 `pets.js`，成就数据在 `achievements.js`，与 `events.js`/`levels.js` 同级，各自可独立维护 |
| **数据驱动** | 宠物定义与运行时状态分离，增删宠物/成就只改数据文件 |
| **成就融合** | 宠物成就作为现有成就墙的"宠物"分类，统一入口、统一存储、统一展示 |
| **主题融合** | 宠物 UI 完全使用现有 `COLOR_PALETTES` 主题类名 |
| **经济隔离** | 星星作为独立货币，与金元宝/经验值平行，打卡同时获得三种奖励 |
| **属性扩展** | 预留宠物属性、元素亲和、特殊技能等扩展字段，未来可无缝增加 |
| **多档案隔离** | 宠物状态按 `activeChild` 隔离，与现有 profile 系统一致 |
| **低性能兼容** | 宠物动画支持 `lowPerfMode` 降级（静态图替代 WebP 动画） |

### 1.2 文件结构

```
daka-tool/
├── index.html          ← 主文件（仅新增组件代码和状态声明）
├── events.js           ← 现有：历史事件数据
├── levels.js           ← 现有：等级/时代数据
├── pets.js             ← 【新增】宠物系统全部静态数据
├── achievements.js     ← 【新增】成就定义（原 BADGES 外置 + 宠物成就合并）
└── pet_animations/     ← 现有：动画资源目录
```

### 1.3 代码插入位置规划

```
index.html 结构（14,262 行）:
├── 1-1129     CSS 样式 + 动画定义
│   └── [新增] ~1129 行前插入宠物专用 CSS 动画
│
├── 1146-1147  外部脚本加载区
│   └── [新增] 1147 行后添加 <script src="achievements.js"></script>
│                再添加 <script src="pets.js"></script>
│
├── 1279       COLOR_PALETTES 主题定义
│   └── [新增] ~1290 行后插入 PET_RARITY_THEMES 稀有度配色
│
├── 1733       BADGES 成就定义 → 【移除】迁移到 achievements.js
│   └── 原位保留 typeof 安全引用，或直接删除（由 achievements.js 提供）
│
├── 4944+      Modal 组件区
│   └── [新增] ~6090 行后插入 PetModal 主组件
│
├── 9397+      App 组件
│   └── [新增] ~9730 行后插入宠物+星星相关 useStickyState 状态声明
│   └── [新增] ~11076 行后插入宠物+星星业务逻辑函数
│
└── 13500+     主布局 JSX
    └── [新增] 星星值显示 + 宠物入口按钮
    └── [新增] <PetModal /> 渲染
```

---

## 二、外部数据文件 — pets.js

### 2.1 文件结构

> 位置：与 index.html 同目录，通过 `<script src="pets.js"></script>` 同步加载
> 模式：与 `events.js`（定义 `HISTORICAL_EVENTS`）和 `levels.js`（定义 `LEVELS`/`ERA_INFOS` 等）完全一致

```javascript
// pets.js — 宠物系统静态数据定义
// 此文件独立于 index.html，可单独修改增删宠物内容，无需改动主文件
// 全局常量通过 window 暴露，React 代码通过 typeof 安全访问

// ============================================================
// 一、宠物目录 — 增删宠物只需修改此数组
// ============================================================

const PET_CATALOG = [
  {
    // === 基础信息 ===
    id: 'teddy',
    name: '泰迪犬',
    species: '犬科',
    desc: '毛茸茸的小可爱，性格温顺粘人。最喜欢被人抚摸肚皮，开心时会不停摇尾巴。',
    personality: '温顺、粘人、贪吃',
    favoriteFood: '肉骨头',
    backstory: '来自温暖小镇的宠物店，从小就被教导要做一个乖巧的好孩子。',

    // === 稀有度与解锁 ===
    rarity: 'common',               // common / rare / epic / legendary
    price: 0,                       // 购买价格（星星），0 = 免费初始宠物
    unlockLevel: 1,                 // 解锁所需等级
    era: null,                      // 解锁所需时代（null = 无限制）

    // === 视觉资源 ===
    emoji: '🐕',
    thumbUrl: 'pet_animations/teddy/teddy-thumb.png',
    animations: {
      idle:  { frames: 4, interval: 3000 },
      click: { frames: 4, interval: 2000 },
      feed:  { frames: 4, interval: 2500 },
      bath:  { frames: 4, interval: 2500 },
      sleep: { frames: 4, interval: 4000 },
    },
    audioMap: {
      idle: 'pet_animations/teddy/audio/idle_1.mp3',
      click: 'pet_animations/teddy/audio/click_1.mp3',
      feed: 'pet_animations/teddy/audio/feed_1.mp3',
      bath: 'pet_animations/teddy/audio/bath_1.mp3',
      sleep: 'pet_animations/teddy/audio/sleep_1.mp3',
    },

    // === 成长阶段 ===
    growthStages: [
      { level: 1, name: '初相识',   threshold: 0,   size: 'w-20 h-20' },
      { level: 2, name: '小跟班',   threshold: 30,  size: 'w-24 h-24' },
      { level: 3, name: '好伙伴',   threshold: 80,  size: 'w-28 h-28' },
      { level: 4, name: '最佳搭档', threshold: 150, size: 'w-32 h-32' },
      { level: 5, name: '灵魂伴侣', threshold: 300, size: 'w-36 h-36' },
    ],

    // === 【预留】宠物属性系统 ===
    attributes: {
      element: 'earth',             // 元素亲和：fire / water / earth / wind / light / dark / none
      baseStats: {
        strength: 3,                // 力量（影响喂食效率）
        agility: 4,                 // 敏捷（影响玩耍心情加成）
        vitality: 5,                // 体力（影响属性衰减速度，越高衰减越慢）
        wisdom: 2,                  // 智慧（影响学习联动加成）
        charm: 6,                   // 魅力（影响心情恢复速度）
      },
      growthRates: {                // 每升一级各属性的成长值
        strength: 0.3,
        agility: 0.4,
        vitality: 0.5,
        wisdom: 0.2,
        charm: 0.6,
      },
    },

    // === 【预留】特殊技能 ===
    skills: [
      {
        id: 'teddy_encourage',
        name: '鼓励叫唤',
        desc: '泰迪犬发出鼓励的叫声，主人获得 2 分钟内打卡经验 +10% 的增益。',
        unlockLevel: 3,             // 宠物成长到几级解锁
        cooldown: 3600000,          // 冷却时间 1 小时
        type: 'buff',               // 技能类型：buff / heal / special / passive
        effect: {
          target: 'owner',          // 作用目标：owner（主人）/ self（宠物）/ both
          type: 'xp_boost',         // 效果类型
          value: 0.1,               // 效果数值（+10%）
          duration: 120000,         // 持续时间 2 分钟
        },
        icon: '📢',
        animation: 'click',         // 释放技能时播放的动画
      },
      {
        id: 'teddy_comfort',
        name: '温暖依偎',
        desc: '泰迪犬依偎在主人身边，瞬间恢复 15 点心情。',
        unlockLevel: 5,
        cooldown: 7200000,          // 2 小时
        type: 'heal',
        effect: {
          target: 'self',
          type: 'restore_mood',
          value: 15,
        },
        icon: '💕',
        animation: 'idle',
      },
    ],

    // === 【预留】元素克制关系（未来战斗系统用）===
    // element: { strong: 'wind', weak: 'fire' }
  },

  {
    id: 'border-collie',
    name: '边牧',
    species: '犬科',
    desc: '智商超群的牧羊犬，能听懂各种指令。学习能力极强，是学霸的最佳拍档。',
    personality: '聪明、活泼、服从',
    favoriteFood: '牛肉干',
    backstory: '曾是边境牧场最出色的牧羊犬，因向往知识的力量而来到学堂。',
    rarity: 'common',
    price: 0,
    unlockLevel: 1,
    era: null,
    emoji: '🐶',
    thumbUrl: 'pet_animations/border-collie/border-collie-thumb.png',
    animations: { idle: { frames: 1, interval: 3000 }, click: { frames: 1, interval: 2000 }, feed: { frames: 1, interval: 2500 }, bath: { frames: 1, interval: 2500 }, sleep: { frames: 1, interval: 4000 } },
    audioMap: null,
    growthStages: [
      { level: 1, name: '初相识', threshold: 0, size: 'w-20 h-20' },
      { level: 2, name: '小跟班', threshold: 30, size: 'w-24 h-24' },
      { level: 3, name: '好伙伴', threshold: 80, size: 'w-28 h-28' },
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
    animations: { idle: { frames: 1, interval: 3000 }, click: { frames: 1, interval: 2000 }, feed: { frames: 1, interval: 2500 }, bath: { frames: 1, interval: 2500 }, sleep: { frames: 1, interval: 4000 } },
    audioMap: null,
    growthStages: [
      { level: 1, name: '初相识', threshold: 0, size: 'w-20 h-20' },
      { level: 2, name: '小跟班', threshold: 30, size: 'w-24 h-24' },
      { level: 3, name: '好伙伴', threshold: 80, size: 'w-28 h-28' },
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
    animations: { idle: { frames: 1, interval: 3000 }, click: { frames: 1, interval: 2000 }, feed: { frames: 1, interval: 2500 }, bath: { frames: 1, interval: 2500 }, sleep: { frames: 1, interval: 4000 } },
    audioMap: null,
    growthStages: [
      { level: 1, name: '初相识', threshold: 0, size: 'w-20 h-20' },
      { level: 2, name: '小跟班', threshold: 30, size: 'w-24 h-24' },
      { level: 3, name: '好伙伴', threshold: 80, size: 'w-28 h-28' },
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
        cooldown: 86400000,         // 24 小时
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
    animations: { idle: { frames: 1, interval: 3000 }, click: { frames: 1, interval: 2000 }, feed: { frames: 1, interval: 2500 }, bath: { frames: 1, interval: 2500 }, sleep: { frames: 1, interval: 4000 } },
    audioMap: null,
    growthStages: [
      { level: 1, name: '初相识', threshold: 0, size: 'w-20 h-20' },
      { level: 2, name: '小跟班', threshold: 30, size: 'w-24 h-24' },
      { level: 3, name: '好伙伴', threshold: 80, size: 'w-28 h-28' },
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
        cooldown: 14400000,         // 4 小时
        type: 'buff',
        effect: { target: 'self', type: 'slow_decay', value: 0.5, duration: 7200000 },
        icon: '🧘',
        animation: 'sleep',
      },
    ],
  },

  // ============================================================
  // 新增宠物模板（取消注释并填写即可）
  // ============================================================
  // {
  //   id: 'new_pet_id',
  //   name: '宠物名',
  //   species: '物种',
  //   desc: '介绍文案',
  //   personality: '性格标签',
  //   favoriteFood: '喜爱食物',
  //   backstory: '背景故事',
  //   rarity: 'common',
  //   price: 0,
  //   unlockLevel: 1,
  //   era: null,
  //   emoji: '🐾',
  //   thumbUrl: 'pet_animations/new_pet_id/thumb.png',
  //   animations: { idle: { frames: 1, interval: 3000 }, click: { frames: 1, interval: 2000 }, feed: { frames: 1, interval: 2500 }, bath: { frames: 1, interval: 2500 }, sleep: { frames: 1, interval: 4000 } },
  //   audioMap: null,
  //   growthStages: [
  //     { level: 1, name: '初相识', threshold: 0, size: 'w-20 h-20' },
  //     { level: 2, name: '小跟班', threshold: 30, size: 'w-24 h-24' },
  //     { level: 3, name: '好伙伴', threshold: 80, size: 'w-28 h-28' },
  //     { level: 4, name: '最佳搭档', threshold: 150, size: 'w-32 h-32' },
  //     { level: 5, name: '灵魂伴侣', threshold: 300, size: 'w-36 h-36' },
  //   ],
  //   attributes: {
  //     element: 'none',
  //     baseStats: { strength: 5, agility: 5, vitality: 5, wisdom: 5, charm: 5 },
  //     growthRates: { strength: 0.5, agility: 0.5, vitality: 0.5, wisdom: 0.5, charm: 0.5 },
  //   },
  //   skills: [],
  // },
];


// ============================================================
// 二、宠物互动动作定义
// ============================================================

const PET_ACTIONS = {
  feed: {
    name: '喂食',
    icon: '🍖',
    starCost: 10,                   // 消耗星星
    effects: { fullness: +30, mood: +5, cleanliness: -5 },
    cooldown: 300000,               // 5 分钟
    desc: '轻轻点一下，就能让它更开心。',
    // 【预留】属性加成：力量越高，喂食回复量越大
    // attributeBonus: { stat: 'strength', effectField: 'fullness', ratio: 0.1 },
  },
  bath: {
    name: '洗香香',
    icon: '🛁',
    starCost: 15,
    effects: { cleanliness: +35, mood: +5 },
    cooldown: 600000,               // 10 分钟
    desc: '洗去一身疲惫，焕然一新。',
  },
  play: {
    name: '去玩耍',
    icon: '🎪',
    starCost: 20,
    effects: { mood: +40, fullness: -10, cleanliness: -10 },
    cooldown: 900000,               // 15 分钟
    desc: '出去撒欢跑一跑，心情大好！',
  },
  sleep: {
    name: '睡觉',
    icon: '💤',
    starCost: 8,
    effects: { mood: +15, fullness: -5 },
    cooldown: 1800000,              // 30 分钟
    desc: '安安稳稳睡一觉，醒来更有精神。',
  },
  pet: {
    name: '摸摸头',
    icon: '🤚',
    starCost: 0,                    // 免费
    effects: { mood: +8 },
    cooldown: 60000,                // 1 分钟
    desc: '温柔地摸摸它的头。',
  },
};


// ============================================================
// 三、宠物气泡对话
// ============================================================

const PET_MOOD_DIALOGS = {
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
// 四、元素系统定义（预留）
// ============================================================

const PET_ELEMENTS = {
  fire:  { name: '火', icon: '🔥', color: 'text-red-500',    bg: 'bg-red-50',    strong: 'wind',  weak: 'water' },
  water: { name: '水', icon: '💧', color: 'text-blue-500',   bg: 'bg-blue-50',   strong: 'fire',  weak: 'earth' },
  earth: { name: '土', icon: '🌿', color: 'text-emerald-500',bg: 'bg-emerald-50',strong: 'water', weak: 'wind' },
  wind:  { name: '风', icon: '🌀', color: 'text-cyan-500',   bg: 'bg-cyan-50',   strong: 'earth', weak: 'fire' },
  light: { name: '光', icon: '✨', color: 'text-amber-500',  bg: 'bg-amber-50',  strong: 'dark',  weak: 'dark' },
  dark:  { name: '暗', icon: '🌙', color: 'text-purple-500', bg: 'bg-purple-50', strong: 'light', weak: 'light' },
  none:  { name: '无', icon: '⚪', color: 'text-gray-500',   bg: 'bg-gray-50',   strong: null,    weak: null },
};


// ============================================================
// 五、属性名称映射（预留）
// ============================================================

const PET_STAT_NAMES = {
  strength:  { name: '力量', icon: '💪', color: 'text-red-500' },
  agility:   { name: '敏捷', icon: '⚡', color: 'text-yellow-500' },
  vitality:  { name: '体力', icon: '❤️', color: 'text-pink-500' },
  wisdom:    { name: '智慧', icon: '📖', color: 'text-blue-500' },
  charm:     { name: '魅力', icon: '✨', color: 'text-purple-500' },
};


// ============================================================
// 六、技能效果处理器定义（预留）
// 定义各类技能效果的元数据，供未来战斗/buff 系统使用
// ============================================================

const PET_SKILL_TYPES = {
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

const PET_SKILL_EFFECT_TYPES = {
  xp_boost:      { name: '经验增益',     unit: '%' },
  gold_boost:    { name: '金币增益',     unit: '%' },
  star_boost:    { name: '星星增益',     unit: '%' },
  restore_mood:  { name: '恢复心情',     unit: '点' },
  restore_fullness: { name: '恢复饱腹',  unit: '点' },
  slow_decay:    { name: '减缓衰减',     unit: '%' },
  streak_protect:{ name: '连续保护',     unit: '次' },
  double_reward: { name: '双倍奖励',     unit: '次' },
};
```

### 2.2 引用模式

index.html 中通过 `typeof` 安全访问（与 `HISTORICAL_EVENTS` 一致）：

```javascript
const petCatalog = (typeof PET_CATALOG !== 'undefined') ? PET_CATALOG : [];
const petActions = (typeof PET_ACTIONS !== 'undefined') ? PET_ACTIONS : {};
const petMoodDialogs = (typeof PET_MOOD_DIALOGS !== 'undefined') ? PET_MOOD_DIALOGS : {};
const petElements = (typeof PET_ELEMENTS !== 'undefined') ? PET_ELEMENTS : {};
const petStatNames = (typeof PET_STAT_NAMES !== 'undefined') ? PET_STAT_NAMES : {};
```

---

## 三、成就数据外置 — achievements.js

### 3.0 设计思路

将现有 `BADGES` 数组和 `ACHIEVEMENT_THEMES` 从 index.html 中提取到独立的 `achievements.js`，
同时将宠物成就作为新分类 `宠物` 合并进去。成就墙展示逻辑不变，宠物成就自动出现在"宠物"分类 tab 下。

### 3.0.1 文件结构

> 位置：与 index.html 同目录，通过 `<script src="achievements.js"></script>` 同步加载

```javascript
// achievements.js — 成就系统静态数据定义
// 将原 index.html 中的 BADGES 和 ACHIEVEMENT_THEMES 迁移到此文件
// 宠物成就作为 "宠物" 分类合并，统一存储、统一展示

// ============================================================
// 一、成就分类主题配色
// ============================================================

const ACHIEVEMENT_THEMES = {
  '荣耀':   { name: '荣耀',   color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-200' },
  '毅力':   { name: '毅力',   color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  '效率':   { name: '效率',   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  '精通':   { name: '精通',   color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-200' },
  '财富':   { name: '财富',   color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  '探索':   { name: '探索',   color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-200' },
  '宠物':   { name: '宠物',   color: 'text-teal-600',    bg: 'bg-teal-50',    border: 'border-teal-200' },  // 【新增】
};

// ============================================================
// 二、全部成就定义
// ============================================================

const BADGES = [
  // === 原有成就（从 index.html 迁移） ===
  { id: 'persistence',     name: '持之以恒',     desc: '连续7天都有打卡记录',            rarity: 'rare',      category: '毅力' },
  { id: 'iron_will',       name: '钢铁意志',     desc: '连续14天都有打卡记录',           rarity: 'epic',       category: '毅力' },
  { id: 'perfect_10',      name: '崭露头角',     desc: '累计打卡10次',                   rarity: 'common',    category: '毅力' },
  { id: 'steeled',         name: '百炼成钢',     desc: '累计打卡100次',                  rarity: 'epic',       category: '毅力' },
  // ...（其他原有成就此处省略，实际迁移时需完整保留）

  // === 宠物成就（融合进来，category 统一为 '宠物'） ===
  { id: 'pet_first',         name: '初次邂逅',   desc: '领养第一只宠物',                    rarity: 'common',    category: '宠物' },
  { id: 'pet_collector_3',   name: '小小收藏家', desc: '拥有 3 只不同的宠物',               rarity: 'rare',      category: '宠物' },
  { id: 'pet_collector_all', name: '百兽之王',   desc: '收集所有宠物',                      rarity: 'legendary', category: '宠物' },
  { id: 'pet_max_bond',      name: '灵魂羁绊',   desc: '与任意宠物达到「最佳搭档」等级',     rarity: 'epic',      category: '宠物' },
  { id: 'pet_max_bond_5',    name: '心意相通',   desc: '与任意宠物达到「灵魂伴侣」等级',     rarity: 'legendary', category: '宠物' },
  { id: 'pet_feed_100',      name: '饲养达人',   desc: '累计喂食 100 次',                  rarity: 'rare',      category: '宠物' },
  { id: 'pet_bath_50',       name: '清洁专家',   desc: '累计洗澡 50 次',                   rarity: 'rare',      category: '宠物' },
  { id: 'pet_all_5',         name: '五福临门',   desc: '拥有 5 只达到「好伙伴」等级的宠物',  rarity: 'epic',      category: '宠物' },
  { id: 'pet_legendary',     name: '天命所归',   desc: '领养一只神品宠物',                  rarity: 'epic',      category: '宠物' },
  { id: 'pet_rename',        name: '赐名之恩',   desc: '为宠物修改名字',                    rarity: 'common',    category: '宠物' },

  // ============================================================
  // 新增成就模板
  // ============================================================
  // { id: 'unique_id', name: '成就名', desc: '描述', rarity: 'common', category: '荣耀' },
];
```

### 3.0.2 与 index.html 的关系

- **迁移**：将 index.html 中 `BADGES` 数组（~行 1733）和 `ACHIEVEMENT_THEMES`（~行 1290）**删除**，由 `achievements.js` 提供
- **引用**：index.html 中所有引用 `BADGES` 和 `ACHIEVEMENT_THEMES` 的代码无需修改（全局变量同名替换）
- **存储不变**：成就解锁状态仍存储在 `app_achievements_v1`（共用同一个 key），宠物成就和其他成就共用同一份存储
- **成就墙不变**：`AchievementWallModal` 组件无需大改，只需确保 tab 列表包含"宠物"分类（`ACHIEVEMENT_THEMES` 中已有定义）

### 3.0.3 成就检查函数整合

原来 `checkAchievements` 函数（~行 11076）通过 `triggerType` 分发判断各类成就。
宠物成就的 condition 判断逻辑合并到同一个函数中：

```javascript
// 在 checkAchievements 的 switch 中追加宠物相关 case：
case 'pet_adopt':      unlocked = myOwned.length >= 1; break;
case 'pet_own_3':      unlocked = myOwned.length >= 3; break;
case 'pet_own_all':    unlocked = myOwned.length >= petCatalog.length; break;
case 'pet_bond_4':     unlocked = myOwned.some(id => { /* ... */ }); break;
case 'pet_bond_5':     unlocked = myOwned.some(id => { /* ... */ }); break;
case 'pet_feed_100':   unlocked = (petStats.feedCount || 0) >= 100; break;
case 'pet_bath_50':    unlocked = (petStats.bathCount || 0) >= 50; break;
case 'pet_five_3':     unlocked = myOwned.filter(id => { /* ... */ }).length >= 5; break;
case 'pet_legendary':  unlocked = myOwned.some(id => { /* ... */ }); break;
case 'pet_rename':     unlocked = triggerType === 'pet_rename'; break;
```

宠物成就不再需要独立的 `checkPetAchievements` 函数和独立的 `petAchievements` 状态。
所有成就共用 `achievements[activeChild]` 存储和 `checkAchievements` 检查函数。

### 3.0.4 新增宠物成就的操作步骤

1. 在 `achievements.js` 的 `BADGES` 数组中添加新条目，`category` 设为 `'宠物'`
2. 在 `checkAchievements` 函数中添加对应的 condition case
3. 不需要改成就墙 UI（`AchievementWallModal` 自动从 `BADGES` 读取并按 `category` 分组展示）

---

## 四、星星货币系统

### 3.1 设计思路

星星是独立于金元宝（gold）和经验值（xp）的**第三种货币**，专门用于宠物系统。

| 货币 | 符号 | 来源 | 用途 |
|------|------|------|------|
| 金元宝 | 💰 | 打卡奖励、转盘、商店 | 现有商店商品 |
| 经验值 | ⭐ XP | 打卡、金元宝转化、成就 | 升级、时代解锁 |
| **星星** | ⭐ | **打卡奖励（与金元宝同时获得）**、**宠物商店购买（高价）** | **宠物互动、宠物购买** |

### 3.2 星星获取规则

每完成一次打卡任务，同时获得三种奖励：

```
打卡一次 → 金元宝 (task.reward) + 经验值 (10 XP) + 星星 (固定 3 颗)
```

星星获得量是**固定的**，不受投资倍率卡影响（与金元宝的倍率机制隔离），确保：
- 星星经济独立于金元宝通胀
- 宠物互动有稳定的成本预期
- 不会出现"金元宝多就星星多"的失衡

### 3.3 星星在商店的购买

在现有商店（SHOP_ITEMS）中新增星星购买商品：

```javascript
// 在 SHOP_ITEMS 数组中新增（~行 1670 之后）：
{
  id: 'star_pack_small',
  name: '星辉小袋',
  icon: '⭐',
  type: 'buy_stars',              // 新类型
  price: 100,                     // 金元宝价格
  era: null,
  minLevel: 1,
  desc: '用 100 金元宝兑换 20 颗星星。星星是宠物互动的专用货币。',
  category: 'tool',
  starAmount: 20,                 // 获得的星星数量
},
{
  id: 'star_pack_large',
  name: '星辉宝箱',
  icon: '🌟',
  type: 'buy_stars',
  price: 500,
  era: null,
  minLevel: 3,
  desc: '用 500 金元宝兑换 120 颗星星（额外赠送 20 颗）。',
  category: 'tool',
  starAmount: 120,
},
```

> 价格设计意图：100 金元宝 = 20 星星，即 5:1 的兑换比率。
> 按每天打卡获得 3 颗星星计算，免费攒够一次喂食（10⭐）约需 3-4 天，
> 购买星辉小袋相当于花 100 金元宝加速约 1 周的星星积累。

### 3.4 星星状态声明（useStickyState）

> 位置：App 组件状态声明区（~行 9730 之后）

```javascript
// === 星星货币 ===
// 星星余额：{ [childName]: number }
const [stars, setStars] = useStickyState({}, 'app_stars_v1');

// 星星历史记录：{ [key]: amount }
// key 格式："{childName}-STAR_CHECKIN-{taskId}-{date}" 或 "{childName}-STAR_SHOP-{itemId}-{timestamp}"
const [starHistory, setStarHistory] = useStickyState({}, 'app_star_history_v1');
```

### 3.5 打卡时发放星星

> 位置：`saveCheckin` 函数中，在金元宝奖励（line 12490）和经验 Buff（line 12503）之间

```javascript
// --- 发放星星奖励（与金元宝独立） ---
const STAR_PER_CHECKIN = 3;
const starKey = `${activeChild}-STAR_CHECKIN-${editingEntry.taskId}-${editingEntry.date}`;
if (!starHistory[starKey]) {
    setStars(prev => ({ ...prev, [activeChild]: (prev[activeChild] || 0) + STAR_PER_CHECKIN }));
    setStarHistory(prev => ({ ...prev, [starKey]: STAR_PER_CHECKIN }));
}
```

### 3.6 星星总额计算

```javascript
// 计算星星总额（带缓存，与 calculateTotalGold 模式一致）
const calculateTotalStars = useCallback((childName) => {
    const history = starHistory || {};
    let total = 0;
    Object.keys(history).forEach(key => {
        if (key.startsWith(childName + '-STAR_')) {
            total += history[key];
        }
    });
    // 减去已消费的星星（从 petStats 中读取）
    const spent = (petStats[childName] || {}).totalStarsSpent || 0;
    return Math.max(0, total - spent);
}, [starHistory, petStats]);
```

### 3.7 星星显示位置

在主界面顶部状态栏添加星星余额显示（与金元宝、经验值并列）：

```javascript
// 主界面顶部（~行 13550 附近，与现有金元宝/XP 显示并列）
<div className="flex items-center gap-1 text-sm">
    <span>⭐</span>
    <span className="font-medium">{calculateTotalStars(activeChild)}</span>
    <span className="text-xs text-gray-400">星星</span>
</div>
```

---

## 四、运行时状态设计

### 4.1 App 组件内新增状态（useStickyState）

> 位置：App 组件状态声明区（~行 9730 之后）

```javascript
// === 宠物系统状态 ===

// 宠物运行时数据：{ [childName]: { [petId]: PetInstance } }
const [petData, setPetData] = useStickyState({}, 'app_pet_data_v1');

// 宠物商店已购买列表：{ [childName]: string[] }（已拥有的宠物 ID）
const [ownedPets, setOwnedPets] = useStickyState({}, 'app_owned_pets_v1');

// 当前激活宠物：{ [childName]: string }（当前展示的宠物 ID）
const [activePet, setActivePet] = useStickyState({}, 'app_active_pet_v1');

// 宠物互动冷却：{ [childName]: { [petId]: { [actionKey]: timestamp } } }
const [petCooldowns, setPetCooldowns] = useStickyState({}, 'app_pet_cooldowns_v1');

// 宠物统计数据：{ [childName]: PetStats }
const [petStats, setPetStats] = useStickyState({}, 'app_pet_stats_v1');

// 宠物音乐开关
const [petMusicOn, setPetMusicOn] = useStickyState(true, 'app_pet_music_v1');

// 【预留】宠物技能冷却：{ [childName]: { [petId]: { [skillId]: timestamp } } }
const [petSkillCooldowns, setPetSkillCooldowns] = useStickyState({}, 'app_pet_skill_cd_v1');

// 【预留】主人增益 Buff：{ [childName]: { [buffType]: { value, expiresAt, source } } }
const [petBuffs, setPetBuffs] = useStickyState({}, 'app_pet_buffs_v1');
```

### 4.2 PetInstance 数据结构

```javascript
// petData[childName][petId] 结构：
{
  id: 'teddy',
  nickname: '小泰迪',
  adoptedAt: '2026-05-04T10:00:00Z',
  stats: {
    fullness: 80,       // 饱腹度 0-100
    cleanliness: 70,    // 清洁度 0-100
    mood: 90,           // 心情 0-100
  },
  interactionCount: 45,
  lastInteraction: '2026-05-04T12:00:00Z',
  currentState: 'idle',

  // === 【预留】属性扩展 ===
  attributePoints: {            // 已分配的属性点（由 growthRates * level 自动计算）
    strength: 3.9,              // baseStats.strength + growthRates.strength * (level - 1)
    agility: 5.2,
    vitality: 6.5,
    wisdom: 2.8,
    charm: 8.4,
  },
  skillCooldowns: {             // 各技能上次使用时间
    'teddy_encourage': null,
    'teddy_comfort': null,
  },
  activeBuffs: [],              // 当前生效的 Buff 列表 [{ type, value, expiresAt }]
}
```

### 4.3 PetStats 统计结构

```javascript
// petStats[childName] 结构：
{
  totalInteractions: 120,
  feedCount: 40,
  bathCount: 25,
  playCount: 30,
  sleepCount: 20,
  petCount: 5,
  adoptedCount: 3,
  totalStarsSpent: 850,
  skillsUsed: 0,              // 【预留】累计使用技能次数
}
```

---

## 五、核心组件设计

### 5.1 PetModal — 宠物主界面

> 位置：Modal 组件区（~行 6090 之后）
> z-index: z-[85]

```javascript
const PetModal = ({ show, onClose, theme, activeChild, profiles,
                    petData, setPetData, ownedPets, setOwnedPets,
                    activePet, setActivePet, petCooldowns, setPetCooldowns,
                    petStats, setPetStats, petMusicOn, setPetMusicOn,
                    stars, setStars, setNotifications, level, currentEra,
                    achievements, setAchievements,
                    lowPerfMode }) => {
  if (!show) return null;

  // 安全访问 pets.js 全局常量
  const petCatalog = (typeof PET_CATALOG !== 'undefined') ? PET_CATALOG : [];
  const petActions = (typeof PET_ACTIONS !== 'undefined') ? PET_ACTIONS : {};

  const [currentTab, setCurrentTab] = useState('home');     // home / shop / album

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        <PetHeader theme={theme} onClose={onClose} currentTab={currentTab} setCurrentTab={setCurrentTab}
                   stars={stars} activeChild={activeChild} />
        <div className="flex-1 overflow-y-auto">
          {currentTab === 'home' && <PetHomeView ... />}
          {currentTab === 'shop' && <PetShopView ... />}
          {currentTab === 'album' && <PetAlbumView ... />}
        </div>
      </div>
    </div>
  );
};
```

### 5.2 PetHomeView — 宠物家园

```
┌─────────────────────────────────────────────┐
│  🐕 小泰迪的家     ⭐ 星星: 42    [设置⚙]   │
│  [家园] [商店] [图鉴]                        │
├─────────────────────────────────────────────┤
│                                             │
│              ┌──────────────┐               │
│              │  WebP 动画   │               │
│              └──────────────┘               │
│                                             │
│   💬 "主人，我好想你呀~"                     │
│                                             │
│  ❤️ 饱腹  ████████░░ 80                     │
│  🧼 清洁  ██████░░░░ 60                     │
│  😊 心情  █████████░ 90                     │
│                                             │
│  成长进度 Lv.3 好伙伴                        │
│  ████████████░░░░░░░░ 80/150                │
│                                             │
│  ┌─ 属性面板（预留）──────────────────┐      │
│  │ 💪力量 3.9  ⚡敏捷 5.2  ❤️体力 6.5│      │
│  │ 📖智慧 2.8  ✨魅力 8.4           │      │
│  └──────────────────────────────────┘      │
│                                             │
│  ┌─ 技能栏（预留）────────────────────┐      │
│  │ [📢 鼓励叫唤] [💕 温暖依偎]       │      │
│  └──────────────────────────────────┘      │
│                                             │
├─────────────────────────────────────────────┤
│  [🍖喂食]  [🛁洗香香]  [🎪去玩耍]  [💤睡觉]  │
│  -10⭐     -15⭐       -20⭐       -8⭐      │
└─────────────────────────────────────────────┘
```

#### 宠物动画渲染逻辑：

```javascript
const PetAnimationArea = ({ pet, lowPerfMode }) => {
  const petCatalog = (typeof PET_CATALOG !== 'undefined') ? PET_CATALOG : [];
  const catalogEntry = petCatalog.find(p => p.id === pet.id);
  const [animFrame, setAnimFrame] = useState(1);
  const [animState, setAnimState] = useState('idle');

  useEffect(() => {
    if (lowPerfMode) return;
    const config = catalogEntry?.animations?.[animState];
    if (!config || config.frames <= 1) return;
    const timer = setInterval(() => {
      setAnimFrame(prev => prev >= config.frames ? 1 : prev + 1);
    }, config.interval);
    return () => clearInterval(timer);
  }, [animState, catalogEntry, lowPerfMode]);

  const getAnimSrc = () => {
    if (lowPerfMode || !catalogEntry?.animations?.[animState] || catalogEntry.animations[animState].frames <= 1) {
      return catalogEntry?.thumbUrl;
    }
    return `pet_animations/${pet.id}/${animState}_${animFrame}.webp`;
  };

  const stageSize = getGrowthStage(catalogEntry, pet.interactionCount)?.size || 'w-20 h-20';

  return (
    <div className="relative flex items-center justify-center py-4">
      <img
        src={getAnimSrc()}
        alt={catalogEntry?.name || '宠物'}
        className={`${stageSize} object-contain transition-all duration-500
          ${animState === 'click' ? 'animate-bounce' : ''}
          ${animState === 'sleep' ? 'animate-pulse' : ''}`}
        onError={(e) => { if (catalogEntry?.thumbUrl) e.target.src = catalogEntry.thumbUrl; }}
      />
      {lowPerfMode && catalogEntry?.emoji && (
        <span className="text-6xl absolute">{catalogEntry.emoji}</span>
      )}
    </div>
  );
};
```

#### 属性面板组件（预留）：

```javascript
const PetAttributePanel = ({ pet, theme }) => {
  const petStatNames = (typeof PET_STAT_NAMES !== 'undefined') ? PET_STAT_NAMES : {};
  if (!pet.attributePoints) return null; // 旧数据兼容

  return (
    <div className={`p-3 rounded-xl border ${theme.border} ${theme.lightBg}`}>
      <h4 className="text-xs font-medium text-gray-500 mb-2">属性</h4>
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(pet.attributePoints).map(([stat, value]) => {
          const meta = petStatNames[stat] || { name: stat, icon: '•' };
          return (
            <div key={stat} className="text-center">
              <span className="text-lg">{meta.icon}</span>
              <div className="text-xs text-gray-600">{meta.name}</div>
              <div className={`text-sm font-bold ${meta.color || 'text-gray-800'}`}>
                {value.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

#### 技能栏组件（预留）：

```javascript
const PetSkillBar = ({ pet, petSkillCooldowns, onUseSkill, theme }) => {
  const petCatalog = (typeof PET_CATALOG !== 'undefined') ? PET_CATALOG : [];
  const catalogEntry = petCatalog.find(p => p.id === pet.id);
  const growthLevel = getGrowthStage(catalogEntry, pet.interactionCount)?.level || 1;
  const cooldowns = petSkillCooldowns || {};

  if (!catalogEntry?.skills?.length) return null;

  return (
    <div className={`p-3 rounded-xl border ${theme.border} ${theme.lightBg}`}>
      <h4 className="text-xs font-medium text-gray-500 mb-2">技能</h4>
      <div className="flex gap-2 flex-wrap">
        {catalogEntry.skills.map(skill => {
          const unlocked = growthLevel >= skill.unlockLevel;
          const lastUsed = cooldowns[pet.id]?.[skill.id] || 0;
          const onCooldown = Date.now() - lastUsed < skill.cooldown;
          const cdRemaining = onCooldown ? Math.ceil((skill.cooldown - (Date.now() - lastUsed)) / 60000) : 0;

          return (
            <button key={skill.id}
              disabled={!unlocked || onCooldown}
              onClick={() => onUseSkill(skill)}
              className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-all
                ${unlocked && !onCooldown ? `${theme.primaryBg} text-white hover:opacity-90` : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              title={unlocked ? (onCooldown ? `冷却中 ${cdRemaining} 分钟` : skill.desc) : `需要成长到 Lv.${skill.unlockLevel}`}
            >
              <span>{skill.icon}</span>
              <span>{skill.name}</span>
              {onCooldown && <span className="text-xs opacity-70">({cdRemaining}m)</span>}
              {!unlocked && <span className="text-xs opacity-70">🔒</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
```

### 5.3 PetShopView — 宠物商店

```
┌─────────────────────────────────────────────┐
│  🏪 宠物商店        ⭐ 星星: 42  [返回←]    │
├─────────────────────────────────────────────┤
│  筛选: [全部] [免费] [良品] [珍品] [神品]     │
│                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │  🐕     │  │  🐶     │  │  🐰     │     │
│  │ 泰迪犬  │  │  边牧    │  │ 安哥拉兔│     │
│  │ 凡品    │  │  凡品    │  │  良品    │     │
│  │ 免费    │  │  免费    │  │ 50⭐    │     │
│  │ Lv.1    │  │  Lv.1   │  │  Lv.3   │     │
│  │ [已拥有] │  │ [已拥有] │  │ [购买]   │     │
│  └─────────┘  └─────────┘  └─────────┘     │
│                                             │
│  ┌─────────┐  ┌─────────┐                  │
│  │  🦖     │  │  🦫     │                  │
│  │ 霸王龙  │  │ 卡皮巴拉│                  │
│  │  珍品    │  │  良品   │                  │
│  │ 200⭐   │  │  80⭐   │                  │
│  │ Lv.5    │  │  Lv.4   │                  │
│  │ 🔒锁定  │  │ [购买]  │                  │
│  └─────────┘  └─────────┘                  │
└─────────────────────────────────────────────┘
```

购买逻辑（使用星星而非金元宝）：

```javascript
const handleBuyPet = (petId) => {
  const petCatalog = (typeof PET_CATALOG !== 'undefined') ? PET_CATALOG : [];
  const catalog = petCatalog.find(p => p.id === petId);
  const myOwned = ownedPets[activeChild] || [];
  const currentStars = stars[activeChild] || 0;

  if (myOwned.includes(petId)) return showToast('你已经拥有这只宠物啦');
  if (level < catalog.unlockLevel) return showToast(`需要达到 ${catalog.unlockLevel} 级才能领养`);
  if (catalog.era && !isEraUnlocked(catalog.era)) return showToast(`需要解锁「${catalog.era}」时代`);
  if (currentStars < catalog.price) return showToast(`星星不够啦！需要 ${catalog.price} ⭐，当前只有 ${currentStars} ⭐`);

  // 扣星星
  if (catalog.price > 0) {
    setStars(prev => ({ ...prev, [activeChild]: currentStars - catalog.price }));
    setPetStats(prev => ({
      ...prev,
      [activeChild]: { ...(prev[activeChild] || {}), totalStarsSpent: ((prev[activeChild] || {}).totalStarsSpent || 0) + catalog.price },
    }));
  }

  const newPet = {
    id: petId,
    nickname: catalog.name,
    adoptedAt: new Date().toISOString(),
    stats: { fullness: 80, cleanliness: 80, mood: 80 },
    interactionCount: 0,
    lastInteraction: null,
    currentState: 'idle',
    // 【预留】初始化属性
    attributePoints: catalog.attributes ? { ...catalog.attributes.baseStats } : null,
    skillCooldowns: {},
    activeBuffs: [],
  };

  setPetData(prev => ({ ...prev, [activeChild]: { ...(prev[activeChild] || {}), [petId]: newPet } }));
  setOwnedPets(prev => ({ ...prev, [activeChild]: [...(prev[activeChild] || []), petId] }));

  if (!activePet[activeChild]) {
    setActivePet(prev => ({ ...prev, [activeChild]: petId }));
  }

  showToast(`🎉 成功领养了 ${catalog.name}！`);
  checkAchievements('pet_adopt', { petId, rarity: catalog.rarity });
};
```

### 5.4 PetAlbumView — 宠物图鉴

展示所有宠物（未拥有的以灰色剪影显示），点击可查看详细信息：

```
┌─────────────────────────────────────────────┐
│  📖 宠物图鉴                    [返回←]      │
│  已收集: 3/5                                │
├─────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐              │
│  │    🐕     │  │    🐶     │              │
│  │  泰迪犬   │  │   边牧     │              │
│  │  凡品     │  │   凡品     │              │
│  │  ✅已拥有  │  │  ✅已拥有  │              │
│  │           │  │           │              │
│  │ 犬科 · 🌿土│  │ 犬科 · 🌀风│              │
│  │ 性格:温顺  │  │ 性格:聪明  │              │
│  │ 喜爱:肉骨头│  │ 喜爱:牛肉干│              │
│  │ 技能:2个   │  │ 技能:1个   │              │
│  └───────────┘  └───────────┘              │
│                                             │
│  ┌───────────┐  ┌───────────┐              │
│  │    🔒     │  │    🦫     │              │
│  │  ???      │  │  卡皮巴拉  │              │
│  │  ???      │  │   良品     │              │
│  │  未解锁   │  │  ✅已拥有  │              │
│  └───────────┘  └───────────┘              │
└─────────────────────────────────────────────┘
```

### 5.5 宠物成就展示

宠物成就**不单独成页**，而是通过现有 `AchievementWallModal` 统一展示。
`ACHIEVEMENT_THEMES` 中已定义 `宠物` 分类配色（teal），`BADGES` 中 `category: '宠物'` 的条目
会自动出现在成就墙的"宠物"tab 下，无需额外组件。

> 注：`AchievementWallModal` 的 tab 列表从 `Object.keys(ACHIEVEMENT_THEMES)` 动态生成，
> 因此添加"宠物"分类后自动生效，无需修改成就墙组件代码。
> 只需确保 `getBadgeProgress` 函数中包含宠物相关 badge 的进度计算逻辑。

```javascript
// 在 AchievementWallModal 的 getBadgeProgress 函数中追加宠物相关 case：
case 'pet_first':         return { current: myOwned.length, target: 1 };
case 'pet_collector_3':   return { current: myOwned.length, target: 3 };
case 'pet_collector_all': return { current: myOwned.length, target: petCatalog.length };
case 'pet_max_bond':      return { current: maxBondLevel >= 4 ? 1 : 0, target: 1 };
case 'pet_max_bond_5':    return { current: maxBondLevel >= 5 ? 1 : 0, target: 1 };
case 'pet_feed_100':      return { current: petStats.feedCount || 0, target: 100 };
case 'pet_bath_50':       return { current: petStats.bathCount || 0, target: 50 };
case 'pet_all_5':         return { current: bond3Count, target: 5 };
case 'pet_legendary':     return { current: hasLegendary ? 1 : 0, target: 1 };
case 'pet_rename':        return { current: hasRenamed ? 1 : 0, target: 1 };
```

---

## 六、核心业务逻辑函数

### 6.1 宠物互动处理

```javascript
const handlePetAction = useCallback((actionKey) => {
  const petActions = (typeof PET_ACTIONS !== 'undefined') ? PET_ACTIONS : {};
  const action = petActions[actionKey];
  if (!action) return;

  const petId = activePet[activeChild];
  if (!petId) return;
  const pet = petData[activeChild]?.[petId];
  if (!pet) return;

  // 冷却检查
  const lastAction = petCooldowns[activeChild]?.[petId]?.[actionKey] || 0;
  if (Date.now() - lastAction < action.cooldown) {
    const remainMin = Math.ceil((action.cooldown - (Date.now() - lastAction)) / 60000);
    return showToast(`操作太频繁啦，还需等待 ${remainMin} 分钟~`);
  }

  // 星星检查（独立于金元宝）
  const currentStars = stars[activeChild] || 0;
  if (action.starCost > 0 && currentStars < action.starCost) {
    return showToast(`星星不够啦！需要 ${action.starCost} ⭐，当前只有 ${currentStars} ⭐`);
  }

  // 扣星星
  if (action.starCost > 0) {
    setStars(prev => ({ ...prev, [activeChild]: currentStars - action.starCost }));
  }

  // 更新宠物状态
  setPetData(prev => {
    const childPets = { ...(prev[activeChild] || {}) };
    const p = { ...childPets[petId] };

    // 【预留】属性加成计算
    let effects = { ...action.effects };
    // if (action.attributeBonus && p.attributePoints) {
    //   const bonus = p.attributePoints[action.attributeBonus.stat] * action.attributeBonus.ratio;
    //   effects[action.attributeBonus.effectField] = (effects[action.attributeBonus.effectField] || 0) + Math.floor(bonus);
    // }

    p.stats = {
      fullness: Math.max(0, Math.min(100, p.stats.fullness + (effects.fullness || 0))),
      cleanliness: Math.max(0, Math.min(100, p.stats.cleanliness + (effects.cleanliness || 0))),
      mood: Math.max(0, Math.min(100, p.stats.mood + (effects.mood || 0))),
    };
    p.interactionCount += 1;
    p.lastInteraction = new Date().toISOString();
    p.currentState = actionKey;
    childPets[petId] = p;
    return { ...prev, [activeChild]: childPets };
  });

  // 更新冷却
  setPetCooldowns(prev => ({
    ...prev,
    [activeChild]: {
      ...(prev[activeChild] || {}),
      [petId]: { ...(prev[activeChild]?.[petId] || {}), [actionKey]: Date.now() },
    },
  }));

  // 更新统计
  setPetStats(prev => {
    const s = { ...(prev[activeChild] || {}) };
    s.totalInteractions = (s.totalInteractions || 0) + 1;
    s[`${actionKey}Count`] = (s[`${actionKey}Count`] || 0) + 1;
    s.totalStarsSpent = (s.totalStarsSpent || 0) + action.starCost;
    return { ...prev, [activeChild]: s };
  });

  // 播放音效
  if (petMusicOn) {
    const petCatalog = (typeof PET_CATALOG !== 'undefined') ? PET_CATALOG : [];
    const catalog = petCatalog.find(p => p.id === petId);
    if (catalog?.audioMap?.[actionKey]) {
      new Audio(catalog.audioMap[actionKey]).play().catch(() => {});
    }
  }

  checkAchievements('pet_' + actionKey, { petId });

  // 3 秒后恢复 idle
  setTimeout(() => {
    setPetData(prev => {
      const childPets = { ...(prev[activeChild] || {}) };
      if (childPets[petId]) {
        childPets[petId] = { ...childPets[petId], currentState: 'idle' };
      }
      return { ...prev, [activeChild]: childPets };
    });
  }, 3000);
}, [activeChild, activePet, petData, petCooldowns, stars, petMusicOn]);
```

### 6.2 【预留】技能使用处理

```javascript
const handleUsePetSkill = useCallback((skill) => {
  const petId = activePet[activeChild];
  if (!petId) return;
  const pet = petData[activeChild]?.[petId];
  if (!pet) return;

  // 检查冷却
  const lastUsed = petSkillCooldowns[activeChild]?.[petId]?.[skill.id] || 0;
  if (Date.now() - lastUsed < skill.cooldown) {
    return showToast('技能冷却中~');
  }

  // 应用效果
  if (skill.effect.target === 'owner' || skill.effect.target === 'both') {
    // 给主人添加 Buff
    setPetBuffs(prev => ({
      ...prev,
      [activeChild]: {
        ...(prev[activeChild] || {}),
        [skill.effect.type]: {
          value: skill.effect.value,
          expiresAt: skill.effect.duration ? Date.now() + skill.effect.duration : null,
          charges: skill.effect.charges || null,
          source: petId,
        },
      },
    }));
    showToast(`${skill.icon} ${skill.name} 效果已激活！`);
  }

  if (skill.effect.target === 'self' || skill.effect.target === 'both') {
    // 恢复宠物属性
    if (skill.effect.type === 'restore_mood') {
      setPetData(prev => {
        const childPets = { ...(prev[activeChild] || {}) };
        const p = { ...childPets[petId] };
        p.stats = { ...p.stats, mood: Math.min(100, p.stats.mood + skill.effect.value) };
        childPets[petId] = p;
        return { ...prev, [activeChild]: childPets };
      });
    }
    showToast(`${skill.icon} ${skill.name} 已释放！`);
  }

  // 更新技能冷却
  setPetSkillCooldowns(prev => ({
    ...prev,
    [activeChild]: {
      ...(prev[activeChild] || {}),
      [petId]: { ...(prev[activeChild]?.[petId] || {}), [skill.id]: Date.now() },
    },
  }));

  // 更新统计
  setPetStats(prev => {
    const s = { ...(prev[activeChild] || {}) };
    s.skillsUsed = (s.skillsUsed || 0) + 1;
    return { ...prev, [activeChild]: s };
  });

  // 播放技能动画
  setPetData(prev => {
    const childPets = { ...(prev[activeChild] || {}) };
    if (childPets[petId]) {
      childPets[petId] = { ...childPets[petId], currentState: skill.animation || 'click' };
    }
    return { ...prev, [activeChild]: childPets };
  });
  setTimeout(() => {
    setPetData(prev => {
      const childPets = { ...(prev[activeChild] || {}) };
      if (childPets[petId]) {
        childPets[petId] = { ...childPets[petId], currentState: 'idle' };
      }
      return { ...prev, [activeChild]: childPets };
    });
  }, 3000);
}, [activeChild, activePet, petData, petSkillCooldowns]);
```

### 6.3 属性衰减机制

```javascript
useEffect(() => {
  const childPets = petData[activeChild];
  if (!childPets) return;

  let hasChanges = false;
  const updated = { ...childPets };

  Object.keys(updated).forEach(petId => {
    const pet = updated[petId];
    if (!pet.lastInteraction) return;

    const hoursSince = (Date.now() - new Date(pet.lastInteraction).getTime()) / 3600000;
    if (hoursSince < 1) return;

    const decay = Math.floor(hoursSince / 2);
    if (decay <= 0) return;

    // 【预留】属性影响衰减速度：vitality 越高，衰减越慢
    // const vitality = pet.attributePoints?.vitality || 5;
    // const decayMultiplier = Math.max(0.3, 1 - vitality * 0.05);
    const decayMultiplier = 1;

    hasChanges = true;
    updated[petId] = {
      ...pet,
      stats: {
        ...pet.stats,
        fullness: Math.max(0, pet.stats.fullness - Math.floor(decay * 3 * decayMultiplier)),
        cleanliness: Math.max(0, pet.stats.cleanliness - Math.floor(decay * 2 * decayMultiplier)),
        mood: Math.max(0, pet.stats.mood - Math.floor(decay * 2 * decayMultiplier)),
      },
    };
  });

  if (hasChanges) {
    setPetData(prev => ({ ...prev, [activeChild]: updated }));
  }
}, [deferredActiveChild]);
```

### 6.4 成长等级计算

```javascript
const getGrowthStage = useCallback((catalogEntry, interactionCount) => {
  if (!catalogEntry?.growthStages) return { level: 1, name: '初相识', threshold: 0, size: 'w-20 h-20' };
  const stages = catalogEntry.growthStages;
  let current = stages[0];
  for (const stage of stages) {
    if (interactionCount >= stage.threshold) current = stage;
    else break;
  }
  return current;
}, []);

const getNextGrowthStage = useCallback((catalogEntry, interactionCount) => {
  if (!catalogEntry?.growthStages) return null;
  for (const stage of catalogEntry.growthStages) {
    if (interactionCount < stage.threshold) return stage;
  }
  return null;
}, []);
```

### 6.5 宠物成就检查

宠物成就不再有独立的检查函数。所有成就（包括宠物成就）统一由现有 `checkAchievements` 函数处理。
宠物相关操作通过 triggerType 前缀 `'pet_'` 触发，在函数内部的 switch 中分发判断：

```javascript
// 在现有 checkAchievements 函数（~行 11076）的 switch 中追加：
// triggerType 传入 'pet_adopt' / 'pet_feed' / 'pet_bath' / 'pet_play' / 'pet_sleep' / 'pet_rename' 等
const petCatalog = (typeof PET_CATALOG !== 'undefined') ? PET_CATALOG : [];
const myOwned = ownedPets[activeChild] || [];
const petStatsData = petStats[activeChild] || {};

// 计算宠物相关进度指标
const maxBondLevel = myOwned.reduce((max, id) => {
  const pet = petData[activeChild]?.[id];
  const cat = petCatalog.find(p => p.id === id);
  if (!pet || !cat) return max;
  return Math.max(max, getGrowthStage(cat, pet.interactionCount).level);
}, 0);
const bond3Count = myOwned.filter(id => {
  const pet = petData[activeChild]?.[id];
  const cat = petCatalog.find(p => p.id === id);
  return pet && cat && getGrowthStage(cat, pet.interactionCount).level >= 3;
}).length;
const hasLegendary = myOwned.some(id => {
  const cat = petCatalog.find(p => p.id === id);
  return cat && cat.rarity === 'legendary';
});

// 在 switch 中追加宠物 case：
case 'pet_first':         unlocked = myOwned.length >= 1; break;
case 'pet_collector_3':   unlocked = myOwned.length >= 3; break;
case 'pet_collector_all': unlocked = myOwned.length >= petCatalog.length; break;
case 'pet_max_bond':      unlocked = maxBondLevel >= 4; break;
case 'pet_max_bond_5':    unlocked = maxBondLevel >= 5; break;
case 'pet_feed_100':      unlocked = (petStatsData.feedCount || 0) >= 100; break;
case 'pet_bath_50':       unlocked = (petStatsData.bathCount || 0) >= 50; break;
case 'pet_all_5':         unlocked = bond3Count >= 5; break;
case 'pet_legendary':     unlocked = hasLegendary; break;
case 'pet_rename':        unlocked = triggerType === 'pet_rename'; break;
```

成就存储仍使用 `achievements[activeChild]`（与现有成就共用同一个 key），
通知仍通过 `setNotifications` 推送，无需额外状态。

### 6.6 打卡时发放星星

> 位置：`saveCheckin` 函数中，金元宝写入 wheelHistory（line 12490）之后

```javascript
// --- 发放星星奖励 ---
const STAR_PER_CHECKIN = 3;
const starKey = `${activeChild}-STAR_CHECKIN-${editingEntry.taskId}-${editingEntry.date}`;
if (!starHistory[starKey]) {
    setStars(prev => ({ ...prev, [activeChild]: (prev[activeChild] || 0) + STAR_PER_CHECKIN }));
    setStarHistory(prev => ({ ...prev, [starKey]: STAR_PER_CHECKIN }));
}
```

### 6.7 商店购买星星

> 位置：`useItem` 函数中（~行 10539 的 if/else if 链）

```javascript
// 在 useItem 的 type 分发链中新增：
else if (item.type === 'buy_stars') {
    setStars(prev => ({ ...prev, [activeChild]: (prev[activeChild] || 0) + item.starAmount }));
    showToast(`✨ 获得 ${item.starAmount} 颗星星！`);
}
```

---

## 七、入口与集成

### 7.1 主界面星星显示

> 位置：主布局顶部状态栏（~行 13550，与金元宝/XP 显示并列）

```javascript
<div className="flex items-center gap-1 text-sm">
    <span>⭐</span>
    <span className={`font-medium ${theme.primary}`}>{calculateTotalStars(activeChild)}</span>
    <span className="text-xs text-gray-400">星星</span>
</div>
```

### 7.2 宠物入口按钮

> 位置：浮动按钮区（~行 13800）

```javascript
<button
  onClick={() => setShowPet(true)}
  className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${theme.gradient}
    shadow-lg hover:shadow-xl transform hover:scale-110 transition-all
    flex items-center justify-center text-white text-xl group`}
  title="我的宠物"
>
  {(() => {
    const petId = activePet[activeChild];
    const petCatalog = (typeof PET_CATALOG !== 'undefined') ? PET_CATALOG : [];
    const cat = petId ? petCatalog.find(p => p.id === petId) : null;
    return cat ? cat.emoji : '🐾';
  })()}
  {(() => {
    const petId = activePet[activeChild];
    const pet = petId ? petData[activeChild]?.[petId] : null;
    if (pet && (pet.stats.fullness < 30 || pet.stats.mood < 30)) {
      return <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />;
    }
    return null;
  })()}
</button>
```

### 7.3 宠物状态提醒

```javascript
useEffect(() => {
  const checkPetMood = () => {
    const petId = activePet[activeChild];
    if (!petId) return;
    const pet = petData[activeChild]?.[petId];
    if (!pet) return;
    if (pet.stats.fullness < 20) {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: `🐾 ${pet.nickname || '你的宠物'}肚子好饿，快去喂食吧！`,
        time: new Date().toLocaleTimeString(),
        read: false,
      }]);
    } else if (pet.stats.mood < 20) {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: `🐾 ${pet.nickname || '你的宠物'}心情很低落，快去陪陪它吧！`,
        time: new Date().toLocaleTimeString(),
        read: false,
      }]);
    }
  };
  const timer = setInterval(checkPetMood, 1800000);
  return () => clearInterval(timer);
}, [activeChild, activePet, petData]);
```

### 7.4 打卡联动

```javascript
// 在 saveCheckin 成功后追加：
const petId = activePet[activeChild];
if (petId) {
    setPetData(prev => {
      const childPets = { ...(prev[activeChild] || {}) };
      const pet = childPets[petId];
      if (pet) {
        childPets[petId] = {
          ...pet,
          stats: { ...pet.stats, mood: Math.min(100, pet.stats.mood + 5) },
        };
      }
      return { ...prev, [activeChild]: childPets };
    });
}
```

---

## 八、样式与动画

### 8.1 新增 CSS 动画

> 位置：现有 CSS 动画定义区（~行 1129 之前）

```css
/* 宠物专用动画 */
@keyframes pet-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}
@keyframes pet-bounce-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes pet-eat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1) rotate(3deg); }
}
@keyframes pet-sleep-bob {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(3px) rotate(2deg); }
}
@keyframes pet-sparkle {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}

.animate-pet-wiggle { animation: pet-wiggle 0.5s ease-in-out; }
.animate-pet-bounce-gentle { animation: pet-bounce-gentle 1.5s ease-in-out infinite; }
.animate-pet-eat { animation: pet-eat 0.4s ease-in-out; }
.animate-pet-sleep-bob { animation: pet-sleep-bob 3s ease-in-out infinite; }
.animate-pet-sparkle { animation: pet-sparkle 1s ease-in-out; }
```

### 8.2 低性能设备适配

利用已有 `lowPerfMode` 状态，宠物动画自动降级为静态缩略图 + emoji 兜底。

---

## 九、数据维护指南

### 9.1 新增宠物

1. 准备动画资源：创建 `pet_animations/{pet_id}/` 目录
2. 在 `pets.js` 的 `PET_CATALOG` 数组末尾添加新对象
3. 填写 `attributes`（元素、基础属性）和 `skills`（可为空数组）
4. 如需在商店出售，设置 `price`（星星）和 `unlockLevel`

### 9.2 移除宠物

1. 从 `pets.js` 的 `PET_CATALOG` 中删除对应对象
2. 已拥有该宠物的用户数据自动失效（渲染时找不到 catalog 会跳过）

### 9.3 修改宠物文案

直接编辑 `pets.js` 中对应宠物的 `desc`、`personality`、`favoriteFood`、`backstory` 字段。

### 9.4 调整互动消耗

编辑 `pets.js` 中 `PET_ACTIONS` 对象对应动作的 `starCost` 和 `effects` 字段。

### 9.5 增删成就（含宠物成就）

所有成就统一在 `achievements.js` 的 `BADGES` 数组中维护：
- 新增成就：添加条目，`category` 设为对应分类（宠物成就用 `'宠物'`）
- 在 `checkAchievements` 函数的 switch 中添加对应的 condition case
- 在 `getBadgeProgress` 函数中添加对应的进度计算逻辑
- 成就墙 UI 自动从 `BADGES` 和 `ACHIEVEMENT_THEMES` 读取，无需修改组件代码

### 9.6 增删宠物技能

编辑 `pets.js` 中对应宠物的 `skills` 数组。添加新技能只需遵循结构：

```javascript
{
  id: 'unique_skill_id',
  name: '技能名',
  desc: '技能描述',
  unlockLevel: 3,         // 宠物成长到几级解锁
  cooldown: 3600000,      // 冷却时间（毫秒）
  type: 'buff',           // buff / heal / special / passive
  effect: { target: 'owner', type: 'xp_boost', value: 0.1, duration: 120000 },
  icon: '📢',
  animation: 'click',
}
```

### 9.7 localStorage 键名清单

| 键名 | 版本 | 内容 |
|------|------|------|
| `app_stars_v1` | v1 | 星星余额 |
| `app_star_history_v1` | v1 | 星星收支历史 |
| `app_pet_data_v1` | v1 | 宠物运行时数据 |
| `app_owned_pets_v1` | v1 | 已拥有宠物 ID 列表 |
| `app_active_pet_v1` | v1 | 当前激活宠物 ID |
| `app_pet_cooldowns_v1` | v1 | 互动冷却时间戳 |
| `app_pet_stats_v1` | v1 | 宠物互动统计 |
| `app_pet_music_v1` | v1 | 宠物音效开关 |
| `app_pet_skill_cd_v1` | v1 | 【预留】技能冷却 |
| `app_pet_buffs_v1` | v1 | 【预留】主人增益 Buff |

> 注：宠物成就解锁状态存储在现有的 `app_achievements_v1` 中（与其他成就共用同一 key），
> 通过 `category: '宠物'` 区分，无需单独的存储键。

---

## 十、资源文件结构

```
pet_animations/
├── teddy/
│   ├── teddy.png
│   ├── teddy-thumb.png
│   ├── idle_1.webp ~ idle_4.webp
│   ├── click_1.webp ~ click_4.webp
│   ├── feed_1.webp ~ feed_4.webp
│   ├── bath_1.webp ~ bath_4.webp
│   ├── sleep_1.webp ~ sleep_4.webp
│   └── audio/ (20 个 .mp3)
├── border-collie/
│   ├── border-collie.png
│   └── border-collie-thumb.png
├── angora-rabbit/
│   └── angora-rabbit-thumb.png
├── t-rex/
│   └── t-rex-thumb.png
└── capybara/
    └── capybara-thumb.png
```

---

## 十一、与现有系统的集成点总结

| 现有系统 | 集成方式 |
|---------|---------|
| **金币系统 (gold)** | 不直接消耗，但商店中可用金元宝高价购买星星 |
| **经验值 (xp)** | 独立，不受宠物系统影响 |
| **星星系统 (stars)** | 【新增】打卡获得 3⭐/次，宠物互动消耗星星 |
| **等级系统 (level)** | 高级宠物需达到指定等级解锁 |
| **时代系统 (era)** | 部分宠物需解锁特定历史时代 |
| **主题系统 (theme)** | 宠物 UI 全部使用 `theme.*` 类名 |
| **成就系统 (achievements)** | 宠物成就融合进现有成就墙，新增 `宠物` 分类，共用 `app_achievements_v1` 存储 |
| **通知系统 (notifications)** | 宠物提醒、成就解锁通过现有通知队列 |
| **多档案 (profiles)** | 宠物+星星数据按 `activeChild` 隔离 |
| **商店系统 (SHOP_ITEMS)** | 新增 `buy_stars` 类型商品 |
| **外部数据 (pets.js)** | 与 events.js/levels.js/achievements.js 同级，可独立维护 |

---

## 十二、实现优先级建议

| 阶段 | 内容 | 工作量 |
|------|------|--------|
| **P0 基础** | 创建 achievements.js（迁移 BADGES+ACHIEVEMENT_THEMES）+ 创建 pets.js + 星星货币系统 + index.html 引入脚本 + 星星打卡发放 + 星星显示 | 1.5 天 |
| **P1 核心** | PetModal + PetHomeView + 基础互动（喂食/洗澡/玩耍/睡觉/摸头）+ 状态条 + 衰减 | 2 天 |
| **P2 商店** | PetShopView + 购买逻辑 + 商店星星兑换商品 | 1 天 |
| **P3 图鉴** | PetAlbumView + 宠物详情 | 0.5 天 |
| **P4 成就** | 在 achievements.js 添加宠物成就条目 + checkAchievements 追加宠物 case + getBadgeProgress 追加宠物进度 | 0.5 天 |
| **P5 增强** | 气泡对话 + 打卡联动 + 音效 + 宠物入口提醒 | 1 天 |
| **P6 属性** | 实现 attributes 属性面板 + 属性影响互动效果 + 属性影响衰减速度 | 1 天 |
| **P7 技能** | 实现 skills 技能系统 + 技能释放 + Buff 机制 + 技能冷却 | 1-2 天 |
| **P8 战斗** | 【远期】元素克制 + 宠物对战 + PvP | 待定 |
