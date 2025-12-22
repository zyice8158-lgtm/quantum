import {
  BarMode,
  BarStore,
  changeBarMode,
  changeLiveMode,
  jumpToChatFromLiveSuggestion,
  LiveMode,
  startMinimizeTimer,
  stopMinimizeTimer,
} from "@/store/bar";
import { buildContextualContent, buildSuggestionContent, SuggestionItemType, SuggestionStore } from "@/store/suggestion";
import SuggestionView from "@/views/Bar/comps/SuggestionView";
import { defineComponent, onMounted, onBeforeUnmount, computed } from "vue";
import { IconMinize } from "@quantum/icons";
import { useRouter } from "vue-router";
import { openNewWindow } from "@/store/window";
import { WebviewMessager, setRecordMethod, CrossTabCommunicator, ChannelMessageType } from "@libs/service";
import { useI18n } from 'vue-i18n';
import { IconQuantumLogo } from "@quantum/icons";
import {  QButton } from '@libs/p-comps/volt/QButton';
import { RecordingButtonStatus, payAttentionStore, setPayAttentionStore, isRecordButtonActive, isShowDisclaimer } from "@/store/payAttention";

import { ChatViewChannel, ChatWinChangeView } from "@/store/chatWin";
/** live mode suggestions */
export const LiveModeSuggestions = defineComponent({
  name: "LiveModeSuggestions",
  setup() {
    const handleContextualClick = async (item: SuggestionItemType) => {
      if (BarStore.liveMode == LiveMode.transition) return;

      if (item.name == "add_memory") {
        await changeLiveMode(LiveMode.none);
        openNewWindow("FullView", "#/quantum/memories");
      } else if (item.name === "add_document") {
        await changeLiveMode(LiveMode.none);
        openNewWindow("FullView", "#/quantum/memories");
      } else if (item.name === "search_memory") {
        await changeLiveMode(LiveMode.none);
        openNewWindow("FullView", "#/quantum/memories");
      } else {
        await jumpToChatFromLiveSuggestion(async () => {
          await ChatViewChannel.emit('setQueryObject', buildContextualContent(item));
        });
      }
    }
    return () => {
      if (BarStore.barMode == BarMode.BAR && BarStore.liveMode != LiveMode.none) {
        return (
          <div class="flex gap-[12px] mt-[13px] w-fit empty:hidden" v-automation="live_suggestions">
            {SuggestionStore.Contextual.slice(0,3).map((item) => {
              return <SuggestionView class="suggestion-item" item={item} showName="description" onClick={handleContextualClick.bind(null, item)} />;
            })}
          </div>
        );
      } else {
        return null;
      }
    };
  },
});

export const NormalModeSuggestions = defineComponent({
  name: "NormalModeSuggestions",
  setup() {
    const router = useRouter();
    const setQuerySuggestionStatic = async (item: SuggestionItemType) => {
      const itemWithFiles = {
        ...item,
        files: [] as any[],
      };
      ChatWinChangeView('Chat')
      changeBarMode(BarMode.IDLE);
      await ChatViewChannel.emit('setQueryObject', buildSuggestionContent(itemWithFiles));
    };
    const handleContextualClick = async (item: SuggestionItemType) => {
      if (item.name == "add_memory") {
        openNewWindow("FullView", "#/quantum/memories");
      } else if (item.name === "add_document") {
        openNewWindow("FullView", "#/quantum/memories");
      } else if (item.name === "search_memory") {
        openNewWindow("FullView", "#/quantum/memories");
      } else {
        ChatWinChangeView('Chat')
        changeBarMode(BarMode.IDLE);
        await ChatViewChannel.emit('setQueryObject', buildContextualContent(item));
      }
    }
    return () => {
      if (BarStore.barMode == BarMode.BAR && BarStore.liveMode == LiveMode.none) {
        return (
          <div class="flex gap-[12px] mt-[13px] w-fit empty:hidden" v-automation="suggestion_items">

            {SuggestionStore.Suggestion.slice(0, 1).map((item) => {
              return (
                <SuggestionView
                  onClick={setQuerySuggestionStatic.bind(null, item)}
                  class="suggestion-item"
                  item={item}
                  showName="name"
                />
              );
            })}
            {SuggestionStore.Contextual.slice(0, 2).map((item) => {
              return <SuggestionView class="suggestion-item" item={item} showName="description" onClick={handleContextualClick.bind(null, item)} />;
            })}
          </div>
        );
      }
    };
  },
});

