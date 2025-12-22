import { computed, defineComponent, PropType, ref, nextTick } from "vue";
import SplitButton, {
  type SplitButtonPassThroughOptions,
  type SplitButtonProps,
} from "primevue/splitbutton";

export interface QSplitButtonProps extends SplitButtonProps {}
export const QSplitButton = defineComponent<QSplitButtonProps>({
  name: "QSplitButton",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<HintedString<"small" | "normal" | "large">>,
      default: "normal",
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: "",
    },
    autoZIndex: {
      type: Boolean,
      default: true,
    },
    baseZIndex: {
      type: Number,
      default: 0,
    },
    appendTo: {
      type: String as PropType<HintedString<"body" | "self">> | undefined | HTMLElement,
      default: "body",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    fluid: {
      type: Boolean,
      default: false,
    },
    severity: {
      type: String as PropType<
        HintedString<"secondary" | "info" | "success" | "warn" | "danger" | "contrast" | "help">
      >,
      default: "neutral", //  neutral 默认 primary 主键 error 报错
    },
  },
  setup(props, { slots, attrs }) {
    const theme = {
      root: ({ instance, props }) => [
        "p-splitbutton p-component",
        {
          "p-splitbutton-raised": props.raised,
          "p-splitbutton-rounded": props.rounded,
          "p-splitbutton-fluid": instance.hasFluid,
        },
      ],
      pcButton: "p-splitbutton-button aaaa",
      pcDropdown: "p-splitbutton-dropdown 111",
      button: "p-button p-component p-button-icon-only p-splitbutton-dropdown",
    };

    const splitButtonRef = ref();
    const SPLIT_BUTTON_CLASSES = {
      // 基础类名（公共）
      base: ["p-button", "p-component"],
      // 主按钮专属类名
      button: "p-splitbutton-button",
      // 下拉按钮专属类名
      dropdown: "p-splitbutton-dropdown",
      // 轮廓样式类名
      outlined: "p-button-outlined",
    };

    nextTick(() => {
      // 调试日志：保留原日志，可根据环境控制（如生产环境移除）
      const splitButtonEl = splitButtonRef.value?.$el;
      if (!splitButtonEl) {
        console.warn("SplitButton 元素未找到");
        return;
      }

      // 1. 获取核心 DOM 元素并校验
      const pcButton = splitButtonEl.querySelector('button[data-pc-name="pcbutton"]');
      const pcDropdown = splitButtonEl.querySelector('button[data-pc-name="pcdropdown"]');
      if (!pcButton || !pcDropdown) {
        console.warn("SplitButton 内部按钮元素未找到");
        return;
      }

      // 2. 封装类名添加函数，减少重复代码
      const addClasses = (element, classes) => {
        element.classList.add(...classes);
      };

      // 3. 为按钮添加基础类名和专属类名
      addClasses(pcButton, [...SPLIT_BUTTON_CLASSES.base, SPLIT_BUTTON_CLASSES.button]);
      addClasses(pcDropdown, [...SPLIT_BUTTON_CLASSES.base, SPLIT_BUTTON_CLASSES.dropdown]);

      // 4. 添加主题色类名（severity）
      if (props.severity !== "neutral") {
        const severityClass = `p-button-${props.severity}`;
        pcButton.classList.add(severityClass);
        pcDropdown.classList.add(severityClass);
      }

      // 5. 添加轮廓样式类名
      if (props.outlined) {
        pcButton.classList.add(SPLIT_BUTTON_CLASSES.outlined);
        pcDropdown.classList.add(SPLIT_BUTTON_CLASSES.outlined);
      }

      switch (props.size) {
        case "small":
          pcButton.classList.add("p-button-sm");
          pcDropdown.classList.add("p-button-sm");
          break;
        case "large":
          pcButton.classList.add("p-button-lg");
          pcDropdown.classList.add("p-button-lg");
          break;
      }
    });

    return () => {
      return (
        <SplitButton
          ref={splitButtonRef}
          unstyled
          pt={theme}
          {...props}
          {...attrs}
          v-slots={slots}
        ></SplitButton>
      );
    };
  },
});
