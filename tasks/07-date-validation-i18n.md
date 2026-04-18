# 07 — Валідація дат + пропи локалізації для date/time inputs

**Priority:** P1
**Effort:** S (кілька годин)
**Impact:** M
**Depends on:** немає
**Conflicts with:** немає

## Контекст

Див. [../review.md — «Слабкі сторони #11-12»](../review.md#11-p1-хардкод-локалі-у-datetime-input).

1. **Silent data corruption**: [TDateInput.parseDate](../src/components/TDateInput.vue#L37-L44) пропускає `31.02.2024` → `new Date(2024, 1, 31)` = `2024-03-02`. Споживач бачить "прийняло" і мовчки отримує невірну дату. Ідентична проблема в [TDateTimeInput.vue:125-141](../src/components/TDateTimeInput.vue#L125-L141).
2. **Hardcoded Ukrainian placeholders** — `ДД.ММ.РРРР` ([TDateInput.vue:109](../src/components/TDateInput.vue#L109)), `ГГ:хх` ([TTimeInput.vue:103](../src/components/TTimeInput.vue#L103)), `ДД.ММ.РРРР ГГ:хх` ([TDateTimeInput.vue:155](../src/components/TDateTimeInput.vue#L155)), кнопка "Готово" ([TDateTimeInput.vue:177](../src/components/TDateTimeInput.vue#L177)). Будь-який не-український апп отримує кирилицю.

## Acceptance criteria

### Валідація реальних дат

- [x] У `TDateInput.parseDate` після `new Date(y, mo-1, d)` — перевірка `d.getFullYear() === y && d.getMonth() === mo-1 && d.getDate() === d`. Якщо ні — return null (= revert).
- [x] Аналогічно в `TDateTimeInput.commitText` ([:125-141](../src/components/TDateTimeInput.vue#L125-L141)).
- [ ] Тест (додати в `src/__tests__/` — нехай буде частиною #02 або окремий файл):
  - `TDateInput` з `31.02.2024` → поле повертається до попереднього значення, `update:modelValue` не емітиться.
  - `TDateInput` з `29.02.2024` (високосний) → приймається.
  - `TDateInput` з `29.02.2023` → відхиляється.

### i18n-пропи

- [x] `TDateInput` / `TTimeInput` / `TDateTimeInput` — додано опціональний `placeholder?: string` з поточним дефолтом (українською для backward-compat).
- [x] `TDateTimeInput` — додано `doneLabel?: string` з дефолтом `'Готово'`.
- [x] `TInputModalBox` ([TInputModalBox.vue:71-72](../src/components/modal/TInputModalBox.vue#L71-L72)) — додано `submitLabel?: string` (default `'Submit'`), `cancelLabel?: string` (default `'Cancel'`). Примітка: це також дає i18n-стратегію через `modalManager.openInputModal({ submitLabel: t('save'), ... })`.
- [ ] Документовано в README (якщо #06 змержено — додати в «i18n roadmap»; якщо ні — залиш для #06).

## Out of scope

- Повноцінна i18n-система через `provide/inject` з message-catalog'ом — окремо (див. [review.md — можливості #5](../review.md#5-i18n-як-provideinject)).
- Підтримка `format` як строкового шаблону (`YYYY-MM-DD`, `DD/MM/YYYY`) — великий скоуп, не тепер. Поточний формат `DD.MM.YYYY` лишити захардкоженим; додавати тільки пропи, не форматер.
- Інтеграція з `date-fns` locale API — `date-fns` уже у devDeps, але додавати залежність поки передчасно. Якщо у рамках цієї задачі побачиш, що treeshakeable `date-fns/parse` + `date-fns/isValid` дає кращий код — ок, **але тільки якщо немає проблеми з bundle-size**.

## Files to touch

- `src/components/TDateInput.vue`
- `src/components/TTimeInput.vue`
- `src/components/TDateTimeInput.vue`
- `src/components/modal/TInputModalBox.vue`
- `src/__tests__/TDateInput.test.ts` (new або в існуючий)

## First step

Додай helper-функцію `isRealDate(y, mo, d)` у якомусь з файлів (наприклад, створи `src/components/date-utils.ts`) і використовуй у всіх трьох компонентах. Це зменшить дублювання і спростить майбутню eвакуацію logic в окремий composable.

## Важливо для агента

- Не міняй формат відображення (залиш `DD.MM.YYYY`) — це breaking change для існуючих споживачів.
- Дефолти placeholder'ів лиш українськими — поточні consumers на них покладаються.
- Перевір, що існуючі позитивні кейси (нормальна дата, пуста дата) не зламалися.

## Suggested PR title

`fix(date): validate real dates and add label/placeholder props for i18n`

## Зроблено

- Створено `src/components/date-utils.ts` з helper-функцією `isRealDate(y, mo, d)`, яка будує `Date` і round-trip'ить Y/M/D, щоб відсіювати silent rollover (31.02 → 02.03, 29.02.2023 → 01.03 тощо).
- `src/components/TDateInput.vue`: `parseDate` тепер використовує `isRealDate`; додано пропу `placeholder?: string` з дефолтом `'ДД.ММ.РРРР'` (back-compat); шаблон біндить `:placeholder="placeholder"`.
- `src/components/TDateTimeInput.vue`: `commitText` використовує `isRealDate` замість голих границь дня/місяця; додано пропи `placeholder?: string` (default `'ДД.ММ.РРРР ГГ:хх'`) та `doneLabel?: string` (default `'Готово'`); шаблон біндить обидві.
- `src/components/TTimeInput.vue`: додано пропу `placeholder?: string` з дефолтом `'ГГ:хх'`; шаблон біндить `:placeholder="placeholder"`. Валідація часу і так коректна (0..23 / 0..59), тож `isRealDate` сюди не потрібен.
- `src/components/modal/TInputModalBox.vue`: props переведено на `withDefaults`, додано `submitLabel?: string` (default `'Submit'`) та `cancelLabel?: string` (default `'Cancel'`); рендер кнопок тепер через інтерполяцію.

### Відхилення / trade-off'и

- **Тест `src/__tests__/TDateInput.test.ts` не створено.** У репозиторії зараз немає Vitest (в devDeps відсутній, у `package.json` немає `test`-скрипта), а `src/**/*.ts` потрапляє у `vue-tsc --noEmit`. Пустий тестовий файл з `import { describe, it, expect } from 'vitest'` провалив би typecheck до того, як буде виконано задачу #02. Логіку `isRealDate` побудовано на round-trip'і — її покриттям найкраще займатися в рамках #02 (де одночасно додаються Vitest + конфіг + test-script).
- **README не оновлювався.** Задача #06 ще не змержена, тому per acceptance — «залиш для #06».
- `date-fns` не підключений (він у devDeps лише транзитивно/для потенційних експериментів): розмір bundle'а критичніший за кращу читаність, а чистий round-trip на 5 рядках повністю закриває проблему.

### Follow-ups

- У #02: додати `TDateInput.test.ts` з кейсами `31.02.2024` (revert, без emit), `29.02.2024` (accept), `29.02.2023` (revert). Рекомендую тестувати напряму `isRealDate` юніт-тестом + один component-тест на `parseDate` через mount.
- У #06: додати секцію «i18n roadmap» з прикладом використання нових пропів.

### Verification

- `npm run typecheck` — OK.
- `npm run build:nocheck` — OK (76 modules, dist зібраний).
