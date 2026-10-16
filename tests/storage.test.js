import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory, IDBDatabase } from 'fake-indexeddb';
class LocalStorage {
    data = new Map(); fail = false;
    get length() { return this.data.size; }
    key(i) { return [...this.data.keys()][i] ?? null; }
    getItem(k) { return this.data.get(k) ?? null; }
    setItem(k,v) { if(this.fail) throw new Error('QuotaExceededError'); this.data.set(k,String(v)); }
    removeItem(k) { this.data.delete(k); }
}
async function environment(idb=true) {
    const win = new EventTarget(); win.localStorage=new LocalStorage();
    win.indexedDB=idb ? new IDBFactory() : undefined;
    globalThis.window=win;
    const module=await import(`../src/utils/storage.js?test=${Math.random()}`);
    return {win,...module};
}
test('failed migration retains the original copy and can retry after reload', async () => {
    const env = await environment();
    const original = '{"孩子":[{"id":"math","name":"数学"}]}';
    env.win.localStorage.setItem('app_tasks_v2', original);
    const transaction = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function(...args) {
        if (args[1] === 'readwrite') throw new Error('simulated disk failure');
        return transaction.apply(this, args);
    };
    try {
        assert.equal(await env.initStorage(), false);
        assert.equal(env.win.localStorage.getItem('_storage_migrated_v1'), null);
        assert.equal(env.win.localStorage.getItem('app_tasks_v2'), original);
    } finally { IDBDatabase.prototype.transaction = transaction; }
    const reloaded = await import(`../src/utils/storage.js?retry=${Math.random()}`);
    assert.equal(await reloaded.initStorage(), true);
    assert.equal(reloaded.storage.getItem('app_tasks_v2'), original);
    assert.equal(env.win.localStorage.getItem('_storage_migrated_v1'), 'true');
});
test('slow IndexedDB must finish loading before initialization reports ready', async () => {
    const env = await environment(); await env.initStorage();
    env.storage.setItem('app_tasks_v2', '{"孩子":[{"id":"saved"}]}'); await env.storage.flush();
    const factory = env.win.indexedDB;
    env.win.indexedDB = { open(...args) {
        const req = {};
        setTimeout(() => {
            const actual = factory.open(...args);
            for (const name of ['onsuccess','onerror','onblocked','onupgradeneeded']) actual[name] = e => req[name]?.(e);
        }, 1700);
        return req;
    }};
    const reloaded = await import(`../src/utils/storage.js?slow=${Math.random()}`);
    let ready = false;
    const boot = reloaded.initStorage().then(result => { ready = result; });
    await new Promise(resolve => setTimeout(resolve, 1550));
    assert.equal(ready, false);
    await boot;
    assert.equal(ready, true);
    assert.equal(reloaded.storage.getItem('app_tasks_v2'), '{"孩子":[{"id":"saved"}]}');
});
test('read errors are not accepted as an empty database', async () => {
    const env = await environment(); await env.initStorage();
    const transaction = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function(...args) {
        if (args[1] === 'readonly') throw new Error('simulated read failure');
        return transaction.apply(this, args);
    };
    try {
        const reloaded = await import(`../src/utils/storage.js?readFailure=${Math.random()}`);
        assert.equal(await reloaded.initStorage(), false);
    } finally { IDBDatabase.prototype.transaction = transaction; }
});
test('pagehide preserves pending string settings, task changes and key versions', async () => {
    const env = await environment(); await env.initStorage();
    env.win._pendingWrites = { app_theme:'gold', app_tasks_v2:{孩子:[{id:'new'}]} };
    env.win.dispatchEvent(new Event('pagehide'));
    await env.storage.flush();
    const reloaded = await import(`../src/utils/storage.js?pagehide=${Math.random()}`); await reloaded.initStorage();
    assert.equal(JSON.parse(reloaded.storage.getItem('app_theme')), 'gold');
    assert.deepEqual(JSON.parse(reloaded.storage.getItem('app_tasks_v2')), {孩子:[{id:'new'}]});
    assert.ok(reloaded.storage.getKeyVersions().app_tasks_v2 > 0);
});
test('beforeunload preserves JSON encoding of pending strings', async () => {
    const env = await environment(); await env.initStorage();
    env.win._pendingWrites = { app_settings_password:'1234' };
    env.win.dispatchEvent(new Event('beforeunload')); await env.storage.flush();
    assert.equal(JSON.parse(env.storage.getItem('app_settings_password')), '1234');
});
test('localStorage fallback retains failed writes for a later retry', async () => {
    const env = await environment(false); await env.initStorage();
    env.win.localStorage.fail = true;
    env.storage.setItem('app_tasks_v2', '{"孩子":[]}');
    assert.equal(await env.storage.flush(), false);
    env.win.localStorage.fail = false;
    assert.equal(await env.storage.flush(), true);
    assert.equal(env.win.localStorage.getItem('app_tasks_v2'), '{"孩子":[]}');
});
test('migration must replay an outstanding accounting journal before publishing ready',async()=>{
    const env=await environment();
    env.win.localStorage.setItem('app_wheel_history','{"old":100}');
    env.win.localStorage.setItem('_accounting_journal_v1',JSON.stringify({id:'interrupted',entries:{app_wheel_history:'{"old":100,"debit":-20}'}}));
    assert.equal(await env.initStorage(),true);
    assert.equal(env.storage.getItem('app_wheel_history'),'{"old":100,"debit":-20}');
});
test('suspension journals pending writes and replays pending deletions',async()=>{
    const env=await environment();await env.initStorage();
    env.storage.setItem('app_old_v1','{}');await env.storage.flush();
    const transaction=IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction=function(...args){if(args[1]==='readwrite')throw new Error('temporarily unavailable');return transaction.apply(this,args)};
    try {
        env.storage.setItem('app_tasks_v2','{"孩子":[]}');env.storage.removeItem('app_old_v1');
        await env.persistBeforeSuspend();
        const journal=JSON.parse(env.win.localStorage.getItem('_accounting_journal_v1'));
        assert.equal(journal.entries.app_tasks_v2,'{"孩子":[]}');assert.deepEqual(journal.deletedKeys,['app_old_v1']);
    } finally { IDBDatabase.prototype.transaction=transaction; }
    const reload=await import(`../src/utils/storage.js?deletion=${Math.random()}`);await reload.initStorage();
    assert.equal(reload.storage.getItem('app_old_v1'),null);
    assert.equal(reload.storage.getItem('app_tasks_v2'),'{"孩子":[]}');
    await env.storage.flush();
});
test('durable commit publishes all values and survives a reload from IndexedDB',async()=>{
    const env=await environment(); await env.initStorage();
    env.commitDurable({ app_wheel_history:'{"debit":-20}',app_parent_actions_v1:'[{"status":"claimed"}]' });
    assert.equal(env.storage.getItem('app_wheel_history'),'{"debit":-20}');
    await env.storage.flush();
    const reloaded=await import(`../src/utils/storage.js?reload=${Math.random()}`); await reloaded.initStorage();
    assert.equal(reloaded.storage.getItem('app_wheel_history'),'{"debit":-20}');
    assert.equal(JSON.parse(reloaded.storage.getItem('app_parent_actions_v1'))[0].status,'claimed');
});
test('interrupted transaction journal repairs stale IDB before application mounts',async()=>{
    const env=await environment();await env.initStorage();
    env.storage.setItem('app_wheel_history','{}');await env.storage.flush();
    env.win.localStorage.setItem('_accounting_journal_v1',JSON.stringify({id:'crash',entries:{
        app_wheel_history:'{"debit":-20}',app_parent_actions_v1:'[{"status":"claimed"}]'}}));
    const reloaded=await import(`../src/utils/storage.js?crash=${Math.random()}`);await reloaded.initStorage();
    assert.equal(reloaded.storage.getItem('app_wheel_history'),'{"debit":-20}');
    assert.equal(env.win.localStorage.getItem('_accounting_journal_v1'),null);
});
test('rapid successive transactions retain earlier unflushed entries',async()=>{
    const env=await environment();await env.initStorage();
    env.commitDurable({app_wheel_history:'{"debit":-10}'});
    env.commitDurable({app_parent_deduction_receipts_v1:'{"ack":true}'});
    await env.storage.flush();
    const reloaded=await import(`../src/utils/storage.js?rapid=${Math.random()}`);await reloaded.initStorage();
    assert.equal(reloaded.storage.getItem('app_wheel_history'),'{"debit":-10}');
    assert.equal(reloaded.storage.getItem('app_parent_deduction_receipts_v1'),'{"ack":true}');
});
test('quota failure does not publish or claim a financial operation',async()=>{
    const env=await environment();await env.initStorage();env.win.localStorage.fail=true;
    assert.throws(()=>env.commitDurable({app_wheel_history:'{"debit":-10}'}),/Quota/);
    assert.equal(env.storage.getItem('app_wheel_history'),null);
});
test('without IndexedDB, accounting commits and journal recovery use localStorage',async()=>{
    const env=await environment(false);await env.initStorage();
    env.commitDurable({app_wheel_history:'{"debit":-10}'});await env.storage.flush();
    assert.equal(env.win.localStorage.getItem('app_wheel_history'),'{"debit":-10}');
});
