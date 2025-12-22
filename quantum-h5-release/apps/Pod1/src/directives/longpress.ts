let pressTimer = null;
let pressEl = null;

const longpress = {
  mounted(el, binding) {
    const {
      click = () => {},
      start = () => {},
      cancel = () => {},
      startDelay = 300,
      cancelDelay = 3000,
    } = binding.value();

    let startTime = new Date().getTime();

    const events = {
      startPress: (e) => {
        if (e.type === "mousedown" || e.type === "touchstart") {
          if (pressTimer) {
            window.clearTimeout(pressTimer);

            pressTimer = null;
          }

          if (pressEl) {
            cancel({ el: pressEl, e });

            pressEl = null;
          }

          startTime = new Date().getTime();

          pressTimer = window.setTimeout(() => {
            start({ el, e });
          }, startDelay);

          pressEl = el;
        }
      },
      cancelPress: (e) => {
        if (pressTimer) {
          window.clearTimeout(pressTimer);

          pressTimer = null;
        }

        if (new Date().getTime() - startTime < startDelay) {
          if (e.type === "mouseup" || e.type === "touchend") {
            click({ el, e });
          }
        } else {
          pressTimer = window.setTimeout(() => {
            cancel({ el, e });
          }, cancelDelay);
        }
      },
    };

    if (binding.modifiers.mouse) {
      el.addEventListener("mousedown", events.startPress);

      el.addEventListener("mouseup", events.cancelPress);
    }

    if (binding.modifiers.touch) {
      el.addEventListener("touchstart", events.startPress);

      el.addEventListener("touchend", events.cancelPress);
      el.addEventListener("touchmove", events.cancelPress);
      el.addEventListener("touchcancel", events.cancelPress);
    }
  },
};

export default longpress;
