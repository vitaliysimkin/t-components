# Changelog

Всі значущі зміни в цьому проєкті документуються тут.

Формат базується на [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), версіонування відповідає [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `TButtonGroup` — проп `mode`: `'segmented'` (за замовчуванням; трек `surface-2` з піднятим бігунком, що їздить між опціями) або `'plain'` (хейрлайн-рамка, обраний — м'який тінт `variant`). Діє і в режимі перемикача (`options` + `v-model`), і для набору кнопок у слоті.
- `TButtonGroup` — мультивибір: масив у `v-model` (`modelValue: value | value[]`) дозволяє обрати кілька опцій; `mandatory` не дає зняти останню. Типи `TButtonGroupMode`, `TButtonGroupValue`, `TButtonGroupModel`.

### Changed
- `TButtonGroup` — новий вигляд: замість суцільної заливки `variant` під обраним сегментом — бігунок (`segmented`) або тінт (`plain`); `variant` лишається кольором обраної опції (іконка / тінт). Рамка й роздільники спільні, радіуси залежать від `size` (зокрема `small` / `mini`), фокус — внутрішнє кільце, disabled приглушує лише вміст, кнопки лише з іконкою — квадратні. Корінь має `role="group"`.
- **Важливо для споживачів:** `TButtonGroup` — `variant` більше не заливає обрану опцію суцільним кольором (тепер це колір іконки в `segmented` або тінт у `plain`).
- **Важливо для споживачів:** `TButtonGroup` у режимі слоту — дочірні `TButton`, що є прямими DOM-нащадками групи, ігнорують свій `mode` (атрибут `mode` не рендериться) і малюються групою: без власної заливки й рамки, `variant` дає колір тексту/іконки та плівки hover/press, без стискання й ripple при натисканні; висоту й радіуси задає `size` групи. Стилі групи застосовуються лише до прямих DOM-нащадків: `TButton`, обгорнутий у проміжний елемент (`<span>` тощо), лишається звичайною кнопкою.

## [1.6.0] - 2026-11-09

### Added
- Архітектура анімацій (див. `MOTION.md`): токени `--t-motion-scale`, `--t-motion-move`, `--t-duration`, `--t-duration-slow`, `--t-ease`, `--t-ease-spring`; рівні `full` / `reduced` / `off` / `auto` через атрибут `data-t-motion` (на `<html>` або на контейнері).
- Глобальний перемикач руху з головного входу: `setMotion`, `currentMotion`, `motionLevel`, `getMotionLevel` (налаштування зберігається в `localStorage` під ключем `t-motion`), типи `MotionLevel`, `MotionSetting`.
- Точка входу `@vitaliysimkin/t-components/motion` для опційних JS-ефектів (поки порожня).
- Анімації компонентів: `TButton`, `TButtonGroup`, `TBadge`, `TTag`, `TCheckbox`, `TSwitch`, `TInput`, `TTextarea`, `TSelect`, `TDatePicker`, `TDropdown`, `TTabs`, `TTable`, `TNotifications`, `TModalBox`, `TSidebar`, `TEmpty`, `TFormField`, `TCopyChip`, `TLogPane`, `TPathCrumbs`, `TLogView`. Усі працюють на токенах і підкоряються рівню руху (`reduced` — лише короткий fade, `off` — без анімацій).
- `TSidebar` — кнопка згортання з іконкою-подвійним шевроном, що з'являється при наведенні на сайдбар або фокусі.

### Changed
- `TSidebar` — проп `collapseIcon` більше не має значення за замовчуванням (раніше `system-uicons:window-collapse-left`): без нього показується вбудований подвійний шеврон. Хто явно передає `collapseIcon`, не змінюється; хто покладався на дефолт — побачить новий значок.
- `TSidebar` — кнопка згортання прихована, поки сайдбар не під курсором і не у фокусі (раніше завжди мала `opacity: 0.5`).
- `TModalBox` — прибрано розмиття фону (`backdrop-filter`) за модалкою: воно спричиняло гальмування анімації відкриття. Фон лишається затемненим без розмиття.
- Анімація спалаху (flash) виконується через `opacity` оверлея — на композиторі, без перемальовування.
- Playground — вкладка «Animations» з реальними компонентами, описами, графіками easing і виміряною продуктивністю (`npm run measure:motion`).
- `TTextarea` — тепер обгортає `textarea` у `div.t-textarea-field`, а клас `size-*` перенесено на цю обгортку.
- При `prefers-reduced-motion` тривалості більше не дорівнюють 0 — рух обнуляється, лишається короткий fade.

## [1.5.1]

### Fixed
- Головний вхід більше не імпортує `vue-router` під час завантаження: `TSidebar` / `TBottomNav` читають `$route`, тож пакет імпортується без `vue-router`.
- Типи резолвляться під `moduleResolution: NodeNext` (явні розширення `.js` у `.d.ts`) для головного входу, `./markdown`, `./code-editor`, `./icons`.

## [1.5.0] - 2026-11-04

### Added
- Компоненти `TCopyField`, `TCopyChip`, `TInfoTip`, `TLogPane`, `TPathCrumbs`, `TFileTree`; іконки `ticon:copy`, `check`, `folder`, `file`, `side-panel`.
- Точки входу `./markdown` (`TMarkdown`, `renderMarkdown`) і `./code-editor` (`TLogView` — лог з підсвіткою log4net / NLog і пошуком).
- `TDropdown` — проп `card`.
- `TSelect` — ключі-функції `valueKey` / `labelKey`, `filterLoaded`, подія `load-error`.
- `TCodeEditor` — мова `xml`, `height="fill"`, `scrollToEnd()`. `TDiffEditor` — `language`, `orientation`, `readonlyOriginal`, `originalLabel` / `modifiedLabel`.
- `codemirror` і `@codemirror/*` — optional `peerDependencies`.

### Fixed
- `TTextarea` — атрибути (`id`, `aria-*`…) йдуть на `<textarea>`, `class` / `style` — на корінь.
- `TModalBox` — фокус на перше поле при відкритті й повернення фокусу після закриття.

## [1.4.0] - 2026-10-05

### Added
- `TSplitPane` — горизонтальний режим `orientation="horizontal"`: панелі згори й знизу, `v-model` — висота верхньої панелі, клавіші ↑/↓ замість ←/→, курсор `row-resize`, `aria-orientation="horizontal"`. Усі три вигляди (`gutter`, `flat`, `line`) працюють в обох орієнтаціях. За замовчуванням `orientation="vertical"` — як і раніше. У playground — приклад «Horizontal».

## [1.3.0] - 2026-10-05

### Added
- `TSplitPane` — дві панелі з роздільником ширини: `v-model` (ширина лівої панелі в px), `min` / `max` / `minEnd` (мінімум правої панелі з урахуванням контейнера), `defaultSize` (скидання подвійним кліком або Enter), перетягування мишею й дотиком (pointer capture, iframe у панелях не перехоплює мишу), клавіатура ←/→ (Shift — більший крок), Home/End, `role="separator"` з `aria-valuenow/min/max`, подія `resize-end` для збереження ширини. Три вигляди `variant`: `gutter` — жолобок 6px між панелями-картками, `flat` — щілина 5px без карток, `line` (за замовчуванням) — лінія 1px з ручкою-крапками по центру, лінія не проходить крізь ручку. У playground — сторінка «TSplitPane».

## [1.2.1] - 2026-10-05

### Fixed
- `TButtonGroup` у режимі `options` — обраний сегмент тепер залитий кольором `variant` (`mode="filled"`), решта — нейтральні `plain`; раніше обраний відрізнявся лише легким тінтом і в темній темі був погано помітний. Стан обраного — `aria-pressed`.
- `TButtonGroup` у режимі `options` — сегменти без видимого підпису (`label-display="selected"` / `"never"`) отримують `title` і `aria-label` з `label`, тож мають підказку й доступне ім'я.
- `TButtonGroup` у режимі `options` — сегменти мають `type="button"`, тож усередині `<form>` не відправляють форму.

## [1.2.0] - 2026-10-05

### Added
- `TDatePicker`, `TDateInput`, `TDateTimeInput` — проп `isDateDisabled?: (date: Date) => boolean`: дні, для яких функція повертає `true`, не можна обрати, вони відображаються приглушено. У playground — приклад «Disabled dates».

## [1.1.0] - 2026-09-25

### Added
- Вибір кольору акценту атрибутом `data-t-accent` на `<html>`: `terracotta` (за замовчуванням), `blue`, `green`, `violet`, `amber`, `rose`. Працює в обох темах. У playground — перемикач у футері сайдбару.

### Fixed
- `TBottomNav` — на тач-пристроях щойно обраний пункт не підсвічувався до перезавантаження: «липкий» `:hover` після тапу перебивав колір активного пункту. Hover тепер лише для `(hover: hover)`, і активний стан завжди має пріоритет.

## [1.0.0] - 2026-09-25

### Changed
- **Новий візуальний стиль** — тепла нейтральна палітра (`--t-warm-*`), теракотовий акцент замість синього, приглушені статусні кольори, радіуси 8/10/12 замість 4/6/8, тіні лише для «плаваючих» елементів. Імена ролей `--t-color-*` не змінились; сира палітра Open Color лишилась для тегів. Правила зафіксовано в [DESIGN.md](DESIGN.md), живі токени — на сторінці `/design` у playground.
- Нові токени: `--t-color-hover`, `--t-color-backdrop`, `--t-shadow-color`, `--t-radius-pill`, `--t-font-mono`, `--t-font-size-h1..h3`, `--t-font-weight-*`, `--t-duration`, `--t-duration-slow`, `--t-ease`, `--t-line-height-tight`.
- `TSidebar` — «flat» вигляд: панель на `--t-color-bg`, активний пункт — `surface` з хейрлайном та акцентною іконкою, пункти з радіусом. Додано опційне поле `group` у `menuItems`: сусідні пункти з однаковою групою рендеряться під секційним заголовком, який у згорнутому стані стає роздільником. Тип пункту експортовано як `TSidebarMenuItem`.
- `TCard`, `TTable` — радіус `large`; заголовок таблиці прозорий, muted, вага 500.
- `TTag`, `TBadge` — pill-радіус; `TTag variant="teal"` тепер справді бірюзовий (раніше помилково використовував gray-токени).
- `TNotifications` — тост на `surface` із м'якою тінню `--t-shadow-2` і тонованою рамкою для статусних варіантів.
- `TInput`, `TTextarea` — 3px кільце фокуса `--t-color-focus-ring`; вага тексту 400.
- `TSelect`, `TTabs`, `TModalBox`, `TBottomNav`, `TFormField` — захардкоджені `rgba()`/`px`/hex замінено на токени.
- `base.css` — `-webkit-font-smoothing: antialiased`, `code/kbd/pre` на `--t-font-mono`, focus outline з радіусом.

## [0.10.1] - 2026-06-15

### Fixed
- `TSelect` у режимі `valueMode: 'value'` показував сирий код замість підпису: коли `modelValue` — примітив (значення з `valueKey`), компонент рендерив сам примітив замість того, щоб знайти відповідну опцію і показати її `labelKey`. Тепер `modelValue` резолвиться у конкретну опцію зі списку (для async-опцій із fallback на примітив, поки список не завантажено).
- `TDropdown` — панель телепортувалась у `<body>` з жорстким `z-index: 1000`, через що випадала ПІД модальними діалогами (`TModalBox` blocking-шар = 4010). Додано проп `zIndex` із дефолтом `5000` (вище модалок, нижче нотифікацій/overlay), тож випадайки в діалогах більше не ховаються за вікном.

## [0.10.0] - 2026-06-03

### Added
- `TIcon` — обгортка над `@iconify/vue` `<Icon>` з офлайн-fallback: невідоме/незареєстроване ім'я іконки рендерить помітний червоний гліф `ticon:missing` (з тултіпом `Missing icon: <name>`) замість порожнечі. Експортується для застосунків.
- Кураторський офлайн-набір іконок під префіксом `ticon:*` (12 гліфів Material Symbols + `ticon:missing`), вбудований у core — використовується як дефолти компонентів і працює з коробки без мережі.
- Опційний підшлях `@vitaliysimkin/t-components/icons` — реєструє увесь набір `system-uicons` офлайн (`addCollection`). Підключається одним імпортом на старті застосунку (`import '@vitaliysimkin/t-components/icons'`), щоб імена `system-uicons:*` рендерились без запитів до api.iconify.design.

### Changed
- Усі внутрішні компоненти рендерять іконки через `TIcon` замість прямого `@iconify/vue` `Icon`, тож fallback покриває й `TButton icon=`, `TSelect`, `TSidebar` тощо.
- Внутрішні дефолтні іконки переведено з `material-symbols*` на власний `ticon:*` набір (вигляд збережено, але тепер працюють повністю офлайн).
- Набір `system-uicons` більше НЕ інлайниться в основний бандл — імпорт будь-якого компонента не тягне сотні іконок; важкий набір винесено в opt-in підшлях `/icons` (core полегшав ~на 17 kB brotli).

## [0.9.0] - 2026-05-22

### Added
- `useDialog` — composable з Promise-based API для confirm/alert/prompt-діалогів, побудований на `modalManager`; внутрішні компоненти `TConfirmDialog` і `TPromptDialog`.
- `useLoading` — singleton-composable для показу/приховування fullscreen та element-scoped індикаторів завантаження; компонент `TLoadingOverlay` із SVG-спінером і scroll-locking.
- `TTree` — рекурсивний деревовидний компонент з підтримкою controlled/uncontrolled expandedKeys, слотом `#node` і ARIA-атрибутами.
- `TEmpty` — компонент порожнього стану з іконкою, описом і слотами для кастомізації.
- `TBadge` — badge-компонент з варіантами (`neutral`, `accent`, `danger`, `success`, `warning`, `info`), dot-режимом і обмеженням `max`.
- `TCollapseTransition` — компонент-обгортка `<Transition>` з JS-хуками для плавної анімації height 0 ↔ auto та opacity.
- `TCard` — картка з опційними header/footer слотами та prop `header`.
- `TCheckbox` — checkbox-компонент з підтримкою розмірів, indeterminate-стану, error-стану та інтеграцією з `TFormField`.
- `useFormValidation` — composable для валідації форм із синхронними та асинхронними правилами, тригерами `blur`/`change`/`submit`.
- `TDiffEditor` — diff-редактор на основі CodeMirror MergeView з підтримкою кастомних мовних розширень, тем і readonly-режиму.
- `NotificationOptions` тип до `useNotifications` — опції `timeoutMs` та `onClick` для сповіщень із підтримкою клікабельності.
- `CustomOptionSelectExample` — приклад кастомних опцій у `TSelect` через слот `#option`.

## [0.7.0] - 2025

### Added
- `TCodeEditor` (перейменовано з `CodeEditor` для узгодженості з `T*`-префіксом), з динамічним імпортом CodeMirror, інтеграцією `useTheme` і runtime-перемиканням `readonly`.
- Поле `repository` в `package.json` для npm provenance.

### Changed
- Розбито приклади datetime в playground на окремі секції `TDateInput`, `TTimeInput`, `TDateTimeInput`.

## [0.6.0] - 2025

### Added
- Власний `TDatePicker` (single + range), hover-preview для range-вибору, візуальне розрізнення committed vs pending краю діапазону.
- Приклади `TDatePicker` в playground.

### Changed
- `DatePicker` перейменовано на `TDatePicker` для узгодженості з `T*`-префіксом.
- Вирівняно висоти day/month/year видів у date-picker; cell-size через дизайн-токени.

### Removed
- Залежність від `vuestic-ui` — повністю прибрано з `package.json`, `vite.config`, playground.

## [0.5.0] - 2025

### Added
- `TSidebar`: `nested` prop для вбудованого використання; фіксоване позиціонування у viewport.
- CI: публікація playground на GitHub Pages при пуші в `main`.
- Приклади `CodeEditor` в playground; inline SVG favicon.

## [0.4.1] - 2025

### Added
- `TTabs`: компонент із варіантами, іконками, a11y-розмінкою.

## [0.4.0] - 2025

### Added
- `TSidebar`: ChatGPT-style хедер, theme-aware кольори, footer slot.

## [0.3.1] - 2025

### Fixed
- Експортовано `Props`/`Emits` типи з SFC для розв'язання `TS4082` у споживача.

### Changed
- CI: Node 24 для npm publish; перехід на `npm install` замість `npm ci`; прибрано `--provenance`-флаг.

## [0.3.0] - 2025

### Added
- `GlobalComponents` augmentation для Volar template-типізації.
- Автоматична публікація в npm через GitHub Actions (OIDC trusted publishing).

## [0.2.0] - 2025

### Added
- `TNotifications`: компонент сповіщень і приклади в playground.
- Інструкції з публікації в npm у README.

### Fixed
- Перемикання dropdown по кліку для readonly date/time inputs.

## [0.1.3] - 2024

### Fixed
- Стабілізація layout і відзивчивості `TDateTimeInput` і `TDropdown`.
- Обробка дат на focus/blur у `TDateTimeInput`.
- `min-width: 0` для wrapper і input у `TInput` (щоб ужимались у flex-контейнерах).

## [0.1.2] - 2024

### Added
- `editable` prop для date/time inputs, за замовчанням — readonly.
- Приклади editable date/time input у playground.

## [0.1.1] - 2024

### Fixed
- Клік по suffix/prefix-іконці фокусує input.
- Правки package-lock / bump версії.

## [0.1.0] - 2024

### Added
- Перший публічний реліз: екстракція переюзабельних UI-компонентів у standalone-бібліотеку з префіксом `T*` (TButton, TInput, TSelect, TSwitch, TTag, TDropdown, TTooltip, TDateInput, TTimeInput, TDateTimeInput, TTimePicker).
- Дизайн-токени в CSS-бандлі.
- Пакет опубліковано як `@vitaliysimkin/t-components`.
