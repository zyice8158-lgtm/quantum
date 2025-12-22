<template>
    <AiButton category="action" size="small"  v-if="isShowPlayButton"  @click="handlePlay">
        <IconSpeech v-if="!answerItem.answerData.isPlaying" class="text-[var(--color-focus-focus)] w-[16px] h-[16px]"></IconSpeech>
        <IconPause2 v-else class="text-[var(--color-focus-focus)] w-[16px] h-[16px]"></IconPause2>
    </AiButton>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import { AiButton } from '../volt/QButton';
import { ChatStatus, ChatComponentType } from '../../QuantumUI/ChatBaseComponent/index';
import Answer from '../../QuantumUI/ChatBaseComponent/types/Answer';
import { useTTSPlayer }  from '@libs/service';
import {
  IconSpeech, IconPause2
} from "@quantum/icons";
import { ChatMessageType } from '../index'
const props = defineProps<{
  answerItem: Answer | undefined,
  chatAction: Array<ChatMessageType> | [],
}>();
const playContent = computed(() => {
  return props.answerItem?.answerData.playContent || props.answerItem?.answerData.content;
});
const isShowPlayButton = computed(() => {
    const { chatStatusAnswer } = props.answerItem;
    return chatStatusAnswer.value === ChatStatus.DONE && playContent.value;
});
const playingItems = computed(() => {
  return props.chatAction.filter(item => {
    if (item.getData().type === ChatComponentType.ANSWER) {
      const answer = item as Answer;
      return answer.answerData.isPlaying;
    }
    return false;
  });
});
const handlePlay = () => {
  console.log('handlePlay---------0', playContent.value);
  if (props.answerItem.answerData.isPlaying) {
    useTTSPlayer.stop();
    props.answerItem.answerData.isPlaying = false;
    updateAnswer(props.answerItem);
    return;
  }

  playingItems.value.forEach(item => {
    const answer = item as Answer;
    useTTSPlayer.stop();
    answer.answerData.isPlaying = false;
    updateAnswer(answer);
  });
  props.answerItem.answerData.isPlaying = true;
  updateAnswer(props.answerItem);
  useTTSPlayer.play(playContent.value,
    () => {
      props.answerItem.answerData.isPlaying = false;
      updateAnswer(props.answerItem);
    },
  );
}
const updateAnswer = (currentAnswer: Answer) => {
  const index = props.chatAction.findIndex(
    (item) => item.id === currentAnswer.id
  );
  if (index !== -1) {
    props.chatAction[index] = currentAnswer;
  }
};
</script>