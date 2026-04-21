<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { TElementSize } from './types'

export type TTableSortDirection = 'asc' | 'desc'

export interface TTableSort {
  key: string
  direction: TTableSortDirection
}

export interface TTableColumn<Row = Record<string, unknown>> {
  key: string
  label: string
  width?: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  /**
   * Optional accessor — returns the value used for client-side sort and as the
   * default rendered text. Defaults to `row[column.key]`.
   */
  accessor?: (row: Row) => unknown
}

// Primitive value usable as a row key (string | number).
type TTablePrimaryKey = string | number

const props = withDefaults(
  defineProps<{
    columns: TTableColumn<T>[]
    rows: T[]
    rowKey: string
    loading?: boolean
    selectable?: boolean
    sort?: TTableSort | null
    selection?: TTablePrimaryKey[]
    size?: TElementSize
    clientSideSort?: boolean
  }>(),
  {
    loading: false,
    selectable: false,
    sort: null,
    selection: () => [],
    size: 'default',
    clientSideSort: false,
  }
)

const emit = defineEmits<{
  (e: 'update:sort', value: TTableSort | null): void
  (e: 'update:selection', value: TTablePrimaryKey[]): void
  (e: 'row-click', row: T, index: number): void
}>()

defineSlots<{
  empty?: () => unknown
  loading?: () => unknown
  [slot: `cell-${string}`]: ((scope: { row: T; value: unknown; index: number }) => unknown) | undefined
  [header: `header-${string}`]: ((scope: { column: TTableColumn<T> }) => unknown) | undefined
}>()

// --- Selection internal state (Set for cheap toggle + watch sync) ---
const selectionSet = ref<Set<TTablePrimaryKey>>(new Set(props.selection))

watch(
  () => props.selection,
  (next) => {
    const incoming = new Set(next)
    // Avoid pointless updates when identical.
    if (incoming.size === selectionSet.value.size) {
      let same = true
      for (const k of incoming) {
        if (!selectionSet.value.has(k)) { same = false; break }
      }
      if (same) return
    }
    selectionSet.value = incoming
  },
  { deep: true }
)

function getRowKey(row: T): TTablePrimaryKey {
  const v = (row as Record<string, unknown>)[props.rowKey]
  return v as TTablePrimaryKey
}

function getCellValue(row: T, column: TTableColumn<T>): unknown {
  if (column.accessor) return column.accessor(row)
  return (row as Record<string, unknown>)[column.key]
}

// --- Sorting ---
function onHeaderClick(column: TTableColumn<T>) {
  if (!column.sortable) return
  const current = props.sort
  let next: TTableSort | null
  if (!current || current.key !== column.key) {
    next = { key: column.key, direction: 'asc' }
  } else if (current.direction === 'asc') {
    next = { key: column.key, direction: 'desc' }
  } else {
    next = null
  }
  emit('update:sort', next)
}

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0
  if (a == null) return -1
  if (b == null) return 1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  return String(a).localeCompare(String(b))
}

const displayRows = computed<T[]>(() => {
  if (!props.clientSideSort || !props.sort) return props.rows
  const sort = props.sort
  const column = props.columns.find((c) => c.key === sort.key)
  if (!column) return props.rows
  const copy = props.rows.slice()
  const dir = sort.direction === 'desc' ? -1 : 1
  copy.sort((a, b) => dir * compareValues(getCellValue(a, column), getCellValue(b, column)))
  return copy
})

// --- Selection helpers ---
const allSelected = computed(() => {
  if (props.rows.length === 0) return false
  for (const row of props.rows) {
    if (!selectionSet.value.has(getRowKey(row))) return false
  }
  return true
})

const someSelected = computed(() => {
  if (allSelected.value) return false
  for (const row of props.rows) {
    if (selectionSet.value.has(getRowKey(row))) return true
  }
  return false
})

function emitSelection() {
  emit('update:selection', Array.from(selectionSet.value))
}

