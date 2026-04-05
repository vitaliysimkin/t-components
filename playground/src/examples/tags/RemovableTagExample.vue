<script setup lang="ts">
import { ref } from 'vue'
import { TTag } from 't-components'

const tags = ref(['Vue', 'TypeScript', 'Vite'])

const removeTag = (index: number) => {
  tags.value.splice(index, 1)
}
</script>

<template>
  <div>
    <TTag 
      v-for="(tag, index) in tags" 
      :key="tag"
      :label="tag" 
      removable 
      @remove="removeTag(index)" 
    />
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
