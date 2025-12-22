import './style/base.css';
import 'primeicons/primeicons.css';

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// import PrimeVue from "primevue/config";
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import '@libs/p-comps'
import { UseVolt } from '@libs/p-comps/volt'
const app = createApp(App)
app.use(ToastService);
app.use(router)
app.use(UseVolt);
app.directive('tooltip', Tooltip);
app.mount('#app')
