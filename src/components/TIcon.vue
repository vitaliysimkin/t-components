<script setup lang="ts">
// Thin wrapper around @iconify/vue's <Icon>. It is the ONLY component in the
// library that imports Icon directly. Two jobs:
//  1. Pulls in `offline-icons` as a side-effect so the whole system-uicons set,
//     the curated `ticon:*` set, and the `ticon:missing` fallback are
//     registered offline (no network).
//  2. If an icon name is not registered, renders a loud `ticon:missing` glyph
//     instead of nothing, making typos / unregistered names obvious.
import { Icon, iconLoaded } from '@iconify/vue'
import '../icons/offline-icons'

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
