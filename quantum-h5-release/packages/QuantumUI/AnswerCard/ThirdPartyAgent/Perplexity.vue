<template>
  <Template :icon="PPLXIcon" :loaded="inited">
    <div v-if="title" class="title"
      :style="textStyle"
    >
      {{ title }}
    </div>
    <div v-if="response?.images?.length" :class="
    ['flex gap-[15px] flex-nowrap w-full overflow-x-auto container overflow-y-hidden',
      showMedia ? 'h-auto pb-[20px]' : 'h-0', 'fade-transition-slow'
    ]">
      <div v-for="(img, idx) in response.images" :key="idx" class="group relative rounded-lg
        h-[160px] rounded-[24px] overflow-hidden
        flex basis-[25%] shrink-0 text-center
        bg-[var(--color-surface-container-highest)]
      " style="flex-basis: 213px;">
        <img
          :src="img.image_url || img.url || img.imageUrl"
          class="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
          referrerpolicy="no-referrer"
          @error="(e) => e.target.parentElement.style.display='none'"
        />
        <div class="absolute top-0 bottom-0 left-0 right-0
          cover
          bg-multiply
        ">
          <div class="absolute top-[9px] right-[8px] z-10">
            <QButton variant="neutral" size="small" class="small-btn" :icon-only="true"
              @click="() => openLink(img.origin_url)"
            >
              <IconOpenLink />
            </QButton>
          </div>
          <div class="absolute inset-x-0 bottom-[0px] right-[0px] text-white p-[16px]">
            <p class="text-[14px] text-white text-left">{{ img.title }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="answer-plain-text">
      <div class="answer-plain-content" v-automation="'answer_content'"
        :style="textStyle" v-html="renderDOM"></div>
      <div
      :style="{
          display: (answerItem.answerData.payload.imageOnly && !response?.images?.length && showMedia) ? 'block' : 'none'
      }">Sorry, no images found. Please try other keywords.</div>
    </div>
    <div v-if="response?.videos?.length" :class="[
      'flex gap-[15px] flex-nowrap w-full overflow-x-auto container overflow-y-hidden',
      showMedia ? 'h-auto py-[20px]' : 'h-0', 'fade-transition-slow'
      ]">
      <div v-for="(vid, idx) in response.videos" :key="idx" class="group relative bg-slate-300 rounded-lg
        h-[160px] rounded-[24px] overflow-hidden
        flex basis-[25%] shrink-0
      " style="flex-basis: 213px;">
        <img
          :src="getVideoThumbnail(vid)"
          class="w-full h-full object-cover transition-transform group-hover:scale-105"
          referrerpolicy="no-referrer"
          @error="(e) => e.target.src='https://placehold.co/400x300/e2e8f0/94a3b8?text=Video'"
        />
        <div class="absolute top-0 bottom-0 left-0 right-0
        cover
          bg-multiply
        ">
          <div
            class="absolute top-[9px] right-[8px] z-10">
            <QButton variant="neutral" size="small" class="small-btn"
              :icon-only="true"
              @click="() => openLink(vid.url)"
            >
              <IconPlay></IconPlay>
            </QButton>
          </div>
        </div>
      </div>
    </div>
    <AnswerToolBar :answer-item="answerItem" :chat-action="chat.chatAction">
      <img :src="PPLXIcon" />
      <span class="ml-[8px]">Perplexity</span>
    </AnswerToolBar>
  </Template>
</template>

<script setup lang='ts'>
import { ChatController } from '../../index';
import { computed, onMounted, ref, watch } from 'vue';
import { marked } from 'marked';
import Answer from '../../ChatBaseComponent/types/Answer';
import PPLXIcon from './brand/pplxIcon.svg'
import AnswerToolBar from '../Pod6/AnswerToolBar.vue';
import { QButton } from '../../volt/QButton/index.tsx';
import { IconOpenLink, IconPPlXFIcon } from './icon.tsx'
import { IconPlay } from '@quantum/icons';
import { WebviewMessager } from "@libs/service";
import Template from './Template.vue';
const props = defineProps<{
  noTool?: boolean,
  answerItem: Answer & {
    answerData: {
      payload: {
        question: string
        imageOnly: Boolean
      }
    }
  }
  chat: ChatController | undefined,
}>();
const inited = ref(false)
const response = ref(null)
const finished = ref(false)

const showMedia = computed(() => {
  return props.answerItem.answerData.payload.imageOnly ?
   (response.value.images?.length || response.value.videos?.length)  : finished.value
})

const textStyle = computed(() => {
  return {
        display: !props.answerItem.answerData.payload.imageOnly ? 'block' : 'none'
      }
})

