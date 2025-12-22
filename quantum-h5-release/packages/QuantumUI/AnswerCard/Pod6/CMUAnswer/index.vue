<!-- CMU回复的展示卡片 -->
<template>
  <div class="cmu-answer-container relative" v-if="isSuccess">
    <div class="answer-title">
      <div class="title-text" v-automation="'cmu_title_text'">{{ cmuAnswerCard.title }}</div>
      <div class="missed-text" v-automation="'cmu_missed_text'">{{ cmuAnswerCard.summary }}</div>
    </div>
    <CMUReplyBar 
      v-if="currentReplyTitle" 
      :title="currentReplyTitle"
      :answerTopics="answerTopics"
      :replyBtnTitles="replyBtnTitles"
      @syncReplyStatus="syncReplyStatus"
      @toggleBarTitle="toggleBarTitle" />
    <div v-else class="answer-content" v-for="item in cmuAnswerCard.themes" :key="item.id" @click="gotoReply(item)" v-automation="'cmu_answer_content'">
      <div class="answer-header" v-automation="'cmu_answer_header'">
        <div class="answer-content-left">
          <div class="avatar" v-automation="'cmu_avatar'">
              <div class="avatar-app">
                  <div class="avatar-WhatsApp">
                      <img :src="'data:image/png;base64,' + item.icon" />
                  </div>
              </div>
          </div>
        </div>
        <div class="notification-text">
            <div class="highlight-name" v-automation="'cmu_highlight_name'">{{ item.title }}</div>
            <div class="highlight-message line-clamp-2" :title="item.summary" v-automation="'cmu_highlight_message'">{{ item.summary }}</div>
            <div class="notification-icon" v-automation="'cmu_notification_icon'">
              <IconArrowRight />
            </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="cmu-error-text">{{ cmuAnswerInfo }}</div>
  <AnswerToolBar :chat-action="chat.chatAction" :answerItem="answerItem"/>
</template>
<script setup lang="ts">
import { computed, ref, onMounted, reactive } from 'vue';
import { ChatController } from '../../../index';
import CMUReplyBar from './components/CMUBar.vue';
import DefaultApp from '../../../assets/default_app.png';
import { IconArrowRight } from '@quantum/icons';
import AnswerToolBar from '../AnswerToolBar.vue';
interface IteItem {
    id: string;
    title: string;
    type: string;
}
export interface AvatarItem {
    title: string,
    summary: string,
    icon: string,
    displayActions: Array<IteItem>,
    handle?: string,
    app_info: Array<{
        app_name: string,
        deviceId: string,
        package_name: string,
        type: string,
        actions: Array<IteItem>
    }>
    packageName?: string;
}
interface CardItem {
  icon: string;
  title: string;
  summary: string;
  topics: Array<AvatarItem>;
}
interface AnswerContent {
  msg_count: number;
  summary: string;
  title: string;
  themes: Array<CardItem>;
}
const props = defineProps<{
  answerItem: {
    answerData: {
      content: AnswerContent | string;
    }
  },
  chat: ChatController | undefined,
}>();
console.log('answerContentData--------', props.answerItem);
const currentReplyTitle = ref('');
const replyBtnTitles = reactive({});
const cmuAnswerCard = reactive({
  title: '',
  summary: '',
  themes: [],
})
const cmuAnswerInfo = computed(() => props.answerItem.answerData.content);
const isSuccess = computed(() => {
  return typeof cmuAnswerInfo.value !== 'string';
});
// 获取数据
onMounted(() => {
  console.log('CMUAnswer--------', props.answerItem.answerData.content);
  if(typeof cmuAnswerInfo.value !== 'string') {
    cmuAnswerCard.title = cmuAnswerInfo.value.title;
    cmuAnswerCard.summary = cmuAnswerInfo.value.summary;
    cmuAnswerCard.themes = cmuAnswerInfo.value.themes;
  }
});
const answerTopics = computed(() => {
  if(!currentReplyTitle.value) return [];
  if(typeof cmuAnswerInfo.value !== 'string') {
    const topics = cmuAnswerInfo.value.themes.find((ite) => ite.title === currentReplyTitle.value).topics;
    const copyTopics = [...topics].map(ite => {
      ite.displayActions = [];
      ite.app_info.forEach((it) => {
        if(it.actions && Array.isArray(it.actions)) {
          ite.displayActions.push(...it.actions);
        }
      });
      if(ite.app_info) {
        if(ite.app_info[0].icon) {
          ite.icon = 'data:image/png;base64,' + ite.app_info[0].icon;
        } else {
          ite.icon = DefaultApp;
        }
      }
      return ite;
    });
    return copyTopics;
  }
});
const playContent = computed(() => {
  if(typeof cmuAnswerInfo.value !== 'string') {
    const { title, summary, themes } = cmuAnswerInfo.value;
    let str = '';
    themes.forEach((ite) => {
      str += ite.title + ite.summary;
    });
    return title + summary + str;
  } else {
    return cmuAnswerInfo.value;
  }
});
const toggleBarTitle = (title: string) => {
  currentReplyTitle.value = title;
}

const gotoReply = (item: AvatarItem) => {
  currentReplyTitle.value = item.title;
  if(!replyBtnTitles[item.title]) {
    replyBtnTitles[item.title] = [];
  }
}

const syncReplyStatus = (titleMap: { title: string, actionTitle: string }) => {
  if(!replyBtnTitles[currentReplyTitle.value].includes(titleMap.title)) {
    replyBtnTitles[currentReplyTitle.value].push(titleMap.title);
  }
  console.log('syncReplyStatus---------', replyBtnTitles);
}

</script>
<style lang="less" scoped>
@import './index.less';
</style>
