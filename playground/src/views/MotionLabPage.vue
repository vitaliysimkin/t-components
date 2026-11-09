<template>
  <div class="lab">
    <header class="lab__bar">
      <h1>Motion lab</h1>
      <div class="lab__speed">
        <span>Уповільнення</span>
        <TButtonGroup
          v-model="slow"
          :options="slowOptions"
          size="small"
          mandatory
        />
      </div>
      <div class="lab__speed">
        <span>Оброблено {{ doneCount }}/{{ ideas.length }}</span>
        <TSwitch
          v-model="hideDone"
          label="Приховати оброблені"
        />
      </div>
      <div class="lab__speed">
        <TSwitch
          v-model="onlyDiscuss"
          :label="`Лише «Потрібно обговорити» (${discussCount})`"
        />
      </div>
    </header>
    <div class="lab__head">
      <p>
        50 анімацій на реальних компонентах (20 базових + 30 на основі гайдлайнів Material 3, Apple HIG, NN/g, Carbon, Fluent, WCAG). У кожному рядку: «як зараз» і 3 варіанти, з якими можна взаємодіяти.
        Варіанти зроблені локальним CSS цієї сторінки, бібліотека не змінена.
      </p>
    </div>

    <section
      v-for="(idea, n) in ideas"
      v-show="!(hideDone && done[idea.key]) && (!onlyDiscuss || picks[idea.key]?.discuss)"
      :key="idea.key"
      class="lab-idea"
      :class="{ 'is-done': done[idea.key] }"
    >
      <div class="lab-idea__head">
        <span class="lab-idea__num">{{ n + 1 }}</span>
        <h2>{{ idea.name }}</h2>
        <span
          v-for="c in idea.comps"
          :key="c"
          class="lab-idea__comp"
        >{{ c }}</span>
        <TCheckbox
          v-model="done[idea.key]"
          label="Оброблено"
          class="lab-idea__done"
        />
      </div>
      <p
        v-if="idea.source"
        class="lab-idea__source"
      >
        Джерело: {{ idea.source }}
      </p>

      <div class="lab-row">
        <div
          v-for="v in idea.variants"
          :key="v.id"
          :ref="(el) => setCell(idea.key, v.id, el)"
          class="lab-cell"
          :class="[
            `lab-${idea.key}-${v.id}`,
            { 'is-now': v.id === 'now', 'is-chosen': v.id === 'chosen', 'is-picked': picks[idea.key].pick === v.id, 'is-touched': touched[k(idea.key, v.id)] }
          ]"
          @pointerenter="setBody(idea.key, v.id)"
          @focusin="setBody(idea.key, v.id)"
          @pointerdown.capture="touch(idea.key, v.id)"
          @keydown.capture="touch(idea.key, v.id)"
        >
          <div class="lab-cell__tag">
            {{ v.id === 'now' ? 'Як зараз' : v.id === 'chosen' ? 'Обрано' : v.id.toUpperCase() }}
          </div>

          <div class="lab-stage">
            <!-- 1. Button -->
            <template v-if="idea.key === 'button'">
              <TButton
                variant="accent"
                icon="system-uicons:check"
                label="Continue"
                :class="{ 'lab-clip': v.id === 'chosen' }"
                @pointerdown="(e: PointerEvent) => v.id === 'chosen' && sinkDown(e)"
                @pointerup="(e: PointerEvent) => v.id === 'chosen' && sinkUp(e)"
                @pointerleave="(e: PointerEvent) => v.id === 'chosen' && sinkUp(e)"
                @pointercancel="(e: PointerEvent) => v.id === 'chosen' && sinkUp(e)"
                @click="(e: MouseEvent) => v.id === 'chosen' && e.detail === 0 && replay(e.currentTarget as HTMLElement, 'lab-spring')"
              />
            </template>

            <!-- 2. Dropdown -->
            <template v-else-if="idea.key === 'dropdown'">
              <TDropdown card>
                <template #trigger="{ triggerProps }">
                  <TButton
                    v-bind="triggerProps"
                    icon="system-uicons:menu-vertical"
                    label="Дії"
                  />
                </template>
                <div class="lab-menu">
                  <div>Перейменувати</div>
                  <div>Дублювати</div>
                  <div>Видалити</div>
                </div>
              </TDropdown>
            </template>

            <!-- 3. Tooltip -->
            <template v-else-if="idea.key === 'tooltip'">
              <TTooltip content="Зберегти зміни">
                <TButton
                  mode="plain"
                  icon="system-uicons:document"
                  label="Наведіть"
                />
              </TTooltip>
            </template>

            <!-- 4. Dialog -->
            <template v-else-if="idea.key === 'dialog'">
              <TButton
                variant="danger"
                mode="plain"
                icon="system-uicons:trash"
                label="Видалити"
                @click="openDialog(v.id, $event)"
              />
            </template>

            <!-- 5. Notifications -->
            <template v-else-if="idea.key === 'notify'">
              <TButton
                icon="system-uicons:bell"
                label="Показати"
                @click="notify.success('Файл збережено', 2500)"
              />
            </template>

            <!-- 6. Tabs -->
            <template v-else-if="idea.key === 'tabs'">
              <TTabs
                v-model="tabs[k(idea.key, v.id)]"
                :tabs="tabItems"
                size="small"
              />
              <span
                v-if="v.id === 'v1' && ind[k(idea.key, v.id)]"
                class="lab-tabline"
                :style="indStyle(k(idea.key, v.id), 'line')"
              />
            </template>

            <!-- 7. Segmented toggle -->
            <template v-else-if="idea.key === 'segment'">
              <span
                v-if="v.id === 'v1' && ind[k(idea.key, v.id)]"
                class="lab-thumb"
                :style="indStyle(k(idea.key, v.id), 'box')"
              />
              <TButtonGroup
                v-model="segs[k(idea.key, v.id)]"
                :options="segOptions"
                size="small"
                mandatory
              />
            </template>

            <!-- 8. Checkbox -->
            <template v-else-if="idea.key === 'checkbox'">
              <TCheckbox
                v-model="flags[k(idea.key, v.id)]"
                label="Запам'ятати мене"
              />
            </template>

            <!-- 9. Switch -->
            <template v-else-if="idea.key === 'switch'">
              <TSwitch
                v-model="flags[k(idea.key, v.id)]"
                label="Сповіщення"
              />
            </template>

            <!-- 10. Input focus -->
            <template v-else-if="idea.key === 'focus'">
              <TInput
                v-model="texts[k(idea.key, v.id)]"
                prefix-icon="system-uicons:search"
                placeholder="Пошук"
              />
            </template>

            <!-- 11. Field error -->
            <template v-else-if="idea.key === 'error'">
              <div class="lab-form">
                <TFormField
                  label="Email"
                  :error="errors[k(idea.key, v.id)]"
                >
                  <template #default="{ id }">
                    <TInput
                      :id="id"
                      v-model="texts[k(idea.key, v.id)]"
                      placeholder="you@example.com"
                    />
                  </template>
                </TFormField>
                <TButton
                  size="small"
                  label="Надіслати"
                  @click="validate(idea.key, v.id)"
                />
              </div>
            </template>

            <!-- 12. Clear button -->
            <template v-else-if="idea.key === 'clear'">
              <TInput
                v-model="texts[k(idea.key, v.id)]"
                clearable
                placeholder="Введіть текст"
              />
            </template>

            <!-- 13. Tree -->
            <template v-else-if="idea.key === 'tree'">
              <TTree
                :data="treeData"
                node-key="path"
                class="lab-tree"
              >
                <template #node="{ data: node }">
                  <span>{{ node.name }}</span>
                </template>
              </TTree>
            </template>

            <!-- 14. Table -->
            <template v-else-if="idea.key === 'table'">
              <div class="lab-table">
                <TTable
                  :columns="tableCols"
                  :rows="rows[k(idea.key, v.id)]"
                  row-key="id"
                  size="small"
                />
                <TButton
                  size="small"
                  label="Додати рядок"
                  @click="addRow(idea.key, v.id)"
                />
              </div>
            </template>

            <!-- 15. Badge count -->
            <template v-else-if="idea.key === 'count'">
              <TBadge
                :key="counts[k(idea.key, v.id)]"
                :value="counts[k(idea.key, v.id)]"
              >
                <TButton
                  icon="system-uicons:mail"
                  label="+1"
                  @click="counts[k(idea.key, v.id)]++"
                />
              </TBadge>
            </template>

            <!-- 16. Badge dot -->
            <template v-else-if="idea.key === 'dot'">
              <TBadge
                dot
                :hidden="!flags[k(idea.key, v.id)]"
              >
                <TButton
                  icon="system-uicons:inbox"
                  :label="flags[k(idea.key, v.id)] ? 'Прочитати' : 'Нове'"
                  @click="flags[k(idea.key, v.id)] = !flags[k(idea.key, v.id)]"
                />
              </TBadge>
            </template>

            <!-- 17. Tags -->
            <template v-else-if="idea.key === 'tags'">
              <div class="lab-tags">
                <TransitionGroup
                  :name="v.id === 'now' ? 'lab-none' : `lab-tag-${v.id}`"
                  tag="div"
                  class="lab-tags__list"
                >
                  <TTag
                    v-for="t in tagLists[k(idea.key, v.id)]"
                    :key="t"
                    :label="t"
                    variant="blue"
                    removable
                    @remove="removeTag(idea.key, v.id, t)"
                  />
                </TransitionGroup>
                <TButton
                  size="small"
                  mode="plain"
                  label="+ тег"
                  @click="addTag(idea.key, v.id)"
                />
              </div>
            </template>

            <!-- 18. Copy -->
            <template v-else-if="idea.key === 'copy'">
              <span
                class="lab-copy"
                @click="fire(idea.key, v.id)"
              >
                <TCopyChip value="npm i @vitaliysimkin/t-components" />
                <span
                  v-if="v.id === 'v2' && fired[k(idea.key, v.id)]"
                  :key="fired[k(idea.key, v.id)]"
                  class="lab-copy__bubble"
                >Скопійовано</span>
              </span>
            </template>

            <!-- 19. Card -->
            <template v-else-if="idea.key === 'card'">
              <TCard
                header="Звіт за жовтень"
                class="lab-card"
              >
                Наведіть курсор
              </TCard>
            </template>

            <!-- 20. Empty -->
            <template v-else-if="idea.key === 'empty'">
              <div class="lab-empty">
                <TEmpty
                  :key="counts[k(idea.key, v.id)]"
                  description="Тут поки нічого немає"
                />
                <TButton
                  size="small"
                  mode="text"
                  label="Показати ще раз"
                  @click="counts[k(idea.key, v.id)]++"
                />
              </div>
            </template>

            <!-- 21. Split pane handle -->
            <template v-else-if="idea.key === 'split'">
              <div class="lab-split">
                <TSplitPane
                  :default-size="110"
                  :min="60"
                >
                  <template #start>
                    <div class="lab-pane">
                      Список
                    </div>
                  </template>
                  <template #end>
                    <div class="lab-pane">
                      Деталі
                    </div>
                  </template>
                </TSplitPane>
              </div>
            </template>

            <!-- 22. Collapse -->
            <template v-else-if="idea.key === 'collapse'">
              <div class="lab-collapse">
                <TButton
                  size="small"
                  mode="plain"
                  :icon="v.id === 'v3' ? 'system-uicons:chevron-down' : flags[k(idea.key, v.id)] ? 'system-uicons:chevron-up' : 'system-uicons:chevron-down'"
                  :class="{ 'is-open': flags[k(idea.key, v.id)] }"
                  label="Деталі замовлення"
                  @click="flags[k(idea.key, v.id)] = !flags[k(idea.key, v.id)]"
                />
                <TCollapseTransition>
                  <div
                    v-if="flags[k(idea.key, v.id)]"
                    class="lab-collapse__body"
                  >
                    <div class="lab-collapse__inner">
                      Доставка: 12 листопада<br>Оплата: карткою<br>Сума: 1 240 ₴
                    </div>
                  </div>
                </TCollapseTransition>
              </div>
            </template>

            <!-- 23. Scoped loading -->
            <template v-else-if="idea.key === 'loading'">
              <div class="lab-loading">
                <div
                  :ref="(el) => setLoadTarget(k(idea.key, v.id), el)"
                  class="lab-loading__box"
                >
                  Квартальний звіт
                </div>
                <div class="lab-inline">
                  <TButton
                    size="small"
                    label="200 мс"
                    @click="runLoading(idea.key, v.id, 200)"
                  />
                  <TButton
                    size="small"
                    label="1.5 с"
                    @click="runLoading(idea.key, v.id, 1500)"
                  />
                </div>
              </div>
            </template>

            <!-- 24. Table loading -->
            <template v-else-if="idea.key === 'tableload'">
              <div class="lab-table">
                <TTable
                  :columns="tableCols"
                  :rows="flags[k(idea.key, v.id)] ? [] : rows[k(idea.key, v.id)]"
                  :loading="flags[k(idea.key, v.id)]"
                  row-key="id"
                  size="small"
                />
                <TButton
                  size="small"
                  label="Оновити"
                  @click="reloadTable(idea.key, v.id)"
                />
              </div>
            </template>

            <!-- 25. Table sort -->
            <template v-else-if="idea.key === 'sort'">
              <div
                class="lab-table"
                @pointerdown.capture="v.id === 'v3' && recordRows(idea.key, v.id)"
              >
                <TTable
                  :columns="sortCols"
                  :rows="sortRows"
                  :sort="sorts[k(idea.key, v.id)]"
                  client-side-sort
                  row-key="id"
                  size="small"
                  @update:sort="(s) => onSort(idea.key, v.id, s)"
                />
              </div>
            </template>

            <!-- 26. Table selection -->
            <template v-else-if="idea.key === 'select-row'">
              <div class="lab-table">
                <TTable
                  v-model:selection="selections[k(idea.key, v.id)]"
                  :columns="tableCols"
                  :rows="rows[k(idea.key, v.id)]"
                  row-key="id"
                  size="small"
                  selectable
                />
              </div>
            </template>

            <!-- 27. Date picker: month change -->
            <template v-else-if="idea.key === 'month'">
              <div
                class="lab-dp"
                @click.capture="onDpClick(idea.key, v.id, $event)"
              >
                <TDatePicker v-model="dates[k(idea.key, v.id)]" />
              </div>
            </template>

            <!-- 28. Date picker: view change -->
            <template v-else-if="idea.key === 'dpview'">
              <div
                class="lab-dp"
                @click.capture="onDpClick(idea.key, v.id, $event)"
              >
                <TDatePicker v-model="dates[k(idea.key, v.id)]" />
              </div>
            </template>

            <!-- 29. Time picker -->
            <template v-else-if="idea.key === 'time'">
              <TTimePicker
                v-model:hour="hours[k(idea.key, v.id)]"
                v-model:minute="minutes[k(idea.key, v.id)]"
                :step="5"
              />
            </template>

            <!-- 30. Select -->
            <template v-else-if="idea.key === 'select'">
              <div
                class="lab-select"
                @pointerdown="fire(idea.key, v.id)"
              >
                <TSelect
                  v-model="selectValues[k(idea.key, v.id)]"
                  :options="cityOptions"
                  value-mode="value"
                  placeholder="Місто"
                />
              </div>
            </template>

            <!-- 31. Log lines -->
            <template v-else-if="idea.key === 'loglines'">
              <div class="lab-log">
                <TLogPane
                  :lines="logs[k(idea.key, v.id)]"
                  height="96px"
                />
                <TButton
                  size="small"
                  label="Новий рядок"
                  @click="addLog(idea.key, v.id)"
                />
              </div>
            </template>

            <!-- 32. Log "to the end" button -->
            <template v-else-if="idea.key === 'toend'">
              <div class="lab-log">
                <TLogPane
                  :lines="logs[k(idea.key, v.id)]"
                  height="110px"
                  to-end-label="До кінця"
                />
              </div>
            </template>

            <!-- 33. Scroll shadow -->
            <template v-else-if="idea.key === 'scrollshadow'">
              <div
                class="lab-log"
                :class="{ 'is-scrolled': flags[k(idea.key, v.id)] }"
                @scroll.capture="onScrollShadow(idea.key, v.id, $event)"
              >
                <TLogPane
                  :lines="longLog"
                  height="110px"
                  to-end-label="До кінця"
                />
              </div>
            </template>

            <!-- 34. Path crumbs -->
            <template v-else-if="idea.key === 'crumbs'">
              <div class="lab-col">
                <TPathCrumbs
                  :key="counts[k(idea.key, v.id)]"
                  :path="crumbPaths[counts[k(idea.key, v.id)] % crumbPaths.length]"
                />
                <TButton
                  size="small"
                  mode="plain"
                  label="Інша папка"
                  @click="counts[k(idea.key, v.id)]++"
                />
              </div>
            </template>

            <!-- 35. File tree -->
            <template v-else-if="idea.key === 'filetree'">
              <div class="lab-filetree">
                <TFileTree
                  v-model="fileSel[k(idea.key, v.id)]"
                  :paths="filePaths"
                />
              </div>
            </template>

            <!-- 36. Info tip -->
            <template v-else-if="idea.key === 'infotip'">
              <div class="lab-inline">
                <span>Ліміт запитів</span>
                <TInfoTip
                  :key="counts[k(idea.key, v.id)]"
                  text="1000 запитів на годину"
                />
                <TButton
                  size="small"
                  mode="text"
                  label="Ще раз"
                  @click="counts[k(idea.key, v.id)]++"
                />
              </div>
            </template>

            <!-- 37. Tab panel content -->
            <template v-else-if="idea.key === 'tabpanel'">
              <div
                class="lab-col"
                :class="`dir-${dirs[k(idea.key, v.id)] ?? 'next'}`"
              >
                <TTabs
                  :model-value="tabs[k(idea.key, v.id)]"
                  :tabs="tabItems"
                  size="small"
                  @update:model-value="(t) => onTabPanel(idea.key, v.id, String(t))"
                >
                  <template #panel-files>
                    <div class="lab-panel">
                      12 файлів, 3 папки
                    </div>
                  </template>
                  <template #panel-activity>
                    <div class="lab-panel">
                      Вчора: 4 зміни
                    </div>
                  </template>
                  <template #panel-settings>
                    <div class="lab-panel">
                      Доступ: команда
                    </div>
                  </template>
                </TTabs>
              </div>
            </template>

            <!-- 38. Notification timer -->
            <template v-else-if="idea.key === 'notifytimer'">
              <TButton
                icon="system-uicons:bell"
                label="Показати на 4 с"
                @click="notify.info('Зміни збережено', 4000)"
              />
            </template>

            <!-- 39. Menu stagger -->
            <template v-else-if="idea.key === 'menu'">
              <TDropdown card>
                <template #trigger="{ triggerProps }">
                  <TButton
                    v-bind="triggerProps"
                    icon="system-uicons:menu-vertical"
                    label="Меню"
                  />
                </template>
                <div class="lab-menu lab-menu--stagger">
                  <div>Відкрити</div>
                  <div>Перейменувати</div>
                  <div>Поділитися</div>
                  <div>Перемістити</div>
                  <div>Видалити</div>
                </div>
              </TDropdown>
            </template>

            <!-- 40. Async button -->
            <template v-else-if="idea.key === 'btnload'">
              <TButton
                variant="accent"
                :class="{ 'is-loading': busy[k(idea.key, v.id)] === 'loading' }"
                :disabled="busy[k(idea.key, v.id)] === 'loading' && v.id === 'now'"
                :icon="busyIcon(idea.key, v.id)"
                :label="busy[k(idea.key, v.id)] === 'loading' ? 'Збереження…' : busy[k(idea.key, v.id)] === 'done' ? 'Збережено' : 'Зберегти'"
                @click="runBusy(idea.key, v.id)"
              />
            </template>

            <!-- 41. Keyboard focus -->
            <template v-else-if="idea.key === 'kbfocus'">
              <div class="lab-inline">
                <TButton
                  size="small"
                  label="Назад"
                />
                <TButton
                  size="small"
                  variant="accent"
                  label="Далі"
                />
              </div>
            </template>

            <!-- 42. Disabled -> enabled -->
            <template v-else-if="idea.key === 'enable'">
              <div class="lab-col">
                <TCheckbox
                  v-model="flags[k(idea.key, v.id)]"
                  label="Погоджуюсь з умовами"
                />
                <TButton
                  variant="accent"
                  label="Продовжити"
                  :disabled="!flags[k(idea.key, v.id)]"
                />
              </div>
            </template>

            <!-- 43. Hover -->
            <template v-else-if="idea.key === 'hover'">
              <TButton
                mode="plain"
                variant="accent"
                label="Детальніше"
                icon="system-uicons:arrow-right"
                class="lab-hover-btn"
              />
            </template>

            <!-- 44. Theme switch -->
            <template v-else-if="idea.key === 'theme'">
              <div class="lab-inline">
                <TButton
                  size="small"
                  icon="system-uicons:sun"
                  label="Світла"
                  @click="switchTheme(v.id, 'light', $event)"
                />
                <TButton
                  size="small"
                  icon="system-uicons:moon"
                  label="Темна"
                  @click="switchTheme(v.id, 'dark', $event)"
                />
              </div>
            </template>

            <!-- 45. Empty -> data -->
            <template v-else-if="idea.key === 'emptyswap'">
              <div class="lab-col lab-swap">
                <Transition
                  :name="v.id === 'now' ? 'lab-none' : `lab-swap-${v.id}`"
                  mode="out-in"
                >
                  <TEmpty
                    v-if="!flags[k(idea.key, v.id)]"
                    description="Немає файлів"
                  />
                  <div
                    v-else
                    class="lab-swap__list"
                  >
                    <div>report.pdf</div>
                    <div>budget.xlsx</div>
                    <div>notes.md</div>
                  </div>
                </Transition>
                <TButton
                  size="small"
                  mode="plain"
                  :label="flags[k(idea.key, v.id)] ? 'Очистити' : 'Завантажити файли'"
                  @click="flags[k(idea.key, v.id)] = !flags[k(idea.key, v.id)]"
                />
              </div>
            </template>

            <!-- 46. Valid field -->
            <template v-else-if="idea.key === 'valid'">
              <TInput
                v-model="texts[k(idea.key, v.id)]"
                placeholder="you@example.com"
                :suffix-icon="/^\S+@\S+\.\S+$/.test(texts[k(idea.key, v.id)] ?? '') ? 'system-uicons:check' : undefined"
                class="lab-valid"
              />
            </template>

            <!-- 47. Tag status -->
            <template v-else-if="idea.key === 'tagstatus'">
              <div class="lab-col">
                <TTag
                  :label="statuses[counts[k(idea.key, v.id)] % statuses.length].label"
                  :variant="statuses[counts[k(idea.key, v.id)] % statuses.length].variant"
                />
                <TButton
                  size="small"
                  mode="plain"
                  label="Наступний статус"
                  @click="counts[k(idea.key, v.id)]++; fire(idea.key, v.id)"
                />
              </div>
            </template>

            <!-- 48. Tooltip delay -->
            <template v-else-if="idea.key === 'tipdelay'">
              <div
                class="lab-inline"
                @pointerout="warmTips"
              >
                <TTooltip content="Жирний">
                  <TButton
                    size="small"
                    mode="plain"
                    label="B"
                  />
                </TTooltip>
                <TTooltip content="Курсив">
                  <TButton
                    size="small"
                    mode="plain"
                    label="I"
                  />
                </TTooltip>
                <TTooltip content="Підкреслений">
                  <TButton
                    size="small"
                    mode="plain"
                    label="U"
                  />
                </TTooltip>
                <TTooltip content="Посилання">
                  <TButton
                    size="small"
                    mode="plain"
                    label="S"
                  />
                </TTooltip>
              </div>
            </template>

            <!-- 49. Indeterminate -->
            <template v-else-if="idea.key === 'indet'">
              <div class="lab-col">
                <TCheckbox
                  :model-value="allChecked(idea.key, v.id)"
                  :indeterminate="someChecked(idea.key, v.id)"
                  label="Усі файли"
                  @update:model-value="(val: boolean) => setAll(idea.key, v.id, val)"
                />
                <div class="lab-indent">
                  <TCheckbox
                    v-for="(_, i) in checks[k(idea.key, v.id)]"
                    :key="i"
                    v-model="checks[k(idea.key, v.id)][i]"
                    :label="['report.pdf', 'budget.xlsx'][i]"
                  />
                </div>
              </div>
            </template>

            <!-- 50. Anchor highlight -->
            <template v-else-if="idea.key === 'anchor'">
              <div class="lab-col">
                <TButton
                  size="small"
                  mode="plain"
                  label="Перейти до «Оплата»"
                  @click="goAnchor(idea.key, v.id)"
                />
                <div class="lab-anchor">
                  <TCard
                    v-for="s in anchorSections"
                    :key="s"
                    :data-anchor="s"
                  >
                    {{ s }}
                  </TCard>
                </div>
              </div>
            </template>
          </div>

          <div class="lab-cell__name">
            {{ v.name }}
          </div>
          <div class="lab-cell__desc">
            {{ v.desc }}
          </div>
          <div
            v-if="v.perf"
            class="lab-cell__perf"
          >
            <span :data-level="v.perf[0]">{{ v.perf[0] }}</span> {{ v.perf[1] }}
          </div>
        </div>
      </div>

      <div
        v-if="idea.key !== 'button'"
        class="lab-pick"
      >
        <TButtonGroup
          v-model="picks[idea.key].pick"
          :options="idea.variants.map(v => ({ value: v.id, label: v.id === 'now' ? 'Не змінювати' : v.id.toUpperCase() }))"
          size="small"
          mandatory
        />
        <TInput
          v-model="picks[idea.key].comment"
          size="small"
          placeholder="Коментар"
          class="lab-pick__comment"
        />
        <TCheckbox
          v-model="picks[idea.key].discuss"
          label="Потрібно обговорити"
        />
      </div>
    </section>

    <TLoadingOverlay />

    <section class="lab-prompt">
      <div class="lab-prompt__head">
        <h2>Промпт на розробку</h2>
        <TButton
          size="small"
          :icon="copied ? 'system-uicons:check' : 'system-uicons:copy'"
          :label="copied ? 'Скопійовано' : 'Копіювати'"
          @click="copyPrompt"
        />
      </div>
      <pre class="lab-prompt__text">{{ prompt }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch, type ComponentPublicInstance } from 'vue'
