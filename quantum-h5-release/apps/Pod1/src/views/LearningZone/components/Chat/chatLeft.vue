<template>
  <div :class="['chat-wrap']">
    <div class="chat-wrap-title" v-if="isInit">
      <img :src="IconImg" class="icon-img" />
      <QIcons class="clear-chat" name="close" round size="20" @click="clearChatAction"></QIcons>
    </div>
    <!-- <QuizCard /> -->
    <ChatBase v-if="isChatBaseVisible" :chat="chat" @toggle-init="toggleInit">
      <template #questionSlot="{ questions }" v-if="!chat?.isWelcome">
        <div class="query-container">
          <QuestionPage :queryItem="questions" />
          <QueryOperation class="query-operation" :queryItem="questions" />
        </div>
      </template>
      <template #answerSlot="{ answers }" v-if="!chat?.isWelcome">
        <div class="answer-container">
          <AnswerPage :chat="chat" :answerItem="answers.answerData as Answer" />
        </div>
      </template>
      <template #inputSlot>
        <InputPage :chat="chat" :isInit="isInit" pod="pod1" />
      </template>
    </ChatBase>
  </div>
</template>

<script setup lang="ts">
import { ChatBase, ChatController, QIcons } from "@libs/p-comps";
import Answer from "@libs/p-comps/ChatBaseComponent/types/Answer";
import mySDK from "./chatService";
import { onMounted, ref, watch, onUnmounted } from "vue";
import { InputPage, QuestionPage, AnswerPage } from "@libs/p-comps/ChatView";
import IconImg from "@/assets/Icon.png";
// import { QuizCard } from "@libs/p-comps";
const chat = ref<ChatController>();
const isChatBaseVisible = ref(true);
const isInit = ref<boolean>(false);

const resetChatBase = () => {
  isChatBaseVisible.value = false;
  mySDK.init();
  chat.value = new ChatController(mySDK);
  console.log(chat.value, "chat.value");
  chat.value.setWelcomeType(false);
  isChatBaseVisible.value = true;
};
resetChatBase();
const clearChatAction = () => {
  resetChatBase();
  isInit.value = false;
};

onMounted(() => {});
const toggleInit = (init: boolean) => {
  isInit.value = init;
};

onUnmounted(() => {});
</script>

<style lang="less" scoped>
.chat-wrap {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  // max-height: 616px;
  font-size: 32px;
  position: relative;
  height: 90vh;
  max-width: 100%;

  &-title {
    display: flex;
    align-items: center;
    padding-bottom: 10px;
    border-radius: 20px 20px 0 0;
    height: 50px;
    width: 100%;
    z-index: 10;
    justify-content: space-between;
    .clear-chat {
      cursor: pointer;
    }

    .icon-img {
      width: 24px;
      height: 24px;
    }
  }

  > * {
    box-sizing: border-box;
  }

  &_welcome {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    // 940 / viewport * desktopWidth
    max-width: 940px;
    text-align: center;
    margin-bottom: 20px;
  }
}

.answer-container {
  position: relative;

  &:hover .answer-operation {
    opacity: 1;
    visibility: visible;
  }
}

.answer-operation {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.query-container {
  position: relative;

  &:hover .query-operation {
    opacity: 1;
    visibility: visible;
  }
}

.query-operation {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
  z-index: 10;
  height: 24px;
}

:deep(.chat-box) {
  flex: 1;
  overflow: hidden;
}
</style>
