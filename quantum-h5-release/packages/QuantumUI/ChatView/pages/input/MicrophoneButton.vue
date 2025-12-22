<template>
  <AiButton
    v-if="isRecognizing || isClearInput"
    class="!bg-[#e7e2dd] !min-w-[40px] !w-[40px] !h-[40px]"
    @click="handleStopVoice"
    v-automation="'btn_stop_fetching'"
  >
  <IconWrong />
  </AiButton>
  <AiButton
    :disabled="disabled || !isEnabledASR"
    v-else
    class=" !min-w-[40px] !w-[40px] !h-[40px]"
    @click="handleStartVoice"
    v-automation="'btn_start_voice'"
  >
    <IconMic />
  </AiButton>
</template>

<script setup lang="ts">
import { ChatController } from "../../../index";
import { onMounted, onUnmounted } from "vue";
import { useDisabledVoice } from "../../../utils/checkDisabledVoice";
import { AiButton } from "../../../volt/QButton";
import { IconMic, IconWrong } from "@quantum/icons";
import {
  WebviewMessager,
  MessageRes,
  initASR,
  initTTS,
  useASRPlayer, useTTSPlayer
} from "@libs/service";
import { stopPlayingItem } from "../../../utils/updatePlayingItem";

const props = defineProps<{
  active: boolean;
  disabled: boolean;
  buttonSize: string;
  isRecognizing: boolean;
  isClearInput: boolean;
  chat: ChatController | undefined;
}>();
const emit = defineEmits<{
  (e: "onRecognize", payload: MessageRes<Record<string, unknown>>): void;
  (e: "clickCallback", isRecognizing: boolean): void;
}>();
const { isEnabledASR } = useDisabledVoice();
const handleStartVoice = () => {
  useTTSPlayer.stop();
  stopPlayingItem(props.chat);

  useASRPlayer.start({ Data: {} });
  emit("clickCallback", true);
};
const handleStopVoice = () => {
  if (props.isRecognizing) {
    useASRPlayer.stop({ Data: {} });
  }
  emit("clickCallback", false);
};
onMounted(() => {
  useASRPlayer.on((data: MessageRes<Record<string, unknown>>) => {
    if (props.active) {
      emit("onRecognize", data);
    }
  });
  WebviewMessager.on("MicrophoneRemoved", (res) => {
    console.log("MicrophoneRemoved--------------", res);
    const { MicrophoneRemoved } = res.Data || {};
    if (MicrophoneRemoved) {
      initASR();
      initTTS();
    }
  });
  WebviewMessager.on("SpeakerRemoved", (res) => {
    console.log("SpeakerRemoved--------------", res);
    const { SpeakerRemoved } = res.Data || {};
    if (SpeakerRemoved) {
      initASR();
      initTTS();
    }
  });
});

onUnmounted(() => {
  useASRPlayer.off();
  useTTSPlayer.stop();
});
defineExpose({
  handleStartVoice,
  handleStopVoice,
});
</script>

<style></style>
