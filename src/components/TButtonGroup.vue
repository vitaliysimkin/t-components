<script setup lang="ts" generic="M extends TButtonGroupModel">
import { provide, computed, ref, getCurrentInstance } from 'vue'
import { useSlidingIndicator } from '../composables/useSlidingIndicator'
import TButton, { type TButtonVariant, type TButtonSize } from './TButton.vue'

export type TButtonLabelDisplay = 'always' | 'selected' | 'never'
export type TButtonGroupMode = 'segmented' | 'plain'
export type TButtonGroupValue = string | number
/** Single select: a value (or null); multi select: an array of selected values. */
export type TButtonGroupModel = TButtonGroupValue | TButtonGroupValue[] | null

export interface TButtonGroupOption {
  value: TButtonGroupValue
  label?: string
  icon?: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    // Toggle mode props
    modelValue?: M
    options?: TButtonGroupOption[]
    variant?: TButtonVariant
    size?: TButtonSize
    labelDisplay?: TButtonLabelDisplay
    mandatory?: boolean
    // Both modes
    mode?: TButtonGroupMode
  }>(),
  {
    variant: 'accent',
    size: 'default',
    labelDisplay: 'always',
    mandatory: false,
    mode: 'segmented'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: M extends unknown[] ? M : M | null]
}>()

const isToggleMode = computed(() => props.modelValue !== undefined && props.options !== undefined)
const multi = computed(() => Array.isArray(props.modelValue))

const handleClick = (value: TButtonGroupValue) => {
  if (!isToggleMode.value) return
  const m = props.modelValue
  let next: TButtonGroupModel
  if (Array.isArray(m)) {
    if (props.mandatory && m.length === 1 && m[0] === value) return
    next = m.includes(value) ? m.filter((v) => v !== value) : [...m, value]
  } else {
    if (props.mandatory && m === value) return
    next = m === value ? null : value
  }
  emit('update:modelValue', next as never)
}

const isSelected = (value: TButtonGroupValue) => {
  const m = props.modelValue
  return Array.isArray(m) ? m.includes(value) : m === value
}

const getLabel = (option: TButtonGroupOption) => {
  if (props.labelDisplay === 'never') return undefined
  if (props.labelDisplay === 'selected') {
    return isSelected(option.value) ? option.label : undefined
  }
  return option.label // 'always'
}

// Label is not rendered visibly (labelDisplay 'never'/'selected') — expose it as tooltip and accessible name
const getHiddenLabel = (option: TButtonGroupOption) => {
  return getLabel(option) === undefined ? option.label : undefined
}

// Frame metrics from the group size ('fit' has no control height: uses default).
const frame = computed(() => {
  const s = props.size === 'fit' ? 'default' : props.size
  return { '--g-h': `var(--t-control-h-${s})`, '--g-r': `var(--t-radius-${s})` }
})

// Sliding thumb (segmented, single select): the selected button's box; only its translateX is animated.
const rootEl = ref<HTMLElement | null>(null)
const pill = useSlidingIndicator(
  rootEl,
  () => rootEl.value?.querySelector<HTMLElement>('[aria-pressed="true"]'),
  [() => props.modelValue, () => props.options, () => props.labelDisplay, () => props.size, () => props.mode]
)

// Direct DOM-child TButtons drop their own mode, ripple and press shrink (see TButton).
provide('buttonGroup', getCurrentInstance())
</script>

<template>
  <div
    ref="rootEl"
    class="t-button-group"
    :class="[`t-button-group--${mode}`, { 't-button-group--multi': multi }]"
    :style="frame"
    role="group"
  >
    <span
      v-if="pill && options && mode === 'segmented' && !multi"
      class="t-button-group__pill"
      aria-hidden="true"
      :style="{ width: `${pill.w}px`, height: `${pill.h}px`, '--x': `${pill.x}px` }"
    />
    <!-- Render buttons from options if provided -->
    <template v-if="options">
      <TButton
        v-for="option in options"
        :key="option.value"
        type="button"
        :variant="variant"
        :aria-pressed="isSelected(option.value) ? 'true' : 'false'"
        :size="size"
        :icon="option.icon"
        :label="getLabel(option)"
        :title="getHiddenLabel(option)"
        :aria-label="getHiddenLabel(option)"
        :disabled="option.disabled"
        @click="handleClick(option.value)"
      />
    </template>

    <!-- Otherwise use slot -->
    <slot v-else />
  </div>
</template>

<style scoped>
/* Frame: segmented = surface-2 track with a raised thumb; plain = hairline frame with a soft tint.
   --g-h / --g-r (control height / radius of the size) come from the size prop. */
.t-button-group {
  position: relative;
  display: inline-flex;
  isolation: isolate;
}

.t-button-group--segmented {
  --g-bh: calc(var(--g-h) - 4px);
  --g-dx: -1.5px;
  --g-dy: 28%;
  gap: 2px;
  padding: 2px;
  border-radius: calc(var(--g-r) + 2px);
  background: var(--t-color-surface-2);
  /* Hairline keeps the track visible in dark, where surface-2 is close to surface. */
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--t-color-border) 70%, transparent);
}

