<template>
  <div class="expand" ref="expandRef">
    <div class="expand-wrap">
      <div
        class="expand-wrap__inner"
        :style="{
          width: `${expandBox.width}px`,
          height: `${expandBox.height}px`,
          left: `${translate.x}px`,
          top: `${translate.y}px`,
          transform: `scale(${scale})`,
          'transform-origin': `${scaleCenter.x}px ${scaleCenter.y}px`,
        }"
        v-automation="'expand_box_inner'"
      >
        <div
          class="expand-box"
          :style="{
            width: `${expandBox.width}px`,
            height: `${expandBox.height}px`,
            left: `${expandBox.x}px`,
            top: `${expandBox.y}px`,
          }"
        >
          <div
            class="line left"
            :style="{
              width: `${4 / scale}px`,
            }"
          ></div>
          <div
            class="line right"
            :style="{
              width: `${4 / scale}px`,
            }"
          ></div>
          <div
            class="line top"
            :style="{
              height: `${4 / scale}px`,
            }"
          ></div>
          <div
            class="line bottom"
            :style="{
              height: `${4 / scale}px`,
            }"
          ></div>

          <template v-for="expandBoxControl in expandBoxControls">
            <div
              :class="expandBoxControl.className"
              :style="{
                scale: 1 / scale,
                ...(expandBoxControl.id === 1
                  ? {
                      translate: `calc(-50% - ${2 / scale}px) calc(-50% - ${2 / scale}px)`,
                    }
                  : {}),
                ...(expandBoxControl.id === 2
                  ? {
                      translate: `calc(-50% + ${2 / scale}px) calc(-50% - ${2 / scale}px)`,
                    }
                  : {}),
                ...(expandBoxControl.id === 3
                  ? {
                      translate: `calc(-50% - ${2 / scale}px) calc(-50% + ${2 / scale}px)`,
                    }
                  : {}),
                ...(expandBoxControl.id === 4
                  ? {
                      translate: `calc(-50% + ${2 / scale}px) calc(-50% + ${2 / scale}px)`,
                    }
                  : {}),
                ...(expandBoxControl.id === 5
                  ? {
                      translate: `calc(-50% - ${2 / scale}px) -50%`,
                    }
                  : {}),
                ...(expandBoxControl.id === 6
                  ? {
                      translate: `calc(-50% + ${2 / scale}px) -50%`,
                    }
                  : {}),
                ...(expandBoxControl.id === 7
                  ? {
                      translate: `-50% calc(-50% - ${2 / scale}px)`,
                    }
                  : {}),
                ...(expandBoxControl.id === 8
                  ? {
                      translate: `-50% calc(-50% + ${2 / scale}px)`,
                    }
                  : {}),
              }"
              @mousedown="
                (e) => {
                  setExpandBoxControls(expandBoxControl.id)

                  point = {
                    x: e.clientX,
                    y: e.clientY,
                  }
                }
              "
              @touchstart="
                (e) => {
                  setExpandBoxControls(expandBoxControl.id)

                  point = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                  }
                }
              "
            ></div>
          </template>
        </div>

        <canvas
          :class="[
            'original-canvas chess',
            {
              transition: !expandImage.selected && !expandImage.wheeled,
            },
          ]"
          :style="{
            ...getChessStyle(imageSize.width),
            left: `${expandImage.x}px`,
            top: `${expandImage.y}px`,
          }"
          @transitionend="
            (e) => {
              (e.target as HTMLElement).classList.remove('transition')
            }
          "
        ></canvas>

        <div
          :class="[
            'original-canvas-mask',
            {
              transition: !expandImage.selected && !expandImage.wheeled,
            },
          ]"
          :style="{
            width: `${imageSize.width}px`,
            height: `${imageSize.height}px`,
            left: `${expandImage.x}px`,
            top: `${expandImage.y}px`,
          }"
          @transitionend="
            (e) => {
              (e.target as HTMLElement).classList.remove('transition')
            }
          "
        ></div>

        <canvas
          :class="[
            'stage-canvas chess',
            {
              transition: !expandImage.selected && !expandImage.wheeled,
            },
          ]"
          :style="{
            ...getChessStyle(imageSize.width),
            left: `${expandImage.x}px`,
            top: `${expandImage.y}px`,
            'clip-path': `rect(${expandBox.y - expandImage.y}px ${
              expandBox.x + expandBox.width - expandImage.x
            }px ${expandBox.y + expandBox.height - expandImage.y}px ${
              expandBox.x - expandImage.x
            }px)`,
          }"
          @transitionend="
            (e) => {
              (e.target as HTMLElement).classList.remove('transition')
            }
          "
          @mousedown="
            (e) => {
              expandImage = {
                ...expandImage,
                selected: true,
              }

              point = {
                x: e.clientX,
                y: e.clientY,
              }
            }
          "
          @touchstart="
            (e) => {
              expandImage = {
                ...expandImage,
                selected: true,
              }

              point = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
              }
            }
          "
          @wheel="
            (e) => {
              onExpandImageScale(e)
            }
          "
        ></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, watch, computed, onMounted, onUnmounted, Ref, nextTick } from 'vue'
