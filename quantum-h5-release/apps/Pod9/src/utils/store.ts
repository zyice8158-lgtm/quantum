import { reactive, toRefs } from 'vue';
import { Language } from './i18n';
import { Theme } from '@/apps/Expedia/types/type';

const state = reactive({
  theme: 'light',
  language: 'en-US',
});

const setTheme = (theme: Theme) => {
  state.theme = theme;

  const html = document.documentElement;
  if (theme.includes('light')) {
    html.classList.remove('theme-dark');
    html.classList.add('theme-light');
  } else if (theme.includes('dark')) {
    html.classList.remove('theme-light');
    html.classList.add('theme-dark');
  }
};

const setLanguage = (language: Language) => {
  state.language = language;
};

export const useStore = () => {
  return {
    ...toRefs(state),
    setTheme,
    setLanguage,
  };
};
