<template>
  <div class="code-editor">
    <label v-if="label" class="field-label">{{ label }}</label>
    <div ref="editorRef" class="codemirror-container" :style="editorStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState, Compartment, type Extension } from '@codemirror/state'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'

const props = defineProps<{
  modelValue: string
  label?: string
  language?: 'json' | 'markdown' | 'text'
  customLanguageExtension?: Extension
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
let editorView: EditorView | null = null

const editorStyle = computed(() => ({
  height: props.height || 'auto',
  '--min-height': props.minHeight,
  '--max-height': props.maxHeight
}))

function getLanguageExtension(lang: typeof props.language): Extension {
  if (props.customLanguageExtension) {
    return props.customLanguageExtension
  }
  switch (lang) {
    case 'json': return json()
    case 'markdown': return markdown()
    default:
      return []
  }
}

// Detect dark mode by watching the html element class (set by whatever theme manager is used)
const isDark = ref(document.documentElement.classList.contains('dark'))
let themeObserver: MutationObserver | null = null

const themeCompartment = new Compartment()
const gutterCompartment = new Compartment()
const languageCompartment = new Compartment()

function applyLanguage(lang: typeof props.language) {
  if (!editorView) return
  const ext = getLanguageExtension(lang)
  editorView.dispatch({
    effects: languageCompartment.reconfigure(ext)
  })
}

onMounted(async () => {
  themeObserver = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  if (!editorRef.value) return

  const extensions: Extension[] = [
    basicSetup,
    themeCompartment.of(isDark.value ? oneDark : []),
    gutterCompartment.of(props.hideGutter ? EditorView.theme({ '.cm-gutters': { display: 'none' } }) : []),
    languageCompartment.of([]),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) emit('update:modelValue', update.state.doc.toString())
    })
  ]

  if (props.readonly) extensions.push(EditorState.readOnly.of(true))
  if (props.lineWrapping) extensions.push(EditorView.lineWrapping)

  const state = EditorState.create({ doc: props.modelValue || '', extensions })

  editorView = new EditorView({ state, parent: editorRef.value })

  await applyLanguage(props.language)
})

onUnmounted(() => {
  themeObserver?.disconnect()
  editorView?.destroy()
  editorView = null
})

watch(() => props.language, (lang) => { applyLanguage(lang) })
watch(() => props.customLanguageExtension, () => { applyLanguage(props.language) })

watch(() => props.modelValue, (newValue) => {
  if (!editorView) return
  if (newValue !== editorView.state.doc.toString()) {
    editorView.dispatch({
      changes: { from: 0, to: editorView.state.doc.length, insert: newValue || '' }
    })
  }
})

watch(isDark, (v) => {
  if (!editorView) return
  editorView.dispatch({
    effects: themeCompartment.reconfigure(v ? oneDark : [])
  })
})

watch(() => props.hideGutter, (v) => {
  if (!editorView) return
  editorView.dispatch({
    effects: gutterCompartment.reconfigure(v ? EditorView.theme({
      '.cm-gutters': { display: 'none' }
    }) : [])
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
