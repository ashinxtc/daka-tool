// Cloudflare Worker — 企业微信亲子互动服务
// 独立部署，不影响现有同步服务 (cloudflare-worker.js)
//
// 部署步骤：
// 1. wrangler init daka-wecom → 选择 "Hello World" Worker
// 2. 用此文件替换 src/index.js
// 3. 创建 KV 命名空间 "WECOM_KV" → wrangler kv namespace create WECOM_KV
// 4. 将 ID 填入 wrangler.toml 的 kv_namespaces
// 5. 设置环境变量 (wrangler.toml [vars]) 和 Secrets (wrangler secret put XXX)
// 6. wrangler deploy
// 7. 在企业微信管理后台设置回调 URL 为 https://your-domain/api/wecom/callback

// ============================================================
// 企业微信消息加解密模块（AES-256-CBC, PKCS#7）
// ============================================================

class WXBizMsgCrypt {
    constructor(token, encodingAesKey, corpId) {
        this.token = token;
        this.corpId = corpId;
        // EncodingAESKey 是 43 字符的 Base64 编码，解码为 32 字节密钥
        this.aesKey = base64Decode(encodingAesKey + '=');
        this.iv = this.aesKey.slice(0, 16);
    }

    // 验证签名
    verifySignature(msgSignature, timestamp, nonce, encrypted) {
        const arr = [this.token, timestamp, nonce, encrypted].sort();
        const str = arr.join('');
        const hash = sha1(str);
        return hash === msgSignature;
    }

    // 解密消息
    decrypt(encrypted) {
        const decipher = aesCbcDecrypt(this.aesKey, this.iv, base64Decode(encrypted));
        // 格式: [16字节随机][4字节消息长度][消息内容][CorpID]
        // 跳过16字节随机数
        const msgLenBytes = decipher.slice(16, 20);
        const msgLen = (msgLenBytes[0] << 24) | (msgLenBytes[1] << 16) | (msgLenBytes[2] << 8) | msgLenBytes[3];
        const msgContent = decipher.slice(20, 20 + msgLen);
        const fromCorpId = decipher.slice(20 + msgLen).toString();
        return { message: msgContent.toString(), fromCorpId };
    }

    // 加密消息
    encrypt(message) {
        const msgBuf = new TextEncoder().encode(message);
        const msgLen = msgBuf.length;
        // 16字节随机数
        const random = crypto.getRandomValues(new Uint8Array(16));
        // 4字节消息长度（大端序）
        const lenBuf = new Uint8Array([
            (msgLen >>> 24) & 0xff,
            (msgLen >>> 16) & 0xff,
            (msgLen >>> 8) & 0xff,
            msgLen & 0xff
        ]);
        const corpIdBuf = new TextEncoder().encode(this.corpId);
        // 拼接: [random][len][msg][corpId]
        const plainBuf = new Uint8Array(16 + 4 + msgLen + corpIdBuf.length);
        plainBuf.set(random, 0);
        plainBuf.set(lenBuf, 16);
        plainBuf.set(msgBuf, 20);
        plainBuf.set(corpIdBuf, 20 + msgLen);
        // PKCS#7 填充
        const blockSize = 32;
        const padLen = blockSize - (plainBuf.length % blockSize);
        const paddedBuf = new Uint8Array(plainBuf.length + padLen);
        paddedBuf.set(plainBuf);
        for (let i = plainBuf.length; i < paddedBuf.length; i++) {
            paddedBuf[i] = padLen;
        }
        const encrypted = aesCbcEncrypt(this.aesKey, this.iv, paddedBuf);
        return base64Encode(encrypted);
    }

    // 生成回复的加密 XML
    encryptReplyXml(replyMsg, timestamp, nonce) {
        const encrypted = this.encrypt(replyMsg);
        const arr = [this.token, timestamp, nonce, encrypted].sort();
        const signature = sha1(arr.join(''));
        return `<xml>
<Encrypt><![CDATA[${encrypted}]]></Encrypt>
<MsgSignature><![CDATA[${signature}]]></MsgSignature>
<TimeStamp>${timestamp}</TimeStamp>
<Nonce><![CDATA[${nonce}]]></Nonce>
</xml>`;
    }
}

