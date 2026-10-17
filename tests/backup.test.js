import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory, IDBObjectStore, IDBDatabase } from 'fake-indexeddb';
import { parseBackup } from '../src/utils/backup.js';

class LocalStorage {
    data = new Map();
    get length() { return this.data.size; }
    key(i) { return [...this.data.keys()][i] ?? null; }
    getItem(k) { return this.data.get(k) ?? null; }
    setItem(k,v) { this.data.set(k,String(v)); }
    removeItem(k) { this.data.delete(k); }
}
const valid = { version:'2.0', _allSyncData:{app_profiles_v1:'[{"name":"孩子"}]',app_tasks_v2:'{"孩子":[]}',app_wheel_history:'{"credit":100}'} };
test('legacy aliases, full snapshots and raw keys preserve false, zero and empty passwords', () => {
    const entries = parseBackup({version:'1.0',profiles:[{name:'孩子'}],testMode:false,settingsPassword:'""',
        wheelHistory:'{"credit":100}',_allSyncData:{app_exchange_total_孩子:0},app_theme:'"gold"'});
    assert.equal(entries.app_test_mode,'false'); assert.equal(entries.app_settings_password,'""');
    assert.equal(entries.app_exchange_total_孩子,'0');assert.equal(entries.app_theme,'"gold"');
});
test('reject malformed versions, members, tasks, amounts and receipt containers', () => {
    for (const data of [[],{}, {version:'99'}, {version:'2.0',_allSyncData:[]},
        {version:'2.0',profiles:'{}'}, {version:'2.0',profiles:'[{"name":12}]'},
        {version:'2.0',tasks:'{"孩子":{}}'}, {version:'2.0',wheelHistory:'{"debit":"bad"}'},
        {version:'2.0',deductionReceipts:'[]'}, {version:'2.0',tasks:'{broken'}]) assert.throws(()=>parseBackup(data));
});

test('restoration commits all values, retains the previous snapshot, and repairs mirrors after reload', async () => {
    const win=new EventTarget();win.localStorage=new LocalStorage();win.indexedDB=new IDBFactory();globalThis.window=win;
    const env=await import(`../src/utils/storage.js?restore=${Math.random()}`);
    await env.initStorage();
    env.storage.setItem('app_wheel_history','{"credit":200}');
    env.storage.setItem('app_settings_password','"old"');await env.storage.flush();
    const imported={...parseBackup(valid),app_settings_password:'"new"'};
    const epoch=env.getStorageState().epoch;
    const restoring=env.restoreEntries(imported);
    assert.equal(env.canSyncStorage(),false);
    assert.throws(()=>env.storage.setItem('app_tasks_v2','{}'),/正在恢复/);
    await restoring;
    assert.notEqual(env.getStorageState().epoch,epoch);
    assert.equal(env.canSyncStorage(),true);
    assert.equal(env.storage.getItem('app_wheel_history'),'{"credit":100}');
    assert.equal(env.getPreRestoreBackup()._allSyncData.app_wheel_history,'{"credit":200}');
    const reload=await import(`../src/utils/storage.js?afterRestore=${Math.random()}`);await reload.initStorage();
    assert.equal(reload.storage.getItem('app_settings_password'),'"new"');
    assert.equal(reload.storage.getItem('app_tasks_v2'),'{"孩子":[]}');
    assert.ok(reload.storage.getKeyVersions().app_tasks_v2);
});
test('a failure partway through the restore transaction leaves both memory and disk unchanged',async()=>{
    const win=new EventTarget();win.localStorage=new LocalStorage();win.indexedDB=new IDBFactory();globalThis.window=win;
    const env=await import(`../src/utils/storage.js?abort=${Math.random()}`);await env.initStorage();
    env.storage.setItem('app_wheel_history','{"credit":200}');env.storage.setItem('app_tasks_v2','{"old":[]}');await env.storage.flush();
    const original=IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put=function(value,key){if(key==='app_tasks_v2') throw new Error('injected quota failure');return original.call(this,value,key)};
    try { await assert.rejects(env.restoreEntries(parseBackup(valid))); }
    finally { IDBObjectStore.prototype.put=original; }
    assert.equal(env.getStorageState().phase,'ready');
    assert.equal(env.storage.getItem('app_wheel_history'),'{"credit":200}');
    const reload=await import(`../src/utils/storage.js?afterAbort=${Math.random()}`);await reload.initStorage();
    assert.equal(reload.storage.getItem('app_wheel_history'),'{"credit":200}');
    assert.equal(reload.storage.getItem('app_profiles_v1'),null);
    assert.equal(reload.getPreRestoreBackup(),null);
});

