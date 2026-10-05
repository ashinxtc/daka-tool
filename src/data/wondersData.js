// ==============================================================================
// 时空营造司 · 奇迹与零部件标准数据契约 (Wonders & Components Contract)
// ==============================================================================

export const WONDER_TYPE_CONFIG = {
    compact: {
        id: 'compact',
        name: '精巧奇迹',
        targetDays: '约 7 天 (1周工期)',
        totalParts: 20,
        keyPartsCount: 5,
        regularPartsCount: 15,
        stagesCount: 4,
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    epic: {
        id: 'epic',
        name: '史诗重器',
        targetDays: '约 14 天 (2周工期)',
        totalParts: 40,
        keyPartsCount: 10,
        regularPartsCount: 30,
        stagesCount: 5,
        badgeBg: 'bg-purple-100 text-purple-800 border-purple-300'
    }
};

export const WONDERS_DATA = {
    // ==========================================================================
    // 纪元一：远古之路
    // ==========================================================================
    banpo_hut: {
        id: 'banpo_hut',
        name: '半坡聚落 · 中央大草庐',
        subtitle: '仰韶文明 · 氏族议事大屋',
        era: '远古之路',
        eraIndex: 0,
        type: 'compact',
        totalParts: 20,
        keyPartsCount: 5,
        regularPartsCount: 15,
        stagesCount: 4,
        historyNote: '距今约 6000 年前仰韶文化半坡遗址的标志性建筑（F1号大房子），面积达 160 平方米，为氏族公社集会议事与庆典中枢，开创了木骨泥墙与半地穴建造先河。',
        passiveBuff: {
            title: '母系庇护',
            desc: '每日登录自动产出 +2 金元宝；宠物探险干粮消耗减少 10%',
            icon: '🏕️'
        },
        stages: [
            {
                stage: 1,
                name: '掘地夯基',
                desc: '下挖半地穴式基盘，夯实生土并铺设环壕碎石散水防潮垫层',
                stageTargetParts: 5,
                keyPart: {
                    id: 'part_bp_1_k',
                    name: '青石平地铲与准绳',
                    icon: '📐',
                    type: 'key',
                    desc: '氏族首领定穴神铲，以木铲与皮准绳测量大屋长宽方位'
                },
                regularParts: [
                    { id: 'part_bp_1_r1', name: '黄土夯筑重锤', icon: '🪨', count: 1, desc: '硬木绑石锤，反复夯打深坑底面' },
                    { id: 'part_bp_1_r2', name: '生土硬结石灰面', icon: '🧱', count: 1, desc: '混合草木灰硬结的防潮硬化地平' },
                    { id: 'part_bp_1_r3', name: '防渗碎石垫层', icon: '⚪', count: 1, desc: '环壕边缘铺垫的排水碎卵石' },
                    { id: 'part_bp_1_r4', name: '环壕排水排沟木桩', icon: '🪵', count: 1, desc: '防止雨水倒灌大屋的环状木桩槽' }
                ]
            },
            {
                stage: 2,
                name: '立木安梁',
                desc: '立起四根中央核心大立柱与斜向撑梁，粗麻绳捆扎形成三角形稳定木构',
                stageTargetParts: 10,
                keyPart: {
                    id: 'part_bp_2_k',
                    name: '百年坚栎中央顶梁主柱',
                    icon: '🌲',
                    type: 'key',
                    desc: '深扎地下的粗壮栎木巨柱，承载整座草庐大屋最高重压'
                },
                regularParts: [
                    { id: 'part_bp_2_r1', name: '柳木外圈抱柱', icon: '🪵', count: 1, desc: '大屋四周向内微倾的承重侧柱' },
                    { id: 'part_bp_2_r2', name: '斜向横架承重木过梁', icon: '🥢', count: 1, desc: '连接中央主柱与外圈斜柱的巨型横木' },
                    { id: 'part_bp_2_r3', name: '榫卯暗销木楔子', icon: '🪚', count: 1, desc: '早期原始榫眼固定的硬木销钉' },
                    { id: 'part_bp_2_r4', name: '野麻韧皮编织绞索', icon: '🪢', count: 1, desc: '用生牛皮与野麻皮拧结的加固斜拉索' }
                ]
            },
            {
                stage: 3,
                name: '木骨泥墙',
                desc: '编织密排木骨篱笆，内外涂抹草拌泥并经温火烘烤形成耐火陶化硬墙',
                stageTargetParts: 15,
                keyPart: {
                    id: 'part_bp_3_k',
                    name: '火烤硬化红烧土主板',
                    icon: '🔥',
                    type: 'key',
                    desc: '经烈火烘烤陶化的红烧土墙心，耐风雨侵蚀数千年不坏'
                },
                regularParts: [
                    { id: 'part_bp_3_r1', name: '芦苇密排编织篱笆', icon: '🌾', count: 1, desc: '纵横交错的细木棍与密密芦苇骨架' },
                    { id: 'part_bp_3_r2', name: '黄泥拌稻草填缝灰浆', icon: '🍯', count: 1, desc: '黏土掺和干草碎屑的致密保温泥皮' },
                    { id: 'part_bp_3_r3', name: '兽毛加筋抹面层', icon: '🧵', count: 1, desc: '混合野兽粗毛的耐磨内壁表层' },
                    { id: 'part_bp_3_r4', name: '低矮向南防风木门框', icon: '🚪', count: 1, desc: '开向朝阳正南方的厚实木框门洞' }
                ]
            },
            {
                stage: 4,
                name: '封顶聚落',
                desc: '层叠芦苇茅草形成锥形坡顶，点燃中央永恒火塘，树立氏族人面鱼纹图腾',
                stageTargetParts: 20,
                keyPart: {
                    id: 'part_bp_4_k',
                    name: '人面鱼纹陶盆图腾金柱',
                    icon: '🏺',
                    type: 'key',
                    desc: '大屋顶端高悬的仰韶先民精神图腾，鱼身人面，沟通天地'
                },
                regularParts: [
                    { id: 'part_bp_4_r1', name: '层叠防水厚茅草排束', icon: '🌾', count: 1, desc: '层层叠叠如鳞片般密实的茅草屋面' },
                    { id: 'part_bp_4_r2', name: '桦木压顶防风条', icon: '🪵', count: 1, desc: '压制屋脊防止大风掀开茅草的交叉长木' },
                    { id: 'part_bp_4_r3', name: '中央永恒氏族火塘石', icon: '🔥', count: 1, desc: '大殿中央日夜不熄的氏族公共大火塘' },
                    { id: 'part_bp_4_r4', name: '仰韶鱼纹陶熏炉', icon: '🪔', count: 1, desc: '庆典驱虫祈福的带盖镂空彩陶香炉' }
                ]
            }
        ]
    },

    liangzhu_altar: {
        id: 'liangzhu_altar',
        name: '良渚神国 · 莫角山大祭台与水坝',
        subtitle: '中华五千年文明实证 · 神王治水圣城',
        era: '远古之路',
        eraIndex: 0,
        type: 'epic',
        totalParts: 40,
        keyPartsCount: 10,
        regularPartsCount: 30,
        stagesCount: 5,
        historyNote: '良渚古城核心遗产（距今5300~4300年）。莫角山高耸的长方形人工夯土台地与世界上最早的大型水利防洪大坝系统，奠定了东方早期水利国家与神王祭祀规制。',
        passiveBuff: {
            title: '神王岁贡',
            desc: '每日登录自动产出 +3 金元宝；市集购买远古遗物类道具享 9 折',
            icon: '👑'
        },
        stages: [
            {
                stage: 1,
                name: '治水筑堤',
                desc: '采用世界首创的草裹泥工艺堆筑巨型防洪水坝，抵御天目山山洪与排涝蓄水',
                stageTargetParts: 8,
                keyParts: [
                    { id: 'part_lz_1_k1', name: '水利督造竹编龙骨', icon: '🎋', type: 'key', desc: '束缚巨石泥土的大型竹编网格骨架' },
                    { id: 'part_lz_1_k2', name: '大坝主迎水分流巨岩', icon: '🪨', type: 'key', desc: '横亘于水头冲击处的千斤分水重石' }
                ],
                regularParts: [
                    { id: 'part_lz_1_r1', name: '芦苇草裹泥土包·左', icon: '🌾', count: 1, desc: '芦苇草席包裹黏土扎紧的软体工程块' },
                    { id: 'part_lz_1_r2', name: '芦苇草裹泥土包·右', icon: '🌾', count: 1, desc: '抗剪切力极强的草裹泥纵横交错排块' },
                    { id: 'part_lz_1_r3', name: '青紫黏土防渗夹层', icon: '🟤', count: 1, desc: '水坝心墙采用的极致致密防水黄土' },
                    { id: 'part_lz_1_r4', name: '深水抛石抗冲护坡', icon: '⛰️', count: 1, desc: '坝脚抛填保护岸坡的坚硬卵石护堤' },
                    { id: 'part_lz_1_r5', name: '杩槎导水木制水门', icon: '🚪', count: 1, desc: '分流蓄水与干旱放水的重木活动闸口' },
                    { id: 'part_lz_1_r6', name: '大坝蓄水溢流石渠', icon: '🌊', count: 1, desc: '防止大水漫坝的阶梯状青石溢洪道' }
                ]
            },
            {
                stage: 2,
                name: '劈山覆土',
                desc: '在平原湿地中挑运数百万方泥土，版筑堆叠起高出平地十几米的莫角山巨型平顶神台',
                stageTargetParts: 16,
                keyParts: [
                    { id: 'part_lz_2_k1', name: '天子定方位量天石标', icon: '📐', type: 'key', desc: '根据北极星定向的莫角山轴线基准石' },
                    { id: 'part_lz_2_k2', name: '莫角山基台花岗巨石', icon: '🗿', type: 'key', desc: '自远处天目山系水运而来的角石巨料' }
                ],
                regularParts: [
                    { id: 'part_lz_2_r1', name: '多层版筑夯土紧密层·上', icon: '🧱', count: 1, desc: '木版挡土反复夯打至坚如铁石的上层' },
                    { id: 'part_lz_2_r2', name: '多层版筑夯土紧密层·下', icon: '🧱', count: 1, desc: '承载巨型神庙千钧重压的下层厚土' },
                    { id: 'part_lz_2_r3', name: '山林运土圆木滚杠', icon: '🪵', count: 1, desc: '在滚木上拉运万斤重石的坚硬圆木' },
                    { id: 'part_lz_2_r4', name: '防滑阶梯碎石垫层', icon: '⚪', count: 1, desc: '通往莫角山顶神圣步道的基础石垫' },
                    { id: 'part_lz_2_r5', name: '神坛东坡白土护面层', icon: '🏔️', count: 1, desc: '良渚特有的高岭纯净白土祭祀敷面' },
                    { id: 'part_lz_2_r6', name: '台基周边盲沟排水沟', icon: '🕳️', count: 1, desc: '保护高台数千年不被暴雨冲塌的暗渠' }
                ]
            },
            {
                stage: 3,
                name: '巨木成林',
                desc: '立起直径近一米的大孔开槽金丝楠木王权大立柱，横架重梁，构建庄严大殿骨架',
                stageTargetParts: 24,
                keyParts: [
                    { id: 'part_lz_3_k1', name: '金丝楠木王权立柱·乾', icon: '🌲', type: 'key', desc: '神庙正殿正东乾位第一粗壮通天大柱' },
                    { id: 'part_lz_3_k2', name: '金丝楠木王权立柱·坤', icon: '🌲', type: 'key', desc: '承托神座上方重梁的坤位稳固巨柱' }
                ],
                regularParts: [
                    { id: 'part_lz_3_r1', name: '大孔开槽柱脚防腐垫木', icon: '🪵', count: 1, desc: '深达一米柱穴底部的厚木托板' },
                    { id: 'part_lz_3_r2', name: '粗大横向拉结木枋梁', icon: '🥢', count: 1, desc: '锁死各主柱保持大殿刚性的巨枋' },
                    { id: 'part_lz_3_r3', name: '屋面斜向分水大角梁', icon: '📐', count: 1, desc: '形成大歇山屋顶优美挑角的主角椽' },
                    { id: 'part_lz_3_r4', name: '榫卯嵌扣青铜固定插销', icon: '🔩', count: 1, desc: '原始坚固开槽咬合的榫卯木舌' },
                    { id: 'part_lz_3_r5', name: '外廊环绕巡警木走廊', icon: '🛤️', count: 1, desc: '神王卫队环绕大殿巡视的悬挑回廊' },
                    { id: 'part_lz_3_r6', name: '两厢储藏与仪仗配殿架', icon: '🛖', count: 1, desc: '大殿两侧保管礼器与玉具的左右偏殿' }
                ]
            },
            {
                stage: 4,
                name: '丹砂涂阁',
                desc: '铺设厚达数十厘米的红烧土防潮地面，编竹抹泥涂抹朱砂，黑陶雕兽盖顶',
                stageTargetParts: 32,
                keyParts: [
                    { id: 'part_lz_4_k1', name: '神人兽面纹青铜铭牌', icon: '🛡️', type: 'key', desc: '镶嵌在大殿正门的神圣标志金铜牌' },
                    { id: 'part_lz_4_k2', name: '大殿双开朱砂巨木门', icon: '🚪', type: 'key', desc: '厚重结实、通体刷满朱红矿物漆的大门' }
                ],
                regularParts: [
                    { id: 'part_lz_4_r1', name: '抗风厚重防雨编竹壁板', icon: '🎋', count: 1, desc: '紧密编织竹帘夹泥的防强台风殿壁' },
                    { id: 'part_lz_4_r2', name: '高温煅烧红烧土地坪砖', icon: '🧱', count: 1, desc: '平整光洁、叩之有声的红陶质地面' },
                    { id: 'part_lz_4_r3', name: '大殿外壁漆彩防水涂层', icon: '🎨', count: 1, desc: '以天然大漆调和朱砂的防腐亮光面' },
                    { id: 'part_lz_4_r4', name: '编织芦苇双层绝热屋面', icon: '🌾', count: 1, desc: '江南水乡特有的冬暖夏凉厚苇席' },
                    { id: 'part_lz_4_r5', name: '重檐外挑防雨水木飞椽', icon: '🥢', count: 1, desc: '深挑达两米以上的大出檐构件' },
                    { id: 'part_lz_4_r6', name: '良渚刻符黑陶瓦当饰件', icon: '🏺', count: 1, desc: '屋脊两端安装的精雕细刻黑陶兽头' }
                ]
            },
            {
                stage: 5,
                name: '玉映神光',
                desc: '神王宝殿竣工！正脊安放神人兽面大玉琮之王与象牙金杖，太湖碧水与通天玉光交映',
                stageTargetParts: 40,
                keyParts: [
                    { id: 'part_lz_5_k1', name: '神人兽面纹 · 大玉琮之王', icon: '👑', type: 'key', desc: '良渚至高国宝！外方内圆，细如发丝的神人兽面雕刻' },
                    { id: 'part_lz_5_k2', name: '神王象牙权杖黄金顶', icon: '🪄', type: 'key', desc: '象牙透雕嵌玉的神王权柄至尊金杖' }
                ],
                regularParts: [
                    { id: 'part_lz_5_r1', name: '三叉形神冠白玉插饰', icon: '🪶', count: 1, desc: '王冠中央耸立的三叉形温润透雕玉饰' },
                    { id: 'part_lz_5_r2', name: '精磨透光双圈白玉璧', icon: '🪩', count: 1, desc: '苍璧礼天，悬挂在大殿中央的巨型玉璧' },
                    { id: 'part_lz_5_r3', name: '神王九五之尊金丝楠木榻', icon: '🛋️', count: 1, desc: '大殿中央铺设华贵兽皮的神王宝座' },
                    { id: 'part_lz_5_r4', name: '祭天燎祭玄石大火鼎', icon: '🔥', count: 1, desc: '祭坛前方青烟袅袅的巨石燎祭大盆' },
                    { id: 'part_lz_5_r5', name: '聚落四方守卫巨石神兽', icon: '🗿', count: 1, desc: '分立台基四角威慑四方的护法图腾石' },
                    { id: 'part_lz_5_r6', name: '太湖碧波升腾祥云神光', icon: '✨', count: 1, desc: '良渚古城万家灯火与太湖碧波升腾祥瑞' }
                ]
            }
        ]
    },

    // ==========================================================================
    // 纪元二：文明初曙 (青铜破晓与最早王都)
    // ==========================================================================
    erlitou_palace: {
        id: 'erlitou_palace',
        name: '二里头 · 华夏第一王都（夏都一号宫殿）',
        subtitle: '青铜时代的破晓 · 最早的中原王朝封闭四合院宫城',
        era: '文明初曙',
        eraIndex: 1,
        type: 'compact',
        totalParts: 20,
        keyPartsCount: 5,
        regularPartsCount: 15,
        stagesCount: 4,
        historyNote: '距今约 3800~3500 年前（二里头文化时期），中国考古发现最早的超大型封闭式庭院廊庑宫殿建筑群（一号宫殿），占地达 1 万平方米。开创了中轴对称、前朝后寝、回廊环绕的华夏宫室营建之祖制，同时孕育了中国最早的官营青铜冶铸与绿松石龙图腾。',
        passiveBuff: {
            title: '王都秩序',
            desc: '每日登录自动产出 +3 金元宝；历法研究与文博道具探险效率提升 15%',
            icon: '🐉'
        },
        stages: [
            {
                stage: 1,
                name: '华夏主轴',
                desc: '开凿伊洛平原，多层版筑夯筑万方巨型大台基，铺设散水明沟与双轨官道车辙',
                stageTargetParts: 5,
                keyPart: {
                    id: 'part_elt_1_k',
                    name: '洛水青石定穴规矩盘',
                    icon: '🧭',
                    type: 'key',
                    desc: '二里头王室观星定北极子午线神盘，奠定中国最早都城中轴对称朝向'
                },
                regularParts: [
                    { id: 'part_elt_1_r1', name: '万方版筑夯土大台基', icon: '🧱', count: 1, desc: '层层紧密夯砸的万人平整夯土地基' },
                    { id: 'part_elt_1_r2', name: '环院散水鹅卵石明沟', icon: '⚪', count: 1, desc: '宫殿檐下排洪防冲刷的卵石散水护道' },
                    { id: 'part_elt_1_r3', name: '陶制节节相套排水暗管', icon: '🏺', count: 1, desc: '华夏最早的城市地下陶制水利暗渠' },
                    { id: 'part_elt_1_r4', name: '官道平整双轨车辙石', icon: '🛤️', count: 1, desc: '华夏最早的双轮战车车辙官道遗存' }
                ]
            },
            {
                stage: 2,
                name: '廊庑成网',
                desc: '立起东、西、南三面回廊排柱与双重南门门塾，构筑华夏最早万平封闭大庭院',
                stageTargetParts: 10,
                keyPart: {
                    id: 'part_elt_2_k',
                    name: '南大门双重主门塾柱',
                    icon: '🚪',
                    type: 'key',
                    desc: '王都南正门双开大门楼柱网，威仪赫赫的王宫出入咽喉'
                },
                regularParts: [
                    { id: 'part_elt_2_r1', name: '东庑连列木构排柱', icon: '🪵', count: 1, desc: '环抱大庭院东侧的数十根高耸木列柱' },
                    { id: 'part_elt_2_r2', name: '西庑连列木构排柱', icon: '🪵', count: 1, desc: '西侧护卫回廊的规整排架立柱' },
                    { id: 'part_elt_2_r3', name: '南回廊抱头榫木横枋', icon: '🥢', count: 1, desc: '横向锁固回廊柱网的早期榫卯木大梁' },
                    { id: 'part_elt_2_r4', name: '廊庑双坡防雨出檐椽', icon: '📐', count: 1, desc: '遮蔽风雨的斜向回廊出挑排椽' }
                ]
            },
            {
                stage: 3,
                name: '巍巍中堂',
                desc: '坐北朝南树立八开间巍峨正殿，架设八架大通梁与四阿重挑飞檐草顶',
                stageTargetParts: 15,
                keyPart: {
                    id: 'part_elt_3_k',
                    name: '正殿八架大通梁金柱',
                    icon: '🌲',
                    type: 'key',
                    desc: '承载一号宫殿正殿正脊最高重压的通天金柱大梁'
                },
                regularParts: [
                    { id: 'part_elt_3_r1', name: '八间坐北大殿木骨泥墙', icon: '🛖', count: 1, desc: '面阔八间、坚固阻隔风雪的厚抹草泥外墙' },
                    { id: 'part_elt_3_r2', name: '前后出抱厦檐柱排架', icon: '🏛️', count: 1, desc: '正殿前后向外挑出的深阔副阶抱厦回廊' },
                    { id: 'part_elt_3_r3', name: '殿堂白灰烧土平整地坪', icon: '⚪', count: 1, desc: '以草木白灰与烧红土反复抹平光亮的地坪' },
                    { id: 'part_elt_3_r4', name: '四阿重挑飞檐厚草顶', icon: '🌾', count: 1, desc: '四面斜坡的大庑殿顶雏形，展翅欲飞的宏伟草顶' }
                ]
            },
            {
                stage: 4,
                name: '龙耀夏都',
                desc: '超级国宝齐聚！安奉两千余片绿松石龙形器与华夏第一爵，青铜高炉烈焰照耀王都',
                stageTargetParts: 20,
                keyParts: [
                    {
                        id: 'part_elt_4_k1',
                        name: '绿松石镶嵌龙形器 · 华夏第一龙',
                        icon: '🐉',
                        type: 'key',
                        desc: '二里头至高国宝！2000余片绿松石巨制，碧翠绚烂，中华龙图腾之正源'
                    },
                    {
                        id: 'part_elt_4_k2',
                        name: '华夏第一爵 · 夏代乳钉纹青铜爵',
                        icon: '🫅',
                        type: 'key',
                        desc: '中国最早的青铜礼器！长流尖尾、三足亭亭玉立，奠定华夏礼乐爵位之始'
                    }
                ],
                regularParts: [
                    { id: 'part_elt_4_r1', name: '嵌绿松石兽面纹铜牌饰', icon: '🛡️', count: 1, desc: '铸铜镶嵌数百片绿松石的王室神灵威慑护牌' },
                    { id: 'part_elt_4_r2', name: '官造冶铜坩埚高炉与熔流', icon: '🔥', count: 1, desc: '二里头铸铜作坊日夜不息的炼铜窑与赤红铜水' },
                    { id: 'part_elt_4_r3', name: '庭前仪仗双轮木战车', icon: '🛞', count: 1, desc: '华夏最早的双轮辐条木战车与王侯青铜銮铃' }
                ]
            }
        ]
    },

    sanxingdui_shrine: {
        id: 'sanxingdui_shrine',
        name: '三星堆 · 古蜀青铜神庙与通天神树',
        subtitle: '人神互通的青铜秘境 · 古蜀古国通天祭祀圣地',
        era: '文明初曙',
        eraIndex: 1,
        type: 'epic',
        totalParts: 40,
        keyPartsCount: 10,
        regularPartsCount: 30,
        stagesCount: 5,
        historyNote: '距今约 3600~3000 年前（商代晚期至西周早期），古蜀先民在成都平原鸭子河畔建立起辉煌奇绝的祭祀神庙与宗庙圣地。这里出土了高达近4米的一号青铜通天神树、阔达1.38米青铜纵目面具、戴金面罩青铜人头像、青铜大立人及黄金权杖，展现了人神沟通的神秘天界与独特的古蜀青铜文明巅峰。',
        passiveBuff: {
            title: '蜀道通天',
            desc: '每日登录自动产出 +4 金元宝；神秘探险触发稀有天外奇遇概率提升 20%',
            icon: '🌳'
        },
        stages: [
            {
                stage: 1,
                name: '筑坛掘坑',
                desc: '在鸭子河畔开山移土，构筑三星伴月三联阶梯式夯土大台基，开凿祭祀圣坑',
                stageTargetParts: 8,
                keyParts: [
                    { id: 'part_sxd_1_k1', name: '象牙测天祭祀灵标', icon: '📐', type: 'key', desc: '用于向北极与三星定位的祭天巨型象牙规矩仪' },
                    { id: 'part_sxd_1_k2', name: '祭祀坑八角青石基石', icon: '🪨', type: 'key', desc: '祭祀圣坑底部铺设的八角形玄青封土奠基石' }
                ],
                regularParts: [
                    { id: 'part_sxd_1_r1', name: '鸭子河鹅卵石防冲护堤', icon: '⚪', count: 1, desc: '临水沿岸用光滑河滩巨卵石砌筑的坚固防冲岸坡' },
                    { id: 'part_sxd_1_r2', name: '三星伴月阶梯夯土台·下层', icon: '🧱', count: 1, desc: '层层紧密夯砸的古蜀土台厚重基座' },
                    { id: 'part_sxd_1_r3', name: '三星伴月阶梯夯土台·上层', icon: '🧱', count: 1, desc: '承载巨型神庙千钧重压的致密高台' },
                    { id: 'part_sxd_1_r4', name: '祭坑青紫防渗硬土层', icon: '🟤', count: 1, desc: '祭祀坑内部经高温烘烤致密的防水防渗生土' },
                    { id: 'part_sxd_1_r5', name: '整根祭祀原生象牙排束·东', icon: '🐘', count: 1, desc: '祭坑周边层层叠叠堆放的巨大弯曲古蜀象牙' },
                    { id: 'part_sxd_1_r6', name: '整根祭祀原生象牙排束·西', icon: '🐘', count: 1, desc: '通体洁白、承载天地灵气的西侧整列巨象牙' }
                ]
            },
            {
                stage: 2,
                name: '幽殿立柱',
                desc: '树立四方神位抱头榫卯柱网与图腾雕花大柱，架设通天香樟大梁与人字穿斗排架',
                stageTargetParts: 16,
                keyParts: [
                    { id: 'part_sxd_2_k1', name: '神庙中轴通天香樟大梁', icon: '🌲', type: 'key', desc: '整根百年香樟巨木凿成的主脊天梁，芳香驱蠹' },
                    { id: 'part_sxd_2_k2', name: '四方神位抱头榫卯立柱', icon: '🪵', type: 'key', desc: '镇守殿堂四正神位的粗壮承重巨柱' }
                ],
                regularParts: [
                    { id: 'part_sxd_2_r1', name: '回廊图腾雕花金丝楠木柱·东', icon: '🥢', count: 1, desc: '表面雕刻神鸟羽纹的东侧神圣排柱' },
                    { id: 'part_sxd_2_r2', name: '回廊图腾雕花金丝楠木柱·西', icon: '🥢', count: 1, desc: '表面雕刻云雷盘龙的西侧列排柱架' },
                    { id: 'part_sxd_2_r3', name: '古蜀人字斜撑穿斗木架构', icon: '📐', count: 1, desc: '西南古蜀特有的抗强震穿斗式榫卯大三角架' },
                    { id: 'part_sxd_2_r4', name: '祭祀大殿四面迎风出挑飞檐椽', icon: '🎋', count: 1, desc: '深挑达数米、如鸟翼般舒展的出檐飞椽' },
                    { id: 'part_sxd_2_r5', name: '神殿双开朱漆雕凤重门', icon: '🚪', count: 1, desc: '通体刷抹朱砂天然大漆、透雕太阳神鸟的双扉大门' },
                    { id: 'part_sxd_2_r6', name: '殿内白灰掺合黑陶防潮地平', icon: '⚪', count: 1, desc: '掺拌草木白灰与致密黑陶粉反复磨平光亮的地板' }
                ]
            },
            {
                stage: 3,
                name: '灵面通神',
                desc: '正殿安奉青铜纵目千里眼巨型面具与黄金面罩铜像，殿前列阵青铜仪仗与燎祭神火',
                stageTargetParts: 24,
                keyParts: [
                    { id: 'part_sxd_3_k1', name: '青铜纵目千里眼巨型面具', icon: '👁️', type: 'key', desc: '宽1.38米至尊青铜巨面！眼柱凸出16厘米，双耳巨大如翼，沟通千里神境' },
                    { id: 'part_sxd_3_k2', name: '戴黄金面罩青铜人头坐像', icon: '✨', type: 'key', desc: '面贴薄如蝉翼的纯金面箔，金光璀璨，神圣威仪至尊' }
                ],
                regularParts: [
                    { id: 'part_sxd_3_r1', name: '青铜面具祭祀石台列阵·左', icon: '🗿', count: 1, desc: '分立殿门左侧的多尊威严肃穆青铜人面具' },
                    { id: 'part_sxd_3_r2', name: '青铜面具祭祀石台列阵·右', icon: '🗿', count: 1, desc: '右侧严密排列的立耳圆瞳青铜神像石座' },
                    { id: 'part_sxd_3_r3', name: '祭祀玄石燎祭大铜鼎与火膛', icon: '🔥', count: 1, desc: '熊熊燃烧、日夜不灭的古蜀通灵燎祭圣火' },
                    { id: 'part_sxd_3_r4', name: '殿前列阵青铜戈玉璋仪仗', icon: '🗡️', count: 1, desc: '刀锋锐利的青铜戈与斜刃透光墨玉大璋仪仗排架' },
                    { id: 'part_sxd_3_r5', name: '神庙重檐覆云厚茅草大顶', icon: '🌾', count: 1, desc: '多层密铺芦苇干草、形成如排云般雄浑的坡顶' },
                    { id: 'part_sxd_3_r6', name: '屋脊两端青铜立鸟兽角瓦脊', icon: '🦅', count: 1, desc: '大脊两端铸造高翘的展翅青铜神鸟与卷角神兽' }
                ]
            },
            {
                stage: 4,
                name: '光轮金杖',
                desc: '悬空五辐青铜太阳轮与鱼鸟纹黄金王权权杖，神职巫师跪坐执璋朝拜天穹',
                stageTargetParts: 32,
                keyParts: [
                    { id: 'part_sxd_4_k1', name: '青铜太阳轮五辐圆盘', icon: '☀️', type: 'key', desc: '五道光芒均匀放射，象征天界太阳巡行四方宇宙的至圣重器' },
                    { id: 'part_sxd_4_k2', name: '鱼鸟纹透雕黄金王权权杖', icon: '🪄', type: 'key', desc: '古蜀蜀王至尊金杖！金箔包裹，细密刻画鱼、鸟与箭羽图案' }
                ],
                regularParts: [
                    { id: 'part_sxd_4_r1', name: '悬空光芒铜质天穹吊环', icon: '🪩', count: 1, desc: '悬挂于神殿中空、引聚天光的光芒青铜大金轮环' },
                    { id: 'part_sxd_4_r2', name: '祭祀神坛三层镂空青铜座', icon: '🏛️', count: 1, desc: '三层多曲镂空山形底座，承载神圣祭器' },
                    { id: 'part_sxd_4_r3', name: '跪坐执璋青铜神职小人像', icon: '🫅', count: 1, desc: '头戴高冠、神情恭顺跪拜在案前的通神巫者' },
                    { id: 'part_sxd_4_r4', name: '神庙四周云雷纹祭幡金带', icon: '🎗️', count: 1, desc: '随山风猎猎翻飞的玄青朱红云雷长幡' },
                    { id: 'part_sxd_4_r5', name: '古蜀青铜扭头跪坐神人', icon: '🧘', count: 1, desc: '盘发高挽、回首望天的青铜祭祀力士' },
                    { id: 'part_sxd_4_r6', name: '祭坑红烧土玉璧铺底层', icon: '🪨', count: 1, desc: '祭坑底层平整铺设的数十枚苍璧玉璧与碎松石' }
                ]
            },
            {
                stage: 5,
                name: '通天神树',
                desc: '一号青铜通天神树参天耸立！青铜大立人像身披龙袍执握天杖，九只金乌栖止枝头，人神合一',
                stageTargetParts: 40,
                keyParts: [
                    { id: 'part_sxd_5_k1', name: '一号青铜通天神树 · 参天神干', icon: '🌳', type: 'key', desc: '高达近4米的旷世重器！三层九枝，果实垂悬，下有飞龙自天而降' },
                    { id: 'part_sxd_5_k2', name: '青铜大立人像 · 龙袍通天神巫', icon: '👑', type: 'key', desc: '通高2.62米！头戴莲花宝冠，身穿三重龙纹华服，双手虚握统摄天地神杖' }
                ],
                regularParts: [
                    { id: 'part_sxd_5_r1', name: '神树枝头金羽太阳神鸟·九只', icon: '🐦', count: 1, desc: '昂首引吭立于神树各枝端的金羽神乌' },
                    { id: 'part_sxd_5_r2', name: '神树游弋探首青铜飞龙', icon: '🐉', count: 1, desc: '自天界沿树干倒悬蜿蜒而下的铜龙，马脸双角' },
                    { id: 'part_sxd_5_r3', name: '神树三叉镂空圆盘底座', icon: '⛰️', count: 1, desc: '象征神山神界的巨大三面拱形青铜基台' },
                    { id: 'part_sxd_5_r4', name: '神殿顶端青铜神兽风铎', icon: '🔔', count: 1, desc: '檐角悬挂的镂空小青铜铃，微风过处清音悠扬' },
                    { id: 'part_sxd_5_r5', name: '通天神树金碧神光聚能环', icon: '✨', count: 1, desc: '神树树冠弥漫升腾的耀目金绿神辉与光环微粒' },
                    { id: 'part_sxd_5_r6', name: '古蜀大地星宿运转祥云', icon: '🌌', count: 1, desc: '连接天界的虚空瑞云与旋转星宿祥光' }
                ]
            }
        ]
    },

    // ==========================================================================
    // 纪元三：周·礼制与争鸣 (封邦建国与礼乐宗庙)
    // ==========================================================================
    zhouyuan_temple: {
        id: 'zhouyuan_temple',
        name: '周原 · 岐邑凤雏周庙（华夏第一四合院）',
        subtitle: '西周封邦建国发祥圣地 · 华夏最早成熟瓦顶两进四合院宗邑',
        era: '周·礼制与争鸣',
        eraIndex: 2,
        type: 'compact',
        totalParts: 20,
        keyPartsCount: 5,
        regularPartsCount: 15,
        stagesCount: 4,
        historyNote: '距今约 3100~2900 年前（西周早中期），周王室营建于岐下周原凤雏村的核心宗庙与政治中枢（凤雏甲组遗址，占地 1469 平方米）。建筑布局严整严密，开创了中轴对称、前堂后寝、东西配殿、门塾屏风（华夏第一影壁萧墙）以及最早烧制陶板瓦屋顶的成熟四合院形制，为后世三千年中国院落建筑之祖制。出土“宅兹中国”何尊、记录武王克商的利簋及两万余片微雕甲骨，是西周制礼作乐与宗法文明的物质巅峰。',
        passiveBuff: {
            title: '周礼天下',
            desc: '每日登录自动产出 +3 金元宝；连续打卡与经验暴击率提升 15%，周代礼乐遗物探险消耗减少 10%',
            icon: '🛕'
        },
        stages: [
            {
                stage: 1,
                name: '夯基通渠',
                desc: '开辟岐下周原，层层夯筑高出平地之万方台基，埋设陶制公母榫卯排水暗管与渗井',
                stageTargetParts: 5,
                keyPart: {
                    id: 'part_zy_1_k',
                    name: '岐山周原定穴规矩盘',
                    icon: '🧭',
                    type: 'key',
                    desc: '周公旦测日影定子午线神盘，奠定中国早期建筑严格中轴对称与朝向规范'
                },
                regularParts: [
                    { id: 'part_zy_1_r1', name: '凤雏甲组万方版筑夯土大台基', icon: '🧱', count: 1, desc: '黄土掺砂石层层紧密夯筑、高出平地的大型两进四合院台基' },
                    { id: 'part_zy_1_r2', name: '陶制公母榫卯地下排水暗渠', icon: '🏺', count: 1, desc: '华夏最早城市给排水暗管，公母企口紧密咬合防渗' },
                    { id: 'part_zy_1_r3', name: '庭院渗水暗井与散水卵石明沟', icon: '⚪', count: 1, desc: '檐下排洪防冲刷的卵石散水护道与渗水暗井' },
                    { id: 'part_zy_1_r4', name: '南大门外夯土斜坡踏道', icon: '🪵', count: 1, desc: '通向宗庙门塾的平缓礼制斜坡踏步' }
                ]
            },
            {
                stage: 2,
                name: '立塾安屏',
                desc: '树立大门两翼双重门塾与东西列庑木构排架，于南门外树立华夏第一道影壁（树塞门）',
                stageTargetParts: 10,
                keyPart: {
                    id: 'part_zy_2_k',
                    name: '华夏最早夯土影壁萧墙',
                    icon: '🛡️',
                    type: 'key',
                    desc: '立于南门外中轴线上的独立照壁屏风（天子外屏之祖制），开创遮蔽视线、界定威仪之周礼营建典范'
                },
                regularParts: [
                    { id: 'part_zy_2_r1', name: '南大门左右双重门塾房', icon: '🚪', count: 1, desc: '威严中轴大门两翼的门房塾舍与青铜铺首衔环' },
                    { id: 'part_zy_2_r2', name: '东庑列列配殿木构排架', icon: '🪵', count: 1, desc: '庭院东侧排列整齐的八间东配殿大木骨架' },
                    { id: 'part_zy_2_r3', name: '西庑连列配殿木构排架', icon: '🪵', count: 1, desc: '庭院西侧陈设祭器仪仗的八间西配殿木构排柱' },
                    { id: 'part_zy_2_r4', name: '环院贯通回廊抱头榫过梁', icon: '🥢', count: 1, desc: '连接门塾、两庑与中堂的回廊大木过梁横枋' }
                ]
            },
            {
                stage: 3,
                name: '巍峨堂寝',
                desc: '筑立六开间巍峨前堂与五间私密后寝，搭设穿廊工字殿，铺排华夏最早西周烧制陶板瓦顶',
                stageTargetParts: 15,
                keyPart: {
                    id: 'part_zy_3_k',
                    name: '前堂六开间祭祀议事中堂',
                    icon: '🏛️',
                    type: 'key',
                    desc: '宗庙举行宗族议事、册封赏赐与祭天大典的高耸前堂，面阔六间进深三间'
                },
                regularParts: [
                    { id: 'part_zy_3_r1', name: '后进五间私密后寝神殿与穿廊', icon: '🛖', count: 1, desc: '供奉周室先公神位之所，中轴穿廊连接前堂构成工字殿雏形' },
                    { id: 'part_zy_3_r2', name: '华夏最早西周烧制陶板瓦屋脊', icon: '🧱', count: 1, desc: '凤雏出土最早陶板瓦与半圆筒瓦排布，瓦垄深沉，告别茅草' },
                    { id: 'part_zy_3_r3', name: '四阿重挑飞檐大木出挑飞椽', icon: '📐', count: 1, desc: '深挑出檐，如鸟斯革如翚斯飞的大木飞椽' },
                    { id: 'part_zy_3_r4', name: '白灰烧土双层平整室内地平', icon: '⚪', count: 1, desc: '草木白灰与烧红土多道抹光的祭堂光滑地坪' }
                ]
            },
            {
                stage: 4,
                name: '金石齐鸣',
                desc: '重器齐聚！安奉“宅兹中国”何尊与武王克商利簋，鼎立毛公鼎，两万片微雕甲骨与编钟雅乐和鸣',
                stageTargetParts: 20,
                keyParts: [
                    {
                        id: 'part_zy_4_k1',
                        name: '铭刻“宅兹中国” · 西周何尊',
                        icon: '👑',
                        type: 'key',
                        desc: '宝鸡出土国宝重器！圆口方体，四角高耸镂空扉棱，高浮雕饕餮纹，铭文最早记载“中国”'
                    },
                    {
                        id: 'part_zy_4_k2',
                        name: '武王征商利簋 · 天圆地方座',
                        icon: '🫅',
                        type: 'key',
                        desc: '国博镇馆之宝！圈足连铸高大方座，双兽耳垂长珥，铭刻武王伐纣岁星当空之确切天象'
                    }
                ],
                regularParts: [
                    { id: 'part_zy_4_r1', name: '毛公鼎 · 499字西周最长青铜铭文', icon: '🍲', count: 1, desc: '双立耳三蹄足，鼎内铸刻32行499字金文巨册，晚清海内三宝之一' },
                    { id: 'part_zy_4_r2', name: '周原微雕卜甲甲骨文窖藏', icon: '📜', count: 1, desc: '凤雏窖穴出土两万余片刻字细如粟米的西周王室占卜甲骨' },
                    { id: 'part_zy_4_r3', name: '西周青铜甬钟三层编钟乐架', icon: '🔔', count: 1, desc: '朱漆彩绘木架悬挂西周合瓦形甬钟，三十六枚钟枚，金石雅乐和鸣' }
                ]
            }
        ]
    }
};

// 辅助工具：根据 ID 获取奇迹完整定义
export const getWonderById = (wonderId) => {
    return WONDERS_DATA[wonderId] || null;
};

// 辅助工具：获取某个纪元下的所有奇迹列表
export const getWondersByEra = (eraName) => {
    return Object.values(WONDERS_DATA).filter(w => w.era === eraName);
};

export default WONDERS_DATA;

