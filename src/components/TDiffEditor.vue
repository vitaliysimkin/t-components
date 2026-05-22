<template>
  <div ref="containerRef" class="diff-editor" :style="containerStyle" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, type CSSProperties } from 'vue'
import type { Extension } from '@codemirror/state'
import type { MergeView as MergeViewT } from '@codemirror/merge'
import { useTheme } from '../composables/useTheme'

export interface TDiffEditorProps {
  /** Editable side content (v-model) */
  modelValue: string
  /** Read-only (original/left) side content */
  original: string
  /** Any CodeMirror language extension, e.g. from @codemirror/lang-xml */
  customLanguageExtension?: Extension
  /** CSS height of the diff editor container */
  height?: string
  /** CSS max-height of the diff editor container */
  maxHeight?: string
  /** Make the modified (right) side read-only too */
  readonly?: boolean
  /** Enable line wrapping in both editors */
  lineWrapping?: boolean
}

const props = defineProps<TDiffEditorProps>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const containerRef = ref<HTMLElement | null>(null)

const containerStyle = computed<CSSProperties>(() => ({
  height: props.height || 'auto',
  maxHeight: props.maxHeight,
}))

// --- theme tracking ---

const { currentTheme } = useTheme()
const systemDark = ref(
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
)
const media =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

const onSystemThemeChange = (e: MediaQueryListEvent) => {
  systemDark.value = e.matches
}

const isDark = computed(() =>
  currentTheme.value === 'dark' || (currentTheme.value === 'auto' && systemDark.value)
)

// --- lazy-loaded module references ---

type EditorViewCtor = typeof import('@codemirror/view').EditorView
type EditorStateCtor = typeof import('@codemirror/state').EditorState
type CompartmentCtor = typeof import('@codemirror/state').Compartment
type MergeViewCtor = typeof import('@codemirror/merge').MergeView

let EditorView: EditorViewCtor | null = null
let EditorState: EditorStateCtor | null = null
let Compartment: CompartmentCtor | null = null
let MergeViewClass: MergeViewCtor | null = null
let basicSetup: Extension | null = null

// Per-instance state
let destroyed = false
let mergeView: MergeViewT | null = null
let initPromise: Promise<void> | null = null

// Each editor side gets its own compartments so effects can be dispatched independently
let aThemeCompartment: InstanceType<CompartmentCtor> | null = null
let bThemeCompartment: InstanceType<CompartmentCtor> | null = null
let aLangCompartment: InstanceType<CompartmentCtor> | null = null
let bLangCompartment: InstanceType<CompartmentCtor> | null = null
let readonlyCompartment: InstanceType<CompartmentCtor> | null = null

// --- helpers ---

async function loadCore(): Promise<void> {
  if (EditorView && EditorState && Compartment && MergeViewClass && basicSetup) return

  const [viewMod, stateMod, coreMod, mergeMod] = await Promise.all([
    import('@codemirror/view'),
    import('@codemirror/state'),
    import('codemirror'),
    import('@codemirror/merge'),
  ])

  EditorView = viewMod.EditorView
  EditorState = stateMod.EditorState
  Compartment = stateMod.Compartment
  MergeViewClass = mergeMod.MergeView
  basicSetup = coreMod.basicSetup
}

async function loadThemeExtension(): Promise<Extension> {
  if (!isDark.value) return []
  const mod = await import('@codemirror/theme-one-dark')
  return mod.oneDark
}

function makeReadonlyExt(readonly: boolean): Extension {
  if (!EditorState) return []
  return EditorState.readOnly.of(readonly)
}

// --- initialization ---

