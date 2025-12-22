<template>
  <div class="editor" ref="editorRef">
    <!-- <GlobalBar :showHomeBtn="true" /> -->

    <div class="editor__content">
      <div class="header">
        <div
          class="smart-editing"
          :class="{
            disabled: !imageUrl || loading,
          }"
          v-hover.mouse="
            () => {
              return {
                start: (e) => {
                  showHoverStyle(e);
                },
                cancel: (e) => {
                  showHoverStyle(e, false);
                },
              };
            }
          "
          v-helper="
            () => {
              return {
                role: 'button',
                ariaLabel: $t('creatorZone.editor.smartEditing'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  setOperateType(OPERATE_TYPE.SMART_EDITING);
                },
              };
            }
          "
          v-automation="'smart_editing'"
        >
          <div class="icon"></div>
          <div class="name">{{ $t("creatorZone.editor.smartEditing") }}</div>

          <div class="tip">
            <div>{{ $t("creatorZone.editor.smartEditingTip") }}</div>

            <img src="@/assets/img/imageEditor/smartEdit.gif" />
          </div>
        </div>

        <div
          class="inpaint"
          :class="{
            disabled: !imageUrl || loading,
            active: operateType === OPERATE_TYPE.INPAINT,
          }"
          v-hover.mouse="
            () => {
              return {
                start: (e) => {
                  showHoverStyle(e);
                },
                cancel: (e) => {
                  showHoverStyle(e, false);
                },
              };
            }
          "
          v-helper="
            () => {
              return {
                role: 'button',
                ariaLabel: $t('creatorZone.editor.inpaint'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  setOperateType(OPERATE_TYPE.INPAINT);
                },
              };
            }
          "
          v-automation="'inpaint'"
        >
          <div class="icon"></div>
          <div class="name">{{ $t("creatorZone.editor.inpaint") }}</div>
        </div>

        <div
          class="outpaint"
          :class="{
            disabled: !imageUrl || loading,
            active: operateType === OPERATE_TYPE.OUTPAINT,
          }"
          v-hover.mouse="
            () => {
              return {
                start: (e) => {
                  showHoverStyle(e);
                },
                cancel: (e) => {
                  showHoverStyle(e, false);
                },
              };
            }
          "
          v-helper="
            () => {
              return {
                role: 'button',
                ariaLabel: $t('creatorZone.editor.outpaint'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  setOperateType(OPERATE_TYPE.OUTPAINT);
                },
              };
            }
          "
          v-automation="'outpaint'"
        >
          <div class="icon"></div>
          <div class="name">{{ $t("creatorZone.editor.outpaint") }}</div>
        </div>

        <div
          class="erase"
          :class="{
            disabled: !imageUrl || loading,
            active: operateType === OPERATE_TYPE.ERASE,
          }"
          v-hover.mouse="
            () => {
              return {
                start: (e) => {
                  showHoverStyle(e);
                },
                cancel: (e) => {
                  showHoverStyle(e, false);
                },
              };
            }
          "
          v-helper="
            () => {
              return {
                role: 'button',
                ariaLabel: $t('creatorZone.editor.erase'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  setOperateType(OPERATE_TYPE.ERASE);
                },
              };
            }
          "
          v-automation="'erase'"
        >
          <div class="icon"></div>
          <div class="name">{{ $t("creatorZone.editor.erase") }}</div>
        </div>

        <!-- <div
          class="upscale"
          :class="{
            disabled: !imageUrl || loading,
            active: operateType === OPERATE_TYPE.UPSCALE,
          }"
          v-hover.mouse="
            () => {
              return {
                start: (e) => {
                  showHoverStyle(e);
                },
                cancel: (e) => {
                  showHoverStyle(e, false);
                },
              };
            }
          "
          v-helper="
            () => {
              return {
                role: 'button',
                ariaLabel: $t('creatorZone.editor.upscale'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  setOperateType(OPERATE_TYPE.UPSCALE);
                },
              };
            }
          "
        >
          <div class="icon"></div>
          <div class="name">{{ $t("creatorZone.editor.upscale") }}</div>
        </div> -->

        <div
          class="change-background"
          :class="{
            disabled: !imageUrl || loading,
            active: operateType === OPERATE_TYPE.CHANGE_BACKGROUND,
          }"
          v-hover.mouse="
            () => {
              return {
                start: (e) => {
                  showHoverStyle(e);
                },
                cancel: (e) => {
                  showHoverStyle(e, false);
                },
              };
            }
          "
          v-helper="
            () => {
              return {
                role: 'button',
                ariaLabel: $t('creatorZone.editor.removeChangeBg'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  setOperateType(OPERATE_TYPE.CHANGE_BACKGROUND);
                },
              };
            }
          "
          v-automation="'change_background'"
        >
          <div class="icon"></div>
          <div class="name">{{ $t("creatorZone.editor.removeChangeBg") }}</div>
        </div>

        <!-- <div
          class="cutout"
          :class="{
            disabled: !imageUrl || loading,
            active: operateType === OPERATE_TYPE.CUTOUT,
          }"
          v-hover.mouse="
            () => {
              return {
                start: (e) => {
                  showHoverStyle(e);
                },
                cancel: (e) => {
                  showHoverStyle(e, false);
                },
              };
            }
          "
          v-helper="
            () => {
              return {
                role: 'button',
                ariaLabel: $t('creatorZone.editor.cutout'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  setOperateType(OPERATE_TYPE.CUTOUT);
                },
              };
            }
          "
        >
          <div class="icon"></div>
          <div class="name">{{ $t("creatorZone.editor.cutout") }}</div>
        </div> -->
      </div>

      <div class="upload-image" v-if="!imageUrl">
        <div class="animation"></div>

        <div class="tip text-text-on-surface">{{ $t("creatorZone.editor.tip") }}</div>

        <div
          class="trigger bg-primary-primary"
          v-helper="
            () => {
              return {
                role: 'button',
                ariaLabel: $t('creatorZone.editor.uploadAnImage'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  editorRef.querySelector(`input[type='file']`)?.click();
                },
              };
            }
          "
        >
          <div class="icon bg-on-primary"></div>
          <div class="name text-on-primary" v-automation="'upload_image_btn'">{{ $t("creatorZone.editor.uploadAnImage") }}</div>
        </div>

        <input
          style="display: none"
          type="file"
          :accept="imageTypes.map((imageType) => `.${imageType}`).join(',')"
          @change="
            (e) => {
              setImageUrl(e);
            }
          "
        />
      </div>
      <template v-else>
        <template v-if="operateType === OPERATE_TYPE.CROP">
          <Crop />
        </template>
        <template v-else-if="operateType === OPERATE_TYPE.INPAINT">
          <Inpaint />
        </template>
        <template v-else-if="operateType === OPERATE_TYPE.OUTPAINT">
          <Outpaint />
        </template>
        <template v-else-if="operateType === OPERATE_TYPE.UPSCALE">
          <Upscale />
        </template>
        <template v-else-if="operateType === OPERATE_TYPE.ERASE">
          <Erase />
        </template>
        <template v-else-if="operateType === OPERATE_TYPE.CHANGE_BACKGROUND">
          <ChangeBG />
        </template>
        <template v-else-if="operateType === OPERATE_TYPE.CUTOUT">
          <Cutout />
        </template>
        <template v-else>
          <div class="preview">
            <div
              :style="{
                left: `${translate.x}px`,
                top: `${translate.y}px`,
                transform: `scale(${scale})`,
              }"
            >
              <ImagePreview :src="imageUrl" :lazy="false" />
            </div>
          </div>
        </template>
      </template>

      <div class="footer" v-if="!imageUrl">
        <div class="title text-text-on-surface">{{ $t("creatorZone.editor.templates") }}</div>

        <div>
          <template v-for="image in images">
            <img
              :src="image.url"
              v-helper="
                () => {
                  return {
                    role: 'button',
                    ariaLabel: $t('creatorZone.editor.selectImage'),
                    focus: () => {},
                    blur: () => {},
                    click: () => {
                      setImageUrl(image.url);
                    },
                  };
                }
              "
            />
          </template>
        </div>
      </div>
      <template v-else>
        <div class="toolbar bg-surfaces-surface-blur" v-if="operateType === undefined">
          <div class="scale text-text-on-surface">{{ numeral(scale).format("0%") }}</div>

          <div class="line bg-outlines-outline-variant"></div>

          <div
            class="crop"
            v-helper="
              () => {
                return {
                  role: 'button',
                  ariaLabel: $t('creatorZone.editor.crop'),
                  focus: () => {},
                  blur: () => {},
                  click: () => {
                    setOperateType(OPERATE_TYPE.CROP);
                  },
                };
              }
            "
          >
            <div class="icon bg-text-on-surface"></div>
          </div>

          <div class="line bg-outlines-outline-variant"></div>

          <div
            class="flip-horizontal"
            v-helper="
              () => {
                return {
                  role: 'button',
                  ariaLabel: $t('creatorZone.editor.flipHorizontal'),
                  focus: () => {},
                  blur: () => {},
                  click: () => {
                    editImage({ flip: 1 });
                  },
                };
              }
            "
          >
            <div class="icon bg-text-on-surface"></div>
          </div>
          <div
            class="flip-vertical"
            v-helper="
              () => {
                return {
                  role: 'button',
                  ariaLabel: $t('creatorZone.editor.flipVertical'),
                  focus: () => {},
                  blur: () => {},
                  click: () => {
                    editImage({ flip: -1 });
                  },
                };
              }
            "
          >
            <div class="icon bg-text-on-surface"></div>
          </div>
          <div
            class="rotate-left"
            v-helper="
              () => {
                return {
                  role: 'button',
                  ariaLabel: $t('creatorZone.editor.rotateLeft'),
                  focus: () => {},
                  blur: () => {},
                  click: () => {
                    editImage({ rotate: -1 });
                  },
                };
              }
            "
          >
            <div class="icon bg-text-on-surface"></div>
          </div>
          <div
            class="rotate-right"
            v-helper="
              () => {
                return {
                  role: 'button',
                  ariaLabel: $t('creatorZone.editor.rotateRight'),
                  focus: () => {},
                  blur: () => {},
                  click: () => {
                    editImage({ rotate: 1 });
                  },
                };
              }
            "
          >
            <div class="icon bg-text-on-surface"></div>
          </div>

          <div class="line bg-outlines-outline-variant"></div>

          <!-- <div class="share">
            <div class="icon bg-text-on-surface"></div>
          </div> -->
          <div class="download">
            <div class="icon bg-text-on-surface"></div>
          </div>
          <div
            class="delete"
            v-helper="
              () => {
                return {
                  role: 'button',
                  ariaLabel: $t('creatorZone.editor.detete'),
                  focus: () => {},
                  blur: () => {},
                  click: () => {
                    reset();
                  },
                };
              }
            "
          >
            <div class="icon bg-text-on-surface"></div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, watch, Ref, computed, provide, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { v4 as uuid } from "uuid";
