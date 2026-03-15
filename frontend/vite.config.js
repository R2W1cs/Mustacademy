import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-v21.js`,
        chunkFileNames: `assets/[name]-[hash]-v21.js`,
        assetFileNames: `assets/[name]-[hash]-v21.[ext]`
      }
    }
  }
})
