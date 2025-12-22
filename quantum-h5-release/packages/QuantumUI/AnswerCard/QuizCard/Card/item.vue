<template>
  <div class="question-section" v-if="currentQuiz">
    <div class="question-title">
      {{ currentQuiz.question }}
    </div>

    <!-- Choice Options -->
    <div class="options" v-if="currentQuiz.type === QuizType.CHOICE">
      <div
        v-for="option in currentQuiz.options"
        :key="option.code"
        class="option"
      >
        <!-- <IconCheckCircleGray v-if="currentQuiz.userAnswer !== option.code" class="option-icon" />
        <component v-else :is="iconMap[getOptionStatus(option.code)]" class="option-icon" /> -->
        <span class="option-text">{{ option.code + "." + option.text }}</span>
      </div>
    </div>

    <!-- Boolean Options -->
    <div class="options" v-if="currentQuiz.type === QuizType.BOOL">
      <label
        v-for="option in boolOptions"
        :key="option.code"
        class="option"
      >
        <!-- <IconCheckCircleGray v-if="currentQuiz.userAnswer !== option.code" class="option-icon" />
        <component v-else :is="iconMap[getOptionStatus(option.code)]" class="option-icon" /> -->
        <span class="option-text">{{ option.code }}</span>
      </label>
    </div>

    <!-- SAQ -->
    <div v-else-if="currentQuiz.type === QuizType.SAQ">
      <textarea
        class="textarea-custom"
        name="saqAnswer"
        v-model="saqAnswer"
        :placeholder="t('learningZone.pleaseFillInAnswer')"
      />
      <!-- <div
        class="submit-btn"
        v-if="!currentQuiz.isAnswerCompleted"
        @click="submitAnswer(saqAnswer, currentQuiz.type)"
      >
        Submit
      </div> -->
    </div>
  </div>

  <!-- Explain Section  -->
  <div v-if="currentQuiz?.isAnswerCompleted" class="explain-section">
    <div class="explain-header">
      <div @click="toggleExplain" class="explain-toggle">
        <span>{{ t('learningZone.explain') }}</span>
        <IconArrowLeft class="arrow-icon text-text-on-surface-muted" :class="{ expanded: showExplain }" />
      </div>

      <IconEdit class="explain-edit" @click="editExplain" v-if="!isEditExplain && showExplain" />
      <div class="explain-btn-group" v-if="isEditExplain && showExplain">
        <div class="explain-btn">
          <IconCorrect @click="changeExplain(explainContent)" />
        </div>
        <div class="explain-btn">
          <IconWrong @click="closeEdit" />
        </div>
      </div>
    </div>

    <div class="explain-content-wrapper" v-if="showExplain">
      <div class="explain-content-item" v-if="currentQuiz.type === QuizType.CHOICE">
        current: {{ currentQuiz.answer.code }}
      </div>
      <div class="explain-content-item" v-if="currentQuiz.type === QuizType.BOOL">
        current: {{ currentQuiz.answer.judge }}
      </div>

      <div v-if="!isEditExplain" class="explain-content">
        {{ currentQuiz.analysis }}
      </div>
      <textarea
        v-if="isEditExplain"
        v-model="explainContent"
        name="explainContent"
        class="textarea-custom explain-content"
      />
    </div>
  </div>

  <!-- <div v-if="currentQuiz?.isAnswerCompleted" class="quiz-bank-btn" @click="toggleBankStatus">
    <IconAdd v-if="!isAddedBank(currentQuiz.id)" class="icon-18" />
    <IconMini v-else class="icon-18" />
    Quiz Bank
  </div> -->
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import {
  IconAdd,
  IconMini,
  IconEdit,
  IconArrowLeft,
  IconCheckCircleGray,
  IconCheckCorrect,
  IconCheckWrong,
  IconWrong,
  IconCorrect,
} from "../../../../icons/src/singleColor";
import { useQuiz, QuizType, OptionStatus } from "../../../ChatBaseComponent/hooks/useQuiz";
import type { Question } from "../../../ChatBaseComponent/hooks/useQuiz";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const {
  quizList,
  currentIndex,
  submitAnswer,
  getOptionStatus,
  updateAnalysis,
  addToBank,
  removeToBank,
  isAddedBank,
} = useQuiz();

