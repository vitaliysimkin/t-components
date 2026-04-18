<script setup lang="ts">
import { ref } from 'vue'
import { TTable } from '@vitaliysimkin/t-components'
import type { TTableColumn, TTableSort } from '@vitaliysimkin/t-components'

interface Product {
  id: number
  name: string
  price: number
  stock: number
}

const columns: TTableColumn<Product>[] = [
  { key: 'id', label: 'ID', width: '80px', align: 'right', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'price', label: 'Price', align: 'right', sortable: true, width: '120px' },
  { key: 'stock', label: 'Stock', align: 'right', sortable: true, width: '120px' },
]

const rows = ref<Product[]>([
  { id: 1, name: 'Keyboard', price: 79.99, stock: 32 },
  { id: 2, name: 'Mouse', price: 29.5, stock: 128 },
  { id: 3, name: 'Monitor', price: 329.0, stock: 7 },
  { id: 4, name: 'Headset', price: 119.9, stock: 54 },
])

const sort = ref<TTableSort | null>({ key: 'price', direction: 'asc' })
</script>

<template>
  <TTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    client-side-sort
    v-model:sort="sort"
  />
  <div class="hint">
    Current sort: {{ sort ? `${sort.key} / ${sort.direction}` : 'none' }}
  </div>
</template>

<style scoped>
.hint {
  margin-top: var(--t-space-2);
  color: var(--t-color-text-muted);
  font-size: var(--t-font-size-small);
}
</style>
