import { AppFetch } from './appFetch'
import { BaseRes, ShellReq, ShellRes } from '../type'
import { StartSpeechReq } from '../speech/ISpeechService'
import { useStorage } from '@quantum/use'

const Base = '/ContextualPrompt'

export interface SmartSelectReq extends Record<string, unknown> {
  Words: string,
  Intention: string,
}
export interface ObtainScreenshotFileRes extends Record<string, unknown> {
  Base64ScreeMsgnShotImage: string,
}
export interface SendImageReq extends Record<string, unknown> {
  Msg: string,
  Type: string,
  SessionType: string,
  ImagePath: string,
}
export const startSpeech = async (params: ShellReq<StartSpeechReq>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/TTS/StartSpeech', params)
}
export const stopSpeech = async (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/TTS/StopSpeech', params)
}
export const startRecogniz = async (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/ASR/StartRecogniz', params)
}
export const stopRecogniz = async (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/ASR/StopRecogniz', params)
}
export const pauseRecogniz = async (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/ASR/PauseRecogniz', params)
}
export const resumeRecogniz = async (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/ASR/ResumeRecogniz', params)
}
export const getASRInitState = async (): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/ASR/GetInitState', {Data: {}})
}
export const changeASRLocale = async (params: ShellReq<{"Locale":String}>): BaseRes<ShellRes<{"IsSuccess":boolean}>> => {
  return AppFetch.post(Base + '/ASR/ChangeLocale', params)
}
export const changeTTSLocale = async (params: ShellReq<{"Locale":String}>): BaseRes<ShellRes<{"IsSuccess":boolean}>> => {
  return AppFetch.post(Base + '/TTS/ChangeLocale', params)
}
export const checkASRExists = async (params: ShellReq<{"Locale":String}>): BaseRes<ShellRes<{"IsExists":boolean}>> => {
  return AppFetch.post(Base + '/ASR/CheckExists', params)
}
export const checkTTSExists = async (params: ShellReq<{"Locale":String}>): BaseRes<ShellRes<{"IsExists":boolean}>> => {
  return AppFetch.post(Base + '/TTS/CheckExists', params)
}
export const initASR = async (): BaseRes<ShellRes<{"IsSuccess":boolean}>> => {
  return AppFetch.post(Base + '/ASR/Init', { Data: {} })
}
export const initTTS = async (): BaseRes<ShellRes<{"IsSuccess":boolean}>> => {
  return AppFetch.post(Base + '/TTS/Init', { Data: {} })
}
export const selectFile = (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/MM/SelectFile', params)
}

export const GetFilterSetting = () => {
  return AppFetch.post(Base + '/MM/GetFilterSetting', { Data: {} })
}
export const obtainScreenshotFile = (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<ObtainScreenshotFileRes>> => {
  return AppFetch.post(Base + '/ObtainScreenshotFile', params)
}
export const sendSmartSelectMessage = (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/SmartSelect/SendMessage', params)
}
export const sendResultToCSharp = (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/MM/GetResult', params)
}
// 文件入库
export const sendFileStorage = (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/MM/AddFileToPKB', params)
}
export const shareHelper = (params: ShellReq<{Text:string, SessionId:string}>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/ShareHelper', params)
}
export const sendRespTimeLudp = (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/RespTimeLudp', params)
}
export const HistorySessionMethod = {
  GetAllSession: 'GetAllSession',
  GetSessionHistory: 'GetSessionHistory',
  DeleteSessionHistory: 'DeleteSessionHistory',
  UpdateSessionName: 'UpdateSessionName',
  DeleteAllSessionHistory: 'DeleteAllSessionHistory',
  DeleteMultipleSession: 'DeleteMultipleSession',
  UDSSyn: 'UDSSyn',
  UploadUDS: 'UploadUDS',
  GenerateChatTitle: 'GenerateChatTitle',
}
const apiHistorySession = (params: {
  Data: {
    Method: string,
  }
}): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/HistorySession', {linkPostMessage: true, ...params })
}

export const apiGetAllSession = (): BaseRes<ShellRes<Record<string, unknown>>> => {
  return apiHistorySession({
    Data: {
      Method: HistorySessionMethod.GetAllSession,
    },
  })
}
export const apiGetSessionHistory = (params: {
  SessionId: string,

}): BaseRes<ShellRes<Record<string, unknown>>> => {
  return apiHistorySession({
    Data: {
      Method: HistorySessionMethod.GetSessionHistory,
      ...params,
    },
  })
}

export const apiDeleteSessionHistory = (params: {
  SessionId: string,
}): BaseRes<ShellRes<Record<string, unknown>>> => {
  return apiHistorySession({
    Data: {
      Method: HistorySessionMethod.DeleteSessionHistory,
      ...params,
    },
  })
}
export const apiUpdateSessionName = (params: {
  SessionId?: string,
  SessionName: string,
}): BaseRes<ShellRes<Record<string, unknown>>> => {
  return apiHistorySession({
    Data: {
      Method: HistorySessionMethod.UpdateSessionName,
      ...params,
    },
  })
}

export const apiDeleteAllSessionHistory = (): BaseRes<ShellRes<Record<string, unknown>>> => {
  return apiHistorySession({
    Data: {
      Method: HistorySessionMethod.DeleteAllSessionHistory,
    },
  })
}

export const apiDeleteMultipleSession = (params: {
  SessionIdList: string[],
}): BaseRes<ShellRes<Record<string, unknown>>> => {
  return apiHistorySession({
    Data: {
      Method: HistorySessionMethod.DeleteMultipleSession,
      ...params,
    },
  })
}

export const apiUDSSyn = (): BaseRes<ShellRes<Record<string, unknown>>> => {
  return apiHistorySession({
    Data: {
      Method: HistorySessionMethod.UDSSyn,
    },
  })
}

export const apiUploadUDS = (params: {
  SessionId: string,
}): BaseRes<ShellRes<Record<string, unknown>>> => {
  return apiHistorySession({
    Data: {
      Method: HistorySessionMethod.UploadUDS,
      ...params,
    },
  })
}
export const apiGenerateChatTitle = (params: {
  SessionId?: string,
  MessageList: string,
}): BaseRes<ShellRes<Record<string, unknown>>> => {
  return apiHistorySession({
    Data: {
      Method: HistorySessionMethod.GenerateChatTitle,
      ...params,
    },
  })
}
// 文件转换
export const sendFilesConvert = (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/MM/ConvertFiles', params)
}
export const getMockFileList = (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + '/MM/GetFileList', params)
}
export const trackEvent = (params: ShellReq<Record<string, unknown>>): void => {
  try {
    AppFetch.post(Base + '/Ludp/UploadDatas', params)
  } catch (error) {
    console.log(error)
  }
}
