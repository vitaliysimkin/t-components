<script setup lang="ts">
import { ref } from 'vue'
import Example from '../components/Example.vue'
import { elements } from '../examples/index'
import { Icon } from '@iconify/vue'

const expandedElements = ref<Set<string>>(new Set())

const toggleElement = (elementName: string) => {
  if (expandedElements.value.has(elementName)) {
    expandedElements.value.delete(elementName)
  } else {
    expandedElements.value.add(elementName)
  }
}

const isExpanded = (elementName: string) => expandedElements.value.has(elementName)
</script>

<template>
  <div class="components-page">
    <div
      v-for="element in elements"
      :key="element.label"
      class="element-type"
    >
      <div class="element-type-header" @click="toggleElement(element.label)">
        <h2>
          <Icon
            :icon="isExpanded(element.label) ? 'system-uicons:chevron-down' : 'system-uicons:chevron-right'"
            class="toggle-icon"
          />
          {{ element.label }}
        </h2>
      </div>

      <div v-if="isExpanded(element.label)" class="element-type-content">
        <Example
          v-for="(example, idx) in element.components"
          :key="idx"
          :component="example.component"
          :code="example.code"
          :label="example.label"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.components-page {
  padding: var(--t-space-4);
  max-width: 900px;
  margin: 0 auto;
}

.element-type {
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-default);
  margin-bottom: var(--t-space-4);
  overflow: hidden;
}

.element-type-header {
  display: flex;
  align-items: center;
  padding: var(--t-space-4);
  background-color: var(--t-color-surface);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.element-type-header:hover {
  background-color: var(--t-color-surface-2);
}

h2 {
  margin: 0;
  color: var(--t-color-text);
  font-size: 1.05rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--t-space-2);
}

.toggle-icon {
  font-size: 1.25rem;
  color: var(--t-color-text-muted);
}

.element-type-content {
  background-color: var(--t-color-bg);
}
</style>
