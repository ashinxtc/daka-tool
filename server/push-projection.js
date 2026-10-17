import {AccessError,ACCESS_KEY} from './family-access.js';
import {verifyService} from './service-identity.js';
export async function pushProjection(family,request){
    await verifyService(request,family.env.PUSH_SERVICE_SECRET);
    if(!['active','paused'].includes(family.env.SYNC_MODE))throw new AccessError(503,'PUSH_PAUSED','推送读取尚未启用。');
    const url=new URL(request.url),code=url.searchParams.get('code'),child=url.searchParams.get('child'),device=url.searchParams.get('device');
    await family.initialize(code);
    return family.ctx.storage.transaction(async tx=>{
        if(await family.access.required(tx)){
            const state=await tx.get(ACCESS_KEY),entry=Object.values(state?.devices||{}).find(d=>d.id===device);
            if(!entry||!['main','parent'].includes(entry.role)||entry.revokedAt||entry.expiresAt<=Date.now())throw new AccessError(403,'DEVICE_REVOKED','推送设备需要重新配对。');
        }
        const data=await family.exchangeSnapshot(tx),profiles=JSON.parse(data.app_profiles_v1||'[]');
        if(!profiles.some(p=>p.name===child))throw new AccessError(404,'CHILD_MISSING','未找到孩子。');
        // Only reminder inputs for this child. Never balances, messages, secrets or credentials.
        const tasks=JSON.parse(data.app_tasks_v2||'{}'),checkins=JSON.parse(data.app_checkins_v2||'{}');
        return {app_tasks_v2:JSON.stringify({[child]:(tasks[child]||[]).map(({id,frequencyType,startDate})=>({id,frequencyType,startDate}))}),app_checkins_v2:JSON.stringify({[child]:Object.fromEntries(Object.entries(checkins[child]||{}).map(([id,dates])=>[id,Object.fromEntries(Object.entries(dates).map(([date,value])=>[date,!!value]))]))})};
    });
}
