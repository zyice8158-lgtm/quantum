<template>
  <div class="redraw" ref="redrawRef">
    <div class="redraw-wrap">
      <canvas
        class="original-canvas chess"
        :style="{
          ...getChessStyle(redrawImage.width),
          left: `${translate.x}px`,
          top: `${translate.y}px`,
          transform: `scale(${scale})`,
        }"
      ></canvas>

      <canvas
        class="stage-canvas"
        :style="{
          left: `${translate.x}px`,
          top: `${translate.y}px`,
          transform: `scale(${scale})`,
        }"
        @mousedown="
          (e) => {
            refreshCanvas(e)
            refreshInput(e)
          }
        "
        @mouseup="
          (e) => {
            refreshCanvas(e)
            refreshInput(e)
          }
        "
        @mouseenter="
          (e) => {
            refreshCanvas(e)
          }
        "
        @mousemove="
          (e) => {
            refreshCanvas(e)
            refreshCursor(e)
          }
        "
        @mouseleave="
          (e) => {
            refreshCursor(e)
          }
        "
        @touchstart="
          (e) => {
            refreshCanvas(e)
            refreshInput(e)
          }
        "
        @touchmove="
          (e) => {
            refreshCanvas(e)
            refreshCursor(e)
          }
        "
        @touchend="
          (e) => {
            refreshCanvas(e)
            refreshCursor(e)
            refreshInput(e)
          }
        "
        @touchcancel="
          (e) => {
            refreshCanvas(e)
            refreshCursor(e)
            refreshInput(e)
          }
        "
      ></canvas>
    </div>

    <div
      v-if="brushDiameterTip.visible"
      class="cursor"
      :style="{
        width: `${brushDiameter}px`,
        height: `${brushDiameter}px`,
        left: `${brushDiameterTip.x}px`,
        top: `${brushDiameterTip.y}px`,
        transform: `translate(-50%, -50%) scale(${scale})`,
      }"
    ></div>

    <div
      v-if="inputBox.visible"
      class="input"
      :style="{
        left: `${inputBox.x}px`,
        top: `${inputBox.y}px`,
      }"
      v-automation="'redraw_input'"
    >
      <textarea
        :placeholder="$t('creatorZone.components.redraw.placeholder')"
        :value="content"
        :maxlength="SESSIONID_PROMPT_MAX_LENGTH"
        @input="
          (e) => {
            setContent(e, false)
            setTextareaHeight(e)
          }
        "
        @blur="
          (e) => {
            setContent(e, true)
            setTextareaHeight(e)
          }
        "
        @keydown.enter="
          (e) => {
            e.preventDefault()

            if (content.length > 0) {
              send(getInfo())
            }
          }
        "
        v-helper="
          () => {
            return {
              role: 'textbox',
              attributes: {
                'aria-placeholder': $t('creatorZone.components.redraw.placeholder'),
              },
              focus: () => {},
              blur: () => {},
              click: () => {},
            };
          }
        "
      ></textarea>

      <div
        v-if="content.length > 0"
        class="send active"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                e.target.classList.add('hovered')
              },
              cancel: (e) => {
                e.target.classList.remove('hovered')
              },
            }
          }
        "
        v-helper="
          () => {
            return {
              role: 'button',
              ariaLabel: $t('creatorZone.components.redraw.send'),
              focus: () => {},
              blur: () => {},
              click: () => {
                send(getInfo());
              },
            };
          }
        "
      >
        <div class="icon"></div>
      </div>
      <div v-else class="send">
        <div class="icon"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, nextTick, onUnmounted } from 'vue'
import { SESSIONID_PROMPT_MAX_LENGTH, IMAGE_SNAPSHOT_MAX_LENGTH } from '@/constant'
import { useSnapshots } from '@/hooks/snapshots'
import { colorToRGBA, getPointOnLine, getChessStyle } from '@/utils'

import checkRegionWorker from './workers/checkRegion.ts?raw'

const { currentSnapshot: currentImageSnapshot, setSnapshots: setImageSnapshots } =
  useSnapshots(IMAGE_SNAPSHOT_MAX_LENGTH)

