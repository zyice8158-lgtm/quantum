<template>
  <div class="question-section">
    <!-- 空状态显示 -->
    <div v-if="!currentQuiz" class="empty-state">
      <div class="empty-question">{{ t('learningZone.loadingQuestions') }}</div>
      <div class="empty-options">
        <div class="empty-option" v-for="n in 4" :key="n">
          <div class="empty-option-icon"></div>
          <div class="empty-option-text"></div>
        </div>
      </div>
    </div>

    <!-- 正常状态显示 -->
    <template v-else>
      <div class="question">{{ currentQuiz.question }}</div>

      <!-- Choice Options -->
      <div class="options" v-if="currentQuiz.type === QuizType.CHOICE">
        <div
          v-for="option in currentQuiz.options"
          :key="option.code"
          class="option"
          @click="handleSubmitAnswer(option.code)"
        >
          <IconCheckCircleGray v-if="currentQuiz.userAnswer !== option.code" class="option-icon" />
          <component v-else :is="iconMap[getOptionStatus(option.code)]" class="option-icon" />
          <span class="option-text" :class="getOptionTextClass(option.code)">{{ option.code + ":" + option.text }}</span>
        </div>
      </div>

      <!-- Boolean Options -->
      <div class="options" v-if="currentQuiz.type === QuizType.BOOL">
        <label
          v-for="option in boolOptions"
          :key="option.code"
          class="option"
          @click="handleSubmitAnswer(option.code)"
        >
          <IconCheckCircleGray v-if="currentQuiz.userAnswer !== option.code" class="option-icon" />
          <component v-else :is="iconMap[getOptionStatus(option.code)]" class="option-icon" />
          <span class="option-text" :class="getOptionTextClass(option.code)">{{ option.code }}</span>
        </label>
      </div>

      <!-- Saq -->
      <div v-else-if="currentQuiz.type === QuizType.SAQ">
        <textarea
          class="textarea-custom"
          name="saqAnswer"
          v-model="saqAnswer"
          :placeholder="t('learningZone.pleaseFillInAnswer')"
        />
      </div>
      <div
        class="submit-btn"
        v-if="currentQuiz.type === QuizType.SAQ"
        @click="handleSubmitAnswer(saqAnswer)"
      >
        <IconArrowDown class="icon-18" />
        {{ t('learningZone.submit') }}
      </div>

      <!-- Explain Section -->
      <div class="explain-section" v-if="currentQuiz.isAnswerCompleted">
        <div class="explain-header">
          <div @click="toggleExplain" class="explain-toggle">
            <span>{{ t('learningZone.explain') }}</span>
            <img
              :class="{ rotated: !showExplain }"
              class="chevron"
              src="@/assets/icons/arrow_icon.png"
              alt="arrow-down"
            />
          </div>

          <IconEdit class="explain-edit" @click="editExplain" v-if="!isEditExplain && showExplain" />
          <div class="explain-btn-group" v-if="isEditExplain && showExplain">
            <div class="explain-btn" @click="handleChangeExplain(explainContent)">
              <IconCorrect />
            </div>
            <div class="explain-btn" @click="closeEdit">
              <IconWrong />
            </div>
          </div>
        </div>

        <div class="explain-content-wrapper" v-if="showExplain">
          <div class="explain-content-item" v-if="currentQuiz.type === QuizType.CHOICE">
            {{ t('learningZone.correctAnswer') }}: {{ currentQuiz.answer.code }}
          </div>
          <div class="explain-content-item" v-if="currentQuiz.type === QuizType.BOOL">
            {{ t('learningZone.correctAnswer') }}: {{ currentQuiz.answer.judge }}
          </div>
          <div v-if="!isEditExplain" class="explain-content">
            {{ currentQuiz.analysis }}
          </div>
          <div v-if="isEditExplain" class="explain-content">
            <textarea v-model="explainContent" name="explainContent" class="textarea-custom" />
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <Button
        v-if="currentQuiz.isAnswerCompleted"
        class="add-quiz-btn"
        @click="toggleBankStatus(currentQuiz.id)"
      >
        <IconAdd v-if="!isAddedBank(currentQuiz.id)" class="icon-18" />
        <IconMini v-else class="icon-18" />
        {{ t('learningZone.quizBank') }}
      </Button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from "vue";
