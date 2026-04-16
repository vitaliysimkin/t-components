<script setup lang="ts">
import { computed, nextTick, ref, useSlots, watch } from 'vue'
import { Icon } from '@iconify/vue'

export type TTabsVariant = 'underline' | 'pills' | 'segmented'
export type TTabsSize = 'small' | 'default' | 'medium'
export type TTabsAlign = 'start' | 'center' | 'end' | 'stretch'

export type TTabValue = string | number

export interface TTabItem {
  value: TTabValue
  label?: string
  icon?: string
  disabled?: boolean
  badge?: string | number
}

const props = withDefaults(
  defineProps<{
    modelValue?: TTabValue
    tabs: TTabItem[]
    variant?: TTabsVariant
    size?: TTabsSize
    align?: TTabsAlign
    ariaLabel?: string
  }>(),
  {
    variant: 'underline',
    size: 'default',
    align: 'start'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: TTabValue]
  'change': [value: TTabValue]
}>()

const slots = useSlots()
const uid = Math.random().toString(36).slice(2, 9)

const enabledTabs = computed(() => props.tabs.filter((t) => !t.disabled))

const activeValue = computed<TTabValue | undefined>(() => {
  if (props.modelValue !== undefined) {
    const exists = props.tabs.some((t) => t.value === props.modelValue)
    if (exists) return props.modelValue
  }
  return enabledTabs.value[0]?.value
})

const tabRefs = ref<Record<string, HTMLButtonElement | null>>({})
const setTabRef = (value: TTabValue) => (el: Element | null) => {
  tabRefs.value[String(value)] = el as HTMLButtonElement | null
}

const tabId = (value: TTabValue) => `t-tab-${uid}-${String(value)}`
const panelId = (value: TTabValue) => `t-tab-panel-${uid}-${String(value)}`

const isActive = (value: TTabValue) => activeValue.value === value

const select = (value: TTabValue) => {
  if (value === activeValue.value) return
  emit('update:modelValue', value)
  emit('change', value)
}

const focusTab = async (value: TTabValue) => {
  await nextTick()
  tabRefs.value[String(value)]?.focus()
}

const onKeydown = (event: KeyboardEvent, currentValue: TTabValue) => {
  const items = enabledTabs.value
  if (items.length === 0) return

  const idx = items.findIndex((t) => t.value === currentValue)
  let nextIdx = -1

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      nextIdx = (idx + 1) % items.length
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      nextIdx = (idx - 1 + items.length) % items.length
      break
    case 'Home':
      nextIdx = 0
      break
    case 'End':
      nextIdx = items.length - 1
      break
    default:
      return
  }

  event.preventDefault()
  const next = items[nextIdx]
  if (!next) return
  select(next.value)
  focusTab(next.value)
}

watch(
  () => props.modelValue,
  (val) => {
    if (val === undefined) return
    const exists = props.tabs.some((t) => t.value === val)
    if (!exists) return
    const found = props.tabs.find((t) => t.value === val)
    if (found?.disabled) return
  }
)

const hasPanelSlot = (value: TTabValue) =>
  Boolean(slots[`panel-${String(value)}`])
</script>

<template>
  <div class="t-tabs" :variant="variant" :size="size" :align="align">
    <div
      class="t-tabs__list"
      role="tablist"
      :aria-label="ariaLabel"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :ref="setTabRef(tab.value)"
        type="button"
        class="t-tabs__tab"
        role="tab"
        :id="tabId(tab.value)"
        :aria-controls="panelId(tab.value)"
        :aria-selected="isActive(tab.value)"
        :aria-disabled="tab.disabled || undefined"
        :tabindex="isActive(tab.value) ? 0 : -1"
        :disabled="tab.disabled"
        :class="{ 'is-active': isActive(tab.value), 'is-disabled': tab.disabled }"
        @click="!tab.disabled && select(tab.value)"
        @keydown="onKeydown($event, tab.value)"
      >
        <slot :name="`tab-${String(tab.value)}`" :tab="tab" :active="isActive(tab.value)">
          <Icon v-if="tab.icon" :icon="tab.icon" class="t-tabs__tab-icon" />
          <span v-if="tab.label" class="t-tabs__tab-label">{{ tab.label }}</span>
          <span v-if="tab.badge !== undefined" class="t-tabs__tab-badge">{{ tab.badge }}</span>
        </slot>
      </button>
    </div>

    <template v-for="tab in tabs" :key="`panel-${tab.value}`">
      <div
        v-if="isActive(tab.value) && hasPanelSlot(tab.value)"
        class="t-tabs__panel"
        role="tabpanel"
        :id="panelId(tab.value)"
        :aria-labelledby="tabId(tab.value)"
        tabindex="0"
      >
        <slot :name="`panel-${String(tab.value)}`" :tab="tab" />
      </div>
    </template>

    <div
      v-if="$slots.default && activeValue !== undefined"
      class="t-tabs__panel"
      role="tabpanel"
      :id="panelId(activeValue)"
      :aria-labelledby="tabId(activeValue)"
      tabindex="0"
    >
      <slot :active="activeValue" />
    </div>
  </div>
