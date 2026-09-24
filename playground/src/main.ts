import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { Icon, loadIcons } from '@iconify/vue'
import 'material-icons/iconfont/material-icons.css'
import '../../src/styles/index.css'

import App from './App.vue'
import ComponentsPage from './views/ComponentsPage.vue'

import TComponents from '@vitaliysimkin/t-components'
import { elements } from './examples/index'

const firstSlug = elements[0]?.slug ?? 'button'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: `/components/${firstSlug}` },
    { path: '/components', redirect: `/components/${firstSlug}` },
    { path: '/components/:slug', name: 'components', component: ComponentsPage },
  ],
})

// <TIcon> renders `ticon:missing` for any icon that is not registered yet (it
// never fetches on its own). The playground uses many third-party icons, so we
// collect their names from the playground and library component sources at
// build time and preload them from the Iconify API before mounting.
const sources = import.meta.glob(['./**/*.{vue,ts}', '../../src/components/**/*.vue'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const iconNames = new Set<string>()
const iconRe = /['"]((?:material-symbols-light|material-symbols|mdi|simple-icons|system-uicons):[a-z0-9-]+)['"]/g
for (const src of Object.values(sources)) {
  for (const m of src.matchAll(iconRe)) iconNames.add(m[1])
}
// The callback also fires on partial progress; resolve only once nothing is pending.
await new Promise<void>((done) =>
  loadIcons([...iconNames], (_loaded, _missing, pending) => {
    if (!pending.length) done()
  }),
)

const app = createApp(App)
app.component('Icon', Icon)
app.use(TComponents)
app.use(router)
app.mount('#app')
