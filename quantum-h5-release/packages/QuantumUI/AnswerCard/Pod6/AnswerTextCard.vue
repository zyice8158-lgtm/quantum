<template>
  <div class="answer-conatiner" v-if="isShow">
    <div class="answer-plain-text">
      <div class="answer-plain-content" v-automation="'answer_content'" v-html="renderDOM"></div>
    </div>
    <AnswerToolBar :answer-item="answerItem" :chat-action="chat.chatAction" noTool />
  </div>
</template>

<script setup lang='ts'>
// import MarkdownIt from 'markdown-it';
import AnswerToolBar from './AnswerToolBar.vue';
import { ChatController, ChatStatus } from '../../index';
import { computed, render } from 'vue';
import { marked } from 'marked';
import { baseURL } from '@libs/service/fetch/appFetch'
import Answer from '../../ChatBaseComponent/types/Answer';
// const markdownParser = new MarkdownIt();
const props = defineProps<{
  noTool?: boolean,
  answerItem: Answer | undefined,
  chat: ChatController | undefined,
}>();
marked.use({
  renderer: {
    image: (src: { href: string }, alt: string) => {
      // if (!src.includes('http')) {
      //   return `<img src="${src}" alt="${alt}" />`;
      // }
      const path = baseURL + '/czimage/' + (src.href.includes('Modelmgr') ? 'local' : 'cloud');
      const fileName = `${path}/${src?.href.split("/").slice(-1)[0]
        }`;
      console.log('src', src, baseURL, fileName);
      return `<img src="${fileName}" alt="${alt}" />`
    }
  }
})
const renderDOM = computed(() => {
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
.answer-conatiner {
  .answer-plain-text {
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0.5px;
    color: rgba(95, 94, 96, 1);
    display: flex;
    width: calc(100% - 44px);

    .answer-plain-content {
      flex: 1;
    }

    ::v-deep(p) {
      margin: 0;
    }
  }

  .expedia_button {
    display: flex;
    align-items: center;
    padding: 8px 21px 8px 16px;
    background: none;
    border-radius: 32px;
    border: 2px solid #FFC800;

    font-weight: 700;
    font-style: Bold;
    font-size: 12px;
    line-height: 16px;


  }

  .expedia_icon {
    width: 83px;
    height: 22px;
  }

  :deep(.answer-tool-bar) {
    padding: 0;
  }
}
</style>