function openLink(url: string) {
  WebviewMessager.sendPostMessage({
    Direction: 0,
    MessageSource: 'Pod9',
    MessageDestination: '',
    MessageMethod: 'OpenUrl',
    Data: {
      url: url
    }
  })
}

watch(response, () => {
  if (!inited.value) {
    if (response.value.images?.length || response.value.videos?.length) {
      inited.value = true
    }
  }
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

function getFollowUp() {
  if (!response.value?.choices?.[0]?.message?.content) return null;

  let rawText = response.value.choices[0].message.content.replace('### Summary', '');
  rawText = rawText.replace(/\[\d+\]/g, '');

  const primaryMarker = "### Follow-up Questions";
  const fallbackMarker = "Follow-up Questions:"; // 如果模型忘记加 ###

  let splitMarker = primaryMarker;
  if (!rawText.includes(primaryMarker) && rawText.includes(fallbackMarker)) {
      splitMarker = fallbackMarker;
  }

  const parts = rawText.split(splitMarker);

  console.log(1111, parts)

  let followUps = [];

  if (parts.length > 1) {
      const questionsText = parts[1].trim();
      followUps = questionsText.split('\n')
          .map(line => line.trim())
          .filter(line => line.match(/^\d+[\.\)]/)) // 匹配 "1." 或 "1)" 开头的行
          .map(line => line.replace(/^\d+[\.\)]\s*/, '')); // 移除序号

      // 强制截取前两个
      followUps = followUps.slice(0, 2).filter(item => !!item);

      if (followUps && followUps.length) {
        props.answerItem.answerData.relatedQuestions = followUps?.map(item => {
          return { icon: IconPPlXFIcon, text: formatSuggestionPill(item), payload: {
            content: item,
            intentionType: 'web-search'
          }}
        })
      }
  }
}

const getVideoThumbnail = (vid) => {
    if (isYouTube(vid?.url)) {
        const id = getYouTubeId(vid?.url);
        if (id) return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    }
    return vid.thumbnail_url || vid.thumbnail || vid.image_url || vid.imageUrl || '';
};

const isYouTube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));

const getYouTubeId = (url) => {
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return (match && match[2].length === 11) ? match[2] : null;
};

const title = ref('')

const renderDOM = computed(() => {
  if (!response.value?.choices?.[0]?.message?.content) return '';
  const textContent = response.value.choices[0].message.content?.replace(/\[\d+\]/g, '')

  const [t] = textContent.split('\n\n') || []

  title.value = t.replace('### Summary', '')

  let rawText = textContent?.replace(t, '');
  const primaryMarker = "### Follow-up Questions";
  const fallbackMarker = "Follow-up Questions:"; // 如果模型忘记加 ###
  let splitMarker = primaryMarker;

  if (!rawText.includes(primaryMarker) && rawText.includes(fallbackMarker)) {
      splitMarker = fallbackMarker;
  }

  const parts = rawText.split(splitMarker);
  const mainBody = parts[0].trim();

  return marked.parse(mainBody || '');
});

