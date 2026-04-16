<template>
  <TTabs v-model="tab" :tabs="items">
    <template #panel-overview>
      <div class="panel">Overview content.</div>
    </template>
    <template #panel-billing>
      <div class="panel">Billing content.</div>
    </template>
    <template #panel-archive>
      <div class="panel">Archive content (this tab is enabled).</div>
    </template>
  </TTabs>
  <div class="hint">Try arrow keys — disabled tabs are skipped.</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TTabs } from '@vitaliysimkin/t-components'
import type { TTabItem } from '@vitaliysimkin/t-components'

const tab = ref<string | number>('overview')

const items: TTabItem[] = [
  { value: 'overview', label: 'Overview', icon: 'material-symbols-light:dashboard-outline' },
  { value: 'reports', label: 'Reports', icon: 'material-symbols-light:bar-chart', disabled: true },
  { value: 'billing', label: 'Billing', icon: 'material-symbols-light:credit-card-outline' },
  { value: 'archive', label: 'Archive', icon: 'material-symbols-light:archive-outline' }
]
</script>

<style scoped>
.panel {
  padding: var(--t-space-4);
  color: var(--t-color-text);
}
.hint {
  margin-top: var(--t-space-3);
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
}
</style>
