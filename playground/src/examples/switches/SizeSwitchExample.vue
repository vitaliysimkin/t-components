<script setup lang="ts">
import { ref } from 'vue'
import { TSwitch } from 't-components'

const checked = ref(true)
</script>

<template>
    <TSwitch v-model="checked" size="mini" label="mini" />
    <TSwitch v-model="checked" size="small" label="small" />
    <TSwitch v-model="checked" size="default" label="default" />
    <TSwitch v-model="checked" size="medium" label="medium" />
    <TSwitch v-model="checked" size="large" label="large" />
</template>