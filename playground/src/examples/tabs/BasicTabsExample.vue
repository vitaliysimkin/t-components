<template>
  <div class="example-label">
    Active: {{ tab }}
  </div>
  <TTabs
    v-model="tab"
    :tabs="items"
  >
    <template #panel-users>
      <div class="panel">
        List of users would go here.
      </div>
    </template>
    <template #panel-teams>
      <div class="panel">
        List of teams would go here.
      </div>
    </template>
    <template #panel-roles>
      <div class="panel">
        Roles & permissions configuration.
      </div>
    </template>
  </TTabs>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TTabs } from '@vitaliysimkin/t-components'
import type { TTabItem } from '@vitaliysimkin/t-components'

const tab = ref<string | number>('users')

const items: TTabItem[] = [
  { value: 'users', label: 'Users' },
  { value: 'teams', label: 'Teams' },
  { value: 'roles', label: 'Roles' }
]
</script>

<style scoped>
.example-label {
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
  margin-bottom: var(--t-space-2);
}
.panel {
  padding: var(--t-space-4);
  color: var(--t-color-text);
}
</style>
