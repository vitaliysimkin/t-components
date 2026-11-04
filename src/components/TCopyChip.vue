<script setup lang="ts">
import Icon from './TIcon.vue'
import { copyText } from './clipboard'

export interface TCopyChipProps {
  value: string
  label?: string
  title?: string
}

const props = withDefaults(defineProps<TCopyChipProps>(), {
  title: 'Copy',
})

const emit = defineEmits<{
  'copy': [value: string]
  'copy-error': [value: string]
}>()

async function copy() {
  if (await copyText(props.value)) emit('copy', props.value)
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
    {{ label ?? value }}<span class="t-copy-chip__icon"><Icon icon="ticon:copy" /></span>
  </button>
</template>

<style scoped>
.t-copy-chip {
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
</style>
