<template>
  <div class="note-card">
    <div class="note-header">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.25 0C14.183 0 15.75 1.567 15.75 3.5V12.25C15.75 14.183 14.183 15.75 12.25 15.75H3.5C1.567 15.75 0 14.183 0 12.25V3.5C0 1.567 1.567 0 3.5 0H12.25ZM12.25 1.75H3.5C2.5335 1.75 1.75 2.5335 1.75 3.5V12.25C1.75 13.2165 2.5335 14 3.5 14H12.25C13.2165 14 14 13.2165 14 12.25V3.5C14 2.5335 13.2165 1.75 12.25 1.75ZM12.25 3.5H3.5V5.25H12.25V3.5ZM12.25 7H3.5V8.75H12.25V7ZM3.5 10.5H9.625V12.25H3.5V10.5Z" fill="#855EE1"/>
      </svg>
      <div class="header-text">
        {{ t('learningZone.notesGenerated') }}
      </div>
    </div>
    <div></div>
		<div class="note-footer">
			<div class="save-note" @click="handleInsertClick">{{ t('learningZone.insertRecordingNote') }}</div>
			<AnswerToolBar></AnswerToolBar>
		</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AnswerToolBar from '../Pod6/AnswerToolBar.vue';
import { ChatController, ChatStatus } from '../../index';
import { ChatEventBus } from "../../ChatBaseComponent/types/AIServiceGateway";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps<{
  noTool?: boolean,
  answerItem: {
    chatStatusAnswer: {
      value: ChatStatus
    }
    answerData: {
      content: string;
      payload: {
        isShowOffline?: boolean;
        isShowApp?: boolean;
      }
    }
  },
  chat: ChatController | undefined,
}>();
onMounted(() => {
  console.log(props.answerItem, '--------props.answerItem 123--------------');
});
const handleInsertClick = () => {
  ChatEventBus.emit('openLZRecordNote', {
    chatId: props.chat?.chatUid,
    recordData: props.answerItem,
    messageId: (props as any)?.answerItem?.id || ''
  });
};

</script>

<style scoped lang="less">
.note-card {
  background: white;
  border-radius: 24px;
  padding: 24px 12px;
//   width: 529px;

  .note-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    svg {
      margin:2px 8px;
    }

    .header-text {
      flex: 1;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      color: #855EE1;
      cursor: default;
    }

    .view-link {
      color: rgba(14, 119, 218, 1);
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      margin-left: 19px;
      margin-right: 12px;
      cursor: pointer;
    }
  }
	.note-footer {
		margin: 15px 10px 0px 10px;
		.save-note {
			width: 166px;
			height: 32px;
			color: #0E131E;
			font-weight: 500;
			font-size: 11px;
			line-height: 32px;
			border-radius: 16px;
			text-align: center;
			border: 1px solid #5F5E60;
			cursor: pointer;
		}

	}
}
</style>
