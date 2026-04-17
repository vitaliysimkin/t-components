<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@vitaliysimkin/t-components'

const value = ref(`{
  "name": "t-components",
  "version": "0.5.0",
  "features": ["code-editor", "tabs", "sidebar"]
}`)
</script>

<template>
  <CodeEditor
    v-model="value"
    label="Config (JSON)"
    language="json"
    min-height="160px"
  />
</template>
