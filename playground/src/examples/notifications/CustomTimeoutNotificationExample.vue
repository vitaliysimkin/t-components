<script setup lang="ts">
import { TButton, useNotifications } from '@vitaliysimkin/t-components'

const { info, success } = useNotifications()
</script>

<template>
  <div>
    <TButton
      label="1 second"
      @click="info('Gone in a flash', 1000)"
    />
    <TButton
      label="10 seconds"
      @click="success('Stays a while', 10000)"
    />
  </div>
</template>

<style scoped>
div {
  display: flex;
  gap: 0.5rem;
}
</style>
