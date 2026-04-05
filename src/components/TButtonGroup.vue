<script setup lang="ts">
import { provide, computed } from 'vue'
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

// Provide context for child buttons if needed
provide('buttonGroup', { isToggleMode })
</script>

<template>
  <div class="t-button-group">
    <!-- Render buttons from options if provided -->
    <template v-if="options">
      <TButton
        v-for="option in options"
        :key="option.value"
        :variant="variant"
        mode="plain"
        :active="isSelected(option.value)"
        :size="size"
        :icon="option.icon"
        :label="getLabel(option)"
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
  display: inline-flex;
  flex-direction: row;
  isolation: isolate;
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
