<script setup lang="ts">
import { TButton, useNotifications } from '@vitaliysimkin/t-components'

const { info } = useNotifications()
</script>

<template>
  <div>
    <TButton label="Show notification" @click="info('Saved successfully')" />
  </div>
</template>

<style scoped>
div {
  display: flex;
  gap: 0.5rem;
}
</style>