export const SuggestionSwitcher = () => {
  return BarStore.liveMode == LiveMode.none ? (
    <NormalModeSuggestions class="NormalModeSuggestions" key={"normal-suggestions"} />
  ) : (
    <LiveModeSuggestions class="LiveModeSuggestions" key={"live-suggestions"} />
  )
}

export const MinimizeBtn = defineComponent({
  name: "MinimizeBtn",
  setup() {
    const onClick = () => {
      console.log("MinimizeBtn");
      BarStore.showMinimize = false;
      setTimeout(() => {
        changeBarMode(BarMode.IDLE);
      }, 400);
    };
    const onMouseenter = () => {
      stopMinimizeTimer();
    };
    const onMouseleave = () => {
      startMinimizeTimer();
    };

    return () => {
      if (BarStore.barMode == BarMode.BAR) {
        return (
          <IconMinize
            class="minimize-btn text-[24px] text-white shadow-[inset_0_0_20px_0px_var(--color-ai)] rounded-full"
            onClick={onClick}
            onMouseenter={onMouseenter}
            onMouseleave={onMouseleave}
            v-automation="btn_minimize"
          />
        );
      }
    };
  },
});

export const AutoDetectedMeeting = defineComponent({
  name: "AutoDetectedMeeting",
  setup() {
    const {t} = useI18n();
    const recordBus = new CrossTabCommunicator(ChannelMessageType.RECORD);
    const isShow = computed(() => {
      return BarStore.barMode == BarMode.BAR && payAttentionStore.showMeetingDialog && !isRecordButtonActive.value;
    });

    const handleCancel = () => {
      setPayAttentionStore('showMeetingDialog', false);
    };

    const handleApply = async () => {
      setPayAttentionStore('recordingButtonStatus', RecordingButtonStatus.ShowDisclaimer);
      await setRecordMethod(
        { MessageSource: "window1", Data: { methodName: "StartRecordDualChannel" } },
        "method"
      );
      recordBus.send("record:state", { active: true });
      recordBus.send("record:open", { active: true });
    };

    onMounted(() => {
      WebviewMessager.on("client.h5.meetingmode",  (evt: any) => {
        const meetingMode = evt?.Data as boolean;
        setPayAttentionStore('showMeetingDialog', !!meetingMode);
      });
    });

    onBeforeUnmount(() => {
      WebviewMessager.off("client.h5.meetingmode");
    });

    return () => {
      if(isShowDisclaimer.value) {
        return (
          <div
            class={'flex items-center py-[8px] px-[16px] gap-[8px] mt-[16px] rounded-48 bg-[color-mix(in_srgb,var(--color-surface)_70%,transparent)] backdrop-blur-[140px]'}
          >
              <div class="flex-1 min-w-[0px] text-body-m font-medium break-words text-text-on-surface"
                style={{
                  fontFamily: "Rookery New",
                }}
              >
                {t("payAttention.confirmConsent")}
              </div>
            </div>
        );
      }

      if (isShow.value) {
        return (
          <div class={'flex items-center pl-[15px] pr-[15px] gap-[8px] mt-[16px] w-[521px] h-[48px] rounded-48 bg-[color-mix(in_srgb,var(--color-surface)_70%,transparent)] text-body-m'}>
            <IconQuantumLogo class="text-[19px] transition-transform duration-500 ease-in-out mr-[5px]"/>
            <div class="flex-1 min-w-[0px] text-body-s font-medium break-words meeting-detected-text">
              {t("payAttention.meetingDetected")}
            </div>
              <div class="flex gap-[8px]">
                <QButton size="small" onClick={handleCancel} color="primary" variant="outlined">{t("payAttention.cancel")}</QButton>
                <QButton size="small" onClick={handleApply} color="primary">{t("payAttention.startRecording")}</QButton>
              </div>
          </div>
        );
      }

      return null;
    };
  },
});

