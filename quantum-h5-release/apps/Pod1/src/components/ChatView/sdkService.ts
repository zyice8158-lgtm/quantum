import { ChatSDK, ChatStatus, SDKResponse, StreamAnswerType, AnswerActionType, QuestionType } from '@libs/p-comps'
import MarkdownIt from 'markdown-it'
import { WebviewMessager, sendResultToCSharp, useTTSPlayer, sendRespTimeLudp, sendCmuSummary } from '@libs/service';
type SDKStatus = 'in_progress' | 'complete' | 'failed';
import { SettingStore } from '@/store/settings';
class MySDKImpl implements ChatSDK {
  streamController: AbortController | null = null
  dataCallback: ((data: StreamAnswerType) => void) | null = null
  markdownParser = new MarkdownIt({
    breaks: true,
  });
  webviewSendInstance: { MessageId: string, Abort: () => void };
  userId: string = ''
  result: string = ''
  resContent: {
    status: SDKStatus,
    data: { text: string },
    content?: string,
    Type?: string,
    Result?: string,
    Success?: boolean,
    jobId?: string,
  }
  statusMap: Record<SDKStatus, ChatStatus>
  dataRes: StreamAnswerType = {
    content: '',
    response: '',
    status: ChatStatus.START,
    answerData: { actionType: AnswerActionType.TEXT, payload: { isShowOffline: false, isShowApp: false } },
  }
  startTime: number = 0;
  endTime: number = 0;
  query:string = '';

  constructor() {
    this.statusMap = {
      in_progress: ChatStatus.ONGOING,
      complete: ChatStatus.DONE,
      failed: ChatStatus.FAILURE,
    }
  }

  init() {
    // 初始化dataRes对象，用response记录每次数据变化
    this.dataRes = {
      content: '',
      response: '',
      status: ChatStatus.START,
      answerData: { actionType: AnswerActionType.TEXT, payload: { isShowOffline: false, isShowApp: false }, isPlaying: false },
    }
  }

