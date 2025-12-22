import { contextBridge, ipcRenderer, IpcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { MESSAGE_BOX, ElectronApi } from '../types'


const api: ElectronApi = {
  hidWindow: () => ipcRenderer.invoke('hide-window'),
  saveToClipboard: (data: string) => ipcRenderer.invoke('save-to-clipboard', data),
  // 截图功能
  takeScreenshot: () => ipcRenderer.invoke('take-screenshot'),
  // 新增快捷键监听
  onScreenshotShortcut: (callback) => ipcRenderer.on('trigger-screenshot', callback),
  onScreenshotShortcutApp: (callback) => ipcRenderer.on('trigger-screenshot-app', callback),
  onShowSuggestion: (callback) => ipcRenderer.on('show-suggestion', callback),
  sendtoCsharp: (data: any) => {
    const res = ipcRenderer.invoke('sendto-csharp', data)
    console.log('sendto-csharp ipc', res)
    return res
  },
  onPreHide: (callback) => ipcRenderer.on('pre-hide', callback),
  saveImg: (data: string) => ipcRenderer.invoke('save-img', data)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

export default api