<template>
  <ToggleSwitch
    unstyled
    :pt="theme"
    :ptOptions="{
      mergeProps: ptViewMerge,
    }"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </ToggleSwitch>
</template>

<script setup lang="ts">
import ToggleSwitch, {
  type ToggleSwitchPassThroughOptions,
  type ToggleSwitchProps,
} from "primevue/toggleswitch";
import { ref } from "vue";
import { ptViewMerge } from "./utils";

interface Props extends /* @vue-ignore */ ToggleSwitchProps {}
defineProps<Props>();

const theme = ref<ToggleSwitchPassThroughOptions>({
  root: `inline-block w-[40px] h-[20px]`,
  input: `peer cursor-pointer disabled:cursor-default appearance-none absolute top-[0px] start-0 w-full h-full m-[0px] p-[0px] opacity-0 z-10 rounded-[30px]`,
  slider: `inline-block w-full h-full rounded-[30px]
        bg-surface-container-highest dark:bg-surface-700
        border-2 border-overlay-outline
        transition-[all] duration-200
        peer-enabled:peer-hover:bg-linear-to-r peer-enabled:peer-hover:from-overlay-outline-hover peer-enabled:peer-hover:to-overlay-outline-hover dark:peer-enabled:peer-hover:bg-surface-600
        p-checked:border-0
        p-checked:bg-primary peer-enabled:peer-hover:p-checked:bg-primary
        p-invalid:border-red-400 dark:p-invalid:border-red-300
        p-disabled:bg-overlay-outline-hover
        peer-disabled:p-checked:bg-overlay-outline p-disabled:opacity-[0.38] dark:p-disabled:bg-surface-600
        peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary`,
  handle: `absolute top-[5px] flex justify-center items-center
        bg-overlay-outline dark:bg-surface-400
        text-surface-500 dark:text-surface-900
        w-[10px] h-[10px] start-[5px] rounded-full
        opacity-[1] 
        transition-[background,color,left] duration-200
        p-checked:w-[14px] p-checked:h-[14px] p-checked:top-[3px] p-checked:start-[5px] p-checked:bg-surface dark:p-checked:bg-primary p-checked:text-primary p-checked:start-[23px]
        peer-disabled:bg-overlay-outline peer-disabled:peer-checked:bg-surface  peer-disabled:opacity-[0.38] peer-disabled:peer-checked:opacity-[1]! dark:p-disabled:bg-surface-900
}`,
});
</script>

