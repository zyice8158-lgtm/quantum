<template>
  <div class="gallery">
    <!-- <HomeNav /> -->

    <div class="gallery__content">
      <!-- <GlobalBar /> -->

      <el-scrollbar @touchmove.stop>
        <GalleryBase
          :images="images"
          :onReachEnd="
            () => {
              getImages();
            }
          "
        >
          <template #info="{ value, index }">
            <div class="btns">
              <!-- <div
                class="info bg-secondary-container"
                v-helper="
                  () => {
                    return {
                      tabIndex: index,
                      role: 'button',
                      ariaLabel: $t('creatorZone.gallery.info'),
                      focus: () => {
                        _window.document.querySelector(`#id-${index}`)?.classList.add('hovered');
                      },
                      blur: () => {
                        _window.document.querySelector(`#id-${index}`)?.classList.remove('hovered');
                      },
                      click: () => {
                        currentImage = {
                          url: value.url,
                          content: value.content,
                          visible: true,
                        };
                      },
                    };
                  }
                "
              >
                <div class="icon bg-on-secondary-container"></div>
              </div> -->

              <div
                class="edit bg-secondary-container"
                v-helper="
                  () => {
                    return {
                      tabIndex: index,
                      role: 'button',
                      ariaLabel: $t('creatorZone.gallery.editBtn'),
                      focus: () => {
                        _window.document.querySelector(`#id-${index}`)?.classList.add('hovered');
                      },
                      blur: () => {
                        _window.document.querySelector(`#id-${index}`)?.classList.remove('hovered');
                      },
                      click: () => {
                        router.push({
                          path: '/quantum/creator-zone/editor',
                          query: {
                            url: value.url,
                          },
                        });
                      },
                    };
                  }
                "
              >
                <div class="icon bg-on-secondary-container"></div>

                <div class="text-on-secondary-container">
                  {{ $t("creatorZone.gallery.editBtn") }}
                </div>
              </div>

              <div
                class="download bg-secondary-container"
                v-helper="
                  () => {
                    return {
                      tabIndex: index,
                      role: 'button',
                      ariaLabel: $t('creatorZone.gallery.download'),
                      focus: () => {
                        _window.document.querySelector(`#id-${index}`)?.classList.add('hovered');
                      },
                      blur: () => {
                        _window.document.querySelector(`#id-${index}`)?.classList.remove('hovered');
                      },
                      click: () => {},
                    };
                  }
                "
              >
                <div class="icon bg-on-secondary-container"></div>
              </div>

              <div
                class="delete bg-secondary-container"
                v-helper="
                  () => {
                    return {
                      tabIndex: index,
                      role: 'button',
                      ariaLabel: $t('creatorZone.gallery.delete'),
                      focus: () => {
                        _window.document.querySelector(`#id-${index}`)?.classList.add('hovered');
                      },
                      blur: () => {
                        _window.document.querySelector(`#id-${index}`)?.classList.remove('hovered');
                      },
                      click: () => {},
                    };
                  }
                "
              >
                <div class="icon bg-on-secondary-container"></div>
              </div>
            </div>
          </template>
        </GalleryBase>
      </el-scrollbar>
    </div>

    <div class="layer" v-if="currentImage.visible">
      <div>
        <div
          class="close"
          @click="
            () => {
              currentImage = {
                ...currentImage,
                visible: false,
              };
            }
          "
        >
          <div class="icon"></div>
        </div>

        <div class="left">
          <img :src="currentImage.url" />
        </div>
        <div class="right">
          <div>
            {{ currentImage.content }}
          </div>

          <div
            @click="
              () => {
                router.push({
                  path: '/quantum/creator-zone/create/session',
                  query: {
                    content: currentImage.content,
                  },
                });
              }
            "
          >
            <div class="icon"></div>
            <div class="name">
              {{ $t("creatorZone.gallery.tryIt") }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { Iimage } from "@/types";
import { getUserImages } from "@/services/CreatorZone/userImages";
import GalleryBase from "@/components/CreatorZone/GalleryBase/index.vue";
// import GlobalBar from '@/components/CreatorZone/GlobalBar/index.vue'
// import HomeNav from '@/components/CreatorZone/HomeNav/index.vue'

const _window = window;

const router = useRouter();

const { t } = useI18n();

const images = ref<Iimage[]>([]);
const currentImage = ref({
  url: "",
  content: "",
  visible: false,
});

const getImagesParams = ref({
  pageNumber: 1,
  pageSize: 12,
  sortBy: "created,DESC",
});

const getImagesLoading = ref(false);

const getImages = async () => {
  if (getImagesLoading.value) {
    return;
  }

  getImagesLoading.value = true;

  const res = await getUserImages(getImagesParams.value);

  if (res.success) {
    const imageIds = {};
    const currentImages = [];

    images.value.forEach((image) => {
      imageIds[image.imageId] = true;
    });

    res?.images.forEach((image) => {
      if (!imageIds[image.imageId]) {
        currentImages.push({
          url: image.url,
          content: image.content,
          width: image.width,
          height: image.height,
        });
      }
    });

    images.value = [...images.value, ...currentImages];

    // 如果数据长度小于 pageSize 则说明已经取到所有数据 下次请求应该继续取这一页
    if (res?.images?.length === res.pageSize) {
      getImagesParams.value = {
        ...getImagesParams.value,
        pageNumber: getImagesParams.value.pageNumber + 1,
      };
    }
  } else {
    ElMessage({
      message: t("creatorZone.gallery.failedToRetrieve"),
      type: "error",
    });
  }

  getImagesLoading.value = false;
};

onMounted(() => {
  getImages();
});
</script>

<style lang="less" scoped>
.gallery {
  width: 100%;
  height: 100%;
  display: flex;

  .gallery__content {
    flex: 1;
    height: 100%;
    padding: 24px;
    display: flex;
    flex-direction: column;

    // :deep(.global-bar) {
    //   margin-bottom: 24px;
    // }

    :deep(.gallery-base) {
      .btns {
        width: calc(100% - 16px - 16px);
        height: calc(100% - 16px - 16px);
        border-radius: 24px;
        position: absolute;
        top: 16px;
        right: 16px;

        .info,
        .edit,
        .download,
        .delete {
          position: absolute;
          border-radius: 999px;
          cursor: pointer;
          display: flex;
          align-items: center;

          .icon {
            width: 16px;
            height: 16px;
            mask-size: 100%;
          }
        }

        .info,
        .download,
        .delete {
          padding: 8px;
        }

        .info {
          top: 0;
          right: 0;

          .icon {
            mask-image: url("@/assets/img/svg/info.svg");
          }
        }

        .edit {
          padding: 8px 16px;
          bottom: 0;
          left: 0;

          .icon {
            margin-right: 4px;
            mask-image: url("@/assets/img/svg/edit2.svg");
          }

          div {
            font-family: Rookery New;
            font-size: 12px;
            font-weight: 500;
          }
        }

        .download {
          right: calc(32px + 8px);
          bottom: 0;

          .icon {
            mask-image: url("@/assets/img/svg/imageDownload.svg");
          }
        }

        .delete {
          right: 0;
          bottom: 0;

          .icon {
            mask-image: url("@/assets/img/svg/delete.svg");
          }
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
    justify-content: center;
    align-items: center;

    > div {
      width: 632px;
      height: 416px;
      background: var(--color-surfaces-surface-bright);
      box-shadow: 0px 16px 32px 0px #00000030;
      border-radius: 24px;
      overflow: hidden;
      position: relative;
      display: flex;

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

      .left,
      .right {
        width: 50%;
      }

      .left {
        > img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .right {
        padding: 24px;
        display: flex;
        flex-direction: column;

        > div:first-child {
          flex: 1;
          padding-top: calc(24px + 16px);
          font-family: "Rookery New";
          font-size: 14px;
          font-weight: 400;
          color: var(--color-text-on-surface);
          line-height: 20px;
        }

        > div:last-child {
          margin-top: 24px;
          height: 40px;
          background-color: var(--color-primary-primary);
          border-radius: 999px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;

          .icon {
            margin-right: 8px;
            width: 18px;
            height: 18px;
            mask-image: url("@/assets/img/svg/edit2.svg");
            mask-size: 100%;
            background-color: var(--color-on-primary);
          }

          .name {
            font-family: "Rookery New";
            font-size: 14px;
            font-weight: 500;
            color: var(--color-on-primary);
          }
        }
      }
    }
  }
}
</style>
