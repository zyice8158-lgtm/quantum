import { reactive } from "vue";
import { useBroadcastChannel } from "@quantum/use";

const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');

const getInitTheme = (): "light" | "dark" => {
  return (
    localStorage.theme ||
    (matchMedia.matches ? "dark" : "light")
  );
};

const _store = reactive({
  theme: getInitTheme(),
});

matchMedia.addEventListener('change', (e) => {
  if (!localStorage.theme) {
    _store.theme = e.matches ? "dark" : "light";
    toggleThemeClass()
  }
});

export const ThemelStore = new Proxy(_store, {
  get(target, key: keyof typeof _store) {
    return target[key];
  },
  set() {
    if (import.meta.env.DEV) {
      console.warn("禁止修改全局状态");
    }
    return false;
  },
});

const toggleThemeClass = () => {
  const isDark = _store.theme === "dark";
  document.documentElement.classList.toggle("theme-dark", isDark);
}

export const switchTheme = (opts: { emit?: boolean } = {}) => {
  if (import.meta.env.DEV) {
    const { emit = true } = opts || {};
    if (emit) {
      ThemeChannel.emit2('themeChange', _store.theme);
    }
    _store.theme = localStorage.theme = _store.theme === "dark" ? "light" : "dark";
    toggleThemeClass()
  }
};

export const initTheme = () => {
  toggleThemeClass()
};

const ThemeChannel = useBroadcastChannel("theme", { immediate: true });

ThemeChannel.on('themeChange', (theme) => {
  _store.theme = theme;
  switchTheme({ emit: false });
})
