<script setup lang="ts">
import { ref } from 'vue'
import { TDatePicker } from '@vitaliysimkin/t-components'

const date = ref<Date | null>(null)

// Only weekdays are selectable.
function isDateDisabled(d: Date) {
  const day = d.getDay()
  return day === 0 || day === 6
}
</script>

<template>
  <div class="example-cnt">
    <TDatePicker
      v-model="date"
      :is-date-disabled="isDateDisabled"
    />
    <div class="example__preview">
      <span class="example__label">v-model:</span>
      <code>{{ date ? date.toISOString() : 'null' }}</code>
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
