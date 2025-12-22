import { ref, computed, watch, onUnmounted, onMounted } from "vue";
import {
    MessageRes,
    useTTSPlayer,
    useASRPlayer,
} from "@libs/service";
import mySDK from "@/components/ChatView/sdkService";
import { ChatController, ChatStatus, ChatComponentType, QuestionType } from "@libs/p-comps";
import Answer from "@libs/p-comps/ChatBaseComponent/types/Answer";
import { FileSearchListType } from "@libs/p-comps/ChatBaseComponent/types";
import { buildQuery } from "./livePrompt";
export type LiveStatus = 'init' | 'recognizing' | 'thinking' | 'responsing';

function useAnimatedText(displayText: ReturnType<typeof ref<string>>) {
    let intervalId: number | null = null;
    let isAnimating = false;
    let lastText = '';

    function animate(newText: string, onComplete?: () => void, speed = 30) {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        if (!newText || newText === displayText.value) {
            onComplete?.();
            return;
        }
        // 处理回退（新内容比旧内容短，直接替换）
        if (displayText.value.length > newText.length || !newText.startsWith(displayText.value)) {
            displayText.value = newText;
            lastText = newText;
            onComplete?.();
            return;
        }
        isAnimating = true;
        let i = Array.from(displayText.value).length;
        const chars = Array.from(newText);
        intervalId = setInterval(() => {
            if (i <= chars.length) {
                displayText.value = chars.slice(0, i).join('');
                i++;
            } else {
                clearInterval(intervalId!);
                intervalId = null;
                isAnimating = false;
                lastText = newText;
                onComplete?.();
            }
        }, speed);
    }

    function reset() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        isAnimating = false;
        lastText = '';
    }

    return { animate, reset };
}
export function useLiveChat(capturePhotoCallback?: () => string | undefined) {
    mySDK.init();
    const chat = ref<ChatController>(new ChatController(mySDK));
    const chatStatus = computed(() => chat.value?.getChatStatus());
    const timeoutTips = "The request timed out. Please try again.";
    const displayText = ref<string>('');
    const status = ref<LiveStatus>('init');

    const { animate, reset } = useAnimatedText(displayText);

    const lastAnswerContent = computed(() => {
        const actions = chat.value?.chatAction;
        if (!actions || actions.length === 0) return '';
        const lastMessage = actions[actions.length - 1];
        if (lastMessage?.getData().type === ChatComponentType.ANSWER) {
            const content = (lastMessage as Answer).answerData.content;
            return typeof content === 'string' ? content : JSON.stringify(content); // 这里处理返回的content 为非字符串形式数据的情况
        }
        return '';
    });

    const stopWatchAnswer = watch(lastAnswerContent, (newContent, oldContent) => {
        if (newContent !== oldContent) {
            displayText.value = newContent;
            useTTSPlayer.streamPlay(newContent);
            if (chatStatus.value === ChatStatus.ONGOING) {
                status.value = 'responsing';
            }
        }
    });

    const stopWatchStatus = watch(chatStatus, (newStatus, oldStatus) => {
        switch (newStatus) {
            case ChatStatus.START:
                status.value = 'thinking';
                break;
            case ChatStatus.ONGOING:
                break;
            case ChatStatus.DONE:
                status.value = 'responsing';
                useTTSPlayer.streamPlay(lastAnswerContent.value, true);
                break;
            case ChatStatus.TIMEOUT:
                status.value = 'responsing';
                displayText.value = timeoutTips;
                break;
        }
        if (oldStatus === ChatStatus.START) {
            useASRPlayer.resume({ Data: { IsLive: true } });
        }
    }, { flush: "post" });

    function sendQueryMessage(content: string, files: Array<FileSearchListType>) {
        if (![ChatStatus.DONE, ChatStatus.TIMEOUT].includes(chat.value.chatStatus.value)) return;
        const question: QuestionType = {
            content: buildQuery(content),
            files,
            payload: { type: "quantum-live" },
            intentionType: 'quantum-live',
        };
        chat.value.setQueryObject(question);
    }

    function handleRecognize(data: MessageRes<Record<string, unknown>>) {
        const { Data } = data;
        const { IsSuccess, RecognizingText, RecognizedText, FilePath, ImageBase64Data } = Data;
        if (!IsSuccess) return;
        if (chat.value.chatStatus.value === ChatStatus.START) return;
        chat.value.stopMessage();
        console.log("handleRecognize data----------:", RecognizingText, RecognizedText);

        status.value = 'recognizing';
        if (RecognizingText) {
            animate(RecognizingText as string);
            useTTSPlayer.stop();
        }
        if (RecognizedText) {
            let files: Array<FileSearchListType> = [
                { fileName: "", filePath: FilePath as string, fileId: "", base64: ImageBase64Data as string }
            ];
            if (capturePhotoCallback) {
                const base64 = capturePhotoCallback();
                if (base64) {
                    files = [{ fileName: "", filePath: '', fileId: "", base64 }]
                }
            }
            animate(RecognizedText as string, () => {
                sendQueryMessage(displayText.value.trim(), files);
                useASRPlayer.pause({ Data: {} })
            });
        }
    }


    function stop() {
        chat.value.stopMessage();
        stopWatchAnswer();
        stopWatchStatus();
        useASRPlayer.stop({ Data: {} });
        useTTSPlayer.stop();
        reset();
    }

    onMounted(() => {
        useASRPlayer.on(handleRecognize);
    });
    onUnmounted(() => {
        stop();
        useASRPlayer.off();

    });

    return {
        displayText,
        status,
        sendQueryMessage,
        chat,
        stop,
    };
}
