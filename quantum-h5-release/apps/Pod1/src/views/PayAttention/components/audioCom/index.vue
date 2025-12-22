<template>
  <div class="pod-cast-audio rounded-16" v-automation="'pod_cast_audio'">
    <!-- 控制区：快进 / 播放暂停 / 后退 -->
    <div class="pod-cast-audio_control">
      <div
        class="inline-flex items-center justify-center"
        @click="toStart"
        @keydown="handleRewindKeyDown"
        tabindex="0"
        role="button"
        :aria-label="t('payAttention.audioRewind')"
        v-tooltip.bottom="{ value: t('payAttention.audioRewind'), showDelay: 100, hideDelay: 300 }"
        v-automation="'audio_start_btn'"
      >
        <IconRecordFastForward />
      </div>
      <div
        v-if="!isPlaying"
        class="inline-flex items-center justify-center"
        @click="togglePlay"
        @keydown="handlePlayKeyDown"
        tabindex="0"
        role="button"
        :aria-label="t('payAttention.audioPlay')"
        v-tooltip.bottom="{ value: t('payAttention.audioPlay'), showDelay: 100, hideDelay: 300 }"
        v-automation="'audio_play_btn'"
      >
        <IconPlay />
      </div>
      <div
        v-else
        class="inline-flex items-center justify-center"
        @click="togglePlay"
        @keydown="handlePauseKeyDown"
        tabindex="0"
        role="button"
        :aria-label="t('payAttention.audioPause')"
        v-tooltip.bottom="{ value: t('payAttention.audioPause'), showDelay: 100, hideDelay: 300 }"
        v-automation="'audio_pause_btn'"
      >
        <IconPause2 />
      </div>
      <div
        class="inline-flex items-center justify-center"
        @click="toEnd"
        @keydown="handleFastForwardKeyDown"
        tabindex="0"
        role="button"
        :aria-label="t('payAttention.audioFastForward')"
        v-tooltip.bottom="{ value: t('payAttention.audioFastForward'), showDelay: 100, hideDelay: 300 }"
        v-automation="'audio_end_btn'"
      >
        <IconRecordRewind />
      </div>
    </div>

    <!-- 进度条 + 时间 + 倍速 -->
    <div class="bar">
      <span class="time tabular-nums">{{ curLabel }}</span>
      <div class="progress" @click="seek($event)">
        <div class="inner" :style="{ width: progress + '%' }" />
      </div>
      <span class="time tabular-nums">{{ durLabel }}</span>
      <span class="rate" @click="setRateValue">{{ rate }}X</span>
    </div>

    <!-- 隐藏的音频标签 -->
    <audio
      ref="audioEl"
      :src="getFileName"
      preload="auto"
      :playbackRate="rate"
      @timeupdate="update"
      @ended="isPlaying = false"
      @loadedmetadata="onLoadedMeta"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { IconPlay, IconPause2, IconRecordFastForward, IconRecordRewind } from "@quantum/icons";
import { payAttentionStore } from "@/store/payAttention";
import { useLocale } from "@/hooks/i18n";

const { t } = useLocale();

const audioEl = ref<HTMLAudioElement>();
const isPlaying = ref(false);
const curTime = ref(0);
const rate = ref(1);
const totalDuration = ref(0);

const emit = defineEmits<{ (e: 'timeupdate', sec: number): void }>();

// 进度
const update = () => {
  if (audioEl.value) {
    curTime.value = audioEl.value.currentTime;
    emit('timeupdate', curTime.value);
  }
};

// 播放 / 暂停
const togglePlay = async () => {
  if (!audioEl.value) return;
  if (isPlaying.value) {
    isPlaying.value = false;
    audioEl.value.pause();
  } else {
    try {
      await audioEl.value.play();
      isPlaying.value = true;
    } catch (e) {
      isPlaying.value = false;
      console.error(e);
    }
  }
};

// 倍速监听
watch(rate, (r) => {
  if (audioEl.value) audioEl.value.playbackRate = r;
});

const getFileName = computed<string>(() => {
  const path = payAttentionStore.payAttData.audioUri?.trim() ?? "";
  if (!path) return "";
  const parts = path.split(/[/\\]/);
  return "https://local.lenovo.com/client/" + (parts.pop() ?? "");
});

// 快退 / 快进（±5 秒）
const toStart = () => {
  if (audioEl.value && audioEl.value.currentTime > 0)
    audioEl.value.currentTime = Math.max(0, audioEl.value.currentTime - 5);
};
const toEnd = () => {
  if (audioEl.value && isFinite(audioEl.value.duration))
    audioEl.value.currentTime = Math.min(audioEl.value.duration, audioEl.value.currentTime + 5);
};

