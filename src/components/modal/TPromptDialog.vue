<script setup lang="ts">
import { ref, type Component } from 'vue'
import TButton from '../TButton.vue'
import TInput from '../TInput.vue'
import Icon from '../TIcon.vue'
import type { DialogVariant } from './TConfirmDialog.vue'

const props = withDefaults(
  defineProps<{
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
    variant?: DialogVariant
    inputValue?: string
    placeholder?: string
    inputLabel?: string
    contentComponent?: Component | null
    componentProps?: Record<string, unknown>
    onConfirm?: (value: string) => void
    onCancel?: () => void
  }>(),
  {
    confirmText: 'OK',
    cancelText: 'Cancel',
    variant: 'neutral',
    inputValue: '',
    contentComponent: null,
    componentProps: () => ({}),
  }
)

const VARIANT_ICONS: Record<DialogVariant, string> = {
  neutral: '',
  info: 'ticon:info',
  success: 'ticon:check-circle',
  warning: 'ticon:warning',
  danger: 'ticon:error',
}

const variantIcon = props.variant !== 'neutral' ? VARIANT_ICONS[props.variant] : ''

const inputModel = ref(props.inputValue ?? '')

const handleConfirm = () => {
  props.onConfirm?.(inputModel.value)
}

const handleCancel = () => {
  props.onCancel?.()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleConfirm()
  }
}
</script>

<template>
  <div class="t-prompt-dialog">
    <div class="t-prompt-dialog-body">
      <div
        v-if="variantIcon || title"
        class="t-prompt-dialog-header"
        :class="`t-prompt-dialog-header--${variant}`"
      >
        <Icon
          v-if="variantIcon"
          :icon="variantIcon"
          class="t-prompt-dialog-icon"
        />
        <span
          v-if="title"
          class="t-prompt-dialog-title"
        >{{ title }}</span>
      </div>

      <p
        v-if="message"
        class="t-prompt-dialog-message"
      >
        {{ message }}
      </p>

      <div class="t-prompt-dialog-input-wrap">
        <label
          v-if="inputLabel"
          class="t-prompt-dialog-label"
        >{{ inputLabel }}</label>
        <component
          :is="contentComponent"
          v-if="contentComponent"
          v-bind="componentProps"
        />
        <TInput
          v-else
          v-model="inputModel"
          :placeholder="placeholder"
          @keydown="handleKeydown"
        />
      </div>
    </div>

    <div class="t-prompt-dialog-actions">
      <TButton
        variant="neutral"
        mode="plain"
        @click="handleCancel"
      >
        {{ cancelText }}
      </TButton>
      <TButton
        :variant="variant === 'danger' ? 'danger' : variant === 'success' ? 'success' : 'accent'"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </TButton>
    </div>
  </div>
</template>

<style scoped>
.t-prompt-dialog {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-4);
  padding: var(--t-space-4);
  min-width: 280px;
}

.t-prompt-dialog-body {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-3);
}

.t-prompt-dialog-header {
  display: flex;
  align-items: center;
  gap: var(--t-space-2);
}

.t-prompt-dialog-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
}

.t-prompt-dialog-header--info .t-prompt-dialog-icon {
  color: var(--t-color-info);
}

.t-prompt-dialog-header--success .t-prompt-dialog-icon {
  color: var(--t-color-success);
}

.t-prompt-dialog-header--warning .t-prompt-dialog-icon {
  color: var(--t-color-warning);
}

.t-prompt-dialog-header--danger .t-prompt-dialog-icon {
  color: var(--t-color-danger);
}

.t-prompt-dialog-title {
  font-size: var(--t-font-size-default);
  font-weight: 600;
  color: var(--t-color-text);
}

.t-prompt-dialog-message {
  font-size: var(--t-font-size-default);
  color: var(--t-color-text-muted);
  margin: 0;
  line-height: 1.5;
}

.t-prompt-dialog-input-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-2);
}

.t-prompt-dialog-label {
  font-size: var(--t-font-size-default);
  font-weight: 500;
  color: var(--t-color-text);
}

.t-prompt-dialog-actions {
  display: flex;
  gap: var(--t-space-2);
  justify-content: flex-end;
}
</style>