import {
  TBadge,
  TButton,
  TButtonGroup,
  TCard,
  TCheckbox,
  TCollapseTransition,
  TCopyChip,
  TDatePicker,
  TDropdown,
  TEmpty,
  TFileTree,
  TFormField,
  TInfoTip,
  TInput,
  TLoadingOverlay,
  TLogPane,
  TPathCrumbs,
  TSelect,
  TSplitPane,
  TSwitch,
  TTable,
  TTabs,
  TTag,
  TTimePicker,
  TTooltip,
  TTree,
  applyTheme,
  currentTheme,
  useDialog,
  useLoading,
  useNotifications,
  type TLogLine,
  type TTableColumn
} from '@vitaliysimkin/t-components'

type Perf = ['low' | 'medium', string]
interface Variant { id: 'now' | 'chosen' | 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'v8', name: string, desc: string, perf?: Perf }
interface Idea { key: string, name: string, comps: string[], source?: string, variants: Variant[] }

const now = (desc: string): Variant => ({ id: 'now', name: 'Без анімації', desc })

const ideas: Idea[] = [
  {
    key: 'button', name: 'Натискання кнопки', comps: ['TButton'],
    variants: [
      now('Змінюється лише колір на hover.'),
      { id: 'chosen', name: 'Sink, then spring + ripple', desc: 'Хвиля з точки дотику, поки тримаєте кнопка просідає до 95%, після відпускання пружинить.', perf: ['low', 'transform + 1 вузол хвилі'] }
    ]
  },
  {
    key: 'dropdown', name: 'Відкриття меню', comps: ['TDropdown', 'TSelect'],
    variants: [
      now('Панель з\'являється миттєво.'),
      { id: 'v1', name: 'Scale з кута', desc: 'Fade + scale 0.95→1 від кута біля тригера.', perf: ['low', 'transform + opacity'] },
      { id: 'v2', name: 'Виїзд вниз', desc: 'Fade + зсув на 6px вниз.', perf: ['low', 'transform + opacity'] },
      { id: 'v3', name: 'Розгортання', desc: 'Панель розкривається зверху вниз (clip-path).', perf: ['low', 'clip-path, короткий repaint'] }
    ]
  },
  {
    key: 'tooltip', name: 'Підказка', comps: ['TTooltip', 'TInfoTip'],
    variants: [
      now('З\'являється миттєво.'),
      { id: 'v1', name: 'Fade', desc: 'Лише прозорість, 120 мс.', perf: ['low', 'opacity'] },
      { id: 'v2', name: 'Fade + підйом', desc: 'Піднімається на 4px від сторони розміщення.', perf: ['low', 'transform + opacity'] },
      { id: 'v3', name: 'Pop', desc: 'Scale 0.85→1 з легким перельотом.', perf: ['low', 'transform + opacity'] }
    ]
  },
  {
    key: 'dialog', name: 'Відкриття діалогу', comps: ['useDialog', 'TModalBox'],
    variants: [
      now('Діалог і фон з\'являються миттєво.'),
      { id: 'v1', name: 'Fade + scale', desc: 'Фон згасає, панель scale 0.96→1.', perf: ['low', 'transform + opacity'] },
      { id: 'v2', name: 'Підйом', desc: 'Панель піднімається на 16px.', perf: ['low', 'transform + opacity'] },
      { id: 'v3', name: 'Пружина', desc: 'Scale 0.9→1 з перельотом.', perf: ['low', 'transform + opacity'] },
      { id: 'v4', name: 'Спуск згори', desc: 'Панель опускається на 24px і проявляється.', perf: ['low', 'transform + opacity'] },
      { id: 'v5', name: 'Зум від кнопки', desc: 'Панель виростає з точки кнопки, що її відкрила (scale 0.2→1).', perf: ['low', 'transform + opacity'] },
      { id: 'v6', name: 'Зум від кнопки + пружина', desc: 'Як v5, scale 0.5→1 з легким перельотом.', perf: ['low', 'transform + opacity'] },
      { id: 'v7', name: 'Розгортання від кнопки', desc: 'З кнопки: спершу ширина, потім висота.', perf: ['low', 'transform + opacity'] },
      { id: 'v8', name: 'Зум від центру', desc: 'Фолбек без кнопки: scale 0.2→1 від центру панелі.', perf: ['low', 'transform + opacity'] }
    ]
  },
  {
    key: 'notify', name: 'Сповіщення', comps: ['TNotifications'],
    variants: [
      now('Короткий виїзд на 20px справа.'),
      { id: 'v1', name: 'Виїзд з краю', desc: 'Виїжджає з-за правого краю, виходить туди ж.', perf: ['low', 'transform + opacity'] },
      { id: 'v2', name: 'Pop', desc: 'Scale 0.9→1 з пружиною, вихід — стискання.', perf: ['low', 'transform + opacity'] },
      { id: 'v3', name: 'Падіння згори', desc: 'Опускається на 12px згори, вихід — fade.', perf: ['low', 'transform + opacity'] }
    ]
  },
  {
    key: 'tabs', name: 'Перемикання вкладок', comps: ['TTabs'],
    variants: [
      now('Підкреслення перестрибує миттєво.'),
      { id: 'v1', name: 'Ковзне підкреслення', desc: 'Лінія переїжджає до нової вкладки.', perf: ['low', '1 вимір геометрії на перемикання'] },
      { id: 'v2', name: 'Ріст з центру', desc: 'Лінія виростає з центру нової вкладки.', perf: ['low', 'transform'] },
      { id: 'v3', name: 'Підйом лінії', desc: 'Лінія проявляється знизу вгору.', perf: ['low', 'transform + opacity'] }
    ]
  },
  {
    key: 'segment', name: 'Сегментований перемикач', comps: ['TButtonGroup'],
    variants: [
      now('Активна кнопка змінює колір.'),
      { id: 'v1', name: 'Ковзна плашка', desc: 'Спільна плашка переїжджає під обрану опцію.', perf: ['low', '1 вимір геометрії на зміну'] },
      { id: 'v2', name: 'Pop', desc: 'Обрана опція коротко збільшується.', perf: ['low', 'transform'] },
      { id: 'v3', name: 'Заливка', desc: 'Колір заливає кнопку зліва направо.', perf: ['low', 'transform псевдоелемента'] }
    ]
  },
  {
    key: 'checkbox', name: 'Чекбокс', comps: ['TCheckbox'],
    variants: [
      now('Галочка проявляється за 100 мс.'),
      { id: 'v1', name: 'Pop галочки', desc: 'Галочка з\'являється з нуля з перельотом.', perf: ['low', 'transform'] },
      { id: 'v2', name: 'Малювання', desc: 'Галочка «малюється» зліва направо.', perf: ['low', 'clip-path на 8px'] },
      { id: 'v3', name: 'Пружний квадрат', desc: 'Квадрат стискається і відскакує.', perf: ['low', 'transform'] }
    ]
  },
  {
    key: 'switch', name: 'Перемикач', comps: ['TSwitch'],
    variants: [
      now('Повзунок їде за 160 мс.'),
      { id: 'v1', name: 'Пружина', desc: 'Повзунок доїжджає з перельотом.', perf: ['low', 'transform'] },
      { id: 'v2', name: 'Розтягування', desc: 'Поки тримаєте, повзунок розтягується в бік руху.', perf: ['low', 'transform'] },
      { id: 'v3', name: 'Стрибок', desc: 'Повзунок трохи збільшується посередині шляху.', perf: ['low', 'transform'] }
    ]
  },
  {
    key: 'focus', name: 'Фокус поля', comps: ['TInput', 'TSelect', 'TTextarea'],
    variants: [
      now('Рамка і кільце фокусу з\'являються за 150 мс.'),
      { id: 'v1', name: 'Кільце «сідає»', desc: 'Кільце стартує ширшим і стискається до 3px.', perf: ['low', 'одноразовий repaint тіні'] },
      { id: 'v2', name: 'Лінія знизу', desc: 'Замість кільця знизу малюється акцентна лінія.', perf: ['low', 'transform'] },
      { id: 'v3', name: 'Іконка оживає', desc: 'Іконка пошуку набуває акценту і трохи збільшується.', perf: ['low', 'transform + колір'] }
    ]
  },
  {
    key: 'error', name: 'Помилка у формі', comps: ['TFormField', 'TInput'],
    variants: [
      now('Текст помилки з\'являється миттєво. Надішліть з порожнім полем.'),
      { id: 'v1', name: 'Shake', desc: 'Поле коротко трясеться.', perf: ['low', 'transform'] },
      { id: 'v2', name: 'Виїзд тексту', desc: 'Текст помилки виїжджає згори.', perf: ['low', 'transform + opacity'] },
      { id: 'v3', name: 'Пульс рамки', desc: 'Червоне кільце один раз розходиться.', perf: ['low', 'одноразовий repaint тіні'] },
      { id: 'v4', name: 'V1 + V3', desc: 'Поле трясеться, і одночасно розходиться червоне кільце.', perf: ['low', 'transform + одноразовий repaint тіні'] }
    ]
  },
  {
    key: 'clear', name: 'Кнопка очистки', comps: ['TInput'],
    variants: [
      now('Хрестик з\'являється миттєво. Почніть друкувати.'),
      { id: 'v1', name: 'Pop', desc: 'Scale 0.5→1 + fade.', perf: ['low', 'transform + opacity'] },
      { id: 'v2', name: 'Поворот', desc: 'Хрестик докручується на 90°.', perf: ['low', 'transform'] },
      { id: 'v3', name: 'Виїзд', desc: 'Виїжджає справа на 6px.', perf: ['low', 'transform + opacity'] }
    ]
  },
  {
    key: 'tree', name: 'Розгортання дерева', comps: ['TTree', 'TFileTree'],
    variants: [
      now('Дочірні вузли з\'являються миттєво.'),
      { id: 'v1', name: 'Виїзд вниз', desc: 'Нові вузли опускаються на 4px і проявляються.', perf: ['low', 'transform + opacity'] },
      { id: 'v2', name: 'Fade', desc: 'Лише прозорість, без руху.', perf: ['low', 'opacity'] },
      { id: 'v3', name: 'Виїзд зліва', desc: 'Вузли виїжджають зліва, підкреслюючи вкладеність.', perf: ['low', 'transform + opacity'] }
    ]
  },
  {
    key: 'table', name: 'Новий рядок таблиці', comps: ['TTable'],
    variants: [
      now('Рядок з\'являється без виділення.'),
      { id: 'v1', name: 'Спалах', desc: 'Рядок підсвічується акцентом і згасає за 1 с.', perf: ['low', 'колір фону одного рядка'] },
      { id: 'v2', name: 'Виїзд', desc: 'Рядок опускається і проявляється.', perf: ['low', 'transform + opacity'] },
      { id: 'v3', name: 'Мітка зліва', desc: 'Зліва спалахує акцентна смужка.', perf: ['low', 'repaint однієї клітинки'] }
    ]
  },
  {
    key: 'count', name: 'Зміна лічильника', comps: ['TBadge'],
    variants: [
      now('Число змінюється миттєво.'),
      { id: 'v1', name: 'Pop', desc: 'Бейдж збільшується з перельотом.', perf: ['low', 'transform'] },
      { id: 'v2', name: 'Прокрутка', desc: 'Нове число виїжджає знизу.', perf: ['low', 'transform + opacity'] },
      { id: 'v3', name: 'Кільце', desc: 'Від бейджа розходиться кільце.', perf: ['low', 'transform + opacity псевдоелемента'] }
    ]
  },
  {
    key: 'dot', name: 'Точка «нове»', comps: ['TBadge (dot)'],
    variants: [
      now('Точка з\'являється статично.'),
      { id: 'v1', name: 'Ping', desc: 'Від точки тричі розходиться кільце.', perf: ['low', 'transform + opacity псевдоелемента'] },
      { id: 'v2', name: 'Дихання', desc: 'Точка тричі м\'яко пульсує прозорістю.', perf: ['low', 'opacity'] },
      { id: 'v3', name: 'Стрибок', desc: 'Точка один раз підстрибує при появі.', perf: ['low', 'transform'] }
    ]
  },
  {
    key: 'tags', name: 'Додавання і видалення тегів', comps: ['TTag'],
    variants: [
      now('Теги з\'являються і зникають миттєво.'),
      { id: 'v1', name: 'Pop / стискання', desc: 'Новий тег з\'являється з pop, видалений стискається; сусіди плавно зсуваються.', perf: ['medium', 'FLIP-зсув сусідів'] },
      { id: 'v2', name: 'Виїзд', desc: 'Тег виїжджає згори, при видаленні опускається.', perf: ['medium', 'FLIP-зсув сусідів'] },
      { id: 'v3', name: 'Fade', desc: 'Лише прозорість і плавний зсув сусідів.', perf: ['medium', 'FLIP-зсув сусідів'] }
    ]
  },
  {
    key: 'copy', name: 'Копіювання', comps: ['TCopyChip', 'TCopyField'],
    variants: [
      now('Жодного відгуку після кліку.'),
      { id: 'v1', name: 'Pop іконки', desc: 'Іконка копіювання коротко збільшується.', perf: ['low', 'transform'] },
      { id: 'v2', name: 'Бульбашка', desc: 'Над чипом спливає «Скопійовано».', perf: ['low', '1 вузол, transform + opacity'] },
      { id: 'v3', name: 'Спалах', desc: 'Чип підсвічується акцентом і згасає.', perf: ['low', 'колір фону'] }
    ]
  },
  {
    key: 'card', name: 'Hover картки', comps: ['TCard'],
    variants: [
      now('Нічого не відбувається.'),
      { id: 'v1', name: 'Підйом', desc: 'Картка піднімається на 2px, тінь посилюється.', perf: ['low', 'transform + opacity тіні'] },
      { id: 'v2', name: 'Акцентна рамка', desc: 'Рамка плавно набуває акценту.', perf: ['low', 'колір рамки'] },
      { id: 'v3', name: 'Scale', desc: 'Картка збільшується на 1.5%.', perf: ['low', 'transform'] }
    ]
  },
  {
    key: 'empty', name: 'Порожній стан', comps: ['TEmpty'],
    variants: [
      now('З\'являється статично.'),
      { id: 'v1', name: 'Підйом', desc: 'Увесь блок піднімається і проявляється.', perf: ['low', 'transform + opacity, раз'] },
      { id: 'v2', name: 'Каскад', desc: 'Спершу іконка, потім текст.', perf: ['low', 'transform + opacity, раз'] },
      { id: 'v3', name: 'Гойдання іконки', desc: 'Іконка один раз погойдується.', perf: ['low', 'transform, раз'] }
    ]
  },
  {
    key: 'split', name: 'Ручка розділювача', comps: ['TSplitPane'],
    source: 'Material 3 — state layers (hover/drag); Fluent 2 — motion for direct manipulation',
    variants: [
      now('Лінія ручки змінює колір на hover миттєво.'),
      { id: 'v1', name: 'Потовщення', desc: 'На hover лінія плавно потовщується до 3px.', perf: ['low', 'transform псевдоелемента'] },
      { id: 'v2', name: 'М\'яке світіння', desc: 'Навколо лінії проявляється широка напівпрозора смуга — більша ціль для курсора.', perf: ['low', 'opacity псевдоелемента'] },
      { id: 'v3', name: 'Без мерехтіння', desc: 'Підсвітка лише якщо курсор затримався на 120 мс.', perf: ['low', 'колір фону'] }
    ]
  },
  {
    key: 'collapse', name: 'Розгортання блоку', comps: ['TCollapseTransition'],
    source: 'Material 3 — easing & duration (emphasized easing); NN/g — animation for continuity',
    variants: [
      now('Висота й прозорість 250 мс, ease; шеврон міняється миттєво.'),
      { id: 'v1', name: 'Emphasized easing', desc: 'Різкий старт, м\'яке гальмування, 300 мс.', perf: ['medium', 'анімація висоти — layout кожен кадр'] },
      { id: 'v2', name: 'Вміст виїжджає', desc: 'Поверх висоти вміст опускається на 8px.', perf: ['medium', 'висота + transform вмісту'] },
      { id: 'v3', name: 'Поворот шеврона', desc: 'Шеврон обертається на 180° з пружиною.', perf: ['medium', 'висота + transform іконки'] }
    ]
  },
  {
    key: 'loading', name: 'Оверлей завантаження', comps: ['useLoading', 'TLoadingOverlay'],
    source: 'NN/g — Response Time Limits (0.1 / 1 / 10 с); Carbon — loading (delay before showing)',
    variants: [
      now('Оверлей з fade; коротке завантаження теж блимає.'),
      { id: 'v1', name: 'Затримка 300 мс', desc: 'Короткі завантаження не показують оверлей зовсім.', perf: ['low', 'opacity'] },
      { id: 'v2', name: 'Спінер виростає', desc: 'Блок спінера з\'являється зі scale 0.8→1.', perf: ['low', 'transform + opacity'] },
      { id: 'v3', name: 'Затримка + підйом', desc: 'Затримка 300 мс, потім блок піднімається на 8px.', perf: ['low', 'transform + opacity'] }
    ]
  },
  {
    key: 'tableload', name: 'Таблиця завантажується', comps: ['TTable (loading)'],
    source: 'NN/g — Skeleton Screens 101; Apple HIG — Loading (show progress, avoid blank)',
    variants: [
      now('Статичний текст «Loading…».'),
      { id: 'v1', name: 'Пульс', desc: 'Текст м\'яко пульсує прозорістю.', perf: ['low', 'opacity'] },
      { id: 'v2', name: 'Відблиск', desc: 'По рядку стану пробігає відблиск, як у скелетоні.', perf: ['low', 'transform псевдоелемента'] },
      { id: 'v3', name: 'Затримка показу', desc: 'Текст з\'являється лише через 300 мс.', perf: ['low', 'opacity'] },
      { id: 'v4', name: 'V1 + V2', desc: 'Текст пульсує, і водночас по рядку пробігає відблиск.', perf: ['low', 'opacity + transform псевдоелемента'] }
    ]
  },
  {
    key: 'sort', name: 'Сортування таблиці', comps: ['TTable (sortable)'],
    source: 'Material 3 — transitions (show relationship between states); NN/g — animation for orientation',
    variants: [
      now('Рядки миттєво міняються місцями. Клікніть заголовок колонки.'),
      { id: 'v1', name: 'Фліп іконки', desc: 'Іконка сортування перевертається.', perf: ['low', 'transform'] },
      { id: 'v2', name: 'Перехід рядків', desc: 'Тіло таблиці коротко згасає і проявляється.', perf: ['low', 'opacity'] },
      { id: 'v3', name: 'FLIP рядків', desc: 'Рядки переїжджають на нові місця.', perf: ['medium', 'вимір кожного рядка; для великих таблиць вимикати'] }
    ]
  },
  {
    key: 'select-row', name: 'Виділення рядка', comps: ['TTable (selectable)'],
    source: 'Material 3 — selection state layers; Carbon — productive motion (70–110 мс)',
    variants: [
      now('Фон рядка змінюється миттєво.'),
      { id: 'v1', name: 'Плавний фон', desc: 'Фон виділення проявляється за 150 мс.', perf: ['low', 'колір фону'] },
      { id: 'v2', name: 'Смужка зліва', desc: 'Зліва виростає акцентна смужка.', perf: ['low', 'transform псевдоелемента'] },
      { id: 'v3', name: 'Пружний чекбокс', desc: 'Чекбокс рядка стискається і відскакує.', perf: ['low', 'transform'] }
    ]
  },
  {
    key: 'month', name: 'Зміна місяця', comps: ['TDatePicker'],
    source: 'Material 3 — shared axis X (navigation between siblings); Apple HIG — motion conveys direction',
    variants: [
      now('Сітка днів змінюється миттєво.'),
      { id: 'v1', name: 'Shared axis X', desc: 'Сітка їде вліво/вправо за напрямком.', perf: ['low', 'transform + opacity'] },
      { id: 'v2', name: 'Fade through', desc: 'Стара сітка згасає, нова проявляється.', perf: ['low', 'opacity'] },
      { id: 'v3', name: 'Shared axis Y', desc: 'Сітка їде вгору/вниз за напрямком.', perf: ['low', 'transform + opacity'] }
    ]
  },
  {
    key: 'dpview', name: 'Дні → місяці → роки', comps: ['TDatePicker'],
    source: 'Material 3 — shared axis Z (parent/child levels); NN/g — animation shows hierarchy',
    variants: [
      now('Сітка змінюється миттєво. Клікніть заголовок.'),
      { id: 'v1', name: 'Shared axis Z', desc: 'Нова сітка наближається зі scale 1.1→1.', perf: ['low', 'transform + opacity'] },
      { id: 'v2', name: 'Fade', desc: 'Лише прозорість.', perf: ['low', 'opacity'] },
      { id: 'v3', name: 'Зум зсередини', desc: 'Нова сітка виростає зі scale 0.9→1.', perf: ['low', 'transform + opacity'] }
    ]
  },
  {
    key: 'time', name: 'Вибір часу', comps: ['TTimePicker'],
    source: 'Apple HIG — pickers (feedback on selection); Material 3 — state layers',
    variants: [
      now('Колонка доскролюється плавно, виділення миттєве.'),
      { id: 'v1', name: 'Pop', desc: 'Обране значення коротко збільшується.', perf: ['low', 'transform'] },
      { id: 'v2', name: 'Плавне виділення', desc: 'Фон виділення переходить за 150 мс.', perf: ['low', 'колір фону'] },
      { id: 'v3', name: 'Масштаб обраного', desc: 'Обране значення лишається трохи більшим.', perf: ['low', 'transform'] }
    ]
  },
  {
    key: 'select', name: 'Список вибору', comps: ['TSelect'],
    source: 'Material 3 — menus & state layers; Fluent 2 — motion: functional, subtle',
    variants: [
      now('Шеврон міняється миттєво, підсвітка опцій миттєва.'),
      { id: 'v1', name: 'Поворот шеврона', desc: 'Шеврон обертається при відкритті.', perf: ['low', 'transform'] },
      { id: 'v2', name: 'Плавний hover', desc: 'Підсвітка опції переходить за 120 мс.', perf: ['low', 'колір фону'] },
      { id: 'v3', name: 'Спалах обраного', desc: 'При відкритті обрана опція коротко підсвічується.', perf: ['low', 'колір фону'] }
    ]
  },
  {
    key: 'loglines', name: 'Нові рядки логу', comps: ['TLogPane', 'TLogView'],
    source: 'NN/g — animation for attention (subtle, not distracting); WCAG 2.2.2 Pause, Stop, Hide',
    variants: [
      now('Рядок з\'являється миттєво.'),
      { id: 'v1', name: 'Fade', desc: 'Новий рядок проявляється.', perf: ['low', 'opacity; при потоці >20/с вимикати'] },
      { id: 'v2', name: 'Підйом', desc: 'Рядок піднімається на 4px.', perf: ['low', 'transform + opacity'] },
      { id: 'v3', name: 'Спалах', desc: 'Рядок коротко підсвічується.', perf: ['low', 'колір фону'] }
    ]
  },
  {
    key: 'toend', name: 'Кнопка «до кінця» логу', comps: ['TLogPane'],
    source: 'Material 3 — FAB enter/exit; NN/g — make state changes visible',
    variants: [
      now('Кнопка з\'являється миттєво. Прокрутіть лог угору.'),
      { id: 'v1', name: 'Виїзд знизу', desc: 'Кнопка виїжджає знизу.', perf: ['low', 'transform + opacity'] },
      { id: 'v2', name: 'Pop', desc: 'Кнопка з\'являється зі scale 0.6→1.', perf: ['low', 'transform + opacity'] },
      { id: 'v3', name: 'Fade', desc: 'Лише прозорість.', perf: ['low', 'opacity'] }
    ]
  },
  {
    key: 'scrollshadow', name: 'Тінь при прокрутці', comps: ['TLogPane'],
    source: 'Material 3 — top app bar elevation on scroll; Apple HIG — scroll edge effects',
    variants: [
      now('Межа прокрутки не показується. Прокрутіть лог.'),
      { id: 'v1', name: 'Тінь згори', desc: 'Коли вміст прокручено, згори з\'являється тінь.', perf: ['low', 'opacity псевдоелемента'] },
      { id: 'v2', name: 'Лінія згори', desc: 'Згори проявляється тонка лінія.', perf: ['low', 'opacity псевдоелемента'] },
      { id: 'v3', name: 'Затухання краю', desc: 'Верхній край вмісту плавно згасає градієнтом.', perf: ['low', 'opacity псевдоелемента'] }
    ]
  },
  {
    key: 'crumbs', name: 'Зміна шляху', comps: ['TPathCrumbs'],
    source: 'Material 3 — shared axis X (forward/back); NN/g — animation for orientation',
    variants: [
      now('Шлях змінюється миттєво.'),
      { id: 'v1', name: 'Назва проявляється', desc: 'Остання частина піднімається і проявляється.', perf: ['low', 'transform + opacity'] },
      { id: 'v2', name: 'Каскад', desc: 'Сегменти по черзі виїжджають справа.', perf: ['low', 'transform + opacity, раз'] },
      { id: 'v3', name: 'Fade', desc: 'Увесь шлях коротко проявляється.', perf: ['low', 'opacity'] }
    ]
  },
  {
    key: 'filetree', name: 'Дерево файлів', comps: ['TFileTree'],
    source: 'Material 3 — lists & expansion; Apple HIG — disclosure controls',
    variants: [
      now('Вузли й виділення змінюються миттєво.'),
      { id: 'v1', name: 'Вузли виїжджають', desc: 'Нові рядки опускаються на 4px.', perf: ['low', 'transform + opacity'] },
      { id: 'v2', name: 'Плавне виділення', desc: 'Фон обраного рядка переходить за 150 мс.', perf: ['low', 'колір фону'] },
      { id: 'v3', name: 'Pop іконки', desc: 'Іконка обраного файлу коротко збільшується.', perf: ['low', 'transform'] }
    ]
  },
  {
    key: 'infotip', name: 'Іконка підказки', comps: ['TInfoTip'],
    source: 'NN/g — animation for attention (одноразово); WCAG 2.3.3 Animation from Interactions',
    variants: [
      now('Статична іконка.'),
      { id: 'v1', name: 'Hover-збільшення', desc: 'На hover іконка трохи збільшується.', perf: ['low', 'transform'] },
      { id: 'v2', name: 'Hover-гойдання', desc: 'На hover іконка коротко погойдується.', perf: ['low', 'transform'] },
      { id: 'v3', name: 'Пульс при появі', desc: 'Один пульс, щоб помітили підказку.', perf: ['low', 'transform + opacity, раз'] }
    ]
  },
  {
    key: 'tabpanel', name: 'Вміст вкладки', comps: ['TTabs (panels)'],
    source: 'Material 3 — shared axis X / fade through for tabs',
    variants: [
      now('Вміст змінюється миттєво.'),
      { id: 'v1', name: 'Shared axis X', desc: 'Вміст їде в бік обраної вкладки.', perf: ['low', 'transform + opacity'] },
      { id: 'v2', name: 'Fade through', desc: 'Вміст проявляється зі scale 0.98→1.', perf: ['low', 'transform + opacity'] },
      { id: 'v3', name: 'Fade', desc: 'Лише прозорість.', perf: ['low', 'opacity'] }
    ]
  },
  {
    key: 'notifytimer', name: 'Таймер сповіщення', comps: ['TNotifications'],
    source: 'Material 3 — snackbar; WCAG 2.2.1 Timing Adjustable (show time remaining)',
    variants: [
      now('Сповіщення зникає без попередження.'),
      { id: 'v1', name: 'Смужка знизу', desc: 'Знизу тоншає смужка, що показує залишок часу.', perf: ['low', 'transform'] },
      { id: 'v2', name: 'Смужка згори', desc: 'Те саме, але згори, кольором акценту.', perf: ['low', 'transform'] },
      { id: 'v3', name: 'Смужка збоку', desc: 'Вертикальна смужка зліва.', perf: ['low', 'transform'] }
    ]
  },
  {
    key: 'menu', name: 'Каскад пунктів меню', comps: ['TDropdown', 'TSelect'],
    source: 'Material motion — choreography (stagger ≤ 20 мс на елемент); Fluent 2 — staggered entrance',
    variants: [
      now('Усі пункти з\'являються разом.'),
      { id: 'v1', name: 'Каскад fade', desc: 'Пункти проявляються по черзі.', perf: ['low', 'opacity'] },
      { id: 'v2', name: 'Каскад вниз', desc: 'Пункти по черзі опускаються на 4px.', perf: ['low', 'transform + opacity'] },
      { id: 'v3', name: 'Каскад зліва', desc: 'Пункти по черзі виїжджають зліва.', perf: ['low', 'transform + opacity'] }
    ]
  },
  {
    key: 'btnload', name: 'Кнопка в стані збереження', comps: ['TButton'],
    source: 'Carbon — inline loading; NN/g — Response Time Limits (feedback after 1 с)',
    variants: [
      now('Кнопка вимикається і змінює текст.'),
      { id: 'v1', name: 'Спінер в іконці', desc: 'Іконка стає спінером, потім галочкою.', perf: ['low', 'transform'] },
      { id: 'v2', name: 'Прогрес усередині', desc: 'Фон кнопки заповнюється зліва направо.', perf: ['low', 'transform псевдоелемента'] },
      { id: 'v3', name: 'Дихання', desc: 'Кнопка м\'яко пульсує прозорістю.', perf: ['low', 'opacity'] }
    ]
  },
  {
    key: 'kbfocus', name: 'Фокус з клавіатури', comps: ['TButton', 'усі контроли'],
    source: 'WCAG 2.4.7 Focus Visible, 2.4.13 Focus Appearance; Carbon — focus states',
    variants: [
      now('Обвідка з\'являється миттєво. Натисніть Tab.'),
      { id: 'v1', name: 'Відступ росте', desc: 'Обвідка відходить від кнопки 0→3px.', perf: ['low', 'repaint обвідки'] },
      { id: 'v2', name: 'Пульс', desc: 'Обвідка один раз пульсує ширше.', perf: ['low', 'repaint обвідки'] },
      { id: 'v3', name: 'Товщає', desc: 'Обвідка плавно товщає з 1 до 2px.', perf: ['low', 'repaint обвідки'] }
    ]
  },
  {
    key: 'enable', name: 'Кнопка стає активною', comps: ['TButton (disabled)'],
    source: 'NN/g — make system status visible; Material 3 — state changes',
    variants: [
      now('Прозорість змінюється за 150 мс.'),
      { id: 'v1', name: 'Pop', desc: 'Кнопка коротко збільшується, коли стає доступною.', perf: ['low', 'transform'] },
      { id: 'v2', name: 'Відблиск', desc: 'По кнопці один раз пробігає відблиск.', perf: ['low', 'transform псевдоелемента'] },
      { id: 'v3', name: 'Заливка', desc: 'Колір заливає кнопку зліва направо.', perf: ['low', 'transform псевдоелемента'] }
    ]
  },
  {
    key: 'hover', name: 'Hover кнопки', comps: ['TButton'],
    source: 'Material 3 — state layers (hover 8%); Apple HIG — pointer interactions',
    variants: [
      now('Змінюється колір.'),
      { id: 'v1', name: 'State layer', desc: 'Поверх кнопки проявляється шар 8%.', perf: ['low', 'opacity псевдоелемента'] },
      { id: 'v2', name: 'Підйом', desc: 'Кнопка піднімається на 1px.', perf: ['low', 'transform'] },
      { id: 'v3', name: 'Іконка зсувається', desc: 'Стрілка зсувається на 3px вправо.', perf: ['low', 'transform'] }
    ]
  },
  {
    key: 'theme', name: 'Зміна теми', comps: ['useTheme', 'applyTheme'],
    source: 'Apple HIG — avoid jarring transitions; MDN/Chrome — View Transitions API',
    variants: [
      now('Тема змінюється миттєво (уся сторінка).'),
      { id: 'v1', name: 'Перехід кольорів', desc: 'Усі кольори переходять за 250 мс.', perf: ['medium', 'repaint усієї сторінки кожен кадр'] },
      { id: 'v2', name: 'Crossfade', desc: 'Знімок старої теми розчиняється в новій.', perf: ['low', 'View Transitions, композитор'] },
      { id: 'v3', name: 'Коло від кліку', desc: 'Нова тема розходиться колом від кнопки.', perf: ['low', 'View Transitions + clip-path'] }
    ]
  },
  {
    key: 'emptyswap', name: 'Порожньо → дані', comps: ['TEmpty'],
    source: 'Material 3 — fade through (unrelated content); NN/g — animation for continuity',
    variants: [
      now('Вміст змінюється миттєво.'),
      { id: 'v1', name: 'Fade through', desc: 'Старе згасає, нове проявляється зі scale 0.92→1.', perf: ['low', 'transform + opacity'] },
      { id: 'v2', name: 'Shared axis Y', desc: 'Старе йде вгору, нове приходить знизу.', perf: ['low', 'transform + opacity'] },
      { id: 'v3', name: 'Fade', desc: 'Лише прозорість.', perf: ['low', 'opacity'] }
    ]
  },
  {
    key: 'valid', name: 'Поле стало валідним', comps: ['TInput'],
    source: 'NN/g — inline validation (confirm success); Material 3 — text field states',
    variants: [
      now('Галочка з\'являється миттєво. Введіть email.'),
      { id: 'v1', name: 'Pop галочки', desc: 'Галочка з\'являється з перельотом.', perf: ['low', 'transform'] },
      { id: 'v2', name: 'Зелене кільце', desc: 'Від поля один раз розходиться зелене кільце.', perf: ['low', 'одноразовий repaint тіні'] },
      { id: 'v3', name: 'Малювання', desc: 'Галочка «малюється» зліва направо.', perf: ['low', 'clip-path'] }
    ]
  },
  {
    key: 'tagstatus', name: 'Зміна статусу', comps: ['TTag'],
    source: 'NN/g — animation for state change; Carbon — productive motion',
    variants: [
      now('Колір змінюється за 150 мс.'),
      { id: 'v1', name: 'Pop', desc: 'Тег коротко збільшується.', perf: ['low', 'transform'] },
      { id: 'v2', name: 'Перевертання', desc: 'Тег перевертається по горизонтальній осі.', perf: ['low', 'transform'] },
      { id: 'v3', name: 'Кільце', desc: 'Від тега розходиться кільце.', perf: ['low', 'одноразовий repaint тіні'] }
    ]
  },
  {
    key: 'tipdelay', name: 'Затримка підказок', comps: ['TTooltip'],
    source: 'Material 3 — tooltips (delay); Apple HIG — help tags; NN/g — tooltip guidelines',
    variants: [
      now('Підказка з\'являється одразу при наведенні.'),
      { id: 'v1', name: 'Затримка 400 мс', desc: 'Підказка лише якщо курсор затримався.', perf: ['low', 'opacity'] },
      { id: 'v2', name: 'Затримка + warm-up', desc: 'Перша з затримкою, сусідні — одразу.', perf: ['low', 'opacity'] },
      { id: 'v3', name: 'Затримка 800 мс', desc: 'Для щільних панелей інструментів.', perf: ['low', 'opacity'] }
    ]
  },
  {
    key: 'indet', name: 'Частковий вибір', comps: ['TCheckbox (indeterminate)'],
    source: 'Material 3 — checkbox states; Apple HIG — mixed state',
    variants: [
      now('Риска й галочка змінюються за 100 мс.'),
      { id: 'v1', name: 'Риска росте', desc: 'Риска виростає з центру.', perf: ['low', 'transform'] },
      { id: 'v2', name: 'Риска → галочка', desc: 'Позначка доповертається на місце.', perf: ['low', 'transform'] },
      { id: 'v3', name: 'Риска виїжджає', desc: 'Риска виїжджає зліва.', perf: ['low', 'transform + opacity'] }
    ]
  },
  {
    key: 'anchor', name: 'Перехід до розділу', comps: ['TCard'],
    source: 'NN/g — animation for orientation (highlight destination); WCAG 2.3.3 (reduced motion → no smooth scroll)',
    variants: [
      now('Миттєвий стрибок без виділення.'),
      { id: 'v1', name: 'Плавно + спалах', desc: 'Плавна прокрутка, розділ підсвічується.', perf: ['low', 'smooth scroll + колір фону'] },
      { id: 'v2', name: 'Плавно + кільце', desc: 'Плавна прокрутка, навколо розділу пульсує рамка.', perf: ['low', 'smooth scroll + repaint тіні'] },
      { id: 'v3', name: 'Плавно + поштовх', desc: 'Плавна прокрутка, розділ коротко збільшується.', perf: ['low', 'smooth scroll + transform'] }
    ]
  }
]

