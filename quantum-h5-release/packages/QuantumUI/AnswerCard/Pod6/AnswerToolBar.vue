<template>
  <div class="source-origin" v-if="answerItem.answerData?.queryData?.payload?.webSearch">
    <slot>
      <img :src="Bing" />
      <span>Bing</span>
    </slot>
  </div>
  <div class="answer-tool-bar">
    <DropdownMenu
      :items="displayQuestionFiles"
      :trigger="['click']"
      @click.stop
      v-if="displayQuestionFiles.length > 0 || answerItem.answerData?.queryData?.payload?.webSearch"
    >
      <button class="answer-tool-bar-left">
          <IconLink class="w-[18px] h-[18px]"/>
          <div class="answer-tool-bar-left_text">Sources</div>
          <IconArrorDown class="w-[18px] h-[18px]"/>
        </button>
    </DropdownMenu>
    <div class="answer-tool-bar-left" v-else></div>
    <div class="answer-tool-bar-right">
      <template v-for="(toolConfig, index) in toolConfigurations" :key="index">
        <component :is="toolConfig.component" v-bind="toolConfig.props" @click="toolConfig.handler">
          <component v-if="toolConfig.icon" :is="toolConfig.icon"
            class="text-[var(--color-focus-focus)] w-[16px] h-[16px]" />
        </component>
      </template>
      <!-- <AiButton category="action" size="small" @click="handleRemeber">
        <IconMemories class="text-[var(--color-focus-focus)] w-[16px] h-[16px]"></IconMemories>
      </AiButton>
      <AiButton category="action" size="small" @click="handleCopy">
        <IconCopy class="text-[var(--color-focus-focus)] w-[16px] h-[16px]"></IconCopy>
      </AiButton> -->
      <!-- <AiButton class="!min-w-[32px] !min-h-[32px] !h-[32px]">
        <IconShape1 class="text-[var(--color-focus-focus)] w-[16px] h-[16px]"></IconShape1>
      </AiButton>
      <AiButton class="!min-w-[32px] !min-h-[32px] !h-[32px]" @click="handleShare">
        <IconShare class="text-[var(--color-focus-focus)] w-[16px] h-[16px]"></IconShare>
      </AiButton> -->
      <!-- <VoiceButton :playContent="answerItem.answerData.content" :chatAction="chatAction" :answerItem="answerItem"/> -->
    </div>
  </div>
</template>

<script setup lang='ts'>
import { AiButton } from '../../volt/QButton';
import { IconCopy,IconMemories,IconSpeech,IconPause2, IconShare } from "../../../icons";
import { addMemory } from "@libs/service";
import { useToast } from "primevue/usetoast";
import { shareHelper } from '@libs/service';
import { computed, h } from 'vue';
import type { Component } from 'vue';
import { ChatMessageType } from '../../index';
import { ToolType } from '../../ChatBaseComponent/types/index';
import Answer from '../../ChatBaseComponent/types/Answer';
import {useTTSPlayer}  from '@libs/service';
import { ChatComponentType, ChatStatus } from "../../ChatBaseComponent/types";
import { IconArrorDown, IconLink } from "@quantum/icons";
import VoiceButton from '../../VoiceBtn/index.vue';
import FileIcon from '../../iconDocument/FileIcon.vue';
import DropdownMenu from "../../Dropdown";
import { openNativeFile } from '@libs/service';
import Bing from '../ThirdPartyAgent/brand/bingIcon.svg'

interface SourceItem {
  label: string;
  path: string;
  command: (event: any) => void;
}
const props = withDefaults(defineProps<{
  answerItem: Answer | undefined,
  chatAction: Array<ChatMessageType> | [],
  iconToolList?: Array<ToolType>,
}>(), {
  iconToolList: () => [ToolType.Remember, ToolType.Copy, ToolType.VoicePlay],
});
const toast = useToast();

const displayQuestionFiles = computed(() => {
  const files = props.answerItem?.answerData?.queryData?.files || [];
  const urls = props.answerItem?.answerData?.searchUrls || [];
  if (files.length === 0 && urls.length === 0) {
    return [];
  }

  const fileItems = files.map((item) => ({
    label: item.fileName,
    path: item.filePath,
    icon: item.fileBase64 ?
      h('img', {
        src: 'data:image/png;base64,' + item.fileBase64,
        alt: item.fileName,
      }) : h(FileIcon, { iconType: item.fileType }),
    command: (event: any) => {
      openFileItem(event.item);
    }
  } as SourceItem));

  const urlItems = urls.map((item) => ({
    label: item.title,
    path: item.url,
    command: (event: any) => {
      openFileItem(event.item);
    }
  } as SourceItem));

  return [...fileItems, ...urlItems];


});
const openFileItem = async (item: SourceItem) => {
  try {
    await openNativeFile({
      Data: item.path,
    })
  } catch (error) {
    console.log(error);
  }
};
const handleCopy = () => {
  const content = props.answerItem.answerData.content;
  navigator.clipboard.writeText(content).then(() => {
    console.log('Content copied to clipboard');
    toast.add({  detail: 'Content copied to clipboard', life: 3000 });
  }).catch(err => {
    console.error('Failed to copy content: ', err);
    toast.add({  detail: 'Failed to copy content', life: 3000 });
  });
};
const handleShare = () => {
  const content = props.answerItem.answerData.content;
  shareHelper({ Data: { Text: content, SessionId: '' } }).then(res => {
    console.log("shareHelper", res);
  });
};
const handleRemeber = async () => {
  const content = props.answerItem.answerData.content;
  const res = await addMemory({
    Data: {
      userText: content,
      fileList: [],
    },
  });
  if (res.data.Data.Status === "complete") {
    toast.add({  detail: 'Memory Updated!', life: 3000 });
  } else {
    toast.add({  detail: res.data.Data.Text, life: 3000 });
  }
};
// 创建一个 composable 来处理工具配置
const createToolConfigurations = () => {
  const configs: Record<ToolType, {
    component: Component;
    props: Record<string, any>;
    handler: Function;
    icon: Component | null;
  }> = {
    [ToolType.Copy]: {
      component: AiButton,
      props: { category: "action", size: "small" },
      handler: handleCopy,
      icon: IconCopy
    },
    [ToolType.Remember]: {
      component: AiButton,
      props: { category: "action", size: "small" },
      handler: handleRemeber,
      icon: IconMemories
    },
    [ToolType.Share]: {
      component: AiButton,
      props: { category: "action", size: "small" },
      handler: handleShare,
      icon: IconShare
    },
    [ToolType.VoicePlay]: {
      component: VoiceButton,
      props: {
        playContent: props.answerItem?.answerData.content,
        chatAction: props.chatAction,
        answerItem: props.answerItem
      },
      handler: () => { }, // VoiceButton 内部处理逻辑
      icon: null,
    }
  };
  return props.iconToolList.map(tool => configs[tool]);
};

const toolConfigurations = computed(() => createToolConfigurations());
</script>

<style lang="less" scoped>
.source-origin {
  margin-bottom: 16px;
  margin-top: 24px;
  ::v-deep(img) {
    display: inline-block;
    width: 14px;
    height: 14px;
    vertical-align: middle;
  }

  ::v-deep(span) {
    font-size: 12px;
    font-weight: 400;
    line-height: 15px;
    color: var(--color-text-on-surface-variant);
    vertical-align: baseline;
  }
}
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
