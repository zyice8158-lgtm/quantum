<template>
    <div class="event-time">
        <div class="event-time-found">{{ t('eventTime.found') }}</div>
        <div class="event-time-title">{{ answerItem.answerData.content.title }}</div>
        <div class="event-time-list">
            <div class="event-time-row">
                <div class="event-time-item" v-for="(item, index) in answerItem.answerData.content.eventList" :key="index" @click="handleEventSelect(item)">
                    <div class="event-time-item_title">
                        <div>{{ item.title }}</div><div>{{ item.time }}</div>
                    </div>
                    <div class="event-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { ChatController, AnswerActionType } from '../../index';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
// 导入view.png图片

const props = defineProps<{
    answerItem: {
        answerData: {
            content: {
                title: string;
                eventList: Array<{
                    title: string;
                    time: string;
                }>
            }
        }
    },
    chat: ChatController | undefined,
}>();
const currentEvent = ref(null);

// 处理事件选择
const handleEventSelect = (event: { title: string; time: string }) => {
    console.log('Selected event:', event);
    if (props.chat instanceof ChatController) {
        const meetingDetails = `Here are your meeting details:\n\nDate: June 11th, 2024\nTime: 3:55 PM\nLocation: South Hall, Room 115`;
        props.chat.setAnswerTools(meetingDetails, AnswerActionType.TEXT_POD1);
    }
};
</script>
<style lang="less" scoped>
.event-time {
    background-color: var(--color-surface);
    border-radius: 8px;
    padding: 16px;
    margin: 8px 0;
    position: relative;
    overflow: hidden;
    width: 100%;

    .event-time-found {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
        color: var(--color-primary-primary);
        line-height: 1.5;
    }

    .event-time-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--color-text-on-surface-variant);
        line-height: 1.5;
    }

    .event-time-list {
        width: 100%;
    }

    .event-time-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 12px;

        &:last-child {
            margin-bottom: 0;
        }
    }

    .event-time-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        background-color: var(--color-surface-container);
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        height: 41px;
        max-width: 342px;
        white-space: nowrap;
        flex-shrink: 0;

        &:hover {
            background-color: var(--color-surface-container-highest);
        }

        &:active {
            background-color: var(--color-surface-container-highest);
        }

        &_title {
            display: flex;
            align-items: center;
            gap: 8px;

            div {
                font-size: 16px;
                color: var(--color-text-on-surface);

                &:first-child {
                    font-weight: 500;
                }

                &:last-child {
                    font-weight: 400;
                    color: var(--color-text-on-surface);
                }
            }
        }

        .event-arrow {
            margin-left: 8px;
            color: var(--color-text-on-surface);

            svg {
                width: 16px;
                height: 16px;
                transition: transform 0.2s ease;
            }
        }
    }
}

</style>
