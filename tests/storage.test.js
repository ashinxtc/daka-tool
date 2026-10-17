import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
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
