import { AnswerActionType, ChatComponentType, ChatMessageType } from "@libs/p-comps";
import { apiDeleteMultipleSession, apiDeleteSessionHistory, apiGetAllSession, apiGetSessionHistory, WebviewPostMessage } from "@libs/service";
import { useEvent } from "@quantum/use";
import { reactive } from "vue";
import { v4 as uuidv4 } from 'uuid';

// ----- event start -----
const { runEvent, onEvent } = useEvent()
const KeyChatHistoryChange = 'chat-history-change'
export const onChatHistoryChange = (fn: any) => {
  onEvent(KeyChatHistoryChange, fn)
}
export const emitChatHistoryChange = (list: any) => {
  ChatStore.history = list
  runEvent(KeyChatHistoryChange, list, 'parallel')
}
// ----- event end -----

// ----- fun start -----

type ChatId = string
export const setChatData = async (data: {
  chatId: string,
  title: string,
  messages: ChatMessageType[]
}) => {
  console.error('【setChatData】 not support')
}

export const updateChatData = async (data: {
  chatId: string,
  title: string,
  messages: ChatMessageType[]
}) => {
  console.error('【updateChatData】 not support')
}

export const getChatMessages = async (chatId: string) => {
  const messages: any[] = []
  let list: any[] = []
  try {
    const { data } = await apiGetSessionHistory({ SessionId: chatId }) as any
    const Chunk = JSON.parse(data.Data.Chunk)
    list = JSON.parse(Chunk.data.text) as any[]
  } catch (_) {
    // list = [{ "author": "me", "message": "hi" }, { "author": "ai", "message": "Hello! How can I assist you today?" }, { "author": "me", "message": "where is CHINA？" }, { "author": "ai", "message": "China is located in East Asia and is the world's most populous country. It is bordered by 14 countries, including India, Russia, and Vietnam, and has a vast coastline along the Pacific Ocean to the east. The capital city is Beijing, and other major cities include Shanghai, Guangzhou, and Shenzhen. Would you like to know more about a specific aspect of China?" }]
  }
  list.forEach(item => {
    const { author, message } = item
    const uuid = uuidv4()
    if (author == 'me') {
      messages.push({
        id: uuid,
        questionData: {
          id: uuid,
          content: message,
          timestamp: Date.now(),
          type: ChatComponentType.QUERY,
          actionType: 'text',
        }
      })
    } else if (author == 'ai') {
      let answerData = {
        id: uuid,
        content: message,
        timestamp: Date.now(),
        type: ChatComponentType.ANSWER,
        actionType: 'text',
      }
      if(message.includes('czMCPServer_cloud_image_from_text')) {
        answerData.actionType = AnswerActionType.CREATE_ZONE;
        try {
          answerData.content = JSON.parse(message);
        } catch (error) {
          console.error('【getChatData】 error', error);
        }
      }
      if (message.includes('ExpediaAgent')) {
        let payload = message
        answerData.actionType = AnswerActionType.THIRD_PARTY_AGENT
        answerData.payload = {}

        if (typeof message === 'string') {
          try {
            payload = JSON.parse(payload)
          } catch (error) {
            console.error('【getChatData】 expedia error', error);
          }
        }

        const { followUp, recommendQuestions, MCPUI} = payload || {}

        answerData.content = payload.message
        followUp && (answerData.payload.followUp = `${followUp}`)
        recommendQuestions && (answerData.relatedQuestions = (Array.isArray(recommendQuestions) ? recommendQuestions : []).map((text:string) => ({ text})))

        if (MCPUI?.resource) {
          const url = MCPUI.resource?.text || ''
          const lastSegment = url.split('/').pop()
          const hasFileExtension =
            (lastSegment.includes('.') && lastSegment.indexOf('.') > 0) ||
            url.endsWith('/')

          if (!hasFileExtension) {
            MCPUI.resource.text = `${MCPUI.resource?.text || ''}/`
          }

          answerData.payload.MCPUI = MCPUI
        }
      }

      messages.push({
        id: uuid,
        answerData
      })
    }
  })
  return messages
}

export const getChatData = async (chatId: string, opts: { needMessages?: boolean } = {}) => {
  let chatInfo = ChatStore.history.find(item => item.chatId === chatId)
  if (!chatInfo) {
    await getChatHistory()
    chatInfo = ChatStore.history.find(item => item.chatId === chatId)
  }
  if (!chatInfo) {
    return null
  }
  const { needMessages = true } = opts || {}
  if(chatInfo.isTemp){
    chatInfo['messages'] = []
  }else if (needMessages) {
    chatInfo['messages'] = await getChatMessages(chatId)
  }
  return chatInfo
}

export const deleteChatData = async (chatId: string) => {
  for (let i = 0; i < ChatStore.history.length; i++) {
    const item = ChatStore.history[i]
    if (item.chatId == chatId) {
      ChatStore.history.splice(i, 1)
      await apiDeleteSessionHistory({ SessionId: chatId })
      break
    }
  }
}

export const deleteChatDatas = async (chatIds: string[] = []) => {
  await apiDeleteMultipleSession({ SessionIdList: chatIds })
}


let apiGetAllSessionPromise: Promise<any>
export const getChatHistory = async () => {
  const history: any[] = []
  let list: any = []
  try {
    if(!apiGetAllSessionPromise){
      apiGetAllSessionPromise = apiGetAllSession()
    }
    const res = await apiGetAllSessionPromise as any
    const { data } = res
    const Chunk = JSON.parse(data.Data.Chunk)
    list = JSON.parse(Chunk.data.text) as any[]
    list = JSON.parse(data.text) as any[]

  } catch (_) {
    // list = [{ "sessionID": "372c3b28-26bc-479d-be37-da652f31c6db", "sessionName": "", "lastModifiedTimestamp": 1762322150018 }]
  }
  list.forEach((item: any) => {
    const { sessionID, sessionName, lastModifiedTimestamp } = item
    history.push({
      chatId: sessionID,
      title: sessionName || new Date(lastModifiedTimestamp).toLocaleString(),
      sessionName,
      lastModifiedTimestamp
    })
  })
  ChatStore.history = history
  apiGetAllSessionPromise = null
}


export const createChatSession = () => {
  return WebviewPostMessage({
    Direction: 0,
    MessageSource: "WebMain",
    MessageDestination: "",
    MessageMethod: "NewSession",
    Data: {
    },
  }).then((Data: any) => {
    const { sessionID } = JSON.parse(JSON.parse(Data.Chunk).data.text)
    return sessionID
  })
}

export const unshiftChatTempHistory = (sessionId: string) => {
  const lastModifiedTimestamp = Date.now()
  ChatStore.history.unshift({
    chatId: sessionId,
    title: new Date(lastModifiedTimestamp).toLocaleString(),
    isTemp: true,
    sessionName: '',
    lastModifiedTimestamp
  })
}

export const changeCurrentSession = (sessionId: string) => {
  return WebviewPostMessage({
    Direction: 0,
    MessageSource: "WebMain",
    MessageDestination: "",
    MessageMethod: "ChangeCurrentSession",
    Data: {
      SessionId: sessionId
    },
  })
}

// ------ fun end -----

export const ChatStore = reactive({
  history: [],
})

