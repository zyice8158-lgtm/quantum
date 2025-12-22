export const awaitTime = (timeout: number) => new Promise((resolve) => setTimeout(resolve, timeout))

/** 等待指定帧数后执行 */
export const nextAnimationFrame = (count: number = 1) => {
  let i = 1
  return new Promise((resolve) => {
    const next = () => {
      if (i < count) {
        i++
        requestAnimationFrame(next)
      } else {
        resolve(true)
      }
    }
    requestAnimationFrame(next)
  })
}
