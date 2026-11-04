# Крок 7 — K06 `TPathCrumbs` + K07 `TFileTree`

## Що змінено
- `src/components/path-tree.ts` — з `B/lib/pathTree.ts`: `buildPathTree(paths)` (нове: дерево з `/`-шляхів, теки першими, склеювання ланцюжків тек), `splitMiddle`, `findPath`, `countFiles`, `flyoutSections`; тип `TPathNode` (`key`, `label`, `children?`).
- `src/components/TPathCrumbs.vue` — проп `path`, теки приглушено через «›», назва файлу жирним, слот після назви.
- `src/components/TFileTree.vue` — окремий компонент (не режим `TTree`): `paths`, `v-model` (обраний шлях), `v-model:collapsed` (смуга); теки згортаються (внутрішній стан, без `localStorage`), теки-предки обраного файлу акцентні, напрямна лише на шляху, довгі назви обрізано посередині; у смузі — кнопки тек верхнього рівня з випадними списками `TDropdown card` (`trigger="both"`) і вертикальна назва обраного файлу. Підписи — пропи `label`, `rootLabel`, `rootFilesLabel`, `showTreeLabel`, `collapseLabel`, `filesText`. Слоти Bombadil (`title`, `actions`, `meta`…) не переносились.
- Іконки `ticon:folder`, `ticon:file`, `ticon:side-panel` (кнопка згортання) у `ticon-set.ts`.
- Реєстрація: `registry.ts`, `index.ts` (+ типи `TPathCrumbsProps`, `TFileTreeProps`, `TPathNode`), `globalComponents.ts`.
- Тести `src/__tests__/TFileTree.test.ts`: побудова дерева, `splitMiddle`, крихти, вибір файлу емітить шлях, згортання в смугу.
- Playground `examples/file-tree/FileTreeExample.vue` + `examples/index.ts`; README (рядок «Файли»), CHANGELOG Added.

## Перевірки
- `npm run check:fast` — lint чистий, 29 файлів / 234 тести зелені, build без помилок.
- `npm run check:size` — Full 190.39 / 205 KB (було 188.59), Styles 12.68 / 15 KB (було 12.26), Core 159.5 / 180, Icons 18.49 / 30, Markdown 1.55 / 2.
- `npm run dev` + Playwright/Chromium, світла й темна: дерево, напрямна й акцент шляху, обрізання посередині, смуга з трьома кнопками, випадний список-картка; вибір файлу зі списку оновлює крихти; помилок сторінки немає.
