import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeSyncSnapshots } from '../src/utils/syncMerge.js';
const pack = data => Object.fromEntries(Object.entries(data).map(([k,v])=>[k,JSON.stringify(v)]));
test('concurrent independent additions and child edits survive, regardless of device clocks',()=>{
    const base=pack({app_parent_actions_v1:[],app_tasks_v2:{孩子:[{id:'math',name:'数学',reward:1}]}});
    const local={...base,...pack({app_parent_actions_v1:[{id:'a',amount:10}]})};
    const remote=pack({app_parent_actions_v1:[{id:'b',amount:20}],app_tasks_v2:{孩子:[{id:'math',name:'数学',reward:2}]}});
    const result=mergeSyncSnapshots(base,local,remote);
    assert.deepEqual(result.conflicts,[]);
    assert.deepEqual(JSON.parse(result.data.app_parent_actions_v1).map(a=>a.id).sort(),['a','b']);
    assert.equal(JSON.parse(result.data.app_tasks_v2).孩子[0].reward,2);
});
test('same field conflicts are explicit and resolving one key preserves other device edits',()=>{
    const b=pack({app_theme:'old',app_tasks_v2:{孩子:[]}}),l=pack({app_theme:'blue',app_tasks_v2:{孩子:[]}});
    const r=pack({app_theme:'red',app_tasks_v2:{孩子:[{id:'x',name:'新任务'}]}});
    assert.equal(mergeSyncSnapshots(b,l,r).conflicts[0].key,'app_theme');
    const fixed=mergeSyncSnapshots(b,l,r,{resolve:{app_theme:'local'}});
    assert.equal(fixed.data.app_theme,'"blue"'); assert.equal(fixed.data.app_tasks_v2,r.app_tasks_v2);
});
test('one-sided deletion persists; delete/edit conflict and repeated inventory are not silently merged',()=>{
    const b=pack({app_tasks_v2:[{id:'a',name:'旧'}],app_inventory:['coin','coin']});
    const l=pack({app_tasks_v2:[],app_inventory:['coin']});
    assert.deepEqual(JSON.parse(mergeSyncSnapshots(b,l,b).data.app_tasks_v2),[]);
    const r=pack({app_tasks_v2:[{id:'a',name:'新'}],app_inventory:['coin','coin','coin']});
    assert.deepEqual(new Set(mergeSyncSnapshots(b,l,r).conflicts.map(c=>c.key)),new Set(['app_tasks_v2','app_inventory']));
});
test('processed command cannot be resurrected by unrelated addition on a stale device',()=>{
    const b=pack({app_parent_actions_v1:[{id:'a',status:'pending'}]});
    const l=pack({app_parent_actions_v1:[{id:'a',status:'pending'},{id:'b',status:'pending'}]});
    const r=pack({app_parent_actions_v1:[{id:'a',status:'processed'}]});
    const result=mergeSyncSnapshots(b,l,r); assert.equal(result.conflicts.length,0);
    assert.equal(JSON.parse(result.data.app_parent_actions_v1).find(a=>a.id==='a').status,'processed');
});
