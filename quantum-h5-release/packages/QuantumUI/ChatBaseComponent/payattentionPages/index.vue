<template>
  <slot name="welcomeSlot"></slot>
  <div class="chat-box chat-box-flex">
    <!-- 有数据加一个间距 -->
    <div
      class="chat-box_region"
      ref="ContainerRef"
      :style="{ 'padding-bottom': chat.chatAction.length > 0 ? '10px' : 0 }"
    >
      <!-- <div class="chat-empty-bar" v-if="chat.chatAction.length > 0"></div> -->
      <slot name="preChat" v-if="!chat.chatAction.length"></slot>
      <slot name="payAttentionCard"></slot>
      <!-- 遍历 chatAction 并区分类型 -->
      <template v-for="(item, index) in chat.chatAction" :key="index">
        <div>
          <!-- 有的指令只有答案显示没有问题，这里判空 -->
          <!-- 问题部分 -->
          <div
            v-if="item.getData().type === ChatComponentType.QUERY"
            class="chat-box_region_content"
          >
            <QuestionPage :questionItem="item as Question" class="chat-box_content_query">
              <template #question="item">
                <slot name="questionSlot" :questions="item.questionItem"></slot>
              </template>
            </QuestionPage>
          </div>

          <!-- 回答部分 -->
          <div
            v-else-if="item.getData().type === ChatComponentType.ANSWER"
            class="chat-box_region_answer"
          >
            <AnswerCom :answerItem="item as Answer">
              <template #answer="item">
                <slot name="answerSlot" :answers="item"></slot>
              </template>
            </AnswerCom>
          </div>
        </div>
      </template>
    </div>
    <slot name="bottomSlotBut"></slot>
    <InputView class="chat-box_input">
      <template #input>
        <slot name="inputSlot"></slot>
      </template>
    </InputView>
  </div>
</template>

<script setup lang="ts">
import AnswerCom from "./answer/index.vue";
import QuestionPage from "./question/index.vue";
import InputView from "./input/index.vue";
// import QuickEntry from "../../QuickEntry/index.vue";
import { Answer, ChatController, Question } from "../types/ChatClass";
import { ChatComponentType } from "../types";
import { ref, watchEffect } from "vue";

const props = defineProps<{
  chat: ChatController | undefined;
}>();
// console.log('chatAction-------', props.chat.chatAction);
const ContainerRef = ref<HTMLElement | null>(null);

watchEffect(() => {
  props.chat?.setMessageContainerRef(ContainerRef.value);
});
</script>

<style scoped lang="less">
.chat-box-flex {
  justify-content: center;
  align-items: center;
}

.chat-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  justify-content: space-evenly;

  &_region {
    width: 100%;
    overflow: hidden;
    /* flex: 0 0 auto; */

    &_content {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      align-content: space-between;
      align-content: flex-end;

      &_query {
        background: rgba(235, 233, 248, 1);
        padding: 8px 24px;
        color: #000;
        font-weight: 400;
        font-size: 14px;
        vertical-align: middle;
        border-top-left-radius: 25px;
        border-bottom-right-radius: 20px;
        border-bottom-left-radius: 25px;
        display: flex;
        width: fit-content;
        word-break: break-all;
        height: 22px;
      }
    }

    &_answer {
      /* margin-top: 24px; */
      /* width: fit-content; */
      display: flex;
    }
  }

  &_input {
    display: flex;
    align-items: center;
    /* margin: 0 auto; */
    /* height: 60px; */
    width: 100%;
    border-radius: 100px;
    /* background: rgba(235, 238, 241, 0.80);
        backdrop-filter: blur(0px); */
  }
  &_content_query {
    max-width: 85%;
  }
}
</style>
