import { PopupChannel, popupMenuCommand, PopupMenus } from "@/store/popup";
import { computed, defineComponent, reactive } from "vue";
import QMenu from "@libs/p-comps/volt/QMenu/index.vue";
import { useI18n } from "vue-i18n";


export default defineComponent({
  name: "Popup",
  setup() {
    PopupChannel.onPing();
    const state = reactive({
      menus: [],
    });
    const { t } = useI18n()
    PopupChannel.on("menus", (menus) => {
      state.menus = menus.map((item: any) => {
        return {
          ...item,
          label: t(item.label),
          icon: PopupMenus[item.key as keyof typeof PopupMenus].icon,
          command: () => {
            PopupChannel.emit2<popupMenuCommand>("command", {
              key: item.key,
              winId: item.winId,
            })
          }
        }
      });
    });
    const showMenus = computed(() => {
      return state.menus.map(item=>{
        return {
          ...item,
          label: t(item.label),
        }

      })
    });
    return () => {
      return (
        <div class="bg-surface rounded-[16px]">
          <QMenu class="!bg-transparent !bg-none !shadow-none" model={showMenus.value}/>
        </div>
      );
    };
  },
});
