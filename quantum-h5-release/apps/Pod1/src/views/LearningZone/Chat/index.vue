<!-- index.vue -->
<template>
  <div class="learning-zone-chat">
    <div :class="['left', { 'full-width': !isValidCardType }]">
      <ChatView ref="chatPageRef" class="h-full" />
    </div>
    <div class="right" v-if="isValidCardType">
      <QuizContainer v-if="finalCardType === 'quiz'" />
      <NotesContainer v-else-if="['notes', 'note'].includes(finalCardType)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatView from '@/components/ChatView/index.vue'
import QuizContainer from "../components/QuizContainer/index.vue";
import NotesContainer from "../components/Notes/NoteDetailIndex.vue";
import { useRoute, useRouter } from "vue-router";
import { onMounted, onBeforeUnmount, ref, provide, computed,onUnmounted, watch, nextTick } from "vue";
import { ChatEventBus } from "@libs/p-comps/ChatBaseComponent/types/AIServiceGateway";
import { useQuiz } from "@libs/p-comps/ChatBaseComponent";
import type { ChatController } from "@libs/p-comps";
import { AnswerActionType } from "@libs/p-comps";
import { LEARNING_ZONE_TEMPLATES } from "./demo/templates";
import { EventBus } from "@quantum/use";

const route = useRoute();
const chatPageRef = ref<InstanceType<typeof ChatView>>();
const localCardType = ref<string | null>(null);
const appliedTemplateKey = ref<string | null>(null);
const lastAppliedChat = ref<ChatController | null>(null);
const { setQuizList } = useQuiz();

// 合并 params 和 query 参数，优先取 params（可根据需求调整优先级）
const finalCardType = computed(() => {
  // 若 params 中有 cardType 则用 params，否则用 query
  return (
    localCardType.value ||
    (route.params.cardType as string) ||
    (route.query.cardType as string) ||
    ""
  );
});

const finalChatId = computed(() => {
  // 同理处理 chatId
  return (route.params.chatId as string) || (route.query.chatId as string) || "";
});

const templateKey = computed(() => (route.query.template as string) || "");

// 计算属性判断是否为有效卡片类型
const isValidCardType = computed(() => {
  return ["quiz", "notes", "note"].includes(finalCardType.value);
});

const currentMessageId = ref("b8d5c085-1dc5-4435-9ec0-1384747a8741");

// 使用合并后的参数
provide("currentChatId", `chat-${finalChatId.value}-messages`);
provide("currentMessageId", currentMessageId);

// 监听组件通过事件总线传递的数据
const handleData = (data) => {
  console.log("----stoprecording数据----：", data);
  handleClick(data);
};
// 接收到 tools 回答时，设置答案
const handleClick = (path: string) => {
  chatPageRef.value?.chat
    ?.setQueryValue(`Generate structured notes based on the file path i provided you with ."${path}"
 `);
};
onMounted(() => {
  if (route.params.cardType) {
    localCardType.value = route.params.cardType as string;
  }
  handleCardType(finalCardType.value);
  console.log('Learning Zone Chat 页面已加载');
  ChatEventBus.on('openLZQuiz', openLZQuizHandler);
  ChatEventBus.on('openLZNote', openLZNoteHandler);
  EventBus.on("fromAudioWaveToGrandparent", handleData);

});

onBeforeUnmount(() => {
  ChatEventBus.clear('openLZQuiz');
  ChatEventBus.clear('openLZNote');
  EventBus.off('fromAudioWaveToGrandparent', handleData);
});
const openLZQuizHandler = (payload: { chatId?: string; messageId?: string }) => {
  localCardType.value = "quiz";
  currentMessageId.value = payload?.messageId || "";
};

const openLZNoteHandler = (payload: { chatId?: string; messageId?: string }) => {
  localCardType.value = 'note';
  currentMessageId.value = payload?.messageId || '';
};



const handleCardType = (type: string) => {
  switch (type) {
    case "quiz":
      console.log("显示 Quiz 容器");
      break;
    case "notes":
    case "note":
      console.log("显示 Notes 容器");
      break;
    default:
      console.log("默认处理（仅显示左侧聊天）");
  }
};

const applyTemplateIfNeeded = async () => {
  if (!templateKey.value) return;
  const template = LEARNING_ZONE_TEMPLATES[templateKey.value];
  if (!template) return;
  const currentChat = chatPageRef.value?.chat as ChatController | undefined;
  if (!currentChat) return;
  if (appliedTemplateKey.value === template.key && lastAppliedChat.value === currentChat) {
    return;
  }

  appliedTemplateKey.value = template.key;
  lastAppliedChat.value = currentChat;
  localCardType.value = template.cardType;
  currentMessageId.value = template.messageId;

  currentChat.setWelcomeType(false);
  currentChat.chatUid = template.chatId;
  currentChat.initChatAction(template.chatMessages);
  await nextTick();
  if (template.quizList?.length) {
    await setQuizList(template.quizList);
  }
};

watch(
  [templateKey, () => chatPageRef.value?.chat],
  async () => {
    await applyTemplateIfNeeded();
  },
  { immediate: true }
);

defineOptions({
  name: "LearningZoneChat",
});
</script>

<style scoped lang="less">
/* 样式部分调整为自适应宽度，解决小窗溢出问题 */
.learning-zone-chat {
  display: flex;
  height: 100%;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  padding: 0 10px;
  min-width: 0; /* 防止容器被内容撑开 */

  .left {
    /* 使用固定比例分配空间，限制最大宽度 */
    flex: 1 1 50%;
    max-width: 50%; /* 关键：限制最大宽度为50% */
    min-width: 250px;
    margin-right: 10px;
    position: relative;
    overflow: auto; /* 内容溢出时内部滚动 */
    box-sizing: border-box; /* 确保padding和border不影响宽度计算 */
    width: 0; /* 触发flexbox的宽度计算，避免内容撑开 */
    height: 100%;

    &.full-width {
      flex: 1 1 100%;
      max-width: 100%; /* 全屏时占满宽度 */
      margin-right: 0;
      width: 0; /* 保持flex计算逻辑 */
    }
  }

  .right {
    flex: 1 1 50%;
    max-width: 50%; /* 右侧同样限制最大宽度 */
    min-width: 250px;
    position: relative;
    overflow: auto;
    box-sizing: border-box;
    width: 0; /* 触发flexbox宽度计算 */
  }


  /* 中等屏幕适配 - 调整比例 */
  @media (max-width: 1024px) {
    .left {
      flex: 5;
      max-width: 300px;
    }
    .right {
      flex: 5;
      min-width: 250px;
    }
  }

}
</style>
