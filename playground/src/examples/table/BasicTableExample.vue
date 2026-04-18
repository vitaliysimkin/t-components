<script setup lang="ts">
import { TTable } from '@vitaliysimkin/t-components'
import type { TTableColumn } from '@vitaliysimkin/t-components'

interface User {
  id: number
  name: string
  email: string
  role: string
}

const columns: TTableColumn<User>[] = [
  { key: 'id', label: 'ID', width: '80px', align: 'right' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', width: '140px' },
]

const rows: User[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', role: 'Admin' },
  { id: 2, name: 'Alan Turing', email: 'alan@example.com', role: 'Editor' },
  { id: 3, name: 'Grace Hopper', email: 'grace@example.com', role: 'Viewer' },
]
</script>

<template>
  <TTable :columns="columns" :rows="rows" row-key="id" />
</template>
