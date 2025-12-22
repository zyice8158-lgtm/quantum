<template>
  <div v-if="isShow">
    <div class="relative body-m text-[var(--color-text-on-surface-variant)] answer-container_wrapper">
      <div class="answer-plain-content flex-1 break-words" v-html="renderDOM"></div>
      <AnswerToolBar
        class="absolute bottom-[17px] right-[24px]"
        :answer-item="answerItem"
        :icon-tool-list="[ToolType.VoicePlay]"
        :chat-action="chat.chatAction"
      />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ChatController, ChatStatus } from '../../index';
import { computed } from 'vue';
import { setElicitation } from './elicitationStatus';
import {marked} from 'marked';
import Answer from '../../ChatBaseComponent/types/Answer';
import AnswerToolBar from '../Pod6/AnswerToolBar.vue';
import { ToolType } from '../../ChatBaseComponent/types';

const props = defineProps<{
  chat: ChatController | undefined
  answerItem: Answer & {
    answerData: {
      content: string // message
      payload?: {
        action?: string // query elicitation_response(accept, decline, cancel)
      }
    }
  }
}>();
const renderDOM = computed(() => {
  return (props.answerItem.chatStatusAnswer.value === ChatStatus.DONE || props.answerItem.chatStatusAnswer.value === ChatStatus.ONGOING) ? marked.parse(props.answerItem.answerData.content) : '';
});
const isShow = computed(() => {
  if (props.answerItem.chatStatusAnswer.value === ChatStatus.DONE || props.answerItem.chatStatusAnswer.value === ChatStatus.ONGOING) {
    return props.answerItem.answerData.content && props.answerItem.answerData.content.trim() !== '';
  }

  return true;
});

setElicitation(props)
</script>

<style lang="less" scoped>
.answer-container_wrapper {
  background-color: var(--color-surface);
  padding: 24px;
  border-radius: 24px 24px 24px 0;
  position: relative;
  box-shadow: 0 1px 2px 0 var(--effects-elevation-drop-shadow-heavy), 0 1px 3px 1px var(--effects-elevation-drop-shadow-light);

  ::v-deep(.answer-tool-bar) {
      padding: 0;
  }

  ::v-deep(.answer-plain-content) {
    width: calc(100% - 44px);
    p {
      margin: 0px;
    }
  }
}
</style>
