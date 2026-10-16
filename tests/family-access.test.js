import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {Miniflare} from 'miniflare';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {mintActivation,randomToken,tokenHash,FamilyAccess,ACCESS_KEY} from '../server/family-access.js';
import {stripSecrets} from '../shared/access-policy.js';

// Isolated fixtures only. Never use production credentials, namespaces or URLs.
const secret='test-only-bootstrap-secret-not-a-production-key';
const options={modules:true,modulesRules:[{type:'ESModule',include:['**/*.js']}],scriptPath:'cloudflare-worker.js',
    compatibilityDate:'2026-07-30',durableObjects:{SYNC_FAMILIES:{className:'SyncFamily',useSQLite:true}},
    kvNamespaces:['DAKA_SYNC'],bindings:{SYNC_MODE:'active',AUTH_MODE:'enforced',AUTH_BOOTSTRAP_SECRET:secret}};
let mf,kv;
before(async()=>{mf=new Miniflare(options);kv=await mf.getKVNamespace('DAKA_SYNC');});
after(async()=>{await mf?.dispose();});
const payload=extra=>({app_profiles_v1:'[{"id":"child","name":"孩子"}]',app_parent_actions_v1:'[]',app_global_messages_v2:'[]',...extra});
const call=(runtime,code,path='/',token,body,headers={})=>runtime.dispatchFetch(`https://sync.test${path}?code=${encodeURIComponent(code)}`,{
    method:body===undefined?'GET':'POST',headers:{...(token?{Authorization:`Bearer ${token}`}:{ }),...headers},
    ...(body===undefined?{}:{body:JSON.stringify(body)})});
async function ok(response,status=200){assert.equal(response.status,status,await response.clone().text());return response.json();}
const read=(family,path='/')=>call(mf,family.code,path,family.main.token);
const write=(family,data,revision,device=family.main,id=crypto.randomUUID())=>call(mf,family.code,'/',device?.token,data,{'If-Match':`"${revision}"`,'Idempotency-Key':id});
async function claim(runtime,code,purpose='activate',token=randomToken()){
    const voucher=await mintActivation(secret,code,purpose);
    const result=await ok(await call(runtime,code,'/auth/claim',null,{voucher,token}));
    return {...result,token,voucher};
}
async function pair(runtime,code,owner,role,label){
    const grant=await ok(await call(runtime,code,'/auth/invite',owner.token,{role,label}));
    const token=randomToken();
    const result=await ok(await call(runtime,code,'/auth/redeem',null,{invite:grant.invite,token}));
    return {...result,token,invite:grant.invite};
}
async function family(code=`auth-${crypto.randomUUID().slice(0,12)}`,seed){
    if(seed)await kv.put(`sync:${code}`,JSON.stringify(seed));
    const owner=await claim(mf,code);
    const main=await pair(mf,code,owner,'main','家庭 iPad');
    const parent=await pair(mf,code,owner,'parent','爸爸');
    return {code,owner,main,parent};
}
const action=parent=>({id:`act_${crypto.randomUUID()}`,type:'deduction',targetChild:'孩子',operatorDeviceId:parent.id,
    operatorRole:parent.label,amount:10,reason:'共同支出',timestamp:Date.now(),status:'pending'});

test('protected root, timestamps, backups and writes require a real issued bearer before migration',async()=>{
    const code='unclaimed-family';
    await kv.put(`sync:${code}`,JSON.stringify(payload({app_settings_password:'"old-secret"'})));
    for(const path of ['/','/ts','/bak'])assert.equal((await call(mf,code,path)).status,401);
    assert.equal((await call(mf,code,'/',null,payload())).status,401);
    assert.deepEqual(await ok(await call(mf,code,'/auth/mode')),{required:true,initialized:false});
    const f=await family();
    assert.equal((await call(mf,f.code,'/',f.owner.token)).status,403);
    assert.equal((await call(mf,f.code,'/auth/check',randomToken())).status,401);
    const rawHeader=await call(mf,f.code,'/auth/check',null,undefined,{Authorization:f.main.token});
    assert.equal(rawHeader.status,401);
    const checked=await ok(await call(mf,f.code,'/auth/check',f.main.token));
    assert.equal(checked.role,'main');assert.equal(checked.id,f.main.id);
});

