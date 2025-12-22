<template>
  <div class="config">
    <!-- <GlobalBar :showHomeBtn="true" /> -->

    <div class="config__content">
      <div class="config__content__left">
        <template v-if="route.path.endsWith('/custom')">
          <div class="title">
            <div class="name">{{ $t("creatorZone.create.single.referenceImage") }}</div>

            <el-tooltip
              :visible="referenceDimensionTipVisible"
              :content="$t('creatorZone.create.single.referenceImageDescription')"
              placement="right"
              hide-after="0"
            >
              <div
                class="icon"
                v-hover.mouse.touch="
                  () => {
                    return {
                      start: () => {
                        referenceDimensionTipVisible = !referenceDimensionTipVisible;
                      },
                      cancel: () => {
                        referenceDimensionTipVisible = false;
                      },
                    };
                  }
                "
              ></div>
            </el-tooltip>
          </div>

          <ReferenceImage ref="referenceImageRef" />

          <div class="advanced-config" v-if="false">
            <div class="left">
              <div class="title">
                <div class="name">{{ $t("creatorZone.create.single.step") }}</div>

                <el-tooltip
                  :visible="stepsTipVisible"
                  :content="$t('creatorZone.create.single.stepDescription')"
                  placement="right"
                  hide-after="0"
                >
                  <div
                    class="icon"
                    v-hover.mouse.touch="
                      () => {
                        return {
                          start: () => {
                            stepsTipVisible = !stepsTipVisible;
                          },
                          cancel: () => {
                            stepsTipVisible = false;
                          },
                        };
                      }
                    "
                  ></div>
                </el-tooltip>
              </div>

              <NumberInput
                :value="steps"
                @input="
                  (e) => {
                    steps = Number(e.target.value || 0);
                  }
                "
                @blur="
                  (e) => {
                    e.target.value = steps;
                  }
                "
              />
            </div>

            <div class="right">
              <div class="title">
                <div class="name">{{ $t("creatorZone.create.single.cfgScale") }}</div>
              </div>

              <div>
                <Slider
                  :step="0.1"
                  :min="0"
                  :max="10"
                  :value="cfgScale"
                  :onChange="
                    (value) => {
                      cfgScale = value;
                    }
                  "
                />

                <div class="num">{{ cfgScale }}</div>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="route.path.endsWith('/scribble')">
          <div class="title">
            <div class="name">{{ $t("creatorZone.create.single.sketching") }}</div>
            <div class="required">*</div>

            <el-tooltip
              :visible="scribbleTipVisible"
              :content="$t('creatorZone.create.single.sketchingDescription')"
              placement="right"
              hide-after="0"
            >
              <div
                class="icon"
                v-hover.mouse.touch="
                  () => {
                    return {
                      start: () => {
                        scribbleTipVisible = !scribbleTipVisible;
                      },
                      cancel: () => {
                        scribbleTipVisible = false;
                      },
                    };
                  }
                "
              ></div>
            </el-tooltip>
          </div>

          <Scribble ref="scribbleRef" />
        </template>

        <div class="rest"></div>

        <div class="title">
          <div class="name">{{ $t("creatorZone.create.single.keywords") }}</div>
          <div class="required">*</div>

          <el-tooltip
            :visible="contentTipVisible"
            :content="$t('creatorZone.create.single.keywordsDescription')"
            placement="right"
            hide-after="0"
          >
            <div
              class="icon"
              v-hover.mouse.touch="
                () => {
                  return {
                    start: () => {
                      contentTipVisible = !contentTipVisible;
                    },
                    cancel: () => {
                      contentTipVisible = false;
                    },
                  };
                }
              "
            ></div>
          </el-tooltip>
        </div>

        <ChatInput
          placement="top"
          :showReferenceImage="
            route.path.endsWith('/custom') ||
            (route.path.endsWith('/scribble') &&
              customReferenceImageUrl !== scribbleReferenceImageUrl)
          "
          :showUploadReferenceImageBtn="false"
          :showModelSelectBtn="false"
          :referenceImageUrl="customReferenceImageUrl"
          :ratioId="route.query?.ratioId"
          :styleId="
            Number((route.query?.styles ? JSON.parse(route.query?.styles) : [])?.[0]?.styleId)
          "
          :modelId="route.query?.modelId"
          :operateType="operateType"
          :genBtnStatus="genBtnStatus"
          :onUpload="
            (value) => {
              if ([OPERATE_TYPE.TEXT_TO_IMAGE, OPERATE_TYPE.SMART_EDITING].includes(operateType)) {
                setOperateType(OPERATE_TYPE.IMAGE_TO_IMAGE);
              }

              if (route.path.endsWith('/custom')) {
                referenceImageRef?.setOriginalImageUrl(value);
              } else if (route.path.endsWith('/scribble')) {
              }
            }
          "
          :onReferenceImageUrlChange="
            async (value) => {
              if (value) {
              } else {
                if (
                  [OPERATE_TYPE.IMAGE_TO_IMAGE, OPERATE_TYPE.SMART_EDITING].includes(operateType)
                ) {
                  setOperateType(OPERATE_TYPE.TEXT_TO_IMAGE);
                }

                if (route.path.endsWith('/custom')) {
                  referenceImageRef?.setOriginalImageUrl('');
                } else if (route.path.endsWith('/scribble')) {
                  setCustomReferenceImageUrl('');

                  await nextTick();

                  setCustomReferenceImageUrl(scribbleReferenceImageUrl);
                }
              }
            }
          "
          :onRatioChange="
            (value) => {
              imageSize = getLocalBaseModelGenImageSize(value, RATIO);
            }
          "
          :send="
            (value) => {
              if (value?.referenceImageUrl) {
                if (operateType !== OPERATE_TYPE.SMART_EDITING) {
                  setOperateType(OPERATE_TYPE.IMAGE_TO_IMAGE);
                }
              } else {
                setOperateType(OPERATE_TYPE.TEXT_TO_IMAGE);
              }

              genImages({
                ...value,
                referenceDimension,
                referenceStrength,
                steps,
                cfgScale,
                operateType,
              });
            }
          "
          :cancel="
            () => {
              cancel();
            }
          "
        />
      </div>

      <div class="config__content__right">
        <ImageEditor />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  inject,
  nextTick,
  onMounted,
  onBeforeUnmount,
  ref,
  Ref,
  watch,
  onUnmounted,
  provide,
} from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import {
  GenBtnStatus,
  getLocalBaseModelGenImageSize,
  ReferenceDimensionType,
  initReferenceDimensions,
} from "@/constant";
import { Istyle, RATIO, Iimage, OPERATE_TYPE, REFERENCEIMAGE_TYPE } from "@/types";
import { fileToImageBase64, urlToFile } from "@/services/CreatorZone/file";
import { getImages } from "@/services/CreatorZone/getImages";
import { imageBase64ToLocalFile } from "@/cs/imageBase64ToLocalFile";

