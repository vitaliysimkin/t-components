import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Playground imports directly from src/ — no rebuild needed during development.
// PLAYGROUND_BASE lets CI build with the repo subpath for GitHub Pages.
export default defineConfig({
  plugins: [vue()],
  root: resolve(__dirname),
  base: process.env.PLAYGROUND_BASE ?? '/',
  resolve: {
    alias: {
      '@vitaliysimkin/t-components': resolve(__dirname, '../src/index.ts'),
      '@': resolve(__dirname, 'src'),
    },
  },
})
