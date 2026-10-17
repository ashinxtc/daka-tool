import {syncFetch} from './deviceAccess.js';
import {SYNC_WORKER_URL} from '../constants/api.js';
export const SYNC_ENDPOINT = SYNC_WORKER_URL;
export class SyncRequestError extends Error {
    constructor(message, status, code, details) { super(message); Object.assign(this, { status, code, details }); }
}
export const newSyncOperationId = () => crypto.randomUUID ? crypto.randomUUID() :
    [...crypto.getRandomValues(new Uint8Array(24))].map(n => n.toString(16).padStart(2, '0')).join('');
export function syncMetadata(response) {
    const protocol = Number(response.headers.get('X-Sync-Protocol') || 1);
    const raw = response.headers.get('X-Sync-Revision'), revision = raw === null ? null : Number(raw);
    if (protocol === 2 && (!Number.isSafeInteger(revision) || revision < 0)) {
        if (response.ok || response.status === 404) throw new SyncRequestError('服务器未返回有效同步版本，请稍后重试。',502,'INVALID_REVISION');
    }
    return { protocol, revision };
}
export async function checkedSyncJson(response) {
    let body; try { body = await response.json(); } catch { throw new SyncRequestError('服务器响应格式无效，未确认保存。',response.status,'INVALID_RESPONSE'); }
    if (!response.ok) throw new SyncRequestError(body.error || `同步失败 (${response.status})`,response.status,body.code,body);
    return body;
}
export async function readSyncSnapshot(code, { fetchImpl = syncFetch, endpoint = SYNC_ENDPOINT, minProtocol = 1 } = {}) {
    const response = await fetchImpl(`${endpoint}/?code=${encodeURIComponent(code)}`, {cache:'no-store'});
    const meta = syncMetadata(response);
    if (meta.protocol < minProtocol) throw new SyncRequestError('服务器版本回退，已保留本机操作并暂停同步。',409,'PROTOCOL_DOWNGRADE');
    if (response.status === 404) return { ...meta, data:{}, exists:false };
    return { ...meta, data:await checkedSyncJson(response), exists:true };
}
export async function writeSyncSnapshot(code, data, base, { fetchImpl = syncFetch, endpoint = SYNC_ENDPOINT,
    operationId = newSyncOperationId(), isCurrent = () => true, delay = ms => new Promise(r => setTimeout(r,ms)) } = {}) {
    const body = JSON.stringify(data); // Frozen bytes and ID across ambiguous failures.
    const headers = {'Content-Type':'application/json'};
    if (base.protocol === 2) {
        if (!Number.isSafeInteger(base.revision) || base.revision < 0) throw new SyncRequestError('请先读取云端版本。',428,'BASE_REQUIRED');
        headers['If-Match'] = `"${base.revision}"`; headers['Idempotency-Key'] = operationId;
    }
    for (let attempt=0; attempt<3; attempt++) {
        if (!isCurrent()) throw new SyncRequestError('同步上下文已变化，本次操作已停止。',409,'CONTEXT_CHANGED');
        let response;
        try { response=await fetchImpl(`${endpoint}/?code=${encodeURIComponent(code)}`,{method:'POST',headers,body}); }
        catch (error) {
            if (attempt===2 || base.protocol!==2) throw error;
            await delay(400*(attempt+1)); continue;
        }
        if (!isCurrent()) throw new SyncRequestError('同步上下文已变化，本次操作已停止。',409,'CONTEXT_CHANGED');
        if ([429,502,503,504].includes(response.status) && attempt<2 && base.protocol===2) {
            // Upgrade pauses need no repeated network work.
            const probe=await response.clone().json().catch(()=>({}));
            if (probe.code==='UPGRADE_PAUSED' || probe.code==='CONFIGURATION_REQUIRED') return checkedSyncJson(response);
            await delay(400*(attempt+1)); continue;
        }
        const result=await checkedSyncJson(response);
        if (result.ok !== true) throw new SyncRequestError('云端未确认保存成功。',502,'INVALID_RECEIPT');
        if (base.protocol===2 && (!Number.isSafeInteger(result.revision) || result.revision!==base.revision+1 || !Number.isFinite(result.ts))) throw new SyncRequestError('云端保存回执无效。',502,'INVALID_RECEIPT');
        return { ...result, protocol:base.protocol, data:{...data,_syncTs:result.ts ?? data._syncTs} };
    }
}
