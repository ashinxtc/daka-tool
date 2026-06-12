// Cloudflare Worker — 打卡工具数据同步服务
// 部署步骤：
// 1. Cloudflare Dashboard → Workers & Pages → Create Worker
// 2. 粘贴此脚本 → Deploy
// 3. 创建 KV 命名空间 "daka-sync" → 绑定到 Worker（变量名 DAKA_SYNC）
// 4. 添加自定义域名路由：sync.daka-tool.top/* → daka-sync Worker
// 5. DNS 记录：sync.daka-tool.top CNAME daka-tool.top (Proxied)

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
            // POST — 上传数据
            if (request.method === 'POST') {
                const body = await request.text();
                // 验证是合法 JSON
                JSON.parse(body);
                // 存储，90 天过期
                await env.DAKA_SYNC.put(`sync:${code}`, body, { expirationTtl: 90 * 86400 });
                return new Response(
                    JSON.stringify({ ok: true, ts: Date.now() }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // GET — 下载数据
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
