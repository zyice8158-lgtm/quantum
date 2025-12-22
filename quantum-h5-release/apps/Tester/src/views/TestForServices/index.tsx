import { defineComponent, reactive, ref } from 'vue';
import InputText from '@libs/p-comps/volt/InputText.vue'
import Button from '@libs/p-comps/volt/Button.vue'
import Textarea from '@libs/p-comps/volt/Textarea.vue'
import { AppFetch } from '@libs/service/fetch/AppFetch.ts'
import { WebviewMessager as WebviewMassager } from '@libs/service/message/WebviewMessager'
import { MessageReq } from '@libs/service';
export default defineComponent({
  name: 'Agents',
  setup() {
    const url = ref('')
    const method = ref('')
    const paramsStr = ref('')
    const httpParamsStr = ref('')
    const httpRes = reactive({})
    const StreamRes = ref('')
    const handleService = (url: string, Params: String) => {
      let data = {}
      try {

        data = JSON.parse(JSON.stringify(Params))

      } catch (error) {
        console.log(error);

        return
      }
      AppFetch.post(url, { data }).then(res => {
        Object.assign(httpRes, res)
      }).catch(err => {
        Object.assign(httpRes, err)

      })
    }
    const handleStreamService = (Params: string) => {
      let Data = {} as MessageReq<Record<string, unknown>>
      try {

        Data = JSON.parse(JSON.stringify(Params))

      } catch (error) {
        console.log(error);

        return
      }
      WebviewMassager.sendStreamMessage(

        Data,
        {
          onData: (data) => {
            StreamRes.value = StreamRes.value + data
          },
          onDone: () => {
            console.log('Stream done')
          },
          onError: (err) => {
            console.log('Stream error', err)
          }
        }
      )
    }

    return () => (
      <div>

        <div class="p-[8px] bg-primary flex">
          <div class="w-[240px]">
            <div class="title-l">http</div>
            <InputText class="w-full" type="text" v-model={url.value} placeholder="pls input url"></InputText>
            <Textarea class="w-full" type="text" v-model={httpParamsStr.value} placeholder="pls input JSON"></Textarea>
            <Button onClick={() => handleService(url.value, httpParamsStr.value)}>send</Button>
          </div>
          <div class="flex-1 bg-primary-container">

            {JSON.stringify(httpRes)}
          </div>
        </div>
        <div class="p-[8px] bg-primary flex">
          <div class="w-[240px]">
            <div class="title-l">postMsg</div>

            {/* <InputText class="w-full" type="text" v-model={method.value} placeholder="pls input MessageMethod"></InputText> */}
            <Textarea class="w-full" type="text" v-model={paramsStr.value} placeholder="pls input JSON"></Textarea>
            <Button onClick={() => handleStreamService(paramsStr.value)}>send</Button>
          </div>
          <div class="flex-1 bg-primary-container">
            <div>
              {method.value}
              {paramsStr.value}

            </div>
            {JSON.stringify(StreamRes.value)}
          </div>
        </div>
      </div>
    );
  }
});

