<template>
  <div class="chat-data-sync">
    <!-- 这个组件不渲染任何内容，只负责数据同步 -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { chatHistoryListener } from '@/utils/indexedDBListener';

const props = defineProps({
  // 可以接收一些配置参数
});

const emit = defineEmits(['chat-update']);

// 处理聊天数据更新
const handleChatUpdate = (chatHistory: any[]) => {
  console.log('监听到聊天数据更新:', chatHistory);
  emit('chat-update', chatHistory);
};

// 启动数据同步
const startSync = () => {
  chatHistoryListener.addListener(handleChatUpdate);
  chatHistoryListener.startPolling(500);
};

// 停止数据同步
const stopSync = () => {
  chatHistoryListener.removeListener(handleChatUpdate);
  chatHistoryListener.stopPolling();
};

onMounted(() => {
  startSync();
});

onUnmounted(() => {
  stopSync();
});
</script>