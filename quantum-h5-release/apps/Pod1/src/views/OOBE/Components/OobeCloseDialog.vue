<!-- 子组件模板 -->
<template>
    <Dialog v-model:visible="visible" modal header="Header" class="w-[600px]">
      <template #header>
        <div class="inline-flex items-center justify-center gap-2 pl-[10px] pt-[6px]">
          <IconAbout class="w-[32px] h-[32px] pr-[10px]" />
          <span class="text-(length:--text-title-m) font-[500]">{{ t('OOBE.oobe_onboarding_leave_title_basic') }}</span>
        </div>
      </template>
      <div
        class="text-(length:--text-title-s) font-[700] text-(--color-text-on-surface-variant) pt-[12px] pb-[10px] pl-[10px]">
        {{ t('OOBE.oobe_onboarding_leave_confirm_basic') }}
      </div>
      <div
        class="text-(length:--text-title-xs) font-[400] text-(--color-text-on-surface-variant) mb-[72px] pl-[10px]">
        {{ t('OOBE.oobe_onboarding_leave_prompt_basic') }}
      </div>
      <div class="flex justify-end gap-[4px]">
        <QButton :label="t('OOBE.oobe_onboarding_leave_btn_confirm_basic')" variant="text" class="w-[78px] h-[40px]" @click="handleLeave" />
        <QButton :label="t('OOBE.oobe_onboarding_leave_btn_cancel_basic')" color="primary" class="w-[78px] h-[40px]" @click="handleStay" />
      </div>
    </Dialog>
  </template>
  
  <script setup lang="ts">
  import Dialog from "@libs/p-comps/volt/Dialog.vue";
  import { IconAbout } from "@quantum/icons";
  import { ref, watch } from "vue";
  import { QButton } from "@libs/p-comps/volt/QButton";
  import OobeState, { PanelStep } from "../OobeState";
  import { startOobe } from "@libs/service";
  import { useLocale } from "@/hooks/i18n";

  const { t } = useLocale();
  const props = defineProps<{
    isClose: boolean;
    stepAll: OobeState;
  }>();
  
  const emit = defineEmits<{
    (e: "update:isClose", value: boolean): void;
  }>();
  
  const visible = ref(false);
  
  watch(
    () => props.isClose,
    (newVal) => {
      visible.value = newVal;
    },
    { immediate: true }
  );
  
  watch(
    () => visible.value,
    (newVal) => {
      emit("update:isClose", newVal);
    }
  );
  
  const handleLeave = () => {
    console.log("handleLeave");
    visible.value = false;
    props.stepAll.setStep(PanelStep.Start);
  };
  
  const handleStay = async () => {
    console.log("handleStay");
    try {
      await startOobe({ MessageSource: "window1", Data: "false" });
      visible.value = false;
    } catch (error) {
      console.error("Start Oobe error", error);
    }
  };
  </script>
  