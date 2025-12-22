<template>
  <Item />

  <!-- <div class="bottom-navigation">
    <div class="left-controls"></div>

    <div class="right-controls">
      <div class="question-counter-wrapper">
        <IconArrowLeft :class="{ disabled: currentIndex <= 0 }" @click="handlePrevQuestion" />
        <span class="question-counter">{{ currentQuestion }}/{{ totalQuestions }}</span>
        <IconArrowLeft
          class="arrow-icon-right"
          :class="{
            disabled: !quizList?.[currentIndex]?.isAnswerCompleted || isHiddenNextStep,
          }"
          @click="handleNextQuestion"
        />
      </div>
    </div>
  </div> -->
</template>

<script setup lang="ts">
// import { computed } from "vue";
// import { IconArrowLeft } from "../../../../icons/src/singleColor";
// import { useQuiz } from "../../../ChatBaseComponent";
import Item from "./item.vue";

// const {
//   quizList,
//   currentIndex,
//   changeToNextQuestion,
//   changeToPrevQuestion,
//   addedBankIds,
// } = useQuiz();



// const currentQuestion = computed(() => currentIndex.value + 1);
// const totalQuestions = computed(() => quizList.value?.length || 0);
// const isHiddenNextStep = computed(() => {
//   return (
//     !!addedBankIds.value.length &&
//     currentIndex.value === quizList.value.length - 1 &&
//     quizList.value[currentIndex.value].isAnswerCompleted
//   );
// });

// // 导航功能
// const handlePrevQuestion = () => {
//   changeToPrevQuestion();
// };

// const handleNextQuestion = () => {
//   changeToNextQuestion(true);
// };

</script>

<style lang="less" scoped>
.question-section {
  margin: 9px 0 0 0;

  .question-title {
    font-size: 14px;
    font-weight: 500;
    color: rgba(46, 46, 46, 1);
    line-height: 20px;
    margin-bottom: 12px;
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
  }

  .answer-display {
    background: rgba(245, 243, 241, 1);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 10px;

    .answer-label {
      font-size: 12px;
      font-weight: 500;
      color: rgba(95, 94, 96, 1);
      margin-bottom: 8px;
    }

    .answer-text {
      font-size: 14px;
      line-height: 1.5;
      color: rgba(46, 46, 46, 1);
    }
  }
}

.explain-section {
  margin-bottom: 16px;

  .explain-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

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
    .edit-icon {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }

  .explain-content {
    color: rgba(0, 0, 0, 1);
    font-size: 14px;
    line-height: 20px;
  }
}

.quiz-bank-btn {
  background: white;
  border: 2px solid #ddd;
  border-radius: 24px;
  width: 97px;
  height: 32px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: rgba(133, 94, 225, 1);
    color: #fff;
  }
}

.bottom-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  .question-counter-wrapper {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    color: rgba(0, 0, 0, 1);
    svg {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
    .arrow-icon-right {
      transform: rotate(180deg);
    }
  }

  .left-controls {
    display: flex;
    align-items: center;
    gap: 16px;

    .sources-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 8px;

      .dropdown-icon {
        transition: transform 0.2s ease;

        &.expanded {
          transform: rotate(180deg);
        }
      }

      &:hover {
        background: #f5f5f5;
        color: #2196f3;
      }
    }
  }

  .right-controls {
    display: flex;
    align-items: center;
    gap: 12px;

    .nav-btn {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: #f5f5f5;
        color: #333;
      }

      &:disabled {
        color: rgba(0, 0, 0, 0.3);
        cursor: not-allowed;
      }
    }

    .question-counter {
      font-size: 12px;
      font-weight: 500;
      line-height: 16px;
      margin: 0 4px;
      cursor: default;
      color: rgba(0, 0, 0, 1);
      text-align: center;
    }

    .profile-btn {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: #f5f5f5;
        color: #333;
      }
    }

    .disabled {
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
    }
  }
}

.textarea-custom {
  width: 100%;
  background: rgba(245, 243, 241, 1);
  height: 150px;
  margin-bottom: 10px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.5;
  border: none;
  border-radius: 16px;
  resize: none;
  &:focus {
    border: none;
    outline: none;
  }

  &::placeholder {
    color: #9ca3af;
  }
}
</style>
