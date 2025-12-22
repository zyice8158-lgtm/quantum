<script setup lang="ts">
import { MESSAGE_TYPE } from './types'
import OperationBar from './components/OperationBar.vue'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// 绘制步骤，0: 空闲 1 : 绘制，2: 绘制over，3：编辑
enum StepEnum {
  Idle = 0,
  Drawing = 1,
  DrawingOver = 2,
  Editing = 3
}

const isMouse = ref(false)
const screenshotUrl = ref('')
const canvas = ref<HTMLCanvasElement | null>(null)
const image = ref<HTMLImageElement | null>(null)
const drawStep = ref<StepEnum>(StepEnum.Idle)
const startPoint = ref({ x: 0, y: 0 })
const pathPoints = ref<{ x: number; y: number }[]>([])
const Btns = ref(
  [] as {
    name: string
    text: string
  }[]
)
const screenShotMode = ref<'Area' | 'App'>('App')

const rectanglePoints = ref<{ x: number; y: number; width: number; height: number } | null>(null)
const dragMode = ref<'move' | 'resize' | null>(null)
const activeHandle = ref<string | null>(null)
const handleSize = 8 // 控制点大小
const ImgParams = {
  Path: '',
  FolderPath: ''
}

// 防止多次截图请求的标志
const isTakingScreenshot = ref(false)
// 加载状态
const isLoadingButtons = ref(false)
const RESOLUTION_OPTIONS = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 }
}
const targetResolution = ref<'720p' | '1080p'>('720p')
const showDefautToolbar = ref(false)
// 获取边界矩形
const getBoundingRect = (points: { x: number; y: number }[]) => {
  if (points.length === 0) return null
  let minX = points[0].x,
    minY = points[0].y
  let maxX = points[0].x,
    maxY = points[0].y
  if (!isMouse.value) {
    points.forEach((point) => {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    })
  } else {
    minX = Math.min(minX, points[points.length - 1].x)
    minY = Math.min(minY, points[points.length - 1].y)
    maxX = Math.max(maxX, points[points.length - 1].x)
    maxY = Math.max(maxY, points[points.length - 1].y)
  }

  // 考虑线条宽度，确保矩形边框完全可见
  const lineWidth = 9
  const halfLineWidth = lineWidth / 2

  // 确保矩形不会超出画布边界
  minX = Math.max(halfLineWidth, minX)
  minY = Math.max(halfLineWidth, minY)
  maxX = Math.min((canvas.value?.width || maxX) - halfLineWidth, maxX)
  maxY = Math.min((canvas.value?.height || maxY) - halfLineWidth, maxY)

  // 确保宽度和高度至少为1像素
  const width = Math.max(1, maxX - minX)
  const height = Math.max(1, maxY - minY)

  return {
    x: minX,
    y: minY,
    width: width,
    height: height
  }
}

// 创建线性渐变函数
const createGradient = (
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number }
) => {
  const cssAngle = 95.14
  const canvasAngle = (((450 - cssAngle) % 360) * Math.PI) / 180
  const centerX = rect.x + rect.width / 2
  const centerY = rect.y + rect.height / 2
  const diagonalLength = Math.sqrt(rect.width * rect.width + rect.height * rect.height)
  const startX = centerX - (diagonalLength / 2) * Math.cos(canvasAngle)
  const startY = centerY - (diagonalLength / 2) * Math.sin(canvasAngle)
  const endX = centerX + (diagonalLength / 2) * Math.cos(canvasAngle)
  const endY = centerY + (diagonalLength / 2) * Math.sin(canvasAngle)
  const gradient = ctx.createLinearGradient(startX, startY, endX, endY)

  gradient.addColorStop(0, '#5C8DFF')
  gradient.addColorStop(0.25, '#A079FF')
  gradient.addColorStop(0.5, '#D06AD6')
  gradient.addColorStop(0.75, '#EB6296')
  gradient.addColorStop(1, '#FF7257')

  return gradient
}

