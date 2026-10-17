import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDeviceAccess,newDeviceToken} from '../src/utils/deviceAccess.js';
import {mergeSyncSnapshots} from '../src/utils/syncMerge.js';
import {applyDeductions} from '../src/utils/accounting.js';
import {appendParentAction} from '../src/utils/syncCoordinator.js';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),map};};
const response=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers});
test('pairing persists intent before sending, reuses exact token after lost response and keeps roles/families isolated',async()=>{
    const storage=memory(),invite=newDeviceToken(),requests=[];let dropped=true;
    const fetchImpl=async(url,opts)=>{const body=JSON.parse(opts.body);requests.push(body);assert.ok(storage.getItem('daka_pair_pending_v1:parent:family'));
        if(dropped){dropped=false;throw new Error('lost ACK');}return response({ok:true,id:'parent-id',role:'parent',label:'爸爸'});};
    const first=createDeviceAccess({storage,fetchImpl});await assert.rejects(first.pair('family','parent',invite),/lost ACK/);
    const resumed=createDeviceAccess({storage,fetchImpl});await resumed.pair('family','parent',invite);
    assert.deepEqual(requests[0],requests[1]);assert.equal(resumed.pending('family','parent'),null);
    assert.equal(resumed.credential('family','parent').id,'parent-id');
    assert.equal(resumed.credential('family','main'),null);assert.equal(resumed.credential('other-family','parent'),null);
    assert.equal([...storage.map.keys()].some(k=>k.startsWith('app_')),false);
});
test('quota failure sends no redemption; another invitation cannot silently replace pending intent',async()=>{
    let calls=0;const invite=newDeviceToken();
    const denied=createDeviceAccess({storage:{getItem:()=>null,setItem:()=>{throw new Error('quota');}},fetchImpl:async()=>{calls++;}});
    await assert.rejects(denied.pair('family','main',invite),/quota/);assert.equal(calls,0);
    const storage=memory(),client=createDeviceAccess({storage,fetchImpl:async()=>{throw new Error('offline');}});
    await assert.rejects(client.pair('family','main',invite),/offline/);
    await assert.rejects(client.pair('family','main',newDeviceToken()),{code:'PAIR_PENDING'});
    assert.equal(client.pending('family','main').invite,invite);
});
test('credentials are attached only to the sync origin and protected responses cannot downgrade or anonymously retry',async()=>{
    const storage=memory(),token=newDeviceToken(),seen=[];
    storage.setItem('daka_device_access_v1:main:family',JSON.stringify({token,id:'main-id',role:'main'}));
    const client=createDeviceAccess({storage,fetchImpl:async(url,opts)=>{seen.push({url,opts});return response({},200,{'X-Family-Auth':'required'});}});
    await client.syncFetch('https://sync.daka-tool.top/?code=family');
    assert.equal(seen[0].opts.headers.get('Authorization'),`Bearer ${token}`);assert.equal(seen[0].opts.redirect,'error');
    await assert.rejects(client.syncFetch('https://other.test/?code=family'),{code:'WRONG_ORIGIN'});assert.equal(seen.length,1);
    const downgraded=createDeviceAccess({storage,fetchImpl:async()=>response({})});
    await assert.rejects(downgraded.syncFetch('https://sync.daka-tool.top/?code=family'),{code:'AUTH_DOWNGRADE'});
    let attempts=0;const revoked=createDeviceAccess({storage,fetchImpl:async()=>{attempts++;return response({code:'AUTH_REQUIRED'},401,{'X-Family-Auth':'required'});}});
    await assert.rejects(revoked.syncFetch('https://sync.daka-tool.top/?code=family'),{code:'AUTH_REQUIRED'});assert.equal(attempts,1);
    assert.equal(revoked.credential('family').token,token); // preserve context for explicit re-pair, not silent fallback
});
test('self-revocation clears only the confirmed device and retains the required marker',async()=>{
    const storage=memory(),token=newDeviceToken();storage.setItem('daka_device_access_v1:parent:family',JSON.stringify({token,id:'p',role:'parent'}));
    storage.setItem('daka_access_required_v1:family','1');let offline=true;
    const client=createDeviceAccess({storage,fetchImpl:async()=>{if(offline)throw new Error('offline');return response({ok:true});}});
    await assert.rejects(client.revokeSelf('family','parent'));assert.ok(client.credential('family','parent'));
    offline=false;await client.revokeSelf('family','parent');assert.equal(client.credential('family','parent'),null);assert.equal(client.required('family'),true);
});
test('wrong-role receipt is not installed and malformed credentials never fall back to anonymous',async()=>{
    const storage=memory(),client=createDeviceAccess({storage,fetchImpl:async()=>response({ok:true,id:'x',role:'parent',label:'爸爸'})});
    await assert.rejects(client.pair('family','main',newDeviceToken()),{code:'INVALID_RECEIPT'});assert.equal(client.credential('family'),null);
    storage.setItem('daka_device_access_v1:main:family','broken');
    await assert.rejects(client.syncFetch('https://sync.daka-tool.top/?code=family'),{code:'INVALID_CREDENTIAL'});
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
