const _useSessionStorage = () => {
  return {
    get: (key: string, defaultValue: unknown = null) => {
      const value = sessionStorage.getItem(key)
      if (value !== null && value !== undefined) {
        return JSON.parse(value)
      }
      return defaultValue
    },
    set: (key: string, value: unknown) => {
      if (undefined !== value && 'symbol' !== typeof value && 'function' !== typeof value) {
        sessionStorage.setItem(key, JSON.stringify(value))
      }
    },
    remove: (key: string) => {
      sessionStorage.removeItem(key)
    },
    clear: () => {
      sessionStorage.clear()
    },
  }
}

export const useSessionStorage = (scope?: string) => {
  const sessionStorage = _useSessionStorage()
  if(scope){
    // 前缀
    const prefix = `${scope}…`
    return {
      get: (key: string, defaultValue?: unknown) => {
        return sessionStorage.get(`${prefix}${key}`, defaultValue)
      },
      set: (key: string, value: unknown) => {
        sessionStorage.set(`${prefix}${key}`, value)
      },
      remove: (key: string) => {
        sessionStorage.remove(`${prefix}${key}`)
      },
      clear: () => {
        sessionStorage.clear()
      }
    }
  }else{
    return sessionStorage
  }
}
