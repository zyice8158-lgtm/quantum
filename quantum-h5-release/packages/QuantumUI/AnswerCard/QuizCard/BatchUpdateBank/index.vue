<template>
  <div class="quiz-batch-card">   
    
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
      <div class="add-quiz-btn">
        <IconAdd class="icon-18" />
        {{ t('learningZone.quizBank') }}
      </div>
      <span class="selected-count">{{ t('learningZone.selected') }} {{ selectedCount }}</span>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { IconAdd, IconCheck, IconCheckCircle } from "@quantum/icons";
import { useQuiz } from "../../../ChatBaseComponent";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  changeQuizCard: (step: number) => void;
}>();

const { quizList } = useQuiz();

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
</script>

<style lang="less" scoped>
.quiz-batch-card {

  .results-summary {
    margin-top: 8px;
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
      align-items: flex-start;
      cursor: pointer;
      
      .question-item-icon {
        margin-right: 0;
        width: 20px;
        height: 20px;
        
        svg {
          width: 20px;
          height: 20px;
        }
      }
    }

    .instruction-text {
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      color: rgba(14, 19, 30, 1);
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
      height: 24px;
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
      background: #fff;
      border: 1px solid rgba(95, 94, 96, 1);
      height: 32px;
      width: 119px;
      color: rgba(22, 28, 39, 1);
      border-radius: 16px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      .icon-18 {
        font-size: 18px;
      }
      &:hover:not(:disabled) {
        background: rgba(133, 94, 225, 1);
        color: #fff;
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
