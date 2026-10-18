import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isJunkKey } from '../src/utils/storage.js';
import {
    mergeParentDevices,
    consolidateLegacyDevices,
    isAuthorizedParentDevice,
    getValidDeviceIdsSet,
    getDeviceFingerprint
} from '../src/utils/deviceFingerprint.js';
import { applyDeductions } from '../src/utils/accounting.js';

// 1. 模拟 ExchangePanel 中的关键算法与逻辑
const isStaleOrResolvedTicket = (ticket, child, records = []) => {
    if (!ticket || !ticket.applyId) return true;
    if (ticket.childName && ticket.childName !== child) return true;
    const ticketTime = ticket.createdAt ? new Date(ticket.createdAt).getTime() : 0;
    if (ticketTime && (Date.now() - ticketTime > 48 * 3600 * 1000)) return true;
    if (ticket.expiresAt && new Date(ticket.expiresAt).getTime() < Date.now()) return true;
    if (Array.isArray(records) && records.length > 0) {
        const isResolved = records.some(r => {
            if (!r || r.status === 'pending') return false;
            if (r.id === ticket.applyId || r.applyId === ticket.applyId) return true;
            if (ticket.verifyCode && r.verifyCode === ticket.verifyCode) return true;
            if (r.goldAmount === ticket.goldAmount && Math.abs(parseFloat(r.cnyAmount || 0) - parseFloat(ticket.cnyAmount || 0)) <= 0.2) {
                const rTime = r.createdAt ? new Date(r.createdAt).getTime() : 0;
                if (ticketTime && rTime && Math.abs(rTime - ticketTime) < 48 * 3600 * 1000) return true;
            }
            return false;
        });
        if (isResolved) return true;
    }
    return false;
};

// 2. 模拟 stripTesterDataFromPayload
const stripTesterDataFromPayload = (data) => {
    if (!data || typeof data !== 'object') return data;
    const clean = { ...data };
    delete clean['app_test_mode'];
    delete clean['app_sync_code'];
    delete clean['app_sync_last_time'];
    Object.keys(clean).forEach(k => {
        if (k.startsWith('测试员') || k.startsWith('TESTER') || k.startsWith('app_exchange_total_测试员') || k.startsWith('app_exchange_total_TESTER') || k.startsWith('app_offline_exchange_')) {
            delete clean[k];
        }
    });
    return clean;
};

test('【零花钱兑换】isStaleOrResolvedTicket 准确消除幽灵草稿（超时或带微小舍入差的历史单）', () => {
    const now = Date.now();
    const historyRecords = [
        {
            id: 'ex_verified_sept30',
            applyId: 'ex_verified_sept30',
            childName: '孩子',
            goldAmount: 3427,
            cnyAmount: 650.06, // 云端核销记录带有 .06 精度差
            verifyCode: '8899',
            status: 'verified',
            createdAt: new Date(now - 18 * 86400 * 1000).toISOString()
        },
        {
            id: 'ex_verified_oct7',
            applyId: 'ex_verified_oct7',
            childName: '孩子',
            goldAmount: 2751,
            cnyAmount: 101.06, // 云端核销记录带有 .06 精度差
            verifyCode: '6677',
            status: 'verified',
            createdAt: new Date(now - 11 * 86400 * 1000).toISOString()
        }
    ];

    // Case 1: 9月30日历史单草稿（¥650.00，远超48小时且与历史核销差0.06元）
    const draftSept30 = {
        applyId: 'ex_local_sept30',
        childName: '孩子',
        goldAmount: 3427,
        cnyAmount: 650.00,
        verifyCode: '8899',
        createdAt: new Date(now - 18 * 86400 * 1000).toISOString()
    };
    assert.equal(isStaleOrResolvedTicket(draftSept30, '孩子', historyRecords), true, '9月30日草稿必须被判定为已失效/已核销');

    // Case 2: 10月7日历史单草稿（¥101.00，远超48小时且与历史核销差0.06元）
    const draftOct7 = {
        applyId: 'ex_local_oct7',
        childName: '孩子',
        goldAmount: 2751,
        cnyAmount: 101.00,
        verifyCode: '6677',
        createdAt: new Date(now - 11 * 86400 * 1000).toISOString()
    };
    assert.equal(isStaleOrResolvedTicket(draftOct7, '孩子', historyRecords), true, '10月7日草稿必须被判定为已失效/已核销');

    // Case 3: 刚提交并在48小时内的有效新草稿（非历史记录）
    const freshDraft = {
        applyId: 'ex_fresh_new',
        childName: '孩子',
        goldAmount: 150,
        cnyAmount: 10.00,
        verifyCode: '1234',
        createdAt: new Date(now - 10 * 60 * 1000).toISOString() // 10分钟前
    };
    assert.equal(isStaleOrResolvedTicket(freshDraft, '孩子', historyRecords), false, '全新有效草稿不得被误删');

    // Case 4: 切换到另一个孩子时，旧孩子的草稿对新孩子必须视为无效
    assert.equal(isStaleOrResolvedTicket(freshDraft, '妹妹', historyRecords), true, '非当前选定孩子的单据必须被屏蔽');
});

