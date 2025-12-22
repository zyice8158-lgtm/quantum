<template>
  <Template :icon="Expedia" :loaded="inited">
    <div class="body-m text-[var(--color-text-on-surface-variant)]">
      <div :class="['answer-plain-content flex-1 break-words',
        iframeType ? 'title title-s' : ''
      ]" v-if="renderDOM" v-html="renderDOM"></div>
      <HTMLResourceRender
        v-if="iframeType"
        class="mt-[20px]"
        :resource="answerItem.answerData.payload?.MCPUI?.resource"
        :onUIAction="listener"
        :html-props="{
          autoResizeIframe: true,
          iframeProps: p
        }"
      />
    </div>
    <AnswerToolBar :chat-action="chat.chatAction" :answer-item="answerItem" />

    <template v-slot:footer>
      <Dialog :visible="!!dialogShow.url"
        :brand="dialogShow.brand"
        :title="dialogShow.title"
        :subTitle="dialogShow.subTitle"
        :cancelBtn="dialogShow.cancelBtn"
        :confirmBtn="dialogShow.confirmBtn"
        @update:visible="() => dialogShow = {
          url: '', brand: '', title: '', subTitle: '',
          confirmBtn: '', cancelBtn: ''
        }"
        @confirm="openURL"
      />
    </template>
  </Template>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { WebviewMessager } from "@libs/service";
import MarkdownIt from 'markdown-it';
import { uuid } from '@primeuix/utils';
import { useI18n } from "vue-i18n";
import { ThemelStore } from '../../../theme/index.ts';

import { UIActionResult } from './MCPUI/types';

import AnswerToolBar from '../Pod6/AnswerToolBar.vue';
import { AnswerActionType, ChatController } from '../../ChatBaseComponent';
import HTMLResourceRender from './MCPUI/HTMLResourceRender.vue';
import { Resource } from './type';
import Answer from '../../ChatBaseComponent/types/Answer';
import Dialog from './Dialog.vue';
import Expedia from './brand/expedia-brand.svg';
import { setElicitation } from './elicitationStatus';
import Template from './Template.vue';

const { locale } = useI18n();

const markdownParser = new MarkdownIt();
const loaded = ref(false)

const props = defineProps<{
  chat: ChatController | undefined
  answerItem: Answer & {
    answerData: {
      content: string // message
      payload?: {
        role: string // Expedia
        followUp: string
        MCPUI?: {
          resource?: Resource
          data?: Record<string, unknown>
        },
        action?: string // query elicitation_response(accept, decline, cancel)
      }
    }
  }
}>()

const { setElicitationStatus } = setElicitation(props)

const p = reactive({
  ref: null
})
const isShow = ref(true)

const renderDOM = computed(() => {
  return props.answerItem.answerData.content && markdownParser.render(props.answerItem.answerData.content);
});

const resultRender = computed(() => {
  return !!props.answerItem.answerData.payload?.MCPUI?.data?.cards
})

const iframeType = computed(() => {
  return (isShow.value || resultRender.value) && props.answerItem.answerData.payload?.MCPUI?.resource?.text
})

const inited = computed(() => {
  return (iframeType.value && loaded.value) || !iframeType.value
})

const dialogShow = ref({
  url: '',
  brand: '',
  title: '',
  subTitle: '',
  cancelBtn: '',
  confirmBtn: ''
})

function openURL() {
  WebviewMessager.sendPostMessage({
    Direction: 0,
    MessageSource: 'Pod9',
    MessageDestination: '',
    MessageMethod: 'OpenUrl',
    Data: {
      url: dialogShow.value?.url || ''
    }
  })

  console.log({
    Direction: 0,
    MessageSource: 'Pod9',
    MessageDestination: '',
    MessageMethod: 'OpenUrl',
    Data: {
      url: dialogShow.value?.url || ''
    }
  })

  setElicitationStatus()

  dialogShow.value = {
    url: '',
    brand: '',
    title: '',
    subTitle: '',
    cancelBtn: '',
    confirmBtn: ''
  }
}

