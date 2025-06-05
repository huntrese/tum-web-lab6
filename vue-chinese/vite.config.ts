import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['juansoft.online'],
    port: 9001,
    https: {
      key: fs.readFileSync('/etc/letsencrypt/live/juansoft.online/privkey.pem'),
      cert: fs.readFileSync('/etc/letsencrypt/live/juansoft.online/fullchain.pem'),
    },
    proxy: {
      '/api': {
        target: 'https://juansoft.online',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});

