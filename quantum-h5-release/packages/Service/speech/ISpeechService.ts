import { BaseRes, ShellReq, ShellRes, MessageRes } from '../type'
export interface StartSpeechReq extends Record<string, unknown> {
  SpeakString: string,
}
export interface ISpeechService {
  startSpeech(params: ShellReq<StartSpeechReq>): Promise<BaseRes<ShellRes<Record<string, unknown>>>>;
  stopSpeech(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>>;
  startRecogniz(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>>;
  stopRecogniz(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>>;
  onRecognize(callback: (payload: MessageRes<Record<string, unknown>>) => void): void;
  offRecognize(callback: (payload: MessageRes<Record<string, unknown>>) => void): void;
  pauseRecogniz(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>>;
  resumeRecogniz(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>>;
}