import numeral from "numeral";
import {
  GenBtnStatus,
  SESSIONID_NAME_MAX_LENGTH,
  SESSIONID_PROMPT_MAX_LENGTH,
  getLocalBaseModelGenImageSize,
  imageTypes,
} from "@/constant";
import {
  SESSION_RECORD_SOURCE,
  IMAGE_STATUS,
  REFERENCEIMAGE_TYPE,
  OPERATE_TYPE,
  IsessionRecord,
  Istyle,
  Iimage,
  ModelType,
} from "@/types";
import { fileToImageBase64, imageBase64ToFile, urlToFile } from "@/services/CreatorZone/file";
import {
  addSession,
  editSession,
  getSessionInfo,
  addSessionRecord,
} from "@/services/CreatorZone/session";
import { getFileObjectKey } from "@/services/CreatorZone/oss";

// import GlobalBar from '@/components/CreatorZone/GlobalBar/index.vue'
import ImagePreview from "@/components/CreatorZone/ImagePreview/index.vue";

import Crop from "./Crop/index.vue";
import Inpaint from "./Inpaint/index.vue";
import Outpaint from "./Outpaint/index.vue";
import Erase from "./Erase/index.vue";
import Upscale from "./Upscale/index.vue";
import ChangeBG from "./ChangeBG/index.vue";
import Cutout from "./Cutout/index.vue";

