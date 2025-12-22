<template>
  <div class="pay-attention-chat-container">

    <div :class="['chat-wrap rounded-[32px]']">
      <PayAttentionChatBase class="chat-base-payattention" v-if="chat" :chat="chat">
        <template #payAttentionCard>
          <!-- <div class="mb-[24px]"> -->
            <indexHome
              :mode="mode"
              :isRecording="isRecording"
              :headerText="headerText"
              :formattedDuration="formattedDuration"
              :azureKey="azureKey"
            />
          <!-- </div> -->
        </template>

        <template #questionSlot="{ questions }" v-if="!chat?.isWelcome">
          <div class="query-container">
            <QuestionPage :queryItem="questions" />
            <QueryOperation class="query-operation" :queryItem="questions" />
          </div>
        </template>

        <template #answerSlot="{ answers }" v-if="!chat?.isWelcome">
          <div class="answer-container">
            <AnswerPage :chat="chat" :answerItem="answers.answerData as Answer" />
          </div>
        </template>
      </PayAttentionChatBase>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PayAttentionChatBase, ChatController, AnswerActionType, ChatStatus } from "@libs/p-comps";
import Answer from "@libs/p-comps/ChatBaseComponent/types/Answer";
import mySDK from "./chatSdkService";

import { onMounted, ref, watch, onUnmounted, computed, nextTick, onBeforeUnmount } from "vue";
import { InputPayAttention, QuestionPage, AnswerPage } from "@libs/p-comps/ChatView";
import {
  CrossTabCommunicator,
  ChannelMessageType,
  ChannelMessage,
  sendExportContent,
} from "@libs/service";
import {
  obtainScreenshotFile,
  WebviewMessager,
  sendSmartSelectMessage,
  MessageRes,
} from "@libs/service";
import { v4 as uuidv4 } from "uuid";
import { getChatData, setChatData, updateChatData } from "@/store/chat";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import indexHome from "@/views/PayAttention/home/index.vue";
import { SelectButtonStatus } from "@/views/PayAttention/home/index";
import { buildChatHtml } from "../../exportHtml";
import { payAttentionStore } from "@/store/payAttention";

// 三个模式的 key（与你的 SelectButtonStatus 一致）
type ChatKey = SelectButtonStatus;

// 实例池：每个模式一个 ChatController
const chatPool: Partial<Record<ChatKey, ChatController>> = {};

// 安全创建一个 ChatController
const createController = (): ChatController => {
  return new ChatController(mySDK);
};

// 若不存在则创建，返回对应模式的 controller
const getOrCreateChat = (key: ChatKey): ChatController => {
  if (!chatPool[key]) {
    chatPool[key] = createController();
  }
  return chatPool[key]!;
};

// 切换当前展示的 chat（不改其内部流程）
const switchChat = (key: ChatKey): void => {
  const controller = getOrCreateChat(key);
  chat.value = controller;
  isInit.value = (chat.value?.chatAction.length ?? 0) > 0;
};

defineOptions({ name: "PayAttentionChat" });

interface ExternalChatMessage {
  id?: string | number;
  timestamp?: string;
  content?: string;
  text?: string;
  type?: string;
  chatId?: string;
  intentionType?: string;
  files?: Array<{ name?: string; base64?: string; path?: string; fileId?: string }>;
  title?: string;
}

const props = defineProps<{
  mode: SelectButtonStatus | "";
  isRecording: boolean;
  headerText: string;
  formattedDuration: string;
  azureKey: number;

  // —— 你原本已有的 props（保持逻辑，不动）
  sessionNum?: number;
  externalChatData?: ExternalChatMessage[];
  isExternalChat?: boolean;
  shouldStartNewSession?: boolean;
  externalChatId?: string;
}>();

const chatUid = ref<string>("");
const chat = ref<ChatController>();
const isChatBaseVisible = ref(true);
const isInit = ref<boolean>(false);
const router = useRouter();
const route = useRoute();
const isCreated = ref(true);
let lastHeight = 0;

const toast = useToast();

