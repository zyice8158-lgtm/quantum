import { defineComponent, reactive } from 'vue';
import { useLocale } from '@/hooks/i18n'
import SearchHeader from './comps/SearchHeader'
import Card from './comps/Card';
import { IconAccount, IconAvatar, IconDevices } from '@quantum/icons';
import { getUser } from '@libs/service';
import { QButton } from '@libs/p-comps/volt/QButton';


export default defineComponent({
    name: 'Personal',
    setup() {
        const { t } = useLocale()
        const user = reactive({
            email: '',
            name: '',
            avatarUrl: '',
        })
        // const { t, locale } = useLocale()
        const getUserData = async () => {
            try {
                const data = await getUser()
                const { userData } = data.data.Data
                console.log('getUserData', data, userData);
                Object.assign(user, JSON.parse(userData as string))

            } catch (error) {
                console.log(error);

            }

        }
        getUserData()
        return () => (
            <div >
                <Card title='Account' class='mb-[24px]' icon={IconAccount}>

                    <div class={'flex items-center justify-between'}>
                        <div class={'flex gap-[16px] items-center'}>
                            <div class=' rounded-full overflow-hidden'>
                                <IconAvatar />
                            </div>
                            <div>

                                <div class='font-bold text-xl'>
                                    {user.name}
                                </div>
                                <div class='text-xl'>
                                    {user.email}
                                </div>
                            </div>
                        </div>
                        <div>
                            <QButton class='mr-[8px]' variant={'outlined'}>{t('settings.personal.manageLenovoID')}</QButton>
                            <QButton variant={'outlined'}>{t('settings.personal.signOut')}</QButton>
                        </div>
                    </div>
                </Card>
                {/* <Card title='Devices' subTitle='These are the current devices connected between your account and Quantum' icon={IconDevices}>


                </Card> */}
            </div>
        );
    }
});
