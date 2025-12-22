import { computed, defineComponent, PropType, ref, watch, toRef } from "vue";
import Button, { type ButtonPassThroughOptions, type ButtonProps } from "primevue/button";
import Btn from "../Button.vue";
import { ptViewMerge } from "../utils";
import "./style.less";
import { IconLoading } from "@quantum/icons";
// import { useRouter } from "vue-router";

// console.log("Button", Button);

const QButtonSize:Record<string,string> = {
  small: "px-[16px] py-[8px] label-s",
  normal: "px-[20px] py-[8px] label-m",
  large: "px-[24px] py-[12px] label-l",
  icon_small:"px-[5px] py-[5px] label-s",
  icon_normal: "px-[8px] py-[8px] label-m",
  icon_large: "px-[12px] py-[12px] label-l"
};

const QButtonIconPos = {
  left: "flex-row gap-[8px]",
  right: "flex-row-reverse gap-[8px]",
  top: "column gap-[8px]",
  bottom: "column-reverse gap-[8px]",
};
// const QButtonColor = {
//   neutral:'--qbtn-border-color: var(--color-primary);--qbtn-text-color: #fff;',
//   primary:'--qbtn-border-color: var(--primary-500);--qbtn-text-color: #fff;',
//   error:'--qbtn-border-color: red;--qbtn-text-color: #fff;',
//   secondary:'--qbtn-border-color: var(--secondary-500);--qbtn-text-color: #fff;'
// }

export interface QButtonProps extends ButtonProps {
  rounded?: boolean;
  size?: string & keyof typeof QButtonSize;
  color?: string;
  iconPos?: keyof typeof QButtonIconPos;
  split?: boolean;
  iconOnly?: boolean;
  // type?: keyof typeof QButtonType;
}

