<template>
  <div>
    <div class="example-label">Text Toggle: {{ alignment }}</div>
    <TButtonGroup
      v-model="alignment"
      :options="alignmentOptions"
      toggle
    />
  </div>

  <div>
    <div class="example-label">Icon Toggle: {{ view }}</div>
    <TButtonGroup
      v-model="view"
      :options="viewOptions"
      toggle
      label-display="never"
    />
  </div>

  <div>
    <div class="example-label">Icon + Label Toggle: {{ theme }}</div>
    <TButtonGroup
      v-model="theme"
      :options="themeOptions"
      toggle
      variant="accent"
    />
  </div>

  <div>
    <div class="example-label">Mandatory Toggle: {{ format }}</div>
    <TButtonGroup
      v-model="format"
      :options="formatOptions"
      label-display="selected"
      toggle
      mandatory
      variant="info"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TButtonGroup } from 't-components'
import type { TButtonGroupOption } from 't-components'

const alignment = ref<string | number | null>('center')
const view = ref<string | number | null>('list')
const theme = ref<string | number | null>('light')
const format = ref<string | number | null>('bold')

const alignmentOptions: TButtonGroupOption[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' }
]

const viewOptions: TButtonGroupOption[] = [
  { value: 'list', label: 'List', icon: 'system-uicons:list' },
  { value: 'grid', label: 'Grid', icon: 'system-uicons:grid' },
  { value: 'calendar', label: 'Calendar', icon: 'system-uicons:calendar' }
]

const themeOptions: TButtonGroupOption[] = [
  { value: 'light', label: 'Light', icon: 'system-uicons:sun' },
  { value: 'dark', label: 'Dark', icon: 'system-uicons:moon' }
]

const formatOptions: TButtonGroupOption[] = [
  { value: 'bold', label: 'Bold', icon: 'material-symbols:format-bold' },
  { value: 'italic', label: 'Italic', icon: 'material-symbols:format-italic' },
  { value: 'underline', label: 'Underline', icon: 'material-symbols:format-underlined' }
]
</script>

<style scoped>
.example-label {
  font-size: 0.875rem;
  color: var(--t-color-text-secondary);
  margin-bottom: var(--t-space-1);
}
</style>
