<script setup lang="ts">
import { ref } from 'vue'
import { TTextarea } from '@vitaliysimkin/t-components'

const text = ref('')
</script>

<template>
  <div>
    <TTextarea
      v-model="text"
      size="mini"
      placeholder="Mini"
    />
    <TTextarea
      v-model="text"
      size="small"
      placeholder="Small"
    />
    <TTextarea
      v-model="text"
      size="default"
      placeholder="Default"
    />
    <TTextarea
      v-model="text"
      size="medium"
      placeholder="Medium"
    />
    <TTextarea
      v-model="text"
      size="large"
      placeholder="Large"
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
