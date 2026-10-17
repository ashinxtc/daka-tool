import {test} from 'node:test';
import assert from 'node:assert/strict';
import {auditMigration} from '../scripts/migration-audit.mjs';
const before={app_profiles_v1:'[{"name":"孩子"}]',app_wheel_history:'{"孩子-BASE":1000}',app_deepseek_api_key:'"private"'};
const after={app_profiles_v1:'[{"name":"孩子"}]',app_wheel_history:'{"孩子-BASE":1000}',app_authorized_parents_v1:'[]',_syncTs:123};
test('migration audit rejects shared-storage foreign application data even with valid profiles',()=>{
    for(const extra of [{_app:'beautifulChina',childrenData:{child:{answers:{}}}},{childrenData:{}}]){
        const foreign={...after,...extra};
        assert.throws(()=>auditMigration({before:foreign,after,orders:[],offlineOrders:[]}),/其他应用/);
        assert.throws(()=>auditMigration({before,after:foreign,orders:[],offlineOrders:[]}),/其他应用/);
    }
});
test('migration audit compares business data while enforcing secret removal and explicit order inventories',()=>{
    const input={before,after,orders:[],offlineOrders:[]};
    assert.equal(auditMigration(input).dataChecksPassed,true);
    assert.equal(auditMigration({...input,after:{...after,app_wheel_history:'{}'}}).dataChecksPassed,false);
    assert.equal(auditMigration({...input,after:before}).dataChecksPassed,false);
    assert.equal(auditMigration({...input,orders:[{id:'a',status:'pending'}]}).unresolvedOrders,1);
    assert.equal(auditMigration({...input,offlineOrders:[{status:'pending'}]}).unresolvedOrders,1);
    assert.equal(auditMigration({...input,orders:[{id:'a',status:'verified'},{id:'a',status:'verified'}]}).duplicateOrderIds,1);
    assert.throws(()=>auditMigration({...input,offlineOrders:undefined}));
    assert.ok(!JSON.stringify(auditMigration(input)).includes('private'));
});
