<template>
  <section class="example">
    <header class="example__head">
      <h3 class="example__title">
        {{ label }}
      </h3>
      <TButton
        variant="info"
        size="mini"
        :mode="showCode ? 'plain' : 'ghost'"
        icon="system-uicons:code"
        :title="showCode ? 'Hide code' : 'Show code'"
        @click="showCode = !showCode"
      />
    </header>

    <div class="example__preview">
      <component :is="component" />
    </div>

    <TCodeEditor
      v-if="showCode"
      :model-value="code"
      :custom-language-extension="vue()"
      :readonly="true"
      min-height="100px"
      max-height="600px"
      class="example__code"
    />
  </section>
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
/* Card: surface + hairline + large radius (same recipe as TCard) */
.example {
  background: var(--t-color-surface);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-large);
  overflow: hidden;
}

.example__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--t-space-3);
  padding: var(--t-space-2) var(--t-space-3) var(--t-space-2) var(--t-space-4);
  border-bottom: 1px solid var(--t-color-border);
}

.example__title {
  margin: 0;
  color: var(--t-color-text);
  font-size: var(--t-font-size-default);
  font-weight: var(--t-font-weight-semibold);
}

.example__preview {
  padding: var(--t-space-4) var(--t-space-4);
  display: flex;
  gap: var(--t-space-3);
  flex-wrap: wrap;
  align-items: center;
}

.example__code {
  border-top: 1px solid var(--t-color-border);
  background: var(--t-color-surface-2);
}
</style>
