<template>
  <!-- New Tag Dialog -->
  <Dialog
    v-model:visible="showAddDialog"
    :draggable="false"
    :closable="false"
    class="w-[640px] p-[16px]"
  >
    <template #header>
      <div class="flex w-full justify-between items-center">
        <div class="flex items-center">
          <IconTag class="text-[24px] mr-[14px]" />
          <span class="text-[16px] font-bold">{{ t("FKB.tagsCreateDialogTitle") }}</span>
        </div>
      </div>
    </template>
    <template #default>
      <div
        class="relative w-full h-[56px] flex flex-col px-[16px] py-[8px] rounded-[12px] mb-[16px] border-[1px] border-overlay-outline-variant"
      >
        <span class="text-primary text-[12px]">{{ t("FKB.tagsCreateInnerTitle") }}</span>
        <input
          class="font-text-title-s outline-none text-[16px] leading-[22px]"
          type="text"
          placeholder="Name"
          v-model="tagName"
        />
      </div>
      <div class="flex justify-end">
        <QButton variant="text" @click="handleCancel">{{ t("FKB.tagsCreateCancelBtn") }}</QButton>
        <QButton color="primary" :disabled="!tagName.length" @click="handleCreate">{{
          t("FKB.tagsCreateCreateBtn")
        }}</QButton>
      </div>
    </template>
  </Dialog>
  <!-- Manage Tag Dialog -->
  <Dialog
    v-model:visible="showManageDialog"
    :draggable="false"
    :closable="false"
    class="w-[640px] p-[16px] relative"
  >
    <template #header>
      <div class="flex w-full justify-between items-center">
        <div class="flex items-center">
          <IconTag class="text-[24px] mr-[14px]" />
          <span class="text-[16px] font-bold">{{
            isAddTag ? t("FKB.tagsManageAddTitle") : t("FKB.tagsManageDialogTitle")
          }}</span>
        </div>
      </div>
    </template>
    <template #default>
      <div class="w-full mb-[16px] bg-validation-background rounded-[24px] flex-col">
        <div v-if="!isAddTag">
          <span class="text-body-s text-text-on-surface-variant leading-label-s">{{
            t("FKB.tagsManageSelectedFile")
          }}</span>
          <div class="w-full p-[8px] bg-secondary-container-pressed rounded-16 my-[12px]">
            <div
              v-for="item in propData"
              class="flex w-[212px] h-[48px] p-[8px] pr-[12px] rounded-16 bg-secondary-container border-[1px] border-overlay-outline-variant"
            >
              <div
                class="w-[32px] h-[32px] flex justify-center items-center rounded-max bg-surface shrink-0"
              >
                <IconFileWord class="text-[16px]" />
              </div>
              <div class="flex flex-col ml-[8px]">
                <span
                  class="max-w-[152px] whitespace-nowrap overflow-hidden text-ellipsis text-body-s text-text-on-surface leading-label-s"
                  >{{ item.fileName }}</span
                >
                <span class="text-body-s text-text-on-surface-variant leading-label-s">{{
                  item.type
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!isAddTag">
          <span class="text-body-s text-text-on-surface-variant leading-label-s">{{
            t("FKB.tagsManageCurrentTags")
          }}</span>
          <div
            class="w-full min-h-[38px] p-[8px] bg-secondary-container-pressed rounded-16 flex my-[12px]"
          >
            <div
              v-for="(item, index) in currentTags"
              class="flex items-center px-[8px] py-[2px] cursor-pointer rounded-max border-[1px] border-text-on-surface-variant mr-[13px]"
            >
              <span class="text-label-s leading-label-s">{{ item }}</span>
              <IconClose
                class="text-text-on-surface text-label-s leading-label-s ml-[6px] cursor-pointer"
                @click="handleDeleteCurrentTag(index)"
              />
            </div>
          </div>
        </div>
        <div v-if="!isAddTag">
          <span class="text-body-s text-text-on-surface-variant leading-label-s">{{
            t("FKB.tagsManageSuggestedTags")
          }}</span>
          <div class="w-full p-[8px] bg-secondary-container-pressed rounded-16 flex my-[12px]">
            <div
              v-for="item in suggestedTags"
              class="flex items-center px-[8px] py-[2px] cursor-pointer rounded-max border-[1px] border-text-on-surface-variant mr-[13px]"
              @click="handleSuggestedTag(item)"
            >
              <span class="text-label-s leading-label-s">{{ item.label }}</span>
            </div>
          </div>
        </div>
        <div>
          <div
            class="flex flex-col w-full bg-surface rounded-24 p-[12px] border-[1px] border-overlay-outline-variant overflow-hidden"
          >
            <div class="flex justify-between items-center w-full">
              <IconSearchMagnifier class="text-title-xl text-text-on-surface shrink-0 mx-[12px]" />
              <input
                type="text"
                :placeholder="t(`FKB.tagsManagePlaceholder`)"
                class="w-full text-label-m leading-label-m outline-none"
                v-model="searchInput"
                @input="handleInput"
              />
              <IconForward v-if="!searchInput" class="text-title-l text-text-on-surface shrink-0" />
              <div
                v-else
                class="w-[32px] h-[32px] rounded-max bg-surface-disabled cursor-pointer flex justify-center items-center shrink-0"
                @click="searchInput = ''"
              >
                <IconClose class="text-label-l text--text-on-surface cursor-pointer" />
              </div>
            </div>
            <div
              class="w-[120%] h-[1px] bg-overlay-outline-variant my-[8px] -ml-[10%]"
              v-if="searchInput"
            ></div>
            <div v-if="searchInput">
              <span class="text-body-s text-text-on-surface-variant leading-label-s">{{
                !searchResults.length
                  ? t(`FKB.tagsManageNoResultsMsg`)
                  : t(`FKB.tagsManageResultsTitle`)
              }}</span>
              <div v-if="!searchResults.length" class="w-full flex mt-[12px]">
                <div
                  class="flex items-center px-[8px] py-[2px] cursor-pointer rounded-max border-[1px] border-text-on-surface-variant"
                  @click="handleCreate"
                >
                  <IconAdd class="text-label-s leading-label-s mr-[6px]" />
                  <span class="text-label-s leading-label-s"
                    >{{ t("FKB.tagsManageNoResultToCreate") }} '{{ searchInput }}'</span
                  >
                </div>
              </div>
              <div v-else class="w-full flex mt-[12px]">
                <div
                  v-for="item in searchResults"
                  class="flex items-center px-[8px] py-[2px] cursor-pointer rounded-max border-[1px] border-text-on-surface-variant mr-[13px]"
                  @click="handleSuggestedTag(item)"
                >
                  <span class="text-label-s leading-label-s">{{ item.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="isAddTag">
          <span class="text-body-s text-text-on-surface-variant leading-label-s">{{
            t("FKB.tagsManageSuggestedTags")
          }}</span>
          <div class="w-full p-[8px] bg-secondary-container-pressed rounded-16 flex my-[12px]">
            <div
              v-for="item in suggestedTags"
              class="flex items-center px-[8px] py-[2px] cursor-pointer rounded-max border-[1px] border-text-on-surface-variant mr-[13px]"
              @click="handleSuggestedTag(item)"
            >
              <span class="text-label-s leading-label-s">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-end">
        <QButton variant="text" @click="handleCancel">{{ t("FKB.tagsManageCancelBtn") }}</QButton>
        <QButton color="primary" @click="handleSave">{{ t("FKB.tagsManageSaveBtn") }}</QButton>
      </div>
      <div
        v-show="showTagsLimit"
        class="absolute bottom-[-56px] left-0 w-[320px] h-[48px] px-[16px] rounded-16 p-[8px] flex justify-between items-center bg-error-container"
      >
        <span class="text-body-m leading-body-m text-text-on-surface">
          {{ t("FKB.tagsManageTagsLimitMsg") }}
        </span>
        <IconClose
          class="text-text-on-surface text-body-m cursor-pointer"
          @click="showTagsLimit = false"
        />
      </div>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { defineOptions, defineProps, defineEmits, ref, watch, computed, ComputedRef } from "vue";
import Dialog from "@libs/p-comps/volt/Dialog.vue";
import { QButton } from "@libs/p-comps/volt/QButton";
import { FileTypeItem } from "../multiSelectButton/index";
import {
  IconTag,
  IconMini,
  IconRevocation,
  IconClose,
  IconFileWord,
  IconSearchMagnifier,
  IconForward,
  IconAdd,
} from "@quantum/icons";
import { addLabel, bindToLabel, updateDocumentLabel } from "@libs/service";
import { useLocale } from "@/hooks/i18n";
import { useToast } from "primevue/usetoast";
import { changeGlobalStore } from "@/store/global";

defineOptions({
  name: "Tags",
});

const { t, locale } = useLocale();
const toast = useToast();

const props = defineProps<{
  tagOptions: Array<FileTypeItem>;
}>();
const emit = defineEmits(["createTag", "updateTag"]);

const propData = ref([]);
const currentTags = ref([]);
const suggestedTags: ComputedRef<Array<FileTypeItem>> = computed(() =>
  props.tagOptions.slice(0, 3),
);
const searchInput = ref("");
const showAddDialog = ref(false);
const showManageDialog = ref(false);
const showTagsLimit = ref(false);
const searchResults = ref([]);
const isAddTag = ref(false);
const tagName = ref("");
const addTag = () => {
  showAddDialog.value = true;
};
const handleSave = async () => {
  changeGlobalStore("gLoading", true);
  let flag = true;
  await currentTags.value.forEach(async (item) => {
    const res = await updateDocumentLabel({
      Data: { labelId: item, docIds: [...propData.value.map((item) => item.id)] }, //need labelId
    });
    if (res.data.Data.Status !== "complete") {
      showManageDialog.value = false;
      flag = false;
      toast.add({
        severity: "error",
        summary: "Error",
        detail: res.data.Data.Text,
        life: 3000,
      });
      return;
    }
  });
  if (flag) {
    toast.add({
      severity: "success",
      summary: "Success",
      detail: t("FKB.tagsManageSuccessMsg"),
      life: 3000,
    });
    emit("updateTag");
    showManageDialog.value = false;
  }
};
const handleCancel = () => {
  tagName.value = "";
  showAddDialog.value = false;
  showManageDialog.value = false;
};
const handleInput = (e: Event) => {
  searchResults.value = props.tagOptions.filter((item) =>
    item.label.toLocaleLowerCase().includes(searchInput.value.toLocaleLowerCase()),
  );
};
const handleDeleteCurrentTag = (index: number) => {
  currentTags.value.splice(index, 1);
};
const handleSuggestedTag = (item: FileTypeItem) => {
  if (currentTags.value.findIndex((itemInner) => itemInner === item.label) === -1) {
    //itemInner.lable === item.label
    if (currentTags.value.length >= 3) {
      showTagsLimit.value = true;
      setTimeout(() => {
        showTagsLimit.value = false;
      }, 4000);
      return;
    }
    currentTags.value.push(item.label); //currentTags.value.push(item.id)
  }
};
const handleCreate = async () => {
  changeGlobalStore("gLoading", true);
  const res = await addLabel({ Data: { labelName: tagName.value || searchInput.value } });
  if (JSON.parse(res.data.Data.Text as string).success === true) {
    toast.add({
      severity: "success",
      summary: "Success",
      detail: t("FKB.addTagSuccessMsg"),
      life: 3000,
    });
    emit("createTag");
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: res.data.Data.Text,
      life: 3000,
    });
  }
  changeGlobalStore("gLoading", false);
  showAddDialog.value = false;
};
const handleManageTag = (data: Array<any>, isAdd: boolean) => {
  propData.value = data;
  isAddTag.value = isAdd;
  if (!isAdd) {
    currentTags.value = JSON.parse(data.tags || "[]");
  }
  showManageDialog.value = true;
};

watch(
  () => searchInput.value,
  (newVal) => {},
);

defineExpose({
  addTag,
  handleManageTag,
});
</script>
