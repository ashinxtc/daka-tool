import {test,expect} from '@playwright/test';
import {Miniflare} from 'miniflare';
import {mintActivation,randomToken} from '../../server/family-access.js';
let mf,kv,sequence=0;
const secret='isolated-browser-activation-secret-never-production';
test.setTimeout(90000);
test.beforeAll(async()=>{
    mf=new Miniflare({modules:true,modulesRules:[{type:'ESModule',include:['**/*.js']}],scriptPath:'cloudflare-worker.js',
        compatibilityDate:'2026-07-30',durableObjects:{SYNC_FAMILIES:{className:'SyncFamily',useSQLite:true}},kvNamespaces:['DAKA_SYNC'],
        bindings:{SYNC_MODE:'active',AUTH_MODE:'enforced',AUTH_BOOTSTRAP_SECRET:secret}});
    kv=await mf.getKVNamespace('DAKA_SYNC');
});
test.afterAll(async()=>{await mf?.dispose();});
async function api(code,path,token,body){
    const r=await mf.dispatchFetch(`https://sync.daka-tool.top${path}?code=${code}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
    expect(r.status).toBe(200);return r.json();
}
async function family(){
    const code=`secure-browser-${++sequence}`,owner=randomToken();
    const data=Object.fromEntries(Object.entries({app_profiles_v1:[{id:'c1',name:'孩子',theme:'rose'}],app_tasks_v2:{孩子:[{id:'math',name:'数学',frequencyType:'daily_must',reward:1}]},app_checkins_v2:{},
        app_wheel_history:{'孩子-BASE-1792000000000':100},app_achievements_v1:{孩子:{first_pot:1792000000000}},app_parent_actions_v1:[],app_evil_auto_trigger:false,
        app_gamification_config_v1:{redemptionEnabled:true,firstBloodEnabled:false},app_notified_levels:{孩子:1},app_weekend_settings:{enabled:false},app_user_city_v1:'厦门',
        app_settings_password:'private-local-password',app_authorized_parents_v1:{pairToken:'legacy-token',devices:[{deviceId:'old',role:'爸爸'}]}
    }).map(([k,v])=>[k,JSON.stringify(v)]));
    await kv.put(`sync:${code}`,JSON.stringify(data));
    await api(code,'/auth/claim','',{token:owner,voucher:await mintActivation(secret,code)});
    return {code,owner,data};
}
async function route(page,control={}){
    await page.route('**/*',async r=>{
        const req=r.request(),url=new URL(req.url());
        if(url.hostname==='127.0.0.1')return r.continue();
        if(url.hostname!=='sync.daka-tool.top')return r.abort();
        control.urls?.push(req.url());
        const options={method:req.method(),headers:req.headers()};
        if(options.method==='POST')options.body=req.postData();
        const response=await mf.dispatchFetch(req.url(),options);
        const reply={status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()};
        if(control.pauseCheck&&url.pathname==='/auth/check'){control.checkReceived=true;await new Promise(resolve=>{control.releaseCheck=resolve;});}
        if(control.dropRedeem&&url.pathname==='/auth/redeem')return r.abort();
        await r.fulfill(reply);
    });
}
async function pair(page,f,role){
    const grant=await api(f.code,'/auth/invite',f.owner,{role,label:'爸爸'});
    await page.goto(`/security.html?code=${f.code}#invite=${grant.invite}&role=${role}`);
    await expect(page).toHaveURL(new RegExp(`security.html\\?code=${f.code}$`));
    await page.getByRole('button',{name:'配对 / 重试待确认配对',exact:true}).click();
    return grant;
}
test('owner activation UI requires saved key, creates fragment invite and never persists owner secret',async({page})=>{
    const control={};await route(page,control);const code=`owner-ui-${++sequence}`;
    await page.goto(`/security.html?code=${code}`);
    await page.getByText('首次激活 / 管理员恢复',{exact:true}).click();
    await page.getByLabel('激活或恢复凭证').fill(await mintActivation(secret,code));
    await page.getByRole('button',{name:'生成新的管理密钥'}).click();
    const token=await page.getByLabel('待保存管理密钥').inputValue();
    await expect(page.getByRole('button',{name:'确认激活或恢复'})).toBeDisabled();
    await page.getByLabel('我已将管理密钥保存到安全位置').check();
    await page.getByRole('button',{name:'确认激活或恢复'}).click();
    await expect(page.getByRole('button',{name:'锁定管理页面'})).toBeVisible();
    await page.getByLabel('设备用途').selectOption('parent');
    await page.getByRole('button',{name:'生成限时邀请'}).click();
    await expect(page.getByLabel('邀请链接')).toHaveValue(/#invite=[a-f0-9]{64}&role=parent$/);
    expect(await page.evaluate(()=>JSON.stringify({...localStorage}))).not.toContain(token);
    await page.reload();await expect(page.getByRole('button',{name:'解锁管理'})).toBeVisible();
    await expect(page.getByLabel('管理密钥',{exact:true})).toHaveValue('');
    control.pauseCheck=true;await page.getByLabel('管理密钥',{exact:true}).fill(token);
    await page.getByRole('button',{name:'解锁管理'}).click();await expect.poll(()=>control.checkReceived).toBe(true);
    await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));control.releaseCheck();
    await expect(page.getByRole('status')).toHaveText('管理页面已锁定，请重新解锁。');
    await expect(page.getByRole('button',{name:'锁定管理页面'})).toHaveCount(0);
});
test('lost pairing receipt survives refresh with same identity; revocation cannot self-register',async({page})=>{
    const f=await family(),control={dropRedeem:true,urls:[]};await route(page,control);
    const grant=await pair(page,f,'parent');
    await expect(page.getByRole('status')).not.toContainText('正在确认');
    const pending=await page.evaluate(code=>JSON.parse(localStorage.getItem(`daka_pair_pending_v1:parent:${code}`)),f.code);
    expect(pending.invite).toBe(grant.invite);expect(control.urls.every(u=>!u.includes(grant.invite))).toBe(true);
    control.dropRedeem=false;await page.reload();
    await page.getByLabel('设备用途').selectOption('parent');
    await page.getByRole('button',{name:'配对 / 重试待确认配对',exact:true}).click();
    await expect(page.getByRole('button',{name:'进入家长看板'})).toBeVisible();
    const saved=await page.evaluate(code=>JSON.parse(localStorage.getItem(`daka_device_access_v1:parent:${code}`)),f.code);
    expect(saved.token).toBe(pending.token);
    expect((await api(f.code,'/auth/devices',f.owner)).devices.filter(d=>d.role==='parent')).toHaveLength(1);
    await page.getByRole('button',{name:'进入家长看板'}).click();
    await expect(page.getByRole('button',{name:'红包/扣款'})).toBeVisible();
    await api(f.code,'/auth/revoke',f.owner,{id:saved.id});await page.reload();
    await expect(page.getByRole('button',{name:'红包/扣款'})).toHaveCount(0);
    await expect(page.getByRole('link',{name:/配对/})).toBeVisible();
    expect((await api(f.code,'/auth/devices',f.owner)).devices.filter(d=>d.role==='parent'&&!d.revokedAt)).toHaveLength(0);
});
test('paired main and parent execute two deductions exactly once while keeping secrets local',async({browser})=>{
    const f=await family(),p=await browser.newPage(),c=await browser.newPage();await route(p);await route(c);
    await pair(p,f,'parent');await p.getByRole('button',{name:'进入家长看板'}).click();
    await expect(p.getByRole('button',{name:'红包/扣款'})).toBeVisible();
    const parentToken=await p.evaluate(code=>JSON.parse(localStorage.getItem(`daka_device_access_v1:parent:${code}`)).token,f.code);
    for(const [amount,reason]of [[10,'授权扣款甲'],[25,'授权扣款乙']]){
        await p.getByRole('button',{name:'红包/扣款'}).click();await p.getByRole('button',{name:'发起账目扣款'}).click();
        await p.locator('input[type=number]').fill(String(amount));await p.getByPlaceholder('如: 共同分担家庭支出、违约责任扣除...').fill(reason);
        await p.getByRole('button',{name:`扣除【孩子】${amount} 金元宝`}).click();
        await expect.poll(async()=>JSON.parse((await api(f.code,'/',parentToken)).app_parent_actions_v1).length).toBe(amount===10?1:2);
    }
    await pair(c,f,'main');await expect(c.getByRole('button',{name:'进入主程序'})).toBeVisible();
    await c.evaluate(({code,data})=>{
        for(const[k,v]of Object.entries(data))localStorage.setItem(k,v);
        localStorage.setItem('app_sync_code',JSON.stringify(code));localStorage.setItem('device_graphics_quality_v1','economy');
    },f);
    await c.clock.setFixedTime(new Date('2026-10-16T12:00:00+08:00'));
    // Start the notice assertion after the first authoritative pull, not while
    // Vite is still loading the main bundle. CI trace 38997337041 received this
    // response at 4.8s; its failure snapshot already contained the first notice.
    const firstPull=c.waitForResponse(response=>{
        const url=new URL(response.url());
        return url.hostname==='sync.daka-tool.top'&&url.pathname==='/'&&
            url.searchParams.get('code')===f.code&&response.request().method()==='GET'&&response.status()===200;
    });
    await c.getByRole('button',{name:'进入主程序'}).click();
    await firstPull;
    await expect(c.getByRole('heading',{name:'【爸爸】下达扣款通知单'})).toBeVisible();
    await expect(c.getByText('“授权扣款甲”',{exact:true})).toBeVisible();
    await c.getByRole('button',{name:/我知道了/}).click();await expect(c.getByText('“授权扣款乙”',{exact:true})).toBeVisible();
    await expect(c.getByText('65 💰',{exact:true})).toBeVisible();
    await c.reload();await expect(c.getByText('“授权扣款乙”',{exact:true})).toBeVisible();
    await c.getByRole('button',{name:/我知道了/}).click();await c.reload();
    await expect(c.getByRole('heading',{name:'【爸爸】下达扣款通知单'})).toHaveCount(0);
    await c.waitForFunction(()=>window.storage?.getItem('app_stats_v1'));
    expect(await c.evaluate(()=>JSON.parse(window.storage.getItem('app_stats_v1')).孩子.total_spent)).toBe(35);
    expect(await c.evaluate(()=>JSON.parse(window.storage.getItem('app_settings_password')))).toBe('private-local-password');
    const snapshot=await api(f.code,'/',parentToken);expect(snapshot.app_settings_password).toBeUndefined();
    expect(JSON.parse(snapshot.app_authorized_parents_v1).securityVersion).toBe(1);
    expect(JSON.stringify(snapshot)).not.toContain('daka_device_access');
    const parents=(await api(f.code,'/auth/devices',f.owner)).devices.filter(d=>d.role==='parent');
    await api(f.code,'/auth/revoke',f.owner,{id:parents[0].id});await c.reload();
    await expect.poll(()=>c.evaluate(()=>JSON.parse(window.storage?.getItem('app_authorized_parents_v1')||'{}').devices?.length)).toBe(0);
    expect(await c.evaluate(()=>JSON.parse(window.storage.getItem('app_authorized_parents_v1')).pairToken)).toBe('');
    await Promise.all([p.close(),c.close()]);
});
