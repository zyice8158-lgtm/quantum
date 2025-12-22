import { ISpeechService, StartSpeechReq } from './ISpeechService'
import { BaseRes, ShellReq, ShellRes, MessageRes } from '../type.ts'
import { LocalSpeechService } from './LocalSpeechService'

export class SpeechService {
  private service: ISpeechService;
  isLiving: boolean = false;
  isRecognizing: boolean = false;

  private static instance: SpeechService;
  private constructor(service: ISpeechService) {
    this.service = service;
  }
  
  public static getInstance(): SpeechService {
    if (!this.instance) {
      this.instance = new SpeechService(new LocalSpeechService());
    }
    return this.instance;
  }
  startSpeech(params: ShellReq<StartSpeechReq>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    return this.service.startSpeech(params);
  }
  startPlainSpeech(params: ShellReq<StartSpeechReq>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    return this.service.startSpeech(params);
  }
  stopSpeech(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    return this.service.stopSpeech(params);
  }
  startRecogniz(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    this.isRecognizing = true;
    return this.service.startRecogniz(params);
  }
  stopRecogniz(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    this.isRecognizing = false;
    return this.service.stopRecogniz(params);
  }

  onRecognize(callback: (payload: MessageRes<Record<string, unknown>>) => void) {
    this.service.onRecognize(callback);
  }

  offRecognize(callback: (payload: MessageRes<Record<string, unknown>>) => void) {
    this.service.offRecognize(callback);
  }
  pauseRecogniz(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    return this.service.pauseRecogniz(params);
  }
  resumeRecogniz(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    return this.service.resumeRecogniz(params);
  }
  
}