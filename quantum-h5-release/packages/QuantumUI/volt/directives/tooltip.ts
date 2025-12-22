/**
 * Tooltip 自定义指令
 *
 * 完全独立实现的 Vue 自定义指令，提供便捷的提示信息功能
 * 不依赖任何组件，直接通过 DOM 操作实现所有功能
 *
 * 使用方法：
 * 1. 导入指令：import { vTooltip } from '@libs/p-comps/volt/directives/tooltip'
 * 2. 全局注册：app.directive('tooltip', vTooltip)
 * 3. 使用指令：
 *    - 简单使用：<button v-tooltip="提示信息">按钮</button>
 *    - 高级使用：<button v-tooltip="{ content: '提示信息', placement: 'bottom', trigger: 'click' }">按钮</button>
 */
import type { Directive } from 'vue';
import { nextTick } from 'vue';

/**
 * Tooltip 指令选项类型接口
 * 与 QTooltip 组件的 props 保持一致
 */
export interface TooltipDirectiveOptions {
  /** 提示框内容 */
  content: string;
  /** 提示框位置，可选值：'top' | 'bottom' | 'left' | 'right'，默认 'top' */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** 触发方式，可选值：'hover' | 'click' | 'focus' | 'blur' | 'all'，默认 'hover' */
  trigger?: 'hover' | 'click' | 'focus' | 'blur' | 'all';
  /** 是否禁用提示框，默认 false */
  disabled?: boolean;
  /** 延迟显示时间（毫秒），默认 0 */
  delay?: number;
  /** 提示框与目标元素的偏移量（像素），默认 8 */
  offset?: number;
}

// Tooltip实例管理
interface TooltipInstance {
  el: HTMLElement;
  container: HTMLElement;
  contentElement: HTMLElement;
  options: TooltipDirectiveOptions;
  showTooltip: () => void;
  hideTooltip: () => void;
  toggleTooltip?: () => void;
  timeout?: ReturnType<typeof setTimeout> | null;
}

// 创建自定义指令
const vTooltip: Directive = {
  mounted(el, binding) {
    // 获取配置选项
    const options = normalizeOptions(binding.value);
    // 如果禁用，则不创建tooltip
    if (options.disabled) return;

    // 准备tooltip容器
    const container = createContainer();
    // 创建内容元素
    const contentElement = createContentElement(options.content);
    container.appendChild(contentElement);

    // 创建并存储实例信息
    const instance: TooltipInstance = {
      el,
      container,
      contentElement,
      options,
      timeout: null,
      // 不使用debounce，直接处理，因为我们要支持自定义delay
      showTooltip: () => {
        // 清除之前的定时器
        if (instance.timeout) {
          clearTimeout(instance.timeout);
        }

        // 如果禁用，则不显示
        if (instance.options.disabled) return;
        console.log('showTooltip', instance.options.delay);
        // 使用自定义delay
        instance.timeout = setTimeout(() => {
          showTooltipHandler(instance);
        }, instance.options.delay);
      },
      hideTooltip: () => {
        // 清除之前的定时器
        if (instance.timeout) {
          clearTimeout(instance.timeout);
          instance.timeout = null;
        }

        hideTooltipHandler(instance);
      }
    };

    // 添加点击切换功能
    if (options.trigger === 'click' || options.trigger === 'all') {
      instance.toggleTooltip = () => {
        if (instance.options.disabled) return;

        if (container.style.opacity === '1') {
          instance.hideTooltip();
        } else {
          instance.showTooltip();
        }
      };
    }

    // 保存实例引用
    el._tooltip = instance;

    // 绑定事件处理
    bindEvents(el, instance);

    // 确保元素可聚焦（如果需要focus触发）
    ensureFocusable(el);
  },

  updated(el, binding) {
    const newOptions = normalizeOptions(binding.value);

    // 处理从禁用状态变为启用状态
    if (el._tooltip === undefined && !newOptions.disabled) {
      // 重新调用mounted逻辑
      vTooltip.mounted!(el, binding);
      return;
    }

    // 处理从启用状态变为禁用状态
    if (el._tooltip && newOptions.disabled) {
      // 清理并移除实例
      vTooltip.unmounted!(el);
      return;
    }

    if (!el._tooltip) return;

    const instance = el._tooltip;

    // 检查选项是否有变化
    const optionsChanged = optionsChangedCheck(instance.options, newOptions);

    if (optionsChanged) {
      // 更新选项
    instance.options = newOptions;

    // 更新内容
    updateContentElement(instance.contentElement, newOptions.content);

      // 如果当前tooltip是显示的，重新计算位置
      if (instance.container.style.opacity === '1') {
        updateTooltipPosition(instance);
      }

      // 重新绑定事件
      unbindEvents(el);
      bindEvents(el, instance);

      // 重新确保元素可聚焦
      ensureFocusable(el);
    }
  },

  unmounted(el) {
    if (!el._tooltip) return;

    const instance = el._tooltip;

    // 清除定时器
    if (instance.timeout) {
      clearTimeout(instance.timeout);
    }

    // 解绑事件
    unbindEvents(el);

    // 清理DOM和资源
    cleanupInstance(instance);

    // 移除引用
    delete el._tooltip;
  }
};

