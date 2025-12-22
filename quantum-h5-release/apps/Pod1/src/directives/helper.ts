const setEleAttributes = (el, binding) => {
  const {
    tabIndex = 1,
    role,
    title,
    ariaLabel,
    ariaChecked,
    ariaHaspopup,
    ariaExpanded,
    ariaSelected,
    ariaModal,
    ariaHidden,
    ariaRestricted,
    attributes = {},
  } = binding.value();

  tabIndex && el.setAttribute("tabindex", tabIndex);

  role !== undefined && el.setAttribute("role", role);

  title !== undefined && el.setAttribute("title", title);
  ariaLabel !== undefined && el.setAttribute("aria-label", ariaLabel);

  ariaChecked !== undefined && el.setAttribute("aria-checked", ariaChecked);

  ariaHaspopup !== undefined && el.setAttribute("aria-haspopup", ariaHaspopup);
  ariaExpanded !== undefined && el.setAttribute("aria-expanded", ariaExpanded);
  ariaSelected !== undefined && el.setAttribute("aria-selected", ariaSelected);

  ariaModal !== undefined && el.setAttribute("aria-modal", ariaModal);

  if (ariaHidden !== undefined) {
    el.setAttribute("aria-hidden", ariaHidden);

    if (ariaHidden) {
      el.setAttribute("inert", ariaHidden);
    } else {
      el.removeAttribute("inert", ariaHidden);
    }
  }

  ariaRestricted !== undefined && el.setAttribute("aria-restricted", ariaRestricted);

  Object.keys(attributes).forEach((key) => {
    el.setAttribute(key, attributes[key]);
  });
};

const bindEvents = (el, binding) => {
  const {
    elId,
    focus = () => {},
    blur = () => {},
    click = () => {},
    left = () => {},
    right = () => {},
  } = binding.value();

  el.addEventListener("focus", (e) => {
    focus({ el, e });
  });
  el.addEventListener("blur", (e) => {
    blur({ el, e });
  });

  el.addEventListener("keydown", (e) => {
    if (["TEXTAREA", "INPUT"].includes(el.nodeName)) {
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        if (el.selectionStart !== 0) {
          return;
        }
      }

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        if (el.selectionStart !== el.value.length) {
          return;
        }
      }
    }

    if (e.key === "Enter") {
      click({ el, e });

      window.setTimeout(() => {
        if (elId) {
          if (window.document.querySelector(elId)?.querySelectorAll("[tabindex]")?.[0]) {
            window.document.querySelector(elId)?.querySelectorAll("[tabindex]")?.[0]?.focus();
          } else {
            window.document.querySelector(elId)?.focus();
          }
        }
      }, 0);
    }

    if (e.key === "Tab") {
      window.setTimeout(() => {
        if (!el.contains(window.document.querySelector(":focus"))) {
          if (el.getAttribute("aria-restricted") === "true") {
            el.querySelectorAll("[tabindex]")?.[0]?.focus();
          }
        }
      }, 0);
    }

    if (e.key === "ArrowLeft") {
      left({ el, e });
    }

    if (e.key === "ArrowRight") {
      right({ el, e });
    }
  });

  el.addEventListener("click", (e) => {
    click({ el, e });
  });
};

const helper = {
  mounted(el, binding) {
    setEleAttributes(el, binding);
    bindEvents(el, binding);
  },
  updated(el, binding) {
    setEleAttributes(el, binding);
  },
};

export default helper;
