<template>
  <div class="avatar-page w-full h-full p-[32px] flex flex-col" ref="avatarRef">
    <!-- <GlobalBar :showHomeBtn="true" /> -->
    <div class="avatar__content h-full flex flex-col justify-center items-center">
      <div
        class="upload-image__content flex flex-col justify-center items-center"
        v-if="typeof imageUrl !== 'string' && !generateDone"
      >
        <div
          class="title w-full font-[Rookery New] text-headline-l leading-headline-l font-bold text-text-on-surface text-center"
        >
          {{ t("creatorZone.avatar.title") }}
        </div>
        <div
          class="poster w-[460px] h-[406px] -my-[20px] bg-[url(@/assets/img/avatar/Style redrawing/Style redrawing_00074.png)] bg-size-[100%]"
        ></div>
        <div
          class="text-title-s leading-title-s text-text-on-surface-variant text-center mb-[64px]"
        >
          {{ t("creatorZone.avatar.description") }}
        </div>
        <QButton
          color="primary"
          :label="t(`creatorZone.avatar.uploadImageButton`)"
          class="mb-[30px]"
          v-automation="'avatar_upload_image_btn'"
          @click="
            () => {
              inputRef?.click();
            }
          "
        >
          <template #icon>
            <IconUploadImageWhite />
          </template>
        </QButton>
        <div
          class="postscript text-label-s leading-label-s text-text-on-surface-variant text-center font-normal"
        >
          {{ t("creatorZone.avatar.postscriptLine1") }}<br />
          {{ t("creatorZone.avatar.postscriptLine2") }}
        </div>
      </div>
      <div
        class="max-w-[468px] flex flex-col justify-center items-center"
        v-else-if="typeof imageUrl === 'string' && !generateDone"
      >
        <div class="mb-[8px]">
          <img :src="imageUrl" alt="" class="rounded-16 max-w-[468px] w-full max-h-[468px]" />
        </div>
        <div class="w-full flex justify-between items-center">
          <div class="flex">
            <QTooltip
              content="6 uses per day, aggregated across devices. Exceeding switches to local model."
              placement="top"
              trigger="hover"
            >
              <QButton class="mr-[8px]" color="secondary">
                <IconCloud class="-ml-[8px] -mr-[4px]" />
                <span>
                  {{ t(`creatorZone.avatar.cloudModelBtn`) }}
                </span>
                <IconFailed class="-mr-[8px] -ml-[4px]" />
              </QButton>
            </QTooltip>
            <QButton
              color="secondary"
              :label="t(`creatorZone.avatar.replaceBtn`)"
              @click="
                () => {
                  handleReplace();
                }
              "
            >
              <template #icon>
                <IconUploadImageWhite />
              </template>
            </QButton>
          </div>
          <QButton
            color="primary"
            :label="t(`creatorZone.avatar.generateBtn`)"
            iconPos="right"
            @click="
              () => {
                handleContinue();
              }
            "
            v-automation="'avatar_generate_btn'"
          >
            <template #icon>
              <IconGenerate />
            </template>
          </QButton>
        </div>
      </div>
      <div class="avatar-choose__content" v-else-if="typeof imageUrl === 'string' && generateDone">
        <div class="loading flex flex-col justify-center items-center" v-if="loading">
          <ColorfulLoading class="w-[484px] h-[484px] mb-[32px]" />
          <div class="loading-text relative">
            <span
              class="loading-text-inner absolute top-0 left-0 -translate-x-[50%] text-title-l leading-title-l text-text-on-surface font-bold whitespace-nowrap"
              v-automation="'avatar_loading_text'"
              >{{ loadingText }}</span
            >
          </div>
        </div>
        <div class="avatar-choose flex flex-col justify-center items-center">
          <div class="avatar__area flex justify-center items-center" v-show="!loading">
            <QIconButton
              color="secondary"
              :disabled="currentAvatarIndex === 0"
              @click="
                () => {
                  handlePrev();
                }
              "
            >
              <IconArrowLeft />
            </QIconButton>
            <img
              class="avatar-image w-[484px] h-[484px] rounded-24 mx-[30px] mb-[10px]"
              :src="currentAvatar?.url || ''"
              alt=""
            />
            <QIconButton
              color="secondary"
              :disabled="currentAvatarIndex === avatarList.length - 1"
              @click="
                () => {
                  handleNext();
                }
              "
            >
              <IconArrowRight />
            </QIconButton>
          </div>
          <div
            class="operation-btns w-[484px] flex justify-between items-center mb-[24px]"
            v-show="!loading"
          >
            <div class="left-btns flex">
              <QButton
                class="mr-[8px]"
                color="secondary"
                :label="t(`creatorZone.avatar.redoBtn`)"
                @click="
                  () => {
                    handleRedo();
                  }
                "
                v-automation="'avatar_redo_btn'"
              >
                <template #icon>
                  <IconRefresh />
                </template>
              </QButton>
              <QButton
                class="mr-[8px]"
                color="secondary"
                :label="t(`creatorZone.avatar.uploadBtn`)"
                @click="
                  () => {
                    handleUpload();
                  }
                "
              >
                <template #icon>
                  <IconArrowDown />
                </template>
              </QButton>
            </div>
            <div class="flex">
              <QIconButton
                class="mr-[8px]"
                color="secondary"
                @click="
                  () => {
                    handleCopy();
                  }
                "
              >
                <template #icon>
                  <IconCopy2 />
                </template>
              </QIconButton>
              <QIconButton
                class="mr-[8px]"
                color="secondary"
                @click="
                  () => {
                    handleShare();
                  }
                "
              >
                <template #icon>
                  <IconShare />
                </template>
              </QIconButton>
              <QIconButton
                class="mr-[8px]"
                color="secondary"
                @click="
                  () => {
                    handleDownload();
                  }
                "
              >
                <template #icon>
                  <IconDownloadButton />
                </template>
              </QIconButton>
            </div>
          </div>
          <div
            :class="[
              'thumbnails__area flex justify-center items-center relative',
              loading ? 'in-loading pointer-events-none mt-[70px]' : '',
            ]"
          >
            <QIconButton
              color="secondary"
              :disabled="currentAvatarIndex === 0"
              v-show="!loading"
              @click="
                () => {
                  handleThumbnailsPrev();
                }
              "
            >
              <IconArrowLeft />
            </QIconButton>
            <div class="thumbnails w-[66vw]">
              <el-scrollbar
                ref="thumbnailsRef"
                @touchmove.stop
                @scroll="
                  ({ scrollLeft }) => {
                    translateX = scrollLeft;
                  }
                "
              >
                <div
                  class="thumbnailsInner w-fit mx-auto flex justify-center items-center"
                  ref="thumbnailsInnerRef"
                >
                  <div
                    :class="[
                      'thumbnail w-[45px] h-[45px] shrink-0 mx-[4px] opacity-30 cursor-pointer rounded-12 overflow-hidden',
                      currentAvatarIndex === index ? 'active opacity-100' : '',
                      loading ? 'opacity-30' : '',
                    ]"
                    v-for="(item, index) in avatarList"
                    key="item.id"
                    @click="
                      () => {
                        currentAvatarIndex = index;
                      }
                    "
                    v-automation="'avatar_thumbnail_preview'"
                  >
                    <ImagePreview :src="item.url" :loading="true" />
                  </div>
                </div>
              </el-scrollbar>
            </div>
            <QIconButton
              color="secondary"
              :disabled="currentAvatarIndex === avatarList.length - 1"
              v-show="!loading"
              @click="
                () => {
                  handleThumbnailsNext();
                }
              "
            >
              <IconArrowRight />
            </QIconButton>
          </div>
        </div>
      </div>
      <div class="error" v-else>{{ t("creatorZone.avatar.error") }}</div>
    </div>
    <ConfirmDialog>
      <template #iconSlot>
        <SvgIcon name="back" />
      </template>
    </ConfirmDialog>
    <input
      style="display: none"
      ref="inputRef"
      type="file"
      :accept="imageTypes.map((imageType) => `.${imageType}`).join(',')"
      @change="
        (e) => {
          setImageUrl(e);
        }
      "
    />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, inject, Ref, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { fileToImageBase64, translateImageFile, urlToFile } from "@/services/CreatorZone/file";
