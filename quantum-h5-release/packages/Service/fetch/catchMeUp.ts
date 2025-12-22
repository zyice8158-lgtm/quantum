import { AppFetch } from './appFetch'
import { BaseRes, ShellReq, ShellRes } from '../type'
interface CMUReplyI {
    "notificationKey": string;
    "deviceId": string;
    "actionName"?: string;
    actionType: string;
    actionData?: string;
}
const Base = '/CatchMeUp'

export interface CatchMeUpReplayReq extends Record<string, unknown> {
  ReplyContent: string,
}
export const invokeCatchMeUp = (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/cmu', params)
}
export const replyCatchMeUp = (params: CMUReplyI): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/reply', params)
}

export const sendCMUReply = (params: CMUReplyI) => {
  return AppFetch.post(
    `https://us-central1-cloud-nlp-217609.cloudfunctions.net/sendNotificationActionRequest`, 
    params
  )
}
export const getCatchMeUpSettings = (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/getNotificationApps', params);
}
export const setNotificationAppEnable = (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/setNotificationAppEnable', params);
}
export const sendCmuSummary = (): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/cmuSummary')
}
export const clearNotification = (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/clearNotification', params);
}
export const getPCName = (): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/getPCName', {"Type": "CMUPCName"});
}