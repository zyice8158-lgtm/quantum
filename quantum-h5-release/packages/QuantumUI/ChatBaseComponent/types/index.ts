import Question from "./Question";
import Answer from "./Answer";

// 欢迎语类型定义
export interface WelcomeType {
    avatar?: string;
    title: string; // 标题
    quickQuestions?: QuickQusetionType; // 快速问答部分

}

// 欢迎语的快速问答类型定义
interface QuickQusetionType {
    title: string;
}

export interface QuestionType {
    id?: string;
    content: string;
    timestamp?: number;
    type?: string;
    files?: Array<FileSearchListType>;
    intentionType?: string;
    sessionId?: string;
    isDeepThink?: boolean;
    isWebSearch?: boolean;
    history?: historyItemType[];
    documentIds?: Array<string>;
    actionType?: AnswerActionType;
    replyTo?: string;
    isCatchMeUp?: boolean; // question是否显示
    payload?: Record<string, unknown>;
}
interface TranscriptItem {
    duration: number;
    isFinal: boolean;
    msg: string;
    offset: number;
    speakerId: string;
    targetLang: string;
  }
export interface Citation {
    title?: string;
    url?: string;
    snippet?: string;
    source?: string;
}
export interface AnswerType<T = {}> {
    id?: string; // 回答的id
    questionId?: string; // 问题的id
    content?: string; // 返回的内容
    timestamp?: number;// 时间戳
    type?: string; // answer & query
    queryData?: QuestionType;
    inputSelectType?: string; // 这个是input框下拉选中的类型
    response?: string; // 回答
    actionType?: AnswerActionType; // 消息类型
    // 以下参数为，对应的卡片数据
    chainOfThought?: string; // 思维链卡片数据
    payload?: T;
    transcription?:TranscriptItem[]; // 转录卡片数据
    isPlaying?: boolean;
    relatedQuestions?: Array<RelatedQuestion>
    tool?: string;
    playContent?: string; // 注入需要播放的内容
    searchUrls?:Citation[];
}
// 这里维护卡片类型的映射
export enum AnswerActionType {
    CHAIONCARD = 'chaionCard', // 思维链卡片
    TEXT = 'text', // 文本
    TEXT_POD1 = 'textPod1', // 文本Pod1版本
    CMU = 'cmu', // catch me up卡片类型
    THINKING = 'think', // 思维链
    UPLOADFILE = 'uploadFile', // 上传文件，可以选择
    CUMREPLY = 'cmuReply',
    PICTURE = 'picture',
    UPLOADNORMAL = 'uploadFileNormal',// 上传文件，不可以选择
    SUMMARY = 'summary',// learning zone 总结
    IMAGES = 'images', // creator zone 图片
    CREATE_ZONE = 'createZone', // creator zone 生成图片回复
    EVENTTIME = 'eventTime',// pod1 事件时间
    TRANSCRIPTION='transcription', // payattention 转录
    QUIZ = 'quiz', // quiz 卡片类型
    Note = 'note', // note卡片类型
    CONTACT_SELECT = 'contactSelect', // Schedule a meeting with Tom 联系人卡片类型
    THIRD_PARTY_AGENT = 'thirdPartyAgent',
    FOLLOW_UP = 'followUp',
    PERPLEXITY = 'perplexity',
}

export interface InputType {
    content: string;
    type: string;
}

// 返回的流逝答案类型定义
export type StreamAnswerType<K = {}, T = {}> = {
    status: ChatStatus;
    response: string;
    content: string | K;
    references?: ReferencesType[];
    documentList?: DocumentListType[];
    payload?: T;
    isCatchMeup?: Boolean;
    fileSearchList?: FileSearchListType[];
    answerData: AnswerType;
};



export type ChatMessageType = Question | Answer;


// 返回的当前流式消息状态枚举
export enum ChatStatus {
    SUCCESS = "success", // 用户请求成功，当前请求结束
    FAILURE = "failure", // 用户请求失败，当前请求结束
    ONGOING = "ongoing",// 请求返回中
    START = "start", // 开始请求start thinking
    STOP = "stop", // 用户结束请求
    DONE = "done", // 请求结束
    TIMEOUT = "timeout", // 请求超时
}

export enum ChatComponentType {
    QUERY = "query",
    ANSWER = "answer",
    INPUT = "input"
}

export interface SDKResponse {
    // 状态，可以根据实际需求扩展状态值
    status: ChatStatus;
    // 返回的消息文本
    response: string;
    stepMode?: string;
    requestId?: string;
    toolResult?: string;
}

export interface ChatSDK {
    streamController: unknown;
    /**
     * 发送消息，返回一个 Promise，该 Promise resolve 时返回 SDKResponse 对象。
     * @param text 消息文本
     */
    sendMessage(question: QuestionType): Promise<SDKResponse>;

    /**
     * 停止消息发送的操作，无返回值。
     */
    stopMessage(): void;
    /**
     * 初始化SDK。
     */
    init(): void;
    /**
     * 消息回调
     */
    setDataCallback(callback: (data: StreamAnswerType) => void): void;
}

export interface docInfoItemType {
    documentID: string;
    documentName: string;
}


export interface historyItemType {
    role: string;
    content: string;
    docInfo?: docInfoItemType[];
}

export interface ReferencesType {
    documentSource: DocumentSource;
    siteName?: string;
    url: string;
    documentName?: string;
}

export enum DocumentSource {
    /** Edge Share TKB（公开知识库） */
    Public = "public",

    /** Edge Private KB（私有知识库） */
    Private = "private",

    /** 会话中上传的临时文档 */
    Session = "session",

    /** 网络搜索获取的内容 */
    Network = "network"
}

export interface DocumentListType {
    documentId: string;
    documentName: string;
    knowledgeId: string;
}

export interface FileSearchListType {
    fileType?: string;
    file_type?: string;
    fileScope?: string;
    fileName: string;
    filePath: string;
    fileId: string;
    icon?: string;
    isFileLoading?: boolean;
    base64?: string;
    convertPath?: string;
    fileJobId?: string;
    isChecked?: boolean;
}

export interface ContentI {
    "category": string;
    "data": { "chat": string };
    "errorCode": number;
    "errorMsg": string;
    "language": string;
    "lid": string;
    "type": string;
    "done"?: boolean;
}

export interface RelatedQuestion {
  icon?: string;
  text?: string
}
export enum UploadType {
    input = 'input',
    close = 'close',
    checkbox = 'checkbox',
}
export enum CMUBarStatus {
    replyInput = 'replyInput',
    loading = 'loading',
    success = 'success',
    done = 'done',
}
export enum ToolType {
  Copy = 'copy',
  Remember = 'remember',
  Share = 'share',
  VoicePlay = 'voicePlay',
}
