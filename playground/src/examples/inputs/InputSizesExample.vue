<script setup lang="ts">
import { ref } from 'vue'
import { TInput } from 't-components'

const text = ref('')
</script>

<template>
  <div>
    <TInput v-model="text" size="mini" placeholder="Mini" />
    <TInput v-model="text" size="small" placeholder="Small" />
    <TInput v-model="text" size="default" placeholder="Default" />
    <TInput v-model="text" size="medium" placeholder="Medium" />
    <TInput v-model="text" size="large" placeholder="Large" />
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
