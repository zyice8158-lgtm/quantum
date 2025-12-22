<template>
  <BaseAcc
    :index="index"
    :data="data"
  >
    <template #name>
      {{ room?.name }}
    </template>
    <div v-if="data.name" class="
      body-m
      text-[var(--secondary-text)]
      mb-[16px]
      font-thin
    ">{{ data.name }}</div>
    <div v-if="room?.description" class="
      body-m
      text-[var(--secondary-text)]
      h-[20px]
      mb-[6px]
      text-13
      overflow-y-hidden">{{ room?.description }}</div>
  </BaseAcc>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Hotel, Room } from '../../types/type';
import BaseAcc from './BaseAcc.vue';

const props = defineProps<{
  index?: number
  data: Hotel
}>()

const room = computed(() => {
  return props.data.room?.length && props.data.room[0]
})
</script>
