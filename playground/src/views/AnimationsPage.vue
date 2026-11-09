<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  currentMotion, setMotion, useDialog, useNotifications,
  TButton, TButtonGroup, TDropdown, TSelect, TTabs, TCheckbox, TInput, TTextarea, TFormField,
  TTable, TBadge, TCopyChip, TCard, TEmpty, TDatePicker, TLogPane, TPathCrumbs, TTag, TSidebar,
  type MotionSetting, type TTableSort, type TLogLine,
} from '@vitaliysimkin/t-components'
import { TLogView } from '@vitaliysimkin/t-components/code-editor'
import tokensCss from '../../../src/styles/tokens.css?raw'
import EasingGraph from '../components/EasingGraph.vue'
import measurements from '../motion-measurements.json'

const motion = computed({
  get: () => currentMotion.value,
  set: (v: MotionSetting | null) => v && setMotion(v),
})
const motionOptions = ['full', 'reduced', 'off'].map((v) => ({ value: v, label: v }))

/* Token values at `full`, read from tokens.css so the graphs follow the real tokens. */
const token = (re: RegExp, fallback: string) => tokensCss.match(re)?.[1].replace(/\s+/g, ' ') ?? fallback
const EASE = token(/--t-ease:\s*([^;]+);/, 'ease')
const SPRING = token(/--t-ease-spring:\s*([^;]+);/, 'linear')
const D = Number(token(/--t-duration:\s*calc\((\d+)ms/, '150'))
const S = Number(token(/--t-duration-slow:\s*calc\((\d+)ms/, '280'))

interface Graph { ease: string, ms: number, delay?: number, frames?: [number, number][], label?: string }
interface Anim {
  id: string
  comps: string
  name: string
  what: string
  timing: string
  reduced: string
  off: string
  graph?: Graph
}

const NO_SLOW = 'No animation: --t-duration-slow is 0.'
const INSTANT = 'Instant (all durations 0).'

const anims: Anim[] = [
  {
    id: 'button-press', comps: 'TButton', name: 'Press: sink and spring',
    what: 'While pressed the button scales down to 95%; on release it springs back with ~10% overshoot. Property: transform.',
    timing: `press: --t-duration-slow ÷ 3 (${Math.round(S / 3)} ms), --t-ease; release: --t-duration-slow (${S} ms), --t-ease-spring.`,
    reduced: 'No scale (--t-motion-move = 0).', off: INSTANT,
    graph: { ease: SPRING, ms: S, frames: [[0, 0.95], [1, 1]], label: 'scale on release' },
  },
  {
    id: 'button-ripple', comps: 'TButton', name: 'Press ripple',
    what: 'A currentColor circle grows from the pointer (scale 0 → 1) and fades from 30% opacity. One node, removed on animationend. Properties: transform, opacity.',
    timing: `--t-duration-slow × 1.6 (${S * 1.6} ms), --t-ease.`,
    reduced: NO_SLOW, off: 'No ripple.',
    graph: { ease: EASE, ms: S * 1.6, label: 'scale' },
  },
  {
    id: 'button-hover', comps: 'TButton', name: 'Hover veil',
    what: 'An 8% currentColor layer (::after) fades in over the button. Property: opacity.',
    timing: `--t-duration (${D} ms), --t-ease.`,
    reduced: 'Same (opacity only).', off: INSTANT,
    graph: { ease: EASE, ms: D, frames: [[0, 0], [1, 0.08]], label: 'opacity' },
  },
  {
    id: 'button-loading', comps: 'TButton', name: 'Loading pulse (.is-loading)',
    what: 'With the consumer class is-loading the button pulses opacity 1 → 0.35 → 1, infinitely. Property: opacity.',
    timing: '1s × --t-motion-scale, ease-in-out, infinite.',
    reduced: 'Same (opacity only).', off: 'No pulse.',
    graph: { ease: 'ease-in-out', ms: 1000, frames: [[0, 1], [0.5, 0.35], [1, 1]], label: 'opacity' },
  },
  {
    id: 'button-shine', comps: 'TButton', name: 'Enable shine',
    what: 'When a disabled button becomes enabled, a light gradient band sweeps across once. Property: transform (translateX −120% → 120%).',
    timing: `--t-duration-slow × 2.5 (${S * 2.5} ms), --t-ease.`,
    reduced: NO_SLOW, off: 'No shine.',
    graph: { ease: EASE, ms: S * 2.5, frames: [[0, -120], [1, 120]], label: 'translateX %' },
  },
  {
    id: 'focus-thicken', comps: 'global :focus-visible', name: 'Keyboard focus thickens',
    what: 'The keyboard focus outline grows from 1px to its final width. Property: outline-width (repaints each frame).',
    timing: `--t-duration-slow (${S} ms), --t-ease.`,
    reduced: NO_SLOW, off: INSTANT,
    graph: { ease: EASE, ms: S, frames: [[0, 1], [1, 2]], label: 'outline px' },
  },
  {
    id: 'dropdown-open', comps: 'TDropdown', name: 'Panel open',
    what: 'The panel fades in and slides down 6px. Properties: opacity, transform.',
    timing: `--t-duration (${D} ms), --t-ease.`,
    reduced: 'Fade only.', off: INSTANT,
    graph: { ease: EASE, ms: D, frames: [[0, -6], [1, 0]], label: 'translateY px' },
  },
  {
    id: 'select-cascade', comps: 'TSelect', name: 'Option cascade',
    what: 'Options drop in one after another: fade + 4px slide, items 2–5 delayed by 20 ms steps (max 80 ms). The panel itself opens like TDropdown. Properties: opacity, transform.',
    timing: `--t-duration (${D} ms), --t-ease; delay 20 ms × n × --t-motion-scale.`,
    reduced: 'Fade cascade, no shift.', off: INSTANT,
    graph: { ease: EASE, ms: D, delay: 80, frames: [[0, -4], [1, 0]], label: 'item 5 translateY px' },
  },
  {
    id: 'modal-zoom', comps: 'TModalBox / useDialog', name: 'Dialog zoom from opener',
    what: 'The dialog grows from the button that opened it (scale 0.2 → 1, transform-origin = opener center, else panel center); panel and backdrop fade in. Properties: scale, opacity.',
    timing: `zoom: --t-duration-slow (${S} ms), --t-ease; fade: --t-duration (${D} ms), --t-ease.`,
    reduced: 'Fade only.', off: INSTANT,
    graph: { ease: EASE, ms: S, frames: [[0, 0.2], [1, 1]], label: 'scale' },
  },
  {
    id: 'notify-slide', comps: 'TNotifications', name: 'Toast slide in/out',
    what: 'Toasts slide in from beyond the screen edge (110% of their width) and leave the same way, fading. Properties: transform, opacity.',
    timing: `transform: --t-duration-slow (${S} ms); opacity: --t-duration (${D} ms); --t-ease.`,
    reduced: 'Fade only.', off: INSTANT,
    graph: { ease: EASE, ms: S, frames: [[0, 110], [1, 0]], label: 'translateX %' },
  },
  {
    id: 'notify-timer', comps: 'TNotifications', name: 'Remaining-time bar',
    what: 'A 2px bar at the bottom of an auto-dismissing toast shrinks over the timeout. Property: transform (scaleX 1 → 0).',
    timing: 'timeoutMs × --t-motion-scale, linear.',
    reduced: 'Same (progress information).', off: 'No bar (the animation ends at once).',
    graph: { ease: 'linear', ms: 4000, frames: [[0, 1], [1, 0]], label: 'scaleX, 4 s toast' },
  },
  {
    id: 'tabs-line', comps: 'TTabs', name: 'Sliding underline',
    what: 'The underline slides to the new tab and stretches to its width (one offset measurement per change). Property: transform (translateX + scaleX).',
    timing: `--t-duration-slow (${S} ms), --t-ease.`,
    reduced: 'Jumps (no slide).', off: INSTANT,
    graph: { ease: EASE, ms: S, label: 'position' },
  },
  {
    id: 'group-pill', comps: 'TButtonGroup', name: 'Sliding thumb',
    what: 'mode="segmented": a raised thumb slides along the track under the selected option (width set once per change); pressing the selected option squeezes it to 96%. Multi select: each option fades and springs in its own thumb. Property: transform (translateX / scale), opacity.',
    timing: `slide, squeeze: --t-duration-slow (${S} ms), --t-ease; multi thumb: opacity --t-duration (${D} ms), scale --t-duration-slow, --t-ease-spring.`,
    reduced: 'Jumps (no slide, no squeeze); multi thumbs only fade.', off: INSTANT,
    graph: { ease: EASE, ms: S, label: 'position' },
  },
  {
    id: 'checkbox-press', comps: 'TCheckbox', name: 'Press squeeze',
    what: 'The box squeezes to 80% while pressed and springs back on release. Property: transform.',
    timing: `press: --t-duration-slow ÷ 3 (${Math.round(S / 3)} ms), --t-ease; release: --t-duration-slow (${S} ms), --t-ease-spring.`,
    reduced: 'No squeeze.', off: INSTANT,
    graph: { ease: SPRING, ms: S, frames: [[0, 0.8], [1, 1]], label: 'scale on release' },
  },
  {
    id: 'checkbox-mark', comps: 'TCheckbox', name: 'Check mark turn',
    what: 'The mark rotates into place from −45° (dash → check) and drops 15%. Property: transform.',
    timing: `--t-duration-slow (${S} ms), --t-ease-spring.`,
    reduced: NO_SLOW, off: INSTANT,
    graph: { ease: SPRING, ms: S, frames: [[0, -45], [1, 0]], label: 'rotate deg' },
  },
  {
    id: 'input-focus', comps: 'TInput', name: 'Focus ring settles',
    what: 'The focus ring (pseudo-element with a box-shadow) fades in and shrinks from 103% to 100%. Properties: opacity, transform.',
    timing: `--t-duration-slow (${S} ms), --t-ease.`,
    reduced: NO_SLOW, off: INSTANT,
    graph: { ease: EASE, ms: S, frames: [[0, 1.03], [1, 1]], label: 'scale' },
  },
  {
    id: 'textarea-focus', comps: 'TTextarea', name: 'Focus ring settles',
    what: 'Same ring as TInput on a wrapper pseudo-element, matched with :has(:focus-visible). Properties: opacity, transform.',
    timing: `--t-duration-slow (${S} ms), --t-ease.`,
    reduced: NO_SLOW, off: INSTANT,
    graph: { ease: EASE, ms: S, frames: [[0, 1.03], [1, 1]], label: 'scale' },
  },
  {
    id: 'input-error', comps: 'TInput', name: 'Error ring pulse',
    what: 'When an error appears, a danger ring spreads out once (scale 1 → 1.03) and fades. Properties: transform, opacity.',
    timing: `--t-duration-slow × 2 (${S * 2} ms), ease-out.`,
    reduced: NO_SLOW, off: INSTANT,
    graph: { ease: 'ease-out', ms: S * 2, frames: [[0, 0.45], [1, 0]], label: 'opacity' },
  },
  {
    id: 'field-shake', comps: 'TFormField', name: 'Error shake',
    what: 'When an error appears the control shakes once (−6, 5, −3, 2 px). Property: transform (translateX).',
    timing: `--t-duration-slow × 1.5 (${S * 1.5} ms), ease-in-out per keyframe.`,
    reduced: NO_SLOW, off: INSTANT,
    graph: { ease: 'ease-in-out', ms: S * 1.5, frames: [[0, 0], [0.2, -6], [0.4, 5], [0.6, -3], [0.8, 2], [1, 0]], label: 'translateX px' },
  },
  {
    id: 'input-adornment', comps: 'TInput', name: 'Clear button / suffix icon in',
    what: 'The clear button and suffix icon slide in 6px from the right and fade in when they appear. Properties: opacity, transform.',
    timing: `--t-duration (${D} ms), --t-ease.`,
    reduced: 'Fade only.', off: INSTANT,
    graph: { ease: EASE, ms: D, frames: [[0, 6], [1, 0]], label: 'translateX px' },
  },
  {
    id: 'table-new-row', comps: 'TTable', name: 'New row flash',
    what: 'Rows added to an existing set flash: the accent background fades out. Property: opacity of an accent overlay (::after, composited).',
    timing: '1s × --t-motion-scale, ease-out.',
    reduced: 'Same (opacity only).', off: 'No flash.',
    graph: { ease: 'ease-out', ms: 1000, frames: [[0, 28], [1, 0]], label: 'accent %' },
  },
  {
    id: 'table-select', comps: 'TTable', name: 'Selected row bar',
    what: 'A 3px accent bar on the left of a selected row grows vertically and fades in. Properties: transform (scaleY), opacity.',
    timing: `--t-duration (${D} ms), --t-ease.`,
    reduced: 'Fade only (full height).', off: INSTANT,
    graph: { ease: EASE, ms: D, label: 'scaleY / opacity' },
  },
  {
    id: 'table-sort', comps: 'TTable', name: 'Sort icon flip',
    what: 'The active sort icon turns in by 180°. Property: transform (rotate).',
    timing: `--t-duration-slow (${S} ms), --t-ease.`,
    reduced: NO_SLOW, off: INSTANT,
    graph: { ease: EASE, ms: S, frames: [[0, -180], [1, 0]], label: 'rotate deg' },
  },
  {
    id: 'table-loading', comps: 'TTable', name: 'Loading pulse + shimmer',
    what: 'The loading text pulses opacity; a shimmer band sweeps the row. Properties: opacity, transform. Infinite.',
    timing: 'pulse 1.2s, shimmer 1.1s (× --t-motion-scale), ease-in-out.',
    reduced: 'Pulse only (shimmer hidden).', off: 'Static.',
    graph: { ease: 'ease-in-out', ms: 1100, frames: [[0, -100], [1, 100]], label: 'shimmer translateX %' },
  },
  {
    id: 'badge-ring', comps: 'TBadge', name: 'Value change ring',
    what: 'On value change a ring spreads from the badge (scale 1 → 2.6) and fades. Properties: transform, opacity.',
    timing: `--t-duration-slow × 2 (${S * 2} ms), --t-ease.`,
    reduced: NO_SLOW, off: INSTANT,
    graph: { ease: EASE, ms: S * 2, frames: [[0, 1], [1, 2.6]], label: 'scale' },
  },
  {
    id: 'badge-dot', comps: 'TBadge (dot)', name: '"New" dot ping',
    what: 'On mount a ring pings out of the dot three times (scale 1 → 2.6, fading). Properties: transform, opacity.',
    timing: '1s × --t-motion-scale, --t-ease, 3 iterations.',
    reduced: 'Fades in place (no scale).', off: 'No ping.',
    graph: { ease: EASE, ms: 1000, frames: [[0, 1], [1, 2.6]], label: 'scale, per ping' },
  },
  {
    id: 'tag-pop', comps: 'TTag', name: 'Variant change pop',
    what: 'On variant change the tag pops to 112% and springs back. Property: transform.',
    timing: `--t-duration-slow (${S} ms), --t-ease-spring.`,
    reduced: NO_SLOW, off: INSTANT,
    graph: { ease: SPRING, ms: S, frames: [[0, 1], [0.4, 1.12], [1, 1]], label: 'scale' },
  },
  {
    id: 'copy-bubble', comps: 'TCopyChip', name: '"Copied" bubble',
    what: 'After copying, a "Copied" bubble floats 8px up above the chip and fades out. Properties: transform, opacity.',
    timing: '1.1s × --t-motion-scale, ease-out.',
    reduced: 'Fades in place.', off: 'No bubble.',
    graph: { ease: 'ease-out', ms: 1100, frames: [[0, 4], [0.2, 0], [0.75, -4], [1, -8]], label: 'translateY px' },
  },
  {
    id: 'card-target', comps: 'TCard', name: ':target flash',
    what: 'A card navigated to via #id flashes an accent background that fades out. Property: opacity of an accent overlay (::after, composited).',
    timing: '1.1s × --t-motion-scale, ease-out.',
    reduced: 'Same (opacity only).', off: 'No flash.',
    graph: { ease: 'ease-out', ms: 1100, frames: [[0, 28], [1, 0]], label: 'accent %' },
  },
  {
    id: 'empty-cascade', comps: 'TEmpty', name: 'Icon and text rise',
    what: 'On mount the icon, then the description, rise 16px and fade in. Properties: opacity, transform.',
    timing: `--t-duration-slow (${S} ms), --t-ease; description delayed 40% (${S * 0.4} ms).`,
    reduced: NO_SLOW, off: INSTANT,
    graph: { ease: EASE, ms: S, delay: S * 0.4, frames: [[0, 16], [1, 0]], label: 'text translateY px' },
  },
  {
    id: 'datepicker-zoom', comps: 'TDatePicker', name: 'View switch zoom',
    what: 'After switching day/month/year view the new grid grows from 90% and fades in. Properties: opacity, transform.',
    timing: `--t-duration-slow (${S} ms), --t-ease.`,
    reduced: NO_SLOW, off: INSTANT,
    graph: { ease: EASE, ms: S, frames: [[0, 0.9], [1, 1]], label: 'scale' },
  },
  {
    id: 'logpane-flash', comps: 'TLogPane', name: 'New line flash',
    what: 'Lines added after mount flash an accent background that fades out. Property: opacity of an accent overlay (::after, composited).',
    timing: '1s × --t-motion-scale, ease-out.',
    reduced: 'Same (opacity only).', off: 'No flash.',
    graph: { ease: 'ease-out', ms: 1000, frames: [[0, 28], [1, 0]], label: 'accent %' },
  },
  {
    id: 'logpane-edge', comps: 'TLogPane', name: 'Scroll edge fade',
    what: 'Once scrolled, a gradient fades in over the top edge. Property: opacity.',
    timing: `--t-duration (${D} ms), --t-ease.`,
    reduced: 'Same (opacity only).', off: INSTANT,
    graph: { ease: EASE, ms: D, label: 'opacity' },
  },
  {
    id: 'logview-flash', comps: 'TLogView', name: 'New line flash',
    what: 'Appended CodeMirror lines (up to 200) flash an accent background that fades out. Property: opacity of an accent overlay (::after, composited).',
    timing: '1s × --t-motion-scale, ease-out.',
    reduced: 'Same (opacity only).', off: 'No flash.',
    graph: { ease: 'ease-out', ms: 1000, frames: [[0, 28], [1, 0]], label: 'accent %' },
  },
  {
    id: 'crumbs-rise', comps: 'TPathCrumbs', name: 'File name rise',
    what: 'On path change the file name rises 4px and fades in; the old name is removed at once. Properties: opacity, transform.',
    timing: `--t-duration (${D} ms), --t-ease.`,
    reduced: 'Fade only.', off: INSTANT,
    graph: { ease: EASE, ms: D, frames: [[0, 4], [1, 0]], label: 'translateY px' },
  },
  {
    id: 'sidebar-expand', comps: 'TSidebar', name: 'Expand: clip reveal + label stagger',
    what: 'The panel keeps its expanded width and clip-path reveals it; the border and the edge handle follow with transform (the handle turns › → ‹), the in-flow spacer snaps once at the start. Labels fade in and slide 8px, one row after another; group dividers shrink away (scaleX). Properties: clip-path, transform, opacity.',
    timing: `reveal, slide: --t-duration-slow (${S} ms), --t-ease; labels: opacity --t-duration (${D} ms), delay (${S * 0.25} ms + 25 ms × row) × --t-motion-move.`,
    reduced: 'Opens at once; labels only fade (no slide, no stagger).', off: INSTANT,
    graph: { ease: EASE, ms: S, label: 'reveal' },
  },
  {
    id: 'sidebar-collapse', comps: 'TSidebar', name: 'Collapse: clip hide',
    what: 'Labels fade out at once while clip-path hides the panel down to the rail (rows become chips) and the border follows with transform; the spacer snaps at the end, so the content moves once. Properties: clip-path, transform, opacity.',
    timing: `hide: --t-duration-slow (${S} ms), --t-ease; labels: --t-duration (${D} ms); spacer snap delayed by --t-duration-slow.`,
    reduced: 'Collapses at once; labels fade.', off: INSTANT,
    graph: { ease: EASE, ms: S, frames: [[0, 1], [1, 0]], label: 'reveal' },
  },
  {
    id: 'sidebar-card', comps: 'TSidebar', name: 'Active card slide',
    what: 'One shared surface card slides to the newly active row (offset measured once per change). Property: transform (translateY).',
    timing: `--t-duration-slow (${S} ms), --t-ease-spring.`,
    reduced: 'Jumps (no slide).', off: INSTANT,
    graph: { ease: SPRING, ms: S, label: 'position' },
  },
  {
    id: 'sidebar-peek', comps: 'TSidebar (expandMode="peek")', name: 'Hover peek',
    what: 'After 300 ms of hover (or at once on keyboard focus) the collapsed panel is revealed over the content with a shadow; the content does not move. Labels stagger in as on expand. The pin keeps it open. Properties: clip-path, transform, opacity.',
    timing: `300 ms intent delay, then --t-duration-slow (${S} ms), --t-ease.`,
    reduced: 'Opens at once after the delay; labels only fade.', off: 'Instant after the delay.',
    graph: { ease: EASE, ms: S, delay: 300, label: 'reveal' },
  },
]

/* Measurements (scripts/measure-motion.mjs). */
interface Metrics { frames: number, dropped: number, worstGap: number, mainMs: number, compMs: number, layout: number, paint: number, composited: string }
interface Measurements { date?: string, chrome?: string, rates?: number[], runs?: number, viewport?: string, results?: Record<string, Record<string, Metrics>> }
const m = measurements as Measurements
const rates = m.rates ?? []
const BAD_GAP = 50
const metricRows: { key: keyof Metrics, label: string, unit?: string }[] = [
  { key: 'frames', label: 'frames' },
  { key: 'dropped', label: 'dropped' },
  { key: 'worstGap', label: 'worst gap', unit: 'ms' },
  { key: 'mainMs', label: 'main thread', unit: 'ms' },
  { key: 'compMs', label: 'compositor', unit: 'ms' },
  { key: 'layout', label: 'layouts' },
  { key: 'paint', label: 'paints' },
  { key: 'composited', label: 'composited' },
]
const isBad = (r?: Record<string, Metrics>) => !!r && rates.some((x) => (r[x]?.worstGap ?? 0) > BAD_GAP)

/* ---------- Demo state ---------- */
const saving = ref(false)
const enabled = ref(false)
const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']
const selected = ref<string | null>(null)
const { confirm } = useDialog()
const notifications = useNotifications()

const tab = ref('one')
const tabs = [{ value: 'one', label: 'One' }, { value: 'two', label: 'Two' }, { value: 'three', label: 'Three' }]
const groupOptions = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }, { value: 'c', label: 'Gamma' }]
const group = ref<string | number | null>('a')
function nextGroup() {
  const i = groupOptions.findIndex((o) => o.value === group.value)
  group.value = groupOptions[(i + 1) % groupOptions.length].value
}

