import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  onBeforeUnmount,
  computed,
  watch,
} from "vue";
import BarBtn from "./BarBtn";
import ButtonGroup from "@libs/p-comps/volt/ButtonGroup.vue";
import {
  IconQuantumLogo,
  IconChat,
  IconLive,
  IconRecord,
  IconCMU,
  IconCamera,
  IconStartRecording,
  IconStopRecord,
} from "@quantum/icons";
import {
  CrossTabCommunicator,
  ChannelMessageType,
  setSwitchRecordWindow,
} from "@libs/service";
import { useRouter } from "vue-router";
import { useLocale } from "@/hooks/i18n";
import { openQuantumAppWin, startDragWindow, WindowIdStore } from "@/store/window";
import { closeWindow } from "@/store/window";
import AudioWave from "./AudioWave";
import { useDisabledVoice } from "@libs/p-comps/utils/checkDisabledVoice";
import { BarMode, BarStore, changeActiveBtn, changeBarMode, changeLiveMode, LiveMode } from "@/store/bar";
import { awaitTime, EventBus } from "@quantum/use";
import { WebviewMessager } from "@libs/service";
import {
  RecordingButtonStatus,
  payAttentionStore,
  setPayAttentionStore,
  isRecordButtonActive,
  isSummarizing,
  startRecording,
  stopRecording,
  clearDisclaimerTimer
} from "@/store/payAttention";
import { ChatViewChannel, ChatWinChangeView, ChatWinStore } from "@/store/chatWin";

