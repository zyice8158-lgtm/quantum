<template>
  <div class="azureSpeech" v-if="clusteredSegments?.length > 0">
    <div
      class="segments-list select-none"
      :class="{ 'is-scrolling': !isRecording }"
      ref="transcriptRef"
      @scroll="handleScroll"
    >
      <div
        v-if="clusteredSegments?.length > 0"
        v-for="(segment, index) in clusteredSegments"
        :key="index"
        class="segment"
        :class="{ 'segment--active': isActive(index) && status === SelectButtonStatus.AudioRecording }"
        @click="emit('seek', segment.startSec)"
      >
        <div class="segment-content text-title-xs leading-body-l">
          <template v-if="segment.words?.length">
            <span
              v-for="(w, wi) in segment.words"
              :key="wi"
              class="word"
              :class="{
                // 'word--active': isWordActive(w),
                'word--english': isEnglishWord(w.t)
              }"
              >{{ w.t }}</span
            >
          </template>
          <template v-else>
            {{ segment.text }}
          </template>
        </div>
      </div>
      <div v-if="showInterimTranscript" class="interim-segment">
        {{ interimTranscript }}
      </div>
    </div>
  </div>

  <div class="empty-content" v-if="showEmptyContent">{{ t('payAttention.noAudioAvailable') }}</div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted, nextTick, watch, inject, type Ref } from "vue";
import { setSummaryAction, WebviewMessager, CrossTabCommunicator, ChannelMessageType } from "@libs/service";
import { SelectButtonStatus } from "../../home/index";
import { RecordingDisplayStatus, payAttentionStore, isSummaryCompleted } from "@/store/payAttention";
import { useLocale } from "@/hooks/i18n";
import { normalizeEnds, isEnglishWord, tickToSec, pickIndexByTime, TranscriptionSegment, ClusteredSegment, convertRecordResultToSegments, injectPseudoWordTimes } from "./utils";

const props = defineProps<{
  status: string;
  playheadSec?: number; // 当前音频播放秒
  isRecording?: boolean; // 是否录音中
  homeBoxRef?: HTMLDivElement | null; // 父容器的 ref（录音中时的滚动容器）
  needStepBar?: boolean; // 是否需要步骤条
}>();

const emit = defineEmits<{
  (e: "seek", sec: number): void; // 传递播放时间用作跳转指定位置
}>();

const summarizeMockBtn = ref(false);
const suggestionsMockVal = ref(false);
const summaryMockVal = ref(false);
const autoScroll = ref(true); // 控制是否自动滚动到底部
const interimTranscript = ref("");
const rawSegments = ref<TranscriptionSegment[]>([]);
const silenceThreshold = ref(1.5);
const recordTime = ref(0);
const transcriptRef = ref<HTMLDivElement | null>(null);

// 用于发送消息关闭 bar 上的录音
const recordBus = new CrossTabCommunicator(ChannelMessageType.RECORD);

const { t } = useLocale();

const showEmptyContent = computed(() => {
  return clusteredSegments.value?.length === 0 && isSummaryCompleted.value;
});

// 停止录音
const stopRecording = async () => {
  try {
    recordBus.send("record:close", { active: false });
    recordBus.send("record:state", { active: false });
  } catch (err) {
    console.error("Stop recording error:", err);
  }
};

const clusteredSegments = computed<ClusteredSegment[]>(() => {
  if (isSummaryCompleted.value) {
    const payAttData = payAttentionStore.payAttData;
    if (Array.isArray(payAttData?.messages) && payAttData.messages.length > 0) {
      const segmentsFromSummary = convertRecordResultToSegments(payAttData.messages);
      return clusterSegments(segmentsFromSummary, silenceThreshold.value);
    }
  }

  return clusterSegments(rawSegments.value, silenceThreshold.value);
});

const showInterimTranscript = computed(() => {
  return interimTranscript.value && ![SelectButtonStatus.AudioRecording,SelectButtonStatus.Transcript].includes(props.status as SelectButtonStatus);
});

/**
 * 获取分段开始秒数
 * @param seg
 */
