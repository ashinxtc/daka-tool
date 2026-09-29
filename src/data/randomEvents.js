// 随机事件数据表
export const RANDOM_EVENTS = [
            // --- 第一纪元：远古之路 ---
            { id: 'era1_u_fire', type: 'unique', era: '远古之路', minLevelName: '能人', desc: '在钻木取火时，一点火星落入干草，你成功升起了第一堆篝火！野兽不敢靠近了。', rewardType: 'xp', rewardValue: 50, title: '普罗米修斯时刻' },
            { id: 'era1_u_stars', type: 'unique', era: '远古之路', minLevelName: '直立人', desc: '今夜星河璀璨，你躺在洞穴口仰望，脑海中第一次诞生了“世界”这个概念。', rewardType: 'xp', rewardValue: 40, title: '仰望星空' },
            { id: 'era1_u_art', type: 'unique', era: '远古之路', minLevelName: '智人', desc: '你用红色矿石粉末混合油脂，在岩壁上画下了狩猎野牛的场景，这是最早的艺术。', rewardType: 'gold', rewardValue: 10, title: '墙壁上的艺术' },
            { id: 'era1_u_obsidian', type: 'unique', era: '远古之路', minLevelName: '能人', desc: '你在河边捡到一块锋利的黑色石头，把它绑在木棍上，做成了锋利的长矛。', rewardType: 'xp', rewardValue: 30, title: '黑曜石' },
            { id: 'era1_r_berries', type: 'repeat', era: '远古之路', minLevelName: '萌芽之识', desc: '在一片灌木丛中发现了酸甜可口的红浆果，饱餐一顿，心情大好。', rewardType: 'gold', rewardValue: 5, title: '采集浆果' },
            { id: 'era1_r_tiger', type: 'repeat', era: '远古之路', minLevelName: '萌芽之识', desc: '草丛中突然窜出一只剑齿虎！幸好你利用对地形的熟悉，爬上大树逃过一劫。', rewardType: 'xp', rewardValue: 20, title: '险象环生' },
            { id: 'era1_r_rain', type: 'repeat', era: '远古之路', minLevelName: '萌芽之识', desc: '突然天降暴雨，你和族人躲在山洞里瑟瑟发抖，好在火堆没有熄灭。', rewardType: 'xp', rewardValue: 10, title: '暴雨如注' },
            { id: 'era1_r_rabbit', type: 'repeat', era: '远古之路', minLevelName: '萌芽之识', desc: '草丛里窜出一只肥硕的野兔，你一路狂奔，终于用石块击中了它！', rewardType: 'gold', rewardValue: 5, title: '追逐野兔' },

            // --- 第二纪元：文明初曙 ---
            { id: 'era2_u_knots', type: 'unique', era: '文明初曙', minLevelName: '部落民', desc: '为了记录猎物的数量，你发明了在绳子上打结的方法，这是数学的萌芽！', rewardType: 'xp', rewardValue: 60, title: '结绳记事' },
            { id: 'era2_u_pottery', type: 'unique', era: '文明初曙', minLevelName: '部落民', desc: '原本用来涂抹编织筐的泥巴掉进火堆，意外烧成了坚硬的陶碗。你发现了制陶术！', rewardType: 'gold', rewardValue: 15, title: '陶器的诞生' },
            { id: 'era2_u_herbs', type: 'unique', era: '文明初曙', minLevelName: '氏族长', desc: '你发现嚼碎某种草叶敷在伤口上可以止血，族人们尊称你为神医。', rewardType: 'xp', rewardValue: 80, title: '神农尝百草' },
            { id: 'era2_u_totem', type: 'unique', era: '文明初曙', minLevelName: '氏族长', desc: '你将“龙”作为氏族的守护神标志，族人们的凝聚力空前高涨。', rewardType: 'xp', rewardValue: 50, title: '图腾的确立' },
            { id: 'era2_u_silk', type: 'unique', era: '文明初曙', minLevelName: '大酋长', desc: '你在桑树上发现了白色的虫茧，抽出的丝线竟然如此强韧光亮，可以织成衣物。', rewardType: 'gold', rewardValue: 20, title: '嫘祖养蚕' },
            { id: 'era2_r_festival', type: 'repeat', era: '文明初曙', minLevelName: '部落民', desc: '今晚部落举行盛大的篝火晚会，庆祝狩猎丰收，你分到了一块最肥美的烤肉。', rewardType: 'gold', rewardValue: 10, title: '丰收祭典' },
            { id: 'era2_r_conflict', type: 'repeat', era: '文明初曙', minLevelName: '氏族长', desc: '隔壁部落试图抢占水源，你带领族人挥舞石斧，成功吓退了入侵者。', rewardType: 'xp', rewardValue: 30, title: '部落冲突' },
            { id: 'era2_r_repair', type: 'repeat', era: '文明初曙', minLevelName: '部落民', desc: '昨夜的大风吹坏了屋顶的茅草，你爬上去重新加固，新屋顶更加结实了。', rewardType: 'xp', rewardValue: 20, title: '修补房屋' },
            { id: 'era2_r_trade', type: 'repeat', era: '文明初曙', minLevelName: '部落民', desc: '你用多余的兽皮跟隔壁邻居换了一罐蜂蜜，甜甜的味道让人心情愉悦。', rewardType: 'gold', rewardValue: 5, title: '交换物资' },

            // --- 第三纪元：周·礼制与争鸣 ---
            { id: 'era3_u_field', type: 'unique', era: '周·礼制与争鸣', minLevelName: '野人', desc: '你负责耕作的“公田”和“私田”划分得井井有条，今年的收成格外好。', rewardType: 'gold', rewardValue: 15, title: '井田制' },
            { id: 'era3_u_rites', type: 'unique', era: '周·礼制与争鸣', minLevelName: '国人', desc: '周公制定了严格的礼乐制度，你学习了祭祀的规矩，感到秩序井然。', rewardType: 'xp', rewardValue: 60, title: '制礼作乐' },
            { id: 'era3_u_bronze', type: 'unique', era: '周·礼制与争鸣', minLevelName: '士', desc: '作为工匠监造，你参与铸造了一口巨大的司母戊鼎，铭文精美绝伦。', rewardType: 'xp', rewardValue: 100, title: '铸造青铜鼎' },
            { id: 'era3_u_poems', type: 'unique', era: '周·礼制与争鸣', minLevelName: '士', desc: '采诗官来到乡间，你随口哼唱的劳动歌谣被记录下来，编入了《诗经》。', rewardType: 'gold', rewardValue: 20, title: '诗经采风' },
            { id: 'era3_u_100schools', type: 'unique', era: '周·礼制与争鸣', minLevelName: '大夫', desc: '稷下学宫里，你旁听了孟子与荀子的辩论，对“人性本善”还是“本恶”陷入深思。', rewardType: 'xp', rewardValue: 150, title: '百家争鸣' },
            { id: 'era3_u_beacon', type: 'unique', era: '周·礼制与争鸣', minLevelName: '卿', desc: '听闻幽王为了博美人一笑点燃烽火，诸侯空跑一趟。你感叹：无信则不立。', rewardType: 'xp', rewardValue: 50, title: '烽火戏诸侯' },
            { id: 'era3_u_jade', type: 'unique', era: '周·礼制与争鸣', minLevelName: '卿', desc: '作为使臣出使秦国，你凭借智慧和勇气，保全了国家的宝玉和尊严。', rewardType: 'gold', rewardValue: 30, title: '完璧归赵' },
            { id: 'era3_r_archery', type: 'repeat', era: '周·礼制与争鸣', minLevelName: '士', desc: '君子六艺，射为重。今日校场演练，你三发全中靶心！', rewardType: 'xp', rewardValue: 40, title: '练习射礼' },
            { id: 'era3_r_tribute', type: 'repeat', era: '周·礼制与争鸣', minLevelName: '大夫', desc: '封地的家臣送来了今年的税收，有丝绸、粮食和少许铜币。', rewardType: 'gold', rewardValue: 15, title: '采邑纳贡' },
            { id: 'era3_r_alliance', type: 'repeat', era: '周·礼制与争鸣', minLevelName: '卿', desc: '随国君参加盟会，各国使节歃血为盟，约定互不侵犯。', rewardType: 'xp', rewardValue: 60, title: '诸侯会盟' },
            { id: 'era3_r_reading', type: 'repeat', era: '周·礼制与争鸣', minLevelName: '士', desc: '清晨，你大声朗诵《尚书》，琅琅书声引来了路人的驻足聆听。', rewardType: 'xp', rewardValue: 30, title: '诵读经典' },
            { id: 'era3_r_pot', type: 'repeat', era: '周·礼制与争鸣', minLevelName: '奴', desc: '宴席间，大家玩起了投壶助兴。你手感极佳，连中三元，赢得了满堂彩！', rewardType: 'gold', rewardValue: 10, title: '投壶游戏' },

            // --- 第四纪元：魏晋隋唐·融合与登科 ---
            { id: 'era4_u_printing', type: 'unique', era: '魏晋隋唐·融合与登科', minLevelName: '白身', desc: '你在书肆看到一种新式印书法，书籍变得便宜了，你买了一本《金刚经》研读。', rewardType: 'xp', rewardValue: 80, title: '雕版印刷' },
            { id: 'era4_u_tea', type: 'unique', era: '魏晋隋唐·融合与登科', minLevelName: '秀才', desc: '在茶馆偶遇一位结巴老者煮茶，品尝后只觉两腋习习清风生，方知是陆羽。', rewardType: 'gold', rewardValue: 10, title: '茶圣陆羽' },
            { id: 'era4_u_music', type: 'unique', era: '魏晋隋唐·融合与登科', minLevelName: '进士', desc: '皇宫传出玄宗新制的乐曲，曲调宛如天籁，你在墙外听得如痴如醉。', rewardType: 'xp', rewardValue: 100, title: '霓裳羽衣曲' },
            { id: 'era4_u_lidu', type: 'unique', era: '魏晋隋唐·融合与登科', minLevelName: '进士', desc: '在洛阳酒楼，你有幸目睹了李白与杜甫的会面，这是中国诗坛最伟大的时刻！', rewardType: 'xp', rewardValue: 200, title: '李杜相逢' },
            { id: 'era4_u_envoy', type: 'unique', era: '魏晋隋唐·融合与登科', minLevelName: '校书郎', desc: '一位日本留学生阿倍仲麻吕向你请教汉字书法，你耐心指点。', rewardType: 'xp', rewardValue: 50, title: '遣唐使来访' },
            { id: 'era4_u_silkroad', type: 'unique', era: '魏晋隋唐·融合与登科', minLevelName: '员外郎', desc: '西域的驼队带来了香料和宝石，你用精美的丝绸换取了一块和田玉。', rewardType: 'gold', rewardValue: 30, title: '丝绸之路' },
            { id: 'era4_u_zhenguan', type: 'unique', era: '魏晋隋唐·融合与登科', minLevelName: '侍郎', desc: '查看户部账册，发现今年人口增长迅速，夜不闭户，真乃盛世！', rewardType: 'xp', rewardValue: 150, title: '贞观之治' },
            { id: 'era4_u_calligraphy', type: 'unique', era: '魏晋隋唐·融合与登科', minLevelName: '侍郎', desc: '你的书法日渐精进，甚至得到了颜真卿大人的指点，笔力刚劲。', rewardType: 'gold', rewardValue: 20, title: '颜筋柳骨' },
            { id: 'era4_r_drink', type: 'repeat', era: '魏晋隋唐·融合与登科', minLevelName: '进士', desc: '春风得意马蹄疾，你与同窗在曲江池畔饮酒赋诗，好不快活。', rewardType: 'gold', rewardValue: 15, title: '曲江流饮' },
            { id: 'era4_r_market', type: 'repeat', era: '魏晋隋唐·融合与登科', minLevelName: '白身', desc: '上元节取消宵禁，长安城灯火如昼，你猜中了灯谜，赢得了彩头。', rewardType: 'gold', rewardValue: 10, title: '长安夜市' },
            { id: 'era4_r_court', type: 'repeat', era: '魏晋隋唐·融合与登科', minLevelName: '员外郎', desc: '天还没亮就起床上朝，虽辛苦，但想到能为国分忧，顿时精神百倍。', rewardType: 'xp', rewardValue: 80, title: '勤政殿早朝' },
            { id: 'era4_r_letter', type: 'repeat', era: '魏晋隋唐·融合与登科', minLevelName: '白身', desc: '家乡的信使到了，带来了一封家书和一包特产，让你倍感温暖。', rewardType: 'xp', rewardValue: 10, title: '驿站传书' },
            { id: 'era4_r_polo', type: 'repeat', era: '魏晋隋唐·融合与登科', minLevelName: '白身', desc: '皇室在球场举办马球比赛，骏马飞驰，尘土飞扬，看得你热血沸腾！', rewardType: 'gold', rewardValue: 15, title: '观摩马球' },
        ];
export default RANDOM_EVENTS;
