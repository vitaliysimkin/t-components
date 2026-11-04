<script setup lang="ts">
import { ref } from 'vue'
import { TDiffEditor } from '@vitaliysimkin/t-components'

const original = ref(`<configuration>
  <add key="Timeout" value="30" />
</configuration>`)

const modified = ref(`<configuration>
  <add key="Timeout" value="60" />
  <add key="MaxRetries" value="3" />
</configuration>`)
</script>

<template>
  <TDiffEditor
    v-model="modified"
    :original="original"
    language="xml"
    orientation="vertical"
    original-label="Backup (read-only)"
    modified-label="Current"
  />
</template>