const maskAlpha = 0.4 // 遮罩透明度
// 修改 draw 函数
const draw = (isStop = false) => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  console.log('call-draw')
  // 清除画布
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  // 绘制全屏遮罩
  ctx.fillStyle = `rgba(0, 0, 0, ${maskAlpha})`
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

  // 绘制矩形选区（清除遮罩）
  if (rectanglePoints.value) {
    // 使用圆角路径清除遮罩
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'

    const rect = rectanglePoints.value
    const radius = 8 // 与边框圆角保持一致

    ctx.beginPath()
    ctx.roundRect(
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      radius
    )
    ctx.fill()
    ctx.restore()
  }
  // 绘制路径
  if (
    pathPoints.value.length > 1 &&
    !isMouse.value &&
    !isStop &&
    drawStep.value == StepEnum.Drawing
  ) {
    ctx.beginPath()
    const gradient = createGradient(ctx, {
      x: 0,
      y: 0,
      width: 1000,
      height: 0
    })
    ctx.strokeStyle = gradient
    ctx.lineWidth = 9
    ctx.moveTo(pathPoints.value[0].x, pathPoints.value[0].y)
    pathPoints.value.forEach((point) => {
      ctx.lineTo(point.x, point.y)
    })
    ctx.stroke()
  }

  // 绘制选区边框
  if (rectanglePoints.value && (isStop || isMouse.value || drawStep.value == StepEnum.Editing)) {
    const gradient = createGradient(ctx, rectanglePoints.value)

    ctx.beginPath()
    ctx.strokeStyle = gradient
    ctx.lineWidth = 9

    // 使用 roundRect 绘制圆角矩形
    const rect = rectanglePoints.value
    const radius = 8 // 圆角半径，可以根据需要调整

    // 对于靠近边缘的矩形，我们需要特殊处理以确保线条完整显示
    const lineWidth = 9;
    // 创建一个比画布稍大的裁剪区域，确保线条不会被截断
    ctx.save()
    ctx.beginPath()
    // 扩大裁剪区域，允许线条完全显示
    ctx.rect(
      -lineWidth,
      -lineWidth,
      canvas.value!.width + lineWidth * 2,
      canvas.value!.height + lineWidth * 2
    );
    ctx.clip();

    ctx.roundRect(
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      radius
    )
    ctx.stroke()
    ctx.restore()
  }
}

// 添加缩放系数计算
const getDevicePixelRatio = () => {
  return window.devicePixelRatio || 1
}

// 修改截取选中区域的函数
const captureSelectedArea = () => {
  if (!rectanglePoints.value || !screenshotUrl.value) return null

  // 创建临时 canvas
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return null

  // 获取设备缩放比
  const dpr = getDevicePixelRatio()

  // 创建图片对象
  const img = new Image()
  img.src = screenshotUrl.value

  return new Promise((resolve) => {
    img.onload = () => {
      // 原始选区尺寸
      const originalWidth = rectanglePoints.value!.width
      const originalHeight = rectanglePoints.value!.height

      // 获取目标分辨率配置
      const targetRes = RESOLUTION_OPTIONS[targetResolution.value]

      // 计算保持宽高比的尺寸
      const aspectRatio = originalWidth / originalHeight
      let targetWidth, targetHeight

      // 根据原始宽高比决定如何缩放
      if (originalWidth > originalHeight) {
        // 横屏图像
        targetWidth = targetRes.width
        targetHeight = Math.round(targetWidth / aspectRatio)
      } else {
        // 竖屏或正方形图像
        targetHeight = targetRes.height
        targetWidth = Math.round(targetHeight * aspectRatio)
      }

      // 设置 canvas 大小
      tempCanvas.width = targetWidth
      tempCanvas.height = targetHeight

      // 绘制并缩放图像到目标尺寸
      tempCtx.drawImage(
        img,
        rectanglePoints.value!.x * dpr,
        rectanglePoints.value!.y * dpr,
        rectanglePoints.value!.width * dpr,
        rectanglePoints.value!.height * dpr,
        0,
        0,
        targetWidth,
        targetHeight
      )

      // 转换为 base64
      const base64 = tempCanvas.toDataURL('image/jpeg', 0.8)
      resolve(base64)
    }
  })
}

