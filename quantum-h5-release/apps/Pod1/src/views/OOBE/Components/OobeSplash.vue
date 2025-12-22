<template>
  <div class="oobe-splash">
    <!-- 动画阶段 -->
    <div ref="boxRef" class="splash-box splash-frame splash-frame--animated">
      <transition name="splash-fade">
        <div class="splash-logo-container" v-if="phase === 'logo'">
          <div class="splash-outside overflow-hidden">
            <div class="splash-bg-container">
              <img class="splash-logo-container_img" :src="bigLogo" alt="Logo" draggable="false" ref="logoRef" />
            </div>
            <div class="splash-greeting">
              <!-- <span class="splash-greeting_char">H</span>
              <span class="splash-greeting_char">i</span>
              <span class="splash-greeting_char">&nbsp;</span>

              <span class="splash-greeting_char">I</span>
              <span class="splash-greeting_char">’</span>
              <span class="splash-greeting_char">m</span>
              <span class="splash-greeting_char">&nbsp;</span>

              <span class="splash-greeting_char">Q</span>
              <span class="splash-greeting_char">i</span>
              <span class="splash-greeting_char">r</span>
              <span class="splash-greeting_char">a</span> -->
              <span class="splash-greeting_char" v-for="(char, index) in languageString" :key="index">{{ char }}</span>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { animate, cubicBezier } from "animejs";
import OobeState, { PanelStep } from "../OobeState";
import { useLocale } from "@/hooks/i18n";
const bigLogo = new URL("@/assets/bigLogo.png", import.meta.url).href;

type Phase = "seq" | "logo";
const phase = ref<Phase>("seq");

const { t } = useLocale();
const languageString = t('OOBE.oobe_greet_basic');

const boxRef = ref<HTMLDivElement | null>(null);
const STAY_FULL = 2000; // 全屏
const TO_HORIZ = 500; // 变为横向长方形
const TO_VERT = 500; // 变为纵向长方形
const TO_CIRCLE = 800; // 变为圆

const easeFn = cubicBezier(0.25, 0.1, 0.25, 1.0);
const props = defineProps<{
  stepAll: OobeState;
}>();
let animation: ReturnType<typeof animate> | null = null;
let phaseTimer: number | undefined;
let toCircleTimer: number | undefined;

