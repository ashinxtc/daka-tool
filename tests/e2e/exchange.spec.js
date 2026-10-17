import {test,expect} from '@playwright/test';
import {Miniflare} from 'miniflare';
import {mintActivation,randomToken} from '../../server/family-access.js';
let mf,kv;const secret='browser-exchange-secret-test-only-isolated';
test.setTimeout(90000);
test.beforeAll(async()=>{mf=new Miniflare({modules:true,modulesRules:[{type:'ESModule',include:['**/*.js']}],scriptPath:'cloudflare-worker.js',compatibilityDate:'2026-07-30',durableObjects:{SYNC_FAMILIES:{className:'SyncFamily',useSQLite:true}},kvNamespaces:['DAKA_SYNC'],bindings:{SYNC_MODE:'active',AUTH_MODE:'enforced',EXCHANGE_MODE:'preview',AUTH_BOOTSTRAP_SECRET:secret}});kv=await mf.getKVNamespace('DAKA_SYNC');});
test.afterAll(async()=>{await mf?.dispose();});
async function api(f,path,role='main',body){const r=await mf.dispatchFetch(`https://sync.daka-tool.top${path}${path.includes('?')?'&':'?'}code=${f.code}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${f[role]?.token||f[role]}`},...(body?{body:JSON.stringify(body)}:{})});expect(r.status,await r.clone().text()).toBe(200);return r.json();}
async function family(){
    const f={code:`ex-browser-${crypto.randomUUID().slice(0,8)}`,owner:randomToken()};
    f.data=Object.fromEntries(Object.entries({app_profiles_v1:[{id:'c1',name:'孩子',theme:'rose'}],app_tasks_v2:{孩子:[{id:'math',name:'数学',frequencyType:'daily_must',reward:1}]},app_checkins_v2:{},app_wheel_history:{'孩子-BASE-1792000000000':1500},app_achievements_v1:{孩子:{first_pot:1792000000000,tycoon:1792000000000}},app_parent_actions_v1:[],app_evil_auto_trigger:false,app_gamification_config_v1:{redemptionEnabled:true,firstBloodEnabled:false},app_notified_levels:{孩子:100},app_weekend_settings:{enabled:false},app_user_city_v1:'厦门'}).map(([k,v])=>[k,JSON.stringify(v)]));
    await kv.put(`sync:${f.code}`,JSON.stringify(f.data));await api(f,'/auth/claim','owner',{token:f.owner,voucher:await mintActivation(secret,f.code)});
    for(const role of ['main','parent']){const g=await api(f,'/auth/invite','owner',{role,label:'爸爸'}),token=randomToken();const d=await api(f,'/auth/redeem','owner',{invite:g.invite,token});f[role]={...d,token};}
    await api(f,'/exchange/limits','owner',{limits:{minGold:500,maxSingle:0,maxWeekly:0,rateMicros:10000}});return f;
}
async function route(page,control={}){
    await page.route('**/*',async r=>{const req=r.request(),u=new URL(req.url());
        if(u.hostname==='127.0.0.1'){if(u.pathname.startsWith('/api/'))return r.fulfill({json:{ok:false}});return r.continue();}
        if(u.hostname!=='sync.daka-tool.top')return r.abort();
        if(control.offline)return r.abort();
        const options={method:req.method(),headers:req.headers()};if(req.method()==='POST')options.body=req.postData();
        const response=await mf.dispatchFetch(req.url(),options);
        if(control.dropApply&&u.pathname==='/exchange/apply')return r.abort();
        if(control.dropVerify&&u.pathname==='/exchange/verify')return r.abort();
        await r.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});
    });
}
async function main(browser,f,control){const p=await browser.newPage();await route(p,control);await p.clock.setFixedTime(new Date('2026-10-16T12:00:00+08:00'));
    await p.addInitScript(f=>{if(localStorage.getItem('ex_seed'))return;localStorage.setItem('ex_seed','1');for(const[k,v]of Object.entries(f.data))localStorage.setItem(k,v);localStorage.setItem('app_sync_code',JSON.stringify(f.code));localStorage.setItem('device_graphics_quality_v1','economy');localStorage.setItem(`daka_device_access_v1:main:${f.code}`,JSON.stringify(f.main));},f);
    await p.goto('/');await p.waitForFunction(()=>window.storage?.getItem('_sync_checkpoint_v2'));await p.locator('button[title="兑换零花钱"]:visible').first().click();return p;
}
async function submit(p){await p.getByRole('button',{name:/按金元宝数量/}).click();await p.getByPlaceholder('500',{exact:true}).fill('500');await p.getByRole('button',{name:/申请兑换.*500.*元宝/}).click();}
test('real exchange UI recovers lost application response; QR details come from server and settlement survives reload',async({browser})=>{
    const f=await family(),control={dropApply:true},c=await main(browser,f,control);await submit(c);
    await expect.poll(async()=> (await api(f,'/exchange/status')).records.length).toBe(1);
    const order=(await api(f,'/exchange/status')).records[0];expect(order.goldAmount).toBe(500);
    expect(await c.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('app_offline_exchange')&&(localStorage.getItem(k)||'').includes('ex_local_')))).toBe(false);
    control.dropApply=false;await c.reload();await c.locator('button[title="兑换零花钱"]:visible').first().click();
    await expect(c.getByText(order.verifyCode,{exact:true}).first()).toBeVisible();
    await expect.poll(()=>c.evaluate(code=>localStorage.getItem(`daka_exchange_intent_v1:${code}:孩子`),f.code)).toBe(null);
    const p=await browser.newPage(),pc={dropVerify:true};await route(p,pc);
    await p.addInitScript(f=>localStorage.setItem(`daka_device_access_v1:parent:${f.code}`,JSON.stringify(f.parent)),f);
    await p.goto(`/exchange-verify.html?family=${f.code}&id=${order.id}&secure=1&gold=1&cny=99999&child=伪造孩子`);
    await expect(p.locator('#childName')).toHaveText('孩子');await expect(p.locator('#cnyAmount')).toHaveText('5 元');
    p.on('dialog',d=>d.accept(order.verifyCode));await p.locator('#confirmBtn').click();
    await expect(p.getByRole('status')).toContainText('未确认成功');pc.dropVerify=false;await p.reload();
    await expect(p.getByRole('status')).toContainText('核销成功');
    await c.reload();await c.waitForFunction(()=>JSON.parse(window.storage?.getItem('app_wheel_history')||'{}')&&Object.keys(JSON.parse(window.storage.getItem('app_wheel_history')||'{}')).some(k=>k.includes('-EXCHANGE-')));
    expect(await c.evaluate(()=>Object.values(JSON.parse(window.storage.getItem('app_wheel_history'))).reduce((s,v)=>s+v,0))).toBe(1000);
    await c.evaluate(async()=>{const {commitDurable}=await import('/src/utils/storage.js');const h=JSON.parse(window.storage.getItem('app_wheel_history'));for(const k of Object.keys(h))if(k.includes('-EXCHANGE-'))delete h[k];commitDurable({app_wheel_history:JSON.stringify(h)});await window.storage.flush();});
    await c.reload();await expect.poll(()=>c.evaluate(()=>Object.values(JSON.parse(window.storage?.getItem('app_wheel_history')||'{}')).reduce((s,v)=>s+v,0))).toBe(1000);
    expect(Object.values(JSON.parse((await api(f,'/')).app_wheel_history)).reduce((s,v)=>s+v,0)).toBe(1000);
    await Promise.all([c.close(),p.close()]);
});
test('unpaired verification stays blocked and offline cancellation keeps the order pending',async({browser})=>{
    const f=await family(),control={},c=await main(browser,f,control);await submit(c);
    await expect.poll(async()=> (await api(f,'/exchange/status')).records.length).toBe(1);
    const order=(await api(f,'/exchange/status')).records[0],p=await browser.newPage();await route(p);
    await p.goto(`/exchange-verify.html?family=${f.code}&id=${order.id}&secure=1`);
    await expect(p.locator('#confirmBtn')).toBeDisabled();await expect(p.getByRole('status')).toContainText('授权');
    control.offline=true;
    await c.getByRole('button',{name:/撤销.*申请|撤销重新/}).first().click();
    await expect(c.getByText(/未确认撤销/)).toBeVisible();
    expect((await api(f,'/exchange/status')).records[0].status).toBe('pending');
    await expect(c.getByText(order.verifyCode,{exact:true}).first()).toBeVisible();
    control.offline=false;await Promise.all([c.close(),p.close()]);
});
