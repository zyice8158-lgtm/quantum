import { ChatController, ChatComponentType, Answer } from "../ChatBaseComponent";
export function stopPlayingItem(chat: ChatController) {
    if (!chat?.chatAction) {
        return;
    }
    chat.chatAction.forEach((item) => {
        if (item.getData().type === ChatComponentType.ANSWER) {
            const answer = item as Answer;
            if (answer.answerData.isPlaying) {
                answer.answerData.isPlaying = false;
                const index = chat.chatAction.findIndex(i => i.id === answer.id);
                if (index !== -1) {
                    chat.chatAction.splice(index, 1, answer);
                }
            }
        }
    });

}