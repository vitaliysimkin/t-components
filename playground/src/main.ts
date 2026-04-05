import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { Icon } from '@iconify/vue'
import { createVuestic } from 'vuestic-ui'
import 'material-icons/iconfont/material-icons.css'
import '../../src/styles/index.css'

import App from './App.vue'
import ComponentsPage from './views/ComponentsPage.vue'

import TComponents from '@vitaliysimkin/t-components'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/components' },
    { path: '/components', name: 'components', component: ComponentsPage },
  ],
})

const app = createApp(App)
app.component('Icon', Icon)
app.use(createVuestic())
app.use(TComponents)
app.use(router)
app.mount('#app')
