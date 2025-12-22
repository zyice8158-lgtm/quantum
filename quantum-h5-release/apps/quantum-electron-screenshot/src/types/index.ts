export enum MESSAGE_TYPE {
  EXPLAIN = 'Explain',
  ANALYSIS = 'Analysis',
  SEARCHPKB = 'SearchPKB',
  ADDKNOWLEDGE = 'AddKnowledge'
}
export interface MESSAGE {
  type: MESSAGE_TYPE
  path?: string
  src?: string
}
export enum Method {
  SendScreenshotMethod = 'SendScreenshotMethod',
  SendStartUpScreenshotMethod = 'SendStartUpScreenshotMethod'
}
export interface MESSAGE_BOX {
  SessionId: 'guid'
  Method: Method
  TS: String
  Params: MESSAGE | { Source: 'LargeWindow' | 'MinWindow' }
  NeedReply?: 0 | 1 //0：是需要返回，1：不需要，不传默认为返回
}
export interface ElectronApi {
  // 截图功能相关
  hidWindow: () => Promise<void>
  takeScreenshot: () => Promise<string>
  saveToClipboard: (data: string) => Promise<void>
  saveImg: (data: string) => Promise<{ filePath: string; folderPath: string }>
  
  // 事件监听相关
  onScreenshotShortcut: (callback: (event: Electron.IpcRendererEvent, payload: any) => void) => Electron.IpcRenderer
  onScreenshotShortcutApp: (callback: (event: Electron.IpcRendererEvent, payload: any) => void) => Electron.IpcRenderer
  onShowSuggestion: (callback: (event: Electron.IpcRendererEvent, payload: any) => void) => Electron.IpcRenderer
  onPreHide: (callback: (event: Electron.IpcRendererEvent) => void) => Electron.IpcRenderer
  
  // 与C#通信相关
  sendtoCsharp: (data: any) => Promise<any>
}