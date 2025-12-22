import { createI18n } from 'vue-i18n'
import enUS from './locales/en-US.json';
import zhCN from './locales/zh-CN.json';

const i18n = createI18n({
  locale: 'en-US',
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN,
    'en': enUS,
    'zh': zhCN,
  },
})

export default i18n

export type Language =
'en-US' | //English (US)
'en-GB' | //English (UK)
'en-IN' | //English (India)
'en-ZA' | //English (South Africa)
'es-ES' | //Spanish (Spain)
'es-MX' | //Spanish (Mexico)
'pt-BR' | //Portuguese (Brazil)
'zh-CN' | //Chinese China (Simplified)
'it-IT' | //Italian (IT)
'de-DE' | //German (DE)
'ar-EG' | //Arabic (Egypt)
'ja-JP' | //Japanese (JP)
'fr-FR' | //French (FR)
'pl-PL' | //Polish (PL)
'ro-RO'   //Romanian (RO)
