<template>
  <svg :class="[className, `w-[${size}px] h-[${size}px] overflow-hidden fill-current`]"
    :style="{ color: color }"
    aria-hidden="true">
    <use :xlink:href="`#icon-${name}`" />
  </svg>
</template>

<script setup lang="ts">
interface Props{
  name: string
  className?: string
  size?:number
  color?:string
}
const props= withDefaults(defineProps<Props>(),{
  className:'',
  size: 16,
  color:''
})
</script>
