<template>
    <div class="cmu-settings-wrapper">
        <div class="cmu-settings-content mt-[24px]">
            <div class="clear-notifications flex align-center justify-between pl-[8px] mb-[34px]">
                <div class="clear-summarized">
                    <div class="clear-summarized-title font-bold">Clear notifications</div>
                    <div class="clear-summarized-desc">Clear notifications after it has been summarized</div>
                </div>
                <ToggleSwitch v-model="isClearNotification" @click="toggleNotification"/>
            </div>
            <div class="summarize-notification pl-[8px]">
                <div class="summarize-notification-title font-bold">Summarization app list</div>
                <div class="summarize-notification-content font-normal mt-[8px]"> Define what apps you want to have notifications summarize</div>
            </div>
            <div class="flex items-center pl-[8px]">
                <span class="mr-[12px]">Enable all</span>
                <ToggleSwitch v-model="enabledAll" @click="toggleAllSwitch"/>
            </div>
            <div class="cmu-device-card">
                <div class="cmu-device-info flex items-center">
                    <IconDeviceInfo class="w-[20px] h-[20px]"/><span class="ml-[26px]">{{ equipmentModel }}</span>
                </div>
                <div class="card-items-container">
                    <div class="cmu-device-card-item" v-for="item in deviceCmuItems" :key="item.title">
                        <div class="cmu-device-card-item-icon">
                            <img :src="item.Icon" class="w-[24px] h-[24px]"/>
                        </div>
                        <div class="cmu-device-card-item-title">{{ item.Name }}</div>
                        <div class="cmu-device-card-item-switch">
                            <ToggleSwitch v-model="item.IsEnabled" @click="toggleSwitch(item)"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import ToggleSwitch from '@libs/p-comps/volt/ToggleSwitch.vue';
import { useToast } from "primevue/usetoast";
import { computed, onMounted, ref, watch } from 'vue';
import { getCatchMeUpSettings, setNotificationAppEnable, clearNotification, getPCName } from '@libs/service/fetch/catchMeUp.ts';
import { IconDeviceInfo, IconRefresh } from '@quantum/icons'
const accordionItems = ref(['0', '1']);
const isExpandAll = ref(false);
const toast = useToast();
const deviceCmuItems = ref([]);
const isClearNotification = ref(false);
const equipmentModel = ref('');
const enabledAll = computed(() => {
    return deviceCmuItems.value.every((item) => item.IsEnabled);
});
onMounted(() => {
    getCatchMeUp();
    getPcInfo();
});
watch(isExpandAll, (isExpandAllVal) => {
    if (isExpandAllVal) {
        accordionItems.value = [];
    } else {
        accordionItems.value = ['0', '1'];
    }
});
const getCatchMeUp = async () => {
try {
        const res = await getCatchMeUpSettings({
           Data: {
              async: true,
           }
        });
        console.log('getCatchMeUp------', res);
        const response = res.data;
        deviceCmuItems.value = response;
    } catch (error) {
        console.log('error', error);
    }
     
}
const getPcInfo = async () => {
    try {
        const res = await getPCName();
        console.log('getPCName------', res);
        equipmentModel.value = res.data.Result;
    } catch (error) {
        console.log('error', error);
    }
     
}
const toggleAllSwitch = () => {
    const deviceItems = deviceCmuItems.value.filter((item) => {
        return item.IsEnabled === enabledAll.value;
    });
    const resPromises = deviceItems.map(async (item) => {
        await toggleSwitch(item);
        item.IsEnabled = !item.IsEnabled;
    });
    Promise.all(resPromises).then(() => {
        toast.add({
            severity: !enabledAll.value ? "info" : "success",
            summary: !enabledAll.value ? "Disabled Success" : "Enabled Success",
            life: 2000,
        });
    });
}
const toggleSwitch = async (item) => {
    const res = await setNotificationAppEnable({ Data: { Id: item.Id, IsEnabled: !item.IsEnabled } });
    console.log('setNotificationAppEnable------', res);
}
const toggleNotification = async () => {
    const res = await clearNotification({ Data: { "Type": "CMUClearNotification" } });
    console.log('toggleNotification--------', res);
    toast.add({ detail: res.Result, group: 'br', life: 3000 });
}
</script>
<style lang="less" scoped>
.cmu-settings-wrapper {
    .cmu-settings-content {
        .clear-notifications {
            .clear-summarized {
                &-title {
                    color : var(--color-text-on-surface);
                }
                &-desc {
                    color: var(--color-text-on-surface-variant);
                    font-size: 12px;
                }
            }
        }
        .summarize-notification {
            padding-bottom: 19px;
            &-title {
                color: var(--color--summarize-title-color);
                font-size: 16px;
            }
            &-content {
                font-size: 12px;
                color: var(--color-text-on-surface-variant);
            }
        }
        .cmu-device-card {
            margin-top: 19px;
            border-radius: 24px;
            background-color: var(--color-surface-container);
            border-bottom: none;
            .cmu-device-info {
                color: var(--color-text-on-surface);
                font-weight: 500;
                font-size: 16px;
                height: 40px;
                padding-left: 20px;
                margin-top: 8px;
                svg {
                    color: var(--color-text-on-surface);
                }
            }
            .card-items-container {
                display: flex;
                flex-wrap: wrap;
                padding: 8px 12px 16px 12px;
                .cmu-device-card-item {
                    border-radius: 16px;
                    padding: 4px 12px;
                    width: calc(50% - 12px);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    &-icon {
                        > img {
                            width: 32px;
                            height: 32px;
                        }
                    }
                    &-title {
                        font-size: 16px;
                        color: var(--color-text-on-surface);
                        flex: 1;
                        margin-left: 20px;
                        font-weight: 500;
                    }
                    &:nth-of-type(odd) {
                        margin-right: 24px;
                    }
                }
            }
        }
    }
}
</style>
