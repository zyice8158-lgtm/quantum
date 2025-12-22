import { ChatSDK, ChatStatus, SDKResponse, StreamAnswerType, AnswerActionType, QuestionType } from '@libs/p-comps'
import MarkdownIt from 'markdown-it'
import { WebviewMessager, SpeechService, sendResultToCSharp } from '@libs/service';
interface TranscriptItem {
  duration: number
  isFinal: boolean
  msg: string
  offset: number
  speakerId: string
  targetLang: string
}

interface ParseResult {
  content: string
  transcriptContent: TranscriptItem[]
}

class MySDKImpl implements ChatSDK {
  streamController: AbortController | null = null
  dataCallback: ((data: StreamAnswerType) => void) | null = null
  markdownParser = new MarkdownIt({
    breaks: true,
  });
  webviewSendInstance: { MessageId: string, Abort: () => void };
  userId: string = ''
  result: string = ''
  constructor() { }

  init() {
  }
  async sendMessage(question: QuestionType): Promise<SDKResponse> {
    let params = { "prompt": question.payload?.content ?? question.content, }
    console.log('params-----------', params);
    // 初始化dataRes对象，用response记录每次数据变化
    const dataRes: StreamAnswerType = {
      content: '',
      response: '',
      status: ChatStatus.START,
      answerData: { actionType: AnswerActionType.TEXT, payload: { isShowOffline: false, isShowApp: false } },
    }
    this.webviewSendInstance = WebviewMessager.sendStreamMessage(
      {
        Direction: 0,
        MessageSource: '',
        MessageDestination: '',
        MessageMethod: 'sendPrompt',
        Data: params,
      },
      {
        onData: async (data) => {
          console.log('Stream data received:', data);
          if (typeof data === 'string') {
            const resContent = JSON.parse(data);
            dataRes.status = ChatStatus.DONE;
            console.log(resContent, 'resContent')
            // if (resContent.type === "transcript") {
            //   // 转录
            //   dataRes.answerData.actionType = AnswerActionType.TRANSCRIPTION;
            //   dataRes.answerData.transcription = resContent.receiveContent;
            //   dataRes.content = JSON.stringify(resContent.receiveContent);
            // } else
            if (resContent.type === "summary" || resContent.type === "transcript") {
              // 总结
              dataRes.content = resContent.receiveContent;
              dataRes.response = resContent.receiveContent;
            } else if (resContent.type === "unknow") {
              // 其他
              dataRes.content = "This content is not supported.";
            } else if (resContent.type === "exportWord") {
              // 导出
              dataRes.content = "Already exported to the Word document";
            }
            console.log("dataRes-----------", dataRes);
            this.dataCallback?.(dataRes);
          }
          return { status: ChatStatus.DONE, response: 'Not supported yet' }
        },
        onDone: () => {
          // console.log('Stream done')
          // sendResultToCSharp({ MessageSource: "Pod6", Data: { Result: this.result } })
          // dataRes.status = ChatStatus.DONE;
          // this.dataCallback?.(dataRes);
        },
        onError: (err: Error) => {
          console.log(dataRes, 'dataResdataResdataResdataResdataRes')
          console.log('Stream error', err);
          console.log(typeof err, err.message);
          // err.message
          // if (err.message.includes('aborted')) {
          //   dataRes.content = '';
          dataRes.status = ChatStatus.DONE;
          // } else {
          //   dataRes.content = '';
          //   dataRes.status = ChatStatus.TIMEOUT;
          // this.dataCallback(dataRes)
          // }
        }
      }
    );
  }

  handleParser(text: string): string {
    const plainText = this.getMarkdownPlainText(text);
    const errorString = '';

    return (!plainText || plainText.length === 0)
      ? errorString
      : this.markdownParser.render(text);
  }
  getMarkdownPlainText(markdown: string): string {
    return markdown
      .replace(/<[^>]+>/g, '')
      .replace(/[@#$%^&*]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  handleSpeaking(text: string): void {
    const speechService = SpeechService.getInstance();
    if (!speechService.isLiving) {
      speechService.startSpeech({ Data: { SpeakString: text } })
    }
  }
  handleBinarySpeaking(text: number[]): void {
    const speechService = SpeechService.getInstance();
    speechService.startSpeech({ Data: { SoundStream: text } })
  }

  stopMessage(): void {
    console.log('Stream aborted', this.webviewSendInstance?.Abort)
    if (this.webviewSendInstance?.Abort) {
      const dataRes: StreamAnswerType = {
        content: '',
        response: '',
        status: ChatStatus.DONE,
      }
      this.dataCallback?.(dataRes);
      this.webviewSendInstance.Abort();
    }
  }

  setDataCallback(callback: (data: StreamAnswerType) => void): void {
    this.dataCallback = callback
  }
  // 暂存，后续删除此方法
  sendScreenShotMessage(content: QuestionType): Promise<SDKResponse> {
    return Promise.resolve({} as SDKResponse);
  }

  parseResponse(raw: string): ParseResult {
    try {
      console.log(raw, "raw----------------------------------------------------------");
      const cleanStr = raw
        .replace(/[\r\n]+/g, "")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")

      // 解析JSON
      const data = JSON.parse(cleanStr)

      const content: string =
        data?.choices?.[0]?.message?.content ?? ""

      const transcriptContent: TranscriptItem[] =
        data?.transcriptContent ?? []

      return { content, transcriptContent }
    } catch (err) {
      console.error("parseResponse error:", err)
      return { content: "", transcriptContent: [] }
    }
  }

}

export const mySDK: ChatSDK = new MySDKImpl()
export default mySDK
