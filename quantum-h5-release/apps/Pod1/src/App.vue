<template>
  <RouterView v-slot="{ Component, route }">
    <Transition mode="out-in" :css="false" @enter="handleRouteEnter" @leave="handleRouteLeave">
      <keep-alive include="ChatWin">
        <component :is="Component" />
      </keep-alive>
    </Transition>
  </RouterView>
  <Toast position="top-center"/>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Toast from "@libs/p-comps/volt/QToast/index.vue";
import { animate, cubicBezier } from "animejs";
import { BarStore } from "@/store/bar";
import { updateWindowSize, updataAcrylic } from "@/store/window";
import { nextAnimationFrame } from "@quantum/use";
import { animateSizeMorph, ElementSize, motionResizeWindow, WindowSize } from "./utils/Motion";
// import { QTLocalService } from '@libs/service'
// QTLocalService({
//     query: 'who is caocao'
// })
type MorphType = "prompt" | "acrylic" | null;


interface AcrylicRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 上一次离开路由时记录的类型 + 尺寸
 */
const lastMorphType = ref<MorphType>(null);
const lastMorphSize = ref<ElementSize | null>(null);

const TIME_DURATION = 500;

/**
 * PromptBar -> Chat 主区域
 */
const runPromptToChatMorph = (chatAcrylic: HTMLElement, fromSize: ElementSize): void => {
  const rect = chatAcrylic.getBoundingClientRect();
  const acrylicRect: AcrylicRect = {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  };
  const appEl = document.querySelector<HTMLElement>(".chat-container");
  const appRect = appEl?.getBoundingClientRect();
  const windowSize: WindowSize = {
    Width: appRect?.width ?? 100,
    Height: (appRect?.height ?? 60) + 34,
  };
  motionResizeWindow({
    windowSize,
    acrylicRect,
    areaName: "Main",
    startWidth: fromSize.width,
    duration: TIME_DURATION,
  });
  animateSizeMorph(chatAcrylic, fromSize);
  setTimeout(() => {
    const TextareaEl = chatAcrylic.querySelector('textarea')
    TextareaEl.focus()
    TextareaEl.click()
  }, 1000)
};

/**
 * Chat -> PromptBar
 */
const runChatToPromptMorph = (promptAcrylic: HTMLElement, fromSize: ElementSize): Promise<void> => {
  const rect = promptAcrylic.getBoundingClientRect();
  // return
  const acrylicRect: AcrylicRect = {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  };

  const appEl = document.querySelector<HTMLElement>(".prompt-bar-box");
  const appRect = appEl?.getBoundingClientRect();
  const windowSize: WindowSize = {
    Width: Math.max(appRect?.width, 600) ?? 100,
    Height: appRect?.height ?? 60,
  };
  if (acrylicRect.width > windowSize.Width) {
    windowSize.Width = acrylicRect.width;
  }
  animateSizeMorph(promptAcrylic, fromSize);
  motionResizeWindow({
    windowSize,
    acrylicRect,
    areaName: "Main",
    startWidth: fromSize.width,
    duration: TIME_DURATION,
  });
};

const handleRouteEnter = (el: Element, done: () => void): void => {
  const root = el as HTMLElement;

  const promptAcrylic =
    root
      .querySelector<HTMLElement>(".prompt-bar")
      ?.querySelector<HTMLElement>(".acrylic-view") ?? null;

  const chatAcrylic =
    document
      .querySelector<HTMLElement>(".chat-container")
      ?.querySelector<HTMLElement>(".acrylic-view") ?? null;

  const fromType = lastMorphType.value;
  const fromSize = lastMorphSize.value;

  if (fromType && fromSize) {
    if (fromType === "prompt" && chatAcrylic) {
      // 场景：Prompt -> Chat
      runPromptToChatMorph(chatAcrylic, fromSize);
    } else if (fromType === "acrylic" && promptAcrylic) {
      // 场景：Chat -> Prompt
      runChatToPromptMorph(promptAcrylic, fromSize);
    }
  }

  lastMorphType.value = null;
  lastMorphSize.value = null;
  setTimeout(() => {
    done();
  }, 500);
};

/**
 * 离开钩子：只负责“记录从哪里离开 + 尺寸”
 * 不做任何动画，动画全部放在 enter 场景函数里
 */
const handleRouteLeave = (el: Element, done: () => void): void => {
  const root = el as HTMLElement;

  const promptAcrylic =
    root
      .querySelector<HTMLElement>(".prompt-bar")
      ?.querySelector<HTMLElement>(".acrylic-view") ?? null;

  const chatAcrylic =
    document
      .querySelector<HTMLElement>(".chat-container")
      ?.querySelector<HTMLElement>(".acrylic-view") ?? null;

  if (promptAcrylic) {
    const rect = promptAcrylic.getBoundingClientRect();
    lastMorphType.value = "prompt";
    lastMorphSize.value = {
      width: rect.width,
      height: rect.height,
    };
  } else if (chatAcrylic) {
    const rect = chatAcrylic.getBoundingClientRect();
    lastMorphType.value = "acrylic";
    lastMorphSize.value = {
      width: rect.width,
      height: rect.height,
    };
  } else {
    lastMorphType.value = null;
    lastMorphSize.value = null;
  }

  setTimeout(() => {
    done();
  }, 500);
};

onMounted(() => {
  if (import.meta.env.VITE_OPEN_CONTEXMENU !== 'true') {
    window.addEventListener('contextmenu', (e) => {
      if (e.target instanceof HTMLElement && !['TEXTAREA', 'INPUT'].includes(e.target.nodeName)) {
        e.preventDefault()
      }
    })

    window.addEventListener(
      'wheel',
      (e) => {
        if (e.ctrlKey) {
          e.preventDefault()
        }
      },
      { passive: false }
    )

    window.addEventListener(
      'touchmove',
      (e) => {
        if (e?.touches?.length > 0) {
          e.preventDefault()
        }
      },
      { passive: false }
    )
  }
});
</script>