test('activation supports Chinese codes; wrong-family, forged, expired and second activation vouchers fail',async()=>{
    const f=await family('安全测试家庭');
    const retry=await ok(await call(mf,f.code,'/auth/claim',null,{token:f.owner.token,voucher:f.owner.voucher}));
    assert.equal(retry.id,f.owner.id);
    for(const voucher of [f.owner.voucher+'0',await mintActivation(secret,'another-family'),await mintActivation(secret,f.code,'activate',Date.now()-7200000)]){
        assert.equal((await call(mf,f.code,'/auth/claim',null,{token:randomToken(),voucher})).status,403);
    }
    assert.equal((await call(mf,f.code,'/auth/claim',null,{token:randomToken(),voucher:await mintActivation(secret,f.code)})).status,409);
    assert.equal((await call(mf,'unclaimed-family','/auth/claim',null,{token:f.owner.token,voucher:f.owner.voucher})).status,403);
});

test('single-use invitation is atomic, and exact lost-ACK redemption is retryable',async()=>{
    const f=await family(),grant=await ok(await call(mf,f.code,'/auth/invite',f.owner.token,{role:'parent',label:'妈妈'}));
    const tokens=[randomToken(),randomToken()];
    const responses=await Promise.all(tokens.map(token=>call(mf,f.code,'/auth/redeem',null,{invite:grant.invite,token})));
    assert.deepEqual(responses.map(r=>r.status).sort(),[200,403]);
    const winner=responses.findIndex(r=>r.status===200),accepted=await responses[winner].json();
    assert.deepEqual(await ok(await call(mf,f.code,'/auth/redeem',null,{invite:grant.invite,token:tokens[winner]})),accepted);
    await ok(await call(mf,f.code,'/auth/revoke',f.owner.token,{id:accepted.id}));
    assert.equal((await call(mf,f.code,'/auth/redeem',null,{invite:grant.invite,token:tokens[winner]})).status,403);
});

test('only owner can issue or enumerate devices; devices can revoke themselves, not other devices',async()=>{
    const f=await family();
    for(const d of [f.main,f.parent]){
        assert.equal((await call(mf,f.code,'/auth/invite',d.token,{role:'parent',label:'伪造'})).status,403);
        assert.equal((await call(mf,f.code,'/auth/devices',d.token)).status,403);
        assert.equal((await call(mf,f.code,'/auth/revoke',d.token,{id:f.owner.id})).status,403);
    }
    const devices=await ok(await call(mf,f.code,'/auth/devices',f.owner.token));
    assert.equal(devices.devices.length,3);
    assert.ok(!JSON.stringify(devices).includes(f.main.token));
    await ok(await call(mf,f.code,'/auth/revoke',f.parent.token,{id:f.parent.id}));
    assert.equal((await call(mf,f.code,'/auth/check',f.parent.token)).status,401);
    assert.equal((await call(mf,f.code,'/auth/check',f.main.token)).status,200);
});

test('credentials are family-scoped and cannot be recreated through legacy pair tokens or snapshots',async()=>{
    const a=await family(),b=await family();
    for(const path of ['/','/ts','/bak','/auth/check'])assert.equal((await call(mf,b.code,path,a.main.token)).status,401);
    assert.equal((await call(mf,b.code,'/auth/redeem',null,{invite:a.parent.invite,token:randomToken()})).status,403);
    assert.equal((await call(mf,a.code,'/auth/redeem',null,{invite:'old-public-pair-token',token:randomToken()})).status,403);
    const forged=payload({app_authorized_parents_v1:JSON.stringify({devices:[{deviceId:'fake',role:'owner'}]})});
    assert.equal((await write(a,forged,0)).status,403);
    assert.equal((await read(a)).status,404);
});

