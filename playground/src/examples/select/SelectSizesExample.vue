<script setup lang="ts">
import { ref } from 'vue'
import { TSelect } from 't-components'

const role = ref<string | number | null>('Admin')
</script>

<template>
  <div>
    <TSelect v-model="role" :options="['Admin', 'Editor', 'Viewer']" size="mini" placeholder="Mini" />
    <TSelect v-model="role" :options="['Admin', 'Editor', 'Viewer']" size="small" placeholder="Small" />
    <TSelect v-model="role" :options="['Admin', 'Editor', 'Viewer']" size="default" placeholder="Default" />
    <TSelect v-model="role" :options="['Admin', 'Editor', 'Viewer']" size="medium" placeholder="Medium" />
    <TSelect v-model="role" :options="['Admin', 'Editor', 'Viewer']" size="large" placeholder="Large" />
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
