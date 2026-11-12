<script setup lang="ts">
import { ref } from 'vue'
import { TTable } from '@vitaliysimkin/t-components'
import type { TTableColumn, TTableSort } from '@vitaliysimkin/t-components'

interface Entry {
  id: number
  time: string
  level: string
  message: string
}

const columns: TTableColumn<Entry>[] = [
  { key: 'time', label: 'Time', width: '110px', sortable: true },
  { key: 'level', label: 'Level', width: '90px', sortable: true },
  { key: 'message', label: 'Message', sortable: true },
]

const rows: Entry[] = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  time: `12:${String(59 - i).padStart(2, '0')}:00`,
  level: i % 7 === 0 ? 'Error' : 'Info',
  message: `Entry ${i + 1}`,
}))

const sort = ref<TTableSort | null>(null)
const expanded = ref<number[]>([])
// A row click opens or closes its details.
function toggle(row: Entry) {
  expanded.value = expanded.value.includes(row.id)
    ? expanded.value.filter((id) => id !== row.id)
    : [...expanded.value, row.id]
}
</script>

<template>
  <!-- The header sticks to the scrolling ancestor; here a box of 260px. -->
  <div style="max-height: 260px; overflow: auto">
    <TTable
      v-model:sort="sort"
      :columns="columns"
      :rows="rows"
      row-key="id"
      size="small"
      client-side-sort
      sticky-header
      :expanded="expanded"
      @row-click="toggle"
    >
      <template #expanded="{ row }">
        Details of entry {{ row.id }}: {{ row.level }} at {{ row.time }}.
      </template>
    </TTable>
  </div>
</template>
