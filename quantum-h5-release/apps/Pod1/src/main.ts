import { createApp } from "vue";
import "./style/base.css";
import "./style/index.less";
import App from "./App.vue";
import routers from "@/routers";
import i18n, { initI18nLocale } from "@/i18n";
import { UseStorage } from "@quantum/use";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

import { longpress, hover, helper, automation } from "@/directives";

import { UseVolt } from '@libs/p-comps/volt'
import { getWindowInfo, makeWindowTypeChannel, WindowStore } from "./store/window";
import globalErrorHandler from './utils/GlobalErrorHandler';
import { getChatHistory } from "./store/chat";
import { syncSettingsAllConfig } from "./store/settings";
import Tooltip from 'primevue/tooltip';
import { initTheme } from '@libs/theme';
import { checkSetupApp } from '@/store'

(window as any).checkClickThrough = (e:{x:number, y:number}) => {
  const ratio = window.devicePixelRatio;
  const el = document.elementFromPoint(e.x/ratio, e.y/ratio) as HTMLElement;
  if (el == document.body || el == null || el == document.documentElement || el.id == 'app') {
    return true
  }
  return el.dataset.hasOwnProperty('clickThrough')
};

(async () => {
  await Promise.allSettled([
    initI18nLocale(),
    getWindowInfo(),
    syncSettingsAllConfig(),
    checkSetupApp(),
  ]);
  initTheme();
  makeWindowTypeChannel();
  if (WindowStore.current.type == 'FullView') {
    getChatHistory()
  }
  const app = createApp(App);
  globalErrorHandler.init(app);
  app.use(routers)
    .use(i18n)
    .use(ConfirmationService)
    .use(ToastService)
    .use(UseStorage)
    .use(ElementPlus)
    .directive("automation", automation)
    .directive("longpress", longpress)
    .directive("hover", hover)
    .directive("helper", helper)
    .directive('tooltip', Tooltip)
    .use(UseVolt)
    .mount('#app')
})();
