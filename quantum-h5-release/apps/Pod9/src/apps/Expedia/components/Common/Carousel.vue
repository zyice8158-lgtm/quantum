<template>
  <div v-if="items && items.length" :class="['carousel-container', defaultStyle ? '' : 'indicators-style']" ref="containerEle"
    @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd"
    @mousemove="() => operating = true" @mouseleave="() => operating = false"
  >
    <template v-if="!supportTouch && defaultStyle && viewRange < items.length">
      <QButton
        variant="neutral"
        class="qbtn_neutral_tonal carousel-btn carousel-btn-prev high-contrast"
        :class="{ 'carousel-btn-disabled': !canGoPrev }"
        :style="{ opacity: operating ? 1 : 0}"
        @click="handlePrev"
        @focus="() => operating = true"
        v-if="canGoPrev"
        >

        <SvgIcon name="right" style="transform: rotate(-180deg);" />
      </QButton>
      <QButton
        class="qbtn_neutral_tonal carousel-btn carousel-btn-next high-contrast"
        :class="{ 'carousel-btn-disabled': !canGoNext }"
        :style="{ opacity: operating ? 1 : 0}"
        @click="handleNext" @mouseenter.prevent
        @focus="() => operating = true"
        v-if="canGoNext"
      >
        <SvgIcon name="right" />
      </QButton>
    </template>
    <div v-else-if="!defaultStyle" class="carousel-indicators">
      <div
        v-for="(item, index) in renderItems"
        :key="`indicator-${index}`"
        :class="['carousel-indicator', currentIndex === index ? 'active' : '']"
        @click="() => activeCurrent(index)"
      ></div>
    </div>
    <div class="carousel-track"
      :style="trackStyle.style"
    >
      <div
        v-for="(item, index) in renderItems"
        :key="`${startIndex}-${getItemKey(item, index)}`"
        ref="itemEle"
        class="carousel-slide"
      >
        <slot :item="item" :index="index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import * as Type from '../../types/type';
import { QButton } from "@libs/p-comps/volt/QButton/index.tsx";

import SvgIcon from '@/components/SvgIcon.vue';
// TODO: Loop, Maybe two array Mutual dumping
type CarouselItem = Type.Location | string | Type.Hotel | Type.Flight | Type.Neighborhood | Type.Room

const props = withDefaults(defineProps<{
  items: CarouselItem[],
  getItemKey?: (item: any, index: number) => number
  defaultStyle?: boolean,
  loop?: boolean,
  step?: number,
  transitionDuration?: number
}>(), {
  defaultStyle: true,
  loop: false,
  step: 1,
  transitionDuration: 500,
  getItemKey: (item: any, index: number) => index
})

const supportTouch = ref(false)
const containerEle = ref<HTMLElement | null>(null)
const itemEle = ref<Array<HTMLElement> | null>(null)
const operating = ref(false)

const currentIndex = ref(0)
const startIndex = ref(0)
const renderItems = ref<Array<CarouselItem>>(props.items)
const viewRange = ref(0)
const buffer = 2

const viewLength = computed(() => {
  return Math.ceil(viewRange.value)
})
const offset = computed(() => {
  return Math.round((viewLength.value - viewRange.value) * 100) / 100
})

const normal = computed(() => {
  return startIndex.value + viewLength.value <= props.items.length
})

watch([viewLength, startIndex], () => {
  if (!props.defaultStyle) {
    return
  }

  const renderedLength = (viewLength.value || 1) + buffer
  renderItems.value = normal.value ? props.items.slice(startIndex.value, startIndex.value + renderedLength)
  : props.items.slice(-(renderedLength))
}, {
  immediate: true
})

const canGoPrev = computed(() => {
  return !sliding.value && (props.loop || startIndex.value !== 0 || trackStyle.value.offset !== 0)
})

const canGoNext = computed(() => {
  return !sliding.value && (props.loop || (
    (offset.value !== 0 && Math.abs(trackStyle.value.offset) !== offset.value) ? (startIndex.value + viewLength.value) <= props.items.length :
    (startIndex.value + viewLength.value) < props.items.length
  ))
})

const sliding = ref(false)
const trackStyle = ref({
  offset: 0,
  style: {
    transform: '', transition: ''
  }
})

const PREV_GAP = 0.057

function handlePrevDefault() {
  sliding.value = true
  const width = ((itemEle.value && itemEle.value[0]) || {})?.offsetWidth || 0

  if (trackStyle.value.offset !== 0 && startIndex.value === 0) {
    trackStyle.value.offset = 0

    startIndex.value = 0

    sliding.value = false
  } else if (startIndex.value !== 0) {
    if (offset.value) {
      setTimeout(() => {
        startIndex.value = startIndex.value - 1

        trackStyle.value.style = {
          transform: `translateX(-${width + PREV_GAP * width}px)`,
          transition: `none`
        }
        sliding.value = false
      }, props.transitionDuration)
    } else {
      startIndex.value = startIndex.value - 1
    }
  }

  if (offset.value) {
    trackStyle.value.style = {
      transform: `translateX(0px)`,
      transition: `transform ${props.transitionDuration + 100}ms ease`
    }
  } else {
    nextTick(() => {
      trackStyle.value.style = {
        transform: `translateX(-${width}px)`,
        transition: `none`
      }

      setTimeout(() => {
        trackStyle.value.style = {
          transform: `translateX(-${width * offset.value}px)`,
          transition: `transform ${props.transitionDuration + 100 }ms ease`
        }
        sliding.value = false
      }, 10)
    })
  }
}

