// push-worker.js — Web Push Notification Worker
// daka-tool 打卡提醒推送服务
//
// 功能：
// 1. /api/subscribe — 存储推送订阅
// 2. /api/unsubscribe — 删除订阅
// 3. /api/test-push — 测试推送
// 4. Cron Trigger — 每天定时检查并推送

// ============================================================
// VAPID 签名和 Web Push 加密
// ============================================================

function base64UrlEncode(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
    const standard = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = standard + '='.repeat((4 - standard.length % 4) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function pkcs7Pad(data, blockSize) {
    const padLen = blockSize - (data.length % blockSize);
    const padded = new Uint8Array(data.length + padLen);
    padded.set(data);
    for (let i = data.length; i < padded.length; i++) padded[i] = padLen;
    return padded;
}

// SHA-256 hash
async function sha256(data) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
}

// HKDF-SHA256
async function hkdf(ikm, salt, info, length) {
    const prkKey = await crypto.subtle.importKey('raw', salt, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const prk = new Uint8Array(await crypto.subtle.sign('HMAC', prkKey, ikm));

    const infoBuf = new TextEncoder().encode(info);
    const result = new Uint8Array(length);
    let prev = new Uint8Array(0);
    let offset = 0;
    let counter = 1;

    while (offset < length) {
        const hmacKey = await crypto.subtle.importKey('raw', prk, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const input = new Uint8Array([...prev, ...infoBuf, counter]);
        prev = new Uint8Array(await crypto.subtle.sign('HMAC', hmacKey, input));
        result.set(prev.slice(0, Math.min(prev.length, length - offset)), offset);
        offset += prev.length;
        counter++;
    }
    return result;
}

// AES-128-CTR
async function aesCtrEncrypt(key, counter, data) {
    const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-CTR' }, false, ['encrypt']);
    return new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-CTR', counter: counter, length: 64 }, cryptoKey, data));
}

// ECDH
async function generateECDHKeyPair() {
    return await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
}

async function computeSharedSecret(privateKey, publicKeyBuffer) {
    const peerKey = await crypto.subtle.importKey('raw', publicKeyBuffer, { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: peerKey }, privateKey, 256));
}

// Web Push payload encryption (RFC 8291)
async function encryptPushPayload(payload, p256dh, auth) {
    const content = new TextEncoder().encode(payload);
    const keyPair = await generateECDHKeyPair();
    const senderPubKey = new Uint8Array(await crypto.subtle.exportKey('raw', keyPair.publicKey));
    const sharedSecret = await computeSharedSecret(keyPair.privateKey, base64UrlDecode(p256dh));

    const authSecret = base64UrlDecode(auth);
    const ikm = await hkdf(sharedSecret, authSecret, 'Content-Encoding: auth\x00', 32);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const prk = await hkdf(ikm, salt, 'Content-Encoding: aesgcm\x00', 32);

    const keyInfo = new Uint8Array([...new TextEncoder().encode('Content-Encoding: aesgcm\x00'), ...base64UrlDecode(p256dh)]);
    const key = (await hkdf(prk, new Uint8Array(0), keyInfo, 16)).slice(0, 16);

    const nonceInfo = new Uint8Array([...new TextEncoder().encode('Content-Encoding: nonce\x00'), ...base64UrlDecode(p256dh)]);
    const nonce = (await hkdf(prk, new Uint8Array(0), nonceInfo, 12)).slice(0, 12);

    const padded = pkcs7Pad(content, 16);
    const encrypted = await aesCtrEncrypt(key, nonce, padded);

    return { salt: base64UrlEncode(salt), publicKey: base64UrlEncode(senderPubKey), ciphertext: encrypted };
}

// Generate VAPID JWT
async function generateVapidJWT(audience, vapidPrivateKeyHex) {
    const header = { typ: 'JWT', alg: 'ES256' };
    const payload = {
        aud: audience,
        exp: Math.floor(Date.now() / 1000) + 3600,
        sub: 'mailto:daka-tool@noreply.com'
    };

    const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
    const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
    const signingInput = `${headerB64}.${payloadB64}`;

    // Import private key
    const privKeyDer = hexToUint8Array(vapidPrivateKeyHex);
    const privateKey = await crypto.subtle.importKey('pkcs8', privKeyDer, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);

    const signature = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, new TextEncoder().encode(signingInput)));

    // DER decode r and s
    const r = signature.slice(4, 4 + signature[3]);
    const s = signature.slice(4 + signature[3] + 2);

    const rPadded = new Uint8Array(32);
    const sPadded = new Uint8Array(32);
    rPadded.set(r.slice(Math.max(0, r.length - 32)));
    sPadded.set(s.slice(Math.max(0, s.length - 32)));

    const sigB64 = base64UrlEncode(new Uint8Array([...rPadded, ...sPadded]));
    return `${signingInput}.${sigB64}`;
}

function hexToUint8Array(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
}

// Send Web Push notification
async function sendWebPush(subscription, payload, vapidKeys) {
    const endpoint = subscription.endpoint;
    const p256dh = subscription.keys?.p256dh;
    const auth = subscription.keys?.auth;

    const audience = new URL(endpoint).origin;
    const jwt = await generateVapidJWT(audience, vapidKeys.privateKeyHex);

    let body = new Uint8Array(0);
    let headers = {
        'Authorization': `vapid t=${jwt}, k=${vapidKeys.publicKey}`,
        'Content-Type': 'application/octet-stream',
        'TTL': '86400'
    };

    if (p256dh && auth && payload) {
        const encrypted = await encryptPushPayload(payload, p256dh, auth);
        body = encrypted.ciphertext;
        headers['Content-Type'] = 'application/octet-stream';
        headers['Content-Encoding'] = 'aesgcm';
        headers['Encryption'] = `salt=${encrypted.salt}`;
        headers['Crypto-Key'] = `dh=${encrypted.publicKey}`;
    } else {
        headers['Content-Type'] = 'application/octet-stream';
        headers['Content-Length'] = '0';
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: body
    });

    return { status: response.status, ok: response.ok };
}

