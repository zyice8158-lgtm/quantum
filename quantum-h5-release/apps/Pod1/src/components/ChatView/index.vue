<template>
  <ChatBase :chat="chat" ref="ChatBaseContent">
    <template #questionSlot="{ questions }" v-if="!chat?.isWelcome">
      <div class="query-container">
        <QuestionPage :queryItem="questions" />
      </div>
    </template>
    <template #answerSlot="{ answers }" v-if="!chat?.isWelcome">
      <div class="answer-container">
        <AnswerPage :chat="chat" :answerItem="answers.answerData" />
      </div>
    </template>
    <template #inputSlot>
      <div class="w-full" ref="ElRef">
        <!-- <QuizNoteToggle v-if="isLearningZonePath" @tab-change="handleTabChange" class="quiz-note-toggle" /> -->
        <InputPage :key="state.chatId" :isShowArrow="ChatBaseContent?.isShowArrow" :scrollToChatBottom="ChatBaseContent?.scrollToChatBottom"
          :chat="chat" pod="pod1" :inputStatus="chatStatus" :staticSuggestion="staticSuggestion" @fileSelect="onFileSelect"
          @fileDelete="onFileDelete" :fileSearchList="files" :customEnterSend="customEnterSend" />
      </div>
    </template>
  </ChatBase>
</template>

