<script setup lang="ts">
import { ref } from 'vue'
import { TSelect } from '@vitaliysimkin/t-components'

const role = ref<string | number | null>('')
const options = ['Admin', 'Editor', 'Viewer']
</script>

<template>
<div>
  <TSelect v-model="role" :options="options" />
  <p>Selected: {{ role }}</p>

  <TSelect :options="options" disabled />

  <TSelect v-model="role" :options="options" placeholder="select option" clearable />
</div>
</template>

<style scoped>
</style>