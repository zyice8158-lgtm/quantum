<template>
  <div :class="[
    'group/level1',
    'searched-result',
    typeClass,
    data.length === 1 ? 'searched-result-single' : ''
  ]" v-if="data">
    <Title :content="title || ''" :star="typeClass === 'hotel'" />
    <Brand :brand="brand" />
    <Carousel :items="data || []" class="
      mb-[24px]
      last:mb-0
    ">
      <template #default="{ item, index }">
        <component :is="cm[component]"
          :data="item"
          :key="`${component}-${index}`"
          :index="index"
        />
      </template>
    </Carousel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Carousel from './Common/Carousel.vue';
import Brand from './Common/Brand.vue';
import Title from './Common/Title.vue';
import Hotel from './Accommodation/Hotel.vue';
import Neighborhood from './Accommodation/Neighborhood.vue';
import Flight from './Transportation/Flight.vue';
import RoundFlight from './Transportation/RoundFlight.vue';
import Rental from './Accommodation/Rental.vue';
import Room from './Accommodation/Room.vue';

import * as Type from '../types/type';

const props = defineProps<{
  component: string
  data: Array<Type.Hotel | Type.Flight | Type.Neighborhood | Type.Room>
  title: string | 0
  brand?: {
    icon: string,
    title: string
  }
}>()

const cm : Record<string, unknown> = {
  'Flight': Flight,
  'RoundFlight': RoundFlight,
  'Hotel': Hotel,
  'Rental': Rental,
  'Room': Room,
  'Text': Text,
  'Location': Location,
  'Neighborhood': Neighborhood
}

const typeClass = computed(() => {
  if (props.component === 'Hotel') {
    return 'hotel'
  }

  if (props.component === 'Flight') {
    return 'flight'
  }
})
</script>

<style lang="css">
.searched-result {
  margin-bottom: 30px; /* 示例值 */
  &:last-child {
    margin-bottom: 0px;
  }

  &.hotel {
    .carousel-container .carousel-btn {
      top: 168px;
      transform: none;
    }
  }
}
</style>
