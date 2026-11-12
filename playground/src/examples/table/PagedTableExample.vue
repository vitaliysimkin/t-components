<script setup lang="ts">
import { computed, ref } from 'vue'
import { TTable } from '@vitaliysimkin/t-components'
import type { TTableColumn } from '@vitaliysimkin/t-components'

interface Call {
  id: number
  model: string
  tokens: number
}

const columns: TTableColumn<Call>[] = [
  { key: 'id', label: 'ID', width: '80px', align: 'right' },
  { key: 'model', label: 'Model' },
  { key: 'tokens', label: 'Tokens', align: 'right' },
]

const all: Call[] = Array.from({ length: 23 }, (_, i) => ({
  id: 23 - i,
  model: i % 2 ? 'gpt-small' : 'claude-mini',
  tokens: 400 + ((i * 137) % 900),
}))

const pageSize = 10
const offset = ref(0)
const rows = computed(() => all.slice(offset.value, offset.value + pageSize))
// Total unknown (server pages by offset): a next page exists while the page is full.
const hasMore = computed(() => offset.value + pageSize < all.length)
</script>

<template>
  <TTable
    v-model:offset="offset"
    :columns="columns"
    :rows="rows"
    row-key="id"
    size="small"
    :page-size="pageSize"
    :has-more="hasMore"
  >
    <template #range="{ from, to }">
      <b>{{ from }}–{{ to }}</b> · newest first
    </template>
  </TTable>
</template>
