import ChatView from "@/components/ChatView/index.vue";
import { SuggestionContainer } from "@/components/ChatView/Suggestion";
import MiniWin from "@/components/MiniWin";
import { ChatWinChannel, ChatWinStore, ChatWInType, ChatViewChannel } from "@/store/chatWin";
import { updataAcrylic, updateWindowSize } from "@/store/window";
import { IconQuantumLogo } from "@quantum/icons";
import {
  defineComponent,
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
  Transition,
} from "vue";
import { animate, createTimeline, cubicBezier } from "animejs";
import { animateSizeMorph, ElementSize } from "@/utils/Motion";
import { BarStore } from "@/store/bar";
import LiveAudio from "../Live/LiveAudio";
import { DefaultView } from "../Live/LiveAudio";
import { useLocale } from "@/hooks/i18n";
import { LiveErrorCamera } from "../Live/LiveError";
import { onContextmenuPopup } from "@/store/popup";

export default defineComponent({
  name: "ChatWin",
  setup() {
    const { t } = useLocale();

    const elRef = ref<HTMLDivElement>();
    const TIME_ANIMATE = 500;
    const TARGET_CHAT_WIDTH = 772;
    let oberverRequestAnimation: number | null = null;
    const observerEl = () => {
      if (oberverRequestAnimation) {
        cancelAnimationFrame(oberverRequestAnimation);
      }
      oberverRequestAnimation = requestAnimationFrame(async () => {
        if (elRef.value && !BarStore.isAanimateChange) {
          const ClientRect = elRef.value.getBoundingClientRect();
          await updateWindowSize({
            Width: ClientRect.width,
            Height: ClientRect.height,
          });
        }
      });
    };
    ChatWinChannel.onPing();
    ChatWinChannel.on("view", async (view) => {});

    let observer: ResizeObserver;
    const disconnect = () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    };
    const observe = () => {
      disconnect();
      observer = new ResizeObserver(observerEl);
      for (let i = 0; i < elRef.value.children.length; i++) {
        const child = elRef.value.children[i];
        observer.observe(child, {});
      }
    };
    onMounted(observe);
    onActivated(observe);
    onUnmounted(disconnect);
    onDeactivated(disconnect);

    const lastMorphSize = ref<ElementSize | null>();

    const handleViewEnter = async (el: Element, done: () => void) => {
      if (!["Chat", "SuggestionContainer"].includes(ChatWinStore.view)) {
        done();
        return;
      }
      BarStore.isAanimateChange = true;
      if (!elRef.value) {
        BarStore.isAanimateChange = false;
        done();
        return;
      }
      const ClientRect = elRef.value.getBoundingClientRect();
      // suggestionView
      // chatView
      const chatViewEl = elRef.value as HTMLElement;
      const rectChat = chatViewEl?.getBoundingClientRect();

      const clearAnimationAttributes = (targetEl: Element) => {
        targetEl.removeAttribute("style");
        targetEl.removeAttribute("easing");
        targetEl.removeAttribute("transform");
      };

      if (ChatWinStore.view === "Chat") {
        if (!rectChat) {
          BarStore.isAanimateChange = false;
          done();
          return;
        }
        updateWindowSize({
          Width: rectChat.width,
          Height: rectChat.height,
        });
        const animateEl = el.parentElement as HTMLElement;
        const rectAnimate = animateEl.getBoundingClientRect();
        animateEl.style.overflow = "hidden";
        animate(animateEl, {
          duration: TIME_ANIMATE,
          easing: cubicBezier(0.25, 0.1, 0.25, 1.0),
          height: [lastMorphSize.value?.height ?? 114, rectAnimate.height],
        }).then(() => {
          animateEl.style.overflow = "";
          animateEl.style.height = "";
          BarStore.isAanimateChange = false;
          lastMorphSize.value = null;
          done();
          clearAnimationAttributes(animateEl);
        });
      } else if (ChatWinStore.view === "SuggestionContainer") {
        await nextTick();
        const suggestionViewEl = elRef.value.querySelector(
          ".suggestion-view",
        ) as HTMLElement | null;
        const rectSuggestion = suggestionViewEl?.getBoundingClientRect();
        if (!suggestionViewEl || !rectSuggestion) {
          BarStore.isAanimateChange = false;
          done();
          return;
        }
        updateWindowSize({
          Width: ClientRect.width,
          Height: ClientRect.height,
        });
        animate(suggestionViewEl, {
          duration: TIME_ANIMATE,
          easing: cubicBezier(0.25, 0.1, 0.25, 1.0),
          height: [0, rectSuggestion.height],
          width: rectSuggestion.width,
        }).then(() => {
          BarStore.isAanimateChange = false;
          lastMorphSize.value = null;
          done();
          clearAnimationAttributes(el);
        });
      }
    };

    const handleViewLeave = async (el: Element, done: () => void) => {
      const className = (el as HTMLElement).className;
      console.log("chengshuaile", className);
    
      const rect = el.getBoundingClientRect();
      lastMorphSize.value = { width: rect.width, height: rect.height };
    
      const rootEl = elRef.value as HTMLElement | undefined;
      if (!rootEl) {
        await nextTick();
        done();
        return;
      }
    
      if (!className.includes("suggestion-view")) {
        await nextTick();
        done();
        return;
      }
    
      const suggestionViewEl = rootEl.querySelector(".suggestion-view") as HTMLElement | null;
      if (!suggestionViewEl) {
        await nextTick();
        done();
        return;
      }
    
      BarStore.isAanimateChange = true;
    
      const rectSuggestion = suggestionViewEl.getBoundingClientRect();
      const fromWidth = rectSuggestion.width;
      const delta = (fromWidth - TARGET_CHAT_WIDTH) / 2;
    
      const easing = cubicBezier(0.25, 0.1, 0.25, 1.0);
    
      await createTimeline()
        .add(
          rootEl,
          {
            duration: TIME_ANIMATE,
            easing,
            height: rectSuggestion.height,
            width: [rectSuggestion.width, TARGET_CHAT_WIDTH],
            translateX: [0, delta],
          },
          0,
        )
        .add(
          suggestionViewEl,
          {
            duration: TIME_ANIMATE,
            easing,
            height: rectSuggestion.height,
            width: [rectSuggestion.width, TARGET_CHAT_WIDTH],
          },
          0,
        );
    
      rootEl.style.removeProperty("width");
      rootEl.style.removeProperty("height");
      rootEl.style.removeProperty("transform");
    
      suggestionViewEl.style.removeProperty("width");
      suggestionViewEl.style.removeProperty("height");
      suggestionViewEl.style.removeProperty("transform");
    
      BarStore.isAanimateChange = false;
      done();
    };
    

    return () => {
      return (
        <div class="flex justify-center min-w-[772px] w-fit" data-click-through ref={elRef}>
          <div class="chat-win  w-fit flex justify-center acrylic-view rounded-[32px]">
            <div class="flex justify-center min-w-[1px] min-h-[1px]">
              <Transition
                mode="out-in"
                appear
                css={false}
                onEnter={handleViewEnter}
                onLeave={handleViewLeave}
              >
                {["Chat", "CMU"].includes(ChatWinStore.view) && (
                  <MiniWin class="chat-view flex-none w-[772px] max-h-[734px] min-h-[330px] overflow-hidden" onContextmenu={onContextmenuPopup}>
                    <ChatView key={ChatWinStore.view} class="h-full" />
                  </MiniWin>
                )}
                {ChatWinStore.view == "Thinking" && <ThinkingView />}
                {ChatWinStore.view == "SuggestionContainer" && (
                  <SuggestionContainer class="suggestion-view flex-none w-[904px] overflow-hidden" />
                )}
                {ChatWinStore.view == "Live" && <LiveAudio />}
                {ChatWinStore.view == "StartCamera" && (
                  <DefaultView displayText={t("live.trasition.startCamera")} />
                )}
                {ChatWinStore.view == "EndLive" && (
                  <DefaultView displayText={t("live.trasition.endLive")} />
                )}
                {ChatWinStore.view == "LiveErrorCamera" && (
                  <LiveErrorCamera errorMsg={ChatWinStore.liveErrorCamera} />
                )}
              </Transition>
            </div>
          </div>
        </div>
      );
    };
  },
});

const ThinkingView = defineComponent({
  name: "ThinkingView",
  setup() {
    const thinkingText = "Quantum is thinking...";
    return () => {
      return (
        <div class="thinking-view flex items-center w-fit h-[48px] px-[49px] bg-surface-blur rounded-[32px]">
          <IconQuantumLogo class="text-[20px] animate-spin" />
          <div class="py-[14px] px-[10px] text-[14px] text-transparent bg-[radial-gradient(50%_50%_at_50%_50%,_#5C8DFF_0%,_#855EE1_100%)] bg-clip-text label-m">
            {thinkingText}
          </div>
        </div>
      );
    };
  },
});

const TextView = defineComponent({
  name: "TextView",
  setup() {
    return () => {
      return <div class="text-view">TextView</div>;
    };
  },
});
