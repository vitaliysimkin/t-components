<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TInput from './TInput.vue'
import TDropdown from './TDropdown.vue'
import TDatePicker from './TDatePicker.vue'
import { isRealDate } from './date-utils'
import type { TDatePickerValue } from './TDatePicker.vue'

export interface TDateInputProps {
  modelValue: string | null
  editable?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<TDateInputProps>(), {
  editable: false,
  placeholder: 'ДД.ММ.РРРР',
})
const emit = defineEmits<{ (e: 'update:modelValue', v: string | null): void }>()

const dropdownRef = ref<InstanceType<typeof TDropdown> | null>(null)
const isOpen = ref(false)
const isEditing = ref(false)

const localText = ref('')

// Sync from modelValue when not editing
watch(
  () => props.modelValue,
  (val) => {
    if (!isEditing.value) localText.value = val ? formatDate(val) : ''
  },
  { immediate: true },
)

// YYYY-MM-DD → DD.MM.YYYY
function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

// DD.MM.YYYY → YYYY-MM-DD or null
function parseDate(s: string): string | null {
  const m = s.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (!m) return null
  const d = Number(m[1]), mo = Number(m[2]), y = Number(m[3])
  if (!isRealDate(y, mo, d)) return null
  const p = (n: number) => String(n).padStart(2, '0')
  return `${y}-${p(mo)}-${p(d)}`
}

const internalDate = computed<Date | null>(() => {
  if (!props.modelValue) return null
  const parts = props.modelValue.split('-').map(Number)
  return new Date(parts[0]!, parts[1]! - 1, parts[2]!)
})

function onTriggerClick() {
  if (props.editable) return
  if (isOpen.value) {
    dropdownRef.value?.close()
  } else {
    dropdownRef.value?.open()
  }
}

function onFocus() {
  if (!props.editable) return
  isEditing.value = true
  dropdownRef.value?.open()
}

function onBlur() {
  if (!props.editable) return
  isEditing.value = false
  commitText()
}

function commitText() {
  if (!localText.value.trim()) {
    emit('update:modelValue', null)
    return
  }
  const parsed = parseDate(localText.value)
  if (parsed) {
    emit('update:modelValue', parsed)
  } else {
    // Revert
    localText.value = props.modelValue ? formatDate(props.modelValue) : ''
  }
}

function onDateSelect(date: TDatePickerValue) {
  if (!(date instanceof Date)) return
  const p = (n: number) => String(n).padStart(2, '0')
  const val = `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
  localText.value = formatDate(val)
  emit('update:modelValue', val)
  dropdownRef.value?.close()
}
</script>

<template>
  <TDropdown
    ref="dropdownRef"
    v-model:is-open="isOpen"
    :close-on-panel-click="false"
    style="display: block; width: 100%;"
  >
    <template #trigger>
      <div
        class="t-date-input__trigger"
        @click="onTriggerClick"
      >
        <TInput
          v-model="localText"
          :placeholder="placeholder"
          suffix-icon="material-symbols:calendar-month-outline"
          :readonly="!editable"
          @focus="onFocus"
          @blur="onBlur"
          @keyup.enter="commitText"
        />
      </div>
    </template>

    <div class="t-date-input__panel">
      <TDatePicker
        :model-value="internalDate"
        @update:model-value="onDateSelect"
      />
    </div>
  </TDropdown>
</template>

<style scoped>
.t-date-input__trigger {
  width: 100%;
}

.t-date-input__panel {
  background: var(--t-color-bg);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-default);
  box-shadow: var(--t-shadow-2);
  padding: var(--t-space-2);
}
</style>
