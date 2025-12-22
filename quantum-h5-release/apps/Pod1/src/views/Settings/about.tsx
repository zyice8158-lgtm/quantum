import { computed, defineComponent, reactive, ref, watch } from 'vue';
import { useLocale } from '@/hooks/i18n'
import SearchHeader from './comps/SearchHeader'
import Card from './comps/Card';
import { IconAbout, IconAccount, IconDevices, IconEarth, IconMic, IconRecord } from '@quantum/icons';
import SettingItem from './comps/SettingItem';
import RadioButton from '@libs/p-comps/volt/RadioButton.vue';

import Select from '@libs/p-comps/volt/Select.vue';
import { SettingStore } from '@/store/settings';
import { getVersion } from '@libs/service';


export default defineComponent({
    name: 'General',
    setup() {
        const { t, locale } = useLocale()


        const data = reactive({
            version: ''
        })
        const displayData = computed(() => {
            return {
                about: {
                    title: t('settings.about.title'),
                    subTitle: t('settings.about.subTitle'),
                    version: t('settings.about.version'),

                },

            }
        })
        const getData = () => {
            getVersion().then(res => {
                console.log('res:', res)
                data.version = res.data?.Data?.version
                    || ''
            })
        }
        // const hClass = 'text-[16px] font-bold'
        // const subHClass = 'text-[12px] text-text-sub '
        // console.log('displayData--------------------:', SettingStore.about.interactionMode)
        getData()
        return () => (
            <div class='overflow-auto' >
                <Card id='about' title={displayData.value.about.title} subTitle={displayData.value.about.subTitle} class='mb-[24px]' icon={IconAbout}>
                    <SettingItem title={displayData.value.about.version} >
                        <span>{data.version}</span>
                    </SettingItem>
                    {/* <Select class='w-[50%]' v-model={SettingStore.generalData.language} options={languageOptions} optionLabel="name" optionValue="code"> </Select> */}
                </Card>

            </div>
        );
    }
});
