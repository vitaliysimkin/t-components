<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Icon from './TIcon.vue'
import Button from './TButton.vue'
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
  /** Smallest width in px when the table is `resizable`; default: the width of the header. */
  minWidth?: number
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
    /** Rows per page. Set it to show the pager in the table footer. */
    pageSize?: number
    /** Index of the first row of the page (`v-model:offset`). */
    offset?: number
    /** Total row count, when known; it disables Next on the last page. */
    total?: number
    /** Without `total`: whether a next page exists. */
    hasMore?: boolean
    previousLabel?: string
    nextLabel?: string
    pageLabel?: string
    /**
     * Keeps the header row (and the pager footer) visible while the rows scroll. The table scrolls with
     * the nearest scrolling ancestor (for example the body of a page layout) instead of in its own box,
     * and grows to the width of its columns.
     */
    stickyHeader?: boolean
    /** Keys of the rows whose `expanded` slot is shown in a full-width row under them. */
    expanded?: TTablePrimaryKey[]
    /**
     * Columns can be resized: drag the grip at the end of a header, double-click it to fit the content,
     * or use the arrow keys on it. The widths go out through `update:widths`.
     */
    resizable?: boolean
    /** Column widths in px by column key (`v-model:widths`); they win over `column.width`. */
    widths?: Record<string, number>
    resizeLabel?: string
  }>(),
  {
    loading: false,
    selectable: false,
    sort: null,
    selection: () => [],
    size: 'default',
    clientSideSort: false,
    pageSize: undefined,
    offset: 0,
    total: undefined,
    hasMore: false,
    previousLabel: 'Previous',
    nextLabel: 'Next',
    pageLabel: 'Page',
    stickyHeader: false,
    expanded: () => [],
    resizable: false,
    widths: undefined,
    resizeLabel: 'Resize column',
  }
)

const emit = defineEmits<{
  (e: 'update:sort', value: TTableSort | null): void
  (e: 'update:selection', value: TTablePrimaryKey[]): void
  (e: 'row-click', row: T, index: number): void
  (e: 'update:offset', value: number): void
  (e: 'update:widths', value: Record<string, number>): void
}>()

