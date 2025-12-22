<template>
  <BaseAcc
    :index="index"
    :data="data"
    brand="vrbo"
    :book-text="`${$t('book.button.vrbo')}`"
  >
    <template #name>
      <div class="
      body-s
      text-[var(--text-invest)]
      mb-[3px]
      text-13
      ">{{ data.detailType }}</div>
      <span>{{ data.name }}</span>
    </template>
    <div class="
      body-m
      text-[var(--secondary-text)]
      mb-0
      mt-[6px]
      h-[20px]
      font-thin
      ">{{ data.neighborhoodName }}</div>
      <div class="
      body-m
      text-[var(--secondary-text)]
      h-[20px]
      mb-[10px]
      overflow-y-hidden
      font-thin
    ">{{ room?.description }}</div>
  </BaseAcc>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Hotel } from '../../types/type';
import BaseAcc from './BaseAcc.vue';

const props = defineProps<{
  index?: number
  data: Hotel
}>()

const room = computed(() => {
  return props.data.room?.length && props.data.room[0]
})
</script>