const props = defineProps({
  maxSizeRatio: {
    type: Number,
    default: 1,
  },
  showInputBox: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  brushDiameter: {
    type: Number,
    default: 0,
  },
  brushColor: {
    type: String,
    default: 'rgba(92, 141, 255, 0.7)',
  },
  selectedColor: {
    type: String,
    default: '#ffffff',
  },
  unselectedColor: {
    type: String,
    default: '#000000',
  },
  send: {
    type: Function,
    default: (value) => {},
  },
})

const redrawRef = ref(null)

const redrawImage = ref({
  ele: null,
  width: 0,
  height: 0,
})

const translate = ref({
  x: 0,
  y: 0,
})
const scale = ref(1)

const brushDiameterTip = ref({
  visible: false,
  x: 0,
  y: 0,
})
const isBrushing = ref(false)
const brushPoint = ref({
  x: 0,
  y: 0,
})

const content = ref<string>('')
const inputBox = ref({
  visible: false,
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
})

// mask 信息是否为空
const isEmpty = ref(true)

const initCanvas = async (imageUrl) => {
  const originalImage: HTMLImageElement = await new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      resolve(image)
    }

    image.src = imageUrl
  })

  redrawImage.value = {
    ...redrawImage.value,
    ele: originalImage,
    width: originalImage.width,
    height: originalImage.height,
  }

  const canvasWrap: HTMLElement = redrawRef.value.querySelector('.redraw-wrap')

  let styleScale = 1

  if (
    ((canvasWrap.clientWidth * props.maxSizeRatio) / originalImage.width) * originalImage.height <=
    canvasWrap.clientHeight * props.maxSizeRatio
  ) {
    styleScale = (canvasWrap.clientWidth * props.maxSizeRatio) / originalImage.width
  } else {
    styleScale = (canvasWrap.clientHeight * props.maxSizeRatio) / originalImage.height
  }

  translate.value = {
    x: (canvasWrap.clientWidth - originalImage.width) / 2,
    y: (canvasWrap.clientHeight - originalImage.height) / 2,
  }

  scale.value = styleScale

  const originalCanvas: HTMLCanvasElement = redrawRef.value.querySelector(
    '.redraw-wrap .original-canvas'
  )
  originalCanvas.width = originalImage.width
  originalCanvas.height = originalImage.height

  const originalCtx = originalCanvas.getContext('2d')
  originalCtx.drawImage(originalImage, 0, 0)

  const stageCanvas: HTMLCanvasElement = redrawRef.value.querySelector('.redraw-wrap .stage-canvas')
  stageCanvas.width = originalImage.width
  stageCanvas.height = originalImage.height
}

