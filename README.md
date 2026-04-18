# t-components

Vue 3 бібліотека UI-компонентів із префіксом `T*` (TButton, TInput, TSelect, TDatePicker, TModalBox тощо), написана на TypeScript. Тема (light/dark/auto), tree-shakeable named-exports, Volar-типізація шаблонів «з коробки».

**Live examples / playground:** [vitaliysimkin.github.io/t-components](https://vitaliysimkin.github.io/t-components/)

---

## Installation

```bash
npm i @vitaliysimkin/t-components
```

Peer dependencies (їх треба мати у споживача):

```bash
npm i vue @iconify/vue @vueuse/core
# опційно — якщо використовуєш роутер-лінки в TSidebar / інших компонентах
npm i vue-router
```

Підтримувані версії: `vue ^3.5`, `@iconify/vue >=4`, `@vueuse/core >=10`, `vue-router >=4` (optional).

---

## Usage: global plugin

Найпростіший варіант — зареєструвати всі компоненти глобально:

```ts
// main.ts
import { createApp } from 'vue'
import TComponents from '@vitaliysimkin/t-components'
import '@vitaliysimkin/t-components/style.css'
import App from './App.vue'

createApp(App).use(TComponents).mount('#app')
```

Після цього `<TButton />`, `<TInput />` тощо доступні в шаблонах без імпортів. Volar/TS-підказки працюють одразу — див. секцію [TypeScript / Volar support](#typescript--volar-support).

---

## Usage: tree-shaking (named imports)

Якщо хочеш, щоб у bundle потрапляли лише реально використані компоненти — імпортуй їх іменовано:

```vue
<script setup lang="ts">
import { TButton, TInput, TSelect } from '@vitaliysimkin/t-components'
</script>

<template>
  <TButton>Click</TButton>
  <TInput v-model="value" />
</template>
```

**Trade-off:** треба імпортувати в кожному SFC, де використовуєш. Натомість `app.use(TComponents)` тягне весь registry в bundle, навіть якщо ти юзаєш 2 компоненти. Для невеликих додатків різниця неважлива; для великих — named imports зазвичай дають меншу `main` chunk.

CSS треба підключити один раз у точці входу в обох варіантах — див. нижче.

---

## CSS import

Стилі поставляються одним файлом. Імпортуй його у своєму entry-point:

```ts
import '@vitaliysimkin/t-components/style.css'
```

Цей файл містить base-токени (кольори, відступи, typography) і стилі компонентів. Без нього компоненти будуть виглядати зламано.

---

## Theme (light / dark / auto)

Бібліотека керує темою через класи `html.dark` і `html.light` на `<html>` — переключення робиться через composable `useTheme()`:

```vue
<script setup lang="ts">
import { useTheme } from '@vitaliysimkin/t-components'

const { currentTheme, applyTheme } = useTheme()
// currentTheme: Ref<'light' | 'dark' | 'auto'>
</script>

<template>
  <select v-model="currentTheme">
    <option value="light">Light</option>
    <option value="dark">Dark</option>
    <option value="auto">Auto (system)</option>
  </select>
</template>
```

За замовчанням режим `auto` — підхоплюється `prefers-color-scheme`. Вибір зберігається в `localStorage` під ключем `theme`.

### FOUC (flash of unstyled content)

Тема застосовується під час завантаження модуля бібліотеки — якщо це важливо уникнути «миготіння» на першому рендері, додай inline-скрипт у `<head>` *до* завантаження JS-бандла, щоб виставити клас наперед:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem('theme') || 'auto'
      var dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.classList.add(dark ? 'dark' : 'light')
    } catch (e) {}
  })()
</script>
```

---

## Компоненти (короткий перелік)

Форми: `TButton`, `TButtonGroup`, `TInput`, `TTextarea`, `TSelect`, `TSwitch`, `TTag`, `TDateInput`, `TTimeInput`, `TDateTimeInput`, `TTimePicker`, `TDatePicker`, `TCodeEditor`.

Навігація / лейаут: `TTabs`, `TSidebar`, `TDropdown`, `TTooltip`.

Оверлеї / сповіщення: `TModalBox`, `TModalBoxHost`, `TInputModalBox`, `TNotifications`.

Живі приклади кожного — в [playground](https://vitaliysimkin.github.io/t-components/).

---

## TypeScript / Volar support

Підказки по `T*`-компонентах у `.vue`-шаблонах споживача (autocomplete тегів, типи `props`/`emits`, `Ctrl+Click` до визначення) працюють із коробки після встановлення пакета й підключення плагіна в `main.ts` — без додаткових `shims.d.ts` та без імпортів типів. Якщо у VSCode підказки не з'явились після оновлення версії — `Vue: Restart Vue Server` через Command Palette.

---

## Peer dependencies — чому саме такі

- **`vue ^3.5`** — власне фреймворк.
- **`@iconify/vue`** — обов'язковий: всі компоненти малюють іконки через `<Icon />` з iconify. Щоб не дублювати іконкові пакети в bundle і не нав'язувати конкретний набір — винесено в peer.
- **`@vueuse/core`** — обов'язковий: використовується всередині TDatePicker, TDropdown, TModalBox тощо (`useEventListener`, `onClickOutside`, `useElementBounding`, ...). Peer, щоб не роздвоювати реактивну бібліотеку в споживача.
- **`vue-router`** — **optional**. Потрібен лише якщо `TSidebar`/інші навігаційні компоненти викликаються з `<router-link>`-логікою. Якщо не потрібен — просто не встановлюй.

---

## SSR caveats

Повна SSR-підтримка **наразі не гарантується**. Конкретні місця, які читають браузерне середовище:

- `useTheme` — читає `localStorage` і `window.matchMedia` (на модулі, під `typeof window !== 'undefined'` guard'ами, але все одно модуль має module-level state).
- `useNotifications` — module-level реактивний store, створюється один на процес.
- `modalManager` / `useModalManager` — module-level singleton-state для стеку модалок.

Для пурового SSR (Nuxt з `ssr: true` без client-only wrapping) ці composables можуть поводитися неочікувано: шарений стан між запитами, `hydration mismatch` через тему тощо. Якщо потрібен SSR — використовуй компоненти в `<ClientOnly>` або еквіваленті, або чекай окремого релізу з SSR-safe рефакторингом.

---

## Публікація нової версії

Налаштовано через GitHub Actions — публікація відбувається автоматично при пуші git-тегу `v*`.

### Реліз однією командою

```bash
npm run release:patch   # 0.2.0 → 0.2.1
npm run release:minor   # 0.2.0 → 0.3.0
npm run release:major   # 0.2.0 → 1.0.0
```

Команда: піднімає версію в `package.json`, створює комміт + git-тег, пушить комміт і тег на GitHub. Далі workflow [.github/workflows/release.yml](.github/workflows/release.yml) збере пакет і опублікує його в npm.

### Одноразове налаштування (вже зроблено)

Публікація використовує **npm Trusted Publishing (OIDC)** — токен не потрібен. Довіра налаштована на npmjs.com: *Package → Settings → Publishing access → Trusted Publisher* (GitHub Actions, repo `vitaliysimkin/t-components`, workflow `release.yml`).

Після цього достатньо `npm run release:patch` — все інше зробить CI.
