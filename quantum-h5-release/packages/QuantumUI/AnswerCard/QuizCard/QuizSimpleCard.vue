<template>
  <div class="quiz-card">
    <!-- Header -->
    <div class="quiz-header"><IconQuantumLogo class="header-icon"/>{{ t('learningZone.quizGeneratedSimple') }}</div>

    <!-- Question Content -->
    <div class="question-content">
      <IconChain class="question-icon" />
      <div class="question-text">What kind of person you'll be attracted to in real What kind of person you'll be attracted to in real </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { IconChain } from "../../../icons/src/singleColor";
import { IconQuantumLogo } from "../../../icons/src/multiColor";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

</script>

<style lang="less" scoped>
.quiz-card {
  background: white;
  border-radius: 20px;
  padding: 20px 18px 9px 18px;

  .quiz-header {
    color: rgba(95, 94, 96, 1);
    font-size: 14px;
    margin-bottom: 17px;
    line-height: 20px;
    font-weight: 500;
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    .header-icon {
      width: 24px;
      height: 24px;
    }
  }

  .question-content {
    background: rgba(245, 243, 241, 1);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 14px;

    .question-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .question-text {
      color: rgba(0, 0, 0, 1);
      font-size: 16px;
      font-weight: 500;
      line-height: 20px;
      flex: 1;
      height: 44px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .bottom-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    .sources-section {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 0;

      &:hover {
        opacity: 0.7;
      }

      .chain-icon {
        color: #666;
      }

      .sources-text {
        color: #333;
        font-size: 14px;
        font-weight: 500;
      }

      .dropdown-arrow {
        color: #666;
        transition: transform 0.2s ease;

        &.expanded {
          transform: rotate(180deg);
        }
      }
    }

    .user-icon {
      width: 32px;
      height: 32px;
      background: #f0f0f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      &:hover {
        background: #e0e0e0;
      }

      svg {
        color: #666;
      }
    }
  }
}
</style>