const k = (idea: string, v: string) => `${idea}-${v}`
const allKeys = (idea: string) => ideas.find(i => i.key === idea)!.variants.map(v => k(idea, v.id))

/* ---------- per-cell state ---------- */
const touched = reactive<Record<string, boolean>>({})
const flags = reactive<Record<string, boolean>>({})
const texts = reactive<Record<string, string>>({})
const errors = reactive<Record<string, string>>({})
const counts = reactive<Record<string, number>>({})
const fired = reactive<Record<string, number>>({})
const tabs = reactive<Record<string, string>>({})
const segs = reactive<Record<string, string | number | null>>({})
const tagLists = reactive<Record<string, string[]>>({})
const rows = reactive<Record<string, { id: number, name: string, status: string }[]>>({})

for (const key of allKeys('tabs')) tabs[key] = 'files'
for (const key of allKeys('segment')) segs[key] = 'day'
for (const key of allKeys('count')) counts[key] = 3
for (const key of allKeys('empty')) counts[key] = 0
for (const key of allKeys('tags')) tagLists[key] = ['vue', 'motion', 'ui']
for (const key of allKeys('table')) rows[key] = [
  { id: 2, name: 'Звіт Q3', status: 'Готово' },
  { id: 1, name: 'Звіт Q2', status: 'Готово' }
]