onMounted(() => {
  const el = boxRef.value;
  if (!el) return;

  // 基于 1920x1080 的缩放，适配不同分辨率（除第一帧外）
  const BASE_W = 1920;
  const BASE_H = 1080;
  const scale = Math.min(window.innerWidth / BASE_W, window.innerHeight / BASE_H);
  const sz = (n: number) => `${Math.round(n * scale)}px`;
  const vwPx = `${window.innerWidth}px`;
  const vhPx = `${window.innerHeight}px`;

  animation = animate(el, {
    width: [
      // 第一帧真实全屏（使用 px，避免与后续 px 单位切换带来的顿挫）
      { from: vwPx, to: vwPx, duration: STAY_FULL },
      // 其后帧按 1920 基准缩放
      { to: sz(1310), duration: TO_HORIZ },
      { to: sz(156), duration: TO_VERT },
      { to: sz(470), duration: TO_CIRCLE },
    ],
    height: [
      // 第一帧真实全屏（使用 px，避免与后续 px 单位切换带来的顿挫）
      { from: vhPx, to: vhPx, duration: STAY_FULL },
      // 其后帧按 1080 基准缩放
      { to: sz(361), duration: TO_HORIZ },
      { to: sz(361), duration: TO_VERT },
      { to: sz(470), duration: TO_CIRCLE },
    ],
    borderRadius: [
      { from: "0px", to: "0px", duration: STAY_FULL + TO_HORIZ + TO_VERT },
      { to: "50%", duration: TO_CIRCLE },
    ],
    ease: easeFn,
  });

  toCircleTimer = setTimeout(() => {
    phase.value = "logo";
    requestAnimationFrame(() => {
      const root = boxRef.value;
      if (!root) return;
      const outsideEl = root.querySelector(".splash-outside") as HTMLElement | null;
      const bgEl = root.querySelector(".splash-bg-container") as HTMLElement | null;
      const imgEl = root.querySelector(".splash-logo-container_img") as HTMLElement | null;
      if (bgEl) {
        const BASE_W = 1920;
        const BASE_H = 1080;
        const scale = Math.min(window.innerWidth / BASE_W, window.innerHeight / BASE_H);
        const sz = (n: number) => `${Math.round(n * scale)}px`;
        bgEl.style.width = sz(410);
        bgEl.style.height = sz(410);
        if (outsideEl) {
          // 让外圈初始与内圈一致，后续再放大
          outsideEl.style.width = sz(410);
          outsideEl.style.height = sz(410);
        }
        bgEl.style.transformOrigin = "center";
        bgEl.style.transform = "scale(0.8)";
        animate(bgEl, {
          transform: ["scale(0.8)", "scale(1)"],
          duration: 500,
          easing: "easeOutCubic",
          fill: "forwards",
        });
      }
      if (imgEl) {
        imgEl.style.transformOrigin = "center";
        imgEl.style.transform = "scale(0.8)";
        animate(imgEl, {
          transform: ["scale(0.8)", "scale(1)"],
          duration: 500,
          easing: "easeOutCubic",
          fill: "forwards",
        });
      }
    });
  }, STAY_FULL + TO_HORIZ + TO_VERT);

  animation.then(() => {
    const target = boxRef.value;
    if (!target) return;
    target.classList.remove("splash-frame", "splash-frame--animated");
    const outside = target.querySelector(".splash-outside") as HTMLElement | null;
    const greeting = target.querySelector(".splash-greeting") as HTMLElement | null;
    if (outside) {
      const cs = getComputedStyle(outside);
      const fromW = cs.width;
      const fromH = cs.height;
      const toW = sz(440);
      const toH = sz(440);
      const BASE_W = 1920;
      const BASE_H = 1080;
      const scale = Math.min(window.innerWidth / BASE_W, window.innerHeight / BASE_H);
      outside.style.borderRadius = "200px";
      setTimeout(() => {
        outside.style.paddingLeft = "15px"

        outside.style.justifyContent = "flex-start";
      }, 400);
      const growAnim = animate(outside, {
        width: [
          { from: fromW, to: toW, duration: 500 },
          { to: sz(1800), duration: 500 },
        ],
        height: [{ from: fromH, to: toH, duration: 500 }],
        ease: easeFn,
      });
      if (greeting) {
        // 设置响应式字号与字距
        greeting.style.fontSize = "150px";
        const letter = -0.6 * scale;
        greeting.style.letterSpacing = `${letter}px`;
        // 初始淡入与缩放
        greeting.style.opacity = "0";
        greeting.style.transformOrigin = "center";
        greeting.style.transform = "scale(0.9)";
        growAnim.then(() => {
          // 显式设置为左对齐，覆盖类样式的居中
          const fadeAnim = animate(greeting, {
            opacity: [0, 1],
            transform: ["scale(0.9)", "scale(1)"],
            duration: 500,
            easing: "easeOutCubic",
            fill: "forwards",
          });
          fadeAnim.then(() => {
            const chars = greeting.querySelectorAll<HTMLElement>(".splash-greeting_char");
            chars.forEach((el, index) => {
              el.style.setProperty("--char-index", String(index));
              el.classList.add("splash-greeting_char--shine");
            });
            setTimeout(() => {
              animateLogo();
            }, 900);
          });
        });
      }
    }
  });
});

onBeforeUnmount(() => {
  if (animation) animation.cancel();
  if (phaseTimer !== undefined) {
    clearTimeout(phaseTimer);
    phaseTimer = undefined;
  }
  if (toCircleTimer !== undefined) {
    clearTimeout(toCircleTimer);
    toCircleTimer = undefined;
  }
});

// 启动 logo 动画
const animateLogo = () => {
  const outsideEl = document.querySelector(".splash-outside") as HTMLElement | null;
  const logoContainer = outsideEl.getBoundingClientRect();
  const delta = (logoContainer.width - 48) / 2;
  console.log(logoContainer, 'logoContainerlogoContainer')

  animate(outsideEl, {
    width: [logoContainer.width, "48px"],
    height: [logoContainer.height, "48px"],
    "--logo-offset-y": "-55%",
    duration: 500,
  }).then(() => {
    props.stepAll.setStep(PanelStep.StartQiraTour);
  })
};
</script>


