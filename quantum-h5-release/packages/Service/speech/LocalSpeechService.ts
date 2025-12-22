import { BaseRes, ShellReq, ShellRes, MessageRes } from '../type.ts'
import { WebviewMessager } from '../message'
import { v4 as uuidv4 } from 'uuid'
import { ISpeechService, StartSpeechReq } from './ISpeechService.ts'
import { startRecogniz, stopRecogniz, startSpeech, stopSpeech, pauseRecogniz, resumeRecogniz } from '../fetch'

export class LocalSpeechService implements ISpeechService {
  private MessageId: string;
  private recognizeCallbacks: Array<(payload: MessageRes<Record<string, unknown>>) => void> = [];

  constructor() {
    this.MessageId = uuidv4();
  }

  async startSpeech(params: ShellReq<StartSpeechReq>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    return startSpeech(params);
  }
  async stopSpeech(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    return stopSpeech(params);
  }
  async startRecogniz(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    const MessageId = params.MessageId || uuidv4();
    // Remove all previous listeners for old MessageId
    if (this.MessageId && this.MessageId !== MessageId) {
      this.recognizeCallbacks.forEach(cb => {
        WebviewMessager.off?.(this.MessageId, cb);
      });
    }
    this.MessageId = MessageId;
    const defaultParams = { ...params, MessageId };
    // Register all current listeners for new MessageId
    this.recognizeCallbacks.forEach(cb => {
      WebviewMessager.on(this.MessageId, cb);
    });
    return startRecogniz(defaultParams);
  }

  async stopRecogniz(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    // Remove all listeners for current MessageId
    this.recognizeCallbacks.forEach(cb => {
      WebviewMessager.off?.(this.MessageId, cb);
    });
    return stopRecogniz(params);
  }

  onRecognize(callback: (payload: MessageRes<Record<string, unknown>>) => void) {
    // Prevent duplicate registration
    if (!this.recognizeCallbacks.includes(callback)) {
      this.recognizeCallbacks.push(callback);
      WebviewMessager.on(this.MessageId, callback);
    }
  }

  offRecognize(callback?: (payload: MessageRes<Record<string, unknown>>) => void) {
    if (callback) {
      const idx = this.recognizeCallbacks.indexOf(callback);
      if (idx !== -1) {
        this.recognizeCallbacks.splice(idx, 1);
        WebviewMessager.off?.(this.MessageId, callback);
      }
    } else {
      // Remove all if no callback specified
      this.recognizeCallbacks.forEach(cb => {
        WebviewMessager.off?.(this.MessageId, cb);
      });
      this.recognizeCallbacks = [];
    }
  }
  async pauseRecogniz(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    return pauseRecogniz(params);
  }
  async resumeRecogniz(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    return resumeRecogniz(params);
  }
}
