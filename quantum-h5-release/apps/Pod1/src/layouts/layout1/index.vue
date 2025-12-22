<script lang="tsx">
import { isWebView } from "@/utils";
import { defineComponent, VNode, computed } from "vue";
import { RouterView, useRouter, useRoute } from "vue-router";
import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from "vue-router";
import { Header } from "./header";
import LayoutMenu, {
  router2Menu,
  buildLayoutMenus,
  LayoutMenuItem,
  LayoutGroup,
} from "../LayoutMenu";
import { IconQuantumLogo } from "@quantum/icons";
import { GlobalStore, toggleSidebar } from "@/store/global";
import { LScroll } from "@libs/p-comps/scroll";
import { ChatStore } from "@/store/chat";
import GLoading from "./Loading/index.vue";
import { IconLayerClose, IconLayerOpen,IconChatList } from "@quantum/icons";
import { AiButton } from "@libs/p-comps/volt/QButton";
export const LayoutName = "quantum";

export default defineComponent({
  name: LayoutName,
  setup() {
    const router = useRouter();
    const route = useRoute();

    // 从路由中获取菜单数据
    let menuRoutes: RouteRecordRaw[] = [];

    // 查找Layout1路由并提取其children作为菜单数据
    const layoutRoute = router.getRoutes().find((route) => route.name === LayoutName);
    if (layoutRoute && layoutRoute.children) {
      menuRoutes = layoutRoute.children;
    }

    const BaseRouteModel = buildLayoutMenus({
      datas: [
        {
          routeName: "FullViewChat",
        },
        {
          group: "Discover",
        },
      ],
      routes: menuRoutes,
    });
    console.log('BaseRouteModel---------', BaseRouteModel);
    const chatRouteModel = computed(() => {
      return {
        label: "Chats",

        items: ChatStore.history.map((chat) => {
          return {
            title: chat.title,
            icon: IconChatList,
            key: chat.chatId,
            route: {
              name: "FullViewChat",
              meta: { params: { chatId: chat.chatId } },
            },
          };
        }),
      };
    });
    const checkRenderComponent = (route: RouteLocationNormalizedLoaded, Component: VNode) => {
      const lastMatchedRoute = route.matched[route.matched.length - 1];
      if (lastMatchedRoute && Component?.type) {
        const componentName =
          typeof Component.type === "string" ? Component.type : (Component.type as any).name;
        return (lastMatchedRoute.meta.componentName || lastMatchedRoute.name) === componentName;
      }
      return false;
    };
    // Animation placeholder
    const Transition1 = (_: any, { slots }: any) => slots.default?.();
    // const Transition1 = Transition

    const renderComponet = () => {
      return (
        <RouterView>
          {{
            default: ({ Component }: any) => {
              if (route.meta?.layout || checkRenderComponent(route, Component)) {
                return <Component key={route.fullPath} />;
              } else {
                return <RouterView key={route.fullPath} />;
              }
            },
          }}
        </RouterView>
      );
    };

    return () => {
      console.log(chatRouteModel.value,93)
      return (
        <div
          class={[
            "w-full h-full",
            {
              "p-[10px]": !isWebView,
            },
          ]}
        >
          <div
            class={[
              "flex h-[100vh] w-full relative acrylic-view acrylic-view-none rounded-[32px]",
              {
                "bg-gray-100 h-[calc(100vh-20px)] rounded-[32px] shadow-[0_0_10px_0_rgba(0,0,0,0.4)]":
                  !isWebView,
              },
            ]}
          >
            <div
              class={[
                "flex-none bg-[var(--color-surfaces-surface-blur)] flex flex-col overflow-auto rounded-l-[32px] pb-[4px] transition-width duration-300",
                GlobalStore.sidebar ? "w-[260px]" : "w-[88px]",
              ]}
            >
              <div class="flex flex-auto flex-col overflow-auto">
                <div class="px-[29px] py-[26px] border-gray-200 flex-none flex items-center">
                  <IconQuantumLogo class="text-[32px] flex-none" onClick={toggleSidebar} />
                  {GlobalStore.sidebar ? (
                    <span class="text-[20px] font-semibold bg-gradient-to-r from-[#855EE1] to-[#5C8DFF] bg-clip-text text-transparent ml-[8px]">
                      Qira
                    </span>
                  ) : null}
                </div>
                <LayoutMenu items={BaseRouteModel} />
                <LayoutMenuItem
                  item={router2Menu(menuRoutes.find((route) => route.name === "Settings"))}
                />

                <div class="flex items-center h-[48px] px-[24px] flex-none">
                  {GlobalStore.sidebar ? (
                    <span class="text-[var(--color-text-on-surface-variant)] text-[12px]">
                      {chatRouteModel.value.label}
                    </span>
                  ) : null}
                  <div class="flex-auto h-[1px] bg-[var(--color-outlines-outline-variant)]"></div>
                </div>
                <LScroll class="flex flex-auto flex-col overflow-auto">
                  {chatRouteModel.value.items.map((item) => (
                    <LayoutMenuItem item={item} key={item.title} />
                  ))}
                </LScroll>
              </div>
              {/* <LayoutMenuItem
                class="border-t border-t-[var(--color-outlines-outline-variant)]"
                item={router2Menu(menuRoutes.find((route) => route.name === "Settings"))}
              /> */}
              <div class="border-t border-t-[var(--color-outlines-outline-variant)] h-[40px] py-[6px] flex justify-end items-center pr-[24px]">
                <AiButton category="actions" size="small" onClick={toggleSidebar}>
                  { GlobalStore.sidebar ? <IconLayerClose /> : <IconLayerOpen /> }
                </AiButton>
              </div>
            </div>
            <div
              class={
                [
                  "flex-auto flex flex-col h-full bg-[var(--color-window-bg)] rounded-tr-[32px] rounded-br-[32px]",
                  GlobalStore.sidebar ? "w-[calc(100%-260px)]" : "w-[calc(100%-88px)]",
                ]
              }
            >
              <Header class="flex-none" />
              <div class="flex-auto h-[1px] overflow-auto quantum-wrapper relative">
                {renderComponet()}
                <GLoading />
              </div>
            </div>
          </div>
        </div>
      );
    };
  },
});
</script>

<style scoped lang="less"></style>
