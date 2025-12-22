// composables/useExternalChat.ts
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

export interface ExternalChatMessage {
  id: string | number;
  timestamp: string;
  content: string;
  text?: string;
  type?: string;
  chatId?: string;
  intentionType?: string;
  files?: any[];
  isNewSession?: boolean;
  [key: string]: any;
}

export function useExternalChat() {
  const route = useRoute();
  
  const externalChatHistory = ref<ExternalChatMessage[]>([]);
  const isExternalSource = ref(false);
  const isNewChatSession = ref(false);
  const currentChatId = ref<string>('');

  let pollingInterval: number | null = null;
  let lastChatHistoryHash = '';

  // 动态获取数据库版本
  const getCurrentDBVersion = (): Promise<number> => {
    return new Promise((resolve) => {
      const request = indexedDB.open('localforage');
      request.onsuccess = () => {
        const db = request.result;
        const version = db.version;
        db.close();
        resolve(version);
      };
      request.onerror = () => {
        resolve(2); // 默认版本
      };
    });
  };

  // 初始化 IndexedDB
  const initIndexedDB = async (): Promise<IDBDatabase> => {
    const currentVersion = await getCurrentDBVersion();
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('localforage', currentVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('keyvaluepairs')) {
          db.createObjectStore('keyvaluepairs');
        }
      };
    });
  };

  // 获取聊天历史
  const getChatHistoryFromIndexedDB = async (): Promise<ExternalChatMessage[]> => {
    try {
      const db = await initIndexedDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['keyvaluepairs'], 'readonly');
        const store = transaction.objectStore('keyvaluepairs');
        const request = store.get('chat-history');
        
        request.onsuccess = () => {
          let chatHistory = request.result || [];
          
          if (typeof chatHistory === 'string') {
            try {
              chatHistory = JSON.parse(chatHistory);
            } catch {
              chatHistory = [];
            }
          } else if (!Array.isArray(chatHistory)) {
            chatHistory = [];
          }
          
          resolve(chatHistory);
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('获取聊天历史失败:', error);
      return [];
    }
  };

  // 检查数据变化
  const checkForChanges = async () => {
    try {
      const chatHistory = await getChatHistoryFromIndexedDB();
      const currentHash = JSON.stringify(chatHistory);
      
      if (currentHash !== lastChatHistoryHash) {
        console.log('检测到 IndexedDB 聊天历史变化:', chatHistory);
        
        const hasNewSession = chatHistory.some(msg => msg.isNewSession);
        
        if (hasNewSession) {
          console.log('检测到新聊天会话');
          isNewChatSession.value = true;
          
          const latestChatId = chatHistory[chatHistory.length - 1]?.chatId;
          if (latestChatId) {
            currentChatId.value = latestChatId;
            const currentSessionMessages = chatHistory.filter(msg => msg.chatId === latestChatId);
            externalChatHistory.value = currentSessionMessages;
          }
        } else {
          externalChatHistory.value = chatHistory;
        }
        
        lastChatHistoryHash = currentHash;
        isExternalSource.value = chatHistory.length > 0;
      }
    } catch (error) {
      console.error('检查变化时出错:', error);
    }
  };

  // 开始监听
  const startPolling = () => {
    if (pollingInterval) return;
    
    pollingInterval = window.setInterval(checkForChanges, 1000);
    console.log('IndexedDB 监听器已启动');
  };

  // 停止监听
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    console.log('IndexedDB 监听器已停止');
  };

  const markSessionAsProcessed = () => {
    isNewChatSession.value = false;
  };

  const isLearningZonePath = computed(() => {
    return route.path.includes('/quantum/learning-zone');
  });

  onMounted(async () => {
    if (isLearningZonePath.value) {
      await checkForChanges();
      startPolling();
    }
  });

  onUnmounted(() => {
    stopPolling();
  });

  return {
    externalChatHistory,
    isExternalSource,
    isNewChatSession,
    currentChatId,
    startPolling,
    stopPolling,
    markSessionAsProcessed,
    hasExternalData: computed(() => externalChatHistory.value.length > 0),
    hasNewSession: computed(() => isNewChatSession.value),
    latestMessage: computed(() => 
      externalChatHistory.value.length > 0 
        ? externalChatHistory.value[externalChatHistory.value.length - 1] 
        : null
    )
  };
}