<style scoped>
.oobe-splash {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
}

.splash-box {
  position: relative;
  inset: 0;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  transform-origin: center center;
  pointer-events: none;
}

.gap {
  width: 100%;
  height: 100%;
}

.logo-container {
  width: 100%;
  height: 100%;
}

.splash-logo-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  border-radius: inherit;
  box-sizing: border-box;
  z-index: 1;
  width: 100%;
  height: 100%;
}

.splash-fade-enter-active {
  transition: opacity 500ms ease;
}

.splash-fade-enter-from {
  opacity: 0;
}

.splash-fade-enter-to {
  opacity: 1;
}

.splash-bg-container {
  border-radius: inherit;
  border: none;
  background: linear-gradient(22deg,
      rgba(255, 255, 255, 0) -194.17%,
      rgba(255, 255, 255, 0.5) -144.42%,
      rgba(255, 255, 255, 0.5) -34.6%,
      rgba(255, 255, 255, 0.22) 15.59%,
      rgba(255, 255, 255, 0.5) 65.97%,
      rgba(255, 255, 255, 0.5) 208.83%,
      rgba(255, 255, 255, 0) 231.6%);
  box-shadow: 0 0 248.645px 0 rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(43);
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-logo-container_img {
  width: 60%;
  height: 60%;
  object-fit: contain;
}

.img-centered {
  display: block;
  margin: 0 auto;
  width: 100%;
  height: 100%;
}

.splash-frame {
  position: relative;
  background: transparent;
  overflow: visible;
  isolation: isolate;
}

.splash-frame::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  border: 30px solid #e22319;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  -webkit-backdrop-filter: blur(50px);
  backdrop-filter: blur(50px);
  filter: blur(10px);
  z-index: 0;
}

.splash-frame--animated::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  z-index: 0;
  background-image: linear-gradient(90deg, #e22319 0%, #e25319 20%, #5c8dff 80%, #a079ff 100%),
    linear-gradient(90deg, #e22319 0%, #e25319 20%, #5c8dff 80%, #a079ff 100%),
    linear-gradient(0deg, #e22319 0%, #e25319 20%, #5c8dff 80%, #a079ff 100%),
    linear-gradient(0deg, #e22319 0%, #e25319 20%, #5c8dff 80%, #a079ff 100%);
  background-size: 200% 30px, 200% 30px, 30px 200%, 30px 200%;
  background-repeat: no-repeat;
  background-position: 0% 0%, 100% 100%, 0% 0%, 100% 100%;
  filter: blur(20px);
  opacity: 0.8;
  animation: border-flow 2s ease-in-out infinite;
  transform: translateZ(0);
}

.splash-outside {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  box-sizing: border-box;
  background: rgba(222, 222, 222, 0.5);
  display: flex;
  align-items: center;
  border-radius: 50%;
  justify-content: center;
  --logo-offset-y: 50%;
  top: var(--logo-offset-y);
}

.splash-greeting {
  position: absolute;
  left: 28%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 48px rgba(255, 255, 255, 0.56);
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  opacity: 0;
  pointer-events: none;
  user-select: none;
  display: inline-flex;
}

.splash-greeting_char {
  color: rgba(255, 255, 255, 0.9);
}

.splash-greeting_char--shine {
  background-image: linear-gradient(165deg,
      #e22319 0%,
      #e25319 20%,
      #5c8dff 80%,
      #a079ff 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;

  animation-name: splash-char-shine;
  animation-duration: 0.4s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
  animation-delay: calc(var(--char-index) * 0.05s);
}


@keyframes splash-char-shine {
  0% {
    background-position: 0% 0%;
    color: rgba(255, 255, 255, 0.9);
    opacity: 1;
  }

  20% {
    color: transparent;
    opacity: 1;
  }

  70% {
    background-position: 100% 0%;
    color: transparent;
    opacity: 1;
  }

  100% {
    background-position: 100% 0%;
    color: rgba(255, 255, 255, 0.9);
    opacity: 1;
  }
}

@keyframes border-flow {

  0%,
  100% {
    background-position: 0% 0%, 100% 100%, 0% 0%, 100% 100%;
  }

  50% {
    background-position: 100% 0%, 0% 100%, 0% 100%, 100% 0%;
  }
}
</style>
