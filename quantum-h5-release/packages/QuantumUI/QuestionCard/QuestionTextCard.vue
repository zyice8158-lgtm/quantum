<template>
    <FileSearch :questionFiles="files" v-if="files.length > 0" card-type="question" />
    <div v-if="questionItem?.questionData.actionType === AnswerActionType.TEXT && questionItem.questionData.content && !questionItem?.questionData.isCatchMeUp" class="query-box_text" v-automation="'question_text'">
        <span>{{ questionItem?.questionData.content }}</span>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import Question from '../ChatBaseComponent/types/Question';
import { AnswerActionType } from '../ChatBaseComponent';
import FileSearch from './FileSearch.vue';
const props = defineProps<{
  questionItem: Question | undefined
}>()
console.log('queryItem----------', props.questionItem);
const files = computed(() => props.questionItem?.questionData?.files || [])
</script>
<style scoped lang="less">
.query-box_text {
    padding: 8px 24px;
    box-sizing: border-box;
    font-size: 14px;
    align-items: center;
    font-weight: 400;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 16px 16px 0 16px;
    color: #5F5E60;
    width: fit-content;
    max-width: 100%;
    overflow-wrap: break-word;
  }
</style>
