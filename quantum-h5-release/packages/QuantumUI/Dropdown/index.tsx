import { defineComponent, PropType, ref } from "vue";
import TieredMenu from "../volt/TieredMenu.vue";
import Menu from "../volt/Menu.vue";
import { MenuProps } from "primevue";

let overlayMenuIndex = 0;

const RadiusSize = {
  large: "rounded-[32px]",
  medium: "rounded-[24px]",
  normal: "rounded-[16px]",
  small: "rounded-[8px]",
  mini: "rounded-[4px]",
};

export default defineComponent({
  name: "DropdownMenu",
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      default: () => {
        return "overlay_menu_" + overlayMenuIndex++;
      },
    },
    items: {
      type: Array as PropType<MenuProps["model"]>,
      default: (): any[] => [],
    },
    trigger: {
      type: Array as PropType<Array<"click" | "hover">>,
      default: ["click"],
    },
    radiusSize: {
      type: String as PropType<keyof typeof RadiusSize>,
      default: "normal",
    },
    isTiered: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots, emit }) {
    const popupRef = ref();

    const toggle = (e: Event) => {
      popupRef.value.toggle(e);
    };

    const handleShow = (e: Event) => {
      emit("show", e);
    };

    const handleHide = (e: Event) => {
      emit("hide", e);
    };
    const triggerFns: Record<string, (e: Event) => void> = {};
    const triggerMenuFns: Record<string, (e: Event) => void> = {};
    props.trigger.map((trigger) => {
      if (trigger === "click") {
        triggerFns["onClick"] = toggle;
      }
      if (trigger === "hover") {
        let timer: number = null;
        triggerFns["onMouseenter"] = (e) => {
          if (timer) {
            clearTimeout(timer);
          } else {
            popupRef.value.show(e);
          }
        };
        triggerFns["onMouseleave"] = () => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            popupRef.value.hide();
            timer = null;
          }, 300);
        };
        triggerMenuFns["onMouseenter"] = () => {
          clearTimeout(timer);
        };
        triggerMenuFns["onMouseleave"] = () => {
          timer = setTimeout(() => {
            popupRef.value.hide();
            timer = null;
          }, 300);
        };
      }
    });
    const Controls: any = () => {
      const Com = slots.default?.() || null;
      if (!Com) return null;

      return Com.map((vnode) => {
        const originalProps = vnode.props || {};
        return {
          ...vnode,
          props: {
            ...originalProps,
            ...attrs,
            ...triggerFns,
            "aria-haspopup": "true",
            "aria-controls": props.name,
          },
        };
      });
    };
    const ptClasses = {
      "pt:root": `px-[2px] py-[4px] mt-[8px] text-[12px] ${RadiusSize[props.radiusSize]}`,
    };
    return () => (
      <>
        <Controls />
        {props.isTiered ? (
          <TieredMenu
            {...ptClasses}
            ref={popupRef}
            model={props.items}
            popup={true}
            {...triggerMenuFns}
            onShow={handleShow}
            onHide={handleHide}
          />
        ) : (
          <Menu
            {...ptClasses}
            ref={popupRef}
            id={props.name}
            model={props.items}
            popup={true}
            {...triggerMenuFns}
          />
        )}
      </>
    );
  },
});
