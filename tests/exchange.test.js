import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {Miniflare} from 'miniflare';
import {mintActivation,randomToken} from '../server/family-access.js';
import worker from '../exchange-worker.js';
import {calculateGold} from '../shared/gold-balance.js';
import {pendingExchange} from '../src/utils/exchangeTransport.js';
import {FamilyExchange} from '../server/family-exchange.js';
import {mergeSyncSnapshots} from '../src/utils/syncMerge.js';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const secret='exchange-isolated-tests-not-production-secret';
let mf,kv,directory,persisted;
const options={modules:true,modulesRules:[{type:'ESModule',include:['**/*.js']}],scriptPath:'cloudflare-worker.js',compatibilityDate:'2026-07-30',
    durableObjects:{SYNC_FAMILIES:{className:'SyncFamily',useSQLite:true}},kvNamespaces:['DAKA_SYNC'],bindings:{SYNC_MODE:'active',AUTH_MODE:'enforced',EXCHANGE_MODE:'preview',AUTH_BOOTSTRAP_SECRET:secret}};
before(async()=>{directory=await mkdtemp(join(tmpdir(),'daka-exchange-'));persisted={...options,durableObjectsPersist:join(directory,'objects'),kvPersist:join(directory,'kv')};mf=new Miniflare(persisted);kv=await mf.getKVNamespace('DAKA_SYNC');});after(async()=>{await mf?.dispose();await rm(directory,{recursive:true,force:true});});
const request=(code,path,token,body,headers={})=>mf.dispatchFetch(`https://sync.test${path}${path.includes('?')?'&':'?'}code=${code}`,{method:body?'POST':'GET',headers:{...(token?{Authorization:`Bearer ${token}`}:{ }),...headers},...(body?{body:JSON.stringify(body)}:{})});
async function json(r,status=200){assert.equal(r.status,status,await r.clone().text());return r.json();}
async function family(){
    const code=`exchange-${crypto.randomUUID().slice(0,8)}`,owner=randomToken(),main=randomToken(),parent=randomToken();
    await kv.put(`sync:${code}`,JSON.stringify({app_profiles_v1:'[{"name":"孩子"},{"name":"姐姐"}]',app_wheel_history:'{"孩子-BASE":2000,"姐姐-BASE":1000}',app_tasks_v2:'{}',app_checkins_v2:'{}'}));
    await json(await request(code,'/auth/claim',null,{token:owner,voucher:await mintActivation(secret,code)}));
    let parentId;
    for(const [role,token]of [['main',main],['parent',parent]]){
        const grant=await json(await request(code,'/auth/invite',owner,{role,label:'爸爸'}));
        const result=await json(await request(code,'/auth/redeem',null,{invite:grant.invite,token}));if(role==='parent')parentId=result.id;
    }
    await json(await request(code,'/exchange/limits',owner,{limits:{minGold:500,maxSingle:0,maxWeekly:0,rateMicros:10000}}));
    return {code,owner,main,parent,parentId};
}
const terms=(extra={})=>({operationId:`exs_${crypto.randomUUID()}`,childName:'孩子',goldAmount:500,rateMicros:10000,...extra});
const apply=(f,t=terms())=>request(f.code,'/exchange/apply',f.main,t);
const read=f=>request(f.code,'/',f.main);
const debitCount=data=>Object.keys(JSON.parse(data.app_wheel_history)).filter(k=>k.includes('-EXCHANGE-')).length;
test('concurrent applications and lost acknowledgements preserve one order and one quota slot',async()=>{
    const f=await family(),t=terms();
    const result=await Promise.all([apply(f,t),apply(f,t)]);const [a,b]=await Promise.all(result.map(r=>json(r)));
    assert.equal(a.applyId,b.applyId);assert.equal((await json(await request(f.code,'/exchange/status',f.main))).records.length,1);
    await json(await apply(f,terms()),409);await json(await apply(f,{...t,goldAmount:600}),409);
    assert.equal(debitCount(await json(await read(f))),0);
});
test('verify versus cancel has one terminal state and atomic debit; retries cannot reverse it',async()=>{
    for(let i=0;i<3;i++){
        const f=await family(),order=await json(await apply(f));
        const body={applyId:order.applyId,verifyCode:order.verifyCode};
        const responses=await Promise.all([request(f.code,'/exchange/verify',f.parent,body),request(f.code,'/exchange/cancel',f.main,body)]);
        assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
        const record=(await json(await request(f.code,`/exchange/order?id=${order.applyId}`,f.parent))).record;
        const data=await json(await read(f));assert.equal(debitCount(data),record.status==='verified'?1:0);
        const replay=await json(await request(f.code,`/exchange/${record.status==='verified'?'verify':'cancel'}`,record.status==='verified'?f.parent:f.main,body));assert.equal(replay.replayed,true);
        assert.equal(debitCount(await json(await read(f))),debitCount(data));
    }
});
test('unauthorized roles, cross-family IDs and revoked devices cannot view, settle or change limits',async()=>{
    const f=await family(),other=await family(),order=await json(await apply(f)),body={applyId:order.applyId,verifyCode:order.verifyCode};
    await json(await request(f.code,'/exchange/status'),401);
    await json(await request(f.code,'/exchange/verify',f.main,body),403);
    await json(await request(other.code,`/exchange/order?id=${order.applyId}`,other.parent),404);
    await json(await request(other.code,'/exchange/verify',other.parent,body),404);
    await json(await request(f.code,'/exchange/limits',f.parent,{limits:{minGold:1,maxSingle:0,maxWeekly:0,rateMicros:10000}}),403);
    await json(await request(f.code,'/auth/revoke',f.owner,{id:f.parentId}));
    await json(await request(f.code,'/exchange/verify',f.parent,body),401);
});
test('verified ledger survives replay and cannot be added, changed or deleted by snapshot upload',async()=>{
    const f=await family(),order=await json(await apply(f)),body={applyId:order.applyId,verifyCode:order.verifyCode};
    const result=await Promise.all([request(f.code,'/exchange/verify',f.parent,body),request(f.code,'/exchange/verify',f.parent,body)]);
    await Promise.all(result.map(r=>json(r)));const response=await read(f),data=await json(response),history=JSON.parse(data.app_wheel_history);
    assert.equal(history[`孩子-EXCHANGE-${order.applyId}`],-500);assert.equal(debitCount(data),1);
    for(const altered of [{...history,[`孩子-EXCHANGE-${order.applyId}`]:0},{'孩子-BASE':2000},{...history,'孩子-EXCHANGE-forged':-3}]){
        await json(await request(f.code,'/',f.main,{...data,app_wheel_history:JSON.stringify(altered)},{'If-Match':response.headers.get('ETag'),'Idempotency-Key':crypto.randomUUID()}),403);
    }
    await json(await apply(f),409);
    const restored={...data,app_wheel_history:JSON.stringify({'孩子-BASE':2100,'孩子-EXCHANGE-fake':-1})};
    const merged=mergeSyncSnapshots(data,restored,data,{resolve:{app_wheel_history:'local'}});
    assert.equal(merged.conflicts.length,0);assert.deepEqual(JSON.parse(merged.data.app_wheel_history),{'孩子-BASE':2100,[`孩子-EXCHANGE-${order.applyId}`]:-500});
});
test('server validates balance, fixed quote and weekly accounting; cancel releases pending quota',async()=>{
    const f=await family(),limits={minGold:100,maxSingle:1000,maxWeekly:600,rateMicros:12345};
    await json(await request(f.code,'/exchange/limits',f.owner,{limits}));
    await json(await apply(f,terms()),409);await json(await apply(f,terms({rateMicros:12345,goldAmount:1001})),400);
    await json(await apply(f,terms({rateMicros:12345,goldAmount:700})),409);
    const order=await json(await apply(f,terms({rateMicros:12345})));assert.equal(order.cnyAmount,6.17);
    await json(await request(f.code,'/exchange/cancel',f.main,{applyId:order.applyId}));
    const next=await json(await apply(f,terms({rateMicros:12345})));assert.notEqual(next.applyId,order.applyId);
    const response=await read(f),data=await json(response);
    await json(await request(f.code,'/',f.main,{...data,app_wheel_history:'{"孩子-BASE":100}'},{'If-Match':response.headers.get('ETag'),'Idempotency-Key':crypto.randomUUID()}));
    await json(await request(f.code,'/exchange/verify',f.parent,{applyId:next.applyId,verifyCode:next.verifyCode}),409);
    assert.equal(debitCount(await json(await read(f))),0);
});
test('legacy gateway cannot bypass protected family through another code, order IDs, missing binding or global maintenance',async()=>{
    const map=new Map([['exchange:old',{id:'old',syncCode:'protected-family',status:'pending',verifyCode:'1234'}]]);
    const env={EXCHANGE_KV:{get:async k=>map.has(k)?JSON.stringify(map.get(k)):null},SYNC_SERVICE:{fetch:async input=>{
        const url=new URL(typeof input==='string'?input:input.url);
        if(url.pathname==='/auth/mode')return new Response(JSON.stringify({required:url.searchParams.get('code')==='protected-family'}));
        return new Response(JSON.stringify({error:'unauthorized'}),{status:401});
    }}};
    const call=(path,body)=>worker.fetch(new Request(`https://exchange.test${path}`,body?{method:'POST',body:JSON.stringify(body)}:{}),env);
    assert.equal((await call('/api/exchange/order?id=old&code=legacy-family')).status,403);
    const r=await call('/api/exchange/order?id=old');assert.equal(r.status,401);assert.equal(r.headers.get('X-Family-Auth'),'required');
    assert.equal((await call('/api/exchange/verify',{applyId:'old',verifyCode:'1234'})).status,401);
    assert.equal((await worker.fetch(new Request('https://exchange.test/api/exchange/status?code=test'),{})).status,503);
    assert.equal((await call('/api/price/update',{})).status,403);assert.equal((await call('/api/update-rate')).status,403);
    const f=await family(),live={EXCHANGE_KV:env.EXCHANGE_KV,SYNC_SERVICE:{fetch:async input=>{
        if(typeof input==='string')return mf.dispatchFetch(input);
        return mf.dispatchFetch(input.url,{method:input.method,headers:Object.fromEntries(input.headers),...(input.method==='POST'?{body:await input.text()}:{})});
    }}};
    const forwarded=(op,token,body)=>worker.fetch(new Request(`https://exchange.test/api/exchange/${op}`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({syncCode:f.code,...body})}),live);
    const order=await json(await forwarded('apply',f.main,terms()));
    await json(await forwarded('verify',f.parent,{applyId:order.applyId,verifyCode:order.verifyCode}));
    assert.equal(debitCount(await json(await read(f))),1);
});
test('shared balance covers historical entries, buffs and completion; pending intent survives refresh without changing amount',()=>{
    const tasks={孩子:[{id:'a',reward:2,targetCount:1,completedReward:5}]},checkins={孩子:{a:{'2026-10-01':[{t:1},{t:2}]}}};
    assert.equal(calculateGold(checkins,{'孩子-TASK-a-2026-10-01_1':4,'孩子-BASE':100},'孩子',{孩子:{investExpire:'2026-10-30',investMultiplier:2}},tasks),113);
    assert.equal(calculateGold(checkins,{'孩子-BASE':100},'孩子',{孩子:{investExpire:'invalid',investMultiplier:2}},tasks),109);
    const map=new Map(),store={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
    const a=pendingExchange('family','孩子',{goldAmount:500},store),b=pendingExchange('family','孩子',{goldAmount:900},store);assert.deepEqual(a,b);
    assert.throws(()=>pendingExchange('other','孩子',{}, {getItem:()=>null,setItem:()=>{throw Error('quota');}}),/quota/);
});
test('expired order cannot debit or consume weekly quota and the preview gate fails closed',async()=>{
    const old={id:'exs_old',childName:'孩子',goldAmount:500,verifyCode:'1234',status:'pending',createdAt:'2020-01-01T00:00:00Z',expiresAt:'2020-01-03T00:00:00Z'};
    const map=new Map([['exchange:order:exs_old',old],['exchange:index',['exs_old']]]);
    const tx={get:async k=>Array.isArray(k)?new Map(k.filter(k=>map.has(k)).map(k=>[k,map.get(k)])):map.get(k),put:async(k,v)=>map.set(k,v)};
    let debits=0;const family={env:{EXCHANGE_MODE:'preview',SYNC_MODE:'active'},access:{required:async()=>true,authorize:async()=>({id:'parent'})},initialize:async()=>{},refreshAccessSnapshot:async()=>{},exchangeSnapshot:async()=>({}),commitExchangeSnapshot:async()=>{debits++;},ctx:{storage:{transaction:fn=>fn(tx)}}};
    const service=new FamilyExchange(family);
    const req=()=>new Request('https://sync.test/exchange/verify?code=family',{method:'POST',body:JSON.stringify({applyId:old.id,verifyCode:old.verifyCode})});
    await assert.rejects(service.handle(req(),'family'),{code:'ORDER_FINAL'});assert.equal(debits,0);
    const status=await service.handle(new Request('https://sync.test/exchange/status?code=family'),'family');assert.equal(status.records[0].status,'expired');
    family.env.EXCHANGE_MODE='off';await assert.rejects(service.handle(req(),'family'),{code:'EXCHANGE_PAUSED'});
});
test('restart retains the settled order and debit; disabling exchange never reopens legacy settlement',async()=>{
    const f=await family(),order=await json(await apply(f)),body={applyId:order.applyId,verifyCode:order.verifyCode};
    await json(await request(f.code,'/exchange/verify',f.parent,body));
    await mf.dispose();mf=new Miniflare(persisted);
    assert.equal((await json(await request(f.code,'/exchange/verify',f.parent,body))).replayed,true);
    assert.equal(debitCount(await json(await read(f))),1);
    await mf.dispose();mf=new Miniflare({...persisted,bindings:{...options.bindings,EXCHANGE_MODE:'off'}});
    await json(await request(f.code,'/exchange/verify',f.parent,body),503);
    assert.equal(debitCount(await json(await read(f))),1);
});
