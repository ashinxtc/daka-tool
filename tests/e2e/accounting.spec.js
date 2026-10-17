import { test, expect } from '@playwright/test';
const child='孩子';
const action=(id,amount=10,extra={})=>({id,amount,targetChild:child,operatorRole:'爸爸',reason:`事由${id}`,
 timestamp:1792100000000+id,type:'deduction',status:'pending',...extra});
async function seed(page, extra={}) {
    await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1' ? route.continue() : route.abort());
    await page.clock.setFixedTime(new Date('2026-10-16T12:00:00+08:00'));
    await page.addInitScript(data=>{
        if(localStorage.getItem('_e2e_seeded')) return;
        localStorage.setItem('_e2e_seeded','1');localStorage.setItem('low_perf_manual','true');
        const defaults={app_profiles_v1:[{id:'child1',name:'孩子',theme:'rose'},{id:'child2',name:'妹妹',theme:'blue'}],
            app_tasks_v2:{孩子:[{id:'math',name:'数学',frequencyType:'daily_must',reward:1}]},
            app_wheel_history:{'孩子-BASE-1792000000000':100},app_evil_auto_trigger:false,
            app_gamification_config_v1:{redemptionEnabled:true,firstBloodEnabled:false}, app_checkins_v2:{},
            app_notified_levels:{孩子:1,妹妹:1},app_weekend_settings:{enabled:false},app_parent_actions_v1:[]};
        Object.entries({...defaults,...data}).forEach(([key,value])=>localStorage.setItem(key,JSON.stringify(value)));
    },extra);
    await page.goto('/');
    await page.waitForFunction(()=>window.storage && window._resolveSyncMerge && document.querySelector('main'));
}
async function value(page,key) {return page.evaluate(k=>JSON.parse(window.storage.getItem(k)||'null'),key);}
async function sync(page,data) {
    await page.evaluate(async cloud=>{
        for(const [k,v] of Object.entries(window._pendingWrites||{})) window.storage.setItem(k,JSON.stringify(v));
        const payload=Object.fromEntries(Object.entries(cloud).map(([k,v])=>[k,JSON.stringify(v)]));
        const local=window.storage.getAllSyncData();
        const result=window._resolveSyncMerge({...payload,_syncTs:Date.now()+1000},local,{},0);
        const {commitDurable}=await import('/src/utils/storage.js');
        commitDurable(result.writes);
        window.dispatchEvent(new Event('_syncDataMerged'));
        await window.storage.flush();
    },data);
}
const notice=page=>page.getByRole('heading',{name:'【爸爸】下达扣款通知单'});

test('real App: every deduction is shown with correct balance; reload retains next notice',async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await seed(page,{app_parent_actions_v1:[action(1,10),action(2,25),action(3,5)]});
    await expect(notice(page)).toBeVisible();
    await expect(page.getByText('“事由1”',{exact:true})).toBeVisible();
    await expect(page.getByText('90 💰',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:/我知道了/}).click();
    await expect(page.getByText('“事由2”',{exact:true})).toBeVisible();
    await page.reload();
    await expect(page.getByText('“事由2”',{exact:true})).toBeVisible();
    await expect(page.getByText('65 💰',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:/我知道了/}).click();
    await expect(page.getByText('“事由3”',{exact:true})).toBeVisible();
    await expect(page.getByText('60 💰',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:/我知道了/}).click();
    await expect(notice(page)).toHaveCount(0);
    await page.reload();await expect(notice(page)).toHaveCount(0);
    expect((await value(page,'app_stats_v1'))[child].total_spent).toBe(40);
    expect(errors).toEqual([]);
});
test('stale pending reconnect does not debit, increment statistics or resurrect read notices',async({page})=>{
    await seed(page,{app_parent_actions_v1:[action(1)]});
    await expect(notice(page)).toBeVisible();
    const receipts=await value(page,'app_parent_deduction_receipts_v1');
    await page.getByRole('button',{name:/我知道了/}).click();
    await sync(page,{app_parent_actions_v1:[action(1)],app_parent_deduction_receipts_v1:receipts});
    await expect(notice(page)).toHaveCount(0);
    expect((await value(page,'app_stats_v1'))[child].total_spent).toBe(10);
    const history=await value(page,'app_wheel_history');
    expect(Object.keys(history).filter(k=>k.includes('PARENT_DEDUCT'))).toHaveLength(1);
});
test('two device contexts redeem same contract once after actual sync merge',async({browser})=>{
    const a=await browser.newPage(),b=await browser.newPage();
    const contract={id:'penalty',penaltyKey:'penalty',frozenGold:20,returnRate:100,status:'pending',
        createdDate:'2026-10-16',deadlineDate:'2026-10-17',timestamp:1,
        freezeKey:'孩子-ESCROW_FROZEN-penalty-0000000000000',redeemKey:'孩子-ESCROW_REDEEM-penalty-0000000000000'};
    const data={app_escrow_penalties_v1:{[child]:{records:{penalty:contract}}},
        app_checkins_v2:{[child]:{math:{'2026-10-16':true}}}};
    await seed(a,data);await seed(b,data);
    await expect.poll(async()=>Object.values((await value(a,'app_escrow_penalties_v1'))[child].records)[0].status).toBe('redeemed');
    await expect.poll(async()=>Object.values((await value(b,'app_escrow_penalties_v1'))[child].records)[0].status).toBe('redeemed');
    const fromB=await b.evaluate(()=>window.storage.getAllSyncData());
    await sync(a,Object.fromEntries(Object.entries(fromB).map(([k,v])=>[k,(()=>{try{return JSON.parse(v)}catch{return v}})()])));
    const history=await value(a,'app_wheel_history');
    expect(Object.keys(history).filter(k=>k.includes('ESCROW_REDEEM'))).toHaveLength(1);
    expect(history[contract.redeemKey]).toBe(20);expect(history[contract.freezeKey]).toBe(-20);
    await a.close();await b.close();
});
test('expired contract does not refund even with one star and automatic penalties disabled',async({page})=>{
    await seed(page,{app_escrow_penalties_v1:{[child]:{status:'pending',penaltyKey:'old',frozenGold:20,deadlineDate:'2026-10-15'}},
        app_checkins_v2:{[child]:{math:{'2026-10-16':true}}}});
    await expect.poll(async()=>Object.values((await value(page,'app_escrow_penalties_v1'))[child].records)[0].status).toBe('forfeited');
    expect(Object.keys(await value(page,'app_wheel_history')).filter(k=>k.includes('ESCROW_REDEEM'))).toHaveLength(0);
});
test('other child, unauthorized deductions and gifts remain isolated',async({page})=>{
    await seed(page,{app_authorized_parents_v1:{devices:[{deviceId:'allowed'}]},app_parent_actions_v1:[
        action(1,10,{operatorDeviceId:'bad'}),action(2,10,{targetChild:'妹妹',operatorDeviceId:'allowed'}),
        action(3,10,{type:'red_packet',operatorDeviceId:'allowed'})]});
    await expect.poll(async()=>(await value(page,'app_parent_actions_v1'))[0].status).toBe('rejected_unauthorized');
    expect((await value(page,'app_parent_actions_v1'))[1].status).toBe('pending');
    expect((await value(page,'app_parent_actions_v1'))[2].status).toBe('pending');
    await expect(notice(page)).toHaveCount(0);
});

