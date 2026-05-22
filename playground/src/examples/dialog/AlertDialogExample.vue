<script setup lang="ts">
import { TButton } from '@vitaliysimkin/t-components'
import { useDialog } from '@vitaliysimkin/t-components'

const { alert } = useDialog()

const handleSuccess = async () => {
  await alert({
    title: 'Готово!',
    message: 'Дані успішно збережено.',
    variant: 'success',
    confirmText: 'Чудово',
  })
}

const handleError = async () => {
  await alert({
    title: 'Помилка',
    message: 'Не вдалося підключитися до сервера. Перевірте з\'єднання.',
    variant: 'danger',
  })
}

const handleNeutral = async () => {
  await alert({
    title: 'Інформація',
    message: 'Операція виконується у фоновому режимі.',
    variant: 'info',
  })
}
</script>

<template>
  <div class="example">
    <div class="example-actions">
      <TButton
        variant="success"
        @click="handleSuccess"
      >
        Сповіщення про успіх
      </TButton>
      <TButton
        variant="danger"
        @click="handleError"
      >
        Сповіщення про помилку
      </TButton>
      <TButton
        variant="accent"
        @click="handleNeutral"
      >
        Інформаційне сповіщення
      </TButton>
    </div>
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
</style>
