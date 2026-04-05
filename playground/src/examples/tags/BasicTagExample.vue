<script setup lang="ts">
import { TTag } from 't-components'
</script>

<template>
  <div>
    <TTag label="Default" />
    <TTag label="Gray" variant="gray" />
    <TTag label="Blue" variant="blue" />
    <TTag label="Red" variant="red" />
    <TTag label="Green" variant="green" />
    <TTag label="Yellow" variant="yellow" />
    <TTag label="Orange" variant="orange" />
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
