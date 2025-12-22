export * from './cz'

export function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
/**
 * 设置 Cookie
 * @param name Cookie 名称
 * @param value Cookie 值
 * @param days 过期时间（单位：天），不传则默认 7 天
 */
export function setCookie(name: string, value: string, days: number = 7) {
  const expiresDate = new Date()
  expiresDate.setDate(expiresDate.getDate() + days)
  const expires = expiresDate.toUTCString()

  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/;domain=.lenovo.com;`
}

/**
 * 读取 Cookie
 * @param name Cookie 名称
 * @returns Cookie 值，如果不存在则返回 null
 */
export function getCookie(name: string): string | null {
  const cookieArr = document.cookie.split(';')
  for (let i = 0; i < cookieArr.length; i++) {
    const [key, val] = cookieArr[i].trim().split('=')
    if (key === name) {
      return decodeURIComponent(val)
    }
  }
  return null
}

/**
 * 删除 Cookie
 * @param name Cookie 名称
 */
export function removeCookie(name: string) {
  // 通过将过期时间设置到一个过去的时间来删除
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

/** 是否是webview 环境 */
export const isWebView = (window as any).chrome && (window as any).chrome.webview

document.documentElement.setAttribute('in-webview', isWebView ? 'true' : 'false')

export function conditionalTimer(
  callback: () => boolean | void | Promise<boolean | void>,
  interval: number,
  immediate: boolean = false
): () => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let isRunning = true;

  const stop = () => {
    isRunning = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const execute = async () => {
    if (!isRunning) return;

    try {
      // 执行回调函数
      const result = await Promise.resolve(callback());

      // 如果回调函数返回 true，则继续下一次定时执行
      if (isRunning && result === true) {
        timeoutId = setTimeout(execute, interval);
      } else {
        // 否则停止定时器
        stop();
      }
    } catch (error) {
      console.error('定时器回调执行出错:', error);
      stop();
    }
  };

  // 如果设置为立即执行，则立即调用一次
  if (immediate) {
    execute();
  } else {
    timeoutId = setTimeout(execute, interval);
  }

  return stop;
}