// 键盘事件处理
const handleRewindKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toStart();
  }
};

const handlePlayKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    togglePlay();
  }
};

const handlePauseKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    togglePlay();
  }
};

const handleFastForwardKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toEnd();
  }
};


// 时间显示
function formatTime(sec: number) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

const curLabel = computed(() => formatTime(curTime.value));
const durLabel = computed(() => formatTime(totalDuration.value));

function onLoadedMeta() {
  if (audioEl.value) {
    const d = audioEl.value.duration;
    totalDuration.value = isFinite(d) ? d : 0; // 直播流可能是 Infinity
  }
}

// 倍速切换（1x → 2x → 3x → 1x）
const setRateValue = () => {
  rate.value = rate.value < 3 ? rate.value + 1 : 1;
};

// 点击进度条跳转
function seek(e: MouseEvent) {
  if (!audioEl.value) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  if (!isFinite(audioEl.value.duration) || audioEl.value.duration <= 0) return;
  audioEl.value.currentTime = Math.max(
    0,
    Math.min(audioEl.value.duration, ratio * audioEl.value.duration)
  );
}
// const safeSrc = computed<string>(() => {
//   const raw = props.audioPath?.trim() ?? '';
//   if (!raw) return '';
//   if (/^https?:\/\//i.test(raw)) return raw;
//   const norm = raw.replace(/\\/g, '/');
//   return 'file:///' + encodeURI(norm);
// });

const progress = computed<number>(() => {
  const d = totalDuration.value;
  if (!d || !isFinite(d)) return 0;
  const pct = (curTime.value / d) * 100;
  return Math.max(0, Math.min(100, pct));
});

watch(() => payAttentionStore.payAttData.audioUri, () => {
  isPlaying.value = false;
  curTime.value = 0;
  totalDuration.value = 0;
  audioEl.value?.pause();
}, { immediate: true });

const seekTo = (sec: number): void => {
  if (!audioEl.value) return;
  if (!isFinite(audioEl.value.duration)) return;
  const t = Math.max(0, Math.min(audioEl.value.duration, sec));
  audioEl.value.currentTime = t;
};

const playAt = async (sec: number): Promise<void> => {
  seekTo(sec);
  if (!audioEl.value) return;
  try {
    await audioEl.value.play();
    isPlaying.value = true;
  } catch {
    isPlaying.value = false;
  }
};

defineExpose<{ playAt: (sec: number) => Promise<void>; seekTo: (sec: number) => void }>({
  playAt,
  seekTo,
});
</script>

<style scoped lang="less">
.pod-cast-audio {
  --h: 57px;
  --pad-v: 6px;
  --gap: 10px;
  --iconWidth: 24px;
  --font: var(--text-body-m);
  --bar-h: 6px;

  width: 79%;
  height: var(--h);
  max-height: 57px;
  background: var(--color-primary);
  display: grid;
  grid-template-rows: 1fr 1fr;
  align-items: center;

  &_control {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap);
    margin: var(--pad-v) 8px 8px;
    height: 20px;
    > div {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin: 0 calc(var(--gap) * 1.6);
      svg {
        width: var(--iconWidth);
        height: var(--iconWidth);
        color: var(--color-on-primary);
      }
    }
  }

  .bar {
    display: flex;
    align-items: center;
    gap: var(--gap);
    padding: 0 12px var(--pad-v);
    color: var(--color-on-primary);
    font-size: var(--font);
    line-height: 1;

    .time {
      width: 44px;
      text-align: center;
      font-variant-numeric: tabular-nums;
      font-family: Microsoft YaHei UI;
      opacity: 0.95;
    }

    .progress {
      flex: 1;
      height: var(--bar-h);
      background: #FFFFFF80; // to do，找设计确认颜色
      border-radius: 999px;
      cursor: pointer;
      position: relative;
      overflow: hidden;

      .inner {
        height: 100%;
        background: var(--color-surface);
        border-radius: 999px;
        transform: translateZ(0);
      }
    }

    .rate {
      cursor: pointer;
      user-select: none;
      padding: 2px 6px;
      border-radius: 6px;
      // background: rgba(255, 255, 255, 0.15);
      transition: transform 0.12s ease, background 0.2s ease;
      font-family: Microsoft YaHei UI;
      &:active {
        transform: scale(0.96);
      }
      // &:hover {
      //   background: rgba(255, 255, 255, 0.22);
      // }
    }
  }
}
</style>
