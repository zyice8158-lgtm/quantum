import { defineComponent, computed } from "vue";
import { IconRecord, IconStartRecording } from "@quantum/icons";
import { setSwitchRecordWindow, CrossTabCommunicator, ChannelMessageType } from "@libs/service";
import {
  openQuantumBarWin,
} from "@/store/window";
import { payAttentionStore, RecordingButtonStatus, stopRecording } from "@/store/payAttention";
import { useLocale } from "@/hooks/i18n";

export default defineComponent({
  name: "HeaderRecording",
  setup() {
    const { t } = useLocale()
    const recordBus = new CrossTabCommunicator(ChannelMessageType.RECORD);

    const openPayAttention = async() => {
      openQuantumBarWin('#/prompt-bar')
      setSwitchRecordWindow({MessageSource: "windowRecord1", Data: { isShow: true } });
    }

    const isRecording = computed(() => {
      return [RecordingButtonStatus.Recording, RecordingButtonStatus.ShowDisclaimer]?.includes(payAttentionStore.recordingButtonStatus);
    });

    const handleStopRecording = async(e?: Event) => {
      e?.stopPropagation();
      await stopRecording();
      openPayAttention()
    }

    return () => {
      if (!isRecording.value) {
        return null;
      }

      return (
        <div class="flex flex-row mr-[8px] items-center cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              openPayAttention();
            }}>
          <div class="text-error text-body-m"><IconRecord /></div>
            <div class="mx-[4px] text-label-xs text-text-on-surface">{t('layout.recording')}</div>
          <div class="text-body-m text-primary" onClick={handleStopRecording}><IconStartRecording /></div>
        </div>
      );
    };
  },
});
