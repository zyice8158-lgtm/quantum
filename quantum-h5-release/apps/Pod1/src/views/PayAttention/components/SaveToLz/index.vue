<template>
  <div
    v-if="visible && !isRecording"
    class="save-to-lz flex items-center rounded-[20px] h-[64px] py-[12px] px-[16px] w-full mb-[16px]"
  >
      <div class="title-s flex-1 select-none">
          {{ t('payAttention.saveToLearningZone') }}
        </div>
      <div class="save-to-lz-dialog__actions flex items-center gap-[8px]">
        <button
          class="save-to-lz-dialog__btn save-to-lz-dialog__btn--cancel"
          @click="handleCancel"
        >
          {{ t('payAttention.cancel') }}
        </button>
        <button
          class="save-to-lz-dialog__btn save-to-lz-dialog__btn--apply"
          @click="handleApply"
        >
          {{ t('payAttention.apply') }}
        </button>
        <IconClose class="w-[24px] h-[24px] ml-[8px] text-text-on-surface cursor-pointer" @click="handleCancel"/>
      </div>
  </div>
</template>

<script setup lang="ts">
import { IconClose } from '@quantum/icons';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useToast } from "primevue/usetoast";
import { WebviewMessager } from "@libs/service";
import { useLocale } from "@/hooks/i18n";
const toast = useToast();
const { t } = useLocale();

defineProps<{
  isRecording: boolean;
}>();
const visible = ref(true);

const handleCancel = () => {
  visible.value = false;
};

const handleApply = () => {
  // to 联调
  visible.value = false;
  WebviewMessager.sendStreamMessage(
    {
      Direction: 0,
      MessageSource: "window1",
      MessageDestination: "module1",
      MessageMethod: "saveToLearningZone",
      Data: {},
    },
    {
      onData: (data: unknown) => {
        // 处理响应数据
        const response = data as {
          Data?: { IsSuccess?: boolean };
          ErrorMessage?: string;
        };

        if (response.Data?.IsSuccess) {
          toast.add({
            severity: "success",
            summary: "Save to LearningZone success",
            life: 3000,
          });
        } else {
          toast.add({
            severity: "error",
            summary: response.ErrorMessage || "Save to LearningZone failed",
            life: 3000,
          });
        }
        visible.value = false;
      },
      onDone: () => {
        console.log("Save to LearningZone request completed");
      },
      onError: (error: unknown) => {
        console.error("Save to LearningZone error:", error);
        visible.value = false;
      },
    }
  );
};

</script>

<style scoped lang="less">
.save-to-lz {
  background: var(--color-surface);
}
.save-to-lz-dialog__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  min-width: 400px;
}

.save-to-lz-dialog__btn {
  padding: 10px 20px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  outline: none;
  white-space: nowrap;

  &--cancel {
    background: #FFFFFF;
    border: 1px solid #6C43C6;
    color: #6C43C6;

    &:hover {
      background: #855EE11F;
    }

    &:active {
      background: #855EE12D;
    }
  }

  &--apply {
    background: #855EE1;
    color: #FFFFFF;

    &:hover {
      background: #6B4BB8;
    }

    &:active {
      background: #5A3D9A;
    }
  }
}

</style>
