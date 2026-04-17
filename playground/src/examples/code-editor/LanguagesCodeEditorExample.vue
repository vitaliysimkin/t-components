<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@vitaliysimkin/t-components'

const jsonValue = ref(`{
  "ok": true,
  "count": 42
}`)

const markdownValue = ref(`# Release notes

- **New:** \`CodeEditor\` examples
- Fix: gutter toggle
- Supports \`json\`, \`markdown\`, and plain \`text\`
`)

const textValue = ref(`Plain text mode — no syntax highlighting,
just a comfortable multi-line editor with line numbers.`)
</script>

<template>
  <div class="stack">
    <CodeEditor v-model="jsonValue" label="JSON" language="json" min-height="120px" />
    <CodeEditor v-model="markdownValue" label="Markdown" language="markdown" min-height="120px" line-wrapping />
    <CodeEditor v-model="textValue" label="Plain text" language="text" min-height="100px" line-wrapping />
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-4);
}
</style>
