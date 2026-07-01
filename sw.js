// sw.js — Service Worker for Web Push Notifications
// daka-tool 打卡提醒

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

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
