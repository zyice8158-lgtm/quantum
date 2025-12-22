import { chatInterface } from '@libs/service';
import { ChatSDK, ChatStatus, SDKResponse, StreamAnswerType } from '@libs/p-comps'
import { historyItemType } from '@libs/p-comps/ChatBaseComponent/types'
import MarkdownIt from 'markdown-it'
import { WebviewMessager } from '@libs/service';

class MySDKImpl implements ChatSDK {
  streamController: AbortController | null = null
  dataCallback: ((data: StreamAnswerType) => void) | null = null
  markdownParser = new MarkdownIt()
  userId: string = ''

  constructor() {}

  init() {
  }

  async sendMessage(text: string, sessionId: string, isDeepThink: boolean, isWebSearch: boolean, history: historyItemType[], documentIds: Array<string>): Promise<SDKResponse> {
    
    WebviewMessager.sendStreamMessage(
      { Direction: 0, 
        MessageSource: 'pod6', 
        MessageDestination:'', 
        MessageMethod: 'AIGCChat', 
        Data:{query:text, sessionId, isDeepThink, isWebSearch, history, documentIds} 
      },
      { 
        onData: (data) => { 
          console.log('Stream data received:', data)
          const dataRes = {
                    content: data,
                    response: data,
                    requestId: '',
                    status: "done",
                    stepMode: "final_answer",
                    done:true,
                    errorCode:0,
                    errorMsg:"",
                    intentCategory:"GENERAL",
                    intentType:"GENERAL_GENERATION"
                    }

          this.dataCallback?.(dataRes)
          return { status: ChatStatus.FAILURE, response: '' }
        },
        onDone: () => {
          console.log('Stream done')
        },
        onError: (err) => {
          console.log('Stream error', err)
        }           
      }
    );

  }

  // async sendMessage(text: string, sessionId: string, isDeepThink: boolean, isWebSearch: boolean, history: historyItemType[], documentIds: Array<string>): Promise<SDKResponse> {

  //   WebviewMessager.sendStreamMessage({ Direction: 0, MessageSource: 'pod6', MessageDestination:'', MessageMethod: 'AIGCChat', Data:{query:text}}, {
  //     onData: (chunk) => {
  //       console.log('Stream data received:', chunk)
  //       const dataRes = {
  //                 content: chunk,
  //                 response: chunk,
  //                 requestId: '',
  //                 status: "done",
  //                 stepMode: "final_answer",
  //                 done:true,
  //                 errorCode:0,
  //                 errorMsg:"",
  //                 intentCategory:"GENERAL",
  //                 intentType:"GENERAL_GENERATION"
  //                 }

  //       this.dataCallback?.(dataRes)
  //       return { status: ChatStatus.FAILURE, response: '' }

  //     },
  //     onDone: () => {
  //       console.log('Stream done')
  //     },
  //     onError: (err) => {
  //       console.log('Stream error', err)
  //     }

  //   }


  //   )
    


  // }
  
  // async sendMessage(
  //   text: string,
  // ): Promise<SDKResponse> {
  //   this.streamController = new AbortController()
  //   let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

  //   try {
  //     const response = await chatInterface({
  //       query: text,
  //       // sessionId,
  //       // agentId: 'LR',
  //       // isStream: true,
  //       // isWebSearch,
  //       // isDeepThink,
  //       // history,
  //       // documentIds,
  //       // userId: this.userId,
  //       // signal: this.streamController.signal
  //     })

  //     reader = response.data.getReader()
  //     const decoder = new TextDecoder()
  //     let buffer = ''
  //     const a = 1;

  //     while (a === 1) {
  //       // 监听是否调用了 abort 来中止请求
  //       if (this.streamController?.signal.aborted) {
  //         console.log('Stream aborted')
  //         break
  //       }

  //       const { done, value } = await reader.read()
  //       if (done) break

  //       buffer += decoder.decode(value, { stream: true })
  //       console.log('buffer----------', buffer);
  //       const events = buffer.split('\n\n')
  //       buffer = events.pop() || '' // 保留未完成部分
  //       try {
  //         const resData = JSON.parse(buffer);
  //         const dataRes = {
  //           content: resData.chatAnswer,
  //           response: resData.chatAnswer,
  //           requestId: resData.uuid,
  //           status: "done",
  //           stepMode: "final_answer",
  //           done:true,
  //           errorCode:0,
  //           errorMsg:"",
  //           intentCategory:"GENERAL",
  //           intentType:"GENERAL_GENERATION"
  //         }
  //         if(resData.intentCategory === 'DEVICE_VANTAGE') {
  //           dataRes.content = 'OK'
  //         }
  //         this.dataCallback?.(dataRes)
  //       } catch(error) {
  //         console.log('error-------', error);
  //       }
  //       // events.forEach((event) => {
  //       //   if (event.startsWith('data: ')) {
  //       //     try {
  //       //       const data = JSON.parse(event.slice(6)) as StreamAnswerType
  //       //       data.content = data.response // 修正字段名，应为 response 而非 content
  //       //       console.log('data-----------', data);
  //       //       this.dataCallback?.(data) // 安全触发回调
  //       //     } catch (err) {
  //       //       console.error('SSE 解析失败:', err)
  //       //     }
  //       //   }
  //       // })
  //     }

  //     return { status: ChatStatus.FAILURE, response: '' }
  //   } catch (error) {
  //     // Handle errors related to the stream or other network issues
  //     if (error instanceof DOMException && error.name === 'AbortError') {
  //       console.log('Request aborted by user')
  //     } else {
  //       console.error(`Error chat: ${error instanceof Error ? error.message : 'Unknown error'}`)
  //     }
  //     throw error
  //   } finally {
  //     reader?.releaseLock()
  //     this.streamController = null
  //   }
  // }

  stopMessage(): void {
    // Abort the ongoing stream request if there is one
    if (this.streamController) {
      this.streamController.abort() // 中止流式请求
      this.streamController = null
      console.log('Stream aborted')
    }
  }

  setDataCallback(callback: (data: StreamAnswerType) => void): void {
    this.dataCallback = callback
  }
}

export const mySDK: ChatSDK = new MySDKImpl()
export default mySDK
