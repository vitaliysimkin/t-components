<template>
  <div class="t-date-picker">
    <!-- Header -->
    <div class="t-date-picker__header">
      <button
        type="button"
        class="t-date-picker__nav"
        aria-label="Previous"
        @click="onPrev"
      >
        <span class="t-date-picker__chev t-date-picker__chev--left" />
      </button>
      <button
        type="button"
        class="t-date-picker__title"
        @click="onTitleClick"
      >
        {{ headerTitle }}
      </button>
      <button
        type="button"
        class="t-date-picker__nav"
        aria-label="Next"
        @click="onNext"
      >
        <span class="t-date-picker__chev t-date-picker__chev--right" />
      </button>
    </div>

    <!-- Day view -->
    <div v-if="view.type === 'day'" class="t-date-picker__day-view">
      <div class="t-date-picker__weekdays">
        <div
          v-for="(wd, idx) in orderedWeekdayNames"
          :key="idx"
          class="t-date-picker__weekday"
          :class="{ 't-date-picker__weekday--weekend': isWeekendIndex(idx) }"
        >
          {{ wd }}
        </div>
      </div>
      <div class="t-date-picker__days" @mouseleave="hoverDate = null">
        <template v-for="(row, rIdx) in calendarWeeks" :key="rIdx">
          <template v-for="(cell, cIdx) in row" :key="cIdx">
            <button
              v-if="cell && (showOtherMonths || cell.inMonth)"
              type="button"
              class="t-date-picker__cell"
              :class="{
                't-date-picker__cell--other': !cell.inMonth,
                't-date-picker__cell--weekend': highlightWeekend && isWeekendIndex(cIdx),
                't-date-picker__cell--today': isSameDay(cell.date, today),
                't-date-picker__cell--selected': isDateSelected(cell.date),
                't-date-picker__cell--range': isInRange(cell.date) || isInPendingRange(cell.date),
                't-date-picker__cell--range-start': isRangeEdge(cell.date, 'start') || isPendingEdge(cell.date, 'start'),
                't-date-picker__cell--range-end': isRangeEdge(cell.date, 'end') || isPendingEdge(cell.date, 'end'),
                't-date-picker__cell--pending': isHoverPending(cell.date),
              }"
              @click="onDayClick(cell.date)"
              @mouseenter="hoverDate = cell.date"
            >
              {{ cell.date.getDate() }}
            </button>
            <span v-else class="t-date-picker__cell t-date-picker__cell--empty" />
          </template>
        </template>
      </div>
    </div>

    <!-- Month view -->
    <div v-else-if="view.type === 'month'" class="t-date-picker__grid t-date-picker__grid--months">
      <button
        v-for="(mName, mIdx) in resolvedMonthNames"
        :key="mIdx"
        type="button"
        class="t-date-picker__grid-cell"
        :class="{
          't-date-picker__grid-cell--current': mIdx === currentRealMonth && view.year === currentRealYear,
          't-date-picker__grid-cell--selected': isMonthSelected(mIdx, view.year),
        }"
        @click="onMonthClick(mIdx)"
      >
        {{ mName }}
      </button>
    </div>

    <!-- Year view -->
    <div v-else class="t-date-picker__grid t-date-picker__grid--years">
      <button
        v-for="y in yearGrid"
        :key="y"
        type="button"
        class="t-date-picker__grid-cell"
        :class="{
          't-date-picker__grid-cell--other': y < decadeStart || y > decadeStart + 9,
          't-date-picker__grid-cell--current': y === currentRealYear,
          't-date-picker__grid-cell--selected': isYearSelected(y),
        }"
        @click="onYearClick(y)"
      >
        {{ y }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

export type TDatePickerMode = 'single' | 'range';
export type TDatePickerViewType = 'day' | 'month' | 'year';

export interface TDatePickerRangeValue {
  start: Date | null;
  end: Date | null;
}

export interface TDatePickerView {
  type: TDatePickerViewType;
  month: number;
  year: number;
}

export type TDatePickerModelValue = Date | TDatePickerRangeValue | null;

export interface TDatePickerProps {
  modelValue: TDatePickerModelValue;
  mode?: TDatePickerMode;
  weekdayNames?: string[];
  monthNames?: string[];
}

export interface TDatePickerEmits {
  (e: 'update:modelValue', value: TDatePickerModelValue): void;
}

const props = withDefaults(defineProps<TDatePickerProps>(), {
  mode: 'single',
});

const emit = defineEmits<TDatePickerEmits>();

// Hardcoded, matches previous behavior.
const firstWeekday: 'sunday' | 'monday' = 'monday';
const showOtherMonths = true;
const highlightWeekend = true;

// ---------------------------------------------------------------------------
// Locale names with Intl fallback.
// weekdayNames is provided starting from Sunday (index 0), as in the previous
// implementation. We reorder internally when firstWeekday === 'monday'.
// ---------------------------------------------------------------------------
const resolvedWeekdayNamesSunFirst = computed(() => {
  if (props.weekdayNames) return props.weekdayNames;
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
  // Jan 1, 2023 is a Sunday.
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)));
});

