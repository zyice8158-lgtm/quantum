<template>
  <Loading :index="index" v-if="!loaded" type="1" :src="data.images[0]" @loaded="() => loaded = true" />
  <div v-show="loaded" class="accom-hotel
    w-[270px]
    font-medium
    overflow-hidden
    ">
    <div class="accom-header
      w-full
      h-[270px]
      overflow-hidden
    ">
      <Carousel v-if="data.images.length > 1"
        :items="data.images"
      >
        <template #default="{ item, index }">
          <Image :key="index" :index="index" :src="item as string"/>
        </template>
      </Carousel>

      <Image v-else :src="data.images[0]"/>
    </div>
    <div class="accom-content
      px-[8px]
      py-[16px]
      font-SF-text
    ">
      <div class="
      flex
      justify-between
      items-start
      gap-[10px]
      ">
        <div class="
        accom-name
        body-l
        text-[var(--text-invest)]
        text-17
        h-[47px]
        overflow-y-hidden
        font-SF
        ">
          <slot name="name"></slot>
        </div>
        <div v-if="data.rate" class="
        high-contrast
        body-s
        text-[var(--color-on-success)]
        w-[35px]
        h-[24px]
        px-[8px]
        py-[4px]
        rounded-[var(--radius-8)]
        bg-[var(--color-success)]
        font-SF
        font-mediumer
      ">{{ data.rate }}</div>
      </div>
      <slot></slot>
      <div class="
        body-l
        text-[var(--text-invest)]
        text-17
        font-SF
      ">{{ priceFormat(data.unit, data.totalPrice) }} {{ $t('hotel.total') }}</div>
      <div class="
        title-xs
        text-13
        text-[var(--secondary-text)]">
        {{ data.requirement }}
      </div>
      <div class="
        title-xs
        mb-[12px]
        text-[var(--secondary-text)]
        text-13
      ">
        <!-- {{ data.unit }} •  -->
        {{ data.priceDes }}
      </div>
      <QButton class="card-btn w-full" @click="() => book()">
        {{bookText || `${$t('book.button.expedia')}`}}
      </QButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import Carousel from '../Common/Carousel.vue';
import Image from '../Common/Image.vue';
import Loading from '../Common/Loading.vue';
import type { Hotel } from '../../types/type';
import {  QButton } from '@libs/p-comps/volt/QButton';
import { priceFormat } from '@/apps/utils';

const props = defineProps<{
  index?: number
  data: Hotel
  brand?: string
  bookText?: string
  callbackStr?: (data: Hotel) => string
}>()

import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const emit = defineEmits(['book']);

const loaded = ref(false)

function generateStr(data: Hotel) {
  return `${t('hotel.notify')} ${data.name}.`
}

const openLink: (url: string, brand: string) => undefined = inject('openLink') || (() => {})

function book() {
  // window.topTunnel.emit({
  //   type: 'notify',
  //   payload: {
  //     message: props.callbackStr ? props.callbackStr(props.data) : generateStr(props.data)
  //   }
  // })

  props.data?.url && openLink(props.data?.url, (props.brand || 'expedia')?.toLowerCase().includes('vrbo') ? 'vrbo' : 'expedia')
}
</script>

<style lang="css" scoped>
.accom-hotel {
  .accom-header {
    border-radius: 24px;
  }

}
.searched-result-single {
  .accom-hotel {
    width: 358px;
    border-radius: 24px;
    border: 1px solid var(--color-line-window);
    background: var(--color-surface-card);
    box-shadow: 0 1px 5px 0 var(--color-line-window-shadow);

    .accom-header {
      width: 100%;
      height: 155px;
      border-radius: 18px 18px 0 0;
    }

    .accom-name {
      height: auto;
    }

    .accom-content {
      padding: 16px;
    }
  }
}
</style>
