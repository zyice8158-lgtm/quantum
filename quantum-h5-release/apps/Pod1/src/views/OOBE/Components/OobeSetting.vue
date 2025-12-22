<template>
  <div class="oobe-setting mt-[14px]" v-if="stepAll.snap.step === PanelStep.QtSettings">
    <div ref="oobeSettingRef" class="overflow-hidden w-[510px] m-[0 auto]">
      <div class="oobe-setting_content">
        <div class="oobe-setting_content_item mb-[8px]" v-for="item in listData" :key="item.title">
          <div class="oobe-setting_content_item_text">
            <div class="oobe-setting_content_item_text_icon">
              <component :is="item.icon" class="text-title-xl" :style="{ color: item.color }" />
            </div>
            <div class="oobe-setting_content_item_text_content">
              <span class="oobe-setting_content_item_text_content_title title-s">{{
                item.title
                }}</span>
              <span class="oobe-setting_content_item_text_content_subTitle title-xs">{{
                item.subTitle
                }}</span>
            </div>
          </div>
          <div class="oobe-setting_content_item_switch mt-[24px]">
            <ToggleSwitch v-model="item.value" />
          </div>
        </div>
      </div>
      <div class="oobe-setting_description cursor-default">
        <span class="font-normal text-(length:--text-title-xs) text-[var(--color-on-focus-container)]">{{
          t('OOBE.oobe_setting_description_basic') }}
          <span class="text-[var(--color-text-accents-primary)]">{{ t('OOBE.oobe_setting_description_sub_title_basic')
            }}</span>
          {{ t('OOBE.oobe_setting_description_sub_title_basic_2') }}</span>
      </div>
      <div class="oobe-setting_footer">
        <Button :label="t('OOBE.oobe_setting_cancel_btn_basic')" class="w-[88px] h-[40px] mr-[9px]" @click="closeAnime(PanelStep.Login)" />
        <Button :label="t('OOBE.oobe_setting_next_btn_basic')" class="w-[72px] h-[40px]" @click="closeAnime(PanelStep.Preview)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import { oobeEventBus as oobeEventBusType } from "../OobeState";
import OobeState from "../OobeState";
import { PanelStep } from "../OobeState";
import Button from "@libs/p-comps/volt/Button.vue";
import ToggleSwitch from "@libs/p-comps/volt/ToggleSwitch.vue";
import { animate } from "animejs";
import { IconPromptOverlay, IconNotifications, IconMemories, IconContextReading, IconMic } from '@quantum/icons';
import { useLocale } from "@/hooks/i18n";

const props = defineProps<{
  oobeEventBus: typeof oobeEventBusType;
  stepAll: OobeState;
}>();
const oobeSettingRef = ref<HTMLElement | null>(null);
const { t } = useLocale();
onMounted(() => { });
watch(
  () => props.stepAll.snap.step,
  async (newVal: PanelStep) => {
    console.log(newVal, "newVal");
    await nextTick();
    if (newVal === PanelStep.QtSettings) {
      startAnime();
    }
  }
);
// 开始动画函数
const startAnime = () => {
  const el = oobeSettingRef.value;
  console.log(el, "el");
  if (!el) return;
  const fromHeight = el.getBoundingClientRect().height;
  animate(el, {
    width: ["48px", "510px"],
    height: ["48px", fromHeight],
    duration: 800,
    easing: "easeInOutQuad",
    fill: "forwards",
  });
};

// 关闭动画函数
const closeAnime = (value: PanelStep) => {
  const el = oobeSettingRef.value;
  if (!el) return;
  const fromHeight = el.getBoundingClientRect().height;
  animate(el, {
    width: ["510px", "48px"],
    height: [fromHeight, '0px'],
    duration: 400,
    easing: "easeInOutQuad",
    fill: "forwards",
  }).then(() => {
    props.stepAll.setStep(value);
  });
};

const listData = ref<{ icon: typeof IconPromptOverlay; title: string; subTitle: string; value: boolean; color?: string }[]>([
  {
    icon: IconPromptOverlay,
    title: t('OOBE.oobe_setting_allow_prompt_overlay_basic'),
    subTitle: t('OOBE.oobe_setting_allow_prompt_overlay_sub_title_basic'),
    value: true,
  },
  {
    icon: IconNotifications,
    title: t('OOBE.oobe_setting_allow_notifications_basic'),
    subTitle: t('OOBE.oobe_setting_allow_notifications_sub_title_basic'),
    value: true,
  },
  {
    icon: IconMemories,
    title: t('OOBE.oobe_setting_allow_personalization_basic'),
    subTitle: t('OOBE.oobe_setting_allow_personalization_sub_title_basic'),
    value: true,
    color: "var(--color-ai-step-3)"
  },
  {
    icon: IconContextReading,
    title: t('OOBE.oobe_setting_allow_context_reading_basic'),
    subTitle: t('OOBE.oobe_setting_allow_context_reading_sub_title_basic'),
    value: true,
  },
  {
    icon: IconMic,
    title: t('OOBE.oobe_setting_allow_microphone_basic'),
    subTitle:
      t('OOBE.oobe_setting_allow_microphone_sub_title_basic'),
    value: true,
    color: "var(--color-ai-step-5)"
  },
]);
</script>

<style scoped lang="less">
.oobe-setting {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;

  &_content {
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)),
      linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6));
    padding: 32px 32px 0 32px;
    display: flex;
    flex-direction: column;
    margin: 0 auto;

    &_item {
      display: flex;
      justify-content: space-between;

      &_text {
        display: flex;
        flex-direction: row;

        &_icon {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-right: 24px;
        }

        &_content {
          display: flex;
          flex-direction: column;

          &_title {
            color: var(--color-text-on-surface);
            line-height: 22px;
          }

          &_subTitle {
            color: var(--color-text-on-surface-variant);
            line-height: 20px;
          }
        }
      }
    }
  }

  &_description {
    padding: 8px 0;
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)),
      linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6));
    display: flex;
    padding: 8px 32px 0 32px;
  }

  &_footer {
    padding: 20px 16px 16px 0;
    border-bottom-right-radius: 24px;
    border-bottom-left-radius: 24px;
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)),
      linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6));
    display: flex;
    justify-content: flex-end;
  }
}
</style>
