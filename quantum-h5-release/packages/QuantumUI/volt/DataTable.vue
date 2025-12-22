<template>
    <DataTable
        ref="el"
        unstyled
        :pt="theme"
        :ptOptions="{
            mergeProps: ptViewMerge
        }"
    >
        <template #paginatorcontainer="{ page, pageCount, pageLinks, changePageCallback, firstPageCallback, lastPageCallback, prevPageCallback, nextPageCallback }">
            <div class="flex flex-wrap gap-[4px] items-center justify-center">
                <SecondaryButton text rounded @click="firstPageCallback" :disabled="page === 0">
                    <template #icon>
                        <AngleDoubleLeftIcon />
                    </template>
                </SecondaryButton>
                <SecondaryButton text rounded @click="prevPageCallback" :disabled="page === 0">
                    <template #icon>
                        <AngleLeftIcon />
                    </template>
                </SecondaryButton>
                <div class="items-center justify-center gap-[4px] hidden sm:flex">
                    <SecondaryButton v-for="pageLink of pageLinks" :key="pageLink" :text="page + 1 !== pageLink" rounded @click="() => changePageCallback(pageLink - 1)" :class="['shrink-0 min-w-[20px] h-[20px]', { 'bg-highlight!': page + 1 === pageLink }]"
                        >{{ pageLink }}
                    </SecondaryButton>
                </div>
                <SecondaryButton text rounded @click="nextPageCallback" :disabled="page === pageCount! - 1">
                    <template #icon>
                        <AngleRightIcon />
                    </template>
                </SecondaryButton>
                <SecondaryButton text rounded @click="lastPageCallback" :disabled="page === pageCount! - 1">
                    <template #icon>
                        <AngleDoubleRightIcon />
                    </template>
                </SecondaryButton>
            </div>
        </template>
        <template #loadingicon>
            <SpinnerIcon class="animate-spin text-[2rem] w-[16px] h-[16px]" />
        </template>
        <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps ?? {}" />
        </template>
    </DataTable>
</template>

<script setup lang="ts">
import AngleDoubleLeftIcon from '@primevue/icons/angledoubleleft';
import AngleDoubleRightIcon from '@primevue/icons/angledoubleright';
import AngleLeftIcon from '@primevue/icons/angleleft';
import AngleRightIcon from '@primevue/icons/angleright';
import SpinnerIcon from '@primevue/icons/spinner';
import DataTable, { type DataTablePassThroughOptions, type DataTableProps } from 'primevue/datatable';
import { ref } from 'vue';
import SecondaryButton from './SecondaryButton.vue';
import { ptViewMerge } from './utils';

interface Props extends /* @vue-ignore */ DataTableProps {}
defineProps<Props>();