const refreshCanvas = async (e) => {
  const canvas: HTMLCanvasElement = redrawRef.value.querySelector('.redraw-wrap .stage-canvas')
  const ctx = canvas.getContext('2d')

  let offsetX = e.offsetX
  let offsetY = e.offsetY

  if (e?.touches?.[0]) {
    offsetX =
      (e.touches[0].clientX - e.touches[0].target.getBoundingClientRect().left) * (1 / scale.value)
    offsetY =
      (e.touches[0].clientY - e.touches[0].target.getBoundingClientRect().top) * (1 / scale.value)
  }

  if (e.type === 'mousedown' || e.type === 'touchstart') {
    isBrushing.value = true

    brushPoint.value = {
      x: offsetX,
      y: offsetY,
    }
  } else if (e.type === 'mouseenter') {
    brushPoint.value = {
      x: offsetX,
      y: offsetY,
    }
  } else if (e.type === 'mousemove' || e.type === 'touchmove') {
    if (isBrushing.value) {
      const offscreenCanvas = new OffscreenCanvas(
        Math.floor(props.brushDiameter / 2) * 2,
        Math.floor(props.brushDiameter / 2) * 2
      )
      const offscreenCtx = offscreenCanvas.getContext('2d')

      offscreenCtx.beginPath()
      offscreenCtx.arc(
        Math.floor(props.brushDiameter / 2),
        Math.floor(props.brushDiameter / 2),
        Math.floor(props.brushDiameter / 2),
        0,
        Math.PI * 2
      )
      offscreenCtx.fillStyle = '#000000'
      offscreenCtx.fill()

      const { data: pixels } = offscreenCtx.getImageData(
        0,
        0,
        Math.floor(props.brushDiameter / 2) * 2,
        Math.floor(props.brushDiameter / 2) * 2
      )

      const thetas = []
      for (let index = 0; index < 20; index++) {
        thetas.push(Number((0.05 * index).toFixed(2)))
      }

      thetas.forEach((theta) => {
        const { x, y } = getPointOnLine(
          {
            x: brushPoint.value.x,
            y: brushPoint.value.y,
          },
          {
            x: offsetX,
            y: offsetY,
          },
          theta
        )

        const imageData = ctx.getImageData(
          x - Math.floor(props.brushDiameter / 2),
          y - Math.floor(props.brushDiameter / 2),
          Math.floor(props.brushDiameter / 2) * 2,
          Math.floor(props.brushDiameter / 2) * 2
        )

        const pixels2 = imageData.data

        const { r, g, b, a } = colorToRGBA(props.brushColor)

        for (let index = 0; index < pixels.length; index += 4) {
          if (pixels[index + 3] > 0) {
            pixels2[index] = r
            pixels2[index + 1] = g
            pixels2[index + 2] = b
            pixels2[index + 3] = a
          }
        }

        ctx.putImageData(
          imageData,
          x - Math.floor(props.brushDiameter / 2),
          y - Math.floor(props.brushDiameter / 2)
        )
      })

      brushPoint.value = {
        x: offsetX,
        y: offsetY,
      }
    }
  } else if (e.type === 'mouseup' || e.type === 'touchend' || e.type === 'touchcancel') {
    if (isBrushing.value) {
      isBrushing.value = false

      const imageData = ctx.getImageData(0, 0, redrawImage.value.width, redrawImage.value.height)

      if (await checkRegion(imageData)) {
        return
      }

      setImageSnapshots({
        url: getRedrawImageUrl(),
        imageData,
      })
    }
  }
}

const refreshCursor = (e) => {
  if (e.type === 'mousemove' || e.type === 'touchmove') {
    brushDiameterTip.value = {
      ...brushDiameterTip.value,
      visible: true,
      x: e.clientX || e.touches[0].clientX,
      y: e.clientY || e.touches[0].clientY,
    }
  } else {
    brushDiameterTip.value = {
      ...brushDiameterTip.value,
      visible: false,
    }
  }
}

const refreshInput = async (e) => {
  if (!props.showInputBox) {
    return
  }

  if (e.type === 'mousedown' || e.type === 'touchstart') {
    inputBox.value = {
      ...inputBox.value,
      visible: false,
    }
  } else if (e.type === 'mouseup' || e.type === 'touchend' || e.type === 'touchcancel') {
    const canvas: HTMLCanvasElement = redrawRef.value.querySelector('.redraw-wrap .stage-canvas')
    const ctx = canvas.getContext('2d')

    const imageData = ctx.getImageData(0, 0, redrawImage.value.width, redrawImage.value.height)

    if (await checkRegion(imageData)) {
      return
    }

    const { right, bottom } = redrawRef.value
      .querySelector('.redraw-wrap .stage-canvas')
      .getBoundingClientRect()

    const x = Math.min(e.clientX || e.changedTouches[0].clientX, right - 400)
    const y = Math.min(e.clientY || e.changedTouches[0].clientY, bottom - 100)

    inputBox.value = {
      ...inputBox.value,
      visible: true,
      x,
      y,
    }

    await nextTick()
    ;(redrawRef.value.querySelector('.input textarea') as HTMLElement)?.focus()
  }
}

const setContent = (e, trimed = false) => {
  const value = (e.target as HTMLTextAreaElement).value

  content.value = trimed ? value.trim() : value
}

const setTextareaHeight = (e) => {
  const ele = e.target as HTMLTextAreaElement

  ele.style.height = 0 + 'px'
  ele.style.height = Math.min(ele.scrollHeight, 60) + 'px'
}

const checkRegion = (imageData) => {
  return new Promise((resolve) => {
    const url = window.URL.createObjectURL(
      new Blob([checkRegionWorker], { type: 'text/javascript' })
    )

    const w = new Worker(url)

    w.onmessage = (e) => {
      w.terminate()
      window.URL.revokeObjectURL(url)

      isEmpty.value = e.data.isEmpty

      resolve(e.data.isEmpty)
    }

    w.postMessage(
      {
        imageData,
      },
      []
    )
  })
}

