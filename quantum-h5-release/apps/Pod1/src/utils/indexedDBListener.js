class IndexedDBListener {
    constructor(dbName = 'ChatDatabase', storeName = 'keyvaluepairs', key = 'chat-history') {
      this.dbName = dbName;
      this.storeName = storeName;
      this.key = key;
      this.listeners = new Set();
      this.isListening = false;
      this.lastData = null;
    }
  
    // 初始化 IndexedDB
    initIndexedDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
      });
    }
  
    // 获取聊天历史数据
    async getChatHistory() {
      try {
        const db = await this.initIndexedDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([this.storeName], 'readonly');
          const store = transaction.objectStore(this.storeName);
          const request = store.get(this.key);
          
          request.onsuccess = () => {
            let chatHistory = request.result || [];
            
            // 数据格式处理
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
    }
  
    // 检查数据变化
    async checkForChanges() {
      const currentData = await this.getChatHistory();
      const currentHash = JSON.stringify(currentData);
      const lastHash = JSON.stringify(this.lastData);
      
      if (currentHash !== lastHash) {
        this.lastData = currentData;
        this.notifyListeners(currentData);
      }
    }
  
    // 添加监听器
    addListener(callback) {
      this.listeners.add(callback);
      // 立即发送当前数据
      this.getChatHistory().then(data => callback(data));
    }
  
    // 移除监听器
    removeListener(callback) {
      this.listeners.delete(callback);
    }
  
    // 通知所有监听器
    notifyListeners(data) {
      this.listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('监听器执行错误:', error);
        }
      });
    }
  
    // 开始监听
    startPolling(interval = 500) {
      if (this.isListening) return;
      
      this.isListening = true;
      this.pollingInterval = setInterval(() => {
        this.checkForChanges();
      }, interval);
    }
  
    // 停止监听
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
      this.isListening = false;
    }
  }
  
  // 创建全局单例
  export const chatHistoryListener = new IndexedDBListener();