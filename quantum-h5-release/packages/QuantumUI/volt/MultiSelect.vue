<template>
    <MultiSelect
        unstyled
        :pt="theme"
        :ptOptions="{
            mergeProps: ptViewMerge
        }"
    >
        <template #dropdownicon>
            <ChevronDownIcon />
        </template>
        <template #loadingicon>
            <SpinnerIcon class="animate-spin" />
        </template>
        <template #filtericon>
            <SearchIcon class="text-surface-400" />
        </template>
        <template #clearicon="{ clearCallback }">
            <TimesIcon @click="clearCallback" class="text-surface-400 absolute top-[1/2] -mt-[4px] end-10" />
        </template>
        <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps ?? {}" />
        </template>
    </MultiSelect>
</template>

<script setup lang="ts">
import ChevronDownIcon from '@primevue/icons/chevrondown';
import SearchIcon from '@primevue/icons/search';
import SpinnerIcon from '@primevue/icons/spinner';
import TimesIcon from '@primevue/icons/times';
import MultiSelect, { type MultiSelectPassThroughOptions, type MultiSelectProps } from 'primevue/multiselect';
import { ref } from 'vue';
import { ptViewMerge } from './utils';

interface Props extends /* @vue-ignore */ MultiSelectProps {}
defineProps<Props>();

const theme = ref<MultiSelectPassThroughOptions>({
    root: `inline-flex cursor-pointer relative select-none rounded-md p-fluid:flex
        bg-surface-0 dark:bg-surface-950
        border border-surface-300 hover:border-surface-400 dark:border-surface-600 dark:hover:border-surface-700
        p-focus:border-primary
        p-filled:bg-surface-50 dark:p-filled:bg-surface-800
        p-invalid:border-red-400 dark:p-invalid:border-red-300
        p-disabled:bg-surface-200 p-disabled:text-surface-500 dark:p-disabled:bg-surface-700 dark:p-disabled:text-surface-400 p-disabled:pointer-events-none
        shadow-[0_1px_2px_0_rgba(18,18,23,0.05)]
        transition-colors duration-200`,
    labelContainer: `overflow-hidden flex-auto`,
    label: `flex items-center gap-[2px] whitespace-nowrap overflow-hidden text-ellipsis px-[6px] py-[4px] p-has-chip:py-[2px] p-has-chip:px-[0.375rem]
        text-surface-700 dark:text-surface-0
        p-placeholder:text-surface-500 dark:p-placeholder:text-surface-400
        p-disabled:text-surface-500 dark:p-disabled:text-surface-400
        p-empty:overflow-hidden p-empty:opacity-0
        p-small:text-sm p-small:px-[0.625rem] p-small:py-[0.375rem]
        p-large:text-lg p-large:px-[0.875rem] p-large:py-[0.625rem]`,
    chipItem: ``,
    pcChip: {
        root: `inline-flex items-center gap-[4px] px-[6px] py-[2px] rounded-sm
            bg-surface-100 dark:bg-surface-800
            text-surface-800 dark:text-surface-0
            has-[img]:pt-[2px] has-[img]:pb-[2px]
            p-removable:pe-2`,
        removeIcon: `cursor-pointer text-base w-[8px] h-[8px] rounded-full text-surface-800 dark:text-surface-0`
    },
    dropdown: `flex items-center justify-center shrink-0 bg-transparent
        text-surface-400 w-[20px] rounded-e-md`,
    overlay: `absolute top-[0px] left-[0px] rounded-md p-portal-self:min-w-full
        bg-surface-0 dark:bg-surface-900
        border border-surface-200 dark:border-surface-700
        text-surface-700 dark:text-surface-0
        shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]`,
    header: `flex items-center pt-[4px] pb-[2px] px-[8px] gap-[4px]`,
    pcHeaderCheckbox: {
        root: `relative inline-flex select-none w-[10px] h-[10px] align-bottom`,
        input: `peer cursor-pointer disabled:cursor-default appearance-none
            absolute start-0 top-[0px] w-full h-full m-[0px] p-[0px] opacity-0 z-10
            border border-transparent rounded-xs`,
        box: `flex justify-center items-center rounded-sm w-[10px] h-[10px]
            border border-surface-300 dark:border-surface-700
            bg-surface-0 dark:bg-surface-950
            text-surface-700 dark:text-surface-0
            peer-enabled:peer-hover:border-surface-400 dark:peer-enabled:peer-hover:border-surface-600
            p-checked:border-primary p-checked:bg-primary p-checked:text-primary-contrast
            peer-enabled:peer-hover:p-checked:bg-primary-emphasis peer-enabled:peer-hover:p-checked:border-primary-emphasis
            peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-focus-visible:outline
            p-disabled:bg-surface-200 dark:p-disabled:bg-surface-400 p-disabled:border-surface-300 dark:p-disabled:border-surface-700 p-disabled:text-surface-700 dark:p-disabled:text-surface-400
            shadow-[0_1px_2px_0_rgba(18,18,23,0.05)] transition-colors duration-200`,
        icon: `text-sm w-[0.875rem] h-[0.875rem] transition-none`
    },
    pcFilterContainer: {
        root: `relative flex-auto`
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
    listContainer: `overflow-auto`,
    virtualScroller: ``,
    list: `m-[0px] p-[2px] list-none gap-[2px] flex flex-col`,
    optionGroup: `m-[0px] px-[6px] py-[4px] bg-transparent text-surface-500 dark:text-surface-400 font-semibold`,
    option: `cursor-pointer font-normal whitespace-nowrap relative overflow-hidden flex items-center gap-[4px] px-[6px] py-[4px]
        rounded-sm text-surface-700 dark:text-surface-0 bg-transparent border-none
        p-focus:bg-surface-100 dark:p-focus:bg-surface-800 p-focus:text-surface-800 dark:p-focus:text-surface-0
        transition-colors duration-200`,
    optionLabel: ``,
    pcOptionCheckbox: {
        root: `relative inline-flex select-none w-[10px] h-[10px] align-bottom`,
        input: `peer cursor-pointer disabled:cursor-default appearance-none
            absolute start-0 top-[0px] w-full h-full m-[0px] p-[0px] opacity-0 z-10
            border border-transparent rounded-xs`,
        box: `flex justify-center items-center rounded-sm w-[10px] h-[10px]
            border border-surface-300 dark:border-surface-700
            bg-surface-0 dark:bg-surface-950
            text-surface-700 dark:text-surface-0
            peer-enabled:peer-hover:border-surface-400 dark:peer-enabled:peer-hover:border-surface-600
            p-checked:border-primary p-checked:bg-primary p-checked:text-primary-contrast
            peer-enabled:peer-hover:p-checked:bg-primary-emphasis peer-enabled:peer-hover:p-checked:border-primary-emphasis
            peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-focus-visible:outline
            p-disabled:bg-surface-200 dark:p-disabled:bg-surface-400 p-disabled:border-surface-300 dark:p-disabled:border-surface-700 p-disabled:text-surface-700 dark:p-disabled:text-surface-400
            shadow-[0_1px_2px_0_rgba(18,18,23,0.05)] transition-colors duration-200`,
        icon: `text-sm w-[0.875rem] h-[0.875rem] transition-none`
    },
    emptyMessage: `px-[6px] py-[4px]`,
    transition: {
        enterFromClass: 'opacity-0 scale-y-75',
        enterActiveClass: 'transition duration-120 ease-[cubic-bezier(0,0,0.2,1)]',
        leaveActiveClass: 'transition-opacity duration-100 ease-linear',
        leaveToClass: 'opacity-0'
    }
});
</script>

