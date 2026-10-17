import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {Miniflare} from 'miniflare';
import worker from '../push-worker.js';
import {mintActivation,randomToken} from '../server/family-access.js';
import {signService} from '../server/service-identity.js';
import {readPushProjection,subscriptions,validateSubscription} from '../server/push-access.js';
import {pushRequest} from '../src/utils/pushTransport.js';
const secret='isolated-push-tests-service-secret-32',bootstrap='isolated-push-tests-bootstrap-secret';
let mf,kv;
before(async()=>{mf=new Miniflare({modules:true,modulesRules:[{type:'ESModule',include:['**/*.js']}],scriptPath:'cloudflare-worker.js',compatibilityDate:'2026-07-30',durableObjects:{SYNC_FAMILIES:{className:'SyncFamily',useSQLite:true}},kvNamespaces:['DAKA_SYNC'],bindings:{SYNC_MODE:'active',AUTH_MODE:'enforced',AUTH_BOOTSTRAP_SECRET:bootstrap,PUSH_SERVICE_SECRET:secret}});kv=await mf.getKVNamespace('DAKA_SYNC');});
after(()=>mf.dispose());
const api=(code,path,token,body)=>mf.dispatchFetch(`https://sync.test${path}${path.includes('?')?'&':'?'}code=${code}`,{method:body?'POST':'GET',headers:token?{Authorization:`Bearer ${token}`}:{},...(body?{body:JSON.stringify(body)}:{})});
const service={fetch:async input=>mf.dispatchFetch(input.url,{method:input.method,headers:Object.fromEntries(input.headers)})};
async function family(){
    const code=`push-${crypto.randomUUID().slice(0,8)}`,owner=randomToken(),main=randomToken();
    await kv.put(`sync:${code}`,JSON.stringify({app_profiles_v1:'[{"name":"孩子"},{"name":"姐姐"}]',app_tasks_v2:JSON.stringify({孩子:[{id:'task',name:'private task title',frequencyType:'daily_must'}],姐姐:[{id:'other'}]}),app_checkins_v2:JSON.stringify({孩子:{task:{'2026-10-17':[{note:'private'}]}}}),app_deepseek_api_key:'"must-not-leak"',app_wheel_history:'{"孩子-BASE":1000}'}));
    assert.equal((await api(code,'/auth/claim',null,{token:owner,voucher:await mintActivation(bootstrap,code)})).status,200);
    const invite=await(await api(code,'/auth/invite',owner,{role:'main',label:'平板'})).json();
    const device=await(await api(code,'/auth/redeem',null,{invite:invite.invite,token:main})).json();
    return {code,owner,main,id:device.id};
}
test('service is scoped to signed route, family, child and device; projection excludes secrets and other children',async()=>{
    const f=await family(),env={SYNC_SERVICE:service,PUSH_SERVICE_SECRET:secret};
    const raw=await readPushProjection(env,f.code,'孩子',f.id),data=JSON.parse(raw);
    assert.deepEqual(Object.keys(data).sort(),['app_checkins_v2','app_tasks_v2']);
    assert.ok(!/must-not-leak|private|姐姐|BASE/.test(raw));
    const url=`https://sync.test/services/push?code=${f.code}&child=孩子&device=${f.id}`;
    const headers=await signService(url,secret);
    assert.equal((await mf.dispatchFetch(url,{headers})).status,200);
    assert.equal((await mf.dispatchFetch(url.replace('child=孩子','child=姐姐'),{headers})).status,401);
    assert.equal((await mf.dispatchFetch(url,{headers:await signService(url,secret,Date.now()-120000)})).status,401);
    assert.equal((await api(f.code,'/',null)).status,401);
    assert.equal((await mf.dispatchFetch(`https://sync.test/?code=${f.code}`,{headers})).status,401);
    await api(f.code,'/auth/revoke',f.owner,{id:f.id});
    await assert.rejects(readPushProjection(env,f.code,'孩子',f.id),{status:403});
});
test('subscriptions require current family device, are device-scoped and never persist device tokens',async()=>{
    const f=await family(),other=await family(),map=new Map();
    const env={SYNC_SERVICE:service,PUSH_SERVICE_SECRET:secret,PUSH_KV:{put:async(k,v)=>map.set(k,v),get:async k=>map.get(k),delete:async k=>map.delete(k)}};
    const subscription={endpoint:'https://web.push.apple.com/test',keys:{p256dh:'A'.repeat(87),auth:'B'.repeat(22)}};
    const call=(token,code=f.code,op='subscribe')=>worker.fetch(new Request(`https://push.test/api/${op}`,{method:'POST',headers:token?{Authorization:`Bearer ${token}`}:{},body:JSON.stringify({syncCode:code,childName:'孩子',subscription})}),env);
    assert.equal((await call(null)).status,401);assert.equal((await call(other.main)).status,401);assert.equal((await call(f.owner)).status,403);
    const response=await call(f.main);assert.equal(response.status,200);assert.equal(response.headers.get('X-Family-Auth'),'required');
    assert.equal(map.size,1);assert.ok([...map.keys()][0].endsWith(f.id));assert.ok(![...map.values()][0].includes(f.main));
    const status=endpoint=>worker.fetch(new Request('https://push.test/api/push-status',{method:'POST',headers:{Authorization:`Bearer ${f.main}`},body:JSON.stringify({syncCode:f.code,childName:'孩子',endpoint})}),env);
    assert.equal((await(await status(subscription.endpoint)).json()).subscribed,true);
    assert.equal((await(await status('https://web.push.apple.com/other')).json()).subscribed,false);
    assert.equal((await call(f.main)).status,200);assert.equal(map.size,1);
    assert.equal((await call(f.main,f.code,'unsubscribe')).status,200);assert.equal(map.size,0);
    assert.equal((await(await status(subscription.endpoint)).json()).subscribed,false);
    assert.equal((await worker.fetch(new Request('https://push.test/api/cron-check'),env)).status,403);
    assert.equal((await worker.fetch(new Request('https://push.test/api/test-vapid'),env)).status,403);
    await api(f.code,'/auth/revoke',f.owner,{id:f.id});assert.equal((await call(f.main)).status,401);
});
test('push targets reject arbitrary hosts and enumeration handles pagination',async()=>{
    for(const endpoint of ['https://localhost/','http://web.push.apple.com/test','https://web.push.apple.com.evil.test/','https://user@web.push.apple.com/'])assert.throws(()=>validateSubscription({endpoint}),{status:400});
    const keys=[];for await(const k of subscriptions({list:async({cursor})=>cursor?{keys:[{name:'two'}],list_complete:true}:{keys:[{name:'one'}],list_complete:false,cursor:'next'}},'push_sub:'))keys.push(k.name);
    assert.deepEqual(keys,['one','two']);
});
test('client confirms subscription receipt and refuses protected downgrade or server failure',async()=>{
    const body={syncCode:'family'},access={credential:()=>({token:'test-token'}),required:()=>true,rememberRequired:()=>{}};
    let received;const options={access,endpoint:'https://push.test',fetchImpl:async(url,opts)=>{received={url,opts};return new Response('{"ok":true}',{headers:{'X-Family-Auth':'required'}});}};
    assert.deepEqual(await pushRequest('subscribe',body,options),{ok:true});assert.equal(received.opts.headers.Authorization,'Bearer test-token');assert.equal(received.opts.redirect,'error');
    for(const response of [new Response('{"ok":true}'),new Response('{"error":"not saved"}',{status:503,headers:{'X-Family-Auth':'required'}})])await assert.rejects(pushRequest('subscribe',body,{...options,fetchImpl:async()=>response}));
});
