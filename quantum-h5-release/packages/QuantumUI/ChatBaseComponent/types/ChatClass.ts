import { nextTick, reactive, unref } from "vue";
import { type WelcomeType, type QuestionType, type AnswerType, type StreamAnswerType, ChatStatus, ChatComponentType, ChatMessageType, ChatSDK, historyItemType, AnswerActionType, FileSearchListType } from "../types";
import { ChatEventBus, sendServiceMsg, stopServiceMsg, setChatSDK } from "./AIServiceGateway";
import { v4 as uuidv4 } from 'uuid';
import Question from "./Question";
import Answer from "./Answer";
import { FilesManagerScope, useFileScope } from "../../hooks/useFiles";
import { apiGenerateChatTitle } from "@libs/service";

export default Answer;

// ChatController 类，作为控制器管理其他类的实例和公共数据
export class ChatController {
  welcomeConfig?: WelcomeType; // 欢迎语配置
  chatAction = reactive<ChatMessageType[]>([]); // 对话数据
  currentQueryId: string = ""; // 当前操作的提问的id
  currentChatStatus: ChatStatus = ChatStatus.DONE; // 当前对话状态默认结束状态
  isReGenerate: boolean = false; // 判读是否重新生成回答
  isWelcome: boolean = false; // 是否是欢迎语
  isWebSearch: boolean = true; // 是否是web搜索
  isDeepThinking: boolean = true; // 是否是深度思考
  sessionId: string = ""; // 会话id
  // chatStatus: ChatStatus = ChatStatus.SUCCESS; // 当前对话状态默认结束状态
  chatStatus = reactive<{ value: ChatStatus }>({ value: ChatStatus.DONE });
  isRefresh: boolean = false; // 是否重新提问
  messageContainer: HTMLElement | null = null;
  history: historyItemType[] = []; // 历史记录数组，用于存储历史对话记录
  documentIds: Array<string> = []
  uploadedFiles: { name: string; path: string; fileId: string; documentId: string }[] = []
  fileSearchList: Array<FileSearchListType> = [] // file search 选择的文档
  isFileSearchLoading: boolean = false; // 文件入库加载中
  chatUid: string = ""; // 聊天id
  filesManager: FilesManagerScope;
  constructor(sdk: ChatSDK, params?: {
    fileScope: string
    sessionId:string
  }) {
    const { fileScope, sessionId } = params || {};
    this.filesManager = useFileScope({ scope: fileScope })
    setChatSDK(sdk); // 设置SDK
    ChatEventBus.on("setQueryValue", this.setQueryValue.bind(this));
    ChatEventBus.on("setQueryObject", this.setQueryObject.bind(this));
    ChatEventBus.on("listenMessage", this.listenMessage.bind(this));
    this.sessionId = sessionId || uuidv4(); // 生成会话id
    this.chatStatus.value = ChatStatus.DONE;
  }

  initChatAction(chatList: ChatMessageType[]) {
    this.chatAction.splice(0, this.chatAction.length);
    for (const data of chatList) {
      if (this.isQuestion(data)) {
        const question = new Question();
        question.setData(data.questionData);
        this.chatAction.push(question);
      } else if (this.isAnswer(data)) {
        const answer = new Answer();
        answer.setData(data.answerData);
        this.chatAction.push(answer);
      }
    }
  }


  removeFileSearchList(fileId: string, isPath: boolean = false) { // 传入是否为path
    const searchIndex = this.fileSearchList.findIndex(
      (item) => {
        if(isPath) {
          return item.filePath === fileId;
        } else {
          return item.fileId === fileId;
        }
      }
    );
    if (searchIndex > -1) {
      this.fileSearchList.splice(searchIndex, 1);
    }
  }

  setSearchList(fileInfoList: FileSearchListType | FileSearchListType[]) {
    console.log('fileInfoList-----------', fileInfoList);
    if (Array.isArray(fileInfoList)) {
      fileInfoList.forEach(item => {
        this.fileSearchList.push(item);
      });
    } else {
      this.fileSearchList.push(fileInfoList);
    }
  }
  // 合并属性
  updateSearchList(index: number, fileInfo: { filePath: string, isFileLoading: boolean }) {
    this.fileSearchList[index] = { ...this.fileSearchList[index], ...fileInfo };
  }

  setFileSearchLoading(loading: boolean) {
    this.isFileSearchLoading = loading;
  }

  getChatStatus(): ChatStatus {
    return this.chatStatus.value;
  }

