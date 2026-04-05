import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Playground imports directly from src/ — no rebuild needed during development
export default defineConfig({
  plugins: [vue()],
  root: resolve(__dirname),
  resolve: {
    alias: {
      't-components': resolve(__dirname, '../src/index.ts'),
      '@': resolve(__dirname, 'src'),
    },
  },
})
