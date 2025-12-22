import Lottie from "lottie-web";
import { computed, defineComponent, nextTick, onMounted, ref, Transition } from "vue";
import redAnimationData from "@/assets/lottie/red.json";
import purpleAnimationData from "@/assets/lottie/purple.json";
import { cubicBezier, createTimeline, animate } from "animejs";
import { IconQuantumLogo } from '@quantum/icons'
export default defineComponent({
  name: "InitLoading",
  setup() {
    const logo = ref<HTMLElement>();
    // const LottieCom = {
    //   red: RedLottie,
    //   purple: PurpleLottie,
    //   none: "div",
    // };
    // type LottieStatus = keyof typeof LottieCom;
    // const state = reactive({
    //   status: "red" as LottieStatus,
    // });

    // const CurrentCom = computed(() => {
    //   return LottieCom[state.status];
    // });

    // const { onEnter, onLeave } = useAnime();
    // const channel = new BroadcastChannel("haloForPromptBar");
    // channel.onmessage = ({ data }) => {
    //   state.status = data.status;
    // };

    onMounted(() => {
      console.log('doinghua');
      console.log(logo.value);
      if (logo.value) {

        animate(logo.value, {
          rotate: [0, 360],  // 从0度到360度旋转
          duration: 1000,    // 每1000毫秒完成一次旋转
          easing: "linear",  // 线性缓动，保证匀速旋转
          loop: true         // 循环播放
        });
      }

    })

    return () => {
      return (
        <div class="loading w-full h-full flex justify-center items-center">
          <Transition css={false}>
            <div class="flex  items-center justify-center">
              <IconQuantumLogo ref={logo} class=" text-[32px] mr-[16px]"></IconQuantumLogo>
              <span>
                loading
              </span>
            </div>
          </Transition>
        </div>
      );
    };
  },
});

