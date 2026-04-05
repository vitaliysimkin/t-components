<script setup lang="ts">
import { computed, useAttrs } from 'vue'

export type TSwitchSize = 'mini' | 'small' | 'default' | 'medium' | 'large'
export type TSwitchLabelPosition = 'left' | 'right'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    size?: TSwitchSize
    disabled?: boolean
    label?: string
    labelPosition?: TSwitchLabelPosition
  }>(),
  {
    size: 'default',
    disabled: false,
    labelPosition: 'right'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const attrs = useAttrs()

const rootClass = computed(() => attrs.class)
const rootStyle = computed(() => attrs.style)

const inputAttrs = computed(() => {
  const a = attrs as Record<string, unknown>
  const { class: _class, style: _style, ...rest } = a
  return rest
})

</script>

<template>
  <label
    class="t-switch"
    :class="[
      `size-${props.size}`,
      `label-${props.labelPosition}`,
      { 'is-disabled': props.disabled },
      rootClass
    ]"
    :style="rootStyle as any"
  >
    <span v-if="props.labelPosition === 'left'" class="t-switch__label">
      <slot>{{ props.label }}</slot>
    </span>

    <span class="t-switch__control">
      <input
        class="t-switch__input"
        type="checkbox"
        :checked="props.modelValue"
        :disabled="props.disabled"
        v-bind="inputAttrs"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <span class="t-switch__track" aria-hidden="true">
        <span class="t-switch__thumb" />
      </span>
    </span>

    <span v-if="props.labelPosition === 'right'" class="t-switch__label">
      <slot>{{ props.label }}</slot>
    </span>
  </label>
</template>

<style scoped>
.t-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--t-space-2);
  cursor: pointer;
  user-select: none;
}

.t-switch.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.t-switch__label {
  font-size: var(--t-switch-font-size);
  color: var(--t-color-text);
  line-height: 1.2;
}

.t-switch__control {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: var(--t-switch-h);
  width: var(--t-switch-w);
}

.t-switch__input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: inherit;
}

.t-switch__track {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: var(--t-switch-off-bg);
  border: 1px solid var(--t-switch-off-border);
  transition: background-color 140ms ease, border-color 140ms ease;
  box-sizing: border-box;
}

.t-switch__thumb {
  position: absolute;
  top: 50%;
  left: var(--t-switch-pad);
  width: var(--t-switch-thumb);
  height: var(--t-switch-thumb);
  border-radius: 999px;
  background: var(--t-color-surface);
  box-shadow: var(--t-shadow-1);
  transform: translate(0, -50%);
  transition: transform 160ms ease;
}

/* Hover */
.t-switch:not(.is-disabled) .t-switch__input:hover + .t-switch__track {
  border-color: var(--t-color-border-strong);
}

/* Focus */
.t-switch__input:focus-visible + .t-switch__track {
  box-shadow: 0 0 0 3px var(--t-color-focus-ring);
}

/* Checked */
.t-switch__input:checked + .t-switch__track {
  background: var(--t-switch-on-bg);
  border-color: var(--t-switch-on-bg);
}

.t-switch__input:checked + .t-switch__track .t-switch__thumb,
.t-switch__input:checked + .t-switch__track + .t-switch__thumb {
  /* no-op, keep compatibility */
}

.t-switch__input:checked ~ .t-switch__track .t-switch__thumb {
  transform: translate(var(--t-switch-translate), -50%);
}

/* Structure: input + track (thumb is inside track visually, but separate element) */
.t-switch__input:checked + .t-switch__track + .t-switch__thumb {
  /* no-op */
}

/* Label position */
.t-switch.label-left {
  flex-direction: row;
}

.t-switch.label-right {
  flex-direction: row;
}

/* Sizes (same scale as TButton/TInput) */
.t-switch.size-mini {
  --t-switch-h: 1.125rem; /* 18px */
  --t-switch-w: 2rem;     /* 32px */
  --t-switch-pad: 2px;
  --t-switch-thumb: 0.875rem; /* 14px */
  --t-switch-font-size: var(--t-font-size-mini);
}

.t-switch.size-small {
  --t-switch-h: 1.25rem;  /* 20px */
  --t-switch-w: 2.25rem;  /* 36px */
  --t-switch-pad: 2px;
  --t-switch-thumb: 1rem; /* 16px */
  --t-switch-font-size: var(--t-font-size-small);
}

.t-switch.size-default {
  --t-switch-h: 1.375rem; /* 22px */
  --t-switch-w: 2.5rem;   /* 40px */
  --t-switch-pad: 2px;
  --t-switch-thumb: 1.125rem; /* 18px */
  --t-switch-font-size: var(--t-font-size-default);
}

.t-switch.size-medium {
  --t-switch-h: 1.5rem;   /* 24px */
  --t-switch-w: 2.75rem;  /* 44px */
  --t-switch-pad: 3px;
  --t-switch-thumb: 1.25rem; /* 20px */
  --t-switch-font-size: var(--t-font-size-medium);
}

.t-switch.size-large {
  --t-switch-h: 1.75rem;  /* 28px */
  --t-switch-w: 3.25rem;  /* 52px */
  --t-switch-pad: 3px;
  --t-switch-thumb: 1.5rem; /* 24px */
  --t-switch-font-size: var(--t-font-size-large);
}

.t-switch.size-fit {
  width: 100%;
  justify-content: space-between;
}

/* Derived */
.t-switch {
  --t-switch-off-bg: var(--t-color-surface-2);
  --t-switch-off-border: var(--t-color-border);
  --t-switch-on-bg: var(--t-color-accent);
  --t-switch-translate: calc(var(--t-switch-w) - var(--t-switch-thumb) - (var(--t-switch-pad) * 2));
}
</style>
