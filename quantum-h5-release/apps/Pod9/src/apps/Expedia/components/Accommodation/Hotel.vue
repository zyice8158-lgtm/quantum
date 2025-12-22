<template>
  <BaseAcc
    :index="index"
    :data="data"
  >
    <template #name>
      {{ data.name }}
    </template>
    <div v-for="(p, index) in infoRender"
      :key="`hotel-${index}`"
      :class="p.class"
    >{{ data[p.props] }}</div>

  </BaseAcc>
</template>

<script setup lang="ts">
import type { Hotel } from '../../types/type';
import BaseAcc from './BaseAcc.vue';

defineProps<{
  index?: number
  data: Hotel
}>()

const infoRender = [
  { props: 'neighborhoodName', class: `
  body-m
  text-[var(--secondary-text)]
  mb-[16px]
  h-[18px]
  text-13
  ` },
]
</script>
