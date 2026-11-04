<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from './markdown'

const props = defineProps<{ source: string }>()

const html = computed(() => renderMarkdown(props.source))
</script>

<template>
  <!-- eslint-disable vue/no-v-html -- renderMarkdown escapes all input -->
  <div
    class="t-markdown"
    v-html="html"
  />
</template>
