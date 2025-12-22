<template>
    <Listbox
        unstyled
        :pt="theme"
        :ptOptions="{
            mergeProps: ptViewMerge
        }"
    >
        <template #filtericon>
            <SearchIcon class="text-surface-400" />
        </template>
        <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps ?? {}" />
        </template>
    </Listbox>
</template>

<script setup lang="ts">
import SearchIcon from '@primevue/icons/search';
import Listbox, { type ListboxPassThroughOptions, type ListboxProps } from 'primevue/listbox';
import { ref } from 'vue';
import { ptViewMerge } from './utils';

interface Props extends /* @vue-ignore */ ListboxProps {}
defineProps<Props>();

const theme = ref<ListboxPassThroughOptions>({
    root: `group bg-surface-0 dark:bg-surface-950 text-surface-700 dark:text-surface-0
        border border-surface-300 dark:border-surface-700 rounded-md
        p-disabled:bg-surface-200 p-disabled:text-surface-500 dark:p-disabled:bg-surface-700 dark:p-disabled:text-surface-400 p-disabled:pointer-events-none
        p-invalid:border-red-400 dark:p-invalid:border-red-300
        shadow-[0_1px_2px_0_rgba(18,18,23,0.05)] transition-colors duration-200`,
    header: `pt-[4px] pb-[2px] px-[8px]`,
    pcFilterContainer: {
        root: `relative`
    },
    pcFilter: {
        root: `w-full appearance-none rounded-md outline-hidden
            bg-surface-0 dark:bg-surface-950
            text-surface-700 dark:text-surface-0
            placeholder:text-surface-500 dark:placeholder:text-surface-400
            border border-surface-300 dark:border-surface-700
            enabled:hover:border-surface-400 dark:enabled:hover:border-surface-600
            enabled:focus:border-primary
            disabled:bg-surface-200 disabled:text-surface-500
            dark:disabled:bg-surface-700 dark:disabled:text-surface-400
            ps-3 pe-10 py-[4px] p-fluid:w-full
            transition-colors duration-200 shadow-[0_1px_2px_0_rgba(18,18,23,0.05)]`
    },
    pcFilterIconContainer: {
        root: `absolute top-[1/2] -mt-[4px] leading-none end-3 z-1`
    },
    filterIcon: `text-surface-400`,
    listContainer: `overflow-auto`,
    virtualScroller: ``,
    list: `list-none m-[0px] p-[2px] outline-none flex flex-col gap-[2px]`,
    optionGroup: `m-[0px] px-[6px] py-[4px] text-surface-500 dark:text-surface-400 font-semibold`,
    option: `flex items-center cursor-pointer relative overflow-hidden px-[6px] py-[4px] border-none rounded-sm
        text-surface-700 dark:text-surface-0
        hover:not-p-selected:bg-surface-100 dark:hover:not-p-selected:bg-surface-800 hover:not-p-selected:text-surface-800 dark:hover:not-p-selected:text-surface-0
        p-focus:not-p-selected:bg-surface-100 dark:p-focus:not-p-selected:bg-surface-800 p-focus:not-p-selected:text-surface-800 dark:p-focus:not-p-selected:text-surface-0
        p-selected:bg-highlight p-selected:p-focus:bg-highlight-emphasis
        group-p-disabled:text-surface-500 dark:group-p-disabled:text-surface-400 group-p-disabled:pointer-events-none
        p-disabled:opacity-60 p-disabled:pointer-events-none
        transition-colors duration-200`,
    optionCheckIcon: `relative -ms-[0.375rem] me-[0.375rem] text-surface-700 dark:text-surface-0`,
    optionBlankIcon: ``,
    emptyMessage: `px-[6px] py-[4px]`
});
</script>

