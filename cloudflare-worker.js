// Cloudflare Worker — 打卡工具数据同步服务
// 部署步骤：
// 1. Cloudflare Dashboard → Workers & Pages → Create Worker
// 2. 粘贴此脚本 → Deploy
// 3. 创建 KV 命名空间 "daka-sync" → 绑定到 Worker（变量名 DAKA_SYNC）
// 4. 添加自定义域名路由：sync.daka-tool.top/* → daka-sync Worker
// 5. DNS 记录：sync.daka-tool.top CNAME daka-tool.top (Proxied)
//
// 接口：
//   POST /?code=xxx        — 上传数据（metadata 附带时间戳，不额外消耗写额度）
//   GET  /?code=xxx        — 下载完整数据
//   GET  /ts?code=xxx      — 仅返回云端时间戳（轻量轮询用，只读 metadata 不读 body）

export default {
    async fetch(request, env) {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const code = url.searchParams.get('code');

        // 校验同步码
        if (!code || code.length < 4 || code.length > 32) {
            return new Response(
                JSON.stringify({ error: '同步码长度需为 4-32 个字符' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 仅允许字母、数字、中文、连字符、下划线
        if (!/^[\w一-鿿-]+$/.test(code)) {
            return new Response(
                JSON.stringify({ error: '同步码只能包含字母、数字、中文、连字符、下划线' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        try {
            // GET /ts — 轻量时间戳查询（轮询专用）
            // 只读 metadata，不消费数据 body；响应仅几十字节
            if (request.method === 'GET' && url.pathname === '/ts') {
                const entry = await env.DAKA_SYNC.getWithMetadata(`sync:${code}`, { type: 'stream' });
                if (!entry || entry.value === null) {
                    return new Response(
                        JSON.stringify({ ts: 0 }),
                        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );
                }
                // 丢弃 body 流（不读取内容）
                try { entry.value.cancel(); } catch (e) {}
                const ts = (entry.metadata && entry.metadata.ts) || 0;
                return new Response(
                    JSON.stringify({ ts }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // POST — 上传数据
            if (request.method === 'POST') {
                const body = await request.text();
                // 验证是合法 JSON，并提取时间戳写入 metadata
                let ts = Date.now();
                try {
                    const parsed = JSON.parse(body);
                    if (parsed && typeof parsed._syncTs === 'number') ts = parsed._syncTs;
                } catch (e) {
                    return new Response(
                        JSON.stringify({ error: '请求体不是合法 JSON' }),
                        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );
                }
                // 存储，90 天过期；metadata 与主数据同一次写入，不额外计费
                await env.DAKA_SYNC.put(`sync:${code}`, body, {
                    expirationTtl: 90 * 86400,
                    metadata: { ts },
                });
                return new Response(
                    JSON.stringify({ ok: true, ts }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // GET — 下载完整数据
            if (request.method === 'GET') {
                const data = await env.DAKA_SYNC.get(`sync:${code}`);
                if (!data) {
                    return new Response(
                        JSON.stringify({ error: '未找到数据，请先在其他设备上传' }),
                        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );
                }
                return new Response(data, {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            return new Response('Method not allowed', { status: 405, headers: corsHeaders });
        } catch (e) {
            return new Response(
                JSON.stringify({ error: '服务器错误: ' + e.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }
    }
};
