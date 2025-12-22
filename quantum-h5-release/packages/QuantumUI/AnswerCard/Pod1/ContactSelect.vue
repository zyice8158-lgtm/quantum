<template>
  <div class="contact-select-container">
    <div class="contact-select-title">{{ contactData.title || 'Select a contact' }}</div>
    <div class="contact-list">
      <div
        v-for="contact in contactData.contacts"
        :key="contact.id"
        :class="['contact-item', { 'selected': selectedContact?.id === contact.id, 'disabled': selectedContact && selectedContact.id !== contact.id }]"
        @click="handleContactSelect(contact)"
        :disabled="selectedContact && selectedContact.id !== contact.id"
      >
        <img
          :src="getContactAvatar(contact)"
          :alt="contact.name"
          class="contact-avatar"
          :class="{ 'grayed-out': selectedContact && selectedContact.id !== contact.id }"
        />
        <div class="contact-info" :class="{ 'grayed-out': selectedContact && selectedContact.id !== contact.id }">
          <div class="contact-name">{{ contact.name }}</div>
          <div class="contact-position">{{ contact.position }}</div>
          <div class="contact-email" v-if="contact.email">{{ contact.email }}</div>
        </div>
        <div class="contact-arrow">
          <img
            :src="ArrowOutward"
            :alt="'Arrow outward'"
            :class="{ 'grayed-out': selectedContact && selectedContact.id !== contact.id }"
          />
        </div>
        <div v-if="selectedContact?.id === contact.id" class="selected-indicator"></div>
        <transition name="expand">
          <div v-if="selectedContact?.id === contact.id && contact.available_slots" class="available-slots">
            <div class="slots-title">Available Meeting Slots:</div>
            <div class="slots-list">
              <span v-for="(slot, index) in contact.available_slots" :key="index" class="slot-item">
                {{ slot }}
              </span>
            </div>
          </div>
        </transition>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChatController } from '../../ChatBaseComponent';
import Tom from '../../assets/icon/Tom.png';
import ArrowOutward from '../../assets/icon/arrow_outward.png';

const props = defineProps<{
  answerItem: {
    content: any
  },
  chat: {
    controller?: ChatController
  }
}>();

interface Contact {
  id: string;
  name: string;
  position: string;
  avatar: string;
  email?: string;
  department?: string;
  available_slots?: string[];
}

interface ContactData {
  title: string;
  contacts: Contact[];
}

// 选中的联系人
const selectedContact = ref<Contact | null>(null);

const contactData = computed<ContactData>(() => {
  try {
    let content;
    if (props.answerItem?.content) {
      content = props.answerItem.content;
    } else if (props.answerItem?.answerData?.content) {
      const str = props.answerItem.answerData.content;
      content = typeof str === 'string' ? JSON.parse(str) : str;
    }

    if (content?.responseType === 'ContactSelectResponse' && content?.content) {
      return content.content;
    } else if (content?.title && content?.contacts) {
      return content;
    }

    return {
      title: '',
      contacts: []
    };
  } catch (error) {
    console.error('Failed to parse contact data:', error);
    return {
      title: '',
      contacts: []
    };
  }
});

// 获取联系人头像
const getContactAvatar = (contact: Contact) => {
  if (contact.name.includes('Tom')) {
    return Tom;
  }
  return contact.avatar || '';
};

// 处理联系人选择

const handleContactSelect = (contact: Contact) => {
  // 如果已经有选中的联系人，并且不是当前联系人，则不允许选择
  if (selectedContact.value && selectedContact.value.id !== contact.id) {
    return;
  }

  console.log('Selected contact:', contact);

  // 设置选中的联系人
  selectedContact.value = contact;

  // 记录选择到元数据
  if (props.answerItem?.content?.internal_metadata) {
    if (!props.answerItem.content.internal_metadata.contact_select_cache) {
      props.answerItem.content.internal_metadata.contact_select_cache = {};
    }
    props.answerItem.content.internal_metadata.contact_select_cache.selected_contact = contact;
    props.answerItem.content.internal_metadata.contact_select_cache.timestamp = new Date().toISOString();
  }

  // 将选择的联系人信息通过ChatController发送
  if (props.chat?.controller instanceof ChatController) {
    const message = contact.department
      ? `I want to schedule with ${contact.name} from ${contact.department} department`
      : `I want to schedule with ${contact.name}`;
    props.chat.controller.sendMessage(message);
  }
};
</script>

<style scoped lang="less">
.contact-select-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 716px;
  margin: 8px auto;
}

.contact-select-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333333;
  line-height: 1.5;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  margin: 0 auto;
  max-height: calc(5 * 41px);
  overflow-y: auto;
  overflow-x: hidden;
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 0 12px;
  background-color: #FBF9F7;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  position: relative;
  overflow: hidden;
  height: 41px;
  width: 100%;
  margin: 0 auto;
  border-radius: 50px;
  margin-bottom: 6px;
  flex-shrink: 0; /* 确保项目不会被压缩 */

  &:hover:not(.disabled):not(.selected) {
    background-color: #F3F1ED;
    transform: none;
  }

  &:active:not(.disabled):not(.selected) {
    background-color: #EBE8E1;
  }

  &.selected {
    background-color: #D0BCFF3D;
    cursor: default;

    .contact-name,
    .contact-position {
      color: #333333;
    }
  }

  &.disabled {
    cursor: default;
    position: relative;
    background-color: #FBF9F7;
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.5);
      pointer-events: none;
    }
  }
}

.contact-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
  transition: filter 0.2s ease;
}

.contact-info {
  flex: 1;
  transition: opacity 0.2s ease;

  &.grayed-out {
    opacity: 0.7;
  }
}

.contact-name {
  font-weight: 500;
  font-size: 14px;
  transition: color 0.2s ease;
}

.contact-position {
  font-size: 12px;
  color: #666666;
  transition: color 0.2s ease;
}

.contact-email {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
  font-style: italic;
}


.department-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #e2e8f0;
  color: #475569;
  font-size: 11px;
  font-weight: 500;
}

/* Available slots styles */
.available-slots {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #cbd5e1;
  width: 100%;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slots-title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.slots-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.slot-item {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  background-color: #f0f9ff;
  color: #0369a1;
  font-size: 12px;
}

/* Expand transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.contact-arrow {
  margin-left: 8px;
  transition: opacity 0.2s ease;

  img {
    width: 20px;
    height: 20px;
    transition: filter 0.2s ease;

    &.grayed-out {
      filter: grayscale(100%);
      opacity: 0.5;
    }
  }
}

.selected-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

@keyframes dialogAppear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.dialog-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-icon {
  flex-shrink: 0;
}

.dialog-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.dialog-message {
  font-size: 14px;
  color: #e0e0e0;
}
</style>
