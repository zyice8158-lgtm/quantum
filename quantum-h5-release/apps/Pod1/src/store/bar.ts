import { reactive, watch } from "vue";
import { closeWindow, WindowStore, openQuantumCameraWin, changeWindowDisplayStatus, WindowIdStore } from "./window";
import { useTTSPlayer } from "@libs/service";
import { ChatWinChangeView, ChatWinStore } from '@/store/chatWin';
import { awaitTime } from "@quantum/use";
import { checkCameraAvailability } from "@/views/Live/LiveVideo";
import { useBroadcastChannel } from "@quantum/use";

export enum LiveMode {
  none,
  audio,
  camera,
  transition,
}

export enum BarMode {
  IDLE,
  BAR,
  CHAT,
}

type ActiveBtn = 'live' | 'cum' | 'record' | ''
const activeBtnDefault = () => {
  return {
    /** 直播模式 */
    liveMode: LiveMode.none,
    /** 是否正在录制 */
    recording: false,
    /** 当前处于cmu */
    cmu: false,
  }
}

export const BarStore = reactive({
  barMode: BarMode.BAR,
  activeBtn: "" as ActiveBtn,
  ...activeBtnDefault(),
  showMinimize: false,
  isAanimateChange: false,
  fileArea: false,
})

const closeCameraWin = async () => {
  if (WindowIdStore.Camera) {
    await closeWindow(WindowIdStore.Camera);
  }
}
const closeChatWin = async () => {
  if (WindowIdStore.Chat) {
    await closeWindow(WindowIdStore.Chat);
  }
}
watch(() => WindowIdStore.Camera, (id) => {
  if (!id && BarStore.liveMode === LiveMode.camera) {
    changeLiveMode(LiveMode.audio)
  }
})

export const changeBarMode = (mode: BarMode) => {
  BarStore.barMode = mode
  changeWindowDisplayStatus(mode === BarMode.IDLE ? 'idle' : 'other')
}

// ------- idle2bar------
// 在bar下空闲5分钟后切换回IDLE模式
let idleTimerId: number | null = null
export const stop2IdleTimer = () => {
  if (idleTimerId) clearTimeout(idleTimerId)
  idleTimerId = null
}
export const start2IdleTimer = () => {
  if (idleTimerId) clearTimeout(idleTimerId)
  idleTimerId = setTimeout(() => {
    changeBarMode(BarMode.IDLE)
    idleTimerId = null
    // }, 5 * 1000)
  }, 5 * 60 * 1000)
}
// ------- idle2bar------


// ------- minimize------
// 在bar下空闲4秒后关闭
let minimizeTimer: number | null = null
export const stopMinimizeTimer = () => {
  if (minimizeTimer) clearTimeout(minimizeTimer)
  minimizeTimer = null
}
export const startMinimizeTimer = () => {
  stopMinimizeTimer()
  minimizeTimer = setTimeout(() => {
    BarStore.showMinimize = false
    minimizeTimer = null
  }, 4 * 1000)
}
// ------- minimize------


export const liveChannel = useBroadcastChannel('liveChannel', { immediate: true });
liveChannel.on('closeLiveErrorCamera', () => {
  changeLiveMode(LiveMode.audio);
});
liveChannel.on('retryLiveErrorCamera', () => {
  changeLiveMode(LiveMode.camera);
});
export const changeLiveMode = async (mode: LiveMode): Promise<void> => {
  useTTSPlayer.stop();
  return new Promise(async (resolve) => {
    switch (mode) {
      case LiveMode.audio:
        await closeCameraWin();
        await ChatWinChangeView('Live');
        BarStore.liveMode = mode;
        break;
      case LiveMode.camera:
        BarStore.liveMode = LiveMode.transition;
        await ChatWinChangeView('StartCamera');
        try {
          const cameraStatus = await checkCameraAvailability();
          if (cameraStatus.available) {
            await closeChatWin();
            BarStore.liveMode = LiveMode.camera;
            await openQuantumCameraWin();
          } else {
            console.log('发送错误消息了');
            ChatWinStore.liveErrorCamera = cameraStatus.reason;
            await ChatWinChangeView('LiveErrorCamera');

          }
        } catch (error) {
          console.log("error", error);
        }
        break;
      case LiveMode.none:
        await closeCameraWin();
        BarStore.liveMode = LiveMode.transition;
        await ChatWinChangeView('EndLive');
        await awaitTime(500);
        await closeChatWin();
        BarStore.liveMode = LiveMode.none;
        break;
    }
    resolve();
  });
}
export const jumpToChatFromLiveSuggestion = async (callback: () => void) => {
  await closeCameraWin();
  BarStore.liveMode = LiveMode.transition;
  await ChatWinChangeView('EndLive');
  await awaitTime(500);
  await ChatWinChangeView('Chat');
  callback();
  BarStore.liveMode = LiveMode.none;
}

export const changeActiveBtn = (btn: ActiveBtn) => {
  BarStore.activeBtn = btn
  const btnStatus = Object.create(null)
  switch (btn) {
    case 'live':
      btnStatus.liveMode = LiveMode.audio
      break
    case 'cum':
      btnStatus.cmu = true
      break
    case 'record':
      btnStatus.recording = true
      break
  }
  Object.assign(BarStore, activeBtnDefault(), btnStatus)
  console.log('changeActiveBtn', btn, BarStore)
}