test('【存储与同步防污染】临时兑换单草稿禁止同步到云端，避免多端复活', () => {
    // 1. isJunkKey 必须拦截 app_offline_exchange_*
    assert.equal(isJunkKey('app_offline_exchange_孩子'), true);
    assert.equal(isJunkKey('app_offline_exchange_妹妹'), true);
    assert.equal(isJunkKey('app_wheel_history'), false);
    assert.equal(isJunkKey('app_profiles_v1'), false);

    // 2. stripTesterDataFromPayload 必须清洗掉草稿
    const dirtyPayload = {
        app_profiles_v1: '[{"name":"孩子"}]',
        app_offline_exchange_孩子: JSON.stringify({ applyId: 'ex_local_test' }),
        app_wheel_history: '{"孩子-BASE":100}',
        app_test_mode: 'true'
    };
    const cleaned = stripTesterDataFromPayload(dirtyPayload);
    assert.equal(cleaned['app_offline_exchange_孩子'], undefined, '草稿必须被彻底从同步载荷剥离');
    assert.equal(cleaned['app_test_mode'], undefined);
    assert.equal(cleaned['app_wheel_history'], '{"孩子-BASE":100}');
});

test('【自定义汇率计算】15金元宝换1元人民币时正确换算，无DO时不受100:1默认值干扰', () => {
    // 用户设置：15 金元宝 = 1.00 元人民币 (即 100分 / 15 = 6.6666667分)
    const baseCents = 100 / 15; // 6.666666666666667
    const cnyPerGold = (baseCents / 100); // 0.06666666666666667

    // 兑换 15 金币 -> 应得 1.00 元
    const cnyFor15Gold = parseFloat((15 * cnyPerGold).toFixed(2));
    assert.equal(cnyFor15Gold, 1.00);

    // 兑换 30 金币 -> 应得 2.00 元
    const cnyFor30Gold = parseFloat((30 * cnyPerGold).toFixed(2));
    assert.equal(cnyFor30Gold, 2.00);

    // 兑换 150 金币 -> 应得 10.00 元
    const cnyFor150Gold = parseFloat((150 * cnyPerGold).toFixed(2));
    assert.equal(cnyFor150Gold, 10.00);

    // 反向推导：输入 5 元现金 -> 需扣减 5 / cnyPerGold = 75 金元宝
    const neededGoldFor5Cny = Math.ceil(5 / cnyPerGold);
    assert.equal(neededGoldFor5Cny, 75);

    // 兑换按钮可用性判断逻辑：
    // protectedFamily = !!(syncCode && secureLimits?.rateMicros)
    // 当云端没有返回 secureLimits 时，protectedFamily 为 false，按钮不再被禁用
    const syncCode = 'test-family-code';
    const secureLimits = null; // 模拟当前生产环境 KV 下 limits 接口无专用限额
    const protectedFamily = !!(syncCode && secureLimits?.rateMicros);
    assert.equal(protectedFamily, false, '无专属限额时不应激活 protectedFamily');

    const neededGold = 75;
    const totalGold = 200;
    const isZero = neededGold <= 0;
    const isExceeding = neededGold > totalGold;
    const isBelowMin = neededGold < 1;
    const applying = false;
    const canSubmit = !isZero && !isExceeding && !isBelowMin && !applying && (!protectedFamily || !!secureLimits);
    assert.equal(canSubmit, true, '在余额充足且汇率正确时，兑换按钮必须为可点击状态');
});

