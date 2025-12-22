<template>
  <div :class="[
    'group/level2',
    'location-container',
    'w-full',
    'text-[var(--primary-text)]'
  ]
  ">
    <Carousel
    :items="renderedData"
    >
    <template #default="{ item, index }">
        <Loading v-if="!item.loaded" type="0" :index="index" :src="item.src" @loaded="() => item.loaded = true" />
        <Image v-show="item.loaded" :key="index" :src="item.src" :class="[
          globalLevel ? 'w-[270px]' :
          'w-[253px] h-[199px] rounded-[var(--radius-24)] overflow-hidden'
        ]"
        >
          <div v-if="!globalLevel" class="
          absolute
          bottom-0
          left-0
          p-[16px]
          w-full
          text-[var(--secondary-text)]
          ">
            <div class="title-s ellipse">{{ item.name }}</div>
            <div class="label-xs mt-[12px] ellipse">{{ item.source }}</div>
          </div>
        </Image>
        <div v-if="globalLevel" class="
          mt-[10px]
          p-[14px]
          w-[270px]
        ">
          <div class="title-l text-[var(--primary-text)]">{{ item.name }}</div>
          <div class="
            mb-[14px]
            text-[var(--primary-text)]
            title-xs
          ">{{ item.region }}</div>
          <div class="
            body-m
            text-[var(--secondary-text)]
            no-ligature
          ">{{ item.des }}</div>
        </div>
      </template>
    </Carousel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Carousel from './Common/Carousel.vue';
import Image from './Common/Image.vue'
import Loading from './Common/Loading.vue';

import * as Type from '../types/type';

const props = defineProps<{
  globalLevel?: boolean
  locations: Type.Location[]
}>()

const renderedData = computed(() => {
  return props.locations.map(item => Object.assign({ loaded: false }, item))
})
</script>

<style lang="css" scope>
.location-container {
  .carousel-track {
    gap: 8px;
  }
}
</style>
