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

- [ ] `src/components/TTable.vue` (новий).
- [ ] Props: `columns`, `rows`, `rowKey` (required), `loading?`, `selectable?`, `sort?` (v-model), `selection?` (v-model як `Array<PrimaryKey>`), `size?`.
- [ ] Emits: `update:sort`, `update:selection`, `row-click: [row, index]`.
- [ ] Слоти:
  - `cell-{columnKey}` — override рендера клітинки (scoped: `{ row, value, index }`).
  - `header-{columnKey}` — override header'а.
  - `empty` — state коли `rows.length === 0 && !loading`.
  - `loading` — state коли `loading=true`.
- [ ] Сортування:
  - Клік по `sortable` заголовку → toggle `asc → desc → null → asc`.
  - Стрілка-індикатор у header.
  - Власне сортування **не виконує** — лише emit'ить event; rows filter/sort лежить на споживачі (це серверна таблиця найчастіше). **Додати** `clientSideSort?: boolean` проп — якщо `true`, сортує локально.
- [ ] Selection:
  - Checkbox у першій колонці (якщо `selectable`).
  - Master checkbox у header — toggle all, з `indeterminate`-станом.
  - `v-model:selection` — масив `rowKey`-значень (не цілих об'єктів — щоб не розпухати).
- [ ] A11y:
  - `<table>` з нативною структурою (не `<div>` grid).
  - `role="columnheader"`, `aria-sort` на сортованих колонках.
  - Стисла клавіатурна навігація (Tab по рядах) — **v2**; зараз лише hover/click.
- [ ] Стилі через токени (`--t-color-border`, `--t-color-surface-2`, `--t-space-*`). Використати `var(--t-control-h-*)` для row height.
- [ ] Responsive: horizontal scroll при вузькому viewport (не adaptive stacking — це v2).
- [ ] Зареєстровано в [src/components/registry.ts](../src/components/registry.ts), [src/globalComponents.ts](../src/globalComponents.ts), реекспорт з [src/index.ts](../src/index.ts) з expected type-exports (`TTableColumn`, `TTableSort`).
- [ ] У playground — `playground/src/examples/table/` з мінімум 4 прикладами:
  - Basic (static rows, no sorting).
  - Sortable (клієнтське сортування).
  - Selectable (master-checkbox).
  - Loading + Empty states.
  - (Бонус) Custom cell через slot з `TTag`.
- [ ] Реєстрація в [playground/src/examples/index.ts](../playground/src/examples/index.ts).
- [ ] Тести:
  - Render з 3 рядками → 3 `<tr>` у body.
  - Клік по sortable header → `update:sort` emit з правильними `key`/`direction`.
  - Select all → `update:selection` з усіма rowKey.
  - Empty state → slot/default тексту.
- [ ] `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build:nocheck` проходять.

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
