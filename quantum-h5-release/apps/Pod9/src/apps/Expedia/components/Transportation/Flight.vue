<template>
  <div class="transportation-container
    w-[328px]
    p-[16px]
    rounded-[var(--radius-16)]
  ">
    <slot name="header"></slot>
    <div class="
      flex
      gap-[8px]
      items-center
      justify-start
    ">
      <SvgIcon class="
      w-[20px]
      h-[20px]
      " :name="`${data?.icon}`" />
      <div class="
        flex
        gap-[4px] items-center
      ">
        <div class="
          text-17
          body-l
          text-[var(--text-invest)]
          font-SF
        ">{{ data?.startTime }}</div>
        <div class="
          flex
          items-center
          justify-around
          text-[0px]
          rounded-[var(--radius-8)]
          w-[48px]
          h-[1px]
          box-border
          bg-[var(--secondary-text)]
          border-[2px]
          border-[var(--secondary-text)]
          align-middle
        ">
          <span
            v-for="(item, index) in (data?.stop ? (data?.stop > 3 ? 3 : data?.stop) : 0)"
            :key="`stop-circle-${index}`"
            class="
              high-contrast
              w-[8px]
              h-[8px]
              bg-[var(--secondary-text)]
              border-[2px]
              rounded-full
              border-[var(--color-surface)]
            "></span>
        </div>
        <div class="
          body-l
          text-[var(--text-invest)]
          font-SF
        ">{{ data?.endTime }}
          <sup v-if="data?.overDays">+{{ data?.overDays }}</sup>
        </div>
      </div>
    </div>
    <div :class="
      ['flex',
      'gap-[8px]',
      'items-center',
      'justify-start',
      !data.isRound ? 'my-[12px]' : 'mb-[12px]',
      !data.isRound ? 'h-[20px]' : 'h-[0px]']
    ">
      <div
        v-for="(equip, index) in (!data.isRound ? data?.equips : [])"
        :key="`equip-${index}`"
        class="
          high-contrast
          body-s
          rounded-[var(--radius-8)]
          bg-[var(--Info-badge)]
          text-[var(--color-surface-text-color)]
          py-[4px]
          px-[8px]
          font-SF
          font-mediumer
        ">{{ equip }}</div>
    </div>
    <div class="
      flex
      gap-[8px]
      items-end
      justify-between
      mb-[24px]
      font-SF-text
    ">
      <div>
        <div class="
          title-xs
          mb-[4px]
          text-[var(--text-invest)]
        ">
          <span class="text-13 font-SF-text">{{ data?.startLocation }}</span>
          <span class="
            inline-block
            w-[5px]
            h-[1px]
            bg-[var(--text-invest)]
            align-middle
            m-0
            mx-[3px]
            text-[0px] font-SF-text font-thin
          ">-</span>
          <span class="text-13 font-SF-text">{{ data?.endLocation }}</span>
        </div>
        <div class="
          title-xs
          text-13
          font-medium
          font-SF
          mb-[4px]
          text-[var(--text-invest)]">
          {{ data?.totalTime }}•{{ data?.stop ? `${data?.stop}${$t('stop') }` : $t('stop.Non') }}
        </div>
        <div class="
          mb-[4px]
          title-xs
          text-[var(--text-invest)]
          text-13 font-SF-text">{{ data?.type }}</div>
          <div
          v-if="data?.isRound"
          class="
            text-[var(--third-text)]
            font-SF-text
            text-12
            h-[16px]
            overflow-hidden
          "
        >
          {{ data?.airlineDes }}
        </div>
      </div>
      <div v-if="!data?.isRound" class="text-right">
        <div class="
          title-xl
          align-right
          text-[var(--text-invest)]
          no-ligature
          font-SF
          font-mediumer
        ">{{ priceFormat(data.unit, data?.totalPrice) }}</div>
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
    <slot></slot>
    <slot name="footer">
      <QButton v-if="!data?.isRound" class="card-btn w-full" @click="() => book()">
        {{ $t('book.button.expedia') }}
      </QButton>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

import SvgIcon from '@/components/SvgIcon.vue';
import { QButton } from "@libs/p-comps/volt/QButton/index.tsx";
import * as Type from '../../types/type';
import { priceFormat } from '@/apps/utils';

const props = defineProps<{
  data?: Type.Flight
}>()

const emit = defineEmits(['book'])

const openLink: (url: string) => undefined = inject('openLink') || (() => {})

function book() {
  props.data?.url && openLink(props.data?.url)
}
</script>

<style lang="css" scoped>
.transportation-container {
  border: 1px solid var(--color-line-window);
  box-shadow: 0 1px 1px 0 var(--color-line-window-shadow);
  font-weight: 500;
  background-color: var(--color-surface-flight-card);

  .transportation-container {
    padding: 0;
    border: none;
    box-shadow: none;
    width: 100%;
  }
}
</style>
