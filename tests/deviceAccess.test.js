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