const chatStatus = computed(() => chat.value?.getChatStatus());
watch(chatStatus, (newStatus) => {
  if (newStatus === ChatStatus.TIMEOUT) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "The request timed out. Please try again.",
      life: 3000,
    });
  }
});

const inputFiles = computed(() => chat.value?.fileSearchList || []);

watch(
  () => chat.value?.chatAction.length,
  (newLen, oldLen) => {
    if (oldLen === 0) {
      isInit.value = route.name === "FullViewChat" ? false : true;
    } else if (newLen === 0) {
      isInit.value = false;
    }
  }
);

watch(
  () => props.externalChatData,
  (newHistory, oldHistory) => {
    if (
      props.isExternalChat &&
      newHistory &&
      oldHistory &&
      newHistory.length > 0 &&
      newHistory !== oldHistory
    ) {
      startNewChatWithExternalData(newHistory);
    }
  },
  { deep: true }
);

watch(
  () => props.shouldStartNewSession,
  (shouldStart) => {
    if (
      shouldStart &&
      props.isExternalChat &&
      props.externalChatData &&
      props.externalChatData.length > 0
    ) {
      startNewChatWithExternalData(props.externalChatData);
    }
  }
);

const startNewChatWithExternalData = (externalData: ExternalChatMessage[]) => {
  if (!chat.value || externalData.length === 0) return;
  try {
    const converted = externalData.map((msg, index) => ({
      id: msg.id ?? Date.now() + index,
      timestamp: msg.timestamp ?? new Date().toISOString(),
      content: msg.content ?? msg.text ?? "",
      type: msg.type ?? "user",
      chatId: msg.chatId,
      intentionType: msg.intentionType,
      files: msg.files ?? [],
      ...msg,
    }));
    chat.value.initChatAction(converted);
    chat.value.setWelcomeType(false);
    const first = converted[0];
    const titleToSend = (first?.title ?? first?.content ?? "") as string;
    if (titleToSend) sendFirstMessageTitle(titleToSend);
    isInit.value = true;
  } catch (err) {
    console.error("startNewChatWithExternalData error:", err);
  }
};

const sendFirstMessageTitle = (title: string) => {
  if (!chat.value) return;
  // 仅保留占位，不更改你的发送逻辑实现
  // chat.value.sendMessage?.(title);
};

const resetChatBase = () => {
  isChatBaseVisible.value = false;
  setTimeout(() => {
    mySDK.init();
    chat.value = new ChatController(mySDK);
    if (!isCreated.value && !props.isExternalChat) {
      getChatData(chatUid.value).then((data) => {
        if (data.messages.length) {
          chat.value!.initChatAction(data.messages);
        } else {
          chat.value!.setQueryObject({ content: data.title });
        }
      });
    }
    if (props.isExternalChat && props.externalChatData && props.externalChatData.length > 0) {
      startNewChatWithExternalData(props.externalChatData);
    }
    isChatBaseVisible.value = true;
  }, 0);
};

let customEnterSend =
  route.name === "FullViewChat" && !route.params.chatId
    ? async (inputValue: string) => {
        await setChatData({ chatId: chatUid.value, title: inputValue, messages: [] });
        router.push({ name: "FullViewChat", params: { chatId: chatUid.value } });
      }
    : null;

watch(
  () => props.sessionNum,
  () => resetChatBase(),
  { immediate: true }
);

let resizeObserver: ResizeObserver | null = null;
const initMutationObserver = () => {
  const targetNode = document.querySelector(".chat-container") as HTMLElement | null;
  if (!targetNode) return;
  let requestAnimation: number | null = null;
  resizeObserver = new ResizeObserver(() => {
    if (requestAnimation) cancelAnimationFrame(requestAnimation);
    requestAnimation = requestAnimationFrame(() => updateAnswerContainerMargin());
  });
  resizeObserver.observe(targetNode);
};

