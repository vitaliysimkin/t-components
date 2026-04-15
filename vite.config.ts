import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      beforeWriteFile(filePath, content) {
        // Ensure the consumer auto-loads the GlobalComponents augmentation
        // (Volar template typings) when they import from the package entry.
        if (filePath.endsWith('index.d.ts')) {
          return {
            filePath,
            content: `/// <reference path="./globalComponents.d.ts" />\n${content}`,
          }
        }
      },
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TComponents',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', '@iconify/vue', '@vueuse/core', 'vue-router', 'vuestic-ui', 'codemirror', /^@codemirror\//],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          '@iconify/vue': 'IconifyVue',
          '@vueuse/core': 'VueUse',
          'vue-router': 'VueRouter',
          'vuestic-ui': 'Vuestic',
        },
      },
    },
  },
})
