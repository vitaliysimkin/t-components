<script setup lang="ts">
import { Icon } from '@iconify/vue'

export type TButtonVariant = 'neutral' | 'accent' | 'danger' | 'success' | 'info'
export type TButtonMode = 'filled' | 'plain' | 'ghost' | 'text'
export type TButtonSize = 'mini' | 'small' | 'default' | 'medium' | 'large' | 'fit'

withDefaults(
  defineProps<{
    variant?: TButtonVariant
    mode?: TButtonMode
    size?: TButtonSize
    icon?: string
    label?: string
  }>(),
  {
    variant: 'neutral',
    mode: 'filled',
    size: 'default'
  }
)
</script>

<template>
  <button 
    class="t-button" 
    :variant="variant"
    :mode="mode"
    :size="size"
  >
    <Icon
      v-if="icon"
      :icon="icon"
    />
    <slot>{{ label }}</slot>
  </button>
</template>

<style scoped>
/* ========================================
   BASE STYLES
   Geometry, typography, spacing, transitions
   ======================================== */
.t-button {
  padding: 0 var(--t-space-3);
  height: var(--t-btn-height);
  border-radius: var(--t-btn-radius);
  border: 1px solid;
  font-size: var(--t-btn-font-size);
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  gap: var(--t-space-2);
}

.t-button:focus-visible {
  outline: 2px solid var(--t-btn-color-primary);
  outline-offset: 2px;
}

.t-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.t-button :deep(svg) {
  font-size: 1.3em;
}

/* ========================================
   SIZE VARIANTS
   Map size prop to CSS variables
   ======================================== */
.t-button[size='mini'] {
  --t-btn-height: var(--t-control-h-mini);
  --t-btn-font-size: var(--t-font-size-mini);
  --t-btn-radius: var(--t-radius-mini);
}

.t-button[size='small'] {
  --t-btn-height: var(--t-control-h-small);
  --t-btn-font-size: var(--t-font-size-small);
  --t-btn-radius: var(--t-radius-small);
}

.t-button[size='default'] {
  --t-btn-height: var(--t-control-h-default);
  --t-btn-font-size: var(--t-font-size-default);
  --t-btn-radius: var(--t-radius-default);
}

.t-button[size='medium'] {
  --t-btn-height: var(--t-control-h-medium);
  --t-btn-font-size: var(--t-font-size-medium);
  --t-btn-radius: var(--t-radius-medium);
}

.t-button[size='large'] {
  --t-btn-height: var(--t-control-h-large);
  --t-btn-font-size: var(--t-font-size-large);
  --t-btn-radius: var(--t-radius-large);
}

.t-button[size='fit'] {
  --t-btn-height: 100%;
  --t-btn-font-size: inherit;
  --t-btn-radius: var(--t-radius-default);
  width: 100%;
}

/* ========================================
   VARIANTS
   Set token values only, no mode logic
   ======================================== */

/* Neutral variant */
.t-button[variant="neutral"] {
  --t-btn-color-primary: var(--t-color-neutral);
  --t-btn-color-contrast: var(--t-color-neutral-contrast);
  --t-btn-color-primary-hover: var(--t-color-neutral-hover);
  --t-btn-color-primary-active: var(--t-color-neutral-active);
  --t-btn-color-plain-primary: var(--t-color-neutral);
  --t-btn-color-plain-background: var(--t-color-neutral-plain-bg);
  --t-btn-color-plain-text: var(--t-color-neutral-contrast);
  --t-btn-color-border: var(--t-color-neutral-contrast);
  --t-btn-color-border-hover: var(--t-color-neutral-contrast);
  --t-btn-color-border-active: var(--t-color-neutral-contrast);
}

/* Accent variant */
.t-button[variant="accent"] {
  --t-btn-color-primary: var(--t-color-accent);
  --t-btn-color-contrast: var(--t-color-accent-contrast);
  --t-btn-color-primary-hover: var(--t-color-accent-hover);
  --t-btn-color-primary-active: var(--t-color-accent-active);
  --t-btn-color-plain-primary: var(--t-color-accent);
  --t-btn-color-plain-background: var(--t-color-accent-plain-bg);
  --t-btn-color-plain-text: var(--t-color-accent);
  --t-btn-color-border: var(--t-color-accent);
  --t-btn-color-border-hover: var(--t-color-accent-hover);
  --t-btn-color-border-active: var(--t-color-accent-active);
}