async function ensureInitialized(): Promise<void> {
  if (initPromise) return initPromise

  initPromise = (async () => {
    await loadCore()
    if (destroyed) return

    const el = containerRef.value
    if (!el) return
    if (!EditorView || !EditorState || !Compartment || !MergeViewClass || !basicSetup) return

    aThemeCompartment = new Compartment()
    bThemeCompartment = new Compartment()
    aLangCompartment = new Compartment()
    bLangCompartment = new Compartment()
    readonlyCompartment = new Compartment()

    const themeExt = await loadThemeExtension()
    if (destroyed) return

    const langExt: Extension = props.customLanguageExtension ?? []
    const wrapExt: Extension = props.lineWrapping ? EditorView.lineWrapping : []

    const originalExtensions: Extension[] = [
      basicSetup,
      wrapExt,
      // Original side is always read-only
      EditorState.readOnly.of(true),
      aLangCompartment.of(langExt),
      aThemeCompartment.of(themeExt),
    ]

    const modifiedExtensions: Extension[] = [
      basicSetup,
      wrapExt,
      readonlyCompartment.of(makeReadonlyExt(!!props.readonly)),
      bLangCompartment.of(langExt),
      bThemeCompartment.of(themeExt),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          emit('update:modelValue', update.state.doc.toString())
        }
      }),
    ]

    mergeView = new MergeViewClass({
      parent: el,
      a: {
        doc: props.original || '',
        extensions: originalExtensions,
      },
      b: {
        doc: props.modelValue || '',
        extensions: modifiedExtensions,
      },
    })
  })()

  return initPromise
}

// --- reactive updates ---

async function applyTheme() {
  await ensureInitialized()
  if (!mergeView || !aThemeCompartment || !bThemeCompartment) return
  const themeExt = await loadThemeExtension()
  if (!mergeView) return
  mergeView.a.dispatch({ effects: aThemeCompartment.reconfigure(themeExt) })
  mergeView.b.dispatch({ effects: bThemeCompartment.reconfigure(themeExt) })
}

async function applyLanguage() {
  await ensureInitialized()
  if (!mergeView || !aLangCompartment || !bLangCompartment) return
  const langExt: Extension = props.customLanguageExtension ?? []
  if (!mergeView) return
  mergeView.a.dispatch({ effects: aLangCompartment.reconfigure(langExt) })
  mergeView.b.dispatch({ effects: bLangCompartment.reconfigure(langExt) })
}

async function applyReadonly() {
  await ensureInitialized()
  if (!mergeView || !readonlyCompartment) return
  mergeView.b.dispatch({
    effects: readonlyCompartment.reconfigure(makeReadonlyExt(!!props.readonly)),
  })
}

function applyDocValue(view: 'a' | 'b', newValue: string) {
  if (!mergeView) return
  const editorView = mergeView[view]
  const current = editorView.state.doc.toString()
  if ((newValue || '') !== current) {
    editorView.dispatch({
      changes: { from: 0, to: editorView.state.doc.length, insert: newValue || '' },
    })
  }
}

// --- lifecycle ---

onMounted(async () => {
  media?.addEventListener('change', onSystemThemeChange)
  await ensureInitialized()
})

onUnmounted(() => {
  destroyed = true
  media?.removeEventListener('change', onSystemThemeChange)
  mergeView?.destroy()
  mergeView = null
})

watch(isDark, () => { applyTheme() })
watch(() => props.customLanguageExtension, () => { applyLanguage() })
watch(() => props.readonly, () => { applyReadonly() })
watch(() => props.modelValue, (v) => { applyDocValue('b', v) })
watch(() => props.original, (v) => { applyDocValue('a', v) })
</script>

<style scoped>
.diff-editor {
  width: 100%;
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-default);
  overflow: auto;
}

.diff-editor :deep(.cm-editor) {
  font-size: 14px;
}

.diff-editor :deep(.cm-focused) {
  outline: none;
}

.diff-editor :deep(.cm-editor.cm-focused) {
  outline: none;
}

/* Allow MergeView to take full height when height prop is set */
.diff-editor :deep(.cm-mergeView) {
  min-height: 100%;
}

.diff-editor :deep(.cm-mergeViewEditor) {
  flex: 1;
  min-width: 0;
}
</style>
