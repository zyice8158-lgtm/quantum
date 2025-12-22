<template>
  <TieredMenu
    ref="el"
    unstyled
    :pt="theme"
    :ptOptions="{
      mergeProps: ptViewMerge,
    }"
    @show="$emit('show', $event)"
    @hide="$emit('hide', $event)"
  >
    <template #itemicon="{ item }">
      <component :is="item.icon"></component>
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </TieredMenu>
</template>

<script setup lang="ts">
import TieredMenu, { type TieredMenuPassThroughOptions, type TieredMenuProps } from "primevue/tieredmenu";
import { ref } from "vue";
import { ptViewMerge } from "./utils";

interface Props extends /* @vue-ignore */ TieredMenuProps {}
defineProps<Props>();

const emit = defineEmits<{
  show: [event: Event];
  hide: [event: Event];
}>();

const theme = ref<TieredMenuPassThroughOptions>({
  root: `bg-surface-0 dark:bg-surface-900 
        text-surface-700 dark:text-surface-0 
        border border-surface-200 dark:border-surface-700
        rounded-md min-w-[104px]
        p-popup:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] outline-none`,
  item: `p-disabled:opacity-60 p-disabled:pointer-events-none hover:bg-[rgba(133,94,225,0.12)] rounded-[8px]`,
  itemContent: `group transition-colors duration-200 rounded-sm text-surface-700 dark:text-surface-0
        p-focus:bg-surface-100 dark:p-focus:bg-surface-800 p-focus:text-surface-800 dark:p-focus:text-surface-0
        hover:bg-[rgba(133, 94, 225, 0.12)] hover:text-surface-800 dark:hover:text-surface-0 rounded-[8px]`,
  itemLink: `cursor-pointer flex items-center justify-between no-underline overflow-hidden relative text-inherit
        px-[6px] py-[4px] gap-[4px] select-none outline-none`,
  itemIcon: `text-surface-400 dark:text-surface-500
        p-focus:text-surface-500 dark:p-focus:text-surface-400
        group-hover:text-surface-500 dark:group-hover:text-surface-400`,
  itemLabel: `flex-1`,
  submenuIcon: `ml-auto text-surface-400 dark:text-surface-500
        p-focus:text-surface-500 dark:p-focus:text-surface-400
        group-hover:text-surface-500 dark:group-hover:text-surface-400`,
  separator: `border-t border-surface-200 dark:border-surface-700`,
  submenu: `absolute left-full top-[0px] z-10 min-w-full bg-surface-0 dark:bg-surface-900 
        text-surface-700 dark:text-surface-0 
        border border-surface-200 dark:border-surface-700
        rounded-md shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]
        p-[2px] list-none outline-none flex flex-col gap-[2px]`,
  transition: {
    enterFromClass: "opacity-0 scale-y-75",
    enterActiveClass: "transition duration-120 ease-[cubic-bezier(0,0,0.2,1)]",
    leaveActiveClass: "transition-opacity duration-100 ease-linear",
    leaveToClass: "opacity-0",
  },
});

const el = ref();
defineExpose({
  toggle: (event: Event) => el.value.toggle(event),
  show: (event: Event) => el.value.show(event),
  hide: () => el.value.hide(),
});
</script>

