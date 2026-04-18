<script setup lang="ts">
/**
 * TTimePicker — headless time columns (hours + minutes).
 * Used inside TTimeInput and TDateTimeInput dropdowns.
 * Mounts/unmounts with the dropdown panel (v-if), so onMounted scrolls to
 * the current selection automatically each time the picker opens.
 */
import { ref, computed, onMounted, nextTick, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    hour: number
    minute: number
    step?: number
  }>(),
  { step: 15 },
)

const emit = defineEmits<{
  (e: 'update:hour', v: number): void
  (e: 'update:minute', v: number): void
}>()

const hoursRef = ref<HTMLElement | null>(null)
const minutesRef = ref<HTMLElement | null>(null)

const ITEM_H = 36
const VISIBLE = 5

const minuteOptions = computed<number[]>(() => {
  const opts: number[] = []
  for (let m = 0; m < 60; m += props.step) opts.push(m)
  return opts
})

function p(n: number) {
  return String(n).padStart(2, '0')
}

function scrollHours(h: number) {
  if (!hoursRef.value) return
  hoursRef.value.scrollTop = h * ITEM_H - ITEM_H * Math.floor(VISIBLE / 2)
}

function scrollMinutes(m: number) {
  if (!minutesRef.value) return
  const idx = minuteOptions.value.indexOf(m)
  if (idx >= 0) minutesRef.value.scrollTop = idx * ITEM_H - ITEM_H * Math.floor(VISIBLE / 2)
}

// Scroll to current selection when picker opens (panel mounts via v-if)
onMounted(() => nextTick(() => {
  scrollHours(props.hour)
  scrollMinutes(props.minute)
}))

watch(() => props.hour, (h) => nextTick(() => scrollHours(h)))
watch(() => props.minute, (m) => nextTick(() => scrollMinutes(m)))

function selectHour(h: number) {
  emit('update:hour', h)
}

function selectMinute(m: number) {
  emit('update:minute', m)
}
</script>

<template>
  <div class="t-time-picker">
    <div
      ref="hoursRef"
      class="t-time-col"
    >
      <div
        v-for="h in 24"
        :key="h - 1"
        class="t-time-item"
        :class="{ 'is-selected': h - 1 === hour }"
        @click="selectHour(h - 1)"
      >
        {{ p(h - 1) }}
      </div>
    </div>

    <div class="t-time-sep">
      :
    </div>

    <div
      ref="minutesRef"
      class="t-time-col"
    >
      <div
        v-for="m in minuteOptions"
        :key="m"
        class="t-time-item"
        :class="{ 'is-selected': m === minute }"
        @click="selectMinute(m)"
      >
        {{ p(m) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.t-time-picker {
  display: flex;
  align-items: stretch;
  gap: var(--t-space-1);
  padding: var(--t-space-1) 0;
}

.t-time-col {
  width: 2.5rem;
  height: 180px; /* 5 × 36px */
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
}

.t-time-col::-webkit-scrollbar {
  display: none;
}

.t-time-sep {
  display: flex;
  align-items: center;
  font-size: var(--t-font-size-default);
  font-weight: 600;
  color: var(--t-color-text-muted);
  user-select: none;
  padding: 0 2px;
}

.t-time-item {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: var(--t-font-size-default);
  font-weight: 500;
  color: var(--t-color-text-muted);
  border-radius: var(--t-radius-small);
  transition: background 0.12s, color 0.12s;
  user-select: none;
}

.t-time-item:hover {
  background: var(--t-color-surface);
  color: var(--t-color-text);
}

.t-time-item.is-selected {
  background: var(--t-color-accent);
  color: var(--t-color-accent-contrast);
  font-weight: 600;
}
</style>
