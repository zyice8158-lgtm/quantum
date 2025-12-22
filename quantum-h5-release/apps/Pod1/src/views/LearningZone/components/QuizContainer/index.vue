<template>
  <QuizCard :changeQuizCard="changeQuizCard" v-if="step === 1" />
  <QuizBatchCard v-if="step === 2"  :changeQuizCard="changeQuizCard"/>
  <QuizComplete v-if="step === 3" :changeQuizCard="changeQuizCard"/>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import QuizCard from '../QuizCard/index.vue';
import QuizBatchCard from '../QuizBatchCard/index.vue';
import QuizComplete from '../QuizComplete/index.vue';

const step = ref(1);

const changeQuizCard = (_step: number) => {
  step.value = _step;
}

</script>

<style scoped lang="less">

</style>