<template>
  <div class="quiz-note-toggle" v-if="isFilesSelect">
    <!-- v-if="props.files?.length > 0|| props.inputValue" -->
    <div class="toggle-container">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        :class="['toggle-btn', { 'active': activeTab === tab.value }]"
        @click="switchTab(tab.value as 'quiz' | 'note' | 'blanknote' | 'record', tab)"
      >
        <QIcons :name="tab.icon" size="14" class="toggle-btn_icon"></QIcons>
        {{ tab.title }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { QIcons } from "@libs/p-comps";
import { useRouter } from "vue-router";
import { ChatController, ChatStatus, QButton } from "@libs/p-comps";
import { EventBus } from "@quantum/use";
import { useLocale } from "@/hooks/i18n";

const router = useRouter();
import {
  setRecordingMethod,
} from "@libs/service";
const props = defineProps<{
  inputValue: {
    type: String,
    default: '',
  },
  inputStatus?: ChatStatus; // 控制输入状态，按钮显示隐藏
  chat: ChatController | undefined;
  isInit: boolean;
  pod?: string;
  customEnterSend?: (inputVal: string) => void;
  files?: any[];
}>();
const { t } = useLocale();

const tabs = computed(() => [
  { value: 'note', title: t('learningZone.summarizeNote'), icon: 'NotesSvg' },
  { value: 'blanknote', title: t('learningZone.blankNote'), icon: 'BlankNotes' },
  { value: 'record', title: t('learningZone.startRecord'), icon: 'recordSvg' },
  { value: 'quiz', title: t('learningZone.takeQuiz'), icon: 'QuizSvg' }
])

// 定义 emits
const emit = defineEmits<{
  tabChange: [tab: string | null]
}>()

const activeTab = ref<string | null>(null)
const isFilesSelect = ref<boolean>(false);
const switchTab = (tab: 'quiz' | 'note' | 'blanknote' | 'record',card:string) => {

  // 如果点击的是当前激活的标签，则取消选择
  if (activeTab.value === tab) {
    activeTab.value = null
    emit('tabChange', null)
  } else {
    activeTab.value = tab
    emit('tabChange', tab)
  }
  console.log(card.title);
  if(card.title === 'Start Recording'){
    try {
      const res =setRecordingMethod({
        Data: {}
      });
      console.log(`Start Recording success`, res);
      router.push({ name: "LearningZoneChat", params: { chatId:'template-notes-recording', cardType: 'notes'},query : {isRecording: true,recordData:JSON.stringify(res)} });
    } catch (err) {
      console.error("Record toggle error:", err);
    }
  }else if(card.title === 'Blank Note'){
    router.push({ name: "LearningZoneChat", params: { chatId:'template-blanknote', cardType: 'notes'},query : {isBlankNote: true,} });
  }else if(card.title === 'Summarize Note'){
    console.log(props.files,props.inputValue);
    if(props.files?.length > 0||props.inputValue){
      router.push({ name: "LearningZoneChat", params: { chatId:'template-summarize', cardType: 'string'},state: {
      queryObject: JSON.parse(JSON.stringify({content: props.inputValue || 'Generate a notes from the content',files:props.files}))
    }});
    }
  }else if(card.title === 'Take Quiz'){
    if(props.files?.length > 0||props.inputValue){
      router.push({ name: "LearningZoneChat", params: { chatId:'template-quiz', cardType: 'string'},state: {
      queryObject: JSON.parse(JSON.stringify({content: props.inputValue || 'Generate a quiz from the content',files:props.files}))
    }});
    }
  }
}

defineExpose({
  activeTab,
  switchTab
})

const handleFilesSelect = (bool: boolean) => {
  isFilesSelect.value=bool;
  console.log('isFilesSelect---------------- types',props.inputValue, isFilesSelect.value);
}

onMounted(() => {
  EventBus.on("filesSelect", handleFilesSelect);
});

onUnmounted(() => {
  EventBus.clear("filesSelect");
});
</script>

<style scoped lang="less">
.quiz-note-toggle {
  width: 100%;
  margin-top: 5px;
}

.toggle-container {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  border-radius: 8px;
  padding: 4px 0px;
  margin-bottom: 5px;
  gap: 5px; /* 使用gap替代margin-right避免最后一个元素多余间距 */
}

.toggle-btn {
  display: flex;
  padding: 5px 12px;
  border: none;
  background: var(--color-surface-blur);
  border-radius: 32px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid var(--color-surface-disabled);
  color: var(--color-focus);
  /* 移除margin-right，使用容器的gap控制间距 */
  .toggle-btn_icon {
    margin: 2px 5px 0 0;
  }
}

// .toggle-btn.active {
//   background: rgba(255, 255, 255, 0.36);
//   color: var(--color-focus);
//   font-weight: 600;
// }
// .toggle-btn:hover {
//   border: 1px solid rgba(255, 255, 255, 0.26);
//   background: rgba(255, 255, 255, 0.36);
//   color: var(--color-focus);
//   font-weight: 600;
// }

</style>