// ============================================================
// 加密工具函数（Web Crypto API 兼容）
// ============================================================

function base64Decode(str) {
    // URL-safe Base64 → Standard Base64
    const standard = str.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(standard);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function base64Encode(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function sha1(str) {
    // 使用简单 SHA1 实现（Worker 环境不支持 Node crypto）
    const buf = new TextEncoder().encode(str);
    // 使用 SubtleCrypto
    // 注意：SubtleCrypto.digest 是 async 的，但这里需要 sync
    // Cloudflare Worker 支持 crypto.subtle
    // 但我们用同步方式——使用纯 JS 实现
    return sha1Sync(buf);
}

// 同步 SHA1 实现
function sha1Sync(buf) {
    let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
    const msg = new Uint8Array(buf.length + 64 + 4);
    msg.set(buf, 0);
    msg[buf.length] = 0x80;
    const bitLen = buf.length * 8;
    msg[msg.length - 4] = (bitLen >>> 24) & 0xff;
    msg[msg.length - 3] = (bitLen >>> 16) & 0xff;
    msg[msg.length - 2] = (bitLen >>> 8) & 0xff;
    msg[msg.length - 1] = bitLen & 0xff;
    const totalBlocks = Math.ceil(msg.length / 64);
    for (let i = 0; i < totalBlocks; i++) {
        const w = new Uint32Array(80);
        const offset = i * 64;
        if (offset + 64 > msg.length) break;
        for (let j = 0; j < 16; j++) {
            w[j] = (msg[offset + j*4] << 24) | (msg[offset + j*4+1] << 16) | (msg[offset + j*4+2] << 8) | msg[offset + j*4+3];
        }
        for (let j = 16; j < 80; j++) {
            w[j] = rotl(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
        }
        let a = h0, b = h1, c = h2, d = h3, e = h4;
        for (let j = 0; j < 80; j++) {
            let f, k;
            if (j < 20) { f = (b & c) | (~b & d); k = 0x5A827999; }
            else if (j < 40) { f = b ^ c ^ d; k = 0x6ED9EBA1; }
            else if (j < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8F1BBCDC; }
            else { f = b ^ c ^ d; k = 0xCA62C1D6; }
            const temp = (rotl(a, 5) + f + e + k + w[j]) | 0;
            e = d; d = c; c = rotl(b, 30); b = a; a = temp;
        }
        h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
    }
    return [h0, h1, h2, h3, h4].map(n => (n >>> 0).toString(16).padStart(8, '0')).join('');
}

function rotl(n, s) {
    return ((n << s) | (n >>> (32 - s))) >>> 0;
}

// AES-CBC 使用 Web Crypto API（同步包装用 async）
async function aesCbcDecryptAsync(key, iv, data) {
    const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['decrypt']);
    const result = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, data);
    return new Uint8Array(result);
}

async function aesCbcEncryptAsync(key, iv, data) {
    const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['encrypt']);
    const result = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, data);
    return new Uint8Array(result);
}

// 包装为同步调用（SHA1 和 AES 在 Cloudflare Worker 中可用 SubtleCrypto）
// 注意：Cloudflare Worker 的 fetch handler 是 async，所以可以用 await

// ============================================================
// XML 解析（轻量级，无需外部库）
// ============================================================

function parseXml(xml) {
    const result = {};
    const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\1>|<(\w+)>(.*?)<\/\3>/gs;
    let match;
    while ((match = regex.exec(xml)) !== null) {
        const key = match[1] || match[3];
        const value = match[2] !== undefined ? match[2] : match[4];
        result[key] = value;
    }
    return result;
}

// ============================================================
// 路由和主逻辑
// ============================================================

