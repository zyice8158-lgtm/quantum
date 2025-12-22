import { ElectronAPI } from '@electron-toolkit/preload'
import { ElectronApi } from '../types'
declare global {
  interface Window {
    electron: ElectronAPI
    api: ElectronApi
  }
}