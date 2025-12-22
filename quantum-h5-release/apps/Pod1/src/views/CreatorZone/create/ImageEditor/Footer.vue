<template>
  <div class="footer" ref="footerRef">
    <div
      class="prev"
      v-if="currentImage?.index > 0"
      v-hover.mouse="
        () => {
          return {
            start: (e) => {
              e.target.classList.add('hovered')
            },
            cancel: (e) => {
              e.target.classList.remove('hovered')
            },
          }
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

    <div class="images">
      <el-scrollbar
        ref="scrollBarRef"
        @touchmove.stop
        @scroll="
          ({ scrollLeft }) => {
            translateX = scrollLeft
          }
        "
      >
        <div class="images__inner">
          <template v-for="(image, index) in images">
            <div
              :class="{
                active: image.active,
              }"
              :style="{
                'aspect-ratio': `${image.width} / ${image.height}`,
              }"
              v-helper="
                () => {
                  return {
                    role: 'button',
                    ariaLabel: $t('creatorZone.create.imageEditor.selectImage'),
                    focus: () => {},
                    blur: () => {},
                    click: () => {
                      setImages(index);
                    },
                  };
                }
              "
            >
              <ImagePreview :src="image.url" :loading="true" />
            </div>
          </template>
        </div>
      </el-scrollbar>
    </div>

    <div
      class="next"
      v-if="currentImage?.index < images.length - 1"
      v-hover.mouse="
        () => {
          return {
            start: (e) => {
              e.target.classList.add('hovered')
            },
            cancel: (e) => {
              e.target.classList.remove('hovered')
            },
          }
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
  </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, ref, watch, Ref } from 'vue'
import {
  SESSION_RECORD_SOURCE,
  IMAGE_STATUS,
  REFERENCEIMAGE_TYPE,
  OPERATE_TYPE,
  IsessionRecord,
  IcreateRef,
} from '@/types'
import ImagePreview from '@/components/CreatorZone/ImagePreview/index.vue'

const { images, currentImage, setImages: _setImages } = inject<IcreateRef>('CREATE_REF')

const footerRef = ref(null)

const scrollBarRef = ref(null)
const translateX = ref(0)

const setImages = (i) => {
  const imgs = images.value.map((image, index) => {
    return {
      ...image,
      active: index === i,
    }
  })

  _setImages(imgs)

  setTranslateX(i)
}

const setTranslateX = (i) => {
  if (i === undefined) {
    return
  }

  const { left, right } = footerRef.value.querySelector('.images').getBoundingClientRect()
  const { left: left2, right: right2 } = footerRef.value
    .querySelector(`.images .images__inner div:nth-child(${i + 1})`)
    .getBoundingClientRect()

  if (left2 < left) {
    translateX.value -= left - left2
  }

  if (right2 > right) {
    translateX.value += right2 - right
  }

  scrollBarRef.value?.setScrollLeft(translateX.value)
}

watch(
  [() => currentImage.value?.index],
  async () => {
    await nextTick()

    setTranslateX(currentImage.value?.index)
  },
  { immediate: true }
)
</script>

<style lang="less" scoped>
.footer {
  width: 100%;
  position: relative;

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

  .images {
    width: 100%;

    &__inner {
      width: fit-content;
      margin: 0 auto;
      display: flex;

      > div {
        height: 46px;
        border-radius: 8px;
        overflow: hidden;
        opacity: 0.38;
        cursor: pointer;

        + div {
          margin-left: 8px;
        }

        &.active {
          opacity: 1;
        }

        :deep(.image-preview) {
          width: 100%;
          height: 100%;
        }

        :deep(.image-loading),
        :deep(.image-failed) {
          > div {
            width: 36px;
            height: 26px;
          }
        }
      }
    }
  }
}
</style>
