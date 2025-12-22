import { createApp } from 'vue'
import './style/index.less'
import App from './App.vue'
import routers from '@/routers'
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
// createApp(App).mount('#app')
const app = createApp(App)
app.use(ElementPlus)
app.use(routers)
app.mount('#app')
