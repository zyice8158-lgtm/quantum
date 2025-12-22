import { AppFetch } from './appFetch'
import { BaseRes, ShellReq, ShellRes } from '../type'
const Base = '/SmartSelect'

export interface SmartSelectRes extends Record<string, unknown> {
  CaptureText: string,
  ButtonList: Array<{
    Type: string,
    Value: string,
    Intention: string
  }>
}
export const getSmartSelectToolList = (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<SmartSelectRes>> => {
  return AppFetch.post(Base + '/GetData', params)
}
export const getSmartSelectDropdownList = (params: ShellReq<Record<string, unknown>>): BaseRes<ShellRes<SmartSelectRes>> => {
  return AppFetch.post(Base + '/GetReWriteList', params)
}