import {
  IconEdit,
  IconArrowDown,
  IconCheckCorrect,
  IconCheckWrong,
  IconCheckCircleGray,
  IconCorrect,
  IconWrong,
  IconAdd,
  IconMini
} from "@quantum/icons";
import { LzBankKind, QuizType, Card } from "../../../../types/lz";
import {useQuiz, OptionStatus} from "@libs/p-comps/ChatBaseComponent";
import { addToFavorites, removeToFavorites } from '../../../../store/lz';
import Button from "@libs/p-comps/volt/Button.vue";
import { useToast } from 'primevue/usetoast';
import { useLocale } from "@/hooks/i18n";

const { submitAnswer, quizList, currentIndex, getOptionStatus, updateAnalysis, addToBank, removeToBank, isAddedBank } = useQuiz();
const toast = useToast();
const { t } = useLocale();

// 使用 inject 获取父组件提供的数据
const currentChatId = inject<string>('currentChatId');
const currentMessageId = inject<string>('currentMessageId');
const currentMessageIdRef = ref(currentMessageId || '');

// 当前题目
const currentQuiz = computed(() => quizList.value?.[currentIndex.value]);

// 图标映射
const iconMap = {
  [OptionStatus.UNSELECTED]: IconCheckCircleGray,
  [OptionStatus.CORRECT]: IconCheckCorrect,
  [OptionStatus.WRONG]: IconCheckWrong,
};

// 判断题固定选项
const boolOptions = [{ code: "True" }, { code: "False" }];

const saqAnswer = ref<string>(""); // user write answer
const showExplain = ref<boolean>(false);
const isEditExplain = ref<boolean>(false);
const explainContent = ref<string>("");

// 提交答案
const handleSubmitAnswer = (answer: string) => {
  submitAnswer(answer);

  // 如果是简答题，清空输入框
  // if (type === QuizType.SAQ) {
  //   saqAnswer.value = "";
  // }
};

// 获取选项文字的CSS类
const getOptionTextClass = (optionCode: string): string => {
  if (!currentQuiz.value || !currentQuiz.value.userAnswer) {
    return '';
  }

  // 只给用户选择的选项加颜色
  if (currentQuiz.value.userAnswer === optionCode) {
    const status = getOptionStatus(optionCode);
    switch (status) {
      case OptionStatus.CORRECT:
        return 'option-text-correct';
      case OptionStatus.WRONG:
        return 'option-text-wrong';
      default:
        return '';
    }
  }

  return '';
};

// 更新解释
const handleChangeExplain = (explain: string) => {
  updateAnalysis(explain);
  isEditExplain.value = false;
};

const toggleExplain = (): void => {
  showExplain.value = !showExplain.value;
};

const editExplain = (): void => {
  isEditExplain.value = true;
  explainContent.value = currentQuiz.value?.analysis || "";
};

const closeEdit = (): void => {
  isEditExplain.value = false;
};

// 切换题库状态
const toggleBankStatus = (id: string) => {
  if (isAddedBank(id)) {
    removeToBank(id);
    removeToFavorites({type:LzBankKind.Quiz, messageId:currentMessageIdRef,quizId: currentQuiz.value?.id || ''})
    toast.add({ severity: 'info', summary: t('learningZone.questionRemoved'), life: 2000 });
  } else {
    addToBank(id);
    const card: Card = {
      title:  currentQuiz.value?.question || '',
      description: currentQuiz.value?.question || '',
      createdDate: Date.now(),// mock，to delete
      type: LzBankKind.Quiz,
      chatId: currentChatId,
      chatMessageId: currentMessageId,
      quizId: currentQuiz.value?.id
    }
    addToFavorites(card);
    toast.add({ severity: 'success', summary: t('learningZone.addedToMyQuizBank'), life: 2000 });
  }
};

const reset = () => {
  showExplain.value = false;
  isEditExplain.value = false;
  explainContent.value = currentQuiz.value?.analysis || "";
  saqAnswer.value = "";
}

watch(currentQuiz, () => {
  if (currentQuiz.value) {
    reset()
  }
})

onMounted(() => {
  explainContent.value = currentQuiz.value?.analysis || "";
});
</script>

<style scoped lang="less">
.question-section {
  .question {
    font-size: 22px;
    font-weight: 500;
    color: #000000;
    line-height: 28px;
    margin: 0 0 17px 0;
    user-select: none;
  }
}