export const QButton = defineComponent<QButtonProps>({
  name: "QButton",
  inheritAttrs: false,
  props: {
    size: {
      type: String,
      default: "normal",
    },
    rounded: {
      type: Boolean,
      default: true,
    },
    variant: {
      type: String as PropType<HintedString<"outlined" | "text" | "link" | "neutral">>,
      default: "neutral",
    },
    iconPos: {
      type: String as PropType<HintedString<"left" | "right">>,
      default: "left",
    },
    color: {
      type: String as PropType<
        HintedString<"neutral" | "primary" | "error" | "chat" | "secondary" | "gray">
      >,
      default: "neutral", //  neutral 默认 primary 主键 error 报错
    },
    split: {
      type: Boolean,
      default: false,
    },
    iconOnly: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots, attrs }) {
    const theme = {
      root: `qbtn ${"qbtn_" + props.color + "_" + props.variant} ${
        props.split ? "qbtn_split" : ""
      } inline-flex cursor-pointer select-none items-center justify-center overflow-hidden relative
            p-rounded:rounded-full rounded-lg
            p-outlined:bg-transparent p-outlined:border
            bg-focus text-on-focus
            p-text:bg-transparent p-text:text-focus
            disabled:bg-state-focus-focus-hover! disabled:text-focus-focus! disabled:cursor-not-allowed!

      `,
      loadingIcon: `animate-spin mr-[4px]`,
      icon: `p-right:order-1 p-bottom:order-2 text-[18px]`,
      label: `p-icon-only:invisible p-icon-only:w-0`,
      pcBadge: {
        root: `min-w-4 h-4 leading-4 bg-primary-contrast rounded-full text-primary text-xs font-bold`,
      },
    };
    const ptOptions = {
      mergeProps: ptViewMerge,
    };
    const vSlots = {
      loadingicon(bind: any) {
        return <IconLoading {...bind} />;
      },
      ...slots,
    };
    const sizeKey = props.iconOnly ? `icon_${props.size}` : props.size;

    if (slots.icon) {
      if (props.iconPos === "left") {
        QButtonSize.normal = "pl-[12px] pr-[20px] py-[8px] label-m";
      } else if (props.iconPos === "right") {
        QButtonSize.normal = "pl-[20px] pr-[12px] py-[8px] label-m";
      }
    } else {
      QButtonSize.normal = "px-[20px] py-[8px] label-m";
    }

    // const sizeKey = computed(() => {
    //   if (props.iconOnly) {
    //     return `icon_${props.size}`;
    //   }
    //   return props.size;
    // });
    // return QButtonSize
    // });

    const styleCssObject = {
      // 边框
      "--qbtn-border-color": "",
      // 背景
      "--qbtn-background-color": "",
      // 文字
      "--qbtn-color": "",
      // 悬停边框
      "--qbtn-hover-border-color": "",
      // 悬停背景
      "--qbtn-hover-background-color": "",
      // 悬停文字
      "--qbtn-hover-color": "",
      // 激活边框
      "--qbtn-active-border-color": "",
      // 激活背景
      "--qbtn-active-background-color": "",
      // 激活文字
      "--qbtn-active-color": "",
      // 禁用边框
      "--qbtn-disabled-border-color": "",
      // 禁用背景
      "--qbtn-disabled-background-color": "",
      // 禁用文字
      "--qbtn-disabled-color": "",
    };
    const styleCssVar = computed(() => {
      const cssVar = {};
      if (props.variant === "outlined") {
        Object.assign(cssVar, {
          "--qbtn-border-color": "var(--color-focus)",
          "--qbtn-background-color": "transparent",
          "--qbtn-color": "var(--color-focus)",
          "--qbtn-hover-border-color": "var(--color-focus)",
          "--qbtn-hover-background-color": "transparent",
          "--qbtn-hover-color": "var(--color-focus)",
          "--qbtn-active-border-color": "var(--color-focus)",
          "--qbtn-active-background-color": "transparent",
          "--qbtn-active-color": "var(--color-focus)",
          "--qbtn-disabled-border-color": "var(--color-focus)",
          "--qbtn-disabled-background-color": "transparent",
          "--qbtn-disabled-color": "var(--color-focus)",
        });
      } else if (props.variant === "text") {
        Object.assign(cssVar, {
          "--qbtn-border-color": "transparent",
          "--qbtn-background-color": "transparent",
          "--qbtn-color": "var(--color-focus)",
          "--qbtn-hover-border-color": "var(--color-focus)",
          "--qbtn-hover-background-color": "transparent",
          "--qbtn-hover-color": "transparent",
          "--qbtn-active-border-color": "var(--color-focus)",
          "--qbtn-active-background-color": "transparent",
          "--qbtn-active-color": "transparent",
          "--qbtn-disabled-border-color": "var(--color-focus)",
          "--qbtn-disabled-background-color": "transparent",
          "--qbtn-disabled-color": "var(--color-focus)",
        });
      } else if (props.variant === "link") {
        // str += `--qbtn-text-color: var(--primary-500);`
      } else if (props.variant === "") {
        Object.assign(cssVar, {
          "--qbtn-border-color": "var(--color-focus)",
          "--qbtn-background-color": "var(--color-focus)",
          "--qbtn-color": "var(--color-on-focus)",
          "--qbtn-hover-border-color": "var(--color-focus-focus)",
          "--qbtn-hover-background-color": "var(--color-focus-focus)",
          "--qbtn-hover-color": "var(--color-on-focus)",
          "--qbtn-active-border-color": "var(--color-focus)",
          "--qbtn-active-background-color": "var(--color-focus)",
          "--qbtn-active-color": "var(--color-on-focus)",
          "--qbtn-disabled-border-color": "var(--color-focus)",
          "--qbtn-disabled-background-color": "var(--color-focus)",
          "--qbtn-disabled-color": "var(--color-on-focus)",
        });
      }
      /**
       * 需求描述 ： 先根据 color的值 设置按钮颜色
       * 在判断variant 看是边框 还是非边框 以及修改背景颜色
       *
       */
      switch (props.color) {
        case "neutral":
          //默认 填充模式
          styleCssObject["--qbtn-background-color"] = "var(--color-focus-focus)";
          // 边框
          styleCssObject["--qbtn-border-color"] = "var(--color-focus-focus)";
          // 文字
          styleCssObject["--qbtn-color"] = "var(--color-focus-on-focus)";
          if (props.variant === "outlined") {
            // 边框模式 背景透明
            styleCssObject["--qbtn-background-color"] = "var(--_touch-touch-target)";
            // 边框颜色
            styleCssObject["--qbtn-border-color"] = "var(--color-focus-focus)";
            // 文字
            styleCssObject["--qbtn-color"] = "var(--color-focus-focus)";
          }
          if (props.variant === "outlined") {
            // 边框模式 背景透明
            styleCssObject["--qbtn-background-color"] = "var(--_touch-touch-target)";
            // 边框颜色
            styleCssObject["--qbtn-border-color"] = "var(--color-focus-focus)";
            // 文字
            styleCssObject["--qbtn-color"] = "var(--color-focus-focus)";
          }
          break;
        case "primary":
          //默认 填充模式
          styleCssObject["--qbtn-background-color"] = "var(--color-primary-primary)";
          // 边框
          styleCssObject["--qbtn-border-color"] = "var(--color-primary-primary)";
          // 文字
          styleCssObject["--qbtn-color"] = "var(--color-focus-on-focus)";
          if (props.variant === "outlined") {
            // 边框模式 背景透明
            styleCssObject["--qbtn-background-color"] = "var(--_touch-touch-target)";
            // 边框颜色
            styleCssObject["--qbtn-border-color"] = "var(--color-primary-primary)";
            // 文字
            styleCssObject["--qbtn-color"] = "var(--color-primary-primary)";
          }
          break;
        case "error":
          //默认 填充模式
          styleCssObject["--qbtn-background-color"] = "var(--color-semantic-error-error)";
          // 边框
          styleCssObject["--qbtn-border-color"] = "var(--color-semantic-error-error)";
          // 文字
          styleCssObject["--qbtn-color"] = "var(--color-focus-on-focus)";
          if (props.variant === "outlined") {
            // 边框模式 背景透明
            styleCssObject["--qbtn-background-color"] = "var(--_touch-touch-target)";
            // 边框颜色
            styleCssObject["--qbtn-border-color"] = "var(--color-semantic-error-error)";
            // 文字
            styleCssObject["--qbtn-color"] = "var(--color-semantic-error-error)";
          }
          break;
        case "chat":
          styleCssObject["--qbtn-color"] = "var(--color-focus-on-focus)";
          break;
        case "secondary":
          styleCssObject["--qbtn-background-color"] = "var(--color-secondary-container)";
          // 边框
          // styleCssObject["--qbtn-border-color"] = "var(--color-secondary-secondary-container)";
          // 文字
          styleCssObject["--qbtn-color"] = "var(--color-on-secondary-container)";
          if (props.variant === "outlined") {
            styleCssObject["--qbtn-background-color"] = "var(--_touch-touch-target)";
            // 边框颜色
            styleCssObject["--qbtn-border-color"] = "var(--color-secondary-container)";
            // 文字
            styleCssObject["--qbtn-color"] = "var(--color-on-secondary-container)";
          }
          break;
        case "gray":
          styleCssObject["--qbtn-background-color"] = "var(--color-focus-container)";
          // 边框
          // styleCssObject["--qbtn-border-color"] = "var(--color-gray-border)";
          // 文字
          styleCssObject["--qbtn-color"] = "var(--color-on-focus-container)";
          if (props.variant === "outlined") {
            // 边框模式 背景透明
            styleCssObject["--qbtn-background-color"] = "var(--_touch-touch-target)";
            // 边框颜色
            styleCssObject["--qbtn-border-color"] = "var(--color-focus-container)";
            // 文字
            styleCssObject["--qbtn-color"] = "var(--color-on-focus-container)";
          }
          break;
      }
      Object.assign(cssVar, styleCssObject);
      return cssVar;
    });
    // const router = useRouter();
    return () => {
      return (
        <Button
          unstyled
          pt={theme}
          ptOptions={ptOptions}
          {...props}
          {...attrs}
          v-slots={vSlots}
          style={styleCssVar.value}
          // onClick={() => {
          //   if (props.variant === "link") {
          //     router.push({
          //       path: attrs.to,
          //     });
          //   }
          // }}
          class={[QButtonSize[sizeKey], QButtonIconPos[props.iconPos]]}
        ></Button>
      );
    };
  },
});