  setWebSearch(type: boolean): void {
    this.isWebSearch = type;
  }
  setDeepThinking(type: boolean): void {
    this.isDeepThinking = type;
  }

  getWelcomeConfig(): WelcomeType | undefined {
    return this.welcomeConfig;
  }

  /**
   * 设置欢迎信息的显示状态。此方法用于控制是否在界面上展示欢迎信息。
   *
   * @param type 布尔值，用于设置欢迎信息的类型
   *        - true：显示欢迎信息
   *        - false：不显示欢迎信息
   */
  setWelcomeType(type: boolean): void {
    this.isWelcome = type;
  }

  setMessageContainerRef(container: HTMLElement | null) {
    this.messageContainer = container;
  }

  async scrollToBottom(num: number = 0) {
    await nextTick();
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.scrollTo({
          top: this.messageContainer.scrollHeight,
        });
      }
    }, num)
  }

  // 提问的时候触发进行query和answer的数据生成
  setQueryValue(value: string, isRecognizing?: boolean): void {
    this.setQueryObject({ content: value }, isRecognizing);
  }

  /**
   * 将默认值对象中的属性赋值给目标对象中未定义的属性。
   * @param target 目标对象，接受默认值赋值。
   * @param defaults 包含默认值的部分对象。
   * @returns void
   */
  private assignDefaults<T extends Record<string, any>>(
    target: T,
    defaults: Partial<T>
  ): void {
    for (const key in defaults) {
      if (target[key] === undefined) {
        target[key] = defaults[key];
      }
    }
  }

  setQueryObject(queryData: QuestionType, isRecognizing?: boolean): void {
    console.log('setQueryObject-----------', queryData);
    const _queryData = {...queryData};
    try {
      this.isRefresh = false;
      const queryData = this.createChatPair(_queryData);
      queryData.payload.isRecognizing = isRecognizing;
      this.send_message(queryData);
    } catch (error) {
      console.warn("UUID NO NO NO", error);
    }
  }

  createChatPair(queryData: QuestionType, answerContent: string = ''): QuestionType {
    queryData.id = queryData.id || uuidv4();
    queryData.timestamp = queryData.timestamp || Date.now();
    queryData.type = ChatComponentType.QUERY;
    const files = unref(this.filesManager.files);
    if ( unref(this.filesManager.files).length > 0) {
      queryData.files = [...files];
    }

    // assignDefaults设置默认值
    this.assignDefaults(queryData, {
      intentionType: "",
      sessionId: this.sessionId,
      isDeepThink: this.isDeepThinking,
      isWebSearch: this.isWebSearch,
      history: this.history,
      documentIds: this.documentIds,
      actionType: AnswerActionType.TEXT,
      payload: {},
    });

    this.currentQueryId = queryData.id;

    const question = new Question();
    console.log('queryData----------', queryData);
    question.setData(queryData);

    const answerData: AnswerType = {
      id: uuidv4(),
      questionId: queryData.id,
      content: answerContent,
      response: "",
      timestamp: queryData.timestamp,
      type: ChatComponentType.ANSWER,
      queryData,
      actionType: AnswerActionType.TEXT,
      isPlaying: false,
      tool: "",
    };

    const answer = new Answer();
    console.log('answerData----------', answerData);
    answer.setData(answerData);

    this.chatAction.push(question, answer);
    console.log('chatAction-------', this.chatAction);
    this.filesManager.onFileclear();
    return queryData;
  }

  // 开始重新生成回答
  startRegenerate(data: AnswerType): void {
    this.currentQueryId = data.questionId;
    this.isRefresh = true;
    this.setStatusType(ChatStatus.START);
    const currentAnswer = this.getCurrentOperatingObject() as Answer;
    currentAnswer.answerData.content = "";
    // this.send_message(data.queryData?.content || "");
    this.send_message(data.queryData);
    this.scrollToBottom();
  }

  private isQuestion(item: any): item is { questionData: QuestionType } {
    return "questionData" in item;
  }

  private isAnswer(
    item: any
  ): item is { refreshArr: any; answerData: AnswerType } {
    return "answerData" in item;
  }

  private filterChatAction(): historyItemType[] {
    const historyData = this.chatAction
      .map((item) => {
        if (!item) return null;

        // 处理问题数据
        if (this.isQuestion(item)) {
          return {
            role: item.questionData.type || "unknown",
            content: item.questionData.content,
          };
        }

        // 处理回答数据
        if (this.isAnswer(item)) {
          const lastRefresh =
            item.refreshArr.length > 0
              ? item.refreshArr[item.refreshArr.length - 1]
              : item;
          console.log(
            lastRefresh,
            "lastRefreshlastRefreshlastRefreshlastRefresh"
          );
          return {
            role: item.answerData.type || "unknown",
            content: lastRefresh.answerData.response || "",
          };
        }
        return null;
      })
      .filter((item): item is historyItemType => item !== null);
    if (this.chatAction.length > 2) {
      return historyData.slice(0, -2);
    }
    return [];
  }

  // 放入文件Ids
  setDocumentIds(params: Array<string>): void {
    this.documentIds = params;
  }

  // 发送消息到服务端进行回答生成
  private send_message(queryData: QuestionType): void {
    console.log('send_message------------')
    const history = this.filterChatAction();
    this.setStatusType(ChatStatus.START);
    // 调用中间件方法去发送消息
    sendServiceMsg({ ...queryData, history });
    this.scrollToBottom();
  }

  setStatusType(type: ChatStatus): void {
    this.chatStatus.value = type;
    const currentAnswer = this.getCurrentOperatingObject() as Answer;
    currentAnswer?.handleChatStatusChanged(type);
  }

  /**
   * 获取当前操作的 Answer 对象
   * @returns Answer | undefined
   */
  private getCurrentOperatingObject(): Answer | undefined {
    for (const item of this.chatAction) {
      // 确保是 Answer 类型
      if (item instanceof Answer) {
        const answerData = item.getData();
        // 检查 questionId 是否匹配
        if (answerData.questionId === this.currentQueryId) {
          return item;
        }
      }
    }
    return undefined;
  }

  // 停止生成回答
  stopRegenerate() {
    this.chatStatus.value = ChatStatus.DONE;
    const currentAnswer = this.getCurrentOperatingObject() as Answer;
    currentAnswer.handleChatStatusChanged(ChatStatus.DONE);
    stopServiceMsg();
  }

  stopMessage() {
    stopServiceMsg();
  }

  /**
   * 用于专门设置answer tools 的回答 不走core
   * @param content 回答内容
   * @param actionType 回答类型
   */
  setAnswerTools(content: string, actionType: AnswerActionType) {
    const answerData: AnswerType = {
      id: uuidv4(),
      questionId: null,
      content: content,
      response: "",
      timestamp: Date.now(),
      type: ChatComponentType.ANSWER,
      queryData: null,
      actionType: actionType,
      isPlaying: false,
    };

    const answer = new Answer();
    answer.setData(answerData);
    this.chatAction.push(answer);
  }
  async createChatTile() {
    let content = ''
    for(let i= this.chatAction.length-1; i >= 0; i--){
      if(this.isAnswer(this.chatAction[i])){
        content = this.chatAction[i].getData().content
        break
      }
    }
    if(content){
      return await apiGenerateChatTitle({
        SessionId: this.sessionId,
        MessageList: content,
      })
    }
  }
  doCreateChatTitle = true

  private async listenMessage(data: StreamAnswerType): Promise<void> {
    console.log('listenMessage-----------', data);
    const { status } = data;
    this.currentChatStatus = status as ChatStatus;
    this.chatStatus.value = status as ChatStatus;
    const currentAnswer = this.getCurrentOperatingObject() as Answer;
    this.setStatusType(status);
    if (currentAnswer) {
      switch (status) {
        case ChatStatus.ONGOING:
          currentAnswer.setContent(data);
          break;
        case ChatStatus.DONE:
          // 存入克隆对象
          if (this.isRefresh) {
            const clonedAnswer = currentAnswer.clone();
            currentAnswer.setRefresh(clonedAnswer);
          }
          currentAnswer.setContent(data);
          break;
        case ChatStatus.SUCCESS:
          currentAnswer.setContent(data);
          break;
        case ChatStatus.FAILURE:
          currentAnswer.setContent(data);
          break;
      }

      const index = this.chatAction.findIndex(
        (item) => item.id === currentAnswer.id
      );
      if (index !== -1) {
        this.chatAction.splice(index, 1, currentAnswer);
      }
    }
    await this.scrollToBottom();
  }
  destroy() {
    ChatEventBus.clear("setQueryValue");
    ChatEventBus.clear("setQueryObject");
    ChatEventBus.clear("listenMessage");
  }
}
