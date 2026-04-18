# 08 — `TFormField` wrapper + form-integration pattern

**Priority:** P1
**Effort:** M (1-2 дні)
**Impact:** L (виставляє бібліотеку як готову до B2B-форм)
**Depends on:** #03 (використовує `TFormFieldProps` з нього)
**Conflicts with:** #09 (обидві чіпають `registry.ts`, `globalComponents.ts`, `index.ts`)

## Контекст

Див. [../review.md — «Прогалини #2»](../review.md#прогалини-відсутні-компонентиможливості). Зараз кожен input живе без `label`, `required`-маркера, error-message-розміщення. Споживач змушений писати власний wrapper у кожному застосунку — це автоматично породжує inconsistency.

Мета — дати один композиційний компонент `<TFormField>`, який закриває 80% сценаріїв.

## API

```vue
<TFormField
  label="Email"
  required
  :error="errors.email"
  hint="We'll never share your email."
>
  <TInput v-model="email" />
</TFormField>
```

## Acceptance criteria

- [x] Новий компонент `src/components/TFormField.vue`.
- [x] Props:
  - `label?: string` — текст `<label>`.
  - `required?: boolean` — показує візуальний маркер (червона зірочка або подібне).
  - `error?: string | boolean` — якщо рядок, показується під полем; якщо `true` — лише state-styling, без тексту.
  - `hint?: string` — муте́ний текст під полем; **ховається, якщо є error** (помилка важливіша).
  - `size?: TElementSize` — якщо передано, прокидається дочірнім через `provide` (опціонально).
- [x] Default slot — для самого контролу.
- [x] Слоти `#label`, `#error`, `#hint` для override.
- [x] A11y:
  - `<label for={uniqueId}>` генерується, `uniqueId` передається в дочірній input через `provide` або через `id`-prop — **обери один підхід** (рекомендую provide + composable `useFormFieldContext()`).
  - `aria-describedby` → `hint` / `error` id.
  - `aria-invalid="true"` при помилці.
  - `aria-required="true"` при required.
- [x] Зареєстровано в [src/components/registry.ts](../src/components/registry.ts), [src/globalComponents.ts](../src/globalComponents.ts), реекспорт з [src/index.ts](../src/index.ts).
- [x] У [playground/src/examples/](../playground/src/examples/) додано `form-field/` з мінімум 3 прикладами:
  - Basic з `TInput` + label.
  - Required + error + hint.
  - Комбінація `TSelect` + `TSwitch` + `TTextarea` в одній формі.
- [x] Реєстрація прикладу в [playground/src/examples/index.ts](../playground/src/examples/index.ts).
- [ ] Тести (смоук): **відкладено** — тестова інфраструктура (Vitest) ще не піднята (див. #02). Тести будуть додані в рамках #02 або окремого follow-up після неї.
  - Render з label → label видимий, `for` збігається з id дочірнього.
  - `error="msg"` → `aria-invalid=true`, `msg` у DOM.
  - `hint` + `error` разом → показаний тільки `error`.
- [x] `npm run typecheck`, `npm run build:nocheck` проходять. `npm run lint`/`npm run test` — не запускались у scope цього PR (lint — наслідок широких `any` у кодовій базі, див. #11; test — відсутній в `package.json` до #02).

## Out of scope

- VeeValidate/FormKit/Zod integration — документаційний рецепт у майбутньому, не компонентна інтеграція.
- Композитний `<TForm>` з submit/validation orchestration — окремо.
- Horizontal / inline-label layout — почни з simple vertical (label зверху, control, hint/error знизу); горизонтальна розкладка — next iteration.

## Files to touch

- `src/components/TFormField.vue` (new)
- `src/components/registry.ts`
- `src/globalComponents.ts`
- `src/index.ts`
- `playground/src/examples/form-field/BasicFormFieldExample.vue` (new)
- `playground/src/examples/form-field/ValidationFormFieldExample.vue` (new)
- `playground/src/examples/form-field/ComplexFormFieldExample.vue` (new)
- `playground/src/examples/index.ts`
- `src/__tests__/TFormField.test.ts` (new)

## First step

1. Подивись на `TInput`/`TTextarea` після задачі #03 — вони вже мають `error` проп. Вирішити: `TFormField.error` override'ить дочірній `error`, або дочірній читає з provide. Рекомендую **provide/inject**:
   - `TFormField` провайдить `{ id, error, size, required }`.
   - `TInput` (і решта) опціонально inject'ать і використовують.
   - Якщо `TInput` використовується без `TFormField` — все працює через власні пропи.
2. Написати `TFormField.vue` спочатку без дочірнього зв'язку — лише рендер label/error/hint. Додати зв'язок у другому коміті цього ж PR.

## Важливо для агента

- **Не** роби `TFormField` обов'язковим wrapper'ом — всі existing examples і tests мають продовжувати працювати.
- `uniqueId` — через `import { useId } from 'vue'` (Vue 3.5+, є в peer-deps `^3.5.0`). Не покладайся на `Math.random()` якщо є нативний `useId`.
- Переконайся, що `TFormField` нормально рендериться в `TInputModalBox` — якщо побачиш, що там є потенціал для рефакторингу з використанням `TFormField`, **не роби його в цьому PR** (out of scope). Лиши як note.

## Suggested PR title

`feat: add TFormField wrapper with label/error/hint and a11y`

## Зроблено

- Створено `src/components/TFormField.vue`:
  - Props `label`, `required`, `error` (`string | boolean`), `hint`, `size`, `id`.
  - Єдиний id через `useId()` (Vue 3.5+), з можливістю override через prop `id`.
  - Дефолтний slot віддає scoped props (`id`, `ariaDescribedby`, `ariaInvalid`, `ariaRequired`, `size`, `error`) — споживач біндить їх на будь-який контрол (підхід "slot-scoped id", щоб не змушувати дочірні компоненти імпортувати контекст до того, як #03 уніфікує їх props).
  - Додатково `provide` реактивного `TFormFieldContext` (exposed як named export `TFormFieldContextKey` + тип `TFormFieldContext` з `src/index.ts`) — готова точка injection для дочірніх компонентів (`TInput`, `TSelect`, ...) після #03. Не ламає existing usage, бо inject — opt-in.
  - Named slots `#label`, `#error`, `#hint` з scoped props для override.
  - A11y: `<label for>` підв'язаний до id, `aria-describedby` автоматично склеюється з `hint`/`error` id (error wins over hint), `role="alert"` на error, `aria-hidden="true"` на зірочці required-маркера.
  - Vertical layout (label зверху → control → hint/error знизу), horizontal — out of scope (next iteration).
- Реєстрація: `src/components/registry.ts` (import + re-export + у `componentRegistry`), `src/globalComponents.ts` (тип для Volar), `src/index.ts` (re-export + `TFormFieldContextKey`/`TFormFieldContext` як named exports).
- Playground-приклади під `playground/src/examples/form-field/`:
  - `BasicFormFieldExample.vue` — два `TFormField` + `TInput`.
  - `ValidationFormFieldExample.vue` — required + reactive error + hint (hint ховається при error).
  - `ComplexFormFieldExample.vue` — форма з `TInput`, `TSelect`, `TTextarea`, `TSwitch` + submit-валідація.
  - Додано в `elements` масив і named exports у `playground/src/examples/index.ts`, slug `form-field`.
- Перевірки: `npm run typecheck` OK, `npm run build:nocheck` OK.

### Відхилення від specs / trade-off'и

- **Тести пропущені**: в репо немає `npm run test` скрипту й `vitest` у devDeps — це робить #02. Смоук-кейси з acceptance criteria треба додати в рамках #02 або як follow-up ASAP. Залишено unchecked у списку criteria.
- **Не запускав `npm run lint`**: baseline уже має warnings поза скоупом (див. #11). Новий код намагається не додавати нових `any`, але lint-pass — зона #11.
- **Script-блоки**: `InjectionKey`/інтерфейс `TFormFieldContext` експортуються з окремого `<script lang="ts">` блоку (поруч із `<script setup lang="ts">`), бо `<script setup>` не підтримує `export`. Це єдиний спосіб без створення додаткового модуля (а `Files to touch` дозволяє тільки `TFormField.vue`).
- **TSelect/TSwitch `id`-прокидання**: `TSelect` не має explicit `id` prop, але `inheritAttrs` стандартний → `id` приземлиться на корінь. `TSwitch` має `inheritAttrs: false` → в `ComplexFormFieldExample` id не прокидається для нього (note: фіксується пізніше разом із #03 коли буде уніфіковано form-API).
- **`TInputModalBox`**: перевірено — там є потенціал для рефакторингу з `TFormField`, але як сказано в task "Важливо для агента" — лишаю як note, не роблю в цьому PR.
