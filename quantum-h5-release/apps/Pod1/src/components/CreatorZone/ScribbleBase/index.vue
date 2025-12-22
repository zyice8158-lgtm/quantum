<template>
  <div class="scribble-base" ref="scribbleBaseRef">
    <div class="scribble-base-wrap">
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
          }
        "
        @mouseup="
          (e) => {
            refreshCanvas(e)
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
          }
        "
        @touchcancel="
          (e) => {
            refreshCanvas(e)
            refreshCursor(e)
          }
        "
      ></canvas>

      <div
        class="stage-canvas-mask"
        :style="{
          width: `${size.width}px`,
          height: `${size.height}px`,
          left: `${translate.x}px`,
          top: `${translate.y}px`,
          transform: `scale(${scale})`,
        }"
      >
        <div
          class="rect left"
          :style="{
            width: `${Math.floor((size.width - cropSize.width) / 2)}px`,
            height: `${cropSize.height}px`,
            top: `${Math.floor((size.height - cropSize.height) / 2)}px`,
          }"
        ></div>
        <div
          class="rect right"
          :style="{
            width: `${Math.ceil((size.width - cropSize.width) / 2)}px`,
            height: `${cropSize.height}px`,
            top: `${Math.floor((size.height - cropSize.height) / 2)}px`,
          }"
        ></div>
        <div
          class="rect top"
          :style="{
            width: `${cropSize.width}px`,
            height: `${Math.floor((size.height - cropSize.height) / 2)}px`,
            left: `${Math.floor((size.width - cropSize.width) / 2)}px`,
          }"
        ></div>
        <div
          class="rect bottom"
          :style="{
            width: `${cropSize.width}px`,
            height: `${Math.ceil((size.height - cropSize.height) / 2)}px`,
            left: `${Math.floor((size.width - cropSize.width) / 2)}px`,
          }"
        ></div>

        <div
          class="rect top-left"
          :style="{
            width: `${Math.floor((size.width - cropSize.width) / 2)}px`,
            height: `${Math.floor((size.height - cropSize.height) / 2)}px`,
          }"
        ></div>
        <div
          class="rect top-right"
          :style="{
            width: `${Math.ceil((size.width - cropSize.width) / 2)}px`,
            height: `${Math.floor((size.height - cropSize.height) / 2)}px`,
          }"
        ></div>
        <div
          class="rect bottom-left"
          :style="{
            width: `${Math.floor((size.width - cropSize.width) / 2)}px`,
            height: `${Math.ceil((size.height - cropSize.height) / 2)}px`,
          }"
        ></div>
        <div
          class="rect bottom-right"
          :style="{
            width: `${Math.ceil((size.width - cropSize.width) / 2)}px`,
            height: `${Math.ceil((size.height - cropSize.height) / 2)}px`,
          }"
        ></div>
      </div>
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from 'vue'
import { IMAGE_SNAPSHOT_MAX_LENGTH } from '@/constant'
import { useSnapshots } from '@/hooks/snapshots'
import { colorToRGBA, getPointOnLine } from '@/utils'

import checkRegionWorker from './workers/checkRegion.ts?raw'

const { currentSnapshot: currentImageSnapshot, setSnapshots: setImageSnapshots } =
  useSnapshots(IMAGE_SNAPSHOT_MAX_LENGTH)

const props = defineProps({
  maxSizeRatio: {
    type: Number,
    default: 1,
  },
  size: {
    type: Object,
    default: {
      width: 1024,
      height: 1024,
    },
  },
  cropSize: {
    type: Object,
    default: {
      width: 1024,
      height: 1024,
    },
  },
  brushDiameter: {
    type: Number,
    default: 10,
  },
  brushColor: {
    type: String,
    default: 'rgba(22, 22, 22, 1)',
  },
  selectedColor: {
    type: String,
    default: '#000000',
  },
  unselectedColor: {
    type: String,
    default: '#ffffff',
  },
})

const scribbleBaseRef = ref(null)

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

// mask 信息是否为空
const isEmpty = ref(true)

const initCanvas = async () => {
  const canvasWrap: HTMLElement = scribbleBaseRef.value.querySelector('.scribble-base-wrap')

  let styleScale = 1

  if (
    ((canvasWrap.clientWidth * props.maxSizeRatio) / props.size.width) * props.size.height <=
    canvasWrap.clientHeight * props.maxSizeRatio
  ) {
    styleScale = (canvasWrap.clientWidth * props.maxSizeRatio) / props.size.width
  } else {
    styleScale = (canvasWrap.clientHeight * props.maxSizeRatio) / props.size.height
  }

  translate.value = {
    x: (canvasWrap.clientWidth - props.size.width) / 2,
    y: (canvasWrap.clientHeight - props.size.height) / 2,
  }

  scale.value = styleScale
}

