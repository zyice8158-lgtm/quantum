<template>
  <div class="oobe-topbar">
    <div class="oobe-topbar_bg" ref="bgRef"></div>
    <div class="oobe-topbar_bar">
      <div class="oobe-topbar_bar_right" @click="handleClose">
        <IconClose class="text-title-xl text-(--color-on-primary)" />
      </div>
      <div class="oobe-topbar_bar_center" ref="barCenterRef">
        <div class="oobe-topbar_bar_center_icon" ref="iconRef">
          <QIcons name="Logo" size="25" />
        </div>
        <div class="oobe-topbar_bar_center_text" ref="textRef">
          <span>
            {{ topbarText }}
            <Button v-if="actionButton" :label="actionButton.label" class="w-[112px] h-[48px] ml-[12px]"
              @click="actionButton.onClick" />
          </span>
        </div>
      </div>
      <div class="oobe-topbar_bar_right" v-if="showRightArrow" @click="handleRight">
        <!-- <QIcons name="right_arrow" size="24" color="#FFFFFF" /> -->
        <IconArrowRight class="text-title-xl text-(--color-on-primary)" />
      </div>
    </div>
  </div>
  <OobeCloseDialog v-model:isClose="isClose" :stepAll="stepAll" />
</template>

<script setup lang="ts">
import { QIcons } from "@libs/p-comps";
import { onMounted, ref, watch, nextTick, computed, onUnmounted } from "vue";
import { oobeEventBus as oobeEventBusType } from "../OobeState";
import OobeState from "../OobeState";
import { animate } from "animejs";
import { PanelStep } from "../OobeState";
import Button from "@libs/p-comps/volt/Button.vue";
import { setLogin, startOobe, WebviewMessager } from "@libs/service";
import { IconClose, IconArrowRight } from "@quantum/icons";
import OobeCloseDialog from "./OobeCloseDialog.vue";
import { useLocale } from "@/hooks/i18n";

const props = defineProps<{
  oobeEventBus: typeof oobeEventBusType;
  stepAll: OobeState;
}>();

const { t } = useLocale();
const step = computed(() => props.stepAll.snap.step);
const barCenterRef = ref<HTMLElement | null>(null);
const iconRef = ref<HTMLElement | null>(null);
const textRef = ref<HTMLElement | null>(null);
const bgRef = ref<HTMLElement | null>(null);
const isClose = ref(false);
const LOGIN_EVENT = "client.h5.login";
const glowPadding = 160;

const handleStart = async () => {
  try {
    await startOobe({ MessageSource: "window1", Data: "true" });
  } catch (error) {
    console.error("Start Oobe error", error);
  }
};

// 计算“内容需要的宽度”（icon + 文案 + 内部padding + margin 所有边距）
const getContentWidth = (): number => {
  const container = barCenterRef.value;
  const iconEl = iconRef.value;
  const textEl = textRef.value;
  if (!container || !iconEl || !textEl) {
    return container?.getBoundingClientRect().width ?? 0;
  }

  const iconWidth = iconEl.getBoundingClientRect().width;
  const textWidth = textEl.getBoundingClientRect().width;

  const paddingLeft = 0;
  const paddingRight = 42;
  return iconWidth + textWidth + paddingLeft + paddingRight;
};

const animateToContentWidth = () => {
  const el = barCenterRef.value;
  const bgEl = bgRef.value;
  if (!el) return;

  const fromWidth = el.getBoundingClientRect().width;
  const toWidth = getContentWidth();

  animate(el, {
    width: [fromWidth, toWidth],
    duration: 400,
    easing: "easeInOutQuad",
  });

  if (bgEl) {
    const fromBgWidth = bgEl.getBoundingClientRect().width;
    const toBgWidth = toWidth + glowPadding * 2;
    animate(bgEl, {
      width: [fromBgWidth, toBgWidth],
      duration: 400,
      easing: "easeInOutQuad",
    });
  }
};
const handleRight = () => {
  switch (step.value) {
    case PanelStep.LoginText:
      props.stepAll.setStep(PanelStep.Login);
      break;
    case PanelStep.BarLoading:
      props.stepAll.setStep(PanelStep.LanguageSettings);
      break;
    case PanelStep.LenovoIdForSmartConnect:
      props.stepAll.setStep(PanelStep.QtSettings);
      break;
    default:
      break;
  }
};

const handleClose = async () => {
  isClose.value = true;
};

const handleLogin = async () => {
  try {
    await setLogin({ MessageSource: "window1", Data: "" });
  } catch (error) {
    console.error("Set Login error", error);
    // props.stepAll.setStep(PanelStep.LenovoIdForSmartConnect);
  }
};

const handleLoginMessage = (res: { Data?: { LoginStatus?: string } }) => {
  if (res.Data?.LoginStatus === "true") {
    props.stepAll.setStep(PanelStep.LenovoIdForSmartConnect);
  }
};

const registerLoginListener = () => {
  WebviewMessager.on(LOGIN_EVENT, handleLoginMessage);
};

const handleStartQiraTour = () => {
  props.stepAll.setStep(PanelStep.BarLoading);
};

const actionButton = computed(() => {
  switch (step.value) {
    case PanelStep.Login:
      return { label: "Log In", onClick: handleLogin };
    case PanelStep.Start:
      return { label: "Start", onClick: handleStart };
    case PanelStep.StartQiraTour:
      return { label: "Start", onClick: handleStartQiraTour };
    default:
      return null;
  }
});

const showRightArrow = computed(
  () =>
    ![
      PanelStep.StartQiraTour,
      PanelStep.LanguageSettings,
      PanelStep.Start,
      PanelStep.Login,
    ].includes(step.value)
);

