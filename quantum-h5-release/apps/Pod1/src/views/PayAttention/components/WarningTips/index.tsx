import { defineComponent } from "vue";
import { IconWarning, IconClose } from "@quantum/icons";
import { QButton } from "@libs/p-comps/volt/QButton";
import { useLocale } from "@/hooks/i18n";
import { payAttentionStore, setPayAttentionStore, startRecording } from  "@/store/payAttention";
export default defineComponent({
  name: "WarningTips",
  emits: ["cancel", "new-recording", "close"],
  setup(props, { emit }) {
    const { t } = useLocale();

    const handleNewRecording = () => {
      startRecording()
    };

    const handleClose = () => {
      setPayAttentionStore("showSummarizingTip", false)
    };

    return () => {
      if(!payAttentionStore.showSummarizingTip) {
        return null;
      }
      return (
        <div class="mt-[2px] mb-[8px] h-[64px] rounded-16 flex items-center justify-start  pr-[12px] pl-[8px] py-[16px] bg-warning-container">
          <div class="w-[32px] h-[32px] flex items-center justify-center rounded-full bg-surface mr-[12px]">
              <IconWarning class="w-[16px] h-[16px] text-warning"/>
          </div>
          <div class="flex-1 body-m mr-[12px]">
            {t("payAttention.currentlySummarizing")}
          </div>
          <div class="flex items-center justify-start gap-[8px]">
            <QButton
              variant="outlined"
              onClick={handleClose}
              class="h-[32px]"
            >
              {t("payAttention.cancel") || "Cancel"}
            </QButton>
            <QButton
              variant="filled"
              class="h-[32px]"
              onClick={handleNewRecording}
            >
              {t("payAttention.newRecording")}
            </QButton>
            <div class="w-[32px] h-[32px] flex items-center justify-center rounded-full" onClick={handleClose}>
              <IconClose class="w-[16px] h-[16px] text-inverse-surface" />
            </div>
          </div>
        </div>
      );
    };
  },
});
