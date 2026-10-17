import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSyncCoordinator,updateSyncKeys,appendParentAction} from '../src/utils/syncCoordinator.js';
const pack=x=>Object.fromEntries(Object.entries(x).map(([k,v])=>[k,JSON.stringify(v)]));
function server(initial={}) {
    let data=initial,revision=1;const operations=new Map();let drop=false;
    return {setDrop:()=>{drop=true;},data:()=>data,revision:()=>revision,mutate:next=>{data=next;revision++;},
        fetchImpl:async(url,options={})=>{
            if(options.method!=='POST')return new Response(JSON.stringify(data),{headers:{'X-Sync-Protocol':'2','X-Sync-Revision':String(revision)}});
            const key=options.headers['Idempotency-Key'],seen=operations.get(key);
            if(seen)return new Response(JSON.stringify(seen));
            if(options.headers['If-Match']!==`"${revision}"`)return new Response(JSON.stringify({code:'REVISION_CONFLICT'}),{status:409});
            data=JSON.parse(options.body);data._syncTs=Date.now();revision++;
            const receipt={ok:true,revision,ts:data._syncTs};operations.set(key,receipt);
            if(drop){drop=false;throw new TypeError('response lost');}
            return new Response(JSON.stringify(receipt));
        }};
}
function client(remote,initial) {
    let local=initial,cp=null,context=null,valid=true;
    const api=createSyncCoordinator({code:'family',readLocal:()=>local,loadCheckpoint:()=>cp,
        saveCheckpoint:p=>{cp=structuredClone(p);},applyMerged:(data,p)=>{local=data;cp=structuredClone(p);},
        isCurrent:()=>valid,onConflict:c=>{context=c;},transport:{fetchImpl:remote.fetchImpl,delay:async()=>{}}});
    return {api,local:()=>local,checkpoint:()=>cp,conflict:()=>context,edit:x=>{local=x;},invalidate:()=>{valid=false;}};
}
test('two devices preserve independent edits through actual conflict/rebase, and lost ACK is idempotent',async()=>{
    const initial=pack({app_tasks:{a:1,b:1}}),s=server(initial),a=client(s,initial),b=client(s,initial);
    await a.api.pull();await b.api.pull();a.edit(pack({app_tasks:{a:2,b:1}}));b.edit(pack({app_tasks:{a:1,b:3}}));
    await a.api.push();s.setDrop();await b.api.push();
    assert.deepEqual(JSON.parse(s.data().app_tasks),{a:2,b:3});assert.equal(s.revision(),3);
    await a.api.pull();assert.equal(a.local().app_tasks,b.local().app_tasks);
});
test('same-field conflict does not write, and explicit resolution keeps other changes',async()=>{
    const initial=pack({app_config:{x:1,y:1}}),s=server(initial),c=client(s,initial);await c.api.pull();
    c.edit(pack({app_config:{x:2,y:1}}));s.mutate(pack({app_config:{x:3,y:4}}));
    await assert.rejects(c.api.pull(),{code:'MERGE_CONFLICT'});assert.equal(s.revision(),2);
    assert.equal(JSON.parse(c.local().app_config).x,2);
    await c.api.resolveConflict(c.conflict(),'local');await c.api.push();
    assert.deepEqual(JSON.parse(s.data().app_config),{x:2,y:4});
});
test('stale conflict choices are re-reviewed; context changes prevent applying old responses',async()=>{
    const initial=pack({app_config:1}),s=server(initial),c=client(s,initial);await c.api.pull();
    c.edit(pack({app_config:2}));s.mutate(pack({app_config:3}));await assert.rejects(c.api.pull());
    const old=c.conflict();s.mutate(pack({app_config:4}));
    await assert.rejects(c.api.resolveConflict(old,'local'),{code:'MERGE_CONFLICT'});
    assert.equal(c.conflict().remote.revision,3);c.invalidate();
    await assert.rejects(c.api.pull(),{code:'CONTEXT_CHANGED'});assert.equal(c.local().app_config,'2');
});
test('acknowledgement does not replace edits made during upload',async()=>{
    const initial=pack({app_config:1}),s=server(initial);let local=initial,cp={code:'family',protocol:2,revision:1,data:initial};
    const api=createSyncCoordinator({code:'family',readLocal:()=>local,loadCheckpoint:()=>cp,saveCheckpoint:p=>{cp=p;},applyMerged:()=>{},
        transport:{fetchImpl:async(...args)=>{const response=await s.fetchImpl(...args);local=pack({app_config:3});return response;}}});
    local=pack({app_config:2});await api.push();assert.equal(local.app_config,'3');assert.equal(cp.data.app_config,'2');
});
test('parent replay after reload retains processed command and independent additions',async()=>{
    const action={id:'a',type:'deduction',amount:10,targetChild:'孩子',timestamp:1,status:'pending'};
    const base=pack({app_parent_actions_v1:[]}),s=server(base),intent=pack({app_parent_actions_v1:[action]});
    await updateSyncKeys('family',base,intent,{fetchImpl:s.fetchImpl});
    s.mutate(pack({app_parent_actions_v1:[{...action,status:'processed'},{id:'b',status:'pending'}]}));
    const before=s.revision();const result=await updateSyncKeys('family',base,intent,{fetchImpl:s.fetchImpl});
    assert.equal(s.revision(),before);assert.equal(JSON.parse(result.app_parent_actions_v1)[0].status,'processed');
    assert.equal(JSON.parse(result.app_parent_actions_v1).length,2);
});
test('history trimming preserves every pending command while a child is offline',()=>{
    const pending=Array.from({length:105},(_,i)=>({id:`pending-${i}`,status:'pending'}));
    const result=appendParentAction([...pending,{id:'old',status:'claimed'}],{id:'new',status:'pending'});
    assert.equal(result.length,106);assert.ok(pending.every(p=>result.includes(p)));
    assert.ok(!result.some(p=>p.id==='old'));
});
