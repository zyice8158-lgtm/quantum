import { createI18n } from 'vue-i18n'
import localforage from 'localforage'

// 语言包导入
import zh from './locales/zh.json'
import en from './locales/en.json'

// 定义支持的语言列表
export const SUPPORT_LOCALES = ['zh', 'en'] as const
export type Locale = typeof SUPPORT_LOCALES[number]

// 定义语言包类型
export type MessageSchema = typeof zh

// 本地存储键名
const LOCALE_KEY = 'user-locale'

// 获取系统语言
const getSystemLocale = (): Locale => {
  const systemLocale = navigator.language.split('-')[0]
  return SUPPORT_LOCALES.includes(systemLocale as Locale) ? (systemLocale as Locale) : 'en'
}

// 从本地存储获取语言设置
const getStoredLocale = async (): Promise<Locale | null> => {
  try {
    const storedLocale = await localforage.getItem<Locale>(LOCALE_KEY)
    return storedLocale && SUPPORT_LOCALES.includes(storedLocale) ? storedLocale : null
  } catch (error) {
    console.warn('Failed to get locale from localforage:', error)
    return null
  }
}

// 保存语言设置到本地存储
export const saveLocale = async (locale: Locale): Promise<void> => {
  try {
    await localforage.setItem(LOCALE_KEY, locale)
  } catch (error) {
    console.warn('Failed to save locale to localforage:', error)
  }
}

// 确定初始语言
const getInitialLocale = async (): Promise<Locale> => {
  // 首先检查本地存储
  const storedLocale = await getStoredLocale()
  if (storedLocale) {
    return storedLocale
  }
  
  // 如果本地存储没有设置，则使用系统语言
  return getSystemLocale()
}

// 创建 i18n 实例
const i18n = createI18n<[MessageSchema], Locale>({
  legacy: false, // 使用 Composition API 模式
  locale: 'zh', // 默认语言（稍后会更新）
  fallbackLocale: 'en', // 回退语言
  messages: {
    zh,
    en
  }
})

// 初始化 i18n 语言设置
export const initI18nLocale = async () => {
  const initialLocale = await getInitialLocale()
  await loadLocaleMessages(initialLocale)
  ;(i18n.global.locale as any).value = initialLocale
  if (typeof document !== 'undefined') {
    document.querySelector('html')?.setAttribute('lang', initialLocale)
  }
  return initialLocale
}

export default i18n

// 设置当前语言
export const setI18nLanguage = async (locale: Locale) => {
  // 确保语言包已加载
  await loadLocaleMessages(locale);
  (i18n.global.locale as any).value = locale
  // 保存到本地存储
  await saveLocale(locale)
  // 设置 HTML 文档的 lang 属性
  if (typeof document !== 'undefined') {
    document.querySelector('html')?.setAttribute('lang', locale)
  }
}

// 加载语言包
export const loadLocaleMessages = async (locale: Locale) => {
  // 如果语言包已经加载，直接返回
  if (i18n.global.availableLocales.includes(locale)) {
    return
  }
  
  // 动态导入语言包
  try {
    const messages = await import(`./locales/${locale}.json`)
    i18n.global.setLocaleMessage(locale, messages.default)
  } catch (error) {
    console.warn(`Failed to load locale messages for ${locale}:`, error)
  }
}