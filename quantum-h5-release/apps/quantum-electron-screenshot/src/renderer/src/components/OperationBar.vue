<template>
  <div ref="operationBarRef" class="operation-bar" :style="[computedStyle]">
    <Spin v-if="showLoading" class="loading" />
    <QToolBar v-else :buttons="processedButtons" @button-click="onToolbarBtnClick">
      <template #left>
        <SvgIcon name="NewLogo"></SvgIcon>
      </template>
    </QToolBar>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, withDefaults, nextTick, onMounted, onUnmounted } from 'vue'
import SvgIcon from './SvgIcon.vue'
import { Props, MESSAGE_TYPE } from '../types'
import QToolBar from '@libs/p-comps/ToolBar'
import SearchImg from '../assets/icons/search_ai.png'
import FolderImg from '../assets/icons/folder.png'
import HelpImg from '../assets/icons/help.png'
import lightImg from '../assets/icons/lightbulb.png'
import CANCEL from '../assets/cancel_icon.svg?url'
import CONFIRM from '../assets/confirm_icon.svg?url'
import { Spin } from 'ant-design-vue'

const operationBarRef = ref<HTMLElement | null>(null)
const domWH = ref({ width: 0, height: 0 })
const resizeObserver = ref<ResizeObserver | null>(null)
const emit = defineEmits(['sendMsg'])
const send = (type: string) => {
  emit('sendMsg', type)
}

const props = withDefaults(defineProps<Props>(), {
  rect: () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  }),
  btns: () => [],
  screenShotMode: 'App'
})

// Show loading when there are no buttons
const showLoading = computed(() => {
  return props.btns.length === 0
})

// Setup ResizeObserver to track size changes
onMounted(() => {
  resizeObserver.value = new ResizeObserver(entries => {
    if (entries[0]) {
      const { width, height } = entries[0].contentRect
      // Only update if size has actually changed
      if (width !== domWH.value.width || height !== domWH.value.height) {
        domWH.value = { width, height }
      }
    }
  })

  if (operationBarRef.value) {
    resizeObserver.value.observe(operationBarRef.value)
  }

  // Initial size update
  nextTick(() => {
    updateDimensions()
  })
})

// Clean up ResizeObserver
onUnmounted(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
})

// Function to update dimensions
const updateDimensions = () => {
  if (operationBarRef.value) {
    const rect = operationBarRef.value.getBoundingClientRect()
    domWH.value = {
      width: rect.width,
      height: rect.height
    }
  }
}

const iconMap: Record<string, string> = {
  'IMAGE_UNDERSTANDING': HelpImg,
  'WORK_ASSISTANT_IMAGE_SEARCH': SearchImg,
  'SearchPKB': FolderImg,
  'AddKnowledge': lightImg,
  'Cancel': CANCEL,
  'Web Search': SearchImg,
  'Translation': FolderImg,
  'Face Retrieval': HelpImg,
  'Image Understanding': lightImg,
  'Image Retrieval': FolderImg,
  'Confirm': CONFIRM
}
const processedButtons = computed(() => {
  return props.btns.map((btn) => ({
    icon: iconMap[btn.name] || lightImg,
    text: btn.text
  }))
})
const onToolbarBtnClick = (idx: number, text: string) => {
  let msg = text
  if (idx === processedButtons.value.length - 1) {
    msg = MESSAGE_TYPE.CANCLE
  }
  send(msg)
}
const gap = 20 // bar与截图区域的间隙
const computedStyle = computed(() => {
  console.log(props.rect.y, props.rect, '传递的属性')

  const style: Record<string, string> = {
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto'
  }

  // Use fixed dimensions when loading, dynamic when buttons are present
  const width = showLoading.value ? 300 : (domWH.value.width || 300)
  const height = showLoading.value ? 48 : (domWH.value.height || 48)

  console.log(width, height, '计算bar的宽高')
  // 计算上下左右留白 决定显示位置 包括 任务栏
  if (props.screenShotMode === 'App') {
    // 固定在截图区域顶部，水平居中
    const centerX = props.rect.x + props.rect.width / 2
    let left = centerX - width / 2
    if (left < 0) {
      left = 0
    }
    if (left + width > screen.width) {
      left = screen.width - width
    }
    return {
      top: props.rect.y + 15 + 'px',
      left: left + 'px',
      right: 'auto',
      bottom: 'auto'
    }
  }
  const availBottom = screen.height - props.rect.y - props.rect.height
  const availLeft = props.rect.x + props.rect.width // 右对齐
  const availRight = screen.width - props.rect.x // 左对齐
  const availTop = props.rect.y
  console.log(availBottom, availLeft, availRight, availTop, '计算的留白')
  if (availBottom < height + gap) {
    if (availTop >= height + gap) {
      style.top = availTop - height - gap + 'px'
    } else {
      style.bottom = availBottom + gap + 'px'
    }
  } else {
    style.bottom = availBottom - height - gap + 'px'
  }
  if (availLeft < width) {
    style.left = props.rect.x + 'px'
  } else {
    style.right = availRight - props.rect.width + 'px'
  }
  console.log(style, '计算的位置')
  return style
})
</script>
<style lang="less" scoped>
.operation-bar {
  min-width: 300px;
  min-height: 48px;
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: all;
  z-index: 2;
  background: #dededec2;
  backdrop-filter: blur(4px);
  border-radius: 100px;
  padding: 7px 8px 7px 12px;
  display: flex;
  justify-content: center;
  align-items: center;

  :deep(.q-toolbar) {
    overflow: visible; // Prevent QToolBar from scrolling
    width: 100%;
  }

  :deep(.q-toolbar-buttons) {
    flex-wrap: nowrap; // Ensure buttons don't wrap
    width: 100%;
    justify-content: center;
  }
}

.loading {
  :deep(.ant-spin) {
    color: #1890ff;
  }

  :deep(.ant-spin-dot-item) {
    background-color: #1890ff;
  }
}
</style>
