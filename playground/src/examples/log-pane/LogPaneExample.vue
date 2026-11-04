<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { TLogPane, type TLogLine } from '@vitaliysimkin/t-components'

const kinds: TLogLine['kind'][] = ['out', 'out', 'out', 'info', 'warn', 'err']
const lines = ref<TLogLine[]>([])
let id = 0

const timer = setInterval(() => {
  id++
  lines.value.push({ id, text: `Line ${id}`, kind: kinds[id % kinds.length], prefix: '[build]' })
}, 500)

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <TLogPane
    class="demo"
    :lines="lines"
    height="160px"
  />
</template>

<style scoped>
.demo {
  width: 100%;
}
</style>
