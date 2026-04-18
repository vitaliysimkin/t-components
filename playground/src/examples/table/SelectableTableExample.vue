<script setup lang="ts">
import { ref } from 'vue'
import { TTable } from '@vitaliysimkin/t-components'
import type { TTableColumn } from '@vitaliysimkin/t-components'

interface Order {
  id: string
  customer: string
  total: number
}

const columns: TTableColumn<Order>[] = [
  { key: 'id', label: 'Order #', width: '120px' },
  { key: 'customer', label: 'Customer' },
  { key: 'total', label: 'Total', align: 'right', width: '120px' },
]

const rows: Order[] = [
  { id: 'A-100', customer: 'Acme Co.', total: 420.5 },
  { id: 'A-101', customer: 'Globex',   total: 89.9 },
  { id: 'A-102', customer: 'Initech',  total: 1240.0 },
  { id: 'A-103', customer: 'Hooli',    total: 55.0 },
]

const selection = ref<(string | number)[]>(['A-101'])
</script>

<template>
  <TTable
    :columns="columns"
    :rows="rows"
    row-key="id"
    selectable
    v-model:selection="selection"
  />
  <div class="hint">Selected: {{ selection.join(', ') || 'none' }}</div>
</template>

<style scoped>
.hint {
  margin-top: var(--t-space-2);
  color: var(--t-color-text-muted);
  font-size: var(--t-font-size-small);
}
</style>
