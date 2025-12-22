<template>
  <div :class="{'chat-wrap':true,'chat-wrap-apple':isApple}">
    <div class="chat-wrap-title">
      <div class="icon-title">
        <QIcons name="Logo" size="0.6rem"></QIcons>
      </div>
      <span class="chat-wrap-title_text">Quantum</span>
      <div class="icon-s">
        S
      </div>
      <SvgIcon name="settings"/>
    </div>
    <ChatBase v-if="isChatBaseVisible" :chat="chat">
      <template #preChat>
      <Welcome></Welcome>


      </template>
      <template #questionSlot="{ questions }" v-if="!chat?.isWelcome">
        <div class="query-container">
          <QuestionPage :queryItem="questions" />
          <QueryOperation class="query-operation" :queryItem="questions" />
        </div>
      </template>
      <template #answerSlot="{ answers }" v-if="!chat?.isWelcome">
        <div class="answer-container">
          <AnswerPage :noTool="true" :chat="chat" :answerItem="answers.answerData as Answer"/>
        </div>
      </template>
      <template #inputSlot>
        <div class="answer-input"><InputPage :chat="chat" :isInit="isInit" @toggle-init="toggleInit" pod="pod12"/></div>
      </template>
    </ChatBase>
  </div>
</template>

<script setup lang="ts">
import { ChatBase, ChatController, AnswerActionType,QIcons } from '@libs/p-comps'
import Answer  from '@libs/p-comps/ChatBaseComponent/types/Answer'
import mySDK from './sdkService'
import { onMounted, ref, watch, onUnmounted, computed} from 'vue'
import { InputPage, QuestionPage, AnswerPage } from '@libs/p-comps/ChatView'
import SvgIcon from '@/components/SvgIcon';
import { changeSize } from '@libs/service';
import { obtainScreenshotFile, WebviewMessager, sendSmartSelectMessage } from '@libs/service';
import { v4 as uuidv4 } from 'uuid';
import Welcome from './comps/Welcome.vue'
const chat = ref<ChatController>()
const isChatBaseVisible = ref(true)
let lastHeight = 0;
const isInit = ref<boolean>(false);
const props = defineProps({
  sessionNum: Number
})
const toggleInit = (init: boolean) => {
  isInit.value = init;
}
const isApple=computed(()=> window.navigator.userAgent.toLowerCase().includes('Macintosh'))
const resetChatBase = () => {
  isChatBaseVisible.value = false
  setTimeout(() => {
    mySDK.init()
    chat.value = new ChatController(mySDK)
    isChatBaseVisible.value = true
  }, 0)
}

watch(
  () => props.sessionNum,
  () => {
    console.log(props.sessionNum, 'props.sessionNum')
    resetChatBase()
  },
  { immediate: true }
)

let mutationObserver: MutationObserver | null = null;
const initMutationObserver = () => {
  const targetNode = document.querySelector('.chat-wrap') as HTMLElement;
  if (!targetNode) return;
  mutationObserver = new MutationObserver(() => {
    requestAnimationFrame(() => {
      updateAnswerContainerMargin();
      changeWebviewSize();

    })
  })
  mutationObserver.observe(targetNode, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'opacity', 'transform']
  })
}
onMounted(() => {
  initMutationObserver();
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('resize', handleResize);
  updateAnswerContainerMargin();
  changeWebviewSize();

  // setTimeout(() => {
  //   handleCatchMeUp();
  // }, 3000);
})
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'smartSelect') {
    const smartSelect = localStorage.getItem('smartSelect');
    if (!smartSelect) return;
    try {
      const parsedData = JSON.parse(smartSelect);
      handleSmartSelect(parsedData.SmartSelect_CaptureText, parsedData.SmartSelect_Intention);

    } catch (error) {
      console.error('Failed to parse stored smartSelect data:', error);
    }
  }
  if (event.key === 'dropdown-invoke-function') {
    const dropdown = localStorage.getItem('dropdown-invoke-function');
    if (!dropdown) return;
    try {
      const parsedData = JSON.parse(dropdown);
      const functionName = parsedData.functionName;
      dropdownActions[functionName]?.();
    } catch (error) {
      console.error('Error parsing dropdown JSON:', error);
    }
   
  }
}
const handleResize = () => {
  requestAnimationFrame(() => {
    updateAnswerContainerMargin()
  })
}
const updateAnswerContainerMargin = () => {
  const fileDisplay = document.querySelector('.file-display') as HTMLElement
  const answerContainers = document.querySelectorAll(
    '.answer-container'
  )
  const inputBoxContent = document.querySelector('.input-box_content') as HTMLElement

  if (!answerContainers.length) return

  const lastAnswerContainer = answerContainers[answerContainers.length - 1] as HTMLElement

  if (fileDisplay) {
    const computedStyle = window.getComputedStyle(fileDisplay)
    const isVisible = computedStyle.opacity !== '0' && computedStyle.display !== 'none'


    if (inputBoxContent) {
      inputBoxContent.style.marginTop = isVisible ? '80px' : '0'
    }

    if (isVisible) {

      const baseMargin = 32

      const marginBottom = Math.max(baseMargin, fileDisplay.offsetHeight + baseMargin + 16)
      lastAnswerContainer.style.marginBottom = `${marginBottom}px`
    } else {
      lastAnswerContainer.style.marginBottom = `${24}px`
    }
  } else {
    if (inputBoxContent) {
      inputBoxContent.style.marginTop = '0'
    }
    lastAnswerContainer.style.marginBottom = `${24}px`
  }
}

