import Lottie from "lottie-web";
import { computed, defineComponent, nextTick, onMounted, reactive, ref, Transition } from "vue";
import redAnimationData from "@/assets/lottie/red.json";
import purpleAnimationData from "@/assets/lottie/purple.json";
import { cubicBezier, createTimeline } from "animejs";

export default defineComponent({
  name: "ForPromptBar",
  setup() {
    const LottieCom = {
      red: RedLottie,
      purple: PurpleLottie,
      none: "div",
    };
    type LottieStatus = keyof typeof LottieCom;
    const state = reactive({
      status: "red" as LottieStatus,
    });

    const CurrentCom = computed(() => {
      return LottieCom[state.status];
    });

    const { onEnter, onLeave } = useAnime();
    const channel = new BroadcastChannel("haloForPromptBar");
    channel.onmessage = ({ data }) => {
      state.status = data.status;
    };
    return () => {
      return (
        <div class="relative translate-y-[130px]">
          <Transition onEnter={onEnter} onLeave={onLeave} css={false}>
            <CurrentCom.value class="w-[470px] max-w-full blur-[70px] rounded-[300px] overflow-hidden absolute top-0 left-1/2 -translate-x-1/2" key={state.status} />
          </Transition>
        </div>
      );
    };
  },
});

const useAnime = () => {
  const onRedEnter = async (el: Element) => {
    await createTimeline().add(el, {
      duration: 400,
      opacity: [0, 0.9],
      scale: [0, 1],
      easing: cubicBezier(0.84, 0.0, 0.16, 1.0),
    });
  };
  const onPurpleEnter = async (el: Element) => {
    await createTimeline().add(el, {
      duration: 400,
      opacity: [0, 0.9],
      easing: cubicBezier(0.84, 0.0, 0.16, 1.0),
    });
  };
  const onRedLeave = async (el: Element) => {
    await createTimeline().add(el, {
      duration: 1200,
      opacity: [0.9, 0],
      easing: cubicBezier(0.33, 0.0, 0.67, 1.0),
    });
  };
  const onPurpleLeave = async (el: Element) => {
    await createTimeline().add(el, {
      duration: 500,
      opacity: [0.9, 0],
      easing: cubicBezier(0.33, 0.0, 0.67, 1.0),
    });
  };

  const onEnter = async (el: Element, done: () => void) => {
    if (el.id === "red-lottie") {
      await onRedEnter(el);
    } else if (el.id === "purple-lottie") {
      await onPurpleEnter(el);
    } else {
      await nextTick();
    }
    done();
  };
  const onLeave = async (el: HTMLElement, done: () => void) => {
    console.log("leave", el.id);
    el.style.position = "absolute";
    if (el.id === "red-lottie") {
      await onRedLeave(el);
    } else if (el.id === "purple-lottie") {
      await onPurpleLeave(el);
    } else {
      await nextTick();
    }
    done();
  };
  return { onEnter, onLeave };
};

const RedLottie = defineComponent({
  name: "RedLottie",
  setup() {
    const elRef = ref<HTMLDivElement>();
    onMounted(() => {
      console.log("red");
      Lottie.loadAnimation({
        container: elRef.value!,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: redAnimationData,
        rendererSettings: {
          viewBoxOnly: true,
        },
      });
    });
    return () => {
      return <div id="red-lottie" ref={elRef}></div>;
    };
  },
});

const PurpleLottie = defineComponent({
  name: "PurpleLottie",
  setup() {
    const elRef = ref<HTMLDivElement>();
    onMounted(() => {
      console.log("purple");
      Lottie.loadAnimation({
        container: elRef.value!,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: purpleAnimationData,
        rendererSettings: {
          viewBoxOnly: true,
        },
      });
    });
    return () => {
      return <div id="purple-lottie" ref={elRef}></div>;
    };
  },
});
