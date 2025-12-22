<template>
  <div :class="'input-box ' + (chat?.isWelcome ? '' : 'input-box-bottom')">
    <div class="input-box_content">
      <template v-if="isLiving">
        <div class="white-share-circle">
          <img :src="addSquare" class="white-share-img" />
        </div>
        <div class="white-share-circle">
          <img :src="addblackSquare" class="white-share-img" />
          <img :src="dropdownIcon" class="white-share-img" />
        </div>
      </template>
      <QTextarea
        class="input-box_content_inp"
        v-model="inputValue"
        @pressEnter="pressEnterSend"
        :placeholder="placeholderValue"
        :disabled="isDisable"
      >
        <template #top>
          <div class="select-file-container">
            <div class="select-file-count" v-for="item in inputFiles" v-if="!isLiving">
              <SvgIcon
                v-if="item.isFileLoading"
                size="1.2rem"
                class="search-loading"
                name="fileSearchLoading"
              />
              <img :src="item.icon" />
              <div class="file-name">{{ item.fileName }}</div>
            </div>
          </div>
        </template>
        <template #left>
          <QButton
            :iconSize="buttonSize"
            :disabled="isSendButtonEnabled"
            icon="add"
            @click="handleAddFile(chat)"
          ></QButton>
        </template>
        <template #right>
          <MicrophoneButton
            :isRecognizing="isRecognizing"
            :isClearInput="isClearInput"
            :buttonSize="buttonSize"
            ref="microphoneButtonRef"
            :disabled="isSendButtonEnabled"
            :active="activeSpeechType === 'mic'"
            @clickCallback="handleMicrophoneClickCallback"
            @onRecognize="handleMicrophoneRecognize"
          />
        </template>
      </QTextarea>
      <ButtonIcon
        class="!bg-[#855EE1] !ml-[0px]"
        v-if="isSendButtonEnabled && !isDisable"
        rounded
        @click="stopFetch"
        size="large"
      >
        <div class="w-[14px] h-[14px] bg-white"></div>
      </ButtonIcon>
      <ButtonIcon
        class="bg-white border-0 !ml-[0px]"
        :disabled="isDisable"
        v-else
        rounded
        @click="handleSendClick"
        size="large"
      >
        <IconForward />
      </ButtonIcon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatController, ChatStatus, QButton } from "../../../index";
import QTextarea from "../../../Input/Textarea";
import { ref, reactive, onMounted, onUnmounted, computed, watch } from "vue";
// import IconImg from '../../../assets/Icon.png';
import { IconForward } from "@quantum/icons";
import uploadIcon from "../../../assets/file-upload.png";
import closeIcon from "../../../assets/close.png";
import addblackSquare from "../../../assets/addblackSquare.png";
import dropdownIcon from "../../../assets/dropdownIcon.png";
import addSquare from "../../../assets/addSquare.png";
import { selectFile, MessageRes , WebviewMessager } from "@libs/service";
import { v4 as uuidv4 } from "uuid";
// import { receiveStreamData } from '../../../ChatBaseComponent/types/AIServiceGateway';
// import chatLoading from "../../../assets/chatLoading.gif";
import PDFIcon from "../../../assets/pdf.png";
import MicrophoneButton from "./MicrophoneButton.vue";
// import LiveButton from './LiveButton.vue';
import { SvgIcon } from "../../../Icons";
// payAttention 需要的组件↓
// import ModeButton from './ModeButton.vue';
// import suggestion from "../suggestion.vue"
import { uploadFileInward, dragFileUpload, handleAddFile } from "../../../utils/inwardFile";
import { FileSearchListType } from "../../../ChatBaseComponent/types/ChatClass";
import { typesMap as iconMap } from "../../../config/index";
import { ButtonIcon } from "../../../Button";
enum PodSourceEnum {
  POD1 = "POD1",
  POD2 = "POD2",
  POD3 = "POD3",
  POD4 = "POD4",
  POD5 = "POD5",
  POD6 = "POD6",
}
const buttonSize = ref<string>("24");
const fileInfo = reactive({
  fileName: "Sharing Screen",
  iconPath: uploadIcon,
  closePath: closeIcon,
});
const inputFiles = ref([]);
const props = defineProps<{
  inputStatus?: ChatStatus; // 控制输入状态，按钮显示隐藏
  fileSearchList?: Array<FileSearchListType>;
  chat: ChatController | undefined;
  isInit: boolean;
  pod?: string;
  customEnterSend?: (inputVal: string) => void;
  isDisable?: boolean;
}>();
const inputValue = ref("");
const isDocumentParsing = ref(false);
let hideUpboxTimer: null = null;
const isRecognizing = ref(false); // 是否正在语音识别
const isLiving = ref(false); // 是否正在语音识别
const activeSpeechType = ref<"live" | "mic" | null>(null);

