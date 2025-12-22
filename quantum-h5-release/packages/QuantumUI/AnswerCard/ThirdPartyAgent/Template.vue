<template>
  <div class="relative">
    <div :class="['flex items-center absolute gap-[5px]', loaded ? 'opacity-0' : 'opacity-100', 'fade-transition-slow']">
      <IconQuantumLogo class="w-[24px] h-[24px]" />
      <img class="w-[24px] h-[24px]" :src="icon" />
      <span
        class="
        title-s
        text-[var(--color-primary-primary)]
        ml-[7px]
        "
      >Thinking...</span>
    </div>
    <div :class="[loaded ? 'opacity-100 h-auto' : 'opacity-1 h-[100px] overflow-hidden', 'fade-transition-quick', 'answer-container_wrapper z-10 relative']">
      <slot></slot>
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<script setup lang="ts">
import { IconQuantumLogo } from '@quantum/icons';

defineProps<{
  loaded: Boolean
  icon: string
}>()
</script>

<style lang="less" scoped>
@import './animations.css';

.answer-container_wrapper {
  background-color: var(--color-surface);
  padding: 24px;
  border-radius: 24px 24px 24px 0;
  position: relative;
  box-shadow: 0 1px 2px 0 var(--effects-elevation-drop-shadow-heavy), 0 1px 3px 1px var(--effects-elevation-drop-shadow-light);

  ::v-deep(.answer-tool-bar) {
      padding: 0;
  }

  ::v-deep(.title) {
    color: var(--color-primary-primary);
    margin-bottom: 16px;
  }

  ::v-deep(.answer-plain-content) {
    &.title {
      color: var(--color-primary-primary);
      margin-bottom: 16px;
    }

    p {
      margin: 0px;
    }

    h1, h2, h3 {
      font-size: 1.2em;
      background: radial-gradient(50% 50% at 50% 50%, var(--color-ai-step-1) 0%, var(--color-processing-gradient-stop-100) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-weight: 600;
      margin-bottom: 16px;

      &::before {
        content: "✨";
        color: #feb47b;
        margin-right: 3px;
      }
    }

    blockquote:first-of-type {
      margin-top: 8px;
    }

    ul {
      list-style-type: none; /* Remove default list styling */
      padding-left: 0;
      margin: 10px 0;
      padding-left: 13px;

      li {
        position: relative;
        padding-left: 25px;
        margin-bottom: 5px;
        font-weight: 600;
      }

      li::before {
        content: "•";
        position: absolute;
        left: 8px;
        font-size: 20px;
      }
    }
  }
}
</style>
