<script setup lang="ts">
import { modalManager } from 't-components'
import { TButton } from 't-components'

const openSimpleInput = () => {
  modalManager.openInputModal({
    label: 'Enter Your Name',
    inputs: {
        code: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'John Doe'
    },
    onSubmit: (values) => {
      alert(`Hello, ${values.name}!`)
    }
  })
}
</script>

<template>
  <div>
    <TButton @click="openSimpleInput">Open Input Modal</TButton>
  </div>
</template>

<style scoped>
div {
  display: flex;
  gap: 1rem;
}
</style>
