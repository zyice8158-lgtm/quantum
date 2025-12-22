<template>
  <teleport to="body">
    <transition name="dialog-fade">
      <div v-if="visible"
        role="dialog" aria-modal="true" tabindex="1"
        class="
        fixed
        top-0
        left-0
        w-full
        h-full
        bg-[var(--color-surface-blur-high)]
        flex
        items-center
        justify-center
        z-1000
        transition-opacity
        duration-300
        ease-in-out
        high-contrast
      " @click="handleOverlayClick"
        @keydown="handleKeydown"
      >
        <div
          :aria-labelledby="title" :aria-describedby="subTitle"
          class="
          w-[448px]
          translate-y-5
          transition-transform
          duration-300
          ease-in-out
          rounded-[var(--radius-24)]
          bg-[var(--color-surface)]
          shadow-[0_4px_8px_3px_var(--color-on-primary-container-hover)_,0_1px_3px_0_var(--color-overlay-scrim)]
        " @click.stop>
          <div class="
            flex justify-start items-start
            gap-[8px]
            p-[16px]
            text-[var(--color-text-on-surface)]
          ">
            <IconOpenLink />
            <div class="pt-[var(--space-8)] pl-[var(--space-8)]">
              <div class="
              text-[var(--color-text-on-surface)]
              title-m">{{ title }}</div>
              <div class="
              text-[var(--color-text-on-surface-variant)]
              overflow-hidden
              overflow-ellipsis
              body-m">{{ subTitle }}</div>
            </div>
          </div>
          <div class="
          flex h-[200px] px-[10px] justify-center items-center gap-[15px] flex-1
          text-[var(--color-text-on-surface)]
          ">
            <IconQuantumLogo
              class="w-[52px] h-[52px]"
            />
            <IconForward class="arrow w-[20px] h-[20px] m-[5px]" />
            <img :class="['w-[60px] h-auto']" :src="map[brandLow] || map.expedia" />
          </div>
          <div class="
            flex p-[16px] justify-end items-start gap-[var(--space-8)] self-stretch
          ">
            <QButton variant="text" @click="close">{{ cancelBtn }}</QButton>
            <QButton color="primary" @click="confirm">{{ confirmBtn }}</QButton>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import Expedia from './brand/expedia-brand.svg';
import Vrbo from './brand/vrbo-brand.svg';
import { IconOpenLink } from './icon.tsx'
import { IconQuantumLogo, IconForward } from '@quantum/icons';
import { QButton } from "../../volt/QButton/index.tsx";

const props = defineProps({
  visible: {
    type: Boolean
  },
  title: {
    type: String,
    default: 'Open in Partner app'
  },
  subTitle: {
    type: String,
    default: 'You\'ll be taken to a partner app to finish this action'
  },
  confirmBtn: {
    type: String,
    default: 'Continue to app'
  },
  cancelBtn: {
    type: String,
    default: 'Cancel'
  },
  brand: {
    type: String,
    default: 'expedia' //Vrbo
  }
});

const map = {
  expedia: Expedia, vrbo: Vrbo
}

const brandLow = computed(() => props.brand?.toLowerCase() || 'expedia')

const emit = defineEmits(['update:visible', 'confirm']);

const close = () => {
  emit('update:visible', false);
};

const confirm = () => {
  emit('confirm');
  close();
};

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    handleOverlayClick();
  }
}

const handleOverlayClick = () => {
  close();
};
</script>

<style scoped>
@media screen and (forced-colors: active) {
  .high-contrast
  {
    forced-color-adjust: none;
    background-color: Highlight;
    color: HighlightText;
  }
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-to,
.dialog-fade-leave-from {
  opacity: 1;
}
</style>