defineSlots<{
  empty?: () => unknown
  loading?: () => unknown
  [slot: `cell-${string}`]: ((scope: { row: T; value: unknown; index: number }) => unknown) | undefined
  [header: `header-${string}`]: ((scope: { column: TTableColumn<T> }) => unknown) | undefined
  /** Left side of the pager footer; default: `from–to` (and `of total` when known). */
  range?: (scope: { from: number; to: number; total: number | undefined; page: number }) => unknown
  /** Details of a row listed in `expanded`, in a full-width row under it. */
  expanded?: (scope: { row: T; index: number }) => unknown
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
  if (!column.sortable || resizedJustNow) return
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
  if (props.sort?.key !== column.key) return 'ticon:unfold'
  return props.sort.direction === 'asc'
    ? 'ticon:arrow-up'
    : 'ticon:arrow-down'
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

// --- New-row flash ---
// Rows that appear after the first non-empty render get `is-new` (plays once on insert).
let knownKeys = new Set(props.rows.map(getRowKey))
const newKeys = ref<Set<TTablePrimaryKey>>(new Set())
watch(
  () => props.rows.map(getRowKey),
  (keys) => {
    // Flash only rows added to an existing set; a full replacement (no overlap) flashes nothing.
    const overlaps = keys.some((k) => knownKeys.has(k))
    newKeys.value = overlaps ? new Set(keys.filter((k) => !knownKeys.has(k))) : new Set()
    knownKeys = new Set(keys)
  }
)

// --- Expanded rows ---
const expandedSet = computed(() => new Set(props.expanded))
const isExpanded = (row: T) => expandedSet.value.has(getRowKey(row))

const isEmpty = computed(() => !props.loading && props.rows.length === 0)

// --- Pager (offset pages; `total` or `hasMore` tells whether a next page exists) ---
const hasPager = computed(() => props.pageSize !== undefined && props.pageSize > 0)
const page = computed(() => (hasPager.value ? Math.floor(props.offset / props.pageSize!) + 1 : 1))
const rangeFrom = computed(() => props.offset + 1)
const rangeTo = computed(() => props.offset + props.rows.length)
const canPrevious = computed(() => !props.loading && props.offset > 0)
const canNext = computed(() => {
  if (props.loading) return false
  if (props.total !== undefined) return props.offset + props.pageSize! < props.total
  return props.hasMore
})

function goPrevious() {
  if (canPrevious.value) emit('update:offset', Math.max(0, props.offset - props.pageSize!))
}

function goNext() {
  if (canNext.value) emit('update:offset', props.offset + props.pageSize!)
}

// --- Column resize ---
const tableEl = ref<HTMLTableElement | null>(null)
const widthState = ref<Record<string, number>>({ ...props.widths })
watch(
  () => props.widths,
  (next) => { widthState.value = { ...next } },
  { deep: true }
)
/** Key of the column being dragged: its cells show the accent edge through the whole table. */
const resizingKey = ref<string | null>(null)
let resizedJustNow = false

/** Fixed layout once every column has a width in px; otherwise the browser lays out as before. */
const fixedLayout = computed(
  () => props.resizable && props.columns.length > 0 && props.columns.every((c) => (widthState.value[c.key] ?? 0) > 0)
)
const tableStyle = computed(() => {
  if (!fixedLayout.value) return undefined
  const sum = props.columns.reduce((n, c) => n + (widthState.value[c.key] ?? 0), 0)
  return { width: props.selectable ? `calc(${sum}px + 2.25rem)` : `${sum}px` }
})

function colStyle(column: TTableColumn<T>) {
  const px = props.resizable ? widthState.value[column.key] : undefined
  if (px) return { width: `${px}px` }
  return column.width ? { width: column.width } : undefined
}

function headerCells(): HTMLElement[] {
  return Array.from(tableEl.value?.querySelectorAll<HTMLElement>(':scope > thead > tr > th[data-column]') ?? [])
}

function headerCell(key: string): HTMLElement | undefined {
  return headerCells().find((th) => th.dataset.column === key)
}

/** Current width of a column; at the first resize every column keeps the width it has on screen. */
function freezeWidths() {
  if (fixedLayout.value) return
  const next = { ...widthState.value }
  for (const th of headerCells()) {
    const key = th.dataset.column!
    if (!((next[key] ?? 0) > 0)) next[key] = Math.round(th.getBoundingClientRect().width)
  }
  widthState.value = next
}

/** The header must fit: padding + label + sort icon + grip. */
function minWidthOf(column: TTableColumn<T>): number {
  if (column.minWidth !== undefined) return column.minWidth
  const th = headerCell(column.key)
  if (!th) return 48
  const cs = getComputedStyle(th)
  const content = th.querySelector<HTMLElement>('.t-table__th-content')
  const inner = content ? content.scrollWidth : 0
  return Math.max(48, Math.ceil(inner + parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0')))
}

function setWidth(column: TTableColumn<T>, px: number) {
  widthState.value = { ...widthState.value, [column.key]: Math.max(minWidthOf(column), Math.round(px)) }
}

function emitWidths() {
  emit('update:widths', { ...widthState.value })
}

let stopDrag: (() => void) | null = null

function onResizeStart(column: TTableColumn<T>, e: PointerEvent) {
  if (e.button !== undefined && e.button !== 0) return
  e.preventDefault()
  freezeWidths()
  const startX = e.clientX
  const startW = widthState.value[column.key] ?? 0
  resizingKey.value = column.key
  const move = (ev: PointerEvent) => setWidth(column, startW + ev.clientX - startX)
  const up = () => {
    stopDrag?.()
    resizingKey.value = null
    // The click that ends the drag on the header must not sort.
    resizedJustNow = true
    setTimeout(() => { resizedJustNow = false })
    emitWidths()
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', up)
  stopDrag = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    window.removeEventListener('pointercancel', up)
    stopDrag = null
  }
}

onBeforeUnmount(() => stopDrag?.())

function onResizeKey(column: TTableColumn<T>, e: KeyboardEvent) {
  const step = e.shiftKey ? 50 : 10
  const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
  if (!dir) return
  e.preventDefault()
  freezeWidths()
  setWidth(column, (widthState.value[column.key] ?? 0) + dir * step)
  emitWidths()
}

/** Double-click: the width of the widest cell of the column, at most the width of the table box. */
function onResizeFit(column: TTableColumn<T>) {
  const table = tableEl.value
  const th = headerCell(column.key)
  if (!table || !th) return
  freezeWidths()
  const col = Array.from(table.querySelectorAll<HTMLElement>(':scope > colgroup > col[data-column]'))
    .find((c) => c.dataset.column === column.key)
  const saved = {
    layout: table.style.tableLayout,
    width: table.style.width,
    minWidth: table.style.minWidth,
    col: col?.style.width ?? '',
  }
  table.style.tableLayout = 'auto'
  table.style.width = 'max-content'
  table.style.minWidth = '0'
  if (col) col.style.width = ''
  const natural = th.getBoundingClientRect().width
  table.style.tableLayout = saved.layout
  table.style.width = saved.width
  table.style.minWidth = saved.minWidth
  if (col) col.style.width = saved.col
  const box = table.parentElement?.clientWidth ?? 0
  setWidth(column, box > 0 ? Math.min(natural, box) : natural)
  emitWidths()
}
</script>

<template>
  <div
    class="t-table"
    :class="[
      `size-${props.size}`,
      {
        'is-sticky-header': props.stickyHeader,
        'is-resizable': props.resizable,
        'is-fixed-layout': fixedLayout,
        'is-resizing': resizingKey !== null
      }
    ]"
  >
    <div class="t-table__scroll">
      <table
        ref="tableEl"
        class="t-table__el"
        role="table"
        :style="tableStyle"
      >
        <colgroup>
          <col
            v-if="props.selectable"
            class="t-table__col--select"
          >
          <col
            v-for="column in props.columns"
            :key="column.key"
            :data-column="column.key"
            :style="colStyle(column)"
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
                { 'is-sortable': column.sortable, 'is-resize-edge': resizingKey === column.key }
              ]"
              :data-column="column.key"
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
                    :key="sortIcon(column)"
                    :icon="sortIcon(column)"
                    class="t-table__sort-icon"
                    :class="{ 'is-active': props.sort?.key === column.key }"
                    aria-hidden="true"
                  />
                </span>
              </slot>
              <span
                v-if="props.resizable"
                class="t-table__resizer"
                :class="{ 'is-active': resizingKey === column.key }"
                role="separator"
                aria-orientation="vertical"
                :aria-label="props.resizeLabel"
                :aria-valuenow="widthState[column.key]"
                tabindex="0"
                @pointerdown="onResizeStart(column, $event)"
                @dblclick.stop="onResizeFit(column)"
                @keydown="onResizeKey(column, $event)"
                @click.stop
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="props.loading">
            <tr class="t-table__state-row is-loading">
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
            <template
              v-for="(row, index) in displayRows"
              :key="getRowKey(row)"
            >
              <tr
                class="t-table__tr"
                :class="{
                  'is-selected': isRowSelected(row),
                  'is-new': newKeys.has(getRowKey(row)),
                  'is-expanded': isExpanded(row)
                }"
                :aria-expanded="$slots.expanded ? isExpanded(row) : undefined"
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
                  :class="[`align-${column.align || 'left'}`, { 'is-resize-edge': resizingKey === column.key }]"
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
              <tr
                v-if="$slots.expanded && isExpanded(row)"
                class="t-table__details-row"
              >
                <td
                  :colspan="props.columns.length + (props.selectable ? 1 : 0)"
                  class="t-table__details-cell"
                >
                  <slot
                    name="expanded"
                    :row="row"
                    :index="index"
                  />
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>
    <div
      v-if="hasPager"
      class="t-table__footer"
    >
      <span class="t-table__range">
        <slot
          v-if="props.rows.length > 0"
          name="range"
          :from="rangeFrom"
          :to="rangeTo"
          :total="props.total"
          :page="page"
        >
          <b>{{ rangeFrom }}–{{ rangeTo }}</b><template v-if="props.total !== undefined"> of {{ props.total }}</template>
        </slot>
      </span>
      <nav
        class="t-table__pager"
        aria-label="Pages"
      >
        <Button
          type="button"
          mode="ghost"
          size="small"
          icon="ticon:chevron-left"
          class="t-table__pager-btn"
          data-action="previous"
          :disabled="!canPrevious"
          :aria-label="props.previousLabel"
          :title="props.previousLabel"
          @click="goPrevious"
        />
        <span class="t-table__page">{{ props.pageLabel }} {{ page }}</span>
        <Button
          type="button"
          mode="ghost"
          size="small"
          icon="ticon:chevron-right"
          class="t-table__pager-btn"
          data-action="next"
          :disabled="!canNext"
          :aria-label="props.nextLabel"
          :title="props.nextLabel"
          @click="goNext"
        />
      </nav>
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
  border-radius: var(--t-radius-large);
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

