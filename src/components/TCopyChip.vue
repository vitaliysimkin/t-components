<script setup lang="ts">
import { ref } from 'vue'
import Icon from './TIcon.vue'
import { copyText } from './clipboard'

export interface TCopyChipProps {
  value: string
  label?: string
  title?: string
  copiedLabel?: string
}

const props = withDefaults(defineProps<TCopyChipProps>(), {
  title: 'Copy',
  copiedLabel: 'Copied',
})

const emit = defineEmits<{
  'copy': [value: string]
  'copy-error': [value: string]
}>()

// A new key replays the bubble animation; animationend removes the node.
const bubble = ref(0)

async function copy() {
  if (await copyText(props.value)) {
    bubble.value++
    emit('copy', props.value)
  }
  else emit('copy-error', props.value)
}
</script>

<template>
  <button
    type="button"
    class="t-copy-chip"
    :class="{ 'is-label': label }"
    :title="title"
    @click="copy"
  >
    {{ label ?? value }}<span class="t-copy-chip__icon"><Icon icon="ticon:copy" /></span><span
      v-if="bubble"
      :key="bubble"
      class="t-copy-chip__bubble"
      @animationend="bubble = 0"
    >{{ copiedLabel }}</span>
  </button>
</template>

<style scoped>
.t-copy-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--t-space-2);
  padding: 0 0 0 var(--t-space-2);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-small);
  background: var(--t-color-surface);
  color: inherit;
  font-family: var(--t-font-mono);
  font-size: var(--t-font-size-small);
  white-space: nowrap;
  cursor: pointer;
}

.t-copy-chip.is-label {
  font-family: var(--t-font-ui);
}

.t-copy-chip__icon {
  display: inline-flex;
  padding: var(--t-space-1) var(--t-space-2);
  border-left: 1px solid var(--t-color-border);
  color: var(--t-color-text-muted);
}

.t-copy-chip:hover .t-copy-chip__icon {
  color: var(--t-color-accent);
}

/* "Copied" bubble floating up. Fades in place at reduced, absent at off. */
.t-copy-chip__bubble {
  position: absolute;
  left: 50%;
  bottom: calc(100% + var(--t-space-1));
  padding: 2px var(--t-space-2);
  border-radius: var(--t-radius-mini);
  background: var(--t-color-text);
  color: var(--t-color-surface);
  font-family: var(--t-font-ui);
  font-size: var(--t-font-size-mini);
  pointer-events: none;
  animation: t-copy-chip-bubble calc(1.1s * var(--t-motion-scale)) ease-out forwards;
}

@keyframes t-copy-chip-bubble {
  0% { opacity: 0; transform: translate(-50%, calc(4px * var(--t-motion-move))); }
  20% { opacity: 1; transform: translate(-50%, 0); }
  75% { opacity: 1; transform: translate(-50%, calc(-4px * var(--t-motion-move))); }
  100% { opacity: 0; transform: translate(-50%, calc(-8px * var(--t-motion-move))); }
}
</style>
