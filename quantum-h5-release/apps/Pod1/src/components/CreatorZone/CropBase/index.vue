<template>
  <div class="crop-base" ref="cropBaseRef">
    <div class="crop-base-wrap">
      <div
        class="crop-base-wrap__inner"
        :style="{
          width: `${imageSize.width}px`,
          height: `${imageSize.height}px`,
          left: `${translate.x}px`,
          top: `${translate.y}px`,
          transform: `scale(${scale})`,
          'transform-origin': `${scaleCenter.x}px ${scaleCenter.y}px`,
        }"
      >
        <canvas
          :class="[
            'original-canvas chess',
            {
              transition: !cropImage.selected && !cropImage.wheeled,
            },
          ]"
          :style="{
            ...getChessStyle(imageSize.width),
            left: `${cropImage.x}px`,
            top: `${cropImage.y}px`,
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
              transition: !cropImage.selected && !cropImage.wheeled,
            },
          ]"
          :style="{
            width: `${imageSize.width}px`,
            height: `${imageSize.height}px`,
            left: `${cropImage.x}px`,
            top: `${cropImage.y}px`,
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
              transition: !cropImage.selected && !cropImage.wheeled,
            },
          ]"
          :style="{
            ...getChessStyle(imageSize.width),
            left: `${cropImage.x}px`,
            top: `${cropImage.y}px`,
            'clip-path': `rect(${cropBox.y - cropImage.y}px ${
              cropBox.x + cropBox.width - cropImage.x
            }px ${cropBox.y + cropBox.height - cropImage.y}px ${cropBox.x - cropImage.x}px)`,
          }"
          @transitionend="
            (e) => {
              (e.target as HTMLElement).classList.remove('transition')
            }
          "
        ></canvas>

        <div
          class="crop-box"
          :style="{
            width: `${cropBox.width}px`,
            height: `${cropBox.height}px`,
            left: `${cropBox.x}px`,
            top: `${cropBox.y}px`,
          }"
          @mousedown.self="
            (e) => {
              cropImage = {
                ...cropImage,
                selected: true,
              }

              point = {
                x: e.clientX,
                y: e.clientY,
              }
            }
          "
          @touchstart.self="
            (e) => {
              cropImage = {
                ...cropImage,
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
              onCropImageScale(e)
            }
          "
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

          <template v-for="cropBoxControl in cropBoxControls">
            <div
              :class="cropBoxControl.className"
              :style="{
                scale: 1 / scale,
                ...(cropBoxControl.id === 1
                  ? {
                      translate: `calc(-50% - ${2 / scale}px) calc(-50% - ${2 / scale}px)`,
                    }
                  : {}),
                ...(cropBoxControl.id === 2
                  ? {
                      translate: `calc(-50% + ${2 / scale}px) calc(-50% - ${2 / scale}px)`,
                    }
                  : {}),
                ...(cropBoxControl.id === 3
                  ? {
                      translate: `calc(-50% - ${2 / scale}px) calc(-50% + ${2 / scale}px)`,
                    }
                  : {}),
                ...(cropBoxControl.id === 4
                  ? {
                      translate: `calc(-50% + ${2 / scale}px) calc(-50% + ${2 / scale}px)`,
                    }
                  : {}),
                ...(cropBoxControl.id === 5
                  ? {
                      translate: `calc(-50% - ${2 / scale}px) -50%`,
                    }
                  : {}),
                ...(cropBoxControl.id === 6
                  ? {
                      translate: `calc(-50% + ${2 / scale}px) -50%`,
                    }
                  : {}),
                ...(cropBoxControl.id === 7
                  ? {
                      translate: `-50% calc(-50% - ${2 / scale}px)`,
                    }
                  : {}),
                ...(cropBoxControl.id === 8
                  ? {
                      translate: `-50% calc(-50% + ${2 / scale}px)`,
                    }
                  : {}),
              }"
              @mousedown="
                (e) => {
                  setCropBoxControls(cropBoxControl.id)

                  point = {
                    x: e.clientX,
                    y: e.clientY,
                  }
                }
              "
              @touchstart="
                (e) => {
                  setCropBoxControls(cropBoxControl.id)

                  point = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                  }
                }
              "
            ></div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import numeral from 'numeral'
import { getChessStyle } from '@/utils'

// 裁剪框最小边长
const cropBoxMinSize = 100

