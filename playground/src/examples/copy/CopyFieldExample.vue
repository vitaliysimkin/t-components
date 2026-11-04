<script setup lang="ts">
import { TCopyField, useNotifications } from '@vitaliysimkin/t-components'

const { error } = useNotifications()
</script>

<template>
  <TCopyField
    value="/var/lib/app/data"
    @copy-error="error('Could not copy — select the text manually')"
  />
</template>