export default {
    async fetch(request, env) {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // ===== 企业微信回调 =====
            if (path === '/api/wecom/callback') {
                return await handleWecomCallback(request, env, corsHeaders);
            }

            // ===== 向家长群发送消息（Webhook） =====
            if (path === '/api/wecom/send' && request.method === 'POST') {
                return await handleWecomSend(request, env, corsHeaders);
            }

            // ===== 家长消息相关 =====
            if (path === '/api/family/messages') {
                if (request.method === 'GET') {
                    return await handleFamilyMessagesGet(request, env, corsHeaders);
                }
                if (request.method === 'POST') {
                    return await handleFamilyMessagePost(request, env, corsHeaders);
                }
                if (request.method === 'DELETE') {
                    return await handleFamilyMessageDelete(request, env, corsHeaders);
                }
            }

            // ===== 测试连接 =====
            if (path === '/api/wecom/test' && request.method === 'GET') {
                return await handleWecomTest(env, corsHeaders);
            }

            return new Response(JSON.stringify({ error: 'Not found' }), {
                status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};

// ============================================================
// 企业微信回调处理
// ============================================================

async function handleWecomCallback(request, env, corsHeaders) {
    const url = new URL(request.url);
    const msgSignature = url.searchParams.get('msg_signature') || '';
    const timestamp = url.searchParams.get('timestamp') || '';
    const nonce = url.searchParams.get('nonce') || '';

    const crypt = new WXBizMsgCrypt(env.WECOM_TOKEN, env.WECOM_ENCODING_AES_KEY, env.WECOM_CORP_ID);

    // GET — URL 验证（一次性，配置回调时触发）
    if (request.method === 'GET') {
        const echostr = url.searchParams.get('echostr') || '';
        const { message } = crypt.decrypt(decodeURIComponent(echostr));
        return new Response(message, { headers: { 'Content-Type': 'text/plain' } });
    }

    // POST — 接收消息
    if (request.method === 'POST') {
        const body = await request.text();
        const encryptMatch = body.match(/<Encrypt><!\[CDATA\[(.*?)\]\]><\/Encrypt>/);
        if (!encryptMatch) {
            return new Response('success', { headers: { 'Content-Type': 'text/plain' } });
        }
        const encrypted = encryptMatch[1];

        // 验证签名
        if (!crypt.verifySignature(msgSignature, timestamp, nonce, encrypted)) {
            return new Response('Invalid signature', { status: 403 });
        }

        // 解密
        const { message } = crypt.decrypt(encrypted);
        const msgData = parseXml(message);

        // 处理不同类型的消息
        const msgType = msgData.MsgType;
        const fromUser = msgData.FromUserName;
        const agentId = msgData.AgentID;

        if (msgType === 'text') {
            const content = msgData.Content;
            const syncCode = await getSyncCodeByUser(env, fromUser);
            if (syncCode) {
                await storeFamilyMessage(env, syncCode, {
                    from: fromUser,
                    content: content,
                    type: 'text',
                    timestamp: Date.now(),
                    read: false,
                    direction: 'parent_to_child'
                });
            }
        }

        // 返回 success（企业微信要求）
        return new Response('success', { headers: { 'Content-Type': 'text/plain' } });
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
}

// ============================================================
// Webhook 发送到群
// ============================================================

async function handleWecomSend(request, env, corsHeaders) {
    const body = await request.json();
    const { syncCode, msgtype, content } = body;

    if (!syncCode || !content) {
        return new Response(JSON.stringify({ error: '缺少 syncCode 或 content' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    const webhookKey = env.WECOM_WEBHOOK_KEY;
    if (!webhookKey) {
        return new Response(JSON.stringify({ error: 'Webhook Key 未配置' }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // 检查每日发送上限
    const today = new Date().toISOString().slice(0, 10);
    const dailyCountKey = `wecom_daily_count:${syncCode}:${today}`;
    const currentCount = parseInt(await env.WECOM_KV.get(dailyCountKey) || '0');
    if (currentCount >= 10) {
        return new Response(JSON.stringify({ error: '今日发送次数已达上限(10次)' }), {
            status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // 构建 Webhook 消息
    const webhookBody = {
        msgtype: msgtype || 'markdown',
        ...(msgtype === 'text' ? { text: { content } } : { markdown: { content } })
    };

    const webhookUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${webhookKey}`;
    const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookBody)
    });

    const result = await resp.json();

    if (result.errcode === 0) {
        // 更新每日计数
        await env.WECOM_KV.put(dailyCountKey, String(currentCount + 1), { expirationTtl: 86400 });
        return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } else {
        return new Response(JSON.stringify({ error: result.errmsg, code: result.errcode }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

// ============================================================
// 家长消息存储与读取
// ============================================================

async function storeFamilyMessage(env, syncCode, message) {
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const key = `wecom_msg:${syncCode}:${msgId}`;

    // 存储消息，7 天过期
    await env.WECOM_KV.put(key, JSON.stringify(message), { expirationTtl: 7 * 86400 });

    // 更新索引（最近 50 条）
    const indexKey = `wecom_msg_index:${syncCode}`;
    let index = JSON.parse(await env.WECOM_KV.get(indexKey) || '[]');
    index.push(msgId);
    // 保留最近 50 条
    if (index.length > 50) {
        const removed = index.splice(0, index.length - 50);
        // 清理过期消息
        for (const oldId of removed) {
            await env.WECOM_KV.delete(`wecom_msg:${syncCode}:${oldId}`);
        }
    }
    await env.WECOM_KV.put(indexKey, JSON.stringify(index));
}

async function handleFamilyMessagesGet(request, env, corsHeaders) {
    const url = new URL(request.url);
    const syncCode = url.searchParams.get('code');
    if (!syncCode) {
        return new Response(JSON.stringify({ error: '缺少同步码' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    const indexKey = `wecom_msg_index:${syncCode}`;
    const index = JSON.parse(await env.WECOM_KV.get(indexKey) || '[]');

    const messages = [];
    for (const msgId of index) {
        const key = `wecom_msg:${syncCode}:${msgId}`;
        const data = await env.WECOM_KV.get(key);
        if (data) {
            messages.push({ id: msgId, ...JSON.parse(data) });
        }
    }

    return new Response(JSON.stringify({ messages }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function handleFamilyMessagePost(request, env, corsHeaders) {
    const body = await request.json();
    const { syncCode, content, childName } = body;

    if (!syncCode || !content) {
        return new Response(JSON.stringify({ error: '缺少参数' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // 存储消息（孩子发送的）
    await storeFamilyMessage(env, syncCode, {
        from: childName || '孩子',
        content: content,
        type: 'text',
        timestamp: Date.now(),
        read: false,
        direction: 'child_to_parent'
    });

    // 通过应用消息 API 推送通知给家长（如果配置了）
    // 注意：需要家长的 userid，这里简化处理
    // 实际场景中需要建立 syncCode → parentUserid 的映射

    return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function handleFamilyMessageDelete(request, env, corsHeaders) {
    const body = await request.json();
    const { syncCode, msgId } = body;

    if (!syncCode || !msgId) {
        return new Response(JSON.stringify({ error: '缺少参数' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    const key = `wecom_msg:${syncCode}:${msgId}`;
    const data = await env.WECOM_KV.get(key);
    if (data) {
        const msg = JSON.parse(data);
        msg.read = true;
        await env.WECOM_KV.put(key, JSON.stringify(msg), { expirationTtl: 7 * 86400 });
    }

    return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// ============================================================
// 测试连接
// ============================================================

async function handleWecomTest(env, corsHeaders) {
    const webhookKey = env.WECOM_WEBHOOK_KEY;
    if (!webhookKey) {
        return new Response(JSON.stringify({ ok: false, error: 'Webhook Key 未配置' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    const webhookUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${webhookKey}`;
    const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            msgtype: 'text',
            text: { content: '🔗 打卡工具企业微信连接测试成功！' }
        })
    });

    const result = await resp.json();
    return new Response(JSON.stringify({
        ok: result.errcode === 0,
        error: result.errcode !== 0 ? result.errmsg : null
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// ============================================================
// 辅助函数
// ============================================================

async function getSyncCodeByUser(env, userId) {
    // 从 KV 获取 userId 对应的 syncCode
    const mapping = await env.WECOM_KV.get(`wecom_user_mapping:${userId}`);
    return mapping;
}
