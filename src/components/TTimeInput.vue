<script setup lang="ts">
import { ref, watch } from 'vue'
import TInput from './TInput.vue'
import TDropdown from './TDropdown.vue'
import TTimePicker from './TTimePicker.vue'

const props = withDefaults(
  defineProps<{
    modelValue: string | null
    step?: number
    editable?: boolean
  }>(),
  { step: 15, editable: false },
)
const emit = defineEmits<{ (e: 'update:modelValue', v: string | null): void }>()

const dropdownRef = ref<InstanceType<typeof TDropdown> | null>(null)
const isOpen = ref(false)
const isEditing = ref(false)
const localText = ref('')
const selectedHour = ref(9)
const selectedMinute = ref(0)

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      const [h, m] = val.split(':').map(Number)
      selectedHour.value = h ?? 9
      selectedMinute.value = snapMinute(m ?? 0)
    } else {
      selectedHour.value = 9
      selectedMinute.value = 0
    }
    if (!isEditing.value) localText.value = val ?? ''
  },
  { immediate: true },
)

function p(n: number) { return String(n).padStart(2, '0') }

function snapMinute(m: number): number {
  const snapped = Math.round(m / props.step) * props.step
  return snapped >= 60 ? 0 : snapped
}

function emitTime(h: number, m: number) {
  const val = `${p(h)}:${p(m)}`
  localText.value = val
  emit('update:modelValue', val)
}

function onHour(h: number) { selectedHour.value = h; emitTime(h, selectedMinute.value) }
function onMinute(m: number) { selectedMinute.value = m; emitTime(selectedHour.value, m) }

function onFocus() { isEditing.value = true; dropdownRef.value?.open() }
function onBlur() { isEditing.value = false; commitText() }

function commitText() {
  const trimmed = localText.value.trim()
  if (!trimmed) { emit('update:modelValue', null); return }
  const m = trimmed.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) { localText.value = props.modelValue ?? ''; return }
  const h = Number(m[1]), min = Number(m[2])
  if (h > 23 || min > 59) { localText.value = props.modelValue ?? ''; return }
  const snapped = snapMinute(min)
  selectedHour.value = h
  selectedMinute.value = snapped
  const val = `${p(h)}:${p(snapped)}`
  localText.value = val
  emit('update:modelValue', val)
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
      <div class="t-time-input__trigger">
        <TInput
          v-model="localText"
          placeholder="ГГ:хх"
          suffix-icon="material-symbols:schedule-outline"
          :readonly="!editable"
          @focus="onFocus"
          @blur="onBlur"
          @keyup.enter="commitText"
        />
      </div>
    </template>

    <div class="t-time-input__panel">
      <TTimePicker
        :hour="selectedHour"
        :minute="selectedMinute"
        :step="step"
        @update:hour="onHour"
        @update:minute="onMinute"
      />
    </div>
  </TDropdown>
</template>

<style scoped>
.t-time-input__trigger {
  width: 100%;
}

.t-time-input__panel {
  background: var(--t-color-bg);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-default);
  box-shadow: var(--t-shadow-2);
  padding: var(--t-space-1) var(--t-space-2);
}
</style>