import example1 from "@/assets/img/editor/examples/1.png";
import example2 from "@/assets/img/editor/examples/2.png";
import example3 from "@/assets/img/editor/examples/3.png";
import example4 from "@/assets/img/editor/examples/4.png";

interface Iquery extends Iimage {}

// 图片配置
const openImageConfig = {
  // 最大尺寸
  maxSize: 2048,
  // 最小尺寸
  minSize: 100,
  // 最大兆
  maxM: 10,
};

// 缩放配置
const scaleConfig = {
  max: 5,
  min: 1,
  step: 0.1,
};

// 坐标系占容器最大尺寸比例
const maxSizeRatio = 0.9;

const route: {
  query: Iquery;
} = useRoute();
const router = useRouter();

const editorRef = ref(null);

const operateType = ref<OPERATE_TYPE>(undefined);

const imageUrl = ref<string>("");

// 图片偏移距离
const translate = ref({
  x: 0,
  y: 0,
});
// 图片缩放比例
const scale = ref(1);

const images = ref([
  {
    url: new window.URL(example1, import.meta.url).href,
  },
  {
    url: new window.URL(example2, import.meta.url).href,
  },
  {
    url: new window.URL(example3, import.meta.url).href,
  },
  {
    url: new window.URL(example4, import.meta.url).href,
  },
]);