import numeral from 'numeral'
import { IMAGE_SNAPSHOT_MAX_LENGTH } from '@/constant'
import { useSnapshots } from '@/hooks/snapshots'
import { getChessStyle } from '@/utils'

const { currentSnapshot: currentImageSnapshot, setSnapshots: setImageSnapshots } =
  useSnapshots(IMAGE_SNAPSHOT_MAX_LENGTH)

const props = defineProps({
  maxSizeRatio: {
    type: Number,
    default: 0.9,
  },
  // 被扩充图片配置
  expandImageConfig: {
    type: Object,
    default: {
      max: 64 * 80,
      min: 64 * 4,
      step: 8,
    },
  },
  // 扩图框配置
  expandBoxConfig: {
    type: Object,
    default: {
      defaultPadding: 64 * 2,
      max: 64 * 86,
      min: 64 * 10,
      step: 64,
    },
  },
  // 被扩充图片
  imageUrl: {
    type: String,
    default: '',
  },
  expandImageScaleConfig: {
    type: Object,
    default: {
      max: 5,
      min: 1,
      step: 0.1,
    },
  },
  // 被扩充图片是否可以被缩放
  scaleable: {
    type: Boolean,
    default: false,
  },
  expandBoxRatio: {
    type: Object,
    default: { x: 0, y: 0 },
  },
  expandBoxInitSize: {
    type: Object,
    default: { width: 0, height: 0 },
  },
  // 扩图框比例是否锁定
  locked: {
    type: Boolean,
    default: false,
  },
})

const expandRef = ref(null)

// 被扩充图片
const expandImage = ref({
  ele: null,
  width: 0,
  height: 0,
  scale: 1,
  x: 0,
  y: 0,
  selected: false,
  wheeled: false,
})
// 被扩充图片尺寸
const imageSize = computed(() => {
  return {
    width: Math.floor(expandImage.value.width * expandImage.value.scale),
    height: Math.floor(expandImage.value.height * expandImage.value.scale),
  }
})

// 扩图框
const expandBox = ref({
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  // 是否固定比例
  locked: false,
})

// 扩图框控件
const expandBoxControls = ref([
  {
    id: 1,
    className: 'circle top-left',
    active: false,
  },
  {
    id: 2,
    className: 'circle top-right',
    active: false,
  },
  {
    id: 3,
    className: 'circle bottom-left',
    active: false,
  },
  {
    id: 4,
    className: 'circle bottom-right',
    active: false,
  },
  {
    id: 5,
    className: 'circle left',
    active: false,
  },
  {
    id: 6,
    className: 'circle right',
    active: false,
  },
  {
    id: 7,
    className: 'circle top',
    active: false,
  },
  {
    id: 8,
    className: 'circle bottom',
    active: false,
  },
])
// 当前选中控件
const currentExpandBoxControl = computed(() => {
  return expandBoxControls.value.find((expandBoxControl) => expandBoxControl.active)
})

// 扩图容器偏移距离
const translate = ref({
  x: 0,
  y: 0,
})
// 扩图容器缩放比例
const scale = ref(1)
// 扩图容器缩放中心
const scaleCenter = ref({
  x: 0,
  y: 0,
})

