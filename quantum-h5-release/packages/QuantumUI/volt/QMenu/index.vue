<template>
  <Menu ref="el" unstyled :pt="theme" :ptOptions="{
    mergeProps: ptViewMerge,
  }">
    <template #itemicon="{ item }">
      <component class="w-[20px] h-[20px]" :is="item.icon"></component>
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
    <!-- <template #item="{ item }">
      <div :class="['flex items-center gap-[12px]', item.type === 'divider' ? 'Q_menu_divider' : '']">
        <component class="w-[20px] h-[20px]" :is="item.icon"></component>{{ item.label }}
      </div>
    </template> -->
  </Menu>
</template>

<script setup lang="ts">
import Menu, { type MenuPassThroughOptions, type MenuProps } from "primevue/menu";
import { ref, nextTick } from "vue";
import { ptViewMerge } from "../utils";

interface Props extends /* @vue-ignore */ MenuProps { }
defineProps<Props>();
// bg-surfaces-surface-bright
const theme = ref<MenuPassThroughOptions>({
  root: `qmenubackground
        text-text-on-surface
        border border-surface-200
        rounded-[16px] min-w-[104px] p-[4px]
        `,
  list: `m-[0px] p-[2px] list-none outline-none flex flex-col gap-[2px] overflow-auto`,
  item: ` focus-visible:border-none focus-visible:outline-none  `,
  itemContent: `group text-[16px] duration-200 h-[44px] cursor-pointer flex items-center rounded-[12px] justify-start overflow-auto hover:bg-primary-container p-focus:bg-primary-container px-[12px] hover:text-primary-on-primary-container focus:text-primary-on-primary-container p-focus:text-primary-on-primary-container`,
  itemLink: `cursor-pointer flex items-center no-underline overflow-hidden relative text-inherit
        px-[6px] py-[4px] gap-[4px] select-none outline-none`,
  itemIcon: `text-surface-400
        p-focus:text-surface-500
        group-hover:text-surface-500 `,
  itemLabel: ``,
  submenuLabel: `text-[12px] text-text-on-surface-variant`,
  separator: `border-t border-surface-200 `,
  transition: {
    enterFromClass: "opacity-0 scale-y-75",
    enterActiveClass: "transition duration-120 ease-[#0E77DA]",
    leaveActiveClass: "transition-opacity duration-100 ease-linear",
    leaveToClass: "opacity-0",
  },
});

const el = ref();
nextTick(() => {
  // el.value.focus();
  console.log(el.value.container.querySelectorAll(".Q_menu_divider"), 64);
  const dividerDoms = el.value.container.querySelectorAll(".Q_menu_divider");

  dividerDoms.forEach((item: HTMLElement) => {
    item.parentElement.parentElement.classList.add(
      "border-t",
      "border-t-1",
      "border-t-[#ccc]",
      "pt-[2px]"
    );
  });
});
defineExpose({
  toggle: (event) => el.value.toggle(event),
  show: (event) => el.value.show(event),
  hide: () => el.value.hide(),
});
</script>
<style lang="less">
.qmenubackground {
  background: linear-gradient(0deg,
      var(--color-blur-scrim-dynamic-surface-container),
      var(--color-blur-scrim-dynamic-surface-container)),
    linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8));
  box-shadow: 0px 2px 6px 2px #0000001F;
}
</style>
