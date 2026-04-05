<script setup lang="ts">
import { ref } from 'vue'
import { TSelect } from 't-components'

const roleId = ref<string | number | null>(1)

const roles = [
  { value: 1, label: 'Admin', icon: 'system-uicons:user-add' },
  { value: 2, label: 'Editor', icon: 'system-uicons:write' },
  { value: 3, label: 'Viewer', icon: 'system-uicons:book-closed' },
  { value: 4, label: 'Guest', icon: 'system-uicons:user-male' }
]
</script>

<template>
  <div>
    <TSelect
      v-model="roleId"
      :options="roles"
      label-key="label"
      icon-key="icon"
      placeholder="Select role"
      clearable
    />
    <p>Selected ID: {{ roleId }}</p>
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 300px;
}

p {
  margin: 0;
  color: var(--t-color-text-secondary);
  font-size: 0.875rem;
}
</style>
