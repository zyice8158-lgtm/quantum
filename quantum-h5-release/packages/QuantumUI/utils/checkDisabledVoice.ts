import { useStorage } from "@quantum/use";
import { onMounted, ref } from "vue";
import { WebviewMessager, getASRInitState } from '@libs/service';
import { EventBus } from '@quantum/use'
const getVoiceStorage = () => {
  const scoped = `voice_store`;
  return useStorage(scoped);
};
export const getVoiceData = async () => {
  const storage = getVoiceStorage();
  const data = await storage.get();
  return data as boolean;
};

export const setVoiceData = async (data: boolean) => {
  const storage = getVoiceStorage();
  await storage.set(data);
};
EventBus.once('SetupApp',(isFirstStart: boolean)=>{
  if(isFirstStart){
    setVoiceData(false);
  }
})

export const useDisabledVoice = (inInit: boolean = false) => {
  const isEnabledASR = ref(false);
  onMounted(async () => {
    const res = await getVoiceData() as boolean;
    if (res) {
      isEnabledASR.value = res;
      return;
    }
    if (inInit) {
      let pollCount = 0;
      const maxPollCount = 3;
      const intervalId = setInterval(async () => {
        pollCount++;
        if (pollCount > maxPollCount) {
          clearInterval(intervalId);
        }
        getASRInitState().then((res) => {
          console.log('ASRVMInit--------', res);
          const { Data: { ASRVMInit } } = res.data;
          if (ASRVMInit) {
            clearInterval(intervalId);
            isEnabledASR.value = true;
            setVoiceData(true);
            return;
          }
        });
      }, 1000);
      WebviewMessager.on('/ContextualPrompt/ASRVMInit', (data) => {
        console.log('打印数据--------', data);
        const { Data } = data;
        if (Data && Data.ASRVMInit) {
          isEnabledASR.value = true;
          setVoiceData(true);
        }
      });
      // WebviewMessager.on('/win/PromptExit', (res) => {
      //   setVoiceData(false);
      // });
    }
  });
  return {
    isEnabledASR
  }
}
export const resetVoiceStorage = () => {
  setVoiceData(false);
}
