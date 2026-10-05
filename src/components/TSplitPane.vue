<script setup lang="ts">
import { computed, ref, watch } from 'vue'

export type TSplitPaneVariant = 'gutter' | 'flat' | 'line'
export type TSplitPaneOrientation = 'vertical' | 'horizontal'

export interface TSplitPaneProps {
  /** Розмір першої панелі в px (v-model): ширина лівої або, для `horizontal`, висота верхньої. Без v-model компонент тримає розмір сам. */
  modelValue?: number
  /** Орієнтація роздільника (як `aria-orientation`): `vertical` — панелі ліворуч і праворуч, `horizontal` — згори й знизу. */
  orientation?: TSplitPaneOrientation
  /** Вигляд роздільника: `gutter` — жолобок 6px між панелями-картками, `flat` — щілина 5px, `line` — лінія 1px з ручкою. */
  variant?: TSplitPaneVariant
  /** Мінімальний розмір першої панелі, px. */
  min?: number
  /** Максимальний розмір першої панелі, px. */
  max?: number
  /** Мінімальний розмір другої панелі, px — обмежує першу зверху з урахуванням розміру контейнера. */
  minEnd?: number
  /** Початковий розмір і значення для скидання подвійним кліком. */
  defaultSize?: number
  /** Крок стрілок ←/→ (для `horizontal` — ↑/↓), px. */
  step?: number
  /** Крок стрілок із Shift, px. */
  largeStep?: number
  /** Доступна назва роздільника. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<TSplitPaneProps>(), {
  modelValue: undefined,
  orientation: 'vertical',
  variant: 'line',
  min: 120,
  max: Number.POSITIVE_INFINITY,
  minEnd: 0,
  defaultSize: 240,
  step: 10,
  largeStep: 50,
  ariaLabel: 'Resize panels',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  /** Перетягування завершено (зручно для збереження ширини). */
  (e: 'resize-end', value: number): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const handleRef = ref<HTMLElement | null>(null)
const internal = ref(props.modelValue ?? props.defaultSize)
const dragging = ref(false)
const horizontal = computed(() => props.orientation === 'horizontal')

watch(() => props.modelValue, (v) => {
  if (v !== undefined) internal.value = v
})

/** Верхня межа з урахуванням контейнера й `minEnd`. */
function upperBound(): number {
  const root = rootRef.value
  const handle = handleRef.value
  let bound = props.max
  const total = horizontal.value ? root?.clientHeight : root?.clientWidth
  if (root && total && total > 0) {
    const style = getComputedStyle(root)
    const padding = horizontal.value
      ? parseFloat(style.paddingTop || '0') + parseFloat(style.paddingBottom || '0')
      : parseFloat(style.paddingLeft || '0') + parseFloat(style.paddingRight || '0')
    const handleSize = (horizontal.value ? handle?.offsetHeight : handle?.offsetWidth) ?? 0
    bound = Math.min(bound, total - padding - handleSize - props.minEnd)
  }
  return Math.max(props.min, bound)
}

function clamp(v: number): number {
  return Math.round(Math.min(Math.max(v, props.min), upperBound()))
}

function setSize(v: number) {
  const next = clamp(v)
  if (next === internal.value) return
  internal.value = next
  emit('update:modelValue', next)
}

let startPos = 0
let startSize = 0

function pointerPos(e: PointerEvent): number {
  return horizontal.value ? e.clientY : e.clientX
}

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  e.preventDefault()
  startPos = pointerPos(e)
  startSize = internal.value
  dragging.value = true
  const el = e.currentTarget as HTMLElement
  el.setPointerCapture?.(e.pointerId)
  el.focus({ preventScroll: true })
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  setSize(startSize + pointerPos(e) - startPos)
}

function onPointerUp(e: PointerEvent) {
  if (!dragging.value) return
  dragging.value = false
  const el = e.currentTarget as HTMLElement
  if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId)
  emit('resize-end', internal.value)
}

function onKeydown(e: KeyboardEvent) {
  const delta = e.shiftKey ? props.largeStep : props.step
  const [decKey, incKey] = horizontal.value ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']
  let next: number | null = null
  switch (e.key) {
    case decKey: next = internal.value - delta; break
    case incKey: next = internal.value + delta; break
    case 'Home': next = props.min; break
    case 'End': next = upperBound(); break
    case 'Enter': next = props.defaultSize; break
  }
  if (next === null) return
  e.preventDefault()
  setSize(next)
  emit('resize-end', internal.value)
}

function onDoubleClick() {
  setSize(props.defaultSize)
  emit('resize-end', internal.value)
}

const startStyle = computed(() => (horizontal.value
  ? { height: `${internal.value}px` }
  : { width: `${internal.value}px` }))
const ariaMax = computed(() => (Number.isFinite(props.max) ? props.max : undefined))
</script>

