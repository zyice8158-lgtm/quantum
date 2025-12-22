import { MessageReq, MessageRes } from "../type";
import { v4 as uuidv4 } from 'uuid';
// import { eventBus } from './EventBus';
import { chatService } from "../ChatService";
import { StreamAnswer } from "@libs/q-mock";
import { AnswerActionType, ChatStatus } from "@libs/p-comps";
import { EventBus } from "@quantum/use";

// Webview communication related error
export class WebviewError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'WebviewError';
  }
}
//TODO temp for QTC
function formatChatMessage(data: {
  chatMsg: string,
  chatType: string
}) {
  const { chatMsg, chatType } = data;
  const responseAnswer = {
    status: ChatStatus.ONGOING,
    response: chatMsg,
    content: chatMsg,
    answerData: {
      actionType: AnswerActionType.TEXT,
    }
  }
  console.log('formatChatMessage', data);
  return new StreamAnswer(responseAnswer)
}
// Stream message error handler type
export type StreamErrorHandler = (error: unknown) => void;

// Message ID generator
export function generateMessageId(): string {
  return uuidv4();
}

let isInitialized = false;

// Initialization
function init() {
  if (isInitialized) return;
  isInitialized = true;
  // debugger
  // console.log('1231231312', import.meta.env.VITE_IS_MOCK);
  if (import.meta.env.VITE_IS_MOCK === 'true') {

    (window as any).chrome.webview = new EventTarget()
    //.addEventListener('message', handleMessageEvent);

  }


  (window as any).chrome?.webview?.addEventListener('message', handleMessageEvent);
}

// Message event handler
function handleMessageEvent(event: MessageEvent) {
  const msgData = event.data as MessageRes<Record<string, unknown>>;
  const { MessageId, MessageMethod } = msgData;
  console.log('收到消息了--------', MessageId, MessageMethod, msgData);
  // Stream response
  if (MessageId) {
    EventBus.emit(MessageId, msgData);
  }

  // Event subscription
  if (MessageMethod) {
    EventBus.emit(MessageMethod, msgData);
  }
  if (!MessageId && !MessageMethod) {
    console.log('收到消息了--------miss MessageId or MessageMethod', msgData);
  }
}

const MESSAGE_CONFIG = {
  DEFAULT_TIMEOUT: 600000
};

/**
 * Send stream message
 */
function sendStreamMessage<T extends Record<string, unknown>>(
  message: MessageReq<T>,
  handlers: {
    onData: (chunk: unknown) => void;
    onDone: () => void;
    onError?: StreamErrorHandler;
  }
): { MessageId: string, Abort: () => void } {
  init();
  const MessageId = message.MessageId || generateMessageId();
  const Timestamp = message.Timestamp || Date.now();
  const payload = { ...message, MessageId, Timestamp };
  console.log('message', message);

  const { onData, onDone, onError = (err) => console.error('Stream error:', err) } = handlers;

  let finished = false;
  let timeout: ReturnType<typeof setTimeout>;
  function cleanup() {
    finished = true;
    clearTimeout(timeout);
    EventBus.clear(MessageId);
  }
  function Abort() {
    onError(new WebviewError(`Stream aborted: ${MessageId}`, 499, { messageId: MessageId, aborted: true }));
    cleanup();
  }

  function resetTimeout() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (!finished) {
        cleanup();
        onError(new WebviewError('Stream timeout', 408, { messageId: MessageId }));
      }
    }, MESSAGE_CONFIG.DEFAULT_TIMEOUT);
  }

  const handler = (msgData: MessageRes<{ Chunk: string | unknown, IsDone: boolean }>) => {




    console.log('Received message in handler:', msgData);
    if (finished) return;
    const { ErrorCode, Data, data } = msgData;

    if (ErrorCode && ErrorCode !== 0) {
      cleanup();
      onError(msgData);
      return;
    }
    const { Chunk, IsDone } = Data || data || {};
    console.log('Received message in handler:', Data, Chunk);

    if (Chunk && onData) {
      let formatted = Chunk
      // if (import.meta.env.VITE_IS_MOCK === 'true') {
      //   formatted = formatChatMessage(Chunk as {
      //     chatMsg: string;
      //     chatType: string;
      //   })
      //   console.log('formatted', formatted);
      // }
      onData(formatted);
      resetTimeout();
    } else if (onData && Data) {
      onData(Data);
    }
    if (IsDone && onDone) {
      cleanup();
      onDone();
    }
  };
  EventBus.on(MessageId, handler);

  //TODO : mock data
  resetTimeout();
  console.log('发送消息了--------sendStreamMessage', payload, MessageId);
  try {
    if (import.meta.env.VITE_IS_MOCK === 'true') {
      // debugger


      console.log('process', process.env.NODE_ENV);
      chatService(message.Data.data, (done, answer) => {
        (window as any).chrome?.webview?.dispatchEvent(new MessageEvent('message', {
          data: { MessageId, Timestamp, payload, Data: { IsDone: done, Chunk: answer } }
        }))

      })

    } else {

      (window as any).chrome?.webview?.postMessage(payload);
    }

  } catch (err) {
    cleanup();
    onError(new WebviewError(`Failed to send message: ${MessageId}`, 404, { err }));
  }

  return { MessageId, Abort };
}
/**
 * Send a simple message without waiting for response
 */
function sendPostMessage<T extends Record<string, unknown>>(message: MessageReq<T>): void {
  init();
  const MessageId = message.MessageId || generateMessageId();
  const Timestamp = message.Timestamp || Date.now();
  const payload = { ...message, MessageId, Timestamp };
  console.log('发送消息了--------sendPostMessage', payload, MessageId);
  try {
    if (import.meta.env.VITE_IS_MOCK !== 'true') {
      (window as any).chrome?.webview?.postMessage(payload);
    }
  } catch (err) {
    console.error('Failed to send message:', err);
  }
}
/**
 * Event subscription
 */
function on(type: string, callback: (payload: MessageRes<Record<string, unknown>>) => void): () => void {
  init();
  return EventBus.on(type, callback);
}

/**
 * Cancel event subscription
 */
function off(type: string): void {
  EventBus.clear(type);
}

export const WebviewMessager = {
  sendStreamMessage,
  sendPostMessage,
  on,
  off
};


export const WebviewPostMessage = (message: MessageReq<any>, onData?: (Data: any) => void) => {
  return new Promise((resolve, reject) => {
    if (!message.MessageId) {
      message.MessageId = uuidv4()
    }
    const MessageId = message.MessageId;
    WebviewMessager.sendPostMessage(message);
    const fn = (data: any) => {
      if ('IsDone' in data.Data) {
        if (data.Data.IsDone) {
          WebviewMessager.off(MessageId)
          resolve(data.Data)
        } else {
          onData?.(data.Data)
        }
      } else if ('IsSuccess' in data.Data) {
        WebviewMessager.off(MessageId)
        if (data.Data.IsSuccess) {
          resolve(data.Data)
        } else {
          reject(data.Data)
        }
      } else {
        resolve(data.Data)
        WebviewMessager.off(MessageId)
      }
    }
    WebviewMessager.on(MessageId, fn)
  })
}