function touch(idea: string, v: string) {
  touched[k(idea, v)] = true
}

/* ---------- teleported components: variant chosen via a body attribute ---------- */
const BODY_IDEAS = ['dropdown', 'tooltip', 'dialog', 'notify', 'select', 'notifytimer', 'menu', 'tipdelay']
function setBody(idea: string, v: string) {
  if (BODY_IDEAS.includes(idea)) document.body.dataset[`lab${idea}`] = v
}
onBeforeUnmount(() => {
  for (const idea of BODY_IDEAS) delete document.body.dataset[`lab${idea}`]
  delete document.body.dataset.labtipwarm
})

/* ---------- cells & measured indicators (tabs v1, segment v1) ---------- */
const cells: Record<string, HTMLElement> = {}
function setCell(idea: string, v: string, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLElement) cells[k(idea, v)] = el
}

const ind = reactive<Record<string, { x: number, y: number, w: number, h: number }>>({})
function measure(key: string, selector: string) {
  const cell = cells[key]
  const stage = cell?.querySelector('.lab-stage')
  const target = cell?.querySelector(selector)
  if (!stage || !target) return
  const s = stage.getBoundingClientRect()
  const t = target.getBoundingClientRect()
  ind[key] = { x: t.left - s.left, y: t.top - s.top, w: t.width, h: t.height }
}
function indStyle(key: string, kind: 'line' | 'box') {
  const r = ind[key]
  return kind === 'line'
    ? { transform: `translate(${r.x}px, ${r.y + r.h - 2}px) scaleX(${r.w})` }
    : { transform: `translate(${r.x}px, ${r.y}px)`, width: `${r.w}px`, height: `${r.h}px` }
}
const measureAll = () => nextTick(() => {
  measure(k('tabs', 'v1'), '.t-tabs__tab.is-active')
  measure(k('segment', 'v1'), '[aria-pressed="true"]')
})
watch([tabs, segs], measureAll)
onMounted(() => {
  measureAll()
  window.addEventListener('resize', measureAll)
})
onBeforeUnmount(() => window.removeEventListener('resize', measureAll))

/* ---------- picks + generated prompt ---------- */
interface Pick { pick: Variant['id'], comment: string, discuss: boolean }
const PICKS_KEY = 'playground:motion-lab-picks'
let savedPicks: Record<string, Partial<Pick>> = {}
try { savedPicks = JSON.parse(localStorage.getItem(PICKS_KEY) ?? '{}') } catch { /* ignore */ }
const picks = reactive<Record<string, Pick>>(Object.fromEntries(ideas.map(i => [
  i.key,
  { pick: i.key === 'button' ? 'chosen' : 'now', comment: '', discuss: false, ...savedPicks[i.key] }
])))
watch(picks, (v) => {
  try { localStorage.setItem(PICKS_KEY, JSON.stringify(v)) } catch { /* ignore */ }
}, { deep: true })

const TEMPLATE_HEAD = `You are the orchestrator of this task. Repository vitaliysimkin/t-components, branch main.
Roles

* You only orchestrate. Do not read code, edit files, or run builds and tests yourself. Everything goes through subagents. You write briefs, sequence the work, weigh results, make decisions, and report.
* There are only two kinds of agents:
   * Developer: makes the changes. Give each one a narrow scope.
   * Reviewer: takes no part in development and has a veto. It reviews every change and the final state, independently of the authors:
      * simplicity: unnecessary code, abstractions, indirection and duplication; anything that already exists and can be reused; anything that could be removed;
      * correctness: runs the checks named in the step and confirms the stated behaviour. A change is accepted only when the Reviewer approves it. Unresolved disagreement comes to me.

Models

* Run every agent on Sonnet.
* Use Opus only for individual agents whose task is critical.

Language

* English inside: agent briefs, agent reports to you, code comments, commits, docs.
* Ukrainian only in your reports to me.

Goal Make the result as minimal, simple and elegant as possible.
Work order Each step: Developer, then Reviewer. At the end, the Reviewer reviews the whole result. Then commit and push to the designated branch. Do not open a PR unless I ask.
Task `
const TEMPLATE_TAIL = `
Done when: every step is approved by the Reviewer, the final review passes, and the work is committed and pushed. Report to me in Ukrainian: what changed (file list), test results, and anything dropped or disputed.`

const prompt = computed(() => {
  const line = (i: Idea, v: Variant, c: Pick) =>
    `${i.name} (${i.comps.join(', ')}): ${v.name} — ${v.desc}${c.comment ? ` User comment: "${c.comment}"` : ''}`
  const chosen = ideas.filter(i => picks[i.key].pick !== 'now' && !picks[i.key].discuss)
  const discuss = ideas.filter(i => picks[i.key].discuss)
  const steps = chosen.map((i, n) => `${n + 1}. ${line(i, i.variants.find(v => v.id === picks[i.key].pick)!, picks[i.key])}`)
  const disc = discuss.map(i => `- ${line(i, i.variants.find(v => v.id === picks[i.key].pick)!, picks[i.key])}`)
  return TEMPLATE_HEAD
    + 'Add component animations to t-components on top of the existing motion architecture (motion tokens, the `@vitaliysimkin/t-components/motion` entry, `data-t-motion` full/reduced/off). '
    + 'Each animation is on by default, must respect the global switch (off or a simpler fallback) and prefers-reduced-motion, and must have the lowest possible performance impact (transform/opacity only where possible). '
    + 'The reference implementation of each variant is in playground/src/views/MotionLabPage.vue. One step per animation, in this order:\n'
    + (steps.length ? steps.join('\n') : '(no animations selected)')
    + (disc.length ? `\nBefore implementing these, raise them with me and wait for my decision:\n${disc.join('\n')}` : '')
    + TEMPLATE_TAIL
})

