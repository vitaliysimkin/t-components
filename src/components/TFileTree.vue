<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Button from './TButton.vue'
import Dropdown from './TDropdown.vue'
import Icon from './TIcon.vue'
import { buildPathTree, countFiles, findPath, flyoutSections, splitMiddle, type TPathNode } from './path-tree'

export interface TFileTreeProps {
  /** `/`-separated file paths */
  paths: string[]
  /** Selected file path (v-model) */
  modelValue?: string | null
  /** Tree collapsed into a rail (v-model:collapsed) */
  collapsed?: boolean
  label?: string
  rootLabel?: string
  rootFilesLabel?: string
  showTreeLabel?: string
  collapseLabel?: string
  /** Folder tooltip, `{count}` — number of files */
  filesText?: string
}

const props = withDefaults(defineProps<TFileTreeProps>(), {
  modelValue: null,
  collapsed: false,
  label: 'Files',
  rootLabel: 'root',
  rootFilesLabel: 'Files in root',
  showTreeLabel: 'Show tree',
  collapseLabel: 'Collapse tree',
  filesText: '{count} files',
})

const emit = defineEmits<{
  'update:modelValue': [path: string]
  'update:collapsed': [collapsed: boolean]
}>()

const nodes = computed(() => buildPathTree(props.paths))
const closed = ref(new Set<string>())

const selPath = computed(() => (props.modelValue === null ? null : findPath(nodes.value, props.modelValue)))
const onPath = computed(() => new Set((selPath.value ?? []).slice(0, -1).map((n) => n.key)))
const selFile = computed(() => selPath.value?.[selPath.value.length - 1] ?? null)

interface Row { node: TPathNode; level: number; guides: number[]; mid: [string, string] | null }

// Visible rows; `guides` — levels with a line next to the row (folders on the path to the selected file)
const rows = computed(() => {
  const out: Row[] = []
  const walk = (list: TPathNode[], level: number, guides: number[]) => {
    for (const node of list) {
      out.push({ node, level, guides, mid: splitMiddle(node.label) })
      if (node.children && !closed.value.has(node.key)) walk(node.children, level + 1, onPath.value.has(node.key) ? [...guides, level] : guides)
    }
  }
  walk(nodes.value, 0, [])
  return out
})

// Selected a file in a closed folder — open its folders
watch(onPath, (keys) => {
  if ([...keys].some((k) => closed.value.has(k))) closed.value = new Set([...closed.value].filter((k) => !keys.has(k)))
}, { immediate: true })

function toggle(key: string) {
  const next = new Set(closed.value)
  if (!next.delete(key)) next.add(key)
  closed.value = next
}

const indent = (level: number) => `calc(var(--t-space-2) + ${level} * var(--t-space-3))`

const railDirs = computed(() => nodes.value.filter((n) => n.children))
const rootFiles = computed(() => nodes.value.filter((n) => !n.children))
const railPath = computed(() => (selPath.value ?? []).slice(0, -1).map((n) => n.label).join(' / '))
</script>

