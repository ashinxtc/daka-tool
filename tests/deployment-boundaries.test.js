import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pushRequest} from '../src/utils/pushTransport.js';
import {pushApiUrl} from '../src/constants/api.js';

test('staging resources cannot reuse production storage, services, domains or timers',()=>{
    const ids=new Set();
    const production=['wrangler.toml','exchange-wrangler.toml','push-wrangler.toml'].map(p=>readFileSync(new URL('../'+p,import.meta.url),'utf8')).join('\n');
    for(const service of ['sync','exchange','push']){
        const c=JSON.parse(readFileSync(new URL(`../${service}-staging.wrangler.json`,import.meta.url)));
        assert.equal(c.name,`daka-${service}-staging`);
        assert.equal(c.routes,undefined);
        assert.deepEqual(c.triggers.crons,[]);
        assert.equal(c.kv_namespaces.length,1);
        for(const kv of c.kv_namespaces){assert.match(kv.id,/^[a-f0-9]{32}$/);assert.ok(!production.includes(kv.id));assert.ok(!ids.has(kv.id));ids.add(kv.id);}
        for(const binding of c.services||[])assert.equal(binding.service,'daka-sync-staging');
        if(service==='sync'){
            assert.equal(c.vars.AUTH_MODE,'enforced');
            assert.equal(c.vars.SYNC_MODE,'active');
            assert.deepEqual(c.migrations[0].new_sqlite_classes,['SyncFamily']);
            assert.equal(c.durable_objects.bindings[0].script_name,undefined);
        }
        assert.ok(!JSON.stringify(c).includes('SECRET'));
    }
});

test('all push operations and VAPID fetch use the dedicated same-origin route',async()=>{
    const access={credential:()=>null,required:()=>false};
    const routes=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url))).rewrites;
    assert.ok(routes.findIndex(r=>r.source==='/api/push/:match*')<routes.findIndex(r=>r.source==='/api/:match*'));
    for(const operation of ['subscribe','unsubscribe','test-push','notify-sync','push-status']){
        let requested;
        await pushRequest(operation,{syncCode:'test-family'},{endpoint:'',access,fetchImpl:async url=>{requested=url;return new Response('{"ok":true}');}});
        assert.equal(requested,`/api/push/${operation}`);
    }
    assert.equal(pushApiUrl('vapid-key',''),'/api/push/vapid-key');
    assert.equal(pushApiUrl('subscribe','https://push.test'),'https://push.test/api/subscribe');
});
