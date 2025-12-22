<template>
  <div :class="'input-box ' + (chat?.isWelcome ? '' : 'input-box-bottom')">
    <AiButton v-if="isShowArrow" class="absolute! -top-[35px] !w-[32px] !h-[32px]" @click="scrollToChatBottom">
        <IconArrorDown />
    </AiButton>
    <!--  -->
    <div class="related-question-container
      w-full
      flex
      items-center
      justify-start
      mb-[12px]
      gap-[8px]
      overflow-x-auto
      empty:hidden
    ">
      <Entry v-if="!PPLXMode" :chat="chat" @search-more="(p) => startQuery(p)" />
      <QButton
        v-for="(question, index) in relatedQuestions"
        :key="`related-question-${question.text || index}`"
        variant="text"
        class="related-question"
        @click="() => startQuery(question.payload || {
          content: question.text
        })"
      >
        <img v-if="question.icon && typeof question.icon === 'string'" :src="question.icon"
          class="w-[16px] h-[16px] inline-block align-middle mr-[8px]"
        />
        <component v-else-if="question.icon" :is="question.icon"
            class="w-[16px] h-[16px] inline-block align-middle mr-[8px]"
          />
        <span class="body-s font-medium">{{ question.text }}</span>
      </QButton>
    </div>
    <div class="input-box_content">
      <suggestion
        :geminiValue="geminiValue"
        @closeGeminiValue="closeGeminiValue"
        v-if="!!geminiValue"
      />
      <QTextarea
        v-if="!geminiValue"
        class="input-box_content_inp pl-[4px]!"
        v-model="inputValue"
        @pressEnter="pressEnterSend"
        :placeholder="placeholderValue"
      >
        <template #top>
          <div class="files-upload-list" v-if="fileSearchList.length > 0">
            <UploadItem
              v-for="item in fileSearchList"
              :fileSearchItem="item"
              :fileItemInfo="item"
              :uploadType="UploadType.close"
              @handleFileDelete="emits('fileDelete', item.filePath)"
            />
          </div>
        </template>
        <template #left>
          <AiButton
            class="!w-[40px] !h-[40px]"
            :iconSize="buttonSize"
            :disabled="isSendButtonEnabled"
            @click="emits('fileSelect')"
            v-automation="'btn_add_file'"
          >
            <IconAdd />
          </AiButton>
        </template>
        <template #right>
          <MicrophoneButton
            :isRecognizing="isRecognizing"
            :isClearInput="isClearInput"
            :buttonSize="buttonSize"
            :chat="chat"
            ref="microphoneButtonRef"
            :disabled="isSendButtonEnabled"
            v-if="activeSpeechType !== 'live'"
            :active="activeSpeechType === 'mic'"
            @clickCallback="handleMicrophoneClickCallback"
            @onRecognize="handleMicrophoneRecognize"
          />
        </template>
      </QTextarea>
      <AiButton
        v-if="isSendButtonEnabled"
        @click="stopFetch"
        category="primary"
        class="self-end"
        v-automation="'btn_stop_fetch'"
      >
        <div class="w-[14px] h-[14px] bg-[var(--color-on-primary)] border-color-button"></div>
      </AiButton>
      <AiButton
        :category="inputValue ? 'primary' : ''"
        v-else
        class="self-end"
        @click="handleSendClick"
        v-automation="'btn_send'"
      >
        <IconForward class="h-[17px]" />
      </AiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatController, ChatStatus } from "../../../index";
