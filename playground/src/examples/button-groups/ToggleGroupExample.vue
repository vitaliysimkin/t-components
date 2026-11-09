<template>
  <div
    v-for="mode in modes"
    :key="mode"
  >
    <div class="example-label">
      mode="{{ mode }}": {{ alignment }} · {{ view }} · {{ theme }} · {{ period }} · [{{ format.join(', ') }}]
    </div>
    <div class="example-row">
      <TButtonGroup
        v-model="alignment"
        :mode="mode"
        :options="alignmentOptions"
      />
      <TButtonGroup
        v-model="view"
        :mode="mode"
        :options="viewOptions"
        label-display="never"
        mandatory
      />
      <TButtonGroup
        v-model="theme"
        :mode="mode"
        :options="themeOptions"
      />
      <TButtonGroup
        v-model="period"
        :mode="mode"
        :options="periodOptions"
        size="small"
      />
      <!-- Array v-model: multi select -->
      <TButtonGroup
        v-model="format"
        :mode="mode"
        :options="formatOptions"
        label-display="never"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TButtonGroup } from '@vitaliysimkin/t-components'
import type { TButtonGroupMode, TButtonGroupOption } from '@vitaliysimkin/t-components'

const modes: TButtonGroupMode[] = ['segmented', 'plain']

const alignment = ref<string | number | null>('center')
const view = ref<string | number | null>('list')
const theme = ref<string | number | null>('light')
const period = ref<string | number | null>('week')
const format = ref<string[]>(['bold', 'underline'])

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
  { value: 'dark', label: 'Dark', icon: 'system-uicons:moon' },
  { value: 'auto', label: 'Auto', icon: 'system-uicons:display-alt', disabled: true }
]

const periodOptions: TButtonGroupOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' }
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

.example-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--t-space-3);
}
</style>