// function getStartSec(seg: TranscriptionSegment): number {
//   if (typeof seg.startSec === "number" && Number.isFinite(seg.startSec)) return seg.startSec;
//   const n = Number(seg.duration);
//   return Number.isFinite(n) && n >= 0 ? n : 0;
// }

/**
 * 获取当前激活分段索引
 */
const activeIndex = computed<number>(() => {
  const list = clusteredSegments.value;
  if (!list.length) return -1;
  const t = Math.max(0, props.playheadSec ?? 0);
  for (let i = 0; i < list.length; i++) {
    const cur = list[i].startSec;
    const next = i + 1 < list.length ? list[i + 1].startSec : Number.POSITIVE_INFINITY;
    if (t >= cur && t < next) return i;
  }
  return -1;
});

/**
 * 判断是否激活
 * @param i
 * @returns
 */
function isActive(i: number): boolean {
  return i === activeIndex.value;
}

const onTranscription = (evt: {
  Data?: {
    speakerStartTime?: number;
    isFinal?: boolean;
    role?: string;
    msg?: string;
    Duration?: string;
  };
}) => {
  const d = evt.Data;
  if (!d) return;

  const msgText = d.msg?.trim() ?? "";
  if (!msgText) {
    return;
  }
  if (!d.isFinal) {
    interimTranscript.value = msgText;
    // 确保临时内容更新时触发滚动
    scrollToBottom(true);
    return;
  }
  interimTranscript.value = "";

  const startSec = tickToSec(d.speakerStartTime);
  const durSec   = tickToSec(d.Duration);
  const endSec   = durSec > 0 ? startSec + durSec : startSec;
  rawSegments.value.push({
    text: msgText,
    startSec,
    endSec,
    speaker: (d.role ?? "").replace("Speaker", ""),
  });

  // 新增内容后强制触发滚动，确保消息一定能滚动到底部
  scrollToBottom(true);
};



const stopToggleMockMode = async (): Promise<void> => {
  try {
    summaryMockVal.value = !summaryMockVal.value;
    const result = clusterSegments(rawSegments.value, silenceThreshold.value);
    const summaryRes = await setSummaryAction({
      MessageSource: "window1",
      Data: { text: result.map((item) => item.text).join("") },
    });
    if (summaryRes.data.Data.IsSuccess) {
      summaryMockVal.value = !summaryMockVal.value;
      suggestionsMockVal.value = !suggestionsMockVal.value;
      summarizeMockBtn.value = !summarizeMockBtn.value;
    } else {
      summaryMockVal.value = !summaryMockVal.value;
      suggestionsMockVal.value = !suggestionsMockVal.value;
    }
  } catch (err) {
    console.log(err, "---err stop mock Record---");
  }
};

function clusterSegments(segments: TranscriptionSegment[], threshold: number): ClusteredSegment[] {
  if (!segments.length) return [];

  normalizeEnds(segments);

  let currentSpeaker = 1;
  const clustered: ClusteredSegment[] = [];
  let last: ClusteredSegment | null = null;

  for (const seg of segments) {
    const item: ClusteredSegment = {
      ...seg,
      speakerId: last
        ? ( (seg.speaker !== last.speaker || seg.startSec - last.startSec > threshold)
            ? (currentSpeaker = currentSpeaker === 1 ? 2 : currentSpeaker === 2 ? 3 : 1)
            : currentSpeaker )
        : currentSpeaker,
      clusterId: currentSpeaker,
    };
    if (item.text) {
      clustered.push(item);
      last = item;
    }
  }
  return clustered;
}

