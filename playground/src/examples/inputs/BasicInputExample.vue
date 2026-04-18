<script setup lang="ts">
import { ref } from 'vue'
import { TInput } from '@vitaliysimkin/t-components'

const text = ref('')
const email = ref('')
const number = ref<number>(0)
const date = ref('')
</script>

<template>
  <div>
    <TInput
      v-model="text"
      placeholder="Enter text..."
    />
    <TInput
      v-model="email"
      type="email"
      placeholder="Email address"
    />
    <TInput
      v-model="number"
      type="number"
    />
    <TInput
      v-model="date"
      type="datetime-local"
    />
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
