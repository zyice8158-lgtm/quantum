<template>
    <div class="answer-content">
        <div class="thinking-item" v-for="item in renderItems">
            <div class="thinking-item_after"></div>
            <div class="thinking-item_title">
                <img class="think-loading" :src="thinkLoading" v-if="item.isLoading"/>
                <img class="think-loading" :src="thinkOver" v-else/>
                <div class="name">{{ item.name }}</div>
            </div>
            <div class="thinking-item_content" v-html="item.content"></div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import thinkOver from '../../assets/think-over.png';
import thinkLoading from '../../assets/think-loading.png';
import { computed } from 'vue';
export interface thinkItemI {
    name: string;
    isLoading: boolean;
    content: string;
}
const thinkingItems: thinkItemI[] = [
    {
        name: 'Intent Understanding', // 名称
        isLoading: false,
        content: 'Users want to open the Chrome on the extended screen and then  search coralreefs  lifeline in TED.com'
    },
    {
        name: 'Task Decomposition', // 名称
        isLoading: false,
        content: 'Based on user needs, the requirement can be divided into 4 tasks: Open Chrome Project on my second screen Open Ted.com in new Tab of Chrome Search “coral reefs lifeline'
    },
    {
        name: 'Task Execution', // 名称
        isLoading: true,
        content: 'Open Chrome'
    },
]
const props = withDefaults(defineProps<{ items?: Readonly<thinkItemI[]> }>(), {
  items: undefined,
});

const renderItems = computed<Readonly<thinkItemI[]>>(
  () => (props.items && props.items.length ? props.items : thinkingItems)
);
</script>
<style lang="less" scoped>
    .answer-content {
        max-width: 568px;
        .thinking-item {
            position: relative;
            &_after {
                position: absolute;
                left: 6px;
                width: 2px;
                bottom: 2px;
                background: linear-gradient(133.16deg, #9B79E0 -18.42%, #C27AB9 60.55%);
                top: 20px;
            }
            margin-bottom: 8px;
            &_title {
                display: flex;
                align-items: center;
                height: 22px;
                .think-loading {
                    width: 12px;
                    height: 12px;
                }
                .name {
                    color: transparent;
                    background-image: linear-gradient(129.52deg, #8D64DD -1.25%, #AD57A3 99.78%);
                    background-clip: text;
                    font-weight: 600;
                    font-size: 14px;
                    margin-left: 8px;
                }
            }
            &_content {
                color: rgba(105, 105, 105, 1);
                font-weight: 400;
                font-style: Regular;
                font-size: 12px;
                line-height: 20px;
                padding-left: 20px;
            }
        }
    }
</style>