<template>
  <div class="smart-select">
    <QToolBar :buttons="toolList" @button-click="onToolbarBtnClick">
      <template #left>
        <img :src="IconImg" width="25" height="25" />
      </template>
    </QToolBar>

  </div>
</template>
<script setup lang="ts">
import QToolBar from '@libs/p-comps/ToolBar'
import { getSmartSelectToolList, WebviewMessager } from '@libs/Service'
import { onMounted, ref } from 'vue';
import IconImg from '@/assets/Icon.png';
import SearchImg from '@/assets/icons/search_ai.png';
import FolderImg from '@/assets/icons/folder.png'
import HelpImg from '@/assets/icons/help.png'
import lightImg from '@/assets/icons/lightbulb.png'
import { debounce } from "../../utils";

const capText = ref<string>('');
const toolList = ref([]);
const buttonList = ref([]);
const iconMap: Record<string, string> = {
  Type_Polish: SearchImg,
  Type_ReWrite: FolderImg,
  Type_Summarize: HelpImg,
}
onMounted(async () => {
  try {
    const response = await getSmartSelectToolList({ MessageSource: 'web', Data: {} });
    const { ErrorCode, ErrorMessage, Data } = response.data;
     if (ErrorCode !== 0) {
       console.error('Error:', ErrorMessage);
       return;
    } 
    const { CaptureText, ButtonList } = Data;
    capText.value = CaptureText;
    buttonList.value = ButtonList;
    toolList.value = ButtonList.map((item) => {
      return {
        icon: iconMap[item.Type] || lightImg,
        text: item.Value,
      };
    });
    
  } catch (error) {
    console.error('Error fetching smart select tool list:', error);
  }
});
WebviewMessager.on('SmartSelect_CaptureText', (data) => {
  console.log('captureText----', data);
  const { Data: { CaptureText } } = data;
  capText.value = CaptureText as string;
});
function onToolbarBtnClick(idx: number, text: string) {
  debounce(() => {
    localStorage.setItem('smartSelect', JSON.stringify({
      SmartSelect_CaptureText: capText.value,
      SmartSelect_Intention: buttonList.value[idx].Intention,
      timestamp: Date.now(),
    }));
  }, 500)();
 

}
</script>
<style lang="less" scoped>
.smart-select {
  padding: 7px 8px 7px 17px;
}

</style>