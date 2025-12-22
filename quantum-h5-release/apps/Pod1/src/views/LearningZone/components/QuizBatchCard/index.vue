<template>
  <div class="quiz-batch-card">
    <!-- header -->
    <div class="header">
      <div class="back-btn" @click="props.changeQuizCard(1)">
        <IconBack />
      </div>
      <div class="title">{{ t('learningZone.aiQuizzes') }}</div>
    </div>
    <!-- Results Summary -->
    <div class="results-summary">{{ t('learningZone.congratulationsOnCompleting') }}</div>

    <!-- Selection Instruction -->
    <div class="selection-instruction">
       <div class="checkbox-container" @click="toggleSelectAll">
         <div class="select-group-icon">
           <IconCheck v-if="isAllSelected" />
           <IconCheckCircle v-else />
         </div>
         <span class="instruction-text"
           >{{ t('learningZone.selectQuestionsToRetest') }}</span
         >
       </div>
    </div>

    <!-- Questions List -->
    <div class="questions-list">
      <div
        v-for="item in quizList"
        :key="item.id"
        class="question-item"
        :class="{ selected: isQuestionSelected(item.id) }"
        @click="toggleQuestionSelection(item.id)"
      >
        <div class="select-group-icon">
          <IconCheck v-if="isQuestionSelected(item.id)" />
          <IconCheckCircle v-else />
        </div>
        <span class="question-text"> {{ item.id }}. {{ item.question }} </span>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="bottom-section">
      <span class="selected-count">{{ t('learningZone.selected') }} {{ selectedCount }}</span>
      <Button
        class="add-quiz-btn"
        @click="handleBatchAddToBank"
        :disabled="selectedCount === 0"
      >
        <IconAddBank class="icon-18" />
        {{ t('learningZone.quizBank') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { IconAddBank, IconBack, IconCheck, IconCheckCircle } from "@quantum/icons";
import { useQuiz } from "@libs/p-comps/ChatBaseComponent";
import Button from "@libs/p-comps/volt/Button.vue";
import { batchAddToFavorites } from '../../../../store/lz';
import { LzBankKind, Card } from '../../../../types/lz';
import { useToast } from 'primevue/usetoast';
import { useLocale } from "@/hooks/i18n";

const props = defineProps<{
  changeQuizCard: (step: number) => void;
}>();

const { quizList } = useQuiz();
const toast = useToast();
const { t } = useLocale();

// 使用 inject 获取父组件提供的数据
const currentChatId = inject<string>('currentChatId');
const currentMessageId = inject<string>('currentMessageId');

const selectAll = ref(false);
const selectedQuestionIds = ref<string[]>([]);

// 判断题目是否被选中
const isQuestionSelected = (questionId: string) => {
  return selectedQuestionIds.value.includes(questionId);
};

// 选中数量计算
const selectedCount = computed(() => {
  return selectedQuestionIds.value.length;
});

// 全选状态计算
const isAllSelected = computed(() => {
  return quizList.value.length > 0 && selectedQuestionIds.value.length === quizList.value.length;
});

const toggleSelectAll = () => {
  if (!isAllSelected.value) {
    // 全选：将所有题目ID添加到选中列表
    selectedQuestionIds.value = quizList.value.map(q => q.id);
  } else {
    // 取消全选：清空选中列表
    selectedQuestionIds.value = [];
  }
};

// 切换单个题目选中状态
const toggleQuestionSelection = (questionId: string) => {
  const index = selectedQuestionIds.value.indexOf(questionId);
  if (index > -1) {
    // 已选中，移除
    selectedQuestionIds.value.splice(index, 1);
  } else {
    // 未选中，添加
    selectedQuestionIds.value.push(questionId);
  }

  // 更新全选状态
  updateSelectAllState();
};

// 更新全选状态
const updateSelectAllState = () => {
  selectAll.value = isAllSelected.value;
};

// 批量添加到题库
const handleBatchAddToBank = async () => {
  if (selectedQuestionIds.value.length === 0) {
    toast.add({ severity: 'warn', summary: 'Please select the question first.', life: 2000 });
    return;
  }

  try {
    // 批量创建卡片数组
    const cards: Card[] = selectedQuestionIds.value
      .map(questionId => {
        const question = quizList.value.find(q => q.id === questionId);
        if (question) {
          return {
            title: question.type || 'Quiz',
            description: question.question || '',
            createdDate: Date.now(),
            type: LzBankKind.Quiz,
            chatId: currentChatId || '',
            chatMessageId: currentMessageId || '',
            quizId: questionId
          } as Card;
        }
        return null;
      })
      .filter(Boolean) as Card[];

    const addedCount = await batchAddToFavorites(cards);

    toast.add({
      severity: 'success',
      summary: `Added to My Quiz Bank`,
      life: 2000
    });

    // 清空选择
    selectedQuestionIds.value = [];
    selectAll.value = false;

    props.changeQuizCard(3);
  } catch (error) {
    console.error('批量添加失败:', error);
    toast.add({
      severity: 'error',
      summary: 'Failed to add questions to Quiz Bank',
      life: 3000
    });
  }
};
</script>

<style lang="less" scoped>
.quiz-batch-card {
  min-height: 728px;
  max-height: 728px; // todo
  width: 667px;
  background: rgba(255, 255, 255, 0.6);
  padding: 12px 12px 0 12px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  .header {
    display: flex;
    align-items: center;
    height: 32px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 21px;

    .back-btn {
      background: #fff;
      border: none;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 8px;
      cursor: pointer;
      border-radius: 16px;
      width: 32px;
      height: 32px;
    }

    .title {
      font-size: 16px;
      line-height: 20px;
      font-weight: 700;
      color: rgba(14, 19, 30, 1);
      margin: 0;
    }
  }

  .results-summary {
    margin-left: 4px;
    text-align: left;
    margin-bottom: 12px;
    background: linear-gradient(to right, #648BFF, #B273EF);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 20px;
    font-weight: 700;
    line-height: 26px;
  }

  .selection-instruction {
    margin-bottom: 5px;
    margin-left: 10px;

    .checkbox-container {
      display: flex;
      align-items: center;
      cursor: pointer;
      height: 20px;

      .question-item-icon {
        margin-right: 0;
        width: 20px;
        height: 20px;

        svg {
          width: 20px;
          height: 20px;
        }

        &.partially-selected {
          opacity: 0.6;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 8px;
            height: 8px;
            background: #5c8dff;
            border-radius: 50%;
          }
        }
      }
    }

    .instruction-text {
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
    }
  }

  .questions-list {
    overflow: auto;
    flex: 1;
    // 使用mask实现上下渐变效果
    -webkit-mask: linear-gradient(
      to bottom,
      transparent 0px,
      0px,
      black calc(100% - 30px),
      transparent 100%
    );
    mask: linear-gradient(
      to bottom,
      transparent 0px,
      0px,
      black calc(100% - 30px),
      transparent 100%
    );
    .question-item {
      background: rgba(255, 255, 255, 0.5);
      border-radius: 36px;
      height: 48px;
      margin-top: 12px;
      padding: 0 10px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      transition: all 0.2s;
      cursor: pointer;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;

      &:last-child {
        margin-bottom: 12px;
      }
      &.selected {
        background: #fff;
      }

      .question-label {
        display: flex;
        align-items: center;
        cursor: pointer;
        gap: 6px;
        height: 20px;
      }
    }
  }

  .bottom-section {
    height: 61px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;

    .selected-count {
      color: rgba(14, 19, 30, 1);
      font-size: 14px;
      font-weight: 400;
      margin-left: 14px;
    }

    .add-quiz-btn {
      position: absolute !important;
      left: 50% !important;
      transform: translate(-50%, 50%) !important;
      bottom: 50% !important;
      background: #fff !important;
      height: 32px !important;
      width: 119px !important;
      color: rgba(22, 28, 39, 1) !important;
      border: none !important;
      border-radius: 16px !important;
      font-size: 12px !important;
      font-weight: 700 !important;
      cursor: pointer !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 8px !important;
      transition: all 0.2s !important;

      :deep(.icon-18) {
        font-size: 18px;
      }

      &:hover:not(:disabled) {
        background: rgba(133, 94, 225, 1) !important;
        color: #fff !important;
      }
    }
  }
}
.select-group-icon {
  margin-right: 6px;
  width: 24px;
  height: 24px;
  svg {
    width: 24px;
  height: 24px;
  }
}
</style>
