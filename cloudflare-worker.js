import { json } from './server/sync-family.js';
export { SyncFamily } from './server/sync-family.js';
const cors = {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, If-Match, Idempotency-Key, Authorization, X-Device-Id, X-Device-Role, X-Device-Fingerprint',
    'Access-Control-Expose-Headers': 'ETag, X-Sync-Protocol, X-Sync-Revision, X-Family-Auth', 'Cache-Control': 'no-store',
};
const withCors = response => {
    const result = new Response(response.body, response);
    for (const [key, value] of Object.entries(cors)) result.headers.set(key, value);
    return result;
};
export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
        const url = new URL(request.url), code = url.searchParams.get('code');
        if (!code || code.length < 4 || code.length > 32 || !/^[\w一-鿿-]+$/.test(code)) return withCors(json({ error: '同步码需为 4-32 位字母、数字、中文、连字符或下划线。' }, 400));
        const authRoute=url.pathname.startsWith('/auth/')||url.pathname.startsWith('/exchange/')||url.pathname==='/services/push';
        if (!authRoute&&!['/', '/ts', '/bak'].includes(url.pathname)) return withCors(json({ error: 'Not found' }, 404));
        if (!['GET', 'POST'].includes(request.method) || (request.method === 'POST' && url.pathname !== '/'&&!authRoute)) return withCors(json({ error: 'Method not allowed' }, 405));
        try {
            // Read-only cutover lets legacy KV replicas converge before one-time
            // import. There is deliberately no unsafe write fallback.
            if (!authRoute&&!['active','paused'].includes(env.SYNC_MODE)) {
                if (request.method !== 'GET') return withCors(json({ error: '云同步正在升级，本机修改已保留，请稍后重试。', code: 'UPGRADE_PAUSED' }, 503));
                // Even a rollback must consult the persisted family lock. Never
                // serve the old, potentially secret-bearing KV snapshot here.
            }
            if (!env.SYNC_FAMILIES) return withCors(json({ error: '同步服务配置未完成，本机数据不会被覆盖。', code: 'CONFIGURATION_REQUIRED' }, 503));
            if (!authRoute&&env.SYNC_MODE==='paused' && request.method==='POST') return withCors(json({error:'云端保存暂时暂停，本机修改已保留。',code:'UPGRADE_PAUSED'},503));
            return withCors(await env.SYNC_FAMILIES.get(env.SYNC_FAMILIES.idFromName(code)).fetch(request));
        } catch {
            return withCors(json({ error: '云端暂时不可用，请稍后重试。', code: 'STORAGE_UNAVAILABLE' }, 503));
        }
    }
};
