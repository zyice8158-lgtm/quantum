<template>
    <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
onMounted(() => {
//   function setRem() {
//     // 窗口宽度
//     const clientWidth = document.documentElement.clientWidth
//     // scale 缩放比例
//     const scale = clientWidth / 10
//     document.documentElement.style.fontSize = Math.min(scale, 60) + 'px'
//   }
//   setRem();
//   window.addEventListener('resize', function(){
//     setRem();
//   });
});
</script>
<style lang="less"></style>