import { QButton } from "../../../volt/QButton";
import QTextarea from "../../../Input/Textarea";
import { ref, onMounted, onUnmounted, computed } from "vue";
import { IconForward } from "@quantum/icons";
import {
  webOnMounted,
  WebviewMessager,
  MessageRes,
} from "@libs/service";
import MicrophoneButton from "./MicrophoneButton.vue";
import suggestion from "../suggestion.vue";
import { FileSearchListType, QuestionType } from "../../../ChatBaseComponent/types";
import UploadItem from "../UploadItem.vue";
import Answer from "../../../ChatBaseComponent/types/Answer";
import { UploadType } from "../../../ChatBaseComponent/types";
import { AiButton } from "../../../volt/QButton";
import Entry from "../../../AnswerCard/ThirdPartyAgent/Entry.vue";
import { IconAdd, IconArrorDown } from "@quantum/icons";
const emits = defineEmits(["fileSelect", "fileDelete"]);
import { SuggestionItemType } from "../../../../../apps/Pod1/src/store/suggestion";
import { useTTSPlayer } from "@libs/service";
import { stopPlayingItem } from "../../../utils/updatePlayingItem";


const buttonSize = ref<string>("24");
const props = defineProps<{
  inputStatus?: ChatStatus; // 控制输入状态，按钮显示隐藏
  fileSearchList?: Array<FileSearchListType>;
  chat: ChatController | undefined;
  pod?: string;
  isShowArrow?: boolean;
  scrollToChatBottom?: () => void;
  customEnterSend?: (opts: { content: string, payload?: any }) => void;
  staticSuggestion?: SuggestionItemType[];
}>();
const inputValue = ref("");
const isDocumentParsing = ref(false);
let hideUpboxTimer: null = null;
const isRecognizing = ref(false); // 是否正在语音识别
const activeSpeechType = ref<"live" | "mic" | null>(null);

const placeholderValue = ref<string>("Ask me a question");

const microphoneButtonRef = ref<InstanceType<typeof MicrophoneButton> | null>(null);
const geminiValue = ref(""); // 用来控制展示gemini返回的建议内容
const closeGeminiValue = () => {
  geminiValue.value = "";
  console.log("关闭了来自模型的建议", geminiValue.value);
};
const PPLXMode = ref(false)

const relatedQuestions = computed(() => {
  const { chatAction, currentQueryId } = props.chat || {};
  let currentAnswer: null | Answer = null

  chatAction?.forEach((item) => {
    if ('answerData' in item && item.answerData.questionId === currentQueryId) {
      currentAnswer = item
    }
  });
  if (currentAnswer && currentAnswer.answerData.relatedQuestions) {
    return currentAnswer.answerData.relatedQuestions || [];
  }
  const suggestion = props.staticSuggestion || [];

  return suggestion.map(item => {
    return {icon: '', text: item.name}
  });


});
const isClearInput = computed(() => {
  return Boolean(inputValue.value);
});

const isSendButtonEnabled = computed(() => {
  if (props.inputStatus !== ChatStatus.DONE) {
    if (props.inputStatus === ChatStatus.TIMEOUT) {
      return false;
    }
    return true;
  }
  // 有文件在上传禁用按钮
  if (props.fileSearchList.findIndex((file) => file.isFileLoading) > -1) {
    return true;
  }
  if (isDocumentParsing.value) {
    return false;
  }

  if (!inputValue.value.trim() && props.fileSearchList.length === 0) {
    return false;
  }

  return false;
});

function dispatchQuestion(payload: QuestionType) {
  const answerList = props.chat.chatAction.filter((item) => "answerData" in item);
  const elicitationLoop = answerList.some(item => item.answerData?.payload?.action === "elicitation_response");

  if (elicitationLoop && !payload.intentionType) {
    props.chat?.setQueryObject({
      ...payload,
      intentionType: "elicitation_accept",
    });
  } else {
    props.chat?.setQueryObject(payload);
  }

  PPLXMode.value = payload.intentionType === 'web-search'
}

const pressEnterSend = async () => {
  console.log("------------pressEnterSend--------------");
  if(props.fileSearchList.length > 0) {
    if(props.fileSearchList.some(item => item.isFileLoading)) {
      return;
    }
  }
  if (
    !inputValue.value.trim() ||
    (props.inputStatus !== ChatStatus.DONE && props.inputStatus !== ChatStatus.TIMEOUT)
  ) {
    return;
  }
  useTTSPlayer.stop();
  stopPlayingItem(props.chat);

  if (typeof props.customEnterSend === 'function') {
    props.customEnterSend({ content: inputValue.value.trim() });
    PPLXMode.value = false
  } else {
    dispatchQuestion({
      content: inputValue.value.trim(),
    });
  }

  // 发送后重置输入值
  inputValue.value = "";
  // 如果需要，清除定时器
  clearTimer();
};

