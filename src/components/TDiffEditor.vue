<template>
  <div
    ref="containerRef"
    class="diff-editor"
    :class="{ 'diff-editor--vertical': orientation === 'vertical' }"
    :style="containerStyle"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, type CSSProperties } from 'vue'
import type { Extension } from '@codemirror/state'
import type { MergeView as MergeViewT } from '@codemirror/merge'
import { useTheme } from '../composables/useTheme'
import { loadLanguage, type CodeLanguage } from './code-language'

export interface TDiffEditorProps {
  /** Editable side content (v-model) */
  modelValue: string
  /** Read-only (original/left) side content */
  original: string
  /** Built-in language (ignored when customLanguageExtension is set) */
  language?: CodeLanguage
  /** Any CodeMirror language extension, e.g. from @codemirror/lang-xml */
  customLanguageExtension?: Extension
  /** Sides next to each other (default) or one above the other */
  orientation?: 'horizontal' | 'vertical'
  /** Original side is read-only (default true); false — editable via v-model:original */
  readonlyOriginal?: boolean
  /** Label above the original side */
  originalLabel?: string
  /** Label above the modified side */
  modifiedLabel?: string
  /** CSS height of the diff editor container */
  height?: string
  /** CSS max-height of the diff editor container */
  maxHeight?: string
  /** Make the modified (right) side read-only too */
  readonly?: boolean
  /** Enable line wrapping in both editors */
  lineWrapping?: boolean
}

const props = withDefaults(defineProps<TDiffEditorProps>(), { readonlyOriginal: true })

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:original', value: string): void
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
let showPanel: typeof import('@codemirror/view').showPanel | null = null
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
let aReadonlyCompartment: InstanceType<CompartmentCtor> | null = null
let aLabelCompartment: InstanceType<CompartmentCtor> | null = null
let bLabelCompartment: InstanceType<CompartmentCtor> | null = null

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
  showPanel = viewMod.showPanel
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

function makeLabelExt(text: string | undefined): Extension {
  if (!text || !showPanel) return []
  return showPanel.of(() => {
    const dom = document.createElement('div')
    dom.className = 'diff-editor__label'
    dom.textContent = text
    return { dom, top: true }
  })
}

function loadLanguageExt(): Promise<Extension> | Extension {
  return props.customLanguageExtension ?? loadLanguage(props.language)
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
    aReadonlyCompartment = new Compartment()
    aLabelCompartment = new Compartment()
    bLabelCompartment = new Compartment()

    const [themeExt, langExt] = await Promise.all([loadThemeExtension(), loadLanguageExt()])
    if (destroyed) return

    const wrapExt: Extension = props.lineWrapping ? EditorView.lineWrapping : []

    const originalExtensions: Extension[] = [
      basicSetup,
      wrapExt,
      aReadonlyCompartment.of(makeReadonlyExt(props.readonlyOriginal)),
      aLangCompartment.of(langExt),
      aThemeCompartment.of(themeExt),
      aLabelCompartment.of(makeLabelExt(props.originalLabel)),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          emit('update:original', update.state.doc.toString())
        }
      }),
    ]

    const modifiedExtensions: Extension[] = [
      basicSetup,
      wrapExt,
      readonlyCompartment.of(makeReadonlyExt(!!props.readonly)),
      bLangCompartment.of(langExt),
      bThemeCompartment.of(themeExt),
      bLabelCompartment.of(makeLabelExt(props.modifiedLabel)),
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
  const langExt = await loadLanguageExt()
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

async function applyReadonlyOriginal() {
  await ensureInitialized()
  if (!mergeView || !aReadonlyCompartment) return
  mergeView.a.dispatch({ effects: aReadonlyCompartment.reconfigure(makeReadonlyExt(props.readonlyOriginal)) })
}

async function applyLabels() {
  await ensureInitialized()
  if (!mergeView || !aLabelCompartment || !bLabelCompartment) return
  mergeView.a.dispatch({ effects: aLabelCompartment.reconfigure(makeLabelExt(props.originalLabel)) })
  mergeView.b.dispatch({ effects: bLabelCompartment.reconfigure(makeLabelExt(props.modifiedLabel)) })
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
watch(() => [props.customLanguageExtension, props.language], () => { applyLanguage() })
watch(() => props.readonly, () => { applyReadonly() })
watch(() => props.readonlyOriginal, () => { applyReadonlyOriginal() })
watch(() => [props.originalLabel, props.modifiedLabel], () => { applyLabels() })
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

.diff-editor--vertical :deep(.cm-mergeViewEditors) {
  flex-direction: column;
}

.diff-editor :deep(.diff-editor__label) {
  padding: var(--t-space-1) var(--t-space-2);
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
}
</style>
