import { onMounted, onUnmounted, ref, Ref, stop } from "vue";
import { useASRPlayer, MessageRes } from "@libs/service";

export type MicrophoneRes = {
  voiceInputValue: Ref<string>;
  isRecognized: Ref<boolean>;
  startVoiceInput: () => void;
  stopVoiceInput: () => void;
};
export const useMicrophone = (): MicrophoneRes => {
  const voiceInputValue = ref("");
  const isRecognized = ref(false);
  const startVoiceInput = () => {
    isRecognized.value = true;
    useASRPlayer.start({ Data: {} });
  };
  const stopVoiceInput = () => {
    isRecognized.value = false;
    useASRPlayer.stop({ Data: {} });
  };

  onMounted(() => {
    useASRPlayer.on((data: MessageRes<Record<string, unknown>>) => {
      if (data.Data.RecognizedText) {
        voiceInputValue.value = data.Data.RecognizedText as string;
        stopVoiceInput();
      } else {
        voiceInputValue.value = data.Data.RecognizingText as string;
      }
    });
  });

  onUnmounted(() => {
    useASRPlayer.off();
  });

  return { voiceInputValue, isRecognized, startVoiceInput, stopVoiceInput };
};
