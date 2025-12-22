<template>
  <QButton
    icon-size="16"
    v-if="isRecognizing || isClearInput"
    icon="stopFetching"
    style="background-color: #f4f3f7"
    @click="handleStopVoice"
  />
  <QButton
    :icon-size="buttonSize"
    :disabled="disabled"
    v-else
    icon="voice"
    @click="handleStartVoice"
  />
</template>

<script setup lang="ts">
import { QButton } from "../../../index";
import { SpeechService, MessageRes, setSwitchVoiceInput } from "../../../../Service";
import { onMounted, onUnmounted } from "vue";

const props = defineProps<{
  active: boolean;
  disabled: boolean;
  buttonSize: string;
  isRecognizing: boolean;
  isClearInput: boolean;
}>();

const emit = defineEmits<{
  (e: "onRecognize", payload: MessageRes<Record<string, unknown>>): void;
  (e: "clickCallback", isRecognizing: boolean): void;
}>();
const speechService = SpeechService.getInstance();
const handleStartVoice = async () => {
  try {
    await setSwitchVoiceInput({
      Data: {
        action: "start",
      },
    });
    emit("clickCallback", true);
  } catch (error) {
    console.error("setSwitchVoiceInput Start Error", error);
  }
};
const handleStopVoice = async () => {
  try {
    if (props.isRecognizing) {
      await setSwitchVoiceInput({
        Data: {
          action: "stop",
        },
      });
    }
    emit("clickCallback", false);
  } catch (error) {
    console.error("setSwitchVoiceInput Stop Error", error);
  }
};
onMounted(() => {
  speechService.onRecognize((data: MessageRes<Record<string, unknown>>) => {
    if (props.active) {
      emit("onRecognize", data);
    }
  });
});

onUnmounted(() => {
  speechService.offRecognize(() => {});
});
defineExpose({
  handleStartVoice,
  handleStopVoice,
});
</script>

<style></style>
