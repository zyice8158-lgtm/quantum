<template>
  <div class="chat-container w-[960px] mt-[34px] relative pr-[28px] pl-[28px]" data-click-through ref="elRef">
    <div class="acrylic-view p-[8px] rounded-[32px] flex" @mousedown="startDragWindow">
      <BarBtn
        class="!p-[4px] !border-[1.5px] border-transparent mr-[12px]"
        @click="toggleFullView"
        v-automation="'btn_logo'"
        v-tooltip.top="logoTooltip"
      >
        <IconQuantumLogo class="text-[32px] transition-transform duration-500 ease-in-out hover:rotate-[360deg]"></IconQuantumLogo>
      </BarBtn>
      <InputPage :chat="chat" pod="pod1" inputStatus="done" @fileSelect="onFileSelect" @fileDelete="onFileDelete"
        :fileSearchList="files" :customEnterSend="customEnterSend" />
    </div>
    <Transition mode="out-in" name="minimize-show" @Enter="MinimizeAnime.onEnter" @Leave="MinimizeAnime.onLeave"
      :css="false">
      <IconMinize
        class="minimize-btn text-[24px] text-white absolute top-[20px] right-[0px] shadow-[inset_0_0_20px_0px_var(--color-ai)] rounded-full"
        @Click="goPromptBar()" v-automation="'minimize_bar_btn'" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { IconMinize, IconQuantumLogo } from '@quantum/icons';
import { onMounted, ref, onUnmounted, Transition, watch } from 'vue'
import { InputPage } from '@libs/p-comps/ChatView'
import { useMinimizeAnime } from "../PromptBar/use/useAnime";
import { useRouter } from "vue-router";
import { closeWindow, startDragWindow, updataAcrylic, updateWindowSize, WindowIdStore, WindowStore, openQuantumAppWin } from '@/store/window';
import { useFileScope } from '@libs/p-comps/hooks/useFiles';
import { nextAnimationFrame } from '@quantum/use';
import { BarMode, BarStore, changeLiveMode, LiveMode } from '@/store/bar';
import BarBtn from '../Bar/comps/BarBtn';
import { ChatViewChannel, ChatWinChangeView, ChatWinChannel, ChatWinStore, ChatWInType } from '@/store/chatWin';
import { useLocale } from "@/hooks/i18n";
defineOptions({
  name: 'Chat'
});
const chat = ref();
const router = useRouter();
const MinimizeAnime = useMinimizeAnime();
const fileScope = 'Chat'
const {
  files,
  onFileDelete,
  onFileSelect,
  deleteScope
} = useFileScope({ scope: fileScope })
const { t } = useLocale();
onUnmounted(() => {
  deleteScope()
})

const logoTooltip = {
    value: t("promptBar.discover"),
    showDelay: 200,
    hideDelay: 200,
    trigger: "hover",
    pt: {
      root: "!top-0",
    },
  }


const goPromptBar = (state?: any) => {
  router.push({
    name: 'PromptBar',
    state: state
  });
  if (!state && WindowIdStore.Chat) {
    closeWindow(WindowIdStore.Chat);
  }
}

onMounted(async () => {
  await ChatWinChangeView('SuggestionContainer')
  const TextareaEl = elRef.value.querySelector('textarea')
  TextareaEl?.focus()
  TextareaEl?.click()
  if(history.state.files){
    files.value = history.state.files;
    BarStore.fileArea = false;
  }
})

const toggleFullView = async () => {
  // console.log('toggleFullView', payAttentionStore.isRecording);
  if (BarStore.liveMode == LiveMode.transition) return;
  if (BarStore.liveMode !== LiveMode.none) {
    await changeLiveMode(LiveMode.none);
  }
  await openQuantumAppWin(`#/quantum/chat`);
};

/** new Chat 跳转到新的窗口发送信息 */
const customEnterSend = (async ({ content, payload }: { content: string, payload?: any }) => {
  await ChatWinChangeView('Chat')
  await ChatViewChannel.emit('setQueryObject', { content, payload, files: files.value });
})
watch(() => ChatWinStore.view, (view) => {
  if (view !== 'SuggestionContainer') {
    goPromptBar({
      barMode: BarMode.IDLE
    });
  }
})


let oberverRequestAnimation: number | null = null;
const observerEl = () => {
  console.log('observerEl');
  if (oberverRequestAnimation) {
    cancelAnimationFrame(oberverRequestAnimation);
  }

  oberverRequestAnimation = requestAnimationFrame(async () => {
    resizeWindow()
  });
}
const resizeWindow = async () => {
  if (BarStore.isAanimateChange) return;
  const ClientRect = elRef.value!.getBoundingClientRect();

  await updateWindowSize({
    Width: ClientRect.width,
    Height: ClientRect.height + 34,
  });
  await nextAnimationFrame();
  const AcrylicWiewElRect = elRef.value.querySelector('.acrylic-view').getBoundingClientRect();

  updataAcrylic({
    Name: "Main",
    Width: AcrylicWiewElRect.width,
    Height: AcrylicWiewElRect.height,
    CornerRadius: 32,
    PointX: AcrylicWiewElRect.x,
    PointY: AcrylicWiewElRect.y,
  });
}

let observer: ResizeObserver;
const elRef = ref<HTMLElement>();
onMounted(async () => {
  observer = new ResizeObserver(observerEl);
  observer.observe(elRef.value);
})



onUnmounted(() => {
  observer?.disconnect();
})


</script>
<style lang="less" scoped></style>
