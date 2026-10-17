import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {STAGING_SERVICES} from './shared/deployment.js';

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const staging=mode==='staging';
  return {
  plugins: [react(), tailwindcss(), ...(staging?[{
    name:'isolated-staging-html',
    transformIndexHtml: {order:'pre',handler:()=>[
      {tag:'meta',attrs:{'http-equiv':'Content-Security-Policy',content:`connect-src 'self' ${Object.values(STAGING_SERVICES).join(' ')} ws://127.0.0.1:* ws://localhost:*; form-action 'self'; base-uri 'self'`},injectTo:'head-prepend'},
      {tag:'div',attrs:{id:'staging-environment-banner',style:'position:fixed;bottom:0;left:0;right:0;z-index:2147483647;padding:6px 12px calc(6px + env(safe-area-inset-bottom));background:#7f1d1d;color:white;text-align:center;font:12px sans-serif;pointer-events:none'},children:'独立测试环境 · 仅使用虚拟数据 · 企业微信、AI 等外部服务已禁用',injectTo:'body'},
    ]}
  }]:[])],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api/push': {
        target: staging ? STAGING_SERVICES.push : 'https://daka-push.2378385593.workers.dev',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/push(?=\/|$)/, '/api'),
      },
      '/api': {
        target: staging ? STAGING_SERVICES.exchange : 'https://daka-exchange.2378385593.workers.dev',
        changeOrigin: true,
      }
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    proxy: {
      '/api/push': {
        target: staging ? STAGING_SERVICES.push : 'https://daka-push.2378385593.workers.dev',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/push(?=\/|$)/, '/api'),
      },
      '/api': {
        target: staging ? STAGING_SERVICES.exchange : 'https://daka-exchange.2378385593.workers.dev',
        changeOrigin: true,
      }
    }
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: {
        chrome: 80 << 16,
        safari: 13 << 16,
        edge: 80 << 16,
        firefox: 78 << 16
      }
    }
  },
  build: {
    outDir: staging ? 'dist-staging' : 'dist',
    target: ['es2020', 'chrome80', 'safari13', 'edge80', 'firefox78'],
    cssTarget: ['chrome80', 'safari13', 'edge80', 'firefox78'],
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: {
        main: 'index.html',
        parent: 'parent.html',
        security: 'security.html',
        exchangeVerify: 'exchange-verify.html',
        exemptionVerify: 'exemption-verify.html',
        redemptionVerify: 'redemption-verify.html',
        wonderShowcase: 'wonder-showcase.html',
      }
    }
  }
};
});

