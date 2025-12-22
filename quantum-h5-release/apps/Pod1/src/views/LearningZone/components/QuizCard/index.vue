<template>
  <div class="quiz-container">
    <!-- Header Section -->
    <div class="header">
      <h1 class="title">{{ t('learningZone.aiQuizzes') }}</h1>
      <p class="subtitle">{{ t('learningZone.quizSubtitle') }}</p>

       <!-- Progress Section -->
       <div class="progress-section">
         <div
           class="progress-arrow-right"
           :class="{ hidden: currentIndex <= 0 }"
           @click="changeToPrevQuestion"
         >
           <IconArrowLeft class="text-text-on-surface-muted" />
         </div>
         <div class="progress-bar" ref="progressBarRef">
           <div
             class="progress-content"
             :style="{ transform: `translateX(${progressOffset}px)` }"
           >
             <template v-for="(quiz, index) in quizList" :key="quiz.id">
               <div
                 class="step"
                 :class="{
                   active: index === currentIndex,
                 }"
               >
                 {{ index + 1 }}
               </div>
               <div
                 v-if="index < quizList.length - 1"
                 class="connector"
                 :class="{
                   active: index <= currentIndex,
                 }"
               ></div>
             </template>
           </div>
         </div>
         <div
           class="progress-arrow-left"
           :class="{ disabled: !quizList?.[currentIndex]?.isAnswerCompleted }"
           @click="handleNextStep"
         >
           <IconArrowLeft class="icon-arrow text-text-on-surface-muted" />
         </div>
       </div>
    </div>
    <!-- 确保 QuizItem 始终显示，即使没有数据也显示空状态 -->
    <QuizItem v-if="quizList?.[currentIndex]" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, ComputedRef } from "vue";
import QuizItem from "./QuizItem.vue";
import { IconArrowLeft } from "@quantum/icons";
import {useQuiz} from "@libs/p-comps/ChatBaseComponent";
import { useRoute } from 'vue-router';
import { getFavoritesQuiz } from '../../../../store/lz';
import { useLocale } from "@/hooks/i18n";

const props = defineProps<{
  changeQuizCard?: (step: number) => void;
}>();
const { t } = useLocale();
const route = useRoute();
const {fromHistory, chatMessageId} = route.query;
const progressBarRef = ref<HTMLElement>();
const progressOffset = ref<number>(0);
const { quizList, changeToNextQuestion, changeToPrevQuestion, currentIndex, addedBankIds, updateBankIds } = useQuiz();

const safeQuizList = computed(() => {
  return quizList?.value || [];
});
const totalSteps: ComputedRef<number> = computed(() => {
  return safeQuizList.value.length || 0;
});

const handleNextStep = () => {
  const isShowComplete = !!addedBankIds.value.length && currentIndex.value === safeQuizList.value.length - 1 && safeQuizList.value[currentIndex.value]?.isAnswerCompleted;
  if (isShowComplete) {
    props.changeQuizCard?.(3);
  } else if(safeQuizList.value.length === currentIndex.value + 1) {
    props.changeQuizCard?.(2);
  } else {
    changeToNextQuestion();
  }
}

// 计算进度条偏移量，使当前步骤完全居中
const calculateProgressOffset = () => {
  if (!progressBarRef.value) return;

  const progressBarWidth = progressBarRef.value.offsetWidth;
  const stepWidth = 24; // 步骤圆圈宽度
  const connectorWidth = 40; // 连接线宽度
  const stepMargin = 4; // 步骤间距
  const totalItemWidth = stepWidth + connectorWidth + stepMargin;

  // 计算总内容宽度
  const totalContentWidth = (totalSteps.value - 1) * totalItemWidth + stepWidth;

  // 当内容宽度小于等于进度条宽度时，整个内容居中显示
  if (totalContentWidth <= progressBarWidth) {
    progressOffset.value = (progressBarWidth - totalContentWidth) / 2;
    return;
  }

  // 当内容宽度大于进度条宽度时，使当前步骤完全居中
  const currentStepIndex = currentIndex.value;
  const currentStepPosition = currentStepIndex * totalItemWidth + stepWidth / 2;
  const centerPosition = progressBarWidth / 2;

  // 计算理想偏移量（使当前步骤完全居中）
  const idealOffset = centerPosition - currentStepPosition;

  // 直接使用理想偏移量，不进行边界限制，确保完全居中
  progressOffset.value = idealOffset;
};

watch(currentIndex, () => {
  nextTick(() => {
    calculateProgressOffset();
  });
});

window.addEventListener('resize', () => {
  nextTick(() => {
    calculateProgressOffset();
  });
});

onMounted(() => {
  nextTick(() => {
    calculateProgressOffset();
    if(fromHistory) {
      const ids = getFavoritesQuiz(chatMessageId as string)
      updateBankIds(ids)
    }
  });
});
</script>

<style lang="less" scoped>
.quiz-container {
  background: rgba(255, 255, 255, 0.6);
  position: relative;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 52px 16px 18px;
  margin-right: 12px;
}

.header {
  margin-bottom: 24px;

  .title {
    font-size: 16px;
    font-weight: 700;
    line-height: 20px;
    color: #0e131e;
    margin: 0 0 1px 0;
  }

  .subtitle {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.5);
    margin: 0 0 28px 0;
  }
}

.progress-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 100%;

  .progress-arrow {
    &-left,
    &-right {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 1px solid var(--color-on-primary);
      box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: var(--color-on-primary);

      &:hover:not(.hidden) {
        // todo
      }

      &.hidden {
        visibility: hidden;
        opacity: 0;
        pointer-events: none;
      }
      &.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    &-right {
      margin-right: 8px;
      svg {
        width: 14px;
        height: 14px
      }
    }

    &-left {
      margin-left: 8px;
      .icon-arrow {
        transform: rotate(180deg);
        width: 14px;
        height: 14px;
      }
    }
  }

  .progress-bar {
    display: flex;
    align-items: center;
    overflow: hidden;
    flex: 1;
    position: relative;
    margin: 0 8px;
    user-select: none;

    // 使用mask实现渐变效果，不增加额外元素
    -webkit-mask: linear-gradient(to right,
      transparent 0px,
      black 50px,
      black calc(100% - 50px),
      transparent 100%
    );
    mask: linear-gradient(to right,
      transparent 0px,
      black 50px,
      black calc(100% - 50px),
      transparent 100%
    );

    .progress-content {
      display: flex;
      align-items: center;
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      white-space: nowrap;
    }

    .step {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      background: #bdc7dc;
      color: #454649;
      cursor: pointer;
      flex-shrink: 0;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;

      &.active {
        background: #5c8dff;
        color: var(--color-on-primary);
      }
    }

    .connector {
      width: 40px;
      height: 1px;
      background: #e5e7eb;
      margin: 0 2px;
      border: none;
      flex-shrink: 0;
      &.active {
        background: rgba(92, 141, 255, 1);
      }
    }
  }
}
</style>
