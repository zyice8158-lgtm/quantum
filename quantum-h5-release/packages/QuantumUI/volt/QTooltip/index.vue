<template>
  <div class="q-tooltip-wrapper">
    <!-- 触发元素 -->
    <div
      ref="triggerRef"
      class="q-tooltip-trigger"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <slot />
    </div>

    <!-- 提示框内容 -->
    <Teleport to="body">
      <Transition name="q-tooltip-fade">
        <div
          v-show="visible"
          ref="tooltipRef"
          class="q-tooltip-content"
          :class="placementClass"
          :style="tooltipStyle"
        >
          <slot name="content">{{ content }}</slot>
          <div class="q-tooltip-arrow" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, type CSSProperties, type PropType } from 'vue';

type Placement = 'top' | 'bottom' | 'left' | 'right';
type Trigger = 'hover' | 'click' | 'focus' | 'manual';

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  placement: {
    type: String as PropType<Placement>,
    default: 'top'
  },
  trigger: {
    type: String as PropType<Trigger>,
    default: 'hover'
  },
  showDelay: {
    type: Number,
    default: 0
  },
  hideDelay: {
    type: Number,
    default: 0
  },
  offset: {
    type: Number,
    default: 8
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits<{
  show: [];
  hide: [];
}>();

// 状态
const visible = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);

// 定时器
let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

// 计算样式
const tooltipStyle = ref<CSSProperties>({});

const placementClass = computed(() => `q-tooltip-content--${props.placement}`);

// 清除定时器
const clearTimers = () => {
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
};

// 计算位置
const updatePosition = () => {
  if (!triggerRef.value || !tooltipRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const tooltipRect = tooltipRef.value.getBoundingClientRect();
  const { offset } = props;

  const positions: Record<Placement, CSSProperties> = {
    top: {
      top: `${triggerRect.top - tooltipRect.height - offset + window.scrollY}px`,
      left: `${triggerRect.left + (triggerRect.width - tooltipRect.width) / 2 + window.scrollX}px`
    },
    bottom: {
      top: `${triggerRect.bottom + offset + window.scrollY}px`,
      left: `${triggerRect.left + (triggerRect.width - tooltipRect.width) / 2 + window.scrollX}px`
    },
    left: {
      top: `${triggerRect.top + (triggerRect.height - tooltipRect.height) / 2 + window.scrollY}px`,
      left: `${triggerRect.left - tooltipRect.width - offset + window.scrollX}px`
    },
    right: {
      top: `${triggerRect.top + (triggerRect.height - tooltipRect.height) / 2 + window.scrollY}px`,
      left: `${triggerRect.right + offset + window.scrollX}px`
    }
  };

  tooltipStyle.value = positions[props.placement];
};

// 显示
const show = () => {
  if (props.disabled) return;

  clearTimers();
  showTimer = setTimeout(() => {
    visible.value = true;
    requestAnimationFrame(updatePosition);
    emit('show');
  }, props.showDelay);
};

// 隐藏
const hide = () => {
  clearTimers();
  hideTimer = setTimeout(() => {
    visible.value = false;
    emit('hide');
  }, props.hideDelay);
};

// 事件处理
const handleMouseEnter = () => {
  if (props.trigger === 'hover') show();
};

const handleMouseLeave = () => {
  if (props.trigger === 'hover') hide();
};

const handleClick = () => {
  if (props.trigger === 'click') {
    visible.value ? hide() : show();
  }
};

const handleFocus = () => {
  if (props.trigger === 'focus') show();
};

const handleBlur = () => {
  if (props.trigger === 'focus') hide();
};

// 暴露方法
defineExpose({ show, hide });

// 清理
onUnmounted(clearTimers);
</script>

<style scoped lang="less">
@import './index.less';
</style>