onMounted(async () => {
  registerLoginListener();
  const el = barCenterRef.value;
  const bgEl = bgRef.value;
  if (!el) return;

  const collapsedWidth = 72;
  el.style.width = `${collapsedWidth}px`;
  if (bgEl) {
    const collapsedBgWidth = collapsedWidth + glowPadding * 2;
    bgEl.style.width = `${collapsedBgWidth}px`;
  }

  await nextTick();
  requestAnimationFrame(() => {
    const toWidth = getContentWidth();
    animate(el, {
      width: [collapsedWidth, toWidth],
      duration: 1000,
      easing: "easeInOutQuad",
    });
    if (bgEl) {
      const collapsedBgWidth = collapsedWidth + glowPadding * 2;
      const toBgWidth = toWidth + glowPadding * 2;
      animate(bgEl, {
        width: [collapsedBgWidth, toBgWidth],
        duration: 1000,
        easing: "easeInOutQuad",
      });
    }
  });
});

watch(
  () => step.value,
  async () => {
    await nextTick();
    requestAnimationFrame(() => {
      animateToContentWidth();
    });
  }
);

const topbarText = computed<string>(() => {
  const copyMap: Partial<Record<PanelStep, string>> = {
    [PanelStep.BarLoading]: t('OOBE.oobe_greet_intro_basic'),
    [PanelStep.LanguageSettings]: t('OOBE.oobe_language_pick_preferred'),
    [PanelStep.LoginText]:t('OOBE.oobe_greet_capability_basic'),
    [PanelStep.Login]: t('OOBE.oobe_login_prompt_basic'),
    [PanelStep.QtSettings]: t('OOBE.oobe_permission_check_basic'),
    [PanelStep.Preview]: t('OOBE.oobe_ai_notes_basic'),
    [PanelStep.Start]: t('OOBE.oobe_hey_qira_setup_prompt_basic'),
    [PanelStep.StartQiraTour]: t('OOBE.oobe_tour_start_basic'),
    [PanelStep.LenovoIdForSmartConnect]:
      t('OOBE.oobe_login_success_smartconnect_basic'),
  };

  return copyMap[step.value] ?? "";
});

onUnmounted(() => {
  WebviewMessager.off(LOGIN_EVENT);
});
</script>

<style scoped lang="less">
.oobe-topbar {
  width: 100vw;
  height: 94px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  position: relative;

  &_bg {
    position: absolute;
    top: -40px;
    left: 53%;
    transform: translateX(-50%);
    height: 260px;
    border-radius: 9999px;
    background:
      radial-gradient(circle at 20% 40%, rgba(64, 176, 255, 0.9), transparent 60%),
      radial-gradient(circle at 60% 40%, rgba(143, 96, 255, 0.9), transparent 60%),
      radial-gradient(circle at 40% 70%, rgba(255, 130, 255, 0.6), transparent 60%);
    filter: blur(40px);
    opacity: 0.9;
    pointer-events: none;
    z-index: -1;
  }

  &_minibar {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(21.76deg,
        rgba(0, 0, 0, 0) -194.17%,
        rgba(0, 0, 0, 0.15) -144.42%,
        rgba(0, 0, 0, 0.15) -34.6%,
        rgba(0, 0, 0, 0.0675) 15.59%,
        rgba(0, 0, 0, 0.15) 65.97%,
        rgba(0, 0, 0, 0.15) 208.83%,
        rgba(0, 0, 0, 0) 231.6%);
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;

    &_icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  &_minibar::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    padding: 1.5px;
    background: linear-gradient(86.04deg,
        rgba(255, 255, 255, 0) 2.78%,
        rgba(255, 255, 255, 0.42) 8.8%,
        rgba(255, 255, 255, 0.42) 13.8%,
        rgba(255, 255, 255, 0.49) 22.32%,
        rgba(255, 255, 255, 0.49) 50.1%,
        rgba(255, 255, 255, 0.49) 82.9%,
        rgba(255, 255, 255, 0.49) 91.21%,
        rgba(255, 255, 255, 0) 95.9%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  &_bar {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;

    &_left {
      width: 55px;
      height: 44px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 8px;
    }

    &_right {
      width: 55px;
      height: 44px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: 8px;
    }

    &_center {
      height: 64px;
      background: linear-gradient(36.34deg,
          rgba(255, 255, 255, 0) -131.67%,
          rgba(255, 255, 255, 0.3) -106.97%,
          rgba(255, 255, 255, 0.3) -86.43%,
          rgba(255, 255, 255, 0.3) -51.46%,
          rgba(255, 255, 255, 0.3) 62.64%,
          rgba(255, 255, 255, 0.3) 197.33%,
          rgba(255, 255, 255, 0.3) 231.45%,
          rgba(255, 255, 255, 0) 250.73%);
      border-radius: 32px;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;

      &_icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 8px;
        margin-right: 12px;
        flex-shrink: 0;
      }

      &_text {
        font-weight: 500;
        font-size: 20px;
        line-height: 26px;
        color: #fbf9f7;
        white-space: nowrap;
      }
    }

    &_center::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 32px;
      padding: 1px;
      height: 64px;
      background: linear-gradient(346deg,
          rgba(255, 255, 255, 0) 2.78%,
          rgba(255, 255, 255, 0.7) 8.8%,
          rgba(255, 255, 255, 0.7) 13.8%,
          rgba(255, 255, 255, 0.7) 22.32%,
          rgba(255, 255, 255, 0.7) 50.1%,
          rgba(255, 255, 255, 0.7) 82.9%,
          rgba(255, 255, 255, 0.7) 91.21%,
          rgba(255, 255, 255, 0) 95.9%);
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      mask-composite: exclude;
      pointer-events: none;
    }
  }
}
</style>
