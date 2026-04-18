<template>
  <div class="row">
    <div class="example-label">
      underline (default)
    </div>
    <TTabs
      v-model="tab"
      :tabs="items"
      variant="underline"
    />
  </div>

  <div class="row">
    <div class="example-label">
      pills
    </div>
    <TTabs
      v-model="tab"
      :tabs="items"
      variant="pills"
    />
  </div>

  <div class="row">
    <div class="example-label">
      segmented
    </div>
    <TTabs
      v-model="tab"
      :tabs="items"
      variant="segmented"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TTabs } from '@vitaliysimkin/t-components'
import type { TTabItem } from '@vitaliysimkin/t-components'

const tab = ref<string | number>('day')

const items: TTabItem[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' }
]
</script>

<style scoped>
.row {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-2);
  margin-bottom: var(--t-space-5);
}
.example-label {
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
}
</style>
