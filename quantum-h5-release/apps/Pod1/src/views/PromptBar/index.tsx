import { defineComponent, nextTick, onMounted, onUnmounted, ref, Transition, watch, computed, onBeforeMount } from "vue";
import {
  BarMode,
  BarStore,
  changeActiveBtn,
  changeBarMode,
  LiveMode,
  startMinimizeTimer,
  stopMinimizeTimer,
} from "@/store/bar";
import { lastWinSize, useBarAnime, useMinimizeAnime, useSuggestionAnime ,useFileAreaAnime} from "./use/useAnime";
import { CrossTabCommunicator, ChannelMessageType, ChannelMessage, WebviewMessager, getOobeStatus } from "@libs/service";
import { IdleView } from "./coms/Idle";
import {
  MinimizeBtn,
  SuggestionSwitcher,
  AutoDetectedMeeting
} from "./coms/Bar";
import Bar from "../Bar/comps/Bar";
import { closeWindow, openQuantumAppWin, openQuantumChatWin, startDragWindow, updataAcrylic, updateWindowSize, WindowIdStore, WindowStore } from "@/store/window";
import "./style.less";
import { awaitTime, nextAnimationFrame } from "@quantum/use";
import { payAttentionStore, RecordingButtonStatus } from "@/store/payAttention";
import { ChatWinStore } from "@/store/chatWin";
import { onContextmenuPopup } from "@/store/popup";
import {FileArea} from "./coms/FileArea";
export default defineComponent({
  name: "PromptBar",
  setup() {
    const BarAnime = useBarAnime();
    const MinimizeAnime = useMinimizeAnime();
    const SuggesttionAnime = useSuggestionAnime();
    const FileAreaAnime = useFileAreaAnime();

    watch(
      () => BarAnime.animeDone,
      async () => {
        if (BarAnime.animeDone) {
          await awaitTime(100);
          resizeWindow();
        }
        if (BarAnime.animeDone && BarStore.barMode == BarMode.BAR) {
          BarStore.showMinimize = true;
        } else {
          BarStore.showMinimize = false;
        }
      }
    );
    const onIdleClick = () => {
      if (BarAnime.animeDone) {
        changeBarMode(BarMode.BAR);
      }
    };
    const onBarMouseEnter = () => {
      if (BarAnime.animeDone && !BarStore.showMinimize) {
        stopMinimizeTimer();
        BarStore.showMinimize = true;
      }
    };
    const onBarMouseLeave = () => {
      if (BarAnime.animeDone && BarStore.showMinimize) {
        startMinimizeTimer();
      }
    };

    const resizeWindow = async () => {
      const ClientRect = appElRef.value.getBoundingClientRect();
      let CornerRadius = 32
      if (ClientRect.width > 200) {
        lastWinSize.width = Math.max(ClientRect.width, 600)
      } else {
        CornerRadius = 15
      }
      await updateWindowSize({
        Width: lastWinSize.width,
        Height: ClientRect.height,
      });
      await nextAnimationFrame();
      const BarEl = document.querySelector(".prompt-bar").querySelector('.acrylic-view');
      const BarRect = BarEl.getBoundingClientRect();
      updataAcrylic({
        Name: "Main",
        Width: BarRect.width,
        Height: BarRect.height,
        CornerRadius,
        PointX: BarRect.x,
        PointY: BarRect.y,
      });
    }
    const appElRef = ref<HTMLElement>();
    const isPayAttentionOpen = ref(false); // PayAttention 窗口是否打开
    let oberverRequestAnimation: number | null = null;

    const observerAppEl = async () => {
      console.log("observerAppEl----------------");
      if (BarAnime.animeDone && !BarStore.isAanimateChange) {
        await nextTick();
        if (oberverRequestAnimation) {
          cancelAnimationFrame(oberverRequestAnimation);
        }

        oberverRequestAnimation = requestAnimationFrame(async () => {
          resizeWindow()
        });
      }
    };
    onBeforeMount(() => {
      if ('barMode' in history.state && BarStore.barMode !== history.state.barMode) {
        changeBarMode(history.state.barMode)
      }
    })

    let observer: ResizeObserver;
    onMounted(() => {
      observer = new ResizeObserver(observerAppEl);
      for (let i = 0; i < appElRef.value.children.length; i++) {
        const child = appElRef.value.children[i];
        observer.observe(child, {});
      }

      observer.observe(appElRef.value, {});

      const communicator = new CrossTabCommunicator(ChannelMessageType.CHATVIEW);
      communicator.onMessage((message: ChannelMessage) => {
        if (message.type === 'chatClose') {
          console.log('changeActiveBtn------------')
          changeActiveBtn('');
        }
      });


      // 监听 PayAttention 窗口打开/关闭
      WebviewMessager.on("client.h5.payattentionVisible", (data: any) => {
        console.log(data, 'client.h5.payattentionVisible message=====234')
        const show = data.Data as boolean;
        isPayAttentionOpen.value = !!show;
      });
      // openQuantumChatWin('#/oobe-bar')
    });
    onUnmounted(() => {
      observer?.disconnect();
      WebviewMessager.off("client.h5.payattentionVisible");
    });

    const onWindowDeactivated = ({ Data }: any) => {
      const { WindowDeactivated } = Data
      if (WindowDeactivated && BarStore.barMode === BarMode.BAR && BarAnime.animeDone && BarStore.liveMode === LiveMode.none) {
        changeBarMode(BarMode.IDLE);
      }
    };
    WebviewMessager.on("/ContextualPrompt/WindowDeactivated", onWindowDeactivated);
    onUnmounted(() => {
      WebviewMessager.off("/ContextualPrompt/WindowDeactivated");
    })

    const onAIMousePressEvent = ({ Data }: any) => {
      if (BarStore.barMode === BarMode.IDLE) {
        const { AIMouseEvent } = Data
        if (AIMouseEvent == 'ShortPress') {
          changeBarMode(BarMode.BAR)
        } else if (AIMouseEvent == 'LongPress') {
          openQuantumAppWin()
        }
      }
    }
    WebviewMessager.on("AIMousePressEvent", onAIMousePressEvent);
    onUnmounted(() => {
      WebviewMessager.off("AIMousePressEvent");
    })



    // 计算 SuggestionSwitcher 的展示条件
    const shouldShowSuggestionSwitcher = computed(() => {
      // 监听到会议或者非录音默认状态不展示
      const recorderStatus = payAttentionStore.recordingButtonStatus;
      const recorderIsDefault = recorderStatus === RecordingButtonStatus.Default;

      return BarAnime.animeDone && BarStore.barMode == BarMode.BAR && !payAttentionStore.showMeetingDialog && recorderIsDefault && !['Chat', 'CMU', 'SuggestionContainer'].includes(ChatWinStore.view);
    });

    const onBarClick = async () => {
      // closeWindow(WindowStore.windowId.chat);
      const res = await getOobeStatus({
        Data:{Keys:["general"]},
      });
      console.log(res, "res--------------------------------");
    };

    return () => {
      return (
        <div
          class="prompt-bar-box flex flex-col items-center w-fit mx-auto pt-[34px]"
          data-click-through
          ref={appElRef}
        >
          <div
            class={[
              "prompt-bar relative",
              // {
              //   "px-[38px]": BarStore.barMode == BarMode.BAR,
              // },
            ]}

          >
            <Transition
              mode="out-in"
              onEnter={BarAnime.onEnter}
              onLeave={BarAnime.onLeave}
              css={false}
            >
              {BarStore.barMode == BarMode.IDLE ? (
                <IdleView class="cursor-pointer" key="idle" onClick={onIdleClick} onMousedown={startDragWindow} onContextmenu={onContextmenuPopup} v-automation="idle_view" />
              ) : (
                <Bar
                  class="bar-view p-[8px] rounded-[32px]"
                  key="bar"
                  onMouseenter={onBarMouseEnter}
                  onMouseleave={onBarMouseLeave}
                  onClick={onBarClick}
                  onContextmenu={onContextmenuPopup}
                />
              )}
            </Transition>
            <Transition
              mode="out-in"
              name="minimize-show"
              onEnter={MinimizeAnime.onEnter}
              onLeave={MinimizeAnime.onLeave}
              css={false}
            >
              {BarStore.showMinimize ? (
                <MinimizeBtn class="absolute top-[20px] -right-[38px]" />
              ) : null}
            </Transition>
          </div>
          <Transition
            mode="out-in"
            onEnter={SuggesttionAnime.onEnter}
            onLeave={SuggesttionAnime.onLeave}
            css={false}
          >
            {shouldShowSuggestionSwitcher.value ? <SuggestionSwitcher /> : null}
          </Transition>
          <Transition mode="out-in">
            <AutoDetectedMeeting />
          </Transition>
          <Transition mode="out-in" onEnter={FileAreaAnime.onEnter} onLeave={FileAreaAnime.onLeave} appear css={false}>
            {BarStore.barMode === BarMode.IDLE && BarStore.fileArea && !WindowIdStore.Chat ? <div class="h-[451px] w-[451px]">
              <FileArea visible={ true } />
            </div>:null}
          </Transition>
        </div>
      );
    };
  },
});
