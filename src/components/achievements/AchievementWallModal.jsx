import React from 'react';
import { Trophy, XIcon, Lock } from '../icons.jsx';
import { COLOR_PALETTES } from '../../data/themes.js';
import { getTaskTotalSessions } from '../../utils/checkin.js';

// 从全局 AchievementSystem / window.AchievementSystem 获取配置
const getAchievementConfig = () => {
    if (typeof AchievementSystem !== 'undefined') return AchievementSystem;
    if (typeof window !== 'undefined' && window.AchievementSystem) return window.AchievementSystem;
    return { ACHIEVEMENT_THEMES: {}, BADGES: [], RARITY_COLORS: {}, CURRICULUM_CONFIG: {} };
};

// 成就墙弹窗组件
export const AchievementWallModal = ({ show, onClose, achievements, theme, checkins, tasks, activeChild, wheelHistory, stats, totalGold, exemptedDays, ownedPets, petData, petStats, petAdventureStats, petAdventureLog }) => {
    const { ACHIEVEMENT_THEMES = {}, BADGES = [], RARITY_COLORS = {} } = getAchievementConfig();
    const petCatalog = (typeof PET_CATALOG !== 'undefined') ? PET_CATALOG : (typeof window !== 'undefined' && window.PET_CATALOG ? window.PET_CATALOG : []);
    const ADVENTURE_REALMS = (typeof window !== 'undefined' && window.ADVENTURE_REALMS) ? window.ADVENTURE_REALMS : [];

            if (!show) return null;
            const categories = ['荣耀', '毅力', '效率', '精通', '财富', '探索', '宠物'];

            // --- 新增：进度计算逻辑 ---
            const getBadgeProgress = (badgeId) => {
                const childCheckins = checkins?.[activeChild] || {};
                const childTasks = tasks?.[activeChild] || [];
                
                // 辅助：统计总打卡数
                const totalCheckinsCount = Object.values(childCheckins).reduce((sum, taskRecord) => sum + getTaskTotalSessions(taskRecord), 0);
                
                // 辅助：统计特定学科打卡数 (正则匹配任务名)
                const getSubjectCount = (regex, excludeKeywords = []) => {
                    let count = 0;
                    Object.entries(childCheckins).forEach(([taskId, dates]) => {
                        const taskName = childTasks.find(t => t.id === taskId)?.name || '';
                        // 检查是否包含排除关键词
                        const shouldExclude = excludeKeywords.some(kw => taskName.includes(kw));
                        if (!shouldExclude && regex.test(taskName)) {
                            count += Object.keys(dates).length;
                        }
                    });
                    return count;
                };

                // 辅助：计算最大连续天数 (简化版)
                const getMaxStreak = () => {
                    const allDates = [];
                    Object.values(childCheckins).forEach(dates => allDates.push(...Object.keys(dates)));
					
					// === 把被豁免的日期也加进总池子 ===
                    if (exemptedDays && exemptedDays[activeChild]) {
                        allDates.push(...exemptedDays[activeChild]);
                    }
					
                    const uniqueDates = [...new Set(allDates)].sort();
                    if (uniqueDates.length === 0) return 0;
                    let maxStreak = 0;
                    let currentStreak = 1;
                    for (let i = 1; i < uniqueDates.length; i++) {
                        const d1 = new Date(uniqueDates[i-1]);
                        const d2 = new Date(uniqueDates[i]);
                        const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
                        if (Math.round(diff) === 1) currentStreak++;
                        else { maxStreak = Math.max(maxStreak, currentStreak); currentStreak = 1; }
                    }
                    return Math.max(maxStreak, currentStreak);
                };
				
				// 辅助：计算投资达人额外收益 (用于进度条展示)
                const getInvestmentStats = () => {
                    let extraInvestIncome = 0;
                    // 遍历当前的账单记录
                    Object.keys(wheelHistory || {}).forEach(key => {
                        if (key.startsWith(`${activeChild}-TASK-`)) {
                            const parts = key.split('-');
                            const taskId = parts[2];
                            // childTasks 在本函数作用域上文已定义
                            const task = childTasks.find(t => t.id === taskId);
                            const amount = wheelHistory[key];
                            
                            // 如果实际获得金额 > 基础奖励，说明吃到了投资卡倍率
                            if (task && amount > task.reward) {
                                extraInvestIncome += (amount - task.reward);
                            }
                        }
                    });
                    return extraInvestIncome;
                };

				// 辅助：计算消费统计数据 (用于进度条展示)
				const getSpendingStats = () => {
					let total = 0;
					let count = 0;
					let max = 0;
					Object.keys(wheelHistory || {}).forEach(key => {
						if (key.startsWith(`${activeChild}-`) && wheelHistory[key] < 0) {
							const val = Math.abs(wheelHistory[key]);
							total += val;
							count++;
							if (val > max) max = val;
						}
					});
					return { total, count, max };
				};
				const spendingStats = getSpendingStats(); // 执行计算
                // 根据 Badge ID 返回进度对象 { current, target }
                switch (badgeId) {
                    case 'perfect_10': return { current: totalCheckinsCount, target: 10 };
                    case 'steeled': return { current: totalCheckinsCount, target: 100 };
                    case 'accumulation': return { current: totalCheckinsCount, target: 300 };
                    case 'persistence': return { current: getMaxStreak(), target: 7 };
                    case 'iron_will': return { current: getMaxStreak(), target: 14 };
                    case 'marathon': return { current: getMaxStreak(), target: 25 };
                    case 'weekend_warrior': return { current: stats?.[activeChild]?.weekendStreak || 0, target: 2 };
                    case 'repair_master': return { current: stats?.[activeChild]?.repair_count || 0, target: 5 };

                    // === 修复英语匹配：增加"词"、"听力"、"口语"、"Raz"等 ===
                    case 'english_ace': return { current: getSubjectCount(/英|单词|词|译|听力|口语|raz|en|english/i), target: 20 };
                    case 'translation_master': return { current: getSubjectCount(/英|单词|词|译|听力|口语|raz|en|english/i), target: 50 };
                    case 'language_lord': return { current: getSubjectCount(/英|单词|词|译|听力|口语|raz|en|english/i), target: 100 };
                    
                    // === 修复科学匹配：增加"程"(编程)、"生"(生物)、"机器"等 ===
                    case 'science_star': return { current: getSubjectCount(/科|实验|物理|化|生|地|程|机器|百科|stem/i), target: 20 };
                    case 'future_inventor': return { current: getSubjectCount(/科|实验|物理|化|生|地|程|机器|百科|stem/i), target: 50 };
                    case 'science_titan': return { current: getSubjectCount(/科|实验|物理|化|生|地|程|机器|百科|stem/i), target: 100 };

                    // === 顺便优化语文和数学，保持一致 ===
                    // 语文正则：排除包含"英"的任务
                    case 'chinese_master': return { current: getSubjectCount(/文|读|背|写字|古诗|练字|预习|成语|拼音|写作|阅读|日记|课文|生字|朗读|语文/, ['英']), target: 20 };
                    case 'literary_giant': return { current: getSubjectCount(/文|读|背|写字|古诗|练字|预习|成语|拼音|写作|阅读|日记|课文|生字|朗读|语文/, ['英']), target: 50 };
                    case 'literary_grandmaster': return { current: getSubjectCount(/文|读|背|写字|古诗|练字|预习|成语|拼音|写作|阅读|日记|课文|生字|朗读|语文/, ['英']), target: 100 };
                    
                    case 'math_whiz': return { current: getSubjectCount(/数|算|逻辑|奥|培优|思维/), target: 20 };
                    case 'logic_master': return { current: getSubjectCount(/数|算|逻辑|奥|培优|思维/), target: 50 };
                    case 'math_god': return { current: getSubjectCount(/数|算|逻辑|奥|培优|思维/), target: 100 };
					
                    case 'artist': return { current: getSubjectCount(/琵琶|琴|画|音|棋|书|舞|美/), target: 20 };
					// 投资达人进度条配置
					case 'investment_guru': return { current: getInvestmentStats(), target: 500 };

                    case 'first_pot': return { current: totalGold, target: 100 };
                    case 'tycoon': return { current: totalGold, target: 1000 };
                    case 'wealthy': return { current: totalGold, target: 5000 };
                    case 'midas_touch': return { current: totalGold, target: 2000 };
                    case 'big_spender': return { current: spendingStats.total, target: 500 };
					case 'money_bags': return { current: spendingStats.total, target: 2000 };
					case 'whale_player': return { current: spendingStats.total, target: 5000 };
					case 'market_owner': return { current: spendingStats.total, target: 10000 };

					case 'shopaholic': return { current: spendingStats.count, target: 10 };
					case 'hand_chopper': return { current: spendingStats.count, target: 50 };
					case 'cart_clearer': return { current: spendingStats.count, target: 100 };

					case 'high_roller': return { current: spendingStats.max, target: 100 };
					case 'diamond_hands': return { current: spendingStats.max, target: 300 };
					case 'bankruptcy': return { current: spendingStats.max, target: 800 };

                    case 'early_bird': return { current: stats?.[activeChild]?.earlyBirdStreak ?? 0, target: 3 };

					case 'collector': return { 
						current: stats?.[activeChild]?.usedThemes?.length || 0, 
						target: Object.keys(COLOR_PALETTES).length 
					};

                    default: break;
                }

                // 宠物成就进度
                if (typeof PET_CATALOG !== 'undefined') {
                    const myOwned = ownedPets?.[activeChild] || [];
                    const childPetData = petData?.[activeChild] || {};
                    const petStatsData = petStats?.[activeChild] || {};
                    const getStage = (cat, count) => {
                        if (!cat?.growthStages) return { level: 1 };
                        let cur = cat.growthStages[0];
                        for (const s of cat.growthStages) { if (count >= s.threshold) cur = s; else break; }
                        return cur;
                    };
                    const maxBond = myOwned.reduce((m, id) => {
                        const p = childPetData[id]; const c = PET_CATALOG.find(x => x.id === id);
                        return p && c ? Math.max(m, getStage(c, p.interactionCount).level) : m;
                    }, 0);
                    const bond3 = myOwned.filter(id => {
                        const p = childPetData[id]; const c = PET_CATALOG.find(x => x.id === id);
                        return p && c && getStage(c, p.interactionCount).level >= 3;
                    }).length;
                    const hasLeg = myOwned.some(id => { const c = PET_CATALOG.find(x => x.id === id); return c && c.rarity === 'legendary'; });

                    switch (badgeId) {
                        case 'pet_first': return { current: myOwned.length, target: 1 };
                        case 'pet_collector_3': return { current: myOwned.length, target: 3 };
                        case 'pet_collector_all': return { current: myOwned.length, target: PET_CATALOG.length };
                        case 'pet_max_bond': return { current: maxBond >= 4 ? 1 : 0, target: 1 };
                        case 'pet_max_bond_5': return { current: maxBond >= 5 ? 1 : 0, target: 1 };
                        case 'pet_feed_100': return { current: petStatsData.feedCount || 0, target: 100 };
                        case 'pet_bath_50': return { current: petStatsData.bathCount || 0, target: 50 };
                        case 'pet_all_5': return { current: bond3, target: 5 };
                        case 'pet_legendary': return { current: hasLeg ? 1 : 0, target: 1 };
                        case 'pet_rename': return { current: 0, target: 1 };
                        default: break;
                    }
                }

                // 探险成就进度
                if (typeof ADVENTURE_REALMS !== 'undefined') {
                    const advStats = (petAdventureStats || {})[activeChild] || {};
                    const advLog = (petAdventureLog || {})[activeChild] || [];
                    const totalAdventures = advStats.totalAdventures || 0;
                    const totalGoldEarned = advStats.totalGoldEarned || 0;
                    const totalXPEarned = advStats.totalXPEarned || 0;
                    const totalStarsEarned = advStats.totalStarsEarned || 0;
                    const realmsVisited = new Set();
                    ['forest', 'creek', 'ruins', 'rift', 'cosmos'].forEach(r => {
                        if (advStats[`${r}Count`] > 0) realmsVisited.add(r);
                    });
                    advLog.forEach(entry => { if (entry.realmId) realmsVisited.add(entry.realmId); });
                    const hasGodBeast = advLog.some(e => e.event && e.event.name === '神兽降临');
                    const hasAllRealmLogs = realmsVisited.size >= 5;

                    switch (badgeId) {
                        case 'adv_first': return { current: totalAdventures, target: 1 };
                        case 'adv_10': return { current: totalAdventures, target: 10 };
                        case 'adv_50': return { current: totalAdventures, target: 50 };
                        case 'adv_100': return { current: totalAdventures, target: 100 };
                        case 'adv_all_realms': return { current: realmsVisited.size, target: 5 };
                        case 'adv_gold_1000': return { current: totalGoldEarned, target: 1000 };
                        case 'adv_xp_5000': return { current: totalXPEarned, target: 5000 };
                        case 'adv_stars_200': return { current: totalStarsEarned, target: 200 };
                        case 'adv_god_beast': return { current: hasGodBeast ? 1 : 0, target: 1 };
                        case 'adv_rainbow': return { current: hasAllRealmLogs ? 1 : 0, target: 1 };
                        default: break;
                    }
                }

                return null;
            };

            const unlockedTotal = BADGES.filter(b => achievements?.[b.id]).length;
            const totalBadges = BADGES.length;
            const unlockPercent = totalBadges > 0 ? Math.round((unlockedTotal / totalBadges) * 100) : 0;

            return (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
                    <div className="bg-white rounded-3xl w-full max-w-4xl h-[88vh] shadow-2xl flex flex-col overflow-hidden relative border-2 border-amber-400/40 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        {/* 殿堂级顶栏 */}
                        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-800 text-white flex justify-between items-center shrink-0 shadow-lg relative z-10 border-b border-amber-400/40">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30 text-3xl">
                                    🏛️
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2 drop-shadow-md tracking-wide">
                                            封神殿 · 成就勋章大典
                                        </h2>
                                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/25 text-yellow-100 font-bold border border-white/30">
                                            自律加冕
                                        </span>
                                    </div>
                                    <p className="text-amber-100 text-xs sm:text-sm mt-1 font-medium tracking-wide">
                                        见证 {activeChild} 的自律修行与旷世荣誉 · 收集徽章铸造丰碑
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* 成就收集率勋带 */}
                                <div className="hidden sm:flex flex-col items-end bg-black/25 px-4 py-2 rounded-2xl border border-white/20 backdrop-blur-xs">
                                    <div className="text-[11px] text-amber-200 font-bold">
                                        收集进度: <strong className="text-white text-sm">{unlockedTotal}</strong> / {totalBadges} 枚
                                    </div>
                                    <div className="w-28 h-2 bg-black/40 rounded-full overflow-hidden mt-1.5 border border-white/10">
                                        <div
                                            className="h-full bg-gradient-to-r from-yellow-300 to-amber-300 rounded-full transition-all duration-700"
                                            style={{ width: `${unlockPercent}%` }}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="p-2.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
                                    title="关闭"
                                >
                                    <XIcon className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* 主内容画卷 */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50 scroll-smooth space-y-6">
                            {categories.map(cat => {
                                const catTheme = ACHIEVEMENT_THEMES[cat] || ACHIEVEMENT_THEMES['毅力'];
                                const catBadges = BADGES.filter(b => b.category === cat);
                                const catUnlocked = catBadges.filter(b => achievements?.[b.id]).length;

                                return (
                                    <div key={cat} className={`rounded-3xl ${catTheme.bg} border-2 ${catTheme.border} p-5 sm:p-6 shadow-sm`}>
                                        <div className="flex items-center justify-between mb-5">
                                            <h3 className={`text-xl font-black flex items-center gap-2.5 ${catTheme.title}`}>
                                                <span className="w-2.5 h-6 rounded-full bg-current shadow-xs" />
                                                <span>{cat}系列勋章</span>
                                            </h3>
                                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/80 shadow-xs border border-black/5 text-slate-700">
                                                已解锁 {catUnlocked} / {catBadges.length}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {catBadges.map(badge => {
                                                const isUnlocked = achievements?.[badge.id];
                                                const rarity = RARITY_COLORS[badge.rarity] || { name: '普通', badge: 'bg-slate-100 text-slate-600', text: 'text-slate-600' };
                                                const isSecret = badge.category === '探索' && !isUnlocked;
                                                
                                                // 获取进度数据
                                                const progress = !isUnlocked && !isSecret ? getBadgeProgress(badge.id) : null;
                                                const percent = progress ? Math.min(100, Math.floor((progress.current / progress.target) * 100)) : 0;

                                                return (
                                                    <div
                                                        key={badge.id}
                                                        className={`group relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                                                            isUnlocked
                                                                ? 'bg-white border-amber-300/80 shadow-md hover:shadow-xl hover:-translate-y-1 ring-1 ring-amber-200/50'
                                                                : 'bg-white/70 border-slate-200/80 shadow-none opacity-85 hover:opacity-100 hover:scale-[1.02] hover:bg-white hover:shadow-md'
                                                        }`}
                                                    >
                                                        {/* 稀有度标签 */}
                                                        <div className={`absolute top-2.5 right-2.5 text-[10px] px-2.5 py-0.5 rounded-full font-black shadow-xs ${isUnlocked ? rarity.badge : 'bg-slate-200 text-slate-500'}`}>
                                                            {rarity.name}
                                                        </div>

                                                        {/* 图标徽记 */}
                                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3.5 text-4xl shadow-inner transition-transform duration-500 group-hover:rotate-12 ${
                                                            isUnlocked
                                                                ? (badge.rarity === 'legendary' ? 'badge-legendary shadow-purple-300 ring-2 ring-purple-400' : `${catTheme.iconBg} ring-2 ring-black/5`)
                                                                : 'bg-slate-200 text-slate-400'
                                                        }`}>
                                                            {isUnlocked
                                                                ? (badge.rarity === 'legendary' ? '👑' : badge.rarity === 'epic' ? '🌟' : badge.rarity === 'rare' ? '💎' : '🏅')
                                                                : (isSecret ? '❓' : <Lock className="w-7 h-7" />)}
                                                        </div>

                                                        {/* 勋章名称 */}
                                                        <h4 className={`font-black text-sm sm:text-base text-center mb-1 shrink-0 line-clamp-1 ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                                                            {badge.name}
                                                        </h4>
                                                        
                                                        {/* 介绍文字 */}
                                                        <div className={`w-full min-h-[2.2rem] max-h-16 overflow-y-auto overflow-x-hidden text-[11px] text-center leading-snug px-1 achievement-desc-scroll ${isUnlocked ? 'text-slate-600 font-medium' : 'text-slate-400 italic'}`}>
                                                            {isSecret ? '??? (神秘隐藏成就，静待机缘探索)' : badge.desc}
                                                        </div>

                                                        {/* 进度条 */}
                                                        {progress && !isUnlocked && (
                                                            <div className="w-full mt-2.5 px-1">
                                                                <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                                                                    <span>达成 {percent}%</span>
                                                                    <span>{progress.current}/{progress.target}</span>
                                                                </div>
                                                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300/40">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-500 ${catTheme.title.replace('text', 'bg')}`}
                                                                        style={{ width: `${percent}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* 解锁日期 */}
                                                        {isUnlocked && (
                                                            <div className="mt-2.5 text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80 shadow-xs">
                                                                ✦ 敕封于 {new Date(isUnlocked).getMonth()+1}月{new Date(isUnlocked).getDate()}日
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 底部按钮 */}
                        <div className="p-4 bg-white border-t border-slate-200 flex justify-center shrink-0 shadow-lg z-20">
                            <button
                                onClick={onClose}
                                className="px-12 py-3 rounded-full bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-amber-200 font-black text-base shadow-xl hover:scale-105 active:scale-95 transition-all border border-amber-500/30"
                            >
                                🏛️ 谒殿毕 · 返回主界面
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

// 成就解锁通知弹窗 - 升级为圣旨封赏仪式
export const AchievementNotification = ({ unlockQueue, onClose }) => {
    const { RARITY_COLORS = {} } = getAchievementConfig();

    if (unlockQueue.length === 0) return null;
    const badge = unlockQueue[0];
    const rarity = RARITY_COLORS[badge.rarity] || { name: '普通', badge: 'bg-slate-100 text-slate-600', text: 'text-slate-600' };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden border-2 border-amber-400/50 animate-in zoom-in-50 duration-500" onClick={e => e.stopPropagation()}>
                <div className={`absolute inset-0 opacity-20 ${badge.rarity === 'legendary' ? 'badge-legendary' : rarity.bg}`} />
                <div className="relative z-10">
                    <div className="text-xs font-black tracking-widest uppercase mb-2 text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300 w-fit mx-auto">
                        🏆 ACHIEVEMENT UNLOCKED
                    </div>
                    <div className="text-6xl mb-4 drop-shadow-xl animate-bounce">
                        {badge.rarity === 'legendary' ? '👑' : badge.rarity === 'epic' ? '🌟' : badge.rarity === 'rare' ? '💎' : '🏅'}
                    </div>
                    <h2 className={`text-2xl font-black mb-1.5 ${rarity.text === 'text-slate-600' ? 'text-slate-800' : rarity.text.replace('600', '800')}`}>
                        {badge.name}
                    </h2>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-black mb-4 shadow-sm ${rarity.badge}`}>
                        {rarity.name}勋章
                    </div>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        {badge.desc}
                    </p>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="mt-6 w-full py-3.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 rounded-2xl font-black text-base shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer relative z-50 tracking-wider"
                >
                    🎉 恭领敕赏！
                </button>
            </div>
        </div>
    );
};

export default AchievementWallModal;
