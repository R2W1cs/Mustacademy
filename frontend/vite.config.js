import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    cssMinify: 'esbuild',
    outDir: 'dist',
    assetsDir: 'assets',
    // markdown-to-jsx uses eval for optional HTML/JS features; safe here (trusted lesson content).
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'EVAL' && warning.id?.includes('markdown-to-jsx')) return;
        warn(warning);
      },
    },
  },
})
