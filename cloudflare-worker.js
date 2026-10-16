import { json } from './server/sync-family.js';
export { SyncFamily } from './server/sync-family.js';
const cors = {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, If-Match, Idempotency-Key',
    'Access-Control-Expose-Headers': 'ETag, X-Sync-Protocol, X-Sync-Revision', 'Cache-Control': 'no-store',
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
        if (!['/', '/ts', '/bak'].includes(url.pathname)) return withCors(json({ error: 'Not found' }, 404));
        if (!['GET', 'POST'].includes(request.method) || (request.method === 'POST' && url.pathname !== '/')) return withCors(json({ error: 'Method not allowed' }, 405));
        try {
            // Read-only cutover lets legacy KV replicas converge before one-time
            // import. There is deliberately no unsafe write fallback.
            if (!['active','paused'].includes(env.SYNC_MODE)) {
                if (request.method !== 'GET') return withCors(json({ error: '云同步正在升级，本机修改已保留，请稍后重试。', code: 'UPGRADE_PAUSED' }, 503));
                const raw = await env.DAKA_SYNC.get(`sync:${code}${url.pathname === '/bak' ? ':bak' : ''}`);
                const data = raw ? JSON.parse(raw) : null;
                const body = url.pathname === '/ts' ? { ts: data?._syncTs || 0 } : data || { error: '未找到数据' };
                return withCors(new Response(JSON.stringify(body), { status: data || url.pathname === '/ts' ? 200 : 404,
                    headers: { 'Content-Type': 'application/json', 'X-Sync-Protocol': '1' } }));
            }
            if (!env.SYNC_FAMILIES) return withCors(json({ error: '同步服务配置未完成，本机数据不会被覆盖。', code: 'CONFIGURATION_REQUIRED' }, 503));
            if (env.SYNC_MODE==='paused' && request.method==='POST') return withCors(json({error:'云端保存暂时暂停，本机修改已保留。',code:'UPGRADE_PAUSED'},503));
            return withCors(await env.SYNC_FAMILIES.get(env.SYNC_FAMILIES.idFromName(code)).fetch(request));
        } catch {
            return withCors(json({ error: '云端暂时不可用，请稍后重试。', code: 'STORAGE_UNAVAILABLE' }, 503));
        }
    }
};
