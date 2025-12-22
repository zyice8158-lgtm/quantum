import MarkdownIt from 'markdown-it';
import { AgentChat, MessageItem, AgentInfo, Message as MessageClass, UserMessage } from "@bty/chat-logic-core";
import { UnwrapNestedRefs, reactive, nextTick } from 'vue';
import EventBus from '@/utils/EventBus'
import { ChatSDK } from '@/utils/ChatSDK';
type StatusType = 'START' | 'ING' | 'FINISHED' | 'FAILED' | 'REFRESH';

export interface ChatWelcomeMessage {
    title: string;
    description: string;
    avatar: string;
    questionGuide: string[];
    welcome: string;
}

export type ChatMsgAnswer = ChatWelcomeMessage | InputMessage | AssistantMessage

export interface ConversationItem {
    id: string;
    title: string;
    uid: number;
}

export interface InputMessage {
    text: string;
}

export interface MessageListenerPayload {
    status: 'START' | 'ING' | 'FINISHED' | 'FAILED';
    data: AssistantMessage;
}

// MessageItem 是User消息或者Assistant消息组合成的一个联合类型
// export type MessageItem = UserMessage | AssistantMessage;

// User 消息和 Assistant 消息都有一些共同的属性
export interface BaseMessage {
    id?: string
    /**
     * 消息内容, Markdown 字符串
     */
    content?: string
    /**
     * 消息所属的session id，当执行clear history时，会新建一个新的 session
     * 一个Conversation可以包含多个session，sessionId相同的消息属于一个上下文
     * 关于session参考下面的图片
     */
    sessionId?: string
}

// 用户消息由 role: USER 标识
// export interface UserMessage extends BaseMessage {
//     role: 'USER',
//     content: ""
// }
export enum roleType {
    USER = 'USER',
    ASSISTANT = "ASSISTANT"
}
// Assistant 消息
export interface AssistantMessage extends BaseMessage {
    refreshState?: string
    status?: string;
    txtContent?: string;// 未转换前数据
    refreshList?: AssistantMessage[]; // 翻页数据
    role?: roleType | string
    /**
     * 消息类型
     * 1、SYSTEM_PUSH 系统推送消息，一般为TASK完成的消息推送，或者API调用的消息推送
     * 2、USER_MESSAGE 用户聊天过程中AI回复的消息
     */
    from?: 'SYSTEM_PUSH' | 'USER_MESSAGE'
    /**
     * 推荐提问
     */
    relatedQuestion?: MessageRelatedQuestion
    /**
     * 调用的技能
     */
    skills?: MessageSkill[]
    /**
     * 调用的知识库
     */
    knowledge?: MessageKnowledge[]
    /**
     * 用户发送的消息的内容，用于重新生成
     */
    userMessage?: UserMessage
    /**
     * 用于标记本次聊天是否发生错误，用户当前Message是否要显示 errorMessage
     */
    success?: boolean
    /**
     * 发生错误时，记录本次聊天的错误消息
     */
    errorMessage?: string
    welcome?: string
    questionGuide?: string[]
}

// Assistant 中技能的通用属性
export interface MessageSkillStatus {
    // 标识当前技能的状态，PENDING 表示执行中，SUCCESSED 标识执行成功，FAILED为执行失败
    status: 'PENDING' | 'SUCCEEDED' | 'FAILED'
}

/**
 * 推荐提问的消息
 */
export interface MessageRelatedQuestion extends MessageSkillStatus {
    /**
     * 当 status 为 succeeded 时，content有内容，其他状态都为空数组
     */
    content: string[]
}

// 技能类型的消息，一般调用FLow和Plugin属于技能
export interface MessageSkill extends MessageSkillStatus {
    metaData: {
        /**
         * 技能头像的背景色
         */
        color: string
        /**
         * 技能头像类型
         * icon类型为 emoji eg：”🌼“, image 类型为一个图片地址, eg: "https://xxx/xxx.png"
         */
        avatarType: 'icon' | 'image'
        /**
         * 技能头像
         */
        avatar: string
        /**
         * 技能名称
         */
        title: string
    }
    id: string
    output: OutPutType[]
}

