<template>
  <teleport to="#app">
    <transition name="dialog-fade">
      <div v-if="visible" class="
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
      " @click="handleOverlayClick">
        <div class="
          w-[var(--component-modal-narrow-max-width)]
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
            p-[16px]
            gap-[8px]
            text-[var(--color-text-on-surface)]
          ">
            <SvgIcon name="openLink" />
            <div class="pt-[var(--space-8)] pl-[var(--space-8)]">
              <div class="
              text-[var(--color-text-on-surface)]
              title-m">{{ title || $t('dialog.title') }}</div>
              <div class="
              text-[var(--color-text-on-surface-variant)]
              overflow-hidden
              overflow-ellipsis
              body-m">{{ $t('dialog.content') }}</div>
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
            <img v-if="icon2" :class="['w-[60px] h-auto', icon2 ? 'w-[80px]' : '']" :src="icon2" />
            <SvgIcon v-else class="w-[60px] h-auto" name="expedia-brand" />
          </div>
          <div class="
            flex p-[16px] justify-end items-start gap-[var(--space-8)] self-stretch
          ">
            <QButton variant="text" @click="close">{{ $t('dialog.cancel') }}</QButton>
            <QButton color="primary" @click="confirm">{{ $t('dialog.continue') }}</QButton>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import SvgIcon from '@/components/SvgIcon.vue';
import { IconQuantumLogo, IconForward } from '@quantum/icons';
import { QButton } from "@libs/p-comps/volt/QButton/index.tsx";

const props = defineProps({
  visible: {
    type: Boolean
  },
  title: {
    type: String
  },
  icon2: {
    type: String
  },
});

const emit = defineEmits(['update:visible', 'confirm']);

const close = () => {
  emit('update:visible', false);
};

const confirm = () => {
  emit('confirm');
  close();
};

const handleOverlayClick = () => {
  close();
};
</script>

<style scoped>
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
