import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const VITE_PORT = Number(process.env.VITE_PORT) || 8101;
const AUTH_API_TARGET = process.env.VITE_API_URL_LOGIN || 'http://localhost:8080';
const MEMBERSHIP_API_TARGET = process.env.VITE_API_URL_MEMBERSHIP || 'http://localhost:8081';
const QR_API_TARGET = process.env.VITE_API_URL_QR || 'http://localhost:8090';

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
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: VITE_PORT,
    proxy: {
      '/api': {
        target: AUTH_API_TARGET,
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        headers: {
          'Connection': 'keep-alive'
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        }
      },
      '/membership-api': {
        target: MEMBERSHIP_API_TARGET,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/membership-api/, '/api'),
        timeout: 60000,
        headers: {
          'Connection': 'keep-alive'
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('membership-proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        }
      },
      '/qr-api': {
        target: QR_API_TARGET,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/qr-api/, '/api'),
        timeout: 60000,
        headers: {
          'Connection': 'keep-alive'
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('qr-proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        }
      }
    }
  }
})