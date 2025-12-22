<template>
  <div class="note-card">
    <div class="note-header">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.25 0C14.183 0 15.75 1.567 15.75 3.5V12.25C15.75 14.183 14.183 15.75 12.25 15.75H3.5C1.567 15.75 0 14.183 0 12.25V3.5C0 1.567 1.567 0 3.5 0H12.25ZM12.25 1.75H3.5C2.5335 1.75 1.75 2.5335 1.75 3.5V12.25C1.75 13.2165 2.5335 14 3.5 14H12.25C13.2165 14 14 13.2165 14 12.25V3.5C14 2.5335 13.2165 1.75 12.25 1.75ZM12.25 3.5H3.5V5.25H12.25V3.5ZM12.25 7H3.5V8.75H12.25V7ZM3.5 10.5H9.625V12.25H3.5V10.5Z" fill="#855EE1"/>
      </svg>
      <div class="header-text">
        {{ t('learningZone.notesGenerated') }}
      </div>
      <IconNoteCard class="cursor-pointer"></IconNoteCard>
      <!-- <div class="view-link" @click="handleViewClick">View</div> -->
    </div>
		<div class="note-footer">
			<AnswerToolBar></AnswerToolBar>
			<!-- <div class="save-note">Save to Note</div>
			<div class="export-more">
				Explore more in <span class="export-more_text">Learning Zone</span> 
				<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M5.25 2.25H9V3.75H5.25C4.42157 3.75 3.75 4.42157 3.75 5.25V12.75C3.75 13.5784 4.42157 14.25 5.25 14.25H12.75C13.5784 14.25 14.25 13.5784 14.25 12.75V9H15.75V12.75C15.75 14.4069 14.4069 15.75 12.75 15.75H5.25C3.59315 15.75 2.25 14.4069 2.25 12.75V5.25C2.25 3.59315 3.59315 2.25 5.25 2.25Z" fill="#92908F"/>
					<path d="M15.75 7.5V3.75C15.75 2.92157 15.0784 2.25 14.25 2.25H10.5V3.75H13.1894L7.41966 9.51973L8.48032 10.5804L14.25 4.81071V7.5H15.75Z" fill="#92908F"/>
				</svg>
			</div> -->
		</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AnswerToolBar from '../Pod6/AnswerToolBar.vue';
import { ChatController, ChatStatus } from '../../index';
import { IconNoteCard } from '@quantum/icons';
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
const handleViewClick = () => {
  ChatEventBus.emit('openLZNote', {
    chatId: props.chat?.chatUid,
    messageId: (props as any)?.answerItem?.id || ''
  });
};

</script>

<style scoped lang="less">
.note-card {
  background: white;
  border-radius: 24px;
  padding: 0px 12px 0px 12px;
  //  width: 529px;

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
			width: 107px;
			height: 32px;
			color: #5F5E60;
			font-weight: 700;
			font-size: 11px;
			line-height: 32px;
			border-radius: 16px;
			text-align: center;
			border: 1px solid #5F5E60;
			cursor: pointer;
		}
		.export-more {
			display: flex;
			font-weight: 400;
			font-size: 14px;
			line-height: 20px;
			border-top: 1px solid #92908F;
			padding-top: 15px;
			margin-top: 15px;
			cursor: pointer;
			span{
				background: linear-gradient(to right, #648BFF, #B273EF);
				-webkit-background-clip: text;
				-webkit-text-fill-color: transparent;
				background-clip: text;
				color: transparent;
				margin-left: 5px;
				font-weight: 600;
			}
			svg{
				margin-left: 5px;
			}
		}

	}
}
</style>