// 最后一次触控位置
const point = ref({
  x: 0,
  y: 0,
})

// 修改扩图框控件状态
const setExpandBoxControls = (id) => {
  expandBoxControls.value = expandBoxControls.value.map((expandBoxControl) => {
    return {
      ...expandBoxControl,
      active: expandBoxControl.id === id,
    }
  })
}

const initCanvas = async (imageUrl) => {
  const originalImage: HTMLImageElement = await new Promise((resolve) => {
    const image = new Image()

    image.onload = () => {
      resolve(image)
    }

    image.src = imageUrl
  })

  // 更新被扩充图片
  expandImage.value = {
    ...expandImage.value,
    ele: originalImage,
    width: originalImage.width,
    height: originalImage.height,
    scale: 1,
    x: 0,
    y: 0,
    selected: false,
    wheeled: false,
  }

  const originalCanvas: HTMLCanvasElement = expandRef.value.querySelector(
    '.expand-wrap .original-canvas'
  )
  originalCanvas.width = imageSize.value.width
  originalCanvas.height = imageSize.value.height

  const originalCtx = originalCanvas.getContext('2d')
  originalCtx.drawImage(
    originalImage,
    0,
    0,
    originalImage.width,
    originalImage.height,
    0,
    0,
    imageSize.value.width,
    imageSize.value.height
  )

  const stageCanvas: HTMLCanvasElement = expandRef.value.querySelector('.expand-wrap .stage-canvas')
  stageCanvas.width = imageSize.value.width
  stageCanvas.height = imageSize.value.height

  const stageCtx = stageCanvas.getContext('2d')
  stageCtx.drawImage(
    originalCanvas,
    0,
    0,
    originalImage.width,
    originalImage.height,
    0,
    0,
    imageSize.value.width,
    imageSize.value.height
  )
}

// 初始化扩图框
const initExpandBox = () => {
  // 被扩充图片
  expandImage.value = {
    ...expandImage.value,
    x: 0,
    y: 0,
  }

  // 设置扩图框
  setExpandBoxByOption()
}

// 设置扩图框
const setExpandBoxByOption = () => {
  let eBox = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  }

  if (!props.expandBoxRatio.x || !props.expandBoxRatio.y) {
    eBox = getExpandBoxByOption(
      imageSize.value.width,
      imageSize.value.height,
      imageSize.value.width,
      imageSize.value.height
    )
  } else {
    eBox = getExpandBoxByOption(
      imageSize.value.width,
      imageSize.value.height,
      props.expandBoxRatio.x,
      props.expandBoxRatio.y,
      props.expandBoxInitSize.width,
      props.expandBoxInitSize.height
    )
  }

  expandBox.value = {
    ...expandBox.value,
    ...eBox,
  }

  // 矫正扩图容器位置与缩放
  correctTransform()
}

// 根据比例获取扩图框尺寸与位置
const getExpandBoxByOption = (
  imageWidth,
  imageHeight,
  ratioX,
  ratioY,
  expectedWidth = 0,
  expectedHeight = 0
) => {
  let width = 0,
    height = 0

  if ((imageWidth / ratioX) * ratioY >= imageHeight) {
    width = imageWidth
    height = Math.floor((imageWidth / ratioX) * ratioY)
  } else {
    width = Math.floor((imageHeight / ratioY) * ratioX)
    height = imageHeight
  }

  // 扩图框宽高等于图片宽高时填充一定宽度
  if (width === imageWidth && height === imageHeight) {
    width += props.expandBoxConfig.defaultPadding
    height = Math.floor((width / ratioX) * ratioY)
  }

  if (expectedWidth && expectedHeight) {
    if (width < expectedWidth && height < expectedHeight) {
      width = expectedWidth
      height = expectedHeight
    }
  }

  // 获取扩图框在图片中居中显示偏移量
  const { x, y } = getExpandBoxOffset(imageWidth, imageHeight, width, height)

  return {
    width,
    height,
    x,
    y,
  }
}

