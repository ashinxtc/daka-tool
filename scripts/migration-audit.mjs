// Read-only comparison of explicitly exported, frozen snapshots. Never prints values.
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {canonical,isSecretKey} from '../shared/access-policy.js';
const ignored=new Set(['_syncTs','_keyVersions','app_sync_code','app_sync_last_time','app_test_mode','app_authorized_parents_v1']);
function business(snapshot){
    if(!snapshot||Array.isArray(snapshot)||typeof snapshot!=='object')throw new Error('快照必须为原始对象。');
    if('_app' in snapshot || 'childrenData' in snapshot)throw new Error('检测到其他应用或未确认来源的快照，必须先隔离服务并确认来源，不能作为打卡数据迁移。');
    const result={};
    for(const [key,value] of Object.entries(snapshot)){
        if(ignored.has(key)||isSecretKey(key))continue;
        if(!key.startsWith('app_')||typeof value!=='string')throw new Error('快照格式无效。');
        try{result[key]=JSON.parse(value);}catch{result[key]=value;}
    }
    if(!Array.isArray(result.app_profiles_v1)||!result.app_profiles_v1.length)throw new Error('快照缺少有效家庭成员。');
    return result;
}
export function auditMigration({before,after,orders,offlineOrders}){
    const old=business(before),next=business(after);
    if(!Array.isArray(orders)||!Array.isArray(offlineOrders))throw new Error('必须提供旧兑换订单与离线票据清单；不能省略。');
    const changedKeys=[...new Set([...Object.keys(old),...Object.keys(next)])].filter(k=>canonical(old[k])!==canonical(next[k]));
    const remainingSecretKeys=Object.keys(after).filter(isSecretKey);
    const unresolvedOrders=[...orders,...offlineOrders].filter(o=>!o||!['verified','cancelled','expired'].includes(o.status)).length;
    const ids=orders.map(o=>o?.id||o?.applyId),duplicateOrderIds=ids.length-new Set(ids).size;
    const invalidOrderIds=ids.filter(id=>typeof id!=='string'||!id).length;
    return {dataChecksPassed:!changedKeys.length&&!remainingSecretKeys.length&&!unresolvedOrders&&!duplicateOrderIds&&!invalidOrderIds,
        changedKeys,remainingSecretKeys,unresolvedOrders,duplicateOrderIds,invalidOrderIds,
        familyMembers:next.app_profiles_v1.length,
        requiresExternalAcceptance:['冻结后的导出基准已核实','所有使用中的客户端已升级并配对','旧密钥已轮换且历史副本已按保留策略处理','独立云环境及推送实际送达验收','生产备份及暂停/恢复步骤已验证']};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
    const files=process.argv.slice(2);
    if(files.length!==4){console.error('Usage: node scripts/migration-audit.mjs frozen-before.json protected-after.json legacy-orders.json offline-orders.json');process.exitCode=2;}
    else try{
        const [before,after,orders,offlineOrders]=await Promise.all(files.map(async file=>JSON.parse(await readFile(file,'utf8'))));
        const result=auditMigration({before,after,orders,offlineOrders});console.log(JSON.stringify(result,null,2));if(!result.dataChecksPassed)process.exitCode=2;
    }catch{console.error('无法核对导出文件：检查文件是否存在、JSON 格式、原始快照结构与订单清单。未修改任何数据。');process.exitCode=2;}
}