const resolvedMonthNames = computed(() => {
  if (props.monthNames) return props.monthNames;
  const fmt = new Intl.DateTimeFormat(undefined, { month: 'short' });
  return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2023, i, 1)));
});

const orderedWeekdayNames = computed(() => {
  const names = resolvedWeekdayNamesSunFirst.value;
  if (firstWeekday === 'monday') {
    return [names[1], names[2], names[3], names[4], names[5], names[6], names[0]];
  }
  return names;
});

// Given a column index in the display, is it weekend?
// firstWeekday=monday -> Mon,Tue,Wed,Thu,Fri,Sat,Sun -> weekend at 5,6
// firstWeekday=sunday -> Sun..Sat -> weekend at 0,6
const isWeekendIndex = (idx: number) => {
  if (firstWeekday === 'monday') return idx === 5 || idx === 6;
  return idx === 0 || idx === 6;
};

// ---------------------------------------------------------------------------
// Type-narrowing helpers. `modelValue` is a union of `Date`, range object and
// `null`; internal code branches on `props.mode` + `instanceof Date`.
// ---------------------------------------------------------------------------
function asRange(v: TDatePickerModelValue): TDatePickerRangeValue | null {
  if (v && !(v instanceof Date)) return v;
  return null;
}

function asDate(v: TDatePickerModelValue): Date | null {
  if (v instanceof Date) return v;
  return null;
}

// ---------------------------------------------------------------------------
// View state.
// ---------------------------------------------------------------------------
function initialDateForView(): Date {
  const v = props.modelValue;
  if (!v) return new Date();
  if (props.mode === 'range') {
    const r = asRange(v);
    if (r && r.start instanceof Date) return r.start;
  }
  const d = asDate(v);
  if (d) return d;
  return new Date();
}

const initial = initialDateForView();
const view = ref<TDatePickerView>({
  type: 'day',
  month: initial.getMonth(),
  year: initial.getFullYear(),
});

// Sync view to external model change.
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) return;
    let d: Date | null = null;
    if (props.mode === 'range') {
      const r = asRange(newValue);
      if (r && r.start instanceof Date) d = r.start;
    } else {
      d = asDate(newValue);
    }
    if (d) {
      view.value = { type: 'day', month: d.getMonth(), year: d.getFullYear() };
    }
  },
);

// ---------------------------------------------------------------------------
// Day view calendar grid: 6 rows × 7 cols.
// ---------------------------------------------------------------------------
interface DayCell {
  date: Date;
  inMonth: boolean;
}

