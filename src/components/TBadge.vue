<template>
  <span class="t-badge-wrapper">
    <slot />
    <span
      v-if="!hidden"
      class="t-badge"
      :class="[
        `t-badge--${variant}`,
        { 't-badge--dot': dot }
      ]"
      aria-label="badge"
    >
      <template v-if="!dot">{{ displayValue }}</template>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type TBadgeVariant = 'neutral' | 'accent' | 'danger' | 'success' | 'warning' | 'info'

export interface TBadgeProps {
  value?: string | number
  dot?: boolean
  hidden?: boolean
  variant?: TBadgeVariant
  max?: number
}

const props = withDefaults(defineProps<TBadgeProps>(), {
  dot: false,
  hidden: false,
  variant: 'danger',
})

const displayValue = computed(() => {
  if (props.dot) return ''
  if (typeof props.value === 'number' && props.max !== undefined && props.value > props.max) {
    return `${props.max}+`
  }
  return props.value ?? ''
})
</script>

<style scoped>
.t-badge-wrapper {
  position: relative;
  display: inline-flex;
}

.t-badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  z-index: 1;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 18px;
  height: 18px;
  padding: 0 var(--t-space-1);
  border-radius: 9px;

  font-size: var(--t-font-size-mini);
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;

  color: var(--t-badge-color-contrast);
  background-color: var(--t-badge-color);

  box-shadow: 0 0 0 2px var(--t-color-surface, transparent);
}

/* Dot mode */
.t-badge--dot {
  min-width: 8px;
  width: 8px;
  height: 8px;
  padding: 0;
  border-radius: 50%;
}

/* Variant: danger (default) */
.t-badge--danger {
  --t-badge-color: var(--t-color-danger);
  --t-badge-color-contrast: var(--t-color-danger-contrast);
}

/* Variant: accent */
.t-badge--accent {
  --t-badge-color: var(--t-color-accent);
  --t-badge-color-contrast: var(--t-color-accent-contrast);
}

/* Variant: success */
.t-badge--success {
  --t-badge-color: var(--t-color-success);
  --t-badge-color-contrast: var(--t-color-success-contrast);
}

/* Variant: warning */
.t-badge--warning {
  --t-badge-color: var(--t-color-warning);
  --t-badge-color-contrast: var(--t-color-warning-contrast);
}

/* Variant: info */
.t-badge--info {
  --t-badge-color: var(--t-color-info);
  --t-badge-color-contrast: var(--t-color-info-contrast);
}

/* Variant: neutral */
.t-badge--neutral {
  --t-badge-color: var(--t-color-text-muted);
  --t-badge-color-contrast: var(--t-color-bg, #fff);
}
</style>