</template>

<style scoped>
.t-tabs {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.t-tabs__list {
  display: flex;
  gap: var(--t-tabs-list-gap, 0);
  min-width: 0;
}

.t-tabs[align='center'] .t-tabs__list { justify-content: center; }
.t-tabs[align='end']    .t-tabs__list { justify-content: flex-end; }
.t-tabs[align='stretch'] .t-tabs__list > .t-tabs__tab { flex: 1; }

.t-tabs__tab {
  display: inline-flex;
  align-items: center;
  gap: var(--t-space-2);
  padding: var(--t-tabs-tab-py) var(--t-tabs-tab-px);
  font-family: inherit;
  font-size: var(--t-tabs-font-size);
  font-weight: 500;
  line-height: 1.2;
  color: var(--t-color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.t-tabs__tab:hover:not(.is-disabled):not(.is-active) {
  color: var(--t-color-text);
}

.t-tabs__tab:focus-visible {
  outline: 2px solid var(--t-color-accent);
  outline-offset: -2px;
  border-radius: var(--t-radius-default);
}

.t-tabs__tab.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.t-tabs__tab-icon {
  font-size: 1.15em;
  flex-shrink: 0;
}

.t-tabs__tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25em;
  height: 1.25em;
  padding: 0 0.35em;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 14%, transparent);
  color: inherit;
  font-size: 0.8em;
  font-weight: 600;
}

.t-tabs__panel {
  flex: 1;
  min-width: 0;
  outline: none;
}

.t-tabs__panel:focus-visible {
  outline: 2px solid var(--t-color-accent);
  outline-offset: 2px;
  border-radius: var(--t-radius-default);
}

/* ========================================
   SIZE VARIANTS
   ======================================== */
.t-tabs[size='small'] {
  --t-tabs-tab-py: 0.5rem;
  --t-tabs-tab-px: 0.875rem;
  --t-tabs-font-size: var(--t-font-size-small);
}
.t-tabs[size='default'] {
  --t-tabs-tab-py: 0.75rem;
  --t-tabs-tab-px: 1.25rem;
  --t-tabs-font-size: var(--t-font-size-default);
}
.t-tabs[size='medium'] {
  --t-tabs-tab-py: 0.875rem;
  --t-tabs-tab-px: 1.5rem;
  --t-tabs-font-size: var(--t-font-size-medium);
}

/* ========================================
   VARIANT: UNDERLINE (default)
   ======================================== */
.t-tabs[variant='underline'] .t-tabs__list {
  border-bottom: 1px solid var(--t-color-border);
}

.t-tabs[variant='underline'] .t-tabs__tab {
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.t-tabs[variant='underline'] .t-tabs__tab.is-active {
  color: var(--t-color-accent);
  border-bottom-color: var(--t-color-accent);
}

/* ========================================
   VARIANT: PILLS
   ======================================== */
.t-tabs[variant='pills'] {
  --t-tabs-list-gap: var(--t-space-1);
}

.t-tabs[variant='pills'] .t-tabs__tab {
  border-radius: var(--t-radius-medium);
}

.t-tabs[variant='pills'] .t-tabs__tab:hover:not(.is-disabled):not(.is-active) {
  background: color-mix(in srgb, var(--t-color-text) 6%, transparent);
}

.t-tabs[variant='pills'] .t-tabs__tab.is-active {
  color: var(--t-color-accent);
  background: var(--t-color-accent-plain-bg);
}

/* ========================================
   VARIANT: SEGMENTED
   ======================================== */
.t-tabs[variant='segmented'] .t-tabs__list {
  display: inline-flex;
  padding: var(--t-space-1);
  background: color-mix(in srgb, var(--t-color-text) 6%, transparent);
  border-radius: var(--t-radius-medium);
  gap: 2px;
  align-self: flex-start;
}

.t-tabs[variant='segmented'][align='stretch'] .t-tabs__list {
  display: flex;
  align-self: stretch;
}

.t-tabs[variant='segmented'] .t-tabs__tab {
  border-radius: calc(var(--t-radius-medium) - 2px);
  --t-tabs-tab-py: 0.375rem;
}

.t-tabs[variant='segmented'][size='small'] .t-tabs__tab { --t-tabs-tab-py: 0.25rem; }
.t-tabs[variant='segmented'][size='medium'] .t-tabs__tab { --t-tabs-tab-py: 0.5rem; }

.t-tabs[variant='segmented'] .t-tabs__tab:hover:not(.is-disabled):not(.is-active) {
  color: var(--t-color-text);
}

.t-tabs[variant='segmented'] .t-tabs__tab.is-active {
  color: var(--t-color-text);
  background: var(--t-color-surface);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--t-color-border);
}
</style>
