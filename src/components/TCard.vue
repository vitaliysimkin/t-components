<template>
  <div class="t-card">
    <div v-if="hasHeader" class="t-card__header">
      <slot name="header">{{ header }}</slot>
    </div>
    <div class="t-card__body">
      <slot />
    </div>
    <div v-if="hasFooter" class="t-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSlots, computed } from 'vue'

export interface TCardProps {
  header?: string
}

const props = defineProps<TCardProps>()

const slots = useSlots()

const hasHeader = computed(() => !!(props.header || slots.header))
const hasFooter = computed(() => !!slots.footer)
</script>

<style scoped>
.t-card {
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-medium);
  background: var(--t-color-surface);
  overflow: hidden;
}

.t-card__header {
  padding: var(--t-space-3) var(--t-space-4);
  border-bottom: 1px solid var(--t-color-border);
  font-size: var(--t-font-size-default);
  font-weight: 600;
  color: var(--t-color-text);
  line-height: var(--t-line-height);
}

.t-card__body {
  padding: var(--t-space-4);
  color: var(--t-color-text);
  font-size: var(--t-font-size-default);
  line-height: var(--t-line-height);
}

.t-card__footer {
  padding: var(--t-space-3) var(--t-space-4);
  border-top: 1px solid var(--t-color-border);
  color: var(--t-color-text-muted);
  font-size: var(--t-font-size-default);
  line-height: var(--t-line-height);
}
</style>
