<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  currentMotion, setMotion, useDialog, useNotifications,
  TButton, TButtonGroup, TDropdown, TSelect, TTabs, TCheckbox, TInput, TTextarea, TFormField,
  TTable, TBadge, TCopyChip, TCopyField, TCard, TEmpty, TDatePicker, TLogPane, TPathCrumbs, TTag,
  type MotionSetting, type TTableSort, type TLogLine,
} from '@vitaliysimkin/t-components'
import { TLogView } from '@vitaliysimkin/t-components/code-editor'

const motion = computed({
  get: () => currentMotion.value,
  set: (v: MotionSetting | null) => v && setMotion(v),
})
const motionOptions = ['full', 'reduced', 'off'].map((v) => ({ value: v, label: v }))

/* Button */
const saving = ref(false)
const enabled = ref(false)

/* Dropdown / select */
const selected = ref<string | null>(null)
const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']

/* Dialog / notifications */
const { confirm } = useDialog()
const notifications = useNotifications()

/* Tabs / group */
const tab = ref('one')
const tabs = [{ value: 'one', label: 'One' }, { value: 'two', label: 'Two' }, { value: 'three', label: 'Three' }]
const group = ref<string | number | null>('b')
const groupOptions = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }, { value: 'c', label: 'Gamma' }]

/* Checkbox / fields */
const checked = ref(false)
const text = ref('')
const note = ref('')
const invalid = ref(false)
const valid = computed(() => text.value.length >= 3)

/* Table */
interface Row { id: number, name: string, qty: number }
const rows = ref<Row[]>([{ id: 1, name: 'Bolt', qty: 40 }, { id: 2, name: 'Nut', qty: 12 }, { id: 3, name: 'Washer', qty: 75 }])
const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'qty', label: 'Qty', sortable: true, align: 'right' as const },
]
const sort = ref<TTableSort | null>(null)
const selection = ref<(string | number)[]>([])
const tableLoading = ref(false)
let rowId = 3
function addRow() {
  rowId++
  rows.value = [{ id: rowId, name: `Item ${rowId}`, qty: rowId * 7 }, ...rows.value]
}

/* Badge / tag */
const count = ref(3)
const tagVariants = ['gray', 'blue', 'green', 'orange', 'red'] as const
const tagIdx = ref(0)

/* Date picker */
const date = ref<Date | null>(new Date())

/* Log */
const lines = ref<TLogLine[]>(Array.from({ length: 12 }, (_, i) => ({ id: i, text: `line ${i}` })))
function addLine() {
  const id = lines.value.length
  lines.value = [...lines.value, { id, text: `line ${id}`, kind: id % 5 === 0 ? 'err' : 'out' }]
}

const logText = ref(Array.from({ length: 6 }, (_, i) => `2026-11-04 10:00:0${i} INFO line ${i}`).join('\n'))
function addLogText() {
  logText.value += `\n2026-11-04 10:00:${String(logText.value.split('\n').length).padStart(2, '0')} INFO line ${logText.value.split('\n').length}`
}
</script>