// ============================================================
// 定时推送检查
// ============================================================

async function handleCronTrigger(env) {
    const today = new Date().toISOString().slice(0, 10);
    const hour = new Date().getHours();
    const listResult = await env.PUSH_KV.list({ prefix: 'push_sub:' });
    const results = [];

    for (const key of listResult.keys) {
        try {
            const subData = JSON.parse(await env.PUSH_KV.get(key.name));
            const { subscription, syncCode, childName, lastNotified, pushTimes } = subData;

            // 检查推送时间偏好
            const times = pushTimes || [8, 16, 20];
            if (!times.includes(hour)) continue;

            // 检查是否已在这个时间段通知过
            const notifyKey = `${today}_${hour}`;
            if (lastNotified === notifyKey) continue;

            // 从同步 KV 读取该家庭的任务和打卡数据
            const familyData = await env.DAKA_SYNC.get(`sync:${syncCode}`);
            if (!familyData) continue;

            const parsed = JSON.parse(familyData);
            const tasks = JSON.parse(parsed['app_tasks_v2'] || '{}');
            const checkins = JSON.parse(parsed['app_checkins_v2'] || '{}');

            const childTasks = (tasks[childName] || []).filter(t =>
                t.frequencyType === 'daily_must' && (!t.startDate || today >= t.startDate)
            );

            if (childTasks.length === 0) continue;

            const completed = childTasks.filter(t => checkins[childName]?.[t.id]?.[today]).length;
            const total = childTasks.length;
            const allDone = completed === total;

            let message = '';
            if (allDone && hour < 20) continue; // 全部完成且不是晚间，不推送
            if (allDone) {
                message = `🎉 ${childName}，今天的任务全部完成了！太棒了！`;
            } else {
                const remaining = total - completed;
                message = `📚 ${childName}，还有 ${remaining} 项任务没完成哦！加油 💪`;
            }

            const pushResult = await sendWebPush(subscription, JSON.stringify({
                title: '📚 打卡提醒',
                body: message,
                tag: `daily-${childName}-${today}`,
                url: 'https://daka-tool.vip/'
            }), {
                publicKey: env.VAPID_PUBLIC_KEY,
                privateKeyHex: env.VAPID_PRIVATE_KEY_HEX
            });

            if (pushResult.ok || pushResult.status === 201) {
                subData.lastNotified = notifyKey;
                await env.PUSH_KV.put(key.name, JSON.stringify(subData));
            }

            results.push({ child: childName, status: pushResult.status, message: message.slice(0, 50) });
        } catch (e) {
            results.push({ key: key.name, error: e.message });
        }
    }

    return results;
}

// ============================================================
// 主入口
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
            // 订阅推送
            if (path === '/api/subscribe' && request.method === 'POST') {
                const body = await request.json();
                const { subscription, syncCode, childName, pushTimes } = body;

                if (!subscription || !syncCode || !childName) {
                    return json({ error: '缺少参数' }, 400, corsHeaders);
                }

                // 用 syncCode + childName 作为 key
                const key = `push_sub:${syncCode}:${childName}`;
                await env.PUSH_KV.put(key, JSON.stringify({
                    subscription,
                    syncCode,
                    childName,
                    pushTimes: pushTimes || [8, 16, 20],
                    subscribedAt: new Date().toISOString(),
                    lastNotified: null
                }), { expirationTtl: 90 * 86400 });

                return json({ ok: true }, 200, corsHeaders);
            }

            // 取消订阅
            if (path === '/api/unsubscribe' && request.method === 'POST') {
                const body = await request.json();
                const { syncCode, childName } = body;
                const key = `push_sub:${syncCode}:${childName}`;
                await env.PUSH_KV.delete(key);
                return json({ ok: true }, 200, corsHeaders);
            }

            // 测试推送
            if (path === '/api/test-push' && request.method === 'POST') {
                const body = await request.json();
                const { syncCode, childName } = body;
                const key = `push_sub:${syncCode}:${childName}`;
                const subData = await env.PUSH_KV.get(key);
                if (!subData) return json({ error: '未找到订阅' }, 404, corsHeaders);

                const parsed = JSON.parse(subData);
                const result = await sendWebPush(parsed.subscription, JSON.stringify({
                    title: '🔔 测试通知',
                    body: `${childName}，打卡提醒测试成功！`,
                    tag: 'test',
                    url: 'https://daka-tool.vip/'
                }), {
                    publicKey: env.VAPID_PUBLIC_KEY,
                    privateKeyHex: env.VAPID_PRIVATE_KEY_HEX
                });

                return json({ ok: result.ok, status: result.status }, 200, corsHeaders);
            }

            // 手动触发定时检查（调试用）
            if (path === '/api/cron-check' && request.method === 'GET') {
                const results = await handleCronTrigger(env);
                return json({ ok: true, results }, 200, corsHeaders);
            }

            // 获取 VAPID 公钥（前端需要）
            if (path === '/api/vapid-key' && request.method === 'GET') {
                return json({ publicKey: env.VAPID_PUBLIC_KEY }, 200, corsHeaders);
            }

            return json({ error: 'Not found' }, 404, corsHeaders);
        } catch (e) {
            return json({ error: e.message }, 500, corsHeaders);
        }
    },

    // Cron Trigger 入口
    async scheduled(event, env, ctx) {
        ctx.waitUntil(handleCronTrigger(env));
    }
};

function json(data, status, corsHeaders) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}
