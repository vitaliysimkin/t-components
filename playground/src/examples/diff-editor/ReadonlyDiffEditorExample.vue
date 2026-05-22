<script setup lang="ts">
import { ref } from 'vue'
import { TDiffEditor } from '@vitaliysimkin/t-components'

const original = ref(`<Configuration>
  <ConnectionString>Server=old-host;Database=mydb</ConnectionString>
  <Timeout>30</Timeout>
</Configuration>`)

const modified = ref(`<Configuration>
  <ConnectionString>Server=new-host;Database=mydb</ConnectionString>
  <Timeout>60</Timeout>
  <MaxRetries>3</MaxRetries>
</Configuration>`)
</script>

<template>
  <div>
    <p style="margin-bottom: 8px; color: var(--t-color-text-secondary); font-size: 13px;">
      Both sides read-only — use as a read-only diff viewer.
    </p>
    <TDiffEditor
      v-model="modified"
      :original="original"
      :readonly="true"
      height="200px"
    />
  </div>
</template>
