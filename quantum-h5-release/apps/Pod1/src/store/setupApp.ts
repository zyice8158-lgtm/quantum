import { apiWinIsFirstStart } from "@libs/service"
import { EventBus } from "@quantum/use"

let apiWinIsFirstStartPromise: Promise<any>
export const checkSetupApp = async (fn?: any) => {
  if (!apiWinIsFirstStartPromise) {
    apiWinIsFirstStartPromise = apiWinIsFirstStart()
    apiWinIsFirstStartPromise.then((isFirstStart) => {
      EventBus.emit('SetupApp', isFirstStart)
    })
  }
  try {
    const isFirstStart = await apiWinIsFirstStartPromise
    fn?.(isFirstStart)
  } catch (error) {

  }
}
