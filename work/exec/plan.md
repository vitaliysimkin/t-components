# План: компоненти з Bombadil + виправлення K12–K15 → випуск 1.5.0

Джерела (лише читати): `/home/user/t-platform/work/ui-core/t-components-candidates.md` (картки, «Правила для нових компонентів», «Відкриті питання»), `/home/user/t-platform/work/feedback/2026-11-04-t-components.md` (рішення). Код Bombadil — `/home/user/t-platform/bombadil/ui-snapshot/src/` (далі `B/`).

Спільні правила для кожного кроку:
- KISS, мінімум коду й тексту, стиль наявних компонентів (`<script setup lang="ts">`, `withDefaults`, токени за DESIGN.md §6–7, без hex/rgba/px-радіусів).
- Кожен видимий текст і `aria-label` — проп з англійським значенням за замовчуванням. Без тостів і запитів до сервера — лише події. Іконки — з `ticon:*` (`src/icons/ticon-set.ts`, Material Symbols); бракує — додати гліф туди.
- Новий компонент: `src/components/TX.vue` → `registry.ts` (імпорт, експорт, запис у `componentRegistry`) → `src/index.ts` (експорт + типи) → `src/globalComponents.ts` → тест `src/__tests__/TX.test.ts` → приклад `playground/src/examples/<x>/` + `examples/index.ts` → назва в README «Компоненти (короткий перелік)» → рядок у CHANGELOG `## [Unreleased]`.
- Не чіпати: Bombadil, `bombadil/t-components/`, `.github/`, `tasks/`, `review.md`, версію в `package.json`. Нових документів і звітів не писати.
- Після кроку — один коміт у стилі історії (`fix(textarea): …`, `feat(copy-field): …`), без push (push — лише в кроці 10).
- Базова перевірка кожного кроку: `npm run check:fast` (lint + test + build) і ручний перегляд у `npm run dev` (світла й темна теми).

## 1. Виправлення K12, K13, K15

- **Мета:** прибрати три обходи Bombadil (`B/lib/a11y.ts`, `B/lib/enter.ts`, `B/lib/dropdownPanel.ts`).
- **Що зробити:**
  - K12 `TTextarea`: `inheritAttrs: false`; `class`/`style` — на корінь, решта `$attrs` (`id`, `aria-*`, `name`…) — на `<textarea>`.
  - K13 `TButtonGroup`: режим `options` уже має `type="button"` (1.2.1, тест є). Перевірити, що Enter у `<input>` усередині `<form>` з групою не «натискає» сегмент; додати лише цей тест. Код міняти, тільки якщо тест падає.
  - K15 `TDropdown`: булевий проп `card` (за замовчуванням `false`, щоб не зачепити TSelect/TDate*) — панель отримує фон `--t-color-surface`, рамку `--t-color-border`, радіус `--t-radius-medium`, тінь `--t-shadow-3` (як `dropdownPanelStyle`).
- **Межі:** не міняти API інших пропів; не міняти `TButton`.
- **Готово, коли:** `<TTextarea id="x" aria-label="y">` дає ці атрибути на `<textarea>`; `<TDropdown card>` має вигляд картки з нерізаною тінню; тести на K12, K13, K15 зелені; рядки в CHANGELOG (Fixed / Added).
- **Що перевірити:** `npm run test -- TButtonGroup`, `npm run check:fast`.

## 2. K14 — фокус у діалозі `TModalBox`

- **Мета:** прибрати `B/lib/autofocus.ts` з шести діалогів.
- **Що зробити:** у `src/components/modal/TModalBox.vue` після монтування (`nextTick`) — фокус на перше `input/textarea/select:not([disabled]):not([readonly])`, інакше першу активну кнопку вмісту, інакше саме вікно; запам'ятати `document.activeElement` до відкриття й повернути фокус при `onBeforeUnmount`.
- **Межі:** не чіпати drag/resize, ESC, `useModalManager`; без focus-trap.
- **Готово, коли:** тест: відкрити модалку з полем → поле в фокусі; закрити → фокус на кнопці-ініціаторі. CHANGELOG.
- **Що перевірити:** `npm run test -- useModalManager useDialog` + `npm run check:fast`.

## 3. K01 `TCopyField` + K02 `TCopyChip`

