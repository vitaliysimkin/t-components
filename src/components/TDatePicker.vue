<template>
  <va-date-picker
    v-model="internalValue"
    :mode="mode"
    first-weekday="monday"
    :view="datePickerView"
    @update:view="datePickerView = $event"
    show-other-months
    highlightWeekend
    :month-names="resolvedMonthNames"
    :weekday-names="resolvedWeekdayNames"
    @update:model-value="onDateChange"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { DatePickerView } from 'vuestic-ui/dist/types/components/va-date-picker/types.js';

export interface TDatePickerProps {
  modelValue: any;
  mode?: 'range' | 'single';
  weekdayNames?: string[];
  monthNames?: string[];
}

export interface TDatePickerEmits {
  (e: 'update:modelValue', value: any): void;
}

const props = withDefaults(defineProps<TDatePickerProps>(), {
  mode: 'single'
});

const emit = defineEmits<TDatePickerEmits>();

// Fallback to Intl API (respects browser locale) when no props provided
const resolvedWeekdayNames = computed(() => {
  if (props.weekdayNames) return props.weekdayNames;
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
  // Jan 1, 2023 is a Sunday — generate 7 days starting from Sunday
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)));
});

const resolvedMonthNames = computed(() => {
  if (props.monthNames) return props.monthNames;
  const fmt = new Intl.DateTimeFormat(undefined, { month: 'short' });
  return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2023, i, 1)));
});

const datePickerView = ref<DatePickerView>({
  type: "day",
  month: new Date().getMonth(),
  year: new Date().getFullYear()
});

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    let dateToSync: Date | null = null;

    if (props.mode === 'range' && newValue.start) {
      dateToSync = newValue.start;
    } else if (props.mode === 'single' && newValue) {
      dateToSync = newValue;
    }

    if (dateToSync) {
      datePickerView.value = {
        type: "day",
        month: dateToSync.getMonth(),
        year: dateToSync.getFullYear()
      };
    }
  }
}, { immediate: true });

const internalValue = computed({
  get: () => props.modelValue,
  set: (value: any) => {
    emit('update:modelValue', value);
  }
});

const onDateChange = (value: any) => {
  emit('update:modelValue', value);
};
</script>
