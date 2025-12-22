<template>
  <Toast
    unstyled
    :pt="theme"
    :ptOptions="{
      mergeProps: ptViewMerge,
    }"
    v-bind="{ ...$attrs }"
    :position="position"
    :group="group"
  >
    <template #closeicon> </template>
    <template v-for="(_, slotName) in $slots" v-slot:[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
    <template #icon>
      <IconQuantumLogo class="w-[24px] h-[24px] shrink-0"/>
    </template>
  </Toast>
</template>

<script setup lang="ts">
import { IconQuantumLogo } from "@quantum/icons";
import Toast, { type ToastPassThroughOptions, type ToastProps } from 'primevue/toast';
import './index.less'
import { ref,type PropType,computed } from 'vue';
import { ptViewMerge } from '../utils';

interface Props extends ToastProps {
  dark?: boolean;
}
const propsOption = defineProps({
  position: {
    type: String as PropType<Props['position']>,
    default: 'top-center',
  },
  group: {
    type: String as PropType<Props['group']>,
  },
});

const transitionBox = computed(() => {
    if(['top-center', 'bottom-center','center'].includes(propsOption.position)) {
        return " -translate-x-[50%] "
    }else{
        return ""
    }
})
// const position = ref('bottom-left');
// const group = ref('bl');
console.log(propsOption,34)
const theme = ref<ToastPassThroughOptions>({
    root: `h-[48px] mb-[10px] ${transitionBox.value}`,
    message: `Qtoast max-w-[70vw] rounded-[1000px] p-[10px] pl-[16px] pr-[20px] bg-surface text-text-on-surface mb-[2px] break-normal`,
    messageContent: `flex items-center gap-[8px]`,
    messageIcon: ` w-[24px] h-[24px]`,
    messageText: `flex-auto flex gap-2`,
    summary: `hidden`,
    detail: `font-medium text-[14px]! font-[400]!`,
    buttonContainer: `hidden`,
    closeButton: `hidden`,
    closeIcon: ``,
    transition: {
        enterFromClass: 'opacity-0 translate-y-1/2',
        enterActiveClass: 'transition-all duration-500',
        leaveFromClass: 'max-h-[1000px]',
        leaveActiveClass: 'transition-all duration-500',
        leaveToClass: 'max-h-0 opacity-0 mb-0 overflow-hidden'
    }
});
</script>