// import GlobalBar from '@/components/CreatorZone/GlobalBar/index.vue'
import NumberInput from "@/components/CreatorZone/NumberInput/index.vue";
import Slider from "@/components/CreatorZone/Slider/index.vue";
import ChatInput from "@/components/CreatorZone/ChatInput/index.vue";

import ReferenceImage from "./ReferenceImage/index.vue";
import Scribble from "./Scribble/index.vue";
import ImageEditor from "./../ImageEditor/index.vue";

const route = useRoute();

const { t } = useI18n();

const referenceImageRef = ref(null);
const scribbleRef = ref(null);

const customReferenceImageUrl = ref<string>("");
const scribbleReferenceImageUrl = ref<string>("");
const referenceImageUrl = computed(() => {
  if (route.path.endsWith("/custom")) {
    return customReferenceImageUrl.value;
  } else if (route.path.endsWith("/scribble")) {
    return scribbleReferenceImageUrl.value;
  }
});

const referenceDimension = ref<string>("");
const referenceStrength = ref<number>(0);

const steps = ref<number>(0);
const cfgScale = ref<number>(0);

const imageSize = ref({
  width: 0,
  height: 0,
});

const genBtnStatus = ref(GenBtnStatus.INIT);

const referenceDimensionTipVisible = ref(false);
const scribbleTipVisible = ref(false);
const stepsTipVisible = ref(false);
const contentTipVisible = ref(false);

const images = ref<Iimage[]>([]);
const currentImage = computed(() => {
  for (let index = 0; index < images.value.length; index++) {
    const image = images.value[index];

    if (image.active) {
      return {
        ...image,
        index,
      };
    }
  }

  return undefined;
});
const generatedImage = computed(() => {
  if (images.value.slice(-1)?.[0]?.loading) {
    return images.value.slice(-1)?.[0];
  }

  return undefined;
});

const operateType = ref<OPERATE_TYPE>(OPERATE_TYPE.TEXT_TO_IMAGE);

const setCustomReferenceImageUrl = async (value) => {
  customReferenceImageUrl.value = value;
};

const setScribbleReferenceImageUrl = async (value) => {
  scribbleReferenceImageUrl.value = value;
};

const setReferenceDimension = (value) => {
  referenceDimension.value = value;
};

const setReferenceStrength = (value) => {
  referenceStrength.value = value;
};

const setSteps = (value) => {
  steps.value = value;
};

const setCfgScale = (value) => {
  cfgScale.value = value;
};

const setGenBtnStatus = (value) => {
  genBtnStatus.value = value;
};

const setImages = (value) => {
  images.value = value;
};

