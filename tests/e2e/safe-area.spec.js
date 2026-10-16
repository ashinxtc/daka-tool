import { test, expect } from '@playwright/test';
const layouts=[
    {name:'iPhone portrait',width:393,height:852,top:59,bottom:34,left:0,right:0},
    {name:'iPhone landscape',width:852,height:393,top:0,bottom:21,left:59,right:59},
    {name:'iPad standalone',width:820,height:1180,top:24,bottom:20,left:0,right:0},
    {name:'desktop browser',width:1280,height:900,top:0,bottom:0,left:0,right:0},
];
async function start(page,layout) {
    await page.setViewportSize({width:layout.width,height:layout.height});
    await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
    await page.clock.setFixedTime(new Date('2026-10-16T12:00:00+08:00'));
    await page.addInitScript(()=>{
        localStorage.setItem('low_perf_manual','true');
        const data={app_profiles_v1:[{id:'c1',name:'孩子',theme:'rose'}],app_tasks_v2:{孩子:[]},
            app_evil_auto_trigger:false,app_notified_levels:{孩子:1},app_weekend_settings:{enabled:false},
            app_gamification_config_v1:{redemptionEnabled:true,firstBloodEnabled:false}};
        for(const[k,v]of Object.entries(data))localStorage.setItem(k,JSON.stringify(v));
    });
    await page.goto('/');await page.waitForFunction(()=>window.storage&&document.querySelector('main'));
    // Desktop test runners do not expose real iPhone status-bar insets. Inject equivalent
    // CSS variables, and model the status bar as a hit-testing overlay.
    await page.evaluate(layout=>{
        for(const edge of ['top','bottom','left','right'])document.documentElement.style.setProperty(`--app-safe-${edge}`,`${layout[edge]}px`);
        const bar=document.createElement('div');bar.id='test-system-status-bar';
        Object.assign(bar.style,{position:'fixed',top:'0',left:'0',right:'0',height:`${layout.top}px`,zIndex:'2147483647'});
        document.body.append(bar);
    },layout);
}
async function assertReachable(page,button,layout) {
    const b=await button.boundingBox();expect(b).not.toBeNull();
    expect(b.y).toBeGreaterThanOrEqual(layout.top);
    expect(b.x).toBeGreaterThanOrEqual(layout.left);
    expect(b.x+b.width).toBeLessThanOrEqual(layout.width-layout.right);
    expect(b.y+b.height).toBeLessThanOrEqual(layout.height-layout.bottom);
    await expect.poll(()=>button.evaluate(el=>{const b=el.getBoundingClientRect();const hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return el.contains(hit)?'reachable':hit?.outerHTML.slice(0,400)})).toBe('reachable');
}
for(const layout of layouts)test(`${layout.name}: navigation stays reachable after scroll and menus close inside safe area`,async({page})=>{
    await start(page,layout);
    const header=page.locator('header');
    const settings=header.getByTitle('设置',{exact:true}).filter({visible:true});
    await assertReachable(page,settings,layout);
    await page.evaluate(()=>window.scrollTo(0,600));
    await assertReachable(page,settings,layout);
    await settings.click();
    await expect(page.getByRole('heading',{name:'天工司 · 核心治所与系统设定大典'})).toBeVisible();
    const close=page.getByTitle('关闭',{exact:true}).filter({visible:true});
    await assertReachable(page,close,layout);await close.click();
    await expect(page.getByRole('heading',{name:'天工司 · 核心治所与系统设定大典'})).toHaveCount(0);
    const theme=header.getByTitle('切换主题',{exact:true}).filter({visible:true});
    await assertReachable(page,theme,layout);await theme.click();
    await expect(page.getByRole('heading',{name:/空间华彩 · 主题试衣间/})).toBeVisible();
    await assertReachable(page,close,layout);await close.click();
});