<template>
  <div class="page">
    <header class="page-head">
      <h1 class="page-head__title">
        Animations
      </h1>
      <span class="page-head__meta">built into the library components</span>
      <div class="page-head__motion">
        <span>data-t-motion</span>
        <TButtonGroup
          v-model="motion"
          :options="motionOptions"
          size="small"
          mandatory
        />
      </div>
    </header>

    <div class="grid">
      <section class="demo">
        <h3>TButton</h3>
        <div class="row">
          <TButton
            label="Press ripple"
            variant="accent"
          />
          <TButton
            label="Hover"
          />
          <TButton
            label="Focus (Tab)"
            mode="outlined"
          />
        </div>
        <div class="row">
          <TButton
            :class="{ 'is-loading': saving }"
            :label="saving ? 'Saving…' : 'Save (breathing)'"
            variant="accent"
            @click="saving = !saving"
          />
          <TButton
            :disabled="!enabled"
            label="Shine"
          />
          <TCheckbox
            v-model="enabled"
            label="enabled"
          />
        </div>
      </section>

      <section class="demo">
        <h3>TDropdown / TSelect</h3>
        <div class="row">
          <TDropdown>
            <template #trigger="{ triggerProps }">
              <TButton
                v-bind="triggerProps"
                label="Dropdown"
              />
            </template>
            <div class="menu">
              <div
                v-for="f in fruits"
                :key="f"
                class="menu__item"
              >
                {{ f }}
              </div>
            </div>
          </TDropdown>
          <TSelect
            v-model="selected"
            :options="fruits"
            placeholder="Select"
            clearable
          />
        </div>
      </section>

      <section class="demo">
        <h3>Dialog / notifications</h3>
        <div class="row">
          <TButton
            label="Open dialog"
            @click="confirm({ title: 'Zoom', message: 'Opens from the button.' })"
          />
          <TButton
            label="Notify"
            @click="notifications.push('success', 'Saved', 4000)"
          />
          <TButton
            label="Error"
            @click="notifications.push('error', 'Failed', 4000)"
          />
        </div>
      </section>

      <section class="demo">
        <h3>TTabs / TButtonGroup</h3>
        <TTabs
          v-model="tab"
          :tabs="tabs"
        />
        <TButtonGroup
          v-model="group"
          :options="groupOptions"
          mandatory
        />
      </section>

      <section class="demo">
        <h3>TCheckbox</h3>
        <div class="row">
          <TCheckbox
            v-model="checked"
            label="Springy"
          />
          <TCheckbox
            :model-value="false"
            indeterminate
            label="Indeterminate"
          />
          <TCheckbox
            v-model="checked"
            :indeterminate="!checked"
            label="Indeterminate to check"
          />
        </div>
      </section>

      <section class="demo">
        <h3>Inputs / TFormField</h3>
        <TInput
          v-model="text"
          placeholder="Focus ring, clear, 3+ chars"
          clearable
          :suffix-icon="valid ? 'material-symbols-light:check' : undefined"
        />
        <TInput
          model-value=""
          placeholder="Error"
          :error="invalid"
        />
        <TTextarea
          v-model="note"
          placeholder="Textarea"
          :rows="2"
          :error="invalid"
        />
        <TFormField
          label="Field"
          :error="invalid ? 'Required' : undefined"
        >
          <TSelect
            :options="fruits"
            :error="invalid"
          />
        </TFormField>
        <TButton
          :label="invalid ? 'Clear errors' : 'Show errors'"
          @click="invalid = !invalid"
        />
      </section>

      <section class="demo demo--wide">
        <h3>TTable</h3>
        <div class="row">
          <TButton
            label="Add row"
            @click="addRow"
          />
          <TButton
            label="Toggle loading"
            @click="tableLoading = !tableLoading"
          />
        </div>
        <TTable
          v-model:sort="sort"
          v-model:selection="selection"
          :columns="columns"
          :rows="rows"
          row-key="id"
          :loading="tableLoading"
          client-side-sort
          selectable
        />
      </section>

      <section class="demo">
        <h3>TBadge / TTag</h3>
        <div class="row">
          <TBadge :value="count">
            <TButton label="Inbox" />
          </TBadge>
          <TBadge dot>
            <TButton label="Dot" />
          </TBadge>
          <TButton
            label="+1"
            @click="count++"
          />
          <TTag
            :variant="tagVariants[tagIdx]"
            :label="tagVariants[tagIdx]"
          />
          <TButton
            label="Change tag"
            @click="tagIdx = (tagIdx + 1) % tagVariants.length"
          />
        </div>
      </section>

      <section class="demo">
        <h3>TCopyChip / TCopyField</h3>
        <TCopyChip value="npm i @vitaliysimkin/t-components" />
        <TCopyField value="https://example.com/share/abc" />
      </section>

      <section class="demo">
        <h3>TCard</h3>
        <TCard
          header="Hover me"
        >
          Hover accent.
        </TCard>
        <a href="#anim-target">Go to the card below</a>
        <TCard
          id="anim-target"
          header="Target"
        >
          Flashes when navigated to.
        </TCard>
      </section>

      <section class="demo">
        <h3>TEmpty</h3>
        <TEmpty description="Nothing here yet" />
      </section>

      <section class="demo">
        <h3>TDatePicker</h3>
        <TDatePicker v-model="date" />
      </section>

      <section class="demo">
        <h3>TLogPane</h3>
        <TButton
          label="Add line"
          @click="addLine"
        />
        <TLogPane
          :lines="lines"
          height="160px"
        />
      </section>

      <section class="demo">
        <h3>TLogView</h3>
        <TButton
          label="Add line"
          @click="addLogText"
        />
        <TLogView
          :text="logText"
          height="160px"
        />
      </section>

      <section class="demo">
        <h3>TPathCrumbs</h3>
        <TPathCrumbs path="src/components/TButton.vue" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--t-space-4);
  padding: var(--t-space-5) var(--t-space-6) var(--t-space-7);
  max-width: 1100px;
}

.page-head {
  display: flex;
  align-items: baseline;
  gap: var(--t-space-3);
  flex-wrap: wrap;
}

.page-head__title {
  margin: 0;
  font-size: var(--t-font-size-h1);
  font-weight: var(--t-font-weight-semibold);
  line-height: var(--t-line-height-tight);
}

.page-head__meta {
  color: var(--t-color-text-muted);
  font-size: var(--t-font-size-small);
}

.page-head__motion {
  display: flex;
  align-items: center;
  gap: var(--t-space-2);
  margin-left: auto;
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--t-space-4);
}

.demo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--t-space-3);
  padding: var(--t-space-4);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-large);
  background: var(--t-color-surface);
}

.demo--wide {
  grid-column: 1 / -1;
}

.demo h3 {
  margin: 0;
  font-size: var(--t-font-size-default);
  font-weight: var(--t-font-weight-semibold);
}

.demo > * {
  max-width: 100%;
}

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--t-space-3);
}

.menu {
  min-width: 160px;
  padding: var(--t-space-1);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-medium);
  background: var(--t-color-surface);
}

.menu__item {
  padding: var(--t-space-2) var(--t-space-3);
  border-radius: var(--t-radius-default);
  cursor: pointer;
}

.menu__item:hover {
  background: var(--t-color-hover);
}
</style>
