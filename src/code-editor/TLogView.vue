<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { EditorView } from '@codemirror/view'
import TCodeEditor from '../components/TCodeEditor.vue'
import TInput from '../components/TInput.vue'
import TButton from '../components/TButton.vue'
import TCheckbox from '../components/TCheckbox.vue'
import {
  buildSearchRegExp, filterMatchingLines, findMatches, logViewExtension, setLogFormat, setLogSearch,
  type LogFormat, type LogSearchState,
} from './logView'

export interface TLogViewProps {
  text: string
  format?: LogFormat
  /** CSS height, or `fill` — take the parent's full height */
  height?: string
  searchPlaceholder?: string
  searchLabel?: string
  caseLabel?: string
  regexLabel?: string
  wordLabel?: string
  prevLabel?: string
  nextLabel?: string
  onlyMatchesLabel?: string
  noMatchesText?: string
  countText?: string
}

const props = withDefaults(defineProps<TLogViewProps>(), {
  format: 'auto',
  height: '400px',
  searchPlaceholder: 'Find (Ctrl+F)',
  searchLabel: 'Find in log',
  caseLabel: 'Match case',
  regexLabel: 'Regular expression',
  wordLabel: 'Whole word',
  prevLabel: 'Previous match (Shift+Enter)',
  nextLabel: 'Next match (Enter)',
  onlyMatchesLabel: 'Only matching lines',
  noMatchesText: 'No matches',
  countText: '{current} of {total}',
})

const SEARCH_DEBOUNCE_MS = 200
const MAX_MATCH_POSITIONS = 100_000

const editor = ref<InstanceType<typeof TCodeEditor>>()
const searchWrap = ref<HTMLElement>()
const query = ref('')
const caseSensitive = ref(false)
const regexMode = ref(false)
const wholeWord = ref(false)
const onlyMatches = ref(false)
const searchError = ref<string | null>(null)
const activeRe = shallowRef<RegExp | null>(null)
const matches = shallowRef<{ from: number; to: number }[]>([])
const totalMatches = ref(0)
const current = ref(-1)

const view = () => editor.value?.view ?? null

function searchState(): LogSearchState {
  return { re: activeRe.value, current: matches.value[current.value] ?? null }
}

const extension = logViewExtension({
  initialFormat: () => props.format,
  initialSearch: searchState,
  onFind: focusSearch,
})

const shown = computed(() => (onlyMatches.value && activeRe.value ? filterMatchingLines(props.text, activeRe.value) : props.text))

let debounce: ReturnType<typeof setTimeout> | undefined
function applyQuery() {
  clearTimeout(debounce)
  debounce = undefined
  const { re, error } = buildSearchRegExp({ text: query.value, caseSensitive: caseSensitive.value, regex: regexMode.value, wholeWord: wholeWord.value })
  searchError.value = error
  activeRe.value = re
}
watch([query, caseSensitive, regexMode, wholeWord], () => {
  clearTimeout(debounce)
  debounce = setTimeout(applyQuery, SEARCH_DEBOUNCE_MS)
})
onBeforeUnmount(() => clearTimeout(debounce))

watch([activeRe, shown], async () => {
  const re = activeRe.value
  const res = re ? findMatches(shown.value, re, MAX_MATCH_POSITIONS) : { positions: [], total: 0 }
  matches.value = res.positions
  totalMatches.value = res.total
  const top = view()?.viewport.from ?? 0
  const idx = res.positions.findIndex((m) => m.from >= top)
  current.value = res.positions.length ? Math.max(idx, 0) : -1
  await nextTick()
  reveal()
})

watch(() => props.format, (f) => view()?.dispatch({ effects: setLogFormat.of(f) }))

/** Pass the search state to the editor; select and scroll to the current match. */
function reveal() {
  const v = view()
  if (!v) return
  const m = matches.value[current.value]
  if (m && m.to <= v.state.doc.length) {
    v.dispatch({
      selection: { anchor: m.from, head: m.to },
      effects: [setLogSearch.of(searchState()), EditorView.scrollIntoView(m.from, { y: 'center' })],
    })
  } else {
    v.dispatch({ effects: setLogSearch.of({ re: activeRe.value, current: null }) })
  }
}

function go(delta: number) {
  if (debounce) applyQuery()
  const n = matches.value.length
  if (!n) return
  current.value = ((current.value < 0 ? (delta > 0 ? -1 : 0) : current.value) + delta + n) % n
  reveal()
}

function onSearchKey(ev: KeyboardEvent) {
  if (ev.key !== 'Enter') return
  ev.preventDefault()
  go(ev.shiftKey ? -1 : 1)
}

function focusSearch() {
  const input = searchWrap.value?.querySelector('input')
  input?.focus()
  input?.select()
}

