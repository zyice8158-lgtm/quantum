import { nextTick, Reactive, watch } from "vue";
import { useEventBus } from "../useEvent"
import { v4 as uuidv4 } from 'uuid';

const CurrentWinUUID = uuidv4()

const InstanceMap = new Map()

export const useBroadcastChannel = (name: string, opts?: {
  immediate: boolean
}) => {
  if (!InstanceMap.has(name)) {
    InstanceMap.set(name, new BroadcastChannel(name))
  }
  const { immediate } = opts || {}
  const instance = InstanceMap.get(name)

  const { on, once, off, emit: emitEvent } = useEventBus({ scopeName: name })

  const emit = <T = unknown>(type: string, data?: T) => {
    console.log(`[BroadcastChannel]:${name} emit2`, type, data)
    try {
      instance.postMessage({ type, winUUID: CurrentWinUUID, data: data && JSON.parse(JSON.stringify(data)) })
    } catch (error) {
      console.error(`[BroadcastChannel]:${name} Error:`, error)
    }
  }
  instance.onmessage = (({ data }: MessageEvent) => {
    if (data.winUUID != CurrentWinUUID) {
      console.log(`[BroadcastChannel]:${name} onmessage`, data.type, data.data)
      emitEvent(data.type, data.data)
    }
  })


  const onPingPong = (type: string, data?: unknown) => {
    on(`ping-${type}`, () => {
      emit(`pong-${type}`, typeof data == 'function' ? data() : data)
    })
  }

  const onPing = () => {
    emit(`pong-${name}`)
    onPingPong(name)
  }
  if (immediate) {
    onPing()
  }

  const waitPingPong = (type: string, delay: number = 20) => {
    return new Promise((resolve, reject) => {
      emit(`ping-${type}`)
      once(`pong-${type}`, resolve)
      if (delay) {
        setTimeout(() => {
          off(`pong-${type}`, resolve)
          reject(new Error(`[BroadcastChannel]:${name} waitPingPong timeout`))
        }, delay)
      }
    })
  }
  const waitReady = waitPingPong.bind(null, name, 0)

  const safeEmit = async (type: string, data?: unknown) => {
    console.log(`[BroadcastChannel]:${name} emit`, type, data)
    await waitReady()
    emit(type, data)
  }


  return {
    on,
    once,
    off,
    /** safe emit, make sure win ready */
    emit: safeEmit,
    /** emit without safe, please make sure win ready by yourself */
    emit2: emit,
    waitReady,
    /** listen ping-{name} and emit pong-{winName} */
    onPingPong,
    /** custom waitPingPong, make sure ready */
    waitPingPong,
    onPing,
  }
}

export const useBroadcastChannelStore = (name: string, Store: Reactive<Record<string, any>>, opts?: { immediate?: boolean }) => {
  const { immediate = true } = opts || {}
  const Channel = useBroadcastChannel(name);
  let changeBySelf = true
  Object.keys(Store).forEach((key: keyof typeof Store) => {
    watch(() => Store[key], (value) => {
      if (changeBySelf) {
        Channel.emit2(key, value)
      }
    }, {
      deep: true
    })
    Channel.on(key, async (value) => {
      changeBySelf = false
      Store[key] = value
      await nextTick()
      changeBySelf = true
    })
  })

  const syncData = () => {
    Channel.emit2('getData')
    Channel.on('getData', async () => {
      Channel.emit2('setData', Store)
    })
    Channel.once('setData', async (data) => {
      changeBySelf = false
      Object.assign(Store, data)
      await nextTick()
      changeBySelf = true
    })
  }
  if (immediate) {
    syncData()
  } else {
    Store.syncData = syncData
  }
  return Store
}
