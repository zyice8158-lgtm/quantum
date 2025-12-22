<template>
  <QuizSimpleCard v-if="showSimpleCard" />
  <div class="quiz-card" v-else>
    <div class="quiz-header">
      <IconQuiz class="document-icon" />
      <div class="header-text">
        {{ t('learningZone.quizGenerated') }}
      </div>
      <div class="view-link" @click="handleViewClick">{{ t('learningZone.view') }}</div>
    </div>
    <QuizCard :content="content" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, inject, unref, type Ref } from "vue";
import QuizCard from "./Card/index.vue";
import QuizSimpleCard from "./QuizSimpleCard.vue";
import { ChatController, ChatStatus } from '../../index';
import { useQuiz } from "../../ChatBaseComponent";
import { QuizType } from "../../ChatBaseComponent/hooks/useQuiz";
const { setQuizList } = useQuiz();
import { IconQuiz } from "../../../icons/src/singleColor";
import { ChatEventBus } from "../../ChatBaseComponent/types/AIServiceGateway";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  noTool?: boolean,
  answerItem: {
    id?: string;
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

const currentMessageId = inject<Ref<string> | string | undefined>("currentMessageId", undefined);

const showSimpleCard = computed(() => {
  const injectedId = unref(currentMessageId);
  const messageId = props.answerItem.id;
  return Boolean(injectedId && messageId && injectedId === messageId);
});

const handleViewClick = () => {
  console.log(props.chat ,'answerItem')
  ChatEventBus.emit('openLZQuiz', {
    chatId: props.chat?.chatUid,
    messageId: props.answerItem.id || ''
  });
};
const content = computed(() => {
  // return (props.answerItem.answerData.content);
  return  [
                {
                "id": "Q1",
                "type": QuizType.CHOICE,
                "question": "What is the primary strategic implication of China's advancements in its submarine fleet and anti-submarine warfare (ASW) capabilities, particularly within the First Island Chain?",
                "options": [
                    {
                    "code": "A",
                    "text": "It primarily aims to secure China's trade routes in the Indian Ocean."
                    },
                    {
                    "code": "B",
                    "text": "It could significantly challenge US maritime dominance and operations in the Western Pacific."
                    },
                    {
                    "code": "C",
                    "text": "It is designed to facilitate joint naval exercises with allied nations in the region."
                    },
                    {
                    "code": "D",
                    "text": "It focuses on developing deep-sea exploration technologies rather than military applications."
                    }
                ],
                "answer": {
                    "code": "B",
                    "judge": null,
                    "short_answer": null
                },
                "analysis": "The document explicitly states that China's improvements, along with its ASW weapons and the 'Undersea Great Wall,' 'could spell trouble in the First Island Chain for US submarines should Beijing and Washington go to war, especially over Taiwan.' It also mentions that these developments 'will likely start to challenge US military maritime dominance under the waves.' Option B directly reflects this core strategic implication. Options A, C, and D are not supported by the text; the focus is clearly on military challenge to the US in the Western Pacific."
                },
                {
                "id": "Q2",
                "type": QuizType.BOOL,
                "question": "China's older nuclear-powered submarines have historically been considered quieter than their US counterparts, making them harder to detect.",
                "options": null,
                "answer": {
                    "code": null,
                    "judge": false,
                    "short_answer": null
                },
                "analysis": "The text states, 'China's submarine fleet is heavily composed of conventional, diesel-electric submarines... It's been building nuclear-powered ones for decades, but these have long been considered louder than US subs.' A noisy sub is more easily detected, directly contradicting the statement that they were considered quieter. Therefore, the statement is false."
                }]
});

watch(() => props.answerItem.answerData, () => {
  setQuizList([
                {
                "id": "Q1",
                "type": QuizType.CHOICE,
                "question": "What is the primary strategic implication of China's advancements in its submarine fleet and anti-submarine warfare (ASW) capabilities, particularly within the First Island Chain?",
                "options": [
                    {
                    "code": "A",
                    "text": "It primarily aims to secure China's trade routes in the Indian Ocean."
                    },
                    {
                    "code": "B",
                    "text": "It could significantly challenge US maritime dominance and operations in the Western Pacific."
                    },
                    {
                    "code": "C",
                    "text": "It is designed to facilitate joint naval exercises with allied nations in the region."
                    },
                    {
                    "code": "D",
                    "text": "It focuses on developing deep-sea exploration technologies rather than military applications."
                    }
                ],
                "answer": {
                    "code": "B",
                    "judge": null,
                    "short_answer": null
                },
                "analysis": "The document explicitly states that China's improvements, along with its ASW weapons and the 'Undersea Great Wall,' 'could spell trouble in the First Island Chain for US submarines should Beijing and Washington go to war, especially over Taiwan.' It also mentions that these developments 'will likely start to challenge US military maritime dominance under the waves.' Option B directly reflects this core strategic implication. Options A, C, and D are not supported by the text; the focus is clearly on military challenge to the US in the Western Pacific."
                },
                {
                "id": "Q2",
                "type": QuizType.BOOL,
                "question": "China's older nuclear-powered submarines have historically been considered quieter than their US counterparts, making them harder to detect.",
                "options": null,
                "answer": {
                    "code": null,
                    "judge": false,
                    "short_answer": null
                },
                "analysis": "The text states, 'China's submarine fleet is heavily composed of conventional, diesel-electric submarines... It's been building nuclear-powered ones for decades, but these have long been considered louder than US subs.' A noisy sub is more easily detected, directly contradicting the statement that they were considered quieter. Therefore, the statement is false."
                }] );
})
</script>

<style scoped lang="less">
.quiz-card {
  background: white;
  border-radius: 24px;
  padding: 24px 12px 0px;
  // width: 529px;

  .quiz-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    .document-icon {
      width: 21px;
      height: 21px;
      margin-right: 7px;
      color: #fff;
    }

    .header-text {
      flex: 1;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      color: rgba(0, 0, 0, 1);
    }

    .view-link {
      color: rgba(14, 119, 218, 1);
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      margin-left: 19px;
      margin-right: 12px;
      cursor: pointer;
      text-decoration: underline;

    }
  }
}
</style>
