# t-components — якісний огляд

## TL;DR

Бібліотека має **дуже добре продуману основу**: токенізована тема на CSS-змінних з поділом `tokens → colors → theme → base`, правильно розв'язана проблема Volar-типів через `componentRegistry` + автоматичний `/// <reference>` у `index.d.ts` ([vite.config.ts:11-20](vite.config.ts#L11-L20)), і заголовна робота з tree-shaking (важкі залежності винесені в `external`). Основна проблема — **непослідовність API та типів серед form-компонентів**: `disabled/readonly/error/size` живуть у різних компонентах по-різному, а найчастіші inputs (`TInput`, `TTextarea`, `TButton`) взагалі не мають явного `disabled`-пропа і покладаються на fallthrough. Модальна підсистема має архітектурні вади: module-level singleton, N глобальних ESC-слухачів, забутий `console.log`, SSR-небезпечна ініціалізація. Найболючіший розрив — **повна відсутність тестів** при тому, що код публікується в npm і використовується у робочих мікросервісах. Документація — один README + playground; `README.md` не показує навіть базовий `import` + `app.use()`. Виправлення топ-3 проблем (явні `disabled/readonly/error` через спільний `FormField`-патерн, SSR-safe модальний менеджер, хоча б smoke-тести через Vitest) дасть більшу віддачу, ніж додавання нових компонентів.

## Сильні сторони

