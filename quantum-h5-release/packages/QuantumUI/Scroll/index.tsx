import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  PropType,
  reactive,
  ref,
  Ref,
} from 'vue';
import { useResizeObserver } from '@vueuse/core';
import { useUserSelect } from '@quantum/use';

import './style.less';



export type DirectionStr = 'H' | 'V';

/**
 * 检测元素是否有滚动条
 * - direction: 默认 H
 */
export const checkHasScrollbar = (el: Element, direction: DirectionStr = 'H') => {
  if (!el) return false;
  if (direction == 'H') {
    return el.scrollWidth > el.clientWidth;
  } else {
    return el.scrollHeight > el.clientHeight;
  }
};

export type RatioStr = `${string}%`;

/**
 * 获取模拟scrollBar 百分比
 */
export const getScrollbarRatio = (el: Element, direction: DirectionStr = 'H') => {
  if (direction == 'H') {
    return ((el.clientWidth * 100) / el.scrollWidth + '%') as RatioStr;
  } else {
    return ((el.clientHeight * 100) / el.scrollHeight + '%') as RatioStr;
  }
};

/**
 * 获取模拟scrollBar 百分比
 */
export const getScrollbarmove = (el: Element, direction: DirectionStr = 'H') => {
  if (direction == 'H') {
    return ((el.scrollLeft * 100) / el.scrollWidth + '%') as RatioStr;
  } else {
    return ((el.scrollTop * 100) / el.scrollHeight + '%') as RatioStr;
  }
};

const LScrollBar = defineComponent({
  name: 'LScrollBar',
  inheritAttrs: false,
  props: {
    ratio: {
      type: String as PropType<RatioStr>,
      default: '100%',
    },
    move: {
      type: String as PropType<RatioStr>,
      default: '0%',
    },
    direction: {
      type: String as PropType<DirectionStr>,
    },
  },
  setup(props, { attrs }) {
    const style = computed(() => {
      return `--scrollbar-ratio: ${props.ratio};--scrollbar-move:${props.move}`;
    });
    return () => {
      if (props.ratio === '100%') {
        return null;
      } else {
        return (
          <div class={['lscroll-track', `lscroll-track-${  props.direction}`]}>
            <div class="lscroll-thumb" style={style.value} {...attrs}></div>
          </div>
        );
      }
    };
  },
});

export type LScrollExpose = {
  srcollEl: Ref<HTMLElement>;
};

export type LScrollPlacement = 'inside' | 'outside';

