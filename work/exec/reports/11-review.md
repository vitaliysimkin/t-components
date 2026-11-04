# Review 11 — коміт a88ae51 (1.5.1, issue 03)

Вердикт: PASS

Перевірено:
- З роутером TSidebar/TBottomNav працюють як раніше: `$route` реактивний, `RouterLink` резолвиться глобально (у TSidebar імпорту RouterLink і раніше не було). Тести з реальним роутером проходять (за звітом 245/245).
- Без роутера: імпорт пакета більше не падає (у `dist/index.{js,cjs}` немає `vue-router`). Рендер TSidebar/TBottomNav без роутера, як і раніше, неможливий (`$route` undefined -> TypeError, плюс warn про RouterLink). Поведінка не гірша за попередню (раніше `route.path` також падав), у scope issue (падіння на імпорті) це не входить. Обов'язкових правок немає.
- Правило `vite.config.ts` для `.d.ts`: коротке, покриває `from '...'` та `import('...')`, `(?<!\.js)` захищає від подвійного `.js`. Я прогнав tsc (NodeNext, strict, skipLibCheck false) у /tmp/tc-nn без vue-router: 0 помилок. Єдине обмеження: імпорти каталогів (`./dir` без `index`) стали б `./dir.js`, але зараз їх немає (tsc це підтверджує).
- `.attw.json` (прибрано ignore `internal-resolution-error`), CHANGELOG, звіт 11-dev.md: по темі, без scope creep.

Необов'язково (не блокує): `import type {} from 'vue-router'` — трохи незвично, коментар біля нього пояснює лише `$route`; можна додати "(types only, for `$route`)".
