<script setup lang="ts">
import { TButton, TLoadingOverlay, useLoading } from '@vitaliysimkin/t-components'

const { show } = useLoading()

function startFullscreen() {
  const handle = show({ text: 'Loading data…', fullscreen: true, lock: true })
  setTimeout(() => handle.close(), 2000)
}
</script>

<template>
  <!-- TLoadingOverlay must be mounted once in the app root.
       In this playground it's placed here for the demo. -->
  <TLoadingOverlay />

  <div class="demo">
    <TButton label="Fullscreen overlay (2s)" @click="startFullscreen" />
    <p class="hint">
      Clicking the button shows a fullscreen loading overlay with scroll-lock
      for 2 seconds, then closes automatically.
    </p>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-3);
  align-items: flex-start;
}
.hint {
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
  margin: 0;
}
</style>