const checked = ref(false)
const pressChecked = ref(false)
const inputErr = ref(false)
const fieldErr = ref(false)
const adorned = ref('')
const focusText = ref('')
const note = ref('')

interface Row { id: number, name: string, qty: number }
const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'qty', label: 'Qty', sortable: true, align: 'right' as const },
]
const baseRows = (): Row[] => [{ id: 1, name: 'Bolt', qty: 40 }, { id: 2, name: 'Nut', qty: 12 }]
const rows = ref<Row[]>(baseRows())
let rowId = 2
function addRow() {
  rowId++
  rows.value = [{ id: rowId, name: `Item ${rowId}`, qty: rowId * 7 }, ...rows.value]
}
const sortRows = ref<Row[]>(baseRows())
const sort = ref<TTableSort | null>(null)
const selRows = ref<Row[]>(baseRows())
const selection = ref<(string | number)[]>([])
const toggleSelection = () => { selection.value = selection.value.length ? [] : [1] }
const loadRows = ref<Row[]>([])
const tableLoading = ref(false)

const count = ref(3)
const dotKey = ref(0)
const tagVariants = ['gray', 'blue', 'green', 'orange', 'red'] as const
const tagIdx = ref(0)
const emptyKey = ref(0)
const date = ref<Date | null>(new Date())

