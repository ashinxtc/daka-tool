// ============================================================
// achievements.js — 成就系统数据与UI组件
// 从 index.html 提取，便于独立维护
// ============================================================

const AchievementSystem = {};

// --- 成就墙类别配色 ---
AchievementSystem.ACHIEVEMENT_THEMES = {
    '荣耀': { title: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', cardBg: 'bg-white', iconBg: 'bg-indigo-100 text-indigo-500', ring: 'ring-indigo-100' },
    '毅力': { title: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', cardBg: 'bg-white', iconBg: 'bg-blue-100 text-blue-500', ring: 'ring-blue-100' },
    '效率': { title: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', cardBg: 'bg-white', iconBg: 'bg-emerald-100 text-emerald-500', ring: 'ring-emerald-100' },
    '精通': { title: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', cardBg: 'bg-white', iconBg: 'bg-violet-100 text-violet-500', ring: 'ring-violet-100' },
    '财富': { title: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', cardBg: 'bg-white', iconBg: 'bg-amber-100 text-amber-500', ring: 'ring-amber-100' },
    '探索': { title: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', cardBg: 'bg-white', iconBg: 'bg-rose-100 text-rose-500', ring: 'ring-rose-100' },
    '宠物': { title: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', cardBg: 'bg-white', iconBg: 'bg-teal-100 text-teal-500', ring: 'ring-teal-100' },
};

// --- 徽章定义 ---
AchievementSystem.BADGES = [
    // 荣耀之路
    { id: 'bronze_collector', name: '青铜收藏家', desc: '你的收藏之旅已经有了完美的开端！', rarity: 'rare', category: '荣耀' },
    { id: 'silver_master', name: '白银大师', desc: '稀有的光芒，因你的努力而汇集。', rarity: 'epic', category: '荣耀' },
    { id: 'golden_legend', name: '黄金传说', desc: '你正在书写属于自己的黄金篇章！', rarity: 'legendary', category: '荣耀' },
    { id: 'perseverance_incarnate', name: '毅力化身', desc: '坚持，是你最强大的超能力。', rarity: 'epic', category: '荣耀' },
    { id: 'era_pioneer', name: '时代领航者', desc: '成功进化到第六纪元"魏晋隋唐·融合与登科"（Lv.33+）', rarity: 'epic', category: '荣耀' },
    { id: 'grandmaster', name: '全能宗师', desc: '集齐"精通"系列的所有徽章', rarity: 'legendary', category: '荣耀' },
    // 毅力之心
    { id: 'first_blood', name: '初试锋芒', desc: '首次完成任意一次打卡', rarity: 'common', category: '毅力' },
    { id: 'persistence', name: '持之以恒', desc: '连续7天都有打卡记录', rarity: 'rare', category: '毅力' },
    { id: 'iron_will', name: '钢铁意志', desc: '连续14天都有打卡记录', rarity: 'epic', category: '毅力' },
    { id: 'marathon', name: '假期马拉松', desc: '整个寒假全勤打卡', rarity: 'legendary', category: '毅力' },
    { id: 'perfect_10', name: '十全十美', desc: '累计完成10次打卡', rarity: 'common', category: '毅力' },
    { id: 'steeled', name: '百炼成钢', desc: '累计完成100次打卡', rarity: 'rare', category: '毅力' },
    { id: 'weekend_warrior', name: '周末战士', desc: '连续两个周末都有打卡记录', rarity: 'rare', category: '毅力' },
    { id: 'dawn_knight', name: '黎明骑士', desc: '在早上7:00前完成任意一次打卡', rarity: 'epic', category: '毅力' },
    { id: 'repair_master', name: '补救大师', desc: '累计使用"普罗米修斯之火"5次', rarity: 'rare', category: '毅力' },
    { id: 'accumulation', name: '积少成多', desc: '累计完成300次打卡', rarity: 'epic', category: '毅力' },
    { id: 'return_king', name: '王者归来', desc: '中断打卡3天以上后重新打卡', rarity: 'rare', category: '毅力' },
    // 效率之星
    { id: 'early_bird', name: '早起的鸟儿', desc: '连续3天在上午9:00前完成打卡', rarity: 'rare', category: '效率' },
    { id: 'lightning', name: '闪电快手', desc: '提前3天完成某项任务目标', rarity: 'rare', category: '效率' },
    { id: 'daily_done', name: '今日事今日毕', desc: '一天内完成转盘所需任务', rarity: 'epic', category: '效率' },
    // 精通之路
    { id: 'accomplished', name: '学有所成', desc: '单项任务目标完成率100%', rarity: 'epic', category: '精通' },
    { id: 'chinese_master', name: '语文大师', desc: '累计完成语文相关任务20次', rarity: 'rare', category: '精通' },
    { id: 'literary_giant', name: '文学巨匠', desc: '累计完成语文相关任务50次', rarity: 'epic', category: '精通' },
    { id: 'literary_grandmaster', name: '文坛宗师', desc: '累计完成语文相关任务100次', rarity: 'legendary', category: '精通' },
    { id: 'math_whiz', name: '数学小能手', desc: '累计完成数学相关任务20次', rarity: 'rare', category: '精通' },
    { id: 'logic_master', name: '逻辑大师', desc: '累计完成数学相关任务50次', rarity: 'epic', category: '精通' },
    { id: 'math_god', name: '数理之神', desc: '累计完成数学相关任务100次', rarity: 'legendary', category: '精通' },
    { id: 'english_ace', name: '英语优等生', desc: '累计完成英语相关任务20次', rarity: 'rare', category: '精通' },
    { id: 'translation_master', name: '翻译大师', desc: '累计完成英语相关任务50次', rarity: 'epic', category: '精通' },
    { id: 'language_lord', name: '语言领主', desc: '累计完成英语相关任务100次', rarity: 'legendary', category: '精通' },
    { id: 'science_star', name: '科学新星', desc: '累计完成科学相关任务20次', rarity: 'rare', category: '精通' },
    { id: 'future_inventor', name: '未来发明家', desc: '累计完成科学相关任务50次', rarity: 'epic', category: '精通' },
    { id: 'science_titan', name: '科学泰斗', desc: '累计完成科学相关任务100次', rarity: 'legendary', category: '精通' },
    { id: 'artist', name: '音乐艺术家', desc: '累计完成琵琶任务80%', rarity: 'epic', category: '精通' },
    { id: 'all_rounder', name: '多面手', desc: '一周内在3个不同任务上各完成5次打卡', rarity: 'rare', category: '精通' },
    { id: 'polymath', name: '博览群书', desc: '累计完成语文、数学、英语三门主科任务各50次', rarity: 'epic', category: '精通' },
    { id: 'six_arms', name: '三头六臂', desc: '一天之内完成10项或以上不同的任务', rarity: 'legendary', category: '精通' },
    // 财富之旅
    { id: 'first_pot', name: '第一桶金', desc: '累计获得100金元宝', rarity: 'common', category: '财富' },
    { id: 'tycoon', name: '小富翁', desc: '累计获得1000金元宝', rarity: 'rare', category: '财富' },
    { id: 'wealthy', name: '财源滚滚', desc: '累计获得5000金元宝', rarity: 'epic', category: '财富' },
    { id: 'overnight_rich', name: '一夜暴富', desc: '单日累计获得超过100金元宝', rarity: 'epic', category: '财富' },
    { id: 'big_spender', name: '挥金如土', desc: '累计消费超过500金元宝', rarity: 'common', category: '财富' },
    { id: 'money_bags', name: '散财童子', desc: '累计消费超过 2000 元宝', rarity: 'rare', category: '财富' },
    { id: 'whale_player', name: '氪金玩家', desc: '累计消费超过 5000 元宝', rarity: 'epic', category: '财富' },
    { id: 'market_owner', name: '富可敌国', desc: '累计消费超过 10000 元宝', rarity: 'legendary', category: '财富' },
    { id: 'shopaholic', name: '购物狂', desc: '在市集消费或抽奖累计 10 次', rarity: 'common', category: '财富' },
    { id: 'hand_chopper', name: '剁手党', desc: '在市集消费或抽奖累计 50 次', rarity: 'rare', category: '财富' },
    { id: 'cart_clearer', name: '清空购物车', desc: '在市集消费或抽奖累计 100 次', rarity: 'legendary', category: '财富' },
    { id: 'high_roller', name: '一掷千金', desc: '单次消费(或扣款)超过 100 元宝', rarity: 'common', category: '财富' },
    { id: 'diamond_hands', name: '钻石手', desc: '单次消费超过 300 元宝', rarity: 'rare', category: '财富' },
    { id: 'bankruptcy', name: '倾家荡产', desc: '单次消费超过 800 元宝', rarity: 'epic', category: '财富' },
    { id: 'investment_guru', name: '投资达人', desc: '成功使用"投资卡"并获得超过500金元宝的额外收益', rarity: 'epic', category: '财富' },
    { id: 'midas_touch', name: '点石成金', desc: '个人拥有的金元宝数量首次超过2000', rarity: 'legendary', category: '财富' },
    { id: 'lucky_star', name: '幸运之星', desc: '抽中大转盘最高奖励', rarity: 'epic', category: '财富' },
    // 探索之光
    { id: 'curious', name: '好奇宝宝', desc: '尝试探索设置页面', rarity: 'common', category: '探索' },
    { id: 'midnight', name: '午夜派对', desc: '晚上23:55后完成打卡', rarity: 'legendary', category: '探索' },
    { id: 'collector', name: '主题收藏家', desc: '体验过所有颜色主题', rarity: 'rare', category: '探索' },
    { id: 'archaeologist', name: '考古学家', desc: '在寒假第一天完成打卡', rarity: 'rare', category: '探索' },
    { id: 'deadline_master', name: '压线大师', desc: '截止前5分钟内完成任务触发转盘', rarity: 'legendary', category: '探索' },
    { id: 'gemini', name: '双子星', desc: '两人同日解锁同个高级徽章', rarity: 'epic', category: '探索' },
    { id: 'indecisive', name: '选择困难症', desc: '打开主题切换面板但未更换', rarity: 'common', category: '探索' },
    // --- 奥数思维天梯系列 (Math Olympiad) ---
    { id: 'mo_1_1', name: '思维小火花', desc: '完成奥数第1学期：黑暗中擦亮第一根火柴，发现数学之趣。', rarity: 'rare', category: '精通' },
    { id: 'mo_1_2', name: '数趣探索者', desc: '完成奥数第2学期：在数字海洋捡拾贝壳，难题皆是惊喜。', rarity: 'rare', category: '精通' },
    { id: 'mo_2_1', name: '逻辑小侦探', desc: '完成奥数第3学期：像侦探一样抽丝剥茧，寻找真相。', rarity: 'rare', category: '精通' },
    { id: 'mo_2_2', name: '巧算小能手', desc: '完成奥数第4学期：掌握数字跳舞的规律，计算变成魔法。', rarity: 'rare', category: '精通' },
    { id: 'mo_3_1', name: '图形构造师', desc: '完成奥数第5学期：线条与面积有了生命，几何大门敞开。', rarity: 'epic', category: '精通' },
    { id: 'mo_3_2', name: '迷宫领航员', desc: '完成奥数第6学期：在逻辑迷宫中，总能找到唯一路径。', rarity: 'epic', category: '精通' },
    { id: 'mo_4_1', name: '数论潜行者', desc: '完成奥数第7学期：听懂质数与合数之间隐秘的窃窃私语。', rarity: 'epic', category: '精通' },
    { id: 'mo_4_2', name: '破壁先锋', desc: '完成奥数第8学期：面对拦路虎，一次次撞破思维的墙壁。', rarity: 'epic', category: '精通' },
    { id: 'mo_5_1', name: '奥赛精英', desc: '完成奥数第9学期：从学习者蜕变为竞争者，崭露头角。', rarity: 'legendary', category: '精通' },
    { id: 'mo_5_2', name: '解题大宗师', desc: '完成奥数第10学期：透过现象看本质已成为你的本能。', rarity: 'legendary', category: '精通' },
    { id: 'mo_6_1', name: '数理智者', desc: '完成奥数第11学期：不再只是解题，而是欣赏逻辑的优美。', rarity: 'legendary', category: '精通' },
    { id: 'mo_6_2', name: '奥数之冠', desc: '完成奥数第12学期：站在小学奥数顶峰，这是真理之海的起点。', rarity: 'legendary', category: '精通' },
    // --- 校内数学天梯系列 (School Math) ---
    { id: 'sm_1_1', name: '数字小精灵', desc: '认识了20以内的数字，学会了基础的加减法，数字在指尖像小精灵一样跳跃！', rarity: 'rare', category: '精通' },
    { id: 'sm_1_2', name: '百数探索者', desc: '算力突破了100的大关！还认识了人民币和各种图形，数学开始走进日常生活。', rarity: 'rare', category: '精通' },
    { id: 'sm_2_1', name: '乘法口诀小达人', desc: '"九九乘法表"倒背如流！掌握了连加的快捷方式，计算速度实现了质的飞跃。', rarity: 'rare', category: '精通' },
    { id: 'sm_2_2', name: '万数测量员', desc: '认识了万以内的数，学会了有余数的除法，还掌握了克与千克的秘密，已经是测量小能手了。', rarity: 'rare', category: '精通' },
    { id: 'sm_3_1', name: '周长小裁缝', desc: '掌握了多位数乘除法，认识了"分数"。学会了计算周长，能量出图形的"花边"有多长。', rarity: 'epic', category: '精通' },
    { id: 'sm_3_2', name: '面积规划师', desc: '从线跨越到面，学会了计算面积，还结识了新朋友"小数"，并弄懂了年月日的运转规律。', rarity: 'epic', category: '精通' },
    { id: 'sm_4_1', name: '大数掌管者', desc: '突破了亿级别的大数！认识了线与角，掌握了三位数乘两位数的硬核计算，数字帝国向你敞开。', rarity: 'epic', category: '精通' },
    { id: 'sm_4_2', name: '定律魔术师', desc: '掌握了结合、交换、分配律等魔法，复杂的计算变得巧妙又简单，还深入了解了三角形的奥秘。', rarity: 'epic', category: '精通' },
    { id: 'sm_5_1', name: '方程解密者', desc: '引入了字母"x"，学会了用方程的思维去逆向破解难题，多边形的面积也难不倒你。', rarity: 'legendary', category: '精通' },
    { id: 'sm_5_2', name: '立体空间师', desc: '思维从平面升级到立体空间！掌握了长方体和正方体的表面积与体积，深入研究了分数加减法。', rarity: 'legendary', category: '精通' },
    { id: 'sm_6_1', name: '圆之几何家', desc: '探究了完美的图形"圆"，计算它的周长与面积；精通了分数乘除和百分数，应用能力登峰造极。', rarity: 'legendary', category: '精通' },
    { id: 'sm_6_2', name: '小学数理学士', desc: '掌握了圆柱与圆锥，理解了正反比例。拥有了极其严密的逻辑大脑，随时准备迎接初中的挑战！', rarity: 'legendary', category: '精通' },
    // --- 校内语文天梯系列 (School Chinese) ---
    { id: 'cn_1_1', name: '拼音破壳', desc: '攻克了拼音大关，学会了基本的偏旁部首，你正式推开了小学语文世界的大门！', rarity: 'rare', category: '精通' },
    { id: 'cn_1_2', name: '识字小达人', desc: '识字量突飞猛进，不再只依赖拼音，已经能独立阅读简单的绘本和小故事了。', rarity: 'rare', category: '精通' },
    { id: 'cn_2_1', name: '朗读小百灵', desc: '课文读得越来越流利、有感情了，还能用学过的词语造出完整、生动的句子。', rarity: 'rare', category: '精通' },
    { id: 'cn_2_2', name: '看图写话小能手', desc: '观察图片、发挥想象，你已经能把看到的画面变成一段通顺连贯的文字了。', rarity: 'rare', category: '精通' },
    { id: 'cn_3_1', name: '习作初体验', desc: '告别了看图写话，迎来了真正的"作文"。笔下开始记录真实的见闻和感受。', rarity: 'epic', category: '精通' },
    { id: 'cn_3_2', name: '阅读小探险家', desc: '学会了带着问题去阅读，能够概括段落大意，理解文章背后的简单道理。', rarity: 'epic', category: '精通' },
    { id: 'cn_4_1', name: '神话与童话', desc: '畅游了神话与童话的世界，不仅感受了奇妙的想象，还能复述精彩的故事情节。', rarity: 'epic', category: '精通' },
    { id: 'cn_4_2', name: '游记小向导', desc: '按照游览顺序写景、体会文章表达的思想感情，阅读和写作技巧都变得更加丰富了。', rarity: 'epic', category: '精通' },
    { id: 'cn_5_1', name: '文言文初探', desc: '第一次正式接触小古文，克服了畏难情绪，懂得了借助注释理解文意，感受古汉语的凝练。', rarity: 'legendary', category: '精通' },
    { id: 'cn_5_2', name: '名著小书虫', desc: '步入古典名著的殿堂，学会了快速阅读和提取关键信息，体会了不同人物的性格特点。', rarity: 'legendary', category: '精通' },
    { id: 'cn_6_1', name: '文学小鉴赏家', desc: '阅读变得更具批判性和鉴赏力，习作也能做到条理清晰、详略得当、情感真挚。', rarity: 'legendary', category: '精通' },
    { id: 'cn_6_2', name: '小学语文学士', desc: '圆满完成了小学六年的语文修行，带上丰厚的文学行囊，向中学进发！', rarity: 'legendary', category: '精通' },
    // --- 校内科学天梯系列 (School Science) ---
    { id: 'sci_1_1', name: '自然小访客', desc: '认识了身边的植物，学会了用眼睛看、鼻子闻、手摸，你迈出了科学探究的第一步！', rarity: 'rare', category: '精通' },
    { id: 'sci_1_2', name: '万物小侦探', desc: '观察了蜗牛和金鱼，认识了水和空气的特征。你发现身边最常见的事物里藏着这么多秘密。', rarity: 'rare', category: '精通' },
    { id: 'sci_2_1', name: '材料魔术师', desc: '了解了不同的材料有不同的本领，区分了自然与人工世界，开始懂得人类如何改造生活。', rarity: 'rare', category: '精通' },
    { id: 'sci_2_2', name: '磁力小玩家', desc: '见识了磁铁"同极相斥、异极相吸"的魔法，还亲手制作了指南针，科学乐趣在指尖绽放。', rarity: 'rare', category: '精通' },
    { id: 'sci_3_1', name: '气象小播报员', desc: '了解了水的三态变化，学会了使用温度计和风向标。现在，你已经能像模像样地记录天气了！', rarity: 'epic', category: '精通' },
    { id: 'sci_3_2', name: '生命守护者', desc: '见证了蚕宝宝破茧成蝶和种子生根发芽，你深刻理解了动植物的生命周期，懂得了敬畏生命。', rarity: 'epic', category: '精通' },
    { id: 'sci_4_1', name: '电路接线员', desc: '成功点亮了小灯泡！掌握了简单电路的连接，认识了岩石和土壤，点亮了物理和地质技能树。', rarity: 'epic', category: '精通' },
    { id: 'sci_4_2', name: '生命与星辰学者', desc: '探究冷热奥秘，观察繁衍生息，目光投向浩瀚宇宙，日月星辰法则在日晷模型中清晰显现！', rarity: 'epic', category: '精通' },
    { id: 'sci_5_1', name: '光影魔术师', desc: '探究了光的传播、反射与折射，研究了地球表面变化。你像一束光，照亮了未知的科学盲区。', rarity: 'legendary', category: '精通' },
    { id: 'sci_5_2', name: '造物小工程师', desc: '了解了热的传递和船的演变，不仅做实验，还亲手设计制作了小船和保温瓶，展现卓越工程思维。', rarity: 'legendary', category: '精通' },
    { id: 'sci_6_1', name: '微观观察家', desc: '借助显微镜跨入神奇微观世界！了解了细胞和微生物，探究了地球自转与公转带来的昼夜四季。', rarity: 'legendary', category: '精通' },
    { id: 'sci_6_2', name: '少年科学家', desc: '从住房建造到宇宙探索，从遗传到能量转换。走完小学六年科学之旅，愿你永远保持好奇心！', rarity: 'legendary', category: '精通' },
    // --- 校内英语天梯系列 (School English) ---
    { id: 'eng_1_1', name: 'ABC小能手', desc: '结识了26个字母好朋友，学会了用简单的"Hello"向世界问好，英语的大门已为你敞开！', rarity: 'rare', category: '精通' },
    { id: 'eng_1_2', name: '色彩与数字小灵通', desc: 'Red, Blue, One, Two... 你不仅认识了五颜六色的单词，还能用英语数出生活中的小物件了。', rarity: 'rare', category: '精通' },
    { id: 'eng_2_1', name: '动物农场主', desc: '认识了可爱的动物、美味的食物，你开始能用简单的英语表达自己的喜好："I like..."', rarity: 'rare', category: '精通' },
    { id: 'eng_2_2', name: '拼读小魔术师', desc: '掌握了基础的自然拼读魔法，看到陌生的简单单词也能勇敢地拼读出来，语感越来越棒啦！', rarity: 'rare', category: '精通' },
    { id: 'eng_3_1', name: '校园交际花', desc: '掌握了文具、身体部位的表达，能够自信地用英语做自我介绍，开启简单的全英文对话。', rarity: 'epic', category: '精通' },
    { id: 'eng_3_2', name: '方位导航员', desc: 'In, on, under... 你学会了用英语精准定位物品的位置，还能和家人朋友聊聊不同的家庭成员。', rarity: 'epic', category: '精通' },
    { id: 'eng_4_1', name: '小小生活家', desc: '从教室到卧室，从职业到外貌。你能用更丰富的疑问句式（Who, What, Where）探索世界。', rarity: 'epic', category: '精通' },
    { id: 'eng_4_2', name: '时间管理者', desc: '认识了天气、衣物和农场，学会了用英语看时间（What time is it?），英语完全融入了日常生活。', rarity: 'epic', category: '精通' },
    { id: 'eng_5_1', name: '时态初探者', desc: '描述人物性格、日常作息和周末活动。你开始接触时态的变换，英语表达越来越精确严谨。', rarity: 'legendary', category: '精通' },
    { id: 'eng_5_2', name: '季节巡游者', desc: '探讨了四季变迁、节日的庆祝，还掌握了现在进行时。仿佛在用英语进行一场跨越季节的巡游。', rarity: 'legendary', category: '精通' },
    { id: 'eng_6_1', name: '环球小旅人', desc: '聊交通、谈论路线、分享爱好。你的英语视界不再局限于身边，而是放眼于广阔的世界！', rarity: 'legendary', category: '精通' },
    { id: 'eng_6_2', name: '英语小演说家', desc: '掌握了一般过去时，学会了描述外貌和身高的变化。带上这份自信，去向世界大声表达自己吧！', rarity: 'legendary', category: '精通' },
    // --- 宠物系列 ---
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

    // 探险寻宝
    { id: 'adv_first',         name: '初次探险',   desc: '完成第一次探险',                     rarity: 'common',    category: '宠物' },
    { id: 'adv_10',            name: '探险新手',   desc: '完成 10 次探险',                     rarity: 'common',    category: '宠物' },
    { id: 'adv_50',            name: '资深冒险家', desc: '完成 50 次探险',                     rarity: 'rare',      category: '宠物' },
    { id: 'adv_all_realms',    name: '环游世界',   desc: '完成所有 5 个领域',                  rarity: 'rare',      category: '宠物' },
    { id: 'adv_gold_1000',     name: '宝藏猎人',   desc: '探险累计获得 1000 金元宝',           rarity: 'rare',      category: '宠物' },
    { id: 'adv_xp_5000',       name: '知识行者',   desc: '探险累计获得 5000 经验值',           rarity: 'epic',      category: '宠物' },
    { id: 'adv_stars_200',     name: '星光旅人',   desc: '探险累计获得 200 星星',              rarity: 'epic',      category: '宠物' },
    { id: 'adv_god_beast',     name: '神兽之友',   desc: '触发「神兽降临」事件',               rarity: 'legendary', category: '宠物' },
    { id: 'adv_rainbow',       name: '彩虹收集者', desc: '获得所有领域最高稀有度宝物',         rarity: 'legendary', category: '宠物' },
    { id: 'adv_100',           name: '时间旅者',   desc: '完成 100 次探险',                    rarity: 'legendary', category: '宠物' },
];

// --- 课程配置 ---
AchievementSystem.CURRICULUM_CONFIG = {
    math_olympiad: {
        id: 'math_olympiad',
        name: '奥数思维天梯',
        totalSemesters: 12,
        badges: [
            'mo_1_1', 'mo_1_2', 'mo_2_1', 'mo_2_2',
            'mo_3_1', 'mo_3_2', 'mo_4_1', 'mo_4_2',
            'mo_5_1', 'mo_5_2', 'mo_6_1', 'mo_6_2'
        ],
        getSemesterName: (index) => {
            const grade = Math.floor(index / 2) + 1;
            const term = index % 2 === 0 ? '上' : '下';
            return `${grade}年级${term}学期`;
        }
    },
    school_math: {
        id: 'school_math',
        name: '校内数学天梯',
        totalSemesters: 12,
        badges: [
            'sm_1_1', 'sm_1_2', 'sm_2_1', 'sm_2_2',
            'sm_3_1', 'sm_3_2', 'sm_4_1', 'sm_4_2',
            'sm_5_1', 'sm_5_2', 'sm_6_1', 'sm_6_2'
        ],
        getSemesterName: (index) => {
            const grade = Math.floor(index / 2) + 1;
            const term = index % 2 === 0 ? '上' : '下';
            return `${grade}年级${term}学期`;
        }
    },
    school_chinese: {
        id: 'school_chinese',
        name: '校内语文天梯',
        totalSemesters: 12,
        badges: [
            'cn_1_1', 'cn_1_2', 'cn_2_1', 'cn_2_2',
            'cn_3_1', 'cn_3_2', 'cn_4_1', 'cn_4_2',
            'cn_5_1', 'cn_5_2', 'cn_6_1', 'cn_6_2'
        ],
        getSemesterName: (index) => {
            const grade = Math.floor(index / 2) + 1;
            const term = index % 2 === 0 ? '上' : '下';
            return `${grade}年级${term}学期`;
        }
    },
    school_science: {
        id: 'school_science',
        name: '校内科学天梯',
        totalSemesters: 12,
        badges: [
            'sci_1_1', 'sci_1_2', 'sci_2_1', 'sci_2_2',
            'sci_3_1', 'sci_3_2', 'sci_4_1', 'sci_4_2',
            'sci_5_1', 'sci_5_2', 'sci_6_1', 'sci_6_2'
        ],
        getSemesterName: (index) => {
            const grade = Math.floor(index / 2) + 1;
            const term = index % 2 === 0 ? '上' : '下';
            return `${grade}年级${term}学期`;
        }
    },
    school_english: {
        id: 'school_english',
        name: '校内英语天梯',
        totalSemesters: 12,
        badges: [
            'eng_1_1', 'eng_1_2', 'eng_2_1', 'eng_2_2',
            'eng_3_1', 'eng_3_2', 'eng_4_1', 'eng_4_2',
            'eng_5_1', 'eng_5_2', 'eng_6_1', 'eng_6_2'
        ],
        getSemesterName: (index) => {
            const grade = Math.floor(index / 2) + 1;
            const term = index % 2 === 0 ? '上' : '下';
            return `${grade}年级${term}学期`;
        }
    }
};

// --- 稀有度配色 ---
AchievementSystem.RARITY_COLORS = {
    common: { bg: 'bg-amber-700', text: 'text-amber-700', name: '普通', badge: 'bg-amber-100 text-amber-700' },
    rare: { bg: 'bg-slate-500', text: 'text-slate-600', name: '稀有', badge: 'bg-slate-100 text-slate-600' },
    epic: { bg: 'bg-yellow-500', text: 'text-yellow-600', name: '史诗', badge: 'bg-yellow-100 text-yellow-700' },
    legendary: { bg: 'bg-purple-600', text: 'text-purple-600', name: '传说', badge: 'bg-purple-100 text-purple-700' }
};

// UI 组件（AchievementWallModal, AchievementNotification）定义在 index.html 中，
// 因为它们包含 JSX 语法，需要 Babel 转译。

// ============================================================
// 辅助函数
// ============================================================

AchievementSystem.getLocalDateKey = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

AchievementSystem.getLevelInfo = (xp, levels) => {
    for (let i = levels.length - 1; i >= 0; i--) {
        if (xp >= levels[i].xp) return levels[i];
    }
    return levels[0];
};

// ============================================================
// 成就检查引擎（纯计算版）
// ============================================================
// 参数：
//   triggerType — 触发类型 ('checkin', 'spend', 'theme', ...)
//   context     — 本次触发的上下文 { isDeadlineClose, checkinTime, ... }
//   data        — 全量状态快照 { activeChild, achievements, checkins, ... }
// 返回：
//   { newBadges, milestones, unlockQueue, hasNew }

AchievementSystem.checkAchievements = (triggerType, context, data) => {
    const {
        activeChild, achievements: allAchievements, checkins, wheelHistory,
        tasks, stats, totalGold, exemptedDays, profiles, globalDates,
        curriculumProgress, currentXP, levels, colorPalettes,
        ownedPets, petData, petStats,
        petAdventureStats, petAdventureLog
    } = data;

    const BADGES = AchievementSystem.BADGES;
    const CURRICULUM_CONFIG = AchievementSystem.CURRICULUM_CONFIG;
    const getLocalDateKey = AchievementSystem.getLocalDateKey;
    const getLevelInfo = AchievementSystem.getLevelInfo;

    const currentAchievements = allAchievements[activeChild] || {};
    const newUnlocked = [];
    const queue = [];

    // 辅助：智能识别任务学科
    const getTaskSubject = (taskName) => {
        if (!taskName) return 'other';
        const name = taskName.toLowerCase();
        if (/数|算|逻辑|奥|培优|思维/.test(name)) return 'math';
        if (/英|单词|词|译|听力|口语|raz|en|english/.test(name)) return 'english';
        if (/科|实验|物理|化|生|地|程|机器|百科|stem/.test(name)) return 'science';
        if (/语|文|读|背|写字|古诗|练字/.test(name)) return 'chinese';
        if (/琵琶|琴|画|音|棋|书|舞|美/.test(name)) return 'art';
        return 'other';
    };

    const today = getLocalDateKey(0);
    const history = wheelHistory;
    const currentCheckins = checkins;
    const childCheckins = currentCheckins[activeChild] || {};

    let totalCheckinCount = 0;
    let subjectCounts = { math: 0, chinese: 0, english: 0, science: 0, art: 0 };
    let consecutiveDays = 0;
    let maxGapDays = 0;

    const sortedDates = [];
    Object.entries(childCheckins).forEach(([taskId, dates]) => {
        const count = Object.keys(dates).length;
        totalCheckinCount += count;
        const taskName = (tasks[activeChild]?.find(t => t.id === taskId)?.name) || '';
        const subject = getTaskSubject(taskName);
        if (subjectCounts[subject] !== undefined) subjectCounts[subject] += count;
        Object.keys(dates).forEach(d => sortedDates.push(d));
    });

    const childExemptions = exemptedDays[activeChild] || [];
    childExemptions.forEach(d => sortedDates.push(d));

    const uniqueDates = [...new Set(sortedDates)].sort();
    if (uniqueDates.length > 0) {
        let streak = 0;
        let tempStreak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
            const d1 = new Date(uniqueDates[i-1]);
            const d2 = new Date(uniqueDates[i]);
            const diffDays = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                tempStreak++;
            } else {
                if (diffDays > maxGapDays) maxGapDays = diffDays;
                streak = Math.max(streak, tempStreak);
                tempStreak = 1;
            }
        }
        consecutiveDays = Math.max(streak, tempStreak);
    }

    const tryUnlock = (badgeId) => {
        if (!currentAchievements[badgeId] && !newUnlocked.includes(badgeId)) {
            const badgeInfo = BADGES.find(b => b.id === badgeId);
            if (badgeInfo) {
                newUnlocked.push(badgeId);
                queue.push({ id: badgeId, ...badgeInfo });
            }
        }
    };

    // ==================== 1. 毅力类 ====================
    if (totalCheckinCount >= 1) tryUnlock('first_blood');
    if (totalCheckinCount >= 10) tryUnlock('perfect_10');
    if (totalCheckinCount >= 100) tryUnlock('steeled');
    if (totalCheckinCount >= 300) tryUnlock('accumulation');

    if (consecutiveDays >= 7) tryUnlock('persistence');
    if (consecutiveDays >= 14) tryUnlock('iron_will');
    if (consecutiveDays >= 25) tryUnlock('marathon');

    const activeWeekendStreak = context.currentWeekendStreak || (stats[activeChild]?.weekendStreak) || 0;
    if (activeWeekendStreak >= 2) tryUnlock('weekend_warrior');

    if (maxGapDays > 3 && triggerType === 'checkin') tryUnlock('return_king');

    const earlyStreak = stats[activeChild]?.earlyBirdStreak ?? 0;
    if (context.currentEarlyStreak >= 3 || earlyStreak >= 3) tryUnlock('early_bird');

    if (triggerType === 'checkin') {
        const t = context.checkinTime;
        if (t) {
            const h = t.getHours(), m = t.getMinutes();
            if (h < 7) tryUnlock('dawn_knight');
            if (h === 23 && m >= 55) tryUnlock('midnight');
        }
        if ((stats[activeChild]?.early_bird_count ?? 0) >= 1) tryUnlock('dawn_knight');
    }
    if ((stats[activeChild]?.repair_count || 0) >= 5) tryUnlock('repair_master');

    // ==================== 2. 精通类 ====================
    if (subjectCounts.chinese >= 20) tryUnlock('chinese_master');
    if (subjectCounts.chinese >= 50) tryUnlock('literary_giant');
    if (subjectCounts.chinese >= 100) tryUnlock('literary_grandmaster');

    if (subjectCounts.math >= 20) tryUnlock('math_whiz');
    if (subjectCounts.math >= 50) tryUnlock('logic_master');
    if (subjectCounts.math >= 100) tryUnlock('math_god');

    if (subjectCounts.english >= 20) tryUnlock('english_ace');
    if (subjectCounts.english >= 50) tryUnlock('translation_master');
    if (subjectCounts.english >= 100) tryUnlock('language_lord');

    if (subjectCounts.science >= 20) tryUnlock('science_star');
    if (subjectCounts.science >= 50) tryUnlock('future_inventor');
    if (subjectCounts.science >= 100) tryUnlock('science_titan');

    if (subjectCounts.art >= 20) tryUnlock('artist');

    if (subjectCounts.chinese >= 50 && subjectCounts.math >= 50 && subjectCounts.english >= 50) {
        tryUnlock('polymath');
    }

    let todayTaskCount = 0;
    Object.values(childCheckins).forEach(dates => {
        if (dates[today]) todayTaskCount++;
    });
    if (todayTaskCount >= 10) tryUnlock('six_arms');

    const activeDailyTasks = (tasks[activeChild] || []).filter(t =>
        (!t.startDate || today >= t.startDate) &&
        (!t.deadline || today <= t.deadline)
    );
    if (activeDailyTasks.length > 0 && activeDailyTasks.every(t => childCheckins[t.id]?.[today])) {
        tryUnlock('daily_done');
    }

    if (triggerType === 'checkin') {
        const recent7Days = [];
        for (let i = 0; i < 7; i++) recent7Days.push(getLocalDateKey(-i));
        let taskCounts7Days = {};
        Object.entries(childCheckins).forEach(([tid, dates]) => {
            let c = 0;
            recent7Days.forEach(d => { if (dates[d]) c++; });
            if (c >= 5) taskCounts7Days[tid] = c;
        });
        if (Object.keys(taskCounts7Days).length >= 3) tryUnlock('all_rounder');
    }

    const myTasks = tasks[activeChild] || [];
    myTasks.forEach(t => {
        const freq = t.frequencyType || 'count';
        if (freq === 'daily_must' || freq === 'weekly_optional') return;
        const record = childCheckins[t.id] || {};
        const count = Object.keys(record).length;
        const tc = t.targetCount || 0;
        if (tc <= 0) return;
        if (count >= tc) {
            tryUnlock('accomplished');
            if (t.deadline) {
                const finishDateStr = Object.keys(record).sort()[tc - 1];
                if (finishDateStr) {
                    const dead = new Date(t.deadline);
                    const fin = new Date(finishDateStr);
                    const diffTime = dead - fin;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays >= 3) tryUnlock('lightning');
                }
            }
        }
    });

    // ==================== 3. 财富类 ====================
    if (totalGold >= 100) tryUnlock('first_pot');
    if (totalGold >= 1000) tryUnlock('tycoon');
    if (totalGold >= 5000) tryUnlock('wealthy');
    if (totalGold >= 2000) tryUnlock('midas_touch');

    if (!currentAchievements['overnight_rich']) {
        const childStats = stats[activeChild] || {};
        let maxDailyGold = 0;
        for (let i = 0; i < 7; i++) {
            const dateKey = getLocalDateKey(-i);
            const dailyGold = childStats[`daily_gold_${dateKey}`] || 0;
            if (dailyGold > maxDailyGold) maxDailyGold = dailyGold;
        }
        if (maxDailyGold >= 100) tryUnlock('overnight_rich');
    }

    let totalSpent = 0;
    let spendCount = 0;
    let maxSingleSpend = 0;

    Object.keys(history).forEach(key => {
        if (key.startsWith(`${activeChild}-`) && history[key] < 0) {
            const amount = Math.abs(history[key]);
            totalSpent += amount;
            spendCount++;
            if (amount > maxSingleSpend) maxSingleSpend = amount;
        }
    });

    if (totalSpent >= 500 && !currentAchievements['big_spender']) tryUnlock('big_spender');
    if (totalSpent >= 2000 && !currentAchievements['money_bags']) tryUnlock('money_bags');
    if (totalSpent >= 5000 && !currentAchievements['whale_player']) tryUnlock('whale_player');
    if (totalSpent >= 10000 && !currentAchievements['market_owner']) tryUnlock('market_owner');

    if (spendCount >= 10 && !currentAchievements['shopaholic']) tryUnlock('shopaholic');
    if (spendCount >= 50 && !currentAchievements['hand_chopper']) tryUnlock('hand_chopper');
    if (spendCount >= 100 && !currentAchievements['cart_clearer']) tryUnlock('cart_clearer');

    if (maxSingleSpend >= 100 && !currentAchievements['high_roller']) tryUnlock('high_roller');
    if (maxSingleSpend >= 300 && !currentAchievements['diamond_hands']) tryUnlock('diamond_hands');
    if (maxSingleSpend >= 800 && !currentAchievements['bankruptcy']) tryUnlock('bankruptcy');

    if (triggerType === 'lucky_spin') tryUnlock('lucky_star');

    let extraInvestIncome = 0;
    Object.keys(history).forEach(key => {
        if (key.startsWith(`${activeChild}-TASK-`)) {
            const parts = key.split('-');
            const taskId = parts[2];
            const task = myTasks.find(t => t.id === taskId);
            const amount = history[key];
            if (task && amount > task.reward) {
                extraInvestIncome += (amount - task.reward);
            }
        }
    });
    if (extraInvestIncome >= 500) tryUnlock('investment_guru');

    // ==================== 4. 探索类 ====================
    if (triggerType === 'open_settings') tryUnlock('curious');
    if (triggerType === 'checkin' && context.isDeadlineClose) tryUnlock('deadline_master');

    if (triggerType === 'theme') {
        const currentStats = stats[activeChild] || {};
        const usedThemes = currentStats.usedThemes || [];
        if (usedThemes.length >= Object.keys(colorPalettes).length) {
            tryUnlock('collector');
        }
    }

    newUnlocked.forEach(badgeId => {
        const badge = BADGES.find(b => b.id === badgeId);
        if (badge && (badge.rarity === 'epic' || badge.rarity === 'legendary')) {
            profiles.forEach(p => {
                if (p.name !== activeChild) {
                    const otherAch = allAchievements[p.name] || {};
                    if (otherAch[badgeId] === today) {
                        tryUnlock('gemini');
                    }
                }
            });
        }
    });

    if (globalDates?.start) {
        const startStr = globalDates.start;
        let hasFirstDay = false;
        Object.values(childCheckins).forEach(rec => {
            if (rec[startStr]) hasFirstDay = true;
        });
        if (hasFirstDay) tryUnlock('archaeologist');
    }

    if (triggerType === 'theme_close_no_change') tryUnlock('indecisive');

    // ==================== 学业目标类 ====================
    const childProgress = curriculumProgress?.[activeChild] || {};

    Object.values(CURRICULUM_CONFIG).forEach(subject => {
        const completedIndex = childProgress[subject.id] !== undefined ? childProgress[subject.id] : -1;
        subject.badges.forEach((badgeId, index) => {
            if (completedIndex >= index) tryUnlock(badgeId);
        });
    });

    // ==================== 5. 荣耀类 ====================
    const currentIds = Object.keys(currentAchievements);
    const totalBadges = currentIds.length + newUnlocked.length;
    const allUnlockedIds = [...currentIds, ...newUnlocked];
    const countRarity = (rarity) => allUnlockedIds.filter(id => BADGES.find(b => b.id === id)?.rarity === rarity).length;

    if (totalBadges >= 5) tryUnlock('bronze_collector');
    if (countRarity('rare') >= 5) tryUnlock('silver_master');
    if (countRarity('epic') >= 5) tryUnlock('golden_legend');

    const persevBadges = BADGES.filter(b => b.category === '毅力').map(b => b.id);
    const hasAllPersev = persevBadges.length > 0 && persevBadges.every(id => allUnlockedIds.includes(id));
    if (hasAllPersev) tryUnlock('perseverance_incarnate');

    const masteryBadges = BADGES.filter(b => b.category === '精通').map(b => b.id);
    const hasAllMastery = masteryBadges.length > 0 && masteryBadges.every(id => allUnlockedIds.includes(id));
    if (hasAllMastery) tryUnlock('grandmaster');

    // ==================== 6. 纪元与等级类 ====================
    const curLevelInfo = getLevelInfo(currentXP, levels);
    if (curLevelInfo.era === '魏晋隋唐·融合与登科') tryUnlock('era_pioneer');

    // ==================== 7. 宠物类 ====================
    if (typeof PET_CATALOG !== 'undefined') {
        const petCatalog = PET_CATALOG;
        const myOwned = ownedPets?.[activeChild] || [];
        const petStatsData = petStats?.[activeChild] || {};
        const childPetData = petData?.[activeChild] || {};

        const getGrowthStageLocal = (catalogEntry, interactionCount) => {
            if (!catalogEntry?.growthStages) return { level: 1, name: '初相识', threshold: 0, size: 'w-20 h-20' };
            let current = catalogEntry.growthStages[0];
            for (const stage of catalogEntry.growthStages) {
                if (interactionCount >= stage.threshold) current = stage;
                else break;
            }
            return current;
        };

        const maxBondLevel = myOwned.reduce((max, id) => {
            const pet = childPetData[id];
            const cat = petCatalog.find(p => p.id === id);
            if (!pet || !cat) return max;
            return Math.max(max, getGrowthStageLocal(cat, pet.interactionCount).level);
        }, 0);

        const bond3Count = myOwned.filter(id => {
            const pet = childPetData[id];
            const cat = petCatalog.find(p => p.id === id);
            return pet && cat && getGrowthStageLocal(cat, pet.interactionCount).level >= 3;
        }).length;

        const hasLegendary = myOwned.some(id => {
            const cat = petCatalog.find(p => p.id === id);
            return cat && cat.rarity === 'legendary';
        });

        if (triggerType === 'pet_adopt' || triggerType === 'pet_feed' || triggerType === 'pet_bath' || triggerType === 'pet_play' || triggerType === 'pet_sleep' || triggerType === 'pet_rename') {
            if (myOwned.length >= 1) tryUnlock('pet_first');
            if (myOwned.length >= 3) tryUnlock('pet_collector_3');
            if (myOwned.length >= petCatalog.length) tryUnlock('pet_collector_all');
            if (maxBondLevel >= 4) tryUnlock('pet_max_bond');
            if (maxBondLevel >= 5) tryUnlock('pet_max_bond_5');
            if (bond3Count >= 5) tryUnlock('pet_all_5');
            if (hasLegendary) tryUnlock('pet_legendary');
            if (triggerType === 'pet_rename') tryUnlock('pet_rename');
        }
        if ((petStatsData.feedCount || 0) >= 100) tryUnlock('pet_feed_100');
        if ((petStatsData.bathCount || 0) >= 50) tryUnlock('pet_bath_50');
    }

    // ==================== 探险类 ====================
    if (petAdventureStats || petAdventureLog) {
        const advStats = (petAdventureStats || {})[activeChild] || {};
        const advLog = (petAdventureLog || {})[activeChild] || [];
        const totalAdventures = advStats.totalAdventures || 0;
        const totalGoldEarned = advStats.totalGoldEarned || 0;
        const totalXPEarned = advStats.totalXPEarned || 0;
        const totalStarsEarned = advStats.totalStarsEarned || 0;

        // 完成次数
        if (totalAdventures >= 1) tryUnlock('adv_first');
        if (totalAdventures >= 10) tryUnlock('adv_10');
        if (totalAdventures >= 50) tryUnlock('adv_50');
        if (totalAdventures >= 100) tryUnlock('adv_100');

        // 累计收益
        if (totalGoldEarned >= 1000) tryUnlock('adv_gold_1000');
        if (totalXPEarned >= 5000) tryUnlock('adv_xp_5000');
        if (totalStarsEarned >= 200) tryUnlock('adv_stars_200');

        // 完成所有领域
        const realmsVisited = new Set();
        advLog.forEach(entry => realmsVisited.add(entry.realmId));
        ['forest', 'creek', 'ruins', 'rift', 'cosmos'].forEach(r => {
            if (advStats[`${r}Count`] > 0) realmsVisited.add(r);
        });
        if (realmsVisited.size >= 5) tryUnlock('adv_all_realms');

        // 神兽降临事件
        const hasGodBeast = advLog.some(entry => entry.event && entry.event.name === '神兽降临');
        if (hasGodBeast) tryUnlock('adv_god_beast');

        // 彩虹收集者（每个领域都有日志记录）
        if (realmsVisited.size >= 5 && totalAdventures >= 5) tryUnlock('adv_rainbow');
    }

    // ==================== 构建返回值 ====================
    const result = {
        newBadges: {},
        milestones: [],
        unlockQueue: queue,
        hasNew: newUnlocked.length > 0,
    };

    if (newUnlocked.length > 0) {
        newUnlocked.forEach(id => {
            result.newBadges[id] = today;
        });

        result.milestones = newUnlocked.map(badgeId => {
            const b = BADGES.find(i => i.id === badgeId);
            return {
                id: `achieve-${badgeId}-${Date.now()}`,
                type: 'achievement',
                date: today,
                timestamp: Date.now(),
                member: activeChild,
                title: `解锁成就：${b ? b.name : badgeId}`,
                description: b ? b.desc : '',
                icon: '🏆'
            };
        });
    }

    return result;
};
