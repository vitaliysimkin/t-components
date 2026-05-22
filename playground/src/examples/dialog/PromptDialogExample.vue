<script setup lang="ts">
import { ref } from 'vue'
import { TButton } from '@vitaliysimkin/t-components'
import { useDialog } from '@vitaliysimkin/t-components'

const { prompt } = useDialog()

const lastValue = ref<string | null | undefined>(undefined)

const handleRename = async () => {
  const name = await prompt({
    title: 'Перейменувати',
    message: 'Введіть нову назву для елемента.',
    inputLabel: 'Назва',
    inputValue: 'Мій елемент',
    placeholder: 'Введіть назву…',
    confirmText: 'Зберегти',
    cancelText: 'Скасувати',
  })
  lastValue.value = name
}

const handleApiKey = async () => {
  const key = await prompt({
    title: 'API-ключ',
    inputLabel: 'Ключ доступу',
    placeholder: 'sk-…',
    variant: 'warning',
    confirmText: 'Зберегти',
  })
  lastValue.value = key
}
</script>

<template>
  <div class="example">
    <div class="example-actions">
      <TButton variant="accent" @click="handleRename">Запит на введення імені</TButton>
      <TButton variant="neutral" @click="handleApiKey">Запит API-ключа</TButton>
    </div>
    <p v-if="lastValue !== undefined" class="example-result">
      <template v-if="lastValue !== null">
        Введено: <strong>{{ lastValue || '(порожньо)' }}</strong>
      </template>
      <template v-else>
        Скасовано
      </template>
    </p>
  </div>
</template>

<style scoped>
.example {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-4);
}
.example-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--t-space-2);
}
.example-result {
  font-size: var(--t-font-size-default);
  color: var(--t-color-text-muted);
  margin: 0;
}
</style>
