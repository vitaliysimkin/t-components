<script setup lang="ts">
import { ref, watch } from 'vue'
import TInput from './TInput.vue'
import TButton from './TButton.vue'
import TDropdown from './TDropdown.vue'
import TTimePicker from './TTimePicker.vue'
import TDatePicker from './TDatePicker.vue'
import { isRealDate } from './date-utils'

export interface TDateTimeInputProps {
  modelValue: string | null
  step?: number
  editable?: boolean
  placeholder?: string
  doneLabel?: string
}

const props = withDefaults(defineProps<TDateTimeInputProps>(), {
  step: 15,
  editable: false,
  placeholder: 'ДД.ММ.РРРР ГГ:хх',
  doneLabel: 'Готово',
})
const emit = defineEmits<{ (e: 'update:modelValue', v: string | null): void }>()

const dropdownRef = ref<InstanceType<typeof TDropdown> | null>(null)
const isOpen = ref(false)
const isEditing = ref(false)
const localText = ref('')
const pickedDate = ref<Date | null>(null)
const pickedHour = ref(0)
const pickedMinute = ref(0)

watch(
  () => props.modelValue,
  (iso) => {
    if (iso) {
      const d = new Date(iso)
      pickedDate.value = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      pickedHour.value = d.getHours()
      pickedMinute.value = snapMinute(d.getMinutes())
    } else {
      pickedDate.value = null
      pickedHour.value = 9
      pickedMinute.value = 0
    }
    if (!isEditing.value) localText.value = buildDisplay()
  },
  { immediate: true },
)

watch(isOpen, (open) => {
  if (!open) commitText()
})

function p(n: number) { return String(n).padStart(2, '0') }

function snapMinute(m: number): number {
  const snapped = Math.round(m / props.step) * props.step
  return snapped >= 60 ? 0 : snapped
}

function buildDisplay(): string {
  if (!pickedDate.value) return ''
  const d = pickedDate.value
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(pickedHour.value)}:${p(pickedMinute.value)}`
}

function emitCurrent() {
  if (!pickedDate.value) return
  const d = pickedDate.value
  emit(
    'update:modelValue',
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), pickedHour.value, pickedMinute.value).toISOString(),
  )
}

function onDateSelect(date: Date | null) {
  if (!date) return
  pickedDate.value = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  localText.value = buildDisplay()
  emitCurrent()
}

function onHour(h: number) {
  pickedHour.value = h
  localText.value = buildDisplay()
  emitCurrent()
}

function onMinute(m: number) {
  pickedMinute.value = m
  localText.value = buildDisplay()
  emitCurrent()
}

function confirm() {
  emitCurrent()
  dropdownRef.value?.close()
}

function initDate() {
  if (!pickedDate.value) {
    const now = new Date()
    pickedDate.value = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    localText.value = buildDisplay()
  }
}

function onTriggerClick() {
  if (props.editable) return
  if (isOpen.value) {
    dropdownRef.value?.close()
  } else {
    initDate()
    dropdownRef.value?.open()
  }
}

function onFocus() {
  if (!props.editable) return
  isEditing.value = true
  initDate()
  dropdownRef.value?.open()
}

function onBlur() {
  if (!props.editable) return
  isEditing.value = false
  if (!isOpen.value) commitText()
}

function commitText() {
  const trimmed = localText.value.trim()
  if (!trimmed) { pickedDate.value = null; emit('update:modelValue', null); return }
  const m = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/)
  if (!m) { localText.value = buildDisplay(); return }
  const d = Number(m[1]), mo = Number(m[2]), y = Number(m[3])
  const h = Number(m[4] ?? 0), min = Number(m[5] ?? 0)
  if (!isRealDate(y, mo, d) || h > 23 || min > 59) {
    localText.value = buildDisplay()
    return
  }
  pickedDate.value = new Date(y, mo - 1, d)
  pickedHour.value = h
  pickedMinute.value = snapMinute(min)
  localText.value = buildDisplay()
  emitCurrent()
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
        class="t-datetime-input__trigger"
        @click="onTriggerClick"
      >
        <TInput
          v-model="localText"
          :placeholder="placeholder"
          suffix-icon="material-symbols:calendar-clock-outline"
          :readonly="!editable"
          @focus="onFocus"
          @blur="onBlur"
          @keyup.enter="commitText"
        />
      </div>
    </template>

    <div class="t-datetime-panel">
      <div class="t-datetime-panel__body">
        <TDatePicker
          :model-value="pickedDate"
          @update:model-value="onDateSelect"
        />
        <TTimePicker
          :hour="pickedHour"
          :minute="pickedMinute"
          :step="step"
          @update:hour="onHour"
          @update:minute="onMinute"
        />
      </div>
      <div class="t-datetime-panel__footer">
        <TButton
          size="small"
          @click="confirm"
        >
          {{ doneLabel }}
        </TButton>
      </div>
    </div>
  </TDropdown>
</template>

<style scoped>
.t-datetime-input__trigger {
  width: 100%;
}

.t-datetime-panel {
  background: var(--t-color-bg);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-default);
  box-shadow: var(--t-shadow-2);
  padding: var(--t-space-2);
  display: flex;
  flex-direction: column;
  gap: var(--t-space-2);
  max-width: calc(100vw - 16px);
}

.t-datetime-panel__body {
  display: flex;
  gap: var(--t-space-2);
  align-items: flex-start;
}

.t-datetime-panel__footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--t-color-border);
  padding-top: var(--t-space-2);
}

/* Compact date picker cells */
.t-datetime-panel__body :deep(.t-date-picker) {
  --t-date-picker-cell-size: 28px;
  --t-date-picker-cell-gap: 1px;
}

/* Compact time columns */
.t-datetime-panel__body :deep(.t-time-col) {
  width: 2rem;
}

.t-datetime-panel__body :deep(.t-time-item) {
  height: 28px;
}
</style>