.t-button-group--plain {
  --g-bh: calc(var(--g-h) - 2px);
  overflow: hidden;
  border: 1px solid var(--t-color-border);
  border-radius: var(--g-r);
  background: var(--t-color-surface);
}

/* Items (options or slotted TButtons): the group draws frame and states; the item variant is its text/icon tone.
   Film (--g-a) plus selected tint (--g-s) of currentColor. */
.t-button-group > :deep(.t-button) {
  height: var(--g-bh);
  border: 0;
  border-radius: 0;
  background-color: color-mix(in srgb, currentColor calc(var(--g-a, 0%) + var(--g-s, 0%)), transparent);
  color: var(--t-btn-color-plain-text);
  transition:
    color var(--t-duration) var(--t-ease),
    background-color var(--t-duration) var(--t-ease);
}

.t-button-group--segmented > :deep(.t-button) {
  border-radius: var(--g-r);
}

/* Disabled fades the content only: dividers, tint and thumb stay intact. */
.t-button-group > :deep(.t-button:disabled) {
  opacity: 1;
  -webkit-text-fill-color: color-mix(in srgb, currentColor 50%, transparent);
}

.t-button-group > :deep(.t-button:disabled svg) {
  opacity: 0.5;
}

.t-button-group > :deep(.t-button--icon) {
  width: var(--g-bh);
  padding: 0;
}

.t-button-group > :deep(.t-button:hover) { --g-a: 8%; }
.t-button-group > :deep(.t-button:active) { --g-a: 14%; }

/* Inset ring: never clipped by the frame or hidden under neighbours. */
.t-button-group > :deep(.t-button:focus-visible) {
  outline-color: var(--t-color-accent);
  outline-offset: calc(var(--t-focus-ring) * -1);
}

/* Toggle options: unselected labels read as buttons, not as disabled. */
.t-button-group > :deep([aria-pressed='false']) {
  color: var(--t-color-text);
}

.t-button-group--segmented > :deep([aria-pressed='false']:not(:hover)) {
  color: color-mix(in srgb, var(--t-color-text) 55%, var(--t-color-text-muted));
}

.t-button-group--plain > :deep([aria-pressed='false'] svg) {
  color: var(--t-color-text-muted);
}

/* Segmented selected: text color on the thumb, icon in the tone, no film. */
.t-button-group--segmented > :deep(.t-button[aria-pressed='true']) {
  --g-a: 0%;
  color: var(--t-color-text);
}

.t-button-group--segmented > :deep([aria-pressed='true'] svg) {
  color: var(--t-btn-color-plain-text);
}

/* Plain selected: the film adds to the tint (10 / 18 / 24%), so the option stays "on" while pressed. */
.t-button-group--plain > :deep([aria-pressed='true']) { --g-s: 10%; }

/* Dividers: short ones in the track gap (segmented), full hairlines (plain). */
.t-button-group > :deep(.t-button + .t-button::after) {
  content: '';
  position: absolute;
  left: var(--g-dx, 0);
  top: var(--g-dy, 0);
  bottom: var(--g-dy, 0);
  width: 1px;
  background: var(--g-d, var(--t-color-border));
  transition: opacity var(--t-duration) var(--t-ease);
}

/* Segmented: gone next to a thumb or under hover / press. */
.t-button-group--segmented > :deep(:is([aria-pressed='true'], :hover)::after),
.t-button-group--segmented > :deep(:is([aria-pressed='true'], :hover) + .t-button::after) {
  opacity: 0;
}

/* Plain: both edges of a selected option take the tone, adjacent selections stay countable. */
.t-button-group--plain > :deep([aria-pressed='true'] + .t-button),
.t-button-group--plain > :deep(.t-button + [aria-pressed='true']) {
  --g-d: color-mix(in srgb, var(--t-btn-color-plain-text) 40%, transparent);
}

/* Thumb: one sliding pill (single select) or one per selected option (multi select). */
.t-button-group__pill,
.t-button-group--segmented.t-button-group--multi > :deep(.t-button::before) {
  position: absolute;
  border-radius: var(--g-r);
  background: var(--t-color-surface);
  box-shadow: var(--t-shadow-1), 0 0 0 1px color-mix(in srgb, var(--t-color-text) 14%, transparent);
  pointer-events: none;
}

.t-button-group__pill {
  top: 2px;
  left: 0;
  transform: translateX(var(--x));
  transition: transform var(--t-duration-slow) var(--t-ease);
}

/* Press on the selected option squeezes the thumb (none at reduced motion). */
.t-button-group:has([aria-pressed='true']:active) .t-button-group__pill {
  transform: translateX(var(--x)) scale(calc(1 - 0.04 * var(--t-motion-move)));
}

.t-button-group--segmented.t-button-group--multi > :deep(.t-button::before) {
  content: '';
  inset: 0;
  z-index: -1;
  opacity: 0;
  transform: scale(calc(1 - 0.08 * var(--t-motion-move)));
  transition:
    opacity var(--t-duration) var(--t-ease),
    transform var(--t-duration-slow) var(--t-ease-spring);
}

.t-button-group--segmented.t-button-group--multi > :deep([aria-pressed='true']::before) {
  opacity: 1;
  transform: none;
}
</style>
