# Крок 7 — тест

**Вердикт: PASS**

- `npm run check:fast` — exit 0: eslint чистий, 29 файлів / 234 тести зелені, build ок.
- `npm run check:size` — усе в межах: Full 190.39/205, Core 159.5/180, Styles 12.68/15, Icons 18.49/30, Markdown 1.55/2 KB.
- Тести «Готово, коли» є (`src/__tests__/TFileTree.test.ts`): побудова дерева, `splitMiddle`, вибір файлу емітить шлях, згортання в смугу. Playground, README, CHANGELOG оновлено; типи `TPathCrumbsProps`, `TFileTreeProps`, `TPathNode` експортовано; `TTree` не змінено; `localStorage` у компоненті немає; іконки `ticon:folder`/`ticon:file` додано.
- Playwright/Chromium (`npm run dev`, `/components/file-tree`), світла й темна: теки першими, ланцюжок `Scheduler/Quartz/2026-09-26` склеєно, довга назва обрізана посередині, акцент і напрямна лише на шляху до обраного; клік по файлу оновлює крихти; згортання теки ховає дочірні й показує підказку «› файл»; смуга (~50px) — 3 кнопки (корінь, Application [path], Scheduler) з лічильниками і вертикальна назва; випадний список — `TDropdown` `is-card` (фон коректний в обох темах), секції за теками, вибір файлу оновлює крихти й закриває список; «Show tree» повертає дерево. Помилок сторінки немає (лише ERR_TUNNEL для зовнішніх іконок навігації playground — мережа пісочниці, не стосується кроку).
