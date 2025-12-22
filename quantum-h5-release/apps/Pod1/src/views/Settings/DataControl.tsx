import { computed, defineComponent, reactive, ref } from 'vue';
import { useLocale } from '@/hooks/i18n'
import SearchHeader from './comps/SearchHeader'
import Card from './comps/Card';
import { IconAccount, IconClock, IconDevices, IconEarth, IconMic, IconRecord, IconSyncData } from '@quantum/icons';
import SettingItem from './comps/SettingItem';
import RadioButton from '@libs/p-comps/volt/RadioButton.vue';
import Input from '@libs/p-comps/Input';
import Button from '@libs/p-comps/volt/Button.vue';
import { ChatHistoryAll } from './comps/Chat';
import { SettingStore } from '@/store/settings';
import { getPreferences, setPreferences } from '@libs/service';



export default defineComponent({
    name: 'DataControl',
    setup() {
        const { t, locale } = useLocale()

const getSyncData= async ()=>{
    const res = await getPreferences({ Data: {} });
    console.log('getSyncData',res);
    try {
        const data= JSON.parse(res.data.Data.Text as string);
        console.log('getSyncData',data);
        SettingStore.dataControl.syncData=data.prefs.synchronizationEnabled
    } catch (error) {
        console.error(error);
        
    }
    
}
const setSyncData= async (data:boolean)=>{
    const res = await setPreferences({Data:{synchronizationEnabled:data} });
    console.log('setSyncData',res);
    
}
const displayData=computed(()=>{
    return{
        syncData:{
            title:t('settings.dataControl.syncData'),
            subTitle:t('settings.dataControl.syncDataSubTitle'),
            sync:t('settings.dataControl.sync'),

        },
        UseOnAnyNetwork:{
            title:t('settings.dataControl.useOnAnyNetwork'),
            subTitle:t('settings.dataControl.useOnAnyNetworkSubTitle'),
            UseOnAnyNetwork:t('settings.dataControl.useOnAnyNetwork'),
        },
        ChatHistory:{
            title:t('settings.dataControl.chatHistory'),
            // subTitle:t('settings.dataControl.useOnAnyNetworkSubTitle'),
            FloatingBubble:t('settings.dataControl.floatingBubble'),
            FloatingBubbleSubTitle:t('settings.dataControl.floatingBubbleSubTitle'),
            AIKey:t('settings.dataControl.AIKey'),
            AIKeySubTitle:t('settings.dataControl.AIKeySubTitle'),
            WakeWord:t('settings.dataControl.wakeWord'),
            WakeWordSubTitle:t('settings.dataControl.wakeWordSubTitle'),
        },
        FileSavingPath:{
            title:t('settings.dataControl.fileSavingPath'),
            Path:t('settings.dataControl.path'),
            Change:t('settings.dataControl.change'),

        },
        }
    })

getSyncData()

        return () => (
            <div class='overflow-auto' >
                <Card id='syncData'  title={displayData.value.syncData.title} subTitle={displayData.value.syncData.subTitle} class='mb-[24px]' icon={IconSyncData}>

                        <SettingItem title={displayData.value.syncData.sync} onChange={(item: { title: string; val: boolean })=>setSyncData(item.val)}   v-model:val={SettingStore.dataControl.syncData} />

                </Card>
                {/* <Card id='useOnAnyNetwork' title={displayData.value.UseOnAnyNetwork.title} subTitle={displayData.value.UseOnAnyNetwork.subTitle} icon={IconClock} class='mb-[24px]'>

                    <SettingItem title={displayData.value.UseOnAnyNetwork.UseOnAnyNetwork}   v-model:val={SettingStore.dataControlData.UseOnAnyNetwork} />
               </Card> */}
                <Card id='chatHistory' title={displayData.value.ChatHistory.title}  icon={IconRecord} class='mb-[24px]'>

                  <ChatHistoryAll/>
                </Card>
                {/* <Card id='fileSavingPath' title={displayData.value.FileSavingPath.title}  icon={IconMic} class='mb-[24px]'>

                    <SettingItem title='' isColumn={true} >

                        <div>
                                <div  class={hClass}>
                                    {displayData.value.FileSavingPath.Path}
                                </div>
                                <div class="flex items-center gap-[8px] w-full">
                                 <Input class='w-full' />
                                 <Button class='mt-[8px]'>{displayData.value.FileSavingPath.Change}</Button>
                                </div>



                        </div>
                    </SettingItem>

               </Card> */}
            </div>
        );
    }
});
