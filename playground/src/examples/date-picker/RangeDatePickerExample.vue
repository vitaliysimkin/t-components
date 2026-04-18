<script setup lang="ts">
import { ref } from 'vue'
import { TDatePicker } from '@vitaliysimkin/t-components'
import type { TDatePickerRangeValue } from '@vitaliysimkin/t-components'

const range = ref<TDatePickerRangeValue | null>(null)

function format(d: Date | null | undefined) {
  return d ? d.toISOString().slice(0, 10) : '—'
}
</script>

<template>
  <div class="example-cnt">
    <TDatePicker
      v-model="range"
      mode="range"
    />
    <div class="example__preview">
      <span class="example__label">start:</span>
      <code>{{ format(range?.start) }}</code>
      <span class="example__label">end:</span>
      <code>{{ format(range?.end) }}</code>
    </div>
  </div>
</template>

<style scoped>
.example-cnt {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

.example__preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--t-font-size-small);
}

.example__label {
  color: var(--t-color-text-muted);
}
</style>
