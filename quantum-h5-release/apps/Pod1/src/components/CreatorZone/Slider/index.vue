<template>
  <div
    class="slider"
    ref="sliderRef"
    :class="{
      disabled: props.disabled,
    }"
    @mousemove="
      (e) => {
        EmouseMove(e);
      }
    "
    @touchmove="
      (e) => {
        EmouseMove(e);
      }
    "
  >
    <div class="circle left"></div>

    <div
      class="slider__inner"
      v-helper="
        () => {
          return {
            role: 'slider',
            ariaLabel: props.ariaLabel,
            attributes: {
              'aria-disabled': props.disabled,
              'aria-valuemin': props.min,
              'aria-valuemax': props.max,
              'aria-valuenow': currentValue,
              'aria-valuetext': currentValue,
              'aria-orientation': 'horizontal',
            },
            left: () => {
              calc(-props.step);
            },
            right: () => {
              calc(props.step);
            },
          };
        }
      "
    >
      <div class="line">
        <div
          :style="{
            width: numeral(currentValue)
              .subtract(props.min)
              .divide(numeral(props.max).subtract(props.min).value())
              .format('0%'),
          }"
        ></div>
      </div>

      <div
        class="trigger"
        :style="{
          // (currentValue - props.min) / (props.max - props.min)
          left: numeral(currentValue)
            .subtract(props.min)
            .divide(numeral(props.max).subtract(props.min).value())
            .format('0%'),
        }"
        @mousedown="
          (e) => {
            selected = true;

            point = {
              x: e.clientX,
              y: e.clientY,
            };
          }
        "
        @touchstart="
          (e) => {
            selected = true;

            point = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
            };
          }
        "
      ></div>
    </div>

    <div class="circle right"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import numeral from "numeral";

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  showTip: {
    type: Boolean,
    default: true,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 1,
  },
  step: {
    type: Number,
    default: 0.01,
  },
  value: {
    type: Number,
    default: 0,
  },
  onChange: {
    type: Function,
    default: () => {},
  },
  ariaLabel: {
    type: String,
    default: "",
  },
});

const sliderRef = ref(null);

const currentValue = ref(0);

// 滑块是否被选中
const selected = ref(false);

// 最后一次触控位置
const point = ref({
  x: 0,
  y: 0,
});

const calc = (value) => {
  if (props.disabled) {
    return;
  }

  currentValue.value = numeral(currentValue.value).add(value).value();

  if (currentValue.value < props.min) {
    currentValue.value = props.min;
  }

  if (currentValue.value > props.max) {
    currentValue.value = props.max;
  }

  props.onChange(currentValue.value);
};

const EmouseMove = (e) => {
  if (selected.value) {
    let movementX = 0;
    let movementY = 0;

    if (e?.touches?.[0]) {
      movementX = e.touches[0].clientX - point.value.x;
      movementY = e.touches[0].clientY - point.value.y;

      point.value = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else {
      movementX = e.clientX - point.value.x;
      movementY = e.clientY - point.value.y;

      point.value = {
        x: e.clientX,
        y: e.clientY,
      };
    }

    const { width } = sliderRef.value.querySelector(".slider__inner").getBoundingClientRect();

    // (props.max - props.min) * (movementX / width);
    calc(
      numeral(props.max)
        .subtract(props.min)
        .multiply(numeral(movementX).divide(width).value())
        .value()
    );
  }
};

const EmouseUp = () => {
  selected.value = false;
};

onMounted(() => {
  window.addEventListener("mouseup", EmouseUp);

  window.addEventListener("touchend", EmouseUp);
  window.addEventListener("touchcancel", EmouseUp);
});

onUnmounted(() => {
  window.removeEventListener("mouseup", EmouseUp);

  window.removeEventListener("touchend", EmouseUp);
  window.removeEventListener("touchcancel", EmouseUp);
});

watch(
  [() => props.value],
  () => {
    currentValue.value = props.value;
  },
  { immediate: true }
);
</script>

<style lang="less" scoped>
.slider {
  width: 132px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  &.disabled {
    opacity: 0.38;
  }

  > div + div {
    margin-left: 10px;
  }

  .circle {
    border: 2px solid var(--color-text-on-surface);
    border-radius: 50%;

    &.left {
      width: 8px;
      height: 8px;
    }

    &.right {
      width: 14px;
      height: 14px;
    }
  }

  &__inner {
    flex: 1;
    height: 4px;
    position: relative;

    .line {
      height: 100%;
      background: var(--color-surface-container-highest);
      border-radius: 4px;
      overflow: hidden;

      > div {
        height: 100%;
        background: var(--color-primary-primary);
      }
    }

    .trigger {
      width: 16px;
      height: 16px;
      background-color: var(--color-surface);
      border: 1px solid var(--color-outlines-outline-variant);
      border-radius: 50%;
      cursor: grab;
      position: absolute;
      left: 0;
      top: 50%;
      translate: -50% -50%;

      &:active {
        cursor: grabbing;
      }
    }
  }
}
</style>
