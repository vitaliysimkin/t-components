# 05 — Generics для `TDatePicker` + `TSelect` (+ falsy-bug fix)

**Priority:** P1
**Effort:** S-M (кілька годин)
**Impact:** M (DX для 2 найчастіших компонентів)
**Depends on:** #03 (бо чіпає `TSelect.vue` — уникнути merge-конфлікту)
**Conflicts with:** #03

## Контекст

Див. [../review.md — «Слабкі сторони #6-7»](../review.md#6-p1-isselected-у-tselect-ламається-на-falsy-значеннях).

1. **`TDatePicker` типізовано як `any`** на [TDatePicker.vue:125](../src/components/TDatePicker.vue#L125) і [:132](../src/components/TDatePicker.vue#L132) — попри наявність `TDatePickerRangeValue` (line 113). Споживач не отримує підказок.
2. **`TSelect.isSelected` + `displayLabel` ламаються на falsy-значеннях**:
   - [TSelect.vue:154-160](../src/components/TSelect.vue#L154-L160) — `if (!props.modelValue) return false` блокує `0`, `''`, `false`.
   - [TSelect.vue:104-108](../src/components/TSelect.vue#L104-L108) — `props.modelValue ? getLabel(props.modelValue) : ''`.
3. **Cast `as TOption` на [TSelect.vue:159](../src/components/TSelect.vue#L159)** — коли `valueMode: 'value'`, `modelValue` є `string | number`, а не `TOption`, і cast брехливий.

## Acceptance criteria

### TDatePicker
- [ ] `TDatePickerProps.modelValue` типізовано як `Date | TDatePickerRangeValue | null` (без generics, прийнятно через union).
  - Якщо в процесі зрозумієш, що `<script setup generic="Mode extends TDatePickerMode">` чисто працює з GlobalComponents (див. коментар у [registry.ts:48-51](../src/components/registry.ts#L48-L51)) — зроби generic. Якщо generic конфліктує з Volar augmentation, лишай union.
- [ ] `TDatePickerEmits.update:modelValue` — те саме: `Date | TDatePickerRangeValue | null`.
- [ ] Внутрішня логіка (`isDateSelected`, `isMonthSelected`, `isYearSelected`, `onDayClick`) — type-narrowing через `props.mode === 'range'` замість `any`.

### TSelect
- [ ] Замінити `!props.modelValue` → `props.modelValue == null` у `isSelected` ([:155](../src/components/TSelect.vue#L155)) і `displayLabel` ([:107](../src/components/TSelect.vue#L107)).
- [ ] Generic на `<script setup generic="T extends TOption">`:
  - `options?: T[]`
  - `modelValue?: T | null` (якщо `valueMode: 'option'`)
  - У `valueMode: 'value'` — emit value-type (primitive from object via `valueKey`). Це не представимо в одному generic без overloads → лиши `valueMode: 'value'` з `modelValue: string | number | null`, задокументуй обмеження.
- [ ] Прибрати `as TOption` cast на [:159](../src/components/TSelect.vue#L159) — замінити на явну перевірку типу.
- [ ] `TSelectProps` експортовано з [src/index.ts](../src/index.ts) (зараз немає серед `export type`).
- [ ] Якщо тест з #02 на falsy-bug стоїть як `test.fails` — зняти `.fails`, тест має бути зеленим.
- [ ] `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build:nocheck` проходять.

## Out of scope

- Multi-select — окрема, велика задача.
- Глибоке переписування filterFn/loadOptions API — не тепер.
- Розбиття `TSelect` на headless core + skin — довгострокова refactoring-мета.

## Files to touch

- `src/components/TDatePicker.vue`
- `src/components/TSelect.vue`
- `src/index.ts` (додати `TSelectProps` в `export type`)
- `src/__tests__/TSelect.test.ts` (зняти skip/fails після фікса)

## First step

1. Прочитай коментар у [registry.ts:48-51](../src/components/registry.ts#L48-L51) — він пояснює, чому registry стирає типи. Перевір, що generics в `TSelect` не тригерять цикл.
2. Локально спробуй `<script setup generic="T">` у `TSelect.vue` — запусти `npm run typecheck`. Якщо падає з циклом на GlobalComponents — відступи до union-типу без generic.
3. TDatePicker простіше — починай з нього, щоб прогріти процес.

## Важливо для агента

- Коментар у `registry.ts` зберегти. Не переписуй цей файл без потреби.
- Fallback-стратегія для generic: якщо GlobalComponents + generic конфліктують, зроби `modelValue: TOption | null` без generic — це все одно краще, ніж нинішнє `string | number | Record<string, any> | null`.

## Suggested PR title

`fix(types): add proper types to TDatePicker/TSelect and fix falsy-value bug`
