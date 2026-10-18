import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/data': {
        target: 'http://localhost:8001',
        rewrite: (path) => path.replace(/^\/api\/data/, ''),
        changeOrigin: true,
      },
      '/api/decision': {
        target: 'http://localhost:8002',
        rewrite: (path) => path.replace(/^\/api\/decision/, ''),
        changeOrigin: true,
      },
      '/api/analytics': {
        target: 'http://localhost:8003',
        rewrite: (path) => path.replace(/^\/api\/analytics/, ''),
        changeOrigin: true,
      },
    },
  },
})