const lines = ref<TLogLine[]>(Array.from({ length: 12 }, (_, i) => ({ id: i, text: `line ${i}` })))
function addLine() {
  const id = lines.value.length
  lines.value = [...lines.value, { id, text: `line ${id}`, kind: id % 5 === 0 ? 'err' : 'out' }]
}
const logText = ref(Array.from({ length: 6 }, (_, i) => `2026-11-04 10:00:0${i} INFO line ${i}`).join('\n'))
function addLogText() {
  const n = logText.value.split('\n').length
  logText.value += `\n2026-11-04 10:00:${String(n).padStart(2, '0')} INFO line ${n}`
}
/* v-model:collapsed of the expand row (starts collapsed) and the collapse row (starts expanded). */
const sbExpandRow = ref(true)
const sbCollapseRow = ref(false)
const sbCardIdx = ref(0)
const sbItems = [
  { route: '/components/sb-dash', title: 'Dashboard', icon: 'material-symbols-light:dashboard-outline', group: 'Main', activeRoutes: ['/animations'] },
  { route: '/components/sb-inbox', title: 'Inbox', icon: 'material-symbols-light:inbox-outline', group: 'Main' },
  { route: '/components/sb-reports', title: 'Reports', icon: 'material-symbols-light:bar-chart', group: 'Workspace' },
  { route: '/components/sb-settings', title: 'Settings', icon: 'material-symbols-light:settings-outline', group: 'Workspace' },
]
/* Card row: the active item (activeRoutes = this page) moves on each click. */
const sbCardItems = computed(() => sbItems.map((it, i) => ({ ...it, activeRoutes: i === sbCardIdx.value ? ['/animations'] : undefined })))
const paths = ['src/components/TButton.vue', 'src/components/TInput.vue', 'src/styles/tokens.css']
const pathIdx = ref(0)
</script>

