<script setup lang="ts">
import { ref } from 'vue'
import { TTree } from '@vitaliysimkin/t-components'

interface FileNode {
  fullPath: string
  name: string
  children?: FileNode[]
}

const data: FileNode[] = [
  {
    fullPath: '/src',
    name: 'src',
    children: [
      {
        fullPath: '/src/components',
        name: 'components',
        children: [
          { fullPath: '/src/components/TButton.vue', name: 'TButton.vue' },
          { fullPath: '/src/components/TInput.vue',  name: 'TInput.vue' },
        ],
      },
      {
        fullPath: '/src/composables',
        name: 'composables',
        children: [
          { fullPath: '/src/composables/useTheme.ts', name: 'useTheme.ts' },
        ],
      },
      { fullPath: '/src/index.ts', name: 'index.ts' },
    ],
  },
  {
    fullPath: '/public',
    name: 'public',
    children: [
      { fullPath: '/public/favicon.ico', name: 'favicon.ico' },
    ],
  },
]

const expandedKeys = ref<(string | number)[]>(['/src', '/src/components'])
</script>

<template>
  <div style="max-width: 360px; border: 1px solid var(--t-color-border); border-radius: var(--t-radius-medium); padding: 8px;">
    <TTree
      v-model:expanded-keys="expandedKeys"
      :data="data"
      node-key="fullPath"
      children-key="children"
    >
      <template #node="{ data: node }">
        <span>{{ node.name }}</span>
      </template>
    </TTree>
  </div>
</template>
