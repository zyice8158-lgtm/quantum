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