<template>
  <div class="page">
    <header class="page-head">
      <h1 class="page-head__title">
        Animations
      </h1>
      <span class="page-head__meta">{{ anims.length }} component animations of the motion architecture (MOTION.md); older motion such as TLoadingOverlay, TSwitch, TBottomNav and TCollapseTransition is not covered</span>
      <div class="page-head__motion">
        <span>data-t-motion</span>
        <TButtonGroup
          v-model="motion"
          :options="motionOptions"
          size="small"
          mandatory
        />
      </div>
    </header>

    <p class="note">
      <template v-if="m.date">
        Measured {{ m.date }} with {{ m.chrome }}, headless, {{ m.viewport }}, CPU throttling {{ rates.map((r) => `${r}×`).join(' and ') }},
        median of {{ m.runs }} runs, motion level full. Window: from the trigger to the end of the animation (infinite ones: 1.2 s).
        Headless Chrome renders in software: this is not a real device; compare rows with each other, not with a phone.
        <br>Frames / dropped / worst gap: rAF frames in the window, frames missed against 60 Hz, longest gap between frames
        (over {{ BAD_GAP }} ms is highlighted). Main thread / compositor: busy time of the page's renderer threads. Layouts / paints: event counts for the whole page, so compositor-only animations still show paints (e.g. the trigger's own state change).
        Composited: the row's own animations ran on the compositor. Idle baseline (1 s, only the rAF probe):
        {{ rates.map((r) => `${m.results?.idle?.[r]?.mainMs} ms main at ${r}×`).join(', ') }}.
        Re-run: <code>npm run measure:motion</code>.
      </template>
      <template v-else>
        No measurements yet. Run <code>npm run measure:motion</code>.
      </template>
    </p>

    <ul class="list">
      <li
        v-for="a in anims"
        :key="a.id"
        class="item"
        :class="{ 'item--bad': isBad(m.results?.[a.id]) }"
        :data-anim="a.id"
      >
        <div class="item__head">
          <code>{{ a.comps }}</code>
          <strong>{{ a.name }}</strong>
        </div>

        <div class="item__demo">
          <template v-if="a.id === 'button-press' || a.id === 'button-ripple'">
            <TButton
              label="Press me"
              variant="accent"
            />
          </template>
          <template v-else-if="a.id === 'button-hover'">
            <TButton label="Hover me" />
          </template>
          <template v-else-if="a.id === 'button-loading'">
            <TButton
              :class="{ 'is-loading': saving }"
              :label="saving ? 'Saving…' : 'Save'"
              variant="accent"
            />
            <button
              class="ctl"
              data-m
              @click="saving = !saving"
            >
              Toggle loading
            </button>
          </template>
          <template v-else-if="a.id === 'button-shine'">
            <TButton
              :disabled="!enabled"
              label="Shine"
            />
            <button
              class="ctl"
              data-m
              @click="enabled = !enabled"
            >
              {{ enabled ? 'Disable' : 'Enable' }}
            </button>
          </template>
          <template v-else-if="a.id === 'focus-thicken'">
            <button
              class="ctl"
              data-m
            >
              Focus here, press Tab
            </button>
            <TButton label="Focus target" />
          </template>
          <template v-else-if="a.id === 'dropdown-open'">
            <TDropdown>
              <template #trigger="{ triggerProps }">
                <button
                  class="ctl"
                  data-m
                  v-bind="triggerProps"
                >
                  Dropdown
                </button>
              </template>
              <div class="menu">
                <div
                  v-for="f in fruits"
                  :key="f"
                  class="menu__item"
                >
                  {{ f }}
                </div>
              </div>
            </TDropdown>
          </template>
          <template v-else-if="a.id === 'select-cascade'">
            <TSelect
              v-model="selected"
              :options="fruits"
              placeholder="Select"
            />
          </template>
          <template v-else-if="a.id === 'modal-zoom'">
            <button
              class="ctl"
              data-m
              @click="confirm({ title: 'Zoom', message: 'Opens from the button.' })"
            >
              Open dialog
            </button>
          </template>
          <template v-else-if="a.id === 'notify-slide' || a.id === 'notify-timer'">
            <button
              class="ctl"
              data-m
              @click="notifications.push('success', 'Saved', 4000)"
            >
              Notify
            </button>
          </template>
          <template v-else-if="a.id === 'tabs-line'">
            <TTabs
              v-model="tab"
              :tabs="tabs"
            />
          </template>
          <template v-else-if="a.id === 'group-pill'">
            <TButtonGroup
              v-model="group"
              :options="groupOptions"
              mandatory
            />
            <button
              class="ctl"
              data-m
              @click="nextGroup"
            >
              Next
            </button>
          </template>
          <template v-else-if="a.id === 'checkbox-press'">
            <TCheckbox
              v-model="pressChecked"
              label="Press and hold"
            />
          </template>
          <template v-else-if="a.id === 'checkbox-mark'">
            <TCheckbox
              v-model="checked"
              label="Checked"
            />
            <button
              class="ctl"
              data-m
              @click="checked = !checked"
            >
              Toggle
            </button>
          </template>
          <template v-else-if="a.id === 'input-focus'">
            <TInput
              v-model="focusText"
              placeholder="Click to focus"
            />
          </template>
          <template v-else-if="a.id === 'textarea-focus'">
            <TTextarea
              v-model="note"
              placeholder="Click to focus"
              :rows="2"
            />
          </template>
          <template v-else-if="a.id === 'input-error'">
            <TInput
              model-value=""
              placeholder="Error ring"
              :error="inputErr"
            />
            <button
              class="ctl"
              data-m
              @click="inputErr = !inputErr"
            >
              Toggle error
            </button>
          </template>
          <template v-else-if="a.id === 'field-shake'">
            <TFormField
              label="Field"
              :error="fieldErr ? 'Required' : undefined"
            >
              <TInput model-value="" />
            </TFormField>
            <button
              class="ctl"
              data-m
              @click="fieldErr = !fieldErr"
            >
              Toggle error
            </button>
          </template>
          <template v-else-if="a.id === 'input-adornment'">
            <TInput
              v-model="adorned"
              placeholder="Type 3+ chars"
              clearable
              :suffix-icon="adorned.length >= 3 ? 'material-symbols-light:check' : undefined"
            />
            <button
              class="ctl"
              data-m
              @click="adorned = adorned ? '' : 'abc'"
            >
              {{ adorned ? 'Clear' : 'Fill' }}
            </button>
          </template>
          <template v-else-if="a.id === 'table-new-row'">
            <button
              class="ctl"
              data-m
              @click="addRow"
            >
              Add row
            </button>
            <TTable
              :columns="columns"
              :rows="rows"
              row-key="id"
            />
          </template>
          <template v-else-if="a.id === 'table-select'">
            <button
              class="ctl"
              data-m
              @click="toggleSelection"
            >
              Toggle row 1
            </button>
            <TTable
              v-model:selection="selection"
              :columns="columns"
              :rows="selRows"
              row-key="id"
              selectable
            />
          </template>
          <template v-else-if="a.id === 'table-sort'">
            <TTable
              v-model:sort="sort"
              :columns="columns"
              :rows="sortRows"
              row-key="id"
              client-side-sort
            />
          </template>
          <template v-else-if="a.id === 'table-loading'">
            <button
              class="ctl"
              data-m
              @click="tableLoading = !tableLoading"
            >
              Toggle loading
            </button>
            <TTable
              :columns="columns"
              :rows="loadRows"
              row-key="id"
              :loading="tableLoading"
            />
          </template>
          <template v-else-if="a.id === 'badge-ring'">
            <TBadge :value="count">
              <TButton label="Inbox" />
            </TBadge>
            <button
              class="ctl"
              data-m
              @click="count++"
            >
              +1
            </button>
          </template>
          <template v-else-if="a.id === 'badge-dot'">
            <TBadge
              :key="dotKey"
              dot
            >
              <TButton label="Dot" />
            </TBadge>
            <button
              class="ctl"
              data-m
              @click="dotKey++"
            >
              Replay
            </button>
          </template>
          <template v-else-if="a.id === 'tag-pop'">
            <TTag
              :variant="tagVariants[tagIdx]"
              :label="tagVariants[tagIdx]"
            />
            <button
              class="ctl"
              data-m
              @click="tagIdx = (tagIdx + 1) % tagVariants.length"
            >
              Change variant
            </button>
          </template>
          <template v-else-if="a.id === 'copy-bubble'">
            <TCopyChip value="npm i @vitaliysimkin/t-components" />
          </template>
          <template v-else-if="a.id === 'card-target'">
            <a
              href="#anim-card"
              data-m
            >Go to #anim-card</a>
            <TCard
              id="anim-card"
              header="Target"
            >
              Flashes when navigated to.
            </TCard>
          </template>
          <template v-else-if="a.id === 'empty-cascade'">
            <TEmpty
              :key="emptyKey"
              description="Nothing here yet"
            />
            <button
              class="ctl"
              data-m
              @click="emptyKey++"
            >
              Replay
            </button>
          </template>
          <template v-else-if="a.id === 'datepicker-zoom'">
            <TDatePicker v-model="date" />
          </template>
          <template v-else-if="a.id === 'logpane-flash' || a.id === 'logpane-edge'">
            <button
              v-if="a.id === 'logpane-flash'"
              class="ctl"
              data-m
              @click="addLine"
            >
              Add line
            </button>
            <TLogPane
              :lines="lines"
              height="120px"
            />
          </template>
          <template v-else-if="a.id === 'logview-flash'">
            <button
              class="ctl"
              data-m
              @click="addLogText"
            >
              Add line
            </button>
            <TLogView
              :text="logText"
              height="120px"
            />
          </template>
          <template v-else-if="a.id === 'crumbs-rise'">
            <TPathCrumbs :path="paths[pathIdx]" />
            <button
              class="ctl"
              data-m
              @click="pathIdx = (pathIdx + 1) % paths.length"
            >
              Change path
            </button>
          </template>
          <template v-else-if="a.id === 'sidebar-expand' || a.id === 'sidebar-collapse'">
            <div
              class="sb-demo"
              @click.capture.prevent
            >
              <TSidebar
                v-if="a.id === 'sidebar-expand'"
                v-model:collapsed="sbExpandRow"
                :menu-items="sbItems"
                header-icon="material-symbols-light:widgets-outline"
                header-label="Acme"
                nested
              />
              <TSidebar
                v-else
                v-model:collapsed="sbCollapseRow"
                :menu-items="sbItems"
                header-icon="material-symbols-light:widgets-outline"
                header-label="Acme"
                nested
              />
            </div>
            <button
              class="ctl"
              data-m
              @click="a.id === 'sidebar-expand' ? (sbExpandRow = !sbExpandRow) : (sbCollapseRow = !sbCollapseRow)"
            >
              Toggle
            </button>
          </template>
          <template v-else-if="a.id === 'sidebar-card'">
            <div
              class="sb-demo"
              @click.capture.prevent
            >
              <TSidebar
                :collapsed="false"
                :menu-items="sbCardItems"
                header-icon="material-symbols-light:widgets-outline"
                header-label="Acme"
                nested
              />
            </div>
            <button
              class="ctl"
              data-m
              @click="sbCardIdx = (sbCardIdx + 1) % 4"
            >
              Next active
            </button>
          </template>
          <template v-else-if="a.id === 'sidebar-peek'">
            <div
              class="sb-demo"
              @click.capture.prevent
            >
              <TSidebar
                :menu-items="sbItems"
                header-icon="material-symbols-light:widgets-outline"
                header-label="Acme"
                expand-mode="peek"
                nested
              />
            </div>
          </template>
        </div>

        <dl class="item__desc">
          <dt>What</dt><dd>{{ a.what }}</dd>
          <dt>Timing</dt><dd>{{ a.timing }}</dd>
          <dt>Reduced</dt><dd>{{ a.reduced }}</dd>
          <dt>Off</dt><dd>{{ a.off }}</dd>
        </dl>

        <EasingGraph
          v-if="a.graph"
          v-bind="a.graph"
          class="item__graph"
        />

        <table
          v-if="m.results?.[a.id]"
          class="perf"
        >
          <thead>
            <tr>
              <th />
              <th
                v-for="r in rates"
                :key="r"
              >
                {{ r }}× CPU
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in metricRows"
              :key="row.key"
            >
              <th>{{ row.label }}</th>
              <td
                v-for="r in rates"
                :key="r"
                :class="{ bad: row.key === 'worstGap' && (m.results[a.id][r]?.worstGap ?? 0) > BAD_GAP }"
              >
                {{ m.results[a.id][r]?.[row.key] ?? '—' }}{{ row.unit && m.results[a.id][r] ? ` ${row.unit}` : '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-4);
  padding: var(--t-space-5) var(--t-space-6) var(--t-space-7);
  max-width: 1280px;
}

.page-head {
  display: flex;
  align-items: baseline;
  gap: var(--t-space-3);
  flex-wrap: wrap;
}

.page-head__title {
  margin: 0;
  font-size: var(--t-font-size-h1);
  font-weight: var(--t-font-weight-semibold);
  line-height: var(--t-line-height-tight);
}

.page-head__meta,
.note {
  color: var(--t-color-text-muted);
  font-size: var(--t-font-size-small);
}

.note {
  margin: 0;
}

.page-head__motion {
  display: flex;
  align-items: center;
  gap: var(--t-space-2);
  margin-left: auto;
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--t-color-border);
}

