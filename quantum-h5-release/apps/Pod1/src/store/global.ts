import { reactive } from "vue";


const _store = reactive({
  /** 侧边栏状态：true-展开，false-收起 */
  sidebar: true,
  /** global loading status */
  gLoading:false,
})

/** 全局状态：禁用修改 */
export const GlobalStore = new Proxy(_store, {
  get(target, key: keyof typeof _store) {
    return target[key]
  },
  set() {
    if (import.meta.env.DEV) {
      console.warn('禁止修改全局状态')
    }
    return false
  }
})

/** 修改全局状态 */
export const changeGlobalStore = (key: keyof typeof _store, value: any) => {
  _store[key] = value
}


export const toggleSidebar = () => {
  changeGlobalStore('sidebar', !GlobalStore.sidebar)
}