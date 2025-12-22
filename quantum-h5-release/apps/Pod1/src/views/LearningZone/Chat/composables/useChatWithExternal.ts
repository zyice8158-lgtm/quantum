// composables/useChatWithExternal.ts
import { ref, computed } from 'vue';
import { useExternalChat, type ExternalChatMessage } from './useExternalChat';

export function useChatWithExternal() {
  const {
    externalChatHistory,
    isExternalSource,
    isNewChatSession,
    currentChatId,
    markSessionAsProcessed,
    hasNewSession
  } = useExternalChat();

  const isNewChatLoading = ref(false);

  // 转换数据格式
  const convertToChatFormat = (messages: ExternalChatMessage[]): any[] => {
    return messages.map((msg, index) => ({
      id: msg.id || Date.now() + index,
      timestamp: msg.timestamp || new Date().toISOString(),
      content: msg.content || msg.text || '',
      type: msg.type || 'user',
      chatId: msg.chatId,
      intentionType: msg.intentionType,
      files: msg.files || [],
      ...msg
    }));
  };

  // 开启新聊天会话
  const startNewChatSession = (chatController: any): boolean => {
    if (!chatController || externalChatHistory.value.length === 0) {
      return false;
    }

    console.log('开启新聊天会话，消息数量:', externalChatHistory.value.length);
    
    try {
      isNewChatLoading.value = true;
      
      // 清空当前聊天
      chatController.clearChatAction();
      
      // 转换数据格式
      const convertedMessages = convertToChatFormat(externalChatHistory.value);
      
      // 初始化聊天动作
      chatController.initChatAction(convertedMessages);
      
      console.log('新聊天会话加载完成');
      
      // 标记会话已处理
      markSessionAsProcessed();
      isNewChatLoading.value = false;
      
      return true;
      
    } catch (error) {
      console.error('开启新聊天会话失败:', error);
      isNewChatLoading.value = false;
      return false;
    }
  };

  // 处理新会话
  const handleNewChatSession = (chatController: any): boolean => {
    if (hasNewSession.value && chatController) {
      return startNewChatSession(chatController);
    }
    return false;
  };

  return {
    // 来自 useExternalChat
    externalChatHistory,
    isExternalSource,
    isNewChatSession: computed(() => isNewChatSession.value),
    currentChatId,
    shouldStartNewChat: computed(() => hasNewSession.value && !isNewChatLoading.value),
    isNewChatLoading,
    
    // 方法
    startNewChatSession,
    handleNewChatSession,
    markSessionAsProcessed,
    
    // 传递给组件的 props
    chatProps: computed(() => ({
      externalChatHistory: externalChatHistory.value,
      isExternalSource: isExternalSource.value,
      shouldStartNewChat: hasNewSession.value && !isNewChatLoading.value,
      currentChatId: currentChatId.value
    }))
  };
}

// 确保默认导出
export default useChatWithExternal;