<template>
  <WarningTips />
  <div class="pay-attention-home-container">
    <div class="pay-attention-header" v-automation="'pay_attention_header'">
      <div class="pay-attention-header_left">
        <div class="flex items-center">
          <IconQuantumLogo
            class="text-body-l transition-transform duration-500 ease-in-out mr-[10px] fa"
          />
          <span class="family-font text-primary-primary text-label-l font-[500] select-none">{{ headerText }}</span>
        </div>
      </div>
      <div class="family-font pay-attention-header_right text-primary-primary tabular-nums text-body-m font-[500] select-none" v-if="isRecording">
        {{ t('payAttention.duration') }}: {{ formattedDuration }}
        <div
          class="pay-attention-header_right_setting"
          @click="handleSettingClick"
          @keydown="handleSettingKeyDown"
          tabindex="0"
          role="button"
          :aria-label="showSettingDialog ? t('common.close') + ' ' + t('settings.title') : t('settings.title')"
          :aria-expanded="showSettingDialog"
        >
          <IconSettings class="text-primary-primary w-[24px] h-[24px]" />
        </div>
      </div>
    </div>
    <DialogLanguage @setClose="handleDialogClose" v-if="showSettingDialog&&isRecording" />
    <div
      class="pay-attention-home_wrap_audio flex justify-center items-center"
      v-if="mode === SelectButtonStatus.AudioRecording && !needStepBar"
    >
      <AudioCom ref="audioRef" @timeupdate="onAudioTimeupdate" />
    </div>
    <div class="pay-attention-home-box" :class="{ 'not-scrolling': isRecording }" ref="homeBoxRef" @scroll="handleHomeBoxScroll">
      <div v-if="!needStepBar" class="pay-attention-home" :class="{ 'has-content': hasContent }" v-automation="'pay_attention_home'">
          <component
            :is="currentContentComponent"
            :key="azureKey"
            ref="azureSpeechRef"
            :status="mode"
            :isRecording="isRecording"
            :homeBoxRef="homeBoxRef"
            @seek="onSeek"
            :playhead-sec="displayPlayhead"
            :needStepBar="needStepBar"
          />
        <div class="pay-attention-home_wrap_bottom" v-if="!isRecording && !needStepBar">
          <div
            class="w-[16px] h-[16px] mr-[24px] cursor-pointer text-on-focus-container"
            @click="handleCopy"
            @keydown="handleCopyKeyDown"
            tabindex="0"
            role="button"
            :aria-label="t('payAttention.copy')"
            v-tooltip.bottom="{ value: t('payAttention.copy'), showDelay: 100, hideDelay: 300 }"
          >
            <IconCopy  />
          </div>
          <div
            class="cursor-pointer text-on-focus-container"
            @click="handleShare"
            @keydown="handleShareKeyDown"
            tabindex="0"
            role="button"
            :aria-label="t('payAttention.share')"
            v-tooltip.bottom="{ value: t('payAttention.share'), showDelay: 100, hideDelay: 300 }"
          >
            <IconShare  />
          </div>
        </div>
      </div>
      <stepBar v-if="needStepBar && !isRecording" />
    </div>
    <ErrorTips v-if="isRecording" :errorType="errorType"/>
    <div class="home-chat-tips select-none">{{ t('payAttention.aiMistakesWarning') }}</div>
  </div>
</template>

<script setup lang="ts">
import azureSpeech from "../components/azureSpeech/index.vue";
import SummaryContent from "../components/SummaryContent/index.tsx";
import TranscriptContent from "../components/TranscriptContent/index.tsx";
import { IconQuantumLogo, IconCopy, IconShare, IconSettings } from "@quantum/icons";
import stepBar from "../components/stepBar/index.vue";
import AudioCom from "../components/audioCom/index.vue";
import { ref, onMounted, onBeforeUnmount, watch, computed, type Component } from "vue";
import { SelectButtonStatus, ErrorType, extractContent } from "./index";
import { useToast } from "primevue/usetoast";
import { useLocale } from "@/hooks/i18n";
import { sendExportContent, WebviewMessager, AppFetch } from "@libs/service";
import { payAttentionStore, RecordingDisplayStatus, isSummaryCompleted, setPayAttentionStore } from "@/store/payAttention";
import { buildChatHtml } from "../exportHtml";
import DialogLanguage from "../components/dialogLanguage/settingPage.vue";
import ErrorTips from "../components/errorTips/index.vue";
import WarningTips from "../components/WarningTips/index.tsx";

