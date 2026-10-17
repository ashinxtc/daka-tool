import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Miniflare} from 'miniflare';
import {mintActivation,randomToken} from '../server/family-access.js';
import {floatingPrice} from '../shared/exchange-pricing.js';

test('floating formula preserves legacy upward/downward markets and minimum floor',()=>{
    for(const current of [.12,.149,.16,.2])for(const previous of [.13,.15,.19])for(const cents of [1,6.8,10]){
        const input={currentUsd:current,baseUsd:.14918,baseCentsPerGold:cents,amplifier:10,realRateToday:current,realRateYesterday:previous};
        const expected=Math.max(.001,current/.14918*(1+(current/previous-1)*10)*cents/100);
        assert.equal(floatingPrice(input).rateMicros,Math.round(expected*1e6));
    }
    assert.throws(()=>floatingPrice({currentUsd:NaN}));
});

test('real DO quotes reject forgery, expiry and changed settings; receipt replay and settlement lock original price',async()=>{
    let usd=.15,unavailable=false;
    const secret='floating-market-test-only-bootstrap-secret',code='floating-test';
    const mf=new Miniflare({modules:true,modulesRules:[{type:'ESModule',include:['**/*.js']}],scriptPath:'cloudflare-worker.js',compatibilityDate:'2026-07-30',
        durableObjects:{SYNC_FAMILIES:{className:'SyncFamily',useSQLite:true}},kvNamespaces:['DAKA_SYNC'],
        serviceBindings:{EXCHANGE_MARKET_SERVICE:async request=>{assert.equal(new URL(request.url).pathname,'/api/rate');assert.equal(request.headers.get('Authorization'),null);return unavailable?new Response('',{status:503}):Response.json({ok:true,rate:{rates:{USD:usd}}});}},
        bindings:{SYNC_MODE:'active',AUTH_MODE:'enforced',EXCHANGE_MODE:'preview',AUTH_BOOTSTRAP_SECRET:secret}});
    const call=async(path,token,body,status=200)=>{const r=await mf.dispatchFetch(`https://sync.test${path}?code=${code}`,{method:body?'POST':'GET',headers:token?{Authorization:`Bearer ${token}`}:{},...(body?{body:JSON.stringify(body)}:{})});assert.equal(r.status,status,await r.clone().text());return r.json();};
    try{
        const kv=await mf.getKVNamespace('DAKA_SYNC');
        await kv.put(`sync:${code}`,JSON.stringify({app_profiles_v1:'[{"name":"孩子"}]',app_wheel_history:'{"孩子-BASE":5000}',app_tasks_v2:'{}',app_checkins_v2:'{}',app_exchange_base_cents:'6.8',app_exchange_base_rate:'{"rates":{"USD":0.15}}',app_exchange_volatility:JSON.stringify({amplifier:10,realRateToday:.15,realRateYesterday:.149,todayDate:new Date(Date.now()+8*3600000).toISOString().slice(0,10)})}));
        const owner=randomToken(),main=randomToken(),parent=randomToken();
        await call('/auth/claim',null,{token:owner,voucher:await mintActivation(secret,code)});
        for(const [role,token]of [['main',main],['parent',parent]]){const g=await call('/auth/invite',owner,{role,label:role});await call('/auth/redeem',null,{invite:g.invite,token});}
        const suggested=await call('/exchange/limits',owner);assert.equal(suggested.configured,false);assert.equal(suggested.limits.baseCentsPerGold,6.8);
        const config=suggested.limits;
        await call('/exchange/limits',main,{limits:config},403);
        await call('/exchange/limits',owner,{limits:config});
        const quote=(await call('/exchange/limits',main)).limits;
        assert.equal(quote.rateMicros,floatingPrice({currentUsd:.15,baseUsd:.15,baseCentsPerGold:6.8,amplifier:10,realRateToday:.15,realRateYesterday:.149}).rateMicros);
        assert.notEqual(quote.dailyChange,0);
        const terms={operationId:`exs_${crypto.randomUUID()}`,childName:'孩子',goldAmount:500,rateMicros:quote.rateMicros,quoteId:quote.quoteId};
        await call('/exchange/apply',main,{...terms,rateMicros:1},409);
        await call('/exchange/apply',main,{...terms,quoteId:'forged'},409);
        await call('/exchange/limits',owner,{limits:config});
        await call('/exchange/apply',main,terms,409);
        const fresh=(await call('/exchange/limits',main)).limits;Object.assign(terms,{quoteId:fresh.quoteId,rateMicros:fresh.rateMicros});
        const first=await call('/exchange/apply',main,terms);
        usd=.16;const changed=(await call('/exchange/limits',main)).limits;assert.notEqual(changed.rateMicros,first.record.rateMicros);
        await call('/exchange/limits',owner,{limits:{...config,baseCentsPerGold:7}});
        unavailable=true;await call('/exchange/limits',main,undefined,503);
        const retry=await call('/exchange/apply',main,terms);assert.equal(retry.replayed,true);assert.equal(retry.cnyAmount,first.cnyAmount);
        const settled=await call('/exchange/verify',parent,{applyId:first.applyId,verifyCode:first.verifyCode});assert.equal(settled.record.cnyAmount,first.cnyAmount);
        await call('/exchange/verify',parent,{applyId:first.applyId,verifyCode:first.verifyCode});
        const data=await call('/',main);assert.equal(JSON.parse(data.app_wheel_history)[`孩子-EXCHANGE-${first.applyId}`],-500);
    }finally{await mf.dispose();}
});


test('expired floating quote cannot create an order',async()=>{
    const {FamilyExchange}=await import('../server/family-exchange.js');
    const values=new Map([['exchange:limits',{minGold:1,pricingMode:'floating'}],['exchange:quotes',{expired:{deviceId:'main',expiresAt:Date.now()-1,rateMicros:10000}}]]);
    let writes=0;const tx={get:async key=>values.get(key),put:async()=>{writes++;}};
    const family={env:{EXCHANGE_MODE:'preview',SYNC_MODE:'active'},access:{required:async()=>true,authorize:async()=>({id:'main'})},initialize:async()=>{},refreshAccessSnapshot:async()=>{},exchangeSnapshot:async()=>({app_profiles_v1:'[{"name":"孩子"}]'}),ctx:{storage:{transaction:fn=>fn(tx)}}};
    const body={operationId:`exs_${crypto.randomUUID()}`,childName:'孩子',goldAmount:500,quoteId:'expired',rateMicros:10000};
    await assert.rejects(new FamilyExchange(family).handle(new Request('https://sync.test/exchange/apply',{method:'POST',body:JSON.stringify(body)}),'family'),{code:'QUOTE_CHANGED'});
    assert.equal(writes,0);
});
