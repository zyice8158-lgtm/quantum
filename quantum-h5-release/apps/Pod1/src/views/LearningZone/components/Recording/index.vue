<template>
  <div class="home-chat-container">
    <AudioWave @toggleRotate="toggleRotate" />
    <PayAttentionChat
      v-if="isShowRecording"
      :mode="mode"
      :isRecording="isRecording"
      :headerText="headerText"
      :summaryText="summaryText"
      :formattedDuration="formattedDuration"
      :audioPath="audioPath"
      :selectedValue="selectedValue"
      :azureKey="azureKey"
      @change-mode="handleSelectChange"
      @change-lang="handleTypeChange"
      @clear-summary="summaryText = ''"
    />
  </div>
</template>

<script setup lang="ts">
import PayAttentionChat from "./home/index.vue";
import { onMounted, onUnmounted, ref, computed } from "vue";
import { WebviewMessager } from "@libs/service";
import AudioWave from "./components/AudioWaveCom/AudioWave";
import {
  ChannelMessage,
  CrossTabCommunicator,
  ChannelMessageType,
  setTranslationLaguage,
  setRecordTranslationLaguage
} from "@libs/service";
// import { SelectButtonStatus } from "../home/index";
import selectButton from "./components/selectButton/btns.vue";
import { useLocale } from "@/hooks/i18n";

type SelectButtonExpose = { isSelect: string };
const selectButtonRef = ref<SelectButtonExpose | null>(null);

const emit = defineEmits<{
  (e: "change-mode", v: SelectButtonStatus | ""): void;
}>();
const isShowRecording = ref(true);
// 折叠按钮
const toggleRotate = (isShow: boolean) => {
  console.log("--------------toggleRotate-----------", isShow);
  isShowRecording.value = isShow;
};

const summaryText = ref<string>(``); // 总结的内容
const audioPath = ref<string>(""); // 音频路径

const getSummaryText = (): void => {
  console.log('---------====client.LearningZone.transcription====--------');
  WebviewMessager.on("client.LearningZone.transcription", async (data: unknown) => {
    const d = (data as { Data?: { msg?: string; audioPath?: string } } | undefined)
      ?.Data;
    summaryText.value = String(d?.msg ?? "");
    console.log(data,summaryText.value,'====client.LearningZone.transcription====');
    // audioPath.value = String(d?.audioPath ?? "");
  });
};

const getTranslationLaguage = (): void => {
  // 翻译语言
  console.log('---------====client.LearningZone.TranslationLaguage====--------');
  WebviewMessager.on("client.LearningZone.TranslationLaguage", async (data: unknown) => {
    const d = (data as { Data?: { msg?: string; audioPath?: string } } | undefined)
      ?.Data;
    summaryText.value = String(d?.msg ?? "");
    console.log(data,summaryText.value,'====client.LearningZone.TranslationLaguage====');
  });
};


const mode = ref<SelectButtonStatus | "">("");
const selectedValue = ref<string>("en-US");
const azureKey = ref<number>(0);

const { t } = useLocale();

const isRecording = true;

// 头部文案
const headerText = t('learningZone.processedTranscript');

const startTime = ref<number | null>(null); // 开始时间
const elapsed = ref<number>(0); // 流逝时间
let timer: number | null = null;

const formattedDuration = computed<string>(() => { // 格式化流逝时间
  const total = elapsed.value;
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
});

const startRecordingTime = (): void => { // 开始录制
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
  selectedValue.value = "en-US";
  stopRecordingTime();
  elapsed.value = 0;
  startTime.value = null;
  startRecordingTime();
  azureKey.value++;
  summaryText.value = "";
  audioPath.value = "";
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
    console.log(msg, "record:state msg ",active);
    if (active) {
      resetForRecordingStart();
    } else {
      resetForRecordingStop();
    }
  });
};

const handleSelectChange = (val: SelectButtonStatus | ""): void => {
  console.log(val, "---val---");
  mode.value = val;
};

const handleTypeChange = async (value: string): Promise<void> => {
  selectedValue.value = value;
  await setRecordTranslationLaguage({
    MessageSource: "window1",
    Data: { sourceLanguage: "en-US", targetLanguage: value },
  });
  getTranslationLaguage();
};

onMounted(() => {
  getSummaryText();
  bindRecordBus();
  startRecordingTime();
});

onUnmounted(() => {
  stopRecordingTime();
  recordBus.close();
});
</script>

<style scoped lang="less">
.home-chat-container {
  width: 93%;
  margin: 15px auto;
  padding: 15px 0px;
  box-sizing: border-box;
  //height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-on-primary);
  border-radius: 24px;
}

@media (max-width: 1024px) {
.home-chat-container {
  width: 260px;
 }
}
.pay-attention-btns {
  height: 32px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
