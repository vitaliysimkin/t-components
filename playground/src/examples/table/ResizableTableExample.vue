<script setup lang="ts">
import { ref } from 'vue'
import { TTable } from '@vitaliysimkin/t-components'
import type { TTableColumn, TTableSort } from '@vitaliysimkin/t-components'

interface Person {
  id: number
  name: string
  role: string
  note: string
}

const columns: TTableColumn<Person>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'note', label: 'Note', minWidth: 120 },
]

const rows: Person[] = [
  { id: 1, name: 'Ada Lovelace', role: 'Analyst', note: 'Wrote the first program for the Analytical Engine.' },
  { id: 2, name: 'Alan Turing', role: 'Mathematician', note: 'Described a universal computing machine.' },
  { id: 3, name: 'Grace Hopper', role: 'Admiral', note: 'Built one of the first compilers.' },
]

const sort = ref<TTableSort | null>(null)
// Store the widths (for example in localStorage) to keep them between visits.
const widths = ref<Record<string, number>>({})
</script>

<template>
  <TTable
    v-model:sort="sort"
    v-model:widths="widths"
    :columns="columns"
    :rows="rows"
    row-key="id"
    client-side-sort
    resizable
  />
  <p style="margin-top: 8px; font-size: 12px; color: var(--t-color-text-muted)">
    Widths: {{ JSON.stringify(widths) }}
  </p>
</template>
