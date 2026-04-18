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

- [x] У [src/components/types.ts](../src/components/types.ts) додано shared інтерфейс `TFormFieldProps`:
  ```ts
  export interface TFormFieldProps {
    disabled?: boolean
    readonly?: boolean
    error?: string | boolean   // string → message; true → stateful without message
    size?: TElementSize
  }
  ```
- [x] `TButton` — додано `disabled?: boolean` у `defineProps` (решту пропів цієї задачі до `TButton` **не** додавати — `readonly`/`error` не мають сенсу для кнопки).
- [x] `TInput` — додано явні `disabled?: boolean`, `readonly?: boolean`, `error?: string | boolean`. CSS-стан `error` проявляється червоною рамкою (`border-color: var(--t-color-danger)`) і хинтом під полем (якщо `error` — рядок).
- [x] `TTextarea` — аналогічно `TInput`.
- [x] `TSelect` — додано `error`; `disabled` вже є, залишити.
- [x] `TSwitch` — додано `error` (візуал — той самий danger-бордер або outline на track).
- [x] Типи реекспортовано з [src/index.ts](../src/index.ts).
- [x] В examples у [playground/src/examples/inputs/](../playground/src/examples/inputs/) додано `ErrorInputExample.vue` з продемонстрованим `error`-станом.
- [ ] Тести з задачі #02 (якщо вже змержено) — оновлені. Якщо не змержено — додати в рамках #02 окремо. *(не застосовне — #02 ще не змержено)*
- [x] `npm run typecheck`, `npm run build:nocheck` проходять. `npm run lint` — див. нотатки нижче.

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

## Зроблено

- **`src/components/types.ts`** — додано shared інтерфейс `TFormFieldProps` з полями `disabled`, `readonly`, `error`, `size`. Використовується як canonical контракт для form-компонентів (наразі задекларований, fine-grained застосування через spread — задача #08, де буде TFormField wrapper).
- **`src/components/TButton.vue`** — додано явний `disabled?: boolean` з дефолтом `false` у `defineProps`, bind на нативну `<button :disabled>` (раніше працювало лише через fallthrough).
- **`src/components/TInput.vue`** — явні `disabled`, `readonly`, `error?: string | boolean`. Обгорнуто в додатковий `.t-input-root` для розміщення inline повідомлення. CSS-стан `[data-error]` рендерить `border-color: var(--t-color-danger)` і блокує switch to accent на focus. Коли `error` — рядок, рендериться `<div class="t-input__error">` під полем. Clear-іконка більше не показується в `disabled`/`readonly`.
- **`src/components/TTextarea.vue`** — аналогічно TInput (`disabled`, `readonly`, `error`), інлайн-повідомлення + червона рамка через `[data-error]`.
- **`src/components/TSelect.vue`** — додано `error?: string | boolean` у `TSelectProps`, проп проброшений у вкладений TInput. Само повідомлення під полем рендерить TInput.
- **`src/components/TSwitch.vue`** — додано `error?: string | boolean`. Візуал — danger-border на `.t-switch__track` + `box-shadow: 0 0 0 1px var(--t-color-danger)`. Повідомлення тут не виводимо (нема сенсу для toggle — для цього буде TFormField у #08).
- **`src/index.ts`** — реекспорт `TFormFieldProps` поряд з `TElementSize`.
- **`playground/src/examples/inputs/ErrorInputExample.vue`** (новий) — демонструє string-error на TInput/TTextarea/TSelect (повідомлення + рамка) та boolean-error на TSwitch (тільки візуал).
- **`playground/src/examples/index.ts`** — зареєстровано `ErrorInputExample` у секції TInput + named export.

### Checks

- `npm run typecheck` — PASS (vue-tsc 0 errors).
- `npm run build:nocheck` — PASS (ESM+CJS+d.ts build clean).
- `npm run lint` — скіпнуто: у worktree-сетапі парсер typescript-eslint не може однозначно резолвнути `tsconfigRootDir` (конфліктує кілька активних worktrees), усі 522 "errors" — це `Parsing error: No tsconfigRootDir was set` із розряду інфраструктурних, не спричинені змінами цього PR. Фікс парсер-конфігу — поза scope задачі (дотичне до #01/#10).

### Breaking change notes

- `TButton` — раніше `disabled` проходив тільки через fallthrough attrs; тепер це явний проп. API для споживачів **не ламається** (значення все ще biнд­иться на `<button :disabled>`), але `defineProps` тепер його розпізнає (TS-типи оновилися, fallthrough цього атрибуту більше немає).
- `TInput` / `TTextarea` — `disabled` і `readonly` більше не передаються через `$attrs`/fallthrough: тепер це явні props. Якщо хтось покладався на fallthrough на інший DOM-елемент (не input/textarea), цей сценарій втрачено. Для поточного використання (передавалися з споживача → native `<input>`) поведінка ідентична.
- `TInput` — structure шаблону змінилася: тепер існує зовнішня `.t-input-root` обгортка для розміщення error-message. Custom styles, що цілилися на безпосередню дочку споживача, можуть потребувати перевірки.
- `error` як нова поверхня API: `string | boolean`. `true`/non-empty-string вмикає візуальний стан; string додатково рендерить повідомлення під полем (TInput/TTextarea). TSelect рендерить message через вкладений TInput. TSwitch — лише візуал.

### Відхилення від First step

- Replaced template-level `v-bind="$attrs"` обгортку навколо клас-перевірки: Vue 3 автоматично виключає явні props з `$attrs`, тож `disabled/readonly/error` не проходять двічі. Перевірено під vue-tsc без warnings.
- Використано `|| undefined` замість `|| null` для `aria-invalid`, бо Vue runtime-dom типи (`Booleanish | 'grammar' | 'spelling' | undefined`) не приймають `null` — vue-tsc дтс-емітер failив із TS2322 інакше.
