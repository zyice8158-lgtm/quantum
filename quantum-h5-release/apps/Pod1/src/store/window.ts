import { isWebView } from "@/utils";
import { apiWinChangeStatus, apiWinClose, apiWinDrag, apiWinInfo, apiWinMax, apiWinMin, apiWinOpen, apiWinRestore, changeAcrylic, MessageDirection, setSwitchRecordWindow, WebviewMessager, WinInfo, WinType } from "@libs/service";
import { reactive, withModifiers } from "vue";
import { AcrylicAreaType, changeSize } from "@libs/service";
import { useBroadcastChannel, useBroadcastChannelStore, useSessionStorage } from "@quantum/use";
import { BarStore, changeActiveBtn } from "./bar";
import { isRecordButtonActive, payAttentionStore, RecordingButtonStatus, setPayAttentionStore } from "./payAttention";
import router from "@/routers";

interface WindowSize {
  Width: number,
  Height: number
}

const SessionStorage = useSessionStorage('window')

export const WindowIdStore = useBroadcastChannelStore('WindowIdStore', reactive({
  'Bar': null,
  'Chat': null,
  'Fullview': null,
  'Camera': null,
  'Record': null,
}))

export const WindowStore = reactive({
  isMax: false,
  isMin: false,
  isFull: false,
  current: {} as WinInfo,
  acrylicAreas: {} as {
    [Name: string]: AcrylicAreaType
  },
  windowSize: {
    Width: window.innerWidth,
    Height: window.innerHeight
  } as WindowSize,
  windowId: SessionStorage.get('windowId', {
    camera: null,
    chat: null,
    record: null,
  }) as Record<string, string | null>
});


export const minWindow = () => {
  // WindowStore.isMin = !WindowStore.isMin
  apiWinMin({ id: WindowStore.current.id })
};
export const resetWindow = () => {
  if (WindowStore.isFull) {
    apiWinRestore({ id: WindowStore.current.id })
  } else {
    apiWinMax({ id: WindowStore.current.id })
  }
  WindowStore.isFull = !WindowStore.isFull
};

WebviewMessager.on('ResetWindow', ({ Data }) => {
  WindowStore.isFull = Data.IfMaxSize as boolean
})

export const windowChannel = useBroadcastChannel('Window')

export const closeWindow = async (id?: string) => {
  const winId = id || WindowStore.current.id
  for (const key in WindowIdStore) {
    if (key != 'Bar' &&  WindowIdStore[key] == winId) {
      WindowIdStore[key] = null
    }
  }

  return apiWinClose({ id: winId })
};

WebviewMessager.on('ClosePopWindow', ({ Data }: any) => {
  if (Data.IsClose) {
    WindowIdStore[Data.WinType] = null
  }
})


type WithModifiersParams = Parameters<typeof withModifiers>
export const stopModifiers = (fn: WithModifiersParams[0] = (() => 0), modifiers: WithModifiersParams[1] = ['stop']) => withModifiers(fn, modifiers as any)

