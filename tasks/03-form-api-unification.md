# 03 — Уніфікувати form-API (`disabled`/`readonly`/`error`/`size`)

**Priority:** P0
**Effort:** M (2-3 години + тести)
**Impact:** L (впливає на кожен use-case бібліотеки)
**Depends on:** #01 (щоб lint одразу покривав нові props)
**Conflicts with:** #05 (обидві чіпають `TSelect.vue`), #08 (`TFormField` використовує цей тип)

## Контекст

Див. [../review.md — «Слабкі сторони #1»](../review.md#1-p0-непослідовний-disabledreadonlyerror-серед-form-компонентів). Дефекти:

- `TButton` ([src/components/TButton.vue:8-21](../src/components/TButton.vue#L8-L21)) — **немає `disabled` в defineProps**, лише fallthrough на нативну `<button>`.
- `TInput` ([src/components/TInput.vue:6-18](../src/components/TInput.vue#L6-L18)) — `disabled`, `readonly` падають через `v-bind="$attrs"`.
- `TTextarea` ([src/components/TTextarea.vue:4-15](../src/components/TTextarea.vue#L4-L15)) — взагалі немає.
- `TSwitch`/`TSelect`/`TDropdown`/`TTabs` — **мають**. Дві різні конвенції в одній бібліотеці.
- `error` / `errorMessage` / `hint` — немає ніде.

## Acceptance criteria

- [ ] У [src/components/types.ts](../src/components/types.ts) додано shared інтерфейс `TFormFieldProps`:
  ```ts
  export interface TFormFieldProps {
    disabled?: boolean
    readonly?: boolean
    error?: string | boolean   // string → message; true → stateful without message
    size?: TElementSize
  }
  ```
- [ ] `TButton` — додано `disabled?: boolean` у `defineProps` (решту пропів цієї задачі до `TButton` **не** додавати — `readonly`/`error` не мають сенсу для кнопки).
- [ ] `TInput` — додано явні `disabled?: boolean`, `readonly?: boolean`, `error?: string | boolean`. CSS-стан `error` проявляється червоною рамкою (`border-color: var(--t-color-danger)`) і хинтом під полем (якщо `error` — рядок).
- [ ] `TTextarea` — аналогічно `TInput`.
- [ ] `TSelect` — додано `error`; `disabled` вже є, залишити.
- [ ] `TSwitch` — додано `error` (візуал — той самий danger-бордер або outline на track).
- [ ] Типи реекспортовано з [src/index.ts](../src/index.ts).
- [ ] В examples у [playground/src/examples/inputs/](../playground/src/examples/inputs/) додано `ErrorInputExample.vue` з продемонстрованим `error`-станом.
- [ ] Тести з задачі #02 (якщо вже змержено) — оновлені. Якщо не змержено — додати в рамках #02 окремо.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build:nocheck` проходять.

## Out of scope

- `TFormField`-wrapper з `<label>`, `required` і composition — це задача #08.
- `loading`-стан — окремо, не тепер.
- VeeValidate / Zod adapter — окрема майбутня робота.
- Міграційні шими для старого fallthrough-способу — **breaking change**, документуй у CHANGELOG (задача #06).

## Files to touch

- `src/components/types.ts`
- `src/components/TButton.vue`
- `src/components/TInput.vue`
- `src/components/TTextarea.vue`
- `src/components/TSelect.vue`
- `src/components/TSwitch.vue`
- `src/index.ts`
- `playground/src/examples/inputs/ErrorInputExample.vue` (new)
- `playground/src/examples/index.ts` (реєстрація прикладу)

## First step

1. Додай `TFormFieldProps` у `types.ts`.
2. Почни з `TInput` — спредь `disabled`, `readonly`, `error` у `defineProps`. Переконайся, що `v-bind="$attrs"` тепер НЕ передає ці ключі двічі (в Vue 3 явні props автоматично виключаються з `$attrs` — перевір).
3. Додай CSS-стан `.t-input-wrapper[data-error]` → `border-color: var(--t-color-danger)`.
4. Далі — `TTextarea` (аналогічно), `TSelect`, `TSwitch`, `TButton`.

## Важливо для агента

- `error` як `string | boolean` — коли `true`, показуєш лише візуальний стан без тексту; коли рядок — показуєш і стан, і текст під полем.
- Не винось `error`-відображення в окремий component тут (це задача #08). Просто inline `<div class="t-input__error">{{ error }}</div>` у тих, де є сенс (TInput, TTextarea, TSelect).
- **Breaking change-маркер**: у commit message і PR description чітко зазнач, які компоненти отримали нові props, а які втратили fallthrough-режим.

## Suggested PR title

`feat!: unify disabled/readonly/error props across form components`
