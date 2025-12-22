import 'virtual:svg-icons-register'

import { createApp } from 'vue'
import i18n from './utils/i18n/index'

import '@/style/index.css'

import App from './App.vue'

createApp(App).use(i18n).mount('#app')
