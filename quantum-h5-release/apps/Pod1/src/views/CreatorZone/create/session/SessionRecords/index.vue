<template>
  <div class="session-records">
    <template v-for="record in sessionRecords">
      <div
        class="record user select-text"
        v-if="record.role === SESSION_RECORD_SOURCE.USER"
        :id="`record-id-${record.recordId}`"
        :class="{
          'reference-image': record.referenceImageUrl,
        }"
      >
        <div class="record__inner">
          <div class="reference-image" v-if="record.referenceImageUrl">
            <img :src="record.referenceImageUrl" />
          </div>
          <div class="text">{{ record.content }}</div>
        </div>
      </div>

      <div
        class="record loading"
        v-if="record.role === SESSION_RECORD_SOURCE.LOADING"
        :id="`record-id-${record.recordId}`"
      >
        <div class="record__inner" v-automation="'record_inner'">
          <!-- <div></div>
          <div></div>
          <div></div> -->

          <div class="icon"></div>
          <div class="name" v-automation="'record_inner_name'">
            {{ $t("creatorZone.create.session.generatedImageLoadingTip") }}
          </div>
        </div>
      </div>

      <div
        class="record system"
        v-if="record.role === SESSION_RECORD_SOURCE.SYSTEM"
        :id="`record-id-${record.recordId}`"
        :class="{
          'one-row-one-column': record.images.length === 1,
          'one-row-two-columns': record.images.length === 2,
          'two-rows-two-columns':
            record.images.length === 4 && Number(record.width) > Number(record.height),
          'one-row-four-columns':
            record.images.length === 4 && Number(record.width) <= Number(record.height),
        }"
      >
        <div class="record__inner">
          <!-- <div class="text" v-if="[OPERATE_TYPE.TEXT_TO_IMAGE].includes(record.operateType)">
            {{ record.content }}
          </div> -->
          <div
            class="text"
            v-if="record.images.find((image) => image.resultStatus === IMAGE_STATUS.SUCCESSFULLY)"
            v-automation="'record_inner_text'"
          >
            {{ $t("creatorZone.create.session.generatedImageTip") }}
          </div>

          <el-scrollbar>
            <div class="images" v-automation="'record_inner_images'">
              <template v-for="image in record.images">
                <div
                  v-if="image.resultStatus === IMAGE_STATUS.SUCCESSFULLY"
                  class="success"
                  :style="{
                    'aspect-ratio': `${record.width} / ${record.height}`,
                  }"
                  v-helper="
                    () => {
                      return {
                        role: 'button',
                        ariaLabel: $t('creatorZone.create.session.selectImage'),
                        focus: () => {},
                        blur: () => {},
                        click: () => {
                          setImages(image.url);
                        },
                      };
                    }
                  "
                  v-automation="'image_success'"
                >
                  <ImagePreview :src="image.url" :loading="true" />

                  <div
                    class="download"
                    v-helper="
                      () => {
                        return {
                          role: 'button',
                          ariaLabel: $t('creatorZone.create.session.download'),
                          focus: () => {},
                          blur: () => {},
                          click: ({ e }) => {
                            e.stopPropagation();
                          },
                        };
                      }
                    "
                  >
                    <div class="icon"></div>
                  </div>
                </div>

                <div
                  v-if="image.resultStatus === IMAGE_STATUS.LOADING"
                  class="loading"
                  :style="{
                    'aspect-ratio': `${record.width} / ${record.height}`,
                  }"
                  v-automation="'image_loading'"
                >
                  <img src="@/assets/img/svg/imageFailed.svg" />
                </div>

                <div
                  v-if="image.resultStatus === IMAGE_STATUS.FAILED"
                  class="fail"
                  :style="{
                    'aspect-ratio': `${record.width} / ${record.height}`,
                  }"
                  v-automation="'image_fail'"
                >
                  <img src="@/assets/img/svg/imageFailed.svg" />
                </div>
              </template>
            </div>
          </el-scrollbar>

          <div class="btns">
            <div
              class="refresh"
              v-helper="
                () => {
                  return {
                    role: 'button',
                    ariaLabel: $t('creatorZone.create.session.redo'),
                    focus: () => {},
                    blur: () => {},
                    click: () => {},
                  };
                }
              "
            >
              <div class="icon"></div>
            </div>

            <!-- <div class="rest"></div> -->

            <div
              class="memory-image"
              v-if="record.images.find((image) => image.resultStatus === IMAGE_STATUS.SUCCESSFULLY)"
              v-helper="
                () => {
                  return {
                    role: 'button',
                    ariaLabel: $t('creatorZone.create.session.memory'),
                    focus: () => {},
                    blur: () => {},
                    click: async (e) => {
                      if (e.currentTarget.classList.contains('disabled')) {
                        return;
                      }

                      e.currentTarget.classList.add('disabled');

                      for (let index = 0; index < record.images.length; index++) {
                        const image = record.images[index];

                        if (image.resultStatus === IMAGE_STATUS.SUCCESSFULLY) {
                          await memoryImage({
                            content: record.content,
                            url: image.url,
                          });
                        }
                      }

                      e.currentTarget.classList.remove('disabled');
                    },
                  };
                }
              "
            >
              <div class="icon"></div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch, Ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import {
  SESSION_RECORD_SOURCE,
  IMAGE_STATUS,
  REFERENCEIMAGE_TYPE,
  OPERATE_TYPE,
  IsessionRecord,
  IcreateRef,
} from "@/types";
import ImagePreview from "@/components/CreatorZone/ImagePreview/index.vue";
import { imageBase64ToLocalFile } from "@/cs/imageBase64ToLocalFile";
import { fileToImageBase64, urlToFile } from "@/services/CreatorZone/file";
import { addMemory } from "@libs/service";

