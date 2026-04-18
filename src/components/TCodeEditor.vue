<template>
  <div class="code-editor">
    <label
      v-if="label"
      class="field-label"
    >{{ label }}</label>
    <div
      ref="editorRef"
      class="codemirror-container"
      :style="editorStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import type { Extension } from '@codemirror/state'
import type { EditorView as EditorViewT, ViewUpdate } from '@codemirror/view'
import type { EditorState as EditorStateT, Compartment as CompartmentT } from '@codemirror/state'
import { useTheme } from '../composables/useTheme'

type Language = 'json' | 'markdown' | 'text'
type ExtensionLike = Extension

const props = defineProps<{
  modelValue: string
  label?: string
  language?: Language
  customLanguageExtension?: ExtensionLike
  readonly?: boolean
  height?: string
  maxHeight?: string
  minHeight?: string
  lineWrapping?: boolean
  hideGutter?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editorRef = ref<HTMLElement | null>(null)

const editorStyle = computed(() => ({
  height: props.height || 'auto',
  '--min-height': props.minHeight,
  '--max-height': props.maxHeight
}))

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

let destroyed = false

let EditorView: typeof EditorViewT | null = null
let EditorState: typeof EditorStateT | null = null
let Compartment: typeof CompartmentT | null = null
let basicSetup: Extension | null = null

let editorView: EditorViewT | null = null
let themeCompartment: CompartmentT | null = null
let gutterCompartment: CompartmentT | null = null
let languageCompartment: CompartmentT | null = null

let initPromise: Promise<void> | null = null

async function loadCore(): Promise<void> {
  if (EditorView && EditorState && Compartment && basicSetup) return

  const [{ EditorView: EV }, { EditorState: ES, Compartment: C }, core] = await Promise.all([
    import('@codemirror/view'),
    import('@codemirror/state'),
    import('codemirror')
  ])

  EditorView = EV
  EditorState = ES
  Compartment = C
  basicSetup = core.basicSetup
}

async function loadThemeExtension(): Promise<ExtensionLike> {
  if (!isDark.value) return []
  const mod = await import('@codemirror/theme-one-dark')
  return mod.oneDark
}

async function loadLanguageExtension(lang: Language | undefined): Promise<ExtensionLike> {
  if (props.customLanguageExtension) return props.customLanguageExtension

  switch (lang) {
    case 'json': {
      const mod = await import('@codemirror/lang-json')
      return mod.json()
    }
    case 'markdown': {
      const mod = await import('@codemirror/lang-markdown')
      return mod.markdown()
    }
    default:
      return []
  }
}

function makeGutterHiddenExtension(hidden: boolean): ExtensionLike {
  if (!hidden) return []
  return EditorView.theme({
    '.cm-gutters': { display: 'none' }
  })
}

async function ensureInitialized(): Promise<void> {
  if (initPromise) return initPromise

  initPromise = (async () => {
    await loadCore()
    if (destroyed) return
    if (!editorRef.value) return

    themeCompartment = new Compartment()
    gutterCompartment = new Compartment()
    languageCompartment = new Compartment()

    const [themeExt, gutterExt, languageExt] = await Promise.all([
      loadThemeExtension(),
      Promise.resolve(makeGutterHiddenExtension(!!props.hideGutter)),
      loadLanguageExtension(props.language)
    ])
    if (destroyed) return

    const extensions: ExtensionLike[] = [
      basicSetup,
      themeCompartment.of(themeExt),
      gutterCompartment.of(gutterExt),
      languageCompartment.of(languageExt),
      EditorView.updateListener.of((update: ViewUpdate) => {
        if (update.docChanged) emit('update:modelValue', update.state.doc.toString())
      })
    ]

    if (props.readonly) extensions.push(EditorState.readOnly.of(true))
    if (props.lineWrapping) extensions.push(EditorView.lineWrapping)

    const state = EditorState.create({ doc: props.modelValue || '', extensions })
    editorView = new EditorView({ state, parent: editorRef.value })
  })()

  return initPromise
}

async function applyLanguage(lang: Language | undefined) {
  await ensureInitialized()
  if (!editorView || !languageCompartment) return
  const ext = await loadLanguageExtension(lang)
  if (!editorView) return
  editorView.dispatch({
    effects: languageCompartment.reconfigure(ext)
  })
}

async function applyTheme() {
  await ensureInitialized()
  if (!editorView || !themeCompartment) return
  const themeExt = await loadThemeExtension()
  if (!editorView) return
  editorView.dispatch({
    effects: themeCompartment.reconfigure(themeExt)
  })
}

async function applyGutter() {
  await ensureInitialized()
  if (!editorView || !gutterCompartment) return
  const gutterExt = makeGutterHiddenExtension(!!props.hideGutter)
  if (!editorView) return
  editorView.dispatch({
    effects: gutterCompartment.reconfigure(gutterExt)
  })
}

function applyDocValue(newValue: string) {
  if (!editorView) return
  const current = editorView.state.doc.toString()
  if ((newValue || '') !== current) {
    editorView.dispatch({
      changes: { from: 0, to: editorView.state.doc.length, insert: newValue || '' }
    })
  }
}

onMounted(async () => {
  media?.addEventListener('change', onSystemThemeChange)
  await ensureInitialized()
})

onUnmounted(() => {
  destroyed = true
  media?.removeEventListener('change', onSystemThemeChange)
  editorView?.destroy()
  editorView = null
})

watch(() => props.language, (lang) => { applyLanguage(lang) })
watch(() => props.customLanguageExtension, () => { applyLanguage(props.language) })

watch(() => props.modelValue, (v) => { applyDocValue(v) })

watch(isDark, () => { applyTheme() })
watch(() => props.hideGutter, () => { applyGutter() })

watch(() => props.readonly, async (v) => {
  await ensureInitialized()
  if (!editorView) return
  editorView.dispatch({
    effects: EditorState.readOnly.reconfigure(!!v)
  })
})
</script>

<style scoped>
.code-editor {
  width: 100%;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--t-color-text);
}

.codemirror-container {
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-default);
  min-height: var(--min-height);
  max-height: var(--max-height);
  overflow: auto;
}

.codemirror-container :deep(.cm-editor) {
  font-size: 14px;
}

.codemirror-container :deep(.cm-focused) {
  outline: none;
}

.codemirror-container :deep(.cm-editor.cm-focused) {
  outline: none;
}
</style>
