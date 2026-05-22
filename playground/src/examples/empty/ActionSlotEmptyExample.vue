<script setup lang="ts">
import { ref } from 'vue'
import { TEmpty, TButton } from '@vitaliysimkin/t-components'

const items = ref<string[]>([])

function addItem() {
  items.value.push(`Item ${items.value.length + 1}`)
}

function clear() {
  items.value = []
}
</script>

<template>
  <div class="demo">
    <div
      v-if="items.length"
      class="item-list"
    >
      <div
        v-for="item in items"
        :key="item"
        class="item"
      >
        {{ item }}
      </div>
      <TButton
        variant="danger"
        mode="ghost"
        size="small"
        @click="clear"
      >
        Clear all
      </TButton>
    </div>

    <TEmpty
      v-else
      icon="material-symbols-light:box-outline"
      description="Your list is empty"
    >
      <TButton
        variant="accent"
        mode="plain"
        @click="addItem"
      >
        Add first item
      </TButton>
    </TEmpty>
  </div>
</template>

<style scoped>
.demo {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.item {
  padding: 0.5rem 1rem;
  background: var(--t-color-surface-2);
  border-radius: var(--t-radius-default);
  font-size: var(--t-font-size-default);
}
</style>