const { t } = useI18n();

const { sessionRecords, images, setImages: _setImages } = inject<IcreateRef>("CREATE_REF");

const setImages = (url) => {
  const imgs = images.value.map((image) => {
    return {
      ...image,
      active: image.url === url,
    };
  });

  _setImages(imgs);
};

const memoryImage = async ({ content, url }) => {
  const res = await addMemory({
    Data: {
      userText: content,
      fileList: [await imageBase64ToLocalFile(await fileToImageBase64(await urlToFile(url)))],
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
.session-records {
  .record {
    &__inner {
      padding: 12px 16px;
      border-radius: 16px;

      .text {
        font-family: "Rookery New";
        font-size: 14px;
        font-weight: 400;
        color: var(--color-text-on-surface-variant);
        line-height: 20px;
      }

      .images {
        width: fit-content;
        display: flex;

        > div {
          width: 160px;
          border-radius: 24px;

          + div {
            margin-left: 8px;
          }
        }

        .success {
          overflow: hidden;
          cursor: pointer;
          position: relative;

          :deep(.image-preview) {
            width: 100%;
            height: 100%;
          }

          .download {
            width: 32px;
            height: 32px;
            background-color: var(--color-secondary-container);
            border-radius: 50%;
            position: absolute;
            right: 16px;
            bottom: 16px;
            z-index: 1;
            display: flex;
            justify-content: center;
            align-items: center;

            .icon {
              width: 16px;
              height: 16px;
              mask-image: url("@/assets/img/svg/imageDownload.svg");
              mask-size: 100%;
              background-color: var(--color-on-secondary-container);
            }
          }
        }

        .loading,
        .fail {
          background: var(--color-surface-container-highest);
          display: flex;
          justify-content: center;
          align-items: center;

          > img {
            width: 80px;
          }
        }

        .loading {
          background: linear-gradient(287.89deg, #f6f6f6 25%, #e6e8eb 37%, #f6f6f6 63%);
          background-size: 400% 100%;
          animation: image-loading 2.6s ease infinite;

          @keyframes image-loading {
            0% {
              background-position: 100% 50%;
            }

            50% {
              background-position: 0 50%;
            }

            100% {
              background-position: 100% 50%;
            }
          }
        }
      }

      .btns {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;

        .refresh,
        .memory-image {
          width: 32px;
          height: 32px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;

          .icon {
            width: 16px;
            height: 16px;
            mask-size: 100%;
            background-color: var(--color-focus-focus);
          }

          &.disabled {
            opacity: 0.38;
          }
        }

        .refresh {
          .icon {
            mask-image: url("@/assets/img/svg/refresh.svg");
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

        .line {
          width: 1px;
          height: 16px;
          background: #ded9d4;
        }

        > div {
          + div {
            margin-left: 8px;
          }
        }
      }
    }

    &.user {
      padding-left: 24px;
      display: flex;
      justify-content: flex-end;

      &.reference-image {
        margin-top: calc(160px + 8px + 12px);
      }

      .record__inner {
        background: var(--color-surfaces-surface-blur);
        border-bottom-right-radius: 0;
        position: relative;

        .reference-image {
          height: 160px;
          border-radius: 24px;
          overflow: hidden;
          position: absolute;
          top: -8px;
          right: 0;
          transform: translateY(-100%);

          img {
            max-width: unset;
            height: 100%;
          }
        }
      }
    }

    // &.loading {
    //   .record__inner {
    //     width: 74px;
    //     height: 48px;
    //     border-top-left-radius: 0;
    //     display: flex;
    //     justify-content: center;
    //     align-items: center;

    //     > div {
    //       width: 6px;
    //       height: 6px;
    //       background: #d4d4d4;
    //       border-radius: 50%;
    //       animation: chat-loading 1.2s infinite;

    //       &:nth-child(2) {
    //         animation-delay: 0.2s;
    //       }

    //       &:nth-child(3) {
    //         animation-delay: 0.4s;
    //       }

    //       + div {
    //         margin-left: 4px;
    //       }

    //       @keyframes chat-loading {
    //         0%,
    //         100% {
    //           width: 6px;
    //           height: 6px;
    //           background: #d4d4d4;
    //         }

    //         50% {
    //           width: 8px;
    //           height: 8px;
    //           background: #992e8a;
    //         }
    //       }
    //     }
    //   }
    // }

    &.loading {
      padding-right: 24px;

      .record__inner {
        height: 64px;
        display: flex;
        align-items: center;

        .icon {
          width: 24px;
          height: 24px;
          background-image: url("@/assets/img/svg/logo.svg");
          background-size: 100%;
        }

        .name {
          margin-left: 10px;
          font-size: 16px;
          font-weight: 500;
          background: radial-gradient(50% 50% at 50% 50%, #5c8dff 0%, #855ee1 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    }

    &.system {
      padding-right: 24px;

      .record__inner {
        background: var(--color-surfaces-surface);
        border-bottom-left-radius: 0;

        .text {
          margin-bottom: 16px;
          background: radial-gradient(50% 50% at 50% 50%, #5c8dff 0%, #855ee1 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      &.one-row-one-column {
        width: calc(160px + 16px + 16px + 24px);
      }
    }

    + .record {
      margin-top: 12px;
    }
  }
}
</style>
