<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue'
import Icon from './TIcon.vue'

export type TButtonVariant = 'neutral' | 'accent' | 'danger' | 'success' | 'warning' | 'info'
export type TButtonMode = 'filled' | 'plain' | 'ghost' | 'text'
export type TButtonSize = 'mini' | 'small' | 'default' | 'medium' | 'large' | 'fit'

const props = withDefaults(
  defineProps<{
    variant?: TButtonVariant
    mode?: TButtonMode
    size?: TButtonSize
    icon?: string
    label?: string
    disabled?: boolean
  }>(),
  {
    variant: 'neutral',
    mode: 'filled',
    size: 'default',
    disabled: false
  }
)

/* Press ripple: one node, re-keyed per press so its animation restarts; removed on animationend. */
const ripple = shallowRef<{ id: number, style: Record<string, string> }>()

/* Enable shine: a single sweep when the button goes from disabled to enabled; removed on animationend. */
const shine = ref(false)
watch(() => props.disabled, (now, was) => {
  if (was && !now) shine.value = true
})

function onPointerdown(e: PointerEvent) {
  // Text mode keeps its own hover/press motion.
  if (e.button !== 0 || props.disabled || props.mode === 'text') return
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  ripple.value = {
    id: e.timeStamp,
    style: {
      '--t-ripple-x': `${e.clientX - r.left}px`,
      '--t-ripple-y': `${e.clientY - r.top}px`,
      '--t-ripple-d': `${Math.max(r.width, r.height) * 2}px`
    }
  }
}
</script>

<template>
  <button
    class="t-button"
    :variant="variant"
    :mode="mode"
    :size="size"
    :disabled="disabled"
    @pointerdown="onPointerdown"
  >
    <span
      v-if="ripple"
      :key="ripple.id"
      class="t-button__ripple"
      :style="ripple.style"
      @animationend="ripple = undefined"
    />
    <span
      v-if="shine"
      class="t-button__shine"
      @animationend="shine = false"
    />
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
  position: relative;
  /* Release springs back from the sink (see :active). */
  transition:
    color var(--t-duration) var(--t-ease),
    background-color var(--t-duration) var(--t-ease),
    border-color var(--t-duration) var(--t-ease),
    transform var(--t-duration-slow) var(--t-ease-spring);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  gap: var(--t-space-2);
}

.t-button:not([mode="text"]):active:not(:disabled) {
  transform: scale(calc(1 - 0.05 * var(--t-motion-move)));
  transition-duration: var(--t-duration), var(--t-duration), var(--t-duration), calc(var(--t-duration-slow) / 3);
  transition-timing-function: var(--t-ease);
}

/* Saving state: consumer adds `is-loading`; opacity-only pulse, none at `off` (zero duration). */
.t-button.is-loading {
  animation: t-pulse calc(1s * var(--t-motion-scale)) ease-in-out infinite;
}

/* Clip box for the ripple circle / shine band drawn by ::after. */
.t-button__ripple,
.t-button__shine {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
}

.t-button__ripple::after {
  content: '';
  position: absolute;
  left: calc(var(--t-ripple-x) - var(--t-ripple-d) / 2);
  top: calc(var(--t-ripple-y) - var(--t-ripple-d) / 2);
  width: var(--t-ripple-d);
  height: var(--t-ripple-d);
  border-radius: 50%;
  background: currentColor;
  opacity: 0;
  /* Zero duration at reduced/off: no ripple, the node is removed on animationend. */
  animation: t-button-ripple calc(var(--t-duration-slow) * 1.6) var(--t-ease);
}

@keyframes t-button-ripple {
  from { transform: scale(0); opacity: 0.3; }
}

.t-button__shine::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, color-mix(in srgb, currentColor 35%, transparent) 50%, transparent 70%);
  transform: translateX(-120%);
  /* Zero duration at reduced/off: no shine, the node is removed on animationend. */
  animation: t-button-shine calc(var(--t-duration-slow) * 2.5) var(--t-ease);
}

@keyframes t-button-shine {
  to { transform: translateX(120%); }
}

/* Hover state layer: 8% currentColor veil, opacity-only; instant at `off` (zero duration). Text mode has its own motion. */
.t-button:not([mode="text"])::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: currentColor;
  opacity: 0;
  transition: opacity var(--t-duration) var(--t-ease);
  pointer-events: none;
}

.t-button:not([mode="text"]):hover:not(:disabled)::after {
  opacity: 0.08;
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

/* Neutral variant — Element Plus "default" button:
   resting state stays neutral; hover/active tint toward accent so the
   button reads as the catch-all action without competing with info. */
.t-button[variant="neutral"] {
  --t-btn-color-primary: var(--t-color-neutral);
  --t-btn-color-contrast: var(--t-color-neutral-contrast);
  --t-btn-color-primary-hover: var(--t-color-accent-plain-bg);
  --t-btn-color-primary-active: var(--t-color-accent);
  --t-btn-color-plain-primary: var(--t-color-neutral);
  --t-btn-color-plain-background: transparent;
  --t-btn-color-plain-text: var(--t-color-neutral-contrast);
  --t-btn-color-border: var(--t-color-border);
  --t-btn-color-border-hover: var(--t-color-accent);
  --t-btn-color-border-active: var(--t-color-accent);
  --t-btn-color-plain-border: var(--t-color-border);
  --t-btn-color-plain-border-hover: var(--t-color-accent);
}

.t-button[variant="neutral"][mode="filled"]:hover:not(:disabled),
.t-button[variant="neutral"][mode="filled"][active=true],
.t-button[variant="neutral"][mode="plain"]:hover:not(:disabled),
.t-button[variant="neutral"][mode="plain"][active=true] {
  color: var(--t-color-accent);
}

.t-button[variant="neutral"][mode="plain"]:hover:not(:disabled),
.t-button[variant="neutral"][mode="plain"][active=true] {
  background-color: var(--t-color-accent-plain-bg);
}

.t-button[variant="neutral"][mode="filled"]:active:not(:disabled),
.t-button[variant="neutral"][mode="plain"]:active:not(:disabled) {
  color: var(--t-color-accent-contrast);
}

.t-button[variant="neutral"][mode="plain"]:active:not(:disabled) {
  background-color: var(--t-color-accent);
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

/* Warning variant */
.t-button[variant="warning"] {
  --t-btn-color-primary: var(--t-color-warning);
  --t-btn-color-contrast: var(--t-color-warning-contrast);
  --t-btn-color-primary-hover: var(--t-color-warning-hover);
  --t-btn-color-primary-active: var(--t-color-warning-active);
  --t-btn-color-plain-primary: var(--t-color-warning);
  --t-btn-color-plain-background: var(--t-color-warning-plain-bg);
  --t-btn-color-plain-text: var(--t-color-warning);
  --t-btn-color-border: var(--t-color-warning);
  --t-btn-color-border-hover: var(--t-color-warning-hover);
  --t-btn-color-border-active: var(--t-color-warning-active);
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
  border-color: var(--t-btn-color-plain-border, var(--t-btn-color-border));
}

.t-button[mode="plain"]:hover:not(:disabled), .t-button[mode="plain"][active=true]  {
  background-color: color-mix(in srgb, var(--t-btn-color-plain-primary) 20%, transparent);
  color: var(--t-btn-color-plain-text);
  border-color: var(--t-btn-color-plain-border-hover, var(--t-btn-color-border-hover));
}

.t-button[mode="plain"]:active:not(:disabled) {
  background-color: var(--t-btn-color-primary);
  color: var(--t-btn-color-contrast);
  border-color: var(--t-btn-color-plain-border-hover, var(--t-btn-color-border-active));
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
