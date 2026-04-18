<script setup lang="ts">
import { ref } from 'vue'
import { TInput } from '@vitaliysimkin/t-components'

const text = ref('Disabled value')
</script>

<template>
  <div>
    <TInput
      v-model="text"
      disabled
      placeholder="Disabled"
    />
    <TInput
      model-value=""
      disabled
      placeholder="Empty disabled"
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
