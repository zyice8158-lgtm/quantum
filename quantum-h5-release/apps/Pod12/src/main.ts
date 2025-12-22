import { createApp } from 'vue'
import './style/index.less'
import App from './App.vue'
import routers from '@/routers'

// createApp(App).mount('#app')
const app = createApp(App)
app.use(routers)
app.mount('#app')
