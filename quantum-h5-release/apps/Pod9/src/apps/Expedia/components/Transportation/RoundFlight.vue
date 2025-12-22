<template>
  <Flight :data="Object.assign({
    isRound: true
  }, data[0])">
    <template v-slot:header>
      <div class="flex mb-[24px] items-end justify-between">
        <div>
          <div class="title-m
          text-[var(--primary-text)]
            no-ligature
            font-SF
            font-mediumer
          ">{{ $t('roundTrip') }}</div>
          <div
            class="
              title-xs
            text-[var(--secondary-text)]
            text-13
            mb-0
            whitespace-nowrap
            font-SF-text
            mt-[4px]
            "
          >
            {{ `${formatDate(data[0].origin.departure.time)} - ${formatDate(data[1].origin.departure.time)}` }}
          </div>
        </div>
        <div class="text-right">
          <div class="
            title-xl
            align-right
            text-[var(--primary-text)]
            no-ligature
            font-SF
            font-mediumer
          ">{{ priceFormat(data[1]?.unit, data[1]?.totalPrice) }}</div>
          <div class="
            title-xs
            text-[var(--third-text)]
            text-13
            mb-0
            whitespace-nowrap
            font-SF-text
          ">
          <!-- {{ data?.unit }}  -->
          {{ $t('flight.unite') }}</div>
        </div>
      </div>
    </template>
    <Flight :data="Object.assign({
      isRound: true
    }, data[1])"></Flight>
    <QButton class="card-btn w-full" @click="() => book()">
      {{ $t('book.button.expedia') }}
    </QButton>
    <QButton variant="text" class="card-btn w-full" @click="() => book()">
      {{ $t('book.button.fare') }}
    </QButton>
  </Flight>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import * as Type from '../../types/type';
import Flight from './Flight.vue';
import { QButton } from "@libs/p-comps/volt/QButton/index.tsx";
import { priceFormat } from '@/apps/utils';

const props = defineProps<{
  data: Array<Type.Flight>
}>()
const openLink: (url: string) => undefined = inject('openLink') || (() => {})
const formatDate: () => string = inject('formatDate')
function book() {
  props.data[1]?.url && openLink(props.data[1]?.url)
}
</script>
