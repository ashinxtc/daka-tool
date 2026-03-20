// 历史事件数据 - 外部事件文件
// 由 CSV 转换工具生成，最后更新: 2026-03-12
// 共 840 条历史事件（10 个纪元）
// 格式说明：
//   type: 'history' - 历史类事件（按顺序触发，每天2个，不重复）
//   minLevelName: '萌芽之识' 表示全等级可触发（对应 CSV 中的"全等级"）
//   rewards: [{ type: 'xp'|'gold', value: <正数或负数> }]

const HISTORICAL_EVENTS = [

    // ===== 第一纪元：远古之路（共 28 条）=====
    {
        id: 'hist_001', type: 'history', era: '远古之路',
        title: '元谋人使用天然火', time: '距今约 170 万年前（旧石器时代早期）',
        minLevelName: '萌芽之识',
        desc: '你从雷击的枯木中取得了珍贵的火种，并小心翼翼地将其保存在山洞中，人类从此告别了茹毛饮血。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_002', type: 'history', era: '远古之路',
        title: '蓝田人粗制石器', time: '距今约 110 万 - 70 万年前',
        minLevelName: '萌芽之识',
        desc: '你用砾石互相敲击，打制出了一块边缘锋利的刮削器，用来切割野兽的皮肉变得轻松多了。',
        rewards: [{type: 'xp', value: 20}]
    },
    {
        id: 'hist_003', type: 'history', era: '远古之路',
        title: '北京人打制石器', time: '距今约 70 万 - 20 万年前',
        minLevelName: '萌芽之识',
        desc: '你熟练地运用砸击法和碰砧法，制作出了尖状器和砍砸器，这代表了旧石器时代早期的巅峰技术。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_004', type: 'history', era: '远古之路',
        title: '北京人群居生活', time: '距今约 70 万 - 20 万年前',
        minLevelName: '萌芽之识',
        desc: '面对险恶的自然环境和猛兽，你与几十个族人共同生存在一个大山洞里，共享食物，抵御外敌。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_005', type: 'history', era: '远古之路',
        title: '原始语言的产生', time: '距今约 200 万 - 10 万年前（旧石器时代中早期）',
        minLevelName: '萌芽之识',
        desc: '在集体围猎时，你发出特定的音节来指挥同伴，这简单的音节成为了人类早期语言的萌芽。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_006', type: 'history', era: '远古之路',
        title: '走出非洲的远征', time: '距今约 10 万 - 6 万年前（旧石器时代中期）',
        minLevelName: '萌芽之识',
        desc: '气候变迁迫使族群向未知的北方和东方迁徙，你们跨越了漫长的陆地桥，看到了全新的地貌与物种。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_007', type: 'history', era: '远古之路',
        title: '许家窑人飞石索', time: '距今约 10 万年前',
        minLevelName: '萌芽之识',
        desc: '你将石球绑在兽皮条上做成飞石索，用力甩出，成功击晕了一只奔跑的野马。',
        rewards: [{type: 'gold', value: 20}]
    },
    {
        id: 'hist_008', type: 'history', era: '远古之路',
        title: '骨角器的加工', time: '距今约 10 万 - 3 万年前',
        minLevelName: '萌芽之识',
        desc: '你发现相比于石头，动物的骨头和鹿角更有韧性。你将其打磨成带有倒刺的鱼叉，部落在浅滩的捕鱼量翻了一倍！',
        rewards: [{type: 'gold', value: 20}]
    },
    {
        id: 'hist_009', type: 'history', era: '远古之路',
        title: '山顶洞人人工取火', time: '距今约 3 万年前（旧石器时代晚期）',
        minLevelName: '萌芽之识',
        desc: '你学会了用坚硬的燧石互相敲击，或者钻木取火。人类终于彻底摆脱了对天然火的依赖，征服了黑夜！',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_010', type: 'history', era: '远古之路',
        title: '山顶洞人的葬礼', time: '距今约 3 万年前',
        minLevelName: '萌芽之识',
        desc: '一位受人尊敬的长者去世了，你们在尸体旁撒上红色的赤铁矿粉，并随葬了石器。这是你们首次对“死后世界”产生思考。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_011', type: 'history', era: '远古之路',
        title: '钻孔技术的突破', time: '距今约 3 万年前',
        minLevelName: '萌芽之识',
        desc: '你发明了用弓弦带动尖锐石钻的方法，成功在兽牙和贝壳上打出了规整的圆孔。族人们戴上了美丽的项链。',
        rewards: [{type: 'gold', value: 15}]
    },
    {
        id: 'hist_012', type: 'history', era: '远古之路',
        title: '骨针与御寒', time: '距今约 3 万年前',
        minLevelName: '萌芽之识',
        desc: '族里的智者用兽骨打磨出了带孔的细针，你们终于可以将兽皮缝制成紧身的衣物，再也不惧暴风雪了。',
        rewards: [{type: 'gold', value: 15}]
    },
    {
        id: 'hist_013', type: 'history', era: '远古之路',
        title: '细石器工艺', time: '距今约 2 万 - 1 万年前',
        minLevelName: '萌芽之识',
        desc: '你用压剥法制作出了极其细小锋利的石叶，镶嵌在木柄或骨柄上，做成了杀伤力极强的复合武器。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_014', type: 'history', era: '远古之路',
        title: '冰河世纪降临', time: '距今约 2 万年前（末次冰盛期）',
        minLevelName: '萌芽之识',
        desc: '全球气温骤降，漫长的冰期到来。你和族人被困在洞穴中，食物极度匮乏，生存面临巨大挑战。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_015', type: 'history', era: '远古之路',
        title: '弓箭的发明', time: '距今约 2 万 - 1 万年前',
        minLevelName: '萌芽之识',
        desc: '利用树枝的弹性和兽筋，你制作出了能在远处悄无声息击杀猎物的武器。部落的狩猎效率大幅提升！',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_016', type: 'history', era: '远古之路',
        title: '结网捕鱼', time: '距今约 1.5 万 - 1 万年前（旧石器末期至新石器早期）',
        minLevelName: '萌芽之识',
        desc: '你用植物纤维搓成绳索，编织成了一张大网。在河边撒网，一次就捕获了十几条肥鱼！',
        rewards: [{type: 'gold', value: 20}]
    },
    {
        id: 'hist_017', type: 'history', era: '远古之路',
        title: '驯化野狼', time: '距今约 1.5 万年前',
        minLevelName: '萌芽之识',
        desc: '你尝试将吃剩的骨头喂给营地边缘的几只温顺野狼。几代之后，它们成为了帮助你们狩猎和警戒的最好伙伴。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_018', type: 'history', era: '远古之路',
        title: '冰川融化', time: '距今约 1.2 万年前（全新世开始）',
        minLevelName: '萌芽之识',
        desc: '气候逐渐回暖，冰川退却，万物复苏。大量的森林和湖泊出现，采集和捕鱼变得前所未有地容易。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_019', type: 'history', era: '远古之路',
        title: '氏族公有制', time: '距今约 1 万年前',
        minLevelName: '萌芽之识',
        desc: '打猎归来，首领将所有猎物平均分给每一位族人。在这个时代，没有私有财产，大家同甘共苦。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_020', type: 'history', era: '远古之路',
        title: '母系氏族的确立', time: '距今约 1 万年前（新石器时代早期）',
        minLevelName: '萌芽之识',
        desc: '女性在采集食物和抚育后代中起到了决定性作用。你所在的氏族以母亲的血缘为纽带，尊奉女性首领。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_021', type: 'history', era: '远古之路',
        title: '巨兽的黄昏', time: '距今约 1 万年前',
        minLevelName: '萌芽之识',
        desc: '猛犸象和剑齿虎的数量越来越少，大型猎物变得极度罕见。部落不得不改变狩猎策略，面临短暂的饥荒。',
        rewards: [{type: 'gold', value: -10}]
    },
    {
        id: 'hist_022', type: 'history', era: '远古之路',
        title: '刀耕火种', time: '距今约 1 万年前',
        minLevelName: '萌芽之识',
        desc: '为了让植物长得更好，你放火烧掉了一片灌木丛，用草木灰作为肥料，撒下了第一把种子。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_023', type: 'history', era: '远古之路',
        title: '磨制石器革命', time: '距今约 1 万年前',
        minLevelName: '萌芽之识',
        desc: '你把打制好的石斧放在砺石上沾水反复摩擦，直到它变得平整光滑。新石器时代的大门被你推开了！',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_024', type: 'history', era: '远古之路',
        title: '最早的粗陶器', time: '距今约 1 万年前',
        minLevelName: '萌芽之识',
        desc: '为了烧水和煮熟食物，你在泥巴中掺入砂子捏成罐子，放入火中焙烧。虽然粗糙，但这是最早的夹砂陶器。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_025', type: 'history', era: '远古之路',
        title: '狗尾草的秘密', time: '距今约 1 万年前（北方粟农业起源）',
        minLevelName: '萌芽之识',
        desc: '你注意到某些饱满的野生狗尾草种子掉落在地后，第二年能长出一大片。你开始尝试有意识地在营地旁播撒它们。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_026', type: 'history', era: '远古之路',
        title: '驯化水稻', time: '距今约 1 万年前（长江流域稻作起源）',
        minLevelName: '萌芽之识',
        desc: '在长江流域的沼泽地旁，你们成功收获了第一批人工种植的野生稻。部落终于有了稳定的口粮。',
        rewards: [{type: 'gold', value: 20}]
    },
    {
        id: 'hist_027', type: 'history', era: '远古之路',
        title: '建立定居点', time: '距今约 1 万年前',
        minLevelName: '萌芽之识',
        desc: '因为有了稳定的农作物，你们不再四处流浪，而是用木头和茅草在河畔搭建了半地穴式的永久房屋。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_028', type: 'history', era: '远古之路',
        title: '独木舟的下水', time: '距今约 8000 年前',
        minLevelName: '萌芽之识',
        desc: '族人利用火烧和石斧，将一根粗大的树干掏空。你们乘坐这艘简陋的独木舟，第一次成功跨越了湍急的河流，探索对岸的新领地。',
        rewards: [{type: 'xp', value: 40}]
    },

    // ===== 第二纪元：文明初曙（共 39 条）=====
    {
        id: 'hist_029', type: 'history', era: '文明初曙',
        title: '贾湖骨笛', time: '约公元前 7000 - 前 5800 年（裴李岗文化时期）',
        minLevelName: '部落民',
        desc: '族人用丹顶鹤的尺骨钻孔，吹奏出了清脆悠扬的七声音阶。音乐让部落的夜晚不再单调。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_030', type: 'history', era: '文明初曙',
        title: '姜寨聚落的平等', time: '约公元前 5000 - 前 4000 年（仰韶文化早期）',
        minLevelName: '部落民',
        desc: '你生活在渭水流域的姜寨聚落，大家共同劳作，平均分配食物，村落中央的广场是大家晚上围绕篝火跳舞的地方。',
        rewards: [{type: 'xp', value: 20}]
    },
    {
        id: 'hist_031', type: 'history', era: '文明初曙',
        title: '仰韶彩陶', time: '约公元前 5000 - 前 3000 年（仰韶文化时期）',
        minLevelName: '部落民',
        desc: '你在烧制的陶盆上用天然颜料画上了生动的人面鱼纹，周围的部落纷纷拿食物来换取这种美丽的器皿。',
        rewards: [{type: 'gold', value: 20}]
    },
    {
        id: 'hist_032', type: 'history', era: '文明初曙',
        title: '红山玉龙', time: '约公元前 4000 - 前 3000 年（红山文化）',
        minLevelName: '部落民',
        desc: '你在祭祀仪式上看到了一件形似“C”字的精美玉龙，这是部落权力和图腾的象征，中华龙图腾初现端倪。',
        rewards: [{type: 'gold', value: 20}]
    },
    {
        id: 'hist_033', type: 'history', era: '文明初曙',
        title: '良渚古城与玉琮', time: '约公元前 3300 - 前 2300 年（良渚文化）',
        minLevelName: '部落民',
        desc: '你参与了规模宏大的良渚古城修筑，并在祭坛上见到了外方内圆的神圣玉琮。早期国家的阶级分化已经十分明显。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_034', type: 'history', era: '文明初曙',
        title: '大汶口私有制萌芽', time: '约公元前 3000 年（大汶口文化晚期）',
        minLevelName: '部落民',
        desc: '你在随葬品丰富的贵族墓葬旁，看到了只有几把陶罐的平民墓。你意识到，部落里开始出现贫富分化和私有财产了。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_035', type: 'history', era: '文明初曙',
        title: '夯土筑城', time: '约公元前 3000 - 前 2000 年（龙山文化时期）',
        minLevelName: '部落民',
        desc: '为了抵御外敌和野兽，首领教导大家用木板夹住泥土，再用杵层层砸实。高耸的夯土城墙拔地而起，安全感油然而生。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_036', type: 'history', era: '文明初曙',
        title: '涿鹿之战', time: '约公元前 2500 年（传说中的黄帝时期）',
        minLevelName: '部落民',
        desc: '黄帝部落与蚩尤部落在涿鹿原野展开了惨烈的厮杀，狂风大雾中，无数族人倒下。这是一场血腥但奠定华夏一统的战争。',
        rewards: [{type: 'xp', value: -30}, {type: 'gold', value: 20}]
    },
    {
        id: 'hist_037', type: 'history', era: '文明初曙',
        title: '绝地天通', time: '约公元前 2400 年（传说中的颛顼帝时期）',
        minLevelName: '部落民',
        desc: '颛顼帝下令将神权与世俗管理分开，严禁民间私自祭祀。部落的秩序变得更加森严。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_038', type: 'history', era: '文明初曙',
        title: '陶寺观象台', time: '约公元前 2300 - 前 1900 年（陶寺文化）',
        minLevelName: '部落民',
        desc: '部落里的智者通过观察观象台柱缝间的日影，准确推算出了节气。你们的农业生产再也不会错过天时了。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_039', type: 'history', era: '文明初曙',
        title: '尧舜禅让', time: '约公元前 2200 年（传说中的尧舜时期）',
        minLevelName: '部落民',
        desc: '年迈的尧帝没有将首领之位传给儿子，而是传给了品德高尚的舜。天下人都为这种无私的品格而叹服。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_040', type: 'history', era: '文明初曙',
        title: '王位世袭制代替禅让制', time: '约公元前 21 世纪（夏启时期）',
        minLevelName: '部落民',
        desc: '夏启凭借实力杀死了伯益，继承了父亲大禹的王位。从此“公天下”变成了“家天下”，中国历史进入了世袭王朝时代。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_041', type: 'history', era: '文明初曙',
        title: '甘之战', time: '约公元前 21 世纪（夏启时期）',
        minLevelName: '部落民',
        desc: '夏启在甘地讨伐不服从统治的有扈氏。战车隆隆作响，军法极其森严。你作为后勤民兵，见证了王权不可侵犯。',
        rewards: [{type: 'xp', value: 40}, {type: 'gold', value: -10}]
    },
    {
        id: 'hist_042', type: 'history', era: '文明初曙',
        title: '大禹治水与涂山之会', time: '约公元前 2070 年（夏朝建立初）',
        minLevelName: '部落民',
        desc: '大禹治水成功后在涂山召集天下诸侯，万国来朝。你远远望见大禹接授诸侯进献的贡品，夏后氏的霸权确立了。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_043', type: 'history', era: '文明初曙',
        title: '制陶作坊的分工', time: '约公元前 3000 - 前 2000 年（新石器晚期至夏代）',
        minLevelName: '部落民',
        desc: '部落的制陶作坊开始流水线作业，有人负责揉泥，有人负责踩轮盘。你买到了更薄、更坚硬的黑陶杯。',
        rewards: [{type: 'gold', value: 20}]
    },
    {
        id: 'hist_044', type: 'history', era: '文明初曙',
        title: '铜锡合金的秘密', time: '约公元前 2000 年（二里头文化时期）',
        minLevelName: '部落民',
        desc: '工匠在冶铜时意外加入了少量的锡，得到了熔点更低、硬度更高的金属。锋利的青铜兵器开始装备部落勇士。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_045', type: 'history', era: '文明初曙',
        title: '二里头宫殿', time: '约公元前 1900 - 前 1500 年（二里头文化）',
        minLevelName: '部落民',
        desc: '你被征调去修建庞大的夯土宫殿建筑群，森严的宫殿格局让你感受到了夏王至高无上的权力。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_046', type: 'history', era: '文明初曙',
        title: '少康中兴', time: '约公元前 1900 年（夏朝中期）',
        minLevelName: '部落民',
        desc: '历经太康失国、后羿代夏，流亡的少康终于联络旧部复国。夏朝挺过了最危险的内乱，社会重新安定下来。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_047', type: 'history', era: '文明初曙',
        title: '《夏小正》历法', time: '约公元前 2070 - 前 1600 年（夏朝时期）',
        minLevelName: '部落民',
        desc: '王室颁布了《夏小正》，这是我国现存最早的历法，详细记载了每个月的星象和物候。你照着历法播种，迎来了大丰收。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_048', type: 'history', era: '文明初曙',
        title: '《禹刑》的制定', time: '约公元前 2070 - 前 1600 年（夏朝时期）',
        minLevelName: '部落民',
        desc: '夏朝制定了极其严酷的刑法《禹刑》。你听说隔壁村落有人因为不孝被处以重刑，夏朝的国家机器正在运转。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_049', type: 'history', era: '文明初曙',
        title: '夏桀暴政', time: '约公元前 1600 年（夏朝末年）',
        minLevelName: '部落民',
        desc: '夏桀自比为太阳，却残暴无道，挥霍无度。百姓们纷纷诅咒“时日曷丧，予及汝皆亡”，你在重税下苦不堪言。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_050', type: 'history', era: '文明初曙',
        title: '鸣条之战', time: '约公元前 1600 年（夏桀末年 / 商汤元年）',
        minLevelName: '部落民',
        desc: '商汤起兵讨伐暴虐的夏桀，战火波及了你的村庄。你在逃难中丢失了不少财物，但终于迎来了新的安宁。',
        rewards: [{type: 'gold', value: -15}]
    },
    {
        id: 'hist_051', type: 'history', era: '文明初曙',
        title: '伊尹辅政', time: '约公元前 1600 年（商朝初年）',
        minLevelName: '部落民',
        desc: '出身奴隶的伊尹凭借高超的烹饪智慧和政治谋略，被商汤拜为右相。商朝初年政治清明，百业待兴。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_052', type: 'history', era: '文明初曙',
        title: '三星堆青铜神树', time: '约公元前 1500 - 前 1046 年（古蜀文明）',
        minLevelName: '部落民',
        desc: '在遥远的西南方，蜀地的人们铸造了近四米高的青铜神树，树上站立着神鸟。这种神秘的祭祀文化让你大开眼界。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_053', type: 'history', era: '文明初曙',
        title: '干支纪日法', time: '约公元前 1600 - 前 1046 年（商代时期）',
        minLevelName: '部落民',
        desc: '商朝人使用十天干和十二地支相搭配来记录日期，六十天为一个周期。你终于弄懂了这套历法，日子算得清清楚楚。',
        rewards: [{type: 'xp', value: 20}]
    },
    {
        id: 'hist_054', type: 'history', era: '文明初曙',
        title: '贝币的使用', time: '约公元前 1600 - 前 1046 年（商代时期）',
        minLevelName: '部落民',
        desc: '集市上开始流行使用来自遥远海滨的天然海贝作为货币。你用多余的粮食换取了一串贝币，买卖变得更方便了。',
        rewards: [{type: 'gold', value: 20}]
    },
    {
        id: 'hist_055', type: 'history', era: '文明初曙',
        title: '“商人”一词的由来', time: '约公元前 1600 - 前 1046 年（商代时期）',
        minLevelName: '部落民',
        desc: '商朝人极其善于经商买卖，赶着牛车在各个方国间做交易。久而久之，天下人都把做买卖的人称为“商人”。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_056', type: 'history', era: '文明初曙',
        title: '内外服制度', time: '约公元前 1600 - 前 1046 年（商代时期）',
        minLevelName: '部落民',
        desc: '商王直接控制内服，通过册封管理外服的方国首领。你作为方国平民，定期要把猎物上交给首领去纳贡。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_057', type: 'history', era: '文明初曙',
        title: '商朝的神权政治', time: '约公元前 1600 - 前 1046 年（商代时期）',
        minLevelName: '部落民',
        desc: '“殷人尊神，率民以事神”。商朝的每一项国家大事都要通过占卜决定。你目睹了庄严肃穆的祭祀大典，充满敬畏。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_058', type: 'history', era: '文明初曙',
        title: '人殉与人祭的残酷', time: '约公元前 1600 - 前 1046 年（商代时期）',
        minLevelName: '部落民',
        desc: '在一场盛大的商王葬礼上，大批战俘和奴隶被残忍杀害作为殉葬品。早期奴隶制的血腥让你不寒而栗。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_059', type: 'history', era: '文明初曙',
        title: '商代丝织业', time: '约公元前 1046 年前后（商末周初）',
        minLevelName: '部落民',
        desc: '你见到了贵族穿的提花丝织衣物，上面甚至有暗纹。商代的纺织技术远超你的想象。',
        rewards: [{type: 'gold', value: 20}]
    },
    {
        id: 'hist_060', type: 'history', era: '文明初曙',
        title: '铸造后母戊鼎', time: '约公元前 1046 年前后（商末周初）',
        minLevelName: '部落民',
        desc: '你作为运料民夫参与了重达八百多公斤的后母戊鼎的铸造。几十名工匠同时浇筑，这件青铜器展现了商代惊人的国力！',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_061', type: 'history', era: '文明初曙',
        title: '四羊方尊出炉', time: '约公元前 1046 年前后（商末周初）',
        minLevelName: '部落民',
        desc: '你见到了刚铸成的四羊方尊，四条大卷角羊栩栩如生，这简直是青铜铸造工艺的鬼斧神工！',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_062', type: 'history', era: '文明初曙',
        title: '盘庚迁殷', time: '约公元前 1300 年（商王盘庚时期）',
        minLevelName: '部落民',
        desc: '为了躲避水患和内部动乱，商王盘庚力排众议，带领你们将都城搬迁到了殷地。虽然过程艰辛，但商朝中兴了。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_063', type: 'history', era: '文明初曙',
        title: '甲骨文占卜', time: '约公元前 1300 - 前 1046 年（商代中晚期）',
        minLevelName: '部落民',
        desc: '贞人将灼烧龟甲后产生的裂纹解读为神明的旨意，并用青铜刀将结果刻在骨头上。你凝视着这些神秘的符号，这是我国目前已知最早的成熟文字。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_064', type: 'history', era: '文明初曙',
        title: '武丁中兴', time: '约公元前 1200 年（商王武丁时期）',
        minLevelName: '部落民',
        desc: '商王武丁任用傅说为相，四处征伐。国家的版图空前广阔，百姓生活安定，商朝迎来了最鼎盛的时期。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_065', type: 'history', era: '文明初曙',
        title: '妇好出征', time: '约公元前 1200 年（商王武丁时期）',
        minLevelName: '部落民',
        desc: '王后妇好亲自披挂上阵，率领一万三千大军击败了周边的羌方等敌国，带回了丰厚的战利品。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_066', type: 'history', era: '文明初曙',
        title: '金文的萌芽', time: '约公元前 1046 年前后（商末周初）',
        minLevelName: '部落民',
        desc: '你发现一些贵族的青铜礼器上铸刻了短短几句铭文（钟鼎文），用来记录册封或赏赐。文字开始走向实用化。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_067', type: 'history', era: '文明初曙',
        title: '炮烙之刑与暴政', time: '商末（商纣王时期）',
        minLevelName: '部落民',
        desc: '商王帝辛（纣王）暴虐无道，建造鹿台，设立极其残忍的炮烙之刑。天下人敢怒不敢言，社会矛盾激化到了极点。',
        rewards: [{type: 'xp', value: -30}]
    },

    // ===== 第三纪元：周·礼制与争鸣（共 41 条）=====
    {
        id: 'hist_068', type: 'history', era: '周·礼制与争鸣',
        title: '牧野之战', time: '公元前 1046 年（周武王十一年）',
        minLevelName: '奴',
        desc: '武王伐纣，商朝军队阵前倒戈。你作为周人的后勤民夫，见证了商朝的覆灭和西周的建立。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_069', type: 'history', era: '周·礼制与争鸣',
        title: '实行分封制', time: '西周初年（周武王至周公时期）',
        minLevelName: '奴',
        desc: '周天子“封建亲戚，以蕃屏周”，将王族、功臣和古代帝王后代分封到各地建立诸侯国。天下的政治秩序被重新确立。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_070', type: 'history', era: '周·礼制与争鸣',
        title: '确立宗法制', time: '公元前 1046 年（西周初年）',
        minLevelName: '奴',
        desc: '周公确立了以“嫡长子继承制”为核心的宗法制。大宗与小宗的严格层级，让家族血缘与国家政治紧密结合在了一起。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_071', type: 'history', era: '周·礼制与争鸣',
        title: '制礼作乐', time: '公元前 1046 年（西周初年）',
        minLevelName: '奴',
        desc: '周公旦制定了严格的礼乐制度，规定了不同等级贵族在穿衣、吃饭、祭祀时的乐器和排场，社会等级森严不可逾越。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_072', type: 'history', era: '周·礼制与争鸣',
        title: '井田制的鼎盛', time: '公元前 1046 - 前 771 年（西周时期）',
        minLevelName: '奴',
        desc: '“普天之下，莫非王土”。你每天天不亮就在公田里劳作，然后才能去种自家的私田。农业生产高度组织化。',
        rewards: [{type: 'gold', value: 20}]
    },
    {
        id: 'hist_073', type: 'history', era: '周·礼制与争鸣',
        title: '国人暴动', time: '公元前 841 年（周厉王三十七年 / 共和元年）',
        minLevelName: '奴',
        desc: '周厉王暴虐无道，实施“防民之口，甚于防川”。你与愤怒的国人一起冲入王宫，将厉王驱逐出镐京。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_074', type: 'history', era: '周·礼制与争鸣',
        title: '共和行政', time: '公元前 841 - 前 828 年（共和时期）',
        minLevelName: '奴',
        desc: '厉王逃亡后，朝政由周定公、召穆公（或共伯和）代管。这是中国历史确切纪年的开始，西周度过了十四年的无王时期。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_075', type: 'history', era: '周·礼制与争鸣',
        title: '烽火戏诸侯', time: '公元前 771 年（周幽王十一年）',
        minLevelName: '奴',
        desc: '周幽王为博褒姒一笑点燃烽火，诸侯急忙赶来却发现被骗。你感叹天子失信于天下，西周的灭亡已成定局。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_076', type: 'history', era: '周·礼制与争鸣',
        title: '平王东迁', time: '公元前 770 年（周平王元年）',
        minLevelName: '奴',
        desc: '犬戎攻破镐京，周平王在诸侯的护送下狼狈东迁洛邑。王室衰微的时代正式拉开帷幕，大国争霸的春秋时期到来。',
        rewards: [{type: 'gold', value: -15}]
    },
    {
        id: 'hist_077', type: 'history', era: '周·礼制与争鸣',
        title: '管仲改革与齐桓公称霸', time: '公元前 7 世纪初（春秋早期）',
        minLevelName: '奴',
        desc: '齐相管仲推行“相地而衰征”，发展工商业。齐桓公打出“尊王攘夷”的旗号，九合诸侯，成为春秋首霸。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_078', type: 'history', era: '周·礼制与争鸣',
        title: '城濮之战与退避三舍', time: '公元前 632 年（周襄王二十年）',
        minLevelName: '奴',
        desc: '晋楚争霸，晋文公重耳遵守诺言“退避三舍”，随后在城濮大败楚军。晋文公成为了新的中原霸主。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_079', type: 'history', era: '周·礼制与争鸣',
        title: '楚庄王问鼎中原', time: '公元前 606 年（楚庄王八年）',
        minLevelName: '奴',
        desc: '楚庄王陈兵周郊，向周天子的使臣询问九鼎的大小轻重。你感受到周王室的共主地位已荡然无存。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_080', type: 'history', era: '周·礼制与争鸣',
        title: '鲁国初税亩', time: '公元前 594 年（鲁宣公十五年）',
        minLevelName: '奴',
        desc: '鲁国宣布“初税亩”，无论公田私田一律按面积征收实物税。你意识到，土地私有权首次得到了国家的合法承认！',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_081', type: 'history', era: '周·礼制与争鸣',
        title: '郑国子产铸刑书', time: '公元前 536 年（郑简公三十年）',
        minLevelName: '奴',
        desc: '郑国执政子产将刑法条文铸在青铜鼎上向全社会公布。这是中国历史上第一次公布成文法，贵族再也无法随意断案了。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_082', type: 'history', era: '周·礼制与争鸣',
        title: '柏举之战', time: '公元前 506 年（周敬王十四年）',
        minLevelName: '奴',
        desc: '吴国大军在孙武的指挥下，长途奔袭，击溃了楚国大军并攻破楚都。你作为吴军运粮队，见证了《孙子兵法》的威力。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_083', type: 'history', era: '周·礼制与争鸣',
        title: '孔子创办私学', time: '公元前 6 世纪（春秋晚期）',
        minLevelName: '奴',
        desc: '孔子打破了“学在官府”的垄断，主张“有教无类”。你作为平民子弟，终于有机会坐在草堂里听先贤讲授《诗》《书》。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_084', type: 'history', era: '周·礼制与争鸣',
        title: '孔子核心思想“仁与礼”', time: '公元前 6 世纪（春秋晚期）',
        minLevelName: '奴',
        desc: '你学习了孔夫子“仁者爱人”与“克己复礼”的思想。在礼崩乐坏的乱世，这套儒家学说犹如一盏明灯指引着道德方向。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_085', type: 'history', era: '周·礼制与争鸣',
        title: '老子著《道德经》', time: '公元前 6 世纪（春秋晚期）',
        minLevelName: '奴',
        desc: '你阅读了老子留下的五千言《道德经》。“祸兮福之所倚，福兮祸之所伏”，无为而治的朴素辩证法思想让你茅塞顿开。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_086', type: 'history', era: '周·礼制与争鸣',
        title: '越王勾践卧薪尝胆', time: '公元前 5 世纪初（春秋末期）',
        minLevelName: '奴',
        desc: '越国被吴国击败后，越王勾践睡在柴草上，每天尝一口苦胆。你被他坚韧不拔的复仇意志深深震撼，最终越国灭吴称霸。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_087', type: 'history', era: '周·礼制与争鸣',
        title: '铁犁牛耕的推广', time: '公元前 5 世纪（春秋晚期至战国初）',
        minLevelName: '奴',
        desc: '村里引进了最新打造的铁犁铧，并套在耕牛身上。原本坚硬难挖的荒地，现在轻松就能翻开，小农经济开始萌芽！',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_088', type: 'history', era: '周·礼制与争鸣',
        title: '李悝变法', time: '战国初期（魏文侯时期）',
        minLevelName: '奴',
        desc: '魏国相国李悝推行“尽地力之教”和《法经》。你在魏国种地，产量大幅提升，魏国迅速成为战国初期的头号强国。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_089', type: 'history', era: '周·礼制与争鸣',
        title: '墨子主张兼爱非攻', time: '公元前 475 - 前 400 年（战国初期）',
        minLevelName: '奴',
        desc: '墨家学派的墨子到处奔走，呼吁“兼爱”“非攻”“节用”。他代表了你们广大下层平民祈求和平与互助的心声。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_090', type: 'history', era: '周·礼制与争鸣',
        title: '曾侯乙编钟', time: '约公元前 433 年（战国早期）',
        minLevelName: '奴',
        desc: '作为干活的工役，你远远聆听了一套由六十五件青铜钟组成的庞大乐器演奏。一钟双音，金石之声响彻大殿。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_091', type: 'history', era: '周·礼制与争鸣',
        title: '三家分晋与战国七雄', time: '公元前 403 年（周威烈王二十三年）',
        minLevelName: '奴',
        desc: '韩、赵、魏三家大夫瓜分了强大的晋国，随后田氏代齐。齐楚燕韩赵魏秦并立的“战国七雄”格局正式形成，大争之世到来。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_092', type: 'history', era: '周·礼制与争鸣',
        title: '商鞅变法', time: '公元前 356 年（秦孝公三年）',
        minLevelName: '奴',
        desc: '商鞅在秦国推行新法，废除井田，奖励军功。虽然你因为严苛的连坐法被罚了款，但只要你多打粮食、战场杀敌就能获得爵位！',
        rewards: [{type: 'xp', value: 60}, {type: 'gold', value: -10}]
    },
    {
        id: 'hist_093', type: 'history', era: '周·礼制与争鸣',
        title: '赵武灵王胡服骑射', time: '公元前 307 年（战国 赵武灵王十九年）',
        minLevelName: '奴',
        desc: '赵武灵王下令抛弃宽大的中原服饰，改穿胡人的紧身短衣，学习骑马射箭。赵国军队机动性大增，成为北方霸主。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_094', type: 'history', era: '周·礼制与争鸣',
        title: '孟子与荀子思想', time: '公元前 4 世纪 - 前 3 世纪（战国中后期）',
        minLevelName: '奴',
        desc: '稷下学宫里，孟子主张“仁政”和“民贵君轻”，而荀子则提出“隆礼重法”。你在集市上听儒生辩论，思想受到了极大启迪。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_095', type: 'history', era: '周·礼制与争鸣',
        title: '苏秦张仪纵横捭阖', time: '公元前 4 世纪 - 前 3 世纪（战国中后期）',
        minLevelName: '奴',
        desc: '苏秦主张“合纵”抗秦，张仪主张“连横”破盟。你看到这些纵横家仅凭三寸不烂之舌就能搅动天下大势，改变国运。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_096', type: 'history', era: '周·礼制与争鸣',
        title: '长平之战', time: '公元前 260 年（秦昭襄王四十七年）',
        minLevelName: '奴',
        desc: '秦赵在长平展开残酷的决战。赵军大败，四十万人被坑杀，举国戴孝，惨烈的战争气息让你窒息。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_097', type: 'history', era: '周·礼制与争鸣',
        title: '修筑都江堰', time: '公元前 256 年（秦昭襄王五十一年）',
        minLevelName: '奴',
        desc: '你参与了蜀郡太守李冰主持的水利工程。巧妙的“鱼嘴”分水设计，让成都平原从此水旱从人，不知饥馑。',
        rewards: [{type: 'xp', value: 150}]
    },
    {
        id: 'hist_098', type: 'history', era: '周·礼制与争鸣',
        title: '韩非子法家集大成', time: '公元前 250 - 前 221 年（战国末期）',
        minLevelName: '奴',
        desc: '韩非子主张君主专制集权，将“法、术、势”相结合。这种冷酷而高效的治国理论，迎合了秦王扫六合的政治需要。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_099', type: 'history', era: '周·礼制与争鸣',
        title: '屈原创作《离骚》', time: '公元前 250 - 前 221 年（战国末期）',
        minLevelName: '奴',
        desc: '楚国大夫屈原被流放，他写下了极其浪漫且充满爱国愁怀的长诗《离骚》。楚辞的瑰丽文风让你沉醉不已。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_100', type: 'history', era: '周·礼制与争鸣',
        title: '远交近攻战略', time: '战国末期（秦王政时期）',
        minLevelName: '奴',
        desc: '秦国采用了范雎提出的“远交近攻”战略，稳住齐燕，猛打韩魏。你意识到，六国被各个击破只是时间问题了。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_101', type: 'history', era: '周·礼制与争鸣',
        title: '修筑郑国渠', time: '公元前 246 年（秦王政元年）',
        minLevelName: '奴',
        desc: '韩国水工郑国受命在秦国开凿水渠。虽然本意是为了消耗秦国国力，但建成后却让关中平原变成了肥沃的粮仓，秦统一天下的后勤稳了。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_102', type: 'history', era: '周·礼制与争鸣',
        title: '荆轲刺秦王', time: '公元前 227 年（秦王政二十年）',
        minLevelName: '奴',
        desc: '图穷匕见！燕国使臣荆轲在大殿上刺杀秦王嬴政失败。秦王大怒，加速了灭亡六国的步伐。',
        rewards: [{type: 'gold', value: -20}]
    },
    {
        id: 'hist_103', type: 'history', era: '周·礼制与争鸣',
        title: '创立皇帝与三公九卿制', time: '公元前 221 年以后',
        minLevelName: '奴',
        desc: '秦始皇自认为“德兼三皇，功过五帝”，首创皇帝称号，并在中央设立丞相、太尉、御史大夫。至高无上的皇权统治模式就此确立。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_104', type: 'history', era: '周·礼制与争鸣',
        title: '废分封行郡县', time: '公元前 221 - 前 207 年（秦朝时期）',
        minLevelName: '奴',
        desc: '朝廷彻底废除了西周以来的分封制，将全国划分为三十六郡，郡守县令皆由皇帝直接任免。中央对地方实现了绝对控制！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_105', type: 'history', era: '周·礼制与争鸣',
        title: '书同文与车同轨', time: '公元前 221 - 前 207 年（秦朝时期）',
        minLevelName: '奴',
        desc: '朝廷下令全国统一使用小篆作为标准文字，并统一度量衡和车轨宽度。你走到天下任何一个郡县，都能顺畅地交流和交易了。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_106', type: 'history', era: '周·礼制与争鸣',
        title: '秦律与严刑峻法', time: '公元前 221 - 前 207 年（秦朝时期）',
        minLevelName: '奴',
        desc: '大秦的法律极其严苛，偷摘几片桑叶甚至丢了官方文书都要被判处重刑或充军。你在沉重的徭役和法律下战战兢兢。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_107', type: 'history', era: '周·礼制与争鸣',
        title: '修筑长城与驰道', time: '秦始皇时期',
        minLevelName: '奴',
        desc: '你被强征去北方修筑抵御匈奴的万里长城，你的兄弟则去修建宽阔平坦的秦直道。这是古代中国最疯狂的基建工程，却也耗尽了民力。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_108', type: 'history', era: '周·礼制与争鸣',
        title: '秦王扫六合', time: '公元前 221 年（秦王政二十六年）',
        minLevelName: '奴',
        desc: '齐国不战而降，秦始皇终于统一了天下！持续数百年的战乱宣告结束，车同轨，书同文的新时代到来了。',
        rewards: [{type: 'xp', value: 100}]
    },

    // ===== 第四纪元：秦·铁血与一统（共 25 条）=====
    {
        id: 'hist_109', type: 'history', era: '秦·铁血与一统',
        title: '秦朝建立', time: '公元前 221 年（秦朝 秦始皇二十六年）',
        minLevelName: '黔首',
        desc: '秦王嬴政完成统一大业，定都咸阳。长期的战乱终于结束，你作为大秦的子民，迎来了一个空前广阔的新帝国。',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_110', type: 'history', era: '秦·铁血与一统',
        title: '皇帝制度创立', time: '公元前 221 年（秦朝 秦始皇二十六年）',
        minLevelName: '黔首',
        desc: '嬴政自认为“德兼三皇，功过五帝”，首创“皇帝”尊号，规定皇权至高无上。你听到里正宣读诏书，深感天威难测。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_111', type: 'history', era: '秦·铁血与一统',
        title: '三公九卿制', time: '秦朝初年',
        minLevelName: '黔首',
        desc: '朝廷在中央设立丞相、太尉、御史大夫辅佐皇帝处理全国政务。庞大帝国的国家机器运转变得极其精密高效。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_112', type: 'history', era: '秦·铁血与一统',
        title: '全面推行郡县制', time: '公元前 221 年（秦朝 秦始皇二十六年）',
        minLevelName: '黔首',
        desc: '朝廷彻底废除分封制，将全国分为三十六郡。你的家乡由朝廷直接指派县令管理，地方彻底服从于中央。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_113', type: 'history', era: '秦·铁血与一统',
        title: '统一文字', time: '秦朝初年',
        minLevelName: '黔首',
        desc: '丞相李斯推行小篆作为全国标准文字。你发现无论是去楚地还是齐地，官方的文书布告大家都能看懂了。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_114', type: 'history', era: '秦·铁血与一统',
        title: '统一度量衡', time: '秦朝初年',
        minLevelName: '黔首',
        desc: '朝廷颁发了标准的度量衡器。你在集市上买粮割布，再也不用担心各地的尺子和斗大小不一，坑蒙拐骗减少了。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_115', type: 'history', era: '秦·铁血与一统',
        title: '统一货币', time: '秦朝初年',
        minLevelName: '黔首',
        desc: '废除原六国形状各异的货币，全国统一使用圆形方孔的秦半两钱。你的生意越做越远，交易极为便利。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_116', type: 'history', era: '秦·铁血与一统',
        title: '车同轨与修驰道', time: '秦朝初年',
        minLevelName: '黔首',
        desc: '天子下令统一全国车辆的轮距，并以咸阳为中心修筑宽阔的驰道。马车在帝国各地畅通无阻，出行效率大增。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_117', type: 'history', era: '秦·铁血与一统',
        title: '收兵器铸金人', time: '公元前 221 年（秦朝 秦始皇二十六年）',
        minLevelName: '黔首',
        desc: '朝廷没收天下民间兵器聚于咸阳，熔铸成十二个巨大的铜人。你交出了家里私藏的青铜戈，天下似乎再也不会有战争了。',
        rewards: [{type: 'xp', value: 20}]
    },
    {
        id: 'hist_118', type: 'history', era: '秦·铁血与一统',
        title: '修筑万里长城', time: '秦始皇时期',
        minLevelName: '黔首',
        desc: '你被强征去北方，将燕、赵、秦原有的长城连接起来，修筑了西起临洮、东至辽东的万里长城。繁重的劳役让你苦不堪言。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_119', type: 'history', era: '秦·铁血与一统',
        title: '秦律严苛', time: '公元前 221 - 前 207 年（秦朝时期）',
        minLevelName: '黔首',
        desc: '“轻罪重罚”，连倒废灰在街道上都要受刑，一人犯法邻里连坐。你每天生活在极度恐惧之中，唯恐触犯刑律。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_120', type: 'history', era: '秦·铁血与一统',
        title: '修建阿房宫与始皇陵', time: '公元前 221 - 前 207 年（秦朝时期）',
        minLevelName: '黔首',
        desc: '你被征调去修建规模宏大的阿房宫和始皇陵。七十多万劳工夜以继日地做苦工，无数人倒在了工地上。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_121', type: 'history', era: '秦·铁血与一统',
        title: '蒙恬北击匈奴', time: '公元前 215 年（秦朝 始皇三十二年）',
        minLevelName: '黔首',
        desc: '大将蒙恬率三十万大军北击匈奴，一举收复河套地区。北方的边患暂时解除了，大秦帝国的威名远播大漠。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_122', type: 'history', era: '秦·铁血与一统',
        title: '凿造灵渠', time: '公元前 214 年（秦朝 始皇三十三年）',
        minLevelName: '黔首',
        desc: '为了解决南征百越的粮饷运输，史禄主持开凿了灵渠，奇迹般地沟通了湘江和漓江。你作为民夫参与了这项伟大工程。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_123', type: 'history', era: '秦·铁血与一统',
        title: '南征百越与设郡', time: '公元前 214 年（秦朝 始皇三十三年）',
        minLevelName: '黔首',
        desc: '秦军征服了珠江流域和越族地区，设立南海、桂林、象郡。华南地区正式划入中央王朝的版图。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_124', type: 'history', era: '秦·铁血与一统',
        title: '焚书', time: '公元前 213 年（秦朝 始皇三十四年）',
        minLevelName: '黔首',
        desc: '丞相李斯建议烧毁除秦国历史和农业、医药、占卜以外的百家书籍。你藏在家中的《诗》《书》被搜出烧毁，文化遭受浩劫。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_125', type: 'history', era: '秦·铁血与一统',
        title: '修筑秦直道', time: '公元前 212 年起',
        minLevelName: '黔首',
        desc: '朝廷下令修筑从咸阳直达九原郡的“高速公路”——秦直道。大军和物资只需三天就能抵达北方前线，震撼无比。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_126', type: 'history', era: '秦·铁血与一统',
        title: '坑儒', time: '公元前 212 年（秦朝 始皇三十五年）',
        minLevelName: '黔首',
        desc: '因方士求仙药不得而逃亡，秦始皇大怒，在咸阳坑杀四百六十多名犯禁的儒生。天下士人噤若寒蝉。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_127', type: 'history', era: '秦·铁血与一统',
        title: '沙丘之谋', time: '公元前 210 年（秦朝 始皇三十七年）',
        minLevelName: '黔首',
        desc: '始皇帝在东巡途中驾崩于沙丘。赵高与李斯秘不发丧，伪造诏书逼死公子扶苏，拥立胡亥为帝。帝国的根基动摇了。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_128', type: 'history', era: '秦·铁血与一统',
        title: '秦二世暴政', time: '公元前 209 年（秦朝 二世元年）',
        minLevelName: '黔首',
        desc: '秦二世胡亥比其父更加残暴，杀害手足，大肆诛杀大臣，赋役更加沉重。老百姓已经到了活不下去的地步。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_129', type: 'history', era: '秦·铁血与一统',
        title: '大泽乡起义', time: '公元前 209 年（秦朝 二世元年）',
        minLevelName: '黔首',
        desc: '“王侯将相宁有种乎！”遇雨误期的陈胜、吴广在大泽乡斩木为兵、揭竿而起。你毫不犹豫地加入了中国历史上第一次农民大起义。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_130', type: 'history', era: '秦·铁血与一统',
        title: '赵高指鹿为马', time: '公元前 207 年（秦朝 二世三年）',
        minLevelName: '黔首',
        desc: '宦官赵高牵着一只鹿说是马，群臣为了保命纷纷附和。朝堂腐败透顶，你对这个帝国彻底绝望了。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_131', type: 'history', era: '秦·铁血与一统',
        title: '巨鹿之战', time: '公元前 207 年（秦朝 二世三年）',
        minLevelName: '黔首',
        desc: '项羽破釜沉舟，在巨鹿大败王离率领的秦军主力。你作为秦军士卒四散逃亡，帝国的军事支柱轰然倒塌。',
        rewards: [{type: 'xp', value: -80}]
    },
    {
        id: 'hist_132', type: 'history', era: '秦·铁血与一统',
        title: '刘邦入关约法三章', time: '公元前 207 年（秦朝 二世三年）',
        minLevelName: '黔首',
        desc: '沛公刘邦的大军攻入关中，废除严酷的秦法，与百姓“约法三章”。关中百姓争相用牛羊酒食犒劳大军，你终于等来了活路。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_133', type: 'history', era: '秦·铁血与一统',
        title: '秦朝覆灭', time: '公元前 207 年（秦朝 二世三年）',
        minLevelName: '黔首',
        desc: '秦王子婴素车白马，捧着御玺向刘邦投降。曾经不可一世的大秦帝国，仅仅存在了十五年就灰飞烟灭了。',
        rewards: [{type: 'xp', value: -100}]
    },

    // ===== 第五纪元：汉·雄风与凿空西域（共 100 条）=====
    {
        id: 'hist_134', type: 'history', era: '汉·雄风与凿空西域',
        title: '楚汉之争结束', time: '公元前 202 年（西汉 高祖五年）',
        minLevelName: '良家子',
        desc: '垓下之战项羽自刎，刘邦击败了不可一世的西楚霸王，在定陶称帝。大汉帝国在废墟中拔地而起，你迎来了久违的和平。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_135', type: 'history', era: '汉·雄风与凿空西域',
        title: '编户齐民制度', time: '公元前 202 - 前 141 年（西汉初年）',
        minLevelName: '良家子',
        desc: '朝廷实行严格的户籍制度，将平民编入户籍（编户齐民）。你家被详细登记了人口、年龄和土地，按规定缴纳赋税和服役。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_136', type: 'history', era: '汉·雄风与凿空西域',
        title: '白登之围与和亲', time: '公元前 200 年（汉高祖七年）',
        minLevelName: '良家子',
        desc: '刘邦率军出击匈奴，却被冒顿单于三十万大军围困在白登山。汉朝被迫开启了屈辱的“和亲”政策。作为边境子民，你感到十分憋屈。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_137', type: 'history', era: '汉·雄风与凿空西域',
        title: '马王堆汉墓与素纱襌衣', time: '公元前 202 - 前 141 年（西汉初年）',
        minLevelName: '良家子',
        desc: '你惊叹于长沙国丞相夫人墓中出土的素纱襌衣，薄如蝉翼，重仅49克！大汉早期的丝织工艺简直巧夺天工。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_138', type: 'history', era: '汉·雄风与凿空西域',
        title: '休养生息政策', time: '公元前 202 - 前 141 年（西汉 高祖至景帝时期）',
        minLevelName: '良家子',
        desc: '连年战乱让天下残破，朝廷下令“十五税一”甚至“三十税一”，并让士兵复员归农。你的家庭终于有了喘息之机，余粮逐渐增多。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_139', type: 'history', era: '汉·雄风与凿空西域',
        title: '退功臣进文吏', time: '公元 25 - 57 年（东汉光武帝 建武年间）',
        minLevelName: '良家子',
        desc: '光武帝刘秀建立东汉后，赐予开国功臣们丰厚的财富，但不让他们干预朝政。同时大量提拔文官，大汉从马上打天下转为马下治天下。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_140', type: 'history', era: '汉·雄风与凿空西域',
        title: '班固修《汉书》', time: '公元 1世纪（东汉初中前期）',
        minLevelName: '良家子',
        desc: '史学家班固子承父业，历经二十余年写成了《汉书》。这是我国第一部纪传体断代史，记录了西汉二百年的兴衰。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_141', type: 'history', era: '汉·雄风与凿空西域',
        title: '白马之盟', time: '公元前 195 年（西汉 高祖十二年）',
        minLevelName: '良家子',
        desc: '汉高祖刘邦在临终前与群臣杀白马立誓：“非刘氏而王者，天下共击之”。你深感西汉初年刘氏皇族对权力的绝对掌控。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_142', type: 'history', era: '汉·雄风与凿空西域',
        title: '吕后专权', time: '公元前 188 年 - 前 180 年',
        minLevelName: '良家子',
        desc: '汉惠帝死后，吕太后临朝称制，大封诸吕为王。朝中充满了功臣集团与外戚势力的明争暗斗，你在京城为官，如履薄冰。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_143', type: 'history', era: '汉·雄风与凿空西域',
        title: '文景之治', time: '公元前 180 年 - 前 141 年',
        minLevelName: '良家子',
        desc: '历经汉文帝、汉景帝两代人的治理，海内安宁，国家粮仓里的粮食堆积如山，穿钱的绳子都朽断了。你走在繁华的长安街头，满心欢喜。',
        rewards: [{type: 'xp', value: 60}, {type: 'gold', value: 30}]
    },
    {
        id: 'hist_144', type: 'history', era: '汉·雄风与凿空西域',
        title: '汉文帝废除肉刑', time: '公元前 167 年（汉文帝十三年）',
        minLevelName: '良家子',
        desc: '少女缇萦上书救父，感动了汉文帝。皇帝下诏废除黥、劓、刖等残酷的肉刑。大汉的法律开始展现出仁慈的一面。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_145', type: 'history', era: '汉·雄风与凿空西域',
        title: '七国之乱', time: '公元前 154 年（汉景帝三年）',
        minLevelName: '良家子',
        desc: '吴王刘濞以“清君侧”为名，联合六个诸侯国发动叛乱。朝廷大将周亚夫仅用三个月便平定了叛乱，中央集权得到了巩固。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_146', type: 'history', era: '汉·雄风与凿空西域',
        title: '察举制的推行', time: '公元前 140 - 前 87 年（西汉 武帝建元年间）',
        minLevelName: '良家子',
        desc: '朝廷下令地方郡国每年向中央举荐“孝子”和“廉吏”。你因为在乡里以孝顺闻名，被县令推举，获得了做官的资格！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_147', type: 'history', era: '汉·雄风与凿空西域',
        title: '中朝（内朝）的确立', time: '公元前 140 - 前 87 年（西汉 武帝建元年间）',
        minLevelName: '良家子',
        desc: '为了削弱丞相的权力，汉武帝提拔身边的侍从、尚书等低级官员组成“中朝”来参与国家机密决策。皇权得到了空前强化。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_148', type: 'history', era: '汉·雄风与凿空西域',
        title: '《春秋繁露》与天人感应', time: '公元前 140 - 前 87 年（西汉 武帝建元年间）',
        minLevelName: '良家子',
        desc: '你拜读了董仲舒的著作，其中“天人感应”“君权神授”的思想让你深感震撼。儒学吸收了道家、法家、阴阳五行，成为了新的封建正统。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_149', type: 'history', era: '汉·雄风与凿空西域',
        title: '六条问事', time: '公元前 140 - 前 87 年（西汉 武帝建元年间）',
        minLevelName: '良家子',
        desc: '朝廷颁布《六条问事》作为刺史监察地方的法律标准。你看到横行乡里的郡守和豪强因为违反“六条”被刺史弹劾，大快人心。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_150', type: 'history', era: '汉·雄风与凿空西域',
        title: '李广难封', time: '公元前 140 - 前 87 年（西汉 武帝建元年间）',
        minLevelName: '良家子',
        desc: '“飞将军”李广一生与匈奴作战七十余次，威震边关，却因迷路等各种原因终生未能封侯，最终愤而自刎。你为这位名将的悲剧扼腕叹息。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_151', type: 'history', era: '汉·雄风与凿空西域',
        title: '算缗与告缗', time: '公元前 140 - 前 87 年（西汉 武帝建元年间）',
        minLevelName: '良家子',
        desc: '朝廷向商人征收重税（算缗），并鼓励百姓举报商人隐瞒财产（告缗）。许多富商大贾因此破产，国家财政却充实了。',
        rewards: [{type: 'gold', value: -30}]
    },
    {
        id: 'hist_152', type: 'history', era: '汉·雄风与凿空西域',
        title: '赵过推行代田法', time: '公元前 140 - 前 87 年（西汉 武帝建元年间）',
        minLevelName: '良家子',
        desc: '搜粟都尉赵过在关中推广“代田法”，在田地里开沟作垄，轮番种植，防风抗旱。你家的麦子用了此法，亩产显著提升。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_153', type: 'history', era: '汉·雄风与凿空西域',
        title: '耧车的推广', time: '公元前 140 - 公元 220 年（汉武帝至东汉末）',
        minLevelName: '良家子',
        desc: '你在田间用上了一种畜力牵引的播种机——“耧车”，不仅播种均匀，还能同时覆土，种地变得高效省力了。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_154', type: 'history', era: '汉·雄风与凿空西域',
        title: '张骞出使西域（第一次）', time: '公元前 138 年 - 前 126 年',
        minLevelName: '良家子',
        desc: '为了联络大月氏夹击匈奴，张骞历经十三年艰难险阻，终于从西域返回长安。虽然没有完成军事结盟，却带回了西域的详尽情报。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_155', type: 'history', era: '汉·雄风与凿空西域',
        title: '罢黜百家独尊儒术', time: '公元前 134 年（汉武帝建元元年）',
        minLevelName: '良家子',
        desc: '采纳董仲舒的建议，汉武帝将儒家学说确立为封建正统思想。你赶忙去买了几卷《诗》《书》，因为不懂儒学将很难在官场立足。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_156', type: 'history', era: '汉·雄风与凿空西域',
        title: '马邑之谋', time: '公元前 133 年（汉武帝元光二年）',
        minLevelName: '良家子',
        desc: '汉武帝采纳王恢之计，在马邑设伏30万大军企图围歼匈奴主力。虽然计划泄露失败，但汉匈之间持续数十年的“和亲”政策就此彻底撕毁！',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_157', type: 'history', era: '汉·雄风与凿空西域',
        title: '漠南之战', time: '公元前 127 年（西汉 武帝元朔二年）',
        minLevelName: '良家子',
        desc: '车骑将军卫青率军奇袭匈奴，收复了河套地区。你所在的边境乡村终于不再遭受匈奴骑兵的劫掠了。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_158', type: 'history', era: '汉·雄风与凿空西域',
        title: '颁布推恩令', time: '公元前 127 年（汉武帝元朔二年）',
        minLevelName: '良家子',
        desc: '主父偃献计，汉武帝下令诸侯王可以将封地分封给所有子弟。你眼看着庞大的诸侯国被兵不血刃地越分越小，中央彻底掌控了地方。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_159', type: 'history', era: '汉·雄风与凿空西域',
        title: '设立太学', time: '公元前 124 年（汉武帝元朔五年）',
        minLevelName: '良家子',
        desc: '朝廷在长安设立太学，设置五经博士传授儒家经典。这是中国古代设立最高学府的开始，你梦想着有朝一日能成为太学生。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_160', type: 'history', era: '汉·雄风与凿空西域',
        title: '河西之战与设立四郡', time: '公元前 121 年（西汉 武帝元狩二年）',
        minLevelName: '良家子',
        desc: '骠骑将军霍去病大破匈奴，夺取了河西走廊。朝廷设立了武威、张掖、酒泉、敦煌四郡，通往西域的大门被彻底打开了！',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_161', type: 'history', era: '汉·雄风与凿空西域',
        title: '漠北战役与封狼居胥', time: '公元前 119 年（西汉 武帝元狩四年）',
        minLevelName: '良家子',
        desc: '卫青、霍去病率军深入大漠，大败匈奴主力。霍去病在狼居胥山筑坛祭天，“匈奴远遁，而漠南无王庭”。你为大汉军威感到无比自豪！',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_162', type: 'history', era: '汉·雄风与凿空西域',
        title: '张骞出使西域（第二次）', time: '公元前 119 年（西汉 武帝元狩四年）',
        minLevelName: '良家子',
        desc: '张骞率领庞大的使团再次出使西域，带去了大量的牛羊、丝绸。汉朝与西域各国的官方交往正式建立。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_163', type: 'history', era: '汉·雄风与凿空西域',
        title: '盐铁官营', time: '公元前 119 年（汉武帝元狩四年）',
        minLevelName: '良家子',
        desc: '为了支持对匈奴的战争，朝廷将煮盐、冶铁等暴利行业收归国家专营。你家以前开的私家铁匠铺被迫关停，收入锐减。',
        rewards: [{type: 'gold', value: -20}]
    },
    {
        id: 'hist_164', type: 'history', era: '汉·雄风与凿空西域',
        title: '铸造五铢钱', time: '公元前 118 年（汉武帝元狩五年）',
        minLevelName: '良家子',
        desc: '朝廷将铸币权收归中央，统一铸造重五铢的铜钱。你手里那些重量不一、容易被剪凿的劣币终于被淘汰了。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_165', type: 'history', era: '汉·雄风与凿空西域',
        title: '均输平准法', time: '公元前 110 年（汉武帝元封元年）',
        minLevelName: '良家子',
        desc: '桑弘羊推行均输平准法。国家统一调购物资，贵时抛售，贱时收购。你在长安西市看到物价终于稳定下来，富商再也无法囤积居奇了。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_166', type: 'history', era: '汉·雄风与凿空西域',
        title: '设立刺史制度', time: '公元前 106 年（汉武帝元封五年）',
        minLevelName: '良家子',
        desc: '朝廷将全国分为十三个州部，每州派一名刺史，以极低的官品监察地方高官和豪强。豪强恶霸再也不敢鱼肉乡里了。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_167', type: 'history', era: '汉·雄风与凿空西域',
        title: '细君公主和亲乌孙', time: '公元前 105 年（汉武帝元封六年）',
        minLevelName: '良家子',
        desc: '为了联合西域的乌孙国夹击匈奴，汉武帝将宗室女细君公主远嫁乌孙。你听闻公主作《悲愁歌》，为国家的付出令人落泪。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_168', type: 'history', era: '汉·雄风与凿空西域',
        title: '汉赋双星：扬雄与司马相如', time: '公元前 202 - 公元 8 年（西汉时期）',
        minLevelName: '良家子',
        desc: '“赋家之心，包括宇宙”。你读着司马相如的《上林赋》和扬雄的《羽猎赋》，那铺陈排比、辞藻华丽的句式，尽显帝国的大气磅礴。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_169', type: 'history', era: '汉·雄风与凿空西域',
        title: '汉代牛耕的普及', time: '公元前 202 - 公元 8 年（西汉时期）',
        minLevelName: '良家子',
        desc: '你在田里看到邻居使用了“二牛抬杠”的耦犁法，甚至有人开始使用更灵活的“一牛挽犁”。畜力的大规模应用让耕地效率翻倍。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_170', type: 'history', era: '汉·雄风与凿空西域',
        title: '苏武牧羊', time: '公元前 100 年 - 前 81 年',
        minLevelName: '良家子',
        desc: '汉朝使臣苏武被匈奴扣留，流放北海牧羊十九年，持节不屈。他坚韧的民族气节让你深受感动，坚定了报效国家的信念。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_171', type: 'history', era: '汉·雄风与凿空西域',
        title: '丝绸之路的繁荣', time: '公元前 100 - 公元 8 年（西汉中后期）',
        minLevelName: '良家子',
        desc: '无数满载中国丝绸的骆驼商队从长安出发，经河西走廊通往中亚、西亚乃至欧洲。你用丝绸换回了西域的汗血马、葡萄和核桃。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_172', type: 'history', era: '汉·雄风与凿空西域',
        title: '西汉海上丝绸之路', time: '公元前 100 - 公元 8 年（西汉中后期）',
        minLevelName: '良家子',
        desc: '你跟随商船从徐闻（今广东）出发，经马六甲海峡航行到了印度南部。大汉的丝绸和黄金，换回了璀璨的琉璃和珍珠。大汉的航海网已经铺开！',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_173', type: 'history', era: '汉·雄风与凿空西域',
        title: '冶铁业的“炒钢法”', time: '公元前 100 - 公元 8 年（西汉中后期）',
        minLevelName: '良家子',
        desc: '铁匠铺掌握了最新的“炒钢法”，将生铁加热后不断搅拌，氧化脱碳直接炼成钢。大汉军队的环首刀变得极其锋利坚韧，横扫匈奴！',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_174', type: 'history', era: '汉·雄风与凿空西域',
        title: '修筑白渠', time: '公元前 95 年（汉武帝太始二年）',
        minLevelName: '良家子',
        desc: '朝廷在关中开凿了长达两百里的水利工程——白渠。泾水被引入农田，“泾水一石，其泥数斗”，不仅灌溉了土地，还改良了盐碱地。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_175', type: 'history', era: '汉·雄风与凿空西域',
        title: '《史记》成书', time: '公元前 91 年（汉武帝征和二年）',
        minLevelName: '良家子',
        desc: '太史令司马迁忍受腐刑的奇耻大辱，历时十余年写成了“究天人之际，通古今之变”的《史记》。这是中国第一部纪传体通史！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_176', type: 'history', era: '汉·雄风与凿空西域',
        title: '轮台罪己诏', time: '公元前 89 年（汉武帝征和四年）',
        minLevelName: '良家子',
        desc: '汉武帝晚年对连年征战导致的民不聊生感到悔恨，下发《轮台罪己诏》，宣布停止对外战争，重心转向农业。大汉帝国避免了秦朝二世而亡的覆辙。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_177', type: 'history', era: '汉·雄风与凿空西域',
        title: '霍光辅政与昭宣中兴', time: '公元前 87 年 - 前 49 年',
        minLevelName: '良家子',
        desc: '汉武帝驾崩后，大将军霍光辅佐幼主，轻徭薄赋。随后的汉宣帝时期，国家政治清明，经济恢复，西汉迎来了又一个强盛期。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_178', type: 'history', era: '汉·雄风与凿空西域',
        title: '盐铁会议', time: '公元前 81 年（汉昭帝始元六年）',
        minLevelName: '良家子',
        desc: '朝廷召集贤良文学在长安辩论是否废除盐铁官营等经济政策。你在会场外听着儒生与桑弘羊的激烈交锋，这是大汉罕见的民主决策场面。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_179', type: 'history', era: '汉·雄风与凿空西域',
        title: '赵充国屯田', time: '公元前 61 年（汉宣帝神爵元年）',
        minLevelName: '良家子',
        desc: '老将赵充国在西北边疆推行“屯田”政策。你作为屯垦戍卒，一手拿锄头，一手拿弓箭，既保障了军粮，又巩固了边防。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_180', type: 'history', era: '汉·雄风与凿空西域',
        title: '设立西域都护府', time: '公元前 60 年（汉宣帝神爵二年）',
        minLevelName: '良家子',
        desc: '朝廷在乌垒城设立西域都护府，作为管理西域的最高军政机构。标志着西域正式纳入汉朝版图，你的商队在西域有了国家保护！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_181', type: 'history', era: '汉·雄风与凿空西域',
        title: '汉宣帝“霸王道杂之”', time: '汉宣帝时期',
        minLevelName: '良家子',
        desc: '太子抱怨皇帝刑罚太重应多用儒家教化，汉宣帝怒斥“汉家自有制度，本以霸王道杂之”。你领悟到，大汉的统治核心其实是“外儒内法”。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_182', type: 'history', era: '汉·雄风与凿空西域',
        title: '呼韩邪单于附汉', time: '公元前 51 年（汉宣帝甘露三年）',
        minLevelName: '良家子',
        desc: '匈奴分裂，呼韩邪单于亲自来到长安朝见汉宣帝，表示臣服。北方边患基本解除，你见证了大汉国威达到的又一个顶点。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_183', type: 'history', era: '汉·雄风与凿空西域',
        title: '石渠阁会议', time: '公元前 51 年（汉宣帝甘露三年）',
        minLevelName: '良家子',
        desc: '汉宣帝在长安石渠阁召集大儒，亲自裁定五经的异同。儒家经典的解释权被朝廷彻底统一，你赶忙抄录了最新的标准答案准备科考。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_184', type: 'history', era: '汉·雄风与凿空西域',
        title: '陈汤斩郅支单于', time: '公元前 36 年（汉元帝建昭三年）',
        minLevelName: '良家子',
        desc: '西域副校尉陈汤矫诏发兵，长途奔袭斩杀反叛的郅支单于，并发出了“明犯强汉者，虽远必诛”的千古强音！你听闻捷报，热血沸腾。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_185', type: 'history', era: '汉·雄风与凿空西域',
        title: '昭君出塞', time: '公元前 33 年（汉元帝竟宁元年）',
        minLevelName: '良家子',
        desc: '宫女大义凛然，自请和亲远嫁匈奴呼韩邪单于。她的壮举换来了汉匈之间长达半个世纪的和平，边境上牛羊遍野。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_186', type: 'history', era: '汉·雄风与凿空西域',
        title: '飞燕弄作与西汉衰落', time: '公元前 33 - 前 7 年（西汉 汉成帝时期）',
        minLevelName: '良家子',
        desc: '汉成帝沉迷于赵飞燕姐妹的美色，朝政荒废，外戚王氏家族开始掌控大权。你预感到庞大的帝国正在从内部腐烂。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_187', type: 'history', era: '汉·雄风与凿空西域',
        title: '《急就篇》蒙学普及', time: '公元前 49 - 公元 8 年（西汉后期）',
        minLevelName: '良家子',
        desc: '你给家里的孩子买了一本黄门令史游编写的《急就篇》。这种以三言、四言、七言为主的识字课本，让平民子弟也能快速启蒙了。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_188', type: 'history', era: '汉·雄风与凿空西域',
        title: '区种法的推广', time: '公元 1 世纪（西汉末至东汉初）',
        minLevelName: '良家子',
        desc: '你在山坡和干旱的土地上采用“区种法”，挖坑集中施肥浇水。这种抗旱保收的精耕细作方法，让你在灾年也能有一口饭吃。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_189', type: 'history', era: '汉·雄风与凿空西域',
        title: '乐府诗的兴起', time: '公元前 202 - 公元 220 年（两汉时期）',
        minLevelName: '良家子',
        desc: '朝廷设立乐府机构收集民间诗歌。你听着市井间传唱的《十五从军征》《陌上桑》，它们用朴实的语言唱出了百姓的真实生活。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_190', type: 'history', era: '汉·雄风与凿空西域',
        title: '《周髀算经》与盖天说', time: '公元前 202 - 公元 220 年（两汉时期）',
        minLevelName: '良家子',
        desc: '你研读了《周髀算经》，不仅学会了勾股定理的应用，还了解了“天圆如张盖，地方如棋局”的盖天说宇宙观，拓展了认知边界。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_191', type: 'history', era: '汉·雄风与凿空西域',
        title: '王莽篡汉建立新朝', time: '公元 9 年（新朝 始建国元年）',
        minLevelName: '良家子',
        desc: '外戚王莽废黜孺子婴，自立为帝，改国号为“新”。西汉灭亡，王莽开始了一系列复古且脱离实际的改制方案。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_192', type: 'history', era: '汉·雄风与凿空西域',
        title: '王莽改制失败', time: '公元 9 - 23 年（新朝 王莽时期）',
        minLevelName: '良家子',
        desc: '王莽下令将土地收归国有（王田），废除奴隶买卖，并频繁更改货币。经济彻底崩溃，你连买盐的钱都找不开了，民怨沸腾。',
        rewards: [{type: 'gold', value: -60}]
    },
    {
        id: 'hist_193', type: 'history', era: '汉·雄风与凿空西域',
        title: '绿林赤眉起义', time: '公元 17 年起（新朝 天凤四年）',
        minLevelName: '良家子',
        desc: '天灾人祸交加，你家乡的百姓活不下去，纷纷加入了眉毛涂红的“赤眉军”或盘踞绿林山的“绿林军”，反抗王莽暴政。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_194', type: 'history', era: '汉·雄风与凿空西域',
        title: '绿林军更始政权', time: '公元 23 年（新朝 地皇四年 / 汉更始元年）',
        minLevelName: '良家子',
        desc: '绿林军拥立汉宗室刘玄为帝，建元更始。虽然推翻了王莽，但更始政权内部腐败混乱，你在战乱中意识到，天下还远未太平。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_195', type: 'history', era: '汉·雄风与凿空西域',
        title: '昆阳之战', time: '公元 23 年（新朝 地皇四年 / 汉更始元年）',
        minLevelName: '良家子',
        desc: '刘秀在昆阳城下以少胜多，两万绿林军击溃了王莽的四十二万大军！天降陨石助阵，王莽新朝的精锐丧失殆尽。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_196', type: 'history', era: '汉·雄风与凿空西域',
        title: '光武中兴', time: '公元 25 年 - 57 年',
        minLevelName: '良家子',
        desc: '汉光武帝刘秀在洛阳重建汉朝（东汉）。他释放奴婢、精简官僚、偃武修文。天下终于重新安定下来，生产迅速恢复。',
        rewards: [{type: 'xp', value: 80}, {type: 'gold', value: 30}]
    },
    {
        id: 'hist_197', type: 'history', era: '汉·雄风与凿空西域',
        title: '水排的发明', time: '公元 31 年（汉光武帝建武七年）',
        minLevelName: '良家子',
        desc: '南阳太守杜诗发明了利用水力鼓风冶铁的“水排”。你家铁匠铺的产量大幅提升，这比欧洲早了一千多年！',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_198', type: 'history', era: '汉·雄风与凿空西域',
        title: '度田令的阻力', time: '公元 39 年（汉光武帝建武十五年）',
        minLevelName: '良家子',
        desc: '光武帝下令核实全国土地和人口（度田），触犯了地方豪强的利益，引发多地叛乱。你见证了皇权与地方豪强之间的激烈博弈。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_199', type: 'history', era: '汉·雄风与凿空西域',
        title: '伏波将军马援', time: '公元 40 年 - 49 年',
        minLevelName: '良家子',
        desc: '老将马援南征交趾，北击乌桓，留下了“男儿当死于边野，以马革裹尸还葬耳”的豪言壮语。大汉军人的铁血精神让你敬佩万分。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_200', type: 'history', era: '汉·雄风与凿空西域',
        title: '云台二十八将', time: '公元 60 年（汉明帝永平三年）',
        minLevelName: '良家子',
        desc: '汉明帝命人在南宫云台画下了辅佐刘秀光复汉室的二十八位功臣画像。你看着这些开国猛将的画像，回想起了那段气吞山河的岁月。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_201', type: 'history', era: '汉·雄风与凿空西域',
        title: '白马寺与佛教传入', time: '公元 68 年（汉明帝永平十一年）',
        minLevelName: '良家子',
        desc: '汉明帝“夜梦金人”，派使臣求佛法。两位天竺高僧用白马驮着佛经来到洛阳，朝廷修建了白马寺。古印度佛教正式传入中国。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_202', type: 'history', era: '汉·雄风与凿空西域',
        title: '班超出使西域', time: '公元 73 年（汉明帝永平十六年）',
        minLevelName: '良家子',
        desc: '“投笔从戎”的班超仅率三十六人出使西域，不入虎穴焉得虎子，重新打通了断绝六十五年的丝绸之路。大汉雄风再次震慑西域！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_203', type: 'history', era: '汉·雄风与凿空西域',
        title: '窦宪燕然勒石', time: '公元 89 年（汉和帝永元元年）',
        minLevelName: '良家子',
        desc: '车骑将军窦宪大破北匈奴，班固在燕然山刻石记功。北匈奴被迫西迁欧洲，几百年的匈奴边患在此刻基本画上了句号！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_204', type: 'history', era: '汉·雄风与凿空西域',
        title: '甘英出使大秦', time: '公元 97 年（汉和帝永元九年）',
        minLevelName: '良家子',
        desc: '班超派部将甘英出使大秦（罗马帝国）。虽然被安息人欺骗阻挡在波斯湾，但这是中国人向西探索的最远记录！',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_205', type: 'history', era: '汉·雄风与凿空西域',
        title: '尚书台的确立', time: '公元 25 - 220 年（东汉时期）',
        minLevelName: '良家子',
        desc: '光武帝削弱三公（丞相、太尉、御史大夫）的权力，将国家中枢决策权转移到了宫内的“尚书台”。“虽置三公，事归台阁”，皇权进一步集中。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_206', type: 'history', era: '汉·雄风与凿空西域',
        title: '汉隶的成熟“八分书”', time: '公元 25 - 220 年（东汉时期）',
        minLevelName: '良家子',
        desc: '你学习了碑刻上的隶书，字形扁平，蚕头燕尾。这种被称为“八分书”的成熟汉隶，标志着汉字彻底脱离了古文字阶段，进入了今文字时代。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_207', type: 'history', era: '汉·雄风与凿空西域',
        title: '画像石与画像砖', time: '公元 25 - 220 年（东汉时期）',
        minLevelName: '良家子',
        desc: '你参观了一座东汉大墓，墓室墙壁上刻满了农耕、狩猎、宴饮甚至神话传说故事的画像石。这是用石头雕刻的大汉百科全书！',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_208', type: 'history', era: '汉·雄风与凿空西域',
        title: '《九章算术》成书', time: '公元 25 - 220 年（东汉时期）',
        minLevelName: '良家子',
        desc: '你学习了这部数学专著，里面详细记载了田亩面积、粮食兑换、甚至勾股定理和方程的算法。你的算账能力大增！',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_209', type: 'history', era: '汉·雄风与凿空西域',
        title: '蔡伦改进造纸术', time: '公元 105 年（汉和帝元兴元年）',
        minLevelName: '良家子',
        desc: '宦官蔡伦用树皮、破布、废渔网造出了便宜好用的“蔡侯纸”。你终于可以买得起纸张读书写字，告别笨重的竹简了！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_210', type: 'history', era: '汉·雄风与凿空西域',
        title: '班勇经营西域', time: '公元 123 年（东汉延光二年）',
        minLevelName: '良家子',
        desc: '班超之子班勇再次出兵西域，击败匈奴，恢复了汉朝对西域的管辖。西域长史府设立，丝绸之路再次畅通无阻。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_211', type: 'history', era: '汉·雄风与凿空西域',
        title: '张衡发明地动仪', time: '公元 132 年（汉顺帝阳嘉元年）',
        minLevelName: '良家子',
        desc: '太史令张衡发明了世界上第一架测定地震方向的候风地动仪。陇西发生地震，洛阳的仪器准确掉下了一颗铜丸，满朝震惊。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_212', type: 'history', era: '汉·雄风与凿空西域',
        title: '跋扈将军梁冀', time: '公元 141 年 - 159 年',
        minLevelName: '良家子',
        desc: '外戚大将军梁冀连立三帝，毒杀汉质帝，专权长达近二十年，被称为“跋扈将军”。整个朝堂乌烟瘴气，你感到深深的窒息。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_213', type: 'history', era: '汉·雄风与凿空西域',
        title: '外戚宦官交替专权', time: '公元 100 - 220 年（东汉中后期）',
        minLevelName: '良家子',
        desc: '皇帝年幼，太后重用外戚；皇帝长大，依靠宦官诛杀外戚。你在朝中看着这两股势力轮流把持朝政，政治极度黑暗腐败。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_214', type: 'history', era: '汉·雄风与凿空西域',
        title: '羌族叛乱危机', time: '公元 100 - 220 年（东汉中后期）',
        minLevelName: '良家子',
        desc: '西北羌族不堪忍受汉朝地方官的压迫，发动了持续数十年的大起义。朝廷耗费了巨额军费，国库空虚，关中残破，东汉元气大伤。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_215', type: 'history', era: '汉·雄风与凿空西域',
        title: '豪强地主田庄经济', time: '公元 100 - 220 年（东汉中后期）',
        minLevelName: '良家子',
        desc: '地方豪强建立起庞大的坞堡和田庄，拥有私人武装（部曲），自给自足。你为了活命，不得不带着土地投靠豪强，沦为依附农民。',
        rewards: [{type: 'gold', value: -30}]
    },
    {
        id: 'hist_216', type: 'history', era: '汉·雄风与凿空西域',
        title: '青瓷的诞生', time: '公元 100 - 220 年（东汉中后期）',
        minLevelName: '良家子',
        desc: '你花重金买到了一件表面带有青色釉层的陶瓷器具。这是中国历史上真正意义上的“瓷器”，告别了吸水率高的原始陶器，手工业迈出一大步！',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_217', type: 'history', era: '汉·雄风与凿空西域',
        title: '东汉清议与太学生运动', time: '公元 150 - 220 年（东汉后期）',
        minLevelName: '良家子',
        desc: '太学里的三万名学生与在野名士互相串联，品评朝政，抨击宦官专权，形成了声势浩大的“清议”思潮。你加入了他们的游行抗议，无所畏惧。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_218', type: 'history', era: '汉·雄风与凿空西域',
        title: '佛教石窟艺术萌芽', time: '公元 150 - 220 年（东汉后期）',
        minLevelName: '良家子',
        desc: '随着佛教的传入，你听说在通往西域的道路旁，开始有僧侣在崖壁上开凿简单的洞窟供奉佛像。外来宗教艺术开始扎根中国。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_219', type: 'history', era: '汉·雄风与凿空西域',
        title: '党锢之祸', time: '公元 166 年 - 169 年',
        minLevelName: '良家子',
        desc: '太学生和正直的士大夫（党人）上书弹劾宦官，却被宦官残酷镇压、禁锢终身。你的许多恩师被关入大牢，天下士气受挫。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_220', type: 'history', era: '汉·雄风与凿空西域',
        title: '黄巾起义爆发', time: '公元 184 年（汉灵帝中平元年）',
        minLevelName: '良家子',
        desc: '“苍天已死，黄天当立！”头绑黄巾的农民暴动席卷全国，东汉王朝的统治土崩瓦解。大动荡的时代正式拉开帷幕。',
        rewards: [{type: 'xp', value: -80}]
    },
    {
        id: 'hist_221', type: 'history', era: '汉·雄风与凿空西域',
        title: '州牧割据', time: '公元 188 年起',
        minLevelName: '良家子',
        desc: '为了镇压起义，朝廷下放军政大权，改刺史为州牧。地方长官变成了拥兵自重的军阀，大汉名存实亡，群雄逐鹿开始了。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_222', type: 'history', era: '汉·雄风与凿空西域',
        title: '袁绍诛杀宦官', time: '公元 189 年（汉灵帝中平六年）',
        minLevelName: '良家子',
        desc: '借着大将军何进被杀的契机，袁绍带兵冲入皇宫，将宦官不分老幼屠杀殆尽。纠缠东汉百年的宦官之祸结束了，但军阀的屠刀也举起来了。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_223', type: 'history', era: '汉·雄风与凿空西域',
        title: '董卓进京与诸侯讨董', time: '公元 189 年 - 190 年',
        minLevelName: '良家子',
        desc: '西凉军阀董卓进京废立皇帝，焚毁洛阳。关东诸侯组成联军讨伐董卓，战火彻底将繁华的中原烧成焦土。你踏上了颠沛流离的逃亡之路。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_224', type: 'history', era: '汉·雄风与凿空西域',
        title: '张鲁割据汉中', time: '公元 184 - 220 年（东汉末年）',
        minLevelName: '良家子',
        desc: '五斗米道首领张鲁在汉中建立了政教合一的地方割据政权。只要交五斗米就能入道，汉中成了一个相对安定的避难所，你带着家人前去投奔。',
        rewards: [{type: 'xp', value: 20}]
    },
    {
        id: 'hist_225', type: 'history', era: '汉·雄风与凿空西域',
        title: '道教的兴起', time: '公元 184 - 220 年（东汉末年）',
        minLevelName: '良家子',
        desc: '民间开始广泛流传张角创立的“太平道”和张陵创立的“五斗米道”。绝望的底层百姓找到了精神寄托，一场风暴正在酝酿。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_226', type: 'history', era: '汉·雄风与凿空西域',
        title: '张仲景著《伤寒杂病论》', time: '公元 196 - 220 年（东汉 献帝建安年间）',
        minLevelName: '良家子',
        desc: '瘟疫横行之际，长沙太守张仲景辞官行医，写下中医临床学的经典著作。他确立的“辨证施治”原则，救了无数人的性命。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_227', type: 'history', era: '汉·雄风与凿空西域',
        title: '华佗发明麻沸散', time: '公元 184 - 220 年（东汉末年）',
        minLevelName: '良家子',
        desc: '神医华佗让你喝下了一种叫“麻沸散”的药汤，你瞬间失去知觉。醒来时，腹内的肿瘤已经被成功切除。这是世界最早的全身麻醉手术！',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_228', type: 'history', era: '汉·雄风与凿空西域',
        title: '《四民月令》记录田庄生活', time: '公元 184 - 220 年（东汉末年）',
        minLevelName: '良家子',
        desc: '你读了崔寔撰写的《四民月令》，里面详细安排了地主田庄一年四季的农业生产、手工业和农副产品买卖。东汉的自然经济体系高度完善。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_229', type: 'history', era: '汉·雄风与凿空西域',
        title: '建安风骨', time: '公元 196 - 220 年（东汉 献帝建安年间）',
        minLevelName: '良家子',
        desc: '战乱之中，你读到了曹操父子和建安七子的诗歌。“白骨露于野，千里无鸡鸣”，诗歌中苍凉悲壮、慷慨激昂的气息，被称为建安风骨。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_230', type: 'history', era: '汉·雄风与凿空西域',
        title: '曹操迎帝都许', time: '公元 196 年（建安元年）',
        minLevelName: '良家子',
        desc: '军阀曹操将流离失所的汉献帝迎接到许县，开始了“挟天子以令诸侯”。你在这位枭雄的治下，看到了一丝重新统一的希望。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_231', type: 'history', era: '汉·雄风与凿空西域',
        title: '曹操实行屯田', time: '公元 196 年起',
        minLevelName: '良家子',
        desc: '连年战乱导致中原“白骨露于野”。曹操招募流亡农民和士兵开荒种地，实行屯田制。你分到了一头耕牛和几亩荒地，终于能吃上饱饭了。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_232', type: 'history', era: '汉·雄风与凿空西域',
        title: '官渡之战', time: '公元 200 年（东汉 献帝建安五年）',
        minLevelName: '良家子',
        desc: '曹操在官渡奇袭乌巢烧毁粮草，以两万人击败了袁绍十万大军。北方最大的军阀被消灭，黄河流域即将迎来统一。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_233', type: 'history', era: '汉·雄风与凿空西域',
        title: '赤壁之战', time: '公元 208 年（东汉 献帝建安十三年）',
        minLevelName: '良家子',
        desc: '孙权刘备联军在赤壁用火攻击败了曹操挥师南下的水军。曹操的统一梦破碎了，天下三分的雏形正式确立，旷日持久的乱世还在继续。',
        rewards: [{type: 'xp', value: -40}]
    },

    // ===== 第六纪元：魏晋隋唐·融合与登科（共 151 条）=====
    {
        id: 'hist_234', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '九品中正制的确立', time: '公元 220 年（三国 曹魏时期）',
        minLevelName: '割据州牧',
        desc: '曹魏建立，采纳陈群的建议实行“九品中正制”。朝廷派中正官按家世和道德评定人才。你发现出身寒门越来越难当大官，“上品无寒门，下品无势族”的局面开始形成。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_235', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '曹魏代汉与三国鼎立', time: '公元 220 年 - 229 年',
        minLevelName: '割据州牧',
        desc: '曹丕篡汉建立曹魏，随后刘备建蜀汉、孙权建东吴。存在了四百年的大汉帝国彻底落幕，历史正式进入三国鼎立的均势时代。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_236', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '诸葛亮治蜀与南征', time: '公元 220 - 280 年（三国时期）',
        minLevelName: '割据州牧',
        desc: '诸葛亮在蜀汉平定南中叛乱，七擒七纵孟获，并推行屯田、发展蜀锦。你买到了工艺极佳的蜀锦，感受到西南地区的经济正在稳步发展。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_237', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '马钧改进翻车', time: '公元 220 - 265 年（三国 曹魏时期）',
        minLevelName: '割据州牧',
        desc: '机械大师马钧改进了用于农业灌溉的“翻车”（龙骨水车）。你踩着踏板，河水便连绵不断地被抽上高坡的农田，效率惊人！',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_238', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '竹林七贤与魏晋玄学', time: '公元 240 - 265 年（魏晋之际）',
        minLevelName: '割据州牧',
        desc: '司马氏专权，政治恐怖。稽康、阮籍等七位名士隐居竹林，饮酒抚琴，大谈老庄“无为”之理。你旁听了他们的清谈，感受到了魏晋名士超脱世俗的风度。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_239', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '西晋统一全国', time: '公元 280 年（西晋 武帝太康元年）',
        minLevelName: '割据州牧',
        desc: '晋武帝司马炎发兵灭吴，结束了东汉末年以来近百年的大分裂局面。“太康之治”短暂降临，你以为天下终于要永远太平了。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_240', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '八王之乱', time: '公元 291 年 - 306 年',
        minLevelName: '割据州牧',
        desc: '晋惠帝昏庸，西晋皇族内部为了争夺中央政权，爆发了长达十五年的相互攻杀。中原大地再次化为修罗场，西晋王朝的元气被彻底耗尽。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_241', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '五胡内迁与西晋灭亡', time: '公元 316 年（西晋 愍帝建兴四年）',
        minLevelName: '割据州牧',
        desc: '趁着西晋内乱，内迁的匈奴、鲜卑、羯、氐、羌等少数民族纷纷起兵。匈奴大军攻破长安，西晋灭亡，北方陷入了“五胡十六国”的黑暗大乱局。',
        rewards: [{type: 'xp', value: -80}]
    },
    {
        id: 'hist_242', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '衣冠南渡与东晋建立', time: '公元 317 年（东晋 元帝建武元年）',
        minLevelName: '割据州牧',
        desc: '中原大乱，你跟随着大批北方世族和百姓渡过长江逃往江南。司马睿在建康（南京）建立东晋，“王与马，共天下”，门阀士族政治达到了顶峰。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_243', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '祖逖击楫中流', time: '公元 317 - 340 年（东晋初年）',
        minLevelName: '割据州牧',
        desc: '名将祖逖率军北伐，在渡过长江时敲击船桨发誓：“不能清中原而复济者，有如大江！”大批北方流民受其鼓舞，你也拿起了武器准备收复失地。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_244', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '顾恺之画《洛神赋图》', time: '公元 317 - 420 年（东晋时期）',
        minLevelName: '割据州牧',
        desc: '你欣赏到了大画家顾恺之的传世名作，画中人物“以形写神”，线条如春蚕吐丝。魏晋时期的士大夫绘画艺术让你叹为观止。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_245', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '王羲之写《兰亭集序》', time: '公元 353 年（东晋永和九年）',
        minLevelName: '割据州牧',
        desc: '你在会稽山阴的兰亭雅集上，亲眼目睹“书圣”王羲之微醉后挥毫泼墨。那“飘若浮云，矫若惊龙”的行书，成为了天下第一行书！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_246', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '淝水之战', time: '公元 383 年（东晋 孝武帝太元九年）',
        minLevelName: '割据州牧',
        desc: '前秦皇帝苻坚率领八十万大军南下，却在淝水被东晋八万北府兵击溃，“风声鹤唳，草木皆兵”。江南保住了偏安的局面，北方再次陷入大分裂。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_247', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '法显西行求法', time: '公元 399 年（东晋 安帝隆安四年）',
        minLevelName: '割据州牧',
        desc: '年近古稀的东晋高僧法显从长安出发，穿越流沙和葱岭前往天竺求取佛经，后经海路返回。他的《佛国记》为你描绘了真实的西域与印度风貌。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_248', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '陶渊明隐居不仕', time: '公元 400 - 420 年（东晋末年）',
        minLevelName: '割据州牧',
        desc: '彭泽县令陶渊明不愿“为五斗米折腰”，辞官归隐田园。你读着他的“采菊东篱下，悠然见南山”，内心得到了前所未有的宁静。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_249', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '江南地区的开发', time: '公元 317 - 589 年（东晋南朝时期）',
        minLevelName: '割据州牧',
        desc: '大量北方人口南迁，带来了先进的铁农具和技术。你和当地人一起开垦荒地、兴修水利，原本荒凉的江南逐渐变成了“鱼米之乡”。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_250', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '北魏统一北方', time: '公元 439 年（北魏 太武帝太延五年）',
        minLevelName: '割据州牧',
        desc: '鲜卑族拓跋部建立的北魏政权，凭借强悍的骑兵消灭了北方的各个割据势力。北方结束了长达百年的十六国大乱，迎来了相对安定的统一。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_251', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '祖冲之推算圆周率', time: '公元 420 - 479 年（南朝 刘宋时期）',
        minLevelName: '割据州牧',
        desc: '杰出的科学家祖冲之利用“割圆术”，将圆周率精确推算到了小数点后第七位（3.1415926与3.1415927之间）。这比欧洲早了近一千年！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_252', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '贾思勰著《齐民要术》', time: '公元 386 - 550 年（北魏至东魏时期）',
        minLevelName: '割据州牧',
        desc: '你买到了农学家贾思勰编写的《齐民要术》。书中详细总结了北方劳动人民的农业、畜牧业生产经验，这是我国现存最早的一部完整的农书！',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_253', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '郦道元注《水经》', time: '公元 386 - 534 年（北魏时期）',
        minLevelName: '割据州牧',
        desc: '地理学家郦道元以全国水道为纲，写成了《水经注》。你通过这本书不仅了解了各地的山川地貌，还读到了丰富的历史与神话传说。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_254', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '云冈与龙门石窟开凿', time: '公元 386 - 534 年（北魏时期）',
        minLevelName: '割据州牧',
        desc: '北魏皇室崇尚佛教，你在大同和洛阳看到了依山开凿的宏伟石窟。高大的佛像既有印度犍陀罗艺术的风格，又融入了中原的审美。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_255', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '灭佛运动', time: '公元 446 / 574 年（北魏太武帝与北周武帝时期）',
        minLevelName: '割据州牧',
        desc: '因为寺院占有了大量的土地和免税人口，严重影响了国家财政，北方政权爆发了两次大规模的“灭佛”运动。大批僧侣被迫还俗，佛像被毁。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_256', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '均田制的颁布', time: '公元 485 年（北魏太和九年）',
        minLevelName: '割据州牧',
        desc: '北魏朝廷颁布均田令，将国家掌握的荒地按人口分配给农民。你终于有了属于自己的露田和桑田，北方的农业经济迅速复苏。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_257', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '孝文帝汉化改革', time: '公元 490 - 534 年（北魏晚期）',
        minLevelName: '割据州牧',
        desc: '孝文帝下令鲜卑人必须穿汉服、说汉语、改汉姓、与汉族门阀通婚。你在洛阳街头看到，鲜卑贵族和汉族士大夫已经很难从外貌和口音上分辨了。',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_258', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '孝文帝迁都洛阳', time: '公元 494 年（北魏 孝文帝太和十八年）',
        minLevelName: '割据州牧',
        desc: '为了更好地接受汉族先进文化并控制中原，北魏孝文帝以“南伐”为名，力排众议将都城从平城（大同）迁到了洛阳。你跟随朝廷来到了繁华的中原故都。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_259', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '侯景之乱', time: '公元 548 年（南朝梁时期）',
        minLevelName: '割据州牧',
        desc: '降将侯景发动叛乱，攻破建康。曾经“南朝四百八十寺”的繁华江南化为焦土，南朝士族遭到毁灭性打击，南北双方的力量对比彻底逆转。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_260', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '九品中正制的僵化', time: '公元 550 - 589 年（南北朝晚期）',
        minLevelName: '割据州牧',
        desc: '你看透了世家大族对官位的垄断，“世胄蹑高位，英俊沉下僚”。寒门子弟彻底失去了晋升的希望，旧的选官制度已经腐朽不堪，呼唤着新的变革。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_261', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '杨坚建隋', time: '公元 581 年（隋朝 文帝开皇元年）',
        minLevelName: '割据州牧',
        desc: '北周外戚杨坚废除小皇帝，自己称帝，建立隋朝，定都长安（大兴城）。长达数百年的南北朝乱世即将迎来终结。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_262', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '开皇之治', time: '公元 581 - 604 年（隋朝 文帝开皇及仁寿年间）',
        minLevelName: '割据州牧',
        desc: '隋文帝励精图治，厉行节俭，发展农业。你在乡间的感受最深：人口激增，粮食丰收，连国家的粮仓都装不下了。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_263', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '广建大型粮仓', time: '公元 581 - 604 年（隋朝 文帝开皇及仁寿年间）',
        minLevelName: '割据州牧',
        desc: '朝廷在各地修建了含嘉仓、洛口仓等巨大粮仓。你作为运粮民夫，看到这些粮仓储藏的粮食足够天下人吃上几十年，深感国家富足。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_264', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '营建大兴城', time: '公元 581 - 600 年（隋朝初年）',
        minLevelName: '割据州牧',
        desc: '建筑大师宇文恺主持修建了宏伟的首都——大兴城（即后来的唐长安城）。城市布局严整，中轴对称，你在这里见证了世界级大都会的崛起。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_265', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '三省六部制的确立', time: '公元 581 - 600 年（隋朝初年）',
        minLevelName: '割据州牧',
        desc: '隋朝正式确立了中书省、门下省、尚书省及六部制度。相权被一分为三，相互牵制。你发现朝廷的行政效率更高了，皇权也更稳固了。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_266', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '废除九品中正制', time: '公元 581 - 604 年（隋朝 文帝开皇及仁寿年间）',
        minLevelName: '割据州牧',
        desc: '隋文帝下令废除看重门第出身的“九品中正制”，开始用分科考试的方法选拔官员。作为寒门子弟，你终于看到了一丝做官的曙光。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_267', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '隋灭陈统一全国', time: '公元 589 年（隋朝 文帝开皇九年）',
        minLevelName: '割据州牧',
        desc: '隋军南下灭掉南朝的最后一个政权——陈朝。自西晋灭亡以来，近三百年的大分裂局面宣告结束，天下再次一统！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_268', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '创立进士科', time: '公元 605 年（隋炀帝大业元年）',
        minLevelName: '割据州牧',
        desc: '隋炀帝正式设立“进士科”，考核参选者的才学。这标志着【科举制】的正式诞生！你立刻捧起书本，准备“朝为田舍郎，暮登天子堂”。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_269', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '营建东都洛阳', time: '公元 605 年（隋炀帝大业元年）',
        minLevelName: '割据州牧',
        desc: '为了加强对关东和江南的控制，隋炀帝每月役使两百万人营建东都洛阳。奢华的宫殿拔地而起，但沉重的徭役压得你喘不过气。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_270', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '开凿大运河', time: '公元 605 年起（隋朝 炀帝大业年间）',
        minLevelName: '割据州牧',
        desc: '以洛阳为中心，北达涿郡，南至余杭。你被强征去挖掘这条贯通海河、黄河、淮河、长江、钱塘江的古代世界最长运河，两岸遍布劳工的尸骨。',
        rewards: [{type: 'xp', value: -30}, {type: 'gold', value: 60}]
    },
    {
        id: 'hist_271', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '赵州桥落成', time: '公元 605 - 618 年（隋朝 炀帝大业年间）',
        minLevelName: '割据州牧',
        desc: '工匠李春设计并主持建造了赵州桥。这是世界上现存最古老的单孔敞肩石拱桥，历经千年风雨而不倒，你走在桥上，惊叹于其巧夺天工。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_272', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '隋炀帝下江都', time: '公元 605 - 618 年（隋朝 炀帝大业年间）',
        minLevelName: '割据州牧',
        desc: '隋炀帝乘坐极其奢华的龙舟，带着庞大的船队沿大运河巡游江都（扬州）。沿岸百姓被勒令供应食物，倾家荡产，民怨沸腾。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_273', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '隋末农民起义', time: '公元 611 年起（隋朝 炀帝大业年间）',
        minLevelName: '割据州牧',
        desc: '翟让、李密领导的瓦岗军在中原开仓放粮。不堪忍受暴政的百姓纷纷揭竿而起，隋朝的统治土崩瓦解，你加入了起义的洪流。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_274', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '三征高句丽', time: '公元 612 年起（隋朝 炀帝大业年间）',
        minLevelName: '割据州牧',
        desc: '隋炀帝倾全国之力，连续三次发动对高句丽的战争。兵役和徭役繁重到了极点，“天下死于役而家破者十室九空”，你为了躲避兵役只能逃亡。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_275', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '晋阳起兵', time: '公元 617 年（隋炀帝 大业十三年）',
        minLevelName: '割据州牧',
        desc: '隋朝末年天下大乱，你追随唐国公李渊在太原起兵。大军势如破竹，直指长安，乱世中你看到了建功立业的希望。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_276', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '瓦岗军壮大', time: '公元 617 年（隋炀帝 大业十三年）',
        minLevelName: '割据州牧',
        desc: '你听闻李密领导的瓦岗军在中原大败隋军，开仓放粮，许多饱受战乱之苦的百姓纷纷前去投奔。',
        rewards: [{type: 'xp', value: 20}]
    },
    {
        id: 'hist_277', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '江都兵变与隋亡', time: '公元 618 年（唐朝 高祖武德元年）',
        minLevelName: '割据州牧',
        desc: '禁军将领宇文化及在江都发动兵变，缢杀隋炀帝。曾经强盛一时的隋朝，仅仅历经两代37年便宣告灭亡，天下再次陷入群雄割据。',
        rewards: [{type: 'xp', value: -80}]
    },
    {
        id: 'hist_278', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '虎牢关之战', time: '公元 621 年（唐朝 唐高祖 武德四年）',
        minLevelName: '割据州牧',
        desc: '秦王李世民率领玄甲军，在虎牢关以三千五百骑兵大破十万大军。大唐一统天下的格局就此奠定！',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_279', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '设立弘文馆', time: '公元 621 年（唐朝 唐高祖 武德四年）',
        minLevelName: '割据州牧',
        desc: '秦王李世民设立文学馆（后改弘文馆），招揽十八学士。你作为旁听书生，感受到了极其浓厚的学术氛围。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_280', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '均田制的推行', time: '公元 624 年（唐朝 唐高祖 武德七年）',
        minLevelName: '割据州牧',
        desc: '朝廷颁布均田令，按人口分配土地。你家分到了几十亩口分田和永业田，终于有了安身立命的根本。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_281', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '租庸调制的实施', time: '公元 624 年（唐朝 唐高祖 武德七年）',
        minLevelName: '割据州牧',
        desc: '配合均田制，朝廷实行“有田则有租，有家则有调，有身则有庸”。你用绢帛代替了劳役，有了更多时间务农。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_282', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '玄武门之变', time: '公元 626 年（唐朝 唐高祖 武德九年）',
        minLevelName: '割据州牧',
        desc: '清晨的长安城大门紧闭，玄武门外传来刀剑相交的惨叫。秦王李世民诛杀太子，夺取了皇位，城中人心惶惶。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_283', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '渭水之盟', time: '公元 626 年（唐朝 唐高祖 武德九年 / 唐太宗即位初）',
        minLevelName: '割据州牧',
        desc: '突厥大军兵临长安城下，唐太宗被迫在渭水桥上斩白马结盟，倾尽国库财物才换得敌人退兵。这是大唐早期的屈辱。',
        rewards: [{type: 'gold', value: -20}]
    },
    {
        id: 'hist_284', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '三省六部制的完善', time: '公元 627 年起（唐朝 唐太宗 贞观初年）',
        minLevelName: '割据州牧',
        desc: '朝廷中枢分为中书、门下、尚书三省，你所在部门的政令流转更加规范高效，减少了决策失误。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_285', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '羁縻府州制度', time: '公元 627 - 649 年（唐朝 太宗贞观年间）',
        minLevelName: '割据州牧',
        desc: '朝廷在周边少数民族地区设立羁縻府州，以当地首领为都督、刺史。你看到边疆管理既灵活又有效。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_286', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '平定东突厥与天可汗', time: '公元 630 年（唐朝 唐太宗 贞观四年）',
        minLevelName: '割据州牧',
        desc: '唐军大破东突厥生擒颉利可汗。四方少数民族首领齐聚长安，尊奉太宗为“天可汗”，各族间的交流更加紧密了。',
        rewards: [{type: 'xp', value: 60}, {type: 'gold', value: 15}]
    },
    {
        id: 'hist_287', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '参天可汗道开通', time: '公元 630 年代（唐朝 太宗贞观年间）',
        minLevelName: '割据州牧',
        desc: '为了方便各族朝贡，太宗下令开辟了从长安直达大漠的“参天可汗道”，沿途设立驿站。你的商队往来大漠安全多了。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_288', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '扩充国学与科举', time: '公元 630 年代（唐朝 太宗贞观年间）',
        minLevelName: '割据州牧',
        desc: '太宗扩充国子监，增加科举录取人数。你看到新科进士鱼贯而出，听闻太宗笑言“天下英雄入吾彀中矣”。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_289', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '魏征直言极谏', time: '公元 630 年代（唐朝 太宗贞观年间）',
        minLevelName: '割据州牧',
        desc: '你在朝堂上目睹了魏征犯颜直谏，惹得太宗大怒。但最终太宗纳谏如流，将魏征比作“知得失”的铜镜。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_290', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '房谋杜断', time: '公元 627 - 649 年（唐朝 太宗贞观年间）',
        minLevelName: '割据州牧',
        desc: '尚书左仆射房玄龄善于谋略，右仆射杜如晦处事果断。你见证了两位贤相默契配合，朝政运转如臂使指。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_291', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '褚遂良楷书', time: '公元 627 - 649 年（唐朝 太宗贞观年间）',
        minLevelName: '割据州牧',
        desc: '你临摹了起居郎褚遂良的字帖，其楷书丰艳流畅，变化多姿，让你对初唐书法的气象有了更深的体会。',
        rewards: [{type: 'xp', value: 20}]
    },
    {
        id: 'hist_292', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '击败吐谷浑', time: '公元 635 年（唐朝 唐太宗 贞观九年）',
        minLevelName: '割据州牧',
        desc: '名将李靖率军长途奔袭，大破盘踞在青海一带的吐谷浑。通往西域的南路终于被打通了。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_293', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '昭陵六骏石刻', time: '公元 636 年（唐朝 唐太宗 贞观十年）',
        minLevelName: '割据州牧',
        desc: '你参与了太宗陵墓的修筑，工匠们将太宗南征北战时骑乘的六匹战马雕刻在石板上，姿态雄健，栩栩如生。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_294', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '设立安西都护府', time: '公元 640 年（唐朝 唐太宗 贞观十四年）',
        minLevelName: '割据州牧',
        desc: '唐朝在西域交河故城设立安西都护府。作为官员，你参与了西域都护的军政调度，丝绸之路的咽喉得以巩固。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_295', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '《步辇图》创作', time: '公元 640 年（唐朝 唐太宗 贞观十四年）',
        minLevelName: '割据州牧',
        desc: '吐蕃使臣禄东赞来迎娶文成公主，大画家阎立本将太宗接见使臣的画面画了下来。你作为宫廷画师助手，见证了这幅名作的诞生。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_296', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '文成公主入藏', time: '公元 641 年（唐朝 唐太宗 贞观十五年）',
        minLevelName: '割据州牧',
        desc: '吐蕃赞普松赞干布遣使求婚，太宗将文成公主嫁入吐蕃。你目送浩浩荡荡的送亲队伍带去了丰厚的工匠和典籍。',
        rewards: [{type: 'xp', value: 60}, {type: 'gold', value: -10}]
    },
    {
        id: 'hist_297', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '玄奘西行归来', time: '公元 645 年（唐朝 唐太宗 贞观十九年）',
        minLevelName: '割据州牧',
        desc: '历经十九载，玄奘法师带着大量佛经从天竺回到长安。皇帝下令建造大雁塔以存放经书，万人空巷迎接。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_298', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '大雁塔落成', time: '公元 652 年（唐朝 唐高宗 永徽三年）',
        minLevelName: '割据州牧',
        desc: '为了保存玄奘带回的经卷佛像，长安城慈恩寺内修筑了一座五层砖塔。你登塔远眺，长安繁华尽收眼底。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_299', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '孙思邈著《千金方》', time: '公元 652 年（唐朝 唐高宗 永徽三年）',
        minLevelName: '割据州牧',
        desc: '你拜读了“药王”孙思邈编纂的《备急千金要方》，里面记载了海量医方，你用其中的草药治好了家人的热病。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_300', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '《唐律疏议》颁布', time: '公元 653 年（唐朝 唐高宗 永徽四年）',
        minLevelName: '割据州牧',
        desc: '朝廷颁布了我国现存最早、最为完整的封建法典。你研读后发现，法律条文深受儒家伦理道德的影响，体现了礼法结合。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_301', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '《新修本草》颁行', time: '公元 659 年（唐朝 唐高宗 显庆四年）',
        minLevelName: '割据州牧',
        desc: '朝廷组织苏敬等人编修了《新修本草》，这是世界上第一部由国家颁布的药典。你购买了一部用于识药治病。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_302', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '初唐四杰崛起', time: '公元 650 - 705 年（唐朝 高宗至武后时期）',
        minLevelName: '割据州牧',
        desc: '王勃、杨炯、卢照邻、骆宾王四位才子名声大噪。你吟诵着“落霞与孤鹜齐飞”，感受到唐诗正在突破六朝的靡丽之风。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_303', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '灭亡高句丽', time: '公元 668 年（唐朝 唐高宗 总章元年）',
        minLevelName: '割据州牧',
        desc: '大将李勣率领唐军攻克平壤，历经隋唐两朝、数代帝王的征讨终于结束，高句丽宣告灭亡，辽东划入版图。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_304', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '骆宾王《讨武曌檄》', time: '公元 684 年（唐朝 武则天 光宅元年）',
        minLevelName: '割据州牧',
        desc: '徐敬业在扬州起兵反武，骆宾王写下讨伐檄文。连武则天读后都惊叹其才华，责备宰相没有及早任用他。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_305', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '武后称帝', time: '公元 690 年（武周 天授元年）',
        minLevelName: '割据州牧',
        desc: '武则天正式登基，改国号为周。她大力提拔寒门庶族，你的多位有才华的朋友都因此得到了破格录用。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_306', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '酷吏政治', time: '公元 690 年代（武周时期）',
        minLevelName: '割据州牧',
        desc: '来俊臣、索元礼等酷吏大行其道，罗织罪名陷害忠良。你在朝中如履薄冰，生怕说错一句话引来杀身之祸。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_307', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '狄仁杰拜相', time: '公元 691 年（武周 天授二年）',
        minLevelName: '割据州牧',
        desc: '杰出政治家狄仁杰被任命为宰相，他犯颜直谏，保护了众多李唐宗室和无辜大臣。朝堂风气稍有缓和。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_308', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '殿试与武举的创立', time: '公元 702 年（武周 长安二年）',
        minLevelName: '割据州牧',
        desc: '武则天亲自在洛城殿面试贡士，并首创武举选拔军事人才。你凭借一身武功和文采，获得了女皇的赏识。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_309', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '设立北庭都护府', time: '公元 702 年（武周 长安二年）',
        minLevelName: '割据州牧',
        desc: '朝廷设立北庭都护府，与安西都护府分治天山南北。大唐对西域的管辖更加严密，商旅的往来也更加安全了。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_310', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '神龙政变', time: '公元 705 年（武周 神龙元年）',
        minLevelName: '割据州牧',
        desc: '张柬之等人发动兵变，逼迫八十二岁的武则天退位，迎立唐中宗复辟。李唐皇室终于重掌大权。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_311', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '设立节度使', time: '公元 711 年起（唐朝 唐睿宗 景云二年首设河西节度使）',
        minLevelName: '割据州牧',
        desc: '为了巩固边防，朝廷设立了掌握军政大权的节度使。你看着日益骄横的边将，心中隐隐感到不安。',
        rewards: [{type: 'xp', value: -15}]
    },
    {
        id: 'hist_312', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '册封渤海郡王', time: '公元 713 年（唐朝 唐玄宗 开元元年）',
        minLevelName: '割据州牧',
        desc: '玄宗册封靺鞨族首领大祚荣为渤海郡王。东北边疆建立起了臣服于唐朝的地方政权，被称为“海东盛国”。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_313', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '开元盛世', time: '公元 713 年 - 741 年（唐朝 唐玄宗 开元元年至二十九年）',
        minLevelName: '割据州牧',
        desc: '天下太平，物价低廉，公私仓廪皆满。作为朝廷官员，你走在繁华的朱雀大街上，感受着万邦来朝的自豪感。',
        rewards: [{type: 'xp', value: 80}, {type: 'gold', value: 20}]
    },
    {
        id: 'hist_314', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '梨园子弟', time: '公元 714 年（唐朝 唐玄宗 开元二年）',
        minLevelName: '割据州牧',
        desc: '玄宗在禁苑设立“梨园”，亲自教授数百名乐工弹奏法曲。你作为梨园子弟之一，见证了大唐最高水准的音乐排练。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_315', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '广州设立市舶使', time: '公元 714 年（唐朝 唐玄宗 开元二年）',
        minLevelName: '割据州牧',
        desc: '朝廷在广州首次设立市舶使，专门管理海外贸易。你看到满载香料、宝石的大食商船源源不断地驶入港口。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_316', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '遣唐使阿倍仲麻吕来华', time: '公元 717 年（唐朝 唐玄宗 开元五年）',
        minLevelName: '割据州牧',
        desc: '大批日本遣唐使抵达长安，你结识了才华横溢的阿倍仲麻吕（晁衡），两人吟诗作对，结下深厚友谊。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_317', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '姚崇宋璟辅政', time: '公元 713 - 720 年（唐朝 玄宗开元初年）',
        minLevelName: '割据州牧',
        desc: '玄宗任用姚崇、宋璟为相，整顿吏治，淘汰冗官冗员。朝政为之一新，开元盛世的根基正在被夯实。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_318', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '张旭狂草', time: '公元 713 - 756 年（唐朝 玄宗开元及天宝年间）',
        minLevelName: '割据州牧',
        desc: '“草圣”张旭酒后挥毫，如醉如狂，写出的草书犹如云烟变幻。你得到他的一幅墨宝，如获至宝。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_319', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '王维山水诗', time: '公元 713 - 756 年（唐朝 玄宗开元及天宝年间）',
        minLevelName: '割据州牧',
        desc: '你拜读了太乐丞王维的诗作，“明月松间照，清泉石上流”，其诗中有画，画中有诗的空灵意境让你心旷神怡。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_320', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '孟浩然田园诗', time: '公元 713 - 756 年（唐朝 玄宗开元及天宝年间）',
        minLevelName: '割据州牧',
        desc: '隐居襄阳的孟浩然写下“气蒸云梦泽，波撼岳阳城”。他终生不仕，却用清新的田园诗歌丰富了大唐的文学版图。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_321', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '吴道子《送子天王图》', time: '公元 713 - 756 年（唐朝 玄宗开元及天宝年间）',
        minLevelName: '割据州牧',
        desc: '“画圣”吴道子首创“莼菜条”描法，画中人物衣带飘举，犹如被风吹起，人称“吴带当风”。你的绘画技法深受启发。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_322', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '《霓裳羽衣曲》风靡', time: '公元 742 - 756 年（唐朝 玄宗天宝年间）',
        minLevelName: '割据州牧',
        desc: '皇宫传出玄宗结合西域音调新制的乐曲，贵妃亲自伴舞。曲调宛如天籁，你在墙外听得如痴如醉。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_323', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '王昌龄边塞诗', time: '公元 742 - 756 年（唐朝 玄宗天宝年间）',
        minLevelName: '割据州牧',
        desc: '“黄沙百战穿金甲，不破楼兰终不还。”王昌龄的七绝边塞诗豪迈悲壮，极大地鼓舞了唐军将士的士气。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_324', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '岑参高适边塞诗', time: '公元 742 - 756 年（唐朝 玄宗天宝年间）',
        minLevelName: '割据州牧',
        desc: '岑参和高适远赴边疆，写下了“忽如一夜春风来，千树万树梨花开”等壮丽诗篇。大唐的豪情被铭刻在冰雪荒漠之中。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_325', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '颜真卿创“颜体”', time: '公元 750 年代（唐朝 玄宗天宝年间）',
        minLevelName: '割据州牧',
        desc: '你临摹了平原太守颜真卿的字帖，其笔画丰满圆润，端庄雄伟，透出一种大唐盛世独有的雍容气度。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_326', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '唐三彩风靡', time: '公元 713 - 755 年（唐朝 盛唐时期）',
        minLevelName: '割据州牧',
        desc: '丝绸之路上的骆驼、胡人被烧制成了色彩斑斓的陶器。你买了一个黄绿白相间的三彩马摆在案头，极具异域风情。',
        rewards: [{type: 'xp', value: 25}]
    },
    {
        id: 'hist_327', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '南青北白瓷器繁荣', time: '公元 713 - 755 年（唐朝 盛唐时期）',
        minLevelName: '割据州牧',
        desc: '你逛集市时发现，越窑的青瓷如冰似玉，邢窑的白瓷如银似雪，大唐的制瓷工艺已到了炉火纯青的地步。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_328', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '僧一行测定子午线', time: '公元 724 年（唐朝 唐玄宗 开元十二年）',
        minLevelName: '割据州牧',
        desc: '杰出的天文学家僧一行发起全国性的大规模天文测量，首次算出了地球子午线一度的长度。他的科学精神让你十分敬佩。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_329', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '张九龄罢相', time: '公元 736 年（唐朝 唐玄宗 开元二十四年）',
        minLevelName: '割据州牧',
        desc: '刚直不阿的张九龄被李林甫排挤罢相。朝堂上的贤臣逐渐减少，“口蜜腹剑”的李林甫把持朝政，盛世出现隐患。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_330', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '册封云南王', time: '公元 738 年（唐朝 唐玄宗 开元二十六年）',
        minLevelName: '割据州牧',
        desc: '玄宗册封南诏首领皮罗阁为云南王。南诏政权在西南边陲逐渐强大，与中央保持着密切的朝贡关系。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_331', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '李白供奉翰林', time: '公元 742 年（唐朝 唐玄宗 天宝元年）',
        minLevelName: '割据州牧',
        desc: '“仰天大笑出门去，我辈岂是蓬蒿人。”你听说狂客李白被召入宫廷，在沉香亭畔醉草吓蛮书，长安的诗风因他而浪漫至极。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_332', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '册封怀仁可汗', time: '公元 744 年（唐朝 唐玄宗 天宝三载）',
        minLevelName: '割据州牧',
        desc: '朝廷正式册封回纥首领骨力裴罗为怀仁可汗。北方边境迎来了一段相对和平的互市贸易期。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_333', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '曲辕犁与筒车普及', time: '公元 8 世纪初（唐朝中前期）',
        minLevelName: '割据州牧',
        desc: '你家换上了转向灵活的曲辕犁，江畔也架起了自动汲水的巨大筒车。农业生产力实现了飞跃！',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_334', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '长安坊市制度严格', time: '公元 7 世纪末 - 8 世纪中（唐朝中前期）',
        minLevelName: '割据州牧',
        desc: '长安城实行严格的坊市分离，市有固定的交易时间。你每天必须在暮鼓敲响前赶回居住的坊内，否则便触犯夜禁律例。',
        rewards: [{type: 'xp', value: -10}]
    },
    {
        id: 'hist_335', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '羁縻政策的深化', time: '公元 7 世纪末 - 8 世纪中（唐朝中前期）',
        minLevelName: '割据州牧',
        desc: '朝廷对周边少数民族实行“因其俗而治之”的羁縻政策。你在鸿胪寺见到了许多身着异族服饰的使节和首领。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_336', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '胡旋舞盛行', time: '公元 762 - 827 年（唐朝 中唐时期）',
        minLevelName: '割据州牧',
        desc: '深受西域文化影响，长安酒肆里的舞女们在圆毯上飞速旋转，这是当时最流行的“胡旋舞”，你也忍不住跟着节奏打拍子。',
        rewards: [{type: 'xp', value: 20}]
    },
    {
        id: 'hist_337', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '马球运动风靡', time: '公元 762 - 827 年（唐朝 中唐时期）',
        minLevelName: '割据州牧',
        desc: '大唐皇室和贵族们对打马球（波罗球）陷入狂热，你在球场边看他们纵马挥杆，尘土飞扬，比赛极其激烈。',
        rewards: [{type: 'xp', value: 15}]
    },
    {
        id: 'hist_338', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '扬州造船业兴盛', time: '公元 762 - 827 年（唐朝 中唐时期）',
        minLevelName: '割据州牧',
        desc: '你来到江南经济中心扬州，江边的造船厂热火朝天，能载重数万石的大型木船在这里下水，准备驶向远洋。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_339', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '广州设立“蕃坊”', time: '公元 762 - 827 年（唐朝 中唐时期）',
        minLevelName: '割据州牧',
        desc: '朝廷在广州划定区域供阿拉伯、波斯等国商人集中居住，称为“蕃坊”。你在那里不仅能买到香料，还能吃到中东烤肉。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_340', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '大唐与渤海国贸易', time: '公元 762 - 827 年（唐朝 中唐时期）',
        minLevelName: '割据州牧',
        desc: '你跟随商队前往东北的渤海国，用丝绸和瓷器换回了上等人参、貂皮。被称为“海东盛国”的渤海国深受唐文化影响。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_341', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '公主和亲常态化', time: '公元 762 - 827 年（唐朝 中唐时期）',
        minLevelName: '割据州牧',
        desc: '为了换取边境和平或借兵平叛，朝廷频繁将公主嫁给回纥等族首领。你深感和亲政策背后是国家实力的衰弱。',
        rewards: [{type: 'xp', value: -10}]
    },
    {
        id: 'hist_342', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '怛罗斯之战', time: '公元 751 年（唐朝 唐玄宗 天宝十载）',
        minLevelName: '割据州牧',
        desc: '唐朝安西都护府的军队在中亚与阿拉伯帝国发生激战。虽然唐军战败，但被俘的唐朝工匠却将造纸术传向了西方。',
        rewards: [{type: 'xp', value: -30}, {type: 'xp', value: 50}]
    },
    {
        id: 'hist_343', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '鉴真东渡', time: '公元 754 年（唐朝 唐玄宗 天宝十三载）',
        minLevelName: '割据州牧',
        desc: '历经六次挫折，双目失明的鉴真法师终于成功抵达日本，传播佛法与大唐的医药建筑。你被他坚韧不拔的精神深深震撼。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_344', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '安史之乱爆发', time: '公元 755 年（唐朝 唐玄宗 天宝十四载）',
        minLevelName: '割据州牧',
        desc: '渔阳鼙鼓动地来，惊破霓裳羽衣曲！安禄山起兵造反，战火瞬间席卷中原，繁华的长安城沦为焦土。',
        rewards: [{type: 'xp', value: -100}, {type: 'gold', value: -30}]
    },
    {
        id: 'hist_345', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '哥舒翰兵败潼关', time: '公元 756 年（唐朝 唐玄宗 天宝十五载）',
        minLevelName: '割据州牧',
        desc: '玄宗听信谗言强令哥舒翰出击，结果二十万唐军在灵宝全军覆没，潼关失守，长安门户洞开。你随着逃难的队伍疯狂奔逃。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_346', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '马嵬驿之变', time: '公元 756 年（唐朝 唐玄宗 天宝十五载 / 唐肃宗 至德元载）',
        minLevelName: '割据州牧',
        desc: '随玄宗逃亡蜀地途中，六军不发，杨贵妃被迫在马嵬坡自缢身亡。你目睹了帝国的无力与悲凉。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_347', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '睢阳保卫战', time: '公元 757 年（唐朝 唐肃宗 至德二载）',
        minLevelName: '割据州牧',
        desc: '张巡、许远死守睢阳城长达十个月，阻挡了叛军南下江淮的步伐。虽然城破人亡，但满城忠烈的气节震撼了你。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_348', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '郭子仪收复两京', time: '公元 757 年（唐朝 唐肃宗 至德二载）',
        minLevelName: '割据州牧',
        desc: '名将郭子仪、李光弼率领唐军联合回纥兵，接连收复长安、洛阳两京。你在废墟中迎接唐军，喜极而泣。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_349', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '杜甫创作“三吏三别”', time: '公元 759 年（唐朝 唐肃宗 乾元二年）',
        minLevelName: '割据州牧',
        desc: '战火纷飞中，你读到了杜甫沉郁顿挫的诗句，句句都在描写百姓的苦难与流离。诗史之名，实至名归。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_350', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '吐蕃攻陷长安', time: '公元 763 年（唐朝 唐代宗 广德元年）',
        minLevelName: '割据州牧',
        desc: '安史之乱刚平，吐蕃大军趁虚而入，短暂攻陷了长安城。代宗仓皇逃奔陕州，大唐的国威一落千丈。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_351', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '两税法的实行', time: '公元 780 年（唐朝 唐德宗 建中元年）',
        minLevelName: '割据州牧',
        desc: '宰相杨炎推行两税法，“唯以资产为宗，不以丁身为本”。你发现户部的税收管理变简单了，人身控制也有所放松。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_352', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '陆羽撰《茶经》', time: '公元 780 年代（唐朝 唐代宗至德宗时期）',
        minLevelName: '割据州牧',
        desc: '隐士陆羽系统总结了种茶、制茶、饮茶的经验。民间饮茶之风大盛，你也开始学着在家中煎茶品茗。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_353', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '陆贽起草诏书', time: '公元 780 年代（唐朝 德宗时期）',
        minLevelName: '割据州牧',
        desc: '翰林学士陆贽才华横溢，德宗流亡期间的所有诏书皆由他起草，辞藻恳切，感动了无数叛将归降。你拜读后深受触动。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_354', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '大秦景教流行中国碑', time: '公元 781 年（唐朝 唐德宗 建中二年）',
        minLevelName: '割据州牧',
        desc: '你在长安城看到了一块刻着叙利亚文和汉文的石碑，记载了基督教分支“景教”在唐朝传播的历史，感叹大唐的包容。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_355', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '杜佑编撰《通典》', time: '公元 801 年（唐朝 唐德宗 贞元十七年）',
        minLevelName: '割据州牧',
        desc: '宰相杜佑历时三十余年编撰完成了中国第一部记述历代典章制度的通史《通典》。作为史官，你将其奉为圭臬。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_356', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '柳宗元贬谪永州', time: '公元 805 年（唐朝 唐顺宗 永贞元年）',
        minLevelName: '割据州牧',
        desc: '王叔文改革失败，柳宗元被贬为永州司马。在那片蛮荒之地，他写下了凄清幽邃的《永州八记》，你读之落泪。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_357', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '韩愈古文运动', time: '公元 810 年代（唐朝 宪宗元和年间）',
        minLevelName: '割据州牧',
        desc: '“文以载道”，韩愈、柳宗元提倡恢复先秦两汉的散文传统，反对华而不实的骈文。你也开始尝试用平实的文字写作了。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_358', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '刘禹锡咏史诗', time: '公元 810 年代（唐朝 宪宗元和年间）',
        minLevelName: '割据州牧',
        desc: '“旧时王谢堂前燕，飞入寻常百姓家。”刘禹锡的咏史诗借古讽今，充满了对历史兴亡的深沉感慨。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_359', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '李贺浪漫诗作', time: '公元 810 年代（唐朝 宪宗元和年间）',
        minLevelName: '割据州牧',
        desc: '“诗鬼”李贺留下了“黑云压城城欲摧”的奇诡诗句。他英年早逝，但其浪漫主义色彩让大唐诗坛多了一抹异色。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_360', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '飞钱的出现', time: '公元 811 年（唐朝 宪宗元和六年）',
        minLevelName: '割据州牧',
        desc: '长安城的商贾为了避免长途携带大量铜钱的危险，发明了类似汇票的纸质“飞钱”。你在异地凭纸券即可兑换钱币，交易大为便利。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_361', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '薛涛创制薛涛笺', time: '公元 810 年代（唐朝 中晚唐时期）',
        minLevelName: '割据州牧',
        desc: '蜀中才女薛涛利用木芙蓉皮制作了颜色淡红、小巧精致的诗笺。你用高价买下几沓，专门用来抄写情诗献给心上人。',
        rewards: [{type: 'gold', value: 20}]
    },
    {
        id: 'hist_362', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '传奇小说兴起', time: '公元 9 世纪（唐朝 中晚唐时期）',
        minLevelName: '割据州牧',
        desc: '市井间开始流传《莺莺传》《长恨歌传》等文言短篇小说（传奇）。你在茶馆里听得津津有味，大唐的叙事文学成熟了。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_363', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '柳公权创“柳体”', time: '公元 820 年代（唐朝 中晚唐时期）',
        minLevelName: '割据州牧',
        desc: '你学习了柳公权的书法，其字骨力遒劲，结构严谨。与颜真卿并称“颜筋柳骨”，成为后世书法的楷模。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_364', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '牛李党争', time: '公元 820 - 840 年代（唐朝 中后期）',
        minLevelName: '割据州牧',
        desc: '朝廷中以牛僧孺和李德裕为首的两大官僚集团互相倾轧。你无意中卷入了党争，惨遭贬谪出京。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_365', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '扬一益二的繁华', time: '公元 9 世纪（唐朝 中后期）',
        minLevelName: '割据州牧',
        desc: '天下大乱之后，南方经济逐渐超越北方。你来到扬州，只见夜市千灯照碧云，商贾如云，繁华程度甚至超过了长安。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_366', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '邢窑白瓷畅销', time: '公元 9 世纪（唐朝 中晚唐时期）',
        minLevelName: '割据州牧',
        desc: '你在市场上批售了大量的邢窑白瓷，底部还刻着“盈”字款。这些瓷器深受胡商喜爱，让你大赚了一笔。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_367', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '大运河经济带成型', time: '公元 762 - 907 年（唐朝 中晚唐时期）',
        minLevelName: '割据州牧',
        desc: '虽然北方战乱，但依托大运河，楚州、扬州等沿线城市却畸形繁荣。你顺着运河做漕运生意，见证了古代中国水运网络的力量。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_368', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '唐蕃会盟碑落成', time: '公元 823 年（唐朝 唐穆宗 长庆三年）',
        minLevelName: '割据州牧',
        desc: '唐朝与吐蕃在拉萨大昭寺门前立下会盟碑，相约“患难相恤，暴掠不作”。西南边境终于迎来了久违的和平。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_369', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '仇士良乱政', time: '公元 830 - 840 年代（唐朝 文宗至武宗时期）',
        minLevelName: '割据州牧',
        desc: '大宦官仇士良手握神策军禁军大权，甚至公开教导其他宦官如何蛊惑皇帝、把持朝政。大唐的天黑了。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_370', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '甘露之变', time: '公元 835 年（唐朝 唐文宗 大和九年）',
        minLevelName: '割据州牧',
        desc: '唐文宗密谋诛杀宦官失败，引发宦官疯狂屠杀朝廷百官。大批清流官员倒在血泊中，朝政彻底被宦官把持。',
        rewards: [{type: 'xp', value: -80}]
    },
    {
        id: 'hist_371', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '会昌灭佛', time: '公元 845 年（唐朝 唐武宗 会昌五年）',
        minLevelName: '割据州牧',
        desc: '为了解决财政危机，唐武宗下令拆毁大量佛寺，勒令僧尼还俗，没收寺院土地。你家附近的寺庙被改建成了官署。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_372', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '雕版印刷《金刚经》', time: '公元 868 年（唐朝 唐懿宗 咸通九年）',
        minLevelName: '割据州牧',
        desc: '你在书肆重金买到了一卷带有精美佛像插图的《金刚经》，这是世界上现存最早的、有确切日期的雕版印刷品！',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_373', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '庞勋起义', time: '公元 868 年（唐朝 唐懿宗 咸通九年）',
        minLevelName: '割据州牧',
        desc: '徐泗戍兵在桂林哗变，推举庞勋为首领一路北上攻破徐州。虽然起义被镇压，但敲响了大唐崩溃的丧钟。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_374', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '黄巢起义', time: '公元 875 年 - 880 年（唐朝 唐僖宗时期）',
        minLevelName: '割据州牧',
        desc: '“满城尽带黄金甲”，黄巢大军攻破长安。百年的世家大族在战火中灰飞烟灭，大唐王朝彻底走向了尽头。',
        rewards: [{type: 'xp', value: -80}, {type: 'gold', value: -20}]
    },
    {
        id: 'hist_375', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '晚唐“小李杜”', time: '公元 840 年代（唐朝 晚期）',
        minLevelName: '割据州牧',
        desc: '李商隐与杜牧成为了晚唐诗坛的绝唱。你读着“春蚕到死丝方尽”与“商女不知亡国恨”，感受到了盛世没落前的一抹余晖。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_376', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '越窑秘色瓷上贡', time: '公元 827 - 907 年（唐朝 晚唐时期）',
        minLevelName: '割据州牧',
        desc: '只有皇家才能使用的“秘色瓷”在越窑烧制成功。你偷偷看了一眼上贡的车队，那瓷器如同千峰翠色一般迷人。',
        rewards: [{type: 'xp', value: 20}]
    },
    {
        id: 'hist_377', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '晚唐坊市界限松动', time: '公元 827 - 907 年（唐朝 晚唐时期）',
        minLevelName: '割据州牧',
        desc: '曾经森严的长安坊市墙垣年久失修，一些商铺开始沿街开门营业，朝廷也无力严格管辖。你的小生意做起来更方便了。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_378', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '夜市与草市的兴起', time: '公元 827 - 907 年（唐朝 晚唐时期）',
        minLevelName: '割据州牧',
        desc: '不仅有了夜市，你在城外的水陆交汇处还看到了自发形成的“草市”。深夜喝上一碗草市里的热汤，驱散了冬日的严寒。',
        rewards: [{type: 'gold', value: 25}]
    },
    {
        id: 'hist_379', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '饮茶风俗普及民间', time: '公元 827 - 907 年（唐朝 晚唐时期）',
        minLevelName: '割据州牧',
        desc: '“茶为食物，无异米盐”，饮茶彻底从贵族的雅好变成了普通百姓每天的生活必需。你在街头茶摊花几文钱就能解渴。',
        rewards: [{type: 'xp', value: 10}]
    },
    {
        id: 'hist_380', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '漕运受阻关中饥荒', time: '公元 827 - 907 年（唐朝 晚唐时期）',
        minLevelName: '割据州牧',
        desc: '藩镇割据导致汴水大运河的漕运断绝，江南的粮食运不到长安。关中爆发严重饥荒，你不得不忍饥挨饿度日。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_381', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '宦官废立皇帝', time: '公元 827 - 907 年（唐朝 晚唐时期）',
        minLevelName: '割据州牧',
        desc: '你悲哀地看到，神策军中尉等宦官头目竟然可以随意废黜甚至毒杀皇帝。李唐宗室彻底沦为任人宰割的傀儡。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_382', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '藩镇割据的加剧', time: '公元 827 - 907 年（唐朝 晚唐时期）',
        minLevelName: '割据州牧',
        desc: '各地节度使拥兵自重，互相攻伐，朝廷政令不出关中。战火频繁波及你的家乡，生活困苦不堪。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_383', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '白马驿之祸', time: '公元 905 年（唐朝 唐昭宗 天祐二年）',
        minLevelName: '割据州牧',
        desc: '军阀朱温将三十多位朝廷枢密大臣、清流士大夫全部杀害，并投尸于黄河。唐朝的衣冠世族被彻底摧毁，你连夜逃出长安。',
        rewards: [{type: 'xp', value: -100}]
    },
    {
        id: 'hist_384', type: 'history', era: '魏晋隋唐·融合与登科',
        title: '契丹阿保机崛起', time: '公元 907 年（后梁 开平元年 / 唐亡同年）',
        minLevelName: '割据州牧',
        desc: '大唐灭亡的同年，北方的耶律阿保机统一契丹各部，建立政权。长城之外出现了一个极其强大的游牧帝国。',
        rewards: [{type: 'xp', value: -20}]
    },

    // ===== 第七纪元：五代·乱世更迭（共 75 条）=====
    {
        id: 'hist_385', type: 'history', era: '五代·乱世更迭',
        title: '朱温篡唐建梁', time: '公元 907 年（唐朝 哀帝天祐四年 / 后梁 太祖开平元年）',
        minLevelName: '破落世家',
        desc: '宣武节度使朱温逼迫唐哀帝禅位，建立后梁。存在了近三百年的大唐帝国彻底落下帷幕，五代十国的乱世正式拉开序幕。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_386', type: 'history', era: '五代·乱世更迭',
        title: '门阀士族的终结', time: '公元 907 - 923 年（五代初年）',
        minLevelName: '破落世家',
        desc: '曾经不可一世的门阀士族在战乱与黄巢起义的余波中被彻底摧毁。作为前朝后裔，你只能带着残存的几卷残编在乱世中苟延残喘。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_387', type: 'history', era: '五代·乱世更迭',
        title: '衣冠南渡避乱', time: '公元 907 - 923 年（五代初期）',
        minLevelName: '破落世家',
        desc: '中原连年征战，军阀如走马灯般更迭。你随家族南下避难，南方的割据政权相对安定，保全了华夏文化的火种。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_388', type: 'history', era: '五代·乱世更迭',
        title: '契丹阿保机建国', time: '公元 916 年（辽朝 太祖神册元年）',
        minLevelName: '破落世家',
        desc: '北方的耶律阿保机统一契丹各部，建立政权。长城之外出现了一个极其强大的游牧帝国，大批中原汉人流亡到了北方草原。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_389', type: 'history', era: '五代·乱世更迭',
        title: '李存勖灭梁建后唐', time: '公元 923 年（后唐 庄宗同光元年）',
        minLevelName: '破落世家',
        desc: '晋王李存勖率领沙陀铁骑攻破开封，灭亡后梁，建立后唐。他深谙兵法，百战百胜，但称帝后却宠信伶人，埋下了败亡的祸根。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_390', type: 'history', era: '五代·乱世更迭',
        title: '变卖藏书换粮', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '战火烧到了家乡，为了让族人活下去，你含泪将祖传的绝版古籍廉价卖给了市井商贩。斯文扫地，莫过于此。',
        rewards: [{type: 'gold', value: -20}]
    },
    {
        id: 'hist_391', type: 'history', era: '五代·乱世更迭',
        title: '洛阳化为焦土', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '军阀混战中，曾经繁华无双的东都洛阳多次遭遇洗劫焚毁。你走在断壁残垣之间，听不到一丝盛唐的余音。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_392', type: 'history', era: '五代·乱世更迭',
        title: '乡间私塾谋生', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '虽然家道中落，但你腹中的诗书成了唯一的依靠。你在南方偏僻的村落办起私塾，为乱世保留了一丝读书的种子。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_393', type: 'history', era: '五代·乱世更迭',
        title: '兵痞劫掠乡野', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '“贼过如梳，兵过如篦”，朝廷的溃兵逃入乡间，烧杀抢掠比土匪还要凶狠。你带着家人连夜躲入深山才逃过一劫。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_394', type: 'history', era: '五代·乱世更迭',
        title: '逃避苛捐杂税', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '军阀为了筹集军费，设立了“拔钉钱”“雀鼠耗”等各种名目繁多的苛捐杂税。你为了逃税，不得不放弃祖产沦为流民。',
        rewards: [{type: 'gold', value: -40}]
    },
    {
        id: 'hist_395', type: 'history', era: '五代·乱世更迭',
        title: '隐居山林修道', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '看透了政权更迭和人命如草芥的世道，你选择遁入深山，与青灯古佛为伴。你的心境在乱世中获得了超脱。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_396', type: 'history', era: '五代·乱世更迭',
        title: '编纂家族残谱', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '在颠沛流离中，你凭着记忆将失散族人的名字和字辈记录下来，编成残谱。只要家族的记忆不断，根就在。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_397', type: 'history', era: '五代·乱世更迭',
        title: '收留北方大儒', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '你在破庙里遇到了一位逃难的北方大儒，你倾囊相助分给他口粮，他作为回报，为你讲解了《春秋》的精义。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_398', type: 'history', era: '五代·乱世更迭',
        title: '见证称帝闹剧', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '你听说隔壁州县的一个小军阀，仅凭几千人马就敢穿上黄袍自称皇帝，没过三个月就被部下杀了。乱世的荒诞让你啼笑皆非。',
        rewards: [{type: 'xp', value: -10}]
    },
    {
        id: 'hist_399', type: 'history', era: '五代·乱世更迭',
        title: '前朝遗老的悲叹', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '逢年过节，家族的长辈总会面向长安的方向痛哭流涕，怀念大唐的开元盛世。但在军阀的刀剑下，眼泪是最无用的东西。',
        rewards: [{type: 'xp', value: 20}]
    },
    {
        id: 'hist_400', type: 'history', era: '五代·乱世更迭',
        title: '结交江湖游侠', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '乱世之中官府失灵，你结识了几位仗剑走天涯的江湖游侠。在他们的保护下，你的家族免受了地痞的袭扰。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_401', type: 'history', era: '五代·乱世更迭',
        title: '筑土建堡保境安民', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '南方战乱稍缓，你带领流民用夯土和青石筑起高大的坞堡。手中有粮，墙高城坚，你终于在乱世中有了自己的基本盘。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_402', type: 'history', era: '五代·乱世更迭',
        title: '吴越钱镠修海塘', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '吴越王钱镠实行“保境安民”政策，动用数万军民修建钱塘江石砌海塘。你所在的沿海地区免受了海潮之患，良田万顷。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_403', type: 'history', era: '五代·乱世更迭',
        title: '南方十国偏安', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '中原打得昏天黑地，南方的吴、南唐、前蜀等十个割据政权却相对安定。统治者奖励农桑，你的坞堡迎来了连续的丰收。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_404', type: 'history', era: '五代·乱世更迭',
        title: '楚国种茶与铸钱', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '南方楚国政权鼓励百姓种茶，卖给中原换取战马物资，并在内境铸造铅钱流通。你通过倒卖茶叶，积累了第一桶金。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_405', type: 'history', era: '五代·乱世更迭',
        title: '闽国海上贸易萌芽', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '偏安福建的闽国大力发展海外贸易，泉州和福州的港口千帆竞发。你投资了出海的商船，换回了香料和犀角。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_406', type: 'history', era: '五代·乱世更迭',
        title: '招揽北方流民拓荒', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '大量的北方难民涌入江南。你开仓放粮，将他们收编为坞堡的佃户，大面积开垦荒地，家族的势力迅速壮大。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_407', type: 'history', era: '五代·乱世更迭',
        title: '兴修太湖水利', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '你响应吴越国的号召，带领乡民疏浚太湖水网，设立堰闸。江南彻底取代中原，成为了天下最大的粮仓。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_408', type: 'history', era: '五代·乱世更迭',
        title: '蜀地桑蚕大丰收', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '前蜀和后蜀政权境内没有大规模战火，你家的桑园今年产出了极高品质的生丝，蜀锦的名号再次响彻天下。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_409', type: 'history', era: '五代·乱世更迭',
        title: '组建宗族乡兵', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '为了防范零星的溃兵和山贼，你挑选族中精壮男丁组建了“乡团”。虽然装备简陋，但保卫家园的意志极其坚决。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_410', type: 'history', era: '五代·乱世更迭',
        title: '坞堡集市繁荣', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '由于周边治安恶化，商贩们不敢去县城，纷纷来到你坞堡的高墙下交易。一个繁华的草市自然形成，你每天都能收取丰厚的市税。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_411', type: 'history', era: '五代·乱世更迭',
        title: '抵御山贼攻山', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '一股凶悍的流寇企图攻破坞堡抢粮。你指挥乡兵用滚木礌石死死守住了寨门，流寇抛下几十具尸体狼狈逃窜。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_412', type: 'history', era: '五代·乱世更迭',
        title: '引入北方铁农具', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '流亡江南的北方工匠带来了先进的打铁技术。你迅速给坞堡里的农夫换上了新式铁犁，深耕的效率翻了一倍。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_413', type: 'history', era: '五代·乱世更迭',
        title: '调解宗族土地纠纷', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '乱世中没有王法，坞堡内两房族人因为抢夺水源险些械斗。你用宗法和家规严厉处罚了挑事者，维护了内部团结。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_414', type: 'history', era: '五代·乱世更迭',
        title: '开垦江南梯田', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '平原土地不够分了，你带领族人向丘陵进军，顺着山势开垦出了层层叠叠的梯田。江南的土地利用率达到了历史新高。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_415', type: 'history', era: '五代·乱世更迭',
        title: '储备战乱越冬粮草', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '听闻中原的战火可能南下，你果断下令加高坞堡的城墙，并挖掘深窖囤积了足够吃三年的粟米和咸鱼。深挖洞，广积粮。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_416', type: 'history', era: '五代·乱世更迭',
        title: '牙兵干政的铁律', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '“天子，兵强马壮者当为之，宁有种耶！”节度使麾下的骄兵悍将成了真正的主人。你深感兵权才是这乱世的唯一真理。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_417', type: 'history', era: '五代·乱世更迭',
        title: '沙陀骑兵的冲锋', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '你统领着五代时期最具战斗力的沙陀铁骑（“鸦军”）。在战场上，你们人马皆披重甲，冲锋陷阵如入无人之境。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_418', type: 'history', era: '五代·乱世更迭',
        title: '兵变夺权上位', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '节度使克扣军饷，你煽动愤怒的牙兵哗变，一刀斩杀了主帅。在士兵们的拥立下，你成为了新的藩镇之主！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_419', type: 'history', era: '五代·乱世更迭',
        title: '骄兵悍将索要赏赐', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '每逢新皇登基或主帅上任，牙兵们就敲击兵器索要巨额的“优赏”。为了安抚这群大爷，你不得不下令搜刮全城百姓的财富。',
        rewards: [{type: 'gold', value: -40}]
    },
    {
        id: 'hist_420', type: 'history', era: '五代·乱世更迭',
        title: '攻破敌对藩镇城池', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '经过三个月的惨烈围城，你终于攻破了死敌的城池。按照五代的残酷惯例，你默许了手下士兵大掠三日。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_421', type: 'history', era: '五代·乱世更迭',
        title: '遭遇契丹打草谷', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '契丹骑兵南下劫掠被称为“打草谷”。你的防区遭遇了外族的疯狂洗劫，你率领残兵奋力抵抗，损失惨重。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_422', type: 'history', era: '五代·乱世更迭',
        title: '吞并周边弱小军阀', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '大鱼吃小鱼，你趁着邻镇内乱，率大军突袭吞并了他们的地盘，你的兵力扩充了一倍，野心也随之膨胀。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_423', type: 'history', era: '五代·乱世更迭',
        title: '收编溃散乱军', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '一场大战后，漫山遍野都是失去建制的溃兵。你派人支起大锅施粥，将数千名有作战经验的老兵收入麾下。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_424', type: 'history', era: '五代·乱世更迭',
        title: '打造重甲步兵', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '为了克制北方的骑兵，你倾尽财力打造了一支身披重铠、手持长柄大斧的重甲步兵阵阵列，犹如铜墙铁壁。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_425', type: 'history', era: '五代·乱世更迭',
        title: '军阀混战中的背叛', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '昨日的盟友在战场上突然倒戈，从背后捅了你一刀。在五代，信用是最廉价的废纸，你发誓再也不相信任何人。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_426', type: 'history', era: '五代·乱世更迭',
        title: '割据关隘收过路费', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '你带兵占领了商旅必经的一处险要关隘，私设关卡征收重税。虽然惹得商人怨声载道，但你的军饷终于有了着落。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_427', type: 'history', era: '五代·乱世更迭',
        title: '强行征用民夫运粮', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '前方战事吃紧，你下令强抓两万民夫为你运送军粮。一路上劳累饥饿致死者无数，但你只关心粮食能否按时送达。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_428', type: 'history', era: '五代·乱世更迭',
        title: '军营中的结拜兄弟', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '效仿唐末的军中风气，你与几位悍将歃血为盟结为异姓兄弟。这种由利益和江湖义气维系的联盟，暂时稳固了你的兵权。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_429', type: 'history', era: '五代·乱世更迭',
        title: '斩杀克扣军饷的文官', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '朝廷派来的监军不仅不懂军事，还敢克扣牙兵的军饷。你一怒之下将其斩首祭旗，朝廷竟然为了安抚你而不敢追究。',
        rewards: [{type: 'xp', value: 20}]
    },
    {
        id: 'hist_430', type: 'history', era: '五代·乱世更迭',
        title: '冯道历事四朝', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '你结识了号称“长乐老”的冯道，他在走马灯般的政权更迭中连续担任多个朝代的宰相。这种抛弃节操只求保身的乱世哲学让你心情复杂。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_431', type: 'history', era: '五代·乱世更迭',
        title: '词的繁荣与花间派', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '南方偏安的宫廷中，“词”这种长短句文学体裁高度繁荣。你听着《花间集》中委婉柔美的乐曲，暂时忘却了北方的战火。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_432', type: 'history', era: '五代·乱世更迭',
        title: '绘制《韩熙载夜宴图》', time: '公元 937 - 975 年（十国 南唐时期）',
        minLevelName: '破落世家',
        desc: '南唐后主李煜派画师顾闳中潜入宰相韩熙载的府邸，将其纵情声色的夜宴画了下来。画卷背后，是亡国前夕群臣的绝望与放纵。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_433', type: 'history', era: '五代·乱世更迭',
        title: '出使辽国纳贡称臣', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '主公势弱，你被迫作为使臣前往苦寒的契丹牙帐纳贡称臣。面对游牧贵族的傲慢，你忍辱负重，只为给藩镇换取一丝喘息之机。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_434', type: 'history', era: '五代·乱世更迭',
        title: '劝谏藩镇休养生息', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '连年征战导致辖区内饿殍遍野，你拼死进谏主公停止无意义的攻伐，开仓放粮，并减免农兵的赋税。民心终于重新聚拢。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_435', type: 'history', era: '五代·乱世更迭',
        title: '连横合纵的外交博弈', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '南方十国之间关系错综复杂。你作为谋士，今天游说南汉夹击楚国，明天又与吴越结盟。你的三寸不烂之舌抵得过十万大军。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_436', type: 'history', era: '五代·乱世更迭',
        title: '设立南唐画院', time: '公元 937 - 975 年（十国 南唐时期）',
        minLevelName: '破落世家',
        desc: '南唐政权极其重视文艺，你辅佐皇帝设立了专门的画院。董源、巨然等一大批山水画大师汇聚金陵，江南画派迎来了巅峰。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_437', type: 'history', era: '五代·乱世更迭',
        title: '编纂地方图经', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '为了更好地掌握辖区的山川险阻和人口赋税，你主持编纂了极其详尽的地方图志。这成了主公用兵和治国的核心机密。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_438', type: 'history', era: '五代·乱世更迭',
        title: '整顿割据政权税收', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '藩镇内的税收极其混乱，军头私自截留严重。你顶着杀头的风险清查账册，将财政权收归幕府，府库终于有了结余。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_439', type: 'history', era: '五代·乱世更迭',
        title: '策划削弱牙兵兵权', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '骄兵悍将严重威胁到了主公的安全。你献出一条“杯酒释兵权”的雏形毒计，暗中调离了刺头将领，用金银剥夺了他们的兵权。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_440', type: 'history', era: '五代·乱世更迭',
        title: '招募北方避乱名士', time: '公元 907 - 960 年（五代时期）',
        minLevelName: '破落世家',
        desc: '得知多位名满天下的北方大儒逃难至江淮，你亲自带着厚礼在江边迎接，为幕府招揽了一大批顶尖的治世人才。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_441', type: 'history', era: '五代·乱世更迭',
        title: '秘密联络中原王朝', time: '公元 907 - 979 年（五代十国时期）',
        minLevelName: '破落世家',
        desc: '你敏锐地察觉到后周政权正在崛起。为了家族的后路，你私下派出密使，向中原天子递交了包含地形图的投诚密信。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_442', type: 'history', era: '五代·乱世更迭',
        title: '后蜀雕版印九经', time: '公元 932 年起',
        minLevelName: '破落世家',
        desc: '后蜀政权由宰相毋昭裔主持，大规模雕版刻印儒家《九经》。这标志着雕版印刷术从民间普及到了官方，文化传播效率发生了质变。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_443', type: 'history', era: '五代·乱世更迭',
        title: '燕云十六州的割让', time: '公元 936 年（后晋初）',
        minLevelName: '破落世家',
        desc: '石敬瑭为认契丹做“父皇帝”并借兵灭后唐，竟然将战略重地燕云十六州割让给契丹。中原彻底失去了北方的天然屏障！',
        rewards: [{type: 'xp', value: -80}]
    },
    {
        id: 'hist_444', type: 'history', era: '五代·乱世更迭',
        title: '石敬瑭认父称臣', time: '公元 936 年（后晋 高祖天福元年 / 辽朝 太宗天显十一年）',
        minLevelName: '破落世家',
        desc: '为了借助契丹的兵力当上皇帝，石敬瑭竟然厚颜无耻地称比自己小十多岁的辽太宗为“父皇帝”。中原王朝的尊严被彻底践踏殆尽！',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_445', type: 'history', era: '五代·乱世更迭',
        title: '耶律德光入主中原', time: '公元 947 年（后晋 出帝开运四年 / 辽朝 太宗大同元年）',
        minLevelName: '破落世家',
        desc: '契丹大军攻入开封，灭亡后晋。耶律德光穿着汉族皇帝的衣冠，改国号为“大辽”。中原王朝面临史无前例的外族直接压迫。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_446', type: 'history', era: '五代·乱世更迭',
        title: '刘知远建立后汉', time: '公元 947 年（后晋 出帝开运四年 / 辽朝 太宗大同元年）',
        minLevelName: '破落世家',
        desc: '趁着契丹大军在北方遭遇中原军民剧烈反抗而北撤的空隙，河东节度使刘知远在太原称帝建立后汉，中原勉强恢复了汉人政权。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_447', type: 'history', era: '五代·乱世更迭',
        title: '郭威黄旗加身建后周', time: '公元 951 年（后周 太祖广顺元年）',
        minLevelName: '破落世家',
        desc: '枢密使郭威在出征契丹途中发动兵变，黄旗加身，建立后周。他减轻剥削，整顿禁军，惩治贪官，中原政权终于开始显露出复兴的曙光。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_448', type: 'history', era: '五代·乱世更迭',
        title: '高平之战的血战', time: '公元 954 年（后周 世宗显德元年）',
        minLevelName: '破落世家',
        desc: '后周大军于高平大败北汉与辽国的联军。你在战役中跟随柴荣冲锋陷阵，后周政权彻底稳固，禁军的战斗力震慑天下。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_449', type: 'history', era: '五代·乱世更迭',
        title: '周世宗柴荣继位', time: '公元 954 年（后周 世宗显德元年）',
        minLevelName: '破落世家',
        desc: '具有雄才大略的柴荣继位，立下了“十年开拓天下，十年养百姓，十年致太平”的宏愿。你辅佐君王，感受到了大一统的时代浪潮即将到来。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_450', type: 'history', era: '五代·乱世更迭',
        title: '南唐李煜的文艺宫廷', time: '公元 951 - 960 年（五代末期 后周时期）',
        minLevelName: '破落世家',
        desc: '南唐后主李煜虽然不通治国，但在诗词绘画上造诣极高。你听闻他写下了“问君能有几多愁”，一代文艺帝王的悲剧命运已然注定。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_451', type: 'history', era: '五代·乱世更迭',
        title: '周世宗毁佛铸钱', time: '公元 955 年（后周 世宗显德二年）',
        minLevelName: '破落世家',
        desc: '柴荣下令废除数万所寺院，勒令僧尼还俗，并将铜佛像熔毁铸造铜钱“周元通宝”。国家财政和兵源得到了极大充实。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_452', type: 'history', era: '五代·乱世更迭',
        title: '柴荣拓宽开封城', time: '公元 951 - 960 年（五代 后周时期）',
        minLevelName: '破落世家',
        desc: '为了适应日益繁荣的商业和庞大的禁军，柴荣下令大规模扩建首都开封城，展宽街道，疏通漕运。北宋东京城的繁华基础在此刻奠定。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_453', type: 'history', era: '五代·乱世更迭',
        title: '惩治贪墨整顿吏治', time: '公元 951 - 960 年（五代 后周时期）',
        minLevelName: '破落世家',
        desc: '柴荣执法严明，斩杀了多名贪污军饷、鱼肉百姓的节度使和悍将。五代以来骄兵悍将无法无天的局面终于被遏制住了。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_454', type: 'history', era: '五代·乱世更迭',
        title: '柴荣南征夺取江淮', time: '公元 955 - 958 年',
        minLevelName: '破落世家',
        desc: '周世宗三征南唐，夺取了富庶的江淮十四州。南唐被迫去除帝号，向后周称臣纳贡。中原政权在经济上彻底碾压了南方。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_455', type: 'history', era: '五代·乱世更迭',
        title: '制定《大周刑统》', time: '公元 951 - 960 年（五代 后周时期）',
        minLevelName: '破落世家',
        desc: '柴荣命人编纂了《大周刑统》，恢复了部分唐代的律令，废除了一些五代军阀私设的残酷刑罚。法治的曙光重新照耀中原。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_456', type: 'history', era: '五代·乱世更迭',
        title: '恢复中原科举取士', time: '公元 951 - 960 年（五代 后周时期）',
        minLevelName: '破落世家',
        desc: '柴荣大力提拔文臣，恢复并规范了科举考试。重武轻文的社会风气开始被扭转，大批读书人重新看到了入仕的希望。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_457', type: 'history', era: '五代·乱世更迭',
        title: '北伐大捷与柴荣病逝', time: '公元 959 年（后周 世宗显德六年）',
        minLevelName: '破落世家',
        desc: '柴荣率军北伐辽国，短短月余收复三州三关。正当准备一举收复幽州时，他却突发重病离世。天妒英才，一统大业被迫中断。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_458', type: 'history', era: '五代·乱世更迭',
        title: '赵匡胤统领殿前禁军', time: '公元 959 年（后周 世宗显德六年）',
        minLevelName: '破落世家',
        desc: '周世宗驾崩，幼主继位。殿前都点检赵匡胤掌握了后周最精锐的禁军兵权，并在将士中深得人心。风暴即将在陈桥驿酝酿。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_459', type: 'history', era: '五代·乱世更迭',
        title: '陈桥兵变的暗流涌动', time: '公元 960 年初',
        minLevelName: '破落世家',
        desc: '听闻北汉与契丹联军南下，朝廷急令赵匡胤率禁军北上御敌。你看着大军在开封城外集结，士兵们交头接耳，深知天命即将改写。',
        rewards: [{type: 'xp', value: 60}]
    },

    // ===== 第八纪元：宋·文道昌盛（共 120 条）=====
    {
        id: 'hist_460', type: 'history', era: '宋·文道昌盛',
        title: '陈桥兵变黄袍加身', time: '公元 960 年（北宋 太祖建隆元年）',
        minLevelName: '耕读传家',
        desc: '后周殿前都点检赵匡胤在陈桥驿发动兵变，将士们把黄袍披在他身上，拥立为帝，建立大宋。乱世终结的曙光到来了。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_461', type: 'history', era: '宋·文道昌盛',
        title: '杯酒释兵权', time: '公元 961 年（北宋 太祖建隆二年）',
        minLevelName: '耕读传家',
        desc: '宋太祖设宴款待石守信等禁军宿将，几杯酒下肚，便解除了他们的兵权。作为经历过五代的家族，你深知此举彻底终结了武将专权的隐患。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_462', type: 'history', era: '宋·文道昌盛',
        title: '崇文抑武国策', time: '公元 960 - 997 年（北宋初年）',
        minLevelName: '耕读传家',
        desc: '朝廷定下“崇文抑武”的祖宗之法。家族长辈果断收缴了子弟们的刀剑，严令所有人捧起书本准备科举。万般皆下品，惟有读书高！',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_463', type: 'history', era: '宋·文道昌盛',
        title: '设立知州与通判', time: '公元 960 - 997 年（北宋初年）',
        minLevelName: '耕读传家',
        desc: '朝廷派文官担任地方知州，并特设“通判”一职与之相互牵制。地方官的权力被大大削弱，再也无法形成藩镇割据了。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_464', type: 'history', era: '宋·文道昌盛',
        title: '编修《百家姓》', time: '公元 960 - 997 年（北宋初年）',
        minLevelName: '耕读传家',
        desc: '吴越地区的士人编纂了《百家姓》，“赵钱孙李”开头彰显了皇权。这部朗朗上口的蒙学读物成了你们家族孩童的启蒙教材。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_465', type: 'history', era: '宋·文道昌盛',
        title: '收精兵建禁军', time: '公元 960 - 997 年（北宋初年）',
        minLevelName: '耕读传家',
        desc: '宋太祖将各地最精锐的士兵全部抽调到京城编为禁军，“强干弱枝”。虽然中央兵力极盛，但地方防务变得异常空虚。',
        rewards: [{type: 'xp', value: 20}]
    },
    {
        id: 'hist_466', type: 'history', era: '宋·文道昌盛',
        title: '收复南方割据政权', time: '公元 960 - 997 年（北宋初年）',
        minLevelName: '耕读传家',
        desc: '宋太祖与宋太宗采取“先南后北”的战略，兵不血刃或以较小代价接连平定了荆南、后蜀、南唐等十国政权。南方重新归于一统。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_467', type: 'history', era: '宋·文道昌盛',
        title: '四川“交子”的诞生', time: '公元 1023 年（北宋 仁宗天圣元年）',
        minLevelName: '耕读传家',
        desc: '因为四川使用的铁钱太笨重，十六家富商联合发行了纸币“交子”。后来官府接管，这是世界上最早的纸币！你用几张纸就完成了万贯交易。',
        rewards: [{type: 'gold', value: 100}]
    },
    {
        id: 'hist_468', type: 'history', era: '宋·文道昌盛',
        title: '景德镇青白瓷崛起', time: '公元 997 - 1022 年（北宋 真宗时期）',
        minLevelName: '耕读传家',
        desc: '江西景德镇烧制出的青白瓷“色质如玉”，被朝廷选为贡瓷。你垄断了景德镇几大窑口的货源，将瓷器销往全国。',
        rewards: [{type: 'gold', value: 80}]
    },
    {
        id: 'hist_469', type: 'history', era: '宋·文道昌盛',
        title: '澶渊之盟', time: '北宋景德元年（1004年）',
        minLevelName: '耕读传家',
        desc: '辽军兵临城下，宰相寇准力劝宋真宗亲征。宋辽最终结为兄弟之国，大宋每年送给辽朝十万两银、二十万匹绢的“岁币”。虽然屈辱，但换来了百年的和平。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_470', type: 'history', era: '宋·文道昌盛',
        title: '推广占城稻', time: '公元 960 - 1127 年（北宋时期）',
        minLevelName: '耕读传家',
        desc: '朝廷从福建引进了耐旱早熟的占城稻，并下发给江南各州县推广。你家的田地今年种上了占城稻，产量翻倍，再也不怕夏旱了。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_471', type: 'history', era: '宋·文道昌盛',
        title: '科举糊名誊录法', time: '公元 960 - 1127 年（北宋时期）',
        minLevelName: '耕读传家',
        desc: '为了防止科场作弊，朝廷实行了“糊名（遮掩名字）”和“誊录（派人抄写试卷以防认出字迹）”。寒门子弟有了极其公平的竞争机会。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_472', type: 'history', era: '宋·文道昌盛',
        title: '范仲淹设义庄', time: '公元 1041 - 1048 年（北宋 仁宗庆历年间）',
        minLevelName: '耕读传家',
        desc: '名臣范仲淹拿出俸禄在苏州购置田地设立“义庄”，用于救济贫困族人。你们家族也效仿此举，大大增强了宗族的凝聚力。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_473', type: 'history', era: '宋·文道昌盛',
        title: '厢坊制度建立', time: '公元 960 - 1127 年（北宋时期）',
        minLevelName: '耕读传家',
        desc: '随着城市人口剧增，政府在城内和城外设立了“厢”和“坊”进行基层管理。你家所在的街区治安和消防得到了显著改善。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_474', type: 'history', era: '宋·文道昌盛',
        title: '坊市界限被彻底打破', time: '公元 960 - 1127 年（北宋时期）',
        minLevelName: '耕读传家',
        desc: '汴京城内，以前封闭的“坊墙”被全部拆除，临街到处都是开门的商铺。你立刻把临街的院墙改造成了门店，生意火爆！',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_475', type: 'history', era: '宋·文道昌盛',
        title: '夜市与晓市的繁华', time: '公元 960 - 1127 年（北宋时期）',
        minLevelName: '耕读传家',
        desc: '朝廷取消了宵禁！从三更的“晓市”到通宵达旦的“夜市”，汴京城成了一座真正的不夜城。你家的酒楼十二个时辰都在赚钱。',
        rewards: [{type: 'gold', value: 80}]
    },
    {
        id: 'hist_476', type: 'history', era: '宋·文道昌盛',
        title: '煤炭的大规模使用', time: '公元 960 - 1127 年（北宋时期）',
        minLevelName: '耕读传家',
        desc: '汴京城百万人口的燃料从木柴变成了煤炭（石炭）。你盘下了一座煤矿，源源不断的黑金让你成为了汴京巨富。',
        rewards: [{type: 'gold', value: 70}]
    },
    {
        id: 'hist_477', type: 'history', era: '宋·文道昌盛',
        title: '市易法的重压', time: '公元 1067 - 1085 年（北宋 神宗时期）',
        minLevelName: '耕读传家',
        desc: '王安石变法设立“市易务”，官府出面直接收购滞销商品并进行专卖。官府成了最大的垄断商人，你的利润空间被严重挤压。',
        rewards: [{type: 'gold', value: -40}]
    },
    {
        id: 'hist_478', type: 'history', era: '宋·文道昌盛',
        title: '四川交子务的设立', time: '公元 1023 年（北宋 仁宗天圣元年）',
        minLevelName: '耕读传家',
        desc: '由于民间交子铺户屡遭挤兑破产，政府正式设立“交子务”进行官方垄断发行。你交出了手中的印钞权，换取了官方的特许经营资格。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_479', type: 'history', era: '宋·文道昌盛',
        title: '妈祖信仰的兴起与册封', time: '公元 10 世纪 - 13 世纪（两宋时期）',
        minLevelName: '耕读传家',
        desc: '沿海渔民和商船出海前纷纷祭拜“林默娘”。你奏请朝廷对妈祖进行多次褒封，妈祖正式成为了大宋海商的海神信仰。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_480', type: 'history', era: '宋·文道昌盛',
        title: '毕昇发明活字印刷术', time: '公元 1040 年左右（北宋 仁宗庆历年间）',
        minLevelName: '耕读传家',
        desc: '一介布衣毕昇用胶泥刻字，焙烧成陶，发明了胶泥活字印刷术。相比雕版，排版效率千万倍提升，文明传播的速度引来大爆炸！',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_481', type: 'history', era: '宋·文道昌盛',
        title: '司马光编纂《资治通鉴》', time: '公元 1067 - 1085 年（北宋 神宗时期）',
        minLevelName: '耕读传家',
        desc: '你作为副手，协助司马光历时十九年，编纂完成了一部从战国到五代的编年体通史巨著。宋神宗赐名“鉴于往事，有资于治道”。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_482', type: 'history', era: '宋·文道昌盛',
        title: '沈括著《梦溪笔谈》', time: '公元 960 - 1127 年（北宋时期）',
        minLevelName: '耕读传家',
        desc: '全才科学家沈括在梦溪园中写下了包含天文、数学、地质、物理的《梦溪笔谈》。你阅读后大开眼界，这是“中国科学史上的坐标”。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_483', type: 'history', era: '宋·文道昌盛',
        title: '柳永婉约词风靡', time: '公元 960 - 1127 年（北宋时期）',
        minLevelName: '耕读传家',
        desc: '“凡有井水饮处，即能歌柳词”。柳永的婉约词描写市井生活，缠绵悱恻，成为青楼瓦子中最流行的神曲。你也是他的忠实拥趸。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_484', type: 'history', era: '宋·文道昌盛',
        title: '李清照的忧患词', time: '公元 1127 年前后（北宋 两宋之交）',
        minLevelName: '耕读传家',
        desc: '经历了靖康之耻和国破家亡，绝代才女李清照写下了“寻寻觅觅，冷冷清清，凄凄惨惨戚戚”。她的词里浓缩了整个时代的悲剧哀愁。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_485', type: 'history', era: '宋·文道昌盛',
        title: '宋四家书法', time: '公元 960 - 1127 年（北宋时期）',
        minLevelName: '耕读传家',
        desc: '苏轼、黄庭坚、米芾、蔡襄并称“宋四家”。他们打破了唐代重法度的规矩，强调“尚意”，追求个性和抒情。你花重金求得米芾的一纸手书。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_486', type: 'history', era: '宋·文道昌盛',
        title: '欧阳修散文改革', time: '公元 11 世纪中叶（北宋中期）',
        minLevelName: '耕读传家',
        desc: '欧阳修力排众议，废除了华而不实的西昆体，提倡平实自然的古文。在他的提携下，曾巩、王安石、三苏等古文大家喷涌而出。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_487', type: 'history', era: '宋·文道昌盛',
        title: '《武经总要》刊行', time: '公元 1041 - 1048 年（北宋 仁宗庆历年间）',
        minLevelName: '耕读传家',
        desc: '朝廷官方编修并刊印了这部极其详尽的军事百科全书，里面详细记载了各种火药配方和攻城器械。你通过研读此书，补足了文臣的军事短板。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_488', type: 'history', era: '宋·文道昌盛',
        title: '程颢程颐开创理学', time: '公元 960 - 1127 年（北宋时期）',
        minLevelName: '耕读传家',
        desc: '二程在洛阳讲学，提出了“万物皆只是一个天理”。儒家思想融合了佛道的思辨，完成了高度的哲学化。你被这种宏大的宇宙观深深折服。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_489', type: 'history', era: '宋·文道昌盛',
        title: '太学三舍法', time: '公元 1069 - 1085 年（北宋 神宗时期）',
        minLevelName: '耕读传家',
        desc: '王安石改革太学，将学生分为外舍、内舍、上舍，平时考试成绩优异者可直接做官，无需经过科举。学校教育与官员选拔紧密结合了。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_490', type: 'history', era: '宋·文道昌盛',
        title: '范仲淹庆历新政', time: '北宋庆历三年（1043年）',
        minLevelName: '耕读传家',
        desc: '面对内忧外患，范仲淹提出“明黜陟、抑侥幸”等十项改革，试图整顿官僚队伍。但因触动大官僚利益，短短一年便宣告失败流产。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_491', type: 'history', era: '宋·文道昌盛',
        title: '王安石变法（青苗法）', time: '公元 1067 - 1085 年（北宋 神宗时期）',
        minLevelName: '耕读传家',
        desc: '为了实现“富国强兵”，王安石强推青苗法，政府在青黄不接时向农民低息贷款。初衷虽好，但地方官强行摊派，反而变成了坑农的暴政。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_492', type: 'history', era: '宋·文道昌盛',
        title: '募役法与均输法', time: '公元 1067 - 1085 年（北宋 神宗时期）',
        minLevelName: '耕读传家',
        desc: '王安石推行募役法，富户交钱免役，政府出钱雇人。这一招直接打破了豪强的特权，极大充实了国库，但也引发了既得利益集团的疯狂反扑。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_493', type: 'history', era: '宋·文道昌盛',
        title: '保甲法与将兵法', time: '公元 1067 - 1085 年（北宋 神宗时期）',
        minLevelName: '耕读传家',
        desc: '为了扭转军事弱势，王安石在民间组织保甲进行军事训练，并改革军制。大宋的国防力量有所恢复，但在执行中又引发了极大的社会动荡。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_494', type: 'history', era: '宋·文道昌盛',
        title: '新旧党争的旋涡', time: '公元 1067 - 1100 年（北宋 神宗至哲宗时期）',
        minLevelName: '耕读传家',
        desc: '围绕变法，以王安石为首的新党和以司马光、苏轼为首的旧党展开了长达几十年的残酷政治倾轧。你作为书院学者，无辜卷入其中惨遭贬谪。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_495', type: 'history', era: '宋·文道昌盛',
        title: '“先忧后乐”的精神丰碑', time: '公元 960 - 1127 年（北宋时期）',
        minLevelName: '耕读传家',
        desc: '你深刻领悟了范仲淹“先天下之忧而忧，后天下之乐而乐”的士大夫精神。这种以天下为己任的浩然正气，成为了大宋文人的最高道德标杆。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_496', type: 'history', era: '宋·文道昌盛',
        title: '岁币的沉重与边贸繁荣', time: '公元 960 - 1127 年（北宋时期）',
        minLevelName: '耕读传家',
        desc: '虽然岁币是沉重的政治屈辱，但你所在的世家通过边境“榷场”互市贸易，赚回来的钱远远超过了岁币的支出。这是大宋算的一笔经济账。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_497', type: 'history', era: '宋·文道昌盛',
        title: '设立枢密院与三衙', time: '公元 960 - 1127 年（北宋时期）',
        minLevelName: '耕读传家',
        desc: '朝廷将调兵权归枢密院，统兵权归三衙。将不知兵，兵不知将。你作为武将世族，看着这种极度防范武将的制度，深知大宋国防已是外强中干。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_498', type: 'history', era: '宋·文道昌盛',
        title: '冗官、冗兵、冗费危机', time: '公元 11 世纪中叶（北宋中期）',
        minLevelName: '耕读传家',
        desc: '为了防范造反，朝廷疯狂扩充官僚机构和禁军；为了和平，每年缴纳巨额岁币。“三冗”导致国家财政枯竭，大宋陷入了严重的“积贫积弱”危机。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_499', type: 'history', era: '宋·文道昌盛',
        title: '设转运使掌控地方财政', time: '公元 960 - 1127 年（北宋时期）',
        minLevelName: '耕读传家',
        desc: '朝廷在各路设立转运使，将地方的大部分赋税直接运往京城。地方的财权被彻底抽干，你所在的州府再也无力供养私兵对抗中央了。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_500', type: 'history', era: '宋·文道昌盛',
        title: '宋夏和议与岁赐', time: '北宋庆历四年（1044年）',
        minLevelName: '耕读传家',
        desc: '西夏李元昊称帝后与宋朝连年交战。最终西夏表面向宋称臣，宋朝每年赐予西夏大量银、绢、茶。大宋再次用钱买回了西北边境的暂时安宁。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_501', type: 'history', era: '宋·文道昌盛',
        title: '市舶条法的颁布', time: '公元 1078 - 1085 年（北宋 神宗元丰年间）',
        minLevelName: '耕读传家',
        desc: '朝廷颁布了世界上最早的海关法《广州市舶条法》。你依法对进出口货物进行严格的抽解，国家的财政收入因为海贸而翻倍。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_502', type: 'history', era: '宋·文道昌盛',
        title: '苏颂建造水运仪象台', time: '公元 1086 - 1094 年（北宋 哲宗元祐年间）',
        minLevelName: '耕读传家',
        desc: '宰相兼科学家苏颂主持建造了集天文观测、天象演示和报时于一体的庞大水运仪象台，采用了类似擒纵器的机械装置。大宋科技冠绝全球！',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_503', type: 'history', era: '宋·文道昌盛',
        title: '乌台诗案', time: '北宋元丰二年（1079年）',
        minLevelName: '耕读传家',
        desc: '新党官员从苏轼的诗文中罗织罪名，将其下狱险些斩首，最后贬至黄州。大宋“不杀士大夫”的底线被擦边触碰，文人集团人人自危。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_504', type: 'history', era: '宋·文道昌盛',
        title: '元祐更化', time: '公元 1086 年（北宋 哲宗元祐初年）',
        minLevelName: '耕读传家',
        desc: '高太后临朝，司马光拜相，几乎将王安石的新法全盘废除。然而废除新法并未带来治世，反而让国家财政再次陷入枯竭，党争愈演愈烈。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_505', type: 'history', era: '宋·文道昌盛',
        title: '乡约的推行', time: '公元 11 世纪末 - 12 世纪初（北宋后期）',
        minLevelName: '耕读传家',
        desc: '大儒吕大钧撰写了《吕氏乡约》。你作为乡绅，组织村民每月集会，宣讲“德业相劝，过失相规”，极大地改善了乡风民俗。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_506', type: 'history', era: '宋·文道昌盛',
        title: '苏轼开创豪放词', time: '公元 1067 - 1127 年（北宋中后期）',
        minLevelName: '耕读传家',
        desc: '“大江东去，浪淘尽，千古风流人物”。你听着苏轼突破了词的柔靡之风，将家国情怀与旷达胸襟写入词中，极大地提高了词的文学地位。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_507', type: 'history', era: '宋·文道昌盛',
        title: '租佃关系普遍化', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '宋代“不抑兼并”，土地买卖频繁。失去土地的农民不再依附于地主的人身控制，而是签订契约成为佃户。你们家族也招募了一批佃户。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_508', type: 'history', era: '宋·文道昌盛',
        title: '秧马的推广', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '苏轼在地方推广了一种叫“秧马”的拔秧工具，形似小船，骑在上面能在泥水中滑行。你们家族的农田工作效率大大提高。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_509', type: 'history', era: '宋·文道昌盛',
        title: '苏湖熟天下足', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '太湖流域的苏州、湖州成为了全国的粮仓。你家的田庄水利兴修完备，稻麦两熟，成为了当地赫赫有名的耕读大族。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_510', type: 'history', era: '宋·文道昌盛',
        title: '兄弟分家与财产私有', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '随着经济发展，家族内部对财产私有权愈发看重。长辈主持了分家仪式，立下字据，确立了各个小家庭的独立财产权。',
        rewards: [{type: 'gold', value: 20}]
    },
    {
        id: 'hist_511', type: 'history', era: '宋·文道昌盛',
        title: '茶树的广泛种植', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '饮茶之风风靡全国，政府实行茶叶专卖（榷茶）。你家将荒山开辟成了茶园，每年向官府交纳茶税后依然获利颇丰。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_512', type: 'history', era: '宋·文道昌盛',
        title: '榜下捉婿风潮', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '科举放榜之日，富商和显贵们纷纷在榜下单蹲守，争相抢夺新科进士做女婿。你家的一位才俊刚中进士，就被强拉上车成了豪门女婿！',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_513', type: 'history', era: '宋·文道昌盛',
        title: '雕版印刷农书', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '政府十分重视农业，大量雕版印刷《农桑辑要》等农书免费发放给地方。你得到了一本，学到了最新的施肥和治虫技术。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_514', type: 'history', era: '宋·文道昌盛',
        title: '瓦子与勾栏的娱乐', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '城市里出现了大型娱乐场所“瓦子”，里面圈出专供演出的“勾栏”。你豪掷千金在勾栏里看百戏、听说书，享受着极度繁华的市民生活。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_515', type: 'history', era: '宋·文道昌盛',
        title: '商业街邸店林立', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '你在汴京买下了一整排邸店（客栈兼仓库）。各地进京的客商都住在你的邸店里并存放货物，你坐收巨额的租金与佣金。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_516', type: 'history', era: '宋·文道昌盛',
        title: '蹴鞠比赛的风靡', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '商业繁华带来了体育娱乐的兴盛。你赞助了一支“齐云社”蹴鞠队，他们在瓦子里的表演赛吸引了万人空巷，你的商号也随之名声大噪。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_517', type: 'history', era: '宋·文道昌盛',
        title: '当铺与质库的暴利', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '你开设了被称为“长生库”的当铺。无论是落魄的书生还是急需资金的商贾，都拿物品来抵押借高利贷。你的财富像滚雪球般膨胀。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_518', type: 'history', era: '宋·文道昌盛',
        title: '商税成为国家支柱', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '政府财政对商业税的依赖越来越重（商税甚至超过了农业税）。你骄傲地向人炫耀：大宋的国库，有一半是我们商贾填满的！',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_519', type: 'history', era: '宋·文道昌盛',
        title: '组建工商业行会', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '为了避免恶性竞争，你联合同业商人成立了“行”和“作”。通过行会，你们统一了商品物价，甚至可以与官府讨价还价。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_520', type: 'history', era: '宋·文道昌盛',
        title: '杂剧与傀儡戏', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '你出资包下了一个勾栏，专门上演杂剧和悬丝傀儡戏。老百姓对这种滑稽幽默、讽刺现实的戏剧极其狂热，场场爆满。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_521', type: 'history', era: '宋·文道昌盛',
        title: '盛大的上元节灯会', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '正月十五上元节，汴京城扎起了如山般高大的鳌山灯。你在这场彻夜狂欢中大卖花灯和酒水，赚得盆满钵满。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_522', type: 'history', era: '宋·文道昌盛',
        title: '打破重农抑商观念', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '“富者有资可以买田，贵者有力可以占田”。虽然法律仍有限制，但在社会观念中，你这样的富商已经能与士大夫平起平坐谈笑风生了。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_523', type: 'history', era: '宋·文道昌盛',
        title: '设立市舶司', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '大宋在广州、泉州、明州等地设立了市舶司。你作为市舶官员，负责对万国商船进行抽解（征税）和博买（官购），大权在握。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_524', type: 'history', era: '宋·文道昌盛',
        title: '水密隔舱技术的应用', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '你督造的“福船”采用了世界领先的“水密隔舱”技术。即使船体触礁破损一两个舱室，商船依然能安然返回港口。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_525', type: 'history', era: '宋·文道昌盛',
        title: '蕃坊与蕃市的繁荣', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '你在港口城市划定了“蕃坊”供外商居住，甚至允许他们选举“蕃长”自治。开明的政策吸引了全球的商人带着奇珍异宝来大宋贸易。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_526', type: 'history', era: '宋·文道昌盛',
        title: '大批瓷器与丝绸出海', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '你签发了通关文牒，上百艘满载景德镇瓷器和苏杭丝绸的福船扬帆起航。这些货物将在中东和欧洲换回同等重量的黄金和香料。',
        rewards: [{type: 'gold', value: 70}]
    },
    {
        id: 'hist_527', type: 'history', era: '宋·文道昌盛',
        title: '香料奢侈品的大量进口', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '乳香、龙涎香等大量香料通过海路输入大宋，不仅用于皇室祭祀，还走入了寻常百姓家。你掌管的香料库成了国家最值钱的宝库。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_528', type: 'history', era: '宋·文道昌盛',
        title: '设立蕃学', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '为了让长居大宋的外国商人子弟接受汉文化教育，你上书朝廷在泉州设立了“蕃学”。中华文化在潜移默化中向海外辐射。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_529', type: 'history', era: '宋·文道昌盛',
        title: '铜钱大量外流危机', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '由于大宋的铜钱在海外有着极高的信用，成为了亚洲的“硬通货”，导致国内铜钱大量走私外流引发钱荒。你不得不下令严查走私。',
        rewards: [{type: 'gold', value: -30}]
    },
    {
        id: 'hist_530', type: 'history', era: '宋·文道昌盛',
        title: '与大食、三佛齐的通好', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '阿拉伯帝国（大食）和室利佛逝（三佛齐）的使臣通过海路来大宋朝贡。你在市舶司设下盛大国宴款待，展示了大宋的威仪。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_531', type: 'history', era: '宋·文道昌盛',
        title: '制定详细航海图', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '你组织经验丰富的老水手，利用指南针和牵星术，绘制了极其详尽的通往南洋和印度洋的航海图。大宋的船长们再也不会迷失在远洋中了。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_532', type: 'history', era: '宋·文道昌盛',
        title: '海外植物的引种', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '通过来往的商船，你不仅引进了农作物，还引种了茉莉、菩提等大量海外花卉植物，极大丰富了大宋士大夫的园林生活。',
        rewards: [{type: 'xp', value: 20}]
    },
    {
        id: 'hist_533', type: 'history', era: '宋·文道昌盛',
        title: '火药武器广泛应用于军事', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '你见证了军工作坊造出了“突火枪”和“震天雷”。在抵抗辽、夏、金的战争中，冷兵器时代开始向热兵器时代发出震耳欲聋的跨越之声。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_534', type: 'history', era: '宋·文道昌盛',
        title: '大规模刊印儒家经史', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '得益于造纸术和印刷术的飞跃，过去贵族垄断的经书史书被大量刻印。书籍变得极其便宜，彻底打破了知识垄断，平民的科举之路被打通。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_535', type: 'history', era: '宋·文道昌盛',
        title: '宋画的写实与意境并重', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '宋代画院极其繁荣，一方面追求极致的写实（“格物”），画鸟连羽毛纹理都清晰可见；另一方面文人画兴起，追求诗情画意。这是中国艺术最巅峰的时代。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_536', type: 'history', era: '宋·文道昌盛',
        title: '宋代医学与法医学进步', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '宋慈写出了世界上第一部法医学专著《洗冤集录》，政府还设立了太医局。科学务实的精神在这个时代的方方面面生根发芽。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_537', type: 'history', era: '宋·文道昌盛',
        title: '格物致知的修养论', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '理学主张通过“格物致知”来探究万事万物中的“理”。你每天观察自然、苦读经书，试图在心中领悟那虚无缥缈的天地大道。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_538', type: 'history', era: '宋·文道昌盛',
        title: '四大书院的崛起', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '白鹿洞、岳麓、应天、嵩阳四大书院名扬天下。你作为山长，在名山大川中招收天下英才，自由讲学，书院成为了学术争鸣的绝对中心。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_539', type: 'history', era: '宋·文道昌盛',
        title: '士大夫与皇帝共治天下', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '“天下者，中国之天下，祖宗之天下，群臣、万姓、三军之天下，非陛下之天下”。文臣士大夫在宋代的政治地位达到了中国历史的顶峰。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_540', type: 'history', era: '宋·文道昌盛',
        title: '宰相权力的极度分割', time: '公元 960 - 1279 年（北宋 两宋时期）',
        minLevelName: '耕读传家',
        desc: '朝廷不仅设枢密院分军权、设三司使分财权，还设立“参知政事”作为副相分割宰相的行政权。身居高位的你发现，大权已经全部集中在皇帝一人手中。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_541', type: 'history', era: '宋·文道昌盛',
        title: '五大名窑的绝唱', time: '公元 1100 - 1127 年（北宋 徽宗钦宗时期）',
        minLevelName: '耕读传家',
        desc: '汝、钧、官、哥、定五大名窑各领风骚。你重金求得一件“雨过天晴云破处”的汝窑天青釉洗，它简直是极简美学的极致代表！',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_542', type: 'history', era: '宋·文道昌盛',
        title: '东京梦华的极致', time: '公元 1100 - 1127 年（北宋 徽宗钦宗时期）',
        minLevelName: '耕读传家',
        desc: '汴河之上舟楫相连，州桥两岸商铺密布。你站在州桥上俯瞰这座拥有百万人口的世界第一大都市，感叹人力造就的无双繁华。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_543', type: 'history', era: '宋·文道昌盛',
        title: '指南针应用于航海', time: '公元 1100 - 1127 年（北宋 徽宗钦宗时期）',
        minLevelName: '耕读传家',
        desc: '你视察即将出海的远洋商船，发现船上已经装备了“水浮司南”。从此大宋海船“舟师识地理，夜则观星，昼则观日，阴晦则观指南针”。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_544', type: 'history', era: '宋·文道昌盛',
        title: '张择端《清明上河图》', time: '公元 1100 - 1127 年（北宋 徽宗钦宗时期）',
        minLevelName: '耕读传家',
        desc: '画院待诏张择端用极其写实的手法，将汴京的市井繁华、漕运繁忙画入长卷。这是大宋帝国最后的也是最伟大的世俗风俗画绝唱。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_545', type: 'history', era: '宋·文道昌盛',
        title: '王希孟《千里江山图》', time: '公元 1111 - 1118 年（北宋 徽宗政和年间）',
        minLevelName: '耕读传家',
        desc: '十八岁的天才少年王希孟，在宋徽宗的亲自指点下，用石青石绿画出了气势磅礴的《千里江山图》。大宋锦绣河山尽在卷中。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_546', type: 'history', era: '宋·文道昌盛',
        title: '宋徽宗瘦金体', time: '公元 1100 - 1127 年（北宋 徽宗钦宗时期）',
        minLevelName: '耕读传家',
        desc: '宋徽宗赵佶独创了“瘦金体”书法，笔画细挺，如屈铁断金，极具傲骨与贵气。可惜，他是个伟大的艺术家，却是个糟糕的皇帝。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_547', type: 'history', era: '宋·文道昌盛',
        title: '《营造法式》颁布', time: '公元 1102 - 1106 年（北宋 徽宗崇宁年间）',
        minLevelName: '耕读传家',
        desc: '将作监李诫编纂了官方的建筑标准《营造法式》。规范了建筑模数和施工工艺，你家盖园林时直接套用这套公式，省时又省力。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_548', type: 'history', era: '宋·文道昌盛',
        title: '海上之盟联金灭辽', time: '北宋宣和二年（1120年）',
        minLevelName: '耕读传家',
        desc: '宋徽宗派使节从海路赴金国，约定夹击辽国。虽然最终灭了百年宿敌大辽，但大宋军队的腐败无能也彻底暴露在了新崛起的虎狼之国面前。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_549', type: 'history', era: '宋·文道昌盛',
        title: '靖康之耻', time: '公元 1127 年（北宋 钦宗靖康二年 / 南宋 高宗建炎元年）',
        minLevelName: '耕读传家',
        desc: '金军攻破汴京，烧杀抢掠。徽钦二帝、数千宗室妃嫔和无数工匠被押往北方苦寒之地，受尽凌辱。百年繁华的北宋轰然灭亡，这是华夏历史上最黑暗的一天！',
        rewards: [{type: 'xp', value: -100}]
    },
    {
        id: 'hist_550', type: 'history', era: '宋·文道昌盛',
        title: '衣冠南渡建立南宋', time: '公元 1127 年（北宋 钦宗靖康二年 / 南宋 高宗建炎元年）',
        minLevelName: '耕读传家',
        desc: '康王赵构在应天府称帝，随后一路逃亡江南，最终定都临安。你抛弃了在北方的庞大家业，护送着残存的典籍和族人随朝廷南逃偏安。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_551', type: 'history', era: '宋·文道昌盛',
        title: '岳飞抗金与郾城大捷', time: '南宋绍兴十年（1140年）',
        minLevelName: '耕读传家',
        desc: '“撼山易，撼岳家军难！”岳飞统帅大军在郾城以拐子马大破金国最精锐的铁浮屠。你热血沸腾，直捣黄龙、迎回二帝的梦想似乎触手可及！',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_552', type: 'history', era: '宋·文道昌盛',
        title: '十二道金牌与莫须有', time: '南宋绍兴十一年（1141年）',
        minLevelName: '耕读传家',
        desc: '宋高宗为了保住皇位和求和，一天内连下十二道金牌将岳飞召回，最终以“莫须有”的罪名将其毒死于风波亭。千古奇冤，你对这个朝廷彻底寒心。',
        rewards: [{type: 'xp', value: -80}]
    },
    {
        id: 'hist_553', type: 'history', era: '宋·文道昌盛',
        title: '绍兴和议', time: '南宋绍兴十一年（1141年）',
        minLevelName: '耕读传家',
        desc: '南宋向金国称臣，每年缴纳大量银绢（岁贡），并划定淮水至大散关为界。南宋彻底放弃了收复中原的希望，换取了偏安江南的残喘之机。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_554', type: 'history', era: '宋·文道昌盛',
        title: '采石大捷', time: '南宋绍兴三十一年（1161年）',
        minLevelName: '耕读传家',
        desc: '金国海陵王完颜亮大举南下灭宋。书生虞允文在采石矶挺身而出，指挥南宋水军利用火器彻底击溃金军渡江主力，保住了江南半壁江山。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_555', type: 'history', era: '宋·文道昌盛',
        title: '隆兴和议', time: '公元 1164 年（南宋 孝宗隆兴二年）',
        minLevelName: '耕读传家',
        desc: '宋孝宗北伐受挫后再次与金和谈。将宋金关系由“君臣”改为“叔侄”，岁贡改称“岁币”并减少数量。外交地位略有回升，但依然屈辱。',
        rewards: [{type: 'xp', value: -10}]
    },
    {
        id: 'hist_556', type: 'history', era: '宋·文道昌盛',
        title: '鹅湖之会', time: '南宋淳熙二年（1175年）',
        minLevelName: '耕读传家',
        desc: '朱熹的“理学”与陆九渊的“心学”在铅山鹅湖寺展开了中国思想史上最著名的一场巅峰辩论。你在台下旁听，只觉思维激荡，如沐春风。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_557', type: 'history', era: '宋·文道昌盛',
        title: '棉花种植的内传', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '原本只在边疆种植的棉花开始向长江和淮河流域推广。你让佃户在旱地上试种棉花，到了秋天收获了洁白保暖的棉絮。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_558', type: 'history', era: '宋·文道昌盛',
        title: '南宋“会子”的发行', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '南宋朝廷为了解决财政危机，大规模发行名为“会子”的纸币。但由于滥发导致严重通货膨胀，你手里的纸币贬值了一半。',
        rewards: [{type: 'gold', value: -40}]
    },
    {
        id: 'hist_559', type: 'history', era: '宋·文道昌盛',
        title: '临安都城的繁华', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '虽然失去了半壁江山，但南宋都城临安（杭州）的繁华丝毫不减。“暖风熏得游人醉，直把杭州作汴州”，你在这里重塑了商业帝国。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_560', type: 'history', era: '宋·文道昌盛',
        title: '泉州港的极盛', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '泉州一跃成为东方第一大港。你站在港口，看着海面上密密麻麻的阿拉伯和波斯商船，异国语言不绝于耳。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_561', type: 'history', era: '宋·文道昌盛',
        title: '遣使招商与厚待外商', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '宋高宗说“市舶之利最厚，若措置得宜，所得动以百万计”。你奉旨带着国书和丝绸前往东南亚各国招徕商船，成绩斐然。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_562', type: 'history', era: '宋·文道昌盛',
        title: '打击海盗护航商船', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '随着海贸暴利，沿海海盗猖獗。你调集大宋水师配备了车船和火器，一举歼灭了盘踞在海岛上的巨寇，商路再次畅通。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_563', type: 'history', era: '宋·文道昌盛',
        title: '祈风仪式的国家化', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '每年冬夏船队出海或回港时，你都要代表朝廷在泉州九日山举行隆重的“祈风”仪式，祈求海神保佑顺风顺水。这是国家对海贸的最高重视。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_564', type: 'history', era: '宋·文道昌盛',
        title: '宋金海上榷场', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '即使在南北对峙交战的时期，你依然在边境沿海设立了海上榷场。通过官方管控的互市，换取了急需的战马和物资。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_565', type: 'history', era: '宋·文道昌盛',
        title: '南宋海军的建立', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '为了抗击金军沿海南下以及保护市舶司，朝廷建立了一支拥有极强水战能力、装备抛石机和火器的常备海军。你深度参与了战船的督造。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_566', type: 'history', era: '宋·文道昌盛',
        title: '辛弃疾的壮志词', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '“醉里挑灯看剑，梦回吹角连营”。作为抗金将领的辛弃疾，将满腔的报国无门之悲愤化作匕首般的词句，你读罢不禁泪流满面。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_567', type: 'history', era: '宋·文道昌盛',
        title: '普及启蒙读物《三字经》', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '“人之初，性本善”。这本融合了历史、地理、理学道德的启蒙读物开始在民间迅速普及。你家祠堂里每天都传出孩童的朗朗诵读声。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_568', type: 'history', era: '宋·文道昌盛',
        title: '朱熹集理学大成', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '大儒朱熹将北宋以来的理学思想融会贯通，确立了客观唯心主义的庞大哲学体系。他的思想即将成为统治中国封建社会后半期的绝对正统。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_569', type: 'history', era: '宋·文道昌盛',
        title: '“存天理，灭人欲”', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '朱熹提出“存天理，灭人欲”，要求人们克服私欲，服从封建道德规范。这种严苛的道德律令让社会秩序极度稳固，但也压抑了人性。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_570', type: 'history', era: '宋·文道昌盛',
        title: '编定《四书章句集注》', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '朱熹为《大学》《中庸》《论语》《孟子》作注。这本书取代了五经的地位，成为了后世科举考试的唯一官方标准教科书！',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_571', type: 'history', era: '宋·文道昌盛',
        title: '陆九渊心学萌芽', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '陆九渊提出“宇宙便是吾心，吾心即是宇宙”，主张“发明本心”。这种不拘泥于经典的内在顿悟哲学，在理学之外开辟了一片新天地。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_572', type: 'history', era: '宋·文道昌盛',
        title: '书院八条目与教育规制', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '朱熹制定了《白鹿洞书院揭示》，明确了教育的目的和修身处事的准则。这套学规不仅成为了大宋的教育大纲，更影响了整个东亚。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_573', type: 'history', era: '宋·文道昌盛',
        title: '道统的确立', time: '公元 1127 - 1279 年（南宋时期）',
        minLevelName: '耕读传家',
        desc: '理学家们构建了从尧舜禹到孔孟再到二程、朱熹的“道统”传承体系。儒家思想的绝对正统地位和排他性在这一刻被神圣化了。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_574', type: 'history', era: '宋·文道昌盛',
        title: '韩侂胄开禧北伐', time: '南宋开禧二年（1206年）',
        minLevelName: '耕读传家',
        desc: '权相韩侂胄试图收复中原，贸然发动北伐，结果因准备不足和将领叛变而大败。韩侂胄的头颅被当成求和的礼物送给了金国。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_575', type: 'history', era: '宋·文道昌盛',
        title: '波斯商人蒲寿庚发迹', time: '公元 1260 - 1279 年（南宋末年）',
        minLevelName: '耕读传家',
        desc: '阿拉伯商人蒲氏家族在泉州垄断香料贸易，富甲天下。你见证了外籍商人在大宋极度自由的商业环境中崛起为地方权贵的过程。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_576', type: 'history', era: '宋·文道昌盛',
        title: '蒙宋联合灭金', time: '南宋端平元年（1234年）',
        minLevelName: '耕读传家',
        desc: '历史重演！南宋联合横扫欧亚的蒙古帝国攻破蔡州，灭亡了金国。百年靖康之耻终于得雪，但更恐怖的死神已经站在了南宋的家门口。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_577', type: 'history', era: '宋·文道昌盛',
        title: '襄阳保卫战的坚守', time: '公元 1260 - 1279 年（南宋末年）',
        minLevelName: '耕读传家',
        desc: '面对蒙古大军的疯狂围攻，大宋军民在襄樊前线死守了整整六年。这种极其顽强悲壮的抵抗，震撼了整个世界，但终究无法挽回国运。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_578', type: 'history', era: '宋·文道昌盛',
        title: '文天祥《过零丁洋》', time: '公元 1260 - 1279 年（南宋末年）',
        minLevelName: '耕读传家',
        desc: '右丞相文天祥兵败被俘，宁死不降，写下了“人生自古谁无死，留取丹心照汗青”。他的民族气节和士大夫的脊梁，成为华夏精神的永恒灯塔。',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_579', type: 'history', era: '宋·文道昌盛',
        title: '崖山海战与南宋灭亡', time: '公元 1279 年（南宋 末帝祥兴二年 / 元朝 世祖至元十六年）',
        minLevelName: '耕读传家',
        desc: '在崖山海战的绝境中，左丞相陆秀夫背着幼帝赵昺投海殉国，十万大宋军民相继跳海宁死不降。繁华三百年的赵宋王朝，以极其惨烈的方式画上了句号。',
        rewards: [{type: 'xp', value: -100}]
    },

    // ===== 第九纪元：元·四海交融（共 61 条）=====
    {
        id: 'hist_580', type: 'history', era: '元·四海交融',
        title: '铁木真统一蒙古', time: '公元 1206 年（南宋 宁宗开禧二年 / 蒙古 成吉思汗元年）',
        minLevelName: '四海行商',
        desc: '斡难河源头召开了忽里勒台大会。铁木真统一了草原各部，被尊为“成吉思汗”。伴随着马蹄声，一个改变世界格局的游牧帝国诞生了。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_581', type: 'history', era: '元·四海交融',
        title: '蒙古大军西征', time: '公元 13 世纪上半叶（蒙古帝国时期）',
        minLevelName: '四海行商',
        desc: '蒙古骑兵兵分多路，横扫中亚、西亚甚至打到了欧洲多瑙河畔。沿途无数国家被征服，欧亚大陆的地理隔阂被暴力的铁蹄踏碎。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_582', type: 'history', era: '元·四海交融',
        title: '灭西夏与金朝', time: '公元 1227-1234 年',
        minLevelName: '四海行商',
        desc: '蒙古采取了“借道宋境”的战略，接连灭亡了西夏和金朝。中国北方的战火极其惨烈，你家族的商队不得不暂时向更远的西域探索。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_583', type: 'history', era: '元·四海交融',
        title: '四大汗国的建立', time: '公元 13 世纪（蒙古帝国时期）',
        minLevelName: '四海行商',
        desc: '成吉思汗将征服的广袤土地分封给子孙，形成了钦察、察合台、窝阔台、伊利四大汗国。你们的商队凭着通行证，可以横跨整个亚洲。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_584', type: 'history', era: '元·四海交融',
        title: '火器在西征中的传播', time: '公元 13 世纪（蒙古帝国时期）',
        minLevelName: '四海行商',
        desc: '蒙古大军在西征过程中，将管形火器和火药配方传入了阿拉伯地区，随后又传入欧洲。你家族研制的火药无意中推动了西方骑士阶层的灭亡。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_585', type: 'history', era: '元·四海交融',
        title: '马可·波罗来华', time: '公元 1260 - 1294 年（元朝 世祖时期）',
        minLevelName: '四海行商',
        desc: '来自威尼斯的年轻商人马可·波罗历经数年抵达大都，甚至在元朝做起了官。他回国后口述的游记，让整个欧洲都对富庶的东方陷入了狂热。',
        rewards: [{type: 'xp', value: 80}, {type: 'gold', value: 30}]
    },
    {
        id: 'hist_586', type: 'history', era: '元·四海交融',
        title: '宋元海商武装化', time: '公元 1271 - 1294 年（元朝 世祖时期）',
        minLevelName: '四海行商',
        desc: '由于海上贸易风险极大，你的商船装备了弓弩甚至火器，商手下兼职水手和护卫。你成为了名副其实的武装海商巨头。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_587', type: 'history', era: '元·四海交融',
        title: '修建登封观星台', time: '公元 1271 - 1294 年（元朝 世祖时期）',
        minLevelName: '四海行商',
        desc: '郭守敬在河南登封主持修建了高大的砖石结构观星台，用于“昼测日影，夜观极星”。你站在宏伟的台下，对古代中国人的探索精神肃然起敬。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_588', type: 'history', era: '元·四海交融',
        title: '忽必烈建立元朝', time: '公元 1271 年（元朝 世祖至元八年）',
        minLevelName: '四海行商',
        desc: '蒙古大汗忽必烈取《易经》“大哉乾元”之意，改国号为“大元”。一个兼具中原正统王朝和草原帝国双重色彩的超级帝国宣告成立！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_589', type: 'history', era: '元·四海交融',
        title: '营建大都城', time: '公元 1271 - 1294 年（元朝 世祖时期）',
        minLevelName: '四海行商',
        desc: '忽必烈任用刘秉忠，以《周礼》为蓝本，在金中都旧址东北营建了极其宏伟的元大都（北京）。街道笔直如棋盘，它是当时世界上最大的城市。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_590', type: 'history', era: '元·四海交融',
        title: '开凿会通河与通惠河', time: '公元 1260 - 1294 年（元朝 世祖时期）',
        minLevelName: '四海行商',
        desc: '为了将江南的粮食直达大都，朝廷开凿了新运河，不再绕道洛阳。京杭大运河全线贯通！你调度着千艘漕船，南粮北运畅通无阻。',
        rewards: [{type: 'gold', value: 80}]
    },
    {
        id: 'hist_591', type: 'history', era: '元·四海交融',
        title: '宣政院管辖西藏', time: '公元 1271 - 1294 年（元朝 世祖时期）',
        minLevelName: '四海行商',
        desc: '朝廷设立宣政院，不仅掌管全国佛教事务，还直接统辖吐蕃地区。标志着西藏正式成为中国中央政府直接管辖下的一个地方行政区域！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_592', type: 'history', era: '元·四海交融',
        title: '回回炮的威力', time: '公元 1273 年（南宋 襄阳之战）',
        minLevelName: '四海行商',
        desc: '元军在攻打襄阳时，引进了阿拉伯人制造的巨型抛石机（回回炮）。重达百斤的巨石砸烂了坚不可摧的城墙，科技的代差决定了战争的胜负。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_593', type: 'history', era: '元·四海交融',
        title: '大元灭宋统一全国', time: '公元 1279 年（南宋 末帝祥兴二年 / 元朝 世祖至元十六年）',
        minLevelName: '四海行商',
        desc: '崖山海战后，南宋彻底灭亡。元朝结束了自唐末以来长达三百多年的分裂割据局面，中国历史版图达到了前所未有的庞大！',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_594', type: 'history', era: '元·四海交融',
        title: '郭守敬修《授时历》', time: '公元 1281 年（元朝 世祖至元十八年）',
        minLevelName: '四海行商',
        desc: '科学家郭守敬测算的一年周期与现行公历仅差26秒，比欧洲《格里高利历》早了三百年！你通过这本历法，精准预测了农时。',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_595', type: 'history', era: '元·四海交融',
        title: '斡脱商人的特权', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '大批西域商人（斡脱）替蒙古贵族放高利贷并经商，享有免税等巨大特权。你无奈地看着他们垄断了利润最丰厚的跨国贸易。',
        rewards: [{type: 'gold', value: -20}]
    },
    {
        id: 'hist_596', type: 'history', era: '元·四海交融',
        title: '元代纸币“交钞”', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '元朝是世界上第一个完全以纸币（交钞）作为流通货币的朝代。你卖掉一船丝绸，只带回了几叠轻飘飘的纸钞，做跨国生意再也不用拉着几大车铜钱了。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_597', type: 'history', era: '元·四海交融',
        title: '汪大渊出海远航', time: '公元 1341 - 1370 年（元朝 顺帝至正年间）',
        minLevelName: '四海行商',
        desc: '民间航海家汪大渊两次随商船出海，最远到达了非洲东海岸，并写下了《岛夷志略》。大元商人的探索精神丝毫不亚于西方的航海家。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_598', type: 'history', era: '元·四海交融',
        title: '青花瓷的远销', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '景德镇使用进口的“苏麻离青”钴料，烧制出了极其精美的元青花瓷器。这种带有浓郁伊斯兰审美风格的瓷器在中东被贵族疯狂抢购。',
        rewards: [{type: 'gold', value: 70}]
    },
    {
        id: 'hist_599', type: 'history', era: '元·四海交融',
        title: '市舶法定税', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '元朝颁布了《市舶法则》，规定对粗货和细货实行不同的抽分比例。你的商船虽然要缴纳重税，但官方的护航让你免受了海盗的劫掠。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_600', type: 'history', era: '元·四海交融',
        title: '草原丝绸之路繁荣', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '不仅是海路，横跨欧亚大草原的陆地丝绸之路也迎来了空前繁荣。你的驼队从大都出发，一路向西，沿途水草丰美，驿站林立。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_601', type: 'history', era: '元·四海交融',
        title: '香料的奢侈消费', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '随着海外贸易的发达，胡椒、苏木等香料大量输入。你家不仅用香料调味，甚至用沉香木建造亭台，展现了极度的奢靡。',
        rewards: [{type: 'gold', value: 20}]
    },
    {
        id: 'hist_602', type: 'history', era: '元·四海交融',
        title: '东西方物种大交换', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '你随商船引进了高粱的新品种，并将中国的果树嫁接技术传授给了波斯商人。蒙古人的征服客观上推动了全球农业物种的交流。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_603', type: 'history', era: '元·四海交融',
        title: '黄道婆改进棉纺织', time: '公元 1271 - 1368 年（元代时期）',
        minLevelName: '四海行商',
        desc: '黄道婆从海南岛黎族那里学来了先进的棉纺织技术，发明了三锭脚踏纺车。松江地区迅速成为了全国的棉纺织中心，你全家都穿上了保暖的棉布。',
        rewards: [{type: 'gold', value: 80}]
    },
    {
        id: 'hist_604', type: 'history', era: '元·四海交融',
        title: '发明木活字印刷', time: '公元 1271 - 1368 年（元代时期）',
        minLevelName: '四海行商',
        desc: '王祯不仅懂农业，还发明了木活字和转轮排字盘。你们家族的书坊引进此项技术后，书籍印刷的排版速度快得令人咋舌！',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_605', type: 'history', era: '元·四海交融',
        title: '关汉卿与《窦娥冤》', time: '公元 1271 - 1368 年（元代时期）',
        minLevelName: '四海行商',
        desc: '“地也，你不分好歹何为地！天也，你错勘贤愚枉做天！”你在勾栏里看了关汉卿的杂剧，那充满血泪的呐喊震撼了所有市井百姓。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_606', type: 'history', era: '元·四海交融',
        title: '王实甫撰《西厢记》', time: '公元 1271 - 1368 年（元代时期）',
        minLevelName: '四海行商',
        desc: '“愿天下有情的都成了眷属”。你翻阅了这本冲破封建礼教束缚的戏曲剧本，其文辞华丽，极大地丰富了元代的世俗文化。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_607', type: 'history', era: '元·四海交融',
        title: '元散曲的风靡', time: '公元 1271 - 1368 年（元代时期）',
        minLevelName: '四海行商',
        desc: '伴随着胡乐的传入，一种更加长短不齐、通俗直白的“散曲”开始流行。你在酒肆中听人弹唱马致远的《天净沙·秋思》，感受到了苍凉的羁旅之情。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_608', type: 'history', era: '元·四海交融',
        title: '赵孟頫书画同源', time: '公元 1271 - 1368 年（元代时期）',
        minLevelName: '四海行商',
        desc: '作为宋朝宗室却入元做官的赵孟頫，提出了“书画本来同”的理论。你临摹他的楷书，感受到了一种复古与创新的完美融合。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_609', type: 'history', era: '元·四海交融',
        title: '景德镇设浮梁磁局', time: '公元 1271 - 1368 年（元代时期）',
        minLevelName: '四海行商',
        desc: '朝廷极其重视瓷器，在景德镇设立了官方机构“浮梁磁局”。最高超的工匠被集中起来，我国制瓷业的中心彻底确立。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_610', type: 'history', era: '元·四海交融',
        title: '阿拉伯天文学的引入', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '大都设立了回回司天台，大量阿拉伯天文仪器和星表被翻译引入。中西天文学的碰撞让大元帝国拥有了当时最广阔的宇宙视野。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_611', type: 'history', era: '元·四海交融',
        title: '极其发达的驿站网络', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '为了控制广袤的疆域，元朝设立了遍布全国的“站赤”（驿站）系统。你作为驿道总管，看着飞奔的驿马将政令和情报以前所未有的速度传达。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_612', type: 'history', era: '元·四海交融',
        title: '设立急递铺', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '针对十万火急的军情，元朝每十里或十五里设置一个急递铺。铺卒腰系响铃，日夜飞奔。你深知这套系统是维系大帝国神经的命脉。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_613', type: 'history', era: '元·四海交融',
        title: '海运漕粮的大规模试水', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '除了运河，你开创性地开辟了从刘家港（太仓）经黄海直达直沽（天津）的海上运粮航线。大自然的风力极大节省了国家的运输成本。',
        rewards: [{type: 'gold', value: 70}]
    },
    {
        id: 'hist_614', type: 'history', era: '元·四海交融',
        title: '回族的形成（回回）', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '大量波斯人、阿拉伯人迁入中国，他们与汉、蒙古、维吾尔等族长期杂居通婚，逐渐形成了一个全新的民族——回族。这是中华民族大家庭大交融的缩影。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_615', type: 'history', era: '元·四海交融',
        title: '宗教的宽容与并存', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '在大都街头，你同时能看到道观、佛寺、清真寺甚至天主教堂（也里可温）。元帝国对各种宗教采取了极其开放和包容的保护政策。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_616', type: 'history', era: '元·四海交融',
        title: '站户的沉重劳役', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '为了维持庞大的驿站运转，朝廷签发了大量平民充当“站户”。你看到他们常年自备马匹、提供饮食，被繁重的劳役压得家破人亡。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_617', type: 'history', era: '元·四海交融',
        title: '大都的钟鼓楼报时', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '你负责管理大都城中心的钟楼和鼓楼。“晨钟暮鼓”成为了都城百姓作息的标准，城市的管理变得极其精确和现代化。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_618', type: 'history', era: '元·四海交融',
        title: '牌符制度的严格执行', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '官员和使节在驿道上通行必须佩戴代表不同等级的金虎符、银符等。你凭借手中的金牌，在全国任何驿站都能获得最顶级的物资供给。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_619', type: 'history', era: '元·四海交融',
        title: '刘家港的漕运枢纽', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '由于海运兴起，江苏刘家港成为了“天下第一码头”。你在这里设立了庞大的转运中心，将江南的财富源源不断地输送给北方的朝廷。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_620', type: 'history', era: '元·四海交融',
        title: '色目人的特权地位', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '作为来自西域的“色目人”，他们在帝国的官僚体系和经济贸易中享有仅次于蒙古人的特权地位。中外族群的政治地位发生了倒转。',
        rewards: [{type: 'xp', value: 20}]
    },
    {
        id: 'hist_621', type: 'history', era: '元·四海交融',
        title: '多语言翻译机构设立', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '面对几十种不同的语言，你在驿站中枢设立了回回国子学和蒙古国子学，培养了大批翻译人才。这保证了政令能下达到最偏远的藩属国。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_622', type: 'history', era: '元·四海交融',
        title: '全面推行行省制度', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '忽必烈将中书省的权力外派（行中书省），全国划分为十大行省。这种“犬牙交错”的划界方式打破了山川形便，极大强化了中央对地方的控制。',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_623', type: 'history', era: '元·四海交融',
        title: '设立澎湖巡检司', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '元政府在澎湖岛设立了巡检司，负责管辖澎湖和琉球（台湾）。这是历史上中央政府首次在台湾地区正式建立的行政机构！',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_624', type: 'history', era: '元·四海交融',
        title: '设立北庭都元帅府', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '为了加强对西域的管辖，朝廷设立了北庭都元帅府等机构管理新疆地区。汉唐经营西域的传统在元代得到了更为稳固的继承。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_625', type: 'history', era: '元·四海交融',
        title: '四等人制的社会压迫', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '为了巩固统治，统治者将全国人分为蒙古人、色目人、汉人、南人四等。你在官场中因南人身份处处受到排挤，社会矛盾如同火药桶般积累。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_626', type: 'history', era: '元·四海交融',
        title: '达鲁花赤的监督', time: '公元 1271 - 1368 年（元朝时期）',
        minLevelName: '四海行商',
        desc: '中央向各级地方官署派驻了由蒙古人或色目人担任的“达鲁花赤”（镇守官）掌握实权。即使你官拜平章政事，也要看他们的脸色行事。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_627', type: 'history', era: '元·四海交融',
        title: '王祯著《农书》', time: '公元 1313 年（元朝 仁宗皇庆二年）',
        minLevelName: '四海行商',
        desc: '农学家王祯系统总结了南北方的农业技术，并附带了大量农具图谱。你家按图索骥打造了水力连磨，农产品的加工效率大幅提升。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_628', type: 'history', era: '元·四海交融',
        title: '恢复科举取士', time: '公元 1315 年（元仁宗延祐二年）',
        minLevelName: '四海行商',
        desc: '停废多年的科举终于恢复，但名额向蒙古人和色目人极度倾斜，且右榜（汉人）的考题难度远大于左榜。但这终究给汉族士人留下了一线生机。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_629', type: 'history', era: '元·四海交融',
        title: '忽思慧撰《饮膳正要》', time: '公元 1330 年（元朝 文宗至顺元年）',
        minLevelName: '四海行商',
        desc: '宫廷饮膳太医忽思慧编写了我国第一部营养学专著。你学着书里的方法，用食疗来调理族人的身体，家族的平均寿命都提高了。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_630', type: 'history', era: '元·四海交融',
        title: '理学在北方的复兴', time: '公元 14 世纪中叶（元朝中后期）',
        minLevelName: '四海行商',
        desc: '经过元初的文化断层，程朱理学被重新确立为官方哲学。你家族的书院重新开张，以《四书集注》作为核心教材教授学子。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_631', type: 'history', era: '元·四海交融',
        title: '皇位继承的频繁动荡', time: '公元 14 世纪中叶（元朝中后期）',
        minLevelName: '四海行商',
        desc: '元武宗死后，因为没有建立完善的嫡长子继承制，几十年内换了多位皇帝，甚至爆发了“两都之战”。最高权力的动荡让朝政极度腐败瘫痪。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_632', type: 'history', era: '元·四海交融',
        title: '伊本·白图泰游历', time: '公元 1351 - 1368 年（元朝末年）',
        minLevelName: '四海行商',
        desc: '摩洛哥大旅行家伊本·白图泰从海路抵达中国。你接待了这位见多识广的学者，他惊叹于大元帝国纸币的便捷和城市规模的庞大。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_633', type: 'history', era: '元·四海交融',
        title: '滥发纸币导致的通胀', time: '公元 1351 - 1368 年（元朝末年）',
        minLevelName: '四海行商',
        desc: '为了弥补庞大的财政亏空，朝廷疯狂印制新钞（如至正交钞）。物价瞬间飞涨万倍，老百姓手中的财富化为废纸，经济系统彻底崩溃。',
        rewards: [{type: 'gold', value: -80}]
    },
    {
        id: 'hist_634', type: 'history', era: '元·四海交融',
        title: '治理黄河征发民夫', time: '公元 1351 年（元朝 顺帝至正十一年）',
        minLevelName: '四海行商',
        desc: '黄河决口，元顺帝下令强征十五万民夫和两万士兵修筑黄河堤坝。残酷的监工和贪污的粮饷，将处于水深火热中的百姓逼到了绝境。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_635', type: 'history', era: '元·四海交融',
        title: '石人一只眼挑动天下反', time: '公元 1351 年（元朝 顺帝至正十一年）',
        minLevelName: '四海行商',
        desc: '白莲教首领韩山童等人在修河工地上埋下独眼石人，散布谣言。当石人被挖出时，彻底引爆了修河民夫的怒火。元末大起义正式爆发！',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_636', type: 'history', era: '元·四海交融',
        title: '红巾军大起义', time: '公元 1351 年（元朝 顺帝至正十一年）',
        minLevelName: '四海行商',
        desc: '头裹红巾的起义军席卷大江南北，打出“弥勒降生，明王出世”的旗号。你眼看大元帝国的庞大机器在农民起义的怒潮中开始土崩瓦解。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_637', type: 'history', era: '元·四海交融',
        title: '刘福通拥立小明王', time: '公元 1355 年（元朝 顺帝至正十五年）',
        minLevelName: '四海行商',
        desc: '红巾军将领刘福通拥立韩林儿为帝，建国号大宋（史称韩宋政权）。北方各路红巾军名义上归于一统，对大都形成了直接威胁。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_638', type: 'history', era: '元·四海交融',
        title: '朱元璋攻占集庆', time: '公元 1356 年（元朝 顺帝至正十六年）',
        minLevelName: '四海行商',
        desc: '红巾军将领朱元璋渡过长江攻下集庆，改名应天府（南京）。他采纳了“高筑墙，广积粮，缓称王”的战略，在群雄中悄然崛起。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_639', type: 'history', era: '元·四海交融',
        title: '鄱阳湖水战', time: '公元 1363 年（元朝 顺帝至正二十三年）',
        minLevelName: '四海行商',
        desc: '朱元璋与陈友谅在鄱阳湖展开了中国历史上规模空前的大水战。朱元璋以弱胜强，消灭了南方最强大的军阀，奠定了统一江南的基础。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_640', type: 'history', era: '元·四海交融',
        title: '大明建立与北伐大都', time: '公元 1368 年（明朝 太祖洪武元年）',
        minLevelName: '四海行商',
        desc: '朱元璋在南京称帝建立大明。大将徐达、常遇春率军北伐，攻克元大都。元顺帝带着残兵败将仓皇逃回漠北草原（北元）。大元帝国在中国的统治正式结束！',
        rewards: [{type: 'xp', value: -100}]
    },

    // ===== 第十纪元：明·日月重开（共 200 条）=====
    {
        id: 'hist_641', type: 'history', era: '明·日月重开',
        title: '朱元璋建立大明', time: '公元 1368 年（明朝 太祖洪武元年）',
        minLevelName: '卫所军户',
        desc: '“驱逐胡虏，恢复中华”。朱元璋在南京称帝，建立明朝。你随大军攻入元大都，汉家衣冠终于在华夏大地重见天日。',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_642', type: 'history', era: '明·日月重开',
        title: '编造赋役黄册', time: '公元 1368 - 1398 年（明朝 洪武年间）',
        minLevelName: '卫所军户',
        desc: '朝廷严格清查户口，编制了极其详尽的“黄册”。你家的人口、职业被死死地钉在了军户的册子上，世代当兵，不得更改。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_643', type: 'history', era: '明·日月重开',
        title: '绘制鱼鳞图册', time: '公元 1368 - 1398 年（明朝 洪武年间）',
        minLevelName: '卫所军户',
        desc: '官府派人丈量了你家的田地，并绘制了形似鱼鳞的图册。虽然税收变得严密，但你家的土地产权也得到了官方的确认。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_644', type: 'history', era: '明·日月重开',
        title: '推行里甲制', time: '公元 1368 - 1398 年（明朝 洪武年间）',
        minLevelName: '卫所军户',
        desc: '十户为一甲，一百一十户为一里。你被轮派为里长，不仅要催交赋税，还要负责乡里的治安和教化。皇权第一次真正下县了。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_645', type: 'history', era: '明·日月重开',
        title: '确立卫所制度', time: '公元 1368 - 1398 年（明朝 洪武年间）',
        minLevelName: '卫所军户',
        desc: '大明在全国要冲设立卫所。你被编入卫所“三分守城，七分屯种”，朝廷骄傲地宣称：养兵百万，不费百姓一粒米。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_646', type: 'history', era: '明·日月重开',
        title: '《大明律》颁布', time: '公元 1368 - 1398 年（明朝 洪武年间）',
        minLevelName: '卫所军户',
        desc: '朝廷颁布了极其严苛的《大明律》，重惩贪官污吏，同时也对百姓的穿衣、住房做了极其森严的等级规定。你感受到了一股肃杀之气。',
        rewards: [{type: 'xp', value: -20}]
    },
    {
        id: 'hist_647', type: 'history', era: '明·日月重开',
        title: '发行大明宝钞', time: '公元 1375 年（明朝 太祖洪武八年）',
        minLevelName: '卫所军户',
        desc: '朝廷印发纸币“大明宝钞”，但只发不收，不准兑换金银。没过几年，你手里的宝钞就贬值成废纸了，民间只能偷偷用碎银交易。',
        rewards: [{type: 'gold', value: -30}]
    },
    {
        id: 'hist_648', type: 'history', era: '明·日月重开',
        title: '沐英镇守云南', time: '公元 1368 - 1424 年（明朝初年）',
        minLevelName: '卫所军户',
        desc: '大将沐英平定云南后，世代镇守西南边疆。你随军屯垦，不仅保卫了西南主权，还促进了当地民族的融合与农业大开发。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_649', type: 'history', era: '明·日月重开',
        title: '修筑南京明城墙', time: '公元 1368 - 1398 年（明朝 洪武年间）',
        minLevelName: '卫所军户',
        desc: '朱元璋下令修建南京城墙。作为砖瓦匠，你烧制的每一块城砖上都必须刻上你的名字以保证质量，这城墙坚不可摧。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_650', type: 'history', era: '明·日月重开',
        title: '设立景德镇御窑厂', time: '公元 1368 - 1398 年（明朝 洪武年间）',
        minLevelName: '卫所军户',
        desc: '朝廷在景德镇设立了专门为皇家烧制瓷器的御窑厂。你掌握着最核心的拉胚和烧窑技术，但极品瓷器都上贡了，不属于你。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_651', type: 'history', era: '明·日月重开',
        title: '洪武海禁政策', time: '公元 1368 - 1398 年（明朝 洪武年间）',
        minLevelName: '卫所军户',
        desc: '朱元璋下令“寸板不许下海”，严禁民间私人海外贸易。你家世世代代的商船被迫在港口里烂掉，只能偷偷去海上打渔。',
        rewards: [{type: 'gold', value: -40}]
    },
    {
        id: 'hist_652', type: 'history', era: '明·日月重开',
        title: '设立殿阁大学士', time: '公元 1368 - 1398 年（明朝 洪武年间）',
        minLevelName: '卫所军户',
        desc: '废除丞相后朱元璋深感政务繁重，设立了殿阁大学士作为私人顾问。作为小官的你虽然没有实权，但触碰到了中枢机密。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_653', type: 'history', era: '明·日月重开',
        title: '八股取士定式', time: '公元 1368 - 1398 年（明朝 洪武年间）',
        minLevelName: '卫所军户',
        desc: '朝廷规定科举必须从四书五经中命题，且采用死板的“八股文”格式。你为了中举只能日夜背诵集注，思想被彻底禁锢。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_654', type: 'history', era: '明·日月重开',
        title: '设立锦衣卫', time: '公元 1368 - 1398 年（明朝 洪武年间）',
        minLevelName: '卫所军户',
        desc: '朱元璋设立锦衣卫，掌管刑狱，越过司法机关直接审讯。作为言官你每天上朝如履薄冰，生怕因为一句话被酷刑折磨致死。',
        rewards: [{type: 'xp', value: -40}, {type: 'gold', value: 30}]
    },
    {
        id: 'hist_655', type: 'history', era: '明·日月重开',
        title: '蓝玉案大清洗', time: '公元 1393 年（明朝 太祖洪武二十六年）',
        minLevelName: '卫所军户',
        desc: '朱元璋为了给皇太孙铺平道路，族诛大将蓝玉，牵连被杀者高达一万五千人。你悲哀地看着开国功臣被屠戮殆尽。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_656', type: 'history', era: '明·日月重开',
        title: '空印案与郭桓案', time: '公元 1368 - 1398 年（明朝 洪武年间）',
        minLevelName: '卫所军户',
        desc: '朱元璋重拳打击贪污，数万名地方官僚和地主被处死。严刑峻法虽然整顿了吏治，但也造成了极大的冤假错案。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_657', type: 'history', era: '明·日月重开',
        title: '罗贯中《三国演义》', time: '公元 1368 - 1424 年（明朝初期）',
        minLevelName: '卫所军户',
        desc: '章回体小说《三国演义》在民间疯狂流传。你在茶馆听书，“尊刘贬曹”的忠义思想深深烙印在了你的价值观中。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_658', type: 'history', era: '明·日月重开',
        title: '胡惟庸案与废丞相', time: '公元 1380 年（明朝 洪武十三年）',
        minLevelName: '卫所军户',
        desc: '朱元璋借胡惟庸谋反案大肆屠杀。随后下令彻底废除存在了1600多年的丞相制度，六部直接对皇帝负责。皇权登峰造极！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_659', type: 'history', era: '明·日月重开',
        title: '靖难之役爆发', time: '公元 1399 - 1402 年',
        minLevelName: '卫所军户',
        desc: '建文帝削藩，燕王朱棣以“清君侧”为名在北平起兵。你被迫卷入了这场残酷的皇族内战，三年血战，尸骨如山。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_660', type: 'history', era: '明·日月重开',
        title: '方孝孺诛十族', time: '公元 1402 年（明朝 建文四年 / 成祖永乐元年）',
        minLevelName: '卫所军户',
        desc: '大儒方孝孺拒绝为篡位的朱棣起草诏书，被残忍地诛杀“十族”（连带门生朋友）。江南文人的脊梁被屠刀无情折断。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_661', type: 'history', era: '明·日月重开',
        title: '解缙主编《永乐大典》', time: '公元 1403 - 1408 年',
        minLevelName: '卫所军户',
        desc: '解缙等人奉命编纂了世界上最大的一部百科全书。你看着汇集了古代所有经典的两万多卷巨著，震撼于大明的文化气魄。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_662', type: 'history', era: '明·日月重开',
        title: '神机营的建立', time: '公元 1403 - 1424 年（明朝 成祖永乐年间）',
        minLevelName: '卫所军户',
        desc: '你被选入了京军三大营中最精锐的“神机营”，装备了火铳和火炮。在征讨蒙古的战场上，排枪齐射的威力让游牧骑兵闻风丧胆。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_663', type: 'history', era: '明·日月重开',
        title: '营建北京紫禁城', time: '公元 1403 - 1424 年（明朝 成祖永乐年间）',
        minLevelName: '卫所军户',
        desc: '你被征调到北京，参与了世界古代史上规模最大的宫殿建筑群紫禁城的营建。红墙黄瓦展现了帝国的无上威仪。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_664', type: 'history', era: '明·日月重开',
        title: '疏浚京杭大运河', time: '公元 1403 - 1424 年（明朝 成祖永乐年间）',
        minLevelName: '卫所军户',
        desc: '为了保证北京的粮食供应，朝廷下令疏浚元朝的旧运河。你修建了复杂的闸坝系统，大运河再次成为帝国经济大动脉。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_665', type: 'history', era: '明·日月重开',
        title: '郑和首次下西洋', time: '公元 1405 年（明朝 成祖永乐3年）',
        minLevelName: '卫所军户',
        desc: '郑和率领两万七千人的庞大舰队从刘家港起航。你站在甲板上，满载大明的国威与丝绸，驶向未知的西洋。',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_666', type: 'history', era: '明·日月重开',
        title: '宝船穿越马六甲', time: '公元 1405 - 1433 年（明朝 永乐至宣德年间）',
        minLevelName: '卫所军户',
        desc: '庞大的舰队如同海上移动的城市穿越了马六甲海峡。沿途土邦国王无不敬畏臣服，你体会到了作为天朝子民的无上荣光。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_667', type: 'history', era: '明·日月重开',
        title: '非洲木骨都束朝贡', time: '公元 1403 - 1424 年（明朝 成祖永乐年间）',
        minLevelName: '卫所军户',
        desc: '你跟随船队从非洲带来了一只长颈鹿。满朝文武将其当做传说中的神兽“麒麟”，皇帝龙颜大悦，大明举国狂欢。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_668', type: 'history', era: '明·日月重开',
        title: '远航抵东非红海', time: '公元 1405 - 1433 年（明朝 永乐至宣德年间）',
        minLevelName: '卫所军户',
        desc: '历经狂风巨浪，你们的舰队最远到达了红海沿岸和非洲东海岸。大明和平的使节将友谊播撒到了极远的大陆。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_669', type: 'history', era: '明·日月重开',
        title: '内阁制度正式确立', time: '公元 1403 - 1424 年（明朝 成祖永乐年间）',
        minLevelName: '卫所军户',
        desc: '朱棣正式确立内阁制度，大学士开始参与机务。虽然品秩仅有五品，但你作为皇帝身边的近臣，已经能够左右朝局。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_670', type: 'history', era: '明·日月重开',
        title: '剿灭海盗陈祖义', time: '公元 1407 年（明朝 成祖永乐5年）',
        minLevelName: '卫所军户',
        desc: '郑和舰队在旧港遭遇巨寇陈祖义。大明水师利用火器与巨舰以摧枯拉朽之势全歼海盗，打通了东南亚的海上咽喉。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_671', type: 'history', era: '明·日月重开',
        title: '设立奴儿干都司', time: '公元 1409 年（明朝 成祖永乐7年）',
        minLevelName: '卫所军户',
        desc: '明朝在黑龙江入海口设立奴儿干都司，管辖广袤的东北地区。你在冰天雪地中巡逻，大明的龙旗插在了极其辽阔的白山黑水之间。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_672', type: 'history', era: '明·日月重开',
        title: '设立东厂', time: '公元 1420 年（明朝 成祖永乐18年）',
        minLevelName: '卫所军户',
        desc: '明成祖朱棣为了镇压反对派，设立了由宦官直接掌控的特务机构“东厂”，权力在锦衣卫之上。宦官干政的魔盒被打开了。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_673', type: 'history', era: '明·日月重开',
        title: '朱棣迁都北京', time: '公元 1421 年（明朝 成祖永乐19年）',
        minLevelName: '卫所军户',
        desc: '“天子守国门”。明成祖朱棣正式将首都从南京迁往北京。你在寒风中驻守九边，感受到了帝国防御重心的彻底北移。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_674', type: 'history', era: '明·日月重开',
        title: '宣德炉铸造', time: '公元 1426 - 1435 年（明朝 宣宗宣德年间）',
        minLevelName: '卫所军户',
        desc: '你参与了利用进口“风磨铜”铸造铜香炉的工程。历经十二次精炼，这批宣德炉色泽晶莹温润，成为了稀世珍宝。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_675', type: 'history', era: '明·日月重开',
        title: '下西洋的彻底终结', time: '公元 1426 - 1487 年（明朝 宣宗至宪宗时期）',
        minLevelName: '卫所军户',
        desc: '由于远洋航行极度消耗国库，朝廷下令彻底终止下西洋，宝船烂在船坞，海图被毁。中国错失了走向大航海时代的机会！',
        rewards: [{type: 'xp', value: -80}]
    },
    {
        id: 'hist_676', type: 'history', era: '明·日月重开',
        title: '宣德朝确立“票拟”权', time: '公元 1426 - 1435 年（明朝 宣宗宣德年间）',
        minLevelName: '卫所军户',
        desc: '作为首辅，你获得了用小票在奏章上写出处理意见的“票拟”大权！你实质上已经拥有了相权，成为大明文官之首。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_677', type: 'history', era: '明·日月重开',
        title: '施耐庵《水浒传》', time: '公元 15 世纪（明朝中前期）',
        minLevelName: '卫所军户',
        desc: '《水浒传》深刻揭示了“官逼民反”的现实。你看着书里梁山好汉替天行道的故事，内心燃起了一股反抗不公的热血。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_678', type: 'history', era: '明·日月重开',
        title: '土木堡之变', time: '公元 1449 年（明朝 英宗正统十四年）',
        minLevelName: '卫所军户',
        desc: '明英宗在太监王振怂恿下御驾亲征，结果在土木堡被瓦剌大军包围。几十万明军精锐全军覆没，皇帝被俘，你侥幸装死逃回关内。',
        rewards: [{type: 'xp', value: -80}]
    },
    {
        id: 'hist_679', type: 'history', era: '明·日月重开',
        title: '北京保卫战的死战', time: '公元 1449 年（明朝 英宗正统十四年）',
        minLevelName: '卫所军户',
        desc: '兵部尚书于谦下令死守北京。你站在德胜门外，与瓦剌骑兵展开了极其惨烈的肉搏战，最终保住了大明帝国的江山！',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_680', type: 'history', era: '明·日月重开',
        title: '首创景泰蓝工艺', time: '公元 1450 - 1457 年（明朝 代宗景泰年间）',
        minLevelName: '卫所军户',
        desc: '你在作坊里采用铜胎掐丝珐琅工艺，烧制出了色彩极其艳丽的“景泰蓝”。结合了瓷器、铜器和珐琅的新工艺震撼世界。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_681', type: 'history', era: '明·日月重开',
        title: '于谦整顿军务保卫京师', time: '公元 1450 - 1457 年（明朝 代宗景泰年间）',
        minLevelName: '卫所军户',
        desc: '土木堡之变后，你协助兵部尚书于谦保卫了北京，并大力整顿京军改革军制，使大明的国防力量重新恢复。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_682', type: 'history', era: '明·日月重开',
        title: '成化斗彩鸡缸杯', time: '公元 1465 - 1487 年（明朝 宪宗成化年间）',
        minLevelName: '卫所军户',
        desc: '你开创性地将釉下青花和釉上彩结合，烧制出了极其精巧雅致的“斗彩鸡缸杯”。这种杯子深受皇帝喜爱，后世更是价值连城！',
        rewards: [{type: 'gold', value: 70}]
    },
    {
        id: 'hist_683', type: 'history', era: '明·日月重开',
        title: '设立西厂', time: '公元 1465 - 1487 年（明朝 宪宗成化年间）',
        minLevelName: '卫所军户',
        desc: '朝廷增设了比东厂更加恐怖的“西厂”，由太监汪直统领，大肆罗织罪名。作为言官的你，连在家里叹气都不敢出声。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_684', type: 'history', era: '明·日月重开',
        title: '东南走私网络兴起', time: '公元 15 世纪末 - 16 世纪初（明朝中叶）',
        minLevelName: '卫所军户',
        desc: '由于官方海禁，民间走私贸易暴利惊人。你冒着杀头的危险，在暗夜中与日本和东南亚商人进行着不见光的海上贸易。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_685', type: 'history', era: '明·日月重开',
        title: '吴承恩《西游记》', time: '公元 16 世纪（明代中期）',
        minLevelName: '卫所军户',
        desc: '孙悟空大闹天宫、蔑视神佛的叛逆精神，迎合了明中后期市民阶层渴望思想解放的社会心理。你对这奇幻世界着迷不已。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_686', type: 'history', era: '明·日月重开',
        title: '吴门画派唐寅文徵明', time: '公元 16 世纪（明朝中期）',
        minLevelName: '卫所军户',
        desc: '以唐寅、文徵明为首的“吴门四家”崛起。你求得一幅唐寅的仕女图，其画风秀润、雅俗共赏，市价千金。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_687', type: 'history', era: '明·日月重开',
        title: '提出“致良知”', time: '公元 16 世纪（明代中期）',
        minLevelName: '卫所军户',
        desc: '你向弟子们讲授“致良知”，认为每个人内心都有判别是非的绝对道德准则，不需要向外死读书。这彻底打破了理学的僵化！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_688', type: 'history', era: '明·日月重开',
        title: '倡导“知行合一”', time: '公元 16 世纪（明代中期）',
        minLevelName: '卫所军户',
        desc: '你主张理论必须与实践结合，知道做不到等于不知道。这种强调行动力的学说，成为了改造社会的最强精神力量。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_689', type: 'history', era: '明·日月重开',
        title: '心外无理的唯心主义高峰', time: '公元 16 世纪（明代中期）',
        minLevelName: '卫所军户',
        desc: '“你未看此花时，此花与汝心同归于寂”。你确立了主观唯心主义的极顶，释放了人类主体意识的巨大力量。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_690', type: 'history', era: '明·日月重开',
        title: '匠户制度的残酷束缚', time: '公元 1368 - 1449 年（明朝前期）',
        minLevelName: '卫所军户',
        desc: '大明实行严格的匠户制度，你必须轮班无偿为官府服役。手艺再好也无法致富，子孙后代只能困在作坊里，你感到深深绝望。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_691', type: 'history', era: '明·日月重开',
        title: '永乐宣德青花瓷', time: '公元 1368 - 1449 年（明朝前期）',
        minLevelName: '卫所军户',
        desc: '通过郑和下西洋带来的“苏麻离青”钴料，你烧制出了发色浓艳、带有晕散效果的永乐青花大盘，成为了中国陶瓷史的绝唱。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_692', type: 'history', era: '明·日月重开',
        title: '龙江船厂造宝船', time: '公元 1368 - 1449 年（明朝前期）',
        minLevelName: '卫所军户',
        desc: '你在南京龙江船厂参与督造了长达四十四丈的大海船。极其精密的鲁班锁和水密舱技术，让大明的造船业领步全球。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_693', type: 'history', era: '明·日月重开',
        title: '朝贡贸易确立', time: '公元 1368 - 1449 年（明朝前期）',
        minLevelName: '卫所军户',
        desc: '明朝只允许外国以“朝贡”的名义来华贸易，且“厚往薄来”。你看着一船船精美的丝绸送出去，换回一堆没用的香料和野兽。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_694', type: 'history', era: '明·日月重开',
        title: '引进佛郎机炮', time: '公元 1506 - 1566 年（明朝 正德至嘉靖年间）',
        minLevelName: '卫所军户',
        desc: '明朝军器局迅速仿制缴获的西洋后膛速射炮“佛郎机”，装备水师和边防。明军海防火力上了一个新台阶。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_695', type: 'history', era: '明·日月重开',
        title: '王阳明龙场悟道', time: '公元 1508 年（明朝 正德三年）',
        minLevelName: '卫所军户',
        desc: '王守仁被贬贵州龙场，在生死边缘顿悟了“圣人之道，吾性自足，向之求理于事物者误也”。【阳明心学】就此诞生！',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_696', type: 'history', era: '明·日月重开',
        title: '王阳明平定宁王之乱', time: '公元 1519 年（明朝 正德十四年）',
        minLevelName: '卫所军户',
        desc: '宁王朱宸濠叛乱。王守仁运用“知行合一”兵法，仅用四十三天就平定了这场大叛乱。你见证了立德、立功、立言的真圣人！',
        rewards: [{type: 'xp', value: 90}]
    },
    {
        id: 'hist_697', type: 'history', era: '明·日月重开',
        title: '屯门海战', time: '公元 1521 年（明朝 武宗正德十六年）',
        minLevelName: '卫所军户',
        desc: '面对在广东沿海嚣张跋扈的葡萄牙舰队，大明水师在屯门将其击败。大明帝国取得了近代中西军事交锋的首次胜利。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_698', type: 'history', era: '明·日月重开',
        title: '戚继光招募义乌兵', time: '公元 1522 - 1566 年（明朝 世宗嘉靖年间）',
        minLevelName: '卫所军户',
        desc: '因为原本的卫所兵腐败不堪，名将戚继光来到义乌招募了剽悍的矿工和农民，你成为了这支军纪极其严明的“戚家军”的一员。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_699', type: 'history', era: '明·日月重开',
        title: '鸳鸯阵大破倭寇', time: '公元 1522 - 1566 年（明朝 世宗嘉靖年间）',
        minLevelName: '卫所军户',
        desc: '在台州之战中，你和战友们组成“鸳鸯阵”，长短兵器配合，将猖獗的倭寇杀得片甲不留，保卫了东南沿海的安宁。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_700', type: 'history', era: '明·日月重开',
        title: '纳银代役（班匠银）', time: '公元 1522 - 1566 年（明朝 世宗嘉靖年间）',
        minLevelName: '卫所军户',
        desc: '朝廷改革匠役制度，允许工匠缴纳“班匠银”来代替轮班服役。你交了银子，终于获得了人身自由，可以安心接私活赚钱了！',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_701', type: 'history', era: '明·日月重开',
        title: '嘉万五彩瓷', time: '公元 1522 - 1620 年（明朝 嘉靖至万历年间）',
        minLevelName: '卫所军户',
        desc: '你采用红、黄、绿等色彩，烧制出了极具视觉冲击力的五彩瓷。这种奔放的审美，正好迎合了明中后期市民阶层的趣味。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_702', type: 'history', era: '明·日月重开',
        title: '双屿港的畸形繁荣', time: '公元 1522 - 1540 年（明朝 嘉靖前期）',
        minLevelName: '卫所军户',
        desc: '浙江沿海的双屿港成为了走私海商和葡萄牙人的自由贸易天堂。你在这里交易生丝和火器，感受着法外之地的极度繁华。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_703', type: 'history', era: '明·日月重开',
        title: '嘉靖大倭患', time: '公元 1522 - 1566 年（明朝 世宗嘉靖年间）',
        minLevelName: '卫所军户',
        desc: '朝廷强行摧毁双屿港并严厉海禁。破产海商与日本浪人勾结形成倭寇，烧杀抢掠东南沿海，你被迫拿起武器保卫家乡。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_704', type: 'history', era: '明·日月重开',
        title: '海商汪直称王', time: '公元 1522 - 1566 年（明朝 世宗嘉靖年间）',
        minLevelName: '卫所军户',
        desc: '海商巨头汪直在日本平户建立了极其庞大的武装走私集团，自称“徽王”。你作为他的水手，横行东海，水师根本不敢阻拦。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_705', type: 'history', era: '明·日月重开',
        title: '胡宗宪运筹平倭', time: '公元 1522 - 1566 年（明朝 世宗嘉靖年间）',
        minLevelName: '卫所军户',
        desc: '浙直总督胡宗宪招募奇才徐渭为幕僚，运筹帷幄，诱捕了海盗头目汪直。虽然海患平息，但你的走私财路也断了。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_706', type: 'history', era: '明·日月重开',
        title: '西草湾海战', time: '公元 1522 年（明朝 世宗嘉靖元年）',
        minLevelName: '卫所军户',
        desc: '明朝水师在西草湾再次大败葡萄牙船队，并缴获了西洋火炮（佛郎机炮）。大明在军事科技上开始了向西方的首次学习。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_707', type: 'history', era: '明·日月重开',
        title: '大礼议之争', time: '公元 1522 - 1524 年（明朝 嘉靖初年）',
        minLevelName: '卫所军户',
        desc: '嘉靖帝为生父争夺皇帝尊号，与文官展开三年对抗。几百名官员在左顺门哭谏惨遭廷杖，皇权最终压倒了文官集团。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_708', type: 'history', era: '明·日月重开',
        title: '嘉靖修仙怠政', time: '公元 1522 - 1566 年（明朝 世宗嘉靖年间）',
        minLevelName: '卫所军户',
        desc: '皇帝二十年不上朝，痴迷炼丹修仙。朝廷文官集团与皇帝陷入了长期的冷战与互相猜忌，帝国政务全靠严嵩等人把持。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_709', type: 'history', era: '明·日月重开',
        title: '严嵩父子专权', time: '公元 1540 - 1566 年（明朝 嘉靖中后期）',
        minLevelName: '卫所军户',
        desc: '首辅严嵩贪赃枉法，把持朝政。你联络了一批言官拼死弹劾，虽屡遭贬谪杀害，但前赴后继，终于扳倒了这棵大树。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_710', type: 'history', era: '明·日月重开',
        title: '杨椒山死劾严嵩', time: '公元 1522 - 1566 年（明朝 世宗嘉靖年间）',
        minLevelName: '卫所军户',
        desc: '兵部员外郎杨继盛死劾严嵩被下诏狱。他在狱中用碎瓷片自己割下腐肉，其惨烈悲歌唤醒了整个天下的良知。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_711', type: 'history', era: '明·日月重开',
        title: '海瑞抬棺死谏', time: '公元 1560 - 1566 年（明朝 嘉靖末年）',
        minLevelName: '卫所军户',
        desc: '清官海瑞买好棺材向皇帝上了一道《治安疏》，痛陈天下弊病。这种将生死置之度外的直臣风骨，让你热泪盈眶。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_712', type: 'history', era: '明·日月重开',
        title: '修筑明长城', time: '公元 16 世纪中叶 - 17 世纪（明代中后期）',
        minLevelName: '卫所军户',
        desc: '为了防范蒙古俺答汗的袭扰，你被征发去修筑包砖的长城。高耸的敌台、烽火台连成一线，这是古代最庞大的军事防御工程。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_713', type: 'history', era: '明·日月重开',
        title: '庚戌之变', time: '公元 1550 年（明朝 世宗嘉靖29年）',
        minLevelName: '卫所军户',
        desc: '蒙古俺答汗率军突破古北口，兵临北京城下大肆劫掠。京营士兵久不操练竟无人敢出城迎战。大明的国防腐败一览无遗。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_714', type: 'history', era: '明·日月重开',
        title: '卫所制度彻底解体', time: '公元 16 世纪中叶 - 17 世纪（明朝中后期）',
        minLevelName: '卫所军户',
        desc: '世袭的军户不仅要打仗，还要给军官做苦力，军饷被贪污殆尽。你眼看着大量的军户逃亡，大明的国防基石彻底朽烂了。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_715', type: 'history', era: '明·日月重开',
        title: '苏杭织造局繁荣', time: '公元 1368 - 1644 年（明朝时期）',
        minLevelName: '卫所军户',
        desc: '江南的苏杭地区成为了全国丝织中心。你织出的罗锻不仅供应京城皇家，还大量卖给海商销往海外，日进斗金。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_716', type: 'history', era: '明·日月重开',
        title: '机户出资机工出力', time: '公元 16 世纪中叶 - 17 世纪（明朝中后期）',
        minLevelName: '卫所军户',
        desc: '你在苏州开了一家丝织作坊，雇佣了失去土地的自由工人为你织绸。中国最早的【资本主义萌芽】在你手中诞生了！',
        rewards: [{type: 'gold', value: 90}]
    },
    {
        id: 'hist_717', type: 'history', era: '明·日月重开',
        title: '潞安丝织业崛起', time: '公元 16 世纪中叶 - 17 世纪（明朝中后期）',
        minLevelName: '卫所军户',
        desc: '不仅是江南，北方的潞安（长治）也成了丝织重镇，出现了万张织机。你作为机工，只要有手艺，走遍天下都能混口饭吃。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_718', type: 'history', era: '明·日月重开',
        title: '佛山冶铁民营化', time: '公元 16 世纪中叶 - 17 世纪（明朝中后期）',
        minLevelName: '卫所军户',
        desc: '官营冶铁衰落，广东佛山的民营冶铁作坊崛起。你雇佣了数百名工人进行高炉冶炼，规模宏大，铁器远销东南亚。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_719', type: 'history', era: '明·日月重开',
        title: '徽州与建阳刻书业', time: '公元 16 世纪中叶 - 17 世纪（明朝中后期）',
        minLevelName: '卫所军户',
        desc: '建阳、徽州等地成为了印刷出版中心。你开设的书坊刻印了大量的通俗小说和科举参考书，满足了市民阶层的文化消费。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_720', type: 'history', era: '明·日月重开',
        title: '明式家具极简之美', time: '公元 16 世纪中叶 - 17 世纪（明朝中后期）',
        minLevelName: '卫所军户',
        desc: '随着大量海外硬木（黄花梨、紫檀）输入，你采用精妙的榫卯结构，打造出了线条流畅、极简高雅的明式家具。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_721', type: 'history', era: '明·日月重开',
        title: '建造明十三陵', time: '公元 1368 - 1644 年（明朝时期）',
        minLevelName: '卫所军户',
        desc: '你参与了位于北京昌平的明代帝王陵寝工程，修筑了宏伟的神道和地下玄宫。长达两百年的工程耗费了无数工匠的心血。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_722', type: 'history', era: '明·日月重开',
        title: '临清钞关繁荣', time: '公元 1368 - 1644 年（明朝时期）',
        minLevelName: '卫所军户',
        desc: '运河上的临清成为了大明最大的税收钞关。你在临清开设的手工作坊每天都有无数过往客商光顾，繁华程度堪比京城。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_723', type: 'history', era: '明·日月重开',
        title: '烧制临清贡砖', time: '公元 1368 - 1644 年（明朝时期）',
        minLevelName: '卫所军户',
        desc: '北京紫禁城需要海量城砖。你所在的临清砖窑因为土质好被指定为贡砖产地。你日夜烧窑，累弯了腰。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_724', type: 'history', era: '明·日月重开',
        title: '研制火龙出水', time: '公元 1368 - 1644 年（明朝时期）',
        minLevelName: '卫所军户',
        desc: '在兵器局中，你见证了工匠制造的“火龙出水”——这是世界上最早的二级火箭雏形。大明的火器科技极其超前。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_725', type: 'history', era: '明·日月重开',
        title: '景德镇窑工起义', time: '公元 16 世纪中叶 - 17 世纪（明朝中后期）',
        minLevelName: '卫所军户',
        desc: '督造太监逼迫窑工烧制极难成型的“大龙缸”。走投无路的童宾跳入窑火中自焚抗议，引发了数万窑工的大起义。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_726', type: 'history', era: '明·日月重开',
        title: '牵星过洋天文导航', time: '公元 1368 - 1644 年（明朝时期）',
        minLevelName: '卫所军户',
        desc: '在茫茫印度洋上，你熟练使用“牵星板”观察星辰高度来定位纬度。配合水浮罗盘，大明的远洋导航技术精妙绝伦。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_727', type: 'history', era: '明·日月重开',
        title: '马尼拉大帆船航线', time: '公元 16 世纪中叶 - 17 世纪（明代中后期）',
        minLevelName: '卫所军户',
        desc: '太平洋航线打通。你驾驶海船将大明生丝运到菲律宾马尼拉，换回了西班牙人从美洲带来的成吨白银。',
        rewards: [{type: 'gold', value: 80}]
    },
    {
        id: 'hist_728', type: 'history', era: '明·日月重开',
        title: '天妃宫妈祖信仰', time: '公元 1368 - 1644 年（明朝时期）',
        minLevelName: '卫所军户',
        desc: '你在长乐、太仓等下海起航之地，虔诚地祭拜天妃（妈祖）。这种深厚的海洋信仰，支撑着大明海员驶向惊涛骇浪。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_729', type: 'history', era: '明·日月重开',
        title: '市舶司的屡次废立', time: '公元 1368 - 1644 年（明朝时期）',
        minLevelName: '卫所军户',
        desc: '朝廷对三大市舶司时而设立时而罢废。你依附于官府的海上生意跟着起起落落，朝不保夕，深感政策摇摆的折磨。',
        rewards: [{type: 'gold', value: -20}]
    },
    {
        id: 'hist_730', type: 'history', era: '明·日月重开',
        title: '御史代天巡狩', time: '公元 1368 - 1644 年（明朝时期）',
        minLevelName: '卫所军户',
        desc: '你作为正七品御史被派往地方巡视。虽然官阶极低，但你“代天巡狩”，连布政使见到你都要战战兢兢。大明监察极其威厉。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_731', type: 'history', era: '明·日月重开',
        title: '廷杖制度', time: '公元 1368 - 1644 年（明朝时期）',
        minLevelName: '卫所军户',
        desc: '因为在朝堂上直言进谏触怒了皇帝，你被按在大殿外用木棍重打。士大夫的尊严被皇权踩在泥里，许多同僚甚至被打死。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_732', type: 'history', era: '明·日月重开',
        title: '白银成为法定货币', time: '公元 16 世纪中叶 - 17 世纪（明中后期）',
        minLevelName: '卫所军户',
        desc: '随着大明出口丝绸瓷器换回天量海外白银，“碎银子”彻底取代了贬值的宝钞和铜钱。中国步入了银本位时代。',
        rewards: [{type: 'gold', value: 70}]
    },
    {
        id: 'hist_733', type: 'history', era: '明·日月重开',
        title: '番薯与玉米传入', time: '公元 16 世纪中叶 - 17 世纪（明代中后期）',
        minLevelName: '卫所军户',
        desc: '你从马尼拉商船上带回了原产美洲的高产作物番薯和玉米。这些作物能在贫瘠的山地生长，极大缓解了人口粮食危机。',
        rewards: [{type: 'gold', value: 90}]
    },
    {
        id: 'hist_734', type: 'history', era: '明·日月重开',
        title: '美洲白银大量流入', time: '公元 16 世纪中叶 - 17 世纪（明代中后期）',
        minLevelName: '卫所军户',
        desc: '大明凭借强大的手工业产出，成为了世界白银的“吸水海绵”。世界上三分之一的白银流入中国，你的钱窖堆满银锭。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_735', type: 'history', era: '明·日月重开',
        title: '徽商的宗族商业网络', time: '公元 16 世纪中叶 - 17 世纪（明中后期）',
        minLevelName: '卫所军户',
        desc: '凭借经营盐业和当铺，安徽商人崛起为第一大商帮。“无徽不成镇”，你们在江南建立起了庞大而严密的商业网络。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_736', type: 'history', era: '明·日月重开',
        title: '晋商开中法发迹', time: '公元 16 世纪中叶 - 17 世纪（明中后期）',
        minLevelName: '卫所军户',
        desc: '山西商人依靠为边镇运送军粮换取盐引发家致富。你跟随晋商的驼队，将茶叶和丝绸卖到了寒冷的蒙古与俄罗斯草原。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_737', type: 'history', era: '明·日月重开',
        title: '澳门国际中转站', time: '公元 16 世纪中叶 - 17 世纪（明中后期）',
        minLevelName: '卫所军户',
        desc: '葡萄牙人控制的澳门成为了中国生丝、日本白银、西方货物的超级中转站。你在澳门不仅赚了大钱还买到了西洋火枪。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_738', type: 'history', era: '明·日月重开',
        title: '丝瓷茶出口狂潮', time: '公元 16 世纪中叶 - 17 世纪（明朝中后期）',
        minLevelName: '卫所军户',
        desc: '你垄断了三条货船，装满了生丝、青花瓷和武夷岩茶。在欧洲贵族眼中，这些东方货物比同等重量的黄金还要珍贵。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_739', type: 'history', era: '明·日月重开',
        title: '典当行与钱庄雏形', time: '公元 16 世纪中叶 - 17 世纪（明朝中后期）',
        minLevelName: '卫所军户',
        desc: '你开设了当铺，甚至开始涉足早期的异地汇兑业务。繁荣的商品流通倒逼着大明的金融业开始向近代钱庄演变。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_740', type: 'history', era: '明·日月重开',
        title: '商业牙行与买办', time: '公元 16 世纪中叶 - 17 世纪（明朝中后期）',
        minLevelName: '卫所军户',
        desc: '随着商业繁荣，专门替人撮合生意的“牙行”大量涌现。你作为精通外语的牙商，在广州港抽取着中外商人的高额佣金。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_741', type: 'history', era: '明·日月重开',
        title: '商业行会（公所会馆）', time: '公元 1368 - 1644 年（明朝时期）',
        minLevelName: '卫所军户',
        desc: '你联合同业的商贾组建了极其严密的“会馆”和“公所”。不仅统一定价，还联合起来对抗官府的苛捐杂税。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_742', type: 'history', era: '明·日月重开',
        title: '商税超越农业税', time: '公元 16 世纪末 - 17 世纪（明代后期）',
        minLevelName: '卫所军户',
        desc: '政府财政对商业税的依赖越来越重。你骄傲地向人炫耀：大明的国库，有一大半是我们商贾填满的！',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_743', type: 'history', era: '明·日月重开',
        title: '商人社会地位隐性提升', time: '公元 16 世纪中叶 - 17 世纪（明中后期）',
        minLevelName: '卫所军户',
        desc: '“富者有资可以买田”。虽然法律仍有限制，但在社会观念中，你这样的富商已经能让当朝大员奉为座上宾了。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_744', type: 'history', era: '明·日月重开',
        title: '兰陵笑笑生《金瓶梅》', time: '公元 16 世纪中叶 - 17 世纪（明中后期）',
        minLevelName: '卫所军户',
        desc: '第一部由文人独立创作的长篇世情小说。书中对商人西门庆暴发的描写，极其辛辣地刺穿了晚明社会的腐朽虚伪。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_745', type: 'history', era: '明·日月重开',
        title: '魏良辅改革昆曲水磨腔', time: '公元 16 世纪中叶 - 17 世纪（明代中后期）',
        minLevelName: '卫所军户',
        desc: '魏良辅创制了细腻优雅的“水磨调”。你在江南水乡画舫上听着婉转的昆曲，感受到了百戏之祖的极致魅力。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_746', type: 'history', era: '明·日月重开',
        title: '书院民间讲学盛行', time: '公元 16 世纪中叶 - 17 世纪（明代中后期）',
        minLevelName: '卫所军户',
        desc: '受王阳明心学影响，民间书院讲学盛行。你在阳明洞中与各阶层人士探讨学问，思想的碰撞火花四溅。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_747', type: 'history', era: '明·日月重开',
        title: '苏州园林造景艺术', time: '公元 16 世纪中叶 - 17 世纪（明代中后期）',
        minLevelName: '卫所军户',
        desc: '江南富商重金打造私家园林。你置身于拙政园中，看着“咫尺之内再造乾坤”的借景技术，犹如步入仙境。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_748', type: 'history', era: '明·日月重开',
        title: '小说版画插图繁荣', time: '公元 16 世纪中叶 - 17 世纪（明中后期）',
        minLevelName: '卫所军户',
        desc: '刻书坊为了提高销量，大量加入了精美的木刻版画插图。你买到的《西厢记》图文并茂，极具收藏价值。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_749', type: 'history', era: '明·日月重开',
        title: '泰州学派激进启蒙', time: '公元 16 世纪中叶 - 17 世纪（明中后期）',
        minLevelName: '卫所军户',
        desc: '王艮等泰州学派传人提出“百姓日用即道”。他们穿着奇装异服在街头讲学，鼓励平民追求物质欲望，狠狠扇了道学家的脸。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_750', type: 'history', era: '明·日月重开',
        title: '心学门人传播新知', time: '公元 16 世纪末 - 17 世纪（明代后期）',
        minLevelName: '卫所军户',
        desc: '王阳明的弟子们在全国各地开宗立派，将“知行合一”的理念普及到了市井商贩之中。你感受到了空前的文化启蒙。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_751', type: 'history', era: '明·日月重开',
        title: '司礼监太监“批红”权', time: '公元 16 世纪中叶 - 17 世纪（明中后期）',
        minLevelName: '卫所军户',
        desc: '皇帝怠政，将最核心的“批红”权交给了司礼监。你无奈地发现，内阁辛辛苦苦写出的治国良策，竟然由几个太监决定生死。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_752', type: 'history', era: '明·日月重开',
        title: '内阁与六部的权力博弈', time: '公元 16 世纪中叶 - 17 世纪（明朝中后期）',
        minLevelName: '卫所军户',
        desc: '内阁虽尊崇但法理上没有行政权。你与六部尚书为了争夺国家实际控制权，在朝堂上天天明争暗斗。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_753', type: 'history', era: '明·日月重开',
        title: '巡抚与总督制度常态化', time: '公元 16 世纪中叶 - 17 世纪（明中后期）',
        minLevelName: '卫所军户',
        desc: '为了统筹边防，朝廷将临时差遣的“巡抚”“总督”变成了固定的地方最高军政长官。大明的地方军阀化种子被埋下。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_754', type: 'history', era: '明·日月重开',
        title: '李贽肯定“私欲”与“童心”', time: '公元 16 世纪末 - 17 世纪（明朝后期）',
        minLevelName: '卫所军户',
        desc: '李贽提出“童心说”，反对虚伪的道学，主张保持真诚的私欲。这成为了明末市民阶层追求个性解放的理论核武器。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_755', type: 'history', era: '明·日月重开',
        title: '葡萄牙窃据澳门', time: '公元 1553 年（明朝 世宗嘉靖32年）',
        minLevelName: '卫所军户',
        desc: '葡萄牙人借口晾晒货物，贿赂了广东地方官，入居澳门。你第一次看到了高鼻深目的欧洲人，西方殖民势力开始渗透中国。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_756', type: 'history', era: '明·日月重开',
        title: '隆庆开关', time: '公元 1567 年（明朝 穆宗隆庆元年）',
        minLevelName: '卫所军户',
        desc: '明朝政府顺应历史潮流，在福建漳州月港解除海禁，允许民间商船出海贸易。你压抑多年的商业帝国迎来了井喷式发展！',
        rewards: [{type: 'gold', value: 80}]
    },
    {
        id: 'hist_757', type: 'history', era: '明·日月重开',
        title: '俺答汗封贡', time: '公元 1571 年（明朝 穆宗隆庆五年）',
        minLevelName: '卫所军户',
        desc: '蒙古俺答汗与明朝达成和议，接受明朝册封并在边境开放互市。长城沿线终于不再有烽火，你用多余的布匹换来了蒙古人的骏马。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_758', type: 'history', era: '明·日月重开',
        title: '一条鞭法', time: '公元 1573 - 1620 年（明朝 神宗万历年间）',
        minLevelName: '卫所军户',
        desc: '首辅张居正下令将田赋、徭役杂税合并，全部折算成白银缴纳。这种纳银代役的政策，让你的雇工摆脱了劳役纠缠。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_759', type: 'history', era: '明·日月重开',
        title: '利玛窦献《坤舆万国全图》', time: '公元 1573 - 1620 年（明朝 神宗时期）',
        minLevelName: '卫所军户',
        desc: '传教士利玛窦向皇帝进献世界地图。你第一次知道大明并不是天下的中心，世界竟然有五大洲四大洋！',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_760', type: 'history', era: '明·日月重开',
        title: '李时珍《本草纲目》', time: '公元 1573 - 1620 年（明朝 神宗万历年间）',
        minLevelName: '卫所军户',
        desc: '历经三十年踏遍深山，李时珍写成了总结1892种药物的“东方医学巨典”。你用书中记载的草药方，救活了全村百姓。',
        rewards: [{type: 'xp', value: 90}]
    },
    {
        id: 'hist_761', type: 'history', era: '明·日月重开',
        title: '汤显祖《牡丹亭》', time: '公元 1573 - 1620 年（明朝 神宗万历年间）',
        minLevelName: '卫所军户',
        desc: '“情不知所起，一往而深”，杜丽娘为了追求自由爱情死而复生的故事，让无数封建礼教下的青年男女落泪。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_762', type: 'history', era: '明·日月重开',
        title: '朱载堉十二平均律', time: '公元 1573 - 1620 年（明朝 神宗万历年间）',
        minLevelName: '卫所军户',
        desc: '皇室宗亲朱载堉用极其复杂的算盘计算出了“十二平均律”。这项领先欧洲百年的理论，展现了大明皇室隐藏的天才。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_763', type: 'history', era: '明·日月重开',
        title: '文坛领袖王世贞', time: '公元 1573 - 1620 年（明朝 神宗万历年间）',
        minLevelName: '卫所军户',
        desc: '文坛领袖王世贞主导了当时的文学审美。他的一句点评，就能让一个落魄文人名满天下或身败名裂。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_764', type: 'history', era: '明·日月重开',
        title: '张居正万历新政', time: '公元 1573 - 1582 年（明朝 万历初年 张居正执政期）',
        minLevelName: '卫所军户',
        desc: '作为首辅，你大权独揽，推行考成法整顿官僚，推行一条鞭法充实国库。大明王朝迎来了极其辉煌的最后中兴！',
        rewards: [{type: 'xp', value: 90}]
    },
    {
        id: 'hist_765', type: 'history', era: '明·日月重开',
        title: '考成法整顿官僚', time: '公元 1573 - 1582 年（明朝 万历初年 张居正执政期）',
        minLevelName: '卫所军户',
        desc: '张居正实行“考成法”，严格规定办事期限，如有延误层层追责。大明官场那种敷衍塞责的恶习被一扫而空，行政效率极高。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_766', type: 'history', era: '明·日月重开',
        title: '应对万历怠政危机', time: '公元 1582 - 1620 年（明朝 万历中后期）',
        minLevelName: '卫所军户',
        desc: '万历皇帝三十年不上朝，大量官位空缺。你每天面对一堆无人处理的烂摊子，国家机器处于半瘫痪状态。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_767', type: 'history', era: '明·日月重开',
        title: '国本之争拉锯战', time: '公元 1573 - 1620 年（明朝 神宗万历年间）',
        minLevelName: '卫所军户',
        desc: '为阻止皇帝废长立幼，满朝文武展开了十五年的激烈拉锯战。无数大臣被罢免，但也拼死保住了大明的礼法正统。',
        rewards: [{type: 'xp', value: -30}]
    },
    {
        id: 'hist_768', type: 'history', era: '明·日月重开',
        title: '矿税太监疯狂敛财', time: '公元 1573 - 1620 年（明朝 神宗万历年间）',
        minLevelName: '卫所军户',
        desc: '万历派出无数太监去地方收矿税，把繁华的工商业洗劫一空。内阁的多次劝阻被无视，民怨沸腾到了极点。',
        rewards: [{type: 'gold', value: -50}]
    },
    {
        id: 'hist_769', type: 'history', era: '明·日月重开',
        title: '李贽反传统礼教', time: '公元 16 世纪末 - 17 世纪初（明朝末年 万历年间）',
        minLevelName: '卫所军户',
        desc: '狂生李贽极其激烈地批判程朱理学，认为“穿衣吃饭，即是人伦物理”，甚至肯定女性智慧。他在死水一潭的明末炸响了惊雷。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_770', type: 'history', era: '明·日月重开',
        title: '苏州织工大罢工', time: '公元 1601 年（明朝 神宗万历29年）',
        minLevelName: '卫所军户',
        desc: '由于太监孙隆在苏州疯狂征收织机税，成千上万的织工和机户走上街头暴力抗税。这是早期工人反抗压迫的壮举。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_771', type: 'history', era: '明·日月重开',
        title: '翻译《几何原本》', time: '公元 1607 年（明朝 神宗万历35年）',
        minLevelName: '卫所军户',
        desc: '徐光启与利玛窦合作翻译了欧几里得的《几何原本》。你第一次接触到了“点线面”和严密的逻辑演绎证明方法。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_772', type: 'history', era: '明·日月重开',
        title: '萨尔浒之战', time: '公元 1619 年（明朝 神宗万历47年）',
        minLevelName: '卫所军户',
        desc: '努尔哈赤在萨尔浒集中兵力，五天之内击溃了明军十一万精锐。你在溃军中踩着同袍的尸体逃命，大明在关外的战略由攻转守。',
        rewards: [{type: 'xp', value: -80}]
    },
    {
        id: 'hist_773', type: 'history', era: '明·日月重开',
        title: '魏忠贤“九千岁”', time: '公元 1621 - 1627 年（明朝 熹宗天启年间）',
        minLevelName: '卫所军户',
        desc: '太监魏忠贤大权独揽自称九千岁，满朝文武纷纷认他做干爹。你为了自保只能随波逐流，大明朝堂变成了溜须拍马的魔窟。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_774', type: 'history', era: '明·日月重开',
        title: '东林六君子惨案', time: '公元 1626 年（明朝 熹宗天启六年）',
        minLevelName: '卫所军户',
        desc: '阉党大肆迫害东林党人，左光斗等“六君子”被投入诏狱，以残忍酷刑折磨致死。大明朝的政治生态陷入了绝对的黑暗。',
        rewards: [{type: 'xp', value: -70}]
    },
    {
        id: 'hist_775', type: 'history', era: '明·日月重开',
        title: '《五人墓碑记》', time: '公元 1626 年（明朝 熹宗天启六年）',
        minLevelName: '卫所军户',
        desc: '苏州上万市民自发走上街头抗击逮捕东林党人的东厂缇骑。颜佩韦等五定义士慷慨就义。你被市民的侠义精神深深震撼。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_776', type: 'history', era: '明·日月重开',
        title: '内阁沦为阉党附庸', time: '公元 1621 - 1627 年（明朝 熹宗天启年间）',
        minLevelName: '卫所军户',
        desc: '九千岁魏忠贤把持朝纲。你为了保住首辅之位只能屈身逢迎，在阉党的威压下，内阁彻底丧失了独立决策的尊严。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_777', type: 'history', era: '明·日月重开',
        title: '荷兰侵占澎湖', time: '公元 1622 年（明朝 熹宗天启2年）',
        minLevelName: '卫所军户',
        desc: '被称为“红毛夷”的荷兰舰队强行占领了澎湖列岛，企图垄断对华贸易。你眼看着这群早期资本主义海盗在沿海横行霸道。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_778', type: 'history', era: '明·日月重开',
        title: '宁远大捷', time: '公元 1626 年（明朝 熹宗天启6年）',
        minLevelName: '卫所军户',
        desc: '袁崇焕死守宁远，你操控城头重金购买的西洋红夷大炮轰击后金军队，重创了努尔哈赤。这是明军在辽东绝望中的一次惨胜。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_779', type: 'history', era: '明·日月重开',
        title: '崇祯雷霆除阉党', time: '公元 1627 年（明朝 熹宗天启7年）',
        minLevelName: '卫所军户',
        desc: '17岁的崇祯帝登基，以雷霆手段逼死魏忠贤，铲除阉党。你上疏弹劾残余势力，以为大明终于要迎来复兴了。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_780', type: 'history', era: '明·日月重开',
        title: '宋应星《天工开物》', time: '公元 1628 - 1644 年（明朝 崇祯年间）',
        minLevelName: '卫所军户',
        desc: '你拜读了这本被西方称为“中国17世纪工艺百科全书”的神作。从冶炼到纺织，古代农业和手工业技术被极科学地记录下来。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_781', type: 'history', era: '明·日月重开',
        title: '崇祯频繁更换首辅', time: '公元 1628 - 1644 年（明朝 崇祯年间）',
        minLevelName: '卫所军户',
        desc: '面对内忧外患，崇祯帝极度多疑，17年间换了五十多个内阁首辅。你在内阁每天战战兢兢，不知哪天就会身首异处。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_782', type: 'history', era: '明·日月重开',
        title: '应对小冰河期连年饥荒', time: '公元 1628 - 1644 年（明朝 崇祯年间）',
        minLevelName: '卫所军户',
        desc: '罕见的小冰河期导致旱灾蝗灾席卷华北，十室九空。大自然给大明降下了最致命的天谴，非你的人力所能挽回。',
        rewards: [{type: 'xp', value: -80}]
    },
    {
        id: 'hist_783', type: 'history', era: '明·日月重开',
        title: '明末中央财政彻底破产', time: '崇祯末年',
        minLevelName: '卫所军户',
        desc: '国库里只剩几万两白银，连守城士兵都在饿肚子。你看着一本本催饷奏折，明白大明王朝不是战死，而是被穷死的。',
        rewards: [{type: 'gold', value: -80}]
    },
    {
        id: 'hist_784', type: 'history', era: '明·日月重开',
        title: '江南复社结社干政', time: '公元 1628 - 1644 年（明朝末年 崇祯年间）',
        minLevelName: '卫所军户',
        desc: '张溥等人在太仓成立文人结社“复社”，探讨诗文更左右朝政，甚至能罢免当朝首辅。这是知识分子干预政治的最后辉煌。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_785', type: 'history', era: '明·日月重开',
        title: '裁撤驿站引发民变', time: '公元 1629 年（明朝 思宗崇祯2年）',
        minLevelName: '卫所军户',
        desc: '崇祯帝为了节省开支大规模裁撤驿站。一个名叫李自成的失业驿卒走投无路，被迫造反。大明王朝亲手逼出了自己的掘墓人。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_786', type: 'history', era: '明·日月重开',
        title: '己巳之变京畿危机', time: '公元 1629 年（明朝 思宗崇祯2年）',
        minLevelName: '卫所军户',
        desc: '皇太极绕过防线突入长城大肆劫掠。京城震动，皇帝一怒将勤王的袁崇焕下狱，你眼睁睁看着大明自毁长城。',
        rewards: [{type: 'xp', value: -70}]
    },
    {
        id: 'hist_787', type: 'history', era: '明·日月重开',
        title: '三饷加派的重压', time: '公元 1620 - 1644 年（明朝末年）',
        minLevelName: '卫所军户',
        desc: '为了应付辽东军费和镇压起义，朝廷连年加派“辽饷、剿饷、练饷”。你种地的收入甚至不够交税，只能卖儿卖女。',
        rewards: [{type: 'gold', value: -60}]
    },
    {
        id: 'hist_788', type: 'history', era: '明·日月重开',
        title: '农民军攻破洛阳', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '李自成大军攻破洛阳，杀死了富甲天下的福王朱常洵，开仓放粮。你听着“迎闯王，不纳粮”的口号，加入了起义军。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_789', type: 'history', era: '明·日月重开',
        title: '饾版与拱花技术', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '你在雕版印刷中发明了多色套印的“饾版”技术。你印出的《十竹斋画谱》色彩极其精美，堪称古代印刷史上的奇迹。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_790', type: 'history', era: '明·日月重开',
        title: '郑芝龙水师霸权', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '海盗出身的郑芝龙接受招安，建立了拥有数千艘战舰的庞大水师。凡是航行在东海的商船，都必须向他购买令旗保平安。',
        rewards: [{type: 'gold', value: 60}]
    },
    {
        id: 'hist_791', type: 'history', era: '明·日月重开',
        title: '世界地图冲击传统', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '你在海外商站看到了一幅包含美洲和欧非的全球地图。你震惊地发现大明并不在世界绝对中心，海洋之外有极广阔的天地。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_792', type: 'history', era: '明·日月重开',
        title: '东林书院清议', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '你在无锡东林书院与顾宪成等人讲学，“家事国事天下事事事关心”。你们对朝政的猛烈抨击形成了强大的政治力量。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_793', type: 'history', era: '明·日月重开',
        title: '明末三大案', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '宫廷接连爆发“梃击案”“红丸案”和“移宫案”。你卷入了这场围绕皇位继承的残酷党争，朝堂彻底沦为了派系倾轧的泥潭。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_794', type: 'history', era: '明·日月重开',
        title: '袁崇焕惨遭凌迟', time: '公元 1630 年（明朝 思宗崇祯3年）',
        minLevelName: '卫所军户',
        desc: '崇祯帝中反间计，将死守辽东的袁崇焕凌迟处死。无知的京城百姓争食其肉，你悲哀地发现大明已经无药可救了。',
        rewards: [{type: 'xp', value: -80}]
    },
    {
        id: 'hist_795', type: 'history', era: '明·日月重开',
        title: '烟草的传入与风靡', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '原产美洲的烟草经吕宋传入福建。这种带有成瘾性的作物迅速在全国风靡，你开辟大片烟田，获得了极其惊人的暴利。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_796', type: 'history', era: '明·日月重开',
        title: '广州三十六行雏形', time: '公元 1620 - 1644 年（明朝末年）',
        minLevelName: '卫所军户',
        desc: '在广东，你参与组建了专门负责对外贸易的“三十六行”牙商组织。这是清代著名十三行的雏形，垄断了海上财富。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_797', type: 'history', era: '明·日月重开',
        title: '棉纺织品大量外销', time: '公元 1620 - 1644 年（明朝末年）',
        minLevelName: '卫所军户',
        desc: '“买不尽松江布，收不尽魏塘纱”。江南的棉布不仅满足国内需求，还大量作为商品远销海外。你名下的染坊日夜开工。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_798', type: 'history', era: '明·日月重开',
        title: '江南工商业市镇涌现', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '以盛泽镇、南浔镇为代表的市镇在江南密集涌现。这些镇子全靠商品经济运转，完全打破了传统的男耕女织社会。',
        rewards: [{type: 'gold', value: 70}]
    },
    {
        id: 'hist_799', type: 'history', era: '明·日月重开',
        title: '雇佣劳动市场“叫头”', time: '公元 1620 - 1644 年（明朝末年）',
        minLevelName: '卫所军户',
        desc: '城市出现了专门的劳务市场。你每天清晨挑选自由出售劳动力的匠人。这种“人身自由+出卖劳力”是典型资本主义萌芽。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_800', type: 'history', era: '明·日月重开',
        title: '西洋钟表等奇技淫巧', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '你高价倒卖西洋传教士带来的自鸣钟给达官贵人。大明高层对这些“奇技淫巧”爱不释手，却忽视了背后的科学原理。',
        rewards: [{type: 'gold', value: 30}]
    },
    {
        id: 'hist_801', type: 'history', era: '明·日月重开',
        title: '购买西洋红夷大炮', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '面对清军铁骑，你协助徐光启从澳门葡萄牙人手中重金购买并仿制了前膛重炮（红夷大炮）。城防火力革命性升级。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_802', type: 'history', era: '明·日月重开',
        title: '西方传教士江南传教', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '你在江南接待了多位耶稣会传教士。他们不仅传播天主教，还带来了西方的天文、数学知识，打开了士大夫眼界。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_803', type: 'history', era: '明·日月重开',
        title: '欧洲商船直接来华', time: '公元 1620 - 1644 年（明朝末年）',
        minLevelName: '卫所军户',
        desc: '除了周边朝贡国，西班牙、荷兰、英国的商船跨越半个地球直接驶入中国海域贸易。大明被彻底卷入了全球贸易网。',
        rewards: [{type: 'gold', value: 40}]
    },
    {
        id: 'hist_804', type: 'history', era: '明·日月重开',
        title: '早期全球化的贸易顺差', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '不管西方人运来多少白银，最终都变成了对大明丝绸瓷器的单向购买。这种极致的贸易顺差支撑了大明最后的经济繁荣。',
        rewards: [{type: 'gold', value: 50}]
    },
    {
        id: 'hist_805', type: 'history', era: '明·日月重开',
        title: '徐光启《农政全书》', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '作为引进西学第一人，徐光启总结传统农学并引入西方水利写成此书。你按书中方法试种甘薯，获得了极大成功。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_806', type: 'history', era: '明·日月重开',
        title: '徐霞客《徐霞客游记》', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '徐霞客足迹遍布大半个中国，写下了极其科学的游记。你读着他对喀斯特地貌的精确描述，感叹读万卷书不如行万里路。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_807', type: 'history', era: '明·日月重开',
        title: '三言二拍', time: '公元 1620 - 1644 年（明代末期）',
        minLevelName: '卫所军户',
        desc: '冯梦龙和凌濛初的拟话本小说，大量描写了商人世俗生活，甚至肯定了追求财富的合理性。反映了极浓厚的商业气息。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_808', type: 'history', era: '明·日月重开',
        title: '汤若望参修《崇祯历书》', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '为了修正旧历法，朝廷让传教士用西方天文学知识编纂了极度精确的《崇祯历书》。大明崩溃前夕依然保持对科学的开放。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_809', type: 'history', era: '明·日月重开',
        title: '董其昌南北宗论', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '画坛巨匠董其昌提出画分“南北宗”，极度推崇追求笔墨情趣的文人画。他的理论统治了其后数百年的中国画坛。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_810', type: 'history', era: '明·日月重开',
        title: '西方透视学影响中国画', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '曾鲸等画家受西方传教士影响，开始在人物肖像画中引入西洋的“焦点透视”和阴影法，画中人立体得如同真人。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_811', type: 'history', era: '明·日月重开',
        title: '个性解放思潮兴起', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '穿奇装异服、追求奢华享受、男女公开游园。明末的社会风气打破了宋代理学的沉闷，展现出极其绚烂的末世狂欢。',
        rewards: [{type: 'xp', value: 40}]
    },
    {
        id: 'hist_812', type: 'history', era: '明·日月重开',
        title: '言官制度导致决策瘫痪', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '言官风闻言事，为了博取直谏美名疯狂弹劾救国政策。你推行的增加军饷法案被骂得体无完肤，被迫搁置。',
        rewards: [{type: 'xp', value: -40}]
    },
    {
        id: 'hist_813', type: 'history', era: '明·日月重开',
        title: '应对辽东兵变哗变', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '因长期拖欠军饷，前线明军接连发生吴桥兵变等大规模哗变。将士们饿着肚子投敌，你作为首辅无钱可拨，束手无策。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_814', type: 'history', era: '明·日月重开',
        title: '痛批君主专制', time: '公元 17 世纪中叶（明末清初）',
        minLevelName: '卫所军户',
        desc: '经历了亡国之痛的黄宗羲极其尖锐地提出“为天下之大害者，君而已矣”。这种反专制思想震撼了数百年后的近代中国。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_815', type: 'history', era: '明·日月重开',
        title: '顾炎武倡导“经世致用”', time: '公元 17 世纪中叶（明末清初）',
        minLevelName: '卫所军户',
        desc: '大儒顾炎武反对空谈心性，主张研究水利、农学等切实有用的学问。这种务实的学风挽救了晚明以来虚浮的思想危机。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_816', type: 'history', era: '明·日月重开',
        title: '“天下兴亡，匹夫有责”', time: '公元 17 世纪中叶（明末清初）',
        minLevelName: '卫所军户',
        desc: '顾炎武区分了“亡国”与“亡天下”，提出了保卫华夏文化的千古名言。大明亡了，但华夏精神不能亡！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_817', type: 'history', era: '明·日月重开',
        title: '王夫之朴素唯物思想', time: '公元 17 世纪中叶（明末清初）',
        minLevelName: '卫所军户',
        desc: '王夫之提出了“天地之化日新”的唯物主义发展观，深刻总结了中国历史规律。明末三大思想家的理论达到了中国传统文化最高峰。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_818', type: 'history', era: '明·日月重开',
        title: '早期民主启蒙思潮', time: '公元 17 世纪中叶（明清之际）',
        minLevelName: '卫所军户',
        desc: '商品经济的发展和专制的极端化，催生了这批伟大的思想家。你站在这股启蒙思潮的浪尖，虽然未能改变亡国命运，却照亮了未来。',
        rewards: [{type: 'xp', value: 60}]
    },
    {
        id: 'hist_819', type: 'history', era: '明·日月重开',
        title: '李自成“均田免赋”口号', time: '公元 1620 - 1644 年（明朝 明末时期）',
        minLevelName: '卫所军户',
        desc: '李自成起义军提出了“均田免赋”的口号，深刻触及了封建土地兼并的终极矛盾。无数绝望的农民像潮水般加入了闯王的队伍。',
        rewards: [{type: 'xp', value: 50}]
    },
    {
        id: 'hist_820', type: 'history', era: '明·日月重开',
        title: '明朝遗民拒绝出仕', time: '公元 17 世纪中叶（明清之际）',
        minLevelName: '卫所军户',
        desc: '江山易主，无数读书人拒绝做清朝的官，隐居深山著书立说，坚守华夏文化道统。这是你在这苍凉时代中看到的最硬的骨头。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_821', type: 'history', era: '明·日月重开',
        title: '料罗湾大捷', time: '公元 1633 年（明朝 思宗崇祯6年）',
        minLevelName: '卫所军户',
        desc: '明朝水师在料罗湾采用火船战术，一举击溃了不可一世的荷兰东印度公司舰队。大明保住了东亚海域的绝对制海权！',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_822', type: 'history', era: '明·日月重开',
        title: '松锦之战统帅降清', time: '公元 1642 年（明朝 思宗崇祯15年）',
        minLevelName: '卫所军户',
        desc: '大明集结九边精锐十三万在松山决战全军覆没，统帅洪承畴降清。内阁接到战报，大明关外最后的精锐丧失殆尽。',
        rewards: [{type: 'xp', value: -80}]
    },
    {
        id: 'hist_823', type: 'history', era: '明·日月重开',
        title: '弘光政权党争', time: '公元 1644 年（明朝 思宗崇祯17年）',
        minLevelName: '卫所军户',
        desc: '偏安南京的南明朝廷里，文官们依然在疯狂地为了迎立哪个王爷当皇帝而相互结党倾轧。江山社稷毁于书生的争吵中。',
        rewards: [{type: 'xp', value: -70}]
    },
    {
        id: 'hist_824', type: 'history', era: '明·日月重开',
        title: '李自成建立大顺政权', time: '公元 1644 年初',
        minLevelName: '卫所军户',
        desc: '农民军领袖李自成在西安称帝建大顺，随后挥师直捣北京。紫禁城里听到了震天杀声，大明帝国的丧钟敲响了。',
        rewards: [{type: 'xp', value: -70}]
    },
    {
        id: 'hist_825', type: 'history', era: '明·日月重开',
        title: '张献忠建立大西政权', time: '公元 1644 年（明朝 思宗崇祯17年）',
        minLevelName: '卫所军户',
        desc: '另一支农民军首领张献忠在成都称帝，并在四川展开了极其残酷的统治。大明的西南半壁江山也彻底沦丧。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_826', type: 'history', era: '明·日月重开',
        title: '廷议是否南迁的僵局', time: '公元 1644 年（明朝 思宗崇祯17年）',
        minLevelName: '卫所军户',
        desc: '面对流寇逼近，崇祯帝召集廷议迁都南京。满朝文武怕承担逃跑骂名竟无人敢附议，大家就在沉默中坐等亡国。',
        rewards: [{type: 'xp', value: -50}]
    },
    {
        id: 'hist_827', type: 'history', era: '明·日月重开',
        title: '百官拷饷与大明覆灭', time: '公元 1644 年（明朝 思宗崇祯17年）',
        minLevelName: '卫所军户',
        desc: '李自成攻破北京。你没能逃脱，被大顺军夹棍拷打逼迫交出贪污赃款。两百年的大明衣冠在惨叫中沦丧。',
        rewards: [{type: 'gold', value: -90}]
    },
    {
        id: 'hist_828', type: 'history', era: '明·日月重开',
        title: '弘光帝南京称帝', time: '公元 1644 年（明朝 思宗崇祯17年）',
        minLevelName: '卫所军户',
        desc: '福王朱由崧在南京建立南明弘光政权。大明似乎保住了江南半壁江山，你火速南下，企图在新朝廷里再续首辅之梦。',
        rewards: [{type: 'xp', value: 30}]
    },
    {
        id: 'hist_829', type: 'history', era: '明·日月重开',
        title: '南明弘光内阁的腐败', time: '公元 1644 - 1662 年（南明时期）',
        minLevelName: '卫所军户',
        desc: '大半国土沦陷，首辅马士英等人却在南京卖官鬻爵，沉迷女色听戏。面对清军南下，内阁毫无抵抗之力，一触即溃。',
        rewards: [{type: 'xp', value: -70}]
    },
    {
        id: 'hist_830', type: 'history', era: '明·日月重开',
        title: '崇祯帝煤山自缢殉国', time: '公元 1644 年（明朝 崇祯十七年）',
        minLevelName: '卫所军户',
        desc: '李自成攻破北京，崇祯皇帝在煤山歪脖子树上自缢殉国，留下血书“任贼分裂朕尸，勿伤百姓一人”。大明帝国轰然崩塌。',
        rewards: [{type: 'xp', value: -100}]
    },
    {
        id: 'hist_831', type: 'history', era: '明·日月重开',
        title: '吴三桂引清兵入关', time: '公元 1644 年（明朝 思宗崇祯17年）',
        minLevelName: '卫所军户',
        desc: '因为爱妾陈圆圆被霸占，吴三桂冲冠一怒打开了山海关大门，引满清多尔衮大军入关。中国历史的走向被彻底改变了。',
        rewards: [{type: 'xp', value: -80}]
    },
    {
        id: 'hist_832', type: 'history', era: '明·日月重开',
        title: '李定国两蹶名王', time: '公元 1644 - 1662 年（南明时期）',
        minLevelName: '卫所军户',
        desc: '原大西将领李定国归顺南明，斩杀清军亲王孔有德、尼堪，打出了汉人最后的军威！临终前嘱咐儿子“宁死荒郊，勿降也”。',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_833', type: 'history', era: '明·日月重开',
        title: '史可法扬州殉国', time: '公元 1645 年（南明 弘光元年 / 清顺治二年）',
        minLevelName: '卫所军户',
        desc: '南明兵部尚书史可法在扬州率孤军死守清军，城破后凛然就义绝不投降。他用生命捍卫了儒家士大夫最后的尊严与骨气。',
        rewards: [{type: 'xp', value: 90}]
    },
    {
        id: 'hist_834', type: 'history', era: '明·日月重开',
        title: '扬州十日与嘉定三屠', time: '公元 1645 年（南明 弘光元年 / 清顺治二年）',
        minLevelName: '卫所军户',
        desc: '清军南下遭遇了最激烈的抵抗。城破后清军展开了惨绝人寰的大屠杀。你在这场地狱般的浩劫中感受到了深重的亡国之痛。',
        rewards: [{type: 'xp', value: -90}]
    },
    {
        id: 'hist_835', type: 'history', era: '明·日月重开',
        title: '剃发易服令的血泪抗争', time: '公元 1645 年（南明 弘光元年 / 清顺治二年）',
        minLevelName: '卫所军户',
        desc: '“留头不留发，留发不留头”。清军强制汉人剃发易服。数千年的汉家衣冠传统被暴力腰斩，无数江南士民为保卫头发流尽了鲜血。',
        rewards: [{type: 'xp', value: -70}]
    },
    {
        id: 'hist_836', type: 'history', era: '明·日月重开',
        title: '南明隆武与永历政权绝唱', time: '公元 1645 - 1662 年',
        minLevelName: '卫所军户',
        desc: '南明接连建立了隆武、永历政权。他们是华夏正统最后的挣扎，但在内斗和清军铁骑的疯狂追击下接连覆灭。',
        rewards: [{type: 'xp', value: -60}]
    },
    {
        id: 'hist_837', type: 'history', era: '明·日月重开',
        title: '瞿式耜死守桂林殉国', time: '公元 1650 年（南明 永历四年 / 清朝 顺治七年）',
        minLevelName: '卫所军户',
        desc: '南明名臣瞿式耜坚守桂林，城破后与弟子端坐府中，从容被捕赋诗绝命。大明士大夫以最壮烈的方式书写了最后的忠诚。',
        rewards: [{type: 'xp', value: 80}]
    },
    {
        id: 'hist_838', type: 'history', era: '明·日月重开',
        title: '黄宗羲《明夷待访录》', time: '公元 1662 年（南明 永历十六年 / 清康熙元年）',
        minLevelName: '卫所军户',
        desc: '黄宗羲在书中主张“天下为主，君为客”，并提出用学校来监督君主。你仿佛看到了一丝近代民主制度的曙光。',
        rewards: [{type: 'xp', value: 70}]
    },
    {
        id: 'hist_839', type: 'history', era: '明·日月重开',
        title: '郑成功收复台湾', time: '公元 1662 年（南明 永历十六年 / 清康熙元年）',
        minLevelName: '卫所军户',
        desc: '南明覆灭前夕，抗清名将郑成功率领水师跨越海峡，击败盘踞三十八年的荷兰殖民者，收复宝岛台湾！这是大明最后的悲壮遗产。',
        rewards: [{type: 'xp', value: 100}]
    },
    {
        id: 'hist_840', type: 'history', era: '明·日月重开',
        title: '张煌言海上抗清', time: '公元 1664 年（清朝 康熙三年）',
        minLevelName: '卫所军户',
        desc: '文臣张煌言在东南沿海坚持抗清近二十年，兵败被俘后在杭州就义。“国破家亡欲何之，西子湖头有我师”。',
        rewards: [{type: 'xp', value: 90}]
    },

];
