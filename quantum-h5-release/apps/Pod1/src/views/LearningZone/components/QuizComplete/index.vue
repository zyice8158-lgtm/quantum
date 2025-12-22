<template>
  <div class="quiz-complete">
    <div class="quiz-complete__header">
      <button class="quiz-complete__back" type="button" @click="goToQuizStart">
        <IconBack />
      </button>
    </div>

    <div class="quiz-complete__body">
      <p class="quiz-complete__title">
        Congratulations on completing all the questions！
      </p>

      <div class="quiz-complete__figure">
        <div class="completion-symbol">
          <span class="completion-symbol__pointer"></span>
        </div>
      </div>

      <p class="quiz-complete__subtitle">
        You can click the <span>More Quiz</span> button below to test again
      </p>

      <button class="quiz-complete__more-btn" type="button">
        More Quiz
      </button>
    </div>

    <div class="quiz-complete__footer">
      <button class="quiz-complete__ghost-btn" type="button" @click="goToQuizStart">
        Get it again
      </button>
      <button class="quiz-complete__home-btn" type="button" @click="handleHome">
        Home
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { IconBack } from "@quantum/icons";
import { useQuiz } from "@libs/p-comps/ChatBaseComponent";

const props = defineProps<{
  changeQuizCard?: (step: number) => void;
}>();

const router = useRouter();
const { currentIndex } = useQuiz();

const goToQuizStart = () => {
  currentIndex.value = 0;
  props.changeQuizCard?.(1);
};

const handleHome = () => {
  router.push({ name: "LearningZone" });
};
</script>

<style scoped lang="less">
.quiz-complete {
  width: 100%;
  height: 100%;
  border-radius: 32px;
  padding: 24px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-on-primary);
  position: relative;
  overflow: hidden;
}

.quiz-complete__header {
  width: 100%;
  display: flex;
  justify-content: flex-start;
}

.quiz-complete__back {
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(100, 139, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(14, 19, 30, 0.65);
  transition: all 0.2s ease;

  svg {
    width: 16px;
    height: 16px;
  }

}

.quiz-complete__body {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0 16px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.quiz-complete__title {
  margin: 24px 0 16px;
  font-size: 22px;
  line-height: 30px;
  font-weight: 700;
  background: linear-gradient(90deg, #648bff 0%, #b273ef 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.quiz-complete__figure {
  width: 140px;
  height: 140px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6),
    0 16px 32px rgba(149, 130, 240, 0.12);
}

.completion-symbol {
  position: relative;
  width: 62px;
  height: 62px;
  border-radius: 18px;
  background: rgba(14, 19, 30, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.completion-symbol__pointer {
  position: absolute;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 16px solid rgba(148, 133, 222, 0.65);
  transform: rotate(12deg);
  left: 34px;
  top: 24px;
}

.quiz-complete__subtitle {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  color: rgba(14, 19, 30, 0.6);
  max-width: 320px;

  span {
    font-weight: 600;
    color: rgba(14, 19, 30, 0.75);
  }
}

.quiz-complete__more-btn {
  margin-top: 28px;
  padding: 14px 36px;
  border: none;
  border-radius: 28px;
  background: var(--color-on-primary);
  color: rgba(14, 19, 30, 0.9);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(100, 139, 255, 0.22);
  transition: all 0.2s ease;
}

.quiz-complete__footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  position: relative;
  z-index: 1;
}

.quiz-complete__ghost-btn,
.quiz-complete__home-btn {
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.quiz-complete__ghost-btn {
  background: rgba(255, 255, 255, 0.95);
  color: rgba(14, 19, 30, 0.75);
  box-shadow: 0 10px 18px rgba(100, 139, 255, 0.12);
}

.quiz-complete__home-btn {
  background: rgba(133, 94, 225, 1);
  color: var(--color-on-primary);
  box-shadow: 0 14px 28px rgba(133, 94, 225, 0.32);
}
</style>
