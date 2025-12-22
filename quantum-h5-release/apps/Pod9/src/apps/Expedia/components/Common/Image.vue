<template>
  <div class="image-container" :style="computedStyle">
    <!-- 加载状态 -->
    <div class="loading-image" v-if="loading">
      <SvgIcon name="loading" />
    </div>
    <div class="loading-state" v-if="loading && src">
      <slot name="loading">
      </slot>
    </div>
    <!-- 加载失败通知 -->
    <div v-else-if="error" class="error-state">
      <slot name="error">
        <p>{{ $t('image.fail') }}</p>
      </slot>
    </div>
    <!-- 图片 -->
    <img
      v-show="loaded"
      :src="src"
      alt="image"
      @load="handleLoad"
      @error="handleError"
    />
    <slot v-if="loaded"></slot>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';

const props = defineProps<{
  index?: number // 0~3
  src?: string,
  style?: {
    width?: string,
    height?: string,
    backgroundColor?: string
  }
}>()
const emit = defineEmits(['loaded', 'error', 'syc-color']);

const gradient = {
  0: 'var(--color-ai-step-1)', // rgba( 92, 141, 255, .5) #5C8DFF
  .25: 'var(--color-ai-step-4)', // rgba( 160, 121, 255, .5) #A079FF
  .5: 'var(--color-ai-step-7)', // rgba( 208, 106, 214, .5) #D06AD6
  .75: 'var(--color-ai-chrome-gradient-step-38)', // rgba( 235, 98, 150, .5) #EB6296
  1: 'var(--color-ai-chrome-gradient-step-51)' // rgba( 255, 114, 87, .5) #FF7257
}
const computedStyle = computed(() => {
  const start = (props.index || 0) % 4 / 4

  return Object.assign(loading.value ? {
    background: `linear-gradient(95deg, ${gradient[start]} 0%, ${gradient[start + 0.25]} 100%)`,
  } : {}, props.style || {})
})

const loading = ref(true);
const error = ref(false);

const handleLoad = () => {
  loading.value = false;
  error.value = false;

  emit('loaded')
};

const handleError = () => {
  loading.value = false;
  error.value = true;
  console.log('Failed to load image.');
  emit('error')
};

const loaded = computed(() => {
  return props.src && !loading.value && !error.value
})

onMounted(() => {
  emit('syc-color', {
    background: computedStyle.value.background
  })

  if (!props?.src) {
    return
  }

  const img = new Image();
  img.src = props.src;
  if (img.complete) {
    handleLoad();
  } else {
    img.onload = handleLoad;
    img.onerror = handleError;
  }
});
</script>

<style scoped>
.image-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.loading-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  mix-blend-mode: overlay;

  img {
    width: 95px;
    height: auto;
  }

  svg {
    width: 40%;
    height: 40%;
  }
}

.loading-state,
.error-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  color: var(--secondary-text);
}

img {
  width: 100%;
  height: 100%;
}
</style>
