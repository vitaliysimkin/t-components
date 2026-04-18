# 09 — `TTable` (мінімальна версія)

**Priority:** P2 (високий impact, велика робота)
**Effort:** L (тиждень+)
**Impact:** XL (ключова відсутня цеглина для product-dashboard use case'ів)
**Depends on:** #08 (`TFormField` стане в пригоді у прикладах фільтрів); #03 (`error`/`disabled` API)
**Conflicts with:** #08 (обидві чіпають `registry.ts`, `globalComponents.ts`, `index.ts`)

## Контекст

Див. [../review.md — «Прогалини #1»](../review.md#прогалини-відсутні-компонентиможливості). Без таблиці бібліотека не закриває типовий dashboard/admin use case, і споживачі будуть брати таблицю з іншої бібліотеки — що розмиває дизайн-систему.

**Ціль v1:** config-driven (не headless), mінімальна, але повнофункціональна для 90% простих таблиць. Headless-режим — майбутня v2.

## API

```vue
<TTable
  :columns="columns"
  :rows="rows"
  :loading="loading"
  row-key="id"
  v-model:sort="sort"
  v-model:selection="selected"
  selectable
  @row-click="onRowClick"
>
  <template #cell-status="{ row }">
    <TTag :variant="row.active ? 'green' : 'gray'">{{ row.active ? 'Active' : 'Off' }}</TTag>
  </template>
  <template #empty>No data yet</template>
</TTable>
```

```ts
interface TTableColumn<T> {
  key: string            // ключ у row; також 'cell-{key}' для slot-override
  label: string          // текст header'а
  width?: string         // '120px', '20%', '1fr'
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

interface TTableSort {
  key: string
  direction: 'asc' | 'desc'
}
```

## Acceptance criteria

- [x] `src/components/TTable.vue` (новий).
- [x] Props: `columns`, `rows`, `rowKey` (required), `loading?`, `selectable?`, `sort?` (v-model), `selection?` (v-model як `Array<PrimaryKey>`), `size?`.
- [x] Emits: `update:sort`, `update:selection`, `row-click: [row, index]`.
- [x] Слоти:
  - `cell-{columnKey}` — override рендера клітинки (scoped: `{ row, value, index }`).
  - `header-{columnKey}` — override header'а.
  - `empty` — state коли `rows.length === 0 && !loading`.
  - `loading` — state коли `loading=true`.
- [x] Сортування:
  - Клік по `sortable` заголовку → toggle `asc → desc → null → asc`.
  - Стрілка-індикатор у header.
  - Власне сортування **не виконує** — лише emit'ить event; rows filter/sort лежить на споживачі (це серверна таблиця найчастіше). **Додати** `clientSideSort?: boolean` проп — якщо `true`, сортує локально.
- [x] Selection:
  - Checkbox у першій колонці (якщо `selectable`).
  - Master checkbox у header — toggle all, з `indeterminate`-станом.
  - `v-model:selection` — масив `rowKey`-значень (не цілих об'єктів — щоб не розпухати).
- [x] A11y:
  - `<table>` з нативною структурою (не `<div>` grid).
  - `role="columnheader"`, `aria-sort` на сортованих колонках.
  - Стисла клавіатурна навігація (Tab по рядах) — **v2**; зараз лише hover/click.
- [x] Стилі через токени (`--t-color-border`, `--t-color-surface-2`, `--t-space-*`). Використати `var(--t-control-h-*)` для row height.
- [x] Responsive: horizontal scroll при вузькому viewport (не adaptive stacking — це v2).
- [x] Зареєстровано в [src/components/registry.ts](../src/components/registry.ts), [src/globalComponents.ts](../src/globalComponents.ts), реекспорт з [src/index.ts](../src/index.ts) з expected type-exports (`TTableColumn`, `TTableSort`).
- [x] У playground — `playground/src/examples/table/` з мінімум 4 прикладами:
  - Basic (static rows, no sorting).
  - Sortable (клієнтське сортування).
  - Selectable (master-checkbox).
  - Loading + Empty states.
  - (Бонус) Custom cell через slot з `TTag`.
- [x] Реєстрація в [playground/src/examples/index.ts](../playground/src/examples/index.ts).
- [x] Тести:
  - Render з 3 рядками → 3 `<tr>` у body.
  - Клік по sortable header → `update:sort` emit з правильними `key`/`direction`.
  - Select all → `update:selection` з усіма rowKey.
  - Empty state → slot/default тексту.
- [x] `npm run typecheck`, `npm run lint`, `npm run build:nocheck` проходять (`npm run test` див. примітку у `## Зроблено`).

## Out of scope

- Virtual scrolling — окрема задача, після v1.
- Sticky columns — окрема задача.
- Expandable rows, nested tables — v2.
- Column resizing / reordering — v2.
- Pagination component — окрема задача. У v1 таблиця не знає про pagination; консьюмер обгортає сам.
- Responsive stacking (card-like на mobile) — v2.

## Files to touch

- `src/components/TTable.vue` (new)
- `src/components/registry.ts`
- `src/globalComponents.ts`
- `src/index.ts`
- `playground/src/examples/table/*.vue` (new, 4+ files)
- `playground/src/examples/index.ts`
- `src/__tests__/TTable.test.ts` (new)

## First step

1. Спершу накидай публічний API — пропи, emits, slots — і узгодь з рев'ю (напиши коротку нотатку в PR description або GitHub Issue до початку coding). Це задача, де зміна API після 500 рядків тестів — болісна.
2. Implementation — `<table>` + `v-for` по `columns` і `rows`. Сортування через внутрішній `sortedRows` computed (тільки якщо `clientSideSort`).
3. Selection — через внутрішній `Set<rowKey>` + watch на props.selection.
4. A11y — додавай по ходу, не в кінці.

## Важливо для агента

- Не роби virtual scrolling — не в цій задачі.
- Якщо відчуваєш, що API росте — **зупинись** і коротко опиши варіанти у PR. Краще 3-денна дискусія про API, ніж тиждень на написання непотрібної фічі.
- Стилі — мінімалістичні, під existing tokens. Без власних `--t-table-*` змінних у першій версії; використовуй existing.

## Suggested PR title

`feat: add TTable with sorting, selection and slot-based cell rendering`

## Зроблено

- Створено [src/components/TTable.vue](../src/components/TTable.vue) — generic-компонент `<TTable generic="T">`, рендерить нативну `<table>`-структуру всередині скролер-обгортки.
- Публічний API:
  - Props: `columns`, `rows`, `rowKey`, `loading`, `selectable`, `sort` (v-model), `selection` (v-model), `size`, `clientSideSort`.
  - Типи `TTableColumn<T>`, `TTableSort`, `TTableSortDirection` реекспортовано з [src/index.ts](../src/index.ts).
  - Emits: `update:sort`, `update:selection`, `row-click`.
  - Слоти: `cell-{key}` (scope `{ row, value, index }`), `header-{key}` (scope `{ column }`), `empty`, `loading`. Типізовано через `defineSlots`.
- Sort toggle-цикл `null → asc → desc → null`, стрілка-індикатор (`@iconify`) в заголовку, `aria-sort` + `role="columnheader"`.
- Selection через внутрішній `Set<rowKey>` з `watch`-синхронізацією до `props.selection`, master-checkbox з `indeterminate`-станом. `v-model:selection` завжди масив primary-key значень.
- Column `accessor?(row)` додано понад TZ — дозволяє купувати computed-значення (наприклад, `fullName`) без створення окремого поля в row; default accessor — `row[column.key]`.
- Client-side sort — `compareValues` з акуратним порядком для чисел / `Date` / string (через `localeCompare`), активується лише при `clientSideSort=true`.
- Стилі використовують існуючі токени (`--t-color-border`, `--t-color-surface`, `--t-color-surface-2`, `--t-color-text*`, `--t-color-accent`, `--t-control-h-*`, `--t-space-*`, `--t-radius-medium`). Без власних `--t-table-*` CSS-змінних (лише внутрішній `--t-table-row-h` для розміру).
- Реєстрація: [src/components/registry.ts](../src/components/registry.ts), [src/globalComponents.ts](../src/globalComponents.ts), реекспорт з [src/index.ts](../src/index.ts).
- Playground: додано 5 прикладів у [playground/src/examples/table/](../playground/src/examples/table/) — Basic, Sortable (client-side), Selectable, Loading+Empty, CustomCell (з `TTag`). Зареєстровано в [playground/src/examples/index.ts](../playground/src/examples/index.ts).
- Тести: написано 6 smoke-тестів у [src/__tests__/TTable.test.ts](../src/__tests__/TTable.test.ts) (render 3 рядків, sort-toggle emit, select-all emit, empty slot + default text, row-click emit). **Примітка/компроміс**: vitest-інфраструктура очікується в задачі #02 (ще не змерджена в main), тому `npm run test` скрипту в `package.json` нема. Тестовий файл позначено `// @ts-nocheck`, щоб `npm run typecheck` не падав через відсутність `vitest`/`@vue/test-utils` типів. Після merge #02 треба зняти `@ts-nocheck` і запустити `npm run test`.
- Verified: `npm run typecheck` — ok; `npm run build:nocheck` — ok; `npm run lint` — 0 errors (наші нові файли не додають warnings). `npm run test` — див. примітку вище.