const copied = ref(false)
async function copyPrompt() {
  await navigator.clipboard.writeText(prompt.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}

/* ---------- processed ideas ---------- */
const DONE_KEY = 'playground:motion-lab-done'
let savedDone: Record<string, boolean> = {}
try { savedDone = JSON.parse(localStorage.getItem(DONE_KEY) ?? '{}') } catch { /* ignore */ }
const done = reactive<Record<string, boolean>>(Object.fromEntries(ideas.map(i => [i.key, !!savedDone[i.key]])))
const hideDone = ref(false)
const onlyDiscuss = ref(false)
const discussCount = computed(() => ideas.filter(i => picks[i.key]?.discuss).length)
const doneCount = computed(() => ideas.filter(i => done[i.key]).length)
watch(done, (v) => {
  try { localStorage.setItem(DONE_KEY, JSON.stringify(v)) } catch { /* ignore */ }
}, { deep: true })

/* ---------- slow-mo ----------
   Multiplies every animation/transition duration and delay in the page's
   stylesheets, so computed styles (and Vue <Transition> timeouts) stay correct. */
const slowOptions = [1, 2, 4, 10].map(v => ({ value: v, label: v === 1 ? '1×' : `${v}× повільніше` }))
const slow = ref<string | number | null>(1)
const slowProps = ['animation-duration', 'animation-delay', 'transition-duration', 'transition-delay']
const original = new Map<CSSStyleDeclaration, Record<string, [string, string]>>()

function scaleTimes(value: string, f: number) {
  return value.split(',').map((t) => {
    const n = parseFloat(t)
    if (Number.isNaN(n) || n === 0) return t.trim()
    return t.trim().endsWith('ms') ? `${n * f}ms` : `${n * f}s`
  }).join(', ')
}

function eachStyle(rules: CSSRuleList, cb: (st: CSSStyleDeclaration) => void) {
  for (const r of Array.from(rules)) {
    if (r instanceof CSSStyleRule) cb(r.style)
    if ('cssRules' in r && (r as CSSGroupingRule).cssRules) eachStyle((r as CSSGroupingRule).cssRules, cb)
  }
}

function applySlow(f: number) {
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try { rules = sheet.cssRules } catch { continue }
    eachStyle(rules, (st) => {
      let orig = original.get(st)
      if (!orig) {
        orig = {}
        for (const prop of slowProps) {
          const v = st.getPropertyValue(prop)
          if (v) orig[prop] = [v, st.getPropertyPriority(prop)]
        }
        if (!Object.keys(orig).length) return
        original.set(st, orig)
      }
      for (const [prop, [v, prio]] of Object.entries(orig)) {
        st.setProperty(prop, f === 1 ? v : scaleTimes(v, f), prio)
      }
    })
  }
}
watch(slow, v => applySlow(Number(v) || 1))
onBeforeUnmount(() => applySlow(1))

/* ---------- replay helper ---------- */
function replay(el: Element | undefined | null, cls: string, ms = 1200) {
  if (!el) return
  el.classList.remove(cls)
  void (el as HTMLElement).offsetWidth
  el.classList.add(cls)
  setTimeout(() => el.classList.remove(cls), ms * (Number(slow.value) || 1))
}
function fire(idea: string, v: string) {
  const key = k(idea, v)
  fired[key] = (fired[key] ?? 0) + 1
  replay(cells[key], 'is-fire')
}

/* ---------- 1. Button: sink, then spring + ripple ---------- */
function sinkDown(e: PointerEvent) {
  if (e.button !== 0) return
  const el = e.currentTarget as HTMLElement
  el.classList.remove('lab-spring')
  el.classList.add('lab-sunk')
  const r = el.getBoundingClientRect()
  const d = Math.max(r.width, r.height) * 2
  const s = document.createElement('span')
  s.className = 'lab-ripple'
  s.style.width = s.style.height = `${d}px`
  s.style.left = `${e.clientX - r.left - d / 2}px`
  s.style.top = `${e.clientY - r.top - d / 2}px`
  el.appendChild(s)
  s.addEventListener('animationend', () => s.remove())
}
function sinkUp(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  if (!el.classList.contains('lab-sunk')) return
  el.classList.remove('lab-sunk')
  replay(el, 'lab-spring', 450)
}

/* ---------- 4/5. Dialog, notifications ---------- */
const dialog = useDialog()
const notify = useNotifications()
/* TModalBox animates `scale` around a transform-origin set to the opener's center
   (or the panel's center when nothing is focused); variants only swap keyframes in CSS.
   Centered variants blur the trigger first to get the no-opener fallback. */
const centeredDialogs = ['v1', 'v3', 'v8']
function openDialog(v: string, e: MouseEvent) {
  if (centeredDialogs.includes(v)) (e.currentTarget as HTMLElement).blur()
  dialog.confirm({ title: 'Видалити файл?', message: 'Файл report.pdf буде видалено.', variant: 'danger', confirmText: 'Видалити' })
}

/* ---------- 6/7 data ---------- */
const tabItems = [
  { value: 'files', label: 'Файли' },
  { value: 'activity', label: 'Активність' },
  { value: 'settings', label: 'Налаштування' }
]
const segOptions = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Тиждень' },
  { value: 'month', label: 'Місяць' }
]

/* ---------- 11. Field error ---------- */
async function validate(idea: string, v: string) {
  const key = k(idea, v)
  errors[key] = ''
  if (texts[key]?.includes('@')) return
  await nextTick()
  errors[key] = 'Вкажіть коректний email'
  fire(idea, v)
}

/* ---------- 13. Tree ---------- */
const treeData = [
  { path: 'src', name: 'src', children: [
    { path: 'src/components', name: 'components', children: [
      { path: 'src/components/TButton.vue', name: 'TButton.vue' },
      { path: 'src/components/TInput.vue', name: 'TInput.vue' }
    ] },
    { path: 'src/index.ts', name: 'index.ts' }
  ] },
  { path: 'public', name: 'public', children: [{ path: 'public/favicon.ico', name: 'favicon.ico' }] }
]

/* ---------- 14. Table ---------- */
const tableCols: TTableColumn<{ id: number, name: string, status: string }>[] = [
  { key: 'id', label: '#', width: '48px', align: 'right' },
  { key: 'name', label: 'Назва' },
  { key: 'status', label: 'Статус', width: '90px' }
]
async function addRow(idea: string, v: string) {
  const key = k(idea, v)
  const list = rows[key]
  const id = list[0].id + 1
  list.unshift({ id, name: `Звіт #${id}`, status: 'Новий' })
  if (list.length > 4) list.pop()
  await nextTick()
  replay(cells[key]?.querySelector('tbody tr.t-table__tr'), 'lab-new')
}

/* ---------- 17. Tags ---------- */
const tagPool = ['design', 'tokens', 'a11y', 'spring', 'ripple', 'docs', 'theme']
function addTag(idea: string, v: string) {
  const list = tagLists[k(idea, v)]
  const next = tagPool.find(t => !list.includes(t))
  if (next) list.push(next)
}
function removeTag(idea: string, v: string, t: string) {
  const list = tagLists[k(idea, v)]
  list.splice(list.indexOf(t), 1)
}

/* ================= ideas 21–50 ================= */

/* 23. Scoped loading */
const loading = useLoading()
const loadTargets: Record<string, HTMLElement> = {}
function setLoadTarget(key: string, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLElement) loadTargets[key] = el
}
function runLoading(idea: string, v: string, ms: number) {
  const h = loading.show({ target: loadTargets[k(idea, v)], text: 'Завантаження…' })
  setTimeout(() => h.close(), ms)
}

/* 24. Table loading */
function reloadTable(idea: string, v: string) {
  const key = k(idea, v)
  flags[key] = true
  setTimeout(() => { flags[key] = false }, 1500)
}

/* 25. Sort */
type Sort = { key: string, direction: 'asc' | 'desc' } | null
type SortRow = { id: number, name: string, size: number }
const sortCols: TTableColumn<SortRow>[] = [
  { key: 'name', label: 'Файл', sortable: true },
  { key: 'size', label: 'КБ', width: '70px', align: 'right', sortable: true }
]
const sortRows: SortRow[] = [
  { id: 1, name: 'report.pdf', size: 420 },
  { id: 2, name: 'avatar.png', size: 96 },
  { id: 3, name: 'notes.md', size: 4 },
  { id: 4, name: 'budget.xlsx', size: 180 }
]
const sorts = reactive<Record<string, Sort>>({})
const rowTops = new Map<string, number>()
function recordRows(idea: string, v: string) {
  rowTops.clear()
  cells[k(idea, v)]?.querySelectorAll<HTMLElement>('tbody tr.t-table__tr').forEach((tr) => {
    rowTops.set(tr.textContent ?? '', tr.getBoundingClientRect().top)
  })
}
async function onSort(idea: string, v: string, s: Sort) {
  const key = k(idea, v)
  sorts[key] = s
  if (v === 'v1' || v === 'v2') fire(idea, v)
  if (v !== 'v3') return
  await nextTick()
  cells[key]?.querySelectorAll<HTMLElement>('tbody tr.t-table__tr').forEach((tr) => {
    const before = rowTops.get(tr.textContent ?? '')
    if (before === undefined) return
    const dy = before - tr.getBoundingClientRect().top
    if (!dy) return
    tr.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], {
      duration: 300 * (Number(slow.value) || 1),
      easing: 'cubic-bezier(.2, 0, 0, 1)'
    })
  })
}

/* 26. Row selection */
const selections = reactive<Record<string, (string | number)[]>>({})

/* 27/28. Date picker */
const dates = reactive<Record<string, Date | null>>({})
const dirs = reactive<Record<string, 'prev' | 'next'>>({})
async function onDpClick(idea: string, v: string, e: MouseEvent) {
  const t = e.target as HTMLElement
  const key = k(idea, v)
  if (idea === 'month') {
    const chev = t.closest('.t-date-picker__chev')
    if (!chev) return
    dirs[key] = chev.classList.contains('t-date-picker__chev--left') ? 'prev' : 'next'
    await nextTick()
    replay(cells[key], `is-${dirs[key]}`, 500)
    return
  }
  if (!t.closest('.t-date-picker__title, .t-date-picker__grid-cell')) return
  await nextTick()
  replay(cells[key], 'is-fire', 500)
}

/* 29. Time picker */
const hours = reactive<Record<string, number>>({})
const minutes = reactive<Record<string, number>>({})

/* 30. Select */
const selectValues = reactive<Record<string, string | null>>({})
const cityOptions = [
  { value: 'kyiv', label: 'Київ' },
  { value: 'lviv', label: 'Львів' },
  { value: 'odesa', label: 'Одеса' },
  { value: 'kharkiv', label: 'Харків' }
]

/* 31–33. Log pane */
let logId = 0
const logLine = (): TLogLine => {
  logId++
  const kinds = [undefined, 'info', 'warn', 'err'] as const
  return { id: logId, text: `request #${logId} handled in ${20 + (logId * 37) % 180} ms`, kind: kinds[logId % 4], prefix: '12:0' + (logId % 10) }
}
const logs = reactive<Record<string, TLogLine[]>>({})
const longLog = Array.from({ length: 30 }, logLine)
function addLog(idea: string, v: string) {
  logs[k(idea, v)].push(logLine())
}
function onScrollShadow(idea: string, v: string, e: Event) {
  flags[k(idea, v)] = (e.target as HTMLElement).scrollTop > 0
}

/* 34. Crumbs */
const crumbPaths = ['docs/guides/motion.md', 'src/components/TButton.vue', 'playground/src/views/MotionLabPage.vue']

/* 35. File tree */
const filePaths = ['src/index.ts', 'src/components/TButton.vue', 'src/components/TInput.vue', 'src/styles/tokens.css', 'README.md']
const fileSel = reactive<Record<string, string | null>>({})

/* 37. Tab panels */
async function onTabPanel(idea: string, v: string, t: string) {
  const key = k(idea, v)
  const order = tabItems.map(i => i.value)
  dirs[key] = order.indexOf(t) < order.indexOf(tabs[key]) ? 'prev' : 'next'
  tabs[key] = t
}

/* 38. Notification timer: body attribute picks the variant (see setBody). */

/* 40. Async button */
const busy = reactive<Record<string, 'idle' | 'loading' | 'done'>>({})
function busyIcon(idea: string, v: string) {
  const s = busy[k(idea, v)]
  if (s === 'done') return 'system-uicons:check'
  if (s === 'loading' && v === 'v1') return 'system-uicons:loader'
  return 'system-uicons:upload'
}
function runBusy(idea: string, v: string) {
  const key = k(idea, v)
  if (busy[key] === 'loading') return
  busy[key] = 'loading'
  setTimeout(() => {
    busy[key] = 'done'
    setTimeout(() => { busy[key] = 'idle' }, 1200)
  }, 1500)
}

/* 44. Theme */
function switchTheme(v: string, theme: 'light' | 'dark', e: MouseEvent) {
  const apply = () => {
    currentTheme.value = theme
    applyTheme(theme)
  }
  const root = document.documentElement
  const vt = (document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }).startViewTransition
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (v === 'v1') {
    root.classList.add('lab-theme-fade')
    apply()
    setTimeout(() => root.classList.remove('lab-theme-fade'), 300 * (Number(slow.value) || 1))
    return
  }
  if ((v === 'v2' || v === 'v3') && vt && !reduced) {
    if (v === 'v3') {
      const r = Math.hypot(Math.max(e.clientX, innerWidth - e.clientX), Math.max(e.clientY, innerHeight - e.clientY))
      root.style.setProperty('--lab-vt-x', `${e.clientX}px`)
      root.style.setProperty('--lab-vt-y', `${e.clientY}px`)
      root.style.setProperty('--lab-vt-r', `${r}px`)
    }
    root.dataset.labvt = v
    vt.call(document, apply)
    setTimeout(() => { delete root.dataset.labvt }, 800 * (Number(slow.value) || 1))
    return
  }
  apply()
}

/* 47. Tag status */
const statuses = [
  { label: 'Чернетка', variant: 'gray' as const },
  { label: 'На перевірці', variant: 'yellow' as const },
  { label: 'Опубліковано', variant: 'green' as const }
]

/* 48. Tooltip warm-up: after leaving a trigger, neighbours show without delay for 600 ms. */
let warmTimer: ReturnType<typeof setTimeout> | undefined
function warmTips() {
  document.body.dataset.labtipwarm = '1'
  clearTimeout(warmTimer)
  warmTimer = setTimeout(() => { delete document.body.dataset.labtipwarm }, 600)
}

/* 49. Indeterminate */
const checks = reactive<Record<string, boolean[]>>({})
const allChecked = (idea: string, v: string) => checks[k(idea, v)].every(Boolean)
const someChecked = (idea: string, v: string) => !allChecked(idea, v) && checks[k(idea, v)].some(Boolean)
function setAll(idea: string, v: string, val: boolean) {
  checks[k(idea, v)] = checks[k(idea, v)].map(() => val)
}

/* 50. Anchor */
const anchorSections = ['Кошик', 'Доставка', 'Контакти', 'Оплата', 'Підтвердження']
function goAnchor(idea: string, v: string) {
  const key = k(idea, v)
  const target = cells[key]?.querySelector<HTMLElement>('[data-anchor="Оплата"]')
  const box = cells[key]?.querySelector<HTMLElement>('.lab-anchor')
  if (!target || !box) return
  const smooth = v !== 'now' && !matchMedia('(prefers-reduced-motion: reduce)').matches
  box.scrollTo({ top: target.offsetTop - box.offsetTop, behavior: smooth ? 'smooth' : 'auto' })
  if (v === 'now') return
  setTimeout(() => replay(target, 'lab-hit', 1200), smooth ? 350 : 0)
}

for (const key of allKeys('sort')) sorts[key] = null
for (const key of allKeys('select-row')) selections[key] = []
for (const key of allKeys('select-row')) rows[key] = [
  { id: 3, name: 'Звіт Q4', status: 'Чернетка' },
  { id: 2, name: 'Звіт Q3', status: 'Готово' },
  { id: 1, name: 'Звіт Q2', status: 'Готово' }
]
for (const key of allKeys('tableload')) rows[key] = [
  { id: 2, name: 'Звіт Q3', status: 'Готово' },
  { id: 1, name: 'Звіт Q2', status: 'Готово' }
]
for (const key of [...allKeys('month'), ...allKeys('dpview')]) dates[key] = new Date()
for (const key of allKeys('time')) { hours[key] = 9; minutes[key] = 30 }
for (const key of allKeys('select')) selectValues[key] = 'lviv'
for (const key of allKeys('loglines')) logs[key] = Array.from({ length: 3 }, logLine)
for (const key of allKeys('toend')) logs[key] = Array.from({ length: 20 }, logLine)
for (const key of [...allKeys('crumbs'), ...allKeys('infotip'), ...allKeys('tagstatus')]) counts[key] = 0
for (const key of allKeys('filetree')) fileSel[key] = null
for (const key of allKeys('tabpanel')) tabs[key] = 'files'
for (const key of allKeys('btnload')) busy[key] = 'idle'
for (const key of allKeys('indet')) checks[key] = [true, false]
</script>

