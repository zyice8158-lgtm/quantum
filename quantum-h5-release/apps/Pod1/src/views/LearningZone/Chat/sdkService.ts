import { ChatSDK, ChatStatus, SDKResponse, StreamAnswerType, AnswerActionType, QuestionType } from '@libs/p-comps'
import MarkdownIt from 'markdown-it'
import { WebviewMessager, SpeechService, sendResultToCSharp } from '@libs/service';
import { FileSearchListType } from '@libs/p-comps';
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
    console.log('sendMessage----------', question);
    if (question.intentionType === 'WORK_ASSISTANT_IMAGE_SNIP') {
      return this.sendScreenShotMessage(question);
    }

    const fileList = question.files?.map(file => {
      return file.path;
    });
    const obj = {"handler":"handler.orch_brain","modelName":"mstts","modelVersion":"1.0","prompt":question.content,"locale":"en-US","voiceName":"Aria"};
    let params = {};
    if(question.payload.isRecognizing) {
      params = {
          "command": "model_call",
          "data": {
              "text": JSON.stringify(obj)
          }
      }
    } else {
      params = { "msg": question.content, "fileList": fileList, "regen": false, "type": question.intentionType, "lid": question.sessionId, "sessionType": "AINowGeneral" };
    }
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
        MessageMethod: 'AIGCChat',
        Data: params,
      },
      {
        onData: (data: StreamAnswerType) => {
          console.log('Stream data received:', data);
          if(data.answerData.isRecognizing) {
            try {
                  const binaryData = JSON.parse(data.content);
                  console.log('binaryData', binaryData.data.binary);
                  this.handleBinarySpeaking(binaryData.data.binary);
                } catch (error) {
                  console.log('error', error);
                }
          }
          this.dataCallback?.(data);
          Object.assign(dataRes, data);
          // if(typeof data === 'string') {
          //   dataRes.status = ChatStatus.ONGOING;
          //   const resContent = JSON.parse(data);
          //   if (resContent.done) {
          //     dataRes.status = ChatStatus.DONE;
          //     this.dataCallback?.(dataRes);
          //     return
          //   }
  
          //   // dataRes.answerData.actionType = AnswerActionType.TEXT;
          //   console.log('resContent---------', resContent);
          //   // 判断responseType来决定是否是catch me up
          //   if (resContent.data?.toolResult && resContent.data?.toolResult[0].value.includes('CatchMeUpNotificationSummary')) {
          //     dataRes.content = resContent.data.toolResult[0].value;
          //     dataRes.answerData.actionType = AnswerActionType.CMU;
          //     dataRes.status = ChatStatus.DONE;
          //     console.log('dataRes---------', dataRes.content);
          //     this.dataCallback?.(dataRes);
          //     this.webviewSendInstance.Abort();
          //     return
          //   } else {
          //     this.handleChatStream(dataRes, resContent);
          //   }
          // } else {
          //   if(data.chatType = 'chat') {
          //     dataRes.content = data.chatMsg;
          //     dataRes.status = ChatStatus.DONE;
          //     // dataRes.content = this.handleParser(dataRes.response);
          //     dataRes.response += data.chatMsg || '';
          //     this.dataCallback?.(dataRes);
          //   }
          // }
          return { status: ChatStatus.DONE, response: '' }
        },
        onDone: () => {
          console.log('Stream done')
          sendResultToCSharp({ MessageSource: "Pod6", Data: { Result: this.result } })
          dataRes.status = ChatStatus.DONE;
          this.dataCallback?.(dataRes);
        },
        onError: (err: Error) => {
          console.log('Stream error', err);
          console.log(typeof err, err.message);
          // err.message
          if (!err.message.includes('aborted')) {
            dataRes.content = '';
            dataRes.status = ChatStatus.DONE;
            this.dataCallback(dataRes)
          }
        }
      }
    );
  }
  handleChatStream(dataRes: StreamAnswerType, resContent) {
    if (resContent.data.answer) { //语音
      const answer = resContent.data.answer[0];
      if (answer.contentType === 'DOCUMENT' && answer.mimeType === 'LIST') {
        dataRes.answerData.actionType = AnswerActionType.UPLOADFILE;
        dataRes.content = JSON.parse(answer.value);
      } else {
        if (resContent.data.offline) {
          dataRes.answerData.payload.isShowOffline = true;
        }
        if (resContent.category === 'OPEN_APP') {
          dataRes.answerData.payload.isShowApp = true;
        }
        //TODO fix 流式返回处理问题，要整体进行markdown parse 后续处理暂时fix
        dataRes.response += answer.value || '';
        dataRes.content = this.handleParser(dataRes.response);
        console.log('content', dataRes.content);
      }
    }
    console.log('dataRes---------', dataRes);
    this.result = this.getMarkdownPlainText(dataRes.response || '');
    this.handleSpeaking(this.result);
  }
  async sendScreenShotMessage(question: QuestionType): Promise<SDKResponse> {
    console.log('sendScreenShotMessage----------', question.content);
    const ImagePath = question.files?.map(file => {
      return file.path;
    })
    this.webviewSendInstance = WebviewMessager.sendStreamMessage(
      {
        Direction: 0,
        MessageSource: 'pod6',
        MessageDestination: '',
        MessageMethod: 'GetScreenShootChat',
        Data: { "ConfirmList": [question.content], ImagePath, "Type": question.intentionType },
      },
      {
        onData: (data) => {
          console.log('Stream data received:', data)
          const resContent = JSON.parse(data);
          let imageList: FileSearchListType[] = [];
          let answer = '';
          let answerType = AnswerActionType.TEXT;
          if (Array.isArray(resContent)) {
            imageList = resContent.map((item: string) => {
              return {
                filePath: item,
                fileName: '',
                fileId: '',
                fileType: '',
              }
            });
            answerType = AnswerActionType.PICTURE;
          }
          if (typeof resContent === 'string') {
            const parseData = JSON.parse(resContent);
            answer = parseData.answer;

            this.handleSpeaking(this.getMarkdownPlainText(answer));
            answer = this.handleParser(answer);

          }

          const dataRes: StreamAnswerType = {
            content: answer,
            response: '',
            status: ChatStatus.DONE,
            fileSearchList: imageList,
            answerData: { actionType: answerType },
          }
          this.dataCallback?.(dataRes);


          return { status: ChatStatus.DONE, response: '' }
        },
        onDone: () => {
          console.log('Stream done')
        },
        onError: (err) => {
          console.log('Stream error', err)
        }
      }
    );
    if (question.content === 'Book Hotels nearby') {
      const dataRes: StreamAnswerType = {
        content: '',
        response: '',
        answerData: {},
        status: ChatStatus.DONE,
      }
      this.dataCallback?.(dataRes);
      this.webviewSendInstance.Abort();
    }

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
    if (speechService.isLiving) {
      speechService.startSpeech({ Data: { SpeakString: text } })
    }
  }
  handleBinarySpeaking(text: number[]): void {
    const speechService = SpeechService.getInstance();
    speechService.startSpeech({ Data: { SoundStream: text } })
  }

  stopMessage(): void {
    console.log('Stream aborted', this.webviewSendInstance.Abort)
    if (this.webviewSendInstance.Abort) {
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
}

export const mySDK: ChatSDK = new MySDKImpl()
export default mySDK