async function listener(result: UIActionResult) {
  if (result.type === 'intent') {
    const { intent, params } = result.payload || {}

    if (intent === 'open-url' && params.url) {
      dialogShow.value.url = params.url as string
      dialogShow.value.brand = params.brand as string
      dialogShow.value.title = params.title as string
      dialogShow.value.subTitle = params.subTitle as string
      dialogShow.value.cancelBtn = params.cancelBtn as string
      dialogShow.value.confirmBtn = params.confirmBtn as string
    }

    console.log(params)

    isShow.value = false

  } else if (result.type === 'notify' && result?.payload?.message) {
    props.chat.setQueryValue(result?.payload?.message)
  }
}

const relatedQuestionsR = ref([])

function loadingAnimation() {
  if (loaded.value) {
    return
  }

  p.ref.onload = null
  let timer: null | number = null

  loaded.value = true

  nextTick(() => {
    timer = setTimeout(() => {
      const followUp = props.answerItem.answerData.payload.followUp

      clearTimeout(timer)

      if (followUp) {
        const followUpAnswer = new Answer()

        followUpAnswer.setData(Object.assign({}, props.answerItem.answerData, {
          content: followUp,
          payload: {
            action: props.answerItem.answerData.payload.action
          },
          actionType: AnswerActionType.FOLLOW_UP,
          response: followUp,
          relatedQuestions: relatedQuestionsR,
          id: uuid()
        }))

        props.answerItem.answerData.payload.action = ''

        props.chat.chatAction.push(followUpAnswer)
      } else if (relatedQuestionsR) {
        props.answerItem.answerData.relatedQuestions = relatedQuestionsR.value
      }

      props.chat.scrollToBottom()
    }, 500)
  })
}

function init() {
  let timer: null | number = null
  p.ref.onload =() => {
    postRenderData(props.answerItem.answerData.payload?.MCPUI?.data)
    let t: null | number = null

    t = setTimeout(() => {
      clearTimeout(t)

      loadingAnimation()
    }, 1000 * 2.5)
  }

  timer = setTimeout(() => {
    clearTimeout(timer)

    if (!loaded.value) {
      console.log('time out post message.')
      postRenderData(props.answerItem.answerData.payload?.MCPUI?.data)
    }

    loadingAnimation()
  }, 1000 * 20)
}

watch(p, (n, o) => {
  if (n?.ref) {
    n?.ref.classList.add('fade-transition-quick')
    init()
  }
}, {
  deep: true
})

function postRenderData(data) {
  p.ref?.contentWindow.postMessage(JSON.stringify({
    type: 'ui-lifecycle-iframe-render-data',
    payload: {
      renderData: {
        ...(data || {}),
        language: locale.value,
        theme: ThemelStore.theme
      }
    }
  }), '*')
}

watch([locale, ThemelStore], () => {
  postRenderData()
})

function formatSuggestionPill(text: string) {
    const punctuation = /[.!?;:]/;

    if (text && punctuation.test(text[text.length - 1])) {
        text = text.slice(0, -1);
    }

    text = text.toLowerCase();

    if (text) {
        text = text[0].toUpperCase() + text.slice(1);
    }

    return text;
}

onMounted(() => {
  const { relatedQuestions } = props.answerItem.answerData
  const [r1, ...r2] = Array.isArray(relatedQuestions) ? relatedQuestions : []

  relatedQuestionsR.value = ((!!r1 && !r1?.icon) ? [
    Object.assign(r1, { icon: Expedia }),
    ...r2
  ] : relatedQuestions).map(item => {
    return Object.assign(item, {
      text: formatSuggestionPill(item.text)
    })
  })

  props.answerItem.answerData.relatedQuestions = []

  loaded.value = false
})
</script>
