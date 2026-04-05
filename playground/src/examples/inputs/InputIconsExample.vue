<script setup lang="ts">
import { ref } from 'vue'
import { TInput } from '@vitaliysimkin/t-components'

const search = ref('')
const email = ref('')
const url = ref('')
const clearableText = ref('Some text')
</script>

<template>
  <div>
    <TInput v-model="search" prefix-icon="mdi:magnify" placeholder="Search..." />
    <TInput v-model="email" prefix-icon="mdi:email" placeholder="Email" />
    <TInput v-model="url" prefix-icon="mdi:link" suffix-icon="mdi:open-in-new" placeholder="URL" />
    <TInput v-model="clearableText" clearable placeholder="Clearable input" />
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
