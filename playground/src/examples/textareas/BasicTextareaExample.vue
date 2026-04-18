<script setup lang="ts">
import { ref } from 'vue'
import { TTextarea } from '@vitaliysimkin/t-components'

const text = ref('')
</script>

<template>
  <div>
    <TTextarea
      v-model="text"
      placeholder="Enter your text..."
    />
    <TTextarea
      v-model="text"
      :rows="5"
      placeholder="More rows..."
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
