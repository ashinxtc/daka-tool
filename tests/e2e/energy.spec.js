import { test, expect } from '@playwright/test';
async function visibility(page,value) {
    await page.evaluate(value=>{
        Object.defineProperty(document,'visibilityState',{configurable:true,value});
        document.dispatchEvent(new Event('visibilitychange'));
    },value);
}
async function load(page) {
    await page.clock.install({time:new Date('2026-10-16T12:00:00+08:00')});
    await page.addInitScript(()=>{
        const original=setInterval,clear=clearInterval;
        window.uiIntervals=new Map();window.canvasDraws=0;window.glDraws=0;
        for (const type of [window.WebGLRenderingContext, window.WebGL2RenderingContext].filter(Boolean)) {
            const draw=type.prototype.drawArrays;
            type.prototype.drawArrays=function(...args){window.glDraws++;return draw.apply(this,args)};
        }
        window.setInterval=(fn,ms,...args)=>{const id=original(fn,ms,...args);window.uiIntervals.set(id,ms);return id};
        window.clearInterval=id=>{window.uiIntervals.delete(id);clear(id)};
        const draw=CanvasRenderingContext2D.prototype.clearRect;
        CanvasRenderingContext2D.prototype.clearRect=function(...args){window.canvasDraws++;return draw.apply(this,args)};
    });
    await page.goto('/tests/fixtures/performance.html');
    await page.waitForFunction(()=>window.fixture);
}
test('silence ticks only its banner, cleans expiry, and does not tick empty or hidden',async({page})=>{
    await load(page);
    expect(await page.evaluate(()=>[...window.uiIntervals.values()].filter(ms=>ms===1000||ms===2000))).toEqual([]);
    await page.evaluate(()=>window.fixture.setMutes({孩子:Date.now()+10000,妹妹:Date.now()+6000}));
    await expect(page.getByText('孩子、妹妹',{exact:true})).toBeVisible();
    const before=await page.evaluate(()=>window.parentRenders);
    await page.clock.runFor(2100);
    expect(await page.evaluate(()=>window.parentRenders)).toBe(before);
    await expect(page.getByText('00:08',{exact:true})).toBeVisible();
    await visibility(page,'hidden');
    expect(await page.evaluate(()=>[...window.uiIntervals.values()].filter(ms=>ms===1000||ms===2000))).toEqual([]);
    await page.clock.runFor(12000);await visibility(page,'visible');
    await expect(page.getByText('禁言中🤫',{exact:true})).toHaveCount(0);
    await expect.poll(()=>page.evaluate(()=>window.fixture.mutes)).toEqual({});
    expect(await page.evaluate(()=>[...window.uiIntervals.values()].filter(ms=>ms===1000||ms===2000))).toEqual([]);
});
test('completed adventures keep their UI without ticking; active countdown stops at end and resumes correctly',async({page})=>{
    await load(page);
    await page.evaluate(()=>window.fixture.setAdventures({孩子:[{id:'a',petId:'p',realmId:'r',status:'completed',result:{},startTime:Date.now()-10000,expectedEndTime:Date.now()-1}]}));
    await expect(page.getByTitle('探险完成 · 点击领取宝藏！',{exact:true})).toBeVisible();
    expect(await page.evaluate(()=>[...window.uiIntervals.values()].filter(ms=>ms===1000||ms===2000))).toEqual([]);
    await page.evaluate(()=>window.fixture.setAdventures({孩子:[{id:'b',petId:'p',realmId:'r',status:'active',startTime:Date.now(),expectedEndTime:Date.now()+5000}]}));
    await expect.poll(()=>page.evaluate(()=>[...window.uiIntervals.values()].filter(ms=>ms===1000||ms===2000))).toEqual([1000]);
    await visibility(page,'hidden');await page.clock.runFor(6000);await visibility(page,'visible');
    await expect(page.getByTitle('探险完成 · 点击领取宝藏！',{exact:true})).toBeVisible();
    expect(await page.evaluate(()=>[...window.uiIntervals.values()].filter(ms=>ms===1000||ms===2000))).toEqual([]);
});
test('real galaxy canvas pauses hidden, resumes without remount and stops after repeated switches',async({page})=>{
    await load(page);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    for(let i=0;i<3;i++) {
        await page.evaluate(()=>window.fixture.setBackground('bg_galaxy'));
        await expect(page.locator('canvas')).toHaveCount(1);
        await page.clock.runFor(100);
        await page.evaluate(()=>window.savedCanvas=document.querySelector('canvas'));
        await visibility(page,'hidden');
        const paused=await page.evaluate(()=>window.canvasDraws);
        await page.clock.runFor(500);
        expect(await page.evaluate(()=>window.canvasDraws)).toBe(paused);
        await visibility(page,'visible');await page.clock.runFor(100);
        expect(await page.evaluate(()=>window.canvasDraws)).toBeGreaterThan(paused);
        expect(await page.evaluate(()=>window.savedCanvas===document.querySelector('canvas'))).toBe(true);
        await page.evaluate(()=>window.fixture.setBackground(null));
        await expect(page.locator('canvas')).toHaveCount(0);
        const stopped=await page.evaluate(()=>window.canvasDraws);await page.clock.runFor(100);
        expect(await page.evaluate(()=>window.canvasDraws)).toBe(stopped);
    }
    expect(errors).toEqual([]);
});
test('CSS-only background pauses in place without replacing its stars',async({page})=>{
    await load(page);await page.evaluate(()=>window.fixture.setBackground('bg_meteor'));
    const star=page.locator('.atmosphere-layer [style*="star-twinkle"]').first();
    await expect(star).toBeAttached();
    const style=await star.getAttribute('style');
    await visibility(page,'hidden');await expect(star).toHaveCSS('animation-play-state','paused');
    await visibility(page,'visible');await expect(star).toHaveCSS('animation-play-state','running');
    expect(await star.getAttribute('style')).toBe(style);
});
test('WebGL backgrounds resume on the same canvas and release their loops on switch',async({page,browserName})=>{
    test.skip(browserName !== 'chromium','Software WebGL verification uses Chromium; WebKit covers canvas, CSS and clocks.');
    await load(page);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    for (const type of ['bg_aurora','bg_prismatic','bg_timewarp','bg_hyperspeed']) {
        await page.evaluate(type=>window.fixture.setBackground(type),type);
        await expect(page.locator('canvas')).toHaveCount(1);
        const before=await page.evaluate(()=>window.glDraws);await page.clock.runFor(100);
        expect(await page.evaluate(()=>window.glDraws)).toBeGreaterThan(before);
        await page.evaluate(()=>window.savedCanvas=document.querySelector('canvas'));
        await visibility(page,'hidden');const paused=await page.evaluate(()=>window.glDraws);
        await page.clock.runFor(10000);expect(await page.evaluate(()=>window.glDraws)).toBe(paused);
        await visibility(page,'visible');await page.clock.runFor(100);
        expect(await page.evaluate(()=>window.glDraws)).toBeGreaterThan(paused);
        expect(await page.evaluate(()=>window.savedCanvas===document.querySelector('canvas'))).toBe(true);
        await page.evaluate(()=>window.fixture.setBackground(null));await expect(page.locator('canvas')).toHaveCount(0);
        const stopped=await page.evaluate(()=>window.glDraws);await page.clock.runFor(100);
        expect(await page.evaluate(()=>window.glDraws)).toBe(stopped);
    }
    expect(errors).toEqual([]);
});