export default defineComponent({
  name: "Bar",
  setup(props, { emit }) {
    const { t } = useLocale();
    const cmuActive = ref<boolean>(false);
    const router = useRouter();
    // recode 变量
    const isTogglingRecord = ref(false);
    const recordBus = new CrossTabCommunicator(ChannelMessageType.RECORD);
    const { isEnabledASR } = useDisabledVoice(true);
    const isStartRecording = ref(false);
    const handleChat = async () => {
      if (BarStore.liveMode === LiveMode.transition) return;

      if (ChatWinStore.view === "Chat" && WindowIdStore.Chat) {
        await closeWindow(WindowIdStore.Chat);
        return;
      }

      if (BarStore.liveMode !== LiveMode.none) {
        await changeLiveMode(LiveMode.none);
      }
      router.push({ name: "Chat" });
    };
    const handleLiveAudio = async () => {
      if (BarStore.liveMode == LiveMode.transition) return;
      if (BarStore.liveMode == LiveMode.none) {
        await changeLiveMode(LiveMode.audio);
      } else {
        await changeLiveMode(LiveMode.none);
      }
    };
    const handleLiveVideo = async () => {
      if (BarStore.liveMode == LiveMode.transition) return;
      if (BarStore.liveMode == LiveMode.camera) {
        await changeLiveMode(LiveMode.audio);
      } else {
        await changeLiveMode(LiveMode.camera);
      }
    };

    onUnmounted(() => {});

    const onRecordActiveChange = async (status: boolean) => {
      if (isTogglingRecord.value) return;
      isTogglingRecord.value = true;

      if(isSummarizing.value) {
        isTogglingRecord.value = false;
        setPayAttentionStore("showSummarizingTip", true)
        return
      }
      changeActiveBtn(status ? "record" : "");

      try {
        if (status) {
          await startRecording();
        } else {
          await stopRecording();
        }
      } catch (err) {
        console.error("Record toggle error:", err);
        changeActiveBtn("");
        setTimeoutSend(false);
        setPayAttentionStore("recordingButtonStatus", RecordingButtonStatus.Default);
        // TODO { "type": "audio:fft", "data": [0.08,0.15,0.32,0.55,0.41,0.2,0.1,0.05] }  是否提供频谱？？？
      } finally {
        isTogglingRecord.value = false;
      }
    };

    // 800ms后发送record:state消息
    const setTimeoutSend = (nextActive: boolean) => {
      recordBus.send("record:state", { active: nextActive });
    };

    const onCumActiveChange = (status: boolean) => {
      changeActiveBtn(status ? "cum" : "");
      cmuActive.value = status;
    };

    const toggleFullView = async () => {
      // console.log('toggleFullView', payAttentionStore.isRecording);
      if (BarStore.liveMode == LiveMode.transition) return;
      if (BarStore.liveMode !== LiveMode.none) {
        await changeLiveMode(LiveMode.none);
      }
      await openQuantumAppWin(`#/quantum/chat`);
    };

    /**
     * 重置录音状态到默认
     */
    const resetRecordingState = async () => {
      clearDisclaimerTimer();
      await setPayAttentionStore("recordingButtonStatus", RecordingButtonStatus.Default);
      changeActiveBtn("");
    };

    const handleCloseWindow = async () => {
      recordBus.onMessage((msg) => {
        if (msg.type === "record:close") {
          console.log("收到关闭录音指令", msg.data);
          resetRecordingState();
        }
        if (msg.type === "record:open") {
          console.log("收到打开录音指令", msg.data);
          onRecordActiveChange(true);
        }
      });
    };

    const gotoCatchMeUp = async () => {
      if (ChatWinStore.view == "CMU") {
        if (WindowIdStore.Chat) {
          closeWindow(WindowIdStore.Chat);
        } else {
          ChatWinStore.view = "";
        }
      } else {
        await ChatWinChangeView("CMU");
        changeBarMode(BarMode.IDLE);
        await ChatViewChannel.emit("setQueryObject", { content: "catch me up", isCatchMeUp: true });
      }
    };

    const handleStartRecordingData = (status: boolean) => {
      console.log("handleStartRecordingData", status);
      isStartRecording.value = status;
    };

    /**
     * 按钮状态映射配置
     */
    const buttonStatusMap: Record<RecordingButtonStatus, JSX.Element> = {
      [RecordingButtonStatus.Default]: <IconRecord class="text-primary" />,
      [RecordingButtonStatus.ShowDisclaimer]: (
        <>
          <IconRecord class="text-tertiary mr-[4px]" />
          <AudioWave />
        </>
      ),
      [RecordingButtonStatus.Recording]: (
        <>
          <IconStartRecording class="mr-[4px] text-primary" />
          <AudioWave />
        </>
      ),
      [RecordingButtonStatus.Stop]: <IconStopRecord />,
    };

    onMounted(async () => {
      handleCloseWindow(); // 开启监听record:close 消息
      EventBus.on("startRecording", handleStartRecordingData);
      WebviewMessager.on("MicrophoneRemoved", (res) => {
        console.log("MicrophoneRemoved--------------", res);
        const { MicrophoneRemoved } = res.Data || {};
        if (MicrophoneRemoved && BarStore.liveMode !== LiveMode.none) {
          changeLiveMode(LiveMode.none);
        }
      });
      WebviewMessager.on("SpeakerRemoved", (res) => {
        console.log("SpeakerRemoved--------------", res);
        const { SpeakerRemoved } = res.Data || {};
        if (SpeakerRemoved && BarStore.liveMode !== LiveMode.none) {
          changeLiveMode(LiveMode.none);

        }
      });
    });

    onBeforeUnmount(() => {
      EventBus.off("startRecording", handleStartRecordingData);
    });

    return () => {
      return (
        <div class="w-fit acrylic-view" onMousedown={startDragWindow}>
          <div class="flex align-middle gap-[12px] w-fit">
            <BarBtn
              v-tooltip={[
                {
                  value: t("promptBar.discover"),
                  showDelay: 200,
                  trigger: "hover",
                  pt: {
                    root: "!top-0",
                  },
                },
                ["top"],
              ]}
              class="!p-[4px] !border-[1.5px] border-transparent"
              onClick={toggleFullView}
              v-automation="btn_logo"
            >
              <IconQuantumLogo class="text-[32px] transition-transform duration-500 ease-in-out hover:rotate-[360deg]"></IconQuantumLogo>
            </BarBtn>
            <ButtonGroup class="w-[100px] whitespace-nowrap">
              <BarBtn
                isActive={ChatWinStore.view == "Chat"}
                onClick={handleChat}
                v-automation="btn_chat"
                v-tooltip={[
                  {
                    value: t("promptBar.chat"),
                    trigger: "hover",
                    showDelay: 200,
                    pt: {
                      root: "!top-0",
                    },
                  },
                  ["top"],
                ]}
              >
                <IconChat />
              </BarBtn>
              <BarBtn
                class={[
                  "!border-l-[var(--color-outlines-outline-variant)] border-l-[1px]",
                  "!border-t-[1.5px] !border-r-[1.5px] !border-b-[1.5px] !border-solid !border-[var(--surfaces-prompt-bar-stroke)]",
                  {
                    "w-auto": BarStore.liveMode != LiveMode.none,
                  },
                ]}
                v-automation="btn_live"
                isActive={BarStore.liveMode != LiveMode.none}
                onClick={handleLiveAudio}
                disabled={!isEnabledASR.value}
                v-tooltip={[
                  {
                    value: t("promptBar.live"),
                    trigger: "hover",
                    showDelay: 200,
                    pt: {
                      root: "!top-0",
                    },
                  },
                  ["top"],
                ]}
              >
                <div
                  class={[
                    "flex items-center",
                    {
                      "px-[10px]": BarStore.liveMode != LiveMode.none,
                    },
                  ]}
                >
                  <IconLive></IconLive>
                  {BarStore.liveMode == LiveMode.none ? null : (
                    <span class="text-[16px] ml-[4px]">{t("common.live")}</span>
                  )}
                </div>
              </BarBtn>
            </ButtonGroup>
            {BarStore.liveMode != LiveMode.none ? (
              <BarBtn
                v-automation="btn_live_camera"
                isActive={BarStore.liveMode == LiveMode.camera}
                onClick={handleLiveVideo}
                v-tooltip={[
                  {
                    value: t("promptBar.camera"),
                    trigger: "hover",
                    showDelay: 200,
                    pt: {
                      root: "!top-0",
                    },
                  },
                  ["top"],
                ]}
              >
                <IconCamera></IconCamera>
              </BarBtn>
            ) : (
              <>
                <BarBtn
                  isActive={ChatWinStore.view == "CMU"}
                  onUpdate:isActive={onCumActiveChange}
                  onClick={gotoCatchMeUp}
                  v-automation="btn_cmu"
                  v-tooltip={[
                    {
                      value: t("promptBar.CMU"),
                      trigger: "hover",
                      showDelay: 200,
                      pt: {
                        root: "!top-0",
                      },
                    },
                    ["top"],
                  ]}
                >
                  <IconCMU></IconCMU>
                </BarBtn>
                <BarBtn
                  class={{
                    "w-auto": isRecordButtonActive.value,
                  }}
                  v-automation="btn_record"
                  activeClass={`pl-[12px]`}
                  isActive={isRecordButtonActive.value}
                  onUpdate:isActive={onRecordActiveChange}
                  v-tooltip={[
                    {
                      value: t("promptBar.record"),
                      trigger: "hover",
                      showDelay: 200,
                      pt: {
                        root: "!top-0",
                      },
                    },
                    ["top"],
                  ]}
                >
                  {buttonStatusMap[payAttentionStore.recordingButtonStatus] ||
                    buttonStatusMap[RecordingButtonStatus.Default]}
                </BarBtn>
              </>
            )}
          </div>
        </div>
      );
    };
  },
});
