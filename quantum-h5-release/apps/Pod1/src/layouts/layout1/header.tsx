import { computed, defineComponent, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { switchTheme } from "@libs/theme";
import { resetWindow, startDragWindow } from "@/store/window";
import { ButtonCloseQuantumApp, ButtonFull, ButtonMini } from "../actions";
import { IconGoBack } from "@quantum/icons";
import { ChatStore } from "@/store/chat";
import { useLocale } from "@/hooks/i18n";
import HeaderRecording from "../layout1/Recording";

export const Header = defineComponent({
  name: "Header",
  setup() {
    const { t } = useLocale();
    const route = useRoute();
    const router = useRouter();
    const changeTheme = () => {
      switchTheme();
    };
    const showTitle = ref("");

    // 返回上一页
    const goBack = () => {
      router.back();
    };

    // 判断是否显示返回按钮
    const showBackButton = computed(() => {
      // 只有在 /learning-zone 的二层页面才显示返回按钮
      const isLearningZoneSubPage =
        route.path.startsWith("/quantum/learning-zone/") && route.path !== "/quantum/learning-zone";
      return isLearningZoneSubPage;
    });

    const refreshChatTile = computed(() => {
      if (route.name === "FullViewChat" && route.params.chatId) {
        const { title } = ChatStore.history.find(item => item.chatId === route.params.chatId) || { title: '' }
        return title
      } else {
        return ''
      }
    })

    watch(
      () => [route, refreshChatTile.value],
      async () => {
        console.log(route)
        if (route.name === "FullViewChat" && route.params.chatId) {
          showTitle.value = refreshChatTile.value;

        } else if (route.fullPath.includes('settings') || route.path.includes("creator-zone") || route.path.includes("memories")) {
          showTitle.value = "";
        } else {
          // 其他页面使用路由元信息中的标题
          showTitle.value = (route.meta?.title as string) || "Quantum";
        }
      },
      {
        deep: true,
        immediate: true,
      }
    );

    return () => (
      <div
        id="global-bar-9e31c7fa"
        class="flex justify-between items-center py-[20px] text-[var(--color-text-on-surface)]"
        onDblclick={resetWindow}
        onMousedown={startDragWindow}
      >
        {/* <div class="flex-auto px-[16px] text-[22px] font-medium" onClick={changeTheme}>
          {showTitle.value}
        </div> */}
        <div class="flex-auto w-1 flex items-center px-[16px] text-[22px] font-medium">
          {/* 返回按钮 */}
          {showBackButton.value && (
            <div onClick={goBack} style="margin-right:10px;cursor: pointer;">
              <IconGoBack />
            </div>
          )}
          {/* 标题 - 点击切换主题 */}
          <div class="truncate" onClick={changeTheme} title={t(showTitle.value) !== 'Learning Zone' ? t(showTitle.value) : ''}>
            {t(showTitle.value) !== 'Learning Zone' ? t(showTitle.value) : ''}
          </div>
        </div>
        <div class="flex-none flex items-center pr-[24px] gap-[8px]">
          <HeaderRecording />
          <ButtonMini />
          <ButtonFull />
          <ButtonCloseQuantumApp />
        </div>
      </div>
    );
  },
});
