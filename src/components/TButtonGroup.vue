<script setup lang="ts">
import { provide, computed, ref } from 'vue'
import { useSlidingIndicator } from '../composables/useSlidingIndicator'
import TButton, { type TButtonVariant, type TButtonSize } from './TButton.vue'

export type TButtonLabelDisplay = 'always' | 'selected' | 'never'

export interface TButtonGroupOption {
  value: string | number
  label?: string
  icon?: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    // Toggle mode props
    modelValue?: string | number | null
    options?: TButtonGroupOption[]
    variant?: TButtonVariant
    size?: TButtonSize
    labelDisplay?: TButtonLabelDisplay
    mandatory?: boolean
  }>(),
  {
    variant: 'accent',
    size: 'default',
    labelDisplay: 'always',
    mandatory: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const isToggleMode = computed(() => props.modelValue !== undefined && props.options !== undefined)

const handleClick = (value: string | number) => {
  if (!isToggleMode.value) return
  
  if (props.mandatory && props.modelValue === value) {
    return
  }
  
  const newValue = props.modelValue === value ? null : value
  emit('update:modelValue', newValue)
}

const isSelected = (value: string | number) => {
  return props.modelValue === value
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

// Sliding pill: the selected button's box; only its translateX is animated.
const rootEl = ref<HTMLElement | null>(null)
const pill = useSlidingIndicator(
  rootEl,
  () => rootEl.value?.querySelector<HTMLElement>('[aria-pressed="true"]'),
  [() => props.modelValue, () => props.options, () => props.labelDisplay, () => props.size]
)

// Provide context for child buttons if needed
provide('buttonGroup', { isToggleMode })
</script>

<template>
  <div
    ref="rootEl"
    class="t-button-group"
  >
    <span
      v-if="pill && options"
      class="t-button-group__pill"
      aria-hidden="true"
      :style="{
        width: `${pill.w}px`,
        height: `${pill.h}px`,
        transform: `translateX(${pill.x}px)`,
        background: `var(--t-color-${variant})`
      }"
    />
    <!-- Render buttons from options if provided -->
    <template v-if="options">
      <TButton
        v-for="option in options"
        :key="option.value"
        type="button"
        :variant="isSelected(option.value) ? variant : 'neutral'"
        :mode="isSelected(option.value) ? 'filled' : 'plain'"
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
/* ========================================
   BASE STYLES
   ======================================== */
.t-button-group {
  position: relative;
  display: inline-flex;
  flex-direction: row;
  isolation: isolate;
}

.t-button-group__pill {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: var(--t-radius-default);
  pointer-events: none;
  transition: transform var(--t-duration-slow) var(--t-ease);
}

/* With the pill present, buttons sit above it and the selected one drops its own fill. */
.t-button-group:has(.t-button-group__pill) :deep(.t-button[aria-pressed='true']) {
  background: transparent !important;
  border-color: transparent !important;
}

/* ========================================
   BUTTON STYLES WITHIN GROUP
   Remove gaps, merge borders, adjust corners
   ======================================== */

.t-button-group :deep(.t-button) {
  border-radius: 0;
}

.t-button-group :deep(.t-button:first-child) {
  border-top-left-radius: var(--t-radius-default);
  border-bottom-left-radius: var(--t-radius-default);
}

.t-button-group :deep(.t-button:last-child) {
  border-top-right-radius: var(--t-radius-default);
  border-bottom-right-radius: var(--t-radius-default);
}

.t-button-group :deep(.t-button:not(:last-child)) {
  border-right-width: 0;
}

.t-button-group :deep(.t-button:not(:first-child)) {
  margin-left: -1px;
}

</style>
