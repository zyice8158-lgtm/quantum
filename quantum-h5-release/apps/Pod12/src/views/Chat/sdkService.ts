import { QTLocalService } from '../../services'
import { ChatSDK, ChatStatus, SDKResponse, StreamAnswerType, AnswerActionType, QuestionType } from '@libs/p-comps'
import MarkdownIt from 'markdown-it'
import { replyCatchMeUp } from '@libs/service';

class MySDKImpl implements ChatSDK {
  streamController: AbortController | null = null
  dataCallback: ((data: StreamAnswerType) => void) | null = null
  markdownParser = new MarkdownIt()
  userId: string = ''

  constructor() { }

  init() {
  }
  async sendCMUMessage(cmuItem): Promise<SDKResponse> {
    console.log('sendCMUMessage--------', cmuItem);

    const dataRes = {
      content: [cmuItem],
      response: '',
      type: AnswerActionType.CMU,
      requestId: '',
      status: "done",
      stepMode: "final_answer",
      done: true,
      errorCode: 0,
      errorMsg: "",
      intentCategory: "GENERAL",
      intentType: "GENERAL_GENERATION"
    }
    this.dataCallback?.(dataRes)
    return { status: ChatStatus.DONE, response: '' }
  }

  async sendCMUReply(replyContent: string): Promise<SDKResponse> {
    try {
      const res = await replyCatchMeUp({ MessageSource: 'web', Data: { ReplyContent: replyContent } });
      console.log('sendCMUReply-----------', res);
      if (res.data && res.data.Data && res.data.Data.IsSuccess) {
        const dataRes = {
          content: 'OMG!! cant wait to try it',
          response: 'OMG!! cant wait to try it',
          requestId: '',
          status: "done",
          stepMode: "final_answer",
          done: true,
          type: AnswerActionType.CUMREPLY,
          errorCode: 0,
          errorMsg: "",
          intentCategory: "GENERAL",
          intentType: "GENERAL_GENERATION"
        }
        this.dataCallback?.(dataRes);
      }
      return { status: ChatStatus.DONE, response: '' }

    } catch (error) {
      console.error('Error replying to CatchMeUp:', error);

    }
  }

  async sendMessage(question: QuestionType): Promise<SDKResponse> {

    // 这里后续需要判断是否云端
    await this.handleCloudData(question);
    // WebviewMessager.sendStreamMessage(
    //   {
    //     Direction: 0,
    //     MessageSource: 'pod6',
    //     MessageDestination: '',
    //     MessageMethod: 'AIGCChat',
    //     Data: { "msg": question.content, "fileList": fileList, "regen": false, "type": question.intentionType, "lid": question.sessionId, "sessionType": "AINowGeneral", },
    //   },
    //   {
    //     onData: (data) => {
    //       console.log('Stream data received:', data)
    //       const resContent = JSON.parse(data);
    //       const dataRes = {
    //         content: '',
    //         response: data,
    //         requestId: '',
    //         status: "done",
    //         stepMode: "final_answer",
    //         done:true,
    //         errorCode:0,
    //         errorMsg:"",
    //         intentCategory:"GENERAL",
    //         intentType:"GENERAL_GENERATION"
    //       }
    //       if(resContent.title === 'catchmeup') {
    //         dataRes.content = [resContent];
    //         resContent.itemized_summary.map((item) => {
    //           console.log('name-----------', item.title, resContent.internal_metadata.catch_me_up_cache.groupSummaries[0]);
    //           item.name = resContent.internal_metadata.catch_me_up_cache.groupSummaries[0][item.title].name;
    //           return item;
    //         })
    //         dataRes.type = AnswerActionType.CMU
    //       } else if(resContent.title === 'catchmeup-reply'){

    //         dataRes.content = 'Message is sent.';
    //         dataRes.type = AnswerActionType.CUMREPLY
    //       } else {
    //         const task = resContent.task[0]
    //         dataRes.content = task.value;
    //       }

    //       console.log('能够------------', resContent)

    //       // if(!resContent.done) {
    //       //   dataRes.content = resContent.data.chat
    //       // }
    //       this.dataCallback?.(dataRes)
    //       return { status: ChatStatus.DONE, response: '' }
    //     },
    //     onDone: () => {
    //       console.log('Stream done')
    //     },
    //     onError: (err) => {
    //       console.log('Stream error', err)
    //     }
    //   }
    // );
  }

  async handleCloudData(question: QuestionType) {
    try {
      console.log('sendMessage--------', question);
      const response = await QTLocalService({
        query: question.content
      });
      const reader = response.data.getReader();
      const decoder = new TextDecoder();       // 递归读取流（回调风格）
      // 递归读取流（回调风格）
      const read = async () => {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream complete');
          return;
        }
        const chunk = decoder.decode(value, { stream: true });
        let chunkRes = {} as Record<string, string | Array<{ value: string }>>
        try {

          chunkRes = JSON.parse(chunk);
        } catch (error) {
          console.log(error);

        }
        console.log('Received chunk:', chunk);
        // console.log('Received parse', chunkRes, typeof chunkRes.chat === 'string' ? chunkRes.chat : '');
        // let dataContent = (typeof chunkRes.chat === 'string' ? chunkRes.chat : '');
        if (chunkRes.answer) {
          console.log('Received answer:', chunkRes);
          const dataContent = (chunkRes.answer as Array<{ value: string }>)[0].value;
          const dataRes = {
            content: this.markdownParser.render(dataContent),
            response: dataContent,
            requestId: '',
            status: ChatStatus.DONE,
            stepMode: "final_answer",
            done: true,
            answerData: { actionType: AnswerActionType.TEXT },
          }
          this.dataCallback?.(dataRes)
        }
        read();
      }
      // 开始读取
      read();
      return response;
    } catch (error) {
      console.log('error-------', error);
    }
  }

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
