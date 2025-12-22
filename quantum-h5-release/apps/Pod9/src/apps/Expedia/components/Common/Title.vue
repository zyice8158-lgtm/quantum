<template>
  <div class="
    bg-transparent
    flex gap-[.2em]
    flex-row justify-start items-baseline
    body-m
    py-[6px]
  " v-if="content">
    <div v-if="star"  class="text-[1.2em]">✨</div>
    <div class="
      text-transparent
      font-semibold
      bg-clip-tex
      gradient-text
    ">{{ content }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  star?: boolean
  content: string
}>()
</script>

<style lang="css" scoped>
.gradient-text {
  background: var(--Processing);
  -webkit-background-clip: text;
  background-clip: text;
}
</style>
