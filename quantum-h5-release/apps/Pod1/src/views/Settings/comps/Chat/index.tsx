import { computed, defineComponent, PropType, ref, toRaw, toValue, unref } from "vue";
import Checkbox from "@libs/p-comps/volt/Checkbox.vue";
import { ChatStore, deleteChatDatas, getChatHistory } from "@/store/chat";
import { useLocale } from "@/hooks/i18n";
import { useI18n } from "vue-i18n";
import { QButton } from "@libs/p-comps/volt/QButton";
import ConfirmDialog from "@libs/p-comps/volt/ConfirmDialog.vue";
import { useConfirm } from "primevue";

interface ChatInfoItem {
  chatId: string;
  title: string;
  sessionName: string;
  lastModifiedTimestamp: number;
}

export const ChatCardLi = defineComponent({
  name: 'ChatCardLi',
  props: {
    item: {
      type: Object as PropType<ChatInfoItem>,
      required: true
    },
    modelValue: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    checkboxName: {
      type: String,
    },
  },
  setup(props) {
    const isChecked = computed(() => {
      return toValue(props.modelValue)?.includes(props.item.chatId)
    })
    return () => {
      return <div class={['flex items-center w-[434px] bg-surface-container border rounded-8 px-[24px] py-[20px]', isChecked.value ? 'border-[#0E77DA]' : 'border-surface-container']}>
        <div class="mr-[16px]"><Checkbox v-model={props.modelValue} name={props.checkboxName} value={props.item.chatId} v-automation='chat_checkbox'/></div>
        <div class="flex flex-col flex-auto">
          <div class="text-title-xs leading-[22px]">{props.item.sessionName || 'Untitled'}</div>
          <div class="flex justify-between mt-[8px]">
            <div class="flex items-center text-[#0e77da]">
              <div></div>
              <div>{new Date(props.item.lastModifiedTimestamp).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    }
  }
})

export const ChatCardUl = defineComponent({
  name: 'ChatCardUl',
  props: {
    items: {
      type: Array as PropType<ChatInfoItem[]>,
      required: true
    },
    modelValue: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    checkboxName: {
      type: String,
      default: 'ChatCardUl'
    },
  },
  setup(props) {
    return () => {
      return <div class="flex flex-wrap gap-x-[18px] gap-y-[12px]">
        {props.items.map(item => {
          return <ChatCardLi item={item} v-model={props.modelValue} checkboxName={props.checkboxName} />
        })}
      </div>
    }
  }
})


export const ChatHistoryAll = defineComponent({
  name: 'ChatHistoryAll',
  setup() {
    const { t } = useI18n()
    const SelectChatId = ref([])
    const loading = ref(false)
    const confirm = useConfirm();
    const onDelete = async () => {
      confirm.require({
        message: t('common.deleteItemWarningNum', { len: SelectChatId.value.length }),
        header: t('common.warning'),
        rejectProps: {
          severity: "secondary",
          outlined: false,
          label: t('common.cancel'),
        },
        acceptProps: {
          unstyled: true,
          severity: "danger",
          label: t('common.delete'),
        },
        accept: async () => {
          loading.value = true
          await deleteChatDatas([...SelectChatId.value])
          await getChatHistory()
          onClear()
          loading.value = false
        },
      });
    }
    const onClear = () => {
      SelectChatId.value = []
    }
    return () => {
      return <div class="flex flex-col">
        <div class="flex items-center justify-between mb-[12px]">
          <div class="text-body-m">{t('settings.dataControl.CompleteChatHistory', { len: ChatStore.history.length })}</div>
          <div class="flex gap-[12px]">
            {SelectChatId.value?.length ? <QButton class="underline" size="small" variant="text" onClick={onClear} v-automation="clear_selections">{t('common.clearSelections')}</QButton> : null}
            <QButton size="small" onClick={onDelete} loading={loading.value} disabled={!SelectChatId.value?.length || loading.value} v-automation='delete_btn'>{t('common.delete')}</QButton>
          </div>
        </div>
        <ChatCardUl items={ChatStore.history} v-model={SelectChatId} checkboxName="ChatHistoryAll" />
        <ConfirmDialog />
      </div>
    }
  }
})
