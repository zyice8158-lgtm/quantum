<template>
  <div class="home">
    <div class="btn-container">
      <Button class="btn-container-btn" @click="handleObtainScreenshotFile">获取截图文件</Button>
      <Button class="btn-container-btn" @click="handleSendImage">获取模型返回内容</Button>
      <Button class="btn-container-btn" @click="handleCallScreenShotSrvice">调用截图服务</Button>
      <Button class="btn-container-btn" @click="handleSmartSelect">划词</Button>
      <Button class="btn-container-btn" @click="handleCatchMeUp">触发CatchMeUp</Button>
      <Button class="btn-container-btn" @click="handleReplyCatchMeUp">输入框回复</Button>

    </div>
  </div>
</template>
<script setup lang="ts">
import { obtainScreenshotFile, sendImage, callScreenShotSrvice, smartSelect, invokeCatchMeUp, replyCatchMeUp } from '@libs/service';

const handleObtainScreenshotFile = async () => {
  try {
    const res = await obtainScreenshotFile({ MessageSource: 'web', Data: {} });
    console.log(res);
    
  } catch (error) {
    console.error('Error obtaining screenshot file:', error);
    
  }

}
const handleSendImage = async () => {
  try {
    const res = await sendImage({ MessageSource: 'web', Data: { Msg: 'explain this image', Type: 'IMAGE_UNDERSTANDING', SessionType: 'QuantumSnipTool', ImagePath: 'C:\\Users\\wangwj42\\Pictures\\LenovoAINowscreenshot\\ScreenShot_20250702103525.png' } });
    console.log(res);
    
  } catch (error) {
    console.error('Error sending image:', error);
    
  }
}
const handleCallScreenShotSrvice = async () => {
  try {
    const res = await callScreenShotSrvice({ MessageSource: 'web', Data: {} });
    console.log(res);
    
  } catch (error) {
    console.error('Error calling screenshot service:', error);
    
  }
}
const handleSmartSelect = async () => {
  try {
    const res = await smartSelect({ MessageSource: 'web', Data: { Words: 'hello world', Intention: 'polish' } });
    console.log(res);
    
  } catch (error) {
    console.error('Error performing smart select:', error);
    
  }
}
const handleCatchMeUp = async () => {
  try {
    const res = await invokeCatchMeUp({ MessageSource: 'web', Data: {}});
    console.log(res);
    
  } catch (error) {
    console.error('Error invoking CatchMeUp:', error);
    
  }
}
const handleReplyCatchMeUp = async () => {
  try {
    const res = await replyCatchMeUp({ MessageSource: 'web', Data: { ReplyContent: 'This is a reply to CatchMeUp' } });
    console.log(res);
    
  } catch (error) {
    console.error('Error replying to CatchMeUp:', error);
    
  }
}
</script>
<style lang="less" scoped>
.home {
  width: 100%;
  height: 100%;
  

  .btn-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    .btn-container-btn {
      width: 200px;
      height: 50px;
      margin-bottom: 20px;
      font-size: 16px;
      color: #fff;
      background-color: #007bff;
      border-radius: 5px;
      cursor: pointer;
      &:hover {
        background-color: #0056b3;
      }
    }
  }
}
</style>