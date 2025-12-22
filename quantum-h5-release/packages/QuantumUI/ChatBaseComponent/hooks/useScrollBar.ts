// composables/useScroll.ts
import { ref, watchEffect, onUnmounted } from 'vue';

export function useScrollBar(targetRef: { value: HTMLElement | null }) {
  const scrollTop = ref(0);
  const scrollLeft = ref(0);
  const isScrolling = ref(false);
  
  let scrollTimer: number | null = null;
  
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    scrollTop.value = target.scrollTop;
    scrollLeft.value = target.scrollLeft;
    isScrolling.value = true;
    
    // 防抖处理，停止滚动一段时间后标记为非滚动状态
    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }
    
    scrollTimer = window.setTimeout(() => {
      isScrolling.value = false;
    }, 150);
  };
  
  const scrollToBottom = () => {
    if (targetRef.value) {
      targetRef.value.scrollTop = targetRef.value.scrollHeight;
    }
  };
  
  const scrollToTop = () => {
    if (targetRef.value) {
      targetRef.value.scrollTop = 0;
    }
  };
  
  // 监听目标元素变化并绑定事件
  watchEffect((onInvalidate) => {
    const target = targetRef.value;
    
    if (target) {
      target.addEventListener('scroll', handleScroll);
      
      // 清理函数
      onInvalidate(() => {
        target.removeEventListener('scroll', handleScroll);
        if (scrollTimer) {
          clearTimeout(scrollTimer);
        }
      });
    }
  });
  
  return {
    scrollTop,
    scrollLeft,
    isScrolling,
    scrollToBottom,
    scrollToTop
  };
}