const communicator = new CrossTabCommunicator(ChannelMessageType.MAINCHAT);
communicator.onMessage((message: ChannelMessage) => {
  const { type, data } = message;
  if (type === "dropdown-invoke-function") {
    const functionName: string = (data as { functionName?: string }).functionName ?? "";
    dropdownActions[functionName]?.();
  }
  if (type === "smartSelect") {
    const parsed = data as {
      SmartSelect_CaptureText: string;
      SmartSelect_functinName: string;
      SmartSelect_Intention: string;
    };
    handleSmartSelect(parsed);
  }
});
// 监听 mode 改变，切换到对应 chat
watch(
  () => props.mode,
  (m) => {
    if (m) {
      switchChat(m as ChatKey);
    }
  },
  { immediate: false }
);
onMounted(() => {
  if (route.params.chatId) {
    isCreated.value = false;
    chatUid.value = route.params.chatId as string;
  } else {
    chatUid.value = uuidv4();
    isCreated.value = true;
  }
  if (props.isExternalChat && props.externalChatData && props.externalChatData.length > 0) {
    setTimeout(() => startNewChatWithExternalData(props.externalChatData!), 100);
  }
  if (props.mode) {
    switchChat(props.mode as ChatKey);
  }
  initMutationObserver();
  window.addEventListener("resize", handleResize);
  updateAnswerContainerMargin();
  WebviewMessager.on("GetToolsAndImage", handleGetToolsAndImage);
  WebviewMessager.on("sendBookHotelMessage", sendBookHotelMessage);
  WebviewMessager.on("client.h5.modeMgr.chatExportContent", getChatCallbackResult);
});

onBeforeUnmount(async () => {
  if (props.isExternalChat) return;
  if (route.params.chatId) {
    await updateChatData({
      chatId: chatUid.value,
      title: chat.value!.chatAction[0].getData().content,
      messages: chat.value!.chatAction,
    });
  } else if (isCreated.value) {
    await setChatData({
      chatId: chatUid.value,
      title: chat.value!.chatAction[0].getData().content,
      messages: chat.value!.chatAction,
    });
  }
});

const handleGetToolsAndImage = (
  data: MessageRes<{ ImageBase64: string; ImagePath: string; Tools: string }>
) => {
  const { ErrorCode, ErrorMessage, Data } = data;
  if (ErrorCode !== 0) return;
  const { ImageBase64, ImagePath, Tools } = Data;
  chat.value?.setWelcomeType(false);
  let content = Tools || "";
  if (Tools === "Web Search") content = "Tell me more about this.";
  if (Tools === "Book Hotels nearby") content = "Book Hotels nearby";
  chat.value?.setQueryObject({
    content,
    files: [{ name: "", base64: ImageBase64, path: ImagePath, fileId: "" }],
    intentionType: "WORK_ASSISTANT_IMAGE_SNIP",
    actionType: AnswerActionType.PICTURE,
  });
};

const sendBookHotelMessage = (
  data: MessageRes<{ location: string; hotelName: string; checkIn: string; checkOut: string }>
) => {
  const { ErrorCode, ErrorMessage, Data } = data;
  if (ErrorCode !== 0) return;
  const { hotelName, checkIn, checkOut } = Data;
  chat.value?.setWelcomeType(false);
  const msg = `Ok I booked the ${hotelName} for  ${checkIn} - ${checkOut}`;
  chat.value?.createChatPair({ content: "" }, msg);
};

const handleResize = () => requestAnimationFrame(() => updateAnswerContainerMargin());

const updateAnswerContainerMargin = () => {
  const fileDisplay = document.querySelector(".file-display") as HTMLElement | null;
  const answerContainers = document.querySelectorAll(".answer-container");
  const inputBoxContent = document.querySelector(".input-box_content") as HTMLElement | null;
  if (!answerContainers.length) return;
  const lastAnswerContainer = answerContainers[answerContainers.length - 1] as HTMLElement;
  if (fileDisplay) {
    const computedStyle = window.getComputedStyle(fileDisplay);
    const isVisible = computedStyle.opacity !== "0" && computedStyle.display !== "none";
    if (inputBoxContent) inputBoxContent.style.marginTop = isVisible ? "80px" : "0";
    lastAnswerContainer.style.marginBottom = isVisible
      ? `${Math.max(32, fileDisplay.offsetHeight + 32 + 16)}px`
      : "24px";
  } else {
    if (inputBoxContent) inputBoxContent.style.marginTop = "0";
    lastAnswerContainer.style.marginBottom = "24px";
  }
};