### 1. Шарована архітектура CSS-токенів
[tokens.css](src/styles/tokens.css), [colors.css](src/styles/colors.css), [theme.css](src/styles/theme.css), [base.css](src/styles/base.css) — це рідкісний для pet-бібліотек рівень дисципліни. Розподіл на «сирий палетний шар» (`--t-oc-*`) і «семантичний шар» (`--t-color-accent`, `--t-color-danger-contrast`, `--t-color-neutral-plain-bg`) у [colors.css:9](src/styles/colors.css#L9) + [theme.css:20-97](src/styles/theme.css#L20-L97) дозволяє перекроювати тему, не зачіпаючи компоненти. Широке використання `color-mix(in srgb, … %, transparent)` ([theme.css:30](src/styles/theme.css#L30), [theme.css:49](src/styles/theme.css#L49) тощо) замість rgba-літералів — це саме те, що робить темізацію масштабованою. **Зберегти й тиражувати.**

### 2. Автоматичне підключення `GlobalComponents`-типів через `beforeWriteFile`
[vite.config.ts:11-20](vite.config.ts#L11-L20) — рішення, яке варто підсвітити окремо: при збірці `.d.ts` у `index.d.ts` інжектиться `/// <reference path="./globalComponents.d.ts" />`, завдяки чому Volar бачить T*-компоненти у шаблоні без `shims.d.ts` у споживача. Це вирішує типову бибу в VueLibs на 2025 рік (вічні PR типу «додайте мені в `tsconfig` include.d.ts») і заслужено винесено в README. **Ключовий DX-актив бібліотеки.**

### 3. Registry + GlobalComponents як single source of truth
[registry.ts:52-74](src/components/registry.ts#L52-L74) з коментарем «Types are intentionally erased to `Component` so the registry value does not depend on per-component prop types — that avoids a circular type reference» — автор явно натрапив на проблему з GlobalComponents циклом і документував обхід. Це саме правильне рішення: registry value стирає типи, а GlobalComponents читає їх напряму з модуля `.vue`. **Цей коментар варто зберегти буквально — це institutional knowledge.**

### 4. `TDropdown` як справжній headless-примітив
[TDropdown.vue](src/components/TDropdown.vue) з `slot="trigger"` + `triggerProps` (lines 307-311), `Teleport` на `body` (line 315), позиціюванням з viewport-flip ([TDropdown.vue:111-133](src/components/TDropdown.vue#L111-L133)), reposition on scroll (capture phase, line 290-294) — зроблено грамотно. І що важливіше — на ньому побудовані `TSelect`, `TDateInput`, `TTimeInput`, `TDateTimeInput`. Це правильний шлях для розширення бібліотеки без копіпасти. **Патерн, який треба доводити до решти компонентів.**

### 5. Динамічні імпорти CodeMirror
[TCodeEditor.vue:70-106](src/components/TCodeEditor.vue#L70-L106) — core, language, theme завантажуються через `await import()`. Це означає, що споживач, який *не* рендерить `TCodeEditor`, не платить за CodeMirror у своєму initial bundle — попри те, що компонент експортується з головного entrypoint. **Точковий DX — гарно.**

### 6. Захист від race-умов у `TSelect.loadOptions`
[TSelect.vue:170-202](src/components/TSelect.vue#L170-L202): `requestSeq` інкрементується на кожний запит, результати застосовуються тільки якщо `currentSeq === requestSeq.value`. Це саме той патерн, який потрібен для async-autocomplete з debounce. **Рідко зустрічається в таких бібліотеках — зберегти.**

### 7. A11y у `TTabs`
[TTabs.vue:129-145](src/components/TTabs.vue#L129-L145): `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, правильний `tabindex` (0 для активної / −1 для інших), повна клавіатурна навігація (ArrowLeft/Right/Up/Down/Home/End) у [TTabs.vue:74-105](src/components/TTabs.vue#L74-L105). Це WAI-ARIA-compliant реалізація, а не «достатньо, бо працює». **Еталон того, як мали б виглядати інші компоненти.**

## Слабкі сторони й недопрацювання

### 1. [P0] Непослідовний `disabled`/`readonly`/`error` серед form-компонентів
- `TButton` ([TButton.vue:8-21](src/components/TButton.vue#L8-L21)) — **не має `disabled` в `defineProps`**. Працює лише через fallthrough `$attrs` на нативну `<button>`. Споживач пише `<TButton disabled>` і воно працює *випадково*, але TS не підказує, Volar не автокомплітить.
- `TInput` ([TInput.vue:6-18](src/components/TInput.vue#L6-L18)) — та сама історія: `disabled`/`readonly` відсутні в пропах, падають через `v-bind="$attrs"` на `<input>` ([TInput.vue:48](src/components/TInput.vue#L48)). Для CSS автор робить `:has(.t-input:disabled)` на wrapper ([TInput.vue:87](src/components/TInput.vue#L87)) — розумно, але тип не показує.
- `TTextarea` ([TTextarea.vue:4-15](src/components/TTextarea.vue#L4-L15)) — взагалі немає ні `disabled`, ні `readonly` як пропів, хоча в CSS `:disabled` описано.
- `TSwitch` ([TSwitch.vue:10-22](src/components/TSwitch.vue#L10-L22)), `TSelect` ([TSelect.vue:16](src/components/TSelect.vue#L16)), `TDropdown` ([TDropdown.vue:26](src/components/TDropdown.vue#L26)), `TTabs` (через `disabled` в `TTabItem`) — **мають** `disabled` явно.
- Немає єдиного `error` / `errorMessage` / `hint` / `label`-slot у жодному input'і. Форма без `label` + `error` — це 80% реального використання.

**Симптом у споживача:** `<TInput v-model="x" disabled :error="formErrors.x" />` не підказується в IDE, `error` тихо ігнорується, кожен споживач ліпить власні обгортки.

**Варіанти виправлення:** (a) додати явні props усюди — +30 хвилин роботи, низький ризик; (b) витягти shared `useFormField` + `TFormField`-wrapper-компонент зі `<label>`, `<slot name="error">`, `role="alert"` — правильна довгострокова інвестиція; (c) як мінімум, додати `FormFieldProps` як shared TS-тип і спредити в кожен компонент.

### 2. [P0] `modalManager` — module-level singleton з глобальним станом
[useModalManager.ts:14-19](src/components/modal/useModalManager.ts#L14-L19): `const modalBoxes = ref(...)` живе **зовні** функції `useModalManager`. Експорт `export const modalManager = useModalManager()` на [line 196](src/components/modal/useModalManager.ts#L196) перетворює composable на singleton. Паралельно в index.ts реекспортується ([src/index.ts:14](src/index.ts#L14)). Наслідки:
- **SSR зламане:** модуль підтягується ще до того, як є `window`; у `calculateModalPosition` ([line 36-44](src/components/modal/useModalManager.ts#L36-L44)) читається `window.innerWidth`. Якщо бандлер pre-render'ить компонент, що імпортує `modalManager`, — `ReferenceError`.
- **Тести:** стан між тестами не ізолюється без ручного `closeAllModals()`.
- **Декілька `TModalBoxHost`:** кожен отримує той самий стан, що іноді добре, іноді — сюрприз.
- **`useModalManager()` як функція виглядає як composable, але насправді просто повертає ті самі глобальні ref'и** — не перезапускається.

**Варіанти:** (a) винести стан у `inject/provide` або `app.provide('modalManager', ...)`; (b) якщо глобальний стан — свідомий вибір, перейменувати на `modalStore` і позначити в JSDoc, а `useModalManager` видалити; (c) як мінімум — відкладена ініціалізація `window`-залежних викликів.

### 3. [P0] `console.log` в production-коді
[TModalBox.vue:189](src/components/modal/TModalBox.vue#L189): `console.log('ESC key pressed', event)` — виконується на кожен натиск ESC, для кожного змонтованого модалу. У реальному застосунку з 2-3 модалами це забруднить консоль при будь-якому ESC. **15 секунд на fix**, але показовий недогляд — також доводить відсутність lint'у.

### 4. [P0] Глобальні ESC-слухачі, N × модалів
[TModalBox.vue:188-213](src/components/modal/TModalBox.vue#L188-L213): кожен `TModalBox` на `onMounted` вішає `window.addEventListener('keydown', handleEscKey)`. Якщо відкрито 3 модали, ESC викличе `handleClose` для всіх трьох, і ті, що `blocking && blockingDismissible`, закриються одночасно. Це рідко те, що хоче споживач — зазвичай ESC має закрити **лише активний top-most модал**. Виправити: тримати слухач *глобально* (на рівні `TModalBoxHost` або `useModalManager`), який знає `activeModalId` та закриває тільки його.

### 5. [P1] Типо `swtich` у public API
[modal/types.ts:43](src/components/modal/types.ts#L43): `type: 'text' | 'number' | 'password' | 'email' | 'textarea' | 'swtich' | 'code'`. Відповідно в [TInputModalBox.vue:52](src/components/modal/TInputModalBox.vue#L52): `v-else-if="input.type === 'swtich'"`. Це експортовано як `ModalInputConfig` через [src/index.ts:15](src/index.ts#L15) → попадає в `.d.ts`. Виправлення — breaking change (перейменування enum-значення). Краще зробити одразу в рамках 0.x, доки SemVer толерантний.

### 6. [P1] `isSelected` у `TSelect` ламається на falsy-значеннях
[TSelect.vue:154-160](src/components/TSelect.vue#L154-L160):
```ts
function isSelected(option: TOption): boolean {
  if (!props.modelValue) return false   // ← бага
  ...
}
```
`modelValue === 0`, `''`, `false` — легітимні значення, але функція повертає `false`. Так само в [TSelect.vue:104-108](src/components/TSelect.vue#L104-L108) `displayLabel`: `props.modelValue ? getLabel(props.modelValue) : ''` — `0` не показується. Заміна на `modelValue == null` виправляє обидва.

### 7. [P1] `TDatePicker` API типізоване як `any`
[TDatePicker.vue:124-133](src/components/TDatePicker.vue#L124-L133):
```ts
export interface TDatePickerProps {
  modelValue: any;
  mode?: TDatePickerMode;
  ...
}
export interface TDatePickerEmits {
  (e: 'update:modelValue', value: any): void;
}
```
Причому `TDatePickerRangeValue` вже визначений. Правильний тип — `Date | TDatePickerRangeValue | null` у дискрімінаній формі або generic на `mode`. Зараз споживач пише `<TDatePicker v-model="rangeValue" mode="range">` і не отримує ніякої допомоги від TS.

### 8. [P1] `TTag` — паралельне іменування варіантів і один реальний баг
- Варіанти у [TTag.vue:26](src/components/TTag.vue#L26) — `'gray' | 'blue' | 'red' | 'green' | 'teal' | 'yellow' | 'orange'` — **кольори**, а не семантика. Тоді як `TButton`, `TTooltip`, `TNotifications` використовують `'accent' | 'danger' | 'success' | 'warning' | 'info'`. Тобто в одному дизайн-системі дві паралельні шкали. Споживач, що хоче «tag для error», має знати, що це `red`, а не `danger`.
- **Реальний баг:** [TTag.vue:97-103](src/components/TTag.vue#L97-L103) — `.t-tag--teal` використовує `--t-color-tag-gray` / `--t-color-tag-gray-bg` (з 50% прозорості). Copy-paste. Teal-токени визначені в [theme.css:91-92](src/styles/theme.css#L91-L92), але в TTag не вживаються.
- **Розмір у px:** [TTag.vue:57-73](src/components/TTag.vue#L57-L73) — `padding: 2px 6px`, `font-size: 11px` — хардкод замість `var(--t-font-size-mini)` тощо. Порушує темізацію.

### 9. [P1] Розбіжність типів і CSS у `TSwitch`
[TSwitch.vue:4](src/components/TSwitch.vue#L4): `export type TSwitchSize = 'mini' | 'small' | 'default' | 'medium' | 'large'`. Але в CSS є [TSwitch.vue:215-218](src/components/TSwitch.vue#L215-L218):
```css
.t-switch.size-fit {
  width: 100%;
  justify-content: space-between;
}
```
`'fit'` у типі відсутній. Або прибрати CSS, або додати в тип. Симптом: споживач пише `size="fit"` — TS ругається, а за фактом це працює.

### 10. [P1] Ескалаційний баг у `useResizer` + `DEFAULT_MODAL_BOX_CONFIG`
[modal/types.ts:52](src/components/modal/types.ts#L52): `size: { width: 400, height: 'min-content' }`. Але [useResizer.ts:53-55](src/components/modal/useResizer.ts#L53-L55):
```ts
element.style.width = typeof size.width === "string" ? size.width : (size.width + "px")
element.style.height = typeof size.height === "string" ? size.height : (size.height + "px")
```
Для `height: 'min-content'` — ok. Для `height: 400` — стає `"400px"`, ок. Але [TModalBox.vue:197-204](src/components/modal/TModalBox.vue#L197-L204) бере значення з `DEFAULT_MODAL_BOX_CONFIG` через `...DEFAULT_MODAL_BOX_CONFIG` і передає `{ width, height }` з `default: 300`, перекриваючи `'min-content'`. Ланцюжок дефолтів зроблено в двох місцях непослідовно. Треба зробити **одне** місце з дефолтами.

### 11. [P1] Хардкод локалі у date/time-input
- Плейсхолдери: `"ДД.ММ.РРРР"` ([TDateInput.vue:109](src/components/TDateInput.vue#L109)), `"ГГ:хх"` ([TTimeInput.vue:103](src/components/TTimeInput.vue#L103)), `"ДД.ММ.РРРР ГГ:хх"` ([TDateTimeInput.vue:155](src/components/TDateTimeInput.vue#L155)).
- Формат дати **завжди** `DD.MM.YYYY` ([TDateInput.vue:31-44](src/components/TDateInput.vue#L31-L44)) — немає пропа `format`, немає опції ISO-in/ISO-out.
- Кнопка «Готово» в [TDateTimeInput.vue:177](src/components/TDateTimeInput.vue#L177) — також українською.
- `TSidebar` toggleLabel defaults: `"Розгорнути"` / `"Згорнути"` ([TSidebar.vue:158-160](src/components/TSidebar.vue#L158-L160)).
- `TInputModalBox` — «Cancel» / «Submit» ([TInputModalBox.vue:71-72](src/components/modal/TInputModalBox.vue#L71-L72)).

**Симптом:** будь-який англомовний чи російськомовний споживач отримає кирилицю в UI. Для pet-проектів — ок, для бібліотеки в npm — ні. Мінімум: пропи `placeholder`, `format`, `doneText`, плюс документований шлях до повноцінної i18n-прошарки.

### 12. [P1] `TDateInput.parseDate` не валідує реальні дати
[TDateInput.vue:37-44](src/components/TDateInput.vue#L37-L44): перевіряє `d < 1 || d > 31` — пропускає `31.02.2024`. Далі в [TDateInput.vue:48-50](src/components/TDateInput.vue#L48-L50) створюється `new Date(2024, 1, 31)` → фактично `2024-03-02`. Споживач бачить, що поле «прийняло» 31 лютого і тихо замовчки перетворило. Для `TDateTimeInput` ([TDateTimeInput.vue:125-141](src/components/TDateTimeInput.vue#L125-L141)) — те саме. Виправити: після `new Date(y, mo-1, d)` перевірити `d.getMonth() === mo-1 && d.getDate() === d`.

### 13. [P2] Touch-move `preventDefault` + пасивний слухач
[useDragger.ts:274-277](src/components/modal/useDragger.ts#L274-L277): додається `document.addEventListener('touchmove', drag)`. Сучасний Chrome/Safari робить top-level `touchmove` passive за замовчуванням — `e.preventDefault()` у [useDragger.ts:171](src/components/modal/useDragger.ts#L171) тихо ігнорується і в консолі з'являється warning. Потрібно явно `{ passive: false }`.

### 14. [P2] Відсутня клавіатурна навігація у `TDatePicker`
Календар — велика кнопкова сітка ([TDatePicker.vue:44-66](src/components/TDatePicker.vue#L44-L66)), але немає arrow-keys, Home/End, PageUp/Down для навігації між днями/місяцями. Для screen-reader — також немає `role="grid"` / `role="gridcell"` / `aria-selected`. `TTabs` зробили ідеально, а `TDatePicker` — ні.

### 15. [P2] Немає підтримки `min`/`max`/`disabledDate`
`TDatePicker` не дозволяє обмежити діапазон обирання. Це базова вимога для більшості форм (дата народження, майбутні бронювання, діапазон звіту). Додати як проп `isDateDisabled?: (d: Date) => boolean` з візуальним станом.

### 16. [P2] Обов'язкові peer-deps `@iconify/vue` та `@vueuse/core`
[package.json:36-41](package.json#L36-L41):
```json
"peerDependencies": {
  "@iconify/vue": ">=4.0.0",
  "@vueuse/core": ">=10.0.0",
  ...
}
```
Споживач, який імпортує тільки `TButton`, `TInput`, `TTag`, має ставити дві peer-залежності. `@vueuse/core` використовується в `TDropdown` (useEventListener, onClickOutside) — якщо tree-shaking прибрав `TDropdown`, `@vueuse/core` все одно потрібен на етапі `npm install` (peer warning). Варіант: віддзеркалити реальні залежності через `peerDependenciesMeta.optional = true` для `@vueuse/core`, або переписати `TDropdown` на власну функцію `onClickOutside` (20 рядків) і прибрати peer.

### 17. [P2] Tree-shaking чи global plugin — треба дати вибір
[src/index.ts:57-63](src/index.ts#L57-L63): default-export — `Plugin`, що реєструє **усі** компоненти через `app.component()`. `componentRegistry` також експортується як об'єкт з усіма компонентами. Це означає: якщо консьюмер пише `import TComponents from '@vitaliysimkin/t-components'; app.use(TComponents)`, — CodeMirror та усі компоненти тягнуться в bundle, навіть якщо він використовує тільки `TButton`. Це не проблема бібліотеки, а трейдофф, який має бути **чітко задокументований у README**: «для tree-shaking використовуйте named imports; `app.use(plugin)` зручний, але тягне все».

### 18. [P2] `TCodeEditor` дублює логіку `useTheme`
[TCodeEditor.vue:40-54](src/components/TCodeEditor.vue#L40-L54): зчитує `currentTheme` з `useTheme`, а потім **знову** створює `matchMedia` listener для `prefers-color-scheme: dark`, хоча `useTheme` уже це робить ([useTheme.ts:35-37](src/composables/useTheme.ts#L35-L37)). Можна замінити на `import { currentTheme, isDark }` (якщо експортувати `isDark`), і прибрати локальний `systemDark` + `media`.

### 19. [P2] SSR-фрагільність через module-level ініціалізацію
- [useTheme.ts:5-7](src/composables/useTheme.ts#L5-L7) — читає `localStorage` на завантаженні модуля (guarded, але створює різну початкову картину на сервері vs клієнті → hydration mismatch).
- [useTheme.ts:27](src/composables/useTheme.ts#L27) — викликає `applyTheme(currentTheme.value)` на клієнті одразу. Для SSR — нема проблеми, для hydrate — flash/mismatch можливий якщо сервер віддав інший клас.
- [useModalManager.ts:196](src/components/modal/useModalManager.ts#L196) — singleton створюється при імпорті.

**Рекомендація:** якщо SSR у планах — винести ініціалізацію в `onMounted`/`hook`, додати явний `createTheme()`/`createModalManager()` фабричний варіант.

### 20. [P3] Недостатній README
[README.md](README.md) містить лише інструкцію релізу. Немає:
- Installation + `app.use(TComponents)` приклад.
- Link to playground працює, але не пояснено, як імпортувати CSS (`import '@vitaliysimkin/t-components/style.css'` — єдине, але в README не згадано).
- Не згадано peer-deps і що з ними робити.
- Немає браузерної матриці, нічого про SSR.
- Немає CHANGELOG.md попри 7 релізів.

Це не косметика: 80% рішень «встановлювати чи ні» приймаються по README за 30 секунд.

## Прогалини (відсутні компоненти/можливості)

Фокус — на те, без чого типова CRUD-адмінка або dashboard **не зможе** бути побудована на t-components без шматків з Element Plus / Ant Design:

1. **Таблиця / `TTable`.** Навіть мінімальна: columns-конфіг, sorting, selection, empty state. Без неї бібліотека не закриває головний use case data-heavy апок. Великий обсяг роботи, але високий ROI.
2. **Форма / `TForm` + `TFormItem`.** Зараз кожен input живе сам по собі без обгортки з label/error/required/validation. Це автоматично змушує споживача писати власний wrapper — а значить, бібліотека не дає консистентної UX в формах.
3. **`TCheckbox` та `TRadio`/`TRadioGroup`.** `TSwitch` є, але checkbox (з indeterminate-станом для master-select-all у таблиці) і radio — немає. Без них не побудувати filter-панель.
4. **`TConfirmDialog` + `TMessageBox`.** Модалки з imperative API (`modalManager.confirm(...)`, `.alert(...)`, `.prompt(...)` — останнє частково вкрите `openInputModal`). Зараз consumer пише кастомний `contentComponent` для простого «ви впевнені?».
5. **`TPopover` окремо від `TTooltip`.** TTooltip — content-only pointer-events: none. Popover (з actionable вмістом всередині) потрібен для «submenu», «actions menu», «filter picker».
6. **Skeleton / `TSkeleton`.** Loading-стани — зараз у `TSelect` є текстовий "Loading...", і все.
7. **`TPagination`.** Необхідна поруч із `TTable`.
8. **`TDrawer`.** `TModalBox` draggable-floating — це workspace-style. Класичний slide-over drawer (справа/зліва) — інший use case, часто зустрічається.
9. **`TBreadcrumbs`.** Проста, але задокументована прогалина.
10. **`TNumberInput`.** Форма з числами без +/− і правильної клавіатурної поведінки — не закривається через `TInput type="number"`.
11. **Valiation + validation resolver** (VeeValidate adapter, Zod-resolver). Може бути як документаційний рецепт.
12. **RTL support.** Наразі в CSS немає `[dir="rtl"]` правил — для будь-якої b2b-продуктивності з RTL ринками бібліотека непридатна.

## Приховані ризики

### 1. Відсутність будь-яких тестів
Ні unit, ні integration, ні e2e. CI ([release.yml](.github/workflows/release.yml)) не запускає жодного тесту. Для бібліотеки у npm, що використовується у робочих мікросервісах, — найбільший стратегічний ризик. Перший коміт з regression у модалці або селекті «проходить». Немає характеристичних тестів, які б відображали поточну поведінку — значить, будь-який рефакторинг ламає несподіване.

### 2. Subpixel-jitter у `TSidebar` — документований, але крихкий
[TSidebar.vue:126-133](src/components/TSidebar.vue#L126-L133) має розлогий коментар про `position: fixed` vs `sticky`. Це саме те, що варто писати коментарем (правило «Why» виконано). Але: `nested` проп змінює поведінку, і споживач, що передає `nested=true`, може натрапити на той самий jitter без жодної підказки від типів.

### 3. `calculateModalPosition` викликається тільки при `onMounted`
[TModalBox.vue:196-213](src/components/modal/TModalBox.vue#L196-L213) — перерахунок позиції, коли розмір модалки `min-content`, відбувається *до* того, як контент отримав реальний розмір. Коментар на [line 207-208](src/components/modal/TModalBox.vue#L207-L208) (закоментований `setTimeout(20)`) говорить, що це вже колись намагалися пофіксити. Модалка з `size.height === 'min-content'` може з'явитися в неправильному місці й потім не перецентруватися на resize вмісту.

### 4. `TModalBox` merged config — static snapshot
[TModalBox.vue:176-185](src/components/modal/TModalBox.vue#L176-L185): `useDragger`/`useResizer` отримують `enabled: mergedConfig.value.draggable && !props.isMinimized`. Це **обчислене значення в момент setup** — не computed. Зміна `config.draggable` реактивно не пошириться. А зміна `isMinimized` в runtime не перемкне dragger. Це може проявитися лише в тестах або edge-кейсах, але архітектурно неправильно.

### 5. `onClickOutside` в `TDropdown` ігнорує лише `panelRef`
[TDropdown.vue:270-280](src/components/TDropdown.vue#L270-L280). Якщо всередині `TSelect` відкрити підменю через інший `TDropdown` (наприклад, filter-panel з вкладеним select), зовнішній клік закриє обидва. `onClickOutside` не стекується між компонентами. Для даних use case'ів — ок, але треба документувати.

### 6. `TSelect.handleBlur` має `setTimeout(200)`-костиль
[TSelect.vue:246-253](src/components/TSelect.vue#L246-L253): якщо dropdown встиг відкритися через клік, ми не чистимо `searchQuery`. Магічне 200мс — на повільному мобільному може недостатньо. Правильне рішення — focus-within або `relatedTarget` перевірка.

## Можливості на майбутнє

1. **Headless-ізація.** `TDropdown` уже headless. Наступний крок — `TSelect` з headless core (`useCombobox`-composable) + presentational skin. Тоді `TSelectAutocomplete`, `TMultiSelect`, `TCombobox` стануть конфігураціями.
2. **Storybook / Ladle або Histoire.** Playground гарний, але це одна-сторінка-per-component з прикладами. Storybook додасть interaction-testing (play функція), accessibility-аддон, visual regression через Chromatic.
3. **Vitest + @testing-library/vue + Playwright-ct.** Базові unit-тести на `TDatePicker` (range-селекцію), `TSelect` (async race), модалку — окупляться уже на другому рефакторі.
4. **Nuxt-module.** Два рядки `nuxt.config.ts`: автоімпорт компонентів + CSS. Формат: `@vitaliysimkin/t-components/nuxt`.
5. **i18n як provide/inject.** `provide('tComponentsI18n', { datePlaceholder, doneLabel, cancelLabel, submitLabel, sidebarToggle })` — без залежності на i18n-бібліотеку. Консьюмер патчить string-table через composition.
6. **Migration guide per minor version.** Мінімально в CHANGELOG.md. Breaking changes в 0.x — норма, але їх треба документувати.
7. **CSS-per-component output.** Зараз один `index.css` — 52KB. Можна додати `./style/TButton.css` subpath exports для справжнього lazy-CSS.
8. **Dark-mode без FOUC.** Короткий inline-скрипт у документації: `<script>document.documentElement.classList.add(localStorage.theme==='dark'?'dark':'light')</script>` — щоб споживач міг вставити в `<head>`.
9. **Form адаптер для VeeValidate + Zod-resolver.** Один `TFormField` з `v-slot="{ errorMessage, value, handleChange }"` — типова схема.
10. **Publint перед релізом.** [publint.dev](https://publint.dev) у CI ловить некоректні `exports`, відсутні `types`, CJS/ESM incompatibilities. Це 3 рядки в `release.yml`.

## TOP-10 задач за ROI

> Відсортовано за спаданням ROI. Перші чотири — це «інженерна гігієна», яка лишає бібліотеку живою, а не розширена її можливості.

### 1. Прибрати `console.log` + додати ESLint із `no-console` та `no-restricted-syntax`
- **Проблема:** [TModalBox.vue:189](src/components/modal/TModalBox.vue#L189) забруднює консоль у production; відсутність lint'у пояснює, як це пройшло в реліз.
- **Ефект:** професійніший вигляд package.tgz у споживача, автоматичний bus-factor проти подібних помилок.
- **Зусилля:** S (< 1 год).
- **Віддача:** S/M — одноразово, але показник зрілості.
- **Ризики:** не вимикати надто багато правил — lint має приносити сигнал, не шум.
- **Перший крок:** додати `eslint.config.js` з `@vue/eslint-config-typescript` + `eslint-plugin-vue`; прибрати `console.log`; налаштувати pre-commit або CI-check.

### 2. Smoke-тести (Vitest + @testing-library/vue) для топ-5 компонентів
- **Проблема:** нуль тестів. Рефакторинг — російська рулетка.
- **Ефект:** перший regression ловиться CI, не продакшеном. Навіть 50 базових асерцій по `TSelect` (value-mode, loading, async race) + `TDatePicker` (range-логіка `onDayClick` з обміном start/end) + модалка (ESC → close, backdrop click) вкриють ~70% критичних шляхів.
- **Зусилля:** M (1-2 дні).
- **Віддача:** XL — кожен наступний рефакторинг дешевший на годину.
- **Ризики:** надмірно детерміновані snapshot-тести швидко стають ламкими; фокусуватися на поведінці, не на DOM.
- **Перший крок:** `npm i -D vitest @testing-library/vue jsdom`; стартовий тест `TButton.test.ts` з v-model і disabled; додати `npm test` до CI.

### 3. Уніфікувати `disabled`/`readonly`/`error`/`size` серед form-компонентів
- **Проблема:** див. [«Слабкі сторони #1»](#1-p0-непослідовний-disabledreadonlyerror-серед-form-компонентів). `TButton`/`TInput`/`TTextarea` не мають `disabled` в props.
- **Ефект:** Volar починає автокомплітити у шаблоні, TS-типи стають передбачувані, споживач пише `<TInput disabled :error="...">` замість `<TInput :class="{'is-disabled': d}" @focus="...">`.
- **Зусилля:** M (2-3 години ручної роботи + невеликий breaking patch через `error`-слот).
- **Віддача:** L — стосується 8+ компонентів, впливає на кожен виклик у кожному споживачі.
- **Ризики:** breaking change, якщо `disabled` досі десь потрапляв через `$attrs` на wrapper, а тепер — тільки на `<input>`; треба пройтися по playground'у.
- **Перший крок:** створити `FormFieldProps` у [src/components/types.ts](src/components/types.ts), додати `disabled?, readonly?, error?: string, hint?: string` — і спредити в `TInput`/`TTextarea`/`TSelect`/`TButton`. Додати slot `error` для `TInput`.

### 4. Винести ESC-глобальний слухач із `TModalBox` у `TModalBoxHost` + виправити модальний singleton
- **Проблема:** див. #2 + #4 у «Слабких сторонах». N модалів = N слухачів + закриваються всі одночасно.
- **Ефект:** правильна UX-семантика (ESC → top-most). Менше slot'ів на `window`. Можливість тестувати модалки без `mount().unmount()` навколо.
- **Зусилля:** M (1 день).
- **Віддача:** L — виправляє одразу race-умови, поведінку, і частково SSR-фрагільність.
- **Ризики:** breaking, якщо хтось залежить від поточної (неправильної) поведінки «закривається все на ESC».
- **Перший крок:** в `TModalBoxHost` додати `window.keydown` listener, який читає `modalManager.activeModalId.value` і закриває його, якщо `blockingDismissible`. Видалити listener з `TModalBox`. Додати `console.log` → прибрати.

### 5. Типізувати `TDatePicker` та `TSelect` generics (+ виправити falsy-bug)
- **Проблема:** `TDatePicker.modelValue: any` ([TDatePicker.vue:125](src/components/TDatePicker.vue#L125)); `TSelect.isSelected` ламається на `0`/`""`/`false` ([TSelect.vue:154-160](src/components/TSelect.vue#L154-L160)).
- **Ефект:** consumer отримує типізований модел. `<TSelect :options="[0,1,2]" />` перестає бути пасткою.
- **Зусилля:** S-M.
- **Віддача:** M — покращує DX для двох найчастіше використовуваних компонентів.
- **Ризики:** generic на `<script setup>` у Vue 3.5+ синтаксично зручний, але може зіштовхнутись із циклом GlobalComponents (див. коментар у registry.ts). Треба перевірити.
- **Перший крок:** PR, що додає `TDatePickerValue<Mode>` дискриміновану union і generic на `TSelect<T>` з правильним `modelValue: T | null`.

### 6. Написати повноцінний README + CHANGELOG.md
- **Проблема:** [README.md](README.md) не пояснює, як встановити. Немає CHANGELOG попри 7 релізів.
- **Ефект:** зменшується залежність від автора. Споживач бачить, чого очікувати.
- **Зусилля:** S (4-6 годин).
- **Віддача:** M/L — бар'єр до адопції найнижчий за одну PR.
- **Ризики:** написати «for show» замість «for use» — уникнути, додавши copy-paste-ready snippets для Vite/Nuxt/Vue CLI.
- **Перший крок:** розділи Install, Usage (plugin + tree-shake), Theme, i18n roadmap, peer-deps explanation, SSR caveats.

### 7. Виправити `TDateInput`/`TDateTimeInput` — валідація реальних дат + пропи `format`/`placeholder`
- **Проблема:** [див. «Слабкі сторони #12»](#12-p1-tdateinputparsedate-не-валідує-реальні-дати) + хардкод локалі.
- **Ефект:** 31.02 не тихо перетворюється на 02.03. Англомовний апп не бачить кирилицю.
- **Зусилля:** S (години).
- **Віддача:** M — інвазивний баг, що може залишати silent data corruption у формах.
- **Ризики:** обережно з backward compatibility на форматах.
- **Перший крок:** додати `validateParsedDate(y,mo,d)` + пропи `placeholder`, `doneLabel` у `TDateTimeInput`.

### 8. `TFormField` wrapper + documented form-integration pattern
- **Проблема:** форми — головна use-case адмінки. Зараз немає `label`, `required`, `error` як єдиного патерну.
- **Ефект:** консистентність API. Один `<TFormField label="Email" :error="errors.email" required><TInput v-model="email"/></TFormField>`. Playground набуває реальних сценаріїв.
- **Зусилля:** M (1-2 дні).
- **Віддача:** L — виставляє бібліотеку як готову до B2B-форм.
- **Ризики:** інтеграція з VeeValidate/FormKit потребує додаткового шару — залишити на наступну ітерацію.
- **Перший крок:** новий компонент `TFormField.vue` + приклади в playground.

### 9. Додати `TTable` (мінімальна версія)
- **Проблема:** головний компонент, якого бракує для реальних product-dashboard'ів. Без нього t-components не закриває use case.
- **Ефект:** критичне розширення scope бібліотеки.
- **Зусилля:** L (тиждень+).
- **Віддача:** XL — ключова відсутня цеглина.
- **Ризики:** таблиці — найскладніший UI-компонент у будь-якій бібліотеці. Починати з «config-driven» версії, а не headless. Не намагатися вкрити virtual scrolling і sticky-columns одразу.
- **Перший крок:** специфікація props (columns, rows, keyField, sortable, loading, empty-slot, row-click, selection v-model) + playground з 3 прикладами.

### 10. Додати `publint`, `@arethetypeswrong/cli` та перевірку bundle-size у CI
- **Проблема:** package публікується без санітарної перевірки `exports`-мапи, CJS/ESM роздвоєння, правильності `.d.ts`. Розмір бандла не моніториться.
- **Ефект:** ловити проблеми до релізу, а не від bug-report'у.
- **Зусилля:** S (2-4 години).
- **Віддача:** M — профілактика.
- **Ризики:** `publint` може одразу показати помилки, які буде соромно бачити — і це теж добре.
- **Перший крок:** додати `npm i -D publint @arethetypeswrong/cli size-limit`; додати job у `release.yml`; фіксити знайдене.

## Додаток: спостереження по конкретних компонентах

### TButton
- Архітектура «variant → tokens; mode → properties» ([TButton.vue:187-191](src/components/TButton.vue#L187-L191)) — дуже добра. Залишити як зразок для інших.
- `size="fit"` ([TButton.vue:105-110](src/components/TButton.vue#L105-L110)) — додає `width: 100%` і `font-size: inherit`. Працює, але семантично «fit» — двозначна назва (contents-sized? parent-filling?). Перейменувати на `"block"` чи `"full"` для ясності.
- Немає `loading`-стану зі спінером.

### TButtonGroup
- `mandatory=false` дефолт дозволяє **зняти** виділення кліком на активну кнопку — це атиповий UX для радіо-подібних груп. Частіше хочеться `mandatory=true`. Задокументувати або змінити default.
- Генерик на `T extends string | number` у `TButtonGroupOption<T>` допоміг би.

### TInput
- `suffixIcon` + `clearable` — добра композиція.
- Немає `prefix`/`suffix` слотів (тільки іконки).
- Fokus/onClear на іконку через `@mousedown.prevent="inputRef?.focus()"` ([TInput.vue:39](src/components/TInput.vue#L39)) — елегантно.
- Відсутність `error`-слоту й `disabled`-пропа — див. ключові пункти.

### TTextarea
- Немає autosize.
- Хардкод `rows: 3`.
- Немає `maxlength`-лічильника.

### TSelect
- Бага falsy-значень (див. топ-5).
- `async loadOptions` з race-захистом — сильно.
- `valueMode: 'option' | 'value'` — класно, але документація лише в JSDoc-стилі. Винести в README.
- Немає multi-select.
- `@ts-ignore` чи `as TOption` у `getValue(props.modelValue as TOption)` ([TSelect.vue:159](src/components/TSelect.vue#L159)) коли modelValue — `string | number`, — небезпечний cast. Переписати з генерiком.

### TDropdown
- Найякісніший компонент бібліотеки (після `TTabs`).
- `customPanelStyle` приймає `string | Record` — добре, але конвенція в іншому проекті зазвичай CSSProperties. Добре, що є; варто задокументувати.
- У `updatePosition` vertical flip не враховує `top-*` placement при `bottom-overflow` симетрично — є edge-case, коли панель опиниться over trigger.

### TSwitch
- `size="fit"` у CSS без типу (див. пункт слабких).
- `inheritAttrs: false` + ручне розділення class/style vs rest ([TSwitch.vue:28-37](src/components/TSwitch.vue#L28-L37)) — коректно, але boilerplate. Можна через `defineProps` + Vue.attr fallthrough, якщо переглянути структуру.

### TTag
- Бага з `.t-tag--teal` (див. топ).
- Семантика іменування не збігається з рештою.
- Px-хардкоди замість токенів.

### TTooltip
- `calculatePosition` з `setTimeout(10)`-retry ([TTooltip.vue:40-42](src/components/TTooltip.vue#L40-L42)) — костиль. Правильне рішення: `await nextTick()` + `IntersectionObserver` або `ResizeObserver` на tooltipRef.
- Два `nextTick()` підряд у [TTooltip.vue:96-97](src/components/TTooltip.vue#L96-L97) — ок, але коментар пояснює причину (Teleport), це добре.
- `trigger="manual"` у типі є, але немає методів `.show()/.hide()` через `defineExpose`. Manual режим — мертвий код.

### TSidebar
- Жорсткий зв'язок з `vue-router` через `RouterLink` + `useRoute`. Для non-router-споживача — не підходить. Дати fallback на плоский `href` / `@click`.
- `menuItems` структура жорстко задана (`route`, `title`, `icon`, `activeRoutes`, `color`) — немає слоту на кастомний item. Для складніших menu з nested-груп — затісно.
- Анімація через `max-width` + `transform` ([TSidebar.vue:512-530](src/components/TSidebar.vue#L512-L530)) з явним уникненням `justify-content` — показує, що автор раніше наштовхувся на snap. Зберегти коментар.

### TTabs
- Еталон a11y. Зберегти.
- `watch(() => props.modelValue)` у [TTabs.vue:107-116](src/components/TTabs.vue#L107-L116) не робить нічого практичного — знайшли `found`, перевірили `disabled` і нічого не emit'нули. Схоже на недописаний guard. Або видалити, або додати fallback-selection.

### TCodeEditor
- Dynamic-import core — круто (див. сильні).
- Дублює theme-detection (див. слабкі).
- Немає `focus()` через `defineExpose`.

### TDatePicker
- Типізація `any` (див. слабкі).
- Чистенька логіка range з `rangePending`.
- Коментар «Hardcoded, matches previous behavior.» на [line 141-142](src/components/TDatePicker.vue#L141-L142) — залишки попередньої версії. Якщо `firstWeekday`/`showOtherMonths`/`highlightWeekend` — це вже пропи, реалізувати; якщо ні — прибрати коментар і зробити пропи.
- Нема клавіатурної навігації, `role="grid"`, `min`/`max`/`isDisabledDate`.

### TDateInput / TTimeInput / TDateTimeInput
- Всі три слідують одному патерну — це добре.
- Бага на 31.02.
- Хардкод локалі.
- `onBlur` з `setTimeout` + `commitText` в `TDateTimeInput` при `isOpen=false` — крихкий. Перенести логіку до централізованого `useInputDropdownSync` composable, щоб не підтримувати в трьох місцях.

### TModalBox / TModalBoxHost / useModalManager
- Architectural-level critique є в основній секції.
- Модалка має `resize: both` + `transform: translate3d` + `position: fixed; top: 0; left: 0; bottom: 0; right: 0` одночасно ([TModalBox.vue:265-280](src/components/modal/TModalBox.vue#L265-L280)) — це визначає дивну динаміку. Перегляньте CSS: `bottom: 0; right: 0` навряд потрібні разом із явним `width`/`height` від `useResizer`.
- Модалка за замовчуванням `.modal-box` одразу займає весь viewport, якщо resizer не встиг застосувати `width`/`height` — flash перед позиціюванням.
- `modal-backdrop` має `z-index: 3990`, а `.modal-box` — `3000`, `is-active` — `4000`, `is-blocking` — `4010`. При заблокованому активному модалі backdrop (`3990`) нижчий за активний модал (`4000`), але якщо `isBlocking` підніме до `4010` — ок. Якщо модалок декілька блокуючих — тільки один працює коректно.

### TInputModalBox
- Імперативний API через `inputs`-масив — зручно для простих prompt'ів.
- `attrs: Record<string, any>` знецінює типізацію — втрачається DX для вкладеного `TCodeEditor` тощо.
- «swtich» друкарська помилка.
- Hardcoded Cancel/Submit.

### TNotifications / useNotifications
- Singleton-стан ([useNotifications.ts:13-14](src/composables/useNotifications.ts#L13-L14)) — тут виправдано (глобальний toast-stream). Але те саме критикувалось у `useModalManager` — консистентна дизайн-рішення треба зробити: обидва або через provide/inject, або обидва module-global, і задокументувати.
- `setTimeout` для dismiss без cleanup, якщо `clear()` викликано до timeout — таймер вистрілить по неіснуючому id → filter нічого не знайде (ок, нешкідливо, але memory-leak при дуже високій частоті).
- Transition `translateX(20px)` ignore placement — якщо `bottom-left`, анімація все одно зправа. Фікс: класи per-placement.

### useTheme
- Чисто, SSR-guard є.
- Не експортує `isDark` — кожен споживач вираховує сам (див. `TCodeEditor`).

### useDragger / useResizer
- Добре структуровано. RAF для smooth drag — правильно.
- `{ passive: false }` відсутній для touchmove (див. топ).
- `eventListeners` registry з ручним find/indexOf ([useDragger.ts:50-55](src/components/modal/useDragger.ts#L50-L55)) — складно. Можна спростити через AbortController (`new AbortController(); addEventListener(..., { signal })` → один `abort()` на cleanup).
