<template>
  <div class="reference-image" ref="referenceImageRef">
    <div>
      <div
        class="upload-image"
        :class="{
          border: referenceImageUrl && imageSize.width !== imageSize.height,
        }"
      >
        <template v-if="referenceImageUrl">
          <img
            id="id-73ff12af"
            :src="referenceImageUrl"
            v-helper="
              () => {
                return {
                  role: 'button',
                  ariaLabel: $t('creatorZone.create.single.editReferenceImage'),
                  elId: '#id-dc820c6e',
                  focus: () => {},
                  blur: () => {},
                  click: () => {
                    visible = true;
                  },
                };
              }
            "
          />

          <div
            class="delete"
            v-helper="
              () => {
                return {
                  role: 'button',
                  ariaLabel: $t('creatorZone.create.single.deleteReferenceImage'),
                  elId: '#id-f820ab60',
                  focus: () => {},
                  blur: () => {},
                  click: () => {
                    setOriginalImageUrl('');

                    if (
                      [OPERATE_TYPE.IMAGE_TO_IMAGE, OPERATE_TYPE.SMART_EDITING].includes(
                        operateType,
                      )
                    ) {
                      setOperateType(OPERATE_TYPE.TEXT_TO_IMAGE);
                    }
                  },
                };
              }
            "
          >
            <div class="icon"></div>
          </div>
        </template>
        <template v-else>
          <div
            id="id-f820ab60"
            class="w-full h-full absolute right-0 top-0 flex flex-col justify-center items-center"
            v-helper="
              () => {
                return {
                  role: 'button',
                  ariaLabel: $t('creatorZone.create.single.uploadReferenceImage'),
                  focus: () => {},
                  blur: () => {},
                  click: () => {
                    referenceImageRef.querySelector(`input[type='file']`)?.click();
                  },
                };
              }
            "
          >
            <div class="icon"></div>
            <div class="name">{{ $t("creatorZone.create.single.referenceImage") }}</div>
          </div>

          <input
            style="display: none"
            type="file"
            :accept="imageTypes.map((imageType) => `.${imageType}`).join(',')"
            @change="
              (e) => {
                setOriginalImageUrl(e);

                if (
                  [OPERATE_TYPE.TEXT_TO_IMAGE, OPERATE_TYPE.SMART_EDITING].includes(operateType)
                ) {
                  setOperateType(OPERATE_TYPE.IMAGE_TO_IMAGE);
                }
              }
            "
          />
        </template>
      </div>

      <div class="peference-dimension">
        <div class="name">{{ $t("creatorZone.create.single.referenceDimension") }}</div>

        <div class="choose-peference-dimension">
          <div
            id="id-dcd64cde"
            class="trigger"
            :class="{
              disabled: !referenceImageUrl,
            }"
            v-helper="
              () => {
                return {
                  role: 'button',
                  ariaLabel: selectedReferenceDimension.name,
                  ariaHaspopup: true,
                  ariaExpanded: referenceDimensionVisible,
                  elId: '#id-13fcce02',
                  focus: () => {},
                  blur: () => {},
                  click: () => {
                    if (referenceImageUrl) {
                      referenceDimensionVisible = !referenceDimensionVisible;
                    }
                  },
                };
              }
            "
          >
            <div class="name">
              {{ selectedReferenceDimension.name }}
            </div>

            <div
              class="icon"
              :class="{
                active: referenceDimensionVisible,
              }"
            ></div>
          </div>

          <div
            id="id-13fcce02"
            class="content"
            v-if="referenceDimensionVisible"
            v-helper="
              () => {
                return {
                  tabIndex: -1,
                  role: 'listbox',
                  ariaHidden: !referenceDimensionVisible,
                  ariaRestricted: referenceDimensionVisible,
                  elId: '#id-dcd64cde',
                  focus: () => {},
                  blur: () => {},
                  click: () => {},
                };
              }
            "
          >
            <el-scrollbar @touchmove.stop>
              <template v-for="referenceDimension in referenceDimensions">
                <div
                  v-if="referenceDimension?.id !== ReferenceDimensionType.CONTROLNET_SCRIBBLE"
                  class="item"
                  :class="{
                    selected: referenceDimension.selected,
                  }"
                  v-hover.mouse="
                    () => {
                      return {
                        start: (e) => {
                          e.target.classList.add('hovered');
                        },
                        cancel: (e) => {
                          e.target.classList.remove('hovered');
                        },
                      };
                    }
                  "
                  v-helper="
                    () => {
                      return {
                        role: 'option',
                        ariaLabel: referenceDimension.name,
                        ariaSelected: referenceDimension.selected,
                        focus: () => {},
                        blur: () => {},
                        click: () => {
                          setReferenceDimensions(referenceDimension.id);
                        },
                      };
                    }
                  "
                >
                  <div class="name">
                    {{ referenceDimension.name }}
                  </div>
                </div>
              </template>
            </el-scrollbar>
          </div>
        </div>

        <div class="rest"></div>

        <Slider
          :disabled="!referenceImageUrl"
          :show-tooltip="true"
          :step="0.01"
          :min="0"
          :max="selectedReferenceDimension.id === ReferenceDimensionType.IMAGE_STRENGTH ? 0.99 : 1"
          :value="selectedReferenceDimension.value"
          :onChange="
            (value) => {
              setReferenceDimensions(selectedReferenceDimension.id, value);
            }
          "
        />

        <div class="reference-strength">
          <div>{{ $t("creatorZone.create.single.similarity") }}</div>
          <div>{{ selectedReferenceDimension.value }}</div>
        </div>
      </div>
    </div>

    <div
      id="id-dc820c6e"
      class="layer"
      :style="{
        ...(visible
          ? {
              opacity: 1,
              'z-index': 1,
            }
          : {
              opacity: 0,
              'z-index': -1,
            }),
      }"
      v-helper="
        () => {
          return {
            tabIndex: -1,
            role: 'dialog',
            ariaModal: true,
            ariaHidden: !visible,
            ariaRestricted: visible,
            elId: '#id-73ff12af',
            focus: () => {},
            blur: () => {},
            click: () => {},
          };
        }
      "
    >
      <div>
        <div
          class="close"
          v-helper="
            () => {
              return {
                role: 'button',
                ariaLabel: $t('creatorZone.create.single.close'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  visible = false;
                },
              };
            }
          "
        ></div>

        <div>
          <div class="name">{{ $t("creatorZone.create.single.cropTheImage") }}</div>

          <CropBase
            v-if="originalImageUrl"
            ref="cropRef"
            :imageUrl="originalImageUrl"
            :cropBoxRatio="{ x: imageSize.width, y: imageSize.height }"
            :locked="true"
          />

          <div class="footer">
            <div
              v-helper="
                () => {
                  return {
                    role: 'button',
                    ariaLabel: $t('creatorZone.create.single.cancel'),
                    focus: () => {},
                    blur: () => {},
                    click: () => {
                      visible = false;
                    },
                  };
                }
              "
            >
              {{ $t("creatorZone.create.single.cancel") }}
            </div>
            <div
              v-helper="
                () => {
                  return {
                    role: 'button',
                    ariaLabel: $t('creatorZone.create.single.confirm'),
                    focus: () => {},
                    blur: () => {},
                    click: () => {
                      setReferenceImageUrl(cropRef.crop());

                      visible = false;
                    },
                  };
                }
              "
            >
              {{ $t("creatorZone.create.single.confirm") }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onMounted, onUnmounted, ref, Ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import numeral from "numeral";
import { imageTypes, ReferenceDimensionType, initReferenceDimensions } from "@/constant";
import { OPERATE_TYPE, IsingleRef } from "@/types";
import { fileToImageBase64, urlToFile } from "@/services/CreatorZone/file";
import CropBase from "@/components/CreatorZone/CropBase/index.vue";
import Slider from "@/components/CreatorZone/Slider/index.vue";

const { t } = useI18n();

const {
  imageSize,
  referenceImageUrl,
  setReferenceImageUrl,
  referenceDimension,
  setReferenceDimension,
  referenceStrength,
  setReferenceStrength,
  setSteps,
  setCfgScale,
  operateType,
  setOperateType,
} = inject<IsingleRef>("SINGLE_REF");

const referenceImageRef = ref(null);

const originalImageUrl = ref<string>("");

const referenceDimensions = ref(
  initReferenceDimensions.map((referenceDimension) => {
    let name = "";

    if (referenceDimension?.id === ReferenceDimensionType.CONTROLNET_TILE) {
      name = t("creatorZone.create.single.controlnetTile");
    } else if (referenceDimension?.id === ReferenceDimensionType.CONTROLNET_DEPTH) {
      name = t("creatorZone.create.single.controlnetDepth");
    } else if (referenceDimension?.id === ReferenceDimensionType.CONTROLNET_CANNY) {
      name = t("creatorZone.create.single.controlnetCanny");
    } else if (referenceDimension?.id === ReferenceDimensionType.CONTROLNET_POSE) {
      name = t("creatorZone.create.single.controlnetPose");
    } else if (referenceDimension?.id === ReferenceDimensionType.IMAGE_STRENGTH) {
      name = t("creatorZone.create.single.imageWeight");
    }

    return {
      ...referenceDimension,
      name,
    };
  }),
);
const selectedReferenceDimension = computed(() => {
  return referenceDimensions.value.find((referenceDimension) => referenceDimension.selected);
});
const referenceDimensionVisible = ref(false);

const visible = ref(false);

const cropRef = ref(null);

const setOriginalImageUrl = async (value) => {
  if (value instanceof Event) {
    originalImageUrl.value = (await fileToImageBase64(
      (value.target as HTMLInputElement).files[0]
    )) as string;
  } else if (value instanceof File) {
    originalImageUrl.value = (await fileToImageBase64(value)) as string;
  } else if (value.startsWith("https://") || value.startsWith("http://")) {
    const file = await urlToFile(value);

    originalImageUrl.value = (await fileToImageBase64(file)) as string;
  } else if (value.startsWith("data:image/") && value.includes("base64,")) {
    originalImageUrl.value = value;
  } else if (value === "") {
    originalImageUrl.value = value;
  }

  setReferenceImageUrl(await crop());
};

const setReferenceDimensions = (id, value?) => {
  referenceDimensions.value = referenceDimensions.value.map((referenceDimension) => {
    if (referenceDimension.id === id) {
      return {
        ...referenceDimension,
        selected: true,
        value: value ?? referenceDimension.value,
      };
    }

    return {
      ...referenceDimension,
      selected: false,
    };
  });
};

// 裁剪
const crop = async () => {
  if (!originalImageUrl.value) {
    return "";
  }

  const originalImage: HTMLImageElement = await new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      resolve(image);
    };

    image.src = originalImageUrl.value;
  });

  let width = 0,
    height = 0,
    x = 0,
    y = 0;

  if (
    (originalImage.width / imageSize.value.width) * imageSize.value.height <=
    originalImage.height
  ) {
    width = originalImage.width;
    height = Math.floor((originalImage.width / imageSize.value.width) * imageSize.value.height);
  } else {
    width = Math.floor((originalImage.height / imageSize.value.height) * imageSize.value.width);
    height = originalImage.height;
  }

  x = Math.floor((originalImage.width - width) / 2);
  y = Math.floor((originalImage.height - height) / 2);

  const canvas = window.document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(originalImage, x, y, width, height, 0, 0, width, height);

  return canvas.toDataURL();
};

