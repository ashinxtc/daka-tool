// --- 商店商品列表与判定逻辑 ---

export const SHOP_ITEMS = [
            // 第一类：时空法宝
            {
                id: 'item_fire', name: '普罗米修斯之火', icon: '🔥', type: 'repair',
                price: 5, era: '远古之路', minLevel: 2,
                desc: '补签卡。可以修复过去任意一天未完成的打卡记录。',
                category: 'tool'
            },
            {
                id: 'item_adventure_food', name: '探险干粮', icon: '🍙', type: 'adventure_food',
                price: 5, era: '远古之路', minLevel: 1,
                desc: '探险必备！携带后宠物的饱食度消耗减半，更适合长途冒险。探险每小时消耗1个。',
                category: 'tool'
            },
            { 
                id: 'item_shield', name: '青铜守护盾', icon: '🛡️', type: 'passive_shield', 
                price: 80, era: '文明初曙', minLevel: 6, 
                desc: '防御卡。在“邪恶大转盘”惩罚生效前自动触发，抵消一次惩罚。',
                category: 'tool'
            },
            { 
                id: 'item_skip', name: '翰林院免作业金牌', icon: '📜', type: 'skip', 
                price: 200, era: '魏晋隋唐·融合与登科', minLevel: 16, 
                desc: '跳过卡。可直接完成今日一项任务并获得全额奖励。',
                category: 'tool'
            },
            { 
                id: 'item_hourglass', name: '时空沙漏', icon: '⏳', type: 'extend_deadline', 
                price: 30, era: '远古之路', minLevel: 0, 
                desc: '延时卡。将某个任务的截止时间向后延长24小时。',
                category: 'tool'
            },
            { 
                id: 'item_harvest', name: '双倍丰收符', icon: '🌾', type: 'buff_xp_3', 
                price: 100, era: '周·礼制与争鸣', minLevel: 9, 
                desc: '增益卡。使用后，接下来连续3次打卡获得的经验值(XP)翻倍。',
                category: 'tool'
            },
            // 第二类：
            { 
                id: 'frame_beast', name: '兽牙项链框', icon: '🦷', type: 'cosmetic_frame', 
                price: 150, era: '远古之路', minLevel: 0, 
                desc: '粗犷的野兽牙齿串成的边框。',
                category: 'cosmetic'
            },
            { 
                id: 'frame_bronze', name: '饕餮纹铜框', icon: '🗿', type: 'cosmetic_frame', 
                price: 150, era: '周·礼制与争鸣', minLevel: 0, 
                desc: '庄重神秘的青铜器纹路。',
                category: 'cosmetic'
            },
            { 
                id: 'frame_peony', name: '牡丹流光框', icon: '🌺', type: 'cosmetic_frame', 
                price: 150, era: '魏晋隋唐·融合与登科', minLevel: 0, 
                desc: '雍容华贵，带有动态流光效果。',
                category: 'cosmetic'
            },
            { 
                id: 'frame_aurora', name: '极光之吻 • 多彩幻梦动态头像框', icon: '✨', type: 'cosmetic_frame', 
                price: 150, era: '远古之路', minLevel: 0, 
                desc: '梦幻极光，色彩流转。',
                category: 'cosmetic'
            },
            { 
                id: 'frame_goldmoneyrain', name: '财富满贯·点金之翼荣耀头像框', icon: '💰', type: 'cosmetic_frame', 
                price: 150, era: '远古之路', minLevel: 0, 
                desc: '金光璀璨，财运亨通。',
                category: 'cosmetic'
            },
            { 
                id: 'frame_purpleglory', name: '紫晶契约·荣耀之冕头像框', icon: '💎', type: 'cosmetic_frame', 
                price: 150, era: '远古之路', minLevel: 0, 
                desc: '紫晶闪耀，尊贵荣耀。',
                category: 'cosmetic'
            },
            { 
                id: 'frame_springbird', name: '青燕筑梦·春华锦绣头像框', icon: '🐦', type: 'cosmetic_frame', 
                price: 150, era: '远古之路', minLevel: 0, 
                desc: '春燕归来，万物复苏。',
                category: 'cosmetic'
            },
            { 
                id: 'frame_electricpower', name: '电脉涌动·坚持之光头像框', icon: '⚡', type: 'cosmetic_frame', 
                price: 150, era: '远古之路', minLevel: 0, 
                desc: '电脉涌动，意志如光。',
                category: 'cosmetic'
            },
            { 
                id: 'frame_skywing', name: '天穹金翼·至尊加冕头像框', icon: '👑', type: 'cosmetic_frame', 
                price: 150, era: '远古之路', minLevel: 0, 
                desc: '天穹金翼，荣耀加冕。',
                category: 'cosmetic'
            },
            { 
                id: 'effect_name_fire', name: '火焰名字特效', icon: '🔥', type: 'cosmetic_name',
                price: 80, era: '远古之路', minLevel: 0, 
                desc: '让名字带有燃烧的火焰特效（有效期7天）。',
                category: 'cosmetic',
                duration: 7
            },
			{ 
                id: 'bg_galaxy', name: '星河静谧·银河星空', icon: '🌌', type: 'cosmetic_bg',
                price: 300, era: '远古之路', minLevel: 3, 
                desc: '“我们从哪里来？”当直立人第一次仰望星空，人类的灵魂便诞生了。装备后，主界面将化为深邃的动态银河。',
                category: 'cosmetic'
            },			
			{ 
                id: 'bg_meteor', name: '星河静谧·流星雨', icon: '🌠', type: 'cosmetic_bg',
                price: 300, era: '远古之路', minLevel: 3, 
                desc: '“在那寂静的深夜，愿你的思绪如流星般闪耀。”装备后，背景化为深邃的午夜蓝，流星划破长夜，助你在此刻心无旁骛。',
                category: 'cosmetic'
            },
			{ 
                id: 'bg_aurora', name: '极地之夜·欧若拉', icon: '🌌', type: 'cosmetic_bg',
                price: 250, era: '远古之路', minLevel: 5, 
                desc: '“冰河世纪的长夜里，先祖于洞穴口凝视天际。那舞动的光带是神灵的低语，还是未知的召唤？”装备后，获得动态极光背景，适合深度专注。',
                category: 'cosmetic'
            },
			{ 
                id: 'bg_lantern', name: '上元灯火·祈愿', icon: '🏮', type: 'cosmetic_bg',
                price: 800, era: '魏晋隋唐·融合与登科', minLevel: 16, 
                desc: '“东风夜放花千树。”长安上元夜，万盏灯火带着学子的心愿缓缓升空。装备后，暖橙色的孔明灯将充满屏幕，为您庆祝每一次努力后的辉煌时刻。',
                category: 'cosmetic'
            },
			{ 
                id: 'bg_firefly', name: '萤火之森·呼吸', icon: '🌲', type: 'cosmetic_bg',
                price: 400, era: '文明初曙', minLevel: 6, 
                desc: '“万物有灵，生生不息。”在部落文明的黎明，人类与森林共享呼吸。装备后，无数治愈的微光将在暗绿色的林间升起，带你重返自然的怀抱。',
                category: 'cosmetic'
            },
			{ 
                id: 'bg_ginkgo', name: '夫子庙前·银杏雨', icon: '🍂', type: 'cosmetic_bg',
                price: 400, era: '周·礼制与争鸣', minLevel: 12, 
                desc: '“礼乐教化，杏坛弦歌。”三千弟子曾于树下求学，如今金黄的叶片化作诗篇飘落。装备后，获得淡雅的秋日书院背景，助你在朗朗书声中凝神静气。',
                category: 'cosmetic'
            },
			{ 
                id: 'bg_matrix', name: '传说·万象字阵', icon: '📜', type: 'cosmetic_bg',
                price: 800, era: '文明初曙', minLevel: 7, 
                desc: '“仓颉观奎星圆曲之势，察鸟兽蹄远之迹，依类象形，始创文字。”天地之秘，皆入字阵。这仓颉眼中的世界。万物化为符号，在无尽的矩阵中穿梭、重组、演变。静静注视，看尽五千年的沧海桑田。”',
                category: 'cosmetic'
            },
			{ 
                id: 'bg_oraclesands', name: '秘境·甲骨流沙', icon: '📜', type: 'cosmetic_bg',
                price: 800, era: '文明初曙', minLevel: 8, 
                desc: '“历史原本是尘封的岩壁，直到你的指尖触碰，它们便化作了流动的沙。”触摸屏幕，你将掌控文明呼吸的节奏。',
                category: 'cosmetic'
            },
			{ 
                id: 'bg_firework', name: '新春限定·火树银花', icon: '🎆', type: 'cosmetic_bg',
                price: 1, era: '全纪元通用', minLevel: 1, 
                desc: '“东风夜放花千树，更吹落，星如雨。”无论身处远古洞穴还是大唐盛世，对光与热的向往是人类共通的情感。',
                category: 'cosmetic',
				// --- 【新增配置】 ---
                timeLimit: {
					type: 'api_holiday',
					holidayNames: ['春节', '除夕', '元宵'],
					msg: '春节/元宵节 前2天开启', // 更新提示文案
					fallbackStart: '2026-02-15',
					fallbackEnd: '2026-03-03'
				}
            },
			{ 
                id: 'bg_prismatic', name: '登科·琉璃华光', icon: '✨', type: 'cosmetic_bg',
                price: 1200, era: '魏晋隋唐·融合与登科', minLevel: 16, 
                desc: '“春风得意马蹄疾，一日看尽长安花。”汇聚西域琉璃之彩，绽放金榜题名之光！当西域的琉璃折射出大唐的阳光，那是文明交融的极致色彩。',
                category: 'cosmetic'
            },
			{ 
                id: 'bg_timewarp', name: '纪元跃迁·时光隧道', icon: '🌌', type: 'cosmetic_bg',
                price: 1500, era: '全纪元通用', minLevel: 1, 
                desc: '“时间并非一条直线，而是一场无尽的坠落。”\n系好安全带，时空穿梭即将开始！这是属于时空旅者的终极视界。迎面扑来的流光星轨，带你跨越远古与未来。',
                category: 'cosmetic'
            },
			{ 
                id: 'bg_hyperspeed', name: '虚空跃迁·超光速引擎', icon: '🚀', type: 'cosmetic_bg',
                price: 1500, era: '全纪元通用', minLevel: 1, 
                desc: '“当速度超越光，世界只剩下纯粹的线与终点。”\n警告：即将突破光速，请屏蔽一切干扰！体验硬核科幻电影中的同款曲率跃迁！让满屏的刺眼星轨带你撕裂空间。',
                category: 'cosmetic'
            },
            { 
                id: 'effect_name_star', name: '星光名字特效', icon: '✨', type: 'cosmetic_name',
                price: 80, era: '魏晋隋唐·融合与登科', minLevel: 0, 
                desc: '让名字带有闪烁的星光特效（有效期7天）。',
                category: 'cosmetic',
                duration: 7
            },
            // 第三类：现实兑换
            { 
                id: 'real_soda', name: '肥宅快乐水券', icon: '🥤', type: 'real', 
                price: 30, era: '远古之路', minLevel: 0, 
                desc: '兑换一瓶指定饮料。每周限购2张。',
                category: 'real', limit: 2
            },
            { 
                id: 'real_screen', name: '屏幕时间加油包', icon: '📱', type: 'real', 
                price: 350, era: '远古之路', minLevel: 0, 
                desc: '额外获得30分钟游戏/iPad时间。限周末使用。每天限定使用1张。',
                category: 'real', limit: 1
            },
            { 
                id: 'real_chore', name: '免做家务卡', icon: '🧹', type: 'real', 
                price: 300, era: '远古之路', minLevel: 0, 
                desc: '抵消一次家务劳动。',
                category: 'real', limit: 1
            },
            { 
                id: 'real_weekend', name: '周末话语权', icon: '🎡', type: 'real', 
                price: 800, era: '远古之路', minLevel: 0, 
                desc: '决定周末全家去哪里玩的最终决定权。',
                category: 'real'
            },
            // 第四类：盲盒
            {
                id: 'box_relic', name: '时空遗物盲盒', icon: '🎁', type: 'box',
                price: 50, era: '远古之路', minLevel: 0, 
                desc: '试试手气！可能开出大量经验、道具或隐藏款皮肤。',
                category: 'box'
            },
            // 第五类：策略与辅助（高阶玩家专用）
            { 
                id: 'item_freeze', name: '冰河世纪图腾', icon: '❄️', type: 'freeze', 
                price: 1000, era: '远古之路', minLevel: 3, 
                desc: '冻结卡。使用后，整个系统"冻结"一天。这一天不打卡也不会断掉"连续打卡天数"记录，也不会触发任何惩罚，但同时也无法获得收益。',
                category: 'tool'
            },
            { 
                id: 'item_alchemy', name: '炼金术士的试管', icon: '⚗️', type: 'alchemy', 
                price: 1000, era: '文明初曙', minLevel: 7, 
                desc: '资源转化。购买后，立即将1000金元宝转化为500点经验值（XP）。',
                category: 'tool'
            },
            { 
                id: 'item_lucky', name: '幸运加持符', icon: '🍀', type: 'lucky_buff', 
                price: 30, era: '魏晋隋唐·融合与登科', minLevel: 14, 
                desc: '概率提升。使用后，下一次转动"惊喜大转盘"时，屏蔽掉最低档奖励（如5元宝），提高抽中大奖的概率。',
                category: 'tool'
            },
            // 第六类：家庭互动与恶作剧
            { 
                id: 'item_message', name: '甲骨文传书', icon: '📜', type: 'message_board', 
                price: 10, era: '文明初曙', minLevel: 5, 
                desc: '留言板。购买后，可以在软件的首页最显眼处留下一句话（如"祝哥哥生日快乐"或"我是全家最棒的"），保留24小时，所有家庭成员打开都能看到。',
                category: 'tool'
            },
            { 
                id: 'item_helper', name: '神笔马良体验券', icon: '🖌️', type: 'parent_help', 
                price: 400, era: '远古之路', minLevel: 0, 
                desc: '家长代写。购买后，可以指定家长帮忙完成一项非学习类的手工任务或画报任务的"最难部分"（比如帮忙剪裁硬纸板）。',
                category: 'real'
            },
            // 第七类：现实福利升级版
            { 
                id: 'real_menu', name: '御膳房点菜旨意', icon: '🍽️', type: 'real', 
                price: 120, era: '魏晋隋唐·融合与登科', minLevel: 19, 
                desc: '菜单决定权。获得指定当天晚餐的一道主菜（如红烧肉、披萨）的权利，掌勺家长必须执行。',
                category: 'real'
            },
            { 
                id: 'real_night', name: '上元节夜游令', icon: '🌙', type: 'real', 
                price: 1500, era: '魏晋隋唐·融合与登科', minLevel: 15, 
                desc: '熬夜权。允许在周末的晚上推迟30分钟睡觉，用于看书、发呆或玩玩具（不含电子屏幕）。',
                category: 'real'
            },
            { 
                id: 'real_book', name: '书香门第购书券', icon: '📚', type: 'real', 
                price: 2000, era: '周·礼制与争鸣', minLevel: 11, 
                desc: '实物奖励。兑换一本价格在30元以内的课外书（漫画、小说、绘本不限），家长负责下单。',
                category: 'real'
            },
            // 第八类：极致奢华
            { 
                id: 'item_theme', name: '丝绸之路寻宝图', icon: '🗺️', type: 'unlock_theme', targetTheme: 'dunhuang',
                price: 1000, era: '魏晋隋唐·融合与登科', minLevel: 20, 
                desc: '解锁典藏主题【莫高流金】。大漠长风，沥粉贴金，飞天流光回荡于九层千佛楼阙之间。购买后可在“主题试衣间”自由更换。',
                category: 'cosmetic'
            },
            { 
                id: 'real_dream', name: '封狼居胥', icon: '🏆', type: 'real', 
                price: 20000, era: '远古之路', minLevel: 0, 
                desc: '愿望大奖。兑换一次长途旅行（如迪士尼、环球影城或海边度假）的一张门票资金赞助（或作为启动资金）。需集齐所有"毅力"类徽章。',
                category: 'real'
            },
            // 第九类：趣味与彩蛋
            { 
                id: 'item_monitor', name: '孔夫子的戒尺', icon: '📏', type: 'parent_monitor', 
                price: 10, era: '周·礼制与争鸣', minLevel: 10, 
                desc: '监督卡。购买后，可以将这张卡"贴"给家长。如果家长当天玩手机超过1小时，孩子可以要求家长罚款（发10元红包给孩子）。',
                category: 'tool'
            },
            // 第十类：纪元投资计划（收益翻倍卡）
            { 
                id: 'item_invest_2x', name: '丰收的石斧', icon: '🪓', type: 'invest_multiplier', 
                price: 40, era: '远古之路', minLevel: 2, 
                desc: '投资卡。生效期间（3天），所有任务打卡奖励x2。不仅能狩猎，还能挖掘更多资源。',
                category: 'tool',
                multiplier: 2,
                duration: 3
            },
            { 
                id: 'item_invest_3x', name: '青铜商贸令', icon: '🪙', type: 'invest_multiplier', 
                price: 120, era: '文明初曙', minLevel: 6, 
                desc: '投资卡。生效期间（3天），所有任务打卡奖励x3。开启部落间的贸易路线。价格较高，如果这3天有课外班太忙没法打卡，可能会亏本哦！',
                category: 'tool',
                multiplier: 3,
                duration: 3
            },
            { 
                id: 'item_invest_4x', name: '聚宝盆（九鼎之祝）', icon: '🏺', type: 'invest_multiplier', 
                price: 300, era: '周·礼制与争鸣', minLevel: 11, 
                desc: '投资卡。生效期间（3天），任务奖励x4。传说中大禹铸造的九鼎，拥有汇聚天下财富的能力。适合周末（任务多的时候）使用。',
                category: 'tool',
                multiplier: 4,
                duration: 3
            },
            { 
                id: 'item_invest_5x', name: '开元通宝铸币权', icon: '💰', type: 'invest_multiplier', 
                price: 600, era: '魏晋隋唐·融合与登科', minLevel: 18, 
                desc: '投资卡。生效期间（3天），任何打卡收入直接x5！获得朝廷特许的铸币权。高风险高回报，一次成功的投资可以买下整个商店。',
                category: 'tool',
                multiplier: 5,
                duration: 3
            },
            // 第十一类：学习辅助与特权
            { 
                id: 'item_help_card', name: '诸葛锦囊（求助卡）', icon: '📦', type: 'help_card', 
                price: 30, era: '远古之路', minLevel: 0, 
                desc: '召唤家长。当遇到一道很难的数学题或英语句子时，使用此卡，家长必须耐心讲解10分钟，且绝对不能发火，不能说"这都不会"。',
                category: 'real'
            },
            { 
                id: 'item_reduce', name: '听写豁免券（减量卡）', icon: '✂️', type: 'reduce_homework', 
                price: 8000, era: '远古之路', minLevel: 0, 
                desc: '打折。将当天的英语单词听写或语文生字默写任务量减半（例如从20个减到10个）。',
                category: 'real'
            },
            // 第十二类：视觉特效升级
            { 
                id: 'effect_confetti', name: '皇家礼炮特效', icon: '🎆', type: 'cosmetic_confetti', 
                price: 100, era: '周·礼制与争鸣', minLevel: 0, 
                desc: '永久升级。购买后，每次完成任务打卡时，屏幕上不再是普通的彩纸屑，而是喷射星星的混合特效。',
                category: 'cosmetic'
            },
            { 
                id: 'theme_cyber', name: '盛唐幻夜密匙', icon: '🌃', type: 'cosmetic_theme', targetTheme: 'theme_cyber',
                price: 500, era: '魏晋隋唐·融合与登科', minLevel: 0, 
                desc: '解锁典藏主题【盛唐幻夜】。上元长安夜色如织，全息琉璃与星际楼阙光影流转，东方浪漫主义科幻美学。购买后可在“主题试衣间”自由更换。',
                category: 'cosmetic'
            },
            { 
                id: 'item_theme_jiangshan', name: '只此青绿长卷', icon: '🏔️', type: 'cosmetic_theme', targetTheme: 'jiangshan',
                price: 600, era: '魏晋隋唐·融合与登科', minLevel: 15, 
                desc: '解锁典藏主题【只此青绿】。千里江山，层峦叠嶂，王希孟宋代石青石绿矿物重彩美学。购买后可在“主题试衣间”自由更换。',
                category: 'cosmetic'
            },
            { 
                id: 'item_theme_cosmic', name: '浑天观星仪', icon: '🔭', type: 'cosmetic_theme', targetTheme: 'cosmic',
                price: 800, era: '全纪元通用', minLevel: 10, 
                desc: '解锁典藏主题【星汉灿烂】。日月之行，若出其中；星汉灿烂，若出其里。浩瀚深空星云与星轨奇观。购买后可在“主题试衣间”自由更换。',
                category: 'cosmetic'
            },
            // 第十三类：家庭博弈与趣味
            { 
                id: 'item_challenge', name: '竞技场挑战书', icon: '⚔️', type: 'challenge', 
                price: 50, era: '远古之路', minLevel: 0, 
                desc: '对赌。发起者向另一个孩子发起挑战（例如："谁先完成今天的数学精准学"）。家长做裁判。赢家获得系统奖励的100金元宝（发起者回本并赚50），输家无惩罚（但没面子）。',
                category: 'tool'
            },
            { 
                id: 'item_silence', name: '静音卡（禁言令）', icon: '🤫', type: 'silence', 
                price: 60, era: '远古之路', minLevel: 0, 
                desc: '让对方安静。如果兄妹之间吵架，或者嫌对方太吵，可以使用此卡。家长需执行"禁言令"，要求对方安静10分钟（不能说话、不能制造噪音）。',
                category: 'tool'
            },
            { 
                id: 'item_undo', name: '反悔药水（撤销操作）', icon: '⏮️', type: 'undo', 
                price: 20, era: '文明初曙', minLevel: 0, 
                desc: '如果不小心误触了"兑换奖品"或者买错了道具，可以使用此药水撤销最近一次（5分钟内）的商店操作，全额退款。',
                category: 'tool'
            },
			{
                id: 'item_undo_advanced', name: '高级反悔药水', icon: '🍷', type: 'undo_advanced',
                price: 50, era: '文明初曙', minLevel: 0,
                desc: '后悔药升级版！使用后，会列出你背包里的所有物品，你可以指定任意一件进行退货退款（必须是有购买记录的商品）。',
                category: 'tool'
            },
            // 第十四类：星星兑换
            {
                id: 'star_pack_small', name: '星辉小袋', icon: '⭐', type: 'buy_stars',
                price: 100, era: null, minLevel: 1,
                desc: '用 100 金元宝兑换 20 颗星星。星星是宠物互动的专用货币。',
                category: 'tool', starAmount: 20
            },
            {
                id: 'star_pack_large', name: '星辉宝箱', icon: '🌟', type: 'buy_stars',
                price: 500, era: null, minLevel: 3,
                desc: '用 500 金元宝兑换 120 颗星星（额外赠送 20 颗）。',
                category: 'tool', starAmount: 120
            },
        ];

        // --- 随机事件库定义 ---

