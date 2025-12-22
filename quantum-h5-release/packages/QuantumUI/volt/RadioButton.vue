<template>
    <RadioButton
        unstyled
        :pt="theme"
        :ptOptions="{
            mergeProps: ptViewMerge
        }"
    />
</template>

<script setup lang="ts">
import RadioButton, { type RadioButtonPassThroughOptions, type RadioButtonProps } from 'primevue/radiobutton';
import { ref } from 'vue';
import { ptViewMerge } from './utils';

interface Props extends /* @vue-ignore */ RadioButtonProps {}
defineProps<Props>();

const theme = ref<RadioButtonPassThroughOptions>({
    root: `relative inline-flex select-none w-[18px] h-[18px]
        p-small:w-[8px] p-small:h-[8px]
        p-large:w-[12px] p-large:h-[12px]`,

    input: `peer cursor-pointer disabled:cursor-default appearance-none absolute start-0 top-0 w-full h-full m-0 p-0 opacity-0 z-10
        border-[2px] border-transparent rounded-full`,

    box: `flex justify-center items-center rounded-full
        border-[2px]
        border-[var(--color-overlay-outline)]                 
        p-disabled:border-[var(--p-surface-400)]
        bg-surface-0 dark:bg-surface-950
        p-checked:border-primary
        peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2
        peer-focus-visible:outline-primary peer-focus-visible:outline
        p-filled:bg-surface-50 dark:p-filled:bg-surface-800
        p-invalid:border-red-400 dark:p-invalid:border-red-300
         opacity-[0.7] dark:p-disabled:bg-surface-400

        shadow-[0_1px_2px_0_rgba(18,18,23,0.05)]
        transition-colors duration-200

        w-[18px] h-[18px]
        p-small:w-[8px] p-small:h-[8px]
        p-large:w-[12px] p-large:h-[12px]`,

    icon: `bg-transparent text-xs w-[10px] h-[10px] rounded-full
        transition-all duration-200 backface-hidden scale-[0]
        p-checked:bg-primary
        p-checked:visible p-checked:scale-100
        p-disabled:bg-(--color-overlay-outline) p-disabled:opacity-[0.5] dark:p-disabled:bg-surface-400
        p-small:w-[4px] p-small:h-[4px]
        p-large:w-[8px] p-large:h-[8px]`
});


</script>