type AzureSpeechExpose = {
  getTranscriptText: () => string;
  resetAll: () => void;
  stopToggleMockMode: () => Promise<void> | void;
  stopRecording: () => Promise<void>;
  handleScroll: () => void;
};

const props = defineProps<{
  mode: SelectButtonStatus | ""; // 页面模式
  isRecording: boolean; // 是否录制中
  headerText: string; // 头部文案
  formattedDuration: string; // 计时显示
  azureKey: number; // 强制重建 azureSpeech 的 key
}>();

const azureSpeechRef = ref<AzureSpeechExpose | null>(null);
const homeBoxRef = ref<HTMLDivElement | null>(null);
const showSettingDialog = ref(false);
const errorType = ref<ErrorType>(ErrorType.NONE);
const toast = useToast();
const { t } = useLocale();

const needStepBar = computed<boolean>(() => payAttentionStore.recordingDisplayStatus === RecordingDisplayStatus.Summarizing);

// 组件映射 map：根据 mode 匹配对应的组件
const modeComponentMap: Partial<Record<SelectButtonStatus, Component>> = {
  [SelectButtonStatus.Summary]: SummaryContent,
  [SelectButtonStatus.Transcript]: TranscriptContent,
};

const currentContentComponent = computed(() => {
  console.log(props.mode, 'props.mode=======');
  if (props.mode && modeComponentMap[props.mode]) {
    return modeComponentMap[props.mode];
  }
  return azureSpeech;
});

// 判断是否有内容
const hasContent = computed<boolean>(() => {
  if (isSummaryCompleted.value) return true;

  try {
    const transcriptText = azureSpeechRef.value?.getTranscriptText?.();
    if (transcriptText?.trim() && props.isRecording) return true;
  } catch {

  }
  return false;
});


const errorCodeMap: Record<string, ErrorType> = {
  "-1": ErrorType.TEMPORARY,
  "-2": ErrorType.TEMPORARY,
  "5": ErrorType.FATAL,
};

const handleShare = () => {
  const payAttData = payAttentionStore.payAttData;
  const html = buildChatHtml(payAttData.summary, { pageTitle: payAttData.title });
  sendExportContent({ MessageSource: "window1", Data: { content: html } });
  // sendExportContent({ MessageSource: "window1", Data: { content: props.summaryText } });
};

const handleCopyKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleCopy();
  }
};

const handleShareKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleShare();
  }
};

watch(() => props.isRecording, (newVal) => {
  if (!newVal) {
    showSettingDialog.value = false;
  }
});

// 图标setting弹窗
const handleSettingClick = () => {
  showSettingDialog.value = !showSettingDialog.value;
};

const handleSettingKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleSettingClick();
  }
};

const handleDialogClose = (value: boolean) => {
  showSettingDialog.value = value;
};

const audioRef = ref<{
  playAt: (sec: number) => Promise<void>;
  seekTo: (sec: number) => void;
} | null>(null);

const copyText = async (text: string): Promise<boolean> => {
  const value = (text ?? "").trim();
  if (!value) return false;

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // 回退：隐藏 textarea + execCommand
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
};

const extractTextFromHtml = (htmlContent: string): string => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  return tempDiv.textContent || tempDiv.innerText || "";
};

const handleCopy = async (): Promise<void> => {
  const payAttData = payAttentionStore.payAttData;

  const textExtractors: Partial<Record<SelectButtonStatus, () => string>> = {
    [SelectButtonStatus.Summary]: () => {
      const htmlContent = extractContent(payAttData.summary);
      return extractTextFromHtml(htmlContent);
    },
    [SelectButtonStatus.Transcript]: () => payAttData.transcription ?? "",
    [SelectButtonStatus.AudioRecording]: () =>
      payAttData.messages.map(msg => msg.message).join("\n"),
  };

  const extractor = props.mode ? textExtractors[props.mode] : null;
  const text = extractor?.() ?? "";

  const ok = await copyText(text);
  toast.add({
    severity: ok? "success":"error",
    detail: ok ? t('payAttention.copySuccess') : t('payAttention.copyFailed'),
    life: 3000,
  });
};

// 处理 homeBox 的滚动事件（录音中时），调用子组件的 handleScroll
const handleHomeBoxScroll = (): void => {
  azureSpeechRef.value?.handleScroll?.();
};

