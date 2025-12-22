<template>
    <div class="cmu-reply-bar">
        <div class="cmu-reply-bar-title">
            <IconArrowLeft @click="emit('toggleBarTitle', '')" class="reply-back text-[var(--color-text-on-surface-muted)]" v-automation="'cmu_reply_back_btn'"/>
            <span class="title-text" v-automation="'cmu_reply_bar_title'">{{ title }}</span>
        </div>
        <div class="cmu-reply-bar-content">
            <div class="cmu-reply-bar-item" v-for="item in answerTopics" :key="item.title">
                <div class="reply-info">
                    <img :src="item.icon" class="w-[55px] h-[55px]" v-automation="'cmu_reply_item_img'"/>
                    <div class="reply-bar-item-content">
                        <div class="title" v-automation="'cmu_reply_item_title'">{{ item.title }}</div>
                        <div :title="item.summary" class="content truncate" v-automation="'cmu_reply_item_content'">{{ item.summary }}</div>
                    </div>
                </div>
                <div class="reply-handle-bar" v-if="catchMeUpMap[item.title].currentStatus === CMUBarStatus.replyInput">
                    <div class="relative flex-1 ml-[6px]">
                        <InputText @keyup.enter="sendMsgToUser(item)" size="large" v-model="catchMeUpMap[item.title].inputText" placeholder="Type your message here..." pt:root="pe-10 bg-[rgba(208,188,255,0.18)]" />
                        <IconGreySend @click="sendMsgToUser(item)" class="text-[32px] absolute top-1/2 -translate-y-1/2 text-surface-400 leading-none end-3 z-1"/>
                    </div>
                </div>
                <div class="reply-handle-bar" v-else-if="catchMeUpMap[item.title].currentStatus === CMUBarStatus.loading">
                    <div class="reply-handle-loading">
                        <svg viewBox="0 0 100 100" width="100%" height="100%">
                            <circle cx="50" cy="50" r="45" fill="none" stroke-width="8" stroke-dasharray="62.8318, 188.4956"
                                transform="rotate(-90, 50, 50)"
                                stroke="currentColor">
                            </circle>
                        </svg>
                    </div>
                    <div>Sending message...</div>
                </div>
                <div class="reply-handle-bar" v-else-if="catchMeUpMap[item.title].currentStatus === CMUBarStatus.success">
                    <div class="msg-send">Message Successfully</div>
                </div>
                <div class="reply-handle-bar" v-else-if="catchMeUpMap[item.title].currentStatus === CMUBarStatus.done">
                    <div v-for="actionItem in item.displayActions" :class="['handle-btn', { active: judgeBtnActive(item.title, actionItem.title), hide: (actionItem.type === 'remoteInput' && replyBtnTitles[title].includes(item.title)) }]" @click="handleBtn(item, actionItem.title, actionItem)">
                        {{ actionItem.title }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { IconArrowLeft, IconGreySend } from '@quantum/icons';
import InputText from "../../../../volt/InputText.vue";
import { AvatarItem } from "../index.vue";
import { replyCatchMeUp } from '@libs/service/fetch';
import { useToast } from "primevue/usetoast";
import { CMUBarStatus } from '../../../../ChatBaseComponent/types';
interface CatchMeUpItem {
     currentStatus: CMUBarStatus;
     inputText: string;
}
interface ActionItemI {
    id: string;
    title: string;
    type: string;
}
const props = defineProps({
    title: String,
    replyBtnTitles: Object,
    answerTopics: Array<AvatarItem>
});
const toast = useToast();
console.log('answerTopics222----------', props.answerTopics);
const emit = defineEmits(['toggleBarTitle', 'syncReplyStatus']);
const currentActiveItem = reactive({
    title: '', // 标题
    actionTitle: '', // 操作类型
});
const catchMeUpMap = reactive<Record<string, CatchMeUpItem>>({});
onMounted(() => {
    const titles = props.answerTopics.map((item) => item.title);
    titles.forEach((title: string) => {
        catchMeUpMap[title] = {
            currentStatus: CMUBarStatus.done,
            inputText: '',
        };
    });
});
const judgeBtnActive = (title: string, actionTitle: string) => {
    return currentActiveItem.title === title && currentActiveItem.actionTitle === actionTitle;
}
const sendMsgToUser = async (item: AvatarItem) => {
    const actionItem = item.displayActions.find((ite) => ite.title === currentActiveItem.actionTitle);
    const notificationKey = actionItem ? item.displayActions.find((ite) => ite.type === actionItem.type).id : '';
    try {
        catchMeUpMap[item.title].currentStatus = CMUBarStatus.loading;
        const res = await replyCatchMeUp({
            "notificationKey": notificationKey,
            "deviceId": item.app_info[0].deviceId,
            "actionName": actionItem ? actionItem.title : '',
            "actionData": catchMeUpMap[item.title].inputText,
            "actionType": actionItem.type,
        });
        console.log('handleCatchReply------', res);
        if(res.data.Success) {
            setTimeout(() => {
                catchMeUpMap[item.title].currentStatus = CMUBarStatus.success;
                emit('syncReplyStatus', { title: item.title, actionTitle: actionItem.title });
            }, 500);
            setTimeout(() => {
                catchMeUpMap[item.title].currentStatus = CMUBarStatus.done;
            }, 1500);
        } else {
            catchMeUpMap[item.title].currentStatus = CMUBarStatus.replyInput;
            toast.add({
                severity: "error",
                summary:"Http Error failed",
                life: 2000,
            });
        }
    } catch(error) {
        console.log(error);
    }
}
const handleBtn = (item: AvatarItem, actionTitle: string, actionItem: ActionItemI) => {
    console.log('handleBtn111', item, actionTitle, actionItem);
    currentActiveItem.title = item.title;
    currentActiveItem.actionTitle = actionTitle;
    if(actionItem.type === 'remoteInput') {
        catchMeUpMap[item.title].currentStatus = CMUBarStatus.replyInput;
    } else {
        sendMsgToUser(item);
    }
}
</script>
<style scoped lang="less">
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.cmu-reply-bar {
    &-title {
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 700;
        padding: 10px 0;
        border-bottom: 1px solid rgba(208, 188, 255, 0.12);
        .reply-back {
            cursor: pointer;
        }
        .title-text {
            margin-left: 14px;
            color: var(--color-focus);
        }
    }
    &-content {
        .cmu-reply-bar-item {
            padding: 20px;
            border-bottom: 1px solid rgba(208, 188, 255, 0.12);
            .reply-info {
                display: flex;
                align-items: center;
                & > img {
                    margin-right: 14px;
                }
                color: rgba(69, 70, 73, 1);
                .reply-bar-item-content {
                    font-size: 14px;
                    width: calc(100% - 70px);
                    .title {
                        font-family: Rookery Medium;
                    }
                    .content {
                        font-weight: 400;
                    }
                }
            }
            .reply-handle-bar {
                display: flex;
                align-items: center;
                margin-top: 10px;
                .reply-handle-loading {
                    animation: spin 2s linear infinite;
                    & > svg {
                        width: 24px;
                        height: 24px;
                        color: var(--color-primary-primary);
                    }
                }
                .msg-send {
                    color:#3E8643;
                    font-size: 14px;
                    margin-left: 8px;
                }
                .msg-send-icon {
                    width: 24px;
                    height: 24px;
                }
                input {
                    width: 100%;
                }
                svg {
                    cursor: pointer;
                }
                & > div {
                    margin-right: 8px;
                }
                .handle-btn {
                    width: 66px;
                    height: 32px;
                    line-height: 32px;
                    border-radius: 12px;
                    border: 1px solid #0E131E;
                    text-align: center;
                    font-size: 12px;
                    cursor: pointer;
                    font-weight: 500;
                    font-family: "Rookery Medium";
                    &.active {
                        background-color: rgba(0, 0, 0, 0.12);
                    }
                    &.hide {
                        display: none;
                    }
                }
            }
        }
    }
}
.example-container {
  padding: 20px;
}

.trigger-btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.context-area {
  width: 300px;
  height: 200px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  user-select: none;
}

.dropdown-menu {
  min-width: 150px;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f5f5f5;
}
</style>
