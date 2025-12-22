<template>
  <div :class="['chat-wrap']">
    <div class="chat-bg"></div>
    <div class="chat-wrap-title" v-if="isInit">
      <img :src="TitleIcon" />
      <div class="chat-wrap-title-text">Pop out chat</div>
    </div>
    <ChatBase v-if="isChatBaseVisible" :chat="chat">
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
      <template #inputSlot>
        <InputPage
          :chat="chat"
          :isInit="isInit"
          @toggle-init="toggleInit"
          @change-loudspeaker-status="changeLoudspeakerStatus"
          :isLoudspeaker="isLoudspeaker"
          @summary-to-action="toSummaryAction"
        />
      </template>
    </ChatBase>
  </div>
</template>

<script setup lang="ts">
import { ChatBase, ChatController } from "@libs/p-comps";
import Answer from "@libs/p-comps/ChatBaseComponent/types/ChatClass";
import mySDK from "./sdkService";
import { onMounted, ref, watch, onUnmounted } from "vue";
import { InputPage, QuestionPage, AnswerPage } from "@libs/p-comps/ChatView";
import TitleIcon from "@/assets/ChatIcons/titleIcon.png";
import {
  changeSize,
  setModeStatus,
  triggerPayAttentionForCall,
  WebviewMessager,
} from "@libs/service";
const chat = ref<ChatController>();
const isChatBaseVisible = ref(true);
const isInit = ref<boolean>(false);
const props = defineProps({
  sessionNum: Number,
});

// 通过emit 来更改扬声器状态
const isLoudspeaker = ref(true);
const changeLoudspeakerStatus = async (status: boolean) => {
  try {
    const res = await setModeStatus({
      MessageSource: "window1",
      Data: {
        mode: status ? "suggestion" : "question",
      },
    });
    isLoudspeaker.value = res.data.Data.mode === "suggestion";
  } catch (error) {
    console.error(error, "setModeStatusError");
  }
};

const toSummaryAction = async () => {
  try {
    triggerPayAttentionForCall({
      MessageSource: "window1",
      Data: {},
    });
  } catch (error) {
    console.error("Error triggering pay attention for call:", error);
  }
};
const resetChatBase = () => {
  isChatBaseVisible.value = false;
  setTimeout(() => {
    mySDK.init();
    chat.value = new ChatController(mySDK);
    chat.value.isWelcome = false;
    isChatBaseVisible.value = true;
  }, 0);
};

watch(
  () => props.sessionNum,
  () => {
    console.log(props.sessionNum, "props.sessionNum");
    resetChatBase();
  },
  { immediate: true }
);

onMounted(() => {
  setupUploadAreaObserver();
  getSummaryText();
});

const widthWindow = ref(550);
const getSummaryText = () => {
  WebviewMessager.on("client.h5.getSummary", (data) => {
    console.log(data, "client.h5.getSummary");
    const summaryText = data.Data.summaryContent as string;
    widthWindow.value = 490;
    chat.value.createChatPair({ content: "" }, summaryText);
  });
};

const toggleInit = (init: boolean) => {
  isInit.value = init;
};

const setupUploadAreaObserver = () => {
  const updateAnswerContainerMargin = () => {
    const fileDisplay = document.querySelector(".file-display") as HTMLElement;
    const answerContainers = document.querySelectorAll(".answer-container");
    const inputBoxContent = document.querySelector(
      ".input-box_content"
    ) as HTMLElement;

    if (!answerContainers.length) return;

    const lastAnswerContainer = answerContainers[
      answerContainers.length - 1
    ] as HTMLElement;

    if (fileDisplay) {
      const computedStyle = window.getComputedStyle(fileDisplay);
      const isVisible =
        computedStyle.opacity !== "0" && computedStyle.display !== "none";

      if (inputBoxContent) {
        inputBoxContent.style.marginTop = isVisible ? "80px" : "0";
      }

      if (isVisible) {
        const baseMargin = 32;

        const marginBottom = Math.max(
          baseMargin,
          fileDisplay.offsetHeight + baseMargin + 16
        );
        lastAnswerContainer.style.marginBottom = `${marginBottom}px`;
      } else {
        lastAnswerContainer.style.marginBottom = `${24}px`;
      }
    } else {
      if (inputBoxContent) {
        inputBoxContent.style.marginTop = "0";
      }
      lastAnswerContainer.style.marginBottom = `${24}px`;
    }
  };

  let lastHeight = 0;
  const changeWebviewSize = async (initialHeight: number = 45) => {
    const chatWrap = document.querySelector(".chat-wrap") as HTMLElement | null;
    if (!chatWrap || lastHeight > 373) return;

    const height = Math.max(chatWrap.scrollHeight, initialHeight);
    const width = chatWrap.scrollWidth;
    if (height < lastHeight) return;
    try {
      await changeSize({
        MessageSource: "window1",
        Data: { Height: height, Width: widthWindow.value },
      });
      lastHeight = height;
    } catch (error) {
      console.error("Error changing webview size:", error);
    }
  };

  const observer = new MutationObserver(() => {
    console.log("MutationObserver triggered");
    requestAnimationFrame(() => {
      updateAnswerContainerMargin();
      if (lastHeight < 373) {
        changeWebviewSize();
      }
    });
  });

  const targetNode = document.querySelector(".chat-wrap") as HTMLElement;
  if (targetNode) {
    observer.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "opacity", "transform"],
    });
  }

  updateAnswerContainerMargin();
  changeWebviewSize();

  window.addEventListener("resize", () => {
    requestAnimationFrame(() => {
      updateAnswerContainerMargin();
    });
  });

  onUnmounted(() => {
    observer.disconnect();
    window.removeEventListener("resize", updateAnswerContainerMargin);
  });
};
</script>

<style lang="less" scoped>
.chat-wrap {
  display: flex;
  flex-direction: column;
  overflow: auto;
  max-height: 375px;
  min-width: 410px;
  // background-color: transparent;
  // background: rgba(255, 255, 255, 0.08);
  // border: 1px solid rgba(255, 255, 255, 0.18);
  // backdrop-filter: blur(12px) saturate(1.8) brightness(1.1);
  // overflow: hidden;

  &-title {
    display: flex;
    align-items: center;
    padding-bottom: 10px;
    border-radius: 20px 20px 0 0;
    height: 50px;
    width: 100%;
    z-index: 10;
    > img {
      width: 16px;
      height: 16px;
      margin-right: 5px;
    }
    &-text {
      font-weight: 700;
      font-size: 11px;
      line-height: 16px;
      letter-spacing: 0.5px;
      vertical-align: middle;
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

  .font-segoe {
    font-family: Segoe UI;
  }

  .font-yh {
    font-family: Microsoft YaHei;
  }

  &_banner {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 50px;
  }
}

.answer-container {
  position: relative;

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
  flex: 1;
}
</style>
