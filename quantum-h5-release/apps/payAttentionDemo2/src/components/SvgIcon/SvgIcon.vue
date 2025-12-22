<template>
  <svg :class="svgClass"
       :style="{ color: color }"
       aria-hidden="true">
    <use :xlink:href="`#icon-${name}`" />
  </svg>
</template>
  
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string // svg 图标名称
  className?: string // 指定的类样式
  size?: number // 图标尺寸
  color?: string // 图标颜色
}
const props = withDefaults(defineProps<Props>(), {
  className: '',
  size: 16,
  color: '',
})
const svgClass = computed(() => {
  if (props.className) {
    return 'svg-icon ' + props.className
  }
  return 'svg-icon'
})
</script>
  
<style scoped>
.svg-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
  overflow: hidden;
}
</style>
  