import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(new URL(import.meta.url).pathname), './src'),
    },
  },
})