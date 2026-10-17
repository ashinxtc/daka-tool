import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pushRequest} from '../src/utils/pushTransport.js';
import {pushApiUrl} from '../src/constants/api.js';
import {deploymentEndpoints,STAGING_SERVICES} from '../shared/deployment.js';
import vm from 'node:vm';

test('staging endpoints never inherit production proxies and refuse production hosts',()=>{
    for(const host of ['localhost','127.0.0.1','preview.vercel.app','staging.example.test']){
        const endpoints=deploymentEndpoints('staging',host);
        for(const service of ['sync','exchange','push'])assert.equal(endpoints[service],STAGING_SERVICES[service]);
        assert.equal(endpoints.wecom,'https://disabled.invalid');
    }
    for(const host of ['www.daka-tool.top','daka-tool.top','daka-tool.vip'])assert.throws(()=>deploymentEndpoints('staging',host));
    assert.equal(deploymentEndpoints('production','www.daka-tool.top').push,'');
    assert.notEqual(deploymentEndpoints('production','daka-tool.top.evil.test').push,'');
    const config=JSON.parse(readFileSync(new URL('../vercel.staging.json',import.meta.url)));
    assert.equal(config.outputDirectory,'dist-staging');assert.deepEqual(config.rewrites,[]);
});

test('notification clicks cannot leave the subscription origin or focus a production tab',async()=>{
    const handlers={},origin='https://isolated-preview.example.test';let opened,focused=false;
    const sandbox={URL,self:{location:{origin},addEventListener:(name,fn)=>handlers[name]=fn},
        clients:{matchAll:async()=>[{url:'https://www.daka-tool.top/',focus:()=>{focused=true;}}],openWindow:url=>{opened=url;}}};
    vm.runInNewContext(readFileSync(new URL('../public/sw.js',import.meta.url),'utf8'),sandbox);
    for(const value of ['https://daka-tool.vip/','https://evil.test/','javascript:alert(1)',undefined]){
        let pending;handlers.notificationclick({notification:{data:{url:value},close(){}},waitUntil:p=>{pending=p;}});
        await pending;assert.equal(opened,origin+'/');assert.equal(focused,false);
    }
    assert.equal(sandbox.notificationUrl('/parent.html'),origin+'/parent.html');
});

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