/** use onMousedown Event to start drag window */
export const startDragWindow = (e: MouseEvent) => {
  let startX = e.clientX;
  let startY = e.clientY;
  let isDragging = false;

  const handleMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = Math.abs(moveEvent.clientX - startX);
    const deltaY = Math.abs(moveEvent.clientY - startY);

    if (!isDragging && (deltaX > 1 || deltaY > 1)) {
      isDragging = true;
      apiWinDrag({ id: WindowStore.current.id })
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};


// 获取窗口信息
export const getWindowInfo = async () => {
  try {
    const { data } = await apiWinInfo()
    WindowStore.current = JSON.parse(data.Data)
    const { type, id } = WindowStore.current
    WindowIdStore[type] = id
  } catch (_) {
    if (!isWebView) {
      WindowStore.current = {
        id: Math.random().toString(36).substring(2),
        type: 'Bar',
        status: 'NORMAL',
        width: 0,
        height: 0
      }
    }
  }
}

export const makeWindowTypeChannel = () => {
  windowChannel.onPingPong(WindowStore.current.type, WindowStore.current)
}

const NewWindowPromise = Object.create(null)

/** 打开新窗口 */
export const openNewWindow = async (type: WinType, hash: string) => {
  if (type !== 'Bar') {
    try {
      const winInfo = await windowChannel.waitPingPong(type)
      console.log('获取窗口信息成功:', winInfo);
      return {
        data: {
          Data: winInfo
        }
      }
    } catch (_) { }
  }
  if (isWebView) {
    const winKey = type + hash
    if (!NewWindowPromise[winKey]) {
      NewWindowPromise[winKey] = apiWinOpen({ type, hash })
      NewWindowPromise[winKey].finally(() => {
        delete NewWindowPromise[winKey]
      })
    }
    return NewWindowPromise[winKey]
  } else {
    window.open(`${location.origin}${location.pathname}${hash}`, '_blank');
    return {
      data: {
        Data: { id: '', }
      }
    }
  }
}

export const closePayAttentionWin = async (isShow: boolean) => {
  setSwitchRecordWindow({ MessageSource: "windowRecord1", Data: { isShow } });

  if (WindowIdStore.Chat) {
    await closeWindow(WindowIdStore.Chat)
  }
}

export const closeQuantumAppBar = () => {
  closeWindow(WindowIdStore.Bar)
  if (WindowIdStore.Chat) {
    closeWindow(WindowIdStore.Chat)
  }
  if (BarStore.activeBtn == 'live') {
    changeActiveBtn('')
  }
  if (payAttentionStore.recordingButtonStatus !== RecordingButtonStatus.Default) {
    setSwitchRecordWindow({ MessageSource: "window2", Data: { isShow: false } })
  }
}

export const openQuantumAppWin = async (hash: string = `#/quantum/chat`) => {
  await openNewWindow('FullView', hash)
  closeQuantumAppBar()
}

export const openQuantumBarWin = async (hash: string) => {
  await openNewWindow('Bar', hash)
  closeWindow()
}

export const openQuantumChatWin = async (hash: string) => {
  const { data: { Data } } = await openNewWindow('Chat', hash)
  WindowIdStore.Chat = Data.id;
  if (payAttentionStore.recordingButtonStatus !== RecordingButtonStatus.Default) {
    setSwitchRecordWindow({ MessageSource: "window2", Data: { isShow: false } })
  }
  if (!isRecordButtonActive.value) {
    setPayAttentionStore('recordingButtonStatus', RecordingButtonStatus.Default);
  }
}

export const openQuantumCameraWin = async () => {
  await openNewWindow('Camera', '')
}


export const updateWindowSize = (windowSize: WindowSize) => {
  const { Width, Height } = windowSize
  WindowStore.windowSize = { Width, Height }
  return changeSize({
    id: WindowStore.current?.id,
    ...windowSize,
  })
}

export const updataAcrylic = (area: AcrylicAreaType) => {
  return
  // WindowStore.acrylicAreas[area.Name] = area
  // return changeAcrylic({
  //   id: WindowStore.current?.id,
  //   ...area
  // })
}
export const removeAcrylic = (areaName: string) => {
  delete WindowStore.acrylicAreas[areaName]
  return updataAcrylic({
    Name: areaName,
    Width: 0,
    Height: 0,
    PointX: 0,
    PointY: 0,
    CornerRadius: 0,
  })
}


export const changeWindowDisplayStatus = (Status: 'idle' | 'other') => {
  try {
    apiWinChangeStatus({ id: WindowStore.current.id, Status })
  } catch (error) {
  }
}

router.beforeEach((to) => {
  if (WindowStore.current.type === 'Bar') {
    if (to.name !== 'PromptBar') {
      changeWindowDisplayStatus('other')
    }
  }
})

