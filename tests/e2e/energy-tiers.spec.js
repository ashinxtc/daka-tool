import { test, expect } from '@playwright/test';
const modes={economy:'舒适省电',balanced:'推荐均衡',full:'完整视觉',compatibility:'旧设备兼容'};
async function load(page, saved={}) {
    await page.setViewportSize({width:320,height:480});
    await page.clock.install({time:new Date('2026-10-16T12:00:00+08:00')});
    await page.addInitScript(saved => {
        if (!sessionStorage.getItem('seeded')) {
            for(const [k,v]of Object.entries(saved))localStorage.setItem(k,v);
            sessionStorage.setItem('seeded','1');
        }
        window.draws={raf:0,paint:0,glyph:0,gl:0};
        const raf=requestAnimationFrame;
        window.requestAnimationFrame=cb=>raf(t=>{window.draws.raf++;cb(t)});
        for(const name of ['fillRect','clearRect','fillText']) {
            const original=CanvasRenderingContext2D.prototype[name];
            CanvasRenderingContext2D.prototype[name]=function(...args){
                if(name==='fillText')window.draws.glyph++;
                else if(this.canvas.isConnected)window.draws.paint++;
                return original.apply(this,args);
            };
        }
        for(const Type of [window.WebGLRenderingContext,window.WebGL2RenderingContext].filter(Boolean)) {
            const draw=Type.prototype.drawArrays;
            Type.prototype.drawArrays=function(...args){window.draws.gl++;return draw.apply(this,args)};
        }
    },saved);
    await page.goto('/tests/fixtures/energy-tiers.html');
    await page.waitForFunction(()=>window.tiers);
}
async function sample(page,ms) {
    const before=await page.evaluate(()=>({...window.draws}));
    await page.clock.runFor(ms);
    return page.evaluate(b=>Object.fromEntries(Object.entries(window.draws).map(([k,v])=>[k,v-b[k]])),before);
}
async function mode(page,value){
    await page.evaluate(value=>window.tiers.setPerfMode(value),value);
    await expect(page.getByRole('button',{name:new RegExp('^'+modes[value])})).toHaveAttribute('aria-pressed','true');
}
async function bg(page,type){
    await page.evaluate(type=>window.tiers.setBackground(type),type);
    if(type) await expect(page.locator('.atmosphere-layer')).toHaveAttribute('data-background',type);
    else await expect(page.locator('.atmosphere-layer')).toHaveCount(0);
    // React commits and its background-change effect must finish before advancing idle time.
    await page.clock.runFor(32);
}
test('migration, device persistence, explicit idle off and detector immunity',async({page})=>{
    await load(page,{device_graphics_quality_v1:'enabled'});
    expect(await page.evaluate(()=>window.tiers.perfMode)).toBe('compatibility');
    await expect(page.getByText('高级选项 · 旧设备兼容生效中')).toBeVisible();
    await mode(page,'balanced');await page.getByLabel('空闲节能',{exact:true}).uncheck();
    await page.evaluate(()=>{window.__lowPerfAuto=true;window.dispatchEvent(new Event('performance-detected'))});
    expect(await page.evaluate(()=>window.tiers.perfMode)).toBe('balanced');
    await mode(page,'economy');await expect(page.getByLabel('空闲节能',{exact:true})).toBeDisabled();
    await mode(page,'full');await expect(page.getByLabel('空闲节能',{exact:true})).not.toBeChecked();
    await page.reload();await page.waitForFunction(()=>window.tiers);
    expect(await page.evaluate(()=>window.tiers.perfMode)).toBe('full');
    await expect(page.getByLabel('空闲节能',{exact:true})).not.toBeChecked();
});
test('economy mounts no animated background in all themes and retains blur and business feedback',async({page})=>{
    await load(page);await mode(page,'economy');
    for(const type of ['bg_galaxy','bg_meteor','bg_aurora','bg_lantern','bg_firefly','bg_ginkgo','bg_matrix','bg_oraclesands','bg_firework','bg_prismatic','bg_timewarp','bg_hyperspeed']) {
        await bg(page,type);
        await expect(page.locator('.atmosphere-layer')).toHaveAttribute('data-static','true');
        await expect(page.locator('canvas')).toHaveCount(0);
        const counts=await sample(page,100);expect(counts.raf).toBe(0);
    }
    await expect(page.locator('.weather-decoration > div').first()).toHaveCSS('animation-play-state','paused');
    await expect(page.getByTestId('feedback')).toHaveCSS('animation-play-state','running');
    expect(await page.getByTestId('glass').evaluate(e=>getComputedStyle(e).backdropFilter||getComputedStyle(e).webkitBackdropFilter)).not.toBe('none');
    await page.evaluate(()=>window.tiers.setMutes({孩子:Date.now()+2000}));await page.clock.runFor(3000);
    await expect(page.getByText('禁言中🤫',{exact:true})).toHaveCount(0);
    await page.getByRole('button',{name:'打卡测试 0',exact:true}).click();
    await expect(page.getByRole('button',{name:'打卡测试 1',exact:true})).toBeVisible();
    await mode(page,'balanced');await bg(page,'bg_galaxy');expect((await sample(page,300)).paint).toBeGreaterThan(0);
});
test('balanced matrix pauses and caches glyphs while full and compatibility keep baseline drawing',async({page})=>{
    await load(page);
    await page.evaluate(()=>document.fonts.ready);
    // install() still advances with real time. Freeze it before measuring a full
    // animation phase, then remount after fonts settle so CI loading time cannot
    // consume or restart the sampled motion window. Keep the frame bounds strict.
    await page.clock.pauseAt(new Date('2026-10-16T12:01:00+08:00'));
    await bg(page,null);await bg(page,'bg_matrix');
    await page.clock.runFor(100);
    const still=await sample(page,700);expect(still.paint).toBe(0);expect(still.raf).toBe(0);
    await page.clock.runFor(250);const moving=await sample(page,1200);
    expect(moving.paint).toBeGreaterThan(20);expect(moving.paint).toBeLessThan(42);expect(moving.glyph).toBe(0);
    for(const value of ['full','compatibility']){await mode(page,value);expect((await sample(page,200)).glyph).toBeGreaterThan(0);}
    await bg(page,null);expect((await sample(page,1000)).raf).toBe(0);
    await mode(page,'balanced');expect((await sample(page,1000)).raf).toBe(0);
});
test('idle pauses CSS pseudo elements and Canvas; first click works; changing background wakes and disabling restores',async({page})=>{
    await load(page);
    // Keep the feedback button in view: an automated smooth scroll is real activity.
    await page.setViewportSize({width:320,height:1000});
    await bg(page,'bg_firefly');
    await page.clock.fastForward(20100);await expect(page.locator('body')).toHaveAttribute('data-decoration-paused','true');
    expect(await page.locator('.firefly').first().evaluate(e=>getComputedStyle(e,'::after').animationPlayState)).toBe('paused');
    await page.getByRole('button',{name:'打卡测试 0',exact:true}).click();
    await expect(page.getByRole('button',{name:'打卡测试 1',exact:true})).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-decoration-paused','false');
    await bg(page,'bg_galaxy');await page.clock.fastForward(20100);
    expect((await sample(page,1000)).raf).toBe(0);
    await bg(page,'bg_matrix');expect((await sample(page,1300)).paint).toBeGreaterThan(0);
    await page.clock.fastForward(20100);
    await page.evaluate(()=>window.tiers.setIdleEnergy(false));
    await expect(page.locator('body')).toHaveAttribute('data-decoration-paused','false');
    await page.clock.fastForward(21000);await expect(page.locator('body')).toHaveAttribute('data-decoration-paused','false');
});
test('touch hold, scroll, hidden/pagehide, resume and rotation preserve decoration lifecycle',async({page})=>{
    await load(page);await bg(page,'bg_galaxy');
    await page.evaluate(()=>window.dispatchEvent(new PointerEvent('pointerdown',{pointerId:7})));
    await page.clock.fastForward(22000);await expect(page.locator('body')).toHaveAttribute('data-decoration-paused','false');
    await page.evaluate(()=>window.dispatchEvent(new PointerEvent('pointercancel',{pointerId:7})));
    await page.clock.fastForward(15000);await page.evaluate(()=>window.dispatchEvent(new Event('scroll')));
    await page.clock.fastForward(15000);await expect(page.locator('body')).toHaveAttribute('data-decoration-paused','false');
    await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));expect((await sample(page,1000)).raf).toBe(0);
    await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));expect((await sample(page,300)).paint).toBeGreaterThan(0);
    await page.clock.fastForward(21000);
    await expect(page.locator('body')).toHaveAttribute('data-decoration-paused','true');
    await page.setViewportSize({width:480,height:320});await page.waitForFunction(()=>document.querySelector('canvas')?.width===480);
    expect((await sample(page,300)).paint).toBeGreaterThan(0);
    await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'))});
    expect((await sample(page,1000)).raf).toBe(0);
    await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});document.dispatchEvent(new Event('visibilitychange'))});
    expect((await sample(page,300)).paint).toBeGreaterThan(0);
});
test('WebGL keeps B raster/fps, full resolution and idle cleanup',async({page,browserName})=>{
    test.skip(browserName!=='chromium','WebKit software runner has no WebGL');test.setTimeout(90000);
    await load(page);await page.setViewportSize({width:320,height:240});
    await page.evaluate(()=>Object.defineProperty(window,'devicePixelRatio',{configurable:true,value:2}));
    for(const type of ['bg_aurora','bg_prismatic','bg_timewarp','bg_hyperspeed']){
        await bg(page,type);await mode(page,'full');
        const width=await page.locator('canvas').evaluate(c=>c.width);const full=(await sample(page,1000)).gl;
        await mode(page,'balanced');expect(await page.locator('canvas').evaluate(c=>c.width)).toBe(Math.round(width/2));
        const reduced=(await sample(page,1000)).gl;expect(reduced).toBeGreaterThanOrEqual(28);expect(reduced).toBeLessThanOrEqual(32);expect(full).toBeGreaterThan(reduced*1.5);
        await page.clock.fastForward(21000);expect((await sample(page,300)).gl).toBe(0);
        await mode(page,'economy');expect((await sample(page,300)).raf).toBe(0);
    }
});
test('real settings migrate, persist locally, preserve equipped background and remove experimental query controls',async({page},info)=>{
    await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
    await page.addInitScript(()=>{
        if(!sessionStorage.getItem('seeded')){
            const data={app_profiles_v1:[{id:'c1',name:'孩子',theme:'rose'}],app_tasks_v2:{孩子:[]},app_equipped_gear_v1:{孩子:{background:'bg_matrix'}},app_evil_auto_trigger:false,app_notified_levels:{孩子:1}};
            for(const[k,v]of Object.entries(data))localStorage.setItem(k,JSON.stringify(v));
            localStorage.setItem('device_graphics_quality_v1','auto');sessionStorage.setItem('seeded','1');
        }
    });
    await page.goto('/?energyPreview=c');
    await expect(page.locator('.energy-preview-panel')).toHaveCount(0);
    await page.locator('header').getByTitle('设置',{exact:true}).filter({visible:true}).click();
    await page.getByRole('button',{name:'💾 数据',exact:true}).click();
    const settings=page.getByRole('region',{name:'画面与能耗'});
    await expect(settings.getByRole('button',{name:/^推荐均衡/})).toHaveAttribute('aria-pressed','true');
    await settings.getByRole('button',{name:/^舒适省电/}).click();
    await expect(page.locator('.atmosphere-layer')).toHaveAttribute('data-static','true');
    expect(await page.evaluate(()=>JSON.parse(window.storage.getItem('app_equipped_gear_v1')).孩子.background)).toBe('bg_matrix');
    expect(await page.evaluate(()=>Object.keys(window.storage.getAllSyncData()).filter(k=>k.startsWith('device_')))).toEqual([]);
    await settings.scrollIntoViewIfNeeded();
    await page.screenshot({path:info.outputPath('energy-settings.png')});
    await page.reload();await expect(page.locator('.atmosphere-layer')).toHaveAttribute('data-static','true');
    expect(await page.evaluate(()=>localStorage.getItem('device_graphics_quality_v1'))).toBe('economy');
});