const clearMaskImage = () => {
  const canvas: HTMLCanvasElement = redrawRef.value.querySelector('.redraw-wrap .stage-canvas')
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, redrawImage.value.width, redrawImage.value.height)

  inputBox.value = {
    ...inputBox.value,
    visible: false,
  }

  isEmpty.value = true
}

const getRedrawImageUrl = () => {
  const originalCanvas: HTMLCanvasElement = redrawRef.value.querySelector(
    '.redraw-wrap .original-canvas'
  )

  return originalCanvas.toDataURL()
}

const getInfo = () => {
  const stageCanvas: HTMLCanvasElement = redrawRef.value.querySelector('.redraw-wrap .stage-canvas')
  const stageCtx = stageCanvas.getContext('2d')

  const imageData = stageCtx.getImageData(0, 0, redrawImage.value.width, redrawImage.value.height)

  const pixels = imageData.data

  const { r, g, b, a } = colorToRGBA(props.selectedColor)
  const { r: r2, g: g2, b: b2, a: a2 } = colorToRGBA(props.unselectedColor)

  for (let index = 0; index < pixels.length; index += 4) {
    if (pixels[index + 3] > 0) {
      pixels[index] = r
      pixels[index + 1] = g
      pixels[index + 2] = b
      pixels[index + 3] = a
    } else {
      pixels[index] = r2
      pixels[index + 1] = g2
      pixels[index + 2] = b2
      pixels[index + 3] = a2
    }
  }

  const canvas = window.document.createElement('canvas')
  canvas.width = redrawImage.value.width
  canvas.height = redrawImage.value.height
  const ctx = canvas.getContext('2d')

  ctx.putImageData(imageData, 0, 0)

  const maskImageUrl = canvas.toDataURL()

  return {
    originalImageUrl: getRedrawImageUrl(),
    maskImageUrl,
    content: content.value,
  }
}

const Eresize = () => {
  const canvasWrap: HTMLElement = redrawRef.value.querySelector('.redraw-wrap')

  let styleScale = 1

  if (
    ((canvasWrap.clientWidth * props.maxSizeRatio) / redrawImage.value.width) *
      redrawImage.value.height <=
    canvasWrap.clientHeight * props.maxSizeRatio
  ) {
    styleScale = (canvasWrap.clientWidth * props.maxSizeRatio) / redrawImage.value.width
  } else {
    styleScale = (canvasWrap.clientHeight * props.maxSizeRatio) / redrawImage.value.height
  }

  translate.value = {
    x: (canvasWrap.clientWidth - redrawImage.value.width) / 2,
    y: (canvasWrap.clientHeight - redrawImage.value.height) / 2,
  }

  scale.value = styleScale

  const { left, right, top, bottom } = redrawRef.value
    .querySelector('.redraw-wrap .stage-canvas')
    .getBoundingClientRect()

  let x = Math.max(inputBox.value.x, left)
  let y = Math.max(inputBox.value.y, top)

  x = Math.min(x, right - 400)
  y = Math.min(y, bottom - 100)

  inputBox.value = {
    ...inputBox.value,
    x,
    y,
  }
}

const EmouseUp = (e) => {
  refreshCanvas(e)
}

const EtouchEnd = (e) => {
  refreshCanvas(e)
}

onMounted(() => {
  window.addEventListener('resize', Eresize)

  window.addEventListener('mouseup', EmouseUp)

  window.addEventListener('touchend', EtouchEnd)
  window.addEventListener('touchcancel', EtouchEnd)
})

onUnmounted(() => {
  window.removeEventListener('resize', Eresize)

  window.removeEventListener('mouseup', EmouseUp)

  window.removeEventListener('touchend', EtouchEnd)
  window.removeEventListener('touchcancel', EtouchEnd)
})

