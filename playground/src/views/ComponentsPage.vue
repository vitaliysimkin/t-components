<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Example from '../components/Example.vue'
import { elements } from '../examples/index'

const route = useRoute()

const currentElement = computed(() =>
  elements.find((el) => el.slug === route.params.slug)
)
</script>

<template>
  <div class="page">
    <template v-if="currentElement">
      <header class="page-head">
        <h1 class="page-head__title">
          {{ currentElement.label }}
        </h1>
        <span class="page-head__meta">
          {{ currentElement.components.length }} examples
        </span>
      </header>
      <Example
        v-for="(example, idx) in currentElement.components"
        :key="idx"
        :component="example.component"
        :code="example.code"
        :label="example.label"
      />
    </template>
    <div
      v-else
      class="page-empty"
    >
      Оберіть компонент у боковій панелі.
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-4);
  padding: var(--t-space-5) var(--t-space-6) var(--t-space-7);
  max-width: 1100px;
}

.page-head {
  display: flex;
  align-items: baseline;
  gap: var(--t-space-3);
  margin-bottom: var(--t-space-1);
}

.page-head__title {
  margin: 0;
  color: var(--t-color-text);
  font-size: var(--t-font-size-h1);
  font-weight: var(--t-font-weight-semibold);
  line-height: var(--t-line-height-tight);
}

.page-head__meta {
  color: var(--t-color-text-muted);
  font-size: var(--t-font-size-small);
}

.page-empty {
  color: var(--t-color-text-muted);
  padding: var(--t-space-7) var(--t-space-5);
  text-align: center;
}

@media (max-width: 760px) {
  .page {
    padding: var(--t-space-4);
  }
}
</style>