const Eclick = (e) => {
  if (
    !referenceImageRef.value
      .querySelector(".choose-peference-dimension .trigger")
      ?.contains(e.target)
  ) {
    referenceDimensionVisible.value = false;
  }
};

const Eenter = (e) => {
  if (e.key === "Enter") {
    Eclick(e);
  }
};

onMounted(() => {
  window.addEventListener("click", Eclick);

  window.addEventListener("keydown", Eenter);
});

onUnmounted(() => {
  window.removeEventListener("click", Eclick);

  window.removeEventListener("keydown", Eenter);
});

watch(
  [() => imageSize.value],
  async () => {
    setReferenceImageUrl(await crop());
  },
  { immediate: true }
);

watch(
  [() => referenceDimension.value, () => referenceStrength.value],
  () => {
    if (referenceDimension.value && referenceStrength.value) {
      setReferenceDimensions(referenceDimension.value);
    }
  },
  { immediate: true }
);

watch(
  [() => selectedReferenceDimension.value],
  () => {
    setReferenceDimension(selectedReferenceDimension.value.id);
    setReferenceStrength(selectedReferenceDimension.value.value);

    setSteps(selectedReferenceDimension.value.steps);
    setCfgScale(selectedReferenceDimension.value.cfgScale);
  },
  { immediate: true }
);

