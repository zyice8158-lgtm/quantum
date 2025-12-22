const queue: object[] = [];
const waiting: ((value: object) => void)[] = [];
const bus = new EventTarget();

function post(data: object) {
  parent?.postMessage(data, '*');
}

function setRemUnit() {
  const baseWidth = import.meta.env.DESIGN_DRAFT_WIDTH; // 设计稿宽度
  const baseFontSize = baseWidth / 10; // 基准字体大小
  const clientWidth = document.documentElement.clientWidth

  if (clientWidth < baseWidth) {
    const rem = document.documentElement.clientWidth / baseWidth * baseFontSize;
    document.documentElement.style.fontSize = `${rem}px`;
  } else {
    document.documentElement.style.fontSize = `${baseFontSize}px`;
  }
}

window.addEventListener('load', () => {
  setRemUnit()

  const loading = document.getElementById('loading')

  window.topTunnel.emit({
    type: 'ui-size-change',
    payload: {
      height: loading ? loading.scrollHeight : 25
    }
  })
})
window.addEventListener('resize', setRemUnit)

addEventListener('message', e => {
  let data = e.data
  if (typeof e.data === 'string') {
    try {
      data = JSON.parse(e.data)
    } catch {
      console.log('parse failed.')
    }
  }

  if (data?.type === 'ui-lifecycle-iframe-render-data') {
    const p = data?.payload?.renderData;

    if (!p) return // 判断open url的时候发信息给主窗口， post一个打开URL的intent

    if (waiting.length) {
      console.log('mounted send.')
      waiting.shift()?.(p)
    } else {
      console.log('before mounted send.')
      queue.push(p)
      bus.dispatchEvent(new CustomEvent('data', { detail: p }));
    }
  }
});

window.topTunnel = {
  next: () => queue.length
    ? Promise.resolve(queue.shift())
    : new Promise(r => waiting.push(r)),

  on: (fn) => {
    const h = (e: Event | null) => fn(e?.detail);
    bus.addEventListener('data', h);
    return () => bus.removeEventListener('data', h);
  },

  emit: post
};

window.topTunnel.emit({
  type: 'ui-size-change',
  payload: {
    height: 25
  }
})

import('./main.ts')
