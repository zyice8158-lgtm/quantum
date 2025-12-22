<template>
  <ConfirmDialog
    unstyled
    :pt="theme"
    :ptOptions="{
      mergeProps: ptViewMerge,
    }"
    class="quantum-confirm-dialog p-[8px]"
  >
    <template #container="{ message, acceptCallback, rejectCallback }"
      >
      <div class="flex items-center justify-start shrink-0 p-[10px]">
        <slot name="iconSlot"></slot>
        <span class="font-semibold text-[16px] tracking-wider ml-[10px]">{{ message.header }}</span>
      </div>
      <div class="overflow-y-auto max-w-[600px] pt-[0px] px-[10px] pb-[10px] flex items-center gap-[8px] text-body-m leading-body-m">
        {{ message.message }}
      </div>
      <div class="pt-[0px] px-[10px] pb-[10px] flex justify-end gap-[4px]">
        <SecondaryButton
          v-if="message.rejectProps.severity === 'secondary'"
          class="btn"
          @click="rejectCallback"
          :label="message.rejectProps.label"
          rounded
          variant="text"
        />
        <Button
          v-else
          class="btn"
          @click="rejectCallback"
          :label="message.rejectProps.label"
          rounded
          variant="text"
        />

        <DangerButton
          v-if="message.acceptProps.severity === 'danger'"
          class="btn bg-semantic-error-error border-none"
          @click="acceptCallback"
          :label="message.acceptProps.label"
          rounded
        />
        <ContrastButton
          v-else
          class="btn"
          @click="acceptCallback"
          :label="message.acceptProps.label"
          rounded
        />
      </div>
    </template>
  </ConfirmDialog>
</template>

<script setup lang="ts">
import ConfirmDialog, {
  type ConfirmDialogPassThroughOptions,
  type ConfirmDialogProps,
} from "primevue/confirmdialog";
import { ref } from "vue";
import Button from "./Button.vue";
import SecondaryButton from "./SecondaryButton.vue";
import DangerButton from "./DangerButton.vue";
import ContrastButton from "./ContrastButton.vue";
import { ptViewMerge } from "./utils";

interface Props extends /* @vue-ignore */ ConfirmDialogProps {}
defineProps<Props>();

const theme = ref<ConfirmDialogPassThroughOptions>({
  root: `max-h-[90%] max-w-screen rounded-[28px]
        border border-surface-200 dark:border-surface-700
        bg-surface-0 dark:bg-surface-900
        text-surface-700 dark:text-surface-0 shadow-lg p-[4px] min-w-[523px]`,
  mask: `bg-black/50 fixed top-[0px] start-0 w-full h-full`,
  transition: {
    enterFromClass: "opacity-0 scale-75",
    enterActiveClass: "transition-all duration-150 ease-[cubic-bezier(0,0,0.2,1)]",
    leaveActiveClass: "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
    leaveToClass: "opacity-0 scale-75",
  },
});
</script>
<style scoped lang="less">
.quantum-confirm-dialog {
  .icon-slot {
    svg {
      width: 24px;
      height: 24px;
      display: inline-block;
    }
  }
  .btn {
    padding: 8px 20px;
    /deep/ span {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.1em;
    }
  }
}
</style>

