<script setup lang="ts">
import { ref } from 'vue'
import { TSplitPane } from '@vitaliysimkin/t-components'
import type { TSplitPaneVariant } from '@vitaliysimkin/t-components'

const height = ref(110)
const variants: TSplitPaneVariant[] = ['gutter', 'flat', 'line']
</script>

<template>
  <div class="demo">
    <section
      v-for="variant in variants"
      :key="variant"
      class="item"
    >
      <div class="item__head">
        <code>orientation="horizontal" variant="{{ variant }}"</code>
      </div>
      <TSplitPane
        v-model="height"
        orientation="horizontal"
        :variant="variant"
        class="frame"
        :min="60"
        :min-end="60"
        :default-size="110"
        aria-label="Висота редактора"
      >
        <template #start>
          <div
            class="pane"
            :class="{ 'pane--side': variant !== 'gutter' }"
          >
            <b>Редактор</b>
            <div>SELECT * FROM logs;</div>
          </div>
        </template>
        <template #end>
          <div class="pane">
            <b>Результат</b>
            <div>Тягніть роздільник, ↑/↓ (Shift — більший крок), Home/End, подвійний клік або Enter — скинути.</div>
          </div>
        </template>
      </TSplitPane>
    </section>
    <div class="meta">
      Висота верхньої панелі: <code>{{ height }}px</code> (спільна для трьох прикладів)
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: var(--t-space-4);
}

.item__head {
  margin-bottom: var(--t-space-2);
  color: var(--t-color-text-muted);
  font-size: var(--t-font-size-small);
}

.frame {
  height: 240px;
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
