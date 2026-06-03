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
        // Only the root `dist/index.d.ts` — NOT the `/icons` subpath types
        // (its directory has no globalComponents.d.ts to reference).
        if (/[\\/]index\.d\.ts$/.test(filePath) && !/[\\/]icons[\\/]index\.d\.ts$/.test(filePath)) {
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
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        icons: resolve(__dirname, 'src/icons/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
      // Keep the CSS bundle name stable across the single→multi entry switch so
      // the `./style.css` export and size-limit path stay `dist/index.css`.
      cssFileName: 'index',
    },
    rollupOptions: {
      external: ['vue', '@iconify/vue', '@vueuse/core', 'vue-router', 'codemirror', /^@codemirror\//],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          '@iconify/vue': 'IconifyVue',
          '@vueuse/core': 'VueUse',
          'vue-router': 'VueRouter',
        },
      },
    },
  },
})
