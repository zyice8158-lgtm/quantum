import { App } from 'vue'
import localforage from 'localforage'
import { cloneDeep, get as lodashGet, set as lodashSet, unset as lodashUnset } from 'lodash-es'

const state = {
  /** 未来会有一些统一的加解密、缓存时间等配置，暂时不做处理 */
  config: {}
}

export const useStorage = <T = unknown>(scoped: string, config?: Record<string, unknown>, localForageOptions?: LocalForageOptions) => {
  // oxlint-disable-next-line no-unused-vars
  const currentConfig = { ...state.config, ...config }
  const Store = localForageOptions ? localforage.createInstance(localForageOptions) : localforage
  const get = async (defaultValue?: T) => {
    const data = await Store.getItem(scoped) as T
    // ... data = xxx
    return data ?? cloneDeep(defaultValue)
  }
  const set = async (value: T) => {
    let data = JSON.parse(JSON.stringify(value))
    // ... data = xxx
    await Store.setItem(scoped, data)
  }
  const remove = async () => {
    await Store.removeItem(scoped)
  }

  const keys = async () => {
    return Store.keys()
  }
  return { get, set, remove, keys }
}
/**
 * 对象数组降级储存量
 * - 储存结构
 *   - [key1, key2]
 *   - key1: xxx
 *   - key2: xxx
 */
export const useListStorage = <T extends Record<string, unknown>>(opts: {
  /** 存储作用域 */
  scoped: string,
  /** 对象ID 字段名称 */
  key: string,
  /** 是否分块存储：默认启用 */
  useChunks?: boolean,
  config?: Record<string, unknown>
  localForageOptions?: LocalForageOptions
}) => {
  const { scoped, key: keyStr, useChunks = true, config, localForageOptions } = opts
  const listStorage = useStorage<(string | T)[]>(scoped, config, localForageOptions)

  const get = async (defaultValue?: T) => {
    if (useChunks) {
      const keys = (await listStorage.get([])) as string[]
      const storages = keys.map(key => useStorage<T>(key, config, localForageOptions))
      const datas = await Promise.all(storages.map(storage => storage.get(defaultValue)))
      return datas
    } else {
      return listStorage.get([])
    }
  }
  const set = async (values: T[]) => {
    if (useChunks) {
      const keys = values.map(value => `${scoped}_${value[keyStr]}`)
      await listStorage.set(keys)
      await Promise.all(values.map(value => useStorage(`${scoped}_${value[keyStr]}` as string, config, localForageOptions).set(value)))
    } else {
      listStorage.set(values)
    }
  }
  const push = async (value: T) => {
    if (useChunks) {
      const keys = (await listStorage.get([])) as string[]
      const key = `${scoped}_${value[keyStr]}`
      keys.push(key)
      await listStorage.set(keys)
      await useStorage(key, config, localForageOptions).set(value)
    } else {
      const list = (await listStorage.get([])) as T[]
      list.push(value)
      await listStorage.set(list)
      return list
    }
  }
  const unshift = async (value: T) => {
    if (useChunks) {
      const keys = (await listStorage.get([])) as string[]
      const key = `${scoped}_${value[keyStr]}`
      keys.unshift(key)
      await listStorage.set(keys)
      await useStorage(key, config, localForageOptions).set(value)
    } else {
      const list = (await listStorage.get([])) as T[]
      list.unshift(value)
      await listStorage.set(list)
      return list
    }
  }
  const remove = async (value: T) => {
    if (useChunks) {
      const keys = (await listStorage.get([])) as string[]
      const key = `${scoped}_${value[keyStr]}`
      const index = keys.indexOf(key)
      if (index > -1) {
        keys.splice(index, 1)
      }
      await listStorage.set(keys)
      await useStorage(key, config, localForageOptions).remove()
    } else {
      const list = (await listStorage.get([])) as T[]
      const index = list.findIndex(item => item[keyStr] === value[keyStr])
      if (index > -1) {
        list.splice(index, 1)
        await listStorage.set(list)
      }
      return list
    }
  }
  const find = async (value: T) => {
    if (useChunks) {
      const keys = (await listStorage.get([])) as string[]
      const key = `${scoped}_${value[keyStr]}`
      const index = keys.indexOf(key)
      if (index > -1) {
        return useStorage(key, config, localForageOptions).get()
      }
    } else {
      const list = (await listStorage.get([])) as T[]
      return list.find(item => item[keyStr] === value[keyStr])
    }
  }
  const update = async (value: T) => {
    if (useChunks) {
      const key = `${scoped}_${value[keyStr]}`
      await useStorage(key, config, localForageOptions).set(value)
    } else {
      const list = (await listStorage.get([])) as T[]
      const index = list.findIndex(item => item[keyStr] === value[keyStr])
      if (index > -1) {
        list.splice(index, 1, value)
        await listStorage.set(list)
      }
      return list
    }
  }
  const clear = async () => {
    if (useChunks) {
      const keys = (await listStorage.get([])) as string[]
      await Promise.all(keys.map(key => useStorage(key, config, localForageOptions).remove()))
    }
    await listStorage.remove()
  }
  return { get, set, push, unshift, remove, find, update, clear }
}

/** 对象存储 简化操作 */
export const useObjStorage = (scoped: string, config?: Record<string, unknown>, localForageOptions?: LocalForageOptions) => {
  const Storage = useStorage<any>(scoped, config, localForageOptions)
  const get = async (key?: any, defaultValue?: unknown) => {
    if (key === undefined) {
      return Storage.get(defaultValue ?? {})
    } else {
      const data = await Storage.get({})
      return lodashGet(data, key) ?? defaultValue

    }
  }
  const set = async (key: any, value: any) => {
    const data = await Storage.get({})
    lodashSet(data, key, value)
    Storage.set(data)
  }
  const remove = async (key: any) => {
    const data = await Storage.get({})
    lodashUnset(data, key)
    Storage.set(data)
  }
  const clear = async () => {
    await Storage.remove()
  }
  const reset = async (data={}) => {
    await Storage.set(data)
  }
  return {
    get,
    set,
    remove,
    clear,
    reset,
  }
}



export const UseStorage = {
  install: (_: App, options: { config?: Record<string, unknown> } = {}): void => {
    Object.assign(state.config, options.config)
  }
}