const props = defineProps({
  maxSizeRatio: {
    type: Number,
    default: 0.9,
  },
  // 被裁剪图片
  imageUrl: {
    type: String,
    default: '',
  },
  cropImageScaleConfig: {
    type: Object,
    default: {
      max: 5,
      min: 1,
      step: 0.1,
    },
  },
  // 被裁剪图片是否可以被缩放
  scaleable: {
    type: Boolean,
    default: true,
  },
  cropBoxRatio: {
    type: Object,
    default: { x: 0, y: 0 },
  },
  cropBoxInitSize: {
    type: Object,
    default: { width: 0, height: 0 },
  },
  // 裁剪框比例是否锁定
  locked: {
    type: Boolean,
    default: false,
  },
  flipHorizontal: {
    type: Number,
    default: 1,
  },
  flipVertical: {
    type: Number,
    default: 1,
  },
  angle: {
    type: Number,
    default: 0,
  },
})

const cropBaseRef = ref(null)

// 被裁剪图片
const cropImage = ref({
  ele: null,
  width: 0,
  height: 0,
  scale: 1,
  x: 0,
  y: 0,
  selected: false,
  wheeled: false,
})
// 被裁剪图片尺寸
const imageSize = computed(() => {
  return {
    width: Math.floor(cropImage.value.width * cropImage.value.scale),
    height: Math.floor(cropImage.value.height * cropImage.value.scale),
  }
})

// 裁剪框
const cropBox = ref({
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  // 是否固定比例
  locked: true,
})