// 获取扩图框在图片中居中显示偏移量
const getExpandBoxOffset = (imageWidth, imageHeight, expandBoxWidth, expandBoxHeight) => {
  let x = 0,
    y = 0

  x = Math.floor((imageWidth - expandBoxWidth) / 2)
  y = Math.floor((imageHeight - expandBoxHeight) / 2)

  return { x, y }
}

// 修改图片位置
const onExpandImageMove = (movementX, movementY) => {
  if (!expandImage.value.selected) {
    return
  }

  expandImage.value = {
    ...expandImage.value,
    x: expandImage.value.x + movementX,
    y: expandImage.value.y + movementY,
  }
}

const onExpandImageScale = (() => {
  let expandImageScaleTimer = null

  return (e) => {
    if (!props.scaleable) {
      return
    }

    let expandImageScale = 1

    if (e.wheelDeltaY > 0 || e.deltaY < 0) {
      const _expandImageScale = Math.min(
        numeral(expandImage.value.scale)
          .add(props.expandImageScaleConfig.step / scale.value)
          .value(),
        props.expandImageScaleConfig.max
      )

      if (
        imageSize.value.width * (_expandImageScale / expandImage.value.scale) <=
          expandBox.value.width &&
        imageSize.value.height * (_expandImageScale / expandImage.value.scale) <=
          expandBox.value.height
      ) {
        expandImageScale = _expandImageScale
      }
    } else if (e.wheelDeltaY < 0 || e.deltaY > 0) {
      expandImageScale = Math.max(
        numeral(expandImage.value.scale)
          .subtract(props.expandImageScaleConfig.step / scale.value)
          .value(),
        props.expandImageScaleConfig.min
      )
    }

    // 缩放前被扩充图片左上角坐标以及缩放大小
    const preX = expandImage.value.x
    const preY = expandImage.value.y
    const preScale = expandImage.value.scale

    // 缩放点
    const x0 = e.offsetX + expandBox.value.x
    const y0 = e.offsetY + expandBox.value.y

    // 缩放后图片左上角的目标坐标
    const dx = (x0 - preX) * (expandImageScale / preScale) - (x0 - preX)
    const dy = (y0 - preY) * (expandImageScale / preScale) - (y0 - preY)

    // 更新被扩充图片
    expandImage.value = {
      ...expandImage.value,
      scale: expandImageScale,
      x: expandImage.value.x - dx,
      y: expandImage.value.y - dy,
      // 如果此时取整误差会叠加 图片位置矫正时取整
      // x: Math.floor(expandImage.value.x - dx),
      // y: Math.floor(expandImage.value.y - dy),
      wheeled: true,
    }

    if (expandImageScaleTimer) {
      window.clearTimeout(expandImageScaleTimer)
    }

    expandImageScaleTimer = window.setTimeout(() => {
      // 图片移动结束矫正位置
      onExpandImageMoveEnd()
    }, 200)
  }
})()

// 图片移动结束矫正位置
const onExpandImageMoveEnd = () => {
  if (!expandImage.value.selected && !expandImage.value.wheeled) {
    return
  }

  const eImage = {
    // 对缩放造成的小数问题矫正
    x: Math.floor(expandImage.value.x),
    y: Math.floor(expandImage.value.y),
  }

  // 判断图片左边是否出现在扩图框外
  if (expandImage.value.x < expandBox.value.x) {
    eImage.x = expandBox.value.x
  }

  // 判断图片右边是否出现在扩图框外
  if (expandImage.value.x + imageSize.value.width > expandBox.value.x + expandBox.value.width) {
    eImage.x = expandBox.value.x + expandBox.value.width - imageSize.value.width
  }

  // 判断图片上边是否出现在扩图框外
  if (expandImage.value.y < expandBox.value.y) {
    eImage.y = expandBox.value.y
  }

  // 判断图片下边是否出现在扩图框外
  if (expandImage.value.y + imageSize.value.height > expandBox.value.y + expandBox.value.height) {
    eImage.y = expandBox.value.y + expandBox.value.height - imageSize.value.height
  }

  expandImage.value = {
    ...expandImage.value,
    ...eImage,
    selected: false,
    wheeled: false,
  }
}