export const checkItemRestriction = (item, holidayForecast) => {
			// 1. 无限制直接开放
			if (!item.timeLimit) return { locked: false };

			const now = new Date();
			const year = now.getFullYear();
			const month = String(now.getMonth() + 1).padStart(2, '0');
			const day = String(now.getDate()).padStart(2, '0');
			const today = `${year}-${month}-${day}`;

			// --- API 智能节日判定 (支持提前2天) ---
			if (item.timeLimit.type === 'api_holiday') {
				// 检查预测数据是否存在
				if (holidayForecast && holidayForecast.length > 0) {
					// 遍历未来3天的数据，只要有一天符合条件即可解锁
					const isUpcomingHoliday = holidayForecast.some(data => {
						// 必须是真正的节假日 (type=2 或 holiday=true)，排除调休 (type=3)
						// 根据 API 文档：holiday.holiday = true 表示是节日
						if (data.holiday && data.holiday.holiday === true) {
							const name = data.holiday.name;
							const target = data.holiday.target || name; // 处理可能的目标节日字段
							
							// 检查节日名称是否在商品的允许列表中
							return item.timeLimit.holidayNames.some(allowedName => target.includes(allowedName));
						}
						return false;
					});

					if (isUpcomingHoliday) {
						return { locked: false };
					}
				}

				// 保底机制：API 挂了或未到时间，检查固定日期范围
				if (item.timeLimit.fallbackStart) {
					if (today >= item.timeLimit.fallbackStart && today <= item.timeLimit.fallbackEnd) {
						return { locked: false };
					}
				}

				return { locked: true, reason: item.timeLimit.msg || '节日临近时开启' };
			}
            // 3. (可选) 未来可扩展：比如 type: 'weekend_only' (仅周末可买)
            // if (item.timeLimit.type === 'weekend_only') {
            //     const dayOfWeek = now.getDay();
            //     if (dayOfWeek === 0 || dayOfWeek === 6) return { locked: false };
            //     return { locked: true, reason: '周末限定' };
            // }

            return { locked: false };
        };

if (typeof window !== 'undefined') {
    window.SHOP_ITEMS = SHOP_ITEMS;
    window.checkItemRestriction = checkItemRestriction;
}
