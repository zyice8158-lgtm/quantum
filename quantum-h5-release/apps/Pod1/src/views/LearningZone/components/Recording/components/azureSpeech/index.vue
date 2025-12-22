<template>
  <div class="azureSpeechWrap" v-if="status !== SelectButtonStatus.Summary">
    <div class="azureSpeech">
      <div class="azureSpeech_info">
        <div class="segments-list" ref="transcriptRef" @scroll="handleScroll">
          <div
            v-for="(segment, index) in clusteredSegments"
            :key="index"
            class="segment"
            :class="{ 'segment--active': isActive(index) && status === SelectButtonStatus.AudioRecording }"
          >
            <div class="segment-header">
              <div class="speaker-badge" v-if="status">
                <SvgIcon class="speakers1_icon" :name="`speakers${segment.speakerId}`" />
                <span class="text-[14px] font-[700] text-[rgba(22, 28, 39, 1)]">Pessoa</span>
              </div>
              <div
                class="timestamp flex items-center"
                v-if="status === SelectButtonStatus.AudioRecording"
              >
                <span
                  class="timestamp_time text-[14px] font-[400] text-[rgba(10, 10, 10, 1)] mr-[12px]"
                  >{{ formatTime(segment.startSec) }}</span
                >
                <QIcons name="shape" size="11" @click="handlePlay(segment.startSec, index)" />
              </div>
            </div>
            <div class="segment-content text-[14px] font-[400] text-black mt-[8px] mb-[8px]">
              <template v-if="segment.words?.length">
                <span
                  v-for="(w, wi) in segment.words"
                  :key="wi"
                  class="word"
                  :class="{ 'word--active': isWordActive(w) }"
                  @click="emit('seek', w.startSec)"
                  >{{ w.t }}</span
                >
              </template>
              <template v-else>
                {{ segment.text }}
              </template>
            </div>
          </div>
          <div v-if="interimTranscript" class="interim-segment">
            [recognizing... {{ interimTranscript }}]
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 摘要内容区域 - 精简滚动逻辑 -->
  <div
    class="summary-content"
    ref="summaryContainer"
  ></div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted, nextTick, watch, defineEmits } from "vue";
import SvgIcon from "@/components/SvgIcon";
import { setSummaryAction, WebviewMessager } from "@libs/service";
import { TranslationResult, SelectButtonStatus, extractContent } from "../../home/index.ts";
import { QIcons } from "@libs/p-comps";

interface TranscriptionWord {
  t: string; // 词文本
  startSec: number; // 开始时间（秒）
  endSec: number; // 结束时间（秒）
}

interface TranscriptionSegment {
  text: string;
  startSec: number;  // 段开始（秒）
  endSec: number;    // 段结束（秒）——可由 Duration 或下一段推导
  speaker?: string;
  words?: TranscriptionWord[];
}
interface ClusteredSegment extends TranscriptionSegment {
  speakerId: number;
  clusterId: number;
}
const props = defineProps<{
  summaryText: string;
  status: string;
  playheadSec?: number; // 当前音频播放秒
}>();
const emit = defineEmits<{
  (e: "clear-summary"): void;
  (e: "seek", sec: number): void; // 传递播放时间用作跳转指定位置
}>();

// 核心ref
const summaryContainer = ref<HTMLDivElement | null>(null);
const summarizeMockBtn = ref(false);
const suggestionsMockVal = ref(false);
const summaryMockVal = ref(false);
const autoScroll = ref(true);
const interimTranscript = ref("");
const rawSegments = ref<TranscriptionSegment[]>([]);
const silenceThreshold = ref(1.5);
const recordTime = ref(0);
const transcriptRef = ref<HTMLDivElement | null>(null);

// 计算属性
const clusteredSegments = computed<ClusteredSegment[]>(() =>
  clusterSegments(rawSegments.value, silenceThreshold.value)
);