<script lang="tsx" setup>
import { changeCurrentSession, createChatSession, getChatData, getChatHistory, unshiftChatTempHistory } from '@/store/chat';
import { AnswerPage, ChatBase, ChatController, ChatStatus, InputPage, QuestionPage } from '@libs/p-comps';
import { useFileScope } from '@libs/p-comps/hooks/useFiles';
import { computed, nextTick, onBeforeMount, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import mySDK from './sdkService';
import { ChatEventBus } from '@libs/p-comps/ChatBaseComponent/types/AIServiceGateway';
import { apiUpdateSessionName } from '@libs/service';
import { ChatViewChannel, ChatWinStore } from '@/store/chatWin';
import { SuggestionStore } from '@/store';
defineOptions({
  name: 'Chat'
});

const route = useRoute()
const router = useRouter()
const ChatBaseContent = ref<InstanceType<typeof ChatBase> | null>(null)
const chat = ref<ChatController>();
const chatStatus = computed(() => {
  return chat.value?.getChatStatus();
});
const staticSuggestion = computed(() => {
  return SuggestionStore.Suggestion.slice(0, 3)
});

const state = reactive({
  chatId: route.params.chatId as string | undefined,
  initDone: false,
});


let chatData: any;
/**
 * 初始化Chat
 * - 检测到对话记录重新渲染
 * - 检测到queryObject重新发送问题
 */
const initChatData = async () => {
  onFileclear();
  mySDK.init();
  chat.value = new ChatController(mySDK, { fileScope, sessionId: state.chatId });
  let needMessages = true
  if (route.name === 'ChatWin') {
    if (!ChatWinStore.currentChatId) {
      ChatWinStore.currentChatId = await createChatSession()
      needMessages = false
    }
    state.chatId = ChatWinStore.currentChatId
  }
  if (state.chatId) {
    changeCurrentSession(state.chatId)
    chatData = await getChatData(state.chatId, { needMessages })
    if (chatData?.messages?.length > 0) {
      chat.value.initChatAction(chatData.messages);
      return
    }
  }
  if (history.state.queryObject) {
    chat.value.setQueryObject(history.state.queryObject);
  }
  sentMessage4ChatName()
}

onBeforeMount(async () => {
  state.initDone = false
  await initChatData()
  state.initDone = true
})

if (route.name === 'ChatWin') {
  watch(() => ChatWinStore.currentChatId, () => {
    if (!ChatWinStore.currentChatId) {
      console.log('initChatData', ChatWinStore.currentChatId)
      initChatData()
    }
  })
}

const ElRef = ref<HTMLElement>()
onMounted(async () => {
  await nextTick()
  const TextareaEl = ElRef.value.querySelector('textarea');
  TextareaEl?.focus();
  TextareaEl?.click();
})
// ---- chat name ----
const sentMessage4ChatName = () => {
  if (state.chatId && (!chatData?.messages.length || !chatData?.sessionName)) {
    // 第一次回包后发送一下创建标题
    const watchCreateTitle = watch(() => chat.value?.chatStatus.value, async (newStatus) => {
      if (newStatus === ChatStatus.DONE) {
        watchCreateTitle.stop();
        await nextTick()
        try {
          const res = await chat.value.createChatTile()
          if (res) {
            const { Data } = res.data as any
            const { data } = JSON.parse(Data.Chunk) as any
            await apiUpdateSessionName({
              SessionId: state.chatId as string,
              SessionName: data.text,
            })
          }
        } catch (error) {
        }
        if (route.name === 'FullViewChat') {
          getChatHistory()
        }
      }
    })
  }
}


onUnmounted(() => {
  chat.value.stopMessage()
})

ChatViewChannel.onPing()
ChatViewChannel.on('setQueryObject', async (queryObject) => {
  if (route.name === 'ChatWin') {
    if(state.chatId){
      await new Promise((resolve) => {
        const watchHandle = watch(() => state.initDone, (initDone) => {
          if(initDone){
            watchHandle.stop()
            resolve(initDone)
          }
        })
      })
    }else{
      await new Promise((resolve) => {
        const watchHandle = watch(() => ChatWinStore.currentChatId, (newChatId) => {
          watchHandle.stop()
          resolve(newChatId)
        })
      })
    }
  }
  chat.value.setQueryObject(queryObject);
})

const fileScope = 'Chat'
const {
  files,
  onFileDelete,
  onFileSelect,
  deleteScope,
  onFileclear
} = useFileScope({ scope: fileScope })

onUnmounted(deleteScope)


/** new Chat 跳转到新的窗口发送信息 */
const customEnterSend = (route.name === 'FullViewChat' && !route.params.chatId) ? (async ({ content, payload }: { content: string, payload?: any }) => {
  const sessionId = await createChatSession() as string
  if (sessionId) {
    unshiftChatTempHistory(sessionId)
    router.push({
      name: "FullViewChat",
      params: { chatId: sessionId },
      state: {
        queryObject: JSON.parse(JSON.stringify({ content: content, files: files.value, payload }))
      }
    })
  }
}) : null;


// ----- learn zone -----
const isLearningZonePath = route.path.includes('/quantum/learning-zone')
const openLZQuizHandler = (payload: { chatId?: string; messageId?: string }) => {
  if (!isLearningZonePath) {
    router.push({
      name: 'LearningZoneChat',
      params: { chatId: payload?.chatId || (route.params.chatId as string), cardType: 'quiz' },
      query: { messageId: payload?.messageId || '' }
    });
  }
};
const openLZNoteHandler = (payload: { chatId?: string; messageId?: string }) => {
  if (!isLearningZonePath) {
    router.push({
      name: 'LearningZoneChat',
      params: { chatId: payload?.chatId || (route.params.chatId as string), cardType: 'note' },
      query: { messageId: payload?.messageId || '' }
    });
  }
};
const openLZRecordNoteHandler = (payload: { chatId?: string; messageId?: string }) => {
  if (!isLearningZonePath) {
    router.push({
      name: 'LearningZoneChat',
      params: { chatId: payload?.chatId || (route.params.chatId as string), cardType: 'record' },
      query: { messageId: payload?.messageId || '' }
    });
  }
};
ChatEventBus.on('openLZQuiz', openLZQuizHandler);
ChatEventBus.on('openLZNote', openLZNoteHandler);
ChatEventBus.on('openLZRecordNote', openLZRecordNoteHandler);


</script>

<style lang="less" scoped></style>
