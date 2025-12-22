<template>
    <MiniWin class="w-[652px] overflow-hidden smart-editing-container" ref="elRef">
      <Carousel @imageLoad="imageLoad" :images="allImageUrls" :currentImageUrl="currentImageUrl"/>
      <div class="flex mt-[8px] mb-[24px]">
          <AiButton class="!w-[32px] !h-[32px]">
              <IconBack class="w-[16px] h-[16px]" @click="goBack"/>
          </AiButton>
          <AiButton class="smart-editing-btn !h-[32px] ml-[8px] w-[auto]!" @click="gotoSmartLink">
              <IconSmartEditing class="inline-block w-[16px] h-[16px]"/><span class="ml-[4px]">Smart Editing</span>
          </AiButton>
          <AiButton class="!w-[32px] !h-[32px] ml-[8px]" @click="gotoPictureEditor(OPERATE_TYPE.INPAINT)">
              <IconSmartDrawing class="w-[16px] h-[16px]"/>
          </AiButton>
          <AiButton class="!w-[32px] !h-[32px] ml-[8px]" @click="gotoPictureEditor(OPERATE_TYPE.OUTPAINT)">
              <IconArrowMax class="w-[16px] h-[16px]"/>
          </AiButton>
          <AiButton class="!w-[32px] !h-[32px] ml-[8px]" @click="gotoPictureEditor(OPERATE_TYPE.ERASE)">
              <IconCZErase class="w-[16px] h-[16px]"/>
          </AiButton>
          <AiButton class="!w-[32px] !h-[32px] ml-[8px]" @click="gotoPictureEditor(OPERATE_TYPE.CHANGE_BACKGROUND)">
              <IconCZBrush class="w-[16px] h-[16px]"/>
          </AiButton>
          <AnswerToolBar v-if="answerItem" :answerItem="answerItem" :chat-action="chatAction" class="ml-auto p-0!"/>
      </div>
    </MiniWin>
</template>
<script setup lang="ts">
import Carousel from './Carousel.vue';
import { IconBack, IconSmartEditing, IconSmartDrawing, IconArrowMax, IconCZErase, IconCZBrush } from '@quantum/icons';
import { updateWindowSize } from '@/store/window';
import { AiButton } from "@libs/p-comps/volt/QButton";
import { BarStore } from "@/store/bar";
import { computed, onMounted, ref, nextTick } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import { useRouter } from 'vue-router';
import AnswerToolBar from '@libs/p-comps/AnswerCard/Pod6/AnswerToolBar.vue';
import { ChatMessageType } from '@libs/p-comps/ChatBaseComponent/types';
import MiniWin from "@/components/MiniWin";
import { OPERATE_TYPE } from "@/types";
const chatAction = ref<Array<ChatMessageType>>([]);
const allImageUrls = ref<string[]>([]);
const currentImageUrl = ref<string>('');
const elRef = ref<ComponentPublicInstance | null>(null);
const router = useRouter();
const goBack = () => {
    router.go(-1);
};
onMounted(() => {
    const queryObject = history.state.queryObject;
    if (queryObject) {
        chatAction.value = queryObject.chatAction || [];
        allImageUrls.value = queryObject.allImageUrls || [];
        currentImageUrl.value = queryObject.currentImageUrl || '';
        console.log('从CreateZone获取的数据:', queryObject);
    }
});
const imageLoad = () => {
    const ClientRect = elRef.value.$el.getBoundingClientRect();
    updateWindowSize({
        Width: ClientRect.width,
        Height: ClientRect.height,
    });
}
const answerItem = computed(() => {
  return chatAction.value.length > 0 ? chatAction.value[chatAction.value.length - 1] : null;
});
const gotoSmartLink = () => {
  router.push({
      path: "/quantum/creator-zone/create/session",
      query: {
        referenceImageUrl: currentImageUrl.value,
        operateType: OPERATE_TYPE.SMART_EDITING,
      },
    });
};
const gotoPictureEditor = (num: OPERATE_TYPE) => {
    router.push({
      path: "/quantum/creator-zone/editor",
      query: {
        url: "",
        operateType: num,
      },
    });
}
</script>
<style scoped lang="less">
.smart-editing-btn {
    padding: 0 10px;
    & > span {
        color: #001846;
        font-size: 12px;
        font-weight: 500;
    }
}
</style>
