<template>
  <Dialog
    v-model:visible="showCreateMemoryDialog"
    :draggable="false"
    class="w-[640px] bg-[#ffffff] border-none rounded-24 p-[16px] relative"
    modal
  >
    <template #header>
      <div class="flex">
        <IconMemories class="text-title-xl mr-[12px]" />
        <div class="flex flex-col">
          <span class="text-title-m font-bold leading-title-m text-text-on-surface">{{
            t("FKB.memoryCreateDialogTitle")
          }}</span>
          <span class="text-body-m leading-body-m text-text-on-surface-variant">{{
            t("FKB.memoryCreateDialogDescription")
          }}</span>
        </div>
      </div>
    </template>
    <template #closebutton>
      <div></div>
    </template>
    <template #default>
      <div class="w-full flex flex-col items-start">
        <div class="imgs flex items-center">
          <div
            class="mb-[16px] w-[96px] h-[96px] relative mr-[8px]"
            v-for="(item, index) in imgList"
          >
            <img
              :src="item.showingUrl"
              alt=""
              :class="[
                'w-[96px] h-[96px] rounded-16 cursor-pointer imgItem',
                largeImgIndex === index ? 'largeImg' : '',
              ]"
              @click="showLargerImg(item, index)"
            />
            <IconClose
              class="text-title-xl p-[4px] text-text-on-surface rounded-max bg-focus-container absolute top-[6px] right-[6px] cursor-pointer"
              @click.stop="
                () => {
                  handleDeleteImg(item, index);
                }
              "
              v-if="isCreate"
            />
          </div>
        </div>
        <div class="w-full flex flex-col items-center justify-center">
          <div
            class="w-full p-[12px] mb-[16px] rounded-12 border-[1px] border-outlines-outline-variant"
          >
            <textarea
              type="text"
              :rows="rows"
              v-model="inputValue"
              class="w-full text-[16px] leading-[22px] outline-none resize-none"
              :placeholder="t('FKB.memoryCreatePlaceholder')"
              :readonly="!isCreate"
              autofocus
            />
          </div>
          <div class="w-full flex justify-between items-center">
            <QButton
              class="px-[0]!"
              v-if="isCreate"
              variant="text"
              :label="t('FKB.memoryCreateAddImageBtn')"
              @click="uploadImg"
            >
              <template #icon>
                <IconLink />
              </template>
            </QButton>
            <div v-else></div>
            <div class="flex items-center">
              <QButton variant="text" @click="handleCancel">{{
                t("FKB.memoryCreateCancelBtn")
              }}</QButton>
              <QButton v-if="isCreate" color="primary" @click="handleSubmit">{{
                t("FKB.memoryCreateSubmitBtn")
              }}</QButton>
              <QButton v-else color="error" @click="handleDeleteMemory">{{
                t("FKB.memoryCreateDeleteBtn")
              }}</QButton>
            </div>
          </div>
        </div>
      </div>
      <div
        class="absolute bottom-[-56px] left-0 w-[320px] h-[48px] px-[16px] rounded-16 p-[8px] flex justify-between items-center bg-error-container"
        v-show="showImgsWarning"
      >
        <span class="text-body-m leading-body-m text-text-on-surface">
          {{ t("FKB.memoryCreateUploadImgsLimitMsg") }}
        </span>
        <IconClose
          class="text-text-on-surface text-body-m cursor-pointer"
          @click="showImgsWarning = false"
        />
      </div>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import {
  defineOptions,
  defineProps,
  defineExpose,
  ref,
  Ref,
  watch,
  PropType,
  onUnmounted,
  onMounted,
} from "vue";
import Dialog from "@libs/p-comps/volt/Dialog.vue";
import { QButton } from "@libs/p-comps/volt/QButton";
import { IconMemories, IconLink, IconClose } from "@quantum/icons";
import { useToast } from "primevue/usetoast";
import { MemoryItem, ImgItem } from "./index";
import { addMemory, baseURL } from "@libs/service";
import { useLocale } from "@/hooks/i18n";
import { useFiles } from "@libs/p-comps/hooks/useFiles";
import { changeGlobalStore } from "@/store/global";
import "./index.less";

