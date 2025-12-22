<template>
  <div class="smart-select-dropdown-container">
    <QSelect :options="dropdownList"  @select="selectItem"></QSelect>
  </div>
</template>
<script lang="ts" setup>
import { QSelect, type OptionItem } from "@libs/p-comps";
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import { debounce } from "../../utils";
import { getSmartSelectDropdownList, CrossTabCommunicator, ChannelMessageType } from '@libs/Service'

const dropdownList = ref<OptionItem>([]);
const buttonList = ref<Array<{
  Type: string,
  Value: string,
  Intention: string
}>>([]);
const route = useRoute();
const communicator = new CrossTabCommunicator(ChannelMessageType.MAINCHAT);
const selectItem = async (event: { value: string, text: string }) => {
  debounce(() => {
    const capText = route.query.capText; 
    console.log('capText-----------', capText);
    const selectItem = buttonList.value.filter(item => item.Value === event.text)[0];
    communicator.send('smartSelect', {
      SmartSelect_CaptureText: capText,
      SmartSelect_functinName: selectItem.Value,
      SmartSelect_Intention: selectItem.Intention,
    });
  }, 500)();
}
onMounted(async() => {
  try {
    const response = await getSmartSelectDropdownList({ Data: {} });
    const { ErrorCode, ErrorMessage, Data } = response.data;
    if (ErrorCode !== 0) {
      console.error('Error:', ErrorMessage);
      return;
    }
    const { ButtonList } = Data;
    buttonList.value = ButtonList;
    dropdownList.value = ButtonList.map((item) => {
      return {
        icon: '',
        text: item.Value,
      };
    });

  } catch (error) {
    console.error('Error fetching smart select tool list:', error);
  }
})  
onUnmounted(() => { 
  communicator.close();
})
</script>
<style lang="less" scoped>
.smart-select-dropdown-container {
  width: 100vw;
  height: 100vh;
  :deep(.q-select) {
    width: 100vw;
    font-size: 16px;
    line-height: 24px;
  }
  :deep(.q-select_item) {
    &.active {
      background-color: #D5E3FF;
    }
    &:hover {
      background-color: #D5E3FF;
    }
  }
}
</style>