<template>
  <div class="smart-select">
    <QToolBar :buttons="toolList" @button-click="onToolbarBtnClick">
      <template #left>
        <img :src="SmartSelectImage" width="35" height="35" />
      </template>
    </QToolBar>

  </div>
</template>
<script setup lang="ts">
import QToolBar from '@libs/p-comps/ToolBar'
import { getSmartSelectToolList, WebviewMessager, openPopup, CrossTabCommunicator, ChannelMessageType } from '@libs/Service'
import { onMounted, onUnmounted, ref } from 'vue';
import SmartSelectImage from '@/assets/ss_icon.png';
import SearchImg from '@/assets/search_ai.png';
import FolderImg from '@/assets/folder.png'
import HelpImg from '@/assets/help.png'
import lightImg from '@/assets/lightbulb.png'
import dropdownImg from '@/assets/ss_drop.png'
import { debounce } from "../../utils";

const capText = ref<string>('');
const toolList = ref([]);
const buttonList = ref<Array<{
  Type: string,
  Value: string,
  Intention: string
}>>([]);
const iconMap: Record<string, string> = {
  Type_Polish: SearchImg,
  Type_ReWrite: FolderImg,
  Type_Summarize: lightImg,
}
const Url = window.location.href.split('#')[0] + '#/smartSelectDropdown';

onMounted(async () => {
  try {
    const response = await getSmartSelectToolList({ Data: {} });
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
        icon: iconMap[item.Type] || HelpImg,
        text: item.Value,
        rightIcon: item.Type === 'Type_Polish' ? dropdownImg : '',
      };
    });
    
  } catch (error) {
    console.error('Error fetching smart select tool list:', error);
  }
});
const offSmartSelectListener =  WebviewMessager.on('SmartSelect_CaptureText', (data) => {
  console.log('captureText----', data);
  const { Data: { CaptureText } } = data;
  capText.value = CaptureText as string;
});

const communicator = new CrossTabCommunicator(ChannelMessageType.MAINCHAT);
function onToolbarBtnClick(idx: number, text: string) {
  debounce(() => {
  
    if (text === 'Polish') {
      try {
        openPopup({
          Data: { Height: 274, Width: 140, Url: `${Url}?capText=${capText.value}`, IsOpen: true },
        });
      } catch (error) {
        console.error('Error changing webview size:', error);
      }
      return;
    }
    communicator.send('SmartSelect', {
      SmartSelect_CaptureText: capText.value,
      SmartSelect_functinName: text,
      SmartSelect_Intention: buttonList.value[idx].Intention,
    });
  }, 500)();
}

onUnmounted(() => { 
  communicator.close();
  offSmartSelectListener();
});
</script>
<style lang="less" scoped>
.smart-select {
  display: flex;
  align-items: center;
  width: 100vw;
  height: 100vh;
  padding: 0 8px 0 17px;
  box-sizing: border-box;
}

</style>