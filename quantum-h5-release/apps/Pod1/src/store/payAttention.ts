import { computed, reactive } from "vue";
import { useObjStorage, useBroadcastChannel, EventBus } from "@quantum/use";
import { setRecordMethod, CrossTabCommunicator, ChannelMessageType } from "@libs/service";

export enum RecordingButtonStatus {
  Default = "default", // 按钮默认态
  ShowDisclaimer = "showDisclaimer", // 显示免责声明态
  Recording = "recording", // 录音中态
  Stop = "stop", // 停止录音态
}

export enum RecordingDisplayStatus {
  Default = "default", // 展示默认态
  RecordingInProgress = "recordingInProgress", // 展示录音中
  Summarizing = "summarizing", // 展示总结中
  SummaryCompleted = "summaryCompleted", // 展示已总结
}

export enum DisplayMode {
  Summary = "Summary",
  Transcript = "Translation",
  AudioRecording = "Audio Recording",
}

export const VALID_DISPLAY_MODES = [
  DisplayMode.Summary,
  DisplayMode.Transcript,
  DisplayMode.AudioRecording,
];

export interface PayAttData {
    version?: string;
    summary: string;
    transcription: string;
    messages: Array<PayAttMessage>,
    audioUri: string;
    title?: string;
}

export interface PayAttMessage {
    role: string;
    speakerId: string;
    startTime: number;
    duration: number;
    isFinal: boolean;
    message: string;
    detectedLanguage: string;
}
interface PayAttentionStore {
  recordingButtonStatus: RecordingButtonStatus;
  recordingDisplayStatus: RecordingDisplayStatus;
  sourceLanguage: string; // 源语言
  targetLanguage: string; // 目标语言
  displayMode: string; // 展示内容模块（空字符串表示默认/录音中）
  showMeetingDialog: boolean; // 显示会议对话框
  payAttData: PayAttData;
  showSummarizingTip: boolean; // 显示总结中提示
  shouldStopMockMode: boolean; // 临时加的，后面会去掉
}

const scoped = `payAttention_store`;
const BROADCAST_CHANNEL_NAME = 'payAttention_store';
const broadcastChannel = useBroadcastChannel(BROADCAST_CHANNEL_NAME);
const recordBus = new CrossTabCommunicator(ChannelMessageType.RECORD);

let disclaimerTimerId: ReturnType<typeof setTimeout> | null = null;
const DISCLAIMER_DELAY = 5000; // 5秒延迟

// payAttData 默认值
export const DEFAULT_PAY_ATT_DATA: PayAttData = {
  version: "0.1.0",
  summary: "",
  transcription: "",
  messages: [],
  audioUri: "",
  title: "",
};

// Store 默认值
export const DEFAULT_STORE_VALUES: PayAttentionStore = {
  recordingButtonStatus: RecordingButtonStatus.Default,
  recordingDisplayStatus: RecordingDisplayStatus.Default,
  sourceLanguage: "auto", // 默认源语言
  targetLanguage: "en-US", // 默认目标语言
  displayMode: "", // 默认展示模式（空字符串表示默认/录音中）
  showMeetingDialog: false,
  payAttData: DEFAULT_PAY_ATT_DATA,
  showSummarizingTip: false, // 默认不显示总结中提示
  shouldStopMockMode: false,
};

export const payAttentionStore = reactive<PayAttentionStore>({ ...DEFAULT_STORE_VALUES });

// 录音按钮激活/录制中
export const isRecordButtonActive = computed(() => {
  const status = payAttentionStore.recordingButtonStatus;
  return (
    status === RecordingButtonStatus.ShowDisclaimer ||
    status === RecordingButtonStatus.Recording
  );
});

// 显示免责声明
export const isShowDisclaimer = computed(() => {
  return payAttentionStore.recordingButtonStatus === RecordingButtonStatus.ShowDisclaimer;
});

export const isSummarizing = computed(() => {
  return payAttentionStore.recordingDisplayStatus === RecordingDisplayStatus.Summarizing;
});

