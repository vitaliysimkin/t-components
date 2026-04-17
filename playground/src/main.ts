import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { Icon } from '@iconify/vue'
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

const app = createApp(App)
app.component('Icon', Icon)
app.use(TComponents)
app.use(router)
app.mount('#app')
