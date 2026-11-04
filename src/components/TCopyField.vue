<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import Input from './TInput.vue'
import Button from './TButton.vue'
import { copyText } from './clipboard'

export interface TCopyFieldProps {
  value: string
  copyLabel?: string
  copiedLabel?: string
}

const props = withDefaults(defineProps<TCopyFieldProps>(), {
  copyLabel: 'Copy',
  copiedLabel: 'Copied',
})

const emit = defineEmits<{
  'copy': [value: string]
  'copy-error': [value: string]
}>()

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

onBeforeUnmount(() => clearTimeout(timer))

async function copy() {
  if (await copyText(props.value)) {
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (copied.value = false), 1500)
    emit('copy', props.value)
  } else {
    emit('copy-error', props.value)
  }
}
</script>

<template>
  <div class="t-copy-field">
    <Input
      class="t-copy-field__value"
      :model-value="value"
      :title="value"
      readonly
      size="small"
    />
    <Button
      type="button"
      size="small"
      :variant="copied ? 'success' : 'neutral'"
      :icon="copied ? 'ticon:check' : 'ticon:copy'"
      :label="copied ? copiedLabel : copyLabel"
      @click="copy"
    />
  </div>
</template>

<style scoped>
.t-copy-field {
  display: flex;
  align-items: flex-start;
  gap: var(--t-space-2);
  min-width: 0;
}

.t-copy-field__value {
  flex: 1 1 auto;
  font-family: var(--t-font-mono);
}
</style>