/* 空状态样式 */
.empty-state {
  .empty-question {
    font-size: 22px;
    font-weight: 500;
    color: #cccccc;
    line-height: 28px;
    margin: 0 0 17px 0;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
    height: 28px;
  }

  .empty-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;

    .empty-option {
      display: flex;
      align-items: center;
      border-radius: 36px;
      background: var(--color-on-primary);
      height: 48px;
      padding: 0 10px;

      .empty-option-icon {
        width: 24px;
        height: 24px;
        margin-right: 2px;
        flex-shrink: 0;
        background: #f0f0f0;
        border-radius: 50%;
      }

      .empty-option-text {
        height: 16px;
        background: #f0f0f0;
        border-radius: 8px;
        flex: 1;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
    }
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;

  .option {
    display: flex;
    align-items: center;
    border-radius: 36px;
    background: var(--color-on-primary);
    height: 48px;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0 10px;
    border: 1px solid #e5e7eb;

    &:hover {
      background: #f8fafc;
      border-color: var(--color-ai-step-1);
    }

    .option-icon {
      width: 24px;
      height: 24px;
      margin-right: 2px;
      flex-shrink: 0;
    }

    .option-text {
      font-size: 14px;
      color: #000;
      font-weight: 400;

      &.option-text-correct {
        color: rgba(62, 134, 67, 1); // 绿色 - 答对
      }

      &.option-text-wrong {
        color: rgba(222, 55, 48, 1); // 红色 - 答错
      }
    }
  }
}

.explain-section {
  .explain-btn-group {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }
  .explain-btn {
    width: 32px;
    height: 32px;
    font-size: 16px;
    color: #161c27;
    border-radius: 50%;
    background: var(--color-on-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 1px solid #e5e7eb;

    &:hover {
      background: #f8fafc;
      border-color: var(--color-ai-step-1);
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }
  .explain-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .explain-edit {
      width: 24px;
      height: 24px;
      cursor: pointer;
      color: #161c27;

      &:hover {
        color: var(--color-ai-step-1);
      }
    }
  }

  .explain-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #000;
    cursor: pointer;

    &:hover {
      color: var(--color-ai-step-1);
    }

    .chevron {
      transition: transform 0.2s ease;
      width: 24px;
      height: 24px;

      &.rotated {
        transform: rotate(180deg);
      }
    }
  }

  .explain-content {
    font-size: 14px;
    line-height: 20px;
    max-height: 182px;
    overflow-y: auto;
    color: #000;
    margin: 0;
    padding-bottom: 10px;

    &-item {
      font-size: 14px;
      color: rgba(0, 0, 0, 1);
      line-height: 20px;
      margin-bottom: 6px;
      font-weight: 500;
    }

    &-wrapper {
      position: relative;
      margin-top: 12px;
      margin-bottom: 12px;
      -webkit-mask: linear-gradient(
        to bottom,
        transparent 0px,
       0px,
        black calc(100% - 20px),
        transparent 100%
      );
      mask: linear-gradient(
        to bottom,
        transparent 0px,
        0px,
        black calc(100% - 20px),
        transparent 100%
      );
    }
  }
}

.textarea-custom {
  width: 100%;
  background: var(--color-on-primary);
  height: 150px;
  margin-bottom: 16px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  resize: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: var(--color-ai-step-1);
    outline: none;
    box-shadow: 0 0 0 2px rgba(92, 141, 255, 0.2);
  }

  &::placeholder {
    color: #9ca3af;
  }
}

.submit-btn, .add-quiz-btn {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  bottom: 24px;
  border-radius: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  flex-direction: row;
  background: var(--color-on-primary);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-on-focus-container);
  cursor: pointer;
  padding: 7px 16px;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;

  &:hover {
    background: rgba(133, 94, 225, 1);
    color: var(--color-on-primary);
    border-color: rgba(133, 94, 225, 1);
  }

  .icon-18 {
    font-size: 18px;
    margin-right: 4px;
  }
}

.submit-btn {
  width: 100px;
}

.add-quiz-btn {
  background: var(--color-on-primary) !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 32px !important;
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  flex-direction: row !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  color: #161c27 !important;
  cursor: pointer !important;
  padding: 7px 16px !important;
  transition: all 0.2s ease !important;

  &:hover {
    background: rgba(133, 94, 225, 1) !important;
    color: var(--color-on-primary) !important;
    border-color: rgba(133, 94, 225, 1) !important;
  }

  :deep(svg) {
    margin-right: 4px;
  }
}
</style>
