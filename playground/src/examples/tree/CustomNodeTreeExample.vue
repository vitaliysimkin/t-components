<script setup lang="ts">
import { ref } from 'vue'
import { TTree } from '@vitaliysimkin/t-components'
import { Icon } from '@iconify/vue'

interface LogNode {
  fullPath: string
  name: string
  size?: string
  items?: LogNode[]
}

const data: LogNode[] = [
  {
    fullPath: 'logs/2026',
    name: '2026',
    items: [
      {
        fullPath: 'logs/2026/05',
        name: 'May',
        items: [
          { fullPath: 'logs/2026/05/app.log',   name: 'app.log',   size: '128 KB' },
          { fullPath: 'logs/2026/05/error.log',  name: 'error.log', size: '4 KB' },
        ],
      },
      {
        fullPath: 'logs/2026/04',
        name: 'April',
        items: [
          { fullPath: 'logs/2026/04/app.log', name: 'app.log', size: '96 KB' },
        ],
      },
    ],
  },
]

const expandedKeys = ref<(string | number)[]>(['logs/2026'])

function isFolder(node: LogNode): boolean {
  return Array.isArray(node.items) && node.items.length > 0
}

function handleNodeClick(node: LogNode) {
  if (!isFolder(node)) {
    alert(`Open: ${node.fullPath}`)
  }
}
</script>

<template>
  <div style="max-width: 400px; border: 1px solid var(--t-color-border); border-radius: var(--t-radius-medium); padding: 8px;">
    <TTree
      v-model:expanded-keys="expandedKeys"
      :data="data"
      node-key="fullPath"
      children-key="items"
      @node-click="handleNodeClick"
    >
      <template #node="{ data: node, expanded }">
        <Icon
          :icon="isFolder(node)
            ? (expanded ? 'system-uicons:folder-open' : 'system-uicons:folder')
            : 'system-uicons:document'"
          style="font-size: 1.1em; flex-shrink: 0; color: var(--t-color-text-muted);"
        />
        <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          {{ node.name }}
        </span>
        <span
          v-if="node.size"
          style="font-size: 0.8em; color: var(--t-color-text-muted); flex-shrink: 0;"
        >
          {{ node.size }}
        </span>
      </template>
    </TTree>
  </div>
</template>
