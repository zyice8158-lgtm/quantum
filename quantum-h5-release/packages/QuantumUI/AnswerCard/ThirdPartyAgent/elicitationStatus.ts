import { ChatController, ChatStatus } from "../../ChatBaseComponent";
import Answer from "../../ChatBaseComponent/types/Answer";
import { onBeforeUnmount, onMounted, watch } from "vue"
import { Resource } from './type';

export function setElicitation(props: {
  noTool?: boolean,
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
}) {

  watch(props?.chat?.chatAction, () => {
    if (props?.answerItem?.answerData?.payload?.action) {
      const aIndex = props.chat.chatAction.findIndex(item => item.id === props.answerItem.id)

      let nextQuestionIndex = -1
      props.chat.chatAction.forEach((item, index) => {
        if (item?.questionData?.intentionType?.includes('elicitation_')) {
          nextQuestionIndex = index
        }
      })

      if (nextQuestionIndex > aIndex) {
        props.answerItem.answerData.payload.action = ''
      }
    }
  })

  watch(props.chat.chatStatus, () => {
    if (props.chat.chatAction[props.chat.chatAction.length - 1]?.id === props.answerItem?.id) {
      if (props.chat.chatStatus.value !== ChatStatus.DONE) {
        props.chat.chatStatus.value = ChatStatus.DONE
      }
    }
  })

  function setElicitationStatus(cmd?: string) {
  }

  onBeforeUnmount(() => {
    if (props?.answerItem?.answerData?.payload?.action) {
      props.chat?.setQueryObject({
        content: '',
        intentionType: "elicitation_cancel"
      });
    }
  })

  return {
    setElicitationStatus
  }
}
