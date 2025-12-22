import { AppFetch } from '../index';
import { MockData, StreamAnswer } from '@libs/q-mock';
// import { StreamAnswer } from '@libs/q-mock';
export interface SendMessageParams {
  Data: {
    ChatText: string,
  },
  MessageSource: string,
  MessageDestination: string,
  MessageId: string,
  Timestamp: number,
}
export const chatInterface = (params: { query: string }) => {
  return AppFetch.stream(
    `https://10.183.152.98:5888/chat?query=${params.query}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream'
      },
      // signal: params.signal
    }
  )
}

export const sendMessageChat = (params: SendMessageParams) => {
  return AppFetch.post(
    `https://app/aiinput/senchat`,
    params
  )
}

export const chatService = (query: string, cb: (done: boolean, answer: StreamAnswer) => void) => {
  const res = new MockData().getStreamMockData(query, cb)
  console.log('chatService', res);
}