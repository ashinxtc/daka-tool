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
  build: {
    outDir: 'dist',
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

