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
  <div class="component-page">
    <template v-if="currentElement">
      <h1 class="component-page__title">
        {{ currentElement.label }}
      </h1>
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
      class="component-page__empty"
    >
      Оберіть компонент у боковій панелі.
    </div>
  </div>
</template>

<style scoped>
.component-page {
  padding: var(--t-space-4);
  max-width: 900px;
  margin: 0 auto;
}

.component-page__title {
  margin: 0 0 var(--t-space-4) 0;
  color: var(--t-color-text);
  font-size: 1.5rem;
  font-weight: 600;
}

.component-page__empty {
  color: var(--t-color-text-muted);
  padding: var(--t-space-5);
  text-align: center;
}
</style>