// 辅助函数：标准化选项
function normalizeOptions(value: string | TooltipDirectiveOptions): TooltipDirectiveOptions {
  if (typeof value === 'string') {
    return {
      content: value,
      disabled: false,
      delay: 300,
      offset: 8
    };
  }
  return {
    content: value.content || '',
    placement: value.placement || 'top',
    trigger: value.trigger || 'hover',
    disabled: value.disabled || false,
    delay: value.delay || 300,
    offset: value.offset || 8
  };
}

// 辅助函数：创建容器
function createContainer(): HTMLElement {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '1999';
  container.style.opacity = '0';
  container.style.transition = 'opacity 0.2s ease-in-out';
  document.body.appendChild(container);
  return container;
}

// 辅助函数：创建内容元素
function createContentElement(content: string): HTMLElement {
  const contentElement = document.createElement('div');
  contentElement.className = 'tooltip-content';

  // 设置tooltip样式
  contentElement.style.position = 'relative';
  contentElement.style.display = 'inline-block';
  contentElement.style.padding = '4px 12px';
  contentElement.style.fontSize = '12px';
  contentElement.style.lineHeight = '1.5';
  contentElement.style.color = 'var(--color-text-on-surface)';
  contentElement.style.backgroundColor = 'var(--color-surfaces-surface-bright)';
  contentElement.style.borderRadius = '4px';
  contentElement.style.whiteSpace = 'nowrap';
  contentElement.style.overflow = 'hidden';
  contentElement.style.textOverflow = 'ellipsis';
  contentElement.style.maxWidth = '300px';
  contentElement.style.boxShadow = '0 1px 2px 0 var(--effects-elevation-drop-shadow-heavy), 0 2px 6px 2px var(--effects-elevation-drop-shadow-light)';
  // 设置内容
  contentElement.textContent = content;

  return contentElement;
}

// 辅助函数：更新内容元素
function updateContentElement(element: HTMLElement, content: string): void {
  element.textContent = content;
}