/** 模拟滚动条 */
export const LScroll = defineComponent({
  name: 'LScroll',
  inheritAttrs: false,
  props: {
    bodyConf: {
      type: Object,
      default: () => ({}),
    },
    placement: {
      type: String as PropType<LScrollPlacement>,
      default: 'inside',
    },
    shadow: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const state = reactive({
      ratioH: '100%' as RatioStr,
      ratioV: '100%' as RatioStr,
      moveH: '0%' as RatioStr,
      moveV: '0%' as RatioStr,
    });
    const srcollElRef = ref<HTMLElement | null>(null);
    const onMouseenter = (e: MouseEvent) => {
      const target = e.target as Element;
      const scrollBody = target.querySelector('.lscroll-body')!;
      state.ratioH = getScrollbarRatio(scrollBody, 'H');
      state.ratioV = getScrollbarRatio(scrollBody, 'V');
    };
    const onMouseleave = () => {
      if (!mousedownState.direction) {
        state.ratioH = '100%';
        state.ratioV = '100%';
      }
    };
    const { onStartUserSelect, onEndUserSelect } = useUserSelect();
    const mousedownState = {
      direction: null as DirectionStr | null,
      /** 点击位置在滑块上偏移量 */
      offset: 0,
      /** 滑块的大小 */
      size: 0,
      /** 轨道起点 */
      trackStart: 0,
      /** 轨道终点 */
      trackEnd: 0,
    };
    const onMove = (e: MouseEvent) => {
      const p = mousedownState.direction == 'H' ? e.x : e.y;
      let scrollRatio = 0;
      if (p < mousedownState.trackStart) {
        scrollRatio = 0;
      } else if (p > mousedownState.trackEnd) {
        scrollRatio =
          (mousedownState.trackEnd - mousedownState.offset) /
          mousedownState.size;
      } else {
        scrollRatio = (p - mousedownState.trackStart) / mousedownState.size;
      }
      const srcollEl = srcollElRef.value!;
      if (mousedownState.direction == 'H') {
        srcollEl.scrollLeft = scrollRatio * srcollEl.scrollWidth;
      } else {
        srcollEl.scrollTop = scrollRatio * srcollEl.scrollHeight;
      }
    };
    const offMove = () => {
      mousedownState.direction = null;
      mousedownState.offset = 0;
      mousedownState.size = 0;
      mousedownState.trackStart = 0;
      mousedownState.trackEnd = 0;
      onMouseleave();
      onEndUserSelect();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', offMove);
    };
    const onMousedown = (direction: DirectionStr, e: MouseEvent) => {
      mousedownState.direction = direction;
      onStartUserSelect();
      const thumbEl = e.target as Element;
      const trackEl = thumbEl.parentElement!;
      const thumbRect = thumbEl.getBoundingClientRect();
      const trackRect = trackEl.getBoundingClientRect();
      if (direction == 'H') {
        mousedownState.offset = e.x - thumbRect.left;
        mousedownState.size = trackRect.width;
        mousedownState.trackStart = trackRect.left + mousedownState.offset;
        mousedownState.trackEnd =
          trackRect.right - thumbRect.width + mousedownState.offset;
      } else {
        mousedownState.offset = e.y - thumbRect.top;
        mousedownState.size = trackRect.height;
        mousedownState.trackStart = trackRect.top + mousedownState.offset;
        mousedownState.trackEnd =
          trackRect.bottom - thumbRect.height + mousedownState.offset;
      }

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', offMove);
    };
    const shadowState = reactive({
      left: false,
      right: false,
    });
    const onScroll = (e: UIEvent) => {
      const target = e.target as Element;
      state.moveH = getScrollbarmove(target, 'H');
      state.moveV = getScrollbarmove(target, 'V');
      shadowState.left = target.scrollLeft > 0;
      shadowState.right =
        target.scrollLeft + target.clientWidth < target.scrollWidth;
    };
    const onWheel = (e) => {
      e.stopPropagation();
    };
    onMounted(() => {
      window.addEventListener('wheel', offMove);
    });
    onBeforeUnmount(() => {
      window.removeEventListener('wheel', offMove);
    });
    useResizeObserver(srcollElRef, async (entries) => {
      const [entry] = entries;
      const srcollEl = entry!.target as HTMLElement;
      shadowState.left = srcollEl.scrollLeft > 0;
      shadowState.right =
        srcollEl.scrollLeft + srcollEl.clientWidth < srcollEl.scrollWidth;
    });
    expose({ srcollEl: srcollElRef } as LScrollExpose);
    return () => {
      return (
        <div
          class={[
            'lscroll relative',
            `lscroll-${props.placement}`,
            {
              'lscroll-shadow-left': props.shadow && shadowState.left,
              'lscroll-shadow-right': props.shadow && shadowState.right,
            },
          ]}
          {...attrs}
          onMouseenter={onMouseenter}
          onMouseleave={onMouseleave}
        >
          <div
            ref={srcollElRef}
            class="lscroll-body h-full w-full overflow-auto"
            {...(props.bodyConf || {})}
            onScroll={onScroll}
            onWheel={onWheel}
          >
            {slots.default?.()}
          </div>
          <LScrollBar
            direction="H"
            ratio={state.ratioH}
            move={state.moveH}
            onMousedown={onMousedown.bind(null, 'H')}
          />
          <LScrollBar
            direction="V"
            ratio={state.ratioV}
            move={state.moveV}
            onMousedown={onMousedown.bind(null, 'V')}
          />
        </div>
      );
    };
  },
});
