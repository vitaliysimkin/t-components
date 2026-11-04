<script setup lang="ts">
import { ref } from 'vue'
import { TFileTree, TPathCrumbs } from '@vitaliysimkin/t-components'

const paths = [
  'Application/2026-09-26/Common.log',
  'Application/2026-09-26/Error.log',
  'Application/2026-09-25/Common.log',
  'Scheduler/Quartz/2026-09-26/Scheduler-very-long-file-name.log',
  'web.config',
]
const selected = ref<string | null>('Application/2026-09-26/Error.log')
const collapsed = ref(false)
</script>

<template>
  <div class="demo">
    <TFileTree
      v-model="selected"
      v-model:collapsed="collapsed"
      class="tree"
      :class="{ collapsed }"
      :paths="paths"
    />
    <TPathCrumbs
      v-if="selected"
      :path="selected"
    >
      <small>2.0 KB</small>
    </TPathCrumbs>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  align-items: flex-start;
  gap: var(--t-space-4);
  width: 100%;
  min-width: 0;
}

.tree {
  flex: none;
  width: 16rem;
  height: 18rem;
}

.tree.collapsed {
  width: auto;
}
</style>
