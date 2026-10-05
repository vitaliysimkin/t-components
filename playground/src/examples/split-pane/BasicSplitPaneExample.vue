<script setup lang="ts">
import { ref } from 'vue'
import { TSplitPane } from '@vitaliysimkin/t-components'

const width = ref(220)
</script>

<template>
  <div class="demo">
    <TSplitPane
      v-model="width"
      class="frame"
      :min="140"
      :max="420"
      :min-end="200"
      :default-size="220"
      aria-label="Ширина дерева файлів"
    >
      <template #start>
        <div class="pane pane--side">
          <b>Дерево файлів</b>
          <div>src/App.vue</div>
          <div>src/lib/split.ts</div>
        </div>
      </template>
      <template #end>
        <div class="pane">
          <b>Вміст</b>
          <div>Тягніть роздільник, ←/→ (Shift — більший крок), Home/End, подвійний клік або Enter — скинути.</div>
        </div>
      </template>
    </TSplitPane>
    <div class="meta">
      Ширина: <code>{{ width }}px</code> (140–420, права панель — від 200px)
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: var(--t-space-2);
}

.frame {
  height: 200px;
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-default);
  overflow: hidden;
}

.pane {
  height: 100%;
  padding: var(--t-space-3);
  color: var(--t-color-text-muted);
  font-size: var(--t-font-size-small);
  box-sizing: border-box;
}

.pane--side {
  background: var(--t-color-surface-2);
}

.pane b {
  display: block;
  margin-bottom: var(--t-space-1);
  color: var(--t-color-text);
}

.meta {
  color: var(--t-color-text-muted);
  font-size: var(--t-font-size-small);
}
</style>