// 父组件：把 AudioCom 的秒数转成“显示时钟”
const playheadSec = ref(0); // 来自 audio 的原始秒
const displayPlayhead = ref(0); // 用于传给 azureSpeech 的“慢时钟”
let lastUpdate = performance.now();

const CFG = { alpha: 0.25, maxSlew: 2.0 }; // alpha 越小越慢；maxSlew 每秒最大跟随秒数

const onAudioTimeupdate = (sec: number): void => {
  const now = performance.now();
  const dt = Math.max(0.001, (now - lastUpdate) / 1000);
  lastUpdate = now;

  playheadSec.value = sec;

  // 1) 期望用 EMA 慢慢追
  const ema = displayPlayhead.value + CFG.alpha * (playheadSec.value - displayPlayhead.value);

  // 2) 再限幅：每秒最多前进/后退 maxSlew
  const maxStep = CFG.maxSlew * dt;
  const diff = ema - displayPlayhead.value;
  const step = Math.abs(diff) > maxStep ? Math.sign(diff) * maxStep : diff;

  displayPlayhead.value = Math.max(0, displayPlayhead.value + step);
};

// seek 时立刻同步，避免错位
const onSeek = (sec: number): void => {
  audioRef.value?.playAt(sec);
  playheadSec.value = sec;
  displayPlayhead.value = sec;
};

const handleErrorNotification = (data: { Data?: { errorCode?: number } }) => {
  const d = (data as { Data?: { errorCode?: number } } | undefined)?.Data;
  const errorCode = d?.errorCode;
  errorType.value = errorCodeMap?.[String(errorCode)] ?? ErrorType.NONE;
  if (errorType.value === ErrorType.FATAL) {
    azureSpeechRef.value?.stopRecording();
  }
};

watch(
  () => [payAttentionStore.recordingDisplayStatus, payAttentionStore.shouldStopMockMode],
  ([status, flag]) => {
    if (!flag && status === RecordingDisplayStatus.Summarizing) {
      azureSpeechRef.value?.stopToggleMockMode();
      setPayAttentionStore('shouldStopMockMode', false);
    }
  }
);

const init = async() => {
  // 初始化完成通知C#，当从fkb跳转过来，c#给发getSummary
  AppFetch.post('/payAttention/readyForCommunication',{
      MessageSource: 'windowRecord1',
    });
}

onMounted(() => {
  WebviewMessager.on("client.h5.errorNotification", handleErrorNotification);
  init()
});

onBeforeUnmount(()=> {
  WebviewMessager.off("client.h5.errorNotification");
})
</script>

<style scoped lang="less">
.pay-attention-home-container {
  height: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pay-attention-header {
  height: 36px;
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 500;
  flex-shrink: 0;
  &_left {
    // -webkit-background-clip: text;
    // color: transparent;
    display: flex;
    align-items: center;
    font-size: var(--text-body-m);
    justify-content: space-between;
    flex: 1;
  }
  &_right {
    font-size: var(--text-body-m);
    display: flex;
    &_setting {
      margin-left: 8px;
      cursor: pointer;
    }

  }
}
.pay-attention-home-box {
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  flex: 1;
  min-height: 0;
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    width: 4px;
  }

  &.is-scrolling {
    overflow-y: auto;
    height: 100%;
  }

}
.pay-attention-home {
  width: 100%;
  background: var(--color-surface);
  border-radius: 24px;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-wrap: break-word;
  word-wrap: break-word;

  &.has-content {
    padding: 24px 24px 12px 24px;
  }
  &_wrap {
    &_audio {
      height: 70px;
      padding: 4px 0 16px;
      width: 100%;
      flex-shrink: 0;
    }
    &_content {
      width: 100%;
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }
    &_bottom {
      height: 40px;
      width: 100%;
      display: flex;
      border-top: 1px solid #cdcdcd; // to do，找设计确认颜色
      align-items: center;
      justify-content:flex-end;
      flex-direction: row;
    }
  }
}
.home-chat-tips {
  height: 24px;
  bottom: 0;
  font-size: var(--text-label-xs);
  line-height: var(--leading-label-m);
  width: 100%;
  text-align: center;
  color: var(--color-text-on-surface-disabled);
  border-radius: var(--radius-32);
}
.family-font {
  font-family: "Rookery New";
}
</style>
