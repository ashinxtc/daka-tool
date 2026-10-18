import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDeviceAccess,newDeviceToken} from '../src/utils/deviceAccess.js';
import {mergeSyncSnapshots} from '../src/utils/syncMerge.js';
import {applyDeductions} from '../src/utils/accounting.js';
import {appendParentAction} from '../src/utils/syncCoordinator.js';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),map};};
const response=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers});

test('frictionless access generates and reuses persistent device ID per family/role without pairing vouchers',async()=>{
    const storage=memory();
    const client=createDeviceAccess({storage});
    const cred1=client.credential('family1','main');
    const cred2=client.credential('family1','main');
    assert.equal(cred1.id,cred2.id);
    assert.equal(cred1.role,'main');

    const parentCred=client.credential('family1','parent');
    assert.notEqual(parentCred.id,cred1.id);
    assert.equal(parentCred.role,'parent');

    const otherFamilyCred=client.credential('family2','main');
    assert.notEqual(otherFamilyCred.id,cred1.id);

    // Required always returns false (frictionless)
    assert.equal(client.required('family1'),false);
    assert.equal(client.pending('family1','main'),null);
});

test('credentials and role headers are attached to sync origin and cross-origin calls are rejected',async()=>{
    const storage=memory(),seen=[];
    const client=createDeviceAccess({storage,fetchImpl:async(url,opts)=>{seen.push({url,opts});return response({ok:true});}});
    await client.syncFetch('https://sync.daka-tool.top/?code=family',{},'main');
    const saved=client.credential('family','main');
    assert.equal(seen[0].opts.headers.get('Authorization'),`Bearer ${saved.id}`);
    assert.equal(seen[0].opts.headers.get('X-Device-Id'),saved.id);
    assert.equal(seen[0].opts.headers.get('X-Device-Role'),'main');
    assert.equal(seen[0].opts.redirect,'error');

    await assert.rejects(client.syncFetch('https://other.test/?code=family'),{code:'WRONG_ORIGIN'});
    assert.equal(seen.length,1);
});

test('pair and revokeSelf operate smoothly without blocking offline users',async()=>{
    const storage=memory();
    const client=createDeviceAccess({storage});
    const cred=await client.pair('family','main');
    assert.equal(cred.id,client.credential('family','main').id);
    const revoked=await client.revokeSelf('family','main');
    assert.equal(revoked.ok,true);
    assert.equal(client.required('family'),false);
});

test('protected three-way merge drops private settings from sync and always adopts the server registry',()=>{
    const old={app_settings_password:'"local-secret"',app_theme:'"blue"',app_authorized_parents_v1:'{"pairToken":"old","devices":[]}'};
    const remote={app_theme:'"blue"',app_authorized_parents_v1:'{"securityVersion":1,"pairToken":"","devices":[]}'};
    const result=mergeSyncSnapshots(old,{...old,app_settings_password:'"new-local-secret"'},remote,{resolve:{app_authorized_parents_v1:'local'}});
    assert.deepEqual(result.conflicts,[]);assert.equal(result.data.app_settings_password,undefined);assert.equal(result.data.app_authorized_parents_v1,remote.app_authorized_parents_v1);
    assert.equal(old.app_settings_password,'"local-secret"');
});

test('strict empty registry rejects pending deductions; protected history cap preserves other devices records',()=>{
    const action={id:'a',type:'deduction',targetChild:'孩子',operatorDeviceId:'old',amount:10,status:'pending',timestamp:1};
    const result=applyDeductions({actions:[action],child:'孩子',devices:[],strictAuthorization:true,balance:()=>100});
    assert.equal(result.actions[0].status,'rejected_unauthorized');assert.deepEqual(result.receipts,{});assert.deepEqual(result.history,{});
    const old=Array.from({length:120},(_,i)=>({id:String(i),status:'done',operatorDeviceId:'other'}));
    assert.equal(appendParentAction(old,action,true).length,121);assert.equal(appendParentAction(old,action).length,100);
});