function onKey(ev: KeyboardEvent) {
  if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && !ev.shiftKey && ev.key.toLowerCase() === 'f') {
    ev.preventDefault()
    focusSearch()
  }
}

const countLabel = computed(() => {
  if (!activeRe.value) return ''
  if (!totalMatches.value) return props.noMatchesText
  return props.countText.replace('{current}', String(current.value + 1)).replace('{total}', String(totalMatches.value))
})
</script>

<template>
  <div
    class="t-log-view"
    :class="{ 't-log-view--fill': height === 'fill' }"
    @keydown="onKey"
  >
    <div
      class="t-log-view__search"
      role="search"
    >
      <span
        ref="searchWrap"
        class="t-log-view__query"
        @keydown="onSearchKey"
      >
        <TInput
          v-model="query"
          size="small"
          :placeholder="searchPlaceholder"
          :aria-label="searchLabel"
          clearable
        />
      </span>
      <TButton
        v-for="t in [
          { label: 'Aa', title: caseLabel, on: caseSensitive, toggle: () => (caseSensitive = !caseSensitive) },
          { label: '.*', title: regexLabel, on: regexMode, toggle: () => (regexMode = !regexMode) },
          { label: 'ab', title: wordLabel, on: wholeWord, toggle: () => (wholeWord = !wholeWord) },
        ]"
        :key="t.label"
        type="button"
        mode="plain"
        size="small"
        :variant="t.on ? 'accent' : 'neutral'"
        :label="t.label"
        :title="t.title"
        :aria-label="t.title"
        :aria-pressed="t.on"
        @click="t.toggle"
      />
      <TButton
        type="button"
        mode="ghost"
        size="small"
        icon="ticon:arrow-up"
        :title="prevLabel"
        :aria-label="prevLabel"
        :disabled="!matches.length"
        @click="go(-1)"
      />
      <TButton
        type="button"
        mode="ghost"
        size="small"
        icon="ticon:arrow-down"
        :title="nextLabel"
        :aria-label="nextLabel"
        :disabled="!matches.length"
        @click="go(1)"
      />
      <span class="t-log-view__count">{{ countLabel }}</span>
      <TCheckbox
        v-model="onlyMatches"
        class="t-log-view__only"
        size="small"
        :label="onlyMatchesLabel"
      />
    </div>
    <p
      v-if="searchError"
      class="t-log-view__error"
    >
      {{ searchError }}
    </p>
    <TCodeEditor
      ref="editor"
      class="t-log-view__editor"
      :model-value="shown"
      language="text"
      :custom-language-extension="extension"
      readonly
      :height="height"
    />
  </div>
</template>

<style scoped>
.t-log-view {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-1);
}

.t-log-view--fill {
  height: 100%;
  min-height: 0;
}

.t-log-view__search {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--t-space-1);
}

.t-log-view__query {
  width: 280px;
  max-width: 100%;
}

.t-log-view__count {
  font-size: var(--t-font-size-mini);
  color: var(--t-color-text-muted);
  white-space: nowrap;
}

.t-log-view__only {
  margin-left: auto;
}

.t-log-view__error {
  margin: 0;
  font-size: var(--t-font-size-mini);
  color: var(--t-color-danger);
}

.t-log-view__editor :deep(.lx-t),
.t-log-view__editor :deep(.lx-u) { color: var(--t-color-text-muted); }
.t-log-view__editor :deep(.lx-th) { color: var(--t-color-text-muted); opacity: .8; }
.t-log-view__editor :deep(.lx-lv) { font-weight: 600; color: var(--t-color-accent); }
.t-log-view__editor :deep(.lx-lv-WARN),
.t-log-view__editor :deep(.lx-lv-WARNING) { color: var(--t-color-warning); }
.t-log-view__editor :deep(.lx-lv-ERROR),
.t-log-view__editor :deep(.lx-lv-FATAL) { color: var(--t-color-danger); }
.t-log-view__editor :deep(.lx-lv-DEBUG),
.t-log-view__editor :deep(.lx-lv-TRACE) { color: var(--t-color-text-muted); }
.t-log-view__editor :deep(.lx-lg) { color: var(--t-color-tag-blue); }
.t-log-view__editor :deep(.lx-m) { color: var(--t-color-tag-teal); }
.t-log-view__editor :deep(.lx-s) { color: var(--t-color-tag-orange); }
.t-log-view__editor :deep(.cm-line.lx-cont) { color: var(--t-color-text-muted); box-shadow: inset 2px 0 0 var(--t-color-border-strong); }
.t-log-view__editor :deep(.lx-hit) { background: var(--t-color-tag-yellow-bg); border-radius: var(--t-radius-mini); }
.t-log-view__editor :deep(.lx-hit.lx-cur) { background: var(--t-color-warning-plain-bg); outline: 1px solid var(--t-color-warning); }
</style>
