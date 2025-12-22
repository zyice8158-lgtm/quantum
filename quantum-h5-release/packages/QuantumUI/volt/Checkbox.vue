<template>
  <Checkbox unstyled :pt="ptTheme" :ptOptions="{ mergeProps: ptViewMerge }" v-bind="forwarded">
    <template #icon="{ checked }">
      <span
        :style="getContainerStyle(checked, propsIndeterminate)"
        class="inline-flex items-center justify-center box-border"
      >
        <SvgIcon
          v-if="checked || propsIndeterminate"
          :name="checked ? checkedIconName : indeterminateIconName"
          :size="iconSize"
          :color="SVG_COLOR"
        />
      </span>
    </template>
  </Checkbox>
</template>

<script setup lang="ts">
import Checkbox, { type CheckboxPassThroughOptions, type CheckboxProps } from "primevue/checkbox";
import { computed, useAttrs } from "vue";
import { ptViewMerge } from "./utils";
import { SvgIcon } from "../Icons";

defineOptions({ inheritAttrs: false });

type VoltTheme = "primary" | "danger" | "success";
type Shape = "square" | "circle";

interface Props extends Omit<CheckboxProps, "size"> {
  theme?: VoltTheme; // 主题是啥呢？
  shape?: Shape; // 形状是啥呢？
  boxSize?: number; // 框大小是啥呢？
  iconScale?: number; // 图标大小是啥呢？
  indeterminate?: boolean; // 是否是部分选中是啥呢？
  checkedIconName?: string; // 选中图标是啥呢？
  indeterminateIconName?: string; // 部分选中图标是啥呢？
}

// TODO 回头替换成统一管理的主题色
const THEME_COLOR: Record<VoltTheme, string> = {
  primary: "var(--ai-color)", // 紫
  danger: "var(--color-error)", // 红
  success: "var(--color-success)", // 绿
};
const BORDER_GRAY = "var(--color-overlay-outline)";
const SVG_COLOR = "var(--color-overlay-outline-inverse)";

/**
 * 默认值哈，尽量别改啊
 */
const props = withDefaults(defineProps<Props>(), {
  theme: "primary",
  shape: "square",
  boxSize: 20,
  iconScale: 0,
  indeterminate: false,
  checkedIconName: "ck_shape",
  indeterminateIconName: "ck_horizontal",
});

const attrs = useAttrs();
const forwarded = computed(() => ({ ...attrs, ...props }));

const propsIndeterminate = computed<boolean>(() => props.indeterminate ?? false);

const iconSize = computed<number>(() =>
  props.iconScale > 0 ? props.iconScale : Math.round(props.boxSize * 0.7)
);

const radiusCss = computed<string>(() => (props.shape === "circle" ? "50%" : "4px"));

const getContainerStyle = (
  checked: boolean,
  indeterminate: boolean
): Record<string, string> => {
  const themeKey: VoltTheme = props.theme;
  const themeColor = THEME_COLOR[themeKey];
  const isFilled = checked || indeterminate;
  // 红色主题边框红，其它主题边框灰
  const borderColor = themeKey === "danger" ? themeColor : BORDER_GRAY;

  return isFilled
    ? {
        width: `${props.boxSize}px`,
        height: `${props.boxSize}px`,
        backgroundColor: themeColor,
        border: "none",
        borderRadius: radiusCss.value,
      }
    : {
        width: `${props.boxSize}px`,
        height: `${props.boxSize}px`,
        backgroundColor: "transparent",
        border: `2px solid ${borderColor}`,
        borderRadius: radiusCss.value,
      };
};

const ptTheme = computed<CheckboxPassThroughOptions>(() => ({
  root: "relative inline-flex select-none align-bottom",
  input: {
    class: [
      "peer cursor-pointer disabled:cursor-default  appearance-none",
      "absolute inset-0 w-full h-full m-[0px] p-[0px] opacity-0 z-10",
    ].join(" "),
    role: "checkbox",
    "aria-checked": propsIndeterminate.value ? "mixed" : undefined,
  },
  box: "flex items-center justify-center",
  icon: "transition-none",
}));
</script>

