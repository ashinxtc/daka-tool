import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Miniflare } from 'miniflare';
import worker from '../cloudflare-worker.js';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
let mf, kv;
const payload = extra => ({ app_profiles_v1: JSON.stringify([{ id:'c', name:'孩子' }]), app_parent_actions_v1:'[]', ...extra });
const get = (code, path = '/') => mf.dispatchFetch(`https://sync.test${path}?code=${code}`);
const post = (code, data, revision, id = crypto.randomUUID()) => mf.dispatchFetch(`https://sync.test/?code=${code}`, {
    method:'POST', headers:{'Content-Type':'application/json','If-Match':`"${revision}"`,'Idempotency-Key':id}, body:JSON.stringify(data) });
before(async () => {
    mf = new Miniflare({ modules:true, modulesRules:[{type:'ESModule',include:['**/*.js']}], scriptPath:'cloudflare-worker.js', compatibilityDate:'2026-07-30',
        durableObjects:{SYNC_FAMILIES:{className:'SyncFamily',useSQLite:true}}, kvNamespaces:['DAKA_SYNC'], bindings:{SYNC_MODE:'active'} });
    kv = await mf.getKVNamespace('DAKA_SYNC');
});
after(async () => { await mf?.dispose(); });
test('same base revision concurrent writes commit exactly once; rejected request leaves snapshot unchanged', async () => {
    const code='race-family'; await kv.put(`sync:${code}`,JSON.stringify(payload()));
    const a=payload({app_parent_actions_v1:'[{"id":"a"}]'}), b=payload({app_parent_actions_v1:'[{"id":"b"}]'});
    const responses=await Promise.all([post(code,a,1),post(code,b,1)]);
    assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
    const current=await (await get(code)).json(), backup=await (await get(code,'/bak')).json();
    assert.ok(['[{"id":"a"}]','[{"id":"b"}]'].includes(current.app_parent_actions_v1));
    assert.equal(backup.app_parent_actions_v1,'[]');
    assert.equal((await (await get(code,'/ts')).json()).revision,2);
});
test('lost response retry survives other writes and binds operation ID to exact bytes', async () => {
    const code='retry-family', id=crypto.randomUUID(), body=payload();
    const first=await (await post(code,body,0,id)).json();
    await post(code,payload({app_theme:'"blue"'}),1);
    const replay=await post(code,body,0,id); assert.equal(replay.status,200);
    assert.deepEqual(await replay.json(),{...first,replayed:true});
    assert.equal((await post(code,payload({app_theme:'"red"'}),0,id)).status,409);
    assert.equal((await (await get(code,'/ts')).json()).revision,2);
});
test('server clock is authoritative; old clients cannot bypass conditional writes', async () => {
    const code='clock-family', now=Date.now();
    const response=await post(code,payload({_syncTs:9999999999999}),0);
    const receipt=await response.json(); assert.ok(receipt.ts>=now && receipt.ts<Date.now()+1000);
    const old=await mf.dispatchFetch(`https://sync.test/?code=${code}`,{method:'POST',body:JSON.stringify(payload())});
    assert.equal(old.status,428);
    assert.equal((await get(code)).headers.get('X-Sync-Revision'),'1');
    assert.match(old.headers.get('Access-Control-Expose-Headers'),/X-Sync-Revision/);
});
test('migration is one-time, large unicode data roundtrips, profile guard does not rotate backup', async () => {
    const code='chunk-family', large='甲骨🌟'.repeat(30000);
    await kv.put(`sync:${code}`,JSON.stringify(payload({app_notes:JSON.stringify(large)})));
    assert.equal(JSON.parse((await (await get(code)).json()).app_notes),large);
    await kv.put(`sync:${code}`,JSON.stringify(payload({app_notes:'"obsolete"'})));
    assert.equal(JSON.parse((await (await get(code)).json()).app_notes),large);
    assert.equal((await post(code,payload({app_profiles_v1:'[]'}),1)).status,409);
    assert.equal((await get(code,'/bak')).status,404);
    assert.equal((await (await get(code,'/ts')).json()).revision,1);
});
test('invalid requests, unknown routes and missing families have explicit non-success results', async () => {
    assert.equal((await get('x')).status,400);
    assert.equal((await get('none-family')).status,404);
    assert.equal((await get('none-family','/unknown')).status,404);
    assert.equal((await post('none-family',[],0)).status,400);
    const preflight=await mf.dispatchFetch('https://sync.test/',{method:'OPTIONS'});
    assert.equal(preflight.status,204); assert.match(preflight.headers.get('Access-Control-Allow-Headers'),/If-Match/);
});
test('cutover and rollback pause writes without falling back to non-transactional KV',async()=>{
    const request=()=>new Request('https://sync.test/?code=cutover-family',{method:'POST',body:'{}'});
    const unavailable=await worker.fetch(request(),{SYNC_MODE:'active'});
    assert.equal(unavailable.status,503);assert.equal((await unavailable.json()).code,'CONFIGURATION_REQUIRED');
    const readonly=await worker.fetch(request(),{SYNC_MODE:'readonly'});
    assert.equal(readonly.status,503);
    let reads=0;
    const env={SYNC_MODE:'paused',SYNC_FAMILIES:{idFromName:x=>x,get:()=>({fetch:async()=>{reads++;return new Response('{"current":true}');}})}};
    assert.equal((await worker.fetch(request(),env)).status,503);assert.equal(reads,0);
    assert.equal((await (await worker.fetch(new Request('https://sync.test/?code=cutover-family'),env)).json()).current,true);
    assert.equal(reads,1);
});
test('runtime restart retains revision, current snapshot, backup and idempotency receipt',async()=>{
    const directory=await mkdtemp(join(tmpdir(),'daka-sync-persist-'));
    const options={modules:true,modulesRules:[{type:'ESModule',include:['**/*.js']}],scriptPath:'cloudflare-worker.js',
        compatibilityDate:'2026-07-30',durableObjects:{SYNC_FAMILIES:{className:'SyncFamily',useSQLite:true}},
        durableObjectsPersist:join(directory,'objects'),kvNamespaces:['DAKA_SYNC'],kvPersist:join(directory,'kv'),bindings:{SYNC_MODE:'active'}};
    let runtime;
    const url='https://sync.test/?code=restart-family',id=crypto.randomUUID();
    const request={method:'POST',headers:{'If-Match':'"0"','Idempotency-Key':id},body:JSON.stringify(payload())};
    try {
        runtime=new Miniflare(options);
        const accepted=await (await runtime.dispatchFetch(url,request)).json();
        assert.equal(accepted.revision,1);
        await runtime.dispatchFetch(url,{...request,headers:{'If-Match':'"1"','Idempotency-Key':crypto.randomUUID()},body:JSON.stringify(payload({app_theme:'"blue"'}))});
        await runtime.dispose();runtime=new Miniflare(options);
        const replay=await runtime.dispatchFetch(url,request);
        assert.equal(replay.status,200);assert.deepEqual(await replay.json(),{...accepted,replayed:true});
        const current=await runtime.dispatchFetch(url);assert.equal(current.headers.get('X-Sync-Revision'),'2');
        assert.equal((await current.json()).app_theme,'"blue"');
        assert.equal((await (await runtime.dispatchFetch('https://sync.test/bak?code=restart-family')).json()).app_theme,undefined);
    } finally {await runtime?.dispose();await rm(directory,{recursive:true,force:true});}
});
