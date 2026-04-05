<script setup lang="ts">
import { ref } from 'vue'
import { TSwitch } from 't-components'

const checked = ref(true)
</script>

<template>
    <TSwitch v-model="checked" disabled label="Disabled ON" />
    <TSwitch :model-value="false" disabled label="Disabled OFF" />
</template>