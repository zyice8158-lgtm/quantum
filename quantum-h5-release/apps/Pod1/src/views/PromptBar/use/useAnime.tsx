import { BarMode, BarStore, start2IdleTimer } from "@/store/bar";
import { ChatWinStore } from "@/store/chatWin";
import { isRecordButtonActive, isShowDisclaimer, payAttentionStore, RecordingButtonStatus } from "@/store/payAttention";
import { SuggestionStore } from "@/store/suggestion";
import { updataAcrylic, updateWindowSize } from "@/store/window";
import { apiWinDisplayHalo } from "@libs/service";
import { awaitTime, nextAnimationFrame } from "@quantum/use";
import { animate, createTimeline, cubicBezier } from "animejs";
import { nextTick, reactive, ref } from "vue";


export const lastWinSize = {
  width: 600,
};
export const useBarAnime = () => {
  const idleDuration = 300 * 1;
  const animeDone = ref(true);
  const idleLeave = async (el: Element) => {
    const idleBorderEl = el.querySelector(".idle-border");
    el.classList.add("in-leave");
    try {
      await updataAcrylic({
        Name: "Main",
        Width: 0, // 宽度 | 结束宽度
        Height: 0, // 高度 | 结束高度
        PointX: 0, // X坐标
        PointY: 0, // Y坐标
        CornerRadius: 32, // 圆角
      });
      let windowHieght = 98;

      if (isShowDisclaimer.value) {
        windowHieght += 53
      } else if (payAttentionStore.showMeetingDialog && !isRecordButtonActive.value) {
        windowHieght += 74
      } else if (!ChatWinStore.view && payAttentionStore.recordingButtonStatus === RecordingButtonStatus.Default && !payAttentionStore.showMeetingDialog && (SuggestionStore.Suggestion.length || SuggestionStore.Contextual.length)) {
        windowHieght += 53
      }
      await updateWindowSize({
        Width: lastWinSize.width,
        Height: windowHieght,
      });
      await nextAnimationFrame()
      const idleBorderClientRect = idleBorderEl.getBoundingClientRect();

      await updataAcrylic({
        Name: "Main",
        Width: 4, // 宽度 | 结束宽度
        Height: 40, // 高度 | 结束高度
        PointX: idleBorderClientRect.left + idleBorderClientRect.width / 2 - 2, // X坐标
        PointY: idleBorderClientRect.top + idleBorderClientRect.height / 2 - 20, // Y坐标
        CornerRadius: 32, // 圆角
        StartWidth: idleBorderEl.clientWidth, // 动画起始宽度
        StartHeight: idleBorderEl.clientHeight, // 启动高度
        TransitionDuration: idleDuration, // 动画时长
        TransformOrigin: [0.5, 0.5], // 变换原点
        TransitionTiming: [0.84, 0.0, 0.16, 1.0], // 缓动曲线
      });
    } catch (_) { }
    return createTimeline().add(idleBorderEl, {
      duration: idleDuration,
      easing: cubicBezier(0.84, 0.0, 0.16, 1.0),
      width: [idleBorderEl.clientWidth, 4],
      height: [idleBorderEl.clientHeight, 40],
      backgroundColor: ["#E1251B00", "#E1251B"],
      borderColor: ["#E1251B00", "#E1251B"],
    });
  };
  const startHalo = async () => {
    const channel = new BroadcastChannel("haloForPromptBar");
    channel.postMessage({
      status: "purple",
    });
    await awaitTime(1200);
    await awaitTime(900);
    channel.postMessage({
      status: "none",
    });
    await awaitTime(500);
    try {
      apiWinDisplayHalo({
        hash: "",
        width: 0,
        height: 0,
      });
    } catch (_) { }
  };
  const barEnter = async (el: Element) => {
    const targetClientRect = el.getBoundingClientRect();
    el.classList.add("in-enter");
    try {
      await updataAcrylic({
        Name: "Main",
        Width: targetClientRect.width, // 宽度 | 结束宽度
        Height: targetClientRect.height, // 高度 | 结束高度
        PointX: targetClientRect.left, // X坐标
        PointY: targetClientRect.top, // Y坐标
        CornerRadius: 32, // 圆角
        StartWidth: 4, // 动画起始宽度
        StartHeight: targetClientRect.height, // 启动高度
        TransitionDuration: barDuration, // 动画时长
        TransformOrigin: [0.5, 0.5], // 变换原点
        TransitionTiming: [0.84, 0.0, 0.16, 1.0], // 缓动曲线
      });
    } catch (_) { }
    try {
      await apiWinDisplayHalo({
        hash: "#/for-prompt-bar",
        width: 870,
        height: 530,
      });
    } catch (_) { }
    return createTimeline()
      .add(el, {
        duration: barDuration,
        easing: cubicBezier(0.84, 0.0, 0.16, 1.0),
        width: [4, targetClientRect.width],
        backgroundColor: ["#E1251B", "#E1251B00"],
        opacity: [0, 1],
        scale: [0, 1],
      })
      .then(() => {
        startHalo();
        return Promise.resolve(null);
      });
  };

  const barDuration = 400;
  const barLeave = async (el: Element) => {
    const elClientRect = el.getBoundingClientRect();
    try {
      await updataAcrylic({
        Name: "Main",
        Width: 4, // 宽度 | 结束宽度
        Height: 40, // 高度 | 结束高度
        PointX: elClientRect.left + elClientRect.width / 2 - 2, // X坐标
        PointY: elClientRect.top + elClientRect.height / 2 - 20, // Y坐标
        CornerRadius: 32, // 圆角
        StartWidth: elClientRect.width, // 动画起始宽度
        StartHeight: elClientRect.height, // 启动高度
        TransitionDuration: barDuration, // 动画时长
        TransformOrigin: [0.5, 0.5], // 变换原点
        TransitionTiming: [0.84, 0.0, 0.16, 1.0], // 缓动曲线
      });
    } catch (_) { }

    el.classList.add("in-leave");
    return createTimeline()
      .sync(
        animate(el, {
          duration: barDuration,
          easing: cubicBezier(0.84, 0.0, 0.16, 1.0),
          width: [elClientRect.width, 4],
          height: [elClientRect.height, 40],
          backgroundColor: ["#E1251B00", "#E1251B"],
        })
      )
      .sync(
        animate(el.children[0], {
          opacity: [1, 0.2],
          duration: barDuration,
        }),
        `-=${barDuration}`
      )
      .then(() => {
        return Promise.resolve(null);
      });
  };
  const idleEnter = async (el: Element) => {
    const idleBorderEl = el.querySelector(".idle-border");
    const idleAcrylicEl = el.querySelector(".acrylic-view");
    const elClientRect = idleAcrylicEl.getBoundingClientRect();
    el.classList.add("in-enter");
    try {
      await updataAcrylic({
        Name: "Main",
        Width: elClientRect.width, // 宽度 | 结束宽度
        Height: elClientRect.height, // 高度 | 结束高度
        PointX: elClientRect.left, // X坐标
        PointY: elClientRect.top, // Y坐标
        CornerRadius: 15, // 圆角
        StartWidth: 4, // 动画起始宽度
        StartHeight: 40, // 启动高度
        TransitionDuration: idleDuration, // 动画时长
        TransformOrigin: [0.5, 0.5], // 变换原点
        TransitionTiming: [0.84, 0.0, 0.16, 1.0], // 缓动曲线
      });
    } catch (_) { }

    return createTimeline()
      .add(idleBorderEl, {
        duration: idleDuration,
        easing: cubicBezier(0.84, 0.0, 0.16, 1.0),
        width: [4, elClientRect.width],
        height: [40, elClientRect.height],
        backgroundColor: ["#E1251B", "#E1251B00"],
        borderColor: ["#E1251B", "#E1251B00"],
      })
      .then(async () => {
        idleBorderEl.removeAttribute("style");
        idleBorderEl.removeAttribute("easing");
        return Promise.resolve(null);
      });
  };

  const onEnter = (el: Element, done: () => void) => {
    const anime = BarStore.barMode == BarMode.BAR ? barEnter(el) : idleEnter(el);
    anime.then(async () => {
      el.classList.remove("in-enter");
      el.removeAttribute("style");
      el.removeAttribute("easing");
      await nextTick();
      done();
      await nextTick();
      await awaitTime(100)
      animeDone.value = true;
    });
  };
  const onLeave = async (el: Element, done: () => void) => {
    animeDone.value = false;
    const anime = BarStore.barMode == BarMode.BAR ? idleLeave(el) : barLeave(el);
    anime.then(() => {
      done();
      nextTick(() => {
        el.classList.remove("in-leave");
      });
    });
  };
  return reactive({ onEnter, onLeave, animeDone });
};

