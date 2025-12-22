<template>
  <Loading :index="index" v-if="!loaded" type="1" :src="data.images[0]" @loaded="() => loaded = true" />
  <div v-show="loaded" class="
    w-[270px]
  ">
    <div class="
      w-full
      h-[165px]
      mb-[10px]
      rounded-[var(--radius-24)]
      overflow-hidden
    ">
      <Carousel v-if="hasMultiPicture"
        :items="data.images"
      >
        <template #default="{ item, index }">
          <Image :key="index" :index="index" :src="item as string"/>
        </template>
      </Carousel>

      <Image v-else :src="data.images[0]"/>
    </div>

    <div class="
      pt-[10px]
      px-[14px]
    ">
      <div class="
        title-l
        text-[var(--text-invest)]
      ">{{ data.name }}</div>
      <div class="
        body-m
        text-[var(--secondary-text)]
        mb-[10px]
        no-ligature
      ">{{ data.country }}</div>
      <div class="
        title-m
        text-[var(--text-invest)]
        mb-[8px]
        no-ligature
      ">
        <span class="align-middle">${{ data.price }}</span>
        <span class="
          align-middle
          body-m
          text-[var(--secondary-text)]
          ml-[4px]">{{ $t('hotel.unit') }} {{ data.month }}</span>
      </div>
      <div class="flex gap-[8px]">
        <div class="
          body-s-bold
          px-[8px] py-[4px]
          rounded-[var(--radius-4)]
          bg-[var(--color-surface-card)]
          text-[var(--secondary-text)]
        "
          v-for="(item, index) in data.feature"
          :key="`${data.name}-${index}`"
        >{{ item }}</div>
      </div>
      <div class="
        body-m
        text-[var(--secondary-text)]
        my-[8px]
      ">{{ data.description }}</div>
      <QButton class="w-full">
        {{ $t('hotel.button.more') }}
      </QButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import type { Neighborhood } from '../../types/type';

import Carousel from '../Common/Carousel.vue';
import Image from '../Common/Image.vue';
import Loading from '../Common/Loading.vue';

const props = defineProps<{
  index?: number
  data: Neighborhood
}>()

const loaded = ref(false)

const hasMultiPicture = computed(() => {
  return props.data.images.length > 1
})
</script>
