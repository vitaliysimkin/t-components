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

- [ ] Глобальний `keydown` listener винесено з `TModalBox` у `TModalBoxHost`.
- [ ] Логіка: при ESC, якщо є `activeModalId` і його config `blocking && blockingDismissible` — закрити **лише** його. Інші модалки ігнорувати.
- [ ] Listener додається в `onMounted` `TModalBoxHost`'у, знімається в `onUnmounted`.
- [ ] `window.innerWidth`/`window.innerHeight` у [useModalManager.ts:36-44](../src/components/modal/useModalManager.ts#L36-L44) викликаються **тільки** всередині `openModal`/`openInputModal` (тобто під час runtime-дії, коли `window` точно є), а не при ініціалізації модуля.
- [ ] `console.log` з [TModalBox.vue:189](../src/components/modal/TModalBox.vue#L189) прибрано (якщо ще не прибрав задача #01).
- [ ] `TModalBox` не вішає жодних `window`-слухачів (залишити тільки компонентно-локальні).
- [ ] Переконатись, що існуюча behavior для click-backdrop → close залишилась як була.
- [ ] Unit-тест (`useModalManager.test.ts` з задачі #02, якщо змержено; інакше — додати мінімальний тест сюди):
  - Відкрити 2 модалки, обидві blocking + dismissible.
  - Симулювати ESC → закривається лише активна (остання відкрита за поточною логікою `setActiveModal`).
  - Повторний ESC → закривається наступна.
- [ ] `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build:nocheck` проходять.

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
