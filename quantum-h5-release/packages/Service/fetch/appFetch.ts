import { FetchClient, FetchError, FetchResponse } from './Fetch'
import { v4 as uuidv4 } from 'uuid'
import { ShellReq } from '../type'
import { FetchRequestConfig } from "./Fetch";
import { MockData } from '@libs/q-mock';
import { EventBus } from '@quantum/use';
import { ToastEventBus } from 'primevue';

export const baseURL = 'https://quantumapp.locallenovo'
export const AppFetch = new FetchClient({
  baseURL,
  // baseURL: 'https://app',
  timeout: 30_000,
})
AppFetch.useRequestInterceptor((config: FetchRequestConfig, url?: string) => {

  const data = config.data as ShellReq<Record<string, unknown>> || {} as ShellReq<Record<string, unknown>>;
  if (config.method == 'POST') {
    data.MessageId = data.MessageId || uuidv4();
    data.Timestamp = data.Timestamp || Date.now();
    data.MessageSource = data.MessageSource || '';
    if ('linkPostMessage' in data) {
      config['linkPostMessage'] = data.linkPostMessage
      delete data.linkPostMessage
    }
    config.data = data;
  }
  if (import.meta.env.VITE_IS_MOCK === 'true') {
    const mockData = new MockData().getMockData(url as any, config.data)
    console.log(mockData);

    if (mockData) {
      config.mock = {
        isMock: true,
        response: mockData
      }
    }
  }
  return config;
});

AppFetch.useResponseInterceptor(async (response: FetchResponse) => {
  console.log('linkPostMessage0', response);
  if (response.status === 200 && response.config.method === 'POST' && response.config.linkPostMessage && (response.data as any)?.MessageId) {
    const MessageId = (response.data as any)?.MessageId
    const linkPostMessage = response.config.linkPostMessage
    const onMessageType = typeof linkPostMessage === 'string' ? linkPostMessage : MessageId
    console.log('linkPostMessage', response);

    return new Promise((resolve, reject) => {
      console.log('linkPostMessage', onMessageType);

      let timer: number | null = null
      const resolveFn = (data: any) => {
        if (timer) clearTimeout(timer)
        EventBus.off(onMessageType, fn)
        response.data = data
        resolve(response)
      }
      const fn = (data: any) => {
        if ('IsDone' in data.Data) {
          if (data.Data.IsDone) {
            resolveFn(data)
          }
        } else if ('IsSuccess' in data.Data) {
          EventBus.off(onMessageType, fn)
          if (data.Data.IsSuccess) {
            resolveFn(data)
          } else {
            reject(data)
          }
        } else {
          resolveFn(data)
        }
      }
      EventBus.on(onMessageType, fn)
      if (response.config.timeout) {
        timer = setTimeout(() => {
          EventBus.clear(onMessageType)
          const msg = `URL:${response.config.url}, Request timed out after ${response.config.timeout}ms`
          ToastEventBus.emit('add', {
            severity: 'error',
            summary: 'Request Timeout',
            detail: msg,
            life: 3000
          })
          reject(new FetchError(msg, 408, response.config))
        }, response.config.timeout)
      }
    })
  }
  return response
})