<template>
  <nav
    class="t-file-tree"
    :class="{ 'is-collapsed': collapsed }"
    :aria-label="label"
  >
    <div class="t-file-tree__head">
      <Button
        mode="ghost"
        size="mini"
        icon="ticon:side-panel"
        :title="collapsed ? showTreeLabel : collapseLabel"
        :aria-label="collapsed ? showTreeLabel : collapseLabel"
        :aria-pressed="collapsed"
        @click="emit('update:collapsed', !collapsed)"
      />
      <span v-if="!collapsed">{{ label }}</span>
    </div>

    <div
      v-if="!collapsed"
      role="tree"
    >
      <button
        v-for="r in rows"
        :key="r.node.key"
        type="button"
        role="treeitem"
        class="t-file-tree__row"
        :class="{ 'is-dir': r.node.children, 'is-path': onPath.has(r.node.key), 'is-selected': r.node.key === modelValue }"
        :style="{ paddingLeft: indent(r.level) }"
        :title="r.node.children ? `${r.node.label} · ${filesText.replace('{count}', String(countFiles(r.node)))}` : r.node.key"
        :aria-expanded="r.node.children ? !closed.has(r.node.key) : undefined"
        :aria-selected="r.node.children ? undefined : r.node.key === modelValue"
        @click="r.node.children ? toggle(r.node.key) : emit('update:modelValue', r.node.key)"
      >
        <i
          v-for="g in r.guides"
          :key="g"
          class="t-file-tree__guide"
          :style="{ left: `calc(${indent(g)} + var(--t-space-2) - 1px)` }"
        />
        <Icon
          v-if="r.node.children"
          class="t-file-tree__icon"
          icon="ticon:folder"
        />
        <span
          v-if="r.mid"
          class="t-file-tree__name is-mid"
        ><span>{{ r.mid[0] }}</span>{{ r.mid[1] }}</span>
        <span
          v-else
          class="t-file-tree__name"
        >{{ r.node.label }}</span>
        <span
          v-if="closed.has(r.node.key) && onPath.has(r.node.key) && selFile"
          class="t-file-tree__hint"
        >› {{ selFile.label }}</span>
      </button>
    </div>

    <div
      v-else
      class="t-file-tree__rail"
    >
      <Dropdown
        v-for="d in [...(rootFiles.length ? [null] : []), ...railDirs]"
        :key="d?.key ?? ''"
        trigger="both"
        placement="bottom-start"
        card
      >
        <template #trigger="{ triggerProps }">
          <button
            type="button"
            class="t-file-tree__rail-btn"
            :class="{ 'is-path': d ? onPath.has(d.key) : selPath?.length === 1 }"
            :title="d?.label ?? rootFilesLabel"
            :aria-label="d?.label ?? rootFilesLabel"
            v-bind="triggerProps"
          >
            <Icon :icon="d ? 'ticon:folder' : 'ticon:file'" />
            <i>{{ d ? countFiles(d) : rootFiles.length }}</i>
          </button>
        </template>
        <div class="t-file-tree__fly">
          <template
            v-for="s in d ? flyoutSections(d) : [{ path: rootLabel, files: rootFiles }]"
            :key="s.path"
          >
            <div class="t-file-tree__fly-head">
              {{ s.path }}
            </div>
            <button
              v-for="n in s.files"
              :key="n.key"
              type="button"
              class="t-file-tree__row"
              :class="{ 'is-selected': n.key === modelValue }"
              :title="n.key"
              @click="emit('update:modelValue', n.key)"
            >
              <span class="t-file-tree__name">{{ n.label }}</span>
            </button>
          </template>
        </div>
      </Dropdown>
      <div
        v-if="selFile"
        class="t-file-tree__vpath"
        :title="selFile.key"
      >
        <b>{{ selFile.label }}</b> <span>{{ railPath }}</span>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.t-file-tree {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.t-file-tree__head {
  display: flex;
  align-items: center;
  gap: var(--t-space-2);
  padding: var(--t-space-1);
}

.is-collapsed .t-file-tree__head {
  justify-content: center;
}

.t-file-tree__row {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--t-space-1);
  width: 100%;
  min-height: var(--t-control-h-mini);
  padding: 0 var(--t-space-2);
  border: 0;
  border-radius: var(--t-radius-small);
  background: none;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
}

.t-file-tree__row:hover {
  background: var(--t-color-hover);
}

.t-file-tree__row.is-selected {
  color: var(--t-color-accent);
  font-weight: var(--t-font-weight-semibold);
  background: var(--t-color-accent-plain-bg);
}

.t-file-tree__row.is-path .t-file-tree__name {
  color: var(--t-color-accent);
  font-weight: var(--t-font-weight-medium);
}

.t-file-tree__icon {
  flex: none;
  color: var(--t-color-accent);
}

.t-file-tree__name {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.t-file-tree__name.is-mid {
  display: flex;
}

.t-file-tree__name.is-mid > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.t-file-tree__hint {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--t-font-size-mini);
  color: var(--t-color-accent);
}

.t-file-tree__guide {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--t-color-accent);
}

.t-file-tree__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--t-space-1);
  flex: 1 1 auto;
  min-height: 0;
}

.t-file-tree__rail-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--t-control-h-default);
  height: var(--t-control-h-default);
  border: 0;
  border-radius: var(--t-radius-default);
  background: none;
  color: var(--t-color-accent);
  font-size: var(--t-font-size-xlarge);
  cursor: pointer;
}

.t-file-tree__rail-btn:hover {
  background: var(--t-color-hover);
}

.t-file-tree__rail-btn.is-path {
  box-shadow: inset 0 0 0 1px var(--t-color-accent);
  background: var(--t-color-accent-plain-bg);
}

.t-file-tree__rail-btn > i {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 0 var(--t-space-1);
  border-radius: var(--t-radius-pill);
  font-size: var(--t-font-size-mini);
  line-height: var(--t-line-height-tight);
  font-style: normal;
  background: var(--t-color-surface-2);
  color: var(--t-color-text-muted);
}

.t-file-tree__vpath {
  flex: 1 1 auto;
  min-height: 0;
  margin-top: var(--t-space-2);
  padding-top: var(--t-space-2);
  border-top: 1px solid var(--t-color-border);
  writing-mode: vertical-rl;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: var(--t-font-size-mini);
}

.t-file-tree__vpath b {
  color: var(--t-color-accent);
}

.t-file-tree__vpath span {
  font-family: var(--t-font-mono);
  color: var(--t-color-text-muted);
}

.t-file-tree__fly {
  width: 16rem;
  max-height: 20rem;
  overflow: auto;
  padding: var(--t-space-1);
  font-size: var(--t-font-size-small);
}

.t-file-tree__fly-head {
  padding: var(--t-space-1) var(--t-space-2);
  font-size: var(--t-font-size-mini);
  color: var(--t-color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.t-file-tree__fly-head:not(:first-child) {
  margin-top: var(--t-space-1);
  border-top: 1px solid var(--t-color-border);
}
</style>
