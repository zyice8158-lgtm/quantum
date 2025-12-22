import { AppFetch } from './appFetch'
import { BaseRes, ShellReq, ShellRes } from '../type'
import { EventBus } from '@quantum/use'

const Base = '/win'

export type WinType = 'Bar' | 'Chat' | 'FullView' | 'Camera' | 'Record'
export enum WinTypeEnum {
  Bar,
  Chat,
  FullView,
  Camera,
  Record
}

export type WinStatus = 'MAX' | 'MIN' | 'NORMAL'

export interface WinInfo {
  width: number
  height: number
  status: WinStatus
  type: WinType
  id: string
}



export interface WebviewSizeReq extends Record<string, unknown> {
  id: string,
  Width: number,
  Height: number,
  StartWidth?: number,                                 // 动画起始宽度
  StartHeight?: number,                                // 启动高度
  TransitionDuration?: number,                         // 动画时长
  TransformOrigin?: [number, number],                  // 变换原点
  TransitionTiming?: [number, number, number, number], // 缓动曲线
}
export const changeSize = (params: WebviewSizeReq) => {
  return AppFetch.post(Base + '/changeSize', { Data: params })
}

export interface AcrylicAreaType {
  Name: string
  Width: number,                                       // 宽度 | 结束宽度
  Height: number,                                      // 高度 | 结束高度
  PointX: number,                                      // X坐标
  PointY: number,                                      // Y坐标
  CornerRadius: number,                                // 圆角
  StartWidth?: number,                                 // 动画起始宽度
  StartHeight?: number,                                // 启动高度
  TransitionDuration?: number,                         // 动画时长
  TransformOrigin?: [number, number],                  // 变换原点
  TransitionTiming?: [number, number, number, number], // 缓动曲线
}
export interface AcrylicReq extends Record<string, unknown>, AcrylicAreaType {
  id: string,
}

export const changeAcrylic = (params: AcrylicReq) => {
  return AppFetch.post(Base + '/changeAcrylic', { Data: params })
}

export const apiWinOpen = (params: { type: WinType, hash: string }): BaseRes<ShellRes<{ id: string }>> => {
  return AppFetch.post(Base + '/open', { Data: params })
}
export const apiWinInfo = (): any => {
  return AppFetch.post(Base + '/info', { Data: {} })
}
export const apiWinClose = (params: { id: string }): BaseRes<ShellRes<{ id: string }>> => {
  return AppFetch.post(Base + '/close', { Data: params })
}
export const apiWinDrag = (params: { id: string }) => {
  return AppFetch.post(Base + '/drag', { Data: params })
}
export const apiWinMax = (params: { id: string }) => {
  return AppFetch.post(Base + '/max', { Data: params })
}
export const apiWinMin = (params: { id: string }) => {
  return AppFetch.post(Base + '/min', { Data: params })
}
export const apiWinRestore = (params: { id: string }) => {
  return AppFetch.post(Base + '/restore', { Data: params })
}

/** set halo display */
export const apiWinDisplayHalo = (params: { hash: string, width: number, height: number }) => {
  return AppFetch.post(Base + '/displayHalo', { Data: params })
}

export const apiWinIsFirstStart = async () => {
  try {
    const { data: { Data } } = await AppFetch.post(Base + '/isFirstStart', { Data: {} }) as any
    return Data.result
  } catch (_) {
    return false
  }
}

export const apiWinChangeStatus = (params: { id: string, Status: 'idle' | 'other' }) => {
  return AppFetch.post(Base + '/changeStatus', { Data: params })
}