interface OutPutType {
    files: OutFilesType[];
    id: number
}

interface OutFilesType {
    id: number;
    fileName: string;
    mimeType: string;
}

// 知识库类型的消息
export interface MessageKnowledge extends MessageSkillStatus {
    content: MessageKnowledgeParagraph[]
}

export interface MessageKnowledgeParagraph {
    uploader?: string;
    /**
     * 命中段落所属知识库id
     */
    id: number
    /**
     * 命中段落所属知识库名称
     */
    title: string
    /**
     * 命中知识库中的文件名
     */
    fileName: string
    /**
     * 命中知识的文件id
     */
    fileId: number
    /**
     * 命中段落的源文件mimeType
     */
    mimeType: string
    /**
     * 命中的段落在知识库文件的段落id
     */
    paragraphId: number
    /**
     * 命中段落的内容
     */
    content: string
}

interface HistoryType {
    total: number; // 总聊天记录数量
    totalPage: number; // 聊天记录总页数
    list: MessageItem[]; // 聊天记录，关于该类型，参考下面的介绍
}

export interface InitChatParams {
    agentId: string;
    workspaceId: string;
    authorization: string;
    user?: string;
    biz_key?: string;
    isHistory?: boolean;
}

export interface ChatMsgArrType {
    id: string;
    markdownParser?: MarkdownIt;
    msgInfo: MsgInfo;
}

export interface filesCheckType {
    file_id: number;
    file_name: string;
    mimetype: string;
    uploader?: string;
}

export interface AgentParams {
    agentId: string;
    authorization?: string;
    workspaceId?: string;
    userName?: string; // 用户信息
    userId?: string; // key
    accessKey?: string; // 密钥
    [propName: string]: string | undefined;
}

export const ChatEventBus = new EventBus();
export class ChatController {
    chatMsgArr: UnwrapNestedRefs<Message[]> = reactive([]);
    chatSDK: InstanceType<typeof ChatSDK>;
    messageContainer: HTMLElement | null = null;
    statusType: StatusType = 'FINISHED'; // 流式消息状态
    agentParams!: AgentParams; // agent参数
    isHistory: boolean = false; // 是否展示历史记录
    isRefresh: boolean = false; // 是否刷新状态
    subclassId: string = ''; // 子类的ID用于在更新消息时找到对应数据
    filesCheckList: filesCheckType[] = [] // 展示文件列表目前用于勾选文件
    hitList: MessageKnowledgeParagraph[] = []; // 命中列表
    welcomeTitle: string = 'Local Chat'; // 欢迎语
    viewStatus: boolean = false; // 展示状态
    msgStatus: string = 'FINISHED'; // 消息状态


    constructor(params: AgentParams, isHistory: boolean = true) {
        this.agentParams = params;
        console.log(params, 'paramsparams')
        this.isHistory = isHistory;
        ChatEventBus.on('updateMessage', this.updateMessage.bind(this));
    }
    async init() {
        this.chatSDK = new ChatSDK(this.agentParams, {
            messageListener: this.messageListener.bind(this),
            remoteMessageListener: this.remoteMessageListener.bind(this),
        });
        await this.chatSDK.initializeSDK();
        await this.loadHistory();
        this.scrollToBottom();
        this.viewStatus = true;
    }
    // 添加\删除所有数组文件
    filesListFilter(data: filesCheckType[]) {
        this.filesCheckList = data;
    }

    setMessageContainerRef(container: HTMLElement | null) {
        this.messageContainer = container;
    }

    // 设置新会话
    async setNewSession() {
        this.viewStatus = false;
        this.chatSDK.destoryListener();
        this.chatSDK.startConversation();
        this.refreshState();
        this.loadHistory();
        this.scrollToBottom();
        this.viewStatus = true;
    }

