import { useI18n } from 'vue-i18n'
import type { Locale } from '@/i18n'
import { setI18nLanguage } from '@/i18n'

/**
 * 国际化 composable
 */
export const useLocale = () => {
  const { locale, t } = useI18n()

  /**
   * 切换语言
   * @param newLocale 新语言
   */
  const switchLocale = async (newLocale: Locale) => {
    await setI18nLanguage(newLocale)
  }

  /**
   * 获取当前语言
   */
  const currentLocale = (): Locale => {
    return locale.value as Locale
  }

  return {
    t,
    locale: currentLocale,
    switchLocale
  }
}