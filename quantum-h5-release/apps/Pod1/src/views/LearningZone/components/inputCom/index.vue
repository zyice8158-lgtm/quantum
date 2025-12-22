<template>
  <div :class="'input-box ' + (chat?.isWelcome ? '' : 'input-box-bottom')">
    <div class="input-box_content">
      <QTextarea
        class="input-box_content_inp"
        v-model="inputValue"
        @pressEnter="pressEnterSend"
        :placeholder="placeholderValue"
        @input="handleInputValueData"
        ref="textareaRef"
      >
        <template #top>
        <div class="files-upload-list" v-if="fileSearchList.length > 0">
            <UploadItem v-for="item in fileSearchList"
            :fileSearchItem="item"
            :fileItemInfo="item"
            :uploadType="UploadType.close"
            @handleFileDelete="emit('fileDelete', item.filePath)"/>
        </div>
        </template>
        <template #left>
          <AiButton
            class="!w-[45px] !h-[45px]"
            :iconSize="buttonSize"
            :disabled="isSendButtonEnabled"
            @click="handleAddsFile"
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
        >
          <div class="w-[14px] h-[14px] bg-white"></div>
        </AiButton>
        <AiButton
          :category="inputValue ? 'primary' : ''"
          v-else
          @click="handleSendClick"
        >
          <IconForward class="h-[17px]" />
        </AiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue';
import { ChatController, ChatStatus, QButton } from "@libs/p-comps";
import QTextarea from "@libs/p-comps/Input/Textarea";
import { UploadType } from '@libs/p-comps/ChatBaseComponent/types';
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { IconForward,IconAdd } from "@quantum/icons";
import { AiButton } from "@libs/p-comps/volt/QButton";
import { webOnMounted, selectFile, WebviewMessager, MessageRes } from "@libs/service";
import { v4 as uuidv4 } from "uuid";
import PDFIcon from "../../../assets/pdf.png";
import { MicrophoneButton, UploadItem } from "@libs/p-comps/ChatView";
import { SvgIcon } from "@libs/p-comps/Icons";
import { uploadFileInward, dragFileUpload, handleAddFile } from "@libs/p-comps/utils/inwardFile";
import { FileSearchListType, QuestionType } from "@libs/p-comps/ChatBaseComponent/types";
import { typesMap as iconMap } from "@libs/p-comps/config/index";
import { ButtonIcon } from "@libs/p-comps/Button";
import { FileTypeIcon } from "@libs/p-comps/iconDocument";
import { createChatSession,unshiftChatTempHistory } from '@/store/chat';
import { EventBus } from '@quantum/use';
import { useLocale } from "@/hooks/i18n";

const buttonSize = ref<string>('24');
const props = defineProps<{
  inputStatus?: ChatStatus, // 控制输入状态，按钮显示隐藏
  fileSearchList?: Array<FileSearchListType>,
  chat: ChatController | undefined;
  isInit: boolean;
  pod?: string;
  customEnterSend?: (inputVal: string) => void;
}>();
const emit = defineEmits<{
  (e: "sendInputValue",chatId: string, value: QuestionType): void;
  (e: "inputValueData", value: string): void;
  (e: "fileDelete", filePath: string): void;
  (e: "fileSelect"): void;
}>();
const inputValue = ref("");
const isSelectType = ref('');
const isDocumentParsing = ref(false);
let hideUpboxTimer: null = null;
const isRecognizing = ref(false); // 是否正在语音识别
const activeSpeechType = ref<'live' | 'mic' | null>(null);

const { t } = useLocale();
const placeholderValue = ref<string>(t('learningZone.askMeAQuestion'));

const microphoneButtonRef = ref<InstanceType<typeof MicrophoneButton> | null>(null);
const geminiValue = ref(''); // 用来控制展示gemini返回的建议内容

const textareaRef = ref(null);
let nativeTextarea = null;
const closeGeminiValue = () => {
  geminiValue.value = '';
  console.log('关闭了来自模型的建议', geminiValue.value);
}

watch(() => props.fileSearchList, (newVal, oldVal) => {
  if(newVal?.length === 0) {
   console.log('fileSearchList newVal', newVal);
   inputValue.value = '';
   EventBus.emit('filesSelect', true);
  }
})


const isClearInput = computed(() => {
  return Boolean(inputValue.value);
});

const handleAddsFile = (type: string) => {
  emit('fileSelect');
  console.log('fileSelect type--------', type);
  isSelectType.value = type;
  if(type === 'fileNoteSelect'||type === 'fileQuizSelect') {
    EventBus.emit('filesSelect', false);
  }
}

