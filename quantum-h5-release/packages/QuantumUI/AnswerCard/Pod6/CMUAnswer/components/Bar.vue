<template>
    <!-- 输入框 -->
    <div v-if="isShowInput" class="chat-input-row">
        <div class="chat-input-bar">
            <div class="input-left" :style="props.getAppStyle(props.item)">
                <img :src="props.getAppIcon(props.item)" :alt="props.getAppName(props.item)">
            </div>
            <input class="chat-input" type="text" placeholder="Type a message..." v-model="chatInputValue" />
            <div class="input-actions">
                <img class="icon-btn" src="../../../../assets/icon/add.svg" />
                <img class="icon-btn" src="../../../../assets/icon/voice.svg" />
            </div>
        </div>
        <div @click="sendMessage" class="chat-input-btn" style="background: #855EE1;border-radius: 50%;"
            v-if="chatInputValue">
            <img src="../../../../assets/icon/send.svg" alt="发送">
        </div>
        <div class="chat-input-btn" v-else @click="closeReplyMessage">
            <img class="icon-btn" src="../../../../assets/icon/close.svg" alt="关闭" />
        </div>
    </div>

    <!-- 发送中/成功/失败状态合并 -->
    <div v-else-if="sendStatusContent" class="chat-input-send">
        <div class="chat-input-send-item">
            <div v-if="sendStatusContent.icon" class="chat-input-send-item-avatar">
                <img :src="sendStatusContent.icon" :alt="sendStatusContent.icon">
            </div>
            <div class="chat-input-send-item-content">
                <p>{{ sendStatusContent.text }}</p>
            </div>
        </div>
    </div>
    <!-- 默认状态  -->
    <div v-else class="action-buttons">
        <div class="notification-author" v-if="item.packageName?.toLowerCase().includes('outlook')">
            <QIcons name="computer" size="21"/>
            <p>John's ThinkBook</p>
        </div>
        <div class="notification-author" v-else>
            <QIcons name="mobilePhone"/>
            <p>John’s Moto Razr</p>
        </div>
        <div class="notification-buttons" v-if="item.actions && item.actions.length > 0">
            <button :class="['action-btn', { active: ite.type === 'remoteInput' }]" v-for="ite in item.actions" :key="ite.id" @click="handleAction(ite)">
                {{ ite.title }}
            </button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { QIcons } from '../../../../../QuantumUI';
import iconSuccessful from '../../../../assets/icon/successful.svg';
import iconErrorIcon from '../../../../assets/icon/ErrorIcon.svg';
import '../index.less';
import { sendCMUReply } from '@libs/service';
interface IteItem {
    id: string;
    title: string;
    type: string;
}
interface AvatarItem {
    title: string;
    message?: string;
    notifications?: string[];
    actions?: IteItem[];
    lenovoId: string;
    deviceId: string;
    packageName: string;
}


const props = defineProps<{
    item: AvatarItem
    getAppIcon: (item: AvatarItem) => string
    getAppName: (item: AvatarItem) => string
    getAppStyle: (item: AvatarItem) => string
}>();

const currentTitle = ref('')
const chatInputValue = ref('');
const currentItem = reactive({
    notifcationKey: '',
    lenovoId: '',
    deviceId: ''
});
const isShowInput = ref<boolean>(false);
const currentState = ref<string>('');

const sendStatusContent = computed(() => {
    if (currentState.value === 'sending') {
        return { icon: '', text: 'Sending...' };
    } else if (currentState.value === 'success') {
        return { icon: iconSuccessful, text: 'Your message has been sent' };
    } else if (currentState.value === 'error') {
        return { icon: iconErrorIcon, text: 'Reply failed. Please try again.' };
    }
    return null;
});

const handleAction = (ite: IteItem) => {
    currentTitle.value = ite.title;
    currentItem.notifcationKey = ite.id;
    currentItem.lenovoId = props.item.lenovoId;
    currentItem.deviceId = props.item.deviceId;
    console.log('currentItem', currentItem);
    if(ite.type === 'remoteInput') {
        isShowInput.value = true;
    } else {
        sendMessage();
    }
}

const sendMessage = async () => {
   console.log('sendReplyMessage------');
    currentState.value = 'sending';
    const params = {
        "lenovoId": currentItem.lenovoId,
        "notificationKey": currentItem.notifcationKey,
        "deviceId":currentItem.deviceId,
        "actionName": currentTitle.value
    }
    if(chatInputValue.value) {
        params.actionData = chatInputValue.value;
    }
    isShowInput.value = false;
    try {
        const replyRes = await sendCMUReply(params);
        console.log('replyRes', replyRes);
        currentState.value = 'success';
    } catch (e) {
        currentState.value = 'error';
    } finally {
        chatInputValue.value = '';
        setTimeout(() => {
            currentState.value = '';
        }, 1000);
    }
}

const closeReplyMessage = () => {
    isShowInput.value = false;
}

</script>
<style lang="less" scoped></style>