test('current and backup snapshots redact old secrets and use the server-owned device registry',async()=>{
    const old=payload({app_settings_password:'"secret"',app_deepseek_api_key:'"api-secret"',app_wecom_webhook_key:'"webhook"',
        app_wecom_callback_token:'"token"',app_wecom_callback_aes_key:'"aes"',app_report_config_v1:'{"password":"nested"}',
        app_authorized_parents_v1:'{"pairToken":"public-old-token","devices":[]}',_keyVersions:{app_settings_password:1,app_profiles_v1:2}});
    const code=`redact-${crypto.randomUUID().slice(0,10)}`;
    await kv.put(`sync:${code}:bak`,JSON.stringify(old));
    const f=await family(code,old);
    for(const path of ['/','/bak']){
        const data=await ok(await read(f,path));
        for(const key of Object.keys(old).filter(k=>/password|key|token|report_config/.test(k)&&k!=='_keyVersions'))assert.equal(data[key],undefined);
        assert.equal(data._keyVersions.app_settings_password,undefined);
        const registry=JSON.parse(data.app_authorized_parents_v1);
        assert.equal(registry.pairToken,'');assert.equal(registry.devices[0].deviceId,f.parent.id);
    }
    const data=await ok(await read(f));
    assert.equal((await write(f,{...data,app_settings_password:'"new"'},2)).status,403);
    await ok(await write(f,{...data,app_theme:'"blue"'},2));
    const backup=await ok(await read(f,'/bak'));assert.equal(backup.app_settings_password,undefined);
    assert.equal((await ok(await read(f,'/ts'))).revision,3);
    assert.deepEqual(stripSecrets({app_apiKey:'secret',app_theme:'"blue"'}),{app_theme:'"blue"'});
});

test('parent can append their own valid commands, but cannot edit balances, tasks, metadata or existing commands',async()=>{
    const f=await family();await ok(await write(f,payload({app_stars_v1:'{"孩子":100}',_keyVersions:{app_stars_v1:1}}),0));
    const data=await ok(await read(f)),command=action(f.parent);
    const accepted={...data,app_parent_actions_v1:JSON.stringify([command])};
    await ok(await write(f,accepted,1,f.parent));
    const current=await ok(await read(f));
    const attacks=[{app_stars_v1:'{"孩子":999}'},{app_tasks_v2:'{}'},{_keyVersions:{app_stars_v1:999}},
        {app_parent_actions_v1:JSON.stringify([{...command,amount:999}])},{app_parent_actions_v1:'[]'},
        {app_parent_actions_v1:JSON.stringify([command,{...action(f.parent),operatorDeviceId:f.main.id}])},
        {app_parent_actions_v1:JSON.stringify([command,{...action(f.parent),targetChild:'其他孩子'}])},
        {app_parent_actions_v1:JSON.stringify([command,{...action(f.parent),amount:-1}])},
        {app_parent_actions_v1:JSON.stringify([command,{...action(f.parent),operatorRole:'冒充妈妈'}])}];
    for(const patch of attacks)assert.equal((await write(f,{...current,...patch},2,f.parent)).status,403);
    assert.equal((await write(f,{...current,app_parent_actions_v1:'oops'},2,f.parent)).status,400);
    assert.equal((await ok(await read(f,'/ts'))).revision,2);
    assert.deepEqual(JSON.parse((await ok(await read(f))).app_parent_actions_v1),[command]);
    // Trusted household device acknowledges execution; parent cannot change its receipt.
    await ok(await write(f,{...current,app_parent_actions_v1:JSON.stringify([{...command,status:'done'}])},2));
});

