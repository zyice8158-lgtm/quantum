import { defineComponent, ref, onBeforeUnmount } from "vue";
import OobeSplash from "./Components/OobeSplash.vue";
import OobeTopBar from "./Components/OobeTopBar.vue";
import OobePanel from "./Components/OobePanel.vue";
import OobeState, { oobeEventBus, type OobeSnapshot } from "./OobeState";
import OobeSetting from "./Components/OobeSetting.vue";
import OobePreview from "./Components/OobePreview.vue";

export default defineComponent({
  name: "OOBE",
  setup() {
    const state = new OobeState();

    const route = ref(state.snapshot.route);
    const step = ref(state.snapshot.step);
    const language = ref(state.snapshot.language);
    const voiceEnabled = ref(state.snapshot.voiceEnabled);

    const handleState = (snap: OobeSnapshot): void => {
      route.value = snap.route;
      step.value = snap.step;
      language.value = snap.language;
      voiceEnabled.value = snap.voiceEnabled;
    };
    const handleFinished = (): void => {
      // 这里跳转 Chat 或通知（WebView2）
      // router.push('/chat')
    };

    oobeEventBus.on("oobe:state", handleState);
    oobeEventBus.on("oobe:finished", handleFinished);

    onBeforeUnmount(() => {
      oobeEventBus.off("oobe:state", handleState);
      oobeEventBus.off("oobe:finished", handleFinished);
    });

    return () => {
      if (step.value === "Splash") return <OobeSplash stepAll={state} />;
      if (route.value === "OOBE") {
        return (
          <div class="oobe-container">
            <OobeTopBar oobeEventBus={oobeEventBus} stepAll={state} />
            <OobePanel
              oobeEventBus={oobeEventBus} stepAll={state}
            />
            <OobeSetting oobeEventBus={oobeEventBus} stepAll={state} />
            <OobePreview oobeEventBus={oobeEventBus} stepAll={state} />
          </div>
        );
      }
    };
  },
});