- **Мета:** два компоненти копіювання з `B/components/CopyField.vue`, `B/components/CopyCommand.vue`.
- **Що зробити:** маленька спільна функція `src/components/clipboard.ts` (`navigator.clipboard.writeText` з fallback через `textarea` + `execCommand`), як `date-utils.ts`. `TCopyField`: поле лише для читання + кнопка; після успіху ~1,5 с показує `copiedLabel`; пропи `value`, `copyLabel`, `copiedLabel`; події `copy`, `copy-error`. `TCopyChip`: текст + іконка `ticon:copy`, `title`-проп, події ті самі. Іконку `ticon:copy` (і `ticon:check`, якщо треба) додати в `ticon-set.ts`.
- **Межі:** жодних повідомлень із компонента; не міняти `TInput`.
- **Готово, коли:** тести (мок `navigator.clipboard`): клік → `copy` з значенням; помилка → `copy-error`; стан «скопійовано» спадає. Приклади в playground. README, CHANGELOG.
- **Що перевірити:** `npm run check:fast`, `npm run check:size` (ліміт «Full bundle» не перевищено).

## 4. K03 `TInfoTip` + K04 `TLogPane`

- **Мета:** підказка «i» і живий лог з `B/components/InfoTip.vue`, `B/components/LogPane.vue`, `B/lib/log.ts`, стилі `.log` з `B/styles/base.css`.
- **Що зробити:** `TInfoTip` — кружок `ticon:info` на базі `TTooltip`, фокусований (`tabindex="0"`, `aria-label` = текст), проп `text` / слот. `TLogPane` — проп `lines: TLogLine[]` (тип експортувати: `id`, `text`, `kind?: 'out'|'err'|'warn'|'info'`, `prefix?`), автопрокрутка, пауза при прокрутці вгору, кнопка «до кінця»; три тексти — пропи; кольори рядків — токени статусів, стилі scoped. Поле `step` з `LogLine` не переносити (фільтр — справа застосунку).
- **Межі:** не міняти `TTooltip` і `TFormField`.
- **Готово, коли:** тести: `TInfoTip` має доступне ім'я; `TLogPane` рендерить рядки з класом за `kind`, кнопка «до кінця» з'являється після прокрутки вгору. Playground, README, CHANGELOG.
- **Що перевірити:** `npm run check:fast`.

## 5. S03 — `TSelect` з завантаженням варіантів

- **Мета:** щоб `B/components/AsyncSelect.vue` став тонкою обгорткою або зник (обробка помилок Creatio лишається в Bombadil).
- **Що зробити:** у `TSelect.vue`: `valueKey`/`labelKey` приймають також функцію `(option) => string`; для `loadOptions` — фільтр на клієнті за `filterFn` (або підрядок `labelKey` без регістру), якщо задано новий проп `filterLoaded`; відхилений проміс → подія `load-error` (саму помилку під полем показує наявний проп `error`, текст дає застосунок).
- **Межі:** поведінка без нових пропів не змінюється; наявні тести `TSelect.test.ts` не правити, лише додати.
- **Готово, коли:** тести на ключі-функції, клієнтський фільтр і `load-error`; приклад «Async» у playground оновлено; CHANGELOG.
- **Що перевірити:** `npm run test -- TSelect`, `npm run check:fast`.

## 6. K05 `TMarkdown` — частина `./markdown`

- **Мета:** один показ Markdown замість `B/lib/markdown.ts` і трьох копій стилів.
- **Що зробити:** перенести парсер у `src/markdown/markdown.ts` (без залежностей, екранування спершу, посилання лише `http(s)`, `/…`, `#…`), компонент `src/markdown/TMarkdown.vue` (проп `source`, `v-html`), `src/markdown/index.ts` (експорт `TMarkdown`, `renderMarkdown`). Нова точка входу: `vite.config.ts` `build.lib.entry.markdown`, `package.json` `exports["./markdown"]` (types/import/require, як `./icons`), запис у `.size-limit.json`; у `vite.config.ts` (dts `beforeWriteFile`) виключити `markdown/index.d.ts` з додавання `/// <reference … globalComponents.d.ts>`, як `icons`. Стиль — у загальному `index.css` (клас `.t-markdown`, токени; зібрати з трьох копій Bombadil). Не в `componentRegistry`. Абзац у README про імпорт `@vitaliysimkin/t-components/markdown`.
- **Межі:** без markdown-бібліотек; не розширювати синтаксис понад наявний у Bombadil.
- **Готово, коли:** тести парсера (XSS: `<script>`, `javascript:` → текст; таблиця, список, код); приклад у playground; CHANGELOG.
- **Що перевірити:** `npm run check` (повний: lint, test, build, `check:pack`, `check:types`, `check:size`) — нова точка входу має пройти publint і attw.

## 7. K06 `TPathCrumbs` + K07 `TFileTree`

