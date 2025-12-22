<template>
  <div class="pay-attention-home">
    <div class="pay-attention-home_wrap">
      <div class="pay-attention-home_wrap_top">
        <div class="pay-attention-home_wrap_top_left">
          <div class="flex items-center">
            <IconQuantumLogo
              class="text-[19px] transition-transform duration-500 ease-in-out mr-[10px]"
            />
            <span>{{ headerText }}</span>
          </div>
          <!-- 仅录制中显示语言选择（值与变更由父组件接管） -->
          <SelectCom
            v-if="isRecording"
            :modelValue="selectedValue"
            @change="$emit('change-lang', $event)"
          />
        </div>
        <div class="pay-attention-home_wrap_top_right"></div>
      </div>

      <div class="pay-attention-home_wrap_content">
        <azureSpeech
          :key="azureKey"
          ref="azureSpeechRef"
          :status="mode"
          :summaryText="summaryText"
          @clear-summary="$emit('clear-summary')"
          @seek="onSeek"
          :playhead-sec="displayPlayhead"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import azureSpeech from "../components/azureSpeech/index.vue";
import { IconQuantumLogo } from "@quantum/icons";
import { QIcons } from "@libs/p-comps";
import SelectCom from "../components/selectCom/index.vue";
import { ref,watch } from "vue";
import { SelectButtonStatus } from "./index";
import { sendExportContent } from "@libs/service";
import { useLocale } from "@/hooks/i18n";

type AzureSpeechExpose = {
  getTranscriptText: () => string;
  resetAll: () => void;
  stopToggleMockMode: () => Promise<void> | void;
};

const props = defineProps<{
  mode: SelectButtonStatus | ""; // 页面模式
  isRecording: boolean; // 是否录制中
  headerText: string; // 头部文案
  summaryText: string; // 摘要文本
  formattedDuration: string; // 计时显示
  selectedValue: string; // 录制中选择的语言
  azureKey: number; // 强制重建 azureSpeech 的 key
}>();

const emit = defineEmits<{
  (e: "change-mode", v: SelectButtonStatus | ""): void;
  (e: "change-lang", v: string): void;
  (e: "clear-summary"): void;
}>();

const { t } = useLocale();
const azureSpeechRef = ref<AzureSpeechExpose | null>(null);
watch(() => props.summaryText, (newVal) => {
  console.log(newVal,'----summaryText newVal');
});

const displayPlayhead = ref(0); // 用于传给 azureSpeech 的“慢时钟”
let lastUpdate = performance.now();

const CFG = { alpha: 0.25, maxSlew: 2.0 }; // alpha 越小越慢；maxSlew 每秒最大跟随秒数


// seek 时立刻同步，避免错位
const onSeek = (sec: number): void => {
  displayPlayhead.value = sec;
};
</script>

<style scoped lang="less">
.pay-attention-home {
  width: 100%;
  margin: 0 auto;
  &_wrap {
    max-height: 540px;
    border-radius: 24px;
    padding: 12px 16px;
    &_top {
      height: 36px;
      width: 100%;
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      &_left {
        background: radial-gradient(50% 50% at 50% 50%, var(--color-ai-step-1) 0%, var(--color-primary) 100%);
        -webkit-background-clip: text;
        color: transparent;
        display: flex;
        align-items: center;
        font-size: 14px;
        justify-content: space-between;
        width: 100%;
      }
    }
    &_content {
      max-height: 106px;
      width: 100%;
      overflow: auto;
    }
  }
}
</style>