import { imageTypes } from "@/constant";
import ColorfulLoading from "@/components/CreatorZone/ColorfulLoading/index.vue";
import ImagePreview from "@/components/CreatorZone/ImagePreview/index.vue";
import ConfirmDialog from "@libs/p-comps/volt/ConfirmDialog.vue";
import SvgIcon from "@/components/SvgIcon";
import { v4 as uuidv4 } from "uuid";
import { imageBase64ToLocalFile } from "@/cs/imageBase64ToLocalFile";
import { getImages } from "@/services/CreatorZone/getImages";
import { QButton, QIconButton, AiButton } from "@libs/p-comps/volt/QButton/index.tsx";
import {
  IconUploadImageWhite,
  IconGenerate,
  IconCloud,
  IconFailed,
  IconArrowRight,
  IconArrowLeft,
  IconRefresh,
  IconArrowDown,
  IconCopy2,
  IconShare,
  IconDownloadButton,
} from "@quantum/icons";
import QTooltip from "@libs/p-comps/volt/QTooltip/index.vue";

const { t } = useI18n();

const avatarRef = ref(null);
const inputRef = ref(null);
const thumbnailsRef = ref(null);
const thumbnailsInnerRef = ref(null);

const translateX = ref(0);

//imageUrl分三个状态，默认为undefined，显示初始页，reset时为''，仅改变imageUrl，不切换页面状态
const imageUrl = ref<string>(undefined);

