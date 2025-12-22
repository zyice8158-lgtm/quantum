<template>
    <div class="chat-box chat-box-flex">
        <!-- 有数据加一个间距 -->
        <div class="chat-box_region w-full flex flex-col flex-auto gap-[12px] overflow-auto" ref="ContainerRef" :style="{'padding-bottom': chat.chatAction.length > 0 ? '10px' : 0}">
            <!-- <div class="chat-empty-bar" v-if="chat.chatAction.length > 0"></div> -->
            <!-- 遍历 chatAction 并区分类型 -->
            <template v-for="(item, index) in chat.chatAction" :key="index">
                <div>
                    <!-- 有的指令只有答案显示没有问题，这里判空 -->
                    <!-- 问题部分 -->
                    <div v-if="item.getData().type === ChatComponentType.QUERY" class="chat-box_region_content">
                        <QuestionPage :questionItem="item as Question" class="chat-box_content_query">
                            <template #question="item">
                                <slot name="questionSlot" :questions="item.questionItem"></slot>
                            </template>
                        </QuestionPage>
                    </div>
                    <!-- 回答部分 -->
                    <div v-else-if="item.getData().type === ChatComponentType.ANSWER" class="chat-box_region_answer">
                        <AnswerCom :answerItem="item as Answer" class="chat-answer">
                            <template #answer="item">
                                <slot name="answerSlot" :answers="item"></slot>
                            </template>
                        </AnswerCom>
                    </div>
                </div>
            </template>          
        </div>
        <InputView class="chat-box_input mt-[10px]">
            <template #input>
                <slot name="inputSlot"></slot>
            </template>
        </InputView>
        <div class="accuracy-prompt">{{ t('chat.disclaimer') }}</div>
    </div>
</template>

<script setup lang="ts">
import AnswerCom from "./answer/index.vue";
import QuestionPage from "./question/index.vue";
import InputView from "./input/index.vue";
import { useScrollBar } from "../hooks/useScrollBar";
import { ChatController } from '../types/ChatClass'
import { ChatComponentType } from "../types";
import { ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import Answer  from "../types/Answer";
import Question from "../types/Question";
const { t } = useI18n();
const props = defineProps<{
    chat: ChatController | undefined;
}>();
console.log('chatAction-------', props.chat.chatAction);
const ContainerRef = ref<HTMLElement | null>(null);
const isShowArrow = ref(false);
// 使用滚动监听 composable
const { scrollTop, scrollToBottom } = useScrollBar(ContainerRef);
watchEffect(() => {
    props.chat?.setMessageContainerRef(ContainerRef.value);
    const container = ContainerRef.value;
    if(container && container.scrollHeight) {
        const distanceToBottom = container.scrollHeight - scrollTop.value - container.clientHeight;
        console.log('距离底部:', distanceToBottom);
        // 根据需要处理滚动逻辑
        isShowArrow.value = distanceToBottom > 50;
    }
});
defineExpose({ isShowArrow, scrollToChatBottom: scrollToBottom });
</script>

<style scoped lang="less">
.chat-box-flex {
    justify-content: center;
    align-items: center;
    .accuracy-prompt {
        color: rgba(0, 0, 0, 0.38);
        font-size: 11px;
        font-weight: 400;
        padding-top: 6px;
    }
}

.chat-box {
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: auto;
    &_region {
        position: relative;
        mask-image: linear-gradient(to bottom, 
        rgba(0, 0, 0, 1) 0%, 
        rgba(0, 0, 0, 1) calc(100% - 30px), 
        rgba(0, 0, 0, 0) 100%);
        &_content {
            display: flex;
            flex-direction: column;
            flex-wrap: wrap;
            align-content: space-between;
            align-content: flex-end;

            &_query {
                background: rgba(235, 233, 248, 1);
                padding: 8px 24px;
                color: #000;
                font-weight: 400;
                font-size: 14px;
                vertical-align: middle;
                border-top-left-radius: 25px;
                border-bottom-right-radius: 20px;
                border-bottom-left-radius: 25px;
                display: flex;
                width: fit-content;
                word-break: break-all;
                height: 22px;
            }
        }

        &_answer {
            /* margin-top: 24px; */
            /* width: fit-content; */
            display: flex;

        }
    }

    &_input {
        display: flex;
        align-items: center;
        /* margin: 0 auto; */
        /* height: 60px; */
        width: 100%;
        border-radius: 100px;
        /* background: rgba(235, 238, 241, 0.80);
        backdrop-filter: blur(0px); */
    }
    &_content_query {
        max-width: 85%;
    }
}
</style>
