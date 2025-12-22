<template>
  <div v-if="isShow">
    <div class="font-normal text-[14px] leading-[24px] tracking-[0.5px] text-var(--color-text-on-surface-variant) flex w-full">
      <div class="flex-1">
        <div v-if="!isMeetingDetails" v-html="renderDOM"></div>
        <div v-else class="meeting-details-content">
          <div class="meeting-details-header">{{ t('answerTextCard.meetingDetails') }}</div>
          <br><br>
          <div class="meeting-details-info" style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
            <div>Date: {{ meetingInfo.date }}</div>
            <div>Time: {{ meetingInfo.time }}</div>
            <div>Location: {{ meetingInfo.location }}</div>
          </div>
          <button class="view-outlook-btn" style="background-color: transparent; border: 1px solid var(--color-text-on-surface); border-radius: 50px; padding: 8px 20px; cursor: pointer; font-size: 14px; color: var(--color-text-on-surface); display: flex; align-items: center; justify-content: center; gap: 8px; width: fit-content;">
            {{ t('answerTextCard.viewCalendar') }} <IconView style="width: 8px; height: 8px; vertical-align: middle;"/>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ChatController, ChatStatus } from '../../index';
import { computed } from 'vue';
import { marked } from 'marked';
import { IconView } from '@quantum/icons';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  noTool?: boolean,
  answerItem: {
    chatStatusAnswer: {
      value: ChatStatus
    }
    answerData: {
      content: string;
      payload?: {
        isShowOffline?: boolean;
        isShowApp?: boolean;
      }
    }
  },
  chat: ChatController | undefined,
}>();

// 判断是否为会议详情
const isMeetingDetails = computed(() => {
  const content = props.answerItem.answerData.content;
  return content.startsWith(t('answerTextCard.meetingDetails'));
});

// 解析会议详情信息
const meetingInfo = computed(() => {
  const content = props.answerItem.answerData.content;
  const info: { date: string; time: string; location: string } = {
    date: '',
    time: '',
    location: ''
  };

  // 从文本中提取会议信息
  const dateMatch = content.match(/Date: (.+)/);
  const timeMatch = content.match(/Time: (.+)/);
  const locationMatch = content.match(/Location: (.+)/);

  if (dateMatch) info.date = dateMatch[1];
  if (timeMatch) info.time = timeMatch[1];
  if (locationMatch) info.location = locationMatch[1];

  return info;
});

const renderDOM = computed(() => {
  if (isMeetingDetails.value) {
    return '';
  }
  return (props.answerItem.chatStatusAnswer.value === ChatStatus.DONE || props.answerItem.chatStatusAnswer.value === ChatStatus.ONGOING) ? marked.parse(props.answerItem.answerData.content) : '';
});

const isShow = computed(() => {
  if (props.answerItem.chatStatusAnswer.value === ChatStatus.DONE || props.answerItem.chatStatusAnswer.value === ChatStatus.ONGOING) {
    return props.answerItem.answerData.content && props.answerItem.answerData.content.trim() !== '';
  }

  return true;

});
</script>

<style lang="less" scoped>
/* 使用tailwindcss实现的样式已移至模板中 */
/* 保留需要深度选择器的样式 */
.font-normal {
  /* 会议详情样式 */
  .meeting-details-header {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-primary-primary);
    line-height: 24px;
  }

  .meeting-details-info {
    font-size: 14px;
    color: var(--color-text-on-surface-variant);
    line-height: 24px;
  }

  .view-outlook-btn {
    font-size: 14px;
    font-weight: 400;
    color: var(--color-text-on-surface);
    line-height: 24px;
  }
}
</style>
