<template>
  <div class="answer-tool-bar">
    <DropdownMenu
      :items="displayQuestionFiles"
      :trigger="['click']"
      @click.stop
      v-if="displayQuestionFiles.length > 0"
    >
       <button class="answer-tool-bar-left">
          <IconLink class="w-[18px] h-[18px]"/>
          <div class="answer-tool-bar-left_text">Sources</div>
          <IconArrorDown class="w-[18px] h-[18px]"/>
        </button>
    </DropdownMenu>
    <button class="answer-tool-bar-left" v-else></button>
    <div class="answer-tool-bar-right">
      <AiButton class="!min-w-[32px] !min-h-[32px] !h-[32px]" @click="handleRemeber">
        <IconMemories class=" w-[16px] h-[16px]"></IconMemories>
      </AiButton>
      <AiButton class="!min-w-[32px] !min-h-[32px] !h-[32px]" @click="handleCopy">
        <IconCopy class="w-[16px] h-[16px]"></IconCopy>
      </AiButton>
      <AiButton v-if="isShowPlayButton" class="!min-w-[32px] !min-h-[32px] !h-[32px]" @click="handlePlay">
        <IconSpeech v-if="!props.answerItem.answerData.isPlaying" class=" w-[16px] h-[16px]"></IconSpeech>
        <IconPause2 v-else class=" w-[16px] h-[16px]"></IconPause2>
      </AiButton>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { AiButton } from '../../volt/QButton';
import { IconCopy, IconMemories, IconSpeech, IconPause2 } from '../../../icons';
import { addMemory } from '@libs/service';
import { useToast } from 'primevue/usetoast';
import { computed } from 'vue';
import { ChatStatus, ChatController, AnswerActionType } from '../../index';
import Answer from '../../ChatBaseComponent/types/Answer';
import { useTTSPlayer } from '@libs/service';
import { ChatComponentType } from '../../ChatBaseComponent/types';
import DropdownMenu from '../../Dropdown';
import { IconArrorDown, IconLink } from '@quantum/icons';

const props = defineProps<{
  answerItem: Answer | undefined,
  chat: ChatController | undefined,
}>();

const toast = useToast();

const displayQuestionFiles = computed(() => {
  if (!props.answerItem || !props.answerItem.answerData.queryData?.files) return [];
  return props.answerItem.answerData.queryData.files.map((item) => {
    return {
      label: item.fileName,
      path: item.filePath,
      command: (event) => {
        console.log('Open file:', event.item.path);
      }
    };
  });
});

const handleCopy = () => {
  if (!props.answerItem) return;
  const content = props.answerItem.answerData.content;

  navigator.clipboard.writeText(content).then(() => {
    console.log('Content copied to clipboard');
    toast.add({
      severity: "success",
      summary: "Content copied to clipboard",
      detail: "",
      life: 3000,
    });
  }).catch(err => {
    console.error('Failed to copy content: ', err);
    toast.add({
      severity: "error",
      summary: "Failed to copy content",
      detail: "",
      life: 3000,
    });
  });
};

const handleRemeber = async () => {
  if (!props.answerItem) return;
  const content = props.answerItem.answerData.content;

  try {
    const res = await addMemory({
      Data: {
        userText: content,
        fileList: [],
      },
    });
    console.log("addMem---------------", res);
    if (res.data.Data.IsDone) {
      toast.add({
        severity: "success",
        summary: "All Set",
        detail: "Memory Updated!",
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Memory Update Failed!",
        life: 3000,
      });
    }
  } catch (error) {
    console.error('Failed to add memory:', error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Memory Update Failed!",
      life: 3000,
    });
  }
};

const handlePlay = () => {
  if (!props.answerItem) return;
  if (props.answerItem.answerData.isPlaying) {
    useTTSPlayer.stop();
    props.answerItem.answerData.isPlaying = false;
    updateAnswer(props.answerItem);
    return;
  }

  // 停止其他正在播放的项目
  playingItems.value.forEach(item => {
    const answer = item as Answer;
    useTTSPlayer.stop();
    answer.answerData.isPlaying = false;
    updateAnswer(answer);
  });

  props.answerItem.answerData.isPlaying = true;
  updateAnswer(props.answerItem);
  useTTSPlayer.play(
    props.answerItem.answerData.content,
    () => {
      props.answerItem.answerData.isPlaying = false;
      updateAnswer(props.answerItem);
    },
  );
}

const isShowPlayButton = computed(() => {
  if (!props.answerItem) return false;
  const { answerData, chatStatusAnswer } = props.answerItem;
  return chatStatusAnswer.value === ChatStatus.DONE && answerData.content && answerData.actionType !== AnswerActionType.UPLOADFILE;
});

const playingItems = computed(() => {
  if (!props.chat) return [];
  return props.chat.chatAction.filter(item => {
    if (item.getData().type === ChatComponentType.ANSWER) {
      const answer = item as Answer;
      return answer.answerData.isPlaying;
    }
    return false;
  });
});

const updateAnswer = (currentAnswer: Answer) => {
  if (!props.chat) return;
  const index = props.chat.chatAction.findIndex(
    (item) => item.id === currentAnswer.id
  );
  if (index !== -1) {
    props.chat.chatAction[index] = currentAnswer;
  }
};
</script>

<style lang="less" scoped>
.answer-tool-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;

  &-left {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: none;
    gap: 10px;
    background: #ffffff;
    cursor: pointer;
    &_text {
      font-weight: 700;
      font-size: 14px;
      line-height: 20px;
      color: #23005B;
    }
  }

  &-right {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
}
</style>
