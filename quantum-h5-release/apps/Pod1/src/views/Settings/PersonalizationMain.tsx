import { computed, defineComponent, reactive, ref, watch } from 'vue';
import { useLocale } from '@/hooks/i18n'
import SearchHeader from './comps/SearchHeader'
import Card from './comps/Card';
import { IconAccount, IconCMU, IconConnector, IconDevices, IconEarth, IconMic, IconRecord } from '@quantum/icons';
import SettingItem from './comps/SettingItem';
import RadioButton from '@libs/p-comps/volt/RadioButton.vue';
// import { personalizedContent } from '@/constant';
import { settingHooks } from './Service';
// import ComingSoon from '@libs/p-comps/ComingSoon';
import Tools from './comps/Tools'
import CatchMeUp from './CatchMeUp';


export default defineComponent({
    name: 'Personalization',
    setup() {
        const { t, locale } = useLocale()
        const generalData = reactive({

            personalizedContent: '',


            SaveAllRecordingsToNotes: true,


            FloatingBubble: true,
            AIKey: true,
            WakeWord: true,


            VoiceTone: true,
            InteractionMode: true

        })
        // const {setSettings,getSetting}=settingHooks(generalData)


        const displayData = computed(() => {
            return {
                personalizedContent: {
                    title: t('settings.personalization.personalizedContent'),
                    subTitle: t('settings.personalization.personalizedContentSubTitle'),
                    enablePersonalizedContent: t('settings.personalization.enablePersonalizedContent'),
                    allowContextualSuggestions: t('settings.personalization.allowContextualSuggestions'),

                },
                CMU: {
                    title: t('settings.personalization.CMU'),
                    subTitle: t('settings.personalization.recordingsSubTitle'),
                    SaveAllRecordingsToNotes: t('settings.personalization.SaveAllRecordingsToNotes'),
                },
                connectors: {
                    title: t('settings.personalization.connectors.title'),
                    subTitle: t('settings.personalization.connectors.subtitle'),
                    deviceDefaults: t('settings.personalization.connectors.deviceDefaults'),
                    deviceDefaultsSubtitle: t('settings.personalization.connectors.deviceDefaultsSubtitle'),
                },

            }
        })


        return () => (

            <div class='overflow-auto' >
                {/* <Card title={displayData.value.personalizedContent.title} subTitle={displayData.value.personalizedContent.subTitle} class='mb-[24px]' icon={IconEarth}>

                    <div>
                        Select
                    </div>
                </Card>
                <Card title={displayData.value.CMU.title} subTitle={displayData.value.CMU.subTitle} icon={IconRecord} class='mb-[24px]'>

                    <SettingItem title={displayData.value.CMU.SaveAllRecordingsToNotes}   v-model:val={generalData.SaveAllRecordingsToNotes} />
               </Card> */}
                <Card title={displayData.value.connectors.title}
                    subTitle={displayData.value.connectors.subTitle}
                    icon={IconConnector} class='mb-[24px]'>

                    {/* <div >
                        <div class='title-xl' >
                            {t('settings.personalization.connectors.title')}
                        </div>
                        <div class='body-s' >
                            {t('settings.personalization.connectors.title')}
                        </div>
                    </div> */}

                    <div >
                        <div class='title-s mb-[12px]' >
                            {displayData.value.connectors.deviceDefaults}
                        </div>
                        <div class='body-s mb-[12px] text-text-on-surface-variant' >
                            {displayData.value.connectors.deviceDefaultsSubtitle}
                        </div>
                        <Tools></Tools>
                    </div>

                </Card>
                <Card title={displayData.value.CMU.title} icon={IconCMU} class='mb-[24px]'>
                    <div>
                        <CatchMeUp />
                    </div>
                </Card>
            </div>
        );
    }
}); 