const stopFun = () => {
  props.chat?.stopRegenerate();
  // 清空输入框
  //   inputValue.value = ''

  // 如果需要，清除定时器
  clearTimer();
};

const handleSendClick = () => {
  if (isSendButtonEnabled.value) return;
  if (props.inputStatus === ChatStatus.DONE) {
    pressEnterSend();
  } else {
    stopFun();
  }
};

// 清空定时器
const clearTimer = () => {
  if (statusTimer) {
    clearInterval(statusTimer);
    statusTimer = null;
  }
};

let statusTimer: null = null;
// 监听payAttention模型建议
const offGeminiCallback = WebviewMessager.on("client.h5.geminiCallback", (data) => {
  console.log("收到payAttention来自模型的建议", data);
  geminiValue.value = data.Data?.receiveContent as string;
});
onMounted(() => {
  webOnMounted({ MessageSource: "", Data: {} });
});

onUnmounted(() => {
  clearTimer();
  if (hideUpboxTimer) {
    clearTimeout(hideUpboxTimer);
  }
  // @ts-expect-error: Property 'removeAllListeners' does not exist on type
  window.api?.removeAllListeners();
  offGeminiCallback();
});
const handleMicrophoneClickCallback = (data: boolean) => {
  isRecognizing.value = data;
  activeSpeechType.value = data ? "mic" : null;
  inputValue.value = "";
};
const handleMicrophoneRecognize = (res: MessageRes<Record<string, unknown>>) => {
  const { Data } = res;
  const { IsSuccess, RecognizingText, RecognizedText } = Data;
  if (IsSuccess) {
    console.log("microphone----RecognizingText-------", RecognizingText);
    console.log("microphone----RecognizedText-------", RecognizedText);

    if (RecognizingText) {
      inputValue.value = RecognizingText as string;
    }
    if (RecognizedText) {
      inputValue.value = RecognizedText as string;
      if (typeof props.customEnterSend === 'function') {
        props.customEnterSend({ content: inputValue.value.trim(), payload: { autoTTS: true } });
        PPLXMode.value = false
      } else {
        dispatchQuestion({ content: inputValue.value.trim(), payload: { autoTTS: true } });
      }


      microphoneButtonRef.value?.handleStopVoice();
    }
  }
};

const stopFetch = () => {
  props.chat?.stopMessage();
};

function startQuery(question: QuestionType) {
  if (!question || !question.content) return;
  stopFetch();
  if (typeof props.customEnterSend === 'function') {
    props.customEnterSend(question);
  } else {
    dispatchQuestion(question);
  }
}
</script>
<style lang="less" scoped>
@import "./index.less";

.related-question-container {
  &::-webkit-scrollbar {
    display: none;
  }

  :deep(button.related-question) {
    height: 40px;
    padding: 7px 16px;
    text-align: center;
    border-radius: var(--radius-max);
    color: var(--color-text-on-surface);
    border: 2px solid rgba(109, 119, 138, 0.12); //dark rgba(189, 199, 220, 0.12)
    background: var(--color-surfaces-surface-blur);
    gap: 0;
    overflow: visible;
    white-space: nowrap;
    flex-shrink: 0;

    &:hover {
      border: none;
      color: #fff;
      padding-left: 18px;
      padding-right: 18px;
      background: linear-gradient(60deg, var(--color-ai-step-1) 24.05%, var(--color-ai-step-4) 59.56%, var(--color-ai-step-7) 95.51%);
    }
  }
}
.files-upload-list {
    display: flex;
    flex-wrap: wrap;
    :deep(.file-upload-item) {
        margin-bottom: 8px;
    }
}
</style>