const handleCatchMeUp = async () => {
  chat.value?.setWelcomeType(false);
  chat.value?.setQueryObject({ content: "catch me up" });
};

const handleObtainScreenshotFile = async () => {
  const MessageId = uuidv4();
  try {
    await obtainScreenshotFile({ MessageId, Data: { SessionId: Date.now().toString() } });
  } catch (error) {
    console.error("Error obtaining screenshot file:", error);
  }
};

const handleSmartSelect = (params: {
  SmartSelect_CaptureText: string;
  SmartSelect_functinName: string;
  SmartSelect_Intention: string;
}) => {
  chat.value?.setWelcomeType(false);
  chat.value?.setQueryObject({
    content: params.SmartSelect_CaptureText,
    intentionType: params.SmartSelect_Intention,
    payload: { functionName: params.SmartSelect_functinName },
  });
  sendSmartSelectMessage({ Data: {} });
};

const dropdownActions: Record<string, () => void> = {
  "Catch me up": handleCatchMeUp,
  "Screen Capture": handleObtainScreenshotFile,
};

const clickSendPrimary = (content: string) => {
  chat.value?.setQueryObject({ content });
};

/**
 * 通知H5需要导出 再把内容返回给C#
 * @param data
 * @returns void
 */
const getChatCallbackResult = () => {
  const pairs = extractQAPairs(chat.value?.chatAction);
  pairs.unshift({ question: "", answer: payAttentionStore.payAttData.summary });
  // sendExportContent({ MessageSource: "window1", Data: { content: JSON.stringify(pairs) } });
  const html = buildChatHtml(pairs, { pageTitle: "" });
  sendExportContent({ MessageSource: "window1", Data: { content: html } });
};

const extractQAPairs = (list) => {
  const pairs: { question: string; answer: string }[] = [];
  let current: any = {};

  for (const item of list) {
    if (item.questionData) {
      current.question = item.questionData.content;
    } else if (item.answerData) {
      current.answer = item.answerData.content;
      pairs.push(current);
      current = {};
    }
  }
  return pairs;
};
onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  window.removeEventListener("resize", handleResize);
  WebviewMessager.off("GetToolsAndImage");
  WebviewMessager.off("sendBookHotelMessage");
  communicator.close();
});
</script>
<style lang="less" scoped>
.chat-wrap {
  //   padding: 8px;
}

.suggestion {
  max-width: 904px;
}
.pay-attention-chat-container {
  width: 100%;
  flex: 1;
  min-height: 0;
  .chat-wrap {
    display: flex;
    flex-direction: column;
    // overflow: auto;
    // max-height: 616px;
    // max-width: 904px;
    font-size: 32px;
    position: relative;
    height: 100%;
    margin: 0 auto;

    &-title {
      display: flex;
      align-items: center;
      border-radius: 20px 20px 0 0;
      height: 50px;
      width: 100%;
      z-index: 10;
      justify-content: space-between;
      margin-bottom: 10px;

      .clear-chat {
        cursor: pointer;
      }

      .icon-img {
        width: 24px;
        height: 24px;
      }
    }

    > * {
      box-sizing: border-box;
    }

    &_welcome {
      position: absolute;
      top: 25%;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      // 940 / viewport * desktopWidth
      max-width: 940px;
      text-align: center;
      margin-bottom: 20px;
    }
  }
}
.answer-container {
  position: relative;
  margin-bottom: 24px;

  &:hover .answer-operation {
    opacity: 1;
    visibility: visible;
  }
}

.answer-operation {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.query-container {
  position: relative;

  &:hover .query-operation {
    opacity: 1;
    visibility: visible;
  }
}

.query-operation {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
  z-index: 10;
  height: 24px;
}

:deep(.chat-box) {
  // flex: 1;
  overflow: hidden;
}

:deep(.chat-box_input) {
  padding: 0;
  height: auto;
}

.but-item-primary {
  height: 32px;
  border-radius: 32px;
  border: 2px solid rgba(0, 0, 0, 0.27);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  padding: 0 16px;
  margin-right: 10px;
}
</style>