    // 停止当前AI的响应
    async stopCurrentRequest() {
        await this.chatSDK.stopCurrentRequest();
        this.msgStatus = 'STOP';
        this.chatMsgArr.forEach(item => {
            if (item.id === this.subclassId) {
                item.msgInfo.status = 'STOP'
                item.msgInfo.content = 'User stopped content generation'
                item.msgInfo.txtContent = 'User stopped content generation'
                item.msgInfo.addToRefreshList();
            }
            return item
        })
        if (!this.subclassId) {
            const lastMessageIndex = this.chatMsgArr.length - 1;
            const lastMessage = this.chatMsgArr[lastMessageIndex];
            lastMessage.msgInfo.status = 'STOP'
            lastMessage.msgInfo.content = 'User stopped content generation'
            lastMessage.msgInfo.txtContent = 'User stopped content generation'
        }
        this.isRefresh = false;
        this.statusType = 'FINISHED'
    }

    async updateMessage(payload: ChatMsgArrType) {
        console.log(this.statusType)
        if (this.statusType === 'FINISHED' || this.statusType === 'REFRESH') {
            this.isRefresh = true;
            this.subclassId = payload.id;
            await this.sendMessage(payload.msgInfo.userMessage.content);
        }
    }
    async setAgentId(params: AgentParams) {
        // 筛选属性
        Object.keys(params).forEach((item) => {
            if (this.agentParams[item]) {
                this.agentParams[item] = params[item];
            }
        })
        this.chatMsgArr = [];
        this.isRefresh = false;
        await this.init();
        this.scrollToBottom(800);
    }
    async sendMessage(text: string): Promise<void> {

        if (this.statusType === 'ING') return
        if (!this.isRefresh) {
            this.chatMsgArr.push(new Message(
                {
                    "role": roleType.USER,
                    "content": text,
                    "id": "",
                    "sessionId": ""
                }
            ));
            this.chatMsgArr.push(new Message(
                {
                    "role": roleType.ASSISTANT,
                    "content": "",
                    "id": "",
                    "sessionId": ""
                }
            ));
            this.scrollToBottom();
        }
        if (text !== "") this.chatSDK.sendMessage(text);
    }

    // 滚动监听
    async scrollToBottom(num: number = 0) {
        if (this.isRefresh) return
        await nextTick();
        setTimeout(() => {
            if (this.messageContainer) {
                this.messageContainer.scrollTo({
                    top: this.messageContainer.scrollHeight,
                });
            }
        }, num)
    }

    /**
     * 远程消息监听
     */
    async remoteMessageListener() {
        const msgHistory = await this.chatSDK.loadHistoryMessage(1, 999)
        const diffMessages = msgHistory.list.filter(historyMsg =>
            !this.chatMsgArr.some(chatMsg => chatMsg.id === historyMsg.id)
        );
        if (diffMessages.length == 0) return
        diffMessages.forEach(item => {
            this.chatMsgArr.push(new Message(item));
        })
        this.scrollToBottom();
        console.log(diffMessages, "远程有新的消息了", msgHistory, this.chatMsgArr)
    }

    // 加载历史消息处理方法
    async loadHistory() {
        const data: HistoryType = await this.chatSDK.loadHistoryMessage(1, 999);
        console.log('data-------', data)
        if (this.isHistory && data.list?.length > 0) {
            data.list.forEach(item => {
                this.chatMsgArr.push(new Message(item));
            })
        }
        const welcomeArr: AgentInfo = await this.chatSDK.getAgentInfo();
        this.chatMsgArr.unshift(new Message(welcomeArr));
        this.scrollToBottom(100);
        console.log(welcomeArr, '欢迎语。。。。。。。。。', this.chatMsgArr)
    }

    sendMessageChat(txt: string) {
        this.isRefresh = false;
        this.sendMessage(txt);
    }

    private refreshState() {
        this.chatMsgArr = [];
        this.statusType = 'FINISHED';
        this.msgStatus = 'FINISHED';
        this.hitList = [];
        this.isRefresh = false;
    }

