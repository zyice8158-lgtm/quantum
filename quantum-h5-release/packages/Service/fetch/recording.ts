import { AppFetch } from "./appFetch";
import type { ShellReq, ShellRes, BaseRes } from "../type";

const BASE = "/LearningZone";
interface WebviewSizeRes extends Record<string, unknown> {
  IsSuccess: boolean;
}

interface SwitchModeTypeRes extends Record<string, unknown> {
  record: boolean;
  suggestion: boolean;
  isSuccess: boolean;
}

export const setRecordingMethod = (
    params: ShellReq<SwitchModeTypeRes>
  ): BaseRes<ShellRes<SwitchModeTypeRes>> => AppFetch.post(`${BASE}/StartRecord`,params);

export const setStopRecordingMethod = (
params: ShellReq<SwitchModeTypeRes>
): BaseRes<ShellRes<SwitchModeTypeRes>> => AppFetch.post(`${BASE}/StopRecord`,params);

export const setRecordTranslationLaguage = (
  params: ShellReq<SwitchModeTypeRes>
  ): BaseRes<ShellRes<SwitchModeTypeRes>> => AppFetch.post(`${BASE}/SetTranslationLaguage`,params);

export const setPauseRecord = (
  params: ShellReq<SwitchModeTypeRes>
  ): BaseRes<ShellRes<SwitchModeTypeRes>> => AppFetch.post(`${BASE}/PauseRecord`,params);
  
export const setResumeRecord = (
  params: ShellReq<SwitchModeTypeRes>
  ): BaseRes<ShellRes<SwitchModeTypeRes>> => AppFetch.post(`${BASE}/ResumeRecord`,params);