defineExpose({
  setOriginalImageUrl,
});
</script>

<style lang="less" scoped>
.reference-image {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  > div:first-child {
    width: 100%;
    background: var(--color-surfaces-surface);
    padding: 16px;
    border-radius: 24px;
    display: flex;

    .upload-image {
      width: 160px;
      height: 160px;
      background: var(--color-surface-container-highest);
      border-radius: 24px;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;

      &.border {
        border: 1px dashed #ded9d5;
      }

      > img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .delete {
        width: 32px;
        height: 32px;
        background: var(--color-secondary-container);
        border-radius: 999px;
        position: absolute;
        right: 16px;
        top: 16px;
        display: flex;
        justify-content: center;
        align-items: center;

        .icon {
          width: 16px;
          height: 16px;
          mask-image: url("@/assets/img/svg/delete.svg");
          mask-size: 100%;
          background-color: var(--color-on-secondary-container);
        }
      }

      .icon {
        width: 32px;
        height: 32px;
        mask-image: url("@/assets/img/svg/upload-image.svg");
        mask-size: 100%;
        background-color: var(--color-text-on-surface-muted);
      }

      .name {
        margin-top: 4px;
        font-family: "Rookery New";
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text-on-surface-muted);
        line-height: 20px;
      }
    }

    .peference-dimension {
      flex: 1;
      margin-left: 16px;
      display: flex;
      flex-direction: column;

      .name {
        font-family: "Rookery New";
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-on-surface-variant);
        line-height: 20px;
      }

      .choose-peference-dimension {
        margin-top: 4px;
        height: 56px;
        border: 1px solid var(--color-surface-container-highest);
        border-radius: 16px;
        position: relative;

        .trigger {
          height: 100%;
          padding: 16px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .name {
            font-family: "Rookery New";
            font-size: 16px;
            font-weight: 500;
            color: var(--color-primary-primary);
          }

          .icon {
            width: 24px;
            height: 24px;
            mask-image: url("@/assets/img/svg/arrow-down.svg");
            mask-size: 100%;
            background-color: var(--color-text-on-surface-variant);

            &.active {
              rotate: 180deg;
            }
          }

          &.disabled {
            opacity: 0.38;
          }
        }

        .content {
          width: 100%;
          background-color: var(--color-surfaces-surface-bright);
          padding: 12px;
          box-shadow: 0px 2px 6px 2px #00000026;
          border-radius: 16px;
          position: absolute;
          left: 0;
          z-index: 2;

          .item {
            width: 100%;
            cursor: pointer;
            display: flex;
            align-items: center;

            &.hovered,
            &.selected {
              background: var(--color-on-primary-hover);
              border-radius: 6px;
            }

            div {
              font-family: "Rookery New";
              font-size: 12px;
              font-weight: 400;
              color: var(--color-text-on-surface);
            }
          }
        }

        .content {
          .item {
            padding: 4px;
          }
        }
      }

      .rest {
        flex: 1;
      }

      .slider {
        width: 100%;
      }

      .reference-strength {
        margin-top: 4px;
        display: flex;
        justify-content: space-between;

        > div {
          font-family: "Rookery New";
          font-size: 12px;
          font-weight: 500;
          color: var(--color-text-on-surface);
          line-height: 16px;
        }
      }
    }
  }

  .layer {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 8, 48, 0.27);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    > div {
      width: 616px;
      height: 456px;
      background: var(--color-surfaces-surface-bright);
      box-shadow: 0px 16px 32px 0px #00000030;
      padding: 24px;
      border-radius: 24px;
      position: relative;

      .close {
        width: 24px;
        height: 24px;
        mask-image: url("@/assets/img/svg/close.svg");
        mask-size: 100%;
        background-color: var(--color-text-on-surface);
        cursor: pointer;
        position: absolute;
        top: 24px;
        right: 24px;
      }

      > div:last-child {
        width: 100%;
        height: 100%;
        border-radius: 24px;
        display: flex;
        flex-direction: column;

        .name {
          font-family: "Rookery New";
          font-size: 18px;
          font-weight: 500;
          color: var(--color-text-on-surface);
          line-height: 26px;
        }

        :deep(.crop-base) {
          margin: 24px 0;
          flex: 1;
        }

        .footer {
          display: flex;
          justify-content: flex-end;

          > div {
            padding: 10px 20px;
            border-radius: 999px;
            font-family: "Rookery New";
            font-size: 14px;
            font-weight: 500;
            line-height: 20px;
            cursor: pointer;

            &:first-child {
              color: var(--color-text-on-surface);
            }

            &:last-child {
              margin-left: 8px;
              background: var(--color-primary-primary);
              color: var(--color-on-primary);
            }
          }
        }
      }
    }
  }
}
</style>
