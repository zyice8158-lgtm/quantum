import { useBroadcastChannel, useBroadcastChannelStore, useEventBus, useSessionStorage } from "@quantum/use";
import { reactive, watch } from "vue";
import { openQuantumChatWin, WindowIdStore } from "./window";

export type ChatWInType = 'Chat' | 'CMU' | 'Thinking' | 'Live' | 'StartCamera' | 'EndLive'| 'LiveErrorCamera' | 'SuggestionContainer' | ''

const SessionStorage = useSessionStorage()

export const ChatWinStore = useBroadcastChannelStore('ChatWinStore', reactive({
  view: SessionStorage.get('view', '') as ChatWInType,
  liveErrorCamera: "",
  currentChatId: '',
}))


export const ChatWinChannel = useBroadcastChannel('ChatWin');
export const ChatWinBus = useEventBus({ scopeName: 'ChatWin' })

export const ChatWinChangeView = async (view: ChatWInType) => {
  if (view) {
    await openQuantumChatWin('#/chat-win')
  }

  ChatWinStore.view = view
  SessionStorage.set('view', view)
  await ChatWinChannel.emit('view', view)
}

watch(() => WindowIdStore.Chat, (id) => {
  if (!id) {
    ChatWinChangeView('')
  }
})

export const ChatViewChannel = useBroadcastChannel('ChatView');
export const ChatViewBus = useEventBus({ scopeName: 'ChatView' })