const setOperateType = (value) => {
  operateType.value = value;
};

const genImages = async (value = {}) => {
  console.log("value", value);

  if (route.path.endsWith("/scribble") && !value.referenceImageUrl) {
    ElMessage({
      message: t("creatorZone.create.single.referenceDimensionTip"),
      type: "info",
    });

    return;
  }

  setGenBtnStatus(GenBtnStatus.PREPARING);

  if (
    [OPERATE_TYPE.TEXT_TO_IMAGE, OPERATE_TYPE.IMAGE_TO_IMAGE, OPERATE_TYPE.SMART_EDITING].includes(
      value.operateType
    )
  ) {
    const style = JSON.parse(value.styles)?.[0];

    if (style?.styleName && !style?.isDefault) {
      value.content = `${value.content}${t("creatorZone.components.chatInput.comma")}${
        style?.styleName
      }`;
    }
  }

  if (
    value.referenceImageUrl?.startsWith("https://") ||
    value.referenceImageUrl?.startsWith("http://")
  ) {
    const file = await urlToFile(value.referenceImageUrl);
    value.referenceImageUrl = await fileToImageBase64(file);
  }

  const res = [
    {
      content: value.content,
      ratioId: value.ratioId,
      width: value.width,
      height: value.height,
      url: "",
      loading: true,
    },
  ];

  setImages([...images.value, ...res]);

  let url = "";

  if (value.operateType === OPERATE_TYPE.SMART_EDITING) {
    url = await getImages({
      toolName: "cloud_image_from_SmartEditing",
      parameters: {
        prompt: value.content,
        imageUriPath: await imageBase64ToLocalFile(value.referenceImageUrl),
      },
    });
  } else if (value.operateType === OPERATE_TYPE.INPAINT) {
    url = await getImages({
      toolName: "cloud_image_from_inpainting",
      parameters: {
        prompt: value.content,
        imageUriPath: await imageBase64ToLocalFile(value.referenceImageUrl),
        maskImageUriPath: await imageBase64ToLocalFile(value.maskImageUrl),
      },
    });
  } else if (value.operateType === OPERATE_TYPE.OUTPAINT) {
    url = await getImages({
      toolName: "cloud_image_from_outpainting",
      parameters: {
        prompt: "outpaint",
        imageUriPath: await imageBase64ToLocalFile(value.referenceImageUrl),
        maskImageUriPath: await imageBase64ToLocalFile(value.maskImageUrl),
      },
    });
  } else if (value.operateType === OPERATE_TYPE.ERASE) {
    url = await getImages({
      toolName: "cloud_image_from_erase",
      parameters: {
        prompt: "erase",
        imageUriPath: await imageBase64ToLocalFile(value.referenceImageUrl),
        maskImageUriPath: await imageBase64ToLocalFile(value.maskImageUrl),
      },
    });
  } else if (value.operateType === OPERATE_TYPE.CHANGE_BACKGROUND) {
    if (value.content) {
      url = await getImages({
        toolName: "cloud_image_from_ChangeBackground",
        parameters: {
          prompt: value.content,
          imageUriPath: await imageBase64ToLocalFile(value.referenceImageUrl),
        },
      });
    } else {
    }
  }

  if ([OPERATE_TYPE.TEXT_TO_IMAGE, OPERATE_TYPE.IMAGE_TO_IMAGE].includes(value.operateType)) {
    const data = {
      prompt: value.content,
      stylePrompt: "",
      uiNegativePrompt: "",
      negativePrompt: "None",
      strength: 1 - value.referenceStrength,
      outputWidth: value.width,
      outputHeight: value.height,
      cfgScale: value.cfgScale,
      steps: value.steps,
      seed: 0,
      verbose: 0,
      imgNumber: 1,
      createType: 0,
      useT5TextEncoder: 0,

      controlNetImgPath: undefined,
      controlNetType: undefined,
      controlNetstrength: undefined,

      initImg: undefined,
    };

    if (value.operateType === OPERATE_TYPE.IMAGE_TO_IMAGE) {
      if (value.referenceImageUrl) {
        if (value.referenceDimension === ReferenceDimensionType.IMAGE_STRENGTH) {
          data.initImg = await imageBase64ToLocalFile(value.referenceImageUrl);
        } else {
          if (route.path.endsWith("/custom")) {
            data.controlNetImgPath = await imageBase64ToLocalFile(value.referenceImageUrl);
          } else if (route.path.endsWith("/scribble")) {
            data.controlNetImgPath = await imageBase64ToLocalFile(
              await scribbleRef?.value?.getInfo(false)
            );
          }

          data.controlNetType = value.referenceDimension;
          data.controlNetstrength = value.referenceStrength;
        }
      }
    }

    url = await getImages({
      toolName: "local_controlnet_tool",
      parameters: {
        data: JSON.stringify(data),
      },
    });
  }

  if (url) {
    res[0].url = url;
    res[0].loading = false;

    setImages([...images.value.slice(0, -1), ...res]);
  } else {
    setImages([...images.value.slice(0, -1)]);
  }

  const imageUrl = res[0]?.url;

  if (imageUrl) {
    setImages(
      images.value.map((image) => {
        return {
          ...image,
          active: image.url === imageUrl,
        };
      })
    );
  }

  setGenBtnStatus(GenBtnStatus.INIT);
};

