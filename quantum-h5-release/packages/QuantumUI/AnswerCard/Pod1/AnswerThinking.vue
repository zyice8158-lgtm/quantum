<template>
    <div class="answer-thinking" v-if="answerItem.chatStatusAnswer.value === ChatStatus.ONGOING || answerItem.answerData.payload?.isShowOffline || answerItem.answerData.payload?.isShowApp">
      <IconQuantumLogo  class="text-[18px] mr-[13px]" v-if="answerItem.chatStatusAnswer.value === ChatStatus.ONGOING"/>
      <div class="answer-thinking_title" v-if="answerItem.chatStatusAnswer.value === ChatStatus.ONGOING" v-automation="'answer_thinking_title'">
        Qira is thinking...
      </div>
      <div class="answer-thinking_local" v-else-if="answerItem.answerData.payload?.isShowOffline">
        Your query was handled by the local model, and the following response was generated locally.
      </div>
      <div class="answer-thinking_local" v-else-if="answerItem.answerData.payload?.isShowApp">
        Your query was handled by the local model, Is there anything else I can help you with?
      </div>
    </div>
</template>
<script lang="ts" setup>
import { IconQuantumLogo } from '@quantum/icons'
import { ChatStatus } from '../../index';
import Answer from '../../ChatBaseComponent/types/Answer';
const props = defineProps<{
  noTool?: boolean,
  answerItem: Answer | undefined,
}>();
</script>
<style lang="less" scoped>
  .answer-thinking {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 0 6px;
     &_title {
      font-family: "Rookery New";
      font-size: 14px;
      font-weight: 500;
      background-clip: text;
      background-image: radial-gradient(50% 50% at 50% 50%, #5C8DFF 0%, #855EE1 100%);
      color: transparent;
    }
    &_local {
      font-weight: 400;
      font-size: 16px;
      color: var(--p-primary-color);
    }
  }
</style>
