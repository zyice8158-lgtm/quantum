<template>
   <QButton>
    <template #icon>
        <IconPause class="speech-icon" v-if="playing"></IconPause>
        <IconSpeech class="speech-icon" v-else></IconSpeech>
    </template>
   </QButton>

</template>
  
<script setup lang='ts'>
import QButton from '../../Button';
import {
  IconSpeech,
  IconPause
} from "@quantum/icons";
defineProps<{
    playing: boolean;
}>();

</script>
  
<style lang="less" scoped>
.speech-icon {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
</style>