const generateDone = ref(false);
const loading = ref(false);

const avatarList = ref([]);

const currentAvatarIndex = ref(0);
const currentAvatar = computed(() => {
  return avatarList.value[currentAvatarIndex.value];
});

const loadingText = ref(t("creatorZone.avatar.loadingText1"));
let laodingTextTimer: number;

const turningLoadingText = (i: number) => {
  laodingTextTimer = setTimeout(() => {
    loadingText.value = t(`creatorZone.avatar.loadingText${i}`);
    if (i < 5) {
      i++;
      turningLoadingText(i);
    } else {
      turningLoadingText(1);
    }
  }, 4000);
};
watch(
  [() => loading.value],
  () => {
    if (loading.value) {
      loadingText.value = t("creatorZone.avatar.loadingText1");
      turningLoadingText(2);
    } else {
      clearTimeout(laodingTextTimer);
    }
  },
  { immediate: true }
);

const handleReplace = () => {
  inputRef.value.click();
};

const handlePrev = () => {
  currentAvatarIndex.value -= 1;
};

const handleNext = () => {
  currentAvatarIndex.value += 1;
};

const handleThumbnailsPrev = () => {
  handlePrev();
};

const handleThumbnailsNext = () => {
  handleNext();
};

const handleContinue = async () => {
  generateDone.value = true;
  loading.value = true;
  for (let i = 0; i < 4; i++) {
    const url = await getImages({
      toolName: "cloud_avatar_from_image",
      parameters: {
        prompt: "",
        imageUriPath: await imageBase64ToLocalFile(imageUrl.value),
      },
    });
    avatarList.value.push({ id: uuidv4(), url: url });
  }
  currentAvatarIndex.value = avatarList.value.length - 4;
  loading.value = false;
  await nextTick();
  setTranslateX(currentAvatarIndex.value);
};

