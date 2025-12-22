<template>
  <div v-if="stepAll.snap.step === PanelStep.LanguageSettings" class="oobe-panel_language-settings">
    <div ref="LanguageSettingsRef" class="oobe-panel_language-settings_content">
      <div
        class="oobe-panel_language-settings_content_item"
        v-for="category in categories"
        :key="category.key"
        @click="handleLanguageSelect(category.key)"
      >
        <label :for="category.key">{{ category.name }}</label>
        <RadioButton
          v-model="selectedLanguage"
          :inputId="category.key"
          name="dynamic"
          :value="category.key"
        />
      </div>
      <div class="oobe-panel_language-settings_but">
        <Button label="Next" class="w-[81px] h-[48px]" @click="handleNext" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { oobeEventBus as oobeEventBusType } from "../OobeState";
import OobeState from "../OobeState";
import { PanelStep } from "../OobeState";
import RadioButton from "@libs/p-comps/volt/RadioButton.vue";
import Button from "@libs/p-comps/volt/Button.vue";
import { nextTick, ref, watch } from "vue";
import { animate } from "animejs";
import { setOobeStatus } from "@libs/service";
import { useLanguageList } from "@/types/Language";
// import { useLocale } from "@/hooks/i18n";
const selectedLanguage = ref<string>("en-US");
const props = defineProps<{
  oobeEventBus: typeof oobeEventBusType;
  stepAll: OobeState;
}>();

// const { t } = useLocale();
const categories = ref(useLanguageList());
const handleLanguageSelect = (key: string) => {
  console.log(key, "Select Language Key");
  selectedLanguage.value = key;
};

const handleNext = async () => {
  try {
    const res = await setOobeStatus({
      MessageSource: "window1",
      Data: { general: [{ Key: "Language", Value: selectedLanguage.value, LocalType: 2 }] },
    });
    console.log(res, "Select Language Res");
    if (res.data.Data === "true") props.stepAll.setStep(PanelStep.LoginText);
  } catch (error) {
    console.error("Select Language error", error);
    // props.stepAll.setStep(PanelStep.LoginText);
  }
};
const LanguageSettingsRef = ref<HTMLElement | null>(null);
watch(
  () => props.stepAll.snap.step,
  async (newVal: PanelStep) => {
    console.log(newVal, "selectedLanguage");
    await nextTick();
    const el = LanguageSettingsRef.value;
    if (!el) return;

    const fromHeight = el.getBoundingClientRect().height;
    animate(el, {
      width: ["48px", "26%"],
      height: ["48px", fromHeight],
      duration: 800,
      easing: "easeInOutQuad",
      fill: "forwards",
    });
  }
);
</script>

<style scoped lang="less">
.oobe-panel_language-settings {
  width: 100vw;
  height: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-top: 13px;

  &_content {
    width: 26%;
    background: linear-gradient(
        0deg,
        var(--Blur-Scrim-Fixed-Light-Surface, rgba(255, 255, 255, 0.6)),
        var(--Blur-Scrim-Fixed-Light-Surface, rgba(255, 255, 255, 0.6))
      ),
      linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6));
    border-radius: 16px;
    display: flex;
    padding: 12px;
    flex-direction: column;
    overflow: hidden;

    &_item {
      width: 100%;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px 0 8px;
      cursor: pointer;
    }
    &_item:hover {
      background: #0e77da1f;
    }
  }

  &_but {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
