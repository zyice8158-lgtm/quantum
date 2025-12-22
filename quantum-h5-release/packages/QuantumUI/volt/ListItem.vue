<template>
  <li class="volt-item" :class="[{ 'is-filled': filled }, { 'is-disabled': disabled }]">
    <!-- leading：完全交给外部 -->
    <div class="leading" v-if="$slots.leading">
      <slot name="leading" />
    </div>

    <!-- content -->
    <div class="content">
      <div class="title">{{ title }}</div>
      <div v-if="subTitle" class="subtitle">{{ subTitle }}</div>
    </div>

    <!-- trailing：默认箭头，可覆盖 -->
    <div class="trailing">
      <slot name="trailing">
        <SvgIcon name="shape_icon" size="20" color="var(--color-text-on-surface-variant)" />
      </slot>
    </div>
  </li>
</template>

<script setup lang="ts">
import { SvgIcon } from "../Icons";

defineProps<{
  id: string;
  title: string;
  subTitle?: string;
  /** 是否填充底色 */
  filled?: boolean;
  /** 禁用态 */
  disabled?: boolean;
}>();
</script>

<style scoped>
.volt-item {
  display: inline-grid;
  grid-template-columns: auto max-content auto;
  width: fit-content;
  max-width: 100%;
  align-items: center;
  gap: 16px;
  padding: 4px 12px 5px 12px;
  border-radius: var(--radius-16);
  user-select: none;
  transition: background-color 0.15s ease;
  background: var(--color-on-primary);
}
.volt-item.is-filled {
  /* TODO这里颜色需要改设计稿里没有这个颜色 */
  background: #f5f3f1;
}
.volt-item.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}
.content {
  min-width: 0;
}
.title {
  font-size: var(--text-title-s);
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text-on-surface);
}
.subtitle {
  margin-top: 4px;
  font-size: var(--text-label-s);
  color: var(--color-text-on-surface-variant);
}
.trailing {
  display: flex;
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
}
.leading {
  display: flex;
  width: 40px;
  justify-content: center;
  align-items: flex-start;
}
</style>