export const QIconButton = defineComponent<QButtonProps>({
  name: "QIconButton",
  setup(props, { slots, attrs }) {
    return () => {
      return <QButton {...props} {...attrs} v-slots={slots} iconOnly={true} />;
    };
  },
});

export interface AiBtnProps extends ButtonProps {
  needExtend?: boolean;
  activeClass?: string;
  isActive?: boolean;
  unstyled?: boolean;
  category?: HintedString<"default" | "primary" | "error">;
  onActiveChange?: (status: boolean) => void;
  ["onUpdate:isActive"]?: (status: boolean) => void;
}

export const AiButton = defineComponent<AiBtnProps>({
  name: "AiButton",
  props: {
    needExtend: {
      type: Boolean,
      default: false,
    },
    activeClass: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    unstyled: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String as PropType<
        HintedString<"default" | "primary" | "error" | "chat" | "none" | "actions">
      >,
      default: "default",
    },
    size: {
      type: String as PropType<HintedString<"small" | "medium" | "large">>,
      default: "large",
    },
  },

  setup(props, { slots, attrs }) {
    const categoryClass = computed(() => {
      let temp;
      if (props.category === "primary") {
        temp = `qiconbtn_primary`; //`!bg-[var(--color-primary-primary)] !text-[var(--color-on-primary)]`;
      } else if (props.category === "error") {
        temp = `!bg-[var(--color-semantic-error-error)] !text-[var(--color-focus-on-focus)]`;
      } else if (props.category === "chat") {
        temp = `qiconbtn_chat`;
      } else if (props.category === "none") {
        temp = ` bg-[transparent]!`;
      } else if (props.category === "actions") {
        temp = `bg-[transparent]! qiconbtn_actions`;
      } else {
        temp = ``;
      }
      return temp;
    });

    const sizeClass = computed(() => {
      let temp;
      if (props.size === "small") {
        temp = `w-[32px] h-[32px] text-[16px]`;
      } else if (props.size === "medium") {
        temp = `w-[40px] h-[40px] text-[24px]`;
      } else {
        temp = `w-[48px] h-[48px] text-[24px]`;
      }
      return temp;
    });

    const theme = {
      root: `qiconbtn qiconbtn_${props.color} flex justify-center items-center inline-flex cursor-pointer select-none overflow-hidden relative
            rounded-full bg-[#fff]
            bg-focus text-on-focus
            p-text:bg-transparent p-text:text-focus
             disabled:cursor-not-allowed!
      `,
      loadingIcon: `animate-spin mr-[4px]`,
      icon: `p-right:order-1 p-bottom:order-2`,
      label: `p-icon-only:invisible p-icon-only:w-0`,
      pcBadge: {
        root: `min-w-4 h-4 leading-4 bg-primary-contrast rounded-full text-primary text-xs font-bold`,
      },
    };
    return () => (
      <Button
        unstyled
        pt={theme}
        ptOptions={{ mergeProps: ptViewMerge }}
        class={[
          sizeClass.value,
          {
            [props.activeClass || "w-none bg-ai-gradient !text-text-w !border-none"]:
              props.isActive,
          },
          categoryClass.value,
        ]}
        {...attrs}
        v-slots={slots}
      ></Button>
    );
  },
});
/**
 * slots.icondisplay: flex;
padding: var(--space-8, 8px) var(--space-20, 20px);
justify-content: center;
align-items: center;
flex: 1 0 0;
align-self: stretch;
 */