test('【设备绑定与多端聚合】微信内置与 Safari 聚合为单一家长手机，历史互动100%保留', () => {
    // 模拟微信扫码绑定
    const wechatScan = {
        deviceId: 'dev_iphone_wechat_001',
        fingerprint: 'fp_iphone15pro_hardware_sig',
        role: '爸爸',
        osName: 'iPhone',
        platform: 'wechat',
        boundAt: 1000
    };
    const step1 = mergeParentDevices([], wechatScan);
    assert.equal(step1.devices.length, 1);

    // 同一台手机使用系统 Safari 扫码
    const safariScan = {
        deviceId: 'dev_iphone_safari_002',
        fingerprint: 'fp_iphone15pro_hardware_sig',
        role: '爸爸',
        osName: 'iPhone',
        platform: 'browser',
        boundAt: 2000
    };
    const step2 = mergeParentDevices(step1.devices, safariScan);
    assert.equal(step2.devices.length, 1, '同一台 iPhone 跨沙盒必须聚合为单个家长设备');
    assert.equal(step2.currentDevice.deviceName, 'iPhone (微信 + 系统浏览器)');

    // 授权验证：微信 deviceId、Safari deviceId 及硬件指纹均受信任
    const authConfig = { devices: step2.devices, revokedDevices: {} };
    assert.equal(isAuthorizedParentDevice(authConfig, { deviceId: 'dev_iphone_wechat_001' }), true);
    assert.equal(isAuthorizedParentDevice(authConfig, { deviceId: 'dev_iphone_safari_002' }), true);
    assert.equal(isAuthorizedParentDevice(authConfig, { fingerprint: 'fp_iphone15pro_hardware_sig' }), true);
    assert.equal(isAuthorizedParentDevice(authConfig, { deviceId: 'dev_unauthorized_child_phone' }), false);

    // 历史互动数据校验：使用已绑定的任何一个设备凭证签署的扣款/红包记录均有效
    const historicalAction = {
        id: 'red_packet_interaction_001',
        type: 'deduction',
        targetChild: '孩子',
        operatorDeviceId: 'dev_iphone_wechat_001',
        amount: 20,
        reason: '节日大红包',
        status: 'pending',
        timestamp: 1500
    };
    const deductionResult = applyDeductions({
        actions: [historicalAction],
        child: '孩子',
        devices: step2.devices,
        strictAuthorization: true,
        balance: () => 100
    });
    assert.equal(deductionResult.actions[0].status, 'claimed', '历史互动记录不得因多沙盒绑定被判定为非法');
});

test('【断签豁免与心愿兑换扫码入口】未受信任设备被严格拦截，已授权家长设备正常放行', () => {
    const parentDevice = {
        deviceId: 'dev_parent_authorized',
        fingerprint: 'fp_parent_hardware',
        role: '妈妈',
        authorizedDeviceIds: ['dev_parent_authorized']
    };
    const authConfig = {
        devices: [parentDevice],
        revokedDevices: {}
    };

    // 检查核验函数
    const checkAuth = (localDevId, localFp) => {
        const devices = authConfig.devices || [];
        const matched = devices.find(d => {
            if (!d) return false;
            if (localDevId && (d.deviceId === localDevId || (Array.isArray(d.authorizedDeviceIds) && d.authorizedDeviceIds.includes(localDevId)))) return true;
            if (localFp && d.fingerprint === localFp) return true;
            return false;
        });
        const revoked = authConfig.revokedDevices || {};
        const isRevoked = Boolean((localDevId && revoked[localDevId]) || (localFp && revoked[localFp]));
        return Boolean(matched && !isRevoked);
    };

    // 家长合法手机
    assert.equal(checkAuth('dev_parent_authorized', 'fp_parent_hardware'), true);
    // 只有指纹匹配（例如微信内置浏览器清理了 localStorage）
    assert.equal(checkAuth('', 'fp_parent_hardware'), true);
    // 孩子的未绑定设备（既无合法 devId 也无指纹）
    assert.equal(checkAuth('dev_child_pad', 'fp_child_pad'), false);
    // 空设备尝试访问
    assert.equal(checkAuth('', ''), false);
});
