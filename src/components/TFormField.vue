<script lang="ts">
import type { InjectionKey } from 'vue'
import type { TElementSize } from './types'

export interface TFormFieldContext {
  /** Generated id for the control; parent expects to bind it via `id` attr or `for`. */
  id: string
  /** Id of the description element — wire into `aria-describedby` in child. */
  descriptionId: string | undefined
  /** Id of the error message element — wire into `aria-describedby` in child when error. */
  errorId: string | undefined
  /** Error value from the wrapper; child may surface own state styling. */
  error: string | boolean | undefined
  /** Propagated size so children match field sizing without manual prop plumbing. */
  size: TElementSize | undefined
  /** Required marker is surfaced by the label; also useful for `aria-required` in child. */
  required: boolean
}

/** InjectionKey for `TFormField` context. Exposed so child components can read it. */
export const TFormFieldContextKey: InjectionKey<TFormFieldContext> = Symbol('TFormFieldContext')
</script>

<script setup lang="ts">
import { computed, provide, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    label?: string
    required?: boolean
    error?: string | boolean
    hint?: string
    size?: TElementSize
    /** Optional explicit id. When omitted, a stable id is generated via `useId()`. */
    id?: string
  }>(),
  {
    required: false,
  },
)

const autoId = useId()
const fieldId = computed(() => props.id ?? autoId)
const errorId = computed(() => `${fieldId.value}-error`)
const hintId = computed(() => `${fieldId.value}-hint`)

const hasError = computed(() => props.error !== undefined && props.error !== false)
const errorText = computed(() => (typeof props.error === 'string' ? props.error : ''))
// Hint is hidden when any error is present (error wins — more important feedback).
const showHint = computed(() => !hasError.value && !!props.hint)
const describedById = computed(() => {
  if (hasError.value && errorText.value) return errorId.value
  if (showHint.value) return hintId.value
  return undefined
})

const context = computed<TFormFieldContext>(() => ({
  id: fieldId.value,
  descriptionId: showHint.value ? hintId.value : undefined,
  errorId: hasError.value && errorText.value ? errorId.value : undefined,
  error: props.error,
  size: props.size,
  required: props.required,
}))

// Provide reactive context for child components that opt-in to injection.
provide(TFormFieldContextKey, new Proxy({} as TFormFieldContext, {
  get(_t, key: keyof TFormFieldContext) {
    return context.value[key]
  },
  has(_t, key) {
    return key in context.value
  },
  ownKeys() {
    return Reflect.ownKeys(context.value)
  },
  getOwnPropertyDescriptor(_t, key) {
    return Reflect.getOwnPropertyDescriptor(context.value, key)
  },
}))

defineSlots<{
  default: (props: {
    id: string
    ariaDescribedby: string | undefined
    ariaInvalid: boolean
    ariaRequired: boolean
    size: TElementSize | undefined
    error: string | boolean | undefined
  }) => unknown
  label: (props: { label: string | undefined; required: boolean; for: string }) => unknown
  hint: (props: { hint: string | undefined; id: string }) => unknown
  error: (props: { error: string; id: string }) => unknown
}>()
</script>

<template>
  <div
    class="t-form-field"
    :class="[
      props.size ? `size-${props.size}` : null,
      { 'has-error': hasError, 'is-required': props.required },
    ]"
  >
    <slot
      name="label"
      :label="props.label"
      :required="props.required"
      :for="fieldId"
    >
      <label
        v-if="props.label"
        class="t-form-field__label"
        :for="fieldId"
      >
        {{ props.label }}
        <span
          v-if="props.required"
          class="t-form-field__required"
          aria-hidden="true"
        >*</span>
      </label>
    </slot>

    <div class="t-form-field__control">
      <slot
        :id="fieldId"
        :aria-describedby="describedById"
        :aria-invalid="hasError"
        :aria-required="props.required"
        :size="props.size"
        :error="props.error"
      />
    </div>

    <slot
      v-if="hasError && errorText"
      :id="errorId"
      name="error"
      :error="errorText"
    >
      <p
        :id="errorId"
        class="t-form-field__error"
        role="alert"
      >
        {{ errorText }}
      </p>
    </slot>

    <slot
      v-else-if="showHint"
      :id="hintId"
      name="hint"
      :hint="props.hint"
    >
      <p
        :id="hintId"
        class="t-form-field__hint"
      >
        {{ props.hint }}
      </p>
    </slot>
  </div>
</template>

<style scoped>
.t-form-field {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-1);
  width: 100%;
  min-width: 0;
}

.t-form-field__label {
  font-size: var(--t-font-size-small, 0.875rem);
  font-weight: 500;
  color: var(--t-color-text);
  line-height: 1.2;
}

.t-form-field__required {
  color: var(--t-color-danger, #ef4444);
  margin-left: 2px;
}

.t-form-field__control {
  display: flex;
  width: 100%;
  min-width: 0;
}

.t-form-field__hint {
  margin: 0;
  font-size: var(--t-font-size-mini, 0.75rem);
  color: var(--t-color-text-muted);
  line-height: 1.3;
}

.t-form-field__error {
  margin: 0;
  font-size: var(--t-font-size-mini, 0.75rem);
  color: var(--t-color-danger, #ef4444);
  line-height: 1.3;
}

.t-form-field.size-mini .t-form-field__label {
  font-size: var(--t-font-size-mini);
}

.t-form-field.size-large .t-form-field__label {
  font-size: var(--t-font-size-default);
}
</style>