const cancel = () => {
  setGenBtnStatus(GenBtnStatus.CANCELLING);
};

const Eclick = (e) => {
  referenceDimensionTipVisible.value = false;
  scribbleTipVisible.value = false;
  stepsTipVisible.value = false;
  contentTipVisible.value = false;
};

onMounted(async () => {
  window.addEventListener("click", Eclick);

  if (route.path.endsWith("/custom")) {
    setReferenceDimension(ReferenceDimensionType.IMAGE_STRENGTH);
    setReferenceStrength(
      initReferenceDimensions.find(
        (referenceDimension) => referenceDimension.id === ReferenceDimensionType.IMAGE_STRENGTH
      ).value
    );
  } else if (route.path.endsWith("/scribble")) {
    setReferenceDimension(ReferenceDimensionType.CONTROLNET_SCRIBBLE);
    setReferenceStrength(
      initReferenceDimensions.find(
        (referenceDimension) => referenceDimension.id === ReferenceDimensionType.CONTROLNET_SCRIBBLE
      ).value
    );
  }
});

onUnmounted(() => {
  window.removeEventListener("click", Eclick);
});

provide("SINGLE_REF", {
  imageSize,
  referenceImageUrl,
  setReferenceImageUrl: (value) => {
    if (route.path.endsWith("/custom")) {
      setCustomReferenceImageUrl(value);
    } else if (route.path.endsWith("/scribble")) {
      setCustomReferenceImageUrl(value);
      setScribbleReferenceImageUrl(value);
    }
  },
  referenceDimension,
  setReferenceDimension,
  referenceStrength,
  setReferenceStrength,
  setSteps,
  setCfgScale,
  operateType,
  setOperateType,
});

provide("CREATE_REF", {
  referenceImageUrl,
  setReferenceImageUrl: (value) => {
    if (route.path.endsWith("/custom")) {
      referenceImageRef.value?.setOriginalImageUrl(value);
    } else if (route.path.endsWith("/scribble")) {
      setCustomReferenceImageUrl(value);
    }
  },
  genBtnStatus,
  setGenBtnStatus,
  images,
  currentImage,
  generatedImage,
  setImages,
  operateType,
  setOperateType,
  genImages,
});
</script>

<style lang="less" scoped>
.config {
  width: 100%;
  height: 100%;
  padding: 24px;

  .config__content {
    height: 100%;
    display: flex;

    &__left {
      margin-right: 24px;
      width: 408px;
      display: flex;
      flex-direction: column;

      .title {
        margin-bottom: 8px;
        display: flex;
        align-items: center;

        .name {
          font-family: "Rookery New";
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-on-surface-variant);
          line-height: 20px;
        }

        .required {
          font-family: "Rookery New";
          font-size: 12px;
          font-weight: 400;
          color: #e1241b;
        }

        .icon {
          margin-left: 4px;
          width: 16px;
          height: 16px;
          mask-image: url("@/assets/img/svg/doubt.svg");
          mask-size: 100%;
          background-color: var(--color-text-on-surface-variant);
        }
      }

      .advanced-config {
        margin: 16px 0;
        width: 100%;
        background: var(--color-surfaces-surface);
        padding: 16px;
        border-radius: 24px;
        display: flex;

        > div {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .left {
          margin-right: 16px;
          width: 160px;

          /deep/ input {
            width: 100%;
            height: 56px;
            padding: 16px;
            border: 1px solid var(--color-surface-container-highest);
            border-radius: 12px;
            outline: 0;
            font-family: "Rookery New";
            font-size: 16px;
            font-weight: 400;
            color: var(--color-primary-primary);
          }
        }

        .right {
          flex: 1;

          > div:last-child {
            display: flex;
            align-items: center;
          }

          .slider {
            flex: 1;
          }

          .num {
            margin-left: 14px;
            width: 20px;
            font-family: "Rookery New";
            font-size: 12px;
            font-weight: 500;
            color: #0e131e;
            line-height: 16px;
            display: flex;
            justify-content: flex-end;
          }
        }
      }

      .rest {
        flex: 1;
      }

      :deep(.scribble) {
        max-height: 408px;
      }
    }

    &__right {
      width: calc(100% - 408px - 24px);
    }
  }
}
</style>