// 添加判断鼠标位置
const getMousePosition = (e: MouseEvent | TouchEvent) => {
  if (!rectanglePoints.value) return null
  const point = getEventPoint(e)
  const rect = rectanglePoints.value
  console.log('rectanglePoints', rectanglePoints.value)

  // 检查是否在控制点上
  const handles = [
    { id: 'nw', x: rect.x, y: rect.y },
    { id: 'n', x: rect.x + rect.width / 2, y: rect.y },
    { id: 'ne', x: rect.x + rect.width, y: rect.y },
    { id: 'w', x: rect.x, y: rect.y + rect.height / 2 },
    { id: 'e', x: rect.x + rect.width, y: rect.y + rect.height / 2 },
    { id: 'sw', x: rect.x, y: rect.y + rect.height },
    { id: 's', x: rect.x + rect.width / 2, y: rect.y + rect.height },
    { id: 'se', x: rect.x + rect.width, y: rect.y + rect.height }
  ]

  for (const handle of handles) {
    if (
      Math.abs(point.x - handle.x) <= handleSize / 2 &&
      Math.abs(point.y - handle.y) <= handleSize / 2
    ) {
      return { type: 'resize', handle: handle.id }
    }
  }

  // 检查是否在选区内
  if (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  ) {
    return { type: 'move', handle: null }
  }

  return null
}
interface Point {
  x: number
  y: number
}
const setRectFunc = (startPoint: Point, endPoint: Point) => {
  // 直接设置矩形区域，而不触发事件
  // 考虑线条宽度，确保矩形边框完全可见
  const lineWidth = 9
  const halfLineWidth = lineWidth / 2

  let x = Math.min(startPoint.x, endPoint.x)
  let y = Math.min(startPoint.y, endPoint.y)
  let width = Math.abs(endPoint.x - startPoint.x)
  let height = Math.abs(endPoint.y - startPoint.y)

  // 确保矩形不会超出画布边界
  x = Math.max(halfLineWidth, x)
  y = Math.max(halfLineWidth, y)
  width = Math.min((canvas.value?.width || (x + width)) - x - halfLineWidth, width)
  height = Math.min((canvas.value?.height || (y + height)) - y - halfLineWidth, height)

  // 确保宽度和高度至少为1像素
  width = Math.max(1, width)
  height = Math.max(1, height)

  rectanglePoints.value = {
    x,
    y,
    width,
    height
  };

  // 设置状态为绘制完成
  drawStep.value = StepEnum.DrawingOver

  // 直接绘制
  draw(true)

  // 显示工具栏
  showToolBar(rectanglePoints.value)
}
// 检查操作类型
function checkOperation(e: MouseEvent | TouchEvent, forceMove = false) {
  if (drawStep.value === StepEnum.DrawingOver) {
    const position = getMousePosition(e)
    // console.log('当前状态：', position)
    if (forceMove) {
      dragMode.value = 'move'
      activeHandle.value = null
      return
    }
    if (position) {
      dragMode.value = position.type
      activeHandle.value = position.handle
      return
    } else {
      dragMode.value = null
      activeHandle.value = null
    }
  }
}

// 事件处理函数
const startDrawing = (e: MouseEvent | TouchEvent) => {
  const point = getEventPoint(e)
  startPoint.value = point
  // debugger
  checkOperation(e)
  if (dragMode.value) {
    hideToolbar()
    drawStep.value = StepEnum.Editing
    return
  }
  if (drawStep.value === StepEnum.Idle) {
    hideToolbar()
    drawStep.value = StepEnum.Drawing
    pathPoints.value = [point]
    rectanglePoints.value = null
  }
}