const calendarWeeks = computed<DayCell[][]>(() => {
  const year = view.value.year;
  const month = view.value.month;
  const firstOfMonth = new Date(year, month, 1);
  const firstDow = firstOfMonth.getDay(); // 0..6 (Sun..Sat)
  const mondayOffset = firstWeekday === 'monday' ? (firstDow + 6) % 7 : firstDow;
  const gridStart = new Date(year, month, 1 - mondayOffset);

  const weeks: DayCell[][] = [];
  for (let r = 0; r < 6; r++) {
    const row: DayCell[] = [];
    for (let c = 0; c < 7; c++) {
      const d = new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + r * 7 + c,
      );
      row.push({ date: d, inMonth: d.getMonth() === month });
    }
    weeks.push(row);
  }
  return weeks;
});

const headerTitle = computed(() => {
  if (view.value.type === 'day') {
    return `${view.value.year} ${resolvedMonthNames.value[view.value.month]}`;
  }
  if (view.value.type === 'month') {
    return String(view.value.year);
  }
  return `${decadeStart.value} - ${decadeStart.value + 9}`;
});

// ---------------------------------------------------------------------------
// Selection helpers.
// ---------------------------------------------------------------------------
const today = new Date();
const currentRealMonth = today.getMonth();
const currentRealYear = today.getFullYear();

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function isDateSelected(date: Date): boolean {
  const v = props.modelValue;
  if (!v) return false;
  if (props.mode === 'range') {
    const r = asRange(v);
    if (!r) return false;
    if (!r.start || !r.end) {
      return r.start ? isSameDay(r.start, date) : false;
    }
    return isSameDay(r.start, date) || isSameDay(r.end, date);
  }
  const d = asDate(v);
  if (d) return isSameDay(d, date);
  return false;
}

function isInRange(date: Date): boolean {
  if (props.mode !== 'range') return false;
  const r = asRange(props.modelValue);
  if (!r || !r.start || !r.end) return false;
  const t = startOfDay(date);
  return t > startOfDay(r.start) && t < startOfDay(r.end);
}

function isRangeEdge(date: Date, edge: 'start' | 'end'): boolean {
  if (props.mode !== 'range') return false;
  const r = asRange(props.modelValue);
  if (!r) return false;
  const d = r[edge];
  if (!d) return false;
  return isSameDay(d, date);
}

function isMonthSelected(mIdx: number, y: number): boolean {
  const v = props.modelValue;
  if (!v) return false;
  const d = props.mode === 'range' ? asRange(v)?.start ?? null : asDate(v);
  if (!(d instanceof Date)) return false;
  return d.getMonth() === mIdx && d.getFullYear() === y;
}

function isYearSelected(y: number): boolean {
  const v = props.modelValue;
  if (!v) return false;
  const d = props.mode === 'range' ? asRange(v)?.start ?? null : asDate(v);
  if (!(d instanceof Date)) return false;
  return d.getFullYear() === y;
}

// ---------------------------------------------------------------------------
// Range pending state (for two-click range selection) and hover preview.
// ---------------------------------------------------------------------------
const rangePending = ref<Date | null>(null);
const hoverDate = ref<Date | null>(null);

function isInPendingRange(date: Date): boolean {
  if (props.mode !== 'range') return false;
  if (!rangePending.value || !hoverDate.value) return false;
  const a = startOfDay(rangePending.value);
  const b = startOfDay(hoverDate.value);
  const t = startOfDay(date);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return t > lo && t < hi;
}

function isHoverPending(date: Date): boolean {
  if (props.mode !== 'range') return false;
  if (!rangePending.value || !hoverDate.value) return false;
  return isSameDay(hoverDate.value, date) && !isSameDay(rangePending.value, date);
}

function isPendingEdge(date: Date, edge: 'start' | 'end'): boolean {
  if (props.mode !== 'range') return false;
  if (!rangePending.value || !hoverDate.value) return false;
  const a = startOfDay(rangePending.value);
  const b = startOfDay(hoverDate.value);
  if (a === b) return edge === 'start' && isSameDay(rangePending.value, date);
  const startDate = a < b ? rangePending.value : hoverDate.value;
  const endDate = a < b ? hoverDate.value : rangePending.value;
  return edge === 'start' ? isSameDay(startDate, date) : isSameDay(endDate, date);
}