<template>
  <div
    ref="rootRef"
    class="t-split-pane"
    :class="[`variant-${props.variant}`, { 'is-horizontal': horizontal, 'is-dragging': dragging }]"
  >
    <div
      class="t-split-pane__pane t-split-pane__start"
      :style="startStyle"
    >
      <slot name="start" />
    </div>
    <div
      ref="handleRef"
      class="t-split-pane__handle"
      role="separator"
      :aria-orientation="props.orientation"
      tabindex="0"
      :aria-label="props.ariaLabel"
      :aria-valuenow="internal"
      :aria-valuemin="props.min"
      :aria-valuemax="ariaMax"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown="onKeydown"
      @dblclick="onDoubleClick"
    >
      <span
        class="t-split-pane__grip"
        aria-hidden="true"
      />
    </div>
    <div class="t-split-pane__pane t-split-pane__end">
      <slot name="end" />
    </div>
  </div>
</template>

<style scoped>
.t-split-pane {
  --t-split-color: var(--t-color-border-strong);
  --t-split-hit: 10px;
  display: flex;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
}

.t-split-pane__pane {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  box-sizing: border-box;
}

.t-split-pane__start {
  flex: none;
}

.t-split-pane__end {
  flex: 1 1 0;
}

/* Під час перетягування панелі (зокрема iframe) не перехоплюють мишу, текст не виділяється. */
.t-split-pane.is-dragging {
  cursor: col-resize;
  user-select: none;
}

.t-split-pane.is-dragging .t-split-pane__pane {
  pointer-events: none;
}

.t-split-pane__handle {
  position: relative;
  flex: none;
  z-index: 1;
  cursor: col-resize;
  touch-action: none;
  outline: none;
  transition: background-color var(--t-duration) ease;
}

/* Невидима зона захоплення по центру роздільника — ширша за видиму частину. */
.t-split-pane__handle::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(50% - var(--t-split-hit) / 2);
  width: var(--t-split-hit);
}

.t-split-pane__handle:hover,
.t-split-pane__handle:focus-visible,
.t-split-pane.is-dragging .t-split-pane__handle {
  --t-split-color: var(--t-color-accent);
}

.t-split-pane__grip {
  position: absolute;
  pointer-events: none;
}

/* ── gutter: жолобок 6px між панелями-картками ─────────────────────────── */
.t-split-pane.variant-gutter {
  padding: var(--t-space-1);
  background: var(--t-color-bg);
}

.t-split-pane.variant-gutter .t-split-pane__pane {
  background: var(--t-color-surface);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-small);
}

.t-split-pane.variant-gutter .t-split-pane__handle {
  width: 6px;
  border-radius: var(--t-radius-mini);
}

.t-split-pane.variant-gutter .t-split-pane__grip,
.t-split-pane.variant-flat .t-split-pane__grip {
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  --t-split-grip-h: 18px;
}

.t-split-pane.variant-gutter .t-split-pane__grip {
  background:
    linear-gradient(var(--t-split-color), var(--t-split-color)) 1px 50% / 1px var(--t-split-grip-h) no-repeat,
    linear-gradient(var(--t-split-color), var(--t-split-color)) 4px 50% / 1px var(--t-split-grip-h) no-repeat;
}

/* ── flat: щілина 5px між панелями без карток ──────────────────────────── */
.t-split-pane.variant-flat .t-split-pane__handle {
  width: 5px;
  background: var(--t-color-bg);
}

.t-split-pane.variant-flat .t-split-pane__grip {
  background:
    linear-gradient(var(--t-split-color), var(--t-split-color)) 1px 50% / 1px var(--t-split-grip-h) no-repeat,
    linear-gradient(var(--t-split-color), var(--t-split-color)) 3px 50% / 1px var(--t-split-grip-h) no-repeat;
}

.t-split-pane.variant-gutter .t-split-pane__handle:hover,
.t-split-pane.variant-gutter .t-split-pane__handle:focus-visible,
.t-split-pane.variant-gutter.is-dragging .t-split-pane__handle,
.t-split-pane.variant-flat .t-split-pane__handle:hover,
.t-split-pane.variant-flat .t-split-pane__handle:focus-visible,
.t-split-pane.variant-flat.is-dragging .t-split-pane__handle {
  background: var(--t-color-accent-plain-bg);
}

.t-split-pane.variant-gutter .t-split-pane__handle:hover .t-split-pane__grip,
.t-split-pane.variant-gutter .t-split-pane__handle:focus-visible .t-split-pane__grip,
.t-split-pane.variant-gutter.is-dragging .t-split-pane__grip,
.t-split-pane.variant-flat .t-split-pane__handle:hover .t-split-pane__grip,
.t-split-pane.variant-flat .t-split-pane__handle:focus-visible .t-split-pane__grip,
.t-split-pane.variant-flat.is-dragging .t-split-pane__grip {
  --t-split-grip-h: 100%;
}

