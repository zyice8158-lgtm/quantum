<template>
  <QButton :iconSize="buttonSize" icon="WhiteShareIcon" type="primary" v-if="isLiving" @click="handleStopLive" round />
  <QButton :iconSize="buttonSize" icon="ShareColorIcon" v-else @click="handleStartLive" round />
</template>

<script setup lang='ts'>
import { SpeechService, MessageRes, WebviewMessager, startLiveConversation } from '../../../../Service';
import { ref, onMounted, onUnmounted } from 'vue';
import { QButton } from '../../../index'
const props = defineProps<{ active: boolean, buttonSize: string , beforeClick?: () => void}>();

const emit = defineEmits<{
  (e: 'onRecognize', payload: MessageRes<Record<string, unknown>>): void,
  (e: 'clickCallback', isLiving: boolean): void;
}>();
const speechService = SpeechService.getInstance();
const isLiving = ref(false);

const handleStartLive = () => {
  if(props.beforeClick) props.beforeClick();
  speechService.isLiving = true;
  isLiving.value = true;
  speechService.startRecogniz({ Data: { IsLive: true } });
  emit('clickCallback', true);
};
const handleStopLive = () => {
  speechService.isLiving = false;
  isLiving.value = false;
  speechService.stopRecogniz({ Data: {} });
  emit('clickCallback', false);
  if (speechService.isSpeaking) {
    speechService.stopSpeech({ Data: {} });
  }

};
// const offStartLiveMode =  WebviewMessager.on('startLiveMode', (_) => {
//   handleStartLive();
// });
onMounted(() => {
  speechService.onRecognize((data: MessageRes<Record<string, unknown>>) => {
    if (props.active) {
      emit('onRecognize', data);
    }
  });
});

onUnmounted(() => {
  speechService.offRecognize(() => { });
  // offStartLiveMode();
});
defineExpose({
  handleStartLive,
  handleStopLive
});
</script>

<style lang="less" scoped>

</style>