const refreshCanvas = async (e) => {
  const canvas: HTMLCanvasElement = scribbleBaseRef.value.querySelector(
    '.scribble-base-wrap .stage-canvas'
  )
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

      const d = Math.sqrt(
        Math.pow(offsetX - brushPoint.value.x, 2) +
          Math.pow(offsetY - brushPoint.value.y, 2)
      )
      const num = d / props.brushDiameter * 10

      const thetas = []
      for (let index = 0; index < num; index++) {
        thetas.push(Number(((1 / num) * index).toFixed(2)))
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

      const imageData = ctx.getImageData(0, 0, props.size.width, props.size.height)

      if (await checkRegion(imageData)) {
        return
      }

      setImageSnapshots({
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

const checkRegion = (imageData, value = true) => {
  return new Promise((resolve) => {
    const url = window.URL.createObjectURL(
      new Blob([checkRegionWorker], { type: 'text/javascript' })
    )

    const w = new Worker(url)

    w.onmessage = (e) => {
      w.terminate()
      window.URL.revokeObjectURL(url)

      if (value) {
        isEmpty.value = e.data.isEmpty
      }

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
  const canvas: HTMLCanvasElement = scribbleBaseRef.value.querySelector(
    '.scribble-base-wrap .stage-canvas'
  )
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, props.size.width, props.size.height)

  isEmpty.value = true
}

const getInfo = async (original = true) => {
  const stageCanvas: HTMLCanvasElement = scribbleBaseRef.value.querySelector(
    '.scribble-base-wrap .stage-canvas'
  )
  const stageCtx = stageCanvas.getContext('2d')

  const imageData = stageCtx.getImageData(
    Math.floor((props.size.width - props.cropSize.width) / 2),
    Math.floor((props.size.height - props.cropSize.height) / 2),
    props.cropSize.width,
    props.cropSize.height
  )

  if (await checkRegion(imageData, false)) {
    return ''
  }

  if (!original) {
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
  }

  const canvas = window.document.createElement('canvas')
  canvas.width = props.cropSize.width
  canvas.height = props.cropSize.height
  const ctx = canvas.getContext('2d')

  ctx.putImageData(imageData, 0, 0)

  return canvas.toDataURL()
}

const Eresize = () => {
  initCanvas()
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

  setImageSnapshots({
    imageData: null,
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', Eresize)

  window.removeEventListener('mouseup', EmouseUp)

  window.removeEventListener('touchend', EtouchEnd)
  window.removeEventListener('touchcancel', EtouchEnd)
})

watch(
  [() => props.brushDiameter],
  () => {
    const { left, right, top, bottom } = scribbleBaseRef.value
      .querySelector('.scribble-base-wrap .stage-canvas')
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
    await initCanvas()

    const canvas: HTMLCanvasElement = scribbleBaseRef.value.querySelector(
      '.scribble-base-wrap .stage-canvas'
    )
    canvas.width = props.size.width
    canvas.height = props.size.height

    const ctx = canvas.getContext('2d')

    if (currentImageSnapshot.value?.imageData) {
      ctx.putImageData(currentImageSnapshot.value.imageData, 0, 0)

      checkRegion(currentImageSnapshot.value.imageData)
    } else {
      clearMaskImage()
    }
  },
  { immediate: false }
)

defineExpose({
  currentImageSnapshot,
  setImageSnapshots,
  translate,
  scale,
  isEmpty,
  clearMaskImage: () => {
    if (!isEmpty.value) {
      setImageSnapshots({
        imageData: null,
      })
    }
  },
  getInfo,
})
</script>

<style lang="less" scoped>
.scribble-base {
  width: 100%;
  height: 100%;

  .scribble-base-wrap {
    width: 100%;
    height: 100%;
    position: relative;

    canvas {
      background: #f8f8f8;
      cursor: none;
      position: absolute;
      left: 0;
      top: 0;
    }

    .stage-canvas-mask {
      pointer-events: none;
      position: absolute;
      left: 0;
      top: 0;

      .rect {
        background: #ffffffad;
        pointer-events: all;
        position: absolute;

        &.left {
          left: 0;
        }

        &.right {
          left: 100%;
          translate: -100% 0;
        }

        &.top {
          top: 0;
        }

        &.bottom {
          top: 100%;
          translate: 0 -100%;
        }

        &.top-left {
          left: 0;
          top: 0;
        }

        &.top-right {
          left: 100%;
          top: 0;
          translate: -100% 0;
        }

        &.bottom-left {
          left: 0;
          top: 100%;
          translate: 0 -100%;
        }

        &.bottom-right {
          left: 100%;
          top: 100%;
          translate: -100% -100%;
        }
      }
    }
  }

  .cursor {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0px 2px 6px 2px #00000026;
    pointer-events: none;
    position: absolute;
    left: 0;
    top: 0;
  }
}
</style>
