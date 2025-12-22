<template>
    <div class="answer-loading" v-if="answerItem?.chatStatusAnswer.value === ChatStatus.START">
      <IconQuantumLogo class="text-[32px] transition-transform duration-500 ease-in-out hover:rotate-[360deg]"></IconQuantumLogo>
      <div class="answer-start">
        Thinking...
      </div>
    </div>
</template>
<script lang="ts" setup>
import { ChatStatus } from '../../index';
import { IconQuantumLogo } from '@quantum/icons';
defineProps<{
  pod?: string,
  noTool?: boolean,
  answerItem: {
    chatStatusAnswer: {
      value: ChatStatus
    }
  },
}>();
</script>
<style lang="less" scoped>
.answer-loading {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 6px;
  width: calc(100% - 20px);
  line-height: 32px;
  .answer-start {
    font-weight: 500;
    font-size: 16px;
    width: 200px;
    color: #6C43C6;
    height: 100%;
    padding-left: 10px;
    background-color: transparent;
  }

  &_dots {
    width: 24px;
    height: 24px;
  }
}
</style>