<template>
  <div class="callback-modal-content">

    <TButton 
      @click="requestData" 
      :disabled="isLoading"
    >
      Request Complex Data
    </TButton>
    
    <div v-if="isLoading" class="loading">
      Loading complex data...
    </div>
    
    <div v-if="receivedData" class="result">
      <pre>{{ JSON.stringify(receivedData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TButton } from '@vitaliysimkin/t-components'

const props = defineProps<{
  onDataRequest?: () => Promise<any> | any
}>()

const receivedData = ref<any>(null)
const isLoading = ref(false)

const requestData = async () => {
  if (!props.onDataRequest) return
  
  try {
    isLoading.value = true
    const result = await props.onDataRequest()
    receivedData.value = result
  } catch (error) {
    console.error('Error requesting data:', error)
    receivedData.value = { error: 'Failed to load data' }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.callback-modal-content {
  padding: 5px;
}

.loading {
  margin-top: 5px;
  padding: 5px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  font-style: italic;
  color: #856404;
}
</style>