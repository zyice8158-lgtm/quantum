<template>
  <div class="home">
    <InputRealPage :chat="chat" :isInit="false"  pod="pod1"></InputRealPage>
    <!-- <picture-file :question-item="questionItem"></picture-file>
    <AnswerTextCard :answer-item="answerItem"></AnswerTextCard> -->
    <!-- <Picture :answer-item="answerItem"></Picture> -->

  </div>
</template>
<script setup lang="ts">
import { Picture, PictureFile, AnswerTextCard, InputRealPage, ChatController  } from '@libs/p-comps';
import { ref } from 'vue';
import mySDK from '@/components/ChatView/sdkService'

const chat = ref<ChatController>()
chat.value = new ChatController(mySDK)
const questionItem = {
    questionData: {
      content: 'Here are some pictures from your Quantum Folder',
      files: [{base64: 'https://gips3.baidu.com/it/u=3886271102,3123389489&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960'}]
    },
};
const answerItem = {
    fileSearchList: [
      { filePath: 'https://gips3.baidu.com/it/u=3886271102,3123389489&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960' },
      { filePath: 'https://gips3.baidu.com/it/u=3886271102,3123389489&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960' },
      { filePath: 'https://gips3.baidu.com/it/u=3886271102,3123389489&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960' }
    ],
    answerData: {
      content: 'Here are some pictures from your Quantum Folder'
    },
    chat: {},
};
const res = { "category": "GENERAL", "data": { "chat": "", "stop": true, "toolResult": [{ "contentType": "TEXT", "mimeType": "TEXT", "value": "TRAVEL_AGENT_YES" }] }, "errorCode": 0, "errorMsg": "", "language": "EN", "lid": "6b522d39-73a0-4dce-b8cc-3c286fa14898", "stop": true, "toolResult": [{ "contentType": "TEXT", "mimeType": "TEXT", "value": "TRAVEL_AGENT_YES" }], "type": "GENERAL_GENERATION" };
const data = JSON.stringify(res);
if (data.includes('toolResult')) {
  console.log('includes toolResult');
}
</script>
<style lang="less" scoped>
.home {
  width: 100vw;
  height: 100vh;
  background-color: red;



}
</style>
