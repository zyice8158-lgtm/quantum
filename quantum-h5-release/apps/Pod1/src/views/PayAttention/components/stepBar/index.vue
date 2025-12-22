<template>
  <div class="flex flex-col p-[12px] bg-[var(--color-surface)] rounded-[var(--radius-16)]">
    <Transition
      v-for="(item, index) in thinkingItems"
      :key="index"
      name="step-fade"
    >
      <div
        v-if="index <= currentStepIndex"
        :class="['flex justify-start select-none', index < thinkingItems.length - 1 && index !== currentStepIndex ? 'mb-[10px]' : '']"
      >
      <div class="flex flex-col items-center justify-start mr-[8px]">
        <IconStepCheck class="w-[20px] h-[20px] mb-[2px]" :style="{ color: item.color }"/>
        <div
          v-if="index < thinkingItems.length - 1 && index + 1 <= currentStepIndex"
          class="h-[16px] w-[1px]"
          :style="{ background: item.color }"
        ></div>
      </div>
      <div
        class="text-body-m leading-body-m"
        :class="{ 'text-blinking': index === blinkingStepIndex }"
        :style="{ color: item.color }"
      >
        {{ item.name }}
      </div>
      </div>
    </Transition>
  </div>

</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useLocale } from '@/hooks/i18n';
import { IconStepCheck } from '@quantum/icons';
import { WebviewMessager } from '@libs/service';
import type { MessageRes } from '@libs/service';

const { t } = useLocale();

interface StepItem {
  name: string;
  color: string;
  isLoading: boolean;
}

const thinkingItems = computed<StepItem[]>(() => [
  {
    name: t('payAttention.stepAnalyzing'),
    color: 'var(--color-ai-step-1)',
    isLoading: false,
  },
  {
    name: t('payAttention.stepIdentifyingTopics'),
    color: 'var(--color-ai-step-2)',
    isLoading: false,
  },
  {
    name: t('payAttention.stepIdentifyingParticipants'),
    color: 'var(--color-ai-step-3)',
    isLoading: false,
  },
  {
    name: t('payAttention.stepIntegratingNotes'),
    color: 'var(--color-ai-step-4)',
    isLoading: false,
  },
]);

const currentStepIndex = ref(0);
const blinkingStepIndex = ref(0);

const handleProgressNotification = (payload: MessageRes<Record<string, unknown>>) => {
  const data = payload.Data;

  if (Number(data) <= blinkingStepIndex.value) {
    return;
  }

  const stepIndex = Math.min(Number(data), thinkingItems.value.length);
  currentStepIndex.value = stepIndex;
  blinkingStepIndex.value = stepIndex;
};

onMounted(() => {
  currentStepIndex.value = 0;
  blinkingStepIndex.value = 0;

  WebviewMessager.on("client.h5.ProgressNotification", handleProgressNotification);
});

onUnmounted(() => {
  WebviewMessager.off("client.h5.ProgressNotification");
  blinkingStepIndex.value = 0;
});
</script>
<style scoped lang="less">
@keyframes textBlink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.text-blinking {
  animation: textBlink 1.5s ease-in-out infinite;
}

.step-fade-enter-active {
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.step-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
