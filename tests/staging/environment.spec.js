import {test,expect} from '@playwright/test';
const sync='https://daka-sync-staging.2378385593.workers.dev';
const exchange='https://daka-exchange-staging.2378385593.workers.dev';
test('built child and parent startup contact only the isolated sync service',async({browser})=>{
    for(const entry of ['/', '/parent.html']){
        const page=await browser.newPage();const external=[];
        await page.route('**/*',async route=>{
            const url=new URL(route.request().url());
            if(url.hostname==='127.0.0.1')return route.continue();
            external.push(url.origin);
            if(url.origin===sync)return route.fulfill({status:401,contentType:'application/json',body:'{"error":"需要测试设备配对","code":"AUTH_REQUIRED"}'});
            return route.abort();
        });
        await page.addInitScript(()=>{
            localStorage.setItem('app_sync_code',JSON.stringify('staging-test'));
            localStorage.setItem('app_profiles_v1',JSON.stringify([{id:'test-child',name:'测试孩子',theme:'rose'}]));
            localStorage.setItem('device_graphics_quality_v1','economy');
            localStorage.setItem('parent_sync_code','staging-test');
            localStorage.setItem('parent_is_bound','true');
            localStorage.setItem('parent_device_id','test-device');
            localStorage.setItem('parent_role','爸爸');
        });
        const request=page.waitForRequest(req=>req.url().startsWith(sync+'/'));
        await page.goto(entry);await request;
        await expect(page.locator('#staging-environment-banner')).toBeVisible();
        expect(external.filter(origin=>origin.includes('workers.dev')||origin.includes('daka-tool.top'))).toEqual([sync]);
        await page.close();
    }
});
test('built pairing and legacy verification pages use staging; CSP blocks production writes',async({page})=>{
    const requests=[];
    await page.route('**/*',async route=>{
        const req=route.request(),url=new URL(req.url());
        if(url.hostname==='127.0.0.1')return route.continue();
        requests.push(req.url());
        if(url.origin===sync)return route.fulfill({status:401,contentType:'application/json',body:'{"error":"测试邀请无效"}'});
        if(url.origin===exchange)return route.fulfill({status:400,contentType:'application/json',body:'{"error":"测试订单无效"}'});
        return route.abort();
    });
    await page.goto('/security.html?code=staging-test#invite='+ 'a'.repeat(64)+'&role=main');
    await expect(page.locator('#staging-environment-banner')).toBeVisible();
    await page.getByRole('button',{name:'配对 / 重试待确认配对',exact:true}).click();
    await expect.poll(()=>requests.some(url=>url.startsWith(sync+'/auth/redeem'))).toBe(true);
    const blocked=await page.evaluate(async()=>{
        try{await fetch('https://sync.daka-tool.top/?code=never-send',{method:'POST',body:'{}'});return false;}catch{return true;}
    });
    expect(blocked).toBe(true);
    expect(requests.some(url=>url.includes('never-send'))).toBe(false);
    page.on('dialog',dialog=>dialog.accept(dialog.type()==='prompt'?'1234':undefined));
    await page.goto('/exchange-verify.html?id=legacy-test&child=test&gold=10&cny=1');
    await page.getByRole('button',{name:'确认已转账'}).click();
    await expect.poll(()=>requests.some(url=>url.startsWith(exchange+'/api/'))).toBe(true);
    expect(requests.every(url=>url.startsWith(sync+'/')||url.startsWith(exchange+'/'))).toBe(true);
});
