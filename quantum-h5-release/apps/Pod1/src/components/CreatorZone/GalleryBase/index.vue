<template>
  <div class="gallery-base">
    <div class="groups">
      <template v-for="({ images }, i) in groups">
        <div
          class="group"
          :style="{
            width: `${96 / columnNum}%`,
          }"
        >
          <template v-for="(image, j) in images">
            <div
              class="image"
              :style="{
                'aspect-ratio': `${image.width} / ${image.height}`,
              }"
            >
              <div
                class="w-full h-full"
                v-helper="
                  () => {
                    return {
                      tabIndex: j * props.columnNum + i + 1,
                      role: 'img',
                      ariaLabel: image?.content,
                      focus: () => {
                        _window.document
                          .querySelector(`#id-${j * props.columnNum + i + 1}`)
                          ?.classList.add('hovered');
                      },
                      blur: () => {
                        _window.document
                          .querySelector(`#id-${j * props.columnNum + i + 1}`)
                          ?.classList.remove('hovered');
                      },
                      click: () => {},
                    };
                  }
                "
              >
                <ImagePreview :src="image.url" :loading="true" />
              </div>

              <div
                :id="`id-${j * props.columnNum + i + 1}`"
                class="mask text-text-inverse-on-surface"
                v-hover.mouse="
                  () => {
                    return {
                      start: (e) => {
                        e?.currentTarget?.classList.add('hovered');
                      },
                      cancel: (e) => {
                        e?.currentTarget?.classList.remove('hovered');
                      },
                    };
                  }
                "
                v-longpress.touch="
                  () => {
                    return {
                      start: ({ el }) => {
                        el?.classList.add('hovered');
                      },
                      cancel: ({ el }) => {
                        el?.classList.remove('hovered');
                      },
                      click: () => {},
                    };
                  }
                "
              >
                {{ image?.content }}

                <slot name="info" :value="image" :index="j * props.columnNum + i + 1"></slot>
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>

    <div class="no-more" ref="bbox">{{ $t("creatorZone.components.galleryBase.noMore") }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Iimage } from "@/types";
import ImagePreview from "@/components/CreatorZone/ImagePreview/index.vue";

const _window = window;

const WIDTH = 200;

const router = useRouter();

const props = defineProps({
  columnNum: {
    type: Number,
    default: 4,
  },
  images: {
    type: Array<Iimage>,
    default: [],
  },
  onReachEnd: {
    type: Function,
    default: (value) => {},
  },
});

const bbox = ref(null);

const groups = ref<
  {
    images: Iimage[];
    height: number;
  }[]
>([]);

onMounted(() => {
  const observer = new IntersectionObserver((changes) => {
    for (let index = 0; index < changes.length; index++) {
      const changer = changes[index];

      if (changer.intersectionRatio > 0) {
        props.onReachEnd();
      }
    }
  });

  observer.observe(bbox.value);
});

watch(
  [() => props.images],
  async () => {
    groups.value = new Array(props.columnNum).fill(0).map(() => {
      return {
        height: 0,
        images: [],
      };
    });

    for (let index = 0; index < props.images.length; index++) {
      const groupHeights = groups.value.map((group) => group.height);
      const minGroupHeightIndex = groupHeights?.indexOf(Math.min(...groupHeights));

      const image = props.images[index];

      if (!image.width || !image.height) {
        const originalImage: HTMLImageElement = await new Promise((resolve) => {
          const _image = new Image();

          _image.onload = () => {
            resolve(_image);
          };

          _image.src = image.url;
        });

        image.width = originalImage.width;
        image.height = originalImage.height;
      }

      groups.value = groups.value?.map((group, index) => {
        if (index === minGroupHeightIndex) {
          return {
            ...group,
            height: group.height + (WIDTH / image.width) * image.height,
            images: [...group?.images, image],
          };
        }

        return group;
      });
    }
  },
  { immediate: true }
);
</script>

<style lang="less" scoped>
.gallery-base {
  width: 100%;
  height: 100%;

  .groups {
    display: flex;
    justify-content: space-between;

    .group {
      .image {
        width: 100%;
        position: relative;

        :deep(.image-init),
        :deep(.image-loading),
        :deep(.image-preview),
        :deep(.image-failed) {
          border-radius: 24px;
          overflow: hidden;
        }

        :deep(.image-preview) {
          width: 100%;
        }

        .mask {
          opacity: 0;
          position: absolute;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          // background: linear-gradient(180deg, rgba(0, 0, 0, 0) 60.04%, rgba(0, 0, 0, 0.65) 93.83%);
          background: rgba(0, 0, 0, 0.5);
          padding: 16px;
          border-radius: 24px;
          font-family: Rookery New;
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;

          &.hovered {
            opacity: 1;
          }
        }

        + .image {
          margin-top: 16px;
        }
      }
    }
  }

  .no-more {
    margin-top: 36px;
    font-family: Rookery New;
    font-size: 12px;
    font-weight: 400;
    color: #696969;
    line-height: 16px;
    display: flex;
    justify-content: center;
  }
}
</style>