// 自动滚动到最新内容或当前激活段
// 新增force参数，确保接收消息时强制滚动到底部
function scrollToBottom(force: boolean = false): void {
  // 根据 isRecording 状态选择滚动容器
  const scrollContainer = props.isRecording ? props.homeBoxRef : transcriptRef.value;
  if (!scrollContainer) return;

  nextTick(() => {
    if (scrollContainer) {
      // 检查是否启用自动滚动或强制滚动
      if (autoScroll.value || force) {
        // 强制滚动到底部（使用 scrollIntoView 更可靠）
        const lastChild = scrollContainer.lastElementChild;
        if (lastChild) {
          lastChild.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
        // 双重保障：同时设置 scrollTop
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      } else {
        // 处理激活段可见性逻辑（仅在非录音状态）
        if (!props.isRecording) {
          const activeIdx = activeIndex.value;
          if (activeIdx >= 0) {
            const segmentElements = transcriptRef.value?.querySelectorAll('.segment');
            const activeElement = segmentElements?.[activeIdx] as HTMLElement;
            if (activeElement) {
              const container = transcriptRef.value;
              if (container) {
                const containerRect = container.getBoundingClientRect();
                const elementRect = activeElement.getBoundingClientRect();

                if (elementRect.bottom > containerRect.bottom || elementRect.top < containerRect.top) {
                  activeElement.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                }
              }
            }
          }
        }
      }
    }
  });
}

function handleScroll(): void {
  // 根据 isRecording 状态选择滚动容器
  const scrollContainer = props.isRecording ? props.homeBoxRef : transcriptRef.value;
  if (!scrollContainer) return;
  const c = scrollContainer;
  // 计算滚动位置，判断是否在底部区域
  const scrollBottom = c.scrollHeight - c.scrollTop - c.clientHeight;
  // 降低阈值到2px，更精准判断是否在底部
  autoScroll.value = scrollBottom <= 2;
}

function resetAll(): void {
  interimTranscript.value = "";
  rawSegments.value = [];
  summarizeMockBtn.value = false;
  suggestionsMockVal.value = false;
  summaryMockVal.value = false;
}

// 监听激活段变化，确保激活段可见
watch(activeIndex, (newIndex) => {
  if (newIndex >= 0) {
    scrollToBottom();
  }
});

const getTranscriptText = (): string => {
  return clusteredSegments.value.map((s) => s.text).join("\n");
};

// 新增：稳定高亮参数
const DELTA_S = 0.15;      // 离开段的额外缓冲秒，避免临界点抖动
const STICKY_MS = 250;     // 段切换最小冷却时间

// 当前激活段索引与上次切换时间戳
const activeIdx = ref<number>(-1);
let lastSwitchAt = 0;


// 优化：监听分段数据变化时，确保滚动条正确显示
watch(
  () => clusteredSegments.value,
  () => {
    // 延迟确保DOM已更新，让滚动条正确计算高度
    setTimeout(() => {
      if (transcriptRef.value) {
        // 触发重绘以确保滚动条尺寸正确
        transcriptRef.value.style.overflowY = 'hidden';
        transcriptRef.value.offsetHeight; // 触发重绘
        transcriptRef.value.style.overflowY = 'auto';
      }
      scrollToBottom();
    }, 0);
  },
  { deep: true }
);

// 稳定更新 activeIdx
watch(
  () => props.playheadSec,
  (tRaw) => {
    const t = Math.max(0, Number(tRaw ?? 0));
    const list = clusteredSegments.value;
    if (!list.length) {
      activeIdx.value = -1;
      return;
    }

    // 先按时间找“候选段”
    const candidate = pickIndexByTime(t, list);

    // 若当前无激活，直接设置
    if (activeIdx.value < 0) {
      activeIdx.value = candidate;
      lastSwitchAt = Date.now();
      return;
    }

    // 在冷却期内不切换
    const now = Date.now();
    if (now - lastSwitchAt < STICKY_MS) return;

    // 迟滞：只有当 t 超出当前段 endSec + DELTA_S 时，才允许切换
    const cur = list[activeIdx.value];
    const curEnd = Math.max(cur.startSec, (cur.endSec ?? cur.startSec)) + DELTA_S;
    if (t > curEnd || candidate < activeIdx.value || candidate > activeIdx.value) {
      if (candidate !== activeIdx.value) {
        activeIdx.value = candidate;
        lastSwitchAt = now;
      }
    }
  },
  { immediate: true }
);

onMounted(() => {
  WebviewMessager.on("client.h5.transcription", onTranscription);
});

onBeforeUnmount(() => {
  WebviewMessager.off("client.h5.transcription");
  recordBus.close();
});

defineExpose({
  stopToggleMockMode,
  resetAll,
  getTranscriptText,
  stopRecording,
  handleScroll,
});
</script>

<style src="./style.less" lang="less" scoped></style>
