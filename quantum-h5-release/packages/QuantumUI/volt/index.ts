import PrimeVue from "primevue/config";
import MenuOverride from "./MenuOverride";

export const UseVolt = {
  install: (app): void => {
    app.use(PrimeVue, {
      unstyled: true,
      pt: {
        directives: {
          tooltip: {
            root: "p-tooltip",
            arrow: "p-tooltip-arrow",
            text: "p-tooltip-text",
          },
        },
        select: {
          root: ({ instance, props, state }) => [
            "p-select p-component p-inputwrapper",
            {
              "p-disabled": props.disabled,
              "p-invalid": instance.$invalid,
              "p-variant-filled": instance.$variant === "filled",
              "p-focus": state.focused,
              "p-inputwrapper-filled": instance.$filled,
              "p-inputwrapper-focus": state.focused || state.overlayVisible,
              "p-select-open": state.overlayVisible,
              "p-select-fluid": instance.$fluid,
              "p-select-sm p-inputfield-sm": props.size === "small",
              "p-select-lg p-inputfield-lg": props.size === "large",
            },
          ],
          label: ({ instance, props }) => [
            "p-select-label",
            {
              "p-placeholder": !props.editable && instance.label === props.placeholder,
              "p-select-label-empty":
                !props.editable &&
                !instance.$slots["value"] &&
                (instance.label === "p-emptylabel" || instance.label?.length === 0),
            },
          ],
          clearIcon: "p-select-clear-icon",
          dropdown: "p-select-dropdown",
          loadingicon: "p-select-loading-icon",
          dropdownIcon: "p-select-dropdown-icon",
          overlay: "p-select-overlay p-component",
          header: "p-select-header",
          pcFilter: "p-select-filter",
          listContainer: "p-select-list-container",
          list: "p-select-list",
          optionGroup: "p-select-option-group",
          optionGroupLabel: "p-select-option-group-label",
          option: ({ instance, props, state, option, focusedOption }) => [
            "p-select-option p-select-option-onlys",
            {
              "p-select-option-selected": instance.isSelected(option) && props.highlightOnSelect,
              "p-focus": state.focusedOptionIndex === focusedOption,
              "p-disabled": instance.isOptionDisabled(option),
            },
          ],
          optionLabel: "p-select-option-label",
          optionCheckIcon: "p-select-option-check-icon",
          optionBlankIcon: "p-select-option-blank-icon",
          emptyMessage: "p-select-empty-message",
        },
        iftaLabel: {
          root: "p-iftalabel1",
        },
        floatLabel: {
          // root: "p-floatlabel1",
          root: ({ props }) => [
            "p-floatlabel1",
            {
              "p-floatlabel1-over": props.variant === "over",
              "p-floatlabel1-on": props.variant === "on",
              "p-floatlabel1-in": props.variant === "in",
            },
          ],
        },
        menu: {
          root: ({ props }) => [
            "p-menu p-component",
            {
              "p-menu-overlay": props.popup,
            },
          ],
          start: "p-menu-start",
          list: "p-menu-list",
          submenuLabel: "p-menu-submenu-label",
          separator: "p-menu-separator",
          end: "p-menu-end",
          item: ({ instance }) => [
            "p-menu-item",
            {
              "p-focus": instance.id === instance.focusedOptionId,
              "p-disabled": instance.disabled(),
            },
          ],
          itemContent: "p-menu-item-content",
          itemLink: "p-menu-item-link",
          itemIcon: "p-menu-item-icon",
          itemLabel: "p-menu-item-label",
        },
        tieredmenu: {
          root: ({ props, instance }) => [
            "p-tieredmenu p-component",
            {
              "p-tieredmenu-overlay": props.popup,
              "p-tieredmenu-mobile": instance.queryMatches,
            },
          ],
          start: "p-tieredmenu-start",
          rootList: "p-tieredmenu-root-list",
          item: ({ instance, processedItem }) =>{
            // console.log(instance,processedItem,115);
            return  [
            "p-tieredmenu-item",
            {
              "p-tieredmenu-item-active": instance.isItemActive(processedItem),
              // "p-focus": instance.isItemFocused(processedItem),
              "p-disabled": instance.isItemDisabled(processedItem),
            },
          ]
          },
          itemContent: "p-tieredmenu-item-content",
          itemLink: "p-tieredmenu-item-link",
          itemIcon: "p-tieredmenu-item-icon",
          itemLabel: "p-tieredmenu-item-label",
          submenuIcon: "p-tieredmenu-submenu-icon",
          submenu: "p-tieredmenu-submenu",
          separator: "p-tieredmenu-separator",
          end: "p-tieredmenu-end",
        },
        // splitButton: {
        //   root: ({ instance, props }) => [
        //     "p-splitbutton p-component",
        //     {
        //       "p-splitbutton-raised": props.raised,
        //       "p-splitbutton-rounded": props.rounded,
        //       "p-splitbutton-fluid": instance.hasFluid,
        //     },
        //   ],
        //   pcButton: "p-splitbutton-button",
        //   pcDropdown: "p-splitbutton-dropdown",
        // },
        // button: {
        //   root: ({ instance, props }) => [
        //     "p-button p-component",
        //     {
        //       "p-button-icon-only": instance.hasIcon && !props.label && !props.badge,
        //       "p-button-vertical":
        //         (props.iconPos === "top" || props.iconPos === "bottom") && props.label,
        //       "p-button-loading": props.loading,
        //       "p-button-link": props.link || props.variant === "link",
        //       [`p-button-${props.severity}`]: props.severity,
        //       "p-button-raised": props.raised,
        //       "p-button-rounded": props.rounded,
        //       "p-button-text": props.text || props.variant === "text",
        //       "p-button-outlined": props.outlined || props.variant === "outlined",
        //       "p-button-sm": props.size === "small",
        //       "p-button-lg": props.size === "large",
        //       "p-button-plain": props.plain,
        //       "p-button-fluid": instance.hasFluid,
        //     },
        //   ],
        //   loadingIcon: "p-button-loading-icon",
        //   icon: ({ props }) => [
        //     "p-button-icon",
        //     {
        //       [`p-button-icon-${props.iconPos}`]: props.label,
        //     },
        //   ],
        //   label: "p-button-label",
        // },
      },
    });
    MenuOverride();
  },
};
