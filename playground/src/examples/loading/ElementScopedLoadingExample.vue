<script setup lang="ts">
import { ref } from 'vue'
import { TButton, TLoadingOverlay, useLoading } from '@vitaliysimkin/t-components'

const { show } = useLoading()
const containerRef = ref<HTMLElement | null>(null)

function startScoped() {
  if (!containerRef.value) return
  const handle = show({
    text: 'Saving…',
    target: containerRef.value,
    lock: true,
  })
  setTimeout(() => handle.close(), 2000)
}
</script>

<template>
  <!-- TLoadingOverlay is the host that renders all active overlays. -->
  <TLoadingOverlay />

  <div class="demo">
    <div
      ref="containerRef"
      class="card"
    >
      <p class="card__body">
        This is the target container.
      </p>
      <TButton
        label="Overlay this card (2s)"
        size="small"
        @click="startScoped"
      />
    </div>
    <p class="hint">
      The overlay is confined to the card above, not the whole page.
      The card must have <code>position: relative</code> (or any non-static
      position) so the absolute overlay is clipped to it.
    </p>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-3);
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--t-space-3);
  align-items: flex-start;
  padding: var(--t-space-4);
  background: var(--t-color-surface);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-large);
  min-height: 8rem;
}

.card__body {
  margin: 0;
  color: var(--t-color-text);
}

.hint {
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
  margin: 0;
}

code {
  font-family: monospace;
  font-size: 0.85em;
}
</style>