/* Resizable columns: a grip at the end of each header; while dragging, an accent edge runs through the column. */
.t-table.is-resizable .t-table__th {
  position: relative;
  padding-right: calc(var(--t-space-3) + 9px);
}

.t-table.is-sticky-header.is-resizable .t-table__th {
  position: sticky;
}

.t-table.is-fixed-layout .t-table__el {
  table-layout: fixed;
  min-width: 100%;
}

.t-table.is-fixed-layout .t-table__td {
  overflow: hidden;
  text-overflow: ellipsis;
}

.t-table.is-resizing {
  cursor: col-resize;
  user-select: none;
}

.t-table__resizer {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 9px;
  cursor: col-resize;
  touch-action: none;
  background: linear-gradient(var(--t-color-border-strong), var(--t-color-border-strong)) center / 2px 50% no-repeat;
  border-radius: var(--t-radius-pill);
}

.t-table__resizer:hover,
.t-table__resizer:focus-visible,
.t-table__resizer.is-active {
  background: linear-gradient(var(--t-color-accent), var(--t-color-accent)) center / 2px 100% no-repeat;
  outline: none;
}

.t-table__th.is-resize-edge,
.t-table__td.is-resize-edge {
  box-shadow: inset -2px 0 0 var(--t-color-accent);
}

