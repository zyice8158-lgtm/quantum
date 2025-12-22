import { AppFetch } from './appFetch'
import { BaseRes, ShellReq, ShellRes, MessageReq, MessageRes } from '../type'

const Base = '/appInformation'
export interface GetPodListParams extends Record<string, unknown> {
}
export interface GetPodListRes extends Record<string, unknown> {
    PodList: string[]

}

export interface WebviewSizeRes extends Record<string, unknown> {
    IsSuccess: boolean,
}
export interface openPopupReq extends Record<string, unknown> {
    IsOpen: boolean,
    Url: string,
    Width: number,
    Height: number,
    MinWidth?: number,
    MinHeight?: number,
    MaxWidth?: number,
    MaxHeight?: number,
}
export const getPodList = (params: ShellReq<GetPodListParams>): BaseRes<ShellRes<GetPodListRes>> => AppFetch.post(Base + '/getPodList', params)

export interface LaunchPodParams extends Record<string, unknown> {
    PodName: string
}
export interface LaunchPodRes extends Record<string, unknown> {
    PodName: string
}

export const launchPod = (params: ShellReq<LaunchPodParams>): BaseRes<ShellRes<LaunchPodRes>> => AppFetch.post(Base + '/launchPod', params)

export const webOnMounted = (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
    return AppFetch.post(Base + '/webOnMounted', params)
}
export const openPopup = (params: ShellReq<openPopupReq>): BaseRes<ShellRes<Record<string, unknown>>> => {
    return AppFetch.post(Base + '/openPopup', params)
}
export const openNativeFile = (params: MessageReq<Record<string, unknown>>): BaseRes<MessageRes<Record<string, unknown>>> => {
    return AppFetch.post(Base + '/openSettingURI', params)
}
