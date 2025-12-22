import { defineComponent, onMounted, onUnmounted, nextTick, ref, watch } from "vue";
import HomeChat from "./homeChat/index.vue";
import { changeSize, WebviewMessager, setCloseWindow, CrossTabCommunicator, ChannelMessageType } from "@libs/service";
import { WindowStore } from "@/store/window";
import { clearDisclaimerTimer, payAttentionStore, setPayAttentionStore, RecordingButtonStatus, RecordingDisplayStatus } from "@/store/payAttention";
import MiniWin from "@/components/MiniWin";

import "./index.less";

export default defineComponent({
  name: "PayAttention",
  setup() {
    const DefaultMaxHeight = 775;
    const containerRef = ref<HTMLDivElement | null>(null);
    const maxHeightRef = ref<number | null>(DefaultMaxHeight);
    const containerHeightRef = ref<string | null>(null);
    let resizeObserver: ResizeObserver | null = null;
    const recordBus = new CrossTabCommunicator(ChannelMessageType.RECORD);

    const checkAndSetContainerHeight = (): void => {
      const container = (containerRef.value as any)?.$el || containerRef.value;
      if (!container || !maxHeightRef.value) return;

      const actualContentHeight = container.scrollHeight;
      const hadHeight = containerHeightRef.value !== null;

      // 如果实际内容高度大于等于maxHeight，设置height以启用滚动
      if (actualContentHeight >= maxHeightRef.value) {
        container.style.height = `${maxHeightRef.value}px`;
        containerHeightRef.value = `${maxHeightRef.value}px`;
      } else {
        // 如果实际内容高度小于maxHeight，移除height设置，让容器自适应
        if (hadHeight) {
          container.style.height = "";
          containerHeightRef.value = null;
        }
      }
    };

    const setupResizeObserver = (): void => {
      nextTick(() => {
        const container = (containerRef.value as any)?.$el || containerRef.value || (document.querySelector(".pay-attention-container") as HTMLElement | null);
        if (!container) {
          console.warn("ResizeObserver: container not found");
          return;
        }

        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const height = entry.contentRect.height + 16; // 16为壳的上下边距
            const finalHeight = Math.max(height, 130);
            if (WindowStore.current?.id) {
              changeSize({
                id: WindowStore.current.id,
                Width: 772,
                Height: finalHeight,
              }).catch((error) => {
                console.error("Error changing webview size:", error);
              });
            }

            checkAndSetContainerHeight();
          }
        });

        resizeObserver.observe(container);
      });
    };

    watch(
      () => payAttentionStore.displayMode,
      (newValue) => {
        const container = (containerRef.value as any)?.$el || containerRef.value;
        if (container && containerHeightRef.value) {
          container.style.height = "";
          containerHeightRef.value = null;
        }
      },
      { immediate: false }
    );

    onMounted(() => {
      setupResizeObserver();

      // 监听最大高度通知
      WebviewMessager.on("client.h5.maxHeightNotification", (evt: any) => {
        const maxHeight = evt?.Data as number;
        if (maxHeight) {
          maxHeightRef.value = maxHeight ?? DefaultMaxHeight;
          checkAndSetContainerHeight();
        }
      });

      // 窗口打开时，将焦点设置到窗口内，使 Tab 键可以聚焦在窗口内
      // 使用 setTimeout 确保窗口完全显示后再设置焦点
      setTimeout(() => {
        nextTick(() => {
          const container = (containerRef.value as any)?.$el || containerRef.value;
          if (container) {
            container.setAttribute('tabindex', '-1');
            container.focus();
          }
        });
      }, 100);
    });

    onUnmounted(() => {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }

      WebviewMessager.off("client.h5.maxHeightNotification");
    });

    const handleCloseWindow = async () => {
      try {
        const displayStatus = payAttentionStore.recordingDisplayStatus;
        if ([RecordingDisplayStatus.Summarizing, RecordingDisplayStatus.SummaryCompleted]?.includes(displayStatus)) {
          setPayAttentionStore('recordingButtonStatus', RecordingButtonStatus.Default);
          setPayAttentionStore('recordingDisplayStatus', RecordingDisplayStatus.Default);
          clearDisclaimerTimer();
          recordBus.send("record:close", { active: false });
        }
      } catch (error) {
        console.error("setCloseWindow error", error);
      }
    };

    return () => (
        <MiniWin
          class="pay-attention-container rounded-32 !px-[24px] focus:outline-none"
          ref={containerRef}
          onClose={handleCloseWindow}
          tabindex="-1"
        >
          <HomeChat />
        </MiniWin>
    );
  },
});
