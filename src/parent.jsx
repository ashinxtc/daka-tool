import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// 云端同步端点
const SYNC_URL = 'https://sync.daka-tool.top';

// 辅助计算本地日期 key (YYYY-MM-DD)
const getLocalDateKey = (offsetDays = 0) => {
    const d = new Date();
    if (offsetDays !== 0) d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 常见境界等级换算（参考主程序 levels 估算）
const computeRealmInfo = (xp = 0) => {
    const realms = [
        { name: '炼气期', levels: 9, baseXp: 100 },
        { name: '筑基期', levels: 9, baseXp: 300 },
        { name: '结丹期', levels: 9, baseXp: 800 },
        { name: '元婴期', levels: 9, baseXp: 2000 },
        { name: '化神期', levels: 9, baseXp: 5000 },
    ];
    let remainingXp = Math.max(0, xp);
    for (let r = 0; r < realms.length; r++) {
        const realm = realms[r];
        for (let lvl = 1; lvl <= realm.levels; lvl++) {
            const cost = realm.baseXp * lvl;
            if (remainingXp < cost) {
                return {
                    realmName: realm.name,
                    levelNum: lvl,
                    fullName: `${realm.name} 第${lvl}层`,
                    currentXp: remainingXp,
                    neededXp: cost,
                    progressPercent: Math.min(100, Math.round((remainingXp / cost) * 100))
                };
            }
            remainingXp -= cost;
        }
    }
    return {
        realmName: '大乘圆满',
        levelNum: 9,
        fullName: '大乘圆满天尊',
        currentXp: remainingXp,
        neededXp: 99999,
        progressPercent: 100
    };
};

// 预设快捷评语与惩罚事由
const RED_PACKET_REASONS = [
    '期中/单元考试满分！',
    '今天主动分担家务！',
    '练琴非常专注自觉！',
    '按时高质完成作业！',
    '字迹工整获老师表扬！',
    '坚持早睡早起好习惯！'
];

const EXTRA_WHEEL_REASONS = [
    '古诗背诵一次通关',
    '口算天天练全对',
    '自觉阅读超过1小时',
    '体育打卡跑步跳绳达标',
    '本周核心大关全勤奖励'
];

const EVIL_WHEEL_REASONS = [
    '超时看电视或沉迷游戏',
    '作业磨蹭拖延到深夜',
    '顶撞长辈或与同伴争吵',
    '房间书桌杂乱不收拾',
    '未完成承诺的约定事项'
];

const ORACLE_PRESETS = [
    '宝贝今天真棒，继续保持！—— 爸妈为你骄傲',
    '专心致志，方能成大器！—— 加油！',
    '今晚带你吃大餐犒劳！—— 爸爸',
    '劳逸结合，多喝水注意眼睛！—— 妈妈',
    '每一份努力都在静待花开！'
];

export const ParentApp = () => {
    // --- 认证与设备绑定状态 ---
    const [syncCode, setSyncCode] = useState(() => localStorage.getItem('parent_sync_code') || '');
    const [deviceId, setDeviceId] = useState(() => {
        let id = localStorage.getItem('parent_device_id');
        if (!id) {
            id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
            localStorage.setItem('parent_device_id', id);
        }
        return id;
    });
    const [pairToken, setPairToken] = useState(() => localStorage.getItem('parent_pair_token') || '');
    const [operatorRole, setOperatorRole] = useState(() => localStorage.getItem('parent_role') || '爸爸');
    const [isBound, setIsBound] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const hashParams = window.location.hash ? new URLSearchParams(window.location.hash.replace(/^#/, '')) : null;
            const code = params.get('code') || params.get('syncCode') || hashParams?.get('code') || hashParams?.get('syncCode');
            if (code) return true;
            if (localStorage.getItem('parent_is_bound') === 'true' && localStorage.getItem('parent_sync_code')) return true;
        }
        return false;
    });

    // 手动绑定表单状态
    const [authMode, setAuthMode] = useState('scan'); // 'scan' | 'manual'
    const [inputSyncCode, setInputSyncCode] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [inputRole, setInputRole] = useState('爸爸');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    // --- 数据状态 ---
    const [cloudData, setCloudData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [activeChild, setActiveChild] = useState('');
    const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'reward' | 'wheel' | 'oracle' | 'activity'

    // --- 交互表单状态 ---
    const [toast, setToast] = useState({ show: false, type: 'info', message: '' });
    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: 'info', message: '' }), 3500);
    };

    // 红包表单
    const [redPacketAmount, setRedPacketAmount] = useState('100');
    const [redPacketReason, setRedPacketReason] = useState('今天主动分担家务！');
    const [isSubmittingPacket, setIsSubmittingPacket] = useState(false);

    // 转盘表单
    const [selectedWheelType, setSelectedWheelType] = useState('gold'); // 'gold' | 'xp'
    const [wheelReason, setWheelReason] = useState('本周核心大关全勤奖励');
    const [isSubmittingWheel, setIsSubmittingWheel] = useState(false);

    // 邪恶惩罚表单
    const [evilReason, setEvilReason] = useState('作业磨蹭拖延到深夜');
    const [showEvilConfirm, setShowEvilConfirm] = useState(false);
    const [isSubmittingEvil, setIsSubmittingEvil] = useState(false);

    // 甲骨传书表单
    const [oracleText, setOracleText] = useState('');
    const [isSubmittingOracle, setIsSubmittingOracle] = useState(false);

    // 设备信息抽屉
    const [showDeviceDrawer, setShowDeviceDrawer] = useState(false);

    // --- 1. 启动时解析 URL 参数（处理扫码一键绑定） ---
    useEffect(() => {
        try {
            const urlObj = new URL(window.location.href);
            let code = urlObj.searchParams.get('code') || urlObj.searchParams.get('syncCode');
            let token = urlObj.searchParams.get('token') || urlObj.searchParams.get('pairToken');
            let role = urlObj.searchParams.get('role');

            // 兼顾 hash 传参 (#code=xxx&token=yyy)
            if (!code && window.location.hash) {
                const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
                code = hashParams.get('code') || hashParams.get('syncCode');
                token = hashParams.get('token') || hashParams.get('pairToken');
                role = hashParams.get('role');
            }

            if (code) {
                const effectiveRole = role ? decodeURIComponent(role) : '爸爸';
                const effectiveToken = token ? decodeURIComponent(token) : '';

                localStorage.setItem('parent_sync_code', code);
                localStorage.setItem('parent_role', effectiveRole);
                if (effectiveToken) localStorage.setItem('parent_pair_token', effectiveToken);
                localStorage.setItem('parent_is_bound', 'true');

                setSyncCode(code);
                setOperatorRole(effectiveRole);
                if (effectiveToken) setPairToken(effectiveToken);
                setIsBound(true);

                // 立即触发拉取云端并配对
                loadCloudData(code, false, effectiveToken, effectiveRole);

                // 清理 URL 参数，保持地址栏干净安全
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (e) {
            console.error('URL parse failed:', e);
        }
    }, []);

    // --- 2. 拉取云端数据核心方法 ---
    const loadCloudData = async (codeToUse = syncCode, silent = false, tokenOverride = null, roleOverride = null) => {
        if (!codeToUse) return null;
        if (!silent) setIsLoading(true);
        try {
            const resp = await fetch(`${SYNC_URL}?code=${encodeURIComponent(codeToUse)}`);
            if (resp.status === 404) {
                console.warn('云端尚未上传该同步码数据，等待电脑主程序上传同步');
                setCloudData(null);
                setIsBound(true);
                localStorage.setItem('parent_is_bound', 'true');
                return null;
            }
            if (!resp.ok) {
                throw new Error(`云端服务响应异常 (${resp.status})`);
            }
            const data = await resp.json();
            setCloudData(data);
            setLastSyncTime(new Date());
            setIsBound(true);
            localStorage.setItem('parent_is_bound', 'true');

            // 检查当前设备是否已被登记授权
            const authConfigStr = data.app_authorized_parents_v1;
            let authConfig = { pairToken: '', devices: [] };
            if (authConfigStr) {
                try { authConfig = JSON.parse(authConfigStr); } catch (e) {}
            }

            const currentDevId = deviceId;
            const existingDev = (authConfig.devices || []).find(d => d.deviceId === currentDevId);

            const activeRole = roleOverride || operatorRole;
            if (existingDev) {
                setIsBound(true);
                // 同步本地角色为已注册角色
                if (existingDev.role && existingDev.role !== activeRole) {
                    setOperatorRole(existingDev.role);
                    localStorage.setItem('parent_role', existingDev.role);
                }
            } else {
                // 如果本地存有有效的 pairToken 且与云端相符，或者首次扫码进入，自动完成设备自登记
                const localToken = tokenOverride || pairToken || localStorage.getItem('parent_pair_token');
                if (localToken && authConfig.pairToken && localToken === authConfig.pairToken) {
                    await registerCurrentDevice(data, codeToUse, authConfig, currentDevId, activeRole);
                    setIsBound(true);
                } else if (!authConfig.pairToken && localToken) {
                    // 若云端尚无 pairToken，主程序与家长端初始化互认
                    await registerCurrentDevice(data, codeToUse, authConfig, currentDevId, activeRole);
                    setIsBound(true);
                } else {
                    // 仅当已有绑定设备列表且未匹配到当前设备时，标记未绑定
                    if (authConfig.devices && authConfig.devices.length > 0) {
                        setIsBound(false);
                    } else {
                        // 首次初始化自动绑定
                        await registerCurrentDevice(data, codeToUse, authConfig, currentDevId, activeRole);
                        setIsBound(true);
                    }
                }
            }

            // 初始化活跃孩子
            let profiles = [];
            try { profiles = JSON.parse(data.app_profiles_v1 || '[]'); } catch (e) {}
            if (profiles.length > 0 && !activeChild) {
                setActiveChild(profiles[0].name);
            }

            return data;
        } catch (err) {
            console.error('Fetch cloud data error:', err);
            if (!silent) showToast('error', err.message || '获取云端数据失败');
            return null;
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    // 辅助：向云端注册本设备信息
    const registerCurrentDevice = async (currentCloudData, code, authConfig, devId, roleToUse = operatorRole) => {
        try {
            const devName = navigator.userAgent.includes('iPhone') ? 'iPhone' :
                           navigator.userAgent.includes('Android') ? '安卓手机' : '移动手机设备';
            const newDevice = {
                deviceId: devId,
                role: roleToUse,
                deviceName: devName,
                boundAt: Date.now(),
                lastActive: Date.now()
            };
            const updatedDevices = [...(authConfig.devices || []).filter(d => d.deviceId !== devId), newDevice];
            const updatedAuthConfig = {
                pairToken: authConfig.pairToken || pairToken || 'token_' + Math.random().toString(36).slice(2, 10),
                devices: updatedDevices
            };

            const payload = {
                ...currentCloudData,
                app_authorized_parents_v1: JSON.stringify(updatedAuthConfig),
                _syncTs: Date.now()
            };

            await fetch(`${SYNC_URL}?code=${encodeURIComponent(code)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            setCloudData(payload);
            setIsBound(true);
        } catch (e) {
            console.warn('Auto register device warning:', e);
        }
    };

    // --- 3. 手动密码授权绑定 ---
    const handleManualAuth = async (e) => {
        e.preventDefault();
        setAuthError('');
        if (!inputSyncCode.trim()) {
            setAuthError('请输入家庭私密同步码！');
            return;
        }
        setAuthLoading(true);
        try {
            const resp = await fetch(`${SYNC_URL}?code=${encodeURIComponent(inputSyncCode.trim())}`);
            if (resp.status === 404) {
                throw new Error('未找到该同步码对应的数据，请核对是否与电脑主程序一致！');
            }
            if (!resp.ok) throw new Error('云端服务连接失败，请稍后重试');
            const data = await resp.json();

            // 校验家长密码
            const cloudPwd = data.app_settings_password;
            if (cloudPwd && cloudPwd.trim() !== '') {
                if (inputPassword !== cloudPwd) {
                    throw new Error('家长安全密码不正确！无法完成设备绑定。');
                }
            }

            // 验证通过，写入本地并注册设备
            localStorage.setItem('parent_sync_code', inputSyncCode.trim());
            localStorage.setItem('parent_role', inputRole);
            setSyncCode(inputSyncCode.trim());
            setOperatorRole(inputRole);

            let authConfig = { pairToken: '', devices: [] };
            try { authConfig = JSON.parse(data.app_authorized_parents_v1 || '{}'); } catch(e) {}
            await registerCurrentDevice(data, inputSyncCode.trim(), authConfig, deviceId);

            setCloudData(data);
            setIsBound(true);
            showToast('success', `🎉 绑定成功！欢迎【${inputRole}】进入护航看板`);
        } catch (err) {
            setAuthError(err.message || '绑定失败，请核对信息');
        } finally {
            setAuthLoading(false);
        }
    };

    // 初始化时加载数据
    useEffect(() => {
        if (syncCode) {
            loadCloudData(syncCode);
        }
    }, [syncCode]);

    // --- 4. 轻量云端轮询 (15s 查一次时间戳) ---
    useEffect(() => {
        if (!syncCode || !isBound) return;
        const interval = setInterval(async () => {
            try {
                const resp = await fetch(`${SYNC_URL}/ts?code=${encodeURIComponent(syncCode)}`);
                if (resp.ok) {
                    const { ts } = await resp.json();
                    const currentTs = cloudData?._syncTs || 0;
                    if (ts && ts > currentTs) {
                        loadCloudData(syncCode, true);
                    }
                }
            } catch (e) {}
        }, 15000);
        return () => clearInterval(interval);
    }, [syncCode, isBound, cloudData]);

    // --- 5. 解析业务数据 ---
    const profiles = useMemo(() => {
        if (!cloudData?.app_profiles_v1) return [{ name: '宝贝', icon: '👦' }];
        try {
            const arr = JSON.parse(cloudData.app_profiles_v1);
            return Array.isArray(arr) && arr.length > 0 ? arr : [{ name: '宝贝', icon: '👦' }];
        } catch (e) {
            return [{ name: '宝贝', icon: '👦' }];
        }
    }, [cloudData]);

    // 保证选中的孩子有效
    useEffect(() => {
        if (profiles.length > 0 && (!activeChild || !profiles.some(p => p.name === activeChild))) {
            setActiveChild(profiles[0].name);
        }
    }, [profiles, activeChild]);

    const activeProfile = profiles.find(p => p.name === activeChild) || profiles[0];

    const tasks = useMemo(() => {
        if (!cloudData?.app_tasks_v2) return [];
        try {
            return JSON.parse(cloudData.app_tasks_v2) || [];
        } catch (e) {
            return [];
        }
    }, [cloudData]);

    const checkins = useMemo(() => {
        if (!cloudData?.app_checkins_v2) return {};
        try {
            return JSON.parse(cloudData.app_checkins_v2) || {};
        } catch (e) {
            return {};
        }
    }, [cloudData]);

    // 计算当前孩子的财富与经验
    const { goldBalance, totalXp, starCount } = useMemo(() => {
        if (!cloudData || !activeChild) return { goldBalance: 0, totalXp: 0, starCount: 0 };
        let gold = 0;
        let xp = 0;
        let stars = 0;

        try {
            const wh = JSON.parse(cloudData.app_wheel_history || '{}');
            Object.entries(wh).forEach(([k, v]) => {
                if (k.startsWith(`${activeChild}-`)) gold += (typeof v === 'number' ? v : 0);
            });
        } catch (e) {}

        try {
            const xph = JSON.parse(cloudData.app_xp_history || '{}');
            Object.entries(xph).forEach(([k, v]) => {
                if (k.startsWith(`${activeChild}-`)) xp += (typeof v === 'number' ? v : 0);
            });
        } catch (e) {}

        try {
            const starData = JSON.parse(cloudData.app_stars_v1 || '{}');
            stars = starData[activeChild] || 0;
        } catch (e) {}

        return { goldBalance: Math.max(0, gold), totalXp: Math.max(0, xp), starCount: stars };
    }, [cloudData, activeChild]);

    const realmInfo = useMemo(() => computeRealmInfo(totalXp), [totalXp]);

    // 计算今日打卡进度
    const todayDateKey = getLocalDateKey(0);
    const { todayCoreTasks, todayRoutineTasks, todayDoneCount, todayTotalCount } = useMemo(() => {
        const childCheckins = checkins[activeChild] || {};
        const childTasks = tasks.filter(t => !t.assignedTo || t.assignedTo === activeChild);

        const core = [];
        const routine = [];
        let done = 0;

        childTasks.forEach(task => {
            const isCompleted = !!childCheckins[task.id]?.[todayDateKey];
            const checkinVal = childCheckins[task.id]?.[todayDateKey];
            const item = { ...task, isCompleted, checkinVal };

            if (task.isCore || task.type === 'core') {
                core.push(item);
            } else {
                routine.push(item);
            }
            if (isCompleted) done++;
        });

        return {
            todayCoreTasks: core,
            todayRoutineTasks: routine,
            todayDoneCount: done,
            todayTotalCount: childTasks.length
        };
    }, [tasks, checkins, activeChild, todayDateKey]);

    const completionRate = todayTotalCount > 0 ? Math.round((todayDoneCount / todayTotalCount) * 100) : 0;

    // 解析甲骨传书列表
    const oracleMessages = useMemo(() => {
        if (!cloudData?.app_global_messages_v2) return [];
        try {
            const list = JSON.parse(cloudData.app_global_messages_v2) || [];
            return list.filter(m => (m.expire || 0) > Date.now()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        } catch (e) {
            return [];
        }
    }, [cloudData]);

    // 解析家长历史操作列表
    const parentActions = useMemo(() => {
        if (!cloudData?.app_parent_actions_v1) return [];
        try {
            const list = JSON.parse(cloudData.app_parent_actions_v1) || [];
            return list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        } catch (e) {
            return [];
        }
    }, [cloudData]);

    // --- 6. 核心操作提交助手 ---
    const updateCloudKeys = async (updates) => {
        if (!syncCode) return false;
        try {
            // 先拉取最新以防覆盖
            const resp = await fetch(`${SYNC_URL}?code=${encodeURIComponent(syncCode)}`);
            const latest = resp.ok ? await resp.json() : (cloudData || {});

            const newPayload = {
                ...latest,
                ...updates,
                _syncTs: Date.now()
            };

            const postResp = await fetch(`${SYNC_URL}?code=${encodeURIComponent(syncCode)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPayload)
            });

            if (!postResp.ok) throw new Error(`云端保存失败 (${postResp.status})`);
            setCloudData(newPayload);
            setLastSyncTime(new Date());
            return true;
        } catch (err) {
            console.error('Update cloud keys error:', err);
            showToast('error', err.message || '上传指令到云端失败');
            return false;
        }
    };

    // 操作 1：发红包 (赐福进贡)
    const handleSendRedPacket = async () => {
        const amount = parseInt(redPacketAmount, 10);
        if (isNaN(amount) || amount <= 0) {
            showToast('warning', '请输入有效的红包金元宝数量！');
            return;
        }
        setIsSubmittingPacket(true);
        try {
            const newAction = {
                id: `act_rp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                type: 'red_packet',
                targetChild: activeChild,
                operatorRole,
                operatorDeviceId: deviceId,
                amount,
                reason: redPacketReason.trim(),
                timestamp: Date.now(),
                status: 'pending'
            };

            const currentActions = parentActions;
            const updatedActions = [newAction, ...currentActions].slice(0, 100);

            const ok = await updateCloudKeys({
                app_parent_actions_v1: JSON.stringify(updatedActions)
            });

            if (ok) {
                showToast('success', `🧧 已向【${activeChild}】封赏 ${amount} 金元宝红包！`);
                setRedPacketReason('');
            }
        } finally {
            setIsSubmittingPacket(false);
        }
    };

    // 操作 2：奖励额外转盘
    const handleRewardWheel = async () => {
        setIsSubmittingWheel(true);
        try {
            const wheelName = selectedWheelType === 'xp' ? '经验XP转盘' : '金元宝转盘';
            const newAction = {
                id: `act_wh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                type: 'extra_wheel',
                wheelType: selectedWheelType,
                count: 1,
                targetChild: activeChild,
                operatorRole,
                operatorDeviceId: deviceId,
                reason: wheelReason.trim(),
                timestamp: Date.now(),
                status: 'pending'
            };

            const currentActions = parentActions;
            const updatedActions = [newAction, ...currentActions].slice(0, 100);

            const ok = await updateCloudKeys({
                app_parent_actions_v1: JSON.stringify(updatedActions)
            });

            if (ok) {
                showToast('success', `🎁 已成功赏赐【${activeChild}】一次【${wheelName}】！`);
            }
        } finally {
            setIsSubmittingWheel(false);
        }
    };

    // 操作 3：下达戒律惩罚 (邪恶转盘)
    const handleExecuteEvil = async () => {
        setIsSubmittingEvil(true);
        try {
            const newAction = {
                id: `act_ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                type: 'evil_wheel',
                targetChild: activeChild,
                operatorRole,
                operatorDeviceId: deviceId,
                reason: evilReason.trim(),
                timestamp: Date.now(),
                status: 'pending'
            };

            const currentActions = parentActions;
            const updatedActions = [newAction, ...currentActions].slice(0, 100);

            const ok = await updateCloudKeys({
                app_parent_actions_v1: JSON.stringify(updatedActions)
            });

            if (ok) {
                showToast('error', `🚨 已对【${activeChild}】下达邪恶惩戒敕令！`);
                setShowEvilConfirm(false);
            }
        } finally {
            setIsSubmittingEvil(false);
        }
    };

    // 操作 4：甲骨传书留言
    const handleCarveOracle = async () => {
        if (!oracleText.trim()) {
            showToast('warning', '请输入要铭刻的寄语内容！');
            return;
        }
        setIsSubmittingOracle(true);
        try {
            const cleanText = oracleText.trim().slice(0, 32);
            const newMsg = {
                id: Date.now(),
                text: cleanText,
                author: operatorRole,
                isParent: true,
                parentRole: operatorRole,
                expire: Date.now() + 24 * 60 * 60 * 1000,
                timestamp: Date.now(),
                blessings: 0,
                blessedBy: {}
            };

            const currentList = oracleMessages;
            const updatedList = [newMsg, ...currentList].slice(0, 50);

            const ok = await updateCloudKeys({
                app_global_messages_v2: JSON.stringify(updatedList)
            });

            if (ok) {
                showToast('success', '🪶 寄语铭刻成功！已在主程序甲骨大厅置顶展示。');
                setOracleText('');
            }
        } finally {
            setIsSubmittingOracle(false);
        }
    };

    // --- 7. 未绑定或未登录视图 ---
    if (!syncCode || !isBound) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
                <div className="w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/80">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-indigo-600/20 border border-indigo-400/40 flex items-center justify-center text-3xl shadow-inner shadow-indigo-500/40">
                            🛡️
                        </div>
                        <h1 className="text-xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-indigo-200 bg-clip-text text-transparent">
                            时空市集 · 家长护航台
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">专属手机督学看板 · 赏罚互动与打卡护航</p>
                    </div>

                    {/* 切换授权模式标签 */}
                    <div className="grid grid-cols-2 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60 mb-5">
                        <button
                            type="button"
                            onClick={() => setAuthMode('scan')}
                            className={`py-2 text-xs font-bold rounded-xl transition-all ${authMode === 'scan' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            📷 扫码一键绑定
                        </button>
                        <button
                            type="button"
                            onClick={() => setAuthMode('manual')}
                            className={`py-2 text-xs font-bold rounded-xl transition-all ${authMode === 'manual' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            🔑 手动输入密码
                        </button>
                    </div>

                    {authMode === 'scan' ? (
                        <div className="space-y-4 text-center py-2">
                            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 text-left space-y-3">
                                <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                                    <span>💡</span> 极简扫码绑定步骤：
                                </h3>
                                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                                    <li>在电脑/平板打开<b>时空市集主程序</b>。</li>
                                    <li>进入<b>【设置】→【家长防沉迷与安全】</b>。</li>
                                    <li>在“家长手机看板”中点击<b>【扫码绑定新手机】</b>。</li>
                                    <li>选择您的身份（爸爸/妈妈），使用手机相机或微信<b>扫一扫</b>屏幕二维码即可秒通！</li>
                                </ol>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                扫码后将自动完成硬件密钥配对与身份烙印，无需重复登录。
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleManualAuth} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">家庭同步码 (Sync Code)</label>
                                <input
                                    type="text"
                                    value={inputSyncCode}
                                    onChange={e => setInputSyncCode(e.target.value)}
                                    placeholder="如: 小明成长记2025"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">家长安全密码 (主程序防沉迷密码)</label>
                                <input
                                    type="password"
                                    value={inputPassword}
                                    onChange={e => setInputPassword(e.target.value)}
                                    placeholder="主程序设置里的家长密码 (若未设可留空)"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">选择当前手机归属身份</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['爸爸', '妈妈', '长辈'].map(role => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setInputRole(role)}
                                            className={`py-2 text-xs font-bold rounded-xl border transition-all ${inputRole === role ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                                        >
                                            {role === '爸爸' ? '👑 爸爸' : role === '妈妈' ? '🌸 妈妈' : '👴 长辈'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {authError && (
                                <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                                    <span>⚠️</span> <span>{authError}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={authLoading}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                            >
                                {authLoading ? '⏳ 正在连接云端验证中...' : '🔗 确认授权并绑定本设备'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    // --- 8. 主看板已绑定视图 ---
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24">
            {/* 顶部状态栏与身份指示 */}
            <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setShowDeviceDrawer(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/25 transition-colors text-xs font-bold"
                        title="查看当前设备与身份设置"
                    >
                        <span>{operatorRole === '爸爸' ? '👑' : operatorRole === '妈妈' ? '🌸' : '👴'}</span>
                        <span>{operatorRole}的护航手机</span>
                        <span className="text-[10px] text-indigo-400">▾</span>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => loadCloudData(syncCode)}
                        disabled={isLoading}
                        className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl border border-slate-700/80 active:scale-95 transition-all text-xs flex items-center gap-1"
                        title="刷新数据"
                    >
                        <span className={`inline-block ${isLoading ? 'animate-spin' : ''}`}>🔄</span>
                        <span className="text-[10px] hidden sm:inline">刷新</span>
                    </button>
                </div>
            </header>

            {/* 孩子切换水平滚动栏 */}
            {profiles.length > 1 && (
                <div className="bg-slate-900/50 border-b border-slate-800/60 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <span className="text-[11px] text-slate-400 shrink-0">当前孩子：</span>
                    {profiles.map(p => (
                        <button
                            key={p.name}
                            type="button"
                            onClick={() => setActiveChild(p.name)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${activeChild === p.name ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                        >
                            <span>{p.icon || '👦'}</span>
                            <span>{p.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* 孩子修为与今日修行看板卡片 */}
            <main className="p-4 space-y-4 max-w-lg mx-auto w-full">
                {/* 核心状态总览卡 */}
                <section className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner">
                                {activeProfile.icon || '👦'}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base font-black text-white">{activeChild}</h2>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold">
                                        {realmInfo.fullName}
                                    </span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                                    <span>今日完成度：<b className="text-amber-400">{todayDoneCount}</b> / {todayTotalCount} 项</span>
                                </div>
                            </div>
                        </div>

                        {/* 圆环进度指示 */}
                        <div className="flex flex-col items-center">
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <svg className="w-12 h-12 transform -rotate-90">
                                    <circle cx="24" cy="24" r="19" stroke="currentColor" strokeWidth="4" className="text-slate-800" fill="transparent" />
                                    <circle
                                        cx="24" cy="24" r="19" stroke="currentColor" strokeWidth="4"
                                        strokeDasharray={119}
                                        strokeDashoffset={119 - (119 * completionRate) / 100}
                                        className="text-amber-400 transition-all duration-700"
                                        strokeLinecap="round"
                                        fill="transparent"
                                    />
                                </svg>
                                <span className="absolute text-[11px] font-black text-amber-300">{completionRate}%</span>
                            </div>
                        </div>
                    </div>

                    {/* 财富、经验、星星数据统计条 */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-center">
                        <div>
                            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                                <span>💰</span> 金元宝
                            </div>
                            <div className="text-sm font-black text-amber-400 mt-0.5">{goldBalance}</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                                <span>⚡</span> 修仙经验
                            </div>
                            <div className="text-sm font-black text-indigo-300 mt-0.5">{totalXp}</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                                <span>⭐</span> 荣耀星
                            </div>
                            <div className="text-sm font-black text-yellow-300 mt-0.5">{starCount}</div>
                        </div>
                    </div>
                </section>

                {/* 分页内容渲染 */}
                {activeTab === 'tasks' && (
                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                <span>📅</span> 今日打卡清单 ({todayDateKey})
                            </h3>
                            <span className="text-[11px] text-slate-400">
                                {todayDoneCount === todayTotalCount && todayTotalCount > 0 ? '🎉 今日大满贯已达成！' : `还剩 ${todayTotalCount - todayDoneCount} 项未打卡`}
                            </span>
                        </div>

                        {/* 宗门核心大关 */}
                        {todayCoreTasks.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                                    <span>🔴</span> 宗门核心大关（必打卡）
                                </div>
                                {todayCoreTasks.map(t => (
                                    <div
                                        key={t.id}
                                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${t.isCompleted ? 'bg-slate-900/60 border-emerald-500/30' : 'bg-red-950/30 border-red-500/40 shadow-xs shadow-red-950/50'}`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="text-xl shrink-0">{t.icon || '📌'}</span>
                                            <div className="min-w-0">
                                                <div className={`text-xs font-bold truncate ${t.isCompleted ? 'text-slate-300 line-through opacity-75' : 'text-slate-100'}`}>
                                                    {t.title}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                                                    <span>+{t.reward || 0}元宝</span>
                                                    <span>+{t.xpReward || 0}XP</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            {t.isCompleted ? (
                                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                                                    <span>✅</span> 已完成
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/40 animate-pulse">
                                                    ⏳ 待督促
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 日常修行事务 */}
                        {todayRoutineTasks.length > 0 && (
                            <div className="space-y-2 pt-2">
                                <div className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                                    <span>🔵</span> 日常修行仙务
                                </div>
                                {todayRoutineTasks.map(t => (
                                    <div
                                        key={t.id}
                                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${t.isCompleted ? 'bg-slate-900/50 border-emerald-500/20 opacity-75' : 'bg-slate-900 border-slate-800'}`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="text-lg shrink-0">{t.icon || '📝'}</span>
                                            <div className="min-w-0">
                                                <div className={`text-xs font-bold truncate ${t.isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                                    {t.title}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                    +{t.reward || 0}元宝 / +{t.xpReward || 0}XP
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            {t.isCompleted ? (
                                                <span className="text-emerald-400 text-xs font-bold">✅ 已打卡</span>
                                            ) : (
                                                <span className="text-slate-500 text-xs font-medium">未完成</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(!cloudData || (todayCoreTasks.length === 0 && todayRoutineTasks.length === 0)) && (
                            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 text-center space-y-2 mt-2">
                                <div className="text-2xl inline-block">☁️</div>
                                <div className="text-xs font-bold text-amber-300">
                                    {isLoading ? '正在拉取云端打卡数据...' : '云端暂未获取到打卡清单'}
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    已成功绑定【{operatorRole}的护航手机】！若电脑刚打开，请在电脑主程序中点击【保存并退出】以将孩子数据同步上云，然后点击右上角 🔄 刷新。
                                </p>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'reward' && (
                    <section className="bg-slate-900 rounded-3xl border border-amber-500/30 p-5 space-y-4 shadow-xl">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl">
                                🧧
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-amber-300">皇室赏赐 · 金元宝红包</h3>
                                <p className="text-[11px] text-slate-400">以【{operatorRole}】名义向孩子派送红包，主程序同步后将全屏撒花庆祝！</p>
                            </div>
                        </div>

                        {/* 快捷金额选择 */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2">赐予金元宝数量</label>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {['50', '100', '200', '500'].map(amt => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => setRedPacketAmount(amt)}
                                        className={`py-2 rounded-xl text-xs font-black border transition-all ${redPacketAmount === amt ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md shadow-amber-500/30' : 'bg-slate-800 text-amber-200 border-slate-700 hover:bg-slate-700'}`}
                                    >
                                        +{amt} 元宝
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                                <span className="text-xs text-slate-400 shrink-0">自定义金额:</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="50000"
                                    value={redPacketAmount}
                                    onChange={e => setRedPacketAmount(e.target.value)}
                                    className="w-full bg-transparent text-sm font-bold text-amber-300 outline-none"
                                />
                                <span className="text-xs text-amber-400 shrink-0">元宝</span>
                            </div>
                        </div>

                        {/* 激励寄语 */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2">鼓励寄语或封赏事由</label>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {RED_PACKET_REASONS.map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRedPacketReason(r)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${redPacketReason === r ? 'bg-indigo-600/60 border-indigo-400 text-white' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                maxLength={40}
                                value={redPacketReason}
                                onChange={e => setRedPacketReason(e.target.value)}
                                placeholder="如: 今天表现格外专注，继续加油！"
                                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-400"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleSendRedPacket}
                            disabled={isSubmittingPacket}
                            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                        >
                            {isSubmittingPacket ? '⏳ 正在赐福中...' : `🧧 赐予【${activeChild}】${redPacketAmount} 金元宝红包`}
                        </button>
                    </section>
                )}

                {activeTab === 'wheel' && (
                    <div className="space-y-4">
                        {/* 仙缘转盘赏赐卡片 */}
                        <section className="bg-slate-900 rounded-3xl border border-indigo-500/30 p-5 space-y-4 shadow-xl">
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-2xl">
                                    🎡
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-indigo-300">仙缘嘉奖 · 额外转盘机会</h3>
                                    <p className="text-[11px] text-slate-400">奖励孩子一次幸运大转盘机会，主程序将自动唤醒抽奖！</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setSelectedWheelType('gold')}
                                    className={`p-3.5 rounded-2xl border text-left transition-all ${selectedWheelType === 'gold' ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}
                                >
                                    <div className="text-2xl mb-1">🌟</div>
                                    <div className="text-xs font-black">金元宝大转盘</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">有机会抽取海量元宝</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedWheelType('xp')}
                                    className={`p-3.5 rounded-2xl border text-left transition-all ${selectedWheelType === 'xp' ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 shadow-md shadow-indigo-500/20' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}
                                >
                                    <div className="text-2xl mb-1">⚡</div>
                                    <div className="text-xs font-black">经验XP大转盘</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">助力飞速突破境界</div>
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1.5">奖励事由</label>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {EXTRA_WHEEL_REASONS.map(r => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setWheelReason(r)}
                                            className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${wheelReason === r ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={wheelReason}
                                    onChange={e => setWheelReason(e.target.value)}
                                    placeholder="输入奖励理由"
                                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleRewardWheel}
                                disabled={isSubmittingWheel}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
                            >
                                {isSubmittingWheel ? '⏳ 正在派发中...' : `🎁 赐予【${activeChild}】1次额外${selectedWheelType === 'xp' ? 'XP' : '金'}转盘`}
                            </button>
                        </section>

                        {/* 戒律惩戒卡片 */}
                        <section className="bg-slate-900 rounded-3xl border border-red-500/40 p-5 space-y-4 shadow-xl">
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                                <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-2xl">
                                    💀
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-red-400">戒律惩处 · 邪恶转盘</h3>
                                    <p className="text-[11px] text-slate-400">对严重违规或拖延进行警戒，主程序将强制触发全屏惩罚！</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1.5">违规事由</label>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {EVIL_WHEEL_REASONS.map(r => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setEvilReason(r)}
                                            className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${evilReason === r ? 'bg-red-950/80 border-red-500 text-red-200' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={evilReason}
                                    onChange={e => setEvilReason(e.target.value)}
                                    placeholder="输入惩戒理由"
                                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowEvilConfirm(true)}
                                className="w-full py-3 bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-98"
                            >
                                <span>🚨</span> 下达惩戒敕令 (触发邪恶转盘)
                            </button>
                        </section>
                    </div>
                )}

                {activeTab === 'oracle' && (
                    <section className="bg-slate-900 rounded-3xl border border-amber-500/30 p-5 space-y-4 shadow-xl">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl">
                                🪶
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-amber-300">甲骨传书 · 慈亲寄语</h3>
                                <p className="text-[11px] text-slate-400">免消耗游戏道具，家长拥有无限留言特权，流传 24 小时！</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2">选择或输入寄语 (30字以内)</label>
                            <div className="space-y-1.5 mb-2.5">
                                {ORACLE_PRESETS.map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setOracleText(p)}
                                        className="w-full text-left p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-300 hover:bg-slate-800 transition-colors truncate"
                                    >
                                        💬 {p}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                rows={3}
                                maxLength={32}
                                value={oracleText}
                                onChange={e => setOracleText(e.target.value)}
                                placeholder="输入您对孩子的鼓励或提醒..."
                                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-amber-400"
                            />
                            <div className="text-right text-[10px] text-slate-500 mt-1">
                                {oracleText.length} / 32 字
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleCarveOracle}
                            disabled={isSubmittingOracle}
                            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
                        >
                            {isSubmittingOracle ? '⏳ 正在刻录中...' : `🪶 以【${operatorRole}】名义刻录并奉上展台`}
                        </button>

                        {/* 当前活跃传书一览 */}
                        <div className="pt-2 border-t border-slate-800 space-y-2">
                            <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                                <span>📜 当前展台流转中的卜辞 ({oracleMessages.length} 卷)</span>
                            </div>
                            {oracleMessages.length === 0 ? (
                                <div className="text-center py-4 text-xs text-slate-500">
                                    展台暂无流传卜辞，快刻下您的第一卷寄语吧！
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                                    {oracleMessages.map(msg => (
                                        <div key={msg.id} className="p-2.5 rounded-xl bg-slate-950/50 border border-amber-900/30 flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-amber-200 truncate">
                                                    {msg.text}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                    作者: <b className="text-amber-400">{msg.author}</b> · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            {msg.isParent && (
                                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 shrink-0">
                                                    👑 慈亲
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'activity' && (
                    <section className="bg-slate-900 rounded-3xl border border-slate-800 p-5 space-y-3 shadow-xl">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <h3 className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                                <span>📜</span> 家长赏罚与指令足迹
                            </h3>
                            <span className="text-[10px] text-slate-500">最近 20 条记录</span>
                        </div>

                        {parentActions.length === 0 ? (
                            <div className="text-center py-8 text-xs text-slate-500">
                                暂无操作记录，快去发个红包或转盘奖励吧！
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
                                {parentActions.map(act => (
                                    <div key={act.id} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="text-xl shrink-0">
                                                {act.type === 'red_packet' ? '🧧' : act.type === 'extra_wheel' ? '🎡' : '💀'}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-slate-200 truncate">
                                                    【{act.operatorRole}】
                                                    {act.type === 'red_packet' ? `赐予 ${act.amount} 金元宝红包` :
                                                     act.type === 'extra_wheel' ? `奖励 ${act.wheelType === 'xp' ? 'XP' : '金'}转盘 x1` :
                                                     `发起邪恶转盘惩罚`}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                                                    对象: {act.targetChild || '孩子'} · {act.reason || '无理由'} · {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            {act.status === 'claimed' ? (
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                                    已接收入账 ✅
                                                </span>
                                            ) : act.status === 'rejected_unauthorized' ? (
                                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                                                    未授权拦截 ⛔
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 animate-pulse">
                                                    待主程序同步 ⏳
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>

            {/* 邪恶转盘二次确认弹窗 */}
            {showEvilConfirm && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border-2 border-red-500/60 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-3xl">
                            🚨
                        </div>
                        <h3 className="text-base font-black text-red-400">严肃警示：确认下达邪恶惩罚？</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            您将以【<b>{operatorRole}</b>】的身份对【<b>{activeChild}</b>】施加惩戒！<br />
                            事由：<span className="text-red-300 font-bold">{evilReason}</span><br />
                            主程序在下一次同步时将强制弹出全屏血色骷髅转盘，不可绕过！
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowEvilConfirm(false)}
                                className="py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                            >
                                我再想想
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteEvil}
                                disabled={isSubmittingEvil}
                                className="py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 shadow-md shadow-red-600/40"
                            >
                                {isSubmittingEvil ? '⏳ 下达中...' : '确认执行惩罚'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 设备与身份抽屉 */}
            {showDeviceDrawer && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-slate-900 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                <span>📱</span> 当前手机绑定信息
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowDeviceDrawer(false)}
                                className="text-slate-400 hover:text-white p-1"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                                <div className="text-slate-400">设备标识 (Device ID):</div>
                                <div className="font-mono text-indigo-300 break-all">{deviceId}</div>
                            </div>
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                                <div className="text-slate-400">家庭同步码 (Sync Code):</div>
                                <div className="font-mono text-amber-300">{syncCode}</div>
                            </div>
                        </div>

                        {/* 切换身份 */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1.5">切换身份角色</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['爸爸', '妈妈', '长辈'].map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => {
                                            setOperatorRole(r);
                                            localStorage.setItem('parent_role', r);
                                            showToast('info', `已切换身份为【${r}】`);
                                        }}
                                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${operatorRole === r ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                                    >
                                        {r === '爸爸' ? '👑 爸爸' : r === '妈妈' ? '🌸 妈妈' : '👴 长辈'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm('确定要解除本手机的绑定吗？解除后需重新扫码或输入密码登录。')) {
                                    localStorage.removeItem('parent_sync_code');
                                    localStorage.removeItem('parent_pair_token');
                                    localStorage.removeItem('parent_is_bound');
                                    setSyncCode('');
                                    setIsBound(false);
                                    setShowDeviceDrawer(false);
                                }
                            }}
                            className="w-full py-2.5 bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold rounded-xl hover:bg-red-900/60"
                        >
                            解除本设备绑定并退出
                        </button>
                    </div>
                </div>
            )}

            {/* 底部导航栏 */}
            <nav className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40 max-w-lg mx-auto">
                <div className="grid grid-cols-5 py-2">
                    <button
                        type="button"
                        data-tab="tasks"
                        onClick={() => setActiveTab('tasks')}
                        className={`flex flex-col items-center gap-1 py-1 transition-colors ${activeTab === 'tasks' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <span className="text-base">📋</span>
                        <span className="text-[10px]">今日打卡</span>
                    </button>
                    <button
                        type="button"
                        data-tab="reward"
                        onClick={() => setActiveTab('reward')}
                        className={`flex flex-col items-center gap-1 py-1 transition-colors ${activeTab === 'reward' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <span className="text-base">🧧</span>
                        <span className="text-[10px]">发红包</span>
                    </button>
                    <button
                        type="button"
                        data-tab="wheel"
                        onClick={() => setActiveTab('wheel')}
                        className={`flex flex-col items-center gap-1 py-1 transition-colors ${activeTab === 'wheel' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <span className="text-base">🎡</span>
                        <span className="text-[10px]">赏罚殿</span>
                    </button>
                    <button
                        type="button"
                        data-tab="oracle"
                        onClick={() => setActiveTab('oracle')}
                        className={`flex flex-col items-center gap-1 py-1 transition-colors ${activeTab === 'oracle' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <span className="text-base">🪶</span>
                        <span className="text-[10px]">甲骨留言</span>
                    </button>
                    <button
                        type="button"
                        data-tab="activity"
                        onClick={() => setActiveTab('activity')}
                        className={`flex flex-col items-center gap-1 py-1 transition-colors ${activeTab === 'activity' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <span className="text-base">📜</span>
                        <span className="text-[10px]">足迹</span>
                    </button>
                </div>
            </nav>

            {/* 统一轻量级 Toast 提示 */}
            {toast.show && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold border backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200 max-w-xs text-center ${toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' : toast.type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-200' : toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/50 text-amber-200' : 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200'}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

// 挂载 React 根节点
const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<ParentApp />);
}