watch(
  [() => props.showInputBox],
  async () => {
    if (props.showInputBox) {
      const canvas: HTMLCanvasElement = redrawRef.value.querySelector('.redraw-wrap .stage-canvas')
      const ctx = canvas.getContext('2d')

      const imageData = ctx.getImageData(0, 0, redrawImage.value.width, redrawImage.value.height)

      if (await checkRegion(imageData)) {
        return
      }

      const { left, right, top, bottom } = redrawRef.value
        .querySelector('.redraw-wrap .stage-canvas')
        .getBoundingClientRect()

      let x = Math.max(inputBox.value.x, left)
      let y = Math.max(inputBox.value.y, top)

      x = Math.min(x, right - 400)
      y = Math.min(y, bottom - 100)

      inputBox.value = {
        ...inputBox.value,
        visible: true,
        x,
        y,
      }

      await nextTick()
      ;(redrawRef.value.querySelector('.input textarea') as HTMLElement)?.focus()
    } else {
      inputBox.value = {
        ...inputBox.value,
        visible: false,
      }
    }
  },
  { immediate: false }
)

watch(
  [() => props.imageUrl],
  async () => {
    await nextTick()

    setImageSnapshots({
      url: props.imageUrl,
      imageData: null,
    })
  },
  { immediate: true }
)

watch(
  [() => props.brushDiameter],
  () => {
    const { left, right, top, bottom } = redrawRef.value
      .querySelector('.redraw-wrap .stage-canvas')
      .getBoundingClientRect()

    brushDiameterTip.value = {
      ...brushDiameterTip.value,
      visible: true,
      x: (right + left) / 2,
      y: (top + bottom) / 2,
    }
  },
  { immediate: false }
)

watch(
  [() => currentImageSnapshot.value],
  async () => {
    await initCanvas(currentImageSnapshot.value?.url)

    const canvas: HTMLCanvasElement = redrawRef.value.querySelector('.redraw-wrap .stage-canvas')
    const ctx = canvas.getContext('2d')

    if (currentImageSnapshot.value?.imageData) {
      ctx.putImageData(currentImageSnapshot.value.imageData, 0, 0)

      if (await checkRegion(currentImageSnapshot.value.imageData)) {
        return
      }

      if (!props.showInputBox) {
        return
      }

      inputBox.value = {
        ...inputBox.value,
        visible: true,
      }

      await nextTick()
      ;(redrawRef.value.querySelector('.input textarea') as HTMLElement)?.focus()
    } else {
      clearMaskImage()
    }
  },
  { immediate: false }
)

defineExpose({
  currentImageSnapshot,
  setImageSnapshots,
  redrawImage,
  translate,
  scale,
  isEmpty,
  clearMaskImage: () => {
    if (!isEmpty.value) {
      setImageSnapshots({
        url: getRedrawImageUrl(),
        imageData: null,
      })
    }
  },
  getInfo,
})
</script>

<style lang="less" scoped>
.redraw {
  width: 100%;
  height: 100%;

  .redraw-wrap {
    width: 100%;
    height: 100%;
    position: relative;

    canvas {
      cursor: none;
      position: absolute;
      left: 0;
      top: 0;
    }
  }

  .cursor {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0px 2px 6px 2px #00000026;
    pointer-events: none;
    position: fixed;
    left: 0;
    top: 0;
  }

  .input {
    width: 358px;
    background: var(--color-surface);
    padding: 14px 16px;
    border-radius: 999px;
    box-shadow: 0px 2px 6px 2px #00000026;
    position: fixed;
    left: 0;
    top: 0;
    display: flex;
    align-items: center;

    textarea {
      flex: 1;
      display: block;
      width: 100%;
      height: 20px;
      background: transparent;
      border: 0;
      outline: 0;
      resize: none;
      font-family: "Rookery New";
      font-size: 14px;
      font-weight: 400;
      color: var(--color-text-on-surface);
      line-height: 20px;

      &::placeholder {
        font-family: "Rookery New";
        font-size: 14px;
        font-weight: 400;
        color: var(--color-text-on-surface-variant);
      }

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        border-radius: 10px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 10px;
      }
    }

    .send {
      margin-left: 8px;
      width: 32px;
      height: 32px;
      background: var(--color-surface-disabled);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;

      .icon {
        width: 16px;
        height: 16px;
        mask-image: url("@/assets/img/svg/send.svg");
        mask-size: 100%;
        background-color: var(--color-text-on-surface-disabled);
      }

      &.active {
        background: var(--color-primary-primary);

        .icon {
          background-color: var(--color-on-primary);
        }
      }

      &.hovered {
        cursor: pointer;
      }
    }
  }
}
</style>
