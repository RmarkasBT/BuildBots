import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Bind IPv4 and IPv6 so localhost resolves whichever way the browser picks.
    host: '0.0.0.0',
    port: 8484,
    strictPort: true,
    proxy: {
      // Port must match server/index.js's PORT.
      '/api': 'http://localhost:4000',
      // Port must match agent/server.py's uvicorn --port (see dev:agent script).
      // agent/server.py only defines /chat (no /agent prefix), so strip it here.
      '/agent': { target: 'http://localhost:8001', changeOrigin: true, rewrite: (path) => path.replace(/^\/agent/, '') },
    },
  },
})
