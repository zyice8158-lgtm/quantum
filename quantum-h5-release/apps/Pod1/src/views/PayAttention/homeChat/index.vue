<template>
  <div class="home-chat-container">
    <!-- 顶部按钮：只要不是录制态就显示（isRecording !== true） -->
    <div class="pay-attention-btns mb-[10px] mt-[10px] select-none" v-if="!isRecording">
      <selectButton :isSummary="mode" @change="handleSelectChange" />
    </div>
    <PayAttentionChat
      :mode="mode"
      :isRecording="isRecording"
      :headerText="headerText"
      :formattedDuration="formattedDuration"
      :azureKey="azureKey"
    />
  </div>
</template>

<script setup lang="ts">
import PayAttentionChat from "../components/chat/index.vue";
import { onMounted, onUnmounted, ref, computed, watch, provide } from "vue";
import { WebviewMessager, MessageRes } from "@libs/service";
import {
  ChannelMessage,
  CrossTabCommunicator,
  ChannelMessageType,
} from "@libs/service";
import { SelectButtonStatus } from "../home/index";
import selectButton from "../components/selectButton/btns.vue";
import { PayAttData, setPayAttentionStore, RecordingDisplayStatus, payAttentionStore, DisplayMode, VALID_DISPLAY_MODES } from "@/store/payAttention";
import { useLocale } from "@/hooks/i18n";

const emit = defineEmits<{
  (e: "change-mode", v: SelectButtonStatus | ""): void;
}>();

const mode = ref<SelectButtonStatus | "">("");
const azureKey = ref<number>(0);

const { t } = useLocale();

watch(mode, async (newMode) => {
  const displayMode = VALID_DISPLAY_MODES.includes(newMode as DisplayMode)
    ? (newMode as DisplayMode)
    : "";
  await setPayAttentionStore('displayMode', displayMode);
}, { immediate: true });

const isRecording = computed<boolean>(() => mode.value === "");

// mode 对应的 i18n 键映射
const modeTextMap: Partial<Record<SelectButtonStatus, string>> = {
  [SelectButtonStatus.Summary]: "payAttention.summary",
  [SelectButtonStatus.Transcript]: "payAttention.transcript",
  [SelectButtonStatus.AudioRecording]: "payAttention.audioRecording",
};

// 头部文案
const headerText = computed<string>(() => {
  // 录音中
  if (isRecording.value) return t('payAttention.recordingInProgress');

  // 如果没有 mode，返回空字符串
  if (!mode.value) return "";

  // 获取 mode 对应的文本
  const modeTextKey = modeTextMap?.[mode.value];
  if (!modeTextKey) return "";
  const modeText = t(modeTextKey);

  const displayStatus = payAttentionStore.recordingDisplayStatus;
  if (displayStatus === RecordingDisplayStatus.Summarizing) {
    return `${t('payAttention.generating')} ${modeText}...`;
  } else if (displayStatus === RecordingDisplayStatus.SummaryCompleted) {
    return `${t('payAttention.hereIsThe')} ${modeText}`;
  }
});

const getSummaryText = (): void => {
  // 总结消息
  WebviewMessager.on("client.h5.getSummary", async (payload: MessageRes<Record<string, unknown>>) => {
    const d = (payload.Data) as unknown as PayAttData;

    // 从fkb或者lz跳转过来，默认是总结模式
    if(!mode.value){
        mode.value = SelectButtonStatus.Summary;
      }
    setPayAttentionStore('payAttData', d);
    setPayAttentionStore('recordingDisplayStatus', RecordingDisplayStatus.SummaryCompleted);
  });
};

const startTime = ref<number | null>(null); // 开始时间
const elapsed = ref<number>(0); // 流逝时间
let timer: number | null = null;

const formattedDuration = computed<string>(() => {
  // 格式化流逝时间
  const total = elapsed.value;
  const h = Math.floor(total / 3600);
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  // 如果不到一小时，只展示分钟和秒
  if (h === 0) {
    return `${m}:${s}`;
  }
  return `${String(h).padStart(2, "0")}:${m}:${s}`;
});

const startRecordingTime = (): void => {
  // 开始录制
  if (timer != null) return;
  startTime.value = Date.now();
  timer = window.setInterval(() => {
    elapsed.value = Math.floor((Date.now() - (startTime.value ?? 0)) / 1000);
  }, 1000);
};

const stopRecordingTime = (): void => {
  if (timer != null) {
    clearInterval(timer);
    timer = null;
  }
};

const resetForRecordingStart = (): void => {
  mode.value = "";
  stopRecordingTime();
  elapsed.value = 0;
  startTime.value = null;
  startRecordingTime();
  azureKey.value++;
};

const resetForRecordingStop = (): void => {
  stopRecordingTime();
  mode.value = SelectButtonStatus.Summary;
};

type RecordBusMap = { "record:state": { active: boolean } };
const recordBus = new CrossTabCommunicator(ChannelMessageType.RECORD);

const bindRecordBus = (): void => {
  recordBus.onMessage((msg: ChannelMessage) => {
    if (msg.type !== "record:state") return;
    const { active } = msg.data as RecordBusMap["record:state"];
    console.log(msg, "record:state msg ", active);
    if (active) {
      resetForRecordingStart();
    } else {
      resetForRecordingStop();
    }
  });
};

const handleSelectChange = (val: SelectButtonStatus | ""): void => {
  mode.value = val;
};

onMounted(() => {
  getSummaryText();
  bindRecordBus();
  startRecordingTime();
});

onUnmounted(() => {
  stopRecordingTime();
  recordBus.close();
  WebviewMessager.off("client.h5.getSummary");
});
</script>

<style scoped lang="less">
@import "../index.less";
.home-chat-container {
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
}

.pay-attention-btns {
  height: 32px;
  width: 100%;
  display: flex;
  // align-items: center;
  // justify-content: center;
  cursor: pointer;
}
.home-chat-tips {
  height: 24px;
  position: absolute;
  bottom: 0;
  font-size: var(--text-label-xs);
  line-height: 100%;
  width: 100%;
  text-align: center;
  color: var(--color-text-on-surface-disabled);
}
</style>
