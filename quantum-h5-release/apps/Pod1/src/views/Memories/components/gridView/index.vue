<template>
  <div class="gridView grid grid-cols-3 gap-[16px] h-full overflow-auto">
    <div
      class="itemCard h-[200px] flex flex-col rounded-[16px] p-[16px] bg-surfaces-surface-blur-low cursor-pointer active:bg-primary-container hover:bg-surface-hover"
      v-for="item in datasource"
      :key="item.id"
    >
      <div class="card-tops flex items-center justify-between mb-[8px]">
        <div class="flex items-center">
          <component :is="getTypeIcon(item.type)" class="text-[24px] mr-[6px]"></component>
          <span
            class="w-[195px] text-body-s leading-body-s text-text-on-surface whitespace-nowrap overflow-hidden text-ellipsis"
            >{{ item.fileName }}</span
          >
        </div>
        <DropdownMenu
          :items="[
            {
              label: `Manage Tag`,
              command: () => {
                handleManageTag(item);
              },
            },
            {
              label: `Delete`,
              command: () => {
                handleDelete(item);
              },
            },
          ]"
        >
          <div>
            <IconAction class="w-[16px] h-[16px] transform-[rotate(90deg)] cursor-pointer" />
          </div>
        </DropdownMenu>
      </div>
      <div
        class="card-content"
        @click="
          () => {
            openFilesOrMemory(item);
          }
        "
      >
        <img
          class="w-full h-[136px] rounded-[16px] object-cover object-center"
          :src="`${baseURL}/fkb/local?localPath=${encodeURIComponent(item.contentUri?item.contentUri[0]:'')}`"
          alt=""
          :onerror="`this.src='${emptyImg}'`"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineOptions, defineProps, defineEmits, ref, watch } from "vue";
import {
  IconDocs,
  IconSheets,
  IconNote,
  IconAudioFile,
  IconMemoryFile,
  IconAction,
} from "@quantum/icons";
import { FileItem, FileType } from "../dataTable/index";
import DropdownMenu from "@libs/p-comps/Dropdown";
import { openLocalFile,baseURL } from "@libs/service";
import "./index.less";
import emptyImg from "@/assets/img/memory/empty.svg";

defineOptions({
  name: "GridView",
});

const props = defineProps({
  selectedProducts: Array<FileItem>,
  datasource: Array<FileItem>,
});

const emit = defineEmits(["openMemory", "handleDelete", "handleManageTag"]);
const openFilesOrMemory = async (data: any) => {
  if (data.type === FileType.MEMORY) {
    return emit("openMemory", data.id);
  } 
  if(data.source.toUpperCase() === FileLocation.LOCAL){
    const res = await openLocalFile({ Data: { filePath: data.path } });
  }
};

const handleManageTag = (data: any) => {
  emit("handleManageTag", data);
};
const handleDelete = (data: any) => {
  emit("handleDelete", data.id);
};
const getTypeIcon = (type: string) => {
  switch (type) {
    case FileType.NOTE:
      return IconNote;
    case FileType.DOCS:
      return IconDocs;
    case FileType.SHEET:
      return IconSheets;
    case FileType.AUDIO:
      return IconAudioFile;
    case FileType.MEMORY:
      return IconMemoryFile;
    default:
      return IconNote;
  }
};
</script>
<style scoped lang="less"></style>