const moveDrawing = (e: MouseEvent | TouchEvent, forceMove = false) => {
  // 如果已经完成绘制且正在显示工具栏，则不处理移动事件
  if (drawStep.value === StepEnum.DrawingOver && barShow.value) {
    return
  }

  checkOperation(e, forceMove)
  const point = getEventPoint(e)
  // 获取画布尺寸作为边界
  const canvasWidth = canvas.value?.width || 0
  const canvasHeight = canvas.value?.height || 0

  if (dragMode.value === 'move' && drawStep.value === StepEnum.Editing) {
    // 移动整个选区
    const dx = point.x - startPoint.value.x
    const dy = point.y - startPoint.value.y
    if (rectanglePoints.value) {
      let newX = rectanglePoints.value.x + dx
      let newY = rectanglePoints.value.y + dy

      newX = Math.max(0, Math.min(newX, canvasWidth - rectanglePoints.value.width))
      newY = Math.max(0, Math.min(newY, canvasHeight - rectanglePoints.value.height))

      rectanglePoints.value.x = newX
      rectanglePoints.value.y = newY
    }
    startPoint.value = point
  } else if (
    dragMode.value === 'resize' &&
    activeHandle.value &&
    drawStep.value == StepEnum.Editing
  ) {
    // 调整选区大小
    const rect = rectanglePoints.value!
    switch (activeHandle.value) {
      case 'nw': // 左上角
        const newWidthNW = rect.width + rect.x - point.x
        const newHeightNW = rect.height + rect.y - point.y
        const newXNW = Math.max(0, Math.min(point.x, rect.x + rect.width))
        const newYNW = Math.max(0, Math.min(point.y, rect.y + rect.height))
        rect.width = newWidthNW
        rect.height = newHeightNW
        rect.x = newXNW
        rect.y = newYNW
        break

      case 'n': // 上边中点
        const newYN = Math.max(0, Math.min(point.y, rect.y + rect.height))
        rect.height += rect.y - newYN
        rect.y = newYN
        break

      case 'ne': // 右上角
        const newWidthNE = Math.min(canvasWidth - rect.x, Math.max(0, point.x - rect.x))
        const newYNE = Math.max(0, Math.min(point.y, rect.y + rect.height))
        rect.width = newWidthNE
        rect.height += rect.y - newYNE
        rect.y = newYNE
        break

      case 'w': // 左边中点
        const newXW = Math.max(0, Math.min(point.x, rect.x + rect.width))
        rect.width += rect.x - newXW
        rect.x = newXW
        break

      case 'e': // 右边中点
        rect.width = Math.min(canvasWidth - rect.x, Math.max(0, point.x - rect.x))
        break

      case 'sw': // 左下角
        const newXSW = Math.max(0, Math.min(point.x, rect.x + rect.width))
        const newHeightSW = Math.min(canvasHeight - rect.y, Math.max(0, point.y - rect.y))
        rect.width += rect.x - newXSW
        rect.height = newHeightSW
        rect.x = newXSW
        break

      case 's': // 下边中点
        rect.height = Math.min(canvasHeight - rect.y, Math.max(0, point.y - rect.y))
        break

      case 'se': // 右下角
        rect.width = Math.min(canvasWidth - rect.x, Math.max(0, point.x - rect.x))
        rect.height = Math.min(canvasHeight - rect.y, Math.max(0, point.y - rect.y))
        break
    }

    // 确保width和height不为负值
    if (rect.width < 0) {
      rect.x += rect.width
      rect.width = Math.abs(rect.width)
    }
    if (rect.height < 0) {
      rect.y += rect.height
      rect.height = Math.abs(rect.height)
    }
  } else if (drawStep.value == StepEnum.Drawing) {
    // 只有在绘制状态下才更新路径点和矩形区域
    const point = getEventPoint(e)
    pathPoints.value.push(point)
    rectanglePoints.value = getBoundingRect(pathPoints.value)
  }

  // 只有在绘制或编辑状态下才重绘
  if (drawStep.value == StepEnum.Drawing || drawStep.value == StepEnum.Editing) {
    draw()
  }
}

// 修改 stopDrawing 函数，确保正确结束绘制状态
const stopDrawing = async (e) => {
  console.log('stopDrawing')
  // 如果已经完成绘制，则不处理
  if (drawStep.value === StepEnum.DrawingOver) {
    return
  }

  const point = getEventPoint(e)
  pathPoints.value.push(point)

  if (dragMode.value) {
    dragMode.value = null
    activeHandle.value = null
    drawStep.value = StepEnum.DrawingOver
    showToolBar(rectanglePoints.value)
    return
  }

  if (drawStep.value != StepEnum.Drawing) return

  drawStep.value = StepEnum.DrawingOver
  if (pathPoints.value.length > 1) {
    rectanglePoints.value = getBoundingRect(pathPoints.value)
    draw(true)
    showToolBar(rectanglePoints.value)
  }
}

