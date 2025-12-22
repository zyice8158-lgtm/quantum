import { AppFetch } from "./appFetch";
import type { ShellReq, ShellRes, BaseRes } from "../type";

const BASE = "/payAttention";
interface WebviewSizeRes extends Record<string, unknown> {
  IsSuccess: boolean;
}

interface SwitchModeTypeRes extends Record<string, unknown> {
  record: boolean;
  suggestion: boolean;
  isSuccess: boolean;
}

export const setModeStatus = (
  params: ShellReq<SwitchModeTypeRes>
): BaseRes<ShellRes<SwitchModeTypeRes>> => AppFetch.post(`${BASE}/switchMode`, params);

export const setRecordMethod = (
  params: ShellReq<Record<string, unknown>>,
  methodName: string
): BaseRes<ShellRes<WebviewSizeRes>> =>
  AppFetch.post(`${BASE}/${methodName}`, params);

export const setTranscription = (
  params: ShellReq<Record<string, unknown>>
): BaseRes<ShellRes<Record<string, unknown>>> =>
  AppFetch.post(`${BASE}/transcriptionAbility`, params);

export const setSwitchRecordWindow = (
  params: ShellReq<Record<string, unknown>>
): BaseRes<ShellRes<WebviewSizeRes>> =>
  AppFetch.post(`${BASE}/switchWindow`, params);

export const setSummaryAction = (
  params: ShellReq<Record<string, unknown>>
): BaseRes<ShellRes<WebviewSizeRes>> =>
  AppFetch.post(`${BASE}/summaryAction`, params);

export const setTranslationLaguage = (
  params: ShellReq<Record<string, unknown>>
): BaseRes<ShellRes<WebviewSizeRes>> =>
  AppFetch.post(`${BASE}/setTranslationLaguage`, params);

export const sendSummaryRes = (
  params: ShellReq<Record<string, unknown>>
): BaseRes<ShellRes<WebviewSizeRes>> =>
  AppFetch.post(`${BASE}/sendSummaryRes`, params);

export const triggerPayAttentionForCall = (
  params: ShellReq<Record<string, unknown>>
): BaseRes<ShellRes<WebviewSizeRes>> =>
  AppFetch.post(`${BASE}/triggerPayAttentionForCall`, params);
export const getTranslationResult = (
  params: ShellReq<Record<string, unknown>>
): BaseRes<ShellRes<WebviewSizeRes>> =>
  AppFetch.post(`${BASE}/getTranslationResult`, params);
export const getAudioUrl = (
  params: ShellReq<Record<string, unknown>>
): BaseRes<ShellRes<WebviewSizeRes>> =>
  AppFetch.post(`${BASE}/getAudioUrl`, params);
export const setCloseWindow = (
  params: ShellReq<Record<string, unknown>>
): BaseRes<ShellRes<WebviewSizeRes>> =>
  AppFetch.post(`${BASE}/closeWindow`, params);
export const setSwitchVoiceInput = (
  params: ShellReq<Record<string, unknown>>
): BaseRes<ShellRes<WebviewSizeRes>> =>
  AppFetch.post(`${BASE}/switchVoiceInput`, params);
export const sendExportContent = (
  params: ShellReq<Record<string, unknown>>
): BaseRes<ShellRes<WebviewSizeRes>> =>
  AppFetch.post(`${BASE}/sendExportContent`, params);
export const showMeetingRecord = (
  params: ShellReq<string>
): BaseRes<ShellRes<WebviewSizeRes>> =>
  AppFetch.post(`${BASE}/showMeetingRecord`, params);
