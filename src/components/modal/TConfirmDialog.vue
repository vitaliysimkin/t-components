<script setup lang="ts">
import { type Component } from 'vue'
import TButton from '../TButton.vue'
import { Icon } from '@iconify/vue'

export type DialogVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

const props = withDefaults(
  defineProps<{
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
    variant?: DialogVariant
    /** When true, the cancel button is hidden (alert mode) */
    alertMode?: boolean
    contentComponent?: Component | null
    componentProps?: Record<string, unknown>
    onConfirm?: () => void
    onCancel?: () => void
  }>(),
  {
    confirmText: 'OK',
    cancelText: 'Cancel',
    variant: 'neutral',
    alertMode: false,
    contentComponent: null,
    componentProps: () => ({}),
  }
)

const VARIANT_ICONS: Record<DialogVariant, string> = {
  neutral: '',
  info: 'material-symbols:info-outline',
  success: 'material-symbols:check-circle-outline',
  warning: 'material-symbols:warning-outline',
  danger: 'material-symbols:error-outline',
}

const variantIcon = props.variant !== 'neutral' ? VARIANT_ICONS[props.variant] : ''

const handleConfirm = () => {
  props.onConfirm?.()
}

const handleCancel = () => {
  props.onCancel?.()
}
</script>

<template>
  <div class="t-confirm-dialog">
    <div class="t-confirm-dialog-body">
      <div
        v-if="variantIcon || title"
        class="t-confirm-dialog-header"
        :class="`t-confirm-dialog-header--${variant}`"
      >
        <Icon
          v-if="variantIcon"
          :icon="variantIcon"
          class="t-confirm-dialog-icon"
        />
        <span
          v-if="title"
          class="t-confirm-dialog-title"
        >{{ title }}</span>
      </div>

      <div class="t-confirm-dialog-content">
        <component
          :is="contentComponent"
          v-if="contentComponent"
          v-bind="componentProps"
        />
        <p
          v-else-if="message"
          class="t-confirm-dialog-message"
        >
          {{ message }}
        </p>
      </div>
    </div>

    <div class="t-confirm-dialog-actions">
      <TButton
        v-if="!alertMode"
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
.t-confirm-dialog {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-4);
  padding: var(--t-space-4);
  min-width: 280px;
}

.t-confirm-dialog-body {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-3);
}

.t-confirm-dialog-header {
  display: flex;
  align-items: center;
  gap: var(--t-space-2);
}

.t-confirm-dialog-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
}

.t-confirm-dialog-header--info .t-confirm-dialog-icon {
  color: var(--t-color-info);
}

.t-confirm-dialog-header--success .t-confirm-dialog-icon {
  color: var(--t-color-success);
}

.t-confirm-dialog-header--warning .t-confirm-dialog-icon {
  color: var(--t-color-warning);
}

.t-confirm-dialog-header--danger .t-confirm-dialog-icon {
  color: var(--t-color-danger);
}

.t-confirm-dialog-title {
  font-size: var(--t-font-size-default);
  font-weight: 600;
  color: var(--t-color-text);
}

.t-confirm-dialog-content {
  /* empty state is fine */
}

.t-confirm-dialog-message {
  font-size: var(--t-font-size-default);
  color: var(--t-color-text-muted);
  margin: 0;
  line-height: 1.5;
}

.t-confirm-dialog-actions {
  display: flex;
  gap: var(--t-space-2);
  justify-content: flex-end;
}
</style>
