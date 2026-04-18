<template>
  <div class="simple-content">
    <h4>{{ title }}</h4>
    <p>{{ message }}</p>
    <div class="content-actions">
      <TButton 
        variant="info" 
        size="small" 
        @click="$emit('action', 'ok')"
      >
        OK
      </TButton>
      <TButton 
        variant="neutral" 
        size="small" 
        style="margin-left: 10px;"
        @click="$emit('action', 'cancel')"
      >
        Cancel
      </TButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TButton } from '@vitaliysimkin/t-components'

defineProps<{
  title: string
  message: string
}>()

defineEmits<{
  action: [type: string]
}>()
</script>

<style scoped>
.simple-content {
  padding: 10px;
}

.simple-content h4 {
  margin: 0 0 10px 0;
  color: var(--t-color-text);
}

.simple-content p {
  margin: 0 0 15px 0;
  color: var(--t-color-text-2);
  line-height: 1.4;
}

.content-actions {
  display: flex;
  justify-content: flex-end;
}
</style>