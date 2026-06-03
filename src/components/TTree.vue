<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, ref, watch } from 'vue'
import Icon from './TIcon.vue'

// ─── Public types ────────────────────────────────────────────────────────────

export interface TTreeNodeSlotProps<N = Record<string, unknown>> {
  /** The internal tree node wrapper (contains `key`, `level`, `children`) */
  node: TTreeNode<N>
  /** The raw data item */
  data: N
  /** Whether this node is currently expanded */
  expanded: boolean
  /** Depth level starting at 0 */
  level: number
}

export interface TTreeNode<N = Record<string, unknown>> {
  key: string | number
  data: N
  level: number
  children: TTreeNode<N>[]
  hasChildren: boolean
}

export interface TTreeProps<N = Record<string, unknown>> {
  /** Tree data array */
  data: N[]
  /** Key on each node object that holds the unique identifier */
  nodeKey: string
  /** Key on each node object that holds the children array (default: 'children') */
  childrenKey?: string
  /** Keys of nodes that should be expanded by default (uncontrolled mode) */
  defaultExpandedKeys?: (string | number)[]
  /** Controlled expanded keys — use with v-model:expandedKeys */
  expandedKeys?: (string | number)[]
}

// ─── Props / emits / slots ────────────────────────────────────────────────────

const props = withDefaults(defineProps<TTreeProps<T>>(), {
  childrenKey: 'children',
  defaultExpandedKeys: () => [],
  expandedKeys: undefined,
})

const emit = defineEmits<{
  'node-click': [data: T, node: TTreeNode<T>]
  'update:expandedKeys': [keys: (string | number)[]]
}>()

defineSlots<{
  node?: (props: TTreeNodeSlotProps<T>) => unknown
}>()

// ─── Expansion state ─────────────────────────────────────────────────────────

/** Uncontrolled internal state — only used when `expandedKeys` prop is absent */
const internalExpanded = ref<Set<string | number>>(
  new Set(props.defaultExpandedKeys),
)

const isControlled = computed(() => props.expandedKeys !== undefined)

const expandedSet = computed<Set<string | number>>(() => {
  if (isControlled.value) {
    return new Set(props.expandedKeys!)
  }
  return internalExpanded.value
})

// Sync internal state when switching from uncontrolled → controlled externally.
watch(
  () => props.expandedKeys,
  (next) => {
    if (next !== undefined) {
      internalExpanded.value = new Set(next)
    }
  },
)

function isExpanded(key: string | number): boolean {
  return expandedSet.value.has(key)
}

function toggleNode(key: string | number) {
  const next = new Set(expandedSet.value)
  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }

  if (isControlled.value) {
    emit('update:expandedKeys', Array.from(next))
  } else {
    internalExpanded.value = next
    emit('update:expandedKeys', Array.from(next))
  }
}

// ─── Tree building ───────────────────────────────────────────────────────────

function buildNodes(items: T[], level: number): TTreeNode<T>[] {
  return items.map((item) => {
    const key = item[props.nodeKey] as string | number
    const rawChildren = (item[props.childrenKey!] as T[] | undefined) ?? []
    const children = buildNodes(rawChildren, level + 1)
    return {
      key,
      data: item,
      level,
      children,
      hasChildren: children.length > 0,
    }
  })
}

const rootNodes = computed<TTreeNode<T>[]>(() => buildNodes(props.data, 0))

// ─── Flat visible list (avoids deep recursion in template) ───────────────────

function flatten(nodes: TTreeNode<T>[]): TTreeNode<T>[] {
  const result: TTreeNode<T>[] = []
  for (const node of nodes) {
    result.push(node)
    if (node.hasChildren && isExpanded(node.key)) {
      result.push(...flatten(node.children))
    }
  }
  return result
}

const visibleNodes = computed(() => flatten(rootNodes.value))

// ─── Handlers ────────────────────────────────────────────────────────────────

function onNodeClick(node: TTreeNode<T>) {
  emit('node-click', node.data, node)
}

function onToggleClick(event: MouseEvent, node: TTreeNode<T>) {
  event.stopPropagation()
  toggleNode(node.key)
}
</script>

<template>
  <div
    class="t-tree"
    role="tree"
  >
    <div
      v-for="node in visibleNodes"
      :key="node.key"
      class="t-tree__node"
      :class="[`level-${node.level}`, { 'has-children': node.hasChildren, 'is-expanded': isExpanded(node.key) }]"
      :style="{ '--t-tree-node-indent': `${node.level * 1.25}rem` }"
      role="treeitem"
      :aria-expanded="node.hasChildren ? isExpanded(node.key) : undefined"
      :aria-level="node.level + 1"
      @click="onNodeClick(node)"
    >
      <span class="t-tree__indent" />

      <button
        v-if="node.hasChildren"
        type="button"
        class="t-tree__toggle"
        :aria-label="isExpanded(node.key) ? 'Collapse' : 'Expand'"
        tabindex="-1"
        @click="onToggleClick($event, node)"
      >
        <Icon
          :icon="isExpanded(node.key) ? 'system-uicons:chevron-up' : 'system-uicons:chevron-down'"
          class="t-tree__toggle-icon"
          aria-hidden="true"
        />
      </button>
      <span
        v-else
        class="t-tree__toggle-placeholder"
      />

      <span class="t-tree__content">
        <slot
          name="node"
          :node="node"
          :data="node.data"
          :expanded="isExpanded(node.key)"
          :level="node.level"
        >
          <span class="t-tree__default-label">{{ node.key }}</span>
        </slot>
      </span>
    </div>
  </div>
</template>

<style scoped>
.t-tree {
  display: flex;
  flex-direction: column;
  color: var(--t-color-text);
  font-family: var(--t-font-ui);
  font-size: var(--t-font-size-default);
}

.t-tree__node {
  display: flex;
  align-items: center;
  gap: var(--t-space-1);
  padding: var(--t-space-1) var(--t-space-2);
  padding-left: calc(var(--t-tree-node-indent, 0rem) + var(--t-space-2));
  min-height: var(--t-control-h-small);
  cursor: pointer;
  border-radius: var(--t-radius-default);
  transition: background-color 120ms ease;
  user-select: none;
}

.t-tree__node:hover {
  background: color-mix(in srgb, var(--t-color-text) 5%, transparent);
}

.t-tree__node:focus-visible {
  outline: 2px solid var(--t-color-accent);
  outline-offset: -2px;
}

.t-tree__indent {
  flex-shrink: 0;
}

.t-tree__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--t-radius-small);
  cursor: pointer;
  color: var(--t-color-text-muted);
  transition: color 120ms ease, background-color 120ms ease;
}

.t-tree__toggle:hover {
  color: var(--t-color-text);
  background: color-mix(in srgb, var(--t-color-text) 8%, transparent);
}

.t-tree__toggle-placeholder {
  display: inline-flex;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
}

.t-tree__toggle-icon {
  font-size: 1em;
}

.t-tree__content {
  display: flex;
  align-items: center;
  gap: var(--t-space-2);
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.t-tree__default-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
