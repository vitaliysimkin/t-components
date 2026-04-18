# Changelog

Всі значущі зміни в цьому проєкті документуються тут.

Формат базується на [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), версіонування відповідає [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