test('device fingerprinting and multi-platform merging aggregates WeChat and Safari into a single parent device',async()=>{
    const {mergeParentDevices,isAuthorizedParentDevice,getValidDeviceIdsSet,getDeviceFingerprint}=await import('../src/utils/deviceFingerprint.js');
    
    // 1. Initial scan from WeChat
    const wechatScan = {
        deviceId: 'dev_wechat_101',
        fingerprint: 'fp_phone_hardware_aaa',
        role: '爸爸',
        osName: 'iPhone',
        platform: 'wechat',
        boundAt: 1000
    };
    const step1 = mergeParentDevices([], wechatScan);
    assert.equal(step1.devices.length, 1);
    assert.equal(step1.merged, false);
    assert.equal(step1.currentDevice.deviceName, 'iPhone (微信内置)');
    assert.deepEqual(step1.currentDevice.platforms, ['wechat']);
    assert.deepEqual(step1.currentDevice.authorizedDeviceIds, ['dev_wechat_101']);

    // 2. Subsequent scan from System Safari on the same phone (same fingerprint)
    const safariScan = {
        deviceId: 'dev_safari_202',
        fingerprint: 'fp_phone_hardware_aaa',
        role: '爸爸',
        osName: 'iPhone',
        platform: 'browser',
        boundAt: 2000
    };
    const step2 = mergeParentDevices(step1.devices, safariScan);
    assert.equal(step2.devices.length, 1); // Crucial: still 1 entry in the list!
    assert.equal(step2.merged, true);
    assert.equal(step2.currentDevice.deviceName, 'iPhone (微信 + 系统浏览器)');
    assert.deepEqual(step2.currentDevice.platforms.sort(), ['browser', 'wechat'].sort());
    assert.deepEqual(step2.currentDevice.authorizedDeviceIds.sort(), ['dev_wechat_101', 'dev_safari_202'].sort());

    // 3. Verification checks: both entry point tokens are authorized
    const authConfig = {
        devices: step2.devices,
        revokedDevices: {}
    };
    assert.equal(isAuthorizedParentDevice(authConfig, { deviceId: 'dev_wechat_101' }), true);
    assert.equal(isAuthorizedParentDevice(authConfig, { deviceId: 'dev_safari_202' }), true);
    assert.equal(isAuthorizedParentDevice(authConfig, { fingerprint: 'fp_phone_hardware_aaa' }), true);
    assert.equal(isAuthorizedParentDevice(authConfig, { deviceId: 'dev_unauthorized_999' }), false);

    // 4. Accounting deductions accept actions from both entry points
    const validSet = getValidDeviceIdsSet(step2.devices);
    assert.equal(validSet.has('dev_wechat_101'), true);
    assert.equal(validSet.has('dev_safari_202'), true);
    assert.equal(validSet.has('fp_phone_hardware_aaa'), true);

    const safariAction = { id: 'act_safari', type: 'deduction', targetChild: '孩子', operatorDeviceId: 'dev_safari_202', amount: 5, status: 'pending', timestamp: 10 };
    const deductionResult = applyDeductions({ actions: [safariAction], child: '孩子', devices: step2.devices, strictAuthorization: true, balance: () => 100 });
    assert.equal(deductionResult.actions[0].status, 'claimed');

    // 5. Revocation checks: revoking device revokes both entry points
    authConfig.revokedDevices['dev_wechat_101'] = Date.now();
    assert.equal(isAuthorizedParentDevice(authConfig, { deviceId: 'dev_wechat_101' }), false);
});

test('consolidateLegacyDevices automatically fuses existing duplicate bindings and preserves historical interactions', async () => {
    const { consolidateLegacyDevices, getValidDeviceIdsSet, isAuthorizedParentDevice } = await import('../src/utils/deviceFingerprint.js');

    // Simulate existing legacy data where the parent bound via WeChat first, then via Safari on the same iPhone
    const legacyDevices = [
        {
            deviceId: 'dev_legacy_wechat',
            role: '妈妈',
            deviceName: 'iPhone (微信内置)',
            boundAt: 1000,
            lastActive: 2000
        },
        {
            deviceId: 'dev_legacy_safari',
            role: '妈妈',
            deviceName: 'iPhone (系统浏览器)',
            boundAt: 1500,
            lastActive: 3000
        },
        {
            deviceId: 'dev_dad_phone',
            role: '爸爸',
            deviceName: 'Android (微信内置)',
            boundAt: 1100,
            lastActive: 2500
        }
    ];

    const consolidated = consolidateLegacyDevices(legacyDevices);
    assert.equal(consolidated.length, 2); // Mama's two records fused into 1; Dad's kept as 1

    const mamaDevice = consolidated.find(d => d.role === '妈妈');
    assert.ok(mamaDevice);
    assert.equal(mamaDevice.deviceName, 'iPhone (微信 + 系统浏览器)');
    assert.deepEqual(mamaDevice.platforms.sort(), ['browser', 'wechat'].sort());
    assert.deepEqual(mamaDevice.authorizedDeviceIds.sort(), ['dev_legacy_safari', 'dev_legacy_wechat'].sort());

    // Both old deviceIds remain fully authorized in valid set
    const validIds = getValidDeviceIdsSet(consolidated);
    assert.equal(validIds.has('dev_legacy_wechat'), true);
    assert.equal(validIds.has('dev_legacy_safari'), true);
    assert.equal(validIds.has('dev_dad_phone'), true);

    // Historical interactions (red packets, deductions, etc.) signed by either deviceId remain valid
    const safariDeductionAction = {
        id: 'deduct_1',
        type: 'deduction',
        targetChild: '孩子',
        operatorDeviceId: 'dev_legacy_safari',
        amount: 20,
        status: 'pending',
        timestamp: 2100
    };

    const deductionResult = applyDeductions({
        actions: [safariDeductionAction],
        child: '孩子',
        devices: consolidated,
        strictAuthorization: true,
        balance: () => 100
    });
    assert.equal(deductionResult.actions[0].status, 'claimed');

    // And isAuthorizedParentDevice returns true for both IDs
    const authConfig = { devices: consolidated, revokedDevices: {} };
    assert.equal(isAuthorizedParentDevice(authConfig, { deviceId: 'dev_legacy_wechat' }), true);
    assert.equal(isAuthorizedParentDevice(authConfig, { deviceId: 'dev_legacy_safari' }), true);
});


