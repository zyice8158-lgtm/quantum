import { getConfig, saveConfig } from "@libs/service";
import { reactive, watch } from "vue";

export const SettingStore = reactive({
  generalData: {
    language: 'en-US',
    saveAllRecordingsToNotes: true,
    floatingBubble: true,
    AIKey: true,
    wakeWord: true,
    voiceTone: true,
    interactionMode: true
  },
  dataControl: {
    syncData: true,
    UseOnAnyNetwork: true,
    FloatingBubble: true,
    AIKey: true,
    WakeWord: true,
    VoiceTone: true,
    InteractionMode: true
  }
})

type SettingConfigKey = keyof typeof SettingStore
export const getSettingConfig = async () => {
  try {
    const { data } = await getConfig()
    const { Data } = data || {}
    for (const key in Data) {
      const config: any = {}
      Data[key].forEach(item => {
        if (item.Value === 'true') {
          config[item.Key] = true
        } else if (item.Value === 'false') {
          config[item.Key] = false
        } else if(item.Value === 'undefined'){
          config[item.Key] = undefined
        } else {
          config[item.Key] = item.Value
        }
      })
      if(SettingStore[key as SettingConfigKey]){
        Object.assign(SettingStore[key as SettingConfigKey], config)
      }
    }
  } catch (e) {
    console.error('Error getSettingConfig:', e)
  }
}

const transformData = (data: any) => {
  const reqData: any = {}
  for (const key in data) {
    reqData[key] = []
    const item = data[key]
    for (const Key in item) {
      reqData[key].push({
        Key,
        Value: String(item[Key]),
        LocalType: 2
      })
    }
  }
  return reqData
}

export const setSettingsConfig = async (key: SettingConfigKey) => {
  try {
    const res = await saveConfig({ Data: JSON.stringify(transformData({ [key]: SettingStore[key] })) })
    return res
  } catch (error) {
    console.error(error);
  }
  return false
}


export const syncSettingsAllConfig = async () => {
  await getSettingConfig()
  try {
    const res = await saveConfig({ Data: JSON.stringify(transformData(SettingStore)) })
    return res
  } catch (error) {
    console.error(error);
  }
  return false
}

Object.keys(SettingStore).forEach((key: SettingConfigKey) => {
  watch(() => SettingStore[key], () => {
    setSettingsConfig(key)
  }, { deep: true })
})
