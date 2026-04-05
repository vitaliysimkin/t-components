<template>
  <div class="simple-content">
    <h4>{{ title }}</h4>
    <p>{{ message }}</p>
    <div class="content-actions">
      <TButton 
        @click="$emit('action', 'ok')" 
        variant="info" 
        size="small"
      >
        OK
      </TButton>
      <TButton 
        @click="$emit('action', 'cancel')" 
        variant="neutral" 
        size="small"
        style="margin-left: 10px;"
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