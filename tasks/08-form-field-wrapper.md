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

- [ ] Новий компонент `src/components/TFormField.vue`.
- [ ] Props:
  - `label?: string` — текст `<label>`.
  - `required?: boolean` — показує візуальний маркер (червона зірочка або подібне).
  - `error?: string | boolean` — якщо рядок, показується під полем; якщо `true` — лише state-styling, без тексту.
  - `hint?: string` — муте́ний текст під полем; **ховається, якщо є error** (помилка важливіша).
  - `size?: TElementSize` — якщо передано, прокидається дочірнім через `provide` (опціонально).
- [ ] Default slot — для самого контролу.
- [ ] Слоти `#label`, `#error`, `#hint` для override.
- [ ] A11y:
  - `<label for={uniqueId}>` генерується, `uniqueId` передається в дочірній input через `provide` або через `id`-prop — **обери один підхід** (рекомендую provide + composable `useFormFieldContext()`).
  - `aria-describedby` → `hint` / `error` id.
  - `aria-invalid="true"` при помилці.
  - `aria-required="true"` при required.
- [ ] Зареєстровано в [src/components/registry.ts](../src/components/registry.ts), [src/globalComponents.ts](../src/globalComponents.ts), реекспорт з [src/index.ts](../src/index.ts).
- [ ] У [playground/src/examples/](../playground/src/examples/) додано `form-field/` з мінімум 3 прикладами:
  - Basic з `TInput` + label.
  - Required + error + hint.
  - Комбінація `TSelect` + `TSwitch` + `TTextarea` в одній формі.
- [ ] Реєстрація прикладу в [playground/src/examples/index.ts](../playground/src/examples/index.ts).
- [ ] Тести (смоук):
  - Render з label → label видимий, `for` збігається з id дочірнього.
  - `error="msg"` → `aria-invalid=true`, `msg` у DOM.
  - `hint` + `error` разом → показаний тільки `error`.
- [ ] `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build:nocheck` проходять.

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
