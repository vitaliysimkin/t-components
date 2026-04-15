<script setup lang="ts">
// Select: choose from options (strings/numbers/objects)
// Autocomplete: free text input with string suggestions
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import TInput from './TInput.vue'
import TDropdown from './TDropdown.vue'
import type { TElementSize } from './types'

type TOption = string | number | Record<string, any>

export interface TSelectProps {
  autocomplete?: boolean
  options?: Array<TOption>
  modelValue?: TOption | string | number | null
  disabled?: boolean
  placeholder?: string
  clearable?: boolean
  size?: TElementSize
  valueKey?: string
  labelKey?: string
  iconKey?: string
  searchable?: boolean
  loading?: boolean
  emptyText?: string
  loadingText?: string
  filterFn?: (option: TOption, query: string) => boolean
  loadOptions?: (query: string) => Promise<any[]>
  debounce?: number
  valueMode?: 'option' | 'value'
  inputProps?: Record<string, any>
}

const props = withDefaults(defineProps<TSelectProps>(), {
  autocomplete: false,
  options: () => [],
  valueKey: 'value',
  labelKey: 'label',
  iconKey: '',
  emptyText: 'No options',
  loadingText: 'Loading...',
  debounce: 300,
  valueMode: 'option',
  inputProps: () => ({}),
})

const dropdownRef = ref<InstanceType<typeof TDropdown> | null>(null)
const isOpen = ref(false)
const searchQuery = ref('')
const activeIndex = ref(0)
const internalOptions = ref<Array<TOption>>([])
const internalLoading = ref(false)
const requestSeq = ref(0)
const lastLoadedQuery = ref<string | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const emit = defineEmits<{
  'update:modelValue': [value: string | number | Record<string, any> | null]
  'clear': []
}>()

function commitAutocompleteValue() {
  if (props.autocomplete && searchQuery.value) {
    emit('update:modelValue', searchQuery.value)
  }
}

// Determine which options to use (async or sync)
const isAsyncMode = computed(() => !!props.loadOptions)
const currentOptions = computed(() => isAsyncMode.value ? internalOptions.value : props.options)
const isLoading = computed(() => props.loading || internalLoading.value)

// Helper to get value from option
function getValue(option: string | number | Record<string, any>): string | number {
  if (typeof option === 'string' || typeof option === 'number') {
    return option
  }
  return option[props.valueKey]
}

// Helper to get label from option
function getLabel(option: string | number | Record<string, any>): string {
  if (typeof option === 'string' || typeof option === 'number') {
    return option.toString()
  }
  if (option[props.labelKey] !== undefined) {
    return option[props.labelKey]?.toString()
  }
  return option[props.valueKey]?.toString()
}

// Helper to get icon from option
function getIcon(option: string | number | Record<string, any>): string | null {
  if (!props.iconKey) return null
  if (typeof option === 'string' || typeof option === 'number') {
    return null
  }
  return option[props.iconKey] ?? null
}

// Get display label for selected value
const displayLabel = computed(() => {
  if (isOpen.value && (props.searchable || props.autocomplete)) {
    return searchQuery.value || (props.modelValue ? getLabel(props.modelValue) : '')
  }
  
  if (!props.modelValue) return ''
  return getLabel(props.modelValue)
})

// Filter options based on search query
const filteredOptions = computed(() => {
  // In async mode, don't filter - options are already filtered by the server
  if (isAsyncMode.value) {
    return currentOptions.value
  }
  
  if ((!props.searchable && !props.autocomplete) || !searchQuery.value) {
    return currentOptions.value
  }
  
  const query = searchQuery.value
  return currentOptions.value.filter(option => {
    if (props.filterFn) {
      return props.filterFn(option, query)
    }
    // Default filtering: case-insensitive includes
    const label = getLabel(option).toLowerCase()
    return label.includes(query.toLowerCase())
  })
})

// Watch for dropdown open state to set activeIndex
watch(isOpen, (newVal) => {
  if (newVal) {
    // Load async options if in async mode and not loaded yet for current query
    if (isAsyncMode.value && lastLoadedQuery.value !== searchQuery.value) {
      loadAsyncOptions(searchQuery.value)
    }
    
    // If there's a selected value, find its index
    if (props.modelValue !== null && props.modelValue !== undefined) {
      const selectedIndex = filteredOptions.value.findIndex(
        opt => isSelected(opt)
      )
      activeIndex.value = selectedIndex >= 0 ? selectedIndex : 0
    } else {
      // Otherwise, activate first element
      activeIndex.value = 0
    }
  }
})

