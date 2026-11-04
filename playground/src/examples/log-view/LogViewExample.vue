<script setup lang="ts">
import { TLogView } from '@vitaliysimkin/t-components/code-editor'

const text = Array.from({ length: 200 }, (_, i) => {
  const time = `2026-11-04 10:${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')},${String(i).padStart(3, '0')}`
  if (i % 17 === 5) return `${time} [7] ERROR Supervisor Terrasoft.Core.Db Execute - Query 'SELECT 1' failed\n   at Terrasoft.Core.Db.Execute()`
  if (i % 9 === 3) return `${time} [WARN] Scheduler - Job "sync" is slow`
  return `${time} [${i % 4}] INFO Supervisor Terrasoft.Web.Http Process - Request ${i} done`
}).join('\n')
</script>

<template>
  <TLogView
    class="demo"
    :text="text"
    height="360px"
  />
</template>

<style scoped>
.demo {
  width: 100%;
}
</style>
