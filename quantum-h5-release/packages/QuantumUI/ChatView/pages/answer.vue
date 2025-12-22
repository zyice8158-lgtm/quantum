<template>
  <div class="answer-container_main">
    <AnswerLoading :answerItem="answerItem"/>
    <template v-if="answerItem?.chatStatusAnswer.value !== ChatStatus.START">
      <component v-if="
        answerItem.answerData.actionType === AnswerActionType.THIRD_PARTY_AGENT
        || answerItem.answerData.actionType === AnswerActionType.FOLLOW_UP
        || answerItem.answerData.actionType === AnswerActionType.PERPLEXITY
      " :is="AnswerComp" :chat="chat" :answerItem="answerItem" noTool />
      <div v-else :class="['answer-container_wrapper', { 'is-cmu-bar': isCmuBar }]">
        <AnswerThinking :answerItem="answerItem"/>
        <div class="answer-tool" v-if="answerItem.answerData.tool">Tool Name: {{ answerItem.answerData.tool }}</div>
        <component :is="AnswerComp" :chat="chat" :answerItem="answerItem" noTool />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChatStatus, ChatController, answerMap, AnswerActionType } from '../../index';
import AnswerLoading from '../../AnswerCard/Pod1/AnswerLoading.vue';
import Answer from '../../ChatBaseComponent/types/Answer';
import AnswerThinking from '../../AnswerCard/Pod1/AnswerThinking.vue';

const props = defineProps<{
  answerItem: Answer | undefined,
  chat: ChatController | undefined,
  noTool?: boolean,
  loadingText?: 'Summarizing Notifications' | undefined
}>();
console.log('answerItem-------', props.answerItem);
const AnswerComp = computed(() => {
  console.log('计算了回答卡片-------------------', props.answerItem.answerData.actionType);
  return answerMap[props.answerItem.answerData.actionType];
});
const isCmuBar = computed(() => {
  return props.answerItem.answerData.actionType === 'cmu' && props.answerItem.answerData.queryData.isCatchMeUp;
});
</script>

<style scoped lang="less">
.answer-container_wrapper {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 24px 24px 24px 0;
  position: relative;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.30), 0 1px 3px 1px rgba(0, 0, 0, 0.12);
  &.is-cmu-bar {
    border-radius: none;
    box-shadow: none;
    background-color: transparent;
  }
  .video-play-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      min-width: 32px;
      min-height: 32px;
      padding: 0;
      z-index: 100;
  }
  :deep(ol) {
    list-style: auto;
    padding-left: 20px;
  }
}
.answer-content {
  padding: 8px 24px;
  border-radius: 24px;
  background: #fff;
  :deep(p) {
    font-family: Rookery New;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: rgba(95, 94, 96, 1);
    // background-image: radial-gradient(50% 50% at 50% 50%,  #5C8DFF 0%,  #855EE1 100%);
    // color: transparent;
    // background-clip: text;
  }
}
.answer-tool {
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  background-clip: text;
  background-image: radial-gradient(50% 50% at 50% 50%, #5C8DFF 0%, #855EE1 100%);
  color: transparent;
  margin-bottom: 8px;
}
</style>