export const useMinimizeAnime = () => {
  const animeDone = ref(true);
  const onEnter = (el: HTMLElement, done: () => void) => {
    animeDone.value = false;
    animate(el, {
      duration: 400,
      easing: cubicBezier(0.32, 0.94, 0.6, 1.0),
      opacity: [0, 1],
      translateX: [-20, 0],
    }).then(() => {
      done();
      el.removeAttribute("style");
      el.removeAttribute("easing");
      el.removeAttribute("transform");
      animeDone.value = true;
    });
  };
  const onLeave = (el: Element, done: () => void) => {
    animate(el, {
      duration: 400,
      easing: cubicBezier(0.32, 0.94, 0.6, 1.0),
      opacity: [1, 0],
      translateX: [0, -20],
    }).then(() => {
      done();
    });
  };
  return reactive({ onEnter, onLeave, animeDone });
};

export const useSuggestionAnime = () => {
  const animeDone = ref(true);
  const onEnter = (el: HTMLElement, done: () => void) => {
    animeDone.value = false;
    const children = [...el.children] as HTMLElement[];
    children.forEach((itemEl) => {
      itemEl.style.opacity = "0";
      itemEl.style.transform = "translateY(-20px)";
    });
    let timeline = createTimeline();
    children.forEach((itemEl) => {
      timeline.add(itemEl, {
        duration: 400,
        easing: cubicBezier(0.0, 0.56, 0.46, 1.0),
        opacity: [0, 1],
        translateY: [-20, 0],
        delay: 150,
      });
    });

    timeline.then(() => {
      done();
      children.forEach((itemEl) => {
        itemEl.removeAttribute("style");
        itemEl.removeAttribute("easing");
      });
      animeDone.value = true;
    });
  };
  const onLeave = (el: HTMLElement, done: () => void) => {
    const ClientRect = el.getBoundingClientRect();
    el.style.position = "fixed";
    el.style.top = `${ClientRect.top}px`;
    el.style.left = `${ClientRect.left}px`;
    const children = [...el.children] as HTMLElement[];
    let timeline = createTimeline();
    children.forEach((itemEl) => {
      timeline.add(itemEl, {
        duration: 400,
        easing: cubicBezier(0.0, 0.56, 0.46, 1.0),
        opacity: [1, 0],
        translateY: [0, -20],
      });
    });

    timeline.then(() => {
      done();
    });
  };
  return reactive({ onEnter, onLeave, animeDone });
};

export const useFileAreaAnime = () => {
  const animeDone = ref(true);
  const onEnter = (el: HTMLElement, done: () => void) => {
    animeDone.value = false;
    const fileAreaEl = el.children[0];
    console.log(fileAreaEl, 'fileAreaEl')
    animate(fileAreaEl, {
      duration: 800,
      easing: cubicBezier(0.32, 0.94, 0.6, 1.0),
      height: [0, fileAreaEl.getBoundingClientRect().height],
      opacity: [0, 1],
    }).then(() => {
      done();
    });
  };
  const onLeave = (el: HTMLElement, done: () => void) => {
    const fileAreaEl = el.children[0];
    animate(fileAreaEl, {
      duration: 800,
      easing: cubicBezier(0.32, 0.94, 0.6, 1.0),
      height: [fileAreaEl.getBoundingClientRect().height, 0],
      opacity: [1, 0],
    }).then(() => {
      done();
    });
  };
  return reactive({ onEnter, onLeave, animeDone })
}
