import {test,expect} from '@playwright/test';
import {Miniflare} from 'miniflare';
let mf,kv,sequence=0;
test.setTimeout(90000);
test.beforeAll(async()=>{
    mf=new Miniflare({modules:true,modulesRules:[{type:'ESModule',include:['**/*.js']}],scriptPath:'cloudflare-worker.js',
        compatibilityDate:'2026-07-30',durableObjects:{SYNC_FAMILIES:{className:'SyncFamily',useSQLite:true}},kvNamespaces:['DAKA_SYNC'],bindings:{SYNC_MODE:'active'}});
    kv=await mf.getKVNamespace('DAKA_SYNC');
});
test.afterAll(async()=>{await mf?.dispose();});
const pack=data=>Object.fromEntries(Object.entries(data).map(([k,v])=>[k,JSON.stringify(v)]));
async function family(){
    const code=`browser-family-${++sequence}`;
    const data=pack({app_profiles_v1:[{id:'c1',name:'孩子',theme:'rose'}],app_tasks_v2:{孩子:[{id:'math',name:'数学',frequencyType:'daily_must',reward:1}]},app_checkins_v2:{},
        app_wheel_history:{'孩子-BASE-1792000000000':100},app_achievements_v1:{孩子:{first_pot:1792000000000}},app_parent_actions_v1:[],app_evil_auto_trigger:false,
        app_gamification_config_v1:{redemptionEnabled:true,firstBloodEnabled:false},app_notified_levels:{孩子:1},
        app_weekend_settings:{enabled:false},app_user_city_v1:'厦门',
        app_authorized_parents_v1:{pairToken:'test-pair',devices:[{deviceId:'p1',role:'爸爸'},{deviceId:'p2',role:'爸爸'}]}});
    await kv.put(`sync:${code}`,JSON.stringify(data));return {code,data};
}
async function cloud(code){return (await mf.dispatchFetch(`https://sync.test/?code=${code}`)).json();}
function traffic(){return {dropWrites:false,gate:null,posts:[]};}
async function route(page,control){
    await page.route('**/*',async r=>{
        const request=r.request(),url=new URL(request.url());
        if(url.hostname==='127.0.0.1')return r.continue();
        if(url.hostname!=='sync.daka-tool.top')return r.abort();
        const options={method:request.method(),headers:request.headers()};
        if(options.method==='POST'){
            options.body=request.postData();control.posts.push(options);
            if(control.gate)await new Promise(resolve=>{const gate=control.gate;gate.waiters.push(resolve);if(gate.waiters.length===gate.count){control.gate=null;gate.waiters.forEach(r=>r());}});
        }
        const response=await mf.dispatchFetch(request.url(),options);
        if(options.method==='POST'&&control.dropWrites)return r.abort();
        await r.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});
    });
}
async function parent(browser,f,device,control){
    const page=await browser.newPage();await route(page,control);
    await page.addInitScript(({code,device})=>{
        localStorage.setItem('parent_sync_code',code);localStorage.setItem('parent_is_bound','true');
        localStorage.setItem('parent_device_id',device);localStorage.setItem('parent_role','爸爸');
    },{code:f.code,device});
    await page.goto('/parent.html');await expect(page.getByText('爸爸的护航手机',{exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'红包/扣款'})).toBeVisible();return page;
}
async function deduction(page,amount,reason){
    await page.getByRole('button',{name:'红包/扣款'}).click();
    await page.getByRole('button',{name:'发起账目扣款'}).click();
    await page.locator('input[type=number]').fill(String(amount));
    await page.getByPlaceholder('如: 共同分担家庭支出、违约责任扣除...').fill(reason);
}
async function child(browser,f,control){
    const page=await browser.newPage();await route(page,control);
    await page.clock.setFixedTime(new Date('2026-10-16T12:00:00+08:00'));
    await page.addInitScript(({code,data})=>{
        if(localStorage.getItem('sync_seeded'))return;
        localStorage.setItem('sync_seeded','1');localStorage.setItem('device_graphics_quality_v1','economy');
        for(const[k,v]of Object.entries(data))localStorage.setItem(k,v);
        localStorage.setItem('app_sync_code',JSON.stringify(code));
    },f);
    await page.goto('/');await page.waitForFunction(()=>window.storage?.getItem('_sync_checkpoint_v2'));
    return page;
}
const value=async(p,k)=>{
    await p.waitForFunction(key=>window.storage?.getItem(key)!==null,k,{timeout:10000}).catch(()=>{});
    return p.evaluate(key=>JSON.parse(window.storage.getItem(key)||'null'),k);
};
test('welcome sync retains the server baseline across refresh before any later upload',async({browser})=>{
    const f=await family(),page=await browser.newPage();await route(page,traffic());
    await page.clock.setFixedTime(new Date('2026-10-16T12:00:00+08:00'));
    await page.goto('/');
    await page.getByPlaceholder('例如: yolyhenry 或 family_xxxx').fill(f.code);
    await page.getByRole('button',{name:'立即同步已有数据并进入'}).click();
    await expect(page.locator('main')).toBeAttached();
    const checkpoint=await value(page,'_sync_checkpoint_v2');
    expect(checkpoint.code).toBe(f.code);expect(checkpoint.protocol).toBe(2);
    expect(checkpoint.data.app_wheel_history).toBe(f.data.app_wheel_history);
    await page.evaluate(()=>window.storage?.flush?.()).catch(()=>{});
    await page.reload();await expect(page.locator('main')).toBeAttached();
    expect((await value(page,'_sync_checkpoint_v2')).revision).toBeGreaterThanOrEqual(checkpoint.revision);
    await expect(page.getByRole('dialog',{name:'处理同步冲突'})).toHaveCount(0);
    await page.close();
});
test('two real parent pages race deductions; child sees both and refresh never repeats charges',async({browser})=>{
    const f=await family(),control=traffic(),a=await parent(browser,f,'p1',control),b=await parent(browser,f,'p2',control);
    await deduction(a,10,'并发扣款甲');await deduction(b,25,'并发扣款乙');
    control.gate={count:2,waiters:[]};
    await Promise.all([a.getByRole('button',{name:'扣除【孩子】10 金元宝'}).click(),b.getByRole('button',{name:'扣除【孩子】25 金元宝'}).click()]);
    await expect.poll(async()=>JSON.parse((await cloud(f.code)).app_parent_actions_v1).length).toBe(2);
    const c=await child(browser,f,traffic());
    const heading=c.getByRole('heading',{name:'【爸爸】下达扣款通知单'});await expect(heading).toBeVisible();
    const first=await c.getByText(/“并发扣款[甲乙]”/).textContent();
    await c.getByRole('button',{name:/我知道了/}).click();
    const second=await c.getByText(/“并发扣款[甲乙]”/).textContent();expect(first).not.toBe(second);
    await expect(c.getByText('65 💰',{exact:true})).toBeVisible();
    await c.reload();await expect(c.getByText(second,{exact:true})).toBeVisible();
    await c.getByRole('button',{name:/我知道了/}).click();
    await c.evaluate(()=>window.storage?.flush?.()).catch(()=>{});
    await c.reload();
    await expect(heading).toHaveCount(0);expect((await value(c,'app_stats_v1')).孩子.total_spent).toBe(35);
    expect(Object.keys(await value(c,'app_wheel_history')).filter(k=>k.includes('PARENT_DEDUCT'))).toHaveLength(2);
    await Promise.all([a.close(),b.close(),c.close()]);
});
test('parent lost responses persist one intent across reload and reconnect without a duplicate action',async({browser})=>{
    const f=await family(),control=traffic(),page=await parent(browser,f,'p1',control);
    await deduction(page,10,'响应丢失测试');control.dropWrites=true;
    await page.getByRole('button',{name:'扣除【孩子】10 金元宝'}).click();
    await expect.poll(()=>control.posts.length).toBeGreaterThanOrEqual(3);
    await expect(page.getByRole('button',{name:'重试确认'})).toBeVisible();
    expect(JSON.parse((await cloud(f.code)).app_parent_actions_v1)).toHaveLength(1);
    control.dropWrites=false;await page.reload();
    await expect.poll(()=>page.evaluate(code=>localStorage.getItem(`parent_pending_sync_v2:${code}`),f.code)).toBe(null);
    expect(JSON.parse((await cloud(f.code)).app_parent_actions_v1)).toHaveLength(1);
    expect(new Set(control.posts.slice(0,3).map(p=>p.headers['idempotency-key'])).size).toBe(1);
    await page.close();
});
test('real main pages keep same-field conflicts through reload, then resolve without overwriting unrelated data',async({browser})=>{
    const f=await family(),control=traffic(),a=await child(browser,f,control),b=await child(browser,f,control);
    const edit=async(page,city)=>page.evaluate(async city=>{
        const {commitDurable}=await import('/src/utils/storage.js');
        commitDurable({app_user_city_v1:JSON.stringify(city)});await window.storage.flush();window.triggerSyncUpload();
    },city);
    control.gate={count:2,waiters:[]};await Promise.all([edit(a,'上海'),edit(b,'北京')]);
    const dialog=page=>page.getByRole('dialog',{name:'处理同步冲突'});
    await expect.poll(async()=>await dialog(a).count()+await dialog(b).count()).toBeGreaterThan(0);
    const loser=await dialog(a).count()?a:b, city=(await value(loser,'app_user_city_v1'));
    await loser.reload();await expect(dialog(loser)).toBeVisible();
    await loser.getByRole('button',{name:'冲突部分保留本机'}).click();await expect(dialog(loser)).toHaveCount(0);
    await expect.poll(async()=>JSON.parse((await cloud(f.code)).app_user_city_v1)).toBe(city);
    expect(JSON.parse((await cloud(f.code)).app_wheel_history)['孩子-BASE-1792000000000']).toBe(100);
    await Promise.all([a.close(),b.close()]);
});