// 辅助函数：防抖
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(this: any, ...args: Parameters<T>) {
    const context = this;

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

// 辅助函数：显示tooltip处理
function showTooltipHandler(instance: TooltipInstance): void {
  const { container } = instance;

  // 确保tooltip内容已渲染
  nextTick(() => {
    // 更新位置
    updateTooltipPosition(instance);

    // 显示tooltip
    container.style.opacity = '1';
  });
}

// 辅助函数：隐藏tooltip处理
function hideTooltipHandler(instance: TooltipInstance): void {
  const { container } = instance;

  // 隐藏tooltip
  container.style.opacity = '0';
}

// 辅助函数：绑定事件处理函数
function bindEvents(el: HTMLElement, instance: TooltipInstance): void {
  const { trigger } = instance.options;

  // 确保事件处理函数不会在禁用状态下执行
  const safeShow = () => {
    if (!instance.options.disabled) {
      instance.showTooltip();
    }
  };

  const safeHide = () => {
    instance.hideTooltip();
  };

  const safeToggle = () => {
    if (!instance.options.disabled && instance.toggleTooltip) {
      instance.toggleTooltip();
    }
  };

  // 根据trigger类型绑定相应的事件
  if (trigger === 'hover' || trigger === 'all') {
    el.addEventListener('mouseenter', safeShow);
    el.addEventListener('mouseleave', safeHide);
  }

  if (trigger === 'click' || trigger === 'all') {
    el.addEventListener('click', safeToggle);
  }

  if (trigger === 'focus' || trigger === 'all') {
    el.addEventListener('focus', safeShow);
  }

  if (trigger === 'blur' || trigger === 'all') {
    el.addEventListener('blur', safeHide);
  }

  // 存储事件处理函数引用，便于解绑
  (el as any)._tooltipHandlers = {
    show: safeShow,
    hide: safeHide,
    toggle: safeToggle
  };
}

// 辅助函数：解绑事件处理函数
function unbindEvents(el: HTMLElement): void {
  if (!el._tooltip) return;

  // 使用存储的事件处理函数引用进行解绑
  const handlers = (el as any)._tooltipHandlers;
  if (handlers) {
    const instance = el._tooltip;
    const { trigger } = instance.options;

    if (trigger === 'hover' || trigger === 'all') {
      el.removeEventListener('mouseenter', handlers.show);
      el.removeEventListener('mouseleave', handlers.hide);
    }

    if (trigger === 'click' || trigger === 'all') {
      el.removeEventListener('click', handlers.toggle);
    }

    if (trigger === 'focus' || trigger === 'all') {
      el.removeEventListener('focus', handlers.show);
    }

    if (trigger === 'blur' || trigger === 'all') {
      el.removeEventListener('blur', handlers.hide);
    }

    // 清理引用
    delete (el as any)._tooltipHandlers;
  }
}

// 辅助函数：确保元素可聚焦
function ensureFocusable(el: HTMLElement): void {
  if (!el.hasAttribute('tabindex') && !el.hasAttribute('href') && !el.hasAttribute('contenteditable')) {
    el.setAttribute('tabindex', '-1');
  }
}

// 辅助函数：检查选项是否变化
function optionsChangedCheck(oldOptions: TooltipDirectiveOptions, newOptions: TooltipDirectiveOptions): boolean {
  return (
    oldOptions.content !== newOptions.content ||
    oldOptions.placement !== newOptions.placement ||
    oldOptions.trigger !== newOptions.trigger
  );
}

// 辅助函数：清理实例
function cleanupInstance(instance: TooltipInstance): void {
  // 清理DOM和资源
  if (instance.container && instance.container.parentNode) {
    document.body.removeChild(instance.container);
  }
}

// 辅助函数：更新tooltip位置
function updateTooltipPosition(instance: TooltipInstance): void {
  const { el, container, contentElement, options } = instance;
  const elRect = el.getBoundingClientRect();
  // 获取content元素的实际尺寸
  const contentRect = contentElement.getBoundingClientRect();
  const placement = options.placement || 'top';

  // 位置偏移量
  const offset = options.offset || 8;
  // 根据不同placement计算位置
  switch (placement) {
    case 'top':
      container.style.top = `${elRect.top - contentRect.height - offset}px`;
      container.style.left = `${elRect.left + (elRect.width - contentRect.width) / 2}px`;
      break;
    case 'bottom':
      container.style.top = `${elRect.bottom + offset}px`;
      container.style.left = `${elRect.left + (elRect.width - contentRect.width) / 2}px`;
      break;
    case 'left':
      container.style.top = `${elRect.top + (elRect.height - contentRect.height) / 2}px`;
      container.style.left = `${elRect.left - contentRect.width - offset}px`;
      break;
    case 'right':
      container.style.top = `${elRect.top + (elRect.height - contentRect.height) / 2}px`;
      container.style.left = `${elRect.right + offset}px`;
      break;
  }

  // 确保不超出视口
  ensureInViewport(container);
}

// 辅助函数：确保在视口内
function ensureInViewport(element: HTMLElement): void {
  const rect = element.getBoundingClientRect();
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  // 检查并调整水平位置
  if (rect.left < 0) {
    element.style.left = '0px';
  } else if (rect.right > viewport.width) {
    element.style.left = `${viewport.width - rect.width}px`;
  }

  // 检查并调整垂直位置
  if (rect.top < 0) {
    element.style.top = '0px';
  } else if (rect.bottom > viewport.height) {
    element.style.top = `${viewport.height - rect.height}px`;
  }
}

/**
 * 为HTMLElement添加_tooltip属性的类型定义
 * 用于存储tooltip实例引用
 */
declare global {
  interface HTMLElement {
    _tooltip?: TooltipInstance;
    _tooltipHandlers?: {
      show: () => void;
      hide: () => void;
      toggle: () => void;
    };
  }
}

/**
 * 默认导出的tooltip指令
 * 可直接导入使用或全局注册
 */
export default vTooltip;

/**
 * 具名导出，方便解构导入
 */
export { vTooltip };
