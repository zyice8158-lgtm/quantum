import { computed, defineComponent, reactive, ref, watch } from 'vue';
import { useLocale } from '@/hooks/i18n'
import SearchHeader from './comps/SearchHeader'
import Card from './comps/Card';
import { IconAccount, IconBack, IconConnector, IconDevices, IconEarth, IconMic, IconRecord } from '@quantum/icons';
import SettingItem from './comps/SettingItem';
import RadioButton from '@libs/p-comps/volt/RadioButton.vue';
// import { personalizedContent } from '@/constant';
// import ComingSoon from '@libs/p-comps/ComingSoon';
import Tools from './comps/Tools'
import { useRoute, useRouter } from 'vue-router';
import { handleAddFile } from '@libs/p-comps/utils/inwardFile';
import { getServerList, getToolList, setServer, setTool } from '@libs/service';
interface ToolItem {
    toolName: string, enabled: boolean
}
interface ServerItem {
    serverName: string, enabled: boolean, icon?: () => JSX.Element
}
export default defineComponent({
    name: 'Personalization',
    setup() {
        const { t, locale } = useLocale()
        const route = useRoute()
        const router = useRouter()
        const serverName = route.params.serverName as string
        // const device = route.params.device as string
        const ToolList = ref([] as Array<ToolItem>)
        const server = reactive({serverName,enabled:false})
 const getList = async () => {
            try {

                const { Data } = (await getServerList()).data
                console.log('getServerList', Data);
                // server = (JSON.parse(Data.Chunk) as Array<ServerItem>).find(item=>item.serverName===serverName)
                Object.assign(server, (JSON.parse(Data.Chunk) as Array<ServerItem>).find(item=>item.serverName===serverName))
            }catch (error) {

            }
      
     
            
        }
       

  const getTools = async () => {
            try {

                const res = await getToolList(serverName)
                const {Data}=res.data||{}
                console.log( 'ToolList',res,);
                // console.log( 'ToolList',res,Data);
                if (Data) {

                    ToolList.value = (JSON.parse(Data.Chunk) as Array<ToolItem>)
                    console.log( 'ToolList',ToolList.value);
                    
                }

            } catch (error) {
console.error(error);

            }
            }

            
 getList().then(()=>{

     getTools()
 })
        const handleBack = () => {
router.push({ name:'PersonalizationMain' })
        }
        const handleChange = ({title,val}:{title:string,val:boolean}) => { 
            console.log('handleChange',);
            if (title===server.serverName) {
                
                setServer(title,!val)
                return
            }
            setTool(title,!val)
            
        }
        return () => (

            <div class='overflow-auto' >
                <Card>
                    {{
                        header: () => (
                            <div class='title-xl flex items-center gap-[16px] w-fit cursor-pointer' onClick={() => handleBack()}>
                                <IconBack></IconBack>
                                <h1>{t('common.back')}</h1>
                            </div>
                        ),
                        default: () => (
                            <div>

                                <SettingItem title={server.serverName} v-model:val={server.enabled} onChange={handleChange}></SettingItem>
                                {/* <SettingItem title={device} isChild></SettingItem> */}
                                {
                                  server.enabled? ToolList.value.map(item => (

                                        <SettingItem title={item.toolName} isChild v-model:val={item.enabled} onChange={handleChange}>
                                        </SettingItem>
                                    )):<></>


                                }
                            </div>

                        )
                    }}

                </Card>

            </div>
        );
    }
    
}); 