const chunkOperator = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  callback: (value: string) => Promise<void | any>
) => {
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let shouldContinue = true;
  let totalChunks = 0;
  let processedEvents = 0;
  let lastBufferLength = 0;

  const logBufferState = (prefix: string) => {
    if (buffer.length !== lastBufferLength) {
      lastBufferLength = buffer.length;
    }
  };

  try {
    while (shouldContinue) {
      totalChunks++;

      const { done, value } = await reader.read();
      console.log('Read result:', {
        done,
        hasValue: !!value,
        valueLength: value?.length || 0
      });

      if (done) {
        console.log('Stream marked as done');
        shouldContinue = false;

        // 最后一次处理缓冲区
        logBufferState('Before final processing');

        if (buffer.trim()) {
          // 尝试多种方式解析最后的缓冲区
          const possibleEvents = buffer.split(/\n\n|\r\n\r\n/);
          console.log(`Found ${possibleEvents.length} possible events in final buffer`);

          for (const eventText of possibleEvents) {
            if (eventText.trim()) {
              const lines = eventText.split(/\r?\n/);
              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data:')) {
                  const payload = trimmed.substring(5).trim();
                  processedEvents++;
                  console.log(`Final event #${processedEvents}:`, payload);
                  await callback(payload);
                  break;
                }
              }
            }
          }
        }

        console.log(`\n=== Stream Summary ===`);
        console.log(`Total events processed: ${processedEvents}`);
        console.log(`Final buffer length: ${buffer.length}`);

        continue;
      }

      if (!value || value.length === 0) {
        console.log('Skipping empty chunk');
        continue;
      }

      // 解码并处理
      const chunkStr = decoder.decode(value, { stream: true });
      console.log(`Decoded chunk (${chunkStr.length} chars):`,
        JSON.stringify(chunkStr.length > 50 ? chunkStr.substring(0, 50) + '...' : chunkStr));

      buffer += chunkStr;
      logBufferState('After appending chunk');

      // 尝试多种分隔符
      let foundEvent = false;

      // 先尝试 \n\n
      let boundary = buffer.indexOf('\n\n');
      if (boundary === -1) {
        // 再尝试 \r\n\r\n
        boundary = buffer.indexOf('\r\n\r\n');
      }

      while (boundary !== -1) {
        foundEvent = true;
        const chunk = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + (buffer.includes('\r\n\r\n') ? 4 : 2));

        processedEvents++;
        console.log(`\nProcessing event #${processedEvents}`);

        // 使用更灵活的行分割
        const lines = chunk.split(/\r?\n/);
        console.log(`Split into ${lines.length} lines`);

        let dataLineFound = null;
        for (const line of lines) {
          const trimmed = line.trim();
          console.log('Checking line:', trimmed.substring(0, 50));

          if (trimmed.startsWith('data:')) {
            dataLineFound = trimmed;
            break;
          }
        }

        if (dataLineFound) {
          const payload = dataLineFound.substring(5).trim();

          try {
            await callback(payload);
            console.log(`Callback completed for event #${processedEvents}`);
          } catch (error) {
            console.error(`Callback failed for event #${processedEvents}:`, error);
          }
        } else {
          console.warn(`No data: line found in event #${processedEvents}`);
        }

        logBufferState('After processing event');

        // 查找下一个边界
        boundary = buffer.indexOf('\n\n');
        if (boundary === -1) {
          boundary = buffer.indexOf('\r\n\r\n');
        }
      }

      if (!foundEvent) {
        console.log('No complete events found in this chunk');
      }
    }
  } catch (error) {
    console.error('Fatal error in chunkOperator:', error);
    throw error;
  } finally {
    reader.releaseLock();
    console.log('Reader lock released');
  }
};

const FORMAT_INSTRUCTION = `\n\nSTRICT FORMAT:\n### Summary\n[Summary]\n\n[Analysis with ### Headers]\n\n### Follow-up Questions\n1. [Short Q1]\n2. [Short Q2]`;

async function webSearch() {
  const question = props.answerItem.answerData.payload.question

  if (!question) {
    return
  }

  try {
    const url = 'https://api.perplexity.ai/chat/completions';

    const finalContent = question + FORMAT_INSTRUCTION;

    const payload = {
        "model": "sonar-pro",
        "messages": [
            {
                "role": "user",
                "content": finalContent
            }
        ],
        "temperature": 0.1,
        "stream": true,
        "web_search_options": {
          "search_type": "pro"
        },
        media_response: { overrides: { return_images: true, return_videos: true } },
    };

    const res =
      // await fetch('http://localhost:3000/stream-lines')
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer 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`
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`Error ${res.status}: ${errData.error?.message || res.statusText}`);
    }

    const reader = res?.body?.getReader();

    if (!reader) {
      console.log('No Reader')
      return
    }

    await chunkOperator(reader, async (item: string) => {
      try {
        let info = JSON.parse(item)

        if (typeof info === 'string') {
          info = JSON.parse(info)
        }

        if (!inited.value && !props.answerItem.answerData.payload.imageOnly && !title.value.length) {
          inited.value = true
        }

        response.value = info;
      } catch {
        console.log('JSON Parse Failed', item)
      }

      return {}
    }).catch(e => console.log('api request failed', e))

    finished.value = true
} catch (err) {
    if (inited.value === false) {
      response.value = {
        choices: [{
          message: {
            content: 'Failed.'
          }
        }]
      }
    }
} finally {
    inited.value = true
    getFollowUp()
}

props.chat.scrollToBottom()
}

onMounted(() => {
  if (props.answerItem?.answerData?.queryData?.payload) {
    props.answerItem.answerData.queryData.payload.webSearch = true
  }

  inited.value = false
  webSearch()
})
</script>

<style lang="less">
@import './animations.css';

.answer-plain-text {
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: 0.5px;
  color: var(--color-text-on-surface-variant);
  display: flex;
  width: calc(100% - 44px);

  .answer-plain-content {
    flex: 1;
  }
}

:deep(.answer-tool-bar) {
  padding: 0;
}

.small-btn {
  --qbtn-color: var(--color-focus-on-focus);
}

.container::-webkit-scrollbar {
    width: 1px;
    display: none;
}
.cover {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, rgba(0, 0, 0, 0.50) 100%);
}
</style>
