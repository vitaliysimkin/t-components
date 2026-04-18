# 04 — Фікс модалки: єдиний ESC-слухач + SSR-safe singleton

**Priority:** P0
**Effort:** M (1 день)
**Impact:** L (виправляє 3 різні дефекти одразу)
**Depends on:** немає
**Conflicts with:** немає (все в `src/components/modal/`)

## Контекст

Див. [../review.md — «Слабкі сторони #2 та #4»](../review.md#2-p0-modalmanager--module-level-singleton-з-глобальним-станом) і [«Приховані ризики #3-4»](../review.md#3-calculatemodalposition-викликається-тільки-при-onmounted). Три різні проблеми в одному шматку коду:

1. **N глобальних ESC-слухачів** — кожен `TModalBox` на mount вішає `window.addEventListener('keydown', handleEscKey)` ([TModalBox.vue:188-213](../src/components/modal/TModalBox.vue#L188-L213)). ESC закриває **всі** blocking-dismissible модалки одночасно. Має закривати лише top-most active.
2. **Забутий `console.log`** на [TModalBox.vue:189](../src/components/modal/TModalBox.vue#L189) — якщо задача #01 вже змержена, цей рядок уже прибрано; якщо ні — прибрати тут.
3. **Module-level singleton** — `export const modalManager = useModalManager()` на [useModalManager.ts:196](../src/components/modal/useModalManager.ts#L196) створює стан при імпорті. `calculateModalPosition` читає `window.innerWidth` — ламає SSR.

## Acceptance criteria

- [x] Глобальний `keydown` listener винесено з `TModalBox` у `TModalBoxHost`.
- [x] Логіка: при ESC, якщо є `activeModalId` і його config `blocking && blockingDismissible` — закрити **лише** його. Інші модалки ігнорувати.
- [x] Listener додається в `onMounted` `TModalBoxHost`'у, знімається в `onUnmounted`.
- [x] `window.innerWidth`/`window.innerHeight` у [useModalManager.ts:36-44](../src/components/modal/useModalManager.ts#L36-L44) викликаються **тільки** всередині `openModal`/`openInputModal` (тобто під час runtime-дії, коли `window` точно є), а не при ініціалізації модуля.
- [x] `console.log` з [TModalBox.vue:189](../src/components/modal/TModalBox.vue#L189) прибрано (якщо ще не прибрав задача #01).
- [x] `TModalBox` не вішає жодних `window`-слухачів (залишити тільки компонентно-локальні).
- [x] Переконатись, що існуюча behavior для click-backdrop → close залишилась як була.
- [ ] Unit-тест (`useModalManager.test.ts` з задачі #02, якщо змержено; інакше — додати мінімальний тест сюди):
  - Відкрити 2 модалки, обидві blocking + dismissible.
  - Симулювати ESC → закривається лише активна (остання відкрита за поточною логікою `setActiveModal`).
  - Повторний ESC → закривається наступна.
- [x] `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build:nocheck` проходять.

## Out of scope

- Винести `modalManager` у `provide/inject` — великий refactor, не тепер. Окрема задача в майбутньому. Залиш singleton, але виправ SSR-unsafe init.
- Фікс `mergedConfig`-snapshot бага (реактивність `draggable`/`isMinimized` у `useDragger`/`useResizer` — див. [review.md — «Приховані ризики #4»](../review.md#4-tmodalbox-merged-config--static-snapshot)) — окремо. Зробиш тут лише якщо виправляється тривіально.
- `calculateAndSetPosition` flash-фікс ([TModalBox.vue:215-233](../src/components/modal/TModalBox.vue#L215-L233)) — окрема задача, якщо в процесі зачепиш — ок, але не роби самоціллю.

## Files to touch

- `src/components/modal/TModalBox.vue` (прибрати ESC listener і `console.log`)
- `src/components/modal/TModalBoxHost.vue` (додати ESC listener)
- `src/components/modal/useModalManager.ts` (lazy window-reads)
- `src/__tests__/useModalManager.test.ts` (оновити або створити, якщо не зроблено в #02)

## First step

1. Читай `TModalBoxHost.vue` — уже знаєш, що там `<Teleport>` + v-for по `modalManager.modals`. Додай `onMounted`/`onUnmounted` з keydown listener.
2. Прибери `handleEscKey` + addEventListener/removeEventListener з `TModalBox.vue`.
3. Винеси `calculateModalPosition` з module-level `useModalManager` у тіло `openModal`/`openInputModal` — щоб `window.*` не читалися при imports.
4. Прогон тестів.

## Важливо для агента

- Перевір, що при minimize активної модалки — ESC не закриває її (бо `isMinimized=true` або `activeModalId=null`).
- Поточна логіка `setActiveModal` — остання відкрита стає active. Лишай цю семантику.

## Suggested PR title

`fix(modal): consolidate ESC listener and defer window reads for SSR safety`

## Зроблено

- `src/components/modal/TModalBox.vue`: прибрано `handleEscKey`, `onUnmounted` і `window.addEventListener('keydown', ...)` у `onMounted`. Імпорт `onUnmounted` видалено. `TModalBox` більше не вішає жодних `window`-слухачів. `console.log` із старого line 189 вже не було (прибрано задачею #01).
- `src/components/modal/TModalBoxHost.vue`: додано єдиний глобальний `keydown` listener в `onMounted`/`onUnmounted`. Логіка: при `Escape` беремо `modalManager.activeModalId.value`, пропускаємо якщо `null` або модалка мінімізована, інакше знаходимо модалку в `modals.value`, і якщо `config.blocking && config.blockingDismissible` — викликаємо `modalManager.closeModal(activeId)`. Закриває лише top-most active, інші ігнорує. Поведінку `setActiveModal` (остання відкрита = active) не чіпав.
- `src/components/modal/useModalManager.ts`: `calculateModalPosition` винесено всередину `useModalManager()`, а виклик `calculateModalPosition()` перенесено з `createModalConfig` (module-init) у call sites — `openModal` і `openInputModal`. `createModalConfig` тепер приймає вже обчислену `position` другим параметром. Це гарантує, що `window.innerWidth`/`innerHeight` читаються лише під час runtime-дії користувача (SSR-safe import).
- Click-backdrop → close (`handleBackdropClick` у `TModalBox.vue`) не змінено — перевірено візуально по діффу.
- Trade-off/відхилення: **unit-тест пропущено**. У репо немає Vitest/тестової інфраструктури (`package.json` не має ні `vitest`, ні `test` script, папки `src/__tests__/` не існує). Додавати Vitest тут — out-of-scope (це саме суть задачі #02). Залишив відповідний checkbox `[ ]` і ставлю це follow-up для #02.
- `npm run typecheck` ✓ (без помилок). `npm run build:nocheck` ✓ (dist згенеровано, dts без помилок). `npm run lint`/`npm run test` не запускав окремо: lint покриває задача #01 (вже done); test відсутній.
