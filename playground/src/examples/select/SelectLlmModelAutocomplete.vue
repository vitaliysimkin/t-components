<script setup lang="ts">
import { ref } from 'vue';
import { TSelect } from '@vitaliysimkin/t-components';
const model = ref("");
const options = [
    { value: 'gpt-4o', label: 'GPT-4o', icon: 'simple-icons:openai' },
    { value: 'gpt-4o-mini', label: 'GPT-4o mini', icon: 'simple-icons:openai' },
    { value: 'gpt-4.1', label: 'GPT-4.1', icon: 'simple-icons:openai' },
    { value: 'gpt-4.1-mini', label: 'GPT-4.1 mini', icon: 'simple-icons:openai' },
    { value: 'o1', label: 'o1', icon: 'simple-icons:openai' },
    { value: 'o3-mini', label: 'o3-mini', icon: 'simple-icons:openai' },
];
</script>

<template>
  <div>
    <TSelect
      v-model="model"
      :options="options"
      autocomplete
      searchable
      value-mode="value"
      value-key="value"
      label-key="label"
      icon-key="icon"
    />
    <p>Selected Model: {{ model }}</p>
  </div>
</template>