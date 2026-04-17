<script setup lang="ts">
import { ref } from 'vue'
import { TTimeInput } from '@vitaliysimkin/t-components'

const time = ref<string | null>('09:00')
const timeStep5 = ref<string | null>('09:00')
</script>

<template>
  <div class="example-cnt">
    <div class="example__row">
      <span class="example__label">TTimeInput</span>
      <TTimeInput v-model="time" />
    </div>
    <div class="example__row">
      <span class="example__label">TTimeInput :step="5"</span>
      <TTimeInput v-model="timeStep5" :step="5" />
    </div>
  </div>
</template>

<style scoped>
.example-cnt {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 600px;
}

.example__row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.example__label {
  width: 9rem;
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
  flex-shrink: 0;
}
</style>