// 控件移动修改扩图框
const onExpandBoxControlMove = (movementX, movementY) => {
  if (!currentExpandBoxControl.value) {
    return
  }

  const eBox = {
    width: expandBox.value.width,
    height: expandBox.value.height,
    x: expandBox.value.x,
    y: expandBox.value.y,
  }

  // 扩图框宽高比例
  let x = 0
  let y = 0

  if (!props.expandBoxRatio.x || !props.expandBoxRatio.y) {
    x = imageSize.value.width
    y = imageSize.value.height
  } else {
    x = props.expandBoxRatio.x
    y = props.expandBoxRatio.y
  }

  if (currentExpandBoxControl.value?.id === 1) {
    // 左上角

    eBox.width -= movementX
    eBox.x += movementX

    if (expandBox.value.locked) {
      const height = Math.floor((eBox.width / x) * y)

      eBox.height = height
      eBox.y -= height - expandBox.value.height
    } else {
      eBox.height -= movementY
      eBox.y += movementY
    }
  } else if (currentExpandBoxControl.value?.id === 2) {
    // 右上角

    eBox.width += movementX

    if (expandBox.value.locked) {
      const height = Math.floor((eBox.width / x) * y)

      eBox.height = height
      eBox.y -= height - expandBox.value.height
    } else {
      eBox.height -= movementY
      eBox.y += movementY
    }
  } else if (currentExpandBoxControl.value?.id === 3) {
    // 左下角

    eBox.width -= movementX
    eBox.x += movementX

    if (expandBox.value.locked) {
      const height = Math.floor((eBox.width / x) * y)

      eBox.height = height
    } else {
      eBox.height += movementY
    }
  } else if (currentExpandBoxControl.value?.id === 4) {
    // 右下角

    eBox.width += movementX

    if (expandBox.value.locked) {
      const height = Math.floor((eBox.width / x) * y)

      eBox.height = height
    } else {
      eBox.height += movementY
    }
  } else if (currentExpandBoxControl.value?.id === 5) {
    // 左边

    eBox.width -= movementX
    eBox.x += movementX

    if (expandBox.value.locked) {
      const height = Math.floor((eBox.width / x) * y)
      const padding = Math.floor((height - expandBox.value.height) / 2)

      eBox.height += padding * 2
      eBox.y -= padding
    }
  } else if (currentExpandBoxControl.value?.id === 6) {
    // 右边

    eBox.width += movementX

    if (expandBox.value.locked) {
      const height = Math.floor((eBox.width / x) * y)
      const padding = Math.floor((height - expandBox.value.height) / 2)

      eBox.height += padding * 2
      eBox.y -= padding
    }
  } else if (currentExpandBoxControl.value?.id === 7) {
    // 上边

    eBox.height -= movementY
    eBox.y += movementY

    if (expandBox.value.locked) {
      const width = Math.floor((eBox.height / y) * x)
      const padding = Math.floor((width - expandBox.value.width) / 2)

      eBox.width += padding * 2
      eBox.x -= padding
    }
  } else if (currentExpandBoxControl.value?.id === 8) {
    // 下边

    eBox.height += movementY

    if (expandBox.value.locked) {
      const width = Math.floor((eBox.height / y) * x)
      const padding = Math.floor((width - expandBox.value.width) / 2)

      eBox.width += padding * 2
      eBox.x -= padding
    }
  }

  // 图片必须在扩图框内部
  if (
    !(
      eBox.x - expandImage.value.x <= 0 &&
      eBox.y - expandImage.value.y <= 0 &&
      eBox.x + eBox.width >= expandImage.value.x + imageSize.value.width &&
      eBox.y + eBox.height >= expandImage.value.y + imageSize.value.height
    )
  ) {
    return
  }

  // 扩图框必须小于等于最大尺寸
  if (
    (eBox.width > props.expandBoxConfig.max && eBox.width > expandBox.value.width) ||
    (eBox.height > props.expandBoxConfig.max && eBox.height > expandBox.value.height)
  ) {
    return
  }

  // 扩图框必须大于等于最小尺寸
  if (
    (eBox.width < props.expandBoxConfig.min && eBox.width < expandBox.value.width) ||
    (eBox.height < props.expandBoxConfig.min && eBox.height < expandBox.value.height)
  ) {
    return
  }

  expandBox.value = {
    ...expandBox.value,
    ...eBox,
  }
}

