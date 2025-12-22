import { reactive } from "vue";
import { type AnswerType, ChatStatus, ReferencesType, DocumentListType, AnswerActionType, StreamAnswerType, FileSearchListType } from "../types";
import { ChatEventBus } from "./AIServiceGateway";

// Answer 类，处理与回答相关的数据
export default class Answer {
  answerData: AnswerType;
  id: string = ""
  chatStatusAnswer = reactive<{ value: ChatStatus }>({ value: ChatStatus.DONE });; // 当前回答状态默认结束状态
  refreshArr: Answer[] = [];
  references = reactive<ReferencesType[]>([])
  documentList: DocumentListType[] = []
  fileSearchList: FileSearchListType[] = [] // file search 选择的文档
  constructor() {
    this.references = []
    this.answerData = {
      response: "",
      content: ""
    } as AnswerType; // 初始化为空对象
    // 订阅事件
    ChatEventBus.on("setRefreshChanged", this.setRefresh.bind(this));
  }
  static isAnswer(
    item: any
  ): item is { refreshArr: any; answerData: AnswerType } {
    return "answerData" in item;
  }

  // setSelectFileSearch(fileItem: DocumentListType) {
  //   const isExist = this.fileSearchList.some(item =>
  //     item.documentId === fileItem.documentId
  //   );

  //   if (!isExist) {
  //     this.fileSearchList = [...this.fileSearchList, fileItem];
  //   }
  //   console.log("fileSearchList", this.fileSearchList);
  // }


  setData(data: AnswerType): void {
    this.answerData = data;
    this.id = data.id
    if (data.content) {
      this.answerData.content = data.content;
    }
  }

  getData(): AnswerType {
    return this.answerData;
  }

  // 点击刷新后更新当前content字段的值
  setRefreshContent(index: number) {
    this.answerData.content = this.refreshArr[index].getData().content;
    this.answerData.response = this.refreshArr[index].getData().response;
    this.references = this.refreshArr[index].references;
  }


  // 更新设置当前content字段的值
  setContent(data: StreamAnswerType): void {
    console.log('setContent----------', data);
    const { content, fileSearchList, answerData: { actionType, payload, isPlaying, relatedQuestions, tool, playContent, searchUrls } } = data
    this.answerData.actionType = actionType;
    this.answerData.payload = payload || {};
    this.answerData.isPlaying = isPlaying || false;
    this.answerData.tool = tool || "";
    this.answerData.searchUrls = searchUrls || [];

    if (actionType && actionType === AnswerActionType.PICTURE) {
      this.fileSearchList = fileSearchList;
    }
    if (actionType !== AnswerActionType.TEXT) {
      this.answerData.response = content;
      this.answerData.content = content;
    } else { // 流式输出
      this.answerData.content = content;
    }

    if(playContent) {
      this.answerData.playContent = playContent;
    }

    if (Array.isArray(relatedQuestions)) {
      this.answerData.relatedQuestions = relatedQuestions.filter(item => item?.text).map(item => {
        return {
          icon: item?.icon, text: item.text
        }
      })
    }
  }
  // 更新ActionType字段的值
  setAnswerType(type: AnswerActionType) {
    this.answerData.actionType = type
  }

  // 加入刷新的数据
  setRefresh(data: Answer) {
    this.refreshArr.push(data)
  }

  // 处理聊天状态变化事件
  handleChatStatusChanged(status: ChatStatus) {
    this.chatStatusAnswer.value = status;
  }

  /**
   * 克隆当前对象，并返回一个新的 Answer 对象
   *
   * @returns 克隆后的 Answer 对象
   */
  clone(): Answer {
    const newAnswer = new Answer();
    newAnswer.answerData = { ...this.answerData };
    newAnswer.id = this.id;
    newAnswer.refreshArr = [...this.refreshArr];
    if (Array.isArray(this.references)) {
      newAnswer.references = [...this.references];
    }
    return newAnswer;
  }
}
