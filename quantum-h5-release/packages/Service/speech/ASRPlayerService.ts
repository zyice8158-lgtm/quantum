// ASRPlayerService.ts
import { WebviewMessager } from "../message";
import { startRecogniz, stopRecogniz, pauseRecogniz, resumeRecogniz } from "../fetch";
import { BaseRes, ShellReq, ShellRes, MessageRes } from '../type.ts';
import { v4 as uuidv4 } from 'uuid';

interface RecognizeCallback {
  (payload: MessageRes<Record<string, unknown>>): void;
}

class ASRPlayerService {
  private static instance: ASRPlayerService;
  private messageId: string;
  private callbacks: RecognizeCallback[] = [];

  private constructor() {
    this.messageId = uuidv4();
  }

  static getInstance(): ASRPlayerService {
    if (!ASRPlayerService.instance) {
      ASRPlayerService.instance = new ASRPlayerService();
    }
    return ASRPlayerService.instance;
  }

  async start(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    
    this.callbacks.forEach(cb => {
      WebviewMessager.on(this.messageId, cb);
    });
    const defaultParams = { ...params, MessageId: this.messageId };
    return startRecogniz(defaultParams);
  }

  async stop(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    WebviewMessager.off(this.messageId);
    return stopRecogniz(params);
  }

  on(callback: RecognizeCallback) {
    console.log('准备绑定-----', this.messageId,callback);
    if (!this.callbacks.includes(callback)) {
      this.callbacks.push(callback);
      WebviewMessager.on(this.messageId, callback);
    }
  }

  off() {
    this.callbacks = [];   
    WebviewMessager.off(this.messageId);
  }

  async pause(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    return pauseRecogniz(params);
  }

  async resume(params: ShellReq<Record<string, unknown>>): Promise<BaseRes<ShellRes<Record<string, unknown>>>> {
    return resumeRecogniz(params);
  }

  getCurrentMessageId(): string {
    return this.messageId;
  }
}

export const useASRPlayer = ASRPlayerService.getInstance();