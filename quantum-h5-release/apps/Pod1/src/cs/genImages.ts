import { MessageStatus, GenBtnStatus } from '@/constant'

export const localBaseModel = {
  taskId: 0,
  status: GenBtnStatus.INIT,
  statusChangeCallbacks: [],
  readyCallbacks: [],
  runningCallbacks: [],
  init: null,
  uninit: null,
  create: null,
  cancel: null,
  watch: null,
}

const setLocalBaseModelStatus = (value) => {
  localBaseModel.status = value
  localBaseModel.statusChangeCallbacks.forEach((callback) => {
    callback(value)
  })
}

localBaseModel.init = ({ statusChangeCallback, readyCallback }) => {
  if (statusChangeCallback) {
    localBaseModel.statusChangeCallbacks.push(statusChangeCallback)
  }

  if (readyCallback) {
    localBaseModel.readyCallbacks.push(readyCallback)
  }
}

localBaseModel.uninit = ({ statusChangeCallback, readyCallback }) => {
  if (statusChangeCallback) {
    localBaseModel.statusChangeCallbacks = localBaseModel.statusChangeCallbacks.filter(
      (callback) => callback !== statusChangeCallback
    )
  }

  if (readyCallback) {
    localBaseModel.readyCallbacks = localBaseModel.readyCallbacks.filter(
      (callback) => callback !== readyCallback
    )
  }
}

localBaseModel.create = ({
  taskId,
  prompt,
  stylePrompt,
  width,
  height,
  cfgScale,
  steps,
  seed,
  useT5TextEncoder,
  referenceImageUrl,
  imgNumber,
  runningCallback,
}: {
  taskId: number
  prompt: string
  stylePrompt?: string
  width: number
  height: number
  cfgScale?: number
  steps?: number
  seed?: number
  useT5TextEncoder?: number
  referenceImageUrl?: string
  imgNumber?: number
  runningCallback?: Function
}) => {
  if (localBaseModel.status !== GenBtnStatus.INIT) {
    return
  }

  const params = {
    prompt,
    stylePrompt: stylePrompt || '',
    uiNegativePrompt: '',
    negativePrompt: 'None',
    strength: 0.54,
    outputWidth: width,
    outputHeight: height,
    cfgScale: cfgScale || 2.5,
    steps: steps || 8,
    seed: seed || 0,
    verbose: 0,
    imgNumber: imgNumber || 2,
    createType: 0,
    useT5TextEncoder: useT5TextEncoder || 0,

    controlNetImgPath: undefined,
    controlNetType: undefined,
    controlNetstrength: undefined,

    initImg: undefined,
  }

  if (referenceImageUrl) {
    params.initImg = referenceImageUrl
  }

  if (runningCallback) {
    localBaseModel.runningCallbacks.push(runningCallback)
  }

  return new Promise((resolve) => {
    const callback = (e) => {
      window.removeEventListener('cz.image.create', callback)

      localBaseModel.runningCallbacks = localBaseModel.runningCallbacks.filter(
        (callback) => callback !== runningCallback
      )

      resolve({
        ...e.detail,
        callback: () => {
          localBaseModel.taskId = 0
          setLocalBaseModelStatus(GenBtnStatus.INIT)
        },
      })
    }

    window.addEventListener('cz.image.create', callback)

    localBaseModel.taskId = taskId
    setLocalBaseModelStatus(GenBtnStatus.PREPARING)

    window.postMessage({
      sessionID: 101,
      actionID: taskId,
      actionType: '0',
      cmd: 'cz.image.create',
      data: JSON.stringify(params),
    })
  })
}

localBaseModel.cancel = () => {
  if (localBaseModel.status !== GenBtnStatus.RUNNING) {
    return
  }

  return new Promise((resolve) => {
    const callback = (e) => {
      window.removeEventListener('cz.image.cancel', callback)

      resolve({
        ...e.detail,
        callback: () => {
          localBaseModel.taskId = 0
          setLocalBaseModelStatus(GenBtnStatus.INIT)
        },
      })
    }

    window.addEventListener('cz.image.cancel', callback)

    setLocalBaseModelStatus(GenBtnStatus.CANCELLING)

    // 取消生图任务
    window.postMessage({
      actionID: localBaseModel.taskId,
      cmd: 'cz.image.cancel',
    })
  })
}

localBaseModel.watch = (_, message, data) => {
  if (message.cmd === 'cz.image.create') {
    if (message.status === MessageStatus.PLUGIN_IMAGE_ERROR_TASK_RUNING) {
      localBaseModel.runningCallbacks.forEach((callback) => {
        callback({
          status: message.status,
          actionID: message?.actionID,
          data,
        })
      })
    } else {
      window.dispatchEvent(
        new CustomEvent('cz.image.create', {
          detail: {
            status: message.status,
            actionID: message?.actionID,
            data,
          },
        })
      )
    }
  } else if (message.cmd === 'cz.isshow.button') {
    // rt 通知前端任务创建成功

    setLocalBaseModelStatus(GenBtnStatus.RUNNING)
    localBaseModel.readyCallbacks.forEach((callback) => {
      callback()
    })
  } else if (message.cmd === 'cz.image.cancel') {
    // 任务取消成功

    window.dispatchEvent(
      new CustomEvent('cz.image.cancel', {
        detail: {
          status: message.status,
          actionID: message?.actionID,
          data,
        },
      })
    )

    window.dispatchEvent(
      new CustomEvent('cz.image.create', {
        detail: {
          dispatcher: 'cz.image.cancel',
          status: message.status,
          actionID: message?.actionID,
          data,
        },
      })
    )
  } else if (message.cmd === 'ipc.not.connected') {
    window.dispatchEvent(
      new CustomEvent('cz.image.create', {
        detail: {
          status: message.status,
          actionID: message?.actionID,
          data,
        },
      })
    )
  }
}

window.localBaseModel = localBaseModel
