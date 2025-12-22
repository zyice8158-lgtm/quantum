<template>
  <QButton class="related-question"
    v-if="isNeedShowBtn"
    variant="text"
    @click="() => emits('search-more', searchMore())"
  >
    <IconPPlXFIcon class="w-[16px] h-[16px] inline-block align-middle mr-[8px]"/>
    <span class="body-s font-medium">Dive deeper</span>
  </QButton>
  <QButton class="related-question"
    v-if="isNeedShowBtn"
    variant="text"
    @click="() => emits('search-more', searchMore('Deep Dive Image'))"
  >
    <IconPPlXFIcon class="w-[16px] h-[16px] inline-block align-middle mr-[8px]"/>
    <span class="body-s font-medium">Dive image deeper</span>
  </QButton>
</template>

<script setup lang="ts">
import { ChatController, ChatStatus } from '../../ChatBaseComponent';
import { IconPPlXFIcon } from './icon';
import { ref, watch } from 'vue';
import { QButton } from '../../volt/QButton/index';

const emits = defineEmits(["search-more"]);
const props = defineProps<{
  chat: ChatController | undefined;
}>();
const isNeedShowBtn = ref(false)
const qId = ref(null)

watch(props?.chat?.chatAction, () => {
  const pairs = props.chat.chatAction
  const last = pairs[pairs.length - 1]
  let findLastIndex = -1
  pairs.forEach((item, index) => {
    if ('questionData' in item) {
      findLastIndex = index
    }
  })

  if (last && 'answerData' in last && last.chatStatusAnswer.value === ChatStatus.DONE) {
    if (last?.answerData?.tool || last?.answerData?.payload?.action === 'elicitation_response' ) {
      isNeedShowBtn.value = false
      const currentQ = props.chat.chatAction.find(item => item.id === last?.answerData?.questionId)

      if (currentQ?.questionData?.payload) {
        currentQ.questionData.payload.webSearch = false
      }

      return
    } else if (pairs[findLastIndex]?.id !== qId.value) {
      qId.value = pairs[findLastIndex]?.id
      const currentQ = props.chat.chatAction.find(item => item.id === qId.value)

      if (currentQ?.questionData?.content) {
        const history = [
          {
            role: 'user', content: currentQ.questionData.content
          }
        ]

        findIntent(history)
      }

    }
  }
})

const config = {
    apiKey: 'e2c8b4bd8d2f444da955c02dd42d74fd',
    endpoint: 'https://ainow-test-aoai-us.openai.azure.com',
    deployment: 'gpt-4.1',
    apiVersion: '2025-01-01-preview'
}

const categoryLabels = {
    'kbqa': 'Local File Search (RAG)',
    'web_search': 'Internet Web Search',
    'device_ctl': 'Device Control',
    'app_ctl': 'App Control',
    'edge_edit': 'Edge Boundary Confirm',
    'unknown': 'Unknown Intent'
};

const systemPrompt = `
You are the central intent router for an AI assistant named 'Ainow'.
Classify the user's query into exactly one of the following 5 categories.

Categories:
1. "kbqa": Local Knowledge Base / File Search.
   - RULE 1 (Context Priority): If history shows active file context, user questions about file topics (even generic ones like "stock price", "page number") are "kbqa".
   - REASONING: User implies searching *inside* the doc.

2. "web_search": Internet Search.
   - RULE 2a (Explicit): "Search online", "Google it", "Check internet".
   - RULE 2b (Implicit Confirmation): If the Assistant previously asked "Do you want me to search ONLINE?" (or similar) and the user says "Yes", "Okay", or "Check Beijing's", this IS "web_search". The user is confirming the Web fallback.
   - RULE 2c (No Context): Query requires real-time/external info AND no file is being discussed.

3. "device_ctl": Hardware settings.
4. "app_ctl": App actions.
5. "edge_edit": Boundary confirmation.

Conflict Resolution:
- "Search" word is ambiguous. If referring to a file -> kbqa. If confirming a web suggestion -> web_search.
- User input "Yes" / "Do it": Look at what the Assistant just proposed. If proposed Web Search -> web_search. If proposed Opening App -> app_ctl.

Output Format:
Return ONLY a JSON object: {"category": "enum_value"}
`;

async function findIntent(history) {
  if (!history.length) {
    return
  }

  isNeedShowBtn.value = false
  const currentQ = props.chat.chatAction.find(item => item.id === qId.value)

  currentQ.questionData.payload.webSearch = false

  try {
    const cleanEndpoint = config.endpoint.replace(/\/+$/, '');
    const url = `${cleanEndpoint}/openai/deployments/${config.deployment}/chat/completions?api-version=${config.apiVersion}`;

      const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": config.apiKey },
          body: JSON.stringify({
              messages: [
                { role: "system", content: systemPrompt },
                ...history
            ],
              temperature: 0.1,
              response_format: { type: "json_object" }
          })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const content = JSON.parse(data.choices[0].message.content);
      isNeedShowBtn.value = (content.category === 'web_search');
      currentQ.questionData.payload.webSearch = content.category === 'web_search'
  } catch (e) {
    console.log('fetch intent failed.')
  }
}

function searchMore(qs?:string) {
  const query = props.chat.chatAction.find(item => item.id === props.chat.currentQueryId)

  if (query) {
    return {
      content: qs || 'Deep Dive',
      payload: {
        q: query.getData().content,
        overwrite: true,
        imageOnly: !!qs
      },
      intentionType: 'web-search'
    }
  }
}
</script>
