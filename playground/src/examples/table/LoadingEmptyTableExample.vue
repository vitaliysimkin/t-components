<script setup lang="ts">
import { ref } from 'vue'
import { TTable, TButton } from '@vitaliysimkin/t-components'
import type { TTableColumn } from '@vitaliysimkin/t-components'

interface Item {
  id: number
  title: string
}

const columns: TTableColumn<Item>[] = [
  { key: 'id', label: 'ID', width: '80px', align: 'right' },
  { key: 'title', label: 'Title' },
]

const loading = ref(false)
const rows = ref<Item[]>([])

function load() {
  loading.value = true
  setTimeout(() => {
    rows.value = [
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' },
    ]
    loading.value = false
  }, 1000)
}

function reset() {
  rows.value = []
}
</script>

<template>
  <div class="toolbar">
    <TButton size="small" @click="load">Load</TButton>
    <TButton size="small" variant="neutral" mode="plain" @click="reset">Clear</TButton>
  </div>
  <TTable :columns="columns" :rows="rows" row-key="id" :loading="loading">
    <template #empty>
      <div class="empty">Nothing here yet — click “Load” to fetch rows.</div>
    </template>
    <template #loading>
      <div class="loading">Fetching data…</div>
    </template>
  </TTable>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: var(--t-space-2);
  margin-bottom: var(--t-space-2);
}
.empty {
  color: var(--t-color-text-muted);
}
.loading {
  color: var(--t-color-text);
}
</style>
