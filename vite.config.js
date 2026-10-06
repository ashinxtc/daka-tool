import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://daka-exchange.2378385593.workers.dev',
        changeOrigin: true,
      }
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://daka-exchange.2378385593.workers.dev',
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
    outDir: 'dist',
    target: ['es2020', 'chrome80', 'safari13', 'edge80', 'firefox78'],
    cssTarget: ['chrome80', 'safari13', 'edge80', 'firefox78'],
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: {
        main: 'index.html',
        parent: 'parent.html',
        exchangeVerify: 'exchange-verify.html',
        exemptionVerify: 'exemption-verify.html',
        redemptionVerify: 'redemption-verify.html',
        wonderShowcase: 'wonder-showcase.html',
      }
    }
  }
});