function isSelected(option: TOption): boolean {
  if (!props.modelValue) return false
  if (props.valueMode === 'value') {
    return getValue(option) === props.modelValue
  }
  return getValue(option) === getValue(props.modelValue as TOption)
}

// Watch filteredOptions to reset activeIndex if it goes out of bounds
watch(filteredOptions, (newOptions) => {
  if (activeIndex.value >= newOptions.length) {
    activeIndex.value = Math.max(0, newOptions.length - 1)
  }
})

// Async load function with debounce
async function loadAsyncOptions(query: string) {
  if (!props.loadOptions) return
  
  // Increment sequence and capture current value
  requestSeq.value++
  const currentSeq = requestSeq.value
  
  internalLoading.value = true
  try {
    const results = await props.loadOptions(query)
    
    // Only apply results if this is still the latest request
    if (currentSeq === requestSeq.value) {
      internalOptions.value = results || []
      lastLoadedQuery.value = query
      // Reset activeIndex to be within bounds
      if (activeIndex.value >= internalOptions.value.length) {
        activeIndex.value = Math.max(0, internalOptions.value.length - 1)
      }
    }
  } catch (error) {
    console.error('Error loading options:', error)
    // Only clear on error if this is still the latest request
    if (currentSeq === requestSeq.value) {
      internalOptions.value = []
    }
  } finally {
    // Only stop loading if this is still the latest request
    if (currentSeq === requestSeq.value) {
      internalLoading.value = false
    }
  }
}

// Watch searchQuery for async loading with debounce
watch(searchQuery, (newQuery) => {
  if (!isAsyncMode.value) return
  
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  // Set new debounced timer
  debounceTimer = setTimeout(() => {
    loadAsyncOptions(newQuery)
  }, props.debounce)
})

function selectOption(option: TOption) {
  const payload = props.valueMode === 'value' ? getValue(option) : option
  emit('update:modelValue', payload)
  searchQuery.value = ''
  dropdownRef.value?.close()
}

function handleClear() {
  emit('update:modelValue', null)
  emit('clear')
  searchQuery.value = ''
  dropdownRef.value?.close()
}

function handleInputChange(value: string | number) {
  if (props.searchable || props.autocomplete) {
    searchQuery.value = value?.toString() || ''
    if (!searchQuery.value) {
      // If search query is cleared it means user deleted selected value
      emit('update:modelValue', null)
    }
    if (!isOpen.value) {
      dropdownRef.value?.open()
    }
  }
}

function handleBlur() {
  if (props.autocomplete) commitAutocompleteValue()
  setTimeout(() => {
    if (!isOpen.value) {
      searchQuery.value = ''
    }
  }, 200)
}

function handleClose() {
  if (props.autocomplete) commitAutocompleteValue()
  searchQuery.value = ''
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        dropdownRef.value?.open()
      } else if (!isLoading.value && activeIndex.value < filteredOptions.value.length - 1) {
        activeIndex.value++
      }
      break

    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value) {
        dropdownRef.value?.open()
      } else if (!isLoading.value && activeIndex.value > 0) {
        activeIndex.value--
      }
      break

    case 'Enter':
      event.preventDefault()
      if (isOpen.value && !isLoading.value) {
        if (filteredOptions.value.length > 0) {
          const selectedOption = filteredOptions.value[activeIndex.value]
          if (selectedOption) selectOption(selectedOption)
        } else if (props.autocomplete) {
          commitAutocompleteValue()
          dropdownRef.value?.close()
        }
      } else if (!isOpen.value) {
        dropdownRef.value?.open()
      }
      break

    case 'Escape':
      event.preventDefault()
      if (isOpen.value) {
        dropdownRef.value?.close()
      }
      break
  }
}

function handleMouseEnter(index: number) {
  activeIndex.value = index
}
</script>

