<script setup lang="ts">
import { ref } from 'vue'
import { TCollapseTransition, TButton } from '@vitaliysimkin/t-components'

const show = ref(true)
</script>

<template>
  <div class="demo">
    <TButton
      variant="accent"
      mode="plain"
      @click="show = !show"
    >
      {{ show ? 'Collapse' : 'Expand' }}
    </TButton>

    <TCollapseTransition>
      <div
        v-show="show"
        class="demo-content"
      >
        <p>This block animates its height from 0 to auto (and back) when toggled.</p>
        <p>It uses pure JS transition hooks — no hardcoded heights required.</p>
        <p>Margin and padding are preserved cleanly because overflow is clipped only during the animation.</p>
      </div>
    </TCollapseTransition>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-3);
  max-width: 480px;
}

.demo-content {
  padding: var(--t-space-4);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-default);
  background: var(--t-color-surface);
  color: var(--t-color-text);
  line-height: 1.6;
}

.demo-content p {
  margin: 0 0 var(--t-space-2);
}

.demo-content p:last-child {
  margin-bottom: 0;
}
</style>