  async sendMessage(question: QuestionType): Promise<SDKResponse> {
    if (question.intentionType.includes('web-search')) {
      this.dataRes.answerData.actionType = AnswerActionType.PERPLEXITY
      this.dataRes.answerData.payload = {
        question: question?.payload?.overwrite ? question?.payload?.q : question.content,
        imageOnly: question?.payload?.imageOnly
      }

      this.dataRes.status = ChatStatus.DONE

      this.dataCallback(this.dataRes)
      return
    }

    console.log('sendMessage----------', question);
    if(question.isCatchMeUp) {
      console.log('isCatchMeUp---------')
      await this.sendCatchMeUpBtn();
      return;
    }
    const fileList = question.files?.map(file => {
      let fileParams = { path: file.filePath, base64: file.base64 || '' };
      file.convertPath && (fileParams.convertPath = file.convertPath);
      return fileParams;
    });

    let params = { "data": question.payload?.content ?? question.content, fileList, type: question.payload?.type ?? '', sessionId: question.sessionId }

    if (question.intentionType.includes('elicitation_')) {
      const action = question.intentionType

      params.data = JSON.stringify({
        action: action,
        content: question.payload?.content ?? question.content
      })
    }

    console.log('params-----------', params);
    this.init();
    this.startTime = Date.now();
    this.endTime = 0;
    this.query = params.data as string;
    this.webviewSendInstance = WebviewMessager.sendStreamMessage(
      {
        Direction: 0,
        MessageSource: '',
        MessageDestination: '',
        MessageMethod: 'AIGCChat', // params.fileList.length > 0 ? 'DocumentQA' : 'AIGCChat',
        Data: params,
      },
      {
        onData: (data) => {
          console.log('Stream data received111:', data);
          if (typeof data === 'string') {
            this.resContent = JSON.parse(data);
            console.log('resContent------', this.resContent);
            if (this.resContent.Type === 'CMU') {
              this.handleCatchUp();
            } else if (data.includes('quiz questions ')) {
              this.handleQuiz();
            } else if (data.includes('structured notes ')) {
              this.handleNote();
            } else if (data.includes('structured notes ')) {
              this.handleRecording();
            } else if (question.intentionType === 'quantum-live') {
              this.formatLiveResponse();
            } else if (data.includes('local_agent_file_seach_raw_data')) { //  || question.content === 'search files about news from my pc'
              // this.resContent = JSON.parse(fileSearchMockData);
              if(this.statusMap[this.resContent.status] === ChatStatus.ONGOING) {
                return;
              }
              this.statusMap[this.resContent.status] === ChatStatus.DONE && this.formatFileSearchList();
            } else if (data.includes('ExpediaAgent')) {
              this.handleExpediaAgent();
            } else if (data.includes('localczMCPServer_local_text_to_image_tool')) {
                this.handleCreateZoneImage('local');
            } else if (data.includes('czMCPServer_cloud_image_from_text')) {
              // if(this.resContent.status == "complete") {
                  // this.handleCreateZoneImage('cloud');
              // }
                this.handleCreateZoneImage('cloud');
            } else {
              const payload = question.payload as { autoTTS?: boolean }
              this.formatQueryResponse(payload.autoTTS);
              this.hanldeCaclulateTime();
            }
            this.handleChatStatus();
            this.dataCallback?.(this.dataRes);
          } else {
            if (!data) return;
            Object.assign(this.dataRes, data);
            this.dataCallback?.(data);
          }

          return { status: ChatStatus.DONE, response: '' }
        },
        onDone: () => {
          console.log('Stream done')
          sendResultToCSharp({ MessageSource: "Pod6", Data: { Result: this.result } })
          this.dataRes.status = ChatStatus.DONE;
          this.dataCallback?.(this.dataRes);
        },
        onError: (err: Error) => {
          console.log('Stream error', err,err.message);
          if (err.message.includes('aborted')) {
            this.dataRes.status = ChatStatus.DONE;
          } else {
            this.dataRes.status = ChatStatus.TIMEOUT;
          }
          this.dataCallback(this.dataRes)

        }
      }
    );
  }
  async sendCatchMeUpBtn() {
    const res = await sendCmuSummary();
    console.log('sendCmuSummary---------', res);
    try {
      if(res.data.Type === 'CMU') {
        this.resContent = res.data;
        this.handleCatchUp();
      }
      this.dataRes.status = ChatStatus.DONE;
      this.dataCallback?.(this.dataRes);
    } catch(error) {
      console.error(error);
    }
  }
  formatLiveResponse() {
    this.dataRes.content = this.resContent.data.text;
  }
  formatFileSearchList() {
    this.dataRes.answerData.actionType = AnswerActionType.UPLOADFILE;
    // this.dataRes.content = JSON.parse(this.resContent.content);
    try {
      const res = JSON.parse(this.resContent.data.text);
      console.log('fileSearch--------000', res);
      const res11 = JSON.parse(res.response);
      console.log('fileSearch--------1111', res11);
      const res22 = JSON.parse(res11.content[0].text);
      console.log('fileSearch--------222', res22);
      const res33 = JSON.parse(res22.content[0].text);
      console.log('fileSearch--------3333', res33, typeof res33, res33.results);
      // const res33 = JSON.parse(res22);
      // console.log('fileSearch--------2222', res22.content[0].text);
      // console.log('fileSearch--------3333', res33.results);
      this.dataRes.content = res33.results.map((ite) => {
        return {
          fileName: ite.file_name,
          filePath: ite.file_path,
          lastModifyTime: ite.last_modify_time,
          fileType: ite.file_name.lastIndexOf('.') > 0 ? ite.file_name.substring(ite.file_name.lastIndexOf('.') + 1) : '',
          scope: ite.scope,
          ...ite
        };
      });
    } catch (error) {
      console.error(error);
    }
  }
  updateAnswerDataIsPlaying() {
    this.dataRes.answerData.isPlaying = false
    this.dataCallback(this.dataRes)
  }
  formatQueryResponse(autoTTS: boolean = false) {
    const status = this.resContent.status;
    if (status === 'in_progress' || status === 'complete') {
      const text = JSON.parse(this.resContent.data.text);
      if (text.type === 'tool') {
        this.dataRes.answerData.tool = text.response;
      }
      if (text.type === 'text') {
        this.dataRes.content = text.response;
        this.dataRes.answerData.searchUrls = text.searchUrls;
      }
    }
    if (status === 'failed') {
      this.dataRes.content = this.resContent.data.text;
    }
    console.log('自动播---------', SettingStore.generalData.interactionMode);
    if (autoTTS && SettingStore.generalData.interactionMode) {
      this.dataRes.answerData.isPlaying = true;
      const complete = status === 'in_progress' ? false : true;
      useTTSPlayer.streamPlay(this.dataRes.content as string, complete, this.updateAnswerDataIsPlaying.bind(this));
    }
  }
  handleChatStatus() {

    const status = this.resContent.status;
    if (!status) return;
    this.dataRes.status = this.statusMap[status];
  }
  handleQuiz() {
    this.dataRes.answerData.actionType = AnswerActionType.QUIZ;
    this.dataRes.content = this.resContent.data.text;
  }

