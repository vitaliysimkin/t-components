<script setup lang="ts">
import { ref } from 'vue'
import { TCodeEditor } from '@vitaliysimkin/t-components'

const value = ref(`{
  "name": "t-components",
  "version": "0.5.0",
  "features": ["code-editor", "tabs", "sidebar"]
}`)
</script>

<template>
  <TCodeEditor
    v-model="value"
    label="Config (JSON)"
    language="json"
    min-height="160px"
  />
</template>
