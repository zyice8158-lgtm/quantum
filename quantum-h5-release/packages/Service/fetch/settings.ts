import { AppFetch } from './appFetch'
import { BaseRes, ShellReq, ShellRes } from '../type'
const Base = '/Settings'
import { LocalType } from 'public-type'
export interface SettingsReq extends Record<string, unknown> {
  [key: string]: Array<{
    Key: string,
    Value: string,
    LocalType: LocalType
  }>
}
export const getConfig = (): BaseRes<ShellRes<{

  type: string,
  contents: string
}>> => {
  return AppFetch.post(Base + '/GetConfig',)
}
export const getVersion = (): BaseRes<ShellRes<{

  version: string
}>> => {
  return AppFetch.post(Base + '/GetVersion',)
}
export const saveConfig = (params: Record<string, unknown>): BaseRes<ShellRes<{

  type: string,
  contents: string
}>> => {
  return AppFetch.post(Base + '/SaveConfig', params)
}
export const getUser = (): BaseRes<ShellRes<{

  type: string,
  contents: string
}>> => {
  return AppFetch.post(Base + '/User',)
}


const mcpBase = '/mcpmanagement'
export function getServerList(): BaseRes<ShellRes<{
  Chunk: string
}>> {

  return AppFetch.post(mcpBase + '/servers/list', {
    linkPostMessage: true,
  })
}
export function setServer(serverName: string, disable: boolean): BaseRes<ShellRes> {
  //disable api no feedback from core
  return AppFetch.post(mcpBase + '/servers/disable', {
    // linkPostMessage: true,
    Data: {
      serverName,
      disable
    }
  })
}
export function getToolList(serverName: string): BaseRes<ShellRes<{
  Chunk: string
}>> {

  return AppFetch.post(mcpBase + '/tools/list', {
    linkPostMessage: true,
    Data: {
      serverName,
    }
  })
}
export function setTool(toolName: string, disable: boolean): BaseRes<ShellRes> {

  return AppFetch.post(mcpBase + '/tools/disable', {
    // linkPostMessage: true,
    Data: {
      toolName,
      disable
    }
  })
}