// ---------------------------------------------------------------------------
// Click handlers.
// ---------------------------------------------------------------------------
function onDayClick(date: Date) {
  if (date.getMonth() !== view.value.month || date.getFullYear() !== view.value.year) {
    view.value = { type: 'day', month: date.getMonth(), year: date.getFullYear() };
  }

  if (props.mode === 'single') {
    emit('update:modelValue', date);
    return;
  }

  const r = asRange(props.modelValue);
  const hasCompleteRange = !!(r && r.start instanceof Date && r.end instanceof Date);

  if (!rangePending.value || hasCompleteRange) {
    rangePending.value = date;
    emit('update:modelValue', { start: date, end: null });
    return;
  }

  let start = rangePending.value;
  let end = date;
  if (startOfDay(end) < startOfDay(start)) {
    [start, end] = [end, start];
  }
  rangePending.value = null;
  emit('update:modelValue', { start, end });
}

function onTitleClick() {
  if (view.value.type === 'day') {
    view.value = { ...view.value, type: 'month' };
  } else if (view.value.type === 'month') {
    view.value = { ...view.value, type: 'year' };
  }
}

function onMonthClick(mIdx: number) {
  view.value = { type: 'day', month: mIdx, year: view.value.year };
}

function onYearClick(y: number) {
  view.value = { type: 'month', month: view.value.month, year: y };
}

function onPrev() {
  if (view.value.type === 'day') {
    const m = view.value.month - 1;
    if (m < 0) {
      view.value = { ...view.value, month: 11, year: view.value.year - 1 };
    } else {
      view.value = { ...view.value, month: m };
    }
  } else if (view.value.type === 'month') {
    view.value = { ...view.value, year: view.value.year - 1 };
  } else {
    view.value = { ...view.value, year: view.value.year - 10 };
  }
}

function onNext() {
  if (view.value.type === 'day') {
    const m = view.value.month + 1;
    if (m > 11) {
      view.value = { ...view.value, month: 0, year: view.value.year + 1 };
    } else {
      view.value = { ...view.value, month: m };
    }
  } else if (view.value.type === 'month') {
    view.value = { ...view.value, year: view.value.year + 1 };
  } else {
    view.value = { ...view.value, year: view.value.year + 10 };
  }
}

// ---------------------------------------------------------------------------
// Year view decade grid (12 cells: 1 from prev decade, 10 current, 1 next).
// ---------------------------------------------------------------------------
const decadeStart = computed(() => Math.floor(view.value.year / 10) * 10);
const yearGrid = computed(() => {
  const s = decadeStart.value;
  return Array.from({ length: 12 }, (_, i) => s - 1 + i);
});
</script>

<style scoped>
.t-date-picker {
  --t-date-picker-cell-size: var(--t-control-h-medium);
  --t-date-picker-cell-gap: 2px;

  display: inline-flex;
  flex-direction: column;
  gap: var(--t-space-2);
  width: calc(7 * var(--t-date-picker-cell-size) + 6 * var(--t-date-picker-cell-gap));
  font-family: var(--t-font-ui);
  font-size: var(--t-font-size-default);
  color: var(--t-color-text);
  user-select: none;
}

.t-date-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--t-space-1);
}

.t-date-picker__nav {
  appearance: none;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--t-color-text);
  width: var(--t-date-picker-cell-size);
  height: var(--t-date-picker-cell-size);
  border-radius: var(--t-radius-default);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.t-date-picker__nav:hover {
  background: color-mix(in srgb, var(--t-color-text) 8%, transparent);
}

