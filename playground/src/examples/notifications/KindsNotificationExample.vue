<script setup lang="ts">
import { TButton, useNotifications } from '@vitaliysimkin/t-components'

const { info, success, warning, error } = useNotifications()
</script>

<template>
  <div>
    <TButton
      label="Info"
      variant="accent"
      @click="info('Just so you know…')"
    />
    <TButton
      label="Success"
      variant="success"
      @click="success('Operation completed')"
    />
    <TButton
      label="Warning"
      variant="warning"
      @click="warning('Double-check this')"
    />
    <TButton
      label="Error"
      variant="danger"
      @click="error('Something broke')"
    />
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