// 图标映射
const iconMap: Record<OptionStatus, any> = {
  [OptionStatus.UNSELECTED]: IconCheckCircleGray,
  [OptionStatus.CORRECT]: IconCheckCorrect,
  [OptionStatus.WRONG]: IconCheckWrong,
};

// 判断题固定选项
const boolOptions = computed(() => [{ code: t('learningZone.true') }, { code: t('learningZone.false') }]);

const saqAnswer = ref<string>("");
const showExplain = ref<boolean>(false);
const isEditExplain = ref<boolean>(false);
const explainContent = ref<string>("");

const currentQuiz = computed((): Question | undefined => {
  return quizList.value?.[currentIndex.value];
});

const toggleExplain = (): void => {
  showExplain.value = !showExplain.value;
};

const editExplain = (): void => {
  isEditExplain.value = true;
};

const changeExplain = (explain: string): void => {
  updateAnalysis(explain);
  isEditExplain.value = false;
};

const closeEdit = (): void => {
  isEditExplain.value = false;
};

// 切换题库状态
const toggleBankStatus = () => {
  if (currentQuiz.value) {
    if (isAddedBank(currentQuiz.value.id)) {
      removeToBank(currentQuiz.value.id);
    } else {
      addToBank(currentQuiz.value.id);
    }
  }
};

const reset = () => {
  showExplain.value = false;
  isEditExplain.value = false;
  explainContent.value = currentQuiz.value?.analysis || "";
  saqAnswer.value = "";
};

watch(currentQuiz, () => {
  if (currentQuiz.value) {
    reset();
  }
});

onMounted(() => {
  explainContent.value = currentQuiz.value?.analysis || "";
});
</script>

<style scoped lang="less">
.component {
  box-sizing: border-box;
}

.question-section {
  margin: 9px 8px 0;

  .question-title {
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 1);
    line-height: 20px;
    margin-bottom: 12px;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 18px;

    .option {
      display: flex;
      align-items: center;
      gap: 2px;
      line-height: 20px;
      padding: 4px 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      .option-icon {
        width: 24px;
        height: 24px;
      }

      .option-text {
        font-size: 14px;
        color: rgba(0, 0, 0, 1);
        line-height: 20px;
      }
    }
  }

  .submit-btn {
    width: 74px;
    height: 32px;
    border-radius: 16px;
    line-height: 32px;
    font-size: 11px;
    font-weight: 700;
    border: 1px solid rgba(95, 94, 96, 1);
    color: rgba(95, 94, 96, 1);
    text-align: center;
    cursor: pointer;
    margin-top: 8px;
  }
}

.explain-section {
  margin-bottom: 16px;

  .explain-btn-group {
    display: flex;
    flex-direction: row;
    gap: 8px;
    svg {
      width: 32px;
      height: 32px;
    }
  }

  .explain-btn {
    width: 32px;
    height: 32px;
    font-size: 16px;
    color: #161c27;
    border-radius: 50%;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .explain-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    .explain-edit {
      width: 24px;
      height: 24px;
      cursor: pointer;
      color: #161c27;
    }

    .explain-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      color: rgba(0, 0, 0, 1);
      cursor: pointer;

      .arrow-icon {
        width: 24px;
        height: 24px;
        transition: transform 0.3s ease;
        transform: rotate(-90deg);

        &.expanded {
          transform: rotate(90deg);
        }
      }
    }
  }

  .explain-content-wrapper {
    display: flex;
    flex-direction: column;
    .explain-content-item {
      font-size: 14px;
      color: rgba(0, 0, 0, 1);
      margin-bottom: 5px;
      font-weight: 500;
    }

    .explain-content {
      font-size: 14px;
      line-height: 20px;
      max-height: 80px;
      overflow-y: auto;
      color: #000;
    }
  }
}

.textarea-custom {
  width: 100%;
  background: rgba(245, 243, 241, 1);
  height: 80px;
  margin-bottom: 16px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.5;
  border: none;
  border-radius: 8px;
  resize: none;

  &:focus {
    border: none;
    outline: none;
  }

  &::placeholder {
    color: #9ca3af;
  }
}

.quiz-bank-btn {
  background: white;
  border: 2px solid #ddd;
  border-radius: 24px;
  width: 120px;
  height: 32px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 4px;

  &:hover {
    background: rgba(133, 94, 225, 1);
    color: #fff;
    border-color: rgba(133, 94, 225, 1);
  }

  .icon-18 {
    width: 18px;
    height: 18px;
  }
}
</style>
