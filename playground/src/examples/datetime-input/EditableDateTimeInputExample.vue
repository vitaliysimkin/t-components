<script setup lang="ts">
import { ref } from 'vue'
import { TDateInput, TTimeInput, TDateTimeInput } from '@vitaliysimkin/t-components'

const date = ref<string | null>(null)
const time = ref<string | null>(null)
const datetime = ref<string | null>(null)
</script>

<template>
  <div class="example-cnt">
    <div class="example__row">
      <span class="example__label">TDateInput</span>
      <TDateInput v-model="date" :editable="true" />
    </div>
    <div class="example__row">
      <span class="example__label">TTimeInput</span>
      <TTimeInput v-model="time" :editable="true" />
    </div>
    <div class="example__row">
      <span class="example__label">TDateTimeInput</span>
      <TDateTimeInput v-model="datetime" :editable="true" />
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