defineOptions({
  name: "CreateMemory",
});
const { t } = useLocale();

const props = defineProps({
  data: Object as PropType<MemoryItem>,
});
const emit = defineEmits(["deleteMemory", "handleInit"]);

const toast = useToast();

const { files, onFileSelect, onFileclear } = useFiles({needDrag:false});

const isCreate = ref(false); //区分创建和删除（仅展示）状态
const showCreateMemoryDialog = ref(false);
const imgList: Ref<Array<ImgItem>> = ref([]);
const largeImgIndex = ref(-1);
const rows = ref(3);
const inputValue = ref("");
const showImgsWarning = ref(false);
const submitLoading = ref(false);

const uploadImg = async () => {
  await onFileSelect();
  setImageUrl();
};

let timer: number = null;
const setImageUrl = async () => {
  for (let i = 0; i < files.value.length; i++) {
    if (imgList.value.length >= 4) {
      if (timer) clearTimeout(timer);
      showImgsWarning.value = true;
      timer = setTimeout(() => {
        showImgsWarning.value = false;
      }, 4000);
      return;
    } else {
      imgList.value.push({
        url: files.value[i].filePath,
        showingUrl: `${baseURL}/fkb/local?localPath=${encodeURIComponent(files.value[i].filePath)}`,
      });
    }
  }
  onFileclear();
};

const showLargerImg = async (item: ImgItem, index: number) => {
  largeImgIndex.value = largeImgIndex.value === index ? -1 : index;
};
const handleDeleteImg = (item: ImgItem, index: number) => {
  imgList.value.splice(index, 1);
};

const handleCancel = () => {
  inputValue.value = "";
  largeImgIndex.value = -1;
  files.value = [];
  imgList.value = [];
  showCreateMemoryDialog.value = false;
  submitLoading.value = false;
};

const handleSubmit = async () => {
  if (!inputValue.value.length) {
    return toast.add({
      severity: "error",
      summary: "Error",
      detail: t("FKB.memoryCreateInputEmptyMsg"),
      life: 3000,
    });
  }
  changeGlobalStore("gLoading", true);
  submitLoading.value = true;
  for (let i = 0; i < (imgList.value.length ? imgList.value.length : 1); i++) {
    const res = await addMemory({
      Data: {
        userText: inputValue.value,
        fileList: imgList.value.length ? [imgList.value[i]?.url] : [],
      },
    });
    if (res.data.Data.Status === "complete") {
      toast.add({
        severity: "success",
        summary: "All Set",
        detail: t("FKB.memoryCreateSuccessMsg"),
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: res.data.Data.Text,
        life: 3000,
      });
    }
  }
  emit("handleInit", true);
  handleCancel();
};
const show = () => {
  showCreateMemoryDialog.value = true;
};

const handleDeleteMemory = () => {
  emit("deleteMemory", [props.data]);
  handleCancel();
};

const checkIsCreated = (data: any) => {
  if (data) {
    inputValue.value = props.data.content;
    imgList.value = props.data.contentUri?.split(",").map((item) => {
      return {
        url: item,
        showingUrl: `${baseURL}/fkb/local?localPath=${encodeURIComponent(item)}`,
      };
    });
    isCreate.value = false;
  } else {
    inputValue.value = "";
    imgList.value = [];
    isCreate.value = true;
  }
};

watch(
  () => props.data,
  (val) => {
    checkIsCreated(val);
  }
);

watch(
  () => inputValue.value,
  (val) => {
    //300个字符为6行
    if (val.length > 60 * 3) {
      rows.value = 10;
    } else {
      rows.value = 3;
    }
  }
);

onMounted(() => {
  checkIsCreated(props.data);
});

defineExpose({
  show,
});
</script>