let NEXT_GAP = 0.114

function handleNextDefault() {
  const width = ((itemEle.value && itemEle.value[0]) || {})?.offsetWidth || 0
  sliding.value = true

  if (trackStyle.value.offset === 0 && offset.value !== 0) {
    trackStyle.value.offset = -(offset.value)
    trackStyle.value.style = {
      transform: `translateX(-${offset.value * width * (1+NEXT_GAP)}px)`,
      transition: `transform ${props.transitionDuration}ms ease`
    }

    sliding.value = false
  } else {
    trackStyle.value.style = {
      transform: `translateX(-${offset.value * width * (1+NEXT_GAP) + width + 0.047 * width}px)`,
      transition: `transform ${props.transitionDuration }ms ease`
    }

    setTimeout(() => {
      startIndex.value = startIndex.value + 1

      trackStyle.value.style = {
        transform: `translateX(-${offset.value * width * (1+NEXT_GAP)}px)`,
        transition: `none`
      }
      sliding.value = false
    }, props.transitionDuration)
  }
}

function handlePrev() {
  if (props.loop) {

  } else {
    handlePrevDefault()
  }

  updateVisibility()
}

function handleNext() {
  if (props.loop) {

  } else {
    handleNextDefault()
  }

  updateVisibility()
}

const startX = ref(0)
const deltaX = ref(0)
const isDragging = ref(false);
const storeTrackStyle = ref({
  o: true,
  transform: '',
  transition: ''
})

function handleTouchStart(e:TouchEvent) {
  if (!supportTouch.value) {
    return
  }

  startX.value = e.touches[0]?.clientX || 0;
  isDragging.value = true;
}
function handleTouchMove(e: TouchEvent) {
  if (!supportTouch.value) {
    return
  }

  if (!isDragging.value) return;
  const currentX = e.touches[0]?.clientX || 0;
  const offset = currentX - startX.value;
  // Maybe some animation?


  if (storeTrackStyle.value.o) {
    const style = trackStyle.value.style
    storeTrackStyle.value.transform = style.transform
    storeTrackStyle.value.transition = style.transition

    storeTrackStyle.value.o = false
  }

  const regex = /\(([^)]+)\)/; // 匹配括号内的内容
  const match = storeTrackStyle.value.transform.match(regex);
  const x = parseInt(match?.length ? match[1] : '0')

  trackStyle.value.style = {
    transform: `translateX(${offset <= 0 ? x - 10 : x + 10}px)`,
    transition: `transform ${props.transitionDuration }ms ease`
  }

  deltaX.value = offset
}
function handleTouchEnd() {
  if (!supportTouch.value) {
    return
  }

  storeTrackStyle.value && (trackStyle.value.style = {
    transform: storeTrackStyle.value.transform,
    transition: storeTrackStyle.value.transition
  })

  if (deltaX.value <= 0 && canGoNext.value) {
    handleNext()
  } else if (deltaX.value > 0 && canGoPrev.value) {
    handlePrev()
  }

  isDragging.value = false;
  deltaX.value = 0;
  storeTrackStyle.value = {
    o: true,
    transform: '', transition: ''
  }
}

function activeCurrent(index: number) {
  const itemWidth = ((itemEle.value && itemEle.value[0]) || {})?.offsetWidth || 0

  trackStyle.value.style = {
    transform: `translateX(-${index * itemWidth}px)`,
    transition: `transform ${props.transitionDuration}ms ease`
  }

  currentIndex.value = index
}

function initSize() {
  const containerWidth = containerEle.value?.offsetWidth || 0
  const itemWidth = ((itemEle.value && itemEle.value[0]) || {})?.offsetWidth || 0
  const length = Math.round(containerWidth / itemWidth * 100) / 100

  viewRange.value = length

  if (containerWidth <= 375 && !!('ontouchstart' in window)) {
    supportTouch.value = true
  }

  return length
}

function enableFocus(slide: HTMLElement) {
  const focusable = slide.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]'
  );

  focusable.forEach((el: HTMLElement) => {
    if (el.hasAttribute('data-original-tabindex')) {
      el.tabIndex = parseInt(el.getAttribute('data-original-tabindex'));
      el.removeAttribute('data-original-tabindex');
    } else {
      el.removeAttribute('tabindex');
    }
  });
}

function disableFocus(slide: HTMLElement) {
  const focusable = slide.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]'
  );

  focusable.forEach((el: HTMLElement) => {
    if (el.tabIndex >= 0) {
      el.setAttribute('data-original-tabindex', `${el.tabIndex}`);
    }
    el.tabIndex = -1;
  });
}

function updateVisibility() {
  let timer: null | number = null

  timer = setTimeout(() => {
    timer && clearTimeout(timer)
    const containerRect = containerEle.value.getBoundingClientRect();

    itemEle.value.forEach(slide => {
      const slideRect = slide.getBoundingClientRect();

      console.log(containerRect.right, slideRect.left)

      if (containerRect.right - slideRect.left > 30) {
        enableFocus(slide)
        slide.setAttribute('aria-hidden', 'false');
      } else {
        disableFocus(slide)
        slide.setAttribute('aria-hidden', 'true');
      }
    });
  }, 500)
}

onMounted(() => {
  if (props.defaultStyle) {
    nextTick(() => {
      initSize()

      updateVisibility()
    })
  }
})
</script>
