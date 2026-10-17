import { mergeSyncSnapshots, stableStringify, syncValues } from './syncMerge.js';
import { readSyncSnapshot, writeSyncSnapshot, SyncRequestError } from './syncTransport.js';
export const SYNC_CHECKPOINT_KEY = '_sync_checkpoint_v2';
// The history cap must never discard commands an offline child has not handled.
export const appendParentAction = (actions, action, protectedMode=false) => [action, ...actions]
    .filter((item, index) => index < 100 || item.status === 'pending'||(protectedMode&&item.operatorDeviceId!==action.operatorDeviceId));
export class SyncConflictError extends Error {
    constructor(context) { super('两端同时修改了相同内容，已保留双方数据，请先处理同步冲突。'); this.code='MERGE_CONFLICT'; this.context=context; }
}
export function createSyncCoordinator({code,readLocal,loadCheckpoint,saveCheckpoint,applyMerged,
    firstMerge,mergeKey,isCurrent=()=>true,onConflict=()=>{},transport={}}) {
    const check=()=>{if(!isCurrent())throw new SyncRequestError('同步上下文已变化。',409,'CONTEXT_CHANGED');};
    const checkpoint=()=>{const p=loadCheckpoint();return p?.code===code&&p.protocol===2?p:null;};
    const preview=(remote,resolve={})=>{
        const local=readLocal(), prior=checkpoint();
        const result=prior?mergeSyncSnapshots(prior.data,local,remote.data,{resolve,mergeKey})
            : firstMerge?firstMerge(local,remote.data):mergeSyncSnapshots({},local,remote.data,{resolve,mergeKey});
        const context={base:prior?.data||{},local,remote,conflicts:result.conflicts};
        if(result.conflicts.length){onConflict(context);throw new SyncConflictError(context);}
        return {result,local};
    };
    const accept=(remote,result)=>{
        check();const next={code,protocol:2,revision:remote.revision,data:remote.data};
        applyMerged(result.data,next);
        return {remote,needUpload:stableStringify(syncValues(result.data))!==stableStringify(syncValues(remote.data))};
    };
    const pull=async(given)=>{
        const remote=given||await readSyncSnapshot(code,transport);check();
        if(remote.protocol!==2){
            if(checkpoint())throw new SyncRequestError('服务器版本回退，已暂停同步并保留本机数据。',409,'PROTOCOL_DOWNGRADE');
            return {remote,legacy:true};
        }
        return accept(remote,preview(remote).result);
    };
    const push=async()=>{
        if(!checkpoint()) {const result=await pull();if(result.legacy)return {legacy:true};}
        for(let attempt=0;attempt<3;attempt++) {
            check();const base=checkpoint(),local=readLocal();
            try {
                const receipt=await writeSyncSnapshot(code,local,base,{...transport,isCurrent});check();
                // Never overwrite edits made while awaiting the HTTP response.
                saveCheckpoint({code,protocol:2,revision:receipt.revision,data:receipt.data});
                return receipt;
            } catch(error) {
                if(error.code!=='REVISION_CONFLICT')throw error;
                await pull();
            }
        }
        throw new SyncRequestError('其他设备正在连续保存，本机修改已保留，请稍后重试。',409,'CONCURRENT_WRITES');
    };
    const resolveConflict=async(context,side)=>{
        const remote=await readSyncSnapshot(code,transport);check();
        if(remote.protocol!==2)throw new SyncRequestError('服务器版本已变化，请稍后重试。',409,'PROTOCOL_DOWNGRADE');
        if(remote.revision!==context.remote.revision || stableStringify(syncValues(readLocal()))!==stableStringify(syncValues(context.local))) {
            // The choice applies only to what the user reviewed.
            return pull(remote);
        }
        const resolve=Object.fromEntries(context.conflicts.map(c=>[c.key,side]));
        const result=mergeSyncSnapshots(context.base,context.local,remote.data,{resolve,mergeKey});
        if(result.conflicts.length){const fresh={...context,remote,conflicts:result.conflicts};onConflict(fresh);throw new SyncConflictError(fresh);}
        return accept(remote,result);
    };
    return {pull,push,resolveConflict};
}

// Parent operations modify only their named keys; they never reuse a stale whole
// family as a replacement. Intent can be persisted before sending and replayed.
export async function updateSyncKeys(code,base,updates,options={}) {
    const keys=Object.keys(updates), prior=Object.fromEntries(keys.filter(k=>k in (base||{})).map(k=>[k,base[k]]));
    for(let attempt=0;attempt<3;attempt++) {
        const remote=await readSyncSnapshot(code,options);
        if(!remote.exists)throw new SyncRequestError('家庭数据尚未上传，请先在主程序同步。',404,'FAMILY_NOT_FOUND');
        const current=Object.fromEntries(keys.filter(k=>k in remote.data).map(k=>[k,remote.data[k]]));
        const intent={...updates};
        for(const key of ['app_parent_actions_v1','app_global_messages_v2']) {
            if(!(key in intent))continue;
            const old=JSON.parse(prior[key]||'[]'),desired=JSON.parse(intent[key]),latest=JSON.parse(current[key]||'[]');
            const core=key==='app_parent_actions_v1'?['id','type','targetChild','amount','reason','operatorRole','operatorDeviceId','wheelType','count','timestamp']:['id','text','author','parentRole','operatorDeviceId','isParent','expire','timestamp'];
            intent[key]=JSON.stringify(desired.map(item=>{
                const found=latest.find(x=>x.id===item.id);
                if(!found || old.some(x=>x.id===item.id))return item;
                if(core.some(k=>stableStringify(found[k])!==stableStringify(item[k])))throw new SyncRequestError('同一操作编号的内容不一致，已停止提交。',409,'OPERATION_COLLISION');
                return found; // Already accepted, possibly processed since lost ACK.
            }));
        }
        const resolve=options.reviewedRevision===remote.revision ? options.resolve||{} : {};
        const merged=mergeSyncSnapshots(prior,intent,current,{resolve});
        if(merged.conflicts.length)throw new SyncConflictError({base:prior,local:intent,remote,conflicts:merged.conflicts});
        const data={...remote.data,...merged.data};
        if(stableStringify(syncValues(data))===stableStringify(syncValues(remote.data)))return remote.data;
        data._syncTs=Date.now();
        try {return (await writeSyncSnapshot(code,data,remote,options)).data;}
        catch(error){if(error.code!=='REVISION_CONFLICT')throw error;}
    }
    throw new SyncRequestError('其他设备正在保存，这笔操作已保留，请稍后重试。',409,'CONCURRENT_WRITES');
}