<style scoped>
.lab {
  padding: var(--t-space-6, 24px);
  max-width: 1240px;
}

.lab__head h1 {
  margin: 0;
  font-size: var(--t-font-size-large);
  color: var(--t-color-text);
}

.lab__bar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--t-space-2) var(--t-space-6);
  margin: calc(-1 * var(--t-space-6, 24px)) calc(-1 * var(--t-space-6, 24px)) 0;
  padding: var(--t-space-3) var(--t-space-6, 24px);
  background: var(--t-color-bg);
  border-bottom: 1px solid var(--t-color-border);
}

.lab__bar h1 {
  margin: 0;
  font-size: var(--t-font-size-large);
  color: var(--t-color-text);
}

.lab__speed {
  display: flex;
  align-items: center;
  gap: var(--t-space-2);
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
}

.lab-idea__done {
  margin-left: auto;
}

.lab-idea.is-done {
  opacity: 0.55;
}

.lab__head p {
  margin: var(--t-space-2) 0 var(--t-space-4);
  max-width: 70ch;
  color: var(--t-color-text-muted);
  font-size: var(--t-font-size-small);
}

.lab-idea {
  margin-bottom: var(--t-space-6, 24px);
}

.lab-cell.is-picked {
  outline: 2px solid var(--t-color-accent, var(--t-terra-5));
  outline-offset: -2px;
}

.lab-pick {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--t-space-3);
  margin-top: var(--t-space-3);
}

.lab-pick__comment {
  flex: 1;
  min-width: 200px;
}

.lab-prompt {
  margin-top: var(--t-space-6);
}

.lab-prompt__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--t-space-2);
}

.lab-prompt__head h2 {
  margin: 0;
  font-size: var(--t-font-size-medium);
  color: var(--t-color-text);
}

.lab-prompt__text {
  margin: 0;
  padding: var(--t-space-3);
  max-height: 480px;
  overflow: auto;
  white-space: pre-wrap;
  font-size: var(--t-font-size-mini);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-default);
  background: var(--t-color-surface);
  color: var(--t-color-text);
}

.lab-idea__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--t-space-2);
  margin-bottom: var(--t-space-3);
}

.lab-idea__head h2 {
  margin: 0;
  font-size: var(--t-font-size-medium);
  color: var(--t-color-text);
}

.lab-idea__num {
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
  font-variant-numeric: tabular-nums;
}

.lab-idea__comp {
  font-size: var(--t-font-size-mini);
  font-family: ui-monospace, monospace;
  color: var(--t-color-accent);
}

.lab-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--t-space-3);
}

.lab-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding: var(--t-space-3);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-medium);
  background: var(--t-color-surface);
}

.lab-cell.is-now {
  background: transparent;
  border-style: dashed;
}

.lab-cell.is-chosen {
  border-color: var(--t-color-accent);
}

.lab-cell__tag {
  font-size: var(--t-font-size-mini);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--t-color-text-muted);
}

.is-chosen .lab-cell__tag {
  color: var(--t-color-accent);
}

.lab-stage {
  position: relative;
  min-height: 132px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--t-space-3) 0;
}

.lab-cell__name {
  font-weight: 600;
  color: var(--t-color-text);
  font-size: var(--t-font-size-default);
}

.lab-cell__desc {
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
}

.lab-cell__perf {
  margin-top: var(--t-space-1);
  font-size: var(--t-font-size-mini);
  color: var(--t-color-text-muted);
}

.lab-cell__perf span {
  padding: 0 5px;
  border-radius: 4px;
  font-weight: 600;
}

.lab-cell__perf [data-level='low'] {
  color: var(--t-green-5);
  background: color-mix(in srgb, var(--t-green-5) 16%, transparent);
}

.lab-cell__perf [data-level='medium'] {
  color: var(--t-amber-5);
  background: color-mix(in srgb, var(--t-amber-5) 16%, transparent);
}

/* stage contents */
.lab-menu {
  min-width: 160px;
  padding: 4px;
  font-size: var(--t-font-size-small);
  color: var(--t-color-text);
}

.lab-menu > div {
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.lab-menu > div:hover {
  background: var(--t-color-bg);
}

.lab-form,
.lab-table,
.lab-tags,
.lab-empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--t-space-2);
  width: 100%;
}

.lab-empty {
  align-items: center;
}

.lab-tree {
  width: 100%;
  align-self: flex-start;
}

.lab-tags__list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  position: relative;
  min-height: 26px;
}

.lab-card {
  width: 100%;
}

.lab-copy {
  position: relative;
  display: inline-flex;
}

.lab-copy__bubble {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 6px);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: var(--t-font-size-mini);
  white-space: nowrap;
  color: var(--t-color-surface);
  background: var(--t-color-text);
  pointer-events: none;
  animation: lab-bubble 1.1s ease-out forwards;
}

/* measured indicators */
.lab-tabline {
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 2px;
  background: var(--t-color-accent);
  transform-origin: 0 0;
  transition: transform 0.32s cubic-bezier(.3, 1.3, .5, 1);
  pointer-events: none;
}

.lab-thumb {
  position: absolute;
  left: 0;
  top: 0;
  border-radius: var(--t-radius-small);
  background: var(--t-color-accent);
  transition: transform 0.32s cubic-bezier(.3, 1.3, .5, 1), width 0.32s cubic-bezier(.3, 1.3, .5, 1);
  pointer-events: none;
}

.lab-segment-v1 :deep(.t-button-group) {
  position: relative;
  z-index: 1;
}

.lab-segment-v1 :deep(.t-button[aria-pressed='true']) {
  background: transparent !important;
  border-color: transparent !important;
}

.lab-tabs-v1 :deep(.t-tabs .t-tabs__tab.is-active) {
  border-bottom-color: transparent !important;
}

/* 6. Tabs v2 / v3 */
.lab-tabs-v2 :deep(.t-tabs .t-tabs__tab),
.lab-tabs-v3 :deep(.t-tabs .t-tabs__tab) {
  position: relative;
}

.lab-tabs-v2 :deep(.t-tabs .t-tabs__tab.is-active),
.lab-tabs-v3 :deep(.t-tabs .t-tabs__tab.is-active) {
  border-bottom-color: transparent !important;
}

.lab-tabs-v2 :deep(.t-tabs__tab.is-active)::after,
.lab-tabs-v3 :deep(.t-tabs__tab.is-active)::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: var(--t-color-accent);
}

.lab-tabs-v2.is-touched :deep(.t-tabs__tab.is-active)::after {
  animation: lab-grow-x 0.3s cubic-bezier(.2, 0, 0, 1);
}

.lab-tabs-v3.is-touched :deep(.t-tabs__tab.is-active)::after {
  animation: lab-rise 0.3s cubic-bezier(.2, 0, 0, 1);
}

/* 7. Segment v2 / v3 */
.lab-segment-v2.is-touched :deep(.t-button[aria-pressed='true']) {
  animation: lab-pop 0.35s cubic-bezier(.2, 1.8, .4, 1);
}

.lab-segment-v3 :deep(.t-button) {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.lab-segment-v3 :deep(.t-button[aria-pressed='true']) {
  background: transparent !important;
}

.lab-segment-v3 :deep(.t-button[aria-pressed='true'])::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--t-color-accent);
  transform-origin: left;
}

.lab-segment-v3.is-touched :deep(.t-button[aria-pressed='true'])::before {
  animation: lab-grow-x 0.3s cubic-bezier(.2, 0, 0, 1);
}

/* 8. Checkbox */
.lab-checkbox-v1.is-touched :deep(.t-checkbox.is-checked .t-checkbox__box)::after {
  animation: lab-check-pop 0.35s cubic-bezier(.2, 1.8, .4, 1);
}

.lab-checkbox-v2.is-touched :deep(.t-checkbox.is-checked .t-checkbox__box)::after {
  animation: lab-check-draw 0.3s ease-out;
}

.lab-checkbox-v3.is-touched :deep(.t-checkbox.is-checked .t-checkbox__box),
.lab-checkbox-v3.is-touched :deep(.t-checkbox:not(.is-checked) .t-checkbox__box) {
  animation: lab-squish 0.4s cubic-bezier(.2, 1.6, .4, 1);
}

.lab-checkbox-v3.is-touched :deep(.t-checkbox:not(.is-checked) .t-checkbox__box) {
  animation-name: lab-squish-b;
}

/* 9. Switch */
.lab-switch-v1 :deep(.t-switch__thumb) {
  transition: transform 0.45s linear(0, 0.36 12%, 0.98 30%, 1.08 42%, 1.02 60%, 0.995 78%, 1) !important;
}

.lab-switch-v2 :deep(.t-switch__thumb) {
  transform-origin: left center;
  transition: transform 0.2s ease !important;
}

.lab-switch-v2 :deep(.t-switch:active .t-switch__thumb) {
  transform: translate(0, -50%) scaleX(1.35);
}

.lab-switch-v2 :deep(.t-switch:active .t-switch__input:checked ~ .t-switch__track .t-switch__thumb) {
  transform-origin: right center;
  transform: translate(var(--t-switch-translate), -50%) scaleX(1.35);
}

.lab-switch-v3.is-touched :deep(.t-switch__thumb) {
  animation: lab-sw-off 0.3s ease;
}

.lab-switch-v3.is-touched :deep(.t-switch__input:checked ~ .t-switch__track .t-switch__thumb) {
  animation: lab-sw-on 0.3s ease;
}

/* 10. Focus */
.lab-focus-v1 :deep(.t-input-wrapper:focus-within) {
  animation: lab-ring-land 0.35s ease-out;
}

.lab-focus-v2 :deep(.t-input-wrapper:focus-within) {
  box-shadow: none;
}

.lab-focus-v2 :deep(.t-input-wrapper)::after {
  content: '';
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: var(--t-color-accent);
  transform: scaleX(0);
  transition: transform 0.25s cubic-bezier(.2, 0, 0, 1);
}

.lab-focus-v2 :deep(.t-input-wrapper:focus-within)::after {
  transform: scaleX(1);
}

.lab-focus-v3 :deep(.t-input-icon--prefix) {
  transition: transform 0.25s cubic-bezier(.2, 1.6, .4, 1), color 0.2s ease;
}

.lab-focus-v3 :deep(.t-input-wrapper:focus-within .t-input-icon--prefix) {
  color: var(--t-color-accent);
  transform: scale(1.15);
}

/* 11. Error */
.lab-error-v1.is-fire :deep(.t-form-field__control) {
  animation: lab-shake 0.4s ease-in-out;
}

.lab-error-v2 :deep(.t-form-field__error) {
  animation: lab-drop 0.25s cubic-bezier(.2, 0, 0, 1);
}

.lab-error-v3.is-fire :deep(.t-input-wrapper),
.lab-error-v4.is-fire :deep(.t-input-wrapper) {
  animation: lab-ring-danger 0.6s ease-out;
}

.lab-error-v4.is-fire :deep(.t-form-field__control) {
  animation: lab-shake 0.4s ease-in-out;
}

/* 12. Clear */
.lab-clear-v1 :deep(.t-input-icon--clear) {
  animation: lab-pop-in 0.25s cubic-bezier(.2, 1.6, .4, 1);
}

.lab-clear-v2 :deep(.t-input-icon--clear) {
  animation: lab-spin-in 0.3s cubic-bezier(.2, 1.4, .4, 1);
}

.lab-clear-v3 :deep(.t-input-icon--clear) {
  animation: lab-slide-in 0.22s cubic-bezier(.2, 0, 0, 1);
}

/* 13. Tree */
.lab-tree-v1.is-touched :deep(.t-tree__node) {
  animation: lab-drop 0.22s cubic-bezier(.2, 0, 0, 1);
}

.lab-tree-v2.is-touched :deep(.t-tree__node) {
  animation: lab-fade 0.25s ease;
}

.lab-tree-v3.is-touched :deep(.t-tree__node) {
  animation: lab-from-left 0.22s cubic-bezier(.2, 0, 0, 1);
}

/* 14. Table */
.lab-table-v1 :deep(tr.lab-new td) {
  animation: lab-flash-bg 1.1s ease-out;
}

.lab-table-v2 :deep(tr.lab-new) {
  animation: lab-drop 0.3s cubic-bezier(.2, 0, 0, 1);
}

.lab-table-v3 :deep(tr.lab-new td:first-child) {
  animation: lab-flash-bar 1.1s ease-out;
}

/* 15. Badge count (TBadge is re-keyed on change, so mount animations replay) */
.lab-count-v1.is-touched :deep(.t-badge) {
  animation: lab-badge-pop 0.35s cubic-bezier(.2, 1.8, .4, 1);
}

.lab-count-v2.is-touched :deep(.t-badge) {
  animation: lab-badge-roll 0.28s cubic-bezier(.2, 0, 0, 1);
}

.lab-count-v3.is-touched :deep(.t-badge)::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid currentColor;
  color: var(--t-color-danger, #d33);
  animation: lab-ping 0.6s ease-out forwards;
}

/* 16. Badge dot */
.lab-dot-v1 :deep(.t-badge--dot)::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: inherit;
  animation: lab-ping 1s ease-out 3;
}

.lab-dot-v2 :deep(.t-badge--dot) {
  animation: lab-breathe 1.2s ease-in-out 3;
}

.lab-dot-v3 :deep(.t-badge--dot) {
  animation: lab-dot-bounce 0.5s cubic-bezier(.2, 1.8, .4, 1);
}

/* 18. Copy */
.lab-copy-v1.is-fire :deep(.t-copy-chip__icon) {
  animation: lab-pop 0.35s cubic-bezier(.2, 1.8, .4, 1);
}

.lab-copy-v3.is-fire :deep(.t-copy-chip) {
  animation: lab-flash-bg 0.9s ease-out;
}

/* 19. Card */
.lab-card-v1 :deep(.t-card) {
  position: relative;
  overflow: visible;
  transition: transform 0.2s cubic-bezier(.2, 0, 0, 1);
}

.lab-card-v1 :deep(.t-card)::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: var(--t-shadow-2);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.lab-card-v1 :deep(.t-card:hover) {
  transform: translateY(-2px);
}

.lab-card-v1 :deep(.t-card:hover)::after {
  opacity: 1;
}

.lab-card-v2 :deep(.t-card) {
  transition: border-color 0.2s ease;
}

.lab-card-v2 :deep(.t-card:hover) {
  border-color: var(--t-color-accent);
}

.lab-card-v3 :deep(.t-card) {
  transition: transform 0.2s cubic-bezier(.2, 0, 0, 1);
}

.lab-card-v3 :deep(.t-card:hover) {
  transform: scale(1.015);
}

/* 20. Empty */
.lab-empty-v1 :deep(.t-empty) {
  animation: lab-rise-lg 0.4s cubic-bezier(.2, 0, 0, 1);
}

.lab-empty-v2 :deep(.t-empty__icon) {
  animation: lab-rise-lg 0.35s cubic-bezier(.2, 0, 0, 1) both;
}

.lab-empty-v2 :deep(.t-empty__description) {
  animation: lab-rise-lg 0.35s cubic-bezier(.2, 0, 0, 1) 0.12s both;
}

.lab-empty-v3 :deep(.t-empty__icon) {
  animation: lab-wobble 0.7s ease-in-out;
}
/* ================= ideas 21–50 ================= */
.lab-idea__source {
  margin: -6px 0 var(--t-space-3);
  font-size: var(--t-font-size-mini);
  color: var(--t-color-text-muted);
}

.lab-col,
.lab-log,
.lab-loading {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--t-space-2);
  width: 100%;
}

.lab-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--t-space-2);
  font-size: var(--t-font-size-small);
  color: var(--t-color-text);
}

.lab-split {
  width: 100%;
  height: 110px;
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-small);
  overflow: hidden;
}

.lab-pane {
  padding: var(--t-space-2);
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
}

.lab-collapse {
  width: 100%;
}

.lab-collapse__inner {
  padding: var(--t-space-2) var(--t-space-3);
  font-size: var(--t-font-size-small);
  color: var(--t-color-text-muted);
}

.lab-loading__box {
  position: relative;
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-small);
  font-size: var(--t-font-size-small);
  color: var(--t-color-text);
}

.lab-dp {
  transform: scale(0.85);
  transform-origin: top center;
  margin-bottom: -40px;
}

.lab-select,
.lab-valid {
  width: 100%;
}

.lab-filetree {
  width: 100%;
  max-height: 160px;
  overflow: auto;
}

.lab-panel {
  padding: var(--t-space-2) 0;
  font-size: var(--t-font-size-small);
  color: var(--t-color-text);
}

.lab-swap {
  align-items: center;
}

.lab-swap__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: var(--t-font-size-small);
  color: var(--t-color-text);
}

.lab-indent {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: var(--t-space-5, 20px);
}

.lab-anchor {
  position: relative;
  width: 100%;
  height: 100px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: var(--t-font-size-small);
}

/* 21. Split */
.lab-split-v1 :deep(.t-split-pane__handle) {
  transition: transform 0.2s cubic-bezier(.2, 0, 0, 1), background-color 0.2s ease;
}