.t-table__th.is-resize-edge .t-table__resizer.is-active {
  background: none;
}

/* Sticky header: no scroll box inside the table, so the header and the pager stick to the scrolling ancestor. */
.t-table.is-sticky-header {
  overflow: clip;
  width: max-content;
  min-width: 100%;
  box-sizing: border-box;
}

.t-table.is-sticky-header .t-table__scroll {
  overflow: visible;
}

.t-table.is-sticky-header .t-table__th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--t-color-surface);
}

.t-table.is-sticky-header .t-table__th.is-sortable:hover {
  background: linear-gradient(var(--t-color-hover), var(--t-color-hover)), var(--t-color-surface);
}

.t-table.is-sticky-header .t-table__footer {
  position: sticky;
  bottom: 0;
  z-index: 1;
  background: var(--t-color-surface);
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
  background: transparent;
  color: var(--t-color-text-muted);
  font-weight: var(--t-font-weight-medium);
  font-size: 0.875em;
  border-bottom: 1px solid var(--t-color-border);
  user-select: none;
  white-space: nowrap;
}

.t-table__th.is-sortable {
  cursor: pointer;
}

.t-table__th.is-sortable:hover {
  color: var(--t-color-text);
  background: var(--t-color-hover);
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
.t-table__sort-icon.is-active {
  opacity: 1;
  animation: t-table-sort-flip var(--t-duration-slow) var(--t-ease);
}
@keyframes t-table-sort-flip {
  from { transform: rotate(calc(-180deg * var(--t-motion-move))); }
}

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
  background: var(--t-color-hover);
}

.t-table__tr.is-selected {
  background: var(--t-color-accent-plain-bg);
}

/* Selected row: accent bar grows on the left (fades at reduced, instant at off). */
.t-table__tr .t-table__td:first-child {
  position: relative;
}

.t-table__tr .t-table__td:first-child::before {
  content: '';
  position: absolute;
  left: 0;
  top: 15%;
  bottom: 15%;
  width: 3px;
  border-radius: 2px;
  background: var(--t-color-accent);
  opacity: 0;
  transform: scaleY(calc(1 - var(--t-motion-move)));
  transition: transform var(--t-duration) var(--t-ease), opacity var(--t-duration) var(--t-ease);
}

.t-table__tr.is-selected .t-table__td:first-child::before {
  opacity: 1;
  transform: scaleY(1);
}

/* Expanded row: the details under it, on the second surface, one border below both. */
.t-table__tr.is-expanded .t-table__td {
  border-bottom: none;
}

.t-table__details-cell {
  padding: var(--t-space-2) var(--t-space-3) var(--t-space-3);
  background: var(--t-color-surface-2);
  border-bottom: 1px solid var(--t-color-border);
}

.t-table__details-row:last-child .t-table__details-cell {
  border-bottom: none;
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
  position: relative;
  overflow: hidden;
  padding: var(--t-space-5) var(--t-space-3);
  text-align: center;
  color: var(--t-color-text-muted);
  border-bottom: none;
}

.t-table__state-text {
  font-size: var(--t-font-size-default);
}

/* Loading: the text pulses and a shimmer sweeps the row (shimmer hidden at reduced/off; both stop at off). */
.t-table__state-row.is-loading .t-table__state-text {
  animation: t-pulse calc(1.2s * var(--t-motion-scale)) ease-in-out infinite;
}

.t-table__state-row.is-loading .t-table__state-cell::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: var(--t-motion-move);
  background: linear-gradient(100deg, transparent 30%, color-mix(in srgb, var(--t-color-text) 10%, transparent) 50%, transparent 70%);
  animation: t-table-sweep calc(1.1s * var(--t-motion-scale)) ease-in-out infinite;
  pointer-events: none;
}

/* Pager footer: range on the left, ‹ Page N › on the right, inside the table frame. */
.t-table__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--t-space-3);
  min-height: var(--t-control-h-default);
  padding: var(--t-space-1) var(--t-space-3);
  border-top: 1px solid var(--t-color-border);
  color: var(--t-color-text-muted);
  font-size: var(--t-font-size-small);
  box-sizing: border-box;
}

.t-table__range b {
  color: var(--t-color-text);
  font-weight: var(--t-font-weight-medium);
}

.t-table__pager {
  display: flex;
  align-items: center;
  gap: var(--t-space-1);
}

.t-table__page {
  min-width: var(--t-control-h-small);
  text-align: center;
  color: var(--t-color-text);
  font-variant-numeric: tabular-nums;
}

@keyframes t-table-sweep {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
</style>
