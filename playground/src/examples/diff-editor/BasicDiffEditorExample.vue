<script setup lang="ts">
import { ref } from 'vue'
import { TDiffEditor } from '@vitaliysimkin/t-components'

const original = ref(`{
  "name": "t-components",
  "version": "0.8.0",
  "type": "module"
}`)

const modified = ref(`{
  "name": "t-components",
  "version": "0.9.0",
  "type": "module",
  "license": "MIT"
}`)
</script>

<template>
  <TDiffEditor
    v-model="modified"
    :original="original"
    height="240px"
  />
</template>
