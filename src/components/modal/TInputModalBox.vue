<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ModalInputConfig } from './types'
import TInput from '../TInput.vue'
import TTextarea from '../TTextarea.vue'
import TSwitch from '../TSwitch.vue'
import TButton from '../TButton.vue'
import TCodeEditor from '../TCodeEditor.vue'

const props = withDefaults(
  defineProps<{
    inputs: Array<ModalInputConfig> | ModalInputConfig
    onSubmit?: (values: Record<string, unknown>) => void
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
  }>(),
  {
    submitLabel: 'Submit',
    cancelLabel: 'Cancel',
  },
)

const inputsArray = computed(() =>
  Array.isArray(props.inputs) ? props.inputs : [props.inputs]
)

const values = ref<Record<string, unknown>>({})

// Initialize values
inputsArray.value.forEach(input => {
  values.value[input.code] = input.defaultValue ?? ''
})

const handleSubmit = () => {
  props.onSubmit?.(values.value)
}

const handleCancel = () => {
  props.onCancel?.()
}
</script>

<template>
  <div class="t-input-modal">
    <div class="t-input-modal-form">
      <div 
        v-for="input in inputsArray" 
        :key="input.code"
        class="t-input-modal-field"
      >
        <label class="t-input-modal-label">{{ input.label }}</label>
        <TTextarea 
          v-if="input.type === 'textarea'"
          v-model="values[input.code]"
          :placeholder="input.placeholder"
          v-bind="input.attrs"
        />
        <TSwitch
          v-else-if="input.type === 'swtich'"
          v-model="values[input.code]"
          :label="input.label"
          v-bind="input.attrs"
        />
        <TCodeEditor
          v-else-if="input.type === 'code'"
          v-model="values[input.code]"
          v-bind="input.attrs"
        />
        <TInput 
          v-else
          v-model="values[input.code]"
          :type="input.type"
          :placeholder="input.placeholder"
          v-bind="input.attrs"
        />
      </div>
    </div>
    <div class="t-input-modal-actions">
      <TButton
        variant="neutral"
        @click="handleCancel"
      >
        {{ cancelLabel }}
      </TButton>
      <TButton
        variant="accent"
        @click="handleSubmit"
      >
        {{ submitLabel }}
      </TButton>
    </div>
  </div>
</template>

<style scoped>
.t-input-modal {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-4);
  padding: var(--t-space-4);
}

.t-input-modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-3);
}

.t-input-modal-field {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-2);
}

.t-input-modal-label {
  font-size: var(--t-font-size-default);
  font-weight: 500;
  color: var(--t-color-text);
}

.t-input-modal-actions {
  display: flex;
  gap: var(--t-space-2);
  justify-content: flex-end;
}
</style>
