<script setup lang="ts">
import { ref } from 'vue'
import { TButton } from '@vitaliysimkin/t-components'
import { useDialog } from '@vitaliysimkin/t-components'

const { confirm } = useDialog()

const lastResult = ref<string | null>(null)

const handleBasic = async () => {
  const ok = await confirm({
    title: 'Видалити запис?',
    message: 'Цю дію не можна скасувати.',
    confirmText: 'Видалити',
    cancelText: 'Скасувати',
    variant: 'danger',
  })
  lastResult.value = ok ? 'Підтверджено' : 'Скасовано'
}

const handleWarning = async () => {
  const ok = await confirm({
    title: 'Застосувати зміни?',
    message: 'Поточні налаштування буде перезаписано.',
    confirmText: 'Так, застосувати',
    variant: 'warning',
  })
  lastResult.value = ok ? 'Підтверджено' : 'Скасовано'
}

const handleInfo = async () => {
  const ok = await confirm({
    title: 'Синхронізувати дані?',
    variant: 'info',
  })
  lastResult.value = ok ? 'Підтверджено' : 'Скасовано'
}
</script>

<template>
  <div class="example">
    <div class="example-actions">
      <TButton variant="danger" @click="handleBasic">Підтвердження (danger)</TButton>
      <TButton variant="neutral" @click="handleWarning">Підтвердження (warning)</TButton>
      <TButton variant="accent" @click="handleInfo">Підтвердження (info)</TButton>
    </div>
    <p v-if="lastResult !== null" class="example-result">
      Результат: <strong>{{ lastResult }}</strong>
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
