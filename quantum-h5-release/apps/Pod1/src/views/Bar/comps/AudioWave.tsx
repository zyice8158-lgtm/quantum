import { defineComponent, ref, onMounted, onUnmounted, computed, withModifiers } from "vue";
import "./AudioWave.less";
import { IconArrowLeft } from "@quantum/icons";
import { WebviewMessager } from "@libs/service";
import { closePayAttentionWin } from "@/store/window";
import { useLocale } from "@/hooks/i18n";

export default defineComponent({
  name: "AudioWave",
  setup() {
    const { t } = useLocale();
    const values = ref<number[]>(Array.from({ length: 20 }, () => Math.random()));
    const rotated = ref(true);
    let timer: number | undefined;

    onMounted(() => {
      timer = window.setInterval(() => {
        values.value = values.value.map(() => Math.random());
      }, 400);
      WebviewMessager.on("client.h5.payattentionVisible", (payload) => {
        console.log(payload, 'client.h5.payattentionVisible data')
        const show = payload?.Data;
        if (show !== !rotated.value) {
          rotated.value = !rotated.value;
        }
      });
    });

    onUnmounted(() => {
      if (timer) clearInterval(timer);
      WebviewMessager.off("client.h5.payattentionVisible");
    });

    const toggleRotate = () => {
      rotated.value = !rotated.value;
      closePayAttentionWin(!rotated.value);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        console.log('handleKeyDown', e);
        e.preventDefault();
        toggleRotate();
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();
      toggleRotate(e);
    };

    const ariaLabel = computed(() => {
      return rotated.value
        ? t("promptBar.expandRecordingWindow")
        : t("promptBar.collapseRecordingWindow");
    });

    return () => (
      <div class="audio-wave flex items-center" v-automation="audio_wave_down_btn" onClick={withModifiers(() => null, ['stop'])}>
        <div class="aw-center">
          {values.value.map((v, i) => {
            const h = 6 + (30 - 6) * v;
            return <div key={i} class="aw-bar" style={{ height: `${h}px` }} />;
          })}
        </div>

        <div
          class={[
            "audio-wave-down w-[40px] h-[40px] rounded-[50%] flex items-center justify-center text-text-on-surface-muted",
            rotated.value ? "rotated" : "",
          ]}
          tabindex="0"
          role="button"
          aria-label={ariaLabel.value}
          onClick={handleClick}
          onKeydown={handleKeyDown}
        >
          <IconArrowLeft class="text-text-on-surface-muted" />
        </div>
      </div>
    );
  },
});
