<template>
  <div class="home">
    <!-- <div>{{ SpeakString }}</div> -->
    <button @click="play">开始播放</button>
    <button @click="stop">停止播放</button>
  </div>
</template>
<script lang="ts" setup> 
import { startSpeech,stopSpeech } from '@libs/service';
const SpeakString = 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Excepturi quidem voluptates nemo quae provident quis,et soluta eum temporibus ipsam minus.Atque sapiente provident sed cupiditate ex, fuga autem quas.loremLorem,ipsum dolor sit amet consectetur adipisicing elit.Excepturi quidem voluptates nemo quae provident quis, et solutaeum temporibus ipsam minus.Atque sapiente provident sed cupiditate ex, fuga autem quas.loremLorem, ipsum dolosit amet consectetur adipisicing elit.Excepturi quidem voluptates nemo quae provident quis, et soluta eumtemporibus ipsam minus.Atque sapiente provident sed cupiditate ex, fuga autem quas.lorem';
const play = async() => { 
  console.log('play')
  try {
    const res = await startSpeech({ MessageSource: 'web', Data: { SpeakString} });
    console.log(res);
  } catch (error) {
    console.error(error);
  }
}
const stop = async() => { 
  console.log('stop');
  const res = await stopSpeech({ MessageSource: 'web', Data: {} });
  console.log(res);
}
</script>
<style scoped lang="less">
.home {
  overflow: auto;
}
</style>