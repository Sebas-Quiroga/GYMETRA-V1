import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

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
    port: 8101,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
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
            // Ensure headers are set correctly
            if (req.headers.authorization) {
              // Truncate authorization header if too long
              const authHeader = req.headers.authorization;
              if (authHeader.length > 8000) { // Safe limit under 8KB
                console.warn('Authorization header too long, truncating...');
                proxyReq.setHeader('Authorization', authHeader.substring(0, 8000));
              } else {
                proxyReq.setHeader('Authorization', authHeader);
              }
            }
          });
        }
      },
      '/membership-api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/membership-api/, '/api'),
        timeout: 60000,
        headers: {
          'Connection': 'keep-alive'
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Ensure headers are set correctly
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        }
      }
    }
  }
})