.t-date-picker__chev {
  display: inline-block;
  width: var(--t-space-2);
  height: var(--t-space-2);
  border-top: 2px solid currentColor;
  border-right: 2px solid currentColor;
}

.t-date-picker__chev--left {
  transform: rotate(-135deg);
  margin-left: 2px;
}

.t-date-picker__chev--right {
  transform: rotate(45deg);
  margin-right: 2px;
}

.t-date-picker__title {
  appearance: none;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--t-color-text);
  font: inherit;
  font-weight: 600;
  padding: 0 var(--t-space-2);
  height: var(--t-date-picker-cell-size);
  border-radius: var(--t-radius-default);
  flex: 1;
}

.t-date-picker__title:hover {
  background: color-mix(in srgb, var(--t-color-text) 8%, transparent);
}

.t-date-picker__weekdays,
.t-date-picker__days {
  display: grid;
  grid-template-columns: repeat(7, var(--t-date-picker-cell-size));
  gap: var(--t-date-picker-cell-gap);
}

.t-date-picker__weekday {
  height: var(--t-date-picker-cell-size);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--t-font-size-mini);
  color: var(--t-color-text-muted);
}

.t-date-picker__weekday--weekend {
  color: var(--t-color-danger);
}

.t-date-picker__cell {
  appearance: none;
  background: transparent;
  border: 1px solid transparent;
  color: var(--t-color-text);
  font: inherit;
  font-size: var(--t-font-size-small);
  width: var(--t-date-picker-cell-size);
  height: var(--t-date-picker-cell-size);
  border-radius: var(--t-radius-default);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.t-date-picker__cell--empty {
  cursor: default;
}

.t-date-picker__cell:hover:not(.t-date-picker__cell--empty):not(.t-date-picker__cell--selected):not(.t-date-picker__cell--range-start):not(.t-date-picker__cell--range-end) {
  background: color-mix(in srgb, var(--t-color-text) 10%, transparent);
}

.t-date-picker__cell--other {
  color: var(--t-color-text-muted);
}

.t-date-picker__cell--weekend {
  color: var(--t-color-danger);
}

.t-date-picker__cell--today {
  border-color: var(--t-color-accent);
}

.t-date-picker__cell--range {
  background: color-mix(in srgb, var(--t-color-accent) 20%, transparent);
  border-radius: 0;
}

.t-date-picker__cell--selected,
.t-date-picker__cell--range-start,
.t-date-picker__cell--range-end {
  background: var(--t-color-accent);
  color: var(--t-color-accent-contrast);
  border-color: var(--t-color-accent);
}

.t-date-picker__cell--pending {
  background: color-mix(in srgb, var(--t-color-accent) 45%, transparent);
  color: var(--t-color-text);
  border-color: transparent;
}

.t-date-picker__grid {
  display: grid;
  gap: var(--t-date-picker-cell-gap);
  /* Match day-view total height: 7 cells + 6 gaps (6 day rows + 1 weekday row). */
  min-height: calc(7 * var(--t-date-picker-cell-size) + 6 * var(--t-date-picker-cell-gap));
}

.t-date-picker__grid--months,
.t-date-picker__grid--years {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
}

.t-date-picker__grid-cell {
  appearance: none;
  background: transparent;
  border: 1px solid transparent;
  color: var(--t-color-text);
  font: inherit;
  cursor: pointer;
  padding: 0 var(--t-space-2);
  border-radius: var(--t-radius-default);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.t-date-picker__grid-cell:hover:not(.t-date-picker__grid-cell--selected) {
  background: color-mix(in srgb, var(--t-color-text) 10%, transparent);
}

.t-date-picker__grid-cell--other {
  color: var(--t-color-text-muted);
}

.t-date-picker__grid-cell--current {
  border-color: var(--t-color-accent);
}

.t-date-picker__grid-cell--selected {
  background: var(--t-color-accent);
  color: var(--t-color-accent-contrast);
  border-color: var(--t-color-accent);
}
</style>
