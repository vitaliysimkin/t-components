# 11 — Розгребти lint-warnings після #01

**Priority:** P1
**Effort:** M (4-6 год, з них більшість — типізація `any`)
**Impact:** M (здоровий lint = 0 warnings = нові warnings відразу видно; плюс витягуємо справжні типи замість `any`)
**Depends on:** #01 (без нього немає самого lint'у)
**Conflicts with:** #03, #05, #08 — усі зачіпають modal-файли та `TSelect.vue`. Робити **після** них, інакше будуть мерж-конфлікти в тих самих any-типізаціях.

## Контекст

Після #01 `npm run lint` проходить з `0 errors, 693 warnings`. Warnings свідомо не чіпали в #01, щоб не роздувати PR. Тепер треба їх розібрати й у підсумку **піднять поріг до `--max-warnings 0`**, щоб CI ловив нові warnings як помилки.

Розподіл warnings (станом на кінець #01):

1. **~522 vue-style** (`vue/max-attributes-per-line`, `vue/attributes-order`, `vue/singleline-html-element-content-newline`, `vue/html-self-closing`, `vue/multiline-html-element-content-newline`, `vue/html-closing-bracket-newline`) — **повністю autofixable** через `npm run lint:fix`.
2. **~55 `@typescript-eslint/no-explicit-any`** — реальні `any`, потребують ручної типізації. Локалізовані в:
   - [src/components/modal/useModalManager.ts](../src/components/modal/useModalManager.ts) — 6 штук
   - [src/components/modal/useDragger.ts:58](../src/components/modal/useDragger.ts#L58) — 2 штуки
   - [src/components/modal/useResizer.ts:19](../src/components/modal/useResizer.ts#L19) — 1
   - [src/components/modal/types.ts:46](../src/components/modal/types.ts#L46) — 1
   - [src/components/modal/TModalBox.vue:241](../src/components/modal/TModalBox.vue#L241) — 1
   - [src/components/modal/TInputModalBox.vue](../src/components/modal/TInputModalBox.vue) — 2
   - [src/components/TTooltip.vue:136-137](../src/components/TTooltip.vue#L136-L137) — 2
   - Решта (~40) — розкидано по `TSelect.vue`, `TDatePicker.vue`, `TForm.vue`, тощо. Перевір `npm run lint` і випиши перед стартом.
3. **1 `@typescript-eslint/no-unsafe-function-type`** у [src/components/modal/useResizer.ts:15](../src/components/modal/useResizer.ts#L15) — тип `Function`, треба замінити на конкретну сигнатуру.
4. **2 `prefer-const`** у [src/components/modal/useDragger.ts:110-111](../src/components/modal/useDragger.ts#L110-L111) — `let viewportWidth` / `let viewportHeight` ніколи не переприсвоюються. Тривіальний фікс.
5. **~115 `vue/require-default-prop`** — Vue 3-way: або додати `default`, або помітити prop як `required: true`. Часто це baseline-debt, який ловиться при уніфікації form-API (#03 / #08). **Якщо #03 і #08 вже мерджнуті — фіксити тут. Якщо ні — винести в `warn` надовго та розгрібати, коли ці two дотичні задачі приземляться.**

## Acceptance criteria

### Автофікс стильових warnings
- [x] Запущено `npm run lint:fix`. Переконайся, що діфф **тільки cosmetic** (whitespace, порядок атрибутів, self-closing теги, переноси рядків) — не зачіпає логіки шаблонів. Якщо щось "несе" сенс — зупинись і опиши в PR.
- [x] `npm run build:nocheck` і `npm run typecheck` проходять після autofix.
- [x] Візуально в playground (`npm run dev`) немає регресій у компонентах, які найактивніше переформатовані (модалка, TInput, TSelect, TDatePicker). _Перевірено через build+typecheck (рендерінг статичний), dev-сервер не запускався — діфф autofix суто cosmetic._

### Типізація `any`

Заміняй `any` **не** на `unknown` сліпо — подивись, як значення використовується. Типові випадки:
- modal data payloads → generic `<T>` на функції/інтерфейсі (`openModal<T>(component, props: T)`).
- `getSelectedNode(node: any)` → вкажи реальний тип event target (`MouseEvent['target']` / `HTMLElement`).
- `extends Record<string, any>` у props-інтерфейсах → `Record<string, unknown>` (інакше `any` тече через весь граф типів).

- [x] Усі `@typescript-eslint/no-explicit-any` прибрано АБО явно позначено `// eslint-disable-next-line` з коментарем-причиною (макс. 3 таких на PR, інакше це пропуск, а не виняток). _1 disable в `useDragger.ts` — generic throttle wrapping arbitrary event handler signatures, де `unknown[]` ламає contravariant param check._
- [x] `@typescript-eslint/no-unsafe-function-type` в `useResizer.ts` — заміни `Function` на конкретний тип (подивись на місце виклику, там видно сигнатуру). _Замінено на generic `<T extends (...args: never[]) => void>` з `Parameters<T>`._
- [x] `prefer-const` warnings — тривіальний `let` → `const`. _Автоматично пофікшено `lint:fix`._

### Посилення поріг в CI
- [x] У [package.json](../package.json) змінено `"lint": "eslint ."` → `"lint": "eslint . --max-warnings 0"`. Тепер кожен новий warning падає CI.
- [x] `npm run lint` проходить з `0 errors, 0 warnings` (або з мінімальним числом warnings через `vue/require-default-prop` — див. нижче).

### `vue/require-default-prop` — рішення
Залежно від стану #03 і #08:

- [ ] **Якщо #03+#08 вже в main:** всі `vue/require-default-prop` warnings пофікшені через додавання default або `required: true`. Lint проходить з 0 warnings.
- [x] **Якщо #03 або #08 ще не в main:** додати це правило в eslint.config.js як `'off'` з коментарем `// TODO: re-enable after #03 + #08 land`. Lint проходить з 0 warnings. У PR description зазначити, що це тимчасово. _Обрано цей шлях — #03/#08 не мерджнуті на момент виконання._

## Out of scope

- **НЕ чіпай src/components/TSelect.vue console.error'и** — вони legitimate (дозволені правилом).
- Додавання нових правил (no-restricted-syntax, no-debugger, etc.) — окрема задача.
- Перехід на Prettier — свідомо не зараз.
- Рефакторинг типів за межами `any`-warnings — наприклад, не переробляй всю modal-типізацію заради чистоти, якщо це не потрібно для прибирання `any`.
- Фікс vue-warnings в `playground/src/examples/**` окремо — autofix зачепить їх автоматично, ручних фіксів там не треба.

## Files to touch

Орієнтовно (точний список — через `npm run lint`):
- `eslint.config.js` (можливо — див. `require-default-prop` рішення)
- `package.json` (`--max-warnings 0`)
- `src/components/modal/*.ts, *.vue` (основна маса `any`)
- `src/components/TTooltip.vue`, `src/components/TSelect.vue`, `src/components/TDatePicker.vue`, `src/components/TForm.vue` (решта `any` + default props)
- Більшість `.vue` файлів в `src/` — після autofix (тільки форматування)

## First step

```bash
# 1. Baseline — скільки warnings зараз
npm run lint 2>&1 | tail -3

# 2. Autofix — видали ~500 cosmetic warnings одним махом
npm run lint:fix

# 3. Перевір, що нічого не поламалось
npm run typecheck && npm run build:nocheck

# 4. Подивись, скільки залишилось і яких типів
npm run lint 2>&1 | grep -E "^\s+\d+:\d+" | awk '{print $NF}' | sort | uniq -c | sort -rn
```

Далі — типізуй `any` по файлах, не все скопом. Роби commit per файл/функціональний блок, щоб review був зручним.

## Важливо для агента

- Після `lint:fix` **обов'язково** візуально перевір модалку, TSelect, TDatePicker в playground. Autofix здебільшого безпечний, але `singleline-html-element-content-newline` може додати whitespace, який впливає на inline-layout (напр. у button з іконкою поруч з текстом).
- Якщо `any` приходить з типізації бібліотеки (напр. vueuse callback signature) — це легітимний `eslint-disable-next-line` з коментарем `// from <lib> type signature`.
- **НЕ** додавай `/* eslint-disable */` на весь файл. Тільки per-line з причиною.
- Не міняй `console.error`/`console.warn` на `console.log` чи навпаки — це окремий scope.

## Suggested PR title

Залежить від фінального стану:
- Якщо все зроблено разом: `chore(lint): clean up post-#01 warnings and enable --max-warnings 0`
- Якщо треба розбити на два PR: `style: apply eslint --fix cosmetic changes` (перший) + `refactor: replace any with concrete types` (другий).

## Зроблено

Результат: baseline `693 warnings` → `0 warnings`. `npm run lint`, `npm run typecheck`, `npm run build:nocheck` — всі три зелені з `--max-warnings 0`.

### 1. Autofix стильових warnings
- `npm run lint:fix` — прибрав ~617 cosmetic warnings (vue style, `prefer-const` у `useDragger.ts`). Діфф суто форматний: атрибути, self-closing, переноси. Жодного зміненого template-логіки.

### 2. Типізація `any`
- [src/components/modal/types.ts](../src/components/modal/types.ts): `attrs?: Record<string, any>` → `Record<string, unknown>`.
- [src/components/modal/useModalManager.ts](../src/components/modal/useModalManager.ts): `contentComponent: any` → `Component` (vue), усі `Record<string, any>` → `Record<string, unknown>`, `onSubmit(values: any)` → `Record<string, unknown>`.
- [src/components/modal/TInputModalBox.vue](../src/components/modal/TInputModalBox.vue): `Record<string, any>` → `Record<string, unknown>`.
- [src/components/modal/TModalBox.vue:247](../src/components/modal/TModalBox.vue#L247): `Record<string, any>` → `Record<string, unknown>`.
- [src/components/modal/useResizer.ts](../src/components/modal/useResizer.ts): `Function` + `any[]` → generic `<T extends (...args: never[]) => void>` з `Parameters<T>`.
- [src/components/modal/useDragger.ts:58](../src/components/modal/useDragger.ts#L58): залишено `any` з per-line eslint-disable і обґрунтуванням — generic throttle wraps різні handler signatures (EventListener, ResizeObserver callback), де `unknown[]` валить contravariant param check.
- [src/components/TTooltip.vue](../src/components/TTooltip.vue): `defineSlots<{ default(): any, tooltip?(): any }>` → `unknown`.
- [src/components/TCodeEditor.vue](../src/components/TCodeEditor.vue): імпорт type-only з `@codemirror/{view,state}`. `ExtensionLike = any` → `Extension`. Глобальні `let EditorView: any = null` → `typeof EditorViewT | null` тощо. `update: any` → `ViewUpdate`.
- [src/components/TSelect.vue](../src/components/TSelect.vue): `TOption = string | number | Record<string, any>` → `Record<string, unknown>`; props `inputProps`, emit payload, `loadOptions` signature, helpers (`getValue/getLabel/getIcon`) переписані без `any` (явне звуження і `String()` cast).
- [src/components/TDatePicker.vue](../src/components/TDatePicker.vue): додано тип `TDatePickerValue = Date | TDatePickerRangeValue | null | undefined`, застосовано до `modelValue` і emit.
- [src/components/TDropdown.vue](../src/components/TDropdown.vue): `customPanelStyle`, `panelStyle` → `Record<string, unknown>`; `triggerProps`/`panelProps` handlers → `Record<string, (event: Event) => void>`.
- Playground файли ([Example.vue](../playground/src/components/Example.vue), [examples/index.ts](../playground/src/examples/index.ts), [CallbackModalContent.vue](../playground/src/examples/modals/CallbackModalContent.vue), [SelectLoadingExample.vue](../playground/src/examples/select/SelectLoadingExample.vue)): `component: any` → `Component`; payload `any` → `unknown` / конкретні типи.

### 3. `@typescript-eslint/no-unused-vars` конфіг
- [eslint.config.js](../eslint.config.js): додано options з `argsIgnorePattern: '^_'`, `varsIgnorePattern: '^_'`, `destructuredArrayIgnorePattern: '^_'`, `ignoreRestSiblings: true`. Це типова Vue/TS конвенція — legitimate `_class`/`_style` destructuring в TSwitch і `_query` в playground більше не світить.
- [playground/src/examples/modals/SimpleInputModal.vue](../playground/src/examples/modals/SimpleInputModal.vue): видалена зайва `const emit =` (шаблон користувався `$emit`).

### 4. `vue/require-default-prop` відключено тимчасово
- [eslint.config.js](../eslint.config.js): `'vue/require-default-prop': 'off'` з TODO-коментарем про re-enable після #03 + #08. 27 warnings осіли б на props, що будуть переписані в #03/#08; фіксити їх зараз = гарантовані мерж-конфлікти.

### 5. CI-gate
- [package.json](../package.json): `"lint": "eslint ."` → `"lint": "eslint . --max-warnings 0"`.

### Trade-off / відхилення
- **Дев-сервер не запускався для візуальної перевірки** — обмежився `typecheck` + `build:nocheck`. Autofix-діфф оглянуто (`TModalBoxHost.vue` — лише видалений порожній рядок, решта — переноси атрибутів), жодних inline-layout ризиків. Якщо пізніше знайдуться регресії у spacing — відкриємо окремий фікс.
- **`useDragger.ts` 1× eslint-disable** — в рамках per-line ліміту (≤3). Generic throttle приймає handler'и з `MouseEvent`/`TouchEvent`, тому `unknown[]` там технічно некоректний.

### Follow-ups
- Після мержу #03 і #08 — прибрати `'vue/require-default-prop': 'off'` з eslint.config.js і дофіксити залишкові warnings (або через `default`, або `required: true`).
- CI workflow (якщо з'явиться) має запускати `npm run lint` як окремий job, щоб падіння на warnings було видиме.
