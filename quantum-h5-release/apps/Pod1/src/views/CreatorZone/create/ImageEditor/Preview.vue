<template>
  <div class="preview" v-automation="'preview'">
    <ColorfulLoading
      v-if="generatedImage"
      :style="{
        'aspect-ratio': `${generatedImage.width} / ${generatedImage.height}`,
      }"
    />
    <div
      v-else
      class="preview__inner"
      :style="{
        'aspect-ratio': `${currentImage.width} / ${currentImage.height}`,
      }"
    >
      <ImagePreview :src="currentImage?.url" />
    </div>

    <template v-if="!generatedImage && images.length > 0">
      <div class="btns">
        <div
          class="image-to-image"
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
                ariaLabel: $t('creatorZone.create.imageEditor.imageToImage'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  setReferenceImageUrl(currentImage.url);
                  setReferenceImageType(REFERENCEIMAGE_TYPE.MODEL);
                  setOperateType(OPERATE_TYPE.IMAGE_TO_IMAGE);
                },
              };
            }
          "
           v-automation="'image_to_image'"
        >
          <div class="icon"></div>
          <div class="name">{{ $t("creatorZone.create.imageEditor.imageToImage") }}</div>
        </div>

        <!-- <div
          class="gen-video"
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
        >
          <div class="icon"></div>
          <div class="name">{{ $t("creatorZone.create.imageEditor.generateVideo") }}</div>
        </div> -->

        <div class="rest"></div>

        <div
          class="copy-image"
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
                ariaLabel: $t('creatorZone.create.imageEditor.copy'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  copyImage();
                },
              };
            }
          "
        >
          <div class="icon"></div>
        </div>

        <!-- <div
          class="share-image"
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
        >
          <div class="icon"></div>
        </div> -->

        <div
          class="download-image"
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
                ariaLabel: $t('creatorZone.create.imageEditor.download'),
                focus: () => {},
                blur: () => {},
                click: () => {},
              };
            }
          "
        >
          <div class="icon"></div>
        </div>

        <div
          class="memory-image"
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
                ariaLabel: $t('creatorZone.create.imageEditor.memory'),
                focus: () => {},
                blur: () => {},
                click: async (e) => {
                  if (e.currentTarget.classList.contains('disabled')) {
                    return;
                  }

                  e.currentTarget.classList.add('disabled');

                  await memoryImage();

                  e.currentTarget.classList.remove('disabled');
                },
              };
            }
          "
        >
          <div class="icon"></div>
        </div>
      </div>

      <div
        class="prev"
        v-if="currentImage?.index > 0"
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
              ariaLabel: $t('creatorZone.create.imageEditor.lastImage'),
              focus: () => {},
              blur: () => {},
              click: () => {
                setImages(currentImage?.index - 1);
              },
            };
          }
        "
      >
        <div class="icon"></div>
      </div>

      <div
        class="next"
        v-if="currentImage?.index < images.length - 1"
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
              ariaLabel: $t('creatorZone.create.imageEditor.nextImage'),
              focus: () => {},
              blur: () => {},
              click: () => {
                setImages(currentImage?.index + 1);
              },
            };
          }
        "
      >
        <div class="icon"></div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { REFERENCEIMAGE_TYPE, OPERATE_TYPE, IcreateRef } from "@/types";
import ColorfulLoading from "@/components/CreatorZone/ColorfulLoading/index.vue";
import ImagePreview from "@/components/CreatorZone/ImagePreview/index.vue";
import { imageBase64ToLocalFile } from "@/cs/imageBase64ToLocalFile";
import { fileToImageBase64, translateImageFile, urlToFile } from "@/services/CreatorZone/file";
import { addMemory } from "@libs/service";

const { t } = useI18n();

const {
  generatedImage,
  setReferenceImageUrl: _setReferenceImageUrl,
  setReferenceImageType: _setReferenceImageType,
  setOperateType: _setOperateType,
  images,
  currentImage,
  setImages: _setImages,
} = inject<IcreateRef>("CREATE_REF");

const setReferenceImageUrl = (value) => {
  if (generatedImage.value) {
    return;
  }

  _setReferenceImageUrl(value);
};

const setReferenceImageType = (value) => {
  if (generatedImage.value) {
    return;
  }

  _setReferenceImageType && _setReferenceImageType(value);
};

const setOperateType = (value) => {
  if (generatedImage.value) {
    return;
  }

  _setOperateType(value);
};