const isSendButtonEnabled = computed(() => {
  if (props.inputStatus !== ChatStatus.DONE) {
    if(props.inputStatus === ChatStatus.TIMEOUT) {
      return false;
    }
    return true;
  }
  // 有文件在上传禁用按钮
  if (props.fileSearchList.findIndex(file => file.isFileLoading) > -1) {
    if(isSelectType.value === 'fileNoteSelect') {
      inputValue.value = t('learningZone.generateANote');
    } else if(isSelectType.value === 'fileQuizSelect'){
      inputValue.value = t('learningZone.generateAQuiz');
    }
    return true;
  }

  if (!inputValue.value.trim() && props.fileSearchList.length === 0) {
    return false;
  }

  return false;
});

const pressEnterSend = async () => {
  props.chat?.createChatPair({ content: inputValue.value.trim() });
  try {
    const chatId = await createChatSession() as string;
    console.log('chatId------', chatId);
    emit("sendInputValue", chatId, {
      content: inputValue.value.trim(),
      files: props.fileSearchList || [],
    });
    inputValue.value = "";
  } catch (error) {
    console.error('createChatSession 获取出错：', error); // 捕获错误
  }
};
const handleInputValueData = (inputValues: string) => {
  emit("inputValueData", inputValue.value);
  if(inputValue.value!=='') {
    EventBus.emit('filesSelect', true);
  }else{
    EventBus.emit('filesSelect', false);
  }

};

const handleBlur = () => {
  console.log('===== 输入框失去焦点 =====');
  // EventBus.emit('filesSelect', false);
};

const handleFocus = () => {
  console.log('===== 输入框获得焦点 =====');
  // EventBus.emit('filesSelect', true);
};

const sendMultimodeMessage = () => {
  props.chat?.setQueryObject({ content: inputValue.value.trim() });
}

const stopFun = () => {
  props.chat?.stopRegenerate();
  // 清空输入框
  //   inputValue.value = ''
  // 如果需要，清除定时器
  clearTimer();
};

const handleSendClick = () => {
  console.log('handleSendClick');
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
const offGeminiCallback = WebviewMessager.on('client.h5.geminiCallback', (data) => {
  console.log('收到payAttention来自模型的建议', data);
  geminiValue.value = data.Data?.receiveContent as string;
})
onMounted(() => {
  webOnMounted({ MessageSource: '', Data: {} });
  dragFileUpload(props.chat);
  EventBus.on("fileNoteSelect", () => {
    handleAddsFile('fileNoteSelect');
  });
  EventBus.on("fileQuizSelect", () => {
    handleAddsFile('fileQuizSelect');
  });

  // 获取 QTextarea 内部的原生输入元素
  nativeTextarea = textareaRef.value?.$el?.querySelector('textarea')
    || textareaRef.value?.$el?.querySelector('input');

  if (nativeTextarea) {
    // 手动绑定原生事件
    nativeTextarea.addEventListener('blur', handleBlur);
    nativeTextarea.addEventListener('focus', handleFocus);
  }

});

onUnmounted(() => {
  clearTimer();
  if (hideUpboxTimer) {
    clearTimeout(hideUpboxTimer);
  }
  // @ts-expect-error: Property 'removeAllListeners' does not exist on type
  window.api?.removeAllListeners();
  offGeminiCallback();
  EventBus.clear("fileNoteSelect");
  EventBus.clear("fileQuizSelect");
  // 组件卸载时移除事件监听
  if (nativeTextarea) {
    nativeTextarea.removeEventListener('blur', handleBlur);
    nativeTextarea.removeEventListener('focus', handleFocus);
  }
});
const handleMicrophoneClickCallback = (data: boolean) => {
  isRecognizing.value = data;
  activeSpeechType.value = data ? 'mic' : null;
  inputValue.value = "";
  EventBus.emit('filesSelect', false);
};
const handleMicrophoneRecognize = (res: MessageRes<Record<string, unknown>>) => {
  const { Data } = res;
  const { IsSuccess, RecognizingText, RecognizedText } = Data;
  if (IsSuccess) {
    if (RecognizingText) {
      inputValue.value = RecognizingText as string;
    }
    if (RecognizedText) {
      inputValue.value = RecognizedText as string;

      props.chat?.setQueryObject({ content: inputValue.value.trim(), payload:{ autoTTS: true } });

      microphoneButtonRef.value?.handleStopVoice();
    }
  }
};

const stopFetch = () => {
  props.chat?.stopMessage();
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>

