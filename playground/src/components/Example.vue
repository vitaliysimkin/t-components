<template>
  <div class="example">
    <div class="example-header">
      <h3>{{ label }}</h3>
      <TButton
        variant="info"
        size="mini"
        :mode="showCode ? 'filled' : 'plain'"
        icon="system-uicons:code"
        class="code-toggle"
        @click="showCode = !showCode"
      />
    </div>

    <div class="example-preview">
      <component :is="component" />
    </div>

    <TCodeEditor
      v-if="showCode"
      :model-value="code"
      :custom-language-extension="vue()"
      :readonly="true"
      min-height="100px"
      max-height="600px"
      class="code-block"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, type Component } from 'vue'
import { vue } from '@codemirror/lang-vue'
import { TButton, TCodeEditor } from '@vitaliysimkin/t-components'

defineProps<{
  component: Component
  code: string
  label: string
}>()

const showCode = ref(false)
</script>

<style scoped>
.example {
  border: solid 1px var(--t-color-border);
  margin: var(--t-space-2);
}

.example:hover {
  border-color: var(--t-color-accent);
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--t-space-2);
  background-color: var(--t-color-surface-2);
}

.example-header h3 {
  margin: 0;
  color: var(--t-color-text);
  font-size: 0.9rem;
  font-weight: 500;
}

.example-preview {
  padding: var(--t-space-4);
  background-color: var(--t-color-bg);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.code-block {
  margin: var(--t-space-4) 0 0 0;
  padding: var(--t-space-3);
  background-color: var(--t-color-surface);
  border-top: 1px solid var(--t-color-border);
}
</style>
