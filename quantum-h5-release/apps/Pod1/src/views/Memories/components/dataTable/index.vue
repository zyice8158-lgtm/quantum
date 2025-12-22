<template>
  <DataTable
    :value="datasource"
    v-model:selection="localSelectedProducts"
    dataKey="id"
    scrollable
    scrollHeight="flex"
    class="dataTable"
    @row-dblclick="handleDblclick"
    v-automation="'memories_data_table'"
  >
    <Column class="w-[40px]" selectionMode="multiple"></Column>
    <Column class="w-[268px]" field="fileName" :header="t('FKB.tableColumnName')">
      <template #body="slotProps">
        <div
          class="flex item-center justify-between cursor-pointer"
          @click="handleRowClick(slotProps.data, $event)"
        >
          <div class="flex items-center">
            <component
              :is="getTypeIcon(slotProps.data.type)"
              class="text-[24px] mr-[6px] shrink-[0]"
            ></component>
            <span class="w-[244px] whitespace-nowrap overflow-hidden text-ellipsis">{{
              slotProps.data.fileName
            }}</span>
          </div>
        </div>
      </template>
    </Column>
    <Column class="w-[148px]" field="tags" :header="t('FKB.tableColumnTags')">
      <template #body="slotProps">
        <span>{{ slotProps.data.tags ? JSON.parse(slotProps.data.tags).join(", ") : "" }}</span>
      </template>
    </Column>
    <Column class="w-[108px]" field="lastModified" :header="t('FKB.tableColumnLastModified')">
      <template #body="slotProps">
        {{ TimeFormat(slotProps.data.editTime) }}
      </template>
    </Column>
    <Column class="w-[108px]" field="source" :header="t('FKB.tableColumnLocation')">
      <template #body="slotProps">
        <div class="flex items-center">
          <div
            :class="[
              'w-[6px] h-[6px] rounded-[50%] mr-[5px]',
              slotProps.data.source.toUpperCase() === FileLocation.LOCAL
                ? 'bg-text-on-surface-muted'
                : 'bg-secondary',
            ]"
          ></div>
          <span>{{
            slotProps.data.source.toUpperCase() === FileLocation.LOCAL ? "Local" : "Synced"
          }}</span>
        </div>
      </template>
    </Column>
    <Column class="w-[40px]" field="action" :header="t('FKB.tableColumnAction')" frozen>
      <template #body="slotProps">
        <div class="w-full flex justify-center">
          <DropdownMenu
            :items="[
              {
                label: `Manage Tag`,
                command: () => {
                  handleManageTag(slotProps.data);
                },
              },
              {
                label: `Delete`,
                command: () => {
                  handleDelete(slotProps.data);
                },
              },
            ]"
          >
            <div>
              <IconAction class="w-[16px] h-[16px] transform-[rotate(90deg)] cursor-pointer" />
            </div>
          </DropdownMenu>
        </div>
      </template>
    </Column>
  </DataTable>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import DataTable from "@libs/p-comps/volt/DataTable.vue";
import { DataTableRowDoubleClickEvent } from "primevue/datatable";
import Column from "primevue/column";
import Tag from "../tags/tag/index.vue";
import DropdownMenu from "@libs/p-comps/Dropdown";
import {
  IconDocs,
  IconSheets,
  IconNote,
  IconAudioFile,
  IconMemoryFile,
  IconRecycleBin,
  IconAction,
} from "@quantum/icons";
import { FileItem, FileType, FileLocation } from "./index";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useLocale } from "@/hooks/i18n";
import { deleteDocument, deleteMemory, openLocalFile } from "@libs/service";
import "./index.less";
import { isRecordButtonActive } from "@/store/payAttention";
import { handlePayAttentionRowClick } from "./utils";

defineOptions({
  name: "DataTable",
});
const { t, locale } = useLocale();

const props = defineProps({
  selectedProducts: Array<FileItem>,
  datasource: Array<FileItem>,
});
const localSelectedProducts = ref(props.selectedProducts);
const confirm = useConfirm();
const toast = useToast();

const emit = defineEmits([
  "update:selectedProducts",
  "rowDblclick",
  "handleInit",
  "handleManageTag",
  "handleDelete",
]);
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

const handleManageTag = (data: any) => {
  emit("handleManageTag", data);
};
const handleDelete = (data: any) => {
  emit("handleDelete", [data]);
};

const handleRowClick = async (data: FileItem, event?: Event) => {
  console.log(data, "=====");
  // 判断条件临时这么写
  if (
    data.fileName.includes("Payattention") ||
    data.fileName.includes("PayAttention_AudioNote")
  ) {
    await handlePayAttentionRowClick(data.fileName, isRecordButtonActive.value, confirm, toast);
  }
};

const handleDblclick = async (event: DataTableRowDoubleClickEvent) => {
  if (event.data.type === FileType.MEMORY) {
    return emit("rowDblclick", event.data.id);
  }
  if (event.data.source.toUpperCase() === FileLocation.LOCAL) {
    const res = await openLocalFile({ Data: { filePath: event.data.path } });
  }
};
watch(
  localSelectedProducts,
  (newVal) => {
    emit("update:selectedProducts", newVal);
  },
  { deep: true }
);

const TimeFormat = (timeStr: string) => {
  const time = new Date(timeStr);
  const year = time.getFullYear();
  const month = time.getMonth();
  const day = time.getDate();

  const MonthList = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${MonthList[month]} ${day}, ${year}`;
};

defineExpose({
  handleDelete,
});
</script>