.lab-split-v1 :deep(.t-split-pane__handle:hover) {
  transform: scaleX(3);
}

.lab-split-v2 :deep(.t-split-pane__handle)::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -4px;
  right: -4px;
  background: var(--t-color-accent);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.lab-split-v2 :deep(.t-split-pane__handle:hover)::after {
  opacity: 0.18;
}

.lab-split-v3 :deep(.t-split-pane__handle) {
  transition: background-color 0.15s ease 0.12s;
}

/* 22. Collapse */
.lab-collapse-v1 {
  --t-collapse-duration: 300ms;
  --t-collapse-easing: cubic-bezier(.2, 0, 0, 1);
}

.lab-collapse-v2 .lab-collapse__inner {
  animation: lab-drop-8 0.3s cubic-bezier(.2, 0, 0, 1);
}

.lab-collapse-v3 :deep(.t-button svg) {
  transition: transform 0.35s cubic-bezier(.3, 1.5, .5, 1);
}

.lab-collapse-v3 :deep(.t-button.is-open svg) {
  transform: rotate(180deg);
}

/* 23. Loading */
.lab-loading-v1 :deep(.t-loading-overlay),
.lab-loading-v3 :deep(.t-loading-overlay) {
  animation: lab-fade 0.2s ease 0.3s both;
}

.lab-loading-v2 :deep(.t-loading-overlay__box) {
  animation: lab-scale-in-08 0.25s cubic-bezier(.2, 1.4, .4, 1);
}

.lab-loading-v3 :deep(.t-loading-overlay__box) {
  animation: lab-rise-8 0.25s cubic-bezier(.2, 0, 0, 1) 0.3s both;
}

/* 24. Table loading */
.lab-tableload-v1 :deep(.t-table__state-text),
.lab-tableload-v4 :deep(.t-table__state-text) {
  animation: lab-breathe 1.2s ease-in-out infinite;
}

.lab-tableload-v2 :deep(.t-table__state-cell),
.lab-tableload-v4 :deep(.t-table__state-cell) {
  position: relative;
  overflow: hidden;
}

.lab-tableload-v2 :deep(.t-table__state-cell)::after,
.lab-tableload-v4 :deep(.t-table__state-cell)::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 30%, color-mix(in srgb, var(--t-color-text) 10%, transparent) 50%, transparent 70%);
  animation: lab-sweep 1.1s ease-in-out infinite;
}

.lab-tableload-v3 :deep(.t-table__state-text) {
  animation: lab-fade 0.2s ease 0.3s both;
}

/* 25. Sort */
.lab-sort-v1.is-fire :deep(.t-table__sort-icon.is-active) {
  animation: lab-flip-y 0.3s cubic-bezier(.2, 0, 0, 1);
}

.lab-sort-v2.is-fire :deep(tbody) {
  animation: lab-fade 0.25s ease;
}

/* 26. Row selection */
.lab-select-row-v1 :deep(.t-table__tr) {
  transition: background-color 0.15s ease;
}

.lab-select-row-v2 :deep(.t-table__tr td:first-child) {
  position: relative;
}

.lab-select-row-v2 :deep(.t-table__tr td:first-child)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 15%;
  bottom: 15%;
  width: 3px;
  border-radius: 2px;
  background: var(--t-color-accent);
  transform: scaleY(0);
  transition: transform 0.2s cubic-bezier(.2, 0, 0, 1);
}

.lab-select-row-v2 :deep(.t-table__tr.is-selected td:first-child)::before {
  transform: scaleY(1);
}

.lab-select-row-v3.is-touched :deep(.t-table__tr.is-selected .t-checkbox__box) {
  animation: lab-squish 0.4s cubic-bezier(.2, 1.6, .4, 1);
}

/* 27. Month */
.lab-month-v1.is-next :deep(.t-date-picker__days) { animation: lab-axis-x-next 0.25s cubic-bezier(.2, 0, 0, 1); }
.lab-month-v1.is-prev :deep(.t-date-picker__days) { animation: lab-axis-x-prev 0.25s cubic-bezier(.2, 0, 0, 1); }
.lab-month-v2.is-next :deep(.t-date-picker__days),
.lab-month-v2.is-prev :deep(.t-date-picker__days) { animation: lab-fade 0.25s ease; }
.lab-month-v3.is-next :deep(.t-date-picker__days) { animation: lab-axis-y-next 0.25s cubic-bezier(.2, 0, 0, 1); }
.lab-month-v3.is-prev :deep(.t-date-picker__days) { animation: lab-axis-y-prev 0.25s cubic-bezier(.2, 0, 0, 1); }

/* 28. Date view */
.lab-dpview-v1.is-fire :deep(.t-date-picker__grid),
.lab-dpview-v1.is-fire :deep(.t-date-picker__day-view) { animation: lab-zoom-in 0.25s cubic-bezier(.2, 0, 0, 1); }
.lab-dpview-v2.is-fire :deep(.t-date-picker__grid),
.lab-dpview-v2.is-fire :deep(.t-date-picker__day-view) { animation: lab-fade 0.25s ease; }
.lab-dpview-v3.is-fire :deep(.t-date-picker__grid),
.lab-dpview-v3.is-fire :deep(.t-date-picker__day-view) { animation: lab-scale-in-09 0.25s cubic-bezier(.2, 0, 0, 1); }

/* 29. Time */
.lab-time-v1.is-touched :deep(.t-time-item.is-selected) {
  animation: lab-pop 0.3s cubic-bezier(.2, 1.8, .4, 1);
}

.lab-time-v2 :deep(.t-time-item) {
  transition: background-color 0.15s ease, color 0.15s ease;
}

.lab-time-v3 :deep(.t-time-item) {
  transition: transform 0.2s cubic-bezier(.2, 0, 0, 1);
}

.lab-time-v3 :deep(.t-time-item.is-selected) {
  transform: scale(1.12);
}

/* 30. Select (list is teleported: v2/v3 live in the global block) */
.lab-select-v1.is-fire :deep(.t-input-icon--suffix svg) {
  animation: lab-flip-y 0.3s cubic-bezier(.2, 0, 0, 1);
}

/* 31. Log lines */
.lab-loglines-v1.is-touched :deep(.t-log-pane__lines > div:last-child) { animation: lab-fade 0.25s ease; }
.lab-loglines-v2.is-touched :deep(.t-log-pane__lines > div:last-child) { animation: lab-rise 0.2s cubic-bezier(.2, 0, 0, 1); }
.lab-loglines-v3.is-touched :deep(.t-log-pane__lines > div:last-child) { animation: lab-flash-bg 1s ease-out; }

/* 32. To-end button */
.lab-toend-v1 :deep(.t-log-pane__to-end) { animation: lab-rise-8 0.22s cubic-bezier(.2, 0, 0, 1); }
.lab-toend-v2 :deep(.t-log-pane__to-end) { animation: lab-pop-in 0.25s cubic-bezier(.2, 1.6, .4, 1); }
.lab-toend-v3 :deep(.t-log-pane__to-end) { animation: lab-fade 0.2s ease; }

/* 33. Scroll shadow */
.lab-scrollshadow-v1 :deep(.t-log-pane)::before,
.lab-scrollshadow-v2 :deep(.t-log-pane)::before,
.lab-scrollshadow-v3 :deep(.t-log-pane)::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.lab-scrollshadow-v1 :deep(.t-log-pane)::before {
  height: 10px;
  background: linear-gradient(color-mix(in srgb, #000 22%, transparent), transparent);
}

.lab-scrollshadow-v2 :deep(.t-log-pane)::before {
  height: 1px;
  background: var(--t-color-border-strong);
}

.lab-scrollshadow-v3 :deep(.t-log-pane)::before {
  height: 28px;
  background: linear-gradient(var(--t-color-surface-2), transparent);
}

.lab-log.is-scrolled :deep(.t-log-pane)::before {
  opacity: 1;
}

/* 34. Crumbs */
.lab-crumbs-v1.is-touched :deep(.t-path-crumbs__name) { display: inline-block; animation: lab-rise 0.25s cubic-bezier(.2, 0, 0, 1); }
.lab-crumbs-v2.is-touched :deep(.t-path-crumbs > *) { animation: lab-slide-in 0.25s cubic-bezier(.2, 0, 0, 1) both; }
.lab-crumbs-v2.is-touched :deep(.t-path-crumbs > :nth-child(2)) { animation-delay: 30ms; }
.lab-crumbs-v2.is-touched :deep(.t-path-crumbs > :nth-child(3)) { animation-delay: 60ms; }
.lab-crumbs-v2.is-touched :deep(.t-path-crumbs > :nth-child(4)) { animation-delay: 90ms; }
.lab-crumbs-v2.is-touched :deep(.t-path-crumbs > :nth-child(5)) { animation-delay: 120ms; }
.lab-crumbs-v2.is-touched :deep(.t-path-crumbs > :nth-child(n+6)) { animation-delay: 150ms; }
.lab-crumbs-v3.is-touched :deep(.t-path-crumbs) { animation: lab-fade 0.25s ease; }

/* 35. File tree */
.lab-filetree-v1.is-touched :deep(.t-file-tree__row) { animation: lab-drop 0.2s cubic-bezier(.2, 0, 0, 1); }
.lab-filetree-v2 :deep(.t-file-tree__row) { transition: background-color 0.15s ease, color 0.15s ease; }
.lab-filetree-v3.is-touched :deep(.t-file-tree__row.is-selected .t-file-tree__icon) { animation: lab-pop 0.3s cubic-bezier(.2, 1.8, .4, 1); }

/* 36. Info tip */
.lab-infotip-v1 :deep(.t-info-tip) { transition: transform 0.2s cubic-bezier(.2, 1.6, .4, 1); }
.lab-infotip-v1 :deep(.t-info-tip:hover) { transform: scale(1.2); }
.lab-infotip-v2 :deep(.t-info-tip:hover) { animation: lab-wobble 0.5s ease-in-out; }
.lab-infotip-v3 :deep(.t-info-tip) { animation: lab-attention 0.9s ease-out 0.2s; }

/* 37. Tab panels */
.lab-tabpanel-v1.is-touched .dir-next :deep(.t-tabs__panel) { animation: lab-axis-x-next 0.25s cubic-bezier(.2, 0, 0, 1); }
.lab-tabpanel-v1.is-touched .dir-prev :deep(.t-tabs__panel) { animation: lab-axis-x-prev 0.25s cubic-bezier(.2, 0, 0, 1); }
.lab-tabpanel-v2.is-touched :deep(.t-tabs__panel) { animation: lab-fade-through 0.3s cubic-bezier(.2, 0, 0, 1); }
.lab-tabpanel-v3.is-touched :deep(.t-tabs__panel) { animation: lab-fade 0.2s ease; }

/* 40. Async button */
.lab-btnload-v1 :deep(.t-button.is-loading svg) { animation: lab-spin-loop 0.8s linear infinite; }
.lab-btnload-v2 :deep(.t-button) { position: relative; overflow: hidden; isolation: isolate; }
.lab-btnload-v2 :deep(.t-button.is-loading)::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: color-mix(in srgb, #fff 25%, transparent);
  transform-origin: left;
  animation: lab-progress 1.5s cubic-bezier(.2, 0, 0, 1) forwards;
}
.lab-btnload-v3 :deep(.t-button.is-loading) { animation: lab-breathe 1s ease-in-out infinite; }

/* 41. Keyboard focus */
.lab-kbfocus-v1 :deep(.t-button) { transition: all 0.15s ease, outline-offset 0.2s cubic-bezier(.2, 0, 0, 1); }
.lab-kbfocus-v1 :deep(.t-button:focus-visible) { outline-offset: 3px; }
.lab-kbfocus-v1 :deep(.t-button:not(:focus-visible)) { outline-offset: 0; }
.lab-kbfocus-v2 :deep(.t-button:focus-visible) { animation: lab-focus-pulse 0.4s ease-out; }
.lab-kbfocus-v3 :deep(.t-button) { transition: all 0.15s ease, outline-width 0.2s ease; outline: 0 solid transparent; }
.lab-kbfocus-v3 :deep(.t-button:focus-visible) { outline: 2px solid var(--t-color-accent); }

/* 42. Enable */
.lab-enable-v1.is-touched :deep(.t-button:not(:disabled)) { animation: lab-pop 0.35s cubic-bezier(.2, 1.8, .4, 1); }
.lab-enable-v2 :deep(.t-button),
.lab-enable-v3 :deep(.t-button) { position: relative; overflow: hidden; isolation: isolate; }
.lab-enable-v2.is-touched :deep(.t-button:not(:disabled))::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.5) 50%, transparent 70%);
  transform: translateX(-120%);
  animation: lab-shine 0.7s ease-out 0.1s;
  pointer-events: none;
}
.lab-enable-v3.is-touched :deep(.t-button:not(:disabled)) { background: transparent; }
.lab-enable-v3.is-touched :deep(.t-button:not(:disabled))::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--t-color-accent);
  transform-origin: left;
  animation: lab-grow-x 0.3s cubic-bezier(.2, 0, 0, 1);
}

/* 43. Hover */
.lab-hover-v1 :deep(.t-button) { position: relative; }
.lab-hover-v1 :deep(.t-button)::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: currentColor;
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
}
.lab-hover-v1 :deep(.t-button:hover)::after { opacity: 0.08; }
.lab-hover-v2 :deep(.t-button) { transition: all 0.15s ease, transform 0.2s cubic-bezier(.2, 0, 0, 1); }
.lab-hover-v2 :deep(.t-button:hover) { transform: translateY(-1px); }
.lab-hover-v3 :deep(.t-button svg) { transition: transform 0.2s cubic-bezier(.2, 0, 0, 1); }
.lab-hover-v3 :deep(.t-button:hover svg) { transform: translateX(3px); }

/* 46. Valid */
.lab-valid :deep(.t-input-icon--suffix) { color: var(--t-color-success); }
.lab-valid-v1 :deep(.t-input-icon--suffix) { animation: lab-pop-in 0.3s cubic-bezier(.2, 1.6, .4, 1); }
.lab-valid-v2 :deep(.t-input-wrapper:has(.t-input-icon--suffix)) { animation: lab-ring-success 0.6s ease-out; }
.lab-valid-v3 :deep(.t-input-icon--suffix) { animation: lab-draw 0.3s ease-out; }

/* 47. Tag status */
.lab-tagstatus-v1.is-fire :deep(.t-tag) { animation: lab-pop 0.35s cubic-bezier(.2, 1.8, .4, 1); }
.lab-tagstatus-v2.is-fire :deep(.t-tag) { animation: lab-flip-x 0.35s cubic-bezier(.2, 0, 0, 1); }
.lab-tagstatus-v3.is-fire :deep(.t-tag) { animation: lab-ring-accent 0.6s ease-out; }

/* 49. Indeterminate */
.lab-indet-v1.is-touched :deep(.t-checkbox.is-indeterminate .t-checkbox__box)::after { animation: lab-grow-x 0.25s cubic-bezier(.2, 0, 0, 1); }
.lab-indet-v2.is-touched :deep(.t-checkbox.is-indeterminate .t-checkbox__box)::after { animation: lab-dash-in 0.3s cubic-bezier(.2, 1.4, .4, 1); }
.lab-indet-v2.is-touched :deep(.t-checkbox.is-checked .t-checkbox__box)::after { animation: lab-check-turn 0.3s cubic-bezier(.2, 1.4, .4, 1); }
.lab-indet-v3.is-touched :deep(.t-checkbox.is-indeterminate .t-checkbox__box)::after { animation: lab-dash-slide 0.22s cubic-bezier(.2, 0, 0, 1); }

/* 50. Anchor */
.lab-anchor-v1 :deep(.t-card.lab-hit) { animation: lab-flash-bg 1.1s ease-out; }
.lab-anchor-v2 :deep(.t-card.lab-hit) { animation: lab-ring-accent 0.8s ease-out; }
.lab-anchor-v3 :deep(.t-card.lab-hit) { animation: lab-pop 0.35s cubic-bezier(.2, 1.8, .4, 1); }
</style>

<!-- Global: keyframes, injected nodes, transition classes and teleported components. -->
<style>
/* 1. Button */
.lab-clip { position: relative; overflow: hidden; }
.lab-sunk { transform: scale(0.95); transition: transform 0.08s cubic-bezier(.3, 0, .2, 1) !important; }
.lab-spring { animation: lab-spring 0.38s linear; }
.lab-ripple {
  position: absolute; border-radius: 50%; background: currentColor; opacity: 0.3;
  transform: scale(0); pointer-events: none; animation: lab-ripple 0.45s ease-out forwards;
}
@keyframes lab-spring {
  0% { transform: scale(0.95); animation-timing-function: cubic-bezier(.3, 0, .4, 1); }
  40% { transform: scale(1.025); animation-timing-function: cubic-bezier(.5, 0, .5, 1); }
  70% { transform: scale(0.994); animation-timing-function: cubic-bezier(.5, 0, .5, 1); }
  88% { transform: scale(1.003); }
  100% { transform: scale(1); }
}
@keyframes lab-ripple { to { transform: scale(1); opacity: 0; } }

/* 2. Dropdown */
body[data-labdropdown='v1'] .t-dropdown-panel { transform-origin: top left; animation: lab-scale-in 0.16s cubic-bezier(.2, 0, 0, 1); }
body[data-labdropdown='v2'] .t-dropdown-panel { animation: lab-drop 0.18s cubic-bezier(.2, 0, 0, 1); }
body[data-labdropdown='v3'] .t-dropdown-panel { animation: lab-reveal 0.22s cubic-bezier(.2, 0, 0, 1); }

