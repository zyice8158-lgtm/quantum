<template>
  <div
    v-if="errorType === ErrorType.FATAL"
    class="pay-attention-error select-none flex items-center justify-start rounded-4 h-[33px] mb-[12px]"
  >
    <IconFailed class="w-[16px] h-[16px] ml-[16px]" />
    <div class="pay-attention-error-title font-medium pl-[12px] pr-[2px]">
      {{ t("payAttention.errorTitle") }}
    </div>
    <div>{{ t("payAttention.errorContent") }}</div>
  </div>

  <div v-else-if="errorType === ErrorType.TEMPORARY" class="select-none w-full flex items-center justify-start h-[33px] mb-[12px]">
    <IconQuantumLogo class="w-[24px] h-[24px] mr-[10px]"/>
    <div class="pay-attention-error-content text-body-m font-medium">{{ t("payAttention.temporaryErrorContent") }}</div>
  </div>
</template>

<script setup lang="ts">
import { IconFailed,  IconQuantumLogo } from "@quantum/icons";
import { ErrorType } from "../../home/index";
import { useLocale } from "@/hooks/i18n";
const { t } = useLocale();
defineProps<{
  errorType?: string;
}>();
</script>

<style scoped lang="less">
.pay-attention-error {
  width: 100%;
  background: var(--color-error-container);
  font-size: var(--text-label-xs);
  line-height: var(--leading-label-xs);
  color: var(--color-on-success-container);
}

.pay-attention-error-content {
  background: radial-gradient(50% 50% at 50% 50%, var(--color-ai-step-1) 0%, var(--color-primary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
</style>