// 裁剪框控件
const cropBoxControls = ref([
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
const currentCropBoxControl = computed(() => {
  return cropBoxControls.value.find((cropBoxControl) => cropBoxControl.active)
})

// 图片偏移距离
const translate = ref({
  x: 0,
  y: 0,
})
// 图片缩放比例
const scale = ref(1)
// 裁剪容器缩放中心
const scaleCenter = ref({
  x: 0,
  y: 0,
})

// 裁剪容器是否水平翻转
const flipHorizontal = ref(1)
// 裁剪容器是否垂直翻转
const flipVertical = ref(1)
// 裁剪容器旋转角度
const angle = ref(0)

// 最后一次触控位置
const point = ref({
  x: 0,
  y: 0,
})

// 修改裁剪框控件状态
const setCropBoxControls = (id) => {
  cropBoxControls.value = cropBoxControls.value.map((cropBoxControl) => {
    return {
      ...cropBoxControl,
      active: cropBoxControl.id === id,
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

  // 更新被裁剪图片
  cropImage.value = {
    ...cropImage.value,
    ele: originalImage,
    width: originalImage.width,
    height: originalImage.height,
    scale: 1,
    x: 0,
    y: 0,
    selected: false,
    wheeled: false,
  }

  const originalCanvas: HTMLCanvasElement = cropBaseRef.value.querySelector(
    '.crop-base-wrap .original-canvas'
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

  const stageCanvas: HTMLCanvasElement = cropBaseRef.value.querySelector(
    '.crop-base-wrap .stage-canvas'
  )
  stageCanvas.width = imageSize.value.width
  stageCanvas.height = imageSize.value.height
}

// 初始化裁剪框
const initCropBox = () => {
  // 被裁剪图片
  cropImage.value = {
    ...cropImage.value,
    x: 0,
    y: 0,
  }

  // 设置裁剪框
  setCropBoxByOption()
}

// 设置裁剪框
const setCropBoxByOption = () => {
  let cBox = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  }

  if (!props.cropBoxRatio.x || !props.cropBoxRatio.y) {
    cBox = getCropBoxByOption(
      imageSize.value.width,
      imageSize.value.height,
      imageSize.value.width,
      imageSize.value.height
    )
  } else {
    cBox = getCropBoxByOption(
      imageSize.value.width,
      imageSize.value.height,
      props.cropBoxRatio.x,
      props.cropBoxRatio.y,
      props.cropBoxInitSize.width,
      props.cropBoxInitSize.height
    )
  }

  cropBox.value = {
    ...cropBox.value,
    ...cBox,
  }

  // 矫正裁剪容器位置与缩放
  correctTransform()
}

// 根据比例获取裁剪框尺寸与位置
const getCropBoxByOption = (
  imageWidth,
  imageHeight,
  ratioX,
  ratioY,
  expectedWidth = 0,
  expectedHeight = 0
) => {
  let width = 0,
    height = 0

  if ((imageWidth / ratioX) * ratioY <= imageHeight) {
    width = imageWidth
    height = Math.floor((imageWidth / ratioX) * ratioY)
  } else {
    width = Math.floor((imageHeight / ratioY) * ratioX)
    height = imageHeight
  }

  if (expectedWidth && expectedHeight) {
    if (width > expectedWidth && height > expectedHeight) {
      width = expectedWidth
      height = expectedHeight
    }
  }

  // 获取裁剪框在图片中居中显示偏移量
  const { x, y } = getCropBoxOffset(imageWidth, imageHeight, width, height)

  return {
    width,
    height,
    x,
    y,
  }
}

// 获取裁剪框在图片中居中显示偏移量
const getCropBoxOffset = (imageWidth, imageHeight, cropBoxWidth, cropBoxHeight) => {
  let x = 0,
    y = 0

  x = Math.floor((imageWidth - cropBoxWidth) / 2)
  y = Math.floor((imageHeight - cropBoxHeight) / 2)

  return { x, y }
}

// 修改图片位置
const onCropImageMove = (movementX, movementY) => {
  if (!cropImage.value.selected) {
    return
  }

  cropImage.value = {
    ...cropImage.value,
    x: cropImage.value.x + movementX,
    y: cropImage.value.y + movementY,
  }
}

const onCropImageScale = (() => {
  let cropImageScaleTimer = null

  return (e) => {
    if (!props.scaleable) {
      return
    }

    let cropImageScale = 1

    if (e.wheelDeltaY > 0 || e.deltaY < 0) {
      cropImageScale = Math.min(
        numeral(cropImage.value.scale)
          .add(props.cropImageScaleConfig.step / scale.value)
          .value(),
        props.cropImageScaleConfig.max
      )
    } else if (e.wheelDeltaY < 0 || e.deltaY > 0) {
      cropImageScale = Math.max(
        numeral(cropImage.value.scale)
          .subtract(props.cropImageScaleConfig.step / scale.value)
          .value(),
        props.cropImageScaleConfig.min
      )
    }

    // 缩放前被裁剪图片左上角坐标以及缩放大小
    const preX = cropImage.value.x
    const preY = cropImage.value.y
    const preScale = cropImage.value.scale

    // 缩放点
    const x0 = e.offsetX + cropBox.value.x
    const y0 = e.offsetY + cropBox.value.y

    // 缩放后图片左上角的目标坐标
    const dx = (x0 - preX) * (cropImageScale / preScale) - (x0 - preX)
    const dy = (y0 - preY) * (cropImageScale / preScale) - (y0 - preY)

    // 更新被裁剪图片
    cropImage.value = {
      ...cropImage.value,
      scale: cropImageScale,
      x: cropImage.value.x - dx,
      y: cropImage.value.y - dy,
      // 如果此时取整误差会叠加 图片位置矫正时取整
      // x: Math.floor(cropImage.value.x - dx),
      // y: Math.floor(cropImage.value.y - dy),
      wheeled: true,
    }

    if (cropImageScaleTimer) {
      window.clearTimeout(cropImageScaleTimer)
    }

    cropImageScaleTimer = window.setTimeout(() => {
      // 图片移动结束矫正位置
      onCropImageMoveEnd()
    }, 200)
  }
})()

// 图片移动结束矫正位置
const onCropImageMoveEnd = () => {
  if (!cropImage.value.selected && !cropImage.value.wheeled) {
    return
  }

  const cImage = {
    // 对缩放造成的小数问题矫正
    x: Math.floor(cropImage.value.x),
    y: Math.floor(cropImage.value.y),
  }

  // 判断图片左边是否出现在裁剪框内
  if (cropImage.value.x > cropBox.value.x) {
    cImage.x = cropBox.value.x
  }

  // 判断图片右边是否出现在裁剪框内
  if (cropImage.value.x + imageSize.value.width < cropBox.value.x + cropBox.value.width) {
    cImage.x = cropBox.value.x + cropBox.value.width - imageSize.value.width
  }

  // 判断图片上边是否出现在裁剪框内
  if (cropImage.value.y > cropBox.value.y) {
    cImage.y = cropBox.value.y
  }

  // 判断图片下边是否出现在裁剪框内
  if (cropImage.value.y + imageSize.value.height < cropBox.value.y + cropBox.value.height) {
    cImage.y = cropBox.value.y + cropBox.value.height - imageSize.value.height
  }

  cropImage.value = {
    ...cropImage.value,
    ...cImage,
    selected: false,
    wheeled: false,
  }
}

// 控件移动修改裁剪框
const onCropBoxControlMove = (movementX, movementY) => {
  if (!currentCropBoxControl.value) {
    return
  }

  const cBox = {
    width: cropBox.value.width,
    height: cropBox.value.height,
    x: cropBox.value.x,
    y: cropBox.value.y,
  }

  // 裁剪框宽高比例
  let x = 0
  let y = 0

  if (!props.cropBoxRatio.x || !props.cropBoxRatio.y) {
    x = imageSize.value.width
    y = imageSize.value.height
  } else {
    x = props.cropBoxRatio.x
    y = props.cropBoxRatio.y
  }

  if (currentCropBoxControl.value?.id === 1) {
    // 左上角

    cBox.width -= movementX
    cBox.x += movementX

    if (cropBox.value.locked) {
      const height = Math.floor((cBox.width / x) * y)

      cBox.height = height
      cBox.y -= height - cropBox.value.height
    } else {
      cBox.height -= movementY
      cBox.y += movementY
    }
  } else if (currentCropBoxControl.value?.id === 2) {
    // 右上角

    cBox.width += movementX

    if (cropBox.value.locked) {
      const height = Math.floor((cBox.width / x) * y)

      cBox.height = height
      cBox.y -= height - cropBox.value.height
    } else {
      cBox.height -= movementY
      cBox.y += movementY
    }
  } else if (currentCropBoxControl.value?.id === 3) {
    // 左下角

    cBox.width -= movementX
    cBox.x += movementX

    if (cropBox.value.locked) {
      const height = Math.floor((cBox.width / x) * y)

      cBox.height = height
    } else {
      cBox.height += movementY
    }
  } else if (currentCropBoxControl.value?.id === 4) {
    // 右下角

    cBox.width += movementX

    if (cropBox.value.locked) {
      const height = Math.floor((cBox.width / x) * y)

      cBox.height = height
    } else {
      cBox.height += movementY
    }
  } else if (currentCropBoxControl.value?.id === 5) {
    // 左边

    cBox.width -= movementX
    cBox.x += movementX

    if (cropBox.value.locked) {
      const height = Math.floor((cBox.width / x) * y)
      const padding = Math.floor((height - cropBox.value.height) / 2)

      cBox.height += padding * 2
      cBox.y -= padding
    }
  } else if (currentCropBoxControl.value?.id === 6) {
    // 右边

    cBox.width += movementX

    if (cropBox.value.locked) {
      const height = Math.floor((cBox.width / x) * y)
      const padding = Math.floor((height - cropBox.value.height) / 2)

      cBox.height += padding * 2
      cBox.y -= padding
    }
  } else if (currentCropBoxControl.value?.id === 7) {
    // 上边

    cBox.height -= movementY
    cBox.y += movementY

    if (cropBox.value.locked) {
      const width = Math.floor((cBox.height / y) * x)
      const padding = Math.floor((width - cropBox.value.width) / 2)

      cBox.width += padding * 2
      cBox.x -= padding
    }
  } else if (currentCropBoxControl.value?.id === 8) {
    // 下边

    cBox.height += movementY

    if (cropBox.value.locked) {
      const width = Math.floor((cBox.height / y) * x)
      const padding = Math.floor((width - cropBox.value.width) / 2)

      cBox.width += padding * 2
      cBox.x -= padding
    }
  }

  // 裁剪框不可移出图片且不小于最小尺寸
  if (
    !(
      cBox.x - cropImage.value.x >= 0 &&
      cBox.y - cropImage.value.y >= 0 &&
      cBox.x + cBox.width <= cropImage.value.x + imageSize.value.width &&
      cBox.y + cBox.height <= cropImage.value.y + imageSize.value.height &&
      cBox.width >= cropBoxMinSize &&
      cBox.height >= cropBoxMinSize
    )
  ) {
    return
  }

  cropBox.value = {
    ...cropBox.value,
    ...cBox,
  }
}

// 裁剪框修改结束矫正裁剪容器位置与缩放
const onCropBoxControlMoveEnd = () => {
  if (!currentCropBoxControl.value) {
    return
  }

  // 矫正裁剪容器位置与缩放
  correctTransform()

  // 重置裁剪框控件状态
  setCropBoxControls(-1)
}

// 矫正裁剪容器位置与缩放
const correctTransform = () => {
  const cropWrap: HTMLElement = cropBaseRef.value.querySelector('.crop-base-wrap')

  let styleScale = 1

  if (
    ((cropWrap.clientWidth * props.maxSizeRatio) / cropBox.value.width) * cropBox.value.height <=
    cropWrap.clientHeight * props.maxSizeRatio
  ) {
    styleScale = (cropWrap.clientWidth * props.maxSizeRatio) / cropBox.value.width
  } else {
    styleScale = (cropWrap.clientHeight * props.maxSizeRatio) / cropBox.value.height
  }

  translate.value = {
    x: (cropWrap.clientWidth - cropBox.value.width) / 2 - cropBox.value.x,
    y: (cropWrap.clientHeight - cropBox.value.height) / 2 - cropBox.value.y,
  }

  scale.value = styleScale

  scaleCenter.value = {
    x: cropBox.value.x + cropBox.value.width / 2,
    y: cropBox.value.y + cropBox.value.height / 2,
  }
}

// 刷新画布
const refreshCanvas = () => {
  const originalCanvas: HTMLCanvasElement = cropBaseRef.value.querySelector(
    '.crop-base-wrap .original-canvas'
  )
  originalCanvas.width = imageSize.value.width
  originalCanvas.height = imageSize.value.height

  const stageCanvas: HTMLCanvasElement = cropBaseRef.value.querySelector(
    '.crop-base-wrap .stage-canvas'
  )
  stageCanvas.width = imageSize.value.width
  stageCanvas.height = imageSize.value.height

  const originalCtx = originalCanvas.getContext('2d')

  originalCtx.save()

  // 平移旋转缩放顺序不可改变
  originalCtx.translate(Math.floor(originalCanvas.width / 2), Math.floor(originalCanvas.height / 2))
  originalCtx.scale(flipHorizontal.value, flipVertical.value)
  originalCtx.rotate((angle.value / 180) * Math.PI)

  if (angle.value % 180 === 0) {
    originalCtx.drawImage(
      cropImage.value.ele,
      0,
      0,
      cropImage.value.ele.width,
      cropImage.value.ele.height,
      -Math.floor(originalCanvas.width / 2),
      -Math.floor(originalCanvas.height / 2),
      originalCanvas.width,
      originalCanvas.height
    )
  } else {
    originalCtx.drawImage(
      cropImage.value.ele,
      0,
      0,
      cropImage.value.ele.width,
      cropImage.value.ele.height,
      -Math.floor(originalCanvas.height / 2),
      -Math.floor(originalCanvas.width / 2),
      originalCanvas.height,
      originalCanvas.width
    )
  }

  originalCtx.restore()

  const stageCtx = stageCanvas.getContext('2d')

  // 放置原图
  stageCtx.drawImage(
    originalCanvas,
    0,
    0,
    stageCanvas.width,
    stageCanvas.height,
    0,
    0,
    stageCanvas.width,
    stageCanvas.height
  )

  // 添加蒙层
  // stageCtx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  // stageCtx.fillRect(0, 0, imageSize.value.width, imageSize.value.height)

  // 放置图片截取部分
  // stageCtx.drawImage(
  //   originalCanvas,
  //   cropBox.value.x - cropImage.value.x,
  //   cropBox.value.y - cropImage.value.y,
  //   cropBox.value.width,
  //   cropBox.value.height,
  //   cropBox.value.x - cropImage.value.x,
  //   cropBox.value.y - cropImage.value.y,
  //   cropBox.value.width,
  //   cropBox.value.height
  // )
}

// 裁剪
const crop = () => {
  const canvas = window.document.createElement('canvas')
  canvas.width = cropBox.value.width
  canvas.height = cropBox.value.height

  const ctx = canvas.getContext('2d')

  ctx.putImageData(
    (cropBaseRef.value.querySelector('.crop-base-wrap .original-canvas') as HTMLCanvasElement)
      ?.getContext('2d')
      .getImageData(
        cropBox.value.x - cropImage.value.x,
        cropBox.value.y - cropImage.value.y,
        cropBox.value.width,
        cropBox.value.height
      ),
    0,
    0
  )

  return canvas.toDataURL()
}

// 视口大小变化事件
const Eresize = () => {
  // 初始化裁剪框
  initCropBox()
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

  // 控件移动修改裁剪框
  onCropBoxControlMove(Math.floor(movementX / scale.value), Math.floor(movementY / scale.value))

  // 修改图片位置
  onCropImageMove(Math.floor(movementX / scale.value), Math.floor(movementY / scale.value))
}

// 鼠标按键抬起事件
const EmouseUp = () => {
  // 裁剪框修改结束矫正裁剪容器位置与缩放
  onCropBoxControlMoveEnd()

  // 图片移动结束矫正位置
  onCropImageMoveEnd()
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

    // 初始化画布
    await initCanvas(props.imageUrl)
    // 初始化裁剪框
    initCropBox()
  },
  { immediate: true }
)

watch(
  [() => props.cropBoxRatio],
  () => {
    // 初始化裁剪框
    initCropBox()
  },
  { immediate: false }
)

watch(
  [() => props.locked],
  () => {
    cropBox.value = {
      ...cropBox.value,
      locked: props.locked,
    }
  },
  { immediate: true }
)

watch(
  [() => props.flipHorizontal],
  () => {
    flipHorizontal.value = props.flipHorizontal
  },
  { immediate: false }
)

watch(
  [() => props.flipVertical],
  () => {
    flipVertical.value = props.flipVertical
  },
  { immediate: false }
)

watch(
  [() => props.angle],
  () => {
    angle.value = props.angle
  },
  { immediate: false }
)

watch(
  [() => cropImage.value, () => cropBox.value],
  () => {
    // 刷新画布
    window.requestAnimationFrame(refreshCanvas)
  },
  { immediate: false }
)

watch(
  [() => flipHorizontal.value, () => flipVertical.value, () => angle.value],
  (
    [flipHorizontal, flipVertical, angle],
    [originalFlipHorizontal, originalFlipVertical, originalAngle]
  ) => {
    const cImage = {
      width: imageSize.value.width,
      height: imageSize.value.height,
      x: 0,
      y: 0,
    }

    const cBox = {
      width: cropBox.value.width,
      height: cropBox.value.height,
      x: cropBox.value.x - cropImage.value.x,
      y: cropBox.value.y - cropImage.value.y,
    }

    // 不等于零说明发生了旋转 每次旋转 90 度 所以宽高互换
    if (angle - originalAngle !== 0) {
      cImage.width = imageSize.value.height
      cImage.height = imageSize.value.width

      cBox.width = cropBox.value.height
      cBox.height = cropBox.value.width

      // 裁剪框坐标更新为旋转后的
      if (angle - originalAngle > 0) {
        cBox.x =
          imageSize.value.height - cropBox.value.height - (cropBox.value.y - cropImage.value.y)
        cBox.y = cropBox.value.x - cropImage.value.x
      } else {
        cBox.x = cropBox.value.y - cropImage.value.y
        cBox.y = imageSize.value.width - cropBox.value.width - (cropBox.value.x - cropImage.value.x)
      }
    }

    // 发生水平翻转
    if (flipHorizontal !== originalFlipHorizontal) {
      cBox.x = imageSize.value.width - cropBox.value.width - (cropBox.value.x - cropImage.value.x)
    }

    // 发生垂直翻转
    if (flipVertical !== originalFlipVertical) {
      cBox.y = imageSize.value.height - cropBox.value.height - (cropBox.value.y - cropImage.value.y)
    }

    cropImage.value = {
      ...cropImage.value,
      ...cImage,
    }

    cropBox.value = {
      ...cropBox.value,
      ...cBox,
    }

    // 矫正裁剪容器位置与缩放
    correctTransform()
  },
  {
    immediate: false,
  }
)

defineExpose({
  cropImage,
  crop,
})
</script>

<style lang="less" scoped>
.crop-base {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .crop-base-wrap {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;

    &__inner {
      position: absolute;
      left: 0;
      top: 0;

      canvas {
        position: absolute;
        left: 0;
        top: 0;
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

      .crop-box {
        cursor: grab;
        position: absolute;
        left: 0;
        top: 0;

        &:active {
          cursor: grabbing;
        }

        .line {
          position: absolute;

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
