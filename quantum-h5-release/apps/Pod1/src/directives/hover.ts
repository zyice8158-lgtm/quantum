const hover = {
  mounted(el, binding) {
    const { start = () => {}, cancel = () => {} } = binding.value()

    const events = {
      start: (e) => {
        if (e.type === 'mouseenter' || e.type === 'touchstart') {
          start(e)
        }
      },
      cancel: (e) => {
        cancel(e)
      },
    }

    if (binding.modifiers.mouse) {
      el.addEventListener('mouseenter', events.start)

      el.addEventListener('mouseleave', events.cancel)
    }

    if (binding.modifiers.touch) {
      el.addEventListener('touchstart', events.start)

      el.addEventListener('touchend', events.cancel)
      el.addEventListener('touchcancel', events.cancel)
    }
  },
}

export default hover