const loading = ref(false);

const setOperateType = (value) => {
  if (!imageUrl.value || loading.value) {
    return;
  }

  if (value === OPERATE_TYPE.SMART_EDITING) {
    router.push({
      path: "/quantum/creator-zone/create/session",
      query: {
        referenceImageUrl: imageUrl.value,
        operateType: OPERATE_TYPE.SMART_EDITING,
      },
    });
  } else {
    operateType.value = value;

    setTransform();
  }
};

const setImageUrl = async (value) => {
  if (value instanceof Event) {
    imageUrl.value = (await fileToImageBase64(
      (value.target as HTMLInputElement).files[0]
    )) as string;
  } else if (value instanceof File) {
    imageUrl.value = (await fileToImageBase64(value)) as string;
  } else if (value.startsWith("https://") || value.startsWith("http://")) {
    const file = await urlToFile(value);

    imageUrl.value = (await fileToImageBase64(file)) as string;
  } else if (value.startsWith("data:image/") && value.includes("base64,")) {
    imageUrl.value = value;
  } else if (value === "") {
    imageUrl.value = value;
  }

  if (
    imageUrl.value &&
    operateType.value === undefined &&
    route.query?.url === undefined &&
    route.query?.operateType !== undefined
  ) {
    router.replace({
      path: "/quantum/creator-zone/editor",
      query: {
        url: imageUrl.value,
        operateType: route.query?.operateType,
      },
    });
  } else {
    await setTransform();
  }
};