function toggleRow(row: T, checked: boolean) {
  const key = getRowKey(row)
  const next = new Set(selectionSet.value)
  if (checked) next.add(key)
  else next.delete(key)
  selectionSet.value = next
  emitSelection()
}

function toggleAll(checked: boolean) {
  const next = new Set(selectionSet.value)
  if (checked) {
    for (const row of props.rows) next.add(getRowKey(row))
  } else {
    for (const row of props.rows) next.delete(getRowKey(row))
  }
  selectionSet.value = next
  emitSelection()
}

function isRowSelected(row: T): boolean {
  return selectionSet.value.has(getRowKey(row))
}

function onRowClick(row: T, index: number) {
  emit('row-click', row, index)
}

// --- A11y helpers ---
function ariaSort(column: TTableColumn<T>): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.sortable) return undefined
  if (props.sort?.key !== column.key) return 'none'
  return props.sort.direction === 'asc' ? 'ascending' : 'descending'
}

function sortIcon(column: TTableColumn<T>): string {
  if (props.sort?.key !== column.key) return 'material-symbols-light:unfold-more'
  return props.sort.direction === 'asc'
    ? 'material-symbols-light:arrow-upward'
    : 'material-symbols-light:arrow-downward'
}

// Indeterminate binding for master checkbox requires a ref.
const masterCheckboxRef = ref<HTMLInputElement | null>(null)
watch(
  [someSelected, masterCheckboxRef],
  ([some, el]) => {
    if (el) el.indeterminate = some
  },
  { immediate: true }
)

const isEmpty = computed(() => !props.loading && props.rows.length === 0)
</script>

<template>
  <div
    class="t-table"
    :class="[`size-${props.size}`]"
  >
    <div class="t-table__scroll">
      <table
        class="t-table__el"
        role="table"
      >
        <colgroup>
          <col
            v-if="props.selectable"
            class="t-table__col--select"
          >
          <col
            v-for="column in props.columns"
            :key="column.key"
            :style="column.width ? { width: column.width } : undefined"
          >
        </colgroup>
        <thead>
          <tr>
            <th
              v-if="props.selectable"
              class="t-table__th t-table__th--select"
              scope="col"
            >
              <input
                ref="masterCheckboxRef"
                type="checkbox"
                class="t-table__checkbox"
                :checked="allSelected"
                :aria-label="allSelected ? 'Deselect all rows' : 'Select all rows'"
                @change="toggleAll(($event.target as HTMLInputElement).checked)"
              >
            </th>
            <th
              v-for="column in props.columns"
              :key="column.key"
              role="columnheader"
              scope="col"
              class="t-table__th"
              :class="[
                `align-${column.align || 'left'}`,
                { 'is-sortable': column.sortable }
              ]"
              :aria-sort="ariaSort(column)"
              @click="onHeaderClick(column)"
            >
              <slot
                :name="`header-${column.key}`"
                :column="column"
              >
                <span class="t-table__th-content">
                  <span class="t-table__th-label">{{ column.label }}</span>
                  <Icon
                    v-if="column.sortable"
                    :icon="sortIcon(column)"
                    class="t-table__sort-icon"
                    :class="{ 'is-active': props.sort?.key === column.key }"
                    aria-hidden="true"
                  />
                </span>
              </slot>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="props.loading">
            <tr class="t-table__state-row">
              <td
                :colspan="props.columns.length + (props.selectable ? 1 : 0)"
                class="t-table__state-cell"
              >
                <slot name="loading">
                  <span class="t-table__state-text">Loading…</span>
                </slot>
              </td>
            </tr>
          </template>
          <template v-else-if="isEmpty">
            <tr class="t-table__state-row">
              <td
                :colspan="props.columns.length + (props.selectable ? 1 : 0)"
                class="t-table__state-cell"
              >
                <slot name="empty">
                  <span class="t-table__state-text">No data</span>
                </slot>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr
              v-for="(row, index) in displayRows"
              :key="getRowKey(row)"
              class="t-table__tr"
              :class="{ 'is-selected': isRowSelected(row) }"
              @click="onRowClick(row, index)"
            >
              <td
                v-if="props.selectable"
                class="t-table__td t-table__td--select"
                @click.stop
              >
                <input
                  type="checkbox"
                  class="t-table__checkbox"
                  :checked="isRowSelected(row)"
                  :aria-label="`Select row ${index + 1}`"
                  @change="toggleRow(row, ($event.target as HTMLInputElement).checked)"
                >
              </td>
              <td
                v-for="column in props.columns"
                :key="column.key"
                class="t-table__td"
                :class="[`align-${column.align || 'left'}`]"
              >
                <slot
                  :name="`cell-${column.key}`"
                  :row="row"
                  :value="getCellValue(row, column)"
                  :index="index"
                >
                  {{ getCellValue(row, column) ?? '' }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.t-table {
  width: 100%;
  color: var(--t-color-text);
  font-family: var(--t-font-ui);
  font-size: var(--t-font-size-default);
  background: var(--t-color-surface);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-medium);
  overflow: hidden;
}