const handleRedo = () => {
  handleContinue();
};
const handleUpload = () => {
  reset();
  inputRef.value.click();
};
const handleShare = () => {
  console.log("just share it", currentAvatar.value.url);
};
const handleCopy = async () => {
  const file = await translateImageFile(await urlToFile(currentImage.value.url));

  window.navigator.clipboard
    .write([
      new ClipboardItem({
        [file.type]: file,
      }),
    ])
    .then(() => {
      ElMessage({
        message: t("creatorZone.avatar.copySuccessful"),
        type: "success",
      });
    })
    .catch((error) => {
      throw new Error(error.message);
    });
};
const handleDownload = async () => {
  console.log("just download it", currentAvatar.value.url);
  ElMessage({
    message: t("creatorZone.avatar.downloading"),
    type: "info",
    duration: 0,
    showClose: true,
  });
  await setTimeout(() => {}, 3000);
  ElMessage.closeAll();
  ElMessage({
    message: t("creatorZone.avatar.downloadSuccessful"),
    type: "success",
  });
};
const reset = () => {
  setImageUrl("");
};
// 拖拽事件回调
const Edragover = (e) => {
  e.preventDefault();
};
// 拖拽事件回调
const Edrop = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (imageUrl.value) {
    return;
  }

  const files = e.dataTransfer.files;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // 重置状态
    reset();

    setImageUrl(file);
  }
};

const setImageUrl = async (value:any) => {
  let url = "";
  if (value instanceof Event) {
    url = (await fileToImageBase64((value.target as HTMLInputElement).files[0])) as string;
  } else if (value instanceof File) {
    url = (await fileToImageBase64(value)) as string;
  } else if (value.startsWith("https://") || value.startsWith("http://")) {
    const file = await urlToFile(value);

    url = (await fileToImageBase64(file)) as string;
  } else if (value.startsWith("data:image/") && value.includes("base64,")) {
    url = value;
  } else if (value === "") {
    url = value;
  }

  // check
  imageUrl.value = url;

  if (generateDone.value && value) {
    handleContinue();
  }
};

// 粘贴事件回调
const Epaste = async (e) => {
  e.preventDefault();

  if (imageUrl.value) {
    return;
  }

  for (let index = 0; index < e.clipboardData.items.length; index++) {
    const file = e.clipboardData.items[index].getAsFile();

    // 重置状态
    reset();

    setImageUrl(file);
  }
};
const setTranslateX = (i) => {
  if (i === undefined || !avatarRef.value.querySelector(".thumbnails")) {
    return;
  }

  const { left, right } = avatarRef.value.querySelector(".thumbnails").getBoundingClientRect();
  const { left: left2, right: right2 } = avatarRef.value
    .querySelector(`.thumbnail:nth-child(${i + 1})`)
    .getBoundingClientRect();

  if (left2 < left) {
    translateX.value -= left - left2;
  }

  if (right2 > right) {
    translateX.value += right2 - right;
  }

  thumbnailsRef.value?.setScrollLeft(translateX.value);
};

watch(
  [() => currentAvatarIndex.value],
  async () => {
    await nextTick();

    setTranslateX(currentAvatarIndex.value);
  },
  { immediate: true }
);

onMounted(async () => {
  // 监听拖拽事件
  window.addEventListener("dragover", Edragover);
  // 监听拖拽事件
  window.addEventListener("drop", Edrop);
  // 监听粘贴事件
  window.addEventListener("paste", Epaste);
});