test('parent messages bind author and device and cannot erase another device’s message',async()=>{
    const f=await family();await ok(await write(f,payload(),0));
    const message={id:'msg-1',operatorDeviceId:f.parent.id,author:'爸爸',parentRole:'爸爸',isParent:true,text:'加油',timestamp:Date.now(),expire:Date.now()+60000,blessings:0,blessedBy:{}};
    const data=await ok(await read(f));await ok(await write(f,{...data,app_global_messages_v2:JSON.stringify([message])},1,f.parent));
    const mother=await pair(mf,f.code,f.owner,'parent','妈妈'),current=await ok(await read(f));
    assert.equal((await write(f,{...current,app_global_messages_v2:'[]'},3,mother)).status,403);
    assert.equal((await write(f,{...current,app_global_messages_v2:JSON.stringify([message,{...message,id:'msg-2',operatorDeviceId:mother.id}])},3,mother)).status,403);
    await ok(await write(f,{...current,app_global_messages_v2:'[]'},3,f.parent));
});

test('idempotency receipts are device-bound and revocation blocks even an exact replay',async()=>{
    const f=await family(),id=crypto.randomUUID(),data=payload();
    const first=await ok(await write(f,data,0,f.main,id));
    assert.equal((await ok(await write(f,data,0,f.main,id))).replayed,true);
    assert.equal((await write(f,data,0,f.parent,id)).status,403);
    await ok(await call(mf,f.code,'/auth/revoke',f.owner.token,{id:f.main.id}));
    assert.equal((await write(f,data,0,f.main,id)).status,401);
    assert.equal((await ok(await call(mf,f.code,'/ts',f.parent.token))).revision,first.revision+1);
});

test('write/revocation race is serialized; no revoked credential can commit a later request',async()=>{
    const f=await family();await ok(await write(f,payload(),0));
    const data=await ok(await read(f)),next={...data,app_parent_actions_v1:JSON.stringify([action(f.parent)])};
    const [writeResponse,revokeResponse]=await Promise.all([write(f,next,1,f.parent),call(mf,f.code,'/auth/revoke',f.owner.token,{id:f.parent.id})]);
    assert.ok([200,401].includes(writeResponse.status));await ok(revokeResponse);
    const revision=(await ok(await read(f,'/ts'))).revision;
    assert.equal((await write(f,next,revision,f.parent)).status,401);
    assert.equal((await ok(await read(f,'/ts'))).revision,revision);
});

test('revocation advances polling revision once; unchanged polls do not rewrite snapshots',async()=>{
    const f=await family();await ok(await write(f,payload(),0));
    const before=await ok(await read(f,'/ts'));
    await ok(await call(mf,f.code,'/auth/revoke',f.owner.token,{id:f.parent.id}));
    const changed=await ok(await read(f,'/ts'));
    assert.equal(changed.revision,before.revision+1);assert.ok(changed.ts>before.ts);
    const data=await ok(await read(f)),registry=JSON.parse(data.app_authorized_parents_v1);
    assert.deepEqual(registry.devices,[]);assert.ok(registry.revokedDevices[f.parent.id]);
    for(let i=0;i<5;i++)assert.deepEqual(await ok(await read(f,'/ts')),changed);
    // Stale writes cannot undo the registry update; the client must re-read.
    assert.equal((await write(f,payload(),before.revision)).status,409);
});

test('expired devices and invitations fail; invalid AUTH_MODE fails closed',async()=>{
    const token=randomToken(),hash=await tokenHash(token),invite=randomToken(),inviteHash=await tokenHash(invite);
    const state={locked:true,devices:{[hash]:{id:'expired',role:'parent',expiresAt:Date.now()-1}},invites:{[inviteHash]:{role:'parent',label:'爸爸',expiresAt:Date.now()-1}}};
    const storage={get:async key=>key===ACCESS_KEY?structuredClone(state):undefined,transaction:async fn=>fn(storage)};
    const access=new FamilyAccess(storage,options.bindings);
    await assert.rejects(access.authorize(new Request('https://sync.test/',{headers:{Authorization:`Bearer ${token}`}})),{status:401});
    await assert.rejects(access.handle(new Request('https://sync.test/auth/redeem',{method:'POST',body:JSON.stringify({invite,token:randomToken()})}),'family'),{status:403});
    assert.deepEqual(JSON.parse((await access.publicSnapshot(payload(),storage)).app_authorized_parents_v1).devices,[]);
    const invalid=new FamilyAccess({get:async()=>undefined},{AUTH_MODE:'enforce-typo'});
    await assert.rejects(invalid.authorize(new Request('https://sync.test/')),{status:503,code:'AUTH_CONFIGURATION'});
});