const changeWebviewSize = async (initialHeight: number = 45) => {
  const chatWrap = document.querySelector('.chat-wrap') as HTMLElement | null;
  if (!chatWrap || lastHeight > 373) return;

  const height = Math.max(chatWrap.scrollHeight, initialHeight);
  const width = chatWrap.scrollWidth;
  if (height <= lastHeight) return;
  lastHeight = height;
  try {
    await changeSize({
      MessageSource: 'window1',
      Data: { Height: height, Width: width },
    });
  } catch (error) {
    console.error('Error changing webview size:', error);
  }
}
const handleCatchMeUp = async () => {
  console.log('handleCatchMeUp----------')
  chat.value.setWelcomeType(false)
  chat.value.setQueryObject({content: '', intentionType: 'cmu'})
}
const handleObtainScreenshotFile = async () => {
  const MessageId = uuidv4();
  try {
    const res = await obtainScreenshotFile({ MessageId,MessageSource: 'web', Data: {} });
    console.log(res);
    const unSubscribe = WebviewMessager.on('GetToolsAndImage', (data) => {
      console.log('Received data from callScreenShotSrvice:', data);
      unSubscribe();
      const { ErrorCode, ErrorMessage, Data} = data;
      if (ErrorCode !== 0) {
        console.error('Error calling screenshot service:', ErrorMessage);
        return;
      }
      const { ImageBase64, ImagePath, Tools } = Data;


      chat.value.setWelcomeType(false);
      chat.value.setQueryObject({content: '',files:[{name: '', base64: ImageBase64 as string, path: ImagePath as string, fileId: ''}], intentionType: Tools as string, actionType: AnswerActionType.PICTURE});
      

    })

  } catch (error) {
    console.error('Error obtaining screenshot file:', error);

  }

}
const handleSmartSelect = async (captureText: string, intention: string) => { 
  chat.value.setWelcomeType(false);
  chat.value.setQueryObject({ content: captureText, intentionType: intention })
  sendSmartSelectMessage({MessageSource: 'pod6', Data: {}});
}
const dropdownActions: Record<string, () => void> = {
  'Catch me up': handleCatchMeUp,
  'Screen Capture': handleObtainScreenshotFile,
};

onUnmounted(() => {
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('storage', handleStorageChange);

})
</script>

<style lang="less" scoped>
.chat-wrap {
  display: flex;
  flex-direction: column;
  overflow: auto;
  height: 90vh;
  &-apple{
  height: 90vh;

}
  // padding-bottom: 32px;
  &-title {
    display: flex;
    align-items: center;
    padding: 30px 15px 0 15px;
    height: 70px;
    width: 100%;
    justify-content: space-between;
    // position: absolute;
    // top:0;
    // left: 0;
    // z-index: 10;
    background-color: #fff;
    .icon-title {
      width: 40px;
      height: 40px;
      // background-color: #D9D9D9;
      display: flex;
      border-radius: 50%;
      justify-content: center;
      align-items: center;

    }
    &_text {
      color: #212121;
      font-size: 20px;
      font-weight: 400;
      margin-right: auto;
      margin-left: 9px;
    }
    .icon-s {
      width: 37px;
      height: 37px;
      border-radius: 50%;
      background-color: rgba(62, 146, 246, 1);
      color: #fff;
      text-align: center;
      line-height: 37px;
      margin-left: auto;
      margin-right: 13px;
      font-size: 20px;
    }
  }
  > * {
    box-sizing: border-box;
  }

  &_welcome {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    // 940 / viewport * desktopWidth
    max-width: 940px;
    text-align: center;
    margin-bottom: 20px;
  }
}

.answer-container {
  position: relative;
::v-deep(.answer-conatiner) {
    background-color: rgba(235, 238, 241, 0.8);
  }
::v-deep(.answer-plain-text) {
 background: var(--Processing, radial-gradient(50% 50% at 50% 50%, var(--Colors-AI-Steps-Step-15, #5C8DFF) 0%, var(--Colors-Accents-AI-Accent, #855EE1) 100%));
background-clip: text;
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
  }

  &:hover .answer-operation {
    opacity: 1;
    visibility: visible;
  }
}
.answer-input {
  // padding: 0 30px;
  width: 100%;
  margin-bottom: 12px;
}

.answer-operation {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.query-container {
  position: relative;
::v-deep(.query-box_text) {
  color: #161C27;
    background-color: rgba(235, 238, 241, 0.8);
  }
  &:hover .query-operation {
    opacity: 1;
    visibility: visible;
  }
}

.query-operation {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
  z-index: 10;
  height: 24px;
}
:deep(.chat-box) {
  flex: 1;
  overflow: hidden;
}
</style>