import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFamilyForPush} from '../push-worker.js';
test('push reads authoritative data and never falls back to stale KV after a service error',async()=>{
    let reads=0;const env={PUSH_SERVICE_SECRET:'isolated-push-test-secret-at-least-32',DAKA_SYNC:{get:async()=>{reads++;return 'old';}},SYNC_SERVICE:{fetch:async()=>new Response('new')}};
    assert.equal(await readFamilyForPush(env,'family'),'new');assert.equal(reads,0);
    env.SYNC_SERVICE.fetch=async()=>new Response('offline',{status:503});
    await assert.rejects(readFamilyForPush(env,'family'));assert.equal(reads,0);
    delete env.SYNC_SERVICE;await assert.rejects(readFamilyForPush(env,'family'));assert.equal(reads,0);
});
