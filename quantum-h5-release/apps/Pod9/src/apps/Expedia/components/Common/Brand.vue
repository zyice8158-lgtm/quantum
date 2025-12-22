<template>
  <div class="
    bg-transparent
    flex items-center gap-[8px]
    py-[8px]
  ">
    <SvgIcon class="
      w-[16px]
      h-[16px]
    " :name="brand?.icon ? brand?.icon : 'expedia-brand'" />
    <div class="
      body-m
      text-[var(--secondary-text)]
      text-14
      font-SF-Pro-Text
    ">{{ brand?.title || $t('expedia') }}</div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/SvgIcon.vue';
defineProps<{
  brand?: {
    icon: string,
    title: string
  }
}>()
</script>
