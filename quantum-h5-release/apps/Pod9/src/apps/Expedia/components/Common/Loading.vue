<template>
  <div :class="['loading-container', typeClass[type]]">
    <div class="l-image">
      <Image :src="src" :index="index" @loaded="() => $emit('loaded')" @error="() => $emit('error')" @syc-color="(bgColor) => bgColorC = bgColor" />
      <!-- <div class="text-loading">
        <div class="text-level-1"></div>
        <div class="text-level-2"></div>
      </div> -->
    </div>
    <div class="l-title" :style="bgColorC"></div>
    <div class="l-title" :style="bgColorC"></div>
    <div class="l-des" :style="bgColorC"></div>
    <div class="l-price" :style="bgColorC"></div>
    <div class="l-button" :style="bgColorC"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Image from './Image.vue';

const emit = defineEmits(['loaded', 'error']);
const typeClass = {
  0: 'location-loading',
  1: 'hotel-loading'
}
const props = defineProps<{
  index?: number
  src?: string
  type: '0' | '1'
}>()
const bgColorC = ref(null)

onMounted(() => {
  if (!props.src) {
    emit('loaded')
  }
})
</script>

<style lang="css" scope>
@keyframes moveAnimation {
  0% {
    transform: translateX(-37.5%);
  }
  100% {
    transform: translateX(37.5%);
  }
}
.loading-container {
  .l-image {
    width: 270px;
    height: 270px;
    border-radius: 24px;
    margin-bottom: 24px;
    &::after, *::after {
      display: none;
      animation: none;
    }
  }

  &.location-loading {
    .l-image {
      position: relative;
      width: 253px;
      height: 199px;
      border-radius: 40px;
      overflow: hidden;
    }

    .text-loading {
      position: absolute;
      bottom: 16px;
      left: 16px;

      .text-level-1 {
        width: 175px;
        height: 19px;
        margin-bottom: 9px;
        background: #FFF;
      }
      .text-level-2 {
        width: 78px;
        height: 12px;
        background: #FFF;
      }
    }
  }

  &.hotel-loading {

    .l-title,
    .l-des,
    .l-price,
    .l-button,
    .l-image {
      border-radius: 40px;
      margin-bottom: 8px;
      position: relative;
      overflow: hidden;
      background: transparent;

      &::after {
        position: absolute;
        top: 0;
        inset-inline-end: -150%;
        bottom: 0;
        inset-inline-start: -150%;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.06) 25%, rgba(255, 255, 255, 0.2) 37%, rgba(255, 255, 255, 0.06) 63%);
        animation-name: moveAnimation;
        animation-duration: 1.4s;
        animation-timing-function: 
    ease;
        animation-iteration-count: infinite;
        content: "";
      }
    }
    .l-image {
      width: 270px;
      height: 270px;
      border-radius: 24px;
      margin-bottom: 24px;
      &::after, *::after {
        display: none;
        animation: none;
      }
    }
    .l-title {
      width: 240px;
      height: 20px;
    }

    .l-des {
      width: 150px;
      height: 20px;
    }
    .l-price {
      width: 88px;
      height: 20px;
      margin-bottom: 22px;
    }

    .l-button {
      width: 133px;
      height: 36px;
    }
  }
}
</style>