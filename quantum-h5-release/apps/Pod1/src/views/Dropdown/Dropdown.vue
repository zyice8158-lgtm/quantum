<template>
  <div class="dropdown-container">
    <QSelect :options="defaultOptions" @select="selectItem"></QSelect>
  </div>
</template>
<script lang="ts" setup>
import { QSelect, type OptionItem } from "@libs/p-comps";
import { debounce } from "../../utils";
import cmuIcon from '@/assets/cmu-icon.png';
import imageStudioIcon from '@/assets/image-studio.png';
import rememberThis from '@/assets/remember-this.png';
import payAttention from '@/assets/pay-attention.png';
import playlistStudio from '@/assets/playlistStudio.png';
import exploreIcon from '@/assets/exploreIcon.png';
import settingsIcon from '@/assets/settings.png';
import historyIcon from '@/assets/history.png';
import { CrossTabCommunicator, ChannelMessageType } from "@libs/service";
import { onUnmounted } from "vue";

const defaultOptions: OptionItem[] = [
  {
    iconPath: cmuIcon,
    text: 'Catch me up',
    value: 'cmu',
    onClick: async function () {}
  },
  {
    iconPath: imageStudioIcon,
    text: 'Image studio',
    value: '2',
    onClick: function () { }
  },
  {
    iconPath: rememberThis,
    text: 'Remember this',
    value: '3',
    onClick: function () { }
  },
  // {
  //   iconPath: payAttention,
  //   text: 'Pay attention',
  //   value: '4',
  //   onClick: function () { }
  // },
  {
    iconPath: playlistStudio,
    text: 'Screen Capture',
    value: '5',
    onClick: function () { }
  },
  {
    iconPath: exploreIcon,
    text: 'Explore with Perplexity',
    value: '6',
    onClick: function () { }
  },
  {
    iconPath: settingsIcon,
    text: 'Settings',
    value: '7',
    onClick: function () { }
  },
  {
    iconPath: historyIcon,
    text: 'History',
    value: '8',
    onClick: function () { }
  },
];
const communicator = new CrossTabCommunicator(ChannelMessageType.MAINCHAT);

const selectItem = async (event:{value:string, text:string}) => {
  debounce(() => { 
    communicator.send('dropdown-invoke-function', {
      functionName: event.text,
    });
  }, 500)();
}
onUnmounted(() => {
  communicator.close();
});

</script>
<style lang="less" scoped>
.dropdown-container {
  overflow: auto;
}
</style>