test('committed restore wins over stale fast-boot mirrors when a page closes before mirror repair',async()=>{
    const win=new EventTarget();win.localStorage=new LocalStorage();win.indexedDB=new IDBFactory();globalThis.window=win;
    const env=await import(`../src/utils/storage.js?mirrors=${Math.random()}`);await env.initStorage();
    env.storage.setItem('app_settings_password','"old"');await env.storage.flush();
    const set=win.localStorage.setItem.bind(win.localStorage);
    win.localStorage.setItem=(key,value)=>{if(key==='app_settings_password')throw new Error('mirror quota');set(key,value)};
    await env.restoreEntries({app_settings_password:'"new"'});
    assert.equal(win.localStorage.getItem('app_settings_password'),'"old"');
    win.localStorage.setItem=set;
    const reload=await import(`../src/utils/storage.js?mirrorReload=${Math.random()}`);await reload.initStorage();
    assert.equal(reload.storage.getItem('app_settings_password'),'"new"');
    assert.equal(win.localStorage.getItem('app_settings_password'),'"new"');
});

test('asynchronous transaction abort rolls back the entire restore',async()=>{
    const win=new EventTarget();win.localStorage=new LocalStorage();win.indexedDB=new IDBFactory();globalThis.window=win;
    const env=await import(`../src/utils/storage.js?asyncAbort=${Math.random()}`);await env.initStorage();
    env.storage.setItem('app_wheel_history','{"credit":200}');await env.storage.flush();
    const put=IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put=function(value,key){const req=put.call(this,value,key);if(key==='app_wheel_history')req.onsuccess=()=>this.transaction.abort();return req};
    try { await assert.rejects(env.restoreEntries(parseBackup(valid)),/恢复写入失败/); }
    finally { IDBObjectStore.prototype.put=put; }
    const reload=await import(`../src/utils/storage.js?abortedReload=${Math.random()}`);await reload.initStorage();
    assert.equal(reload.storage.getItem('app_wheel_history'),'{"credit":200}');
    assert.equal(reload.storage.getItem('app_profiles_v1'),null);
});

test('localStorage-only restore supports success and rolls back a partial quota failure',async()=>{
    const win=new EventTarget();win.localStorage=new LocalStorage();globalThis.window=win;
    const env=await import(`../src/utils/storage.js?fallbackRestore=${Math.random()}`);await env.initStorage();
    env.storage.setItem('app_wheel_history','{"credit":200}');await env.storage.flush();
    const set=win.localStorage.setItem.bind(win.localStorage);
    win.localStorage.setItem=(key,value)=>{if(key==='app_tasks_v2')throw new Error('quota');set(key,value)};
    await assert.rejects(env.restoreEntries(parseBackup(valid)),/quota/);
    assert.equal(win.localStorage.getItem('app_wheel_history'),'{"credit":200}');
    assert.equal(win.localStorage.getItem('app_profiles_v1'),null);
    assert.equal(win.localStorage.getItem('_restore_fallback_v1'),null);
    win.localStorage.setItem=set;
    await env.restoreEntries(parseBackup(valid));
    const reload=await import(`../src/utils/storage.js?fallbackReload=${Math.random()}`);await reload.initStorage();
    assert.equal(reload.storage.getItem('app_wheel_history'),'{"credit":100}');
    assert.equal(reload.getPreRestoreBackup()._allSyncData.app_wheel_history,'{"credit":200}');
});

test('interrupted localStorage-only restoration rolls back before the application starts',async()=>{
    const win=new EventTarget();win.localStorage=new LocalStorage();globalThis.window=win;
    win.localStorage.setItem('app_wheel_history','{"partial":10}');
    win.localStorage.setItem('app_profiles_v1','[{"name":"new"}]');
    win.localStorage.setItem('_restore_fallback_v1',JSON.stringify({before:{app_wheel_history:'{"original":100}',app_profiles_v1:null}}));
    const env=await import(`../src/utils/storage.js?interruptedRestore=${Math.random()}`);await env.initStorage();
    assert.equal(env.storage.getItem('app_wheel_history'),'{"original":100}');
    assert.equal(env.storage.getItem('app_profiles_v1'),null);
});

test('failed fallback rollback blocks the App until the retained original snapshot can recover',async()=>{
    const win=new EventTarget();win.localStorage=new LocalStorage();globalThis.window=win;
    const env=await import(`../src/utils/storage.js?rollbackFailure=${Math.random()}`);await env.initStorage();
    env.storage.setItem('app_tasks_v2','{"original":[]}');await env.storage.flush();
    const set=win.localStorage.setItem.bind(win.localStorage);
    win.localStorage.setItem=(key,value)=>{if(key==='app_tasks_v2')throw new Error('storage inaccessible');set(key,value)};
    await assert.rejects(env.restoreEntries(parseBackup(valid)));
    assert.equal(env.getStorageState().phase,'error');assert.equal(env.canSyncStorage(),false);
    assert.ok(win.localStorage.getItem('_restore_fallback_v1'));
    win.localStorage.setItem=set;
    const reload=await import(`../src/utils/storage.js?rollbackRetry=${Math.random()}`);
    assert.equal(await reload.initStorage(),true);
    assert.equal(reload.storage.getItem('app_tasks_v2'),'{"original":[]}');
    assert.equal(reload.storage.getItem('app_profiles_v1'),null);
});
