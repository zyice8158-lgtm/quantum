import { GlobalStore } from "@/store/global";
import { computed, defineComponent, FunctionalComponent, PropType } from "vue";
import { RouteRecordRaw, useRoute, useRouter } from "vue-router";

export interface MenuItem {
  icon?: FunctionalComponent;
  iconClass?: string;
  title?: string;
  key?: string;
  children?: MenuItem[];
  route?: RouteRecordRaw;
}

export const LayoutMenuItem = defineComponent({
  name: "LayoutMenuItem",
  props: {
    item: {
      type: Object as PropType<MenuItem>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const IconComponent = props.item.icon as FunctionalComponent;
    console.log(props.item.route, 24);
    const router = useRouter();
    const goRoute = () => {
      emit("click", props.item);
      if (props.item) {
        router.push({ name: props.item.route.name, params: props.item.route?.meta?.params as any });
      }
    };
    const route = useRoute();

    const isActive = computed(() => {
      return route.matched.find(({ name }) => {
        // console.log("ssss", props.item.route, route);
        let isActive = props.item.route?.name === name;
        if (isActive) {
          if (props.item.route?.meta?.params) {
            const params = props.item.route.meta.params as any;
            for (const key in params) {
              if (params[key] != route.params[key]) {
                return false;
              }
            }
          }
        }
        return isActive;
      });
    });
    return () => {
      return (
        <button
          class={[
            "layout-menu-btn flex flex-none items-center h-[44px] w-full cursor-pointer",
            "pl-[32px] pr-[20px]",
            "hover:bg-[var(--color-state-primary-primary-hover)]",
            "text-[var(--color-text-on-surface)]",
            "outline-[var(--color-primary-primary)]",
            "hover:text-[var(--color-primary-primary)]",
            {
              "hover:border-r-[8px] border-r-[var(--color-primary-primary)]": GlobalStore.sidebar,
              "layout-menu-btn-active  bg-[var(--color-state-primary-primary-hover)] ":
                isActive.value,
              "border-r-[8px]  text-[var(--color-primary-primary)]":
                GlobalStore.sidebar && isActive.value,
            },
          ]}
          onClick={goRoute}
          v-automation={props.item.title}
        >
          {IconComponent ? (
            props.item.route!==undefined && props.item.route.name === "FullViewChat" ? (
              GlobalStore.sidebar ? null : (
                <div
                  class={[
                    "text-[24px] w-[24px] h-[24px] mr-[24px]",
                    props.item?.iconClass as string,
                  ]}
                  title={GlobalStore.sidebar ? "" : props.item.title}
                >
                  <IconComponent />
                </div>
              )
            ) : (
              <div
                class={["text-[24px] w-[24px] h-[24px] mr-[24px]", props.item?.iconClass as string]}
                title={GlobalStore.sidebar ? "" : props.item.title}
              >
                <IconComponent />
              </div>
            )
          ) : null}
          {GlobalStore.sidebar ? (
            <span
              class={[
                "text-[14px]",
                "truncate",
                { "text-[var(--color-primary-primary)]": GlobalStore.sidebar && isActive.value },
              ]}
              title={props.item.title}
            >
              {props.item.title}
            </span>
          ) : null}
        </button>
      );
    };
  },
});

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}
export const LayoutGroup = defineComponent({
  name: "LayoutGroup",
  props: {
    item: {
      type: Object as PropType<MenuGroup>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      return (
        <>
          <div class="flex items-center h-[48px] px-[24px] text-[var(--color-text-on-surface-variant)]">
            {GlobalStore.sidebar ? (
              <span class="text-[var(--color-text-on-surface-variant)] text-[12px]">
                {props.item.label}
              </span>
            ) : null}
            <div class="flex-auto h-[1px] bg-[var(--color-outlines-outline-variant)]"></div>
          </div>
          {props.item.items.map((item) => (
            <LayoutMenuItem item={item} key={item.title} />
          ))}
        </>
      );
    };
  },
});

export const router2Menu = (route: RouteRecordRaw): MenuItem => {
  return {
    ...route.meta,
    route,
    children: route.meta.children && route.children?.map(router2Menu),
  };
};

export const buildLayoutMenus = ({
  datas,
  routes,
}: {
  datas?: {
    group?: string;
    routeName?: string;
  }[];
  routes: RouteRecordRaw[];
}): (MenuItem | MenuGroup)[] => {
  const list = [];
  if (datas?.length) {
    for (const { group, routeName } of datas) {
      if (group) {
        list.push({
          label: group,
          items: routes
            .filter((route) => route.meta?.group === group)
            .map((item) => {
              return router2Menu(item);
            }),
        });
      } else if (routeName) {
        list.push(router2Menu(routes.find((item) => item.name === routeName)!));
      }
    }
  } else {
    list.push(...routes.map(router2Menu));
  }

  return list;
};

export default defineComponent({
  name: "LayoutMenu",
  props: {
    items: {
      type: Array as PropType<(MenuItem | MenuGroup)[]>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      return (
        <div class="flex flex-col">
          {props.items.map((item) => {
            if ("items" in item) {
              return <LayoutGroup item={item} key={item.label} />;
            } else {
              return <LayoutMenuItem item={item} key={item.key || item.title} />;
            }
          })}
        </div>
      );
    };
  },
});