// 总结完成
export const isSummaryCompleted = computed(() => {
  return payAttentionStore.recordingDisplayStatus === RecordingDisplayStatus.SummaryCompleted;
});

// 录制内容为空
export const isRecordContentEmpty = computed(() => {
  return !payAttentionStore.payAttData.transcription && isSummaryCompleted;
});

// 总结内容为空
export const isSummaryContentEmpty = computed(() => {
  return !payAttentionStore.payAttData.summary && isSummaryCompleted;
});

export const setPayAttentionStore = async <K extends keyof PayAttentionStore>(
  key: K,
  value: PayAttentionStore[K]
) => {
  payAttentionStore[key] = value;
  const storage = useObjStorage(scoped);
  await storage.set(key, value);

  // 通知其他窗口状态已更新
  broadcastChannel.emit2('payAttention:update', {
    key: key as keyof PayAttentionStore,
    value: value
  });
};

// 监听来自其他窗口的状态更新
broadcastChannel.on('payAttention:update', (data: { key: keyof PayAttentionStore; value: any }) => {
  if (data?.key && data.value !== undefined && data.key in payAttentionStore) {
    (payAttentionStore as Record<string, any>)[data.key] = data.value;
  }
});

export const startDisclaimerTimer = () => {
  if (disclaimerTimerId) {
    clearTimeout(disclaimerTimerId);
    disclaimerTimerId = null;
  }

  disclaimerTimerId = setTimeout(() => {
      if (isShowDisclaimer.value) {
        setPayAttentionStore('recordingButtonStatus', RecordingButtonStatus.Recording);
      }
      disclaimerTimerId = null;
    }, DISCLAIMER_DELAY);
};

export const clearDisclaimerTimer = () => {
  if (disclaimerTimerId) {
    clearTimeout(disclaimerTimerId);
    disclaimerTimerId = null;
  }
};

// 开始录音（包含状态设置和接口调用）
export const startRecording = async () => {
  await setPayAttentionStore('shouldStopMockMode', false);
  await setPayAttentionStore("showSummarizingTip", false);
  await setPayAttentionStore("recordingDisplayStatus", RecordingDisplayStatus.Default);
  await setPayAttentionStore("recordingButtonStatus", RecordingButtonStatus.ShowDisclaimer);
  await setPayAttentionStore("payAttData", DEFAULT_PAY_ATT_DATA);
  startDisclaimerTimer();

  const res = await setRecordMethod(
    { MessageSource: "window1", Data: { methodName: "StartRecord" } },
    "method"
  );
  console.log("StartRecord success", res);
  recordBus.send("record:state", { active: true });
  return res;
};

// 结束录音（包含状态设置和接口调用）
export const stopRecording = async () => {
  clearDisclaimerTimer();
  await setPayAttentionStore("recordingButtonStatus", RecordingButtonStatus.Stop);
  await setPayAttentionStore("recordingDisplayStatus", RecordingDisplayStatus.Summarizing);

  const res = await setRecordMethod(
    { MessageSource: "window1", Data: { methodName: "StopRecord" } },
    "method"
  );
  console.log("StopRecord success", res);
  recordBus.send("record:state", { active: false });
  return res;
};

EventBus.once('SetupApp', async (isFirstStart: boolean) => {
  try {
    const storage = useObjStorage(scoped);

    if (isFirstStart) {
      // 首次启动：批量设置默认值到存储
      await storage.reset(DEFAULT_STORE_VALUES);
    } else {
      // 非首次启动：从存储恢复数据
      const keys = Object.keys(DEFAULT_STORE_VALUES) as Array<keyof PayAttentionStore>;

      for (const key of keys) {
        const storedValue = await storage.get(key);
        const defaultValue = DEFAULT_STORE_VALUES[key];
        (payAttentionStore as Record<string, any>)[key] = storedValue ?? defaultValue;
      }
    }
  } catch (error) {
    console.error(`Failed to ${isFirstStart ? 'initialize' : 'sync'} payAttentionStore:`, error);
  }
});
