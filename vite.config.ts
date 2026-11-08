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
        // NodeNext needs explicit extensions: './x' → './x.js', './X.vue' → './X.vue.js' (→ X.vue.d.ts).
        content = content.replace(/((?:from |import\()(['"])\.\.?\/[^'"]*?)(?<!\.js)\2/g, '$1.js$2')
        // Ensure the consumer auto-loads the GlobalComponents augmentation
        // (Volar template typings) when they import from the package entry.
        // Only the root `dist/index.d.ts` — NOT the `/icons`, `/markdown` and
        // `/code-editor` subpath types (their directories have no globalComponents.d.ts).
        if (/[\\/]index\.d\.ts$/.test(filePath) && !/[\\/](icons|markdown|code-editor|motion)[\\/]index\.d\.ts$/.test(filePath)) {
          content = `/// <reference path="./globalComponents.d.ts" />\n${content}`
        }
        return { filePath, content }
      },
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        icons: resolve(__dirname, 'src/icons/index.ts'),
        markdown: resolve(__dirname, 'src/markdown/index.ts'),
        'code-editor': resolve(__dirname, 'src/code-editor/index.ts'),
        motion: resolve(__dirname, 'src/motion/index.ts'),
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