const podSource = ref<PodSourceEnum>(PodSourceEnum.POD6);
const placeholderValue = ref<string>("What would you like to do?");

const microphoneButtonRef = ref<InstanceType<typeof MicrophoneButton> | null>(null);

// live按钮 需要的组件↓
// const liveButtonRef = ref<InstanceType<typeof LiveButton> | null>(null);

watch(
  props.fileSearchList,
  (newFileList) => {
    inputFiles.value = newFileList;
  },
  { deep: true }
);

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
  if (props.isDisable) {
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
const pressEnterSend = async () => {
  if (
    !inputValue.value.trim() ||
    (props.inputStatus !== ChatStatus.DONE && props.inputStatus !== ChatStatus.TIMEOUT)
  )
    return;
  props.chat?.setWelcomeType(false);
  if (props.fileSearchList.length > 0) {
    sendMultimodeMessage();
  } else if (typeof props.customEnterSend === "function") {
    props.customEnterSend(inputValue.value.trim());
  } else {
    props.chat?.setQueryValue(inputValue.value.trim());
  }

  // 发送后重置输入值
  inputValue.value = "";
  // 如果需要，清除定时器
  clearTimer();
};

const sendMultimodeMessage = () => {
  const files = inputFiles.value.map((file) => {
    return {
      name: file.fileName,
      path: file.filePath,
      fileId: file.fileId,
      documentId: file.documentId,
      icon: iconMap[file.fileType] || file.icon || PDFIcon,
    };
  });
  props.chat?.setQueryObject({
    content: inputValue.value.trim(),
    files: files,
    intentionType: "INTENT_NO_PKB_CHECK_POD_TEST",
  });
  props.chat?.clearSearchList();
  inputFiles.value = [];
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

onMounted(() => {
  buttonSize.value = props.pod === "pod12" ? "0.37rem" : "24";
  // webOnMounted({ MessageSource: podSource.value, Data: {} });
  dragFileUpload(props.chat);
  WebviewMessager.on("client.h5.modeMgr.shortRecordCallback", getChatCallback); // 监听返回结果
});

onUnmounted(() => {
  clearTimer();
  if (hideUpboxTimer) {
    clearTimeout(hideUpboxTimer);
  }
  // @ts-expect-error: Property 'removeAllListeners' does not exist on type
  window.api?.removeAllListeners();
  WebviewMessager.off("client.h5.modeMgr.shortRecordCallback", getChatCallback);
});

const getChatCallback = async (data: unknown) => {
  const d = (data as { Data?: { prompt?: string; isFinal?: boolean } } | undefined)?.Data;
  inputValue.value = d.prompt;
};

const handleMicrophoneClickCallback = (data: boolean) => {
  isRecognizing.value = data;
  activeSpeechType.value = data ? "mic" : null;
  inputValue.value = "";
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

      if (podSource.value === PodSourceEnum.POD6) {
        props.chat?.setWelcomeType(false);
        props.chat?.setQueryValue(inputValue.value.trim(), isRecognizing.value);
        inputValue.value = "";
        microphoneButtonRef.value?.handleStopVoice();
      }
    }
  }
};

const handleFileUpload = async (Data: {
  FileName: string;
  fileList: Array<{ FilePath: string; FileName: string; FileSize: number; FileType: string }>;
}) => {
  const { FileName } = Data;
  fileInfo.fileName = FileName as string;
  const fileList = Data.fileList;
  // 去重
  const existingPaths = new Set(props.fileSearchList.map((item) => item.filePath));
  const newData = fileList.filter((item) => !existingPaths.has(item.FilePath));
  const newFileList = newData.map((item) => {
    const fileId = uuidv4();
    return {
      fileId,
      icon: "",
      fileName: item.FileName,
      fileType: item.FileType,
      filePath: item.FilePath,
      isFileLoading: true,
    };
  });
  props.chat.setSearchList(newFileList);
  inputFiles.value = props.fileSearchList;
  // 这里循环加入延迟入库，因为同步入库C#因为报错403，所以只能用异步入库
  for (let i = 0; i < newFileList.length; i++) {
    setTimeout(async () => {
      await uploadFileInward(props, newFileList[i]);
    }, 500 * i);
  }
};

const stopFetch = () => {
  props.chat?.stopMessage();
};
</script>
<style lang="less" scoped>
@import "./index.less";
</style>