const setImages = (i) => {
  const imgs = images.value.map((image, index) => {
    return {
      ...image,
      active: index === i,
    };
  });

  _setImages(imgs);
};

const showHoverStyle = (e, expanded = true) => {
  if (generatedImage.value) {
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

const copyImage = async () => {
  const file = await translateImageFile(await urlToFile(currentImage.value.url));

  window.navigator.clipboard
    .write([
      new ClipboardItem({
        [file.type]: file,
      }),
    ])
    .then(() => {
      ElMessage({
        message: t("common.success"),
        type: "success",
      });
    })
    .catch((error) => {
      throw new Error(error.message);
    });
};

const memoryImage = async () => {
  const res = await addMemory({
    Data: {
      userText: currentImage.value.content,
      fileList: [
        await imageBase64ToLocalFile(
          await fileToImageBase64(await urlToFile(currentImage.value.url))
        ),
      ],
    },
  });

  if (res?.data?.Data?.Status === "complete") {
    ElMessage({
      message: t("common.success"),
      type: "success",
    });
  } else {
    ElMessage({
      message: t("common.failed"),
      type: "error",
    });
  }
};
</script>

<style lang="less" scoped>
.preview {
  max-width: 100%;
  padding-bottom: 40px;
  position: relative;

  :deep(.colorful-loading),
  &__inner {
    margin: 0 auto;
    max-width: 100%;
    max-height: 100%;
  }

  &__inner {
    :deep(.image-init),
    :deep(.image-loading),
    :deep(.image-preview),
    :deep(.image-failed) {
      width: 100%;
      height: 100%;
      border-radius: 16px;
    }

    :deep(.image-loading),
    :deep(.image-failed) {
      > div {
        width: 144px;
        height: 108px;
      }
    }
  }

  .prev,
  .next {
    width: 32px;
    height: 32px;
    background: var(--color-secondary-container);
    border-radius: 50%;
    cursor: pointer;
    position: absolute;
    top: 50%;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    .icon {
      width: 16px;
      height: 16px;
      mask-size: 100%;
      background-color: var(--color-text-on-surface);
    }

    &.hovered {
      box-shadow: 0px 2px 6px 2px #00000026;
    }
  }

  .btns {
    width: 100%;
    position: absolute;
    right: 0;
    bottom: 0;
    display: flex;

    .image-to-image,
    .gen-video,
    .copy-image,
    .share-image,
    .download-image,
    .memory-image {
      background: var(--color-secondary-container);
      cursor: pointer;

      .icon {
        width: 16px;
        height: 16px;
        mask-size: 100%;
        background-color: var(--color-text-on-surface);
      }

      .name {
        margin-left: 4px;
        font-family: "Rookery New";
        font-size: 12px;
        font-weight: 500;
        color: var(--color-text-on-surface);
      }

      &.hovered {
        // background: rgba(255, 255, 255, 0.5);
      }

      &.disabled {
        opacity: 0.38;
      }

      + div {
        margin-left: 8px;
      }
    }

    .image-to-image,
    .gen-video {
      padding: 8px 16px;
      border-radius: 999px;
      display: flex;
      align-items: center;
    }

    .copy-image,
    .share-image,
    .download-image,
    .memory-image {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .image-to-image {
      .icon {
        mask-image: url("@/assets/img/svg/imageToImage.svg");
      }
    }

    .gen-video {
      .icon {
        mask-image: url("@/assets/img/svg/genVideo.svg");
      }
    }

    .copy-image {
      .icon {
        mask-image: url("@/assets/img/svg/imageCopy.svg");
      }
    }

    .share-image {
      .icon {
        mask-image: url("@/assets/img/svg/imageShare.svg");
      }
    }

    .download-image {
      .icon {
        mask-image: url("@/assets/img/svg/imageDownload.svg");
      }
    }

    .memory-image {
      .icon {
        mask-image: url("@/assets/img/svg/imageMemory.svg");
      }
    }

    .rest {
      flex: 1;
    }
  }

  .prev {
    left: 0;
    transform: translate(-50%, -50%);

    .icon {
      mask-image: url("@/assets/img/svg/prevImage.svg");
    }
  }

  .next {
    right: 0;
    transform: translate(50%, -50%);

    .icon {
      mask-image: url("@/assets/img/svg/nextImage.svg");
    }
  }
}
</style>