const theme = ref<DataTablePassThroughOptions>({
    root: `relative p-flex-scrollable:flex p-flex-scrollable:flex-col p-flex-scrollable:h-full text-[11px] leading-[32px]`,
    tableContainer: `p-scrollable:relative p-flex-scrollable:flex p-flex-scrollable:flex-col p-flex-scrollable:flex-1 p-flex-scrollable:h-full `,
    header: `py-[6px] px-[8px] border-b border-surface-200
        text-text-on-surface`,
    table: `border-spacing-0 w-full border-separate `,
    thead: `p-scrollable:top-[0px] p-scrollable:z-11 bg-surface-0/50 backdrop-blur-sm`,
    // thead: `p-scrollable:top-[0px] p-scrollable:z-10 bg-surface-0/50`,
    tbody: `p-frozen:sticky p-frozen:z-10`,
    bodyRow: `text-text-on-surface p-selectable:cursor-pointer`,
    tfoot: `p-scrollable:bottom-[0px] p-scrollable:z-10`,
    footer: `py-[6px] px-[8px] border-b border-surface-200
        text-text-on-surface`,
    mask: `text-text-on-surface absolute z-10 flex items-center justify-center w-full h-full backdrop-blur-md`,
    column: {
        root: ``,
        headerCell: `py-[6px] px-[8px] font-normal text-start transition-colors duration-200
            border-b border-surface-200
            text-text-on-surface
            p-sortable:cursor-pointer p-sortable:select-none p-sortable:focus-visible:outline p-sortable:focus-visible:outline-1 p-sortable:focus-visible:-outline-offset-1 p-sortable:focus-visible:outline-primary
            p-frozen:sticky p-frozen:z-10`,
        columnHeaderContent: `flex items-center gap-[4px]`,
        columnTitle: `font-semibold`,
        bodyCell: `text-start py-[6px] px-[8px] border-b border-surface-200
            p-frozen:sticky`,
        bodyCellContent: ``,
        footerCell: `text-start py-[6px] px-[8px] border-b border-surface-200 
            tex-text-on-surface 
            p-frozen:sticky`,
        columnFooter: `font-semibold`,
        columnResizer: `block absolute top-[0px] end-0 m-[0px] w-[4px] h-full p-[0px] cursor-col-resize border border-transparent`,
        sort: ``,
        sortIcon: `text-text-on-surface transition-colors duration-200
            group-p-sortable:not-group-p-sorted:group-hover:text-text-on-surface`,
        pcSortBadge: {
            root: `text-primary rounded-full min-w-[12px] h-[12px] inline-flex items-center justify-center text-xs font-bold`
        },
        pcHeaderCheckbox: {
            root: `relative select-none w-[16px] h-[16px] align-bottom`,
            input: `peer cursor-pointer disabled:cursor-default appearance-none
                absolute start-0 top-[0px] w-full h-full m-[0px] p-[0px] opacity-0 z-10
                border border-transparent rounded-4`,
            box: `flex justify-center items-center w-[16px] h-[16px] rounded-4
                border-[2px] border-overlay-outline
                text-text-on-surface 
                p-checked:border-primary p-checked:bg-primary p-checked:text-primary
                peer-enabled:peer-hover:p-checked:bg-[#4663FF]-emphasis peer-enabled:peer-hover:p-checked:border-[#4663FF]-emphasis
                peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-focus-visible:outline
                p-disabled:border-surface-300  p-disabled:text-text-on-surface 
                shadow-[0_1px_2px_0_rgba(18,18,23,0.05)] transition-colors duration-200`,
            icon: `text-sm w-[0.875rem] h-[0.875rem] transition-none text-on-primary`
        },
        pcRowRadiobutton: {
            root: `relative inline-flex select-none w-[16px] h-[16px]`,
            input: `peer cursor-pointer disabled:cursor-default appearance-none absolute start-0 top-[0px] w-full h-full m-[0px] p-[0px] opacity-0 z-10
                border border-transparent rounded-full`,
            box: `flex justify-center items-center rounded-full
                border border-surface-300 
                peer-enabled:peer-hover:border-surface-400 
                p-checked:border-[#4663FF] p-checked:bg-[#4663FF]
                peer-enabled:peer-hover:p-checked:bg-[#4663FF]-emphasis peer-enabled:peer-hover:p-checked:border-[#4663FF]-emphasis
                peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-focus-visible:outline
                p-invalid:border-red-400 
                p-disabled:border-surface-300  p-disabled:text-text-on-surface
                shadow-[0_1px_2px_0_rgba(18,18,23,0.05)] transition-colors duration-200
                w-[16px] h-[16px]`,
            icon: `text-xs w-[6px] h-[6px] rounded-full
                transition-all duration-200 backface-hidden scale-[0.1]
                p-checked:text-primary p-checked:visible p-checked:scale-100
                p-disabled:text-text-on-surface`
        },
        pcRowCheckbox: {
            root: `relative select-none w-[16px] h-[16px] align-bottom`,
            input: `peer cursor-pointer disabled:cursor-default appearance-none
                absolute start-0 top-[0px] w-full h-full m-[0px] p-[0px] opacity-0 z-10
                border border-transparent rounded-4`,
            box: `flex justify-center items-center w-[16px] h-[16px] rounded-4
                border-[2px] border-overlay-outline
                text-text-on-surface 
                p-checked:border-primary p-checked:bg-primary p-checked:text-primary
                peer-enabled:peer-hover:p-checked:bg-[#4663FF]-emphasis peer-enabled:peer-hover:p-checked:border-[#4663FF]-emphasis
                peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-focus-visible:outline
                p-disabled:border-surface-300  p-disabled:text-text-on-surface 
                shadow-[0_1px_2px_0_rgba(18,18,23,0.05)] transition-colors duration-200`,
            icon: `text-sm w-[0.875rem] h-[0.875rem] transition-none text-on-primary`
        },
        rowToggleButton: `inline-flex items-center justify-center overflow-hidden relative w-[14px] h-[14px] cursor-pointer select-none
            transition-colors duration-200 rounded-full border-none
            text-text-on-surface enabled:hover:text-text-on-surface
            focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-primary
            p-selected:hover:text-primary`,
        rowToggleIcon: ``,
        reorderableRowHandle: ``
    },
    loadingIcon: ``,
    pcPaginator: {
        paginatorContainer: `p-bottom:border-b border-surface-200`,
        root: `flex items-center justify-center flex-wrap py-[4px] px-[8px] rounded-md gap-[2px]
             text-text-on-surface `
    },
    columnResizeIndicator: `w-px absolute z-10 hidden`,
    rowReorderIndicatorUp: `absolute hidden`,
    rowReorderIndicatorDown: `absolute hidden`
});

const el = ref();
defineExpose({
    exportCSV: () => el.value.exportCSV()
});
</script>