// 设置图片偏移距离
const setTransform = async () => {
  if (operateType.value !== undefined) {
    return;
  }

  await nextTick();

  if (imageUrl.value) {
    const originalImage: HTMLImageElement = await new Promise((resolve) => {
      const image = new Image();

      image.onload = () => {
        resolve(image);
      };

      image.src = imageUrl.value;
    });

    const previewEle = editorRef.value.querySelector(".editor__content .preview");

    let styleScale = 1;

    if (
      ((previewEle.clientWidth * maxSizeRatio) / originalImage.width) * originalImage.height <=
      previewEle.clientHeight * maxSizeRatio
    ) {
      styleScale = (previewEle.clientWidth * maxSizeRatio) / originalImage.width;
    } else {
      styleScale = (previewEle.clientHeight * maxSizeRatio) / originalImage.height;
    }

    scale.value = styleScale;

    translate.value = {
      x: (previewEle.clientWidth - originalImage.width) / 2,
      y: (previewEle.clientHeight - originalImage.height) / 2,
    };
  }
};

const setLoading = (value) => {
  loading.value = value;
};

const editImage = async ({ flip = 0, rotate = 0 }) => {
  const originalImage: HTMLImageElement = await new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      resolve(image);
    };

    image.src = imageUrl.value;
  });

  let width = originalImage.width;
  let height = originalImage.height;
  let flipHorizontal = 1;
  let flipVertical = 1;
  let angle = 0;

  if (flip === 1) {
    // 水平翻转
    flipHorizontal = -1;
  } else if (flip === -1) {
    // 垂直翻转
    flipVertical = -1;
  }

  if (rotate !== 0) {
    width = originalImage.height;
    height = originalImage.width;
  }

  if (rotate === 1) {
    // 向右旋转
    angle = 90;
  } else if (rotate === -1) {
    // 向左旋转
    angle = -90;
  }

  const canvas = window.document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  // 平移旋转缩放顺序不可改变
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(flipHorizontal, flipVertical);
  ctx.rotate((angle / 180) * Math.PI);

  ctx.drawImage(originalImage, -originalImage.width / 2, -originalImage.height / 2);

  setImageUrl(canvas.toDataURL());
};

const showHoverStyle = (e, expanded = true) => {
  if (!imageUrl.value || loading.value) {
    return;
  }

  let ele = null;

  if (e.type === "mouseenter" || e.type === "mouseleave") {
    ele = e.target;
  } else if (e.type === "touchstart" || e.type === "touchend" || e.type === "touchcancel") {
    if (e.target.classList.contains("icon") || e.target.classList.contains("name")) {
      ele = e.target.parentNode;
    } else {
      ele = e.target;
    }
  }

  if (expanded) {
    if (e.type === "mouseenter" || e.type === "touchstart") {
      ele.classList.add("hovered");
    }
  } else {
    if (e.type === "mouseleave" || e.type === "touchend" || e.type === "touchcancel") {
      ele.classList.remove("hovered");
    }
  }
};

const reset = () => {
  setOperateType(undefined);
  setImageUrl("");
};

// 视口大小变化事件
const Eresize = () => {
  setTransform();
};

