// sw.js — Service Worker for Web Push Notifications + Offline Cache
// daka-tool 打卡提醒 + 离线资源缓存

// ===== 离线缓存配置 =====
// 版本号变更会触发旧缓存清理；每次改动 index.html/静态资源后应递增
const CACHE_VERSION = 'daka-cache-v2';

// 预缓存：应用核心资源（本地静态文件）
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/pets.js',
    '/pet-adventures.js',
    '/levels.js',
    '/events.js',
    '/achievements.js',
    '/vendor/fscreen.js',
    '/vendor/stage.js',
    '/vendor/mymath.js',
    '/img/icon.svg',
];

// 运行时缓存：第三方 CDN（React、Tailwind、Babel、confetti、OGL、字体）
// 命中后台更新（stale-while-revalidate），断网时用缓存
const RUNTIME_CACHE_HOSTS = [
    'cdn.tailwindcss.com',
    'unpkg.com',
    'cdn.jsdelivr.net',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .catch(err => console.warn('SW precache failed (non-fatal):', err))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
        ).then(() => clients.claim())
    );
});

// ===== fetch 拦截：静态资源缓存策略 =====
self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    // API/动态请求永不缓存（同步、兑换、推送、AI、天气等）
    const isApiCall = url.pathname.startsWith('/api/')
        || url.hostname.includes('workers.dev')
        || url.hostname.includes('sync.daka-tool')
        || url.hostname.includes('api.deepseek.com')
        || url.hostname.includes('open-meteo.com')
        || url.hostname.includes('timor.tech')
        || url.hostname.includes('qrserver.com')
        || url.hostname.includes('frankfurter')
        || url.hostname.includes('floatrates');
    if (isApiCall) return;

    const isSameOrigin = url.origin === self.location.origin;
    const isCdn = RUNTIME_CACHE_HOSTS.some(h => url.hostname === h);
    if (!isSameOrigin && !isCdn) return;

    // 导航请求（HTML）：网络优先，断网回退缓存 —— 保证在线时始终拿到最新版本
    if (req.mode === 'navigate' || url.pathname === '/index.html' || url.pathname === '/') {
        event.respondWith(
            fetch(req).then(resp => {
                const copy = resp.clone();
                caches.open(CACHE_VERSION).then(cache => cache.put(req, copy)).catch(() => {});
                return resp;
            }).catch(() => caches.match(req).then(hit => hit || caches.match('/index.html')))
        );
        return;
    }

    // 静态资源/CDN：stale-while-revalidate —— 先回缓存秒开，后台刷新
    event.respondWith(
        caches.match(req).then(hit => {
            const network = fetch(req).then(resp => {
                if (resp && resp.ok) {
                    const copy = resp.clone();
                    caches.open(CACHE_VERSION).then(cache => cache.put(req, copy)).catch(() => {});
                }
                return resp;
            }).catch(() => hit); // 断网时兜底用缓存
            return hit || network;
        })
    );
});

// ===== Web Push 通知 =====

// 接收推送通知
self.addEventListener('push', (event) => {
    let data = { title: '📚 打卡提醒', body: '今天的任务还没完成哦！' };
    try {
        if (event.data) data = event.data.json();
    } catch (e) {}

    // 静默同步触发：不发通知，直接通知前端页面拉取数据
    if (data.triggerSync) {
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                clientList.forEach(client => {
                    client.postMessage({ type: 'triggerSync', syncCode: data.syncCode });
                });
            })
        );
        return;
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || '/img/icon.svg',
            badge: '/img/icon.svg',
            tag: data.tag || 'daily-reminder',
            renotify: true,
            data: { url: data.url || 'https://daka-tool.vip/' },
            actions: [
                { action: 'open', title: '去打卡 ✏️' }
            ],
            vibrate: [200, 100, 200]
        })
    );
});

// 点击通知
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || 'https://daka-tool.vip/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // 如果已有窗口打开，聚焦它
            for (const client of clientList) {
                if (client.url.includes('daka-tool') && 'focus' in client) {
                    return client.focus();
                }
            }
            // 否则打开新窗口
            return clients.openWindow(url);
        })
    );
});
