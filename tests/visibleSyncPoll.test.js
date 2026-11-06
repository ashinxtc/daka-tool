import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startVisibleSyncPoll } from '../src/utils/visibleSyncPoll.js';

function browser() {
    const doc = new EventTarget();
    const win = new EventTarget();
    const timers = new Map();
    let id = 0;
    let time = 0;
    doc.visibilityState = 'visible';
    win.setTimeout = (callback, delay) => { timers.set(++id, { callback, delay }); return id; };
    win.clearTimeout = key => timers.delete(key);
    return {
        doc, win,
        now: () => time,
        advance(ms) { time += ms; },
        get delays() { return [...timers.values()].map(timer => timer.delay); },
        tick() {
            const [key, timer] = timers.entries().next().value;
            timers.delete(key);
            return timer.callback();
        },
        visibility(state) {
            doc.visibilityState = state;
            doc.dispatchEvent(new Event('visibilitychange'));
        },
    };
}

test('hiding cancels the timer and returning schedules exactly one check', async () => {
    const page = browser();
    let calls = 0;
    const stop = startVisibleSyncPoll({ run: () => calls++, interval: () => 3500, initialDelay: 1500 }, page);
    assert.deepEqual(page.delays, [1500]);
    page.visibility('hidden');
    page.win.dispatchEvent(new Event('pagehide'));
    assert.deepEqual(page.delays, []);
    page.visibility('visible');
    page.win.dispatchEvent(new Event('pageshow'));
    assert.deepEqual(page.delays, [0]);
    await page.tick();
    assert.equal(calls, 1);
    assert.deepEqual(page.delays, [3500]);
    stop();
    assert.deepEqual(page.delays, []);
});

test('aborts the in-flight check without starting a second one before it settles', async () => {
    const page = browser();
    let signal, finish;
    const stop = startVisibleSyncPoll({
        run: nextSignal => { signal = nextSignal; return new Promise(resolve => { finish = resolve; }); },
        interval: () => 15000,
        initialDelay: 15000,
    }, page);
    const check = page.tick();
    page.visibility('hidden');
    assert.equal(signal.aborted, true);
    page.visibility('visible');
    assert.deepEqual(page.delays, []);
    finish();
    await check;
    assert.deepEqual(page.delays, [0]);
    stop();
});

test('consecutive failures back off and success restores the normal interval', async () => {
    const page = browser();
    let fail = true;
    const stop = startVisibleSyncPoll({
        run: () => { if (fail) throw new Error('offline'); },
        interval: () => 8000,
        initialDelay: 0,
    }, page);
    await page.tick();
    assert.deepEqual(page.delays, [16000]);
    await page.tick();
    assert.deepEqual(page.delays, [30000]);
    page.advance(180000);
    page.win.dispatchEvent(new Event('touchstart'));
    assert.deepEqual(page.delays, [30000]);
    fail = false;
    await page.tick();
    assert.deepEqual(page.delays, [8000]);
    stop();
});

for (const [client, interval, activeDelay, quietDelay] of [
    ['child', idleFor => idleFor < 120000 ? 3500 : 8000, 3500, 8000],
    ['parent', () => 15000, 15000, 15000],
]) {
    test(`${client} slows down after long idle and wakes once on touch or scroll`, async () => {
        const page = browser();
        let calls = 0;
        const stop = startVisibleSyncPoll({ run: () => calls++, interval, initialDelay: 0 }, page);
        await page.tick();
        assert.deepEqual(page.delays, [activeDelay]);
        page.advance(120000);
        await page.tick();
        assert.deepEqual(page.delays, [quietDelay]);
        page.advance(60000);
        await page.tick();
        assert.deepEqual(page.delays, [30000]);

        page.win.dispatchEvent(new Event('touchstart'));
        page.win.dispatchEvent(new Event('scroll'));
        assert.deepEqual(page.delays, [0]);
        await page.tick();
        assert.equal(calls, 4);
        assert.deepEqual(page.delays, [activeDelay]);
        stop();
    });
}