function reset() {
  console.log('reset')
  barShow.value = false
  Btns.value = []

  pathPoints.value = []
  rectanglePoints.value = null
  isImageLoaded.value = false
  screenshotUrl.value = ''
  if (image.value) {
    image.value.src = ''
  }

  drawStep.value = StepEnum.Idle
  dragMode.value = null
  activeHandle.value = null


  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
}

// 获取事件坐标点
const getEventPoint = (e: MouseEvent | TouchEvent) => {
  const rect = canvas.value?.getBoundingClientRect()
  if (!rect) return { x: 0, y: 0 }

  let clientX: number, clientY: number
  if (e instanceof MouseEvent) {
    isMouse.value = true
    clientX = e.clientX
    clientY = e.clientY
  } else {
    isMouse.value = false
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

function handleVisibilityChange() {
  // reset()
  if (document.visibilityState === 'visible') {
    console.log('显示', Date.now())
  } else if (document.visibilityState === 'hidden') {
    console.log('隐藏')
  }
}

onMounted(() => {
  window.api.onScreenshotShortcut((_, p) => {
    console.log('onScreenshotShortcut-----------', p)
    screenShotMode.value = p?.screenShotMode || 'Area'
    showDefautToolbar.value = p?.showDefautToolbar || false
    takeScreenshot()
  })
  window.api.onScreenshotShortcutApp((e, p) => {
    console.log('onScreenshotShortcutApp', e, p)
    const { x, y, width, height } = JSON.parse(p)
    screenShotMode.value = p?.screenshotMode || 'App'
    showDefautToolbar.value = p?.showDefautToolbar || false

    takeScreenshot().then(() => {
      nextTick(() => {
        setRectFunc({ x, y }, { x: x + width, y: y + height })
      })
    })
  })
  window.api.onShowSuggestion((_, p) => { 
        
    isLoadingButtons.value = false
    const { Params } = JSON.parse(p)
    Btns.value = Params.map((name: string) => {
      let text = name
      if (name === 'FACE_SEARCH') {
        text = 'FACE SEARCH'
      }
      if (name === 'GENERATE_SPEECH') {
        text = 'SPEAKER NOTES'
      }
      return { name, text }
    })

    Btns.value.push({ name: MESSAGE_TYPE.CANCLE, text: '' })
    Params.find((item: string) => item === 'Confirm') || Btns.value.push({ name: 'Confirm', text: '' })
  
  })
  window.api.onPreHide((e) => {
    console.log('onPreHide', e)
    cancelScreenshot()
  })

  //添加页面展示事件监听
  document.addEventListener('visibilitychange', handleVisibilityChange)

  if (canvas.value) {
    // 设置画布大小为容器大小
    const resizeCanvas = () => {
      console.log('resize canvas')
      const container = canvas.value?.parentElement
      if (container && canvas.value) {
        canvas.value.width = container.clientWidth
        canvas.value.height = container.clientHeight
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', () => { })
})

function cancelScreenshot() {
  console.log('执行取消了--------------')
  reset()
  nextTick(() => {
    window.api.hidWindow()
  })
}
const takeScreenshot = async () => {
  // 防止多次并发截图请求
  if (isTakingScreenshot.value) {
    console.log('Screenshot already in progress, skipping...')
    return
  }

  try {
    isTakingScreenshot.value = true
    Btns.value = []
    const start = Date.now()
    screenshotUrl.value = await window.api.takeScreenshot()
    console.log('Screenshot took', Date.now() - start, 'ms')
  } catch (error) {
    console.error('Error taking screenshot:', error)
  } finally {
    isTakingScreenshot.value = false
  }
}

function showToolBar(rect: { x; y; width; height } | null) {
  if (!rect) return
  Btns.value = []
  barShow.value = true
  cutRect.value = rect

  if(showDefautToolbar.value){
    isLoadingButtons.value = false
    Btns.value.push({ name: MESSAGE_TYPE.CANCLE, text: '' })
    Btns.value.push({ name: 'Confirm', text: '' })
    barShow.value = true

    return
  }
  getBtns().then(() => {
    barShow.value = true
    console.log('showToolBarrect', rect)
  })
}

function hideToolbar() {
  barShow.value = false
  console.log('hideToolbar-------------------')
}


const isImageLoaded = ref(false)
const onImageLoad = () => {
  nextTick(() => {
    isImageLoaded.value = true
  })
}
const barShow = ref(false)
const cutRect = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0
})
// 获取按钮数据
const getBtns = async () => {
  try {
    isLoadingButtons.value = true
    const base64 = await captureSelectedArea()
    const { filePath: Path, folderPath: FolderPath } = await window.api.saveImg(base64 ? base64 as string : '')
    Object.assign(ImgParams, { Path, FolderPath })

    // 调用C#通信获取按钮数据
    window.api.sendtoCsharp({
      SessionId: 'guid',
      Method: 'SendScreenshotToGetAction',
      TS: Date.now(),
      Params: ImgParams,
    })
  } catch (error) {
    console.error('Error getting buttons:', error)
    // 出错时使用默认按钮
  } finally {
    isLoadingButtons.value = false
  }
}

const send = async (msg: MESSAGE_TYPE) => {
  console.log('send', msg)
  if (msg === MESSAGE_TYPE.CANCLE  || msg === 'Confirm') {
    cancelScreenshot()
  } else {
    await window.api.sendtoCsharp({
      SessionId: 'guid',
      Method: 'SendScreenshotMethod',
      TS: Date.now(),
      Params: {
        Type: msg,
      },
      NeedReply: 0
    })
    cancelScreenshot()
  }
}
</script>

<template>
  <div class="screenshot-container">
    <img v-show="isImageLoaded && screenshotUrl" ref="image" class="screenshot" :src="screenshotUrl" alt="Screenshot"
      @load="onImageLoad" />
    <canvas ref="canvas" :class="[
      'draw-canvas',
      drawStep < StepEnum.DrawingOver ? 'draw' : '',
      dragMode === 'move' ? 'move' : '',
      activeHandle ? `${activeHandle}-resize` : ''
    ]" v-on="screenShotMode === 'Area' && drawStep !== StepEnum.DrawingOver ? {
        mousedown: startDrawing,
        mousemove: moveDrawing,
        mouseup: stopDrawing,
        mouseleave: stopDrawing,
        touchstart: startDrawing,
        touchmove: moveDrawing,
        touchend: stopDrawing
      } : {}"></canvas>
    <OperationBar v-show="barShow" :btns="Btns" :rect="cutRect" :screen-shot-mode="screenShotMode" @send-msg="send">
    </OperationBar>
  </div>
</template>

<style scoped>
.screenshot-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.screenshot {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
  image-rendering: -webkit-optimize-contrast;
  position: absolute;
  background-color: transparent;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  transform: scale(1);
  z-index: 1;
  display: none !important;
}

.draw-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.draw-canvas.draw {
  cursor: crosshair;
}

.draw-canvas.move {
  cursor: move;
}

.draw-canvas.n-resize,
.draw-canvas.s-resize {
  cursor: ns-resize;
}

.draw-canvas.e-resize,
.draw-canvas.w-resize {
  cursor: ew-resize;
}

.draw-canvas.nw-resize,
.draw-canvas.se-resize {
  cursor: nwse-resize;
}

.draw-canvas.ne-resize,
.draw-canvas.sw-resize {
  cursor: nesw-resize;
}

.border-mask {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: transparent;
  top: 0;
  left: 0;
  border: 4px solid #4663ff;
  box-sizing: border-box;
  pointer-events: none;
  border-radius: 8px;
  z-index: 10;
}

.tooltip {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20;
  /* display: none; */

  padding: 6px 13px;
  border-radius: 6px;
  background-color: #52525b;
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 12px;
  color: #fff;
}

.tool-bar {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 30;
  display: none;
}
</style>