/* 3. Tooltip */
body[data-labtooltip='v1'] .t-tooltip__popup { animation: lab-fade 0.12s ease; }
body[data-labtooltip='v2'] .t-tooltip__popup { animation: lab-rise 0.16s cubic-bezier(.2, 0, 0, 1); }
body[data-labtooltip='v3'] .t-tooltip__popup { animation: lab-pop-in 0.2s cubic-bezier(.2, 1.6, .4, 1); }

/* 4. Dialog */
/* `scale` / `translate` compose with the box's inline translate3d (a `transform` keyframe would replace it). */
body[data-labdialog='now'] .modal-box,
body[data-labdialog='now'] .modal-backdrop { animation: none; }
body[data-labdialog^='v'] .modal-backdrop { animation: lab-fade 0.2s ease; }
body[data-labdialog='v1'] .modal-box { animation: lab-dlg-scale96 0.2s cubic-bezier(.2, 0, 0, 1); }
body[data-labdialog='v2'] .modal-box { animation: lab-dlg-rise 0.24s cubic-bezier(.2, 0, 0, 1); }
body[data-labdialog='v3'] .modal-box { animation: lab-dlg-spring 0.4s cubic-bezier(.3, 1.4, .5, 1); }
body[data-labdialog='v4'] .modal-box { animation: lab-dlg-drop 0.26s cubic-bezier(.2, 0, 0, 1); }
body[data-labdialog='v5'] .modal-box,
body[data-labdialog='v8'] .modal-box { animation: lab-dlg-zoom 0.28s cubic-bezier(.2, 0, 0, 1), lab-fade 0.15s ease; }
body[data-labdialog='v6'] .modal-box { animation: lab-dlg-zoom-spring 0.4s cubic-bezier(.3, 1.4, .5, 1), lab-fade 0.15s ease; }
body[data-labdialog='v7'] .modal-box { animation: lab-dlg-unfold 0.36s cubic-bezier(.2, 0, 0, 1), lab-fade 0.15s ease; }
@keyframes lab-dlg-scale96 { from { opacity: 0; scale: 0.96; } }
@keyframes lab-dlg-rise { from { opacity: 0; translate: 0 16px; } }
@keyframes lab-dlg-spring { from { opacity: 0; scale: 0.9; } 60% { opacity: 1; scale: 1.02; } }
@keyframes lab-dlg-drop { from { opacity: 0; translate: 0 -24px; } }
@keyframes lab-dlg-zoom { from { scale: 0.2; } }
@keyframes lab-dlg-zoom-spring { from { scale: 0.5; } }
@keyframes lab-dlg-unfold { from { scale: 0.2 0.05; } 50% { scale: 1 0.05; } }

/* 5. Notifications */
body[data-labnotify='v1'] .t-notification-enter-active,
body[data-labnotify='v1'] .t-notification-leave-active { transition: transform 0.3s cubic-bezier(.2, 0, 0, 1), opacity 0.3s ease; }
body[data-labnotify='v1'] .t-notification-enter-from,
body[data-labnotify='v1'] .t-notification-leave-to { transform: translateX(110%); opacity: 0; }
body[data-labnotify='v2'] .t-notification-enter-active { transition: transform 0.4s cubic-bezier(.2, 1.6, .4, 1), opacity 0.2s ease; }
body[data-labnotify='v2'] .t-notification-leave-active { transition: transform 0.18s ease-in, opacity 0.18s ease-in; }
body[data-labnotify='v2'] .t-notification-enter-from,
body[data-labnotify='v2'] .t-notification-leave-to { transform: scale(0.9); opacity: 0; }
body[data-labnotify='v3'] .t-notification-enter-active { transition: transform 0.28s cubic-bezier(.2, 0, 0, 1), opacity 0.28s ease; }
body[data-labnotify='v3'] .t-notification-leave-active { transition: opacity 0.2s ease; }
body[data-labnotify='v3'] .t-notification-enter-from { transform: translateY(-12px); opacity: 0; }
body[data-labnotify='v3'] .t-notification-leave-to { transform: none; opacity: 0; }

/* 17. Tags (TransitionGroup classes) */
.lab-tag-v1-move, .lab-tag-v2-move, .lab-tag-v3-move { transition: transform 0.25s cubic-bezier(.2, 0, 0, 1); }
.lab-tag-v1-leave-active, .lab-tag-v2-leave-active, .lab-tag-v3-leave-active { position: absolute; }
.lab-tag-v1-enter-active { transition: transform 0.3s cubic-bezier(.2, 1.6, .4, 1), opacity 0.2s ease; }
.lab-tag-v1-leave-active { transition: transform 0.18s ease-in, opacity 0.18s ease-in; }
.lab-tag-v1-enter-from, .lab-tag-v1-leave-to { transform: scale(0.6); opacity: 0; }
.lab-tag-v2-enter-active, .lab-tag-v2-leave-active { transition: transform 0.22s cubic-bezier(.2, 0, 0, 1), opacity 0.22s ease; }
.lab-tag-v2-enter-from { transform: translateY(-8px); opacity: 0; }
.lab-tag-v2-leave-to { transform: translateY(8px); opacity: 0; }
.lab-tag-v3-enter-active, .lab-tag-v3-leave-active { transition: opacity 0.2s ease; }
.lab-tag-v3-enter-from, .lab-tag-v3-leave-to { opacity: 0; }

/* shared keyframes */
@keyframes lab-fade { from { opacity: 0; } }
@keyframes lab-scale-in { from { opacity: 0; transform: scale(0.95); } }
@keyframes lab-pop-in { from { opacity: 0; transform: scale(0.5); } }
@keyframes lab-drop { from { opacity: 0; transform: translateY(-6px); } }
@keyframes lab-rise { from { opacity: 0; transform: translateY(4px); } }
@keyframes lab-rise-lg { from { opacity: 0; transform: translateY(16px); } }
@keyframes lab-from-left { from { opacity: 0; transform: translateX(-10px); } }
@keyframes lab-slide-in { from { opacity: 0; transform: translateX(6px); } }
@keyframes lab-spin-in { from { opacity: 0; transform: rotate(-90deg) scale(0.6); } }
@keyframes lab-reveal { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes lab-grow-x { from { transform: scaleX(0); } }
@keyframes lab-pop { 40% { transform: scale(1.12); } }
@keyframes lab-spring-in {
  0% { opacity: 0; transform: scale(0.9); animation-timing-function: cubic-bezier(.3, 0, .4, 1); }
  45% { opacity: 1; transform: scale(1.02); animation-timing-function: cubic-bezier(.5, 0, .5, 1); }
  75% { transform: scale(0.995); }
  100% { transform: scale(1); }
}
@keyframes lab-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(2px); }
}
@keyframes lab-check-pop {
  from { transform: rotate(-45deg) translateY(-15%) scale(0); }
  60% { transform: rotate(-45deg) translateY(-15%) scale(1.25); }
  to { transform: rotate(-45deg) translateY(-15%) scale(1); }
}
@keyframes lab-check-draw { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes lab-squish { 30% { transform: scale(0.8); } 65% { transform: scale(1.08); } }
@keyframes lab-squish-b { 30% { transform: scale(0.8); } 65% { transform: scale(1.08); } }
@keyframes lab-sw-on {
  from { transform: translate(0, -50%); }
  50% { transform: translate(calc(var(--t-switch-translate) / 2), -50%) scale(1.2); }
  to { transform: translate(var(--t-switch-translate), -50%); }
}
@keyframes lab-sw-off {
  from { transform: translate(var(--t-switch-translate), -50%); }
  50% { transform: translate(calc(var(--t-switch-translate) / 2), -50%) scale(1.2); }
  to { transform: translate(0, -50%); }
}
@keyframes lab-ring-land {
  from { box-shadow: 0 0 0 8px color-mix(in srgb, var(--t-color-accent) 0%, transparent); }
  to { box-shadow: 0 0 0 3px var(--t-color-focus-ring); }
}
@keyframes lab-ring-danger {
  from { box-shadow: 0 0 0 0 color-mix(in srgb, var(--t-color-danger) 45%, transparent); }
  to { box-shadow: 0 0 0 10px color-mix(in srgb, var(--t-color-danger) 0%, transparent); }
}
@keyframes lab-flash-bg {
  from { background-color: color-mix(in srgb, var(--t-color-accent) 28%, transparent); }
}
@keyframes lab-flash-bar {
  from { box-shadow: inset 3px 0 0 var(--t-color-accent); }
  to { box-shadow: inset 3px 0 0 transparent; }
}
@keyframes lab-badge-pop {
  from { transform: translate(50%, -50%) scale(0.6); }
  60% { transform: translate(50%, -50%) scale(1.2); }
  to { transform: translate(50%, -50%) scale(1); }
}
@keyframes lab-badge-roll {
  from { opacity: 0; transform: translate(50%, 0%); }
  to { opacity: 1; transform: translate(50%, -50%); }
}
@keyframes lab-ping { from { transform: scale(1); opacity: 0.7; } to { transform: scale(2.6); opacity: 0; } }
@keyframes lab-breathe { 50% { opacity: 0.35; } }
@keyframes lab-dot-bounce {
  from { transform: translate(50%, -50%) scale(0); }
  60% { transform: translate(50%, -90%) scale(1.2); }
  to { transform: translate(50%, -50%) scale(1); }
}
@keyframes lab-bubble {
  0% { opacity: 0; transform: translate(-50%, 4px); }
  20% { opacity: 1; transform: translate(-50%, 0); }
  75% { opacity: 1; transform: translate(-50%, -4px); }
  100% { opacity: 0; transform: translate(-50%, -8px); }
}
@keyframes lab-wobble {
  20% { transform: rotate(-8deg); }
  45% { transform: rotate(6deg); }
  70% { transform: rotate(-3deg); }
}

/* ================= ideas 21–50 (global) ================= */

/* 30. Select list (teleported) */
body[data-labselect='v2'] .t-select__item { transition: background-color 0.12s ease, color 0.12s ease; }
body[data-labselect='v3'] .t-select__item--selected { animation: lab-flash-bg 0.9s ease-out; }

/* 38. Notification timer (timeout 4 s) */
body[data-labnotifytimer='v1'] .t-notification,
body[data-labnotifytimer='v2'] .t-notification,
body[data-labnotifytimer='v3'] .t-notification { position: relative; overflow: hidden; }
body[data-labnotifytimer='v1'] .t-notification::after,
body[data-labnotifytimer='v2'] .t-notification::after,
body[data-labnotifytimer='v3'] .t-notification::after {
  content: '';
  position: absolute;
  pointer-events: none;
  animation: lab-timer-x 4s linear forwards;
}
body[data-labnotifytimer='v1'] .t-notification::after { left: 0; right: 0; bottom: 0; height: 2px; background: currentColor; opacity: 0.5; transform-origin: left; }
body[data-labnotifytimer='v2'] .t-notification::after { left: 0; right: 0; top: 0; height: 2px; background: var(--t-color-accent); transform-origin: left; }
body[data-labnotifytimer='v3'] .t-notification::after { left: 0; top: 0; bottom: 0; width: 3px; background: currentColor; opacity: 0.6; transform-origin: bottom; animation-name: lab-timer-y; }

/* 39. Menu stagger (teleported) */
body[data-labmenu='v1'] .lab-menu--stagger > div { animation: lab-fade 0.18s ease both; }
body[data-labmenu='v2'] .lab-menu--stagger > div { animation: lab-drop-4 0.18s cubic-bezier(.2, 0, 0, 1) both; }
body[data-labmenu='v3'] .lab-menu--stagger > div { animation: lab-from-left 0.18s cubic-bezier(.2, 0, 0, 1) both; }
body[data-labmenu] .lab-menu--stagger > div:nth-child(2) { animation-delay: 20ms; }
body[data-labmenu] .lab-menu--stagger > div:nth-child(3) { animation-delay: 40ms; }
body[data-labmenu] .lab-menu--stagger > div:nth-child(4) { animation-delay: 60ms; }
body[data-labmenu] .lab-menu--stagger > div:nth-child(5) { animation-delay: 80ms; }

/* 44. Theme */
html.lab-theme-fade *,
html.lab-theme-fade *::before,
html.lab-theme-fade *::after {
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease, fill 0.25s ease !important;
}
html[data-labvt='v2']::view-transition-old(root),
html[data-labvt='v2']::view-transition-new(root) { animation-duration: 0.3s; }
html[data-labvt='v3']::view-transition-old(root) { animation: none; }
html[data-labvt='v3']::view-transition-new(root) {
  animation: lab-vt-circle 0.5s cubic-bezier(.2, 0, 0, 1);
}
@keyframes lab-vt-circle {
  from { clip-path: circle(0 at var(--lab-vt-x) var(--lab-vt-y)); }
  to { clip-path: circle(var(--lab-vt-r) at var(--lab-vt-x) var(--lab-vt-y)); }
}

/* 45. Empty → data */
.lab-swap-v1-enter-active { transition: opacity 0.2s ease 0.05s, transform 0.25s cubic-bezier(.2, 0, 0, 1) 0.05s; }
.lab-swap-v1-leave-active { transition: opacity 0.1s ease; }
.lab-swap-v1-enter-from { opacity: 0; transform: scale(0.92); }
.lab-swap-v1-leave-to { opacity: 0; }
.lab-swap-v2-enter-active, .lab-swap-v2-leave-active { transition: opacity 0.18s ease, transform 0.18s cubic-bezier(.2, 0, 0, 1); }
.lab-swap-v2-enter-from { opacity: 0; transform: translateY(12px); }
.lab-swap-v2-leave-to { opacity: 0; transform: translateY(-12px); }
.lab-swap-v3-enter-active, .lab-swap-v3-leave-active { transition: opacity 0.15s ease; }
.lab-swap-v3-enter-from, .lab-swap-v3-leave-to { opacity: 0; }

/* 48. Tooltip delay (teleported) */
body[data-labtipdelay='v1'] .t-tooltip__popup { animation: lab-fade 0.12s ease 0.4s both; }
body[data-labtipdelay='v2'] .t-tooltip__popup { animation: lab-fade 0.12s ease 0.4s both; }
body[data-labtipdelay='v2'][data-labtipwarm] .t-tooltip__popup { animation-delay: 0s; }
body[data-labtipdelay='v3'] .t-tooltip__popup { animation: lab-fade 0.12s ease 0.8s both; }

/* keyframes for ideas 21–50 */
@keyframes lab-drop-4 { from { opacity: 0; transform: translateY(-4px); } }
@keyframes lab-drop-8 { from { opacity: 0; transform: translateY(-8px); } }
@keyframes lab-rise-8 { from { opacity: 0; transform: translateY(8px); } }
@keyframes lab-scale-in-08 { from { opacity: 0; transform: scale(0.8); } }
@keyframes lab-scale-in-09 { from { opacity: 0; transform: scale(0.9); } }
@keyframes lab-zoom-in { from { opacity: 0; transform: scale(1.1); } }
@keyframes lab-fade-through { from { opacity: 0; transform: scale(0.98); } }
@keyframes lab-axis-x-next { from { opacity: 0; transform: translateX(24px); } }
@keyframes lab-axis-x-prev { from { opacity: 0; transform: translateX(-24px); } }
@keyframes lab-axis-y-next { from { opacity: 0; transform: translateY(16px); } }
@keyframes lab-axis-y-prev { from { opacity: 0; transform: translateY(-16px); } }
@keyframes lab-flip-y { from { transform: rotate(-180deg); } }
@keyframes lab-flip-x { from { transform: rotateX(90deg); } }
@keyframes lab-sweep { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
@keyframes lab-shine { to { transform: translateX(120%); } }
@keyframes lab-spin-loop { to { transform: rotate(360deg); } }
@keyframes lab-progress { from { transform: scaleX(0); } to { transform: scaleX(0.95); } }
@keyframes lab-timer-x { from { transform: scaleX(1); } to { transform: scaleX(0); } }
@keyframes lab-timer-y { from { transform: scaleY(1); } to { transform: scaleY(0); } }
@keyframes lab-draw { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes lab-attention {
  0% { transform: scale(1); }
  30% { transform: scale(1.3); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
@keyframes lab-focus-pulse {
  from { outline-offset: 6px; outline-color: transparent; }
  to { outline-offset: 2px; }
}
@keyframes lab-ring-success {
  from { box-shadow: 0 0 0 0 color-mix(in srgb, var(--t-color-success) 45%, transparent); }
  to { box-shadow: 0 0 0 10px color-mix(in srgb, var(--t-color-success) 0%, transparent); }
}
@keyframes lab-ring-accent {
  from { box-shadow: 0 0 0 0 color-mix(in srgb, var(--t-color-accent) 45%, transparent); }
  to { box-shadow: 0 0 0 8px color-mix(in srgb, var(--t-color-accent) 0%, transparent); }
}
@keyframes lab-dash-in { from { transform: rotate(-45deg) scaleX(0.4); opacity: 0; } }
@keyframes lab-dash-slide { from { transform: translateX(-6px); opacity: 0; } }
@keyframes lab-check-turn {
  from { transform: rotate(0deg) translateY(-15%); }
  to { transform: rotate(-45deg) translateY(-15%); }
}

@media (prefers-reduced-motion: reduce) {
  .lab *, .lab *::before, .lab *::after, .modal-box, .t-dropdown-panel, .t-tooltip__popup {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