  handleCatchUp() {
    this.dataRes.answerData.actionType = AnswerActionType.CMU;
    if(!this.resContent.Success) {
      this.dataRes.content = this.resContent.Result;
    } else {
      try {
        const contentRes = JSON.parse(this.resContent.Result);
        console.log('contentRes---------',contentRes);
        const res = JSON.parse(contentRes.text);
        this.dataRes.content = res[0];
        if(typeof res[0] !== 'string') {
          const { title, summary, themes } = res[0];
          let str = '';
          themes.forEach((ite) => {
            str += ite.title + ite.summary;
          });
          this.dataRes.answerData.playContent = title + summary + str;
          console.log('sdkService--------', title + summary + str);
        }
      } catch (e) {
        console.error('cmurescontenterror-------', e);
      }
    }
  }
  handleNote() {
    this.dataRes.content = this.resContent.data.text;
    this.dataRes.answerData.actionType = AnswerActionType.Note;
  }
  handleRecording() {
    this.dataRes.content = this.resContent.data.text;
    this.dataRes.answerData.actionType = AnswerActionType.Recording;
  }
  handleExpediaAgent() {
    if (this.resContent?.data?.text) {
      try {
        const d = JSON.parse(this.resContent.data.text)
        let payload: Record<string, string | unknown> = {}

        if (d.response) {
          payload = typeof d.response === 'string' ? JSON.parse(d.response) : d.response
        } else {
          payload = d
        }

        const { message, followUp, recommendQuestions, MCPUI} = payload || {}
        this.dataRes.content = message
        this.dataRes.answerData.actionType = AnswerActionType.THIRD_PARTY_AGENT
        followUp && (this.dataRes.answerData.payload.followUp = `${followUp}`)
        recommendQuestions && (this.dataRes.answerData.relatedQuestions = (Array.isArray(recommendQuestions) ? recommendQuestions : []).map((text:string) => ({ text})))

        this.dataRes.answerData.payload.action = 'elicitation_response'

        if (MCPUI?.resource) {
          const url = MCPUI.resource?.text || ''
          const lastSegment = url.split('/').pop()
          const hasFileExtension =
            (lastSegment.includes('.') && lastSegment.indexOf('.') > 0) ||
            url.endsWith('/')

          if (!hasFileExtension) {
            MCPUI.resource.text = `${MCPUI.resource?.text || ''}/`
          }

          this.dataRes.answerData.payload.MCPUI = MCPUI
        }

        console.log('expedia Stream done')
        sendResultToCSharp({ MessageSource: "Pod6", Data: { Result: this.result } })
        this.resContent.status = 'complete'
      } catch {
        console.log('Expedia Response Parse Failed.')
      }
    }

  }
  hanldeCaclulateTime() {
    const text = JSON.parse(this.resContent.data.text);
    const jobId = this.resContent?.jobId;
    if (text.type === 'text') {
      const response = text.response;
      if (response && this.endTime === 0) {
        this.endTime = Date.now();
        sendRespTimeLudp({ Data: { respTime: this.endTime - this.startTime, jobId, queryStrNum: this.query.length } })
      }
  }
}

  /**
   * 处理CreateZone图片生成逻辑
   * @param modelType 模型类型（local/cloud）
   */
  handleCreateZoneImage(modelType: 'local' | 'cloud') {
    const resContentCopy = JSON.parse(JSON.stringify(this.resContent));

    try {
      if (resContentCopy.Result) {
        let resultData = resContentCopy.Result;
        if (typeof resultData === 'string') {
          resultData = JSON.parse(resultData);
        }
        resultData.modelType = modelType;
        resContentCopy.Result = resultData;
      }
    } catch (error) {
      console.error(`Failed to set modelType for ${modelType === 'local' ? 'localczMCPServer_local_controlnet_tool' : 'czMCPServer_cloud_image_from_text'}:`, error);
    }

    const formattedContent = {
      Data: resContentCopy
    };
    console.log('formattedContent---------',formattedContent);
    this.dataRes.status = this.statusMap[this.resContent.status];
    this.dataRes.answerData.actionType = AnswerActionType.CREATE_ZONE;
    this.dataRes.content = formattedContent;

    // 调用callback传递数据
    this.dataCallback?.(this.dataRes);
  }
  stopMessage(): void {
    console.log('Stream aborted', this.webviewSendInstance?.Abort)
    if (this.webviewSendInstance?.Abort) {
      this.webviewSendInstance.Abort();
      useTTSPlayer.stop()
      this.updateAnswerDataIsPlaying();
    }
  }

  setDataCallback(callback: (data: StreamAnswerType) => void): void {
    this.dataCallback = callback
  }
}

export const mySDK: ChatSDK = new MySDKImpl()
export default mySDK

