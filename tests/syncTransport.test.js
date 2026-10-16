import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readSyncSnapshot,writeSyncSnapshot} from '../src/utils/syncTransport.js';
const response=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers});
test('ambiguous response retries exact body and ID; version conflict is not blindly retried',async()=>{
    const calls=[];
    const result=await writeSyncSnapshot('family', {app_theme:'"blue"'},{protocol:2,revision:4},{delay:async()=>{},fetchImpl:async(url,opts)=>{
        calls.push(opts); if(calls.length===1)throw new TypeError('network response lost');
        return response({ok:true,revision:5,ts:123});
    }});
    assert.equal(result.revision,5);assert.deepEqual(calls[0],calls[1]);
    let count=0;
    await assert.rejects(writeSyncSnapshot('family',{}, {protocol:2,revision:4},{fetchImpl:async()=>{count++;return response({error:'conflict',code:'REVISION_CONFLICT'},409);}}),{code:'REVISION_CONFLICT'});
    assert.equal(count,1);
});
test('new protocol never silently downgrades and bad receipts do not report success',async()=>{
    await assert.rejects(readSyncSnapshot('family',{fetchImpl:async()=>response({},200,{'X-Sync-Protocol':'2'})}),{code:'INVALID_REVISION'});
    await assert.rejects(writeSyncSnapshot('family',{}, {protocol:2,revision:4},{fetchImpl:async()=>response({ok:true,revision:3,ts:123})}),{code:'INVALID_RECEIPT'});
    await assert.rejects(writeSyncSnapshot('family',{}, {protocol:2,revision:4},{isCurrent:()=>false}),{code:'CONTEXT_CHANGED'});
});
test('old server remains readable during frontend-first rollout',async()=>{
    const old=await readSyncSnapshot('family',{fetchImpl:async()=>response({app_theme:'"old"'})});
    assert.equal(old.protocol,1);
    const empty=await readSyncSnapshot('family',{fetchImpl:async()=>response({error:'empty'},404,{'X-Sync-Protocol':'2','X-Sync-Revision':'0'})});
    assert.equal(empty.exists,false);assert.equal(empty.revision,0);
});
