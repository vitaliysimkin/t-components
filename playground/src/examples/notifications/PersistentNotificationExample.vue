<script setup lang="ts">
import { TButton, useNotifications } from '@vitaliysimkin/t-components'

const { warning, clear } = useNotifications()

function pushPersistent() {
  // timeoutMs = 0 disables auto-dismiss — the user must close it.
  warning('This stays until you dismiss it', 0)
}
</script>

<template>
  <div>
    <TButton
      label="Push persistent"
      @click="pushPersistent"
    />
    <TButton
      label="Clear all"
      variant="neutral"
      mode="plain"
      @click="clear"
    />
  </div>
</template>

<style scoped>
div {
  display: flex;
  gap: 0.5rem;
}
</style>
