<template>
  <div class="oobe-preview mt-[14px]" v-if="stepAll.snap.step === PanelStep.Preview">
    <div ref="oobePreviewRef" class="overflow-hidden w-[510px] m-[0 auto]">
      <div class="oobe-preview_content">
        <div class="oobe-preview_content_item" v-for="item in listData" :key="item.title">
          <div class="oobe-preview_content_item_icon ">
            <component :is="item.icon" class="text-title-xl" :style="{ color: item.color }" />
          </div>
          <div class="oobe-preview_content_item_content">
            <div class="oobe-preview_content_item_content_title title-s">{{ item.title }}</div>
            <div class="oobe-preview_content_item_content_subTitle title-xs">
              {{ item.subTitle }}
            </div>
          </div>
        </div>
      </div>
      <div class="oobe-preview_footer">
        <Button :label="t('OOBE.oobe_setting_cancel_btn_basic')" class="w-[88px] h-[40px] mr-[9px]" @click="closeAnime(PanelStep.QtSettings)" />
        <Button :label="t('OOBE.oobe_setting_next_btn_basic')" class="w-[72px] h-[40px]" @click="closeAnime(PanelStep.Start)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { oobeEventBus as oobeEventBusType } from "../OobeState";
import OobeState from "../OobeState";
import { PanelStep } from "../OobeState";
import Button from "@libs/p-comps/volt/Button.vue";
import { animate } from "animejs";
import { IconStar, IconUser, IconQTPlain, IconUsageLimits } from "@quantum/icons";
import { useLocale } from "@/hooks/i18n";

const props = defineProps<{
  oobeEventBus: typeof oobeEventBusType;
  stepAll: OobeState;
}>();

const oobePreviewRef = ref<HTMLElement | null>(null);
const { t } = useLocale();
watch(
  () => props.stepAll.snap.step,
  async (newVal: PanelStep) => {
    console.log(newVal, "newVal");
    await nextTick();
    if (newVal === PanelStep.Preview) {
      startAnime();
    }
  }
);
// 开始动画函数
const startAnime = () => {
  const el = oobePreviewRef.value;
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
const closeAnime = (value:PanelStep) => {
  const el = oobePreviewRef.value;
  if (!el) return;
  const fromHeight = el.getBoundingClientRect().height;
  animate(el, {
    width: ["510px", "48px"],
    height: [fromHeight,'0px'],
    duration: 400,
    easing: "easeInOutQuad",
    fill: "forwards",
  }).then(()=>{
    props.stepAll.setStep(value);
  });
};

const listData = ref<{ icon: typeof IconStar; title: string; subTitle: string; color?: string }[]>([
  {
    icon: IconStar,
    title: t('OOBE.oobe_preview_personalized_results_basic'),
    subTitle: t('OOBE.oobe_preview_personalized_results_sub_title_basic'),
    color:"var(--color-ai-step-1)"
  },
  {
    icon: IconUser,
    title: t('OOBE.oobe_preview_lenovo_id_basic'),
    subTitle: t('OOBE.oobe_preview_lenovo_id_sub_title_basic'),
  },
  {
    icon: IconQTPlain,
    title: t('OOBE.oobe_preview_ai_accuracy_basic'),
    subTitle: t('OOBE.oobe_preview_ai_accuracy_sub_title_basic'),
    color:"var(--color-ai-step-3)"
  },
  {
    icon: IconUsageLimits,
    title: t('OOBE.oobe_preview_usage_limits_basic'),
    subTitle:
      t('OOBE.oobe_preview_usage_limits_sub_title_basic'),
  },
]);
</script>

<style scoped lang="less">
.oobe-preview {
  display: flex;
  flex-direction: column;
  align-items: center;

  &_content {
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)),
      linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6));
    padding: 32px 32px 40px 32px;
    display: flex;
    flex-direction: column;

    &_item {
      display: flex;
      flex-direction: row;
      padding: 8px 0;

      &_icon {
        margin-right: 24px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
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
