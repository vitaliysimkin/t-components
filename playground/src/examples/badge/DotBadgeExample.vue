<script setup lang="ts">
import { ref } from 'vue'
import { TBadge, TButton } from '@vitaliysimkin/t-components'

const hasNotification = ref(true)
</script>

<template>
  <div class="examples">
    <TBadge dot>
      <TButton label="Notifications" />
    </TBadge>

    <TBadge
      dot
      variant="success"
    >
      <TButton label="Online" />
    </TBadge>

    <TBadge
      dot
      :hidden="!hasNotification"
    >
      <TButton
        label="Toggle dot"
        @click="hasNotification = !hasNotification"
      />
    </TBadge>
  </div>
</template>

<style scoped>
.examples {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: center;
  padding: 1rem;
}
</style>
