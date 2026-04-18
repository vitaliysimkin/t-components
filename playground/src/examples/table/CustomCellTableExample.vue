<script setup lang="ts">
import { TTable, TTag } from '@vitaliysimkin/t-components'
import type { TTableColumn } from '@vitaliysimkin/t-components'

interface Task {
  id: number
  title: string
  active: boolean
  priority: 'low' | 'medium' | 'high'
}

const columns: TTableColumn<Task>[] = [
  { key: 'id', label: 'ID', width: '80px', align: 'right' },
  { key: 'title', label: 'Title' },
  { key: 'priority', label: 'Priority', width: '140px' },
  { key: 'status', label: 'Status', width: '120px' },
]

const rows: Task[] = [
  { id: 1, title: 'Write docs',    active: true,  priority: 'high' },
  { id: 2, title: 'Review PR #42', active: true,  priority: 'medium' },
  { id: 3, title: 'Deprecate v1',  active: false, priority: 'low' },
]

const priorityVariant = (p: Task['priority']) =>
  p === 'high' ? 'red' : p === 'medium' ? 'yellow' : 'gray'
</script>

<template>
  <TTable :columns="columns" :rows="rows" row-key="id">
    <template #cell-priority="{ row }">
      <TTag :variant="priorityVariant(row.priority)" size="small">
        {{ row.priority }}
      </TTag>
    </template>
    <template #cell-status="{ row }">
      <TTag :variant="row.active ? 'green' : 'gray'" size="small">
        {{ row.active ? 'Active' : 'Off' }}
      </TTag>
    </template>
  </TTable>
</template>