.item {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 150px 210px;
  grid-template-areas:
    'head head head head'
    'demo desc graph perf';
  gap: var(--t-space-2) var(--t-space-4);
  padding: var(--t-space-4) 0;
  border-bottom: 1px solid var(--t-color-border);
}

.item--bad {
  box-shadow: inset 3px 0 0 var(--t-color-danger);
  padding-left: var(--t-space-3);
}

.item__head { grid-area: head; display: flex; gap: var(--t-space-3); align-items: baseline; }
.item__demo { grid-area: demo; display: flex; flex-direction: column; align-items: flex-start; gap: var(--t-space-2); min-width: 0; }
.item__demo > * { max-width: 100%; }
.item__desc { grid-area: desc; }
.item__graph { grid-area: graph; }
.perf { grid-area: perf; }

.item__desc {
  margin: 0;
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 2px var(--t-space-3);
  font-size: var(--t-font-size-small);
}

.item__desc dt {
  color: var(--t-color-text-muted);
}

.item__desc dd {
  margin: 0;
}

.perf {
  border-collapse: collapse;
  font-size: var(--t-font-size-mini);
  font-variant-numeric: tabular-nums;
  align-self: start;
}

.perf th,
.perf td {
  padding: 1px var(--t-space-2);
  text-align: right;
  white-space: nowrap;
}

.perf tbody th {
  text-align: left;
  font-weight: normal;
  color: var(--t-color-text-muted);
}

.perf .bad {
  color: var(--t-color-danger);
  font-weight: var(--t-font-weight-semibold);
}

.ctl {
  font: inherit;
  font-size: var(--t-font-size-small);
  padding: 2px var(--t-space-2);
  border: 1px dashed var(--t-color-border);
  border-radius: var(--t-radius-small);
  background: transparent;
  color: var(--t-color-text-muted);
  cursor: pointer;
}

.sb-demo {
  display: flex;
  width: 260px;
  height: 280px;
  overflow: hidden;
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-medium);
}
.sb-demo :deep(.t-sidebar) { height: 100%; }
.menu {
  min-width: 160px;
  padding: var(--t-space-1);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-medium);
  background: var(--t-color-surface);
}

.menu__item {
  padding: var(--t-space-2) var(--t-space-3);
  border-radius: var(--t-radius-default);
  cursor: pointer;
}

.menu__item:hover {
  background: var(--t-color-hover);
}

@media (max-width: 1000px) {
  .item {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'head head'
      'demo demo'
      'desc desc'
      'graph perf';
  }
}
</style>
