<template>
    <input v-model="demoValue" type="text" placeholder="Demo text..." />
    <button @click="() => $emit('buttonPressed', 'EventA')">EventA</button>
    <button @click="() => $emit('buttonPressed', 'EventB')">EventB</button>
</template>

<script setup lang="ts">
const demoValue = defineModel<string>('demoValue', { default: '' })
const emit = defineEmits<{
  buttonPressed: [button: string]
}>()
</script>