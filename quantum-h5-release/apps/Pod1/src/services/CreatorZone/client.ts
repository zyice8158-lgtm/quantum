import { POST } from './http'

export const windowMin = async () => {
  return await POST('https://app/mainwindow/min', {}, {}, false)
}

export const windowMax = async () => {
  return await POST('https://app/mainwindow/max', {}, {}, false)
}

export const windowClose = async () => {
  return await POST('https://app/mainwindow/close', {}, {}, false)
}
