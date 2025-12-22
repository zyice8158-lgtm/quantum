<template>
  <div class="azureSpeechWrap">
    <div class="azureSpeech">
      <div class="azureSpeech_info">
        <div class="segments-list" ref="transcriptRef">
          <div v-for="(segment, index) in clusteredSegments" :key="index" class="segment">
            <div class="segment-header">
              <div class="speaker-badge">
                <SvgIcon class="speakers1_icon" :name="`speakers${segment.speakerId}`" />
                <span class="text-[14px] font-[700] text-[rgba(22, 28, 39, 1)]">Pessoa</span>
              </div>
            </div>
            <div class="segment-content text-[14px] font-[400] text-black mt-[8px] mb-[8px]">
              {{ segment.text }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="pay-attention-home_wrap_bottom">
      <div class="pay-attention-home_wrap_bottom_left"></div>
      <div class="pay-attention-home_wrap_bottom_right">
        <SvgIcon class="mr-[16px]" name="copy" color="rgba(141, 129, 253, 1)" round />
        <SvgIcon name="share" color="rgba(141, 129, 253, 1)" round />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { SvgIcon } from "../../Icons";
import Answer from "../../ChatBaseComponent/types/Answer";

interface DisplaySegment {
  text: string;
  speakerId: number;
}

const props = defineProps<{
  answerItem: Answer | undefined;
}>();

const transcriptRef = ref<HTMLDivElement | null>(null);

function speakerNum(id: string): number {
  const m = id.match(/\d+/);
  const n = m ? Number(m[0]) : 1;
  return Number.isFinite(n) && n > 0 ? n : 1;
}

const clusteredSegments = computed<DisplaySegment[]>(() =>
    (props.answerItem.answerData.transcription ?? []).map((s) => ({
    text: s.msg,
    speakerId: speakerNum(s.speakerId),
  }))
);
</script>

<style src="./style.less" lang="less" scoped></style>