    private async messageListener(data: MessageListenerPayload) {
        console.log(JSON.parse(JSON.stringify(data)), 'data.status', this, this.chatMsgArr, this.isRefresh)
        this.statusType = data.status;
        switch (data.status) {
            case 'START': {
                const lastMessageIndex = this.chatMsgArr.length - 1;
                const parsedMessage = new Message({
                    ...data.data,
                    txtContent: data.data.content,
                    status: data.status
                });
                if (!this.isRefresh) {
                    this.chatMsgArr[lastMessageIndex] = parsedMessage;
                } else {
                    this.chatMsgArr.forEach(item => {
                        if (item.id === this.subclassId) {
                            item.msgInfo.status = data.status;
                        }
                        return item
                    })
                }
                console.log("Message stream START.");
                break;
            }
            case 'ING': {
                // 是否是刷新当条信息
                if (this.isRefresh) {
                    this.chatMsgArr.forEach(item => {
                        if (item.id === this.subclassId) {
                            item.msgInfo.updateDisplayContent(data.data.content || "");
                            item.msgInfo.status = data.status;

                        }
                        return item
                    })
                } else {
                    const lastMessageIndex = this.chatMsgArr.length - 1;
                    if (lastMessageIndex >= 0) {
                        const lastMessage = this.chatMsgArr[lastMessageIndex];
                        lastMessage.msgInfo = new MsgInfo({
                            ...data.data,
                            content: data.data.content,
                            txtContent: data.data.content,
                            status: data.status
                        })
                    }
                }
                this.scrollToBottom();
                break;
            }
            case 'FINISHED': {
                if (this.isRefresh) {
                    this.chatMsgArr.forEach(item => {
                        if (item.id === this.subclassId) {
                            item.msgInfo.addToRefreshList();
                        }
                        return item
                    })
                }
                this.isRefresh = false;
                console.log("Message stream FINISHED.");
                break;
            }
            case 'FAILED': {
                this.setErrorInfo(data)
                this.isRefresh = false;
                console.error("FAILED");
                break;
            }
        }
    }

    private setErrorInfo(data: MessageListenerPayload) {
        const lastMessageIndex = this.chatMsgArr.length - 1;
        if (lastMessageIndex >= 0) {
            const lastMessage = this.chatMsgArr[lastMessageIndex];
            lastMessage.msgInfo = new MsgInfo({
                ...data.data,
                txtContent: '😮 Sorry that I cannot answer this question. Try to revise your questionand ask me again?',
                content: '😮 Sorry that I cannot answer this question. Try to revise your questionand ask me again?'
            })
        }
    }

}

export class Message {
    constructor(info: AssistantMessage) {
        this.markdownParser = new MarkdownIt();
        this.msgInfo = new MsgInfo(info);
        this.id = info.id || '';
    }

    msgInfo: MsgInfo;
    id: string;
    markdownParser: MarkdownIt;
    handleRefreshMsg() {
        ChatEventBus.emit('updateMessage', { id: this.id, msgInfo: this.msgInfo });
    }
}
export class MsgInfo {
    constructor(info: AssistantMessage) {
        this.markdownParser = new MarkdownIt();
        this.markdownParser.use(customCodeRenderer);
        this.content = info.content || '';
        this.txtContent = this.content;
        this.skills = info.skills || [];
        this.role = info.role;
        this.welcome = info.welcome;
        this.userMessage = info.userMessage || {
            role: roleType.USER, content: '', id: ''
        };
        this.questionGuide = info.questionGuide || [];
        this.skillsTypeList = this.skills?.filter(item =>
            item.metaData.title === "查找文件"
        );
        this.refreshList = info.refreshList?.length
            ? info.refreshList
            : [{
                ...info,
                content: info.success
                    ? this.markdownParser.render(this.content)
                    : '😮 Sorry that I cannot answer this question. Try to revise your question and ask me again?',
                refreshState: info.success ? 'FINISHED' : 'FAILED',
                txtContent: info.content
            }];
        this.knowledgeFileType = this.filterKnowledgeType()
        this.relatedQuestion = info.relatedQuestion || { content: [], status: "SUCCEEDED" };
        this.knowledge = info.knowledge || [];
        this.sessionId = info.sessionId || "";

        this.statusfun(info)
        this.processRole();
        this.processWelcome();
        this.processSkills();
        this.knowledgeFilterList = this.getUniqueContentItems(this.knowledge)
    }

