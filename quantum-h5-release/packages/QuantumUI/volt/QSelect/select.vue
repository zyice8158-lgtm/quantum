<template>
    <Select
        unstyled
        :pt="theme"
        :ptOptions="{
            mergeProps: true
        }"
        class="q-select-override"
    >
        <template #dropdownicon>
            <ChevronDownIcon class="w-4 h-4 text-gray-400" />
        </template>
        <template #loadingicon>
            <SpinnerIcon class="animate-spin text-gray-400" />
        </template>
        <template #filtericon>
            <SearchIcon class="text-gray-400" />
        </template>
        <template #clearicon>
            <TimesIcon class="text-gray-400 absolute top-1/2 -mt-2 end-10" />
        </template>
        <template v-for="(_, slotName) in $slots" v-slot:[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps ?? {}" />
        </template>
    </Select>
</template>

<script setup lang="ts">
import ChevronDownIcon from '@primevue/icons/chevrondown';
import SearchIcon from '@primevue/icons/search';
import SpinnerIcon from '@primevue/icons/spinner';
import TimesIcon from '@primevue/icons/times';
import Select, { type SelectPassThroughOptions, type SelectProps } from 'primevue/select';
import { ref } from 'vue';

interface Props extends /* @vue-ignore */ SelectProps {}
defineProps<Props>();

const theme = ref<SelectPassThroughOptions>({
    root: `inline-flex cursor-pointer relative select-none rounded-xl p-fluid:flex
        shadow-sm hover:shadow-md
        transition-all duration-200`,
    label: `block whitespace-nowrap overflow-hidden flex-auto w-full
        py-2.5 px-4 overflow-ellipsis
        font-medium
        p-small:text-sm
        p-large:text-lg`,
    dropdown: `flex items-center justify-center shrink-0 bg-transparent
        w-10 rounded-e-xl`,
    overlay: `absolute top-0 left-0 rounded-xl p-portal-self:min-w-full
        shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] mt-2 py-1`,
    header: `pt-2 pb-1 px-4`,
    pcFilterContainer: {
        root: `relative`
    },
    pcFilter: {
        root: `w-full appearance-none rounded-lg outline-hidden
            bg-transparent
            border border-gray-200
            ps-3 pe-10 py-2 p-fluid:w-full
            transition-colors duration-200`
    },
    pcFilterIconContainer: {
        root: `absolute top-1/2 -mt-2 leading-none end-3 z-1`
    },
    listContainer: `overflow-auto`,
    list: `m-0 p-1 list-none flex flex-col gap-1`,
    optionGroup: `m-0 px-4 py-2 bg-transparent font-semibold text-sm`,
    optionGroupLabel: ``,
    option: `cursor-pointer font-medium whitespace-nowrap relative overflow-hidden flex items-center
        px-4 py-2.5 mx-1 border-none rounded-lg
        transition-colors duration-200`,
    optionLabel: ``,
    optionCheckIcon: `relative -ms-[0.375rem] me-[0.375rem]`,
    optionBlankIcon: ``,
    emptyMessage: `px-4 py-3 text-center`,
    virtualScroller: ``,
    transition: {
        enterFromClass: 'opacity-0 scale-y-95 translate-y-1',
        enterActiveClass: 'transition duration-150 ease-out',
        leaveActiveClass: 'transition duration-100 ease-in',
        leaveToClass: 'opacity-0 scale-y-95 translate-y-1'
    }
});
</script>

<style lang="less" src="./select.less"></style>
