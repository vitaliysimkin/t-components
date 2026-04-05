<script setup lang="ts">
import { ref } from 'vue'
import { TSelect } from 't-components'

const city = ref<string | null>('')
const cities = ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv', 'Dnipro']
</script>

<template>
<div>
  <TSelect v-model="city" :options="cities" autocomplete />
  <p>Selected: {{ city }}</p>
</div>
</template>