<template>
  <TDropdown ref="dropdownRef" v-model:is-open="isOpen" 
  :match-trigger-width="true" :disabled="disabled"
    style="display: block;width: 100%;"
    :offset="0" :closeOnPanelClick="false"
    @close="handleClose">
    <template #trigger="{ triggerProps }">
      <div v-bind="triggerProps" class="t-select__trigger"
        :show-pointer="!disabled ? '' : null"
        :disabled="disabled ? '' : null"
        @keydown="handleKeydown">
        <TInput 
          :model-value="displayLabel" 
          :readonly="!searchable && !autocomplete"
          :disabled="disabled"
          :placeholder="placeholder"
          :clearable="clearable"
          :size="size"
          :suffix-icon="isOpen ? 'system-uicons:chevron-up' : 'system-uicons:chevron-down'"
          v-bind="inputProps"
          @update:model-value="handleInputChange"
          @blur="handleBlur"
          @clear="handleClear"
        />
      </div>
    </template>

    <template #default>
      <ul class="t-select__list" :data-size="size || 'default'" v-show="!autocomplete || filteredOptions.length > 0">
        <!-- Loading state -->
        <li v-if="isLoading" class="t-select__state">
          {{ loadingText }}
        </li>
        
        <!-- Empty state -->
        <li v-else-if="filteredOptions.length === 0" class="t-select__state">
          {{ emptyText }}
        </li>
        
        <!-- Options list -->
        <li 
          v-else
          v-for="(option, index) in filteredOptions" 
          :key="getValue(option)"
          class="t-select__item"
            :class="{ 
              't-select__item--selected': isSelected(option),
            't-select__item--active': index === activeIndex
          }"
          @click="selectOption(option)"
          @mouseenter="handleMouseEnter(index)"
        >
          <Icon v-if="iconKey && getIcon(option)" :icon="getIcon(option)!" class="t-select__icon" />
          <span>{{ getLabel(option) }}</span>
        </li>
      </ul>
    </template>
  </TDropdown>
</template>

<style scoped>
.t-select__trigger  {
  width: 100%;
}

.t-select__trigger[disabled] {
  cursor: not-allowed;
}

.t-select__trigger[show-pointer] {
  cursor: pointer;
}

.t-select__trigger[show-pointer] :deep(input) {
  cursor: pointer;
}

.t-select__list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--t-color-border);
  border-radius: 4px;
  background-color: var(--t-color-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-height: 20em;
  overflow: auto;
}

.t-select__list[data-size="mini"] .t-select__item {
  font-size: var(--t-font-size-mini);
  padding: var(--t-space-1) var(--t-space-2);
}

.t-select__list[data-size="small"] .t-select__item {
  font-size: var(--t-font-size-small);
  padding: var(--t-space-2) var(--t-space-3);
}

.t-select__list[data-size="default"] .t-select__item {
  font-size: var(--t-font-size-default);
  padding: var(--t-space-2) var(--t-space-4);
}

.t-select__list[data-size="medium"] .t-select__item {
  font-size: var(--t-font-size-medium);
  padding: var(--t-space-3) var(--t-space-4);
}

.t-select__list[data-size="large"] .t-select__item {
  font-size: var(--t-font-size-large);
  padding: var(--t-space-3) var(--t-space-5);
}

.t-select__item {
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: var(--t-space-2);
}

.t-select__icon {
  flex-shrink: 0;
}

.t-select__item:hover {
  background-color: var(--t-color-surface);
}

.t-select__item:not(:last-child) {
  border-bottom: 1px solid var(--t-color-border);
}

.t-select__item--selected {
  background-color: var(--t-color-surface);
  font-weight: 500;
}

.t-select__item--active {
  background-color: var(--t-color-surface, rgba(0, 0, 0, 0.04));
}

.t-select__state {
  padding: var(--t-space-2) var(--t-space-4);
  color: var(--t-color-text-secondary, #999);
  text-align: center;
  cursor: default;
  user-select: none;
}

.t-select__list[data-size="mini"] .t-select__state {
  font-size: var(--t-font-size-mini);
  padding: var(--t-space-1) var(--t-space-2);
}

.t-select__list[data-size="small"] .t-select__state {
  font-size: var(--t-font-size-small);
  padding: var(--t-space-2) var(--t-space-3);
}

.t-select__list[data-size="medium"] .t-select__state {
  font-size: var(--t-font-size-medium);
  padding: var(--t-space-3) var(--t-space-4);
}

.t-select__list[data-size="large"] .t-select__state {
  font-size: var(--t-font-size-large);
  padding: var(--t-space-3) var(--t-space-5);
}
</style>