// 扩图框修改结束矫正扩图容器位置与缩放
const onExpandBoxControlMoveEnd = () => {
  if (!currentExpandBoxControl.value) {
    return
  }

  // 矫正扩图容器位置与缩放
  correctTransform()

  // 重置扩图框控件状态
  setExpandBoxControls(-1)
}

// 矫正扩图容器位置与缩放
const correctTransform = () => {
  const canvasWrap: HTMLElement = expandRef.value.querySelector('.expand-wrap')

  let styleScale = 1

  if (
    ((canvasWrap.clientWidth * props.maxSizeRatio) / expandBox.value.width) *
      expandBox.value.height <=
    canvasWrap.clientHeight * props.maxSizeRatio
  ) {
    styleScale = (canvasWrap.clientWidth * props.maxSizeRatio) / expandBox.value.width
  } else {
    styleScale = (canvasWrap.clientHeight * props.maxSizeRatio) / expandBox.value.height
  }

  translate.value = {
    x: (canvasWrap.clientWidth - expandBox.value.width) / 2 - expandBox.value.x,
    y: (canvasWrap.clientHeight - expandBox.value.height) / 2 - expandBox.value.y,
  }

  scale.value = styleScale

  // scale.value =
  //   Math.min(canvasWrap.clientWidth * props.maxSizeRatio, canvasWrap.clientHeight * props.maxSizeRatio) /
  //   Math.max(expandBox.value.width, expandBox.value.height)

  scaleCenter.value = {
    x: expandBox.value.x + expandBox.value.width / 2,
    y: expandBox.value.y + expandBox.value.height / 2,
  }
}

const getInfo = () => {
  const originalCanvas: HTMLCanvasElement = expandRef.value.querySelector(
    '.expand-wrap .original-canvas'
  )

  const originalImageUrl = originalCanvas.toDataURL();

  const canvas = window.document.createElement("canvas");
  canvas.width = expandBox.value.width;
  canvas.height = expandBox.value.height;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, expandBox.value.width, expandBox.value.height);

  ctx.fillStyle = "#000000";
  ctx.fillRect(
    expandImage.value.x - expandBox.value.x,
    expandImage.value.y - expandBox.value.y,
    imageSize.value.width,
    imageSize.value.height
  );

  const maskImageUrl = canvas.toDataURL()

  return {
    originalImageUrl,
    maskImageUrl,
    width: expandBox.value.width,
    height: expandBox.value.height,
    left: expandImage.value.x - expandBox.value.x,
    top: expandImage.value.y - expandBox.value.y,
  }
}

// 视口大小变化事件
const Eresize = () => {
  // 初始化扩图框
  initExpandBox()
}

// 鼠标移动事件
const EmouseMove = (e) => {
  let movementX = 0
  let movementY = 0

  if (e?.touches?.[0]) {
    movementX = e.touches[0].clientX - point.value.x
    movementY = e.touches[0].clientY - point.value.y

    point.value = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  } else {
    movementX = e.clientX - point.value.x
    movementY = e.clientY - point.value.y

    point.value = {
      x: e.clientX,
      y: e.clientY,
    }
  }

  // 控件移动修改扩图框
  onExpandBoxControlMove(Math.floor(movementX / scale.value), Math.floor(movementY / scale.value))

  // 修改图片位置
  onExpandImageMove(Math.floor(movementX / scale.value), Math.floor(movementY / scale.value))
}

// 鼠标按键抬起事件
const EmouseUp = () => {
  // 扩图框修改结束矫正扩图容器位置与缩放
  onExpandBoxControlMoveEnd()

  // 图片移动结束矫正位置
  onExpandImageMoveEnd()
}

