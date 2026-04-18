<template>
  <div class="row">
    <div class="example-label">
      small
    </div>
    <TTabs
      v-model="tab"
      :tabs="items"
      size="small"
    />
  </div>
  <div class="row">
    <div class="example-label">
      default
    </div>
    <TTabs
      v-model="tab"
      :tabs="items"
      size="default"
    />
  </div>
  <div class="row">
    <div class="example-label">
      medium
    </div>
    <TTabs
      v-model="tab"
      :tabs="items"
      size="medium"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TTabs } from '@vitaliysimkin/t-components'
import type { TTabItem } from '@vitaliysimkin/t-components'

const tab = ref<string | number>('one')

const items: TTabItem[] = [
  { value: 'one', label: 'One', icon: 'material-symbols-light:counter-1' },
  { value: 'two', label: 'Two', icon: 'material-symbols-light:counter-2' },
  { value: 'three', label: 'Three', icon: 'material-symbols-light:counter-3' }
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