test('real wheel preserves sequential frozen penalties through reload and redeems both',async({page})=>{
    const pending=id=>({[child]:{source:'parent',reason:`事由${id}`,penaltyKey:id}});
    await seed(page,{app_pending_evil_penalties_v2:pending('p1'),
        app_evil_wheel_config:[{id:'fixed',name:'扣20',value:-20,weight:100,color:'#ff0000'}]});
    await page.getByRole('button',{name:'启动命运审判 ⚖️'}).click();
    await expect.poll(async()=>Object.keys((await value(page,'app_escrow_penalties_v1'))?.[child]?.records||{})).toEqual(['p1']);
    await page.getByRole('button',{name:/签署翻盘契约/}).click();
    await sync(page,{app_pending_evil_penalties_v2:pending('p2')});
    await page.getByRole('button',{name:'启动命运审判 ⚖️'}).click();
    await expect.poll(async()=>Object.keys((await value(page,'app_escrow_penalties_v1'))?.[child]?.records||{})).toEqual(['p1','p2']);
    await page.reload();
    let records=(await value(page,'app_escrow_penalties_v1'))[child].records;
    expect(Object.values(records).map(r=>[r.frozenGold,r.reason])).toEqual([[20,'事由p1'],[20,'事由p2']]);
    await sync(page,{app_checkins_v2:{[child]:{math:{'2026-10-16':true}}}});
    await expect.poll(async()=>Object.values((await value(page,'app_escrow_penalties_v1'))[child].records).every(r=>r.status==='redeemed')).toBe(true);
    const history=await value(page,'app_wheel_history');
    expect(Object.entries(history).filter(([k])=>k.includes('ESCROW_REDEEM')).map(([,v])=>v)).toEqual([20,20]);
});

test('remote completion during wheel animation prevents another local settlement',async({page})=>{
    await seed(page,{app_pending_evil_penalties_v2:{[child]:{source:'parent',reason:'重复',penaltyKey:'race'}},
        app_evil_wheel_config:[{id:'fixed',name:'扣20',value:-20,weight:100,color:'#ff0000'}]});
    await page.getByRole('button',{name:'启动命运审判 ⚖️'}).click();
    await sync(page,{app_evil_penalty_log_v1:{race:{timestamp:Date.now(),reason:'另一设备已结算'}}});
    await expect(page.getByRole('button',{name:'命运天平裁决中...'})).toHaveCount(0);
    expect(Object.keys(await value(page,'app_wheel_history')).filter(k=>k.includes('ESCROW_FROZEN'))).toHaveLength(0);
});

for (const cachedPenalty of [false, true]) {
    test(`comeback safe yesterday prevents next-day penalty (cached=${cachedPenalty})`, async ({page}) => {
        const penaltyKey = `${child}-EVIL_PENALTY-2026-10-15`;
        await seed(page, {
            app_evil_auto_trigger: true,
            app_escrow_penalties_v1: {[child]: {records: {safe: {
                id: 'safe', status: 'redeemed', frozenGold: 20,
                createdDate: '2026-10-15', redeemedDate: '2026-10-15',
                redeemedDates: ['2026-10-15'], redeemedAt: new Date('2026-10-15T12:00:00+08:00').getTime()
            }}}},
            app_pending_evil_penalties_v2: cachedPenalty
                ? {[child]: {source: 'auto', date: '2026-10-15', reason: '昨日未完成', penaltyKey}} : {},
        });
        await expect.poll(async () => (await value(page, 'app_pending_evil_penalties_v2'))?.[child] ?? null).toBe(null);
        await expect(page.getByRole('button', {name: '启动命运审判 ⚖️'})).toHaveCount(0);
        await page.reload();
        await page.waitForFunction(() => window.storage && document.querySelector('main'));
        await expect(page.getByRole('button', {name: '启动命运审判 ⚖️'})).toHaveCount(0);
        expect(Object.keys(await value(page, 'app_wheel_history')).filter(k => k.includes('ESCROW_FROZEN'))).toHaveLength(0);
    });
}
