# Крок 5 — тест (S03 `TSelect` з завантаженням варіантів)

**Вердикт: PASS**

- `npm run test -- TSelect` — 8/8 зелені (3 нові: ключі-функції, `filterLoaded`, `load-error`); наявні тести не змінено (у diff лише рядок імпорту vitest).
- `npm run check:fast` — exit 0: eslint без попереджень, 27 файлів / 223 тести, build ок.
- Код: без нових пропів гілка async не фільтрує, як раніше; `load-error` лише для останнього запиту; `getLabel` фолбек через `getValue` (працює і з функцією `valueKey`).
- Playground «Async Loading» (`npm run dev`, Chromium, світла й темна): «kip» → лише «Kip Neath», «Kip Critchlow»; вибір показує «Kip Neath»; «error» → «Could not load users» під полем, наступний запит прибирає помилку. Помилок сторінки немає (лише `console.error` «Error loading options» з наявного catch і мережеві збої іконок у пісочниці).
- CHANGELOG `[Unreleased] / Added` — рядок є.

Дрібне (не блокує): поки список відкритий, текст помилки закриває панель «No options»; його видно, коли список закрито.