test('recovery revokes every old identity and invite without deleting business data',async()=>{
    const f=await family();await ok(await write(f,payload(),0));
    assert.equal((await call(mf,f.code,'/auth/claim',null,{token:f.owner.token,voucher:await mintActivation(secret,f.code,'recover')})).status,409);
    const invite=await ok(await call(mf,f.code,'/auth/invite',f.owner.token,{role:'main',label:'尚未连接'}));
    const owner=await claim(mf,f.code,'recover');
    for(const d of [f.main,f.parent,f.owner])assert.equal((await call(mf,f.code,'/auth/check',d.token)).status,401);
    assert.equal((await call(mf,f.code,'/auth/redeem',null,{invite:invite.invite,token:randomToken()})).status,403);
    assert.equal((await call(mf,f.code,'/auth/claim',null,{token:f.owner.token,voucher:f.owner.voucher})).status,403);
    const main=await pair(mf,f.code,owner,'main','恢复设备');
    assert.equal((await ok(await call(mf,f.code,'/',main.token))).app_profiles_v1,payload().app_profiles_v1);
});

test('oversized and malformed auth bodies fail explicitly and CORS permits only an authorization header, not cookies',async()=>{
    assert.equal((await call(mf,'body-family','/auth/claim',null,{huge:'x'.repeat(17000)})).status,413);
    assert.equal((await call(mf,'body-family','/auth/claim',null,[])).status,400);
    const result=await mf.dispatchFetch('https://sync.test/',{method:'OPTIONS'});
    assert.match(result.headers.get('Access-Control-Allow-Headers'),/Authorization/);
    assert.equal(result.headers.get('Access-Control-Allow-Credentials'),null);
});

test('restart persists credentials; legacy mode cannot unlock protected families or expose old KV on rollback',async()=>{
    const directory=await mkdtemp(join(tmpdir(),'daka-auth-persist-'));
    const persisted={...options,durableObjectsPersist:join(directory,'objects'),kvPersist:join(directory,'kv')};
    let runtime=new Miniflare(persisted);
    try{
        const code='persisted-family',owner=await claim(runtime,code),main=await pair(runtime,code,owner,'main','iPad');
        await (await runtime.getKVNamespace('DAKA_SYNC')).put(`sync:${code}`,JSON.stringify(payload({app_settings_password:'"old-secret"'})));
        await ok(await call(runtime,code,'/',main.token));
        await runtime.dispose();runtime=new Miniflare({...persisted,bindings:{...options.bindings,AUTH_MODE:'legacy'}});
        assert.equal((await call(runtime,code)).status,401);
        assert.equal((await ok(await call(runtime,code,'/',main.token))).app_settings_password,undefined);
        await runtime.dispose();runtime=new Miniflare({...persisted,bindings:{...options.bindings,AUTH_MODE:'legacy',SYNC_MODE:'readonly'}});
        assert.equal((await call(runtime,code)).status,401);
        assert.equal((await call(runtime,code,'/',main.token)).status,503);
        assert.equal((await call(runtime,code,'/bak',main.token)).status,503);
        assert.equal((await call(runtime,code,'/auth/check',main.token)).status,200);
        await ok(await call(runtime,code,'/auth/revoke',owner.token,{id:main.id}));
        assert.equal((await call(runtime,code,'/auth/check',main.token)).status,401);
        // Unactivated legacy family still reads KV without importing it early.
        await (await runtime.getKVNamespace('DAKA_SYNC')).put('sync:legacy-family',JSON.stringify(payload()));
        const legacy=await call(runtime,'legacy-family');assert.equal(legacy.status,200);assert.equal(legacy.headers.get('X-Sync-Protocol'),'1');
    }finally{await runtime?.dispose();await rm(directory,{recursive:true,force:true});}
});
