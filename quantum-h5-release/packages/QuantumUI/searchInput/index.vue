<template>
  <div class="w-full relative w-full h-[64px]">
    <div
      class="searchInput-outer w-full p-[8px] bg-surface-blur backdrop-blur-[70px] rounded-32 shadow-[0_0_10px_0_rgba(0,0,0,0.1)] absolute top-[0px] left-[0px] z-999"
    >
      <div class="inputArea flex justify-between items-center">
        <Button
          rounded
          v-if="!showSearch && showQtIcon"
          class="w-[48px]! h-[48px]! bg-surface shrink-0 mr-[12px] quantumLogo"
        >
          <template #icon>
            <IconQuantumLogo class="text-headline-l" />
          </template>
        </Button>
        <div class="w-full rounded-24 flex justify-between items-center bg-surface">
          <IconSearchMagnifier
            v-if="!showQtIcon"
            class="text-title-xl text-text-on-surface m-[12px]"
          />
          <IconAdd v-else class="text-title-xl text-text-on-surface m-[12px] cursor-pointer" />
          <input
            type="text"
            :class="[
              'w-full text-body-m leading-body-m text-text-on-surface outline-none',
              showSearch && showQtIcon ? 'ml-[16px]' : '',
            ]"
            :value="modelValue"
            :placeholder="placeholder"
            @input="
              (e) => {
                handleInput(e);
              }
            "
            @keydown="
              (e) => {
                if (e.key === 'Enter' && showSearch) {
                  handleSearch();
                }
              }
            "
          />
          <Button
            rounded
            v-if="showSearch"
            class="w-[40px]! h-[40px]! bg-[#F4F3F7]! shrink-0 mr-[12px]"
            @click="
              () => {
                handleClear();
              }
            "
          >
            <template #icon>
              <IconClose class="text-title-s text-focus" />
            </template>
          </Button>
          <AiButton
            rounded
            class="w-[40px]! h-[40px]! shrink-0 bg-on-primary mr-[4px]"
            @click="handleVoiceInput"
            :disabled="isRecognized"
            :category="isRecognized?'chat':''"
          >
              <IconMic class="text-title-xl text-focus" />
          </AiButton>
        </div>
        <Button
          rounded
          :class="[
            'w-[48px]! h-[48px]! ml-[12px] shrink-0',
            showSearch
              ? 'bg-primary! text-on-primary!'
              : 'bg-on-primary! text-inverse-on-focus! pointer-events-none',
          ]"
          @click="
            () => {
              handleSearch();
            }
          "
        >
          <template #icon>
            <IconForward class="text-title-l" />
          </template>
        </Button>
      </div>
      <div
        v-if="promptList.length"
        class="promptItems relative p-[4px] pt-[12px] rounded-[24px] rounded-t-none"
      >
        <div
          class="promptItem cursor-pointer p-[12px] flex items-center w-full h-[48px] rounded-12 hover:bg-surface-hover active:bg-primary-container active:font-bold"
          v-for="item in promptList.slice(0, 4)"
          @click="
            () => {
              getPrompt(item);
            }
          "
        >
          <span
            class="w-full text-body-m leading-body-m text-on-primary-container whitespace-nowrap overflow-hidden text-ellipsis"
            >{{ item }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, defineOptions, defineProps, watch } from "vue";
import Button from "../volt/Button.vue";
import { AiButton } from "../volt/QButton";
import {
  IconQuantumLogo,
  IconMic,
  IconForward,
  IconClose,
  IconSearchMagnifier,
  IconAdd,
} from "@quantum/icons";
import { useMicrophone } from "../hooks/useMicrophone";

defineOptions({
  name: "SearchInput",
});

const props = defineProps({
  placeholder: String,
  promptList: Array<string>,
  modelValue: String,
  handleSearch: Function,
  showQtIcon: {
    type: Boolean,
    default: false,
  },
});

const showSearch = ref(false);
const { isRecognized, voiceInputValue, startVoiceInput } = useMicrophone();
const voiceText = voiceInputValue;

watch(
  () => props.modelValue,
  () => {
    showSearch.value = !!props.modelValue;
  }
);

watch(
  () => voiceText.value,
  () => {
    emit("update:modelValue", voiceText.value);
  }
);

const emit = defineEmits(["update:modelValue"]);
const handleClear = () => {
  emit("update:modelValue", "");
};
const getPrompt = (str: string) => {
  emit("update:modelValue", str);
};
const handleInput = async (e: Event) => {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
};

const handleVoiceInput = () => {
  startVoiceInput();
};
</script>
<style lang="less" scoped>
.quantumLogo {
  transition: all 0.5s ease-in-out;
  &:hover {
    transform: rotate(360deg);
  }
}
</style>