/* Danger variant */
.t-button[variant="danger"] {
  --t-btn-color-primary: var(--t-color-danger);
  --t-btn-color-contrast: var(--t-color-danger-contrast);
  --t-btn-color-primary-hover: var(--t-color-danger-hover);
  --t-btn-color-primary-active: var(--t-color-danger-active);
  --t-btn-color-plain-primary: var(--t-color-danger);
  --t-btn-color-plain-background: var(--t-color-danger-plain-bg);
  --t-btn-color-plain-text: var(--t-color-danger);
  --t-btn-color-border: var(--t-color-danger);
  --t-btn-color-border-hover: var(--t-color-danger-hover);
  --t-btn-color-border-active: var(--t-color-danger-active);
}

/* Success variant */
.t-button[variant="success"] {
  --t-btn-color-primary: var(--t-color-success);
  --t-btn-color-contrast: var(--t-color-success-contrast);
  --t-btn-color-primary-hover: var(--t-color-success-hover);
  --t-btn-color-primary-active: var(--t-color-success-active);
  --t-btn-color-plain-primary: var(--t-color-success);
  --t-btn-color-plain-background: var(--t-color-success-plain-bg);
  --t-btn-color-plain-text: var(--t-color-success);
  --t-btn-color-border: var(--t-color-success);
  --t-btn-color-border-hover: var(--t-color-success-hover);
  --t-btn-color-border-active: var(--t-color-success-active);
}

/* Info variant */
.t-button[variant="info"] {
  --t-btn-color-primary: var(--t-color-info);
  --t-btn-color-contrast: var(--t-color-info-contrast);
  --t-btn-color-primary-hover: var(--t-color-info-hover);
  --t-btn-color-primary-active: var(--t-color-info-active);
  --t-btn-color-plain-primary: var(--t-color-info);
  --t-btn-color-plain-background: var(--t-color-info-plain-bg);
  --t-btn-color-plain-text: var(--t-color-info);
  --t-btn-color-border: var(--t-color-info);
  --t-btn-color-border-hover: var(--t-color-info-hover);
  --t-btn-color-border-active: var(--t-color-info-active);
}

/* ========================================
   MODES
   Map tokens to CSS properties, no hardcoded colors
   ======================================== */

/* Filled mode */
.t-button[mode="filled"] {
  background-color: var(--t-btn-color-primary);
  color: var(--t-btn-color-contrast);
  border-color: var(--t-btn-color-border);
}

.t-button[mode="filled"]:hover:not(:disabled), .t-button[mode="filled"][active=true] {
  background-color: var(--t-btn-color-primary-hover);
  border-color: var(--t-btn-color-border-hover);
}

.t-button[mode="filled"]:active:not(:disabled) {
  background-color: var(--t-btn-color-primary-active);
  border-color: var(--t-btn-color-border-active);
}

/* Plain mode */
.t-button[mode="plain"] {
  background-color: var(--t-btn-color-plain-background);
  color: var(--t-btn-color-plain-text);
  border-color: var(--t-btn-color-border);
}

.t-button[mode="plain"]:hover:not(:disabled), .t-button[mode="plain"][active=true]  {
  background-color: var(--t-btn-color-primary-hover);
  color: var(--t-btn-color-contrast);
}

.t-button[mode="plain"]:active:not(:disabled) {
  background-color: var(--t-btn-color-primary-active);
  color: var(--t-btn-color-contrast);
}

/* Ghost mode */
.t-button[mode="ghost"] {
  background-color: transparent;
  color: var(--t-btn-color-plain-text);
  border-color: transparent;
}

.t-button[mode="ghost"]:hover:not(:disabled), .t-button[mode="ghost"][active=true] {
  background-color: var(--t-btn-color-plain-background);
  color: var(--t-btn-color-plain-text);
}

.t-button[mode="ghost"]:active:not(:disabled) {
  background-color: color-mix(in srgb, var(--t-btn-color-primary) 16%, transparent);
  color: var(--t-btn-color-plain-text);
}

/* Text mode */
.t-button[mode="text"] {
  background-color: transparent;
  color: var(--t-btn-color-plain-text);
  border-color: transparent;
  padding: 0 var(--t-space-2);
  border: none;
  border-radius: 0;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 0.2em;
  transition: color 120ms ease, text-decoration-color 120ms ease, transform 140ms ease;
}

.t-button[mode="text"]:hover:not(:disabled), .t-button[mode="text"][active=true] {
  color: var(--t-btn-color-primary-hover);
  text-decoration-color: currentColor;
  transform: translateY(-1px) scale(1.08);
}

.t-button[mode="text"]:active:not(:disabled) {
  color: var(--t-btn-color-primary-active);
  text-decoration-color: currentColor;
  transform: translateY(0) scale(1.03);
}

.t-button[variant="neutral"][mode="text"]:hover:not(:disabled),
.t-button[variant="neutral"][mode="text"][active=true],
.t-button[variant="neutral"][mode="text"]:active:not(:disabled) {
  color: var(--t-color-text);
}
</style>
