// ===== Cloudflare Workers & API Endpoints =====
// 在生产环境（daka-tool.top 或 vercel.app）及本地 Vite 代理下，优先使用同源相对路径（/api/...），
// 由 Vercel 全球边缘网络或 Vite 代理反向代理直连 Cloudflare Workers，彻底解决中国大陆手机直连 *.workers.dev 被防火墙 SNI 拦截、报“提交超时”的问题。
const isBrowser = typeof window !== 'undefined';
const shouldUseProxy = isBrowser && (
    window.location.hostname.includes('daka-tool.top') ||
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
);

export const EXCHANGE_WORKER_URL = shouldUseProxy ? '' : 'https://daka-exchange.2378385593.workers.dev';
export const WECOM_API_URL = shouldUseProxy ? '' : 'https://daka-wecom.2378385593.workers.dev';
export const PUSH_WORKER_URL = shouldUseProxy ? '' : 'https://daka-push.2378385593.workers.dev';
