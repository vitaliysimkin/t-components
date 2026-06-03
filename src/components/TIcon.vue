<script setup lang="ts">
// Thin wrapper around @iconify/vue's <Icon>. It is the ONLY component in the
// library that imports Icon directly. Two jobs:
//  1. Pulls in the curated `ticon:*` set as a side-effect so the component
//     defaults and the `ticon:missing` fallback are registered offline (no
//     network). The heavy `system-uicons` set is OPT-IN — consumers import
//     `@vitaliysimkin/t-components/icons` separately if they want it.
//  2. If an icon name is not registered, renders a loud `ticon:missing` glyph
//     instead of nothing, making typos / unregistered names obvious.
import { Icon, iconLoaded } from '@iconify/vue'
import '../icons/ticon-set'

defineOptions({ inheritAttrs: false })

defineProps<{ icon: string }>()
</script>

<template>
  <Icon
    v-if="icon && !iconLoaded(icon)"
    icon="ticon:missing"
    :title="`Missing icon: ${icon}`"
    aria-label="Missing icon"
    v-bind="$attrs"
  />
  <Icon
    v-else
    :icon="icon"
    v-bind="$attrs"
  />
</template>
