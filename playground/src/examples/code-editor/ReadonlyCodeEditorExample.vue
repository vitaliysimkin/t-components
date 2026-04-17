<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@vitaliysimkin/t-components'

const snippet = ref(`{
  "readonly": true,
  "hideGutter": true,
  "note": "Great for rendering server responses or log payloads."
}`)
</script>

<template>
  <CodeEditor
    v-model="snippet"
    label="Server response (read-only)"
    language="json"
    readonly
    hide-gutter
    max-height="220px"
  />
</template>
