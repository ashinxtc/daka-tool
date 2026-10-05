import { SHOP_ITEMS, checkItemRestriction } from './data/shopItems';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';


import { isIOSSafari, isPWAStandalone } from './utils/platform';
import { getCheckinEntries, getCheckinMinutes, getCheckinUnits, getCheckinSessionCount, getTaskTotalMinutes, getTaskTotalSessions } from './utils/checkin';
import { getLocalDateKey, dateKeySubtractDays, dateObjToLocalKey, tsToLocalDateKey, getDatesInRange, getMonthDates } from './utils/date';
import { COLOR_PALETTES, BASE_THEME_IDS } from './data/themes';
import { WECOM_API_URL, EXCHANGE_WORKER_URL, PUSH_WORKER_URL } from './constants/api';
import { SettingsModal, LowPerfToggle } from './components/modals/SettingsModal';
import { ExchangePanel } from './components/modals/ExchangePanel';

import { StatsModal } from './components/stats/StatsModal';
import { RANDOM_EVENTS } from './data/randomEvents';
import { getLevelInfo, getNextLevelInfo, getLevelsByEra } from './utils/levels';
import { MilestonesModal, VerticalTimeline } from './components/milestones/MilestonesModal';
import { AchievementWallModal, AchievementNotification } from './components/achievements/AchievementWallModal';

import { TimeEntryModal } from './components/checkin/TimeEntryModal';
import { TaskCard } from './components/checkin/TaskCard';
import { TaskDashboardTrack } from './components/checkin/TaskDashboardTrack';
import { HomeworkExamRecordModal, GRADE_OPTIONS } from './components/homework/HomeworkExamRecordModal';
import { WheelChoiceModal, WheelModal, EvilWheelModal } from './components/wheel/WheelModal';
import { FamilyMessagePanel, ChatDrawer } from './components/chat/ChatDrawer';
import { SilenceModal } from './components/modals/SilenceModal';
import { BackupPanel } from './components/modals/BackupPanel';
import { RandomEventModal, LevelUpNotification } from './components/events/RandomEventModal';
import { WeeklyPayrollModal } from './components/modals/WeeklyPayrollModal';
import { ThemeSelectionModal } from './components/modals/ThemeSelectionModal';
import { EvolutionPathModal, GoldHistoryModal, StarHistoryModal, XPHistoryModal } from './components/history/HistoryModals';
import { showToast, dismissToast, ToastContainer } from './components/common/Toast';
import { ModalShell } from './components/common/ModalShell';
import { TabBar } from './components/common/TabBar';
import { TimeDisplay } from './components/common/TimeDisplay';
import { WeekendDashboard, WeekendSettlementModal } from './components/weekend/WeekendDashboard';
import { convertWMOToType, getWeatherInfo, WeatherEffects } from './components/weather/WeatherEffects';
import { TributeModal } from './components/modals/TributeModal';
import { CompletedWallModal } from './components/modals/CompletedWallModal';
import { TesterDashboard } from './components/tester/TesterDashboard';
import { getHolidayInfo, getHeaderTheme, isDateHolidayOrWeekend } from './utils/holidays';
import { useStickyState, markKeyVersion } from './hooks/useStickyState';
import { storage, initStorage } from './utils/storage';
import { useNightMode } from './hooks/useNightMode';
import { PerformanceContext, PerformanceProvider } from './context/PerformanceContext';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';
import { initLoadingScreen } from './utils/loadingScreen';
import { QRCodeView } from './utils/qrcode';
import confetti from 'canvas-confetti';
if (typeof window !== 'undefined' && !window.confetti) {
    window.confetti = confetti;
}
import { useState, useEffect, useMemo, useRef, useContext, createContext, useCallback, memo  } from "react";

        // --- 图标组件 ---
        import {
    IconBase, SettingsIcon, CheckCircle2, Trophy, CalendarIcon, Coins, XIcon, Clock,
    Trash2, Save, Plus, Target, Flag, Gift, Play, Puzzle, ArrowUp, Users, Upload,
    SortDesc, Locate, Medal, Lock, Palette, Skull, FileText, Beaker, TrendingUp,
    Sparkles, BookOpen, Calendar, Clipboard, ShoppingBag, Zap, MessageCircle, Shield, Key,
    RepairedFlameBadge
} from './components/icons';
import { PetModal, CardPetImage, PetImage, PET_NOTIF_CONFIG, calcAdventureHungerCost } from './components/pet/PetModal';
import { PetFloatingButton } from './components/pet/PetFloatingButton';
import { ShopModal, ShopNPC } from './components/modals/ShopModal';
import AtmosphereLayer from './components/backgrounds/AtmosphereLayer';
import { OracleMessageBoard } from './components/oracle/OracleMessageBoard';
import { OracleCarveModal } from './components/oracle/OracleCarveModal';
import { ReadingFloatingButton } from './components/reading/ReadingFloatingButton';
import { ReadingCheckinModal } from './components/reading/ReadingCheckinModal';
import { ReadingPavilionModal } from './components/reading/ReadingPavilionModal';
import { ReadingTransitionModal } from './components/reading/ReadingTransitionModal';
import { HabitFloatingButton, HabitPavilionModal, PRESET_HABITS } from './components/habits';
import { ParentGiftModal } from './components/modals/ParentGiftModal';
import { WonderShowcaseModal } from './components/wonders/WonderShowcaseModal';

        // ===== Toast 系统已迁移至 src/components/common/Toast.jsx =====

        // COLOR_PALETTES 已迁移至 src/data/themes.js

        // --- 默认配置 ---

        const DEFAULT_START_DATE = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
        const DEFAULT_END_DATE = '2099-12-31';
        // 移除预设密码

        // --- 商店商品定义 ---
        // SHOP_ITEMS 已迁移至 src/data/shopItems.js

        // RANDOM_EVENTS 已迁移至 src/data/randomEvents.js

        // --- 等级系统定义 ---
        // LEVELS、ERA_INFOS、ERA_COLORS、ERA_ORDER 由外部 levels.js 提供
        // 此处无需重新定义

        // --- 从 achievements.js 导入成就系统数据 ---
        const achSystem = (typeof window !== 'undefined' && window.AchievementSystem) ? window.AchievementSystem : ((typeof AchievementSystem !== 'undefined') ? AchievementSystem : {});
        const { ACHIEVEMENT_THEMES = {}, BADGES = [], CURRICULUM_CONFIG = {}, RARITY_COLORS = {} } = achSystem;

        // --- 从 pets.js 导入宠物系统数据 ---
        const petCatalog = (typeof window !== 'undefined' && window.PET_CATALOG) ? window.PET_CATALOG : ((typeof PET_CATALOG !== 'undefined') ? PET_CATALOG : []);
        const petActions = (typeof window !== 'undefined' && window.PET_ACTIONS) ? window.PET_ACTIONS : ((typeof PET_ACTIONS !== 'undefined') ? PET_ACTIONS : {});
        const petMoodDialogs = (typeof window !== 'undefined' && window.PET_MOOD_DIALOGS) ? window.PET_MOOD_DIALOGS : ((typeof PET_MOOD_DIALOGS !== 'undefined') ? PET_MOOD_DIALOGS : {});
        const petPersonalities = (typeof window !== 'undefined' && window.PET_PERSONALITIES) ? window.PET_PERSONALITIES : ((typeof PET_PERSONALITIES !== 'undefined') ? PET_PERSONALITIES : {});
        const petElements = (typeof window !== 'undefined' && window.PET_ELEMENTS) ? window.PET_ELEMENTS : ((typeof PET_ELEMENTS !== 'undefined') ? PET_ELEMENTS : {});
        const petStatNames = (typeof window !== 'undefined' && window.PET_STAT_NAMES) ? window.PET_STAT_NAMES : ((typeof PET_STAT_NAMES !== 'undefined') ? PET_STAT_NAMES : {});

        // --- 从 pet-adventures.js 导入探险系统数据 ---
        const adventureConfig = (typeof window !== 'undefined' && window.ADVENTURE_CONFIG) ? window.ADVENTURE_CONFIG : ((typeof ADVENTURE_CONFIG !== 'undefined') ? ADVENTURE_CONFIG : {});
        const adventureRealms = (typeof window !== 'undefined' && window.ADVENTURE_REALMS) ? window.ADVENTURE_REALMS : ((typeof ADVENTURE_REALMS !== 'undefined') ? ADVENTURE_REALMS : []);
        const adventureLootTables = (typeof window !== 'undefined' && window.ADVENTURE_LOOT_TABLES) ? window.ADVENTURE_LOOT_TABLES : ((typeof ADVENTURE_LOOT_TABLES !== 'undefined') ? ADVENTURE_LOOT_TABLES : {});
        const adventureEvents = (typeof window !== 'undefined' && window.ADVENTURE_EVENTS) ? window.ADVENTURE_EVENTS : ((typeof ADVENTURE_EVENTS !== 'undefined') ? ADVENTURE_EVENTS : {});
        const adventureRefuseDialogs = (typeof window !== 'undefined' && window.ADVENTURE_REFUSE_DIALOGS) ? window.ADVENTURE_REFUSE_DIALOGS : ((typeof ADVENTURE_REFUSE_DIALOGS !== 'undefined') ? ADVENTURE_REFUSE_DIALOGS : []);
        const adventureStories = (typeof window !== 'undefined' && window.ADVENTURE_STORIES) ? window.ADVENTURE_STORIES : ((typeof ADVENTURE_STORIES !== 'undefined') ? ADVENTURE_STORIES : {});
        const adventureHelpers = (typeof window !== 'undefined' && window.ADVENTURE_HELPERS) ? window.ADVENTURE_HELPERS : ((typeof ADVENTURE_HELPERS !== 'undefined') ? ADVENTURE_HELPERS : {});

        const DEFAULT_PROFILES = [];

        const DEFAULT_TASKS = {};

        const DEFAULT_WHEEL_CONFIG = [
            { id: 1, name: '5金元宝', value: 5, weight: 40, color: '#fb7185' },
            { id: 2, name: '10金元宝', value: 10, weight: 30, color: '#facc15' },
            { id: 3, name: '20金元宝', value: 20, weight: 15, color: '#38bdf8' },
            { id: 4, name: '50金元宝', value: 50, weight: 10, color: '#a78bfa' },
            { id: 5, name: '100金元宝', value: 100, weight: 5, color: '#f472b6' }
        ];
        
        const DEFAULT_WHEEL_SETTINGS = { deadlineHour: 18, thresholdType: 'percent', thresholdValue: 100 };

        // 默认的邪恶大转盘配置
        const DEFAULT_EVIL_WHEEL_CONFIG = [
            { id: 1, name: '扣除5元宝', value: -5, weight: 40, color: '#9CA3AF' }, // Gray
            { id: 2, name: '扣除10元宝', value: -10, weight: 30, color: '#6B7280' }, // Darker Gray
            { id: 3, name: '扣除20元宝', value: -20, weight: 15, color: '#4B5563' }, // Even Darker Gray
            { id: 4, name: '扣除50元宝', value: -50, weight: 10, color: '#7F1D1D' }, // Deep Red
            { id: 5, name: '扣除100元宝', value: -100, weight: 5, color: '#4C1D95' } // Deep Purple
        ];

		// 经验值大转盘
        const DEFAULT_XP_WHEEL_CONFIG = [
            { id: 1, name: '20 XP', value: 20, weight: 40, color: '#94a3b8' }, // 钛银灰 (低调的基础奖励)
            { id: 2, name: '50 XP', value: 50, weight: 30, color: '#60a5fa' }, // 天青蓝 (清透的进阶奖励)
            { id: 3, name: '100 XP', value: 100, weight: 15, color: '#a78bfa' }, // 幻影紫 (神秘的稀有奖励)
            { id: 4, name: '200 XP', value: 200, weight: 10, color: '#f472b6' }, // 蔷薇粉 (华丽的史诗奖励)
            { id: 5, name: '500 XP', value: 500, weight: 5, color: '#fbbf24' }  // 琥珀金 (耀眼的传说奖励)
        ];

		// --- 新增：高级皇家礼炮特效 ---
        const fireRoyalSalute = () => {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                
                // 1. 金币雨效果 (左右两侧喷射)
                confetti(Object.assign({}, defaults, { 
                    particleCount, 
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                    colors: ['#FFD700', '#FFA500', '#B8860B'], // 金色系
                    shapes: ['circle', 'square']
                }));
                confetti(Object.assign({}, defaults, { 
                    particleCount, 
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                    colors: ['#E6E6FA', '#9370DB', '#4B0082'], // 紫色系(皇室)
                    shapes: ['circle', 'square']
                }));

                // 2. 核心星星爆炸
                if (Math.random() < 0.1) {
                     confetti({
                        particleCount: 30,
                        spread: 100,
                        origin: { y: 0.6 },
                        colors: ['#FF4500', '#FFD700'],
                        shapes: ['star'],
                        scalar: 1.5 // 星星放大
                     });
                }
            }, 250);
        };

        // getDatesInRange, getMonthDates 已迁移至 src/utils/date.js

        // getLevelInfo, getNextLevelInfo, getLevelsByEra 已迁移至 src/utils/levels.js

		// --- 【新增】通用限时/节日商品判定模块 ---
        // --- 修改 checkItemRestriction 函数 (增加 holidayData 参数)(支持预测数组) ---
		// checkItemRestriction 已迁移至 src/data/shopItems.js

        // --- 子组件 ---

        // 商店模态框组件 (新增)
        // VerticalTimeline 已迁移至 src/components/milestones/MilestonesModal.jsx

        // ===== Z-index 层级规范 =====
        // z-50 : 基础模态框（设置、时间录入、大事纪、备份、完成墙）
        // z-[60]: 次级模态框（主题选择）
        // z-[70]: 数据展示模态框（进化之路、历史明细、成就墙、转盘选择、邪恶转盘）
        // z-[80]: 功能模态框（商店、作业考试、统计）
        // z-[85]: 宠物主模态框
        // z-[90]: 宠物子模态框（指南、周末结算）
        // z-[100]: 通知/交互模态框（升级、成就通知、转盘、禁言、进贡、豁免）
        // z-[110]: 随机事件、周工资
        // z-[120]: 聊天抽屉（最高层级）
        // z-[115]: Toast 通知（CSS 中定义）

        // ModalShell, TabBar 已迁移至 src/components/common/
        // HistTimelineCard, MilestonesModal 已迁移至 src/components/milestones/MilestonesModal.jsx

        // SilenceModal 已迁移至 src/components/modals/SilenceModal.jsx
        
        // BackupPanel 已迁移至 src/components/modals/BackupPanel.jsx

		// --- 背景特效组件已迁移至 src/components/backgrounds/AtmosphereLayer.jsx ---


// --- 商城与NPC组件已迁移至 src/components/modals/ShopModal.jsx ---
        // RandomEventModal, LevelUpNotification 已迁移至 src/components/events/RandomEventModal.jsx

        // WeeklyPayrollModal 已迁移至 src/components/modals/WeeklyPayrollModal.jsx

        // EvolutionPathModal, GoldHistoryModal, StarHistoryModal, XPHistoryModal 已迁移至 src/components/history/HistoryModals.jsx

        // ThemeSelectionModal 已迁移至 src/components/modals/ThemeSelectionModal.jsx

        // --- 成就墙弹窗组件 ---
        // AchievementWallModal, AchievementNotification 已迁移至 src/components/achievements/AchievementWallModal.jsx

// --- 宠物系统组件已迁移至 src/components/pet/PetModal.jsx ---
        // WheelChoiceModal, WheelModal 已迁移至 src/components/wheel/WheelModal.jsx

        // FamilyMessagePanel, ChatDrawer 已迁移至 src/components/chat/ChatDrawer.jsx

        // EvilWheelModal 已迁移至 src/components/wheel/WheelModal.jsx

        // LowPerfToggle & SettingsModal 已迁移至 src/components/modals/SettingsModal.jsx

        // TimeEntryModal, TaskCard 已迁移至 src/components/checkin/
        // GRADE_OPTIONS, HomeworkExamRecordModal 已迁移至 src/components/homework/HomeworkExamRecordModal.jsx

        // StatsModal 已迁移至 src/components/stats/StatsModal.jsx

		// date helpers 已迁移至 src/utils/date.js

		
		// getHolidayInfo, getHeaderTheme 已迁移至 src/utils/holidays.js
		// WeekendDashboard, WeekendSettlementModal 已迁移至 src/components/weekend/WeekendDashboard.jsx
		// convertWMOToType, getWeatherInfo, WeatherEffects 已迁移至 src/components/weather/WeatherEffects.jsx
		
		// useStickyState, markKeyVersion 已迁移至 src/hooks/useStickyState.js
		// TesterDashboard 已迁移至 src/components/tester/TesterDashboard.jsx
		// TributeModal 已迁移至 src/components/modals/TributeModal.jsx
		// CompletedWallModal 已迁移至 src/components/modals/CompletedWallModal.jsx
		// useNightMode 已迁移至 src/hooks/useNightMode.js
		// TimeDisplay 已迁移至 src/components/common/TimeDisplay.jsx

        const App = () => {
            // ===== 多次打卡辅助函数 (Phase 2) — var declarations for hoisting =====
            

			const [activeChild, setActiveChild] = useState(() => {
				try {
					const savedProfiles = JSON.parse(storage.getItem('app_profiles_v1'));
					return savedProfiles && savedProfiles.length > 0 ? savedProfiles[0].name : '';
				} catch {
					return '';
				}
			});
			// 延迟版 activeChild：账户切换 UI 立即响应，重量级 useMemo 在后台渐进更新
			const deferredActiveChild = React.useDeferredValue(activeChild);
			const isAccountSwitching = deferredActiveChild !== activeChild;
			// 让“切换账户”这类大渲染变成低优先级更新，避免阻塞主线程
			const [isAccountTransitionPending, startTransition] = React.useTransition();
			const isAccountSwitchingUI = isAccountSwitching || isAccountTransitionPending;
			// 方案4：延迟初始化沉浸式背景（优先保证首屏/切换动画顺滑）
			const [bgEffectsReady, setBgEffectsReady] = useState(false);
			useEffect(() => {
				let timer = null;
				let cancelled = false;
				const enable = () => {
					if (cancelled) return;
					setBgEffectsReady(true);
				};
				// 尽量等主线程空闲再启动（有则用，无则退化为延迟）
				if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
					// 给一个超时兜底，避免一直不触发
					window.requestIdleCallback(enable, { timeout: 1200 });
				} else {
					timer = setTimeout(enable, 350);
				}
				// App 首屏挂载完毕，平滑淡出 Loading 遮罩
				if (typeof window !== 'undefined' && window.dismissLoadingScreen) {
					window.dismissLoadingScreen(500);
				}
				return () => {
					cancelled = true;
					if (timer) clearTimeout(timer);
				};
			}, []);
			// 新增节假日数据状态，“预测”数据（包含未来几天）
			const [apiHolidayForecast, setApiHolidayForecast] = useState([]);
			// 新增 useEffect 并发获取今天、明天、后天的数据
			useEffect(() => {
				// 在 useEffect 内部定义函数，防止外部作用域污染
				const fetchHolidayForecast = async () => {
					try {
						console.log("开始获取节假日数据...");
						const daysToCheck = 3; // 检查范围：今天 + 未来2天
						const requests = [];
						const now = new Date();

						for (let i = 0; i < daysToCheck; i++) {
							const date = new Date(now);
							date.setDate(now.getDate() + i);
							
							const year = date.getFullYear();
							const month = String(date.getMonth() + 1).padStart(2, '0');
							const day = String(date.getDate()).padStart(2, '0');
							const dateStr = `${year}-${month}-${day}`;

							// 将 Promise 推入数组
							requests.push(
								fetch(`https://timor.tech/api/holiday/info/${dateStr}`)
									.then(res => res.json())
									.catch(err => {
										console.warn("单个日期获取失败:", dateStr, err);
										return null;
									})
							);
						}

						// 并发等待所有请求完成
						const results = await Promise.all(requests);
						
						// 过滤出获取成功的有效数据
						const validData = results.filter(data => data && data.code === 0);
						
						if (validData.length > 0) {
							console.log("节假日预测数据获取成功:", validData);
							setApiHolidayForecast(validData);
						}
					} catch (error) {
						console.error("无法获取节假日信息:", error);
					}
				};

				// 3. 立即调用上面定义的函数 (确保名字完全一致！)
				fetchHolidayForecast(); 

			}, []); // 空依赖数组，确保只在组件加载时执行一次

            // --- 2. 天气系统 (支持定位 + 自定义城市 + 自动更新) ---
            const [realWeather, setRealWeather] = useState(null);
            const [userCity, setUserCity] = useStickyState('', 'app_user_city_v1');
            const isNight = useNightMode(realWeather ? realWeather.isDay : undefined);

            useEffect(() => {
                // A. 定义获取逻辑
                const executeFetch = () => {
                    // A1. 核心获取函数
                    const fetchWeatherByCoords = async (lat, lon, cityName = '本地') => {
                        try {
                            // 添加 &timestamp=${Date.now()} 防止浏览器缓存请求
                            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto&timestamp=${Date.now()}`);
                            const data = await res.json();
                            if (data.current_weather) {
                                setRealWeather({
                                    temp: Math.round(data.current_weather.temperature),
                                    code: data.current_weather.weathercode,
                                    isDay: data.current_weather.is_day === 1,
                                    city: cityName
                                });
                            }
                        } catch (e) {
                            console.error("天气获取失败:", e);
                        }
                    };

                    // A2. 城市名反查
                    const fetchWeatherByCityName = async (city) => {
                        try {
                            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=zh&format=json`);
                            const data = await res.json();
                            if (data.results && data.results.length > 0) {
                                const { latitude, longitude, name } = data.results[0];
                                fetchWeatherByCoords(latitude, longitude, name); 
                            }
                        } catch (e) { console.error("城市查找失败:", e); }
                    };

                    // A3. 执行判断
                    if (userCity && userCity.trim() !== '') {
                        fetchWeatherByCityName(userCity);
                    } else if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                fetchWeatherByCoords(position.coords.latitude, position.coords.longitude, '本地');
                            },
                            (error) => { console.log("定位失败"); }
                        );
                    }
                };

                // B. 立即执行一次
                executeFetch();

                // C. 设置定时器：每30分钟自动更新一次 (60 * 60 * 1000 毫秒)
                const weatherTimer = setInterval(executeFetch, 30 * 60 * 1000);

                // D. 清理函数
                return () => clearInterval(weatherTimer);

            }, [userCity]); // 当城市改变时，Effect 重置，定时器也会重置并立即执行一次
			
			// 全局当天属性状态 ('workday' 为上学日/调休，'holiday' 为周末/节假日)
			const [todayType, setTodayType] = React.useState('workday');

			// 利用 API 获取当天状态的 Effect
			React.useEffect(() => {
				const fetchHolidayInfo = async () => {
					try {
						const today = getLocalDateKey(0); // 取出类似 '2026-02-25' 的字符串
						const res = await fetch(`https://timor.tech/api/holiday/info/${today}`);
						const data = await res.json();
						if (data.code === 0) {
							// type.type 返回: 0(工作日), 1(周末), 2(节日), 3(调休)
							const dayTypeNum = data.type.type;
							if (dayTypeNum === 0 || dayTypeNum === 3) {
								setTodayType('workday'); // 正常上学日与调休补班
							} else {
								setTodayType('holiday'); // 周末与法定节假日
							}
						}
					} catch (error) {
						console.error("节假日API请求失败，降级为普通周末判断", error);
						const day = new Date().getDay();
						setTodayType((day === 0 || day === 6) ? 'holiday' : 'workday');
					}
				};
				fetchHolidayInfo();
			}, []);

			// 移动端/手机模式检测：视口宽度 < 768px 或移动端 UA 且屏幕较窄
			const isMobileViewport = () => {
				if (typeof window === 'undefined') return false;
				try {
					const isNarrow = window.innerWidth < 768;
					const isMobileMedia = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
					const isMobileUA = /Android|iPhone|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
					return isNarrow || isMobileMedia || (isMobileUA && window.innerWidth < 1024);
				} catch {
					return false;
				}
			};

			const [viewMode, setViewMode] = useState(() => {
				return isMobileViewport() ? 'today' : 'calendar';
			});
			const userManuallySetViewModeRef = useRef(false);

			const handleSelectViewMode = useCallback((mode) => {
				userManuallySetViewModeRef.current = true;
				setViewMode(mode);
			}, []);

			// 响应式自适应：若用户尚未手动点击切换视图，视口在移动端/桌面端缩放变化时智能同步模式
			useEffect(() => {
				const handleResize = () => {
					if (!userManuallySetViewModeRef.current) {
						const targetMode = isMobileViewport() ? 'today' : 'calendar';
						setViewMode(prev => (prev !== targetMode ? targetMode : prev));
					}
				};
				window.addEventListener('resize', handleResize);
				return () => window.removeEventListener('resize', handleResize);
			}, []);

			const [calendarViewMonth, setCalendarViewMonth] = useState(null); // null=当月, {year, month}
            const [showSettings, setShowSettings] = useState(false);
            const [settingsInitialTab, setSettingsInitialTab] = useState('parent');
            const [editingEntry, setEditingEntry] = useState(null);
            const [exemptionModal, setExemptionModal] = useState(null); // { date, exemptionCode }
            const [exemptionInputCode, setExemptionInputCode] = useState('');
            const [sortBy, setSortBy] = useState('default'); 
			const [showWheel, setShowWheel] = useState(false);
			const [showWheelChoice, setShowWheelChoice] = useState(false);
			const [wheelType, setWheelType] = useState('gold'); // 'gold' | 'xp'
			const [isDemoWheel, setIsDemoWheel] = useState(false);
			
			const handleSelectWheel = (type) => {
				setShowWheelChoice(false);
				setWheelType(type);
				setShowWheel(true);
				setIsDemoWheel(false);
				setIsExtraReward(false); // 这是日常触发，不是额外奖励
				setWheelResult(null);
			};
			
			// --- 【新增】学业进度状态 ---
            // 结构: { ChildName: { math_olympiad: 3 } } 表示完成了第3个学期(索引2)
            const [curriculumProgress, setCurriculumProgress] = useStickyState({}, 'app_curriculum_progress_v1');
			const [xpWheelConfig, setXpWheelConfig] = useStickyState(DEFAULT_XP_WHEEL_CONFIG, 'app_xp_wheel_config');            
			const [isExtraReward, setIsExtraReward] = useState(false); // 用于标记是否为额外奖励
            const [wheelSpinning, setWheelSpinning] = useState(false);
            const [wheelResult, setWheelResult] = useState(null);
            const [pointerRotation, setPointerRotation] = useState(0); 
            const [showAchievements, setShowAchievements] = useState(false);
			const [showCompletedWall, setShowCompletedWall] = useState(false); // 新增：目标达成墙弹窗状态
            const [unlockQueue, setUnlockQueue] = useState([]);
            // 用 Ref 保存 checkAchievements 最新引用，防止 setTimeout 里读到陈旧闭包
            const checkAchievementsRef = React.useRef(null);
            const callDeepSeekAPIRef = React.useRef(null);
            const handleLaunchEvilWheelRef = React.useRef(null);
            const [showThemeModal, setShowThemeModal] = useState(false);
            const [showWonderShowcase, setShowWonderShowcase] = useState(false);

            const [showEvilWheel, setShowEvilWheel] = useState(false);
            const [evilWheelSpinning, setEvilWheelSpinning] = useState(false);
            const [evilWheelResult, setEvilWheelResult] = useState(null);
            const [evilPointerRotation, setEvilPointerRotation] = useState(0);
            const [showGoldHistory, setShowGoldHistory] = useState(false);
            const [showXPHistory, setShowXPHistory] = useState(false);
            const [showStarHistory, setShowStarHistory] = useState(false);
            const [isEvilDemo, setIsEvilDemo] = useState(false);
            
            const [showEvolutionPath, setShowEvolutionPath] = useState(false);
            const [levelUpQueue, setLevelUpQueue] = useState([]);
			// 控制统计弹窗的显示/隐藏；statsOpenMode='monthly' 时从月度总结入口进入并预选上月
            const [showStats, setShowStats] = useState(false);
            const [showHomeworkExamModal, setShowHomeworkExamModal] = useState(false);
            const [statsOpenMode, setStatsOpenMode] = useState(null); // null | 'monthly'
            
            const [notifiedLevels, setNotifiedLevels] = useState(() => {
                try { return JSON.parse(storage.getItem('app_notified_levels')) || {}; } catch { return {}; }
            });
            useEffect(() => { if (!window._syncReloading) storage.setItem('app_notified_levels', JSON.stringify(notifiedLevels)); }, [notifiedLevels]);

            const [showRandomEvent, setShowRandomEvent] = useState(false);
            const [currentRandomEvent, setCurrentRandomEvent] = useState(null);

            // --- 商店相关状态 ---
            const [showShop, setShowShop] = useState(false);
			const [shopInitialTab, setShopInitialTab] = useState('buy');

            // --- 天工书阁与阅读伴读任务状态 ---
            const [readingHistory, setReadingHistory] = useStickyState({}, 'app_reading_history_v1');
            const [shelvedBooks, setShelvedBooks] = useStickyState({}, 'app_reading_shelved_v1');
            const [readingTransitionModal, setReadingTransitionModal] = useState({ show: false, data: null });
            const [showReadingPavilion, setShowReadingPavilion] = useState(false);
            const [showReadingQuickCheckin, setShowReadingQuickCheckin] = useState(false);
            const [readingTaskForCheckin, setReadingTaskForCheckin] = useState(null);

            const scrollContainerRef = useRef(null);
            const todayRef = useRef(null);
            
            const prevLevelRef = useRef(1);

            const [tasks, setTasks] = useStickyState(DEFAULT_TASKS, 'app_tasks_v2');
            const [checkins, setCheckins] = useStickyState({}, 'app_checkins_v2');
            // 数据迁移：为已存在的任务补充多次打卡相关字段 (Phase 11)
            const migrationDoneRef = React.useRef(false);
            React.useEffect(() => {
                if (migrationDoneRef.current) return;
                migrationDoneRef.current = true;
                let needsUpdate = false;
                const updated = {};
                Object.entries(tasks).forEach(([child, taskList]) => {
                    if (!Array.isArray(taskList)) return;
                    const defaults = { multiCheckin: false, multiUnitLabel: '', bonusThreshold: 0, bonusThresholdType: 'count', bonusType: 'wheel', bonusMultiplier: 2 };
                    const newList = taskList.map(t => {
                        const missing = {};
                        Object.entries(defaults).forEach(([k, v]) => { if (t[k] === undefined) { missing[k] = v; needsUpdate = true; } });
                        return Object.keys(missing).length > 0 ? { ...t, ...missing } : t;
                    });
                    updated[child] = newList;
                });
                if (needsUpdate) setTasks(prev => ({ ...prev, ...updated }));
            }, []);
			// === 新增记录家长豁免的日期 ===
			const [exemptedDays, setExemptedDays] = useStickyState({}, 'app_exempted_days_v1');
			// --- 【新增】核心逻辑：动态计算进行中和已达成的任务 ---
			// 每日必做/每周选做不按目标次数判定完结，始终归为进行中，由周结算发放奖励
			const { ongoingTasks, completedTasks } = useMemo(() => {
				const all = tasks[deferredActiveChild] || [];
				const ongoing = [];
				const completed = [];
				all.forEach(task => {
					const freq = task.frequencyType || 'count';
					const isReading = !!task.readingConfig?.isReading || freq === 'reading';
					if (freq === 'daily_must' || freq === 'weekly_optional' || isReading) {
						if (task.earlyCompleted) { completed.push(task); } else { ongoing.push(task); }
						return;
					}
					const count = (task.multiCheckin && freq === "daily_must")
						? getTaskTotalSessions(checkins[deferredActiveChild]?.[task.id] || {})
						: Object.keys(checkins[deferredActiveChild]?.[task.id] || {}).length;
					if (count >= (task.targetCount || 0)) {
						completed.push(task);
					} else {
						ongoing.push(task);
					}
				});
				return { ongoingTasks: ongoing, completedTasks: completed };
			}, [tasks, deferredActiveChild, checkins]);

            // 伴读书阁：筛选当前孩子的在读任务
            const activeReadingTasks = useMemo(() => {
                const childTasks = tasks[deferredActiveChild] || [];
                return childTasks.filter(t => (t.readingConfig?.isReading || t.frequencyType === 'reading') && !t.earlyCompleted);
            }, [tasks, deferredActiveChild]);

            // 元气生活坊：筛选当前孩子的生活习惯规范任务
            const activeHabitTasks = useMemo(() => {
                const childTasks = tasks[deferredActiveChild] || [];
                return childTasks.filter(t => (t.frequencyType === 'habit' || !!t.isHabit || !!t.habitConfig?.isHabit) && !t.earlyCompleted);
            }, [tasks, deferredActiveChild]);

            const [showHabitPavilion, setShowHabitPavilion] = useState(false);
            const [wheelConfig, setWheelConfig] = useStickyState(DEFAULT_WHEEL_CONFIG, 'app_wheel_config');
            const [wheelSettings, setWheelSettings] = useStickyState(DEFAULT_WHEEL_SETTINGS, 'app_wheel_settings');
            const [wheelHistory, setWheelHistory] = useStickyState({}, 'app_wheel_history');
            const [xpHistory, setXpHistory] = useStickyState({}, 'app_xp_history');
            const [globalDates, setGlobalDates] = useStickyState({ start: DEFAULT_START_DATE, end: DEFAULT_END_DATE }, 'app_global_dates');
            const [profiles, setProfiles] = useStickyState(DEFAULT_PROFILES, 'app_profiles_v1');
            const [achievements, setAchievements] = useStickyState({}, 'app_achievements_v1');
            const [stats, setStats] = useStickyState({}, 'app_stats_v1');

			
			
			// 【新增】控制进贡弹窗显示隐藏的状态
			const [showTributeModal, setShowTributeModal] = React.useState(false);

			// 【新增】监听切换账户时是否有待接收的进贡
			React.useEffect(() => {
				const currentStats = stats[activeChild] || {};
				const pendingTributes = currentStats.pendingTributes || [];

				if (pendingTributes.length > 0) {
					let totalAmount = 0;
					let fromUsers = new Set();
					pendingTributes.forEach(t => {
						totalAmount += t.amount;
						fromUsers.add(t.from);
					});

					// 1. 弹出收到进贡的通知
					showToast('success', `收到来自 ${Array.from(fromUsers).join(' 和 ')} 的进贡！共计 ${totalAmount} 财富！`, {duration: 4000});

					// 2. 将金额加到当前账号
					const fromNames = Array.from(fromUsers).join('和');
					const historyKey = `${activeChild}-TRIBUTE_IN-${fromNames}-${Date.now()}`;
					setWheelHistory(prev => ({
						...prev,
						[historyKey]: totalAmount
					}));

					// 3. 清空待接收队列
					setStats(prev => ({
						...prev,
						[activeChild]: {
							...prev[activeChild],
							pendingTributes: [] 
						}
					}));

					// 撒花特效
					if (window.confetti) window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
				}
			}, [activeChild, stats]); // 依赖项包含 activeChild，切换账户就会触发



            // --- 经验值计算与升级逻辑 ---
            const currentXP = useMemo(() => {
                const child = deferredActiveChild;
                let xp = 0;
                
                // 1. 打卡经验: 10 XP/次
                const childCheckins = checkins[child] || {};
                const totalCheckinsCount = Object.values(childCheckins).reduce((sum, taskRecord) => sum + getTaskTotalSessions(taskRecord), 0);
                xp += totalCheckinsCount * 10;
                
                // 2. 财富经验: 1 XP/1 金元宝 (净收入，不扣除消费)
                let earnedGold = 0;
                const childTasks = tasks[child] || [];
                childTasks.forEach(task => {
                    const record = childCheckins[task.id] || {};
                    const count = Object.keys(record).length;
                    earnedGold += count * task.reward;
                    const freq = task.frequencyType || 'count';
                    if (freq === 'count' && count >= (task.targetCount || 0)) earnedGold += (task.completedReward || 0);
                });
                Object.keys(wheelHistory).forEach(key => {
                    // 排除邪恶转盘和商店消费，只计算正向收益转化为经验
                    if (key.startsWith(`${child}-`) && !key.includes('EVIL') && !key.includes('SHOP') && (wheelHistory[key] > 0)) { 
                        earnedGold += wheelHistory[key];
                    }
                });
                xp += earnedGold; // 1 Gold = 1 XP
                
                // 3. 成就经验
                const childAch = achievements[child] || {};
                Object.keys(childAch).forEach(achId => {
                    const badge = BADGES.find(b => b.id === achId);
                    if (badge) {
                        if (badge.rarity === 'common') xp += 50;
                        else if (badge.rarity === 'rare') xp += 200;
                        else if (badge.rarity === 'epic') xp += 800;
                        else if (badge.rarity === 'legendary') xp += 3000;
                    }
                });

                // 4. 纯经验类奇遇 (新)
                Object.keys(xpHistory).forEach(key => {
                    if (key.startsWith(`${child}-`)) {
                        xp += xpHistory[key];
                    }
                });

                return xp;
            }, [checkins, tasks, wheelHistory, achievements, deferredActiveChild, xpHistory]);


            const [evilWheelConfig, setEvilWheelConfig] = useStickyState(DEFAULT_EVIL_WHEEL_CONFIG, 'app_evil_wheel_config');
            const [evilAutoTrigger, setEvilAutoTrigger] = useStickyState(false, 'app_evil_auto_trigger');
            const [evilPenaltyLog, setEvilPenaltyLog] = useStickyState({}, 'app_evil_penalty_log_v1');
            const [pendingEvilPenalty, setPendingEvilPenalty] = useStickyState(false, 'app_pending_evil_penalty_v1');

            // --- AI 相关状态 ---
            const [aiEnabled, setAiEnabled] = useStickyState(false, 'app_ai_enabled');
            const [deepseekApiKey, setDeepseekApiKey] = useStickyState('', 'app_deepseek_api_key');
            const [aiPetEnabled, setAiPetEnabled] = useStickyState(true, 'app_ai_pet_enabled');
            const [aiChatEnabled, setAiChatEnabled] = useStickyState(true, 'app_ai_chat_enabled');
            const [aiDailyLimit, setAiDailyLimit] = useStickyState(50, 'app_ai_daily_limit');
            const [aiDailyUsage, setAiDailyUsage] = useStickyState({ date: '', count: 0 }, 'app_ai_daily_usage');
            const [aiChatHistory, setAiChatHistory] = useStickyState({}, 'app_ai_chat_history');
            const [showChatDrawer, setShowChatDrawer] = React.useState(false);
            const [aiReminderLog, setAiReminderLog] = useStickyState({}, 'app_ai_reminder_log_v1');
            const [aiBubbleMessage, setAiBubbleMessage] = React.useState('');
            const [aiBubbleVisible, setAiBubbleVisible] = React.useState(false);
            const [aiBubbleChild, setAiBubbleChild] = React.useState('');

            // --- 云同步状态 ---
            const SYNC_URL = 'https://sync.daka-tool.top';
            const [syncCode, setSyncCode] = useStickyState('', 'app_sync_code');
            const [syncLastTime, setSyncLastTime] = useStickyState(null, 'app_sync_last_time');
            const [syncStatus, setSyncStatus] = React.useState(''); // '' | 'syncing' | 'success' | 'error'
            const syncDebounceRef = React.useRef(null);
            const syncDownloadingRef = React.useRef(false);

            // --- 企业微信亲子互动状态 ---
            const [wecomEnabled, setWecomEnabled] = useStickyState(false, 'app_wecom_enabled');
            const [wecomWebhookKey, setWecomWebhookKey] = useStickyState('', 'app_wecom_webhook_key');
            const [wecomCorpId, setWecomCorpId] = useStickyState('', 'app_wecom_corp_id');
            const [wecomAgentId, setWecomAgentId] = useStickyState('', 'app_wecom_agent_id');
            const [wecomCallbackToken, setWecomCallbackToken] = useStickyState('', 'app_wecom_callback_token');
            const [wecomCallbackAesKey, setWecomCallbackAesKey] = useStickyState('', 'app_wecom_callback_aes_key');
            const [wecomTestStatus, setWecomTestStatus] = React.useState('');
            const [familyMessages, setFamilyMessages] = React.useState([]);
            const [showFamilyPanel, setShowFamilyPanel] = React.useState(false);
            const [showExchange, setShowExchange] = React.useState(false);
            const [familyAiReply, setFamilyAiReply] = React.useState('');
            const [familyAiLoading, setFamilyAiLoading] = React.useState(false);
            const [wecomPushLog, setWecomPushLog] = useStickyState({}, 'app_wecom_push_log');

            // 家长消息轮询
            React.useEffect(() => {
                if (!wecomEnabled || !syncCode) return;
                const fetchMessages = async () => {
                    try {
                        const resp = await fetch(`${WECOM_API_URL}/api/family/messages?code=${encodeURIComponent(syncCode)}`);
                        if (resp.ok) {
                            const data = await resp.json();
                            setFamilyMessages(data.messages || []);
                        }
                    } catch (e) { /* 静默失败 */ }
                };
                fetchMessages();
                const interval = setInterval(fetchMessages, 60000);
                return () => clearInterval(interval);
            }, [wecomEnabled, syncCode]);

            // 清理过期的推送日志（保留最近 7 天）
            React.useEffect(() => {
                const cutoff = getLocalDateKey(-7);
                const cleaned = {};
                Object.entries(wecomPushLog).forEach(([k, v]) => {
                    const match = k.match(/_(\d{4}-\d{2}-\d{2})$/);
                    if (!match || match[1] >= cutoff) cleaned[k] = v;
                });
                if (Object.keys(cleaned).length !== Object.keys(wecomPushLog).length) {
                    setWecomPushLog(cleaned);
                }
            }, []);

            // 发送家长消息回复
            const sendFamilyReply = async (content) => {
                if (!syncCode || !content) return;
                try {
                    await fetch(`${WECOM_API_URL}/api/family/messages`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ syncCode, content, childName: activeChild })
                    });
                    setFamilyMessages(prev => [...prev, { id: 'local_' + Date.now(), from: activeChild, content, type: 'text', timestamp: Date.now(), direction: 'child_to_parent', read: true }]);
                } catch (e) { console.warn('回复失败:', e); }
            };

            // 打开家长消息面板时，为最新未读消息生成 AI 鼓励
            React.useEffect(() => {
                if (!showFamilyPanel || !aiEnabled || !deepseekApiKey) return;
                const unread = familyMessages.filter(m => !m.read && m.direction === 'parent_to_child');
                if (unread.length === 0) return;
                const latest = unread[unread.length - 1];
                setFamilyAiLoading(true);
                const prompt = buildAssistantSystemPrompt(activeChild)
                    + `\n\n家长"${latest.from || '家长'}"给孩子发来消息：「${latest.content}」`
                    + `\n请根据这个消息给孩子一个温暖的回应和鼓励（80字以内）。`;
                callDeepSeekAPI(prompt, '回应家长的消息', []).then(reply => {
                    if (reply) {
                        setFamilyAiReply(reply.replace(/^[""「]|[""」]$/g, '').slice(0, 120));
                    }
                    setFamilyAiLoading(false);
                });
            }, [showFamilyPanel, familyMessages]);

            const [randomEventHistory, setRandomEventHistory] = useStickyState({}, 'app_random_event_history');
            const [dailyRandomCounts, setDailyRandomCounts] = useStickyState({}, 'app_daily_random_counts');
            // 历史事件进度：记录每个孩子已触发的历史事件 id 列表（按顺序推进，不重复）
            const [historicalEventProgress, setHistoricalEventProgress] = useStickyState({}, 'app_historical_event_progress_v1');
            // 每日分类事件计数：{ 'childName-date': { hist: 0, uniq: 0, rep: 0 } }
            const [dailyEventTypeCounts, setDailyEventTypeCounts] = useStickyState({}, 'app_daily_event_type_counts_v1');

            const [inventory, setInventory] = useStickyState({}, 'app_inventory_v1');
            const [activeBuffs, setActiveBuffs] = useStickyState({}, 'app_active_buffs_v1');
            const [redeemedCoupons, setRedeemedCoupons] = useStickyState({}, 'app_coupons_v1');

            // --- 星星货币系统 ---
            const [starHistory, setStarHistory] = useStickyState({}, 'app_star_history_v1');

            // --- 宠物系统状态 ---
            const [petData, setPetData] = useStickyState({}, 'app_pet_data_v1');
            const [ownedPets, setOwnedPets] = useStickyState({}, 'app_owned_pets_v1');
            const [activePet, setActivePet] = useStickyState({}, 'app_active_pet_v1');
            const [petCooldowns, setPetCooldowns] = useStickyState({}, 'app_pet_cooldowns_v1');
            const [petStats, setPetStats] = useStickyState({}, 'app_pet_stats_v1');
            const [petMusicOn, setPetMusicOn] = useStickyState(true, 'app_pet_music_v1');
            const [showPet, setShowPet] = useState(false);
            const [petInitialTab, setPetInitialTab] = useState('home');
            const [petSkillCooldowns, setPetSkillCooldowns] = useStickyState({}, 'app_pet_skill_cd_v1');
            const [petBuffs, setPetBuffs] = useStickyState({}, 'app_pet_buffs_v1');

            // --- 探险系统状态 ---
            const [petAdventures, setPetAdventures] = useStickyState({}, 'app_pet_adventures_v1');
            const [petAdventureLog, setPetAdventureLog] = useStickyState({}, 'app_pet_adventure_log_v1');
            const [petAdventureStats, setPetAdventureStats] = useStickyState({}, 'app_pet_adventure_stats_v1');
            const [petSlots, setPetSlots] = useStickyState({}, 'app_pet_slots_v1');

            // 旧格式迁移与历史数据自愈：单探险对象 → 数组格式，同时自愈清理超期已完成的探险卡片
            useEffect(() => {
                let needsMigration = false;
                const migrated = {};
                const now = Date.now();
                let knownLogIds = new Set();
                try {
                    const rawLog = storage.getItem('app_pet_adventure_log_v1');
                    if (rawLog) {
                        const parsed = JSON.parse(rawLog);
                        Object.values(parsed).forEach(list => {
                            if (Array.isArray(list)) {
                                list.forEach(item => {
                                    if (item && item.id) knownLogIds.add(String(item.id));
                                    if (item && item.startTime) knownLogIds.add(`${item.petId}_${item.realmId}_${item.startTime}`);
                                });
                            }
                        });
                    }
                } catch (e) {}

                Object.entries(petAdventures || {}).forEach(([child, val]) => {
                    if (val && !Array.isArray(val) && val.realmId) {
                        needsMigration = true;
                        migrated[child] = [{ ...val, id: val.id || ('adv_' + (val.startTime || Date.now())) }];
                    } else if (Array.isArray(val)) {
                        let arrChanged = false;
                        const cleaned = val.map(a => {
                            if (a && a.status === 'completed') {
                                const endTime = a.result?.endTime || a.expectedEndTime || a.startTime || 0;
                                const isLogged = (a.result?.id && knownLogIds.has(String(a.result.id))) ||
                                                 (a.startTime && knownLogIds.has(`${a.petId}_${a.realmId}_${a.startTime}`));
                                if ((endTime && (now - endTime > 2 * 3600000)) || isLogged) {
                                    arrChanged = true;
                                    return { ...a, status: 'claimed', claimedAt: a.claimedAt || now };
                                }
                            }
                            return a;
                        });
                        if (arrChanged) {
                            needsMigration = true;
                            migrated[child] = cleaned;
                        }
                    }
                });
                if (needsMigration) {
                    setPetAdventures(prev => ({ ...prev, ...migrated }));
                    if (typeof window !== 'undefined' && typeof window.triggerSyncUpload === 'function') {
                        window.triggerSyncUpload();
                    }
                }
            }, []);

            // --- 宠物提醒通知状态 ---
            const [petNotif, setPetNotif] = useStickyState({}, 'app_pet_notif_v1');
            const [petNotifVisible, setPetNotifVisible] = useState(false);
            const petNotifTimerRef = useRef(null);

            // 当前孩子的通知
            const currentPetNotif = petNotif?.[activeChild] || null;

            // 红点逻辑：通知存在 + 未解决 + 已过 10 分钟
            const petNotifDot = useMemo(() => {
                const n = petNotif?.[activeChild];
                if (!n || n.resolved) return false;
                return Date.now() - n.ts > 10 * 60 * 1000;
            }, [petNotif, activeChild]);

            // 重新显示气泡并重置计时
            const showPetNotifBubble = useCallback(() => {
                const n = petNotif?.[activeChild];
                if (!n || n.resolved) return;
                setPetNotifVisible(true);
                if (petNotifTimerRef.current) clearTimeout(petNotifTimerRef.current);
                petNotifTimerRef.current = setTimeout(() => setPetNotifVisible(false), 10 * 60 * 1000);
            }, [petNotif, activeChild]);

            const handleOpenPet = useCallback((tab = 'home') => {
                setPetInitialTab(tab);
                setShowPet(true);
                if (petNotifDot) showPetNotifBubble();
            }, [petNotifDot, showPetNotifBubble]);

            // --- 新增：密码与测试模式状态 ---
            const [settingsPassword, setSettingsPassword] = useStickyState('', 'app_settings_password');
            const [isTestMode, setIsTestMode] = useStickyState(false, 'app_test_mode');

            // --- 家长手机看板与多端绑定授权状态 ---
            const [authorizedParents, setAuthorizedParents] = useStickyState({ pairToken: '', devices: [] }, 'app_authorized_parents_v1');
            const [parentActions, setParentActions] = useStickyState([], 'app_parent_actions_v1');

            // 自动确保生成家庭专属配对密钥
            React.useEffect(() => {
                if (!authorizedParents || !authorizedParents.pairToken) {
                    const token = 'token_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
                    setAuthorizedParents(prev => ({
                        pairToken: token,
                        devices: (prev && Array.isArray(prev.devices)) ? prev.devices : []
                    }));
                }
            }, [authorizedParents]);
            
            // --- 新增：装备状态 ---
            const [equippedGear, setEquippedGear] = useStickyState({}, 'app_equipped_gear_v1');
            
			// 【新增】周末系统配置
            const [weekendSettings, setWeekendSettings] = useStickyState({
                enabled: true,       // 是否启用周末冲刺模式
                coreThreshold: 80,   // 核心任务达标百分比
                dailyThreshold: 50,  // 日常任务达标百分比
                guardianPassCount: 0, // 监护人豁免卡数量
                perfectReward: 100,  // 完美周末奖励（金元宝）
                passReward: 60,      // 达标周末奖励（金元宝）
                lastSettledWeekend: {} // { [childName]: weekendKey } 已结算的周末，避免重复弹窗
            }, 'app_weekend_settings');

            // 当前周末唯一键（以该周周日日期表示）
            const getCurrentWeekendKey = () => {
                const d = new Date();
                const day = d.getDay();
                const sundayOffset = day === 0 ? 0 : 7 - day;
                const sunday = new Date(d);
                sunday.setDate(d.getDate() + sundayOffset);
                const y = sunday.getFullYear(), m = String(sunday.getMonth() + 1).padStart(2, '0'), dd = String(sunday.getDate()).padStart(2, '0');
                return `${y}-${m}-${dd}`;
            };

            // 【新增】结算弹窗队列 (用于次日结算)
            const [settlementState, setSettlementState] = useState(null);
            const weekendAutoShownRef = React.useRef(null); // 本周末是否已自动弹过结算（避免重复）

            // 【新增】每周学习工资结算记录与待领取状态
            const [weeklyPayroll, setWeeklyPayroll] = useStickyState({}, 'app_weekly_payroll_v1');
            const [weeklyPayrollToClaim, setWeeklyPayrollToClaim] = useState(null);
            const [showWeeklyPayrollModal, setShowWeeklyPayrollModal] = useState(false);
			
            // --- 新增：大事纪系统 ---
            const [milestones, setMilestones] = useStickyState([], 'app_milestones_v1');
            const [lastBackupDate, setLastBackupDate] = useStickyState(null, 'app_last_backup_date');
            const [showMilestones, setShowMilestones] = useState(false);
            const [showBackupPanel, setShowBackupPanel] = useState(false);

            // --- 使用数据每日回传（可选，数据仍以本地为主）---
            const [reportConfig, setReportConfig] = useStickyState(
                { enabled: false, formspreeUrl: '' },
                'app_report_config_v1'
            );
            const reportSentRef = React.useRef(false);
            
            // --- 新增：全局留言板 ---
            const [globalMessages, setGlobalMessages] = useStickyState([], 'app_global_messages_v2');
            const [showOracleCarveModal, setShowOracleCarveModal] = useState(false);

            // --- 静音卡（禁言令）：多用户 + 时长选择 ---
            const [activeSilenceMutes, setActiveSilenceMutes] = useStickyState({}, 'app_silence_mutes_v1');
            const [showSilenceModal, setShowSilenceModal] = useState(false);

            // --- 作业与考试成绩记录 ---
            const DEFAULT_HOMEWORK_EXAM_CONFIG = {
                homeworkGradingMode: 'score',
                homeworkSubjects: [{ id: 'hw_sub_ch', name: '语文' }, { id: 'hw_sub_math', name: '数学' }, { id: 'hw_sub_en', name: '英语' }],
                homeworkItems: { hw_sub_ch: [{ id: 'hw_ch_1', name: '日常作业' }], hw_sub_math: [{ id: 'hw_math_1', name: '日常作业' }], hw_sub_en: [{ id: 'hw_en_1', name: '日常作业' }] },
                homeworkRewards: [{ subjectId: 'hw_sub_ch', homeworkId: 'hw_ch_1', type: 'score', minScore: 90, gold: 5 }, { subjectId: 'hw_sub_ch', homeworkId: 'hw_ch_1', type: 'score', minScore: 85, gold: 3 }, { subjectId: 'hw_sub_math', homeworkId: 'hw_math_1', type: 'score', minScore: 90, gold: 5 }],
                examTypes: [{ id: 'exam_unit', name: '单元测验' }, { id: 'exam_mid', name: '期中考试' }, { id: 'exam_final', name: '期末考试' }],
                examRewards: [{ type: 'score', minScore: 95, gold: 15 }, { type: 'score', minScore: 90, gold: 10 }, { type: 'score', minScore: 85, gold: 5 }]
            };
            const [homeworkExamConfig, setHomeworkExamConfig] = useStickyState(DEFAULT_HOMEWORK_EXAM_CONFIG, 'app_homework_exam_config_v1');
            const [homeworkRecords, setHomeworkRecords] = useStickyState({}, 'app_homework_records_v1');
            const [examRecords, setExamRecords] = useStickyState({}, 'app_exam_records_v1');
            const [repairedCheckins, setRepairedCheckins] = useStickyState({}, 'app_repaired_checkins_v1');
            const [silenceNow, setSilenceNow] = useState(() => Date.now());

            useEffect(() => {
                const t = setInterval(() => {
                    const now = Date.now();
                    setSilenceNow(now);
                    setActiveSilenceMutes(prev => {
                        if (!prev || Object.keys(prev).length === 0) return prev; // 无数据时跳过
                        const next = {};
                        let changed = false;
                        Object.entries(prev).forEach(([name, end]) => {
                            if (end > now) { next[name] = end; } else { changed = true; }
                        });
                        // 只在有条目过期时才 setState，避免每秒无意义重渲染
                        return changed ? (Object.keys(next).length ? next : {}) : prev;
                    });
                }, 2000); // 2 秒间隔：精度足够，减少一半重渲染
                return () => clearInterval(t);
            }, []);

            // --- Effect: 每日首次使用时静默回传使用数据（仅当启用且已配置 Formspree 地址时）---
            useEffect(() => {
                if (!reportConfig.enabled || !(reportConfig.formspreeUrl || '').trim()) return;
                const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
                const lastSent = storage.getItem('app_last_report_date');
                if (lastSent === today || reportSentRef.current) return;
                let deviceId = storage.getItem('app_device_id');
                if (!deviceId) {
                    deviceId = 'd' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
                    storage.setItem('app_device_id', deviceId);
                }
                const profilesList = (profiles || []).map(p => {
                    const name = p.name;
                    const byTask = checkins[name] || {};
                    let totalCheckins = 0;
                    let lastActiveDate = null;
                    let totalMinutes = 0;
                    Object.entries(byTask).forEach(([taskId, byDate]) => {
                        Object.entries(byDate).forEach(([dateKey, val]) => {
                            totalCheckins++;
                            if (!lastActiveDate || dateKey > lastActiveDate) lastActiveDate = dateKey;
                            const mins = typeof val === 'number' ? val : (val === '免' ? 0 : parseInt(String(val), 10) || 0);
                            totalMinutes += mins;
                        });
                    });
                    const levelInfo = (() => {
                        let xp = 0;
                        const childCheckins = checkins[name] || {};
                        xp += Object.values(childCheckins).reduce((sum, taskRecord) => sum + getTaskTotalSessions(taskRecord), 0) * 10;
                        const childTasks = tasks[name] || [];
                        let earnedGold = 0;
                        childTasks.forEach(task => {
                            const record = childCheckins[task.id] || {};
                            const count = Object.keys(record).length;
                            earnedGold += count * task.reward;
                            const freq = task.frequencyType || 'count';
                            if (freq === 'count' && count >= (task.targetCount || 0)) earnedGold += (task.completedReward || 0);
                        });
                        Object.keys(wheelHistory).forEach(key => {
                            if (key.startsWith(name + '-') && !key.includes('EVIL') && !key.includes('SHOP') && (wheelHistory[key] > 0)) earnedGold += wheelHistory[key];
                        });
                        xp += earnedGold;
                        const childAch = achievements[name] || {};
                        Object.keys(childAch).forEach(achId => {
                            const badge = BADGES.find(b => b.id === achId);
                            if (badge) {
                                if (badge.rarity === 'common') xp += 50;
                                else if (badge.rarity === 'rare') xp += 200;
                                else if (badge.rarity === 'epic') xp += 800;
                                else if (badge.rarity === 'legendary') xp += 3000;
                            }
                        });
                        Object.keys(xpHistory).forEach(key => { if (key.startsWith(name + '-')) xp += xpHistory[key]; });
                        return getLevelInfo(xp);
                    })();
                    const totalGold = calculateTotalGold(checkins, wheelHistory, name, activeBuffs, tasks);
                    return {
                        name,
                        level: levelInfo.level,
                        levelName: levelInfo.name || '',
                        achievementCount: Object.keys(achievements[name] || {}).length,
                        totalGold,
                        totalMinutes,
                        taskCount: (tasks[name] || []).length,
                        totalCheckins,
                        lastActiveDate: lastActiveDate || null
                    };
                });
                const payload = {
                    deviceId,
                    reportDate: today,
                    app: 'daka-tool',
                    city: (userCity && userCity.trim()) || (realWeather && realWeather.city) || '',
                    profiles: profilesList
                };
                const url = (reportConfig.formspreeUrl || '').trim();
                fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).then(() => {
                    storage.setItem('app_last_report_date', today);
                    reportSentRef.current = true;
                }).catch(() => {});
            }, [reportConfig.enabled, reportConfig.formspreeUrl, profiles, checkins, tasks, achievements, wheelHistory, activeBuffs, xpHistory, userCity, realWeather]);

            // --- Effect: 处理测试账号的添加与移除 ---
            useEffect(() => {
                if (isTestMode) {
                    // 如果开启测试模式，且没有测试员账号，则添加
                    if (!profiles.find(p => p.id === 'TESTER')) {
                        const tester = { id: 'TESTER', name: '测试员', theme: 'emerald', avatar: null };
                        setProfiles(prev => [...prev, tester]);
                        setTasks(prev => ({ ...prev, '测试员': [] })); 
                        // 为测试员预填充所有道具
                        const allItems = {};
                        SHOP_ITEMS.forEach(item => { allItems[item.id] = 1; });
                        setInventory(prev => ({ ...prev, '测试员': allItems }));
                    }
                } else {
                    // 如果关闭测试模式，且存在测试员账号，则移除
                    if (profiles.find(p => p.id === 'TESTER')) {
                        setProfiles(prev => prev.filter(p => p.id !== 'TESTER'));
                        // 如果当前正好选中了测试员，切回第一个人
                        if (activeChild === '测试员' && profiles.length > 0) {
                            startTransition(() => setActiveChild(profiles[0].name !== '测试员' ? profiles[0].name : (profiles[1] ? profiles[1].name : '')));
                        }
                    }
                }
            }, [isTestMode, profiles, activeChild]);
			
            const theme = useMemo(() => {
                const profile = profiles.find(p => p.name === deferredActiveChild) || profiles[0];
                return profile ? (COLOR_PALETTES[profile.theme] || COLOR_PALETTES.rose) : COLOR_PALETTES.rose;
        }, [deferredActiveChild, profiles]);

            const dates = useMemo(() => getDatesInRange(globalDates.start, globalDates.end), [globalDates]);

            const getCurrentWeekRange = () => {
                const d = new Date();
                const day = d.getDay();
                const mondayOffset = day === 0 ? -6 : 1 - day;
                return { start: getLocalDateKey(mondayOffset), end: getLocalDateKey(mondayOffset + 6) };
            };
            const calendarDates = useMemo(() => {
                if (viewMode === 'week') {
                    const { start, end } = getCurrentWeekRange();
                    return getDatesInRange(start, end);
                }
                if (viewMode === 'calendar') {
                    const now = new Date();
                    const y = calendarViewMonth ? calendarViewMonth.year : now.getFullYear();
                    const mo = calendarViewMonth ? calendarViewMonth.month : now.getMonth() + 1;
                    return getMonthDates(y, mo);
                }
                return dates;
            }, [viewMode, dates, calendarViewMonth]);

            const sortedTasks = useMemo(() => {
                const currentTasks = [...ongoingTasks]; // 【修改】只拿进行中的任务去渲染首页卡片
                if (sortBy === 'default') return currentTasks;
                return [...currentTasks].sort((a, b) => {
                    if (sortBy === 'deadline') {
                        const dateA = a.deadline ? new Date(a.deadline) : new Date('9999-12-31');
                        const dateB = b.deadline ? new Date(b.deadline) : new Date('9999-12-31');
                        return dateA - dateB;
                    }
                    if (sortBy === 'reward') return b.reward - a.reward;
                    if (sortBy === 'progress') {
                        const getProgress = (t) => {
                             const freq = t.frequencyType || 'count';
                             if (freq === 'daily_must' || freq === 'weekly_optional') return 0;
                             const record = checkins[deferredActiveChild]?.[t.id] || {};
                             const count = Object.keys(record).length;
                             const tc = t.targetCount || 1;
                             return tc > 0 ? count / tc : 0;
                        }
                        return getProgress(b) - getProgress(a);
                    }
                    return 0;
                });
            }, [tasks, deferredActiveChild, sortBy, checkins]);

            // --- 辅助函数：计算总资产 (独立于 state 用于成就检查) ---
            const calculateTotalGold = (cCheckins, cWheelHistory, child, cBuffs, cTasks) => {
                let total = 0;
                const childBuffs = cBuffs?.[child] || {};

                if ((cTasks || tasks)[child]) {
                    (cTasks || tasks)[child].forEach(task => {
                        const record = cCheckins[child]?.[task.id] || {};
                        const currentCount = Object.keys(record).length;
                        
                        Object.keys(record).forEach(date => {
                            const val = record[date];
                            // 多次打卡数组
                            if (Array.isArray(val)) {
                                val.forEach(entry => {
                                    const t = entry.t || 0;
                                    const histKey = t ? `${child}-TASK-${task.id}-${date}_${t}` : `${child}-TASK-${task.id}-${date}`;
                                    if (cWheelHistory[histKey]) return;
                                    let multiplier = 1;
                                    const effectiveStart = childBuffs.investStart || (childBuffs.investExpire ? dateKeySubtractDays(childBuffs.investExpire, 30) : getLocalDateKey(0));
                                    if (childBuffs.investMultiplier > 1 && childBuffs.investExpire && date <= childBuffs.investExpire && date >= effectiveStart) {
                                        multiplier = childBuffs.investMultiplier;
                                    }
                                    total += task.reward * multiplier;
                                });
                                return;
                            }
                            // 旧格式：数字
                            const historyKey = `${child}-TASK-${task.id}-${date}`;
                            if (cWheelHistory[historyKey]) return;
                            let multiplier = 1;
                            const effectiveStart = childBuffs.investStart || (childBuffs.investExpire ? dateKeySubtractDays(childBuffs.investExpire, 30) : getLocalDateKey(0));
                            if (childBuffs.investMultiplier > 1 && childBuffs.investExpire && date <= childBuffs.investExpire && date >= effectiveStart) {
                                multiplier = childBuffs.investMultiplier;
                            }
                            total += task.reward * multiplier;
                        })

                        // 每日必做/每周选做：仅 earlyCompleted 时计入完成奖励（已从周结算移除）
                        const freq = task.frequencyType || 'count';
                        if (freq === 'count' && currentCount >= (task.targetCount || 0)) total += (task.completedReward || 0);
						if ((freq === 'daily_must' || freq === 'weekly_optional') && task.earlyCompleted) total += (task.completedReward || 0);
                    });
                }
                Object.keys(cWheelHistory).forEach(key => {
                    // 扣除商店消费
                    if (key.startsWith(`${child}-`)) total += cWheelHistory[key];
                });
                return Math.max(0, total);
            };

            const totalGold = useMemo(() => {
                // 【修改】传入 activeBuffs
                return calculateTotalGold(checkins, wheelHistory, deferredActiveChild, activeBuffs, tasks);
            }, [checkins, deferredActiveChild, tasks, wheelHistory, activeBuffs]); // 【修改】依赖项增加 activeBuffs

            // --- 星星总额计算 ---
            const calculateTotalStars = useCallback((childName) => {
                const history = starHistory || {};
                let total = 0;
                Object.keys(history).forEach(key => {
                    if (key.startsWith(childName + '-STAR_')) {
                        total += history[key];
                    }
                });
                return Math.max(0, total);
            }, [starHistory]);

            const totalStars = useMemo(() => {
                return calculateTotalStars(deferredActiveChild);
            }, [calculateTotalStars, deferredActiveChild]);

            // --- 星星明细数据 ---
            const starTransactions = useMemo(() => {
                const history = starHistory || {};
                const list = [];
                const petActionNames = { feed: '喂食', bath: '洗香香', play: '去玩耍', sleep: '睡觉', pet: '摸摸头' };
                Object.keys(history).forEach(key => {
                    if (!key.startsWith(deferredActiveChild + '-STAR_')) return;
                    const amount = history[key];
                    if (key.includes('-STAR_CHECKIN-')) {
                        // 兼容两种 key 结尾：普通任务 `-日期`，多次打卡 `-日期_时间戳`（否则多次打卡的星星在明细里不显示）
                        const match = key.match(/-STAR_CHECKIN-(.+)-(\d{4}-\d{2}-\d{2})(?:_\d+)?$/);
                        if (!match) return;
                        const taskId = match[1];
                        const date = match[2];
                        const task = (tasks[deferredActiveChild] || []).find(t => t.id === taskId);
                        const taskName = task ? task.name : '打卡';
                        list.push({ id: key, date, name: `打卡：${taskName}`, amount, type: 'income' });
                    } else if (key.includes('-STAR_PET_BUY-')) {
                        const ts = key.match(/-(\d{13})$/)?.[1];
                        const date = ts ? tsToLocalDateKey(parseInt(ts)) : '';
                        const petId = key.match(/-STAR_PET_BUY-([^-]+)-/)?.[1] || '';
                        const catalog = petCatalog.find(c => c.id === petId);
                        const petName = catalog ? catalog.name : '宠物';
                        list.push({ id: key, date, name: `领养：${petName}`, amount, type: amount > 0 ? 'income' : 'expense' });
                    } else if (key.includes('-STAR_PET_')) {
                        const ts = key.match(/-(\d{13})$/)?.[1];
                        const date = ts ? tsToLocalDateKey(parseInt(ts)) : '';
                        const actionKey = key.match(/-STAR_PET_([^-]+)-/)?.[1] || '';
                        const actionName = petActionNames[actionKey] || actionKey;
                        list.push({ id: key, date, name: `宠物互动：${actionName}`, amount, type: amount > 0 ? 'income' : 'expense' });
                    } else if (key.includes('-STAR_ADVENTURE_START-')) {
                        const ts = key.match(/-(\d{13})$/)?.[1];
                        const date = ts ? tsToLocalDateKey(parseInt(ts)) : '';
                        const realmId = key.match(/-STAR_ADVENTURE_START-([^-]+)-/)?.[1] || '';
                        const realm = adventureRealms.find(r => r.id === realmId);
                        const realmName = realm ? realm.name : '探险';
                        list.push({ id: key, date, name: `探险出发：${realmName}`, amount, type: 'expense' });
                    } else if (key.includes('-STAR_ADVENTURE_REWARD-')) {
                        const ts = key.match(/-(\d{13})$/)?.[1];
                        const date = ts ? tsToLocalDateKey(parseInt(ts)) : '';
                        const realmId = key.match(/-STAR_ADVENTURE_REWARD-([^-]+)-/)?.[1] || '';
                        const realm = adventureRealms.find(r => r.id === realmId);
                        const realmName = realm ? realm.name : '探险';
                        list.push({ id: key, date, name: `探险归来：${realmName}`, amount, type: 'income' });
                    } else if (key.includes('-STAR_BUY-')) {
                        const ts = key.match(/-(\d{13})$/)?.[1];
                        const date = ts ? tsToLocalDateKey(parseInt(ts)) : '';
                        const itemId = key.match(/-STAR_BUY-([^-]+)-/)?.[1] || '';
                        const item = SHOP_ITEMS.find(i => i.id === itemId);
                        const itemName = item ? item.name : '星星兑换';
                        list.push({ id: key, date, name: `兑换：${itemName}`, amount, type: 'income' });
                    }
                });
                return list.sort((a, b) => new Date(b.date) - new Date(a.date));
            }, [starHistory, deferredActiveChild, tasks, adventureRealms]);

            // --- 宠物属性衰减 ---
            useEffect(() => {
                const childPets = petData[deferredActiveChild];
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

                    hasChanges = true;
                    updated[petId] = {
                        ...pet,
                        stats: {
                            fullness: Math.max(0, pet.stats.fullness - Math.floor(decay * 3)),
                            cleanliness: Math.max(0, pet.stats.cleanliness - Math.floor(decay * 2)),
                            mood: Math.max(0, pet.stats.mood - Math.floor(decay * 2)),
                        },
                    };
                });

                if (hasChanges) {
                    setPetData(prev => ({ ...prev, [deferredActiveChild]: updated }));
                }
            }, [deferredActiveChild]);

            // --- 宠物状态提醒（通知系统） ---
            // 每 30 分钟检测一次，命中条件则创建通知并显示气泡
            useEffect(() => {
                const checkPetStatus = async () => {
                    const petId = activePet[activeChild];
                    if (!petId) return;
                    const pet = petData[activeChild]?.[petId];
                    if (!pet) return;
                    // 已有未解决通知则不重复创建
                    if (petNotif[activeChild] && !petNotif[activeChild].resolved) return;

                    const cat = (typeof PET_CATALOG !== 'undefined' ? PET_CATALOG : []).find(c => c.id === petId);
                    const petName = pet.nickname || cat?.name || '宠物';
                    const today = getLocalDateKey(0);

                    // 扩展触发条件（原有 3 种 + 新增 2 种）
                    let triggeredType = null;
                    let sceneDesc = '';
                    if (pet.stats.fullness < 20) {
                        triggeredType = 'hungry'; sceneDesc = '你的饱食度非常低，肚子很饿';
                    } else if (pet.stats.mood < 20) {
                        triggeredType = 'sad'; sceneDesc = '你的心情很低落，很不开心';
                    } else if (pet.stats.cleanliness < 20) {
                        triggeredType = 'dirty'; sceneDesc = '你身上脏兮兮的，需要洗澡';
                    } else if (pet.stats.mood < 30) {
                        triggeredType = 'grumpy'; sceneDesc = '你有点不开心，想闹脾气';
                    } else {
                        // 催打卡检查
                        const childTasks = (tasks[activeChild] || []).filter(t => !t.startDate || today >= t.startDate).filter(t => !t.earlyCompleted);
                        const completed = childTasks.filter(t => (checkins[activeChild]?.[t.id]?.[today])).length;
                        if (childTasks.length > 0 && completed < childTasks.length) {
                            // 检查距上次打卡是否 ≥ 3 小时
                            let lastCheckinTime = 0;
                            childTasks.forEach(t => {
                                const record = checkins[activeChild]?.[t.id] || {};
                                Object.keys(record).forEach(date => {
                                    if (date === today) lastCheckinTime = Date.now(); // 简化处理
                                });
                            });
                            if (completed === 0) {
                                triggeredType = 'nag'; sceneDesc = '主人今天还没有打卡学习，你在催促主人';
                            }
                        }
                    }

                    if (!triggeredType) return;

                    // AI 生成消息
                    let message = '';
                    if (aiEnabled && deepseekApiKey) {
                        try {
                            const personality = petPersonalities[petId] || {};
                            const prompt = `你是${petName}，${activeChild}的宠物。
性格：${personality.personality || '可爱活泼'}
说话风格：${personality.speech_style || '语气可爱'}
当前状态：心情${pet.stats.mood}/100，饱食${pet.stats.fullness}/100，清洁${pet.stats.cleanliness}/100
情况：${sceneDesc}
请用符合你性格的方式，对主人说一句话（30字以内）。不要用引号。`;
                            const reply = await callDeepSeekAPI(prompt, '跟我说句话吧', []);
                            if (reply) message = reply.replace(/^[""「]|[""」]$/g, '').slice(0, 60);
                        } catch (e) { /* fallback to static */ }
                    }

                    // 回退：静态消息
                    if (!message) {
                        const staticMsgs = {
                            hungry: `${petName}肚子好饿，快去喂食吧！`,
                            sad: `${petName}心情很低落，快去陪陪它吧！`,
                            dirty: `${petName}身上脏兮兮的，快去洗香香！`,
                            grumpy: `${petName}有点不开心了，快去看看吧！`,
                            nag: `${petName}在等你打卡学习哦！`
                        };
                        message = staticMsgs[triggeredType] || `${petName}想你了！`;
                    }

                    const notif = { type: triggeredType, message: `${petName}：${message}`, ts: Date.now(), resolved: false };
                    setPetNotif(prev => ({ ...prev, [activeChild]: notif }));
                    setPetNotifVisible(true);
                    if (petNotifTimerRef.current) clearTimeout(petNotifTimerRef.current);
                    petNotifTimerRef.current = setTimeout(() => setPetNotifVisible(false), 10 * 60 * 1000);
                };
                const timer = setInterval(checkPetStatus, 1800000);
                return () => clearInterval(timer);
            }, [activeChild, activePet, petData, petNotif, aiEnabled, deepseekApiKey, tasks, checkins]);

            // --- AI 小星老师主动提醒 ---
            const showAiBubble = React.useCallback((message) => {
                setAiBubbleMessage(message);
                setAiBubbleVisible(true);
                setAiBubbleChild(activeChild);
            }, [activeChild]);

            // 辅助：AI 发送气泡（每种类型每日限一次，每日最多3种）
            const trySendAiReminder = async (type, prompt, userMsg, log, today) => {
                const typeKey = `reminder_${type}_${activeChild}_${today}`;
                if (log[typeKey]) return false;
                const todayTypes = Object.keys(log).filter(k => k.startsWith(`reminder_`) && k.includes(`_${activeChild}_`) && k.endsWith(`_${today}`)).length;
                if (todayTypes >= 3) return false;
                const reply = await callDeepSeekAPI(prompt, userMsg || '跟我说句话吧', []);
                if (reply) {
                    showAiBubble(reply.replace(/^[""「]|[""」]$/g, '').slice(0, 80));
                    setAiReminderLog(prev => ({ ...prev, [typeKey]: true, [`lastReminderDate_${activeChild}`]: today }));
                    return true;
                }
                return false;
            };

            const checkAiRemindersRef = React.useRef(null);
            const checkAiReminders = React.useCallback(async () => {
                if (!aiEnabled || !deepseekApiKey) return;
                const today = getLocalDateKey(0);
                const log = aiReminderLog || {};
                const childTasks = (tasks[activeChild] || []);
                const activeTasks = childTasks.filter(t => !t.startDate || today >= t.startDate).filter(t => !t.earlyCompleted);
                const todayCheckins = checkins[activeChild] || {};
                const now = new Date();
                const hour = now.getHours();

                // === 优先级 1：每日问候 ===
                if (log[`lastReminderDate_${activeChild}`] !== today || !log[`todayGreetDone_${activeChild}`]) {
                    const completed = activeTasks.filter(t => todayCheckins[t.id]?.[today]).length;
                    if (activeTasks.length > 0 && completed < activeTasks.length) {
                        const remaining = activeTasks.length - completed;
                        // 附带天气信息
                        let weatherNote = '';
                        if (realWeather) {
                            const desc = realWeather.weathercode <= 3 ? '晴天' : realWeather.weathercode <= 48 ? '多云' : '雨天';
                            weatherNote = `今天外面${desc}，`;
                        }
                        const prompt = buildAssistantSystemPrompt(activeChild) + `\n\n${weatherNote}${activeChild}还有${remaining}个任务未完成。请用温暖的语气给一个简短的今日问候和任务提醒（50字以内），不要用引号。`;
                        const sent = await trySendAiReminder('greet', prompt, '给我一个今日问候', log, today);
                        setAiReminderLog(prev => ({ ...prev, [`lastReminderDate_${activeChild}`]: today, [`todayGreetDone_${activeChild}`]: true }));
                        if (sent) return;
                    }
                    setAiReminderLog(prev => ({ ...prev, [`lastReminderDate_${activeChild}`]: today, [`todayGreetDone_${activeChild}`]: true }));
                }

                // === 优先级 2：久未打卡提醒 ===
                if (!log[`inactivityReminded_${activeChild}`] || log[`inactivityReminded_${activeChild}`] !== today) {
                    let lastActive = '';
                    childTasks.forEach(t => {
                        Object.keys(todayCheckins[t.id] || {}).forEach(date => {
                            if (date > lastActive) lastActive = date;
                        });
                    });
                    if (lastActive && lastActive < getLocalDateKey(-1)) {
                        const daysSince = Math.floor((new Date(today) - new Date(lastActive)) / 86400000);
                        const prompt = buildAssistantSystemPrompt(activeChild) + `\n\n${activeChild}已经${daysSince}天没有打卡了。请用温和、不批评的语气给一个简短的提醒和鼓励（50字以内），让ta重新开始学习。不要用引号。`;
                        const sent = await trySendAiReminder('inactivity', prompt, '提醒我回来学习', log, today);
                        if (sent) { setAiReminderLog(prev => ({ ...prev, [`inactivityReminded_${activeChild}`]: today })); return; }
                    }
                }

                // === 优先级 3：截止前冲刺提醒（deadlineHour 前 1 小时） ===
                if (hour >= (wheelSettings.deadlineHour || 18) - 1 && hour < (wheelSettings.deadlineHour || 18)) {
                    const remaining = activeTasks.filter(t => !todayCheckins[t.id]?.[today]).length;
                    if (remaining > 0) {
                        const prompt = `你是小星老师。${activeChild}今天还有${remaining}个任务没完成，快到截止时间了。请用紧迫但鼓励的语气提醒（40字以内），不要用引号。`;
                        const sent = await trySendAiReminder('deadline', prompt, '截止提醒', log, today);
                        if (sent) return;
                    }
                }

                // === 优先级 4：周工资提醒 ===
                if (weeklyPayrollToClaim) {
                    const weekKey = weeklyPayrollToClaim.weekKey;
                    const payrollKey = `payroll_${weekKey}`;
                    if (!log[payrollKey]) {
                        const prompt = `你是小星老师。${activeChild}上周的学习工资已经到账了，金额是${weeklyPayrollToClaim.totalReward}金元宝。请用开心的语气提醒ta去领取（40字以内），不要用引号。`;
                        const sent = await trySendAiReminder('payroll', prompt, '工资提醒', log, today);
                        if (sent) { setAiReminderLog(prev => ({ ...prev, [payrollKey]: true })); return; }
                    }
                }

                // === 优先级 5：升级临近提醒 ===
                const nextLevel = getNextLevelInfo(getLevelInfo(currentXP).level);
                if (nextLevel) {
                    const xpNeeded = nextLevel.xp - currentXP;
                    const xpForLevel = nextLevel.xp - (getLevelInfo(currentXP).xp || 0);
                    const progress = xpForLevel > 0 ? (1 - xpNeeded / xpForLevel) : 0;
                    if (progress >= 0.85 && xpNeeded > 0) {
                        const levelKey = `level_approach_${activeChild}_${nextLevel.level}`;
                        if (!log[levelKey]) {
                            const prompt = `你是小星老师。${activeChild}距离下一级（${nextLevel.name || 'Lv.'+nextLevel.level}）只差${xpNeeded}经验了。请用兴奋的语气鼓励ta再加把劲（40字以内），不要用引号。`;
                            const sent = await trySendAiReminder('level_approach', prompt, '升级提醒', log, today);
                            if (sent) { setAiReminderLog(prev => ({ ...prev, [levelKey]: true })); return; }
                        }
                    }
                }

                // === 优先级 6：宠物状态关怀 ===
                const petId = activePet[activeChild];
                const pet = petId ? petData[activeChild]?.[petId] : null;
                if (pet) {
                    const petName = pet.nickname || '宠物';
                    const lowStat = pet.stats.fullness < 30 ? '饱食度' : pet.stats.cleanliness < 30 ? '清洁度' : pet.stats.mood < 30 ? '心情' : null;
                    if (lowStat) {
                        const prompt = `你是小星老师。${activeChild}的宠物${petName}的${lowStat}有点低了。请用温柔的语气提醒ta去照顾宠物（30字以内），不要用引号。`;
                        const sent = await trySendAiReminder('pet_care', prompt, '宠物关怀', log, today);
                        if (sent) return;
                    }
                }

                // === 优先级 7：Buff 到期提醒 ===
                const buffs = activeBuffs[activeChild] || {};
                if (buffs.investMultiplier > 1 && buffs.investExpire) {
                    const daysLeft = Math.ceil((new Date(buffs.investExpire) - new Date(today)) / 86400000);
                    if (daysLeft <= 1 && daysLeft >= 0) {
                        const prompt = `你是小星老师。${activeChild}的投资卡（${buffs.investMultiplier}倍加成）快到期了。请用提醒的语气鼓励ta趁现在多打卡（30字以内），不要用引号。`;
                        const sent = await trySendAiReminder('buff_expiry', prompt, 'buff到期提醒', log, today);
                        if (sent) return;
                    }
                }

                // === 优先级 8：周末冲刺提醒 ===
                if (weekendSettings?.enabled) {
                    const dayOfWeek = now.getDay();
                    // 周五傍晚预告
                    if (dayOfWeek === 5 && hour >= 15) {
                        const weekKey = `weekend_preview_${activeChild}_${today}`;
                        if (!log[weekKey]) {
                            const prompt = `你是小星老师。明天就是周末冲刺了！请用期待的语气提醒${activeChild}准备好（30字以内），不要用引号。`;
                            const sent = await trySendAiReminder('weekend_preview', prompt, '周末预告', log, today);
                            if (sent) { setAiReminderLog(prev => ({ ...prev, [weekKey]: true })); return; }
                        }
                    }
                    // 周日进度提醒
                    if (dayOfWeek === 0 && hour >= 14) {
                        const dailyMust = childTasks.filter(t => t.frequencyType === 'daily_must').filter(t => !t.startDate || today >= t.startDate).filter(t => !t.earlyCompleted);
                        const coreTasks = childTasks.filter(t => t.type === 'core').filter(t => !t.startDate || today >= t.startDate).filter(t => !t.earlyCompleted);
                        const coreDone = coreTasks.filter(t => todayCheckins[t.id]?.[today]).length;
                        if (coreTasks.length > 0 && coreDone < coreTasks.length) {
                            const prompt = `你是小星老师。今天是周日，周末冲刺还差${coreTasks.length - coreDone}个核心任务就达标了。请用鼓励的语气提醒${activeChild}加油完成（40字以内），不要用引号。`;
                            const sent = await trySendAiReminder('weekend_urge', prompt, '周末冲刺提醒', log, today);
                            if (sent) return;
                        }
                    }
                }

                // === 优先级 9：每周进步回顾（周日） ===
                if (now.getDay() === 0) {
                    const weekKey = `weekly_review_${activeChild}_${getLocalDateKey(0)}`;
                    if (!log[weekKey]) {
                        // 计算本周数据
                        let weekDays = 0, weekMinutes = 0;
                        for (let i = 0; i < 7; i++) {
                            const d = getLocalDateKey(-i);
                            const dayHas = childTasks.some(t => todayCheckins[t.id]?.[d]);
                            if (dayHas) { weekDays++; }
                            childTasks.forEach(t => { weekMinutes += todayCheckins[t.id]?.[d] || 0; });
                        }
                        if (weekDays > 0) {
                            const prompt = `你是小星老师。本周${activeChild}打卡了${weekDays}天，共学习${weekMinutes}分钟。请用简短的话给一个周回顾和鼓励（50字以内），不要用引号。`;
                            const sent = await trySendAiReminder('weekly_review', prompt, '周回顾', log, today);
                            if (sent) { setAiReminderLog(prev => ({ ...prev, [weekKey]: true })); return; }
                        }
                    }
                }
            }, [aiEnabled, deepseekApiKey, aiReminderLog, tasks, activeChild, checkins, callDeepSeekAPI, showAiBubble, realWeather, weeklyPayrollToClaim, currentXP, activeBuffs, activePet, petData, weekendSettings, wheelSettings]);
            checkAiRemindersRef.current = checkAiReminders;

            // App 启动时和每30分钟检查 AI 提醒
            React.useEffect(() => {
                if (!aiEnabled || !deepseekApiKey) return;
                const timer = setTimeout(() => checkAiRemindersRef.current?.(), 2000);
                const interval = setInterval(() => checkAiRemindersRef.current?.(), 1800000);
                return () => { clearTimeout(timer); clearInterval(interval); };
            }, [aiEnabled, deepseekApiKey, deferredActiveChild]);

            // 宠物数据变化时检查通知是否已解决
            useEffect(() => {
                const n = petNotif?.[activeChild];
                if (!n || n.resolved) return;
                const petId = activePet[activeChild];
                if (!petId) return;
                const pet = petData[activeChild]?.[petId];
                if (!pet) return;
                const cfg = PET_NOTIF_CONFIG.find(c => c.type === n.type);
                if (cfg && cfg.resolve(pet)) {
                    setPetNotif(prev => { const next = { ...prev }; delete next[activeChild]; return next; });
                    setPetNotifVisible(false);
                    if (petNotifTimerRef.current) clearTimeout(petNotifTimerRef.current);
                }
            }, [petData, activeChild, activePet, petNotif]);

            // ==================== 探险系统核心逻辑 ====================
            const showToast = useCallback((typeOrMsg, msg, options) => {
                if (typeof window !== 'undefined' && window.showToast) {
                    if (msg !== undefined) {
                        window.showToast(typeOrMsg, msg, options);
                    } else {
                        window.showToast('info', typeOrMsg, options);
                    }
                }
            }, []);

            // 获取当前探险加成状态（供倍率面板使用）
            const getAdventureMultiplierStatus = useCallback((realmId, overridePetId) => {
                const h = adventureHelpers;
                const cfg = adventureConfig;
                if (!h || !cfg || !cfg.hungerPerHour) return null;

                const petId = overridePetId || activePet[deferredActiveChild];
                if (!petId) return null;
                const pet = petData[deferredActiveChild]?.[petId];
                if (!pet) return null;

                const realm = adventureRealms.find(r => r.id === realmId);
                const recentDays = cfg.recentDays || 7;

                // 日均基础值
                const dailyGoldBase = h.calcDailyGoldBase(checkins, wheelHistory, tasks, deferredActiveChild, recentDays, getLevelInfo(currentXP).level);
                const dailyXPBase = h.calcDailyXPBase(checkins, tasks, deferredActiveChild, recentDays);

                // 打卡完成率
                const completionRate = h.calcCompletionRate(tasks, checkins, deferredActiveChild, recentDays, { exemptedDays });

                // 连续打卡天数
                const streakDays = h.calcStreakDays(tasks, checkins, deferredActiveChild);

                // 亲密度
                const bondValue = pet.stats ? Math.round((pet.stats.fullness + pet.stats.cleanliness + pet.stats.mood) / 3) : 0;
                const bondLevel = h.getBondLevel(bondValue);

                // 元素克制
                const petCatalogEntry = petCatalog.find(c => c.id === petId);
                const petElement = petCatalogEntry?.attributes?.element || 'none';
                const realmElement = realm?.element || 'none';
                const elemStrong = petElements[petElement]?.strong;
                const elementBonus = (elemStrong === realmElement) ? cfg.elementBonus : 0;

                // 打卡连击加成
                const streakBonus = { gold: 0, xp: 0, stars: 0 };
                const streakThresholds = Object.keys(cfg.streakBonuses || {}).map(Number).sort((a, b) => b - a);
                for (const t of streakThresholds) {
                    if (streakDays >= t) { Object.assign(streakBonus, cfg.streakBonuses[t]); break; }
                }

                // 宠物技能加成
                const skillBonus = (cfg.petAdventureSkills || {})[petId] || { goldBoost: 0, xpBoost: 0, starBoost: 0, rareBoost: 0, timeReduce: 0, eventShield: false };

                // 综合倍率
                const goldMul = 1 + bondLevel.itemBonus + streakBonus.gold + skillBonus.goldBoost + elementBonus;
                const xpMul = 1 + bondLevel.itemBonus + streakBonus.xp + skillBonus.xpBoost + elementBonus;
                const starsMul = 1 + streakBonus.stars + skillBonus.starBoost;

                // 门控状态
                let gateStatus = 'normal';
                let gateMultiplier = 1;
                if (completionRate < cfg.gateThresholdWarning) {
                    gateStatus = 'blocked';
                } else if (completionRate < cfg.gateThresholdNormal) {
                    gateStatus = 'warning';
                    gateMultiplier = cfg.gateMultiplier;
                }

                // 今日已探险次数
                const todayKey = getLocalDateKey(0);
                const advStats = petAdventureStats[deferredActiveChild] || {};
                const todayCount = (advStats.dailyCounts || {})[todayKey] || 0;

                return {
                    dailyGoldBase: Math.round(dailyGoldBase),
                    dailyXPBase: Math.round(dailyXPBase),
                    completionRate,
                    streakDays,
                    bondValue,
                    bondLevelName: bondLevel.name,
                    bondItemBonus: bondLevel.itemBonus,
                    petElement,
                    realmElement,
                    elementBonus,
                    streakBonus,
                    skillBonus,
                    goldMul: Math.round(goldMul * 100) / 100,
                    xpMul: Math.round(xpMul * 100) / 100,
                    starsMul: Math.round(starsMul * 100) / 100,
                    gateStatus,
                    gateMultiplier,
                    todayCount,
                    maxPerDay: cfg.maxPerDay,
                };
            }, [deferredActiveChild, activePet, petData, petAdventureStats, checkins, wheelHistory, tasks, currentXP, petCatalog, petElements, adventureHelpers, adventureConfig, adventureRealms]);

            // 开始探险
            // 探险出发防重复点击
            const isStartingRef = React.useRef(false);

            const handleStartAdventure = useCallback((realmId, selectedPetId, bringFood = false) => {
                // H6: 防重复点击
                if (isStartingRef.current) return;
                isStartingRef.current = true;
                setTimeout(() => { isStartingRef.current = false; }, 1000);

                const h = adventureHelpers;
                const cfg = adventureConfig;
                if (!h || !cfg || !cfg.hungerPerHour) return showToast('探险系统未就绪');

                const petId = selectedPetId || activePet[deferredActiveChild];
                if (!petId) return showToast('请先选择一只宠物！');

                const pet = petData[deferredActiveChild]?.[petId];
                if (!pet) return showToast('宠物数据异常');

                const realm = adventureRealms.find(r => r.id === realmId);
                if (!realm) return showToast('未知领域');

                // === 验证阶段（所有检查在任何 setState 之前） ===

                // 等级和时代检查
                const lvlInfo = getLevelInfo(currentXP);
                if (lvlInfo.level < realm.unlockLevel) return showToast(`需要达到 ${realm.unlockLevel} 级才能探险`);
                const eraOrder = (typeof ERA_ORDER !== 'undefined') ? ERA_ORDER : ['远古之路', '文明初曙', '周·礼制与争鸣', '秦·铁血与一统', '汉·雄风与凿空西域', '魏晋隋唐·融合与登科', '五代·乱世更迭', '宋·文道昌盛', '元·四海交融', '明·日月重开'];
                if (realm.unlockEra && eraOrder.indexOf(lvlInfo.era) < eraOrder.indexOf(realm.unlockEra)) return showToast(`需要先到达「${realm.unlockEra}」时代`);

                // 已有探险进行中检查
                const myAdvs = (Array.isArray(petAdventures[deferredActiveChild]) ? petAdventures[deferredActiveChild] : []).filter(a => a.status === 'active');
                if (myAdvs.some(a => a.petId === petId)) return showToast('这只宠物正在探险中，不能重复出发！');

                // 今日次数检查
                const todayKey = getLocalDateKey(0);
                const advStats = petAdventureStats[deferredActiveChild] || {};
                const todayCount = (advStats.dailyCounts || {})[todayKey] || 0;
                if (todayCount >= cfg.maxPerDay) return showToast(`今日探险次数已用完（${cfg.maxPerDay} 次/天）`);

                // 门控检查
                const recentDays = cfg.recentDays || 7;
                const completionRate = h.calcCompletionRate(tasks, checkins, deferredActiveChild, recentDays, { exemptedDays });
                if (completionRate < cfg.gateThresholdWarning) {
                    const refuseDialogs = adventureRefuseDialogs || [];
                    const dialog = refuseDialogs[Math.floor(Math.random() * refuseDialogs.length)] || '学习不够努力，无法探险！';
                    return showToast(dialog);
                }

                // 宠物状态检查
                // effectiveCost 仅用于结算扣减/弹窗预览，不再作为出发门槛（长途消耗会超过饱食度上限 100）
                // 出发门槛用领域配置的 minFullness / minCleanliness（达标即可派遣，符合派遣类游戏惯例）
                const { hours } = calcAdventureHungerCost(realm.duration, cfg.hungerPerHour, cfg.foodHungerReduction || 5, bringFood);
                const fullness = pet.stats?.fullness || 0;
                const cleanliness = pet.stats?.cleanliness || 0;
                const minFullness = (typeof realm.minFullness === 'number') ? realm.minFullness : 1;
                const minCleanliness = (typeof realm.minCleanliness === 'number') ? realm.minCleanliness : 0;

                if (fullness < minFullness) {
                    return showToast(`🍖 宠物饿了！饱食度 ${fullness}%，需要 ${minFullness}% 才能前往「${realm.name}」`);
                }
                if (cleanliness < minCleanliness) {
                    return showToast(`🛁 宠物需要先洗个澡！清洁度 ${cleanliness}%，需要 ${minCleanliness}%`);
                }

                // 星星检查（S2: 在食物扣减之前）
                const currentStars = totalStars;
                if (currentStars < realm.starCost) return showToast(`星星不够！需要 ${realm.starCost} ⭐，当前 ${currentStars} ⭐`);

                // 食物包检查（H8: 用当前 inventory 验证，不用闭包）
                const currentFoodCount = (inventory[deferredActiveChild] || {})['item_adventure_food'] || 0;
                if (bringFood && currentFoodCount < hours) {
                    return showToast(`探险干粮不足！需要 ${hours} 个，当前 ${currentFoodCount} 个`);
                }

                // === 扣减阶段（所有验证通过后才执行） ===

                // 扣星星
                setStarHistory(prev => ({ ...prev, [`${deferredActiveChild}-STAR_ADVENTURE_START-${realmId}-${Date.now()}`]: -realm.starCost }));

                // 扣食物包
                if (bringFood && hours > 0) {
                    setInventory(prev => {
                        const childInv = prev[deferredActiveChild] || {};
                        const newCount = (childInv['item_adventure_food'] || 0) - hours;
                        const newInv = { ...childInv, 'item_adventure_food': newCount };
                        if (newCount <= 0) delete newInv['item_adventure_food'];
                        return { ...prev, [deferredActiveChild]: newInv };
                    });
                }

                // 计算时间（含技能缩短）
                const skillBonus = (cfg.petAdventureSkills || {})[petId] || { timeReduce: 0 };
                const actualDuration = Math.round(realm.duration * (1 - skillBonus.timeReduce));

                // 创建探险记录
                const adventure = {
                    id: 'adv_' + Date.now(),
                    realmId,
                    petId,
                    startTime: Date.now(),
                    expectedEndTime: Date.now() + actualDuration,
                    status: 'active',
                    starCost: realm.starCost,
                    broughtFood: bringFood,
                };

                setPetAdventures(prev => {
                    const arr = Array.isArray(prev[deferredActiveChild]) ? prev[deferredActiveChild] : [];
                    return { ...prev, [deferredActiveChild]: [...arr, adventure] };
                });

                // 更新统计
                setPetAdventureStats(prev => {
                    const childStats = { ...(prev[deferredActiveChild] || {}) };
                    childStats.totalAdventures = (childStats.totalAdventures || 0) + 1;
                    childStats[`${realmId}Count`] = (childStats[`${realmId}Count`] || 0) + 1;
                    childStats.totalStarsSpent = (childStats.totalStarsSpent || 0) + realm.starCost;
                    childStats.dailyCounts = { ...(childStats.dailyCounts || {}), [todayKey]: todayCount + 1 };
                    return { ...prev, [deferredActiveChild]: childStats };
                });

                showToast(`${realm.icon} ${pet.nickname || petId} 出发前往「${realm.name}」！预计 ${Math.round(actualDuration / 3600000)} 小时后归来`);
            }, [deferredActiveChild, activePet, petData, petAdventures, petAdventureStats, totalStars, tasks, checkins, currentXP, adventureHelpers, adventureConfig, adventureRealms, adventureRefuseDialogs, setStarHistory, setPetAdventures, setPetAdventureStats, showToast]);

            // 完成探险（结算奖励）
            const handleCompleteAdventure = useCallback((childName, adventureId, showFeedback = false) => {
                const h = adventureHelpers;
                const cfg = adventureConfig;
                if (!h || !cfg || !cfg.hungerPerHour) return null;

                const advArr = Array.isArray(petAdventures[childName]) ? petAdventures[childName] : [];
                const adv = adventureId ? advArr.find(a => a.id === adventureId) : advArr.find(a => (a.status === 'active' && Date.now() >= a.expectedEndTime) || (a.status === 'completed' && a.result));
                if (!adv) return null;
                // 若该探险已经是 completed 状态且已有战利品，直接响应反馈
                if (adv.status === 'completed' && adv.result) {
                    if (showFeedback) {
                        if (typeof window !== 'undefined' && window.confetti) {
                            window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
                        }
                        const pName = adv.petName || '宠物';
                        const rName = adv.realmName || '秘境';
                        showToast(`🎁「${pName}」从「${rName}」带回的战利品已准备就绪，快查看！`);
                    }
                    return adv.result;
                }
                if (adv.status !== 'active') return null;
                if (Date.now() < adv.expectedEndTime) return null;

                const realm = adventureRealms.find(r => r.id === adv.realmId);
                if (!realm) return null;

                const recentDays = cfg.recentDays || 7;
                const petId = adv.petId;
                const pet = petData[childName]?.[petId];
                const petName = pet?.nickname || petId;

                // 计算基础值
                const dailyGoldBase = h.calcDailyGoldBase(checkins, wheelHistory, tasks, childName, recentDays, getLevelInfo(currentXP).level);
                const dailyXPBase = h.calcDailyXPBase(checkins, tasks, childName, recentDays);

                // 计算打卡率和门控
                const completionRate = h.calcCompletionRate(tasks, checkins, childName, recentDays, { exemptedDays });
                let gateMultiplier = 1;
                if (completionRate < cfg.gateThresholdNormal) {
                    gateMultiplier = cfg.gateMultiplier;
                }

                // 计算加成
                const streakDays = h.calcStreakDays(tasks, checkins, childName);
                const bondValue = pet?.stats ? Math.round((pet.stats.fullness + pet.stats.cleanliness + pet.stats.mood) / 3) : 0;

                // 元素克制
                const petCatalogEntry = petCatalog.find(c => c.id === petId);
                const petElement = petCatalogEntry?.attributes?.element || 'none';
                const elemStrong = petElements[petElement]?.strong;
                const elementBonus = (elemStrong === realm.element) ? cfg.elementBonus : 0;

                // 亲密度等级
                const bondLevel = h.getBondLevel(bondValue);

                // 打卡连击
                const streakBonus = { gold: 0, xp: 0, stars: 0 };
                const streakThresholds = Object.keys(cfg.streakBonuses || {}).map(Number).sort((a, b) => b - a);
                for (const t of streakThresholds) {
                    if (streakDays >= t) { Object.assign(streakBonus, cfg.streakBonuses[t]); break; }
                }

                // 宠物技能
                const skillBonus = (cfg.petAdventureSkills || {})[petId] || { goldBoost: 0, xpBoost: 0, starBoost: 0, rareBoost: 0, eventShield: false };

                // 综合倍率
                const multipliers = {
                    gold: 1 + bondLevel.itemBonus + streakBonus.gold + skillBonus.goldBoost + elementBonus,
                    xp: 1 + bondLevel.itemBonus + streakBonus.xp + skillBonus.xpBoost + elementBonus,
                    stars: 1 + streakBonus.stars + skillBonus.starBoost,
                };

                // 计算宝物数量
                const lootCount = h.calcLootCount(realm, bondValue);

                // 抽取宝物
                const rolledItems = h.rollLoot(adv.realmId, lootCount);

                // 随机事件
                const event = h.rollEvent(skillBonus.eventShield);

                // 结算宝物
                const result = h.resolveLoot(rolledItems, dailyGoldBase, dailyXPBase, multipliers, gateMultiplier, event, getLevelInfo(currentXP).level, adv.realmId);

                // 应用奖励（金元宝→wheelHistory，纯经验→xpHistory，星星→starHistory）
                const advTs = Date.now();
                if (result.totalGold > 0) {
                    setWheelHistory(prev => ({ ...prev, [`${childName}-ADVENTURE_GOLD-${adv.realmId}-${advTs}`]: result.totalGold }));
                }
                if (result.totalXP > 0) {
                    setXpHistory(prev => ({ ...prev, [`${childName}-ADVENTURE_XP-${adv.realmId}-${advTs}`]: result.totalXP }));
                }
                if (result.totalStars > 0) {
                    setStarHistory(prev => ({ ...prev, [`${childName}-STAR_ADVENTURE_REWARD-${adv.realmId}-${advTs}`]: result.totalStars }));
                }

                // 更新宠物属性（探险消耗）
                if (pet) {
                    const hours = Math.round((adv.expectedEndTime - adv.startTime) / 3600000);
                    const hungerPerHour = adv.broughtFood ? Math.max(1, cfg.hungerPerHour - (cfg.foodHungerReduction || 5)) : cfg.hungerPerHour;
                    setPetData(prev => {
                        const childPets = { ...(prev[childName] || {}) };
                        const p = { ...childPets[petId] };
                        p.stats = {
                            fullness: Math.max(0, p.stats.fullness - hours * hungerPerHour),
                            cleanliness: Math.max(0, p.stats.cleanliness - hours * cfg.cleanlinessPerHour),
                            mood: Math.min(100, p.stats.mood + hours * cfg.moodPerHour),
                        };
                        p.lastInteraction = new Date().toISOString(); // 更新衰减基准
                        childPets[petId] = p;
                        return { ...prev, [childName]: childPets };
                    });
                }

                // 生成日志
                const lootSummary = h.generateLootSummary(result.items);
                const story = h.generateStory(adv.realmId, petName, lootSummary);

                const logEntry = {
                    id: `adv-${Date.now()}`,
                    realmId: adv.realmId,
                    realmName: realm.name,
                    realmIcon: realm.icon,
                    petId,
                    petName,
                    startTime: adv.startTime,
                    endTime: Date.now(),
                    items: result.items,
                    totalGold: result.totalGold,
                    totalXP: result.totalXP,
                    totalStars: result.totalStars,
                    event: result.event ? { name: result.event.name, icon: result.event.icon, desc: result.event.desc } : null,
                    story,
                    completionRate,
                    gateMultiplier,
                };

                setPetAdventureLog(prev => {
                    const childLog = [...(prev[childName] || [])];
                    childLog.unshift(logEntry);
                    if (childLog.length > cfg.logRetention) childLog.length = cfg.logRetention;
                    return { ...prev, [childName]: childLog };
                });

                // 更新统计
                setPetAdventureStats(prev => {
                    const childStats = { ...(prev[childName] || {}) };
                    childStats.totalGoldEarned = (childStats.totalGoldEarned || 0) + result.totalGold;
                    childStats.totalXPEarned = (childStats.totalXPEarned || 0) + result.totalXP;
                    childStats.totalStarsEarned = (childStats.totalStarsEarned || 0) + result.totalStars;
                    return { ...prev, [childName]: childStats };
                });

                // 更新探险状态为已完成（数组内元素替换）
                setPetAdventures(prev => {
                    const arr = Array.isArray(prev[childName]) ? prev[childName] : [];
                    return { ...prev, [childName]: arr.map(a => a.id === adv.id ? { ...a, status: 'completed', result: logEntry } : a) };
                });
                triggerSyncUpload();

                // 交互反馈与撒花庆祝
                if (showFeedback) {
                    if (typeof window !== 'undefined' && window.confetti) {
                        window.confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
                    }
                    const rewardParts = [];
                    if (result.totalGold > 0) rewardParts.push(`+${result.totalGold}💰`);
                    if (result.totalXP > 0) rewardParts.push(`+${result.totalXP}✨`);
                    if (result.totalStars > 0) rewardParts.push(`+${result.totalStars}⭐`);
                    if (result.items && result.items.length > 0) {
                        const nonTraps = result.items.filter(i => !i.isTrap);
                        rewardParts.push(`${nonTraps.length}件宝物`);
                    }
                    const summary = rewardParts.join(' ');
                    showToast(`🎉 探险完成！「${petName}」历练归来！${summary ? `收获：${summary}` : ''}`);
                }

                // 触发成就检查
                if (typeof checkAchievements === 'function') {
                    checkAchievements('adventure_complete', { realmId: adv.realmId, petId, totalGold: result.totalGold, totalXP: result.totalXP, totalStars: result.totalStars });
                }

                // AI 冒险故事生成（异步，不阻塞完成流程）
                if (aiEnabled && deepseekApiKey) {
                    const personality = petPersonalities[petId] || {};
                    const itemNames = result.items.filter(i => !i.isTrap).map(i => i.name).join('、');
                    const trapNames = result.items.filter(i => i.isTrap).map(i => i.name).join('、');
                    const aiPrompt = `你是一个儿童冒险故事讲述者。请用生动有趣的语言讲述一段50字以内的冒险故事。

角色：${petName}（${personality.personality || '可爱勇敢'}，说话风格：${personality.speech_style || '可爱'}）
冒险领域：${realm.name}（${realm.desc}）
获得物品：${itemNames || '无'}
${trapNames ? `遇到陷阱：${trapNames}` : ''}
${result.event ? `奇遇事件：${result.event.name}（${result.event.desc}）` : ''}
总收获：${result.totalGold}金元宝、${result.totalXP}经验、${result.totalStars}星星

要求：
- 生动有趣，适合孩子阅读
- 融入宠物性格特点
- 提到获得的物品
- 50字以内，不要引号`;
                    const entryId = logEntry.id;
                    callDeepSeekAPI(aiPrompt, '讲述这段冒险故事', []).then(aiStory => {
                        if (aiStory) {
                            // 更新冒险日志中的故事
                            setPetAdventureLog(prev => {
                                const childLog = (prev[childName] || []).map(e => e.id === entryId ? { ...e, story: aiStory } : e);
                                return { ...prev, [childName]: childLog };
                            });
                            // 更新已完成探险卡片中的故事
                            setPetAdventures(prev => {
                                const arr = Array.isArray(prev[childName]) ? prev[childName] : [];
                                return { ...prev, [childName]: arr.map(a => a.id === adv.id && a.result ? { ...a, result: { ...a.result, story: aiStory } } : a) };
                            });
                        }
                    });
                }
                return logEntry;
            }, [petAdventures, petData, checkins, wheelHistory, tasks, currentXP, petCatalog, petElements, adventureHelpers, adventureConfig, adventureRealms, setWheelHistory, setXpHistory, setStarHistory, setPetData, setPetAdventureLog, setPetAdventureStats, setPetAdventures, checkAchievements, aiEnabled, deepseekApiKey, callDeepSeekAPI, showToast]);

            window.handleCompleteAdventure = handleCompleteAdventure;

            // 自动检测探险完成（遍历所有 active 探险）
            const completingAdvRef = React.useRef(new Set());
            useEffect(() => {
                const advArr = Array.isArray(petAdventures[deferredActiveChild]) ? petAdventures[deferredActiveChild] : [];
                const activeAdvs = advArr.filter(a => a.status === 'active' && !completingAdvRef.current.has(a.id));
                if (!activeAdvs.length) return;

                const timers = activeAdvs.map(adv => {
                    const remaining = adv.expectedEndTime - Date.now();
                    if (remaining <= 0) {
                        completingAdvRef.current.add(adv.id);
                        handleCompleteAdventure(deferredActiveChild, adv.id);
                        return null;
                    }
                    return setTimeout(() => {
                        completingAdvRef.current.add(adv.id);
                        handleCompleteAdventure(deferredActiveChild, adv.id);
                    }, remaining + 1000);
                });

                return () => timers.forEach(t => t && clearTimeout(t));
            }, [petAdventures, deferredActiveChild, handleCompleteAdventure]);

            // 立即召回探险（放弃，不获得奖励，星星不退还，记录 cancelled 墓碑状态同步云端）
            const handleCancelAdventure = useCallback((adventureId) => {
                const advArr = Array.isArray(petAdventures[deferredActiveChild]) ? petAdventures[deferredActiveChild] : [];
                const adv = adventureId ? advArr.find(a => a.id === adventureId) : advArr.find(a => a.status === 'active');
                if (!adv || adv.status !== 'active') return;

                const pet = petData[deferredActiveChild]?.[adv.petId];
                const petName = pet?.nickname || adv.petId;
                if (!confirm(`确定要召回「${petName}」吗？\n\n已消耗的星星不会退还，探险奖励将被放弃。`)) return;

                setPetAdventures(prev => {
                    const arr = Array.isArray(prev[deferredActiveChild]) ? prev[deferredActiveChild] : [];
                    return { ...prev, [deferredActiveChild]: arr.map(a => a.id === adv.id ? { ...a, status: 'cancelled', cancelledAt: Date.now() } : a) };
                });
                if (typeof window !== 'undefined' && typeof window.triggerSyncUpload === 'function') {
                    window.triggerSyncUpload();
                }
                showToast(`${petName} 已召回`);
            }, [deferredActiveChild, petAdventures, petData, setPetAdventures, showToast]);

            // 收下/移除已完成探险卡片（标记 claimed 墓碑状态并同步上云，彻底防止死灰复燃）
            const handleDismissAdventure = useCallback((childName, adventureId) => {
                if (!childName || !adventureId) return;
                setPetAdventures(prev => {
                    const arr = Array.isArray(prev[childName]) ? prev[childName] : [];
                    return {
                        ...prev,
                        [childName]: arr.map(a => a.id === adventureId ? { ...a, status: 'claimed', claimedAt: Date.now() } : a)
                    };
                });
                if (typeof window !== 'undefined' && typeof window.triggerSyncUpload === 'function') {
                    window.triggerSyncUpload();
                }
            }, [setPetAdventures]);

            // 一键收下所有已完成探险
            const handleDismissAllAdventures = useCallback((childName) => {
                if (!childName) return;
                setPetAdventures(prev => {
                    const arr = Array.isArray(prev[childName]) ? prev[childName] : [];
                    return {
                        ...prev,
                        [childName]: arr.map(a => (a.status === 'completed' || (a.status === 'active' && Date.now() >= a.expectedEndTime))
                            ? { ...a, status: 'claimed', claimedAt: Date.now() }
                            : a
                        )
                    };
                });
                if (typeof window !== 'undefined' && typeof window.triggerSyncUpload === 'function') {
                    window.triggerSyncUpload();
                }
            }, [setPetAdventures]);

            // 辅助函数：从key中提取13位时间戳
            const extractTimestamp = (key) => {
                const match = key.match(/-(\d{13})$/);
                return match ? parseInt(match[1], 10) : NaN;
            };

            const transactions = useMemo(() => {
                let list = [];
                // 1. 任务打卡奖励（含投资倍率）
                const childTasks = tasks[deferredActiveChild] || [];
                const childBuffs = activeBuffs[deferredActiveChild] || {};
                const today = getLocalDateKey(0);
				const childCheckins = checkins[deferredActiveChild] || {}; 
                
                childTasks.forEach(task => {
                    const taskRecord = childCheckins[task.id] || {};
                    Object.keys(taskRecord).forEach(date => {
                        // 检查该日期是否在投资卡生效期内
						// 【新增】如果历史账单里有记录，说明已经固化了，这里不生成动态记录，防止重复
                        const historyKey = `${deferredActiveChild}-TASK-${task.id}-${date}`;
						if (wheelHistory[historyKey]) return;
						
                        let multiplier = 1;
                        // 【修改】与 calculateTotalGold 一致：缺 investStart 时用过期日-30天 推算，兼容旧存档
                        const effectiveStart = childBuffs.investStart || (childBuffs.investExpire ? dateKeySubtractDays(childBuffs.investExpire, 30) : getLocalDateKey(0));
                        if (childBuffs.investMultiplier > 1 && childBuffs.investExpire && date <= childBuffs.investExpire && date >= effectiveStart) {
							multiplier = childBuffs.investMultiplier;
						}
                        const reward = task.reward * multiplier;
                        list.push({ id: `task-${task.id}-${date}`, date: date, name: `打卡：${task.name}${multiplier > 1 ? ` (x${multiplier})` : ''}`, amount: reward, type: 'income' });
                    });
                    // 每日必做/每周选做的完成奖励在周学习工资中体现，不在此处生成完赛奖励记录
                    const freq = task.frequencyType || 'count';
                    if (freq === 'count') {
                        const completedDates = Object.keys(taskRecord).sort();
                        if (completedDates.length >= (task.targetCount || 0)) {
                             const completionDate = completedDates[(task.targetCount || 1) - 1];
                             list.push({ id: `bonus-${task.id}`, date: completionDate, name: `完赛奖励：${task.name}`, amount: task.completedReward || 0, type: 'income' });
                        }
                    }
                });

                Object.entries(wheelHistory).forEach(([key, value]) => {
                    if (!key.startsWith(deferredActiveChild)) return;
                    let date, name, type;
                    if (key.includes('EVIL')) {
                        const ts = extractTimestamp(key);
                        date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                        name = '邪恶大转盘';
                        type = 'expense';
                    } else if (key.includes('EVENT')) {
                        // 随机事件/历史事件的交易记录解析（历史事件显示完整标题）
                        const ts = extractTimestamp(key);
                        date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                        const eventId = key.match(/-([^-]+)-\d{13}$/)?.[1] || '';
                        const histEvents = (typeof HISTORICAL_EVENTS !== 'undefined') ? HISTORICAL_EVENTS : [];
                        const histEvent = histEvents.find(e => e.id === eventId);
                        const randEvent = RANDOM_EVENTS.find(e => e.id === eventId);
                        if (histEvent) name = `历史事件(金币)：${histEvent.title}`;
                        else if (randEvent) name = `奇遇(金币)：${randEvent.title}`;
                        else name = '时空奇遇';
                        type = 'income';
					} else if (key.includes('EXTRA')) { 
						// 处理额外奖励的显示
						const ts = extractTimestamp(key);
						date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
						name = '额外惊喜大转盘奖励'; // 这里定义明细中显示的名字
						type = 'income';
                    } else if (key.includes('SHOP')) {
                         const itemId = key.match(/-([^-]+)-\d{13}$/)?.[1] || '';
                         const ts = extractTimestamp(key);
                         date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                         const item = SHOP_ITEMS.find(i => i.id === itemId);
                         name = item ? `购买：${item.name}` : '集市消费';
                         type = 'expense';
                    } else if (key.includes('BOX_GOLD')) {
                         const ts = extractTimestamp(key);
                         date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                         name = '盲盒大奖';
                         type = 'income';
                    } else if (key.includes('SKIP')) {
                         const taskId = key.match(/^[^-]+-[^-]+-([^-\d]+)/)?.[1] || '';
                         const ts = extractTimestamp(key);
                         date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                         const task = (tasks[deferredActiveChild]||[]).find(t => t.id === taskId);
                         name = task ? `免做金牌：${task.name}` : '免做金牌奖励';
                         type = 'income';
                    } else if (key.includes('GIFT')) {
                         const ts = extractTimestamp(key);
                         date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                         name = '收到友好邻邦红包';
                         type = 'income';
					// ==================== 【新增这两段进贡解析】 ====================
					} else if (key.includes('TRIBUTE_IN')) {
						const parts = key.split('-');
						const fromName = parts[2]; // 提取是从谁那里收到的
						const ts = extractTimestamp(key);
						date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
						name = `收到 ${fromName} 进贡`;
						type = 'income';
					} else if (key.includes('TRIBUTE_OUT')) {
						const parts = key.split('-');
						const targetName = parts[2]; // 提取是进贡给谁的
						const ts = extractTimestamp(key);
						date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
						name = `向 ${targetName} 进贡`;
						type = 'expense';	 
					} else if (key.includes('PARENT_REWARD')) {
						// 家长爱心红包：Child-PARENT_REWARD-operator-timestamp 或 Child-PARENT_REWARD-operator__reason-timestamp
						const ts = extractTimestamp(key);
						date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
						if (key.includes('__')) {
							const parts = key.split('__');
							const headParts = parts[0].split('-PARENT_REWARD-');
							const op = headParts[1] || '家长';
							const tail = parts[1] || '';
							const rawReason = tail.replace(/-\d{13}$/, '');
							let cleanReason = '';
							try {
								cleanReason = decodeURIComponent(rawReason);
							} catch (e) {
								cleanReason = rawReason;
							}
							name = cleanReason ? `🧧 收到【${op}】红包：${cleanReason}` : `🧧 收到【${op}】红包`;
						} else {
							const parts = key.split('-PARENT_REWARD-');
							const rest = parts[1] || '';
							const op = rest.replace(/-\d{13}$/, '') || '家长';
							name = `🧧 收到【${op}】红包`;
						}
						type = 'income';
					} else if (key.includes('WEEKEND')) {
                        const ts = extractTimestamp(key);
                        date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                        name = '周末冲刺奖励';
                        type = 'income';
                    } else if (key.includes('WEEKLY_PAY')) {
                        // 周学习工资记录：Child-WEEKLY_PAY-YYYY-MM-DD_YYYY-MM-DD-timestamp
                        const weekMatch = key.match(/(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})/);
                        const ts = extractTimestamp(key);
                        date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                        if (weekMatch) {
                            const startStr = weekMatch[1];
                            const endStr = weekMatch[2];
                            const fmt = (s) => {
                                const mm = s.slice(5, 7);
                                const dd = s.slice(8, 10);
                                return `${parseInt(mm)}月${parseInt(dd)}日`;
                            };
                            name = `周学习工资：${fmt(startStr)} - ${fmt(endStr)}`;
                        } else {
                            name = '周学习工资';
                        }
                        type = 'income';
					// 【新增】解析打卡固化记录，让明细显示正确的名字
                    } else if (key.includes('TASK')) {
                         // key格式: Child-TASK-TaskId-YYYY-MM-DD 或 Child-TASK-TaskId-YYYY-MM-DD_timestamp

						// 【修复】支持多次打卡的 _timestamp 后缀
						const dateMatch = key.match(/(\d{4}-\d{2}-\d{2})_(\d{13})$/);
						const simpleDateMatch = key.match(/(\d{4}-\d{2}-\d{2})$/);
						const dateStr = dateMatch ? dateMatch[1] : (simpleDateMatch ? simpleDateMatch[1] : key.slice(-10));
						const isMulti = !!dateMatch;

						// TaskId：从 "-TASK-" 后面、日期前面的部分提取（兼容 _timestamp 后缀）
						const taskId = key.split('-TASK-')[1]?.replace(/-?\d{4}-\d{2}-\d{2}(_\d{13})?$/, '') || '';

						date = dateStr;
                         const task = (tasks[deferredActiveChild]||[]).find(t => t.id === taskId);
                         // 计算倍率用于显示：如果金额除以基础奖励 > 1，说明有加成
                         let label = task ? `打卡：${task.name}` : '任务打卡';
                         if (task && value > task.reward) {
                             const mult = Math.round(value / task.reward);
                             label += ` (x${mult})`;
                         }
                         if (isMulti) label += ' 📚';
                         name = label;
                         type = 'income';
} else if (key.includes('BONUS_MULTI') && key.indexOf('-BONUS_MULTI-') > 0) {
                        // 多次打卡连击奖励 BONUS_MULTI
						const dateMatch2 = key.match(/(\d{4}-\d{2}-\d{2})/);
						date = dateMatch2 ? dateMatch2[1] : '';
						const btId = key.split('-BONUS_MULTI-')[1]?.split('-')[0] || '';
						const btTask = (tasks[deferredActiveChild]||[]).find(t => t.id === btId);
						name = btTask ? `连击奖励：${btTask.name}` : '连击奖励';
						} else if (key.includes('HOMEWORK') && !key.includes('REVOKE')) {
                        if (key.includes('__')) {
                            const parts = key.split('__');
                            const head = parts[0] || '';
                            const ts = extractTimestamp(head);
                            date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                            name = parts.length >= 3 ? `作业奖励：${parts[1]} · ${parts[2]}` : '作业奖励';
                        } else {
                            const ts = extractTimestamp(key);
                            date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                            name = '作业奖励';
                        }
                        type = 'income';
                    } else if (key.includes('EXAM') && !key.includes('REVOKE')) {
                        if (key.includes('__')) {
                            const parts = key.split('__');
                            const head = parts[0] || '';
                            const ts = extractTimestamp(head);
                            date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                            name = parts.length >= 3 ? `考试奖励：${parts[1]} · ${parts[2]}` : '考试奖励';
                        } else {
                            const ts = extractTimestamp(key);
                            date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                            name = '考试奖励';
                        }
                        type = 'income';
                    } else if (key.includes('HOMEWORK-REVOKE') || key.includes('EXAM-REVOKE')) {
                        const ts = extractTimestamp(key);
                        date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                        name = key.includes('EXAM') ? '收回-考试奖励' : '收回-作业奖励';
                        type = 'expense';
                    } else if (key.includes('REFUND')) {
                        // 退款类型处理
                        const ts = extractTimestamp(key);
                        date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                        name = '退款';
                        type = value >= 0 ? 'income' : 'expense';
                    } else if (key.includes('ADVENTURE_GOLD')) {
                        const ts = extractTimestamp(key);
                        date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                        const realmId = key.match(/-ADVENTURE_GOLD-([^-]+)-/)?.[1] || '';
                        const realm = adventureRealms.find(r => r.id === realmId);
                        name = `探险归来：${realm ? realm.name : '探险'}`;
                        type = 'income';
                    } else if (key.includes('-EARLY-')) {
                        // 提前达成完赛奖励
                        const parts = key.split('-EARLY-');
                        const taskId = parts[1] ? parts[1].replace(/-\d+$/, '') : '';
                        const earlyTask = childTasks.find(t => t.id === taskId);
                        const ts = extractTimestamp(key);
                        date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                        name = earlyTask ? `完赛奖励：${earlyTask.name}` : '完赛奖励';
                        type = 'income';
                    } else if (key.includes('EXCHANGE')) {
                        // key 格式: child-EXCHANGE-ex_timestamp_random
                        const tsMatch = key.match(/ex_(\d{13})/);
                        const ts = tsMatch ? parseInt(tsMatch[1], 10) : NaN;
                        date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                        name = '兑换零花钱';
                        type = 'expense';
                    } else {
                        // 尝试提取日期或时间戳
                        const dateMatch = key.match(/(\d{4}-\d{2}-\d{2})$/);
                        if (dateMatch) {
                            date = dateMatch[1];
                        } else {
                            const ts = extractTimestamp(key);
                            date = isNaN(ts) ? '' : tsToLocalDateKey(ts);
                        }
                        name = '惊喜大转盘';
                        type = value >= 0 ? 'income' : 'expense';
                    }
                    list.push({ id: key, date: date, name: name, amount: value, type: type });
                });

                // 过滤无效日期并按日期排序
                const validList = list.filter(t => t.date && t.date.match(/\d{4}-\d{2}-\d{2}/));
                return validList.sort((a, b) => new Date(b.date) - new Date(a.date));
            }, [tasks, checkins, wheelHistory, deferredActiveChild, activeBuffs, adventureRealms]);

            // --- 经验值明细列表 (新) ---
            const xpTransactions = useMemo(() => {
                let list = [];
                const childCheckins = checkins[deferredActiveChild] || {};
                const childTasks = tasks[deferredActiveChild] || [];
                
                // 1. 打卡经验
                childTasks.forEach(task => {
                    const taskRecord = childCheckins[task.id] || {};
                    Object.keys(taskRecord).forEach(date => {
                        const isRepair = !!(repairedCheckins[deferredActiveChild]?.[task.id]?.[date]);
                        list.push({ id: `checkin-${task.id}-${date}`, date: date, name: `打卡：${task.name}`, amount: 10, isRepair });
                    });
                });

                // 2. 财富转化 (按金元宝记录显示转化) - 仅显示收入
                transactions.forEach(t => {
                    if (t.type === 'income') {
                        list.push({ id: `xp-wealth-${t.id}`, date: t.date, name: `财富转化：${t.name}`, amount: t.amount });
                    }
                });

                // 3. 成就经验
                const childAch = achievements[deferredActiveChild] || {};
                Object.entries(childAch).forEach(([achId, date]) => {
                    const badge = BADGES.find(b => b.id === achId);
                    if (badge) {
                        let amount = 0;
                        if (badge.rarity === 'common') amount = 50;
                        else if (badge.rarity === 'rare') amount = 200;
                        else if (badge.rarity === 'epic') amount = 800;
                        else if (badge.rarity === 'legendary') amount = 3000;
                        list.push({ id: `xp-ach-${achId}`, date: date, name: `解锁徽章：${badge.name}`, amount: amount });
                    }
                });

                // 4. 纯XP奇遇
                Object.entries(xpHistory).forEach(([key, value]) => {
                    if (!key.startsWith(deferredActiveChild)) return;
                    let name = '额外经验';
                    const parts = key.split('-');
                    const ts = parseInt(parts[parts.length-1]);
                    const date = tsToLocalDateKey(ts);
                    if (key.includes('EVENT')) {
                         const eventId = parts[2];
                         const histEvents = (typeof HISTORICAL_EVENTS !== 'undefined') ? HISTORICAL_EVENTS : [];
                         const histEvent = histEvents.find(e => e.id === eventId);
                         const randEvent = RANDOM_EVENTS.find(e => e.id === eventId);
                         if (histEvent) name = `历史事件：${histEvent.title}`;
                         else if (randEvent) name = `奇遇：${randEvent.title}`;
                         else name = '时空奇遇';
                    } else if (key.includes('BUFF_XP')) {
                         name = '双倍符加成';
                    } else if (key.includes('BOX_XP')) {
                         name = '盲盒经验包';
                    } else if (key.includes('XP_WHEEL')) {
						 name = '经验值大转盘';
					} else if (key.includes('ADVENTURE_XP')) {
                         const realmId = parts[2];
                         const realm = adventureRealms.find(r => r.id === realmId);
                         name = `探险经验：${realm ? realm.name : '探险'}`;
					}
                    list.push({ id: key, date: date, name: name, amount: value });
                });

                return list.sort((a, b) => new Date(b.date) - new Date(a.date));
            }, [transactions, achievements, deferredActiveChild, xpHistory, checkins, tasks, repairedCheckins, adventureRealms]);
            
            const currentLevelInfo = getLevelInfo(currentXP);

            // 升级监听逻辑
            useEffect(() => {
                if (!activeChild) return;
                const levelInfo = getLevelInfo(currentXP);
                const lastNotifiedLevel = notifiedLevels[activeChild] || 0;
                
                if (levelInfo.level > lastNotifiedLevel) {
                    if (lastNotifiedLevel === 0 && levelInfo.level > 1) {
                         // 首次加载且等级>1，静默更新
                         setNotifiedLevels(prev => ({...prev, [activeChild]: levelInfo.level}));
                    } else if (levelInfo.level > lastNotifiedLevel) {
                         setLevelUpQueue(prev => [...prev, levelInfo]);
                         setNotifiedLevels(prev => ({...prev, [activeChild]: levelInfo.level}));
                         confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
                         
                         // 记录大事纪：升级
                         const todayDate = getLocalDateKey(0);
                         setMilestones(prev => [...prev, {
                             id: `levelup-${levelInfo.level}-${Date.now()}`,
                             type: 'levelup',
                             date: todayDate,
                             timestamp: Date.now(),
                             member: activeChild,
                             title: `升级至 Lv.${levelInfo.level}`,
                             description: `进化为「${levelInfo.name}」 - ${levelInfo.era}`,
                             level: levelInfo.level,
                             era: levelInfo.era,
                             icon: '⬆️'
                         }]);
						 // 🟢【新增】升级时立即检查成就！
						// 这样当 currentXP 更新导致进入新纪元时，"时代领航者" 会立即弹出
						checkAchievements('levelup');
                    }
                }
            }, [currentXP, activeChild]); // 依赖 activeChild 确保切换孩子时逻辑正确

            const updateStats = (childId, type, value = 1, extraData = {}) => {
					setStats(prev => {
						const childStats = prev[childId] || {};
						const newStats = { ...childStats };

						if (type === 'checkin') {
							// 1. 基础打卡计数
							newStats.totalCheckins = (newStats.totalCheckins || 0) + 1;
							
							// 2. 学科分类计数 (根据任务名自动判断)
							const taskName = extraData.taskName || '';
							if (taskName.includes('语文') || taskName.includes('阅读') || taskName.includes('作文') || taskName.includes('写字')) newStats.subject_chinese = (newStats.subject_chinese || 0) + 1;
							if (taskName.includes('数学') || taskName.includes('口算') || taskName.includes('算术')) newStats.subject_math = (newStats.subject_math || 0) + 1;
							if (taskName.includes('英语') || taskName.includes('听力') || taskName.includes('单词')) newStats.subject_english = (newStats.subject_english || 0) + 1;
							if (taskName.includes('科学') || taskName.includes('科')) newStats.subject_science = (newStats.subject_science || 0) + 1;
						
							// 3. 单日打卡量 (用于“三头六臂”)
							const dateKey = extraData.dateKey || getLocalDateKey(0);
							const dailyCountKey = `daily_count_${dateKey}`;
							newStats[dailyCountKey] = (newStats[dailyCountKey] || 0) + 1;

							// 4. 7:00 前打卡次数 (用于“黎明骑士”：早上7:00前完成任意一次打卡)
							const hour = new Date().getHours();
							if (hour < 7) {
								newStats.early_bird_count = (newStats.early_bird_count || 0) + 1;
							}
						}

						if (type === 'gold_earn') {
							// 5. 单日收益 (用于“一夜暴富”)
							const dateKey = extraData.dateKey || getLocalDateKey(0);
							const dailyGoldKey = `daily_gold_${dateKey}`;
							newStats[dailyGoldKey] = (newStats[dailyGoldKey] || 0) + value;
							
							// 6. 投资收益统计
							if (extraData.source === 'invest_bonus') {
								newStats.invest_earnings = (newStats.invest_earnings || 0) + value;
							}
						}

						if (type === 'gold_spend') {
							// 7. 累计消费 (用于“挥金如土”)
							newStats.total_spent = (newStats.total_spent || 0) + value;
						}

						if (type === 'repair') {
							// 8. 补签次数 (用于“补救大师”)
							newStats.repair_count = (newStats.repair_count || 0) + 1;
						}

						return { ...prev, [childId]: newStats };
					});
				};

				if (typeof window !== 'undefined') {
					window.updateStats = updateStats;
					window.__tier6_debug = {
						openPet: (tab = 'home') => handleOpenPet(tab),
						openAchievements: () => setShowAchievements(true),
						openOracle: () => setShowOracleCarveModal(true),
						openHomework: () => setShowHomeworkExamModal(true),
						openRandomEvent: (ev) => {
							setCurrentRandomEvent(ev);
							setShowRandomEvent(true);
						}
					};
					window.__tier7_debug = {
						openPet: (tab = 'home') => handleOpenPet(tab),
						closePet: () => setShowPet(false),
						openWeekendSettlement: (state) => setSettlementState(state),
						openFamilyMessage: (msgs) => {
							if (msgs) setFamilyMessages(msgs);
							setWecomEnabled(true);
							setSyncCode(prev => prev || 'DEMO_SYNC');
							setShowFamilyPanel(true);
						},
						closeFamilyMessage: () => setShowFamilyPanel(false),
						openChatDrawer: () => {
							setAiChatEnabled(true);
							setShowChatDrawer(true);
						},
						closeChatDrawer: () => setShowChatDrawer(false),
						openSettings: (tab = 'parent') => {
							setSettingsInitialTab(typeof tab === 'string' ? tab : 'parent');
							setShowSettings(true);
						},
						closeSettings: () => setShowSettings(false),
						openReadingPavilion: () => setShowReadingPavilion(true),
						closeReadingPavilion: () => setShowReadingPavilion(false),
						openReadingCheckin: (task) => {
							setReadingTaskForCheckin(task || activeReadingTasks[0]);
							setShowReadingQuickCheckin(true);
						},
						closeReadingCheckin: () => setShowReadingQuickCheckin(false)
					};
				}
			
			// --- 商店购买逻辑 (修复版：增加弹窗 + 强制状态更新) ---
            const handleBuyItem = React.useCallback((item, finalPrice, quantity = 1) => {
                const totalCost = finalPrice * quantity;
                if (totalGold < totalCost) {
                    showToast('warning', '余额不足，无法购买！');
                    return;
                }
                const historyKey = `${activeChild}-SHOP-${item.id}-${Date.now()}`;
                const newWheelHistory = { ...wheelHistory, [historyKey]: -totalCost };
                setWheelHistory(newWheelHistory);
                updateStats(activeChild, 'gold_spend', totalCost);
                setInventory(prev => {
                    const currentAll = { ...prev };
                    const childInv = { ...(currentAll[activeChild] || {}) };
                    const oldQuantity = childInv[item.id] || 0;
                    childInv[item.id] = oldQuantity + quantity;
                    currentAll[activeChild] = childInv;
                    return currentAll;
                });
                checkAchievementsRef.current('spend', {}, { wheelHistory: newWheelHistory });
                if (item.type === 'cosmetic_confetti') {
                    setStats(prev => ({
                        ...prev,
                        [activeChild]: {
                            ...(prev[activeChild] || {}),
                            premiumConfetti: true
                        }
                    }));
                    setInventory(prev => {
                        const childInv = prev[activeChild] || {};
                        return {
                            ...prev,
                            [activeChild]: {
                                ...childInv,
                                [item.id]: 1
                            }
                        };
                    });
                    fireRoyalSalute();
                    setTimeout(() => {
                        showToast('success', `${item.name}已自动激活！每次打卡将触发豪华特效！`, {duration: 3000});
                    }, 100);
                    triggerSyncUpload();
                    return;
                }
                confetti({ particleCount: quantity > 1 ? 80 : 50, spread: quantity > 1 ? 60 : 40, origin: { y: 0.5 }, colors: ['#fbbf24'] });
                triggerSyncUpload();
            }, [totalGold, activeChild, wheelHistory, updateStats, fireRoyalSalute]);

            // --- 甲骨文传书刻录提交处理 ---
            const handleCarveOracleMessage = (messageText) => {
                if (!messageText || !messageText.trim()) return;
                const cleanText = messageText.trim().slice(0, 30);

                // 扣除背包中的传书道具 1 卷
                setInventory(prev => {
                    const childInv = prev[activeChild] || {};
                    const newCount = (childInv['item_message'] || 0) - 1;
                    if (newCount < 0) return prev;
                    const newInv = { ...childInv, ['item_message']: newCount };
                    if (newCount === 0) delete newInv['item_message'];
                    return { ...prev, [activeChild]: newInv };
                });

                const newMessage = {
                    id: Date.now(),
                    text: cleanText,
                    author: activeChild,
                    expire: Date.now() + 24 * 60 * 60 * 1000,
                    timestamp: Date.now(),
                    blessings: 0,
                    blessedBy: {}
                };

                setGlobalMessages(prev => {
                    const validMsgs = (prev || []).filter(m => m.expire > Date.now());
                    return [newMessage, ...validMsgs];
                });

                confetti({ particleCount: 70, spread: 60, colors: ['#f59e0b', '#d97706', '#991b1b', '#fef3c7'] });
                showToast('success', '刻录成功！甲骨卜辞已奉上展台，将流传24小时。');
                setShowOracleCarveModal(false);
            };

            // --- 道具使用逻辑 ---
            const handleUseItem = (item) => {
                // 0. 装饰品逻辑：装备/卸下 (不消耗库存)
                // 【修改】加入 cosmetic_bg
                if (['cosmetic_frame', 'cosmetic_name', 'cosmetic_bg'].includes(item.type)) {
                    setEquippedGear(prev => {
                        const childGear = prev[activeChild] || {};
                        
                        let targetType = '';
                        // 映射 type 到存储 key
                        if (item.type === 'cosmetic_frame') targetType = 'frame';
                        else if (item.type === 'cosmetic_name') targetType = 'nameEffect';
                        else if (item.type === 'cosmetic_bg') targetType = 'background'; // 新增背景类型

                        // 检查当前点击的物品是否已经装备
                        const isCurrentlyEquipped = childGear[targetType] === item.id;
                        
                        return {
                            ...prev,
                            [activeChild]: {
                                ...childGear,
                                // 1. 装备/卸下逻辑：如果已装备则设为 null，否则设为 item.id
                                [targetType]: isCurrentlyEquipped ? null : item.id
                                // 注意：背景层独立于头像框和名字特效，互不冲突，所以不需要重置 otherType
                            }
                        };
                    });
                    return; 
                }

                // 静音卡：打开选择弹窗，不在此处消耗
                if (item.type === 'silence') {
                    setShowSilenceModal(true);
                    return;
                }

                // 甲骨文传书：打开刻录弹窗，不在此处消耗，刻录确认后再扣除
                if (item.type === 'message_board') {
                    setShowOracleCarveModal(true);
                    return;
                }

                // 消耗道具 (对于非装饰品)
                setInventory(prev => {
                    const childInv = prev[activeChild] || {};
                    const newCount = (childInv[item.id] || 0) - 1;
                    if (newCount < 0) return prev;
                    const newInv = { ...childInv, [item.id]: newCount };
                    if (newCount === 0) delete newInv[item.id];
                    return { ...prev, [activeChild]: newInv };
                });

                const today = getLocalDateKey(0);

                // 道具效果分发
                if (item.type === 'buff_xp_3') {
                    setActiveBuffs(prev => {
                        const existing = prev[activeChild] || {};
                        return { ...prev, [activeChild]: { ...existing, xpBoost: 2, xpBoostCount: (existing.xpBoostCount || 0) + 3 } };
                    });
                    showToast('success', '双倍丰收符已生效！接下来的3次打卡将获得双倍经验！');
                } 
                else if (item.type === 'extend_deadline') {
                    const taskName = prompt("请输入要延期的任务名称关键字：");
                    if (taskName) {
                        setTasks(prev => {
                            const newTasks = [...(prev[activeChild]||[])];
                            const taskIndex = newTasks.findIndex(t => t.name.includes(taskName));
                            if (taskIndex !== -1) {
                                const task = newTasks[taskIndex];
                                const currentDeadline = new Date((task.deadline || globalDates.end) + 'T12:00:00');
                                currentDeadline.setDate(currentDeadline.getDate() + 1);
                                newTasks[taskIndex] = { ...task, deadline: dateObjToLocalKey(currentDeadline) };
                                showToast('success', `截止日期已延长至 ${newTasks[taskIndex].deadline}`);
                                return { ...prev, [activeChild]: newTasks };
                            } else {
                                // 未找到任务：退还道具
                                setInventory(prev2 => {
                                    const childInv2 = prev2[activeChild] || {};
                                    return { ...prev2, [activeChild]: { ...childInv2, [item.id]: (childInv2[item.id] || 0) + 1 } };
                                });
                                showToast('error', '未找到匹配的任务，道具已返还。', {duration: 3000});
                                return prev;
                            }
                        });
                    } else {
                        // 用户取消：退还道具
                        setInventory(prev2 => {
                            const childInv2 = prev2[activeChild] || {};
                            return { ...prev2, [activeChild]: { ...childInv2, [item.id]: (childInv2[item.id] || 0) + 1 } };
                        });
                        showToast('info', '已取消，道具已返还。');
                    }
                }
                else if (item.type === 'box') {
                    const roll = Math.random();
                    if (roll < 0.4) {
                        const reward = 1;
                        const key = `${activeChild}-BOX_GOLD-${Date.now()}`;
                        const newHistory = { ...wheelHistory, [key]: reward };
                        setWheelHistory(newHistory);
                        updateStats(activeChild, 'gold_earn', reward, { source: 'box', dateKey: today });
                        checkAchievements('lucky_spin', {}, { wheelHistory: newHistory }); 
                        showToast('info', '谢谢惠顾... 获得了 1 金元宝安慰奖。');
                    } else if (roll < 0.7) {
                        const reward = 20;
                        const key = `${activeChild}-BOX_XP-${Date.now()}`;
                        setXpHistory(prev => ({ ...prev, [key]: reward }));
                        showToast('success', '运气不错！获得了 20 XP 经验包！');
                    } else if (roll < 0.9) {
                        setRedeemedCoupons(prev => ({...prev, [activeChild]: [...(prev[activeChild]||[]), {name: '神秘兑换券', icon: '🎫', date: today}]}));
                        showToast('success', '哇！开出了通用兑换券一张！');
                    } else {
                        const reward = 200;
                        const key = `${activeChild}-BOX_GOLD-${Date.now()}`;
                        const newHistory = { ...wheelHistory, [key]: reward };
                        setWheelHistory(newHistory);
                        updateStats(activeChild, 'gold_earn', reward, { source: 'box', dateKey: today });
                        checkAchievements('lucky_spin', {}, { wheelHistory: newHistory });
                        showToast('success', '传说级欧皇！开出了 200 金元宝！');
                    }
                }
                else if (item.type === 'real') {
                    if (item.id === 'real_screen') {
                        const now = new Date();
                        const day = now.getDay();
                        if (day !== 0 && day !== 6) {
                            showToast('warning', '屏幕时间加油包仅限周末使用，请在周六或周日再使用。');
                            return;
                        }
                        const todayKey = getLocalDateKey(0);
                        const list = redeemedCoupons[activeChild] || [];
                        const usedToday = list.filter(c => c.itemId === 'real_screen' && (c.usedAt && c.usedAt.slice(0, 10) === todayKey || c.date === todayKey)).length;
                        if (usedToday >= 1) {
                            showToast('warning', '屏幕时间加油包每天最多使用一次，今日已使用过。');
                            return;
                        }
                    }
                    const verifyCode = Math.random().toString().slice(2, 10);
                    const recordId = `real_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
                    setRedeemedCoupons(prev => ({
                        ...prev, 
                        [activeChild]: [...(prev[activeChild]||[]), {
                            id: recordId,
                            itemId: item.id,
                            name: item.name,
                            icon: item.icon,
                            date: today,
                            usedAt: new Date().toISOString(),
                            verified: false,
                            verifyCode,
                            verifiedAt: null,
                            verifiedDevice: null
                        }]
                    }));
                    setInventory(prev => {
                        const childInv = prev[activeChild] || {};
                        const n = Math.max(0, (childInv[item.id] || 0) - 1);
                        const next = { ...childInv, [item.id]: n };
                        if (n === 0) delete next[item.id];
                        return { ...prev, [activeChild]: next };
                    });
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#34d399'] });
                    showToast('success', `已使用 ${item.name}！请家长在兑换记录中核销。`, {duration: 4000});
                }
                else if (item.type === 'buy_stars') {
                    const amount = item.starAmount || 0;
                    if (amount > 0) {
                        setStarHistory(prev => ({ ...prev, [`${activeChild}-STAR_BUY-${item.id}-${Date.now()}`]: amount }));
                        confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 }, colors: ['#fbbf24', '#f59e0b'] });
                        showToast('success', `获得 ${amount} 颗星星！`);
                    }
                }
                else if (item.type === 'freeze') {
                    const freezeDate = today;
                    setStats(prev => ({
                        ...prev,
                        [activeChild]: {
                            ...(prev[activeChild] || {}),
                            freezeDates: [...((prev[activeChild]?.freezeDates) || []), freezeDate]
                        }
                    }));
                    confetti({ particleCount: 80, spread: 60, colors: ['#60a5fa', '#93c5fd', '#dbeafe'] });
                    showToast('success', `冰河世纪图腾已生效！${freezeDate} 将被冻结。`, {duration: 4000});
                }
                else if (item.type === 'alchemy') {
                    const xpGain = 500;
                    const key = `${activeChild}-ALCHEMY-${Date.now()}`;
                    setXpHistory(prev => ({ ...prev, [key]: xpGain }));
                    confetti({ particleCount: 120, spread: 90, colors: ['#a855f7', '#c084fc', '#e9d5ff'] });
                    showToast('success', '炼金术成功！已将100金元宝转化为500点经验值！');
                }
                else if (item.type === 'lucky_buff') {
                    setActiveBuffs(prev => ({ ...prev, [activeChild]: { ...(prev[activeChild]||{}), luckyBuff: true } }));
                    confetti({ particleCount: 100, spread: 80, colors: ['#22c55e', '#4ade80', '#86efac'] });
                    showToast('success', '幸运加持符已生效！下一次转盘将屏蔽最低档奖励！', {duration: 4000});
                }
                else if (item.type === 'parent_help') {
                    const verifyCode = Math.random().toString().slice(2, 10);
                    const recordId = `parent_help_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
                    setRedeemedCoupons(prev => ({
                        ...prev, 
                        [activeChild]: [...(prev[activeChild]||[]), {
                            id: recordId,
                            itemId: item.id,
                            name: item.name,
                            icon: item.icon,
                            date: today,
                            usedAt: new Date().toISOString(),
                            verified: false,
                            verifyCode,
                            verifiedAt: null,
                            verifiedDevice: null
                        }]
                    }));
                    setInventory(prev => {
                        const childInv = prev[activeChild] || {};
                        const n = Math.max(0, (childInv[item.id] || 0) - 1);
                        const next = { ...childInv, [item.id]: n };
                        if (n === 0) delete next[item.id];
                        return { ...prev, [activeChild]: next };
                    });
                    confetti({ particleCount: 80, spread: 60, colors: ['#8b5cf6', '#a78bfa'] });
                    showToast('success', '神笔马良体验券已使用！请家长在兑换记录中核销。', {duration: 4000});
                }
                else if (item.type === 'parent_monitor') {
                    const verifyCode = Math.random().toString().slice(2, 10);
                    const recordId = `parent_monitor_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
                    setRedeemedCoupons(prev => ({
                        ...prev, 
                        [activeChild]: [...(prev[activeChild]||[]), {
                            id: recordId,
                            itemId: item.id,
                            name: item.name,
                            icon: item.icon,
                            date: today,
                            usedAt: new Date().toISOString(),
                            verified: false,
                            verifyCode,
                            verifiedAt: null,
                            verifiedDevice: null
                        }]
                    }));
                    setInventory(prev => {
                        const childInv = prev[activeChild] || {};
                        const n = Math.max(0, (childInv[item.id] || 0) - 1);
                        const next = { ...childInv, [item.id]: n };
                        if (n === 0) delete next[item.id];
                        return { ...prev, [activeChild]: next };
                    });
                    confetti({ particleCount: 70, spread: 50, colors: ['#eab308', '#facc15'] });
                    showToast('success', '孔夫子的戒尺已使用！请家长在兑换记录中核销。', {duration: 4000});
                }
                else if (item.type === 'invest_multiplier') {
                    const multiplier = item.multiplier || 2;
                    const duration = item.duration || 3;
                    const existingBuffs = activeBuffs?.[activeChild] || {};
                    const existingMultiplier = existingBuffs.investMultiplier || 1;
                    const existingExpire = existingBuffs.investExpire || '';
                    const todayKey = getLocalDateKey(0);
                    // 检查是否有更高倍率的投资卡正在生效
                    if (existingMultiplier > multiplier && existingExpire && existingExpire >= todayKey) {
                        // 退还道具
                        setInventory(prev2 => {
                            const childInv2 = prev2[activeChild] || {};
                            return { ...prev2, [activeChild]: { ...childInv2, [item.id]: (childInv2[item.id] || 0) + 1 } };
                        });
                        showToast('warning', `已有 ${existingMultiplier}倍 投资卡生效中，不能使用较低倍率的卡。`, {duration: 4000});
                    } else {
                        setActiveBuffs(prev => ({
                            ...prev,
                            [activeChild]: {
                                ...(prev[activeChild] || {}),
                                investMultiplier: Math.max(multiplier, existingMultiplier),
                                investExpire: getLocalDateKey(item.duration),
                                investStart: getLocalDateKey(0)
                            }
                        }));
                        confetti({ particleCount: 150, spread: 120, colors: ['#f59e0b', '#fbbf24', '#fcd34d'] });
                        showToast('success', `${item.name}已生效！接下来${duration}天奖励${multiplier}倍！`, {duration: 4000});
                    }
                }
                else if (item.type === 'help_card') {
                    setRedeemedCoupons(prev => ({
                        ...prev, 
                        [activeChild]: [...(prev[activeChild]||[]), {name: item.name, icon: item.icon, date: today}]
                    }));
                    confetti({ particleCount: 60, spread: 50, colors: ['#06b6d4', '#22d3ee'] });
                    showToast('success', '诸葛锦囊已激活！请在兑换记录中向家长出示。', {duration: 4000});
                }
                else if (item.type === 'reduce_homework') {
                    setRedeemedCoupons(prev => ({
                        ...prev, 
                        [activeChild]: [...(prev[activeChild]||[]), {name: item.name, icon: item.icon, date: today}]
                    }));
                    confetti({ particleCount: 80, spread: 60, colors: ['#14b8a6', '#2dd4bf'] });
                    showToast('success', '听写豁免券已激活！今天的听写任务量减半！', {duration: 4000});
                }
                else if (item.type === 'cosmetic_confetti') {
                    setStats(prev => ({
                        ...prev,
                        [activeChild]: {
                            ...(prev[activeChild] || {}),
                            premiumConfetti: true
                        }
                    }));
                    confetti({ particleCount: 200, spread: 160, colors: ['#fbbf24', '#f59e0b', '#dc2626', '#7c3aed'] });
                    showToast('success', '皇家礼炮特效已永久升级！', {duration: 3000});
                }
                else if (item.type === 'cosmetic_theme') {
                    const targetTheme = item.targetTheme || item.id;
                    setStats(prev => ({
                        ...prev,
                        [activeChild]: {
                            ...(prev[activeChild] || {}),
                            unlockedThemes: Array.from(new Set([...((prev[activeChild]?.unlockedThemes) || []), targetTheme]))
                        }
                    }));
                    confetti({ particleCount: 150, spread: 120, colors: ['#06b6d4', '#ec4899', '#8b5cf6'] });
                    showToast('success', `${item.name}已解锁！请在主题试衣间中自由切换。`);
                }
                else if (item.type === 'unlock_theme') {
                    const targetTheme = item.targetTheme || 'dunhuang';
                    setStats(prev => ({
                        ...prev,
                        [activeChild]: {
                            ...(prev[activeChild] || {}),
                            unlockedThemes: Array.from(new Set([...((prev[activeChild]?.unlockedThemes) || []), targetTheme]))
                        }
                    }));
                    confetti({ particleCount: 200, spread: 140, colors: ['#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'] });
                    showToast('success', `${item.name}已解锁！请在主题试衣间中自由切换。`, {duration: 4000});
                }
                else if (item.type === 'challenge') {
                    const otherProfile = profiles.find(p => p.name !== activeChild);
                    const otherChild = otherProfile ? otherProfile.name : '其他成员';
                    const challengeText = prompt(`⚔️ 请输入挑战内容（例如：“谁先完成今天的数学口算”）：`)
                    if (challengeText && challengeText.trim()) {
                        setStats(prev => ({
                            ...prev,
                            activeChallenge: {
                                text: challengeText.trim(),
                                initiator: activeChild,
                                opponent: otherChild,
                                timestamp: Date.now()
                            }
                        }));
                        confetti({ particleCount: 100, spread: 80, colors: ['#ef4444', '#f97316'] });
                        showToast('success', `挑战已发起！请家长裁判。`, {duration: 4000});
                    } else {
                        showToast('info', '取消了挑战，道具已返还。');
                        setInventory(prev => {
                            const childInv = prev[activeChild] || {};
                            return { ...prev, [activeChild]: { ...childInv, [item.id]: (childInv[item.id] || 0) + 1 } };
                        });
                    }
                }
                else if (item.type === 'undo') {
                    // 1. 查找最近的一条购买记录 (SHOP 类型)
                    // 将历史记录按时间倒序排列
                    const historyKeys = Object.keys(wheelHistory).sort((a, b) => {
                        const timeA = parseInt(a.split('-').pop());
                        const timeB = parseInt(b.split('-').pop());
                        return timeB - timeA; 
                    });

                    // 找到属于当前孩子的最近一条购买记录
                    const lastShopKey = historyKeys.find(k => k.startsWith(`${activeChild}-SHOP-`));

                    if (!lastShopKey) {
                        showToast('error', '无法撤销：最近没有购买记录，或者记录已丢失。');
                        // 失败返还道具
                        setInventory(prev => {
                            const childInv = prev[activeChild] || {};
                            return { ...prev, [activeChild]: { ...childInv, [item.id]: (childInv[item.id] || 0) + 1 } };
                        });
                        return;
                    }

                    // 解析记录：activeChild-SHOP-itemId-timestamp
                    const parts = lastShopKey.split('-');
                    const targetItemId = parts[2];
                    const targetItem = SHOP_ITEMS.find(i => i.id === targetItemId);
                    const cost = Math.abs(wheelHistory[lastShopKey]); // 获取当时花费的金额

                    // 2. 检查该物品是否还在背包里 (如果已经用了就不能反悔)
                    if (!inventory[activeChild] || !inventory[activeChild][targetItemId] || inventory[activeChild][targetItemId] <= 0) {
                        showToast('error', '无法撤销：物品已不在背包中。', {duration: 4000});
                        // 失败返还道具
                        setInventory(prev => {
                            const childInv = prev[activeChild] || {};
                            return { ...prev, [activeChild]: { ...childInv, [item.id]: (childInv[item.id] || 0) + 1 } };
                        });
                        return;
                    }

                    // 3. 执行撤销
                    if (confirm(`⏮️ 确定要撤销购买 "${targetItem ? targetItem.name : '未知商品'}" 吗？\n\n执行后：\n1. 退还 ${cost} 金元宝\n2. 从背包收回该商品\n3. 消耗 1 瓶反悔药水`)) {
                         
                         const newHistory = { ...wheelHistory };
                         
                         // --- 核心修改开始 ---
                         // 旧逻辑：直接删除记录 (delete newHistory[lastShopKey])
                         // 新逻辑：保留记录但改名（防止再次被撤销），并增加退款记录
                         
                         // 1. 将原购买记录标记为“已撤销历史” (SHOP -> SHOP_REVOKED)
                         // 这样它还在列表里，但反悔药水不会再扫描到它，且金额维持负数
                         const revokedKey = lastShopKey.replace('-SHOP-', '-SHOP_REVOKED-');
                         delete newHistory[lastShopKey]; // 删除旧键
                         newHistory[revokedKey] = -cost; // 写入新键，保持负值
                         
                         // 2. 新增一笔退款记录 (类型为 REFUND，显示正数)
                         // 格式：child-REFUND-itemId-timestamp
                         // 这样明细里会显示该商品的图标，金额为绿色 +cost
                         const refundKey = `${activeChild}-REFUND-${targetItemId}-${Date.now()}`;
                         newHistory[refundKey] = cost;
                         // --- 核心修改结束 ---

                         setWheelHistory(newHistory);

                         // B. 从背包移除该商品 (保持不变)
                         setInventory(prev => {
                            const currentAll = { ...prev };
                            const childInv = { ...(currentAll[activeChild] || {}) };
                            
                            const newCount = (childInv[targetItemId] || 0) - 1;
                            if (newCount <= 0) delete childInv[targetItemId];
                            else childInv[targetItemId] = newCount;

                            currentAll[activeChild] = childInv;
                            return currentAll;
                         });

                         showToast('success', `撤销成功！退款 +${cost} 金元宝。`);
                    } else {
                         // 用户点了取消，返还反悔药水
                         setInventory(prev => {
                            const childInv = prev[activeChild] || {};
                            return { ...prev, [activeChild]: { ...childInv, [item.id]: (childInv[item.id] || 0) + 1 } };
                        });
                    }
                }
				else if (item.type === 'undo_advanced') {
                    // 1. 获取背包中除了“高级反悔药水”以外的所有物品
                    const currentInv = inventory[activeChild] || {};
                    const returnableItems = Object.keys(currentInv).filter(k => k !== item.id);

                    if (returnableItems.length === 0) {
                        showToast('warning', '背包里空空如也，没有可退的商品！');
                        // 返还药水
                        setInventory(prev => {
                            const childInv = prev[activeChild] || {};
                            return { ...prev, [activeChild]: { ...childInv, [item.id]: (childInv[item.id] || 0) + 1 } };
                        });
                        return;
                    }

                    // 2. 构建选择列表供用户输入
                    const itemListStr = returnableItems.map((id, index) => {
                        const itemDef = SHOP_ITEMS.find(i => i.id === id);
                        return `${index + 1}. ${itemDef ? itemDef.name : id} (拥有: ${currentInv[id]})`;
                    }).join('\n');

                    const choice = prompt(`🍷 请输入你要退货的商品【序号】：\n\n${itemListStr}`);
                    
                    // 3. 处理用户输入
                    if (choice === null) { // 用户点击取消
                        setInventory(prev => {
                            const childInv = prev[activeChild] || {};
                            return { ...prev, [activeChild]: { ...childInv, [item.id]: (childInv[item.id] || 0) + 1 } };
                        });
                        return;
                    }

                    const index = parseInt(choice) - 1;
                    if (isNaN(index) || index < 0 || index >= returnableItems.length) {
                        showToast('warning', '输入无效，操作已取消。');
                        setInventory(prev => {
                            const childInv = prev[activeChild] || {};
                            return { ...prev, [activeChild]: { ...childInv, [item.id]: (childInv[item.id] || 0) + 1 } };
                        });
                        return;
                    }

                    const targetItemId = returnableItems[index];
                    const targetItemDef = SHOP_ITEMS.find(i => i.id === targetItemId);

                    // 4. 查找该商品最近的购买记录 (为了确定退多少钱)
                    const historyKeys = Object.keys(wheelHistory).sort((a, b) => {
                        const timeA = parseInt(a.split('-').pop());
                        const timeB = parseInt(b.split('-').pop());
                        return timeB - timeA;
                    });
                    // 格式: activeChild-SHOP-itemId-timestamp
                    const targetKey = historyKeys.find(k => k.startsWith(`${activeChild}-SHOP-${targetItemId}-`));

                    if (!targetKey) {
                        showToast('error', '无法退款：该商品没有购买记录。', {duration: 4000});
                        setInventory(prev => {
                            const childInv = prev[activeChild] || {};
                            return { ...prev, [activeChild]: { ...childInv, [item.id]: (childInv[item.id] || 0) + 1 } };
                        });
                        return;
                    }

                    const refundAmount = Math.abs(wheelHistory[targetKey]);

                    // 5. 最终确认
                    if (confirm(`💰 确定要退掉 1 个 "${targetItemDef ? targetItemDef.name : targetItemId}" 吗？\n\n执行后：\n1. 退还 ${refundAmount} 金元宝\n2. 从背包移除该商品\n3. 消耗此高级反悔药水`)) {
                        
                        const newHistory = { ...wheelHistory };

                        // --- 核心修改开始 ---
                        // 1. 将原购买记录标记为“已撤销历史”
                        const revokedKey = targetKey.replace('-SHOP-', '-SHOP_REVOKED-');
                        delete newHistory[targetKey];
                        newHistory[revokedKey] = -refundAmount;

                        // 2. 新增一笔退款记录
                        // 这里我们在 ID 后面加个小标记，或者直接用 targetItemId，这样能显示出是退了哪个商品
                        const refundKey = `${activeChild}-REFUND-${targetItemId}-${Date.now()}`;
                        newHistory[refundKey] = refundAmount;
                        // --- 核心修改结束 ---
                        
                        setWheelHistory(newHistory);

                        // B. 从背包移除目标商品 (保持不变)
                        setInventory(prev => {
                            const currentAll = { ...prev };
                            const childInv = { ...(currentAll[activeChild] || {}) };
                            
                            const newCount = (childInv[targetItemId] || 0) - 1;
                            if (newCount <= 0) delete childInv[targetItemId];
                            else childInv[targetItemId] = newCount;

                            currentAll[activeChild] = childInv;
                            return currentAll;
                        });

                        showToast('success', `退货成功！退款 +${refundAmount} 金元宝。`);
                    } else {
                        // 用户在最后一步取消
                        setInventory(prev => {
                            const childInv = prev[activeChild] || {};
                            return { ...prev, [activeChild]: { ...childInv, [item.id]: (childInv[item.id] || 0) + 1 } };
                        });
                    }
                }
            };

            // 使用补签卡：支持传入完成分钟数，写入打卡记录并参与金元宝计算；并标记该打卡点为补签（显示火焰角标）
            const useRepairCard = (entry, durationMinutes, units = 0) => {
                if ((inventory[activeChild]?.['item_fire'] || 0) > 0) {
                    const minutes = Math.max(1, Math.min(999, parseInt(durationMinutes, 10) || 30));
                    const task = (tasks[activeChild] || []).find(t => t.id === entry.taskId);
                    const isMulti = task?.multiCheckin && task?.frequencyType === 'daily_must';
                    const finalUnits = isMulti && task?.multiUnitLabel
                        ? Math.max(1, parseInt(units, 10) || 1)
                        : 0;
                    setInventory(prev => {
                        const childInv = prev[activeChild] || {};
                        const newCount = (childInv['item_fire'] || 0) - 1;
                        const newInv = { ...childInv, 'item_fire': newCount };
                        if (newCount <= 0) delete newInv['item_fire'];
                        return { ...prev, [activeChild]: newInv };
                    });
                    saveCheckin(minutes, finalUnits);
                    setRepairedCheckins(prev => ({
                        ...prev,
                        [activeChild]: {
                            ...(prev[activeChild] || {}),
                            [entry.taskId]: { ...(prev[activeChild]?.[entry.taskId] || {}), [entry.date]: true }
                        }
                    }));
                    updateStats(activeChild, 'repair', 1);
                    checkAchievementsRef.current?.('repair');
                }
            };

            // 使用跳过卡
            const useSkipCard = React.useCallback((task) => {
                 if ((inventory[activeChild]?.['item_skip'] || 0) > 0) {
                      setInventory(prev => {
                        const childInv = prev[activeChild] || {};
                        const newCount = (childInv['item_skip'] || 0) - 1;
                        const newInv = { ...childInv, 'item_skip': newCount };
                        if (newCount <= 0) delete newInv['item_skip'];
                        return { ...prev, [activeChild]: newInv };
                    });
                    const today = getLocalDateKey(0);
                    const newCheckins = { ...checkins };
                    const childData = newCheckins[activeChild] || {};
                    const taskData = childData[task.id] || {};
                    newCheckins[activeChild] = { ...childData, [task.id]: { ...taskData, [today]: '免' } };
                    setCheckins(newCheckins);
                    const key = `${activeChild}-SKIP-${task.id}-${Date.now()}`;
                    // 应用投资倍率
                    const childBuffs = activeBuffs?.[activeChild] || {};
                    const investStart = childBuffs.investStart || (childBuffs.investExpire ? dateKeySubtractDays(childBuffs.investExpire, 30) : today);
                    let reward = task.reward;
                    if (childBuffs.investMultiplier > 1 && childBuffs.investExpire && today <= childBuffs.investExpire && today >= investStart) {
                        reward = Math.floor(task.reward * childBuffs.investMultiplier);
                    }
                    const newHistory = { ...wheelHistory, [key]: reward };
                    setWheelHistory(newHistory);
                    checkAchievementsRef.current('checkin', {}, { checkins: newCheckins, wheelHistory: newHistory });
                    showToast('success', '已使用金牌免除今日任务，奖励已发放！');
                 }
                 triggerSyncUpload();
            }, [inventory, activeChild, checkins, wheelHistory, activeBuffs]);

            // --- AI 服务层 ---
            // --- 云同步功能（v2：修复回退、哈希碰撞、并发竞态） ---
            const SYNC_PREFIXES = ['app_'];

            // 内容哈希：遍历每个字符，而非仅比较字符串长度（修复 Bug4）
            const hashSyncPayload = (data) => {
                const keys = Object.keys(data).filter(k => k !== '_syncTs').sort();
                let h = keys.length * 31;
                for (const k of keys) {
                    const v = String(data[k] || '');
                    for (let i = 0; i < v.length; i++) {
                        h = ((h << 5) - h + v.charCodeAt(i)) | 0;
                    }
                }
                return String(h);
            };

            // === 逐 key 合并（防止两台设备在同步间隔内互相覆盖记录）===
            // 这些 localStorage key 是「追加型字典」：{ 唯一key: 数值/记录 }，两端合并取并集即可，几乎不会真正冲突
            const MERGEABLE_DICT_KEYS = new Set([
                'app_wheel_history',      // 金元宝账单（child-TYPE-...: 数值）
                'app_xp_history',         // 经验账单
                'app_star_history_v1',    // 星星账单
                'app_wecom_push_log',     // 企微推送去重日志
                'app_ai_reminder_log_v1', // AI 提醒去重日志
                'app_exempted_days_v1',   // 豁免日（dateKey: true）
                'app_random_event_history',
                'app_evil_penalty_log_v1',
                'app_daily_random_counts',
                'app_daily_event_type_counts_v1',
            ]);
            // 两层字典结构 { child: { key: value } }，按 child 分别做扁平合并
            const MERGEABLE_TWO_LEVEL_KEYS = new Set([
                'app_achievements_v1',
                'app_curriculum_progress_v1',
                'app_weekly_payroll_v1',
            ]);
            // checkins 是三层嵌套 { child: { taskId: { date: value } } }，需要深合并
            const MERGEABLE_NESTED_KEYS = new Set([
                'app_checkins_v2',
                'app_repaired_checkins_v1',
            ]);

            // 扁平字典并集合并：双方都有同一 key 时保留本地值（本地是最新操作方）
            const mergeFlatDict = (localObj, cloudObj) => {
                const merged = { ...cloudObj };
                let changed = false;
                Object.keys(localObj).forEach(k => {
                    if (!(k in merged)) { merged[k] = localObj[k]; changed = true; }
                    else if (merged[k] !== localObj[k]) { merged[k] = localObj[k]; changed = true; }
                });
                // 检测云端独有 key（本地缺失即视为有变化，需要写回本地）
                const cloudOnly = Object.keys(cloudObj).some(k => !(k in localObj));
                return { merged, localChanged: cloudOnly, cloudChanged: changed };
            };

            // checkins 深合并：child → taskId → dateKey 三层，叶子（数字或数组）双方都有时保留条目更多的一方
            const mergeCheckins = (localObj, cloudObj) => {
                const merged = {};
                const children = new Set([...Object.keys(localObj), ...Object.keys(cloudObj)]);
                let localChanged = false, cloudChanged = false;
                children.forEach(child => {
                    const lChild = localObj[child] || {}, cChild = cloudObj[child] || {};
                    merged[child] = {};
                    const taskIds = new Set([...Object.keys(lChild), ...Object.keys(cChild)]);
                    taskIds.forEach(tid => {
                        const lTask = lChild[tid] || {}, cTask = cChild[tid] || {};
                        merged[child][tid] = {};
                        const dates = new Set([...Object.keys(lTask), ...Object.keys(cTask)]);
                        dates.forEach(d => {
                            const lv = lTask[d], cv = cTask[d];
                            if (lv === undefined) { merged[child][tid][d] = cv; localChanged = true; }
                            else if (cv === undefined) { merged[child][tid][d] = lv; cloudChanged = true; }
                            else if (Array.isArray(lv) && Array.isArray(cv)) {
                                // 多次打卡数组：按时间戳 t 去重合并
                                const seen = new Map();
                                [...cv, ...lv].forEach(e => { seen.set(e.t || JSON.stringify(e), e); });
                                const arr = [...seen.values()].sort((a, b) => (a.t || 0) - (b.t || 0));
                                merged[child][tid][d] = arr;
                                if (arr.length !== lv.length) localChanged = true;
                                if (arr.length !== cv.length) cloudChanged = true;
                            } else {
                                merged[child][tid][d] = lv; // 双方都有：保留本地
                                if (JSON.stringify(lv) !== JSON.stringify(cv)) cloudChanged = true;
                            }
                        });
                    });
                });
                return { merged, localChanged, cloudChanged };
            };

            // 两层字典合并（如成就 { child: { achId: date } }）：按 child 分别做扁平并集
            const mergeTwoLevelDict = (localObj, cloudObj) => {
                const merged = {};
                const children = new Set([...Object.keys(localObj), ...Object.keys(cloudObj)]);
                let localChanged = false, cloudChanged = false;
                children.forEach(child => {
                    const l = localObj[child] || {}, c = cloudObj[child] || {};
                    const r = mergeFlatDict(l, c);
                    merged[child] = r.merged;
                    if (r.localChanged) localChanged = true;
                    if (r.cloudChanged) cloudChanged = true;
                });
                return { merged, localChanged, cloudChanged };
            };

            // === 层3：数组与对象的语义合并 ===

            // 条目指纹：优先 id，缺 id 时用内容 JSON 兜底（旧数据兼容）
            const entryFingerprint = (e) => (e && typeof e === 'object' && e.id !== undefined) ? String(e.id) : JSON.stringify(e);

            // 数组按条目指纹并集合并（大事纪、兑换券等追加型数组）
            // sortFn 可选；cap 可选（保留最新 N 条，配合 sortFn 使用）
            const mergeEntryArray = (localArr, cloudArr, sortFn, cap) => {
                const seen = new Map();
                cloudArr.forEach(e => seen.set(entryFingerprint(e), e));
                let cloudChanged = false;
                localArr.forEach(e => {
                    const fp = entryFingerprint(e);
                    if (!seen.has(fp)) { seen.set(fp, e); cloudChanged = true; }
                    else seen.set(fp, e); // 同 id 双方都有：保留本地（本地是最新操作方）
                });
                let merged = [...seen.values()];
                if (sortFn) merged.sort(sortFn);
                if (cap && merged.length > cap) merged = merged.slice(0, cap);
                const localChanged = merged.length !== localArr.length
                    || JSON.stringify(merged) !== JSON.stringify(localArr);
                return { merged, localChanged, cloudChanged };
            };

            // 顶层数组 key（如大事纪 [ {id,...} ]）
            const mergeTopLevelArray = (localObj, cloudObj, sortFn, cap) => {
                if (!Array.isArray(localObj) || !Array.isArray(cloudObj)) return null;
                return mergeEntryArray(localObj, cloudObj, sortFn, cap);
            };

            // { child: [entries] } 两层结构（兑换券、探险记录、探险日志）
            const mergeChildArrays = (localObj, cloudObj, sortFn, cap, entryMergeFn) => {
                const merged = {};
                const children = new Set([...Object.keys(localObj), ...Object.keys(cloudObj)]);
                let localChanged = false, cloudChanged = false;
                children.forEach(child => {
                    const l = Array.isArray(localObj[child]) ? localObj[child] : [];
                    const c = Array.isArray(cloudObj[child]) ? cloudObj[child] : [];
                    const r = (entryMergeFn || mergeEntryArray)(l, c, sortFn, cap);
                    merged[child] = r.merged;
                    if (r.localChanged) localChanged = true;
                    if (r.cloudChanged) cloudChanged = true;
                });
                return { merged, localChanged, cloudChanged };
            };

            // 探险记录合并：
            // 状态优先级：claimed (3) > completed (2) = cancelled (2) > active (1)
            // 引入 claimed 墓碑机制：
            // 1. 已领取的探险（claimed）优先级最高，绝不会被云端的 completed/active 复活
            // 2. 超期（如超过 7 天）的 claimed 墓碑自动清理，防止数据无限膨胀
            // 3. 对云端历史遗留的 completed 探险（完成时间超过 24 小时或已入日志且本地已无记录），
            //    判定为历史已结算，自动收敛为 claimed 并回写云端，彻底根除死灰复燃
            const mergeAdventureArray = (localArr, cloudArr) => {
                const getStatusPriority = (status) => {
                    if (status === 'claimed') return 3;
                    if (status === 'completed' || status === 'cancelled') return 2;
                    if (status === 'active') return 1;
                    return 0;
                };

                const seen = new Map();
                let cloudChanged = false;

                // 辅助：从 localStorage 快速读取已有日志的 fingerprint/id，以防历史已收下的记录复活
                let knownLogIds = new Set();
                try {
                    const rawLog = storage.getItem('app_pet_adventure_log_v1');
                    if (rawLog) {
                        const parsed = JSON.parse(rawLog);
                        Object.values(parsed).forEach(list => {
                            if (Array.isArray(list)) {
                                list.forEach(item => {
                                    if (item && item.id) knownLogIds.add(String(item.id));
                                    if (item && item.startTime) knownLogIds.add(`${item.petId}_${item.realmId}_${item.startTime}`);
                                });
                            }
                        });
                    }
                } catch (e) {}

                const isOldCompleted = (adv) => {
                    if (!adv || adv.status !== 'completed') return false;
                    const endTime = adv.result?.endTime || adv.expectedEndTime || adv.startTime || 0;
                    if (endTime && (Date.now() - endTime > 2 * 3600000)) return true;
                    if (adv.result?.id && knownLogIds.has(String(adv.result.id))) return true;
                    if (adv.startTime && knownLogIds.has(`${adv.petId}_${adv.realmId}_${adv.startTime}`)) return true;
                    return false;
                };

                // 先放入 cloudArr
                (cloudArr || []).forEach(e => {
                    if (!e) return;
                    const fp = entryFingerprint(e);
                    if (isOldCompleted(e)) {
                        seen.set(fp, { ...e, status: 'claimed', claimedAt: e.claimedAt || Date.now() });
                        cloudChanged = true;
                    } else {
                        seen.set(fp, e);
                    }
                });

                // 再用 localArr 合并
                (localArr || []).forEach(e => {
                    if (!e) return;
                    const fp = entryFingerprint(e);
                    const existing = seen.get(fp);
                    if (!existing) {
                        seen.set(fp, e);
                        cloudChanged = true;
                    } else {
                        const localPri = getStatusPriority(e.status);
                        const cloudPri = getStatusPriority(existing.status);
                        if (localPri > cloudPri) {
                            seen.set(fp, e);
                            cloudChanged = true;
                        } else if (localPri < cloudPri) {
                            // 云端优先级更高（如云端已被其他端 claimed），保持云端
                        } else {
                            // 优先级相同：保留本地最新
                            seen.set(fp, e);
                        }
                    }
                });

                // 清理超过 7 天的 claimed 墓碑
                const now = Date.now();
                const filtered = [...seen.values()].filter(a => {
                    if (a.status === 'claimed') {
                        const claimTime = a.claimedAt || a.result?.endTime || a.expectedEndTime || a.startTime || 0;
                        if (now - claimTime > 7 * 86400000) {
                            cloudChanged = true;
                            return false;
                        }
                    }
                    return true;
                });

                const merged = filtered.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
                const localChanged = JSON.stringify(merged) !== JSON.stringify(localArr);
                if (!cloudChanged) cloudChanged = JSON.stringify(merged) !== JSON.stringify(cloudArr);
                return { merged, localChanged, cloudChanged };
            };

            // 宠物数据合并：{ child: { petId: {...} } }，按宠物粒度 LWW（lastInteraction 新者胜）
            const mergePetData = (localObj, cloudObj) => {
                const merged = {};
                const children = new Set([...Object.keys(localObj), ...Object.keys(cloudObj)]);
                let localChanged = false, cloudChanged = false;
                children.forEach(child => {
                    const l = localObj[child] || {}, c = cloudObj[child] || {};
                    merged[child] = {};
                    const petIds = new Set([...Object.keys(l), ...Object.keys(c)]);
                    petIds.forEach(pid => {
                        const lp = l[pid], cp = c[pid];
                        if (!lp) { merged[child][pid] = cp; localChanged = true; return; }
                        if (!cp) { merged[child][pid] = lp; cloudChanged = true; return; }
                        const lt = Date.parse(lp.lastInteraction || 0) || 0;
                        const ct = Date.parse(cp.lastInteraction || 0) || 0;
                        if (ct > lt) { merged[child][pid] = cp; localChanged = true; }
                        else {
                            merged[child][pid] = lp;
                            if (JSON.stringify(lp) !== JSON.stringify(cp)) cloudChanged = true;
                        }
                    });
                });
                return { merged, localChanged, cloudChanged };
            };

            // 语义合并注册表：key → 处理函数(localObj, cloudObj) → { merged, localChanged, cloudChanged }
            const SEMANTIC_MERGERS = {
                // 大事纪：顶层数组，按 id 并集，时间倒序
                'app_milestones_v1': (l, c) => mergeTopLevelArray(l, c, (a, b) => (b.timestamp || 0) - (a.timestamp || 0)),
                // 兑换券：{ child: [记录] }，按 id/指纹并集
                'app_coupons_v1': (l, c) => mergeChildArrays(l, c),
                // 探险记录：{ child: [adventure] }，终态优先
                'app_pet_adventures_v1': (l, c) => mergeChildArrays(l, c, null, null, mergeAdventureArray),
                // 探险日志：{ child: [log] }，按 id 并集，endTime 倒序，保留 50 条
                'app_pet_adventure_log_v1': (l, c) => mergeChildArrays(l, c, (a, b) => (b.endTime || 0) - (a.endTime || 0), 50),
                // 宠物运行时数据：按宠物粒度 LWW
                'app_pet_data_v1': mergePetData,
                // 已拥有宠物：{ child: [petId] }，字符串数组并集
                'app_owned_pets_v1': (l, c) => mergeChildArrays(l, c),
                // 甲骨传书：顶层数组，按 id 并集，时间倒序
                'app_global_messages_v2': (l, c) => mergeTopLevelArray(l, c, (a, b) => (b.timestamp || 0) - (a.timestamp || 0)),
                // 家长指令队列：顶层数组，按 id 并集，claimed 优先
                'app_parent_actions_v1': (l, c) => {
                    if (!Array.isArray(l) || !Array.isArray(c)) return null;
                    const seen = new Map();
                    c.forEach(a => { if (a && a.id) seen.set(a.id, a); });
                    let cloudChanged = false;
                    l.forEach(a => {
                        if (!a || !a.id) return;
                        const existing = seen.get(a.id);
                        if (!existing) {
                            seen.set(a.id, a);
                            cloudChanged = true;
                        } else {
                            if (a.status === 'claimed' && existing.status !== 'claimed') {
                                seen.set(a.id, a);
                                cloudChanged = true;
                            } else if (existing.status === 'claimed') {
                                // 保留云端 claimed
                            } else {
                                seen.set(a.id, a);
                            }
                        }
                    });
                    const merged = [...seen.values()].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 100);
                    const localChanged = merged.length !== l.length || JSON.stringify(merged) !== JSON.stringify(l);
                    return { merged, localChanged, cloudChanged };
                },
                // 家长已授权设备表
                'app_authorized_parents_v1': (l, c) => {
                    if (!l || !c || typeof l !== 'object' || typeof c !== 'object') return null;
                    const pairToken = l.pairToken || c.pairToken || '';
                    const lDevs = Array.isArray(l.devices) ? l.devices : [];
                    const cDevs = Array.isArray(c.devices) ? c.devices : [];
                    const devMap = new Map();
                    cDevs.forEach(d => { if (d && d.deviceId) devMap.set(d.deviceId, d); });
                    let cloudChanged = false;
                    lDevs.forEach(d => {
                        if (!d || !d.deviceId) return;
                        if (!devMap.has(d.deviceId)) {
                            devMap.set(d.deviceId, d);
                            cloudChanged = true;
                        } else {
                            const existing = devMap.get(d.deviceId);
                            if ((d.lastActive || 0) >= (existing.lastActive || 0)) {
                                devMap.set(d.deviceId, { ...existing, ...d });
                            }
                        }
                    });
                    const merged = { pairToken, devices: [...devMap.values()] };
                    const localChanged = JSON.stringify(merged) !== JSON.stringify(l);
                    return { merged, localChanged, cloudChanged };
                },
                // 天工书阁读完名著历史：{ child: [book] }，按 id 并集
                'app_reading_history_v1': (l, c) => mergeChildArrays(l, c),
                // 作业登记记录：{ child: [record] }，按 id 并集，日期倒序
                'app_homework_records_v1': (l, c) => mergeChildArrays(l, c, (a, b) => (b.date || '').localeCompare(a.date || '')),
                // 考试成绩记录：{ child: [record] }，按 id 并集，日期倒序
                'app_exam_records_v1': (l, c) => mergeChildArrays(l, c, (a, b) => (b.date || '').localeCompare(a.date || '')),
                // 历史事件进度：{ child: [eventId] }，字符串数组并集
                'app_historical_event_progress_v1': (l, c) => mergeChildArrays(l, c),
            };

            // 对单个 localStorage key 尝试合并。返回 { value: 合并后的 JSON 字符串, localChanged, cloudChanged }；不可合并时返回 null
            const tryMergeSyncKey = (key, localStr, cloudStr) => {
                const semantic = SEMANTIC_MERGERS[key];
                if (!semantic && !MERGEABLE_DICT_KEYS.has(key) && !MERGEABLE_NESTED_KEYS.has(key) && !MERGEABLE_TWO_LEVEL_KEYS.has(key)) return null;
                if (!localStr || !cloudStr) return null;
                try {
                    const localObj = JSON.parse(localStr);
                    const cloudObj = JSON.parse(cloudStr);
                    if (typeof localObj !== 'object' || typeof cloudObj !== 'object' || !localObj || !cloudObj) return null;
                    let result;
                    if (semantic) {
                        result = semantic(localObj, cloudObj);
                        if (!result) return null; // 结构不符（如期望数组但拿到对象）→ 走版本比较
                    } else {
                        if (Array.isArray(localObj) || Array.isArray(cloudObj)) return null;
                        result = MERGEABLE_NESTED_KEYS.has(key)
                            ? mergeCheckins(localObj, cloudObj)
                            : MERGEABLE_TWO_LEVEL_KEYS.has(key)
                            ? mergeTwoLevelDict(localObj, cloudObj)
                            : mergeFlatDict(localObj, cloudObj);
                    }
                    return { value: JSON.stringify(result.merged), localChanged: result.localChanged, cloudChanged: result.cloudChanged };
                } catch (e) { return null; }
            };
            // 暴露到 window 供单元测试调用
            window._tryMergeSyncKey = tryMergeSyncKey;

            // === 逐 key 合并决策（纯函数，不触碰 localStorage，便于测试）===
            // cloudData: 云端包（含 _syncTs / _keyVersions）
            // localSnapshot: { key: string|null } 本地对应 key 的当前值
            // localVersions: 本地版本表 { key: ts }
            // localTs: 本地上次同步的整包时间戳
            // 返回 { writes: {key: 新值}, adoptVersions: {key: ts}, needUpload: bool }
            const resolveSyncMerge = (cloudData, localSnapshot, localVersions, localTs) => {
                const cloudTs = cloudData._syncTs || 0;
                const cloudVersions = cloudData._keyVersions || {};
                const defaultTakeCloud = cloudTs > localTs; // 双方都无版本信息时退回整包行为
                const writes = {};
                const adoptVersions = {};
                let needUpload = false;

                Object.entries(cloudData).forEach(([key, cloudVal]) => {
                    if (key === '_syncTs' || key === '_keyVersions') return;
                    const localVal = (key in localSnapshot) ? localSnapshot[key] : null;

                    // 1. 追加型字典：语义并集合并，双向无损
                    const mergeResult = tryMergeSyncKey(key, localVal, cloudVal);
                    if (mergeResult) {
                        if (mergeResult.localChanged) writes[key] = mergeResult.value;
                        if (mergeResult.cloudChanged) needUpload = true;
                        return;
                    }
                    // 2. 本地没有此 key：直接取云端
                    if (localVal === null) {
                        writes[key] = cloudVal;
                        if (cloudVersions[key]) adoptVersions[key] = cloudVersions[key];
                        return;
                    }
                    // 3. 内容相同：跳过
                    if (localVal === cloudVal) return;
                    // 4. 内容不同：逐 key 比版本，修改时间新者胜
                    //    （版本缺失视为 0 = "该设备未改过这个 key"）
                    //    首次同步（localTs === 0）的设备一律取云端，防止新设备的本地测试数据覆盖家庭真实数据
                    const lv = localVersions[key] || 0;
                    const cv = cloudVersions[key] || 0;
                    let takeCloud;
                    if (localTs === 0) takeCloud = true;
                    else if (lv === 0 && cv === 0) takeCloud = defaultTakeCloud;
                    else takeCloud = cv > lv;
                    if (takeCloud) {
                        writes[key] = cloudVal;
                        if (cv) adoptVersions[key] = cv;
                    } else {
                        needUpload = true; // 本地保留的新值需要回传云端
                    }
                });
                return { writes, adoptVersions, needUpload };
            };
            window._resolveSyncMerge = resolveSyncMerge;

            // 把合并决策应用到 storage；返回实际写入数
            const applySyncMerge = (result) => {
                let written = 0;
                Object.entries(result.writes).forEach(([k, v]) => {
                    try { storage.setItem(k, v); written++; } catch (e) {}
                });
                if (Object.keys(result.adoptVersions).length > 0) {
                    try {
                        const versions = storage.getKeyVersions();
                        Object.assign(versions, result.adoptVersions);
                        storage.setItem('_key_versions', JSON.stringify(versions));
                    } catch (e) {}
                }
                return written;
            };

            // 构建本地快照与版本表（只取云端包涉及的 key，避免全量遍历）
            const buildLocalSnapshot = (cloudData) => {
                const snapshot = {};
                Object.keys(cloudData).forEach(key => {
                    if (key === '_syncTs' || key === '_keyVersions') return;
                    snapshot[key] = storage.getItem(key);
                });
                const versions = storage.getKeyVersions();
                return { snapshot, versions };
            };

            const collectSyncData = () => {
                // H3: 先刷新所有 pending 写入，确保读到最新数据
                if (window._pendingWrites) {
                    Object.entries(window._pendingWrites).forEach(([k, v]) => {
                        try {
                            storage.setItem(k, JSON.stringify(v));
                            storage.markKeyVersion(k);
                        } catch (e) {}
                    });
                }
                const data = storage.getAllSyncData();
                data._syncTs = Date.now();
                // 逐 key 版本表随包上传（仅保留本包内存在的 key，防表膨胀）
                try {
                    const versions = storage.getKeyVersions();
                    const trimmed = {};
                    Object.keys(data).forEach(k => { if (versions[k]) trimmed[k] = versions[k]; });
                    data._keyVersions = trimmed;
                } catch (e) {}
                return data;
            };

            // 并发锁（修复 Bug5）
            const syncLockRef = React.useRef(false);
            const saveCheckinLockRef = React.useRef(false);
            const acquireSyncLock = () => { if (syncLockRef.current) return false; syncLockRef.current = true; return true; };
            const releaseSyncLock = () => { syncLockRef.current = false; };

            // 记录最近一次用户操作时间（自适应轮询用：活跃期 15s，闲置期 60s）
            const lastActivityRef = React.useRef(Date.now());
            React.useEffect(() => {
                const markActivity = () => { lastActivityRef.current = Date.now(); };
                window.addEventListener('pointerdown', markActivity, { passive: true });
                window.addEventListener('keydown', markActivity, { passive: true });
                return () => {
                    window.removeEventListener('pointerdown', markActivity);
                    window.removeEventListener('keydown', markActivity);
                };
            }, []);

            const syncToCloud = async (force = false) => {
                if (!syncCode) return;
                const localTs = parseInt(storage.getItem('_sync_local_ts') || '0', 10);
                // 自动上传时，如果本地从未同步过（localTs === 0），禁止上传，防止新设备空数据覆盖云端
                if (!force && localTs === 0) {
                    console.warn('syncToCloud skipped: localTs is 0, need syncFromCloud first');
                    return;
                }
                if (!acquireSyncLock()) return; // 并发保护
                setSyncStatus('syncing');
                try {
                    const data = collectSyncData();
                    // KV 同 key 限 1 写/秒：429/超限时退避重试（最多 3 次）
                    let resp = null;
                    for (let attempt = 0; attempt < 3; attempt++) {
                        resp = await fetch(`${SYNC_URL}?code=${encodeURIComponent(syncCode)}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                        if (resp.status !== 429) break;
                        await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
                    }
                    if (!resp.ok) throw new Error(`上传失败 (${resp.status})`);
                    const newHash = hashSyncPayload(data);
                    storage.setItem('_sync_last_hash', newHash);
                    storage.setItem('_sync_local_ts', String(data._syncTs)); // 记录本地时间戳（修复 Bug1）
                    setSyncLastTime(Date.now());
                    setSyncStatus('success');
                    setTimeout(() => setSyncStatus(''), 3000);
                } catch (e) {
                    console.error('Sync upload failed:', e);
                    let msg = '上传失败';
                    if (e && e.message) {
                        if (e.message.includes('Network') || e.message.includes('fetch')) msg = '网络异常，请检查网络';
                        else msg = e.message.slice(0, 40);
                    }
                    showToast('error', `同步失败：${msg}`);
                    setSyncStatus('error');
                    setTimeout(() => setSyncStatus(''), 3000);
                } finally {
                    releaseSyncLock();
                }
            };

            const syncFromCloud = async () => {
                if (!syncCode) return;
                if (!acquireSyncLock()) return; // 并发保护
                setSyncStatus('syncing');
                try {
                    const resp = await fetch(`${SYNC_URL}?code=${encodeURIComponent(syncCode)}`);
                    if (resp.status === 404) {
                        // 云端无数据，直接上传（不释放锁，内联执行）
                        const data = collectSyncData();
                        try {
                            const resp2 = await fetch(`${SYNC_URL}?code=${encodeURIComponent(syncCode)}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                            });
                            if (resp2.ok) {
                                storage.setItem('_sync_last_hash', hashSyncPayload(data));
                                storage.setItem('_sync_local_ts', String(data._syncTs));
                            }
                        } catch (e) { console.warn('Initial upload failed:', e); }
                        setSyncStatus('success');
                        setTimeout(() => setSyncStatus(''), 3000);
                        return;
                    }
                    if (!resp.ok) throw new Error(`下载失败 (${resp.status})`);
                    const cloudData = await resp.json();
                    const cloudHash = hashSyncPayload(cloudData);
                    const lastHash = storage.getItem('_sync_last_hash');

                    // 哈希相同 = 数据未变化，跳过
                    if (cloudHash === lastHash) {
                        setSyncLastTime(Date.now());
                        setSyncStatus('success');
                        setTimeout(() => setSyncStatus(''), 3000);
                        return;
                    }

                    // === 逐 key 合并（v2）===
                    // 追加型字典 → 并集合并；其余 key → 逐 key 比修改版本，新者胜。
                    // 不再整包"谁新用谁"：平板改打卡、手机改任务，两边修改都能保住。
                    // 本地未同步过（localTs === 0）：所有本地版本视为可信但通常为空表 → 云端值全收
                    const cloudTs = cloudData._syncTs || 0;
                    const localTs = parseInt(storage.getItem('_sync_local_ts') || '0', 10);

                    const { snapshot, versions } = buildLocalSnapshot(cloudData);
                    const mergeResult = resolveSyncMerge(cloudData, snapshot, versions, localTs);
                    const written = applySyncMerge(mergeResult);

                    // 本地时间戳推进到云端（本地保留的新 key 会通过回传上传，届时再推进）
                    storage.setItem('_sync_local_ts', String(Math.max(cloudTs, localTs)));
                    setSyncLastTime(Date.now());
                    setSyncStatus('success');
                    setTimeout(() => setSyncStatus(''), 3000);

                    if (written > 0) {
                        // 派发事件让所有 useStickyState 从 storage 刷新（替代 reload）
                        window._syncReloading = true;
                        window.dispatchEvent(new CustomEvent('_syncDataMerged'));
                        setTimeout(() => { window._syncReloading = false; }, 1000);
                    }
                    // 本地有云端没有的新内容（本地胜出的 key / 追加型独有记录）：回传云端
                    if (mergeResult.needUpload) {
                        setTimeout(() => { try { syncToCloud(true); } catch (e) {} }, 1500);
                    } else {
                        // 无需回传时，哈希记为云端值，后续轮询可短路
                        storage.setItem('_sync_last_hash', cloudHash);
                    }
                } catch (e) {
                    console.error('Sync download failed:', e);
                    let msg = '下载失败';
                    if (e && e.message) {
                        if (e.message.includes('Network') || e.message.includes('fetch')) msg = '网络异常，请检查网络';
                        else msg = e.message.slice(0, 40);
                    }
                    showToast('error', `同步失败：${msg}`);
                    setSyncStatus('error');
                    setTimeout(() => setSyncStatus(''), 3000);
                } finally {
                    releaseSyncLock();
                }
            };

            // 防抖上传：操作后 10 秒自动上传（修复 Bug3：不再提前清除 hash）
            const triggerSyncUpload = React.useCallback(() => {
                if (!syncCode || syncLockRef.current) return;
                if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
                syncDebounceRef.current = setTimeout(() => syncToCloud(), 2000);
            }, [syncCode]);
            window.triggerSyncUpload = triggerSyncUpload;

            // 页面加载时自动同步 + 轻量时间戳轮询（自适应间隔）+ 回到前台兜底拉取
            React.useEffect(() => {
                if (!syncCode) return;
                const timer = setTimeout(() => syncFromCloud(), 1500);

                // === 轻量 ts 轮询：GET /ts 只返回云端时间戳（几十字节），变化时才做完整拉取 ===
                // 活跃期（2 分钟内有操作）每 3.5 秒查一次；闲置期每 8 秒；页面不可见时不查
                let pollTimer = null;
                let stopped = false;
                const schedulePoll = () => {
                    if (stopped) return;
                    const active = Date.now() - lastActivityRef.current < 120000;
                    const delay = active ? 3500 : 8000;
                    pollTimer = setTimeout(async () => {
                        if (stopped) return;
                        if (document.visibilityState === 'visible' && !syncLockRef.current) {
                            try {
                                const resp = await fetch(`${SYNC_URL.replace(/\/$/, '')}/ts?code=${encodeURIComponent(syncCode)}`);
                                if (resp.ok) {
                                    const { ts } = await resp.json();
                                    const localTs = parseInt(storage.getItem('_sync_local_ts') || '0', 10);
                                    // 云端时间戳比本地新 → 有其他设备上传过 → 完整拉取合并
                                    if (ts && ts > localTs) await syncFromCloud();
                                }
                            } catch (e) {} // 网络异常静默跳过，下轮再试
                        }
                        schedulePoll();
                    }, delay);
                };
                schedulePoll();

                // 兜底：每 10 分钟做一次完整拉取（防 ts 接口异常时长期不同步）
                const fullInterval = setInterval(() => {
                    if (document.visibilityState === 'visible') syncFromCloud();
                }, 600000);

                // 回到前台时拉取云端最新数据（5 秒节流）
                let lastVisibilityPull = 0;
                const visibilityHandler = () => {
                    if (document.visibilityState !== 'visible') return;
                    const now = Date.now();
                    if (now - lastVisibilityPull < 5000) return;
                    lastVisibilityPull = now;
                    syncFromCloud();
                };
                document.addEventListener('visibilitychange', visibilityHandler);

                return () => {
                    stopped = true;
                    clearTimeout(timer);
                    if (pollTimer) clearTimeout(pollTimer);
                    clearInterval(fullInterval);
                    document.removeEventListener('visibilitychange', visibilityHandler);
                    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
                };
            }, [syncCode]);

            // === Web Push 通知系统 ===
            // PUSH_WORKER_URL 已迁移至 src/constants/api.js
            const [pushPermission, setPushPermission] = React.useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');
            const [pushSubscribed, setPushSubscribed] = React.useState(false);

            // iOS / PWA 检测辅助函数（已在全局定义）

            // 注册 Service Worker（离线缓存对所有浏览器生效）+ 检查推送订阅状态
            React.useEffect(() => {
                if (!('serviceWorker' in navigator)) return;
                // 开发模式下注销旧的 Service Worker 并清空缓存，避免影响 HMR 与热更新
                if (import.meta.env.DEV) {
                    navigator.serviceWorker.getRegistrations().then(regs => {
                        for (const reg of regs) reg.unregister();
                    });
                    if (typeof caches !== 'undefined') {
                        caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
                    }
                    return;
                }
                navigator.serviceWorker.register('/sw.js').then(reg => {
                    // 推送订阅仅在支持 PushManager 的浏览器检查
                    if (!('PushManager' in window)) return null;
                    return reg.pushManager.getSubscription();
                }).then(sub => {
                    setPushSubscribed(!!sub);
                }).catch(() => {});
                // 监听 Service Worker 发来的同步触发消息
                const swMessageHandler = (event) => {
                    if (event.data?.type === 'triggerSync' && event.data?.syncCode === syncCode) {
                        syncFromCloud();
                    }
                };
                navigator.serviceWorker.addEventListener('message', swMessageHandler);
                return () => navigator.serviceWorker.removeEventListener('message', swMessageHandler);
            }, [syncCode]);

            // 请求通知权限并订阅
            const enablePushNotifications = async () => {
                if (!('Notification' in window) || !('PushManager' in window)) {
                    showToast('warning', '当前浏览器不支持 Web Push 推送通知，请使用 Chrome、Edge 或 iOS Safari（需添加到主屏幕）');
                    return;
                }
                // iOS 必须在 PWA standalone 模式下才能订阅 Web Push
                if (isIOSSafari() && !isPWAStandalone()) {
                    showToast('warning', 'iOS 请先用 Safari 打开，点击「分享」→「添加到主屏幕」，然后从主屏幕图标打开本应用，再开启通知');
                    return;
                }
                if (!syncCode) {
                    showToast('warning', '请先设置同步码，再开启通知');
                    return;
                }
                if (!activeChild) {
                    showToast('warning', '请先选择孩子，再开启通知');
                    return;
                }
                try {
                    const permission = await Notification.requestPermission();
                    setPushPermission(permission);
                    if (permission !== 'granted') {
                        showToast('warning', '通知权限被拒绝，请在浏览器设置中开启');
                        return;
                    }

                    // 获取 VAPID 公钥
                    const vapidResp = await fetch(`${PUSH_WORKER_URL}/api/vapid-key`);
                    if (!vapidResp.ok) throw new Error('获取推送密钥失败');
                    const { publicKey } = await vapidResp.json();
                    if (!publicKey) throw new Error('推送密钥为空');

                    const registration = await navigator.serviceWorker.ready;
                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: Uint8Array.from(atob(publicKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
                    });

                    // 存储订阅
                    await fetch(`${PUSH_WORKER_URL}/api/subscribe`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            subscription: subscription.toJSON(),
                            syncCode: syncCode,
                            childName: activeChild
                        })
                    });

                    setPushSubscribed(true);
                    showToast('success', '打卡提醒已开启！每天会收到提醒通知 🔔');
                } catch (e) {
                    console.error('Push subscription failed:', e);
                    let msg = '开启通知失败：';
                    if (e && e.message && e.message.includes('permission')) {
                        msg += '通知权限被拒绝';
                    } else if (e && e.message && (e.message.includes('network') || e.message.includes('fetch'))) {
                        msg += '网络或推送服务异常';
                    } else if (e && e.message && e.message.includes('applicationServerKey')) {
                        msg += '推送密钥错误，请重试';
                    } else if (isIOSSafari() && !isPWAStandalone()) {
                        msg += 'iOS 需添加到主屏幕后从图标打开';
                    } else {
                        msg += (e.message || e.toString()).slice(0, 60);
                    }
                    showToast('error', msg);
                }
            };

            // 测试推送
            const testPushNotification = async () => {
                if (!syncCode || !activeChild) return;
                try {
                    const resp = await fetch(`${PUSH_WORKER_URL}/api/test-push`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ syncCode, childName: activeChild })
                    });
                    const text = await resp.text();
                    console.log('test-push response:', resp.status, text);
                    let result = {};
                    try { result = JSON.parse(text); } catch (parseErr) {}
                    if (resp.ok && result.ok) {
                        showToast('success', '测试通知已发送，请检查手机！');
                    } else if (result.status === 403 || (result.error && result.error.includes('403'))) {
                        showToast('error', '推送被拒绝：VAPID 密钥与当前订阅不匹配，请关闭通知后重新开启');
                    } else {
                        showToast('error', '发送失败：' + (result.error || `服务器错误 ${resp.status}`));
                    }
                } catch (e) {
                    console.error('test-push client error:', e);
                    showToast('error', '发送失败，请检查网络');
                }
            };

            // 每日用量检查与重置
            const checkAiQuota = () => {
                const today = getLocalDateKey(0);
                if (aiDailyUsage.date !== today) {
                    setAiDailyUsage({ date: today, count: 0 });
                    return 0;
                }
                return aiDailyUsage.count;
            };

            // 构建孩子学习上下文
            const buildChildContext = (childName) => {
                const childTasks = tasks[childName] || [];
                const childCheckins = checkins[childName] || {};
                const childStats = stats[childName] || {};
                const childAch = achievements[childName] || {};
                const today = getLocalDateKey(0);
                const weekAgo = getLocalDateKey(-7);
                const monthAgo = getLocalDateKey(-30);

                // 今日进度
                const activeTasks = childTasks.filter(t => !t.startDate || today >= t.startDate).filter(t => !t.earlyCompleted);
                const dailyMust = childTasks.filter(t => t.frequencyType === 'daily_must').filter(t => !t.startDate || today >= t.startDate).filter(t => !t.earlyCompleted);
                const todayCompleted = activeTasks.filter(t => childCheckins[t.id]?.[today]).length;
                const todayMinutes = activeTasks.reduce((sum, t) => sum + (childCheckins[t.id]?.[today] || 0), 0);

                // 本周进度
                let weekMinutes = 0, weekDays = new Set();
                childTasks.forEach(t => {
                    Object.entries(childCheckins[t.id] || {}).forEach(([date, mins]) => {
                        if (date >= weekAgo && date <= today) {
                            weekMinutes += mins;
                            weekDays.add(date);
                        }
                    });
                });

                // 本月统计
                let monthMinutes = 0, monthDays = new Set(), monthTaskBreakdown = {};
                childTasks.forEach(t => {
                    let taskDays = 0, taskMins = 0;
                    Object.entries(childCheckins[t.id] || {}).forEach(([date, mins]) => {
                        if (date >= monthAgo && date <= today) {
                            monthMinutes += mins;
                            monthDays.add(date);
                            taskDays++;
                            taskMins += mins;
                        }
                    });
                    if (taskDays > 0) monthTaskBreakdown[t.name] = { days: taskDays, minutes: taskMins };
                });

                // 连续打卡天数
                let currentStreak = 0;
                for (let i = 0; i < 365; i++) {
                    const d = getLocalDateKey(-i);
                    const dayHasCheckin = childTasks.some(t => childCheckins[t.id]?.[d]);
                    if (dayHasCheckin) currentStreak++;
                    else break;
                }

                // 最近成就
                const achList = Object.keys(childAch).slice(-5).map(id => {
                    const badge = (typeof AchievementSystem !== 'undefined' && AchievementSystem.BADGES) ? AchievementSystem.BADGES[id] : null;
                    return badge ? badge.name : id;
                });

                // 宠物信息
                const pet = petData[childName]?.[activePet[childName]];
                const petInfo = pet ? {
                    name: pet.nickname || '宠物',
                    mood: pet.stats?.mood || 50,
                    fullness: pet.stats?.fullness || 50,
                    cleanliness: pet.stats?.cleanliness || 50
                } : null;

                return JSON.stringify({
                    name: childName,
                    totalCheckins: Object.values(childCheckins).reduce((sum, t) => sum + Object.keys(t).length, 0),
                    totalMinutes: Object.values(childCheckins).reduce((sum, t) => sum + Object.values(t).reduce((s, m) => s + m, 0), 0),
                    streak: currentStreak,
                    earlyBirdStreak: childStats.earlyBirdStreak || 0,
                    weekendStreak: childStats.weekendStreak || 0,
                    today: { completed: todayCompleted, total: activeTasks.length, dailyMustTotal: dailyMust.length, minutes: todayMinutes },
                    week: { days: weekDays.size, minutes: weekMinutes },
                    month: { days: monthDays.size, minutes: monthMinutes, avgPerDay: monthDays.size > 0 ? Math.round(monthMinutes / monthDays.size) : 0, byTask: monthTaskBreakdown },
                    recentAchievements: achList,
                    gold: calculateTotalGold(checkins, wheelHistory, childName, activeBuffs, tasks),
                    pet: petInfo,
                    level: (() => {
                        let xp = Object.values(childCheckins).reduce((s, t) => s + Object.keys(t).length, 0) * 10;
                        xp += Object.values(childCheckins).reduce((s, t) => s + Object.values(t).reduce((a, m) => a + m, 0), 0);
                        const li = getLevelInfo(xp);
                        return `${li.level}级 ${li.name || ''}`;
                    })()
                });
            };

            // DeepSeek API 调用函数
            async function callDeepSeekAPI(systemPrompt, userMessage, chatHistory = []) {
                if (!aiEnabled || !deepseekApiKey) return null;
                const usage = checkAiQuota();
                if (usage >= aiDailyLimit) return '⚠️ 今日AI互动次数已达上限，明天再来吧~';

                try {
                    const messages = [{ role: 'system', content: systemPrompt }];
                    // 添加最近的对话历史（最多10条）
                    chatHistory.slice(-10).forEach(msg => {
                        messages.push({ role: msg.role, content: msg.text });
                    });
                    messages.push({ role: 'user', content: userMessage });

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
                    const response = await fetch('https://api.deepseek.com/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${deepseekApiKey}`
                        },
                        body: JSON.stringify({
                            model: 'deepseek-chat',
                            messages,
                            temperature: 0.7,
                            max_tokens: 500,
                            stream: false
                        }),
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        const err = await response.json().catch(() => ({}));
                        console.error('DeepSeek API error:', err);
                        return null;
                    }

                    const data = await response.json();
                    setAiDailyUsage(prev => {
                        const today = getLocalDateKey(0);
                        const currentCount = prev.date === today ? prev.count : 0;
                        return { date: today, count: currentCount + 1 };
                    });
                    return data.choices?.[0]?.message?.content || null;
                } catch (e) {
                    console.error('DeepSeek API call failed:', e);
                    return null;
                }
            };

            // 同步到 ref，避免闭包级联问题
            if (typeof callDeepSeekAPIRef !== 'undefined') callDeepSeekAPIRef.current = callDeepSeekAPI;

            // ===== 企业微信推送功能 =====

            // 节流检查：每种事件类型每孩子每天只推一次
            const canPushWecom = (eventType, childName) => {
                const today = getLocalDateKey(0);
                const key = `wecom_push_${eventType}_${childName}_${today}`;
                if (wecomPushLog[key]) return false;
                return true;
            };

            const markWecomPushed = (eventType, childName) => {
                const today = getLocalDateKey(0);
                const key = `wecom_push_${eventType}_${childName}_${today}`;
                setWecomPushLog(prev => ({ ...prev, [key]: true }));
            };

            // 发送企业微信消息（通过 Webhook）
            const sendWecomMessage = async (msgtype, content) => {
                if (!wecomEnabled || !wecomWebhookKey || !syncCode) return;
                try {
                    const resp = await fetch(`${WECOM_API_URL}/api/wecom/send`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ syncCode, msgtype, content })
                    });
                    if (!resp.ok) {
                        const err = await resp.json().catch(() => ({}));
                        console.warn('企业微信推送失败:', err.error);
                    }
                } catch (e) {
                    console.warn('企业微信推送异常:', e);
                }
            };

            // 事件1：每日必做全部完成
            const pushWecomDailyDone = (childName, completedTasks) => {
                if (!canPushWecom('dailyDone', childName)) return;
                const now = new Date();
                const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
                const taskList = completedTasks.map(t => `- ✅ ${t.name}`).join('\n');
                const content = `> 🎉 **${childName} 今日任务全部完成！**\n>\n> 📋 完成项目：\n${taskList}\n>\n> ⏰ 完成时间：${timeStr}\n> 💪 干得漂亮！今天的学习任务已全部拿下！`;
                sendWecomMessage('markdown', content);
                markWecomPushed('dailyDone', childName);
            };

            // 事件2：成就解锁
            const pushWecomAchievement = (childName, badge) => {
                if (!canPushWecom('achievement', childName)) return;
                const rarityMap = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' };
                const content = `> 🏆 **${childName} 解锁新成就！**\n>\n> 🎖️ 「${badge.name}」— ${badge.desc}\n> 📂 分类：${badge.category} | 稀有度：${rarityMap[badge.rarity] || badge.rarity}\n>\n> 继续加油，还有更多成就等着你！`;
                sendWecomMessage('markdown', content);
                markWecomPushed('achievement', childName);
            };

            // 事件3：等级提升
            const pushWecomLevelUp = (childName, oldLevel, newLevel) => {
                if (!canPushWecom('levelUp', childName)) return;
                const content = `> ⬆️ **${childName} 升级了！**\n>\n> 🎆 Lv.${oldLevel.level}「${oldLevel.name}」→ Lv.${newLevel.level}「${newLevel.name}」\n> 🏛️ 当前纪元：${newLevel.era}\n> 📝 ${newLevel.desc}\n>\n> 历史的车轮滚滚向前！`;
                sendWecomMessage('markdown', content);
                markWecomPushed('levelUp', childName);
            };

            // 事件4/5：作业/考试成绩
            const pushWecomGrade = (childName, type, subject, score, date) => {
                // 用唯一 key 去重（每次录入都推，不用每天一次限制）
                const uniqueKey = `wecom_grade_${type}_${childName}_${Date.now()}`;
                if (!wecomEnabled || !wecomWebhookKey || !syncCode) return;
                const icon = type === 'exam' ? '📝' : '📚';
                const typeName = type === 'exam' ? '考试成绩' : '作业成绩';
                const encouragement = score >= 90 ? '太棒了！继续保持！' : score >= 80 ? '很好！再接再厉！' : '继续努力，相信你会更好！';
                const content = `> ${icon} **${childName} ${typeName}**\n>\n> 📚 ${subject}：${score}分\n> 📅 ${date}\n>\n> ${encouragement}`;
                sendWecomMessage('markdown', content);
            };

            // 事件6/7：里程碑
            const pushWecomMilestone = (childName, type, count) => {
                const eventType = `milestone_${type}_${count}`;
                if (!canPushWecom(eventType, childName)) return;
                const icon = type === 'checkin' ? '🎯' : '💰';
                const label = type === 'checkin' ? '打卡里程碑' : '财富里程碑';
                const unit = type === 'checkin' ? '次打卡' : '金元宝';
                sendWecomMessage('text', `${icon} ${childName} 达成${label}：累计${count} ${unit}！`);
                markWecomPushed(eventType, childName);
            };

            // 事件8：23:59 每日完成情况汇总（未全部完成时）
            const pushWecomDailySummary = (childName, dailyMust, checkinsData) => {
                if (!canPushWecom('dailySummary', childName)) return;
                const today = getLocalDateKey(0);
                const isHoliday = isDateHolidayOrWeekend(today);

                // 彻底排除伴读任务与享受节假日豁免的任务
                const activeMust = dailyMust
                    .filter(t => !t.readingConfig?.isReading && t.frequencyType !== 'reading')
                    .filter(t => !(t.holidayExempt && isHoliday));
                if (activeMust.length === 0) return;

                const completed = [];
                const incomplete = [];
                activeMust.forEach(t => {
                    if (checkinsData[childName]?.[t.id]?.[today]) {
                        completed.push(t.name);
                    } else {
                        incomplete.push(t.name);
                    }
                });

                if (incomplete.length === 0) return; // 全部完成时不推（事件1已覆盖）

                // 伴读任务今日有读才汇总进展，没读绝不标 ❌
                const readingTasks = (tasks[childName] || []).filter(t => t.readingConfig?.isReading || t.frequencyType === 'reading');
                const readingDoneToday = readingTasks.filter(t => checkinsData[childName]?.[t.id]?.[today]);
                let readingSection = '';
                if (readingDoneToday.length > 0) {
                    const rList = readingDoneToday.map(t => {
                        const title = t.readingConfig?.bookTitle || t.name;
                        const cur = t.readingConfig?.currentProgress || 0;
                        return `- 📖 《${title}》（已读至第 ${cur} 页）`;
                    }).join('\n');
                    readingSection = `\n>\n> 📚 **伴读书阁今日进展：**\n${rList}`;
                }

                const rate = Math.round((completed.length / activeMust.length) * 100);
                const completedList = completed.map(n => `- ✅ ${n}`).join('\n') || '- （无）';
                const incompleteList = incomplete.map(n => `- ❌ ${n}`).join('\n');
                const content = `> 📊 **${childName} 今日学习情况**\n> 📅 ${today}\n>\n> ✅ 已完成：\n${completedList}\n>\n> ❌ 未完成：\n${incompleteList}${readingSection}\n>\n> 完成度：${completed.length}/${activeMust.length}（${rate}%）`;
                sendWecomMessage('markdown', content);
                markWecomPushed('dailySummary', childName);
            };

            // 事件9：连续全部完成 ≥3 天
            const pushWecomStreak = (childName, streakCount, startDate) => {
                const milestones = [3, 7, 14, 30];
                const milestone = milestones.find(m => m === streakCount);
                if (!milestone) return;
                const eventType = `streak_${streakCount}`;
                if (!canPushWecom(eventType, childName)) return;
                const content = `> 🔥 **${childName} 连续${streakCount}天全部完成每日任务！**\n>\n> 这份坚持太了不起了！从 ${startDate} 到今天，\n> ${childName} 每一天都完成了所有必做学习任务。\n>\n> 坚持就是胜利，继续加油！💪`;
                sendWecomMessage('markdown', content);
                markWecomPushed(eventType, childName);
            };

            // 计算连续全部完成 daily_must 的天数（排除伴读任务、生活习惯与节假日豁免）
            const calcDailyMustStreak = (childName, tasksData, checkinsData) => {
                const dailyMust = (tasksData[childName] || []).filter(t => t.frequencyType === 'daily_must' && !t.readingConfig?.isReading && !t.isHabit && t.frequencyType !== 'habit' && !t.habitConfig?.isHabit);
                if (dailyMust.length === 0) return { streak: 0, startDate: '' };
                let streak = 0;
                for (let i = 0; i < 365; i++) {
                    const d = getLocalDateKey(-i);
                    const isHoliday = isDateHolidayOrWeekend(d);
                    const allDone = dailyMust.every(t => {
                        if (t.holidayExempt && isHoliday) return true;
                        return !!checkinsData[childName]?.[t.id]?.[d];
                    });
                    if (allDone) streak++;
                    else break;
                }
                return { streak, startDate: getLocalDateKey(-(streak - 1)) };
            };

            // AI 学习助手 System Prompt
            const buildAssistantSystemPrompt = (childName) => {
                const context = buildChildContext(childName);
                return `你是「小星老师」，一个温暖、有趣、充满正能量的学习伙伴。你正在帮助${childName}完成每日学习任务。

当前学习数据：
${context}

你的职责：
1. 鼓励和肯定孩子的努力和进步
2. 根据学习数据给出具体、可执行的建议
3. 用孩子能理解的语言交流，适当使用emoji
4. 如果孩子表现好，热情地表扬
5. 如果孩子有困难，温和地给出建议，不要批评
6. 回复控制在100字以内

绝对禁止：
- 批评、责备、负面评价
- 涉及学校成绩排名的比较
- 与学习无关的话题
- 任何有害或不当内容`;
            };

            // --- 成就检查系统（薄包装层，核心逻辑在 achievements.js） ---
            function checkAchievements(triggerType, context = {}, extraData = {}) {
                const result = AchievementSystem.checkAchievements(triggerType, context, {
                    activeChild,
                    achievements,
                    checkins: extraData.checkins || checkins,
                    wheelHistory: extraData.wheelHistory || wheelHistory,
                    tasks,
                    stats: extraData.stats || stats,
                    totalGold,
                    exemptedDays,
                    profiles,
                    globalDates,
                    curriculumProgress: extraData.curriculumProgress || curriculumProgress,
                    currentXP,
                    levels: LEVELS,
                    colorPalettes: COLOR_PALETTES,
                    ownedPets: extraData.ownedPets || (typeof ownedPets !== 'undefined' ? ownedPets : undefined),
                    petData: extraData.petData || (typeof petData !== 'undefined' ? petData : undefined),
                    petStats: extraData.petStats || (typeof petStats !== 'undefined' ? petStats : undefined),
                    petAdventureStats: extraData.petAdventureStats || (typeof petAdventureStats !== 'undefined' ? petAdventureStats : undefined),
                    petAdventureLog: extraData.petAdventureLog || (typeof petAdventureLog !== 'undefined' ? petAdventureLog : undefined),
                });

                if (result.hasNew) {
                    setAchievements(prev => ({
                        ...prev,
                        [activeChild]: { ...(prev[activeChild] || {}), ...result.newBadges }
                    }));
                    setMilestones(prev => {
                        const existingTitles = new Set(
                            prev.filter(m => m.type === 'achievement' && m.member === activeChild).map(m => m.title)
                        );
                        const toAdd = result.milestones.filter(m => !existingTitles.has(m.title));
                        return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
                    });
                    setUnlockQueue(prev => [...prev, ...result.unlockQueue]);
                    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500'] });
                    // 企业微信推送：成就解锁
                    Object.keys(result.newBadges).forEach(badgeId => {
                        const badge = AchievementSystem.BADGES.find(b => b.id === badgeId);
                        if (badge) pushWecomAchievement(activeChild, badge);
                    });
                }
            };
            
            // 每次渲染都将最新的 checkAchievements 同步到 Ref，让 setTimeout 始终调用最新版本
            checkAchievementsRef.current = checkAchievements;

            // 企业微信推送：等级提升检测
            const wecomPrevLevelRef = React.useRef({ child: null, level: null });
            React.useEffect(() => {
                if (!wecomEnabled || !deepseekApiKey) return;
                const currentLevel = getLevelInfo(currentXP);
                // 切换孩子时重置，不触发升级推送
                if (wecomPrevLevelRef.current.child !== activeChild) {
                    wecomPrevLevelRef.current = { child: activeChild, level: currentLevel.level };
                    return;
                }
                if (wecomPrevLevelRef.current.level !== null && currentLevel.level > wecomPrevLevelRef.current.level) {
                    const oldLevel = LEVELS.find(l => l.level === wecomPrevLevelRef.current.level) || { level: wecomPrevLevelRef.current.level, name: '', era: '', desc: '' };
                    pushWecomLevelUp(activeChild, oldLevel, currentLevel);
                }
                wecomPrevLevelRef.current = { child: activeChild, level: currentLevel.level };
            }, [currentXP, wecomEnabled, deepseekApiKey, activeChild]);

            // 企业微信推送：23:59 每日完成情况汇总（覆盖所有孩子）
            React.useEffect(() => {
                if (!wecomEnabled || !wecomWebhookKey || !syncCode) return;
                const now = new Date();
                const today = getLocalDateKey(0);
                const msUntil2359 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0) - now;
                if (msUntil2359 < 0) {
                    // 已过 23:59：检查是否需要补发汇总
                    Object.keys(tasks).forEach(childName => {
                        const summaryKey = `wecom_push_dailySummary_${childName}_${today}`;
                        if (wecomPushLog[summaryKey]) return; // 已推过
                        const dailyMust = (tasks[childName] || []).filter(t => t.frequencyType === 'daily_must' && !t.readingConfig?.isReading && !t.isHabit && t.frequencyType !== 'habit' && !t.habitConfig?.isHabit);
                        if (dailyMust.length > 0) {
                            const allDone = dailyMust.every(t => checkins[childName]?.[t.id]?.[today]);
                            if (!allDone) {
                                pushWecomDailySummary(childName, dailyMust, checkins);
                            }
                        }
                    });
                    return;
                }
                const timer = setTimeout(() => {
                    Object.keys(tasks).forEach(childName => {
                        const dailyMust = (tasks[childName] || []).filter(t => t.frequencyType === 'daily_must' && !t.readingConfig?.isReading && !t.isHabit && t.frequencyType !== 'habit' && !t.habitConfig?.isHabit);
                        if (dailyMust.length > 0) {
                            pushWecomDailySummary(childName, dailyMust, checkins);
                        }
                    });
                }, msUntil2359);
                return () => clearTimeout(timer);
            }, [wecomEnabled, wecomWebhookKey, syncCode, tasks, checkins]);

			//大事纪数据核对与补全功能
			const handleSyncMilestones = () => {
				let addedCount = 0;
				const newMilestones = [...milestones];
				const existingIds = new Set(milestones.map(m => m.id));

				// 1. 从经验明细 (xpHistory) 中核对
				Object.keys(xpHistory).forEach(key => {
					// 格式: ChildName-EVENT-ID-Timestamp 或 ChildName-ACHIEVEMENT-ID-Timestamp
					const parts = key.split('-');
					if (parts.length >= 3) {
						const type = parts[1]; // EVENT 或 ACHIEVEMENT
						const id = parts[2];
						const timestamp = parseInt(parts[parts.length - 1]);
						const member = parts[0];
						const date = tsToLocalDateKey(timestamp);

						if (type === 'EVENT') {
							const milestoneId = `event-${id}-${timestamp}`;
							if (!existingIds.has(milestoneId)) {
								const event = RANDOM_EVENTS.find(e => e.id === id);
								newMilestones.push({
									id: milestoneId,
									type: 'event',
									date: date,
									timestamp: timestamp,
									member: member,
									title: `奇遇：${event ? event.title : '未知事件'}`,
									description: `获得 ${xpHistory[key]} XP`,
									icon: '✨'
								});
								existingIds.add(milestoneId);
								addedCount++;
							}
						} else if (type === 'ACHIEVEMENT') {
							const milestoneId = `achievement-${id}-${timestamp}`;
							if (!existingIds.has(milestoneId)) {
								const badge = ALL_ACHIEVEMENTS.find(a => a.id === id);
								newMilestones.push({
									id: milestoneId,
									type: 'achievement',
									date: date,
									timestamp: timestamp,
									member: member,
									title: `解锁成就：${badge ? badge.name : '未知成就'}`,
									description: badge ? badge.desc : '历史成就记录',
									icon: '🏆'
								});
								existingIds.add(milestoneId);
								addedCount++;
							}
						}
					}
				});

				// 2. 从金元宝明细 (wheelHistory) 中核对 (针对随机事件奖励元宝的情况)
				Object.keys(wheelHistory).forEach(key => {
					const parts = key.split('-');
					if (parts.length >= 3 && parts[1] === 'EVENT') {
						const id = parts[2];
						const timestamp = parseInt(parts[parts.length - 1]);
						const milestoneId = `event-${id}-${timestamp}`;
						if (!existingIds.has(milestoneId)) {
							const event = RANDOM_EVENTS.find(e => e.id === id);
							newMilestones.push({
								id: milestoneId,
								type: 'event',
								date: tsToLocalDateKey(timestamp),
								timestamp: timestamp,
								member: parts[0],
								title: `奇遇：${event ? event.title : '未知事件'}`,
								description: `获得 ${wheelHistory[key]} 元宝`,
								icon: '✨'
							});
							existingIds.add(milestoneId);
							addedCount++;
						}
					}
				});

				if (addedCount > 0) {
					setMilestones(newMilestones.sort((a, b) => b.timestamp - a.timestamp));
					alert(`✅ 核对完成！\n\n成功从历史明细中找回并补全了 ${addedCount} 条大事纪记录。`);
				} else {
					alert(`ℹ️ 核对完成！\n\n大事纪记录与明细数据完全一致，无需调整。`);
				}
			};
			
            // --- 清理重复成就 & 修复 undefined 标题（纠错工具）---
            const handleDeduplicateAchievements = () => {
                // 从 milestone ID 中提取 badgeId
                // 支持两种格式：
                //   achieve-BADGEID-TIMESTAMP      (checkAchievements 生成)
                //   achievement-BADGEID-TIMESTAMP  (handleSyncMilestones 生成)
                const extractBadgeId = (id = '') => {
                    const parts = id.split('-');
                    if ((parts[0] === 'achieve' || parts[0] === 'achievement') && parts.length >= 3) {
                        const last = parts[parts.length - 1];
                        if (/^\d{10,}$/.test(last)) {
                            return parts.slice(1, -1).join('-'); // 中间部分即 badgeId
                        }
                    }
                    return null;
                };

                let fixedCount = 0;
                let removedCount = 0;

                // ── 第一步：修复 title 含 undefined 的记录 ──
                const titleFixed = milestones.map(m => {
                    if (m.type !== 'achievement') return m;
                    const needsFix = !m.title || m.title.includes('undefined') || m.title === '解锁成就：';
                    if (!needsFix) return m;

                    // 尝试从 ID 中解析 badgeId
                    const badgeId = extractBadgeId(m.id);
                    if (!badgeId) return m;

                    const badge = BADGES.find(b => b.id === badgeId);
                    if (!badge) return m;

                    fixedCount++;
                    return {
                        ...m,
                        title: `解锁成就：${badge.name}`,
                        description: m.description && !m.description.includes('undefined') ? m.description : badge.desc,
                    };
                });

                // ── 第二步：对修复后的记录去重 ──
                // 以 `${member}::${title}` 为唯一键，保留时间最早的那条
                const seenMap = new Map();
                const others = [];
                const sortedFixed = [...titleFixed].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

                sortedFixed.forEach(m => {
                    if (m.type === 'achievement') {
                        const key = `${m.member}::${m.title}`;
                        if (!seenMap.has(key)) {
                            seenMap.set(key, m);
                        } else {
                            removedCount++;
                        }
                    } else {
                        others.push(m);
                    }
                });

                const result = [...seenMap.values(), ...others];

                if (fixedCount > 0 || removedCount > 0) {
                    setMilestones(result);
                    const parts = [];
                    if (fixedCount > 0) parts.push(`修复 ${fixedCount} 条标题异常（含 undefined）的成就记录`);
                    if (removedCount > 0) parts.push(`清理 ${removedCount} 条重复成就记录`);
                    alert(`✅ 纠错完成！\n\n${parts.join('\n')}`);
                } else {
                    alert('ℹ️ 没有发现任何问题，大事纪数据干净，无需修复。');
                }
            };

            // --- 等级系统更新后，从历史打卡记录重新计算升级大事纪节点 ---
            const handleRecalculateLevelMilestones = () => {
                // profiles 是数组，每项有 name 字段
                const profileList = Array.isArray(profiles) ? profiles : Object.values(profiles);
                if (!profileList.length) {
                    alert('未找到用户档案，请先创建用户后再试。');
                    return;
                }
                const allChildNames = profileList.map(p => p.name).filter(Boolean);

                const childrenLevelDates = {};
                const debugInfo = [];

                allChildNames.forEach(child => {
                    const childTasks = tasks[child] || [];
                    const childCheckins = checkins[child] || {};
                    const childAchs = achievements[child] || {};

                    // 构建日期→累计XP增量映射
                    const dateXP = {};
                    const addXP = (date, amount) => {
                        if (!date || !amount || isNaN(amount) || amount <= 0) return;
                        dateXP[date] = (dateXP[date] || 0) + amount;
                    };

                    // 1. 打卡经验（每次 10 XP）+ 任务金币奖励（1 金 = 1 XP）
                    let checkinCount = 0;
                    childTasks.forEach(task => {
                        const taskRecord = childCheckins[task.id] || {};
                        Object.keys(taskRecord).forEach(date => {
                            addXP(date, 10);
                            if (task.reward > 0) addXP(date, task.reward);
                            checkinCount++;
                        });
                        // 完赛奖励
                        if ((task.frequencyType || 'count') === 'count' && (task.completedReward || 0) > 0) {
                            const completedDates = Object.keys(taskRecord).sort();
                            if (completedDates.length >= (task.targetCount || 1)) {
                                const completionDate = completedDates[Math.min((task.targetCount || 1) - 1, completedDates.length - 1)];
                                addXP(completionDate, task.completedReward);
                            }
                        }
                    });

                    // 若 childTasks 为空但 childCheckins 有数据，直接从 checkins 中提取（兼容旧格式）
                    if (childTasks.length === 0 && Object.keys(childCheckins).length > 0) {
                        Object.entries(childCheckins).forEach(([taskId, taskRecord]) => {
                            if (typeof taskRecord === 'object') {
                                Object.keys(taskRecord).forEach(date => {
                                    addXP(date, 10);
                                    checkinCount++;
                                });
                            }
                        });
                    }

                    // 2. 成就经验
                    Object.entries(childAchs).forEach(([achId, date]) => {
                        const badge = BADGES.find(b => b.id === achId);
                        if (!badge || !date) return;
                        const xpMap = { common: 50, rare: 200, epic: 800, legendary: 3000 };
                        addXP(date, xpMap[badge.rarity] || 0);
                    });

                    // 3. 金币收入（从 wheelHistory 解析：含大转盘、历史事件金币等）
                    Object.entries(wheelHistory).forEach(([key, value]) => {
                        if (!key.startsWith(`${child}-`)) return;
                        if (key.includes('EVIL') || key.includes('SHOP') || key.includes('REDEEM')) return;
                        const parts = key.split('-');
                        const ts = parseInt(parts[parts.length - 1]);
                        if (isNaN(ts) || ts < 1000000000000) return;
                        const date = tsToLocalDateKey(ts);
                        const amount = typeof value === 'number' ? value : 0;
                        if (amount > 0) addXP(date, amount);
                    });

                    // 4. 直接经验值记录（xpHistory：历史事件XP、双倍符加成、大转盘XP等）
                    Object.entries(xpHistory).forEach(([key, value]) => {
                        if (!key.startsWith(`${child}-`)) return;
                        const parts = key.split('-');
                        const ts = parseInt(parts[parts.length - 1]);
                        if (!isNaN(ts) && ts > 1000000000000) {
                            const date = tsToLocalDateKey(ts);
                            addXP(date, typeof value === 'number' ? value : 0);
                        }
                    });

                    // 按日期升序排列，累积 XP，确定每个等级的达成日期
                    const sortedDates = Object.keys(dateXP).sort();
                    let runningXP = 0;
                    let nextLevelIdx = 1; // 从 Lv.2 开始
                    const levelDates = {};

                    sortedDates.forEach(date => {
                        runningXP += dateXP[date];
                        while (nextLevelIdx < LEVELS.length && runningXP >= LEVELS[nextLevelIdx].xp) {
                            levelDates[LEVELS[nextLevelIdx].level] = date;
                            nextLevelIdx++;
                        }
                    });

                    childrenLevelDates[child] = levelDates;
                    debugInfo.push(`${child}：累计 XP=${runningXP.toLocaleString()}，达成 ${Object.keys(levelDates).length} 个升级节点，打卡 ${checkinCount} 次`);
                });

                // 安全检查：如果所有用户均未计算出任何升级节点，说明数据不足，拒绝修改
                const totalNewMilestones = Object.values(childrenLevelDates).reduce((s, d) => s + Object.keys(d).length, 0);
                if (totalNewMilestones === 0) {
                    alert(`⚠️ 未能从历史记录中计算出任何升级节点，大事纪保持不变。\n\n调试信息：\n${debugInfo.join('\n')}\n\n可能原因：历史打卡记录不足，或数据格式需要检查。`);
                    return;
                }

                // 移除旧的 levelup 大事纪，按新系统重建
                const nonLevelMilestones = milestones.filter(m => m.type !== 'levelup');
                const newLevelMilestones = [];

                allChildNames.forEach(child => {
                    const levelDates = childrenLevelDates[child] || {};
                    Object.entries(levelDates).forEach(([levelStr, date]) => {
                        const level = parseInt(levelStr);
                        const levelInfo = LEVELS.find(l => l.level === level);
                        if (!levelInfo) return;
                        newLevelMilestones.push({
                            id: `levelup-${level}-${child}-recalc`,
                            type: 'levelup',
                            date: date,
                            timestamp: new Date(date + 'T12:00:00').getTime(),
                            member: child,
                            title: `升级至 Lv.${level}`,
                            description: `进化为「${levelInfo.name}」 - ${levelInfo.era}`,
                            level: level,
                            era: levelInfo.era,
                            icon: '⬆️'
                        });
                    });
                });

                setMilestones([...nonLevelMilestones, ...newLevelMilestones].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)));
                alert(`✅ 升级大事纪已按新等级系统重新计算完成！\n\n${debugInfo.join('\n')}\n\n共重建升级记录：${newLevelMilestones.length} 条`);
            };

		// --- 新增：修复背包功能 (从账单找回丢失商品) ---
            const handleFixInventory = () => {
                const history = wheelHistory;
                const currentInv = inventory[activeChild] || {};
                const boughtCounts = {};

                // 1. 扫描所有购买记录，统计应有总数
                Object.keys(history).forEach(key => {
                    if (key.startsWith(`${activeChild}-SHOP-`)) {
                        const itemId = key.split('-')[2];
                        boughtCounts[itemId] = (boughtCounts[itemId] || 0) + 1;
                    }
                });

                // 2. 对比背包，找出明显缺失的 (背包数量为0，但有购买记录的)
                // 注意：这里采取保守策略，只恢复背包里完全没有的。如果背包里有1个但买过5个，可能是用了，暂不自动恢复以免刷物品。
                let updates = {};
                let restoreMsg = [];
                
                Object.keys(boughtCounts).forEach(itemId => {
                    const currentCount = currentInv[itemId] || 0;
                    const boughtCount = boughtCounts[itemId];
                    
                    // 逻辑：如果我有购买记录，但背包里是0，极大可能是因为BUG丢失了
                    // 恢复数量 = 购买总数 (假设都没用过，或者宁可多给也不能少给)
                    if (currentCount === 0 && boughtCount > 0) {
                         updates[itemId] = boughtCount;
                         const itemDef = SHOP_ITEMS.find(i => i.id === itemId);
                         restoreMsg.push(`${itemDef ? itemDef.name : itemId} x${boughtCount}`);
                    }
                });

                if (Object.keys(updates).length > 0) {
                    setInventory(prev => {
                        const currentAll = { ...prev };
                        const childInv = { ...(currentAll[activeChild] || {}) };
                        
                        Object.entries(updates).forEach(([id, count]) => {
                            childInv[id] = count;
                        });
                        
                        currentAll[activeChild] = childInv;
                        return currentAll;
                    });
                    alert(`🔧 修复成功！\n\n系统检测到你有购买记录但背包为空，已补发以下商品：\n\n${restoreMsg.join('\n')}`);
                } else {
                    alert("✅ 背包检查完毕。\n\n未发现明显的丢失记录 (系统只补发背包中数量为0但有购买记录的商品)。\n\n如果确实还有问题，请尝试重新购买一次以激活数据。");
                }
            };

            useEffect(() => {
                const profile = profiles.find(p => p.name === activeChild);
                if (profile) {
                    setStats(prev => {
                        const childStats = prev[activeChild] || {};
                        const usedThemes = childStats.usedThemes || [];
                      if (!usedThemes.includes(profile.theme)) {
                            return { ...prev, [activeChild]: { ...childStats, usedThemes: [...usedThemes, profile.theme] } };
                        }
                        return prev;
                    });
                    // 通过 Ref 调用最新版函数，避免陈旧闭包导致重复解锁成就
                    setTimeout(() => checkAchievementsRef.current && checkAchievementsRef.current('theme'), 500);
					
					// 【新增】延迟1秒后强制检查一次打卡类成就，以触发“翻译大师”等漏掉的奖励
					setTimeout(() => checkAchievementsRef.current && checkAchievementsRef.current('checkin'), 1000);
                }
            }, [activeChild, profiles]);

			// 【新增】测试结算功能的函数
			// 周末冲刺结算计算（共用：测试结算 + 自动触发）
            const computeWeekendSettlement = (childName) => {
                const childTasks = tasks[childName] || [];
                const childCheckins = checkins[childName] || {};
                const todayKey = getLocalDateKey(0);
                // 只统计进行中的任务，排除已达成目标并进入目标达成墙的「按总次数」任务
                const isOngoing = (t) => {
                const freq = t.frequencyType || 'count';
                if (freq === 'daily_must' || freq === 'weekly_optional') return !t.earlyCompleted;
                const count = Object.keys(childCheckins[t.id] || {}).length;
                return count < (t.targetCount || 0);
                };
                const ongoingTasks = childTasks.filter(isOngoing);
                const coreTasks = ongoingTasks.filter(t => t.type === 'core');
                const dailyTasks = ongoingTasks.filter(t => t.type !== 'core');
                const calc = (list) => {
                    if (!list || list.length === 0) return { count: 0, total: 0, percent: 0 };
                    const completed = list.filter(t => childCheckins[t.id]?.[todayKey]).length;
                    return { count: completed, total: list.length, percent: Math.round((completed / list.length) * 100) };
                };
                const coreStats = calc(coreTasks);
                const dailyStats = calc(dailyTasks);
                const coreThreshold = weekendSettings.coreThreshold || 80;
                const dailyThreshold = weekendSettings.dailyThreshold || 50;
                const coreMet = coreStats.percent >= coreThreshold;
                const dailyMet = dailyStats.percent >= dailyThreshold;
                let type = 'fail';
                if (coreStats.percent === 100 && dailyStats.percent === 100 && coreTasks.length > 0) type = 'perfect';
                else if (coreMet && dailyMet) type = 'pass';
                const perfectReward = Math.max(0, parseInt(weekendSettings.perfectReward, 10) || 100);
                const passReward = Math.max(0, parseInt(weekendSettings.passReward, 10) || 60);
                const reward = type === 'perfect' ? perfectReward : (type === 'pass' ? passReward : 0);
                return { type, coreStats, dailyStats, reward };
            };

            // 【修正版】测试结算：仅弹出结果，不发放奖励（奖励在弹窗内点击领取时发放）
            const handleTestSettlement = () => {
                const result = computeWeekendSettlement(activeChild);
                setSettlementState(result);
                setShowSettings(false);
            };

            // 修改：需要密码验证才能打开设置
            const handleOpenSettings = (targetTab = 'parent') => {
                if (settingsPassword) {
                    const input = prompt("请输入家长密码：");
                    if (input !== settingsPassword) {
                        showToast('error', '密码错误，无法进入设置页面。');
                        return;
                    }
                }
                setSettingsInitialTab(typeof targetTab === 'string' ? targetTab : 'parent');
                setShowSettings(true);
                checkAchievements('settings'); 
            };

            // 周末冲刺：达到要求时自动弹出结算（仅当已启用且本周末尚未结算，且本页未弹过）
            useEffect(() => {
                if (!weekendSettings.enabled) return;
                const now = new Date();
                const day = now.getDay();
                if (day !== 0 && day !== 6) return;
                const weekendKey = getCurrentWeekendKey();
                const lastSettled = weekendSettings.lastSettledWeekend || {};
                if (lastSettled[activeChild] === weekendKey) return;
                if (weekendAutoShownRef.current === weekendKey) return; // 本次会话已弹过
                const result = computeWeekendSettlement(activeChild);
                if (result.type === 'pass' || result.type === 'perfect') {
                    weekendAutoShownRef.current = weekendKey;
                    setSettlementState(result);
                }
            }, [weekendSettings.enabled, weekendSettings.lastSettledWeekend, activeChild, tasks, checkins, weekendSettings.coreThreshold, weekendSettings.dailyThreshold]);

            const scrollToToday = () => {
                setCalendarViewMonth(null);
                setTimeout(() => {
                    if (todayRef.current && scrollContainerRef.current) {
                        const container = scrollContainerRef.current;
                        const element = todayRef.current;
                        const offsetLeft = element.offsetLeft;
                        const containerWidth = container.clientWidth;
                        const elementWidth = element.clientWidth;
                        container.scrollTo({ left: offsetLeft - containerWidth / 2 + elementWidth / 2, behavior: 'smooth' });
                    }
                }, 50);
            };

            // 计算今天的碎片完成情况（用于惊喜大转盘）：支持按比例 / 按数量 / 按每日必做
            const todayFragmentStats = useMemo(() => {
                const today = getLocalDateKey(0);
                const childTasks = tasks[activeChild] || [];
                const activeTasks = childTasks.filter(t => !t.startDate || today >= t.startDate).filter(t => !t.earlyCompleted);
                const activeDailyMust = childTasks.filter(t => t.frequencyType === 'daily_must').filter(t => !t.startDate || today >= t.startDate).filter(t => !t.earlyCompleted);
                let completedCount = 0;
                let requiredCount = 1;
                if (wheelSettings.thresholdType === 'daily_must') {
                    activeDailyMust.forEach(t => { if (checkins[activeChild]?.[t.id]?.[today]) completedCount++; });
                    requiredCount = Math.max(1, activeDailyMust.length);
                } else {
                    activeTasks.forEach(t => { if (checkins[activeChild]?.[t.id]?.[today]) completedCount++; });
                    if (wheelSettings.thresholdType === 'percent') requiredCount = Math.ceil(activeTasks.length * (wheelSettings.thresholdValue / 100));
                    else requiredCount = wheelSettings.thresholdValue;
                    if (requiredCount < 1) requiredCount = 1;
                }
                return { completed: completedCount, required: requiredCount };
            }, [tasks, activeChild, checkins, wheelSettings]);

            // === 【新增】工具函数：计算上一周的周一和周日（用于周学习工资结算） ===
            const getLastWeekRange = () => {
                const today = new Date();
                const day = today.getDay(); // 0 周日, 1 周一 ...
                // 以周一为一周开始：当前周一 = 今日 - ((day + 6) % 7)
                const currentMonday = new Date(today);
                const diffToMonday = (day + 6) % 7;
                currentMonday.setDate(today.getDate() - diffToMonday);
                // 上一周周一 = 当前周一 - 7 天
                const lastMonday = new Date(currentMonday);
                lastMonday.setDate(currentMonday.getDate() - 7);
                const lastSunday = new Date(lastMonday);
                lastSunday.setDate(lastMonday.getDate() + 6);

                const format = (d) => {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    return `${y}-${m}-${dd}`;
                };

                return {
                    weekStart: format(lastMonday),
                    weekEnd: format(lastSunday)
                };
            };

            // === 【新增】核心函数：根据上一周的打卡记录计算“周学习工资” ===
            const calculateWeeklyPayrollForChild = (childName) => {
                const childTasks = tasks[childName] || [];
                const childCheckins = checkins[childName] || {};
                if (!childTasks.length) return null;

                const { weekStart, weekEnd } = getLastWeekRange();

                // 仅当该周已领取过工资时才用缓存；未领取时按最新打卡（含补签）重算
                const childPayroll = weeklyPayroll[childName] || {};
                const weekKey = `${weekStart}_${weekEnd}`;
                if (childPayroll[weekKey] && childPayroll[weekKey].claimed) {
                    return { weekKey, ...childPayroll[weekKey] };
                }

                // 将日期字符串转为 Date 方便比较
                const toDate = (str) => new Date(str + 'T00:00:00');
                const startDate = toDate(weekStart);
                const endDate = toDate(weekEnd);

                const items = [];
                let totalReward = 0;

                const inRange = (dateStr) => {
                    const d = toDate(dateStr);
                    return d >= startDate && d <= endDate;
                };

                childTasks.forEach(task => {
                const freq = task.frequencyType || 'count';
                if (task.earlyCompleted) return; // 已提前达成的任务不参与周结算
					const record = childCheckins[task.id] || {};

                    // 仅对“每日必做 / 每周选做”参与周工资结算
                    if (freq === 'weekly_optional') {
                        const weeklyTarget = task.weeklyTargetCount ?? 3;
                        const extraPercent = task.weeklyExtraPercentPerExtra ?? 10;

                        // 统计上一周内的完成天数（同时满足任务起止日期）
                        const doneDates = Object.keys(record).filter(date => {
                            if (!inRange(date)) return false;
                            if (task.startDate && date < task.startDate) return false;
                            if (task.deadline && date > task.deadline) return false;
                            return true;
                        });
                        const doneCount = doneDates.length;

                        let taskReward = 0;
                        let extraReward = 0;
                        let reached = false;

                        if (doneCount >= weeklyTarget && task.completedReward > 0) {
                            reached = true;
                            const base = task.completedReward;
                            const extra = Math.max(0, doneCount - weeklyTarget);
                            extraReward = Math.floor(base * (extraPercent / 100) * extra);
                            taskReward = base + extraReward;
                            totalReward += taskReward;
                        }

                        items.push({
                            id: task.id,
                            name: task.name,
                            type: 'weekly_optional',
                            weeklyTarget,
                            doneCount,
                            extraPercent,
                            baseReward: task.completedReward || 0,
                            extraReward,
                            total: taskReward,
                            reached
                        });
                    } else if (freq === 'daily_must') {
                        const threshold = (task.dailyCompletionThresholdPercent ?? 80);

                        // 统计上一周内应打卡的天数 & 实际完成的天数
                        let requiredDays = 0;
                        let doneDays = 0;

                        // 从周一到周日遍历
                        const cur = toDate(weekStart);
                        while (cur <= endDate) {
                            const y = cur.getFullYear();
                            const m = String(cur.getMonth() + 1).padStart(2, '0');
                            const dd = String(cur.getDate()).padStart(2, '0');
                            const dateStr = `${y}-${m}-${dd}`;

                            // 必须在任务有效期内才算“应打卡”
                            const inTaskRange = (!task.startDate || dateStr >= task.startDate) &&
                                                (!task.deadline || dateStr <= task.deadline);
                            if (inTaskRange) {
                                requiredDays += 1;
                                if (record[dateStr]) doneDays += 1;
                            }

                            cur.setDate(cur.getDate() + 1);
                        }

                        let taskReward = 0;
                        let reached = false;
                        let rate = 0;

                        if (requiredDays > 0) {
                            rate = doneDays / requiredDays;
                            if (rate >= threshold / 100 && task.completedReward > 0) {
                                reached = true;
                                // 达到阈值即给满额奖励，不按比例折损
                                taskReward = task.completedReward;
                                totalReward += taskReward;
                            }
                        }

                        items.push({
                            id: task.id,
                            name: task.name,
                            type: 'daily_must',
                            requiredDays,
                            doneDays,
                            thresholdPercent: threshold,
                            rate,
                            baseReward: task.completedReward || 0,
                            total: taskReward,
                            reached
                        });
                    }
                });

                if (!items.length) return null;

                return {
                    weekKey,
                    weekStart,
                    weekEnd,
                    totalReward,
                    items
                };
            };

            const checkWheelTrigger = (currentCheckins, child) => {
				const today = getLocalDateKey(0);
				const now = new Date();
				if (now.getHours() >= wheelSettings.deadlineHour) return; 

				// 检查这两种历史记录，如果今天已经转过任意一种，就不再自动触发（或者是根据需求，两者互斥）
				// 假设逻辑是：每天触发一次大满贯，可以选择金币或XP
				const goldKey = `${child}-${today}`;
				const xpKey = `${child}-XP_WHEEL-${today}`;

				if (wheelHistory[goldKey] || xpHistory[xpKey]) return; // 今天已经拿过大满贯奖励了

				const childTasks = tasks[child] || [];
				const activeTasks = childTasks.filter(t => !t.startDate || today >= t.startDate);
				const activeDailyMust = childTasks.filter(t => t.frequencyType === 'daily_must').filter(t => !t.startDate || today >= t.startDate);
				let completedCount = 0;
				let requiredCount = 1;
				if (wheelSettings.thresholdType === 'daily_must') {
					activeDailyMust.forEach(t => { if (currentCheckins[child]?.[t.id]?.[today]) completedCount++; });
					requiredCount = Math.max(1, activeDailyMust.length);
				} else {
					activeTasks.forEach(t => { if (currentCheckins[child]?.[t.id]?.[today]) completedCount++; });
					requiredCount = wheelSettings.thresholdType === 'percent' ? Math.ceil(activeTasks.length * (wheelSettings.thresholdValue / 100)) : wheelSettings.thresholdValue;
					if (requiredCount < 1) requiredCount = 1;
				}

				if (completedCount >= requiredCount) {
					setTimeout(() => {
						// 触发选择弹窗
						setShowWheelChoice(true);
						confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
					}, 500);
				}
			};

            // === 【新增】检查上一周是否有可结算的“周学习工资” ===
            useEffect(() => {
                if (!activeChild) return;

                const payroll = calculateWeeklyPayrollForChild(activeChild);
                if (!payroll) {
                    setWeeklyPayrollToClaim(null);
                    return;
                }

                const { weekKey, weekStart, weekEnd, totalReward, items } = payroll;

                // 如果已经存在记录，且标记为已领取，则只作为历史，不再弹按钮
                const childPayroll = weeklyPayroll[activeChild] || {};
                if (childPayroll[weekKey] && childPayroll[weekKey].claimed) {
                    setWeeklyPayrollToClaim(null);
                    return;
                }

                // 有未领取的周学习工资时，点亮“工资信封”按钮
                setWeeklyPayrollToClaim({
                    weekKey,
                    weekStart,
                    weekEnd,
                    totalReward,
                    items
                });
            }, [activeChild, tasks, checkins, weeklyPayroll]);
            
            // --- 升级后的随机事件触发逻辑（历史2/天、固定1/天、重复1-2/天）---
            const checkRandomEventTrigger = (childName, isFuture, currentCheckins) => {
                const today = getLocalDateKey(0);
                const dailyKey = `${childName}-${today}`;
                // 获取今天各类型已触发次数
                const typeCounts = dailyEventTypeCounts[dailyKey] || { hist: 0, uniq: 0, rep: 0 };
                const totalToday = (typeCounts.hist || 0) + (typeCounts.uniq || 0) + (typeCounts.rep || 0);

                // 每日最多 5 个事件（2历史+1固定+2重复）
                if (totalToday >= 5) return;

                // 2. 概率判定：根据剩余任务数调整
                let probability = 0.75;
                if (!isFuture) {
                    const childTasks = tasks[childName] || [];
                    const activeTasks = childTasks.filter(t => !t.startDate || today >= t.startDate);
                    const totalActive = activeTasks.length;
                    let completedCount = 0;
                    activeTasks.forEach(t => { if (currentCheckins[childName]?.[t.id]?.[today]) completedCount++; });
                    const slotsAfterThis = totalActive - completedCount;
                    if (slotsAfterThis === 0) probability = 1.0;
                    else if (slotsAfterThis <= 2) probability = 0.9;
                    else if (totalToday >= 3) probability = 0.5;
                    else probability = 0.75;
                }

                if (Math.random() >= probability) return;

                const levelInfo = getLevelInfo(currentXP);
                const currentEra = levelInfo.era;
                const childUniqueHistory = randomEventHistory[childName] || [];
                const childHistProgress = new Set(historicalEventProgress[childName] || []);
                const histEvents = (typeof HISTORICAL_EVENTS !== 'undefined') ? HISTORICAL_EVENTS : [];

                // 3. 根据剩余配额决定触发哪种类型（加权随机）
                const histRemain = Math.max(0, 2 - (typeCounts.hist || 0));
                const uniqRemain = Math.max(0, 1 - (typeCounts.uniq || 0));
                const repRemain = Math.max(0, 2 - (typeCounts.rep || 0));

                const typePool = [];
                for (let i = 0; i < histRemain; i++) typePool.push('history');
                for (let i = 0; i < uniqRemain; i++) typePool.push('unique');
                for (let i = 0; i < repRemain; i++) typePool.push('repeat');

                if (typePool.length === 0) return;

                // 随机选一种类型尝试，如果该类型没有可用事件则尝试其他类型
                const shuffledTypes = typePool.sort(() => Math.random() - 0.5);
                const triedTypes = new Set();
                let selectedEvent = null;
                let typeToTry = '';

                for (const t of shuffledTypes) {
                    if (triedTypes.has(t)) continue;
                    triedTypes.add(t);
                    typeToTry = t;

                    if (t === 'history') {
                        const nextHist = histEvents.find(ev => {
                            if (childHistProgress.has(ev.id)) return false;
                            const minLevel = LEVELS.find(l => l.name === ev.minLevelName);
                            return !minLevel || levelInfo.level >= minLevel.level;
                        });
                        if (nextHist) { selectedEvent = nextHist; break; }
                    } else if (t === 'unique') {
                        const available = RANDOM_EVENTS.filter(ev => {
                            if (ev.type !== 'unique') return false;
                            if (ev.era !== currentEra) return false;
                            if (childUniqueHistory.includes(ev.id)) return false;
                            const minLevel = LEVELS.find(l => l.name === ev.minLevelName);
                            return !minLevel || levelInfo.level >= minLevel.level;
                        });
                        if (available.length > 0) { selectedEvent = available[Math.floor(Math.random() * available.length)]; break; }
                    } else {
                        const available = RANDOM_EVENTS.filter(ev => {
                            if (ev.type !== 'repeat') return false;
                            if (ev.era !== currentEra) return false;
                            const minLevel = LEVELS.find(l => l.name === ev.minLevelName);
                            return !minLevel || levelInfo.level >= minLevel.level;
                        });
                        if (available.length > 0) { selectedEvent = available[Math.floor(Math.random() * available.length)]; break; }
                    }
                }

                if (!selectedEvent) return;

                setTimeout(() => {
                    setCurrentRandomEvent(selectedEvent);
                    setShowRandomEvent(true);
                    // 更新分类计数
                    setDailyEventTypeCounts(prev => {
                        const cur = prev[dailyKey] || { hist: 0, uniq: 0, rep: 0 };
                        const updated = { ...cur };
                        if (typeToTry === 'history') updated.hist = (updated.hist || 0) + 1;
                        else if (typeToTry === 'unique') updated.uniq = (updated.uniq || 0) + 1;
                        else updated.rep = (updated.rep || 0) + 1;
                        return { ...prev, [dailyKey]: updated };
                    });
                    // 兼容旧的 dailyRandomCounts
                    setDailyRandomCounts(prev => ({...prev, [dailyKey]: totalToday + 1}));
                    // 固定事件记录已触发历史
                    if (typeToTry === 'unique') {
                        setRandomEventHistory(prev => ({
                            ...prev,
                            [childName]: [...(prev[childName] || []), selectedEvent.id]
                        }));
                    }
                    // 历史事件记录进度
                    if (typeToTry === 'history') {
                        setHistoricalEventProgress(prev => ({
                            ...prev,
                            [childName]: [...(prev[childName] || []), selectedEvent.id]
                        }));
                    }
                }, 800);
            };
			
            const handleClaimRandomReward = () => {
                if (!currentRandomEvent) return;

                // 统一处理 rewards 数组（新格式）和 rewardType/rewardValue（旧格式）
                const rewardList = currentRandomEvent.rewards
                    || [{ type: currentRandomEvent.rewardType, value: currentRandomEvent.rewardValue }];

                const ts = Date.now();
                const todayDate = getLocalDateKey(0);
                rewardList.forEach((r, idx) => {
                    const key = `${activeChild}-EVENT-${currentRandomEvent.id}-${ts}${idx > 0 ? '-' + idx : ''}`;
                    if (r.type === 'gold') {
                        setWheelHistory(prev => ({ ...prev, [key]: r.value }));
                        updateStats(activeChild, 'gold_earn', r.value, { source: 'event', dateKey: todayDate });
                    } else {
                        setXpHistory(prev => ({ ...prev, [key]: r.value }));
                    }
                });

                // 构建奖励描述
                const rewardDesc = rewardList.map(r =>
                    `${r.value > 0 ? '+' : ''}${r.value} ${r.type === 'gold' ? '元宝' : 'XP'}`
                ).join('，');

                // 大事纪记录
                const isHistory = currentRandomEvent.type === 'history';
                setMilestones(prev => [...prev, {
                    id: `event-${currentRandomEvent.id}-${ts}`,
                    type: 'event',
                    date: todayDate,
                    timestamp: ts,
                    member: activeChild,
                    title: `${isHistory ? '历史事件' : '时空奇遇'}：${currentRandomEvent.title}`,
                    description: rewardDesc,
                    reward: rewardList[0]?.value,
                    rewardType: rewardList[0]?.type,
                    icon: isHistory ? '📅' : '✨'
                }]);

                setShowRandomEvent(false);
                setCurrentRandomEvent(null);
                // 历史事件用古铜色彩 confetti
                if (isHistory) {
                    confetti({ particleCount: 80, spread: 55, origin: { y: 0.7 }, colors: ['#92400e', '#d97706', '#fbbf24'] });
                } else {
                    confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 }, colors: ['#a855f7', '#fbbf24'] });
                }
            };

            
            const handleCellClick = (taskId, date) => {
                const task = (tasks[deferredActiveChild] || []).find(t => t.id === taskId);
                if (!task) return;
                if (task.startDate && date < task.startDate) return;
                if (task.deadline && date > task.deadline) return;

                const today = getLocalDateKey(0);
                // 伴读任务专属：若点击的是今天，直接打开专属阅读伴读快速登记小窗
                if (task.readingConfig?.isReading && date === today) {
                    setReadingTaskForCheckin(task);
                    setShowReadingQuickCheckin(true);
                    return;
                }

                const childData = checkins[deferredActiveChild] || {};
                const taskData = childData[taskId] || {};
                const rawVal = taskData[date];
                const isMultiTaskType = task.multiCheckin && task.frequencyType === 'daily_must';
                const hasExistingRecord = rawVal !== undefined && rawVal !== null && rawVal !== '' && !(isMultiTaskType && Array.isArray(rawVal) && rawVal.length === 0);
                // 多次打卡：始终让用户输入本次时长，不预设值
                const existingDuration = isMultiTaskType ? ''
                    : hasExistingRecord
                        ? (typeof rawVal === 'number' ? rawVal : (rawVal === '免' ? '' : (rawVal || '')))
                        : '';
                setEditingEntry({ taskId, date, duration: existingDuration || '', isNew: !hasExistingRecord, sessionIndex: null });
            };

			// === 处理断签单元格的点击操作 ===
			const handleMissedDayClick = (dateStr) => {
				const exemptionCode = String(Math.floor(1000 + Math.random() * 9000));
				setExemptionModal({ date: dateStr, exemptionCode });
				setExemptionInputCode('');
			};

            // saveCheckin function updated to include buffs and shop logic
            const saveCheckin = (duration, units = 0, sessionIndex = null) => {
                if (saveCheckinLockRef.current) return; // 防重复提交
                saveCheckinLockRef.current = true;
                setTimeout(() => { saveCheckinLockRef.current = false; }, 500);

                if (!editingEntry) return;
                if (!duration || isNaN(duration) || parseInt(duration) <= 0) return;

                const currentTask = (tasks[activeChild] || []).find(t => t.id === editingEntry.taskId);
                if (!currentTask) return;
                const isMulti = currentTask.multiCheckin && currentTask.frequencyType === 'daily_must';
                const isEditMode = isMulti && sessionIndex !== null && sessionIndex >= 0;
                // 多次打卡且设置了单位标签时，单位不能为 0
                if (isMulti && currentTask.multiUnitLabel && (!units || parseInt(units) <= 0)) {
                    showToast('warning', `请填写本次完成的${currentTask.multiUnitLabel}数量（至少为 1）`);
                    return;
                }
                const newCheckins = { ...checkins };
                const childData = newCheckins[activeChild] || {};
                const taskData = childData[editingEntry.taskId] || {};

                // 统一的 session 时间戳：让「条目 t / 金元宝 key / 星星 key」三者共用同一值，
                // 避免各自调用 Date.now() 导致对不上（否则删除星星删不掉、编辑重复发星）
                // 编辑模式复用该 session 原始时间戳；新增用新时间戳；普通任务不需要，为 0
                let sessionTimestamp = 0;
                if (isMulti) {
                    if (isEditMode) {
                        const existingEntries = getCheckinEntries(taskData, editingEntry.date);
                        sessionTimestamp = existingEntries[sessionIndex]?.t || Date.now();
                    } else {
                        sessionTimestamp = Date.now();
                    }
                }

                // 多次打卡：数组存储；普通打卡：数字存储
                if (isMulti) {
                    const existingVal = taskData[editingEntry.date];
                    const existingArr = typeof existingVal === 'number' ? [{ m: existingVal, u: 0, t: Date.now() - 1 }]
                        : (Array.isArray(existingVal) ? [...existingVal] : []);
                    if (isEditMode) {
                        // 编辑：覆盖指定索引的条目，保留原始时间戳（与 key 后缀一致）
                        existingArr[sessionIndex] = { m: parseInt(duration), u: parseInt(units) || 0, t: sessionTimestamp };
                    } else {
                        // 新增：追加，条目 t 与后续 key 后缀共用 sessionTimestamp
                        existingArr.push({ m: parseInt(duration), u: parseInt(units) || 0, t: sessionTimestamp });
                    }
                    newCheckins[activeChild] = { ...childData, [editingEntry.taskId]: { ...taskData, [editingEntry.date]: existingArr } };
                } else {
                    newCheckins[activeChild] = { ...childData, [editingEntry.taskId]: { ...taskData, [editingEntry.date]: parseInt(duration) } };
                }
                setCheckins(newCheckins);
                setEditingEntry(null);
                triggerSyncUpload(); // 自动云同步
                // 1. 计算当前时刻的真实倍率
                let multiplier = 1;
                const childBuffs = activeBuffs[activeChild] || {};
                const today = getLocalDateKey(0);
                const investStart = childBuffs.investStart || (childBuffs.investExpire ? dateKeySubtractDays(childBuffs.investExpire, 30) : today);
                if (childBuffs.investMultiplier > 1 && childBuffs.investExpire && today <= childBuffs.investExpire && today >= investStart) {
                    multiplier = childBuffs.investMultiplier;
                }

                // 2. 金元宝计算
                // 有单位标签时按累计单位数逐进计算（每个单位独立乘阶），无单位标签时按打卡次数
                let finalReward;
                if (isMulti && currentTask.multiUnitLabel) {
                    const prevUnits = isEditMode ? todaySessions.slice(0, sessionIndex).reduce((s, e) => s + (e.u || 0), 0) : getCheckinUnits(taskData, editingEntry.date);
                    const thisUnits = parseInt(units) || 1;
                    let total = 0;
                    for (let u = 1; u <= thisUnits; u++) {
                        total += currentTask.reward * (prevUnits + u) * multiplier;
                    }
                    finalReward = total;
                } else if (isMulti) {
                    const sessionN = isEditMode ? (sessionIndex + 1) : (getCheckinSessionCount(taskData, editingEntry.date) + 1);
                    finalReward = currentTask.reward * sessionN * multiplier;
                } else {
                    finalReward = currentTask.reward * multiplier;
                }
                // 3. 写入历史账单（实现快照）
                // sessionTimestamp 已统一（编辑=原始 t，新增=新时间戳），金元宝/星星 key 共用它
                const historyKey = isMulti
                    ? `${activeChild}-TASK-${editingEntry.taskId}-${editingEntry.date}_${sessionTimestamp}`
                    : `${activeChild}-TASK-${editingEntry.taskId}-${editingEntry.date}`;
                setWheelHistory(prev => ({
                    ...prev,
                    [historyKey]: finalReward
                }));

                // 4. 埋点统计（编辑模式不重复统计 checkin 次数，只更新 gold_earn）
                const statDateKey = editingEntry.date || getLocalDateKey(0);
                if (!isEditMode) updateStats(activeChild, 'checkin', 1, { taskName: currentTask.name, dateKey: statDateKey });
                if (multiplier > 1) {
                    updateStats(activeChild, 'gold_earn', finalReward, { source: 'invest_bonus', dateKey: statDateKey });
                } else {
                    updateStats(activeChild, 'gold_earn', finalReward, { source: 'task', dateKey: statDateKey });
                }
                // --- 处理双倍经验Buff ---
                const xpBuffs = activeBuffs[activeChild] || {};
                if (xpBuffs.xpBoost > 0 && xpBuffs.xpBoostCount > 0) {
                    const extraXP = 10 * (xpBuffs.xpBoost - 1); // 基础10XP，额外加成
                    const key = `${activeChild}-BUFF_XP-${Date.now()}`;
                    setXpHistory(prev => ({ ...prev, [key]: extraXP }));
                    
                    setActiveBuffs(prev => ({
                        ...prev,
                        [activeChild]: {
                            ...xpBuffs,
                            xpBoostCount: xpBuffs.xpBoostCount - 1,
                            xpBoost: xpBuffs.xpBoostCount - 1 <= 0 ? 0 : xpBuffs.xpBoost
                        }
                    }));
                }

                // --- 发放星星奖励 ---
                // starKey 与条目 t / 金元宝 key 共用 sessionTimestamp：
                // 编辑模式下 key 与原始一致（幂等，不会重复发星）；删除记录时也能按同一时间戳精确清理
                const STAR_PER_CHECKIN = 3;
                const starKey = isMulti
                    ? `${activeChild}-STAR_CHECKIN-${editingEntry.taskId}-${editingEntry.date}_${sessionTimestamp}`
                    : `${activeChild}-STAR_CHECKIN-${editingEntry.taskId}-${editingEntry.date}`;
                if (!starHistory[starKey]) {
                    setStarHistory(prev => ({ ...prev, [starKey]: STAR_PER_CHECKIN }));
                }

                // --- 多次打卡奖励触发器 (Phase 5.5) ---
                if (isMulti && editingEntry.isNew && currentTask.bonusThreshold > 0) {
                    const taskRecord = checkins[activeChild]?.[currentTask.id] || {};
                    const todaySessions = getCheckinEntries(taskRecord, today);
                    const cumulative = currentTask.bonusThresholdType === 'units'
                        ? todaySessions.reduce((s, e) => s + (e.u || 0), 0)
                        : todaySessions.length + 1;
                    if (cumulative % currentTask.bonusThreshold === 0) {
                        if (currentTask.bonusType === 'wheel') {
                            setTimeout(() => handleLaunchExtraWheel('gold'), 300);
                            showToast('success', `🎡 累计完成 ${cumulative} 次！转盘启动！`);
                        } else {
                            // 金元宝翻倍 — 在基础之上再乘以 bonusMultiplier
                            const bonusGold = finalReward * (currentTask.bonusMultiplier - 1);
                            const bonusKey = `${activeChild}-BONUS_MULTI-${editingEntry.taskId}-${editingEntry.date}_${sessionTimestamp}`;
                            setWheelHistory(prev => ({ ...prev, [bonusKey]: bonusGold }));
                            updateStats(activeChild, 'gold_earn', bonusGold, { source: 'bonus_multi', dateKey: statDateKey });
                            showToast('success', `🔥 连击奖励！金元宝 ×${currentTask.bonusMultiplier}！额外获得 ${bonusGold} ！`);
                        }
                    }
                }

                // --- 打卡联动：激活宠物心情 +5 ---
                const linkedPetId = activePet[activeChild];
                if (linkedPetId) {
                    setPetData(prev => {
                        const childPets = { ...(prev[activeChild] || {}) };
                        const p = childPets[linkedPetId];
                        if (p) {
                            childPets[linkedPetId] = { ...p, stats: { ...p.stats, mood: Math.min(100, p.stats.mood + 5) } };
                        }
                        return { ...prev, [activeChild]: childPets };
                    });
                }

				const currentTasks = tasks[activeChild] || [];
                const task = currentTasks.find(t => t.id === editingEntry.taskId);
                if (!task) return; // 找不到任务就退出

                // today 已在上文 (L17430) 声明，此处复用
                const now = new Date();
                
                // --- 新增变量：用于暂存计算出的连续天数，传给 checkAchievements ---
				let currentEarlyStreak = 0; 

				if (editingEntry.date === today && now.getHours() < 9) {
					// 1. 获取昨天的日期字符串
					const yesterday = getLocalDateKey(-1);
					// 2. 获取当前保存的状态
					const childStats = stats[activeChild] || {};
					const lastDate = childStats.earlyBirdLastDate;
					const currentStreak = childStats.earlyBirdStreak || 0;

					// 3. 计算新的连续天数
					if (lastDate === yesterday) {
						currentEarlyStreak = currentStreak + 1; // 连续了
					} else if (lastDate === today) {
						currentEarlyStreak = currentStreak;     // 今天已经记过了，保持不变
					} else {
						currentEarlyStreak = 1;                 // 中断了，重置为1
					}

					setStats(prev => {
						const cStats = prev[activeChild] || {};
						return { 
							...prev, 
							[activeChild]: { 
								...cStats, 
								earlyBirdCount: (cStats.earlyBirdCount || 0) + 1,
								// --- 新增：保存连续记录 ---
								earlyBirdStreak: currentEarlyStreak,
								earlyBirdLastDate: today
							} 
						};
					});
				}
				// --- 新增：周末连续打卡计算逻辑 ---
				const dayOfWeek = now.getDay();
				const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0是周日，6是周六
				let currentWeekendStreak = 0;

				if (isWeekend && editingEntry.date === today) {
					const childStats = stats[activeChild] || {};
					const lastDateStr = childStats.lastWeekendDate;
					const recordedStreak = childStats.weekendStreak || 0;

					if (!lastDateStr) {
						// 第一次周末打卡
						currentWeekendStreak = 1;
					} else {
						const lastDate = new Date(lastDateStr);
						const currDate = new Date(today);
						const diffTime = Math.abs(currDate - lastDate);
						const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

						if (diffDays < 5) {
							// 间隔小于5天，说明还在同一个周末（例如昨天周六打了，今天周日又打），连胜保持不变
							currentWeekendStreak = recordedStreak;
						} else if (diffDays >= 5 && diffDays <= 9) {
							// 间隔5-9天，说明是相邻的两个周末（例如上周日到这周六是6天），连胜+1
							currentWeekendStreak = recordedStreak + 1;
						} else {
							// 间隔太久，断了，重置为1
							currentWeekendStreak = 1;
						}
					}

					// 更新统计数据
					if (currentWeekendStreak !== (childStats.weekendStreak || 0) || today !== lastDateStr) {
						setStats(prev => ({
							...prev,
							[activeChild]: {
								...(prev[activeChild] || {}),
								weekendStreak: currentWeekendStreak,
								lastWeekendDate: today
							}
						}));
					}
				}
				
                let isWheelTriggered = false;
                let isDeadlineClose = false;
                if (editingEntry.date === today && now.getHours() < wheelSettings.deadlineHour) {
                    const historyKey = `${activeChild}-${today}`;
                    if (!wheelHistory[historyKey]) {
                        const activeTasks = (tasks[activeChild]||[]).filter(t => !t.startDate || today >= t.startDate);
                        const activeDailyMust = (tasks[activeChild]||[]).filter(t => t.frequencyType === 'daily_must').filter(t => !t.startDate || today >= t.startDate);
                        let completedCount = 0;
                        let requiredCount = 1;
                        if (wheelSettings.thresholdType === 'daily_must') {
                            activeDailyMust.forEach(t => { if (newCheckins[activeChild]?.[t.id]?.[today]) completedCount++; });
                            requiredCount = Math.max(1, activeDailyMust.length);
                        } else {
                            activeTasks.forEach(t => { if (newCheckins[activeChild]?.[t.id]?.[today]) completedCount++; });
                            requiredCount = wheelSettings.thresholdType === 'percent' ? Math.ceil(activeTasks.length * (wheelSettings.thresholdValue / 100)) : wheelSettings.thresholdValue;
                            if (requiredCount < 1) requiredCount = 1;
                        }
                        if (completedCount >= requiredCount) {
                            isWheelTriggered = true;
                        }
                    }
                }		

                // 传入新的 checkins 与本次打卡完成时刻，用于黎明骑士/午夜派对等时间类成就
                checkAchievements('checkin', { isWheelTriggered, currentEarlyStreak, currentWeekendStreak, isDeadlineClose, checkinTime: new Date() }, { checkins: newCheckins });
                
                // 检测打卡里程碑
                const totalCheckins = Object.values(newCheckins[activeChild] || {}).reduce((sum, taskRecord) => sum + getTaskTotalSessions(taskRecord), 0);
                const milestoneCheckins = [10, 50, 100, 200];
                milestoneCheckins.forEach(count => {
                    const milestoneId = `milestone-checkin-${count}-${activeChild}`;
                    const alreadyRecorded = milestones.some(m => m.id === milestoneId);
                    if (!alreadyRecorded && totalCheckins >= count) {
                        setMilestones(prev => [...prev, {
                            id: milestoneId,
                            type: 'milestone',
                            date: today,
                            timestamp: Date.now(),
                            member: activeChild,
                            title: `打卡里程碑：${count}次`,
                            description: `累计完成${count}次任务打卡`,
                            icon: '🎯'
                        }]);
                        // 企业微信推送：打卡里程碑
                        pushWecomMilestone(activeChild, 'checkin', count);
                    }
                });

                // 检测财富里程碑
                const currentGold = calculateTotalGold(newCheckins, wheelHistory, activeChild);
                const milestoneGold = [500, 1000, 5000];
                milestoneGold.forEach(amount => {
                    const milestoneId = `milestone-gold-${amount}-${activeChild}`;
                    const alreadyRecorded = milestones.some(m => m.id === milestoneId);
                    if (!alreadyRecorded && currentGold >= amount) {
                        setMilestones(prev => [...prev, {
                            id: milestoneId,
                            type: 'milestone',
                            date: today,
                            timestamp: Date.now(),
                            member: activeChild,
                            title: `财富里程碑：${amount}元宝`,
                            description: `累计资产达到${amount}元宝`,
                            icon: '💰'
                        }]);
                        // 企业微信推送：金元宝里程碑
                        pushWecomMilestone(activeChild, 'gold', amount);
                    }
                });

                const isFuture = editingEntry.date > today;
                const isToday = editingEntry.date === today;

				// --- 新增：压线大师逻辑判定 ---
				// --- 【新增/修改】压线大师判定逻辑 (动态读取设置) ---

                // 必须满足：是今天 + 触发了转盘 + 当前时间在截止时间前
                if (isToday && isWheelTriggered) {
                    const deadline = new Date();
                    
                    // 【关键点】这里直接读取 wheelSettings.deadlineHour
                    // 无论用户设置成 18:00 还是 21:00，这里都会实时获取最新值
                    deadline.setHours(wheelSettings.deadlineHour, 0, 0, 0);
                    
                    const nowTime = new Date();
                    // 计算差值（毫秒 -> 分钟）
                    const diffMins = (deadline - nowTime) / (1000 * 60);
                    
                    // 判定条件：距离截止时间 [0, 5] 分钟内
                    if (diffMins >= 0 && diffMins <= 5) {
                        isDeadlineClose = true;
                    }
                }

				// 【修改】打卡特效逻辑：检查是否拥有皇家礼炮
                const hasRoyalSalute = stats[activeChild]?.premiumConfetti;
                
                if (hasRoyalSalute) {
                    fireRoyalSalute(); // 触发高级特效
                } else {
                    // 普通特效
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); 
                }
				
				// 即时打卡奖励（在大满贯判定之前触发）
				if (editingEntry.isNew) {
					const taskOnCheckinReward = (tasks[activeChild] || []).find(t => t.id === editingEntry.taskId)?.onCheckinReward;
					if (taskOnCheckinReward === 'wheel_gold') {
						handleLaunchExtraWheel('gold');
					} else if (taskOnCheckinReward === 'wheel_xp') {
						handleLaunchExtraWheel('xp');
					}
				}

				// 增加 isNew 判断，防止修改旧记录时重复触发事件
				if (editingEntry.isNew) {
					if (isToday) {
						if (isWheelTriggered) {
							checkWheelTrigger(newCheckins, activeChild);
						} else {
							checkRandomEventTrigger(activeChild, false, newCheckins);
						}
					} else if (isFuture) {
						checkRandomEventTrigger(activeChild, true, newCheckins);
					}
				}

				// AI 打卡后鼓励：连击庆祝 + 全完成表扬
				if (editingEntry.isNew && aiEnabled && deepseekApiKey) {
					// 计算连续打卡天数
					let streak = 0;
					for (let i = 0; i < 365; i++) {
						const d = getLocalDateKey(-i);
						const dayHasCheckin = (tasks[activeChild] || []).some(t => newCheckins[activeChild]?.[t.id]?.[d]);
						if (dayHasCheckin) streak++;
						else break;
					}
					const log = aiReminderLog || {};
					const milestones = [3, 7, 14, 30, 50, 100];
					const milestone = milestones.find(m => streak >= m && (log[`lastCelebratedStreak_${activeChild}`] || 0) < m);
					// 今日必做全部完成（排除伴读任务与节假日豁免任务）
					const today = getLocalDateKey(0);
					const isTodayHoliday = isDateHolidayOrWeekend(today);
					const dailyMust = (tasks[activeChild] || [])
						.filter(t => t.frequencyType === 'daily_must' && !t.readingConfig?.isReading && !t.isHabit && t.frequencyType !== 'habit' && !t.habitConfig?.isHabit)
						.filter(t => !t.startDate || today >= t.startDate)
						.filter(t => !t.earlyCompleted)
						.filter(t => !(t.holidayExempt && isTodayHoliday));
					const allDailyDone = dailyMust.length > 0 && dailyMust.every(t => newCheckins[activeChild]?.[t.id]?.[today]);
					const dailyDoneKey = `dailyDone_${activeChild}_${today}`;

					if (milestone) {
						const prompt = `你是小星老师。${activeChild}已经连续打卡${streak}天了！请用热情的语气给一段简短的庆祝鼓励（40字以内），提到连续${streak}天这个数字。不要用引号。`;
						callDeepSeekAPI(prompt, '庆祝我的连续打卡', []).then(reply => {
							if (reply) {
								showAiBubble(reply.replace(/^[""「]|[""」]$/g, '').slice(0, 80));
								setAiReminderLog(prev => ({ ...prev, [`lastCelebratedStreak_${activeChild}`]: streak }));
							}
						});
					} else if (allDailyDone && !log[dailyDoneKey]) {
						const prompt = `你是小星老师。${activeChild}今天所有必做任务都完成了！请用开心的语气给一段简短的表扬（40字以内）。不要用引号。`;
						callDeepSeekAPI(prompt, '表扬我完成所有任务', []).then(reply => {
							if (reply) {
								showAiBubble(reply.replace(/^[""「]|[""」]$/g, '').slice(0, 80));
								setAiReminderLog(prev => ({ ...prev, [dailyDoneKey]: true }));
							}
						});
					} else {
						// 时间敏感提醒（早起/深夜）
						const now = new Date();
						const hour = now.getHours();
						const timeKey = `time_${activeChild}_${today}`;
						if (!log[timeKey]) {
							if (hour < 9) {
								const prompt = `你是小星老师。${activeChild}一大早就起来学习打卡了！请用惊喜的语气表扬ta的勤奋（30字以内），不要用引号。`;
								callDeepSeekAPI(prompt, '表扬早起学习', []).then(reply => {
									if (reply) { showAiBubble(reply.replace(/^[""「]|[""」]$/g, '').slice(0, 80)); setAiReminderLog(prev => ({ ...prev, [timeKey]: true })); }
								});
							} else if (hour >= 22) {
								const prompt = `你是小星老师。${activeChild}这么晚了还在学习打卡。请用关心的语气提醒ta注意休息（30字以内），不要用引号。`;
								callDeepSeekAPI(prompt, '关心深夜学习', []).then(reply => {
									if (reply) { showAiBubble(reply.replace(/^[""「]|[""」]$/g, '').slice(0, 80)); setAiReminderLog(prev => ({ ...prev, [timeKey]: true })); }
								});
							}
						}
					}
					// 企业微信推送：每日必做全部完成（独立于 AI 气泡逻辑）
					if (allDailyDone) {
						const wecomDailyDoneKey = `wecom_dailyDone_${activeChild}_${today}`;
						if (!log[wecomDailyDoneKey]) {
							pushWecomDailyDone(activeChild, dailyMust);
							const streakInfo = calcDailyMustStreak(activeChild, tasks, newCheckins);
							if (streakInfo.streak >= 3) {
								pushWecomStreak(activeChild, streakInfo.streak, streakInfo.startDate);
							}
							setAiReminderLog(prev => ({ ...prev, [wecomDailyDoneKey]: true }));
						}
					}
				}
            };

            // --- 【伴读书阁】记录今日阅读进度与通关大奖结算 ---
            const handleSaveReadingProgress = ({ taskId, newProgress, increment, mode, note, isFinished, grandReward }) => {
                const task = (tasks[activeChild] || []).find(t => t.id === taskId);
                if (!task) return;
                const today = getLocalDateKey(0);

                // 1. 更新任务伴读设定 (readingConfig)
                const currentNotes = Array.isArray(task.readingConfig?.notes) ? [...task.readingConfig.notes] : [];
                if (note && note.trim()) {
                    currentNotes.push({ date: today, text: note.trim(), progress: newProgress });
                }

                const rCfg = task.readingConfig || {};
                const rStartDate = rCfg.startDate || task.startDate || today;
                const rDeadline = (() => {
                    if (rCfg.deadlineDate) return rCfg.deadlineDate;
                    const d = new Date(rStartDate.replace(/-/g, '/'));
                    if (rCfg.period === 'monthly') {
                        d.setDate(d.getDate() + 30);
                    } else {
                        d.setDate(d.getDate() + 7);
                    }
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                })();

                const isOverdue = today > rDeadline;
                const finalGrandReward = grandReward !== undefined 
                    ? grandReward 
                    : (isOverdue ? (rCfg.overdueGrandReward ?? 20) : (rCfg.grandReward ?? 30));

                const updatedTask = {
                    ...task,
                    readingConfig: {
                        ...task.readingConfig,
                        currentProgress: newProgress,
                        notes: currentNotes
                    }
                };

                // 2. 满贯通关判定 (达成 100% 进度)
                if (isFinished) {
                    // 核心要求：绝不让任务从列表中消失，保持槽位持久运转；标记待换新书
                    updatedTask.earlyCompleted = false;
                    updatedTask.readingConfig = {
                        ...updatedTask.readingConfig,
                        needsNextBook: true,
                        lastFinishedBook: {
                            title: rCfg.bookTitle || task.name,
                            completedDate: today,
                            grandReward: finalGrandReward
                        }
                    };

                    // 存入孩子的天工藏书阁历史
                    const bookEntry = {
                        id: `book_${taskId}_${Date.now()}`,
                        taskId: task.id,
                        title: rCfg.bookTitle || task.name,
                        author: rCfg.author || '',
                        coverEmoji: rCfg.coverEmoji || '📖',
                        period: rCfg.period || 'weekly',
                        mode: rCfg.mode || 'pages',
                        totalPages: rCfg.totalPages || rCfg.totalChapters || newProgress,
                        grandReward: finalGrandReward,
                        completedDate: today,
                        quotes: currentNotes,
                        isOverdue
                    };

                    setReadingHistory(prev => {
                        const childHistory = Array.isArray(prev[activeChild]) ? [...prev[activeChild]] : [];
                        return {
                            ...prev,
                            [activeChild]: [bookEntry, ...childHistory]
                        };
                    });

                    // 发放通关大奖金元宝
                    if (finalGrandReward > 0) {
                        const grandRewardKey = `${activeChild}-READING_GRAND-${taskId}-${Date.now()}`;
                        setWheelHistory(prev => ({ ...prev, [grandRewardKey]: finalGrandReward }));
                        updateStats(activeChild, 'gold_earn', finalGrandReward, { source: 'reading_grand', dateKey: today });
                    }

                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                    showToast('success', `🎉 恭喜读完全本《${rCfg.bookTitle || task.name}》！${isOverdue ? '顺延续读' : '按期'}通关大奖 +${finalGrandReward} 金元宝！已入驻天工书阁！`, { duration: 4500 });

                    // 自动弹出无缝接力小窗引导选下一本
                    setReadingTransitionModal({
                        show: true,
                        data: {
                            taskId: task.id,
                            finishedTitle: rCfg.bookTitle || task.name,
                            period: rCfg.period || 'weekly'
                        }
                    });
                }

                // 保存任务数据
                setTasks(prev => ({
                    ...prev,
                    [activeChild]: (prev[activeChild] || []).map(t => t.id === taskId ? updatedTask : t)
                }));

                // 3. 登记今日普通打卡记录 (兼容多次打卡、普通打卡与工资/周统计)
                const readingMinutes = mode === 'duration' ? (increment || 20) : (task.readingConfig?.dailyTargetMinutes || 20);
                const newCheckins = { ...checkins };
                const childData = newCheckins[activeChild] || {};
                const taskData = childData[taskId] || {};
                const isMulti = task.multiCheckin && task.frequencyType === 'daily_must';
                const sessionTimestamp = Date.now();

                if (isMulti) {
                    const existingVal = taskData[today];
                    const existingArr = Array.isArray(existingVal) ? [...existingVal] : (typeof existingVal === 'number' ? [{ m: existingVal, u: 0, t: Date.now() - 1 }] : []);
                    existingArr.push({ m: readingMinutes, u: increment || 1, t: sessionTimestamp });
                    newCheckins[activeChild] = { ...childData, [taskId]: { ...taskData, [today]: existingArr } };
                } else {
                    newCheckins[activeChild] = { ...childData, [taskId]: { ...taskData, [today]: readingMinutes } };
                }
                setCheckins(newCheckins);

                // 4. 每日打卡常规金元宝与星星结算
                let multiplier = 1;
                const childBuffs = activeBuffs[activeChild] || {};
                const investStart = childBuffs.investStart || (childBuffs.investExpire ? dateKeySubtractDays(childBuffs.investExpire, 30) : today);
                if (childBuffs.investMultiplier > 1 && childBuffs.investExpire && today <= childBuffs.investExpire && today >= investStart) {
                    multiplier = childBuffs.investMultiplier;
                }
                const dailyReward = (task.reward || 3) * multiplier;
                const historyKey = isMulti
                    ? `${activeChild}-TASK-${taskId}-${today}_${sessionTimestamp}`
                    : `${activeChild}-TASK-${taskId}-${today}`;
                setWheelHistory(prev => ({ ...prev, [historyKey]: dailyReward }));

                updateStats(activeChild, 'checkin', 1, { taskName: task.name, dateKey: today });
                updateStats(activeChild, 'gold_earn', dailyReward, { source: 'task', dateKey: today });

                // 发放星星
                const starKey = isMulti
                    ? `${activeChild}-STAR_CHECKIN-${taskId}-${today}_${sessionTimestamp}`
                    : `${activeChild}-STAR_CHECKIN-${taskId}-${today}`;
                if (!starHistory[starKey]) {
                    setStarHistory(prev => ({ ...prev, [starKey]: 3 }));
                }

                // 宠物心情 +5
                const linkedPetId = activePet[activeChild];
                if (linkedPetId) {
                    setPetData(prev => {
                        const childPets = { ...(prev[activeChild] || {}) };
                        const p = childPets[linkedPetId];
                        if (p) {
                            childPets[linkedPetId] = { ...p, stats: { ...p.stats, mood: Math.min(100, p.stats.mood + 5) } };
                        }
                        return { ...prev, [activeChild]: childPets };
                    });
                }

                triggerSyncUpload();
                showToast('success', `📖 今日阅读已记录！+${dailyReward} 金元宝，+3 星星！`);
            };

            // --- 【伴读书阁】接力开启下一本新书 ---
            const handleSwitchNextBook = ({ taskId, bookTitle, author, coverEmoji, period, mode, totalPages, totalChapters, grandReward, overdueGrandReward }) => {
                const today = getLocalDateKey(0);
                const d = new Date();
                if (period === 'monthly') {
                    d.setDate(d.getDate() + 30);
                } else {
                    d.setDate(d.getDate() + 7);
                }
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const deadlineDate = `${year}-${month}-${day}`;

                setTasks(prev => {
                    const list = prev[activeChild] || [];
                    return {
                        ...prev,
                        [activeChild]: list.map(t => {
                            if (t.id !== taskId) return t;
                            return {
                                ...t,
                                earlyCompleted: false,
                                frequencyType: 'reading',
                                readingConfig: {
                                    ...t.readingConfig,
                                    isReading: true,
                                    bookTitle,
                                    author: author || '',
                                    coverEmoji: coverEmoji || '📖',
                                    period: period || 'weekly',
                                    mode: mode || 'pages',
                                    totalPages: totalPages || 180,
                                    totalChapters: totalChapters || 12,
                                    dailyTargetMinutes: t.readingConfig?.dailyTargetMinutes || 20,
                                    targetCount: totalPages || 180,
                                    currentProgress: 0,
                                    grandReward: grandReward ?? 30,
                                    overdueGrandReward: overdueGrandReward ?? 20,
                                    startDate: today,
                                    deadlineDate,
                                    notes: [],
                                    needsNextBook: false
                                }
                            };
                        })
                    };
                });
                showToast('success', `📖 已为《${bookTitle}》开启新伴读之旅！加油！`);
                triggerSyncUpload();
            };

            // --- 【伴读书阁】插书签暂存换书 ---
            const handleShelveBook = (taskId, customProgress) => {
                const task = (tasks[activeChild] || []).find(t => t.id === taskId);
                if (!task) return;
                const today = getLocalDateKey(0);
                const rCfg = task.readingConfig || {};
                const bookTitle = rCfg.bookTitle || task.name;
                const currentProgress = (typeof customProgress === 'number' && customProgress > 0)
                    ? customProgress
                    : (rCfg.currentProgress || 0);
                const shelvedEntry = {
                    id: `shelve_${taskId}_${Date.now()}`,
                    taskId: task.id,
                    bookTitle,
                    author: rCfg.author || '',
                    coverEmoji: rCfg.coverEmoji || '📖',
                    period: rCfg.period || 'weekly',
                    mode: rCfg.mode || 'pages',
                    totalPages: rCfg.totalPages || 180,
                    totalChapters: rCfg.totalChapters || 12,
                    currentProgress,
                    grandReward: rCfg.grandReward || 30,
                    overdueGrandReward: rCfg.overdueGrandReward || 20,
                    notes: rCfg.notes || [],
                    startDate: rCfg.startDate || today,
                    deadlineDate: rCfg.deadlineDate,
                    shelvedDate: today
                };
                setShelvedBooks(prev => ({
                    ...prev,
                    [activeChild]: [shelvedEntry, ...(prev[activeChild] || [])]
                }));
                setTasks(prev => ({
                    ...prev,
                    [activeChild]: (prev[activeChild] || []).map(t => {
                        if (t.id !== taskId) return t;
                        return {
                            ...t,
                            readingConfig: {
                                ...t.readingConfig,
                                currentProgress: 0,
                                needsNextBook: true,
                                lastFinishedBook: null
                            }
                        };
                    })
                }));
                showToast('info', `🔖 已为《${bookTitle}》插上书签暂存入待续书架！`);
                setReadingTransitionModal({
                    show: true,
                    data: { taskId: task.id, period: rCfg.period || 'weekly' }
                });
                triggerSyncUpload();
            };

            // --- 【伴读书阁】从待续书架取回继续读 ---
            const handleResumeShelvedBook = (shelvedEntry) => {
                if (!shelvedEntry) return;
                const today = getLocalDateKey(0);
                setShelvedBooks(prev => ({
                    ...prev,
                    [activeChild]: (prev[activeChild] || []).filter(b => b.id !== shelvedEntry.id)
                }));
                const readingTask = (tasks[activeChild] || []).find(t => t.id === shelvedEntry.taskId || t.readingConfig?.isReading || t.frequencyType === 'reading');
                if (readingTask) {
                    setTasks(prev => ({
                        ...prev,
                        [activeChild]: (prev[activeChild] || []).map(t => {
                            if (t.id !== readingTask.id) return t;
                            return {
                                ...t,
                                earlyCompleted: false,
                                frequencyType: 'reading',
                                readingConfig: {
                                    ...t.readingConfig,
                                    isReading: true,
                                    bookTitle: shelvedEntry.bookTitle,
                                    author: shelvedEntry.author,
                                    coverEmoji: shelvedEntry.coverEmoji,
                                    period: shelvedEntry.period,
                                    mode: shelvedEntry.mode,
                                    totalPages: shelvedEntry.totalPages,
                                    totalChapters: shelvedEntry.totalChapters,
                                    currentProgress: shelvedEntry.currentProgress,
                                    grandReward: shelvedEntry.grandReward,
                                    overdueGrandReward: shelvedEntry.overdueGrandReward,
                                    notes: shelvedEntry.notes || [],
                                    startDate: shelvedEntry.startDate || today,
                                    deadlineDate: shelvedEntry.deadlineDate,
                                    needsNextBook: false
                                }
                            };
                        })
                    }));
                }
                showToast('success', `📖 已取回《${shelvedEntry.bookTitle}》，继续伴读！`);
                setShowReadingPavilion(false);
                triggerSyncUpload();
            };

            // --- 【元气生活】生活习惯微打卡处理器 ---
            const handleHabitCheckin = (task, stepDelta = 1, isToggle = false) => {
                if (!task) return;
                const today = getLocalDateKey(0);
                const childData = checkins[activeChild] || {};
                const taskData = childData[task.id] || {};
                const curRaw = taskData[today];
                const curCount = curRaw === undefined || curRaw === null || curRaw === '' 
                    ? 0 
                    : (typeof curRaw === 'number' ? curRaw : (Array.isArray(curRaw) ? curRaw.length : 1));
                const cfg = task.habitConfig || {};
                const isCount = cfg.mode === 'count' && (cfg.targetCount > 1 || task.targetCount > 1);
                const target = isCount ? (cfg.targetCount || task.targetCount || 8) : 1;

                let nextVal = 0;
                let rewardDelta = 0;

                if (isToggle) {
                    if (stepDelta === 1) {
                        nextVal = 1;
                        rewardDelta = task.reward || 1;
                    } else {
                        nextVal = 0;
                        rewardDelta = 0;
                    }
                } else if (isCount) {
                    nextVal = Math.max(0, curCount + stepDelta);
                    rewardDelta = (stepDelta > 0) ? (task.reward || 1) * stepDelta : 0;
                } else {
                    if (curCount < target) {
                        nextVal = curCount + 1;
                        rewardDelta = task.reward || 1;
                    } else {
                        nextVal = Math.max(0, curCount - 1);
                        rewardDelta = 0;
                    }
                }

                // 写入打卡记录
                const newCheckins = {
                    ...checkins,
                    [activeChild]: {
                        ...childData,
                        [task.id]: {
                            ...taskData,
                            [today]: nextVal
                        }
                    }
                };
                setCheckins(newCheckins);
                triggerSyncUpload();

                // 发放奖励与统计更新
                if (rewardDelta > 0) {
                    let multiplier = 1;
                    const childBuffs = activeBuffs[activeChild] || {};
                    const investStart = childBuffs.investStart || (childBuffs.investExpire ? dateKeySubtractDays(childBuffs.investExpire, 30) : today);
                    if (childBuffs.investMultiplier > 1 && childBuffs.investExpire && today <= childBuffs.investExpire && today >= investStart) {
                        multiplier = childBuffs.investMultiplier;
                    }
                    const finalReward = rewardDelta * multiplier;
                    const historyKey = `${activeChild}-HABIT-${task.id}-${today}_${Date.now()}`;
                    setWheelHistory(prev => ({
                        ...prev,
                        [historyKey]: finalReward
                    }));
                    updateStats(activeChild, 'gold_earn', finalReward, { source: 'habit', dateKey: today });
                    updateStats(activeChild, 'checkin', 1, { taskName: task.name, dateKey: today });

                    // 发放星星
                    const starKey = `${activeChild}-STAR_HABIT-${task.id}-${today}`;
                    if (!starHistory[starKey]) {
                        setStarHistory(prev => ({ ...prev, [starKey]: 1 }));
                    }

                    // 伴宠心情微提升 +2
                    const linkedPetId = activePet[activeChild];
                    if (linkedPetId && petData[linkedPetId]) {
                        setPetData(prev => {
                            const curPet = prev[linkedPetId];
                            if (!curPet) return prev;
                            return {
                                ...prev,
                                [linkedPetId]: {
                                    ...curPet,
                                    mood: Math.min(100, (curPet.mood || 50) + 2)
                                }
                            };
                        });
                    }

                    const unit = cfg.unit || (cfg.icon === '💧' ? '杯' : '次');
                    if (nextVal >= target) {
                        showToast('success', `🎉 太棒了！「${task.name}」今日圆满达标！金元宝 +${finalReward}`);
                    } else {
                        showToast('success', `${cfg.icon || '🌱'} ${task.name} +1${unit}！金元宝 +${finalReward}`);
                    }
                }
            };

            // --- 【元气生活】一键开启推荐习惯 ---
            const handleAddPresetHabit = (preset) => {
                const today = getLocalDateKey(0);
                const d = new Date();
                d.setFullYear(d.getFullYear() + 1);
                const deadline = dateObjToLocalKey(d);

                const overrides = {
                    name: preset.name,
                    type: 'daily',
                    frequencyType: 'habit',
                    reward: preset.reward || 1,
                    startDate: today,
                    deadline,
                    habitConfig: preset.habitConfig
                };

                handleAddTask(overrides);
                showToast('success', `✨ 成功开启「${preset.name}」生活习惯！`);
            };

            const spinWheel = () => {
                if (wheelSpinning) return;
                setWheelSpinning(true);
                
                // 1. 确定配置 (用于渲染的完整配置，用于计算角度)
                const currentConfig = wheelType === 'xp' ? xpWheelConfig : wheelConfig;

                // 2. 幸运加持符逻辑 (逻辑配置，用于计算概率)
                const childBuffs = activeBuffs[activeChild] || {};
                let modifiedWheelConfig = currentConfig;
                // 仅在金元宝转盘且有BUFF时生效
                if (wheelType === 'gold' && childBuffs.luckyBuff) {
                    const minReward = Math.min(...currentConfig.map(item => item.value));
                    modifiedWheelConfig = currentConfig.map(item => {
                        if (item.value === minReward) { return { ...item, weight: 0 }; }
                        return item;
                    });
                    setActiveBuffs(prev => ({...prev, [activeChild]: { ...(prev[activeChild] || {}), luckyBuff: false }}));
                }
                
                // 3. 抽奖算法
                const totalWeight = modifiedWheelConfig.reduce((sum, item) => sum + item.weight, 0);
                let random = totalWeight > 0 ? Math.random() * totalWeight : 0;
                let selectedItem = modifiedWheelConfig[0];
                for (let i = 0; i < modifiedWheelConfig.length; i++) {
                    if (random < modifiedWheelConfig[i].weight) { selectedItem = modifiedWheelConfig[i]; break; }
                    random -= modifiedWheelConfig[i].weight;
                }
                
                // 4. 角度计算 【关键修复】
                // 必须使用 currentConfig (渲染用的配置) 来查找原始索引
                const originalIndex = currentConfig.findIndex(item => item.id === selectedItem.id);
                
                // 计算每个扇区的角度
                const segmentAngle = 360 / currentConfig.length;
                // 目标角度：指向该扇区的中心
                const targetBaseAngle = (originalIndex * segmentAngle) + (segmentAngle / 2);
                
                // 添加随机偏移 (在扇区宽度的 80% 范围内波动，避免指到分割线上)
                const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8);
                
                // 计算最短旋转距离：保证顺时针旋转
                const currentRotationMod = pointerRotation % 360;
                let distance = targetBaseAngle - currentRotationMod;
                if (distance < 0) distance += 360; 
                
                // 最终角度 = 当前角度 + 多转5圈(1800度) + 补齐到目标的距离 + 随机偏移
                const finalAngle = pointerRotation + 1800 + distance + randomOffset;
                
                setPointerRotation(finalAngle);

                setTimeout(() => {
                    setWheelResult(selectedItem);
                    setWheelSpinning(false);
                    
                    // 5. 结算逻辑 【关键修复：严格判断非演示模式】
                    if (!isDemoWheel) {
                        const today = getLocalDateKey(0);
                        
                        if (wheelType === 'xp') {
                            // --- XP 转盘逻辑 ---
                            let historyKey = isExtraReward ? `${activeChild}-EXTRA_XP-${Date.now()}` : `${activeChild}-XP_WHEEL-${Date.now()}`;
                            setXpHistory(prev => ({ ...prev, [historyKey]: selectedItem.value }));                                       
                        } else {
                            // --- 金元宝 转盘逻辑 ---
                            let historyKey = isExtraReward ? `${activeChild}-EXTRA-${Date.now()}` : `${activeChild}-${today}`;
                            const newHistory = { ...wheelHistory, [historyKey]: selectedItem.value };
                            setWheelHistory(newHistory);
                            
                            // 【新增】统计转盘获得的元宝到每日收益
                            updateStats(activeChild, 'gold_earn', selectedItem.value, { source: 'wheel', dateKey: today });
                            
                            const maxReward = Math.max(...wheelConfig.map(i => i.value));
                            if (selectedItem.value === maxReward) { checkAchievements('lucky_spin', { maxReward, winValue: selectedItem.value }, { wheelHistory: newHistory }); } 
                            else { checkAchievements('spin', {}, { wheelHistory: newHistory }); }
                        }
                    }
                    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                }, 3000); 
            };
			
            // 启动时检查：有未完成的惩罚转盘则自动打开
            React.useEffect(() => {
                if (pendingEvilPenalty) {
                    setTimeout(() => handleLaunchEvilWheelRef.current?.(), 500);
                }
            }, []);

            // 清理 wheelHistory 中被错误写入的 EVIL_PENALTY 对象（一次性修复）
            React.useEffect(() => {
                const keysToRemove = Object.keys(wheelHistory).filter(k => k.includes('-EVIL_PENALTY-'));
                if (keysToRemove.length > 0) {
                    setWheelHistory(prev => {
                        const next = { ...prev };
                        keysToRemove.forEach(k => delete next[k]);
                        return next;
                    });
                }
            }, []);

            // 自动惩罚：检查昨日每日必做完成情况
            const evilCheckDoneRef = React.useRef(new Set());
            React.useEffect(() => {
                if (!evilAutoTrigger) return;
                const yesterday = getLocalDateKey(-1);
                const penaltyKey = `${activeChild}-EVIL_PENALTY-${yesterday}`;
                if (evilPenaltyLog[penaltyKey] || evilCheckDoneRef.current.has(penaltyKey)) return;

                const yesterdayTasks = (tasks[activeChild] || [])
                    .filter(t => t.frequencyType === 'daily_must')
                    .filter(t => !t.startDate || yesterday >= t.startDate)
                    .filter(t => !t.earlyCompleted);

                if (yesterdayTasks.length === 0) { evilCheckDoneRef.current.add(penaltyKey); return; }

                // 冰冻卡检查：如果昨天被冻结，不触发惩罚
                const freezeDates = stats?.[activeChild]?.freezeDates || [];
                if (freezeDates.includes(yesterday)) { evilCheckDoneRef.current.add(penaltyKey); return; }

                const completed = yesterdayTasks
                    .filter(t => checkins[activeChild]?.[t.id]?.[yesterday]).length;

                if (completed === 0) {
                    setEvilPenaltyLog(prev => ({ ...prev, [penaltyKey]: Date.now() }));
                    setPendingEvilPenalty(true);
                    setTimeout(() => handleLaunchEvilWheelRef.current?.(), 500);
                }
                evilCheckDoneRef.current.add(penaltyKey);
            }, [checkins, activeChild, evilAutoTrigger]);
            const handleLaunchEvilWheel = () => {
                setShowSettings(false);
                setIsEvilDemo(false);
                setShowEvilWheel(true);
                setEvilWheelResult(null);
            };

            const handleTestEvilWheel = () => {
                setIsEvilDemo(true);
                setShowEvilWheel(true);
                setEvilWheelResult(null);
            };

			// 启动额外奖励转盘
			const handleLaunchExtraWheel = (type = 'gold', isDemo = false) => {
                // 只有在“非演示”（即正式发放额外奖励）时才关闭设置窗口
                // 演示模式下，保留设置窗口，让转盘覆盖在上面
                if (!isDemo) setShowSettings(false); 
                
                setIsDemoWheel(isDemo);  
                setIsExtraReward(!isDemo); 
                setWheelType(type); // 确保正确设置是 gold 还是 xp
                setShowWheel(true);
                setWheelResult(null);
            };
            handleLaunchEvilWheelRef.current = handleLaunchEvilWheel;

            // --- 监听并执行来自家长手机端派发的互动指令 (发红包、额外转盘、邪恶转盘) ---
            const [showParentGiftModal, setShowParentGiftModal] = useState(false);
            const processedParentActionsRef = React.useRef(new Set());
            const notifiedParentActionIdsRef = React.useRef(new Set());

            // 筛选当前孩子的未领取礼物（红包、额外转盘）
            const unclaimedGifts = useMemo(() => {
                if (!parentActions || !Array.isArray(parentActions)) return [];
                const validDeviceIds = new Set((authorizedParents?.devices || []).map(d => d.deviceId));
                const hasRegisteredDevices = (authorizedParents?.devices || []).length > 0;
                return parentActions.filter(a =>
                    a && a.status === 'pending' &&
                    (!a.targetChild || a.targetChild === activeChild) &&
                    (a.type === 'red_packet' || a.type === 'extra_wheel') &&
                    (!hasRegisteredDevices || validDeviceIds.has(a.operatorDeviceId))
                );
            }, [parentActions, activeChild, authorizedParents]);

            // 家长指令执行逻辑：
            // 1. 戒律惩罚转盘 (evil_wheel)：当且仅当目标孩子回到自己账号时，强制唤醒触发惩罚！
            // 2. 红包与额外转盘：保留 pending 状态，由左侧悬浮礼包按钮承接，孩子自主点击拆领！
            // 3. 拦截未授权设备的恶意指令
            React.useEffect(() => {
                if (!parentActions || !Array.isArray(parentActions) || parentActions.length === 0) return;

                const pendingActions = parentActions.filter(a =>
                    a && a.status === 'pending' && (!a.targetChild || a.targetChild === activeChild)
                );
                if (pendingActions.length === 0) return;

                const validDeviceIds = new Set((authorizedParents?.devices || []).map(d => d.deviceId));
                const hasRegisteredDevices = (authorizedParents?.devices || []).length > 0;
                let hasUpdates = false;

                const updatedActions = parentActions.map(action => {
                    if (action.status !== 'pending' || (action.targetChild && action.targetChild !== activeChild)) {
                        return action;
                    }

                    // 鉴权校验：如果系统已有已登记授权设备列表，则严格核验 deviceId
                    const isAuthorized = !hasRegisteredDevices || validDeviceIds.has(action.operatorDeviceId);
                    if (!isAuthorized) {
                        if (processedParentActionsRef.current.has(action.id)) return action;
                        processedParentActionsRef.current.add(action.id);
                        console.warn('[ParentAction] 拦截未授权设备的操作指令:', action);
                        hasUpdates = true;
                        return { ...action, status: 'rejected_unauthorized', processedAt: Date.now() };
                    }

                    // 1. 邪恶惩罚转盘：在该孩子处于自己账号时自动强制触发
                    if (action.type === 'evil_wheel') {
                        if (processedParentActionsRef.current.has(action.id)) return action;
                        processedParentActionsRef.current.add(action.id);
                        hasUpdates = true;
                        const operator = action.operatorRole || '家长';
                        const reasonText = action.reason ? `\n事由：${action.reason}` : '';
                        showToast('error', `🚨【${operator}】对你下达了戒律惩罚！${reasonText}`, { duration: 8000 });
                        setPendingEvilPenalty(true);
                        setTimeout(() => {
                            handleLaunchEvilWheel();
                        }, 800);
                        return { ...action, status: 'claimed', processedAt: Date.now() };
                    }

                    // 2. 红包 / 额外转盘新到提示（温和 Toast 提醒，不自动消耗，待孩子点击悬浮按钮拆领）
                    if ((action.type === 'red_packet' || action.type === 'extra_wheel') && !notifiedParentActionIdsRef.current.has(action.id)) {
                        notifiedParentActionIdsRef.current.add(action.id);
                        const operator = action.operatorRole || '家长';
                        const tip = action.type === 'red_packet' 
                            ? `🧧 收到来自【${operator}】的爱心红包，点击左侧礼物盒领取！`
                            : `🎁 收到来自【${operator}】的转盘赏赐，点击左侧礼物盒领取！`;
                        showToast('info', tip, { duration: 5000 });
                    }

                    return action;
                });

                if (hasUpdates) {
                    setParentActions(updatedActions);
                    if (typeof window.triggerSyncUpload === 'function') {
                        window.triggerSyncUpload();
                    }
                }
            }, [parentActions, activeChild, authorizedParents]);

            // 孩子点击拆领红包
            const handleClaimRedPacket = (gift) => {
                if (!gift || !gift.id) return;
                const operator = gift.operatorRole || '家长';
                const amount = parseInt(gift.amount, 10) || 0;
                if (amount > 0) {
                    const reasonPart = gift.reason ? `__${encodeURIComponent(gift.reason)}` : '';
                    const historyKey = `${activeChild}-PARENT_REWARD-${operator}${reasonPart}-${Date.now()}`;
                    setWheelHistory(prev => ({
                        ...prev,
                        [historyKey]: amount
                    }));
                    updateStats(activeChild, 'gold_earn', amount, { source: 'parent_reward', dateKey: getLocalDateKey(0) });
                }
                const updatedActions = (parentActions || []).map(a =>
                    a.id === gift.id ? { ...a, status: 'claimed', processedAt: Date.now() } : a
                );
                setParentActions(updatedActions);
                if (typeof window.triggerSyncUpload === 'function') {
                    window.triggerSyncUpload();
                }
            };

            // 孩子点击开启转盘
            const handleClaimWheel = (gift) => {
                if (!gift || !gift.id) return;
                const wheelType = gift.wheelType === 'xp' ? 'xp' : 'gold';
                const updatedActions = (parentActions || []).map(a =>
                    a.id === gift.id ? { ...a, status: 'claimed', processedAt: Date.now() } : a
                );
                setParentActions(updatedActions);
                if (typeof window.triggerSyncUpload === 'function') {
                    window.triggerSyncUpload();
                }
                setShowParentGiftModal(false);
                setTimeout(() => {
                    handleLaunchExtraWheel(wheelType, false);
                }, 400);
            };

            const spinEvilWheel = () => {
                if (evilWheelSpinning) return;
                setEvilWheelSpinning(true);
                const totalWeight = evilWheelConfig.reduce((sum, item) => sum + item.weight, 0);
                let random = totalWeight > 0 ? Math.random() * totalWeight : 0;
                let selectedItem = evilWheelConfig[0];
                let selectedIndex = 0;
                for (let i = 0; i < evilWheelConfig.length; i++) {
                    if (random < evilWheelConfig[i].weight) { selectedItem = evilWheelConfig[i]; selectedIndex = i; break; }
                    random -= evilWheelConfig[i].weight;
                }
                const segmentAngle = 360 / evilWheelConfig.length;
                const targetBaseAngle = (selectedIndex * segmentAngle) + (segmentAngle / 2);
                const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.6);
                const finalAngle = evilPointerRotation + 1800 + (targetBaseAngle - (evilPointerRotation % 360)) + randomOffset;
                setEvilPointerRotation(finalAngle);
                setTimeout(() => {
                    // 检查是否有青铜盾
                    const hasShield = (inventory[activeChild]?.['item_shield'] || 0) > 0;
                    let resultItem = { ...selectedItem, usedShield: false };

                    if (!isEvilDemo && hasShield && selectedItem.value < 0) {
                        // 消耗盾牌
                        setInventory(prev => {
                            const childInv = prev[activeChild] || {};
                            const newCount = (childInv['item_shield'] || 0) - 1;
                            const newInv = { ...childInv, 'item_shield': newCount };
                            if (newCount <= 0) delete newInv['item_shield'];
                            return { ...prev, [activeChild]: newInv };
                        });
                        resultItem.usedShield = true;
                        resultItem.value = 0; // 惩罚归零
                    } else if (!isEvilDemo) {
                         const key = `${activeChild}-EVIL-${Date.now()}`;
                         setWheelHistory(prev => ({ ...prev, [key]: selectedItem.value }));
                    }

                    setEvilWheelResult(resultItem);
                    setEvilWheelSpinning(false);
                    if (!isEvilDemo) setPendingEvilPenalty(false);
                }, 3000);
            };

            const removeCheckin = (sessionIndex = null) => {
                if (!editingEntry) return;
                const task = (tasks[activeChild] || []).find(t => t.id === editingEntry.taskId);
                const isMulti = task?.multiCheckin && task?.frequencyType === 'daily_must';
                const isSingleDelete = isMulti && sessionIndex !== null && sessionIndex >= 0;

                // 删除 wheelHistory key(s)
                const histPrefix = `${activeChild}-TASK-${editingEntry.taskId}-${editingEntry.date}`;
                setWheelHistory(prev => {
                    const next = { ...prev };
                    if (isSingleDelete) {
                        // 只删指定 sessionIndex 对应的 key
                        const taskRecord = checkins[activeChild]?.[task.id];
                        const entries = getCheckinEntries(taskRecord, editingEntry.date);
                        if (entries[sessionIndex]) {
                            const ts = entries[sessionIndex].t;
                            const key = ts ? `${histPrefix}_${ts}` : histPrefix;
                            delete next[key];
                        }
                    } else if (isMulti) {
                        Object.keys(next).forEach(k => { if (k === histPrefix || k.startsWith(histPrefix + '_')) delete next[k]; });
                    } else { delete next[histPrefix]; }
                    return next;
                });
                // 同步删除星星记录
                const starPrefix = `${activeChild}-STAR_CHECKIN-${editingEntry.taskId}-${editingEntry.date}`;
                setStarHistory(prev => {
                    const next = { ...prev };
                    if (isSingleDelete) {
                        const taskRecord = checkins[activeChild]?.[task.id];
                        const entries = getCheckinEntries(taskRecord, editingEntry.date);
                        if (entries[sessionIndex]) {
                            const ts = entries[sessionIndex].t;
                            const key = ts ? `${starPrefix}_${ts}` : starPrefix;
                            delete next[key];
                        }
                    } else if (isMulti) {
                        Object.keys(next).forEach(k => { if (k === starPrefix || k.startsWith(starPrefix + '_')) delete next[k]; });
                    } else { delete next[starPrefix]; }
                    return next;
                });
                // 同步删除 BONUS_MULTI 记录
                setWheelHistory(prev => {
                    const next = { ...prev };
                    const bonusPrefix = `${activeChild}-BONUS_MULTI-${editingEntry.taskId}-${editingEntry.date}`;
                    if (isSingleDelete) {
                        const taskRecord = checkins[activeChild]?.[task.id];
                        const entries = getCheckinEntries(taskRecord, editingEntry.date);
                        if (entries[sessionIndex]) {
                            const ts = entries[sessionIndex].t;
                            const key = `${bonusPrefix}_${ts}`;
                            delete next[key];
                            delete next[bonusPrefix]; // 兼容无后缀 key
                        }
                    } else {
                        Object.keys(next).forEach(k => { if (k.startsWith(bonusPrefix)) delete next[k]; });
                    }
                    return next;
                });

                // 删除 checkins 数据
                setCheckins(prev => {
                    const childData = prev[activeChild] || {};
                    const taskData = { ...(childData[editingEntry.taskId] || {}) };
                    if (isSingleDelete) {
                        const val = taskData[editingEntry.date];
                        const arr = typeof val === 'number' ? [{ m: val, u: 0, t: 0 }] : (Array.isArray(val) ? [...val] : []);
                        arr.splice(sessionIndex, 1);
                        if (arr.length === 0) {
                            delete taskData[editingEntry.date];
                        } else {
                            taskData[editingEntry.date] = arr;
                        }
                    } else {
                        delete taskData[editingEntry.date];
                    }
                    return { ...prev, [activeChild]: { ...childData, [editingEntry.taskId]: taskData } };
                });
                setEditingEntry(null);
            };

            // overrides: 新增弹窗表单传入的字段（name/type/frequencyType/reward 等）；返回新任务 id 供自动展开编辑
            const handleAddTask = (overrides) => {
                const todayStr = getLocalDateKey(0);
                const d3m = new Date(); d3m.setMonth(d3m.getMonth() + 3);
                const deadline3m = dateObjToLocalKey(d3m);
                const safeOverrides = (overrides && typeof overrides === 'object' && !overrides.nativeEvent) ? overrides : {};
                const newTask = {
                    id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                    name: '新任务',
                    reward: 1,
                    targetCount: 10,
                    completedReward: 20,
                    deadline: deadline3m,
                    startDate: todayStr,
                    targetGoal: '',
                    isNew: true,
                    // 新增：默认按”总次数”目标计数
                    frequencyType: 'count',
                    // 每周选做相关：默认每周 3 次，超额每次 +10%
                    weeklyTargetCount: 3,
                    weeklyExtraPercentPerExtra: 10,
                    // 每日必做相关：默认周完成度 80% 视为达标
                    dailyCompletionThresholdPercent: 80,
                    // 打卡即时奖励：默认无
                    onCheckinReward: '',
                    // 多次打卡相关（仅 daily_must 生效）
                    multiCheckin: false,
                    multiUnitLabel: '',
                    bonusThreshold: 0,
                    bonusThresholdType: 'count',
                    bonusType: 'wheel',
                    bonusMultiplier: 2,
                    ...safeOverrides,
                };
                setTasks(prev => ({ ...prev, [activeChild]: [...(prev[activeChild]||[]), newTask] }));
                triggerSyncUpload();
                return newTask.id;
            };

            const clearNewTaskFlags = () => {
                setTasks(prev => ({
                    ...prev,
                    [activeChild]: (prev[activeChild] || []).map(({ isNew, ...rest }) => rest)
                }));
            };

            const handleDeleteTask = (taskId) => {
                if (!window.confirm('确定要删除这个任务吗？')) return;
                setTasks(prev => ({ ...prev, [activeChild]: prev[activeChild].filter(t => t.id !== taskId) }));
                // 清理关联数据：checkins
                setCheckins(prev => {
                    const child = prev[activeChild];
                    if (!child || !child[taskId]) return prev;
                    const { [taskId]: _, ...rest } = child;
                    return { ...prev, [activeChild]: rest };
                });
                // 清理关联数据：wheelHistory（TASK- 前缀）
                setWheelHistory(prev => {
                    const prefix = `${activeChild}-TASK-${taskId}-`;
                    const next = { ...prev };
                    Object.keys(next).forEach(k => { if (k.startsWith(prefix)) delete next[k]; });
                    return next;
                });
                // 清理关联数据：starHistory（STAR_CHECKIN- 前缀）
                setStarHistory(prev => {
                    const prefix = `${activeChild}-STAR_CHECKIN-${taskId}-`;
                    const next = { ...prev };
                    Object.keys(next).forEach(k => { if (k.startsWith(prefix)) delete next[k]; });
                    return next;
                });
                // 清理关联数据：repairedCheckins
                setRepairedCheckins(prev => {
                    const child = prev[activeChild];
                    if (!child || !child[taskId]) return prev;
                    const { [taskId]: _, ...rest } = child;
                    return { ...prev, [activeChild]: rest };
                });
                triggerSyncUpload();
            };

            const updateTaskSetting = (taskId, field, value) => {
                setTasks(prev => ({ ...prev, [activeChild]: prev[activeChild].map(t => t.id === taskId ? { ...t, [field]: value } : t) }));
                triggerSyncUpload();
            };

			// 新增提前达成逻辑
			const handleEarlyComplete = React.useCallback((taskId) => {
				const task = (tasks[activeChild] || []).find(t => t.id === taskId);
				if (!task) return;
				const record = checkins[activeChild]?.[taskId] || {};
				const currentCount = Object.keys(record).length;
				const freq = task.frequencyType || 'count';

				if (currentCount === 0) {
					showToast('warning', '该任务还未有打卡记录，无法提前达成！');
					return;
				}

				const reward = task.completedReward || 0;
				const confirmMsg = freq === 'count'
					? `🏆 提前达成确认\n\n确认 ${activeChild} 已提前完成了【${task.name}】的全部学习目标吗？\n\n原定目标：${task.targetCount}次\n实际完成：${currentCount}次\n\n确认后，该任务将标记为已完成，并立即发放完赛奖励（${reward} 金元宝）！`
					: `🏆 提前达成确认\n\n确认 ${activeChild} 已提前完成了【${task.name}】的全部学习目标吗？\n\n累计打卡：${currentCount}次\n\n确认后，该任务将标记为已完成，并立即发放完赛奖励（${reward} 金元宝）！\n（之后不再参与周结算）`;

				if (confirm(confirmMsg)) {
					if (freq === 'count') {
						setTasks(prev => ({
							...prev,
							[activeChild]: prev[activeChild].map(t =>
								t.id === taskId ? { ...t, targetCount: currentCount } : t
							)
						}));
					} else {
						setTasks(prev => ({
							...prev,
							[activeChild]: prev[activeChild].map(t =>
								t.id === taskId ? { ...t, earlyCompleted: true } : t
							)
						}));
						if (reward > 0) {
							const historyKey = `${activeChild}-EARLY-${taskId}-${Date.now()}`;
							setWheelHistory(prev => ({ ...prev, [historyKey]: reward }));
							updateStats(activeChild, 'gold_earn', reward, { source: 'early_complete', dateKey: getLocalDateKey(0) });
						}
					}
					confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#10b981', '#fbbf24', '#f59e0b'] });
					const todayDate = getLocalDateKey(0);
					setMilestones(prev => [...prev, {
						id: `early-${taskId}-${Date.now()}`,
						type: 'achievement',
						date: todayDate,
						timestamp: Date.now(),
						member: activeChild,
						title: `🎯 提前达成目标！`,
						description: `以 ${currentCount} 次的高效率，提前完成了【${task.name}】！`,
						icon: '⚡'
					}]);
					triggerSyncUpload();
				}
			}, [tasks, activeChild, checkins]);

            const handleAddProfile = () => {
				const name = prompt("请输入新孩子的名字：");
				if (name && !profiles.find(p => p.name === name)) {
					setProfiles([...profiles, { id: name, name, theme: 'sky', avatar: null, grade: 1, createdDate: getLocalDateKey(0) }]);
					setTasks(prev => ({...prev, [name]: []}));
					if (!activeChild) startTransition(() => setActiveChild(name)); // 如果是第一个账户，自动选中
					triggerSyncUpload();
				} else if (name) showToast('warning', '名字已存在');
			};
			
			// --- 【新增】删除成员逻辑 ---
            const deleteProfile = (profileId) => {
                if (profiles.length <= 1) {
                    showToast('warning', '至少保留一名成员，无法删除！');
                    return;
                }
                
                if (confirm("🚨 警告：删除不可恢复！\n\n确定要删除这位成员吗？\n删除后，该成员的所有数据（成就、等级、背包、进度）都将永久丢失。")) {
                    const newProfiles = profiles.filter(p => p.id !== profileId);
                    setProfiles(newProfiles);
                    
                    // 如果删除的是当前选中的孩子，自动切换到第一个
                    if (activeChild === profileId) {
                        startTransition(() => setActiveChild(newProfiles[0].id));
                    }
                    triggerSyncUpload();
                }
            };

            const handleAvatarUpload = (e, profileId) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) { showToast('warning', '图片太大，请选择小于2MB的图片'); return; }
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const MAX_SIZE = 150; let width = img.width; let height = img.height; if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } } canvas.width = width; canvas.height = height; ctx.drawImage(img, 0, 0, width, height); const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, avatar: dataUrl } : p));
                        triggerSyncUpload();
                    }; img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            };

            const updateProfileTheme = (profileId, themeId) => {
                setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, theme: themeId } : p));
                triggerSyncUpload();
            };

			// --- 【新增】更新孩子年级 ---
            const updateProfileGrade = (profileId, grade) => {
                setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, grade: grade } : p));
                triggerSyncUpload();
            };

            // --- 【新增】家长核销学业目标 ---
            const handleVerifyCurriculum = (childId, subjectId, levelIndex) => {
                // 1. 更新进度状态
                const newProgress = { ...curriculumProgress };
                if (!newProgress[childId]) newProgress[childId] = {};
                
                // 只有当新的层级比旧的高时才更新 (防止回退)
                const currentLevel = newProgress[childId][subjectId] !== undefined ? newProgress[childId][subjectId] : -1;
                
                if (levelIndex > currentLevel) {
                    newProgress[childId][subjectId] = levelIndex;
                    setCurriculumProgress(newProgress);
                    
                    // 2. 触发成就检查
                    // 传入新的 progress 数据以确保实时性
                    checkAchievements('curriculum_verify', { curriculumProgress: newProgress });
                    
                    // 3. 特效反馈
                    const subjectName = CURRICULUM_CONFIG[subjectId].name;
                    const levelName = CURRICULUM_CONFIG[subjectId].getSemesterName(levelIndex);
                    
                    confetti({ particleCount: 200, spread: 150, origin: { y: 0.6 }, colors: ['#4f46e5', '#818cf8', '#c7d2fe'] });
                    showToast('success', `${childId} 完成了《${subjectName}》- ${levelName}！`, {duration: 4000});
                    
                    // 4. 记录大事纪
                    const todayDate = getLocalDateKey(0);
                    setMilestones(prev => [...prev, {
                        id: `curriculum-${subjectId}-${levelIndex}-${Date.now()}`,
                        type: 'milestone',
                        date: todayDate,
                        timestamp: Date.now(),
                        member: childId,
                        title: `学业里程碑：${subjectName}`,
                        description: `完成阶段目标：${levelName}`,
                        icon: '🎓'
                    }]);
                    triggerSyncUpload();
                }
            };
			
            const handleChangeTheme = (themeId) => {
                const activeProfile = profiles.find(p => p.name === activeChild);
                if (activeProfile) { 
                    updateProfileTheme(activeProfile.id, themeId);
                    setStats(prev => {
                        const childStats = prev[activeChild] || {};
                        const usedThemes = childStats.usedThemes || [];
                        if (!usedThemes.includes(themeId)) {
                            const newStats = { ...prev, [activeChild]: { ...childStats, usedThemes: [...usedThemes, themeId] } };
                            checkAchievements('theme', {}, { stats: newStats });
                            return newStats;
                        }
                        return prev;
                    });
                }
                setShowThemeModal(false);
            };
            
            const handleCloseThemeModal = (cancelled) => {
                setShowThemeModal(false);
                if (cancelled) {
                     checkAchievements('theme_close_no_change');
                }
            };

            const closeNotification = () => {
                setUnlockQueue(prev => prev.slice(1));
            };
            
            const closeLevelUp = () => {
                setLevelUpQueue(prev => prev.slice(1));
            };

            const canSpinLuckyWheel = useMemo(() => {
                const today = getLocalDateKey(0);
                const now = new Date();
                if (now.getHours() >= wheelSettings.deadlineHour) return false;
                
                const goldKey = `${activeChild}-${today}`;
                const xpKey = `${activeChild}-XP_WHEEL-${today}`;
                
                // 只要今天还没领过（金币 或 XP），就可以点
                if (wheelHistory[goldKey] || xpHistory[xpKey]) return false; 
                
                return todayFragmentStats.completed >= todayFragmentStats.required;
            }, [activeChild, wheelHistory, xpHistory, todayFragmentStats, wheelSettings]);
            
            // 装备效果检查
            const childGear = equippedGear[activeChild] || {};
            const activeFrame = childGear.frame;
            const activeNameEffect = childGear.nameEffect;

			// 获取当前孩子装备的背景 ID（用延迟版本避免特效组件卸载重挂导致的卡顿）
            const currentBg = equippedGear[deferredActiveChild]?.background;
            const deferredActiveBg = React.useDeferredValue(currentBg);
			
			const hasActiveBg = !!currentBg;
			
			// 如果当前设备没有任何账户记录，直接拦截并全屏显示初始引导页，防止任何误操作触发底层数据
			if (profiles.length === 0) {
				return (
					<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
						<div className="bg-white/70 backdrop-blur-lg p-8 rounded-[2rem] shadow-xl w-full max-w-sm text-center border border-white">
							<div className="text-6xl mb-4 animate-bounce">✨</div>
							<h1 className="text-2xl font-bold text-slate-800 mb-2">欢迎来到进化之路 ——超强学习打卡大计划</h1>
							<p className="text-slate-500 mb-8 text-sm font-medium">当前设备暂无记录，请先创建第一个成员开启你们的打卡之旅！</p>
							<button 
								onClick={handleAddProfile} 
								className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 transform transition active:scale-95"
							>
								+ 新建第一个成员
							</button>
						</div>
						<div className="absolute bottom-10 text-xs text-slate-400">
							Copyright ©2026 张恒与&张又兮&nbsp; &nbsp; &nbsp;  All right reserved 
						</div>
					</div>
				);
			}
			
            return (
                <div className={`min-h-screen ${hasActiveBg ? 'bg-transparent' : theme.softBg} font-sans pb-24 transition-colors duration-500`}>
				  {/* --- 方案4：沉浸式动态背景层延迟启动 --- */}
				  {bgEffectsReady && <AtmosphereLayer type={deferredActiveBg} />}
                  
				  {/* --- 最终修正版 Header：保留变色背景 + 叠加天气特效 --- */}
                  {(() => {
                      const now = new Date();
                      const holiday = getHolidayInfo(now);
                      let weather = getWeatherInfo(now); // 获取天气
                      const headerTheme = getHeaderTheme(now, holiday); // 获取原本的星期/节日背景主题
                      // 【修改 2】插入这段丢失的逻辑 (用于加载真实天气)
                      if (realWeather) {
                          const realType = convertWMOToType(realWeather.code);
                          let finalType = realType;
                          // 特殊处理：如果是真实数据的“晴天”，但当前是晚上，强制转为 clear_night
                          if (finalType === 'sunny' && !realWeather.isDay) {
                              finalType = 'clear_night';
                          }

                          // 重新定义映射表 (因为 getWeatherInfo 里的那个是局部的)
                          const weatherMap = {
                              sunny: { icon: '☀️', text: '晴朗', animation: 'sunny-effect', bg: 'from-blue-400 via-sky-400 to-cyan-300' },
                              clear_night: { icon: '🌙', text: '晴夜', animation: 'starry-effect', bg: 'from-slate-900 via-indigo-900 to-slate-800' },
                              cloudy: { icon: '☁️', text: '多云', animation: 'cloudy-effect', bg: 'from-slate-400 via-gray-400 to-slate-300' },
                              rainy: { icon: '🌧️', text: '小雨', animation: 'rainy-effect', bg: 'from-slate-700 via-slate-600 to-gray-500' },
                              snowy: { icon: '❄️', text: '下雪', animation: 'snowy-effect', bg: 'from-indigo-100 via-blue-100 to-white' }
                          };

                          if (weatherMap[finalType]) {
                              weather = {
                                  ...weatherMap[finalType], // 继承图标和动画
                                  temp: realWeather.temp,   // 使用真实温度
                                  city: realWeather.city    // 【重要】传入城市名
                              };
                          }
                      }
                      return (
                        // 1. 背景色：完全使用 headerTheme.gradient (原来的每日/节日变色)，不使用天气的 bg
                        <header className={`sticky top-0 z-30 transition-colors transition-transform duration-1000 ease-in-out bg-gradient-to-r ${headerTheme.gradient} shadow-lg overflow-hidden`}>

							{/* 夜幕遮罩层 — 使用 isNight 状态（每 5 分钟更新一次，非每秒） */}
							{isNight && (
								<div className="absolute inset-0 bg-slate-900/50 pointer-events-none z-0 transition-opacity duration-1000"></div>
							)}
							
                            {/* 2. 天气特效层：叠加在变色背景之上 (如果是重大节日，为了视觉干扰少，可选不显示或只显示轻微的) */}
                            {/* 这里我们保留特效，因为您希望看到动画。CSS 动画层本身是透明的，只有雨滴/雪花可见 */}
                            <WeatherEffects type={weather.animation} />
                            
                            {/* 3. 通用纹理层 */}
                            <div className="header-texture-overlay absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                            <div className="absolute bottom-0 left-0 w-full h-px bg-black/10"></div>
                            
                            {/* 容器 */}
                            <div className="relative z-10 max-w-[1600px] mx-auto px-4 py-2">
                              {/* ===== Mobile: 两行紧凑布局 ===== */}
                              <div className="flex flex-col lg:hidden w-full gap-1.5 py-1">
                                {/* Row 1: 天气 + 时间 + 设置 */}
                                <div className="grid grid-cols-[auto_1fr_auto] items-center w-full">
                                  <span className="flex items-center gap-1 text-xs text-white/90 flex-shrink-0 drop-shadow-xs">
                                    <span className="text-amber-100 font-bold">{weather.city || (userCity || '定位中')}</span>
                                    <span>{weather.icon}</span>
                                    <span className="font-medium">{weather.temp}°C</span>
                                  </span>
                                  <TimeDisplay 
                                    headerTheme={headerTheme} 
                                    variant="mobile" 
                                    holiday={holiday}
                                    weather={weather}
                                    userCity={userCity}
                                  />
                                  <div className="flex items-center gap-px flex-shrink-0">
                                    <div onClick={() => canSpinLuckyWheel && setShowWheelChoice(true)} className={`flex items-center gap-1 px-1.5 py-1 rounded-lg cursor-pointer transition-colors ${canSpinLuckyWheel ? 'bg-amber-400/80 animate-pulse text-black' : 'text-white/60'}`}>
                                      <span className="text-xs">🧩</span>
                                      <span className="text-[10px] font-black">{todayFragmentStats.completed}/{todayFragmentStats.required}</span>
                                    </div>
                                    <button onClick={() => setShowThemeModal(true)} className="p-1.5 rounded-lg hover:bg-white/20 active:scale-95" title="切换主题"><span className="text-sm">🎨</span></button>
                                    <button onClick={handleOpenSettings} className="p-1.5 rounded-lg hover:bg-white/20 active:scale-95" title="设置"><span className="text-sm">⚙️</span></button>
                                  </div>
                                </div>
                                {/* Row 2: 头像 + 功能按钮 + 金币 */}
                                <div className="flex items-center gap-2 w-full">
                                  <div className="flex gap-1.5 items-center overflow-x-auto no-scrollbar flex-1 min-w-0">
                                    {profiles.map(profile => {
                                      const isActive = activeChild === profile.name;
                                      return (
                                        <button key={profile.id}
                                          data-child={profile.name}
                                          onClick={() => startTransition(() => setActiveChild(profile.name))}
                                          className={`flex-shrink-0 transition-colors transition-transform duration-200 rounded-full ${isActive ? 'p-1.5 bg-white/90 shadow-sm ring-1 ring-white/40' : 'p-1.5 bg-white/20 hover:bg-white/30 active:scale-95'}`}>
                                          {profile.avatar ? <img src={profile.avatar} className="w-5 h-5 rounded-full object-cover" /> : <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[9px] font-bold text-white">{profile.name[0]}</div>}
                                          {isActive && <span className="hidden sm:inline text-xs font-bold text-gray-800 truncate max-w-[4rem]">{profile.name}</span>}
                                        </button>
                                      );
                                    })}
                                    <button onClick={handleAddProfile} className="w-7 h-7 rounded-full border border-dashed border-white/40 flex items-center justify-center text-white/60 text-xs flex-shrink-0">+</button>
                                  </div>
                                  <div className="flex items-center flex-shrink-0">
                                    <button onClick={() => setShowEvolutionPath(true)} className="p-1 rounded-lg active:scale-95 relative" title="进化之路"><span className="text-sm">📈</span>{levelUpQueue.length > 0 && <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}</button>
                                    <button onClick={() => setShowAchievements(true)} className="p-1 rounded-lg active:scale-95 relative" title="成就墙"><span className="text-sm">🏆</span>{unlockQueue.length > 0 && <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}</button>
                                    <button onClick={() => setShowCompletedWall(true)} className="p-1 rounded-lg active:scale-95" title="目标达成墙"><span className="text-sm">🎯</span></button>
                                    <button onClick={() => { setStatsOpenMode(null); setShowStats(true); }} className="p-1 rounded-lg active:scale-95" title="学习数据统计"><span className="text-sm">📊</span></button>
                                    <button onClick={() => { setShowMilestones(true); }} className="p-1 rounded-lg active:scale-95" title="大事纪"><span className="text-sm">📜</span></button>
                                    <button onClick={() => setShowHomeworkExamModal(true)} className="p-1 rounded-lg active:scale-95" title="作业与考试"><span className="text-sm">📝</span></button>
                                    <button onClick={() => setShowExchange(true)} className="p-1 rounded-lg active:scale-95" title="兑换零花钱"><span className="text-sm">💱</span></button>
                                    <div className="flex items-center gap-0.5 ml-0.5 cursor-pointer active:scale-95 px-1 py-0.5 rounded" onClick={() => setShowGoldHistory(true)}>
                                      <Coins className="w-4 h-4 text-yellow-300" />
                                      <span className="text-xs font-black text-yellow-100">{totalGold}</span>
                                    </div>
                                    <div className="flex items-center gap-0.5 cursor-pointer active:scale-95 px-1.5 py-0.5 rounded" onClick={() => setShowStarHistory(true)}>
                                      <span className="text-xs">⭐</span>
                                      <span className="text-xs font-black text-yellow-100">{totalStars}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* ===== Desktop: 3列网格布局 ===== */}
                              <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] items-center gap-4">
                                
                                {/* 左侧：用户卡片 (保持不变) */}
                                <div className="w-full min-w-0 overflow-x-auto no-scrollbar order-2 lg:order-1 lg:justify-self-start py-2">
                                   <div className="flex gap-4 items-center h-36 px-2 justify-center lg:justify-start">
                                    {profiles.map(profile => {
                                         // ... (保持原有的 profile 逻辑不变，直接复用之前的代码) ...
                                         let profileXP = 0;
                                         if (profile.name === activeChild) { profileXP = currentXP; } 
                                         else {
                                            if (profile.id === 'TESTER') profileXP = 40000;
                                            else {
                                                const childCheckins = checkins[profile.name] || {};
                                                const totalCheckinsCount = Object.values(childCheckins).reduce((sum, taskRecord) => sum + getTaskTotalSessions(taskRecord), 0);
                                                profileXP += totalCheckinsCount * 10;
                                            }
                                         }
                                         const isActive = activeChild === profile.name;
                                         const pLevelInfo = isActive ? currentLevelInfo : getLevelInfo(profileXP);
                                         const pNextLvl = getNextLevelInfo(pLevelInfo.level);
                                         const percent = pNextLvl ? Math.min(100, Math.round((profileXP - pLevelInfo.xp) / (pNextLvl.xp - pLevelInfo.xp) * 100)) : 100;
                                         const eraColor = ERA_COLORS[pLevelInfo.era] || ERA_COLORS['远古之路'];
                                         const pGear = equippedGear[profile.name] || {};
                                         const pF = pGear.frame;
                                         const pNE = pGear.nameEffect;
                                         let pFrameClass = pF ? pF.replace('_', '-') : '';
                                         let pNameEffectClass = pNE ? pNE.replace('effect_name_', 'name-effect-') : '';
                                         const isPeonyEquipped = pF === 'frame_peony';
                                         const isBronzeEquipped = pF === 'frame_bronze';
                                         const isGoldcloudEquipped = pF === 'frame_bronze'; // 饕餮纹铜框复用Goldcloud头像框
                                         const isAuroraEquipped = pF === 'frame_aurora';
                                         const isGoldmoneyrainEquipped = pF === 'frame_goldmoneyrain';
                                         const isPurplegloryEquipped = pF === 'frame_purpleglory';
                                         const isSpringbirdEquipped = pF === 'frame_springbird';
                                         const isElectricpowerEquipped = pF === 'frame_electricpower';
                                         const isSkywingEquipped = pF === 'frame_skywing';
                                         const avatarFireRingClass = pNameEffectClass === 'name-effect-fire' ? 'avatar-fire-ring' : '';

                                         return (
                                          <button
                                            key={profile.id}
                                            onClick={() => startTransition(() => setActiveChild(profile.name))}
                                            className={`relative group transition-colors transition-transform duration-500 ease-out flex-shrink-0 
                                                ${isActive 
                                                  ? `w-56 shadow-2xl scale-105 z-10 rounded-2xl 
                                                     ${(isPeonyEquipped || isBronzeEquipped || isGoldcloudEquipped) ? 'bg-transparent' : 
                                                       isAuroraEquipped || isGoldmoneyrainEquipped || isPurplegloryEquipped || isSpringbirdEquipped || isElectricpowerEquipped || isSkywingEquipped ? 'bg-white border-2 border-gray-200' :
                                                       `bg-gradient-to-br from-white to-${COLOR_PALETTES[profile.theme]?.id}-50 border-2 ${COLOR_PALETTES[profile.theme]?.border} animate-border-flow`
                                                     }`
                                                  : `w-16 h-16 rounded-full bg-white/90 hover:bg-white hover:scale-110 hover:shadow-lg opacity-80 hover:opacity-100 
                                                     ${isPeonyEquipped ? 'frame-peony' : isGoldcloudEquipped ? 'frame-goldcloud rounded-full' : isAuroraEquipped ? 'frame-kissofaurora rounded-full' : isGoldmoneyrainEquipped ? 'frame-goldmoneyrain rounded-full' : isPurplegloryEquipped ? 'frame-purpleglory rounded-full' : isSpringbirdEquipped ? 'frame-springbird rounded-full' : isElectricpowerEquipped ? 'frame-electricpower rounded-full' : isSkywingEquipped ? 'frame-skywing rounded-full' : isBronzeEquipped ? 'frame-bronze-glow rounded-full' : 'border-2 border-white/50'}`
                                                }`}
                                            >
                                                {isActive && isPeonyEquipped && <div className="peony-bg-layer"></div>}
                                                {isActive && isBronzeEquipped && <div className="bronze-bg-layer"></div>}
                                                {isActive ? (
                                                    <div className="p-3 flex items-center w-full relative">
                                                    <div className={`mb-1 px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-sm bg-gradient-to-r ${ERA_INFOS[pLevelInfo.era].textGradient} flex items-center gap-1 absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap z-20 border border-white`}>
                                                        <span>Lv.{pLevelInfo.level}</span>
                                                        <span>{pLevelInfo.name}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2 mt-2 w-full">
                                                            <div className={`relative ${isPeonyEquipped || isGoldcloudEquipped || isAuroraEquipped || isGoldmoneyrainEquipped || isPurplegloryEquipped || isSpringbirdEquipped || isElectricpowerEquipped || isSkywingEquipped ? '' : pFrameClass} ${avatarFireRingClass} ${isGoldcloudEquipped ? 'frame-goldcloud expanded' : ''} ${isAuroraEquipped ? 'frame-kissofaurora expanded' : ''} ${isGoldmoneyrainEquipped ? 'frame-goldmoneyrain expanded' : ''} ${isPurplegloryEquipped ? 'frame-purpleglory expanded' : ''} ${isSpringbirdEquipped ? 'frame-springbird expanded' : ''} ${isElectricpowerEquipped ? 'frame-electricpower expanded' : ''} ${isSkywingEquipped ? 'frame-skywing expanded' : ''} rounded-full transition-colors transition-transform duration-300`}>
                                                                {profile.avatar ? <img src={profile.avatar} className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-white shrink-0" /> : <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-sm ring-2 ring-white shrink-0 ${COLOR_PALETTES[profile.theme]?.primaryBg || 'bg-gray-400'}`}>{profile.name[0]}</div>}
                                                            </div>
                                                            <div className={`font-bold text-sm truncate flex-1 text-left ${pNameEffectClass} text-gray-800`}>{profile.name}</div>
                                                        </div>
                                                        <div onClick={(e) => { e.stopPropagation(); setShowXPHistory(true); }} className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner relative cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-blue-100">
                                                            <div className={`h-full ${eraColor.bar} transition-all duration-1000 ease-out`} style={{width: `${percent}%`}}></div>
                                                            <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white z-10 tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{Math.floor(profileXP)} / {pNextLvl ? pNextLvl.xp : '∞'}</div>
                                                        </div>
                                                    </div>
                                                    {(ownedPets[profile.name] || []).includes(activePet[profile.name]) && (
                                                        <div className="ml-2 shrink-0">
                                                            <CardPetImage petId={activePet[profile.name]} />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-full">
                                                    {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center text-xl text-gray-500 font-bold`}>{profile.name[0]}</div>}
                                                </div>
                                            )}
                                          </button>
                                        );
                                    })}
                                    <button onClick={handleAddProfile} className="w-12 h-12 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center text-white/60 hover:bg-white/20 hover:border-white/80 hover:text-white transition-colors transition-transform transform hover:scale-105">+</button>
                                  </div>
                                </div>

                                {/* 中间：时间显示 (绝对居中) + 日期节日与天气 (方案一：无框无底色纯净排版) */}
                                <div className="order-1 lg:order-2 lg:justify-self-center flex flex-col items-center justify-center group cursor-default flex-shrink-0 mx-4">
                                    <TimeDisplay 
                                        headerTheme={headerTheme} 
                                        variant="desktop" 
                                        holiday={holiday}
                                        weather={weather}
                                        userCity={userCity}
                                    />
                                </div>

                                {/* 右侧：功能按钮岛（上下两层，统一背景框） */}
                                <div className="w-full lg:w-auto order-3 lg:justify-self-end flex flex-col items-center gap-1 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-inner text-white">
                                   {/* 上层：工具类按钮 */}
                                   <div className="flex items-center gap-1">
                                      <button onClick={() => setShowEvolutionPath(true)} className="p-1.5 rounded-xl hover:bg-white/20 transition-colors transition-transform active:scale-95 relative" title="进化之路"><span className="text-base filter drop-shadow-sm">📈</span>{levelUpQueue.length > 0 && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 border border-white rounded-full animate-ping"></span>}</button>
                                      <button onClick={() => setShowAchievements(true)} className="p-1.5 rounded-xl hover:bg-white/20 transition-colors transition-transform active:scale-95 relative" title="成就墙"><span className="text-base filter drop-shadow-sm">🏆</span>{unlockQueue.length > 0 && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 border border-white rounded-full animate-ping"></span>}</button>
                                      <button onClick={() => setShowCompletedWall(true)} className="p-1.5 rounded-xl hover:bg-white/20 transition-colors transition-transform active:scale-95" title="目标达成墙"><span className="text-base filter drop-shadow-sm">🎯</span></button>
                                      <button onClick={() => setShowMilestones(true)} className="p-1.5 rounded-xl hover:bg-white/20 transition-colors transition-transform active:scale-95" title="大事纪"><span className="text-base filter drop-shadow-sm">📜</span></button>
                                      <button onClick={() => { setStatsOpenMode(null); setShowStats(true); }} className="p-1.5 rounded-xl hover:bg-white/20 transition-colors transition-transform active:scale-95" title="学习数据统计"><span className="text-base filter drop-shadow-sm">📊</span></button>
                                      <button onClick={() => setShowHomeworkExamModal(true)} className="p-1.5 rounded-xl hover:bg-white/20 transition-colors transition-transform active:scale-95" title="作业与考试"><span className="text-base filter drop-shadow-sm">📝</span></button>
                                      <div className="w-px h-4 bg-white/20 mx-0.5"></div>
                                      {/* WonderShowcase hidden */}
                                      <button onClick={() => setShowThemeModal(true)} className="p-1.5 rounded-xl hover:bg-white/20 transition-colors transition-transform" title="切换主题"><span className="text-base filter drop-shadow-sm">🎨</span></button>
                                      <button onClick={handleOpenSettings} className="p-1.5 rounded-xl hover:bg-white/20 transition-colors transition-transform" title="设置"><span className="text-base filter drop-shadow-sm">⚙️</span></button>
                                   </div>
                                   {/* 下层：经济类按钮 */}
                                   <div className="flex items-center gap-1">
                                      <button onClick={() => { setShopInitialTab('buy'); setShowShop(true); }} className="p-1.5 rounded-xl hover:bg-white/20 transition-colors transition-transform active:scale-95 relative" title="时空集市"><div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-0.5 rounded-full animate-bounce shadow-sm">NEW</div><span className="text-base filter drop-shadow-sm">🏪</span></button>
                                      <div onClick={() => canSpinLuckyWheel && setShowWheelChoice(true)} className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg border cursor-pointer transition-colors ${canSpinLuckyWheel ? 'bg-amber-400/80 border-amber-200 animate-pulse text-black' : 'bg-transparent border-transparent hover:bg-white/10 text-white'}`}><div className="flex items-center gap-1"><span className="text-xs">🧩</span><span className="text-xs font-black">{todayFragmentStats.completed}/{todayFragmentStats.required}</span></div></div>
                                      <button onClick={() => setShowExchange(true)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors active:scale-95" title="兑换零花钱"><span className="text-xl">💱</span></button>
                                      <div className="w-px h-4 bg-white/20 mx-0.5"></div>
                                      <div className="flex items-center gap-0.5 cursor-pointer hover:bg-white/10 px-1.5 py-1 rounded transition-colors" onClick={() => setShowGoldHistory(true)}><Coins className="w-4 h-4 text-yellow-300 drop-shadow-sm" /><span className="text-xs font-black text-yellow-100">{totalGold}</span></div>
                                      <div className="flex items-center gap-0.5 cursor-pointer hover:bg-white/10 px-1.5 py-1 rounded transition-colors" onClick={() => setShowStarHistory(true)}><span className="text-xs">⭐</span><span className="text-xs font-black text-yellow-100">{totalStars}</span></div>
                                   </div>
                                </div>
                              </div>
                            </div>
                        </header>
                      );
                  })()}

                  <main className="max-w-5xl mx-auto px-4 py-8" style={{ opacity: isAccountSwitchingUI ? 0.55 : 1, transition: 'opacity 0.18s ease' }}>
				    {/* 新增：周末仪表盘 */}
					<WeekendDashboard 
						tasks={tasks} 
						checkins={checkins} 
						activeChild={activeChild} 
						settings={weekendSettings}
						theme={theme}
					/>
                    {/* --- 灵龟甲骨·吉金传书展示区 --- */}
                    <OracleMessageBoard
                        globalMessages={globalMessages}
                        setGlobalMessages={setGlobalMessages}
                        activeChild={activeChild}
                        profiles={profiles}
                        inventory={inventory[activeChild] || {}}
                        onOpenCarve={() => setShowOracleCarveModal(true)}
                        showToast={showToast}
                        hasActiveBg={hasActiveBg}
                    />

                    {/* 智能任务看板与横向跑道：平时折叠为数据指标条，展开为横向卡片泳道 */}
                    <TaskDashboardTrack
                        tasks={sortedTasks}
                        checkins={checkins}
                        activeChild={activeChild}
                        globalDates={globalDates}
                        theme={theme}
                        inventory={inventory[activeChild] || {}}
                        onUseSkipCard={useSkipCard}
                        equippedGear={equippedGear}
                        onEarlyComplete={handleEarlyComplete}
                        onOpenSettings={() => handleOpenSettings('tasks')}
                        onOpenQuickCheckin={(task) => {
                            setReadingTaskForCheckin(task);
                            setShowReadingQuickCheckin(true);
                        }}
                        onOpenTransition={(task) => {
                            setReadingTransitionModal({
                                show: true,
                                data: {
                                    taskId: task.id,
                                    finishedTitle: task.readingConfig?.bookTitle,
                                    period: task.readingConfig?.period || 'weekly'
                                }
                            });
                        }}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        viewMode={viewMode}
                    />


					
                    <div className={`rounded-3xl border transition-all duration-300 shadow-xl overflow-hidden ${
                      hasActiveBg 
                        ? 'bg-white/20 backdrop-blur-md border-white/20' 
                        : 'bg-white/70 backdrop-blur-md border-white/50'
                    }`}>
                    <div className={`p-4 border-b flex justify-between items-center transition-colors ${
                      hasActiveBg ? 'border-white/15 bg-white/10' : 'border-gray-100 bg-white/50'
                    }`}>
                    <h2 className={`text-lg font-bold flex items-center gap-2 ${
                      hasActiveBg ? 'text-white drop-shadow-xs' : 'text-gray-700'
                    }`}>
                      <CalendarIcon className={`w-5 h-5 ${hasActiveBg ? 'text-amber-300' : theme.primary}`} /> 打卡记录
                    </h2>
                    <div className={`flex rounded-xl p-1 text-xs font-bold items-center transition-colors ${
                      hasActiveBg ? 'bg-white/15 backdrop-blur-xs border border-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {(viewMode === 'calendar' || viewMode === 'week') && (
                      <button 
                        onClick={scrollToToday} 
                        className={`mr-2 px-2 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                          hasActiveBg ? 'text-white/70 hover:text-white hover:bg-white/20' : 'text-gray-400 hover:text-gray-600 hover:bg-white'
                        }`} 
                        title="定位到今天"
                      >
                        <Locate className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleSelectViewMode('today')} 
                      className={`px-3 py-1.5 rounded-md transition-all ${
                        viewMode === 'today' 
                          ? (hasActiveBg ? `${theme.primaryBg} text-white shadow-xs font-extrabold` : 'bg-white shadow text-gray-800') 
                          : (hasActiveBg ? 'text-white/75 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600')
                      }`}
                    >
                      今日
                    </button>
                    <button 
                      onClick={() => handleSelectViewMode('week')} 
                      className={`px-3 py-1.5 rounded-md transition-all ${
                        viewMode === 'week' 
                          ? (hasActiveBg ? `${theme.primaryBg} text-white shadow-xs font-extrabold` : 'bg-white shadow text-gray-800') 
                          : (hasActiveBg ? 'text-white/75 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600')
                      }`}
                    >
                      本周
                    </button>
                    <div className="flex items-center">
                        <button onClick={() => {
                            handleSelectViewMode('calendar');
                            const m = calendarViewMonth || { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
                            if (m.month === 1) setCalendarViewMonth({ year: m.year - 1, month: 12 });
                            else setCalendarViewMonth({ year: m.year, month: m.month - 1 });
                        }} className={`px-1.5 py-1.5 rounded-md transition-colors ${viewMode === 'calendar' ? (hasActiveBg ? 'text-white/80 hover:bg-white/20' : 'text-gray-600 hover:bg-white') : (hasActiveBg ? 'text-white/30' : 'text-gray-300')}`} title="上个月">◀</button>
                        <button onClick={() => { handleSelectViewMode('calendar'); setCalendarViewMonth(null); }} className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'calendar' ? (hasActiveBg ? `${theme.primaryBg} text-white shadow-xs font-extrabold` : 'bg-white shadow text-gray-800') : (hasActiveBg ? 'text-white/75 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600')}`}>
                            {viewMode === 'calendar' && calendarViewMonth ? `${calendarViewMonth.month}月` : '本月'}
                        </button>
                        <button onClick={() => {
                            handleSelectViewMode('calendar');
                            const m = calendarViewMonth || { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
                            const now = new Date();
                            const isCurrentMonth = m.year === now.getFullYear() && m.month === now.getMonth() + 1;
                            if (!isCurrentMonth) {
                                if (m.month === 12) setCalendarViewMonth({ year: m.year + 1, month: 1 });
                                else setCalendarViewMonth({ year: m.year, month: m.month + 1 });
                            }
                        }} className={`px-1.5 py-1.5 rounded-md transition-colors ${viewMode === 'calendar' ? (calendarViewMonth && !(calendarViewMonth.year === new Date().getFullYear() && calendarViewMonth.month === new Date().getMonth() + 1) ? (hasActiveBg ? 'text-white/80 hover:bg-white/20' : 'text-gray-600 hover:bg-white') : (hasActiveBg ? 'text-white/30 cursor-default' : 'text-gray-300 cursor-default')) : (hasActiveBg ? 'text-white/30' : 'text-gray-300')}`} title="下个月">▶</button>
                    </div>
                    </div>
                    </div>

                    {(viewMode === 'calendar' || viewMode === 'week') ? (
                    <div className="overflow-x-auto pb-2 pt-4" ref={scrollContainerRef}>
                    <table className="w-full text-sm">
                    <thead className="relative">
                    <tr className={hasActiveBg ? 'bg-white/10 border-b border-white/10' : 'bg-gray-50/50'}>
                    <th className={`p-3 text-left w-px whitespace-nowrap sticky left-0 z-10 font-bold pl-6 transition-colors ${
                      hasActiveBg 
                        ? 'bg-slate-900/80 backdrop-blur-md text-white/80 border-r border-white/15 shadow-[2px_0_8px_rgba(0,0,0,0.3)]' 
                        : 'bg-gray-50 text-gray-400 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]'
                    }`}>任务名称</th>
                    {calendarDates.map(date => {
                                    const currentProfile = profiles.find(p => p.name === activeChild);
                                    const joinDate = currentProfile?.createdDate || (() => {
                                      const allDates = [];
                                      Object.values(checkins[activeChild] || {}).forEach(dates => allDates.push(...Object.keys(dates)));
                                      return allDates.length > 0 ? allDates.sort()[0] : '9999-99-99';
                                    })();
                                    const dateParts = date.split('-');
                                    const d = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
                                    const dayOfWeek = d.getDay();
                                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                                    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
                                    const weekDayName = weekDays[dayOfWeek];
                                    
                                    const todayStr = getLocalDateKey(0);
                                    const isToday = date === todayStr;
                                    const isPast = date < todayStr;
                                    const hasAnyCheckin = (tasks[activeChild] || []).some(t => checkins[activeChild]?.[t.id]?.[date] !== undefined);
                                    const isExempted = exemptedDays[activeChild]?.includes(date);
                                    const isMissed = isPast && date >= joinDate && !hasAnyCheckin && !isExempted;

                                    return (
                                      <th 
                                        key={date} 
                                        ref={isToday ? todayRef : null} 
                                        onClick={() => isMissed ? handleMissedDayClick(date) : null}
                                        className={`relative p-2 min-w-[50px] text-center font-bold text-xs transition-colors overflow-visible rounded-t-lg
                                          ${isToday 
                                            ? (hasActiveBg ? 'bg-amber-400/25 text-white rounded-t-lg shadow-sm border-t-2 border-amber-300 backdrop-blur-xs ring-1 ring-amber-300/40' : `${theme.primary} bg-white rounded-t-lg shadow-sm border-t-2 border-current ring-1 ring-amber-400/30`) 
                                            : isWeekend 
                                              ? (hasActiveBg ? 'bg-rose-500/20 text-rose-200 border-t-2 border-rose-400/80 rounded-t-lg shadow-inner' : 'bg-rose-50 text-rose-600 border-t-2 border-rose-400 rounded-t-lg') 
                                              : (hasActiveBg ? 'text-white/70 hover:bg-white/5' : 'text-gray-500 hover:bg-gray-50')} 
                                          ${isMissed ? (hasActiveBg ? 'cursor-pointer hover:bg-rose-500/25 bg-rose-500/15 border-b-2 border-rose-400/40 text-rose-200' : 'cursor-pointer hover:bg-red-50 bg-red-50/50 border-b-2 border-red-200') : ''}
                                          ${isExempted ? (hasActiveBg ? 'bg-sky-500/20 border-b-2 border-sky-400/40 text-sky-200 opacity-90' : 'bg-blue-50/60 border-b-2 border-blue-200 opacity-90') : ''}
                                        `}
                                      >
                                        <div className="flex flex-col items-center justify-center">
                                          <span className={`text-[10px] leading-tight font-extrabold ${
                                            isToday 
                                              ? (hasActiveBg ? 'text-amber-300' : theme.primary)
                                              : isWeekend 
                                                ? (hasActiveBg ? 'text-rose-300' : 'text-rose-600')
                                                : (hasActiveBg ? 'text-white/40' : 'text-gray-400')
                                          }`}>
                                            {isToday ? (isWeekend ? `今·${weekDayName}` : '今天') : `周${weekDayName}`}
                                          </span>
                                          <span className={`text-xs leading-tight mt-0.5 ${
                                            isToday
                                              ? (hasActiveBg ? 'text-white font-black' : 'text-gray-900 font-black')
                                              : isWeekend
                                                ? (hasActiveBg ? 'text-rose-200 font-black' : 'text-rose-600 font-black')
                                                : (hasActiveBg ? 'text-white/85 font-bold' : 'text-gray-700 font-bold')
                                          }`}>
                                            {d.getMonth() + 1}/{d.getDate()}
                                          </span>
                                        </div>
                                        {/* 断签(红)/豁免(蓝)：角标 */}
                                        {isMissed && (
                                        <span className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center text-base animate-flame-flicker pointer-events-none" style={{ zIndex: 1, textShadow: '0 0 4px rgba(239,68,68,0.9)' }} title="断签">💔</span>
                                        )}
                                        {isExempted && (
                                            <div className={`absolute -top-1 -right-1 text-[9px] px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap font-bold scale-75 md:scale-100 ${hasActiveBg ? 'bg-sky-500 text-white ring-1 ring-sky-300' : 'bg-blue-500 text-white'}`} style={{ zIndex: 9999 }}>
                                                已豁免
                                            </div>
                                        )}
                                      </th>
                                    );
                                  })}
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const weekRange = getCurrentWeekRange();
                                  const dailyMust = ongoingTasks.filter(t => (t.frequencyType || 'count') === 'daily_must');
                                  const weeklyOptional = ongoingTasks.filter(t => (t.frequencyType || 'count') === 'weekly_optional');
                                  const countType = ongoingTasks.filter(t => !t.frequencyType || t.frequencyType === 'count');
                                  const calendarOrderedTasks = [...dailyMust, ...weeklyOptional, ...countType];
                                  return calendarOrderedTasks.map((task, idx) => {
                                    const freq = task.frequencyType || 'count';
                                    const rowTypeStyle = hasActiveBg
                                      ? (freq === 'daily_must' ? 'border-l-4 border-l-red-400 bg-red-500/10' : freq === 'weekly_optional' ? 'border-l-4 border-l-sky-400 bg-sky-500/10' : 'border-l-4 border-l-amber-300/60 bg-amber-500/5')
                                      : (freq === 'daily_must' ? 'border-l-4 border-l-red-400 bg-red-50/20' : freq === 'weekly_optional' ? 'border-l-4 border-l-sky-400 bg-sky-50/20' : 'border-l-4 border-l-amber-200');
                                    const taskRecordCount = Object.keys(checkins[activeChild]?.[task.id] || {}).length;
                                    const taskTarget = task.targetCount || 1;
                                    const record = checkins[activeChild]?.[task.id] || {};
                                    const weekCheckins = Object.keys(record).filter(d => d >= weekRange.start && d <= weekRange.end).length;
                                    const weeklyTarget = task.weeklyTargetCount ?? 3;
                                    const progressPct = freq === 'daily_must' ? Math.min(100, (weekCheckins / 7) * 100) : freq === 'weekly_optional' ? Math.min(100, (weekCheckins / weeklyTarget) * 100) : Math.min(100, (taskRecordCount / taskTarget) * 100);
                                    const barTrackCls = hasActiveBg
                                      ? (freq === 'daily_must' ? 'bg-red-500/20' : freq === 'weekly_optional' ? 'bg-sky-500/20' : 'bg-amber-500/20')
                                      : (freq === 'daily_must' ? 'bg-red-50/90' : freq === 'weekly_optional' ? 'bg-sky-50/90' : 'bg-amber-50/90');
                                    const barFillCls = hasActiveBg
                                      ? (freq === 'daily_must' ? 'bg-gradient-to-r from-red-500/40 to-red-400/50' : freq === 'weekly_optional' ? 'bg-gradient-to-r from-sky-500/40 to-sky-400/50' : 'bg-gradient-to-r from-amber-500/40 to-amber-400/50')
                                      : (freq === 'daily_must' ? 'bg-gradient-to-r from-red-100 to-red-200/90' : freq === 'weekly_optional' ? 'bg-gradient-to-r from-sky-100 to-sky-200/90' : 'bg-gradient-to-r from-amber-100 to-amber-200/90');
                                    const bubbleContent = freq === 'daily_must' ? '必做' : freq === 'weekly_optional' ? `每周 ${weeklyTarget} 次` : `进度：${taskRecordCount}/${taskTarget}`;
                                    const bubbleCls = freq === 'daily_must' ? 'bg-red-100 text-red-600 border-red-200' : freq === 'weekly_optional' ? 'bg-sky-100 text-sky-600 border-sky-200' : 'bg-amber-50 text-amber-600 border-amber-200';
                                    return (
                                    <tr key={task.id} className={`border-b transition-colors ${hasActiveBg ? 'border-white/10 hover:bg-white/10' : 'border-gray-50 hover:bg-white/80'} ${rowTypeStyle} ${idx % 2 === 0 ? '' : (hasActiveBg ? 'bg-white/[0.03]' : 'bg-gray-50/20')}`}>
                                      <td className={`p-0 sticky left-0 z-30 overflow-visible w-px whitespace-nowrap align-middle relative transition-colors ${hasActiveBg ? 'bg-slate-900/85 backdrop-blur-md border-r border-white/15 shadow-[4px_0_12px_rgba(0,0,0,0.3)]' : 'bg-white border-r border-gray-100 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]'}`}>
                                        <span className={`relative z-10 inline-block pl-4 pr-3 lg:pr-14 py-3 font-bold whitespace-nowrap ${hasActiveBg ? 'text-white drop-shadow-xs' : 'text-gray-800'}`} style={{ textShadow: hasActiveBg ? '0 1px 3px rgba(0,0,0,0.7)' : '0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.06)' }}>{task.name}</span>
                                        <div className={`absolute inset-0 rounded-r-lg ${barTrackCls}`} aria-hidden="true" />
                                        <div className={`absolute inset-y-0 left-0 rounded-r-lg transition-all duration-500 flex items-center justify-end pr-1.5 ${barFillCls}`} style={{ width: `${progressPct}%`, maxWidth: '100%' }} aria-hidden="true">
                                          {progressPct >= 12 && (
                                            <span className={`h-full flex items-center justify-end font-black leading-none select-none text-[2.25rem] ${hasActiveBg ? 'text-white/40' : 'text-white'}`} style={{ lineHeight: 1 }}>{weekCheckins}</span>
                                          )}
                                        </div>
                                        <span className={`absolute -top-1 -right-1 z-20 min-w-[18px] h-4 px-1.5 rounded-full text-[9px] font-bold border-2 border-white shadow-sm flex items-center justify-center ${bubbleCls}`}>{bubbleContent}</span>
                                      </td>
                                      {calendarDates.map(date => {
                                      const dateParts = date.split('-');
                                      const d = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
                                      const dayOfWeek = d.getDay();
                                      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                                      const rec = checkins[activeChild]?.[task.id]?.[date];
                                      const isChecked = rec !== undefined;
                                      const isSkipped = rec === '免';
                                      const isToday = getLocalDateKey(0) === date;
                                      const isBeforeStart = task.startDate && date < task.startDate;
                                      const isAfterEnd = task.deadline && date > task.deadline;
                                      const needBreathe = freq === 'daily_must' && isToday && !isChecked && !isBeforeStart && !isAfterEnd;
                                      const isRepaired = !!(repairedCheckins[activeChild]?.[task.id]?.[date]);
                                      return (
                                        <td key={date} className={`p-2 text-center transition-colors ${isToday ? (hasActiveBg ? 'bg-white/10' : 'bg-white shadow-y') : (isWeekend ? (hasActiveBg ? 'bg-rose-500/[0.05]' : 'bg-rose-50/40') : '')}`}>
                                          <div className="relative w-8 h-8 mx-auto">
                                            {isRepaired && <RepairedFlameBadge size="sm" className="absolute -bottom-1 -right-1 z-20" />}
                                            <button 
                                              onClick={() => handleCellClick(task.id, date)} 
                                              disabled={isBeforeStart || isAfterEnd} 
                                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors transition-transform duration-300 ${
                                                (isBeforeStart || isAfterEnd) 
                                                  ? (hasActiveBg ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-gray-100/50 text-gray-200 cursor-not-allowed') 
                                                  : needBreathe 
                                                    ? (hasActiveBg ? 'animate-breathe-daily text-rose-300 ring-1 ring-rose-400/50' : 'animate-breathe-daily text-red-400') 
                                                    : isSkipped 
                                                      ? (hasActiveBg ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 shadow-xs' : 'bg-indigo-100 text-indigo-500 shadow-sm') 
                                                      : isChecked 
                                                        ? `${theme.primaryBg} text-white shadow-md shadow-${theme.id}-200/50 scale-100` 
                                                        : (hasActiveBg ? 'bg-white/10 text-white/40 hover:bg-white/20 hover:text-white hover:scale-110' : 'bg-gray-100 text-gray-300 hover:bg-gray-200 hover:scale-110')
                                              }`}
                                            >
                                              {(isBeforeStart || isAfterEnd) ? (
                                                <span className="text-[10px]">•</span>
                                              ) : isSkipped ? (
                                                <span className="text-xs font-bold">免</span>
                                              ) : isChecked ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                              ) : needBreathe ? (
                                                <div className={`w-2 h-2 rounded-full ${hasActiveBg ? 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]' : 'bg-red-400/90'}`} />
                                              ) : (
                                                <div className={`w-1.5 h-1.5 rounded-full ${hasActiveBg ? 'bg-white/30' : 'bg-gray-300'}`}></div>
                                              )}
                                            </button>
                                          </div>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              {(() => {
                                  const dailyMust = ongoingTasks.filter(t => (t.frequencyType || 'count') === 'daily_must');
                                  const weeklyOptional = ongoingTasks.filter(t => (t.frequencyType || 'count') === 'weekly_optional');
                                  const countType = ongoingTasks.filter(t => !t.frequencyType || t.frequencyType === 'count');
                                  const todayOrderedTasks = [...dailyMust, ...weeklyOptional, ...countType];
                                  return todayOrderedTasks.map(task => {
                                      const today = getLocalDateKey(0);
                                      const rawRecord = checkins[activeChild]?.[task.id]?.[today];
                                      // 多次打卡支持：数组时需要提取分钟总数用于显示
                                      const displayMinutes = typeof rawRecord === 'number' ? rawRecord : (Array.isArray(rawRecord) ? rawRecord.reduce((s, e) => s + (e.m || 0), 0) : rawRecord);
                                      const isChecked = rawRecord !== undefined;
                                      const record = displayMinutes; // 兼容后续代码
                                      const isBeforeStart = task.startDate && today < task.startDate;
                                      const isAfterEnd = task.deadline && today > task.deadline;
                                      if (isBeforeStart || isAfterEnd) return null;
                                      const freq = task.frequencyType || 'count';
                                      const cardTypeStyle = hasActiveBg
                                          ? (freq === 'daily_must' ? 'border-l-4 border-l-red-400 bg-red-500/10' : freq === 'weekly_optional' ? 'border-l-4 border-l-sky-400 bg-sky-500/10' : 'border-l-4 border-l-amber-400 bg-amber-500/10')
                                          : (freq === 'daily_must' ? 'border-l-4 border-l-red-400 bg-red-50/10' : freq === 'weekly_optional' ? 'border-l-4 border-l-sky-400 bg-sky-50/10' : 'border-l-4 border-l-amber-200 bg-amber-50/10');
                                      const taskRecordCount = Object.keys(checkins[activeChild]?.[task.id] || {}).length;
                                      const taskTarget = task.targetCount || 1;
                                      const bubbleContent = freq === 'daily_must' ? '必做' : freq === 'weekly_optional' ? `每周 ${task.weeklyTargetCount ?? 3} 次` : `进度：${taskRecordCount}/${taskTarget}`;
                                      const bubbleCls = freq === 'daily_must' ? 'bg-red-100 text-red-600 border-red-200' : freq === 'weekly_optional' ? 'bg-sky-100 text-sky-600 border-sky-200' : 'bg-amber-50 text-amber-600 border-amber-200';
                                      const isRepairedToday = !!(repairedCheckins[activeChild]?.[task.id]?.[today]);
                                      return (
                                          <div key={task.id} onClick={() => handleCellClick(task.id, today)} className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-colors transition-transform group relative overflow-visible ${cardTypeStyle} ${
                                            hasActiveBg
                                              ? (isChecked ? 'bg-white/20 border-white/30 backdrop-blur-md shadow-lg shadow-black/10' : 'bg-white/10 border-white/15 backdrop-blur-md hover:bg-white/15 hover:border-white/25')
                                              : (isChecked ? `bg-white border-${theme.id}-200 shadow-md` : 'border-gray-100 hover:bg-white hover:shadow-sm')
                                          }`}>
                                              {isRepairedToday && <RepairedFlameBadge size="md" className="absolute -bottom-1 -right-1 z-20" />}
                                              <span className={`absolute -top-1 z-20 min-w-[18px] h-4 px-1.5 rounded-full text-[9px] font-bold border-2 border-white shadow-sm flex items-center justify-center ${bubbleCls}`} style={{ right: '-0.25rem' }}>{bubbleContent}</span>
                                              <div className="flex items-center gap-4 pr-16">
                                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                                                    isChecked 
                                                      ? (hasActiveBg ? 'bg-white/20 text-white' : theme.lightBg) 
                                                      : (hasActiveBg ? 'bg-white/10' : 'bg-white')
                                                  }`}>
                                                    {isChecked ? (
                                                      <CheckCircle2 className={`w-6 h-6 ${hasActiveBg ? 'text-emerald-400' : theme.primary}`} />
                                                    ) : (
                                                      <div className={`w-6 h-6 rounded-full border-2 ${hasActiveBg ? 'border-white/30 group-hover:border-white/60' : 'border-gray-200 group-hover:border-gray-300'}`}></div>
                                                    )}
                                                  </div>
                                                  <div>
                                                    <div className={`font-bold text-lg ${hasActiveBg ? 'text-white drop-shadow-xs' : (isChecked ? 'text-gray-800' : 'text-gray-500')}`}>{task.name}</div>
                                                    <div className={`text-xs font-bold flex items-center gap-1 ${hasActiveBg ? 'text-amber-300' : 'text-amber-500'}`}><Coins className="w-3 h-3" /> +{task.reward}</div>
                                                  </div>
                                              </div>
                                              {isChecked && <div className={`text-2xl font-bold ${hasActiveBg ? 'text-amber-300' : theme.primary}`}>{record}<span className={`text-sm font-medium ml-1 ${hasActiveBg ? 'text-white/60' : 'opacity-50'}`}>分钟</span></div>}
                                          </div>
                                      );
                                  });
                              })()}
                          </div>
                        )}
                    </div>
                  </main>

                  <ShopNPC onClick={() => { setShopInitialTab('buy'); setShowShop(true); }} currentEra={currentLevelInfo.era} />

					{/* 右侧悬浮按钮栈：自下而上 背包 → 工资信封(若有) → 月度总结(每月1-3日) → GOD_MODE(测试员)，互不遮挡 */}
					{(() => {
						const dayOfMonth = new Date().getDate();
						const showMonthlySummaryBtn = dayOfMonth >= 1 && dayOfMonth <= 3;
						const hasEnvelope = !!weeklyPayrollToClaim;
						const hasMonthly = showMonthlySummaryBtn;
						const isGOD = activeChild === '测试员';
						const envelopeBottom = 'bottom-20';      // 5rem
						const monthlyBottom = hasEnvelope ? 'bottom-36' : 'bottom-20';  // 有信封时在信封上方
						const godBottom = isGOD ? (hasEnvelope && hasMonthly ? 'bottom-[17rem]' : hasEnvelope || hasMonthly ? 'bottom-52' : 'bottom-36') : '';
						const chatBottom = isGOD ? (hasEnvelope && hasMonthly ? 'bottom-[21rem]' : hasEnvelope || hasMonthly ? 'bottom-[16rem]' : 'bottom-52') : (hasEnvelope && hasMonthly ? 'bottom-[17rem]' : hasEnvelope || hasMonthly ? 'bottom-36' : 'bottom-20');
						const chatBottomPx = isGOD ? (hasEnvelope && hasMonthly ? 336 : hasEnvelope || hasMonthly ? 256 : 208) : (hasEnvelope && hasMonthly ? 272 : hasEnvelope || hasMonthly ? 144 : 80);
						return (
							<>
								{/* 工资信封：与背包同尺寸、同浮动 */}
								{hasEnvelope && (
									<button
										onClick={() => setShowWeeklyPayrollModal(true)}
										className={`fixed right-3 lg:right-4 z-[91] w-11 h-11 lg:w-14 lg:h-14 rounded-full bg-gradient-to-tr from-red-400 to-amber-500 border-2 border-white shadow-xl flex items-center justify-center transform transition-transform hover:scale-110 text-xl lg:text-2xl transform transition-transform hover:scale-110 npc-float ${envelopeBottom}`}
										title="上周学习工资已到账，点击查看"
									>
										📩
										<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
											<span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400 border border-white"></span>
										</span>
									</button>
								)}
								{/* 月度总结：每月1-3日显示，持续3天 */}
								{showMonthlySummaryBtn && (
									<button
										onClick={() => { setStatsOpenMode('monthly'); setShowStats(true); }}
										className={`fixed right-3 lg:right-4 z-[90] w-11 h-11 lg:w-14 lg:h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white shadow-xl flex items-center justify-center transform transition-transform hover:scale-110 text-xl lg:text-2xl transform transition-transform hover:scale-110 npc-float ${monthlyBottom}`}
										title="查看上月学习总结"
									>
										📑
									</button>
								)}
								{/* 我的背包 */}
								<button
									onClick={() => { setShopInitialTab('inventory'); setShowShop(true); }}
									className="fixed bottom-4 right-3 lg:right-4 z-[90] w-11 h-11 lg:w-14 lg:h-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 border-2 border-white shadow-lg flex items-center justify-center text-xl lg:text-2xl transform transition-transform hover:scale-110 group npc-float"
									title="我的背包"
								>
									🎒
									{Object.keys(inventory[activeChild] || {}).length > 0 && (
										<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
											<span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
										</span>
									)}
								</button>
							{/* 小星老师 AI 助手 */}
							{aiChatEnabled && (
								<div className="relative">
									{/* AI 对话气泡 */}
									{aiBubbleVisible && aiBubbleMessage && aiBubbleChild === activeChild && (
										<div className="fixed right-16 lg:right-20 z-[46] max-w-[200px] animate-in fade-in slide-in-from-right-2 duration-300" style={{ bottom: `${chatBottomPx + 16}px` }}>
											<div className="bg-white rounded-2xl rounded-br-md px-3 py-2 shadow-lg border border-gray-100 relative">
												<p className="text-xs text-gray-700 leading-relaxed">{aiBubbleMessage}</p>
												<div className="absolute right-[-6px] bottom-2 w-0 h-0 border-t-[6px] border-t-transparent border-l-[6px] border-l-white border-b-[6px] border-b-transparent drop-shadow-sm"></div>
											</div>
										</div>
									)}
									<button
										onClick={() => {
											// 将气泡消息写入对话历史（仅写入一次）
											if (aiBubbleMessage && aiBubbleVisible && aiBubbleChild) {
												const aiMsg = { id: `msg_ai_${Date.now()}`, role: 'assistant', text: aiBubbleMessage, timestamp: Date.now(), childName: aiBubbleChild };
												setAiChatHistory(prev => ({
													...prev,
													[aiBubbleChild]: [...(prev[aiBubbleChild] || []).slice(-49), aiMsg]
												}));
												setAiBubbleVisible(false);
												setAiBubbleMessage('');
												setAiBubbleChild('');
											}
											setShowChatDrawer(true);
										}}
										className={`fixed right-3 lg:right-4 z-[45] w-11 h-11 lg:w-14 lg:h-14 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 border-2 border-white shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 text-xl lg:text-2xl transform transition-transform hover:scale-110 npc-float ${chatBottom}`}
										title="小星老师"
									>
										🎓
									</button>
								</div>
							)}
							</>
					);
				})()}

						{/* 元气生活·习惯养成专属悬浮按钮（位于伴读按钮上方 bottom-52，支持环形进度条与轻量微打卡浮层） */}
						<HabitFloatingButton
							habitTasks={activeHabitTasks}
							activeChild={activeChild}
							checkins={checkins}
							todayStr={getLocalDateKey(0)}
							onCheckin={handleHabitCheckin}
							onOpenPavilion={() => setShowHabitPavilion(true)}
						/>

						{/* 家长爱心礼物/红包悬浮按钮（位于元气习惯上方 bottom-68，收到红包或转盘嘉奖时高亮浮现） */}
						{unclaimedGifts.length > 0 && (() => {
							const topGift = unclaimedGifts[0];
							const isRp = topGift.type === 'red_packet';
							const operator = topGift.operatorRole || '家长';
							const giftDesc = isRp ? `【${operator}】发来爱心红包！` : `【${operator}】赐予仙缘转盘！`;
							return (
								<div className="fixed bottom-68 left-3 lg:left-4 z-[90] flex items-center group select-none">
									{/* 悬浮提示气泡 (类似伴宠气泡) */}
									<div className="absolute left-14 lg:left-16 bottom-0 whitespace-nowrap bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl rounded-bl-xs shadow-xl border border-amber-300 text-stone-800 pointer-events-none animate-in fade-in slide-in-from-left-2 duration-300 z-10">
										<div className="flex items-center gap-1.5 text-xs font-black text-rose-600">
											<span>{isRp ? '🧧' : '🎡'}</span>
											<span>{giftDesc}</span>
										</div>
										<div className="text-[10px] text-stone-500 max-w-[190px] truncate mt-0.5">
											{topGift.reason ? `“${topGift.reason}”` : '点击开盒领宝 ➔'}
										</div>
										{/* 气泡左小箭头 */}
										<div className="absolute -left-1.5 bottom-3 w-0 h-0 border-t-[5px] border-t-transparent border-r-[6px] border-r-white border-b-[5px] border-b-transparent drop-shadow-xs" />
									</div>

									{/* 礼盒悬浮主按钮 */}
									<button
										type="button"
										data-testid="parent-gift-floating-btn"
										onClick={() => setShowParentGiftModal(true)}
										className="relative w-11 h-11 lg:w-14 lg:h-14 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-400 border-2 border-amber-200 shadow-2xl flex items-center justify-center text-xl lg:text-2xl transform transition-transform hover:scale-110 active:scale-95 animate-bounce shadow-rose-900/40 cursor-pointer"
										title="收到家长爱心赏赐，点击拆领！"
									>
										<span>{isRp ? '🧧' : '🎁'}</span>
										{/* 数量角标 */}
										<span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 bg-amber-300 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black text-rose-950 shadow-md">
											{unclaimedGifts.length}
										</span>
									</button>
								</div>
							);
						})()}

						{/* 天工书阁伴读悬浮按钮（位于宠物上方 bottom-36，支持环形进度条与智能双态切换） */}
						<ReadingFloatingButton
							readingTasks={activeReadingTasks}
							activeChild={activeChild}
							checkins={checkins}
							todayStr={getLocalDateKey(0)}
							readingHistory={readingHistory}
							onOpenQuickCheckin={(task) => {
								setReadingTaskForCheckin(task || activeReadingTasks[0]);
								setShowReadingQuickCheckin(true);
							}}
							onOpenPavilion={() => setShowReadingPavilion(true)}
						/>

						{/* 伴宠历练与灵宠仙阁悬浮按钮（位于左侧 bottom-20，支持环形探险进度圈与进行中活动悬浮面板） */}
						<PetFloatingButton
							petAdventures={petAdventures}
							activeChild={activeChild}
							petData={petData}
							activePet={activePet}
							petCatalog={petCatalog}
							adventureRealms={adventureRealms}
							petNotifDot={petNotifDot}
							petNotifVisible={petNotifVisible}
							currentPetNotif={currentPetNotif}
							showPetNotifBubble={showPetNotifBubble}
							onOpenPet={handleOpenPet}
							handleCompleteAdventure={handleCompleteAdventure}
							handleDismissAdventure={handleDismissAdventure}
							handleDismissAllAdventures={handleDismissAllAdventures}
							showToast={showToast}
						/>


                  <WheelModal 
					showWheel={showWheel} 
					wheelResult={wheelResult} 
					// 检查是否已经赢过：金币查 wheelHistory，XP查 xpHistory
					alreadyWon={(isDemoWheel || isExtraReward) ? null : (
						wheelType === 'xp' 
						? xpHistory[`${activeChild}-XP_WHEEL-${getLocalDateKey(0)}`] 
						: wheelHistory[`${activeChild}-${getLocalDateKey(0)}`]
					)}
					theme={theme} 
					// 根据类型传不同的配置
					wheelConfig={wheelType === 'xp' ? xpWheelConfig : wheelConfig} 
					pointerRotation={pointerRotation} 
					isDemoWheel={isDemoWheel} 
					setShowWheel={setShowWheel} 
					setWheelResult={setWheelResult} 
					spinWheel={spinWheel} 
					wheelSpinning={wheelSpinning} 
					isExtraReward={isExtraReward}
					wheelType={wheelType} // 新增 prop
				  />
                  <SettingsModal 
                    showSettings={showSettings} 
                    setShowSettings={setShowSettings} 
                    initialTab={settingsInitialTab}
                    theme={theme} 
                    globalDates={globalDates} 
                    setGlobalDates={setGlobalDates} 
                    profiles={profiles} 
                    handleAddProfile={handleAddProfile} 
					deleteProfile={deleteProfile} // <--- 【新增】删除成员
                    handleAvatarUpload={handleAvatarUpload} 
                    updateProfileTheme={updateProfileTheme} 
                    wheelSettings={wheelSettings} 
                    setWheelSettings={setWheelSettings}
					xpWheelConfig={xpWheelConfig}
					setXpWheelConfig={setXpWheelConfig}					
                    wheelConfig={wheelConfig} 
                    setWheelConfig={setWheelConfig} 
                    setIsDemoWheel={setIsDemoWheel} 
                    setShowWheel={setShowWheel} 
                    setWheelResult={setWheelResult} 
                    activeChild={activeChild} 
                    tasks={tasks} 
                    handleDeleteTask={handleDeleteTask} 
                    updateTaskSetting={updateTaskSetting} 
                    handleAddTask={handleAddTask} 
                    evilWheelConfig={evilWheelConfig}
                    setEvilWheelConfig={setEvilWheelConfig}
                    evilAutoTrigger={evilAutoTrigger}
                    setEvilAutoTrigger={setEvilAutoTrigger}
                    onLaunchEvilWheel={handleLaunchEvilWheel}
                    onTestEvilWheel={handleTestEvilWheel}
					onLaunchExtraWheel={(type, isDemo) => handleLaunchExtraWheel(type, isDemo)}
                    settingsPassword={settingsPassword}
                    setSettingsPassword={setSettingsPassword}
                    authorizedParents={authorizedParents}
                    setAuthorizedParents={setAuthorizedParents}
                    isTestMode={isTestMode}
                    setIsTestMode={setIsTestMode}
					setShowMilestones={setShowMilestones}
					setShowBackupPanel={setShowBackupPanel}
					handleSyncMilestones={handleSyncMilestones}
					handleDeduplicateAchievements={handleDeduplicateAchievements}
					handleRecalculateLevelMilestones={handleRecalculateLevelMilestones}
					onFixInventory={handleFixInventory}
					weekendSettings={weekendSettings}
                    setWeekendSettings={setWeekendSettings}
					handleTestSettlement={handleTestSettlement}
					userCity={userCity}
                    setUserCity={setUserCity}
					updateProfileGrade={updateProfileGrade} // 传递年级更新函数
                    curriculumProgress={curriculumProgress} // 传递进度数据
                    handleVerifyCurriculum={handleVerifyCurriculum} // 传递核销函数
					checkins={checkins}
					reportConfig={reportConfig}
					setReportConfig={setReportConfig}
					stats={stats}
					homeworkExamConfig={homeworkExamConfig}
					setHomeworkExamConfig={setHomeworkExamConfig}
					clearNewTaskFlags={clearNewTaskFlags}
					aiEnabled={aiEnabled}
					setAiEnabled={setAiEnabled}
					deepseekApiKey={deepseekApiKey}
					setDeepseekApiKey={setDeepseekApiKey}
					aiPetEnabled={aiPetEnabled}
					setAiPetEnabled={setAiPetEnabled}
					aiChatEnabled={aiChatEnabled}
					setAiChatEnabled={setAiChatEnabled}
					aiDailyLimit={aiDailyLimit}
					setAiDailyLimit={setAiDailyLimit}
					aiDailyUsage={aiDailyUsage}
					syncCode={syncCode}
					setSyncCode={setSyncCode}
					syncLastTime={syncLastTime}
					syncStatus={syncStatus}
					syncToCloud={syncToCloud}
					syncFromCloud={syncFromCloud}
					triggerSyncUpload={triggerSyncUpload}
					wecomEnabled={wecomEnabled}
					setWecomEnabled={setWecomEnabled}
					wecomWebhookKey={wecomWebhookKey}
					setWecomWebhookKey={setWecomWebhookKey}
					wecomCorpId={wecomCorpId}
					setWecomCorpId={setWecomCorpId}
					wecomAgentId={wecomAgentId}
					setWecomAgentId={setWecomAgentId}
					wecomCallbackToken={wecomCallbackToken}
					setWecomCallbackToken={setWecomCallbackToken}
					wecomCallbackAesKey={wecomCallbackAesKey}
					setWecomCallbackAesKey={setWecomCallbackAesKey}
					wecomTestStatus={wecomTestStatus}
					setWecomTestStatus={setWecomTestStatus}
					pushPermission={pushPermission}
					pushSubscribed={pushSubscribed}
					enablePushNotifications={enablePushNotifications}
					testPushNotification={testPushNotification}
					showToast={showToast}
                  />

                  {/* AI 学习助手浮窗 */}
                  {aiChatEnabled && (
                    <>
                        <ChatDrawer
                            show={showChatDrawer}
                            onClose={() => setShowChatDrawer(false)}
                            theme={theme}
                            activeChild={activeChild}
                            aiChatHistory={aiChatHistory}
                            setAiChatHistory={setAiChatHistory}
                            callDeepSeekAPI={callDeepSeekAPI}
                            buildAssistantSystemPrompt={buildAssistantSystemPrompt}
                            aiEnabled={aiEnabled}
                            deepseekApiKey={deepseekApiKey}
                            aiChatEnabled={aiChatEnabled}
                        />
                    </>
                  )}

                  {/* 金元宝兑换面板 */}
                  <ExchangePanel
                      key={activeChild}
                      show={showExchange}
                      onClose={() => setShowExchange(false)}
                      totalGold={totalGold}
                      activeChild={activeChild}
                      syncCode={syncCode}
                      showToast={showToast}
                      setWheelHistory={setWheelHistory}
                      tasks={tasks}
                  />

                  {/* 企业微信家长消息 */}
                  {wecomEnabled && syncCode && (
                    <>
                        <FamilyMessagePanel
                            show={showFamilyPanel}
                            onClose={() => setShowFamilyPanel(false)}
                            messages={familyMessages}
                            activeChild={activeChild}
                            onSendReply={sendFamilyReply}
                            aiReply={familyAiReply}
                            isLoadingAi={familyAiLoading}
                        />
                        {/* 浮动消息按钮（仅在自建应用配置完整时显示） */}
                        {!showFamilyPanel && wecomCorpId && wecomAgentId && wecomCallbackToken && wecomCallbackAesKey && (() => {
                            const unreadCount = familyMessages.filter(m => !m.read && m.direction === 'parent_to_child').length;
                            return (
                                <button onClick={() => setShowFamilyPanel(true)}
                                    className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
                                    💌
                                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
                                </button>
                            );
                        })()}
                    </>
                  )}

                  {/* 商店弹窗 */}
                  <ShopModal
                      show={showShop}
                      onClose={() => setShowShop(false)}
					  initialTab={shopInitialTab}
                      theme={theme}
                      totalGold={totalGold}
                      currentEra={currentLevelInfo.era}
                      onBuy={handleBuyItem}
                      onUse={handleUseItem}
                      inventory={inventory[activeChild]||{}}
                      activeBuffs={activeBuffs[activeChild]||{}}
                      redeemedCoupons={redeemedCoupons[activeChild]||[]}
                      setRedeemedCoupons={setRedeemedCoupons}
                      equippedGear={equippedGear}
					  stats={stats}
                      activeChild={activeChild}
					  holidayForecast={apiHolidayForecast}
					  setShowTributeModal={setShowTributeModal}
                  />
				  
				  <WheelChoiceModal 
					  show={showWheelChoice} 
					  onClose={() => setShowWheelChoice(false)} 
					  onSelect={handleSelectWheel} 
				  />

				  <OracleCarveModal 
					  show={showOracleCarveModal} 
					  onClose={() => setShowOracleCarveModal(false)} 
					  onCarve={handleCarveOracleMessage} 
					  activeChild={activeChild} 
					  remainingCount={inventory[activeChild]?.['item_message'] || 0} 
				  />

				  <ParentGiftModal
					  show={showParentGiftModal}
					  onClose={() => setShowParentGiftModal(false)}
					  gifts={unclaimedGifts}
					  activeChild={activeChild}
					  onClaimRedPacket={handleClaimRedPacket}
					  onClaimWheel={handleClaimWheel}
				  />

                  {editingEntry && <TimeEntryModal editingEntry={editingEntry} tasks={tasks} activeChild={activeChild} removeCheckin={removeCheckin} setEditingEntry={setEditingEntry} saveCheckin={saveCheckin} theme={theme} inventory={inventory[activeChild]||{}} useRepairCard={useRepairCard} checkins={checkins} activeBuffs={activeBuffs} />}

                  {/* 断签豁免弹窗 */}
                  {exemptionModal && (() => {
                      const verifyBase = 'https://www.daka-tool.top/exemption-verify.html';
                      const verifyPageUrl = verifyBase + '?code=' + exemptionModal.exemptionCode + '&account=' + encodeURIComponent(activeChild) + '&date=' + encodeURIComponent(exemptionModal.date);
                      return (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setExemptionModal(null); setExemptionInputCode(''); }}>
                          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">🛡️ 断签豁免</h3>
                              <div className="space-y-2 mb-4">
                                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                      <span className="text-xs text-gray-500">孩子</span>
                                      <span className="font-bold text-gray-800">{activeChild}</span>
                                  </div>
                                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                      <span className="text-xs text-gray-500">日期</span>
                                      <span className="font-bold text-gray-800">{exemptionModal.date}</span>
                                  </div>
                              </div>
                              <p className="text-xs text-gray-500 mb-3">请家长用手机扫描下方二维码，在手机端确认豁免后，将显示的豁免码输入下方。</p>
                              <div className="flex justify-center mb-4 p-4 bg-gray-50 rounded-xl">
                                  <QRCodeView
                                      text={verifyPageUrl}
                                      alt="豁免二维码"
                                      className="w-48 h-48 rounded-lg"
                                  />
                              </div>
                              <div className="flex gap-2 mb-4">
                                  <input
                                      type="text"
                                      placeholder="输入手机端显示的豁免码"
                                      value={exemptionInputCode}
                                      onChange={e => setExemptionInputCode(e.target.value)}
                                      onKeyDown={e => {
                                          if (e.key === 'Enter') {
                                              e.preventDefault();
                                              if (exemptionInputCode.trim() === exemptionModal.exemptionCode) {
                                                  setExemptedDays(prev => {
                                                      const childExemptions = prev[activeChild] || [];
                                                      if (!childExemptions.includes(exemptionModal.date)) {
                                                          return { ...prev, [activeChild]: [...childExemptions, exemptionModal.date] };
                                                      }
                                                      return prev;
                                                  });
                                                  triggerSyncUpload();
                                                  setExemptionModal(null);
                                                  setExemptionInputCode('');
                                                  showToast('success', '豁免成功！');
                                              } else {
                                                  showToast('error', '豁免码不正确，请核对后重新输入。');
                                              }
                                          }
                                      }}
                                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm"
                                      autoFocus
                                  />
                                  <button
                                      onClick={() => {
                                          if (exemptionInputCode.trim() === exemptionModal.exemptionCode) {
                                              setExemptedDays(prev => {
                                                  const childExemptions = prev[activeChild] || [];
                                                  if (!childExemptions.includes(exemptionModal.date)) {
                                                      return { ...prev, [activeChild]: [...childExemptions, exemptionModal.date] };
                                                  }
                                                  return prev;
                                              });
                                              triggerSyncUpload();
                                              setExemptionModal(null);
                                              setExemptionInputCode('');
                                              showToast('success', '豁免成功！');
                                          } else {
                                              showToast('error', '豁免码不正确，请核对后重新输入。');
                                          }
                                      }}
                                      className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors"
                                  >确认豁免</button>
                              </div>
                              <button onClick={() => { setExemptionModal(null); setExemptionInputCode(''); }} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600">取消</button>
                          </div>
                      </div>
                      );
                  })()}

                  <AchievementWallModal 
                      show={showAchievements} 
                      onClose={() => setShowAchievements(false)} 
                      achievements={achievements[activeChild] || {}} 
                      theme={theme} 
                      checkins={checkins}
                      tasks={tasks}
                      activeChild={activeChild}
                      wheelHistory={wheelHistory}
                      stats={stats}
					  totalGold={totalGold}
					  exemptedDays={exemptedDays}
					  ownedPets={ownedPets}
					  petData={petData}
					  petStats={petStats}
					  petAdventureStats={petAdventureStats}
					  petAdventureLog={petAdventureLog}
                  />
				  <PetModal
				      show={showPet}
				      initialTab={petInitialTab}
				      exemptedDays={exemptedDays}
				      triggerSyncUpload={triggerSyncUpload}
				      onClose={() => setShowPet(false)}
				      theme={theme}
				      activeChild={activeChild}
				      profiles={profiles}
				      petData={petData}
				      setPetData={setPetData}
				      petSlots={petSlots}
				      setPetSlots={setPetSlots}
				      checkins={checkins}
				      tasks={tasks}
				      ownedPets={ownedPets}
				      setOwnedPets={setOwnedPets}
				      activePet={activePet}
				      setActivePet={setActivePet}
				      petCooldowns={petCooldowns}
				      setPetCooldowns={setPetCooldowns}
				      petStats={petStats}
				      setPetStats={setPetStats}
				      petMusicOn={petMusicOn}
				      setPetMusicOn={setPetMusicOn}
				      totalStars={totalStars}
				      level={currentLevelInfo?.level || 1}
				      currentEra={currentLevelInfo?.era || ""}
				      achievements={achievements}
				      setAchievements={setAchievements}
				      lowPerfMode={window.__lowPerf || false}
				      checkAchievements={checkAchievements}
				      setStarHistory={setStarHistory}
				      petAdventures={petAdventures}
				      setPetAdventures={setPetAdventures}
				      petAdventureLog={petAdventureLog}
				      petAdventureStats={petAdventureStats}
				      handleStartAdventure={handleStartAdventure}
				      handleCancelAdventure={handleCancelAdventure}
				      handleCompleteAdventure={handleCompleteAdventure}
				      handleDismissAdventure={handleDismissAdventure}
				      handleDismissAllAdventures={handleDismissAllAdventures}
				      getAdventureMultiplierStatus={getAdventureMultiplierStatus}
				      showToast={showToast}
				      aiEnabled={aiEnabled}
				      aiPetEnabled={aiPetEnabled}
				      deepseekApiKey={deepseekApiKey}
				      callDeepSeekAPI={callDeepSeekAPI}
				      inventory={inventory}
				      petCatalog={typeof PET_CATALOG !== 'undefined' ? PET_CATALOG : []}
				      adventureConfig={typeof ADVENTURE_CONFIG !== 'undefined' ? ADVENTURE_CONFIG : {}}
				  />
				  <CompletedWallModal 
					show={showCompletedWall} 
					onClose={() => setShowCompletedWall(false)} 
					completedTasks={completedTasks} 
					checkins={checkins} 
					activeChild={activeChild} 
					theme={theme}
				  />
                  <AchievementNotification unlockQueue={unlockQueue} onClose={closeNotification} />
                  <MilestonesModal show={showMilestones} onClose={() => setShowMilestones(false)} milestones={milestones} profiles={profiles} theme={theme} activeChild={activeChild} historicalEventProgress={historicalEventProgress} currentXP={currentXP} />
                  <BackupPanel show={showBackupPanel} onClose={() => setShowBackupPanel(false)} theme={theme} showToast={showToast} />
                  <SilenceModal
                      show={showSilenceModal}
                      onClose={() => setShowSilenceModal(false)}
                      profiles={profiles}
                      inventoryCount={inventory[activeChild]?.['item_silence'] || 0}
                      showToast={showToast}
                      onConfirm={(selectedNames, durationMinutes) => {
                          const cost = selectedNames.length * (durationMinutes / 10);
                          setInventory(prev => {
                              const childInv = prev[activeChild] || {};
                              const n = Math.max(0, (childInv['item_silence'] || 0) - cost);
                              const next = { ...childInv, item_silence: n };
                              if (n === 0) delete next.item_silence;
                              return { ...prev, [activeChild]: next };
                          });
                          const endTime = Date.now() + durationMinutes * 60 * 1000;
                          setActiveSilenceMutes(prev => {
                              const next = { ...prev };
                              selectedNames.forEach(name => { next[name] = endTime; });
                              return next;
                          });
                          if (typeof confetti === 'function') confetti({ particleCount: 60, spread: 50, colors: ['#6366f1', '#818cf8'] });
                      }}
                  />
                  {/* 禁言中长条：固定在 header 下方、不随滚动、不阻挡操作 */}
                  {(() => {
                      const entries = Object.entries(activeSilenceMutes || {}).filter(([, end]) => end > silenceNow);
                      if (entries.length === 0) return null;
                      const endTime = Math.max(...entries.map(([, e]) => e));
                      const remain = Math.max(0, Math.ceil((endTime - silenceNow) / 1000));
                      const min = Math.floor(remain / 60);
                      const sec = remain % 60;
                      const names = entries.map(([n]) => n).join('、');
                      return (
                          <div className="fixed left-0 right-0 top-[11rem] z-[75] pointer-events-none px-4 flex justify-center" aria-live="polite">
                              <div className="w-full max-w-2xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden bg-gradient-to-r from-slate-800 via-violet-900/95 to-slate-800 backdrop-blur-md">
                                  <div className="px-6 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
                                      <span className="text-white/90 text-sm font-medium uppercase tracking-widest">禁言中🤫</span>
                                      <span className="text-white font-bold text-lg">{names}</span>
                                      <span className="text-white/70 text-sm">剩余</span>
                                      <span className="text-white font-mono font-black text-2xl tabular-nums tracking-tight">
                                          {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
                                      </span>
                                  </div>
                              </div>
                          </div>
                      );
                  })()}
				  {/* 作业与考试成绩登记弹窗（独立） */}
                  <HomeworkExamRecordModal show={showHomeworkExamModal} onClose={() => setShowHomeworkExamModal(false)} theme={theme} activeChild={activeChild} homeworkExamConfig={homeworkExamConfig} homeworkRecords={homeworkRecords} examRecords={examRecords} setHomeworkRecords={setHomeworkRecords} setExamRecords={setExamRecords} setWheelHistory={setWheelHistory} pushWecomGrade={pushWecomGrade} updateStats={updateStats} triggerSyncUpload={triggerSyncUpload} />
				  {/* 学习数据中心弹窗 */}
                  {showStats && (
                    <StatsModal 
                      show={showStats} 
                      onClose={() => { setStatsOpenMode(null); setShowStats(false); }} 
                      checkins={checkins} 
                      tasks={tasks} 
                      activeChild={activeChild} 
                      theme={theme}
                      initialStatsTab={statsOpenMode === 'monthly' ? 'monthly' : 'overview'}
                      initialMonthKey={statsOpenMode === 'monthly' ? (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })() : null}
                      wheelHistory={wheelHistory}
                      homeworkExamConfig={homeworkExamConfig}
                      homeworkRecords={homeworkRecords}
                      examRecords={examRecords}
                      aiEnabled={aiEnabled}
                      deepseekApiKey={deepseekApiKey}
                      callDeepSeekAPI={callDeepSeekAPI}
                    />
                  )}
                  {/* 【新增】周末结算弹窗 */}
                  <WeekendSettlementModal 
                        state={settlementState} 
                        onClose={() => setSettlementState(null)} 
                        onClaim={(reward) => {
                            if (!reward || reward <= 0) return;
                            const weekendKey = getCurrentWeekendKey();
                            setWheelHistory(prev => ({ ...prev, [`${activeChild}-WEEKEND-${weekendKey}-${Date.now()}`]: reward }));
                            updateStats(activeChild, 'gold_earn', reward, { source: 'weekend', dateKey: getLocalDateKey(0) });
                            setWeekendSettings(prev => ({ ...prev, lastSettledWeekend: { ...(prev.lastSettledWeekend || {}), [activeChild]: weekendKey } }));
                            setSettlementState(null);
                        }}
                        settings={weekendSettings}
                        onUseExemption={() => {
                            setWeekendSettings(prev => ({...prev, guardianPassCount: (prev.guardianPassCount || 0) - 1}));
                            setSettlementState(null);
                            showToast('success', '豁免成功！连胜记录已恢复。');
                        }}
                  />
				  <ThemeSelectionModal show={showThemeModal} onClose={handleCloseThemeModal} currentTheme={theme} onSelectTheme={handleChangeTheme} unlockedThemes={stats[activeChild]?.unlockedThemes || []} showToast={showToast} />
                  <EvilWheelModal 
                    show={showEvilWheel} 
                    onClose={() => setShowEvilWheel(false)} 
                    wheelConfig={evilWheelConfig} 
                    pointerRotation={evilPointerRotation} 
                    spinWheel={spinEvilWheel} 
                    wheelSpinning={evilWheelSpinning} 
                    result={evilWheelResult}
                    isDemo={isEvilDemo}
                  />
				  <GoldHistoryModal
                    show={showGoldHistory}
                    onClose={() => setShowGoldHistory(false)}
                    transactions={transactions}
                    theme={theme}
                  />
                  <StarHistoryModal
                    show={showStarHistory}
                    onClose={() => setShowStarHistory(false)}
                    starTransactions={starTransactions}
                    theme={theme}
                  />
                  <XPHistoryModal
                    show={showXPHistory} 
                    onClose={() => setShowXPHistory(false)} 
                    xpTransactions={xpTransactions}
                    theme={theme}
                  />
                  <EvolutionPathModal
                    show={showEvolutionPath}
                    onClose={() => setShowEvolutionPath(false)}
                    currentXP={currentXP}
                    theme={theme}
                  />
                  <LevelUpNotification
                    show={levelUpQueue.length > 0}
                    onClose={closeLevelUp}
                    levelInfo={levelUpQueue[0]}
                  />
                  <RandomEventModal
                    show={showRandomEvent}
                    eventData={currentRandomEvent}
                    onClose={handleClaimRandomReward}
                    theme={theme}
                  />
                  <WeeklyPayrollModal
                    show={showWeeklyPayrollModal}
                    onClose={() => setShowWeeklyPayrollModal(false)}
                    payrollData={weeklyPayrollToClaim}
                    theme={theme}
                    onClaim={() => {
                      if (!weeklyPayrollToClaim) return;
                      const { weekKey, weekStart, weekEnd, totalReward, items } = weeklyPayrollToClaim;
                      setWeeklyPayroll(prev => {
                        const childPayroll = prev[activeChild] || {};
                        return {
                          ...prev,
                          [activeChild]: {
                            ...childPayroll,
                            [weekKey]: { weekStart, weekEnd, totalReward, items, claimed: true }
                          }
                        };
                      });
                      if ((totalReward || 0) > 0) {
                        const historyKey = `${activeChild}-WEEKLY_PAY-${weekStart}_${weekEnd}-${Date.now()}`;
                        setWheelHistory(prev => ({ ...prev, [historyKey]: totalReward }));
                        updateStats(activeChild, 'gold_earn', totalReward, { source: 'weekly_pay', dateKey: getLocalDateKey(0) });
                        confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 } });
                        showToast('success', `上周学习工资已到账：${totalReward} 金元宝！`, {duration: 3000});
                      }
                      setWeeklyPayrollToClaim(null);
                      setShowWeeklyPayrollModal(false);
                    }}
                  />

				  <TesterDashboard 
					activeChild={activeChild}
					currentXP={currentXP}
					setXpHistory={setXpHistory}
					setWheelHistory={setWheelHistory}
					checkAchievements={checkAchievements} // 注意：这里传递函数引用
					tasks={tasks}
					checkins={checkins}
					setCheckins={setCheckins}
					setShowRandomEvent={setShowRandomEvent}
					setCurrentRandomEvent={setCurrentRandomEvent}
					achievements={achievements}
					setInventory={setInventory}
					setAchievements={setAchievements}
					setMilestones={setMilestones}
					setNotifiedLevels={setNotifiedLevels}
					setActiveBuffs={setActiveBuffs}
                    setEquippedGear={setEquippedGear}
                    setStats={setStats}
					wheelHistory={wheelHistory} 
					setCurriculumProgress={setCurriculumProgress}
                    setRedeemedCoupons={setRedeemedCoupons}
                    setRandomEventHistory={setRandomEventHistory}
					setExemptedDays={setExemptedDays}
					setWeeklyPayroll={setWeeklyPayroll}
					setWeeklyPayrollToClaim={setWeeklyPayrollToClaim}
					setRepairedCheckins={setRepairedCheckins}
					setHomeworkRecords={setHomeworkRecords}
					setExamRecords={setExamRecords}
				setDailyRandomCounts={setDailyRandomCounts}
				setActiveSilenceMutes={setActiveSilenceMutes}
				setHistoricalEventProgress={setHistoricalEventProgress}
				setDailyEventTypeCounts={setDailyEventTypeCounts}
				setStarHistory={setStarHistory}
				setPetData={setPetData}
				setOwnedPets={setOwnedPets}
				setActivePet={setActivePet}
				setPetCooldowns={setPetCooldowns}
				setPetStats={setPetStats}
				setPetSkillCooldowns={setPetSkillCooldowns}
				setPetBuffs={setPetBuffs}
				setPetAdventures={setPetAdventures}
				setPetAdventureLog={setPetAdventureLog}
				setPetAdventureStats={setPetAdventureStats}
				updateStats={updateStats}
				hasEnvelopeButton={!!weeklyPayrollToClaim}
					hasMonthlySummaryButton={(() => { const d = new Date().getDate(); return d >= 1 && d <= 3; })()}
					onTestWeeklyPayroll={() => {
						const payroll = calculateWeeklyPayrollForChild(activeChild);
						const { weekStart, weekEnd } = getLastWeekRange();
						const weekKey = `${weekStart}_${weekEnd}`;
						if (!payroll) {
							// 无达标任务时也显示信封，方便测试：展示 0 元结算单
							setWeeklyPayrollToClaim({ weekKey, weekStart, weekEnd, totalReward: 0, items: [] });
							showToast('warning', '当前没有可结算的周学习工资。');
							return;
						}
						const { totalReward, items } = payroll;
						// 写入 weeklyPayroll 并点亮工资信封
						setWeeklyPayroll(prev => {
							const childPayroll = prev[activeChild] || {};
							return {
								...prev,
								[activeChild]: {
									...childPayroll,
									[weekKey]: {
										weekStart,
										weekEnd,
										totalReward,
										items,
										claimed: false
									}
								}
							};
						});
						setWeeklyPayrollToClaim({ weekKey, weekStart, weekEnd, totalReward, items });
						showToast('info', '已生成待领取记录，请查看信封按钮。');
					}}
				  />
				  
				  {/* 【新增】挂载进贡弹窗 */}
                  <TributeModal 
                      show={showTributeModal}
                      onClose={() => setShowTributeModal(false)}
                      activeChild={activeChild}
                      stats={stats}
                      setStats={setStats}
                      totalGold={totalGold}
                      setWheelHistory={setWheelHistory}
					  profiles={profiles}
                  />

				  {/* 【伴读书阁】天工书阁 · 伴读与藏书殿堂 */}
				  <ReadingPavilionModal
					  show={showReadingPavilion}
					  onClose={() => setShowReadingPavilion(false)}
					  readingTasks={activeReadingTasks}
					  readingHistory={readingHistory}
					  shelvedBooks={shelvedBooks}
					  onResumeShelvedBook={handleResumeShelvedBook}
					  activeChild={activeChild}
					  checkins={checkins}
					  todayStr={getLocalDateKey(0)}
					  onOpenQuickCheckin={(task) => {
						  setShowReadingPavilion(false);
						  setReadingTaskForCheckin(task);
						  setShowReadingQuickCheckin(true);
					  }}
					  onOpenSettingsToAddTask={() => {
						  setShowReadingPavilion(false);
						  setSettingsInitialTab('tasks');
						  setShowSettings(true);
					  }}
					  theme={theme}
				  />

				  {/* 【伴读书阁】极速伴读登记小窗 */}
				  <ReadingCheckinModal
					  show={showReadingQuickCheckin}
					  onClose={() => {
						  setShowReadingQuickCheckin(false);
						  setReadingTaskForCheckin(null);
					  }}
					  task={readingTaskForCheckin || activeReadingTasks[0]}
					  onSaveProgress={handleSaveReadingProgress}
					  onShelveBook={handleShelveBook}
					  onOpenPavilion={() => {
						  setShowReadingQuickCheckin(false);
						  setShowReadingPavilion(true);
					  }}
					  theme={theme}
				  />

				  {/* 【伴读书阁】全本读完通关换书与接力小窗 */}
				  <ReadingTransitionModal
					  show={readingTransitionModal.show}
					  onClose={() => setReadingTransitionModal({ show: false, data: null })}
					  data={readingTransitionModal.data}
					  onConfirmNextBook={handleSwitchNextBook}
					  theme={theme}
				  />

				  {/* 【元气生活坊】习惯养成全景殿堂 */}
				  <HabitPavilionModal
					  show={showHabitPavilion}
					  onClose={() => setShowHabitPavilion(false)}
					  habitTasks={activeHabitTasks}
					  activeChild={activeChild}
					  checkins={checkins}
					  todayStr={getLocalDateKey(0)}
					  onCheckin={handleHabitCheckin}
					  onAddPresetHabit={handleAddPresetHabit}
					  onOpenSettings={() => {
						  setShowHabitPavilion(false);
						  setSettingsInitialTab('tasks');
						  setShowSettings(true);
					  }}
				  />				  

				  {/* 【时空营造司】奇迹部件检视展厅 */}
				  <WonderShowcaseModal
					  isOpen={showWonderShowcase}
					  onClose={() => setShowWonderShowcase(false)}
				  />

                  <div className="fixed bottom-0 w-full bg-white/60 backdrop-blur-md border-t border-white/20 p-2 text-center text-[12px] text-Red-400 z-10">
                     张恒与&张又兮出品&nbsp; &nbsp; “不怕同学是学霸，就怕学霸放寒假“系列之2026年超强寒假学习打卡大计划 V2.8&nbsp; &nbsp; &nbsp; &nbsp; 灵感创意、产品小经理：张恒与&张又兮小朋友&nbsp; &nbsp; &nbsp; 大助理：爸爸&nbsp; &nbsp; &nbsp; Copyright ©2026&nbsp; 张恒与&张又兮（软件著作权注册中）&nbsp; &nbsp; &nbsp;  All right reserved.
                  </div>
                </div>
            );
        };

        // ===== Loading 页面控制逻辑已迁移至 src/utils/loadingScreen.js =====
        initLoadingScreen();

        // ===== 顶层错误边界已迁移至 src/components/common/AppErrorBoundary.jsx =====
        // ===== 性能模式 Provider 已迁移至 src/context/PerformanceContext.jsx =====

export default App;

initStorage().finally(() => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
        <AppErrorBoundary>
            <PerformanceProvider>
                <App />
                <ToastContainer />
            </PerformanceProvider>
        </AppErrorBoundary>
    );
});

