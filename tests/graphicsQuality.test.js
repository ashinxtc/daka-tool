import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GRAPHICS_KEY, IDLE_KEY, readGraphicsMode, readIdleEnergy, resolveGraphicsMode, backgroundDpr, createFrameGate } from '../src/utils/graphicsQuality.js';
const storage = data => ({ getItem: key => data[key] ?? null });
test('saved modes migrate without detector or mobile overrides', () => {
    for (const [old, expected] of Object.entries({auto:'balanced',balanced:'balanced',disabled:'full',enabled:'compatibility',economy:'economy',full:'full',compatibility:'compatibility'})) {
        assert.equal(readGraphicsMode(storage({[GRAPHICS_KEY]:old,low_perf_manual:'true'})),expected);
    }
    assert.equal(readGraphicsMode(storage({low_perf_manual:'true'})), 'compatibility');
    assert.equal(readGraphicsMode(storage({low_perf_manual:'false'})), 'full');
    assert.equal(readGraphicsMode(storage({})), 'balanced');
    assert.equal(readGraphicsMode(storage({[GRAPHICS_KEY]:'invalid'})), 'balanced');
    assert.equal(readGraphicsMode({ getItem() { throw Error('blocked'); } }), 'balanced');
    for (const mobile of [true,false]) for (const low of [true,false]) {
        assert.equal(resolveGraphicsMode('balanced',mobile,low),'balanced');
        assert.equal(resolveGraphicsMode('economy',mobile,low),'balanced');
        assert.equal(resolveGraphicsMode('full',mobile,low),'original');
        assert.equal(resolveGraphicsMode('compatibility',mobile,low),'lightweight');
    }
});
test('idle defaults on, preserves explicit off, and survives unavailable storage', () => {
    assert.equal(readIdleEnergy(storage({})),true);
    assert.equal(readIdleEnergy(storage({[IDLE_KEY]:'false'})),false);
    assert.equal(readIdleEnergy({getItem(){throw Error('blocked')}}),true);
});
test('DPR preserves B and compatibility rendering limits', () => {
    assert.equal(backgroundDpr(3,false,false,.35),2);
    assert.equal(backgroundDpr(3,false,true,.35),1);
    assert.equal(backgroundDpr(2,true,true,.35),.35);
});
test('30fps gate is stable at 60/120Hz and after suspension', () => {
    for (const refresh of [60,120]) {
        const gate=createFrameGate(30);let count=0;
        for(let i=0;i<refresh*2;i++)if(gate(i*1000/refresh))count++;
        assert.ok(count>=59&&count<=61);
        assert.equal(gate(100000),true);assert.equal(gate(100001),false);
    }
});
test('pre-React bootstrap matches migration without timers or GPU probing', async () => {
    const {readFile}=await import('node:fs/promises');
    const {runInNewContext}=await import('node:vm');
    const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
    const script=html.match(/<script id="graphics-bootstrap">([\s\S]*?)<\/script>/)[1];
    for(const mode of [null,'auto','balanced','disabled','enabled','economy','full','compatibility','invalid']) {
        for(const legacy of [null,'true','false']) {
            const data={[GRAPHICS_KEY]:mode,low_perf_manual:legacy};let low;
            const window={};const document={body:{classList:{toggle(name,value){low=value}}}};
            runInNewContext(script,{window,document,localStorage:storage(data)});
            assert.equal(low,resolveGraphicsMode(readGraphicsMode(storage(data)))==='lightweight');
        }
    }
});