// 辅助方法（保持不变）
const isWordActive = (w: TranscriptionWord): boolean => {
  const t = Math.max(0, props.playheadSec ?? 0);
  return t >= (w.startSec - EPS) && t < (w.endSec - EPS);
};
function getStartSec(seg: TranscriptionSegment): number {
  if (typeof seg.startSec === "number" && Number.isFinite(seg.startSec)) return seg.startSec;
  const n = Number(seg.duration);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
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
function isActive(i: number): boolean {
  return i === activeIndex.value;
}
const formatTime = (sec: number) => {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};
const handlePlay = (startSec: number, _index: number) => {
  if (Number.isFinite(startSec) && startSec >= 0) emit("seek", startSec);
};
const tickToSec = (v?: number | string): number => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n / 10_000_000 : 0;
};
const onTranscription = (evt: {
  Data?: { speakerStartTime: number; isFinal?: boolean; role?: string; msg?: string; Duration?: string; };
}) => {
  const d = evt.Data;
  if (!d) return;
  if (!d.isFinal) {
    interimTranscript.value = d.msg ?? "";
    scrollToBottom();
    return;
  }
  interimTranscript.value = "";
  const startSec = tickToSec(d.speakerStartTime);
  const durSec = tickToSec(d.Duration);
  const endSec = durSec > 0 ? startSec + durSec : startSec;
  rawSegments.value.push({
    text: d.msg ?? "",
    startSec,
    endSec,
    speaker: (d.role ?? "").replace("Speaker", ""),
  });
  scrollToBottom();
};
function normalizeEnds(list: TranscriptionSegment[]): void {
  list.sort((a, b) => a.startSec - b.startSec);
  for (let i = 0; i < list.length; i++) {
    const cur = list[i];
    const next = list[i + 1];
    if (!(cur.endSec > cur.startSec)) {
      cur.endSec = next ? next.startSec : cur.startSec + 3;
    } else if (next && cur.endSec > next.startSec) {
      cur.endSec = Math.max(cur.startSec, next.startSec);
    }
  }
}
function tokenize(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (/\s/.test(trimmed)) {
    return trimmed.split(/\s+/).filter(Boolean);
  }
  return Array.from(trimmed);
}
function injectPseudoWordTimes(list: TranscriptionSegment[]): void {
  for (const seg of list) {
    if (seg.words?.length) continue;
    const tokens = tokenize(seg.text);
    if (!tokens.length) continue;
    const span = Math.max(0.3, seg.endSec - seg.startSec);
    const slot = span / tokens.length;
    seg.words = tokens.map((t, i) => {
      const s = seg.startSec + i * slot;
      return { t, startSec: s, endSec: s + slot * 0.98 };
    });
  }
}
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
  injectPseudoWordTimes(segments);
  let currentSpeaker = 1;
  const clustered: ClusteredSegment[] = [];
  let last: ClusteredSegment | null = null;
  for (const seg of segments) {
    const item: ClusteredSegment = {
      ...seg,
      speakerId: last
        ? ((seg.speaker !== last.speaker || seg.startSec - last.startSec > threshold)
            ? (currentSpeaker = currentSpeaker === 1 ? 2 : currentSpeaker === 2 ? 3 : 1)
            : currentSpeaker)
        : currentSpeaker,
      clusterId: currentSpeaker,
    };
    clustered.push(item);
    last = item;
  }
  return clustered;
}
function scrollToBottom(): void {
  if (!autoScroll.value || !transcriptRef.value) return;
  nextTick(() => {
    if (transcriptRef.value) {
      transcriptRef.value.scrollTop = transcriptRef.value.scrollHeight;
    }
  });
}

// 🔥 核心滚动逻辑（精简版，确保滚动且显示最后一行）
function scrollSummaryToBottom() {
  const container = summaryContainer.value;
  if (!container) return;

  // 1. 强制锁定容器高度和滚动样式（避免被覆盖）
  container.style.height = "106px";
  container.style.overflowY = "auto";
  container.style.boxSizing = "border-box";

  // 2. 强制刷新布局（必须！确保scrollHeight是最新的）
  container.offsetHeight;

  console.log("滚动触发：", {
    scrollHeight: container.scrollHeight,
    clientHeight: container.clientHeight
  });

  // 3. 直接滚动到底部（最直接的API，无冗余）
  container.scrollTop = container.scrollHeight;

  // 4. 50ms后再触发一次（防止浏览器渲染延迟）
  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 50);
}

