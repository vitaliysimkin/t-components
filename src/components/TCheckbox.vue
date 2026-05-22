<script setup lang="ts">
import { computed, inject, useAttrs, useTemplateRef } from 'vue'
import type { TElementSize } from './types'
import { TFormFieldContextKey } from './TFormField.vue'

export interface TCheckboxProps {
  modelValue: boolean
  label?: string
  size?: TElementSize
  disabled?: boolean
  error?: string | boolean
  indeterminate?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<TCheckboxProps>(),
  {
    disabled: false,
    error: false,
    indeterminate: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// Integrate with TFormField context when placed inside a TFormField wrapper.
const fieldCtx = inject(TFormFieldContextKey, null)

const resolvedId = computed(() => fieldCtx?.id)
const resolvedError = computed<string | boolean>(() => {
  if (props.error !== false && props.error !== '' && props.error !== undefined) {
    return props.error
  }
  if (fieldCtx?.error !== undefined && fieldCtx.error !== false) {
    return fieldCtx.error
  }
  return false
})
const resolvedSize = computed<TElementSize>(() => props.size ?? fieldCtx?.size ?? 'default')
const resolvedRequired = computed(() => fieldCtx?.required ?? false)

const hasError = computed(() =>
  resolvedError.value !== false &&
  resolvedError.value !== '' &&
  resolvedError.value !== undefined
)

const attrs = useAttrs()
const rootClass = computed(() => attrs.class)
const rootStyle = computed(() => attrs.style)
const inputAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = attrs as Record<string, unknown>
  return rest
})

// Sync indeterminate DOM property via template ref — cannot be set via attr
const inputRef = useTemplateRef<HTMLInputElement>('inputEl')

import { watch, onMounted } from 'vue'

function syncIndeterminate() {
  if (inputRef.value) {
    inputRef.value.indeterminate = props.indeterminate && !props.modelValue
  }
}

onMounted(syncIndeterminate)
watch(() => [props.indeterminate, props.modelValue], syncIndeterminate)

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <label
    class="t-checkbox"
    :class="[
      `size-${resolvedSize}`,
      {
        'is-disabled': props.disabled,
        'is-error': hasError,
        'is-checked': props.modelValue,
        'is-indeterminate': props.indeterminate && !props.modelValue,
      },
      rootClass,
    ]"
    :style="rootStyle as any"
  >
    <span class="t-checkbox__control">
      <input
        :id="resolvedId || undefined"
        ref="inputEl"
        class="t-checkbox__input"
        type="checkbox"
        :checked="props.modelValue"
        :disabled="props.disabled"
        :required="resolvedRequired || undefined"
        :aria-invalid="hasError || undefined"
        :aria-required="resolvedRequired || undefined"
        v-bind="inputAttrs"
        @change="onChange"
      >
      <span
        class="t-checkbox__box"
        aria-hidden="true"
      />
    </span>

    <span
      v-if="$slots.default || props.label"
      class="t-checkbox__label"
    >
      <slot>{{ props.label }}</slot>
    </span>
  </label>
</template>

<style scoped>
/* ─── Root ─────────────────────────────────────────────────────────────────── */
.t-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--t-space-2);
  cursor: pointer;
  user-select: none;
}

.t-checkbox.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ─── Control (visual box + hidden native input) ────────────────────────────── */
.t-checkbox__control {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--t-checkbox-size);
  height: var(--t-checkbox-size);
}

.t-checkbox__input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: inherit;
  width: 100%;
  height: 100%;
}

/* ─── Visual box ─────────────────────────────────────────────────────────────── */
.t-checkbox__box {
  width: var(--t-checkbox-size);
  height: var(--t-checkbox-size);
  border-radius: var(--t-checkbox-radius);
  border: 1.5px solid var(--t-color-border);
  background: var(--t-color-surface);
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    box-shadow 120ms ease;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Checkmark via clip-path pseudo element */
.t-checkbox__box::after {
  content: '';
  display: block;
  opacity: 0;
  transition: opacity 100ms ease, transform 100ms ease;
}

/* ─── Hover ─────────────────────────────────────────────────────────────────── */
.t-checkbox:not(.is-disabled) .t-checkbox__input:hover + .t-checkbox__box {
  border-color: var(--t-color-border-strong);
}

/* ─── Focus ─────────────────────────────────────────────────────────────────── */
.t-checkbox__input:focus-visible + .t-checkbox__box {
  box-shadow: 0 0 0 3px var(--t-color-focus-ring);
}

/* ─── Checked ─────────────────────────────────────────────────────────────────── */
.t-checkbox.is-checked .t-checkbox__box {
  background: var(--t-color-accent);
  border-color: var(--t-color-accent);
}

.t-checkbox.is-checked .t-checkbox__box::after {
  opacity: 1;
  /* SVG checkmark rendered via clip-path */
  width: calc(var(--t-checkbox-size) * 0.55);
  height: calc(var(--t-checkbox-size) * 0.3);
  border-left: 2px solid var(--t-color-surface);
  border-bottom: 2px solid var(--t-color-surface);
  transform: rotate(-45deg) translateY(-15%);
  box-sizing: border-box;
}

/* ─── Indeterminate ─────────────────────────────────────────────────────────── */
.t-checkbox.is-indeterminate .t-checkbox__box {
  background: var(--t-color-accent);
  border-color: var(--t-color-accent);
}

.t-checkbox.is-indeterminate .t-checkbox__box::after {
  opacity: 1;
  width: calc(var(--t-checkbox-size) * 0.55);
  height: 2px;
  background: var(--t-color-surface);
  border: none;
  transform: none;
}

/* ─── Error ─────────────────────────────────────────────────────────────────── */
.t-checkbox.is-error .t-checkbox__box {
  border-color: var(--t-color-danger);
  box-shadow: 0 0 0 1px var(--t-color-danger);
}

/* ─── Label ─────────────────────────────────────────────────────────────────── */
.t-checkbox__label {
  font-size: var(--t-checkbox-font-size);
  color: var(--t-color-text);
  line-height: 1.2;
}

/* ─── Sizes ─────────────────────────────────────────────────────────────────── */
.t-checkbox.size-mini {
  --t-checkbox-size: 0.875rem;  /* 14px */
  --t-checkbox-radius: 3px;
  --t-checkbox-font-size: var(--t-font-size-mini);
}

.t-checkbox.size-small {
  --t-checkbox-size: 1rem;      /* 16px */
  --t-checkbox-radius: 3px;
  --t-checkbox-font-size: var(--t-font-size-small);
}

.t-checkbox.size-default {
  --t-checkbox-size: 1.125rem;  /* 18px */
  --t-checkbox-radius: 4px;
  --t-checkbox-font-size: var(--t-font-size-default);
}

.t-checkbox.size-medium {
  --t-checkbox-size: 1.25rem;   /* 20px */
  --t-checkbox-radius: 4px;
  --t-checkbox-font-size: var(--t-font-size-medium);
}

.t-checkbox.size-large {
  --t-checkbox-size: 1.5rem;    /* 24px */
  --t-checkbox-radius: 5px;
  --t-checkbox-font-size: var(--t-font-size-large);
}
</style>
