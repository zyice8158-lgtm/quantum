import { defineComponent, ref } from 'vue';
import { useLocale } from '@/hooks/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { QSearchInput } from '@libs/p-comps'
import NextItem from './NextItem.tsx'
import { IconCalendar, IconContacts, IconEmail } from '@quantum/icons';
import router from '@/routers/index.ts';
import { getServerList } from '@libs/service'
interface ServerItem {
    serverName: string, enabled: boolean, icon?: () => JSX.Element
}


export default defineComponent({
    props: {

    }, setup(props) {

        const { t, locale } = useLocale()
        console.log(props);
        const serverList = ref([] as Array<

            ServerItem>)
        const iconList = [
            { icon: IconEmail, name: 'Email' },
            { icon: IconCalendar, name: 'Calendar' },
            { icon: IconContacts, name: 'Contacts' },

        ]
        const handleClick = (serverName: string) => {
            console.log('click', serverName);

            if (!serverName) {
                console.error(serverName);

            }
            router.push({
                name: 'PersonalizationDevice',
                params: {
                    serverName
                }
            })
        }
        const getList = async () => {
            try {

                const { Data } = (await getServerList()).data
                console.log('getServerList', Data);

                if (Data) {

                    serverList.value = (JSON.parse(Data.Chunk) as Array<ServerItem>).map(
                        item => {
                            const res = iconList.find(icon => {
                                console.log(icon, item);

                                return icon.name === item.serverName
                            })
                            console.log('res', res);

                            item.icon = res.icon

                            return item
                        }
                    )
                    console.log(serverList.value);

                }

            } catch (error) {

            }
        }
        getList()
        return () => (
            <div class="flex flex-wrap gap-[12px]">

                {serverList.value.map(item => {


                    return (
                        <NextItem class='w-[calc(50%-6px)]' onClick={() => handleClick(item.serverName)}>
                            <div class='flex gap-[24px] items-center'>


                                {item.icon()}
                                <span>{item.serverName}</span>
                            </div>
                        </NextItem>

                    )
                })}
                {/* <NextItem class='w-[calc(50%-6px)]' onClick={() => handleClick('email')}>
                    <div class='flex gap-[24px] items-center' v-for={item in serverList.value}>
                        <IconEmail></IconEmail>
                        <span>Email</span>
                    </div>
                </NextItem>
              
                <NextItem class='w-[calc(50%-6px)]'>
                    <div class='flex gap-[24px] items-center'>
                        <IconCalendar></IconCalendar>
                        <span>Calendar</span>
                    </div>
                </NextItem> */}

            </div>
        );
    }

});