// 🔥 简化内容更新（只加必要的底部补偿）
function updateSummaryContent() {
  const container = summaryContainer.value;
  if (!container || !props.summaryText) return;

  // 内容+底部10px补偿（确保最后一行不被截断）
  const content = extractContent(props.summaryText);
  container.innerHTML = `
    <div style="font-size: 16px; font-weight: 400; color: rgba(22, 28, 39, 1); line-height: 1.5; word-break: break-all;">
      ${content}
      <div style="height: 10px;"></div> <!-- 底部小补偿，不冗余 -->
    </div>
  `;

  // 内容更新后立即滚动（nextTick确保DOM已渲染）
  nextTick(() => {
    scrollSummaryToBottom();
  });
}

// 其他方法保持不变
function handleScroll(): void {
  if (!transcriptRef.value) return;
  const c = transcriptRef.value;
  autoScroll.value = c.scrollHeight - c.scrollTop - c.clientHeight <= 50;
}
function resetAll(): void {
  interimTranscript.value = "";
  rawSegments.value = [];
  summarizeMockBtn.value = false;
  suggestionsMockVal.value = false;
  summaryMockVal.value = false;
  if (summaryContainer.value) {
    summaryContainer.value.innerHTML = "";
  }
}

// 监听状态切换（延迟缩短到500ms，避免过久等待）
watch(
  () => props.status,
  (newVal) => {
    if (newVal === SelectButtonStatus.Summary) {
      stopToggleMockMode();
      setTimeout(() => {
        updateSummaryContent();
      }, 500);
    }
  }
);

// 监听摘要文本变化
watch(
  () => props.summaryText,
  () => {
    updateSummaryContent();
  },
  { immediate: true }
);

// 组件挂载初始化
onMounted(() => {
  if (summaryContainer.value) {
    //summaryContainer.value.style.height = "106px";
    summaryContainer.value.style.overflowY = "auto";
  }
  updateSummaryContent();
});

// 稳定高亮参数
const EPS = 0.08;
const DELTA_S = 0.15;
const STICKY_MS = 250;
const activeIdx = ref<number>(-1);
let lastSwitchAt = 0;

function pickIndexByTime(t: number, list: ClusteredSegment[]): number {
  if (!list.length) return -1;
  for (let i = 0; i < list.length; i++) {
    const start = Math.max(0, list[i].startSec - EPS);
    const end = Math.max(start, (list[i].endSec ?? start) + EPS);
    if (t >= start && t < end) return i;
  }
  return list.length - 1;
}

watch(
  () => props.playheadSec,
  (tRaw) => {
    const t = Math.max(0, Number(tRaw ?? 0));
    const list = clusteredSegments.value;
    if (!list.length) {
      activeIdx.value = -1;
      return;
    }
    const candidate = pickIndexByTime(t, list);
    if (activeIdx.value < 0) {
      activeIdx.value = candidate;
      lastSwitchAt = Date.now();
      return;
    }
    const now = Date.now();
    if (now - lastSwitchAt < STICKY_MS) return;
    const cur = list[activeIdx.value];
    const curEnd = Math.max(cur.startSec, (cur.endSec ?? cur.startSec)) + DELTA_S;
    if (t > curEnd || candidate !== activeIdx.value) {
      activeIdx.value = candidate;
      lastSwitchAt = now;
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
});

defineExpose({
  stopToggleMockMode,
  resetAll,
  getTranscriptText,
});

function getTranscriptText(): string {
  return clusteredSegments.value.map((s) => s.text).join("\n");
}
</script>

<style src="./style.less" lang="less" scoped>
.summary-content {
  max-height: 106px !important;
  overflow-y: auto !important;
  box-sizing: border-box !important;
  padding: 8px !important;
  margin: 0 !important;
  overflow-anchor: none !important;

  /* 确保滚动条正常显示 */
  &::-webkit-scrollbar {
    width: 6px !important;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ddd !important;
    border-radius: 3px !important;
  }

  /* 防止子元素干扰 */
  * {
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style>