.t-table.size-mini { font-size: var(--t-font-size-mini); --t-table-row-h: var(--t-control-h-mini); }
.t-table.size-small { font-size: var(--t-font-size-small); --t-table-row-h: var(--t-control-h-small); }
.t-table.size-default { --t-table-row-h: var(--t-control-h-default); }
.t-table.size-medium { font-size: var(--t-font-size-medium); --t-table-row-h: var(--t-control-h-medium); }
.t-table.size-large { font-size: var(--t-font-size-large); --t-table-row-h: var(--t-control-h-large); }

.t-table__scroll {
  width: 100%;
  overflow-x: auto;
}

.t-table__el {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

.t-table__th,
.t-table__td {
  padding: 0 var(--t-space-3);
  text-align: left;
  vertical-align: middle;
  box-sizing: border-box;
}

.t-table__th {
  height: var(--t-table-row-h);
  background: var(--t-color-surface-2);
  color: var(--t-color-text);
  font-weight: 600;
  border-bottom: 1px solid var(--t-color-border);
  user-select: none;
  white-space: nowrap;
}

.t-table__th.is-sortable {
  cursor: pointer;
}

.t-table__th.is-sortable:hover {
  background: color-mix(in srgb, var(--t-color-text) 6%, var(--t-color-surface-2));
}

.t-table__th.align-left,
.t-table__td.align-left { text-align: left; }
.t-table__th.align-center,
.t-table__td.align-center { text-align: center; }
.t-table__th.align-right,
.t-table__td.align-right { text-align: right; }

.t-table__th-content {
  display: inline-flex;
  align-items: center;
  gap: var(--t-space-1);
}

.t-table__sort-icon {
  font-size: 1em;
  opacity: 0.5;
  transition: opacity 120ms ease;
}
.t-table__sort-icon.is-active { opacity: 1; }

.t-table__td {
  height: var(--t-table-row-h);
  border-bottom: 1px solid var(--t-color-border);
}

.t-table__tr:last-child .t-table__td {
  border-bottom: none;
}

.t-table__tr {
  transition: background-color 120ms ease;
}

.t-table__tr:hover {
  background: color-mix(in srgb, var(--t-color-text) 4%, transparent);
}

.t-table__tr.is-selected {
  background: color-mix(in srgb, var(--t-color-accent) 10%, transparent);
}

.t-table__th--select,
.t-table__td--select {
  width: 2.25rem;
  padding: 0 var(--t-space-2);
  text-align: center;
}

.t-table__col--select {
  width: 2.25rem;
}

.t-table__checkbox {
  margin: 0;
  cursor: pointer;
  accent-color: var(--t-color-accent);
}

.t-table__state-row {
  cursor: default;
}

.t-table__state-row:hover {
  background: transparent;
}

.t-table__state-cell {
  padding: var(--t-space-5) var(--t-space-3);
  text-align: center;
  color: var(--t-color-text-muted);
  border-bottom: none;
}

.t-table__state-text {
  font-size: var(--t-font-size-default);
}
</style>
