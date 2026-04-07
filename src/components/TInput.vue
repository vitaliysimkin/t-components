<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { TElementSize } from './types'

const props = withDefaults(
  defineProps<{
    size?: TElementSize
    modelValue?: string | number
    prefixIcon?: string
    suffixIcon?: string
    clearable?: boolean
  }>(),
  {
    size: 'default',
    clearable: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'clear': []
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}

</script>

<template>
  <div
    class="t-input-wrapper"
    :class="`size-${props.size}`"
  >
    <Icon v-if="prefixIcon" :icon="prefixIcon" class="t-input-icon t-input-icon--prefix" @mousedown.prevent="inputRef?.focus()" />
    <input
      ref="inputRef"
      class="t-input"
      :class="{
        'has-prefix': prefixIcon,
        'has-suffix': suffixIcon || (clearable && modelValue)
      }"
      :value="modelValue"
      v-bind="$attrs"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <Icon 
      v-if="clearable && modelValue" 
      icon="system-uicons:close" 
      class="t-input-icon t-input-icon--clear" 
      @click="handleClear"
    />
    <Icon v-if="suffixIcon" :icon="suffixIcon" class="t-input-icon t-input-icon--suffix" @mousedown.prevent="inputRef?.focus()" />
  </div>
</template>

<style scoped>
/* ========================================
   WRAPPER STYLES
   Container for input and icons
   ======================================== */
.t-input-wrapper {
  position: relative;
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  height: var(--t-input-height);
  border-radius: var(--t-input-radius);
  border: 1px solid var(--t-color-border);
  background-color: var(--t-color-surface);
  transition: all 0.15s ease;
  box-sizing: border-box;
  gap: var(--t-space-2);
  padding: 0 var(--t-space-3);
    flex-direction: row;
}

.t-input-wrapper:focus-within {
  border-color: var(--t-color-accent);
}

.t-input-wrapper:has(.t-input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* ========================================
   INPUT STYLES
   ======================================== */
.t-input {
  flex: 1;
  min-width: 0;
  width: 0;
  padding: 0;
  height: 100%;
  border: none;
  background: transparent;
  font-size: var(--t-input-font-size);
  font-weight: 500;
  color: var(--t-color-text);
  outline: none;
  box-sizing: border-box;
}

.t-input::placeholder {
  color: var(--t-color-text-muted);
}

/* ========================================
   ICON STYLES
   ======================================== */
.t-input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  color: var(--t-color-text-muted);
  font-size: var(--t-input-font-size);
  line-height: 1;
  flex-shrink: 0;
  font-size: 1.3em;
}


.t-input-icon--clear {
  cursor: pointer;
  transition: color 0.15s ease;
  font-size: 1.3em;
}

.t-input-icon--clear:hover {
  color: var(--t-color-text);
}

/* ========================================
   SIZE VARIANTS
   Map size prop to CSS variables
   ======================================== */
.t-input-wrapper.size-mini {
  --t-input-height: var(--t-control-h-mini);
  --t-input-font-size: var(--t-font-size-mini);
  --t-input-radius: var(--t-radius-mini);
}

.t-input-wrapper.size-small {
  --t-input-height: var(--t-control-h-small);
  --t-input-font-size: var(--t-font-size-small);
  --t-input-radius: var(--t-radius-small);
}

.t-input-wrapper.size-default {
  --t-input-height: var(--t-control-h-default);
  --t-input-font-size: var(--t-font-size-default);
  --t-input-radius: var(--t-radius-default);
}

.t-input-wrapper.size-medium {
  --t-input-height: var(--t-control-h-medium);
  --t-input-font-size: var(--t-font-size-medium);
  --t-input-radius: var(--t-radius-medium);
}

.t-input-wrapper.size-large {
  --t-input-height: var(--t-control-h-large);
  --t-input-font-size: var(--t-font-size-large);
  --t-input-radius: var(--t-radius-large);
}
</style>