- **Мета:** «крихти» і дерево файлів зі смугою з `B/components/tree/PathCrumbs.vue`, `B/components/tree/FileRailTree.vue`, `B/lib/pathTree.ts`.
- **Що зробити:** `TPathCrumbs` — проп `path`, слот після назви файлу. `TFileTree` — окремий компонент (не режим `TTree`: інша модель — шляхи, смуга, випадні списки тек), допоміжні функції з `pathTree.ts` у `src/components/path-tree.ts`; проп `paths: string[]`, `v-model` обраного шляху, `v-model:collapsed`; усі підписи («Files», «root», «Show tree»…) — пропи; випадні списки — через `TDropdown card`; іконки `ticon:folder`, `ticon:file` (додати в набір). Типи експортувати.
- **Межі:** `TTree` не міняти; без збереження стану в `localStorage`.
- **Готово, коли:** тести: побудова дерева з шляхів, `splitMiddle`, вибір файлу емітить шлях, згортання в смугу; playground, README, CHANGELOG.
- **Що перевірити:** `npm run check:fast`, `npm run check:size`.

## 8. K10 + K11 — розширити `TCodeEditor` і `TDiffEditor`

- **Мета:** прибрати обгортки `B/components/config/ConfigEditor.vue`, `ConfigDiffEditor.vue`, `configEditorTypes.ts`.
- **Що зробити:** `language: 'xml'` (динамічний `import('@codemirror/lang-xml')`, як json/markdown; пакет — у devDependencies). `TCodeEditor`: `height="fill"` (на всю висоту батька, flex), `defineExpose({ view, scrollToEnd })`. `TDiffEditor`: проп `language`, `orientation: 'horizontal'|'vertical'`, `readonlyOriginal`, підписи сторін `originalLabel`/`modifiedLabel`. Додати `codemirror` і `@codemirror/*`, які імпортує бібліотека, у `peerDependencies` з `peerDependenciesMeta.optional` (зараз вони external, але не оголошені).
- **Межі:** компоненти лишаються в основній частині (перенос у `code-editor` — лише в 2.0); старі пропи не міняти.
- **Готово, коли:** тести (за зразком `TDiffEditor.test.ts`) на нові пропи і `scrollToEnd`; приклади XML і вертикального порівняння в playground; README (peer deps), CHANGELOG.
- **Що перевірити:** `npm run check` (pack/types/size через нові peer deps).

## 9. K08 `TLogView` — частина `./code-editor`

- **Мета:** перегляд великого логу з підсвіткою і пошуком з `B/lib/logView.ts` і загальної частини `B/components/logs/LogFileViewer.vue`.
- **Що зробити:** `src/code-editor/logView.ts` (розширення CodeMirror: підсвітка log4net/NLog, пошук: регістр, regex, ціле слово, «лише рядки зі збігами»), `src/code-editor/TLogView.vue` (проп `text`, лише читання, панель пошуку Ctrl+F, тексти — пропи), `src/code-editor/index.ts`. Точка входу `code-editor` у `vite.config.ts`, `exports["./code-editor"]` у `package.json`, `.size-limit.json`, виключення `code-editor/index.d.ts` у dts `beforeWriteFile` (як `icons`); CodeMirror — external (вже є regexp), `@codemirror/search` — devDep + optional peer. Абзац у README про імпорт.
- **Межі:** завантаження файлу, «Завантажити повністю», «Очистити», `PathCrumbs` — лишаються в Bombadil; `TCodeEditor`/`TDiffEditor` не переносити.
- **Готово, коли:** тести на розбір рівнів log4net/NLog і фільтр «лише збіги» (чисті функції); приклад у playground; CHANGELOG.
- **Що перевірити:** `npm run check`; у `dist/code-editor.js` немає вбудованого CodeMirror (`grep -c "@codemirror" dist/code-editor.js` — лише імпорти).

## 10. Випуск 1.5.0

- **Мета:** опублікувати все в npm.
- **Що зробити:** у CHANGELOG `## [Unreleased]` → `## [1.5.0] - <дата>`, порожній `## [Unreleased]` над ним, пункти згруповані Added / Fixed. Коміт `docs(changelog): 1.5.0`. Потім `npm run release:minor` (`npm version minor` → коміт і тег `v1.5.0`, `git push --follow-tags` → `.github/workflows/release.yml`).
- **Межі:** жодних змін коду; лише CHANGELOG і версія (через `npm version`).
- **Готово, коли:** workflow Release зелений, `npm view @vitaliysimkin/t-components version` = `1.5.0`.
- **Що перевірити:** перед тегом `npm run check` і `npm run build:playground`; після — `gh run list --workflow=release.yml -L 1`, `gh run watch`, `npm view @vitaliysimkin/t-components version`.
