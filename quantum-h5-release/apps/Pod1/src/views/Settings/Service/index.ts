import { getConfig, saveConfig } from '@libs/service'

import { Reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
export const settingHooks = (key: string, target: Record<string, string | number | boolean>) => {
    const route = useRoute()
    const setSettings = async (params: Record<string, Record<string, string | number | boolean>>) => {
        const keys = Object.keys(params)
        const Data: Record<string, unknown> = {

        }
        keys.forEach(item => {
            const res = []
            for (const Key in params[item]) {
                res.push({
                    Key,
                    Value: String(params[item][Key]),
                    LocalType: 2
                })
            }
            Data[item] = res
        })
        try {

            const res = await saveConfig({ Data: JSON.stringify(Data) })
            return res
        } catch (error) {
            console.error(error);

        }
        return false
    }
    const getSetting = async () => {
        try {
            const res = await getConfig()
            console.log('getSetting', res);
            const resData = res.data.Data
            const data = {} as Record<string, string | number | boolean>
            const keys = Object.keys(resData)
            keys.forEach(key => {
                //  data[key] = 
                (resData[key]).forEach(item => {
                    if (item.Value === 'true') {
                        data[item.Key] = true
                    } else if (item.Value === 'false') {
                        data[item.Key] = false
                    } else {

                        data[item.Key] = item.Value
                    }
                })

            })
            console.log(data);


            return data

        } catch (error) {

            console.error(error);
        }
        return false
    }
    watch(target, () => {
        // const params = { [key]: target }
        setSettings({ [key]: target })
    }, { deep: true })
    watch(route, () => {
        // const params = { [key]: target }
        const { anchor } = route.params
        if (anchor) {
            const el = document.getElementById(anchor as string)
            el?.scrollIntoView({ behavior: 'smooth' })

        }
        // console.log('anchor', anchor);

    },)
    getSetting().then(res => {
        Object.assign(target, res)
    })
    return {
        setSettings,
        getSetting
    }
}