onUnmounted(() => {
  // 取消监听拖拽事件
  window.removeEventListener("dragover", Edragover);
  // 取消监听拖拽事件
  window.removeEventListener("drop", Edrop);
  // 取消监听粘贴事件
  window.removeEventListener("paste", Epaste);
});
</script>
<style lang="less" scoped>
.avatar-page {
  .avatar__content {
    .upload-image__content {
      .poster {
        animation: styleRedrawing 4s linear 0ms forwards;
      }
    }
    .avatar-choose__content {
      .loading {
        .loading-text {
          .loading-text-inner {
            animation: loadingOpacityShow 4s linear infinite;
          }
        }
      }
    }
    .thumbnails__area {
      .inner-turning-btn {
        position: absolute;
        top: 0;
        width: 24px;
        height: 24px;
        background-color: #ffffff;
        border-radius: 50%;
        z-index: 1;
        cursor: pointer;
        &.prev-btn {
          left: 0;
          transform: translate(-50%, 50%);
        }
        &.next-btn {
          right: 0;
          transform: translate(50%, 50%);
        }
        &.disabled {
          opacity: 0.3;
          pointer-events: none;
        }
        img {
          width: 100%;
          height: 100%;
        }
      }
      .thumbnails {
        // width: 100vw * (2 / 3);
        :deep(.el-scrollbar .is-vertical) {
          display: none !important;
        }
        .thumbnailsInner {
          :deep(img) {
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }
}

@keyframes loadingOpacityShow {
  0% {
    opacity: 0;
  }
  5% {
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  95% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}
@keyframes styleRedrawing {
  0% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00000.png");
  }
  1.35% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00001.png");
  }
  2.7% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00002.png");
  }
  4.05% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00003.png");
  }
  5.41% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00004.png");
  }
  6.76% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00005.png");
  }
  8.11% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00006.png");
  }
  9.46% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00007.png");
  }
  10.81% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00008.png");
  }
  12.16% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00009.png");
  }
  13.51% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00010.png");
  }
  14.86% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00011.png");
  }
  16.22% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00012.png");
  }
  17.57% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00013.png");
  }
  18.92% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00014.png");
  }
  20.27% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00015.png");
  }
  21.62% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00016.png");
  }
  22.97% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00017.png");
  }
  24.32% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00018.png");
  }
  25.68% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00019.png");
  }
  27.03% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00020.png");
  }
  28.39% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00021.png");
  }
  29.73% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00022.png");
  }
  31.08% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00023.png");
  }
  32.43% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00024.png");
  }
  33.78% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00025.png");
  }
  35.14% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00026.png");
  }
  36.49% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00027.png");
  }
  37.84% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00028.png");
  }
  39.19% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00029.png");
  }
  40.54% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00030.png");
  }
  41.89% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00031.png");
  }
  43.24% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00032.png");
  }
  44.59% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00033.png");
  }
  45.95% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00034.png");
  }
  47.3% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00035.png");
  }
  48.65% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00036.png");
  }
  50% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00037.png");
  }
  51.35% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00038.png");
  }
  52.7% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00039.png");
  }
  54.05% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00040.png");
  }
  55.41% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00041.png");
  }
  56.76% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00042.png");
  }
  58.11% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00043.png");
  }
  59.46% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00044.png");
  }
  60.81% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00045.png");
  }
  62.16% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00046.png");
  }
  63.51% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00047.png");
  }
  64.86% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00048.png");
  }
  66.22% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00049.png");
  }
  67.57% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00050.png");
  }
  68.92% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00051.png");
  }
  70.27% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00052.png");
  }
  71.62% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00053.png");
  }
  72.97% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00054.png");
  }
  74.32% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00055.png");
  }
  75.68% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00056.png");
  }
  77.03% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00057.png");
  }
  78.39% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00058.png");
  }
  79.73% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00059.png");
  }
  81.08% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00060.png");
  }
  82.43% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00061.png");
  }
  83.78% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00062.png");
  }
  85.14% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00063.png");
  }
  86.49% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00064.png");
  }
  87.84% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00065.png");
  }
  89.19% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00066.png");
  }
  90.54% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00067.png");
  }
  91.89% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00068.png");
  }
  93.24% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00069.png");
  }
  94.59% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00070.png");
  }
  95.95% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00071.png");
  }
  97.3% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00072.png");
  }
  98.65% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00073.png");
  }
  100% {
    background-image: url("@/assets/img/avatar/Style redrawing/Style redrawing_00074.png");
  }
}
</style>
