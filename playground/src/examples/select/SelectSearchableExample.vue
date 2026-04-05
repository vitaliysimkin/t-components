<script setup lang="ts">
import { ref } from 'vue'
import { TSelect } from '@vitaliysimkin/t-components'

const roleId = ref<string | number | null>('editor')
const roles = [
  { value: 'admin', label: 'Administrator' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'contributor', label: 'Contributor' },
  { value: 'subscriber', label: 'Subscriber' }
]
</script>

<template>
    <TSelect v-model="roleId" :options="roles" searchable placeholder="Search role..." />
</template>

<style scoped>
</style>