.t-split-pane.variant-gutter .t-split-pane__handle:focus-visible,
.t-split-pane.variant-flat .t-split-pane__handle:focus-visible {
  box-shadow: inset 0 0 0 2px var(--t-color-focus-ring);
}

/* ── line: лінія 1px з ручкою-крапками по центру ───────────────────────────
   Лінія 1px, ручка 9px з left:-4px — центр обох на одній осі до пікселя.
   Лінія переривається за 3px від ручки (37px / 2 + 3px) і крізь неї не проходить. */
.t-split-pane.variant-line .t-split-pane__handle {
  --t-split-gap: calc(18.5px + 3px);
  --t-split-line-w: 1px;
  width: 1px;
}

.t-split-pane.variant-line .t-split-pane__handle::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc((1px - var(--t-split-line-w)) / 2);
  width: var(--t-split-line-w);
  pointer-events: none;
  background: linear-gradient(
    var(--t-split-color) calc(50% - var(--t-split-gap)),
    transparent 0 calc(50% + var(--t-split-gap)),
    var(--t-split-color) 0
  );
}

.t-split-pane.variant-line .t-split-pane__handle:hover,
.t-split-pane.variant-line .t-split-pane__handle:focus-visible,
.t-split-pane.variant-line.is-dragging .t-split-pane__handle {
  --t-split-line-w: 3px;
}

.t-split-pane.variant-line .t-split-pane__grip {
  z-index: 1;
  top: calc(50% - 18.5px);
  left: -4px;
  width: 9px;
  height: 37px;
  box-sizing: border-box;
  border: 1px solid var(--t-split-color);
  border-radius: 999px;
  background:
    radial-gradient(circle at 3.5px 3.5px, var(--t-split-color) 1.5px, transparent 1.6px) 0 0 / 7px 7px repeat-y,
    var(--t-color-surface);
}

.t-split-pane.variant-line .t-split-pane__handle:focus-visible .t-split-pane__grip {
  box-shadow: 0 0 0 3px var(--t-color-focus-ring);
}

/* ── horizontal: панелі згори й знизу, роздільник горизонтальний ──────────
   Ті самі вигляди, повернуті на 90°: розміри й градієнти — по іншій осі. */
.t-split-pane.is-horizontal {
  flex-direction: column;
}

.t-split-pane.is-horizontal.is-dragging,
.t-split-pane.is-horizontal .t-split-pane__handle {
  cursor: row-resize;
}

.t-split-pane.is-horizontal .t-split-pane__handle::before {
  top: calc(50% - var(--t-split-hit) / 2);
  bottom: auto;
  left: 0;
  right: 0;
  width: auto;
  height: var(--t-split-hit);
}

.t-split-pane.is-horizontal.variant-gutter .t-split-pane__handle {
  width: auto;
  height: 6px;
}

.t-split-pane.is-horizontal.variant-gutter .t-split-pane__grip {
  background:
    linear-gradient(var(--t-split-color), var(--t-split-color)) 50% 1px / var(--t-split-grip-h) 1px no-repeat,
    linear-gradient(var(--t-split-color), var(--t-split-color)) 50% 4px / var(--t-split-grip-h) 1px no-repeat;
}

.t-split-pane.is-horizontal.variant-flat .t-split-pane__handle {
  width: auto;
  height: 5px;
}

.t-split-pane.is-horizontal.variant-flat .t-split-pane__grip {
  background:
    linear-gradient(var(--t-split-color), var(--t-split-color)) 50% 1px / var(--t-split-grip-h) 1px no-repeat,
    linear-gradient(var(--t-split-color), var(--t-split-color)) 50% 3px / var(--t-split-grip-h) 1px no-repeat;
}

.t-split-pane.is-horizontal.variant-line .t-split-pane__handle {
  width: auto;
  height: 1px;
}

.t-split-pane.is-horizontal.variant-line .t-split-pane__handle::after {
  top: calc((1px - var(--t-split-line-w)) / 2);
  bottom: auto;
  left: 0;
  right: 0;
  width: auto;
  height: var(--t-split-line-w);
  background: linear-gradient(
    to right,
    var(--t-split-color) calc(50% - var(--t-split-gap)),
    transparent 0 calc(50% + var(--t-split-gap)),
    var(--t-split-color) 0
  );
}

.t-split-pane.is-horizontal.variant-line .t-split-pane__grip {
  top: -4px;
  left: calc(50% - 18.5px);
  width: 37px;
  height: 9px;
  background:
    radial-gradient(circle at 3.5px 3.5px, var(--t-split-color) 1.5px, transparent 1.6px) 0 0 / 7px 7px repeat-x,
    var(--t-color-surface);
}
</style>
