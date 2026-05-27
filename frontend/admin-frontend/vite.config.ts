import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const VITE_PORT = Number(process.env.VITE_PORT) || 8101;
const AUTH_API_TARGET = process.env.VITE_API_URL_LOGIN || 'http://localhost:8080';
const MEMBERSHIP_API_TARGET = process.env.VITE_API_URL_MEMBERSHIP || 'http://localhost:8081';
const QR_API_TARGET = process.env.VITE_API_URL_QR || 'http://localhost:8090';

const createProxyConfig = (target: string, rewritePath?: string) => ({
  target,
  changeOrigin: true,
  secure: false,
  timeout: 60000,
  headers: {
    'Connection': 'keep-alive'
  },
  ...(rewritePath ? { rewrite: (path: string) => path.replace(new RegExp(`^${rewritePath}`), '/api') } : {}),
  configure: (proxy: any) => {
    proxy.on('proxyReq', (proxyReq: any, req: any) => {
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('ion-')
        }
      }
    })
  ],
  esbuild: {
    drop: ['console', 'debugger']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: VITE_PORT,
    proxy: {
      '/api': createProxyConfig(AUTH_API_TARGET),
      '/membership-api': createProxyConfig(MEMBERSHIP_API_TARGET, '/membership-api'),
      '/qr-api': createProxyConfig(QR_API_TARGET, '/qr-api')
    }
  }
})