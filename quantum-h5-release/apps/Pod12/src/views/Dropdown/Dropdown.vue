<template>
  <div class="dropdown-container">
    <QSelect @select="selectItem"></QSelect>
  </div>
</template>
<script lang="ts" setup>
import { QSelect } from "@libs/p-comps";
import { openPopup } from "@libs/service";
import { nextTick, onMounted } from "vue";
import { debounce } from "../../utils";
const Url = window.location.href.split('#')[0] + '#/dropdown';
const selectItem = async (event:{value:string, text:string}) => {
  debounce(() => { 
    localStorage.setItem('dropdown-invoke-function', JSON.stringify({
      functionName: event.text,
      timestamp: Date.now(),
    }))
  }, 500)();
  try {
    await openPopup({
      MessageSource: 'window1',
      Data: { Height: 100, Width: 100, Url, IsOpen: false },
    });
  } catch (error) {
    console.error('Error changing webview size:', error);
  }
}
onMounted(() => {  
  nextTick(() => {
    changeWebviewSize();
  });
})
const changeWebviewSize = async () => {
  const container = document.querySelector('.dropdown-container') as HTMLElement | null;
  if (!container) return;

  const height = container.scrollHeight
  const width = container.scrollWidth;
  console.log('container----', container.scrollHeight)
  console.log('container----', container.scrollWidth)


  try {
    await openPopup({
      MessageSource: 'window1',
      Data: { Height: height, Width: width, Url,IsOpen: true },
    });
  } catch (error) {
    console.error('Error changing webview size:', error);
  }
}
</script>
<style lang="less" scoped>
.dropdown-container {
  overflow: auto;
}
</style>