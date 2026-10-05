<script setup lang="ts">
import { TSplitPane } from '@vitaliysimkin/t-components'
import type { TSplitPaneVariant } from '@vitaliysimkin/t-components'

const variants: { variant: TSplitPaneVariant, title: string, hint: string }[] = [
  { variant: 'gutter', title: 'gutter', hint: 'жолобок 6px з подвійною рискою — для панелей-карток' },
  { variant: 'flat', title: 'flat', hint: 'щілина 5px з подвійною рискою — без карток і полів' },
  { variant: 'line', title: 'line', hint: 'лінія 1px з ручкою-крапками по центру (за замовчуванням)' },
]
</script>

<template>
  <div class="demo">
    <section
      v-for="v in variants"
      :key="v.variant"
      class="item"
    >
      <div class="item__head">
        <code>variant="{{ v.title }}"</code>
        <span>{{ v.hint }}</span>
      </div>
      <TSplitPane
        :variant="v.variant"
        class="frame"
        :default-size="200"
        :min="120"
        :min-end="160"
      >
        <template #start>
          <div
            class="pane"
            :class="{ 'pane--side': v.variant !== 'gutter' }"
          >
            <b>Дерево файлів</b>
            <div>src/App.vue</div>
          </div>
        </template>
        <template #end>
          <div class="pane">
            <b>Вміст</b>
            <div>Код, diff чи чат праворуч.</div>
          </div>
        </template>
      </TSplitPane>
    </section>
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
  display: flex;
  gap: var(--t-space-2);
  align-items: baseline;
  margin-bottom: var(--t-space-2);
  color: var(--t-color-text-muted);
  font-size: var(--t-font-size-small);
}

.frame {
  height: 140px;
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
</style>
