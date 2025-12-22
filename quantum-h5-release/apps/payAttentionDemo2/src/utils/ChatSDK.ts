import { AgentChat, Message as MessageClass } from "@bty/chat-logic-core";
import { MessageListenerPayload } from '@/types/Chat';
import { AgentParams } from '@/types/Chat';
interface ConversationItem {
    id: string;
    title: string;
    uid: number;
}
interface AgentListener {
    messageListener?: (data: MessageListenerPayload) => void;
    remoteMessageListener?: () => void;
}
export class ChatSDK {
    messageInstance!: MessageClass; // 消息实例，用于监听
    agentChat!: InstanceType<typeof AgentChat>; // sdk实例
    agentParams!: AgentParams;
    historyList: ConversationItem[] = [];
    listener: AgentListener = {};
    messageListenerFun: (data: MessageListenerPayload) => void | undefined;
    remoteMessageListenerFun: () => void;
    constructor(params: AgentParams, listener: AgentListener) {
        this.agentParams = params;
        this.listener = listener;
        this.messageListenerFun = listener.messageListener?.bind(this);
        this.remoteMessageListenerFun = listener.remoteMessageListener?.bind(this);
    }
    // 初始化
    public async initializeSDK() {
        if(!this.agentChat) {
            this.agentChat = new AgentChat(this.agentParams);
        }
        await this.startConversation();
        return this.agentChat;
    }
    // 获取历史记录
    async getHistoryList() {
        return await this.agentChat.conversation.getConversationList();
    }
    // 获取消息实例
    async getMessageInstance(isHistory: boolean = false) { // 默认是新会话
        if (isHistory) {
            // 加载历史会话
            return await this.agentChat.conversation.loadConversation(this.historyList[0].id);
        } else {
            return await this.agentChat.conversation.createConversation('新会话-' + new Date());
        }
    }

    // 开始新的会话
    async startConversation() {
        this.historyList = await this.getHistoryList();
        this.messageInstance = await this.getMessageInstance(this.historyList.length > 0);
        if(this.listener.messageListener) {
            this.messageInstance?.addMessageListener(this.messageListenerFun);
        }
        if(this.listener.remoteMessageListener) {
            this.messageInstance?.addRemoteMessageListener(this.remoteMessageListenerFun);
        }
    }

    // 销毁消息会话
    async destoryListener() {
        this.messageInstance.removeMessageListener(this.messageListenerFun);
        this.messageInstance?.destroy();
        console.log('销毁全部成功？？？？');
    }

    // 加载会话历史消息
    async loadHistoryMessage(pageIndex: number, pageSize: number) {
        return await this.messageInstance?.getHistoryMessage(pageIndex, pageSize)
    }

    // 停止传输数据
    async stopCurrentRequest() {
        return await this.messageInstance?.stopCurrentRequest();
    }

    // 发送消息
    async sendMessage(txt: string) {
        return await this.messageInstance?.sendMessage(txt);
    }

    // 获取欢迎语信息
    async getAgentInfo() {
        return await this.agentChat.getAgentInfo()
    }
}