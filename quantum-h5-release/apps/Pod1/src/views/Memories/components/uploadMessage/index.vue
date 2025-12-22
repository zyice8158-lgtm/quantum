<template>
  <Dialog
    v-model:visible="props.visible"
    :draggable="false"
    position="bottomright"
    class="w-[344px] mr-[40px] mb-[40px]"
  >
    <template #header>
      <div class="flex justify-start items-center">
        <IconUpload class="text-[24px] mr-[14px]" />
        <span class="text-[16px] font-bold">{{ t("FKB.uploadDialogTitle") }}</span>
      </div>
    </template>
    <template #closebutton>
      <QButton variant="text" @click="handleCloseUpload" v-automation="'close_upload_btn'">
        <IconClose class="text-title-s" />
      </QButton>
    </template>
    <template #default>
      <div class="px-[40px] py-[0] max-h-[40vh] overflow-y-auto">
        <div
          v-for="(item, index) in props.files"
          :class="[
            'flex justify-between items-center w-[212px] h-[48px] p-[8px] pr-[12px] rounded-16  border-[1px] mb-[8px]',
            item.status === FileStatus.FAIL
              ? 'bg-error-container border-semantic-error-error'
              : 'bg-secondary-container border-overlay-outline-variant',
          ]"
        >
          <div class="flex w-full">
            <div
              class="w-[32px] h-[32px] flex justify-center items-center rounded-max bg-surface shrink-0 relative"
            >
              <div class="file-upload-loading" v-if="item.status === FileStatus.UPLOADING">
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke-width="8"
                    stroke-dasharray="62.8318, 188.4956"
                    transform="rotate(-90, 50, 50)"
                    stroke="var(--color-secondary)"
                  ></circle>
                </svg>
              </div>
              <FileIcon :iconType="item.fileType" />
            </div>
            <div :class="['flex flex-col ml-[8px]',(item.status === FileStatus.UPLOADING || item.status === FileStatus.FAIL) ? 'max-w-[116px]' : 'max-w-[152px]',]">
              <span
                class="whitespace-nowrap overflow-hidden text-ellipsis text-body-s text-text-on-surface leading-label-s"
                >{{ item.fileName }}</span
              >
              <span
                class="text-body-s text-text-on-surface-variant leading-label-s whitespace-nowrap overflow-hidden text-ellipsis"
                >{{ item.message }}</span
              >
            </div>
          </div>
          <div class="operations w-[32px] flex justify-center items-center shrink-0">
            <QButton
              variant="text"
              @click="
                () => {
                  handleCancel(item, index);
                }
              "
              v-if="(item.status === FileStatus.UPLOADING || item.status === FileStatus.FAIL)"
              >
              <IconClose class="text-title-s" />
            </QButton>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineOptions, defineProps, watch } from "vue";
import Dialog from "@libs/p-comps/volt/Dialog.vue";
import { IconClose, IconUpload } from "@quantum/icons";
import { UploadFileItem, FileStatus } from "./index";
import { useLocale } from "@/hooks/i18n";
import FileIcon from "@libs/p-comps/iconDocument/FileIcon.vue";
import "./index.less";

defineOptions({
  name: "UploadMessage",
});
const { t } = useLocale();

const props = defineProps({
  visible: Boolean,
  handleCloseUpload: Function,
  handleCancel: Function,
  files: Array<UploadFileItem>,
});
</script>
