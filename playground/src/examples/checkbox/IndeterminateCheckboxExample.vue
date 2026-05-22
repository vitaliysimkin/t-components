<script setup lang="ts">
import { ref, computed } from 'vue'
import { TCheckbox } from '@vitaliysimkin/t-components'

const items = ref([
  { label: 'Option A', checked: true },
  { label: 'Option B', checked: false },
  { label: 'Option C', checked: true },
])

const allChecked = computed(() => items.value.every(i => i.checked))
const noneChecked = computed(() => items.value.every(i => !i.checked))
const someChecked = computed(() => !allChecked.value && !noneChecked.value)

function toggleAll(val: boolean) {
  items.value.forEach(i => { i.checked = val })
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <TCheckbox
      :model-value="allChecked"
      :indeterminate="someChecked"
      label="Select all"
      @update:model-value="toggleAll"
    />
    <div style="padding-left: 24px; display: flex; flex-direction: column; gap: 8px;">
      <TCheckbox
        v-for="item in items"
        :key="item.label"
        v-model="item.checked"
        :label="item.label"
      />
    </div>
  </div>
</template>