    content: string;
    errorMessage!: string;
    txtContent: string;
    skills?: MessageSkill[];
    role?: string;
    refreshList: AssistantMessage[];
    markdownParser: MarkdownIt;
    welcome?: string;
    knowledgeFileType: boolean;
    skillsTypeList: MessageSkill[];
    userMessage: UserMessage
    relatedQuestion: MessageRelatedQuestion
    questionGuide: string[];
    knowledge: MessageKnowledge[]; // 过滤之前的原始知识库
    knowledgeFilterList: filesCheckType[] // 过滤之后的知识库文件列表
    sessionId: string
    status: string = '';

    public updateDisplayContent(newContent: string) {
        this.content = this.markdownParser.render(newContent);

        this.txtContent = newContent;
    }

    statusfun(info: AssistantMessage) {
        this.status = info.status || "FINISHED"
        if (!info.success) this.status = "ERROR";
    }

    public addToRefreshList() {
        this.refreshList.push({
            content: this.content,
            txtContent: this.txtContent,
            skills: this.skills,
            role: this.role,
            userMessage: this.userMessage,
            refreshList: [],
            refreshState: this.status
        });
    }

    setStatus(status: string) {
        this.status = status;
    }
    private filterKnowledgeType() {
        return this.skillsTypeList.length > 0;
    }

    private processRole() {
        if (this.role !== 'USER' && this.role) {
            this.content = this.markdownParser.render(this.content);
        }
    }

    private processWelcome() {
        if (!this.role && this.welcome) {
            this.welcome = this.markdownParser.render(this.welcome);
        }
    }

    private processSkills() {
        if (!this.skills) return
        if (this.skills.length > 0) {
            if (this.skillsTypeList.length > 0) {
                const typeOutput = this.skillsTypeList[0].output
                this.content = `Show all the ${typeOutput ? typeOutput.length + " files >" : ''
                    } `;
            }
        }
    }

    sendKnowledge() {
        ChatEventBus.emit('sendArrayToExternal', []);
        console.log(this.skills, 'sendKnowledge')
    }

    private getUniqueContentItems(data: MessageKnowledge[]): filesCheckType[] {
        if (this.knowledge.length < 1) return []
        const seenItems = new Set<string>();
        const uniqueContentItems: filesCheckType[] = [];

        data.forEach((statusItem) => {
            statusItem.content.forEach((contentItem) => {
                const uniqueKey = `${contentItem.id}-${contentItem.fileId}`;
                if (!seenItems.has(uniqueKey)) {
                    seenItems.add(uniqueKey);
                    // uniqueContentItems.push(contentItem);
                    uniqueContentItems.push({
                        file_id: contentItem.fileId,
                        file_name: contentItem.fileName,
                        mimetype: contentItem.mimeType,
                        uploader: contentItem.uploader,
                    });
                }
            });
        });
        return uniqueContentItems;
    }
}


// 自定义渲染
function customCodeRenderer(md: MarkdownIt) {
    const defaultRender = md.renderer.rules.fence || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    md.renderer.rules.fence = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const info = token.info ? md.utils.unescapeAll(token.info).trim() : '';

        if (info.startsWith('htmlRender')) {
            const code = token.content.trim();

            const tags = info.split('-').slice(1);
            const isChart = tags.includes('chart');

            let width = '100%';
            let height = '300px';

            if (isChart) {
                height = '400px';
                width = '400px';
            }

            return `
                <iframe 
                    style="width: ${width}; height: ${height}; border: none;" 
                    srcdoc="${code.replace(/"/g, '&quot;')}"
                    onload="this.style.height = this.contentWindow.document.body.scrollHeight + 'px';this.style.width = this.contentWindow.document.body.scrollWidth + 'px';"
                ></iframe>
            `;
        }

        return defaultRender(tokens, idx, options, env, self);
    };
}