onMounted(() => {
  window.addEventListener('resize', Eresize)

  window.addEventListener('mousemove', EmouseMove)
  window.addEventListener('mouseup', EmouseUp)

  window.addEventListener('touchmove', EmouseMove)
  window.addEventListener('touchend', EmouseUp)
  window.addEventListener('touchcancel', EmouseUp)
})

onUnmounted(() => {
  window.removeEventListener('resize', Eresize)

  window.removeEventListener('mousemove', EmouseMove)
  window.removeEventListener('mouseup', EmouseUp)

  window.removeEventListener('touchmove', EmouseMove)
  window.removeEventListener('touchend', EmouseUp)
  window.removeEventListener('touchcancel', EmouseUp)
})

watch(
  [() => props.imageUrl],
  async () => {
    await nextTick()

    setImageSnapshots({
      url: props.imageUrl,
    })
  },
  { immediate: true }
)

watch(
  [() => props.expandBoxRatio],
  () => {
    // 初始化扩图框
    initExpandBox()
  },
  { immediate: false }
)

watch(
  [() => props.locked],
  () => {
    expandBox.value = {
      ...expandBox.value,
      locked: props.locked,
    }
  },
  { immediate: true }
)

watch(
  [() => currentImageSnapshot.value],
  async () => {
    // 初始化画布
    await initCanvas(currentImageSnapshot.value?.url)
    // 初始化扩图框
    initExpandBox()
  },
  { immediate: false }
)

defineExpose({
  currentImageSnapshot,
  setImageSnapshots,
  expandBox,
  scale,
  getInfo,
})
</script>

<style lang="less" scoped>
.expand {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .expand-wrap {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;

    &__inner {
      position: absolute;
      left: 0;
      top: 0;

      canvas {
        cursor: grab;
        position: absolute;
        left: 0;
        top: 0;

        &:active {
          cursor: grabbing;
        }
      }

      .original-canvas-mask {
        background-color: rgba(0, 0, 0, 0.3);
        position: absolute;
        left: 0;
        top: 0;
      }

      canvas,
      .original-canvas-mask {
        &.transition {
          transition-property: left, top;
          transition-duration: 0.3s;
          transition-timing-function: ease;
        }
      }

      .expand-box {
        background: var(--color-secondary-container);
        position: absolute;
        left: 0;
        top: 0;

        .line {
          position: absolute;
          z-index: 1;

          &.left {
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, #5c8dff, #a079ff, #d06ad6);
            left: 0;
            top: 0;
            translate: -100% 0;
          }

          &.right {
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, #d06ad6, #eb6296, #ffa08c);
            left: 100%;
            top: 0;
          }

          &.top {
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, #5c8dff, #a079ff, #d06ad6);
            left: 0;
            top: 0;
            translate: 0 -100%;
          }

          &.bottom {
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, #d06ad6, #eb6296, #ffa08c);
            left: 0;
            top: 100%;
          }
        }

        .circle {
          width: 18px;
          height: 18px;
          background: linear-gradient(#ffffff, #ffffff) padding-box,
            conic-gradient(
                from 0turn at 50% 50%,
                #ffa08c,
                #eb6296,
                #d06ad6,
                #a079ff,
                #5c8dff,
                #a079ff,
                #d06ad6,
                #eb6296,
                #ffa08c
              )
              border-box;
          border: 4px solid transparent;
          border-radius: 50%;
          position: absolute;
          z-index: 1;

          &.top-left {
            cursor: nwse-resize;
            left: 0;
            top: 0;
          }

          &.top-right {
            cursor: nesw-resize;
            left: 100%;
            top: 0;
          }

          &.bottom-left {
            cursor: nesw-resize;
            left: 0;
            top: 100%;
          }

          &.bottom-right {
            cursor: nwse-resize;
            left: 100%;
            top: 100%;
          }

          &.left {
            cursor: ew-resize;
            left: 0;
            top: 50%;
          }

          &.right {
            cursor: ew-resize;
            left: 100%;
            top: 50%;
          }

          &.top {
            cursor: ns-resize;
            left: 50%;
            top: 0;
          }

          &.bottom {
            cursor: ns-resize;
            left: 50%;
            top: 100%;
          }
        }
      }
    }
  }
}
</style>