// 拖拽事件回调
const Edragover = (e) => {
  e.preventDefault();
};
// 拖拽事件回调
const Edrop = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (operateType.value !== undefined && imageUrl.value) {
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

// 粘贴事件回调
const Epaste = async (e) => {
  e.preventDefault();

  if (operateType.value !== undefined && imageUrl.value) {
    return;
  }

  for (let index = 0; index < e.clipboardData.items.length; index++) {
    const file = e.clipboardData.items[index].getAsFile();

    // 重置状态
    reset();

    setImageUrl(file);
  }
};

onMounted(async () => {
  // 监听视口大小变化事件
  window.addEventListener("resize", Eresize);

  // 监听拖拽事件
  window.addEventListener("dragover", Edragover);
  // 监听拖拽事件
  window.addEventListener("drop", Edrop);

  // 监听粘贴事件
  window.addEventListener("paste", Epaste);
});

onUnmounted(() => {
  // 取消监听视口大小变化事件
  window.removeEventListener("resize", Eresize);

  // 取消监听拖拽事件
  window.removeEventListener("dragover", Edragover);
  // 取消监听拖拽事件
  window.removeEventListener("drop", Edrop);

  // 取消监听粘贴事件
  window.removeEventListener("paste", Epaste);
});

watch(
  [() => route.query],
  async () => {
    if (route.query?.url) {
      reset();

      await setImageUrl(route.query?.url);
      setOperateType(route.query?.operateType ? Number(route.query?.operateType) : undefined);
    }
  },
  { immediate: true }
);

provide("EDITOR_REF", {
  scaleConfig,
  maxSizeRatio,
  imageUrl,
  setImageUrl,
  operateType,
  setOperateType,
  loading,
  setLoading,
  reset,
});
</script>

<style lang="less" scoped>
.editor {
  width: 100%;
  height: 100%;
  padding: 24px;
  padding-bottom: 64px;
  display: flex;
  flex-direction: column;

  // :deep(.global-bar) {
  //   margin-bottom: 24px;
  // }

  .editor__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    .header {
      height: 32px;
      display: flex;

      > div {
        height: 100%;
        background: var(--color-secondary-container);
        padding: 0 16px;
        border-radius: 32px;
        display: flex;
        align-items: center;

        + div {
          margin-left: 8px;
        }

        .icon {
          width: 16px;
          height: 16px;
          mask-size: 100%;
          background-color: var(--color-on-focus-container);
        }

        .name {
          margin-left: 4px;
          font-family: "Rookery New";
          font-size: 12px;
          font-weight: 500;
          color: var(--color-on-focus-container);
        }

        &.hovered {
          box-shadow: 0px 2px 6px 2px #00000026;
          cursor: pointer;
        }

        &.disabled {
          opacity: 0.38;
          background-color: var(--color-state-focus-focus-hover);
        }

        &.active {
          background: #0000001f;
        }
      }

      .smart-editing {
        position: relative;

        .icon {
          mask-image: url("@/assets/img/svg/SmartEditing.svg");
        }

        .tip {
          display: none;
          background: var(--color-surfaces-surface-bright);
          padding: 16px;
          border-radius: 16px;
          position: absolute;
          top: 46px;
          right: 50%;
          z-index: 2;
          transform: translateX(50%);

          > div {
            margin-bottom: 16px;
            font-family: "Rookery New";
            font-size: 12px;
            font-weight: 700;
            color: var(--color-text-on-surface);
          }

          > img {
            max-width: none;
            width: 192px;
            height: 144px;
            border-radius: 8px;
          }

          &::after {
            content: "";
            display: inline-block;
            width: 16px;
            height: 16px;
            background: var(--color-surfaces-surface-bright);
            position: absolute;
            top: 0;
            right: 50%;
            transform: translate(50%, -50%) rotate(45deg);
          }
        }

        &.hovered {
          .tip {
            display: block;
          }
        }
      }

      .inpaint {
        .icon {
          mask-image: url("@/assets/img/svg/Inpaint2.svg");
        }
      }

      .outpaint {
        .icon {
          mask-image: url("@/assets/img/svg/Outpaint2.svg");
        }
      }

      .erase {
        .icon {
          mask-image: url("@/assets/img/svg/Erase2.svg");
        }
      }

      .upscale {
        .icon {
          mask-image: url("@/assets/img/svg/Upscale2.svg");
        }
      }

      .change-background {
        .icon {
          mask-image: url("@/assets/img/svg/RemoveBG2.svg");
        }
      }

      .cutout {
        .icon {
          mask-image: url("@/assets/img/svg/Cutout.svg");
        }
      }
    }

    .upload-image {
      display: flex;
      flex-direction: column;
      align-items: center;

      .animation {
        width: 518px;
        height: 282px;
        background-image: url("@/assets/img/editor/upload-image/pictures_00025.png");
        background-size: 100%;
        animation: upload-image 1.6s linear 0ms;

        @keyframes upload-image {
          0% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00000.png");
          }
          4% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00001.png");
          }
          8% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00002.png");
          }
          12% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00003.png");
          }
          16% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00004.png");
          }
          20% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00005.png");
          }
          24% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00006.png");
          }
          28% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00007.png");
          }
          32% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00008.png");
          }
          36% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00009.png");
          }
          40% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00010.png");
          }
          44% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00011.png");
          }
          48% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00012.png");
          }
          52% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00013.png");
          }
          56% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00014.png");
          }
          60% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00015.png");
          }
          64% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00016.png");
          }
          68% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00017.png");
          }
          72% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00018.png");
          }
          76% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00019.png");
          }
          80% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00020.png");
          }
          84% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00021.png");
          }
          88% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00022.png");
          }
          92% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00023.png");
          }
          96% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00024.png");
          }
          100% {
            background-image: url("@/assets/img/editor/upload-image/pictures_00025.png");
          }
        }
      }

      .tip {
        font-family: "Rookery New";
        font-size: 16px;
        font-weight: 400;
      }

      .trigger {
        margin-top: 24px;
        width: fit-content;
        height: 40px;
        padding: 0 20px;
        border-radius: 999px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;

        .icon {
          width: 18px;
          height: 18px;
          mask-image: url("@/assets/img/svg/upload-image.svg");
          mask-size: 100%;
        }

        .name {
          margin-left: 8px;
          font-family: "Rookery New";
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    .preview {
      flex: 1;
      width: 100%;
      position: relative;

      > div {
        width: fit-content;
        height: fit-content;
        position: absolute;
        left: 0;
        top: 0;
      }
    }

    .footer {
      .title {
        margin-bottom: 16px;
        font-family: "Rookery New";
        font-size: 16px;
        font-weight: 500;
        line-height: 20px;
      }

      > div {
        display: flex;

        > img {
          width: 160px;
          height: 160px;
          border-radius: 24px;
          object-fit: cover;
          cursor: pointer;

          + img {
            margin-left: 24px;
          }
        }
      }
    }

    .toolbar {
      height: 48px;
      padding: 0 16px;
      border-radius: 999px;
      display: flex;
      align-items: center;

      .scale {
        font-family: "Rookery New";
        font-weight: 500;
        font-size: 12px;
      }

      .crop,
      .flip-horizontal,
      .flip-vertical,
      .rotate-left,
      .rotate-right,
      .share,
      .download,
      .delete {
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;

        .icon {
          width: 16px;
          height: 16px;
          mask-size: 100%;
          cursor: pointer;
        }
      }

      .crop {
        .icon {
          mask-image: url("@/assets/img/svg/crop.svg");
        }
      }

      .flip-horizontal {
        .icon {
          mask-image: url("@/assets/img/svg/flip-horizontal.svg");
        }
      }

      .flip-vertical {
        .icon {
          mask-image: url("@/assets/img/svg/flip-vertical.svg");
        }
      }

      .rotate-left {
        .icon {
          mask-image: url("@/assets/img/svg/rotate-left.svg");
        }
      }

      .rotate-right {
        .icon {
          mask-image: url("@/assets/img/svg/rotate-right.svg");
        }
      }

      .share {
        .icon {
          mask-image: url("@/assets/img/svg/share.svg");
        }
      }

      .download {
        .icon {
          mask-image: url("@/assets/img/svg/imageDownload.svg");
        }
      }

      .delete {
        .icon {
          mask-image: url("@/assets/img/svg/delete.svg");
        }
      }

      .line {
        width: 1px;
        height: 16px;
      }

      > div + div {
        margin-left: 16px;
      }
    }

    :deep(.crop) {
      flex: 1;
    }
  }
}
</style>
