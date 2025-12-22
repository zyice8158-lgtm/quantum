import { ChatController, AgentParams } from '@/types/Chat'
import { reactive } from 'vue'



export const ChatHooks = (params: AgentParams, isHistory: boolean) => {
    const chat = reactive(new ChatController(params, isHistory))
    return {
        chat
    }
}
