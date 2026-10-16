import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createVisibleFrames } from '../src/utils/visibleFrames.js';
function setup(hidden=false) {
    const document = new EventTarget(), window = new EventTarget();
    document.visibilityState = hidden ? 'hidden' : 'visible';
    let time=100, id=0;
    const callbacks=new Map(), timers=new Map();
    window.setTimeout=(cb,ms)=>{timers.set(++id,{cb,due:time+ms});return id};
    window.clearTimeout=id=>timers.delete(id);
    window.requestAnimationFrame=cb=>{callbacks.set(++id,cb);return id};
    window.cancelAnimationFrame=id=>callbacks.delete(id);
    const frames=createVisibleFrames({document,window,performance:{now:()=>time}});
    return {frames,callbacks,timers,document,window,
        tick(ms=16){time+=ms;for(const [key,t] of [...timers])if(t.due<=time){timers.delete(key);t.cb();}const batch=[...callbacks.values()];callbacks.clear();batch.forEach(cb=>cb(time));},
        visibility(value){document.visibilityState=value;document.dispatchEvent(new Event('visibilitychange'));},
        advance(ms){time+=ms;}};
}
test('hidden animation cancels native callbacks and resumes once without a large time step',()=>{
    const e=setup(),seen=[];
    const draw=t=>{seen.push(t);e.frames.request(draw)};
    e.frames.request(draw);e.tick();
    e.visibility('hidden');assert.equal(e.callbacks.size,0);
    e.advance(600000);e.visibility('visible');e.visibility('visible');
    assert.equal(e.callbacks.size,1);e.tick();
    assert.deepEqual(seen,[116,132]);e.frames.dispose();assert.equal(e.callbacks.size,0);
});
test('cancelling while hidden never resurrects an unmounted background',()=>{
    const e=setup();let calls=0;
    const id=e.frames.request(()=>calls++);e.visibility('hidden');e.frames.cancel(id);
    e.visibility('visible');e.tick();assert.equal(calls,0);e.frames.dispose();
});
test('initially hidden mounts wait for visibility and share a consistent clock',()=>{
    const e=setup(true);const start=e.frames.now();let stamp;
    e.frames.request(t=>stamp=t);e.advance(10000);assert.equal(e.callbacks.size,0);
    e.visibility('visible');e.tick();assert.equal(stamp-start,16);e.frames.dispose();
});
test('pagehide/pageshow suspension and disposal remove every scheduled callback',()=>{
    const e=setup();let calls=0;
    e.frames.request(()=>calls++);e.window.dispatchEvent(new Event('pagehide'));
    e.tick(10000);assert.equal(calls,0);
    e.window.dispatchEvent(new Event('pageshow'));e.tick();assert.equal(calls,1);
    for(let i=0;i<10;i++)e.frames.request(()=>calls++);
    e.frames.dispose();e.visibility('hidden');e.visibility('visible');e.tick();
    assert.equal(calls,1);
});

test('delayed decorations use one cancellable timeout; hidden time does not consume the delay',()=>{
    const e=setup();let calls=0;
    const id=e.frames.request(()=>calls++,1000);
    assert.equal(e.callbacks.size,0);assert.equal(e.timers.size,1);
    e.tick(400);e.visibility('hidden');assert.equal(e.timers.size,0);
    e.advance(10000);e.visibility('visible');e.tick(500);assert.equal(calls,0);
    e.tick(100);assert.equal(calls,1);
    e.frames.request(()=>calls++,1000);e.frames.dispose();assert.equal(e.timers.size,0);
    e.tick(2000);assert.equal(calls,1);
});
test('manual freeze composes with page visibility and resumes the same visual time',()=>{
    const e=setup(),seen=[];
    const draw=t=>{seen.push(t);e.frames.request(draw,20)};
    e.frames.request(draw);e.tick();e.frames.setPaused(true);
    e.visibility('hidden');e.advance(5000);e.frames.setPaused(false);
    assert.equal(e.timers.size,0);e.visibility('visible');e.tick(20);
    assert.deepEqual(seen,[116,136]);e.frames.dispose();assert.equal(e.timers.size,0);
});
