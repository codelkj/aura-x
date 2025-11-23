import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      '5173-ineekhzy2e5v1nnwmj2jz-62cbba5f.manusvm.computer',
      'localhost'
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts: [
      '4173-ineekhzy2e5v1nnwmj2jz-62cbba5f.manusvm.computer',
      'localhost'
    ]
  },
})

