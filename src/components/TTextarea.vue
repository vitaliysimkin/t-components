<script setup lang="ts">
export type TTextareaSize = 'mini' | 'small' | 'default' | 'medium' | 'large' | 'fit'

const props = withDefaults(
  defineProps<{
    size?: TTextareaSize
    placeholder?: string
    modelValue?: string
    rows?: number
  }>(),
  {
    size: 'default',
    rows: 3
  }
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <textarea 
    class="t-textarea" 
    :class="`size-${props.size}`"
    :placeholder="placeholder"
    :value="modelValue"
    :rows="rows"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

<style scoped>
/* ========================================
   BASE STYLES
   Geometry, typography, spacing, transitions
   ======================================== */
.t-textarea {
  padding: var(--t-space-1) var(--t-space-3);
  min-height: var(--t-textarea-height);
  border-radius: var(--t-textarea-radius);
  border: 1px solid var(--t-color-border);
  font-size: var(--t-textarea-font-size);
  cursor: text;
  transition: all 0.15s ease;
  display: block;
  font-weight: 500;
  background-color: var(--t-color-surface);
  color: var(--t-color-text);
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
  width: 100%;
}

.t-textarea:focus-visible {
  outline: none;
  border-color: var(--t-color-accent);
}

.t-textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.t-textarea::placeholder {
  color: var(--t-color-text-muted);
}

/* ========================================
   SIZE VARIANTS
   Map size prop to CSS variables
   ======================================== */
.t-textarea.size-mini {
  --t-textarea-height: var(--t-control-h-mini);
  --t-textarea-font-size: var(--t-font-size-mini);
  --t-textarea-radius: var(--t-radius-mini);
}

.t-textarea.size-small {
  --t-textarea-height: var(--t-control-h-small);
  --t-textarea-font-size: var(--t-font-size-small);
  --t-textarea-radius: var(--t-radius-small);
}

.t-textarea.size-default {
  --t-textarea-height: var(--t-control-h-default);
  --t-textarea-font-size: var(--t-font-size-default);
  --t-textarea-radius: var(--t-radius-default);
}

.t-textarea.size-medium {
  --t-textarea-height: var(--t-control-h-medium);
  --t-textarea-font-size: var(--t-font-size-medium);
  --t-textarea-radius: var(--t-radius-medium);
}

.t-textarea.size-large {
  --t-textarea-height: var(--t-control-h-large);
  --t-textarea-font-size: var(--t-font-size-large);
  --t-textarea-radius: var(--t-radius-large);
}
</style>